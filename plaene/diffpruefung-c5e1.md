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

## Ausführende Claude-Spur (26 Mutationen/Messungen, 10 Befunde)

Die tragenden Befunde sind gemessen. Nr. 1 ist ein Regress: eine negative Zusicherung hat eine Zahlengrenze bekommen, auf master war sie rot.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| C1 | P2 (Regress) | `nichtSynchron` in `korrektur_dokumente_static` hat die Zahlengrenze 2850. Ein synchroner Aufruf weiter hinten im Handler bleibt grün. | Nacharbeit: negative Muster an die Routengrenze binden, ohne Zahl |
| C2 | P2 | Nach dem ersten Verstoß ist ein Kind in einer synchronen Schleife SIGTERM-immun; `spawnSync` mit Zeitlimit hängt. | Nacharbeit (mit F4): nach dem Quittieren abhängen |
| C3 | P3 | Reihenfolge der Hörer: `once`/signal-exit werden überstimmt. | Nacharbeit: `prependListener` |
| C4 | P3 | Zwei Mutationen am Haken überleben. | Nacharbeit |
| C5 | P3 | `istEingesetzt()` ohne createTransport überlebt. | Nacharbeit |
| C6 | P3 | `fremderVersand()===0` wird ohne Zugangsdaten nie rot. | Nacharbeit: Attrappenwerte für `GYMDOCU_TG_*` |
| C7 | P3 | Redirect nach aussen (wie F3). | Nacharbeit |
| C8 | P3 | Globale Git-Ausschlüsse ändern die Ignoriermenge (wie F5). | Nacharbeit |
| C9 | P3 | Keine Fixtur für einen verknüpften Worktree. | Nacharbeit |
| C10 | P3 | `unzip -t` wird auch aus falschem Grund rot. | Nacharbeit: Positivkontrolle |
| — | Anmerkung | `ops/boot-smoke.js` lädt server.js im eigenen Prozess, steht aber nicht im Lader-Inventar. | Nacharbeit: als benannte Ausnahme aufnehmen |
