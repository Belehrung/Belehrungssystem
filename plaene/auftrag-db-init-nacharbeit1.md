# Auftrag DB-INIT Nacharbeit 1 (30.09.2026)

Baum `/workspace/gymdocu-dbinit`, Zweig `fix-db-init-sperren`, Kopf `7c9db50`. Grundlage: Diffprüfung Runde 1 —
Lesespur `scratchpad/dbinitr1/antwort-lese.txt` (B1–B6), ausführende Spur `scratchpad/dbinitr1/cc/befunde.md` (N1–N9,
XA, XG, N4c, Z1–Z3; Sonden `kreis2.js`, `probe_n4.js` daneben). Einordnung: Standard — Zusicherungen zu gemessenen
Überlebenden, dazu kleine Text-/Katalogänderungen. Planprüfung entfällt: jeder Punkt ist durch eine gemessene
überlebende Mutation oder einen am Quelltext nachgesehenen Befund festgelegt; die Gegenprobe steht je Punkt dabei.
Einzeltests nur gegen eigene DBs `gymdocu_dbinit_*_test`.

## 1. Zusicherungen (je: unmutiert GRÜN, genannte Mutation ROT, beides wörtlich)

- **N2/N3:** ein CHECK aus einem `DO $$`-Block (z. B. `geraete_inbetriebnahme_am_chk`) und ein UNIQUE-Index
  (`idx_mitarbeiter_studio_email`) von Hand gelöscht → nächster `init()` fährt SCHEMA („Katalog weicht …“) und beide sind
  wieder da. Mutationen: Constraints-Abfrage → `[]`; Indizes-Abfrage → `[]`.
- **N5 (`lock_timeout`):** deterministisch — innerhalb der Schema-Transaktion liefert `SHOW lock_timeout` den aus
  `deadlock_timeout` hergeleiteten Wert (Test-Zugang wählen, der in der PRODUKTIONSFORM läuft, z. B. exportiertes
  `mitSchemaTransaktion` mit einer Arbeit, die `SHOW` liest). Mutation `SET LOCAL lock_timeout` entfernt → ROT. Die
  Kreis-Sonde `kreis2.js` (0 Verluste unmutiert, 3/3 ohne lock_timeout) läuft als Beleg im Bericht, NICHT in der Suite.
- **N6/XA (Wiederholung, ROLLBACK):** eine zweite Verbindung hält den Advisory-Lock `hashtext('gymdocu:schema-migrations')`
  rund 1,2 s → `init()` gelingt mit `versuche >= 2`. Mutationen: nur 40P01 wiederholen → ROT; `ROLLBACK` im Fehlerweg
  entfernt → ROT.
- **XG (Weissliste wirkt):** Tabelle `session` wie connect-pg-simple angelegt → Fingerabdruck unverändert; dieselbe als
  `sessionx` → verändert. Mutation `ausgenommen = []` → ROT.
- **N4b/N4c (Sequenz nie rückwärts):** Sequenz VOR `max(id)+1` (Zeilen gelöscht, `nextval` weiter) → `resyncSequences()`
  setzt NICHTS, der nächste INSERT bekommt keine gelöschte id. Mutationen `WHERE` entfernt, `<>` → ROT.
- **N8:** SCHEMA-eigene Spalte gelöscht, `runMigrations()` ohne ausstehende Migration → Stand unverändert, der nächste
  `init()` heilt. Mutation „immer erneuern“ → ROT.
- Test B `laeufe unverändert` (`:164`, Lesespur Frage 5): nach dem ROLLBACK des Inventars kann die Zusicherung nicht fallen
  — entfernen oder so umbauen, dass sie etwas misst (Begründung im Kommentar).

## 2. Kleine Produktänderungen

- **Z1:** scheitert die Schema-Transaktion nach dem letzten Versuch an 55P03/40P01, wird ein Fehler mit Kontext geworfen
  (Anzahl Versuche, Gesamtdauer, „Advisory-Lock gymdocu:schema-migrations oder Tabellensperre nicht erhalten — läuft ein
  Migrationslauf oder eine lange Transaktion?“), `code` und `cause` des PG-Fehlers bleiben erhalten. Test literal.
- **B3 (Fingerabdruck):** `pg_attribute.attcollation` (als Name), `pg_index.indisvalid`, der `OWNED BY`-Besitz der
  Sequenzen (`pg_depend`, Tabelle.Spalte) aufnehmen; die Ausnahmeliste auch auf die Sequenzabfrage anwenden. Je ein Test
  (Collation ändern, `OWNED BY NONE` → Fingerabdruck weicht ab). Messen und melden, ob das einen zusätzlichen SCHEMA-Lauf
  auf einer stationären DB auslöst (Soll: nein, ausser beim ersten Start mit dem neuen Code).
- **B1 (`ops/deploy.sh`):** Rückroll-Satz berichtigen — eine Fassung OHNE Schema-Stand kennt `schema_stand` nicht, fährt
  ihr SCHEMA bei jedem Start (mit den vollen Sperren) und lässt die Zeile stehen; eine Fassung MIT Schema-Stand fährt es
  einmal und schreibt den Stand zurück. Beide Fälle nennen.
- **B2 (`core/db.js` Kommentar vor den Retention-ALTERs):** auf den tatsächlichen Umfang von `KRITISCHE_INVARIANTEN`
  (4 Spalten) kürzen — NICHT die Invarianten auf alle 15 Tabellen ausweiten (auf einer frischen DB legt ein Teil der
  Tabellen erst eine Migration an; der Start würde dann abbrechen).
- **B5 (`ops/README.md`):** ein Satz: ein PG-Update, das Deparse-Texte ändert, löst genau einen SCHEMA-Lauf aus.
- **B6:** `core/db.js:1051-1056` Kommentar um „seit DB-INIT: bedingter SCHEMA-Lauf“ ergänzen (Migration 0061 NICHT
  anfassen, Prüfsummen).

## Bericht

Je Punkt Test/Datei:Zeile, Zahlen unmutiert/mutiert wörtlich; `kreis2.js`-Beleg; volle Suite (Aufruf laut CLAUDE.md,
Dateizahl-Ritual); `npx eslint .`; Marker-Scan; was nicht wie verlangt ging.

-- Ende des Auftrags --
