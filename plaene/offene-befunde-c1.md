# Offene Befunde C1 — für die Extrarunde

Verweist auf `plaene/diffpruefung-c1.md`.

| # | Punkt | Stand |
|---|---|---|
| C1-S1 | QR: aktiver Block ohne lesbare eigene Journalspur + kaputte Zeile → keine Sperre (C1-D3); eine Sperre auch hier ginge über die Entscheidung vom 24.09. hinaus | **Betreiber-Frage** (Empfehlung: sperren, wenn das Studio anderswo Spuren hat) |
| C1-S2 | a194 ist für den Unterschriften-Wächter strukturell unsichtbar, solange er Muster statt Zuordnungsliste prüft | in Nacharbeit (C1-D4) |
- **C1-S3 → eigener Beitrag DB-INIT-SPERREN** (aus Runde 3, vorbestehend auf master): Verklemmungen von `db.init()`
  mit gleichzeitigen `INSERT unterschriften` (3/3 auf master), exklusive Sperren durch `ALTER TABLE … ADD COLUMN IF
  NOT EXISTS` auch ohne Arbeit. Einzelheiten `plaene/diffpruefung-c1.md`, Abschnitt „Runde 3“.
