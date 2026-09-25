# Diffprüfung C3b Stufe 2 (Replik-Upsert)

Zweig `fix-c3b-replik-upsert`, Kopf `1d9b08d` auf master `22dc613`. Auftrag `plaene/auftrag-c3b-stufe2.md` (Fassung 3).

## Runde 1 (25.09.2026)

Bau (Fable): M1–M4 vorher Fehlverhalten, nachher behoben (Bericht); Suite 394 = 394 grün (zweiter Lauf; der erste
fand eine Textkopplung der S18-Attrappe an die alte 1c-SELECT), neuer Test `test_feature_storage_replica_upsert_rennen.js`
53/0, Mutationen G1–G9 je ROT, Lint 0. Migration 0063 ohne 0062 auf master: `core/migrate.js` wendet Ausstehendes in
Namensreihenfolge an, kein Lückenwächter (Bericht).

Eigene Lesung (Diff `core/storage-replica.js` ganz gelesen): Claim erhöht `claim_nr`, alle drei Riegel lesen
`claim_nr`; alle Stellen nach dem Claim lesen `running.*`; ein Lesepuffer für Hash und Chiffrat; Hashfilter in 1c VOR
jedem UPDATE; `planeReplikationsJob` schlägt über alle drei Indexspalten nach, `requeue` setzt Priorität/Zeitpunkt des
Aufrufers (`core/pdf-jobs.js:150-166` gelesen: 0 Zeilen → `DedupeConflictError`, als verlorenes Rennen „offen“);
`requeueStale` zählt jeden Wurf als Fehler. Offene Frage an die Spuren: endloses Kreisen bei schnell wechselnder Datei
(jeder Veraltet-Wurf kostet einen Job-Versuch, der Upsert belebt).
Spuren (unwiderruflich → drei; Kimi ohne Guthaben, deshalb zweite DeepSeek-Spur mit anderem Bündel): Claude
ausführend (`gymdocu-c3b-cc`, `scratchpad/c3bcc/`), DeepSeek mit Repo-Lesezugriff (Diff), DeepSeek-Einzelaufruf
(Endstand storage-replica, pdf-jobs, Worker, neuer Test).
