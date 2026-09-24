# Diffprüfung Nachweis-unlink — `e2a9e9e..f095ec3`

Stand 23.09.2026. Lesespur `gpt-6-sol` mit Lesezugriff auf den Lesebaum
`/workspace/gymdocu-unlink-lese` (83 Lesungen, 9,83 $). Spalte „getragen" = Messung des
Haupt-Agenten. Die ausführende Prüfung lief in den Nacharbeiten 1–3 (Gegenproben dort).

| # | Schwere | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| L1 | blockierend | Erkenner kennt nur `unlink`/`unlinkSync`; `rm`/`rmSync`/`fsP.rm` mit Dateipfad und Aliase aus `fs/promises` fallen durch. Real: `core/export-studio.js:269` (`rmSync(workDir)` mit sensiblen CSV/PDF, stiller catch), `routes/archiv.js` (tmpDir mit Monats-PDFs, stiller catch), `core/storage-replica.js:354-359` (`fsP.rm` einer `.enc`, DB-Zeile wird danach IMMER gelöscht) | alle drei Stellen gelesen — tragen | ja |
| L2 | mittel | Ausnahmen nur über die ANZAHL je Datei gebunden, nicht an Stelle und Fehlerbehandlung — Zähler aus `core/foto-reaper.js:82` entfernt bleibt grün | Wächter `:464-474` gelesen | ja |
| L3 | mittel | echter Helfer ohne Vertragstest | = Nacharbeit 4 (läuft) | ja |
| L4 | mittel | awaited `unlink` ohne Zeitgrenze vor dem Redirect — ein hängendes Dateisystem hält die bereits gespeicherte Anfrage offen | Herleitung trägt; lokal kaum erreichbar, Behebung billig | ja |
| L5 | mittel | Kommentar im Helfer: `quelle` verhindere gegenseitiges Verdecken in der Telegram-Drossel — der Drosselschlüssel enthält `quelle` nicht (`core/error-tracker.js` `signatur()` = Name:Methode Pfad) | gelesen — trägt; Behebung: Kommentar berichtigen | ja |
| L6 | mittel | `core/foto-reaper.js`: nach gescheitertem Unlink wird die DB-Zeile trotzdem gelöscht und als „entfernt" gezählt; `dateiFehler` wertet niemand aus | `:47-65` gelesen — trägt (vorbestehend, im Diff berührt) | ja |
| L7 | mittel | Helferkommentar stellt `ops/nachweis-waisen-melden.js` als Auffangnetz dar — löscht nichts, kein Cron, deckt Belehrungs-Uploads/Prüfberichte nicht | Fundstellen genannt — Kommentar berichtigen; fehlender Reaper = U-REAP1, Sammelliste | ja |
| L8 | gering | Ausnahmebegründung `core/retention.js` behauptet PII-Redaktion; `:1069` loggt `e.message` mit vollem Pfad | gelesen — trägt | ja |

Kein Befund: Zeitzonen, Mandantentrennung (drei bewusst globale Abfragen begründet).

## Runde 2 — Lesespur `deepseek-v4-pro` mit Repo-Lesezugriff (Nacharbeit 4/5, 1,76 $)

| # | Schwere | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| R2-1 | mittel | `core/storage-replica.js`: die bei gescheitertem `.enc`-Löschen behaltene Zeile ist KEIN Wiederholungsanker — beide Aufrufer rufen je Quellzeile genau einmal (`pdf-loeschung.js` setzt `datei_geloescht = 1` vorher, `retention.js` löscht die Quellzeile vorher); die Zeile bleibt `succeeded`, `requeueStale`/`healthMetrics` übergehen sie | `core/pdf-loeschung.js:234-246` gelesen — trägt | ja |
| R2-2 | gering | Foto-Reaper meldet bei dauerhaftem Fehler täglich je Datei (Log je Datei, Telegram gedrosselt) | trägt | ja |
| R2-3 | gering | `entferneVerzeichnis` (async) ohne Zeitlimit, obwohl die Begründung nur für die Sync-Form gilt | trägt | ja |
| R2-4 | gering | Wächter-Endzusicherung ohne unabhängige Gesamtzahl der Ausnahmen; Fragmentsuche findet auch einen Kommentar im catch | trägt | ja |
| R2-5 | gering | „denselben Fehler" prüft nur den Code, nicht die Objektidentität | trägt | ja |
| R2-6 | gering | Erkennerlücken: `const { unlink: u } = require('fs')`, `rmdir/rmdirSync` (beide im Bestand 0) | trägt | ja |

## Runde 3 — Lesespur `deepseek-v4-pro`, Repo-Lesezugriff (Nacharbeit 6, 1,44 $)

| # | Schwere (Spur → Messung) | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| A1 | blockierend → mittel | `requeueLoeschenOffen()` liest ohne Sperre und löscht `WHERE id = $1` ohne Statusklausel; der Claim in `processReplica()` (`status <> 'succeeded'`) nimmt auch `loeschen_offen`. Ein Neu-Upload desselben Pfads zwischen SELECT und DELETE verliert die frische `.enc` samt Zeile | `core/storage-replica.js:214-220, 331-356` gelesen — trägt strukturell. Erreichbar nur bei erneutem Upload DESSELBEN `local_path` (Korrekturblatt-Neuerzeugung denkbar, nicht gemessen) — daher mittel | ja |
| A2 | sollte → mittel | `upsertReplica()` setzt `loeschen_offen` im ELSE-Zweig auf `pending`; `enqueueReplica()` überspringt nur `succeeded` — der Löschauftrag geht verloren | `:113-134` gelesen — trägt | ja |
| A3 | Anmerkung | Migration 0060 vergleicht `pg_get_constraintdef` byte-genau mit einem PG-16-Wortlaut; bei abweichender Wiedergabe Startblockade | gelesen — trägt als Risiko; welche Version abweicht, nicht gemessen | ja |
| A4 | Anmerkung | `attempts` ohne Obergrenze | trägt; Verhalten richtig (Löschpflicht endet nicht) — Behebung: Kommentar | ja |
| P1 | sollte | statischer Test setzt die status-Klausel aus `core/db.js` auf BEIDEN Seiten ein — `'loeschen_offen'` in `core/db.js` gestrichen bleibt grün | `test_feature_storage_replica_static.js:38-49` gelesen — trägt | ja |
| P2 | Anmerkung | `assert(attemptsVorher >= 0)` kann wegen `CHECK (attempts >= 0)` nie fallen; Fehlschlag-Zweig von `requeueLoeschenOffen()` ungetestet | gelesen — trägt | ja |
| P3 | Anmerkung | `degraded` wertet `loeschenOffen` nicht aus | trägt als Tatsache. Behebung NICHT übernommen: `degraded` hängt am Deploy-Gate — eine liegengebliebene Löschung würde jeden Deploy sperren; gleichgestellt mit `failed` (Wiederholung läuft), jeder Fehlschlag geht über `melde()` | ja |
| P4 | Anmerkung | `melderUeberspringen` verlagert die Meldepflicht zum Aufrufer, ohne dass der Helfervertrag das sagt | trägt | ja |

8 Befunde, 8 getragen, 0 gefallen; eine Behebung (P3) bewusst nicht übernommen. → Nacharbeit 7.

## Nacharbeit 7 (`1fc97ee`) — gelesen, Runde 4 läuft

Diff gelesen (core/storage-replica.js, Migration 0060, Kommentare P3/P4). Suite laut Executer `SUITE_EXIT=0`,
361 = 361, Lint 0. Gegenproben nur für P1/P4 geliefert; für A1a/A1b/A1c/A2/A3 fehlen sie → Runde 4 mit
ausführender Claude-Spur (`/workspace/gymdocu-unlink-pruef`) und Lesespur `deepseek-v4-pro`
(`/workspace/gymdocu-unlink-lese`). Runde 4 ist nach Hausregel Pflicht, weil die Behebung Verhalten ändert.
Zwischenfall des Executers: einmal `db.init()` gegen die gemeinsame `gymdocu_test`, während die P1-Suite lief;
dort kein FAIL.

## Runde 4 — Lesespur `deepseek-v4-pro`, Repo-Lesezugriff (Nacharbeit 7, 3,48 $)

| # | Schwere (Spur → Messung) | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| R4-B1 | blockierend → sollte | `processReplica()` schreibt nach dem Claim `succeeded` bzw. `failed`/`dead` OHNE Statusklausel; setzt `loescheReplikaFuerDatei()` die Gruppe zwischendurch auf `loeschen_offen`, wird der Löschauftrag überschrieben (Erfolg: alte Referenz verloren; Fehler: später `dead`, aus dem kein Weg führt). Der Worker läuft rund um die Uhr, der Kommentar zur „latenten“ Lücke rechnet nur mit den Cron-Zeiten | `core/storage-replica.js:289-304` gelesen — trägt. Erreichbar nur bei gleichzeitigem Upload und Löschung DESSELBEN Pfads | ja |
| R4-B2 | sollte | Neu-Upload auf eine `loeschen_offen`-Zeile: der Sonst-Zweig von `enqueueReplica()` plant trotzdem einen Job, der Claim scheitert, der Job gilt als erledigt (stiller No-op); `requeueStale()` läuft im Cron VOR `requeueLoeschenOffen()` → bis zu ~24 h ohne Zweitkopie, bei dauerhaft scheiternder Löschung NIE | `:166-176`, `server.js:1526-1543` gelesen — trägt | ja |
| R4-B3 | Anmerkung | A2-Rücksetzung behält die ALTE sha256 für ein beim Neu-Upload nicht berührtes Backend → erster Versuch „SHA-256 stimmt nicht überein“ → `dead` | Herleitung trägt | ja |
| R4-M | Anmerkung | semantische Migrationsprüfung vergleicht nur die Werte-Token (zusätzliche Bedingung ohne neues Token bliebe unerkannt) | trägt; heute unerreichbar (ADD ist hart verdrahtet) | ja |
| R4-C1 | Anmerkung | P2(iii) erreicht nur den DELETE-Arm; Statusklausel im Rücksetz-UPDATE und im Fehlerzweig-UPDATE unbewacht | Herleitung trägt; Mutation liegt bei der ausführenden Spur | ja |
| R4-C2 | Anmerkung | Wächter D bindet nur die Datei, nicht die Erfüllung der Meldepflicht (`melde(` im Aufrufer) | trägt | ja |
| R4-F | Anmerkung | `absoluteFromLocalPath()`-Fehler gilt als „keine Quelle“ → Zeile gelöscht; bei verstelltem PDF_ROOT ginge ein Auftrag verloren | trägt | ja |

**Folgerung (Haupt-Agent):** R4-B1, R4-B2, R4-B3 und U-LOE1 haben EINE Wurzel: der Löschauftrag hängt an
der Replikationszeile, deren Lebenslauf vier andere Wege mitschreiben. Jede weitere Statusklausel
verschiebt die Lücke nur eine Stelle weiter. Strukturelle Lösung: Löschaufträge als EIGENE Zeilen
(eigene Tabelle, je Auftrag die exakte `remote_ref`), unabhängig vom Lebenslauf der Replikationszeile.
Plan folgt nach der ausführenden Spur (`plaene/auftrag-unlink-loeschauftrag.md`).

## Runde 4 — ausführende Claude-Spur (`/workspace/gymdocu-unlink-pruef`, eigener PG-Cluster Port 5497)

Mutationen (Protokoll Scratchpad `unlink-pruef4/logs/`): A1b, A1c-DELETE, A2-CASE, A2-Zweig, rowCount-Erfolg → ROT
über Zusicherung. **Grün trotz Mutation:** M3b (Rücksetz-UPDATE ohne Statusklausel), M3c/M6b (Fehlerzweig),
M7a (Schlussprüfung 0060 auf `IF false` — nur die Prüfsumme merkt es), M7d (Frühausstieg ohne Wertevergleich),
M8b (studio_id-Klausel: Tautologie, `id` ist PK). M1 (Claim) wird rot nur durch Absturz.

| # | Schwere | Befund | Messung | getragen |
|---|---|---|---|---|
| R4-S1 | mittel, NEU durch A2 | Retention-Weg: Primärdatei-Löschung scheitert (Retry-Queue), `.enc`-Löschung erst auch, dann gelingt sie → A2 schliesst aus „Quelle existiert“ auf Neu-Upload, setzt `pending`, die Datei wird WIEDER repliziert; danach löscht die Retry-Queue (ohne Replica-Weg) die Primärdatei → `.enc` + `succeeded`-Zeile bleiben für immer | Szenario c: 1fc97ee `["succeeded", true]` gegen 974816d `[null, false]` | ja |
| R4-S2 | mittel | = R4-B1, gemessen: a1 `loeschen_offen → succeeded`, a2 zwei Backends, a3 `→ failed`; auch auf 974816d | Probe a1–a3 | ja |
| R4-S3 | niedrig–mittel | DELETE in `loescheReplikaFuerDatei()` trifft eine `running`-Zeile → hochgeladene `.enc` ohne Zeile | Probe b | ja |
| R4-S4 | niedrig | Neu-Upload zwischen `existsSync` und DELETE geht verloren | Probe d | ja |
| R4-S5 | niedrig | A1b schützt einen Zweig ohne Produktionsaufrufer; der echte Weg (`enqueueForFile`) plant den No-op-Job | Probe e = R4-B2 | ja |
| R4-S6 | niedrig | Testlücken M3b/M3c/M6b/M7a/M7d, M1 als Absturz | Tabelle | ja |

**Summe Runde 4:** 13 Befunde aus zwei Spuren (Überschneidung R4-B1/S2, R4-B2/S5, R4-C1/S6), alle getragen.
Entscheidung: Umbau „Löschauftrag als eigene Zeile“, Plan `plaene/auftrag-unlink-loeschauftrag.md`.

## Umbau „Löschauftrag als eigene Zeile“ (`1fc97ee..2a9e62a`) — gebaut, Runde 5 läuft

Executer (Einordnung sehr komplex): Suite `SUITE_EXIT=0`, 362 = 362, Lint 0; 16 Szenarien + 4
Positivkontrollen (81 PASS), Migrationstest 18 PASS, 12 Gegenproben M1–M12 alle ROT über Zusicherungen.
Widersprüche des Executers, beide nachvollzogen: (1) „eigene Datei UNBEDINGT löschen“ war falsch bei EEXIST —
die Datei gehört dann jemand anderem; (3) bestehender Wächter `test_feature_audit2_batchB_static.js`
fachlich umgestellt (Queue jetzt IN der Transaktion vor `DELETE FROM studios`).
Eigene Lesung `processReplica()`: **F-A** — `eigeneDateiGeschrieben` wird nur bei Erfolg gesetzt; scheitert
`writeFile` NICHT an EEXIST, sondern mitten im Schreiben (ENOSPC/EIO), bleibt eine Teil-Datei, deren Anker
gelöscht wird → Datei ohne Zeile und ohne Auftrag. Messung an die ausführende Spur gegeben.
Runde 5: DeepSeek-Lesespur (`/workspace/gymdocu-unlink-lese`) + ausführende Claude-Spur
(`/workspace/gymdocu-unlink-pruef`, eigener Cluster).

## Runde 5 — Umbau (`2a9e62a`), zwei Spuren

**Ausführende Spur** (eigener Cluster, Proben mit derselben Invariante wie der Test; Protokoll Scratchpad
`unlink-pruef5/`): Stichprobe M1/M4/M10/M12 stimmt; neue Mutationen a, d, e, h, i, j, k ROT; b (FOR UPDATE)
und n (Entzogen-Riegel) GRÜN; t5/t5b (Offboarding) GRÜN.
**Lesespur** `deepseek-v4-pro` (Lesebaum, Kosten s. ASTRA-LAEUFE).

| # | Spur | Schwere | Befund | Messung | getragen |
|---|---|---|---|---|---|
| R5-1 | Claude | hoch, NEU | Nach dem COMMIT von 1c scheitert 1d (oder die COMMIT-Quittung geht verloren) → der catch löscht „unbedingt“ die EBEN committete Datei; Reaper löscht danach die alte → keine Kopie mehr, Zeile `failed`/`dead` | `probe_1d_fehler.js`, `probe_commit_quittung.js`: „Zeile trägt Referenz ohne Datei“ | ja |
| R5-2 | beide | hoch/blockierend | = F-A: Schreibabbruch ≠ EEXIST → Teil-Datei ohne Zeile und ohne Auftrag (lesbarer Anfang des Chiffrats) | `probe_teilschreiben.js`: `dateiDa:true, dateiGroesse:16`, Invariante ROT, nach Reaper ROT | ja |
| R5-3 | Claude | hoch (Prüfung fehlt) | `FOR UPDATE` in 1c tragend, aber unbewacht (Mutation b 81/0) | `probe_b_zwei_worker.js`: mit b Waise | ja |
| R5-4 | beide | hoch, Bestand + neu | Offboarding-Reaper löscht Dateien eines LEBENDEN Studios, wenn die Transaktion nach dem Queue-Schreiben scheitert (Primär-PDF: Bestand; `vorbelegt`-Referenz: neu) | `probe_offboard_rollback.js`: `studioLebt:true, quellPdfDa:false` | ja |
| R5-5 | Claude | mittel | Offboarding-Wächter prüft nur Textreihenfolge; t5 (Referenzen erst nach dem Queue-Schreiben sammeln) und t5b (`db.q` statt `t.q`) GRÜN | `probe_t5_queue.js`: Queue leer, Dateien überleben | ja |
| R5-6 | Claude | mittel | Weg 2 ohne Transaktion wird nur aus Strukturgrund ROT; Abbruch zwischen DELETE und INSERT ungeprüft | `probe_f_weg2_abbruch.js` | ja |
| R5-7 | DeepSeek | sollte | DB-Fehler in der Weg-2-Transaktion → Rollback, kein Auftrag; Aufrufer zählen nur, Primärdatensatz schon weg → Löschpflicht still verloren (= U-LOE2) | Aufrufer `core/retention.js:1116-1118`, `core/pdf-loeschung.js:251-254` gelesen | ja |
| R5-8 | Claude | niedrig, NEU | Entzogen-Zweig setzt eine FREMDE Lease auf `pending` zurück (Riegel nur `status='running'`), Mutation n GRÜN | `probe_n_fremde_lease.js` | ja |
| R5-9 | Claude | niedrig | Teilläufe des Szenariotests immer ROT (`schreibZaehler >= 12`) | Log | ja |
| R5-10 | DeepSeek | Anmerkung | DBs mit registrierter alter 0060 starten nicht („Angewandte Migration ohne Datei“) | trägt als Mechanismus; **gemessen vom Executer: keine der 70 lokalen DBs hat sie, Zweig nie deployt** → nur Kommentar | ja |
| R5-11 | beide | Anmerkung | U-LOE3 bleibt (Worker schreibt nach dem Löschlauf); Kommentar `core/provisioning.js:423` („beide Tabellen danach leer“) zu stark | trägt | ja |
| R5-12 | DeepSeek | Anmerkung | stündlicher Reaper sequenziell bis 200 × 10 s; Seq-Scan ohne passenden Index | trägt | ja |

→ Nacharbeit 8 (`plaene/auftrag-unlink-loeschauftrag.md`, Abschnitt „NACHARBEIT 8“).

## Nacharbeit 8 (`2a9e62a..dceda2c`) — gelesen, Runde 6 läuft

Executer: Suite `SUITE_EXIT=0`, 537 s, Dateizahl 362 = 362 (`diff` EXIT 0), Lint 0, Szenarien 124/0,
`test_deprovision` 27/0. Zwölf Gegenproben, elf ROT; `n` (nur `status='running'` aus dem Entzogen-Riegel) bleibt
GRÜN, weil der neue `attempts`-Riegel dieselbe Klasse deckt — `n2` (ganzer Riegel) ROT. Übernommene, gemessene
Widersprüche zum Auftrag: frische Studio-Prüfung im `catch` von `deprovisionStudio` statt unbedingtem Entfernen
(sonst Datenverlust bei verlorener COMMIT-Quittung, S25); dritte Phase `nach_abschluss`; Entzogen-Zweig löscht die
eigene Datei weiter (COMMIT nie versucht — `db.tx` wirft den Callback-Fehler auch bei gescheitertem ROLLBACK
unverändert weiter, `core/db.js` nachgesehen). Karenz 15 min im Offboarding-Reaper: übernommen (eine
Deprovisionierung dauert Sekunden).

Studio-Wächter der Suite „NICHT GEPRÜFT (Messung fehlgeschlagen)": in diesem Container fehlt die
Entwicklungs-DB `gymdocu_dev` (gemessen, `pg_database` leer) — Umgebung, nicht Änderung.

Produktivdiff selbst gelesen (`core/storage-replica.js`, `core/provisioning.js`). Runde 6 mit DREI Spuren —
Anlass nach Regel: unwiderrufliche Dateilöschung. Claude ausführend (eigener Cluster), DeepSeek mit Repo,
Kimi mit Bündel (Diff + beide Module + beide Testdateien vollständig, Schwerpunkt Zusicherungen).

## Runde 6 — drei Spuren über Nacharbeit 8 (`2a9e62a..dceda2c`)

Spuren: C = Claude ausführend (eigener Cluster, Proben unter `scratchpad/dpu6/mess/`), D = DeepSeek mit Repo,
K = Kimi mit Bündel (Diff + beide Module + beide Testdateien). Jeder Befund selbst nachgesehen; die Messungen der
Spur C liegen als Proben vor. Keiner gefallen.

| Nr. | Befund | Spuren | Nachgemessen | Einstufung |
|---|---|---|---|---|
| R6-1 | Der neue `catch` in `deprovisionStudio` prüft über ein gewöhnliches `SELECT`, ob das Studio lebt — ein noch laufender COMMIT ist dabei unsichtbar: Eintrag entfernt, COMMIT landet, Dateien des gelöschten Studios bleiben für immer | C, K | C: Probe mit verzögertem COMMIT → `queueDa:false`, danach Studio weg, PDF und Spiegel liegen, Reaper `erledigt:0`. Code gelesen (`core/provisioning.js:510-513`). **Rückschritt durch N8** | hoch |
| R6-2 | Zwei gleichzeitige Deprovisionierungen desselben Studios teilen sich die Datei `<id>.json` — der `catch` von A kann den Eintrag von B entfernen | D | Dateiname gelesen (`:50`, `:61`); kein Serialisieren im Weg `/intern/deprovision` | mittel |
| R6-3 | Karenz zählt ab dem Schreiben VOR dem COMMIT; eine Transaktion länger als 15 min verliert ihren Eintrag an den Reaper, scheitert danach die Dateilöschung, ist er weg (und die Meldung ist ein Fehlalarm) | C, D, K | C: `erstellt` zurückdatiert → `verworfen:1`, danach `cleanup_pending` auf eine nicht mehr vorhandene Datei, Spiegel bleibt. Vorbedingung (Transaktion > 15 min) unbelegt | niedrig |
| R6-4 | Status-UPDATEs im Fehlerweg ohne eigenes `try/catch`: wirft eines, ersetzt es den ursprünglichen Fehler und überspringt Anker-/Dateiaufräumen | D | gelesen (`core/storage-replica.js:531-535`, `:554-558`); kein Datenverlust (Reaper), aber falsche Ursache | mittel |
| R6-5 | Weg 2 wiederholt auch mit übergebenem `client`; dort garantiert erfolglos, bei Autocommit-Client `ok:true` bei gebrochener Invariante; `melde()` trägt nur den zweiten Fehler | C, K | C: Probe C1/C2. Kein Produktivaufrufer übergibt `client` (gesucht) | niedrig |
| R6-6 | Die scheiternde Studio-Prüfung ist ungeprüft: zwei fail-open-Mutationen bleiben grün (124/0, 27/0), eine davon löscht das PDF eines LEBENDEN Studios | C | Mutationen `off_check_failopen`, `dep_lebt_nicht_false` + Probe H | mittel |
| R6-7 | Lease-Riegel `attempts = $5` im normalen Fehlerweg unbewacht (S23 misst nur Entzogen) | C | Mutation `riegel_ohne_attempts` 124/0; Probe A: C beansprucht parallel | niedrig |
| R6-8 | S17 misst nur ENOSPC | C | Mutation `teil_nur_enospc` 124/0 | niedrig |
| R6-9 | Beschädigte Queue-Einträge: `studio_id:"abc"` bleibt dauerhaft offen ohne `melde()`; ohne `erstellt` sofort verworfen | C | Probe G | niedrig |
| R6-10 | Auch ein SICHERER Rollback im Abschluss (Callback wirft, COMMIT nie gesendet) lässt die eigene Datei jetzt bis zum stündlichen Reaper liegen | C, D, K | gelesen; `db.tx` sendet COMMIT erst nach dem Callback (`core/db.js:480-482`) — die Unterscheidung ist also verfügbar, wird aber nicht weitergereicht | niedrig |
| R6-11 | Kommentar „(Boot/Cron)“: der Offboarding-Reaper läuft nur per Cron 03:20 | C | `server.js:1555` | Text |
| R6-12 | `nach_abschluss`-Zweig im `catch` ist heute unerreichbar | K | gelesen; bewusste Verteidigung, bleibt | keine Aktion |
| R6-13 | Fundorte im Bestand, UNGEMESSEN: Upsert setzt eine laufende Lease auf `pending`; Hash-Prüfung nutzt `replica.sha256` statt `running.sha256` | C | nicht gemessen → Sammelliste | Fundort |
| R6-14 | Positivitätsschwelle fehlt im Teillauf | D | bewusst (R5-9) | keine Aktion |

**Folgerung:** R6-1, R6-2, R6-3 und R6-10 haben eine gemeinsame Wurzel — der Fehlerweg RÄT, ob committet wurde,
obwohl `db.tx` es weiss (vorgeschlagen von K). Nacharbeit 9 gibt diese Information weiter, statt sie nachzumessen.

## Nacharbeit 9 (`27f5f24..5aa0fb9`, davor master-Merge #470) — gelesen, Runde 7 läuft

Executer (sehr komplex): Suite `SUITE_EXIT=0`, Dateizahl 367 = 367 (`diff` EXIT 0), Lint 0; Szenarien 170/0, neuer
`test_feature_db_tx_commit_ungewiss.js` 15/0; 18 Gegenproben, alle ROT → GRÜN (k1–k14 samt Varianten). Diff selbst
gelesen (Produktivcode vollständig, Tests vollständig). Übernommene Anmerkungen des Executers: (b) der Pfad-Guard in
`loescheStudioDateien` überspringt einen Pfad ausserhalb `PDF_ROOT` STILL (`ok:true`, der Reaper zählt ihn als
erledigt, kein `melde()`) — Bestand, auf die Sammelliste; (c) wirft das Status-UPDATE, bleibt die Zeile bis
`requeueStale` 'running' — gewollt. Eigene Anmerkung beim Lesen: `zweiterFehler.cause = ersterFehler` ohne Schutz
gegen dasselbe Objekt (Kreisbezug) — an die Prüfspur gegeben.
Runde 7 (Verhaltensänderung → zweite Runde nach Regel; drei Spuren, Anlass unwiderrufliche Löschung): Claude
ausführend (eigener Cluster), **DeepSeek UND Kimi mit DEMSELBEN Bündel** (Tauschrunde der Routing-Messung: gleiche
Rechte, gleiches Material, nur das Modell verschieden).
