# Auftrag D — Deploy-SSH mit Wiederholung, ohne nachgeladenes Binär (30.09.2026, Fassung 2)

Repo GymDocu, Zweig `fix-d-deploy-ssh` von `origin/master` (`be7ace5`), Baum `/workspace/gymdocu-d`. Einordnung:
Standard — eine Workflow-Datei, ihr statischer Wächter und ein neuer Verhaltenstest. Fassung 2 nach Planprüfung Runde 1
(`scratchpad/dp/antwort-{a,b}.txt`, Auswertung am Ende).

## Anlass

- 24.09.2026: Deploy 437 scheiterte zweimal beim Handshake (`ssh: handshake failed: read: connection reset by peer`),
  Ursache `MaxStartups`-Drosselung durch Dauer-Brute-Force (Episode 25 min; `STAND.md:10-18`). Betreiber hat
  `maxstartups 30:30:200` gesetzt; eine Wiederholung fehlt (Arbeitsplan D). Sie hilft gegen KURZE Aussetzer; bei
  langer Drosselung bleibt der Lauf rot (so im Kommentar). Die frühere Regel „nicht weiter neu anstossen“ galt einer
  laufenden Störung; Verbindungsversuche mit gültigem Schlüssel lösen kein fail2ban aus.
- GH-S1: `appleboy/ssh-action` lädt drone-ssh zur Laufzeit per curl OHNE Prüfsumme.
- Nachziehweg: `ops/deploy.sh:31-38` dokumentiert einen Cron `gymdocu-deploy nachziehen` (Hauptserver-Repo, alle
  15 min) hinter `deploy-freigabe`; auf dem Server NICHT gemessen — die Einordnung stützt sich darauf nicht.

## 1. Auslieferungsschritt mit OpenSSH des Runners (`.github/workflows/deploy.yml`)

`appleboy/ssh-action` wird ein `run:`-Schritt (`id: auslieferung`), nur Runner-Werkzeuge (`ssh`, `ssh-keyscan`,
`ssh-keygen`), Secrets nur über `env:`, kein `set -x`, keine Umgebungsausgabe.

- **Host-Schlüssel:** `ssh-keyscan -T 10 -t ecdsa` (Port nicht gesetzt = 22, wie heute: der Schritt trägt kein
  `port:`), Ausgabe `sort -u` in eine Datei unter `$RUNNER_TEMP`. Die Datei muss GENAU EINE Zeile haben UND
  `ssh-keygen -lf` darauf muss genau `SHA256:32fDXTS0yIjX6XWrfmO5vfdzf6uUNa0/0jXf6NxPFe0` liefern — sonst rot ohne
  Wiederholung (Satz: „Host-Schlüssel weicht ab — NICHT ausgeliefert“). Wiederholung des Scans nur bei LEERER Ausgabe.
  Danach `ssh -o StrictHostKeyChecking=yes -o UserKnownHostsFile=<datei> -o BatchMode=yes -o IdentitiesOnly=yes
  -o ConnectTimeout=30 -o ServerAliveInterval=15 -o ServerAliveCountMax=4`.
- **Schlüssel:** Datei unter `$RUNNER_TEMP` mit `umask 077`, `trap … EXIT` räumt auf (best effort; der Runner ist ein
  Wegwerf-Runner).
- **Befehl:** `ssh … "$DEPLOY_USER@$DEPLOY_HOST" /var/www/gymdocu/ops/deploy.sh`. Serverseitig kann `command=` in
  `authorized_keys` ihn ersetzen (`ops/deploy-key-einrichten.md:26`) — deshalb KEINE Marke im Client-Befehl.
- **Start erkannt = mindestens ein Byte auf stdout.** `ops/deploy.sh` schreibt als erste Handlung `log "1/8 …"` auf
  stdout, vor jeder Änderung (`:31`, „GANZ FRÜH … bevor irgendetwas verändert wird“); `die` schreibt auf stderr. stdout
  per `tee` in eine Datei UND ins Log, stderr in eine zweite Datei UND ins Log. Pipeline mit ausgesetztem `errexit`
  (`set +e; … ; rc=${PIPESTATUS[0]}; tee_rc=${PIPESTATUS[1]}; set -e`); `tee_rc ≠ 0` ⇒ rot.
- **Wiederholung NUR, wenn alles drei gilt:** `rc = 255`, stdout-Datei leer, stderr trifft eine Verbindungsfehlerzeile
  aus einer festen Liste (`kex_exchange_identification`, `Connection closed by`, `Connection reset by`,
  `Connection refused`, `Connection timed out`, `ssh: connect to host` — gemessen 30.09. mit OpenSSH 9.6p1: Horcher,
  der sofort trennt ⇒ `kex_exchange_identification: read: Connection reset by peer`; Horcher, der nach der Kennung
  trennt ⇒ `Connection closed by … port …`; kein Horcher ⇒ `ssh: connect to host … Connection refused`; nicht
  routbar ⇒ `… Connection timed out`; alle rc 255. `ssh-keyscan` ohne Horcher: leer, rc 1). Sonst KEINE Wiederholung: `Host key
  verification failed`/`REMOTE HOST IDENTIFICATION` ⇒ rot mit Host-Schlüssel-Satz; `Permission denied` ⇒ rot mit
  Schlüssel-Satz; stdout nicht leer und `rc ≠ 0` ⇒ rot mit „Deploy lief an und brach ab — Serverstand prüfen, nicht
  blind neu anstossen“. Doppelstart ist ohnehin ausgeschlossen: `ops/deploy.sh:66` `flock -n`.
- Höchstens 4 Versuche, Pausen 30/60/120 s, jeder als `::warning`. Budget: 4 × 30 s Verbindungsgrenze + 210 s Pausen +
  Scan (≤ 4 × 10 s + dieselben Pausen) ≈ 10 min im schlechtesten Fall, Deploy selbst heute ~15 s (Lauf 455: 21 s
  gesamt) ⇒ `timeout-minutes` von 10 auf 15.

## 2. Wächter (`test_feature_deploy_gate_static.js`)

- **Erkennung** des Auslieferungsschritts: GENAU EIN Schritt in `deploy.yml` referenziert `secrets.DEPLOY_SSH_KEY`
  (Literal 1, ROT bei 0 und bei 2), und dieser Schritt enthält im kommentarbereinigten `run:` wörtlich
  `/var/www/gymdocu/ops/deploy.sh` (Literal im Test). Ersetzt `:543-551`/`:577`.
- **Ersetzt, nicht ergänzt:** `with.script` (`:578-580`) ⇒ Pfad-Literal oben; `with.fingerprint` (`:581-585`) ⇒ der
  Fingerabdruck steht wörtlich in der Vergleichszeile mit `ssh-keygen -lf` (eine logische Zeile, Wortform im Test);
  `:552-555` (Ausnahme-Job ohne appleboy) ⇒ Ausnahme-Job referenziert den Schlüssel nicht (Doppelung zu `:436` im
  Kommentar benannt); die `ok()`-Texte `:793-803` nachziehen. Alle Positions-/`if:`-Zusicherungen gelten für den neu
  erkannten Schritt.
- Neu: `StrictHostKeyChecking=yes` vorhanden, `=no`/`accept-new`/`UserKnownHostsFile=/dev/null` abwesend; kein
  `appleboy/ssh-action` in irgendeinem Workflow; kein `set -x`/`xtrace` im Schritt; `timeout-minutes: 15`.
- Je neue/ersetzte Zusicherung ROT/GRÜN-Gegenprobe (Mutation an einer Kopie des Workflows, Regeln wie immer).

## 3. Verhaltenstest (in der Suite, `test_feature_deploy_ssh_wiederholung.js`, registriert)

Liest den `run:`-Text des erkannten Schritts per `js-yaml` aus `deploy.yml` (derselbe Text, keine Kopie) und führt ihn
mit `bash` in einem `os.tmpdir()`-Verzeichnis aus, mit Attrappen `ssh`, `ssh-keyscan`, `ssh-keygen`, `sleep` im `PATH`
(kein Netz, kein Server, kein echtes Warten; `RUNNER_TEMP` auf das Tmp-Verzeichnis). Fälle mit Sollzahl (Literal):
(a) 255 + leer + `kex_exchange_identification` → 2. Versuch 0 ⇒ grün, 2 ssh-Aufrufe;
(b) viermal (a) ⇒ rot, 4 Aufrufe; (c) stdout „▶ 1/8“ dann 255 ⇒ rot, 1 Aufruf, Satz „Deploy lief an“;
(d) 255 + leer + `Host key verification failed` ⇒ rot, 1 Aufruf; (e) 255 + `Permission denied` ⇒ rot, 1 Aufruf;
(f) Exit 1 (`die`) ⇒ rot, 1 Aufruf; (g) Scan-Fingerabdruck fremd ⇒ 0 ssh-Aufrufe; (h) Scan liefert zwei verschiedene
Zeilen ⇒ 0 ssh-Aufrufe; (i) Scan zwei gleiche Zeilen (Dual-Stack) ⇒ läuft; (j) Scan leer, dann gültig ⇒ läuft;
(k) Kanarienwert als `DEPLOY_SSH_KEY`: in keiner Ausgabe (stdout, stderr, Dateien ausser der Schlüsseldatei), und die
Schlüsseldatei ist nach dem Lauf weg. Gegenprobe: Polarität der Leer-Bedingung gedreht ⇒ (c) ROT.

## 4. Nicht in diesem Auftrag

Hauptserver und `authorized_keys` unverändert. Die Wirkung gegen den echten Server beweist erst der erste Deploy nach
dem Merge — bis dahin AUSGELIEFERT, nicht BEWIESEN.

## Bericht

Diff; Messung der Fehlerzeilen-Liste (Probe wörtlich); Verhaltenstest-Ausgabe; Gegenproben (Zahlen); volle Suite
(Aufruf laut CLAUDE.md, Dateizahl-Ritual); `npx eslint .`; Marker-Scan.

## Zustandsfrage

Welcher Zustand entsteht dadurch, den es vorher nicht gab — auf dem Runner, auf dem Server, im Ablauf zwischen
Freigabe-Ref und Auslieferung?

## Planprüfung Runde 1 — Auswertung (30.09.2026)

Übernommen: A-F1 (`command=` ersetzt den Client-Befehl — nachgesehen `ops/deploy-key-einrichten.md:26`; Start jetzt =
stdout-Byte aus `deploy.sh`), A-F2/F3/F6/F7/B6 (Erkennung mit Literal 1 + Pfad, Ersatz statt Ergänzung), A-F4/B5
(Verhaltenstest in der Suite am echten Workflow-Text statt Wortform), A-F5/B9 (`sort -u`, genau eine Zeile, Mismatch nie
wiederholt), A-F8/B4 (`errexit`-Idiom, zwei Ströme, `tee`-Fehler), A-F10/B11 (Budget, 15 min), A-F11 (best effort),
B1/B3 (stderr-Klassifikation), B2 (Fenster länger, Grenze benannt), B7 (Kanarienwert, `set -x` verboten), B8 (Cron nur
dokumentiert, nicht tragend), B10 (kein `port:`), B12 (`flock -n` benannt). Entfällt: A-F9 (Ort geklärt durch §3).

-- Ende des Auftrags --
