# Diffprüfung C6-Restpunkte (C6D3-4, C6D2-5) — Weg E des A/B

Auftrag `plaene/auftrag-ab-qwen-executer.md` (plangeprüft: flash 11, Kimi 7 Befunde). Gebaut vom Executer im Arbeitsbaum
`/workspace/gymdocu-ab-e` (Zweig `ab-e` ab `bb7e7bc`); der Qwen-Weg wurde verworfen (`BAU-LAEUFE.md`, A/B).

- Produktionsdiff selbst gelesen (`core/defekt_mailer.js`, `routes/api-admin.js`, `routes/bezirk-magicline.js`, `routes/wartung.js`,
  `routes/webhooks.js`): Reset-Bedingung `Präfix UND (NOT Form ODER älter)`, Formprüfung an einer Stelle
  (`claimRestHatZeitstempelForm`, mit Platzhalter-Prüfung), `getMagiclineStatus()` über `getConfigStrict`, Meldungen in eigenem
  try/catch, Hinweiskarte mit der vorhandenen Klasse `.newkey-box`. Kein Befund.
- Lesespur: Kimi, blinde Bewertung beider Wege (Variante B = dieser Weg): zwei Anmerkungen (Verweis ohne Zeilennummern,
  Kopplung an die Reihenfolge der CSS-Deklarationen). Nicht umgesetzt: Zeilennummern in Kommentaren veralten, die Kopplung ist
  eine bewusst wörtliche Zusicherung.
- Abweichung vom Auftragstext: `<div class="card newkey-box">` statt `<div class="card">` in nachgebauten Farben — angenommen
  (dieselben Farben nicht zweimal schreiben).
- Vom Bauenden gemeldet, ausserhalb des Auftrags: `verifyMagiclineKey` (`routes/webhooks.js:163/169`) liest ebenfalls über
  `getConfig()`, fail-closed (401). Restlücke „Claim-Zeitstempel in der Zukunft“ benannt im Kopfkommentar.
  Beides auf `plaene/offene-befunde-c6-restpunkte.md`.
