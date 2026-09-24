# Offene Befunde C2 — für die Extrarunde

Verweist auf `plaene/planpruefung-c2.md` (Nachmessung dort).

| # | Punkt | Stand |
|---|---|---|
| C2-S1 | Offene Verbandbuch-PDF-Route (`routes/verbandbuch-admin.js:536-582`) und der statische `/pdf`-Wächter liefern ohne Eintrag in `verbandbuch_weitergaben` (PC2-4). Ob ein Admin-Download eine „Weitergabe“ im Sinne des Protokolls ist, ist eine Rechtsfrage | offen, **Betreiber-Frage** |
| C2-S2 | `makeNeueFotosHandler` (`routes/sichtpruefung.js:3562-3565`): jeder Fehler endet als Erfolgsumleitung `?saved=1` (PC2-3) | offen |
| C2-S3 | `melde()`-Drossel fasst gleichartige Fehler verschiedener Studios zusammen (Signatur per Konstruktion wertfrei, PC2-14) — das zweite Studio erscheint nur im Server-Log | Grenze, benannt |
