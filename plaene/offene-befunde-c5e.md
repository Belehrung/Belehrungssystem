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
