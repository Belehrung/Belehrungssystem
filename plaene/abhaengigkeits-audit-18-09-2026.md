# Abhängigkeits-Audit, 18.09.2026

Gegenlesung mit Websuche über **alle 253 Laufzeitabhängigkeiten** aus
`package-lock.json` (Entwicklungsabhängigkeiten ausgeschlossen), mit exakter
installierter Version. Das ist etwas anderes als unsere CI-Prüfung: die meldet,
dass Updates verfügbar sind, nicht ob unsere konkreten Versionen angreifbar
sind.

**Jeder Befund unten ist von mir gegen ZWEI unabhängige Quellen gehalten
worden** (`npm audit --omit=dev` und die OSV-Datenbank über
`api.osv.dev/v1/vulns/<id>`). Was sich nicht bestätigen liess, steht als
unbestätigt da — nicht als widerlegt und nicht als Befund.

## Bestätigt und für uns ERREICHBAR

### multer 2.3.0 — CVE-2026-88932 / GHSA-3pph-fpjx-jg34

„multer vulnerable to Denial of Service via orphaned disk writes". Ein
abgebrochener Multipart-Upload kann bei `diskStorage` eine verwaiste Datei
hinterlassen; genug davon füllen die Platte.

- **In OSV bestätigt** unter der CVE-Kennung (die GHSA-Kennung allein liefert
  dort 404 — OSV führt den Eintrag unter der CVE, mit der GHSA als Alias).
- **`npm audit` meldet ihn NICHT.** Das ist der eigentliche Gewinn dieses
  Laufs: ohne die Gegenlesung hätten wir ihn nicht gehabt.
- Behoben in **2.4.0**, betroffen `>=2.2.0, <2.4.0` — wir haben 2.3.0.

**ERREICHBARKEIT — von mir gemessen, nicht geschätzt.** Der Prüfer konnte das
nicht entscheiden und hat das ehrlich so geschrieben. Sechs `multer()`-Aufrufe
im Repo, **vier davon mit `diskStorage`**, also im verwundbaren Pfad:

    core/pruefbericht.js:23        diskStorage
    routes/verify.js:21           diskStorage (os.tmpdir())
    routes/belehrungen.js:131     diskStorage (UPLOAD_DIR)
    routes/belehrungen.js:1005    diskStorage (EINWEISUNG_NACHWEIS_DIR)
    routes/lageplan.js:62         memoryStorage — nicht betroffen
    routes/sichtpruefung.js:149   memoryStorage — nicht betroffen

Damit fällt das mit dem offenen Punkt „Upload-Wege auf Dateityp und Grösse
prüfen" aus dem Härtungsprogramm zusammen. **Das ist der Punkt mit dem besten
Verhältnis von Aufwand zu Wirkung in diesem Audit.**

## Bestätigt, aber für uns NICHT erreichbar

### qs 6.15.3 — CVE-2026-82562 und CVE-2026-82417

Beide von **drei** Quellen bestätigt (Gegenlesung, `npm audit`, OSV — mit
vollständigen Versionsbereichen, behoben in 6.16.0). `qs` ist bei uns rein
transitiv (über Express/body-parser).

**ERREICHBARKEIT — von mir gemessen: NEIN, in beiden Fällen.**

- CVE-2026-82562 verlangt `qs.parse(..., { comma: true })`. Gemessen:
  `comma: true` kommt in `core/`, `routes/` und `server.js` **nullmal** vor,
  ebenso `allowPrototypes` und `plainObjects`.
- CVE-2026-82417 verlangt `qs.stringify()` auf einem angreiferkontrollierten
  Objekt. Gemessen: wir rufen `qs.stringify` **nirgends** auf und requiren `qs`
  überhaupt nicht selbst.

Trotzdem mitziehen, sobald `express`/`body-parser` es liefern — aber ohne
Eile und ohne eigenen Beitrag.

## Unbestätigt — nicht als Befund führen

### nodemailer 9.1.1 — fünf gemeldete Advisories

Die Gegenlesung nennt fünf GHSA-Kennungen, zwei davon „High" (quadratischer
Parseraufwand bzw. Regex-Backtracking im Adressparser → blockierter
Event-Loop).

**Nachgemessen, und das Ergebnis ist gemischt:**

- `npm audit` meldet für `nodemailer` **nichts**.
- Eine OSV-Versionsabfrage für `nodemailer@9.1.1` liefert **0 Treffer**.
- Vier der fünf GHSA-Kennungen liefern in OSV **404**.
- Die fünfte (`GHSA-prgh-xp8r-p3m5`) liefert ebenfalls 404, **aber OSV nennt
  dazu einen Alias: `CVE-2026-9077`, und dieser Datensatz EXISTIERT** — noch
  ohne Zusammenfassung, mit Commit- statt Versionsbereichen.
- `github.com/advisories` ist aus dieser Umgebung nicht erreichbar (HTTP 403
  vom Egress-Proxy), eine dritte Quelle steht also nicht zur Verfügung.

**Bewertung:** mindestens EIN nodemailer-Problem existiert wirklich, die
übrigen vier Kennungen sind von hier aus nicht prüfbar. Das ist kein Beleg
gegen sie — frische Advisories brauchen Tage, bis sie in allen Datenbanken
stehen. Es ist aber auch kein Beleg FÜR sie.

**Empfehlung:** `nodemailer` auf 10.x anheben, weil ein Hauptversionssprung
ohnehin ansteht und ein bestätigter CVE-Alias vorliegt — aber als eigener PR
(Hausregel „Majors gehören in einen eigenen PR"), mit `npm diff` vorab, und
ohne im Commit zu behaupten, fünf Lücken zu schliessen.

## Was dieser Lauf über die METHODE sagt

**Eine OSV-Versionsabfrage ist kein verlässliches Negativ.** Für
`multer@2.3.0` liefert sie 0 Treffer, obwohl der Datensatz existiert — er
trägt Commit-Bereiche statt npm-Versionsbereichen. Wer nur die Versionsabfrage
fährt, meldet „sauber" und meint „falsch gefragt". Dieselbe Klasse wie unser
„leeres Ergebnis ist nicht sauberes Ergebnis".

**Und `npm audit` ist keine vollständige Quelle.** Es hat den einzigen für uns
erreichbaren Befund des Tages nicht gemeldet.

**Der Prüfer hat sich dabei korrekt verhalten**, und das gehört festgehalten:
Er hat Namenstreffer ausdrücklich von Versionstreffern getrennt, bei jeder
Erreichbarkeitsfrage „nicht entscheidbar" geschrieben statt zu raten, einen
Advisory-Treffer für ein ähnlich heissendes Paket (`@pdfme/pdf-lib` statt
`pdf-lib`) ausdrücklich NICHT auf uns übertragen, und am Ende benannt, was er
nicht prüfen konnte. Die Erreichbarkeit haben wir dann selbst gemessen — das
ist die Arbeitsteilung, die funktioniert.

## Offen

- `multer` auf 2.4.0 — eigener Beitrag, zusammen mit den Upload-Wegen.
- `nodemailer` auf 10.x — eigener PR, `npm diff` vorab.
- `qs` 6.16.0 — mitziehen, wenn Express es liefert.
- Der Prüfer nennt zusätzlich Wartungsrückstände ohne belegten CVE
  (`yargs@15.4.1` drei Hauptversionen zurück, `@noble/ciphers@1.3.0` eine).
  **Nicht gemessen, nicht bewertet** — hier nur vermerkt.
