# Sammelliste C6-E (Abschnitt 3 CLAUDE.md)

Befunde: `plaene/diffpruefung-c6e.md`.

| Kennung | Punkt | Stand |
|---|---|---|
| C6E-1 | Eingebettete fetch-Wege in `routes/module.js:1129/1140` (Seil-Foto, Seil-Freigabe) melden ein Anmeldeportal (200 mit HTML) als „Verbindungsfehler“. | offen, Extrarunde |
| C6E-2 | Beim `online`-Ereignis laufen `sichereAusstehend()` und `gdSyncQueue()` gleichzeitig; das `finally` des Syncs zeichnet den Badge neu und kann den Kasten „Gesichert“ wegnehmen (Nacharbeit 3 hat nur den Sofort-Sync im Erfolgszweig entfernt). Vom Bauenden gemeldet. | offen, Extrarunde |
| C6E-3 | Im Live-Weg steht im `ausstehend`-Objekt `notkopie: true`, obwohl keine Notkopie existiert (wirkt nur als Textschalter). Irreführend benannt, harmlos. | offen, Extrarunde |
