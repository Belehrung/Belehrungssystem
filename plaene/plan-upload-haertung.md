# Plan — Upload-Wege härten (Fassung 3, Nachmessungen durch)

**Status: Bestand vollständig gemessen. Der Bauauftrag steht in
`plaene/auftrag-upload-haertung.md`.**

Die Messergebnisse stehen unten im Abschnitt „Nachgemessen 18.09.2026". Sie
ersetzen den früheren Abschnitt „Was noch nachzumessen ist" — der ist gestrichen,
nicht danebengelegt.

**Fassung 1 ist ersetzt, nicht danebengelegt** (Hausregel „dieselbe Aussage an
zwei Orten"). Sie ging am 18.09.2026 als erste Planprüfung nach der neuen Regel
an den Gegenleser — **vor** dem ersten Bau. Ergebnis: fünf Befunde, drei
blockierend, **alle gegen meinen Plan**, vier davon von mir selbst nachgemessen
und zutreffend. Kosten 6,94 $; eine Bau-Runde kostet ein Vielfaches.

Was Fassung 1 falsch hatte, steht unten bei jedem Punkt dabei. Das ist kein
Selbstzweck: die Fehler waren alle von derselben Art — **ich habe gezählt, was
mein `grep` fand, und das für den Bestand gehalten.**

## Was Fassung 1 falsch hatte (alles selbst nachgemessen)

1. **„Sechs multer-Aufrufe" — es sind SIEBEN.** Der siebte steht in
   `routes/module.js:1135-1139` und heisst `seilMulter`, weil das Modul unter
   einem Alias in einem `try/catch` mit Funktionsschalter geladen wird. Mein
   `grep "multer("` traf ihn nicht. **Dieselbe Alias-Blindheit, die den
   CSRF-Wächter drei Runden lang beschäftigt hat.**
2. **„Nur der Lageplan hat einen `fileFilter`" — es sind VIER**
   (`core/pruefbericht.js:65`, `routes/belehrungen.js:148` und `:1018`,
   `routes/lageplan.js`).
3. **„Nicht gemessen, ob drei davon Grenzen tragen" — ALLE SIEBEN tragen
   `fileSize`.** Das war mit einem `grep` beantwortbar und ich habe es als
   offene Frage in den Plan geschrieben.
4. **Mein Abbruchkriterium war falsch.** „Wenn alle Grenzen tragen, schrumpft
   der Beitrag auf den Versionssprung" folgt nicht: `core/pruefbericht.js:63`
   trägt zusätzlich **`fieldSize: 25 * 1024 * 1024`**, und eine Dateigrösse
   sagt nichts über Inhaltsprüfung, Feldgrösse, Gesamtlast oder Aufräumen.
5. **„Jede Datenbankabfrage trägt `studio_id`" stimmt so nicht.**
   `routes/verify.js:201` sucht nur über `verify_code` — und das ist RICHTIG
   so: `/v` ist bewusst öffentlich, `core/db.js:1235` macht den Code über
   `uq_verify_dok_code` global eindeutig. Die Sicherheitsgrenze ist der Code,
   nicht ein angemeldetes Studio. **Hier nichts nachrüsten** — das zerstörte
   den öffentlichen Prüfweg.

## Der Bestand, jetzt vollständig gemessen

### Sieben Konfigurationen

    core/pruefbericht.js:23      diskStorage  fileSize 10 MiB, fieldSize 25 MiB, fileFilter (PDF/JPEG/PNG)
    routes/belehrungen.js:131    diskStorage  fileSize 10 MiB, fileFilter
    routes/belehrungen.js:1005   diskStorage  fileSize 10 MiB, fileFilter
    routes/verify.js:21          diskStorage  fileSize  8 MiB, files 1, KEIN fileFilter
    routes/lageplan.js:62        memoryStorage fileSize 25 MiB, files 1, fileFilter
    routes/sichtpruefung.js:149  memoryStorage fileSize MAX_FOTO_BYTES, files MAX_FOTOS_PRO_UPLOAD
    routes/module.js:1139        memoryStorage fileSize  8 MiB, files 1   <- der übersehene

**Vom CVE betroffen (diskStorage): die ersten VIER.**

### Eine Konfiguration ist NICHT ein Upload-Weg

Der Prüfer hat elf Multipart-POST-Wege aus diesen sieben Konfigurationen
gezählt (Fundstellen in seinem Bericht). **Das ist von mir noch NICHT
nachgemessen** und gehört als erstes gemessen — es ist genau die Klasse „wer
EINEN Eintrittspunkt absichert, hat nicht die Eintrittspunkte abgesichert".

### Datei-Eingänge OHNE multer — vom Prüfer gefunden, von mir noch nicht gemessen

- **Geräte-CSV** (`routes/admin/geraete.js`): der Browser liest die Datei per
  `FileReader`, die Vorschau verarbeitet `req.body.csvdata` — und es gibt
  einen **separat aufrufbaren Commit-Eingang**.
- **Mitarbeiter-CSV** (`routes/admin/mitarbeiter.js`): dieselbe Struktur.
- **Signaturbild** (`routes/belehrungen.js`): `signatur` kommt aus dem Body und
  wird als Base64-PNG dekodiert.

Diese Wege müssen **nicht** in diesem Beitrag geändert werden. Sie müssen aber
im Inventar stehen und ausdrücklich eingegrenzt werden — sonst wäre
„Upload-Wege geprüft" eine falsche Aussage.

## Schritte

### S1 — Inventar je HTTP-METHODE UND VOLLSTÄNDIGEM PFAD

Nicht je `multer()`-Aufruf. Je Weg: Methode, voller Pfad, Konfiguration,
Storage, Grenzen, Filter, Zielverzeichnis, wer ihn aufrufen darf, und **wo der
Übergabepunkt liegt** (ab wann gehört die Datei zum gespeicherten Nachweis).
Gesucht wird nicht nach `multer(`, sondern nach Importen, Aliasen,
`.single`/`.array`, Browser-Dateilesern und Datei-/Bildinhalten in
Body-Feldern.

`routes/verify.js` hängt unter `/v`, ist CSRF-ausgenommen, öffentlich
erreichbar **und hat als einzige der sieben keinen `fileFilter`** — der Weg
mit der grössten Angriffsfläche.

### S2 — Reihenfolge: Bestand → Test mit Ausgangsbefund → Versionssprung → derselbe Test

Der Prüfer hat meine Gegenbehauptung („dann kann keine Zusicherung mehr
zeigen, dass der alte Stand verwundbar war") zu Recht als zu absolut
zurückgewiesen: entscheidend ist **derselbe Test gegen BEIDE gepinnten
Versionen**, nicht das Erstellungsdatum des Tests. Den Arbeitsbaum dafür
zurückzustufen scheidet aus.

`npm diff --diff=multer@2.3.0 --diff=multer@2.4.0 --diff-name-only` zuerst.

### S3 — Der Abbruch-Nachweis, und wann er ehrlich ungedeckt bleibt

Der schwierigste Teil. Der vorgeschlagene Weg (echte multer-Middleware, echte
`diskStorage`, ein In-Prozess-`http.IncomingMessage` mit reiner
Speicher-Socket-Attrappe, Abbruch NACH nachgewiesenem Schreibfortschritt) ist
ein **Vorschlag des Prüfers und selbst ein Befund, der nachgemessen gehört.**

Zwei Punkte daraus, die unabhängig von seinem Weg gelten:

- **Schreibfortschritt muss NACHGEWIESEN sein** (Datei existiert und hat mehr
  als null Bytes), bevor abgebrochen wird. Dass `destination` oder `filename`
  aufgerufen wurde, genügt nicht.
- **Eine Zeitüberschreitung ist ein FEHLER, kein Erfolg.**

**Und die Abbruchbedingung:** Bleibt der Lauf gegen das gepinnte 2.3.0
ebenfalls sauber, ist der CVE-Nachweis ungedeckt — dann wird die Suite NICHT
mit „Abbruch abgedeckt" beschriftet, sondern der Punkt als ungedeckt geführt.

### S4 — Zusicherungen mit einem echten Testvertrag

„Abgelehnt" und „geht durch" reichen nicht. Gemessen vom Prüfer, von mir noch
nicht nachgeprüft:

- `routes/belehrungen.js:1971-1975` beantwortet einen Uploadfehler mit
  `res.send(...)` — **ohne Fehlerstatus**.
- `routes/lageplan.js` leitet bei Fehler UND bei Erfolg weiter.
- `routes/lageplan.js:68` verwirft einen falschen Typ mit `cb(null, false)` —
  **kein geworfener Fehler**.

Ein Test auf „kein Fehler", HTTP 200 oder „wurde weitergeleitet" kann also die
falsche Aussage bestätigen. Der Vertrag lautet stattdessen je Fall:

- exakter Fehlergrund, nicht irgendein Fehler,
- bei Ablehnung: keine neue DB-Zuordnung, keine neue dauerhafte Datei, der
  vorhandene Nachweis unverändert,
- bei Erfolg: die erwartete Datei UND die mandantenrichtige DB-Zuordnung,
- Inhaltsprüfung getrennt von Metadatenprüfung (Nicht-PDF mit
  `application/pdf` und `.pdf` gegen echtes PDF).

**Sollgrössen literal und unabhängig in den Test**, nicht aus derselben
Produktionskonstante — sonst bemerkt der Test eine versehentliche Lockerung
genau dieser Konstante nicht.

**Und:** da alle sieben bereits `fileSize` tragen, sind Grössenzusicherungen
Bestandsschutz — sie belegen keine neue Härtung und erst recht nicht den
CVE-Fix. Das gehört so beschriftet.

### S5 — NICHT in diesem Beitrag: der gefundene Integritätsfehler

`routes/belehrungen.js:1992-1994` schreibt den neuen Dateinamen in die DB,
danach folgen Freischaltung und Audit — und der gemeinsame Fehlerausstieg in
`:2001` löscht mit `if (req.file) fs.unlink(req.file.path, …)` **die Datei,
auf die die DB bereits zeigt**. Von mir am Quelltext nachgesehen: trifft zu.
Dieselbe Struktur beim Einweisungsweg (`:1438-1443` / `:1457`).

**Vorbestehend, nicht von diesem Beitrag verursacht.** Ein Gegenmodell steht
im Repo: `routes/admin/geraete.js:4839` benutzt ein `gespeichert`-Kennzeichen,
das das Löschen nach erfolgreichem UPDATE verhindert.

Wird als **datierter offener Punkt** geführt, nicht hier gebaut. Aber er ist
der Grund, warum eine neue Inhaltsprüfung oder eine verallgemeinerte
Aufräumlogik hier **nicht ohne Phasenmodell** eingebaut werden darf — sonst
verschlimmert dieser Beitrag genau den Fehler, den er nicht anfasst.

## Nachgemessen 18.09.2026 — alles selbst, nichts übernommen

### Was der Prüfer richtig hatte

- **Sieben multer-Konfigurationen.** Bestätigt, einschliesslich der beiden, die
  ein `grep "= multer("` nicht findet: `routes/module.js:1138` (`seilUpload`,
  Alias hinter einem Funktionsschalter) und `routes/sichtpruefung.js:148`
  (Ternär hinter `FOTOS_AKTIV`).
- **Elf Multipart-POST-Wege.** Die Zahl trägt, aber nicht so, wie ich sie
  gesucht hätte: es gibt nur ZEHN Middleware-Aufrufstellen. Die elfte Route
  entsteht, weil `routes/sichtpruefung.js:5508` in einer Schleife über
  `Object.keys(TYP_CONFIG)` registriert wird und `TYP_CONFIG` zwei Einträge hat
  (`cardio` → `/module/cardio-check/defekt/:id/foto`, `kraft` →
  `/module/kraft-check/defekt/:id/foto`). **Wer Aufrufstellen zählt, zählt
  nicht Wege** — genau die Klasse, vor der S1 warnt.
- **Alle drei Fehlerbehandlungsstellen aus S4.** `routes/belehrungen.js:1976`
  antwortet einen Uploadfehler mit `res.send(...)` ohne Statuscode, also
  HTTP 200; ebenso `:1988` („Keine Datei hochgeladen") und der `catch` bei
  `:2002`. `routes/lageplan.js:607` leitet bei Fehler UND Erfolg weiter, nur
  der `feedback=`-Parameter unterscheidet. `routes/lageplan.js:68` verwirft
  einen falschen Typ mit `cb(null, false)` — der Weg endet dann bei
  `feedback=upload_fehlt`, also **ununterscheidbar davon, dass gar keine Datei
  gewählt wurde**.

### Was mein eigener Plan falsch oder unvollständig hatte

1. **`routes/upload-limit-waechter.js` kommt im ganzen Plan nicht vor** — dabei
   ist er die einzige Grössengrenze SÄMTLICHER Nicht-multer-Wege. Er hängt vor
   den Body-Parsern (`server.js:160`), schaltet für `/module`,
   `/getraenkeanlage` und `/belehrungen` von 1 MB auf 4 MB hoch, aber nur für
   eine ECHTE Identität (Nicht-Tablet-Rolle oder PIN-entsperrtes Tablet), und
   fällt bei einem DB-Fehler geschlossen zurück. Seine 4 MB sind mit echtem
   Chromium nachgemessen (realistischer Worst Case 650,7 KiB). **Ein Plan, der
   „Grenzen nachrüsten" sagt, ohne die vorhandene Grenze zu kennen, hätte
   entweder doppelt gebaut oder sie gelockert.**
2. **Die CSV-Eingänge sind je ZWEI, nicht einer** — Vorschau und Commit:
   `routes/admin/geraete.js:5731` und `:5812`,
   `routes/admin/mitarbeiter.js:519` und `:584`. Also vier statt zwei.
3. **Das Signaturbild ist NICHT ein Eingang, sondern ELF** über sechs Dateien:
   `routes/module.js:1343`, `:2550`, `:3392`, `:3532`, `:3603`, `:3717`,
   `routes/spuelplan.js:261`, `routes/getraenkeanlage.js:361`,
   `routes/sichtpruefung.js:2292`, `:3163`, `routes/belehrungen.js:739`.
   Alle elf liegen unter `/module`, `/getraenkeanlage` oder `/belehrungen` —
   **einzeln nachgesehen**, auch `/module/spuelplan` und der Tablet-Mount
   `/getraenkeanlage` (nicht `/admin/getraenkeanlage`, wo der Wächter NICHT
   griffe). Der Wächter deckt sie also ab.
4. **„Die vier Fehlerbehandlungs-Fundstellen aus S4"** — S4 nennt drei. Eigene
   Ungenauigkeit, keine verlorene Fundstelle.

### Neu gefunden, stand in keiner Fassung

- **Fünf der elf Unterschrift-Wege prüfen den Inhalt überhaupt nicht.**
  `routes/module.js:3392`, `:3532`, `:3603`, `:3717` und
  `routes/getraenkeanlage.js:361` prüfen nur auf Vorhandensein und schreiben
  den Rohwert in die DB. `routes/module.js:1343` und `routes/spuelplan.js:261`
  prüfen wenigstens `startsWith("data:image")`. Damit kann eine angemeldete
  Identität bis zu 4 MB beliebigen Text in eine Unterschriftsspalte schreiben.
  **Eigener Beitrag, nicht dieser** — es sind fünf Routen in zwei Dateien und
  die Frage, was mit Bestandszeilen geschieht, ist nicht nebenbei zu klären.
- **`core/pruefbericht.js:52-62` begründet `fieldSize: 25 MB` mit einem
  25-MB-Limit des urlencoded-/JSON-Parsers in `server.js` — das es seit dem
  03.09.2026 nicht mehr gibt.** Der Kommentar zitiert den damaligen
  `server.js`-Kommentar sogar wörtlich. Heute stehen dort 1 MB, und der
  Wächter hebt auf 4 MB. Lehrbuchfall „dieselbe Aussage an zwei Orten": die
  eine wurde korrigiert, die andere nicht. Der WERT mag vertretbar sein, seine
  BEGRÜNDUNG ist es nicht mehr.

### multer 2.3.0 → 2.4.0, aus `npm diff` gelesen

Geänderte Dateien: `storage/disk.js`, `index.js`, `lib/make-middleware.js`,
`storage/memory.js`, `lib/multer-error.js`, `lib/validate-limits.js` (NEU),
`package.json`, `README.md`.

- **WIDERLEGT — dieser Satz stand hier bis zum 18.09.2026 abends und war
  falsch.** Er lautete: „Der CVE-Fix sitzt in `storage/disk.js`: eine neue
  `flushingFiles`-WeakMap lässt `_removeFile` warten…". Nachgemessen: jene
  WeakMap wird ausschliesslich unter `if (that.flush)` befüllt, `opts.flush`
  ist ein **neues Feature** in 2.4.0, und wir setzen es nirgends.
  **Der echte Fix ist `abortCleanupDone` / `abortRemovedFiles` in
  `lib/make-middleware.js`** (`grep -c abortCleanupDone`: **0** in 2.3.0,
  **3** in 2.4.0). Der OSV-Text sagt es wörtlich: „file writes that complete
  **after** multer has already run its abort cleanup are not removed".
  Die vollständige Erklärung steht in `plaene/auftrag-upload-haertung.md`,
  Abschnitt A2 — **hier steht sie bewusst NICHT ein zweites Mal.**
  Gefunden hat den stehengebliebenen Widerspruch eine dritte Prüfspur, nachdem
  ich das Auftragspapier korrigiert und diesen Plan vergessen hatte: dieselbe
  Aussage an zwei Orten, eine nachgezogen, eine nicht — die häufigste
  Fehlerquelle dieses Projekts, diesmal von mir selbst erzeugt.
- **`lib/validate-limits.js` WIRFT** einen `TypeError`, sobald ein Limit weder
  nicht-negative Ganzzahl noch `Infinity` ist. **Alle sieben Konfigurationen
  bestehen das** — nachgesehen: sämtliche Limits sind Literale oder Produkte
  von Literalen (`MAX_FOTO_BYTES = 15 * 1024 * 1024`,
  `MAX_FOTOS_PRO_UPLOAD = 8`), **kein einziges kommt aus `process.env`.** Das
  war der Bruchfall, den es zu messen galt: ein `parseInt(process.env.X)` auf
  `NaN` hätte den Serverstart geworfen.
- **`MulterError` bekommt ein drittes Argument** (`file.originalname`).
  Zusicherungen, die auf den Fehlertext prüfen, können sich daran stossen.
- **`wrappedFileFilter` reserviert den Zählplatz jetzt synchron** und gibt ihn
  bei Ablehnung zurück. Für `upload.array("fotos", 8)` in
  `routes/sichtpruefung.js` ist das eine echte Verhaltensänderung.

### Prüfstand

`postMultipart` gibt es bereits, aber **datei-lokal** in
`test_feature_pruefbericht.js:147`. Eine zweite Kopie verbietet sich; der
Helfer wird herausgelöst.
