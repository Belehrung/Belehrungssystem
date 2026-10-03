# Sammelliste C6-D3 (Abschnitt 3 CLAUDE.md)

Befunde: `plaene/diffpruefung-c6d3.md`.

| Kennung | Punkt | Stand |
|---|---|---|
| C6D3-1 | `verbandbuch.erstellt_am` (UTC) und `unfall_zeit` (Berliner Wandzeit) haben verschiedene Konventionen, schon benannt in `core/datum.js:53-60`. Jede Auswertung „Zeit bis zur Erfassung“ aus den Spalten muss den Versatz kennen. | offen, Extrarunde |
| C6D3-2 | Die Download-Bestätigung (V04-12) bleibt aus, wenn der Prozess zwischen Senden und Rückruf stirbt. | offen; als „fehlt statt falsch“ gewollt, Betreiber nicht gefragt |
| C6D3-3 | `POST /admin/module`: Fenster zwischen Commit und Protokoll; alte Werte werden ausserhalb der Transaktion gelesen (TOCTOU). | offen, Extrarunde |
| C6D3-4 | `routes/bezirk-magicline.js` `GET /` (Zeile 33): leerer catch, antwortet 500 ohne `melde()`. Vom Bauenden beobachtet, gehörte nicht zum Auftrag. | **erledigt** 03.10.2026, #516 (`de15f6b`, C6-Restpunkte) |
| C6D3-5 | Der Client-Ausdruck `toLocaleString('sv-SE',{timeZone:'Europe/Berlin',hour12:false})` (Verbandbuch-Formular, `public/offline-queue.js`) setzt keinen `hourCycle:'h23'`. In alten Browsern kann Mitternacht „24“ heißen; `berlinZeitZuMs` lehnt das ab (NaN), dann gibt es keine Kennzeichnung „nachgetragen“. Der Server-Helfer nimmt dafür ausdrücklich `h23`. | offen, Extrarunde |
