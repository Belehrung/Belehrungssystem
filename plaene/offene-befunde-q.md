# Offene Befunde Q (für die Extrarunde C6)

Die Einzelheiten stehen in `diffpruefung-q.md`.

- **R2-4:** Die Replay-Zuordnung der `defekt_ids` prüft nur die Anzahl der Formularindizes, nicht die Menge. Ein handgebauter Replay-Body mit gleicher Anzahl, aber anderen Indizes ordnet positionsweise zu. Behebung: den Formularindex in `geraete_defekte` speichern (Migration).
- **E2E-Drift (Bestand):** `test/e2e-durchlauf.js` ist auf master (13448c8) rot: 5 FAIL (Wartungsgerät über die UI, fällige Begehung, Tablet-PIN-Anmeldung, Spülprotokoll ×2), danach Abbruch bei `:332`. Die Datei ist nicht in `test/run.sh`.
