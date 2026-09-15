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

**Der Nacharbeits-Auftrag läuft** (`/tmp/claude-0/pruef/auftrag-2a-nacharbeit.md`,
elf Punkte A–K): Migrationstest gegen eine unabhängig definierte
Vor-0057-Tabelle; Schema-Kopplung von `status='ausgemustert'` an den
Zeitstempel (schließt zugleich zwei PDF-Reihenfolgeprobleme als unmögliche
Zustände); Fixturen mit unterscheidbaren Zahlen statt dreier Bedeutungen auf
derselben; Mandantentrennung auch für Trockenlauf und Löschlauf; Fristbeginn
wirklich belegen; Zeitzonenfalle im Retention-Test; ausgemusterte Vorbefunde
in Defekt-Mail und Tablet-Hinweis; HTML-Kommentar aus dem `.map()`;
Anzeigefeld für die Aufbewahrungs-Oberfläche; Satz-Konstante statt drei
Kopien; Temp-Verzeichnis aufräumen; Studio-Kürzel-Helfer.

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
