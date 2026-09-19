# Auftragspapier — Eingabewache: EINE Quelle für ID- und Textfeldprüfung

**Repo:** GymDocu (`/home/user/gymdocu`, Stand `4c4b729`).
**Herkunft:** Bündel 1 des risikoorientierten Durchgangs, Befunde B1-07 (DS-1)
und B1-08 (DS-2) aus `plaene/durchgang-befunde.md` — beide selbst nachgemessen.
**Warum das vorgeht** (STAND.md, Regel 5): Es zahlt auf Punkt 3 des
Pentest-Programms ein — eine Falscheingabe erzeugt heute HTTP 200 mit
Fehlerseite bzw. HTTP 500 UND je einen Telegram-Alarm über `intern()`
bzw. `errorTracker.melde()`; der Alarmkanal ist damit von aussen taktbar.

---

## 0. Was GEMESSEN ist (nicht vermutet)

Alles hier stammt aus eigener Messung am 19.09.2026. Zeilennummern am Stand
`4c4b729`; **vor dem Bau neu messen** (Hausregel: Zeilennummern veralten).

### 0.1 Die ID-Regel steht an VIER Orten, und keiner ist die Quelle

| Ort | Form |
|---|---|
| `routes/admin/geraete-typen.js:232` | eigene Funktion `istGueltigeId` |
| `routes/admin/ausmusterung.js:73` | eigene Funktion `istGueltigeId` |
| `routes/admin/tablets.js:46` | eigene Funktion `istGueltigeId` |
| `routes/admin/geraete.js:699` | inline `/^\d+$/.test(String(id))` |

Jede der drei Funktionen verweist im Kommentar auf eine der anderen als
Begründung — ein Zitierring ohne Quelle. Das ist der Fall, vor dem CLAUDE.md
warnt: „Wer eine doppelte Stelle ‚gleich hält‘, hat sie verdoppelt."

### 0.2 Zwei Routen derselben Datei sind NICHT nachgezogen

`routes/admin/geraete.js:337` (`POST /geraete/loeschen/:id`) und `:467`
(`POST /geraete/umbenennen/:id`) benutzen weiter `isNaN(id)` und `res.send()`
OHNE Status. Gemessen:

    "1e3"  isNaN: false   /^\d+$/: false
    "1.5"  isNaN: false   /^\d+$/: false
    "0x10" isNaN: false   /^\d+$/: false

Der Wert erreicht damit `t.one()`/`t.run()` für eine INTEGER-Spalte,
PostgreSQL wirft 22P02, der äussere `catch` antwortet mit der generischen
Fehlerseite und **HTTP 200**, und `intern()` schickt eine Meldung an den
Fehlerkanal. Der Kommentar an `:688-696` beschreibt genau das — als
Nachbesserung vom 17.09.2026, die an den beiden älteren Geschwisterstellen
derselben Datei nicht nachgezogen wurde.

### 0.3 Eine ZWEITE, ANDERE Klasse — nicht Teil dieses Auftrags

Fünf weitere Stellen machen `parseInt(x, 10)` VOR der Prüfung:
`routes/admin/mitarbeiter.js:670,703,736,835` und `routes/tablet-sperre.js:545`.
Die erreichen SQL NIE mit einem schlechten Wert — sie handeln aber still am
FALSCHEN Datensatz. Gemessen:

    parseInt("1e3",10)=1   parseInt("2abc",10)=2   parseInt("007",10)=7
    parseInt("0x10",10)=0  (von !id gefangen)      parseInt("abc",10)=NaN (gefangen)

`/mitarbeiter/loeschen/2abc` löscht also Mitarbeiter 2. **Das ist ein eigener
Befund, kein Teil dieser Klasse, und es ist KEIN Rechtegewinn** — alle fünf
Abfragen tragen `studio_id`, und wer `2abc` schicken kann, kann auch `2`
schicken. Er wird als Fundort in `plaene/durchgang-befunde.md` geführt und
SPÄTER eigens gemessen und entschieden. **In diesem Auftrag wird er nicht
angefasst.**

### 0.4 Die Textfeld-Regel: `String(...)` schützt, `|| ''` NICHT

Gemessen über fünf Dateien: `.trim()`-Aufrufe auf `req.body`-Werte VOR dem
`try` der jeweiligen Route.

`server.js:161` fährt `express.urlencoded({ extended: true })`, also `qs` —
`name[a]=x` liefert ein OBJEKT, `name=a&name=b` ein ARRAY. Beide sind truthy,
`!wert` fängt sie nicht, und `wert.trim` ist keine Funktion. Express ist
**5.2.1** (gemessen), reicht die abgelehnte Promise eines `async`-Handlers also
an den globalen Fehlerbehandler `server.js:1467` durch: `errorTracker.melde()`
(Log + gedrosselter Telegram-Alarm) und **HTTP 500**.

**Verwundbar** (roher Wert, kein `String()`):

| Datei:Zeile | Route | Bemerkung |
|---|---|---|
| `geraete.js:235` | `POST /geraete` | `!name \|\| !name.trim()` |
| `geraete.js:469-470` | `POST /geraete/umbenennen/:id` | `neuerNameRoh.trim()` |
| `geraete.js:4981-4982` | `POST /geraetewartung/kategorie/neu` | `name.trim()` nach `if (!name)` |
| `geraete.js:5030-5031` | `POST /geraetewartung/kategorie/bearbeiten/:id` | **ganz ohne Guard** — ein FEHLENDES `name` wirft schon heute |
| `geraete.js:5441-5445` | `POST /geraetewartung/geraet/neu` | `name.trim()`, `inventarnummer.trim()`, `notizen` |

**Nicht verwundbar, und der Grund gehört ins Vorbild:**
`geraete-typen.js:393,394,448,450` wickelt jeden Wert in `String(...)` —
`String({})` ist `"[object Object]"`, das wirft nicht. Daneben steht dort
`pruefeTextfelder()` (`:246`), das den Objektfall AUSDRÜCKLICH mit 400
abweist, damit die Abweisung ehrlich heisst „muss Text sein" statt „Name darf
nicht leer sein".

`routes/admin/mitarbeiter.js:346,347,671,737,808` trägt dieselbe Lücke
(`(req.body.x || '').trim()` — ein Objekt ist truthy und überlebt das `|| ''`).
**Auch das ist NICHT Teil dieses Auftrags**, sondern ein gemessener Fundort für
einen eigenen Beitrag: andere Datei, anderes Rückmeldeverhalten (Redirect
statt Fehlerseite), und `mitarbeiter.js` enthält harte Löschungen.

---

## 1. Was gebaut wird

### 1.1 EINE Quelle: `core/eingabe-pruefung.js` (neu)

    istGueltigeId(wert)        -> boolean
    pruefeTextfelder(paare)    -> string|null   // [['Name', wert], …]

`core/` importiert nach Repo-Regel nicht aus `routes/` — die kanonische Stelle
gehört deshalb nach `core/`, genau wie bei `core/html-escape.js`. Der
Dateikopf nennt die vier bzw. zwei abgelösten Orte namentlich und die
Begründung der Regel (was `isNaN` durchlässt, was `|| ''` nicht fängt), damit
niemand sie später als „doppelt" wieder auseinanderzieht.

**Die Regel selbst wird NICHT neu erfunden**, sondern wörtlich aus
`geraete-typen.js:232` bzw. `:246` übernommen. Wer sie ändert, ändert Verhalten
an vier Orten gleichzeitig — das wäre ein anderer Auftrag.

### 1.2 Die drei bestehenden Kopien werden GEBUNDEN, nicht nachgezogen

`geraete-typen.js:232`, `ausmusterung.js:73`, `tablets.js:46` und der Inline-
Ausdruck `geraete.js:699` rufen ab jetzt die Quelle. Ebenso
`geraete-typen.js:246` für `pruefeTextfelder`. Die lokalen Namen dürfen
bleiben (`const istGueltigeId = require(...).istGueltigeId`), der zweite
Regelkörper nicht.

### 1.3 Die beiden nicht nachgezogenen ID-Wachen

`geraete.js:337` und `:467`: `isNaN(id)` → `istGueltigeId(id)`, und
`res.send(...)` → `res.status(400).send(...)`, wortgleich zum bereits
umgestellten Geschwisterpfad `:699`.

### 1.4 Die fünf verwundbaren Textfeld-Stellen in `geraete.js`

Vor jedem `.trim()` eine `pruefeTextfelder`-Vorprüfung mit
`res.status(400)` und derselben Meldung wie im Vorbild („… muss Text sein.").
Betroffen: die fünf Zeilen aus 0.4. Bei `:5030` ist zusätzlich der fehlende
Leer-Guard zu ergänzen — heute wirft dort schon ein FEHLENDES Feld.

---

## 2. Was ausdrücklich NICHT gebaut wird

* **`mitarbeiter.js` und `tablet-sperre.js`** — gemessene Fundorte (0.3, 0.4),
  eigener Beitrag. Wer sie hier mitnimmt, vergrössert den Diff um zwei grosse
  Dateien mit harten Löschungen.
* **Die `parseInt`-Klasse** (0.3) — andere Klasse, andere Behebung.
* **Eine Änderung der REGEL selbst.** `/^\d+$/` bleibt `/^\d+$/`; keine obere
  Schranke, keine Längengrenze. Das Formular beim Anlegen hat serverseitig
  ausser „nicht leer nach trim()" ohnehin keine Längengrenze (`geraete.name`
  ist TEXT, kein `VARCHAR(n)`) — „dieselbe Grenze wie beim Anlegen" heisst hier
  wörtlich: keine neue erfinden.

---

## 3. Zusicherungen — je mit der Gegenprobe, die sie rot macht

Jede neue Zusicherung braucht den Nachweis, dass sie fallen KANN. Der Nachweis
ist **wörtlich zu melden**, beide Richtungen.

### Z1 — Die ID-Wache weist ab, und zwar mit 400

Für JEDE der beiden Routen einzeln, über den echten HTTP-Weg mit gültiger
Admin-Sitzung:

* `POST /admin/geraete/loeschen/1e3` → **400**, Rumpf enthält `Ungültige ID.`,
  Rumpf enthält NICHT `Datenbankfehler`.
* `POST /admin/geraete/umbenennen/1.5` mit `neuerName=x` → ebenso.
* **Positivkontrolle in die Gegenrichtung** (sonst prüft die Wache nur, dass
  sie alles abweist): `POST /admin/geraete/loeschen/<echte numerische id>` →
  **302**, und die Zeile ist in `geraete` auf `aktiv=0`.

**Gegenprobe:** `istGueltigeId` in `core/eingabe-pruefung.js` auf
`(w) => !isNaN(w)` zurückdrehen → Z1 muss ROT werden. Zurücknehmen → GRÜN.

### Z2 — Das Objekt im Formularkörper wird zu 400, nicht zu 500

Für JEDE der fünf Stellen aus 0.4 einzeln:

* `neuerName[a]=x` an `POST /admin/geraete/umbenennen/<id>` → **400**, Rumpf
  enthält `muss Text sein`.
* `name[a]=x` an `POST /admin/geraete` → **400**.
* dasselbe für die drei Wartungs-Routen.
* **Positivkontrolle:** derselbe Aufruf mit `neuerName=Neuername` → **302**,
  und der Name steht geändert in der DB.
* **Kontrollmessung gegen eine falsche Ursache:** der 400er darf nicht aus
  einem vorgelagerten CSRF-/Origin-Riegel stammen. Beleg ist der Unterschied
  zwischen den beiden Aufrufen oben — gleicher Request, nur die
  Klammernotation verschieden, 400 gegen 302.

**Gegenprobe:** die Vorprüfung an EINER Stelle entfernen → genau diese
Zusicherung muss ROT werden (und der Lauf darf dabei nicht abstürzen, sondern
muss eine FAIL-Zeile schreiben). Zurücknehmen → GRÜN.

### Z3 — Es gibt keine zweite Regelkopie mehr

Statisch, ausführbar, über den Quelltext (Kommentare vorher abziehen, s.
CLAUDE.md „Tests dürfen nicht an Prosa scheitern"):

* In `geraete-typen.js`, `ausmusterung.js`, `tablets.js` und `geraete.js`
  steht **kein eigener Regelkörper** mehr: kein `/^\d+$/` und kein
  `typeof … === 'object'` als Wache, sondern ein `require` auf
  `core/eingabe-pruefung`.
* **Positivkontrolle für das Suchmuster selbst** (Hausregel, dreimal
  hineingelaufen am 18.09.): das Muster wird zuerst an der HEUTIGEN Fassung
  gelernt — es muss dort die vier bzw. zwei bekannten Fundstellen FINDEN.
  Findet es sie nicht, ist das Muster falsch, nicht der Code.

**Diese Zusicherung gehört an den AUFRUFER, nicht in den Helfer** (CLAUDE.md,
14.09.2026: nur der Aufrufer besitzt eine von der Helfer-Konstante unabhängige
zweite Quelle). Der Sollwert „vier Orte" wird LITERAL hingeschrieben, nicht aus
dem Scan abgeleitet.

### Z4 — Der Helfer selbst, in der PRODUKTIONSFORM aufgerufen

`istGueltigeId` und `pruefeTextfelder` bekommen eigene Fälle — aber mit
denselben Argumenttypen, die die Routen übergeben (Zeichenketten aus
`req.params`, rohe Werte aus `req.body`), **nicht** in einer bequemeren Form.
Mindestens: `"1e3"`, `"1.5"`, `"0x10"`, `""`, `" "`, `"12"`, `{}`, `[]`,
`["a","b"]`, `null`, `undefined`.

**Wichtig:** Z4 ERSETZT Z1/Z2 nicht. Eine Hilfsfunktion isoliert zu prüfen ist
nicht den Weg zu prüfen (CLAUDE.md) — beide braucht es.

---

## 4. Abnahme

1. **Volle Suite**, ohne Pipe und ohne äusseres `flock`:
   `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. EXIT 0.
2. **Dateizahl-Ritual**: gelaufene gegen registrierte Dateien, `diff` EXIT 0.
   Zählmuster beidseitig: `grep -oE '── [A-Za-z0-9_/.-]+\.(js|sh) ──'` aus dem
   Log gegen `grep -oE '(test_[A-Za-z0-9_]+\.js|ops/boot-smoke\.js|test/[A-Za-z0-9_-]+\.sh)'`
   aus `test/run.sh`, beide `sed 's/^[[:space:]]*//' | sort -u`, `test/run.sh`
   selbst aus der zweiten Liste streichen.
3. **`npm run lint`** — Ergebnis **wörtlich melden, auch bei Grün**. Ein nicht
   gelaufener Schritt ist kein bestandener.
4. **Alle Gegenproben aus Abschnitt 3 wörtlich gemeldet**, beide Richtungen,
   mit `node --check` auf jede sabotierte Datei vor dem Lauf.
5. **Marker-Scan sauber**, Ausschluss auf dem PFAD:
   `grep -rn --exclude-dir=node_modules --exclude-dir=.git "GEGENPROBE-DEFEKT\|SABOTAGE" .`
   → im GymDocu-Repo genau 6 Treffer, alle in `docs/offene-befunde-31-08-2026.md`.
6. **Commit und Push VOR dem Warten auf einen Hintergrundlauf.**

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* Findet er eine SECHSTE verwundbare `.trim()`-Stelle in `geraete.js`, die in
  0.4 fehlt: melden, nicht stillschweigend mitnehmen — meine Liste ist dann
  unvollständig, und das ist ein Befund über den Auftrag.
* Wird eine bestehende Zusicherung durch die Umstellung ROT, die den bisherigen
  Status 200 bzw. 500 festschreibt: **nicht streichen**, sondern melden. Solche
  Wächter werden fachlich umgestellt.
* Widerspricht ihm eine Messung: der Widerspruch ist das wertvollste Ergebnis.

---

# NACHTRAG — Planprüfung, Spur 2 (`deepseek-flash`), 19.09.2026

Frage: *„Was verspricht dieser Plan, das er nicht einlöst?"* — **neun Befunde,
alle neun von mir selbst nachgemessen, alle neun tragen.** Zwei mit einer
kleinen Einschränkung, die unten benannt ist.

Verbrauch: 14.458 rein / 34.237 raus (davon 26.768 Denk-Token), 150 s.
Material: das Auftragspapier plus Ausschnitte, **kein Repo-Zugriff** — die Spur
hat ausschliesslich aus dem Papier und den abgedruckten Zeilen gearbeitet.

**Das Papier war also an neun Stellen falsch oder lückenhaft, BEVOR eine
einzige Zeile gebaut wurde.** Genau dafür ist die Regel „der Plan geht vor der
ersten Bau-Runde raus" da.

## P-1 (blockierend) — Z3 widerspricht 1.2/1.4 in derselben Datei

Z3 verbietet in `geraete.js` „kein `/^\d+$/` UND kein `typeof … === 'object'`
als Wache". Genau so eine Wache steht dort: `geraete.js:708`, in der
`inbetriebnahme`-Route. **Gemessen:** `grep -c "typeof .*=== *'object'"
routes/admin/geraete.js` → **1**, und zwar diese. Kein Bauabschnitt plant,
sie umzustellen: 1.2 bindet nur `geraete-typen.js:246`, 1.4 listet fünf
`.trim()`-Stellen, `:708` ist keine davon.

Folge nach der Umsetzung: Z3 ist entweder ROT oder wird stillschweigend auf
die ID-Regel verengt und misst dann nicht mehr, was ihr Text behauptet.
Verschärfend: Z3s Verbot erzeugt einen Anreiz, die Wache dort zu LÖSCHEN —
sie ist laut Kommentar `:700-707` fast verhaltensneutral, also fällt es
niemandem auf.

**TRÄGT.** Entscheidung: `:708` kommt in 1.4 dazu (dann sind es SECHS Stellen,
und Z2 braucht einen sechsten HTTP-Fall), und Z3 nennt Regel und Ort getrennt.

## P-2 (hoch) — Z3s NAME sichert mehr zu, als Z3 misst

Z3 heisst „Es gibt keine zweite Regelkopie mehr" — ein Satz über das REPO —
misst aber vier namentlich genannte Dateien. **Gemessen:**
`routes/admin/mitarbeiter.js` trägt dieselbe Lücke an fünf Stellen (346, 347,
671, 737, 808) und enthält `pruefeTextfelder` **null mal**.

Das ist die Klasse „ein Name, der mehr verspricht als die Zusicherung hält" —
und sie ist hier schlechter als der heutige Zustand, weil heute niemand aus
der Existenz eines `core/eingabe-pruefung.js` auf Abdeckung schliessen kann.
Verschärfend: die Präambel begründet die Dringlichkeit mit dem „von aussen
taktbaren Alarmkanal" — dieser Satz gilt nach der Umsetzung unverändert
weiter, der Auftrag löst sein eigenes Warum also nur zum Teil ein.

**TRÄGT.** Entscheidung: Z3 wird wörtlich auf „in diesen vier Dateien" verengt,
und die Restliste (`mitarbeiter.js`, `tablet-sperre.js`) wird als OFFEN in
`plaene/durchgang-befunde.md` geführt.

## P-3 (hoch) — Z3 misst die SCHREIBWEISE, nicht die REGEL, und keine Verdrahtung

Nach der Umsetzung ist diese EINZEILIGE Änderung unsichtbar: in
`geraete.js:699` `!istGueltigeId(id)` zurück auf `isNaN(id)`. Z3 kennt
`isNaN` nicht (sie sucht `/^\d+$/` und `typeof object`), das `require` bleibt
stehen, Z1 fährt nur `loeschen` und `umbenennen`, Z4 prüft nur den Helfer.
Ergebnis: `POST /admin/geraete/inbetriebnahme/1e3` liefert wieder 200 mit
„Datenbankfehler" und Alarm — derselbe Befund wie 0.2, nur an der dritten
Stelle. Dasselbe gilt für jede andere Schreibweise derselben Regel
(`/[0-9]+/`, `Number.isInteger(Number(id))`).

**TRÄGT** — und es ist genau die Klasse „Ein Verdrahtungsfehler ist die Lücke,
die eine Behebung hinterlässt" aus CLAUDE.md, in meinem eigenen Papier
übersehen. Entscheidung: Z3 bekommt `isNaN(` ins Muster, und **jede Route mit
`:id` in den betroffenen Dateien wird über HTTP geprüft**, nicht per Muster.

## P-4 (hoch) — Das VORBILD ist von keiner Zusicherung bewacht

1.2 bindet `geraete-typen.js:246` an die neue Quelle — gebunden wird die
FUNKTION, nicht ihre AUFRUFE. Z1/Z2 nennen ausschliesslich `geraete.js`-Routen.
Damit ist das Löschen EINER Zeile unsichtbar: der `pruefeTextfelder`-Aufruf in
`geraete-typen.js:390`.

**Gemessen, und die Folge ist schlimmer als ein 500er:** `String({a:1})` ist
`"[object Object]"` und `String(["a","b"])` ist `"a,b"` — beides wirft nicht
und beides überlebt die Leer-Prüfung `:393`. Ohne den Aufruf schriebe
`POST /admin/geraete/cardio/umbenennen/<id>` mit `neuerName[a]=x` still
`[object Object]` nach `geraete.name`: **kein 500, kein Alarm, eine korrupte
Zeile.**

**TRÄGT.** Entscheidung: Z2 wird auf `geraete-typen.js:390` und `:435`
ausgedehnt, mit der Gegenprobe „Aufruf an EINER Stelle entfernen → genau diese
Zusicherung ROT".

## P-5 (mittel) — Ich habe den Schutz dem falschen Mechanismus zugeschrieben

0.4 schreibt: `geraete-typen.js` sei „nicht verwundbar … weil es jeden Wert in
`String(...)` wickelt". **Y ist richtig gemessen, die Folgerung trägt Y aber
nicht:** `String()` verhindert nur den Wurf, nicht das Schreiben. Sicher ist
die Datei allein wegen des `pruefeTextfelder`-AUFRUFS (P-4).

Praktische Folge, und deshalb ist es kein Wortklauben: 1.1 will diese
Begründung wörtlich in den Kopf der neuen Quelle schreiben. Wer die Lehre
„`String()` schützt" dann in `geraete.js` anwendet, tauscht dort einen 500er
gegen ein stilles Schreiben.

**TRÄGT.** Entscheidung: der Satz wird berichtigt — `String()` verhindert den
Absturz, die ABWEISUNG kommt vom Aufruf.

## P-6 (mittel) — Ein Kommentar im Bestand behauptet eine falsche MENGE

`routes/admin/tablets.js:42-43`: „dieselbe Prüfung wie an **jeder anderen
Stelle** im Admin-Bereich, die eine `:id` aus der URL übernimmt".
**Gemessen:** `grep -rn "isNaN(id)" routes/admin/` liefert **sechs
Gegenbeispiele** — `geraete.js:337,467` und `mitarbeiter.js:672,704,738,836`.

Die Mengenaussage ist falsch, und 1.1 hätte sie kanonisch in den Dateikopf der
neuen Quelle übernommen.

**TRÄGT.** Entscheidung: der Kopf der neuen Quelle nennt die abgelösten Orte
NAMENTLICH und macht keine Aussage über „jede andere Stelle".

## P-7 (mittel) — „Zitierring ohne Quelle" stimmt nicht

0.1 behauptet, jede der drei Funktionen verweise auf eine der anderen.
**Gemessen:** `geraete-typen.js:227-231` nennt „Befund 11, unabhängige Prüfung
28.08.2026, GEMESSEN" und keine Schwester. Es ist ein **Stern mit Quelle**,
kein Ring: `ausmusterung.js:73` und `tablets.js:46` zeigen beide dorthin.

**TRÄGT sachlich.** *Einschränkung zu seiner eigenen Nachmessung:* er sagte
`grep -n 'ausmusterung\|tablets' routes/admin/geraete-typen.js` → 0 Treffer;
gemessen ist es **1**, aber der Treffer ist `:351`, eine URL in der
HTML-Ausgabe, keine Zitatstelle. Die Vorhersage war ungenau, der Befund
richtig.

Folge für den Auftrag: die Begründung wird berichtigt, und der Umbau ist
KLEINER als gedacht — `geraete-typen.js:227-231` ist bereits die kanonische
Begründung und wandert mit, zwei Verweise werden umgehängt statt drei.

## P-8 (mittel) — Eine Ausklammerung, die auf einer BEHAUPTUNG steht

0.3 klammert die `parseInt`-Klasse aus mit der Begründung „alle fünf Abfragen
tragen `studio_id`". Das war **behauptet, nicht gemessen** — im Material war
keine der fünf Abfragen abgedruckt.

**Jetzt gemessen, je einzeln:** `tablet-sperre.js:550` → `WHERE studio_id = $1
AND id=$2 AND aktiv=1`; `mitarbeiter-auth.js:173` (der Einladungsweg) →
`WHERE studio_id = $1 AND id=$2 AND aktiv=1`; `mitarbeiter.js` E-Mail-,
PIN- und Löschweg → jeweils `AND studio_id`, im Löschweg auch alle
Folgeanweisungen (`DELETE FROM belehrung_freischaltung`, `mitarbeiter_token`).
**Die Folgerung hält.**

**TRÄGT als Methodenbefund, nicht als Sachbefund.** Der Unterschied zählt: die
Ausklammerung bleibt, aber sie steht ab jetzt auf einer Messung. Ein Satz der
Form „X ist unbedenklich, weil Y" ist eine Tatsachenbehauptung über Y.

## P-9 (niedrig) — Die Bauanweisung 1.3 ist invertiert

1.3 schreibt die Ersetzung wörtlich als „`isNaN(id)` → `istGueltigeId(id)`".
`isNaN` ist WAHR bei UNGÜLTIG, `istGueltigeId` ist WAHR bei GÜLTIG. Wörtlich
ausgeführt entstünde `if (!id || istGueltigeId(id))` — eine invertierte Wache,
die gültige IDs abweist und `1e3` durchlässt.

**TRÄGT.** Z1s Positivkontrolle finge es, aber die Anweisung selbst ist falsch.
Entscheidung: 1.3 lautet ab jetzt `!istGueltigeId(id)`.

---

## Was diese Runde für die Arbeitsweise zeigt

**Neun von neun getragen, an einem Papier, das ich für sorgfältig gehalten
habe** — vier davon (P-1, P-3, P-4, P-9) hätten fehlerhaften Code oder eine
nicht fallende Zusicherung erzeugt, drei (P-5, P-6, P-7) berichtigen
Tatsachenbehauptungen, die ich in einen kanonischen Dateikopf geschrieben
hätte.

**Und die Spur hatte KEINEN Repo-Zugriff.** Sie hat aus dem Papier und den
mitgelieferten Ausschnitten gearbeitet. Das ist ein Argument für die Sorgfalt
beim BÜNDELN, nicht für mehr Werkzeuge: fünf der neun Befunde stützen sich auf
Zeilen, die ich selbst mitgeschickt habe.

---

# NACHTRAG — Planprüfung, Spur 1 (`gpt-5.6-sol`), 19.09.2026

Frage: *„Was bricht dieser Plan, das heute funktioniert?"* — **acht Befunde,
vier davon blockierend. Urteil des Prüfers: `nicht_freigabefaehig`.** Alle acht
von mir selbst nachgemessen, **alle acht tragen.**

62 Suchen, 44 Lesungen, 17 Runden, 2.041.937 rein / 32.995 raus, **11,20 $**.
Diese Spur hatte Repo-Lesezugriff. Geschwärzt wurde eine Stelle
(`core/db.js:334`, Verbindungszeichenfolge), abgelehnte Lesungen: keine.

**Was er NICHT gefunden hat, und das gehört dazu:** keinen bestehenden
legitimen Aufrufer, der an der schärferen ID-Prüfung bricht, und keine
bestehende Zusicherung, die den heutigen 200-/500-Status genau der beiden
Zielrouten festschreibt. Das war Frage 1 und 2 meines Auftrags — die Antwort
„nichts gefunden, hier ist die Rechenschaft" ist ein Ergebnis.

## S-1 (blockierend) — Die Textregel, die ich kanonisieren wollte, ist unvollständig

`pruefeTextfelder` weist nur Objekte und Arrays ab. **Gemessen:**

    typeof 42 === 'object'   ->  false        (passiert die Wache)
    (42).trim()              ->  TypeError: 42.trim is not a function
    (true).trim()            ->  TypeError: true.trim is not a function
    String(42)  = "42"       String(true) = "true"    (stille Koerzierung)

`server.js:162` montiert `express.json()` GLOBAL, und der CSRF-Schutz
(`core/csrf-schutz.js`) prüft Origin/Referer, **keinen Content-Type** — ein
JSON-Körper `{"name":42}` erreicht diese Routen also. Ergebnis: 500 samt
`errorTracker`-Alarm an den rohen Stellen, ein Gerät namens `"true"` an den
`String(...)`-Stellen.

**TRÄGT, blockierend.** Ich hätte eine Regel in eine kanonische `core/`-Datei
geschrieben, die zwei von vier gefährlichen Typen durchlässt. Entscheidung:
die Regel lautet `typeof wert === 'string'` für vorhandene Werte; `null` und
`undefined` bleiben für Optionalfelder erlaubt. Z2 und Z4 bekommen JSON-Zahlen
und -Booleans.

## S-2 (blockierend) — Die ID-Regel, die ich kanonisieren wollte, ist die SCHWÄCHERE von zwei im Repo

`/^\d+$/` prüft nur die lexikalische Form. `"99999999999"` besteht sie und
wirft danach an der ersten INTEGER-Abfrage 22003 „out of range" — die
Zielrouten antworten mit ihrer 200-Fehlerseite und rufen `intern()`.
**Damit bliebe genau der Alarmkanal offen, mit dem die Präambel dieses
Auftrags seine Dringlichkeit begründet.**

**Gemessen:** dieselbe Datei hat mit `normalisiereGeraetId`
(`routes/admin/geraete.js:949-955`) bereits die richtige Regel — Ziffern UND
`zahl > 0 && zahl <= 2147483647` — und ihr Kommentar (`:941-944`) nennt genau
diesen Fall als gemessen behoben.

**TRÄGT, blockierend, und es ist der schärfste Befund der Runde.** Ich war im
Begriff, von zwei im Bestand vorhandenen Regeln die schwächere zur Quelle zu
erklären. Entscheidung: `istGueltigeId` verlangt zusätzlich die int4-Grenze;
Gegenproben mit `"0"`, `"2147483647"`, `"2147483648"`.

## S-3 (blockierend) — Meine Liste der fünf Stellen misst eine zu enge Eigenschaft

Die Liste ist vollständig für „rohes `.trim()` VOR dem äusseren `try`" — genau
das hat mein Zählskript gesucht. Für die Klasse ist sie es nicht. **Gemessen:**

* `routes/admin/geraete.js:5496` — `aufgaben.trim()` steht **NACH** dem
  `INSERT … RETURNING id` in `:5485`. Ein Objekt dort wirft, der `catch`
  liefert HTTP 200 mit `intern()`-Meldung, **und das halb angelegte Gerät
  bleibt in der Datenbank.** Das ist dieselbe Stelle, die B1-03 (SOL-3) als
  Transaktionsbefund trägt — hier trifft sie ein zweites Mal.
* `:5490-5492` — `(monteur_name||'').trim()` und zwei Geschwister, ebenfalls
  innerhalb des `try`.
* `POST /geraetewartung/geraet/bearbeiten/:id` trägt weitere rohe Trims.

**TRÄGT, blockierend.** Der Befund trifft nicht die Liste, sondern meine
MESSMETHODE: ein Skript, das nur bis zum ersten `try` schaut, misst die
Position der Fehlerbehandlung, nicht die Verwundbarkeit.

## S-4 (blockierend) — „Vier Orte" ist falsch, und Z3 wäre sofort rot

**Gemessen** — ausführbare `/^\d+$/`-Vorkommen in den vier genannten Dateien:

    geraete-typen.js:233   tablets.js:47   ausmusterung.js:77
    ausmusterung.js:92     geraete.js:699  geraete.js:952

**Sechs, nicht vier.** Die beiden zusätzlichen sind ANDERE Funktionen:
`parseIds()` (ein ID-SAMMELFELD) und `normalisiereGeraetId()` (int4-
Normalisierung). Ein Z3 mit dem literalen Sollwert „vier" und dem Text „kein
`/^\d+$/` mehr in diesen Dateien" wäre nach dem Umbau sofort rot — an zwei
völlig legitimen Stellen.

**TRÄGT, blockierend.** Entscheidung: die drei Regelbegriffe (einzelne URL-ID,
ID-Sammelfeld, int4-Normalisierung) werden im Papier getrennt benannt, und Z3
bindet sich an benannte Funktionsdeklarationen und Aufrufstellen statt an eine
Zeichenkette.

## S-5 (sollte behoben werden) — die Einzeilenmutation, nach der ich gefragt hatte

`if (false && !istGueltigeId(id)) return …` lässt `require`, Helfer und die
Abwesenheit von `/^\d+$/` unverändert. **Z3 bleibt grün, die Route lässt jede
ID durch.** Dasselbe mit `if (false && textfehler)`.

**TRÄGT.** Dieselbe Klasse wie P-3 aus Spur 2, aber eine andere, härtere
Mutation: P-3 tauscht die Schreibweise, S-5 hängt die Wache ab, ohne sie
anzufassen. Entscheidung: die Wirksamkeit wird über HTTP geprüft, nicht über
ein Muster — für JEDE Route mit `:id` in den betroffenen Dateien.

## S-6 (sollte behoben werden) — eine SIEBTE Stelle, und zwar eine stille

`routes/admin/geraete.js:4353` (`POST /geraetewartung/spuelplan/stelle/neu`):

    const name = String(req.body.name || '').trim().slice(0, 120);
    if (name.length < 2) return …
    await db.one("INSERT INTO spuel_stellen (studio_id, name, hinweis) …")

Keine `pruefeTextfelder`-Wache davor. `String({a:1})` ist `"[object Object]"`
— sechzehn Zeichen, besteht die Längenprüfung — und wird als Name
GESPEICHERT. Kein 500, kein Alarm, eine korrupte Zeile.

**TRÄGT** — und bestätigt P-5 aus Spur 2 an einer Stelle, die Spur 2 nicht
kannte. Nebenbefund beim Nachmessen: `test/helfer/route-harness.js` nennt in
seinem Kommentar genau diese Klasse als „Review-Fund U7", geschlossen für
`routes/admin/qr.js`. Die Klasse ist im Repo bekannt und nur teilweise zu.

## S-7 (sollte behoben werden) — „über den echten HTTP-Weg" ist eine Überbehauptung

**Gemessen** an `test/helfer/route-harness.js:26-55`: `makeApp()` montiert
`pfadKontext()`, beide Parser, eine gefälschte Session und `routes/admin` +
`routes/module`. Es montiert **NICHT**: CSRF, `studioContext`, `requireLogin`,
`requireAdmin`, Wartungsmodus, Produktionslimit. Die gefälschte Sitzung hat
kein `totpOk` — sie funktioniert nur, weil `requireAdmin` gar nicht da ist.

Folge für mein Papier: Z1/Z2 sagen „über den echten HTTP-Weg mit gültiger
Admin-Sitzung", und Z2 enthält sogar eine „Kontrollmessung gegen eine falsche
Ursache", die einen CSRF-Riegel ausschliessen soll — **in diesem Harness ist
gar keiner montiert, die Kontrollmessung belegt dort nichts.**

**TRÄGT.** Das ist die Klasse „eine Referenz von aussen belegt genau die
Stufe, die sie misst". Entscheidung: der Wortlaut wird berichtigt auf
„Routenhandler erreicht"; wer Auth oder CSRF zusichern will, braucht einen
anderen Aufbau.

## S-8 (sollte behoben werden) — meine Begründung fürs Ausklammern trägt nicht

Die `parseInt`-Klasse getrennt zu behandeln ist vertretbar (andere Wirkung,
andere Rückmeldung). **Nicht vertretbar ist die Überschrift „EINE Quelle"**,
solange `parseIds()`, `normalisiereGeraetId()`, vier Mitarbeiter-Routen und
der Tablet-Weg weitere Quellen bleiben. Und: `routes/admin/mitarbeiter.js:808`
liegt ebenfalls VOR dem `try` und ist exakt dieselbe Typfehlerklasse — **mein
Grund „`mitarbeiter.js` enthält harte Löschungen" begründet nicht, warum eine
frühe Typabweisung dort riskanter wäre.** Gerade am Löschweg verhindert sie,
dass ein falscher Datensatz erreicht wird.

**TRÄGT.** Dieselbe Klasse wie P-2 aus Spur 2. Entscheidung: der Grund wird
ersetzt (Diffgrösse und getrennte Prüfbarkeit, nicht „harte Löschungen"), und
der Helferkommentar behauptet nicht, die einzige ID-Quelle des Repos zu sein.

---

## Beide Spuren zusammen — 17 Befunde, 17 getragen, DIESMAL MIT Überschneidung

| | Spur 1 (`sol`) | Spur 2 (`deepseek-flash`) |
|---|---|---|
| Frage | was bricht der Plan? | was verspricht er, das er nicht einlöst? |
| Repo-Zugriff | ja (62 Suchen, 44 Lesungen) | nein, statisches Bündel |
| Verbrauch | 2.041.937 rein / 32.995 raus | 14.458 rein / 34.237 raus |
| Kosten | **11,20 $** | **~0,03 $** |
| Befunde | 8 (4 blockierend) | 9 (1 blockierend) |
| davon getragen | **8** | **9** |

**Überschneidung: DREI von siebzehn** — P-3/S-5 (Z3 erkennt keine
Verdrahtung), P-5/S-6 (`String()` ist nicht der Schutz), P-2/S-8 (der Name
sichert mehr zu als die Zusicherung misst). Jede Spur hatte trotzdem fünf bis
sechs Befunde, die die andere nicht hatte.

**Das ist ein ANDERES Ergebnis als am 13.09. und bei Bündel 1** (dort je null
Überschneidung) und gehört so festgehalten. Die Erklärung liegt nahe: dort
waren die Fragen verschieden UND das Material war Code; hier ist das Material
ein PAPIER, über dessen Schwächen beide Fragen stolpern müssen. **Belegt ist
das nicht — es ist eine Vermutung über eine Stichprobe von eins.**

**Was die Kosten NICHT hergeben:** die 11,20-$-Spur lieferte die vier
blockierenden Befunde, die 0,03-$-Spur den einzigen, der eine invertierte
Bauanweisung fand. Der Preis eines Laufs sagt weiter nichts über den Ertrag —
aber hier hat die teure Spur etwas geleistet, das die billige strukturell
nicht konnte: S-2, S-4, S-6 und S-7 stützen sich ALLE auf Dateien, die nicht
im Bündel waren. **Repo-Lesezugriff war der Unterschied, nicht das Modell.**

## Folge für dieses Papier

**Es ist in der vorliegenden Fassung nicht baubar.** Vier blockierende Befunde
betreffen den KERN: die zu kanonisierende Textregel (S-1), die zu
kanonisierende ID-Regel (S-2), die Vollständigkeit der Stellenliste (S-3, S-6)
und den Sollwert von Z3 (S-4, P-1). Fassung 2 folgt; bis dahin wird nichts
gebaut.
