# Offene Befunde SG (Semgrep-Hinweis, GCM-Tag)

- **SG-S1** (Lesespur F6, selbst gemessen 30.09.2026): `core/file-crypto.js` — `encryptBuffer(leer)` erzeugt 28 Byte,
  `decryptBuffer` verlangt ≥ 29 → „zu kurz oder ungültig“. Eine replizierte leere Datei ist nicht wiederherstellbar.
  Extrarunde (Grenze auf IV+Tag senken, Test für Leerinhalt, Stream-Weg mitprüfen).
- **SG-S2** (Runde 2, B7, Bestand): `routes/archiv.js:824` fängt jeden Entschlüsselungsfehler als „Code falsch“ —
  ein defektes Secret (auch `SecretZuKurzError`) bleibt betrieblich unsichtbar. Extrarunde (loggen/melden ohne Wert).
- **SG-S3** (Runde 2, B5, Lesespur `scratchpad/sgd/antwort-n1.txt:77`): `ops/semgrep-hinweis.js` bildet die
  Zusammenfassung unmaskiert; im `catch`-Fall geht sie nach stdout — Fundtexte aus dem PR-Code mit `::`-Präfix wären
  dann ein Workflow-Command-Kanal (Workflow nur `contents: read`). Extrarunde: `maskiereDaten` auch dort.
