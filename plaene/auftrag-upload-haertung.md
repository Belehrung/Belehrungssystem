# Auftragspapier — Upload-Härtung, Beitrag 1 (Fassung 2)

**Repo:** `/home/user/gymdocu`, Zweig von `master` (`903247b`).
**Grundlage:** `plaene/plan-upload-haertung.md` Fassung 3.

**Fassung 1 ist ERSETZT, nicht danebengelegt.** Sie ging am 18.09.2026 vor der
ersten Bau-Runde an die Planprüfung: **dreizehn Befunde, alle dreizehn von mir
selbst nachgemessen, alle dreizehn getragen — keiner gefallen.** Zwei davon
blockierend, und beide trafen den Kern:

- **Fassung 1 benannte den falschen Code als CVE-Fix.** Sie schrieb, der Fix
  sitze in `storage/disk.js` (`flushingFiles`-WeakMap). Das trifft nicht zu:
  jene WeakMap wird ausschliesslich unter `if (that.flush)` befüllt, `opts.flush`
  ist ein **neues Feature** in 2.4.0, und **wir setzen es nirgends**
  (nachgemessen: `flush` kommt in 2.3.0s `storage/disk.js` 0-mal vor; im Repo
  gibt es keine multer-`flush`-Option). Der echte Fix ist `abortCleanupDone` /
  `abortRemovedFiles` in `lib/make-middleware.js` — nachgemessen:
  `grep -c abortCleanupDone` liefert **0** in 2.3.0 und **3** in 2.4.0.
- **Der beauftragte Abbruch-Test hätte den Fehler nicht finden KÖNNEN.** Er
  sollte `_removeFile` selbst aufrufen — der Fehler besteht aber gerade darin,
  dass `_removeFile` NICHT gerufen wird. Ein Test, der den fehlenden Aufruf
  selbst nachholt, prüft einen Zweig, den es im verwundbaren Fall nicht gibt.

Der Lehrsatz daraus steht in der CLAUDE.md schon, nur an anderer Stelle: **ein
Satz der Form „X ist so, weil Y" ist eine Tatsachenbehauptung über Y** — auch
mitten in einem Auftragspapier. Fassung 1 hatte genau eine Behauptung
ausdrücklich als „meine Messung, miss sie nach" gekennzeichnet; **diese eine
trug.** Die ungekennzeichneten trugen nicht.

## Schnitt — was in diesem Beitrag NICHT gebaut wird

- **Der Upload-Inventar-Wächter.** Eigener Beitrag. Der CSRF-Wächter brauchte
  sechs Bau-Runden und trug in DREI davon eine falsche Zusicherung von
  Abdeckung.
- **Die Unterschrift-Wege ohne Inhaltsprüfung.** Es sind **mindestens sechs**,
  nicht fünf: `routes/module.js` (vier Stellen), `routes/getraenkeanlage.js`
  und — von der Planprüfung gefunden, von mir bestätigt —
  `routes/wartung.js:1050`, wo nur auf Vorhandensein geprüft wird. Die Liste
  ist damit ausdrücklich **nicht abschliessend**; der Folgebeitrag ermittelt
  sie neu, statt diese abzuarbeiten.
- **Der Integritätsfehler** im gemeinsamen Fehlerausstieg von
  `adminRouter.post('/neue-version/:id')` — ein später Fehlschlag löscht eine
  Datei, auf die die DB schon zeigt. Vorbestehend. **B1 setzt dort den
  Statuscode; das `fs.unlink` bleibt unverändert stehen.** Der Schnitt heisst
  nicht „diese Zeile nicht anfassen", sondern „diesen Fehler nicht beheben".

## A — multer 2.3.0 → 2.4.0 (CVE-2026-88932)

### A1 Der Versionssprung kommt OHNE eigenen CVE-Nachweis. Das ist eine Entscheidung, keine Nachlässigkeit.

Fassung 1 verlangte: Test schreiben, gegen 2.3.0 ROT messen, dann anheben.
**Das ist gestrichen.** Zwei unabhängige Messreihen haben keinen
Ausgangsbefund herstellen können:

- Die Planprüfung: acht Läufe (Engine-Ebene mit und ohne `flush`,
  Middleware-Ebene mit synchroner und verzögerter Engine), alle grün.
- Ich selbst: acht Läufe gegen das installierte 2.3.0, alle grün — **und die
  Positivkontrolle fiel durch.** Eine Spur zeigte, dass `_handleFile` nie
  gerufen wurde; eine reine In-Prozess-`Readable`-Attrappe bekam selbst ein
  vollständiges, gültiges Multipart nicht durch multer hindurch. Die acht Grün
  bedeuteten also „nichts gemessen", nicht „nicht verwundbar".

**Genau das ist der Grund für die Streichung.** Wäre nach Fassung 1 gebaut
worden, stünde am Ende ein grüner Test mit der Aufschrift „Abbruch abgedeckt" —
unsere teuerste Fehlerklasse, eine falsche Zusicherung von Abdeckung.

**Der Beitrag wird deshalb ehrlich beschriftet:** Versionssprung auf 2.4.0 als
Bestandsschutz. Beleg ist der OSV-Datensatz (selbst geholt über die Kennung,
nicht über die Versionsabfrage — die liefert für `multer@2.3.0` 0 Treffer,
obwohl der Datensatz existiert) und der Upstream-Regressionstest. **In keinem
Kommentar, keiner Commit-Botschaft und keinem Testnamen steht, dass wir den
CVE selbst nachgewiesen hätten.**

Wer trotzdem einen eigenen Nachweis will, zielt auf `lib/make-middleware.js`
statt auf die Engine und misst ROT/GRÜN **zuerst als Machbarkeitsprobe im
Scratchpad**. Nicht im Auftrag versprechen, was niemand hergestellt hat.

### A2 Was der Fehler wirklich ist

Aus dem OSV-Text (wörtlich): *„when a request using disk storage is aborted
mid-upload, **file writes that complete after multer has already run its abort
cleanup** are not removed"*.

Im Quelltext 2.3.0: `handleRequestFailure` ruft `busboy.destroy(err)` und dann
`abortWithError(err, true)` — `skipPendingWait` ist gesetzt, `finishAbort()`
läuft also **sofort**, ohne auf `pendingWrites` zu warten. Es sammelt
`uploadedFiles.concat(pendingFiles.filter(f => f.path))` und leert
`pendingFiles`. Ruft `_handleFile` seinen Rückruf **danach**, landet die Datei
in `uploadedFiles` — und `finishAbort` läuft nicht noch einmal. Sie bleibt
liegen.

2.4.0 merkt sich das in `abortCleanupDone` und ruft `_removeFile` in diesem
Fall direkt. Der Kommentar dort nennt die betroffene Klasse: *„engines slower
than the abort: multer-s3, GridFS, async filename"*.

**Betroffen sind unsere vier `diskStorage`-Konfigurationen** —
`core/pruefbericht.js`, `routes/belehrungen.js` (zwei) und `routes/verify.js`.
Die drei `memoryStorage`-Konfigurationen nicht.

**Eine Einordnung, die in den Kommentar gehört, aber NICHT als Entwarnung:**
Alle vier haben synchrone `destination`- und `filename`-Rückrufe, gehören also
zu keiner der drei im Fix-Kommentar genannten Klassen. Das verkleinert das
Fenster, **schliesst es aber nicht nachweislich** — niemand hat das gemessen,
und die Schreibphase (`pipeline`) ist in jedem Fall asynchron. Schreib das so
hin, nicht schärfer.

### A3 Was stattdessen zugesichert wird — Bestandsschutz, und so beschriftet

`lib/validate-limits.js` ist neu in 2.4.0 und **wirft** einen `TypeError`,
sobald ein Limit weder nicht-negative Ganzzahl noch `Infinity` ist. Es läuft
im `Multer`-Konstruktor, also **beim Modulladen** — ein Fehlschlag verhindert
den Serverstart.

Ich habe nachgesehen: alle sieben Limits sind Literale oder Produkte von
Literalen, keines kommt aus `process.env`. Die Planprüfung hat das bestätigt.
**Miss es trotzdem selbst**, und zwar so, dass es fallen KANN:

- alle sieben Module laden, keines wirft;
- **Positivkontrolle:** eine multer-Konfiguration mit einem konstruierten
  ungültigen Limit (etwa `fileSize: 1.5` oder `files: -1`) muss werfen. Ohne
  diesen Nachweis sagt „hat geladen" nichts.

Dazu, ausdrücklich als **Bestandsschutz** beschriftet (sie belegen keine neue
Härtung und erst recht nicht den CVE-Fix):

- Alle elf Multipart-Wege funktionieren nach dem Sprung unverändert. Elf, nicht
  zehn: die elfte entsteht aus der Schleife über `TYP_CONFIG` in
  `routes/sichtpruefung.js` (zwei Einträge, `cardio` und `kraft`).
- Die Grössengrenzen greifen weiterhin.

### A4 Drei Änderungen in 2.4.0, die man beim Diff-Lesen kennen muss

**(1) `LIMIT_UNEXPECTED_FILE` heisst jetzt `'Unexpected file field'`** (vorher
`'Unexpected field'`). Das ist die **einzige** Textänderung, und sie wird bei
uns an den Benutzer durchgereicht: vier Stellen bauen `let msg = err.message ||
'Upload-Fehler'` (in `routes/belehrungen.js` zwei, `routes/wartung.js`,
`routes/admin/geraete.js`). Entscheide und schreib die Entscheidung dazu: reicht
die englische Bibliotheksmeldung, oder gehört dort ein deutscher Text hin?

Fassung 1 hatte hier das dritte `MulterError`-Argument genannt — das setzt nur
zusätzlich `filename` und ändert keine Meldung. Und die Klasse, die Fassung 1
prüfen liess, ist leer: im ganzen Testbestand gibt es **null** Zusicherungen auf
einen multer-Fehlertext.

**(2) `wrappedFileFilter` gibt den Zählplatz bei Ablehnung ZURÜCK.** Fassung 1
schrieb, er reserviere ihn „jetzt synchron" — das tut 2.3.0 bereits
(`filesLeft[...] -= 1` steht dort schon vor `fileFilter(...)`). Neu ist die
Rückgabe plus ein `settled`-Riegel.

**Bei uns folgenlos:** die einzige `.array`-Stelle
(`routes/sichtpruefung.js`) hat **keinen `fileFilter`**, es wird also nie eine
Datei abgelehnt und nie ein Platz zurückgegeben. Die neunte Datei löst ohnehin
schon busboys `filesLimit` aus. Eine Messung „mehr als acht abgelehnt, genau
acht durch" ist auf beiden Versionen grün — **nimm sie auf, aber beschrifte sie
als Bestandsschutz**, nicht als Absicherung einer Verhaltensänderung.

**(3) `storage/memory.js` ist umgeschrieben** — `file.stream.pipe(concat(...))`
wird durch manuelles Sammeln über `.on('data')`/`.on('end')` ersetzt, und die
Abhängigkeit **`concat-stream` entfällt**. `npm install` entfernt sie samt
ihrem genesteten `readable-stream` und `typedarray` aus `package-lock.json` —
das ist erwartet, kein Versehen, und gehört in die Commit-Botschaft.

Durch genau diesen Code laufen die grössten Uploads des Bestands (25 MiB
Lageplan, 8 × 15 MiB Sichtprüfungsfotos, 8 MiB Seilfoto). Der Wechsel von
`pipe` auf Flow-Modus nimmt die Gegendruck-Kopplung heraus; begrenzt bleibt es
durch `fileSize`. **Miss einen grossen Upload je memoryStorage-Weg** und melde
die Zahlen — nicht, weil ein Fehler erwartet wird, sondern weil es niemand
gemessen hat.

## B — Fehlerbehandlung

**Zu den Fundstellen: Fassung 1 nannte Zeilennummern, und fünf von sechs waren
um eins verschoben.** Unten stehen deshalb **Muster**, keine Nummern. Für
Mutationsskripte gilt ohnehin: bei ungleich einer Fundstelle abbrechen.

### B1 Uploadfehler werden mit HTTP 200 beantwortet

In `routes/belehrungen.js`, im Weg `adminRouter.post('/neue-version/:id', …)`,
drei Stellen — der Uploadfehler-Zweig, „Keine Datei hochgeladen" und der
`catch` —, alle in der Form

    return res.send(await adminLayout(req.studioId, 'Fehler', …))

also ohne Status, also HTTP 200. Der Weg `adminRouter.post('/upload', …)` hat
dieselbe Struktur an vier Stellen.

Setz die Codes: **400** für Eingabefehler, **500** für den `catch`.

**Der Erfolgsweg liefert 302, nicht 200.** Beide Wege enden auf
`res.redirect('/admin/belehrungen?feedback=…')` (`version_ersetzt` bzw.
`belehrung_hochgeladen`). Fassung 1 behauptete 200 — eine Zusicherung darauf
wäre von Anfang an rot gewesen oder hätte dazu verleitet, den Redirect zu
„reparieren". **Der Vertrag lautet: Erfolgsweg weiterhin 302 mit dem wörtlichen
`feedback`-Wert im `Location`-Header.**

**Und der Schnitt gehört dazu:** `routes/belehrungen.js` hat **17** Stellen
dieser Form. Dieser Beitrag fasst die sieben der beiden Upload-Wege an, die
übrigen zehn nicht. Schreib das in den Kommentar und in die Commit-Botschaft —
sonst heisst der Beitrag hinterher „Uploadfehler antworten jetzt mit
Fehlerstatus", und das wäre falsch.

### B2 Der Lageplan-Weg leitet bei Fehler UND Erfolg weiter

`adminRouter.post("/etage/:id/grundriss", …)` endet in allen vier Fällen auf
`res.redirect`, unterschieden nur durch `feedback=` (`upload_fehlt`,
`pdf_fehler`, `grundriss_gespeichert`, `verarbeitung_fehler`).

**Hier wird nichts am Verhalten geändert.** Gebaut wird eine Zusicherung mit
echtem Vertrag: der Test prüft den `feedback`-Wert im `Location`-Header
wörtlich, **nicht** „wurde weitergeleitet". Letzteres ist bei dieser Route
immer wahr und kann nicht rot werden.

### B3 Ein falscher Dateityp ist von „gar keine Datei" nicht zu unterscheiden

Der `fileFilter` verwirft mit `cb(null, false)`. Multer überspringt die Datei
still, `req.file` bleibt `undefined`, und die Route landet bei
`feedback=upload_fehlt`. Wer eine `.exe` hochlädt, liest „Upload fehlt".

**Achtung, und das ist der Grund für diese ganze Fassung: ein blosser Tausch
auf `cb(new Error(...), false)` ist hier NICHT umsetzbar und macht die Sache
schlimmer.** `routes/lageplan.js` ist die **einzige** der zehn
Middleware-Aufrufstellen, die die Middleware direkt als Routen-Argument hängt

    adminRouter.post("/etage/:id/grundriss", upload.single("grundriss"), async (req, res) => {

— alle neun anderen umschliessen sie mit einem eigenen Fehlerrückruf
`(req, res, next) => { mw(req, res, (err) => …) }`. Ein geworfener Fehler geht
deshalb an `next(err)`, der Routen-Handler läuft nie, und der Fehler landet im
globalen Behandler in `server.js`. Der ruft `errorTracker.melde(err, req)`, und
das ruft `telegram(...)`. **Jede falsche Dateiwahl löste damit einen
Telegram-Alarm beim Betreiber aus** und zeigte dem Benutzer eine generische
500-Seite. Selbst nachgemessen: die neun Wrapper-Stellen, die eine
Direkt-Stelle, und der Pfad `melde → telegram`.

Bau deshalb so:

1. **Die Route auf das Wrapper-Muster der anderen neun umstellen**, damit der
   Fehler im Handler ankommt und dieser `feedback=falscher_dateityp` setzen
   kann.
2. **`LIMIT_FILE_SIZE` ausdrücklich unverändert lassen.** Es fällt heute
   ebenfalls in den globalen Behandler und bekommt dort eine eigene 413-Seite.
   Der Wrapper darf das nicht nebenbei mitändern — und wenn es sich nicht
   vermeiden lässt, wird es als gewollt benannt und gemessen, nicht
   stillschweigend geändert.
3. **Gemessen wird der ABLEHNUNGSweg**, nicht nur der Erfolgsweg: `.exe` hoch →
   `Location` enthält `feedback=falscher_dateityp`, **kein** 500, und
   **`errorTracker.melde` wurde NICHT gerufen** (Attrappe — dieselbe Suite ist
   auf dem Live-Server Deploy-Gate, ein echter Telegram-Aufruf aus einem Test
   ist eine Waffe).
4. Zusätzlich der Erfolgsweg, **vier Typen einzeln** (PNG, JPEG, WEBP, PDF).
   Eine Stichprobe mit einem Typ belegt die anderen drei nicht.

Fassung 1 verlangte nur die vier Erfolgsmessungen — also ausgerechnet nicht den
Weg, um dessentwillen die Änderung stattfindet.

## C — Ein Kommentar, der auf einen Zustand zeigt, den es nicht mehr gibt

In `core/pruefbericht.js` begründet der Kommentar über `fieldSize: 25 * 1024 *
1024` diesen Wert mit einem 25-MB-Limit des urlencoded-/JSON-Parsers in
`server.js` und zitiert den damaligen Wortlaut. **Dieses Limit gibt es seit dem
03.09.2026 nicht mehr:** `server.js` steht auf `1mb`,
`routes/upload-limit-waechter.js` hebt für `/module`, `/getraenkeanlage` und
`/belehrungen` auf **4 MB**, mit eigener Messreihe im Kopf der Datei.

Schreib den Kommentar auf den heutigen Stand um:

- Verweis auf `routes/upload-limit-waechter.js` statt auf ein nicht mehr
  existierendes Limit;
- **der Wert 25 MiB ist damit unbegründet.** Er bleibt stehen — ihn zu senken
  wäre eine Verhaltensänderung ohne Messung —, aber der Kommentar sagt ehrlich,
  dass seine ursprüngliche Begründung entfallen ist und der Wert nachgemessen
  gehört. **Erfinde keine neue Begründung.**

## D — Den Multipart-Helfer herauslösen

In `test_feature_pruefbericht.js` stehen **zwei** fest verdrahtete
Multipart-Helfer (`postMultipart` und `postAdminBericht`), jeder mit eigener
fester URL und festem Feldnamen. Die Hausregel „dieselbe Aussage an zwei Orten"
ist dort also schon verletzt.

Lös **einen** Helfer nach `test/helfer/` heraus, der **Pfad und Feldname als
Argumente** nimmt. `test_feature_pruefbericht.js` bekommt zwei dünne Adapter,
die beide darauf zeigen.

Fassung 1 verlangte hier, den Helfer „in derselben Form aufzurufen wie die
Produktion". Das war bei einem Helfer mit fester URL per Konstruktion
unerfüllbar. Die Auflage lautet jetzt: **beide Adapter rufen den
herausgelösten Helfer mit denselben Argumenten, die die Tests benutzen** — es
gibt keinen Aufrufweg, den nur der Test kennt.

**Abnahme der Herauslösung:** `test_feature_pruefbericht.js` vorher und
nachher laufen lassen, beide Zahlen wörtlich melden. Gleiche PASS, gleiche
FAIL — sonst ist Abdeckung verloren gegangen.

Nebenbei: Teil A braucht diesen Helfer **nicht** (dort wird keine Route
angefahren). Nur B braucht ihn.

## Fürs Inventar des Folgebeitrags, nicht für diesen

Die Planprüfung hat einen Datei-Eingang gefunden, den weder Plan noch Fassung 1
kannten, weil er durch alle vier Suchmuster fiel — kein multer, kein
`FileReader`, kein Base64: in `routes/lageplan.js` nimmt eine JSON-Route
`req.body.modell`, erzeugt daraus ein SVG, rendert es mit `sharp` und schreibt
**eine neue Bilddatei in dasselbe Verzeichnis** wie der multer-Weg. Sie hat
eine eigene Grenze (`json.length > 300000`). Selbst nachgemessen; ebenso ein
zweiter Schreibweg im Zuschneide-Pfad.

**Hier nicht anfassen.** Aber ohne sie wäre der Satz „Upload-Wege geprüft"
unvollständig, und genau deshalb steht sie hier.

## Abnahme

- **Volle Suite:** `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`.
  Ohne Pipe, ohne äusseres `flock` (sie sperrt selbst), `echo` in EIGENER Zeile.
- **Dateizahl-Ritual:** gelaufene gegen registrierte Dateien, `diff` EXIT 0.
  Normalisieren mit `sed 's/^[[:space:]]*//'`, **nie** `tr -d '[:space:]'`.
- **`npm run lint`** EXIT 0. Neue Testdateien in `test/run.sh` registrieren.
- **`npm install multer@2.4.0`** — `package.json` steht auf `^2.1.1`, also
  nicht gepinnt; die CI fährt `npm ci`, der Lock regiert. Wenn du exakt pinnen
  willst, `--save-exact`, und schreib die Entscheidung dazu.
- **Gegenprobe zu JEDER neuen Zusicherung:** Defekt herstellen, ROT messen,
  zurücknehmen, GRÜN messen — beide Ausgaben wörtlich. Mutationsskripte nehmen
  den Zielpfad als **Argument**, brechen bei ungleich einer Fundstelle ab,
  schreiben den Marker `GEGENPROBE-` + `DEFEKT` in dieselbe Zeile, laufen
  `node --check`, und die Rücknahme wird gegen eine unabhängig angelegte
  `cp`-Kopie mit `diff` EXIT 0 geprüft — **nie** `git checkout` oder
  `git stash`.
- **Testausgaben wörtlich melden**, nicht zusammenfassen.

## Was ich selbst nachmessen werde

Ich lese den Diff Datei für Datei, fahre die volle Suite selbst, und mache
mindestens diese Gegenproben selbst: die Positivkontrolle von `validate-limits`
mit einem konstruierten ungültigen Limit; den Ablehnungsweg des Lageplans mit
einer `.exe` einschliesslich der Zusicherung, dass `melde` NICHT gerufen wurde;
und den Erfolgsweg beider Belehrungs-Wege auf 302 mit wörtlichem `feedback`.

**Jede Tatsachenbehauptung in diesem Papier ist meine Messung, nicht deine.
Widerspricht deine Messung ihr, gilt deine — und sag es, statt sie zu
umgehen.** Fassung 1 hat genau eine Behauptung so gekennzeichnet; sie war die
einzige, die trug.
