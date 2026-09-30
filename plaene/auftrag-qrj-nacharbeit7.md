# Auftrag QR-J Nacharbeit 7 (30.09.2026, Fassung 2 nach Planprüfung `scratchpad/qrjn7p/antwort-{a,b}.txt`)

Grundlage: Diffprüfung Runde 7 von `66c0601` (nach master-Merge `7b1a49a`): Lesespur `scratchpad/qrjr7/antwort-lese.txt`
(R7-L1…L9), ausführende Spur `scratchpad/qrjr7/cc/befunde.md` (B1…B9, Skripte daneben). Nachgemessen in
`plaene/diffpruefung-qrj.md` (Runde 7). Baum `/workspace/gymdocu-qrj`, Zweig `fix-qrj-journal-reparatur`, Kopf `7b1a49a`.
Einordnung: sehr komplex (Fortsetzung desselben Agenten) — mehrere Lesergeln, die einander bedingen, und jede
Lockerung kann eine unwiderrufliche Doppelvergabe freigeben, die im Test grün aussieht.

Vor dem Bau die genannten Reproduktionen gegen `7b1a49a` wiederholen (müssen das gemeldete Verhalten zeigen), danach
erneut — beides wörtlich.

## §1 Korrektur-Bruchstück: lesbare Angaben binden (B1, B3, B4 — gemessen: Doppelvergabe)

Fassung 1 wollte den Kandidaten auf das gelesene Studio verengen. Planprüfung (`scratchpad/qrjn7p/antwort-a.txt` B1):
das gäbe T frei, obwohl die abgerissene Korrektur gerade Ts Erklärung widerlegen sollte — ein Bruchstück widerlegt
nichts (`korrekturenIn` nur `typ:'korrektur'`), die Kandidatur „alle" ist der einzige Anker. Deshalb:
1. **Kandidat bleibt „alle".** Das im Bruchstück lesbare Studio (genau: S; Präfix: jedes passende Studio) ist für
   diesen Abschnitt BENANNT: keine Erklärung eines ANDEREN Studios deckt es — weder `--uebrige-nicht-betroffen`,
   noch eine Freigabe durch ein anderes Korrektur-Studio, noch `--eigentuemer=<X≠S>` (auch nicht mit
   `--eigentuemer-unbekannt`). Für S gelten die Wege eines genau-Kandidaten einer Chargenzeile (eigene Korrektur;
   was dort sonst zulässig ist, an der Chargenzeile MESSEN und gleich halten). Für alle übrigen Kandidaten bleibt
   alles wie in N6. Umsetzung an EINER Stelle (Deckungs-/Ausgenommenen-Regel im Leser), die Werkzeug-Prüfungen lesen
   sie von dort. Der Hash-Riegel beim Lesen von `studio_id` (erst nach vollem 64-Hex-Hash, `core/qr-verbrauch.js:245-246`,
   Test `:2710` Fall 5) bleibt.
   Gemessen muss danach: die drei B3-Wege der Prüfspur (`qrjr7/cc/sz*.js`) werden abgelehnt; T bleibt in J7b/J7c
   gesperrt wie heute.
2. **Untergrenze (B4):** `nr_bis` des Bruchstücks wird gelesen (eigener, am Korrektur-Layout verankerter Ausdruck,
   Feldreihenfolge des Schreibers `tools/qr-journal.js:1034`), und zwar auch OHNE abschliessendes Komma — eine
   abgerissene Ziffernfolge ist höchstens so gross wie die echte Zahl, taugt also als Untergrenze, nie als
   Gleichheit. `nr_von` nur mit Komma und nur als Hinweis. Die Korrektur DIESES Abschnitts verlangt `--bis` ≥ gelesenes
   `nr_bis`. **Keine Sackgasse** (Planprüfung B, blockierend): widerspricht die Untergrenze der Blockregel (c) (Spanne
   über eine Blockgrenze oder ausserhalb jedes Blocks), braucht es einen benannten, getesteten Weg (z. B. einen
   Schalter mit Warnung wie `AUSSERHALB_WARNUNG`) — jede Kombination mit Test, und der Sackgassen-Fuzz
   (`qrjr7/cc/sack.js`) wird um diese Fälle erweitert.
3. **Unlesbarer Typ (B1, Planprüfung A B2/B3):** jeder getrimmte Abschnitt, der Präfix von `{"typ":"` ist (Länge 1–8:
   `{`, `{"`, `{"t` … `{"typ":"`), kann eine Korrektur-, Freigabe-, Verwerfen- ODER (Länge 1–2) Chargenzeile sein. Er
   gilt als Korrektur-Bruchstück ohne lesbare Angaben (fail-closed: kein `verwerfen`, kein `--keine-aufkleber`), mit
   EINEM zusätzlichen, ehrlichen Weg: die Erklärung `--art-laut-meldung=<freigabe|verworfen|charge|korrektur>` mit
   `--grund` — der Bediener gibt an, welcher Schreibvorgang laut der Fehlermeldung des Werkzeugs abriss. `freigabe`/
   `verworfen` → `verwerfen` zulässig; `charge` → die Wege einer Chargenzeile ohne Schlüssel-Angaben (heutiges
   Verhalten für `{`/`{"`); `korrektur` → nur die Korrektur-Wege. Die Angabe steht im Audit und in der Verwerfen-/
   Freigabe-Zeile. Dazu nennt JEDE Schreibfehlermeldung (Korrektur, Verwerfen, Freigabe — und `chargeAnlegen` in
   `core/qr-token.js`, dort messen, ob und wie es heute meldet) die Art ausdrücklich und den Wert für
   `--art-laut-meldung`. Ab Länge 9 (`{"typ":"k…`, `{"typ":"f…` usw.) gilt die N6-Präfixregel unverändert.
   J7-Zusicherung `test_feature_qr_journal.js:2699` („kürzer bleibt Freitext") fachlich umstellen.
4. Der Hinweistext (`korrekturBruchstueckHinweis`) nennt die gelesene Untergrenze und die REIHENFOLGE (B6): zuerst
   das Bruchstück korrigieren, dann die Korrektur der Zeile Z wiederholen.

## §2 Frischprüfungen

- `befehlVerwerfen` (R7-L1 = B2): `pruefeVerwerfen` liefert `erledigungenStand` (heute fehlt es, `:1157`); unter dem
  Lock denselben Vergleich wie `befehlFreigeben` und die (v)-Bedingung frisch; `vorFrischpruefungHook` auch hier.
  Gegenprobe: die nebenläufige Änderung darf KEINE Korrektur sein (die (v)-Wiederholung finge sie und maskierte den
  Vergleich) — z. B. eine Eigentümer-Freigabe per `eintragAnhaengen` wie T13 (`test_feature_qr_journal.js:2918-2921`);
  Vergleich entfernt → ROT.
- `befehlKorrigieren`: die Frischprüfung erhebt die Grenzen (c/d/e) und Belege nicht neu, der Kommentar `:1044-1048`
  behauptet mehr. Entweder `beurteileZeile` unter dem Lock erneut (rein lesend) und gegen den Plan halten — mit
  Test — oder den Kommentar auf das Gemessene zurücknehmen und den Punkt auf die Sammelliste. Entscheidung mit
  Begründung im Bericht.

## §3 Nachher-Lesen in `befehlKorrigieren` (R7-L2 = B5)

`try/catch`: ein Lesefehler nach dem COMMIT macht aus dem Erfolg keinen Fehlschlag (`geschrieben: true`), meldet aber
laut über `fehlerLog` mit den betroffenen Verwerfen-Zeilen. Die Test-Fixtur MUSS ein widerlegtes Verwerfen enthalten
(der Leser läuft nur bei `plan.verworfenWiderlegt.length`, `:1089`), sonst berührt sie den `catch` nie.

## §4 Texte und Randfälle

- R7-L3: `--studio=<subdomain>` im Eigentümer-Befehl an ALLEN Stellen ohne vorhandene Korrektur: (k)-Texte `:1346`,
  `:1348`, `zeigen` `:565`, `:588` (Vorlage `EIGENTUEMER_BEFEHL`, `core/qr-verbrauch.js:676`). Literale mitziehen.
- R7-L4: die `keine_aufkleber`-Sperre des Eigentümer-Wegs (`:1290-1291`) und die symmetrischen Stellen (`:1285-1286`,
  `:1307-1308`) fragen `tragendeDeckungen` (EIN Ort), nicht die blosse Existenz der Zeile.
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
- Die Wege-Datei (`test_feature_qr_journal_wege.js`, eigenes Modell) zieht §1 mit: benanntes Studio, Untergrenze,
  unlesbarer Typ mit `--art-laut-meldung`.
- Jede neue Zusicherung mit Gegenprobe; Mutationsliste der Prüfspur (`qrjr7/cc/liste*.json`, `mut.js`) erneut, die
  Überlebenden benennen. Differentialtest `qrjr7/cc/dfuzz.js` alt gegen neu: Lockerungen (vorher gesperrt, jetzt
  frei) müssen 0 sein ausser den durch `--art-laut-meldung` ausdrücklich erklärten.

## Nicht in diesem Auftrag (Sammelliste)

K04–K14 (Vollständigkeitsregeln des Lesers für Felder, die die Stichprobe nie beschädigt — Bestand), QJ6-MU31 (= R7-L6).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht, den es vorher nicht gab? Insbesondere: (a) gibt es nach §1 noch einen Riss einer
Korrekturzeile, der ohne Korrektur mit Spanne ≥ der gelesenen freigegeben werden kann (ausser durch eine falsche
`--art-laut-meldung`); (b) wird irgendein Studio frei, das vorher gesperrt war; (c) entsteht eine Sackgasse (Fuzz
`qrjr7/cc/sack.js` um §1.2/§1.3 erweitert)?

-- Ende des Auftrags --
