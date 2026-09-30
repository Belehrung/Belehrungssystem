# Offene Befunde C5-A (für die Extrarunde C6)

Die Einzelheiten stehen in `diffpruefung-c5a.md`.

- **F2:** Scheitert die Transaktion bei neu-single, steht der Alteintrag (Hash und Prüfcode) auf der neuen Datei.
  - Benannte Grenze, gemeldet über `melde()`.
  - Zu klären: ein Schreibweg über eine eindeutige Zieldatei statt über den deterministischen Pfad.
- **B8:** Sieben Formulare prüfen nur das Format des Datums, nicht den Kalendertag:
  - `belehrungen.js:1638`, `:1796`
  - `module.js:3530`, `:3604`, `:3679`, `:3755`
  - `sichtpruefung.js:3287`
- **F4:** `healthMetrics()` zählt tote Jobs aller Typen; die 7-Tage-Abräumung gilt nur für `storage_replicate`.
- **F7:** Die 409-Erkennung auf den Löschwegen hängt am Constraint-Namen.
- **F3 / R2-4:** Die Wartezeit am Monats-Lock ist unbegrenzt, es gibt keine Rückmeldung an den Admin. Seit Nacharbeit 1 umfasst die Haltezeit die ganze PDF-Erzeugung von neu-single. Eine hängende Engine hält damit auch den Monatslauf und dessen folgende Studios auf.
- **R2-1:** Verliert `mitMonatsLock` seine Lock-Verbindung, läuft `arbeit()` ohne Serialisierung weiter; es wird nur gemeldet.
