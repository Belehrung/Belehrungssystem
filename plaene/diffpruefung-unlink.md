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
