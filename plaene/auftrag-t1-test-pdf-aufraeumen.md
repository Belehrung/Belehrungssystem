# Bauauftrag T1: Tests räumen nie im echten PDF-Baum auf (Fassung 2, 24.09.2026)

**Zielrepo:** GymDocu, Zweig `fix-t1-test-pdf-aufraeumen` ab `origin/master` (`221a7b2`).
**Herkunft:** DeepSeek-Vollprüfung, Befund V25-1 (hoch), dazu V25-2, V21-1, V21-2 — `plaene/vollpruefung-befunde.md`.
**Modellwahl, VOR dem Auftrag entschieden:** Standard-Executer — viele Dateien, derselbe Handgriff; keine Produktivlogik.
**Nach SUCHMUSTER arbeiten**, nicht nach Zeilennummer.

## Befund (am Code bestätigt)

* 19 Aufräumstellen in 4 Testdateien löschen mit `fs.rmSync(path.join(__dirname, <pfad>), { force: true })`, wobei
  `<pfad>` der öffentliche Pfad `/pdf/<sid>/<Typ>/<datei>` aus `core/pdf-engine.js` ist:
  `test_feature_mangel_nachtrag_kopfzeile.js` (13×), `test_feature_seilkontrolle_pdf_unterschrift.js` (2×),
  `test_feature_nutzungsentscheidung.js` (2×), `test_feature_nutzung_nachtrag.js` (1×, Form
  `require('node:path').join(__dirname, pfad)`).
* In der Suite zeigt `PDF_ROOT` auf ein mktemp-Verzeichnis (`test/run.sh`), das PDF entsteht dort. Gelöscht wird aber
  `<repo>/pdf/<sid>/…`. Auf dem Live-Server ist `<repo>/pdf` = `/var/www/gymdocu/pdf`, das echte Archiv
  (`core/pdf-root.js`, Kopfkommentar). Die Test-DB ist frisch, niedrige `sid` treffen echte Studio-Ordner;
  `test_feature_nutzungsentscheidung.js` erzeugt den GANZEN laufenden Monat → derselbe Dateiname wie ein echtes
  Monats-PDF. Der Handweg `gymdocu-deploy` fährt die Suite auf dem Server als Pflicht-Gate.
* Dieselben Dateien stehen im Wächter `test_feature_provisioning_pdf_root_static.js`, Abschnitt 5, unter
  `BEKANNTE_LUECKE` (15 direkte Requirer von `core/pdf-engine.js` ohne geprüfte Umleitung) — eine benannte Grenze.
* `test_feature_spuelplan.js` fixiert `PDF_ROOT` beim `require` ohne eigene Umleitung und löscht rekursiv
  `PDF_ROOT/<sid>` — im Einzelaufruf das echte Archiv.

## Entwurf

1. **Jede Testdatei, die `core/pdf-engine.js` (direkt) oder `core/pdf-root.js` lädt und PDFs erzeugt oder löscht,
   lenkt `PDF_ROOT` VOR dem ersten `require` auf ein eigenes `fs.mkdtempSync(path.join(os.tmpdir(), '<name>-'))` um**,
   mit Sicherheitsnetz wie `test_feature_pdf_crlf_saeuberung.js` (`echterPdfRootAusEnv()` aus
   `test/helfer/env-pfade-scratch.js`, Abbruch, wenn das Temp-Verzeichnis dem echten Wert gleicht), und räumt am Ende
   (auch im Fehlerweg, `try/finally`) GENAU dieses Temp-Verzeichnis rekursiv ab. Betroffen: die 15 Dateien aus
   `BEKANNTE_LUECKE` in Abschnitt 5 plus `test_feature_spuelplan.js`.
2. **Die 19 Einzel-Löschungen über `__dirname` entfallen** (das Temp-Verzeichnis wird als Ganzes geräumt). Wo eine
   Datei ein erzeugtes PDF gezielt entfernen muss (z. B. weil es eine spätere Zusicherung stört), dann über den
   absoluten Pfad unter dem EIGENEN Temp-Verzeichnis, nie über `__dirname`.
3. **Abschnitt 5 des Wächters**: `BEKANNTE_LUECKE` wird leer (bzw. entfällt), alle 15 Dateien wandern nach `GEPRUEFT`
   (dort wird die echte Umleitung VOR dem `require` zugesichert). `test_feature_spuelplan.js` wird von Abschnitt 5
   nicht erfasst (lädt `core/pdf-root`, nicht `core/pdf-engine`) — für ihn eine eigene Zusicherung derselben Art.
4. **Neuer Wächter (statisch, eigene Datei oder Abschnitt in `test_feature_pdf_root_lesezugriff_static.js`)**: in
   keiner `test*.js`/`test/**/*.js`/`e2e/**/*.js` darf das Ziel von `rmSync`/`unlinkSync`/`rm`/`unlink` (auch
   `fs.promises`, destrukturiert) aus `__dirname` gebildet werden, AUSSER mit einem reinen String-Literal auf eine
   ausdrücklich gelistete Temp-Unterstruktur (heute `e2e/global-teardown.js`: `path.join(__dirname, "tmp")`).
   Erkennung nach dem Muster der bestehenden Wächter (Kommentare maskieren, Positivkontrolle, Sollzahl der gescannten
   Dateien gegen `git ls-files`). Fixturen je Form: `path.join(__dirname, pfad)`, `require('node:path').join(__dirname,
   p)`, `path.resolve(__dirname, x)`, Template-Literal mit `${__dirname}`, `fs.promises.rm(...)`; Durchlass: das
   gelistete Literal, ein Pfad unter `os.tmpdir()`.

## Nachweis

* Gegenprobe 1: eine der 19 alten Zeilen wieder einsetzen → neuer Wächter ROT; zurück → GRÜN.
* Gegenprobe 2: in einer der 15 Dateien die Umleitung hinter das `require` schieben → Abschnitt 5 ROT.
* Gegenprobe 3 (Verhalten): eine Datei mit einer Attrappe für `<repo>/pdf` (nur im Wegwerf-Arbeitsbaum, NIE auf echten
  Daten) — vor der Behebung verschwindet eine gleichnamige Datei, danach nicht. Wenn das ohne Schreibzugriff auf echte
  Pfade nicht machbar ist, genügt der statische Nachweis; dann das begründen.
* Jede der 16 Dateien einzeln grün, volle Suite, Dateizahl-Ritual, Lint, Marker-Scan.

## Nicht Teil dieses Auftrags

* Die Requirer-Liste von `core/retention.js` (Abschnitt 4, 9 Dateien, weitere Wurzeln DOKUMENTE_DIR usw.) — eigene
  Runde, auf der Sammelliste.


---

# FASSUNG 2 (nach der Planprüfung, `plaene/planpruefung-t1.md`) — sie ERSETZT Entwurf und Nachweis oben

## Umfang

Nicht „19 Stellen in 4 Dateien“, sondern: JEDE Stelle in Testdateien (`test*.js`, `test/**/*.js`, `e2e/**/*.js`), an der
ein Lösch- oder Schreibziel aus `__dirname`/`__filename`/`process.cwd()` gebildet wird und auf eine Datenwurzel zeigt —
direkt, über eine Zwischenvariable (`const abs = path.join(__dirname, pfad)`), über `require('node:path')`. Bekannt:
`test_feature_mangel_nachtrag_kopfzeile.js` (13), `test_feature_seilkontrolle_pdf_unterschrift.js` (2),
`test_feature_nutzungsentscheidung.js` (2), `test_feature_nutzung_nachtrag.js` (1), `test_feature_mangel_nachtrag.js`
(2), `test_feature_geraete_defekte_erfassungsweg.js` (1), `test_feature_verbandbuch_meldepflicht.js` (über `abs`).
Die Liste ist ein Hinweis, kein Befund: selbst suchen und das Ergebnis mit der Such-Zeile melden.

## Entwurf

1. **Laufzeit-Riegel `test/helfer/datei-sperre.js`** (Hauptriegel, Muster und Begründung wie
   `test/helfer/netz-sperre.js`, per `NODE_OPTIONS=--require` aus `test/run.sh` in JEDEN Testprozess geladen, auch
   Kindprozesse; KEIN Abschalt-Schalter über eine Umgebungsvariable):
   - Geschützte Wurzeln = die Standard-Datenwurzeln des Produktivcodes relativ zum Repo, aus dem Bestand abgeleitet
     (heute u. a. `pdf`, `Dokumente`, `belehrungen-uploads`, `defekt-fotos`, `pruefberichte`, `lageplan-uploads`,
     `einweisung-nachweise`, `offboarding…`) — die Liste per Suche über `core/`/`routes/` ermitteln
     (`path.join(__dirname, '..', '<name>')`) und im Riegel mit Fundstelle kommentieren. Dazu `/var/www`.
   - Gesperrt, wenn das AUFGELÖSTE Ziel (`path.resolve`, Symlinks nicht nötig) in einer geschützten Wurzel liegt:
     `rmSync/rm/unlinkSync/unlink/rmdirSync/rmdir` (auch `fs.promises`), `renameSync/rename` (Quelle ODER Ziel),
     `writeFileSync/writeFile/appendFile*`, `createWriteStream`, `copyFileSync/copyFile` (Ziel), `mkdirSync/mkdir`.
     Ausnahme: Pfade unter `os.tmpdir()`.
   - Verstoss → Ausnahme mit Klartext (Pfad, Vorgang, „Test fasst eine echte Datenwurzel an“), damit der Test ROT wird.
   - Selbsttest in einer eigenen Testdatei: je Vorgang ein Sperrfall auf einen NICHT existierenden Pfad unter
     `<repo>/pdf/__dateisperre_probe__/…` (nichts Echtes wird berührt) → Ausnahme; je Vorgang ein Durchlass unter
     `os.tmpdir()`; ein Kindprozess mit demselben `NODE_OPTIONS` sperrt ebenfalls. Positivkontrolle, dass der Riegel
     überhaupt geladen ist (sonst „nicht geprüft“ statt grün).
   - **Vorbedingung:** zuerst messen, welche Testdateien der Riegel in einem vollen Lauf trifft. Sind es mehr als die
     sieben oben plus `test_feature_spuelplan.js`, die Liste melden, BEVOR sie repariert wird.
2. **Die betroffenen Testdateien** lenken `PDF_ROOT` (und jede weitere benutzte Datenwurzel) VOR dem ERSTEN
   projekteigenen `require` (`./core`, `./routes`, `./server`, `./tools`, `./workers`) auf ein eigenes
   `fs.mkdtempSync(path.join(os.tmpdir(), '<name>-'))` um, Sicherheitsnetz `echterPdfRootAusEnv()` wie
   `test_feature_pdf_crlf_saeuberung.js`. Aufräumen in `process.on('exit', () => fs.rmSync(TMP, { recursive: true,
   force: true }))` (läuft auch bei `process.exit`). Die Einzel-Löschungen über `__dirname` entfallen; wo gezielt
   gelöscht werden muss, unter dem eigenen Temp-Verzeichnis.
3. **Abschnitt 5 des Wächters** (`test_feature_provisioning_pdf_root_static.js`): `BEKANNTE_LUECKE` löst sich auf in
   `GEPRUEFT` (Umleitung vor dem ersten projekteigenen `require` — nicht nur vor pdf-engine) und eine kurze Liste
   „ohne Dateizugriff“ mit je einer Begründung (heute `test_feature_security_minis.js`). Für
   `test_feature_spuelplan.js` dieselbe Zusicherung.
4. Kein neuer statischer Text-Wächter (Planprüfung PT1-6: Fehlalarme und Lücken); der Laufzeit-Riegel deckt alle Formen.

## Nachweis

* Riegel: Selbsttest-Datei grün; Gegenprobe: Riegel aus `NODE_OPTIONS` genommen → Selbsttest ROT („nicht geladen“),
  Rücknahme → grün. Gegenprobe 2: eine der alten `__dirname`-Löschzeilen wieder einsetzen → der betroffene Test ROT
  durch den Riegel.
* Abschnitt 5: Umleitung hinter ein frühes `require('./core/pdf-pfad')` geschoben → ROT.
* Jede geänderte Datei einzeln grün, volle Suite, Dateizahl-Ritual, Lint, Marker-Scan. Melden: welche Dateien der Riegel
  im ersten vollen Lauf traf.
