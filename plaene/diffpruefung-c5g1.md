# Diffprüfung C5-G1 — Löschwege, Reaper, Mailer-Claim, Worker

Stand 01.10.2026. Zweig `c5g1-loeschwege`, Commit `1cf8b85` (master bis E2). Der Bauende meldet: Suite 0, 436 = 436, Lint 0, viele eigene Mutationen (`/workspace/c5g1-logs/`). Seine Restpunkte stehen auf `plaene/offene-befunde-c5g.md`.

## Selbst gelesen

`datei-loeschqueue`/`belehrungen-pfad` (Referenzprüfung global über `dateiname`, `datei_vorhanden = 1`; scheitert die Prüfung, wird nicht gelöscht), `retention` (fünfte Wurzel, Referenzprüfung in der Queue-Wiederholung), `storage-replica` (Vorab-Anker im Autocommit vor der Transaktion, Vereinigung der Referenzen), `defekt_mailer` (Übergangswert, Bestätigung und Rücknahme nur auf den eigenen Claim), `foto-reaper` (Stufensperre), Aufrufstellen in `belehrungen.js` und `pruefbericht.js`.

**Überschneidung mit C5-D:** Die neue Anzeige „Servicetechniker benachrichtigt am …“ aus C5-D N3 liest `mail_gesendet_am`. Der Bauende von C5-D ist angewiesen, den Übergangswert nicht als Datum zu zeigen. Die Leserliste in G1 (`test_feature_defekt_mail_claim_uebergang.js`) muss beim zweiten Merge den neuen Leser aufnehmen.

## Lesespur flash (8 Befunde)

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| L-1 | sollte | `provisioning.js` Upload-Schleife: Der rohe `dateiname` geht in `path.join`, die Referenzprüfung vergleicht den rohen Namen. Bei `x/../y.pdf` wird `y.pdf` eines anderen Studios gelöscht. Das war schon vorher so (master :754). Ausnutzbar ist es nur über manipulierte DB-Werte. | trägt (Code gelesen) | N1: `path.basename` und `belehrungsDateiNochReferenziert()` |
| L-2 | sollte | N9-b schliesst „Replica ausserhalb Spiegel-Root“ endgültig ab. Der Reaper löscht solche Referenzen aber ausdrücklich (`storage-replica.js` ~1219, mit Prüfung absolut/`.enc`/ohne `..`). Nach einem Wechsel des Spiegel-Roots bleibt die personenbezogene `.enc` beim Offboarding für immer liegen. | trägt | N1: dieselbe Prüfung wie der Reaper, dann löschen und melden. Auslassung nur noch bei ungültiger Referenz |
| L-3 | sollte | Der Cron in `server.js` (~1703) gibt `stufenFehler` und `waisenZurueckgehalten` nicht aus (= G1-f). | trägt | N1 |
| L-4 | sollte | Foto-Reaper: Fehlt eine Tabelle wirklich, wirft Stufe 2 schon beim `db.q` → `waisenZurueckgehalten` bleibt 0 und die Meldung verschweigt die Waisen. Der Test fälscht nur `to_regclass`. | trägt | N1: Stufe 2 fragt nur vorhandene Tabellen ab bzw. zählt bei Sperre korrekt; Test mit `db.q`-Attrappe |
| L-5 | Anmerkung | `ok(…, true)` in S22a | trägt | N1: entfernen |
| L-6 | Anmerkung | `core/export-studio.js:45` bildet `UPLOAD_DIR` selbst | trägt | N1: `belehrungen-pfad` |
| L-7 | Anmerkung | Queue-Einträge hängen am anstossenden Studio. Nach seinem Offboarding verarbeitet sie niemand. | trägt | Sammelliste |
| L-8 | Anmerkung | `UNIQUE(studio_id, dateipfad)` im Live-Schema nicht belegbar | widerlegt: Der Drift-Wächter prüft Indizes und Constraints, und der Alarm vom 01.10. nennt nur die drei CHECKs | keine Änderung |
