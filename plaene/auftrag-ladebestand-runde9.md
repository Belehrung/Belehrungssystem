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
    ['Leerzeichen vor der Klammer',  'pool["query"] (x)'],
    ['bare-Aufruf',                  'run("UPDATE x")'],
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
Zahlen (8 und 7) literal gegen die Listenlänge halten, damit ein stilles
Kürzen auffällt.

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
* **M6:** die Mengenabfrage steht NACH der schwächeren Ausnahme-Zusicherung.
  Im gemessenen Fall (erster DELETE scheitert) wird sie nie erreicht — man
  erfährt die Ursache, aber nicht, WELCHE Zeilen überlebt haben. → Mengenabfrage
  ZUERST ausführen, beide Ergebnisse sammeln, dann beide melden.
* **M7:** die Abfrage deckt `wartung_geraete` und `wartung_kategorien`, aber
  nicht `wartung_pruefungen` — obwohl der `finally` drei Tabellen aufräumt.
  Heute fällt es nur wegen eines zufälligen `ON DELETE RESTRICT` nicht auf. →
  dritte Tabelle aufnehmen, und die literale „4" in der Meldung gegen dieselbe
  Liste halten, die die Schritte treibt.
* **M9:** `UNION ALL` verwirft die Herkunft; Geräte- und Kategorie-IDs sind
  unabhängige Sequenzen und kollidieren in einer frischen Wegwerf-DB
  routinemässig. → `SELECT 'geraet' AS tabelle, id … UNION ALL SELECT
  'kategorie', id …`, beide Spalten melden.
* **M10:** der Kategorie-Schnappschuss liest die Variablen, gegen die er immun
  sein soll — nur die Geräteseite ist DB-bestätigt. → vor dem Schnappschuss
  eine Abfrage, die für die beiden Kategorie-IDs **2 Zeilen** liefern muss.

## 5 — M4, M8, M11: die kleinen

* **M4:** die R11-Umbenennung hat die Selbsttreffer-Gefahr verschoben statt
  beseitigt — ein künftiger Aufrufer namens `antwort` trifft den Helfer-Rumpf.
  → **Den Helfer-Rumpf aus `eigenerQuelltext` ausnehmen** (ausleeren, wie der
  Lookbehind die Signatur ausnimmt), statt einen weiteren Namen zu wählen.
  Das schliesst die Klasse; eine Umbenennung verschiebt sie nur.
  **Gegenprobe (5a):** eine Zeile `await antwort.text();` ausserhalb des
  Helfers einfügen → MUSS weiterhin rot werden (die Ausnahme darf nur den
  Helfer-Rumpf blind machen, nicht den Rest).
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
* Gegenproben 1a, 2a (zweimal, je Alternative), 5a — jede mit ERWARTETEM
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
