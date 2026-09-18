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
