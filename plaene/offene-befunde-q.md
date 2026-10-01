# Offene Befunde Q (für die Extrarunde C6)

Die Einzelheiten stehen in `diffpruefung-q.md`.

- **R2-4:** Die Replay-Zuordnung der `defekt_ids` prüft nur die Anzahl der Formularindizes, nicht die Menge. Ein handgebauter Replay-Body mit gleicher Anzahl, aber anderen Indizes ordnet positionsweise zu. Behebung: den Formularindex in `geraete_defekte` speichern (Migration).
- **E2E-Drift (Bestand):** `test/e2e-durchlauf.js` ist auf master (13448c8) rot: 5 FAIL (Wartungsgerät über die UI, fällige Begehung, Tablet-PIN-Anmeldung, Spülprotokoll ×2), danach Abbruch bei `:332`. Die Datei ist nicht in `test/run.sh`.
- **R3-8** (`diffpruefung-q.md`, Runde 3): Ein Captive Portal oder Interceptor antwortet mit 200 + HTML. Der Eintrag kreist dann unbegrenzt als „vorübergehend“, im Badge steht kein Hinweis. Stand vorher genauso.
- **R4-3** (`diffpruefung-q.md`, Runde 4): Der Schreibversuch für den `sitzung_ok`-Merker kann still scheitern. Nach einem Neuladen und zehnmal 500 entsteht dann `wiederholt` mit Nachtrageliste. Das verlangt einen Speicherausfall; die Reihenfolge-Anweisung verhindert die Doppelerfassung, wenn man ihr folgt.
- **R4-9**: Ein Eintrag mit `sitzung_ok` kann über `bereits_geprueft`/`validierung` eine Nachtrageliste zeigen, etwa nach einem Studiowechsel des Tablets. Ein CSRF-403 wegen Host-Abweichung behebt Neuladen nicht; der Eintrag kreist dann sichtbar, aber auf Dauer.
- **N4-H1** (Bericht der Nacharbeit 4): Bei einem CSRF-403 mit gleichzeitig ausgefallenem Offline-Speicher sagt der Text „Verbindung prüfen“, nicht „Seite neu laden“.
- **N4-H2**: Nach einem Live-Submit mit abgelehnter Herkunft sagt der gelbe Kasten „wird automatisch gesendet, sobald Verbindung besteht“, der grüne „nach dem Neuladen“.
