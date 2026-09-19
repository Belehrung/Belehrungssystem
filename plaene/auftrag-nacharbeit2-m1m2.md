# Auftragspapier — Nacharbeit 2 an der Mandantengrenze M1/M2

Stand 18.09.2026, Zweig `claude/mandantengrenze-fremd-ids`, Basis Commit
`4c50659`. Fassung 1 — geht VOR der Bau-Runde an den Gegenleser.

## Woher die Befunde kommen

Drei Spuren über denselben Diff. Jeder Befund unten ist vom Haupt-Agenten
SELBST nachgemessen; was nicht getragen hat, steht am Ende mit Begründung.

- **Spur DeepSeek** (`deepseek-v4-pro`, `effort: max`): 7 Befunde, 6 getragen.
- **Spur Mutation** (Executer, misst nur): 2 Befunde, beide getragen, dazu
  drei Mutationen, die NICHTS zeigten — auch die stehen unten, weil ein
  geprüfter und robuster Punkt eine Auskunft ist.
- **Spur sol**: läuft noch. Diese Fassung wird ergänzt, nicht ersetzt.

**Die beiden Spuren haben sich bei EINEM Befund getroffen und bei je einem
NICHT.** Das ist dasselbe Muster wie am 13.09.: DeepSeek fand ihn durch
LESEN, die Mutationsspur durch MESSEN.

## A — BLOCKIEREND: N9 hat keine Positivkontrolle

**Von BEIDEN Spuren gefunden.**

Die drei N9-Zusicherungen (`test_feature_mandantengrenze_fremd_ids.js:356,
365, 374`) prüfen ausnahmslos `ce* === 0`. **Keine einzige Stelle im ganzen
Lauf prüft, dass `anzahlConsoleError` überhaupt `> 0` werden KANN.** `ceEE`
(Zeile 335) wird sogar erfasst und dann nie mit `ok()` geprüft.

Selbst nachgemessen (grep über die Datei): drei Treffer `ce.. === 0`, null
Treffer `> 0`. Damit folgt zwingend, was die Mutationsspur zusätzlich
gemessen hat:

- `console.error` → `console.warn` in `routes/belehrungen.js:1969`:
  **EXIT 0, 86 PASS / 0 FAIL**, identisch zur Grundmessung. Die gesamte
  Schutzwirkung von N9 ist lautlos weg.
- Positivkontrolle derselben Spur, damit klar ist, dass N9 überhaupt etwas
  bewacht: Wächter durch `if (false)` ersetzt → **EXIT 1, 83 PASS / 3 FAIL**,
  und es fallen GENAU die drei N9-Zeilen.

N9 bewacht also richtig — aber seine eigene Signalquelle ist unbewacht. Eine
Umstellung auf strukturiertes Logging (oder schlicht eine Umbenennung) nimmt
den Schutz weg, ohne dass eine der 86 Zusicherungen fällt.

**ZU BAUEN:** Mindestens einen Fall, der den ABSTURZPFAD sicher auslöst,
durch `mitConsoleErrorGezaehlt()` führen und `> 0` zusichern. Die
N1-Negativfälle `Array` und `Objekt` sind dafür belegt geeignet — die
Mutationsspur hat aus der Grundausgabe abgelesen, dass sie echte DB-Fehler
auslösen (`invalid input syntax for type integer`) und `Freischalten-Fehler:`
ins Log drucken. Sie laufen heute ohne die Zähl-Hülle.

**Ausdrücklich NICHT:** die `null`- und `fehlend`-Fälle mit umhüllen — die
laufen über den WÄCHTERpfad und müssen bei 0 bleiben. Wer sie mit umhüllt und
`> 0` zusichert, dreht den Befund um.

**GEGENPROBE (Pflicht, beide Richtungen):**
1. `console.error` in `routes/belehrungen.js:1969` auf `console.warn`
   umbenennen → die NEUE Zusicherung muss FALLEN. Heute: 86/0.
2. Zurücknehmen → wieder grün.
3. Zusätzlich: der Wächter-Fall muss weiterhin bei 0 bleiben (sonst prüft die
   neue Zusicherung nicht den Absturzpfad, sondern irgendeinen Aufruf).

## B — Die statische `return;`-Zusicherung kann für ihren eigenen Zweck nicht rot werden

**Nur von der Mutationsspur gefunden.**

`test_feature_lageplan_sicherheit_static.js:75` prüft
`iReturn = bp.indexOf('return;', iAuswertung)` gegen `iPush`. Das ist eine
reine Textsuche und unterscheidet eine Anweisung nicht von derselben
Zeichenkette in einem Kommentar.

Gemessen: das echte `return;` in `routes/lageplan.js:1917` auskommentiert →
**statische Datei EXIT 0, 24 PASS / 0 FAIL, unverändert**, während die
verhaltende vm-Prüfung in der Schwesterdatei korrekt **EXIT 1** liefert
(„Position NICHT übernommen" fällt, die Position wird trotz 404 übernommen).

Die Suite als Ganzes ist heute also geschützt — aber von der ANDEREN Datei.
Die statische Einzelzusicherung liefert für genau die Regression, die ihr
eigener Text nennt, keinen eigenen Beitrag.

**ZU BAUEN:** Vor den Textprüfungen die Kommentare abziehen (Hausregel:
„Statische Prüfungen über Quelltext entfernen zuerst Kommentarzeilen"), dazu
eine Positivkontrolle, dass nach dem Abzug überhaupt noch etwas übrig ist.

**GEGENPROBE:** dasselbe Auskommentieren wie oben → die statische Zusicherung
muss jetzt FALLEN. Heute: 24/0.

## C — Die statische Richtungsprüfung sucht im GANZEN Quelltext

`test_feature_lageplan_sicherheit_static.js:59-60`:
`!src.includes('if (res.httpOk){')` durchsucht die ganze Datei, nicht den
Ausschnitt der geprüften Funktion. Jedes künftige, völlig unschuldige
`if (res.httpOk){` an anderer Stelle färbt den Wächter rot.

**ZU BAUEN:** auf den Ausschnitt von `wertePositionsAntwort()` begrenzen —
analog zum bereits vorhandenen `bp`-Slice für `bindPlace()`.

## D — Die statische Datei hat keine Mindest-Prüfzahl

Die Schwesterdatei erzwingt `MINDEST_PRUEFUNGEN`; die statische nicht
(gemessen: null Treffer auf `MINDEST`). Ein stilles Entfernen von Abschnitt 4
liefe grün durch.

**ZU BAUEN:** dieselbe Schranke. **Die Zahl VON HAND herleiten, nicht aus dem
Lauf abschreiben** — sonst bewacht sie genau die neu ergänzten Zusicherungen
nicht.

## E — Die halbe Admin-Sitzung ist im N12-Test ungeprüft

`requireAdmin` hat drei Fallklassen; der Test fährt nur „leere Sitzung" und
„gültige Admin-Sitzung" (gemessen: `totpOk` kommt nur mit `true` vor). Der
Pfad `rolle:'admin', totpOk:false` — der die Sitzung LÖSCHT und danach je nach
`Accept` 401 oder 302 liefert — ist nicht abgedeckt.

**ZU BAUEN:** einen Fall mit `{ rolle:'admin', totpOk:false }`, der beide
Antwortformen prüft UND dass die Sitzung danach gelöscht ist.

## F — Der Kommentar in `core/auth.js` verallgemeinert unzulässig

Er sagt, der Zweig betreffe „unsere eigenen fetch()-Aufrufe". SELBST gezählt
über `git show 4c50659:routes/*.js`: **neun Browser-`fetch`-Aufrufe auf eigene
Endpunkte, genau EINER trägt den `Accept`-Header** (`routes/lageplan.js:1477`,
der `api()`-Helfer). Zwei der fehlenden stehen in derselben Datei
(`:1524`, `:2843`), weitere in `routes/belehrungen.js:575,598,646` und
`routes/module.js:1092,1102`. Die serverseitigen Aufrufe in
`routes/webhooks.js` zählen nicht mit — die gehen nach draussen.

**ZU BAUEN:** nur den KOMMENTAR auf die tatsächlich abgedeckte Klasse
begrenzen. **Die anderen acht Aufrufer NICHT mit umstellen** — das ist ein
eigener Beitrag, der acht Stellen und ihre Fehlerbehandlung anfasst, und er
gehört nicht in eine Nacharbeit an der Mandantengrenze. Stattdessen als
datierter offener Punkt in `docs/offene-befunde-31-08-2026.md`, mit den oben
gezählten Fundstellen.

## G — Test-Abfrage ohne `studio_id`

`test_feature_mandantengrenze_fremd_ids.js:276`:
`SELECT etage_id FROM geraete_positionen WHERE id=$1`.

Sachlich liefert das heute die richtige Zeile (`id` ist je Tabelle eindeutig),
es ist also kein Fehler, sondern Hygiene an unserer eisernen Regel. Einzeiler.

**ZU BAUEN:** `WHERE studio_id = $1 AND id = $2`.

## Was NICHT gebaut wird, und warum

- **Der Flakiness-Befund zum Zeitvergleich (DeepSeek 6) FÄLLT.** Seine
  Begründung läuft in die falsche Richtung: `clock_timestamp()` wird über
  JavaScript auf Millisekunden ABGESCHNITTEN, der Bezugspunkt rutscht also
  nach FRÜHER, und der Vergleich `>` wird dadurch wahrscheinlicher wahr, nicht
  unwahrscheinlicher.
- **Die acht fehlenden `Accept`-Header** (s. F) — eigener Beitrag.
- **Eine Mengenschwelle gegen „zwei entfernen, eine ergänzen"** — die
  Mutationsspur hat das ausdrücklich als generische Eigenschaft jeder
  Mengenschwelle benannt und nicht gemessen. Eine Schwelle kann das nicht;
  dafür sind die inhaltlichen Zusicherungen da.

## Geprüft und robust (kein Auftrag, aber Auskunft)

Die Mutationsspur hat drei Dinge gemessen, die NICHTS zeigten:

- **vm-Extraktion bei doppelter Marke:** eine zweite `// ── Etage wählen`-Zeile
  vor der echten → **EXIT 1 mit `SyntaxError: Unexpected end of input`**, also
  LAUTER Absturz statt falschem Grün. Nicht erschöpfend: andere
  Duplikat-Varianten am `bpStart`/`bpEnd`-Paar wurden nicht gefahren.
- **`MINDEST_PRUEFUNGEN`** fängt schon das Entfernen EINER Zusicherung
  (**EXIT 1, 85 PASS / 0 FAIL** plus die eigene Abbruchmeldung).
- **Kein anderer `console.error` liegt auf dem M2-Pfad** — statisch geprüft
  über alle Fundstellen in `routes/belehrungen.js` und `core/db.js`. N9 kann
  also nicht fälschlich rot werden.

## Unverhandelbar für diese Runde

- Jede Abfrage trägt `studio_id`.
- Dieselbe Suite ist auf dem Live-Server Deploy-Gate: keine echten Dienste,
  keine echten Prozesse, kein echtes Dateisystem.
- Jede neue Zusicherung braucht die Gegenprobe in BEIDE Richtungen, wörtlich
  gemeldet, mit `node --check` vor jeder Messung und Rücknahme gegen eine
  unabhängige `cp`-Kopie (`diff` EXIT 0), nie `git checkout`/`git stash`.
- `npm run lint` läuft und wird wörtlich gemeldet, auch bei Grün.

---

# Fassung 2 — die dritte Spur (sol) ist ausgewertet

`gpt-5.6-sol`, `effort: max`, Streaming (ohne das dreimal bei 300,3 s
abgeschnitten). 39.683 rein / 39.614 raus, davon 34.186 Denken, 921 s.
**Elf Befunde, neun davon als „blockierend" eingestuft.**

**Zur Einstufung vorweg, weil sie selbst ein Befund ist:** neun von elf als
blockierend zu führen, entwertet das Wort. Zwei davon fallen nach eigener
Nachmessung, zwei weitere sind Bestandseigenschaften, die dieser Diff nicht
eingeführt hat. Die Regel bleibt: **eine Schwereeinstufung ist eine
Behauptung, bis sie gemessen ist** — in beide Richtungen.

## H — BLOCKIEREND: bei M2 ist ein gefälschtes `studio_id` im Rumpf ungeprüft

**Der wertvollste Befund des ganzen Tages, und KEINE der anderen beiden
Spuren hatte ihn.**

N7 belegt „ein `studio_id`-Feld im Rumpf wird ignoriert" — **nur für M1**.
Selbst nachgemessen: `studio_id:` kommt in der ganzen Testdatei **genau
einmal** vor (Zeile 318, der M1-Aufruf). **Null** der M2-Aufrufe auf
`freischalten/` senden es.

Damit bliebe diese Regression in `routes/belehrungen.js` unsichtbar:

```js
const sid = req.body.studio_id || req.studioId;
const ma  = await db.one("... WHERE studio_id=$1 AND id=$2", [sid, mitarbeiter_id]);
const bel = await db.one("... WHERE studio_id=$1 AND id=$2", [sid, req.params.belehrungId]);
```

Ein Aufrufer sendet `studio_id: B`, `mitarbeiter_id: maB` gegen `belB` —
beide Nachschläge finden FREMDE Objekte, und anschliessend wird unter Studio A
eine fremde Referenz geschrieben. Alle 86 Zusicherungen bleiben grün, weil
keine von ihnen das Feld je sendet. Das ist Punkt 1 der Prüfreihenfolge, die
Klasse, die wirklich katastrophal wäre.

**ZU BAUEN:** dieselbe Probe wie N7, aber für M2 — Formular UND JSON, mit
`{ studio_id: B, mitarbeiter_id: maB }` gegen `belB`. Erwartet: exakter
Ablehnungs-Redirect, kein Absturz, unveränderter Zustand in A, B und C.

**GEGENPROBE:** genau die Zeile oben einbauen → die neue Zusicherung muss
fallen; ohne sie bleibt die Suite heute bei 86/0.

## I — N9 deckt nur drei von acht Ablehnungswegen ab

Erweitert Punkt A. Der Zähler umhüllt nur die drei Formularfälle; N1 (JSON,
Zahl/Array/Objekt/null/fehlend), N4 und N8 laufen ohne ihn. sol nennt dazu
eine Mutation, die grün bliebe:

```js
if ((!ma || !bel) && typeof mitarbeiter_id !== 'number') { return res.redirect(ZIEL); }
```

Formularwerte sind Zeichenketten → Wächter greift → die drei Zähler bleiben 0.
Eine fremde numerische JSON-ID fällt dagegen in den Absturzpfad — und den
beobachtet dort niemand.

**ZU BAUEN:** jeden M2-Ablehnungsfall durch `mitConsoleErrorGezaehlt()`
führen, nicht nur die drei Formularfälle. Zusammen mit A (Positivkontrolle)
schliesst das die Klasse.

## J — Der `console.error`-Sensor ist global und verschluckt fremde Fehler

`mitConsoleErrorGezaehlt()` ersetzt `console.error` PROZESSWEIT und zählt
alles. Ein asynchroner Pool-Fehler (`core/db.js`, `pool.on("error", …)`)
würde mitgezählt (falsches Rot) und seine Diagnose unterdrückt.

Die Mutationsspur hat statisch geprüft, dass auf dem M2-Pfad kein anderer
`console.error` liegt — das trifft zu, deckt aber gerade den ASYNCHRONEN
Fall nicht ab, der nicht am Pfad hängt.

**ZU BAUEN:** nur Aufrufe mit dem bekannten Präfix `Freischalten-Fehler:`
zählen, **alle anderen unverändert an das Original weiterreichen**. Damit ist
der Sensor kalibriert und verschluckt nichts mehr.

## K — Der Rumpfvergleich in N4 kann nicht rot werden

Selbst nachgemessen (Zeilen 283/290): **beide** Seiten benutzen
`.json().catch(() => ({}))`. Zwei VERSCHIEDENE unparsbare Antworten werden
damit beide zu `{}` und der Vergleich meldet „ununterscheidbar" — genau die
Aussage, die er belegen soll, kann nicht fallen.

**ZU BAUEN:** `Content-Type` prüfen, ohne Rückfall parsen (ein Parsefehler ist
ein FAIL), und zusätzlich gegen einen UNABHÄNGIG hingeschriebenen Vertrag
halten (`{ error: 'Etage nicht gefunden' }`), nicht nur die beiden
beobachteten Antworten gegeneinander.

## L — „gleiche Zeilenzahl" ist bei M2 kein Zustandsnachweis

N3 weist selbst nach, dass `ON CONFLICT DO UPDATE` eine bestehende Zeile
ändern kann, ohne die Anzahl zu verändern. Alle M2-Ablehnungen benutzen
trotzdem nur die Anzahl. Zum Zeitpunkt der Ablehnungen existiert bereits die
erlaubte Zeile `(A, maA, belA)` — ein fehlerhafter Ablehnungspfad könnte sie
aktualisieren und trotzdem den erwarteten Redirect liefern.

**ZU BAUEN:** vor und nach jedem Ablehnungsblock einen sortierten
Schnappschuss der relevanten FELDER je Mandant vergleichen
(`studio_id, mitarbeiter_id, belehrung_id, grund, freigeschaltet_am`), nicht
nur `count(*)`.

## M — Die echten Router werden ohne ihren Rechtewächter geprüft

Selbst nachgemessen: Produktion montiert
`app.use("/admin/lageplan", requireAdmin, lageplanRoutes.admin)` und
`app.use("/admin/belehrungen", requireAdmin, belehrungenRoutes.admin)`
(`server.js:1429`, `:1445`). Der Test-Harness montiert beide OHNE Wächter und
setzt `req.studioId` direkt. Nähme jemand `requireAdmin` dort heraus, bliebe
das in allen 86 Zusicherungen unsichtbar.

**Das ist eine Bestandseigenschaft, keine Regression dieses Diffs** — die
Einstufung „blockierend" ist überzogen. Die Lücke ist aber billig zu
schliessen und bewacht Punkt 1 der Prüfreihenfolge.

**ZU BAUEN:** eine statische Zusicherung über `server.js`, dass beide Pfade
MIT `requireAdmin` davor montiert sind. Gegenprobe: den Wächter aus einer der
beiden Zeilen entfernen → muss fallen.

## Was aus Fassung 2 NICHT gebaut wird — mit Begründung

- **B1 (sol), die drei Sentinel-Abfragen: FÄLLT.** Sie fragen bewusst OHNE
  `studio_id`, weil sie belegen sollen, dass eine ID in KEINEM Studio
  existiert — Globalität ist ihr Zweck, nicht ihr Fehler. sols Ersatzvorschlag
  (eine Zeile anlegen, ID merken, löschen) leistet dasselbe umständlicher.
  Der `posEigen`-Teil desselben Befunds bleibt und steht als Punkt G.
- **B8 (tote Quelltextkopie täuscht beide Spuren): FÄLLT weitgehend.** Die
  Mutationsspur hat den Fall „doppelte Marke" GEMESSEN: **EXIT 1 mit
  `SyntaxError: Unexpected end of input`**, also lauter Absturz statt falschem
  Grün. sols Szenario ist nicht gemessen, und die vorhandene Messung zeigt in
  die andere Richtung. Ein AST-Parser statt `indexOf` wäre eine Verbesserung —
  aber ein eigener Beitrag, kein Blocker hier.
- **B10 (Dateisystem, Listener, DB im Deploy-Gate): FÄLLT weitgehend.** Die
  Regel zielt gemessen auf `pm2`, `nginx`, `/var/www` — nicht auf das Lesen
  einer Repo-Datei oder eine Wegwerf-DB. Selbst gezählt: **138 Bestandstests**
  benutzen `listen(0)`. Wäre sols Lesart richtig, verstiesse die ganze Suite.
  **Ein Teil hält:** `listen(0)` ohne Host bindet an alle Schnittstellen statt
  an Loopback. Das ist eine suiteweite Härtung über 138 Dateien — eigener
  Beitrag, als datierter offener Punkt festzuhalten.
- **B9 (Rumpf überschreibt `httpOk`): als offener Punkt, NICHT umdrehen.**
  Die Reihenfolge `{ httpOk, httpStatus, ...daten }` ist eine BEWUSSTE,
  im Quelltext begründete Entscheidung einer früheren Prüfrunde (R4): ein
  vorhandenes Payload-Feld soll gewinnen. Selbst nachgemessen: **kein
  Endpunkt liefert `httpOk` oder `httpStatus` im Rumpf**; die Kollision setzt
  voraus, dass unser eigener Server damit anfängt. Umdrehen würde eine
  gemessene Entscheidung ohne neue Messung kassieren.
- **B11 (`wantsJson()` vereinheitlichen): eigener Beitrag.** Dass die Prüfung
  case-sensitiv ist und `q=0` ignoriert, trifft zu. Sie betrifft aber
  `requireLogin`, `requireAdmin` UND den globalen Fehlerhandler gemeinsam —
  das ist eine Umstellung der Accept-Semantik, nicht eine Nacharbeit an der
  Mandantengrenze. Datierter offener Punkt.
- **Die acht fehlenden `Accept`-Header** (Punkt F): unverändert eigener
  Beitrag.

## Was die drei Spuren über sich selbst zeigen

| | DeepSeek | Mutation | sol |
|---|---|---|---|
| Befunde | 7 | 2 | 11 |
| nach eigener Nachmessung getragen | 6 | 2 | 5 ganz, 4 teilweise, 2 gefallen |
| **nur von dieser Spur** | 4 | 1 | **6** |

Die Überschneidung ist wieder klein: **einen** Befund hatten alle drei (A),
alles andere verteilt sich. Und die Suchverfahren sind erkennbar verschieden —
DeepSeek und sol LESEN, die Mutationsspur MISST. Der einzige Befund, der
durch Ausführen gefunden wurde (B, die statische `return;`-Zusicherung),
war durch Lesen nicht zu sehen; der wertvollste Lesebefund (H) durch
Mutieren nicht.

---

# Fassung 3 — nach der Planprüfung, und sie hat mich mehrfach widerlegt

`gpt-5.6-sol`, `effort: max`, Streaming. 44.592 rein / 45.000 raus, davon
38.472 Denken. **`status: incomplete`** — die Antwort riss im LETZTEN Befund
des vierten Abschnitts ab. Die vier Abschnitte sind inhaltlich durch; was
nach dem abgeschnittenen Satz noch gekommen wäre, weiss niemand, und das
steht hier statt einer Zahl.

**Messwert fürs nächste Mal:** bei `effort: max` frisst allein das Denken
38.472 Token. 45.000 Ausgabebudget reichen dafür NICHT. Wer `max` fährt,
setzt `max_output_tokens` deutlich höher.

## Was die Prüfung an MEINEN Behauptungen widerlegt hat

**1. Mein Auftrag H schliesst seinen eigenen Befund NICHT — und wiederholt
damit genau den Fehler, den die erste Planprüfung an Fassung 1 gefunden hat.**

Ich hatte vorgeschrieben: `{ studio_id: B, mitarbeiter_id: maB }` gegen
`belB`. Durchgerechnet: mutiert jemand NUR den Mitarbeiter-Nachschlag, wird
`ma` unter B gefunden, `bel` unter A aber NICHT — der Wächter steigt aus,
Redirect und Zeilenzahl stimmen, meine Probe bleibt GRÜN. Verwundbar wäre
`maB / belA / studio_id=B`, und das prüft sie nie. Symmetrisch für den
Belehrungs-Nachschlag. Und eine Mutation am INSERT selbst
(`[req.body.studio_id || req.studioId, ma.id, bel.id, …]`) erreicht meine
fremd/fremd-Probe gar nicht — dafür bräuchte es eigen/eigen mit gefälschtem
Studio.

Das ist dieselbe Klasse wie „beide fremd statt beide Grenzen einzeln", eine
Ebene höher. **Blockierend, und es ist mein Fehler, nicht seiner.**

**2. Meine Verteidigung der Sentinel-Abfragen war falsch.** Ich hatte
geschrieben, Globalität sei „ihr Zweck, nicht ihr Fehler". Der ZWECK ist
global — die ABFRAGE muss es nicht sein. Der Ersatz, den ich verworfen hatte,
leistet den Nachweis ohne globale Abfrage: Zeile unter A anlegen, erzeugte
Primär-ID merken, mit `WHERE studio_id=$1 AND id=$2` löschen, `rowCount === 1`
prüfen. Die ID ist danach nachweislich nirgends, weil ein Primärschlüssel
global eindeutig ist. **Mein Einwand fällt.**

**3. Meine Zahlen zu den `fetch`-Aufrufen waren falsch — und mein zweiter
Messversuch auch.** Das Papier sagte „neun Browser-`fetch`, genau EINER trägt
den Header". Die Prüfung rechnete nach, dass meine eigene Aufzählung nur
sieben fehlende nennt, und tippte auf acht. Nachgemessen, diesmal mit dem an
der bekannten Fundstelle (`routes/lageplan.js:1477`) GELERNTEN Muster
`Accept`:

| | |
|---|---|
| Browser-`fetch` auf eigene Endpunkte | **10** |
| davon MIT `Accept` | **2** — `getraenkeanlage.js:335`, `lageplan.js:1477` |
| ohne | **8** — `admin/qr.js:614`, `belehrungen.js:575/598/646`, `lageplan.js:1524`, `lageplan.js:2843`, `module.js:1092/1102` |

Der Zwischenversuch davor war ebenfalls falsch: er suchte `application/json`
und traf damit auch jedes `Content-Type`. Zwei Messfehler hintereinander an
derselben Frage — beide daher, dass ich das Suchmuster GERATEN statt an einer
bekannten Fundstelle gelernt habe. Genau die Regel steht in der CLAUDE.md.

**4. „N9 deckt drei von acht Ablehnungswegen ab" ist nicht herleitbar.**
Nachgezählt: **14** konkrete ablehnende M2-Aufrufe (Matrix 3, N8 2, N4 3,
N1 6), davon **3** umhüllt. Die Zahl acht stammt von mir und aus nichts.

**5. Zwei weitere Abfragen ohne `studio_id` hatte ich übersehen**
(`SELECT clock_timestamp()`, der `timestamptz`-Vergleich). Sechs sind es
insgesamt, nicht eine. **Die Einstufung „blockierend" ist dabei überzogen:**
beide lesen KEINE mandantengebundene Tabelle, sie können nichts verraten. Der
Vorschlag, sie in die ohnehin mandantengebundene Zeilenabfrage zu falten, ist
trotzdem besser und kostenlos — er wird übernommen.

**6. Was die Prüfung BESTÄTIGT hat:** dass die N1-Fälle `Array` und `Objekt`
wirklich in den `catch` laufen; und dass meine Ablehnung des Flakiness-Befunds
richtig war (die Millisekunden-Abschneidung schiebt den Bezugspunkt nach
früher).

## Geänderte und neue Aufträge

**H NEU — Matrix statt einer Probe.** Je Transport (Formular UND JSON):
1. `maB / belA / body.studio_id=B` → Ablehnung
2. `maA / belB / body.studio_id=B` → Ablehnung
3. `maB / belB / body.studio_id=B` → Ablehnung
4. ein NEUES eigenes Paar `maA2 / belA / body.studio_id=B` → Erfolg
   ausschliesslich unter A, **keine** Änderung unter B
Dazu DREI getrennte Gegenmutationen: nur MA-Nachschlag, nur BEL-Nachschlag,
nur Studio im INSERT. Jede einzeln gemessen.

**G NEU — Sentinels mandantengebunden erzeugen und löschen**, `rowCount === 1`
zusichern, keine globale Kontrollabfrage. Dazu `posEigen` mit `studio_id`, und
die beiden Zeitabfragen in die mandantengebundene Zeilenabfrage falten.

**B NEU — kein Kommentar-Regex, sondern `acorn`.** Selbst nachgemessen:
`acorn@8.18.0` ist direkte Abhängigkeit und wird im Bestand von SIEBEN
Dateien benutzt, darunter mehrere statische Wächter — es ist Hausstil, nicht
Neuland. Der bereits extrahierte `bindPlace()`-Ausschnitt wird als
eigenständiges Browser-JavaScript geparst; verlangt wird ein echtes
`ReturnStatement` im Ablehnungszweig VOR `positionen.push`. Dann sind
Kommentare bedeutungslos. Ein Zeilenregex über ein Template-Literal würde
`//` in Strings und URLs beschädigen.

**M NEU — ebenfalls `acorn` statt `includes()`.** Über `server.js`: je Pfad
GENAU EIN aktiver top-level `app.use` mit der Argumentfolge Pfad,
`requireAdmin`, Router — und ausdrücklich ausgeschlossen, dass derselbe Pfad
ein zweites Mal ungeschützt gemountet wird.

**L NEU — Schnappschuss je EINZELNEM Request, nicht je Block.** Ein Block mit
zwei Requests kann eine Änderung und ihre Rücknahme enthalten; Anfang und Ende
gleichen sich dann. Der Schnappschuss nimmt `id` MIT auf (sonst ist Löschen
und Neuanlegen mit denselben Fachfeldern unsichtbar) und läuft mit
`WHERE studio_id=$1`.

**J NEU — nicht passende Aufrufe unverändert weiterreichen** (mit korrektem
`this`), und die betroffenen Tests strikt seriell halten. Die Filterung auf
das Präfix schliesst den Poolfehler, aber `console.error` bleibt prozessweit
ersetzt; das ist eine Verkleinerung der Trefferfläche, keine Behebung. Als
datierter offener Punkt: ein injizierbarer Fehlerbeobachter statt der globalen
Ersetzung.

**E ERWEITERT — der `req.xhr`-Zweig ist ungeprüft.** Alle N12-Proben lösen
JSON über den `Accept`-Header aus. Wer `req.xhr ||` entfernt, lässt alle 86
Zusicherungen grün. Zusätzlicher Fall: halbe Admin-Sitzung, NUR
`X-Requested-With: XMLHttpRequest`, kein JSON-`Accept` → 401 JSON und
gelöschte Sitzung.

**NEU — `MINDEST_PRUEFUNGEN` der HAUPTdatei anheben.** Sie steht bei 86
(`test_feature_mandantengrenze_fremd_ids.js:214`). A, E, H, I, K und L bringen
zahlreiche neue `ok()`-Aufrufe; bleibt die Schranke bei 86, lassen sich alle
neu gebauten Zusicherungen wieder entfernen, ohne dass sie greift. Die neue
Zahl wird VON HAND aus dem Auftrag hergeleitet, **nicht** aus `pass + fail`
des grünen Laufs abgeschrieben.

**NEU — die in DIESEM Diff neuen Listener binden auf Loopback.**
`.listen(0, '127.0.0.1')` statt `.listen(0)`, und das `listening`-Ereignis
abwarten. Meine Ablehnung von B10 war insgesamt richtig (138 Bestandstests
arbeiten so, die Regel zielt auf `pm2`/`nginx`/`/var/www`) — aber sie war zu
grob: **was dieser Beitrag NEU aufmacht, kann er auch gleich richtig
aufmachen.** Die 138 Altstellen bleiben ein eigener Beitrag.

## Was NICHT gebaut wird

- **Der Flakiness-Befund bleibt gefallen** — von der Planprüfung ausdrücklich
  bestätigt.
- **Die acht fehlenden `Accept`-Header** bleiben ein eigener Beitrag, jetzt
  mit der korrigierten Liste oben.
- **B9** (Rumpf überschreibt `httpOk`) bleibt offener Punkt. Die Prüfung
  merkt zu Recht an, dass mein „kein Endpunkt liefert das Feld" aus dem
  MATERIAL nicht belegbar war — gemessen habe ich es im Repo, und das gehört
  dazugeschrieben statt behauptet.
- **Der injizierbare Logger** statt der globalen `console.error`-Ersetzung:
  eigener Beitrag, datierter offener Punkt.
