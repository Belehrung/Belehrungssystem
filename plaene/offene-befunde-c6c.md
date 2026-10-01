# Offene Befunde C6-C (Löschwege)

Stand 01.10.2026. Die Herkunft steht in `auftrag-c6c-loeschwege.md` (Fassung 3, Punkt 2) und in der Planprüfung sol
(`scratchpad/c6plan/sol-c6c4.txt`, Nr. 5).

| Kennung | Befund | Plan |
|---|---|---|
| C6C-g1 | Scheitert das Spool-Schreiben (Platte voll oder gesperrt), bleibt die Datei liegen, und es gibt keinen Auftrag. Es wird gemeldet. | eigener Beitrag: Waisen-Scanner für die flachen Verzeichnisse (mit Schonfrist und Referenzprüfung) |
| C6C-g2 | Ein Absturz VOR dem ersten dauerhaften Vormerken (etwa zwischen dem Prüfbericht-UPDATE und dem Löschhelfer, `routes/admin/geraete.js:5193-5206`) hinterlässt eine Waise ohne Auftrag. | derselbe Waisen-Scanner |
