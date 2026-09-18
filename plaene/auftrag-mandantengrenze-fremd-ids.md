# Auftrag: Fremde IDs aus dem Request ohne Besitzprüfung (Mandantengrenze)

Fassung 1 — 18.09.2026, abends. Verfasser: Haupt-Agent.

**Der Gegenleser hat diesen Plan NICHT gesehen. Grund in einem Satz (wie die
Regel es verlangt): Gegenleser nicht erreichbar, HTTP 429
`insufficient_quota` — das OpenAI-Guthaben ist erschöpft.**

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
verschwinden damit auch die Zeilen, die Studio B daran gehängt hat. Ein
fremder Mandant kann also indirekt Zeilen eines anderen löschen.

**Behebung:** vor dem INSERT

```js
const etage = await db.one("SELECT id FROM etagen WHERE studio_id = $1 AND id = $2", [req.studioId, eId]);
if (!etage) return res.status(404).json({ error: "Etage nicht gefunden" });
```

und im INSERT `etage.id` einsetzen, nicht `eId`.

**Antwortcode:** 404, nicht 403. Ein 403 bestätigt dem Fragenden, dass die ID
existiert; 404 unterscheidet „gibt es nicht" und „gehört dir nicht" nicht —
genau das ist hier erwünscht. Dieselbe Linie fährt `routes/getraenkeanlage.js`
(„Anlage nicht gefunden", 404).

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
`belehrungId` aus der URL. Die Tabelle hat KEINE Fremdschlüssel auf
`mitarbeiter` oder `belehrungen`, nur `UNIQUE(studio_id, mitarbeiter_id,
belehrung_id)` — die Datenbank fängt hier also gar nichts ab. Es gibt auch
keine Kaskade, deshalb ist der Schaden kleiner als bei Befund 1: es entstehen
Zeilen im eigenen Mandanten, die auf fremde Objekte zeigen.

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

Neue Testdatei `test_feature_mandantengrenze_fremd_ids.js`, registriert in
`test/run.sh`.

Für JEDEN der beiden Wege dieselben drei Zusicherungen:

1. **Guter Fall bleibt gut:** eigene Etage / eigener Mitarbeiter + eigene
   Belehrung → Zeile entsteht, Antwort wie bisher. Ohne diesen Fall ist nicht
   zu unterscheiden, ob die Behebung alles abweist.
2. **Fremder Fall wird abgewiesen:** ID eines ZWEITEN Studios → **keine
   Zeile** entsteht (nachgezählt per `SELECT count(*)`), Antwortcode wie oben
   festgelegt.
3. **Der Rohwert wird nicht eingesetzt:** die geschriebene Zeile trägt die ID
   aus der Nachschlage-Abfrage. Prüfbar dadurch, dass im guten Fall die
   erwartete ID wörtlich verglichen wird.

**Zwei Studios anlegen, nicht eines.** Die Regel aus der CLAUDE.md gilt hier
wörtlich: eine Zusicherung, deren Vorzustand das erwartete Ergebnis ohnehin
erzwingt, ist keine. Gegen eine leere Datenbank schlägt jedes Nachschlagen
fehl, und „keine Zeile entstanden" wäre wahr, ob der Riegel existiert oder
nicht. Es braucht also eine Etage, die WIRKLICH EXISTIERT und einem ANDEREN
Studio gehört.

**IDs unverwechselbar wählen.** Nicht 1 und 2. Die fremde Etage bekommt eine
ID, die im eigenen Studio nicht vorkommt, und der Test prüft vorher, dass sie
dort wirklich nicht vorkommt — sonst ist „abgewiesen" womöglich nur „nicht
gefunden, weil es die Nummer nirgends gibt".

**GEGENPROBE, wörtlich zu melden (beide Richtungen, je einzeln gemessen):**
Nimm in einem Arbeitsbaum die Nachschlage-Abfrage wieder heraus (bzw. setze
den Rohwert statt des Abfrageergebnisses ein) und miss, dass die neuen
Zusicherungen ROT werden — mit Ausgabe `EXIT`-Code und `PASS/FAIL`-Zahlen.
Danach zurücknehmen und GRÜN messen. Beide Läufe wörtlich in den Bericht.

Die Mutation trägt den Marker `GEGENPROBE-` + `DEFEKT`, nimmt den Zielpfad
als ARGUMENT (nicht fest verdrahtet), bricht ab, wenn das Suchmuster nicht
GENAU EINMAL passt, und wird gegen eine unabhängig angelegte `cp`-Kopie mit
`diff` (EXIT 0) zurückgenommen — nie per `git checkout` oder `git stash`.

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
