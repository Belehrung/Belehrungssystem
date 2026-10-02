# Offene Befunde C6-D2 (Doppelsenden)

Stand 02.10.2026. Die Herkunft steht in `diffpruefung-c6d2.md`; die Befunde werden hier nur verwiesen.

| Kennung | Befund | Plan |
|---|---|---|
| C6D2-1 | `test_feature_qr_journal.js` ist sporadisch rot. Die Aufräum-Zusicherung „Band der Nacharbeiten 3/4/5/6“ fand 9 Zeilen (Suite-Lauf 3, Baum `8e58d5c`). Einzeln und im nächsten Lauf war der Test grün. Das ist der zweite Fall nach C5-E1 (dort „behoben“). Am selben Tag gab es einen dritten Fall: C6-H, Nacharbeit 2, Lauf 1 (`/workspace/c6h2-suite-n2-lauf1.log`), dieselbe Zusicherung, wieder 9 Zeilen. Beide Fälle liefen, während ein zweiter Baum baute. Priorität: hoch, denn dieselbe Suite ist Deploy-Gate. Das Log liegt in `/workspace/c6d2-qrjournal-flake.log`. | eigene Untersuchung: Wer schreibt in das Band, und welcher Vorzustand bleibt stehen? |
| C6D2-2 | Altformulare ohne `client_uuid` sind nicht geschützt (Wartung, Spülplan). | benannte Grenze; erledigt sich, sobald keine alten Seiten mehr offen sind |
| C6D2-3 | Der Import serialisiert nur „Übernehmen gegen Übernehmen“. Das Anlegen von Hand, `holeOderLegeAn` und das Bearbeiten-Formular nehmen den Studio-Lock nicht. Ein Doppeleintrag gegen diese Wege bleibt möglich (A3/Frage 3 der Lesespur). | prüfen, ob ein Unique-Index auf (studio_id, kategorie_id, lower(name)) für aktive Geräte geht |
| C6D2-4 | Der Replay rekonstruiert die Mängelzahlen aus Freitext-Marken („» Sofort behoben“ …). Enthält ein Nutzertext die Marke, zeigt der Replay andere Zahlen als der Erstversand (R2-D). | eigene Spalte für die Folge eines Mangels prüfen |
| C6D2-5 | `setzeVeralteteClaimsZurueck` (`core/defekt_mailer.js`) vergleicht ebenfalls Text. Präfix plus Nicht-Zeitstempel wird vom Wiederholer nie als veraltet zurückgesetzt; seit A3 setzt nur der Trainer-Knopf ihn zurück. Aus eigenem Code nicht erzeugbar. | Formprüfung auch dort |
