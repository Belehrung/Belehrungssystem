# Diffprüfung C6-F (Tests), Stand `4c2ab21`

Eigene Prüfung: Produktivcode (`routes/belehrungen.js`, `routes/lageplan.js`, `routes/sichtpruefung.js`,
`tools/mutationsprobe.js`) Zeile für Zeile gelesen. Suite-Log `/workspace/c6f-suite3.log` (nach dem letzten Commit):
`SUITE_EXIT=0`, 0 ✗, 468 = 468 mit dem Sieb der Registrierungszeilen, `diff` EXIT 0.

## Eigener Befund

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| E1 | sollte | `FOTO_DIR` entsteht nicht mehr beim Start. Der Foto-Reaper liest es mit `readdirSync` und wertet ENOENT als Stufenausfall (`core/foto-reaper.js:190-193`, `:217`). Auf einer frischen Installation alarmiert er deshalb jede Nacht, bis das erste Foto hochgeladen ist. | N1: Die Verzeichnisse legt `start()` in `server.js` an (nicht das Modulladen, nicht `ops/boot-smoke.js`) |

## Lesespur flash (6 Befunde)

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| 1 | sollte | dasselbe wie E1 | trägt | N1 |
| 2 | sollte | Der generische Riegel `_(test\|e2e)$` lässt destruktive Tests gegen JEDE so benannte DB laufen, auch fremde (`crm_test`). | trägt (Konvention, kein Nachweis) | N1: auf `gymdocu(_[a-z0-9]+)?_(test\|e2e)$` einschränken |
| 3 | Anmerkung | `test/e2e-durchlauf.js:35` nimmt nur `_test`, nicht `_e2e`. | trägt | N1, mit 2 |
| 4 | Anmerkung | Die Ersatzzusicherung in `test_feature_korrektur_dokumente.js:86-88` belegt nur die Pfadquelle. | trägt, aber abgedeckt durch `lageplan_pfad_static` und `routen_verzeichnisse_lazy` B4 | Kommentar |
| 5 | Anmerkung | `test_feature_mutationsprobe_umgebung.js:168-176` prüft die Wurzeln nur als Zahl (10). | trägt | N1: Namen prüfen |
| 6 | Anmerkung | Die statische Prüfung kennt nur `writeFileSync(path.join(…))` als Schreibweg. | trägt (heute vollständig) | N1: um `copyFileSync`/`createWriteStream`/`renameSync` erweitern |
