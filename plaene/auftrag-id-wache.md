# Auftragspapier — ID-Wache: EINE Regel, und ein Wächter, der die Eintrittspunkte SELBST zählt

**Repo:** GymDocu (`/home/user/gymdocu`, Stand `4c4b729`).
**Vorgeschichte:** Dieses Papier ersetzt die ID-Hälfte von
`plaene/auftrag-eingabewache-geraete.md` (Fassungen 1 und 2, beide überholt).
Dort stehen **34 nachgemessene Planprüfungsbefunde aus zwei Runden**; die
wichtigsten für DIESES Papier sind unten als gemessene Tatsachen eingearbeitet.
**Wer das alte Papier baut, baut sieben blockierende Fehler ein.**
**Warum es vorgeht** (STAND.md, Regel 5): Punkt 3 des Pentest-Programms — eine
Falscheingabe erzeugt heute eine Fehlerseite UND einen Telegram-Alarm; der
Alarmkanal ist von aussen taktbar.

---

## 0. Was GEMESSEN ist

Zeilennummern am Stand `4c4b729`. **Vor dem Bau neu messen.**

### 0.1 Drei VERSCHIEDENE Begriffe, nicht eine Regel an vier Orten

| Ort | Begriff |
|---|---|
| `geraete-typen.js:233` | **einzelne URL-ID** (`istGueltigeId`) |
| `ausmusterung.js:77` | **einzelne URL-ID** (`istGueltigeId`) |
| `tablets.js:47` | **einzelne URL-ID** (`istGueltigeId`) |
| `geraete.js:699` | **einzelne URL-ID**, inline |
| `ausmusterung.js:92` | **ID-SAMMELFELD** (`parseIds`) — andere Funktion |
| `geraete.js:952` | **int4-Normalisierung** (`normalisiereGeraetId`) — andere Funktion |

Es ist ein **Stern mit Quelle**, kein Zitierring: `geraete-typen.js:227-231`
trägt die eigene, gemessene Begründung („Befund 11, unabhängige Prüfung
28.08.2026, GEMESSEN"); die beiden anderen zeigen dorthin.

### 0.2 Die verbreitete Regel ist die SCHWÄCHERE von zweien

`istGueltigeId` prüft nur die lexikalische FORM. `"99999999999"` besteht sie
und wirft danach an der ersten INTEGER-Abfrage **22003 „out of range"** — die
Route antwortet mit ihrer Fehlerseite und ruft `intern()`.

`normalisiereGeraetId` (`geraete.js:949-955`) hat die richtige Regel bereits:
Ziffern UND `zahl > 0 && zahl <= 2147483647`. Ihr Kommentar (`:941-944`) nennt
genau diesen Fall als gemessen behoben.

### 0.3 Zwei Routen benutzen noch `isNaN`

`geraete.js:337` und `:467`. Gemessen: `isNaN` ist `false` für `"1e3"`,
`"1.5"`, `"0x10"`; `/^\d+$/` weist alle drei ab. Der Wert erreicht
`t.one()`/`t.run()` für eine INTEGER-Spalte → 22P02 → HTTP **200** mit
„Datenbankfehler" und `intern()`-Alarm. Der Kommentar an `:688-696` beschreibt
genau das, als Nachbesserung vom 17.09.2026, die hier nicht nachgezogen wurde.

### 0.4 `parseInt` vor der Prüfung fängt den int4-Überlauf NICHT

Das war in Fassung 2 als „erreicht SQL nie mit einem schlechten Wert"
ausgeklammert. **Die Behauptung ist falsch, gemessen:**

    parseInt("2abc",10)        = 2             Guard (!id||isNaN) weist ab: false
    parseInt("2147483648",10)  = 2147483648    Guard (!id||isNaN) weist ab: false
    parseInt("99999999999",10) = 99999999999   Guard (!id||isNaN) weist ab: false
    parseInt("0x10",10)        = 0             Guard weist ab: true
    parseInt("abc",10)         = NaN           Guard weist ab: true

Betroffen: `mitarbeiter.js:670,703,736,835` und `tablet-sperre.js:545`.
**Zwei getrennte Wirkungen, beide echt:**

1. **int4-Überlauf erreicht SQL** → 22003 → im Tablet-Weg über Express 5 zum
   globalen 500 samt `errorTracker`, in den Mitarbeiter-Routen zur Fehlerseite
   samt `intern()`. **Dieselbe Alarmklasse wie 0.2.**
2. **Stille Trunkierung** → `/mitarbeiter/loeschen/2abc` löscht Mitarbeiter 2.
   **Kein Rechtegewinn** — gemessen tragen alle betroffenen Abfragen
   `studio_id`: `tablet-sperre.js:550`, `mitarbeiter-auth.js:173`, und im
   Mitarbeiter-Löschweg auch alle Folgeanweisungen (`DELETE FROM
   belehrung_freischaltung`, `mitarbeiter_token`). Wer `2abc` schicken kann,
   kann auch `2` schicken.

Wirkung 1 macht diese fünf Stellen zum Teil DIESES Auftrags. Wirkung 2 wird
dabei mitbehoben.

### 0.5 26 Routen tragen `:id` — zehn sind bewacht

Gemessen mit einem an bekannten Fundstellen GELERNTEN Muster
(`^\s*(adminRouter|router)\.(get|post|put|patch|delete)\(.*:id`, Positivkontrolle:
es findet `geraete.js:335`, `:465`, `:697`):

    geraete.js 19   geraete-typen.js 4   ausmusterung.js 2   tablets.js 1   = 26

Bewacht sind heute zehn. **Die übrigen 16 sind FUNDORTE, nicht Befunde** — ob
ihre `:id` überhaupt roh an SQL geht, ist NICHT gemessen. Sie werden deshalb
nicht blind bewacht, sondern SICHTBAR gemacht (1.4).

---

## 1. Was gebaut wird

### 1.1 `core/eingabe-pruefung.js` (neu) — die STÄRKERE Regel

    const ID_MAX = 2147483647;            // int4-Obergrenze (PostgreSQL)
    function istGueltigeId(wert) { … }    // reine Ziffernfolge UND 1 <= n <= ID_MAX
    module.exports = { istGueltigeId, ID_MAX };

**Kein `trim()`, kein Leerraum, keine Vorzeichen** — eine URL-ID ist eine reine
Ziffernfolge. Führende Nullen bleiben zugelassen (Verhalten des Bestands).

Der Dateikopf nennt die abgelösten Orte NAMENTLICH und macht **keine Aussage
über „jede andere Stelle" oder „die einzige ID-Quelle des Repos"**.
`parseIds()` und `normalisiereGeraetId()` werden dort ausdrücklich als EIGENE
Begriffe benannt.

### 1.2 `ID_MAX` steht an EINEM Ort

`normalisiereGeraetId` (`geraete.js:948`) trägt heute ein eigenes
`GERAET_ID_MAX = 2147483647`. **Es importiert ab jetzt `ID_MAX` aus der neuen
Quelle** (`routes/` → `core/` ist erlaubt, nur die Gegenrichtung nicht).
Sonst stünde dieselbe Zahl an zwei Orten, ohne dass eine Zusicherung sie
vergleicht — und eine spätere bigint-Migration verschöbe die Grenze lautlos an
genau einer Stelle.

### 1.3 Die zehn Wachen werden gebunden, die sieben ungeschützten nachgezogen

* **Gebunden** (Regelkörper weg, Aufruf auf die Quelle):
  `geraete-typen.js:232`, `ausmusterung.js:73`, `tablets.js:46`,
  `geraete.js:699`.
* **Nachgezogen:** `geraete.js:337` und `:467`.

      if (!id || isNaN(id)) return res.send(…)
      ->  if (!istGueltigeId(id)) return res.status(400).send(…)

  **Beachte die Negation:** `isNaN` ist WAHR bei UNGÜLTIG, `istGueltigeId`
  WAHR bei GÜLTIG. `!id` entfällt, weil der Helfer leere und fehlende Werte
  selbst abweist — das ist in Z4 zuzusichern.
* **Nachgezogen:** die fünf `parseInt`-Stellen aus 0.4. Dort wird die Prüfung
  **VOR** das `parseInt` gezogen; das `parseInt` danach ist dann nur noch eine
  Umwandlung und kann nichts mehr verschlucken. Die Rückmeldung bleibt, wie
  sie dort ist (Redirect statt Fehlerseite) — **das Rückmeldeverhalten wird
  NICHT vereinheitlicht**, das wäre ein anderer Auftrag.
* **Unangetastet:** `ausmusterung.js:92` (`parseIds`) und `geraete.js:952`
  (`normalisiereGeraetId`) — andere Begriffe, s. 0.1.

### 1.4 Der Wächter zählt die Eintrittspunkte SELBST

**Das ist der Kern dieses Auftrags, nicht ein Zusatz.** Eine von mir
geschriebene Stellenliste war dreimal hintereinander unvollständig; eine Liste,
die ich schreibe, ist ein Selbstnachweis aus dem eigenen Datenfluss.

`test_feature_id_wache_inventar.js` (neu):

1. Zählt in `routes/admin/geraete.js`, `geraete-typen.js`, `ausmusterung.js`,
   `tablets.js`, `mitarbeiter.js` und `routes/tablet-sperre.js` **jede** Route
   mit `:id` auf — über die Dateiliste aus `git ls-files`, nicht über eine
   hingeschriebene Dateiliste.
2. Verlangt für JEDE: entweder ein Aufruf von `istGueltigeId` im Rumpf, ODER
   ein Eintrag in einer literal hingeschriebenen `AUSNAHMEN`-Tabelle im Test,
   **mit Grund**.
3. `AUSNAHMEN` enthält beim Bau die 16 ungemessenen Routen aus 0.5, je mit dem
   Grund `"nicht gemessen — eigener Auftrag"`. Das macht sie SICHTBAR statt
   still fehlend.
4. **Eine neue Route ohne Wache und ohne Ausnahmeeintrag macht den Wächter
   ROT.** Das ist der Unterschied zu jeder Liste, die ich pflege.

**Der Sollwert kommt von AUSSEN:** die Dateien aus `git ls-files`, die Routen
aus dem Quelltext, die Ausnahmen literal. Keine der drei Zahlen stammt aus dem
Lauf, den sie bewachen soll.

**Kommentare werden vorher abgezogen** (sonst schlägt der Wächter an einem
erklärenden Kommentar an), und danach wird zugesichert, dass überhaupt noch
etwas übrig ist.

---

## 2. Was ausdrücklich NICHT gebaut wird

* **Die Textfeldregel** — eigener Auftrag, `plaene/auftrag-textfeld-wache.md`.
  Andere Eintrittspunktmenge, andere Ausnahmen, andere Gegenproben. Sie in
  einem Beitrag zu führen war der gemessene Grund, warum in Fassung 2 vier
  Abschnitte nachweislich nicht dieselbe Menge meinten.
* **Die 16 ungemessenen `:id`-Routen** — sie kommen in `AUSNAHMEN`, nicht in
  den Bau. Wer sie bewacht, ohne gemessen zu haben, baut auf Fundorten.
* **Eine Vereinheitlichung der Rückmeldung** (Redirect gegen Fehlerseite).
* **`parseIds()` und `normalisiereGeraetId()`** — andere Begriffe.

---

## 3. Zusicherungen — je mit der Gegenprobe, die sie rot macht

### Z1 — Die zwölf gebauten Wachen weisen ab, über HTTP

Für JEDE der zwölf Stellen aus 1.3 **einzeln**, mit dem für DIESE Route
richtigen Erfolgsstatus (302 bei Redirect-Routen, 200 bei GET-Seiten — der
pauschale Satz „echte ID → 302" ist gemessen falsch):

* `1e3`, `1.5`, `0x10` → Abweisung, NICHT `Datenbankfehler`.
* **`2147483648`** → Abweisung. **`2147483647`** und eine echte ID → der
  normale Erfolgsweg. **`0`** → Abweisung.
* **Positivkontrolle:** echte ID → Erfolgsweg UND die fachliche Wirkung ist in
  der DB nachweisbar (nicht nur der Statuscode).

**Gegenproben, je einzeln, wörtlich zu melden:**
1. `istGueltigeId` auf `(w) => !isNaN(w)` → Z1 ROT.
2. **Nur die int4-Grenze entfernen** → **nur** der `2147483648`-Fall ROT.
   Wird dabei mehr rot, prüft dieser Fall nichts Eigenes.
3. **An EINER Route `if (false && !istGueltigeId(id))`** → genau deren Fälle
   ROT. Bleibt alles grün, misst Z1 die Verdrahtung nicht.
4. **`/^\d+$/` → `/^\s*\d+\s*$/`** im Helfer → muss ROT werden. Dafür braucht
   Z4 die Werte `" 12"` und `"12 "`; ohne sie überlebt diese Mutation.

### Z2 — Der Wächter aus 1.4 findet eine neue ungeschützte Route

* **Positivkontrolle zuerst:** am HEUTIGEN Stand muss der Zähler die
  **26** Routen aus 0.5 finden und die zehn bewachten korrekt als bewacht
  erkennen. Findet er weniger, ist das Muster falsch, nicht der Code.
* **Gegenprobe:** eine Wegwerf-Route mit `:id` und ohne Wache einfügen →
  Wächter ROT, und die Meldung nennt sie. Entfernen → GRÜN.
* **Zweite Gegenprobe, die Klasse schliessend:** einen `AUSNAHMEN`-Eintrag
  löschen, dessen Route ungeschützt ist → ROT. Einen hinzufügen, dessen Route
  gar nicht existiert → ebenfalls ROT (sonst verrottet die Liste still).

### Z3 — `ID_MAX` steht an einem Ort

Zusicherung: `grep` findet den Literalwert `2147483647` in `routes/` **nicht**
mehr; `normalisiereGeraetId` liest ihn aus `core/eingabe-pruefung`.
**Gegenprobe:** die Zahl in `geraete.js` wieder literal einsetzen → ROT.

Und die WIRKSAMKEIT, nicht nur die Schreibweise: `ID_MAX` im Helfer auf `10`
setzen → sowohl ein `istGueltigeId`-Fall als auch ein
`normalisiereGeraetId`-Fall müssen fallen. Fällt nur einer, hängt der andere
nicht wirklich an der Quelle.

### Z4 — Der Helfer, mit SOLLWERT je Eingabe

Nicht eine Liste von Eingaben, sondern eine Tabelle Eingabe → erwartetes
Ergebnis. Mindestens:

    "1"  "12"  "007"  "2147483647"          -> true
    "0"  "2147483648"  "99999999999"        -> false
    "1e3"  "1.5"  "0x10"  "-1"  "+1"        -> false
    ""  " "  " 12"  "12 "                   -> false
    null  undefined  {}  []  ["1","2"]  42  -> false

`42` steht bewusst dabei: `istGueltigeId` bekommt in Produktion nur
Zeichenketten, aber ein Helfer, der bei einer Zahl `true` liefert, lädt zum
Missbrauch ein. **Der Sollwert ist eine Entscheidung dieses Papiers, keine
Messung** — wer ihn anders will, ändert ihn hier, nicht im Test.

### Z5 — Wo diese Zusicherungen NICHT hinreichen

`test/helfer/route-harness.js:26-55` montiert `pfadKontext()`, beide Parser,
eine gefälschte Session und die Router — **aber weder CSRF noch
`studioContext`, `requireLogin`, `requireAdmin`, Wartungsmodus noch
Produktionslimit**; die Sitzung hat kein `totpOk`.

**Das gehört als KOMMENTAR in den Kopf der Testdatei — und der Kommentar ist
selbst eine Zusicherung** (Hausregel). Deshalb zusätzlich ausführbar:
ein Strukturtest, der genau diese Aussage prüft (die Harness-Session trägt
kein `totpOk`; die genannten Middlewares sind nicht montiert) und rot wird,
wenn jemand sie ändert. Ohne ihn veraltet der Kommentar grün.

Jede Formulierung „über den echten HTTP-Weg mit gültiger Admin-Sitzung" ist zu
vermeiden: belegt ist, dass der ROUTENHANDLER erreicht wurde.

---

## 4. Abnahme

1. **Volle Suite**, ohne Pipe, ohne äusseres `flock`:
   `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. EXIT 0.
2. **Dateizahl-Ritual**, `diff` EXIT 0 — die NEUE Testdatei muss in
   `test/run.sh` registriert sein und im Log auftauchen.
3. **`npm run lint`** — Ergebnis **wörtlich melden, auch bei Grün**.
4. **Alle Gegenproben aus Abschnitt 3 wörtlich**, beide Richtungen,
   `node --check` auf jede sabotierte Datei vor dem Lauf. **Jede Mutation
   nimmt den Zielpfad als ARGUMENT und bricht ab, wenn das Suchmuster nicht
   genau einmal passt.**
5. **Marker-Scan** mit Ausschluss auf dem PFAD (`--exclude-dir`, nicht
   `| grep -v`) → genau 6 Treffer, alle in `docs/offene-befunde-31-08-2026.md`.
6. **Commit und Push VOR dem Warten auf einen Hintergrundlauf.**

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* **Eine `:id`-Route, die der Zähler aus 1.4 NICHT findet.** Mein Muster war
  heute viermal falsch; das ist der wahrscheinlichste Fehler in diesem Papier.
* **Einen legitimen heutigen Aufrufer, den die int4-Grenze abweist.** Spur 1
  hat gesucht und keinen gefunden — das ist eine Rechenschaft, keine Garantie.
* **Eine bestehende Zusicherung, die durch die Umstellung ROT wird**: nicht
  streichen, melden. Solche Wächter werden fachlich umgestellt.
* **Jeden Widerspruch zu einer Messung in diesem Papier.** Der Widerspruch ist
  das wertvollste Ergebnis — zweimal hat eine Planprüfung heute belegt, dass
  eine meiner Tatsachenbehauptungen falsch war.
