# Auftrag QR-J Nacharbeit 8 (30.09.2026, Fassung 2 nach Planprüfung `scratchpad/qrjn8p/antwort-{a,b}.txt`)

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

Behebung (Fassung 2, Planprüfung A P1–P6, B 2–5, 7):
- **Bereichsregel.** Ausgewertet wird nur, was ab Byte `groesseVorher` steht; gezählt wird im GESAMTEN Puffer
  (`journalZeilenAufteilen`). Ein `0x0a` als ERSTES Byte des Bereichs ist immer der Vorspann von `eintragAnhaengen`
  (eine JSON-Zeile beginnt nie mit `"\n"`; der Vorspann wird auch gesetzt, wenn das letzte Byte davor nicht lesbar war,
  `core/qr-verbrauch.js:1328-1329`) — also NICHT am Byte `groesseVorher-1` entscheiden. `groesseVorher === 0` (Datei
  fehlte oder war leer): nie ein Vorspann, K = 1. K = die physische Zeile, die am ersten Byte nach dem Vorspann beginnt.
  Alles hinter dem ersten `"\n"` nach diesem Byte ist fremd und wird ignoriert.
- **Einstufung.** Bereich leer → `geschrieben: false`, Text „nichts geschrieben“. Bereich nur der Vorspann → eigener
  Text „nur ein Zeilenumbruch geschrieben, kein Bruchstück der <Art>-Zeile“ OHNE Befehl (ein älteres Bruchstück
  bleibt, was es war). Sonst Zeile K: „vollständig“, wenn sie als vollständige Metazeile/Chargenzeile parst — mit ODER
  ohne abschliessendes `"\n"` (der Leser behandelt eine letzte Zeile ohne Umbruch genauso, A P5); sonst Bruchstück.
  `groesseVorher == null` → `geschrieben: null` ohne `fehler`, Text „nicht feststellbar — Dateigrösse vor dem
  Schreiben unbekannt; node tools/qr-journal.js zeigen“, KEIN `--art-laut-meldung`-Vorschlag. In
  `schreibfehlerMeldung` den `null`-Fall VOR `!b.geschrieben` prüfen (A P3).
- **Im Lock gebildet.** In `befehlKorrigieren`, `befehlVerwerfen`, `befehlFreigeben` wird der Schreibfehler-Fehler im
  bestehenden Catch um `eintragAnhaengen` INNERHALB des Transaktions-Callbacks gebildet und geworfen.
  `schreibfehlerEinordnen` reicht einen Fehler mit `code === 'QR_JOURNAL_SCHREIBFEHLER'` UNVERÄNDERT durch und baut
  keine zweite Meldung (A P4, B 3). Wirft die Meldungsbildung selbst, wird der ursprüngliche Schreibfehler geworfen
  (Code `QR_JOURNAL_SCHREIBFEHLER`, `ursache` = Schreibfehler), mit dem Zusatz „Meldung nicht bildbar (<Grund>):
  node tools/qr-journal.js zeigen“ — der Schreibfehler wird nie verdeckt. Ein vollständiges Lesen des Journals im
  Lock ist hingenommen (Fehlerpfad, Journal klein); im Bericht die Grösse nennen.
- **Tests literal** (K als Handliteral aus dem Vorzustand, nicht über `journalZeilenAufteilen` des Prüflings):
  (a) R8-H1: altes Bruchstück ohne Umbruch, eigene Attrappe schreibt genau den Vorspann `"\n"` und wirft (der
  vorhandene `mitSchreibfehler` bildet den Vorspann nicht ab) → Text „nur ein Zeilenumbruch …“, kein Befehl;
  (b) Vorspann + n Byte → K ist die NEUE Zeile; (c) Datei fehlt/leer, Riss nach n Byte → K = 1; (d) Vorspann obwohl
  die Datei davor mit `"\n"` endete (letztes Byte nicht lesbar nachgestellt) → K richtig; (e) vollständige Zeile ohne
  abschliessendes `"\n"` → „vollständig“; (f) `groesseVorher null` über direkten Aufruf UND über einen echten
  Werkzeugaufruf mit nicht messbarer Grösse → „nicht feststellbar“; (g) Lock-Nachweis: ein Test-Hook
  (`schreibfehlerHook`, nur für Tests, wie die übrigen) läuft im Moment der Meldungsbildung und misst über eine EIGENE
  Pool-Verbindung in `pg_locks`, dass der Advisory-Lock `hashtext('qr-charge-nummer')` gehalten ist. Gegenproben: alte
  Auswertung „letzte Zeile“ → (a) ROT; Vorspann-Entscheidung am Byte `groesseVorher-1` → (d) ROT; Meldungsbildung
  zurück in den äusseren Catch → (g) ROT; Durchreichen in `schreibfehlerEinordnen` entfernt → Doppelmeldung ROT.

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
  MAX-Prüfung. Die Frischprüfung liest über den POOL (`core/db.js:426-433`), nicht über `t` — ein Hook-INSERT über `t`
  ist unsichtbar (Planprüfung B 1). Je ein Fall über `vorFrischpruefungHook`, der über den POOL schreibt (danach
  aufräumen): M18b mit ECHTER `qr_charge` (ohne passende Journalzeile, sonst `passt:false`), ein `qr_token` der Charge
  über `maxToken`; M18c Blocklage ändern. Je Fall genau EINE Bedingung verletzt → Abbruch, nichts geschrieben, Audit +0,
  Text literal. Gegenproben je Bedingung entfernt → ROT.
- **M16**: literaler Fall „späteres Bruchstück nennt Z mit FREMDEM Hash“ → setzt keine Untergrenze (Trockenlauf mit
  `--bis` unter dessen `nr_bis` ist ok). Gegenprobe Hash-Vergleich entfernt → ROT.
- `test_feature_qr_journal.js:3136` und `:3334` (`startsWith`) auf vollständigen Literalvergleich umstellen
  (`:3145` `includes` ist neben dem vollen Literal redundant und darf wegfallen).

## Nicht in diesem Auftrag

R8-L3 (`--art-laut-meldung` technisch nicht an eine erzeugte Meldung gebunden) → Sammelliste `QJ8-B3`.

## Bericht

Volle Suite (Aufruf laut CLAUDE.md, Dateizahl-Ritual), `npx eslint .`, beide QR-J-Testdateien, jede Gegenprobe ROT/GRÜN
wörtlich. Zustandsfrage: welcher Zustand entsteht dadurch, dass die Meldung jetzt im Lock gebildet wird (Lesefehler im
Lock, Laufzeit im Lock, Wurf aus der Meldungsbildung selbst) — und kann ein Wurf dort den eigentlichen Schreibfehler
verdecken?

-- Ende des Auftrags --
