# Auftragspapier — `ladeBestand()`: ein stilles falsches Ergebnis wird wieder ein lautes Scheitern

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

## 1. Was gebaut wird

### 1.1 Der Fehler wird wieder ein Fehler — an den DESTRUKTIVEN Stellen

**Nicht** den `catch` ersatzlos entfernen: zehn Aufrufer verlassen sich heute
auf „liefert immer ein Objekt", und acht davon sind ungemessen. Ein
ersatzloses `throw` wäre eine Verhaltensänderung an acht ungeprüften Stellen.

**Stattdessen:** `ladeBestand` bekommt eine Schwester, die LAUT scheitert, und
die beiden gemessenen destruktiven Wege (`:2654`, `:4151`) rufen sie.

    async function ladeBestandStreng(studioId, bereich) {
        // kein catch — ein DB-Fehler gehört an den Aufrufer, der daraus
        // etwas UNWIDERRUFLICHES ableitet.
    }

Beide Wege liegen ohnehin in einem `try`, dessen `catch` eine saubere
Fehlerseite liefert. Der Aufwand ist klein, die Wirkung vollständig.

**Alternative, falls die Schwester beim Bauen als schlechter erweist:** die
beiden Aufrufer fragen `bestandRoh.fehler` ab und brechen ab. Das ist
schwächer (die Markierung bleibt etwas, das man vergessen kann) und deshalb
zweite Wahl. **Welche Fassung gebaut wird, entscheidet der Ausführende mit
einer MESSUNG** — ob die strenge Schwester irgendeinen anderen Aufrufer
berührt —, nicht nach Geschmack, und meldet das Ergebnis wörtlich.

### 1.2 Die Markierung `fehler` wird NICHT entfernt

Sie kostet nichts und bleibt für die acht ungemessenen Aufrufer die einzige
Möglichkeit, den Unterschied überhaupt zu sehen. **Aber der Kommentar bei
`:1866` wird berichtigt:** er behauptet heute implizit, jemand frage sie ab.
Stattdessen: wer sie einführt, benennt, wer sie liest — und heute liest sie
genau der neue Weg.

---

## 2. Was ausdrücklich NICHT gebaut wird

* **Die acht ungemessenen Aufrufer** (0.5). Ob sie aus dem Fehlerzustand
  etwas Destruktives ableiten, ist nicht gemessen. Wer sie mitnimmt, baut auf
  Fundorten. Sie kommen als offener Punkt in `plaene/durchgang-befunde.md`.
* **Ein Umbau von `syncAufgaben` oder `alleTerminNamen`.** Die sind richtig;
  falsch ist, womit sie gefüttert werden.
* **Eine Wiederholung des fehlgeschlagenen SELECT.** Ein Retry verdeckt die
  Ursache und ist eine eigene Entscheidung.

---

## 3. Zusicherungen — je mit der Gegenprobe

### Z1 — Ein DB-Fehler deaktiviert NICHTS

Über den echten POST-Weg, gegen eine Wegwerf-DB, für **beide** Wege einzeln
(`/geraetewartung/ausstattung` und der Brandschutz-Weg):

1. **Vorzustand herstellen und MESSEN:** über den echten Weg Antworten
   speichern, dann zählen, wie viele Termine bzw. Zeilen aktiv sind. Die Zahl
   wird literal im Test festgehalten, nicht aus dem Lauf abgeleitet.
2. **Fehler stellen für GENAU den nächsten SELECT auf `pruefbereich_bestand`**
   — nicht für alle DB-Aufrufe. Trifft die Probe mehr, misst sie etwas
   anderes.
3. **Erwartet:** die Antwort ist eine ABBRUCH-Antwort, und **keine einzige**
   der vorher aktiven Zeilen ist deaktiviert. Gemessen wird die MENGE der noch
   aktiven Namen gegen die literale Erwartung, nicht nur ihre Anzahl (eine
   Zahl ist keine Zusicherung über eine Menge).
4. **Positivkontrolle in die Gegenrichtung:** derselbe POST OHNE gestellten
   Fehler lässt die Termine aktiv — sonst prüft Z1 nur, dass ein leeres Studio
   leer ist.

**Gegenproben:**
1. Den strengen Weg wieder auf `ladeBestand` zurückdrehen → Z1 muss ROT
   werden, und zwar mit einer FAIL-Zeile, nicht mit einem Absturz.
2. **Der Beleg, dass die Probe überhaupt ankommt:** eine ZAHL suchen, die sich
   ohne die Behebung ändern MUSS — hier die Zahl deaktivierter Zeilen (12
   bzw. 14). Ändert sie sich bei der Gegenprobe nicht, ist der gestellte
   Fehler gar nicht angekommen.

### Z2 — Der normale Weg bleibt unverändert

Für beide Wege: ein vollständiger, fehlerfreier Durchlauf erzeugt exakt
dieselben Termine bzw. Zeilen wie vor dem Umbau. **Der Sollwert wird VOR dem
Umbau gemessen und literal eingetragen** — sonst misst der Test den neuen Code
gegen sich selbst.

### Z3 — Die acht ungemessenen Aufrufer sind unberührt

Statisch: `ladeBestand` (die milde Fassung) wird weiterhin von genau acht
Stellen gerufen, namentlich aufgeführt. **Gegenprobe:** einen davon auf die
strenge Fassung umstellen → ROT. Das hält fest, dass der Beitrag seinen
Rahmen nicht heimlich ausweitet.

---

## 4. Abnahme

Wie `plaene/auftrag-id-wache.md`, Abschnitt 4: volle Suite ohne Pipe und ohne
äusseres `flock`, Dateizahl-Ritual mit `diff` EXIT 0, `npm run lint`
**wörtlich gemeldet auch bei Grün**, alle Gegenproben beidseitig mit
`node --check` vorab, Mutationsskripte mit Zielpfad als ARGUMENT und Abbruch
bei ≠ 1 Treffer, Marker-Scan mit Pfad-Ausschluss, Commit und Push VOR dem
Warten.

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* **Wenn die strenge Schwester einen der acht ungemessenen Aufrufer berührt**
  — dann ist 1.1 falsch und die zweite Wahl ist richtig.
* **Wenn sich ein Fehler nicht für GENAU EINEN SELECT stellen lässt**, ohne
  andere mitzutreffen. Eine Probe, die alle Aufrufe trifft, misst nicht Z1.
* **Einen elften Aufrufer von `ladeBestand`.**
* **Jeden Widerspruch zu einer Messung in diesem Papier.**
