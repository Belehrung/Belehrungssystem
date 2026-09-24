# Planprüfung C1 — V01-1, V09-1, V15-2 (24.09.2026)

Spur A: DeepSeek mit Repo (26 Runden, 3,00 $ geschätzt). Spur B: Kimi mit Bündel (neu gestartet nach Container-Neustart).

| Nr. | Spur | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| PC1-1 | A | V15-2: `routes/archiv.js:187-203` leitet die Gültigkeit zeilenweise ab (`u.gueltig_bis IS NULL OR >= $2`) — fehlt in der Fundortliste, der MAX-Wächter sieht es nicht | gelesen `archiv.js:187-195` | Fundort aufnehmen; Wächter erfasst jede Gültigkeitsableitung aus `unterschriften` (nicht nur MAX) |
| PC1-2 | A | V01-1: zwei weitere Suite-Dateien sichern den S20-Inhalt statisch zu (`test_feature_audit2_batchA_static.js`, `test_feature_pin_generation_static.js`) | gelesen (`batchA_static.js:25-26, 121-130`) | fachlich umstellen: sie sichern die Stilllegung zu, nicht mehr den toten Code |
| PC1-3 | A | V09-1: Restlücke — kaputte höchste Zeile mit Restore-Punkt ÜBER dem lesbaren Maximum (`dbMax ≥ journal.hoechste`) vergibt weiter doppelt | Logik nachvollzogen | benannte Grenze; dem Betreiber melden (einzig wasserdicht wäre fail-closed bei jeder kaputten Zeile — ausdrücklich abgelehnt) |
| PC1-4 | A | `ORDER BY datum DESC` sortiert NULL zuerst | PostgreSQL-Semantik | `NULLS LAST`, Test mit `datum NULL` |
| PC1-5 | A | „Mail“ als Fundort gibt es nicht | Suche | aus dem Papier streichen |
| PC1-6 | A | NULL-Semantik Tablet (`nochNie`) gegen Dashboard (erledigt) widerspricht sich | gelesen | zentrale Definition liefert nur die Zeile; Fundorte behalten ihr NULL-Verhalten; Tabelle vorher |
| PC1-7 | A | golive nicht ausführbar im Test; „keine DB-Verbindung“ nur mit ungültiger URL rotfähig | Logik | S20-Spawn mit ungültiger URL; golive statisch |
| PC1-8 | A | Sicht: `CREATE OR REPLACE VIEW`, Spiegel in `core/db.js`, `studio_id` je Konsument | Hausmuster | übernommen |
| PC1-9 | A | Vorfall `journal_kaputte_zeilen` muss VOR dem neuen Wurf bleiben | gelesen `qr-token.js:407-411` | übernommen |
| PC1-K1 | B | V09-1: globale Maxima statt blocklokal — Block A kaputt + DB zurück, Block B intakt → global kein fail-closed, Vergabe in A später doppelt; dazu Restfall wie PC1-3 | Logik mit `qr-token.js:468-477` nachvollzogen | Bedingung BLOCKLOKAL für den Block, aus dem vergeben wird; Restfall benennen |
| PC1-K2 | B | Fixtur „kaputt“ mit ausschliesslich kaputten Zeilen landet im ALTEN Zweig (`hoechste === null`) → Gegenprobe (b) scheitert still | Logik | Fixtur: lesbare Zeile über `dbMax` + mindestens eine kaputte; Beleg, dass der neue Zweig betreten wird |
| PC1-K3 | B | Tests brauchen einen eigenen Journalpfad; Standard ist `/var/www/gymdocu-daten/qr-verbrauch.jsonl` (Live!) | gelesen `qr-verbrauch.js:50-52`; `run.sh` setzt `QR_VERBRAUCH` NICHT | `run.sh` setzt `QR_VERBRAUCH` suiteweit auf tmp; jeder neue Test mit eigenem tmp-Pfad plus Setup-Assert |
| PC1-K4 | B | Wächter sieht nur MAX; `ORDER BY gueltig_bis DESC LIMIT 1`, JS-Reduktion, Kleinschreibung/Umbruch entgehen ihm | Logik | Vollständigkeit = jede `gueltig_bis`-Stelle über `unterschriften` ist einem Fundort oder der Definition zugeordnet (Liste im Test) |
| PC1-K5 | B | `:1877-1883`/`:1954-1959` filtern `IS NOT NULL` → „erhalten“ widerspricht „neueste zählt“ | gelesen | neueste NULL → keine Warnung; Filter entfällt |
| PC1-K6 | B | Gegenprobe (c) braucht einen Test JE Fundort | Logik | zehn nummerierte Fundorte, je ein Test |
| PC1-K7 | B | Kommentar `belehrungen.js:707` („bereits abgelaufen“) widerspricht dem 14-Tage-Fenster im Code | gelesen | Kommentar berichtigen |
| PC1-K8 | B | Stilllegung in `golive-studio.sh` muss VOR Zeile 22 (SU-/Argumentprüfung) stehen; Test mit vollständigen Argumenten und gefälschter URL | gelesen | übernommen, zwei Zusatz-Gegenproben |
| PC1-K9 | B | Dritter Aufrufer `core/qr-zuordnung.js` (Anzeige `/admin/qr/kleben`) zeigt künftig „nicht ermittelbar“; Fehlertext braucht einen Auflöseweg | gelesen (grep: `qr-token.js:555`, `qr-charge.js:302`, `qr-zuordnung.js`) | Text mit konkretem Schritt; Anzeige bleibt 200 |

DeepSeek 9, Kimi 9 (Überschneidung: Restfall V09-1, Wächterbreite, NULL-Semantik, S20-Testmethode). Alle getragen.
