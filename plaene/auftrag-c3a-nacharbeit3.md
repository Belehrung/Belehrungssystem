# Auftrag C3a Nacharbeit 3 (26.09.2026)

Grundlage: `plaene/diffpruefung-c3a.md`, Abschnitt „Runde 3“ (C3a3-1..5), Betreiber-Entscheidung in `plaene/STAND.md`
(26.09.2026). Baum `/workspace/gymdocu-c3a`, Zweig `fix-c3a-datenintegritaet`, Kopf `ed5f6a5`. Einzeltests nur gegen
eine eigene DB (`gymdocu_c3an3_test`), nie gegen `gymdocu_test`, Sperrdatei nie anfassen. Einordnung: Standard.
Früh committen und pushen (Kontingent knapp; ein Abbruch darf nichts verlieren).

## 1. Admin-Deaktivierung hat Vorrang vor Magicline (C3a3-1, C3a3-2 — Betreiber-Entscheidung)

- Die Admin-Aktion „Deaktivieren“ hinterlässt ein eigenes Kennzeichen (z. B. `manuell_deaktiviert`), das nur die
  Admin-Aktion „Reaktivieren“ wieder löscht. VOR dem Bau messen und berichten: gibt es dafür schon eine Spalte? Eine
  neue Spalte braucht eine Migration — die nächste freie Nummer nach 0063 (C3b) prüfen und nennen; keine Kollision.
- Magicline-Webhook (`routes/webhooks.js` `handleEmployeeUpsert`, `aktiv` aus `content.status`, UPDATEs um `:324-336`) und
  API-Sync (`routes/api.js:279`, `aktiv = 1`) setzen einen MANUELL deaktivierten Mitarbeiter NICHT wieder aktiv (Name
  und übrige Felder dürfen weiter aktualisiert werden). Jede tatsächliche Reaktivierung über Webhook/Sync (aktiv 0 → 1)
  schreibt ein Audit-Glied mit Quelle.
- Pflichttests: manuell deaktiviert + Webhook `EMPLOYEE_UPDATED` ohne `INACTIVE` → bleibt `aktiv=0`, kein Audit-Glied
  „reaktiviert“; per Webhook deaktiviert (INACTIVE) + späteres Update aktiv → wird aktiv, Audit-Glied da; dasselbe für
  den Sync; Admin-Reaktivieren löscht das Kennzeichen. Je Gegenprobe ROT (Mutation + Zahl).

## 2. Deaktivierte unterschreiben nicht (C3a3-3)

`routes/belehrungen.js:843`: der Mitarbeiter wird nur mit `aktiv=1` gefunden; sonst derselbe Fehlerweg wie für einen
unbekannten Mitarbeiter. Test mit ausgeschalteter Tablet-Sperre. Weitere Leser, die einen Mitarbeiter für eine
Handlung (nicht nur Anzeige) laden, auflisten und je begründen, ob `aktiv=1` gehört.

## 3. Kleinere Punkte (C3a3-4, C3a3-5)

- Leeres `catch {}` beim Aufräumen nach dem Löschen (`routes/admin/mitarbeiter.js:1184-1186`) meldet über `melde()` wie
  der Token-Hausputz daneben (C3a-S6).
- PIN-direkt und Einladen für Deaktivierte: Knöpfe ausblenden, Route antwortet 409 mit Text „erst reaktivieren“.
- Aufgabe-Reaktivieren (`routes/getraenkeanlage.js:1009-1011`): `istGueltigeId` wie in den Mitarbeiter-Routen; UPDATE
  mit `AND aktiv=0` und `rowCount`-Prüfung vor dem Audit.

## Nach dem Bau

Volle Suite mit `SUITE_EXIT`, Dateizahl-Ritual, Lint; Gegenproben wörtlich; Zustandsfrage: welcher Zustand entsteht
(Kennzeichen „manuell deaktiviert“), und wer liest ihn falsch (Export, Retention, Liste, Magicline-Löschung
`EMPLOYEE_DELETED`)? Kein PR.

-- Ende des Auftrags --
