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

## Ausführende Claude-Spur (`/workspace/c5g1-pruef-bericht.md`)

Geprüft wurden alle sieben Löschwege mit einer zwischen zwei Studios geteilten Belehrungs-Datei, über echte Routen, einen echten Retention-Lauf und ein echtes `deprovisionStudio`. Auf keinem Weg wurde die Datei gelöscht, die Prüfung ergab 9/0. Die Riegel sind doppelt gestaffelt: Fällt einer weg, fängt der andere. Erst mit beiden entfernt wird die Prüfung ROT (8/1). Gemessen wurden ausserdem 49 Seitenaufrufe mit Übergangswert, NULL und Endwert: die Seiten sind identisch, die Positivkontrolle steht. Der Worker beendet sich nach 20 Claim-Fehlern von selbst mit Exit 1 (488 ms, von aussen gemessen).

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| C-1 | sollte | U-LOE2: Ein Vorab-Auftrag löscht die `.enc`, auch wenn eine lebende Zeile darauf zeigt. Kehrt die Quelle danach mit gleichen Bytes zurück, bleibt die Zeile `succeeded`, und die Zweitkopie ist still weg. Voraussetzung: Die Transaktion scheitert zweimal UND die Quelle kehrt zurück. | Messung der Spur (m2/Zeile 6), Code gelesen | N1: Nach dem Löschen einer `quelle_geloescht`-`.enc` wird die zugehörige Zeile entfernt, und vor dem Löschen wird geprüft, ob die Quelle (wieder) da ist. Das schliesst auch G1-d. |
| C-2 | sollte, latent, unwiderruflich | Die Queue-Wiederholung prüft die Referenz nur, wenn `findeLoeschWurzel()` den Wert `BELEHRUNGEN_UPLOAD_DIR` liefert. Liegt das Upload-Verzeichnis unter `DOKUMENTE_DIR`, geht eine geteilte Datei verloren. | trägt (Messung Zeile 4) | N1: dieselbe Prüfung wie im direkten Weg (`liegtUnterBelehrungsUploads`), auch in `fuehreLoeschungenAus` (schliesst G1-b) |
| C-3 | sollte | `setzeVeralteteClaimsZurueck` ohne `studio_id` bleibt grün: Die Mandantentrennung dort ist ungeprüft. | trägt | N1: Test mit zwei Studios |
| C-4 | Anmerkung | = L-4 (Foto-Reaper, fehlende Tabelle) | trägt | N1 (mit L-4) |
| C-5 | Anmerkung | Das DELETE der Queue-Zeile ohne `studio_id` bleibt grün (die id ist global). | trägt | N1: Zusicherung mit zwei Studios |
| C-6 | Anmerkung | DB friert ein (TCP offen, keine Antwort): Der Worker steht still, der Heartbeat veraltet. | Messung | Sammelliste (der Heartbeat wird vom Health-Endpunkt erfasst) |
| C-7 | Anmerkung | DB-Ausfall im Upload-Fehlerweg: Die Datei bleibt ohne Queue-Eintrag liegen. | Messung | Sammelliste |

## Nacharbeit 1 (`1cf8b85..8320c2c`), Lesespur flash, Runde 2 (01.10.2026)

Den Diff habe ich selbst gelesen. Laut Bericht des Bauenden: Suite 0, 443 = 443, Lint 0. Abweichungen C-1(a) (bei älterer Quelle wird gewartet) und C-5 (statischer Pin plus Zwei-Studio-Test) übernommen.

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| R2-1 | sollte | „Quelle lebt“ entscheidet nur nach mtime. Wird die Quelle bloß berührt und löscht die Retry-Queue (ruft Weg 2 nicht) die Primärdatei danach, bleibt die .enc für immer. | trägt (`retention.js:859-895` ohne Replica-Aufruf) | N2: Weg 2 auch in der Queue; Hash-Prüfung |
| R2-2 | sollte | Test 6 heißt „gleiche Bytes“, misst aber nur die mtime. | trägt | N2 |
| R2-3 | Anmerkung | Jeder statSync-Fehler gilt als „Quelle weg“, auch ohne ENOENT. Folge: Es wird gelöscht. | trägt | N2: nur ENOENT gilt als weg |
| R2-4 | Anmerkung | Wartende Aufträge belegen bei `ORDER BY created_at LIMIT 200` dauerhaft Plätze. | trägt (`:1189-1195`) | N2: Aufträge ohne `last_error` zuerst |
| R2-5 | Anmerkung | Die Cron-Zeile der Replica-Löschaufträge nennt die neuen Zähler nicht. | trägt | N2 |
| R2-6 | Anmerkung | Die Begründung von L-1 ist überzeichnet: `deprovisionStudio` normalisiert schon per basename. | trägt | N2: Kommentar |
| R2-7 | Anmerkung | Foto-Reaper: Bei Stufe 1 = `fehler` meldet er „waisen: fehler“. | trägt; der Fehler wird laut gemeldet | Sammelliste |
| R2-8 | Anmerkung | Der C-5-Statiktest zählt 3 von 5 schreibenden Anweisungen. Die INSERTs tragen studio_id als Wert. | trägt | N2: Name der Zusicherung |
| R2-9 | Anmerkung | Mailer-Kommentar: „nimmt den Claim zurück“ gilt nur, wenn die Rücknahme gelingt. | trägt | N2: Kommentar |
| R2-10 | Anmerkung | Ein noch referenzierter Upload-Name bleibt beim Offboarding ohne Meldung liegen. | trägt | Keine Änderung: Das ist gewollt, die Datei gehört dann einem anderen Verweis. |
| R2-11 | Anmerkung | Der Offboarding-Aufräumlauf nimmt jeden absoluten .enc-Pfad aus der Queue-Datei. Der Root-Riegel fiel mit L-2. | trägt; ausnutzbar nur mit Schreibzugriff auf die Platte | Sammelliste |
