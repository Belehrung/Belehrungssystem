# Diffprüfung Teil W (ausführende Prüfspur) — 30.09.2026

Stand `w-bau` `b88d585` (lokal). Spuren: Lesespur `deepseek-flash` (`scratchpad/wpruef/antwort.txt`, 0,40 $), dritte Spur
`kimi-k3` mit eigenem Bündel (Betreiber „ja nimm Kimi dazu“, Anlass: Sicherheitsgrenze), ausführende Angriffsspur
(Claude). Eigene Lesung: `ausfuehr-aufbau.sh` ganz, `lauf.conf`-Schreiber (`konfWert`: einfache Anführungszeichen,
`'`/Zeilenumbruch abgelehnt — sicher), `mutationAnwenden`, `statusAusExit`.

| Nr | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| W-E1 | ganz `/opt` ro eingebunden: `/opt/env-runner/environment-manager`, `/opt/claude-code` für 65534 lesbar (nur Node `/opt/node22` und Browser nötig) | ja (`ls`, Rechte) | Nacharbeit: nur benötigte Teilbäume |
| W-E2 / F-B3 | Rolle hat CREATEDB; Nebendatenbanken überleben zwischen Aufrufen | Quelltext (`datenbankFrisch` räumt nur `gymdocu_test`) | Nacharbeit: vor jedem Kind-Lauf alle Nicht-System-DBs weg |
| F-B1 | **blockierend**: Modellcode läuft in der Vorbereitungsstufe (`db-vorbereiten.js` lädt `core/db.js`/Migrationen) als Eigentümer der Kopie und kann Testdatei/`umgebung.sh`/weitere Dateien überschreiben ⇒ „bestanden“ gefälscht, mehr als EINE Änderung | Quelltext: sha256-Vergleich nur in der Selbstmessung VOR der Vorbereitung | Nacharbeit: Manifest aller versionierten Dateien, root prüft nach der Vorbereitung |
| F-B2 | Selbstmessung schreibt als Schreibprobe genau die Wächterdatei; Stufencodes werden nach dem Wächter-Zweig ausgewertet | trägt | Nacharbeit |
| F-B4 | keine Ressourcendeckel (tmpfs-Summe ~2 GB, kein rlimit), Kopie auf der Host-Platte | trägt | Nacharbeit (Angriffsspur misst) |
| F-B5 | Start-/Infrastrukturfehler im Kind-Lauf werfen und beenden den ganzen Lauf | trägt | Nacharbeit: als `umgebung-fehler` zurückgeben |
| F-B6 | Test-Exit 124/≥129 wird als Zeitlimit/Signal gedeutet | trägt | Nacharbeit: `test-exit`-Datei maßgeblich |
| F-B7 | `SELBSTMESSUNG: \d+ ✓ / 0 ✗` ohne Literal (0/0 wäre grün) | trägt | Nacharbeit: Literal 22 |
| F-B8 | zwei `ok()` mit Konstante | trägt | Nacharbeit |
| F-B9 | `istHartGesperrt` im Selbsttest unbelegt | trägt | Nacharbeit |

Angriffsspur (Claude, ausführend, `scratchpad/dsv1-angriff/`, zwei volle Läufe, danach sauber):

| Nr | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| A-7 | **kritisch**: Mutation in einer vorgeladenen Datei (`test/helfer/netz-sperre.js` via `NODE_OPTIONS`) mit `process.exit(0)` ⇒ Test läuft nie, Werkzeug meldet `bestanden` (PASS-/SKIP-Prüfung nur im Grundlauf) | Bericht wörtlich; Quelltext bestätigt (Gültigkeit nur für Grundlauf) | Nacharbeit: Mutationslauf ohne PASS-Zeile ⇒ eigener Status; PASS-Zahl Grundlauf/Mutation im Kopf |
| A-5 | Extra-DB überlebt zwischen Aufrufen (gemessen `dsv1_probe_marker`) | gemessen | = W-E2 |
| A-6 | Kopie liegt ungedeckelt auf der Host-Platte (`dd` 50 MB gelungen), `ulimit -f` unbegrenzt, `nproc` 64303 | gemessen | Nacharbeit: Schreibmenge hart begrenzen, rlimits (nproc, fsize, cpu) |
| A-4 | unprivilegierte User-Namensräume im Kind möglich (`unshare -r` ⇒ uid 0 im eigenen NS); kein demonstrierter Ausbruch | gemessen; `setpriv` 2.39.3 kann kein seccomp, kein libseccomp vorhanden | benannte Grenze (Sammelliste), Kernelangriffsfläche |
| A-1a | `/proc/1/cmdline` zeigt Host-Pfad und Lauf-ID | gemessen | Nacharbeit: `hidepid=2` |
| A-1b | ganz `/etc` ro sichtbar, heute nichts Geheimes für 65534 lesbar | gemessen | benannte Grenze |
| A-3, A-2, A-4b | Schreiben ausserhalb, Netz, Signale, `/proc/sys`, Wächterdatei fälschen, `lauf.conf` ändern | alle gescheitert | — |

Kimi-Spur (`kimi-k3`, eigenes Bündel, `scratchpad/wkimi/`):

| Nr | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| B1/B2 | kein Platz-, Prozess-, Speicherdeckel im Kind | = A-6/F-B4 | Nacharbeit |
| B3 | `ALTER ROLE nobody SET …` durch das Kind selbst überlebt zwischen Aufrufen (Cluster bleibt) | PG-Verhalten (eigene Rolle darf Vorgaben setzen); im Code kein `RESET` | Nacharbeit: je Aufruf `ALTER ROLE nobody RESET ALL` |
| B4 | Erfassungsdeckel schneidet SKIP-Zeile ab ⇒ Grundlauf gültig | = sol S6 | Nacharbeit |
| B5 | Exit 124 ohne Uhr | = F-B6/S10 | Nacharbeit |
| B6 | Vorbereitungsfehler werfen roh, Folgetext „abgelehnt: null“ | = F-B5 | Nacharbeit |
| B7 | PG-Versionsboden fehlt, `lo_import` | Prämisse („< 16 für nobody nutzbar“) trägt nicht, serverseitiges `lo_import` verlangt seit jeher Superuser/Grant; Gegenprobe ist trotzdem billig | Nacharbeit: nur `lo_import`-Probe (muss scheitern), kein Versionsboden |
| B8 | `PASS_MUSTER` trifft „0 PASS“ | `ausfuehr-spur.js:88` | Nacharbeit (= S7) |
| B9 | Mount-Menge nicht abgeschlossen (nur schreibbare Abweichung fällt auf) | trägt | Nacharbeit: Mount-Menge als Literal |
| B10 | Sperrhalter `kill -0` auf wiederverwendete PID | `:216-218` | Nacharbeit: Startzeit/`exe` mitprüfen |
| B11 | Dauer als Zahl im `grund` | trägt | Nacharbeit: Zahl streichen |
| B12 | HEAD des Zielbaums nicht festgehalten | trägt | Nacharbeit: HEAD beim Start merken, vor jeder Kopie vergleichen |
| B13 | Steuerzeichen ungefiltert in Protokoll/Kontext | trägt | Nacharbeit |

sol-Spur (`gpt-6-sol`, Diff + Nachbarn, `scratchpad/wsol/`):

| Nr | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| S1 | Deckel-Tests gegen die Konstanten `MAX_AUFRUFE`/`MAX_ERGEBNIS_BYTES` statt Literale | `:58-60`, `:1066-1068` | Nacharbeit: Literale 30/8192 |
| S2 | Vorrang `&&`/`||` in der Aufräum-Zusicherung | `:1136` | Nacharbeit |
| S3 | Riegeltest `.env.beispiel` trifft die Endungssperre, nicht `istHartGesperrt` | = F-B9 | Nacharbeit |
| S4 | **blockierend**: unvollständiges Aufräumen nach regulärem Bericht ⇒ Exit 0 | `gegenleser-repo.js:1760` `return 0`, `:1863` nur Meldung | Nacharbeit: Exit 8, ASTRA-Zeile nicht regulär |
| S5 | **blockierend**: Riegel zeilenweise, PEM-Rumpf geht durch | `ausfuehr-spur.js:525-536` | Nacharbeit: blockweise über `entferneGeheimnisse()`, PEM-Gegenprobe |
| S6 | **blockierend**: gerissener Erfassungsdeckel macht Grundlauf gültig | trägt (= B4) | Nacharbeit: Erfassungsverlust ⇒ ungültig |
| S7 | „0 PASS“ zählt | = B8 | Nacharbeit |
| S8 | 45 min nicht hart (Prüfung nur auf bisherige Summe) | `:691-695` | Nacharbeit: ablehnen, wenn Rest < Testzeitlimit + Kill-Frist |
| S9 | Ablehnungstexte ungedeckelt; ungültiges JSON umgeht den Zähler | `:698-701`, `gegenleser-repo.js:1766-1771` | Nacharbeit |
| S10 | Exit 124 | = F-B6 | Nacharbeit |
| S11 | Signal-Handler erst nach `einrichten()` | `gegenleser-repo.js:1490-1509` | Nacharbeit |
| S12 | `require('./ausfuehr-spur')` unbedingt, trifft reine Lesespur | `gegenleser-repo.js:106` | Nacharbeit: erst bei `--ausfuehren` laden |
| S13 | `/var/lib/dsv1` bleibt nach Läufen stehen | trägt, leer, root-eigen | benannte Grenze |

Nacharbeit: EIN Auftrag an den Bauenden (alle Zeilen „Nacharbeit“ oben). Benannte Grenzen: `offene-befunde-w.md`.

-- Ende --
