# Offene Befunde C3a — für die Extrarunde

Verweist auf `plaene/planpruefung-c3a.md` (Nachmessung dort).

| # | Punkt | Stand |
|---|---|---|
| C3a-S1 | `getraenkeanlage_reinigungen.aufgabe_id` ohne FK: eine gelöschte Aufgabe entwertet die Zuordnung im PDF (`core/pdf-engine.js:1434`, LEFT JOIN → `-`) und in der Fälligkeit (PC3-11). Lösung: Aufgaben deaktivieren statt löschen oder Bezeichnung in der Reinigung einfrieren | offen |
| C3a-S2 | Defekt-/Wartungsmail ohne Wiederholungsweg: scheitern Versand oder Claim, ruft niemand erneut (einziger Auslöser `POST …/neue-fotos/fertig`) (PC3-20). Ausgang heute: `melde()` | offen |
| C3a-S-FK | `unterschriften.mitarbeiter` ohne ON-DELETE-Klausel (`core/db.js:1237`): Mitarbeiterlöschung scheitert, sobald Unterschriften existieren (vom Ausführenden gemeldet, vorbestehend; Test dokumentiert es als Szenario C). Was der Admin dabei sieht, misst die Diffprüfung | offen |
