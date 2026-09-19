# Auftrag: Fremde IDs aus dem Request ohne Besitzprüfung (Mandantengrenze)

Fassung 2 — 18.09.2026, nach der Planprüfung. Verfasser: Haupt-Agent.

**Der Gegenleser HAT diesen Plan gesehen** (Lauf „PLANPRUEFUNG Mandantengrenze
Fremd-IDs", nachdem das Guthaben nachgelegt war). Sein Urteil lautete: „Den
Plan nicht unverändert freigeben." Sechs Befunde, alle selbst nachgemessen,
**alle sechs getragen** — drei davon widerlegen ausdrückliche Behauptungen der
Fassung 1. Was sich dadurch geändert hat, steht unten jeweils an Ort und
Stelle; die wichtigste Änderung ist das Testkonzept, das in Fassung 1 eine
ganze Besitzgrenze ungeprüft gelassen hätte.

Die Klasse selbst ist unverändert bestätigt: beide Schreiblücken existieren,
beide Fundstellen wörtlich nachgelesen.

## Worum es geht

Zwei Schreibwege nehmen eine ID aus dem Request, die auf eine ANDERE Tabelle
verweist, und schreiben sie ungeprüft in eine Zeile. `studio_id` wird dabei
korrekt gesetzt — die Regel „jede Abfrage trägt `studio_id`" ist also formal
erfüllt, und genau deshalb fällt es nicht auf. Verletzt ist die Stufe
darunter: die Zeile verweist auf ein Objekt, das dem eigenen Studio nicht
gehört.

**Was ein Angreifer damit ERREICHT — und was NICHT.** Er erreicht einen
SCHREIBVORGANG über die Mandantengrenze hinweg: eine Zeile im eigenen
Mandanten, die auf ein fremdes Objekt zeigt. Er erreicht KEINEN Lesezugriff
auf fremde Daten; alle Lesestellen filtern auf `studio_id`. Die Einstufung
lautet deshalb: Integritätsbruch der Mandantengrenze, nicht Datenabfluss.
Das ist beim Melden so zu sagen und nicht zu dramatisieren.

## Das Muster, das im Repo bereits RICHTIG angewandt wird

Nicht erfinden — nachmachen. Drei Stellen im Bestand machen es vor:

`routes/getraenkeanlage.js` (`admin.post("/aufgabe")`):

```js
const { anlage_id, bezeichnung, intervall_tage } = req.body;
const a = await db.one("SELECT id FROM getraenkeanlagen WHERE studio_id=$1 AND id=$2", [req.studioId, anlage_id]);
if (!a || !bezeichnung || !bezeichnung.trim())
    return res.redirect("/admin/getraenkeanlage?feedback=aufgabe_fehlt");
await db.run("INSERT INTO getraenkeanlage_aufgaben (studio_id, anlage_id, bezeichnung, intervall_tage) VALUES ($1,$2,$3,$4)",
    [req.studioId, a.id, bezeichnung.trim(), parseInt(intervall_tage) || 7]);
```

Entscheidend sind ZWEI Dinge, und beide gehören übernommen:
1. Der Rohwert wird nachgeschlagen, `WHERE studio_id = $1 AND id = $2`.
2. Eingesetzt wird danach **das Ergebnis der Abfrage** (`a.id`), nicht der
   Rohwert. Das ist kein Schönheitsfehler: wer nachschlägt und danach doch
   den Rohwert einsetzt, hat eine Prüfung, die nichts erzwingt.

Zweites Vorbild, gleiche Datei, `tablet.post("/anlage/:anlageId")`: erst die
Anlage studiogebunden laden, dann die Aufgabe **zusätzlich an `anlage_id`
gebunden** nachschlagen.

Drittes Vorbild, direkt neben dem zweiten Befund: `schalteAlleFrei()` in
`routes/belehrungen.js` holt die Mitarbeiter-IDs gar nicht aus dem Request,
sondern per `SELECT … FROM mitarbeiter m WHERE m.studio_id = $1`.

## Befund 1 — `POST /admin/lageplan/api/position`

`routes/lageplan.js:787-799`, wörtlich:

```js
adminRouter.post("/api/position", async (req, res) => {
    const { etage_id, x_prozent, y_prozent, breite_prozent, hoehe_prozent, label } = req.body;
    const eId = parseInt(etage_id, 10);
    if (!eId) return res.status(400).json({ error: "ungültig" });
    …
    const r = await db.one(`
        INSERT INTO geraete_positionen (studio_id, etage_id, kategorie, x_prozent, y_prozent, breite_prozent, hoehe_prozent, label)
        VALUES ($1, $2, 'box', $3, $4, $5, $6, $7) RETURNING id
    `, [req.studioId, eId, x, y, b, h, lbl]);
    res.json({ id: r.id });
});
```

`eId` wird auf „ist eine Zahl" geprüft, nie auf „gehört diesem Studio".

**Warum es hier schlimmer ist als beim zweiten Befund:** `core/db.js` legt
die Tabelle mit

```sql
FOREIGN KEY (etage_id) REFERENCES etagen(id) ON DELETE CASCADE
```

an — der Fremdschlüssel bindet KEIN `studio_id`. Löscht Studio A seine Etage,
verschwinden damit auch die Zeilen, die Studio B daran gehängt hat.

**BERICHTIGT gegenüber Fassung 1 (Planprüfung, selbst nachgemessen).** Dort
stand: „Ein fremder Mandant kann also indirekt Zeilen eines anderen löschen."
Das dreht die Wirkungsrichtung um. Richtig ist: B hängt eine EIGENE Zeile an
eine fremde Etage, und diese EIGENE Zeile von B verschwindet, wenn A seine
Etage löscht. B kann damit **nicht** reguläre Zeilen von A löschen — er kann
weder deren `studio_id` setzen noch die fremde Etage über die Löschroute
erreichen (`routes/lageplan.js:611` bindet `studio_id`). Der
mandantenübergreifende Kaskadeneffekt ist real; ein auslösbarer Löschangriff
gegen fremde Bestände ist es nicht. Wer die falsche Fassung weiterträgt,
begründet den Beitrag mit einer Wirkung, die es nicht gibt.

**Behebung:** vor dem INSERT

```js
const etage = await db.one("SELECT id FROM etagen WHERE studio_id = $1 AND id = $2", [req.studioId, eId]);
if (!etage) return res.status(404).json({ error: "Etage nicht gefunden" });
```

und den geprüften Wert einsetzen.

**DAZU GEHÖRT EINE ÄNDERUNG IM BROWSER — sonst verschluckt die Oberfläche die
neue Ablehnung** (Planprüfung, selbst nachgemessen). `api()`
(`routes/lageplan.js:1460-1469`) liefert bei einem 404 ein ganz normales
Objekt zurück: `{ httpOk: false, httpStatus: 404, error: … }` — `fetch()`
scheitert bei einem 404 nicht. Der Aufrufer `bindPlace()` (`:1858-1876`)
prüft danach nur `if (res.id){ … }` und überspringt bei einer Ablehnung seinen
gesamten Erfolgszweig **stumm**: keine Meldung, kein Neuladen. Der Admin tippt
auf den Plan, und es passiert nichts.
Zu bauen ist deshalb im selben Beitrag: `bindPlace()` wertet `!res.httpOk`
aus und zeigt eine Meldung. Dafür gibt es `httpOk`/`httpStatus` bereits —
sie wurden in einer früheren Prüfrunde genau für diesen Zweck eingeführt und
bisher an dieser Stelle nicht benutzt.

**Antwortcode:** 404, nicht 403 — aber aus dem richtigen Grund.

**BERICHTIGT (Planprüfung, selbst nachgemessen).** Fassung 1 begründete das
mit „ein 403 bestätigt dem Fragenden, dass die ID existiert". Das ist zu
absolut: nicht der Statuscode entscheidet, sondern ob die beiden Fälle
UNTERSCHEIDBAR beantwortet werden. Zwei gleiche 403 wären genauso dicht wie
zwei gleiche 404. Gegenbeispiel im eigenen Bestand:
`routes/pdf-waechter.js:107` antwortet 403, ohne vorher überhaupt zu prüfen,
ob die Datei existiert — dort ist nichts unterscheidbar.
Maßgeblich ist also die Regel: **fremd und nicht vorhanden bekommen dieselbe
Antwort.** 404 bleibt, weil `routes/getraenkeanlage.js:369` dieselbe Linie
fährt („Anlage nicht gefunden", 404) und weil die Route JSON liefert.

## Befund 2 — `POST /admin/belehrungen/freischalten/:belehrungId`

`routes/belehrungen.js:1950-1962`, wörtlich:

```js
adminRouter.post('/freischalten/:belehrungId', async (req, res) => {
    const { mitarbeiter_id, grund } = req.body;
    try {
        await db.run(`INSERT INTO belehrung_freischaltung (studio_id, mitarbeiter_id, belehrung_id, grund)
            VALUES ($1,$2,$3,$4) ON CONFLICT(studio_id, mitarbeiter_id, belehrung_id)
            DO UPDATE SET freigeschaltet_am=CURRENT_TIMESTAMP, grund=excluded.grund
        `, [req.studioId, mitarbeiter_id, req.params.belehrungId, grund || null]);
```

**ZWEI** fremde IDs, beide ungeprüft: `mitarbeiter_id` aus dem Rumpf,
`belehrungId` aus der URL. Im Tabellenblock (`core/db.js:1738-1746`) steht für
diese beiden Beziehungen nur `UNIQUE(studio_id, mitarbeiter_id,
belehrung_id)` — **kein** Fremdschlüssel auf `mitarbeiter` oder
`belehrungen`. Die Datenbank fängt für die beiden ZIELOBJEKTE also nichts ab.

**PRÄZISIERT gegenüber Fassung 1 (Planprüfung, selbst nachgemessen):** „die
Tabelle hat gar keine Fremdschlüssel" wäre zu pauschal. `core/db.js:2358-2372`
zieht nachträglich für jede Tabelle mit einer `studio_id`-Spalte einen
Fremdschlüssel auf `studios(id)` ein (Ausnahmen nur `qr_token`, `qr_charge`).
Das schützt die beiden Zielobjekte nicht — aber wer den pauschalen Satz
weiterträgt, wird bei der nächsten Schema-Frage falsch schließen. Ob diese
nachträgliche Härtung auf einer konkreten Bestandsdatenbank durchgegangen ist,
ist NICHT gemessen; Fehler werden dort nur geloggt.

Es gibt keine Kaskade, deshalb ist der Schaden kleiner als bei Befund 1: es
entstehen Zeilen im eigenen Mandanten, die auf fremde Objekte zeigen.

**Behebung:** beide nachschlagen, beide studiogebunden, und die Ergebnisse
einsetzen:

```js
const ma  = await db.one("SELECT id FROM mitarbeiter WHERE studio_id = $1 AND id = $2", [req.studioId, mitarbeiter_id]);
const bel = await db.one("SELECT id FROM belehrungen WHERE studio_id = $1 AND id = $2", [req.studioId, req.params.belehrungId]);
if (!ma || !bel) return res.redirect('/admin/belehrungen?feedback=anforderung_fehler');
```

Der bestehende `catch`-Zweig leitet bereits auf `feedback=anforderung_fehler`
um; die Ablehnung nimmt denselben Weg, damit keine neue Rückmeldung erfunden
wird, die es in der Oberfläche nicht gibt.

## Was AUSDRÜCKLICH NICHT gebaut wird

**Der Ausmusterungs-Token (früher „F3") ist KEIN Befund — gemessen, nicht
vermutet.** Die Vermutung lautete: `beanspruche()` setzt `verbraucht = true`,
bevor die Route siebzehn Zeilen später `daten.studioId !== req.studioId`
prüft; ein Fremder könne damit einen laufenden Vorgang verbrennen.
Nachgemessen fällt das aus zwei Gründen:

1. Die Token-ID ist `crypto.randomBytes(32).toString('hex')` — 256 Bit. Sie
   ist nicht zu erraten, und sie steht nirgends, wo ein anderer Mandant sie
   sähe.
2. Das Verhalten ist beabsichtigt und im Kopfkommentar von `beanspruche()`
   ausdrücklich begründet („ein zweiter Versuch mit demselben Token wäre so
   oder so falsch").

Er wird deshalb nicht angefasst. Wer ihn später doch anfasst, muss zuerst
zeigen, wie ein Fremder an die ID kommt.

## Zusicherungen — und wie sie ROT werden müssen

**Dieser Abschnitt ist gegenüber Fassung 1 VOLLSTÄNDIG ERSETZT.** Die
Planprüfung hat darin einen blockierenden Fehler gefunden, und sie hat ihn
mit einem wörtlichen Einzeiler belegt statt ihn zu behaupten. Das ist genau
die Klasse, vor der unsere eigene CLAUDE.md an sieben Stellen warnt — und sie
stand im Testkonzept, nicht im Code.

**Der Fehler der Fassung 1:** Sie verlangte je Weg drei Zusicherungen, darunter
„fremder Fall: ID eines ZWEITEN Studios → keine Zeile". Bei
`POST /freischalten/:belehrungId` gibt es aber **zwei unabhängig wählbare
Ziel-IDs**. Ein Test, der nur „beide eigen" und „beide fremd" prüft, erfüllt
den Wortlaut der Fassung 1 vollständig — und lässt eine ganze Besitzgrenze
ungeprüft. Der Beleg ist dieser Einzeiler, der die Belehrungsprüfung durch
eine Attrappe ersetzt:

```js
const bel = { id: req.params.belehrungId };
```

Damit bleiben alle drei Zusicherungen der Fassung 1 grün: der gute Fall
schreibt, der beidseitig fremde Fall scheitert weiterhin an `!ma`, und die
geschriebene Zeile trägt die erwartete ID. Offen bleibt: **ein Admin
verknüpft seinen EIGENEN Mitarbeiter mit einer FREMDEN Belehrung.**

### Was stattdessen gebaut wird

Neue Testdatei `test_feature_mandantengrenze_fremd_ids.js`, registriert in
`test/run.sh`.

**Für `POST /freischalten/:belehrungId` die volle Matrix — vier Fälle, nicht zwei:**

| Mitarbeiter | Belehrung | Erwartung |
|---|---|---|
| eigen | eigen | Zeile entsteht |
| fremd | eigen | Ablehnung, KEINE Zeile |
| eigen | fremd | Ablehnung, KEINE Zeile |
| fremd | fremd | Ablehnung, KEINE Zeile |

Die beiden mittleren Zeilen sind der ganze Punkt. Und: **die beiden Prüfungen
werden in der Gegenprobe EINZELN mutiert** — erst die Mitarbeiterprüfung
entfernen und messen, welche Fälle fallen, dann die Belehrungsprüfung. Wer nur
beide zusammen herausnimmt, kann nicht unterscheiden, ob eine von ihnen
überhaupt etwas tut.

**Achtung beim Ergebnisvergleich:** Erfolg und Ablehnung antworten auf diesem
Weg BEIDE mit HTTP 302 (`res.redirect` in beiden Zweigen). Ein Test, der nur
den Statuscode prüft, prüft nichts. Geprüft wird deshalb (a) das
Redirect-ZIEL, das sich zwischen Erfolg und Ablehnung unterscheidet, UND
(b) die Zeilenzahl in `belehrung_freischaltung` per `SELECT count(*)`, vorher
und nachher. Die Zeilenzahl ist dabei die tragende Zusicherung; das
Redirect-Ziel ist die Diagnose.

**Für `POST /api/position` (JSON):** eigener Fall → `200` mit `id`; fremde
Etage → `404`, und `SELECT count(*)` auf `geraete_positionen` unverändert.

**Zwei Studios anlegen, nicht eines.** Gegen eine leere Datenbank schlägt
jedes Nachschlagen fehl, und „keine Zeile entstanden" wäre wahr, ob der
Riegel existiert oder nicht. Es braucht eine Etage bzw. eine Belehrung, die
WIRKLICH EXISTIERT und einem ANDEREN Studio gehört.

**IDs unverwechselbar wählen.** Nicht 1 und 2. Jede der vier Matrixzeilen
bekommt Werte, bei denen eine Verwechslung auffällt; der Test prüft vorab,
dass die fremde ID im eigenen Studio nicht vorkommt — sonst ist „abgewiesen"
womöglich nur „gibt es nirgends".

### Was NICHT mehr zugesichert wird, und warum

Fassung 1 verlangte als dritte Zusicherung: „der Rohwert wird nicht
eingesetzt — die Zeile trägt die ID aus der Nachschlage-Abfrage." **Das ist
als Sicherheitsaussage falsch, und die Planprüfung hat es belegt.** Nach einem
erfolgreichen `SELECT … WHERE studio_id = $1 AND id = $2` bezeichnet der
Rohwert DASSELBE Objekt wie das Abfrageergebnis — die Prüfung hat ja gerade
festgestellt, dass diese ID zu diesem Studio gehört. `etage.id` statt `eId`
einzusetzen ist Stilfrage, nicht Riegel.
Der eigene Bestand macht es an zwei Stellen genau so und ist dort korrekt:
`routes/lageplan.js:471-474` prüft `posId` studiogebunden und schreibt danach
`posId`. Wer Fassung 1 wörtlich genommen hätte, hätte diese Stelle als Befund
gemeldet — sie ist keiner.
Die Zusicherung entfällt deshalb ersatzlos. An ihre Stelle tritt die
Einzelmutation der beiden Prüfungen, die wirklich etwas beweist.

### Gegenprobe, wörtlich zu melden

Je Prüfung einzeln: herausnehmen, ROT messen (`EXIT`-Code und `PASS/FAIL`),
zurücknehmen, GRÜN messen. Beide Läufe wörtlich in den Bericht. Zusätzlich die
oben zitierte Attrappen-Mutation `const bel = { id: req.params.belehrungId };`
fahren und zeigen, dass der Fall „eigen/fremd" dabei ROT wird — das ist der
Nachweis, dass die neue Matrix den Fehler der Fassung 1 wirklich schließt.

Jede Mutation trägt den Marker `GEGENPROBE-` + `DEFEKT`, nimmt den Zielpfad
als ARGUMENT, bricht ab, wenn ihr Suchmuster nicht GENAU EINMAL passt, läuft
durch `node --check`, und wird gegen eine unabhängig angelegte `cp`-Kopie mit
`diff` (EXIT 0) zurückgenommen — nie per `git checkout` oder `git stash`.

### Ein Rennen, das bleibt — und das NICHT in diesem Beitrag gelöst wird

Zwischen dem neuen `SELECT` und dem `INSERT` kann die Etage gelöscht werden
(TOCTOU). Das ist gemessen und benannt, nicht übersehen: Der Fremdschlüssel
fängt den Fall ab (das INSERT scheitert, wenn die Elternzeile weg ist), und
gewinnt das INSERT, kaskadiert die Löschung die neue Zeile regulär weg.
**Beides gibt es heute schon**, mit und ohne Besitzprüfung. Für die
Mandantengrenze ist das Rennen ohne Belang — es eröffnet keinen Weg zu einer
fremden Etage. Ein echter Riegel bräuchte Transaktion samt Zeilensperre; das
ist ein eigener Beitrag, kein Nebensatz. Als offener Punkt festhalten.

## Wie vollständig die Suche nach dieser Klasse ist

Nicht „wir haben zwei gefunden", sondern: **51 Stellen angesehen, 2 offen.**
Die Zahl kommt aus einer mechanischen Erhebung über `routes/`, `core/` und
`server.js`: jede `INSERT INTO <tabelle> (…)`-Anweisung, deren Spaltenliste
eine Spalte auf `_id` enthält, die NICHT `studio_id` ist. Das sind 51. Davon
tragen 30 einen Request-Wert direkt im Parameter-Array; die habe ich einzeln
angesehen. Ergebnis:

- **Offen: zwei** — `routes/lageplan.js:796` und `routes/belehrungen.js:1953`
  (die beiden Befunde oben).
- **Geprüft und in Ordnung: der Rest.** Stichproben, die von aussen nach einer
  Lücke aussehen und keine sind, weil die Besitzprüfung ein paar Zeilen früher
  steht: `routes/admin/geraete.js:5486` (`kategorie_id` wird in Zeile 5430
  studiogebunden nachgeschlagen), `routes/sichtpruefung.js:3322` (`defekt`
  vorher geladen), `routes/module.js:1159` (`geraete_sperren` vorher geladen),
  `routes/spuelplan.js:309` (`stelle_id` stammt aus einer studiogebundenen
  Abfrage, nicht aus dem Request), `routes/verbandbuch.js:595` (IDs über
  `SELECT … WHERE studio_id = $1 AND name = $2` ermittelt),
  `routes/sichtpruefung.js:4550`.
- **Zwei UPDATE-Stellen, die eine Vorprüfung aussehen lassen, aber keine
  brauchen:** `routes/module.js:3541` und `:3725` setzen die fremde ID in ein
  `UPDATE … WHERE studio_id = $ AND id = $`. Eine fremde ID trifft dort keine
  Zeile; die Mandantengrenze hält also durch die WHERE-Klausel. Sie sind
  KEINE Befunde, obwohl eine Fundstellenliste sie zunächst so ausweist.

**Was diese Erhebung NICHT hergibt, und das gehört dazu:** Sie erfasst nur
Anweisungen, deren Parameter-Array den Request-Wert TEXTLICH enthält. 21 der
51 bekommen ihre Werte über Helferparameter (`retention`, `integritaet`,
`korrekturen`, `demo_daten`, `pdf-jobs` und andere); für die ist nicht
nachverfolgt, woher der Wert beim Aufrufer kommt. Ebenso wenig erfasst sind
`UPDATE`-Anweisungen, die eine Fremd-ID in `SET` schreiben, ohne sie in
`WHERE` zu binden. Beides bleibt offen und gehört als offener Punkt
festgehalten — nicht als „sauber" gemeldet.

## Abgrenzung

- Keine Migration. Der fehlende Fremdschlüssel auf `belehrung_freischaltung`
  und der studiolose Fremdschlüssel auf `geraete_positionen` sind ECHTE
  Schwächen, aber eine zusammengesetzte Fremdschlüsselbeziehung über
  `(studio_id, id)` verlangt einen zusammengesetzten UNIQUE-Index auf den
  Zieltabellen und trifft jeden Bestandsdatensatz. Das ist ein eigener
  Beitrag mit eigener Rückfallplanung, nicht ein Nebensatz in diesem.
  **Als offener Punkt in `docs/offene-befunde-31-08-2026.md` festhalten**,
  nicht stillschweigend weglassen.
- Keine Umgestaltung der beiden Routen im Übrigen.
- Keine weiteren Fundstellen ohne eigene Messung: eine Fundstellenliste ist
  ein Hinweis, kein Befund.

---

# NACHARBEIT (Fassung 3) — nach der Codeprüfung des fertigen Diffs

Der Beitrag ist gebaut (`claude/mandantengrenze-fremd-ids`, Commit `55ccf32`).
**Meine eigenen Prüfungen sind alle durch:** Suite selbst gefahren
(`SUITE_EXIT=0`, 12.280 PASS / 0 FAIL, unsere Datei 20/0), Dateizahl-Ritual
338 = 338 mit `diff` EXIT 0, `npm run lint` EXIT 0, Marker-Scan 6 (Sollwert),
Arbeitsbaum sauber, Zweig nicht hinter master.

**Die unabhängige Codeprüfung hat trotzdem vier Befunde geliefert, alle selbst
nachgemessen, alle zutreffend.** Drei davon sind DIESELBE Klasse, und es ist
unsere eigene Hausregel: *eine Zusicherung über eine ZAHL ist keine
Zusicherung über eine MENGE.* Die Testdatei zählt Zeilen und prüft nie,
WELCHE IDs gespeichert wurden.

Die Produktivbehebung selbst ist NICHT beanstandet — sie schliesst die
Schreibwege. Beanstandet ist ihre ABSICHERUNG.

## N1 — Die Matrix prüft nur Zeichenketten aus Formular-POSTs

`test_feature_mandantengrenze_fremd_ids.js` schickt M2 ausschliesslich über
`post()` aus `test/helfer/route-harness.js`, und der setzt
`Content-Type: application/x-www-form-urlencoded`. Damit kommt selbst die
numerische `maB` als ZEICHENKETTE an. Die Produktion nimmt aber auch JSON
(`server.js:161-167`, `express.json()` global).

**Die Mutation, die alle 20 Zusicherungen grün lässt:**

```js
const ma = typeof mitarbeiter_id === 'number' ? { id: mitarbeiter_id } : await db.one("SELECT id FROM mitarbeiter WHERE studio_id = $1 AND id = $2", [req.studioId, mitarbeiter_id]);
```

Beide Mitarbeiter-Negativfälle (`fremd/eigen`, `fremd/fremd`) bestehen
weiterhin — sie schicken ja Zeichenketten. Ein JSON-POST mit numerischer
fremder Mitarbeiter-ID schreibt die Fremdreferenz.

**Zu bauen:** Die Matrix zusätzlich als JSON fahren, mit ZAHL und mit
ZEICHENKETTE. Dazu als Negativfälle: Array, Objekt, `null`, fehlender Wert.
**Und ausdrücklich die Gegenrichtung zusichern:** eine EIGENE numerische ID
muss weiterhin FUNKTIONIEREN — sonst bliebe der umgekehrte Fehler (JSON-Zahlen
pauschal abweisen) ebenfalls grün.

## N2 — Die gespeicherte Zeile wird nie angesehen

**Die Mutation, die alle 20 Zusicherungen grün lässt** — `bel.id` durch
`ma.id` ersetzen:

```js
`, [req.studioId, ma.id, ma.id, grund || null]);
```

Der Positivfall erzeugt weiterhin GENAU EINE Zeile, die Negativfälle werden
weiterhin vorher abgewiesen. Gespeichert wird aber eine Mitarbeiter-ID in der
Belehrungs-Spalte. Die beiden ID-Räume sind unabhängig, und das Schema hat
dort keinen Fremdschlüssel (`core/db.js:1738-1746`) — die Zahl kann eine
fremde oder gar keine Belehrung bezeichnen.

**Zu bauen:** Nach dem Positivfall die geschriebene Zeile LESEN und
`mitarbeiter_id`, `belehrung_id` UND `grund` gegen die erwarteten Werte
halten. Für M1 dasselbe: die entstandene Position lesen und ihre `etage_id`
prüfen.

## N3 — Das Verhalten bei erneuter Freischaltung ist ungeprüft

**Die Mutation, die alle 20 Zusicherungen grün lässt** — `DO UPDATE` durch
`DO NOTHING` ersetzen. Der einzige erlaubte Aufruf im Test trifft noch keinen
Konflikt, also fällt nichts auf. Ein regulärer ZWEITER Aufruf würde danach
weder `grund` noch `freigeschaltet_am` aktualisieren und trotzdem Erfolg
melden.

**Zu bauen:** Denselben erlaubten Aufruf ein zweites Mal fahren, mit ANDEREM
`grund`, und zusichern: Zeilenzahl unverändert (ON CONFLICT greift), aber
`grund` aktualisiert und `freigeschaltet_am` neuer als vorher.

## N4 — Die Begründung des Antwortcodes ist nicht zugesichert

**Von ZWEI unabhängigen Spuren gefunden** (der Prüfung und mir selbst).

Der Beitrag begründet 404 statt 403 ausdrücklich damit, dass „fremd" und
„nicht vorhanden" ununterscheidbar bleiben sollen. Geprüft wird nur der
FREMDE Fall. **Die Mutation, die grün bleibt:**

```js
if (!etage) return res.status(404).json({ error: (await db.one("SELECT id FROM etagen WHERE id=$1", [eId])) ? "fremd" : "nicht vorhanden" });
```

Damit verrät die Antwort genau das, was 404 verbergen sollte — und kein Test
fällt.

**Zu bauen:** Beide Fälle prüfen — fremde existierende Etage UND eine ID, die
es NIRGENDS gibt — und zusichern, dass Statuscode UND Antwortrumpf
identisch sind. Für M2 entsprechend: beide Ablehnungen führen auf dasselbe
Ziel.

## N5 — Ein Kommentar der Testdatei stimmt nicht

Die Datei schreibt bei M2, die Zeilenzahl sei die tragende Zusicherung und
das Redirect-Ziel nur Diagnose. **Die Prüfung hat das widerlegt**, und zwar
an ihrem eigenen Befund: bei einer Mutation, die eine bestehende Zeile per
`ON CONFLICT DO UPDATE` verändert statt eine neue anzulegen, bleibt die
ZEILENZAHL grün und fällt das REDIRECT-ZIEL. Hier trägt also genau umgekehrt.

**Zu bauen:** Den Kommentar berichtigen. Beide sind tragend, keines ist bloss
Diagnose — und das ist der Grund, warum N2 überhaupt nötig ist.

## N6 — Die Browser-Ergänzung ist ungeprüft und unvollständig

`bindPlace()` wertet jetzt `!res.httpOk` aus. Zwei Lücken bleiben:

- **Netzfehler:** `api()` verwirft sein Promise, der asynchrone Klickhandler
  hat kein `catch`. Der neue Hinweis wird nie erreicht.
- **2xx ohne `id`:** `httpOk` ist wahr, `res.id` fehlt → weiterhin stilles
  Überspringen, also genau der ursprüngliche Befund. Das ist kein erfundener
  Fall: `api()` setzt keinen JSON-`Accept`-Header und folgt Weiterleitungen;
  eine Umleitung auf `/login` liefert mit 200 eine HTML-Seite
  (`routes/auth.js:938-963`).

**Die Mutation, die alle 20 Zusicherungen grün lässt:** `if (false && !res.httpOk) {`
— die gesamte neue Meldung abgeschaltet, kein Test fällt. Die Testdatei sagt
selbst, sie prüfe nur die Serverseite.

**Zu bauen:** Netzfehler abfangen; eine Erfolgsantwort ohne `id` ausdrücklich
als Fehlschlag behandeln; und beides mit eingespeistem `fetch`/`alert`
zusichern — **ohne echte Dienste, ohne echten Browserstart.** Bei unklarem
Ausgang NICHT automatisch wiederholen: die Position kann serverseitig bereits
angelegt sein.

## Gegenproben

Für JEDE der sechs Nachbesserungen die zugehörige, oben wörtlich genannte
Mutation fahren: ROT messen (`EXIT`-Code und `PASS/FAIL`), zurücknehmen, GRÜN
messen. Beide Zahlen wörtlich melden. Die Mutationen sind vorgegeben — nimm
genau diese, sie sind der Beleg, dass die Lücke wirklich geschlossen ist.

Marker `GEGENPROBE-` + `DEFEKT`, Zielpfad als ARGUMENT, Abbruch bei ≠ 1
Fundstelle, `node --check`, Rücknahme gegen eine unabhängig angelegte
`cp`-Kopie mit `diff` EXIT 0 — nie `git checkout`, nie `git stash`.

## Zweite Prüfspur — sechs WEITERE Befunde, keine Überschneidung

Über denselben Diff lief parallel eine zweite, unabhängige Prüfung mit einer
anderen Prüfrichtung. **Sie hat mit der ersten KEINEN einzigen Befund
gemeinsam.** Das bestätigt die Messung vom 13.09.2026 ein zweites Mal: zwei
Spuren finden verschiedene KLASSEN, nicht dieselben Fehler zweimal.

Was sie ausserdem geleistet hat, gehört dazu, weil es die Befunde unten erst
bewertbar macht: Sie hat **alle** Schreibwege in beide Tabellen aufgelistet
und einzeln geprüft (neun Stellen, alle gebunden) — einschliesslich einer
Namensfalle, an der ein `_id`-Suchmuster scheitert: `unterschriften` heisst
seine Fremdschlüssel `mitarbeiter` und `belehrung`, OHNE `_id`
(`core/db.js:1161-1162`). Auch dieser Weg ist geprüft und sauber. Ergebnis:
die beiden vom Beitrag geschlossenen Stellen waren wirklich die Ausreisser.

### N7 — Der Test schickt nie ein `studio_id`-Feld im Rumpf

**Die Mutation, die alle 20 Zusicherungen grün lässt:**

```js
const etage = await db.one("SELECT id FROM etagen WHERE studio_id = $1 AND id = $2", [req.body.studio_id || req.studioId, eId]);
```

`postJson()` schickt nur `etage_id`, `x_prozent`, `y_prozent`. Ein Feld
`studio_id` kommt in der ganzen Testdatei nicht vor, also ist der Rückfall
immer aktiv und M1 verhält sich unverändert. **Live wäre die Lücke wieder
offen:** ein Admin von A schickt `{"etage_id": <fremd>, "studio_id": <fremd>}`,
die Nachschlagung trifft, und der INSERT schreibt `studio_id = A` mit fremder
`etage_id` — exakt der Zustand vor dem Beitrag.

**Zu bauen:** Eine Anfrage MIT einem fremden `studio_id`-Feld im Rumpf, die
abgewiesen werden muss. Die Mandantenkennung kommt aus der Sitzung, nie aus
dem Rumpf — und genau das gehört zugesichert.

### N8 — Ein einzelnes Fremdstudio ist kein Allquantor

**Die Mutation, die alle 20 Zusicherungen grün lässt:**

```js
const etage = await db.one("SELECT id FROM etagen WHERE (studio_id = $1 OR studio_id = 1) AND id = $2", [req.studioId, eId]);
```

Die einzige Fremdprobe des Tests ist `etageB` aus dem selbst angelegten
Studio B. Eine Mutation, die einen ANDEREN Mandanten freistellt (etwa ein
Demo- oder Vorlagenstudio), ist per Bauart unsichtbar. Der Test sichert zu
„die Etage von Studio B wird abgewiesen", nicht „jede fremde Etage".

**Zu bauen:** Ein DRITTES Studio anlegen und die Fremdfälle mit BEIDEN
Fremdstudios fahren. **Ehrlich dazu:** das schliesst die Klasse nicht, es
verengt sie — eine Mutation, die genau das dritte Studio freistellt, bliebe
weiter unsichtbar. Es macht die naheliegende Form („ein fest verdrahtetes
Studio freistellen") aber teuer, und das ist der Gewinn. Diese Einschränkung
gehört als Kommentar an die Zusicherung, nicht verschwiegen.

### N9 — Der Wächter und der Absturz sind nicht unterscheidbar

**Der schwerwiegendste Befund dieser Spur, und er trifft eine Entscheidung,
die ICH in Fassung 2 getroffen habe.**

**Die Mutation, die alle 20 Zusicherungen grün lässt:**

```js
if (!ma) return res.redirect('/admin/belehrungen?feedback=anforderung_fehler');
```

— also `|| !bel` streichen. Durchgang: bei `eigen/fremd` ist `ma` gefunden,
der Wächter lässt durch, `bel` ist `null`, und `bel.id` wirft einen
`TypeError`. Der wird vom bestehenden `catch` gefangen und mündet in
DENSELBEN Redirect mit DEMSELBEN `feedback`, ohne dass eine Zeile entsteht.
Alle drei Zusicherungen des Falls bleiben grün.

**Die Ursache ist eine Vorgabe aus MEINEM Papier:** „Die Ablehnung nimmt
denselben Weg wie der bestehende catch-Zweig — keine neue Rückmeldung
erfinden." Das war richtig gemeint (keine Oberfläche erfinden, die es nicht
gibt) und macht Wächterpfad und Absturzpfad **beobachtungsgleich**. Eine
ergebnisorientierte Zusicherung kann zwei Pfade nicht trennen, die dasselbe
Ergebnis erzeugen.

**Und es wird schlimmer im Zusammenspiel mit einer ZWEITEN Entscheidung von
mir:** Fassung 2 hat die Zusicherung „der Rohwert wird nicht eingesetzt"
ersatzlos gestrichen, mit der Begründung, sie sei Stilfrage und keine
Sicherheitsaussage. Das stimmt für sich genommen weiterhin. Zusammen mit N9
ergibt es aber eine Falle: Eine spätere, völlig vernünftige Aufräumarbeit
(„nicht auf ein möglicherweise leeres Objekt zugreifen, nimm den Rohwert")
entfernt den unbeabsichtigten zweiten Riegel — und dann ist die Lücke offen,
alle Zusicherungen grün, und im Kopf der Testdatei steht ausdrücklich, dass
genau das erlaubt sei.

**Zu bauen — und zwar OHNE eine neue Rückmeldung in der Oberfläche zu
erfinden:** Der Test muss die beiden Pfade unterscheiden können, der Benutzer
nicht. Der billigste Weg: zusichern, dass die Ablehnung **ohne
protokollierten Fehler** erfolgt — der Absturzpfad ruft
`console.error('Freischalten-Fehler:', e)`, der Wächterpfad nicht. Also
`console.error` für die Dauer des Falls ersetzen und zählen: beim Wächterfall
**null** Aufrufe. Fällt der Wächter weg, wird daraus einer, und die
Zusicherung fällt.
Dazu den irreführenden Absatz im Kopf der Testdatei berichtigen: die
Rohwert-Frage ist keine Sicherheitsaussage, aber `bel.id` hier trotzdem nicht
gegen den Rohwert zu tauschen, solange N9 nicht anders abgesichert ist.

### N10 — Das Redirect-Ziel wird nur als Teilstring geprüft

`/feedback=anforderung_fehler/.test(location)` lässt angehängte
Unterscheidungsmerkmale durch. **Die Mutation, die grün bleibt:** an den
Redirect ein `&x=1` hängen, wenn die ID global existiert — ein Orakel über
fremde Bestände, unsichtbar für den Test.

**Zu bauen:** Das Ziel VOLLSTÄNDIG vergleichen, nicht per Teilstring.

### N11 — Die Browser-Änderung ist völlig ungeprüft

**Die Mutation, die alle 20 Zusicherungen grün lässt:**

```js
if (res.httpOk){   // statt: if (!res.httpOk){
```

Damit meldet JEDE erfolgreiche Platzierung „Platzieren fehlgeschlagen: 200"
und kehrt vor dem Anlegen zurück — **der Lageplan-Editor ist für alle Admins
aller Mandanten tot**, und kein Test zuckt. `httpOk` kommt in keiner
Testdatei des Zweigs vor ausser im Kommentar, der die Lücke einräumt.

**Die Begründung im Kopf der Testdatei („rein clientseitig, kein
Server-Testpfad") trägt NICHT — gemessen:** Das Repo hat genau dafür schon
ein Werkzeug. `test_feature_lageplan_sicherheit_static.js` liest
`routes/lageplan.js` per `fs.readFileSync` und prüft Eigenschaften des
eingebetteten Browserskripts; es ist in `test/run.sh:617` registriert.

**Zu bauen:** Den neuen Zweig dort statisch zusichern — Vorhandensein der
Prüfung, richtige Richtung (`!res.httpOk`), und dass der Erfolgszweig nicht
hinter dem `return` liegt. Kein Browserstart, keine echten Dienste.

### N12 — Der HÄUFIGSTE reale Fehlschlag bleibt weiterhin stumm

Der neue Hinweis deckt 400 und 404 ab. Den wahrscheinlichsten Fall deckt er
nicht: **die abgelaufene Admin-Sitzung bei offenem Lageplan-Tab.**

Gemessen, beide Glieder:

- `core/auth.js`: `requireLogin` hat einen JSON-Zweig
  (`req.xhr || req.headers.accept?.includes('application/json')` → 401 JSON).
  **`requireAdmin` hat ihn NICHT** — es macht `res.redirect('/login')`.
- `api()` ruft `fetch` ohne `redirect`-Option, also mit dem Vorgabewert
  `follow`. Ein 302 auf einen POST wird verfolgt und wird zu einem GET auf
  `/login`; der liefert **200 mit HTML**.

Folge: `r.ok === true` → `httpOk: true` → der neue Hinweis feuert NICHT;
`daten` ist `{}` → `res.id` fehlt → stilles Überspringen. Also genau das
Verhalten, das der neue Kommentar zu beheben beansprucht.

**Zu bauen (zwei kleine, aufeinander abgestimmte Änderungen):**
1. `api()` schickt zusätzlich `Accept: application/json`.
2. `requireAdmin` bekommt DENSELBEN JSON-Zweig wie `requireLogin` — nicht
   einen neuen erfinden, sondern den vorhandenen spiegeln.

Damit beantwortet eine abgelaufene Sitzung den Aufruf mit 401 JSON,
`httpOk` ist falsch, und der Hinweis erscheint.

**Das ist eine Verhaltensänderung in einem gemeinsam genutzten Modul** —
`core/auth.js` hängt vor jeder Admin-Route. Betroffen sind ausschliesslich
Aufrufer, die `Accept: application/json` senden, also unsere eigenen
`fetch`-Aufrufe; ein Browser-Seitenaufruf sendet das nicht und wird
weiterhin umgeleitet. **Miss das nach, statt es zu glauben:** zeige an einer
gewöhnlichen Admin-Seite, dass sie nach wie vor umgeleitet wird, und am
`fetch`-Weg, dass er 401 JSON bekommt. Trägt die Abgrenzung nicht, melde es
und baue NUR `redirect: 'manual'` in `api()` — das ist örtlich begrenzt.
