# Diffprüfung C5-A — DB-Integrität

Stand 30.09.2026. Zweig `c5a-db`, Commit `20094e8`.

Spuren:
- Lesespur `deepseek-flash` mit Repo-Werkzeugen, Ausgabe in `scratchpad/c5a-diff/flash.txt`. Präfix F.
- Ausführende Claude-Spur mit Mutationen in eigenem Arbeitsbaum. Präfix B.

## Befunde und Entscheidung

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| B1 | hoch | Das Drift-SOLL wird mit EINEM `db.init()` gebaut. Ab dem zweiten Start legt die Boot-Schleife (`core/db.js:2979`) `fk_<t>_studio` auch für Tabellen aus Migrationen an. Folge: dauerhaft 4× WARN „Constraint nur in LIVE“, jeden Monat. | Gelesen: die Schleife liegt in `init()`, `gymdocu-schema-drift.sh:73-78` baut init → migrate. Die Spur hat gemessen: 4 → 0 mit zweitem init. | Nacharbeit |
| B2 / F1 | mittel | `fn()` (Datei schreiben), der Prüfcode und der Hash liegen AUSSERHALB von `mitMonatsLock`. | gelesen (`routes/archiv.js:1098`, `:1161`) | Nacharbeit |
| F2 | mittel | Scheitert die Transaktion, steht der Alteintrag auf der neuen Datei. | Bleibt als benannte Grenze: `melde()` ist vorhanden. | Sammelliste |
| B3 | niedrig | Ein wurfendes `unlock` im `finally` überdeckt das Ergebnis. | Spur: 8/3 | Nacharbeit |
| B4 | niedrig | `lockClient` hat keinen `'error'`-Listener; ein terminiertes Backend beendet den Prozess. | Spur: Exit 1 | Nacharbeit |
| B5 | niedrig | Der FK-Scanner übersieht ADD COLUMN `studio_id` und `$$`-Quoting. | Spur: 34/0 bei beiden Fixturen | Nacharbeit |
| B6 | niedrig | Ein Kommentarsatz im SCHEMA-String ändert `SCHEMA_SHA256`; das SCHEMA läuft deshalb einmal neu. | Spur: 14 AccessExclusiveLocks | Nacharbeit |
| B7 | niedrig | Eine NOT-VALID-Altzeile eines fremden Studios macht das Löschen zur 409-Sackgasse mit „erneut versuchen“. | Spur: 409 gemessen | Nacharbeit |
| B8 | niedrig | Sieben weitere Formulare prüfen den Kalendertag nicht. | nicht gemessen | Sammelliste (C6) |
| B9 | P3 | Kommentar in `test_feature_p2_fehlerstatus_waechter.js:720` ist falsch. | – | Nacharbeit |
| — | niedrig | Das Weglassen von `end()` am Lock-Client sieht kein Test (Verbindungsleck). | Spur: alle grün | Nacharbeit |
| F4 | Anmerkung | `healthMetrics()` zählt tote Jobs aller Typen; abgeräumt wird nur `storage_replicate`. | gelesen | Sammelliste |
| F5 | Anmerkung | NOT VALID aus 0065 meldet der Drift-Wächter monatlich. | Die Meldung ist richtig, der Text nennt aber keine Handlung. | Nacharbeit: Text |
| F6 | Anmerkung | Die Verzahnungszusicherung stützt sich nur auf ein 700-ms-Fenster. | Spur: ohne Lock 9/2, also heute rot | Nacharbeit: `pg_locks` als Positivbeleg |
| F7 | Anmerkung | Die 409-Erkennung prüft über den Constraint-Namen. | gelesen | Sammelliste |
| F8 | Anmerkung | Das Abräumen protokolliert keine Job-Historie. | gelesen | Nacharbeit: `job_type`/`attempts`/`last_error` in die Meldung |
| F9 | Anmerkung | Die Kalendertag-Zusicherung prüft mit derselben Funktion wie die Route. | gelesen | Nacharbeit: Literale |
| F3 | Anmerkung | Die Wartezeit am Monats-Lock ist unbegrenzt. | gelesen | Sammelliste |

Die Sammelliste für C5-A steht in `offene-befunde-c5a.md`.
