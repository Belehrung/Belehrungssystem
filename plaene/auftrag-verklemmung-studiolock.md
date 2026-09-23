# Bauauftrag: Verklemmungskreise um den Studio-Audit-Lock (Fassung 1)

**Zielrepo:** GymDocu, neuer Zweig ab master (nach dem Merge der Extrarunde).
**Betreiber-Vorgabe:** fehlerfreies System; Punkt aus der Sammelliste
„ausserhalb dieses Beitrags" (`plaene/offene-befunde-ladebestand.md`) und CLAUDE.md
„Transaktionen und Sperren".
**Modellwahl:** vor dem Auftrag entschieden — Standard-Executer; die Lock-Inventur und die
Entscheidung trifft dieses Papier, der Bau ist eine Umstellung plus Nebenläufigkeitsprobe.
**Nach SUCHMUSTER arbeiten, nicht nach Zeilennummer** (Zeilen = Stand `e2a9e9e`).

## Die Sperren

* **L** — `pg_advisory_xact_lock(studioId)` in `auditAppend()` (`core/integritaet.js:65`),
  in der Transaktion des Aufrufers, bis zum Commit gehalten, innerhalb derselben
  Transaktion wiedereintrittsfähig.
* **S1** — `seilkontrolle:<studio>:<tag>` (Tagescheck).
* **N** — `nachtrag:<studio>:seilkontrolle`.
* **Zeilensperren** auf `geraete_sperren` durch `UPDATE`.

## Gemessene bzw. am Code abgelesene Reihenfolgen (routes/module.js)

| Weg | Suchmuster | Reihenfolge |
|---|---|---|
| **A** Tagescheck Seilkontrolle | `seilkontrolle:${req.studioId}:${heute}` | S1 → INSERT Sitzung → **L** (auditAppend) → **N** → `nachtragUebernehmen` (UPDATE `geraete_sperren` → L wiederholt) → weitere Sperren-INSERT/UPDATE |
| **B** eigenständiger Nachtrag | zweites Vorkommen von `nachtrag:${req.studioId}:seilkontrolle` | **N** → `nachtragUebernehmen`: **Zeile** (`UPDATE geraete_sperren … nutzung_entscheidung IS NULL`) → **L** |
| **C** Freigabe | `await t.run('SELECT pg_advisory_xact_lock($1)', [studioId]);` vor `UPDATE geraete_sperren SET aktiv = 0` | **L** → **Zeile** → L wiederholt |

## Kreise

1. **A–B (bekannt, gemessen 15.09.2026):** A hält L und will N, B hält N und will L.
2. **B–C (FUNDORT, noch zu messen):** B hält die Zeile einer Seil-Sperre und will L, C hält L
   und will dieselbe Zeile (`typ='seilkontrolle' AND aktiv=1`, B filtert zusätzlich auf
   `nutzung_entscheidung IS NULL` — dieselbe Zeile ist erreichbar, solange die Entscheidung
   offen ist).

## Behebung (Vorschlag)

**B nimmt L als ERSTE Sperre** — `SELECT pg_advisory_xact_lock($1)` mit der Studio-ID vor N.
Dann gilt auf allen drei Wegen: L vor N und L vor Zeile. Das löst beide Kreise.
Verworfen: N in A vor L ziehen — löst A–B, lässt B–C offen.
Verworfen: den Nachtrag in A in eine eigene Transaktion trennen — ändert die Atomarität von
Unterschrift und Nachtrag.

Begründung als Kommentar an die neue Zeile, mit den Suchmustern der Gegenwege (A und C);
sonst räumt sie jemand als „doppelt" weg.

## Inventur (Teil des Auftrags, VOR dem Bau)

Jede Transaktion im Repo, die (a) `auditAppend(…, t)` ruft UND (b) vorher eine andere Sperre
nimmt (Advisory oder Zeile), mit ihrer Reihenfolge in eine Tabelle. Jeder Kreis mit L wird
benannt. Kreise ausserhalb von A/B/C werden NICHT stillschweigend mitgebaut, sondern gemeldet.
Fundorte für die Inventur: `routes/sichtpruefung.js` (dort laufen Check und Nachtrag in
GETRENNTEN Transaktionen — nachsehen, ob das überall gilt), `routes/wartung.js`,
`routes/admin/ausmusterung.js`, `routes/belehrungen.js`, `routes/admin/geraete.js`.

## Nachweis

* **Deterministische Nebenläufigkeitsprobe über die ECHTEN Routen** (Wegwerf-DB, zwei
  Verbindungen, keine Zeitschwellen): B wird nach seiner ersten Sperre angehalten (Tor über
  eine Hülle um `db.tx`/`t.run`), A läuft los, bis A laut `pg_locks` (`granted = false`) auf
  eine von B gehaltene Sperre wartet — das ist der Beleg der Überschneidung —, dann läuft B
  weiter. Zusicherung: beide Anfragen erfolgreich (Sitzung und Nachtrag in der DB), kein
  `40P01`.
  **Gegenprobe:** die neue Zeile entfernen → `deadlock detected` (40P01) in einer der beiden.
* **Dasselbe für B–C**, falls der Kreis sich bestätigt. Zuerst OHNE Behebung messen, ob er
  existiert; die Messung gehört in den Bericht, egal wie sie ausgeht.
* Volle Suite, Dateizahl-Ritual, Lint, Marker-Scan 6.

## Offene Fragen an die Planprüfung

1. Welchen ZUSTAND erzeugt die Behebung, den es heute nicht gibt?
2. Was wird durch sie SCHLECHTER (Durchsatz, Wartezeiten, neue Reihenfolgen)?
3. Welche Transaktion nimmt L NACH einer Sperre, die ein anderer Weg VOR L nimmt?
