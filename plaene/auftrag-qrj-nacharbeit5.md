# Auftrag QR-J Nacharbeit 5 (25.09.2026, Fassung 2.1)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 5“ (QJ5-1..QJ5-11); Fassung 2 nach der Planprüfung
`plaene/planpruefung-qrj-n5.md` (PQ5-1..13); Fassung 2.1 nach deren zweiter Runde (PQ5b-1..9). Baum `/workspace/gymdocu-qrj`, Zweig
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
`tf.js`) wird für jedes gesperrte Studio und jeden offenen Abschnitt jeder Befehl, den `wegFuer` nennt, über die
`befehl…`-Funktionen OHNE `--ja` ausgeführt (dieselbe Schalter- und Pflichtargumentprüfung wie die Kommandozeile,
nicht `pruefe…` direkt — PQ5-3); er muss angenommen werden. Zusätzlich je WEGART (Korrektur, Freigabe ohne Korrektur,
Eigentümer, keine Aufkleber, benannte Freigabe, Verwerfen, Korrektur eines gedeckten Studios aus §4) mindestens ein
ECHTER Schreiblauf mit `--ja` in der Test-DB, der die Metazeile schreibt (PQ5-9: der Schreibweg prüft frisch unter den
Locks mehr als der Trockenlauf). Echte Schreibläufe ausserdem für die beiden gefährlichen Zustände aus §4: „Zeile global
erledigt, keine eigene Korrektur von S in i“ und der Widerlegungsfall (danach Leserprüfung: die übrigen Kandidaten sind
wieder gesperrt) (PQ5b-9).
- `wegFuer` nennt JEDES Pflichtargument selbst (`--grund`, `--studio`, `--abschnitt`, Schalter); offen bleiben nur
  Platzhalter und bei `korrigieren` die belegte Spanne (PQ5-2, PQ5-10). Ersetzungsregel im Test, als Tabelle: `<Beleg>`
  → fester Text; `<subdomain>` → Subdomain des gesperrten Studios bzw. eines Kandidaten des Abschnitts; `<id>` → die im
  Journal bekannte, heute fehlende Studio-ID der Fixtur; `korrigieren … ...` → `--von/--bis/--quelle` aus der
  belegten Spanne der Fixtur (je Fixtur eingetragen, nie aus dem Leser berechnet) (PQ5-4).
- Mindestmenge der Zustände (PQ5-4, DSB Frage 2): je `wegFuer`-Ast einer — „genau S“ mit belegter Spanne; alle/Präfix
  mit Korrektur im Abschnitt und weiterem Kandidaten; alle/Präfix ohne Korrektur OHNE Chargenschlüssel; alle/Präfix ohne
  Korrektur MIT Chargenschlüssel in drei Ausprägungen (existierender Kandidat, im Journal bekanntes fehlendes Studio,
  keine Aufkleber); ein Studio in A(idx) mit tragender Deckung (eigene Korrektur und benannte Freigabe) und ohne
  tragende Deckung; reines Metazeilen-Bruchstück; reine Freitextzeile; global erledigte Zeile (§4); `keine_aufkleber`
  mit späterer Korrektur desselben Abschnitts (§4); dazu `r12_meta_rest`, G6, `r1_retro`, `r1_kontroll`, `r3`, `r4`,
  `r6`, `r9`.
- Die Umkehrung: kein Zustand „gesperrt, aber kein Weg genannt“. Positivkontrolle: `wegFuer` auf den Stand `24b9be8`
zurückgedreht → ROT mit Zahl (Erwartung: `r12_meta_rest`, G6).
Das Referenzmodell `rf.js` und die Invariante I1 (keine Doppelvergabe) aus `tf.js` gehen ebenso als deterministischer
Test in die Suite, auf die Regeln dieses Auftrags nachgezogen. Das Modell wird aus dem PAPIER geschrieben (§1–§4 dieses
und des vorigen Auftrags), nicht aus dem Leser; im Test steht, woher jede Regel stammt.

## 1. Abschnitt ohne Chargenschlüssel (QJ5-1 blockierend)

- `uebrige-freigeben --abschnitt=i` für einen Abschnitt OHNE Chargenschlüssel wird auch ohne jede Korrektur der Zeile
  angenommen (wie der Leser, `core/qr-verbrauch.js:425`). Audit-Studio dann über `--studio` (Pflicht, sonst Abbruch
  wie heute `tools/qr-journal.js:1224`); die frühe Prüfung `:1207-1208` (`!korrekturen.length`, PQ5b-4) und die (b)-Prüfung `:1215-1217` („`--studio` muss
  ein Korrektur-Studio sein“)
  entfällt für eine Freigabe, deren gedeckte Abschnitte ALLE ohne Chargenschlüssel sind — dort muss `--studio` ein
  existierender Kandidat des Abschnitts sein (PQ5-1). Ohne `--abschnitt` gilt dasselbe, wenn ALLE Abschnitte der Zeile
  ohne Chargenschlüssel sind.
- `wegFuer` nennt je Fall nur den gangbaren Weg, mit allen Pflichtargumenten: bei einer Zeile, die Verwerfen annimmt
  (reines Metazeilen-Bruchstück, reine Freitextzeile), `verwerfen --zeile=N --grund="<Beleg>" --studio=<subdomain>`
  (PQ5-2); sonst `uebrige-freigeben --zeile=N --abschnitt=i --grund="<Beleg>" --studio=<subdomain>`.
- Geltungsbereich (PQ5-6, PQ5b-7): ein Abschnitt ohne Chargenschlüssel hat immer den Kandidaten „alle“ — „genau“ und
  „Präfix“ setzen `charge_id` und `studio_id` voraus (`core/qr-verbrauch.js:307-313`, `:326-331`); ein Test hält das
  fest.
- Pflichttests: `r12_meta_rest` (Bruchstück + Chargen-Rest „Präfix 7“, Rest per `--keine-aufkleber` geklärt → Abschnitt
  0 per Freigabe gedeckt, `erledigt_durch` literal, 6/7/61 vergeben literal); G6 (Korrektur in Abschnitt 1, Abschnitt 0
  per genanntem Weg); `r12_freitext` (Verwerfen genannt und gangbar).

## 2. Keine rückwirkende Deckung (QJ5-2)

Eine Freigabe ohne Eigentümer trägt einen Abschnitt MIT Chargenschlüssel nur, wenn eine Korrektur desselben Abschnitts
VOR ihr steht (`k.zeile < e.zeile`) — eingebaut NUR in diesem Ast von `tragendeDeckungen` (`core/qr-verbrauch.js:425`);
Eigentümer- und `keine_aufkleber`-Freigaben brauchen keine Korrektur und bleiben unberührt. Die zweite Formel im
Werkzeug (`gedeckteAbschnitte`, `tools/qr-journal.js:1229-1230`) wird aus derselben Regel abgeleitet, nicht daneben
gepflegt (PQ5-13). Werkzeug-Simulation und Leser gleich (die Simulation zeigt heute schon „nicht freigegeben, offen
[1]“ — der Leser muss dazu passen). Pflichttests `r1_retro` (64 bleibt gesperrt, 61 bleibt
gesperrt, bis eine Freigabe NACH der Korrektur geschrieben ist; Audit-Kette nennt die Freigabe von 61 dann) und
`r1_kontroll`. Zusicherung, dass eine spätere Korrektur OHNE `--uebrige-nicht-betroffen` kein anderes Studio frei gibt
(`uebrige_studios: []` UND frischer Leser sperrt die übrigen).

## 3. A je Abschnitt nur aus Kandidaten (QJ5-3)

`ausgenommeneMenge(detail, idx)` enthält nur IDs, die Kandidaten von `idx` sind (`kandidatPasst`); alle Verbraucher
(`abschnittGedecktFuer`, `abschnittVollGedeckt`, `wegFuer`, die Prüfungen der benannten Freigabe) nutzen diese Menge.
Pflichttest `r3`: `erledigt_durch` literal gesetzt, `zeigen` ohne „offen für: kein existierendes Studio“ ohne Weg.

## 4. Widerruf und falsche Eigentümer-Erklärung (QJ5-5)

- Wortlaut von Log, Warnung und Audit nach der Wirkung (PQ5-8, festgelegt): Schalter `--eigentuemer-widerrufen` heisst
  `--eigentuemer-freigeben`; Audit-Felder `widerrufen` → `eigentuemer_freigegeben`, `widerrufene_zeilen` →
  `eigentuemer_zeilen`; Log: „Studio S (Eigentümer laut Zeile N) wird freigegeben; die Erklärung aus Zeile N deckt die
  übrigen Kandidaten weiter.“ Umbenannt werden Schalter, Journal-Feld (`core/qr-verbrauch.js:257`, `:297`) und
  Audit-Felder (`tools/qr-journal.js:1202-1204`, `:1323`). Der Zweig ist nicht ausgeliefert, es gibt keine Altzeilen;
  Leser, Werkzeug, Sperrtext, Tests und Kopfkommentare ziehen mit — `grep -n "widerruf" core/qr-verbrauch.js
  core/qr-token.js tools/qr-journal.js test_feature_qr_journal.js` ergibt 0 Treffer ausser erklärenden Kommentaren, die
  den alten Namen ausdrücklich als alt benennen (PQ5b-8).
- `korrigieren --abschnitt=i` für ein Studio S, dessen Abschnitt i schon gedeckt ist, wird angenommen — auch wenn die
  Zeile global erledigt ist (`tools/qr-journal.js:647` gilt dann nicht) (PQ5-11). Grund: eine Korrektur hebt nur an und
  gibt niemanden frei; sie ist der ehrliche Weg, wenn sich eine Eigentümer- oder `keine_aufkleber`-Erklärung als falsch
  herausstellt. Geöffnet wird dafür die Auswahl `abschnittWaehlen` (`tools/qr-journal.js:669-683`: heute Abbruch, weil
  `offeneAbschnitteFuer` für ein gedecktes Studio leer ist) (PQ5b-2) und `:647`. Regeln: `--abschnitt` ist dann Pflicht; `--uebrige-nicht-betroffen` wird mit eigenem (k)-Abbruch
  abgelehnt; eine zweite Korrektur DESSELBEN Studios im selben Abschnitt bleibt abgelehnt; alle Untergrenzen
  ((d), (d'), `qr_charge`, `nr_bis`) gelten unverändert. Die Frischprüfung unter den Locks (`:971-974`) prüft in diesem
  Fall „Zeile unverändert UND keine eigene Korrektur von S in i“ statt „nicht gedeckt“ (PQ5-9).
- **Widerlegung (PQ5b-1, blockierend):** eine tragende Deckung e in Abschnitt i — Korrektur mit
  `uebrige_nicht_betroffen`, Freigabe ohne Eigentümer, Eigentümer-Freigabe, `keine_aufkleber`-Freigabe — trägt NICHT
  MEHR, sobald NACH ihr (`k.zeile > e.zeile`) eine Korrektur k in i steht, deren Studio von e gedeckt wurde (also nicht
  in e's `ausgenommen`, nicht e's `eigentuemer`, und ohne eigene Korrektur in i VOR e). Grund: die Korrektur belegt
  Aufkleber bei einem Studio, für das e „trägt nichts“ erklärt hat; die Erklärung ist damit widerlegt, auch für die
  übrigen. Folge: die übrigen, bisher über e gedeckten Kandidaten sind wieder gesperrt, bis eine NEUE Deckung nach k
  steht (Freigabe durch das Korrektur-Studio) oder sie selbst korrigieren; der Sperrtext nennt diesen Weg (§0). Leser
  (`tragendeDeckungen`) und Werkzeug-Simulation gleich. Eine Korrektur des Eigentümers selbst widerlegt seine
  Eigentümer-Erklärung nicht.
- Der Payload einer solchen Korrektur nennt die widerlegten Zeilen (`widerspricht_zeilen`), der Log sagt, welche
  Kandidaten dadurch wieder gesperrt sind (aus der Simulation, wie `nicht_freigegeben`) (PQ5-12). `metaZeileVollstaendig`
  prüft den Typ des neuen Felds (Liste ganzer Zahlen) wie die übrigen (PQ5b-8).
- `erledigt_durch` ist die jüngste Metazeile der erledigten Zeile (`vollErledigtDurch`) und wandert mit jeder weiteren;
  die Texte sagen deshalb „erledigt, zuletzt durch Zeile N“ (`tools/qr-journal.js:647`, `:1126`, `zeigen`) (PQ5b-5).
  Dass eine spätere Spanne als Nachbar die Obergrenze einer früheren, unerledigten Zeile senken kann, kostet nur Nummern
  — im Kopfkommentar benennen.
- Die verbleibende Ablehnung (zweite Korrektur DESSELBEN Studios im selben Abschnitt) nennt die Zeile der EIGENEN
  Korrektur von S in i (PQ5b-3); die heutige falsche Angabe („bereits erledigt durch Zeile 6“, gedeckt aber durch
  Zeile 5) verschwindet damit.
- Pflichttests: `r4`-Folge mit falschem Eigentümer, danach Korrektur des wahren Trägers → dessen Spanne zählt, die
  übrigen Kandidaten sind wieder gesperrt, literale Vergabe des Trägers dahinter. Widerlegung (PQ5b-1): Präfix-6-Zeile
  mit Chargenschlüssel, `--keine-aufkleber`, danach Korrektur von 64 → 65 gesperrt (`betrifftStudio(d, 65) === true`,
  Vergabe wirft); danach `uebrige-freigeben` durch 64 → 65 vergibt, literal. Dasselbe für eine Freigabe ohne Eigentümer
  und für eine Korrektur mit `--uebrige-nicht-betroffen`. Gegenprobe: Widerlegungsregel entfernt → ROT.

## 5. Widersprüchliche Erklärungen (QJ5-6)

Ein zweites `--keine-aufkleber` im selben Abschnitt und ein `--eigentuemer` nach `--keine-aufkleber` (und umgekehrt,
schon vorhanden) werden mit (k) abgelehnt. Tests je Fall, dazu der bisher ungetestete Zweig „keine-aufkleber trotz
Korrektur“ (T04).

## 6. Überlebende Mutationen und kleine Punkte (QJ5-7..QJ5-10)

- Je ein Test, der unter M02, T10, M17, T08, M06, M08, M14, T04 ROT wird (Stellen: `scratchpad/qrjcc5/mutationen5.js`);
  T10 mit literaler Grenze (601019 darf nicht doppelt vergeben werden); M06/M08/M14 über Handzeilen. T15: entfernen,
  wenn wirkungslos, sonst den Fall benennen, in dem er wirkt, und testen.
- `tragendeDeckungen`: `keine_aufkleber` nur mit Chargenschlüssel (QJ5-8), Handzeilentest.
- `test_feature_qr_journal.js:2098` und `:1223` (G5): Mindestmenge bzw. literale Erwartung statt `every` über eine
  womöglich leere Liste (QJ5-9, PQ5b-6); Nachweis, dass die Liste im Fall nicht leer ist, oder Umbau der Fixtur.
- Weg-Teil des Sperrtexts auf höchstens drei KAPUTTE JOURNALZEILEN begrenzen (je Zeile alle offenen Abschnitte), Rest
  „… und N weitere Zeilen: node tools/qr-journal.js zeigen“ (QJ5-10, PQ5-7); literal getestet; die bestehenden
  wörtlichen Weg-Tests (u. a. `test_feature_qr_journal.js:1050`) werden nachgezogen, nicht gestrichen.

Nicht in diesem Auftrag: QJ5-11 (Sammelliste `plaene/offene-befunde-qrj.md`, QJ-S1).

## Nach dem Bau

Reproduktionen `e6.js` und `e4.js` erneut (wörtlich), `rf.js`/`tf.js` gegen den neuen Stand (0 Abweichungen,
Positivkontrollen weiterhin Treffer), Mutationsliste `mutationen5.js` erneut mit Zahlen je Mutation, volle Suite mit
`SUITE_EXIT`, Dateizahl-Ritual, Lint.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab (Freigabe ohne Korrektur an einem schlüssellosen Abschnitt;
Korrektur eines schon gedeckten Studios; widerlegte Erklärung; A nur aus Kandidaten) — und gibt es danach noch (a) eine Doppelvergabe über das
Werkzeug oder über eine Reihenfolge von Metazeilen, (b) eine Sperre, deren genannter Weg abbricht, (c) eine erfundene oder
irreführende Angabe in der Audit-Kette, (d) eine fachlich geklärte Zeile, die unerledigt bleibt?

-- Ende des Auftrags --
