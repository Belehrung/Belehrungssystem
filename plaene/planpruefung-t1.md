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

## Fassung 2 — Kimi mit Bündel (24.09.2026, 1143 s, Guthaben wieder da)

Bündel: Fassung 2, `test/helfer/netz-sperre.js`, `test/run.sh:400-500`, `core/pdf-root.js`, `test/helfer/env-pfade-scratch.js`.
Die Prüfung lief, während der Executer Schritt 1 schon gebaut hatte (Commit `4a5d9e3`); nachgemessen am Papier UND am
gebauten `test/helfer/datei-sperre.js`.

| Nr. | Befund | Nachgemessen | Folge |
|---|---|---|---|
| K-B1 | e2e im Umfang, der Riegel erreicht `playwright test` nie | gelesen: `run.sh:485`; e2e schreibt heute nur unter `e2e/tmp` (`global-setup.js:19-23`, `global-teardown.js:7`) — kein heutiger Schaden | Umfang berichtigen, Grenze im Riegel-Kopf, Sammelliste |
| K-B2 | Wurzelliste per Textsuche abgeleitet und eingefroren, ohne Vollständigkeitskontrolle | erweiterte Suche (`../..`, `resolve`, `server.js`, `tools/`, `workers/`) findet heute dieselben acht Datenwurzeln — keine konkrete Lücke, die Klasse trägt | ganze Repo-Wurzel schützen statt einer Liste (Nachtrag 1) |
| K-B3 | Selbsttest probt nur `pdf`; `>= 9` ist eine Untergrenze | gelesen `test_feature_dateisperre.js:57, 72` | jede Wurzel einzeln proben, Menge gegen hingeschriebene Erwartung |
| K-B4 | `truncate`, `open` mit Schreibflag, `cp`, `symlink`, `link`, `utimes` nicht gesperrt | gelesen: nicht gepatcht | ergänzen |
| K-B5 | Fehlermodell für Callback/Promise/Stream | im Bau schon so gelöst (`process.nextTick(cb, …)`, `Promise.reject`); nur `createWriteStream` wirft synchron — bleibt so (laut, rot) | keine |
| K-B6 | `/var/www` feuert lokal nie; auf dem Server liegt das GANZE Repo darunter | gelesen `core/pdf-root.js:21-26` | lokal dieselbe Wirkung herstellen: Repo-Wurzel schützen (Nachtrag 1), Messlauf zuerst |
| K-B7 | Umgehungen: Buffer-/URL-Pfad | gelesen: `if (typeof ziel !== 'string') return;` lässt beide still durch | normalisieren; Shell-`rm`, verengte Kindumgebung, Symlink-Kette, Einzelaufruf als Grenzen benennen |
| K-B7-6 | `fs/promises` sei womöglich ein anderes Objekt | **gefallen**: gemessen `require('fs').promises === require('fs/promises')` → `true` (v22.22.2) | keine |
| K-B8 | Selbsttest schreibt bei defektem Riegel selbst | im Bau schon gelöst (Marker zuerst, Abbruch vor jeder Probe, Aufräumnachweis `(k)`) | keine |
| K-B9 | `os.tmpdir()` gegen festes `/tmp` sperrt die Suite auf dem Server | **gefallen**: gesperrt wird nur UNTER geschützten Wurzeln; `/tmp` liegt unter keiner, die Ausnahme spielt dort keine Rolle | keine |
| K-B10 | werfender Riegel zeigt im Messlauf nur den ersten Treffer je Datei | Logik eindeutig | Messlauf im Zählmodus (Konstante, kein env) |

10 Befunde (B7 zweigeteilt gezählt als einer), 8 getragen, davon 2 im Bau schon erledigt; 2 gefallen (B7-6, B9).
