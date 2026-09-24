# Offene Befunde DeepSeek-Vollprüfung — für die Extrarunde

Verweist auf `plaene/vollpruefung-befunde.md` (Nachmessung dort).

| # | Punkt | Stand |
|---|---|---|
| V06-1 | Vorgangsseite fällt bei DB-Fehler der Nebenabfrage ganz | offen |
| V06-2 | `qr_charge`-Lesen ohne `studio_id` im WHERE (`qr-druckdaten.js:246`) | offen |
| V06-3b | Kommentar „ohne L“ in `core/2fa.js:94` falsch — Alphabet NICHT auf 31 kürzen (Verzerrung) | offen, Text |
| V06-4 | veralteter Kommentar zu nicht-numerischer `:id` (`qr-bestellung.js:781`) | offen, Text |
| V06-5 | `req.body` ohne Absicherung (`qr-bestellung.js:1891`) | offen |
| V06-6 | Doppelbestellung nach Prozess-Tod zwischen Mail und Commit | offen, Entscheidung |
| V06-7 | `formate: [null]` besteht die Formprüfung | offen |
| V06-8 | `GET /qr/kleben` ohne eigenes try/catch | offen, Anmerkung |
| V06-9 | 500 statt 422 für Datenzustände (`qr-druckdaten.js:361-366`) | offen |
| V01-1 | `S20-migrate.js` REPLACE löscht zentral entstandene Tabellen (QR-Nummernbuch u. a.) mit | offen, **Entscheidung Betreiber:** ziehen noch Studios um? sonst Werkzeug stilllegen oder DELETE auf Quelltabellen begrenzen |
| V01-2 | `setval` in S20 nicht transaktional (Probelauf/Rollback hinterlässt Sequenzen) | offen |
| V01-4 | `/admin/archiv/neu-single` ersetzt den Archiv-Eintrag nicht atomar | offen |
| V01-5 | 413-Meldung nennt 25 MB | offen, Text |
| V01-6 | Unterschriftsdatum aus prozess-lokaler Zeit | offen |
| V01-7r | Rest: `datumPlusTage` bei Zeitumstellung auf UTC-Prozess | offen, Anmerkung |
| V01-8 | `mail_gesendet` für nicht enthaltene Typen | offen |
| V01-9 | S20-Overlap-Guard nur bei Offset > 0 | offen, Anmerkung |
| V01-10 | S20 importiert unter eine fremde, schon belegte Studio-ID | offen |
| V01-11 | `/admin/archiv/mail/:monat` ungeprüft/unescaped (im Code als benannte Lücke) | offen |
