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
