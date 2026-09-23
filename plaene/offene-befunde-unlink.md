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
