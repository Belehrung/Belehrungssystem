# Auftrag GH — Workflow-Härtung (30.09.2026, Fassung 2 nach Planprüfung, `plaene/planpruefung-gh.md`)

Grundlage: `plaene/git-mechanismen-27-09-2026.md` (zizmor-/gitleaks-Messung, Host-Schlüssel). Drei Repos, je ein eigener
Zweig und PR. Start ERST, wenn SG (`fix-sg-semgrep`, neuer Workflow `semgrep-hinweis.yml`) auf master ist — der wird
mit festgenagelt. Einordnung: nicht sehr komplex (Standard) — viele gleichartige Handgriffe; die eine heikle Stelle
(Host-Schlüssel) ist unten mit Messpflicht versehen.

## Teil A — GymDocu (`/workspace/gymdocu-gh` neu von `origin/master`, Zweig `fix-gh-workflow-haertung`)

1. **Festnageln:** jedes `uses:` in `.github/workflows/*.yml` auf die volle 40-stellige Commit-Kennung der heute
   benutzten Version, Version als Kommentar dahinter (`@<sha> # v6`). Kennung per `git ls-remote` der Aktion, getaggte
   Version gegen die Kennung halten; für annotierte Tags die dereferenzierte Kennung (`^{}`). Liste im Bericht.
   `.github/dependabot.yml:47-52` hat `github-actions` schon (wöchentlich) — unverändert lassen; Dependabot zieht
   festgenagelte Kennungen samt Versionskommentar nach. Bestehende Format-Wächter `test_feature_ci_gates.js:104`, `:255`
   (`@v\d+`) fachlich auf das neue Format umstellen.
2. **`persist-credentials: false`** an jedem `actions/checkout` (gelesen in der Planprüfung: `ci.yml:30/62/212/257`,
   `semgrep-hinweis.yml` — reine Lese-Checkouts ohne spätere `git`/`gh`-Schreiboperation; der Deploy-Job hat keinen
   Checkout, `deploy.yml:181-184`). Vor dem Setzen selbst bestätigen.
3. **Host-Schlüssel am Deploy:** `appleboy/ssh-action` bekommt `fingerprint:`. Welchen Schlüsseltyp die festgenagelte
   Version aushandelt, wird VOR dem Eintragen gemessen: Quelltext der Aktion und ihrer Go-Abhängigkeiten in genau der
   festgenagelten Version (`action.yml` → Bild/Binärversion → `easyssh-proxy` → `golang.org/x/crypto/ssh`, Reihenfolge der
   Host-Key-Algorithmen, ob `HostKeyAlgorithms` gesetzt wird). Werte (aus einem Bildschirmfoto abgelesen, s.
   `plaene/git-mechanismen-27-09-2026.md` — Verwechslungsgefahr `O`/`0`, `I`/`l`):
   ECDSA `32fDXTS0yIjX6XWrfmO5vfdzf6uUNa0/0jXf6NxPFe0`, ED25519 `UhbNcyKXYO4wacFJsBvkwz9feZiFNRDepjikEy0XMPs`,
   RSA `RBbPj9tmirFrqR3QIbyDwFnUbBPvmdGLnly4zqeP3gk` (jeweils mit Präfix `SHA256:` falls die Aktion ihn erwartet — im
   Quelltext messen). Der Wert steht NICHT als Geheimnis (öffentlich, soll im Diff lesbar sein). Richtig ist (Planprüfung
   B2): `deploy-freigabe` wird VOR dem SSH-Schritt gesetzt (`deploy.yml:205` vor `:221`, Absicht `:174-179`) — ein
   falscher Wert macht den Lauf ROT, der Cron auf dem Hauptserver liefert den Stand trotzdem verzögert aus. Der Test kann
   den Wert nicht gegen den Server prüfen (Test und Workflow haben dieselbe Abschrift als Quelle); die Referenz von
   aussen ist der erste Deploy nach dem Merge: grün = der Server zeigt genau diesen Schlüssel. Diesen Deploy prüft der
   Haupt-Agent ausdrücklich.
4. **Deploy-`if`:** innerhalb der workflow_run-Klammer (`deploy.yml:114-117`, Form `A || (B && C && D)`) zusätzlich
   `(github.event.workflow_run.event == 'push' || github.event.workflow_run.event == 'workflow_dispatch')` — ein von Hand
   gestarteter CI-Lauf auf master liefert weiter aus (dokumentiert `deploy.yml:51-53`); ausgeschlossen werden
   `pull_request` (Fork-PR mit Kopf `master`, `:106-110`) und alle übrigen Ereignisse. Kommentar `:51-53` mitziehen.
5. **Wächter** (bestehende fachlich erweitern, nie aufweichen; `test_feature_deploy_gate_static.js`,
   `test_feature_ci_gates.js`, `test_feature_semgrep_hinweis.js`):
   - jedes `uses:` in allen Workflow-Dateien ist `<owner>/<repo>[/pfad]@<40 hex>` (Dateiliste wie heute über
     `fs.readdirSync`, `test_feature_deploy_gate_static.js:176-178` — kein `child_process` im Test); Gegenprobe `@v6` → ROT.
   - jeder Checkout ausser einer literal benannten Ausnahmeliste trägt `persist-credentials: false`; Gegenprobe → ROT.
   - der ssh-action-Schritt trägt `fingerprint:` mit einem literal im Test stehenden Wert; Gegenprobe Wert entfernt → ROT.
   - `ERWARTETES_IF` (`test_feature_deploy_gate_static.js:256-259`, exakter Vergleich `:302`) wird um die neue Bedingung
     EXAKT erweitert (kein „enthält“); Gegenproben: Bedingung entfernt, als eigenes ODER ausserhalb der Klammer → je ROT.
   Bestehende Wächter, die ein `@v…` literal erwarten, fachlich umstellen (Liste im Bericht).
6. **gitleaks als Hinweis** (eigener Workflow `gitleaks-hinweis.yml`, nur `pull_request`, `permissions: contents:
   read`, nicht Teil der CI, Muster `semgrep-hinweis.yml`): gitleaks 8.28.0 als Release-Archiv mit geprüfter SHA-256
   (Prüfsumme aus der Release-Seite, im Workflow literal), `--redact`, nur die Commits des PR
   (`--log-opts "$BASE..HEAD"`). Die 32 bekannten Funde der Historie betreffen nur alte Commits und erscheinen damit
   nicht. **Kein Kanal zeigt einen Wert:** Annotation, Job-Zusammenfassung und Prozess-Log nur mit Regel, Datei, Zeile,
   Commit; kein Artefakt-Upload; die Wirkung von `--redact` in JSON-Bericht UND Log wird im Bericht gemessen.
   **Kontrolllauf im selben Modus wie der echte Lauf (Git-Modus):** im Runner in einem Temp-Verzeichnis ein Wegwerf-Repo
   anlegen, eine Datei mit einem zur Laufzeit zusammengesetzten Test-Token-Muster committen (nichts Geheimnisförmiges im
   GymDocu-Repo), gitleaks im Git-Modus darüber → muss genau einen Fund liefern. **Abdeckung:** `git rev-list --count
   "$BASE..HEAD"` > 0 und `$BASE` auflösbar, sonst `nicht_geprueft`. Zustände wie SG (Exit ∉ {0,1}, fehlende Ausgabe,
   Kontrolllauf ohne Fund → `nicht_geprueft`). Tests: statisch wie bei SG, Auswertung als reine Funktion mit Fixturen,
   neue Testdatei in `test/run.sh` registrieren.

## Teil B — Hauptserver und Belehrungssystem

Je eigener Zweig (Hauptserver: `fix-gh-workflow-haertung` von dessen Standardzweig, Klon unter `/workspace`;
Belehrungssystem: ein neuer Zweig von `main`, NICHT der Arbeitszweig des Haupt-Agenten). Punkte 1 und 2 wie Teil A,
dazu `permissions: contents: read` auf Workflow-Ebene (zizmor meldete `excessive-permissions`). Hat ein Repo einen
Test-Wächter für Workflows, ihn erweitern; sonst die zizmor-Messung vorher/nachher als Beleg.

## Messung für den Bericht

zizmor 1.30.1 (Scratchpad-venv `sg/venv`, sonst `pip install zizmor==1.30.1` in eigenem venv) über alle drei Repos
vorher und nachher, Befunde als Tabelle; erwartet: `unpinned-uses` 0, `artipacked` 0, `excessive-permissions` 0,
`dangerous-triggers` bleibt (bewusst, begründet).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht, den es vorher nicht gab (festgenagelte Aktionen, Host-Schlüssel-Prüfung, neue Bedingung am
Deploy, neuer Hinweis-Workflow)? Kann danach (a) ein Deploy, der heute läuft, nicht mehr laufen — und würde man es
bemerken, (b) ein Aktions-Update unbemerkt ausbleiben, (c) ein Workflow Zugangsdaten verlieren, die er braucht?

-- Ende des Auftrags --
