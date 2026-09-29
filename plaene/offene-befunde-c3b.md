# Offene Befunde C3b (Sammelliste)

Stand 25.09.2026. Verweise statt Kopien; jeder Punkt bekommt eine eigene Extrarunde oder eine Betreiber-Entscheidung.

| Nr | Befund | Fundstelle | Warum nicht im Beitrag |
|---|---|---|---|
| C3b-S1 | Restfenster [Nachlesen … `queue.succeed`/`deadLetter`]: Zeile `pending` mit terminalem Job bis zum stündlichen Reaper (≤ ~75 min), Health „ok“ | `diffpruefung-c3b.md` Runde 2 (Einleitung), CC M3 | schliessen hiesse Nachlesen im generischen Worker vor `queue.succeed` (Architektur); der Reaper heilt |
| C3b-S2 | permanenter Fehler bei fehlender Zeile → toter `pdf_jobs`-Job ohne Zeile, Health dauerhaft „degraded“ | `diffpruefung-c3b.md` C3b2-8 | vorbestehend, eigener Aufräumweg für tote Jobs nötig |
| C3b-S3 | C3b-6 (DB-INIT) | `diffpruefung-c3b.md` C3b-6 | eigener Auftrag DB-INIT |
- **C3b3-4** (Runde 3, vorbestehend): der Fallback nach gescheitertem Enqueue (`routes/belehrungen.js:205-214`, und
  gleichartige Upload-Wege prüfen) schreibt einen vorab gebildeten Hash; bei einem zwischenzeitlichen Upsert steht die
  Zeile danach `dead` mit veraltetem Hash (Health „degraded“ bis zum nächsten Upload). Gemessen: frisch gebildeter Hash
  heilt (`scratchpad/c3bcc3/m9-v1.log`). Extrarunde.
