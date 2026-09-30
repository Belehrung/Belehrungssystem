# Auftrag C5-F — CI-Workflows, Deploy-Gate-Tests, Kommentare (Extrarunde)

Fassung 2, 30.09.2026 (Planprüfung flash + kimi, `scratchpad/c5plan/dicht/*c5f*`). Repo GymDocu, Stand `origin/master`. Die Fundorte stehen in `plaene/c5-zustand-30-09.md`
(Abschnitt `b6`). Jede Fundstelle ist vor dem Bau neu zu messen.

Modell: Standard-Executer.

**Nicht hier:**
- H1a-S1/S2/S3/S5 kommen in den H1-Beitrag (CSP scharf, frühestens 02.10.2026).
- H2-D8 und P2-S1 sind Server-Schritte des Betreibers.
- DEP-3, B1 und V1 sind entschieden (`c5-entscheidungen.md`).
- DEP-1 und V01-5/V01-11 stehen in C5-G.

## Punkte

1. **GH-S4** `.github/workflows/ci.yml:64/216`, `deploy.yml`:
   - (a) Container-Images (Postgres-Dienst u. a.) per Digest festnageln, mit Tag und Quelle als Kommentar. Den Digest
     über die Registry holen (curl gegen `registry-1.docker.io` bzw. die Quelle, die das Image nennt); lässt er sich
     aus dieser Umgebung nicht holen, wird das gemeldet, nicht geraten.
   - (b) `concurrency` für `deploy.yml` mit `cancel-in-progress: false` (ein Deploy wird nie abgeschnitten); für die
     Hinweis-Workflows `cancel-in-progress: true`.
   - (c) `environment: production` NICHT setzen: das braucht eine GitHub-Umgebung, die nur der Betreiber anlegen kann.
     Als offener Betreiberpunkt in die Sammelliste.
   - `test_feature_ci_gates.js` bzw. `test_feature_deploy_gate_static.js` sichern (a) und (b) zu.
2. **GH-S7** `.github/workflows/gitleaks-hinweis.yml`: zusätzlich einen Scan des Kopfstands (`gitleaks dir` oder
   gleichwertig). Messen, ob der Kopfstand heute Altfunde meldet. Falls ja, wird der Schritt als HINWEIS (nicht als
   Gate) geführt und die Funde kommen in den Bericht; es wird nicht still gefiltert.
3. **GH-S8:** Die Köpfe von `test_feature_semgrep_hinweis.js` und `test_feature_gitleaks_hinweis.js` sagen: „läuft als
   CI-Prüfschritt (`npm test`); auf dem Server NICHT“.
4. **GH-S5** `docs/PERFORMANCE_TESTS.md:73-86`: Beispiel auf Commit-Kennung plus `# v6` umstellen.
5. **DEP-2:** Kommentare in `test/helfer/netz-sperre.js:41` und `test_feature_netzsperre.js:237-238` bekommen einen
   Funktions- bzw. Pfadanker statt einer Zeilennummer.
6. **D-B5** `test_feature_deploy_gate_static.js:646-655`: Die beiden dominierten `doesNotMatch` bleiben als Doku, mit
   Kommentar „dominiert von …, nur Dokumentation“. Gestrichen wird nichts.
7. **D-B7** `test_feature_deploy_gate_static.js:321`: Untergrenze der `uses:`-Zeilen JE Datei, als Literal aus der
   heutigen Zählung (ci.yml heute 10). Den Kommentar `:315-318` berichtigen. Gegenprobe: eine Zeile entfernen ⇒ ROT.
8. **R2-N** `test_feature_legionellen.js:334-335` in Verbindung mit `test/run.sh` (Re-Run von 0013 nach Bestandsdaten):
   Messen, welche Reihenfolge das Problem erzeugt. Danach beheben, OHNE die Bestandsprobe zu verlieren: der Re-Run
   läuft gegen einen definierten Zustand, oder die störenden Zeilen räumt der Test, der sie anlegt.
9. **GH-S3:** Beobachtungspunkt; festhalten, ob inzwischen ein Actions-Dependabot-PR kam (`list_pull_requests`
   mit Autor `dependabot`). Kein Code.
10. **GH-S6:** gehört ins Hauptserver-Repo (`/home/user/gymdocu-hauptserver`). Die dortige Entsprechung von GH-S4
    (b) wird gemessen und im Bericht als Vorschlag geführt, NICHT gebaut.
11. **DEP-5:** Prozessregel „kein amend, kein Force-Push auf fremde Zweige“. Nur als Satz in `docs/CI.md`, falls dort
    noch nicht vorhanden.

## Fassung 2 — verbindlich (geht dem Text oben vor)

**GH-S4:**
- **(a) Digest-Pin entfällt vorerst.** Kein Aktualisierer pflegt `image:`-Digests in Workflow-Diensten; Dependabot
  betreut nur npm und github-actions (`.github/dependabot.yml:26-52`). Ein Pin würde still veralten. Das geht als
  Betreiberentscheidung in die nächste Vorlage und wird NICHT gebaut.
- **(b) `concurrency` für `deploy.yml`:** Gruppe `deploy-production`, `cancel-in-progress: false`. Richtig formuliert:
  ein LAUFENDER Deploy wird nie abgebrochen, wartende können vom neueren ersetzt werden.
  - Hinweis-Workflows bekommen `cancel-in-progress: true`, Gruppe je Workflow und Ref.
  - Heute sichert nur `test_feature_ci_gates.js:36` `concurrency` zu, und das nur für `ci.yml`. Neue Zusicherungen
    prüfen je Datei Gruppenschlüssel UND `cancel-in-progress`-Wert. Gegenprobe je Datei.

**GH-S7:**
- Der gitleaks-Wächter (`test_feature_gitleaks_hinweis.js:521-640`) legt die Schrittzahl und die Werkzeuge fest.
  Deshalb KEINE Workflow-Änderung.
- Stattdessen messen, welchen Bereich der Hinweis-Workflow scannt (nur neue Commits oder alles).
- Ist er bereichsbeschränkt: einmaliger vollständiger Historien-Scan lokal (falls `gitleaks` installiert ist, sonst
  „nicht messbar“ melden) und das Ergebnis in den Bericht. Ein Kopfstand-Scan ist sonst entbehrlich: jede
  versionierte Datei steht in einem Commit.

**GH-S8:**
- Der im Papier zitierte Satz existiert nicht; die Köpfe sagen heute das Gegenteil. Belegbar ist nur:
  - `ops/deploy.sh` (GitHub-Deploy) ruft `test/run.sh` NICHT auf;
  - der Hand-Deploy `gymdocu-deploy` auf dem Server fährt die Suite als Gate; das ist aus dem Repo nicht belegbar
    (CLAUDE.md).
- Wortlaut genau darauf eingrenzen.
- Vorher ALLE Testköpfe mit der falschen Wendung suchen (z. B. `test_feature_suite_laufsperre.js:35`) und alle
  berichtigen, mit Fundliste im Bericht.

**GH-S5:** Im Beispiel Kennung plus `# v6` UND `persist-credentials: false`. Ein kleiner Doku-Wächter verbietet
schwebende Tags in `uses:`-Zeilen von `docs/*.md`, mit Gegenprobe.

**DEP-2:** auch `test/helfer/netz-sperre.js:115-116` und die weiteren Zeilenanker derselben Art. Anker auf
`node_modules` sind nur nach `npm ci` prüfbar; das steht im Kommentar.

**D-B5:**
- Die dominierten `doesNotMatch` bekommen einen Kommentar, der den dominierenden Vergleich nennt.
- Die Muster werden case-insensitiv (`/i`), weil OpenSSH-Optionsnamen es sind. Gegenprobe: eine kleingeschriebene
  Option in einer Fixtur ⇒ ROT.

**D-B7:**
- Die Schleife zählt ALLE Workflows (heute 14 `uses:` gesamt). Untergrenze JE DATEI, mit Polster: dem heutigen Wert
  minus 2, aber mindestens 1.
- Die Regel „beim Entfernen senken, begründet“ gehört in den Kommentar.
- Den Kommentarbereich `:315-320` berichtigen.
- Gegenprobe: drei `uses:` aus `ci.yml` entfernen ⇒ ROT.

**R2-N:**
- Zuerst die auslösende Reihenfolge messen: welcher Test legt die Zeilen an, deren Werte die enge CHECK-Liste von
  0013 verletzen.
- Der Testkopf `test_feature_legionellen.js:315` („reihenfolgeunabhängig“) wird auf die tatsächliche Garantie
  berichtigt.
- Der Zeilenendzustand der geteilten Test-DB nach dem Aufräumen wird gemessen und steht im Bericht.

**GH-S3:** Messung über Autor `dependabot[bot]` ODER Zweigpräfix `dependabot/`. Die Methode steht im Bericht.

**DEP-5:** Der Satz betrifft fremde Zweige. Die bestehende master-Regel (`docs/CI.md:16/54`) wird nicht doppelt
formuliert.

## Regeln

- Arbeitsbaum `/workspace/gymdocu-c5f` (Zweig `c5f-ci-doku`, von `origin/master`).
- Einzeltests gegen `gymdocu_c5f_test`, NIE gegen `gymdocu_test`. Lock nie löschen. KEINE Migration.
- Volle Suite: Aufruf `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`, dazu Dateizahl-Ritual und Lint
  wörtlich. Jede neue Zusicherung mit Gegenprobe.
- Workflow-Änderungen wirken erst auf GitHub. Lokal wird gegen die YAML geprüft (vorhandene Wächter), und im
  Bericht steht, was erst die CI belegt.
- Committen und pushen vor langem Warten. Kein PR. Bericht je Punkt.
