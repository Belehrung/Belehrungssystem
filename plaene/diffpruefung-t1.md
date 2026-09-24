# Diffprüfung T1 — Tests fassen keine echten Datenwurzeln an

Stand: Zweig `fix-t1-test-pdf-aufraeumen`, Kopf `405e9c8` (+ master-Merge `5c19868`). Suite nach master-Merge:
SUITE_EXIT=0, 370 = 370, Lint 0, Marker 6 (Prosa). **Tauschrunde der Routing-Messung:** Lesespur Kimi mit Bündel
(Diff, `datei-sperre.js`, Selbsttest, `netz-sperre.js`; 1310 s) statt DeepSeek; Claude-Spur mit eigenen Proben in
einer Kopie ausserhalb des Baums (`/workspace/probe-t1repo`, danach gelöscht).

| Nr. | Befund | Spur | Nachgemessen | Einstufung |
|---|---|---|---|---|
| T1-K1 | Selbsttest (j) legt über einen UNGESPERRTEN Kindprozess `<repo>/pdf/__dateisperre_probe__/…` wirklich an und löscht danach rekursiv darunter (+ `rmdir pdf`, falls leer) — auf dem Server im ECHTEN Archiv; Aufräumen nur im Erfolgsweg | K | gelesen `test_feature_dateisperre.js:347-376, 427-446` | **blockierend** |
| T1-K2 | 19 von 43 Patch-Zeilen ohne Sperrprobe (Callback: unlink, rmdir, rename, writeFile, appendFile, copyFile, open, symlink, link, utimes; Promise: dieselben ohne symlink) — eine Zeile entfernen, Suite bleibt grün | K | `grep`: Callback-/Promise-Formen nur als Durchlass unter `tmpdir` (`:271-316`) | hoch |
| T1-K3 | Ausnahme in `test_feature_keine_systemeingriffe.js` gilt für die ganze Datei; Begründung „kein /var/www“ stimmt auf dem Server nicht | K | gelesen | mittel |
| T1-K4 | Einzelaufruf ohne `run.sh`: der statische Wächter sichert nur `PDF_ROOT`; `EINWEISUNG_NACHWEIS_DIR` u. a. ungesichert | K | gelesen | mittel → Sammelliste |
| T1-K5/C3 | `chmod`/`chown`/`lchown`/`lutimes` nicht gesperrt, nicht als Grenze benannt | K, C | gemessen: `chmodSync` im Repo DURCHGELASSEN | mittel |
| T1-C2 | `mkdtemp` im Repo nicht gesperrt (legt das Verzeichnis an; erst der Folgeschritt wirft) | C | gemessen: `pdf/x-UJST6G` angelegt | gering |
| T1-C1 | Die fünf neuen Temp-Verzeichnisse werden am Ende von `run.sh` nicht abgeräumt (die vier alten schon, `:1032-1055`) | C | gelesen | gering |
| T1-K6 | Prozesse, die einen Verstoss schlucken, enden rot; Meldung nur auf stderr | K | gewollt | im Kopf benennen |
| T1-K7 | Zwei Zusicherungstexte versprechen mehr als geprüft ((b), (f) LESE) | K | gelesen | gering |
| — | Symlink über `/tmp` ins Repo: durchgelassen | C | gemessen | benannte Grenze (bleibt) |
| — | Worker-Thread: gesperrt | C | gemessen | kein Befund |

Kimi 7, Claude 3; Überschneidung 1 (chmod). Kein Befund gefallen.
