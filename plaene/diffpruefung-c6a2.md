# Diffprüfung C6-A2 (Monatssperre und Archivversionen), Stand `4e10eba`

## Eigene Prüfung

Selbst gelesen: `core/archiv-version.js` vollständig, `generateMonthlyPDFs.js#mitMonatsLock`, die Diffs in `core/retention.js`, `core/datei-loeschqueue.js` und `core/db.js`.

- Einziger Schreiber von `pdf_archiv` ist jetzt der Tausch, gemessen per grep. Ausnahmen sind `UPDATE mail_gesendet`, `pdf-loeschung` (`datei_geloescht`) und `ops/seed-performance-data.js`.
- Die Pfadsperre ist je Datei transaktional und wird sortiert genommen. Der Verarbeiter hält genau eine.
- Den Studio-Lock nimmt der neue Weg nicht.
- Die Queue-Auswahl mit `ids` trägt `studio_id`.
- Der Verarbeiter löscht die Datei vor dem COMMIT. Das ist hier tragbar: Die Referenzprüfung steht unter der Pfadsperre, neue Zeilen tragen zufällige neue Pfade, und ein Rollback lässt nur den Queue-Eintrag stehen. Der nächste Lauf meldet dann „fehlend“ und schliesst ihn.

**Laut Bericht:** Suite 488 = 488, Lint sauber, 53 Mutationen, alle rot.

## Lesespuren flash

Zwei Lesespuren mit verschiedenen Bündeln: Produktion (P) und Tests (T).

| Nr | Spur | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|---|
| P-A | P | sollte | Die Anweisungen der Tauschtransaktion auf der Sperrverbindung (`BEGIN`, DML, `COMMIT`) haben kein Zeitlimit. Nur Sperre und Unlock sind begrenzt. Ein hängendes `COMMIT` hält `monthly_pdfs:<studio>` bis zum Prozessende, und jede weitere Erzeugung endet in 409. Der Kommentar `generateMonthlyPDFs.js:210-214` behauptet mehr. | trägt (gelesen: `t.q`/`one`/`run` rufen `lockClient.query` ohne `query_timeout`) | N1 |
| P-B | P | Anm. | Scheitert das Nachlegen des Ankers bei Pfadabweichung (best effort), liegt die Datei ohne Anker da. | trägt (eng) | Sammelliste (Waisen-Scanner, C6C-g1/g2) |
| T-B1 | T | sollte | `test_feature_archiv_monatsende.js` leitet `PDF_ROOT` nicht selbst um und prüft die DB nicht. Seit C6-A2 legt er Anker an und arbeitet die Queue ab. In der Suite schützt `test/umgebung.sh`, im Einzellauf nichts. | trägt (grep: kein `PDF_ROOT` im Kopf) | N1 |
| T-B2 | T | sollte | `test_feature_c6a2_offboarding.js` prüft die DB nicht und hat keinen Wachhund, ruft aber `deprovisionStudio()`. | trägt | N1 |
| T-B3 | T | Anm. | `barriere.js:107` belegt die Barriere, nicht die Referenzprüfung (der Eintrag ist zu dem Zeitpunkt schon „weg“). Bewacht wird die Referenzprüfung in `archivversion.js:236-249`. | trägt | N1: Text berichtigen |
| T-B4 | T | Anm. | `neu_single_atomar.js:135` prüft das Fehlen einer Meldekennung, die es nirgends mehr gibt. | trägt | N1: streichen oder umformulieren |
| T-B5 | T | Anm. | `routen.js:265` behauptet „Datei liegt verwaist da“, prüft aber nur den Anker. | trägt | N1: `existsSync` ergänzen |
| T-B6 | T | Anm. | Für mehrere Zustände gibt es keine Fixtur: Sperrverbindung stirbt zwischen `BEGIN` und `COMMIT` (Kennzeichen ungewisser Commit), fehlender Vorab-Anker beim Tausch, scheiterndes unlink im Verarbeiter. | trägt | N1 |

## Nacharbeit 1 (`726945f`, mit master `749f2d2` zusammengeführt)

**Eigene Lesung:** `generateMonthlyPDFs.js`.
- Jede Anweisung der Tauschtransaktion hat eine Frist (30 s). Bei Ablauf wird der Socket zerstört, der Fehler läuft zu `MONATSLOCK_VERLOREN`, und `commitUngewiss` steht nur, wenn das COMMIT schon gesendet war.
- **Messbefund des Bauenden, der die Prämisse meines Auftrags widerlegt:** Ein zerstörter Socket beendet ein Backend nicht, das an einer Sperre wartet (gemessen: 3 s danach „active / Lock“, die Monatssperre blieb gehalten). Behoben mit `SET client_connection_check_interval = '1s'` auf der Sperrverbindung (PG ≥ 14).

**Laut Bericht:**
- Suite 494 = 494, Lint sauber.
- 8 neue Gegenproben rot. M57 (ROLLBACK-Schutz) blieb grün und wurde deshalb entfernt.
- Die neuen Tests hängen am Helfer `wegwerf-db`.

**Zweite Lesespur flash** (Behebung ändert Verhalten):

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| N1-B1 | sollte | Nach eigener Zerstörung entfällt das Unlock, `end()` auf demselben Socket läuft aber weiter (Frist 5 s, Meldung `verbindung_schliessen_fehlgeschlagen` möglich). Test 8 prüft diese Quelle nicht. | trägt (gelesen, Laufzeitverhalten von pg offen) | N2 |
| N1-B2 | sollte | Das ROLLBACK nach dem Zeitlimit bekommt wieder die volle Frist. Der Kommentar nennt eine Messung, die der Test mit `< Frist + 7000` nicht belegen kann. | trägt | N2: kein ROLLBACK auf selbst zerstörter Sitzung, Test enger |
| N1-B3 | Anm. | Der Timer in `txAbfrage` hat kein `unref`, und ein synchroner Wurf von `query()` lässt ihn stehen. | trägt | N2 |
| N1-B4 | Anm. | Die Zusicherung „30 s = Dreifaches des Löschlimits“ prüft nur ein Literal gegen ein Literal. | trägt | N2: an `core/datei-entfernen.js` koppeln |
| N1-B5 | Anm. | „Socket zerstören = Sperre frei“ gilt nur, solange das Backend wartet, nicht mitten in einer langen Anweisung (fsync). Eine gesunde, aber langsame Anweisung > 30 s gilt als VERLOREN. | trägt | N2: Kommentar einschränken; Grenze auf die Sammelliste |
