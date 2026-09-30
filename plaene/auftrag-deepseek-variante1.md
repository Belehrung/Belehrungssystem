# Auftrag DeepSeek „Variante 1“ — ausführende Prüfspur mit festen Werkzeugen (30.09.2026, Fassung 3)

Fassung 3 nach Planprüfung Runde 2 (`scratchpad/dsv1p/antwort2-{a,b}.txt`, 35 Befunde, selbst nachgemessen — Tabelle
am Ende). Betreiber-Entscheidung 26.09.2026 (CLAUDE.md, „begrenzte Ausführung für DeepSeek“). Repos: Belehrungssystem
(`tools/gegenleser-repo.js`, neues Modul erlaubt) und GymDocu (nur Punkt 6). Einordnung: **sehr komplex** —
Sicherheitsgrenze (fremdes Modell löst Codeausführung aus), und ein falsch grünes oder falsch rotes Werkzeug entwertet
jede spätere Prüfung.

## 0. Grundsatz

Eine Mutation IST Code des Modells, und jede versionierte Datei, die der Test lädt, ist mutierbar — die Werkzeugliste
ist KEINE Fähigkeitsgrenze, die Grenze ist allein die Sandbox. Sie lautet: **der ausgeführte Prozess sieht weder die
Schlüsselablage noch die Umgebung des Werkzeugs, hat kein Netz, und alles, was er schreiben kann, ist nach dem Aufruf
weg.** Der Geheimnis-Riegel bleibt zweite Schicht (blind für kodierte Ausgaben) und erscheint in keiner Zusicherung als
tragend. Benannte Grenze: versionierte Dateien des Zielbaums gelten als geheimnisfrei (abgesichert durch den
gitleaks-Hinweis in GymDocu, nicht durch dieses Werkzeug). Jede Isolationseigenschaft wird zur LAUFZEIT im Kind
gemessen; fehlt eine, wird NICHT ausgeführt (fail-closed).

## 1. Werkzeuge (nur mit Schalter `--ausfuehren`, nur wenn `istDeepseekModell()`; sonst Exit 2)

- Zielbaum ist `--wurzel` (EINE Wurzel für Lesen und Ausführen, kein zweiter Wurzelzustand). Er muss sauber sein
  (`git status --porcelain` leer), sonst Abbruch vor der ersten Runde — Lesen und Ausführen sehen denselben Stand.
- `teste(testdateien[1..3])` und `mutiere_und_teste(datei, alt, neu, testdateien[1..3])`. Testdateien müssen in der
  `TESTS=(`-Liste von `test/run.sh` stehen (gelesen, nicht gestartet). `datei` aus `git ls-files`, Endung `.js`,
  `.cjs`, `.json` oder `.sh`, `istHartGesperrt` gilt, und NICHT: eine der übergebenen Testdateien, `test/run.sh`,
  `test/umgebung.sh`. Genau EINE Fundstelle von `alt`, sonst Ablehnung. Syntaxprüfung je Endung (`node --check`,
  `sh -n`, `JSON.parse`), vor dem Bau an je einer echten GymDocu-Datei gemessen.
- **Grundlauf Pflicht:** `mutiere_und_teste` fährt jede Testdatei zuerst UNMUTIERT (Ergebnis je Lauf und Datei
  zwischengespeichert). Ist der Grundlauf nicht `bestanden`, wird nicht mutiert: Status `grundlauf-rot`.
- **Status je Testdatei, maschinenlesbar** und nur aus Exit-Code und Zeitlimit abgeleitet (nie aus Text der Ausgabe):
  `bestanden` (Exit 0), `gescheitert` (Exit ≠ 0), `zeitlimit`, `umgebung-fehler` (Kind-Aufbau oder Selbstmessung
  gescheitert), `abgelehnt`, `grundlauf-rot`. Der Vorspann sagt: nur `gescheitert` nach `bestanden`em Grundlauf ist ein
  Wirkungsnachweis; `zeitlimit`/`umgebung-fehler`/`grundlauf-rot` sind keiner. Das Ergebnis nennt Datei, sha256 des
  Mutations-Diffs, gelaufene Testdateien.
- **Kein Zustand zwischen Aufrufen:** je Aufruf eine FRISCHE Kopie (aus einem je Lauf einmal angelegten
  `git clone --no-local` des Zielbaums, kein Worktree, im Klon wird nie committet), danach gelöscht; `node_modules` als
  Bind-Mount ro.

## 2. Isolation

Ablauf je Testdatei: `timeout -k 5 <T> unshare --mount --net --pid --ipc --uts --fork --kill-child --mount-proc
<aufbau.sh>` — `aufbau.sh` liegt im Belehrungssystem (nie im mutierbaren Baum), läuft als root im neuen Namensraum:
Mounts, `ip link set lo up`, dann `setpriv --reuid=65534 --regid=65534 --clear-groups --no-new-privs env -i <Liste>
sh -c '. test/umgebung.sh; <DB-Variablen setzen>; exec node <testdatei>'`.

- **Mounts:** tmpfs über `/workspace`, `/home`, `/root`, `/tmp`, `/var/tmp`, `/dev/shm`, `/var/www`, `/run`,
  `/var/lib/postgresql`, `/etc/postgresql`, `/srv`, `/mnt`, `/media`, `/var/spool`; eingebunden nur Aufruf-Kopie (rw),
  `node_modules` (ro), Socket-Ordner des eigenen Clusters.
- **Umgebung konstruktiv (`env -i`, nichts geerbt):** `PATH=<dirname(process.execPath)>:/usr/bin:/bin`,
  `HOME=<tmpfs-Pfad>`, `NODE_ENV` wie im Gate, danach nur was `test/umgebung.sh` IM KIND setzt (seine `mktemp -d`
  entstehen damit im tmpfs-`/tmp`), danach `DATABASE_URL`/`PGHOST`/`PGPORT`/`PGUSER`/`PGDATABASE` auf die Aufruf-DB
  ÜBERSCHRIEBEN. `TZ` wird nicht gesetzt — wie im Gate (`test/run.sh` setzt keine; gemessen).
- **Selbstmessung im Kind** (einmal je Lauf im Kanarien-Aufruf, Punkt 4; fail-closed, jede mit ROT/GRÜN-Paar im
  Selbsttest): uid/gid 65534, keine Zusatzgruppen; `/proc` zeigt nur Namensraum-PIDs; **Menge der für 65534
  schreibbaren Verzeichnisse = Sollliste** (Kopie + tmpfs-Pfade; `find` über `/` ohne `/proc`,`/sys`,`/dev`-Rest) —
  statt einzelner Pfadproben; `/workspace` enthält nur die Kopie, der Originalbaum ist nicht erreichbar; Umgebung =
  genau die Allowlist plus die Namen aus `test/umgebung.sh` (Verbotsliste `*_KEY*`, `*_TOKEN*`, `*PASSWOR*`,
  `OPENROUTER*`, `TELEGRAM*`, `DEEPSEEK*` leer, Selbsttest setzt `DEEPSEEK_API_KEY` im Elternprozess); TCP nach aussen
  und zum Proxy scheitert, `127.0.0.1` gegen einen im Kind gestarteten Horcher gelingt (gemessen: ohne `lo up`
  ENETUNREACH); `node -e 0` als 65534 gelingt; Zeitzone des Node-Prozesses = die des Elternprozesses (Literal im
  Protokoll).
- **Zeitlimit von aussen mit KILL:** gemessen 30.09.: `timeout 2 unshare --pid --fork … sleep 30` endet erst nach
  30 014 ms (PID 1 ignoriert SIGTERM), mit `timeout -k 1 2` nach 3 005 ms. Selbsttest „Test schläft ewig“ belegt:
  Kind nach ≤ T+6 s weg, Status `zeitlimit`.

## 3. Datenbank: eigener Postgres-Cluster

Je Lauf `pg_createcluster 16 dsv1<zufall> --socketdir /run/dsv1-<zufall>`, `listen_addresses = ''`, `pg_hba.conf`
geschrieben mit GENAU `local all postgres peer` und `local all nobody peer`. Rolle `nobody`: LOGIN, ohne SUPERUSER,
CREATEDB, CREATEROLE, ohne `pg_execute_server_program`/`pg_read_server_files`/`pg_write_server_files`. Vorlage: von
`nobody` gebaut (init + runMigrations wie `test/run.sh`, Objekte gehören `nobody`), danach vom Verwalter
`ALTER DATABASE … OWNER TO postgres ALLOW_CONNECTIONS false IS_TEMPLATE true`. Je Aufruf erzeugt der Verwalter
`CREATE DATABASE … TEMPLATE … OWNER nobody`, danach `DROP DATABASE … WITH (FORCE)`. Am Lauf-Ende Cluster gelöscht.
Selbstmessung im Kind (je ROT/GRÜN): `rolsuper` false; Verbindung als `postgres` scheitert; Verbindung zur Vorlage
scheitert; `COPY … TO PROGRAM` scheitert; `current_database()` = Aufruf-DB; Haupt-Socket nicht erreichbar. Tests, die
selbst Datenbanken anlegen (Textsuche trifft 6 Dateien, davon 4 `_static` — welche wirklich anlegen, misst der Bau per
Grundlauf und nennt sie im Bericht), laufen als `grundlauf-rot` auf — das ist korrekt, nicht zu umgehen.

## 4. Deckel und Ausgabe

- Kanarienvogel: der erste Aufruf je Lauf fährt die Selbstmessung plus einen trivialen registrierten Test; nicht grün
  ⇒ keine weitere Ausführung.
- Je Testdatei T = 300 s; höchstens 30 Werkzeugaufrufe und 45 min Ausführungszeit je Lauf — wer zuerst greift; beide
  mit eigenem ROT/GRÜN-Fall (kleine Werte über Selbsttest-Schalter). `--max-runden` wird NICHT verändert.
- In den Modellkontext je Aufruf höchstens 8 KB (Bytes, auf UTF-8-Grenze gekürzt, mit „gekürzt“-Hinweis): Status,
  Exit, erste und letzte Fehlerzeilen, keine Dauer als Zahl. Ausführungsausgaben zählen in den bestehenden
  600-KB-Gesamtdeckel; dessen Verhalten (lauter Abbruch) bleibt. Zusicherung am aufgezeichneten Anfragekörper: kein
  Werkzeugergebnis > 8 KB.
- Geheimnis-Riegel auf die Ausführungsausgabe: ein Treffer verwirft NUR dieses Ergebnis („Ausgabe verworfen:
  Riegel“), nie den Lauf.
- Protokoll: Volltext je Aufruf höchstens 1 MB (Rest gezählt, verworfen).
- Zähler `ausfuehrungen`, `mutationen`, Ausführungs-Ablehnungen getrennt in Laufprotokollzeile, Zusammenfassung und
  `ASTRA-LAEUFE.md`.
- Bricht die Isolation ab: keine weitere Ausführung, aber eine letzte Runde ohne Werkzeuge mit Marker
  „AUSFÜHRUNG ABGEBROCHEN — Belege nach Aufruf N fehlen“; Exit ≠ 0.

## 5. Aufräumen

Ein Ausführungslauf zur Zeit: `flock` auf `/var/lock/dsv1.lock` über den ganzen Lauf (nicht wartend, sonst Abbruch).
Mit gehaltener Sperre sind Reste früherer Läufe (Cluster `dsv1*`, `/workspace/dsv1-*`, `/run/dsv1-*`) tot: melden,
entfernen. Der Lauf führt eine Besitzliste (Cluster, Socketdir, Klon, Kopien) und räumt nur diese; nach dem Lauf und
bei SIGINT/SIGTERM des Werkzeugs (Kindaufrufe asynchron, damit der Handler greift): alles entfernen; Aufräumfehler laut.

## 6. Umgebung wie im Gate (GymDocu, kleiner eigener Beitrag)

Die Umleitungen (`PDF_ROOT`, `QR_VERBRAUCH`, `LAGEPLAN_UPLOAD_DIR` u. a., samt ihren `mktemp -d`) aus `test/run.sh` in
`test/umgebung.sh` auslagern; `test/run.sh` sourct sie (EIN Ort). `DATABASE_URL` und alles DB-Bezogene bleibt in
`test/run.sh`. Wächter: `test/run.sh` bindet `test/umgebung.sh` ein, und `test/umgebung.sh` setzt kein `DATABASE_URL`.
Aufräumen der `mktemp`-Verzeichnisse bleibt, wo es heute ist (Gate-Verhalten unverändert; volle Suite + Dateizahl).

## 7. Zusicherungen und CI

`--selbsttest-ausfuehrung` (neu; `--selbsttest` behält seine literale Fallzahl). Je Riegel ROT/GRÜN; Sicherheitsfälle
mit ECHTEM Kind. Werkzeug-NAMEN literal (ohne Schalter `suche,lies`, mit `suche,lies,teste,mutiere_und_teste`) gegen
den aufgezeichneten Anfragekörper, plus je Name ein Aufruf durch den echten Dispatch (nie „unbekannte Funktion“).
Nicht-DeepSeek-Modell oder fehlendes `--modell` mit `--ausfuehren` ⇒ Exit 2. Mutationsziel = Testdatei ⇒ Ablehnung.
Kein Zustand: Datei in der Kopie UND in `/var/tmp` aus Aufruf n ist in n+1 weg; Vorlagen-Änderung aus Aufruf n
unmöglich. Aufräumen nach echtem SIGKILL + Neustart. **CI:** eigener Job in `ci.yml`, erster Schritt misst und druckt
die Voraussetzungen (`psql --version`, `pg_createcluster`, `unshare`, `setpriv`, sudo ohne Passwort); `sudo` nur in
den Schritten, die es brauchen; fehlt etwas bei `CI=true` → ROT mit Namen der Voraussetzung, nie SKIP; eine
Nachinstallation nur, wenn der erste CI-Lauf des PR sie als nötig zeigt (Ergebnis in den Bericht). Lokal ohne root →
sichtbares SKIP mit Zahl.

## Messung (Bericht)

Echter Lauf gegen `/workspace/gymdocu-dbinit` (`test_feature_db_init_schema_stand.js`): Kanarie, Grundlauf, bekannte
Mutation (`SET LOCAL lock_timeout` entfernt → `gescheitert`), wörtlich. Vorher-/Nachher-Schnappschuss: `pg_lsclusters`,
DB-Liste des Haupt-Clusters, `ls /workspace`, `/run`, `/var/tmp`, `/dev/shm` — Differenz leer. Selbstmessung aus dem
Kind wörtlich. Der erste CI-Lauf des Belehrungssystem-PR mit dem neuen Job (Voraussetzungsausdruck wörtlich).

## Zustandsfrage

Welcher Zustand entsteht, den es vorher nicht gab — und welcher Weg bleibt dem Modell, etwas zu lesen oder
hinauszuschicken, das über „eine registrierte Testdatei gegen eine Wegwerf-DB im eigenen Cluster“ hinausgeht?

## Planprüfung Runde 2 — Auswertung (selbst gemessen 30.09.2026)

Übernommen: A-B1 (Testdatei als Mutationsziel), A-B2/B-B8 (Status aus Exit, Grundlauf), A-B3/B-B10 (umgebung.sh im
Kind; gemessen: `test/run.sh` legt 11 Verzeichnisse per `mktemp -d` an), A-B4/B-B3 (`/var/tmp`, `/dev/shm` 1777 — gemessen; statt Liste
die Schreibmenge messen), A-B5/B-B2 (Env konstruktiv; Schlüssel liegt im Normalfall in `process.env`,
`gegenleser-repo.js:471`), A-B6 (lo — gemessen ENETUNREACH ohne `lo up`; `--ipc`), B-B4 (PID 1 — gemessen 30 014 ms),
B-B1/A-B8/B-B5 (pg_hba, Rechte, Vorlage), A-B9/B-Fr4 (8-KB-Kappung als Messung), A-B10/B-B11 (Sperre, Besitzliste),
A-B11 (`VORGABE_MAX_RUNDEN` ist schon 40 — Anheben gestrichen), A-B12, A-B13, A-B14/B-B9 (eine Wurzel, sauberer Baum),
A-B16, A-B17, A-B19, B-B12 (PATH/HOME), B-B14, B-Fr4.1 (Namen + Dispatch), A-F4c (Vorher-Schnappschuss).
Anders gelöst: A-B7 (keine Fehlrechnung — beide Deckel gelten, wer zuerst greift; je eigener Fall); B-B6 (Zeitzone:
`test/run.sh` setzt keine, das Werkzeug spiegelt das Gate statt Berlin zu setzen; eine wählbare Zeitzone für die
TZ-Fallenklasse → Sammelliste); B-B15 (Geheimnisse im Zielbaum: benannte Grenze, gitleaks); A-B18/B-B13 (Messung der
Runner-Ausstattung im ersten CI-Lauf des PR). Nur vermerkt: A-B20 (Repo-Hooks gelten für diesen Weg nicht; Löschregel
steht im Modul, Punkt 5).

-- Ende des Auftrags --
