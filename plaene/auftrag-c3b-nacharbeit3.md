# Auftrag C3b Nacharbeit 3 (30.09.2026)

Grundlage: `plaene/diffpruefung-c3b.md`, Runde 3 (C3b3-1..3). Baum `/workspace/gymdocu-c3b`, Kopf `3546c47`.
Messskripte der Prüfspur: `scratchpad/c3bcc3/` (`m9-zweiter-requeue.js`, `m10-nachlesen-matrix.js`, `gp3.py`) — vor und
nach dem Bau, wörtlich. Einzeltests gegen `gymdocu_c3bn3_test`. Planprüfung ausgelassen: beide Spuren benennen dieselbe
Behebung, die ausführende Spur hat sie als Mutation gemessen; keine neue Mechanik.

1. **C3b3-1:** scheitert der zweite `requeue` mit `DedupeConflictError`, noch einmal nachlesen: offen → `{ job, wiederbelebt:
   false, offen: true }`; fehlt oder weiter terminal → Wurf wie heute. Test N3g umstellen: ein Fall, in dem ein dritter
   Aufrufer den Job zwischen Nachlesen und zweitem `requeue` belebt (m9-Lage) → kein Wurf, `offen: true`, Reaper `fehler 0`;
   ein Fall „bleibt terminal“ → Wurf. Gegenprobe: drittes Nachlesen entfernt → ROT.
2. **C3b3-2:** Test, in dem der Job zwischen verlorenem erstem `requeue` und Nachlesen durchläuft und `dead` endet →
   „wiederbelebt“. Gegenprobe Y1 (nur `'succeeded'` prüfen) → ROT.
3. **C3b3-3:** DB-Fehler beim Nachlesen nach dem COMMIT zusätzlich über `melde()` (eigener `err.name`, Drosselung wie
   die übrigen Replica-Meldungen, `core/storage-replica.js:1168-1171` als Muster); Test mit stummem `melde`-Stub,
   Aufruf literal zugesichert.

Volle Suite + Dateizahl-Ritual am Ende. Zustandsfrage: bleibt M10 bei 0 Verletzungen, und entsteht durch das dritte
Nachlesen ein neuer Weg, auf dem ein Aufrufer „offen“ meldet, obwohl kein Job läuft?

-- Ende des Auftrags --
