# Auftrag D — Deploy-SSH mit Wiederholung, ohne nachgeladenes Binär (30.09.2026, Fassung 1)

Repo GymDocu, Zweig `fix-d-deploy-ssh` von `origin/master`, eigener Baum `/workspace/gymdocu-d`. Einordnung: Standard —
eine Workflow-Datei und ihr statischer Wächter; die Gefahr (Deploy liefert nicht aus oder liefert doppelt) ist
begrenzt, weil der Freigabe-Ref VOR dem SSH-Schritt steht und der Cron auf dem Hauptserver nachzieht.

## Anlass

- 24.09.2026: Deploy scheiterte an `MaxStartups`-Drosselung des sshd (Dauer-Brute-Force; `STAND.md`, 24.09.). Der
  Betreiber hat `maxstartups 30:30:200` gesetzt, eine Wiederholung im Deploy fehlt (Arbeitsplan D).
- GH-S1 (`offene-befunde-gh.md`): `appleboy/ssh-action` lädt drone-ssh zur Laufzeit per curl OHNE Prüfsumme — das
  Festnageln der Aktion nagelt das Binär nicht fest.

## 1. Auslieferungsschritt mit OpenSSH des Runners (`.github/workflows/deploy.yml`)

`appleboy/ssh-action` wird durch einen `run:`-Schritt ersetzt (`id: auslieferung`), der nur Werkzeuge des Runners
benutzt (`ssh`, `ssh-keyscan`, `ssh-keygen`), mit `set -euo pipefail` und Secrets ausschliesslich über `env:`:

- **Host-Schlüssel:** `ssh-keyscan -t ecdsa` gegen `DEPLOY_HOST` (mit derselben Wiederholung wie unten) in eine Datei
  unter `$RUNNER_TEMP`; `ssh-keygen -lf <datei> -E sha256` muss GENAU EINE Zeile mit dem festen Wert
  `SHA256:32fDXTS0yIjX6XWrfmO5vfdzf6uUNa0/0jXf6NxPFe0` liefern, sonst Abbruch rot. Danach
  `ssh -o StrictHostKeyChecking=yes -o UserKnownHostsFile=<datei>`, `HostKeyAlgorithms` auf den Typ aus der Scan-Datei
  (Kurve nicht geraten) — die eigentliche Verbindung muss denselben Schlüssel zeigen. Port wie heute (die Aktion
  setzt keinen, also 22).
- **Schlüssel:** `DEPLOY_SSH_KEY` in eine Datei unter `$RUNNER_TEMP` mit `umask 077`, Aufräumen per `trap … EXIT`.
  `-o BatchMode=yes -o IdentitiesOnly=yes -o ConnectTimeout=30 -o ServerAliveInterval=15 -o ServerAliveCountMax=4`.
- **Befehl:** `ssh … "$DEPLOY_USER@$DEPLOY_HOST" 'echo GYMDOCU-DEPLOY-START; exec /var/www/gymdocu/ops/deploy.sh'`,
  Ausgabe per `tee` in eine Datei UND ins Log (Exit über `PIPESTATUS`).
- **Wiederholung NUR vor dem Start:** Exit 255 (OpenSSH: Verbindungsfehler) UND die Startmarke steht NICHT in der
  Ausgabe ⇒ erneuter Versuch, höchstens 3 Versuche, Pausen 20 s und 40 s, jeder Versuch als `::warning` gemeldet.
  Steht die Marke in der Ausgabe, wird NIE wiederholt (das Skript lief an; Abbruch mitten im Deploy ⇒ rot mit dem
  Satz „Verbindung während des Deploys abgerissen — Serverstand prüfen, nicht blind neu anstossen“). Jeder andere
  Exit ≠ 0 ⇒ rot ohne Wiederholung. `ops/deploy.sh` endet heute nur mit 0 oder 1 (`die`), unter `set -e` aber auch mit
  dem Status eines gescheiterten Befehls — deshalb entscheidet die Marke, nicht der Exit allein.
- `timeout-minutes: 10` des Jobs bleibt; Summe der Wartezeiten + drei Verbindungsversuche passen hinein (im Bericht
  rechnen).

## 2. Wächter (`test_feature_deploy_gate_static.js`)

Die Auslieferung wird heute an `uses: appleboy/ssh-action` erkannt (`:543-551`, `:577`). Neu: ein Schritt liefert aus,
wenn er `secrets.DEPLOY_SSH_KEY` referenziert (egal ob in `env:` oder `with:`) — wer den Schlüssel hält, kann
ausliefern; das bleibt auch bei einem künftigen Werkzeugwechsel wahr. Alle bisherigen Positions- und
`if:`-Zusicherungen gelten für diesen Schritt unverändert. Neu, je mit ROT/GRÜN-Gegenprobe (Mutation am Workflow-Text
in einer Kopie, Regeln wie immer):
- Fingerabdruck wörtlich im kommentarbereinigten `run:` (wie heute `with.fingerprint`);
- `StrictHostKeyChecking=yes` vorhanden, `StrictHostKeyChecking=no`/`accept-new` und `UserKnownHostsFile=/dev/null`
  abwesend;
- Wiederholung nur mit Startmarken-Bedingung (Marke im Befehl UND in der Wiederholbedingung);
- kein `appleboy/ssh-action` mehr in irgendeiner Workflow-Datei; kein Secret im `run:`-Text (nur über `env:`);
- Ausnahme-Job `abweisung` referenziert `DEPLOY_SSH_KEY` nicht.

## 3. Verhaltensprobe (lokal, NICHT in der Suite)

Die Wiederholungslogik als eigene Shell-Funktion, damit sie ohne Server prüfbar ist: Probe mit einer `ssh`-Attrappe
im `PATH`, die (a) 255 ohne Marke, dann 0 liefert → 2 Versuche, grün; (b) 255 dreimal → 3 Versuche, rot; (c) Marke,
dann 255 → 1 Versuch, rot mit dem Satz; (d) 1 → 1 Versuch, rot; (e) falscher Fingerabdruck → kein `ssh`-Aufruf.
Ausgabe wörtlich in den Bericht. Kein echter Server, kein Netz.

## 4. Nicht in diesem Auftrag

Dependabot-Eintrag für `github-actions` bleibt (andere Aktionen); `appleboy` fällt dort von selbst weg. Hauptserver
unverändert. Die Wirkung gegen den echten Server beweist erst der erste Deploy nach dem Merge (wie GH-S2) — bis dahin
AUSGELIEFERT, nicht BEWIESEN.

## Bericht

Diff; Probe (a)–(e) wörtlich; Gegenproben je neuer Zusicherung (ROT/GRÜN-Zahlen); volle Suite (Aufruf laut CLAUDE.md,
Dateizahl-Ritual); `npx eslint .`; actionlint/zizmor, falls im Repo vorhanden; Marker-Scan.

## Zustandsfrage

Welcher Zustand entsteht dadurch, den es vorher nicht gab — auf dem Runner, auf dem Server, im Ablauf zwischen
Freigabe-Ref und Auslieferung?

-- Ende des Auftrags --
