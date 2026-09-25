# Offene Befunde C3a — für die Extrarunde

Verweist auf `plaene/planpruefung-c3a.md` (Nachmessung dort).

| # | Punkt | Stand |
|---|---|---|
| C3a-S1 | `getraenkeanlage_reinigungen.aufgabe_id` ohne FK: eine gelöschte Aufgabe entwertet die Zuordnung im PDF (`core/pdf-engine.js:1434`, LEFT JOIN → `-`) und in der Fälligkeit (PC3-11). Lösung: Aufgaben deaktivieren statt löschen oder Bezeichnung in der Reinigung einfrieren | offen |
| C3a-S2 | Defekt-/Wartungsmail ohne Wiederholungsweg: scheitern Versand oder Claim, ruft niemand erneut (einziger Auslöser `POST …/neue-fotos/fertig`) (PC3-20). Ausgang heute: `melde()` | offen |
| C3a-S-FK | `unterschriften.mitarbeiter` ohne ON-DELETE-Klausel (`core/db.js:1237`): Mitarbeiterlöschung scheitert, sobald Unterschriften existieren (vom Ausführenden gemeldet, vorbestehend; Test dokumentiert es als Szenario C). Was der Admin dabei sieht, misst die Diffprüfung | offen |
| C3a-S3 | Claim-Fehler im Mailer: Mail bleibt dauerhaft aus, einziger Ausgang ein Alarm, den die melde-Drossel studio- und quellübergreifend zusammenfasst (Signatur req-loser Meldungen ohne Quelle/Studio, CC B7); scheitert `claimZurueck`, bleibt der Defekt stumm (Diffprüfung C3a-13) | offen, mit C2-S3 zusammen |
- **C3a-S4:** `vormonatNachholen` (`generateMonthlyPDFs.js`) zählt keine Getränkeanlage-Reinigungen — fällt der
  Monatslauf aus, entsteht für einen Monat nur mit Reinigungen kein PDF (C3a2-8, gemessen).
- **C3a-S5:** Waisenprüfung in Migration 0062 ohne `studio_id` — Reinigungen, deren `anlage_id` einem fremden Studio
  gehört, gelten nicht als Waisen (C3a2-9, gelesen).
- **C3a-S-FK2:** kein Fremdschlüssel `getraenkeanlage_reinigungen.aufgabe_id` → `getraenkeanlage_aufgaben` (Rückfalllinie
  zu C3a2-1; Nacharbeit 2 schliesst es im Code, eine Migration kollidiert derzeit mit C3b 0063).
