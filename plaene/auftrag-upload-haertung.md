# Auftragspapier — Upload-Härtung, Beitrag 1: Versionssprung mit Nachweis

**Repo:** `/home/user/gymdocu`, Zweig von `master` (`903247b`).
**Grundlage:** `plaene/plan-upload-haertung.md` Fassung 3 (im
Belehrungssystem-Repo). Der Bestand dort ist vollständig gemessen; dieses
Papier enthält die Auszüge, die zum Bauen nötig sind.

## Schnitt — was in diesem Beitrag NICHT gebaut wird

Der Plan deckt mehr ab, als hier gebaut wird. Was ausgeschnitten ist und warum:

- **Der Upload-Inventar-Wächter** (jeder Weg trägt eine Grenze, keine neue
  Route ohne Eintrag). Eigener Beitrag, eigenes Auftragspapier. Grund: Der
  CSRF-Ausnahmen-Wächter hat sechs Bau-Runden gebraucht und trug in DREI
  davon eine falsche Zusicherung von Abdeckung. Ein erreichbarer CVE soll
  nicht hinter so einem Bau warten.
- **Die fünf Unterschrift-Wege ohne Inhaltsprüfung** (`routes/module.js:3392`,
  `:3532`, `:3603`, `:3717`, `routes/getraenkeanlage.js:361`). Fünf Routen in
  zwei Dateien, dazu die ungeklärte Frage, was mit Bestandszeilen geschieht.
- **Der Integritätsfehler `routes/belehrungen.js:2002`** — ein später
  Fehlschlag löscht eine Datei, auf die die DB schon zeigt. Vorbestehend.
  Er ist zugleich der Grund, warum in diesem Beitrag **keine neue Aufräum-
  oder Inhaltsprüflogik** in diesen Weg eingebaut wird: ohne Phasenmodell
  verschlimmerte das genau den Fehler, den der Beitrag nicht anfasst.

## A — multer 2.3.0 → 2.4.0 (CVE-2026-88932)

### A1 Reihenfolge, und sie ist nicht verhandelbar

**Der Test wird VOR dem Versionssprung geschrieben und gegen 2.3.0 gemessen.**
Ein Test, der erst nach dem Sprung entsteht, kann nicht zeigen, dass der alte
Stand verwundbar war — er zeigt nur, dass der neue es nicht ist, und das ist
etwas anderes.

1. Test schreiben, gegen das installierte **2.3.0** laufen lassen. Erwartet:
   **ROT**, mit wörtlich gemeldeter Ausgabe.
2. `npm install multer@2.4.0`, `package-lock.json` mit.
3. **Denselben Test** unverändert erneut laufen lassen. Erwartet: **GRÜN**.
4. Beide Ausgaben wörtlich in den Bericht.

**Wenn Schritt 1 GRÜN ist, ist der CVE-Nachweis ungedeckt.** Dann wird der
Test NICHT als „Abbruch abgedeckt" beschriftet, sondern der Punkt als
ungedeckt geführt und gemeldet. Ein Test, der gegen die verwundbare Version
grün ist, misst etwas anderes als das, was er behauptet — **das ist ein
Abbruchgrund, kein Schönheitsfehler.** Lieber mit dieser Meldung abbrechen als
eine Zusicherung liefern, die nichts zusichert.

### A2 Was der Fehler ist (aus `npm diff` gelesen, nicht aus einer Meldung)

`storage/disk.js` in 2.4.0 führt eine `flushingFiles`-WeakMap ein. `_removeFile`
wartet damit, bis ein nach dem Schliessen des Schreibstroms nachgezogener
Flush-Deskriptor zu ist, bevor es entlinkt. In 2.3.0 entlinkt `_removeFile`
sofort, wenn `openStreams` den Eintrag nicht mehr hat — und dann bleibt bei
einem abgebrochenen Upload die Datei liegen.

Betroffen sind die **vier `diskStorage`-Konfigurationen**:

    core/pruefbericht.js:23      fileSize 10 MiB, fieldSize 25 MiB, fileFilter
    routes/belehrungen.js:131    fileSize 10 MiB, fileFilter
    routes/belehrungen.js:1005   fileSize 10 MiB, fileFilter
    routes/verify.js:21          fileSize  8 MiB, files 1, KEIN fileFilter

Die drei `memoryStorage`-Konfigurationen sind nicht betroffen.

### A3 Der Abbruch-Test

Er misst die Speicher-Engine, nicht eine Route — der kürzeste Weg zu einer
Aussage über genau den geänderten Code.

- **Echte `multer.diskStorage`**, echtes `_handleFile`/`_removeFile`, Ziel ein
  Wegwerf-Verzeichnis unter `os.tmpdir()`.
- **Schreibfortschritt muss NACHGEWIESEN sein, bevor abgebrochen wird:** die
  Zieldatei existiert UND hat mehr als null Bytes (`fs.statSync().size > 0`).
  Dass `destination` oder `filename` gerufen wurde, genügt NICHT — das ist
  genau die Verwechslung „eine Zahl statt einer Menge".
- **Eine Zeitüberschreitung ist ein FEHLER, kein Erfolg.** Wer auf ein Ereignis
  wartet, das nie kommt, und danach „sauber" meldet, hat nicht gemessen.
- Zusicherung: nach `_removeFile` existiert im Zielverzeichnis **keine** Datei.
  Die Menge der Einträge wird verglichen, nicht ihre Anzahl.
- **Kein echter Prozess, kein echter Dienst, kein Pfad ausserhalb von
  `os.tmpdir()`.** Dieselbe Suite ist auf dem Live-Server Deploy-Gate.

### A4 Was 2.4.0 sonst ändert — drei Stellen, die brechen können

**`lib/validate-limits.js` ist neu und WIRFT** einen `TypeError`, sobald ein
Limit weder nicht-negative Ganzzahl noch `Infinity` ist. Ich habe alle sieben
Konfigurationen nachgesehen: sämtliche Limits sind Literale oder Produkte von
Literalen, **keines kommt aus `process.env`**. Es sollte also nichts brechen.
**Das ist meine Messung, nicht deine — miss sie nach**, und zwar so, dass ein
Fehlschlag sichtbar wird: alle sieben Module laden und prüfen, dass keines
wirft. Eine Zusicherung, die nur „hat geladen" sagt, ohne dass ein
konstruierter ungültiger Wert sie auch rot machen KANN, ist Dekoration —
schreib die Positivkontrolle dazu.

**`MulterError` bekommt ein drittes Argument** (`file.originalname`). Prüfe
jede bestehende Zusicherung, die auf einen multer-Fehlertext oder
`err.message` prüft. Fundstellen mindestens in `routes/belehrungen.js:1974`
(`err.message === 'Nur PDFs erlaubt'`) und `routes/verify.js:32`
(`err.code === "LIMIT_FILE_SIZE"`).

**`wrappedFileFilter` reserviert den Zählplatz jetzt synchron** und gibt ihn
bei Ablehnung zurück. Das trifft `upload.array('fotos', MAX_FOTOS_PRO_UPLOAD)`
in `routes/sichtpruefung.js:3259` — die einzige `.array`-Stelle im Bestand.
Miss, dass ein Upload mit mehr als acht Dateien weiterhin abgelehnt wird und
einer mit genau acht weiterhin durchgeht. **Beide Richtungen**, sonst ist
unklar, ob die Grenze noch etwas tut.

## B — Drei Fehlerbehandlungsstellen, die die falsche Aussage bestätigen

Alle drei von mir am Quelltext nachgemessen.

### B1 `routes/belehrungen.js` antwortet Uploadfehler mit HTTP 200

Drei Stellen im Weg `POST /admin/belehrungen/neue-version/:id`:

- **`:1976`** — der Uploadfehler-Zweig:
  `return res.send(await adminLayout(req.studioId, 'Fehler', ...))`
- **`:1988`** — „Keine Datei hochgeladen": ebenfalls `res.send` ohne Status.
- **`:2002`** — der `catch`: ebenfalls.

Der Weg `POST /admin/belehrungen/upload` (`:2008`) hat dieselbe Struktur —
**sieh ihn nach und behandle ihn gleich**, wenn er es auch hat.

Setz die Statuscodes: **400** für einen Eingabefehler (Uploadfehler, keine
Datei, falscher Typ), **500** für den `catch`. Der Antworttext bleibt wie er
ist — es geht um den Status, nicht um den Text.

**Miss beide Richtungen:** ein Test, der nur „Status ist 400" prüft, war
vorher bei 200 rot und ist jetzt grün — das ist noch keine Zusicherung, dass
der ERFOLGSweg weiterhin 200 liefert. Sichere beides zu.

### B2 `routes/lageplan.js:607` leitet bei Fehler UND Erfolg weiter

Erfolg: `res.redirect('/admin/lageplan?etage=<id>&feedback=grundriss_gespeichert')`.
Fehler: dieselbe Route, nur `feedback=upload_fehlt`, `feedback=pdf_fehler`
oder `feedback=verarbeitung_fehler`.

**Hier wird NICHTS am Verhalten geändert.** Ein Umbau auf Statuscodes bräche
den Weiterleitungsfluss der Oberfläche, und der ist nicht Gegenstand dieses
Beitrags. Was gebaut wird, ist eine **Zusicherung mit echtem Vertrag**: der
Test prüft den `feedback`-Wert im `Location`-Header wörtlich, **nicht**, dass
weitergeleitet wurde. „Wurde weitergeleitet" ist bei dieser Route wahr, egal
was passiert ist — eine Zusicherung darauf kann nicht rot werden.

### B3 `routes/lageplan.js:68` verwirft einen falschen Typ lautlos

    cb(null, false);

Multer überspringt die Datei dann still, `req.file` bleibt `undefined`, und die
Route landet bei `:609` in `feedback=upload_fehlt` — **ununterscheidbar davon,
dass gar keine Datei gewählt wurde.** Wer eine `.exe` hochlädt, liest „Upload
fehlt".

Ändere `cb(null, false)` in einen geworfenen Fehler mit eigener, deutscher
Meldung (Muster: `routes/belehrungen.js:150`, `cb(new Error('Nur PDFs
erlaubt'), false)`), und gib der Route einen eigenen `feedback`-Wert für
„falscher Dateityp".

**Das ändert Verhalten** — miss deshalb ausdrücklich, dass der Erfolgsweg
(PNG, JPEG, WEBP, PDF, je einzeln) unverändert durchgeht. Vier Typen, vier
Messungen; eine Stichprobe mit einem Typ belegt die anderen drei nicht.

## C — Ein Kommentar, der auf einen Zustand zeigt, den es nicht mehr gibt

`core/pruefbericht.js:52-62` begründet `fieldSize: 25 * 1024 * 1024` so:

> fieldSize auf 25 MB angehoben (Betreiber-Fund 16.08.2026) — deckungsgleich
> mit dem 25-MB-Limit des urlencoded-/JSON-Parsers in server.js. Dort steht
> wörtlich der Grund: "Das 25-MB-Limit (HiDPI-Canvas-Unterschriften vom iPad
> Pro: dPR 2-3 → 5-10 MB Base64) gilt NUR für die drei Upload-/Signatur-
> Prefixe UND NUR für bereits angemeldete Sessions."

**Dieses 25-MB-Limit gibt es seit dem 03.09.2026 nicht mehr.** `server.js:161-162`
stehen auf `1mb`; `routes/upload-limit-waechter.js:66` hebt für `/module`,
`/getraenkeanlage` und `/belehrungen` auf **4 MB** — mit einer eigenen
Messreihe im Kopf der Datei (realistischer Worst Case 650,7 KiB).

Schreib den Kommentar auf den heutigen Stand um. Zwei Dinge gehören hinein:

- der Verweis zeigt auf `routes/upload-limit-waechter.js`, nicht mehr auf ein
  nicht existierendes Limit in `server.js`;
- **der Wert 25 MiB ist damit unbegründet.** Er bleibt in diesem Beitrag
  stehen — ihn zu senken wäre eine Verhaltensänderung ohne Messung —, aber der
  Kommentar sagt ehrlich, dass seine ursprüngliche Begründung entfallen ist
  und der Wert nachgemessen gehört. Schreib **keine** neue Begründung hin, die
  du nicht gemessen hast.

## D — `postMultipart` herauslösen

Der Helfer steht datei-lokal in `test_feature_pruefbericht.js:147`. Für die
Tests aus A und B wird er gebraucht. **Eine zweite Kopie ist ausgeschlossen**
(Hausregel „dieselbe Aussage an zwei Orten").

Lös ihn nach `test/helfer/` heraus und lass `test_feature_pruefbericht.js` ihn
von dort beziehen. **Die Herauslösung darf keine Abdeckung kosten:** lauf
`test_feature_pruefbericht.js` vorher und nachher und melde beide Zahlen
wörtlich — gleiche Zahl PASS, gleiche Zahl FAIL, sonst ist etwas verloren
gegangen.

Und die Regel, die genau hier greift: **eine Funktion auszulagern macht sie
prüfbar, nicht geprüft.** Ruf den Helfer in den neuen Tests in **derselben
Form** auf wie die Produktion ihn benutzt — dieselben Argumente, dieselben
Typen. Ein Test, der ihn anders aufruft, prüft einen Zweig, den es sonst nicht
gibt.

## Abnahme

- **Volle Suite:** `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`.
  Ohne Pipe, ohne äusseres `flock` (sie sperrt selbst), `echo` in EIGENER Zeile.
- **Dateizahl-Ritual:** die im Log gelaufenen Dateien gegen die in
  `test/run.sh` registrierten, `diff` EXIT 0. Zum Normalisieren
  `sed 's/^[[:space:]]*//'`, **nie** `tr -d '[:space:]'`.
- **`npm run lint`** EXIT 0.
- **Neue Testdateien in `test/run.sh` registrieren.**
- **Gegenprobe zu JEDER neuen Zusicherung:** Defekt herstellen, ROT messen,
  zurücknehmen, GRÜN messen — beide Ausgaben wörtlich. Mutationsskripte nehmen
  den Zielpfad als **Argument**, brechen bei ungleich einer Fundstelle ab,
  schreiben den Marker `GEGENPROBE-` + `DEFEKT` in dieselbe Zeile, laufen
  `node --check`, und die Rücknahme wird gegen eine unabhängig angelegte
  `cp`-Kopie mit `diff` EXIT 0 geprüft — **nie** `git checkout` oder
  `git stash`.
- **Testausgaben wörtlich melden**, nicht zusammenfassen.

## Was ich selbst nachmessen werde

Damit klar ist, worauf du dich NICHT verlassen sollst: Ich lese den Diff Datei
für Datei, fahre die volle Suite selbst, und mache mindestens diese
Gegenproben selbst — den Abbruch-Test gegen 2.3.0, die vier Lageplan-Typen
einzeln, und den Erfolgsweg von `neue-version` auf HTTP 200. Meine Angabe „alle
sieben Limits sind Literale" ist eine Behauptung von mir; wenn deine Messung
ihr widerspricht, gilt deine.
