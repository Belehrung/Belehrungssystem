# Offene Befunde C5-C (für die Extrarunde C6)

Die Einzelheiten stehen in `diffpruefung-c5c.md`.

- **F5:** Scheitert eine der Zählungen im Monatslauf, wird ein leerer Monat erzwungen und archiviert. Die `pdf_archiv`-Zeile verhindert danach dauerhaft das Nachholen.

## Aus Nacharbeit 1 (Bericht des Bauenden, 01.10.2026)

- **finalize() ohne Reparatur aus Resten** (Fassung 2, Punkt 1, bewusst): `verify_dokumente` überlebt jede Fristlöschung, und ein Name kann mehrere Hashes tragen. Stirbt der Prozess zwischen `registriereVerify()` und `renameSync()`, löscht die Ernte die Temp-Datei nach 24 h wie bisher. Übrig bleibt eine verwaiste `verify_dokumente`-Zeile: `GET /v/<code>` zeigt „Registriertes Original“ ohne Datei. Das Dokument wurde nie ausgeliefert.
- **NEU, Monatslauf:** `vormonatNachholen` holt nichts nach, sobald für den Monat irgendein `pdf_archiv`-Eintrag existiert. Ein Absturz in Modul k lässt die Module k..7 dieses Monats ohne Nachweis. Das ist ein echter Nachweisverlust und gehört in die Extrarunde.
- **Doppelte Meldung:** Lässt sich ein Kandidat nach einer Reparatur nicht entfernen, meldet `entferneDatei` das selbst (ohne Entprellung), und zusätzlich zählt die Ernte es als `fehler`. Ein bleibender Fehler kann so täglich gemeldet werden.
- **R2-5 (Runde 2 von N1):** Der Lesepfad prüft nur, ob die Datei existiert, nicht ihren Hash. Eine Datei mit falschem Inhalt unter dem öffentlichen Namen ergibt still `missing:false`.
