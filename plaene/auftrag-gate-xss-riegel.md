# Auftrag: Die PIN-Sperre, die eine Dateiendung aushebelt — und zwei Ausgabelecks

Fassung 2 — 18.09.2026, nach der Planprüfung. Verfasser: Haupt-Agent.

**Der Gegenleser hat diesen Plan gesehen.** Urteil: „Fassung 1 ist noch nicht
baureif. Die drei Grundbefunde sind bestätigt … bei G1 ist das Entfernen der
Endungs-Ausnahme ebenfalls die richtige Sicherheitsrichtung — aber die
behauptete vollständige Folgenlosigkeit ist nicht belegt und teilweise
widerlegt." Sechs Befunde, alle selbst nachgemessen, **alle sechs getragen**,
zwei blockierend. Die BEFUNDE bleiben unverändert; geändert haben sich die
BEGRÜNDUNG und der Umfang.

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

**BERICHTIGT — meine Gegenprobe war falsch gestellt (Planprüfung, selbst
nachgemessen).** Fassung 1 behauptete: „Ich habe alle Routen gesucht, deren
Pfad auf eine dieser Endungen endet — null Treffer." Gesucht habe ich nach
Routen-LITERALEN. Es gibt aber sehr wohl eine dynamische Route, die echte
Dateien mit Asset-Endung liefert — die Endung steckt im PARAMETER:

```js
app.use("/module/lageplan", lageplanRoutes.tablet);        // server.js:1428 — NACH dem Gate
tabletRouter.get("/grundriss/:datei", async (req, res) => { // routes/lageplan.js:408
    const datei = path.basename(req.params.datei);
    … res.sendFile(p);
```

Die Dateien heißen `etage_<id>_<uuid>.jpg`. Das ist genau der Fehler, vor dem
unsere eigene Regel warnt: **erst das Muster an einer bekannten Fundstelle
lernen, dann damit suchen.** Ich habe es umgekehrt gemacht.

**Was daraus folgt, habe ich selbst nachgemessen — und es kehrt die Sache um:**
Die Seiten, die ein Grundrissbild einbinden, sind `/module/lageplan` und
`/module/lageplan/markieren` (`routes/lageplan.js:1551`, `:2408`, `:2533`).
Beide haben KEINE Endung, werden vom Gate also ohnehin abgefangen. Ein
gesperrtes Tablet kann die Seite gar nicht laden — es bekommt das Bild heute
aber trotzdem, wenn es die URL direkt aufruft. **Die Ausnahme ist dort kein
Arbeitsweg, sondern ein zweites Leck.** Das Löschen schliesst es mit.

Diese Entscheidung steht damit ausdrücklich im Papier, statt als unbemerkte
Nebenwirkung einzutreten: *Ein gesperrtes Tablet bekommt ab jetzt auch keine
Grundrissbilder mehr. Das ist gewollt.*

**Ein zweiter Static-Mount liegt ebenfalls NACH dem Gate** und war mir
entgangen: `app.use("/verbandbuch", express.static(…))` (`server.js:1436`).
Für die normalen URLs ist er redundant — der Wurzel-Mount in Zeile 739
beantwortet sie schon. Eine Abweichung bleibt bei der Gross-/Kleinschreibung
(Express-Mounts sind hier nicht case-sensitiv, das Dateisystem schon), also
etwa `/VERBANDBUCH/koerper_hinten.png`. Eine solche URL erzeugt die Oberfläche
nicht; das ist eine benannte Randbedingung, kein Befund.

**Zu bauen:** Den Operanden aus der Freipass-Liste in `server.js` entfernen —
**einschliesslich seines verbindenden `||`**. Nur die Regex-Zeile zu löschen
lässt ein `||` vor der schliessenden Klammer stehen und erzeugt einen
SYNTAXFEHLER (`server.js:766-767`). Das klingt banal und ist der zweite
blockierende Befund der Prüfung: „eine Zeile löschen" war als Anweisung
wörtlich falsch.

Der Kommentar daneben nennt den Grund, die vier Mount-Zeilen und die
Grundriss-Entscheidung, damit niemand die Ausnahme als „die hat doch sicher
jemand gebraucht" wieder einsetzt.

### G1 betrifft auch einen SCHREIBWEG — das erhöht die Schwere

Fassung 1 nannte nur Lesewege. Nachgemessen gilt die Kette auch für:

```js
router.post("/seil-foto/:sperreId", …            // routes/module.js:1143
    const sperreId = parseInt(req.params.sperreId, 10);   // :1148
    … seilFs.writeFileSync(seilPath.join(SEIL_FOTO_DIR, dateiname), jpg);
    … await db.one("INSERT INTO seil_defekt_fotos …
```

`POST /module/seil-foto/123.jpg` passt auf die Ausnahme. Damit ist nicht nur
Lesen, sondern **Datei- und Datenbankschreiben ohne PIN** betroffen. Eine
Mitarbeiteridentität verlangt der Handler nicht; der Urheber fällt auf
`"Tablet"` zurück. **Der CSRF-Schutz ist hier kein Ersatz:**
`core/csrf-schutz.js` vergleicht Origin/Referer mit dem Host — ein eigener
HTTP-Client sendet die passende Herkunft einfach mit.

**Folge für die Zusicherung:** Der Wächter muss einen SCHREIBWEG mitbewachen
und im Sperrfall **null Schreibaufrufe** verlangen — nicht nur einen
Statuscode. Ein 401 beweist nicht, dass nichts geschrieben wurde.

**Was NICHT dazugehört:** Die anderen `parseInt`-Routen hinter dem Gate
(`…/defekt/:id/reparatur`, `…/defekt/:id/foto`, `…/foto/:fotoId/loeschen`,
`/geraete-hinweise/:id/uebernehmen`) sind über G1 NICHT erreichbar: dort ist
das LETZTE Segment fest, eine Endung am mittleren ID-Segment lässt den Pfad
nicht auf `.jpg` enden, und eine Endung am festen Segment verhindert das
Routenmatching. Sie gehören nicht in den Befund und nicht in den Wächter.

### Eine REGRESSION, die das Löschen einführt — und die mitgebaut wird

Ohne Gegenmassnahme verschlechtert das Löschen die Anmeldung, und zwar
messbar aus dem Code:

```js
if (req.method === 'GET') { req.session.returnTo = req.originalUrl; }   // server.js:806-808
return res.redirect('/tablet/sperre');
```

Heute fällt ein fehlendes Favicon, Bild oder `.map` wegen seiner Endung durch
das Gate und endet in der normalen 404. **Nach dem Löschen** bekommt es
stattdessen den Redirect auf den Sperrbildschirm — **und überschreibt dabei
`session.returnTo`**. Nach der PIN landet der Benutzer dann auf der fehlenden
Ressource statt auf seiner Seite. Dass Browser solche Nebenanfragen von sich
aus stellen, steht im Repo bereits dokumentiert (`routes/auth.js:966-969`,
Favicon und apple-touch-icon beim Laden der Login-Seite).

**Zu bauen:** `returnTo` nur noch für NAVIGATIONS-Anfragen setzen, nicht für
Unteranfragen. Brauchbares Merkmal ist der `Accept`-Kopf (`text/html`) bzw.
`Sec-Fetch-Mode: navigate`; **welches davon verlässlich ist, gehört gemessen,
nicht geraten** — miss es und melde, was du genommen hast. Für JSON/XHR ist
der Fall bereits richtig gelöst (`server.js:783-788` antwortet 401 OHNE
`returnTo` zu setzen); das ist das Vorbild.

Zusicherung dazu: eine Bildanfrage im Sperrfall verändert `session.returnTo`
NICHT, eine Seitenanfrage schon.

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

**Die übrigen Ausgabestellen maskieren korrekt** (`auditEsc` bzw.
`escapeHtml`) — das ist die Positivkontrolle, und sie zeigt zugleich, dass
hier nicht eine Regel fehlt, sondern drei Stellen sie brechen.

**PRÄZISIERT (Planprüfung):** Fassung 1 schrieb „alle übrigen 15". Die Zahl
stammt aus einem `grep` nach `.symbol` und ist als INVENTUR nicht belastbar —
sie zählt auch Zuweisungen und Abfragen mit, nicht nur Ausgaben. Die Aussage
lautet deshalb: drei rohe Ausgaben gemessen, die übrigen gefundenen Ausgaben
maskiert. Wer eine belastbare Zahl braucht, erstellt die Inventur als Teil
des Wächters (unten), nicht als Behauptung im Fliesstext.

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

**Die Form steht NICHT nur an diesen zwei Stellen — gemessen sind es ZWÖLF**
(Planprüfung, Liste selbst nachzuprüfen): die beiden in `routes/archiv.js`,
dazu acht in `routes/auth.js` (`:1450`, `:1635`, `:1706`, `:1808`, `:1894`,
`:1895`, `:1912`, `:1978`), eine in `routes/betriebszeiten.js:434` und eine
in `routes/mitarbeiter-auth.js:256`. Eine zweite Dekodierung von `req.params`
gibt es nirgends.

**Alle zwölf werden in DIESEM Beitrag behoben** — es ist dieselbe Zeile in
zwölf Verkleidungen, und zwei davon zu reparieren hiesse, die Klasse offen zu
lassen und sich für erledigt zu halten. Jede einzelne vorher SELBST
nachlesen; eine gelieferte Liste ist ein Hinweis, kein Befund.

**Nicht mitändern** (andere Sache, sieht nur ähnlich aus):
`routes/pdf-waechter.js:83` dekodiert das rohe `req.path` und beantwortet
Dekodierfehler bereits mit 400; `core/wartung-middleware.js:92` dekodiert
einen Cookie-Wert MIT Fehlerbehandlung.

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
