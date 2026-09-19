# Auftragspapier — ID-Wache (FASSUNG 2: klein, gemessen, baureif)

**Repo:** GymDocu (`/home/user/gymdocu`, Stand `4c4b729`).

**Vorgeschichte, und sie ist der Grund für die Grösse dieses Papiers:** Drei
Planprüfungsrunden, **63 selbst nachgemessene Befunde, alle getragen**
(`plaene/auftrag-eingabewache-geraete.md` und
`plaene/planpruefung-wachen-runde3.md`). Fast alle hingen am AUSBAU — kanonische
Quelle, Inventar-Wächter, Ausnahmeliste, ID_MAX-Zentralisierung —, nicht an den
Defekten. **Die gemessenen Defekte sind klein und lokal. Dieses Papier baut nur
sie.**

**Warum es vorgeht** (STAND.md, Regel 5): Punkt 3 des Pentest-Programms, mit
einer BERICHTIGTEN Begründung (s. 0.5).

---

## 0. Was GEMESSEN ist

Zeilennummern am Stand `4c4b729`. **Vor dem Bau neu messen** — meine
Zeilennummern waren heute mehrfach falsch.

### 0.1 Zwei Routen benutzen `isNaN`, die dritte nicht mehr

`geraete.js:337` (`POST /geraete/loeschen/:id`) und `:467`
(`POST /geraete/umbenennen/:id`). Gemessen:

    isNaN("1e3") = false    isNaN("1.5") = false    isNaN("0x10") = false
    /^\d+$/ weist alle drei ab

Der Wert erreicht `t.one()`/`t.run()` für eine INTEGER-Spalte → PostgreSQL
22P02 → äusserer `catch` → HTTP **200** mit „Datenbankfehler" und
`intern()`-Alarm. Der Kommentar an `:688-696` beschreibt genau das, als
Nachbesserung vom 17.09.2026 an der Geschwisterroute `:699` — hier nicht
nachgezogen.

### 0.2 Die verbreitete Regel lässt den int4-Überlauf durch

`istGueltigeId` (vier gleichlautende Kopien, s. 0.3) prüft nur die
lexikalische Form. `"99999999999"` besteht sie und wirft an der ersten
INTEGER-Abfrage **22003 „out of range"**. `normalisiereGeraetId`
(`geraete.js:949-955`) hat die richtige Regel längst: Ziffern UND
`> 0 && <= 2147483647`, mit einer Begründung im Kommentar (`:941-944`), die
genau diesen Fall als gemessen behoben nennt.

### 0.3 Vier gleichlautende Kopien, ein Stern mit Quelle

`geraete-typen.js:232`, `ausmusterung.js:73`, `tablets.js:46` und der
Inline-Ausdruck `geraete.js:699` — alle vier heute wörtlich
`/^\d+$/.test(String(id || ''))`. `geraete-typen.js:227-231` trägt die eigene,
gemessene Begründung; die beiden anderen zeigen dorthin. **Kein Zitierring.**

`ausmusterung.js:92` (`parseIds`, ein ID-SAMMELFELD) und `geraete.js:952`
(`normalisiereGeraetId`, int4-Normalisierung) sind ANDERE Begriffe und werden
nicht angefasst.

### 0.4 `parseInt` vor der Prüfung fängt den int4-Überlauf NICHT

    parseInt("2abc",10)        = 2             Guard (!id||isNaN) weist ab: false
    parseInt("2147483648",10)  = 2147483648    Guard weist ab: false
    parseInt("99999999999",10) = 99999999999   Guard weist ab: false
    parseInt("0x10",10)        = 0             Guard weist ab: true
    parseInt("abc",10)         = NaN           Guard weist ab: true

Betroffen: `mitarbeiter.js:670,703,736,835` und **`tablet-sperre.js:546`**
(dort keine `:id`-Route, sondern `req.body.mitarbeiter_id` — der Unterschied
ist gemessen und war der Grund, warum ein Routen-Inventar diese Stelle nie
gefunden hätte).

Zwei Wirkungen: der int4-Überlauf erreicht SQL (22003, derselbe Alarmweg wie
0.2), und `2abc` handelt still am Datensatz 2. **Kein Rechtegewinn** — gemessen
tragen alle betroffenen Abfragen `studio_id` (`tablet-sperre.js:550`,
`mitarbeiter-auth.js:173`, im Mitarbeiter-Löschweg auch alle
Folgeanweisungen).

### 0.5 BERICHTIGT: der Alarmkanal ist NICHT von aussen taktbar

Frühere Fassungen begründeten die Dringlichkeit mit „von aussen taktbar".
**Gemessen an `core/csrf-schutz.js`:** jeder Nicht-GET, dessen
`Origin`/`Referer`-Host nicht `req.headers.host` entspricht, wird mit **403**
abgewiesen; `/admin/…` steht nicht in `AUSNAHME_PREFIX` (`/api`, `/intern`,
`/d/`, `/v/`). Ein fremder Dritter erreicht diese Routen nicht.

**Was bleibt, und es reicht:** jeder angemeldete Admin löst es aus — auch
versehentlich über eine vertippte URL —, jeder, der bereits eine Sitzung hat,
kann es gezielt takten, und `2abc` handelt still am falschen Datensatz. Der
Defekt ist eine Robustheits- und Datenintegritätsfrage, keine anonyme DoS.

### 0.6 Was sich durch die neue Regel WIRKLICH ändert — drei Fälle, gemessen

Alte Regel `(id) => /^\d+$/.test(String(id || ''))` gegen neue Regel, 22 Fälle
gemessen, **genau drei Unterschiede**, alle drei von „angenommen" nach
„abgewiesen":

    "0"             alt true  -> neu false     (es gibt keine id 0; IDENTITY beginnt bei 1)
    "2147483648"    alt true  -> neu false     (int4-Grenze)
    "99999999999"   alt true  -> neu false     (int4-Grenze)

Identisch bleiben unter anderem `"1"`, `"12"`, `"007"`, `"2147483647"`,
`"1e3"`, `"1.5"`, `"0x10"`, `"-1"`, `""`, `" "`, `" 12"`, `"12 "`, `null`,
`undefined`, `42`, `{}`, `[]`, `["1","2"]`, `true`.

**`42` bleibt bewusst gültig:** die Coercion `String(wert)` wird aus dem
Bestand ÜBERNOMMEN, nicht verschärft. Wer den Typ zusätzlich einengen will,
macht daraus einen eigenen Beitrag mit eigener Messung, welche Aufrufer das
bricht.

---

## 1. Was gebaut wird — elf Eintrittspunkte, sonst nichts

### 1.1 `core/eingabe-pruefung.js` (neu)

    const ID_MAX = 2147483647;                 // int4-Obergrenze (PostgreSQL)
    function istGueltigeId(wert) {             // Coercion wie im Bestand
        const t = String(wert == null ? '' : wert);
        return /^\d+$/.test(t) && Number(t) >= 1 && Number(t) <= ID_MAX;
    }
    module.exports = { istGueltigeId, ID_MAX };

Der Dateikopf nennt die vier abgelösten Orte NAMENTLICH, nennt `parseIds` und
`normalisiereGeraetId` ausdrücklich als ANDERE Begriffe, und **behauptet
NICHT**, die einzige ID-Quelle des Repos zu sein (s. 2).

### 1.2 Vier Bindungen

`geraete-typen.js:232`, `ausmusterung.js:73`, `tablets.js:46` und der
Inline-Ausdruck `geraete.js:699` rufen die Quelle. Lokale Namen dürfen bleiben.
`normalisiereGeraetId` (`geraete.js:948`) liest `ID_MAX` aus der Quelle statt
sein eigenes `GERAET_ID_MAX` (`routes/` → `core/` ist erlaubt).

### 1.3 Zwei Nachzüge in `geraete.js`

    if (!id || isNaN(id)) return res.send(…)
    ->  if (!istGueltigeId(id)) return res.status(400).send(…)

**Beachte die Negation:** `isNaN` ist WAHR bei UNGÜLTIG, `istGueltigeId` WAHR
bei GÜLTIG. `!id` entfällt, der Helfer weist Leeres selbst ab.

### 1.4 Fünf Nachzüge bei `parseInt`

Die Prüfung wird **VOR** das `parseInt` gezogen; danach ist `parseInt` nur noch
eine Umwandlung. **Die Rückmeldung bleibt, wie sie dort ist** (Redirect statt
Fehlerseite) — eine Vereinheitlichung wäre ein anderer Auftrag.

`tablet-sperre.js:546` prüft `req.body.mitarbeiter_id`, nicht `req.params.id`;
die dortige zusammengesetzte Bedingung (`|| !/^\d{6}$/.test(pin)`) bleibt
unverändert, nur der ID-Teil wird ersetzt.

---

## 2. Was ausdrücklich NICHT gebaut wird — und wo es aufgeschrieben steht

Jeder Punkt hier ist ein GEMESSENER Fundort. Sie werden nicht versteckt,
sondern als offene Punkte in `plaene/durchgang-befunde.md` geführt.

* **Der Inventar-Wächter.** Gemessen gescheitert: `aufgaben` ist an
  `geraete.js:5418` destrukturiert, die Zeile `aufgaben.trim()` enthält kein
  `req.body`; `tablet-sperre.js:546` ist eine Body-ID, keine `:id`-Route. Ein
  Muster an der SENKE beantwortet eine Frage nach dem DATENFLUSS nicht. Das
  braucht Bindungsverfolgung und ist ein eigener Beitrag.
* **Die 16 ungemessenen `:id`-Routen** in den vier Dateien und die acht
  weiteren in `mitarbeiter.js`. Ob ihre `:id` roh an SQL geht, ist NICHT
  gemessen.
* **Die ID_MAX-Zentralisierung über `geraete.js` hinaus.** Gemessen:
  `grep -rn "2147483647" routes/` → **11 Treffer in sieben Dateien**
  (`qr-bestellung.js`, `qr-druckdaten.js`, `qr.js`,
  `geraete-hinweisfenster.js`, `module.js`, `sichtpruefung.js` behalten ihr
  `PG_INTEGER_MAX`). **Jede Zusicherung „der Literalwert steht nicht mehr in
  `routes/`" wäre unabhängig vom Bau rot.**
* **Die Textfeldregel** — eigener Beitrag, und ihr Scanner hat dasselbe
  Datenflussproblem.
* **Eine Verschärfung der Coercion** (`42` ablehnen) — s. 0.6.

---

## 3. Zusicherungen — je mit der Gegenprobe, die sie rot macht

### Z1 — Die elf Eintrittspunkte weisen ab, über HTTP, einzeln

Je Eintrittspunkt, mit dem für DIESE Route richtigen Erfolgsstatus (302 bei
Redirect-Routen, 200 bei GET-Seiten — „echte ID → 302" gilt gemessen nicht
überall):

* `1e3`, `1.5`, `0x10` → Abweisung, NICHT `Datenbankfehler`.
* **`2147483648`** → Abweisung. **`0`** → Abweisung. **`2147483647`** und eine
  echte ID → Erfolgsweg.
* **Positivkontrolle:** echte ID → Erfolgsweg UND die fachliche Wirkung ist in
  der DB nachweisbar, nicht nur der Statuscode.
* **Für den Einladungsweg** (`mitarbeiter.js:703`) wird der Mailer GESTUBBT.
  Ohne Stub wäre der Erfolgsfall ein echter SMTP-Zugriff — dieselbe Suite ist
  auf dem Live-Server Deploy-Gate. Der Stub ist zugleich der Beweis, dass das
  Richtige gerufen wurde.

**Gegenproben, je einzeln, wörtlich zu melden:**
1. `istGueltigeId` auf `(w) => /^\d+$/.test(String(w || ''))` zurückdrehen →
   **genau** die Fälle `0`, `2147483648`, `99999999999` ROT, sonst nichts.
   Wird mehr rot, misst dieser Fall nicht die int4-Grenze.
2. `istGueltigeId` auf `(w) => !isNaN(w)` → die `1e3`/`1.5`/`0x10`-Fälle ROT.
3. **An JEDEM der elf Punkte einzeln `if (false && !istGueltigeId(…))`** →
   genau dessen Fälle ROT. Bleibt einer grün, ist er nicht verdrahtet.
   **Elf Mutationen, elf Messungen** — nicht eine stellvertretend für alle.

### Z2 — Die drei Verhaltensänderungen, und nur sie

Zusicherung über die 22 Fälle aus 0.6: der neue Helfer liefert für jeden
Eingabewert genau das dort gemessene Ergebnis. **Der Sollwert steht literal im
Test**, nicht aus dem Helfer abgeleitet.

**Gegenprobe:** eine Zeile im Helfer ändern (z. B. `>= 1` auf `>= 0`) → genau
der `"0"`-Fall ROT.

### Z3 — `ID_MAX` hängt in `geraete.js` wirklich an der Quelle

Nicht „der Literalwert steht nicht mehr in `routes/`" (gemessen unmöglich,
s. 2), sondern: **`ID_MAX` im Helfer auf `10` setzen → sowohl ein
`istGueltigeId`-Fall als auch ein `normalisiereGeraetId`-Fall muss fallen.**
Fällt nur einer, hängt der andere nicht an der Quelle.

### Z4 — Wo diese Zusicherungen NICHT hinreichen

`test/helfer/route-harness.js:26-55` montiert `pfadKontext()`, beide Parser,
eine gefälschte Session und die Router — **aber weder CSRF noch
`studioContext`, `requireLogin`, `requireAdmin`, Wartungsmodus noch
Produktionslimit**; die Sitzung hat kein `totpOk`.

**Belegt ist:** der Routenhandler wurde erreicht und wie er entscheidet.
**Nicht belegt:** CSRF, Auth, Studio-Auflösung. Die Formulierung „über den
echten HTTP-Weg mit gültiger Admin-Sitzung" ist zu vermeiden.

Dieser Satz ist ein KOMMENTAR und damit selbst eine Zusicherung — er bekommt
einen ausführbaren Strukturtest, der rot wird, wenn jemand die Harness ändert
(z. B. `totpOk` setzt). Ohne ihn veraltet er grün.

---

## 4. Abnahme

1. **Volle Suite**, ohne Pipe, ohne äusseres `flock`:
   `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. EXIT 0.
2. **Dateizahl-Ritual**, `diff` EXIT 0 — neue Testdateien in `test/run.sh`
   registriert und im Log sichtbar.
3. **`npm run lint`** — Ergebnis **wörtlich melden, auch bei Grün**.
4. **Alle Gegenproben aus Abschnitt 3 wörtlich**, beide Richtungen,
   `node --check` vor jedem Lauf. **Jedes Mutationsskript nimmt den Zielpfad
   als ARGUMENT und bricht ab, wenn das Muster nicht genau einmal passt.**
5. **Marker-Scan** mit Pfad-Ausschluss (`--exclude-dir`, nicht `| grep -v`) →
   genau 6 Treffer, alle in `docs/offene-befunde-31-08-2026.md`.
6. **Commit und Push VOR dem Warten auf einen Hintergrundlauf.**

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* **Einen legitimen heutigen Aufrufer, der `"0"` oder eine ID über
  2147483647 schickt.** Zwei Prüfspuren haben gesucht und keinen gefunden —
  das ist eine Rechenschaft, keine Garantie.
* **Eine bestehende Zusicherung, die ROT wird**: nicht streichen, melden.
* **Einen zwölften Eintrittspunkt derselben Klasse.** Meine Liste war in
  diesem Vorhaben dreimal unvollständig.
* **Jeden Widerspruch zu einer Messung in diesem Papier.** Drei Prüfrunden
  haben je mindestens eine meiner Tatsachenbehauptungen widerlegt.
