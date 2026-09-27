# Git-/GitHub-Mechanismen — Messung 27.09.2026

Betreiber 27.09.2026 („ja mach das"): gitleaks und zizmor einmal messen, Deploy-Aktion festnageln, Deploy-Weg für den
master-Schutz prüfen. Alles lokal im Scratchpad (`gl/`), volle Bare-Klone aller drei Repos (alle Zweige).

## gitleaks 8.28.0 (Geheimnisse in der Git-Historie)

Positivkontrolle: Wegwerf-Repo, ein GitHub-Token-förmiger Wert committet und im nächsten Commit wieder gelöscht →
gefunden (`github-pat`). Werte immer mit `--redact`, in diesem Papier nur maskiert.

| Repo | Commits (alle Zweige) | Funde | davon echt |
|---|---|---|---|
| Gymdocu | 1.953 | 32 | 0 — Testschlüssel (`0123…`, `fedc…`), Test-Tokens, Prüfsummen der Migrationen, Zeichenvorrat in `core/qr-token.js`, E2E-Gerätetoken (nur `e2e/helpers/db.js`) |
| gymdocu-hauptserver | 304 | 4 | 0 — Test-Tokens |
| Belehrungssystem | 927 | 2 | 0 — Prosa in `plaene/diffpruefung-s6.md`, Prüfmuster in `tools/geheimnis-riegel.js` |

Ergebnis: **kein echtes Geheimnis in der Historie** (im Rahmen der gitleaks-Standardregeln).

## zizmor 1.30.1 (Workflow-Prüfung)

Positivkontrolle (eigens gebauter Workflow): `template-injection`, `dangerous-triggers`, `unpinned-uses`,
`artipacked`, `excessive-permissions` — alle gemeldet.

| Repo | Befunde |
|---|---|
| Gymdocu | 11 × `unpinned-uses` (10 × `actions/*` in `ci.yml`, 1 × `appleboy/ssh-action@v1.2.5` in `deploy.yml:222`); `dangerous-triggers` `deploy.yml:77` (`workflow_run`); 4 × `artipacked` (Hinweis) |
| gymdocu-hauptserver | 6 × `unpinned-uses`, 3 × `artipacked`, 4 × `excessive-permissions` (kein `permissions:`-Block) |
| Belehrungssystem | je 1 × `unpinned-uses`, `artipacked`, `excessive-permissions` |

Einordnung `dangerous-triggers`: `deploy.yml` liefert nur bei `head_branch == 'master' && conclusion == 'success'`
(`:114-117`) und prüft danach, dass die master-Spitze gleich dem geprüften Commit ist. Mögliche Verschärfung:
zusätzlich `github.event.workflow_run.event == 'push'`.

**Eigener Befund, den zizmor nicht meldet:** `appleboy/ssh-action` prüft den Host-Schlüssel des Servers nur, wenn
`fingerprint:` gesetzt ist (`action.yml` v1.2.5: „SHA256 fingerprint of the host public key for verification to prevent
MITM attacks"). `deploy.yml` setzt ihn nicht — der Deploy prüft also nicht, mit welchem Server er spricht.
Festnagel-Wert: `v1.2.5` = Commit `0ff4204d59e8e51228ff73bce53f80d53301dee2` (per `git ls-remote`).

## master-Schutz: was der Deploy-Weg verträgt

- GitHub meldet `master` in Gymdocu als ungeschützt (`"protected": false`).
- `deploy.yml` schreibt NICHT auf master, sondern setzt per API den Zweig `deploy-freigabe` (force).
- Der Handweg auf dem Server (`ops/gymdocu-deploy` im Hauptserver-Repo, Schritt 3) macht `git add -A`, `git commit`
  und `git push origin "$BRANCH"` — er schreibt also DIREKT auf GitHub. Ein Schutz „nur per PR" würde diesen Push
  abweisen (dort nur `warn`, der Code liefe ungesichert weiter).
- Folgerung: Stufe 1 ohne Nebenwirkung = **Force-Push und Löschen von master verbieten**. Stufe 2 („nur per PR, CI
  grün") erst mit einer Ausnahme für den Zugang des Servers.

## Nächster Bauauftrag (nach SG, eigene Planprüfung — berührt das Deploy)

Alle Aktionen per Commit-Kennung festnageln (drei Repos, auch der neue Semgrep-Workflow), `persist-credentials: false`
wo nicht gepusht wird, `permissions: contents: read` in Hauptserver und Belehrungssystem, `fingerprint:` am Deploy
(Wert vom Betreiber), `workflow_run.event == 'push'` im Deploy-`if` samt Wächter, gitleaks mit Baseline als Hinweis.

-- Ende --
