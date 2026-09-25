# Auftrag QR-J Nacharbeit 4 (25.09.2026, Fassung 2)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 4“ (QJ4-1..QJ4-12); Fassung 2 nach der Planprüfung
`plaene/planpruefung-qrj-n4.md` (PQ4-1..15). Baum `/workspace/gymdocu-qrj`, Zweig `fix-qrj-journal-reparatur`, Kopf
`e94c4bc`. Reproduktionen der Prüfspur: `scratchpad/qrjcc4/` (`e4.js` Szenarien a_korr, a_eig, a_eig_ohneblock, b_hand,
c_dstrich, c_dstrich_gleich, c_zeigen, d_alle, d_klammer, e_korrpayload, f_wieder, f_alarm, h, i; `e5_fuzz.js`;
`mutationen4.js`) — vor dem Bau gegen deinen Stand (muss das gemeldete Verhalten zeigen), danach erneut; beides
wörtlich. Einordnung: sehr komplex (unverändert).

Leitregel unverändert: Überspringen kostet nur Nummern, Unterschlagen ist unwiderruflich; jede Sperre braucht einen
EHRLICHEN Werkzeugweg (keiner, der eine Spanne oder einen Eigentümer erfindet), und der Sperrtext nennt ihn; eine
Obergrenze ist nie ein Sicherheitsriegel.

## 1. Einmal ausgenommen, bleibt ausgenommen (QJ4-1 blockierend, QJ4-11, PQ4-1/2/4/5/7/8/9)

**Begriffe je Abschnitt `idx` einer Zeile** (gelten sind alle Erledigungen mit `abschnitt === idx` oder ohne Abschnitt):
- `A(idx)`: Vereinigung aller `ausgenommen`-Listen und aller `eigentuemer` dieser Erledigungen.
- `F(idx)`: Vereinigung aller `freigegeben`-Listen (benannte Freigabe, unten).
- Eine TRAGENDE Deckung des Abschnitts ist: eine Korrektur eines Studios in `idx` mit `uebrige_nicht_betroffen`; eine
  Freigabe ohne Eigentümer, wenn in `idx` eine Korrektur steht oder `idx` keinen Chargenschlüssel trägt; eine
  Eigentümer-Freigabe für `idx`, deren Eigentümer Kandidat von `idx` ist (Leser prüft das selbst, PQ4-9); eine
  `keine_aufkleber`-Freigabe (§4); `verworfen` nur ohne Chargenschlüssel.

**Leser (`abschnittGedecktFuer`):** S ist in `idx` gedeckt ⇔ eigene Korrektur von S in `idx` ODER (es gibt eine
tragende Deckung ∧ (S ∉ A(idx) ∨ S ∈ F(idx))). Ein Eigentümer (in A) ist nur über eigene Korrektur oder `F` mit
Widerruf (unten) gedeckt. Eine `freigegeben`-Liste OHNE tragende Deckung deckt nichts (Handzeile, PQ4-1).
**Leser (`abschnittVollGedeckt`, PQ4-2):** `idx` ist voll gedeckt ⇔ „genau K“: K gedeckt; sonst: es gibt eine tragende
Deckung, und jedes Mitglied von A(idx) hat eine eigene Korrektur in `idx` ODER steht in F(idx). Damit bekommen Zeilen,
die über `keine_aufkleber`, Widerruf oder benannte Freigabe fachlich geklärt sind, ein `erledigt_durch`.
**`bekannteStudios`** kommt nur noch aus Chargen- und Korrekturzeilen (echte Spuren); Eigentümer und Ausgenommene aus
Freigaben kommen über `A` (PQ4-8). `zeigen` nennt sie trotzdem, mit Herkunft.

**Werkzeug:** `ausgenommeneFuer` = A(idx) ∪ nur im Journal bekannte Kandidaten, jeweils ohne eigene Korrektur in `idx`
und nicht in F(idx) — auch wenn sie heute eine DB-Zeile haben. Trockenlauf und `zeigen` nennen jedes mit Herkunft
(„ausgenommen seit Zeile X“ / „Eigentümer laut Zeile Y“).

**Benannte Freigabe:** `uebrige-freigeben --zeile=N --abschnitt=<i> --ausgenommene-freigeben=<id>[,<id>]
--grund="<Beleg>"`. Zulässig für IDs aus A(i) ohne eigene Korrektur, und nur, wenn `i` für alle Kandidaten AUSSER A(i)
bereits gedeckt ist (PQ4-5). Für einen Nicht-Eigentümer genügt der Schalter; für einen Eigentümer nur gemeinsam mit dem
blanken Schalter `--eigentuemer-widerrufen` (PQ4-7). Zeile: `freigegeben: [ids]`, bei Widerruf `widerrufen: [ids]`.
Warnung im Klartext (wie §4): „erklärt, dass diese Studios nachweislich keine Aufkleber aus diesem Abschnitt tragen —
ist das falsch, entsteht eine Doppelvergabe“. Listenwert: nur Ziffern, Komma, keine Doppelten, sonst Abbruch.
**Sperrtext und `zeigen`** für ein Studio in A(idx) verzweigen (PQ4-4): „eigene Korrektur, wenn es Aufkleber aus der
Zeile trägt — sonst `uebrige-freigeben --abschnitt=<i> --ausgenommene-freigeben=<id>` (Eigentümer zusätzlich
`--eigentuemer-widerrufen`)“.

Pflichttests (LITERALE Sollwerte), jeder endet mit `erledigt_durch`/`unerledigteKaputteZeilen` literal (PQ4-2):
- `a_korr`: die zweite Freigabe schreibt `ausgenommen` OHNE 64 (sonst blind, PQ4-14); 64 bleibt gesperrt; nach eigener
  Korrektur vergibt 64 literal; Zeile erledigt, unerledigt 0.
- Kimi N4-1 Weg 1 über `--uebrige-nicht-betroffen`.
- `b_hand`: Handzeile `eigentuemer:64, ausgenommen:[]` deckt 64 NICHT; Handzeile `freigegeben:[5]` ohne tragende Deckung
  an einer „genau 5“-Zeile deckt 5 NICHT.
- Benannte Freigabe eines Nicht-Eigentümers → vergibt literal, Zeile erledigt; Eigentümer ohne Widerruf → Abbruch, mit
  Widerruf → gedeckt, Zeile erledigt, Audit nennt die widerrufene Zeile.
- Zwei Abschnitte: 64 ∈ A(0), eine Freigabe für Abschnitt 1 deckt 64 in Abschnitt 1 (A je Abschnitt, nicht über die Zeile).
Gegenprobe je Regel ROT.

## 2. Eigentümer-Erklärung (QJ4-2, QJ4-5 erster Teil, PQ4-10)

- `--eigentuemer` wird abgewiesen, wenn der Abschnitt schon eine Eigentümer-Freigabe oder eine Korrektur trägt
  (Widerspruch mit Zeilennummer). Die bestehenden (k)-Prüfungen bleiben: Kandidat des Abschnitts, KEINE DB-Zeile.
- Die ID muss in `bekannteStudios` stehen; sonst nur mit dem blanken Schalter `--eigentuemer-unbekannt` (Warnung „im
  Journal nicht bekannt — nur mit Beleg aus den Aufklebern“); Zeile und Audit tragen dann `eigentuemer_unbekannt: true`.
- `--eigentuemer`, `--keine-aufkleber` und `--ausgenommene-freigeben` schliessen einander aus (Abbruch).
Pflichttests: `a_eig` mit dem zweiten Eigentümer in einem NICHT voll erledigten Abschnitt (sonst fängt schon (a), PQ4-14)
→ Abbruch, 64 bleibt gesperrt; `d_alle` mit 999999 ohne Schalter → Abbruch, mit Schalter → Zeile trägt das Kennzeichen.

## 3. Untergrenze aus einem früheren Abschnitt derselben Zeile (QJ4-3, PQ4-11)

`spanneZaehlen` nimmt `abschnitt` auf (Korrekturen: ihr Abschnitt; angehängte vollständige Charge: hinter dem letzten
Abschnitt der Zeile). In `beurteileZeile` ordnet bei GLEICHER Position der Abschnitt: kleinerer = davor, grösserer =
danach. Gilt für (d'), (e) und `zeigen`. Pflichttest: `c_dstrich` und `c_dstrich_gleich` → (d')-Abbruch; nach korrekter
Korrektur vergibt S literal ab 360300.

## 4. Ehrliche Wege für die Sperren ohne Weg (QJ4-4, QJ4-5 zweiter Teil, QJ4-6, PQ4-3/6/12)

- `--ausserhalb-bloecke` bei UNLESBAREM `nr_von`: `--von`/`--bis` aus den Aufklebern. Es entfallen genau: (c) „im selben
  Block“ (ersetzt durch: die Spanne `--von..--bis` SCHNEIDET keinen Block des Studios — gilt ab jetzt auch bei lesbarem
  `nr_von`, und schliesst einen umschlossenen Block aus) und (d) „--von gleich gelesenem nr_von“ (nichts gelesen). Es
  bleiben: (d) gelesenes `nr_bis` und passende qr_charge als Untergrenzen, (e), (f) mit `--ohne-systembeleg` Pflicht.
  Pflichttest: `a_eig_ohneblock` → Korrektur möglich, Vergabe literal; Spanne um einen Block herum → Abbruch.
- **QJ3-6 wird ausdrücklich geändert:** Ein Abschnitt MIT Chargenschlüssel, Kandidat „alle“ oder Präfix, ohne Korrektur
  und ohne Eigentümer, darf mit `uebrige-freigeben --zeile=N --abschnitt=<i> --keine-aufkleber --grund="<Beleg>"`
  (blanker Schalter) für alle ausser A(i) erklärt werden. Die implizite Deckung über `--uebrige-nicht-betroffen` eines
  ANDEREN Abschnitts bleibt verboten (das war QJ3-6 im Kern). Zu ändern: Kopfkommentar `core/qr-verbrauch.js:141-147`,
  `abschnittGedecktFuer` und `abschnittVollGedeckt` (beide), `tools/qr-journal.js` `gedeckteAbschnitte`, der Sperrtext.
  Zeile `keine_aufkleber: true`, Audit ebenso. Warnung im Klartext: „erklärt, dass von dieser Charge nachweislich keine
  Aufkleber im Umlauf sind (bei allen Kandidaten gesucht) — ist das falsch, entsteht eine Doppelvergabe“. Nicht für
  „genau S“. Sperrtext und `zeigen` nennen den Weg nur für solche Abschnitte. Pflichttests: `d_alle`, `d_klammer`, je mit
  `erledigt_durch` literal.
- `metaZeileVollstaendig` (PQ4-6): `freigegeben`, `widerrufen` → Liste positiver Ganzzahlen; `keine_aufkleber`,
  `eigentuemer_unbekannt` → Boolean; sonst ist die Zeile kaputt (fail-closed). Test: Handzeilen mit `"freigegeben":"64"`
  und `"keine_aufkleber":"ja"` zählen als kaputt, kein TypeError.

## 5. Ausserhalb der Blöcke: Text und Daueralarm (QJ4-6, QJ4-7, PQ4-13)

- `AUSSERHALB_WARNUNG` wahr formulieren: die Spanne zählt, sobald ein Block sie enthält (Neuzustellung des alten Blocks).
  Der bestehende H7-Test mit dem alten Wortlaut wird fachlich umgestellt. Pflichttest `f_wieder`.
- Ursache laut Planprüfung: `vergleicheQuellen(dbMax, journal.hoechste)` in `core/qr-token.js` (um `:534`) vergleicht
  global. Spannen, die in KEINEM Block des Studios liegen, gehen nicht in diesen Vergleich ein. Vorher messen, ob das die
  Ursache ist. Zusicherungen WÖRTLICH `== 1` (nicht „höchstens“): `f_alarm` über dem Block 1 von 4, unter dem Block 1 von
  4 — UND ein echtes Zurückspielen (DB ohne die jüngste Charge IM Block) feuert weiterhin.

## 6. Korrektur-Payload wie beim Leser (QJ4-8)

`--uebrige-nicht-betroffen`: `uebrige_studios` nur, wer danach für ALLE seine Abschnitte gedeckt ist; wer teilweise
gedeckt bleibt, steht in einer „NICHT freigegeben“-Zeile mit dem offenen Abschnitt. Pflichttest `e_korrpayload` MIT einem
Studio, das nach der Korrektur in einem Abschnitt gedeckt und in einem anderen offen ist (PQ4-14), und ein QJ3-9-Test für
den Korrekturweg — dazu die literale Vergabe, weil der Payload-Test aus demselben Leser misst.

## 7. `zeigen` je offenem Abschnitt (QJ4-9)

Block, Nachbarn, Unter- und Obergrenze je (Studio, offener Abschnitt) mit dessen `nr_von`; bei mehreren Kandidaten je
bekanntem Studio. Pflichttest `c_zeigen` MIT zwei bekannten Kandidaten (Block 470000–470999, Obergrenze 470499 literal).

## 8. Texte (QJ4-10)

Sperrtext unterscheidet Korrektur, Eigentümer-Freigabe und `keine_aufkleber`; bei einer Zeile, deren einziger Kandidat
„genau S“ ist, nennen Sperrtext und `zeigen` die Korrektur, nicht `uebrige-freigeben`. Die statische Zählung „`zeigen`
GENAU 6-mal“ im Test wird mit hergeleiteter Zahl nachgezogen. Literal getestet.

## 9. Überlebende Mutationen (QJ4-12)

Je ein Test, der unter V1, V7, V4, Q6, Q7, V25, V6, T11 (Stellen: `scratchpad/qrjcc4/mutationen4.js`; V6 entfällt, wenn
§1 Eigentümer aus `bekannteStudios` nimmt — dann begründen) ROT wird; Nachweis je Mutation mit Zahlen. Die Zufallssuche
`e5_fuzz.js` nach dem Bau erneut: 0 Abweichungen, Positivkontrolle unter V1/V7 weiterhin Treffer.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab — und gibt es danach noch (a) eine Doppelvergabe über das
Werkzeug, (b) eine Sperre ohne ehrlichen, im Sperrtext genannten Werkzeugweg, (c) einen Weg, der eine erfundene Angabe in
die Audit-Kette schreibt? Welche neuen Schalter kann ein Betreiber falsch benutzen, und was verhindert, dass der
Sperrtext ihn dorthin führt? Bleibt irgendeine fachlich geklärte Zeile als „unerledigt“ stehen?

-- Ende des Auftrags --
