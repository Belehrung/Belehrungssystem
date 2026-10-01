# Sammelliste C5-G (Kernmodule, Werkzeuge, Betriebsskripte)

Verweist auf die Befunddateien `plaene/diffpruefung-c5g1.md` und `plaene/diffpruefung-c5g2.md`. Jeder Punkt wird in der Extrarunde C6 bearbeitet oder vom Betreiber entschieden.

## Aus dem Bau von G1 (Bericht des Bauenden, 01.10.2026)

- **Q1** (vorbestehend): `test_feature_qr_journal.js` hängt von der absoluten Studionummer ab. Eine abgerissene Journalzeile betrifft jedes Studio mit gleichem Nummernanfang (`core/qr-token.js:408-420`). Gemessen: Sequenz 500699 rot, 500700–500702 grün. Jedes neue Studio in einem früher laufenden Test kann ihn wieder rot machen.
- **G1-a** `FOTO_DIR` fehlt (ENOENT): das zählt als Stufenausfall. Die CLI ohne Serverstart meldet dann Exit 2.
- **G1-b** `core/retention.js` `fuehreLoeschungenAus`: Die fünfte Wurzel ist dort ohne Referenzprüfung erlaubt. Heute liefert kein fileResolver einen Pfad darunter, eine künftige Konfiguration würde aber ungeprüft löschen.
- **G1-c** Die sechs Aufrufstellen in `routes/belehrungen.js` sind nur statisch geprüft.
- **G1-d** U-LOE2: Scheitert die Transaktion zweimal, bleibt die `storage_replica`-Zeile stehen und zeigt nach dem Reaper auf eine gelöschte `.enc`. Die Löschpflicht ist erfüllt, die Zeile hat keinen Leser.
- **G1-e** Sperren: Ein veralteter Übergangswert wird zurückgesetzt, aber nicht erneut versendet. Es gibt keinen automatischen Versandweg, nur den Trainer-Knopf.
- **G1-f** Der Cron des Foto-Reapers in `server.js` gibt `stufenFehler` nicht in seiner Zusammenfassung aus. Die Meldung geht über `melde()`.
- **G1-g** `test_feature_storage_replica_loeschauftrag.js` prüft hart auf `/gymdocu_test`. Einzelläufe sind nur über eine Kopie möglich.
- **G1-h** V07-8, Restfenster (benannt): Stirbt der Prozess nach `sendMail` und vor `versandBestaetigen`, oder dauert der Versand länger als 30 Minuten, geht die Mail ein zweites Mal raus.

## Aus G2

- **E-2** `/intern/export`: Der Hauptserver liest `erhebungsfehler` nicht (`core/offboarding-core.js:98`). Der Betreiber erfährt es über `melde()`, der Kunde über das LIESMICH.
- `acorn` und `ipaddr.js` sind in `ops/export-check-deckung.json` erfasst, aber nicht gelistet (Hinweis des Laufs).

## Aus der Diffprüfung G1 (`plaene/diffpruefung-c5g1.md`)

- **L-7** Queue-Einträge hängen am anstossenden Studio. Nach seinem Offboarding verarbeitet sie niemand.
- **C-6** Friert die DB ein (TCP offen, keine Antwort), steht der PDF-Worker still. Sichtbar ist das nur über den Heartbeat.
- **C-7** DB-Ausfall im Upload-Fehlerweg: Die Datei bleibt ohne Queue-Eintrag liegen und wird nie geräumt.

## Aus Runde 2 der Lesespur zu C5-G1 N1 (01.10.2026)

- **R2-7:** Foto-Reaper. Endet Stufe 1 mit `fehler` (nicht `tabelle_fehlt`), wirft die Abfrage in Stufe 2 erneut. Die Meldung sagt dann „waisen: fehler“ statt einer Zahl. Laut ist das, aber unvollständig. Behebung in C6: Stufe 2 überspringt auch bei `fehler` und meldet „unbekannt“.
- **R2-11:** Offboarding-Aufräumlauf (`raeumeOffboardingRueckstaende`). Seit L-2 genügt ein absoluter `.enc`-Pfad ohne `..` aus der Queue-Datei, damit gelöscht wird; der Root-Riegel ist weg. Ausnutzbar ist das nur mit Schreibzugriff auf die Platte. Behebung in C6: Die Referenzen beim Aufräumen gegen die DB-Zeilen bzw. Aufträge des Studios halten, statt der Datei zu glauben.
