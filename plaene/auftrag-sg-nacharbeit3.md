# Auftrag SG Nacharbeit 3 (30.09.2026, klein)

Grundlage: Lesespur Runde 3 (`scratchpad/sgn2/antwort.txt`, F1–F5), selbst nachgemessen: F1, F2 tragen; F3 teilweise;
F4 durch „jede Regel trifft“ im Kontrolllauf weitgehend gedeckt (keine Änderung); F5 trägt nicht (die Sollzahlen
bewachen bewusst die Tabelle, das Verhalten prüft die Schleife je Fall). Baum `/workspace/gymdocu-sg`, Kopf `39e2bce`.
Einordnung: Standard. Planprüfung ausgelassen: drei benannte Korrekturen ohne neue Mechanik.

1. **F1:** Die Ausnahme gilt GENAU der Datei `ops/semgrep-probe/probe.js`, nicht dem Ordner.
   - Werkzeug: `PROBE_DATEI = 'ops/semgrep-probe/probe.js'` (exakter Vergleich) statt `PROBE_PRAEFIX`; jede andere Datei
     im Ordner ist eine gewöhnliche Datei.
   - Workflow: Diff-Lauf `--exclude` auf genau diese Datei. VORHER messen (Semgrep-venv `scratchpad/sg/venv`), dass
     `--exclude ops/semgrep-probe/probe.js` genau sie ausnimmt und eine zweite Datei im Ordner gescannt wird (beide
     Richtungen, wörtlich im Bericht). Kontrollziel bleibt die Probedatei bzw. der Ordner — was die Messung trägt.
   - Zusammenfassung ehrlich: „Probedatei geändert — vom Diff-Lauf ausgenommen; der Kontrolllauf hat an ihr alle sechs
     Regeln nachgewiesen: <Datei>“ (kein „geprüft“).
   - Statische Zusicherung: keine Datei ausser Workflow, Werkzeug, dessen Test, `.semgrepignore` und der Probedatei
     selbst nennt `semgrep-probe` (Liste über `git ls-files` im Test ist verboten — `fs.readdirSync`-Baum wie die
     übrigen Wächter; oder der bestehende gemeinsame Scan-Helfer, falls passend). Gegenprobe: ein `require` darauf in
     einer anderen Datei → ROT.
   - Tests: zweite Datei im Ordner geändert → gewöhnliche Datei (nicht gescannt → teilweise/NICHT GEPRÜFT wie jede
     andere), Namensvettern wie bisher. Gegenproben je neue Zusicherung.
2. **F2:** Kommentar `.github/workflows/semgrep-hinweis.yml:62-65` auf den neuen Stand.
3. **F3:** Begründung `ops/semgrep-hinweis.js:64-70` an den gemessenen Vorzustand anpassen (ohne Sonderbehandlung:
   Probedatei in `geaendert.txt`, aber nicht in `paths.scanned` → jeder Pflege-PR NICHT GEPRÜFT).

Volle Suite + Dateizahl-Ritual + `npx eslint .`, Bericht knapp. Commit und Push vor jedem langen Lauf.

-- Ende des Auftrags --
