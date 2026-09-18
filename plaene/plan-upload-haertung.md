# Plan — Upload-Wege härten (multer 2.4.0 + Dateityp und Grösse)

**Status: PLAN, noch kein Bauauftrag.** Er geht nach der neuen Hausregel vom
18.09.2026 ZUERST an den Gegenleser und erst danach an einen Executer.

**Das ist die erste Anwendung dieser Regel** — sie steht seit dem 10.09. in
der CLAUDE.md und wurde bis zum 18.09. fast nie befolgt.

## Warum dieser Beitrag

Zwei offene Punkte fallen zusammen:

1. **`multer@2.3.0` ist von CVE-2026-88932 betroffen** (in OSV unter der
   CVE-Kennung bestätigt; `npm audit` meldet es NICHT). Ein abgebrochener
   Multipart-Upload kann bei `diskStorage` eine verwaiste Datei hinterlassen.
   Behoben in 2.4.0. Einzelheiten und Quellenlage:
   `plaene/abhaengigkeits-audit-18-09-2026.md`.
2. **„Upload-Wege auf Dateityp und Grösse prüfen"** steht im
   `plaene/pentest-haertung-programm.md` seit Beginn als NICHT GEMESSEN.

## Was gemessen ist

Am 18.09.2026 von mir, vor Beginn der Härtungsrunde 5:

    core/pruefbericht.js:23        diskStorage   -> betroffen
    routes/verify.js:21           diskStorage   -> betroffen  (os.tmpdir())
    routes/belehrungen.js:131     diskStorage   -> betroffen  (UPLOAD_DIR)
    routes/belehrungen.js:1005    diskStorage   -> betroffen  (EINWEISUNG_NACHWEIS_DIR)
    routes/lageplan.js:62         memoryStorage -> nicht betroffen
    routes/sichtpruefung.js:149   memoryStorage -> nicht betroffen

Ebenfalls gemessen, aus denselben Stellen:

- `routes/verify.js` begrenzt auf 8 MB und eine Datei.
- `routes/lageplan.js` begrenzt auf 25 MB, eine Datei, und hat als einzige
  einen `fileFilter` (PNG/JPEG/WebP oder PDF).
- `routes/sichtpruefung.js` begrenzt über eigene Konstanten.
- **Für `core/pruefbericht.js` und die beiden Wege in `routes/belehrungen.js`
  ist NICHT gemessen, ob sie Grenzen und einen Filter tragen.** Das ist die
  erste Aufgabe, nicht eine Annahme.

**Zeilennummern sind vom 18.09. und veralten** — vor dem Bauen neu messen
(Hausregel). Härtungsrunde 5 fasst `routes/sichtpruefung.js` an.

## Vorgeschlagene Schritte

### S1 — zuerst MESSEN, dann bauen

Für alle sechs Aufrufe in einer Tabelle festhalten: Storage, `limits.fileSize`,
`limits.files`, `fileFilter` vorhanden ja/nein, Zielverzeichnis, und WER die
Route aufrufen darf (angemeldet? Bezirk-Token? öffentlich?).
`routes/verify.js` hängt unter `/v` und ist damit CSRF-ausgenommen und
öffentlich erreichbar — der Weg mit der grössten Angriffsfläche.

**Das Ergebnis dieser Messung entscheidet über den Rest des Plans.** Wenn sich
zeigt, dass alle sechs bereits Grenzen tragen, schrumpft der Beitrag auf den
Versionssprung.

### S2 — `multer` auf 2.4.0

`npm diff --diff=multer@2.3.0 --diff=multer@2.4.0 --diff-name-only` zuerst
(Hausregel, billigster Erstgriff). Kein Hauptversionssprung, also kein eigener
PR nötig.

### S3 — fehlende Grenzen und Filter ergänzen

Nur dort, wo S1 eine Lücke zeigt. **Ein `fileFilter` ist kein Ersatz für eine
Inhaltsprüfung** — `file.mimetype` kommt vom Client. Wo wir Bilder
weiterverarbeiten, prüft `sharp` den Inhalt ohnehin; wo wir PDFs annehmen,
sollte mindestens die Signatur (`%PDF-`) geprüft werden, statt dem
Content-Type zu glauben. Das ist als VORSCHLAG gemeint und gehört gemessen.

### S4 — Zusicherungen

Für jeden Weg: eine Datei über der Grenze wird abgelehnt, eine erlaubte geht
durch (Positivkontrolle). Ein falscher Typ wird abgelehnt, der richtige geht
durch. **Und für die verwaisten Dateien:** ein abgebrochener Upload darf im
Zielverzeichnis nichts hinterlassen — das ist die Zusicherung, die den CVE
abdeckt, und sie ist die schwierigste, weil sie einen Abbruch mitten im Strom
herstellen muss.

**Tests fassen kein echtes Dateisystem an** — dieselbe Suite ist auf dem
Live-Server Deploy-Gate. Die Zielverzeichnisse müssen also in ein
Scratch-Verzeichnis umgeleitet werden, wie es
`test/helfer/env-pfade-scratch.js` für `PDF_ROOT` schon tut.

## Fragen an den Gegenleser

1. **Ist S1 vollständig?** Welche Frage über einen Upload-Weg fehlt in der
   Tabelle, die man später teuer nachholt?
2. **Die Zusicherung für den abgebrochenen Upload** — wie stellt man einen
   Abbruch mitten im Multipart-Strom her, ohne echte Prozesse oder Dienste
   anzufassen? Und woran erkennt der Test, dass die Datei wirklich verwaist
   wäre, statt nur „kein Fehler aufgetreten"?
3. **Wo sitzt die Grenze wirklich?** `server.js:161-162` begrenzt urlencoded
   und JSON auf 1 MB — gilt das für Multipart überhaupt, oder greift dort
   ausschliesslich `multer.limits`? Wenn Letzteres: hat jeder der sechs Wege
   eine, und was passiert ohne?
4. **Reihenfolge:** Ist es richtig, den Versionssprung VOR den Zusicherungen
   zu machen? Gegenargument: dann kann keine Zusicherung mehr zeigen, dass
   der alte Stand verwundbar war.
5. **Was an diesem Plan ist eine unbelegte Behauptung?** Insbesondere: ich
   behaupte, `memoryStorage` sei von CVE-2026-88932 nicht betroffen. Das habe
   ich aus der Advisory-Beschreibung geschlossen, nicht gemessen.
