# Auftragspapier — Nacharbeit 3 (F5): kollidierende Fixtur-IDs

Repo: `/home/user/gymdocu`, Zweig `claude/mandantengrenze-fremd-ids`
(HEAD `3b06990`). Betroffen: **nur** `test_feature_mandantengrenze_fremd_ids.js`.
Kein Produktivcode.

## Der Befund — gemessen, nicht vermutet

Auf einer FRISCHEN `gymdocu_test` (drop + create + `db.init()` +
`runMigrations`) hat jede Tabelle ihre erste Zeile bei `id = 1`. Die Fixturen
dieser Testdatei werden alle am Anfang angelegt. Gemessen am 19.09.2026 durch
direkte Abfrage nach einem grünen Lauf:

    studios    : 1=Studio Mandantengrenze A, 2=…B, 3=…C
    etagen     : 1=Etage A, 2=Etage B, 3=Etage C
    mitarbeiter: 1=Mitarbeiter A, 2=A2, 3=A3, 4=A4, 5=B, 6=C
    belehrungen: 1=Belehrung A, 2=Belehrung B, 3=Belehrung C

Also: **`A === etageA === maA === belA === 1`**, ebenso `B === etageB ===
maA2 === belB === 2` und `C === etageC === maA3 === belC === 3`.

Das ist die vierte Erscheinungsform aus der CLAUDE.md — „die Testdaten lassen
mehrere verschiedene Bedeutungen auf DIESELBE Zahl fallen". Eine Zusicherung
der Form „die gespeicherte `belehrung_id` ist `belA` und NICHT mit
`mitarbeiter_id` vertauscht" kann nicht fallen, wenn beide die Zahl 1 sind.

**Wie es aufgefallen ist** (das gehört dazu, weil es die Tragweite zeigt):
Bei der F4-N9-Gegenprobe wurde `ma.id`/`bel.id` im INSERT von
`routes/belehrungen.js` vertauscht. Auf frischer DB fielen **nur** die acht
F4-N6-Zeilen (die `maA3`/`maA4` gegen `belA` benutzen, also 3 bzw. 4 gegen 1).
Die N2-Zeile, die die Vertauschung AUSDRÜCKLICH BEIM NAMEN NENNT
(„gespeicherte belehrung_id korrekt (NICHT vertauscht mit mitarbeiter_id)"),
blieb GRÜN — samt dem ganzen N3-Abschnitt. Derselbe Lauf des Ausführenden auf
einer NICHT frischen Datenbank zeigte dagegen 13 Kreuze. Die Trennschärfe
dieser Zusicherungen hängt also an zufälligem Fremdzustand in der geteilten
Wegwerf-Datenbank.

## Was zu bauen ist

### F5-1 — Fixtur-IDs paarweise verschieden machen

Vor dem Anlegen der echten Fixturen die Sequenz je Tabelle um einen
UNTERSCHIEDLICHEN Betrag vorschieben, sodass keine zwei Bedeutungen je
dieselbe Zahl tragen können. Vorgabe (Zahlen sind bindend, damit eine
Verwechslung im Fehlertext sofort auffällt):

* `studios` — kein Vorschub (1, 2, 3)
* `etagen` — Vorschub, sodass die erste echte Etage bei **≥ 101** liegt
* `mitarbeiter` — erste echte Zeile bei **≥ 201**
* `belehrungen` — erste echte Zeile bei **≥ 301**

Der Vorschub wird durch Einfügen-und-Löschen von Wegwerfzeilen erzeugt, wie es
`erzeugeUndTilgeSentinel` schon tut — **NICHT** über `setval`/`ALTER TABLE …
RESTART`: die Testdatei soll kein DDL fahren, und die Wegwerfzeilen belegen
zugleich, dass der Weg mandantengebunden ist.

**Jede dieser Abfragen trägt `studio_id`** — auch die Löschung. Kein
`SELECT max(id) FROM <tabelle>` ohne `studio_id`; der grösste bereits
vergebene Wert ist in JS aus den zurückgegebenen `RETURNING id` bekannt und
muss nicht global erfragt werden.

Die Wegwerfzeilen dürfen KEINE `ok()`-Aufrufe erzeugen (sonst hängt die
Prüfzahl an der Zahl der Schleifendurchläufe, und die ist von der Sequenz
abhängig — also wieder ein Sollwert aus dem eigenen Datenfluss).

### F5-2 — Ein Wächter, der die Kollision künftig unmöglich macht

Eine EINZIGE neue `ok()`-Zusicherung direkt nach dem Anlegen der Fixturen:
alle Fixtur-IDs (`A, B, C, etageA, etageB, etageC, maA, maA2, maA3, maA4,
maB, maC, belA, belB, belC`) sind **paarweise verschieden**.

Der Sollwert kommt von AUSSEN und kann vom Defekt nicht mitverändert werden:
die Anzahl der Werte gegen die Grösse der Menge daraus. Bei einem Treffer
nennt der Diagnosetext die kollidierenden Namen und Werte, nicht nur „false".

Diese Zusicherung ist der eigentliche Beitrag: sie verhindert, dass eine
spätere Änderung an den Fixturen dieselbe Lücke stillschweigend wieder
aufreisst.

### F5-3 — Mindestprüfzahl und Herleitung nachziehen

`MINDEST_PRUEFUNGEN` von 188 auf den neuen Wert. Die Herleitung im
Kopfkommentar ist von Hand fortzuschreiben (Abschnittsnamen, wie seit F4-N8);
**zuerst rechnen, dann laufen lassen** — die Reihenfolge wurde in F4-N8
ausdrücklich nicht eingehalten und das ist hier nachzuholen. Schreibe die
hergeleitete Zahl in den Bericht, BEVOR du den Lauf meldest.

## Gegenproben — verbindlich, beide Richtungen, je einzeln gemessen

Für jede gilt das Verfahren: unabhängige `cp`-Sicherung, Mutationsskript mit
**Zielpfad als Argument**, Fundstellenzählung mit Abbruch bei ungleich 1,
`GEGENPROBE-DEFEKT`-Marker, `node --check`, Einzeldateilauf OHNE Pipe,
Rücknahme aus der `cp`-Kopie, `diff` EXIT 0, danach grüner Lauf.
**Niemals `git checkout` oder `git stash`** — das ist in der letzten Runde
passiert und wird nicht wiederholt.

Alle Läufe gegen eine FRISCHE `gymdocu_test` (drop, create, `db.init()`,
`runMigrations`) — genau das ist die Bedingung, unter der der Befund
überhaupt sichtbar wird.

**G1 (der Kernbeleg):** `ma.id`/`bel.id` im INSERT von
`routes/belehrungen.js` vertauschen (Zeile 1967, `[req.studioId, ma.id,
bel.id, grund || null]`). Auf dem ALTEN Stand fielen dabei auf frischer DB
**8** Zeilen (gemessen: 180 PASS / 8 FAIL, ausschliesslich F4-N6).
**Erwartung nach F5-1: deutlich mehr** — insbesondere MUSS die N2-Zeile
„gespeicherte belehrung_id korrekt (NICHT vertauscht mit mitarbeiter_id)"
jetzt fallen. Melde die Zahl und die Liste der gefallenen Zeilen wörtlich.
Fällt diese eine Zeile NICHT, ist der Auftrag nicht erfüllt — dann melde das,
statt nachzubessern, bis es passt.

**G2:** Die neue Zusicherung aus F5-2 muss anschlagen, wenn die Kollision
zurückkehrt. Mutation: den Vorschub für `belehrungen` entfernen (bzw. auf
denselben Betrag wie `mitarbeiter` setzen). Erwartung: EXIT 1, die neue Zeile
fällt und nennt die kollidierenden Namen.

**G3 (Positivkontrolle gegen eine leere Prüfung):** die Liste der geprüften
IDs im Wächter aus F5-2 auf EINEN Eintrag kürzen. Eine Menge aus einem
Element ist immer „paarweise verschieden" — die Zusicherung bliebe grün,
obwohl sie nichts mehr prüft. Erwartung: sie MUSS trotzdem fallen, weil die
erwartete ANZAHL der geprüften IDs gegen eine unabhängig hingeschriebene Zahl
gehalten wird. Ist das nicht der Fall, fehlt dem Wächter genau diese zweite
Zusicherung und sie ist zu ergänzen.

## Abschluss

Volle Suite als `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`
(kein Pipe, kein äusseres `flock`), `npm run lint` wörtlich auch bei Grün,
Dateizahl-Ritual mit GLEICHEM Sieb auf beiden Seiten (`── [^ ]+\.js ──` gegen
die in `test/run.sh` registrierten), Marker-Scan mit `--exclude-dir=node_modules
--exclude-dir=.git`, `git status --short`.

**Commit-und-Push nach JEDEM der drei Punkte.** In der letzten Runde landeten
sieben Punkte in einem Commit; bei einem Container-Neustart wäre alles
verloren gewesen. Kein PR.

Melde am Ende ausdrücklich, was NICHT geklappt hat. Ein Abbruch mit Rückfrage
ist ein besseres Ergebnis als ein geschöntes Grün.

---

# FASSUNG 2 — nach Planprüfung und Code-Gegenlesung

Die Planprüfung hat an Fassung 1 **drei tragende Befunde** gehabt, die
Code-Gegenlesung des F4-Diffs **zwei weitere**, beide vom Haupt-Agenten selbst
nachgemessen. **Fassung 2 ersetzt Fassung 1 vollständig** — was oben steht,
gilt nur noch als Begründung des Befundes, nicht als Bauanweisung.

Einordnung der Komplexität (Pflicht vor dem Auftrag): **Standard-Executer.**
Eine Datei, mechanische Fixtur-Änderung plus drei klar umrissene Wächter, alle
Gegenproben ausgeschrieben. Nicht „sehr komplex" im Sinne der CLAUDE.md.

## Was sich gegenüber Fassung 1 ändert

* Die Vorschubbeträge werden **kleiner** (11/21/31 statt 101/201/301). Grund:
  Fassung 1 hätte rund 600 Wegwerfzeilen erzeugt. 60 genügen.
* Die Untergrenzen werden vom Wächter **ausdrücklich geprüft**. Fassung 1 hat
  sie nur vorgeschrieben — paarweise Verschiedenheit ist auch bei ganz anderen
  Zahlen erfüllt, die Vorgabe wäre also unbewacht geblieben.
* Die **Löschung** der Wegwerfzeilen wird nachgewiesen. Fassung 1 verlangte sie
  ohne jeden Nachweis: eine unwirksame Löschung (`AND FALSE`) lässt die
  Sequenzen trotzdem vorrücken, alle IDs bleiben verschieden, und die Datei
  bliebe grün, während hunderte Zeilen liegen bleiben. Bei Mitarbeiterzeilen
  unter A hat das echte Folgen — `schalteAlleFrei` schreibt für JEDEN aktiven
  Mitarbeiter des Studios.
* Die **Zahl der neuen `ok()`-Aufrufe ist jetzt festgelegt: genau drei**,
  `MINDEST_PRUEFUNGEN` also **191**. Fassung 1 war an dieser Stelle
  widersprüchlich (einmal „eine EINZIGE Zusicherung", dann eine „zweite
  Zusicherung" in G3) — damit liess sich die Zahl vor dem Lauf gar nicht
  herleiten, und wer 189 einträgt, während zwei Zusicherungen existieren, kann
  eine davon wieder entfernen, ohne dass die Schranke greift.

## F5-1 — Fixtur-IDs paarweise verschieden machen

Vor dem Anlegen der echten Fixturen die Sequenz je Tabelle um einen
UNTERSCHIEDLICHEN Betrag vorschieben:

| Tabelle | erste echte ID muss sein |
|---|---|
| `studios` | kein Vorschub (1, 2, 3) |
| `etagen` | **≥ 11** |
| `mitarbeiter` | **≥ 21** |
| `belehrungen` | **≥ 31** |

Vorschub durch Einfügen-und-Löschen von Wegwerfzeilen, wie `erzeugeUndTilgeSentinel`
es schon tut — **kein** `setval`, kein `ALTER TABLE … RESTART`. **Jede** dieser
Abfragen trägt `studio_id`, auch die Löschung. Kein `SELECT max(id)` ohne
`studio_id`; der grösste vergebene Wert ist in JS aus `RETURNING id` bekannt.

Die Schleife erzeugt **keine** `ok()`-Aufrufe — sonst hinge die Prüfzahl an der
Zahl der Durchläufe, und die hängt an der Sequenz. Sie sammelt stattdessen je
Tabelle die eingefügten IDs und die `rowCount`-Summe der Löschungen für F5-2c.

## F5-2 — GENAU DREI neue Zusicherungen, unmittelbar nach den Fixturen

**a) Paarweise verschieden UND vollzählig.** Eine einzige `ok()`-Zeile mit
beiden Bedingungen zusammen: die Liste enthält genau **15** IDs (`A, B, C,
etageA, etageB, etageC, maA, maA2, maA3, maA4, maB, maC, belA, belB, belC`)
UND die Menge daraus hat ebenfalls 15 Elemente. Die **15 steht literal im
Quelltext**, nicht als `liste.length`. Grund: eine Menge aus einem Element ist
immer „paarweise verschieden"; ohne die unabhängige Anzahl liesse sich die
Liste kürzen, ohne dass etwas fällt. Die Diagnose nennt bei einem Treffer die
kollidierenden NAMEN und Werte, nicht nur `false`.

**b) Die Untergrenzen.** Eine `ok()`-Zeile: `etageA >= 11 && maA >= 21 &&
belA >= 31` und alle drei Studio-IDs `< 11`. Die vier Zahlen stehen literal
im Quelltext. Ohne diese Zeile wäre die Bereichsaufteilung aus F5-1 unbewacht.

**c) Die Löschung ist wirklich passiert.** Eine `ok()`-Zeile: je Tabelle ist
die Summe der gelöschten `rowCount` gleich der Zahl der eingefügten
Wegwerfzeilen. **Kein `throw`** — die Zusicherung meldet und der Lauf geht
weiter, sonst geht die Abdeckung dahinter verloren.

## F5-3 — Mindestprüfzahl

`MINDEST_PRUEFUNGEN` von 188 auf **191**. Die Herleitung im Kopfkommentar von
Hand fortschreiben (Abschnittsnamen wie seit F4-N8). **Zuerst rechnen, dann
laufen lassen** — und die hergeleitete Zahl im Bericht nennen, BEVOR der
Lauf gemeldet wird. In F4-N8 wurde diese Reihenfolge ausdrücklich nicht
eingehalten; das ist hier nachzuholen.

## F5-4 — `istRequireCoreAuth` prüft die FORM, nicht die TATSACHE

**Vom Haupt-Agenten nachgemessen, Ergebnis `EXIT 0, 188 PASS / 0 FAIL`:** mit

    const { requireLogin } = require('./core/auth');
    const requireAdmin = require('./core/auth');

bleiben **alle drei** F4-N4-Zeilen grün. `requireAdmin` ist dann das
Modulobjekt statt der Middleware — der Admin-Schutz wäre real weg, und
ausgerechnet der Wächter, der die IDENTITÄT prüfen sollte, merkt es nicht.
Die bestehende M-Zeile prüft nur den NAMEN im `app.use`-Argument und bleibt
ebenfalls grün.

Zu bauen: `ausCoreAuth` darf nur `true` werden, wenn die Bindung die
EIGENSCHAFT `requireAdmin` des Moduls entnimmt — also ObjectPattern mit
Schlüssel `requireAdmin` (wie heute) **oder** eine MemberExpression
`require('./core/auth').requireAdmin`. Ein blosser `CallExpression`-Init auf
`require('./core/auth')` ist ab jetzt `ausCoreAuth: false`.

## F5-5 — F4-N5 kann bei kaputtem Baum nicht rot werden

**Ebenfalls nachgemessen:** mit einem Syntaxfehler in `server.js` bleiben beide
F4-N5-Zeilen **grün** (`EXIT 1, 177 PASS / 5 FAIL` — die fünf sind Parse,
Positivkontrolle, zwei M-Zeilen und F4-N4, dazu die Mindestprüfzahl). Der
Zustand fällt also laut auf; die Zusicherung ist nicht blind, sondern
UNEHRLICH — sie meldet „geprüft und sauber", wo niemand geprüft hat.

Zu bauen: beide F4-N5-Bedingungen um `serverAst !== null &&` erweitern.

## AUSDRÜCKLICH NICHT ZU BAUEN

`SELECT clock_timestamp() AS t` und `SELECT ($1::timestamptz > $2::timestamptz)
AS neuer` tragen kein `studio_id`. **Beide Prüfspuren haben das unabhängig
gemeldet** (sol als blockierend, DeepSeek als niedrig) — deshalb steht es hier
begründet und nicht stillschweigend übergangen.

Grund: beide Abfragen haben **keine `FROM`-Klausel**. Sie lesen keine Tabelle
und können deshalb nichts über eine Mandantengrenze hinweg lesen; die Regel
zielt auf Tabellenabfragen. Beide vorgeschlagenen Behebungen machen es
schlechter — die eine hängt einen sinnlosen Tabellenlesezugriff an eine
Zeitabfrage und macht sie damit von Fixturzustand abhängig, die andere fügt
eine Ausgabespalte hinzu, die nichts bedeutet.

**Zu bauen ist stattdessen nur ein Kommentar** an beiden Fundstellen, der
genau das festhält, damit die nächste Gegenlesung nicht zum dritten Mal
darüber stolpert. Ob die Regel selbst eine ausdrückliche Ausnahme für
FROM-lose Abfragen bekommt, entscheidet der Betreiber, nicht dieser Auftrag.

## Gegenproben — verbindlich, je einzeln, beide Richtungen

Verfahren für jede: unabhängige `cp`-Sicherung, Mutationsskript mit **Zielpfad
als Argument**, Fundstellenzählung mit Abbruch bei ungleich 1,
`GEGENPROBE-DEFEKT`-Marker, `node --check`, Einzeldateilauf OHNE Pipe,
Rücknahme aus der `cp`-Kopie, `diff` EXIT 0, danach grüner Lauf.
**Niemals `git checkout` oder `git stash`** — das ist in der letzten Runde
passiert und wird nicht wiederholt.

Alle Läufe gegen eine **FRISCHE** `gymdocu_test`. Rezept (auf einer nicht
frischen DB ist der Kernbefund unsichtbar — genau daran ist die letzte Runde
vorbeigelaufen):

    sudo -u postgres dropdb --if-exists gymdocu_test
    sudo -u postgres createdb -O gymdocu gymdocu_test
    # dann db.init() + runMigrations(db.pool) aus core/migrate gegen
    # DATABASE_URL=<.env-URL mit Datenbankname gymdocu_test>

**G1 — der Kernbeleg.** `ma.id`/`bel.id` im INSERT von `routes/belehrungen.js`
vertauschen (Zeile 1967). Gemessen auf dem ALTEN Stand, frische DB:
**180 PASS / 8 FAIL**, ausschliesslich die acht F4-N6-Zeilen. Die N2-Zeile
„gespeicherte belehrung_id korrekt (NICHT vertauscht mit mitarbeiter_id)"
blieb GRÜN, obwohl sie die Vertauschung beim Namen nennt.
**Erwartung nach F5-1: diese Zeile MUSS fallen.** Melde Zahl und Liste der
gefallenen Zeilen wörtlich. Fällt sie nicht, ist der Auftrag nicht erfüllt —
dann melde das, statt nachzubessern, bis es passt.

**G2 — Bereichsuntergrenzen.** Vorschub für `belehrungen` auf denselben Betrag
wie `mitarbeiter` setzen. Erwartung: F5-2b fällt und nennt den Istwert.

**G3 — Vollzähligkeit.** Die Liste in F5-2a auf EINEN Eintrag kürzen. Eine
einelementige Menge ist immer paarweise verschieden. Erwartung: die Zeile MUSS
trotzdem fallen, weil die literal hingeschriebene 15 nicht mehr stimmt.

**G4 — Löschnachweis.** Die Löschung unwirksam machen (`AND FALSE` in der
`WHERE`-Klausel der Wegwerf-Löschung). Erwartung: F5-2c fällt, der Lauf läuft
weiter bis zur Schlusszeile, F5-2a und F5-2b bleiben grün (die IDs sind ja
weiterhin verschieden) — genau das belegt, dass 2c etwas EIGENES bewacht.

**G5 — Identität statt Name.** In `server.js`:

    const { requireLogin } = require('./core/auth');
    const requireAdmin = require('./core/auth');

Erwartung nach F5-4: die F4-N4-Zeile „stammt aus require('./core/auth')" fällt.
Gemessen VOR F5-4: `EXIT 0, 188 PASS / 0 FAIL`.

**G6 — kaputter Baum.** Syntaxfehler in `server.js`. Erwartung nach F5-5: die
beiden F4-N5-Zeilen fallen zusätzlich zu den fünf, die schon vorher fielen.

## Abschluss

Volle Suite als `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`
(kein Pipe, kein äusseres `flock`), `npm run lint` wörtlich auch bei Grün,
Dateizahl-Ritual mit GLEICHEM Sieb auf beiden Seiten, Marker-Scan mit
`--exclude-dir=node_modules --exclude-dir=.git`, `git status --short`.

**Commit-und-Push nach JEDEM Punkt.** In der letzten Runde landeten sieben
Punkte in einem Commit; bei einem Container-Neustart wäre alles verloren
gewesen. Kein PR.

Melde am Ende ausdrücklich, was NICHT geklappt hat, und melde Zahlen so, wie
sie im Log stehen — in der letzten Runde wurde eine Gegenprobe als „178/10"
berichtet, deren Log gar keine Schlusszeile hatte.
