# Offene Befunde C6-B (PDF-Jobs, Health, Korrekturblatt-Lesepfad, Krypto, Werkzeuge)

Stand 02.10.2026. Herkunft: `diffpruefung-c6b.md` und die Berichte des Bauenden (Runde 1 und Nacharbeit 1). Die Befunde
werden dort nicht kopiert, nur verwiesen.

| Kennung | Befund | Plan |
|---|---|---|
| C6B-1 | T-8: Kein Test für den Wettlauf „Datei verschwindet zwischen Existenzprüfung und Hash“ (`core/korrektur-pdf.js` alsBestehend, `routes/korrekturen.js` `/dokument/:id`). Die Fixtur ist aufwendig. | C6-G (Testlücke) |
| C6B-2 | Der Mitarbeiter-ZIP-Export (`routes/belehrungen.js`) prüft seit Nacharbeit 1 die Korrekturblätter auf ihren Inhalt. Die Belehrungs-PDFs selbst gehen weiter nur auf Existenz hin ins ZIP. Ob sie einen registrierten Hash haben, gegen den man prüfen könnte, ist nicht gemessen. | zuerst messen (verify_dokumente/pdf_hash der Belehrungsnachweise), dann eigenes Bündel |
| C6B-3 | Eine Zeile mit nicht vergleichbarem `pdf_hash` (Format) bleibt beim alten Verhalten: nur Existenz, keine Meldung. `pdf_hash` ist `TEXT NOT NULL`; ein solcher Wert wäre selbst ein Befund. | Anmerkung; ein Wächter über das Format im Bestand wäre der Weg (C6-G) |
| C6B-4 | PP4b-21: Ein Leistungsgewinn ist nicht belegt (Wandzeit im Rauschen). Der Roh-Raster (bis 16 MB) bleibt neben dem geflachten im Speicher, RSS nicht gemessen. | Anmerkung |
| C6B-5 | Die Bytes des kanonischen PNG weichen im pHYs-Chunk ab (Pixel gleich). Die SHA-256-Anker im Test hängen an der Version von sharp/libvips; eine Anhebung kann sie ändern. | Anmerkung; bei Anhebung von sharp den Test zuerst lesen |
