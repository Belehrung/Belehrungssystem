# Offene Befunde C6-A2 (Monatssperre und Archivversionen)

Stand 02.10.2026. Die Herkunft steht im Bericht des Bauenden (benannte Grenzen 1–10) und in `diffpruefung-c6a2.md`.

| Kennung | Befund | Plan |
|---|---|---|
| A2-g1 | Altform-Dateien (Pfade ausserhalb `PDF_ROOT/<Studio>/`) werden vom Tausch weder gelöscht noch in die Queue gestellt. Sie bleiben liegen, gezählt als `altformBelassen`. | C6-G: eigener Weg für Altform-Reste (mehrere Studios können sie referenzieren) |
| A2-g2 | Auf einem Dateisystem ohne Hardlinks scheitert `link()` beim Veröffentlichen laut. Es wird nicht still überschrieben. | Entscheidung: so lassen. Der Server nutzt ext4; im Deploy-Gate prüfen, ob das gemessen werden kann. |
| A2-g3 | Scheitert die Löschung der Replik nach dem COMMIT, wird nur gezählt. Den nächsten Versuch macht der Löschauftrag der Replik, es gibt keine erneute Queue-Zeile. | Anmerkung, gleiches Verhalten wie in `fuehreLoeschungenAus` |
| A2-g4 | Eine neue Datei, die nach einem fehlgeschlagenen Tausch verwaist, lebt mindestens 24 h. | Anmerkung (gewollt, Anker) |
| A2-g5 | Bei der Rückstellung im Herbst kann das 24-h-Tor bis zu 1 h zu früh öffnen (Berliner TEXT-Zeitstempel). | Anmerkung, ohne Folge für ein Aufräumen nach 24 h |
| A2-g6 | `istGehalten()` hat ein Limit von 3 s. Eine sehr langsame DB gilt als „Sperre verloren“ (fail-closed). | Anmerkung |
| A2-g7 | Der alte Prüfcode (verify) bleibt nach dem Tausch „Registriertes Original“, weil das Register erhalten bleibt. Die alte öffentliche URL liefert 404 (Neuform) bzw. 403 (Altform). | Betreiberfrage? Vermutlich richtig: der Prüfcode belegt, dass es das Dokument gab. In die Sammelfrage aufnehmen. |
| A2-g8 | Im Offboarding gelten `archiv_alt`/`archiv_vorab` als `studio`-Ziele und werden über den rekursiven Ordnerlöschlauf erledigt. | entschieden, so gewollt |
| A2-g9 | P-B: Scheitert das Nachlegen des Ankers bei Pfadabweichung, liegt die Datei ohne Anker da. | C6-G, Waisen-Scanner (zusammen mit C6C-g1/g2) |
