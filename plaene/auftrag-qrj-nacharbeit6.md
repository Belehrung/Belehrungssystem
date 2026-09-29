# Auftrag QR-J Nacharbeit 6 (30.09.2026, Fassung 2)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 6“ (QJ6-1..QJ6-9, QJ6-N1..N3); Fassung 2 nach Planprüfung (`plaene/planpruefung-qrj-n6.md`). Baum `/workspace/gymdocu-qrj`,
Zweig `fix-qrj-journal-reparatur`, Kopf `33d35c3`. Reproduktionen der Prüfspur: `scratchpad/qrjr6cc/` (`q1.js a|b|c|e|k`,
`q1e.js`, `q1f.js`, `q23.js`, `q4.js`, `q8.js`, `sv.js`, `sv18.js`, `mut.js` mit `liste.json`/`liste2.json`; DB-Anlage
`neudb.sh`/`frisch.sh`) — vor dem Bau gegen deinen Stand (muss das gemeldete Verhalten zeigen), danach erneut; beides
wörtlich. Einzeltests nur gegen eigene DBs (`gymdocu_qrjn6_*_test`). Einordnung: sehr komplex (unverändert — Leser und
Werkzeug sind zwei Quellen, die einander widersprechen können; Runde 6 zeigte wieder eine Doppelvergabe).

Leitregel unverändert: Überspringen kostet nur Nummern, Unterschlagen ist unwiderruflich; jede Sperre braucht einen
EHRLICHEN Werkzeugweg, und der Sperrtext nennt ihn.

## 1. Korrektur-Bruchstück ist ein Abschnitt MIT Schlüssel (QJ6-1, QJ6-N1 — blockierend)

Gemessen: eine abgerissene KORREKTUR-Metazeile (Präfix `{"typ":"korrektur"`, ggf. mit angeklebtem Rest) gilt heute als
schlüsselloser Abschnitt; `uebrige-freigeben` ohne Korrektur (bzw. `verwerfen`, wo erlaubt) hebt die Sperre auf, S
vergibt in die belegte Spanne (`q1.js b`: 920010–920014 in 920010–920109; `c`, `e` ebenso).

- Ein Abschnitt, der mit `{"typ":"korrektur"` beginnt (Zeilenanfang ODER Rest-Abschnitt, MU31-Form
  `test_feature_qr_journal.js:1296-1298`), ist ein **Korrektur-Bruchstück** und wird behandelt wie ein Chargen-Bruchstück
  mit Schlüssel — NIE als schlüssellos. Die Felder liest der Leser nach DERSELBEN Regel wie bei Chargenzeilen
  (`core/qr-verbrauch.js:188-197`): am Anfang verankert, in der Feldreihenfolge, die der Schreiber der Korrekturzeile
  erzeugt (vor dem Bau aus dem Schreiber messen und als Muster festhalten); ein Feld gilt nur mit abschliessendem Komma
  als genau gelesen; eine unabgeschlossene Zahl am Ende ist ein PRÄFIX (Kandidaten: alle IDs mit diesem Präfix); ein
  Feldname innerhalb einer Zeichenkette zählt nicht. Nichts lesbar → Kandidat „alle“.
- Damit gilt die bestehende Maschinerie ohne Sonderregel: `uebrige-freigeben` ohne Korrektur lehnt ab; `verwerfen`
  lehnt ab; gangbar sind `korrigieren` DES BRUCHSTÜCKS durch das Studio mit Aufklebern (Spanne aus den Aufklebern) und
  die bestehenden Sonderwege (Eigentümer, `--keine-aufkleber`, benannte Freigabe). Keine automatische Erledigung.
  Sperr- und Ablehnungstext nennen diesen Weg und zusätzlich: „sollte die abgebrochene Korrektur eine Freigabe oder
  `--keine-aufkleber` der Zeile Z widerlegen, die Korrektur für Zeile Z ebenfalls wiederholen“ (Z nur, wenn lesbar).
- Bruchstücke von Freigabe- und Verwerfen-Metazeilen (`{"typ":"freigabe"`, `{"typ":"verworfen"`) tragen keine Spanne
  und bleiben wie heute verwerfbar.
- Meldung beim Schreibfehler der Korrektur (`tools/qr-journal.js:914-919`, `QR_JOURNAL_SCHREIBFEHLER`): statt „das
  Bruchstück verwerfen“ den neuen Weg nennen (Bruchstück korrigieren, dann die Korrektur der ursprünglichen Zeile
  wiederholen). `zeigen` nennt ein unerledigtes Korrektur-Bruchstück mit seinen Kandidaten wie jede kaputte Zeile.
- Bestehende Zusicherungen, die das alte Verhalten festschreiben, FACHLICH umstellen (nie streichen), je mit neuem
  literalem Sollwert: F6 `test_feature_qr_journal.js:2647-2676` (Meldung, verwerfen), J1 `:2276-2315`, A6 `:296-298`
  (Kandidat bei lesbarem `"studio_id":7,`), `:1283-1291`, MU31 `:1296-1298`; `test_feature_qr_journal_wege.js:167`,
  `:446-452` (B3), `:457-468` (r12_meta_rest). Weitere Fundstellen per `grep '"typ":"korrektur"'` in beiden
  Testdateien — Liste im Bericht.
- Pflichttests über den ECHTEN Schreibfehler-Weg, wo es geht: `q1` a/b/c/e — nach dem Bruchstück ist S gesperrt,
  `verwerfen`/`uebrige-freigeben` lehnen ab, nach `korrigieren` des Bruchstücks vergibt S HINTER der belegten Spanne
  (literal, z. B. 920110); `k` als Kontrolle; ein Präfix-Fall (`"studio_id":64` ohne Komma sperrt 64 UND 641); ein
  Fall „nichts lesbar“ (Kandidat alle, Weg gangbar bis zum Ziel). Gegenproben: Erkennung des Korrektur-Bruchstücks
  entfernt → Doppelvergabe → ROT; Präfixregel durch „genau“ ersetzt → 641 frei → ROT.

## 2. Weg-Texte, die bis zum Ende tragen (QJ6-2, QJ6-3 — blockierend nach Leitregel)

`wegFuer(detail, …)` kennt weder Blöcke noch `bekannteStudios` (`core/qr-verbrauch.js:587`; Blöcke nur über
`tools/qr-journal.js:279-281`, bekannte Studios über `:883`). Deshalb:
- `KORREKTUR_BEFEHL` (`:586`) nennt einen ZWEITEN vollständigen Befehl: „liegt die Spanne in keinem Block:
  `node tools/qr-journal.js korrigieren … --ausserhalb-bloecke --ohne-systembeleg`“.
- Der Eigentümer-Weg (`:630`) nennt einen zweiten vollständigen Befehl mit `--eigentuemer-unbekannt` für „E ohne
  Journalspur“.
- Weg-Fixturen: je ein Zustand „Spanne ausserhalb jedes Blocks“ und „E ohne Journalspur“, mit einer Kennzeichnung der
  Zustandsart; der Weg-Test (Befehls-Extraktion `test_feature_qr_journal_wege.js:285-299`) wählt nach der Kennzeichnung
  den passenden der beiden Befehle, sichert zu, dass er im Text steht, führt ihn aus und kommt ans Ziel. Gegenprobe:
  zweiter Befehl aus dem Text entfernt → ROT.
- `KORREKTUR_LITERAL` (`test_feature_qr_journal.js:118`) und die darauf gebauten Literale (u. a. G2 `:1069/1079`, I4
  `:1959/1963`, H1 `:1434`, H7 `:1675`, J1 `:2294`, J2 `:2342/2357`, J4 `:2443/2459/2478`, J6 `:2636/2640`) ziehen mit.

## 3. Verworfen ist widerlegbar (QJ6-4, QJ6-N2)

Eine spätere vollständige Korrektur mit Spanne für einen verworfenen Abschnitt WIDERLEGT das Verwerfen wie eine Freigabe
ohne Korrektur (`widerlegendeKorrekturen` gilt auch für `verworfen`): die übrigen Kandidaten sind wieder gesperrt, bis
eine tragende Deckung sie erneut deckt. Log und `zeigen` sagen das. Das Referenzmodell der Wege-Datei (C16) wird auf
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
