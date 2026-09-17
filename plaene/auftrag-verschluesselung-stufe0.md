# Auftrag: Verschlüsselung Stufe 0+1 — Art.-9-PDF flüchtig machen, Schlüsselstand messbar machen

Repo: `/home/user/gymdocu` (Stand: `master`, 549a5ee). Eigener Zweig:
`claude/verschluesselung-stufe0`.

Hintergrund in einem Satz: Die Gesundheitsdaten des Verbandbuchs (Art. 9 DSGVO)
liegen heute doppelt im Klartext auf der Platte — in der Datenbank UND als
dauerhaftes Einzel-PDF. Dieser Auftrag räumt die PDF-Hälfte ab; die Datenbank-
Hälfte folgt in einem eigenen Beitrag.

## Was gemessen ist (vom Haupt-Agenten, wörtlich — nachprüfen, nicht glauben)

1. `core/pdf-engine.js:2363` `generateVerbandbuchEintragPDF()` schreibt über
   `createDocument(..., \`${studioId}/Verbandbuch\`, ...)` eine **dauerhafte**
   Datei unter `<PDF_ROOT>/<studioId>/Verbandbuch/Verbandbuch_Eintrag_<id>.pdf`.
2. Aufrufer im Produktivcode sind **genau zwei**, beide in
   `routes/verbandbuch-admin.js`:
   - `:447` (Route `GET /eintrag/:id/pdf`) → `res.download(abs, …)`, danach
     bleibt die Datei liegen.
   - `:462` (Route `POST /eintrag/:id/pdf-geschuetzt`) → qpdf liest `abs`,
     liefert eine Kopie aus `os.tmpdir()` aus und räumt NUR diese Kopie auf;
     das Original unter PDF_ROOT bleibt liegen.
3. Niemand sonst liest diesen Ordner. Einziger weiterer Bezug im Produktivcode:
   `core/retention.js:319-321`, `fileResolver` der Regel
   `verbandbuch_eintraege` — er löscht die Datei nach **5 Jahren** zusammen mit
   dem Datenbankeintrag.
4. `PDF_ROOT` wird von `server.js:730` per
   `app.use("/pdf", pdfWaechter, express.static(PDF_ROOT))` ausgeliefert.
5. `server.js:118-123` warnt in Produktion nur auf der Konsole, wenn
   `TOTP_ENC_KEY`/`APP_ENC_KEY` fehlt. Von aussen ist nicht feststellbar, ob der
   Schlüssel gesetzt ist.
6. `routes/health-intern.js` ist tokengeschützt (`X-Bezirk-Token`), liefert JSON
   und wird alle 5 Minuten gepollt.

## A — Das Einzel-PDF wird flüchtig

**Ziel:** Nach einem Download bleibt keine Verbandbuch-PDF-Datei mehr unter
PDF_ROOT liegen. Der Benutzer merkt keinen Unterschied.

**Weg (bewusst so und nicht anders):** Die Erzeugerfunktion in
`core/pdf-engine.js` wird NICHT angefasst — sie ist geteilt und getestet.
Geändert werden die beiden Routen in `routes/verbandbuch-admin.js`: nach dem
Ausliefern wird die erzeugte Datei gelöscht.

- Route `GET /eintrag/:id/pdf`: `res.download(abs, name, callback)` — der
  Callback feuert bei Erfolg, Fehler UND Client-Abbruch (dieselbe Zusage, auf
  die sich die qpdf-Route drei Zeilen weiter unten schon heute stützt). Im
  Callback die Datei löschen, Fehler beim Löschen schlucken (`try/catch`), aber
  auf stderr melden.
- Route `POST /eintrag/:id/pdf-geschuetzt`: zusätzlich zum bestehenden
  `cleanup()` der tmp-Kopie auch das Original unter PDF_ROOT löschen — und zwar
  in ALLEN Ausgängen dieser Route, auch im qpdf-Fehlerfall (`if (qerr)`) und im
  `catch` aussen. Zähle die Ausgänge, bevor du schreibst, und nenne sie im
  Bericht.
- Löschen NUR über denselben Riegel, den `core/retention.js` benutzt: der Pfad
  muss unter PDF_ROOT liegen. Baue den Riegel NICHT nach — prüfe zuerst, ob
  `findeLoeschWurzel()` aus `core/retention.js` exportiert ist oder exportiert
  werden kann, ohne dass `routes/` → `core/` eine neue Abhängigkeitsrichtung
  aufmacht (die Richtung `routes/` → `core/` ist erlaubt, `core/` → `routes/`
  nicht). Wenn er nicht erreichbar ist, melde das und schlage vor, statt zu
  raten.

## B — Der Retention-Report darf davon nicht dauerhaft gelb werden

`core/retention.js` zählt eine nicht vorhandene Datei als eigenen dritten
Zustand (`dateienFehlend`, s. `:988-991` und die Korrekturblatt-Queue bei
`:795-806`). Nach Änderung A ist „Datei fehlt" für `verbandbuch_eintraege` der
**Normalfall**, nicht ein Befund.

**Aufgabe:** Miss zuerst, wohin `dateienFehlend` fliesst — Logzeile, Rückgabe,
Report, Alarm? Dann sorge dafür, dass dieser Normalfall nicht als Auffälligkeit
erscheint, OHNE die Erkennung für die anderen Regeln (`pdf_archiv`,
Korrekturblätter, Dokumente) abzuschwächen. Der `fileResolver` der Regel bleibt
bestehen — er räumt den **Altbestand** ab, der heute schon auf der Platte liegt.

Schreibe die Begründung als Kommentar an die Regel, samt Datum und dem Hinweis,
dass die Datei seit diesem Beitrag flüchtig ist. Sonst räumt sie jemand als
„toter Resolver" wieder weg.

## C — Altbestand: ein Aufräumskript für den Betreiber

Neu: `ops/gymdocu-verbandbuch-pdf-aufraeumen.sh` (oder `.js`, wenn das besser
passt — begründe die Wahl).

- Löscht `<PDF_ROOT>/<studio>/Verbandbuch/*.pdf` für alle Studios.
- **Probelauf ist der Standard**, Löschen nur mit `--wirklich`. Vorbild:
  `ops/pdf-loeschung-probelauf.js` — sieh es dir an und halte dich an dessen
  Muster, statt ein eigenes zu erfinden.
- Zählt und meldet: gefunden, gelöscht, Fehler. Bricht ab, wenn `PDF_ROOT`
  nicht gesetzt/vorhanden ist — statt im leeren Verzeichnis „0 gelöscht, alles
  gut" zu melden („leeres Ergebnis ist nicht sauberes Ergebnis").
- Rührt NICHTS ausserhalb `<PDF_ROOT>/*/Verbandbuch/` an. Derselbe Wurzelriegel
  wie in A.
- Das Skript wird hier **nicht** gegen ein echtes Verzeichnis gefahren. Es wird
  gegen eine Attrappe geprüft (eigenes temporäres PDF_ROOT), niemals gegen
  `/var/www`.

## D — Stufe 1: Schlüsselstand im Health-Endpunkt

`routes/health-intern.js` bekommt im JSON ein Feld, das sagt, **ob** ein
Anwendungsschlüssel gesetzt ist — über `require('../core/secret-crypto').hatSchluessel()`.

Unverhandelbar:
- **Kein Schlüsselmaterial, kein Präfix, keine Länge, kein Hash.** Nur `true`
  oder `false`.
- **NICHT in `degraded` einrechnen.** Der Health-Endpunkt hängt am Deploy-Gate
  (`ops/health-gate.sh`); wäre der Schlüssel nicht gesetzt, würde jeder Deploy
  scheitern und das Gate wäre dauerhaft rot, obwohl der Betrieb läuft. Die
  Auskunft ist eine Auskunft, kein Riegel.
- Zusicherung, dass das Feld im JSON steht und beide Werte annehmen kann.

## Zusicherungen — was geprüft gehört

Neue Testdatei oder Erweiterung einer bestehenden, deine Wahl; begründe sie.

Pflicht, jede einzeln mit Gegenprobe (Defekt einbauen → ROT messen → zurück →
GRÜN messen), Zahlen wörtlich im Bericht:

1. Nach `GET /eintrag/:id/pdf` existiert die Datei unter PDF_ROOT **nicht mehr**
   — und der Download hat trotzdem den vollständigen PDF-Inhalt geliefert
   (Länge > 0 und PDF-Kopf `%PDF`). Beide Hälften, nicht nur eine: eine Route,
   die gar nichts mehr liefert, erfüllt „Datei ist weg" ebenfalls.
2. Dasselbe für `POST /eintrag/:id/pdf-geschuetzt` — **und** für dessen
   Fehlerausgang (qpdf schlägt fehl): auch dann bleibt nichts liegen.
3. Der Löschriegel greift: ein Pfad ausserhalb PDF_ROOT wird nicht gelöscht.
4. Der Retention-Lauf meldet für einen Verbandbuch-Eintrag ohne Datei **keine**
   Auffälligkeit, für `pdf_archiv` ohne Datei aber weiterhin schon. Beide
   Richtungen — sonst hast du die Erkennung abgeschaltet statt sie zu
   differenzieren.
5. Das Aufräumskript: gegen eine Attrappe mit drei Dateien in zwei Studios plus
   einer Datei ausserhalb von `Verbandbuch/`. Probelauf löscht nichts;
   `--wirklich` löscht genau die drei und die vierte bleibt.
6. Health-JSON: Feld vorhanden; mit gesetztem Schlüssel `true`, ohne `false`;
   `degraded` ändert sich dadurch NICHT.

**Zwei Fallen, die in diesem Repo schon zugeschlagen haben:**
- Eine Zusicherung, deren Sollwert aus derselben Quelle stammt wie der geprüfte
  Wert, ist keine. Die Erwartung wird literal hingeschrieben.
- `qpdf` ist womöglich nicht installiert. Prüfe das, bevor du einen Test darauf
  baust; ein Test, der still übersprungen wird, meldet „grün" und hat nichts
  geprüft. Wenn qpdf fehlt: stubben und den Stub als Beweis nehmen, dass das
  Richtige aufgerufen wurde.

## Ausdrücklich NICHT in diesem Auftrag

- Keine Feldverschlüsselung der Datenbankspalten (eigener Beitrag).
- Keine Änderung an `core/pdf-engine.js`.
- Keine Verschlüsselung anderer PDFs, Fotos oder des Offboarding-ZIP.
- Nichts am echten Dateisystem ausserhalb temporärer Testverzeichnisse; kein
  `pm2`, kein `nginx`, kein `/var/www`. Dieselbe Suite läuft auf dem Live-Server
  als Deploy-Gate.

## Abschluss

- Volle Suite: `bash test/run.sh > /tmp/claude-0/suite-stufe0.log 2>&1; echo "SUITE_EXIT=$?"`
  — keine Pipe, kein äusseres `flock`.
- Dateizahl-Ritual: gelaufene gegen registrierte Dateien, `diff` EXIT 0.
- `git status` am Ende sauber ausser den gewollten Dateien; kein
  Gegenprobe-Rest. Mutationsskripte nehmen den Zielpfad als ARGUMENT, brechen
  bei ungleich einer Fundstelle ab und schreiben ihren Marker mit.
- Bericht: Diff-Übersicht, Testausgaben wörtlich, alle Gegenproben-Zahlen in
  beide Richtungen, und was du gemessen hast, das meinen Angaben oben
  widerspricht.
