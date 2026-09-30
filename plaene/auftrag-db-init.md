# Auftrag DB-INIT — Startsperren von `db.init()` (30.09.2026, Fassung 1)

Baum `/workspace/gymdocu-dbinit` neu von `origin/master` (`deddcd9`), Zweig `fix-db-init-sperren`. Einzeltests nur gegen
eigene DBs `gymdocu_dbinit_*_test`. Einordnung: **sehr komplex** — Architektur über den Auftrag hinaus (Startverhalten
jedes Prozesses, Ladeprobe 5/8 gegen die Produktions-DB) und ein übersprungenes Schema kann falsch grün aussehen.

## Befund (vorbestehend, gemessen)

`core/db.js` `init()` führt bei JEDEM Start `pool.query(SCHEMA)` aus — ein Mehrfach-Statement (implizite Transaktion) mit
66 `CREATE TABLE IF NOT EXISTS`, 46 `ALTER TABLE … ADD COLUMN IF NOT EXISTS`, 91 `CREATE [UNIQUE] INDEX IF NOT EXISTS`,
10 weiteren `ALTER`/`DROP`. Gemessen in C1 Runde 3 (`plaene/diffpruefung-c1.md` „DB-INIT-SPERREN“, Skripte
`scratchpad/c1r3cc/{sperre3.js,zweiinit3.sh}`): `ADD COLUMN IF NOT EXISTS` nimmt die exklusive Sperre auch ohne Arbeit;
mit einem gleichzeitigen `INSERT unterschriften` entsteht ein Kreis, master 3/3 `deadlock detected` — teils ist der
INSERT das Opfer (eine Unterschrift geht verloren), teils `db.init()` (Exit 1). Leser/Schreiber warten ~4 s hinter einem
Leser (Warteschlange hinter der exklusiven Anforderung). Trifft jeden Neustart (pm2 reload bei laufendem Betrieb) und die
Ladeprobe 5/8. Dazu C3b-6 und C3a-E3 (`diffpruefung-c3b.md`, `diffpruefung-c3a.md`).

## Ziel

Ein Start gegen eine Datenbank, deren Schema dem Code entspricht, nimmt KEINE Relationssperre stärker als
`AccessShareLock`. Nur ein Start mit geändertem Schema (Deploy mit neuer DDL) darf DDL-Sperren nehmen — begrenzt und
wiederholbar.

## Weg (Vorschlag — Abweichung mit Begründung und Messung erlaubt)

1. **Schema-Stand:** Tabelle `schema_stand` (eine Zeile, `sha256`, `gesetzt_am`). `init()` bildet `sha256(SCHEMA)` (der
   fertig interpolierte Text). In einer eigenen Verbindung: `BEGIN`, `pg_advisory_xact_lock(<fester Schlüssel>)`, Stand
   lesen; gleich → `COMMIT`, SCHEMA übersprungen; sonst SCHEMA in DERSELBEN Transaktion, Stand schreiben, `COMMIT`.
   Vorher messen, dass `CREATE TABLE IF NOT EXISTS schema_stand` auf bestehender Tabelle keine Sperre auf ANDERE
   Relationen nimmt und selbst schwach bleibt (sonst Existenz über `to_regclass` prüfen).
2. **Der geänderte Fall:** `SET LOCAL lock_timeout` (Wert herleiten und begründen, nicht setzen) und Wiederholung bei
   `55P03`/`40P01` (Anzahl, Abstand begründen); nach der letzten Wiederholung laut scheitern. Messen, wer bei einem Kreis
   mit einem gleichzeitigen `INSERT unterschriften` das Opfer wird — Ziel: nie der INSERT. Geht das nicht zuverlässig,
   den Rest-Kreis beziffern und benennen.
3. **Erzwingen:** `GYMDOCU_SCHEMA_ERZWINGEN=1` fährt SCHEMA unabhängig vom Stand (Reparatur); in `ops/` dokumentieren.
4. **Rest von `init()`:** `sicherstelleUnterschriftenNeuesteObjekte()`, FK-Härtung, `resyncSequences()` usw. — messen,
   welche Sperren sie auf einer aktuellen DB nehmen (pg_locks während des Laufs, oder `log_lock_waits`); was stärker als
   `AccessShareLock` ist, ebenso nur bei Bedarf ausführen (Katalogprüfung vorher) oder mit Messung begründen.

## Zustandsfragen (für Plan und Bericht)

- Welcher Zustand entsteht, den es vorher nicht gab: eine DB, deren Schema vom Code abweicht, obwohl der Stand passt
  (Handeingriff, halb zurückgespieltes Backup, Migration, die ein SCHEMA-Objekt ändert)? Wie fällt das auf?
- Welche Tests setzen voraus, dass `init()` jedes Mal das ganze SCHEMA fährt (z. B. Spalte löschen, `init()`, Spalte
  wieder da)? Liste; jeder bleibt mit gleicher Aussagekraft grün (Stand zurücksetzen oder Erzwingen) — keiner wird
  aufgeweicht.
- `server.js` ruft `runMigrations()` nach `init()`; `ops/boot-smoke.js` nur `init()`. Ändert sich an einem der beiden
  Wege, was wann läuft?

## Tests und Messung

- Sperrmessung vorher/nachher (gleiche Skripte): Start gegen aktuelle DB → keine Sperre > AccessShare (Liste aus
  pg_locks, literal); Kreisprobe `zweiinit3.sh`/`sperre3.js` vorher 3/3, nachher 0/N im Normalfall; geänderter Fall
  mit Opferangabe.
- Zusicherungen: Stand gleich → SCHEMA nicht ausgeführt (ein Beleg von aussen, z. B. `pg_stat_statements` nicht nötig —
  eine absichtlich gelöschte Spalte bleibt gelöscht, Positivkontrolle mit Erzwingen/anderem Stand kommt zurück);
  Stand abweichend → SCHEMA läuft und Stand wird geschrieben; zwei gleichzeitige `init()` mit abweichendem Stand →
  beide fertig, SCHEMA genau einmal wirksam. Gegenprobe je Riegel ROT/GRÜN.
- Volle Suite (Aufruf laut CLAUDE.md, Dateizahl-Ritual), `npx eslint .`, neue Testdatei in `test/run.sh`.

-- Ende des Auftrags --
