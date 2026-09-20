# Auftragspapier — `ladeBestand()`: ein stilles falsches Ergebnis wird wieder ein lautes Scheitern

**FASSUNG 2, 20.09.2026 — nach der Planprüfung durch zwei Spuren und drei
eigenen Mutationsmessungen.** Was sich geändert hat, steht in Abschnitt 6;
die Befunde und Nachmessungen in `plaene/planpruefung-ladebestand-20-09-2026.md`.

**Repo:** GymDocu (`/home/user/gymdocu`). **Zeilennummern am 20.09.2026 gegen
`ec7a142` (master nach #464) NEU gemessen — sie sind unverändert.** Das ist
kein Zufall und nachgesehen: Beitrag B hat `routes/admin/geraete.js` zwar
angefasst, aber ausschliesslich ab Zeile 5455, also hinter `ladeBestand`
(`:1849`) und hinter allen zehn Aufrufern. Die Aufruferzahl ist nachgezählt
**zehn**, die Fundstellen unverändert.
**Herkunft:** B1-02 (SOL-2) aus `plaene/durchgang-befunde.md`, selbst
nachgemessen.
**Warum es vorgeht** (STAND.md, Regel 5): Punkt 4 der Prüfreihenfolge
(Datenintegrität) — ein vorübergehend fehlgeschlagener SELECT baut einen
dokumentierten Prüfplan ab und meldet dabei Erfolg. Das ist unsere teuerste
Klasse: nicht fehlende Abdeckung, sondern eine FALSCHE Zusicherung von
Abdeckung.

---

## 0. Was GEMESSEN ist

Zeilennummern am Stand `5a194ba`. **Vor dem Bau neu messen.**

Alle Nummern **neu gemessen am 19.09.2026** gegen `5a194ba` (master nach
#461): gegenüber der ersten Niederschrift sind sie durchgehend um **+28**
verschoben — derselbe Versatz wie im Schreibreihenfolge-Papier. Die
Aufruferzahl wurde dabei nachgezählt und bleibt **zehn**.

### 0.1 Der `catch`, der aus einem Fehler ein Ergebnis macht

`routes/admin/geraete.js:1849-1868`:

    async function ladeBestand(studioId, bereich) {
        try {
            const rows = await db.q("SELECT * FROM pruefbereich_bestand WHERE studio_id=$1 AND bereich=$2", …);
            const map = {}; for (const r of rows) map[r.schluessel] = r; return map;
        } catch (e) {
            console.error(…);
            const leer = {};
            Object.defineProperty(leer, 'fehler', { value: true, enumerable: false });
            return leer;                                   // <- Fehler wird Ergebnis
        }
    }

**Ohne diesen `catch` hätte der äussere `catch` der Route eine saubere
Fehlerseite gezeigt.** Er ist genau die Stelle, an der ein LAUTES Scheitern in
ein stilles falsches Ergebnis verwandelt wird.

### 0.2 Die Markierung liest NIEMAND

**Gemessen** (19.09.2026, `5a194ba`): `grep -n "bestand[A-Za-z]*\.fehler"
routes/admin/geraete.js` → **ein einziger Treffer, Zeile 1863** — der
KOMMENTAR, der die Markierung einführt (gesetzt wird sie bei `:1866`). Keiner
der zehn Aufrufer fragt sie ab.

**Positivkontrolle zum Suchmuster** (sonst hiesse „kein Treffer" nur „falsch
gesucht"): dieselbe Musterform an einem Objekt, das die Markierung wirklich
liest, findet sie — `letzte[A-Za-z]*\.fehler` trifft `:3586` und `:3587`.

Das ist die eigentliche Pointe: `fehler` wurde eingeführt, damit man den
Unterschied sehen KANN („wer gezielt `bestand.fehler` abfragt, sieht den
Unterschied trotzdem"), und niemand tut es. Eine Markierung, die niemand
liest, ist keine Absicherung.

### 0.3 Was der Fehlerzustand in der Ausstattungs-Route anrichtet

`routes/admin/geraete.js:4151` (POST `/geraetewartung/ausstattung`). Die
Ableitung selbst gerechnet, mit GENAU dem Objekt aus dem `catch`:

    Object.entries(fehlerobjekt).length = 0
    geplant           = 0
    unklar            = 0
    alleTerminNamen   = 12
    weg (deaktiviert) = 12
    weg === alleNamen : true

Danach läuft `UPDATE wartung_geraete wg SET aktiv = 0 … WHERE … wg.aktiv = 1
AND wg.name = ANY($2) …` über **alle zwölf** Vorlagentermine, und die Antwort
ist die normale Erfolgsseite mit „N nicht mehr benötigte Termine deaktiviert
(Nachweise bleiben)".

**Der Unterschied zum harmlosen Fall ist gemessen:** bei einem Studio, das nie
geantwortet hat, ist `rowCount` ohnehin 0. Schaden entsteht nur bei einem
Studio, das BEREITS Termine hat — also genau dort, wo der normale Weg eine
nicht-leere Map liefern würde.

### 0.4 Dieselbe Klasse an der Brandschutz-Stelle

`routes/admin/geraete.js:2654`. Gemessen:

    alle POSITIONEN beantwortet -> begehungsAufgaben(...) = 24 Zeilen
    Fehlerzustand {}            -> begehungsAufgaben({})  = 10 Zeilen
    Differenz                   = 14 Vorlagenzeilen

`syncAufgaben(..., nurVerwaltete)` deaktiviert die 14 fehlenden.

### 0.5 Zehn Aufrufer — und sie sind NICHT gleich

`ladeBestand` wird gerufen an `:2146`, `:2654`, `:2928`, `:3154`, `:3364`,
`:3576`, `:3766`, `:3903`, `:4011`, `:4151`. **Welche davon aus dem
Fehlerzustand etwas DESTRUKTIVES ableiten, ist für `:2654` und `:4151`
gemessen und für die übrigen acht NICHT.** Sie sind Fundorte, keine Befunde.

### 0.6 NACHGETRAGEN 20.09.2026 — die Markierung stammt aus einem FRÜHEREN Beitrag, und es gibt einen Wächter darauf

**Das Papier hat das bis heute nicht erwähnt, und das war eine Lücke.** Selbst
gefunden beim Zusammenstellen des Prüfbündels, nicht von einer Prüfspur.

`test_feature_ladestand_dbfehler.js` (Auftrag „ladestand-dbfehler",
02.09.2026) hat die `fehler`-Markierung eingeführt — als Punkt **P4a** seiner
Nacharbeit. Der Kopfkommentar dort sagt wörtlich: *„Jetzt protokolliert, mit
einer nicht aufzählbaren fehler-Markierung (**kein Umbau der zehn bestehenden
Aufrufer nötig**)."* Dieses Papier schlägt also vor, eine damals BEWUSST
getroffene Entscheidung teilweise zurückzunehmen. Das ist zulässig — aber es
gehört benannt, nicht übergangen.

**Und es gibt einen bestehenden Wächter auf genau dieser Stelle**
(`test_feature_ladestand_dbfehler.js:507-526`, Abschnitt 7). Er sichert zu:

    HTTP-Status bei DB-Fehler muss weiterhin 200 sein
      -> gemessen über  GET /admin/geraetewartung/brandschutz
    console.error mit dem Präfix "routes/admin/geraete.js ladeBestand:"
      -> muss bei DB-Fehler kommen
    Durchlass: mit echter DB KEIN console.error

**Was daraus für den Bau folgt — und das ist eine MESSUNG, die vor der ersten
Bau-Runde fällig ist:** der Wächter fährt einen **GET**, dieses Papier will
zwei **POST**-Wege umstellen (`:2654`, `:4151`). Die Vermutung ist, dass sie
sich nicht berühren. **Vermutung, nicht Messung** — der Ausführende misst es
und meldet es wörtlich:

> Nach dem Umbau `test_feature_ladestand_dbfehler.js` einzeln fahren. Bleibt
> er grün, berührt der Beitrag den GET-Weg nicht. Wird er ROT, ist 1.1 in
> dieser Form falsch und die zweite Wahl aus 1.1 ist richtig.

**Die milde Fassung behält damit eine Pflicht, die das Papier bisher nicht
genannt hat:** sie muss weiterhin protokollieren (`console.error` mit genau
diesem Präfix) und weiterhin ein Objekt liefern. Wer sie beim Aufräumen
„vereinfacht", reisst einen Deploy-Gate-Wächter.

---

## 0.7 GEMESSEN 20.09.2026 — zwei Wächter sichern auf den AUFRUFNAMEN zu

**Der blockierende Befund dieses Papiers, und er stammt aus einer eigenen
Mutationsmessung, nicht aus einer Prüfspur.**

`test_feature_brandschutz.js:410` prüft STATISCH den Quelltext im Block von
`router.post("/geraetewartung/brandschutz")` (`:2396`) — auf den WÖRTLICHEN
Aufruf:

    /ladeBestand\(req\.studioId, brandschutz\.BEREICH\)[\s\S]{0,400}begehungsAufgaben/

**`:2654` liegt in genau diesem Block** (gemessen: die letzte
Routendefinition davor ist `:2396`). **Gemessen mit der geplanten
Umbenennung** (`node --check` bestanden, Muster genau einmal getroffen):

    test_feature_brandschutz.js -> EXIT 1
    FEHLGESCHLAGEN: Die Begehungs-Checkliste wird nicht aus den
                    gespeicherten Antworten zusammengesetzt

Eine echte Zusicherung, kein Absturz. **Dieser Wächter ist Deploy-Gate.**

**Eine ZWEITE Stelle in derselben Datei** (`:971`) ist eine NEGATIV-Zusicherung
über einen ANDEREN Block (die Wartungsseite): *„Die Wartungsseite lädt den
Brandschutz-Bestand, obwohl sie ihn nicht mehr anzeigt"*. Sie benutzt das
String-Literal `'brandschutz'` statt `brandschutz.BEREICH` und ist von diesem
Beitrag NICHT betroffen. Sie wird ausdrücklich NICHT angefasst — wer beim
Umstellen die falsche der beiden erwischt, kehrt eine Zusicherung um.

**Für die zweite Zielroute (`:4151`, Ausstattung) gibt es keine solche
Zusicherung** — und das ist jetzt eine Messung, kein Nicht-Fund. Suchmuster
`ladeBestand\\(req` über alle Testdateien: **zwei Treffer, beide in
`test_feature_brandschutz.js`** (Positivkontrolle: dasselbe Muster findet den
bekannten Fall, Trefferzahl 2). Für Ausstattung: null.

---

## 0.8 GEMESSEN 20.09.2026 — die Klasse ist NICHT ungedeckt

Volle Suite mit `return leer;` → `throw e;` in `ladeBestand`:
**`SUITE_EXIT=1`**, gefangen von `test_feature_gefaehrdungsbeurteilung.js:318`:

    FEHLGESCHLAGEN: Auch mit kaputtem ladeBestand() muss die Seite noch
                    die Erfolgsmeldung zeigen

**Der Wächter aus 0.6 fängt dieselbe Mutation NICHT** (gemessen: EXIT 0,
78 PASS / 0 FAIL) — er prüft Status und Protokollpräfix, nicht den
Seiteninhalt; der äussere `catch` der Route (`:2391-2393`) sendet seine
Fehlerseite mit `res.send(...)` ohne `.status(...)`, also ebenfalls HTTP 200.

**Folge für dieses Papier:** der Wächter aus 0.6 ist KEIN Beleg dafür, dass
der GET-Vertrag unberührt bleibt. Die Suite als Ganzes ist einer. Die Messung
aus 0.6 bleibt trotzdem Pflicht — sie beantwortet, ob der Beitrag den GET-Weg
anfasst, nicht ob der Wächter stark ist.

**Und `test_feature_gefaehrdungsbeurteilung.js:318` sichert ausdrücklich das
GEGENTEIL des hier gebauten Prinzips zu** — für die Gefährdungsbeurteilungs-
Route: bei kaputtem `ladeBestand` soll die Seite weiterhin Erfolg melden. Das
ist eine der ACHT ungemessenen Aufrufstellen und wird deshalb NICHT angefasst.
Wer die strenge Fassung später dorthin zieht, stellt zuerst diesen Wächter
fachlich um.

---

## 1. Was gebaut wird

### 1.1 `ladeBestand` wird die milde Hülle um die strenge Fassung

**Geändert gegenüber Fassung 1**, die zwei getrennte Funktionen mit
dupliziertem SELECT vorsah:

    async function ladeBestandStreng(studioId, bereich) {
        const rows = await db.q(
            "SELECT * FROM pruefbereich_bestand WHERE studio_id=$1 AND bereich=$2", [studioId, bereich]);
        const map = {}; for (const r of rows) map[r.schluessel] = r; return map;
    }

    async function ladeBestand(studioId, bereich) {
        try { return await ladeBestandStreng(studioId, bereich); }
        catch (e) { … console.error … fehler-Markierung … return leer; }
    }

**Damit existiert die Abfrage genau EINMAL.** Fassung 1 hätte denselben
SQL-Text an zwei Orten gehabt — gegen die Hausregel, und beide Test-Stubs
matchen je ein Literal davon.

**Der `catch` der milden Fassung behält BEIDE Pflichten**, die ein bestehender
Wächter zusichert (0.6): `console.error` mit dem Präfix
`"routes/admin/geraete.js ladeBestand:"`, und die Rückgabe eines Objekts mit
nicht aufzählbarer `fehler`-Markierung.

### 1.2 Zwei Aufrufer rufen die strenge Fassung

`:2654` (POST Brandschutz) und `:4151` (POST Ausstattung). Beide liegen in
einem `try`, dessen `catch` eine Fehlerseite liefert.

**MITZUZIEHEN, weil es sonst rot wird (0.7):**
`test_feature_brandschutz.js:410` — das Muster wird auf
`ladeBestand(Streng)?\(req\.studioId, brandschutz\.BEREICH\)` erweitert, mit
einem Kommentar, warum beide Namen zulässig sind. **Die Zusicherung wird
FACHLICH umgestellt, nicht gestrichen**: sie sichert zu, dass die
Begehungs-Checkliste aus den GESPEICHERTEN Antworten entsteht, und das ändert
der Beitrag nicht. **`:971` bleibt unangetastet.**

### 1.3 Der neue Zustand wird BENANNT, nicht versteckt

**Gemessen** (`:4126-4151`): im Ausstattungs-POST laufen die Antwort-INSERTs
samt Audit in einer Schleife, erst DANACH kommt `ladeBestand`. Alles
Autocommit, kein `db.tx`. Scheitert die strenge Fassung, bleiben die Antworten
gespeichert und der Benutzer sieht eine Fehlerseite.

**Das ist gewollt und besser als heute** — heute werden bei demselben Fehler
zwölf Termine deaktiviert und Erfolg gemeldet. **Aber die Fehlerseite darf
nicht behaupten, es sei nichts passiert.** Der Text nennt, was gespeichert
wurde und dass der Prüfplan-Abgleich nicht gelaufen ist; ein erneuter Aufruf
holt ihn nach.

**Kein Umbau auf eine Transaktion.** Die würde eine neue Lock-Ordnung über
`pruefbereich_bestand` und `wartung_geraete` einführen, und `auditAppend`
nimmt den studioweiten Advisory-Lock mit hinein — das ist die Klasse, für die
die CLAUDE.md eine eigene Analyse verlangt. **Eigener Beitrag, nicht dieser.**

### 1.4 Die Markierung `fehler` bleibt — und der Kommentar sagt die Wahrheit

Sie bleibt für die acht ungemessenen Aufrufer die einzige Möglichkeit, den
Unterschied zu sehen. **Der Kommentar bei `:1863` wird berichtigt, aber ANDERS
als Fassung 1 es wollte:** er sagt ab jetzt ausdrücklich, dass **kein**
Aufrufer sie abfragt und sie eine reine Diagnose-Markierung für die acht
ungemessenen Wege ist. Fassung 1 hätte dort „heute liest sie genau der neue
Weg" hingeschrieben — bei der strengen Fassung liest sie niemand, das wäre eine
frisch geschriebene falsche Zusicherung gewesen.

**Und der Kopfkommentar von `test_feature_ladestand_dbfehler.js`** (P4a: „kein
Umbau der zehn bestehenden Aufrufer nötig") wird um einen Satz ergänzt: für
zwei der zehn gilt das seit diesem Beitrag nicht mehr.

---

## 2. Was ausdrücklich NICHT gebaut wird

* **Die acht ungemessenen Aufrufer** (0.5). Einer davon
  (Gefährdungsbeurteilung) trägt sogar einen Wächter, der das GEGENTEIL
  zusichert (0.8).
* **Ein Umbau auf `db.tx`** (1.3) — eigene Lock-Ordnungsanalyse nötig.
* **Eine Inhaltsprüfung im Wächter aus 0.6.** Sie wäre richtig (er kann für
  die `throw`-Mutation nicht rot werden), aber sie ist ein eigener Befund am
  Bestand und nicht Gegenstand dieses Beitrags. Steht als **U-LBW1** in
  `plaene/durchgang-befunde.md`.
* **Ein Umbau von `syncAufgaben` / `alleTerminNamen`** und **ein Retry**.

---

## 3. Zusicherungen — je mit der Gegenprobe

### Z1 — Ein DB-Fehler deaktiviert NICHTS

Über den echten POST-Weg, gegen eine Wegwerf-DB, für **beide** Wege einzeln.

**Der Fehler wird über den EXAKTEN SQL-Literaltext gestellt:**

    'SELECT * FROM pruefbereich_bestand WHERE studio_id=$1 AND bereich=$2'

Muster ist `mitGestoertemQ` aus `test_feature_ladestand_dbfehler.js:141`.
**AUSDRÜCKLICH NICHT `mitGestoertemBereich`** und nicht der blosse
Tabellenname — beides misst etwas anderes, und beides ist gemessen:

* `mitGestoertemBereich` matcht `sql.includes('pruefbereich_bestand') &&
  params[1] === bereich`; die Antwort-INSERTs tragen genau diese Signatur
  (`[req.studioId, ausstattung.BEREICH, …]`, `:4127-4135`). Der Stub würde die
  Antworten killen, BEVOR die strenge Fassung läuft — Z1 wäre grün, auch ohne
  jede Behebung.
* Der blosse Tabellenname trifft im Brandschutz-POST zusätzlich `:2485`
  (`SELECT antwort, bemerkung … AND schluessel=$3`), das VOR `:2654` läuft.

**Der Test sichert zu, dass der Stub GENAU EINMAL gegriffen hat** — greift er
null- oder mehrmals, fällt die Zusicherung, statt grün zu bleiben.

**Ablauf je Weg:**

1. Vorzustand über den echten Weg herstellen, dann die MENGE der aktiven
   Namen messen und **literal** im Test festhalten.
2. Fehler stellen, POST absetzen.
3. **Erwartet:** Abbruch-Antwort mit festem Inhaltsmarker, und die Menge der
   aktiven Namen ist unverändert — die MENGE, nicht ihre Anzahl.
4. **Positivkontrolle im selben Lauf:** derselbe POST OHNE gestellten Fehler
   lässt die Termine aktiv und ändert den Wert wirklich.
5. **Leerer und teilweiser POST** als eigene Fälle — sonst überlebt eine
   bedingte Mutation wie `beantwortet === 0 ? ladeBestand(...) :
   ladeBestandStreng(...)`.

**Jede Messabfrage trägt `studio_id`.** Derselbe Testaufbau legt viele Studios
in EINER Wegwerf-DB an; eine Zählung ohne Filter misst fremde Fixturen mit.

**Gegenproben:**
1. Den strengen Aufruf auf `ladeBestand` zurückdrehen → ROT, mit FAIL-Zeile.
2. **Der Beleg, dass die Probe ankommt:** ohne die Behebung müssen 12 bzw. 14
   Zeilen deaktiviert werden. Ändert sich diese Zahl bei der Gegenprobe
   nicht, ist der gestellte Fehler gar nicht angekommen.

### Z2 — Der normale Weg bleibt unverändert

**Verengt gegenüber Fassung 1.** Verglichen wird die **volle Zeilenmenge** der
erzeugten `wartung_geraete`-Einträge (`name`, `intervall_monate`,
`durchfuehrung`, `notizen`) plus die Aufgabenzeilen je Eintrag — nicht Namen
oder Anzahl. Der Sollwert wird VOR dem Umbau gemessen und literal eingetragen.

**Gegenprobe — Fassung 1 hatte für Z2 gar keine:** `intervallMonate` eines
Eintrags in `core/ausstattung.js` um 1 ändern → Z2 muss ROT werden.

### Z3 — Die milde Fassung behält ihren Vertrag

**Umgeschrieben.** Fassung 1 zählte Aufrufstellen; das kann nicht rot werden
(`return leer;` → `throw e;` lässt acht Aufrufstellen stehen und stellt
trotzdem alle acht um).

Zugesichert wird jetzt das VERHALTEN: `ladeBestand` einmal direkt mit
werfender Datenbank aufrufen und prüfen, dass

* ein Objekt herauskommt (kein Wurf),
* es eine **nicht aufzählbare** `fehler`-Markierung trägt
  (`Object.keys()` leer, `bestand.fehler === true`),
* und `console.error` mit dem Präfix `routes/admin/geraete.js ladeBestand:`
  lief.

Dazu weiterhin die Liste der acht mild rufenden Stellen, namentlich.

**Gegenproben:** `return leer;` → `throw e;` → ROT. Die Markierung
aufzählbar machen → ROT. Einen der acht auf die strenge Fassung umstellen
→ ROT.

---

## 4. Abnahme

Volle Suite ohne Pipe und ohne äusseres `flock`, Dateizahl-Ritual mit `diff`
EXIT 0, `npm run lint` **wörtlich gemeldet auch bei Grün**, alle Gegenproben
beidseitig mit `node --check` vorab, Mutationsskripte mit Zielpfad als
ARGUMENT und Abbruch bei ≠ 1 Treffer, Marker-Scan mit Pfad-Ausschluss, Commit
und Push VOR dem Warten.

**Zusätzlich, als harte Tore:**

1. **`test_feature_ladestand_dbfehler.js` einzeln VOR dem ersten Commit** —
   Ergebnis wörtlich. Bleibt er grün, berührt der Beitrag den GET-Weg nicht.
2. **`test_feature_brandschutz.js` einzeln nach der Umstellung von `:410`** —
   Ergebnis wörtlich.
3. **`test_feature_gefaehrdungsbeurteilung.js` einzeln** — er sichert das
   Gegenteil für eine der acht Stellen zu und muss unberührt grün bleiben.
4. Das Deaktivierungs-UPDATE bei `:4151`ff. im Bericht **wörtlich** zitieren,
   mitsamt seinem `studio_id`-Vorkommen — das Papier zitiert es elliptisch.

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* **Wenn die strenge Fassung einen der acht ungemessenen Aufrufer berührt.**
* **Wenn `mitGestoertemQ` mit dem vollen Literaltext mehr als den einen
  SELECT trifft.**
* **Einen elften Aufrufer von `ladeBestand`.**
* **Eine weitere Zusicherung, die auf den AUFRUFNAMEN zeigt** — gesucht wurde
  mit `ladeBestand\\(req` über alle Testdateien, zwei Treffer, beide in
  `test_feature_brandschutz.js`. Wer einen dritten findet, meldet ihn.
* **Jeden Widerspruch zu einer Messung in diesem Papier.**

---

## 6. Was sich gegenüber Fassung 1 geändert hat

| | Fassung 1 | Fassung 2 | Anlass |
|---|---|---|---|
| Aufbau | zwei Funktionen, SQL doppelt | `ladeBestand` = milde Hülle um die strenge Fassung, SQL einmal | kimi K8, bessere Variante von ihm selbst genannt |
| `test_feature_brandschutz.js:410` | nicht erwähnt | **wird fachlich umgestellt** — sonst ROT | eigene Mutationsmessung |
| Fehlerstellung | „für genau den nächsten SELECT" | **exakter SQL-Literaltext**, ausdrücklich nicht `mitGestoertemBereich` | sol S7 und kimi K1, zwei verschiedene Fallen |
| Teilpersistenz | nicht erwähnt | **benannt**, samt Anforderung an den Antworttext | sol S1, kimi K6 |
| Z2 | „dieselben Termine", keine Gegenprobe | volle Zeilenmenge **plus Gegenprobe** | sol S5, kimi K5 |
| Z3 | Aufrufstellen zählen | **Verhaltensvertrag der milden Fassung** | sol S6, kimi K2 |
| 1.4 | „heute liest sie genau der neue Weg" | **niemand liest sie** — das wäre eine frisch geschriebene falsche Zusicherung gewesen | sol S9, kimi K4 |
| `studio_id` im Test | nicht verlangt | **Pflicht in jeder Messabfrage** | sol S8, kimi K7 |
| Abnahme | allgemein | **vier harte Tore**, einzeln zu melden | kimi K3 |
