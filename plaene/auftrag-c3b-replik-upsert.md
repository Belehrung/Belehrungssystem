# Auftrag C3b — Replik-Upsert: Zähler, Lease, Hash (Fassung 1, 24.09.2026)

Befunde: V10-3 (`plaene/vollpruefung-befunde.md`), R6-13 (`plaene/offene-befunde-unlink.md`, „erst messen, dann
entscheiden“). Beide sitzen in `core/storage-replica.js` `upsertReplica()` (`:108-125`) und `processReplica()`
(`:354ff`). Einordnung: **sehr komplex** im Sinne der CLAUDE.md — nebenläufige Zustände über eine Lease, ein Ergebnis,
das falsch grün aussehen kann (eine veraltete Datei als `succeeded`), und dieselbe Datei hatte im unlink-Beitrag zehn
Prüfrunden. Deshalb in ZWEI Stufen: erst messen (Standard-Executer genügt, er baut nichts), dann entscheiden und bauen.

## Stufe 1 — Messen (kein Produktivcode)

Drei Zustände je mit einem Test gegen eine Wegwerf-DB herstellen und das Ergebnis wörtlich melden (Zeilen der
`storage_replica` vorher/nachher, Rückgaben):

- **M1 (V10-3):** Zeile steht auf `dead` mit `attempts = max`. Neuer Inhalt → `upsertReplica(…, neuerHash)` → Zeile ist
  `pending`, aber `attempts` bleibt. Erster Fehlschlag danach: endet die Zeile sofort wieder als `dead`? (Wo wird
  `dead` gesetzt — Executer nennt die Zeile.)
- **M2 (R6-13a):** Zeile ist `running` (Lease läuft, Worker A lädt Inhalt H1). Upsert mit H2 setzt `status =
  'pending'`, `sha256 = H2`. Worker B claimt (Bedingung `status <> 'running'` ist jetzt wahr) und lädt parallel.
  Welcher Abschluss gewinnt, und kann am Ende `succeeded` mit `sha256 = H2` stehen, während die zuletzt geschriebene
  Fernkopie H1 ist?
- **M3 (R6-13b):** Der Hash-Vergleich in `processReplica` (`:411`) nutzt `replica.sha256` (vor dem Claim gelesen),
  nicht `running.sha256` (nach dem Claim). Zwischen beiden Lesungen ein Upsert mit neuem Hash: welcher Hash wird
  geprüft, welcher als erledigt gebucht?

Jeder Zustand wird über ZWEI Verbindungen im echten Zeitfenster hergestellt (Stub genau zwischen den beiden
Anweisungen, Vorbild: die Rennen-Tests im unlink-Beitrag), nicht durch direktes Setzen des Endzustands.

## Stufe 2 — erst nach der Messung, eigenes Papier

Kandidaten, NICHT vorab festgelegt: `attempts = 0` bei neuem Hash; Upsert fasst eine laufende Lease nicht an
(nur `sha256` vormerken, Status bleibt); Hash-Vergleich gegen `running.sha256`. Jede Behebung wird gegen die
Sperr- und Löschauftragslogik aus dem unlink-Beitrag gehalten (CLAUDE.md „Transaktionen und Sperren“: bei dieser
Klasse ist die Behebung gefährlicher als der Fehler).

-- Ende des Auftrags --
