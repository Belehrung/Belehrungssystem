# Bauauftrag Runde 8 „ladebestand" — Nacharbeit zur Diffprüfung Runde 7

**Zielrepo:** `/home/user/gymdocu`, Zweig `beitrag-ladebestand`, Basis `4fc9bed`.

**Grundlage:** `plaene/diffpruefung-ladebestand-runde7.md`. Zwölf Befunde der
ausführenden Prüfspur plus einer der Lesespur, **alle vom Haupt-Agenten selbst
nachgemessen**, Messwerte im Papier und unten.

**Alle Zeilennummern gelten am Stand `4fc9bed` und stimmen nach der ersten
Änderung nicht mehr — nach SUCHMUSTER arbeiten.**

---

## Worum es in dieser Runde geht

**Runde 7 hat DREI Zusicherungen stumpf gemacht, die vorher fallen konnten.**
Der Beitrag sollte schärfen und hat an drei Stellen das Gegenteil bewirkt. Der
gemeinsame Auslöser ist Punkt 7 („einmal maskieren, dann schneiden") — eine
Umstellung, deren Nutzen ausdrücklich LATENT war und die zwei tatsächliche
Regressionen gekostet hat.

**Punkt 7 wird trotzdem NICHT zurückgedreht**, weil beide Regressionen
gemessen behebbar sind und der Kopfkommentar des Helfers das einmalige
Maskieren als den richtigen Weg benennt. **Aber sie werden zur Bedingung
gemacht:** wer die Behebungen 1 und 2 unten nicht mit beiden Richtungen
belegen kann, dreht Punkt 7 zurück statt ihn zu behalten.

## 1 — R2 + Lesespur: die Vertragsprüfung gehört auf die GANZE DATEI und VOR den Schnitt

**Gemessen.** `abschnitt = geraeteOhneKommentare.slice(zb, ende)` und danach
`assert.strictEqual(abschnitt.length, ende - zb)` ist `slice(a,b).length ===
b-a` — **immer wahr:**

```
abschnitt.length === ende - zb ? true (15782 === 15782)
mit einem Masker, der 50 Zeichen verliert:
  abschnitt.length === ende - zb ? true (15782 === 15782)   -> merkt es NICHT
  die Ganzdatei-Form haette gemerkt: JA
```

Und mit einem Masker, der die Zeilenumbrüche frisst, gemessen am echten Lauf:
**erste FAIL-Zeile ist Zusicherung 10** („der Bereich muss 2291
Nicht-Leerraum-Zeichen enthalten"), nicht die Vertragsprüfung — die Diagnose
zeigt in die falsche Richtung, genau das, was der Reihenfolgen-Block
verhindern sollte.

**Das widerlegt meine eigene Begründung aus dem Auftrag der Runde 7.** Dort
steht, die Ganzdatei-Form sei „wörtlich die Tautologie, eine Ebene höher". Das
ist falsch und genau umgekehrt: auf der ganzen Datei werden ZWEI unabhängig
erzeugte Zeichenketten verglichen, auf dem Slice eine Zeichenkette mit ihrer
eigenen Schnittlänge.

**Umsetzung:**

```js
// UNMITTELBAR vor dem Schnitt, vor jedem Verbrauch der Versatzwerte:
assert.strictEqual(geraeteOhneKommentare.length, GERAETE_QUELLTEXT_ROH.length,
    `… maskiereKommentare() ist nicht mehr längenerhaltend (maskiert ${…}, roh ${…}) — die Versatzwerte aus dem rohen Quelltext treffen im maskierten dann die falsche Stelle`);
```

**Die abschnittsbezogene Längengleichheit wird ERSATZLOS GELÖSCHT.** Sie ist
nachweislich eine Tautologie; eine Zusicherung, die nicht fallen kann, bleibt
nicht „als zusätzliche Konsistenzprüfung" stehen (das hat die Lesespur
vorgeschlagen — nicht übernommen, Hausregel).

**Gegenprobe (1a), BEIDE Richtungen:**
`maskiereKommentare` auf `return out.join("").replace(/\n/g, "");`
→ die NEUE Zusicherung MUSS fallen und MUSS die ERSTE FAIL-Zeile sein
(vorab gemessen: 453828 gegen 460811, sie feuert). Ohne Defekt: grün.
**Die erste FAIL-Zeile wörtlich melden** — ist es eine andere, ist die
Reihenfolge noch falsch.

## 2 — R1: der C7-Wächter muss auf dem ROHEN Ausschnitt prüfen

**Gemessen.** Der C7-Wächter bewacht, dass der Schnitt nicht auf die
Markenposition zurückfällt. Die Marke steht in einem `//`-Kommentar:

```
auf dem ROHEN Ausschnitt:    richtiger Schnitt -> false | falscher Schnitt -> true
auf dem MASKIERTEN Text:     richtiger Schnitt -> false | falscher Schnitt -> false
```

Punkt 7 hat ihn damit **blind gemacht** — er kann die Regression, gegen die er
geschrieben wurde, nicht mehr sehen.

**Umsetzung:** die Prüfung läuft gegen
`GERAETE_QUELLTEXT_ROH.slice(zeilenbeginnNachMarke, ende)` statt gegen
`abschnitt`. Der Kommentar nennt den Grund: auf dem maskierten Text ist die
Marke ausgeleert, die Prüfung wäre wirkungslos.

**Gegenprobe (2a):** `zeilenbeginnNachMarke` versuchsweise durch `begin`
ersetzen (genau der dokumentierte frühere Defekt) → der C7-Wächter MUSS
fallen. Vorher gegen den HEUTIGEN Stand messen und wörtlich belegen, dass er
dabei GRÜN bleibt.

## 3 — R3: die Referenz-Form zurückholen, ohne die Fehlalarme

**Gemessen.** Die in Runde 7 eingeführte Forderung nach einer aufrufenden
Klammer kostet eine Abdeckung, die der alte Ausdruck hatte:

```
ALT: gefangen  NEU: DURCH   const f = pool["query"]; await f(sql);
```

**Umsetzung** — Referenz-Form für den eindeutigen Namen `query` ohne
Aufrufklammer, für die kurzen/mehrdeutigen Namen weiterhin mit:

```js
/\bdb\b|\.\s*query\s*\(|\[\s*['"`]query['"`]\s*\]|\[\s*['"`](?:run|one|tx|q|pool)['"`]\s*\]\s*\(|\b(?:run|one|tx|q|pool)\s*\(/
```

**Vorab gemessen, 15 Proben, 0 Abweichungen:** acht Fangfälle (inkl.
Referenz-Form, beider Backtick-Formen und Leerzeichen vor der Klammer), sieben
Durchlassfälle (`req.body['q']`, `row['tx']`, `params['one']`, `werte[query]`,
`a[queryX]`, `schreibePruefplan(`, `ergebnis.rows`), am heutigen Abschnitt
kein Treffer. `req.body['query']` schlägt an — **war beim ALTEN Ausdruck
ebenfalls so**, also keine Regression, gehört aber als benannte Grenze in den
Kommentar.

**Gegenprobe (3a):** `const f = pool["query"]; await f(sql);` als NEUE Zeile in
den bewachten Bereich → MUSS am Riegel rot werden. Vorher gegen den Stand
`4fc9bed` messen und belegen, dass er DURCHLÄSST.

## 4 — R4: Positivkontrolle und Fenster müssen DASSELBE Prädikat prüfen

**Gemessen.** Die Zählung nimmt `/neu AS \(/g`, das Fenster
`(?!\bneu AS \()` — verschiedene Prädikate:

```
Probe: "WITH gesperrt AS ( SELECT 1 FOR UPDATE), xneu AS ( SELECT 2 FOR UPDATE)"
Zaehlung  /neu AS \(/g    : 1     -> Zusicherung 6 geht durch
Fenster   (?!\bneu AS \() : true  -> Fenster greift NICHT mehr
```

Benennt jemand die CTE in `xneu` um, meldet die Positivkontrolle „Anker
vorhanden", während das Fenster bis Dateiende reicht. **Das ist C11 — die
Regel, die diese Runde an drei anderen Stellen angewandt hat.**

**Umsetzung:** die Zählung nimmt `\bneu AS \(`, buchstäblich derselbe
Teilausdruck wie das Fenster. Am besten EINMAL als Konstante hinschreiben und
beide daraus bedienen, damit die Klasse nicht wiederkommt.

**Gegenprobe (4a):** `neu AS (` in `geraete.js` nach `xneu AS (` umbenennen →
die Positivkontrolle MUSS fallen (heute geht sie durch).

## 5 — R5: die Aufräum-Zusicherung prüft die falsche Sache

**Gemessen.** `srv.close()` wirft bei doppeltem Schliessen NICHT — Schritt 1
von 4 ist ein Wächter, der nicht feuern kann. Und laufen die DELETEs mit
`undefined`-IDs, vergleichen sie gegen NULL, treffen nichts, liefern
`rowCount 0` und werfen nicht: `aufraeumFehler` bleibt leer, während der Rest
liegenbleibt — und die Meldung behauptet „kein Fixturrest in der geteilten
Wegwerf-DB".

**Umsetzung:** nach dem Aufräumen die MENGE zurückfragen statt Ausnahmen zu
zählen — eine Abfrage auf die vier Geräte-IDs und die beiden Kategorien, die
0 Zeilen liefern MUSS. Der Ausnahme-Sammler bleibt daneben (er nennt die
Ursache), aber die tragende Zusicherung ist die Mengenabfrage.
Die `ok()`-Meldung darf nur behaupten, was die Abfrage belegt.

**Gegenprobe (5a):** eine der vier Gerätezeilen vor dem Aufräumen so
verändern, dass das DELETE sie nicht trifft (z. B. `f8Id` auf `undefined`
setzen) → die Mengenabfrage MUSS rot werden, und der Ausnahme-Sammler bleibt
dabei LEER. Genau diese Kombination belegt, dass die neue Zusicherung etwas
sieht, was die alte nicht sah.

## 6 — R6 bis R8 und R12: Zahlen, Verweise, Meldung

* **R6 (gemessen):** die Kommentare nennen „218 Zeilen, davon 143 reine
  Kommentarzeilen". Richtig sind **232 Zeilen, 157 reine `//`-Zeilen, 2
  Leerzeilen**. Meine Zahlen waren korrekt, als ich sie mass — die
  Runde-7-Kommentaränderung in `geraete.js` liegt INNERHALB des bewachten
  Abschnitts und hat ihn verlängert.
* **R7 (gemessen):** „roh 345735" ist falsch, gemessen **345720**; 202415 für
  den maskierten Text stimmt.
* **R8 (gemessen):** `GERAETE_OHNE_KOMMENTARE` kommt 3× in Kommentaren vor und
  hat **0 Deklarationen** — der Bezeichner heisst `geraeteOhneKommentare`.
  Alle drei Stellen berichtigen.
* **R12:** die vier `catch`-Blöcke hängen `e.message` unbedingt an; bei einem
  Nicht-Error steht dort „…: undefined". `String(e && e.message || e)`.

## 7 — R9: der verwaiste Kommentarblock

Über `PRUEFPLAN_VERBOTENES_MUSTER` steht ein rund 40-zeiliger Block, der eine
Deklaration beschreibt, die dort nicht mehr folgt, und der mit dem Stummel
„(maskiereKommentare/nichtLeerraum bereits oben importiert.)" endet. Die
Begründung für den Masker steht damit an ZWEI Orten. Verschmelzen, nicht
nachziehen — die zweite Fassung ersatzlos löschen.

## 8 — R11: die Grenze beim Bezeichner `r` benennen

Der Helfer heisst `pruefeKeinFehlerseiten(r, …)` und enthält in seinem Rumpf
`await r.text()`. Seit die Suche über die GANZE Datei läuft, würde ein
künftiger Aufrufer, der seine Variable schlicht `r` nennt, den Helfer-Rumpf
selbst treffen und einen Fehlalarm auslösen — ungefährliche Richtung, aber
sie gehört BENANNT. Entweder den Helfer-Parameter umbenennen (z. B. `antwort`)
oder die Grenze im Kommentar festhalten. **Empfehlung: umbenennen** — es ist
eine reine Umbenennung ohne Verhaltenswechsel und nimmt die Klasse ganz weg.

---

## Abnahme

* Volle Suite `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"` — ohne
  Pipe, NICHT in ein äusseres `flock`. Dateizahl-Ritual mit demselben Sieb auf
  beiden Seiten, `diff` EXIT 0.
* `npm run lint`, Ergebnis WÖRTLICH melden.
* Gegenproben 1a, 2a, 3a, 4a, 5a einzeln, jede mit ERWARTETEM Ergebnis vorher
  und gemessenem danach, **und zu jeder roten Gegenprobe die ERSTE FAIL-Zeile
  wörtlich** — nicht nur „EXIT 1".
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker im Ersatztext, `node --check`, Rücknahme gegen eine unabhängige
  `cp`-Kopie mit `diff` EXIT 0.
* Am Ende `git status` sauber, Marker-Scan 6 Treffer, alle in
  `docs/offene-befunde-31-08-2026.md`.
* **Widersprich, wenn eine Messung dem Papier widerspricht.** In Runde 7 hat
  genau das zwei falsche Behauptungen von mir aufgedeckt.
