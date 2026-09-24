# Offene Befunde H2 — für die Extrarunde

Verweist auf `plaene/diffpruefung-h2.md`.

| # | Punkt | Stand |
|---|---|---|
| H2-D8 | `/login/tablet` ohne Cookie legt weiter je Anfrage eine 5-Minuten-Sitzung an — Ratenbegrenzung in nginx (Betreiber-Teil des Auftrags, nach dem Merge) | offen, Betreiber |
| H2-R2-1 | Marker auf Sitzungen ohne Merkmal stellt kein neues Cookie aus (DB-Zeile länger als Browser-Cookie) | offen, Anmerkung — Vorschlag: Marker setzt immer ein Zeitstempel-Feld |
| H2-R2-2 | Zeichen-Riegel auch im Query-Teil (legitimes Ziel mit `\` verliert den Tiefensprung) | offen, Entscheidung: so streng lassen? |
| H2-R2-3 | `cookie-signature` im Test ohne Eintrag in `package.json` | offen — selbst signieren (HMAC-SHA256) oder `devDependencies` |
| H2-R2-4 | `session`-DDL in Tests uneinheitlich | offen, Anmerkung |
