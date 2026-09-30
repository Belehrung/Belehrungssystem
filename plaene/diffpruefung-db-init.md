# Diffprüfung DB-INIT

## Runde 1 (30.09.2026, `deddcd9..7c9db50`)

Bauer-Suite `SUITE_EXIT=0`, 410 = 410, eslint 0; Sperren beim Start 139 → 0 (> AccessShare), Kreisprobe 5/5 → 0/5.
Lesespur `deepseek-flash` (`scratchpad/dbinitr1/antwort-lese.txt`, 0,64 $): nichts Blockierendes. Ausführende Spur
(`scratchpad/dbinitr1/cc/befunde.md`): 9 + 4 Mutationen, Produktlogik richtig, Überlebende = fehlende Zusicherungen.

| Nr | Quelle | Befund | Folge |
|---|---|---|---|
| DI1-C1 | cc N2/N3 | gelöschter CHECK/Index: Heilung ungetestet | N1 §1 |
| DI1-C2 | cc N5 | `lock_timeout` ungetestet; Bauer-Kreisprobe dafür blind (`kreis2.js` trennt: 0 vs 3/3 Verluste) | N1 §1 |
| DI1-C3 | cc N6/XA | Wiederholung und ROLLBACK ungetestet | N1 §1 |
| DI1-C4 | cc XG | Weissliste nur als Konstante geprüft | N1 §1 |
| DI1-C5 | cc N4b/N4c | „Sequenz nie rückwärts“ ungetestet | N1 §1 |
| DI1-C6 | cc N8 | Migrationslauf ohne Arbeit darf Stand nicht erneuern — ungetestet | N1 §1 |
| DI1-C7 | cc Z1 | Endfehler nach ~19 s ist roher PG-Text ohne Kontext | N1 §2 |
| DI1-L1 | Lese B1 | Rückroll-Satz in `ops/deploy.sh` falsch für eine Fassung ohne Schema-Stand | N1 §2 |
| DI1-L2 | Lese B2 | Kommentar überschätzt `KRITISCHE_INVARIANTEN` (4 statt 15) | N1 §2 |
| DI1-L3 | Lese B3 | Fingerabdruck ohne Collation, `indisvalid`, Sequenz-Besitz | N1 §2 |
| DI1-L4 | Lese B4, cc Z2 | nicht heilbare Abweichung (Typ, Default) wird als Stand festgehalten | Sammelliste DBI-1 |
| DI1-L5 | Lese B5/B6 | PG-Update → ein SCHEMA-Lauf (README); veralteter Kommentar | N1 §2 |
| DI1-T1 | Lese Frage 5 | Test B `laeufe unverändert` kann nach ROLLBACK nicht fallen | N1 §1 |
| DI1-O1 | cc | erster Start nach einer Migration, die eine `studio_id`-Tabelle anlegt: FK-Härtung nimmt 8 stärkere Sperren (einmalig) | Sammelliste DBI-2 |
