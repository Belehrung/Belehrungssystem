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
