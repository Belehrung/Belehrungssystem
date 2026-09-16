# Stand — 16.09.2026, ~01:40 UTC

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

## Erledigt — Beitrag 2a ist gemergt und ausgeliefert

**PR #447, Squash `613a2c9`, Deploy 415 `success`, live-check grün.**
„Ausmusterung mit offenem Mangel (Teil 2a): Datenmodell und alle Leser".

Migration 0057 (status-CHECK um `ausgemustert` erweitert, eigene Zeitstempel
je Tabelle, drei Kopplungsregeln), dazu alle Leser: beide PDF-Anhänge, beide
Zeitraumfilter, Aufbewahrung, Ausfallzeit, Statistik, Reparaturformular,
Defekt-Mail und Tablet-Hinweis. Sechs neue Testdateien, vier bestehende
Wächter fachlich umgestellt, ein gemeinsames Textmodul
`core/ausmusterung-hinweis.js`.

**Drei Bau-Runden, zwei Gegenlesungen, zwei Prüfspuren.** Die drei teuersten
Funde waren allesamt Zusicherungen, die nicht rot werden konnten — und zwei
davon fand erst die ZWEITE Gegenlesung, die es nach unserer Rundenregel fast
nie gibt:

- Der Migrationstest prüfte den Schema-Umbau gar nicht (`db.init()` stellt sein
  Ergebnis her, die Migration nimmt den frühen Ausstieg). Gemessen: gesamter
  Umbau-Block entfernt → beide Schema-Tests grün. Danach prüfte der neue
  Abschnitt die drei NEUEN Kopplungsregeln immer noch nicht — gemessen: alle
  drei auf `CHECK (TRUE)` → 30 PASS / 0 FAIL.
- Eine der neuen Regeln erzwang wegen SQL-NULL nichts (`aktiv` ist nullable,
  `aktiv = 0` ergibt bei NULL weder wahr noch falsch). Gemessen mit
  Positivkontrolle. Dieselbe Lücke beim leeren Zeitstempel.
- Die Mandantentrennungs-Zusicherung der Aufbewahrung war tautologisch und
  deckte danach nur eine von drei Stufen ab.

**Abschließend selbst gemessen** (neun Proben, neun wie erwartet): beide
Lücken zu, bestehende Reparatur- und Freigabewege brechen nicht, der für 2b
geplante Schreibweg geht durch — auch für ein bereits inaktives Gerät.

## Als Nächstes — Beitrag 2b

Der Auftragsentwurf liegt als `plaene/auftrag-2b-entwurf.md`. **Alle mit
`@@2a@@` markierten Stellen sind jetzt auflösbar und VOR dem Absenden neu zu
messen** — Zeilennummern haben sich durch 2a verschoben.

Was 2b baut: Bestätigungsseite mit drei Blöcken, serverseitiger Schnappschuss
mit Inhalts-Fingerabdruck, beide Ausmusterungsrouten, Auswahl ⊆ zulässige
Kandidaten (serverseitig UND in der Transaktion), Reaktivierungssperre an der
ROUTE, Rückweg „Offene Mängel abschliessen" für JEDES inaktive Gerät mit
offenen Mängeln, Kopfkommentar `routes/admin/geraete-typen.js`, zwei
bestehende Deploy-Gates.

**Von der Gegenlesung für 2b bestätigt:** die drei neuen Kopplungsregeln
verbauen den geplanten Weg nicht, solange `status`/`ausgemustert_am` bzw.
`aktiv=0`/`ausgemustert_am` im SELBEN UPDATE gesetzt werden (CHECKs greifen
sofort, nicht erst beim Commit) und beide UPDATEs auf derselben
Transaktionsverbindung laufen.

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
