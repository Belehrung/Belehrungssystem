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
