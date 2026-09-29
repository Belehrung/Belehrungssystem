# Offene Befunde SG (Semgrep-Hinweis, GCM-Tag)

- **SG-S1** (Lesespur F6, selbst gemessen 30.09.2026): `core/file-crypto.js` — `encryptBuffer(leer)` erzeugt 28 Byte,
  `decryptBuffer` verlangt ≥ 29 → „zu kurz oder ungültig“. Eine replizierte leere Datei ist nicht wiederherstellbar.
  Extrarunde (Grenze auf IV+Tag senken, Test für Leerinhalt, Stream-Weg mitprüfen).
