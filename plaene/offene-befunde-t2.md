# Offene Befunde T2 (Sammelliste)

Verweist auf `plaene/diffpruefung-t2.md`, kopiert nicht.

- **T2-S1** (aus T2-B2): eine lokal erzeugte, git-ignorierte Datei mit Rohwert (`playwright-report/index.html`)
  macht den Rohwert-Wächter lokal rot. Nur lokal (auf dem Server gibt es das Verzeichnis nicht); die N-1-Behebung per
  `--exclude-standard` war einseitig und wird zurückgenommen. Richtige Lösung: Ignorieren auf BEIDEN Seiten.
- **T2-S2** (aus T2-B10): Selbsttests für V23-1 (unlesbare Einzeldatei → Exit 2) und V21-5 (übersprungener Abschnitt →
  Exit 2); V18-2 falsches Rot bei einem Kommentar über 100 Zeichen zwischen den Feldern.
- **T2-S3** (aus dem Bau-Bericht): V13-3 und V15-1a nur gemeldet (benannte Grenzen im Testnamen/Kopfkommentar);
  dieselbe `[\s\S]*`-Klasse in `test_feature_korrektur_dokumente_static.js`.

## T2-S4 — R2-2-Probe startet `node` über den PATH von `sudo` (25.09.2026, eigene Lesung `3b8d410`)

`test_feature_syntax_check_verhalten.js` ruft `sudo -u nobody bash …/syntax-check.sh`; `sudo` setzt `secure_path`,
das Skript findet also das `node` von dort (hier `/usr/local/bin/node`, nicht `process.execPath` = `/opt/node22/bin/node`;
im CI-Runner vermutlich das vorinstallierte statt des per `setup-node` gesetzten). Kann `nobody` gar kein `node` starten,
wird die Positivkontrolle ROT statt „Vorbedingung fehlt“. Auf dem Server liegt `node` unter `/usr/bin/node`
(`ops/cron.d-gymdocu-rechtsstand:28`), dort also kein Problem. Sauberer: Vorbedingung vorab messen
(`sudo -u nobody env PATH=<dirname(process.execPath)>:/usr/bin:/bin node -e 0`), bei Fehlschlag CI → FAIL, sonst SKIP;
danach Positivkontrolle und Sperrfall mit demselben PATH. Klein, eigener Handgriff in der Extrarunde.
