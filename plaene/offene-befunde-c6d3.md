# Sammelliste C6-D3 (Abschnitt 3 CLAUDE.md)

Befunde: `plaene/diffpruefung-c6d3.md`.

| Kennung | Punkt | Stand |
|---|---|---|
| C6D3-1 | `verbandbuch.erstellt_am` (UTC) und `unfall_zeit` (Berliner Wandzeit) haben verschiedene Konventionen, schon benannt in `core/datum.js:53-60`. Jede Auswertung „Zeit bis zur Erfassung“ aus den Spalten muss den Versatz kennen. | offen, Extrarunde |
| C6D3-2 | Die Download-Bestätigung (V04-12) bleibt aus, wenn der Prozess zwischen Senden und Rückruf stirbt. | offen; als „fehlt statt falsch“ gewollt, Betreiber nicht gefragt |
| C6D3-3 | `POST /admin/module`: Fenster zwischen Commit und Protokoll; alte Werte werden ausserhalb der Transaktion gelesen (TOCTOU). | offen, Extrarunde |
