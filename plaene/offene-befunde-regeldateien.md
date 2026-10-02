# Offene Befunde aus der Prüfung der Regeldateien (02.10.2026)

Herkunft: flash-Prüfungen der CLAUDE.md von GymDocu und Hauptserver gegen ihr Repo. Die Berichte liegen im Scratchpad
(`regeln/gd.txt`, `regeln/hs.txt`), der Auftrag in `auftrag-repo-claudemd-abgleich.md`. Hier steht nur, was NICHT im
Doku-Abgleich gebaut wird. Selbst nachgemessen ist bisher nur D (siehe Auftrag); die Punkte unten sind FUNDORTE.

| Kennung | Repo | Befund | Plan |
|---|---|---|---|
| RD-1 | Hauptserver | G: `routes/superadmin.js:975-981` wertet `not_found` nur am JSON-Feld aus, ohne den HTTP-Status zu prüfen, und löscht danach die Registry-Zeile (`:998`). Die Hausregel (CLAUDE.md:72-74) und `core/offboarding-core.js:64-65` verlangen 404 UND das Feld. | eigener Bauauftrag (Fehlerklasse wie der Vorfall mcfit-chemnitz) |
| RD-2 | Hauptserver | H: `pruefeStudioIntegritaet` (`routes/superadmin.js:1148-1182`) prüft zuerst den Ordner `studio.db` und fragt erst danach PG. Die Hausregel sagt: zuerst PG fragen. Ein Test pinnt das heutige Verhalten (`test_superadmin_integritaet.js:36-39`). Dieselbe Klasse beim 2FA-Reset per sqlite3 (`:938-945`). | eigener Bauauftrag, zuerst messen |
| RD-3 | Hauptserver | F: `certbot delete` läuft weiter (`routes/superadmin-offboarding.js:278`, `routes/superadmin.js:994`, gepinnt in `test_offboard_deprovision_pflicht.js:208`), die Anleitung sagt dagegen „kein Einzelzertifikat“. | Anmerkung; entscheiden: entfernen oder als No-op benennen |
| RD-4 | Hauptserver | C: `provisionToken()` hat drei lokale Kopien neben `core/offboarding-core.js` (`routes/registrierung.js:52-57`, `routes/superadmin-import.js:26-31`, `routes/superadmin.js:974`). Dieselbe Aussage an mehreren Orten. | eigener kleiner Bauauftrag |
| RD-5 | Hauptserver | Karenzdatum: `setDate` gefolgt von `toISOString().slice(0,10)` (`core/offboarding-core.js:120-121`, `routes/superadmin-offboarding.js:67-71`). In sich konsistent (überall UTC), kann aber vom Berliner Kalendertag um einen Tag abweichen. | Anmerkung |
| RD-6 | GymDocu | H2: hartes `DELETE` auf `wartung_geraete` (`routes/admin/geraete.js:6909/6940`) für Geräte ohne Prüfhistorie, abgesichert durch einen Riegel und RESTRICT. Ein gewollter Weg, aber eine Ausnahme von „nie DELETE“, die in der CLAUDE.md nicht steht. | im Doku-Abgleich prüfen, ob die Ausnahme benannt werden soll; sonst Betreiber-Frage |
