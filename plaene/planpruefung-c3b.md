# Planprüfung C3b Stufe 2

## Fassung 1 (25.09.2026)

Zwei Lesespuren, verschiedene Bündel: `deepseek-v4-pro` mit Repo-Lesezugriff (Material: das Papier), `kimi-k3` mit Bündel
(Papier, `core/storage-replica.js`, `core/pdf-jobs.js`, `workers/pdf-job-worker.js`, Migration 0060, beide Testdateien).

| # | Spur | Befund | Nachmessung | Entscheidung |
|---|---|---|---|---|
| PC3b-1 | DS 1, Kimi 4.1 | `requeueStale` läuft täglich 03:15, nicht alle 15 min | `server.js:1538` gelesen | Papier berichtigt |
| PC3b-2 | DS 2, Kimi 1 | SHA-Wurf ist `permanent` → `deadLetter`, Punkt 5 griffe nie | `:411-413`, `pdf-job-worker.js:85-88` gelesen | Punkt 5: `permanent` entfernen |
| PC3b-3 | DS 3 | S23/S26 und `zeile()` lesen `attempts` als Lease-Kennung, bleiben nach dem Umbau zufällig grün | gelesen | Punkt 1: `claim_nr` selektieren, Gegenprobe dem Kollisionstest zuordnen (Kimi 1.3) |
| PC3b-4 | DS 4 | deklaratives Schema in `core/db.js` + statischer Test + Migrationswiederholung im Test fehlen im Papier | `test_feature_storage_replica_static.js:29` gelesen | Punkt 1 ergänzt |
| PC3b-5 | DS 5 | jeder Wurf aus Punkt 4 verbraucht einen `pdf_jobs`-Versuch (max 5) | gelesen | als Grenze benannt, Punkt 6 trägt |
| PC3b-6 | DS 6, Kimi 3 (Frage 3) | Transport des neuen Inhalts ist Wurf → `queue.retry`, nicht Enqueue (bei abweichendem `run_after` `DedupeConflictError`) | `core/pdf-jobs.js:123-148` gelesen | Punkt 4 so formuliert |
| PC3b-7 | DS 7, Kimi 4.2 | Zeilenangaben daneben (Entzogen `:534`, 1c-UPDATE `:478-484`, „ersetzt“-INSERT `:496-503` gehört zu 1c) | gelesen | berichtigt |
| PC3b-8 | DS 8 | neuer 1c-Zweig muss in `phase`/`commitUngewiss` hängen | gelesen | Punkt 4 ergänzt |
| PC3b-9 | **Kimi 2** | **vorbestehend:** terminaler Job mit demselben `dedupe_key` blockiert jede Wiederbelebung — `enqueue` wirft `DedupeConflictError` (run_after weicht ab), `requeueStale` hält das für „offenen Job“ und tut nichts; Tests löschen `pdf_jobs` von Hand | selbst gelesen: Index `core/db.js:2163` für alle Status, kein `DELETE FROM pdf_jobs`, `enqueue` `:136-146`, `requeue` nur explizit | **gemessen wird im Bau zuerst (M4)**, dann Punkt 6 |
| PC3b-10 | **Kimi 3** | Fassung-1-Punkt 3 („Upsert fasst laufende Lease nicht an“) entzieht die heutige Heilung eines toten Workers: `running` mit totem Job als Dauerzustand | am Papier nachvollzogen | **Punkt 3 umgedreht**: Status-Verhalten bleibt, Richtigkeit gegen M2 kommt aus Punkt 4 |
| PC3b-11 | Kimi 4.3 | Punkt-5-Fall falsch herum beschrieben (Austausch VOR dem Upsert erzeugt keinen Mismatch) | am Code nachvollzogen | Punkt 5 neu formuliert |
| PC3b-12 | Kimi 1 (Frage 1) | `pdf_jobs.healthMetrics` zählt `dead` über alle Jobtypen — ob das ein Gate kippt, ist offen | nicht gemessen | Bau misst, Bericht nennt |

Ergebnis: Fassung 2 ist eine Umgestaltung (Punkt 3 umgedreht, Punkt 6 neu) → zweite Planprüfung.

## Fassung 2 (25.09.2026)

Zwei Lesespuren, verschiedene Bündel (DeepSeek Repo-Lesezugriff; Kimi: Papier, Kernmodule, `test_feature_storage_replica.js`,
Ausschnitte `routes/belehrungen.js`/`server.js`, Befundtabelle Fassung 1). Beide Spuren spielen alle Reihenfolgen A(H1)/
B(H2) durch (DS 7, Kimi 14): **kein Weg zu `succeeded` mit falscher Datei, keiner zum Löschen der richtigen, kein
Riegel auf eine fremde Lease** — unter der Ein-Puffer-Prämisse.

| # | Spur | Befund | Nachmessung | Entscheidung (Fassung 3) |
|---|---|---|---|---|
| PC3b-13 | Kimi F2-1 | Ein-Puffer-Prämisse trägt Punkt 4, kein geplanter Test kann „zweites Lesen“ fangen | am Papier nachvollzogen | Ein-Puffer-Test Pflicht |
| PC3b-14 | Kimi F2-2, DS Z4a | Nachschlagen des Jobs: `DedupeConflictError` ohne `jobId`; Abfrage muss `(studio_id, job_type, dedupe_key)` tragen; Ein-Studio-Tests sehen das nicht | `core/pdf-jobs.js:22-25` gelesen | Abfrage im Papier, Zwei-Studio-Test |
| PC3b-15 | Kimi F2-3 | Rücksetzen in Punkt 4/5 ist unter Punkt 3 unerreichbar; ohne Riegel gebaut kippte es ein fremdes `succeeded` | am Papier nachvollzogen | gestrichen, M2-Literale als Wache benannt |
| PC3b-16 | DS Q1 | M3 mit Upsert vor dem Claim endet `dead` ohne Wiederbelebung | nachvollzogen | gewollt, benannt (Health Stufe 2, kein Deploy-Stopp — `ops/health-gate.sh:195-205` gelesen) |
| PC3b-17 | DS Q2a | `TerminalDedupeError` im neuen Zweig mitbehandeln | `core/pdf-jobs.js:146` | übernommen |
| PC3b-18 | DS Q2b | `requeue` setzt Priorität 0 | `core/pdf-jobs.js:153` | übernommen |
| PC3b-19 | DS Z3 | DB-Fehler im neuen Zweig laut | gelesen | übernommen |
| PC3b-20 | Kimi F2-4.3 | Testkommentar `:129-131` ist im Test richtig (fester `runAfter`) | nachvollzogen | nur Produktivkommentar berichtigen |
| PC3b-21 | Kimi F3.3 | `permanent` entfernen trifft auch echte Konfigurationsfehler bei gleichzeitigem Upsert | nachvollzogen | benannt |
| PC3b-12 | — | Kippt ein toter Job ein Gate? | `routes/health-intern.js:233`, `ops/health-gate.sh:195` gelesen: `degraded` = Stufe 2, KEIN Abbruch | beantwortet |

Fassung 3 ist eine Präzisierung (keine Umgestaltung) → keine dritte Planprüfung; Bau nach Warteschlange.
