# Auftragspapier — Textfeld-Wache: eine Regel, die auch Zahlen fängt, und ein Wächter, der die Senken SELBST zählt

**Repo:** GymDocu (`/home/user/gymdocu`, Stand `4c4b729`).
**Vorgeschichte:** ersetzt die Textfeld-Hälfte von
`plaene/auftrag-eingabewache-geraete.md` (Fassungen 1 und 2, beide überholt,
34 nachgemessene Planprüfungsbefunde).
**Reihenfolge:** NACH `plaene/auftrag-id-wache.md` — beide legen etwas in
`core/eingabe-pruefung.js` ab, und zwei gleichzeitige Beiträge an derselben
neuen Datei sind ein vermeidbarer Konflikt.
**Warum es vorgeht** (STAND.md, Regel 5): Punkt 3 des Pentest-Programms — ein
Objekt oder eine Zahl im Formularkörper erzeugt heute HTTP 500 samt
`errorTracker`-Alarm oder schreibt still einen koerzierten Wert.

---

## 0. Was GEMESSEN ist

### 0.1 Die Regel im Bestand fängt zwei von vier gefährlichen Typen nicht

`pruefeTextfelder` (`geraete-typen.js:246`) prüft `typeof wert === 'object'`.

    typeof 42 === 'object'  ->  false        typeof true === 'object'  ->  false
    (42).trim()   -> TypeError: 42.trim is not a function
    (true).trim() -> TypeError: true.trim is not a function
    String(42) = "42"       String(true) = "true"       (stille Koerzierung)

**Und JSON erreicht diese Routen:** `server.js:162` montiert `express.json()`
global; `core/csrf-schutz.js` prüft Origin/Referer, **keinen Content-Type**.
Express ist **5.2.1**, reicht die abgelehnte Promise eines `async`-Handlers
also an `server.js:1467` durch → `errorTracker.melde()` + HTTP 500.

### 0.2 `String(...)` ist NICHT der Schutz

    String({a:1})     = "[object Object]"   (15 Zeichen)
    String(["a","b"]) = "a,b"
    String(null) = "null"    String(undefined) = "undefined"

Beides wirft nicht und überlebt jede Leer- und Längenprüfung. `String()`
verhindert den ABSTURZ, nicht das SCHREIBEN. Die Abweisung kommt allein vom
`pruefeTextfelder`-AUFRUF.

**Belegt an einer Stelle ohne diesen Aufruf:** `geraete.js:4353`
(`POST /geraetewartung/spuelplan/stelle/neu`) prüft nur `name.length < 2` und
schreibt `"[object Object]"` in `spuel_stellen.name`. Kein 500, kein Alarm,
eine korrupte Zeile. Dieselbe Klasse ist im Repo als „Review-Fund U7" bekannt
und für `routes/admin/qr.js` bereits geschlossen.

### 0.3 Die Senken, gemessen statt von Hand gelistet

`grep -nE "String\(req\.body" routes/admin/geraete.js` → **10 Treffer**:
`:1583` (bemerkung), `:2379` (begehung_start), `:2435`, `:3102`, `:3137`,
`:3525`, `:3555`, `:3852` (Assistenten-Detailfelder und Fachfirma), `:4353`
(name), `:4355` (hinweis). Dazu die rohen `.trim()`-Stellen:

* **vor dem `try` → HTTP 500 + Alarm:** `:235`, `:469-470`, `:4981-4982`,
  `:5030-5031` (dort **ganz ohne Guard**, wirft schon bei FEHLENDEM Feld),
  `:5441-5445`.
* **innerhalb des `try` → HTTP 200 „Datenbankfehler" + `intern()`:**
  `:5490-5492` (drei Monteurfelder), **`:5496`** (`aufgaben.trim()` steht NACH
  dem `INSERT … RETURNING id` in `:5485` — das halb angelegte Gerät bleibt in
  der DB), dazu weitere im Bearbeiten-Handler.
* `routes/admin/mitarbeiter.js:346,347,671,737` (`(req.body.x || '').trim()`
  — ein Objekt ist truthy und überlebt das `|| ''`) und `:808`.

**Diese Aufzählung ist eine FUNDORTLISTE, kein Sollwert.** Sie war dreimal
unvollständig. Der Sollwert entsteht in 1.3 mechanisch.

### 0.4 Optionale Felder MÜSSEN erlaubt bleiben

`geraete-typen.js:431-434` gibt drei OPTIONALE Felder an `pruefeTextfelder`;
der Kommentar `:456-458` nennt `inbetriebnahme_am` ausdrücklich FREIWILLIG,
`standort` darf leer sein, `seriennummer` NULL. **Eine Regel
`typeof === 'string'` ohne ausdrückliche Ausnahme für `null`/`undefined`
bricht diesen legitimen Aufrufer** — ein Formular ohne `inbetriebnahme_am`
bekäme 400.

### 0.5 Ein `typeof`-Filter, der NICHT angefasst wird

`tablets.js:56`: `typeof t === 'string' && /^[0-9a-f]{64}$/.test(t)` — ein
Token-Filter, der bleibt. Ebenso `geraete.js:1928` und `:2008`. Jede
Zusicherung der Form „kein `typeof` mehr in dieser Datei" wäre gegen
korrekten Bestand rot.

---

## 1. Was gebaut wird

### 1.1 Die Regel in `core/eingabe-pruefung.js` (aus dem ID-Beitrag vorhanden)

    // FEHLEND ist erlaubt, VORHANDEN muss Text sein.
    function istTextfeld(wert) {
        return wert === undefined || wert === null || typeof wert === 'string';
    }
    function pruefeTextfelder(paare) { … }   // -> "<Feld> muss Text sein." | null

**Die Ausnahme für `null`/`undefined` steht IM VERTRAG, nicht in der Prosa**
(0.4). Wer sie später enger will, ändert sie hier und sieht sofort, welche
Aufrufer fallen.

### 1.2 Bindung und Nachzug

* `geraete-typen.js:246` wird an die Quelle gebunden (Regelkörper weg).
* `geraete.js:708` (die einzige `typeof`-Wache dieser Datei, in der
  `inbetriebnahme`-Route) wird auf `pruefeTextfelder` umgestellt.
* An JEDER Senke aus dem Inventar (1.3), die keine Ausnahme ist, steht am
  **Handler-Eintritt** ein `pruefeTextfelder`-Aufruf, der das Feld **namentlich
  nennt**, mit `res.status(400)` bzw. der an dieser Route üblichen Abweisung.
* Bei `:5030` zusätzlich den fehlenden Leer-Guard ergänzen.
* Bei `POST /geraetewartung/geraet/neu` gehören **alle** Felder ins Prüfpaar:
  Name, Inventarnummer, Notizen, die drei Monteurfelder, Aufgaben,
  Intervallquelle.
* **Unangetastet:** `tablets.js:56`, `geraete.js:1928`, `:2008` (0.5).

**Die Feldnamen im Aufruf sind kein Schmuck, sie sind der Prüfanker** (1.3).

### 1.3 Der Wächter zählt die SENKEN selbst

`test_feature_textfeld_wache_inventar.js` (neu). Dateiliste aus
`git ls-files`, nicht hingeschrieben.

1. Findet jede Stelle, an der ein `req.body`-Wert roh in eine Methode geht
   (`.trim(`, `.split(`, `.slice(`, `.toLowerCase(`, `.replace(`) oder in
   `String(...)` gewickelt wird.
2. Ermittelt den umgebenden Handler und das FELD.
3. Verlangt: im selben Handler, VOR der Senke, ein `pruefeTextfelder`-Aufruf,
   der **genau dieses Feld** nennt — ODER ein Eintrag in einer literal
   hingeschriebenen `AUSNAHMEN`-Tabelle **mit Grund**.
4. **Kommentare werden vorher abgezogen**, und danach wird zugesichert, dass
   überhaupt noch etwas übrig ist.

**Der Feldname ist der Grund, warum das die VERDRAHTUNG misst und nicht die
Schreibweise:** ein Aufruf, der `['Name', req.body.neuerName]` nennt, deckt
`neuerName` und sonst nichts. Wer ein Feld aus dem Prüfpaar streicht, wird
rot — genau der Fehler, den Fassung 2 nicht erkannt hätte.

**Der Sollwert kommt von AUSSEN:** Dateien aus `git ls-files`, Senken aus dem
Quelltext, Ausnahmen literal. Keine der drei Zahlen stammt aus dem Lauf.

---

## 2. Was NICHT gebaut wird

* **Die ID-Regel** — `plaene/auftrag-id-wache.md`.
* **Die Transaktion um `geraete.js:5485-5503`** — gehört zu B1-03 und
  `plaene/auftrag-schreibreihenfolge.md`. **Beide Beiträge fassen `:5496` an;
  wer zuerst baut, nennt es dem anderen.**
* **Eine Vereinheitlichung der Abweisungsform** (400-Seite gegen Redirect).
* Die legitimen `typeof`-Filter aus 0.5.

---

## 3. Zusicherungen — je mit der Gegenprobe

### Z1 — Objekt, Array, Zahl und Boolean werden abgewiesen, nicht geschrieben

Je Senke aus dem Inventar und **je Feld einzeln** (ein Prüfpaar, aus dem ein
Feld fehlt, fällt sonst nicht auf):

* `feld[a]=x` (urlencoded → Objekt) → Abweisung mit `muss Text sein`.
* `feld=a&feld=b` (Array) → Abweisung.
* **JSON-Körper `{"feld":42}` und `{"feld":true}`** → Abweisung. **Ohne diese
  beiden ist Z1 blind für die halbe Klasse.**
* **Danach die DB auf NULL Seiteneffekte prüfen** — bei `geraet/neu` und
  `spuelplan/stelle/neu` besonders, dort schreibt heute etwas.
* **Positivkontrolle:** normaler Wert → Erfolgsweg, und der Wert steht richtig
  in der DB.

**Gegenproben:** (1) die Vorprüfung an EINER Stelle entfernen → genau deren
Fälle ROT, mit FAIL-Zeile, nicht mit Absturz. (2) `if (false && textfehler)` →
dasselbe. (3) EIN Feld aus einem Prüfpaar streichen → genau dessen Fälle ROT.

### Z2 — Das optionale Feld bleibt optional

`POST /admin/geraete/cardio/details/<id>` **ohne** `inbetriebnahme_am`,
**ohne** `seriennummer`, mit leerem `standort` → **Erfolgsweg wie heute**,
kein 400. Dasselbe für jede andere Route mit optionalen Textfeldern.

**Gegenprobe:** `istTextfeld` auf `typeof wert === 'string'` ohne die
`null`/`undefined`-Ausnahme verengen → Z2 muss ROT werden. Wird sie es nicht,
prüft Z2 den Fall nicht, den 0.4 gemessen hat.

### Z3 — Der Wächter aus 1.3 findet eine neue ungeschützte Senke

* **Positivkontrolle zuerst:** am HEUTIGEN Stand muss der Zähler mindestens
  die zehn `String(req.body…)`-Senken aus 0.3 finden und die bewachten Felder
  in `geraete-typen.js` korrekt als bewacht erkennen. Findet er weniger, ist
  das Muster falsch, nicht der Code.
* **Gegenprobe:** eine Wegwerf-Senke ohne Wache einfügen → ROT, Meldung nennt
  sie. Entfernen → GRÜN.
* **Zweite Gegenprobe:** einen `AUSNAHMEN`-Eintrag löschen, dessen Senke
  ungeschützt ist → ROT. Einen hinzufügen, dessen Senke gar nicht existiert →
  ebenfalls ROT (sonst verrottet die Liste still).

### Z4 — `istTextfeld` und `pruefeTextfelder` mit SOLLWERT je Eingabe

Tabelle Eingabe → erwartetes Ergebnis, nicht eine Liste von Eingaben:

    "abc"  ""  " "        -> gültig (Text; Leere prüft die Route, nicht der Typ)
    null  undefined       -> gültig (FEHLEND ist erlaubt, s. 0.4)
    {}  {a:1}  []  ["a"]  -> ungültig
    42  0  true  false    -> ungültig
    new Date()            -> ungültig

`0` und `false` stehen bewusst dabei: sie sind falsy, und eine Regel, die
Falsy-Werte durchwinkt, hat genau die Lücke, an der `!wert` heute scheitert.

### Z5 — Wo diese Zusicherungen NICHT hinreichen

Wie im ID-Beitrag, Z5: `test/helfer/route-harness.js` montiert weder CSRF noch
Auth noch `studioContext`. **Der Kommentar dazu ist selbst eine Zusicherung
und bekommt einen ausführbaren Strukturtest** — sonst veraltet er grün.

---

## 4. Abnahme

Wie `plaene/auftrag-id-wache.md`, Abschnitt 4 — volle Suite ohne Pipe und ohne
äusseres `flock`, Dateizahl-Ritual mit der neuen Datei, `npm run lint`
**wörtlich gemeldet auch bei Grün**, alle Gegenproben beidseitig mit
`node --check` vorab, Mutationsskripte mit Zielpfad als ARGUMENT und Abbruch
bei ≠ 1 Treffer, Marker-Scan mit Pfad-Ausschluss, Commit und Push VOR dem
Warten.

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* **Eine Senke, die der Zähler aus 1.3 NICHT findet.** Meine Liste war dreimal
  unvollständig und mein Muster heute viermal falsch — das ist der
  wahrscheinlichste Fehler in diesem Papier.
* **Ein Feld, das heute LEGITIM als Zahl, Boolean oder Array ankommt** (ein
  `<input type=number>` über JSON, ein Mehrfachfeld). Dann ist nicht die
  Route falsch, sondern meine Regel zu streng.
* **Eine bestehende Zusicherung, die ROT wird**: nicht streichen, melden.
* **Jeden Widerspruch zu einer Messung in diesem Papier.**
