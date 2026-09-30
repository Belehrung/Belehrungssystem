# Offene Befunde DEP (nodemailer 10, 30.09.2026)

- **DEP-1:** `ops/export-check-deckung.json` (GymDocu) erfasst nodemailer 10 (bringt jetzt Typen mit) nicht —
  `node ops/export-check.js` bleibt EXIT 0. Eintragen oder begründet auslassen (Betreiber-Entscheidung laut Bauendem).
- **DEP-2:** Kommentare `test/helfer/netz-sperre.js:41` und `test_feature_netzsperre.js:237` nennen
  `node_modules/nodemailer/lib/shared/index.js:59` — in 10 `dist/cjs/shared/index.js:85`. Nachziehen.
- **DEP-3:** GymDocu `qs` (moderate) bleibt offen (gated nicht). Mit der nächsten Anhebung von body-parser/express.
- **DEP-4:** Hauptserver-Suite berührt den Mailpfad nicht und hat keine Netzsperre — der Sprung ist dort nur per Sonde
  belegt, nicht per Test. Extrarunde: Mail-Attrappe + Netzsperre im Hauptserver.
- **DEP-5:** Der DEP-Bauende hat seine eigenen, noch nicht gemeldeten Zweige per amend + `--force-with-lease` neu
  geschrieben — gegen die Hausregel (kein Force-Push). Folgenlos (kein PR, kein fremder Stand), in künftige Aufträge
  „kein amend, kein Force-Push" ausdrücklich aufnehmen.
