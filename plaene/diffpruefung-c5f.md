# Diffprüfung C5-F — CI-Workflows, Deploy-Gate-Tests, Kommentare

Stand 30.09.2026. Zweig `c5f-ci-doku`, Commit `3be1a39`. Der Bau meldet: Suite `SUITE_EXIT=0`, 413 = 413, Lint EXIT 0.

Selbst gelesen:
- Diff der Workflows, der Doku, von `test_feature_deploy_gate_static.js` und `test_feature_legionellen.js`.
- Alle übrigen 58 Dateien ändern nur Kommentarzeilen. Gemessen: `git diff -U0` ohne diese Dateien, jede geänderte Zeile beginnt mit `//`, `*`, `/*` oder `#`, und es gibt 0 Ausnahmen.
- Kein Fremdschlüssel verweist auf `pruefbereich_bestand`. Das Parken reisst also nichts mit.

## Entscheidungen zu den Rückfragen des Baus

- Deploy-Gruppe am JOB: angenommen. Die Begründung trägt (Workflow startet auch bei roter CI).
- `gitleaks-hinweis.yml` bekommt nur `concurrency`: angenommen. Fassung 2 verbietet Schritt- und Werkzeugänderungen, nicht `concurrency`.
- `deploy.yml` mit Untergrenze 0: angenommen. Die Vorgabe „mindestens 1“ im Papier stand auf falscher Prämisse.
- GH-S8-Fundliste (Kommentare unterhalb Zeile 100, Laufzeit-Strings, Shell, Doku): wird Nacharbeit.

## Lesespur flash (9 Befunde)

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| F1 | sollte | Die Job-Gruppe hängt an einer unbelegten GitHub-Eigenschaft: berührt ein am `if` übersprungener Lauf die Gruppe, kann er einen wartenden echten Deploy verdrängen. | wartet auf den Doku-Beleg der Claude-Spur |
| F2 | sollte | Das Aufräumen von `r2n_fremd` liegt hinter den Würfen. | Nacharbeit (`finally`) |
| F3 | sollte | Das Parken ist nicht transaktional. `DROP TABLE IF EXISTS` am Anfang verwirft einen liegengebliebenen Parkplatz. | Nacharbeit (Notfall-Rückweg am Testanfang) |
| F4 | Anmerkung | Bei zwei Fehlern gehen Diagnosen verloren. | Nacharbeit |
| F5 | sollte | Die Kollisionsprüfung der Gruppen ist einseitig. | Nacharbeit (alle Gruppen eindeutig) |
| F6 | Anmerkung | `deploy.yml: 0` ist eine Zusicherung, die nicht fehlschlagen kann. | Nacharbeit: im Kommentar benennen |
| F7 | Anmerkung | Die Positivkontrolle zählt `uses:`, nicht Checkout-Beispiele. | Nacharbeit |
| F8 | Anmerkung | `uses :` mit Leerraum vor dem Doppelpunkt entgeht dem Doku-Wächter. | Nacharbeit |
| F9 | Anmerkung | Ein wartender Handstart kann von einem neueren Automatiklauf ersetzt werden. | Nacharbeit: im Kommentar benennen |

## Ausführende Claude-Spur (10 Befunde)

- Die Mutationstabelle liegt unter `scratchpad/c5fpr/`.
- **Selbst nachgemessen:** `queue: max` steht in der GitHub-Doku (Workflow-Syntax, `jobs.<job_id>.concurrency`): „Up to 100 jobs or workflow runs can be pending … not allowed with cancel-in-progress: true“. Damit entfällt die Verdrängung eines wartenden Deploys, auch durch den dokumentierten Re-Run-Weg. Die offene Frage aus F1 (betritt ein übersprungener Job die Gruppe?) wird damit gegenstandslos: er wartet nur und wird übersprungen.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| C1 | P2 | Mit Shell-Verkettung (`-oStrict\HostKeyChecking=no`, `strict''hostkeychecking=no`) vor der kanonischen Option ist die Host-Schlüssel-Prüfung ab, und beide Tests bleiben grün. | Nacharbeit: argv durch `ssh -G -F /dev/null` (Referenz von aussen) |
| C2/C3 | P3 | Das Doku-Fenster zählt `persist-credentials` des nächsten Schritts mit; Flow-Mapping und Grossschreibung entgehen der Prüfung. | Nacharbeit: yaml-Blöcke parsen |
| C4 | P3 | Nur `docs/*.md` wird geprüft. | Nacharbeit: `git ls-files '*.md'` |
| C5 | P3 | Die Gruppen-Kollision wird case-sensitiv geprüft. | Nacharbeit (mit F5) |
| C6 | P3 | Ein wartender Deploy wird verdrängt (Re-Run-Weg dokumentiert). | Nacharbeit: `queue: max` |
| C7 | P3 | `DROP TABLE IF EXISTS` vernichtet einen liegengebliebenen Parkplatz. | Nacharbeit (mit F3) |
| C8 | P3 | Der Fremdeintrag belegt die Reset-Liste nur für 0049. | Nacharbeit: Kommentar |
| C9 | P3 Doku | Die Kommentare berufen sich auf eine CLAUDE.md ausserhalb des Repos; GymDocu `CLAUDE.md:100` sagt das Gegenteil. Belegbar ist der Satz im Hauptserver unter `ops/gymdocu-deploy` Abschnitt „2b) Tests“. | Nacharbeit |
| C10 | Info | Die Kaskade nach einem Wurf in `runMigrations` besteht schon auf master, und sie ist laut. | kein Befund |
