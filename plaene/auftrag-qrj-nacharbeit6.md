# Auftrag QR-J Nacharbeit 6 (30.09.2026, Fassung 1)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 6“ (QJ6-1..QJ6-9, QJ6-N1..N3). Baum `/workspace/gymdocu-qrj`,
Zweig `fix-qrj-journal-reparatur`, Kopf `33d35c3`. Reproduktionen der Prüfspur: `scratchpad/qrjr6cc/` (`q1.js a|b|c|e|k`,
`q1e.js`, `q1f.js`, `q23.js`, `q4.js`, `q8.js`, `sv.js`, `sv18.js`, `mut.js` mit `liste.json`/`liste2.json`; DB-Anlage
`neudb.sh`/`frisch.sh`) — vor dem Bau gegen deinen Stand (muss das gemeldete Verhalten zeigen), danach erneut; beides
wörtlich. Einzeltests nur gegen eigene DBs (`gymdocu_qrjn6_*_test`). Einordnung: sehr komplex (unverändert — Leser und
Werkzeug sind zwei Quellen, die einander widersprechen können; Runde 6 zeigte wieder eine Doppelvergabe).

Leitregel unverändert: Überspringen kostet nur Nummern, Unterschlagen ist unwiderruflich; jede Sperre braucht einen
EHRLICHEN Werkzeugweg, und der Sperrtext nennt ihn.

## 1. Bruchstück einer Korrekturzeile sperrt, bis die Korrektur wiederholt ist (QJ6-1, QJ6-N1 — blockierend)

Gemessen: eine abgerissene KORREKTUR-Metazeile (Präfix `{"typ":"korrektur"`, ggf. mit angeklebtem Rest) gilt heute als
schlüsselloser Abschnitt; `verwerfen` oder `uebrige-freigeben` ohne Korrektur heben die Sperre auf, S vergibt in die
belegte Spanne (`q1.js b`: 920010–920014 in 920010–920109; `c`, `e` ebenso).

- Der Leser erkennt einen Abschnitt, dessen lesbarer Anfang eine Korrektur-Metazeile ist (`"typ":"korrektur"` im
  Präfix), als **Korrektur-Bruchstück** — nie als schlüssellos. Kandidat: `studio_id`, wenn lesbar; sonst die
  Kandidaten der ersetzten Zeile, wenn `ersetzt_zeile` lesbar; sonst alle.
- Ein Korrektur-Bruchstück SPERRT seine Kandidaten, bis eine VOLLSTÄNDIGE Korrekturzeile desselben Studios für
  dieselbe `ersetzt_zeile` (soweit lesbar) NACH dem Bruchstück steht — dann ist es automatisch erledigt.
  `verwerfen` und `uebrige-freigeben` (jeder Sonderweg) lehnen es ab; der Ablehnungstext und der Sperrtext nennen den
  Weg: denselben `korrigieren`-Befehl wiederholen (mit den lesbaren Werten; fehlt `nr_bis`, sagt der Text, dass die
  Spanne aus den Aufklebern kommt).
- Die Meldung beim Schreibfehler der Korrektur (`QR_JOURNAL_SCHREIBFEHLER`) bleibt wahr: `zeigen` nennt die ersetzte
  Zeile für S „NICHT erledigt — Korrektur-Bruchstück Zeile F, Korrektur wiederholen“, nicht „ERLEDIGT“.
- Pflichttests (über den ECHTEN Schreibfehler-Weg, nicht über eine Handzeile, wo es geht): `q1` a/b/c/e als Tests —
  nach dem Bruchstück ist S gesperrt, `verwerfen`/`uebrige-freigeben` lehnen ab, nach der Wiederholung ist S frei und
  vergibt HINTER der belegten Spanne (literal, z. B. 920110); `k` als Kontrolle. Gegenproben: Erkennung des
  Korrektur-Bruchstücks entfernt → Doppelvergabe → ROT; automatische Erledigung entfernt → S bleibt nach der
  Wiederholung gesperrt → ROT.

## 2. Weg-Texte, die bis zum Ende tragen (QJ6-2, QJ6-3 — blockierend nach Leitregel)

- `KORREKTUR_BEFEHL` (`core/qr-verbrauch.js:586`) nennt für den Fall „Spanne in keinem Block“ zusätzlich
  `--ausserhalb-bloecke --ohne-systembeleg` (als bedingter Satzteil, wenn der Leser die Blöcke nicht kennt).
- Der Eigentümer-Weg (`:630`) nennt `--eigentuemer-unbekannt` für den Fall „E ohne Journalspur“.
- Weg-Fixturen: je ein Zustand mit Spanne ausserhalb jedes Blocks und mit E ohne Journalspur; der Weg-Test führt den
  genannten Befehl aus und kommt ans Ziel. Gegenprobe: Zusatz im Text entfernt → ROT.

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
- T13: Frischprüfung der Freigabe — Test mit einer nebenläufig geschriebenen Zeile zwischen Prüfung und Schreiben
  (eingeschleuste Funktion, wie beim Korrigieren); Wurf „hat sich seit der Prüfung verändert“ literal. T13 → ROT.
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
