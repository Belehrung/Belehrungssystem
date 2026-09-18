# Auftrag: Die PIN-Sperre, die eine Dateiendung aushebelt — und zwei Ausgabelecks

Fassung 1 — 18.09.2026, abends. Verfasser: Haupt-Agent.

Drei Befunde aus zwei getrennten Gegenleser-Läufen (A2 „Pfade und
HTML-Ausgabe", C „Datenabfluss"), **jeder einzeln von mir am Quelltext
nachgemessen**. Bei einem ist meine Nachmessung ÜBER den Befund
hinausgegangen — dazu unten.

## Befund G1 — die Tablet-PIN-Sperre wird durch ein angehängtes `.js` umgangen

**Das ist der schwerste Befund des Tages.** Er betrifft nicht die
Mandantentrennung (die SQL-Bindung bleibt intakt), sondern die
AUTHENTIFIZIERUNG: der Riegel, der genau dafür da ist, wird durch drei Zeichen
in der URL wirkungslos.

### Die Kette, Glied für Glied — alle drei selbst gemessen

**Glied 1** — `routes/auth.js:1045-1047` vergibt eine Studio-Sitzung ganz ohne
Nachweis:

```js
router.get('/login/tablet', (req, res) => {
    if (req.session?.benutzer) return res.redirect('/');
    req.session.benutzer = { id: 0, name: 'Tablet', rolle: 'tablet', studio_id: req.studioId };
```

Das ist BEABSICHTIGT — der offene Tablet-Modus ist ein Produktmerkmal. Genau
deshalb gibt es die PIN-Sperre als zweite Stufe.

**Glied 2** — das Sperr-Gate in `server.js:767` lässt jeden Pfad durch, der
auf eine Asset-Endung endet:

```js
/\.(css|js|mjs|map|png|jpe?g|gif|svg|ico|webp|woff2?|ttf)$/i.test(p)
```

**Glied 3** — die dahinterliegenden dynamischen Routen normalisieren die
angehängte Endung weg. Gemessen:

```
parseInt("123.js", 10)  = 123
parseInt("123.jpg", 10) = 123
```

und `routes/belehrungen.js:725-733`:

```js
publicRouter.get('/vorschau/:id', async (req, res) => {
    const id  = parseInt(req.params.id, 10);
    const row = await db.one("SELECT dateiname FROM belehrungen WHERE studio_id = $1 AND id = $2", [req.studioId, id]);
    …
    res.sendFile(fp);
```

**Der Weg:** auf der Subdomain eines Studios `/login/tablet` aufrufen, dann
`/belehrungen/vorschau/123.js`. Die Endung passiert das Gate, `parseInt`
frisst sie, das PDF kommt. Ohne PIN, ohne Passwort, ohne Mitarbeiteridentität.

Dieselbe Form trifft mindestens noch: `/belehrungen/api/offen/<id>.js`
(personenbezogener Belehrungsstatus), `/module/defekt-foto/<id>.jpg`,
`/module/seil-foto/bild/<id>.jpg`.

**Was das IST und was es NICHT ist — und das gehört genau so gemeldet:** Es
ist eine Umgehung der PIN-Sperre, nicht ein Bruch der Mandantengrenze. Der
Angreifer bekommt eine Sitzung IM Zielstudio; alle Abfragen binden weiterhin
korrekt `studio_id`. Die Wirkung ist trotzdem erheblich, weil sie ohne
jeden Zugangsnachweis eintritt — aber wer sie als „fremde Mandantendaten"
meldet, beschreibt sie falsch.

**Bei ausgeschalteter Sperre** (Voreinstellung) ist ohnehin alles offen; dann
ist G1 ohne zusätzliche Wirkung. G1 trifft genau die Studios, die den Riegel
EINGESCHALTET haben — also die, die sich geschützt glauben.

### Die Behebung ist ein LÖSCHEN, und das ist gemessen, nicht geraten

Die naheliegende Reparatur wäre, das Muster zu verschärfen. Das ist nicht
nötig: **die Ausnahme ist vollständig überflüssig.** Alle Auslieferungen
echter Dateien liegen VOR dem Gate:

| Zeile in `server.js` | was |
|---|---|
| 713 | `app.use("/brand", express.static(…))` |
| 730 | `app.use("/pdf", pdfWaechter, express.static(PDF_ROOT))` |
| 738 | `app.use(require('./routes/offline'))` — liefert `/sw.js` |
| 739 | `app.use(express.static(path.join(__dirname, "public")))` |
| **744** | **hier erst beginnt das Tablet-Sperr-Gate** |

Eine Anfrage, die eine echte statische Datei meint, ist also längst
beantwortet, bevor das Gate überhaupt läuft. Die Endungs-Ausnahme kann
folglich NUR noch für Pfade greifen, die KEINE statische Datei sind — genau
die Angriffsfläche.

**Gegenprobe zu dieser Behauptung, ebenfalls gemessen:** Ich habe alle Routen
in `routes/` und `server.js` gesucht, deren Pfad auf eine dieser Endungen
endet — **null Treffer**. Es gibt also keine dynamische Route, die die
Ausnahme bräuchte. `/sw.js` kommt aus `routes/offline.js:45` und ist bei
Zeile 738 gemountet, also vor dem Gate.

**Zu bauen:** Die Regex-Zeile aus der Freipass-Liste in `server.js` ENTFERNEN.
Der Kommentar daneben nennt den Grund und die vier Mount-Zeilen, damit sie
niemand als „die hat doch sicher jemand gebraucht" wieder einsetzt.

**Wenn sich beim Bauen herausstellt, dass doch etwas sie braucht** — etwa weil
eine Anfrage an eine nicht existierende statische Datei heute absichtlich
stumm durchfällt statt auf dem Sperrbildschirm zu landen —, dann NICHT
heimlich wieder einsetzen, sondern melden. Der Ersatz wäre dann ein Freipass
auf PRÄFIXE (`/public/`, `/brand/`, `/sw.js`) statt auf Endungen; das ist
eine andere Entscheidung und braucht eine eigene Runde.

### Zusicherung für G1

Neue Datei oder Abschnitt in einem bestehenden Tablet-Sperr-Wächter:

1. **Der Angriffsweg selbst, mit eingeschalteter Sperre:** Sitzung mit Rolle
   `tablet` ohne Mitarbeiteridentität, Anfrage auf einen geschützten,
   dynamischen Pfad MIT angehängter Asset-Endung → muss auf dem
   Sperrbildschirm landen bzw. 401 bekommen, NICHT den Inhalt liefern.
2. **Die Gegenrichtung, damit der Riegel nicht einfach alles sperrt:**
   dieselbe Sitzung, Anfrage auf einen Pfad OHNE Endung → unverändertes
   Verhalten; und eine Anfrage auf eine ECHTE statische Datei (die vor dem
   Gate beantwortet wird) → kommt weiterhin an.
3. **Der Freipass-Liste ihre Bestandteile literal vorschreiben:** eine
   Zusicherung, die die erlaubten Ausnahmen des Gates gegen eine EIGENE,
   literal hingeschriebene Liste hält. Sonst fügt die nächste Runde eine neue
   Ausnahme hinzu und niemand merkt es.

**Gegenprobe:** Die Regex wieder einsetzen → Zusicherung 1 muss ROT werden.
Zahlen wörtlich melden.

## Befund G2 — gespeichertes Kategorie-Symbol wird als HTML ausgeführt

`routes/admin/geraete.js` schreibt das Symbol einer Wartungskategorie
ungeprüft aus dem Request in die Datenbank:

```js
let { name, symbol } = req.body;
…
symbol = symbol ? symbol.trim() : null;
```

(zwei Schreibwege: „kategorie/neu" und „kategorie/bearbeiten/:id"; die Spalte
ist freier `TEXT`, `core/db.js:777`). Der Emoji-Auswahlkasten im Formular
begrenzt einen selbst gebauten POST nicht.

**Ausgegeben wird es an DREI Stellen roh** — und die dritte hat der Prüfer
NICHT genannt; sie ist bei meiner eigenen Vollerhebung aller `.symbol`-Stellen
aufgefallen und sie ist die folgenreichste:

| Fundstelle | Ausgabe | wer sieht es |
|---|---|---|
| `routes/admin/geraete.js:4418` | `${k.symbol \|\| ''}` in einer `<option>` | Admins (Wartungsverlauf) |
| `routes/admin/geraete.js:4630` | dieselbe Zeile noch einmal | Admins (Wartungsarchiv) |
| **`server.js:1199`** | `'<span style="font-size:18px">' + z.symbol + '</span>'` | **JEDER Benutzer des Studios — es ist der „Jetzt fällig"-Block der STARTSEITE** |

Der Wert stammt an der dritten Stelle aus `core/monatskontrollen.js`
(`symbol: g.symbol || "🛠️"`, gelesen als `k.symbol` aus `wartung_kategorien`)
— also dieselbe vom Admin schreibbare Spalte.

**Alle übrigen 15 Ausgabestellen maskieren korrekt** (`auditEsc` bzw.
`escapeHtml`) — das ist die Positivkontrolle, und sie zeigt zugleich, dass
hier nicht eine Regel fehlt, sondern drei Stellen sie brechen.

**Wirkung:** Ein Studio-Admin (2FA vorausgesetzt) kann Skript in den Browser
JEDES Benutzers desselben Studios legen. **Kein mandantenübergreifender
Zugriff** — das gehört dazugesagt. Die eigentliche Schwere liegt darin, dass
die Startseite betroffen ist: der Weg braucht kein Zutun des Opfers ausser
dem Aufruf der Startseite.

**Zu bauen:** An allen drei Stellen maskieren — `auditEsc(k.symbol || '')` in
`routes/admin/geraete.js`, `escHtml(z.symbol)` in `server.js` (die Funktion
ist dort bereits definiert, Zeile 815, und maskiert `& < > " '`; die
Nachbarzeilen benutzen sie schon für `z.text` und `z.sub` — nur `z.symbol`
wurde ausgelassen).

**Nicht zusätzlich eine Eingabevalidierung bauen.** Eine Whitelist erlaubter
Emojis wäre eine Produktentscheidung (welche Symbole darf ein Studio?) und
löst das Problem an der falschen Stelle. Maskiert wird bei der AUSGABE, weil
dieselbe Spalte an 18 Stellen ausgegeben wird und 15 davon es richtig machen.

### Zusicherung für G2

Ein Wächter, der die Ausgabe eines Symbols mit HTML-Nutzlast prüft — für
**alle drei** Stellen, nicht nur eine (wer EINEN Eintrittspunkt absichert, hat
nicht die Eintrittspunkte abgesichert). Nutzlast so wählen, dass sie im
maskierten Zustand unverwechselbar ist, und **nicht** ein Wort enthalten, das
die Seite ohnehin ausgibt.

Zusätzlich — und das ist der Teil, der die KLASSE schliesst statt der drei
Fälle: eine statische Zusicherung, die jede Ausgabe von `.symbol` in
`routes/`, `core/` und `server.js` gegen eine Maskierfunktion hält. Sie ist
das Gegenstück zum Mengen-Wächter der Upload-Härtung. Wenn das Muster dafür
nicht verlässlich formulierbar ist, sag das und liefere stattdessen die drei
Einzelzusicherungen plus eine literal hingeschriebene Liste ALLER
`.symbol`-Ausgabestellen mit Vermerk „maskiert / roh" — dann fällt eine neue
rohe Stelle wenigstens beim nächsten Lauf auf.

**Gegenprobe:** je Stelle die Maskierung einzeln zurücknehmen → die zugehörige
Zusicherung muss fallen, die anderen grün bleiben.

## Befund G3 — ein Prozentzeichen erzeugt HTTP 500

`routes/archiv.js:361-362`:

```js
${req.query.ok ? `<div class="success">${icon('check-circle')} ${escHtml(decodeURIComponent(req.query.ok))}</div>` : ''}
${req.query.err ? `<div class="error">${icon('x-circle')} ${escHtml(decodeURIComponent(req.query.err))}</div>` : ''}
```

Express hat Query-Werte bereits dekodiert. Die zweite Dekodierung ist nicht
nur überflüssig, sie kann werfen. Gemessen:

```
decodeURIComponent("%")  -> WIRFT: URIError URI malformed
Express liefert fuer ?ok=%25 den Wert: %
```

Also: `/admin/archiv?ok=%25` → `URIError` → globaler Fehlerhandler → HTTP 500
**und ein Telegram-Alarm**. Kein XSS (die Maskierung greift danach), kein
fremder Zugriff, keine dauerhafte Dienstverweigerung — aber ein Weg, mit dem
sich ein angemeldeter Benutzer beliebig Fehlalarme beim Betreiber auslösen
lässt, und ein Alarmkanal, der abstumpft, ist ein Sicherheitsproblem eigener
Art.

**Zu bauen:** die doppelte Dekodierung ersatzlos entfernen, den bereits
dekodierten Wert direkt maskieren. Zusicherung: `?ok=%25` liefert HTTP 200 und
zeigt das Prozentzeichen; `errorTracker.melde()` wird dabei NICHT gerufen (über
den vorhandenen Stub zählbar).

**Vor dem Bauen prüfen, ob dieselbe Form woanders steht.** Ein
`decodeURIComponent(req.query...)` oder `decodeURIComponent(req.params...)`
irgendwo sonst hat denselben Fehler. Such danach und melde, was du findest —
auch wenn du es in diesem Beitrag nicht mitänderst.

## Reihenfolge und Abgrenzung

G1 zuerst, allein committen — es ist der einzige der drei, der eine
Authentifizierung aushebelt, und ein Commit, der nur eine Zeile entfernt und
einen Wächter dazulegt, ist in der Historie wertvoller als einer, der drei
Dinge zugleich tut.

**NICHT in diesem Beitrag:** der offene Tablet-Modus selbst (`/login/tablet`
ohne Nachweis) — das ist eine Produktentscheidung des Betreibers, sie steht
ihm zu, und sie liegt ihm vor. **Ebenfalls nicht:** die Fotolöschung ohne
Audit-Eintrag; das ist ein eigener Befund und hängt an derselben
Produktfrage.

## Gegenproben-Ritual

Jede Mutation trägt den Marker `GEGENPROBE-` + `DEFEKT`, nimmt den Zielpfad
als ARGUMENT, bricht ab, wenn ihr Suchmuster nicht GENAU EINMAL passt, läuft
durch `node --check`, und wird gegen eine unabhängig angelegte `cp`-Kopie mit
`diff` (EXIT 0) zurückgenommen — nie `git checkout`, nie `git stash`.
