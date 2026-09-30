# Diffprüfung C5-E1 — Testhelfer und Einzeltests

Stand 30.09.2026. Zweig `c5e1-testhelfer`, Commit `d1b0bab`, 33 Dateien. Der Bau meldet: Suite `SUITE_EXIT=0`, 419 = 419, Lint EXIT 0.

Selbst gelesen:
- `routes/csp-bericht.js` (Hook, nur die Funktion exportiert, nicht die Map).
- `test/helfer/datei-sperre.js` (Signal-Haken erst beim ersten Verstoß, erneutes Auslösen nur ohne fremden Hörer).
- `test/helfer/quelltext-scan.js` (Ignorierte auf beiden Seiten; ein git-Fehler im echten Baum ist ein Scanfehler).
- `test/helfer/versand-sperre.js` (Kopf).

Offene Frage an die Spuren: Die Ausschlussmenge des Scanners kommt jetzt aus git, also aus derselben Quelle wie die Referenz. Das ist als Grenze benannt; ob sie trägt, messen die Spuren.

Spuren: Lesespur `deepseek-flash` mit dem Baum `/workspace/gymdocu-c5e1-lese` und eine ausführende Claude-Spur in einem eigenen Baum.
