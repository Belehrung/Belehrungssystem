# Offene Befunde C6-C (Löschwege)

Stand 01.10.2026. Die Herkunft steht in `auftrag-c6c-loeschwege.md` (Fassung 3, Punkt 2) und in der Planprüfung sol
(`scratchpad/c6plan/sol-c6c4.txt`, Nr. 5).

| Kennung | Befund | Plan |
|---|---|---|
| C6C-g1 | Scheitert das Spool-Schreiben (Platte voll oder gesperrt), bleibt die Datei liegen, und es gibt keinen Auftrag. Es wird gemeldet. | eigener Beitrag: Waisen-Scanner für die flachen Verzeichnisse (mit Schonfrist und Referenzprüfung) |
| C6C-g2 | Ein Absturz VOR dem ersten dauerhaften Vormerken (etwa zwischen dem Prüfbericht-UPDATE und dem Löschhelfer, `routes/admin/geraete.js:5193-5206`) hinterlässt eine Waise ohne Auftrag. | derselbe Waisen-Scanner |
| C6C-g3 | Die Nachweis-, Prüfbericht-, Verify- und Wartungs-Uploads löschen im Fehlerweg über `entferneDatei` ohne Queue und ohne Spool (`routes/belehrungen.js:1639-1876`, `routes/admin/geraete.js:5179-5231`, `routes/verify.js:211,230`, `routes/wartung.js:1201,1561,1776`; Grenze benannt in `routes/belehrungen.js:50`). Scheitert dort `unlink`, bleibt eine Waise ohne Auftrag (flash F4-8). | eigener Schnitt nach C6-C: diese Stellen auf `entferneDateiOderQueue` umstellen |
| C6C-g4 | Zwei atomare Schreibwege für Dateien: `spoolSchreibeAtomar` (`core/datei-loeschqueue.js`) und `schreibeOffboardingRest` (`core/provisioning.js`). Das ist dieselbe Aussage an zwei Orten. Ein gemeinsamer Kern ist ein eigener Beitrag, weil die R7/R8-Zusicherungen die fs-Aufruffolge von `schreibeOffboardingRest` einzeln festhalten. | C6-G |
| C6C-g5 | Die Referenzprüfung der flachen Verzeichnisse vergleicht den Dateinamen auf Gleichheit (`dateiNochReferenziert`). Das trägt, solange jeder Schreiber den Basisnamen speichert (gemessen: `bericht_datei = req.file.filename`). | C6-G: eine Zusicherung, dass alle Schreiber den Basisnamen speichern |
| C6C-g6 | Die `dev`-Identität im Spool ist nur synthetisch prüfbar (alle Fixturen liegen auf einem Dateisystem). | Anmerkung; die übrigen drei Felder werden einzeln mutiert |
| C6C-g7 | Der Typwechsel-Prüfer (G1-Drift, `test_feature_check_namen_vereinheitlichen.js` 1c) sieht `EXECUTE`-Anweisungen in Migrationen nicht. | C6-G |
| C6C-g8 | Ein Spool-Eintrag `hauptdatei` mit nicht-absolutem Pfad gilt als ungültig: Er wird umbenannt, einmal gemeldet und nicht nachgeholt. | entschieden, so gewollt (kein Schreiber legt relative Pfade ab) |
