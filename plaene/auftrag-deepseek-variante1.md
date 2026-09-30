# Auftrag DeepSeek „Variante 1“ — ausführende Prüfspur mit festen Werkzeugen (30.09.2026, Fassung 2)

Fassung 2 nach Planprüfung `scratchpad/dsv1p/antwort-{a,b}.txt` (beide Spuren: die Sicherheitsgrenze darf NICHT am
Geheimnis-Riegel hängen, weil der ausgeführte Code seine Ausgabe selbst formt; Zustandsbegriff widersprüchlich;
CI-SKIP macht die Riegel wirkungslos; Test-Umgebung ≠ `test/run.sh`; `CONNECT` ist an PUBLIC vergeben).

Betreiber-Entscheidung 26.09.2026 (CLAUDE.md, „begrenzte Ausführung für DeepSeek“). Repos: Belehrungssystem
(`tools/gegenleser-repo.js`, neues Modul erlaubt) und GymDocu (nur Punkt 5). Einordnung: **sehr komplex** —
Sicherheitsgrenze (fremdes Modell löst Codeausführung aus), und ein falsch grünes Werkzeug entwertet jede spätere Prüfung.

## 0. Grundsatz

Eine Mutation IST Code des Modells. Die Grenze ist deshalb: **der ausgeführte Prozess SIEHT kein Geheimnis und hat
kein Netz** — nicht „die Ausgabe wird geschwärzt“. Der Geheimnis-Riegel bleibt als zweite Schicht, wird aber im Text
ehrlich so beschrieben (kodierte Ausgaben erkennt er nicht). Jede Isolationseigenschaft wird zur LAUFZEIT im Kind
gemessen; fehlt eine, wird NICHT ausgeführt (fail-closed, strukturierte Ablehnung, Lauf bricht laut ab).

## 1. Werkzeuge (nur mit Schalter `--ausfuehren=<GymDocu-Baum>`, nur für DeepSeek-Modelle)

- `teste(testdateien[1..3])` und `mutiere_und_teste(datei, alt, neu, testdateien[1..3])`. `datei` aus der
  `git ls-files`-Liste des ZIELbaums, `istHartGesperrt` gilt (keine `.env*`, `.key`, `.pem`); Testdateien müssen in der
  `TESTS=(`-Liste von `test/run.sh` des Zielbaums stehen (gelesen, nicht gestartet). Genau EINE Fundstelle von `alt`,
  sonst Ablehnung. Syntaxprüfung je Typ (`node --check`, `sh -n`, `JSON.parse`), sonst Ablehnung — ausdrücklich keine
  Sicherheitsprüfung.
- **Zustand:** keiner zwischen Aufrufen. Je Aufruf eine FRISCHE Kopie (aus einem je Lauf einmal angelegten
  `git clone --no-local` des Zielbaums, kein `git worktree`, keine Verbindung zum `.git` des Zielbaums), nach dem Aufruf
  gelöscht. `node_modules` schreibgeschützt eingebunden (Bind-Mount ro), nie Symlink.
- Werkzeugfehler (0/2 Fundstellen, nicht registriert, Zeitlimit, Test rot) kommen als Ergebnis zurück, die Sitzung lebt
  weiter; Isolations- und Infrastrukturfehler brechen den ganzen Lauf laut ab.

## 2. Isolation (je Punkt im Kind gemessen, sonst keine Ausführung)

- `unshare --mount --net --pid --fork --mount-proc`, dann `setpriv --reuid=65534 --regid=65534 --clear-groups
  --no-new-privs`. Mount-Namensraum: tmpfs über `/workspace`, `/home`, `/root`, `/tmp`, `/var/www`, `/run`,
  `/var/lib/postgresql`; eingebunden nur die Aufruf-Kopie (rw), `node_modules` (ro), der Socket-Ordner des eigenen
  Clusters (Punkt 3), `/usr/share/zoneinfo`.
- **Selbstmessung im Kind vor dem Test** (fail-closed): uid 65534; `/proc` zeigt nur eigene PIDs; `/tmp/claude-0` und
  `/workspace/*/.env` nicht vorhanden; TCP-Verbindung nach aussen und zum Proxy scheitert; `date +%Z` mit `TZ=Europe/Berlin`
  liefert CEST/CET; Umgebung enthält keine der Variablen, die der Werkzeugprozess selbst gesetzt hat (Selbsttest setzt
  absichtlich eine Schlüsselvariable im Elternprozess und belegt ihr Fehlen im Kind).

## 3. Datenbank: eigener Postgres-Cluster

Kein Zugriff auf den Haupt-Cluster (dort ist `CONNECT` an PUBLIC vergeben, der Suite-/Entwicklungsbestand liegt dort).
Je Lauf ein eigener Cluster (`pg_createcluster 16 dsv1<zufall> --port <frei> --socketdir /run/dsv1-<zufall>`), darin die
Vorlage (init + runMigrations wie `test/run.sh`) und je Aufruf eine frische DB aus der Vorlage; Rolle ohne Superuser;
am Lauf-Ende Cluster gelöscht. Messen: aus dem Kind ist nur dieser Cluster erreichbar (Haupt-Socket nicht eingebunden).

## 4. Deckel und Ausgabe (mit Zahlen)

Je Testdatei 300 s (Prozessgruppe getötet); je Aufruf in den Modellkontext höchstens 8 KB (Datei, Exit, PASS/FAIL,
erste Fehlerzeilen), Volltext nur in die Protokolldatei; höchstens 30 Aufrufe je Lauf; Gesamtzeit 45 min; `--max-runden`
wird automatisch auf Aufrufdeckel + 10 gehoben; der 600-KB-Gesamtdeckel bleibt und darf durch Werkzeugausgaben nicht
reissen (Zusicherung). Der Vorspann (`WERKZEUG_ABSATZ`) beschreibt die neuen Mittel ehrlich, nur im Ausführmodus.

## 5. Umgebung wie im Gate (GymDocu)

Die Umleitungen der Suite (`PDF_ROOT`, `QR_VERBRAUCH`, `LAGEPLAN_UPLOAD_DIR` u. a.) stehen heute nur in `test/run.sh`.
Kleiner GymDocu-Beitrag: sie in `test/umgebung.sh` auslagern, das `test/run.sh` und das Werkzeug beide einlesen (EIN
Ort); Wächter, dass `test/run.sh` es einbindet. Das Werkzeug gibt die gefahrene Umgebung (ohne Werte, die Geheimnisse
sein könnten) im Protokoll aus.

## 6. Aufräumen

Vor jedem Lauf: Reste früherer Läufe (Präfix `dsv1`: Cluster, `/workspace/dsv1-*`, `/run/dsv1-*`) finden, melden,
entfernen. Nach dem Lauf und bei Signal: alles entfernen; ein Aufräumfehler wird laut gemeldet, nie verschluckt.

## 7. Zusicherungen und CI

Selbsttest `--selbsttest-ausfuehrung` (neu, getrennt vom bestehenden `--selbsttest`, dessen Fallzahl literal bleibt).
Je Riegel ein Fall mit ROT/GRÜN-Gegenprobe; die Sicherheitsfälle mit ECHTEM Kindprozess (Datei in `/tmp/claude-0`-Attrappe
nicht lesbar, Netzversuch scheitert, fremde PID nicht sichtbar, Schlüsselvariable fehlt, Zweitdatei in der Kopie ist beim
nächsten Aufruf weg, Aufräumen nach echtem SIGKILL + Neustart). Geschwärzt-Fall zählt Fragmente unabhängig (Soll 0).
Werkzeuganzahl literal: ohne Schalter 2, mit Schalter 4. **CI:** eigener Job in `.github/workflows/ci.yml` mit `sudo`
(Postgres auf dem Runner installieren/starten — messen, was ubuntu-latest mitbringt); fehlt dort eine Voraussetzung
bei `CI=true` → ROT, nie SKIP. Lokal ohne root → sichtbares SKIP mit Zahl.

## Messung (Bericht)

Echter Lauf gegen `/workspace/gymdocu-dbinit` (DB-INIT, `test_feature_db_init_schema_stand.js`): Grundlauf und eine
bekannte Mutation (`SET LOCAL lock_timeout` entfernt → ROT), wörtlich; danach Nachweis: kein Cluster, keine Kopie, kein
`/run/dsv1-*`, Haupt-Cluster und `gymdocu_test` unberührt. Dazu die Selbstmessung aus dem Kind (Punkt 2) wörtlich.

## Zustandsfrage

Welcher Zustand entsteht, den es vorher nicht gab — und welcher Weg bleibt dem Modell, etwas zu lesen oder
hinauszuschicken, das über „eine registrierte Testdatei gegen eine Wegwerf-DB im eigenen Cluster“ hinausgeht?

-- Ende des Auftrags --
