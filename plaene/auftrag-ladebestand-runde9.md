# Bauauftrag Runde 9 „ladebestand" — Nacharbeit zur Diffprüfung Runde 8

**Zielrepo:** `/home/user/gymdocu`, Zweig `beitrag-ladebestand`, Basis `ee7179f`.
**Grundlage:** `plaene/diffpruefung-ladebestand-runde8.md`, elf Befunde, drei
davon vom Haupt-Agenten selbst nachgemessen.

**Zeilennummern gelten am Stand `ee7179f` — nach SUCHMUSTER arbeiten.**

---

## Der gemeinsame Nenner, und warum er diesmal vorn steht

**Zwei Behebungen der Runde 8 verfehlen ihr Ziel, und beide aus DEMSELBEN
Grund: sie haben eine ZWEITE, PARALLELE Fassung erzeugt, statt die vorhandene
zu binden.**

* Der C7-Wächter bekam einen **zweiten Schnitt** (`rohAusschnitt`) statt einer
  Bindung an den benutzten (`abschnitt`).
* Der Riegel bekam eine **Probenmatrix in Prosa** („15 Proben, 0
  Abweichungen") statt Fixturen.

Beides ist gemessen wirkungslos. **Vor jeder Behebung in dieser Runde deshalb
die Frage: binde ich das Vorhandene, oder stelle ich etwas daneben?** Wer
etwas danebenstellt, baut die nächste Runde schon mit ein.

## 1 — M1: den C7-Wächter an den BENUTZTEN Schnitt binden

**Gemessen.** Mutiert man `abschnitt` auf den falschen Schnitt
(`geraeteOhneKommentare.slice(begin, ende)` — genau die dokumentierte
C7-Regression), bleibt alles grün:

```
TEST_EXIT=0   ──── 32 PASS / 0 FAIL ────
```

Der C7-Wächter prüft `rohAusschnitt`, der aus den RICHTIGEN Versatzwerten
entsteht und von der Mutation unberührt bleibt. Die einzige Zusicherung, die
die Bindung herstellte, war die in Runde 8 gelöschte
`abschnitt.length === ende - zeilenbeginnNachMarke`.

**Meine Löschbegründung war halb richtig:** sie war tautologisch gegenüber der
LÄNGENERHALTUNG des Maskers — aber nicht gegenüber den SCHNITTGRENZEN.

**Umsetzung:** eine Zusicherung, die die beiden Schnitte gegeneinander hält:

```js
assert.strictEqual(abschnitt.length, rohAusschnitt.length, `…`);
```

Zwei unabhängig geschnittene Zeichenketten — keine Tautologie. **Vorab
gemessen:**

```
richtiger Schnitt : true  (15782 / 15782)
falscher  Schnitt : false (15847 / 15782)
```

`rohAusschnitt` muss dafür VOR dieser Zusicherung stehen; die Reihenfolgenliste
im Kommentar wird entsprechend nachgezogen.

**EINWAND DER PLANPRÜFUNG — er trägt in der Prämisse, FÄLLT aber in der
Folge.** Sie hält fest, beide Schnitte kämen aus denselben Versatzwerten, eine
Mutation der WERTE selbst mache also beide gleich falsch und bleibe
unentdeckt. Die Prämisse stimmt. Die Folge („die Suite bleibt grün") nicht —
**dafür ist der C7-Wächter da, und er feuert.** Selbst nachgemessen, welche
Versatz-Mutation welcher Wächter fängt:

| Mutation | gefangen von |
|---|---|
| unmutiert (Kontrolle) | — (nichts feuert, richtig so) |
| nur `abschnitt` ab `begin` | **Längenbindung** (neu) |
| BEIDE ab `begin` | **C7** |
| `ende` 500 Zeichen zu früh | **nichtLeerraum** |
| `ende` 500 Zeichen zu spät | keiner |
| `zeilenbeginnNachMarke` 200 zu spät | keiner |

Die beiden letzten sind KEINE Lücke: nachgemessen enthalten beide
verschobenen Bereiche **ausschliesslich Kommentar** (`nichtLeerraum` des
maskierten Zusatzes = 0). Dort verschiebt sich nichts, was die Wächter
bewachen sollen — sie ignorieren korrekt einen Leerzug.

**Die drei Wächter decken also komplementäre Klassen ab**, und genau das ist
der Unterschied zur gerügten Runde-8-Fassung: dort gab es EINEN Wächter, der
die benutzte Grösse nicht sah; hier sichern drei verschiedene Eigenschaften
jeweils eine andere Mutationsklasse.

**Gegenprobe (1a):** `abschnitt` auf `slice(begin, ende)` mutieren → MUSS rot
werden. **Vorher gegen den Stand `ee7179f` messen und wörtlich belegen, dass
er dabei GRÜN bleibt** — sonst ist der Befund nicht reproduziert.

## 2 — M2: der Riegel braucht FIXTUREN, keine Prosa

**Gemessen.** Beide Klammer-Alternativen aus `PRUEFPLAN_VERBOTENES_MUSTER`
entfernt →

```
TEST_EXIT=0   ──── 32 PASS / 0 FAIL ────
```

Fixtur 1 bleibt `false`, Fixtur 3 trifft schon auf `\bdb\b`, der Riegel am
echten Abschnitt bleibt `false`. **Genau der Teil, den Runde 8 repariert hat,
ist von nichts bewacht.**

**Umsetzung — JE EINE Fixtur pro Alternative**, wie es dieselbe Datei beim
C9-Prädikat bereits vormacht (dort ausdrücklich mit der Begründung, dass eine
gemeinsame Fixtur bei einer Alternation nichts prüft):

```js
const RIEGEL_FANGFAELLE = [
    ['Bezeichner db',            'db.run(1)'],
    ['Punktform .query(',        't.query(1)'],
    ['Klammerform query (Referenz)', 'const f = pool["query"]; await f(sql);'],
    ['Klammerform query, Backtick',  'pool[`query`](1)'],
    ['Klammerform run mit Aufruf',   'pool["run"]("UPDATE x")'],
    ['Klammerform run, Backtick',    'pool[`run`]("UPDATE x")'],
    ['Leerzeichen vor der Klammer',  'pool["run"] (x)'],
    ['bare-Aufruf run',              'run("UPDATE x")'],
    ['bare-Aufruf one',              'one("SELECT 1")'],
    ['bare-Aufruf tx',               'tx(async () => {})'],
    ['bare-Aufruf q',                'q("SELECT 1")'],
    ['bare-Aufruf pool',             'pool("x")'],
];
const RIEGEL_DURCHLASSFAELLE = [
    ['Lesezugriff q',   "const s = req.body['q'];"],
    ['Lesezugriff tx',  "const t = row['tx'];"],
    ['Lesezugriff one', "const n = params['one'];"],
    ['Variable in Klammern', 'const feld = werte[query];'],
    ['Namensteil',      'a[queryX]'],
    ['der erlaubte Weg','await schreibePruefplan(x, y)'],
    ['Eigenschaft',     'const rows = ergebnis.rows'],
];
```

Jeder Fall EINZELN zugesichert, mit seiner Bezeichnung in der Meldung. Die
Zahlen (12 und 7) literal gegen die Listenlänge halten, damit ein stilles
Kürzen auffällt.

**ZWEI KORREKTUREN AUS DER PLANPRÜFUNG, beide nachgemessen:**

* **Der bare-Aufruf-Zweig war nur für `run` bewacht.** Gemessen: entfernt man
  `q|one|tx|pool` aus `\b(?:run|one|tx|q|pool)\s*\(`, bleiben ALLE meine
  ursprünglichen Fangfälle gefangen — die Alternative war von keiner Fixtur
  gedeckt. Jetzt je eine Fixtur pro Name.
* **Die Leerzeichen-Fixtur testete das Leerzeichen nicht.** Gemessen:
  `pool["query"] (x)` trifft schon auf die Klammerform OHNE Aufruf
  (`pool["query"]` allein → `true`), die Leerraum-Toleranz `\]\s*\(` wird
  dabei gar nicht berührt. Mit `pool["run"] (x)` hingegen greift sie: gegen
  eine strenge Fassung ohne `\s*` fällt die Fixtur (`false`). Genau so ist
  sie jetzt gewählt.

**Gegenprobe (2a):** eine Alternative aus dem Muster entfernen → die
zugehörige Fangfall-Zusicherung MUSS fallen, und die Meldung MUSS den
betroffenen Fall benennen. Für BEIDE Klammer-Alternativen einzeln messen.

## 3 — M3: eine falsche Tatsachenbehauptung im Kommentar

**Gemessen** am committeten Stand: `ROH 18 Treffer, MASKIERT 15`. Der
Kommentar behauptet „roh wie maskiert dieselben 15 Treffer … die Maskierung
nimmt heute nichts weg".

**Umsetzung:** Satz berichtigen. **Die Maskierung ist TRAGEND, nicht
dekorativ** — drei Kommentar-Erwähnungen schreiben nicht `<r>`, und ohne
Maskierung wäre der Sollwert 15 falsch. Das gehört genau so dort hin, weil ein
Leser sonst schliesst, die Maskierung sei entbehrlich.

## 4 — M5 bis M7, M9, M10: die Aufräum-Zusicherung fertig machen

* **M5:** `srvEigen.close()` wird weder abgewartet noch geprüft. →
  `await new Promise((res) => srvEigen.close(res))` und danach
  `srvEigen.listening === false` zusichern. Damit hat Schritt 1 denselben
  Beleg wie die drei DELETEs; heute ist er ein Wächter, der nicht feuern kann
  (`close()` wirft nicht — in Runde 8 selbst gemessen und im Kommentar
  festgehalten, aber nicht behoben).
**REIHENFOLGE INNERHALB DIESES PUNKTES — verbindlich** (Planprüfung, Befund 3,
und die Begründung trägt): **erst M7 und M9, dann M6.** Zieht man die
Mengenabfrage vor, solange sie nur zwei der drei Tabellen kennt, entsteht eine
neue Lücke: scheitert `DELETE FROM wartung_pruefungen` und gelingen die
anderen beiden, meldet die vorgezogene Abfrage 0 Reste und ist grün, während
die Ursachen-Zusicherung dahinter nie erreicht wird. Das Vorziehen ist erst
richtig, wenn die Abfrage vollständig ist.

* **M6:** die Mengenabfrage steht NACH der schwächeren Ausnahme-Zusicherung.
  Im gemessenen Fall (erster DELETE scheitert) wird sie nie erreicht — man
  erfährt die Ursache, aber nicht, WELCHE Zeilen überlebt haben. → Mengenabfrage
  ZUERST ausführen, beide Ergebnisse sammeln, dann beide melden.
* **M7:** die Abfrage deckt `wartung_geraete` und `wartung_kategorien`, aber
  nicht `wartung_pruefungen` — obwohl der `finally` drei Tabellen aufräumt.
  Heute fällt es nur wegen eines zufälligen `ON DELETE RESTRICT` nicht auf. →
  dritte Tabelle aufnehmen, und die literale „4" in der Meldung gegen dieselbe
  Liste halten, die die Schritte treibt.
  **Dafür fehlt heute die ID** (Planprüfung, Befund 6, nachgemessen): das
  `INSERT INTO wartung_pruefungen` trägt KEIN `RETURNING id` — die beiden
  `RETURNING id` in der Datei gehören zu anderen Inserts. Der Aufräumschritt
  löscht über `studio_id` + `geraet_id`, eine Mengenabfrage über `id` braucht
  die Zeilen-ID. → beim Anlegen `RETURNING id` ergänzen und in einen eigenen
  Schnappschuss nehmen. Ohne das ist die dritte Tabelle in der Abfrage blind.
* **M9:** `UNION ALL` verwirft die Herkunft; Geräte- und Kategorie-IDs sind
  unabhängige Sequenzen und kollidieren in einer frischen Wegwerf-DB
  routinemässig. → `SELECT 'geraet' AS tabelle, id … UNION ALL SELECT
  'kategorie', id …`, beide Spalten melden.
* **M10:** der Kategorie-Schnappschuss liest die Variablen, gegen die er immun
  sein soll — nur die Geräteseite ist DB-bestätigt. → vor dem Schnappschuss
  eine Abfrage, die für die beiden Kategorie-IDs **2 Zeilen** liefern muss.
  **MIT `studio_id`** (Planprüfung, Befund 5 — und das ist Punkt 1 unserer
  Prüfreihenfolge, nicht eine Stilfrage): die beiden Kategorien gehören zu
  VERSCHIEDENEN Studios, eine Abfrage nur über `id = ANY(...)` wäre
  mandantenungesichert. Also je Studio prüfen, etwa
  `WHERE (id=$1 AND studio_id=$2) OR (id=$3 AND studio_id=$4)`.
  **Dasselbe gilt für die Mengenabfrage selbst** — sie trägt ebenfalls
  `studio_id`, für jede der drei Tabellen.

## 5 — M4, M8, M11: die kleinen

* **M4 — HERABGESTUFT auf eine BENANNTE GRENZE, nicht gebaut.** Die
  Planprüfung (Befund 4) hat recht, dass „den Helfer-Rumpf ausnehmen"
  unterspezifiziert ist, und schlägt eine AST-Lösung (`acorn`) vor. **Beides
  zusammen kippt die Abwägung, und zwar gegen den Bau:**
  1. Der heutige Zustand ist die SICHERE Richtung — ein Aufrufer namens
     `antwort` erzeugt einen FEHLALARM (rot ohne Defekt), nicht ein stilles
     Grün. Unsere Hausregel bevorzugt genau das.
  2. Jede einfache Abgrenzung (Marker, Klammerzählung) bringt die
     Gegenrichtung ins Spiel: zu viel geleert heisst blind für ECHTE
     Verstösse — also die gefährliche Richtung gegen die ungefährliche
     eingetauscht. Klammerzählung ist hier zudem unzuverlässig, weil
     `maskiereKommentare()` Zeichenketten NICHT leert.
  3. Ein AST-Parser als neue Abhängigkeit in einem Wächter ist teurer als der
     Fehlalarm, den er verhindert.
  → Statt einer Behebung: ein Kommentar, der die Grenze benennt („ein
  Aufrufer, der seine Variable wie der Helfer-Parameter nennt, löst einen
  Fehlalarm aus — ungefährliche Richtung, bewusst nicht behoben"). **Die
  Gegenprobe 5a entfällt damit.**
* **M8:** die Riegel-Meldung beschreibt eine einheitliche Klammerregel,
  obwohl R3 sie aufgespalten hat. `req.body['query']` schlägt an, die
  Erklärung steht 320 Zeilen entfernt. → die Aufspaltung in die Meldung selbst.
* **M11:** `String(e && e.message || e)` viermal kopiert und unparenthesiert
  (`(e && e.message) || e` verliert bei `new Error('')` den Namen). → ein
  Helfer `const ursache = (e) => String((e && e.message) || e);`.
  Dazu `nichtLeerraum()` doppelt aufgerufen (Zusicherung und Meldung) → je
  einmal in eine Variable, Hausregel „Zusicherung und Diagnose beschreiben
  denselben Wert".

---

## Abnahme

* Volle Suite `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"` — ohne
  Pipe, kein äusseres `flock`. Dateizahl-Ritual, gleiches Sieb, `diff` EXIT 0.
* `npm run lint`, wörtlich melden.
* Gegenproben 1a, 2a (je Alternative des Riegels einzeln) — jede mit ERWARTETEM
  Ergebnis vorher, gemessenem danach und der **ERSTEN FAIL-Zeile wörtlich**.
* Bei 1a und 2a zusätzlich der Nachweis, dass der Stand `ee7179f` unter
  derselben Mutation GRÜN blieb — sonst ist der Befund nicht reproduziert.
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker im Ersatztext, `node --check`, Rücknahme gegen `cp`-Kopie, `diff` EXIT 0.
* Am Ende `git status` sauber, Marker-Scan 6 Treffer in
  `docs/offene-befunde-31-08-2026.md`.
* **Widersprich mit einer Messung, wenn das Papier falsch liegt.** In Runde 8
  hat genau das eine ungeeignete Gegenprobe von mir aufgedeckt (die `f8Id`-
  Mutation, die wegen `ON DELETE CASCADE` gar keinen Rest erzeugt).
