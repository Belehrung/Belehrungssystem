# Auftrag QR-J Nacharbeit 4 (25.09.2026)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 4“ (QJ4-1..QJ4-12). Baum `/workspace/gymdocu-qrj`, Zweig
`fix-qrj-journal-reparatur`, Kopf `e94c4bc`. Reproduktionen der Prüfspur: `scratchpad/qrjcc4/` (`e4.js` Szenarien
a_korr, a_eig, a_eig_ohneblock, b_hand, c_dstrich, c_dstrich_gleich, c_zeigen, d_alle, d_klammer, e_korrpayload,
f_wieder, f_alarm, h, i; `e5_fuzz.js`; `mutationen4.js`) — vor dem Bau gegen deinen Stand (muss das gemeldete Verhalten
zeigen), danach erneut; beides wörtlich. Einordnung: sehr komplex (unverändert).

Leitregel unverändert: Überspringen kostet nur Nummern, Unterschlagen ist unwiderruflich; jede Sperre braucht einen
EHRLICHEN Werkzeugweg (keiner, der eine Spanne oder einen Eigentümer erfindet); eine Obergrenze ist nie ein
Sicherheitsriegel.

## 1. Einmal ausgenommen, bleibt ausgenommen (QJ4-1 blockierend, QJ4-11)

- Leser: Für Abschnitt `idx` ist `A(idx)` die Vereinigung von `ausgenommen` und `eigentuemer` ALLER Erledigungen der
  Zeile, die für `idx` gelten (`abschnitt === idx` oder ganze Zeile). Eine Deckung „für alle“ (uebrige, Freigabe mit und
  ohne Eigentümer, `keine_aufkleber` aus §4) deckt S nur, wenn S NICHT in `A(idx)` steht — gleich, was die Deckung
  selbst in `ausgenommen` trägt. `e.eigentuemer` wird dabei immer wie ein Eintrag in `ausgenommen` behandelt (QJ4-11).
  Ausnahme nur die benannte Freigabe unten.
- Werkzeug: `ausgenommeneFuer` nimmt jedes Studio aus `A(idx)` ohne eigene Korrektur in `idx` auf, auch wenn es heute
  eine DB-Zeile hat; Trockenlauf und `zeigen` nennen es mit Herkunft („ausgenommen seit Zeile X“ / „Eigentümer laut
  Zeile Y“). Sperrtext und `zeigen` nennen für so ein Studio „eigene Korrektur“, nicht `uebrige-freigeben`.
- Benannte Freigabe (Zielkonflikt, wenn ein früher nur im Journal bekanntes Studio nachweislich nichts trägt):
  `uebrige-freigeben --zeile=N --abschnitt=<i> --ausgenommene-freigeben=<id>[,<id>] --grund="<Beleg>"`, zulässig nur für
  IDs aus `A(idx)`, die NICHT Eigentümer sind, und nur, wenn der Abschnitt bereits gedeckt ist (Korrektur eines anderen
  Studios, Eigentümer-Freigabe oder `keine_aufkleber`). Zeile trägt `freigegeben: [ids]`; der Leser deckt genau diese
  IDs. Für einen Eigentümer zusätzlich nur mit dem blanken Schalter `--eigentuemer-widerrufen` (Warnung im Klartext,
  Audit nennt die widerrufene Zeile).
Pflichttests (LITERALE Sollwerte): CC `a_korr` (64 bleibt nach der zweiten Freigabe gesperrt; nach eigener Korrektur
Vergabe literal); Kimi N4-1 Weg 1 über `--uebrige-nicht-betroffen`; `b_hand` (Handzeile `eigentuemer:64, ausgenommen:[]`
deckt 64 NICHT); benannte Freigabe eines Nicht-Eigentümers (vergibt danach literal); Eigentümer nur mit Widerruf.
Gegenprobe je Regel ROT.

## 2. Eigentümer-Erklärung (QJ4-2, QJ4-5 erster Teil)

- `--eigentuemer` wird abgewiesen, wenn der Abschnitt schon eine Eigentümer-Freigabe oder eine Korrektur trägt
  (Widerspruch mit Zeilennummer nennen).
- Die ID muss in `bekannteStudios` stehen; sonst nur mit dem blanken Schalter `--eigentuemer-unbekannt` (Warnung: „im
  Journal nicht bekannt — nur mit Beleg aus den Aufklebern“). Das Etikett „nur im Journal bekannt“ gilt nur für IDs aus
  `bekannteStudios`.
Pflichttests: `a_eig` (zweiter Eigentümer → Abbruch, 64 bleibt gesperrt), `d_alle` mit 999999 ohne Schalter → Abbruch.

## 3. Untergrenze aus einem früheren Abschnitt derselben Zeile (QJ4-3)

`spannen` tragen `abschnitt`. Eine Korrektur derselben Zeile zählt als „davor“, wenn ihr Abschnitt kleiner ist als der
korrigierte, als „danach“, wenn er grösser ist — in `pruefeKorrektur` ((d'), (e)) und in `zeigen`.
Pflichttest: `c_dstrich` und `c_dstrich_gleich` → (d')-Abbruch, S vergibt nach korrekter Korrektur literal ab 360300.

## 4. Ehrliche Wege für die Sperren ohne Weg (QJ4-4, QJ4-5 zweiter Teil)

- `--ausserhalb-bloecke` auch bei UNLESBAREM `nr_von`: dann kommen `--von`/`--bis` aus den Aufklebern; beide müssen
  ausserhalb aller Blöcke des Studios liegen (gilt ab jetzt auch bei lesbarem `nr_von`, QJ4-6), `--ohne-systembeleg`
  bleibt Pflicht. Pflichttest: `a_eig_ohneblock` → Korrektur möglich, Vergabe literal.
- Abschnitt MIT Chargenschlüssel, Kandidat „alle“ oder Präfix, ohne Korrektur und ohne Eigentümer:
  `uebrige-freigeben --zeile=N --abschnitt=<i> --keine-aufkleber --grund="<Beleg>"` (blanker Schalter). Zeile trägt
  `keine_aufkleber: true`; der Leser deckt den Abschnitt für alle ausser `A(idx)`. Warnung im Klartext: „erklärt, dass
  von dieser Charge nachweislich keine Aufkleber im Umlauf sind (bei allen Kandidaten gesucht) — ist das falsch,
  entsteht eine Doppelvergabe“. Nicht für „genau S“ (dort korrigiert S). Sperrtext und `zeigen` nennen den Weg nur für
  solche Abschnitte. Pflichttests: `d_alle`, `d_klammer`.

## 5. Ausserhalb der Blöcke: Text und Daueralarm (QJ4-6, QJ4-7)

- `AUSSERHALB_WARNUNG` wahr formulieren: die Spanne zählt, sobald ein Block sie enthält (Neuzustellung des alten
  Blocks); `--bis` nach den Aufklebern. Pflichttest `f_wieder` (Vergabe nach Neuzustellung literal hinter der Spanne).
- VOR dem Bau messen, woraus `datenbank_zurueckgespielt` bei `f_alarm` jede Vergabe neu feuert (4 von 4), und so ändern,
  dass eine Korrekturspanne ausserhalb aller Blöcke den Vorfall höchstens einmal auslöst. Gegenprobe: unter dem Block
  1 von 4 bleibt, über dem Block wird es 1 von 4.

## 6. Korrektur-Payload wie beim Leser (QJ4-8)

`--uebrige-nicht-betroffen`: `uebrige_studios` nur, wer danach für ALLE seine Abschnitte gedeckt ist (dieselbe Logik
wie `wirdGedeckt` in der Freigabe); wer teilweise gedeckt bleibt, steht in einer „NICHT freigegeben“-Zeile mit dem
offenen Abschnitt. Pflichttest: `e_korrpayload` und ein QJ3-9-Test für den Korrekturweg (Payload gegen frischen Leser).

## 7. `zeigen` je offenem Abschnitt (QJ4-9)

Block, Nachbarn, Unter- und Obergrenze je (Studio, offener Abschnitt) mit dessen `nr_von`; bei mehreren Kandidaten je
bekanntem Studio. Pflichttest `c_zeigen` (Block 470000–470999, Obergrenze 470499 literal).

## 8. Texte (QJ4-10)

Sperrtext unterscheidet Korrektur und Eigentümer-/`keine_aufkleber`-Freigabe; bei einer Zeile, deren einziger Kandidat
„genau S“ ist, nennen Sperrtext und `zeigen` die Korrektur, nicht `uebrige-freigeben`. Literal getestet.

## 9. Überlebende Mutationen (QJ4-12)

Je ein Test, der unter V1, V7, V4, Q6, Q7, V25, V6, T11 (Liste und Stellen: `scratchpad/qrjcc4/mutationen4.js`) ROT
wird; Nachweis je Mutation mit Zahlen.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab — und gibt es danach noch (a) eine Doppelvergabe über das
Werkzeug, (b) eine Sperre ohne ehrlichen Werkzeugweg, (c) einen Weg, der eine erfundene Angabe in die Audit-Kette
schreibt? Dazu: welche neuen Schalter kann ein Betreiber falsch benutzen, und was verhindert, dass der Sperrtext ihn
dorthin führt?

-- Ende des Auftrags --
