# Offene Befunde C5-C (für die Extrarunde C6)

Die Einzelheiten stehen in `diffpruefung-c5c.md`.

- **F5:** Scheitert eine der Zählungen im Monatslauf, wird ein leerer Monat erzwungen und archiviert. Die `pdf_archiv`-Zeile verhindert danach dauerhaft das Nachholen.

## Aus Nacharbeit 1 (Bericht des Bauenden, 01.10.2026)

- **finalize() ohne Reparatur aus Resten** (Fassung 2, Punkt 1, bewusst): `verify_dokumente` überlebt jede Fristlöschung, und ein Name kann mehrere Hashes tragen. Stirbt der Prozess zwischen `registriereVerify()` und `renameSync()`, löscht die Ernte die Temp-Datei nach 24 h wie bisher. Übrig bleibt eine verwaiste `verify_dokumente`-Zeile: `GET /v/<code>` zeigt „Registriertes Original“ ohne Datei. Das Dokument wurde nie ausgeliefert.
- **NEU, Monatslauf:** `vormonatNachholen` holt nichts nach, sobald für den Monat irgendein `pdf_archiv`-Eintrag existiert. Ein Absturz in Modul k lässt die Module k..7 dieses Monats ohne Nachweis. Das ist ein echter Nachweisverlust und gehört in die Extrarunde.
- **Doppelte Meldung:** Lässt sich ein Kandidat nach einer Reparatur nicht entfernen, meldet `entferneDatei` das selbst (ohne Entprellung), und zusätzlich zählt die Ernte es als `fehler`. Ein bleibender Fehler kann so täglich gemeldet werden.
- **R2-5 (Runde 2 von N1):** Der Lesepfad prüft nur, ob die Datei existiert, nicht ihren Hash. Eine Datei mit falschem Inhalt unter dem öffentlichen Namen ergibt still `missing:false`.

## CI-Wettlauf in `test_feature_csp_crawler.js` (01.10.2026, CI-Lauf 36824802556)

- `:961` `navResp.status()` mit `navResp === null`: `tabletPage.goto('/belehrungen/tablet')` folgt direkt dem Cardio-Check-POST mit Foto. Der Test wartet nur auf die POST-Antwort, nicht auf die Navigation, die die Seite danach selbst auslöst (der Kommentar bei `:930` beschreibt dieses Fenster schon). Lokal auf `3717422` grün, in der CI rot. Der C5-C-Diff fasst weder den Test noch den Cardio-Check an.
- Behebung (C6): vor dem nächsten `goto` den Navigationsabschluss abwarten (`waitForLoadState`) oder ein `null` aus `goto` als Wettlauf behandeln und einmal wiederholen, mit Zusicherung, dass der Status danach 200 ist. Gegenprobe: ein künstlicher Nachlauf-Redirect muss ohne die Behebung rot werden.
