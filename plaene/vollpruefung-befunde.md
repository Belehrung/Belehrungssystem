# DeepSeek-Vollprüfung GymDocu — Befunde und Nachmessung

Plan: `plaene/deepseek-vollpruefung.md`. Stand der Prüffläche: master `221a7b2` (Lesebaum `/workspace/gymdocu-lock`),
27 Bereiche ≤ 180k Token (`scratchpad/vollpruefung/g221/liste.tsv`). Jeder Befund ist eine Behauptung, bis er hier
nachgemessen steht. Geringe Befunde gehen auf `plaene/offene-befunde-vollpruefung.md`.

## Bereich 06 (Pilot) — `routes/admin/qr-*.js`, `routes/admin/tablets.js`, `core/2fa.js` … `core/db-queue.js`

Lauf 24.09.2026 04:05–04:21 UTC, 15 Runden, 3,72 Mio. Token ein, 63.560 aus, geschätzt 5,17 $ (obere Schranke).
Abdeckung ungleich: der Bericht arbeitet sich an `qr-bestellung.js` ab; `core/auth.js`, `core/csrf-schutz.js`,
`core/bezirk-token.js`, `core/client-ip.js` nur gestreift („öffentliche Wege geprüft“).

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V06-1 | `gabEsJeBestaetigung()` ohne eigenes try/catch — ein DB-Fehler dieser Nebenabfrage lässt die ganze Vorgangsseite 500 antworten | gelesen `qr-bestellung.js:1625-1670`; der äussere catch fängt (500 + `intern()`), die Seite fällt ganz statt ohne Hinweis | gering (Modell: „sollte“) |
| V06-2 | `qr-druckdaten.js:246` `SELECT * FROM qr_charge WHERE id = $1` ohne `studio_id`, Trennung erst danach in JS | gelesen; Riegel wirkt (fremde ID → 404), Hausregel „jede Abfrage trägt studio_id“ verletzt, Schwesterdatei hat es nachgezogen | gering (Modell: „sollte“) |
| V06-3 | Modulo-Verzerrung bei Recovery-Codes (Alphabet 31 Zeichen) | **gefallen:** das Alphabet hat 32 Zeichen (`256 % 32 = 0`, nachgerechnet). Daraus ein anderer Punkt: der Kommentar „ohne … L“ stimmt nicht, `L` ist enthalten — wer es „richtig“ stellt (31 Zeichen), erzeugt genau die Verzerrung | Text |
| V06-4 | Kommentar an `vorgangNichtGefundenInhalt()`: nicht-numerische `:id` liefere dieselbe Seite — seit der ID-Wache (#470) 400 | gelesen `:781-783` | Text |
| V06-5 | `req.body.auftragsnummer` ohne Absicherung — POST ohne Content-Type lässt `req.body` in Express 5 `undefined` → 500 statt 400 | gelesen `:1891`; Express 5 setzt `req.body` nicht mehr auf `{}` | gering |
| V06-6 | Prozess-Tod zwischen `sendMail()` und dem Commit: Mail raus, Vorgang bleibt „erzeugt“, erneuter Klick bestellt doppelt | gelesen; strukturell (erst senden, dann vermerken), unbenannt | gering |
| V06-7 | `istGueltigeBestellungsform()` lässt `formate: [null]` durch → `baueBestelltext()` wirft → Ergebnis/PDF dauerhaft 500 | gelesen `:599-601`, `:524`; nur über eine von Hand veränderte Zeile | gering |
| V06-8 | `GET /qr/kleben` ohne try/catch | gelesen; der globale Fehlerbehandler (`server.js:1467`) fängt — nur Abweichung vom Dateimuster | Anmerkung |
| V06-9 | „keine Token“/„unbekanntes Format“ antworten 500, obwohl der Kommentar sagt „kein Datenbankfehler“ | gelesen `qr-druckdaten.js:361-366` | Anmerkung |

9 Befunde, 8 getragen, 1 gefallen; nichts Blockierendes, nichts zur Mandantentrennung mit Leck.

## Bereich 01 — Wurzeldateien (`S20-migrate.js`, `server.js`, `golive-studio.sh` …), `routes/admin.js` … `routes/belehrungen.js`

Lauf 24.09.2026 04:27–04:41 UTC, 10 Runden, 2,77 Mio. Token ein, 61.237 aus, geschätzt 3,90 $. Erster Versuch vom
Geheimnis-Riegel abgebrochen (nichts gesendet): Platzhalter `postgresql://postgres:PW@…` in einem Kommentar von
`S20-migrate.js:81` — im Material geschwärzt, Repo unverändert.
**Kosten GEMESSEN über das Guthaben:** 39,84 $ (04:24, nach Bereich 06) → 39,50 $ (04:42, nach Bereich 01) = **0,34 $**
für einen Lauf, den das Werkzeug auf 3,90 $ schätzt. Die Schätzung ist eine obere Schranke ohne Cache-Rabatt.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V01-1 | `S20-migrate.js` REPLACE löscht für das Studio aus JEDER Tabelle mit `studio_id` — auch aus zentral entstandenen (QR-Nummernbuch, Bestellungen, Audit, PDF-Jobs), die der Import nie zurückbringt; `golive-studio.sh` setzt `REPLACE=1` bei jedem Lauf, ein zweiter Go-Live-Versuch nach committetem ersten träfe sie | gelesen `S20-migrate.js:289-297`, `golive-studio.sh:61` | mittel — hängt daran, ob noch Studios umziehen (Modell: blockierend) |
| V01-2 | `setval` ist nicht transaktional: nach PROBELAUF oder zurückgerollter Kettenprüfung bleiben hochgezogene Sequenzen; „Ziel-DB byteidentisch“/„NICHTS geschrieben“ (`S20:87/108/460`, `golive-studio.sh:69-71`) stimmt nicht. Folge u. a.: zentral danach vergebene IDs können im Offset-Fenster eines später wirklich importierten Studios landen | gelesen `:400-404`; PostgreSQL-Verhalten bekannt | gering |
| V01-3 | leeres `catch` um `setval` verschlucke Fehler bei Tabellen ohne Sequenz | **gefallen:** `setval` ist strikt, `setval(NULL, …)` liefert NULL ohne Fehler (gemessen, `proisstrict = t`); ein echter Fehler bricht die Transaktion ab, die Kettenprüfung danach scheitert → ROLLBACK, exit 1 (nur mit irreführender Meldung) | — |
| V01-4 | `/admin/archiv/neu-single`: DELETE und INSERT in `pdf_archiv` als zwei Autocommits — scheitert der INSERT, ist der Archiv-Eintrag samt Download-Token und `pdf_hash` weg | gelesen `routes/archiv.js:1043-1054`; der Monatslauf macht es in einer Transaktion | mittel |
| V01-5 | 413-Meldung nennt „25 MB“, die Parser-Grenzen sind 1 MB bzw. 4 MB | gelesen `server.js:1471-1481`, `upload-limit-waechter.js:66` | gering (Text) |
| V01-6 | `dbDatum` der Unterschrift (geht in `signatur_hash`), Dateiname und PDF-Text aus prozess-lokaler Zeit — auf einem UTC-Prozess UTC statt Berlin | gelesen `routes/belehrungen.js:859-860, 911-912, 925-928`; Prozess-Zeitzone des Servers unbelegt | gering |
| V01-7 | `datumPlusTage()` rechne auf dem falschen Tag (22–24 UTC) | **gefallen wie behauptet:** addiert wird auf einem absoluten Zeitpunkt, gelesen in Berlin — richtig. Rest: nur wenn die Addition eine Zeitumstellung überquert UND der Prozess auf UTC läuft, in einer Stunde Fenster | — (Rest: Anmerkung) |
| V01-8 | Monatsmail markiert `mail_gesendet` für ALLE Zeilen des Monats, auch nicht enthaltene Typen | gelesen `generateMonthlyPDFs.js:342-345` | gering |
| V01-9 | Overlap-Guard nur für `OFFSET > 0` | gelesen `S20:224` | Anmerkung |
| V01-10 | `INSERT INTO studios … ON CONFLICT DO NOTHING`: eine falsch übergebene, schon belegte `STUDIO_ID` importiert unter das fremde Studio | gelesen `S20:302-304` | gering (Fehlbedienung, Folge Mandantenvermischung) |
| V01-11 | `/admin/archiv/mail/:monat` ungeprüft und unescaped ins Mail-HTML — `core/eingabe-pruefung.js:137` nennt es selbst „benannte Lücke“ | gelesen | gering |

11 Befunde, 9 getragen, 2 gefallen.

## Bereich 02 — `routes/betriebszeiten.js` … `routes/pdf-waechter.js` (15 Dateien)

Lauf 24.09.2026 04:45–05:05 UTC, 11 Runden, 3,25 Mio. Token ein, geschätzt 4,52 $.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V02-1 | `/pdf`-Wächter dekodiert einmal; doppelt kodiertes `..` (`%252e%252e`) komme durch, `express.static` dekodiere ein zweites Mal → fremdes Studio-PDF (Modell: blockierend) | **gefallen, gemessen** (`scratchpad/vollpruefung/probe_doppelt.js`, echte Kette `pdfWaechter` + `express.static` aus dem Bestand): `/pdf/7/%252e%252e/5/geheim.pdf` → **404**, ebenso `..%252f` und `%252e%252e%252f`; einfach kodiert → 400; fremd → 403; eigenes → 200. Positivkontrolle: ein Ordner mit dem WÖRTLICHEN Namen `%2e%2e` wird über `%252e%252e` ausgeliefert (200) — `send` dekodiert also genau einmal, wie der Wächter. Rest: der Test kennt diesen Eingang nicht | — (Rest: Testfall ergänzen, gering) |
| V02-2 | Getränkeanlage löschen: hartes `DELETE`, `getraenkeanlage_reinigungen` hängt mit `ON DELETE CASCADE` daran — unterschriebene Reinigungsnachweise verschwinden ohne Audit; die Oberfläche sagt „Reinigungsnachweise bleiben erhalten“ | gelesen `routes/getraenkeanlage.js:517, 595-602`, `core/db.js:1950/1967`; keine Migration ändert die FK (anders als 0056 für die Wartung) | **mittel** (Unwiderrufliches, falsche Zusage) |
| V02-3 | `konfigNeueste()`/`konfigFuerTag()` schlucken DB-Fehler und liefern `DEFAULT_CONFIG` — Betriebstage „alle offen“ im Monats-PDF, stilles Editor-Formular; der Kommentar behauptet das Gegenteil | gelesen `routes/betriebszeiten.js:107-120`; im Repo schon als offen geführt (`docs/offene-befunde-31-08-2026.md`) | mittel (bekannt) |
| V02-4 | Doppelter Reinigungs-POST (`ON CONFLICT DO NOTHING`) meldet trotzdem „gespeichert“ | gelesen `getraenkeanlage.js:401-420` | gering |
| V02-5 | Lageplan-Positionen: `parseFloat` ohne `isFinite` — `NaN` geht in INSERT/UPDATE (je nach Spaltentyp 500 oder gespeichertes `NaN`) | gelesen `routes/lageplan.js:824-827, 844-847` | gering |
| V02-6 | negatives `intervall_tage` wird gespeichert → Aufgabe dauerhaft überfällig | gelesen `getraenkeanlage.js:620-621` | gering |
| V02-7 | `?ids=` ohne Obergrenze → 22003, still verschluckt | gelesen (nicht gemessen) | Anmerkung |
| V02-8 | `execFileSync("pdftoppm")` blockiert den Prozess bis 15 s je Upload | gelesen | Anmerkung |
| V02-9 | Health: jeder Teilausfall meldet `db:false` | gelesen `health-intern.js:241-243` | Anmerkung |
| V02-10 | Ferien-/Ausnahmedaten nur formal geprüft (`2026-99-99` wird gespeichert) | gelesen | Anmerkung |

10 Befunde, 9 getragen, 1 gefallen (der als blockierend eingestufte).
