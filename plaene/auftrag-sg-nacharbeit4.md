# Auftrag SG Nacharbeit 4 (30.09.2026, klein, blockierend)

Grundlage: eigene Diffprüfung von `b50658e` (Block 14 in `test_feature_semgrep_hinweis.js`). Einordnung: Standard.

**Befund (blockierend):** Der Baumlauf liest JEDE Datei unter der Repo-Wurzel ausser `node_modules`/`.git` per
`readFileSync`. Dieselbe Suite läuft auf dem Live-Server als Deploy-Gate (CLAUDE.md, Prüfstand-Regeln), und dort liegen
im Anwendungsbaum die Laufzeitdaten (`.gitignore`: `pdf/`, `pdf_archiv/`, `belehrungen-uploads/`, `lageplan-uploads/`,
`uploads/`, `backups/`, `offboarding/`, `Dokumente/` …): signierte PDFs, Backups, Exporte. Der Test würde sie alle in
den Speicher lesen — Kundendaten, womöglich Gigabytes, Zeitlimit des Gates.

**Behebung:**
- Der Lauf betritt keine Laufzeitdaten-Verzeichnisse und liest nur Dateien, die etwas einbinden oder ausführen können
  (`.js`, `.cjs`, `.mjs`, `.json`, `.yml`, `.yaml`, `.sh`, dazu `.semgrepignore`). Die Ausschlussliste kommt NICHT als
  zweite Kopie in den Test: entweder aus `.gitignore` gelesen (Verzeichniseinträge der Wurzel; Positivkontrolle: u. a.
  `Dokumente/`, `backups/`, `uploads/` müssen darin erkannt werden) oder über den gemeinsamen Helfer
  `test/helfer/quelltext-scan.js` mit seinem Erfassungsbereich plus Wurzeldateien plus `.github/` — was sauberer passt,
  mit Begründung im Kopf des Blocks.
- Gegenprobe: im Wegwerfbaum ein Verzeichnis `Dokumente/` mit einer Datei, die `semgrep-probe` enthält, und eine
  grosse Binärdatei — der Test darf sie weder lesen noch melden (Zähler der gelesenen Dateien ohne sie); ein `require`
  der Probe in `core/` bleibt ROT. Die Sentinel-Positivkontrolle bleibt.
- Laufzeit des Blocks vorher/nachher im Bericht.

Danach: volle Suite + Dateizahl-Ritual + `npx eslint .`, wörtlich. Commit und Push vor dem Suite-Lauf.

-- Ende des Auftrags --
