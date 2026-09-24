# Auftrag QR-J — Reparaturweg für kaputte Zeilen im QR-Verbrauchsjournal (Fassung 1, 24.09.2026)

**Betreiber-Entscheidung 24.09.2026 abends:** „ja beides“ — (1) die QR-Vergabe sperrt auch, wenn der Vergabeblock keine
eigene lesbare Journalspur hat (C1-S1, wird in der C1-Nacharbeit gebaut); (2) ein Reparaturweg für die kaputte Zeile
selbst, damit eine Sperre in Minuten statt durch eine Handoperation auf dem Server aufgelöst wird.

Einordnung: **sehr komplex** im Sinne der CLAUDE.md — unwiderruflich (eine falsch „reparierte“ Zeile kann eine Nummer
freigeben, die physisch schon klebt), mehrere Quellen, die einander widersprechen können (Journal, Datenbank nach
Zurückspielen, Druckdaten auf der Platte, Bestellungen), und ein Ergebnis, das falsch grün aussehen kann. Diffprüfung mit
drei Spuren. Bau erst NACH dem Merge von C1 (dieselben Dateien: `core/qr-verbrauch.js`, `core/qr-token.js`).

## Ausgangslage (gelesen, master `a36f5ab`)

- `core/qr-verbrauch.js`: Journal `/var/www/gymdocu-daten/qr-verbrauch.jsonl` (bewusst AUSSERHALB des zurückgespielten
  PostgreSQL-Baums), eine Zeile je Charge `{ charge_id, studio_id, nr_von, nr_bis, menge, zeitpunkt }`, geschrieben mit
  Schreibschleife + `fsync` VOR dem Datenbank-COMMIT (`core/qr-token.js:612`, `charge_id` vorab per `nextval`).
  `hoechsteVergebeneLesen()` zählt Zeilen, die kein JSON sind oder keine ganzzahligen `nr_bis`/`studio_id` tragen, als
  `kaputteZeilen` — GLOBAL, keinem Studio zugeordnet.
- Reparaturweg heute: keiner. Die Fehlermeldung verweist auf Abgleich und „reparieren oder entfernen“ — also Editieren
  einer Datei, an die sonst nur angehängt wird.

## Soll

1. **Zuordnung kaputter Zeilen** (`hoechsteVergebeneLesen`): eine kaputte Zeile, aus deren Rohtext sich `"studio_id":<zahl>`
   eindeutig lesen lässt (Feldreihenfolge des Schreibers: `charge_id`, `studio_id`, `nr_von`, …), zählt als kaputt NUR für
   dieses Studio; nicht zuordenbare zählen weiter für alle. Rückgabe zusätzlich `kaputteDetails: [{ zeile, roh_sha256,
   studio_id|null, charge_id|null, nr_von|null }]`.
2. **Korrekturzeile, nie Löschen**: neue Zeilenform im selben Journal, angehängt mit derselben Schreibschleife + `fsync`:
   `{ typ: "korrektur", ersetzt_zeile: N, roh_sha256: "<sha256 der kaputten Rohzeile>", studio_id, nr_von, nr_bis,
   quelle: "<Beleg>", durch: "<wer>", zeitpunkt }` bzw. `{ typ: "verworfen", ersetzt_zeile: N, roh_sha256, studio_id,
   grund, durch, zeitpunkt }`. `hoechsteVergebeneLesen` wertet eine kaputte Zeile als ERLEDIGT, wenn eine Korrektur- oder
   Verwerfen-Zeile mit derselben Zeilennummer UND demselben `roh_sha256` existiert (Zeilennummer allein reicht nicht). Eine
   Korrekturzeile zählt mit ihrer Spanne wie eine normale Zeile (höchste vergebene Nummer, Spannen je Block).
3. **Werkzeug** `tools/qr-journal.js` (Aufruf auf dem Server, Muster `tools/qr-charge.js`):
   - `zeigen`: jede kaputte Zeile mit Nummer, Rohtext (gekürzt), lesbaren Bruchstücken, den Nachbarzeilen desselben
     Studios (die folgende Zeile begrenzt `nr_bis` nach oben) und dem Abgleich: gibt es `qr_charge` mit dieser `charge_id`
     (nach einem Zurückspielen evtl. nicht)? Welche Nummern belegen die Druckdaten auf der Platte (Executer ermittelt, wo
     Druckdaten/Bestellungen die Spannen AUSSERHALB der Datenbank festhalten — `routes/admin/qr-druckdaten.js`, PDF-Ablage,
     Bestell-Mails — und nennt je Quelle, ob sie ein Zurückspielen überlebt)?
   - `korrigieren --zeile N --von A --bis B --quelle "<Beleg>"`: schreibt NUR mit `--ja`; ohne `--ja` zeigt es, was es
     schreiben würde (Trockenlauf). Prüft vorher: `roh_sha256` passt zur Zeile N; A ≤ B; die Spanne liegt im Block des
     Studios; sie überschneidet keine lesbare Zeile eines ANDEREN Studios; sie ist nicht kleiner als das, was die Bruchstücke
     belegen (`nr_von` aus dem Rohtext). Verstoss → Abbruch mit Grund, nichts geschrieben.
   - `verwerfen --zeile N --grund "<text>"`: nur, wenn das Werkzeug belegen kann, dass die Zeile nie vergeben wurde (keine
     `qr_charge` mit dieser `charge_id` UND die Datenbank liegt NICHT hinter dem Journal UND keine Druckdaten zur
     `charge_id`); sonst Abbruch mit „nicht belegbar — korrigieren statt verwerfen“. Mit `--ja`.
   - Jede geschriebene Zeile zusätzlich als Audit-Glied im Studio (`auditAppend`, Ereignis `qr_journal_korrektur` bzw.
     `qr_journal_verworfen`, Payload ohne Personendaten ausser `durch`).
4. **Fehlertext der Sperre** nennt den Aufruf `node tools/qr-journal.js zeigen`.

## Tests

- `hoechsteVergebeneLesen`: kaputte Zeile mit lesbarem `studio_id` sperrt nur dieses Studio; nicht lesbare alle;
  Korrektur mit passendem Hash → erledigt und Spanne zählt; Korrektur mit FALSCHEM Hash (Zeile inzwischen anders) → NICHT
  erledigt; Verwerfen-Zeile → erledigt, keine Spanne.
- Werkzeug gegen ein Wegwerf-Journal (QR_VERBRAUCH) und eine Wegwerf-DB: jede Prüfung einzeln (Hash, Block, Überschneidung,
  Untergrenze aus Bruchstück, Trockenlauf schreibt nichts — Byte-Grösse gleich, `--ja` schreibt genau eine Zeile + ein
  Audit-Glied); `verwerfen` bei vorhandener Charge / DB hinter Journal → Abbruch.
- Ende-zu-Ende: kaputte Zeile → `chargeAnlegen` wirft → `korrigieren --ja` → `chargeAnlegen` vergibt ab `B+1`.
- Gegenproben je Prüfung (entfernen → ROT), Zahlen wörtlich. Volle Suite nach Ritual.

## Fragen an die Planprüfung

- Welcher Zustand entsteht durch Korrektur- und Verwerfen-Zeilen, den es vorher nicht gab? Kann eine Korrektur eine
  Nummer freigeben, die physisch klebt? Kann ein älterer Leser (alte Programmversion, `tools/qr-charge.js` Vorschau,
  Wochenreport, `ops/qr-grabsteine-melden.js`) die neuen Zeilenformen falsch deuten?
- Welche Quelle für die echte Spanne überlebt ein Zurückspielen der Datenbank wirklich?

-- Ende des Auftrags --
