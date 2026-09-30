# Auftrag DeepSeek „Variante 1“ — ausführende Prüfspur mit festen Werkzeugen (30.09.2026, Fassung 4)

Fassung 4 nach Planprüfung Runde 3 (`scratchpad/dsv1p/antwort3-{a,b}.txt`; Auswertung am Ende). Betreiber-Entscheidung
26.09.2026 (CLAUDE.md, „begrenzte Ausführung für DeepSeek“: genau eine Stelle ändern, EINE registrierte Testdatei gegen
eine eigene `_test`-DB, unprivilegiert, Ausgabe durch den Riegel, automatisch zurücksetzen) und 27.09.2026 (DeepSeek nur
`deepseek-flash`). Zwei Beiträge, nacheinander:

- **Teil G (GymDocu, zuerst):** reine Auslagerung, Gate-Verhalten gleich. Einordnung: Standard.
- **Teil W (Belehrungssystem):** das Werkzeug. Einordnung: **sehr komplex** — Sicherheitsgrenze (fremdes Modell löst
  Codeausführung aus), und ein falsch grünes oder falsch rotes Werkzeug entwertet jede spätere Prüfung.

## 0. Grundsatz

Eine Mutation IST Code des Modells, jede versionierte Datei, die der Test lädt, ist mutierbar — die Grenze ist allein
die Sandbox: **der ausgeführte Prozess sieht weder die Schlüsselablage noch die Umgebung des Werkzeugs, hat kein Netz,
und alles, was er schreiben kann, ist nach dem Lauf weg.** Der Geheimnis-Riegel bleibt zweite Schicht (blind für
kodierte Ausgaben), nie tragend. Benannte Grenze: der versionierte Arbeitsstand des Zielbaums gilt als geheimnisfrei
(gitleaks-Hinweis in GymDocu); die Historie liegt nicht in der Kopie. Das Werkzeug spiegelt das **CI-Gate**
(`ci.yml`: `CI=true`, ubuntu, UTC) — was die Sandbox nicht bieten kann, wird dadurch im Grundlauf ROT, nie still
übersprungen.

## Teil G — `test/umgebung.sh` und `test/db-vorbereiten.js` (GymDocu)

- `test/run.sh:395-592` (alle Exporte vor der Testschleife ausser `DATABASE_URL`: `PUBLIC_BASE_DOMAIN`,
  `GYMDOCU_BOOT_SMOKE_STARTPFAD`, die 11 `mktemp -d`-Wurzeln samt Erfolgsprüfung, `QR_VERBRAUCH`, beide
  `NODE_OPTIONS`-Vorladungen) wandern nach `test/umgebung.sh`. Sie wird von `bash` gesourct (in `run.sh` wie im Kind),
  erwartet als cwd die Repo-Wurzel und prüft das selbst (sonst `return 1`). `run.sh` sourct sie an derselben Stelle, HINTER dem
  Sperrblock (`test_feature_suite_laufsperre.js:97-104` kopiert dessen Kopf wörtlich).
- Die Migrations-Vorbereitung (`test/run.sh`, `node -e` mit `db.init()` + `runMigrations`) wird `test/db-vorbereiten.js`;
  `run.sh` ruft sie auf. Aufräumen der `mktemp`-Verzeichnisse bleibt, wo es ist.
- `test_feature_run_sh_wegwerf_variablen_static.js` liest ab jetzt `test/umgebung.sh` (Literalliste unverändert);
  neuer Wächter: `run.sh` sourct `umgebung.sh` und ruft `db-vorbereiten.js`; `umgebung.sh` setzt kein `DATABASE_URL`.
- Nachweis: volle Suite, Dateizahl-Ritual, Summe PASS/FAIL gegen den Lauf auf `origin/master` (gleich, bis auf die
  neuen Wächterfälle); Gegenprobe je neuem Wächter.

## Teil W — Werkzeug

### 1. Werkzeuge (nur mit `--ausfuehren`, nur mit `--modell=deepseek-flash`; sonst Exit 2)

- Zielbaum = `--wurzel` (EINE Wurzel). Er muss sauber sein und `test/umgebung.sh` + `test/db-vorbereiten.js` haben,
  sonst Abbruch vor der ersten Runde.
- `teste(testdatei)` und `mutiere_und_teste(datei, alt, neu, testdatei)` — GENAU EINE Testdatei, aus der
  `TESTS=(`-Liste von `test/run.sh` (gelesen, nicht gestartet). `datei` aus `git ls-files`, Endung `.js`/`.cjs`/
  `.json`/`.sh`/`.sql`, `istHartGesperrt` gilt, nicht die Testdatei, nicht `test/run.sh`/`test/umgebung.sh`. Genau EINE
  Fundstelle von `alt`. Syntaxprüfung je Endung (`.sql` ohne), vor dem Bau an echten Dateien gemessen.
- **Grundlauf Pflicht:** `mutiere_und_teste` fährt die Testdatei erst UNMUTIERT (je Lauf und Datei zwischengespeichert);
  nicht `bestanden` ⇒ keine Mutation, Status `grundlauf-rot`.
- **Status aus einem Exit-Vertrag, nie aus Ausgabetext:** `aufbau.sh` endet mit 0/1 = Test bestanden/gescheitert,
  mit 100+Stufe bei eigenem Fehler (Mount, lo, setpriv, Selbstmessung, DB-Vorbereitung); `timeout` 124 UND 137 =
  `zeitlimit`. Status: `bestanden`, `gescheitert`, `zeitlimit`, `umgebung-fehler`, `abgelehnt`, `grundlauf-rot`,
  `ausgabe-verworfen` (Status bleibt, nur Zeilen fallen). Nur `gescheitert` nach bestandenem Grundlauf ist ein
  Wirkungsnachweis — so im Vorspann. Jeder Wert mit ROT/GRÜN-Fall.
- **Vorbereitung je Testlauf** (Grundlauf und Mutation getrennt): frische Kopie (aus einem je Lauf angelegten
  `git clone --no-local --depth 1`, danach `chown -R 65534:65534`), frische DB (Punkt 3), `test/db-vorbereiten.js` IM
  Kind aus der Kopie — Init-/Migrations-Mutationen wirken also wie im Gate. Danach Kopie und DB weg.

### 2. Isolation

- Der Spawn von `timeout` bekommt schon eine konstruierte Umgebung (Allowlist, kein Erbe). Kette:
  `timeout -k 5 300 unshare --mount --net --pid --ipc --uts --fork --kill-child --mount-proc aufbau.sh`. `aufbau.sh`
  liegt im Belehrungssystem, ist PID 1 (wartet auf den Test, `exec`t nicht), als root: `mount --make-rprivate /`,
  Kopie und Socket-Ordner zuerst von ihrem Ort ausserhalb aller überdeckten Bäume (`/var/lib/dsv1/<lauf>/…`) an feste
  Einhängepunkte (`/dsv1/kopie`, `/dsv1/pg`) binden, DANN tmpfs über `/workspace`, `/home`, `/root`, `/tmp`,
  `/var/tmp`, `/dev/shm`, `/var/www`, `/run`, `/var/lib/postgresql`, `/var/lib/dsv1`, `/etc/postgresql`, `/srv`, `/mnt`,
  `/media`, `/var/spool`; `node_modules` und `$PLAYWRIGHT_BROWSERS_PATH` ro; `ip link set lo up`; `cd /dsv1/kopie`;
  `setpriv --reuid=65534 --regid=65534 --clear-groups --no-new-privs env -i <Allowlist> bash -c '. test/umgebung.sh &&
  node test/db-vorbereiten.js && node <testdatei>'`.
- **Kind-Umgebung:** `PATH=<dirname(execPath)>:/usr/bin:/bin`, `HOME=/tmp`, `CI=true`, `PLAYWRIGHT_BROWSERS_PATH`,
  `DATABASE_URL=postgresql://nobody@/gymdocu_test?host=/dsv1/pg&port=<Clusterport>`, dazu was `umgebung.sh` setzt. Kein `TZ`.
- **Selbstmessung** (fail-closed, eigene Stufe vor der DB-Vorbereitung; Sollwerte sind HANDGESCHRIEBENE Literale im
  Werkzeug, nie aus der Mount-Liste oder aus `umgebung.sh` gebildet): uid/gid 65534; `/proc` nur Namensraum-PIDs;
  Menge der für 65534 schreibbaren Verzeichnisse = Literalliste; Namen der Kind-Umgebung = Literalliste (weicht
  `umgebung.sh` ab, ist das ein Werkzeug-Befund, Abbruch); `/workspace` leer, Originalbaum unerreichbar; sha256 der
  Testdatei und der mutierten Datei = Erwartung aus dem Elternprozess; `/proc/1/environ` für 65534 nicht lesbar;
  TCP nach aussen und zum Proxy scheitert, `127.0.0.1` gegen einen eigenen Horcher gelingt; Zeitzone des Node-Prozesses
  = `UTC` (Literal: die des CI-Gates; der Host setzt sie heute ebenso, gemessen).
- Zeitlimit von aussen mit KILL (gemessen 30.09.: SIGTERM allein 30 014 ms, `-k` 3 005 ms). Selbsttest „schläft ewig“
  belegt ≤ 306 s und Status `zeitlimit`.

### 3. Datenbank: eigener Cluster, frische DB je Testlauf

Je Lauf `pg_createcluster 16 dsv1<zufall>`, Socket-Ordner unter `/var/lib/dsv1/<lauf>/pg` (vom Werkzeug angelegt,
postgres schreibt, 65534 darf durchqueren), `listen_addresses=''`, `pg_hba.conf` genau `local all postgres peer` und
`local all nobody peer`. Rolle `nobody`: LOGIN, CREATEDB, ohne SUPERUSER, CREATEROLE und ohne die Rollen
`pg_execute_server_program`/`pg_read_server_files`/`pg_write_server_files`. Vor JEDEM Testlauf: `DROP DATABASE IF EXISTS
gymdocu_test WITH (FORCE)`, `CREATE DATABASE gymdocu_test OWNER nobody` (Name wegen `core/db.js:330` und
`test_feature_migration_0060_loeschauftrag.js:32-33`). Am Lauf-Ende Cluster gelöscht. Selbstmessung (je ROT/GRÜN):
`rolsuper` false; Verbindung als `postgres` scheitert; `COPY … TO PROGRAM` scheitert; Haupt-Socket unerreichbar.

### 4. Deckel und Ausgabe

- Kanarie: der erste Aufruf je Lauf fährt Selbstmessung + einen trivialen registrierten Test; nicht grün ⇒ keine
  Ausführung mehr.
- Höchstens 30 Werkzeugaufrufe und 45 min Ausführungszeit je Lauf, wer zuerst greift (ein Aufruf = bis 2 × 306 s); je
  eigener ROT/GRÜN-Fall. `--max-runden` bleibt unberührt.
- Je Werkzeugergebnis höchstens 8 KB in den Modellkontext (Bytes, UTF-8-Grenze, Status und Exit immer vollständig), keine
  Dauer als Zahl; zählt in den 600-KB-Gesamtdeckel (Verhalten dort unverändert). Zusicherung am aufgezeichneten
  Anfragekörper. Riegel-Treffer: nur die Zeilen fallen (`ausgabe-verworfen`), gezählt. Protokoll-Volltext ≤ 1 MB je
  Aufruf.
- Zähler `ausfuehrungen`, `mutationen`, Ausführungs-Ablehnungen in Protokollzeile, Zusammenfassung, `ASTRA-LAEUFE.md`.
- Isolationsabbruch: keine Ausführung mehr, letzte Runde ohne Werkzeuge mit Marker „AUSFÜHRUNG ABGEBROCHEN — Belege nach
  Aufruf N fehlen“, Exit ≠ 0.

### 5. Aufräumen

`flock -n` auf `/var/lock/dsv1.lock` über den ganzen Lauf (belegt ⇒ Abbruch). Mit gehaltener Sperre sind Reste früherer
Läufe (Cluster `dsv1*`, `/var/lib/dsv1/*`) tot: melden, entfernen. Besitzliste je Lauf; nach dem Lauf und bei
SIGINT/SIGTERM des Werkzeugs (Kinder asynchron, damit der Handler greift) alles entfernen; Aufräumfehler laut.

### 6. Zusicherungen und CI

`--selbsttest-ausfuehrung` mit eigener literaler Fallzahl (`--selbsttest` behält seine). Werkzeug-NAMEN literal (ohne
Schalter `suche,lies`, mit `suche,lies,teste,mutiere_und_teste`) gegen den aufgezeichneten Anfragekörper, plus je Name ein
Aufruf durch den echten Dispatch. Modell ≠ `deepseek-flash` mit `--ausfuehren` ⇒ Exit 2. Mutationsziel = Testdatei ⇒
Ablehnung. Kein Zustand: Datei in Kopie und `/var/tmp` sowie eine Tabelle aus Testlauf n sind in n+1 weg. Zusätzliche
schreibbare Stelle (tmpfs-Pfad gestrichen) ⇒ Selbstmessung ROT. Aufräumen nach echtem SIGKILL + Neustart. **CI:**
eigener Job in `ci.yml`, erster Schritt druckt die Voraussetzungen (`psql --version`, `pg_createcluster`, `unshare`,
`setpriv`, sudo ohne Passwort); `sudo` nur, wo nötig; fehlt etwas bei `CI=true` ⇒ ROT mit Namen, nie SKIP;
Nachinstallation nur, wenn der erste CI-Lauf des PR sie als nötig zeigt. Lokal ohne root ⇒ sichtbares SKIP mit Zahl.

## Messung (Bericht Teil W)

Echter Lauf gegen einen GymDocu-Baum mit Teil G (`test_feature_db_init_schema_stand.js`): Kanarie, Grundlauf, bekannte
Mutation (`SET LOCAL lock_timeout` entfernt → `gescheitert`), wörtlich. Grundlauf-Ergebnis für die 6 DB-anlegenden
Kandidaten, `test_feature_netzsperre.js`, `test_feature_dateisperre.js`, `ops/boot-smoke.js` und eine Chromium-Datei
(je Status wörtlich). Vorher-/Nachher-Schnappschuss (`pg_lsclusters`, DB-Liste Haupt-Cluster, `ls /workspace /run
/var/tmp /dev/shm /var/lib/dsv1`): Differenz leer. Selbstmessung wörtlich. Erster CI-Lauf mit dem neuen Job
(Voraussetzungsausdruck wörtlich).

## Zustandsfrage

Welcher Zustand entsteht, den es vorher nicht gab — und welcher Weg bleibt dem Modell, etwas zu lesen oder
hinauszuschicken, oder ein Ergebnis zu erzeugen, das vom CI-Gate abweicht?

## Planprüfung Runde 3 — Auswertung (30.09.2026)

Übernommen: A-F1 (Einhänge-Reihenfolge, feste Punkte, `cd`, sha256 im Kind), A-F2 (Umgebung schon am Spawn), A-F3
(Exit-Vertrag, 137), A-F4 (`--depth 1`), A-F5a (`chown`), A-F6/B-Koll.2 (CREATEDB im Wegwerf-Cluster), A-F7 (EINE
Testdatei, nur `deepseek-flash` — Betreibertext), A-F8/B-F3 (keine Vorlage mehr: frische DB und
`db-vorbereiten.js` aus der Kopie vor JEDEM Testlauf — Vorbild `tools/mutationsprobe.js:543-571`), A-F9 (eigene
Fallzahl), A-F10, A-Fr4a/B-Fr4 (Sollwerte als Literale), B-F1 (Wächter umstellen, hinter dem Sperrblock), B-F2
(`gymdocu_test`), B-F4/F5 (NODE_OPTIONS, PUBLIC_BASE_DOMAIN, BOOT_SMOKE ⇒ ganzer Block 395–592), B-F6 (`CI=true`,
Browserpfad ro). Anders gelöst: A-F5b/B-F8 (Zeitzone: Literal `UTC` des CI-Gates statt Elternprozess). Entfallen:
B-F7 (keine Vorlage mehr), A-Fr4b (ohne `--modell` gilt `gpt-6-sol` ⇒ fällt unter „≠ deepseek-flash“).

Runde 2 (Fassung 3): übernommen bzw. gelöst wie in Fassung 3 beschrieben (Testdatei nicht mutierbar, Status aus Exit,
`/var/tmp`+`/dev/shm`, Env konstruktiv, lo, PID 1, pg_hba/Rechte, 8-KB-Kappung, Sperre+Besitzliste, kein Anheben von
`--max-runden`, Zähler, Protokolldeckel, eine Wurzel, Riegel je Ergebnis, PATH/HOME).

-- Ende des Auftrags --
