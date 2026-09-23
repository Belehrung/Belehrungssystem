# Nachweis-unlink — Umbau: Löschauftrag als eigene Zeile (Fassung 1)

Stand 23.09.2026. Zweig `fix-nachweis-unlink` (HEAD `1fc97ee`), Migration 0060 ist NICHT auf master und
darf ersetzt werden. Anlass: Runde 4 (`plaene/diffpruefung-unlink.md`) — 13 Befunde, davon fünf mit
EINER Wurzel: der Löschauftrag hängt als Status `loeschen_offen` an der Replikationszeile, deren Lebenslauf
`processReplica()` (Erfolg/Fehler), `upsertReplica()`, `loescheReplikaFuerDatei()` und die Retention
mitschreiben. Jede Statusklausel verschiebt die Lücke eine Stelle weiter (R4-S1 ist durch A2 NEU entstanden).

Einordnung: normaler Auftrag mit Planprüfung, KEIN sehr komplexer — der Umbau ENTFERNT Nebenläufigkeit
(unveränderliche Auftragszeilen statt geteilter Statusmaschine), statt sie zu verfeinern.

## Gemessen vor dem Plan

* Leser von `.enc`-Pfaden nehmen ausnahmslos `remote_ref` aus der DB: `ops/replica-verify.sh:269-295`,
  `core/provisioning.js:401-406/554-560`, `core/retention.js:1104-1118`, `core/pdf-loeschung.js:246`.
  Keiner rechnet den Spiegelpfad aus `local_path` nach. → eindeutige Dateinamen je Upload sind verträglich.
* `processReplica()` schreibt `local_mirror` heute deterministisch nach `${mirrorRoot}/${rel}.enc`
  (`core/storage-replica.js:~275-280`) — ein Neu-Upload DESSELBEN Pfads überschreibt die alte `.enc`.
  Genau das macht einen Löschauftrag auf den Pfad gefährlich (er träfe die neue Datei).
* `onedrive`: jede Übertragung liefert eine neue Referenz (`onedriveImpl.uploadInhalt`).

## Zielbild

1. **Neue Tabelle** `storage_replica_loeschauftrag` (Migration 0060 ERSETZT den bisherigen Inhalt; die
   `loeschen_offen`-Erweiterung des Status-Checks entfällt, `core/db.js` deklarativ gleichziehen):
   `id` (Identität, PK), `studio_id` (NOT NULL, FK wie `storage_replica`), `backend`, `remote_ref` (NOT NULL),
   `local_path` (nur zur Auskunft), `grund` (`quelle_geloescht` | `ersetzt` | `verwaist`), `attempts`,
   `last_error`, `created_at`, `updated_at`. Eine Zeile = GENAU eine zu löschende Referenz. Niemand ausser
   dem Abarbeiter ändert sie.
2. **Eindeutige Spiegelnamen:** `local_mirror` schreibt nach `${rel}.${replica.id}-${zufall}.enc`
   (Zufall aus `crypto.randomBytes`), mit `COPYFILE_EXCL`-Äquivalent (`flag: 'wx'`). Damit kann keine
   Referenz je zwei Inhalte bezeichnen, und kein Löschauftrag trifft eine neuere Datei.
3. **`loescheReplikaFuerDatei(studio, pfad)`:** für jede Zeile mit Referenz Löschversuch; bei Fehlschlag
   INSERT Löschauftrag (`quelle_geloescht`). DANACH die Replikationszeilen löschen — wie vor Nacharbeit 6.
   Rückgabe bleibt `{ok, enc_geloescht, fehler}` (Aufrufer unverändert).
4. **`processReplica()` Erfolg:** `UPDATE … RETURNING` wie heute. (a) Keine Zeile mehr (Quelle
   zwischendurch gelöscht) → die GERADE hochgeladene Referenz sofort löschen, bei Fehlschlag Löschauftrag
   (`verwaist`). (b) Zeile trug vorher eine ANDERE Referenz → alte Referenz löschen, bei Fehlschlag
   Löschauftrag (`ersetzt`). Fehlerzweig: unverändert (schreibt nur Status/Fehler, keine Referenz).
5. **`requeueLoeschauftraege()`** (ersetzt `requeueLoeschenOffen`, gleicher Cron-Platz): je Auftrag
   Löschversuch; Erfolg (auch ENOENT) → `DELETE … WHERE id = $1 AND studio_id = $2`; Fehlschlag →
   `attempts + 1`. Keine Obergrenze (Löschpflicht endet nicht), sichtbar über `healthMetrics().loeschauftraege`
   und `melde()` je Fehlschlag. NICHT in `degraded` (Deploy-Gate).
6. **Entfernt:** Status `loeschen_offen`, A1a/A1b/A2-Sonderzweige, Rücksetzlogik, `veraltet`-Zähler.
   `upsertReplica`/`enqueueReplica`/Claim wieder wie vor Nacharbeit 6 (mit den Kommentaren berichtigt).
7. **Studio-Löschung:** `deprovisionStudio()` sammelt zusätzlich die Referenzen offener Löschaufträge
   (gleiche Mirror-Root-Prüfung wie `:554-560`), bevor die Zeilen per CASCADE verschwinden.

## Nachweis (je mit Gegenprobe ROT/GRÜN)

* Szenarien der Runde 4 als echte Tests (Test-DB, Attrappen für Löschen/Upload, kein echter Dienst):
  a1/a2/a3 (Upload läuft, Quelle wird gelöscht) → keine `.enc` ohne Zeile oder Auftrag; b (DELETE trifft
  `running`) → Auftrag `verwaist` oder gelöschte Datei; c (Retention-Retry) → nach Abschluss weder
  `.enc` noch Zeile; d (Upload zwischen Prüfung und Löschen) → neue Datei repliziert, alte gelöscht.
* **Invariante als eigener Test:** nach jedem Szenario gilt für jede `.enc` im Test-Spiegel: sie ist
  `remote_ref` GENAU EINER Replikationszeile ODER GENAU EINES Löschauftrags — Menge der Dateien auf der
  Platte gegen Vereinigung der Referenzen in der DB, beide Richtungen.
* Eindeutige Namen: zwei Uploads desselben Pfads → zwei verschiedene Referenzen, erste per Auftrag
  `ersetzt` gelöscht.
* Migration: neuer Test führt die DATEI aus (frische DB, zweiter Lauf idempotent); keine Kopie ihrer Logik.

## Fragen an die Planprüfung

1. Welcher ZUSTAND entsteht durch den Umbau, den es heute nicht gibt? Besonders: Aufträge, die nie
   abgearbeitet werden; eine `.enc`, die weder Zeile noch Auftrag hat; ein Auftrag auf eine Referenz, die
   eine lebende Zeile noch trägt.
2. Bleibt eine Verzahnung übrig, in der zwei Wege dieselbe Referenz verschieden behandeln?
3. Was wird SCHLECHTER (Speicher auf dem Spiegel, Betriebsübersicht, bestehende Spiegeldateien mit
   deterministischem Namen, `ops/replica-verify.sh`)?
4. Welche Fundstellen fehlen (weitere Schreiber auf `storage_replica`, weitere Leser von Spiegelpfaden)?
