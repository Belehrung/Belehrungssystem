# Diffprüfung T2 — Zusicherungen, die nicht rot werden können (25.09.2026)

Zweig `fix-t2-zusicherungen`, Kopf `a29a0dd` (Basis master `a36f5ab`). Executer: volle Suite `SUITE_EXIT=0`,
378 = 378 (`diff` EXIT 0, selbst nachgezählt), Lint 0. Diff selbst gelesen (34 Dateien, ein Produktivcode-Punkt
`core/jahrescheck.js`). Spuren: Claude ausführend (eigener Baum, 27 geänderte Testdateien, Mutationen, eingefrorene
Uhr), `deepseek-v4-pro` mit Repo (30 Runden, ~4,53 $).

| Nr. | Spur | Befund | Nachgemessen | Entscheidung (= Auftrag Nacharbeit 1) |
|---|---|---|---|---|
| T2-B1 | Claude | **`ops/syntax-check.sh`: `node --check a.js b.js` prüft nur die ERSTE Datei** (der Rest sind Skript-Argumente) — mit `xargs -n50` werden ≈13 von 646 Dateien geprüft; V11-7 schreibt „(646 Dateien)“ in die Erfolgsmeldung. Trifft CI (`ci.yml:37`) und Deploy (`ops/deploy.sh:268`). Zähl- und Prüf-`find` sind zwei Kopien derselben Liste | selbst: `node --check gut.js kaputt.js` → EXIT 0, umgekehrt EXIT 1 (Node 22.22.2); Spur: Fehlerdatei an Position 394 → EXIT 0 „fehlerfrei“ | **blockierend** — jede Datei einzeln prüfen (`-n1`, gern `-P`), EINE Dateiliste für Zählung und Prüfung, Selbsttest mit einer Fehlerdatei MITTEN im Stapel (ROT belegen) |
| T2-B2 | Claude, DeepSeek B5 | N-1 `--exclude-standard` wirkt nur auf der git-Seite des Mengenvergleichs; der Scanner liest ignorierte Dateien weiter → eine SAUBERE ignorierte Datei (`core/zz_sauber.bak.js`) macht die Suite rot (99/2), auch als Deploy-Gate; den Anlass (`playwright-report/index.html` mit Rohwert) behebt es nicht | Spur gemessen, Code gelesen | Flag zurücknehmen (symmetrischer Stand); der lokale Anlass → Sammelliste T2-S1 |
| T2-B3 | Claude, DeepSeek B4 | Netz-Attrappen (V17-1, V19-1): `https.request`-Stub fängt nur Options-Objekte; String-URL, `host:"x:443"`, Grossschreibung, Punkt am Ende, `https.get` gehen durch; fetch-Stubs nur `typeof url === 'string'` — `fetch(new URL(…))` in `core/error-tracker.js:73` → 7 Telegram-Aufrufe am Stub vorbei, 69/0; vier wortgleiche Kopien | Spur gemessen | EIN gemeinsamer Helfer (`test/helfer/…`), Host normalisiert (String/URL/Request/Options, klein, ohne Port und Schlusspunkt), `https.get`/`http.*`/`fetch` mitgepatcht, Aufrufe gezählt; wo ein Netzweg angefahren wird, zusichern, dass die Attrappe GETROFFEN wurde |
| T2-B4 | Claude, DeepSeek B3 | V08-1-Test: beide Bestätigungen in derselben Sekunde, nur der Tie-Breaker `id` entscheidet — `geprueft_am ASC, id DESC` → 16/0 (3 von 3), acht Nachbartests grün; `letzte` (Zwölf-Monats-Uhr) hängt jetzt an dieser Richtung | Spur gemessen | Fixtur, in der id- und Zeitreihenfolge auseinanderlaufen; `letzteBestaetigung` literal zusichern |
| T2-B5 | Claude | V25-3: `lastIndexOf("<script>")` trifft kein Tag mit Attribut; `<script nonce>` + `alert(` in validateCheck → NEU 12/0, ALT 8/1 (die Behebung macht blinder); Positivkontrolle prüft nicht, dass der Block validateCheck enthält; Seil-Geschwister (V24-2) nicht mitgezogen (`alert(` in `seilFehlerAusblenden()` → 13/0) | Spur gemessen | `/<script\b[^>]*>/`, `Start < validateCheckStart < Ende` zusichern; Seil ebenso auf den ganzen Skriptblock |
| T2-B6 | Claude, DeepSeek B1 | `ops/staging-smoke.sh`: NICHT GEPRÜFT, danach „PASS: … vollständig erfolgreich“, Exit 0 — `ops/final-verification.sh:188-190` trägt „grün“ ein; statische Zusicherung blind für `elif false` | beide gemessen/gelesen | NICHT-GEPRÜFT zählen, eigene Schlusszeile, eigener Exit-Code; `final-verification.sh` wertet ihn als „nicht geprüft“ (nicht grün, nicht rot); Verhaltensprobe mit Attrappen statt Textmuster |
| T2-B7 | DeepSeek B7 | `ops/staging-smoke.sh:66`: jeder `psql`-Fehler (Verbindung, Timeout) wird als PASS „Staging-Rolle hat keinen Produktionszugriff“ gewertet | gelesen | nur eine ausdrückliche Verweigerung (`permission denied`/Anmeldung abgelehnt) ist PASS; andere Fehler → NICHT GEPRÜFT |
| T2-B8 | Claude, DeepSeek B2 | Wegwerf-Wächter (T1-K4) prüft nur `export X_DIR="$Y"`, nicht „je Lauf frisch“: `export PDF_ROOT="$REPO"` → 13/0 (auch drei Nachbarwächter grün); unquotiertes `$(mktemp …)`, andere Endung, `unset PDF_ROOT` vor der Schleife → grün | Spur gemessen | Zusicherung auf die Zuweisung `Y=$(mktemp -d /tmp/gymdocu-suite-…)` samt Erfolgsprüfung; JEDE `export …_DIR/_ROOT=`-Zeile erfassen (auch andere Formen); kein späteres `unset`/Überschreiben |
| T2-B9 | Claude | Zeitzonen-Behebungen (V18-1, V20-2, V24-1) werden von der Suite nicht bewacht: nur mit Handuhr rot; `eingefrorene-uhr.js` von keinem Test benutzt. Bericht „V18-1 kein ROT reproduzierbar“ ist FALSCH: getraenke ALT am 2026-03-30T00:30+02:00 EXIT 1, gueltigkeit ALT am 2026-10-25T23:30+01:00 16/6; V24-1 mit Randfixtur `isoVorTagen(90)` ALT 17/1 | Spur gemessen | Kindprozess-Läufe mit eingefrorener Uhr an den kritischen Zeitpunkten (und TZ=Pacific/Kiritimati für V20-2) als Teil der Tests; V24-1 Randfixtur aufnehmen; Uhr-Helfer: ISO ohne Versatz ablehnen |
| T2-B10 | Claude | gering: V26-1 `delete kindEnv…` ungeschützt; V23-1/V21-5 ohne Selbsttest; `gueltigkeit_stichtag` nimmt HEUTE aus `core/datum.js` gegen den eigenen Kommentar; V23-2-Diagnose druckt `[object Object]`; V18-2 falsches Rot bei langem Kommentar | Spur gemessen | V26-1: Test setzt selbst ein falsches `GYMDOCU_SUITE_LOCK` in die Umgebung (macht die Zeile tragend); `gueltigkeit_stichtag` unabhängig rechnen; Diagnose berichtigen; V23-1/V21-5-Selbsttest und V18-2 → Sammelliste |
| T2-B11 | DeepSeek B6, B8 | Staging-Test prüft nur den Funktionskopf; Audit-Regex erkennt `integritaet["auditAppend"](` nicht | gelesen | B6 geht in T2-B6 auf; B8 Anmerkung, keine Stelle im Bestand |

Frage 3 (V08-1 im Produktivcode): beide Spuren „richtig“ (TEXT sv-SE, einziger Schreiber, Tie-Breaker, `studio_id`).
Frage 1 (neuer Zustand): Syntax-Gate meldet 646 und prüft ≈13 (vorbestehend, jetzt mit falscher Zahl); saubere
ignorierte Dateien machen die Suite rot; eine unlesbare Datei im rechtsaussagen-Scan blockiert den Deploy (gewollt,
aber unter welchem Nutzer die Suite auf dem Server läuft, ist aus dem Repo nicht belegbar); staging-smoke meldet
NICHT GEPRÜFT als grün.

11 Zeilen, Claude 10 eigene, DeepSeek 8 (5 Überschneidungen: B2, B3, B4, B6, B8). Nur Claude: der Syntax-Check
(blockierend), V25-3-Tag mit Attribut, die Zeitzonenfälle, die Kleinigkeiten. Nur DeepSeek: `psql`-Fehler als PASS.
Keiner gefallen. Die Nacharbeit ändert ein Deploy-Gate (Syntax-Check) → Runde 2 als ausführende Spur.

## Runde 2 — Nacharbeit 1 (Kopf `6ae2bb4` + `06aff34`, 25.09.2026)

Eine Spur (ausführend, eigener Baum). Syntax-Gate: Fehlerdatei an find-Position 1, 2, 205, 281, 410 → neu jeweils
EXIT 123 (alt nur Position 1 rot); Laufzeit 0,43 s → 5,8–6,8 s (4 Kerne), 19,3 s (1 Kern). Runde-1-Mutationen
überwiegend ROT (jahrescheck, `<script nonce>`, Seil-alert, Wegwerf-Formen, mangel, retention, syntax-check).

| Nr. | Befund | Nachgemessen (Spur) | Entscheidung (= Auftrag Nacharbeit 2) |
|---|---|---|---|
| T2-R2-1 | **hoch — Rückschritt:** Exit 2 von `staging-smoke.sh` ist nicht eindeutig (bash-Abbruch durch `set -e`, z. B. Syntaxfehler in der Staging-`.env`, ein Hilfsprogramm mit Exit 2) → `final-verification` trägt `ok:null` ein und meldet insgesamt `ok=true`, EXIT 0; alter Stand: `ok=false`, EXIT 1. Auch ein echtes NICHT GEPRÜFT ergibt insgesamt `ok=true`, während die Liste „FAIL … nicht vollständig geprüft“ druckt | Ende-zu-Ende mit Attrappen (`fv_lauf.sh`) | `null` NUR bei Exit 2 UND letzter Zeile `NICHT VOLLSTÄNDIG GEPRÜFT:`, sonst `false`; Gesamtaussage dreiwertig (Zähler, `ok` nicht `true`, eigener Exit-Code); Liste druckt „NICHT GEPRÜFT“; Verhaltensprobe für `final-verification.sh` |
| T2-R2-2 | Syntax-Check verschluckt `find`-Fehler (`mapfile … < <(find …)`): unlesbares Unterverzeichnis mit kaputter Datei → EXIT 0 „✅ (410 Dateien)“; alt EXIT 1 | als `nobody` gemessen | `wait $!` nach `mapfile` (auf bash 5.2 gemessen: 1 bei scheiterndem find, 0 sonst); Probe |
| T2-R2-3 | Verhaltenstest des Syntax-Checks prüft EINE Position; `"${JS_DATEIEN[@]:1}"`, `[@]:0:JS_ANZAHL-1`, `[@]:0:300` bleiben 4/0 | gemessen | Baum, in dem ALLE Dateien kaputt sind; Menge der gemeldeten = Menge der angelegten (Referenz von aussen) |
| T2-R2-4 | Wegwerf-Wächter: eingerückte Neuzuweisung, `unset -v`, `export -n`, überschriebene Zwischenvariable, unquotierter/zweistufiger/eingerückter Export eines neuen `_DIR` → 40/0; harmlose unquotierte Form falsch rot | gemessen | Laufzeitwache in `test/run.sh` vor der Testschleife (alle neun gesetzt, Präfix `/tmp/gymdocu-suite-`, exportiert per `declare -p`) + statische Zusicherung, dass diese Wache existiert; das statische Muster darf unquotiert akzeptieren |
| T2-R2-5 | Zwei der vier Kindprozess-Tests bewachen eine Kopie: getraenke rechnet im Kind selbst nach (`vorTagenIso` alt → 6 ✓), gueltigkeit `GESTERN` alt → 23/0 | gemessen | die Helfer per `toString()` ins Kind geben wie bei mangel; Stichtage in EINER Funktion |
| T2-R2-6 | V26-1 Fall F trägt nicht: `delete kindEnv…` entfernt → grün (der falsche Pfad ist nur eine andere Datei) | gemessen | Pfad in einem NICHT existierenden Verzeichnis; Kommentar berichtigen |
| T2-R2-7 | Verweigerungserkennung: Shell-Zeile `…/psql: Permission denied` → PASS (Grossschreibung ignoriert); deutsche Meldung → NICHT GEPRÜFT; `no pg_hba.conf entry` → NICHT GEPRÜFT | mit Attrappen | nur Postgres-Meldungen (`FATAL:`/`ERROR:`/`FEHLER:` gefolgt von `permission denied`/`keine Berechtigung`, dazu `no pg_hba.conf entry`/`kein pg_hba.conf-Eintrag`) sind PASS; Probe je Form |
| T2-R2-8 | Netz-Attrappe lässt durch: `https.request(url, {hostname:H})` (Node legt Optionen über die URL), `{hostname:''|null, host:H}` (Rückschritt gegenüber `hostname \|\| host`), `fetch({toString})` | Spion, ohne Netz | Node-Semantik nachbilden (Optionen über URL, `hostname \|\| host`), `String(url)` für fetch; Probe je Form |
| T2-R2-9 | Ausnahmeliste `keine_systemeingriffe` 34 → 40 (ganze Dateien, künftige `child_process` dort unsichtbar); `rechneUnterEingefrorenerUhr` dreimal fast gleich; `execFileSync` ohne `timeout` (ein hängendes Kind blockiert das Deploy-Gate) | gelesen | EIN Helfer unter `test/helfer/` für Kindprozesse mit eingefrorener Uhr, mit `timeout`; nur er in der Ausnahmeliste |
| T2-R2-10 | `GYMDOCU_STAGING_SMOKE_PROD_ROOT` taucht in keiner Ausgabe auf | gemessen | ist sie gesetzt, erste Ausgabezeile nennt sie |

Nach Nacharbeit 2 fährt der Executer die Skripte der Spur (`fv_lauf.sh` u. a., `…/scratchpad/t2r2cc/`) gegen den
neuen Stand und liefert die Zahlen; keine dritte Prüfrunde (Diff lese ich selbst).

## Eigene Lesung Nacharbeit 2 (Commit `9cf820b`, 25.09.2026)

Diff Datei für Datei gelesen (19 Dateien). R2-1 bis R2-10 umgesetzt wie entschieden; die Zahlen der Spur-Skripte
(`fv_lauf2.sh`: grün → EXIT 0/`ok:true`; echtes NICHT GEPRÜFT → EXIT 2/`null`; Syntaxfehler-`.env` → EXIT 1/`false`)
passen. Sechs Punkte bleiben, alle klein, alle gehen an denselben Executer:

| Nr. | Befund | Nachgemessen | Auftrag |
|---|---|---|---|
| T2-N1 | Kommentar in `test_feature_run_sh_wegwerf_variablen_static.js` nennt `test_feature_run_sh_wegwerf_variablen_laufzeit.js` als Verhaltensprobe der Laufzeitwache — die Datei gibt es nicht | `git ls-tree` auf `9cf820b`: 0 Treffer | Kommentar berichtigen (Wache wurde von Hand rot gemessen, statisch nur ihre Form bewacht) |
| T2-N2 | `test_feature_final_verification_verhalten.js` Fall 3 sichert nicht zu, dass `staging-smoke.sh` wirklich mit **2** endete; endet bash dort (andere Version) mit 1, ist der Fall auch mit der ALTEN Logik grün | gelesen: Zusicherungen nur auf `false`/EXIT 1/„FAIL“ | Detail enthält seit R2-1 `rc=$smoke_rc` → `rc=2` zusichern |
| T2-N3 | Der neue Test startet das echte `final-verification.sh`, und das schreibt fest nach `/tmp/gymdocu-final-migrate-check.out` (`:135`) — die Suite läuft auf dem Server als Deploy-Gate und überschreibt dort die Datei eines echten Laufs; der Kopf des Tests behauptet „kein Pfad ausserhalb der Temp-Verzeichnisse“ | `:135` gelesen | im Skript `mktemp` statt festem Pfad, danach entfernen; Kopfsatz stimmt dann |
| T2-N4 | `find` im Syntax-Check steigt trotz `-not -path` in `node_modules/`, `pdf/` usw. hinab; seit R2-2 bricht jeder `find`-Fehler den Check ab — ein beim Deploy verschwindendes oder unlesbares Verzeichnis dort stoppt Schritt 4/8 NACH dem `git pull` (neuer Code auf der Platte, alter Prozess) | gelesen; Deploy-Benutzer laut `ops/deploy-key-einrichten.md:49` root, Rechtefehler dort also unwahrscheinlich, Verschwinden nicht | ausgeschlossene Verzeichnisse per `-prune`; Dateiliste alt/neu am echten Repo sortiert vergleichen, `diff` EXIT 0 |
| T2-N5 | R2-2-Probe (`sudo -u nobody`) ist grün aus falschem Grund, wenn `nobody` das Skript gar nicht ausführen kann (nicht durchquerbares `TMPDIR`, `sudo` verlangt Passwort) — jeder Exit ≠ 0 zählt | gelesen: einzige Zusicherung `code !== 0` | Positivkontrolle: derselbe Baum OHNE gesperrtes Verzeichnis als `nobody` → EXIT 0; im Fehlerfall die eigene Meldung „find scheiterte“ zusichern |
| T2-N6 | fehlt `nobody`, wird die Probe still übersprungen (Datei endet EXIT 0) | gelesen | Hausregel: `CI=true` → FAIL, sonst sichtbares SKIP |
| — | `test_feature_final_verification_verhalten.js` fehlt in `test/run.sh` (vom Executer selbst gemeldet, Registrierungswächter schlägt zu Recht an) | Executer-Bericht | eintragen |
