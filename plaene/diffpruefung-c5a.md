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

## Runde 2 (Lesespur flash über Nacharbeit 1, `20094e8..43f7bfc`)

Den B7-Rückfall (Stilllegen nach 23503 in eigener `auditTx`, `studio_id` in jeder Abfrage) habe ich selbst gelesen.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| R2-1 | sollte | Nach einem Verlust der Lock-Verbindung läuft `arbeit()` ohne Sperre weiter; nur `melde()`. Vor B4 stürzte stattdessen der ganze Prozess ab. | Sammelliste (selten; eine Behebung braucht einen Abbruchweg in `fn()`) |
| R2-2 | sollte | Ein zweiter Löschversuch an einer schon stillgelegten Zeile leitet stumm weiter. | Nacharbeit 2: eigenes Feedback |
| R2-3 | Anmerkung | Der Kommentar in `routes/archiv.js` sagt, Monatslauf und Einzelweg schrieben dieselbe Datei. Die Dateinamen unterscheiden sich; die Kollision gibt es zwischen zwei Einzelklicks und an der Zeile. | Nacharbeit 2: Kommentar berichtigen |
| R2-4 | Anmerkung | Der Monats-Lock hat keinen Timeout, die Haltezeit ist jetzt die ganze PDF-Erzeugung. | Sammelliste (F3 erweitert) |
| R2-5 | – | `last_error` in der Meldung: Telegram bekommt nur Quelle und Signatur, der Text steht nur im Serverlog. | kein Befund |
| R2-6 | Anmerkung | Die Zusicherung „Lock nach Fehlschlag frei“ belegt den Lock selbst nicht. Das tragen C und D. | Nacharbeit 2: Text präzisieren |
