# Offene Befunde C5-E (für die Extrarunde C6)

- **T1-K4 (aus C5-E1, nicht geschlossen):** Ein Einzelaufruf ohne `test/umgebung.sh` legt beim `require('./routes/belehrungen')` das Verzeichnis `<repo>/einweisung-nachweise/` an. Gemessen hat das der C5-E1-Bauer. Die volle Suite deckt `test_feature_run_sh_wegwerf_variablen_static.js` ab (neun Wegwerf-Wurzeln); den Einzelaufruf deckt nichts.
- **qr_block-Kindprozess (aus C5-E1 N1):** `test_feature_qr_block.js` startet `node server.js` als Kind mit `...process.env`. Auf dem Live-Server erbt das Kind echte `GYMDOCU_TG_*`; Schutz ist dort nur die Netz-Sperre über NODE_OPTIONS. Die Versand-Sperre nennt das im Kopf als Grenze. Behebung: dem Kind die TG-Variablen nicht mitgeben oder sie auf Attrappen setzen.
- **C5-E2 nicht angefasst, weil sich die Dateien mit E1 überschneiden.** Erst nach dem Merge von E1 nachziehen:
  - Nr. 19 V13-2 (`test_feature_keine_systemeingriffe.js`, präzise Kommentare je Ausnahme);
  - Nr. 48 V23-6 (`test_feature_rechtsaussagen.js:155-158`, die `[A-Za-z]`-Alternative schützt jeden Punkt nach einem Einzelbuchstaben);
  - Nr. 52 V25-6 (`test_feature_session.js:162-164`, try/finally mit bedingtem RENAME).
- **C5-E2, Hinweise des Bauenden:**
  - `routes/wartung.js:345`, `:351-357`: dieselbe falsche Formulierung „Mitternacht in der Prozesszone“ wie V27-3.
  - Rund 40 Testdateien lesen relativ zum Arbeitsverzeichnis (Klasse V26-4).
  - In `test_feature_nachweis_waisen.js` stehen weitere Abfragen nur über die ID (Z. 250, 301, 308, 326-328, 336, 362, 363).
  - Bei V24-4 sind die gii-xml-Paare nicht abgedeckt.

## Aus C5-E3 (01.10.2026)

- **E3-a:** `test/e2e-durchlauf.js` ist schon auf `baaf698` rot (17 ✓, 5 ✗, danach TypeError). Die Datei ist nicht in `test/run.sh`, die Ursache ist nicht untersucht.
- **E3-b:** `test_feature_audit_batch3.js`, `test_feature_qr_charge.js` und `test_feature_bodyparser_und_sequenz.js` laufen nur gegen die fest verdrahtete `gymdocu_test`. Einzeln mit eigener DB lassen sie sich nicht prüfen.
- **E3-c (E-5):** Die Tabellen-Zusicherung in `test_feature_session.js` prüft nur den Normalfall. Den Wurf-Pfad belegt nur die Mutation des Bauenden.
- **E3-d (E-6):** Die Anker in `test_feature_kind_umgebung.js`, Teil 2/3, prüfen nur, ob der Helfer aufgerufen wird, nicht ob er wirkt. Mit dem systemischen Export in `test/umgebung.sh` ist das entschärft.
- **E3-e (Ergänzung zu E3-b):** Fest auf `gymdocu_test` verdrahtet und deshalb nicht einzeln mit eigener DB prüfbar sind außerdem:
  - deprovision_route_queue, schluessel_rotation, migrations
  - db_tx_commit_ungewiss, db_pool_timeout
  - pdf_jobs, pdf_jobs_korrektur
  - storage_replica, storage_replica_loeschauftrag, migration_0060_loeschauftrag
  - korrekturen, korrektur_dokumente
  - getraenke_race, pdf_crlf_saeuberung

  Dazu kommen Folgefehler in geraete_alter und qr_token.
