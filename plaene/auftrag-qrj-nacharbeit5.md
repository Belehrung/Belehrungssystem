# Auftrag QR-J Nacharbeit 5 (25.09.2026, Fassung 1)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 5“ (QJ5-1..QJ5-11). Baum `/workspace/gymdocu-qrj`, Zweig
`fix-qrj-journal-reparatur`, Kopf `24b9be8`. Reproduktionen und Werkzeuge der Prüfspur: `scratchpad/qrjcc5/` (`e6.js`
Szenarien r1_retro, r1_kontroll, r3, r4, r5, r6, r9, r10, r11, r12_meta_rest, r12_freitext, r13; `rf.js` Referenzmodell
aus dem Papier gegen den Leser; `tf.js` Werkzeug-Zufallssuche gegen dasselbe Modell; `mutationen5.js` mit M02, M06, M08,
M14, M17, T04, T08, T10, T15, X01) — vor dem Bau gegen deinen Stand (muss das gemeldete Verhalten zeigen), danach erneut;
beides wörtlich. Einzeltests nur gegen eine eigene DB (`gymdocu_qrjn5_test`). Einordnung: sehr komplex (unverändert —
Leser und Werkzeug sind zwei Quellen, die einander widersprechen können, und fünf Runden haben je ein falsches Grün
gezeigt).

Leitregel unverändert: Überspringen kostet nur Nummern, Unterschlagen ist unwiderruflich; jede Sperre braucht einen
EHRLICHEN Werkzeugweg (keiner, der eine Spanne oder einen Eigentümer erfindet), und der Sperrtext nennt ihn.

## 0. Die Regel „genannter Weg ist gangbar“ wird eine Zusicherung (QJ5-1, QJ5-4)

Fünf Runden lang hat eine Behebung einen Weg genannt, den das Werkzeug ablehnt. Deshalb neu als dauerhafter Test (in
`test_feature_qr_journal.js` oder einer eigenen registrierten Datei, Laufzeit ≤ 60 s, feste Startwerte): für eine Menge
von Journal-Zuständen (die Fixturen dieses Auftrags plus eine deterministische Zufallsmenge nach dem Muster von
`tf.js`) wird für jedes gesperrte Studio und jeden offenen Abschnitt jeder Befehl, den `wegFuer` nennt, als TROCKENLAUF
ausgeführt; er muss angenommen werden. Ein Weg, der nur mit einem Platzhalter (`<Beleg>`, `<subdomain>`, `<id>`)
gangbar ist, wird mit einem passenden Wert ausgeführt; welcher Platzhalter welchen Wert bekommt, steht im Test. Dazu
die Umkehrung: kein Zustand „gesperrt, aber kein Weg genannt“. Positivkontrolle: `wegFuer` auf den Stand `24b9be8`
zurückgedreht → ROT mit Zahl (Erwartung: `r12_meta_rest`, G6).
Das Referenzmodell `rf.js` und die Invariante I1 (keine Doppelvergabe) aus `tf.js` gehen ebenso als deterministischer
Test in die Suite, auf die Regeln dieses Auftrags nachgezogen. Das Modell wird aus dem PAPIER geschrieben (§1–§4 dieses
und des vorigen Auftrags), nicht aus dem Leser; im Test steht, woher jede Regel stammt.

## 1. Abschnitt ohne Chargenschlüssel (QJ5-1 blockierend)

- `uebrige-freigeben --abschnitt=i` für einen Abschnitt OHNE Chargenschlüssel wird auch ohne jede Korrektur der Zeile
  angenommen (wie der Leser, `core/qr-verbrauch.js:425`); Audit-Studio dann über `--studio` (Pflicht). Ohne
  `--abschnitt` gilt dasselbe, wenn ALLE Abschnitte der Zeile ohne Chargenschlüssel sind.
- `wegFuer` nennt je Fall nur den gangbaren Weg: bei einer Zeile, die Verwerfen annimmt (reines Metazeilen-Bruchstück,
  reine Freitextzeile), das Verwerfen; sonst die Freigabe dieses Abschnitts.
- Pflichttests: `r12_meta_rest` (Bruchstück + Chargen-Rest „Präfix 7“, Rest per `--keine-aufkleber` geklärt → Abschnitt
  0 per Freigabe gedeckt, `erledigt_durch` literal, 6/7/61 vergeben literal); G6 (Korrektur in Abschnitt 1, Abschnitt 0
  per genanntem Weg); `r12_freitext` (Verwerfen genannt und gangbar).

## 2. Keine rückwirkende Deckung (QJ5-2)

Eine Freigabe ohne Eigentümer trägt einen Abschnitt MIT Chargenschlüssel nur, wenn eine Korrektur desselben Abschnitts
VOR ihr steht (`k.zeile < e.zeile`). Werkzeug-Simulation und Leser gleich (die Simulation des Werkzeugs zeigt heute
schon „nicht freigegeben, offen [1]“ — der Leser muss dazu passen). Pflichttests `r1_retro` (64 bleibt gesperrt, 61 bleibt
gesperrt, bis eine Freigabe NACH der Korrektur geschrieben ist; Audit-Kette nennt die Freigabe von 61 dann) und
`r1_kontroll`. Zusicherung, dass eine spätere Korrektur OHNE `--uebrige-nicht-betroffen` kein anderes Studio frei gibt
(`uebrige_studios: []` UND frischer Leser sperrt die übrigen).

## 3. A je Abschnitt nur aus Kandidaten (QJ5-3)

`ausgenommeneMenge(detail, idx)` enthält nur IDs, die Kandidaten von `idx` sind (`kandidatPasst`); alle Verbraucher
(`abschnittGedecktFuer`, `abschnittVollGedeckt`, `wegFuer`, die Prüfungen der benannten Freigabe) nutzen diese Menge.
Pflichttest `r3`: `erledigt_durch` literal gesetzt, `zeigen` ohne „offen für: kein existierendes Studio“ ohne Weg.

## 4. Widerruf und falsche Eigentümer-Erklärung (QJ5-5)

- Wortlaut von Log, Warnung und Audit-Feld nach der Wirkung: die benannte Freigabe mit `--eigentuemer-widerrufen` gibt
  das benannte Studio frei; die Erklärung aus Zeile N bleibt als Deckung der übrigen Kandidaten stehen. Feldname
  entsprechend (der Zweig ist nicht ausgeliefert, es gibt keine Altzeilen).
- `korrigieren` für ein Studio, dessen Abschnitt schon gedeckt ist, wird angenommen (eine Korrektur hebt nur an und
  gibt niemanden frei); `--uebrige-nicht-betroffen` ist dabei ausgeschlossen. Das ist der ehrliche Weg, wenn sich eine
  Eigentümer-Erklärung als falsch herausstellt. Die Zeilenangabe in der heutigen Meldung („bereits erledigt durch Zeile
  6“, gedeckt aber durch Zeile 5) wird richtig.
- Pflichttests: `r4`-Folge mit falschem Eigentümer, danach Korrektur des wahren Trägers → dessen Spanne zählt, literale
  Vergabe dahinter.

## 5. Widersprüchliche Erklärungen (QJ5-6)

Ein zweites `--keine-aufkleber` im selben Abschnitt und ein `--eigentuemer` nach `--keine-aufkleber` (und umgekehrt,
schon vorhanden) werden mit (k) abgelehnt. Tests je Fall, dazu der bisher ungetestete Zweig „keine-aufkleber trotz
Korrektur“ (T04).

## 6. Überlebende Mutationen und kleine Punkte (QJ5-7..QJ5-10)

- Je ein Test, der unter M02, T10, M17, T08, M06, M08, M14, T04 ROT wird (Stellen: `scratchpad/qrjcc5/mutationen5.js`);
  T10 mit literaler Grenze (601019 darf nicht doppelt vergeben werden); M06/M08/M14 über Handzeilen. T15: entfernen,
  wenn wirkungslos, sonst den Fall benennen, in dem er wirkt, und testen.
- `tragendeDeckungen`: `keine_aufkleber` nur mit Chargenschlüssel (QJ5-8), Handzeilentest.
- `test_feature_qr_journal.js:2098`: Mindestmenge bzw. literale Erwartung statt `every` über eine womöglich leere Liste
  (QJ5-9); Nachweis, dass die Liste im Fall nicht leer ist, oder Umbau der Fixtur.
- Weg-Teil des Sperrtexts auf höchstens drei Zeilen begrenzen, Rest „… und N weitere: node tools/qr-journal.js
  zeigen“ (QJ5-10), literal getestet.

Nicht in diesem Auftrag: QJ5-11 (Sammelliste `plaene/offene-befunde-qrj.md`, QJ-S1).

## Nach dem Bau

Reproduktionen `e6.js` und `e4.js` erneut (wörtlich), `rf.js`/`tf.js` gegen den neuen Stand (0 Abweichungen,
Positivkontrollen weiterhin Treffer), Mutationsliste `mutationen5.js` erneut mit Zahlen je Mutation, volle Suite mit
`SUITE_EXIT`, Dateizahl-Ritual, Lint.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab (Freigabe ohne Korrektur an einem schlüssellosen Abschnitt;
Korrektur eines schon gedeckten Studios; A nur aus Kandidaten) — und gibt es danach noch (a) eine Doppelvergabe über das
Werkzeug oder über eine Reihenfolge von Metazeilen, (b) eine Sperre, deren genannter Weg abbricht, (c) eine erfundene oder
irreführende Angabe in der Audit-Kette, (d) eine fachlich geklärte Zeile, die unerledigt bleibt?

-- Ende des Auftrags --
