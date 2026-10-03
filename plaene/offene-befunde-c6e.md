# Sammelliste C6-E (Abschnitt 3 CLAUDE.md)

Befunde: `plaene/diffpruefung-c6e.md`.

| Kennung | Punkt | Stand |
|---|---|---|
| C6E-1 | Eingebettete fetch-Wege in `routes/module.js:1129/1140` (Seil-Foto, Seil-Freigabe) melden ein Anmeldeportal (200 mit HTML) als „Verbindungsfehler“. | offen, Extrarunde |
| C6E-2 | Beim `online`-Ereignis laufen `sichereAusstehend()` und `gdSyncQueue()` gleichzeitig; das `finally` des Syncs zeichnet den Badge neu und kann den Kasten „Gesichert“ wegnehmen (Nacharbeit 3 hat nur den Sofort-Sync im Erfolgszweig entfernt). Vom Bauenden gemeldet. | offen, Extrarunde |
| C6E-3 | Im Live-Weg steht im `ausstehend`-Objekt `notkopie: true`, obwohl keine Notkopie existiert (wirkt nur als Textschalter). Irreführend benannt, harmlos. | offen, Extrarunde |
| C6E-4 | Der Merker „Fotos nicht gesichert“ im Live-Weg trägt die Ablehnungsliste nicht: schliesst der Trainer die Seite bei vollem Speicher, ist die Meldung „Foto endgültig abgelehnt“ weg (der Merker sagt nur „Fotos konnten nicht gespeichert werden“). Kimi N3-1. | offen, Extrarunde |
| C6E-5 | B26c (eine Rumpfbildung für Senden und Deckel) prüft per nicht verankertem Textmuster: `body: sitzungsRumpf(eintrag) + '…'` bliebe grün. Verankern oder den empfangenen Rumpf im Harness messen. Kimi N3-2. | offen, Extrarunde |
| C6E-6 | Nach dem Wettlauf (N2-2) können Merker und „wartet auf Übertragung“ für dieselbe Prüfung bis zum nächsten Sync (≤ 60 s) gleichzeitig stehen; `fotosVerlorenHtml` kennt die Queue nicht. Kimi N3-4. | offen, Extrarunde |
