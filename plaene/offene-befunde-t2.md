# Offene Befunde T2 (Sammelliste)

Verweist auf `plaene/diffpruefung-t2.md`, kopiert nicht.

- **T2-S1** (aus T2-B2): eine lokal erzeugte, git-ignorierte Datei mit Rohwert (`playwright-report/index.html`)
  macht den Rohwert-Wächter lokal rot. Nur lokal (auf dem Server gibt es das Verzeichnis nicht); die N-1-Behebung per
  `--exclude-standard` war einseitig und wird zurückgenommen. Richtige Lösung: Ignorieren auf BEIDEN Seiten.
- **T2-S2** (aus T2-B10): Selbsttests für V23-1 (unlesbare Einzeldatei → Exit 2) und V21-5 (übersprungener Abschnitt →
  Exit 2); V18-2 falsches Rot bei einem Kommentar über 100 Zeichen zwischen den Feldern.
- **T2-S3** (aus dem Bau-Bericht): V13-3 und V15-1a nur gemeldet (benannte Grenzen im Testnamen/Kopfkommentar);
  dieselbe `[\s\S]*`-Klasse in `test_feature_korrektur_dokumente_static.js`.
