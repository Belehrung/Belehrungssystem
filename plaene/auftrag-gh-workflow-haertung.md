# Auftrag GH — Workflow-Härtung (30.09.2026, Fassung 1)

Grundlage: `plaene/git-mechanismen-27-09-2026.md` (zizmor-/gitleaks-Messung, Host-Schlüssel). Drei Repos, je ein eigener
Zweig und PR. Start ERST, wenn SG (`fix-sg-semgrep`, neuer Workflow `semgrep-hinweis.yml`) auf master ist — der wird
mit festgenagelt. Einordnung: nicht sehr komplex (Standard) — viele gleichartige Handgriffe; die eine heikle Stelle
(Host-Schlüssel) ist unten mit Messpflicht versehen.

## Teil A — GymDocu (`/workspace/gymdocu-gh` neu von `origin/master`, Zweig `fix-gh-workflow-haertung`)

1. **Festnageln:** jedes `uses:` in `.github/workflows/*.yml` auf die volle 40-stellige Commit-Kennung der heute
   benutzten Version, Version als Kommentar dahinter (`@<sha> # v6`). Kennung per `git ls-remote` der Aktion, getaggte
   Version gegen die Kennung halten; für annotierte Tags die dereferenzierte Kennung (`^{}`). Liste im Bericht.
   `.github/dependabot.yml`: Ökosystem `github-actions` vorhanden? Sonst ergänzen (wöchentlich, gruppiert wie npm), damit
   die Kennungen nachgezogen werden.
2. **`persist-credentials: false`** an jedem `actions/checkout`, dessen Job danach nicht per `git push` schreibt. Der
   Deploy-Job setzt `deploy-freigabe` per `gh api` mit `GH_TOKEN` aus `env:` — vor dem Setzen messen (lesen), dass kein
   Schritt die im Checkout hinterlegten Zugangsdaten braucht.
3. **Host-Schlüssel am Deploy:** `appleboy/ssh-action` bekommt `fingerprint:`. Welchen Schlüsseltyp die festgenagelte
   Version aushandelt, wird VOR dem Eintragen gemessen: Quelltext der Aktion und ihrer Go-Abhängigkeiten in genau der
   festgenagelten Version (`action.yml` → Bild/Binärversion → `easyssh-proxy` → `golang.org/x/crypto/ssh`, Reihenfolge der
   Host-Key-Algorithmen, ob `HostKeyAlgorithms` gesetzt wird). Werte (aus einem Bildschirmfoto abgelesen, s.
   `plaene/git-mechanismen-27-09-2026.md` — Verwechslungsgefahr `O`/`0`, `I`/`l`):
   ECDSA `32fDXTS0yIjX6XWrfmO5vfdzf6uUNa0/0jXf6NxPFe0`, ED25519 `UhbNcyKXYO4wacFJsBvkwz9feZiFNRDepjikEy0XMPs`,
   RSA `RBbPj9tmirFrqR3QIbyDwFnUbBPvmdGLnly4zqeP3gk` (jeweils mit Präfix `SHA256:` falls die Aktion ihn erwartet — im
   Quelltext messen). Der Wert steht NICHT als Geheimnis (öffentlich, soll im Diff lesbar sein). Im Bericht ausdrücklich:
   ein falscher Wert lässt den Deploy mit einem Handshake-Fehler scheitern, es wird nichts ausgeliefert.
4. **Deploy-`if`:** zusätzlich `github.event.workflow_run.event == 'push'` (ein CI-Lauf auf master aus einem anderen
   Ereignis liefert nicht aus). Vorher messen, welches `event` die bisherigen erfolgreichen Deploy-Auslöser hatten (Lauf-
   liste über die GitHub-Werkzeuge ist nicht verfügbar — dann aus der GitHub-Doku zu `workflow_run` und begründen).
   `workflow_dispatch` bleibt unberührt.
5. **Wächter** (bestehende fachlich erweitern, nie aufweichen; `test_feature_deploy_gate_static.js`,
   `test_feature_ci_gates.js`, `test_feature_semgrep_hinweis.js`):
   - jedes `uses:` in allen Workflow-Dateien ist `<owner>/<repo>[/pfad]@<40 hex>` (Dateiliste gegen `git ls-files
     .github/workflows`, nicht gegen ein Verzeichnislisting); Gegenprobe `@v6` → ROT.
   - jeder Checkout ausser einer literal benannten Ausnahmeliste trägt `persist-credentials: false`; Gegenprobe → ROT.
   - der ssh-action-Schritt trägt `fingerprint:` mit einem literal im Test stehenden Wert; Gegenprobe Wert entfernt → ROT.
   - das Job-`if` enthält die `event == 'push'`-Bedingung; Gegenprobe → ROT.
   Bestehende Wächter, die ein `@v…` literal erwarten, fachlich umstellen (Liste im Bericht).
6. **gitleaks als Hinweis** (eigener Workflow `gitleaks-hinweis.yml`, nur `pull_request`, `permissions: contents:
   read`, nicht Teil der CI, Muster `semgrep-hinweis.yml`): gitleaks 8.28.0 als Release-Archiv mit geprüfter SHA-256
   (Prüfsumme aus der Release-Seite, im Workflow literal), `--redact`, nur die Commits des PR
   (`--log-opts "$BASE..HEAD"`), Ausgabe als `::warning` je Fund ohne den Wert. Die 32 bekannten Funde der Historie
   betreffen nur alte Commits und erscheinen damit nicht. Kontrolllauf wie bei Semgrep: ein Probelauf gegen eine
   Probedatei mit einem Test-Token-Muster, das gitleaks erkennt, `tools/geheimnis-riegel.js` (Belehrungssystem) aber
   NICHT als echtes Geheimnis wertet — sonst eine Probe ausserhalb des Baums im Runner erzeugen (bevorzugt: nichts
   Geheimnisförmiges ins Repo). Zustände wie SG (`nicht_geprueft` bei Exit ∉ {0,1}, fehlender Ausgabe, Kontrolllauf ohne
   Fund). Tests: statisch wie bei SG; Auswertung als reine Funktion mit Fixturen.

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
