# Auftrag DB-INIT — Startsperren von `db.init()` (30.09.2026, Fassung 3 nach Planprüfung `scratchpad/dbinitp/antwort-{a,b}.txt` und Runde 2 `antwort2.txt`)

Baum `/workspace/gymdocu-dbinit` neu von `origin/master` (`deddcd9`), Zweig `fix-db-init-sperren`. Einzeltests nur gegen
eigene DBs `gymdocu_dbinit_*_test`. Einordnung: **sehr komplex** — Architektur über den Auftrag hinaus (Startverhalten
jedes Prozesses, Ladeprobe 5/8 gegen die Produktions-DB) und ein übersprungenes Schema kann falsch grün aussehen.

## Befund (vorbestehend, gemessen)

`core/db.js` `init()` führt bei JEDEM Start `pool.query(SCHEMA)` aus — ein Mehrfach-Statement (implizite Transaktion) mit
64 `CREATE TABLE IF NOT EXISTS`, 43 `ALTER TABLE … ADD COLUMN IF NOT EXISTS`, rund 90 `CREATE [UNIQUE] INDEX IF NOT
EXISTS` (Zählung Planprüfung B). AUSSERHALB von SCHEMA läuft ebenfalls bei jedem Start: `ADD COLUMN IF NOT EXISTS
aufbewahrung_hold` auf 15 Tabellen inkl. `unterschriften` (`core/db.js:2799-2808`), zwei `mitarbeiter`-ALTERs
(`:2813-2816`), FK-Härtung (`:2741-2768`), `resyncSequences()` mit `setval` je Sequenz (`:2405-2426`). Gemessen in C1 Runde 3 (`plaene/diffpruefung-c1.md` „DB-INIT-SPERREN“, Skripte
`scratchpad/c1r3cc/{sperre3.js,zweiinit3.sh}`): `ADD COLUMN IF NOT EXISTS` nimmt die exklusive Sperre auch ohne Arbeit;
mit einem gleichzeitigen `INSERT unterschriften` entsteht ein Kreis, master 3/3 `deadlock detected` — teils ist der
INSERT das Opfer (eine Unterschrift geht verloren), teils `db.init()` (Exit 1). Leser/Schreiber warten ~4 s hinter einem
Leser (Warteschlange hinter der exklusiven Anforderung). Trifft jeden Neustart (pm2 reload bei laufendem Betrieb) und die
Ladeprobe 5/8. Dazu C3b-6 und C3a-E3 (`diffpruefung-c3b.md`, `diffpruefung-c3a.md`).

## Ziel

Ein Start gegen eine Datenbank, deren Schema dem Code entspricht, nimmt KEINE Relationssperre stärker als
`AccessShareLock`. Nur ein Start mit geändertem Schema (Deploy mit neuer DDL) darf DDL-Sperren nehmen — begrenzt und
wiederholbar.

## Weg (verbindlich, Fassung 3; Abweichung nur mit Begründung und Messung)

0. **Umfang des Überspringens (Runde 2 F3, blockierend):** bedingt wird AUSSCHLIESSLICH `pool.query(SCHEMA)`. Alle
   übrigen Schritte von `init()` (Sicht/Index, FK-Härtung, Retention-/PIN-Spalten, Sequenzen, Invarianten) laufen
   JEDEN Start wie heute — kein frühes `return`. Zusicherung: Sicht von Hand verfälscht (Muster
   `test_feature_unterschriften_neueste.js:405-413`), Stand passt → der nächste `init()` repariert sie trotzdem.

1. **Schema-Stand.** Tabelle `schema_stand` (`id SMALLINT PRIMARY KEY CHECK (id = 1)`, `sha256 TEXT NOT NULL`,
   `katalog TEXT`, `gesetzt_am TEXT NOT NULL DEFAULT (${TS_DEFAULT})` wie `schema_migrations`; global, kein `studio_id`,
   nicht in `RETENTION_TABELLEN`). `init()`: eigene Verbindung, `BEGIN`, `SET LOCAL lock_timeout`, dann
   `pg_advisory_xact_lock(hashtext('gymdocu:schema-migrations'))` — DERSELBE Schlüssel wie `core/migrate.js:8` und
   `SCHEMA_LOCK_SQL` (`core/db.js:2538`; Konstante wiederverwenden, kein neuer Eintrag im Lock-Inventar
   `test_feature_geistersperre_nachtrag_rennen.js`). ERST unter dem Lock `to_regclass('schema_stand')`; fehlt sie,
   `CREATE TABLE` (gemessene Duplikat-Klasse `core/db.js:2527-2530`). Übersprungen wird NUR bei POSITIV gelesener
   Gleichheit von `sha256(SCHEMA)` UND Katalog-Fingerabdruck (Punkt 2); jeder Lese-/Schreibfehler, leere oder
   mehrzeilige Tabelle → SCHEMA läuft bzw. der Start scheitert laut — nie „gleich“. SCHEMA und das Schreiben des Stands
   in DERSELBEN Transaktion. Kein `try/catch`, das in `console.warn` endet.
2. **Reparaturfähigkeit erhalten (Planprüfung A B5, B 1).** Ohne Weiteres heilt ein Start nach Handeingriff nichts
   mehr; der monatliche Drift-Cron sieht nur Tabellen, Spalten und Index-NAMEN (`ops/gymdocu-schema-drift.js:82-130`),
   keine Defaults, Constraints oder Sichten. Deshalb: ein Katalog-Fingerabdruck (sha256 über die
   geordneten Tabellen/Spalten/Typen/Defaults/Indizes/Constraints des Schemas `public` aus `pg_catalog`, nur
   AccessShare auf Katalogen) wird am ENDE von `init()` gespeichert (nur wenn geändert, unter demselben Lock) und am
   Anfang verglichen; weicht er ab, läuft SCHEMA (Reparatur). Bildung (Runde 2 Frage 1): geordnet nach qualifizierten
   NAMEN, keine OIDs, keine Statistik (`pg_stats`), keine Sequenzstände (nur `pg_sequence`-Parameter und Default-Text
   via `pg_get_expr`), Indizes/Constraints über `pg_get_indexdef`/`pg_get_constraintdef`; AUSGENOMMEN `session`
   (legt connect-pg-simple zur Laufzeit an, `server.js:161`; dieselbe Weissliste wie `ops/gymdocu-schema-drift.js:73`
   — EIN Ort: die Liste lebt in `core/`, das Drift-Werkzeug importiert sie) und `schema_stand` selbst.
   Migrationen: den Fingerabdruck am Ende von `runMigrations()` (`core/migrate.js`) erneuern, damit der von der
   Ladeprobe 5/8 geschriebene Stand nach dem Reload nicht einen DDL-Nachzügler beim NÄCHSTEN Start auslöst (Runde 2 F2,
   Variante A). Messen: Anzahl SCHEMA-Läufe je Deploy mit und ohne Migration (Soll 0–1, keiner ausserhalb des Deploys).
   Lässt sich der Fingerabdruck nicht stabil bilden, abbrechen und melden statt abschwächen.
3. **Der geänderte Fall.** `lock_timeout` für den SCHEMA-Lauf herleiten (Bezug `deadlock_timeout`, Standard 1 s:
   liegt er darunter, bricht der SCHEMA-Lauf vor der Kreiserkennung ab); Wiederholung als GANZE Transaktion samt
   Lock-Akquise bei `55P03`/`40P01` (Anzahl/Abstand begründen); danach laut scheitern. „Nie der INSERT“ ist nicht
   beweisbar — messen und beziffern, wie oft der INSERT das Opfer wird (vorher/nachher, gleiche Probe).
4. **Rest von `init()` — ausdrücklich im Umfang:** die Retention- und PIN-ALTERs (`core/db.js:2799-2816`) nur bei
   fehlender Spalte (Katalogprüfung, Muster `idxPasstGenau` `:2653-2659`), `KRITISCHE_INVARIANTEN` (`:2822-2836`)
   unverändert als lauter Rückhalt; FK-Härtung prüft bereits `pg_constraint` — messen, dass sie im Normalfall nichts
   sperrt; `resyncSequences()` datengetrieben: `setval` nur, wenn der Zielwert über dem aktuellen Stand liegt
   (Katalogprüfung ist hier der FALSCHE Bedarfsbegriff, Planprüfung A B8) — „aktueller Stand“ mit der
   `is_called`-Semantik von `core/db.js:2386-2397` (nächster `nextval()`-Wert, nicht `last_value`; sonst `setval` bei
   jeder gesunden Sequenz); `test_feature_sequence_heilung.js` behält seine Aussage. `schema_stand` schreiben per
   `INSERT … ON CONFLICT (id) DO UPDATE`. Sicht/Index-Absicherung (`sicherstelleUnterschriftenNeuesteObjekte`) repariert weiter auch eine
   vorhandene, aber abweichende Sicht (`test_feature_unterschriften_neueste.js:393-413`) — nicht auf „existiert“ kürzen.
5. **Erzwingen:** `GYMDOCU_SCHEMA_ERZWINGEN=1` fährt SCHEMA unabhängig vom Stand; Doku in `ops/` mit Verweis auf
   `ops/gymdocu-schema-drift.js` (Erkennung) und Punkt 2. `ops/boot-smoke.js` gibt aus, ob SCHEMA gefahren oder
   übersprungen wurde (und warum); Kommentare `ops/boot-smoke.js:88-92` und der Rückroll-Absatz `ops/deploy.sh:343-352`
   nennen die `schema_stand`-Zeile (die Ladeprobe 5/8 schreibt sie gegen die Produktions-DB, vor dem Reload).

## Zustandsfragen (für Plan und Bericht)

- Welcher Zustand entsteht, den es vorher nicht gab: eine DB, deren Schema vom Code abweicht, obwohl der Stand passt
  (Handeingriff, halb zurückgespieltes Backup, Migration, die ein SCHEMA-Objekt ändert)? Wie fällt das auf?
- Welche Tests setzen voraus, dass `init()` jedes Mal das ganze SCHEMA fährt (z. B. Spalte löschen, `init()`, Spalte
  wieder da)? Liste; jeder bleibt mit gleicher Aussagekraft grün (Stand zurücksetzen oder Erzwingen) — keiner wird
  aufgeweicht.
- `server.js` ruft `runMigrations()` nach `init()`; `ops/boot-smoke.js` nur `init()`. Ändert sich an einem der beiden
  Wege, was wann läuft?

## Tests und Messung

- **Sperren:** Start gegen aktuelle DB → Liste aller Relationssperren aus `pg_locks` literal (Tabellen UND Sequenzen
  UND `schema_stand`); Soll: nichts über AccessShare auf Anwendungstabellen. Kreisprobe (`scratchpad/c1r3cc/`
  `sperre3.js`, `zweiinit3.sh` — vorher gegen master messen, muss den Kreis zeigen) vorher/nachher, Normalfall und
  geänderter Fall, mit Opferverteilung.
- **Übersprungen/Repariert** (Beweisspalte SCHEMA-eigen, z. B. `mitarbeiter.pin_generation`, `core/db.js:727` —
  nicht in Retention/PIN-ALTERs/Invarianten). Zusicherungen daher: (i) Stand + Fingerabdruck gleich → SCHEMA läuft
  nicht — unabhängiger Zeuge ist die `pg_locks`-Messung (keine Sperre > AccessShare auf Anwendungstabellen/Sequenzen
  während des Starts); ein Zähler `laeufe` nur als Nebenzeuge (er stammt aus dem Prüfling); Gegenprobe ausdrücklich
  „SCHEMA läuft immer, Zähler nur im Überspringen-Zweig erhöht“ → ROT; (ii) Spalte
  gelöscht → nächster Start repariert (Fingerabdruck); (iii) verfälschter `sha256` → SCHEMA läuft, Stand korrigiert
  (erreicht den Vergleichszweig — `ERZWINGEN` tut das nicht); (iv) zwei gleichzeitige `init()` bei abweichendem Stand →
  beide fertig, Zähler zeigt genau EINEN SCHEMA-Lauf. Vorbedingungen je Probe mitprüfen („Spalte war wirklich weg“).
- **Bestehende Tests** (Liste im Bericht, je Datei begründet, keiner aufgeweicht): mindestens
  `test_feature_brandschutz.js:535-604` (heute: Spalten weg → `init()` heilt; muss über Fingerabdruck weiter heilen,
  sonst ROT) und `test_feature_start_bestandsdatenbank.js:313-357` (heute NICHT falsch grün — der Pivot 0064 ist auch
  SCHEMA-Spalte, der Fingerabdruck weicht nach dem DROP ab; es fehlt aber die Vorbedingung „Spalte existiert VOR dem
  DROP“, `:326-331` prüft nur die Abwesenheit danach — ergänzen, Runde 2 F5). Dazu alle Tests, die `init()` nach einem
  Schema-Eingriff rufen (Suche, Liste); `test_deprovision.js:64` darf keine neuen `console.warn`-Zeilen sehen.
- Gegenprobe je Riegel ROT/GRÜN (Vergleich immer „gleich“; Fingerabdruck nicht verglichen; Lock entfernt; Stand-
  Lesefehler als „gleich“; Retention-ALTER wieder unbedingt). Volle Suite (Aufruf laut CLAUDE.md, Dateizahl-Ritual),
  `npx eslint .`, neue Testdatei in `test/run.sh`.

-- Ende des Auftrags --
