# Offene Befunde: Drift-Fix (Migration 0066, CHECK-Namen)

Befunde und Nacharbeit stehen in `plaene/diffpruefung-drift-0066.md`.

## G1 (01.10.2026, N1): Spaltentyp nachträglich per ALTER COLUMN TYPE geändert

Wurde der Typ einer der drei Spalten nachträglich geändert, gibt PostgreSQL den Constraint in der Form des Umbaus aus. Eine frisch angelegte Regel auf dieser Spalte sieht anders aus, deshalb fällt der Vergleich in 0066 auf „weicht ab“.

- Folge: Es wird nichts umbenannt, eine NOTICE wird ausgegeben, die Regel gilt weiter unter `_chk`. Der Drift-Wächter meldet die Namensabweichung weiter als WARN.
- Erreichbar ist der Fall heute nicht, alle drei Spalten sind TEXT.
- Der Test (Abschnitt 7b) hält das als benannte Grenze fest.
- Behebung in C6, falls gewünscht: Die Soll-Definition zusätzlich über eine zweite Wegwerf-Tabelle erzeugen (TEXT anlegen, dann ALTER TYPE) und beide Ausgabeformen annehmen. Das geht nur über eine neue Migration, denn 0066 ist nach dem Deploy unveränderlich.
