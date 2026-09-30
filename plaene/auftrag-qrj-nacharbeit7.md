# Auftrag QR-J Nacharbeit 7 (30.09.2026, Fassung 3 nach Planprüfung Runde 1 und 2, `plaene/planpruefung-qrj-n7.md`)

Grundlage: Diffprüfung Runde 7 von `66c0601` (nach master-Merge `7b1a49a`): Lesespur `scratchpad/qrjr7/antwort-lese.txt`
(R7-L1…L9), ausführende Spur `scratchpad/qrjr7/cc/befunde.md` (B1…B9, Skripte daneben). Nachgemessen in
`plaene/diffpruefung-qrj.md` (Runde 7). Baum `/workspace/gymdocu-qrj`, Zweig `fix-qrj-journal-reparatur`, Kopf `7b1a49a`.
Einordnung: sehr komplex (Fortsetzung desselben Agenten) — mehrere Lesergeln, die einander bedingen, und jede
Lockerung kann eine unwiderrufliche Doppelvergabe freigeben, die im Test grün aussieht.

Vor dem Bau die genannten Reproduktionen gegen `7b1a49a` wiederholen (müssen das gemeldete Verhalten zeigen), danach
erneut — beides wörtlich.

## §1 Korrektur-Bruchstück: lesbare Angaben binden (B1, B3, B4 — gemessen: Doppelvergabe)

Fassung 1 (Kandidat auf S verengen) gab T frei; Fassung 2 (S über die Ausgenommenen-Regel benennen, Untergrenze mit
Block-Ausweg, `--art-laut-meldung` ungebunden) öffnete `--ausgenommene-freigeben=S`, fremde Nummernräume, unsichtbare
Kreuzungsspannen und eine Umgehung ohne Lüge (Planprüfung Runde 2, `plaene/planpruefung-qrj-n7.md`). Fassung 3:

1. **Kandidat bleibt „alle".** Ist `studio_id` GENAU lesbar (voller 64-Hex-Hash davor, Komma danach — Hash-Riegel
   `core/qr-verbrauch.js:245-246` bleibt, Test `:2710` Fall 5), ist S für diesen Abschnitt **benannt** — eine EIGENE
   Eigenschaft, NICHT über A(idx)/`ausgenommen` modelliert. S ist nur gedeckt durch (a) S' eigene Korrektur DIESES
   Abschnitts mit `--bis` ≥ Untergrenze (§1.2), oder (b) eine vollständige Korrektur der Zeile Z (= `ersetzt_zeile` des
   Bruchstücks) durch S, geschrieben NACH dem Bruchstück, mit `nr_bis` ≥ Untergrenze (die wiederholte Korrektur).
   Nichts sonst deckt S: nicht `--uebrige-nicht-betroffen`, nicht die Freigabe durch ein anderes Korrektur-Studio,
   nicht `--eigentuemer=<X>` (mit oder ohne `--eigentuemer-unbekannt`), nicht `--ausgenommene-freigeben=S`, nicht
   `--keine-aufkleber`. Je eine Gegenprobe pro Weg. Übrige Kandidaten: wie N6. Präfix-lesbares `studio_id`: KEINE
   Benennung (sonst Dauersperre für alle passenden Studios), nur Hinweis — benannte Grenze, Sammelliste.
2. **Untergrenze (B4), nur bei genau lesbarem S:** `nr_bis` über einen am Korrektur-Layout verankerten Ausdruck
   (Feldkette des Schreibers `tools/qr-journal.js:1034`: `…"studio_id":S,"nr_von":A,"nr_bis":B`), abgeschlossen durch
   Komma ODER Textende (eine abgerissene Ziffernfolge ist ≤ der echten Zahl: Untergrenze, nie Gleichheit); Test mit
   angeklebtem Rest, dessen `nr_bis` ein ANDERER Wert ist (J7a/J7c-Form). `nr_von` nur als Hinweis. Liegt die
   Untergrenze ausserhalb des Blocks von `--von` (nur bei nachträglich geänderten Blöcken oder Handzeilen erreichbar):
   KEIN Schalter, kein Kreuzen — Abbruch mit eigenem Text, der den Fall benennt; benannte Grenze, Sammelliste.
3. **Reihenfolge (B6):** der Weg für S lautet ab jetzt: zuerst die Korrektur der Zeile Z WIEDERHOLEN (Spanne aus den
   Aufklebern, `--bis` ≥ Untergrenze) — sie deckt S im Bruchstück nach (b); die Korrektur des Bruchstücks selbst ist
   der zweite Weg. Hinweistext entsprechend.
4. **Unlesbarer Typ (B1):** NUR die Präfixe von `{"typ":"` mit Länge 1–8 (`{`, `{"`, `{"t`, `{"ty`, `{"typ`, `{"typ"`,
   `{"typ":`, `{"typ":"`) sind „Typ unlesbar"; alles andere wie N6 (`{"typo`, `{"typ"x` usw. bleiben
   Korrektur-Bruchstück, Test). Fail-closed: kein `verwerfen`, kein `--keine-aufkleber`. Wege: eigene Korrektur eines
   Studios mit Aufklebern; `--eigentuemer` eines fehlenden Studios; und die an die Werkzeugmeldung GEBUNDENE Erklärung
   `--art-laut-meldung=<freigabe|verworfen|charge>`:
   - JEDE Schreibfehlermeldung (Korrektur, Verwerfen, Freigabe und NEU `chargeAnlegen` in `core/qr-token.js:968` —
     heute ohne eigene Meldung, gemessen) nennt Art, physische Zeile K, an der das Bruchstück beginnt, und den Wert für
     `--art-laut-meldung`. Die Erklärung gilt nur für Zeile K (`--zeile=K`), `--grund` zitiert die Meldung.
   - `freigabe`/`verworfen` → `verwerfen` zulässig. `charge` NUR bei Länge 1–2 (ab `{"t` ist es nachweislich keine
     Chargenzeile) → die Chargenzeilen-Wege; `--keine-aufkleber` ist dort wahr, weil `chargeAnlegen` die Journalzeile IN
     der Transaktion schreibt (Riss ⇒ kein Commit ⇒ keine Aufkleber) — diese Begründung am Code belegen, sonst `charge`
     nur mit Korrekturwegen.
   - Ohne Meldung (Signal, Absturz, Handzeile) keine Erklärung: Sperre bleibt, benannte Grenze, Sammelliste.
   - Feld `art_laut_meldung` (Zeichenkette, einer der drei Werte) in der Metazeile und im Audit; `metaZeileVollstaendig`
     prüft es; `zeigen`/`erledigungenText` zeigen es; eigene Warnkonstante wie `KEINE_AUFKLEBER_WARNUNG`.
   - Texte: „möglicherweise Korrekturzeile" statt „Korrekturzeile" für Typ unlesbar; Weg-Text und (v)/(k)-Texte nennen
     `--art-laut-meldung`. `test_feature_qr_journal.js:2699` und die Liste `:2693-2695` fachlich umstellen.

## §2 Frischprüfungen

- `befehlVerwerfen` (R7-L1 = B2): `pruefeVerwerfen` liefert `erledigungenStand` (fehlt, `:1157`); unter dem Lock
  derselbe Vergleich wie `befehlFreigeben` und die (v)-Bedingung frisch; `vorFrischpruefungHook`. Gegenprobe: Fixturzeile
  VERWERFBAR (reine Freitextzeile, kein `{"charge_id`-Anfang — sonst Frühausstieg in `verwerfbarkeit`), nebenläufige
  Änderung eine Eigentümer-Freigabe per `eintragAnhaengen` wie T13 (`:2918-2921`); Vergleich entfernt → ROT.
- `befehlKorrigieren` (Planprüfung B F4): unter dem Lock `beurteileZeile` und `maxTokenLaden` erneut (rein lesend) und
  gegen den Plan halten; `vorFrischpruefungHook` auch hier; Test mit einer nebenläufigen Vergabe/Korrektur einer
  ANDEREN Zeile desselben Blocks, die (d')/(e) verschiebt → Abbruch; Gegenprobe ohne die Neuerhebung → ROT.
- `befehlFreigeben`: die DB-Sicht (`kandidatenStudios`, `bekannteStudios`) wird nicht neu erhoben — überwiegend
  fail-closed, Sammelliste.

## §3 Nachher-Lesen in `befehlKorrigieren` (R7-L2 = B5)

`try/catch`: ein Lesefehler nach dem COMMIT macht aus dem Erfolg keinen Fehlschlag (`geschrieben: true`), meldet aber
laut über `fehlerLog` mit den betroffenen Verwerfen-Zeilen. Test an J8 (`test_feature_qr_journal.js:2854-2882`, hat das
widerlegte Verwerfen; der Leser läuft nur bei `plan.verworfenWiderlegt.length`, `:1089`).

## §4 Texte und Randfälle

- R7-L3: `--studio=<subdomain>` im Eigentümer-Befehl an ALLEN Stellen ohne vorhandene Korrektur: (k)-Texte `:1304`,
  `:1346`, `:1348`, `:1286` (dort auch `--grund`), `zeigen` `:565`, `:588` (Vorlage `EIGENTUEMER_BEFEHL`,
  `core/qr-verbrauch.js:676`). Literale mitziehen.
- R7-L4: die `keine_aufkleber`-Sperre des Eigentümer-Wegs (`:1290-1291`) und die symmetrischen Stellen (`:1285-1286`,
  `:1307-1308`, `:1310-1311`) fragen `tragendeDeckungen` (EIN Ort), nicht die blosse Existenz der Zeile; die
  Korrektur-Sperren `:1287-1288`/`:1305-1306` bleiben (Begründung im Bericht).
- R7-L5: nur in der Anzeige-Hilfe `widerlegendeZeilen` (`tools/qr-journal.js:456-460`), NICHT in
  `widerlegendeKorrekturen` (die Wege-Datei kreuzt sie unabhängig, `test_feature_qr_journal_wege.js:341`).
- B7 (= R7-L9): `wegFuer` nennt `verwerfen` nicht, wenn die Zeile irgendeine Korrektur trägt — nur per Handzeile
  erreichbar, als Verteidigung kennzeichnen, Test mit Handzeile.
- B8: der (v)-Text unterscheidet Korrektur-Bruchstück, unlesbaren Typ und Freigabe-/Verwerfen-Bruchstück mit
  angeklebter Charge.

## §5 Tests

- R7-L7: `test_feature_qr_journal.js:2808` mit `instanceof`.
- B9: literale Fälle für den Präfixrand `{"typ":"freigabeX` (R64–R66), „Freigabe ohne Korrektur trägt nicht für ein
  Korrektur-Bruchstück" (R26), Texte von (v) und Widerlegt-Log (R41–R43, R48, R52, R53), Schreibfehler-Pfad der
  Freigabe (R55).
- Die Wege-Datei (`test_feature_qr_journal_wege.js`, eigenes Modell, `:204-206`, `:307`) zieht §1 mit: benanntes
  Studio, Untergrenze, Reihenfolge, unlesbarer Typ mit `--art-laut-meldung`.
- Jede neue Zusicherung mit Gegenprobe; Mutationsliste der Prüfspur (`qrjr7/cc/liste*.json`, `mut.js`) erneut, die
  Überlebenden benennen. Differentialtest `qrjr7/cc/dfuzz.js` alt gegen neu: Lockerungen (vorher gesperrt, jetzt
  frei) müssen 0 sein ausser den durch `--art-laut-meldung` ausdrücklich erklärten; Sackgassen-Fuzz `sack.js` erneut —
  jede Sperre ohne Weg muss eine der benannten Grenzen sein.

## Nicht in diesem Auftrag (Sammelliste)

K04–K14 (Vollständigkeitsregeln des Lesers für Felder, die die Stichprobe nie beschädigt — Bestand), QJ6-MU31 (= R7-L6).
Neu als benannte Grenzen (vom Bau NICHT zu lösen, nur mit eigenem Text zu melden): Präfix-lesbares Studio ohne
Benennung; Untergrenze ausserhalb des Blocks; unlesbarer Typ ohne Werkzeugmeldung; DB-Sicht der Freigabe-Frischprüfung.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht, den es vorher nicht gab? Insbesondere: (a) gibt es nach §1 noch einen Riss einer
Korrekturzeile, der ohne Korrektur mit Spanne ≥ der gelesenen freigegeben werden kann (ausser durch eine falsche
`--art-laut-meldung`); (b) wird irgendein Studio frei, das vorher gesperrt war; (c) entsteht eine Sackgasse (Fuzz
`qrjr7/cc/sack.js` um §1.2/§1.3 erweitert)?

-- Ende des Auftrags --
