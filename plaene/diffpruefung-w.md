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

## Runde 2 (Nacharbeit `d620cf0`, `53a51b5`, `7899b49`, w-bau lokal)

Bauender meldet: `--selbsttest-ausfuehrung` 113 ✓ / 0 ✗, `--selbsttest` 138 ✓. 24 Gegenproben ROT, alle
zurückgenommen (`scratchpad/gp2/`). Die Messung gegen `/workspace/gymdocu-w` endete mit Exit 0.
`ops/boot-smoke.js` ist jetzt `ohne-nachweis` (nur ✅-Zeilen, keine PASS-Zeile); das folgt aus Nr. 2/6.

Eigene Lesung des Diffs (`tools/ausfuehr-aufbau.sh` ganz):

| Nr | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| W-E3 | **sollte** (s. unten): Zwischen den Stufen (Selbstmessung, Vorbereitung, Umgebung) werden übriggebliebene Prozesse von 65534 NICHT beendet (`grep kill` findet nur den Signal-Trap `:84`). Ein abgekoppelter Prozess aus der Vorbereitung (Modellcode in `core/db.js`/Migrationen) kann warten, bis die Manifestprüfung vorbei ist, und dann die Testdatei umschreiben. Das Ergebnis wäre gefälscht, und mehr als EINE Änderung würde wirken. | Quelltext `:199-270` | Nacharbeit: nach jeder Stufe `kill -KILL -1` aus PID 1 und Nachweis, dass kein 65534-Prozess übrig ist, VOR der Manifestprüfung. `/tmp`, `/var/tmp` und `/dev/shm` nach der Vorbereitung frisch einhängen. Angriffsspur misst es. |

Spuren Runde 2: flash (Repo-Werkzeuge auf `/workspace/belehrung-w`), kimi (Diff und beide Kernskripte).

**Die ausführende Angriffsspur hat NICHTS geliefert.** Ein Sicherheitsklassifikator hat ihren ersten Bauschritt
(Angriffsmutationen) angehalten, und sie hat korrekt abgebrochen. Ergebnis: ungeprüft, nicht „kein Befund“. Die
Angriffe werden NICHT auf anderem Weg nachgeholt; das wäre ein Umgehen dieses Stopps. Ersatz:

- die zwei Lesespuren;
- ABWEHRENDE Selbsttests im Werkzeug. Beispiel: eine Fixtur, die in der Vorbereitung einen abgekoppelten
  Schlafprozess startet; zugesichert wird, dass er vor der Manifestprüfung beendet ist.

Beim Lesen notiert (Quelltext, nicht gemessen):

- Die Hashsummen des Manifests decken nur `-type f` ab; Symlinks stehen nur in der Liste. Hardlinks sind ungemessen.
- Der sha256 der Testdatei wird nur vor der Vorbereitung verglichen.

**Benannte Grenze (grundsätzlich):** Der mutierte Code läuft in der Teststufe mit denselben Rechten wie der Test. Er
kann dort PASS-Zeilen und Exit 0 selbst erzeugen. Das Ergebnis der Spur ist deshalb nie ein Beweis, sondern eine
Behauptung, die der Haupt-Agent vor jeder Verwendung selbst nachmisst; das entspricht der Hausregel für alle
Prüfspuren.

W-E3 bleibt trotzdem nötig. Das Manifest soll gerade verhindern, dass die VORBEREITUNG die Kopie verändert; ohne das
Beenden der Reste ist diese Prüfung umgehbar und damit eine Zusicherung, die nicht rot werden kann. Neu eingestuft
als „sollte“.

**Runde 2, Ergebnisse** (flash `scratchpad/w2/flash.txt`, kimi `scratchpad/w2/kimi.md`), gegen den Quelltext gelesen:

| Nr | Befund | Quelle | Entscheidung |
|---|---|---|---|
| W-E3 | überlebende Prozesse zwischen Stufen | eigene Lesung, flash 1, kimi 1 (unabhängig) | Nacharbeit 2, Nr. 1 (dazu Leeren der tmpfs, kimi 10) |
| R2-2 | Manifest ohne Symlink-Ziel (`%y %p`, sha nur `-type f`) | flash 2, kimi 2 | Nacharbeit 2, Nr. 2 |
| R2-3 | Rückfall aus F-B5: `umgebung-fehler` wird als Grundlauf gecacht | flash 3 | Nr. 3 |
| R2-4 | `erfassung-gerissen` geht vor den Isolationsstufen | kimi 4 | Nr. 4 |
| R2-5 | `datenbankFrisch` wirft bei exotischem Namen, bevor gedroppt wird; Template-/postgres-Reste | kimi 5, 6, flash 5 | Nr. 5 |
| R2-6 | Fehlerweg räumt Verzeichnisse nicht ab | kimi 7 | Nr. 6 |
| R2-7 | Host-Pfade im Fehlertext gehen zum Modell | kimi 8 | Nr. 7 |
| R2-8 | Rennen Trap gegen `test-exit` | kimi 9 | Nr. 8 |
| R2-9 | Einhängemenge teils aus demselben Sollwert | kimi 12, flash 4 | Nr. 9 |
| R2-10 | `mutation.relativ` nicht neutralisiert | kimi 13 | Nr. 10 |
| R2-11 | Schnitt am ersten `)` in der Shell | flash 6 | Nr. 11 |
| R2-G | Mutierter Code kann PASS und Exit 0 selbst drucken | kimi 3 | benannte Grenze (Kopfkommentar); jedes Ergebnis wird vor Verwendung selbst nachgemessen |

## Runde 3 (Lesespur flash über Nacharbeit 2, `7899b49..1a26be4`)

Den Diff habe ich selbst gelesen (Aufbauskript, `ausfuehr-spur.js`). Die tragenden Befunde sind am Code nachvollzogen:

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| R3-1 | sollte | `datenbankFrisch` parst die Namen zeilenweise auf dem Client. Ein Name mit Zeilenumbruch (`"template1\nx"`) erzeugt `DROP` auf einer System-DB. Die Folge ist ein Fehler, und alle weiteren Läufe bleiben dauerhaft `umgebung-fehler` (DoS der Spur, kein Leck). | Nacharbeit 3: die Anweisungen baut der Server (`format('%I')`) |
| R3-2 | sollte | Large Objects (und künftige Objekte ohne Schema) in template1 überleben und werden in jede frische `gymdocu_test` kopiert. Nur `CREATE` auf `public` ist entzogen, `CONNECT` nicht. | Nacharbeit 3: `REVOKE CONNECT` auf template1/postgres, Selbstmessung dazu |
| R3-3 | sollte | Manifest: `%p`/`%l` stehen unmaskiert zeilenweise in der Liste. Ein Symlink-Ziel mit `\n` kann eine gelöschte Zeile vortäuschen. | Nacharbeit 3: NUL-getrennt vergleichen |
| R3-4 | Anmerkung | Die merged-usr-Klausel in 5b ist tautologisch. | Nacharbeit 3: streichen |
| R3-5 | Anmerkung | `zeitlimit` wird von `erfassung-gerissen` überdeckt. | Nacharbeit 3 |
| R3-6 | Anmerkung | Die Ablagen-Ausnahme erlaubt jedes Mountziel. | Nacharbeit 3: auf erwartete ro-Ziele begrenzen |
| R3-7 | Anmerkung | Eine Host-Anordnung ausserhalb der Präfixliste führt zu einem Isolationsabbruch, obwohl nichts gebrochen ist. | Nacharbeit 3: als Werkzeug-Befund ohne `isolation` führen |
| R3-8 | Anmerkung | Ablagen nicht leerbar ergibt Exit 20 statt 25. | Nacharbeit 3 |
| R3-9 | Anmerkung | Kopfzahlen veraltet (29 statt 32). | Nacharbeit 3 |
