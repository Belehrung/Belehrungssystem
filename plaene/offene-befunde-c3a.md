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
- **C3a-S6:** `routes/admin/mitarbeiter.js`, Löschweg, `DELETE FROM belehrung_freischaltung` NACH dem Commit (C3a2-3):
  steht in einem LEEREN `catch {}`, ohne `melde()` — anders als der direkt danebenstehende Token-Hausputz, der bei
  einem Fehlschlag meldet. Ein Fehlschlag bleibt hier vollständig unsichtbar; die Zeile überlebt als Waise (der
  Mitarbeiter ist zu diesem Zeitpunkt bereits gelöscht). Vorbestehend, NICHT durch Nacharbeit 2 eingeführt — nur
  sichtbar geworden, weil ein Nachbau-Lauf der Prüfspur (m8.js, C3a2-3) genau diesen Fehlschlag auslöste: der Versuch
  der Probe, eine "rennende" Unterschrift NACH dem bereits committeten harten Löschen einzuschieben, scheitert seit
  der Reihenfolge-Behebung selbst an der `unterschriften_mitarbeiter_fkey`-Fremdschlüsselprüfung (23503, der
  referenzierte Mitarbeiter existiert nicht mehr) — eine erfreuliche Nebenwirkung der Behebung, die aber den
  bestehenden leeren `catch` erstmals sichtbar auslöste. Zwei getrennte Punkte: (a) der leere `catch` verdient
  dieselbe `melde()`-Behandlung wie der Token-Hausputz daneben; (b) das ist eine Verhaltensänderung, keine
  Zusicherungs-Ergänzung, gehört also NICHT beiläufig in diese Nacharbeit.
- **C3a-S7:** `routes/webhooks.js` Upsert: `inaktiv_seit` folgt im Rennen (Admin-Deaktivierung zwischen Lesen und
  Schreiben durch einen Schreiber ohne Studio-Lock) dem alten JS-Wert, nicht dem CASE-Riegel; `aktiv` ist korrekt
  (`diffpruefung-c3a.md` C3a5-3).
