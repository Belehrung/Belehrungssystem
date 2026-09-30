# Diffprüfung C5-E1 — Testhelfer und Einzeltests

Stand 30.09.2026. Zweig `c5e1-testhelfer`, Commit `d1b0bab`, 33 Dateien. Der Bau meldet: Suite `SUITE_EXIT=0`, 419 = 419, Lint EXIT 0.

Selbst gelesen:
- `routes/csp-bericht.js` (Hook, nur die Funktion exportiert, nicht die Map).
- `test/helfer/datei-sperre.js` (Signal-Haken erst beim ersten Verstoß, erneutes Auslösen nur ohne fremden Hörer).
- `test/helfer/quelltext-scan.js` (Ignorierte auf beiden Seiten; ein git-Fehler im echten Baum ist ein Scanfehler).
- `test/helfer/versand-sperre.js` (Kopf).

Offene Frage an die Spuren: Die Ausschlussmenge des Scanners kommt jetzt aus git, also aus derselben Quelle wie die Referenz. Das ist als Grenze benannt; ob sie trägt, messen die Spuren.

Spuren: Lesespur `deepseek-flash` mit dem Baum `/workspace/gymdocu-c5e1-lese` und eine ausführende Claude-Spur in einem eigenen Baum.

## Lesespur flash (8 Befunde, gegengelesen)

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| F1 | sollte | `wiederherstellen()` erzeugt `GYMDOCU_TG_*`-Variablen, die vor `installiere()` nicht existierten (erster gesehener Wert statt Stand vor der Installation). | Nacharbeit |
| F2 | sollte | Offen bleiben `https.request` (`routes/webhooks.js`, `core/onedrive.js`) und Kindprozesse (curl in `ops/*.sh`). Der Kopf behauptet mehr, als der Helfer leistet. | Nacharbeit: `https.request` belegen oder Kopf verengen |
| F3 | sollte | Die Loopback-Durchreichung folgt Redirects nach draussen. | Nacharbeit: `redirect: 'manual'` |
| F4 | sollte | Die Signal-Haken bleiben nach dem Quittieren hängen; der Prozess ist dann dauerhaft SIGTERM-träge. | Nacharbeit: nach dem Quittieren abhängen oder Rückfall (wie `core/error-tracker.js`) |
| F5 | Anmerkung | `core.excludesFile` bzw. globale Ausschlüsse fliessen in beide Seiten ein. | Nacharbeit: `-c core.excludesFile=` in beiden Aufrufen |
| F6 | Anmerkung | Die Lader-Menge wird per Textmuster erhoben. | Nacharbeit: Muster erweitern |
| F7 | Anmerkung | Ein verschluckter ROLLBACK gibt den Client in den Pool zurück. | Nacharbeit: `release(true)` |
| F8 | Anmerkung | „unabhängig gelesen“ liest dieselbe Datei wie der Helfer. | Nacharbeit: Beschriftung |
