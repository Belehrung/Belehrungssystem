# Planprüfung T1 — Test-PDF-Aufräumen

Papier: `plaene/auftrag-t1-test-pdf-aufraeumen.md` Fassung 1. Zwei Lesespuren mit verschiedenem Material:
D = DeepSeek mit Repo-Lesezugriff (20 Runden, 2,00 $ geschätzt); B = DeepSeek mit Bündel (Papier, `core/pdf-root.js`,
Env-Helfer, `run.sh`-Ausschnitt, der Wächter, Ausschnitte der betroffenen Tests). Kimi war vorgesehen, das Konto ist
wegen fehlenden Guthabens gesperrt (HTTP 429, `exceeded_current_quota_error`) — Betreiber-Punkt.
Selbst nachgesehen.

| Nr. | Befund | Spur | Nachgemessen | Folge für Fassung 2 |
|---|---|---|---|---|
| PT1-1 | Zählung falsch: 13+2+2+1 = 18, nicht 19; übersehen: `test_feature_mangel_nachtrag.js:537, 615`, `test_feature_geraete_defekte_erfassungsweg.js:210` | D, B | `grep` → 22 direkte Treffer in 7 Dateien (davon eine Fixtur-Zeile); dazu die Form über eine Zwischenvariable: `test_feature_verbandbuch_meldepflicht.js:98, 180` (`const abs = path.join(__dirname, pfad)`) — aus der Vollprüfung Bereich 26 | Umfang per Suche, nicht per Zahl |
| PT1-2 | `process.exit()` überspringt `finally` — das geplante Aufräumen liefe nie | B | JS-Semantik eindeutig | Aufräumen in `process.on('exit', …)` (synchron) |
| PT1-3 | Umleitung „vor dem require von pdf-engine“ ist zu spät, wenn vorher ein anderes Modul `core/pdf-root` lädt (`core/pdf-pfad.js:30` fixiert beim require) — Abschnitt 5 bliebe dann grün | D, B | gelesen `core/pdf-pfad.js:30`, zwei Dateien laden pdf-pfad vor pdf-engine | Umleitung vor dem ERSTEN projekteigenen `require`; Wächter prüft das |
| PT1-4 | 6 der 15 Dateien haben die Umleitung schon | D | gelesen | nur Lage prüfen, keine zweite Umleitung |
| PT1-5 | `test_feature_security_minis.js` erzeugt keine PDFs | D | gelesen | eigene Liste „ohne Dateizugriff“ mit Begründung |
| PT1-6 | Neuer statischer Wächter: falsche Meldungen (`test_feature_pdf_root_lesezugriff_static.js:513` Fixtur, `e2e/global-setup.js:19-20`) und Lücken (Zwischenvariable, Verkettung, mehrzeilig, destrukturiert, `path.dirname(__filename)`) | D, B | gelesen | statt Textmuster ein LAUFZEIT-Riegel (Muster `test/helfer/netz-sperre.js`) |
| PT1-7 | Abschnitt 5 scannt nur das Wurzelverzeichnis | B | gelesen `:132` | Anmerkung; die Laufzeitsperre deckt alle Dateien |
| PT1-8 | Transitive Requirer (über `routes/wartung.js`) sieht Abschnitt 5 nicht (benannte Grenze Abschnitt 6) | D | gelesen | durch die Laufzeitsperre gedeckt |
| PT1-9 | Einzelaufrufe schreiben über Rückfall-Wurzeln (`belehrungen-uploads`, `Dokumente`) in den Repo-Baum | D | gelesen | durch die Laufzeitsperre gedeckt (Schreiben UND Löschen) |
