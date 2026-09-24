# Planprüfung C1 — V01-1, V09-1, V15-2 (24.09.2026)

Spur A: DeepSeek mit Repo (26 Runden, 3,00 $ geschätzt). Spur B: Kimi mit Bündel (neu gestartet nach Container-Neustart).

| Nr. | Spur | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| PC1-1 | A | V15-2: `routes/archiv.js:187-203` leitet die Gültigkeit zeilenweise ab (`u.gueltig_bis IS NULL OR >= $2`) — fehlt in der Fundortliste, der MAX-Wächter sieht es nicht | gelesen `archiv.js:187-195` | Fundort aufnehmen; Wächter erfasst jede Gültigkeitsableitung aus `unterschriften` (nicht nur MAX) |
| PC1-2 | A | V01-1: zwei weitere Suite-Dateien sichern den S20-Inhalt statisch zu (`test_feature_audit2_batchA_static.js`, `test_feature_pin_generation_static.js`) | gelesen (`batchA_static.js:25-26, 121-130`) | fachlich umstellen: sie sichern die Stilllegung zu, nicht mehr den toten Code |
| PC1-3 | A | V09-1: Restlücke — kaputte höchste Zeile mit Restore-Punkt ÜBER dem lesbaren Maximum (`dbMax ≥ journal.hoechste`) vergibt weiter doppelt | Logik nachvollzogen | benannte Grenze; dem Betreiber melden (einzig wasserdicht wäre fail-closed bei jeder kaputten Zeile — ausdrücklich abgelehnt) |
| PC1-4 | A | `ORDER BY datum DESC` sortiert NULL zuerst | PostgreSQL-Semantik | `NULLS LAST`, Test mit `datum NULL` |
| PC1-5 | A | „Mail“ als Fundort gibt es nicht | Suche | aus dem Papier streichen |
| PC1-6 | A | NULL-Semantik Tablet (`nochNie`) gegen Dashboard (erledigt) widerspricht sich | gelesen | zentrale Definition liefert nur die Zeile; Fundorte behalten ihr NULL-Verhalten; Tabelle vorher |
| PC1-7 | A | golive nicht ausführbar im Test; „keine DB-Verbindung“ nur mit ungültiger URL rotfähig | Logik | S20-Spawn mit ungültiger URL; golive statisch |
| PC1-8 | A | Sicht: `CREATE OR REPLACE VIEW`, Spiegel in `core/db.js`, `studio_id` je Konsument | Hausmuster | übernommen |
| PC1-9 | A | Vorfall `journal_kaputte_zeilen` muss VOR dem neuen Wurf bleiben | gelesen `qr-token.js:407-411` | übernommen |
