# Zustandsprüfung V01-6 … V04-4..17 am Stand master 9ad8acd

## Ergebnistabelle

| Kennung | besteht | Einstufung | Kernbeleg Datei:Zeile | Behebung (≤20 W.) | Risiko der Behebung (≤12 W.) |
|---|---|---|---|---|---|
| V01-6 | ja | sollte (Betreiber: Server-TZ messen) | routes/belehrungen.js:950-951 | Berliner Zeit (Intl) für dbDatum, PDF-Text, Dateiname | Alt-signatur_hash/Dateinamen ändern sich |
| V01-7r | ja (Rest) | Anmerkung | generateMonthlyPDFs.js:52-56; routes/archiv.js:1180-1189 | datumPlusTage auf plusTage(heuteBerlinStr,n) umstellen | wirft bei ungültigem Config-Wert |
| V01-8 | ja | Anmerkung | generateMonthlyPDFs.js:467-470 | UPDATE auf tatsächlich erstellte Typen begrenzen | Badge bleibt dauerhaft "ausstehend" |
| V02-2 | nein | erledigt | getraenkeanlage.js:889-914; migrations/0062 | — | — |
| V02-3 | nein | erledigt | betriebszeiten.js:143-158 | — | — |
| V02-4 | ja | Anmerkung | getraenkeanlage.js:558-583 | eingefuegt==null eigenständig beantworten/auditieren | Statuscode bzw. Antworttext ändert sich |
| V02-5 | ja | sollte | lageplan.js:934-937, 954-957 | Number.isFinite-Riegel vor Math.max/min | 400 statt bislang stillem Datensatz |
| V02-6 | ja | sollte | getraenkeanlage.js:1006; core/db.js:2035 | intervall_tage auf 1..365 prüfen (+CHECK) | Altbestand vs. CHECK, NOT VALID nötig |
| V02-7 | teilweise | Anmerkung | lageplan.js:525,531-538; sichtpruefung.js:3599-3603 | int4-Obergrenze; leeren catch melden | mehr sichtbare Fehler statt stillem Redirect |
| V02-9 | nein | erledigt | health-intern.js:232-256 | — | — |
| V02-10 | ja | Anmerkung | betriebszeiten.js:511-514, 519 | istGueltigesKalenderdatum ergänzen | Altwerte verschwinden still beim Speichern |
| V03-1 | nein | erledigt | verbandbuch-admin.js:628-638, 675-681 | — | — |
| V03-2 | nein | erledigt | sichtpruefung.js:1567-1584 | — | — |
| V03-3 | ja | sollte | spuelplan.js:370-373; core/db.js:2098 | client_uuid + Idempotenz wie Verbandbuch | Migration, Replay-Semantik offen |
| V03-4 | ja | Betreiber (TZ messen) | verbandbuch.js:649-655; sichtpruefung.js:2421-2431 | Tablet-Zeiten explizit als Berlin interpretieren | DST-Grenzfälle, Test-Sollwerte brechen |
| V03-5 | ja | Betreiber (TZ messen) | tablet-sperre.js:259; sichtpruefung.js:3831 | Intl-Stunde Europe/Berlin statt getHours() | Eskalationszeitpunkt verschiebt sich |
| V04-1 | nein | erledigt | wartung.js:1285-1294 | — | — |
| V04-4..17 | unklar/teilweise | Betreiber (Liste nachführen) | V04-2 wartung.js:1785ff; V04-3 dashboard.js:207ff; V04-4≈wartung.js:341-358 | Quelle wiederherstellen, dann Einzelprüfung | ohne Quelle blind, nicht raten |

---

## Einzelheiten

**V01-6 — Unterschriftsdatum aus prozess-lokaler Zeit — besteht.**
Beleg: `routes/belehrungen.js:950-951`: ``const _ts = new Date(); const dbDatum = `${_ts.getFullYear()}-…${_ts.getHours()}…` ``; dieser Wert geht in das INSERT (Z. 962), in den `signaturHash` (Z. 1037) und der PDF-Text/Dateiname nutzen ebenso Prozesszeit (`jetzt.toLocaleDateString('de-DE')` Z. 1002, `datumStr`/`zeitStr` Z. 1015-1018). Zustand: Läuft der Live-Prozess auf UTC, trägt ein um 00:30 Berlin unterschriebener Nachweis das Datum des Vortags — im PDF-Text, im Dateinamen und festgeschrieben im `signatur_hash`. Behebung: Berliner Datum/Uhrzeit über `formatBerlinDate()`/`Intl` mit `timeZone:'Europe/Berlin'` bilden (nur `routes/belehrungen.js`, Funktionen `sendeUnterschrift`-Block). Risiko: Bestehende Hash-Verifikationen und Dateinamen ändern ihr Format. Test: TZ=UTC starten, Systemzeit 2025-12-31T23:30Z, POST `/api/unterschreiben` → erwartet `datum` "2026-01-01 00:30:00"; Sollwert aus Europe/Berlin von Hand. Einstufung: sollte; die Server-TZ-Frage gehört dem Betreiber (wie V03-4/5).

**V01-7r — Rest bei Zeitumstellung auf UTC-Prozess — besteht.**
Beleg: `generateMonthlyPDFs.js:52-56`: `const d = new Date(); d.setDate(d.getDate() + parseInt(tage, 10)); return formatBerlinDate(d);` — dieselbe Bauart in `routes/archiv.js:1180-1189`. Zustand (nur UTC-Prozess, 1-h-Fenster): 24.10.2026 22:30Z = 25.10. 00:30 Berlin; `setDate(+1)` ergibt 25.10. 22:30Z = 25.10. 23:30 MEZ → `formatBerlinDate` liefert 25.10., richtig wäre 26.10. Der Download-Token (`datumPlusTage(linkTage)`) verfällt dann einen Tag zu früh. Behebung: `plusTage(heuteBerlinStr(), tage)` aus `core/datum.js` (existiert, Export Z. 261) verwenden. Risiko: plusTage wirft bei nicht-numerischem Config-Wert. Test: vm-Extraktion der Funktion, TZ=UTC, fixe Zeit 2026-10-24T22:30Z → erwartet "2026-10-26" (Berliner Kalender, Handrechnung). Einstufung: Anmerkung.

**V01-8 — `mail_gesendet` für nicht enthaltene Typen — besteht.**
Beleg: `generateMonthlyPDFs.js:467-470`: `UPDATE pdf_archiv SET mail_gesendet = 1, mail_gesendet_am = … WHERE studio_id = $1 AND monat = $2` — ohne `typ`-Einschränkung. Anzeige-Verbraucher: `routes/archiv.js:329-331` („Mail gesendet"). Zustand: Existiert eine (alte) pdf_archiv-Zeile eines Typs, dessen Modul im aktuellen Lauf fehlschlug (`fehlgeschlagene`), meldet das Archiv „Mail gesendet", obwohl dieses PDF nicht in der Mail war. Behebung: `AND typ = ANY($3)` mit den `erstellte`-Typen. Risiko: Typen bleiben dauerhaft „ausstehend" (kein Nachholweg für das Flag). Test: Modulfehler stubben, `sendeArchivMail` stubben, danach `SELECT mail_gesendet` für den fehlgeschlagenen Typ → erwartet 0; Sollwert = Liste der im Test simulierten Module (von Hand). Einstufung: Anmerkung.

**V02-2 — Löschen reißt Reinigungsnachweise mit — BEHOBEN.**
Behebung: `routes/getraenkeanlage.js:886-907` zählt in der auditTx und legt bei vorhandenen Nachweisen still statt zu löschen („C3a-5 … Reinigungen vorhanden -> stilllegen statt löschen"); Migration 0062 stellt den FK auf `ON DELETE RESTRICT` um (Z. 121-127), 0065 ergänzt zusammengesetzte RESTRICT-FKs; der 23503-Rückfallweg (Z. 924-935) legt ebenfalls nur still. Der zugesagte UI-Text („sie bleiben erhalten", Z. 602) sagt jetzt die Wahrheit. Restzustand: Anlagen mit Nachweisen sind nie hart löschbar — gewollt. Einstufung: erledigt.

**V02-3 — DB-Fehler → stille Standardkonfiguration — BEHOBEN.**
Beleg: `routes/betriebszeiten.js:143-158` — der frühere `try/catch` ist entfernt: „C2/V02-3 (25.09.2026): der `try { … } catch (e) {}` ist ENTFERNT — ein DB-Fehler wirft jetzt." `konfigNeueste()`/`konfigFuerTag()` geben DEFAULT_CONFIG nur noch bei fehlender Konfiguration zurück. Kaputtes JSON bleibt Notbehelf, ist aber sichtbar: `console.error` + `melde()` + `_konfigUnlesbar` (Z. 100-116, gedrosselt). Einstufung: erledigt (Rest: Editor-Hinweis nur im Editor).

**V02-4 — doppelter Reinigungs-POST meldet „gespeichert" — besteht.**
Beleg: `routes/getraenkeanlage.js:558-567` `INSERT … ON CONFLICT … DO NOTHING RETURNING id`; `if (eingefuegt) { auditAppend }` (Z. 568) und `return { grund: null }` (Z. 574) → Z. 583 `return erfolgAntwort()` („Reinigung gespeichert.", Z. 512-513). Zustand: Beim Doppelklick/Replay mit identischem `signatur_hash` entsteht keine zweite Zeile (gut), aber der zweite Vorgang erhält dieselbe Erfolgsseite und KEIN Audit-Glied — vom Erstversand ununterscheidbar; nach unklarem Speicherstatus (Netzabbruch) kann der Nutzer nicht erkennen, ob sein Klick durchkam. Behebung: Rückgabegrund `"bereits_vorhanden"` und eigene Antwort („war bereits gespeichert"), optional Audit-Glied. Risiko: geänderter Antworttext/ggf. Statuscode — UI- und Testerwartungen anpassen. Test: zweimal identischer POST → zweite Antwort signalisiert „bereits vorhanden"; Sollwert: Idempotenzvertrag der Route, von Hand als Texterwartung. Einstufung: Anmerkung.

**V02-5 — `parseFloat` ohne `isFinite` — besteht.**
Beleg: `routes/lageplan.js:934-937`: `const x = Math.max(0, Math.min(100, parseFloat(x_prozent)));` — `Math.max(0, NaN)` ist NaN; ebenso Z. 954-957. Die Spalten sind `REAL NOT NULL` (`core/db.js:1963-1967`) und PostgreSQL nimmt in float4 `'NaN'` an → der Wert wird gespeichert, nicht abgewiesen. Zustand: `POST /api/position` mit `x_prozent:"abc"` legt eine Position mit NaN an (später `null` in JSON, kaputte Editor-Anzeige). Behebung: `if (![x,y,b,h].every(Number.isFinite)) return res.status(400)…` in beiden Routen (Muster wie schon Z. 868 beim Zuschneiden). Risiko: 400 statt bisher stillem (kaputtem) Erfolg — Clients müssten Fehler anzeigen. Test: POST mit `x_prozent:"abc"` → 400, keine neue Zeile; Sollwert: „nur endliche Zahlen" plus REAL-Spaltentyp (core/db.js:1963). Einstufung: sollte.

**V02-6 — negatives Reinigungsintervall — besteht.**
Beleg: `routes/getraenkeanlage.js:1006`: `parseInt(intervall_tage) || 7` — `"-5"` bleibt -5; `core/db.js:2035` (`intervall_tage INTEGER NOT NULL DEFAULT 7`) trägt keinen CHECK. Zustand: `faelligkeit()` (Z. 79-98, genutzt auch in `zaehleUeberfaelligeReinigungen`, Z. 108-117) rechnet mit negativem Intervall → Aufgabe ist dauerhaft „rot" und die Tablet-Startseite zählt sie permanent als überfällig. Behebung: Bereichsprüfung 1..365 in der Route + `CHECK` (Migration NOT VALID). Risiko: Altzeilen mit negativem Wert vs. neuer CHECK. Test: POST `/admin/getraenkeanlage/aufgabe` mit `intervall_tage:"-5"` → Ablehnung; Sollwert: Formularvorgabe `min="1"` (getraenkeanlage.js:739). Einstufung: sollte.

**V02-7 — `?ids=`-Obergrenze/Stille — teilweise behoben.**
Beleg: `routes/lageplan.js:525` begrenzt nur die ANZAHL (`.slice(0, 20)`), nicht die int4-Größe: `parseInt("99999999999")` bleibt, Z. 531/536 `id IN (…)` → 22003, und Z. 538 ist der Fehler still verschluckt (`} catch (e) {}` → leerer Redirect). `routes/sichtpruefung.js:3599-3603` filtert ebenfalls ohne int4-Obergrenze (Folgefehler dort laut, 500). Vorbild dagegen `routes/geraete-hinweisfenster.js:311-315` (`<= PG_INTEGER_MAX`, `.slice(0, IDS_MAX)`). Zustand: Ein einzelner manipulierter/vertippter `ids`-Wert lässt die Markierungs-Seite kommentarlos überspringen; in der Fotoschicht 500. Behebung: int4-Riegel wie im Hinweisfenster + `catch` → `melde()`/Log statt leer. Risiko: statt stillem Redirect ggf. sichtbare Fehlerseite. Test: GET `/module/lageplan/markieren?ids=99999999999` → Abfrage wird gefiltert, kein 22003; Sollwert PG_INTEGER_MAX=2147483647 (Hausstandard, geraete-hinweisfenster.js:314). Einstufung: Anmerkung.

**V02-9 — Health `db:false` bei Teilausfall — BEHOBEN.**
Beleg: `routes/health-intern.js:232-244`: `degraded` (Queue/Replica/Restore/Disk/PM2) steuert nur `ok`/`status`, das Feld ist konstant `db: true` nach erfolgreichem `SELECT 1` (Z. 194); `db:false` steht nur noch im catch (Z. 255-256, 503). Kommentar Z. 237-239 belegt die P2-Korrektur (Deploy-Gate). Einstufung: erledigt.

**V02-10 — Datumswerte nur formal geprüft — besteht.**
Beleg: `routes/betriebszeiten.js:511-514`: `s.ferien.filter(f => f && /^\d{4}-\d{2}-\d{2}$/.test(f.von || '') …`; ebenso Ausnahmen Z. 519. „2026-99-99" passiert den Regex und wird gespeichert. Zustand: Unmögliche Kalendertage stehen in der Konfiguration; `inFerien()` (Z. 228-229) vergleicht nur Strings, die Ferien greifen nie (oder fern der Absicht) — Anzeige „gespeichert", Wirkung aus. Behebung: zusätzlich `istGueltigesKalenderdatum` (Muster wie wartung.js:1289). Risiko: Altwerte fallen beim nächsten Speichern still heraus — Hinweis im Editor nötig. Test: POST mit `von:"2026-99-99"` → nicht gespeichert; Sollwert: Kalenderrealität (von Hand). Einstufung: Anmerkung.

**V03-1 — Weitergabe-Protokoll scheitert still — BEHOBEN.**
Beleg: `routes/verbandbuch-admin.js:628-638`: `catch (x)` ruft `cleanup()`, `loescheVerbandbuchOriginal()`, `melde()` und antwortet 500 („Weitergabe konnte NICHT protokolliert werden"); die zweite Stelle Z. 675-681 ebenso (melde + 500, kein Erfolgs-Redirect). Beide tragen „C2/V03-1 (25.09.2026)". Einstufung: erledigt.

**V03-2 — `ladeFotos()` verschweigt DB-Fehler — BEHOBEN.**
Beleg: `routes/sichtpruefung.js:1575-1584`: catch → `console.error` und `leer.fehler = true`; Anzeige: `renderDefektFotosInline` Z. 1535-1537 und `renderFotoGalerieReadonly` Z. 1551-1554 übersetzen das Flag in einen sichtbaren Hinweis; alle Aufrufer (1310/3132/3317/3325/3658) laufen über diese beiden Renderer. Einstufung: erledigt.

**V03-3 — Spülprotokoll ohne Doppelsende-Schutz — besteht.**
Beleg: `routes/spuelplan.js:364-386`: auditTx mit `INSERT INTO spuel_protokolle … RETURNING id` — kein `client_uuid`, kein `ON CONFLICT`; `core/db.js:2086-2100`: `signatur_hash TEXT` ohne UNIQUE; das Formular (Z. 200-224) hat nur eine Pflichtfeldprüfung `pruefeSpuelung()`, keinen Submit-Riegel. Zustand: Doppelklick/Zweit-POST erzeugt zwei identische unterschriebene Protokolle, zwei Audit-Glieder, zwei PDFs. Behebung: `client_uuid`-Spalte + Vorabprüfung wie `routes/verbandbuch.js:555-566`. Risiko: Migration nötig; Replay-Semantik (neues PDF?) und Altbestand ohne uuid. Test: zweimal identischer POST (gleiche Unterschrift/Stellen) → `COUNT(spuel_protokolle)=1`; Sollwert: Idempotenzvertrag, wie er im Verbandbuch umgesetzt ist. Einstufung: sollte.

**V03-4 — Tablet-Zeiten in Prozesszeit geparst — besteht (Wirkung TZ-abhängig).**
Beleg: `routes/verbandbuch.js:649-655`: `new Date(ce.replace(" ", "T")).getTime()` / `new Date(unfallZeit.replace(" ", "T")).getTime()`; `routes/sichtpruefung.js:2421-2431`: `const t = new Date(ce.replace(' ', 'T')); const diff = Date.now() - t.getTime();`. Ohne Zonenangabe parst JS in Prozesszeit; gemischt mit `Date.now()` verschiebt sich die 2-h-„nachgetragen"-Schwelle bzw. in sichtpruefung das −3 h/24 h-Fenster um den Berlin-Offset. Zustand (UTC-Prozess, MEZ): Erfassung real 2,5 h nach dem Unfall → `diff` nur 1,5 h → Eintrag wird als nicht nachgetragen gekennzeichnet; im sichtpruefung-Fenster kann eine frische Client-Zeit sogar verworfen werden. Behebung: die zonenlosen Strings explizit als Europe/Berlin interpretieren (zentraler Helfer in `core/datum.js`), vorher Messung der Live-Server-TZ. Risiko: DST-Grenzfälle; bestehende Tests mit festen Sollwerten. Test: TZ=UTC, `Date.now` fixiert auf 2026-10-25T21:00Z, `client_erstellt_am` leer, `unfall_zeit="2026-10-25 19:30"` → erwartet `nachgetragen=1`; Sollwert: Berliner Zeiten von Hand. Einstufung: Betreiber-Frage zuerst (Server-TZ), dann sollte.

**V03-5 — Eskalationsstunde aus Prozesszeit — besteht.**
Beleg: `routes/tablet-sperre.js:259`: `const bannerRot = new Date().getHours() >= 10;` und `routes/sichtpruefung.js:3831`: `const stunde = new Date().getHours();`. Zustand: Auf UTC-Prozess wird die 10-Uhr-Berlin-Eskalation erst ab 11/12 Uhr Berlin rot (Winter/Sommer) — der Banner ist bis zu zwei Stunden zu spät. Behebung: Stunde über `Intl`/`toLocaleString` mit `timeZone:'Europe/Berlin'` bestimmen (kleine Hilfsfunktion, beide Stellen). Risiko: Eskalationszeitpunkt verschiebt sich sichtbar; Tests, die auf `getHours()` bauen, brechen. Test: TZ=UTC, Uhrzeit 09:30Z im Winter (=10:30 Berlin) → Banner rot erwartet; Sollwert: Betreiberregel „ab 10 Uhr Berlin" (Kommentar tablet-sperre.js:259). Einstufung: Betreiber (TZ messen), dann sollte.

**V04-1 — Fachfirma-Prüfdatum nur formal geprüft — BEHOBEN.**
Beleg: `routes/wartung.js:1285-1294`: „V05-3 (Extrarunde C5-A, 30.09.2026): auch das Prüfdatum der Fachfirmen-Prüfung muss ein Kalendertag sein, der existiert" und der Code `if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !istGueltigesKalenderdatum(d) || d > heute)` — `2026-02-30` und Zukunftsdaten werden mit 400 abgewiesen. Einstufung: erledigt.

**V04-4..17 — Sammelbereich: NICHT vollständig entscheidbar.**
Die zitierte Quelle `plaene/vollpruefung-befunde.md` ist über die Werkzeuge nicht abrufbar („Datei nicht gefunden"), ebenso `plaene/offene-befunde-vollpruefung.md`; in `git ls-files` existieren nur Verweise darauf. Im Code sind als Kommentare auffindbar: „C2/V04-2/PC2-9 (25.09.2026)" (`routes/wartung.js:1785ff`, Nach-Commit-Fehler wird nicht mehr als Speicherfehler gemeldet) und „C2/V04-3 (25.09.2026)" (`routes/admin/dashboard.js:207-212`, `wRowsFehler` statt stillem catch) — beide nach C2-Nacharbeit geändert. V04-4 lässt sich über die Beschreibung zuordnen: `routes/wartung.js:341-358` (`berechneNaechsteFaelligkeit`: `new Date(heute)` parst date-only als UTC-Mitternacht, danach `setDate/getDate` in Prozess-TZ) — der Mechanismus existiert weiter, wirkt laut Quelle nur westlich von UTC und damit „für unseren Betrieb ohne Wirkung"; Einstufung Anmerkung. Die Punkte V04-5..17 kann ich keinem konkreten Codefund zuordnen, weil die Liste fehlt — ich rate nicht. Ohne Quelle keine Behebung/Testangabe.

---

## Rechenschaft

**Gelesen (Zeilenbereiche):** routes/belehrungen.js 830-1040; generateMonthlyPDFs.js 30-70, 310-365, 400-520; routes/getraenkeanlage.js 55-120, 380-640, 838-1015; routes/betriebszeiten.js 55-70, 80-170, 500-535; routes/lageplan.js 495-540, 790-870, 900-1060; routes/health-intern.js 175-268; routes/verbandbuch-admin.js 580-692; routes/sichtpruefung.js 1295-1325, 1480-1605, 2295-2345, 2405-2445, 3120-3140, 3305-3335, 3580-3690, 3815-3850; routes/verbandbuch.js 545-600, 620-700; routes/tablet-sperre.js 240-275; routes/wartung.js 330-365, 1080-1130, 1255-1310, 1770-1800; routes/admin/dashboard.js 195-225; routes/spuelplan.js 195-260, 280-400; routes/geraete-hinweisfenster.js 295-365; routes/module.js 2750-2800; routes/archiv.js 300-345, 1165-1200; core/db.js 1950-1975, 2080-2115; test_feature_wartung_faelligkeit_datumsfallen.js 1-45. Zusätzlich gezielte Suchen u. a. über migrations/*.sql (0056/0062/0065), core/defekt_mailer.js, core/datum.js, test_feature_*.js.

**Nicht entscheidbar:** V04-4..17 (Quelle in beiden genannten Dateien nicht abrufbar; nur V04-2/V04-3 als Code-Kommentare, V04-4 über die Beschreibung zuordenbar). V01-6/V03-4/V03-5 in ihrer WIRKUNG bleiben an die unbelegte Prozess-Zeitzone des Live-Servers gebunden (Code-Anteil dagegen eindeutig nachgewiesen) — deshalb „Betreiber" bzw. Vorbehalt.

**Zu den vier Zusatzprüfungen:** (1) Zusicherungen/Testdatei: Es gibt in diesem Auftrag keinen Diff und keine benannte Testdatei; eine Suche über alle `test_*.js` nach V01-6, V01-8, V02-4..7, V02-10, V03-3..5 ergab **keine Treffer** — für die noch offenen Punkte existiert also kein namentlicher Wächtertest (Rot-Nachweis fehlt). Für die behobenen Punkte existieren Testbezüge (z. B. V03-1 in test_feature_verbandbuch_pdf_fluechtig.js:457, V02-2 in test_feature_getraenkeanlage_loeschweg.js/integritaet.js). (2) Zeitzonen: Die kritische Kombination (lokale Date-Setter plus `toISOString`/Formatierung) fand ich an den oben belegten Stellen; weitere Kandidaten sind ausdrücklich kommentiert bzw. behoben (routes/bezirk-status.js:52, core/datum.js:67, wartung_mailer.js:43). Ein zusätzlicher, nicht als Befund geführter Rest gleicher Klasse: `routes/archiv.js:1180-1189` (siehe V01-7r). (3) Fehlerbehandlung: Verbessert in V02-3/V02-9/V03-1/V03-2; verbleibend still: `routes/lageplan.js:538` (`catch (e) {}`, V02-7) und — bewusst, mit Log und Begründung — `routes/geraete-hinweisfenster.js:323-336`. (4) SQL: Alle neu geprüften Schreib-/Lesepfade tragen `studio_id` (spuel_protokolle, geraete_positionen, betriebszeiten_versionen, pdf_archiv). Migration 0062/0065 stellen den FK auf RESTRICT um; ihre vollständige Idempotenz (mehrfacher Lauf, Teilerfolge) habe ich anhand der Suchtreffer nur teilweise, nicht vollständig verifiziert.

[Bericht regulaer erstellt, Rundenlimit nicht erreicht.]

---
GELESENE DATEIEN:
  routes/belehrungen.js:830-960
  generateMonthlyPDFs.js:310-365
  routes/getraenkeanlage.js:380-640
  routes/betriebszeiten.js:80-170
  routes/lageplan.js:790-870
  routes/verbandbuch-admin.js:580-670
  routes/sichtpruefung.js:1480-1540
  routes/belehrungen.js:950-1040
  routes/verbandbuch-admin.js:664-692
  generateMonthlyPDFs.js:400-520
  routes/getraenkeanlage.js:860-1015
  routes/lageplan.js:900-1000
  routes/health-intern.js:175-268
  generateMonthlyPDFs.js:30-70
  routes/geraete-hinweisfenster.js:295-365
  routes/sichtpruefung.js:3580-3645
  routes/sichtpruefung.js:2295-2345
  routes/verbandbuch.js:545-600
  routes/wartung.js:1080-1130
  routes/sichtpruefung.js:1555-1605
  routes/sichtpruefung.js:1295-1325
  routes/tablet-sperre.js:240-275
  routes/sichtpruefung.js:3815-3850
  routes/sichtpruefung.js:1538-1560
  routes/spuelplan.js:280-400
  routes/verbandbuch.js:620-700
  routes/lageplan.js:495-540
  routes/module.js:2750-2800
  routes/archiv.js:300-345
  routes/betriebszeiten.js:500-535
  core/db.js:2080-2115
  routes/sichtpruefung.js:3120-3140
  routes/sichtpruefung.js:3305-3335
  routes/wartung.js:1255-1310
  core/db.js:1950-1975
  routes/sichtpruefung.js:2405-2445
  routes/wartung.js:1770-1800
  routes/admin/dashboard.js:195-225
  routes/getraenkeanlage.js:838-862
  routes/getraenkeanlage.js:55-120
  test_feature_wartung_faelligkeit_datumsfallen.js:1-45
  routes/sichtpruefung.js:3644-3690
  routes/spuelplan.js:195-260
  routes/lageplan.js:1000-1060
  routes/wartung.js:330-365
  routes/archiv.js:1165-1200
  routes/betriebszeiten.js:55-70
GESCHWAERZTE STELLEN (Geheimnis-Riegel; dort war die Pruefung blind):
  (keine)
ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; andere Teile derselben Datei koennen geliefert worden sein):
  (keine)
Suchen: 34  Lesungen: 51  Ablehnungen: 4
Runden: 14  Token rein: 1144651  Token raus: 52569
Kosten geschaetzt: $0.4065
Protokoll: /tmp/claude-0/-home-user-Belehrungssystem/c200d6d7-f0a2-5a02-8fb8-a4f662e3a700/scratchpad/c6/prot-z5a.jsonl
