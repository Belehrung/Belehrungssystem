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

## VORRANGIG: die REIHENFOLGE der Zusicherungen im Punkt-4-Block

**Das ist der wichtigste Satz dieses Auftrags, und er kommt aus der
Planprüfung** (Spur A, Befund 1, selbst nachgemessen). `assert` wirft beim
ERSTEN Verstoss. Die sieben Zusicherungen stehen heute so:

```
1 includes('schreibePruefplan(')     4 kein BEGINN-Marker
2 Längengleichheit  ← hier käme 2291  5 PRUEFPLAN_VERBOTENES_MUSTER  ← DER RIEGEL
3 Anzahl 6                            6 cteNamenTreffer   7 FOR UPDATE
```

Ein Mengen-Wächter auf Position 2 fällt **vor** dem Riegel auf Position 5.
Die Gegenproben 3a (zwei Zeilen einfügen) und 8a (`neu AS (` umbenennen)
verändern beide den Abschnitt — sie wären am Mengen-Wächter rot geworden und
hätten den Riegel nie erreicht. **Das ist genau die Isolationsfalle, die
dieser Auftrag bei 3a selbst benennt und bei Punkt 1 übersehen hatte.**

**Verbindliche Reihenfolge nach dem Umbau — INHALTLICHE Prädikate zuerst,
MENGEN zuletzt:**

```
1 includes('schreibePruefplan(')        (Vorbedingung, bleibt vorn)
2 Längengleichheit ROH <-> MASKIERT     (VERTRAG des Helfers, s. Punkt 1 —
                                         muss VOR allem stehen, was Versatz-
                                         werte benutzt, also vor dem Schnitt)
3 PRUEFPLAN_VERBOTENES_MUSTER           (der Riegel)
4 kein BEGINN-Marker
5 cteNamenTreffer === 1
6 Existenz "neu AS (" === 1             (neu, Punkt 8)
7 FOR-UPDATE-Fenster
8 Code-Anker + Kommentar-Anker          (neu, Punkt 9b)
9 Richtungskontrolle (Ungleichung)      (neu, Punkt 9b)
10 nichtLeerraum(abschnitt) === 2291    (neu, Punkt 1)
11 Anzahl schreibePruefplan( === 6
```

**Position 2 ist kein Widerspruch zur Regel „Mengen zuletzt".** Die
Längengleichheit ist keine Mengenaussage über den Abschnitt, sondern eine
VERTRAGSPRÜFUNG über den geteilten Helfer, von der der Schnitt selbst abhängt
(Begründung und Messung in Punkt 1). Sie muss deshalb stehen, BEVOR ein
Versatzwert benutzt wird — und sie kann von keiner Gegenprobe ausgelöst
werden, die nur den INHALT des Abschnitts ändert, weil sie über die GANZE
Datei geht.

Unter der 1a-Mutation (Masker frisst `req.studioId`) bleibt der Riegel grün —
es steht ja kein verbotenes Muster darin — und 2291 fällt trotzdem. Keine
Gegenprobe verliert ihren Beweis.

## DIE BAUREIHENFOLGE — verbindlich

Die Punkte sind nach Befunden nummeriert, **nicht** nach Baureihenfolge. Zwei
Abhängigkeiten zwingen die Folge; beide sind in ihren Punkten begründet und
gemessen:

```
Schritt 1:  Punkte 7 + 6 ZUSAMMEN   (einmal maskieren auf IIFE-Ebene,
                                     Z3 mit umstellen, zweiten Reiniger löschen)
Schritt 2:  Punkt 1                 (Sollwerte am FINALEN Weg messen)
Schritt 3:  Punkt 9b                (Anker + Richtungskontrolle)
Schritt 4:  Punkte 2, 3, 4, 5, 8, 9, 10   (Reihenfolge untereinander frei)
Schritt 5:  Die REIHENFOLGE der Zusicherungen herstellen (s. Abschnitt oben)
Schritt 6:  Alle Gegenproben, einzeln
```

**Warum 7+6 zuerst:** sie verschieben den Weg, auf dem Punkt 1 seinen Sollwert
misst. Umgekehrt gebaut, misst Punkt 1 am alten Weg und der Wert müsste
hinterher nachgezogen werden — das ist genau die Sorte Nacharbeit, die still
falsch wird.

**Warum 7 und 6 ZUSAMMEN:** Punkt 6 braucht die Konstante, die Punkt 7 auf
IIFE-Ebene hebt. Einzeln gebaut ergibt Punkt 6 einen `ReferenceError` zur
LAUFZEIT, den `node --check` nicht sieht (gemessen, s. Punkt 7).

**Was dieser Auftrag NICHT ist:** eine Änderung am Produktivverhalten. Er fasst
in `routes/admin/geraete.js` ausschliesslich einen KOMMENTAR an. Alles Übrige
liegt in `test_feature_ladebestand_streng.js`.

---

## 1 — A1 + B2: die Längenzusicherung EHRLICH machen und ergänzen

**Befund (gemessen):** `assert.strictEqual(abschnitt.length, ende -
zeilenbeginnNachMarke, …)` in Zeile 660 kann nicht fallen.
`maskiereKommentare()` baut aus `src.split("")` und gibt `out.join("")` zurück
— die Länge ist per Konstruktion gleich. Unter einer längenerhaltenden
Mutation, die jedes `req.studioId` aus dem Abschnitt frisst, lief die Datei mit
**TEST_EXIT=0, 29 PASS / 0 FAIL** durch.

**BERICHTIGT durch die Planprüfung (Spur B, Befund B2) — sie wird NICHT
ersetzt, sondern ERGÄNZT.** Meine erste Fassung wollte die Längengleichheit
löschen. Nachgemessen ist das falsch:

```
Versatzwerte aus dem ROHEN Text: zb = 183659   ende = 198402
Nach Punkt 7 wird damit in den MASKIERTEN Text geschnitten:
  trifft es den Abschnitt? erstes schreibePruefplan( bei 1949
  Endmarke im maskierten Text noch lesbar? NEIN (Kommentar, ausgeleert)
  ROH.length = 459772   MASK.length = 459772
```

**Punkt 7 erzeugt eine Versatz-Arithmetik über zwei Texte:** `begin`, `ende`
und `zeilenbeginnNachMarke` werden am ROHEN Quelltext ermittelt und danach in
den MASKIERTEN geschnitten. Die Bereichsmarken stehen selbst in Kommentaren
und sind dort ausgeleert — der Schnitt trifft **ausschliesslich**, weil die
Längen gleich sind. Das Vorbild
`test_feature_audit_kapselung_geraete_static.js:647` sagt genau das in seinem
eigenen Kommentar: „die Fenster-/Klammer-Arithmetik unten setzt das voraus".

**Beide Aussagen sind zugleich wahr:** als Zusicherung über den ABSCHNITT ist
die Längengleichheit eine Tautologie (Befund A1, gemessen). Als
VERTRAGSPRÜFUNG über den geteilten Helfer, von der die Versatz-Arithmetik
abhängt, ist sie tragend.

**Also beides, mit ehrlichen Meldungen:**

* die Längengleichheit BLEIBT — aber ihre Meldung sagt ab jetzt, was sie
  wirklich bewacht („`maskiereKommentare()` ist nicht mehr längenerhaltend —
  die Versatzwerte aus dem rohen Quelltext treffen im maskierten dann die
  falsche Stelle"), nicht mehr „es ging Code verloren";
* `nichtLeerraum` kommt DANEBEN als die Zusicherung über den Abschnitt.

**Umsetzung:** Die Zusicherung über den INHALT wird ergänzt.
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

**A14 hat aber ZWEI Fehlalarmwege, und die Umbenennung schliesst nur den
ersten** (Spur A, Befund 6). Der zweite ist die Meldung selbst: wer einen
16. Aufrufer legitim ergänzt, liest „es müssen 15 Aufrufe … gefunden 16" und
bekommt keinen Hinweis, dass die Zahl von Hand nachzuziehen ist — der steht
nur im Kommentar darüber. → **Die Meldung bekommt den Hinweis.** Vorbild im
Hause: die Meldung der `schreibePruefplan(`-Anzahl trägt ihn bereits.

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

**ACHTUNG — die Fixtur kollidiert mit dem eigenen Scan, und das ist neu**
(Spur A, Befund 5, selbst nachgemessen). Durch die Erweiterung auf die ganze
Datei liegt der C9-Block **erstmals im Trefferraum seines eigenen Scans**. Und
`maskiereKommentare` leert ZEICHENKETTEN nicht:

```
Eingabe : const fixtur = "await rAusloesen.text();";
maskiert: const fixtur = "await rAusloesen.text();";
```

Zwei dauerrote Endzustände sind damit eine Unachtsamkeit entfernt: trägt die
Fixtur einen der 15 echten Aufrufernamen, schlägt die Verstoss-Zusicherung an
der eigenen Fixtur an; enthält sie die Zeichenfolge `pruefeKeinFehlerseiten(`,
zählt die Positivkontrolle 16 statt 15.

**Drei verbindliche Bedingungen an die Fixtur:**

1. ein fiktiver Bezeichner, der garantiert kein Aufrufer ist und es nie wird —
   `rC9SynthetischNiemals`;
2. sie enthält die Zeichenfolge `pruefeKeinFehlerseiten(` **NICHT**;
3. ein Kommentar an der Fixtur benennt beide Kollisionen — sonst „repariert"
   die nächste Runde den künstlichen Namen in einen realistischen.

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
    /\bdb\b|\.\s*query\s*\(|\[\s*['"`](?:query|run|one|tx|q|pool)['"`]\s*\]\s*\(|\b(?:run|one|tx|q|pool)\s*\(/;
```

**Diese Fassung ist gegenüber meinem ersten Entwurf ZWEIMAL korrigiert, beide
Male durch die Planprüfung und beide Male nachgemessen:**

* **Backtick in die Zeichenklasse** (Befund 2). Mein erster Entwurf verlangte
  `'` oder `"` — der ALTE Ausdruck fing `pool[`query`](1)` über sein
  schlampiges `.?`, meiner hätte den Weg **geöffnet**. Gemessen:
  `ALT: gefangen / NEU: DURCH`. Bei `pool[`run`]` und `pool[`one`]` war der
  Weg schon vorher offen — der Befund trägt also im Kern, seine Reichweite
  war zu weit angegeben.
* **Eine aufrufende Klammer dahinter** (Befund 9). Ohne sie hätte mein
  Entwurf reine LESEzugriffe neu verboten — gemessen `req.body['q']`,
  `row['tx']`, `params['one']` alle drei neu gefangen, ohne dass ein
  Datenbankaufruf vorläge.

**Nachgemessen, 15 Proben, 0 Abweichungen:** acht Fangfälle gefangen (beide
Backtick-Formen und `pool["query"] (x)` mit Leerzeichen eingeschlossen),
sieben Durchlassfälle durch, und am heutigen Abschnitt schlägt er nicht an.
Damit sind A5, R4, Befund 2 und Befund 9 mit EINEM Ausdruck geschlossen.

**Bekannte Grenze, die BENANNT und nicht behoben wird:** `q(` sperrt auch
einen künftigen lokalen Ein-Buchstaben-Helfer ohne Datenbankbezug. Im
bewachten Abschnitt sind solche Helfer ohnehin nicht erwünscht; der Name
bleibt in der Riegel-Meldung stehen, damit ein Fehlalarm richtig gelesen
wird.

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

**Die Planprüfung hat meinen Flag-Vorschlag durch einen EINFACHEREN ersetzt,
und der ist besser** (Spur A, Befund 7): die saubere Unterscheidung ist die
**POSITION**, nicht ein Flag. Die Zusicherung steht **NACH dem gesamten
try/finally-Konstrukt**. Dann liefert der Kontrollfluss die Unterscheidung
gratis:

* Wirft der `try`-Rumpf, läuft der `finally` (räumt auf, sammelt Fehler), und
  die Ausnahme propagiert danach weiter — die Zusicherung dahinter wird **nie
  erreicht**. Der Originalfehler bleibt massgeblich, die Aufräumfehler stehen
  nur im Protokoll.
* Läuft der Rumpf durch, wird sie erreicht und fällt.

Kein Flag, kein `assert` im `finally`, und die Fallstricke eines Flags
(`return`/`break`/`continue` im Rumpf) entfallen mit ihm.

```js
let aufraeumFehler = [];              // ARRAY, nicht Zähler — s. u.
try {
    …                                  // unverändert
} finally {
    …                                  // vier Schritte, jedes catch:
                                       // aufraeumFehler.push('<Schritt>: ' + e.message)
}
assert.deepStrictEqual(aufraeumFehler, [],
    `Punkt 1 Aufräumen: ${aufraeumFehler.length} von 4 Schritten fehlgeschlagen — …`);
```

**Ein ARRAY, kein Zähler.** Gegenprobe 5a verlangt „eine Meldung, die alle
drei gescheiterten Schritte nennt" — das kann eine Zahl nicht. Meine eigene
Leitformulierung „einen Zähler führen" war dafür zu schwach.

**Die Zahl 4 gehört literal in die Meldung** — sie sagt dem Lesenden, wie
viele Schritte es gibt, und fällt auf, wenn jemand einen fünften ergänzt, ohne
sie nachzuziehen.

**Gegenprobe (5a), DREI Läufe** — der dritte ist der, den nur die
Positionslösung richtig macht, und er kommt aus der Planprüfung:

* **(a) Erfolgspfad mit Aufräumdefekt** (`spalte_gibt_es_nicht`) → EXIT 1,
  Meldung nennt alle drei gescheiterten Schritte.
* **(b) Fehlerpfad mit demselben Aufräumdefekt**: zusätzlich eine Zusicherung
  im `try`-Rumpf brechen → EXIT 1, und die `FEHLGESCHLAGEN:`-Zeile zeigt den
  **Originalfehler des Tests**, NICHT einen Aufräumfehler. Ein `assert` im
  `finally` hätte hier den Originalfehler verdrängt.
* **(c) unverändert** → EXIT 0.

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

**Gegenprobe (6b), die neue Richtung — mit FESTER Einfügestelle**
(Spur A, Befund 8): einen mittigen Blockkommentar mit
`ladeBestand(req.studioId,` in `routes/admin/geraete.js` einfügen,
**in einer Codezeile AUSSERHALB jedes Template-Literals** — zum Beispiel
unmittelbar hinter einer der acht milden Aufrufstellen.

**Warum die Stelle vorgeschrieben ist:** in einem Template-Literal überlebt ein
mittiger Kommentar AUCH den Hausstandard (das ist Befund A8, den Punkt 10 nur
benennt). Landet die Mutation dort, zählt die Z3-Zählung auch nachher 9, und
die geforderte Richtung „nachher grün" ist **unerfüllbar** — die Gegenprobe
scheiterte dann an der Einfügestelle, nicht an der Behebung. Das
Mutationsskript verankert die Fundstelle entsprechend (Abbruch bei ≠ 1).

Vorher (schwacher Reiniger): die Z3-Zählung MUSS steigen und die Suite rot
werden. Nachher (Hausstandard): sie MUSS grün bleiben. Beide Richtungen
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

**Umsetzung — und die Planprüfung hat hier einen LAUFZEITFEHLER abgefangen,
den `node --check` nicht gesehen hätte** (Spur A, Befund 4, selbst
nachgemessen):

`const geraeteOhneKommentare` steht heute auf Zeile 739 **im Block 590–746**.
Die Verwendung, die Punkt 6 umstellen soll (`const quelltext`, Zeile 1792),
liegt **im Block 1788–…** — einem ANDEREN. Sie kann die Konstante nicht sehen.
Die naive Umsetzung ergäbe `ReferenceError: geraeteOhneKommentare is not
defined` zur LAUFZEIT, während `node --check` grün bleibt.

Nach Punkt 6 gibt es also **DREI** Verwendungen der Ganzdatei-Maskierung, nicht
zwei, wie dieser Punkt ursprünglich annahm.

**Also:** die einmalige Ganzdatei-Maskierung steht auf **IIFE-Ebene VOR dem
Punkt-3-Block**, sichtbar für alle drei Verwendungen. Der Abschnitt entsteht
daraus per `.slice(zeilenbeginnNachMarke, ende)`.

**PUNKTE 6 UND 7 WERDEN ALS EIN SCHRITT GEBAUT**, und zwar VOR Punkt 1 —
sonst misst Punkt 1 seinen Sollwert am alten Weg. Die Reihenfolge lautet:

> **7+6 zuerst** (einmal maskieren, auf IIFE-Ebene, Z3 mit umstellen)
> → **dann 1** (Sollwert am FINALEN Weg messen)
> → **dann 9b** → dann der Rest.

Damit entfällt auch der im Auftrag vorgesehene „danach neu messen"-Fall: der
Wert wird von vornherein am richtigen Weg genommen. **Und der
Erwartungswert 2195 der Gegenprobe 1a ist wegabhängig** — er gehört am
finalen Weg neu gemessen, nicht aus diesem Papier abgeschrieben.

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
//   grep -n 'geraetewartung/geraet/bearbeite[n]' routes/admin/geraete.js
// und das notizen-UPDATE darin über
//   grep -n 'UPDATE wartung_geraete SET name=[$]1' routes/admin/geraete.js
// (KEINE Zeilennummer — sie war dreimal in Folge falsch, s.
//  plaene/diffpruefung-ladebestand-runde6.md, Befund A6. Die eckigen
//  Klammern sind Absicht: ohne sie findet das Kommando DIESEN Kommentar
//  mit — gemessen 2 Treffer statt 1.)
```

**Die eckigen Klammern sind der eigentliche Fund der Planprüfung hier**
(Spur A, Befund 10). Ein Kommentar, der sein eigenes Suchmuster wörtlich
trägt, findet sich selbst — der Suchende landet auf dem Hinweis, der ihm sagt,
wo er suchen soll. Gemessen an einer Probedatei:

```
ohne Klammern         : 2 Treffer   ← der Kommentar findet sich selbst
Vorschlag der Prüfspur: 2 Treffer   ← behebt es NICHT
Klammertrick          : 1 Treffer, und zwar die richtige Zeile
```

**Der Behebungsvorschlag der Prüfspur trug nicht** — sie schlug vor, das
`router.post("`-Präfix wegzulassen, was den Selbsttreffer nicht verhindert.
Der Klammertrick ist derselbe, den wir aus demselben Grund schon bei
`GEGENPROBE-`+`DEFEKT` benutzen. Nach dem Einfügen **beide Kommandos einmal
ausführen und die Trefferzahl (je 1) in den Bau-Bericht schreiben.**

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
* **eine RICHTUNGSKONTROLLE als Ungleichung** (Vorschlag der Planprüfung,
  Spur A, Befund 3 — besser als meine erste Fassung):
  `nichtLeerraum(geraeteOhneKommentare) < nichtLeerraum(GERAETE_QUELLTEXT_ROH)`.
  Sie fällt bei `return src;`, kostet bei jeder legitimen Änderung nichts und
  braucht nie nachgezogen zu werden. **Sie ist NICHT tautologisch** — anders
  als eine Gleichheit über Längen kann sie falsch werden, sobald die
  Maskierung nichts mehr tut.

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

* **Zu JEDER roten Gegenprobe die ERSTE FAIL-Zeile wörtlich melden**, nicht
  nur „EXIT 1". `assert` wirft beim ersten Verstoss; rot allein sagt nicht, ob
  die GEMEINTE Zusicherung gefallen ist. Aus der Planprüfung (Spur B,
  Befund B3): 9b-b und 9b-c mutieren den GETEILTEN Masker und wirken damit auf
  die ganze Datei. Nachgemessen laufen die 9b-Anker zwar VOR Fixtur 4b
  (Zeile 739 gegen 762), der Befund fällt also — aber die Vorsicht bleibt
  richtig.

* **2a und 2b belegen die STATISCHE Erkennung, nicht das Laufzeitverhalten**
  (Spur B, Befund B4, nachgemessen): der C9-Block steht auf 545–578, die
  Datenbankblöcke ab 1465 bzw. 1697. Eine Mutation im DB-Block wird vom Scan
  gefangen, bevor der Block läuft. Das ist der Zweck des Scans — es wird nur
  nicht mehr behauptet, die Probe zeige den `TypeError`.

* **2b nennt die NEUEN Bezeichner** (Spur B, Befund B5): nach der Umbenennung
  aus Punkt 2 heisst es `await r1Ausstattung.text();` im Ausstattungsblock,
  nicht `r1`. Mit dem alten Namen suchte der Scan einen Bezeichner, den es
  nicht mehr gibt — die Gegenprobe bliebe fälschlich grün.
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker `GEGENPROBE-`+`DEFEKT` im Ersatztext, `node --check` danach,
  Rücknahme gegen eine unabhängige `cp`-Kopie mit `diff` EXIT 0.
  NIE `git checkout`/`git stash`, NIE mit einem Testlauf verkettet.
* Am Ende `git status` sauber; Marker-Scan mit `--exclude-dir` (am PFAD, nicht
  an der Zeile) und nur Prosatreffer.
