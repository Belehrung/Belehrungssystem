# Auftrag QR-J — Reparaturweg für kaputte Zeilen im QR-Verbrauchsjournal (Fassung 2, 24.09.2026)

**Betreiber-Entscheidung 24.09.2026 abends:** „ja beides“ — (1) die QR-Vergabe sperrt auch, wenn der Vergabeblock keine
eigene lesbare Journalspur hat (C1-S1, in der C1-Nacharbeit gebaut); (2) ein Reparaturweg für die kaputte Zeile selbst,
damit eine Sperre in Minuten statt durch eine Handoperation auf dem Server aufgelöst wird.

Einordnung: **sehr komplex** — unwiderruflich (eine zu niedrig „reparierte“ Zeile gibt Nummern frei, die physisch
kleben), mehrere Quellen, die einander widersprechen können, und ein Ergebnis, das falsch grün aussehen kann. Diffprüfung
mit drei Spuren. Bau erst NACH dem Merge von C1 (dieselben Dateien). **Fassung 2** nach der Planprüfung
(`plaene/planpruefung-qrj.md`, PQJ-1..14); Änderungen mit PQJ-Nummern.

**Leitregel für jede Entscheidung in diesem Auftrag:** Überspringen ist sicher, Unterschlagen ist unwiderruflich. Wo eine
Grenze nicht belegbar ist, wird nach OBEN entschieden oder gesperrt — nie nach unten.

## Ausgangslage (gelesen, master `a36f5ab`; vor dem Bau auf den master nach C1 heben)

- `core/qr-verbrauch.js`: Journal `/var/www/gymdocu-daten/qr-verbrauch.jsonl`, eine Zeile je Charge
  `{ charge_id, studio_id, nr_von, nr_bis, menge, zeitpunkt }` in genau dieser Feldreihenfolge, geschrieben vor dem
  DB-COMMIT (`core/qr-token.js:612`). `hoechsteVergebeneLesen()` zählt unlesbare Zeilen GLOBAL als `kaputteZeilen`.
- Einziger Leser ist `core/qr-token.js` (Vergabe, mittelbar die Vorschau in `tools/qr-charge.js`); kein Ops-Skript und
  kein Wochenreport liest das Journal (PQJ-12, per `grep` gemessen).
- **Es gibt keine rückspielfeste Quelle für die echte Spanne ausser dem Journal selbst** (PQJ-2): Druckdaten (CSV/PDF)
  entstehen bei jedem Abruf frisch aus der DB, nichts liegt auf der Platte; Bestellungen stehen in der DB; die Bestellroute
  nennt keine Nummernspanne. Der Beleg ausserhalb des Systems ist physisch: die höchste Nummer auf den gedruckten
  Aufklebern bzw. die Druckdaten-Datei bei der Druckerei.

## Soll

0. **Verschluckte Folgezeile (PQJ-4, bestehender Fehler).** `eintragAnhaengen`: ist die Datei nicht leer und endet sie
   NICHT mit `\n`, wird dem Puffer ein `\n` vorangestellt (letztes Byte per `fstat` + `readSync` am selben Deskriptor
   lesen). Damit bleibt ein Bruchstück eines gescheiterten Schreibversuchs eine eigene kaputte Zeile, statt den nächsten,
   committeten Eintrag mitzureissen. `hoechsteVergebeneLesen` liest zusätzlich aus einer kaputten ALTzeile den Rest ab
   dem LETZTEN `{"charge_id":`, wenn dieser Rest für sich gültiges JSON mit ganzzahligem `studio_id`/`nr_von`/`nr_bis`
   ist: dessen Spanne zählt wie eine normale Zeile; die Zeile bleibt trotzdem kaputt (der vordere Teil ist ungeklärt).
1. **Zuordnung kaputter Zeilen (PQJ-3).** Eine kaputte Zeile gehört einem Studio NUR, wenn ihr Rohtext (nach `trim`) mit
   `^\{"charge_id":(\d+),"studio_id":(\d+),` beginnt — verankert am Zeilenanfang, `studio_id` durch das Komma
   abgeschlossen. Sonst zählt sie für ALLE Studios (heutiges Verhalten). `nr_von` gilt als gelesen nur mit
   `^\{"charge_id":\d+,"studio_id":\d+,"nr_von":(\d+),`. Rückgabe zusätzlich `kaputteDetails: [{ zeile, roh_sha256,
   studio_id|null, charge_id|null, nr_von|null, erledigt_durch|null }]`.
2. **Eine Zeilenzählung (PQJ-9):** `zeile` ist die PHYSISCHE Zeilennummer ab 1 über ALLE Zeilen einschliesslich leerer
   (Aufteilung an `\n`). Leser, `zeigen` und `korrigieren` benutzen dieselbe Funktion dafür. `zeilen` (Anzahl nicht
   leerer Zeilen) bleibt, wie es ist.
3. **Metazeilen, nie Löschen (PQJ-8, PQJ-10).** Neue Zeilenformen, `typ` als ERSTES Feld:
   `{ typ: "korrektur", ersetzt_zeile, roh_sha256, studio_id, nr_von, nr_bis, quelle, durch, zeitpunkt }` und
   `{ typ: "verworfen", ersetzt_zeile, roh_sha256, grund, durch, zeitpunkt }`. Eine Metazeile mit vollständiger,
   typgerechter Form ist NIE eine Chargenzeile und NIE kaputt; eine unvollständige ist kaputt (und dann nicht zuordenbar,
   also für alle — fail-closed). Eine kaputte Zeile ist ERLEDIGT, wenn eine Metazeile mit derselben `ersetzt_zeile` UND
   demselben `roh_sha256` existiert. Die Spanne einer Korrekturzeile zählt für ihr Studio wie eine normale Zeile.
4. **Sperre (PQJ-5).** In `aktivenBlockUndHoechsteErmitteln`: gibt es eine UNERLEDIGTE kaputte Zeile, die diesem Studio
   gehört oder keinem zuordenbar ist → `QrLageUngeklaertFehler`, unabhängig von lesbaren Spuren im Block. Der bisherige
   Alarm `journal_kaputte_zeilen` bleibt (zählt dann die unerledigten). Die C1-S1-Bedingung geht darin auf; ihre Tests
   bleiben grün oder werden mit Begründung angepasst.
   Hinweis aus C1 Runde 2 (C1-R2-8): die Ausnahme „Erstdruck bleibt frei“ im C1-D3-Zweig ist heute toter Code, weil die Leiter davor bei jeder kaputten Zeile wirft. Wer die Leiter hier umbaut, braucht für den Erstdruck (Studio ohne jede Spur, fremde kaputte Zeile) einen eigenen Test.
5. **Fehlertexte (PQJ-6).** Jede Meldung der Leiter, die heute zum Entfernen der Journal-Datei rät
   (`core/qr-token.js:447-450`), und die neue Sperre nennen stattdessen `node tools/qr-journal.js zeigen`. Kein Text rät
   mehr zum Entfernen oder Editieren der Datei.
6. **Werkzeug `tools/qr-journal.js`** (Muster `tools/qr-charge.js`; Kopfkommentar: erst nach vollständigem Deploy
   benutzen, ein Rückrollen auf eine ältere Version liest Verwerfen-Zeilen als kaputt — fail-closed, gewollt; PQJ-13):
   - Jeder DB-Fehler → lauter Abbruch mit Exit ≠ 0, nie „keine Charge vorhanden“ (PQJ-2).
   - `zeigen`: je unerledigter kaputter Zeile Nummer, Rohtext (gekürzt), Zuordnung, lesbare Bruchstücke, eine ggf.
     angehängte vollständige Chargenzeile (Soll 0), die lesbaren Nachbarzeilen desselben Studios im selben Block, und aus
     der DB: `qr_charge` zur `charge_id` (Studio, Spanne) und `MAX(qr_token.nummer)` zur `charge_id`. Dazu ausdrücklich
     die OBERGRENZE, soweit belegt (nächste lesbare Zeile desselben Studios im selben Block: `nr_von − 1`), und der Satz,
     wenn keine belegt ist: „Keine Obergrenze im System — Beleg ist die höchste Nummer auf den gedruckten Aufklebern.“
   - `korrigieren --zeile N --von A --bis B --quelle "<Beleg>" [--studio S] [--ohne-systembeleg] [--ja]`. Prüfungen, jede
     mit eigenem Abbruchgrund, im Trockenlauf wie mit `--ja` IDENTISCH ausgeführt (PQJ-11):
     (a) Zeile N ist unerledigt kaputt, ihr `roh_sha256` wird frisch berechnet; eine bereits erledigte Zeile → Abbruch
         („bereits erledigt durch Zeile M“, PQJ-10);
     (b) Studio: zuordenbare Zeile → `--studio` weglassen oder gleich; unzuordenbare → `--studio` Pflicht (PQJ-7); Studio
         muss existieren;
     (c) A ≤ B, beide im Block dieses Studios (derselbe Block);
     (d) UNTERGRENZEN: A = gelesenes `nr_von`, falls gelesen; B ≥ `qr_charge.nr_bis` und B ≥ `MAX(qr_token.nummer)` zur
         `charge_id`, falls vorhanden; passt eine gefundene `qr_charge` nicht zu Studio oder `nr_von` → Abbruch (PQJ-14);
     (e) OBERGRENZE: B < `nr_von` der nächsten lesbaren Zeile desselben Studios im selben Block, falls vorhanden;
     (f) Fehlt jede Obergrenze UND gibt es keine `qr_charge` zur `charge_id`, schreibt das Werkzeug nur mit
         `--ohne-systembeleg` und gibt vorher aus: „Keine Obergrenze im System. Eine zu niedrige Grenze vergibt verklebte
         Nummern doppelt; übersprungene Nummern kosten nichts — im Zweifel höher wählen.“ (PQJ-1).
     Schreiben (nur mit `--ja`): `auditTx` im Studio, `auditAppend` (`qr_journal_korrektur`, Payload: Zeile, Hash,
     Spanne, Quelle, `durch`), Journalzeile per `eintragAnhaengen` (fsync) VOR dem COMMIT — dasselbe Muster wie
     `chargeAnlegen`. Scheitert der COMMIT nach dem Journal, lauter Hinweis mit Exit ≠ 0 (PQJ-10).
   - `verwerfen --zeile N --grund "<text>" [--ja]`: NUR für eine kaputte Zeile, deren Rohtext KEINEN der Schlüssel
     `charge_id`, `studio_id`, `nr_von`, `nr_bis` enthält (PQJ-2). Alles andere → Abbruch „nicht belegbar —
     korrigieren statt verwerfen“. Die Zeile ist keinem Studio zuordenbar; das Audit `qr_journal_verworfen` geht an das
     Studio aus `--studio` (Pflicht), Journal wie oben vor dem COMMIT.

## Tests

- Soll 0: Bruchstück ohne `\n` + `eintragAnhaengen` → neuer Eintrag lesbar, `kaputteZeilen` 1, Spanne des neuen Eintrags
  in `spannen` (Messwert heute: fehlt, `hoechste` 199 statt 399). Altzeile mit angehängter vollständiger Chargenzeile →
  deren Spanne zählt, Zeile bleibt kaputt.
- Zuordnung: gültiger Anfang → nur dieses Studio gesperrt; Abschnitt MITTEN in `"studio_id":57` (→ `5`) → für alle;
  Freitext mit `\"studio_id\":5` in einer abgeschnittenen Metazeile → für alle.
- Zählung: Leerzeile VOR der kaputten Zeile → `zeigen` und Leser nennen dieselbe Nummer, `korrigieren` wirkt.
- Erledigung als PAAR: passender Hash → erledigt und Spanne zählt; falscher Hash → nicht erledigt. Gegenprobe des
  Negativtests entfernt genau den Hash-Vergleich; Hash im Test unabhängig über `crypto.createHash('sha256')`.
- Metazeile vollständig → weder kaputt noch Charge; Metazeile abgeschnitten → kaputt, für alle.
- Sperre (Soll 4): lesbare Zeile des Studios im Block bis Y, danach unerledigte kaputte Zeile desselben Studios →
  `chargeAnlegen` wirft; fremdes Studio mit zuordenbarer kaputter Zeile → kein Wurf; unzuordenbare → Wurf für jedes.
- Werkzeug gegen Wegwerf-Journal (QR_VERBRAUCH) und Wegwerf-DB: jede Prüfung (a)–(f) einzeln rot; Trockenlauf liefert
  bei jeder Verletzung DENSELBEN Abbruchgrund wie `--ja` und schreibt nichts (Byte-Grösse); `--ja` schreibt genau eine
  Zeile + ein Audit-Glied (`ereignis` UND Studio geprüft); DB-Fehler (Stub) → Exit ≠ 0, nichts geschrieben;
  COMMIT-Fehler nach Journal → Exit ≠ 0 mit Hinweis; zweite Korrektur derselben Zeile → Abbruch; `verwerfen` bei Zeile mit
  `charge_id` im Rohtext → Abbruch.
- Ende-zu-Ende: DB mit Charge C (Spanne literal), DB-Stand ohne C (Zurückspielen nachgestellt), Journalzeile von C
  abgeschnitten → `chargeAnlegen` wirft → `korrigieren` ohne `--ohne-systembeleg` → Abbruch (f); mit Schalter und B am
  literalen Ende von C und `--ja` → `chargeAnlegen` vergibt ab dem LITERAL hingeschriebenen Wert B+1. Zweite Fixtur mit
  DB-Zeile von C: B unter deren `nr_bis` → Abbruch (d).
- Gegenproben je Prüfung (entfernen → ROT), Zahlen wörtlich; Fixturen, in denen jede Grenze eine ANDERE Zahl trägt.
  Volle Suite nach Ritual.
- Zustandsfrage für den Bericht: welcher Zustand entsteht durch Soll 0–6, den es vorher nicht gab?

-- Ende des Auftrags --
