# Runde 2 — die Behebung trägt, die BEWEISE tragen noch nicht

Arbeitsbaum `/home/user/gymdocu`, Zweig `claude/qr-zuordnung-sperrreihenfolge`
(Stand `0a3ded7`), sauber, gehört dir allein.

Deine Runde 1 war gut, und zwei Dinge daran waren besonders richtig: du hast
den `40P01` wirklich erzeugt statt ihn anzunehmen, und du hast von dir aus
gemeldet, dass (e1) seit der Behebung deterministisch 40/0 ausgeht, statt es
stillschweigend durchgehen zu lassen. Genau das war der Kern des Auftrags.

**Dein Marker-Widerspruch ist von mir nachgemessen und er fällt** — aber
nützlich: mit dem vorgeschriebenen Muster `GEGENPROBE-DEFEKT\|SABOTAGE` sind
es **6**, alle in `docs/offene-befunde-31-08-2026.md`. Du hattest nur nach
`GEGENPROBE-DEFEKT` gesucht und kamst auf 4. Dass du es als Messung gemeldet
hast statt den Sollwert still anzupassen, ist richtig.

Eine unabhängige Gegenlesung hat fünf Befunde. **Drei davon habe ich selbst
gemessen, alle drei treffen zu** (frische DB je Lauf, `node --check` vor
jedem Lauf, Rücknahme gegen eine beiseitegelegte Kopie mit `diff` EXIT 0):

    M1  db.tx durch einen einfachen Aufruf auf `db` ersetzt
        (also GAR KEINE Transaktion)          ->  EXIT 0, 16 PASS / 0 FAIL
    M2  const R3 = 10  ->  const R3 = 1        ->  EXIT 0, 16 PASS / 0 FAIL
    M3  await vor den ersten beanspruche()-Aufruf in (e1)
        (vollständige Serialisierung)          ->  EXIT 0, 306 PASS / 0 FAIL

**Dazu ein Befund von mir, den niemand sonst hatte** (s. Punkt 6).

## 1. BLOCKIEREND — es bleibt ein ZWEITER Verklemmungskreis

Sperr-`SELECT` und `UPDATE` sind zwei Anweisungen mit zwei Snapshots (READ
COMMITTED; `db.tx()` setzt nur `BEGIN`, `core/db.js:457`). Eine Zeile, die
DAZWISCHEN entsteht, ist nicht mitgesperrt — das `UPDATE` fordert sie
nachträglich an.

**Die tragende Annahme habe ich selbst nachgelesen, und sie trägt:**
`core/qr-token.js:464-479` vergibt Nummern bewusst JE BLOCK statt global
fortlaufend, wörtlich begründet mit „sonst ist ein niedrig nummerierter
Block, der NACH einem höheren zugestellt wurde, für immer unerreichbar";
`waehleBlock()` (`:493-495`) überspringt zu kleine Reste ausdrücklich. Eine
neue Nummer kann also UNTERHALB vorhandener entstehen.

Der Kreis, mit `a < c < b`:

1. T1 beansprucht `[a,b]`, sperrt die vorhandenen Zeilen; `c` gibt es noch nicht.
2. Eine Chargenanlage fügt `c` ein und committet.
3. T2 beansprucht `[c,b]`, sperrt `c`, wartet auf `b` (hält T1).
4. T1s `UPDATE` sieht jetzt auch `c` und wartet auf T2.

**Dein Kommentar behauptet das Gegenteil** („die betroffenen Zeilen sind zu
diesem Zeitpunkt bereits gesperrt, dieses UPDATE kann bei keiner von ihnen
mehr blockieren"). Ein Kopfkommentar darf nicht mehr behaupten, als gemessen
ist.

**Zu bauen — und der naheliegende Weg ist der FALSCHE.** Das `UPDATE` einfach
auf die gesperrten Nummern einzuschränken schickt eine spät eingefügte Zeile
in den `throw`-Zweig bei `core/qr-zuordnung.js:611` („gebrochenes
Invariant"): aus einem harmlosen Wettlauf würde ein 500er. VON MIR
NACHGELESEN, nicht vermutet — sieh dir den Zweig an, bevor du etwas anderes
tust.

**Nimm stattdessen EINE Anweisung:**

    UPDATE qr_token SET studio_id = $1, beansprucht_am = $2
     WHERE nummer IN (
       SELECT nummer FROM qr_token
        WHERE nummer BETWEEN $3 AND $4 AND studio_id IS NULL
          AND charge_id IN (SELECT id FROM qr_charge
                            WHERE studio_id IS NULL OR studio_id = $1)
        ORDER BY nummer
        FOR UPDATE)
     RETURNING nummer

Ein Snapshot, kanonische Sperrordnung, kein neuer Fehlerpfad. **Das ist mein
Entwurf, nicht dein Fehler, und ich habe ihn NICHT gemessen** — prüf, ob
PostgreSQL hier wirklich in Sortierreihenfolge sperrt, und widersprich mit
einer Messung, wenn nicht.

**Gegenprobe:** den Ablauf oben herstellen (T1 sperrt `[a,b]` ohne `c`, `c`
einfügen, T2 `[c,b]`) und den `40P01` VORHER erzeugen, NACHHER ausbleiben
lassen. Ohne diese Messung ist auch diese Behebung eine Vermutung.

Ob `db.tx()` danach noch nötig ist, ist deine Messung: bei EINER Anweisung
tut es Autocommit womöglich auch. Sag, was du misst.

## 2. BLOCKIEREND — die Zusicherung bindet die Transaktion nicht

M1 oben: ohne jede Transaktion bleibt die Datei grün. Der Test beweist also
die Sperrreihenfolge, nicht deren Fortbestand bis zum Schreiben.

**Zu bauen:** eine Zusicherung, die FÄLLT, wenn Sperren und Schreiben
auseinanderfallen. Nach der Umstellung auf EINE Anweisung ist das die Frage
„sperrt und schreibt dieselbe Anweisung?" — miss sie so, dass M1 (oder die
entsprechende Mutation am neuen Bau) rot wird.

## 3. BLOCKIEREND — der Beweis zeigt „kleinste zuerst", nicht „aufsteigend"

Die Probe hält die KLEINSTE Nummer und prüft, dass die übrigen neun frei
sind. Das erfüllt auch `ORDER BY (nummer = $1) DESC, nummer DESC` — kleinste
zuerst, Rest absteigend.

**Zu bauen:** halt eine Nummer aus der MITTE (z. B. die fünfte von zehn) und
sichere BEIDES zu — die vier kleineren sind zu diesem Zeitpunkt schon
gesperrt, die fünf größeren noch frei. Das schliesst die Klasse, statt sie zu
verschieben, und liefert nebenbei den Nebenläufigkeitsbeleg aus Punkt 5.

## 4. Aufbau und Sollwert stammen aus derselben Quelle

M2 oben: `R3 = 1` lässt alles grün, obwohl dann GAR KEINE Reihenfolge
zwischen zwei Nummern geprüft wird — und die Zusicherung heisst weiter „ALLE
10 Nummern". Ein Name, der mehr verspricht als die Zusicherung hält.

**Zu bauen:** literale Erwartungen statt `R3 - 1` und `R3`, und eine
Zusicherung über den AUFBAU selbst (zehn VERSCHIEDENE Nummern).

**Dazu:** ein `SELECT … FOR UPDATE NOWAIT` auf eine NICHT vorhandene Zeile
gelingt mit null Treffern — das zählt die Probe heute als „sofort gesperrt".
Prüf `rowCount === 1` und die zurückgegebene Nummer.

## 5. Die Nebenläufigkeitsproben belegen keine Überschneidung

M3 oben: mit `await` vor dem ersten Aufruf — also gar keinem Wettlauf —
bleibt (e1) vollständig grün. Dasselbe gilt für G2 („eine wartet nur").

**Zu bauen:** entweder den Beleg (Blockierbeziehung über
`pg_blocking_pids()`, wie du es in G3 schon richtig machst) oder die
Zusicherungen ehrlich umbenennen in das, was sie messen — eine
Ergebnisprüfung. **Beides ist in Ordnung, ein stillschweigendes „das ist
schon ein Wettlauf" nicht.**

## 6. MEIN Befund: die Datei ist nicht wiederholbar

VON MIR GEMESSEN, zweiter Lauf gegen dieselbe Datenbank:

    FEHLGESCHLAGEN: duplicate key value violates unique constraint
                    "qr_token_nummer_key"
    EXIT=1  — Absturz VOR der ersten Zusicherung

Die Nummern (`BAND0_BASIS + 1`, `+ 11`, `+ 100…109`) stehen fest im
Quelltext. In der CI fällt das nie auf, weil dort jede Datenbank frisch ist.
**Ausgerechnet die Datei, die eine Verklemmung bewachen soll, lässt sich
lokal nicht zur Diagnose einer Verklemmung benutzen** — genau der Fall, der
auf Karte #233 am 28.08.2026 beschrieben ist („wer die Datei zur Diagnose
mehrfach laufen lässt, misst ab dem zweiten Durchgang nur noch seinen
eigenen Aufbau").

Für das STUDIO benutzt die Datei den vorhandenen Zufallssuffix (`kuerzel()`),
für die NUMMERN nicht.

**Zu bauen:** ein je Lauf zufälliges Nummernband innerhalb von Band 0, oder
ein anderer Weg mit demselben Ergebnis. **Nachweis: zwanzig Läufe
hintereinander gegen dieselbe Datenbank, alle mit Zusammenfassung und
0 FAIL.** Dieselbe Prüfung, die Karte #233 für die Seilkontroll-Datei
verlangt.

## 7. Gegenprobe 1 kann flattern — rot, nicht grün

200 ms Pause garantieren nicht, dass die Gegenseite ihre erste Sperre schon
hat. Dann entsteht kein Deadlock und die Probe fällt — eine unbegründet rote
Deploy-Sperre. Die Gegenlesung stuft das selbst als nicht blockierend ein,
und ich folge ihr darin.

**Trotzdem zu bauen, und zwar aus einem eigenen Grund:** wir bauen hier einen
Wächter GEGEN flatternde rote Läufe. Einer, der selbst flattert, wäre die
Krankheit in neuer Verkleidung. Nimm eine echte Barriere — beide Seiten
melden den Erwerb ihrer ersten Zeile, erst dann fordert jede die zweite an.
Zeitgrenzen nur zum Abbrechen, nie zum Synchronisieren.

## Was AUSDRÜCKLICH NICHT in diese Runde gehört

Ich baue an diesem Beitrag nur die sieben Punkte oben. Findest du etwas
anderes — melde es, bau es nicht.

- **40/0 statt Aufteilung ist fachlich in Ordnung** und bleibt. Die
  Gegenlesung hat das an `docs/qr-codes-konzept.md:177-196` geprüft: das
  Konzept verlangt keine faire Verteilung, sondern dass Konflikte sichtbar
  werden. Nicht erneut aufrollen.
- Die Seilkontroll-Fälle der Karte #233 (anderer Mechanismus).
- Die fehlenden Statement-Timeouts auf den rohen Pools: nur berichten. Wenn
  du sie bei der Barriere aus Punkt 7 ohnehin mitziehst, ist das recht — dann
  sag es.
- **Testabfragen ohne `studio_id` sind KEIN Befund.**

## Abschluss

1. Volle Suite SELBST: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`
2. Dateizahl-Ritual, breites Muster, MIT `sed 's/── //; s/ ──//'` auf der
   Log-Seite. Stand jetzt 325 = 325, `diff` EXIT 0.
3. `npm run lint` — wörtlich, AUCH bei Grün.
4. Marker-Scan mit dem VOLLEN Muster `GEGENPROBE-DEFEKT\|SABOTAGE`,
   Sollwert 6.
5. Committen und pushen, BEVOR du auf einen langen Lauf wartest.

**Melde wörtlich:** zu jedem der sieben Punkte beide Richtungen mit echten
Zahlen — insbesondere müssen sich M1, M2 und M3 oben UMGEKEHRT haben, und die
zwanzig Wiederholläufe aus Punkt 6 will ich als Zahl sehen.

**Widersprich mir mit einer Messung, wenn eine Vorgabe nicht trägt.** Punkt 1
ist mein ungemessener Entwurf; wenn PostgreSQL dort anders sperrt als ich
annehme, will ich das wissen, nicht eine Behebung, die meine Annahme
bedient.
