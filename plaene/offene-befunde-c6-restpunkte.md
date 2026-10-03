# Offene Befunde C6-Restpunkte (Sammelliste, CLAUDE.md Abschnitt 3)

| Nr. | Befund | Stand |
|---|---|---|
| C6R-1 | Ein Claim-Zeitstempel in der ZUKUNFT verfällt nie (Wiederholer und Trainer-Knopf halten ihn für frisch). Aus eigenem Code nicht erzeugbar. Kopfkommentar `core/defekt_mailer.js`. | benannte Grenze, Extrarunde |
| C6R-2 | `verifyMagiclineKey` (`routes/webhooks.js:163/169`) liest Webhook-Key und TOFU-Fenster über `getConfig()`: ein Lesefehler endet als 401 ohne Meldung (fail-closed, aber stumm). | offen, Extrarunde |
| C6R-3 | Die Zeitstempel-Form steht in `routes/wartung.js` zusätzlich als JS-Regex (`mailStandZustand` Zeile ~446, `claimVerfallUhrzeit` ab ~2154) — anderer Zweck (Anzeige, Rechnung), andere Schreibweise. | prüfen, ob es dieselbe Aussage ist |
