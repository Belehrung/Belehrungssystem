# Stand — 16.09.2026, ~00:00 UTC

Diese Datei ist der Übergabepunkt. Der Takt-Prompt ist beim Bau von
Beitrag 1 stehengeblieben und verweist für den Plan noch auf den
Scratchpad — der ist weg, sobald der Container neu startet. **Hier steht,
was wirklich gilt.**

## Erledigt — Beitrag 1 ist gemergt

**PR #446, Squash `186c0aa`**, „Eine Freigabe wird nur gemeldet und
protokolliert, wenn sie stattgefunden hat". Drei Fehler behoben, die
vorher schon falsch waren:

- ein `reparatur_freigabe`/`seilkontrolle_freigabe`-Audit für ein UPDATE,
  das keine Zeile getroffen hat,
- die Tablet-Meldung „Das reparierte Gerät darf wieder genutzt werden" bei
  einer wirkungslosen Absendung,
- eine unwiderrufliche Fotolöschung innerhalb eines rollbaren Vorgangs.

Dazu ein eigener, nachgelagerter Löschnachweis `seil_fotos_geloescht`, der
Datei-Erfolge, „war bereits weg" und Fehlschläge getrennt beurkundet und
nur nennt, was er selbst gemessen hat.

Fünf Runden, vier Prüfspuren (eigene Lesung, Gegenlesung, Review-Bot, CI).
Der Bot ging von 4/5 auf 5/5; alle Befunde wurden nachgemessen, keiner
blind übernommen. Zwei Befunde betrafen Regressionen der Behebung selbst
(ein Verklemmungs-Kreis, ein verschwundener Löschnachweis), einer eine
Sandbox-Eigenschaft, die als allgemeingültige Tatsache festgeschrieben war
und deshalb erst in der CI aufflog.

**Noch zu tun nach dem Merge:** Deploy-Lauf prüfen (`actions_list` auf
`deploy.yml`, richtiger `head_sha`, `success`) und
`bash tools/live-check.sh`.

## Läuft gerade — Beitrag 2 ist GETEILT

**2a („Ein ausgemusterter Mangel wird überall RICHTIG GELESEN") ist gebaut,
gepusht und durchgeprüft; die Nacharbeit aus zwei Prüfspuren läuft.**

Zweig `claude/ausmusterung-darstellen-und-lesen`, 18 Dateien, +1122/−30:
Migration 0057 (CHECK-Erweiterung auf `ausgemustert`, sechs neue
Zeitstempel-Spalten), `core/retention.js` (COALESCE auf beiden
Fristspalten), `core/wiederholung.js`, `core/pdf-engine.js` (beide Anhänge,
beide Zeitraumfilter), `routes/admin/geraete.js`, `routes/sichtpruefung.js`
(„Bereits ausgemustert"-Karte), sechs neue Testdateien, drei bestehende
Deploy-Gates fachlich umgestellt.

**Eigener Prüfgang durch:** Diff Datei für Datei gelesen; volle Suite zweimal
`SUITE_EXIT=0`, 0 FAIL; Dateizahl-Ritual 322 = 322, `diff` EXIT 0;
`npm run lint` EXIT 0; Marker-Scan 6 (Sollwert). Alle fünf Gegenproben des
Ausführenden nachgesehen — alle substanziell.

**Zwei eigene Befunde, bereits behoben und gepusht** (Commit f190a3a,
Einzelheiten in `plaene/2a-eigene-befunde.md`): eine
Mandantentrennungs-Zusicherung, die nicht rot werden konnte, und die
Zeitzonenfalle aus #432 in einer neuen Testdatei. Beide in beide Richtungen
gemessen.

**Zwei unabhängige Prüfspuren gefahren** (`/code-review` und Astra, Lauf in
`ASTRA-LAEUFE.md`): 9 Astra-Befunde (7 getragen, 2 in der Schwere gefallen),
12 aus der Claude-Spur. Beide fanden unabhängig denselben schwersten Befund —
der Migrationstest prüft den Schema-Umbau gar nicht, weil `db.init()` sein
Ergebnis schon hergestellt hat. Selbst gemessen: den GANZEN DO-Block entfernt,
beide Schema-Tests bleiben grün (13/0 bzw. 34/0).

**Runde 2 (elf Befunde) ist gebaut, geprüft und gepusht** (cd52422): Migrations-
Pfad-Test gegen eine literal nachgebaute Vor-0057-Fassung, drei neue
Kopplungs-CHECKs, Fixturen mit unterscheidbaren Zahlen, Mandantentrennung
auch für Trockenlauf und Löschlauf, Fristbeginn belegt, Zeitzonen über
`core/datum.js`, ausgemusterte Vorbefunde in Defekt-Mail und Tablet-Hinweis,
HTML-Kommentar aus dem `.map()`, Anzeigefeld für die Aufbewahrung, gemeinsames
Textmodul `core/ausmusterung-hinweis.js`. Suite `SUITE_EXIT=0`, 322 = 322,
Lint 0, Marker 6 — alles von mir selbst gefahren.

**Zweite Gegenlesung gefahren** (Pflicht, weil Runde 2 VERHALTEN geändert hat):
6 Befunde, 5 getragen, 0 gefallen. Zwei davon habe ich selbst am echten
PostgreSQL gemessen:

- **Die drei NEUEN Kopplungsregeln sind auf dem Bestandsdatenbank-Pfad
  unbewacht.** Alle drei CHECK-Ausdrücke NUR in der Migration auf
  `CHECK (TRUE)`, `core/db.js` unverändert → `test_feature_ausmusterung_migration.js`
  **EXIT 0, 30 PASS / 0 FAIL**. Dieselbe Verdeckung wie beim Status-Umbau, eine
  Ebene tiefer.
- **Eine der Regeln erzwingt wegen SQL-NULL gar nichts.** `geraete_sperren.aktiv`
  ist nullable; bei `aktiv=NULL` ergibt der CHECK NULL statt FALSE. Gemessen mit
  Positivkontrolle: `aktiv=NULL` + Zeitstempel **ANGENOMMEN**, `aktiv=1` +
  Zeitstempel **abgelehnt 23514**. Dieselbe Klasse ein drittes Mal bei
  `ausgemustert_am = ''` (ebenfalls ANGENOMMEN). Folge: solche Zeilen fallen aus
  der Aufbewahrung — genau die Halde, die die Migration verhindern soll.

**Runde 3 läuft** (`/tmp/claude-0/pruef/auftrag-2a-runde3.md`, Punkte A–G):
NULL-sichere und nichtleere Kopplungsregeln, die drei Regeln im
Migrations-Pfad-Test zusichern (mit `e.constraint`-Namen), exakte
Protokollmenge beim Markieren, Statistik-Zusicherung auf die richtige
Tabellenzeile isolieren, Verletzerdiagnose-Behauptung messen statt behaupten,
dazu zwei eigene Kleinbefunde (verfallendes Diagnose-Argument, doppelter Satz
auf der Ausmusterungs-Karte).

**Danach erst:** PR, CI, Bot-Kommentare VOR den Check-Runs, Merge, Deploy,
live-check. Regel 6a gilt — keine PR-Nummer an den Betreiber, bevor das
alles durch ist.

**2b ist noch nicht begonnen.** Der Auftragsentwurf liegt als
`plaene/auftrag-2b-entwurf.md`; alle von 2a abhängigen Stellen sind dort mit
`@@2a@@` markiert und vor dem Absenden neu zu messen.

## Danach

**Beitrag 2 — die Ausmusterung.** Der Plan liegt jetzt im Repo:
`plaene/ausmusterung-plan-v4.md`, dazu `plaene/ausmusterung-eigene-
nachtraege.md`. Zweimal gegengelesen, 18 Befunde, alle selbst nachgemessen,
alle getragen. Nicht neu planen — umsetzen.

Die drei Entscheidungen des Betreibers stehen im Takt-Prompt und in v4.
Der Bestätigungsschritt wird gebaut; die Rückfrage dazu ist nicht mehr
offen (Begründung in v4, Abschnitt 0).

## Notiert, aber ausdrücklich NICHT gebaut

- **`UPDATE … RETURNING` im Aufbewahrungs-Schreibweg.** Das Markier-/Lösch-
  Protokoll wird aus ALLEN SELECT-Zeilen gefüllt, nicht aus den tatsächlich
  getroffenen; die gemeldete Anzahl kommt aus `rows.length`. Im unveränderten
  Code kein Übergriff (beide Seiten tragen denselben Filter), aber der Nachweis
  ist ein Selbstbericht. Gehört nicht in dieselbe Runde wie drei neue
  Schema-Regeln — eigener Auftrag.
- **Historische Monatsnachweise verlieren später geschlossene Mängel.** Ein
  Mangel, der VOR dem Berichtszeitraum entstand und NACH ihm geschlossen wurde,
  fehlt im Nachweis dazwischen, obwohl er durchgehend offen war. Gilt bei
  REPARIERTEN Mängeln schon heute; Aufrufweg ist die Neuerstellung alter
  Monats-PDFs in `routes/archiv.js`. Verändert bestehende Nachweisdokumente —
  eigener Auftrag.
- **Aufrüstungs-/Zweitboot-Test.** Der Migrations-Pfad-Test deckt
  „Altschema → 0057 → 0057" ab, nicht „Bestand → neues `init()` → Migrationen →
  zweites `init()`". Berechtigt, aber eigener Auftrag — und er darf den direkten
  Migrationstest NICHT ersetzen, sonst verdeckt `init()` wieder, was die
  Migration tut.
- **Zentrale `DEFECT_PHOTO_DIR`-Umleitung in `test/run.sh`.** 21 bestehende
  Testdateien laden `routes/sichtpruefung.js` ohne diese Variable — Eigenschaft
  der Suite, kein Fehler eines einzelnen Beitrags.
- **Der stündliche Takt-Prompt ist eine 8k-Token-Kopie der CLAUDE.md** und wird
  jede Stunde neu gelesen. Er sagt selbst, dass eine Kopie driftet. Nach dem
  Merge auf die Teile eindampfen, die NICHT in der CLAUDE.md stehen — vorher
  aber sauber abgleichen, damit keine Regel verlorengeht.


- Drei weitere Fundstellen derselben Klasse wie Beitrag 1: die
  Seil-Verschärfung im Tagescheck (`routes/module.js:2911-2946`), die
  Rücknahme einer Einweisung (`routes/belehrungen.js:1409-1413`), die
  Lageplan-Markierung (`routes/lageplan.js:464-468`). Eigener Beitrag.
- Der Verklemmungs-Kreis um `auditAppend()` (CLAUDE.md, Abschnitt
  „Transaktionen und Sperren"). Eigener Auftrag, nur hergeleitet, nie
  beobachtet.
- `geraete_bekannt` schlägt ausgemusterte Gerätenamen weiter vor;
  Wartungsgeräte haben womöglich dieselbe Sackgasse. Beides eigene
  Aufträge, Begründung in v4 Abschnitt 2.7.
- Der kleine Folgebeitrag aus der Bot-Prüfung zu #444.
