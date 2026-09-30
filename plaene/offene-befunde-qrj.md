# Offene Befunde QR-J (Sammelliste)

Stand 25.09.2026. Verweise statt Kopien; jeder Punkt bekommt eine eigene Extrarunde oder eine Betreiber-Entscheidung.

| Nr | Befund | Fundstelle | Warum nicht im Beitrag |
|---|---|---|---|
| QJ-S1 | §5-Quellenvergleich blendet `ausserhalb_bloecke`-Korrekturspannen aus: ein Zurückspielen, das Block und Charge einer abgerissenen Zeile mitnimmt, meldet nach der Korrektur keinen `datenbank_zurueckgespielt` mehr; nach Neuzustellung des Blocks bleibt die Spanne ausgenommen; Handeingriff (Charge ohne Block) erzeugt `journal_hinter_datenbank` bei jeder Vergabe | `diffpruefung-qrj.md` QJ5-11 | keine Fehlvergabe (Vergabe liegt dahinter), der Vorfall der kaputten Zeile hat vorher alarmiert; eine geometrische Regel brach `test_feature_qr_lage_blocklokal.js` 13b |

- **QJ6-8** (Runde 6, gering; `plaene/diffpruefung-qrj.md`): Zeile mit schlüssellosem Vorspann und „genau Q“-Rest bleibt
  nach der Freigabe unerledigt, weil ein nur im Journal bekanntes E als „alle“-Kandidat ausgenommen wird. Sicher
  (E gesperrt), Weg nach Neuanlage von E gangbar. Extrarunde.
- **QJ6-MU31** (Planprüfung N6 Runde 2): ein Korrektur-Anfang MITTEN in einem Chargen-Abschnitt wird nicht als
  Korrektur-Bruchstück erkannt; der heutige Schreiber verhindert die Form (Zeilenumbruch nach Riss,
  `core/qr-verbrauch.js:933-940`), möglich nur durch alte Schreiber oder Handbearbeitung. Extrarunde.
- **QJ7-K** (Runde 7, ausführende Spur K04–K14): Vollständigkeitsregeln des Lesers für Felder, die keine Stichprobe
  beschädigt (`abschnitt` ohne Ganzzahlprüfung, `roh_sha256`, `durch`/`zeitpunkt`) — Mutationen überleben. Bestand,
  nicht Teil von N6/N7. Extrarunde: je Feld ein literaler Fall.
- **QJ7-G** (Nacharbeit 7, benannte Grenzen laut Bericht und Kopfkommentar `core/qr-verbrauch.js` „BENANNTE GRENZEN"):
  (1) ein nur als Präfix lesbares `studio_id` benennt NICHT (nur Hinweis) — sonst Dauersperre für jedes passende Studio;
  (2) Untergrenze über dem Block von `--von` bricht mit eigenem Text ab, ohne Schalter (nur Handzeile/geänderter Block);
  (3) ein Bruchstück mit unlesbarem Typ OHNE Werkzeugmeldung (Signal, Absturz, Handzeile) bleibt gesperrt, bis ein
  Studio korrigiert oder `--eigentuemer` eines fehlenden Studios greift; (4) Frischprüfung der Freigabe vergleicht
  Erledigungen, nicht die DB-Sicht; (5) Handzeile mit `nr_bis` unter der Untergrenze; (6) `KORREKTUR_Z_BEFEHL` nennt
  `--abschnitt=<i>`, wenn der Abschnitt von Z nicht eindeutig ist; (7) ungetestet laut Bericht: R29/R29b, R46c, R49b,
  R58; (8) (v)-Text nennt `--abschnitt=5` statt des Abschnitts. Extrarunde nach dem Merge.
- **QJ8-B3** (Runde 8, Lesespur B3): `--art-laut-meldung` ist nur an Wert, unlesbaren Typ und (charge) Länge 1–2
  gebunden, nicht an eine tatsächlich erzeugte Meldung. Option: Seitendatei der Werkzeugmeldungen (K, Art, Zeilenhash)
  und Abgleich — scheitert aber gerade bei vollem Datenträger. Extrarunde oder Betreiber-Entscheidung.
- **QJ9-A** (Runde 9, R9-L1): die Schreibfehler-Meldung bindet den Bereich ab `groesseVorher` nicht an die eigenen
  Bytes; ein Schreiber OHNE den Lock `qr-charge-nummer` (nur Handeingriff) kann K zu einer fremden Zeile machen.
  Härtung: Präfix des eigenen Eintrags gegen die Bereichs-Bytes halten oder Schreibbeginn aus `eintragAnhaengen`.
- **QJ9-B** (Runde 9, R9-T1): tote Zweige (`k === null`, Rückfall `if (schreibfehler)` in `schreibfehlerEinordnen`),
  Test-Hook-Wurf verdeckt den Schreibfehler (nur Tests), Kommentar zu `commitUngewiss` (sitzt jetzt an der Hülle).
