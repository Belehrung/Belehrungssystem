# Auftrag QR-J Nacharbeit 8 (30.09.2026, Fassung 1)

Baum `/workspace/gymdocu-qrj`, Zweig `fix-qrj-journal-reparatur`, Kopf `e82d858` (N7 + master). Grundlage: Diffprüfung
Runde 8 (`plaene/diffpruefung-qrj.md`), Lesespur `scratchpad/qrjr8/antwort-lese.txt`, ausführende Spur
`scratchpad/qrjr8/cc/befunde.md`. Einordnung: nicht sehr komplex (Standard) — örtlich begrenzte Behebungen, jede mit
gemessenem Vorzustand. Einzeltests nur gegen eigene DBs `gymdocu_qrjn8_*_test`.

## 1. Schreibfehler-Meldung misst die richtige Zeile (R8-H1, R8-L2 — beide gemessen)

Heute nimmt `core/qr-verbrauch.js:1250` `schreibfehlerBruchstueck` die LETZTE physische Zeile der Datei.
- **R8-H1** (gemessen `scratchpad/qrjn7/sf1.js`): endet das Journal mit einem älteren Bruchstück ohne Umbruch und reisst
  ein neuer Schreibversuch nach genau dem vorangestellten `"\n"`, meldet die Freigabe-Meldung das ÄLTERE Bruchstück
  (`{"ty`, möglicherweise Korrektur) als „BRUCHSTÜCK der Freigabe-Zeile … verwerfen --zeile=2 --art-laut-meldung=freigabe“
  — eine falsche Erklärung wäre die Folge (Doppelvergabeweg). Mit `groesseVorher == null` rät sie ebenso die letzte Zeile.
- **R8-L2**: im Werkzeug rechnet die Meldung NACH dem Rollback (`tools/qr-journal.js` Catch ausserhalb `auditTx`), der
  Advisory-Lock ist frei; ein nebenläufig angehängter Eintrag wird als „die Zeile“ gemeldet.

Behebung:
- `schreibfehlerBruchstueck` wertet NUR den Bereich ab Byte `groesseVorher` aus: ein führendes `"\n"` gehört zum
  Schreibversuch (es wird nur vorangestellt, wenn die Datei davor nicht mit `"\n"` endete — das ist am Byte
  `groesseVorher-1` nachprüfbar); ist danach nichts übrig → `geschrieben: false` (kein Bruchstück der neuen Zeile). Sonst
  ist K die physische Zeile, die bei diesem Byte beginnt (Zählung wie `journalZeilenAufteilen`), und das Geschriebene ist
  genau der Bereich bis zum Dateiende; „vollständig“ nur, wenn der Bereich mit `"\n"` endet und die Zeile vollständig ist.
  `groesseVorher == null` → `geschrieben: null` mit eigenem Text („nicht feststellbar — Dateigrösse vor dem Schreiben
  unbekannt“), KEIN `--art-laut-meldung`-Vorschlag.
- In `befehlKorrigieren`, `befehlVerwerfen`, `befehlFreigeben` wird der Schreibfehler-Fehler INNERHALB des
  Transaktions-Callbacks (unter beiden Locks) gebildet — im bestehenden Catch um `eintragAnhaengen` — und nach aussen
  durchgereicht; `schreibfehlerEinordnen` darf ihn nicht neu bilden. `core/qr-token.js#chargeAnlegen` tut das schon.
- Tests literal: (a) der R8-H1-Fall (Vorzustand altes Bruchstück ohne Umbruch, Riss nach genau `"\n"`) → Meldung „KEIN
  Bruchstück“, kein Befehl; (b) Riss nach `"\n"` + n Byte → K ist die NEUE Zeile; (c) `groesseVorher null` → „nicht
  feststellbar“; (d) Werkzeug: ein Hook, der nach dem gescheiterten Schreiben (vor dem Rollback) und — getrennt — nach dem
  Rollback eine fremde vollständige Zeile anhängt: die Meldung nennt weiter die eigene Zeile K. Gegenproben: alte
  Auswertung „letzte Zeile“ wiederherstellen → (a) ROT; Meldung ausserhalb des Callbacks bilden → (d) ROT.

## 2. Frischprüfung der Korrektur erhebt die Untergrenze neu (R8-L1, Lesespur B1)

`pruefeKorrektur` sammelt Untergrenzen aus Korrektur-Bruchstücken (`tools/qr-journal.js:803-817`); die Frischprüfung
(`:1116-1136`) vergleicht Erledigungen, Block, Grenzen, MAX(qr_token), aber NICHT diese Untergrenze. Ein zwischen
Prüfung und Lock entstandenes Bruchstück desselben Studios für dieselbe Zeile (höheres `nr_bis`) wird übergangen; die
danach nötige zweite Korrektur lehnt (b) als zweite Korrektur desselben Studios ab (fail-closed, aber der beschriebene
Weg ist verbaut). Behebung: die Sammlung als eine Funktion (EIN Ort), in der Frischprüfung über `jetzt`/den frischen
Befund erneut rufen; weicht die Untergrenze vom Plan ab → Abbruch „nichts geschrieben; Prüfung wiederholen“. Test über
`vorFrischpruefungHook`, der ein Bruchstück schreibt; Gegenprobe Vergleich entfernt → ROT.

## 3. Zusicherungen, die heute nicht fallen (ausführende Spur, je gemessen)

- **M5**: Journal-Test ohne literalen Fall „Wiederholung der Korrektur von Z durch S mit `nr_bis` UNTER der
  Untergrenze, danach Freigabe“ — Soll: S und T bleiben betroffen, `tragendeDeckungen` leer (heute nur der gesäte Fuzz
  fängt den Filterausfall). Gegenprobe Untergrenzen-Filter im `wiederholt_fuer`-Block entfernt → ROT.
- **M1** (umgekehrt): im Wege-Fuzz blind — reicht, wenn der neue Journal-Fall aus M5 auch M1 fängt (messen).
- **M18b/M18c**: J10e nennt „Block, Grenzen, MAX(qr_token)“, keine Zusicherung fällt ohne die Block- oder
  MAX-Prüfung. Je ein Fall über `vorFrischpruefungHook` (ein `qr_token` der Charge über `maxToken` einfügen; die Blocklage
  ändern) → Abbruch, nichts geschrieben, Audit +0. Gegenproben je Bedingung entfernt → ROT.
- **M16**: literaler Fall „späteres Bruchstück nennt Z mit FREMDEM Hash“ → setzt keine Untergrenze (Trockenlauf mit
  `--bis` unter dessen `nr_bis` ist ok). Gegenprobe Hash-Vergleich entfernt → ROT.
- Lesespur: `test_feature_qr_journal.js:3136` (`startsWith`) und `:3145` (`includes`) auf vollständigen Literalvergleich
  umstellen, wo der Text vollständig bestimmt ist.

## Nicht in diesem Auftrag

R8-L3 (`--art-laut-meldung` technisch nicht an eine erzeugte Meldung gebunden) → Sammelliste `QJ8-B3`.

## Bericht

Volle Suite (Aufruf laut CLAUDE.md, Dateizahl-Ritual), `npx eslint .`, beide QR-J-Testdateien, jede Gegenprobe ROT/GRÜN
wörtlich. Zustandsfrage: welcher Zustand entsteht dadurch, dass die Meldung jetzt im Lock gebildet wird (Lesefehler im
Lock, Laufzeit im Lock, Wurf aus der Meldungsbildung selbst) — und kann ein Wurf dort den eigentlichen Schreibfehler
verdecken?

-- Ende des Auftrags --
