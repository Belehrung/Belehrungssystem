# Auftrag SG Nacharbeit 1 (30.09.2026)

Grundlage: Diffprüfung von `fd515d4` — eigene Messung (K1–K4, `plaene/STAND.md`), Lesespur `deepseek-flash`
(`scratchpad/sgd/antwort.txt`, F1–F6), ausführende Claude-Spur (`scratchpad/sgcc/`: `lauf.sh` baut die CI-Schritte
nach, `runs/`, `mut.js`, `muts_*.js`). Baum `/workspace/gymdocu-sg`, Zweig `fix-sg-semgrep`. Semgrep-venv:
`scratchpad/sg/venv`. Einordnung: nicht sehr komplex (Standard). Befunde sind gemessen; vor dem Bau die genannten
Läufe gegen deinen Stand wiederholen (muss das gemeldete Verhalten zeigen), danach erneut, beides wörtlich.

## 1. Semgrep übersieht still Funde in grossen Dateien (Claude-Spur B-1 — hoch)

Gemessen: 6 SQL-Injektionen in 6 grossen Dateien → Lauf 1: 0 Funde, Lauf 2: 2 Funde, beide „keine neuen Funde“.
Ursachen: `--timeout-threshold` (Standard 3) überspringt eine Datei nach 3 Timeouts beliebiger Regeln für ALLE übrigen,
ohne `errors`-Eintrag; und „Fixpoint timeout while performing taint analysis at <pfad>“ steht nur im `--debug`-Log.
- Diff-Lauf mit GENAU den 6 Regeln (`--config r/<id>` je Regel, dieselbe Liste wie der Kontrolllauf; gemessen 13–14 s
  statt 89 s), `--timeout-threshold 0`.
- Beide Läufe mit `--debug`, stderr in eine Datei; jede Zeile „Fixpoint timeout … at <pfad>:…“ wird unter `teilweise`
  aufgenommen (Datei, Art `Fixpoint`, Regeln laut Zeile). Die Auswertung bekommt die Datei als weiteres Argument; fehlt
  sie oder ist sie leer, obwohl Semgrep lief → `nicht_geprueft`.
- `nichtAusgewaehlteFehler` in der Zusammenfassung ausgeben.
- Messung im Bericht: die 6-Dateien-Probe mit den neuen Einstellungen dreimal; jeder nicht gefundene Fall steht als
  `teilweise` in der Ausgabe (nie „keine neuen Funde“ ohne Zusatz).

## 2. Die Referenz der geänderten Dateien (K1, K2, F1, Claude-Spur B-2, quotePath)

- `.semgrepignore` in der Repo-Wurzel mit NUR `node_modules/` (gemessen: mit `ops/semgrep-probe/` darin liefert der
  Kontrolllauf 0 Treffer). Kopfkommentar: warum (Standard-Ignoreliste schliesst `test/` aus). Nachmessen, dass
  `public/vendor/*.min.js` dann gescannt oder als `teilweise` gemeldet wird.
- `git -c core.quotePath=false diff --name-only -z --diff-filter=d "$BASE" HEAD -- '*.js' '*.cjs' '*.mjs'`; Exit-Code von
  `git diff` getrennt sichern (kein `|| true` über die Pipe); Scheitern → `nicht_geprueft`.
- `auswerten()`: `nichts_zu_pruefen` NUR, wenn zusätzlich `paths.scanned` und `results` leer sind; sonst
  `nicht_geprueft` (Referenz und Semgrep widersprechen sich).
- `teilweise` erzeugt zusätzlich eine `::warning`-Zeile („TEILWEISE UNGEPRÜFT: …“), damit es am PR sichtbar ist; Exit
  bleibt 0 (F2 — Hinweis, nicht Tor).

## 3. Kontrolllauf belegt die Konfiguration des Diff-Laufs (Claude-Spur B-3)

Statische Zusicherungen: beide `semgrep scan`-Aufrufe tragen dieselbe, im Test LITERAL stehende `--config`-Menge; der
Diff-Lauf trägt `--baseline-commit "$BASE"`, `--timeout-threshold 0`, `--exclude ops/semgrep-probe`; `geaendert.txt`
kommt aus `git … diff … "$BASE" HEAD`. Erfassung aller Semgrep-Aufrufe über `/\bsemgrep\b/` in `run:` (ohne
`pip install`), Anzahl literal (F3). Gegenproben je Zeile (u. a. W09: eine `--config` gestrichen → ROT).

## 4. Tests, die fallen können (Claude-Spur, F4)

Je ein Test, der unter B08 (Reihenfolge Schritt 2/3), B06 (nur erste Klasse geprüft — alle fünf Klassen je einzeln
entfernen, bei eval beide Regeln), B01 (Kontrolllauf-Exit 2 mit vollständigem JSON), B03, B10 (`gescannt.size === 0`),
B15/B16 (bei 12 Funden stehen alle 12 in der Zusammenfassung), B04, B12, B13, B18, B19/B20 (Maskierung von `\r`/`\n` in
Eigenschaften) ROT wird; W01–W08, W10 statisch. Teil A (F4): die statische Prüfung verlangt den genauen Ausdruck
`buf.length < IV_LAENGE + TAG_LAENGE`, `IV_LAENGE = 12`, `TAG_LAENGE = 16` und `authTagLength: TAG_LAENGE` in beiden
Aufrufen, Kommentarabzug auch für `/* … */`; Gegenproben `buf.length < IV_LAENGE`, `authTagLength: undefined` → ROT.

## 5. Kleines

- K4: `persist-credentials: false` am Checkout.
- F5: ein Wert unter 28 Byte wirft in `entschluesseln()` einen EIGENEN Fehler („zu kurz“), nicht „mit keinem Schlüssel
  zu öffnen“; `ops/schluessel-rotieren.js` meldet ihn unterscheidbar. Test literal.
- Fehlalarme der Klasse Geheimnis in Testdateien (`test_*.js`, `test/`, `e2e/`) werden gezählt, nicht angemerkt (Liste
  der Muster literal, Test).

Nicht in diesem Auftrag: F6 (`core/file-crypto.js` Leerinhalt → Sammelliste `plaene/offene-befunde-sg.md`), `// nosemgrep`
(bleibt erlaubt, im Diff sichtbar).

## Zustandsfrage für den Bericht

Kann nach der Nacharbeit ein Lauf, der eine geänderte Datei nicht vollständig mit allen sechs Regeln geprüft hat, noch
„keine neuen Funde.“ ohne Zusatz melden? Welche Fälle bleiben, und wie erscheinen sie am PR?

-- Ende des Auftrags --
