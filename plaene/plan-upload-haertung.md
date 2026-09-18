# Plan — Upload-Wege härten (Fassung 2, nach der ersten Planprüfung)

**Status: PLAN, noch kein Bauauftrag.**

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

## Was noch nachzumessen ist, bevor der Bauauftrag geht

Vom Prüfer gemeldet, von mir NICHT nachgemessen — als FUNDORTE zu behandeln,
nicht als Befunde:

- die elf Multipart-POST-Wege und ihre Verwender,
- die drei Nicht-multer-Eingänge samt separatem CSV-Commit-Eingang,
- die vier Fehlerbehandlungs-Fundstellen aus S4.

Erst danach geht ein Bauauftrag raus. **Die Zeilennummern oben sind vom
18.09.2026 und werden vor dem Bau neu gemessen.**
