# Offene Befunde Nachweis-unlink — für die Extrarunde

Verweist auf `plaene/diffpruefung-unlink.md` und `plaene/durchgang-befunde.md`.

| # | Punkt | Quelle | Stand |
|---|---|---|---|
| 1 | U-REAP1: kein Reaper für `BELEHRUNGEN_UPLOAD_DIR` und ersetzte Prüfberichte; nach einem gescheiterten Unlink bleibt die alte Datei ohne automatische Nacharbeit liegen | `durchgang-befunde.md` U-REAP1; Diffprüfung L7 | offen, eigener Beitrag |

## Aus Nacharbeit 7 (23.09.2026)

| # | Punkt | Zustand |
|---|---|---|
| U-LOE1 | `loescheReplikaFuerDatei()` setzt/löscht die ganze `(studio_id, local_path)`-Gruppe ohne Statusklausel; das Erfolgs-UPDATE in `processReplica()` setzt `succeeded` ebenfalls ohne Statusklausel — ein laufender Upload kann einen frisch gesetzten Löschauftrag überschreiben | vom Executer benannt, heute latent (Reaper 03:15, Löschläufe 04:30/04:45, `instances: 1`); Messung in Runde 4 beauftragt |
| U-LOE2 | DB-Fehler in `loescheReplikaFuerDatei()` → Aufrufer kommen nicht wieder (`core/pdf-loeschung.js` setzt `datei_geloescht` vorher) | Bestand; Planprüfung Runde 1 (B3-iii) |
| U-LOE3 | Worker stirbt genau zwischen `writeFile` und 1c, während das Studio gelöscht wird → Datei ohne Anker | Umbau Fassung 3, Punkt 5; doppelt unwahrscheinlich, aber benannt |
| R5-12 | stündlicher Reaper sequenziell (bis 200 × 10 s), Seq-Scan ohne passenden Index | Leistungsanmerkung, heute kleine Tabelle |
| R6-13 | Fundorte im Bestand, UNGEMESSEN (Diffprüfung Runde 6, Spur C): ein Upsert setzt eine laufende Lease auf `pending` (parallel zweiter Upload, eventuell veralteter Inhalt als `succeeded`); die Hash-Prüfung in `processReplica` nutzt `replica.sha256` statt `running.sha256` | erst messen, dann entscheiden — `plaene/diffpruefung-unlink.md` Runde 6 |
| N9-b | `loescheStudioDateien` überspringt ein Ziel ausserhalb `PDF_ROOT` STILL (`ok:true`); der Offboarding-Reaper zählt den Eintrag als erledigt und entfernt ihn ohne `melde()` (Executer Nacharbeit 9, gemessen) | Bestand; Entscheidung: melden? — `plaene/diffpruefung-unlink.md` „Nacharbeit 9“ |
| R7-8 | Hauptserver als Verbraucher von `cleanup_pending` (Format jetzt `<id>-<kennung>.json`, weiter ein absoluter Pfad) | prüfen, sobald das Hauptserver-Repo im Container ist |
| R7-9 | `core/error-tracker.js`: Drossel über die Signatur `Error:- -` gilt quellenübergreifend 15 min — `melde(new Error(…), null, <quelle>)` verschiedener Quellen verdrängen einander (gemessen, Runde 7 Spur C) | eigener Beitrag in der Extrarunde; betrifft alle Aufrufer ohne `req` |
| R9-12b | Allgemein: jeder Test, der `server.js` lädt, installiert dessen Prozess-Handler mit dem MODUL-internen `melde` — eine Attrappe am Export greift dort nicht; auf dem Live-Server (Deploy-Gate, `GYMDOCU_TG_*` gesetzt) wäre ein unbehandelter Wurf ein echter Alarm | alle solchen Tests prüfen (Nacharbeit 12 deckt nur den neuen Route-Test) |
