# STAND — Übergabepunkt

Stand: 22.09.2026, 23:4x UTC.

## Was gerade LÄUFT

**Ein Executer baut die FÜNFTE Runde des Ladebestand-Beitrags**
(Arbeitsbaum `/home/user/gymdocu`, Zweig `beitrag-ladebestand`, Kopf `3a7cad5`).
**Nicht in diesen Arbeitsbaum hineinarbeiten, solange seine Benachrichtigung
nicht da ist** — und eine Benachrichtigung gilt nur, bis er per SendMessage
fortgesetzt wird.

Der Auftrag steht vollständig in
`plaene/auftrag-ladebestand-nacharbeit.md`, Abschnitt
„# DER BAUAUFTRAG DER FÜNFTEN RUNDE" (Dateiende), die Begründung je Punkt im
Abschnitt davor („# DIFFPRÜFUNG DER VIERTEN RUNDE").

## Wo der Beitrag steht

**Die vierte Runde ist gebaut, geprüft, committet und gepusht** (`3a7cad5`).
Sie schliesst R1–R6: Verhaltensprobe für die Feuerlöscher-Ablösung,
Titel-Wortlaut, `r.clone()`, Bereichs-Riegel auf den Bezeichner `db`,
Kommentarbereinigung, und das wertgleiche Notiz-UPDATE zählt nicht mehr mit.

Eigene Messungen dazu, alle wörtlich im Auftragspapier:
* volle Suite **SUITE_EXIT=0**, zweimal gefahren
* Dateizahl-Ritual **350 = 350, `diff` EXIT 0** — beim zweiten Mal mit einem
  Sieb, das die TESTS-Liste direkt aus `test/run.sh` schneidet und damit die
  NAMENSKONVENTION gar nicht mitmisst
* `npm run lint` **EXIT 0**, keine Ausgabe ausser dem npm-Banner
* neun Gegenproben, jede mit Mutation und Rücknahme (`diff` EXIT 0)

**Dann fand die Diffprüfung elf plus vier Befunde** — deshalb die fünfte
Runde. Die zwei blockierenden:
1. Die Musterverschärfung hat die `.query(`-Abdeckung VERLOREN, während die
   Erfolgsmeldung sie weiter behauptete. Gemessen: Umgehung über einen
   `pool`-Alias ausserhalb des Bereichs, **EXIT 0, 25 PASS / 0 FAIL**.
2. Die neue Kommentarbereinigung schneidet an einem `//` INNERHALB einer
   Zeichenkette ab und lässt ein `db` dahinter verschwinden — sie hat also
   ein neues Loch in genau den Riegel gerissen, den sie schützen sollte.

## Was ausdrücklich NICHT gebaut wird

* **Die WHERE-Form statt der CTE** (Befund C5). Er TRÄGT — gegen PostgreSQL 16
  gemessen, gleiche Fallmatrix und gleiches Ergebnis im Nebenläufigkeitsfall,
  ohne `FOR UPDATE`. Abgelehnt, weil er den CASE-Ausdruck zweimal hinschreibt
  und damit „Dieselbe Aussage an zwei Orten" einführt, in der Variante, die
  sich nicht auflösen lässt. Stattdessen bekommt `FOR UPDATE` eine statische
  Zusicherung. Die volle Abwägung steht im Auftragspapier.
* **Den Schleifenrumpf in eine Funktion ohne `db` im Gültigkeitsbereich
  ziehen** (Befund C11). Richtig und ein Umbau weit über diesen Beitrag
  hinaus. Datierter offener Punkt.

## Offen, nach dem Beitrag

1. **S6** — Aktenlage in `plaene/auftrag-s6-token-einloesen.md`, Empfehlung
   Generationszähler. Noch KEIN Bauauftrag.
2. **Mehr-Anbieter-Lesewerkzeuge für `tools/gegenleser-repo.js`** — vom
   Betreiber gewollt („könnte kimi und deepseak auch direkt nachsehen?"),
   ausdrücklich NACH den laufenden Beiträgen.
3. **Pentest-Vorbereitung:** U-IDW1, U-TOK1, U-LOCK1/U-AUDT1, U-VORL1,
   U-STAT1/U-STAT2.

## Zwei Dinge, die im Takt-Prompt veraltet sind

* Sein Sollwert für den Marker-Scan im **Belehrungssystem-Repo („2")** stimmt
  nicht mehr und kann es nicht: der Scan zählt dort mit, wie oft wir über ihn
  SCHREIBEN. Maßgeblich ist die Bedingung aus CLAUDE.md — jeder Treffer ist
  Prosa, keiner steht in ausführbarem Code.
* Sein Dateizahl-Muster filtert die REGISTRIERTE Seite auf `test_…` und misst
  damit die Namenskonvention mit. Besser ist, die `TESTS=(…)`-Liste direkt aus
  `test/run.sh` zu schneiden — dann gibt es auf dieser Seite gar kein Muster.

## Was gemessen und KEIN Defekt ist

`Studio-Wächter: NICHT GEPRÜFT (Messung fehlgeschlagen)` in der Schlusszeile
der Suite: die Entwicklungs-DB `gymdocu` existiert in diesem Container nicht
(nachgemessen: `database "gymdocu" does not exist`). Der Wächter fällt korrekt
„nicht geprüft" aus statt falsch grün. Nicht neu untersuchen.
