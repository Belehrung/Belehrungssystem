# Auftrag D — Deploy-SSH mit Wiederholung, ohne nachgeladenes Binär (30.09.2026, Fassung 3)

Repo GymDocu, Zweig `fix-d-deploy-ssh` von `origin/master` (`be7ace5`), Baum `/workspace/gymdocu-d`. Einordnung:
Standard — eine Workflow-Datei, ihr statischer Wächter, ein neuer Verhaltenstest, ein Eintrag in
`test_feature_keine_systemeingriffe.js`. Fassung 3 nach Planprüfung Runden 1 und 2 (`scratchpad/dp/antwort{,2}-{a,b}.txt`,
Auswertung am Ende).

## Anlass

- 24.09.2026: Deploy 437 scheiterte zweimal beim Handshake (`ssh: handshake failed: read: connection reset by peer`),
  Ursache `MaxStartups`-Drosselung durch Dauer-Brute-Force (Episode 25 min; `STAND.md:10-18`). Betreiber hat
  `maxstartups 30:30:200` gesetzt; eine Wiederholung fehlt (Arbeitsplan D). Sie hilft gegen KURZE Aussetzer; bei
  langer Drosselung bleibt der Lauf rot (so im Kommentar). Die frühere Regel „nicht weiter neu anstossen“ galt einer
  laufenden Störung; die Wiederholung ist auf 4 Versuche begrenzt. Ob fail2ban auf gedrosselte Verbindungen reagiert,
  ist NICHT gemessen.
- GH-S1: `appleboy/ssh-action` lädt drone-ssh zur Laufzeit per curl OHNE Prüfsumme.
- Nachziehweg: `ops/deploy.sh:31-38` dokumentiert einen Cron `gymdocu-deploy nachziehen` (Hauptserver-Repo, alle
  15 min) hinter `deploy-freigabe`; auf dem Server NICHT gemessen — die Einordnung stützt sich darauf nicht.

## 1. Auslieferungsschritt mit OpenSSH des Runners (`.github/workflows/deploy.yml`)

`appleboy/ssh-action` wird ein `run:`-Schritt (`id: auslieferung`), nur Runner-Werkzeuge (`ssh`, `ssh-keyscan`,
`ssh-keygen`), Secrets nur über `env:`, kein `set -x`, keine Umgebungsausgabe.

- **Host-Schlüssel:** `ssh-keyscan -T 10 -t ecdsa` (Port nicht gesetzt = 22, wie heute: der Schritt trägt kein
  `port:`), Ausgabe `sort -u` in eine Datei unter `$RUNNER_TEMP`. Die Datei muss GENAU EINE Zeile haben UND
  das zweite Feld von `ssh-keygen -lf` darauf muss gleich `SHA256:32fDXTS0yIjX6XWrfmO5vfdzf6uUNa0/0jXf6NxPFe0` sein — sonst rot ohne
  Wiederholung (Satz: „Host-Schlüssel weicht ab — NICHT ausgeliefert“). Wiederholung des Scans nur bei LEERER Ausgabe.
  Gemessen 30.09. (OpenSSH 9.6p1, lokaler sshd mit ECDSA+ED25519+RSA): `ssh-keyscan -t ecdsa` schreibt genau eine Zeile
  auf stdout, die `# …`-Kennung auf stderr; `ssh` mit nur diesem ECDSA-Eintrag in `UserKnownHostsFile` und OHNE
  `HostKeyAlgorithms` akzeptiert den Host (erreicht `Permission denied`, kein Host-Key-Fehler). Schlüsselwechsel am
  Server: Literal hier und im Test gleichzeitig nachziehen (wie heute).
  Danach `ssh -o StrictHostKeyChecking=yes -o UserKnownHostsFile=<datei> -o BatchMode=yes -o IdentitiesOnly=yes
  -o ConnectTimeout=30 -o ServerAliveInterval=15 -o ServerAliveCountMax=4`.
- **Schlüssel:** Datei unter `$RUNNER_TEMP` mit `umask 077`, `trap … EXIT` räumt auf (best effort; der Runner ist ein
  Wegwerf-Runner).
- **Befehl:** `ssh … "$DEPLOY_USER@$DEPLOY_HOST" /var/www/gymdocu/ops/deploy.sh`. Serverseitig kann `command=` in
  `authorized_keys` ihn ersetzen (`ops/deploy-key-einrichten.md:26`) — deshalb KEINE Marke im Client-Befehl.
- **Start erkannt = mindestens ein Byte auf stdout.** `ops/deploy.sh` schreibt als erste Handlung `log "1/8 …"` auf
  stdout, vor jeder Änderung (`:31`, „GANZ FRÜH … bevor irgendetwas verändert wird“); `die` schreibt auf stderr. stdout
  per `tee` in eine Datei UND ins Log; stderr nur in eine Datei, nach dem Versuch ins Log ausgegeben. Pipeline mit
  ausgesetztem `errexit`, Status sofort als Feld retten: `set +e; ssh … 2>"$ERR" | tee "$OUT"; st=("${PIPESTATUS[@]}");
  set -e; rc=${st[0]}; tee_rc=${st[1]}` (gemessen: `rc=${PIPESTATUS[0]}; t=${PIPESTATUS[1]}` liefert t LEER);
  `tee_rc ≠ 0` ⇒ rot. `rc = 0` bei LEEREM stdout ⇒ rot („kein Deploy-Start erkannt“).
- **Wiederholung NUR, wenn alles drei gilt:** `rc = 255`, stdout-Datei leer, stderr trifft eine Verbindungsfehlerzeile
  aus einer festen Liste (`kex_exchange_identification`, `Connection closed by`, `Connection reset by`,
  `Connection refused`, `Connection timed out`, `ssh: connect to host` — gemessen 30.09. mit OpenSSH 9.6p1: Horcher,
  der sofort trennt ⇒ `kex_exchange_identification: read: Connection reset by peer`; Horcher, der nach der Kennung
  trennt ⇒ `Connection closed by … port …`; kein Horcher ⇒ `ssh: connect to host … Connection refused`; nicht
  routbar ⇒ `… Connection timed out`; alle rc 255. `ssh-keyscan` ohne Horcher: leer, rc 1). Sonst KEINE Wiederholung: `Host key
  verification failed`/`REMOTE HOST IDENTIFICATION` ⇒ rot mit Host-Schlüssel-Satz; `Permission denied` ⇒ rot mit
  Schlüssel-Satz; stdout nicht leer und `rc ≠ 0` ⇒ rot mit „Deploy lief an und brach ab — Serverstand prüfen, nicht
  blind neu anstossen“ (dazu die stderr-Datei; eine `flock`-Kollision `:66` erscheint ebenso). Überlappung ist durch
  `ops/deploy.sh:66` `flock -n` ausgeschlossen, eine Wiederholung nach vollendetem ersten Lauf nicht (wäre ein zweiter,
  harmloser Deploy) — deshalb gilt die stdout-Regel.
- **master nicht weitergezogen, auch bei Wiederholung:** vor JEDEM weiteren Versuch (nicht dem ersten) prüft der Schritt
  bei `workflow_run` erneut `master == workflow_run.head_sha` (`gh api`, `GH_TOKEN: github.token` über `env:`); weicht
  es ab ⇒ Abbruch rot („master weitergezogen — der nächste CI-Lauf liefert aus“). `ops/deploy.sh` holt die
  master-Spitze, das Wiederholfenster darf den Vergleichsschritt nicht aushebeln.
- Höchstens 4 Versuche, Pausen 30/60/120 s, jeder als `::warning`. Budget: 4 × 30 s Verbindungsgrenze + 210 s Pausen +
  Scan (≤ 4 × 10 s + dieselben Pausen) ≈ 10 min im schlechtesten Fall, Deploy selbst heute ~15 s (Lauf 455: 21 s
  gesamt; mit `npm ci` länger) ⇒ `timeout-minutes` des JOBS (`deploy.yml:112`) von 10 auf 15. Ein hängender Deploy
  nach dem Start endet am Job-Limit ohne eigenen Satz (wie heute).

## 2. Wächter (`test_feature_deploy_gate_static.js`)

- **Erkennung** des Auslieferungsschritts: GENAU EIN Schritt in `deploy.yml` referenziert `secrets.DEPLOY_SSH_KEY`
  (Literal 1, ROT bei 0 und bei 2), und dieser Schritt enthält im kommentarbereinigten `run:`
  `/var/www/gymdocu/ops/deploy.sh` mit Wortgrenze (Muster wie `REF_MUSTER` `:738-768`: `deploy.sh.neu` ⇒ ROT). Ersetzt `:543-551`/`:577`.
- **Ersetzt, nicht ergänzt:** `with.script` (`:578-580`) ⇒ Pfad-Literal oben; `with.fingerprint` (`:581-585`) ⇒ das
  Literal steht im `run:`; dass wirklich VERGLICHEN wird, belegt der Verhaltenstest (Fälle g, h); `:552-555` entfällt
  (`:436` verbietet dem Ausnahme-Job bereits jedes `secrets.`, Verweis im Kommentar); `usesGesamt >= 11` (`:288-293`)
  ⇒ `>= 10` samt Kommentar; die `ok()`-Texte `:793-803` nachziehen. Alle Positions-/`if:`-Zusicherungen gelten für den neu
  erkannten Schritt.
- Neu: `StrictHostKeyChecking=yes` vorhanden, `=no`/`accept-new`/`UserKnownHostsFile=/dev/null` abwesend; kein
  `appleboy/ssh-action` in irgendeinem Workflow; kein `set -x`/`xtrace` im Schritt; `timeout-minutes: 15`.
- Je neue/ersetzte Zusicherung ROT/GRÜN-Gegenprobe (Mutation an einer Kopie des Workflows, Regeln wie immer).

## 3. Verhaltenstest (in der Suite, `test_feature_deploy_ssh_wiederholung.js`, registriert)

Liest den `run:`-Text des erkannten Schritts per `js-yaml` aus `deploy.yml` (derselbe Text, keine Kopie) und führt ihn
mit `bash` in einem `os.tmpdir()`-Verzeichnis aus, mit Attrappen `ssh`, `ssh-keyscan`, `ssh-keygen`, `sleep` im `PATH`
und `gh` (kein Netz, kein Server, kein echtes Warten; `RUNNER_TEMP` auf das Tmp-Verzeichnis). VOR der Ausführung:
  Befehlsbestand des `run:`-Textes gegen eine Weissliste (Vorbild `test_feature_deploy_riegel_unversioniert_static.js:
  136-159`: kein `eval`/`source`, keine absoluten Programmpfade ausser dem Deploy-Pfad als Argument), Selbstsperre auf
  `os.tmpdir()` (Vorbild `test_feature_health_gate.js:55-76`); Eintrag MIT Begründung in `AUSNAHMEN` von
  `test_feature_keine_systemeingriffe.js` (`:154-781`, sonst wird das Gate rot). Fälle mit Sollzahl (Literal):
(a) 255 + leer + je EINE der sechs Fehlerzeilen (sechs Unterfälle, Zeilen als Literale im Test) → 2. Versuch 0 mit
„▶ 1/8“ ⇒ grün, 2 ssh-Aufrufe;
(b) viermal (a) ⇒ rot, 4 Aufrufe; (c) stdout „▶ 1/8“ dann 255 ⇒ rot, 1 Aufruf, Satz „Deploy lief an“;
(d) 255 + leer + `Host key verification failed` ⇒ rot, 1 Aufruf; (e) 255 + `Permission denied` ⇒ rot, 1 Aufruf;
(f) Exit 1 (`die`) ⇒ rot, 1 Aufruf; (g) Scan-Fingerabdruck fremd ⇒ 0 ssh-Aufrufe; (h) Scan liefert zwei verschiedene
Zeilen ⇒ 0 ssh-Aufrufe; (i) Scan zwei gleiche Zeilen (Dual-Stack) ⇒ läuft; (j) Scan leer, dann gültig ⇒ läuft;
(l) rc 0 mit leerem stdout ⇒ rot; (m) bei Wiederholung meldet die `gh`-Attrappe eine andere master-Kennung ⇒ rot,
1 ssh-Aufruf; (k) Kanarienwert als `DEPLOY_SSH_KEY`: in keiner Ausgabe (stdout, stderr, Dateien ausser der Schlüsseldatei), und die
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

## Planprüfung Runde 2 — Auswertung (30.09.2026)

Gemessen und NICHT getragen: A2-F6/B2-D-F8b (keyscan-Kommentarzeile — sie geht auf stderr), A2-F7/B2-D-F1
(`HostKeyAlgorithms` nötig — ECDSA-only `known_hosts` wird akzeptiert). Übernommen: A2-F1 (`AUSNAHMEN`), A2-F2
(Wortgrenze), A2-F3 (Vergleich über Verhaltenstest), A2-F4 (entfällt, `:436`), A2-F5 (alle sechs Zeilen), A2-F8
(`PIPESTATUS` — gemessen), A2-F9/B2-D-F3 (Weissliste, Selbstsperre), A2-F10 (Job-Ebene), A2-F11 (`>= 10`), A2-F12
(Wortlaut), A2-B2-Rest (master-Prüfung je Wiederholung), B2-D-F2 (fail2ban ungemessen), B2-D-F5 (rc 0 ohne stdout),
B2-D-F6 (stderr ohne zweites `tee`), B2-D-F8a (zweites Feld). Nur vermerkt: B2-D-F4 (Hänger nach dem Start = Job-Limit),
B2-D-F7 (`ServerAlive`-Meldungen erst nach dem Start ⇒ stdout nicht leer ⇒ keine Wiederholung), A2-F13.

-- Ende des Auftrags --
