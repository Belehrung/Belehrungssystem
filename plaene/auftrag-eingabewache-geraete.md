# Auftragspapier — Eingabewache (FASSUNG 1 und 2, BEIDE ÜBERHOLT)

> **DIESES PAPIER WIRD NICHT MEHR GEBAUT.** Es ist das Protokoll von zwei
> Planprüfungsrunden über zwei Fassungen: **Runde 1 = 17 Befunde, Runde 2 =
> 17 Befunde, alle 34 selbst nachgemessen, alle getragen**, sieben davon
> blockierend. Der Ertrag ist NICHT eine dritte Fassung desselben Auftrags,
> sondern eine METHODENÄNDERUNG (Begründung im Nachtrag Runde 2 ganz unten).
>
> **Gebaut wird stattdessen:** `plaene/auftrag-id-wache.md` und
> `plaene/auftrag-textfeld-wache.md`.

---

# Auftragspapier — Eingabewache: EINE Quelle für ID- und Textfeldprüfung

**FASSUNG 2 (19.09.2026).** Fassung 1 wurde von zwei Planprüfungen mit
**17 Befunden** zerlegt, alle 17 selbst nachgemessen, alle 17 getragen; vier
davon blockierend. Die Nachträge unten sind das Protokoll und bleiben stehen.
**Diese Fassung ersetzt Fassung 1 vollständig** — wer Fassung 1 baut, baut
vier gemessene Fehler ein.

**Repo:** GymDocu (`/home/user/gymdocu`, Stand `4c4b729`).
**Herkunft:** B1-07 und B1-08 aus `plaene/durchgang-befunde.md`.
**Warum das vorgeht** (STAND.md, Regel 5): Punkt 3 des Pentest-Programms — eine
Falscheingabe erzeugt heute HTTP 200 mit Fehlerseite bzw. HTTP 500 und je einen
Alarm über `intern()` bzw. `errorTracker.melde()`; der Alarmkanal ist damit von
aussen taktbar.

---

## 0. Was GEMESSEN ist

Zeilennummern am Stand `4c4b729`. **Vor dem Bau neu messen.**

### 0.1 Die ID-Regel: drei VERSCHIEDENE Begriffe, nicht eine Regel an vier Orten

Fassung 1 zählte „vier Orte" und nannte es einen „Zitierring ohne Quelle".
**Beides war falsch** (S-4, P-7). Gemessen, ausführbare `/^\d+$/`-Vorkommen in
den betroffenen Dateien:

| Ort | Begriff |
|---|---|
| `geraete-typen.js:233` | **einzelne URL-ID** (`istGueltigeId`) |
| `ausmusterung.js:77` | **einzelne URL-ID** (`istGueltigeId`) |
| `tablets.js:47` | **einzelne URL-ID** (`istGueltigeId`) |
| `geraete.js:699` | **einzelne URL-ID**, inline |
| `ausmusterung.js:92` | **ID-SAMMELFELD** (`parseIds`) — andere Funktion |
| `geraete.js:952` | **int4-Normalisierung** (`normalisiereGeraetId`) — andere Funktion |

Vier Orte tragen denselben Begriff, zwei einen anderen. **Und es ist ein Stern,
kein Ring:** `geraete-typen.js:227-231` trägt die eigene, gemessene Begründung
(„Befund 11, unabhängige Prüfung 28.08.2026, GEMESSEN"); `ausmusterung.js:73`
und `tablets.js:46` zeigen beide dorthin.

### 0.2 Die vorhandene ID-Regel ist die SCHWÄCHERE von zweien (S-2, blockierend)

`istGueltigeId` prüft nur die lexikalische FORM. `"99999999999"` besteht sie
und wirft danach an der ersten INTEGER-Abfrage 22003 „out of range" — die
Route antwortet mit ihrer 200-Fehlerseite und ruft `intern()`. **Genau der
Alarmkanal, mit dem dieses Papier seine Dringlichkeit begründet, bliebe
offen.**

`normalisiereGeraetId` (`geraete.js:949-955`) hat die richtige Regel bereits:
Ziffern UND `zahl > 0 && zahl <= 2147483647`, mit einer Begründung im
Kommentar (`:941-944`), die genau diesen Fall als gemessen behoben nennt.

**Kanonisiert wird die STÄRKERE Regel.**

### 0.3 Zwei Routen sind nicht nachgezogen

`geraete.js:337` (`POST /geraete/loeschen/:id`) und `:467`
(`POST /geraete/umbenennen/:id`) benutzen weiter `isNaN(id)` und `res.send()`
ohne Status. Gemessen: `isNaN` ist `false` für `"1e3"`, `"1.5"`, `"0x10"`;
`/^\d+$/` weist alle drei ab. Der Wert erreicht `t.one()`/`t.run()` für eine
INTEGER-Spalte, PostgreSQL wirft 22P02, der äussere `catch` antwortet mit
HTTP 200 und `intern()` alarmiert. Der Kommentar an `:688-696` beschreibt
genau das — als Nachbesserung vom 17.09.2026, die hier nicht nachgezogen wurde.

### 0.4 Die Textregel weist zwei von vier gefährlichen Typen NICHT ab (S-1, blockierend)

`pruefeTextfelder` (`geraete-typen.js:246`) prüft `typeof wert === 'object'`.
Gemessen:

    typeof 42 === 'object'  ->  false        typeof true === 'object'  ->  false
    (42).trim()   -> TypeError: 42.trim is not a function
    (true).trim() -> TypeError: true.trim is not a function
    String(42) = "42"        String(true) = "true"     (stille Koerzierung)

**Und JSON erreicht diese Routen:** `server.js:162` montiert `express.json()`
global; `core/csrf-schutz.js` prüft Origin/Referer, **keinen Content-Type**.
Ein Körper `{"name":42}` kommt also an.

**Die kanonische Regel lautet deshalb `typeof wert === 'string'` für
VORHANDENE Werte.** `null`/`undefined` bleiben erlaubt (Optionalfelder).

### 0.5 `String(...)` ist NICHT der Schutz (S-6, P-5)

Fassung 1 nannte `geraete-typen.js` „nicht verwundbar, weil String()".
Gemessen: `String({a:1})` ist `"[object Object]"`, `String(["a","b"])` ist
`"a,b"` — beides wirft nicht und überlebt jede Leer- und Längenprüfung.
`String()` verhindert den ABSTURZ, nicht das SCHREIBEN. Die Abweisung kommt
allein vom `pruefeTextfelder`-AUFRUF (`geraete-typen.js:390`, `:435`).

**Belegt an einer Stelle ohne diesen Aufruf:** `geraete.js:4353`
(`POST /geraetewartung/spuelplan/stelle/neu`) macht
`String(req.body.name || '').trim().slice(0,120)`, prüft nur
`name.length < 2` — und schreibt `"[object Object]"` (16 Zeichen) als Namen in
`spuel_stellen`. Kein 500, kein Alarm, eine korrupte Zeile.

Dieselbe Klasse ist im Repo als „Review-Fund U7" bekannt und für
`routes/admin/qr.js` bereits geschlossen (Kommentar in
`test/helfer/route-harness.js`).

### 0.6 Die verwundbaren Textfeld-Stellen — vollständige Liste (S-3)

Fassung 1 listete fünf. Mein Zählskript suchte `.trim()` **vor dem ersten
`try`** — das misst die Position der Fehlerbehandlung, nicht die
Verwundbarkeit. Vollständig, nach Wirkung getrennt:

**(a) Wirft VOR dem `try` → HTTP 500 + `errorTracker`-Alarm:**

| Ort | Route |
|---|---|
| `geraete.js:235` | `POST /geraete` |
| `geraete.js:469-470` | `POST /geraete/umbenennen/:id` |
| `geraete.js:4981-4982` | `POST /geraetewartung/kategorie/neu` |
| `geraete.js:5030-5031` | `POST /geraetewartung/kategorie/bearbeiten/:id` — **ganz ohne Guard**, wirft schon bei FEHLENDEM Feld |
| `geraete.js:5441-5445` | `POST /geraetewartung/geraet/neu` (Name, Inventarnummer, Notizen) |

**(b) Wirft INNERHALB des `try` → HTTP 200 „Datenbankfehler" + `intern()`:**

| Ort | Besonderheit |
|---|---|
| `geraete.js:5490-5492` | `(monteur_name\|\|'').trim()` und zwei Geschwister, in der INSERT-Argumentliste |
| `geraete.js:5496` | `aufgaben.trim()` — **NACH dem `INSERT … RETURNING id` in `:5485`**: das halb angelegte Gerät bleibt in der DB |
| `POST /geraetewartung/geraet/bearbeiten/:id` | weitere rohe Trims (vor dem Bau einzeln auszählen) |

**(c) Schreibt STILL einen koerzierten Wert, ohne Fehler:**

| Ort | Wirkung |
|---|---|
| `geraete.js:4353` | `"[object Object]"` landet als `spuel_stellen.name` |
| `geraete.js:708` | vorhandene `typeof`-Wache — die EINZIGE in dieser Datei, s. 1.4 |

**`geraete.js:5496` überschneidet sich mit B1-03 (SOL-3)**, dem
Transaktionsbefund im selben Handler. Beide Papiere fassen dieselbe Zeile an;
**wer zuerst baut, nennt es dem anderen.**

### 0.7 Zwei GEMESSENE Fundorte, die NICHT hier gebaut werden

**Die `parseInt`-Klasse.** Fünf Stellen (`mitarbeiter.js:670,703,736,835`,
`tablet-sperre.js:545`) machen `parseInt(x,10)` VOR der Prüfung. Gemessen:
`parseInt("2abc",10)=2`, `parseInt("007",10)=7`, `parseInt("1e3",10)=1`;
`"0x10"` und `"abc"` werden von `!id` gefangen. Sie erreichen SQL nie mit
einem schlechten Wert, handeln aber still am FALSCHEN Datensatz.

**Kein Rechtegewinn — und das ist jetzt gemessen, nicht behauptet** (S-8/P-8
haben zu Recht beanstandet, dass Fassung 1 es nur behauptete): `tablet-sperre.js:550`
→ `WHERE studio_id = $1 AND id=$2 AND aktiv=1`; `mitarbeiter-auth.js:173`
(Einladungsweg) → `WHERE studio_id = $1 AND id=$2 AND aktiv=1`; E-Mail-, PIN-
und Löschweg in `mitarbeiter.js` → je `AND studio_id`, im Löschweg auch alle
Folgeanweisungen. Wer `2abc` schicken kann, kann auch `2` schicken.

**Die Textfeldlücke in `mitarbeiter.js`.** `(req.body.x || '').trim()` an
`:346,347,671,737` und `!name || !name.trim()` an `:808` — dieselbe Klasse,
`:808` sogar vor dem `try`.

**Der Grund fürs Ausklammern ist NICHT „harte Löschungen"** (S-8 hat das
zu Recht zerlegt: gerade am Löschweg verhindert eine frühe Typabweisung, dass
ein falscher Datensatz erreicht wird). Der Grund ist: **Diffgrösse und
getrennte Prüfbarkeit.** Beide Dateien sind gross, `mitarbeiter.js` meldet über
Redirects statt Fehlerseiten, die Zusicherungen sehen also anders aus. Sie
bekommen einen eigenen Beitrag UNMITTELBAR nach diesem. Bis dahin stehen sie
als OFFEN in `plaene/durchgang-befunde.md`.

---

## 1. Was gebaut wird

### 1.1 EINE Quelle: `core/eingabe-pruefung.js` (neu)

    istGueltigeId(wert)      -> boolean   // Ziffern UND 1..2147483647
    istTextfeld(wert)        -> boolean   // typeof === 'string'
    pruefeTextfelder(paare)  -> string|null

`core/` importiert nach Repo-Regel nicht aus `routes/`; die kanonische Stelle
gehört deshalb nach `core/`, wie bei `core/html-escape.js`.

**Der Dateikopf nennt die abgelösten Orte NAMENTLICH und macht KEINE Aussage
über „jede andere Stelle" oder „die einzige ID-Quelle des Repos"** (S-8, P-6).
`parseIds()` und `normalisiereGeraetId()` bleiben eigene Begriffe und werden
im Kopf ausdrücklich als solche benannt, nicht als Kopien.

**Die Regel wird gegenüber dem Bestand VERSCHÄRFT**, an zwei genau benannten
Stellen — das ist Absicht, nicht ein Abschreiben:
* `istGueltigeId` bekommt die int4-Grenze aus `normalisiereGeraetId` (0.2).
* `pruefeTextfelder` prüft `typeof === 'string'` statt `!== 'object'` (0.4).

### 1.2 Die drei bestehenden Kopien werden GEBUNDEN

`geraete-typen.js:232`, `ausmusterung.js:73`, `tablets.js:46` und der Inline-
Ausdruck `geraete.js:699` rufen die Quelle; ebenso `geraete-typen.js:246`.
Lokale Namen dürfen bleiben, zweite Regelkörper nicht.
`ausmusterung.js:92` (`parseIds`) und `geraete.js:952`
(`normalisiereGeraetId`) bleiben **unangetastet** — andere Begriffe.

### 1.3 Die beiden nicht nachgezogenen ID-Wachen

`geraete.js:337` und `:467`:

    if (!id || isNaN(id)) return res.send(…)
    ->  if (!istGueltigeId(id)) return res.status(400).send(…)

**Beachte die Negation** (P-9): `isNaN` ist WAHR bei UNGÜLTIG,
`istGueltigeId` ist WAHR bei GÜLTIG. `!id` entfällt, weil `istGueltigeId`
leere und fehlende Werte selbst abweist — das ist im Helfer zuzusichern.

### 1.4 Die Textfeld-Vorprüfung

An JEDER Stelle aus 0.6 (a), (b) und (c) eine `pruefeTextfelder`-Vorprüfung am
HANDLER-EINTRITT, mit `res.status(400)` und der Meldung „… muss Text sein."

* Bei `:5030` zusätzlich den fehlenden Leer-Guard ergänzen.
* Bei `POST /geraetewartung/geraet/neu` gehören **alle** rohen Textfelder ins
  Prüfpaar: Name, Inventarnummer, Notizen, die drei Monteurfelder, Aufgaben.
* `geraete.js:708` wird auf `pruefeTextfelder([['Inbetriebnahme',
  req.body.inbetriebnahme_am]])` umgestellt (P-1) — damit ist die einzige
  `typeof`-Wache dieser Datei ebenfalls gebunden.

---

## 2. Was ausdrücklich NICHT gebaut wird

* **`mitarbeiter.js`, `tablet-sperre.js` und die `parseInt`-Klasse** (0.7) —
  eigener Beitrag unmittelbar danach, Grund dort benannt.
* **`parseIds()` und `normalisiereGeraetId()`** — andere Begriffe (0.1).
* **Keine Transaktion um `geraete.js:5485-5503`.** Sie gehört zu B1-03 und
  `plaene/auftrag-schreibreihenfolge.md`; hier wird nur der Eintritt bewacht.
  **Der Ausführende nennt im Bericht, ob der andere Beitrag schon gebaut ist.**

---

## 3. Zusicherungen — je mit der Gegenprobe, die sie rot macht

### Z1 — Die ID-Wache weist ab, mit 400, an JEDER Route mit `:id`

Nicht nur an den zwei geänderten (S-5, P-3): **jede** Route mit `:id` in
`geraete.js`, `geraete-typen.js`, `ausmusterung.js`, `tablets.js` bekommt je
einen HTTP-Fall. Je Route:

* `1e3`, `1.5`, `0x10` → **400**, Rumpf `Ungültige ID.`, NICHT `Datenbankfehler`.
* **`2147483648`** → **400** (0.2). **`2147483647`** und eine echte ID →
  der normale Erfolgsweg. **`0`** → 400.
* **Positivkontrolle in die Gegenrichtung:** echte numerische ID → 302 und die
  fachliche Wirkung ist in der DB nachweisbar.

**Gegenproben, je einzeln zu messen und wörtlich zu melden:**
1. `istGueltigeId` auf `(w) => !isNaN(w)` zurückdrehen → Z1 ROT.
2. Die int4-Grenze aus `istGueltigeId` entfernen → **nur der
   `2147483648`-Fall** ROT (sonst prüft er nichts Eigenes).
3. **An EINER Route `if (false && !istGueltigeId(id))`** (S-5) → genau deren
   Fälle ROT. Bleibt alles grün, misst Z1 die Verdrahtung nicht.

### Z2 — Objekt, Array, Zahl und Boolean werden zu 400, nicht zu 500 oder zu Text

Für JEDE Stelle aus 0.6 einzeln, **und je Feld einzeln** — ein Prüfpaar, aus
dem ein optionales Feld fehlt, fällt sonst nicht auf (S-3):

* `feld[a]=x` (urlencoded, Objekt) → 400, Rumpf `muss Text sein`.
* `feld=a&feld=b` (Array) → 400.
* **JSON-Körper `{"feld":42}` und `{"feld":true}`** → 400 (S-1). Ohne diese
  beiden Fälle ist Z2 blind für die halbe Klasse.
* **Danach die DB auf NULL Seiteneffekte prüfen** — bei `geraet/neu` und
  `spuelplan/stelle/neu` besonders, dort schreibt heute etwas.
* **Positivkontrolle:** normaler Wert → 302 und der Wert steht richtig in der DB.

**Gegenprobe:** die Vorprüfung an EINER Stelle entfernen → genau deren
Zusicherung ROT, mit FAIL-Zeile, nicht mit Absturz. Zusätzlich
`if (false && textfehler)` (S-5) → dasselbe.

### Z3 — Kein zweiter Regelkörper, an BENANNTEN Orten

**Der Text lautet: „in diesen vier Dateien steht kein eigener Körper der
URL-ID-Regel und kein eigener `typeof`-Textfilter mehr"** — nicht „es gibt
keine zweite Kopie mehr" (P-2, S-8). Ein Satz über das Repo wäre falsch,
solange 0.7 offen ist.

* Geprüft werden **benannte Funktionsdeklarationen und Aufrufstellen**, nicht
  eine Zeichenkette (S-4). `parseIds()` und `normalisiereGeraetId()` sind
  ausdrücklich AUSGENOMMEN und werden im Test literal aufgeführt.
* Das Muster kennt neben `/^\d+$/` auch `isNaN(` als ID-Wache (P-3).
* **Sollwert literal hingeschrieben**, nicht aus dem Scan abgeleitet. Er
  lautet: vier gebundene Orte, zwei ausgenommene.
* **Positivkontrolle für das Muster selbst:** an der HEUTIGEN Fassung gelernt,
  es muss dort alle sechs Vorkommen aus 0.1 finden und die zwei ausgenommenen
  korrekt aussortieren.

**Z3 ersetzt Z1 nicht.** Z3 misst die Schreibweise, Z1 die Wirkung. Beides.

### Z4 — Der Helfer, in der PRODUKTIONSFORM aufgerufen

Argumenttypen wie aus `req.params`/`req.body`. Mindestens: `"1e3"`, `"1.5"`,
`"0x10"`, `"0"`, `"007"`, `"2147483647"`, `"2147483648"`, `""`, `" "`, `"12"`,
`{}`, `[]`, `["a","b"]`, **`42`**, **`true`**, `null`, `undefined`.

### Z5 — Wo diese Zusicherungen NICHT hinreichen (S-7)

`test/helfer/route-harness.js:26-55` montiert `pfadKontext()`, beide Parser,
eine gefälschte Session und die Router — **aber weder CSRF noch
`studioContext`, `requireLogin`, `requireAdmin`, Wartungsmodus noch
Produktionslimit**; die Sitzung hat kein `totpOk`.

**Folge, und sie gehört in den Kopf der Testdatei:** Ein 400 gegen 302 in
diesem Harness belegt, dass der ROUTENHANDLER erreicht wurde und wie er
entscheidet. Es belegt **nichts** über CSRF, Auth oder Studio-Auflösung. Jede
Formulierung „über den echten HTTP-Weg mit gültiger Admin-Sitzung" ist zu
streichen.

---

## 4. Abnahme

1. **Volle Suite**, ohne Pipe, ohne äusseres `flock`:
   `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. EXIT 0.
2. **Dateizahl-Ritual**, `diff` EXIT 0. Zählmuster beidseitig:
   `grep -oE '── [A-Za-z0-9_/.-]+\.(js|sh) ──'` aus dem Log gegen
   `grep -oE '(test_[A-Za-z0-9_]+\.js|ops/boot-smoke\.js|test/[A-Za-z0-9_-]+\.sh)'`
   aus `test/run.sh`, beide `sed 's/^[[:space:]]*//' | sort -u`, `test/run.sh`
   selbst aus der zweiten Liste streichen.
3. **`npm run lint`** — Ergebnis **wörtlich melden, auch bei Grün**.
4. **Alle Gegenproben aus Abschnitt 3 wörtlich gemeldet**, beide Richtungen,
   `node --check` auf jede sabotierte Datei vor dem Lauf.
5. **Marker-Scan** mit Ausschluss auf dem PFAD → genau 6 Treffer, alle in
   `docs/offene-befunde-31-08-2026.md`.
6. **Commit und Push VOR dem Warten auf einen Hintergrundlauf.**

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* Eine weitere verwundbare Stelle, die in 0.6 fehlt — meine Liste war in
  Fassung 1 schon zweimal unvollständig.
* Eine bestehende Zusicherung, die durch die Umstellung ROT wird: **nicht
  streichen**, sondern melden; solche Wächter werden fachlich umgestellt.
* Eine Route, bei der `typeof === 'string'` einen LEGITIMEN heutigen Aufrufer
  bricht (etwa ein Feld, das absichtlich als Array kommt). Spur 1 hat danach
  gesucht und keinen gefunden — das ist eine Rechenschaft, keine Garantie.
* Jeder Widerspruch zu einer Messung in diesem Papier. Der Widerspruch ist das
  wertvollste Ergebnis.

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

---

# NACHTRAG — Planprüfung Runde 2 über FASSUNG 2, 19.09.2026

Gefahren, weil die Behebung VERHALTEN ändert (zwei verschärfte Regeln in einer
kanonischen Datei) — das ist der in CLAUDE.md benannte Fall für eine zweite
Runde. **Ergebnis: 17 weitere Befunde, drei plus zwei blockierend, EINE
Überschneidung zwischen den Spuren.**

| | Spur 1 (`sol`, mit Repo-Zugriff) | Spur 2 (`deepseek-flash`, statisch) |
|---|---|---|
| Befunde | 6 (3 blockierend) | 11 (2 blockierend) |
| Verbrauch | 3.562.404 rein / 31.864 raus, 24 Runden, 76 Suchen, 48 Lesungen | 19.161 rein / 36.308 raus |
| Kosten | **18,77 $** | **~0,04 $** |

## Die fünf blockierenden

**R2-1 (beide Spuren, gemessen) — meine Begründung für das Ausklammern der
`parseInt`-Klasse ist FALSCH.** Fassung 2 schreibt: „Sie erreichen SQL nie mit
einem schlechten Wert." Gemessen:

    parseInt("2147483648",10) = 2147483648   Guard (!id||isNaN) weist ab: false
    parseInt("99999999999",10) = 99999999999 Guard (!id||isNaN) weist ab: false

`parseInt` fängt den Teilstring-Fall, **nicht den int4-Überlauf.** Der Wert
erreicht SQL für eine INTEGER-Spalte → 22003 → dieselbe Alarmklasse, die 0.2
für die anderen Routen schliesst. **Folge: die fünf Stellen gehören IN den
Auftrag, nicht daneben.** Das ist der einzige Befund, den beide Spuren hatten.

**R2-2 (sol, gemessen) — Z1 quantifiziert über 26 Routen, gebaut werden 10.**
Gemessen mit einem an bekannten Fundstellen gelernten Muster: `geraete.js` 19,
`geraete-typen.js` 4, `ausmusterung.js` 2, `tablets.js` 1 = **26 Routen mit
`:id`**. Abschnitt 1 bindet zehn. Ein nach Z1 korrekt gebauter Test schlägt
also sofort fehl — oder wird stillschweigend verkürzt. Dazu: „echte ID → 302"
gilt nicht für GET-Routen, die 200 liefern.

**R2-3 (sol, gemessen) — meine Stellenliste ist zum DRITTEN Mal
unvollständig.** `grep -nE "String\(req\.body" routes/admin/geraete.js` →
**10 Treffer**; Fassung 2 nennt einen davon (`:4353`). `hinweis` steht in
`:4355`, direkt daneben, und schreibt `[object Object]` nach
`spuel_stellen.hinweis`. Dazu je ein koerziertes Detailfeld in Brandschutz
(`:2435`), Legionellen (`:3102`, `:3137`), DGUV (`:3525`, `:3555`) und
Gefährdungsbeurteilung (`:3852`).

**R2-4 (deepseek, gemessen) — `typeof === 'string'` bricht einen LEGITIMEN
heutigen Aufrufer.** `geraete-typen.js:431-434` gibt drei OPTIONALE Felder an
`pruefeTextfelder`, und der Kommentar `:456-458` nennt `inbetriebnahme_am`
ausdrücklich FREIWILLIG; `standort` darf leer sein, `seriennummer` NULL.
Fassung 2 verspricht die Ausnahme für `null`/`undefined` in 0.4, schreibt sie
aber in 1.1 nirgends in den Vertrag, und Z4 listet beide Werte OHNE Sollwert.
**Ein Formular ohne `inbetriebnahme_am` bekäme künftig 400.** Genau der
„legitime Aufrufer", den Abschnitt 5 als nicht vorhanden meldete.

**R2-5 (sol, gemessen) — Z3 wäre gegen KORREKTEN Bestand rot.** `tablets.js:56`
hat `typeof t === 'string' && /^[0-9a-f]{64}$/.test(t)` — ein Token-Filter, der
bleiben muss; `geraete.js:1928` und `:2008` sind weitere, unabhängige
`typeof`-Prüfungen. Mein Z3-Wortlaut „kein eigener `typeof`-Textfilter mehr"
trifft sie mit.

## Die weiteren zwölf, gemessen und getragen

* **Z4 ist keine Zusicherung** (deepseek): eine Liste von Eingaben ohne
  Sollwert misst nichts, und „der Helfer" ist Singular für drei Funktionen.
* **`/^\d+$/` → `/^\s*\d+\s*$/` überlebt Z1–Z5** (sol): `" 12"` und `"12 "`
  würden neu akzeptiert; keiner der vorgesehenen Werte fällt.
* **Z5 ist ein Kommentar, keine fallfähige Zusicherung** (sol).
* **Z3s Sollwert nennt die beiden neu gebundenen Stellen nicht** (deepseek):
  ein Test, der bei vier stehenbleibt, bliebe grün, während `:337` wieder eine
  eigene `isNaN`-Wache bekommt. Und ein Muster, das `isNaN(` kennt, findet in
  `geraete.js` mehr als die ID-Wachen (`:5455`, `:5461` sind Intervallprüfungen).
* **Die int4-Konstante stünde an zwei Orten** (deepseek): `core/` darf nicht
  aus `routes/` importieren, also wäre `2147483647` dupliziert, ohne dass eine
  Zusicherung die beiden vergleicht.
* **`"[object Object]"` hat 15 Zeichen, nicht 16** (deepseek, gemessen). Die
  Sache bleibt richtig, die Zahl war falsch.
* **„vier davon blockierend" löst das Papier nicht ein** (deepseek): nur zwei
  Stellen tragen die Markierung.
* Dazu Befunde zu Abnahme-Schritten, zum Dateizahl-Ritual und zur
  Selbstwidersprüchlichkeit von 0.6 („vollständige Liste" gegen „vor dem Bau
  einzeln auszählen" im selben Abschnitt).

---

# WAS DARAUS FOLGT — die Methode war falsch, nicht nur die Fassung

**Dreimal hintereinander war meine von Hand erstellte Stellenliste
unvollständig** (Fassung 1: fünf statt acht; Fassung 2: einer von zehn
`String(req.body…)`-Senken; dazu 26 `:id`-Routen gegen zehn gebundene). **Und
viermal an einem Tag war ein Suchmuster von mir falsch** — beim `|| ''`-Idiom
(Leerraum), beim `:id`-Routen-Zählen (`[^\n]*` in `grep`), beim
Marker-Ausschluss und beim Dateizahl-Ritual.

Eine vierte Fassung mit einer vierten handgemachten Liste wäre derselbe Fehler
zum vierten Mal. Die Hausregel sagt, wohin: **ein Selbstnachweis aus dem
eigenen Datenfluss lässt sich beliebig verfeinern, ohne je zu schliessen — der
Regress endet erst an einer Referenz von AUSSEN.** Eine Liste, die ich
schreibe, ist ein Selbstnachweis.

**Die zwei neuen Papiere machen die Liste deshalb MECHANISCH:** ein Wächter
zählt die Eintrittspunkte selbst auf (alle `:id`-Routen; alle `req.body`-Senken)
und verlangt für JEDEN entweder eine Wache oder einen literal
hingeschriebenen, begründeten Ausnahmeeintrag. Wächst die Datei um eine Route,
wird der Wächter rot — nicht meine Liste still unvollständig.

Und der Auftrag wird GETEILT: die ID-Regel und die Textfeldregel haben
verschiedene Eintrittspunktmengen, verschiedene Ausnahmen und verschiedene
Gegenproben. Sie in einem Beitrag zu führen war der Grund, warum 0.6, 1.2, 1.4
und Z2 in Fassung 2 nachweislich nicht dieselbe Menge meinten.
