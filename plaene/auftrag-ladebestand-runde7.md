# Bauauftrag Runde 7 „ladebestand" — Nacharbeit zur Diffprüfung Runde 6

**Zielrepo:** `/home/user/gymdocu`, Zweig `beitrag-ladebestand`, Basis `5735eac`.

**Grundlage:** `plaene/diffpruefung-ladebestand-runde6.md`. Dort stehen 14
Befunde der ausführenden Prüfspur, **jeder einzeln vom Haupt-Agenten
nachgemessen**, mit den Messwerten. Dazu 6 Befunde einer Lesespur
(`deepseek-v4-pro`, Bündel „Geschwisterwächter", s. `ASTRA-LAEUFE.md`),
ebenfalls alle nachgemessen, davon **3 neu**. Der Auftrag setzt nur um, was
getragen hat.

**Eine Warnung vorweg, gemessen:** die Lesespur hat zu ihrem Befund R3 als
Behebung ausgerechnet die Tautologie vorgeschlagen, die die andere Spur als
blind GEMESSEN hat (`x.length === original.length`). Kein Vorschlag einer
Prüfspur geht ungemessen in diesen Auftrag — deshalb steht unter jedem Punkt
die eigene Messung, nicht der Vorschlag.

**ALLE Zeilennummern in diesem Papier sind am Stand `5735eac` gemessen und
gelten NUR dort.** Sobald der erste Punkt umgesetzt ist, stimmen sie nicht mehr
— die Punkte 1, 2 und 6 fügen im vorderen Teil der Datei Zeilen ein und
verschieben alles danach. **Gearbeitet wird deshalb nach SUCHMUSTER, nicht nach
Zeilennummer.** Das ist nicht Pedanterie: Befund A6 dieses Beitrags ist, dass
zwei Zeilennummern in einem Kommentar DREI RUNDEN IN FOLGE falsch waren, weil
jede Runde sie um den falschen Betrag fortgeschrieben hat.

**Was dieser Auftrag NICHT ist:** eine Änderung am Produktivverhalten. Er fasst
in `routes/admin/geraete.js` ausschliesslich einen KOMMENTAR an. Alles Übrige
liegt in `test_feature_ladebestand_streng.js`.

---

## 1 — A1: die tautologische Längenzusicherung ersetzen

**Befund (gemessen):** `assert.strictEqual(abschnitt.length, ende -
zeilenbeginnNachMarke, …)` in Zeile 660 kann nicht fallen.
`maskiereKommentare()` baut aus `src.split("")` und gibt `out.join("")` zurück
— die Länge ist per Konstruktion gleich. Unter einer längenerhaltenden
Mutation, die jedes `req.studioId` aus dem Abschnitt frisst, lief die Datei mit
**TEST_EXIT=0, 29 PASS / 0 FAIL** durch.

**Umsetzung:** Die Zusicherung wird durch eine über den INHALT ersetzt.
`nichtLeerraum` ist im Hausstandard bereits exportiert
(`test/rohwert-scan.js:360`, Kopfkommentar: „wo ein reiner .length-Vergleich
blind ist") und wird zusammen mit `maskiereKommentare` importiert.

```js
const { maskiereKommentare, nichtLeerraum } = require('./test/rohwert-scan.js');
```

Sollwert LITERAL hinschreiben, mit dem Messdatum im Kommentar und dem Hinweis,
dass er beim bewussten Ändern des bewachten Bereichs nachzuziehen ist:

```js
// Sollwert aus eigener Nachmessung 23.09.2026: der ROHE Ausschnitt hat 9137
// Nicht-Leerraum-Zeichen, der maskierte 2291 (218 Zeilen, davon 143
// reine Kommentarzeilen — nachgezählt, KEINE Codezeile wird geleert).
// Die frühere Zusicherung verglich LÄNGEN und konnte nicht fallen.
const ABSCHNITT_NICHT_LEERRAUM = 2291;
assert.strictEqual(nichtLeerraum(abschnitt), ABSCHNITT_NICHT_LEERRAUM, …);
```

**Gegenprobe (1a):** In `test/rohwert-scan.js` das `return out.join("");` von
`maskiereKommentare` ersetzen durch
`return out.join("").replace(/req\.studioId/g, "            ");`
(längenerhaltend, zwölf Leerzeichen für zwölf Zeichen).
→ die neue Zusicherung MUSS rot werden (gemessen fällt der Wert auf 2195).
Rücknahme gegen eine unabhängige `cp`-Kopie, `diff` EXIT 0.
**Die alte Längenzusicherung blieb unter genau dieser Mutation GRÜN** — das ist
der Beleg, dass die neue etwas anderes leistet.

**Die Erfolgsmeldung `ok(...)` in Zeile 671 mitziehen**: sie behauptet heute
„längengleich zum rohen Ausschnitt" und meldet damit einen Beweis, den es nicht
gibt. Sie nennt ab jetzt die Nicht-Leerraum-Zahl.

## 2 — A2 + A3 + A10 + A14: der C9-Selbstscan

Vier Befunde an einem Block; sie werden zusammen behoben, weil jede Einzelfassung
die anderen mitverschiebt.

**A10 (gemessen): der Scan liest den eigenen Quelltext ROH.** Die Datei
importiert den Masker seit Zeile 513 und benutzt ihn hier nicht. Eine künftige
Kommentarzeile, die `pruefeKeinFehlerseiten(rIrgendwas` enthält, macht die
Suite rot. Heute hält der Lauf nur, weil alle Kommentar-Erwähnungen von Hand
`<r>` schreiben — eine Disziplin, keine Zusicherung.
→ `maskiereKommentare(fs.readFileSync(__filename, 'utf8'))`.

**Vorab gemessen, damit die Umstellung keine Überraschung wird:** der Sollwert
15 bleibt dabei gültig — roh wie maskiert dieselben 15 Treffer, in derselben
Reihenfolge, mit denselben Namen. Die Maskierung nimmt heute also NICHTS weg
(eben weil alle Kommentar-Erwähnungen `<r>` schreiben). Sollte die Zahl beim
Bau trotzdem abweichen, ist das ein eigener Befund und wird gemeldet statt der
Sollwert stillschweigend angepasst.

**A3: die Suche läuft nur VORWÄRTS** (`eigenerQuelltext.slice(nachStelle)`).
Die umgekehrte Reihenfolge — erst `r.text()`, dann
`pruefeKeinFehlerseiten(r, …)` — ist unsichtbar und seit dem Wegfall von
`r.clone()` in Runde 6 neu scharf: der Helfer wirft dann an seinem eigenen
`await r.text()` (Zeile 93) „Body is unusable".
→ Für jeden Aufrufer im GANZEN maskierten Quelltext suchen, nicht nur dahinter.

**A14 (gemessen): `r1` und `r3` kommen je ZWEIMAL als Helferargument vor.**
Mit der Suche über die ganze Datei wird daraus ein echter Fehlalarmweg statt
eines dokumentierten.
→ Die vier Vorkommen eindeutig benennen. **Vom Haupt-Agenten vorab kartiert**,
damit nicht gesucht werden muss — je drei Verwendungen, alle im selben Block:

| heute | Block | Verwendungen | neu |
|---|---|---|---|
| `r1` | Ausstattung | Deklaration, `.status`-Zusicherung, Helferaufruf | `r1Ausstattung` |
| `r3` | Ausstattung | dieselben drei | `r3Ausstattung` |
| `r1` | Brandschutz | dieselben drei | `r1Brandschutz` |
| `r3` | Brandschutz | dieselben drei | `r3Brandschutz` |

Zwölf Ersetzungen, alle blocklokal, kein Verhaltenswechsel. **Die Blöcke sind
über ihren POST-Pfad eindeutig zu unterscheiden** (`/admin/geraetewartung/
ausstattung` gegen `/admin/geraetewartung/brandschutz`) — danach suchen, nicht
nach der Zeilennummer.

Danach ist jeder Bezeichner einmalig, und die Suche über die ganze Datei
erzeugt keinen Fehlalarm mehr.

**Der Kommentar, der die alten Namen aufzählt, wird mitgezogen.** Er steht
heute als „bekannte Grenze" da; nach dieser Umsetzung gibt es die Grenze nicht
mehr, und ein Kommentar, der eine behobene Schwäche beschreibt, ist eine
falsche Tatsachenbehauptung über den eigenen Code.

**A2 (gemessen): das Prädikat selbst ist ungeprüft.** Von fünf Schreibweisen
fängt es genau eine:

```
GEFANGEN  "rTest.text()"
DURCH     "rTest.text( )"      DURCH  "rTest\n    .text()"
DURCH     "rTest['text']()"    DURCH  "const { text } = rTest"
```

→ Zwei Dinge: das Prädikat auf Leerraum-Toleranz erweitern
(`\\b${r}\\s*\\.\\s*text\\s*\\(\\s*\\)` und die Klammerform
`\\b${r}\\s*\\[\\s*['"]text['"]\\s*\\]`), UND — wichtiger — eine
POSITIVKONTROLLE des Prädikats gegen eine synthetische Verletzungszeichenkette,
wie sie Fixtur 4 für den Masker schon hat. Die Destrukturierung
(`const { text } = r`) wird NICHT erfasst; das wird als bekannte Grenze
BENANNT, nicht stillschweigend übergangen.

**Gegenprobe (2a):** in Punkt 1 wieder `const htmlAusloesen = await
rAusloesen.text();` HINTER den Helferaufruf setzen → ROT.
**Gegenprobe (2b), die neue Richtung:** in einem beliebigen Block ein
`await <r>.text();` VOR den Helferaufruf setzen → MUSS ab jetzt ebenfalls ROT
werden (heute grün).
**Gegenprobe (2c), das Prädikat:** die Positivkontrolle des Prädikats muss
fallen, wenn man das Prädikat auf `/niemals-passendes-muster/` setzt.

## 3 — A5: die Klammer-Umgehung schliessen

**Befund (gemessen):**

```
DURCH    pool["run"]("UPDATE x")      DURCH    pool["one"]("SELECT 1")
gefangen pool["query"]("UPDATE x")    gefangen run("UPDATE x")
```

Die Alternative `\[\s*.?query.?\s*\]` kennt nur den Namen `query`. Damit steht
die Umgehung, die Runde 5 bei `db["run"](…)` als BLOCKIEREND geschlossen hat,
eine Aliasbildung weiter wieder offen.

**Umsetzung:** die Klammerform auf dieselbe Namensmenge heben wie die
Punktform. `core/db.js` exportiert `pool, q, one, run, tx` — alle fünf gehören
hinein, plus `query`:

```js
const PRUEFPLAN_VERBOTENES_MUSTER =
    /\bdb\b|\.\s*query\s*\(|\[\s*['"](?:query|run|one|tx|q|pool)['"]\s*\]|\b(?:run|one|tx|q|pool)\s*\(/;
```

**Die Lesespur fand am SELBEN Teilausdruck die Gegeneigenschaft (R4): er ist
auch zu BREIT.** Gemessen gegen den HEUTIGEN Ausdruck:

```
SCHLAEGT AN const feld = werte[query];
SCHLAEGT AN obj[ query ]
SCHLAEGT AN a[queryX]
```

`\[\s*.?query.?\s*\]` — die beiden `.?` matchen jedes beliebige Zeichen.
Eine harmlose künftige Zeile mit einer Variablen `query` in eckigen Klammern
macht den Riegel rot. Das Muster ist also bei den NAMEN zu eng (A5) und bei den
TRENNZEICHEN zu breit (R4); **beides ist wahr und beides schliesst derselbe
Ausdruck unten.**

**Vom Haupt-Agenten vorab gemessen**, damit der Auftrag nicht auf einer
Vermutung steht — der vorgeschlagene Ausdruck gegen neun Proben:

```
schlaegt am HEUTIGEN Abschnitt an (darf NICHT): false
GEFANGEN  pool["run"]("UPDATE x")     GEFANGEN  pool['one']("SELECT 1")
GEFANGEN  pool["tx"](f)               GEFANGEN  pool["query"]("x")
GEFANGEN  run("UPDATE x")             GEFANGEN  db.run(1)
GEFANGEN  t.query(1)
DURCH     await schreibePruefplan(x, y)
DURCH     const rows = ergebnis.rows
```

Er fängt alle sechs Umgehungsformen, lässt die beiden legitimen Zeilen durch
und schlägt am heutigen Abschnitt NICHT an. **Und er schliesst R4 mit:**
`werte[query]`, `obj[ query ]`, `a[queryX]` und `daten["suchquery"]` gehen
DURCH, `pool["query"](1)` schlägt weiterhin an (selbst gemessen).

**Gegenprobe (3a):** je eine Zeile `pool["run"]("UPDATE x")` und
`pool["one"]("SELECT 1")` IN den bewachten Bereich einfügen (nicht eine
bestehende Zeile ersetzen — sonst fällt die Anzahl-Zusicherung zuerst und
isoliert den Riegel nicht) → MUSS am Punkt-4-Riegel rot werden.
Vorher gegen den ALTEN Ausdruck messen und wörtlich belegen, dass er DURCHLÄSST.

## 4 — A12 + A13: Fixtur 1 und die Meldung von Fixtur 3

**A12:** Fixtur 1 prüft weiter `includes('db')`, während Fixtur 3 in Runde 6 auf
`PRUEFPLAN_VERBOTENES_MUSTER` umgestellt wurde. C11 lautete ausdrücklich
„Riegel und Fixtur müssen DASSELBE Prädikat prüfen" — die Regel ist nur halb
angewandt. → Fixtur 1 ebenfalls auf das geteilte Muster umstellen.

**A13:** die Fehlermeldung von Fixtur 3 nennt nur `"db" muss erhalten bleiben`,
während das geprüfte Prädikat inzwischen SIEBEN Namen abdeckt
(`db`, `query`, `run`, `one`, `tx`, `q`, `pool`). Fällt sie
aus einem anderen Grund, schickt die Meldung die Diagnose in die falsche
Richtung. → Meldung auf das nennen, was wirklich geprüft wird.

## 5 — A9: der finally-Block zählt Aufräumfehler

**Befund (gemessen):** erster DELETE künstlich zum Scheitern gebracht →

```
Aufräumen (Punkt 1): DELETE FROM wartung_pruefungen fehlgeschlagen: column "spalte_gibt_es_nicht" does not exist
Aufräumen (Punkt 1): DELETE FROM wartung_geraete fehlgeschlagen: … foreign key constraint …
Aufräumen (Punkt 1): DELETE FROM wartung_kategorien fehlgeschlagen: … foreign key constraint …
──── 29 PASS / 0 FAIL ──── TEST_EXIT=0
```

Die FK-Kette trat genau wie vorhergesagt ein: ein gescheiterter Schritt reisst
alle drei mit, „Feuerlöscher 8" bleibt in der geteilten Wegwerf-DB liegen — der
Zustand, dessen Vermeidung der Block als seinen Zweck nennt — und der Lauf
meldet grün.

**Umsetzung:** einen Zähler `aufraeumFehler` führen; jedes `catch` erhöht ihn
zusätzlich zum `console.error`. Nach dem Block eine echte Zusicherung
(`ok(...)`/`assert`), die bei `aufraeumFehler > 0` FÄLLT und die Fehler nennt.
Hausregel dazu: „eine Zusicherung, die nur einen Zähler erhöht, hält keinen
Schreibweg auf" — hier wird bisher nicht einmal ein Zähler erhöht.

**Wichtig, damit die Behebung nichts verschlimmert:** ein `assert` IM
`finally` ERSETZT eine noch fliegende Ausnahme — die Behebung würde dann den
Originalfehler des Tests verschlucken und wäre schlimmer als der Befund. Genau
die Klasse, die in diesem Repo mehrfach zugeschlagen hat.

**Die Unterscheidung ist sauber herstellbar, vom Haupt-Agenten am Quelltext
nachgesehen** (`try {` … `} finally {` innerhalb der IIFE, deren `.catch()` mit
`process.exit(1)` endet). Das Mittel ist ein Flag als LETZTE Anweisung des
`try`-Rumpfs:

```js
let durchgelaufen = false;
try {
    …                                    // unverändert
    ok('Punkt 1: …');                    // die heutige letzte Zeile des Rumpfs
    durchgelaufen = true;                // NEU, muss die letzte sein
} finally {
    let aufraeumFehler = 0;
    …                                    // vier Schritte, jedes catch: aufraeumFehler++
    if (durchgelaufen && aufraeumFehler > 0) {
        assert.fail(`Punkt 1 Aufräumen: ${aufraeumFehler} von 4 Schritten …`);
    }
}
```

Wirft der Rumpf, bleibt `durchgelaufen` falsch, der Originalfehler fliegt
weiter und die Aufräumfehler stehen nur im Protokoll. Läuft der Rumpf durch,
macht ein liegengebliebener Aufräumschritt den Lauf rot.

**Die Zahl 4 gehört literal in die Meldung** — sie sagt dem Lesenden, wie viele
Schritte es überhaupt gibt, und fällt auf, wenn jemand einen fünften ergänzt,
ohne sie nachzuziehen.

**Gegenprobe (5a):** denselben Defekt wie oben setzen
(`spalte_gibt_es_nicht`) → MUSS ab jetzt EXIT 1 liefern, mit einer Meldung,
die alle drei gescheiterten Schritte nennt. Ohne den Defekt: EXIT 0.

## 6 — A11: den zweiten Reiniger löschen

**Befund (gemessen):** `GERAETE_QUELLTEXT_OHNE_KOMMENTARE` (Zeile 466-468)
steht mit der Begründung da, eine strengere Bereinigung „würde diese Messung
stillschweigend verändern". Nachgemessen über beide Reiniger:

```
ladeBestand\(   9:9    ladeBestandStreng\(   4:4
ladeBestand\(req\.studioId, 8:8    ladeBestandStreng\(req\.studioId, 2:2
```

Alle vier IDENTISCH. Der einzige genannte Grund trägt nicht. Der schwächere
Reiniger kennt weder Zeichenketten noch Regex-Literale — also genau die Klasse,
die Runde 6 bei seinem Geschwister als BLOCKIEREND eingestuft hat.

**Die Lesespur liefert dazu den POSITIVEN Grund (R1/R5), den A11 nicht hatte:
der Zweitreiniger ist nicht nur überflüssig, er ist ein aktiver
Fehlalarmweg.** Selbst nachgemessen:

```
Eingabe            : const x = 1;  /* Beispiel: ladeBestand(req.studioId, "wo") */
schwacher Reiniger : const x = 1;  /* Beispiel: ladeBestand(req.studioId, "wo") */
  -> zaehlt mit?   : true
Hausstandard       : const x = 1;
  -> zaehlt mit?   : false
```

Sein Muster `^[ \t]*\/\*[\s\S]*?\*\//gm` verlangt, dass der Blockkommentar
am ZEILENANFANG öffnet. Ein MITTIGER Kommentar, der einen gezählten Aufruf nur
ZITIERT, überlebt ihn und wird in der Z3-Zählung MITGEZÄHLT — die Suite würde
an reiner Prosa rot. Das ist die Umkehrung von „Tests dürfen nicht an Prosa
scheitern", und sie ist heute scharf, nicht latent.

**Gegenprobe (6b), die neue Richtung:** einen mittigen Blockkommentar mit
`ladeBestand(req.studioId,` in `routes/admin/geraete.js` einfügen.
Vorher (mit dem schwachen Reiniger): die Z3-Zählung MUSS steigen und die Suite
rot werden. Nachher (Hausstandard): sie MUSS grün bleiben. Beide Richtungen
wörtlich melden.

**Umsetzung:** `GERAETE_QUELLTEXT_OHNE_KOMMENTARE` löschen (Zeile 466-468) und
die einzige Verwendung, `const quelltext = GERAETE_QUELLTEXT_OHNE_KOMMENTARE;`
in **Zeile 1792** (selbst nachgemessen), auf den maskierten Quelltext umstellen.
Die drei übrigen Nennungen (588, 620 und die falsche Begründung in 476) sind
Kommentare und werden mitgezogen bzw. gelöscht. Hausregel „Dieselbe
Aussage an zwei Orten": die zweite Kopie wird gelöscht, nicht nachgezogen.

**Gegenprobe (6a):** die vier Z3-Zählungen müssen VOR und NACH der Umstellung
dieselben Zahlen liefern (9 / 4 / 8 / 2) — wörtlich melden.

## 7 — A7: einmal maskieren, dann schneiden

**Befund (gemessen):** die Datei maskiert an zwei Stellen — Zeile 643 einen
AUSSCHNITT, Zeile 739 die GANZE Datei. `maskiereKommentare()` ist ein
ZUSTANDSBEHAFTETER Tokenizer (Stapel offener Template-Literale,
`letztesTokenWert` für Regex-vs-Division); ein Ausschnitt startet ihn ohne
Kontext. Heute liefern beide Wege **byteweise dasselbe** (selbst gemessen) —
der Unterschied ist LATENT und wird scharf, sobald der Ausschnitt an einer
Stelle beginnt, an der der Tokenizer-Zustand nicht neutral ist.

**Die Lesespur (R2) stuft denselben Befund als BLOCKIEREND ein und liefert die
konkrete Konstruktion:** endet der Code unmittelbar VOR der Marke mit einem
Ausdruckswert und beginnt der Bereich mit einer Division, liest der isolierte
Aufruf das `/` als Regex-Start und maskiert echten Code weg — der Riegel bliebe
blind grün. **Die Einstufung „blockierend" trägt für den HEUTIGEN Stand
nicht** (selbst nachgemessen: beide Wege byteweise identisch; die Marke steht
auf Zeile 2773 an einer Anweisungsgrenze im Schleifenrumpf, wo
`letztesTokenWert` in beiden Fällen falsch ist). Die KLASSE trägt, die
Dringlichkeit nicht — und die Behebung ist dieselbe und billig, deshalb wird
sie gebaut.

Der Kopfkommentar des Helfers nennt die Längenerhaltung ausdrücklich als Grund
dafür, dass man EINMAL maskiert und DANACH schneidet.

**Umsetzung:** einmal `maskiereKommentare(GERAETE_QUELLTEXT_ROH)` bilden, beide
Verwendungen daraus bedienen (`.slice(zeilenbeginnNachMarke, ende)` für den
Abschnitt). Spart zugleich einen Durchlauf.

**Reihenfolge — vom Haupt-Agenten vorab geklärt, damit sie kein Problem ist:**
Punkt 1 schreibt den literalen Sollwert `2291` fest, gemessen am
AUSSCHNITTS-Weg. Nachgemessen auf BEIDEN Wegen:

```
Punkt 1 Sollwert am ALTEN Weg (Ausschnitt): 2291
Punkt 1 Sollwert am NEUEN Weg (Punkt 7)  : 2291
gleich?                                  : true
```

Punkt 7 verschiebt den Sollwert also NICHT. Trotzdem nach der Umstellung
einmal nachmessen und wörtlich melden — weicht er wider Erwarten ab, ist das
ein eigener Befund (es hiesse, die beiden Wege sind doch nicht gleich).

## 8 — A4: Existenz-Zusicherung für den Anker

**Befund:** `/WITH gesperrt AS \((?:(?!\bneu AS \()[\s\S])*?FOR UPDATE\s*\)/`
begrenzt das Fenster ausschliesslich über die Zeichenkette `neu AS (`. Wird die
zweite CTE umbenannt, reicht das Fenster bis Dateiende. Für den CTE-NAMEN gibt
es eine Positivkontrolle (`cteNamenTreffer === 1`), für den ANKER nicht.

**Heute folgenlos** (selbst gemessen): im maskierten `geraete.js` steht genau
EIN `FOR UPDATE)`, nämlich das richtige (Zeile 2965). Die Klasse ist trotzdem
echt, sobald irgendwo ein zweites entsteht.

**Umsetzung:** analog zu `cteNamenTreffer` eine Zusicherung, dass `neu AS (` im
maskierten Quelltext GENAU EINMAL vorkommt, vor der Fensterprüfung.

**Gegenprobe (8a):** `neu AS (` in `geraete.js` nach `nachtrag AS (` umbenennen
→ die neue Existenz-Zusicherung MUSS fallen. **Es gibt genau EIN Vorkommen**
(selbst nachgemessen, roh wie maskiert 1) — der Sollwert der Zusicherung ist
also `=== 1`, und die Mutation ist eine einzige Ersetzung.

## 9 — A6: die Zeilennummern durch ein SUCHMUSTER ersetzen

**Befund (gemessen im Stand `5735eac`):**

```
6614:router.post("/geraetewartung/geraet/bearbeiten/:id", …
6723:            UPDATE wartung_geraete SET name=$1, inventarnummer=$2, notizen=$3, …
```

Der Kommentar in `routes/admin/geraete.js:2915` nennt `:6605`/`:6714`.
**Das ist die DRITTE Runde in Folge, in der genau diese beiden Zahlen falsch
sind** (davor `:6524`/`:6633`). Jede Runde hat sie „berichtigt" und dabei nur
um den falschen Betrag fortgeschrieben.

**Umsetzung — und hier wird die Klasse geschlossen, nicht der Einzelfall:**
Zeilennummern als Verweis auf eine Datei, die sich bei jedem Beitrag
verschiebt, sind keine haltbare Angabe. Der Kommentar nennt ab jetzt das
SUCHMUSTER statt der Zahl:

```
// Der gegenläufige Schreibweg steht in derselben Datei; zu finden über
//   grep -n 'router.post("/geraetewartung/geraet/bearbeiten/:id"' routes/admin/geraete.js
// und das notizen-UPDATE darin über
//   grep -n 'UPDATE wartung_geraete SET name=\$1' routes/admin/geraete.js
// (KEINE Zeilennummer — sie war dreimal in Folge falsch, s.
//  plaene/diffpruefung-ladebestand-runde6.md, Befund A6.)
```

Das ist die einzige Änderung an `routes/admin/geraete.js` in diesem Auftrag,
und sie ist ein Kommentar.

## 9b — R3: der GANZDATEI-Weg braucht eine Positivkontrolle

**Befund der Lesespur, selbst nachgemessen.** Für die FOR-UPDATE-Zusicherung
wird `maskiereKommentare()` auf die GANZE Datei angewendet
(`geraeteOhneKommentare`). Dieser Weg hat **überhaupt keine** Kontrolle, dass
die Maskierung gewirkt hat:

```
Laengen-Zusicherung darauf   : false
nichtLeerraum darauf         : false
Anker-Zusicherung (includes) : false
```

Die einzige Positivkontrolle des Blocks ist `cteNamenTreffer === 1` — sie prüft
den CTE-NAMEN, nicht die Bereinigung. Die ausführende Spur fand die Tautologie
am AUSSCHNITTS-Weg (A1) und übersah, dass der Ganzdatei-Weg gar nichts hat.
Beleg aus derselben Messung: unter der A1-Mutation lief die ganze Datei mit
29 PASS / 0 FAIL durch — also auch dieser Block.

**ACHTUNG, HIER IST DIE BEHEBUNG DIE GEFAHR.** Die Lesespur schlägt als ersten
Punkt `geraeteOhneKommentare.length === GERAETE_QUELLTEXT_ROH.length` vor. Das
ist WÖRTLICH die Tautologie aus Punkt 1 dieses Auftrags, eine Ebene höher.
**Sie wird NICHT gebaut.**

**UND ein literaler Sollwert wird hier AUCH NICHT gebaut** — anders als in
Punkt 1, und der Unterschied ist gemessen. Für den Abschnitt ist `2291` ein
brauchbarer Wert, weil der Abschnitt ein absichtlich stabiler, bewachter
Bereich ist: ändert ihn jemand, SOLL das auffallen. Für die GANZE Datei wäre
er `202415` (roh 345073, selbst gemessen) — und `routes/admin/geraete.js`
ändert sich bei fast jedem Beitrag. Ein literaler Sollwert darauf verwandelt
jede legitime Produktivänderung in einen roten Lauf und wird nach dem dritten
Mal nicht mehr nachgezogen, sondern entfernt. Hausregel dazu: eine Zusicherung,
die aus dem falschen Grund rot wird, wird abgeschaltet statt gelesen.

**Gebaut werden stattdessen zwei INHALTLICHE Zusicherungen**, beide unabhängig
vom Umfang der Datei:

* **ein CODE-ANKER, der die Maskierung überleben MUSS** —
  `geraeteOhneKommentare.includes('router.post("/geraetewartung/brandschutz"')`.
  Er unterscheidet „hat Kommentare entfernt" von „hat Code entfernt".
* **ein KOMMENTAR-ANKER, der VERSCHWUNDEN sein muss** — eine wörtlich
  gewählte Zeichenkette, die im Bestand ausschliesslich in einem Kommentar
  vorkommt (vor dem Bau per `grep` belegen, dass sie genau einmal und nur im
  Kommentar steht) und im maskierten Text NICHT mehr vorkommen darf.

Die beiden zusammen schliessen beide Richtungen — zu wenig maskiert und zu
viel maskiert — ohne von der Dateigrösse abzuhängen.

**Gegenprobe (9b-a):** dieselbe codefressende Mutation wie 1a
(`req.studioId` längenerhaltend leeren) → **erwartetes Ergebnis benennen, bevor
gemessen wird**: der CODE-ANKER liegt NICHT im gefressenen Bereich, er bleibt
also grün; rot werden MUSS die Zusicherung aus Punkt 1. Wird dabei
unerwartet etwas anderes rot, ist das ein Befund, kein Erfolg.
**Gegenprobe (9b-b):** eine Mutation, die den Masker nichts tun lässt
(`return src;`) → der KOMMENTAR-ANKER MUSS fallen.
**Gegenprobe (9b-c):** eine Mutation, die den Masker ALLES fressen lässt
(längenerhaltend, z. B. `return " ".repeat(src.length);`) → der CODE-ANKER
MUSS fallen. Erst diese drei zusammen belegen die Klasse; eine Gegenprobe in
nur einer Richtung belegt den Einzelfall.

## 10 — A8: bekannte Grenze BENENNEN, nicht beheben

**Befund (gemessen):** ein mittiger Kommentar in einem Template-Literal
überlebt die Maskierung VOLLSTÄNDIG:

```
maskiereKommentare("const s = `SELECT 1 /* nie db.query() hier */`;")
  →              "const s = `SELECT 1 /* nie db.query() hier */`;"
```

Der bewachte Abschnitt enthält acht Backticks (vier SQL-Templates). Ein
künftiger Erklärkommentar darin lässt den Punkt-4-Riegel an REINER PROSA
anschlagen — die Umkehrung von „Tests dürfen nicht an Prosa scheitern", und mit
dem alten Reiniger war das nicht möglich. Heute latent: 0 übriggebliebene `//`
im maskierten Abschnitt.

**KEINE Änderung am Hausstandard.** Er wird von 43 Dateien benutzt; ihn für
diesen Wächter umzubauen wäre die teuerste denkbare Behebung für einen latenten
Fall. Stattdessen: ein Kommentar an der Riegelstelle, der die Grenze benennt
und sagt, was zu tun ist, wenn sie einmal zuschlägt (Erklärkommentar aus dem
Template herausziehen, nicht den Riegel abschwächen).

---

## Abnahme

* Volle Suite: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`.
  NICHT in ein äusseres `flock` packen — sie sperrt selbst.
* Dateizahl-Ritual: gelaufene gegen registrierte Dateien, `diff` EXIT 0.
  Beide Seiten mit DEMSELBEN Sieb.
* `npm run lint`, Ergebnis WÖRTLICH melden, auch bei Grün.
* Die Gegenproben 1a, 2a, 2b, 2c, 3a, 5a, 6a, 6b, 8a, 9b-a, 9b-b, 9b-c
  einzeln, jede wörtlich mit EXIT und PASS/FAIL, **Mutation UND Rücknahme**.
  Vor jeder Gegenprobe das ERWARTETE Ergebnis hinschreiben, danach das
  gemessene — weicht es ab, ist das ein Befund und kein Betriebsunfall.
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker `GEGENPROBE-`+`DEFEKT` im Ersatztext, `node --check` danach,
  Rücknahme gegen eine unabhängige `cp`-Kopie mit `diff` EXIT 0.
  NIE `git checkout`/`git stash`, NIE mit einem Testlauf verkettet.
* Am Ende `git status` sauber; Marker-Scan mit `--exclude-dir` (am PFAD, nicht
  an der Zeile) und nur Prosatreffer.
