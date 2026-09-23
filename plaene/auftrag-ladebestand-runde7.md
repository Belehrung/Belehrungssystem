# Bauauftrag Runde 7 „ladebestand" — Nacharbeit zur Diffprüfung Runde 6

**Zielrepo:** `/home/user/gymdocu`, Zweig `beitrag-ladebestand`, Basis `5735eac`.

**Grundlage:** `plaene/diffpruefung-ladebestand-runde6.md`. Dort stehen 14
Befunde der ausführenden Prüfspur, **jeder einzeln vom Haupt-Agenten
nachgemessen**, mit den Messwerten. Der Auftrag setzt nur um, was getragen hat.

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

**A3: die Suche läuft nur VORWÄRTS** (`eigenerQuelltext.slice(nachStelle)`).
Die umgekehrte Reihenfolge — erst `r.text()`, dann
`pruefeKeinFehlerseiten(r, …)` — ist unsichtbar und seit dem Wegfall von
`r.clone()` in Runde 6 neu scharf: der Helfer wirft dann an seinem eigenen
`await r.text()` (Zeile 93) „Body is unusable".
→ Für jeden Aufrufer im GANZEN maskierten Quelltext suchen, nicht nur dahinter.

**A14 (gemessen): `r1` und `r3` kommen je ZWEIMAL als Helferargument vor.**
Mit der Suche über die ganze Datei wird daraus ein echter Fehlalarmweg statt
eines dokumentierten.
→ Die vier Vorkommen eindeutig benennen (`r1Z1`/`r1Z2`, `r3Z1`/`r3Z2` oder
sprechender). Danach ist jeder Bezeichner einmalig, und die Suche über die
ganze Datei erzeugt keinen Fehlalarm mehr.

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
während das geprüfte Prädikat inzwischen sieben Alternativen umfasst. Fällt sie
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

**Wichtig, damit die Behebung nichts verschlimmert:** der Zähler darf den
ORIGINALFEHLER des Tests nicht verdrängen. Läuft der `finally` nach einem
geworfenen Fehler, bleibt der geworfene Fehler massgeblich; die Aufräumfehler
werden dann nur protokolliert. Nur auf dem ERFOLGSPFAD macht der Zähler den
Lauf rot.

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

**Umsetzung:** `GERAETE_QUELLTEXT_OHNE_KOMMENTARE` löschen, die Z3-Zählungen
(Zeile ~1792) auf den maskierten Quelltext umstellen. Hausregel „Dieselbe
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

Der Kopfkommentar des Helfers nennt die Längenerhaltung ausdrücklich als Grund
dafür, dass man EINMAL maskiert und DANACH schneidet.

**Umsetzung:** einmal `maskiereKommentare(GERAETE_QUELLTEXT_ROH)` bilden, beide
Verwendungen daraus bedienen (`.slice(zeilenbeginnNachMarke, ende)` für den
Abschnitt). Spart zugleich einen Durchlauf.

**Achtung, Reihenfolge:** Punkt 1 dieses Auftrags schreibt einen literalen
Sollwert `2291` für den Abschnitt fest. Er wurde am AUSSCHNITTS-Weg gemessen.
Nach der Umstellung den Wert ERNEUT messen und, falls er abweicht, den
literalen Sollwert anpassen UND die Abweichung melden — sie wäre ein eigener
Befund (sie hiesse, dass die beiden Wege doch nicht gleich sind).

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
(beide Vorkommen) → die neue Existenz-Zusicherung MUSS fallen.

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
* Die Gegenproben 1a, 2a, 2b, 2c, 3a, 5a, 6a, 8a einzeln, jede wörtlich mit
  EXIT und PASS/FAIL, **Mutation UND Rücknahme**.
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker `GEGENPROBE-`+`DEFEKT` im Ersatztext, `node --check` danach,
  Rücknahme gegen eine unabhängige `cp`-Kopie mit `diff` EXIT 0.
  NIE `git checkout`/`git stash`, NIE mit einem Testlauf verkettet.
* Am Ende `git status` sauber; Marker-Scan mit `--exclude-dir` (am PFAD, nicht
  an der Zeile) und nur Prosatreffer.
