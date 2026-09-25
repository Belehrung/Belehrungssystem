# Offene Befunde C2 — für die Extrarunde

Verweist auf `plaene/planpruefung-c2.md` (Nachmessung dort).

| # | Punkt | Stand |
|---|---|---|
| C2-S1 | Offene Verbandbuch-PDF-Route (`routes/verbandbuch-admin.js:536-582`) und der statische `/pdf`-Wächter liefern ohne Eintrag in `verbandbuch_weitergaben` (PC2-4). Ob ein Admin-Download eine „Weitergabe“ im Sinne des Protokolls ist, ist eine Rechtsfrage | offen, **Betreiber-Frage** |
| C2-S2 | `makeNeueFotosHandler` (`routes/sichtpruefung.js:3562-3565`): jeder Fehler endet als Erfolgsumleitung `?saved=1` (PC2-3) | offen |
| C2-S3 | `melde()`-Drossel fasst gleichartige Fehler verschiedener Studios zusammen (Signatur per Konstruktion wertfrei, PC2-14) — das zweite Studio erscheint nur im Server-Log | Grenze, benannt |
| C2-S4 | Hub-Berechnung in `server.js` für Wächter unsichtbar (Mutationen E, E2 grün) — testbar machen ist ein eigener Beitrag (Diffprüfung C2-10) | offen |
| C2-S5 | Toter `correction_sheet`-Job hält Health dauerhaft „degraded“, kein Requeue-Weg (C2-18) | offen |
| C2-S6 | Nach Ablehnung nach dem Commit entfallen Admin-Protokollmail und Servicetechniker-Frage (C2-19) | offen |
| C2-S7 | Verbandbuch fail-closed: `verify_dokumente`-Zeile bleibt für ein nie ausgeliefertes, gelöschtes Dokument (C2-20) — Zurückziehen berührt append-only | offen, Entscheidung nötig |
| C2-S8 | Monats-PDF bei kaputter Konfiguration ohne Hinweis (geschlossene Sonntage erscheinen als fehlende Kontrollen; Teil von C2-7) | offen |
