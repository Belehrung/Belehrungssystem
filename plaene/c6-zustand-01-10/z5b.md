# Zustandsprüfung der 24 Kennungen (master 9ad8acd, kein Diff)

## 1) Kompakte Tabelle

| Kennung | besteht | Einstufung | Kernbeleg Datei:Zeile | Behebung (max 20 W) | Risiko der Behebung (max 12 W) |
|---|---|---|---|---|---|
| V05-6 | teilweise | sollte | routes/admin/mitarbeiter.js:724–726; routes/admin/geraete.js:6328–6337 | Advisory-Lock je Studio + Lookup in derselben Tx | Lock-Reihenfolge; Importe laufen serialisiert/langsamer |
| V07-9 | ja | Anmerkung | core/file-crypto.js:76–78 | GCM-Streaming mit Tag-Holdback statt Buffer.concat | Krypto-Umbau; Fehler-/Layoutpfade neu testen |
| V08-1 | nein | erledigt | core/jahrescheck.js:286–289 | — (bereits behoben, C-Runde) | — |
| V08-2 | ja | Anmerkung | core/nachtrag-ergebnis.js:133–136 | Object.hasOwn/Set in nachtragBanner | minimal; entfernt nur Prototyp-Treffer |
| V08-3 | ja | Anmerkung | core/onedrive.js:33–40, 71–79 | timeout/AbortSignal in https.request | Abbruch bei langsamem Upload → Retry nötig |
| V08-5 | ja | Anmerkung | core/hilfe-texte.js:1630 | Parameter entfernen oder auswerten | Layoutverschiebung (bisher immer rechts) |
| V08-6 | ja | Anmerkung | core/monatskontrollen.js:112–119 | letzte-Abfrage auf Pflicht-IDs (ANY) begrenzen | große ID-Liste; Kopplung an gehoertZuMonatskontrollen |
| V09-4 | ja | sollte | routes/bezirk-archiv.js:171–175; core/pdf-pfad.js:69–82 | Wurzelprüfung (realpath) vor sendFile | Altpfade fallen raus → 404-Anzeige |
| V09-5 | ja | Anmerkung | core/pdf-jobs.js:56–57 | plainObject-Wache → ValidationError | Fehlerklasse/Statuscode ändert sich |
| V09-6 | ja | sollte | core/pdf-engine.js:1517–1518; core/db.js:779–780 | NULL-Guard im rowDrawer (leere Zellen) | leere Pausenspalten sichtbar |
| V09-7 | ja | Anmerkung | core/pdf-engine.js:659 | Logik nach core/ ziehen, routes re-exportiert | viele Requirer; Doppelquelle droht |
| V09-9 | ja | Anmerkung | core/pdf-engine.js:957–961 | Details einmal je sitzung_id laden (Map) | Speicher; Map-Schlüssel korrekt halten |
| V10-2 | nein | erledigt | core/signaturbild.js:245–253 | — (P4-Regelmodul greift) | — |
| V10-3 | nein | erledigt | core/storage-replica.js:139–140 | — (0063 + attempts-Reset) | — |
| V12-1 | nein | erledigt | public/offline-queue.js:391–395, 680–682 | — (Endzustände → Konflikt) | — |
| V12-2 | nein | erledigt | public/offline-queue.js:662–673, 820 | — (Live-Pfad persistiert nur Rest) | — |
| V12-3 | nein | erledigt | e2e/gymdocu.spec.js:236–247 | — (Status 200 + Anker ergänzt) | — |
| V12-4 | nein | erledigt | test/e2e-durchlauf.js:455–458 | — (formatBerlinDate) | — |
| V12-5 | teilweise | Anmerkung | test/e2e-durchlauf.js:38–51, 431 | manuellen Lauf dokumentieren oder Suite-Einbindung | Laufzeit/Flakiness in der Suite |
| V12-6 | nein | erledigt | public/offline-queue.js:154–162 | — (jetztBerlin; Wächter :69) | — |
| V12-7 | nein | erledigt | public/offline-queue.js:141–148, 463, 519–524 | — (qPutSicher/qDeleteSicher + Badge) | — |
| V12-8 | nein | erledigt | public/qr-kamera-scan.js:390–397 | — (Stream-Stopp beim Neustart) | — |
| V20-4 | teilweise | Anmerkung | test_feature_mangel_nachtrag.js:373; test_feature_mangel_darstellung_einheitlich.js:95–101,152–156 | Gegenproben automatisieren oder als manuell führen | Automatik prüfte Konstante gegen sich selbst |
| P3-S1 | teilweise | Anmerkung | routes/auth.js:1006/1056, 1800/1810; routes/archiv.js:781/815 | textFeld vor bcrypt.compare einsetzen | 400-Seite statt Redirect; Zählerpfade prüfen |

---

## 2) Einzelheiten

### V05-6 — „Übernehmen" je Studio serialisieren, in Sperre erneut suchen
**Zustand heute (teilweise):** Die in der verdichteten Zeile genannte Fundstelle 663–665 ist heute das Vorschau-Formular; der Schreibweg liegt in `routes/admin/mitarbeiter.js:673–827`. Dort wird je Zeile erneut gesucht, dann geschrieben — **ohne Advisory-Lock**:
`724: const best = await _impFindeBestehenden(req.studioId, e.name, e.email);`
`726: const neu = await db.one("INSERT INTO mitarbeiter …RETURNING id", …);`
`_impFindeBestehenden` (553–562) matcht E-Mail zuerst, sonst nur bei eindeutigem Namen; der DB-Schutz ist nur `idx_mitarbeiter_studio_email … WHERE email IS NOT NULL` (core/db.js:728–729) — namenlose Zeilen sind nicht geschützt.
Für die Original-Formulierung „**Gerät ohne durchfuehrung**" gehört die zweite Stelle zum Geräte-CSV-Import: `routes/admin/geraete.js:6265–6337`. Dort ist die Vorzählung nur noch Prüfgrundlage (Kommentar 6280–6303), der Guard `6308–6319` hängt an `erwarteteNeu > 0`, und der Schreib-Loop sucht erneut (`6328`). Ein Gerät ohne `durchfuehrung` setzt voraus, dass die Vorzählung 0 liefert (Guard übersprungen) und der Lookup im Schreib-Loop danach `null` liefert — nur über ein enges konkurrierendes Interleaving (Flip von `c.length===1` auf ≥2) erreichbar. **Verbleibendes, echtes Rennen:** zwei gleichzeitige „Übernehmen" legen für denselben neuen Namen beide eine Zeile an (beide Lookups `null` vor dem ersten COMMIT; keine Unique-Regel auf `(studio_id,kategorie_id,name)` — core/db.js:967 nur `idx_wger_studio`).
**Zustand, den es nicht geben darf:** zwei „Rudergerät"-Zeilen in einer Kategorie (Kommentar 6287–288: „die Kategoriekachel … für immer rot") bzw. doppelte Mitarbeiter ohne E-Mail.
**Kleinste Behebung:** in beiden Commit-Handlern `SELECT pg_advisory_xact_lock(hashtextextended('import:<art>:<studioId>',0))` + erneutes Suchen innerhalb derselben Transaktion.
**Schlechter möglich:** serielle Importe; Lock-Reihenfolge gegen andere Studio-Locks prüfen.
**Test (ROT→GRÜN):** Harness wie `test_feature_seil_freigabe_race.js`: zwei parallele POSTs auf `/admin/geraetewartung/kategorie/:id/import/commit` mit derselben neuen Zeile; Zusicherung „genau 1 Zeile". Sollwert: CSV-interne Dedupe-Regel `routes/admin/geraete.js:6085–6088`/`mitarbeiter.js:546–548` („ein Name/Eintrag = eine Zeile") — heute ROT bei echter Gleichzeitigkeit.

### V07-9 — decryptStream puffert ganze Datei
**Besteht:** `core/file-crypto.js:76–78` wörtlich:
`76: const chunks = [];`
`77: for await (const chunk of input) chunks.push(chunk);`
`78: const payload = Buffer.concat(chunks);`
Der Layout-Kommentar (70–74) erklärt nur das Format, nicht eine Besserung.
**Zustand, den es nicht geben darf:** eine 2‑GB‑`.enc`-Datei wird beim Stream-Download komplett in den Heap geladen (OOM-Risiko beim Replikat-Lesen).
**Kleinste Behebung:** `decryptStream` inkrementell entschlüsseln und die letzten `TAG_LENGTH` Bytes zurückhalten (GCM-Tag am Ende).
**Schlechter möglich:** Krypto-Pfad umbauen; ein Fehler dort entschlüsselt plötzlich keine Datei mehr (fail-closed bleibt Pflicht).
**Test (ROT→GRÜN):** instrumentierter `Writable`, der den Zeitpunkt des ersten Schreibens protokolliert; Zusicherung „erster Output-Chunk kommt, bevor der Input-Stream `end` meldet". Sollwert: der Stream-Vertrag (encryptStream streamt bereits; Dateikommentar 70–74 beschreibt nur das andere Layout). Heute ROT, weil erst nach vollständigem Einlesen geschrieben wird.

### V08-1 — MAX(geprueft_durch) statt jüngster Zeile
**Behoben.** Code:
`core/jahrescheck.js:286–289`: `"SELECT DISTINCT ON (bereich) bereich, geprueft_am AS letzte, geprueft_durch AS durch … ORDER BY bereich, geprueft_am DESC, id DESC"` — der Kommentar 278–285 benennt V08-1 und den alten Fehler („Zorro Alt"/„Anna Neu") ausdrücklich.
Test: `test_feature_jahrescheck.js:109–129` legt **zwei** Bestätigungen an, lässt id‑ und Zeit-Reihenfolge absichtlich auseinanderlaufen (T2-B4) und prüft `bestaetigtDurch === 'Frau Hartmann'` (Literal) sowie `zeilenAnzahl5b.c === 2`. Die frühere Ein-Zeilen-Schwäche ist damit weg; **eine** Zeile, die die Zusicherung fallen lässt: die ORDER-BY-Richtung in `jahrescheck.js:289` auf `ASC` drehen → Test rot (genau so im Kommentar 101–104 dokumentiert).

### V08-2 — nachtragBanner liest geerbte Eigenschaften
**Besteht.** `core/nachtrag-ergebnis.js:133–136`:
`return nachtrag.split(',').map((teil) => woerterbuch[teil.trim()]).filter(Boolean).join('');`
Kein `Object.hasOwn`; das Wörterbuch ist ein Objektliteral (78–106). `?nachtrag=constructor` liefert `Object.prototype.constructor` → wird gerendert und unterdrückt den „Gespeichert"-Banner. Der Kommentar 144–146 behauptet fälschlich, Unbekanntes falle weg. Gegenbeleg, dass die Klasse im Haus erkannt ist: `routes/sichtpruefung.js:1483` nutzt für `foto_fehler` genau die fehlende Wache (`Object.prototype.hasOwnProperty.call`).
**Zustand, den es nicht geben darf:** eine Seite zeigt statt „Gespeichert" den Text `function Object() { [native code] }`.
**Kleinste Behebung:** in `nachtragBanner` wie in `sichereNachtragWerte` (160–167) ein `Set`/`hasOwn` verwenden.
**Schlechter möglich:** praktisch nichts; nur degenerierte Eingaben verlieren ihre (falsche) Anzeige.
**Test (ROT→GRÜN):** `nachtragBanner(true,'constructor')===''` und dito `'__proto__'`, `'toString'`. Sollwert: Funktionsvertrag Zeile 110–111 („fertiges Banner-HTML oder ''") + C5d-Präzedenz `sichtpruefung.js:1483`. Heute ROT.

### V08-3 — OneDrive ohne Zeitlimit
**Besteht.** `core/onedrive.js:33–40` (Token-POST) und `71–79` (Upload-PUT) setzen keine `timeout`-Option/kein AbortSignal (Datei endet bei Zeile 135; nur diese zwei Requests). Backend bleibt inaktiv, solange `onedrive_aktiv !== '1'` (104/117); Aufruf nur über `isBackendActive('onedrive')` (core/storage-replica.js:109–111).
**Zustand, den es nicht geben darf:** ein hängender Graph-Request blockiert einen Job-Worker dauerhaft (keine Lease-Fortschritte bis Socket-Timeout des OS).
**Kleinste Behebung:** `timeout:` + `req.on('timeout', …)` in beiden Requests (Hausmuster: `fetchTimeout`, offline-queue.js:163–168).
**Schlechter möglich:** zu kurzes Limit bricht legitime große Uploads ab → Job-Retry/Dead-Letter.
**Test (ROT→GRÜN):** `https.request` stubben und die empfangenen Optionen für Token+Upload prüfen (`options.timeout > 0`). Sollwert: Befund „Zeitlimit". Heute ROT.

### V08-5 — hilfeButton ignoriert position
**Besteht (aber wirkungslos).** `core/hilfe-texte.js:1630`: `function hilfeButton(key, position = 'right') {` — `position` wird im Rumpf (1630–1655) nie gelesen (Style fest `margin-left:8px`). Suche über alle Aufrufe: **kein** Aufrufer übergibt ein zweites Argument (alle Treffer einargumentig, z. B. geraete.js:231/4290, wartung.js:22–24).
**Zustand, den es nicht geben darf:** keiner heute; der Parameter suggeriert eine Steuerung, die es nicht gibt.
**Kleinste Behebung:** Parameter entfernen (oder `position` in Style auswerten). **Schlechter möglich:** Auswerten würde Layouts verschieben; Entfernen ist heute risikofrei (keine Aufrufer).
**Test (ROT→GRÜN):** Quelltext-Wächter: `position` muss im Funktionsrumpf vorkommen **oder** der Parameter darf nicht existieren. Sollwert: Befund. Heute ROT (Parameter da, nie benutzt).

### V08-6 — ladeMonatliche lädt zu viel
**Besteht.** `core/monatskontrollen.js:94–134`: die Geräteliste wird per SQL breit geladen und erst danach per `istPflicht` gefiltert (104); die „letzte Prüfung"-Abfrage (112–119) lädt Protokolle für **alle** monatlichen Betreiber-Geräte (`g.aktiv=1 AND COALESCE(g.durchfuehrung,'betreiber')<>'fachfirma' AND g.intervall_monate=1`) — nicht nur für die Pflicht-Teilmenge. Der Kommentar 105–109 behauptet „die Abfrage filtert schon in der Datenbank", was für `istPflicht` nicht zutrifft.
**Zustand, den es nicht geben darf:** bei vielen selbst gesetzten Monatsgeräten lädt die Seite unnötig Protokolle (Leistung), sichtbares Ergebnis bleibt gleich.
**Kleinste Behebung:** nach `eintraege`-Filter `const ids = eintraege.map(g=>g.id)` und in der zweiten Abfrage `AND p.geraet_id = ANY($2)`.
**Schlechter möglich:** große Parameterlisten; Kopplung an `test_feature_monatskontrollen` (beide Wege gegeneinander) bricht, wenn die WHERE-Klauseln auseinanderlaufen.
**Test (ROT→GRÜN):** db.q-Spy während `ladeMonatliche`; ein monatliches Nicht-Pflicht-Gerät mit Prüfung anlegen; Zusicherung: zweite Abfrage enthält seine ID nicht. Sollwert: Befund + Kommentar 144–148 („GENAU dieselben Einträge"). Heute ROT.

### V09-4 — Bezirk-Archiv sendFile ohne Wurzelprüfung
**Besteht.** `routes/bezirk-archiv.js:171–175`:
`171: const abs = resolvePdfPfad(req.studioId, subOf(req), row.dateipfad);`
`172: if (!abs) return res.status(404)…`
`175: res.sendFile(abs);`
`core/pdf-pfad.js:69–82` warnt selbst: „das Ergebnis wird HIER NICHT gegen PDF_ROOT geprüft und kann PDF_ROOT VERLASSEN — ein `dateipfad` mit „../"-Segmenten … löst path.join() ganz regulär außerhalb von PDF_ROOT auf"; die Kandidaten (105–112) normalisieren `..` weg, ohne Sperre.
**Zustand, den es nicht geben darf:** eine per DB-Schreibzugriff manipulierte `pdf_archiv.dateipfad`-Zeile (`/pdf/../../etc/passwd`) lässt das Portal beliebige lesbare Dateien ausliefern.
**Kleinste Behebung:** in `resolvePdfPfad` (oder im Aufrufer) Ergebnis per `path.resolve`/`realpath` gegen die erlaubten Wurzeln (PDF_ROOT, ggf. `/var/www/studios/<sub>`) prüfen; sonst `null`.
**Schlechter möglich:** echte Altpfade außerhalb PDF_ROOT verschwinden (404 im Portal); naives `startsWith` kollidiert bei Präfixnamen (`/x/pdf` vs `/x/pdf2`) → mit `+ path.sep` und realpath arbeiten.
**Test (ROT→GRÜN):** Marker-Datei außerhalb PDF_ROOT, `pdf_archiv`-Zeile mit Ausbruchs-`dateipfad`, GET `/intern/bezirk-archiv/datei/:id` mit gültigem Token → erwartet 404; heute 200 (ROT). Sollwert: Wurzelbindung (Kommentar pdf-pfad.js:69–81).

### V09-5 — validateStorageReplicate(null) TypeError
**Besteht.** `core/pdf-jobs.js:56–57`:
`function validateStorageReplicate(payload) {`
`    const keys = Object.keys(payload).sort();`
`Object.keys(null)` wirft TypeError, nicht ValidationError. Exportiert ist die Funktion samt `validateJobType` (Zeile 382–383); `validateJobType` ruft sie ungeschützt (75–76). `validateEnqueue` prüft nur `plainObject(input)` (84), nicht `input.payload` — andere Typen erhalten ihre Prüfung erst im Validator (`exactKeys` → ValidationError). Im Repo übergibt heute kein Aufrufer `null` (einziger `enqueue`-Aufruf: routes/korrekturen.js:34; storage_replicate baut sein Payload in core/storage-replica.js:190) — der Befund ist ein API-Vertragsloch.
**Zustand, den es nicht geben darf:** ein künftiger/äußerer Aufruf mit `payload:null` erzeugt eine TypeError (im Express‑5-Sinne 500 + Alarm) statt einer erwartbaren 400/ValidationError.
**Kleinste Behebung:** `if (!plainObject(payload)) throw new ValidationError("payload must be a plain object");` am Anfang von `validateStorageReplicate` (oder zentral in `validateJobType`).
**Schlechter möglich:** Fehlerklasse/Statuscode ändert sich (gewollt), aber Aufrufer, die `instanceof TypeError` erwarten, brechen; Catch-Pfade prüfen.
**Test (ROT→GRÜN):** `assert.throws(() => pdfJobs.validateJobType('storage_replicate', null), pdfJobs.ValidationError)` — heute TypeError (ROT); Sollwert: Namensvertrag `ValidationError` (Zeile 20) wie bei `exactKeys`.

### V09-6 — Pausen-PDF scheitert an NULL-Zeit
**Besteht.** `core/pdf-engine.js:1517–1518`:
`const [ph, pm]   = r.pause_von.split(':').map(Number);`
`const [pe, pme]  = r.pause_bis.split(':').map(Number);`
Die Spalten dürfen NULL sein (`core/db.js:779–780` ohne NOT NULL); die Korrektur-Registry lässt sie ausdrücklich nullable (`core/korrekturen.js:343–344: zeit("Pause von", true)`) und `korrekturen.js:759` erlaubt Leerwerte bei `nullable`, `:954` dokumentiert „newValue === \"\" → NULL". `drawPaginatedTable` ruft `rowDrawer` **ohne** Einzelzeilen-Schutz (pdf-engine.js:398–410); der Wurf läuft in den catch (1534–1538) → `bricheStromAb` → die **ganze** Monats-PDF scheitert.
**Zustand, den es nicht geben darf:** eine einzige Pausenzeile ohne Pausenzeiten (Korrektur/Altbestand) lässt den kompletten „Arbeits- und Pausenzeiten"-Nachweis ausfallen (inkl. aller korrekten Zeilen).
**Kleinste Behebung:** im `rowDrawer` `if (!r.pause_von || !r.pause_bis) { dauer = ''; }` und Zellen leer zeichnen (nicht Zeile weglassen).
**Schlechter möglich:** leere Pausenspalten wirken wie „keine Pause genommen" — Beschriftung/Hinweis nötig; ein stiller Skip würde den Nachweis verkürzen (verschwundene Anzeige).
**Test (ROT→GRÜN):** eine `pausenzeiten`-Zeile nur mit `schicht_beginn/ende` (pause NULL) in ein Teststudio, dann `generatePausenPDF(sid, von, bis)` → erwartet: Promise löst, Datei existiert, beide Pausenzellen leer. Sollwert: Schema (db.js:779–780) + Registry-nullable (korrekturen.js:343–344). Heute ROT (TypeError/Abort).

### V09-7 — core/ importiert routes/betriebszeiten
**Besteht.** `core/pdf-engine.js:659`: `const bz = require('../routes/betriebszeiten');` (in `zeichneBetriebstageUebersicht`, lazy). Die Hausregel steht wörtlich in `core/auth.js:110`, `core/ausmusterung-hinweis.js:6`, `core/mangel-darstellung.js:16` („core/ importiert nicht aus routes/"). Eine Ausnahme-Dokumentation an der Stelle fand ich nicht.
**Zustand, den es nicht geben darf:** core hängt an einer Route (Zyklus-/Ladereihenfolge-Risiko; Architekturregel verletzt).
**Kleinste Behebung:** `istKonfiguriert/istBetriebstag` in ein `core/betriebszeiten-logik.js` verschieben; `routes/betriebszeiten.js` re-exportiert.
**Schlechter möglich:** viele Requirer/Tests (test_feature_c2_stille_fehler.js, test_feature_messfehler_nicht_behaupten.js …) hängen an `routes/betriebszeiten`; ohne Re-Export drohen Doppelquellen.
**Test (ROT→GRÜN):** statischer Wächter „kein `require('../routes/` in core/**.js" (Ausnahmeliste leer) — heute ROT; Sollwert: die zitierte Hausregel.

### V09-9 — Detailabfrage in Chunk×Sitzungs-Schleife
**Besteht.** `core/pdf-engine.js:917` (`for (const [chunkIdx, deviceChunk] of chunks.entries())`) enthält bei `957–961`:
`for (const s of sitzungen) {`
`  const details = await db.q("SELECT geraet_name, status, defekt_beschreibung FROM geraete_pruefung_detail WHERE studio_id = $1 AND sitzung_id = $2", [studioId, s.id]);`
Die Detailzeilen sind chunk-unabhängig, werden aber je Chunk **und** Sitzung erneut geladen (C×S Abfragen statt S).
**Zustand, den es nicht geben darf:** bei 30 Sitzungen × 3 Geräte-Chunks 90 statt 30 Abfragen — Monats-PDF-Generierung künstlich langsam (Worker-Lease/Betriebszeit).
**Kleinste Behebung:** Details vor der Chunk-Schleife einmal je Sitzung laden (oder `sitzung_id = ANY($2)`), `Map<sitzung_id,{statusMap,defektMap}>`.
**Schlechter möglich:** Speicher bei sehr vielen Sitzungen; Map-Schlüssel/Scope falsch → falsche Statusspalten.
**Test (ROT→GRÜN):** db.q-Zähler um `generateSeilkontrollePDF` (9 Geräte = 2 Chunks, 1–2 Sitzungen): Anzahl Detailabfragen == Sitzungszahl. Sollwert: Befund „Detailabfrage in Doppelschleife". Heute ROT.

### V10-2 — ein schwarzes Pixel galt als Unterschrift
**Behoben.** `core/signaturbild.js:239–253` führt die dritte Prüfung aus („DRITTE Prüfung (P4, Pentest V10-2)"), ruft `regel.bewerteUnterschrift(dataOrig, …)` und wirft bei `!urteil.ok` die Regel-Meldung (253). Das Regelmodul `core/unterschrift-regel.js` lehnt Einzelpunkt/-strich/Fläche/zu klein ab (Kopf 1–24; Schwellen 78–138; MELDUNG_UNGUELTIG 67). Fixturen: `test/fixturen/unterschrift/erwartung.json:2–24` enthält `punkt_mikro_1px`/`_2px`; `test_feature_unterschrift_regel.js:51–57` erwartet für `E1-dpr1-punkt_mikro_2px.png` den Grund `'punkt'`. Der frühere Trust-Boundary-Fall (1×1 schwarz akzeptiert) ist damit geschlossen; die Route nutzt die Prüfung (`routes/belehrungen.js:923`).

### V10-3 — Replik-attempts bei neuem Inhalt nicht zurückgesetzt
**Behoben.** `core/storage-replica.js:139–140`:
`attempts = CASE WHEN storage_replica.sha256 IS DISTINCT FROM EXCLUDED.sha256 THEN 0 ELSE storage_replica.attempts END,`
`last_error = CASE WHEN … THEN NULL ELSE storage_replica.last_error END`
plus Kommentar 115–125 („Befund V10-3, gemessen 25.09.2026"). Migration `migrations/0063_storage_replica_claim_nr.sql` trennt Lease-Kennung (`claim_nr`, Zeile 18, `ADD COLUMN IF NOT EXISTS` = idempotent). Test: `test_feature_storage_replica_upsert_rennen.js` (in `test/run.sh:467`).

### V12-1 — Offline-Queue wiederholte Foto-409 endlos
**Behoben.** `public/offline-queue.js:83–92` definiert `FOTO_CODES_ENDGUELTIG` (geschlossen, max, defekt, …) mit Grund+Hinweis; `:391–395` überführt solche Fotos in `fotos_abgelehnt`; der Live-Pfad setzt daraus `konflikt` (`:680–682`), der Sync-Pfad ebenso (`:813–820`); Badge-Sonderfall `nurFotos` (`:477–494`). Server liefert die Codes weiter (`routes/sichtpruefung.js:3472,3479`). Test: `test_feature_offline_queue_verhalten.js:348–360` (B3: 409 `geschlossen` → `status 'konflikt', art 'fotos'`, Textanker „geschlossen"/„nicht mehr zuordenbar", in `test/run.sh:803`).

### V12-2 — leerer „offen"-Eintrag nach Live-Senden / fehlendes qDelete
**Behoben.** Live-Pfad persistiert nur noch einen echten Rest: `offline-queue.js:662–673` (`if (rest > 0) { … qPutSicher … }`), Kommentar 329–333 („V12-2"). Sync-Pfad löscht, wenn nichts mehr aussteht: `:820` `return qDeleteSicher(e.client_uuid)…`. Test: `test_feature_offline_queue_verhalten.js:336–344` (B2d: „genau ein IndexedDB-put (der Rest), nicht einer je Foto").

### V12-3 — E2E-Datensparsamkeit ohne Status/Anker
**Behoben.** `e2e/gymdocu.spec.js:236–247`: `expect(verifyResponse.status()).toBe(200); … expect(body).toContain("Registriertes Korrekturblatt");` in derselben Gruppe wie die `not.toContain`-Zusicherungen; Kommentar 236–239 nennt V12-3 und den 500er-Fall.

### V12-4 — Monat aus lokaler Zeit
**Behoben.** `test/e2e-durchlauf.js:455–458`: `const monat = formatBerlinDate(new Date()).slice(0, 7);` (Import Zeile 57), Kommentar „V12-4". Kein `getFullYear/getMonth→toISOString`-Rest in der Datei.

### V12-5 — e2e-durchlauf schrieb in Repo-Bäume
**Teilweise behoben.** Schreibpfad behoben: `test/e2e-durchlauf.js:38–51` setzt `PDF_ROOT`/`BELEHRUNGEN_UPLOAD_DIR` auf ein `mkdtemp`-Verzeichnis **vor** jedem core-Require, `:431` nutzt `process.env.BELEHRUNGEN_UPLOAD_DIR`, `:494` räumt auf. **Weiterhin nicht in `test/run.sh`** (Suche „e2e-durchlauf" liefert dort keinen Treffer; Aufruf laut Kopfzeile 16 nur `node test/e2e-durchlauf.js`). Einstufung daher Anmerkung.
**Kleinste Behebung:** Ausschluss in run.sh dokumentieren (z. B. neben der CLI-Sammelstufe, test_feature_cli_sammelstufe_enden.js:175 führt es schon als „Testwerkzeug, kein Betriebsskript") oder als eigenen optionalen Lauf einhängen.
**Schlechter möglich:** Suite-Einbindung kostet Laufzeit und kann flaky werden (eigener Server spawnt, Ports/DB-Sperre).
**Test (ROT→GRÜN) für den Rest:** Wächter „run.sh nennt test/e2e-durchlauf.js **oder** trägt einen dokumentierten Ausschluss" — heute ROT.

### V12-6 — utcJetzt() hieß falsch
**Behoben.** `offline-queue.js:154–162`: Funktion heißt `jetztBerlin`, Kommentar „Bis 30.09.2026 hiess die Funktion utcJetzt … (V12-6)"; Aufrufstelle `:644`. Wächter: `test_feature_offline_queue_verhalten.js:69` („der irreführende Name utcJetzt kommt im Code nicht mehr vor").

### V12-7 — fehlende catches, Badge zeigte Speicherausfall nicht
**Behoben.** `offline-queue.js:141–148` (`qPutSicher/qDeleteSicher` mit `speicherOk/speicherAusfall`), `:463` (`if (speicherFehler) html += speicherFehlerHtml(false)`), `:519–524` (Lesefehler → Warnkasten), `:725/:737` (`speicherAusfall(); badgeRender()`), Delete-Aufrufe nur noch `qDeleteSicher` (`:820`, `:528`). Die zwei verbliebenen rohen `qPut` (`:713`, `:729`) haben eigene `.catch`-Zweige und setzen den Merker (Kommentar R3-5, `:709–712`); der Kommentar `:104–112` benennt V12-7. Test: `test_feature_offline_queue_verhalten.js` (Kopfzeile 2 nennt V12-7), in `test/run.sh:803`.

### V12-8 — alter Kamera-Stream beim Neustart
**Behoben.** `public/qr-kamera-scan.js:390–397`:
`// V12-8 (Auftrag Q, 30.09.2026): …`
`scanLaeuft = false; if (aktuellerStream) stopStream();`
plus Sitzungswächter 427–447. Test: `test_feature_kamera_doppelstart.js`, in `test/run.sh:804`.

### V20-4 — Gegenproben mandantengebunden / manuell
**Zwei Lesarten geprüft, teilweise:**
(a) `test_feature_mangel_nachtrag.js:373` ist heute mandantengebunden: `"SELECT * FROM geraete_sperren WHERE studio_id=$1 AND typ='seilkontrolle' AND geraet_id=$2"` → **behoben** für die genannte Stelle. Die verbleibende globale Zählung `:400` (`WHERE geraet_id=$1`) ist eine **strengere** Negativkontrolle für das Fremdstudio-Szenario (fängt auch eine falsch unter dem anfragenden Studio angelegte Zeile) — keine Schwäche.
(b) `test_feature_mangel_darstellung_einheitlich.js`: die Gegenproben sind weiterhin **nicht automatisiert**, aber ausdrücklich „von Hand als Teil des Auftragsberichts" geführt und mit Messwerten dokumentiert (`:95–101` Schwelle TAGE_ROT_AB; `:152–156` Aufruf-Ersatz; `:265–281` vollKarteIds-Mutation mit „EXIT 1, 58 PASS / 1 FAIL"). Damit ist die vom Befund angebotene Alternative „**als manuell führen**" umgesetzt; offen bleibt nur die Suite-Automatik.
**Kleinste Behebung (falls Automatik gefordert):** Mutation in einer Kopie via Kindprozess (Muster `test/helfer/eingefrorene-uhr-kindprozess.js`) und Wächter auf „mutierter Lauf → rot".
**Schlechter möglich:** Eine Automatik, die die Schwelle im selben Lauf verstellt, prüft die Konstante gegen sich selbst (genau die im Testkopf 95–98 verworfene Variante).
**Test (ROT→GRÜN):** Wächter, dass die dokumentierten Gegenproben-Läufe existieren/aktualisiert sind — heute nur Prosa.

### P3-S1 — Felder ohne .trim() / passwort als Array an bcrypt
**Teilweise behoben.** Die Feldtyp-Wache existiert und ist flächendeckend im Einsatz: `core/eingabe.js:35–39` (`textFeld` wirft bei Array/Objekt `EingabeFehler` mit Status 400), Mapping im Fehlerbehandler (`core/fehlerbehandler.js:12,40`), Wächter-Test `test_feature_p3_eingabetypen_waechter.js` (Kopf 1–20; „alle gemessenen Stellen ausser routes/korrekturen.js:227") läuft in `test/run.sh:840–841`. Beispiel `routes/admin/einstellungen.js:140–158` nutzt überall `textFeld(...)` — Arrays werden dort nicht mehr gespeichert; `String(req.body.x || '')`-Stellen sind die gewollte, erlaubte Form (Wächter Fixtur 79–83).
**Verbleibend:** `passwort`/`alt`/`neu`/`neu2` werden roh destrukturiert und ungewandelt an `bcrypt.compare` gereicht: `routes/auth.js:1006` → `:1056`; `routes/auth.js:1800` → `:1810`; `routes/archiv.js:781` → `:815`. Das ist genau der „(unbelegt)"-Punkt: die **Erreichbarkeit** ist belegt; die **Reaktion** von bcrypt (package.json:10, `"bcrypt": "^6.0.0"`) auf Arrays ist im Repo nicht nachlesbar (node_modules ist nicht versioniert — `lies node_modules/bcrypt/package.json` → „Datei nicht gefunden"). Beobachtbar aus dem Code: die Login-Route fängt jeden Wurf (`auth.js:1052–1081`) und leitet auf `?fehler=1` um — allerdings **ohne** `loginFehler()`-Zählung; `/admin/passwort` fängt ebenfalls (`:1808,1823`); die Archiv-Route `routes/archiv.js:779–854` hat **kein** try um `:815` → bei einem Wurf droht über Express 5 (`^5.2.1`) die 500-Seite + Alarm.
**Kleinste Behebung:** `const passwort = textFeld(req.body.passwort);` (analog alt/neu/neu2) — erwartbare 400 statt Wurf/undefiniert.
**Schlechter möglich:** Statuscode-/UX-Wechsel: statt Redirect erscheint die 400-Eingabeseite; in der Login-Route liegt die Zeile **vor** dem try (1006) — dort bewusst in den try-Block ziehen oder Wurf abfangen.
**Test (ROT→GRÜN):** POST `/d/:token/auth` mit `passwort[]=x` → erwartet <500 (400/Redirect); heute droht 500 (ROT). Sollwert: P3-Entscheidung „erwartbare 400-Antwort … nie eine ungefangene 500er" (`core/eingabe.js:13–16`).

---

## 3) Zusatzprüfungen (immer in dieser Reihenfolge)

**Zusicherungen, die nicht fehlschlagen können:** Die nachgezogenen Tests sind mutationstauglich: `test_feature_jahrescheck.js:109–129` kreuzt id-/Zeitreihenfolge absichtlich (Drehen der ORDER-Richtung macht `bestaetigtDurch` rot), `test_feature_offline_queue_verhalten.js:342` zählt Puts literal (`spyPut === 1`), `e2e/gymdocu.spec.js:240–246` kombiniert Status + positiven Anker. Die einzige verbliebene „grün-aus-Notwendigkeit"-Klasse sind die **manuellen** Gegenproben in `test_feature_mangel_darstellung_einheitlich.js` (95–101, 152–156) — dort ist die Nicht-Automatisierung begründet und dokumentiert, aber nicht durch die Suite erzwungen.

**Zeitzonen:** Im geprüften Umfeld bestand nur V12-4; behoben über `formatBerlinDate` (`test/e2e-durchlauf.js:57,458`). Keine verbliebene Kombination „lokales `new Date(j,m,t)` + `toISOString()`" gefunden; `core/pdf-engine.js:666–676` baut/liest ein Datum rein lokal (Kalendertag-sicher, kein UTC-Vortag); `e2e/gymdocu.spec.js:167` nutzt SQL `AT TIME ZONE 'Europe/Berlin'`.

**Fehlerbehandlung:** Offen ist die Klasse bei V09-6 — `drawPaginatedTable` ruft `rowDrawer` ohne Einzelzeilen-Schutz (`pdf-engine.js:398–410`), ein NULL-Feld reißt das ganze Dokument. V12-7 ist geschlossen (Merker+Badge, keine unbehandelte Ablehnung mehr). Keine „verschluckten" DB-Fehler in den geprüften Pfaden gefunden, die als „in Ordnung" durchgehen; die `nFehler`-Zählung im mitarbeiter-Import degradiert Fehler jetzt sichtbar (`:782–815`).

**SQL:** Alle geprüften Abfragen tragen `studio_id` (monatskontrollen.js:100/116; jahrescheck.js:276/288; bezirk-archiv.js:153/167; pdf-engine.js:1498/1031; storage-replica.js:130–143). Einzige bewusst globale Zählung: `test_feature_mangel_nachtrag.js:400` (Negativkontrolle, strenger). Migration 0063 ist idempotent (`ADD COLUMN IF NOT EXISTS`, Textabgleich mit dem db.js-Schema im Kopf 14–17) und passt zum Schema.

## 4) Rechenschaft

**Gelesen (Auszüge/ganz):** core/file-crypto.js; core/jahrescheck.js; core/nachtrag-ergebnis.js; core/onedrive.js; core/hilfe-texte.js; core/monatskontrollen.js; core/pdf-pfad.js; core/pdf-jobs.js; core/pdf-engine.js (u. a. 378–430, 640–680, 880–1100, 1480–1560); core/db.js (710–795, 2558 ff.); core/korrekturen.js; core/signaturbild.js; core/unterschrift-regel.js; core/storage-replica.js; core/eingabe.js; core/passwort-validator.js; core/fehlerbehandler.js (Suche); routes/admin/mitarbeiter.js; routes/admin/geraete.js (6085–6415); routes/bezirk-archiv.js; routes/auth.js; routes/archiv.js; routes/korrekturen.js; routes/sichtpruefung.js (1465–1492, 3300–3322); public/offline-queue.js (komplett); public/qr-kamera-scan.js; e2e/gymdocu.spec.js; test/e2e-durchlauf.js; test_feature_mangel_darstellung_einheitlich.js; test_feature_mangel_nachtrag.js; test_feature_offline_queue_verhalten.js; test_feature_unterschrift_regel.js; test_feature_p3_eingabetypen_waechter.js; test_feature_jahrescheck.js; test_feature_c5c_pdf_abbruch.js; test_feature_c5c_korrekturblatt_ablauf.js; test_feature_c5d_stille_fehler.js; migrations/0063_storage_replica_claim_nr.sql; package.json; test/run.sh (Suchen); test/fixturen/unterschrift/erwartung.json (Auszug).

**Nicht entscheidbar (ausdrücklich):**
1. **P3-S1**, Teil 2: Das tatsächliche Verhalten von `bcrypt@^6` (package.json:10) bei Array-Argumenten ist im Repo nicht nachlesbar (node_modules nicht versioniert). Belegt ist nur: das Array erreicht `bcrypt.compare` (auth.js:1056/1810, archiv.js:815); die Login-/Passwortwechsel-Pfade fangen Fehler ab, die Archiv-Route `archiv.js:779–854` hat kein try um `:815`.
2. **P3-S1**, Quelle: `plaene/diffpruefung-p3.md` existiert nicht mehr (Lesewerkzeug: „Datei nicht gefunden"); die Kennung selbst kommt im Code nicht vor.
3. **V20-4**, Teil 2: Ob die manuellen Gegenproben als „erledigt" gelten sollen, hängt von der Auslegung ab; der Zustand (Prosa statt Automatik, mit Messwerten) ist belegt, das Datum der Nachträge nicht (kein git-log-Zugriff über die Werkzeuge).
4. **V05-6:** Ob der ursprüngliche Ausgang „Gerät ohne durchfuehrung" heute noch in einem realen Interleaving auftritt, ist ohne Lasttest nicht messbar; belegt ist: keine Per-Studio-Sperre, In-Loop-Lookup+Guard vorhanden, kein Unique-Schutz auf `(studio_id,kategorie_id,name)`.

[Bericht regulaer erstellt, Rundenlimit nicht erreicht.]

---
GELESENE DATEIEN:
  routes/admin/mitarbeiter.js:600-720
  core/file-crypto.js:50-103
  core/jahrescheck.js:255-300
  core/jahrescheck.js:435-475
  core/onedrive.js:20-100
  core/hilfe-texte.js:1610-1650
  routes/bezirk-archiv.js:130-175
  core/pdf-pfad.js:85-119
  routes/admin/mitarbeiter.js:720-830
  core/pdf-jobs.js:30-95
  core/pdf-engine.js:1235-1285
  core/db.js:710-740
  core/pdf-engine.js:430-460
  core/storage-replica.js:70-150
  public/offline-queue.js:40-120
  public/offline-queue.js:120-260
  core/pdf-pfad.js:1-85
  core/onedrive.js:100-135
  core/nachtrag-ergebnis.js:105-160
  core/hilfe-texte.js:1650-1690
  core/monatskontrollen.js:85-160
  routes/bezirk-archiv.js:175-181
  core/pdf-engine.js:1480-1560
  core/pdf-engine.js:640-680
  core/signaturbild.js:80-140
  public/offline-queue.js:260-400
  e2e/gymdocu.spec.js:160-210
  test/e2e-durchlauf.js:380-450
  core/nachtrag-ergebnis.js:60-104
  core/db.js:770-795
  core/korrekturen.js:325-360
  core/signaturbild.js:140-270
  public/offline-queue.js:400-560
  public/qr-kamera-scan.js:390-450
  test_feature_mangel_darstellung_einheitlich.js:60-170
  test/e2e-durchlauf.js:1-80
  core/monatskontrollen.js:1-84
  core/pdf-jobs.js:1-29
  core/unterschrift-regel.js:1-140
  public/offline-queue.js:560-700
  e2e/gymdocu.spec.js:210-276
  test/e2e-durchlauf.js:450-480
  test_feature_mangel_nachtrag.js:355-400
  core/pdf-jobs.js:150-230
  routes/auth.js:1030-1060
  routes/archiv.js:795-820
  test_feature_mangel_darstellung_einheitlich.js:170-270
  core/pdf-engine.js:880-1010
  core/pdf-engine.js:1010-1100
  core/eingabe.js:1-41
  routes/auth.js:995-1015
  routes/archiv.js:770-790
  routes/auth.js:1795-1815
  test_feature_nutzung_nachtrag.js:378-400
  public/offline-queue.js:700-868
  routes/auth.js:1015-1100
  test_feature_mangel_darstellung_einheitlich.js:270-360
  test_feature_mangel_nachtrag.js:300-340
  core/pdf-jobs.js:330-384
  routes/admin/geraete.js:6262-6340
  core/korrekturen.js:1-60
  core/pdf-jobs.js:95-150
  routes/korrekturen.js:18-50
  routes/admin/geraete.js:6355-6415
  test_feature_c5d_stille_fehler.js:175-228
  core/nachtrag-ergebnis.js:160-202
  test_feature_unterschrift_regel.js:1-75
  test_feature_offline_queue_verhalten.js:336-360
  routes/sichtpruefung.js:1465-1492
  routes/admin/geraete.js:6085-6125
  test_feature_c5c_pdf_abbruch.js:100-135
  routes/archiv.js:820-860
  test_feature_jahrescheck.js:55-150
  test_feature_c5c_korrekturblatt_ablauf.js:130-155
  core/passwort-validator.js:1-60
  routes/auth.js:1815-1845
  core/pdf-engine.js:378-430
  routes/admin/mitarbeiter.js:545-575
  routes/bezirk-archiv.js:1-70
  test_feature_p3_eingabetypen_waechter.js:1-140
  routes/sichtpruefung.js:3300-3322
  migrations/0063_storage_replica_claim_nr.sql:1-18
GESCHWAERZTE STELLEN (Geheimnis-Riegel; dort war die Pruefung blind):
  test/e2e-durchlauf.js:25 (Verbindungszeichenfolge mit Passwort)
ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; andere Teile derselben Datei koennen geliefert worden sein):
  (keine)
Suchen: 57  Lesungen: 84  Ablehnungen: 2
Runden: 19  Token rein: 2557504  Token raus: 86515
Kosten geschaetzt: $0.8711
Protokoll: /tmp/claude-0/-home-user-Belehrungssystem/c200d6d7-f0a2-5a02-8fb8-a4f662e3a700/scratchpad/c6/prot-z5b.jsonl
