# Offene Befunde P2 — für die Extrarunde

| # | Punkt | Stand |
|---|---|---|
| P2-S1 | fail2ban auf dem Server: zählt eine nginx-Jail 4xx-Antworten, können die neuen 400er (Eingabefehler) eine ganze Studio-IP sperren (`plaene/diffpruefung-p2.md`, P2-B12). Auf dem Server `fail2ban-client status` und die Filter prüfen | offen — braucht Serverzugang |
- **P2-S2** (aus P2-R2-12): `server.js` QR-Block antwortet bei „Bestellung existiert nicht“/„gehört nicht zu Studio“
  400 statt 404. Schnittstelle zum Hauptserver — erst den Aufrufer dort messen, dann entscheiden.
- **P2-S3** (aus P2-R2-10): `sendeWartungsDefektMail` meldet nur `false`, ohne Grund; die Mail-Seite kann parallelen
  Versand (409) nicht von verschlucktem DB-Fehler (500) trennen. Gehört zu C3a (dieselbe Datei, V07-1).
- **P2-S1 ergänzt:** die Login-Sperre antwortet seit P2 mit 429 — fail2ban-Regeln auf dem Server auch darauf prüfen.
- **P2-S4** (aus P2-R2-8, Nacharbeit 2): `server.js:610` `res.status(ergebnis.status).json(...)` — `ergebnis.status`
  stammt aus mehreren `return { status: N, … }`-Zweigen der umschliessenden `db.tx()`-Transaktion (POST
  `/intern/qr-block`). Der P2-Wächter (`test/helfer/fehlerstatus-scan.js`) kennt nur Funktionsaufrufe mit
  Statusparameter und Lookup-Tabellen, keine über eine Transaktionsfunktion verstreuten Objektliteral-Rückgaben —
  diese Stelle bleibt UNGEPRÜFT. Von Hand nachgesehen (25.09.2026): alle neun `status:`-Zweige tragen 200, 400 oder
  409, keiner darunter. Bleibt bei jeder künftigen Änderung an dieser Route von Hand zu prüfen, bis eine
  allgemeinere Scanner-Form dafür existiert.
