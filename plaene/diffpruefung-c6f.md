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

## Nacharbeit 1 (`6b07191`): eigene Lesung und Lesespur flash

Eigene Lesung: `core/schreibverzeichnisse.js`, `server.js#start()`, `core/retention.js` (Export). Das Anlegen läuft nach
`runMigrations` und vor `listen`, ein mkdir-Fehler wird geloggt und gemeldet, kein neuer Pfadausdruck. Laut Bericht ist
die Suite grün mit 469 = 469, Lint sauber, 12 Gegenproben rot.

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| N1-B1 | sollte | `test_feature_getmutation.js:34` behält ein eigenes lockeres Muster `_(?:test\|e2e)$`, das der neue Wächter nicht erkennt (`MUSTER_ENDUNG` kennt nur `_(test\|e2e)`, `_test$`, `_e2e$`). | trägt (gelesen, Zeile 34) | N2: auf den Helfer umstellen, `MUSTER_ENDUNG` um `(?:…)` und `_test(\?\|$)` erweitern, je eine Positivkontrolle |
| N1-B2 | Anm. | Ein Einzellauf `node test/e2e-durchlauf.js` startet `server.js`. Dessen `start()` legt jetzt `lageplan-uploads`, `defekt-fotos` und `einweisung-nachweise` im Repo an, weil der Durchlauf nur drei der fünf Variablen auf `E2E_TMP` setzt. | trägt (gelesen, `:52-63`) | N2: alle fünf auf `E2E_TMP` |
| N1-B3 | Anm. | `schreibverzeichnisse()` (vier `require`, darunter `core/foto-reaper`, das sonst erst im Cron geladen wird) steht ausserhalb des `try`. „Wirft nie“ gilt dafür nicht. Der Kopf behauptet zudem, der Test messe den boot-smoke-Fall. | trägt | N2: in den `try`, Ladefehler loggen und melden; Kommentar auf das Gemessene |
| N1-B4 | Anm. | Die SQL-Konsistenzprüfungen im neuen Wächter vergleichen zwei Ableitungen derselben Konstante. Die Geschwisterwächter pinnen den Text `istWegwerfDb(database.name)`. | trägt | entschieden: bleibt. Tragend ist die PG-Schleife (JS gegen PostgreSQL über 30 Namen). Die Konsistenzprüfung schützt nur vor einem Umbau, die Textpins folgen dem Muster der Geschwister. |

Toter Code `const existiert` in `test_feature_schreibverzeichnisse_start.js:62` kommt mit N2 weg.

## Nacharbeit 2 (`5764f5c`)

**Eigene Lesung:** `core/schreibverzeichnisse.js`. Die vier `require` stehen im `try`, ein Ladefehler wird gemeldet (`start:schreibverzeichnisse:laden`), der Start läuft weiter, und `meldeSicher` fasst beide Meldewege zusammen. Der Kopfkommentar trennt jetzt Gemessenes von Gelesenem.

**Laut Bericht:**
- `getmutation` und sechs neu eingeführte Riegel aus C6-A1/C6-D1 sind auf den Helfer umgestellt.
- Die Erkennung kennt jetzt `(?:)`, `_test(\?|$)`, `new RegExp`, `endsWith`/`includes`.
- Der E2E-Einzellauf legt nichts mehr im Repo an (gemessen mit `find` vorher/nachher).
- Alle Gegenproben rot.
- Suite: 484 = 484, Lint sauber.

**Keine weitere Lesespur:** Die Nacharbeit schliesst drei getragene Befunde, ohne neues Verhalten in der Produktion bis auf den gefangenen Ladefehler, und jede Änderung hat eine eigene rote Gegenprobe.
