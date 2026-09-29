# Auftrag QR-J Nacharbeit 6 (30.09.2026, Fassung 4)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 6“ (QJ6-1..QJ6-9, QJ6-N1..N3); Fassung 2/3 nach Planprüfung Runde 1/2 (`plaene/planpruefung-qrj-n6.md`). Baum `/workspace/gymdocu-qrj`,
Zweig `fix-qrj-journal-reparatur`, Kopf `33d35c3`. Reproduktionen der Prüfspur: `scratchpad/qrjr6cc/` (`q1.js a|b|c|e|k`,
`q1e.js`, `q1f.js`, `q23.js`, `q4.js`, `q8.js`, `sv.js`, `sv18.js`, `mut.js` mit `liste.json`/`liste2.json`; DB-Anlage
`neudb.sh`/`frisch.sh`) — vor dem Bau gegen deinen Stand (muss das gemeldete Verhalten zeigen), danach erneut; beides
wörtlich. Einzeltests nur gegen eigene DBs (`gymdocu_qrjn6_*_test`). Einordnung: sehr komplex (unverändert — Leser und
Werkzeug sind zwei Quellen, die einander widersprechen können; Runde 6 zeigte wieder eine Doppelvergabe).

Leitregel unverändert: Überspringen kostet nur Nummern, Unterschlagen ist unwiderruflich; jede Sperre braucht einen
EHRLICHEN Werkzeugweg, und der Sperrtext nennt ihn.

## 1. Korrektur-Bruchstück ist ein Abschnitt MIT Schlüssel, Kandidat „alle“ (QJ6-1, QJ6-N1 — blockierend)

Gemessen: eine abgerissene KORREKTUR-Metazeile gilt heute als schlüsselloser Abschnitt; `uebrige-freigeben` ohne
Korrektur (bzw. `verwerfen`, wo erlaubt) hebt die Sperre auf, S vergibt in die belegte Spanne (`q1.js b`: 920010–920014
in 920010–920109; `c`, `e` ebenso).

- **Erkennung (fail-closed, Präfixregel):** Ein Abschnitt am ZEILENANFANG, der mit `{"typ` beginnt, ist ein
  **Korrektur-Bruchstück** — AUSSER er ist ab `{"typ":"f` ein Präfix von `{"typ":"freigabe"` bzw. ab `{"typ":"v` ein
  Präfix von `{"typ":"verworfen"` (nur diese drei Typen gibt es, `core/qr-verbrauch.js:276-291`). Also Korrektur:
  `{"typ`, `{"typ":`, `{"typ":"`, `{"typ":"k…`; verwerfbar wie heute: `{"typ":"f…`, `{"typ":"v…`. Die Unterscheidung
  steht an EINEM Ort: `verwerfbarkeit()` (`core/qr-verbrauch.js:350-377`, Zweig `beginntMitMeta` `:366-370`, Aufrufer
  `tools/qr-journal.js:834`, `:872`, `:1078`) und `abschnittLesen`/`traegtChargenschluessel` lesen dieselbe Funktion.
- **Kandidat bleibt „alle“** (wie heute beim Bruchstück, also nicht lockerer als bisher — Planprüfung Runde 2, A-B12):
  der Abschnitt gilt aber als MIT Schlüssel. Damit lehnen `verwerfen` und `uebrige-freigeben` ohne Korrektur ab; gangbar
  sind `korrigieren` DES BRUCHSTÜCKS durch das Studio mit Aufklebern (Spanne aus den Aufklebern), danach
  `uebrige-freigeben` für die übrigen, `--eigentuemer` und die benannte Freigabe. **`--keine-aufkleber` ist für ein
  Korrektur-Bruchstück ausgeschlossen** (es dokumentiert Aufkleber; heute unwirksam wegen `tragendeDeckungen`
  `core/qr-verbrauch.js:512`, danach wäre es tragend — das wäre lockerer, Runde 3 B3): Ablehnung mit Text und Test.
  Keine automatische Erledigung.
- **Hinweis im Sperr-/Ablehnungstext** (Ort: `wegFuer`, `core/qr-verbrauch.js:587-631`; dafür liest `abschnittLesen`
  `:382-394` bei Korrektur-Bruchstücken zusätzlich `studio_id` und `ersetzt_zeile`): ist `studio_id` nach der Chargen-Feldregel (`core/qr-verbrauch.js:188-197`,
  Feldreihenfolge des Schreibers `tools/qr-journal.js:996`, Komma = genau, unabgeschlossen am Ende = Präfix, NUR für
  `studio_id`) lesbar, nennt der Text dieses Studio bzw. den Präfix als vermutlichen Eigentümer; dazu: „sollte die
  abgebrochene Korrektur eine Freigabe, ein Verwerfen oder `--keine-aufkleber` der Zeile Z widerlegen, die Korrektur für
  Zeile Z ebenfalls wiederholen“ (Z nur, wenn `ersetzt_zeile` mit Komma lesbar).
- **Nicht erfasst (benannte Grenze → Sammelliste):** ein Korrektur-Anfang MITTEN in einem Chargen-Abschnitt (MU31-Form
  `test_feature_qr_journal.js:1296`). Der heutige Schreiber setzt vor jede Zeile nach einem Riss einen Zeilenumbruch
  (`core/qr-verbrauch.js:933-940`); die Form entsteht nur durch alte Schreiber oder Handbearbeitung. MU31 bleibt
  unverändert.
- **Schreibfehler-Meldung** (`schreibfehlerEinordnen`, `tools/qr-journal.js:912-923`, gerufen für Korrektur `:1048`,
  Verwerfen `:1150`, Freigabe `:1424`): nennt für alle drei nicht mehr einen festen Befehl, sondern „`zeigen` — dort steht
  der Weg für das Bruchstück“ (ein kurzer Riss einer Freigabe-/Verwerfen-Zeile bei `{"typ":"` gilt als Korrektur, ein
  fester Rat „verwerfen“ wäre dann ungangbar); für `art === 'Korrektur'` zusätzlich: „danach die Korrektur der
  ursprünglichen Zeile wiederholen“.
- Bestehende Zusicherungen FACHLICH umstellen (nie streichen), je mit neuem literalem Sollwert: F6
  `test_feature_qr_journal.js:2647-2676` (Fehler auf dem KORREKTUR-Weg erzeugen, sonst lehnt der Trockenlauf von
  `verwerfen` schon ab), J1 `:2276-2315`, `:1283-1291`, G6 `:1273`/`:1281`; `test_feature_qr_journal_wege.js:167`,
  `:446-452` (B3), `:457-468` (r12_meta_rest). A6 `:296-298` bleibt „alle“. Weitere per `grep '"typ":'` in beiden
  Testdateien — Liste im Bericht.
- Pflichttests über den ECHTEN Schreibfehler-Weg, wo es geht, mit FESTEN Sollzahlen, deren Vorzustand sie nicht selbst
  erzwingt (S hätte ohne Sperre ab 920010 vergeben): `q1` a/b/c/e — nach dem Bruchstück ist S gesperrt, `verwerfen` und
  `uebrige-freigeben` lehnen ab (Grund literal), nach `korrigieren` des Bruchstücks und `uebrige-freigeben` vergibt S ab
  920110 (literal); `k` als Kontrolle. Risse im Typwort (`{"typ":"k`, `{"typ`) und „nichts lesbar“
  (`{"typ":"korrektur","ers`): je `chargenschluessel === true`, `verwerfbar === false`, beide Ablehnungen literal, Weg bis
  zum Ziel. Hinweistext literal (vermutlicher Eigentümer bei `"studio_id":92001,`, Z-Satz bei `"ersetzt_zeile":9,`).
  GEGENRICHTUNG: `{"typ":"freigabe","ers`, `{"typ":"f`, `{"typ":"verworfen",` bleiben `verwerfbar === true`, `verwerfen`
  angenommen (Muster A5 `test_feature_qr_journal.js:287-288`). `--keine-aufkleber` auf ein Korrektur-Bruchstück →
  Ablehnung literal. Gegenproben: Erkennung entfernt → Doppelvergabe → ROT; Typwort-Riss nicht erkannt → ROT;
  Erkennung überbreit (auch `{"typ":"f`) → Gegenrichtung ROT.

## 2. Weg-Texte, die bis zum Ende tragen (QJ6-2, QJ6-3 — blockierend nach Leitregel)

Gemessen: der genannte Befehl bricht ab, der Abbruchtext nennt den fehlenden Schalter selbst
(`--ausserhalb-bloecke --ohne-systembeleg` bzw. `--eigentuemer-unbekannt`). `wegFuer` kennt weder Blöcke noch bekannte
Studios; ein zweiter Befehl im Text bräche die Zähl-Literale der Wege-Datei (`:494`, `:518`, `:615`). Deshalb bleibt der
Weg-Text wie er ist, und der WEG-TEST folgt dem Abbruch:
- Nennt ein Abbruchtext einen Schalter aus der literalen Liste `--ausserhalb-bloecke --ohne-systembeleg` /
  `--eigentuemer-unbekannt`, führt der Weg-Test denselben Befehl mit diesem Zusatz erneut aus und muss ans Ziel kommen;
  jeder andere Abbruch bleibt ein Fehler. `:368` („jeder genannte Weg wird angenommen“) wird entsprechend umformuliert.
- Weg-Fixturen je ein Zustand „Spanne ausserhalb jedes Blocks“ und „E ohne Journalspur“. Gegenprobe: Schalter aus dem
  Abbruchtext entfernt → ROT.

## 3. Verworfen ist widerlegbar (QJ6-4, QJ6-N2)

Eine spätere vollständige Korrektur mit Spanne für einen verworfenen Abschnitt WIDERLEGT das Verwerfen wie eine Freigabe
ohne Korrektur (`widerlegendeKorrekturen` gilt auch für `verworfen`): die übrigen Kandidaten sind wieder gesperrt, bis
eine tragende Deckung sie erneut deckt. Log und `zeigen` (bei der Zeile) sagen das mit literalem Text („verworfen durch Zeile V, widerlegt durch Korrektur Zeile
K“). `verwerfen` hat kein `--abschnitt` und wirkt zeilenweit (`core/qr-verbrauch.js:317`); deshalb: eine Zeile, die
eine vollständige Korrektur mit Spanne trägt, ist NICHT verwerfbar (die Korrektur belegt Aufkleber) — Ablehnung nennt
`uebrige-freigeben`. Test: verwerfen → korrigieren → erneutes verwerfen lehnt ab, T bleibt gesperrt. Das Referenzmodell der Wege-Datei (C16) wird auf
diese Regel umgestellt — aus diesem Papier hergeleitet, nicht aus dem Leser. Pflichttest `q4` beide Folgen literal;
Gegenprobe: `verworfen` aus der Widerlegung genommen → ROT.

## 4. Tests, die fallen können (QJ6-5, QJ6-6, QJ6-7, QJ6-N3)

- Weg-Test (`test_feature_qr_journal_wege.js:337-368`): führt ALLE Schritte eines „zuerst …, danach …“ aus; „gesperrt“
  kommt aus dem LESER; jeder Zustand braucht mindestens einen ausgeführten Befehl — Ausnahmen als literale Liste mit
  Grund; Mindestzahl ausgeführter Befehle über alle Zustände literal. Gegenprobe W01 → ROT.
- Referenzmodell (`:109`, `:130`): benutzt keine Funktion aus `core/qr-verbrauch.js` (auch nicht
  `metaZeileVollstaendig`); eigene, aus den Papieren hergeleitete Prüfung. Gegenprobe C15 → Wege-Datei ROT.
- `test_feature_qr_journal.js:1969`: den erwarteten Abbruchgrund literal zusichern (kein Oder-Zweig). T12 → ROT.
- T10: Audit `wieder_gesperrt` nennt nur Studios, die VOR der Korrektur frei waren; Test mit einem schon gesperrten
  Studio (literal `[75002]`). Gegenprobe T10 → ROT.
- T13: Frischprüfung der Freigabe (`tools/qr-journal.js:1398-1402`) — sie läuft VOR `vorJournalHook` (`:1413`); ein
  Test braucht eine nebenläufig geschriebene Zeile zwischen `pruefeFreigabe` und der Frischprüfung (Muster wie F4 beim
  Korrigieren; fehlt ein Haken an dieser Stelle, einen nur für Tests anlegen). Wurf „hat sich seit der Prüfung
  verändert“ literal. T13 → ROT.
- T18 mit `--ausserhalb-bloecke` messen; C19 über einen Test mit Handzeile abdecken oder im Bericht begründen, warum der
  Zweig unerreichbar ist (dann Kommentar im Code).

## 5. Nicht in diesem Auftrag

QJ6-8 (gering: bleibt unerledigt, E gesperrt, benannte Freigabe nach Neuanlage gangbar) → Sammelliste
`plaene/offene-befunde-qrj.md`. QJ6-9 Anmerkungen ohne Handlung.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab (Korrektur-Bruchstücke sperren, verworfene Abschnitte
widerlegbar)? Kann danach (a) eine Nummer doppelt vergeben werden, (b) eine Sperre ohne gangbaren Werkzeugweg entstehen,
(c) ein Bestands-Journal (Zeilen, die Runde 1–6 schon geschrieben hätte) anders gelesen werden als vorher — und wenn ja,
nur strenger?

-- Ende des Auftrags --
