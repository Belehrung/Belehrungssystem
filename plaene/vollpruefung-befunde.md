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

## Bereich 08 — `core/hilfe-texte.js` … `core/pdf-dokument-erzeugen.js` (27 Dateien)

Lauf 24.09.2026 04:45–05:02 UTC, 28 Runden, 6,98 Mio. Token ein, geschätzt 9,47 $. Guthaben 05:03: 38,67 $
(−0,83 $ seit 04:42 für die Bereiche 02 und 08 plus angelaufene 03/09).

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V08-1 | `ladeStand()` im Jahres-Check: `MAX(geprueft_durch)` ist das Text-Maximum aller Namen, nicht der Name der jüngsten Bestätigung; der Test hat nur EINE Zeile und kann das nicht sehen | gelesen `core/jahrescheck.js:279`; Schwesterfunktion `:455` macht es mit `DISTINCT ON` richtig | gering (Feld heute ohne Anzeige) |
| V08-2 | `nachtragBanner()` schlägt im Wörterbuch auch geerbte Eigenschaften nach — `?nachtrag=constructor` rendert `function Object() { [native code] }` und unterdrückt den „Gespeichert“-Banner; der Kommentar sagt „liefert nur vorformuliertes HTML“ | **gemessen:** `nachtragBanner(true,"constructor")` → `function Object() { [native code] }`, `"__proto__"` → `[object Object]`; kein fremder Text im HTML (kein XSS) | gering |
| V08-3 | OneDrive-Anfragen ohne Zeitlimit | gelesen `core/onedrive.js:32-97`; Backend heute nicht aktiv | Anmerkung |
| V08-4 | Korrekturblatt: fehlt die Datei zum DB-Eintrag, wird sie nie neu erzeugt, der Worker endet still | gelesen `core/korrektur-pdf.js:128-144`, `workers/pdf-job-worker.js:23` | gering |
| V08-5 | `hilfeButton(key, position)` liest `position` nie | gelesen `core/hilfe-texte.js:1630` | Anmerkung |
| V08-6 | `ladeMonatliche()` lädt Protokolle auch für Nicht-Pflichteinträge | gelesen, nicht gemessen | Anmerkung (Leistung) |

6 Befunde, 6 getragen, 0 gefallen.

## Bereich 09 — `core/pdf-engine.js` … `core/sichtpruef-anweisungen.js` (21 Dateien)

Lauf 24.09.2026 05:03–05:15 UTC, 11 Runden, 2,95 Mio. Token ein, geschätzt 4,07 $.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V09-1 | QR-Vergabe: kaputte Zeilen im Verbrauchsjournal lösen nur einen Alarm aus; fail-closed greift erst, wenn das Journal GAR NICHTS Brauchbares liefert. Ist genau die höchste Zeile des Studios kaputt UND die Datenbank zurückgespielt, vergibt `chargeAnlegen()` Nummern, die schon verklebt sind (Modell: blockierend) | gelesen `core/qr-token.js:391-455` — Weg belegt: `kaputteZeilen > 0` → nur `vorfall()`, `hoechste = max(dbMax, journal.hoechste)`. Doppelter Fehlerfall (Journalschaden + Rückspielen). Abwägung: `kaputteZeilen` zählt über die GANZE Datei — fail-closed bei jeder kaputten Zeile sperrte jede Vergabe aller Studios, schon nach einer beim Absturz abgeschnittenen letzten Zeile | **mittel, Entscheidung** (Unwiderrufliches gegen Verfügbarkeit) |
| V09-2 | Sperr-Sichtkontrollen im Monats-PDF: Ladefehler → Abschnitt fehlt still (`catch (e) { … = []; }`), während dieselbe Datei für Betriebstage einen sichtbaren Fehlerkasten zeichnet | gelesen `core/pdf-engine.js:1218, 2308` | mittel |
| V09-3 | Echtheits-Registrierung: scheitert der INSERT in `verify_dokumente`, nur `console.error` — das PDF trägt einen Prüfcode, den `/v/<code>` nicht findet | gelesen `core/pdf-engine.js:76-84, 402-405` | mittel |
| V09-4 | `/bezirk-archiv/datei/:id` gibt das Ergebnis von `resolvePdfPfad()` ohne Wurzelprüfung an `sendFile` — ein manipulierter `dateipfad` in der DB liefert beliebige lesbare Dateien | gelesen `routes/bezirk-archiv.js:148-156`, `core/pdf-pfad.js:100-117`; setzt Schreibzugriff auf die DB voraus | gering (Tiefenstaffelung) |
| V09-5 | `validateStorageReplicate(null)` → TypeError statt ValidationError | gelesen `core/pdf-jobs.js:56-57` | gering |
| V09-6 | `pausenzeiten.pause_von/bis` dürfen NULL sein, `generatePausenPDF` ruft `.split` → ganze PDF scheitert | gelesen `core/pdf-engine.js:1260-1261`, `core/db.js:727-728` | gering |
| V09-7 | `core/pdf-engine.js` importiert aus `routes/` (Richtung core → routes, sonst im Haus ausgeschlossen) | gelesen `:442` | Anmerkung |
| V09-8 | `addPageNumbers` wirft → PDF ohne Seitenzahlen und ohne Echtheits-QR, Erfolg gemeldet | gelesen `:400-401` | gering |
| V09-9 | Detailabfrage in der Chunk×Sitzungs-Schleife | gelesen, nicht gemessen | Anmerkung (Leistung) |

9 Befunde, 9 getragen (V09-1 herabgestuft), 0 gefallen.

## Bereich 03 — `routes/qr-scan.js`, `sichtpruefung.js`, `spuelplan.js`, `tablet-sperre.js`, `verbandbuch*.js`, `verify.js` …

Lauf 24.09.2026 05:00–05:13 UTC, 10 Runden, 2,77 Mio. Token ein, geschätzt 3,87 $. Mehrere Befunde hängen an der
Prozess-Zeitzone des Live-Servers; die steht nicht im Repo (unbelegt).

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V03-1 | Weitergabe-Protokoll für Gesundheitsdaten (Verbandbuch, Art. 9 DSGVO): `INSERT INTO verbandbuch_weitergaben` in `catch (x) {}` — scheitert es, Erfolg angezeigt, kein Protokoll, kein Log | gelesen `routes/verbandbuch-admin.js:610-614, 646-650` | **mittel** |
| V03-2 | `ladeFotos()` liefert bei DB-Fehler `[]` — Defekt ohne Fotos, ohne Hinweis | gelesen `routes/sichtpruefung.js:1512-1516` | gering |
| V03-3 | Spülprotokoll ohne Doppelsende-Schutz: Doppelklick → zwei unterschriebene Protokolle, zwei Audit-Glieder, zwei PDFs | gelesen `routes/spuelplan.js:255-347` (kein `client_uuid`, anders als Verbandbuch/Sichtprüfung) | gering |
| V03-4 | Tablet-Zeiten ohne Zonenangabe mit `new Date("…T…")` in Prozesszeit geparst — Nachgetragen-Schwellen um den Berlin-Versatz verschoben, falls der Prozess auf UTC läuft | gelesen `sichtpruefung.js:2321`, `verbandbuch.js:568-573` | gering (Server-TZ unbelegt) |
| V03-5 | Eskalationsstunde aus `new Date().getHours()` (Prozesszeit) | gelesen `tablet-sperre.js:237`, `sichtpruefung.js:3658` | gering (Server-TZ unbelegt) |
| V03-6 | `/tablet/sperre` (ohne Anmeldung erreichbar): `(req.body.pin \|\| '').trim()` und `name` — `pin[]=…` liefert ein Array → TypeError → 500 und Alarmmeldung; dieselbe Klasse ist in `auth.js` (K1) und `qr-scan.js` schon behoben | gelesen `routes/tablet-sperre.js:551, 593` (kein eigenes try/catch); JS-Semantik eindeutig | gering, **Pentest-relevant** |
| V03-7 | Verbandbuch: `unfall_zeit` ohne Formatprüfung, Freitexte ohne Längengrenze | gelesen `verbandbuch.js:564` | gering |
| V03-8 | `stillstand_tage` negativ speicherbar | gelesen `spuelplan.js:267` | Anmerkung |
| V03-9 | Mitarbeiter-Zuordnung über den Namen ohne `ORDER BY` — bei Namensgleichheit nicht deterministisch | gelesen `verbandbuch.js:577-579` | Anmerkung |

9 Befunde, 9 getragen, 0 gefallen.

## Bereich 04 — `routes/wartung.js`, `routes/webhooks.js`, `routes/admin/{audit,ausmusterung,dashboard,einrichtung,einstellungen,geraete-typen}.js`

Lauf 24.09.2026 05:15–05:35 UTC, 18 Runden, 3,93 Mio. Token ein, geschätzt 5,50 $. Befunde 1, 2, 3, 7, 13 an den
genannten Zeilen selbst gelesen; die übrigen sind Anmerkungen, am Code plausibel, nicht einzeln gemessen.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V04-1 | Fachfirma-Prüfdatum nur per Regex geprüft — `2026-02-30`/`0000-01-01` gespeichert, Fälligkeit rollt still | gelesen `routes/wartung.js:1103-1104` | gering |
| V04-2 | Nach erfolgreichem Commit wirft die PDF-Erzeugung → „Fehler beim Speichern“; Wiederholung erzeugt eine zweite Prüfzeile und doppelten Sperrgrund | gelesen `:1524-1531` (Meldung unabhängig von `gespeichert`) | **mittel** |
| V04-3 | Dashboard: `getDieseWocheFaellig()` in `catch (e) {}` — DB-Fehler wird „Alles im grünen Bereich“ | gelesen `routes/admin/dashboard.js:206` | mittel |
| V04-4 | Fälligkeitsrechnung am Monatsersten falsch bei Prozess-TZ WESTLICH von UTC | Mechanismus plausibel; für unseren Betrieb (UTC oder Berlin) ohne Wirkung | Anmerkung |
| V04-5/6 | DST-Randstunde bei `vor7` bzw. `bald` (±1 Tag in einer Stunde je Jahr) | gelesen | Anmerkung |
| V04-7 | Module-Einstellungen: Seil-Prüfung nach den übrigen Schreibvorgängen; `catch` meldet jede Ausnahme als „Seil-Bestätigung fehlt“ | gelesen `routes/admin/einstellungen.js:581-594` | gering |
| V04-8 | aktive Sperre im GET ohne `ORDER BY … LIMIT 1` | nicht gemessen | Anmerkung |
| V04-9 | `ensureWartungHashSpalte()` sichert nichts (Name verspricht es) | nicht gemessen | Anmerkung |
| V04-10 | `auditVerify` bei jedem Aufruf der Audit-Seite | nicht gemessen | Anmerkung (Leistung) |
| V04-11 | ZIP-Export: `tmpDir` im Fehlerweg nicht geräumt | nicht gemessen | Anmerkung |
| V04-12 | `pdf_download_bestaetigt` vor `res.download()` gesetzt (im Code selbst eingeräumt) | — | Anmerkung |
| V04-13 | Kommentar „max 5 Versuche“, Code macht 6 Anfragen | gelesen `routes/webhooks.js:78-86` | Text |
| V04-14 | `confirmActivation`: `https.request` ohne Zeitlimit, Antwort nicht verbraucht | nicht gemessen | Anmerkung |
| V04-15 | Magicline-Upsert ohne ID und E-Mail legt je Ereignis einen neuen Mitarbeiter an | Weg im Code; ob Magicline so sendet: unbelegt | Anmerkung |
| V04-16 | `resetMagiclineConfig` schluckt DELETE-Fehler | nicht gemessen | Anmerkung |
| V04-17 | Bericht-Spalten von `wartung_pruefungen` nur per Migration, nicht selbstheilend im SCHEMA | nicht gemessen; praktisch unerreichbar | Anmerkung |

17 Befunde, 17 getragen (5 gelesen, 12 als Anmerkung ohne Einzelmessung), 0 gefallen.

## Bereich 10 — `core/signaturbild.js` … `core/zustaendigkeit.js`, `ops/*` (49 Dateien)

Lauf 24.09.2026 05:15–05:30 UTC, 10 Runden, 2,90 Mio. Token ein, geschätzt 4,04 $. Im Material geschwärzt: ein
Kommentar-Beispiel `https://md001.gymdocu.de:1@evil.com` (Geheimnis-Riegel), der Prüfer sah dort `[zugang-geschwaerzt]`.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V10-1 | `gymdocu-wiederherstellen.sh --zeitpunkt`: mit `recovery_target_inclusive = on` spiele PostgreSQL die erste Transaktion NACH dem Ziel mit ein, der K2-Wächter breche deshalb jeden Zeitpunkt-Restore ab (Modell: blockierend) | **gefallen**, am Quelltext von PostgreSQL 16 (`xlogrecovery.c`, `recoveryStopsBefore`, geholt aus `REL_16_STABLE`): für Zeitziele gilt mit inclusive `stopsHere = recordXtime > recoveryTargetTime`, `recoveryStopAfter = false` — angehalten wird VOR dem ersten Commit nach dem Ziel. `audit_log.zeit` wird vor dem Commit geschrieben, liegt also nie über dem Commit-Zeitpunkt. Nicht durch einen echten PITR-Lauf gemessen | — |
| V10-2 | Signaturprüfung: ein einziges schwarzes Pixel gilt als Unterschrift (keine Untergrenze) — derselbe Trust-Boundary-Weg (CWE-501/602), den das Modul schliessen soll | **gemessen** mit `pruefeSignaturbild()` aus dem Bestand: 1×1 schwarz → akzeptiert (`tintenPixel 1`), 3×3 schwarz → akzeptiert; 1×1 weiss → abgelehnt (Positivkontrolle) | **mittel, Pentest-relevant** |
| V10-3 | `upsertReplica()` setzt `attempts` bei neuem Inhalt nicht zurück — nach einem früheren `dead` scheitert die neue Dateiversion beim ersten Fehler endgültig, still | gelesen `core/storage-replica.js:108-121` (master und Zweig `fix-nachweis-unlink` gleich) | mittel |
| V10-4 | `monitoring-alert.sh`: fehlender Restore-Bericht (`unknown`) zählt als „ok“ | gelesen `ops/monitoring-alert.sh:59-60, 109-111` | gering |
| V10-5 | Zuständigkeit bei gemischter DGUV-V3-Externlage nur einer Partei zugeschrieben | nicht gemessen | Anmerkung |
| V10-6 | Steckbrief-Ladefunktionen verschlucken DB-Fehler (im Code als offen benannt); Kommentar „alle Aufrufer in try/catch“ stimmt für zwei Admin-Aufrufer nicht | nicht gemessen | Anmerkung |

6 Befunde, 5 getragen, 1 gefallen (der als blockierend eingestufte).

## Bereich 11 — `ops/schluessel-rotieren.js` … `tools/*`, `workers/*`, `migrations/*` (71 Dateien)

Lauf 24.09.2026 05:30–05:45 UTC, 15 Runden, 3,88 Mio. Token ein, geschätzt 5,35 $.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V11-1 | `qr-charge.js liste` ende bei null Chargen mit Exit 1, weil `[]` falsy sei | **gefallen:** `[]` ist in JavaScript truthy (`[] ? 0 : 1` → 0, gemessen) | — |
| V11-2 | Performance-Seed schreibt `pdf_archiv.monat` als `MM/YYYY` statt `YYYY-MM` | gelesen (Entwicklerwerkzeug) | gering |
| V11-3 | Fehlermeldung „+15% Aufschlag“, gerechnet wird ×1,30 | gelesen `tools/aufkleber.js:2097-2099` | Text |
| V11-4 | `schluessel-rotieren.js --wirklich` meldet bei leerer `studios`-Tabelle „COMMIT abgeschlossen“ | nicht gemessen | Anmerkung |
| V11-5 | `staging-smoke.sh`: Produktions-`.env` ohne `PDF_ROOT` → „getrennte PDF_ROOT-Pfade“ PASS ungeprüft | nicht gemessen | gering (grün aus falschem Grund) |
| V11-6 | PDF-Worker: DB-Fehler in `claim`/`retry`/`deadLetter` beendet den Prozess (nur pm2 holt ihn zurück) | nicht gemessen | Anmerkung |
| V11-7 | `syntax-check.sh`: `xargs` ohne `-r` — findet `find` nichts, läuft `node --check` einmal auf leerer Eingabe und meldet Erfolg | **gemessen:** leere Eingabe → `xargs -0 -n50 node --check` Exit 0 | gering (grün aus falschem Grund) |
| V11-8 | `ausmusterung-gegenproben.js`: nicht auswertbare Zählzeile (`fail === null`) wird als „NICHT GEFANGEN“ gemeldet statt als „nicht auswertbar“ | nicht gemessen | Anmerkung |
| V11-9 | `befehlAnlegen`: Studio-Lookup ausserhalb des try — Kopfkommentar verspricht „keine rohe Exception“ | nicht gemessen | Anmerkung |

9 Befunde, 8 getragen (2 gemessen, 1 gelesen, 5 Anmerkungen ohne Einzelmessung), 1 gefallen.

## Bereich 05 — `routes/admin/geraete.js`, `lexikon.js`, `mitarbeiter.js`

Lauf 24.09.2026 05:35–05:50 UTC, 7 Runden, 1,76 Mio. Token ein, geschätzt 2,56 $.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V05-1 | ID-Wache fehle an den harten Lösch-Routen und am Spülstellen-Toggle (`0x10` → Gerät 16) | **gefallen:** `routes/admin/geraete.js` registriert seine Routen auf DEMSELBEN Router, an dem `routes/admin.js:11` die zentrale Wache (`wacheIdParameter`, #470) für `:id` setzt; gemessen `istGueltigeId`: `0x10`/`1e3`/`2abc` → false, `16` → true | — |
| V05-2 | Mitarbeiter hart löschen: DELETE in `db.tx`, `auditAppend` danach AUSSERHALB und ohne try — scheitert das Protokoll, ist die Person gelöscht ohne Glied in der Audit-Kette; die Wartungs-Löschwege machen es in einer Transaktion | gelesen `routes/admin/mitarbeiter.js:1068-1082` | **mittel** (append-only) |
| V05-3 | CSV-Import: `norm2Date` prüft keinen Kalendertag — `31.02.2026` landet als `2026-02-31` in `naechste_faelligkeit` | gelesen `geraete.js:5916-5927` | gering |
| V05-4 | Import-Schreibdurchlauf zählt DB-Fehler nur (`nFehler++`), ohne Log/`melde()` | nicht gemessen | gering |
| V05-5 | Freischaltungs-Aufräumen beim Mitarbeiter-Löschen in leerem `catch` | nicht gemessen | gering |
| V05-6 | CSV-Import: Rennen zwischen Vorzählung und Schreiben kann ein Gerät ohne `durchfuehrung` anlegen | nicht gemessen; enges Fenster | gering |
| V05-7 | Z2-Sollwert in `test_feature_ladebestand_streng.js` aus derselben Quelle wie der geprüfte Weg (im Test als bewusst benannt) | nicht gemessen | Anmerkung |

7 Befunde, 6 getragen, 1 gefallen (durch #470 schon geschlossen).

## Bereich 12 — `public/offline-queue.js`, `public/qr-kamera-scan.js`, `e2e/*`, `test/*`-Helfer (58 Dateien)

Lauf 24.09.2026 05:52–06:25 UTC, 10 Runden, 2,18 Mio. Token ein, geschätzt 3,14 $. Im Material geschwärzt: zwei
Test-Verbindungszeichenfolgen.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V12-1 | Offline-Warteschlange: Foto-Antwort `409 {ok:false, code:'geschlossen'/'max'}` ist ein Endzustand, `fotosNachziehen` kennt nur `ok`/`kaputt`/`auth` → Eintrag bleibt für immer „offen“, Wiederholung alle 60 s, Badge verspricht Übertragung | gelesen `public/offline-queue.js:144-174`, Server `routes/sichtpruefung.js:3311, 3318` | **mittel** |
| V12-2 | Nach erfolgreichem Live-Senden mit Fotos bleibt ein leerer „offen“-Eintrag, Badge zeigt „wartet auf Übertragung“ | nicht gemessen | gering |
| V12-3 | E2E „öffentliche Prüfung bleibt datensparsam“: nur `not.toContain`, kein Status, kein positiver Anker — ein 500er der Route lässt den Test grün | gelesen `e2e/gymdocu.spec.js:187-191` | **mittel** (grün aus falschem Grund) |
| V12-4 | `test/e2e-durchlauf.js`: Archiv-Monat aus Prozesszeit, Soll aus demselben Datenfluss | nicht gemessen | gering |
| V12-5 | `test/e2e-durchlauf.js` schreibt ohne `PDF_ROOT`/`BELEHRUNGEN_UPLOAD_DIR` in die Repo-Bäume (nicht Teil von `run.sh`) | nicht gemessen | gering |
| V12-6 | `utcJetzt()` liefert Berliner Zeit (Name falsch) | — | Text |
| V12-7 | `gdSyncQueue`/`gdVerwerfen` ohne `catch` an der IndexedDB-Kette | nicht gemessen | gering |
| V12-8 | veralteter Scan-Tick stoppt seinen Stream nicht (Weg über die Oberfläche unbelegt) | — | Anmerkung |

8 Befunde, 8 getragen (2 gelesen, Rest ohne Einzelmessung), 0 gefallen.
