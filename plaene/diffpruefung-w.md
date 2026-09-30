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

(Kimi- und sol-Spur folgen.)

-- Ende --
