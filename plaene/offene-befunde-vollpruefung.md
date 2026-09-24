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
| V02-1t | Testfall „doppelt kodiertes `..`“ in `test_feature_mandantengrenze_dateiwege.js` fehlt (heute 404, gemessen) | offen, gering |
| V02-2 | Getränkeanlage löschen reisst Reinigungsnachweise per CASCADE mit, Oberfläche sagt das Gegenteil | offen, **mittel** — Muster Migration 0056 (RESTRICT) oder Deaktivieren statt Löschen |
| V02-3 | Betriebszeiten: DB-Fehler → stille Standardkonfiguration (auch im Repo offen geführt) | offen, mittel |
| V02-4 | doppelter Reinigungs-POST meldet „gespeichert“ | offen |
| V02-5 | Lageplan `parseFloat` ohne `isFinite` | offen |
| V02-6 | negatives Reinigungsintervall | offen |
| V02-7 | `?ids=` ohne Obergrenze, still verschluckt | offen, Anmerkung |
| V02-8 | `pdftoppm` synchron | offen, Anmerkung |
| V02-9 | Health meldet `db:false` bei jedem Teilausfall | offen, Anmerkung |
| V02-10 | Datumswerte der Betriebszeiten nur formal geprüft | offen, Anmerkung |
| V08-1 | Jahres-Check: Name der Bestätigung per `MAX` statt aus der jüngsten Zeile; Test mit nur einer Zeile | offen |
| V08-2 | `nachtragBanner()` liest geerbte Eigenschaften (`constructor`, `__proto__`) | offen |
| V08-3 | OneDrive ohne Zeitlimit (Backend inaktiv) | offen, Anmerkung |
| V08-4 | verlorenes Korrekturblatt wird nie neu erzeugt, still | offen |
| V08-5 | `hilfeButton` ignoriert `position` | offen, Anmerkung |
| V08-6 | `ladeMonatliche()` lädt zu viel | offen, Anmerkung |
| V09-1 | QR-Vergabe läuft bei kaputten Journalzeilen weiter (nur Alarm); mit zurückgespielter DB Doppelvergabe möglich | offen, **mittel, Entscheidung Betreiber**: fail-closed nur, wenn die DB hinter dem lesbaren Journal liegt? oder bei jeder kaputten Zeile (sperrt alle Studios)? |
| V09-2 | Monats-PDF: Sperr-Sichtkontrollen fehlen bei Ladefehler still | offen, mittel |
| V09-3 | Echtheits-Registrierung scheitert still, PDF trägt toten Prüfcode | offen, mittel |
| V09-4 | Bezirk-Archiv: `sendFile` ohne Wurzelprüfung | offen |
| V09-5 | `validateStorageReplicate(null)` TypeError | offen |
| V09-6 | Pausen-PDF scheitert an NULL-Zeit | offen |
| V09-7 | `core/` importiert `routes/betriebszeiten` | offen, Anmerkung |
| V09-8 | PDF ohne Seitenzahlen/QR bei Fehler in `addPageNumbers`, still | offen |
| V09-9 | Detailabfrage in Doppelschleife | offen, Anmerkung |
| V03-1 | Verbandbuch-Weitergabe-Protokoll scheitert still (`catch (x) {}`) | offen, **mittel** |
| V03-2 | `ladeFotos()` verschweigt DB-Fehler | offen |
| V03-3 | Spülprotokoll ohne Doppelsende-Schutz | offen |
| V03-4 | Tablet-Zeiten in Prozesszeit geparst (Server-TZ unbelegt) | offen — zuerst die TZ des Live-Servers messen |
| V03-5 | Eskalationsstunde aus Prozesszeit | offen — wie V03-4 |
| V03-6 | `/tablet/sperre`: Array-Body → 500 + Alarm, ohne Anmeldung | offen, **vor dem Pentest** |
| V03-7 | Verbandbuch-Eingaben ohne Format-/Längenprüfung | offen |
| V03-8 | negativer Stillstand | offen, Anmerkung |
| V03-9 | Namenszuordnung nicht deterministisch | offen, Anmerkung |
| V04-1 | Fachfirma-Prüfdatum nicht als Kalenderdatum geprüft | offen |
| V04-2 | „Fehler beim Speichern“ nach Commit → Doppelprüfung | offen, mittel |
| V04-3 | Dashboard verschluckt DB-Fehler bei Wochenfälligkeiten | offen, mittel |
| V04-4..17 | Anmerkungen aus Bereich 04 (TZ-Randfälle, Leistung, Texte, Magicline-Randfälle) — Liste in `plaene/vollpruefung-befunde.md` | offen, gesammelt |
| V10-2 | Signaturprüfung ohne Untergrenze: ein schwarzes Pixel gilt als Unterschrift | offen, **mittel, vor dem Pentest** |
| V10-3 | Replik-`attempts` bei neuem Inhalt nicht zurückgesetzt → neue Version still ungespiegelt | offen, mittel (Nähe zu R6-13 in `offene-befunde-unlink.md`) |
| V10-4 | fehlender Restore-Bericht zählt als ok | offen |
| V10-5 | DGUV-V3-Zuständigkeit bei Mischlage | offen, Anmerkung |
| V10-6 | Steckbrief-Ladefehler still; Kommentar zu Aufrufern ungenau | offen, Anmerkung |
| V11-5 | `staging-smoke.sh` meldet PDF_ROOT-Trennung ungeprüft als PASS | offen |
| V11-7 | `syntax-check.sh` grün bei null gefundenen Dateien (`xargs` ohne `-r`, keine Mindestzahl) | offen |
| V11-2..9 | übrige Anmerkungen aus Bereich 11 (Seed-Format, Meldetexte, Worker-Neustart, Gegenproben-Auswertung) | offen, gesammelt |
| V05-2 | Mitarbeiter-Löschung: Audit ausserhalb der Transaktion, ohne Absicherung | offen, **mittel** |
| V05-3 | CSV-Import ohne Kalendertag-Prüfung | offen |
| V05-4..7 | Import-Fehler still, Freischaltungs-Aufräumen still, Import-Rennen, Z2-Sollwert | offen, gesammelt |
| V12-1 | Offline-Warteschlange wiederholt Foto-Endzustände (409) endlos | offen, mittel |
| V12-3 | E2E-Datensparsamkeit ohne Status/Anker — grün bei 500 | offen, mittel |
| V12-2,4..8 | übrige Befunde aus Bereich 12 | offen, gesammelt |
| V07-1 | Mailversand ohne Doppelversand-Schutz, wenn der Claim scheitert; `mail_gesendet_am` ohne Nachzug für Alttabellen | offen, **mittel** — zuerst Live-Schema prüfen lassen |
| V07-2..9 | übrige Befunde aus Bereich 07 (Demo-Daten, Reaper, Export-Hinweis, Feiertags-Historie, Claim-Verwaisung, Speicher) | offen, gesammelt |
| V13-1..3 | Test-Stub `DESIGN_TOKENS_CSS`; falsche Begründung in der Ausnahmeliste `keine_systemeingriffe`; Zusicherung ohne Prüfung zählt als PASS | offen, gering |
| V21-1..6 | Test-PDFs ohne Umleitung, Aufräumpfad, Vorzustand erzwingt Sortierung, Mandantenfilter der Session-Entwertung ungeprüft, stilles Überspringen, ungeschütztes `git ls-files` | offen, gering |
| V14-1..7 | Testfragen: `status !== 200` akzeptiert 500, Wächter blind für Member-Aufrufe, tautologische Oder-Zweige, SQL-Kommentare, Helfer ohne `studio_id`, festes Kürzel, fehlende Sollzahl | offen, gering |
| V22-1 | Tests, die `core/provisioning` laden: `OFFBOARDING_QUEUE_DIR` nicht suite-weit gesetzt (landet in `/tmp`), `DOKUMENTE_DIR` nur über `run.sh` gedeckt | offen, gering — zusammen mit der unlink-Extrarunde (R9-12b) ansehen |
| V22-2..4 | Zählangabe im Kommentar, Erfassungsbereich des PIN-Wächters, Backtick-Muster | offen, Anmerkung |
| V15-1a | Rennen-Test Neue-Version erkennt die vertauschte Reihenfolge nicht (im Test benannte Grenze) | offen, gering |
| V15-1r | `belehrung_freischaltung.freigeschaltet_am`: zwei Formate in einer TEXT-Spalte | offen, Anmerkung |
| V15-2 | Gültigkeitsregel der Belehrungsübersicht: `MAX(gueltig_bis)` oder neueste Unterschrift? Test unterscheidet nicht | offen, **Entscheidung Betreiber** |
| V23-1..6 | Rechtsaussagen-Wächter schluckt Datei-Lesefehler; `>=`-Zusicherung; wandernder Sollwert NUMMER_START; Gegenprobe ohne Rücknahme; Studio nicht entsperrt; Satztrenner-Grenze | offen, gering |
