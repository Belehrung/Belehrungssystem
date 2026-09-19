# Auftragspapier — Nacharbeit 4 (F6): Fixtur-Kollision nur dort prüfen, wo sie zählt

Repo: `/home/user/gymdocu`, Zweig `claude/mandantengrenze-fremd-ids`
(HEAD `af946ee`). Betroffen: nur `test_feature_mandantengrenze_fremd_ids.js`.
Kein Produktivcode.

Einordnung der Komplexität: **Standard-Executer.** Eine Datei, zwei eng
umrissene Änderungen, Gegenproben ausgeschrieben.

## Der Befund

Der Review-Bot am Beitrag (P2) und mein eigener Kommentar in F5-2b sagen
dasselbe, unabhängig voneinander: **F5-2a verlangt, dass alle 15 Fixtur-IDs
aus VIER unabhängigen Tabellensequenzen verschieden sind.** PostgreSQL
garantiert keine tabellenübergreifende Eindeutigkeit, und in der Suite teilen
sich 338 Dateien eine Datenbank. Zwei Sequenzen können also bei völlig
korrektem Verhalten zufällig dieselbe Zahl liefern — dann wird die Suite rot,
obwohl die Mandantentrennung stimmt. **Diese Suite ist auf dem Live-Server
Deploy-Gate; ein Fehlalarm darin blockiert Auslieferungen.**

**Gemessen im vollen Suite-Lauf vom 19.09.2026** (nicht geschätzt): etagen
15–17, belehrungen 41–43, mitarbeiter 168–173, studios 500193–500195.
Abstände zwischen den Gruppen:

| Gruppenpaar | Abstand | vom Test gebraucht? |
|---|---|---|
| etagen ↔ belehrungen | **24** | **NEIN** |
| belehrungen ↔ mitarbeiter | **125** | **JA** (die Vertauschung) |
| etagen ↔ mitarbeiter | 151 | NEIN |
| studios ↔ alle übrigen | ~500.000 | JA |

Das nächstliegende Risiko sitzt also ausgerechnet auf einem Paar, das der Test
gar nicht braucht.

## F6-1 — F5-2a auf die Paare beschränken, die der Test WIRKLICH braucht

Statt „alle 15 paarweise verschieden" nur noch die Gruppenpaare prüfen, die im
Test tatsächlich zusammen auftreten:

| Paar | warum nötig |
|---|---|
| studios × etagen | M1 schreibt `[studio_id, etage_id, …]` — eine Vertauschung wäre bei gleicher Zahl unsichtbar |
| studios × mitarbeiter | M2 schreibt `[studio_id, mitarbeiter_id, …]` |
| studios × belehrungen | M2 schreibt `[studio_id, …, belehrung_id, …]` |
| mitarbeiter × belehrungen | die Vertauschung, die N2 beim Namen nennt |

**Nicht** geprüft werden etagen × mitarbeiter und etagen × belehrungen — diese
IDs treten im Test nirgends gemeinsam in einer Zusicherung oder einem INSERT
auf. **Prüfe das nach, bevor du es übernimmst**, und melde es, wenn du eine
Stelle findest, wo doch.

Innerhalb einer Gruppe ist Verschiedenheit durch die Sequenz ohnehin
garantiert und braucht keine Zusicherung.

**Der Sollwert von aussen bleibt:** die Gruppengrössen stehen literal im
Quelltext (studios 3, etagen 3, mitarbeiter 6, belehrungen 3, Summe 15), und
die Zusicherung prüft sie mit. Sonst liesse sich eine Gruppe leeren und die
Kollisionsprüfung liefe über nichts. Die Diagnose nennt bei einem Treffer das
GRUPPENPAAR und die kollidierenden Namen samt Werten.

## F6-2 — mitarbeiter × belehrungen kollisionsfrei KONSTRUIEREN

F6-1 entfernt das nächstliegende Risiko, aber `mitarbeiter × belehrungen`
bleibt nötig und steht bei 125 — das kann über die Monate zusammenlaufen, wenn
andere Testdateien mehr Belehrungen oder weniger Mitarbeiter anlegen.

Deshalb: der Vorschub für `belehrungen` bekommt **keinen festen Betrag** mehr,
sondern läuft, bis die nächste vergebene ID **grösser ist als die grösste
Mitarbeiter-Fixtur-ID**. Damit ist diese eine Kollision durch Konstruktion
unmöglich, nicht durch Abstand.

Zu beachten:
* Die Belehrungs-Fixturen entstehen heute VOR den Mitarbeiter-Fixturen oder
  danach? **Miss es und ordne so um, dass die Mitarbeiter-IDs bekannt sind,
  bevor der Belehrungs-Vorschub läuft.** Wenn eine Umordnung nötig ist, melde
  sie ausdrücklich.
* Kosten: auf frischer Datenbank sind das wenige Zeilen, im Suite-Lauf nach
  heutiger Messung rund 160. Vertretbar. Falls du auf mehr als 5000 kämst:
  **abbrechen und melden**, dann stimmt die Annahme nicht.
* Die Wegwerfzeilen werden weiterhin gelöscht und der Löschnachweis F5-2c gilt
  unverändert — er vergleicht Summen, nicht feste Beträge, passt also schon.

`etagen` und `mitarbeiter` behalten ihren festen Vorschub (10 bzw. 20).

## F6-3 — F5-2b nachziehen

F5-2b prüft heute „Vorschub in der vorgeschriebenen Höhe (10/20/30)". Für
`belehrungen` gibt es diese feste Höhe nach F6-2 nicht mehr. Ersetze die
belehrungen-Bedingung durch die Eigenschaft, die jetzt gilt:
**`belA > <grösste Mitarbeiter-Fixtur-ID>`** und weiterhin `belA ===
letzteWegwerfId + 1`. Für `etagen` und `mitarbeiter` bleibt alles wie es ist
(10 bzw. 20, literal, plus die Unmittelbarkeit).

Die Mindestprüfzahl ändert sich dadurch **nicht** (191) — es kommt keine
`ok()`-Zeile dazu. Prüfe das nach und melde die Zahl, bevor du den Lauf
meldest.

## Gegenproben — je einzeln, beide Richtungen, gegen eine FRISCHE `gymdocu_test`

Verfahren wie gehabt: `cp`-Sicherung, Mutationsskript mit **Zielpfad als
Argument**, Fundstellenzählung mit Abbruch bei ungleich 1,
`GEGENPROBE-DEFEKT`-Marker, `node --check`, Lauf ohne Pipe, Rücknahme aus der
Kopie, `diff` EXIT 0, danach grüner Lauf. **Nie `git checkout`/`git stash`**,
und eine Rücknahme nie mit einem Testlauf verketten.

**H1 — die Vertauschung fällt weiterhin auf.** `ma.id`/`bel.id` im INSERT von
`routes/belehrungen.js:1967` vertauschen. Gemessen auf dem jetzigen Stand:
**EXIT 1, 177 PASS / 14 FAIL**, darunter die N2-Zeile „gespeicherte
belehrung_id korrekt (NICHT vertauscht mit mitarbeiter_id)". **Diese Zeile MUSS
weiterhin fallen** — F6-1 darf die eigentliche Absicherung nicht schwächen.
Fällt sie nicht, ist der Auftrag nicht erfüllt: melden, nicht nachbessern.

**H2 — die Gruppengrössen sind bewacht.** Eine Gruppe in F6-1 auf einen
Eintrag kürzen. Erwartung: die Zeile fällt wegen der literalen Gruppengrösse,
obwohl eine Ein-Element-Gruppe nie kollidiert.

**H3 — eine echte Kollision auf einem NÖTIGEN Paar wird erkannt.** Den
Belehrungs-Vorschub so mutieren, dass `belA` gleich `maA` wird. Erwartung: die
Zeile fällt und nennt das Paar `mitarbeiter × belehrungen`.

**H4 — Positivkontrolle gegen eine leere Prüfung: eine Kollision auf einem
NICHT geprüften Paar lässt sie GRÜN.** Den Etagen-Vorschub so mutieren, dass
`etageA` gleich `belA` wird. Erwartung: F6-1 bleibt **grün** — das ist gewollt
und belegt, dass die Einschränkung wirklich greift und nicht bloss behauptet
ist. **Dokumentiere dieses Ergebnis ausdrücklich**; ein grünes Ergebnis ist
hier der Beleg, kein Versäumnis.

**H5 — F6-2 trägt.** Die Vorschub-Schleife für `belehrungen` auf einen festen
kleinen Betrag zurückdrehen, sodass `belA` unterhalb der Mitarbeiter-IDs
landet. Erwartung: F5-2b fällt mit der neuen belehrungen-Bedingung.

## Abschluss

Volle Suite als `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`,
`npm run lint` wörtlich auch bei Grün, Dateizahl-Ritual mit dem BREITEN Sieb
(`── [A-Za-z0-9_/.-]+\.(js|sh) ──` im Log gegen
`(test_[A-Za-z0-9_]+\.js|ops/boot-smoke\.js|test/[A-Za-z0-9_-]+\.sh)` in
`test/run.sh`, `test/run.sh` selbst herausgestrichen), Marker-Scan mit
`--exclude-dir`, `git status --short`.

**Commit-und-Push nach JEDEM Punkt.** Kein PR — es gibt schon einen.

**Melde die Suite-Lage der Fixturgruppen aus dem vollen Lauf mit** (welche
IDs die vier Gruppen dort bekommen haben). Ich will die Abstände nach der
Änderung sehen, nicht nur ein Grün.

---

# FASSUNG 2 — nach Planprüfung

Die Planprüfung hatte fünf Befunde, **vier davon tragen** (selbst nachgemessen
bzw. nachgerechnet). **Fassung 2 ersetzt Fassung 1 vollständig.**
Einordnung unverändert: **Standard-Executer.**

## Was sich ändert und warum

**(a) F6-1 hätte mehr geschwächt, als ich behauptet habe — der wichtigste
Befund.** Die heutige 15er-Mengenprüfung fängt auch einen Verdrahtungsfehler
INNERHALB einer Gruppe: `const maC = maB;` lässt die Gruppenlänge bei 6, die
Menge schrumpft aber auf 5. Meine Fassung 1 hätte nur Kreuzpaare und
Gruppenlängen geprüft — dieser Fehler wäre durchgegangen, und die angebliche
Prüfung „drittes Fremdstudio" wäre nur eine Wiederholung von Studio B gewesen.
Nachgerechnet: trifft zu.

**(b) F6-2 und F6-3 sind nicht getrennt grün commitfähig.** F6-2 macht den
Belehrungs-Vorschub dynamisch, während die unveränderte F5-2b weiterhin exakt
30 verlangt. Auf frischer Datenbank wären es 26. Der nach Fassung 1 verlangte
Zwischencommit wäre also absichtlich ROT und würde so gepusht.

**(c) Meine Vollständigkeitsbehauptung war wörtlich falsch.** `etageA`, `maA`
und `belA` treten sehr wohl gemeinsam in einer Zusicherung auf — nämlich in
F5-2b. Sie werden dort nicht miteinander VERGLICHEN, es entsteht also kein
zusätzliches nötiges Paar; die Begründung für die Paarliste lautet ab jetzt
aber präzise: **ein Paar ist nötig, wenn eine Kollision eine bewachte
Feldvertauschung VERDECKEN könnte** — nicht schon, wenn beide in derselben
Sammelzusicherung vorkommen.

**(d) Meine Abbruchvorgabe war zweideutig.** „Abbrechen und melden" bei mehr
als 5000 Durchläufen war als Anweisung an DICH gemeint, nicht als Wurf zur
Laufzeit. Ein Wurf würde alle Prüfungen dahinter kosten — genau die Klasse,
die heute früh als F4-N9 behoben wurde.

**Nicht übernommen:** der Befund zu den beiden Abfragen ohne `studio_id`
(dritte Meldung derselben Stelle). Sie haben keine `FROM`-Klausel. Die Ursache
lag in meinem eigenen Prüf-Vorspann, der die Regel ohne diese Einschränkung
zitierte; der Vorspann ist nachgezogen (`tools/gegenleser-vorspann.txt`).

## F6-1 (neu) — Kollisionsprüfung mit ZWEI Ebenen

Eine `ok()`-Zeile, die BEIDES prüft:

**Ebene 1 — je Gruppe:** Länge UND Mengengröße gleich der literal
hingeschriebenen Sollgröße (studios 3, etagen 3, mitarbeiter 6,
belehrungen 3). Die Mengengröße ist der Teil, der Fassung 1 gefehlt hat:
ohne sie überlebt `const maC = maB;`.

**Ebene 2 — nur diese vier Gruppenpaare:**

| Paar | warum nötig |
|---|---|
| studios × etagen | M1 schreibt `[studio_id, etage_id, …]` |
| studios × mitarbeiter | M2 schreibt `[studio_id, mitarbeiter_id, …]` |
| studios × belehrungen | M2 schreibt `[studio_id, …, belehrung_id, …]` |
| mitarbeiter × belehrungen | die Vertauschung, die N2 beim Namen nennt |

**Nicht** geprüft: etagen × mitarbeiter, etagen × belehrungen. Keine
Produktivroute und kein INSERT verbindet diese IDs — die Planprüfung hat das
unabhängig nachverfolgt und bestätigt. Findest du doch eine Stelle: melden.

Die Diagnose nennt bei einem Treffer, welche EBENE gefallen ist, das
Gruppenpaar bzw. die Gruppe, und die kollidierenden Namen samt Werten.

## F6-2 + F6-3 — EIN gemeinsamer Commit, nicht zwei

**Die Regel „Commit-und-Push nach JEDEM Punkt" ist für diese beiden Punkte
ausdrücklich AUFGEHOBEN** — sie gehören in einen Commit, sonst wird ein
absichtlich roter Zwischenstand gepusht. Für F6-1 gilt sie weiter.

**F6-2:** Der Vorschub für `belehrungen` bekommt keinen festen Betrag mehr,
sondern läuft, bis die nächste vergebene ID **grösser ist als die grösste
Mitarbeiter-Fixtur-ID**. `etagen` und `mitarbeiter` behalten 10 bzw. 20.
Miss und melde, ob die Mitarbeiter-Fixturen heute vor den Belehrungs-Fixturen
entstehen; wenn eine Umordnung nötig ist, melde sie ausdrücklich.

**Die Obergrenze ist eine Vorgabe an DICH, nicht an den Test.** Kämst du beim
Implementieren auf mehr als 5000 Durchläufe, stimmt meine Annahme nicht:
**abbrechen und fragen.** Baue KEINEN Laufzeit-Wurf und keinen vorzeitigen
Prozessabbruch in die Testdatei — das würde alle Prüfungen dahinter kosten.

**F6-3:** In F5-2b die belehrungen-Bedingung „genau 30" ersetzen durch
**`belA > <grösste Mitarbeiter-Fixtur-ID>`**, die Unmittelbarkeit
(`belA === letzteWegwerfId + 1`) bleibt. `etagen` und `mitarbeiter` bleiben bei
10 bzw. 20 literal plus Unmittelbarkeit.

Die Mindestprüfzahl bleibt **191** — es kommt keine `ok()`-Zeile dazu. Prüfe
das nach und nenne die Zahl, bevor du den Lauf meldest.

## Gegenproben (Fassung 2) — je einzeln, gegen eine FRISCHE `gymdocu_test`

Verfahren unverändert (cp-Sicherung, Zielpfad als Argument, Fundstellenzählung,
Marker, `node --check`, kein Pipe, Rücknahme per Kopie mit `diff` EXIT 0, nie
`git checkout`/`git stash`, Rücknahme nie mit einem Lauf verketten).

**H1 — die eigentliche Absicherung bleibt.** `ma.id`/`bel.id` im INSERT von
`routes/belehrungen.js:1967` vertauschen. Gemessen auf dem jetzigen Stand:
**EXIT 1, 177 PASS / 14 FAIL**, darunter die N2-Zeile „gespeicherte
belehrung_id korrekt (NICHT vertauscht mit mitarbeiter_id)". **Diese Zeile MUSS
weiterhin fallen.** Sonst: melden, nicht nachbessern.

**H2 — Gruppengrösse.** Eine Gruppe in F6-1 auf einen Eintrag kürzen.
Erwartung: Ebene 1 fällt.

**H2b — NEU, der Befund aus der Planprüfung: längenerhaltendes Duplikat.**
`const maC = maB;` (oder gleichwertig). Die Gruppenlänge bleibt 6, die Menge
wird 5. **Erwartung: Ebene 1 fällt.** Ohne die Mengengrösse würde diese
Mutation überleben — genau deshalb steht sie drin.

**H3 — echte Kollision auf einem NÖTIGEN Paar.** Den Belehrungs-Vorschub so
mutieren, dass `belA === maA`. Erwartung: Ebene 2 fällt und nennt
`mitarbeiter × belehrungen`.

**H4 — Positivkontrolle: Kollision auf einem NICHT geprüften Paar.**
`etageA === belA` herstellen. **Erwartung, präzise: die F6-1-Zeile bleibt GRÜN**
(das ist der Beleg, dass die Einschränkung wirklich greift), **und F5-2b fällt
erwartbar**, weil die Etagen-Vorschubhöhe dann nicht mehr 10 ist — der
Gesamtlauf endet also mit EXIT 1. **Melde beide Teile getrennt.** Wer hier nur
„EXIT 1" meldet, hat die Positivkontrolle nicht durchgeführt.

**H5 — F6-2 trägt.** Den Belehrungs-Vorschub auf einen festen kleinen Betrag
zurückdrehen, sodass `belA` unter den Mitarbeiter-IDs landet. Erwartung: F5-2b
fällt mit der neuen belehrungen-Bedingung.

## Abschluss

Wie in Fassung 1: volle Suite ohne Pipe mit eigenem `echo "SUITE_EXIT=$?"`,
`npm run lint` wörtlich auch bei Grün, Dateizahl-Ritual mit dem BREITEN Sieb,
Marker-Scan mit `--exclude-dir`, `git status --short`. Kein PR.

**Melde die Fixturlage der vier Gruppen aus dem VOLLEN Lauf mit** — welche IDs
sie dort bekommen haben. Ich will die Abstände nach der Änderung sehen, nicht
nur ein Grün.
