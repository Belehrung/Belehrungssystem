# C6-Verdichtung — alle noch offenen Punkte

Gelesen: **31 Dateien `plaene/offene-befunde-*.md`** (vollständige Liste unten in der Zählung) plus **`plaene/c5-entscheidungen.md`**; zusätzlich zur Filterabsicherung `plaene/c5-zustand-30-09.md` (312 Zeilen) und gezielte Suchen in den acht C5-Auftragsdateien.

Filter angewandt: erledigt/durchgestrichen raus; die 18 „so lassen"-Entscheidungen und die „entschieden"-Fälle raus; Kennungen, die in C5-Aufträgen vorkommen, raus — außer sie stehen in einer neueren c5x/drift-Liste wieder offen; Ausnahmen: die Server-Schritte H2-D8/P2-S1, die `c5-entscheidungen.md` ausdrücklich als „bleiben offen" führt.

Kurznamen in Spalte 2 = `plaene/offene-befunde-<name>.md` (z. B. „c5e" = `offene-befunde-c5e.md`).

| Kennung | Quelldatei | Kurzbeschreibung (≤20 W.) | Art | Schwere laut Quelle | Fundstelle laut Quelle |
|---|---|---|---|---|---|
| F2 | c5a | „neu-single": Transaktionsfehler lässt Alteintrag (Hash/Prüfcode) auf der neuen Datei; eindeutige Zieldatei nötig | Code | unbenannt | diffpruefung-c5a.md |
| B8 | c5a | Sieben Formulare prüfen nur Datumsformat, nicht Kalendertag | Code | unbenannt | belehrungen.js:1638,1796; module.js:3530,3604,3679,3755; sichtpruefung.js:3287 |
| F4 | c5a | `healthMetrics()` zählt tote Jobs aller Typen; 7-Tage-Abräumung nur für `storage_replicate` | Code | unbenannt | diffpruefung-c5a.md |
| F7 | c5a | 409-Erkennung auf den Löschwegen hängt am Constraint-Namen | Code | unbenannt | diffpruefung-c5a.md |
| F3 / R2-4 | c5a | Wartezeit am Monats-Lock unbegrenzt, keine Rückmeldung; Haltezeit umfasst ganze PDF-Erzeugung | Code | unbenannt | diffpruefung-c5a.md |
| R2-1 | c5a | Verliert `mitMonatsLock` die Lock-Verbindung, läuft `arbeit()` ohne Serialisierung weiter (nur Meldung) | Code | unbenannt | diffpruefung-c5a.md |
| F5 | c5c | Zählfehler im Monatslauf erzwingt leeren Monat; `pdf_archiv`-Zeile verhindert dauerhaft Nachholen | Code | unbenannt | diffpruefung-c5c.md |
| c5c#1 (finalize) | c5c | Prozess-Tod vor `renameSync`: verwaiste `verify_dokumente`-Zeile, `GET /v/<code>` ohne Datei; bewusst ohne Reparatur | Code | unbenannt | c5c, Nacharbeit 1 |
| c5c#2 (Monatslauf) | c5c | `vormonatNachholen` holt nichts nach, sobald ein `pdf_archiv`-Eintrag existiert; Module k..7 verlieren Nachweise | Code | unbenannt („echter Nachweisverlust") | c5c, Nacharbeit 1 |
| c5c#3 (Doppelte Meldung) | c5c | `entferneDatei` meldet selbst, Ernte zählt zusätzlich `fehler`; tägliche Wiederholmeldung möglich | Code | unbenannt | c5c, Nacharbeit 1 |
| R2-5 | c5c | Lesepfad prüft nur Existenz, nicht Hash; falscher Inhalt unter öffentlichem Namen ergibt still `missing:false` | Code | unbenannt | diffpruefung-c5c.md |
| CI-Wettlauf | c5c | `navResp.status()` bei `navResp === null`; Test wartet nicht auf die selbst ausgelöste Navigation | Test | unbenannt (CI rot) | test_feature_csp_crawler.js:961 |
| D-E1 | c5d | `/module/wartung/sperre/:id/mail` setzt `mail_gesendet_am` vor Senden zurück; parallele Klicks senden doppelt | Code | unbenannt (Bestand) | diffpruefung-c5d.md |
| F6 | c5d | Ersthelfer-Nachweise: `inaktiv_seit` nur beim Löschen, nicht beim Deaktivieren; Löschfrist läuft nie | Betreiber-Frage | Betreiber | core/retention.js:392 |
| c5d#1 (Randleerraum) | c5d | `mitarbeiter.name` kann aus Webhook Randleerraum tragen; Datenbereinigung braucht Migration | Code | unbenannt | diffpruefung-c5d.md |
| c5d#2 (Wartungsprüfung) | c5d | Wartungsprüfung ohne Idempotenz: erneutes Absenden legt zweite Prüfung an | Code | unbenannt (Bestand) | diffpruefung-c5d.md |
| N1-H1 | c5d | `sendeMitarbeiterEinladung` loggt SMTP-Fehler unmaskiert; Empfängeradresse kann im Serverlog landen | Code | unbenannt | routes/mitarbeiter-auth.js |
| N1-H2 | c5d | Verbandbuch prüft ID-Format am ungetrimmten Rohwert; `" 5 "` wird mit 400 abgewiesen | Code | unbenannt | diffpruefung-c5d.md |
| B7 | c5d | Senden-Knopf im Sperr-Banner verwirft begonnene Prüfungseingaben; keine Entwurfspufferung | Code | unbenannt | routes/wartung.js; diffpruefung-c5d.md (N4) |
| T1-K4 | c5e | Einzelaufruf ohne `test/umgebung.sh` legt `<repo>/einweisung-nachweise/` an; den Einzelaufruf deckt nichts | Test | Anmerkung | test_feature_run_sh_wegwerf_variablen_static.js; diffpruefung-t1.md |
| qr_block-Kindprozess | c5e | `test_feature_qr_block.js` startet server.js mit `...process.env`; Live-`GYMDOCU_TG_*` werden geerbt | Test | unbenannt | test_feature_qr_block.js |
| V13-2 | c5e | `keine_systemeingriffe.js`: präzise Kommentare je Ausnahme fehlen (Nachzug nach E1-Merge) | Test | Anmerkung | test_feature_keine_systemeingriffe.js:156-164 |
| V23-6 | c5e | `[A-Za-z]`-Alternative schützt jeden Einzelbuchstaben nach Punkt | Test | Anmerkung | test_feature_rechtsaussagen.js:155-158 |
| V25-6 | c5e | `session`-Try/finally mit bedingtem RENAME fehlt | Test | Anmerkung | test_feature_session.js:162-164 |
| c5e#1 (wartung.js) | c5e | Falsche Formulierung „Mitternacht in der Prozesszone" wie V27-3 | Text-Kommentar | Anmerkung | routes/wartung.js:345,351-357 |
| c5e#2 (cwd-Leser) | c5e | Rund 40 Testdateien lesen relativ zum Arbeitsverzeichnis (Klasse V26-4) | Test | Anmerkung | C5-E2-Hinweise |
| c5e#3 (waisen) | c5e | Abfragen nur über `id` statt mit `studio_id` | Test | Anmerkung | test_feature_nachweis_waisen.js:250,301,308,326-328,336,362-363 |
| c5e#4 (V24-4) | c5e | gii-xml-Paare nicht abgedeckt | Test | Anmerkung | C5-E2-Hinweise |
| E3-a | c5e (auch q: E2E-Drift) | `test/e2e-durchlauf.js` auf master rot (17 ✓, 5 ✗, dann TypeError); nicht in `run.sh`, Ursache ununtersucht | Test | unbenannt | test/e2e-durchlauf.js:332 |
| E3-b | c5e | Drei Testdateien nur gegen fest verdrahtete `gymdocu_test` prüfbar (audit_batch3, qr_charge, bodyparser_und_sequenz) | Test | unbenannt | C5-E3 |
| E3-c (E-5) | c5e | Tabellen-Zusicherung in `test_feature_session.js` prüft nur Normalfall; Wurf-Pfad unbelegt | Test | unbenannt | test_feature_session.js |
| E3-d (E-6) | c5e | Anker in `kind_umgebung.js` prüfen nur Aufruf, nicht Wirkung (durch systemischen Export entschärft) | Test | unbenannt | test_feature_kind_umgebung.js Teil 2/3 |
| E3-e | c5e | Weitere fest auf `gymdocu_test` verdrahtete Tests (deprovision, schluessel_rotation, migrations, pdf_jobs, storage_replica, korrekturen, getraenke_race u. a.) | Test | unbenannt | C5-E3 |
| Q1 | c5g | `test_feature_qr_journal.js` hängt von absoluter Studionummer ab; abgerissene Journalzeile trifft Studioanfänge | Test | unbenannt | core/qr-token.js:408-420 |
| G1-a | c5g | Fehlt `FOTO_DIR` (ENOENT), zählt das als Stufenausfall; CLI ohne Serverstart meldet Exit 2 | Code | unbenannt | diffpruefung-c5g1.md |
| G1-b | c5g | `fuehreLoeschungenAus`: fünfte Wurzel ohne Referenzprüfung erlaubt | Code | unbenannt | core/retention.js |
| G1-c | c5g | Sechs Aufrufstellen in `routes/belehrungen.js` nur statisch geprüft | Test | unbenannt | routes/belehrungen.js |
| G1-d (U-LOE2) | c5g (auch unlink) | Scheitert die Transaktion zweimal, zeigt `storage_replica`-Zeile nach Reaper auf gelöschte `.enc` | Code | unbenannt | core/storage-replica.js:410-411 |
| G1-e | c5g | Veralteter Sperr-Übergangswert wird zurückgesetzt, aber nicht erneut versendet; kein Auto-Versandweg | Code | unbenannt | diffpruefung-c5g1.md |
| G1-f | c5g | Cron des Foto-Reapers in `server.js` gibt `stufenFehler` nicht in der Zusammenfassung aus | Code | unbenannt | server.js |
| G1-g | c5g | `test_feature_storage_replica_loeschauftrag.js` prüft hart auf `/gymdocu_test` | Test | unbenannt | test_feature_storage_replica_loeschauftrag.js |
| G1-h (V07-8) | c5g | Tod nach `sendMail` vor `versandBestaetigen` (oder >30 min) → Mail geht doppelt raus | Code | unbenannt | core/defekt_mailer.js |
| E-2 | c5g | `/intern/export`: Hauptserver liest `erhebungsfehler` nicht; Betreiber erfährt es nur über `melde()` | Code | unbenannt | core/offboarding-core.js:98 |
| c5g#1 (Deckung) | c5g | `acorn` und `ipaddr.js` in `ops/export-check-deckung.json` erfasst, aber nicht gelistet | Code | Anmerkung | ops/export-check-deckung.json |
| L-7 | c5g | Queue-Einträge hängen am anstoßenden Studio; nach Offboarding verarbeitet sie niemand | Code | unbenannt | diffpruefung-c5g1.md |
| C-6 | c5g | Eingefrorene DB (TCP offen, keine Antwort): PDF-Worker steht still, nur Heartbeat sichtbar | Code | unbenannt | diffpruefung-c5g1.md |
| C-7 | c5g | DB-Ausfall im Upload-Fehlerweg: Datei bleibt ohne Queue-Eintrag liegen und wird nie geräumt | Code | unbenannt | diffpruefung-c5g1.md |
| R2-7 | c5g | Foto-Reaper: Endet Stufe 1 mit `fehler`, wirft Stufe 2 erneut; Meldung „waisen: fehler" statt Zahl | Code | unbenannt | diffpruefung-c5g1.md |
| R2-11 | c5g | Offboarding-Aufräumlauf: absoluter `.enc`-Pfad genügt zum Löschen; Root-Riegel fehlt | Code | unbenannt | diffpruefung-c5g1.md |
| G1 | drift | Nach `ALTER COLUMN TYPE` passt Constraint-Ausgabe nicht zur frischen Regel; 0066 noticet, Wächter warnt | Code/Test | unbenannt | diffpruefung-drift-0066.md (Abschnitt 7b) |
| C2-S1 | c2 | Verbandbuch-PDF-Route und statischer `/pdf`-Wächter liefern ohne Weitergabe-Eintrag; Rechtsfrage | Betreiber-Frage | Betreiber | routes/verbandbuch-admin.js:536-582 |
| C2-S5 | c2 | Toter `correction_sheet`-Job hält Health dauerhaft „degraded"; kein Requeue-Weg | Code | sollte | core/pdf-jobs.js:368 |
| C2-S7 | c2 | `verify_dokumente`-Zeile bleibt für nie ausgeliefertes Dokument (auch Tod vor `rename`); Zurückziehen berührt append-only | Betreiber-Frage | Entscheidung nötig | diffpruefung-c2.md (C2R2-6, C2R4-15) |
| C2-S8 | c2 | Monats-PDF bei kaputter Konfiguration ohne Hinweis; geschlossene Sonntage erscheinen als fehlende Kontrollen | Code | unbenannt | (Teil von C2-7) |
| C3a-S2 | c3a | Defekt-/Wartungsmail ohne Wiederholungsweg; scheitern Versand oder Claim, ruft niemand erneut | Code | unbenannt | (Auslöser: POST …/neue-fotos/fertig) |
| C3b4-1..4 | c3b | N3i-Kommentar falsch zugeordnet; `catch (me)` um `melde()` ohne `console.warn`; Negativkontrollen/Endzustandszeile kennzeichnen | Test/Text-Kommentar | gering | core/storage-replica.js:798 u. a. |
| G-B7 | g | `tools/mutationsprobe.js:520-527` baut Kind-Umgebung selbst statt `test/umgebung.sh` zu sourcen | Test | unbenannt | tools/mutationsprobe.js:520-527 |
| H1a-S2 | h1a | Safari/WebKit ungemessen; Report-Only-Phase muss WebKit-Berichte enthalten, bevor Enforce | Betreiber-Frage | Betreiber | core/csp.js:17; ops/SECURITY-HEADER.md:34-37 |
| H1a-S3 | h1a | Header-Zusicherung prüft den eigenen Patch, nicht nginx; belegt erst der live-check | Test | Anmerkung | test_feature_csp_crawler.js:620-627 |
| H1a-S5 | h1a | `/csp-bericht` ohne eigenes Zeitlimit; langsamer Rumpf hält bis `requestTimeout` (300,1 s) | Code | sollte | routes/csp-bericht.js:289-291 |
| H2-D8 | h2 | Ratenbegrenzung für `/login/tablet` in nginx (`limit_req`); Block liegt vor, Umsetzung Betreiber | Server-Schritt | Betreiber | routes/auth.js:1165-1185 |
| ladebestand#1 | ladebestand | C9-Selbstscan-Fehlalarm, wenn Aufrufer-Variable wie Helfer-Parameter („antwort") heißt | Test | benannte Grenze | Diffprüfung R8, M4 |
| ladebestand#2 | ladebestand | C9-Prädikat erkennt `const { text } = r` nicht | Test | benannte Grenze | Auftrag R7, Punkt 2 |
| ladebestand#3 | ladebestand | Kommentar INNERHALB Template-Literal überlebt `maskiereKommentare()` | Test | benannte Grenze | Diffprüfung R6, A8 |
| ladebestand#4 | ladebestand | Riegel schlägt an `req.body['query']` an (reiner Lesezugriff) | Test | benannte Grenze | Auftrag R8, Punkt 3 |
| ladebestand#5 | ladebestand | Riegel sperrt jeden lokalen Ein-Buchstaben-Helfer `q(` | Test | benannte Grenze | Auftrag R7, Punkt 3 |
| ladebestand#6 | ladebestand | Schleifenrumpf in Funktion ohne `db` ziehen (strukturelle Lösung statt Musterjagd) — nicht gebaut | Code | benannte Grenze (wichtigster Punkt) | Planprüfung R4, C11 |
| P2-S1 | p2 | `fail2ban-client status` prüfen: lösen neue 400er/429 eine Studio-IP-Sperre aus? | Server-Schritt | Betreiber | deploy.yml:301-303 |
| PP4b-20 | p4 | Schwellen an synthetischen Figuren; Auswertung echter Unterschrifts-Protokollzeilen nach 4 Wochen Betrieb | Betreiber-Frage | offen (Termin) | planpruefung-p4-phase2.md |
| PP4b-21 | p4 | `core/signaturbild.js` dekodiert je Upload dreimal | Code | Leistung | core/signaturbild.js |
| PP4b-22 | p4 | `routes/spuelplan.js:324` verschluckt PDF-Fehler und meldet „gespeichert" | Code | unbenannt | routes/spuelplan.js:324 |
| R2-4 | q | Replay-Zuordnung der `defekt_ids` prüft nur Anzahl, nicht Menge der Formularindizes; Index speichern (Migration) | Code | unbenannt | diffpruefung-q.md |
| R3-8 | q | Captive Portal/Interceptor antwortet 200+HTML; Eintrag kreist unbegrenzt als „vorübergehend" | Code | unbenannt | diffpruefung-q.md (Runde 3) |
| R4-3 | q | Schreibversuch des `sitzung_ok`-Merkers kann still scheitern; nach Neuladen und zehnmal 500 entsteht `wiederholt` | Code | unbenannt | diffpruefung-q.md (Runde 4) |
| R4-9 | q | Eintrag mit `sitzung_ok` zeigt über `bereits_geprueft`/`validierung` dauerhaft Nachtrageliste (Studiowechsel) | Code | unbenannt | diffpruefung-q.md |
| N4-H1 | q | CSRF-403 bei ausgefallenem Offline-Speicher: Text sagt „Verbindung prüfen" statt „Seite neu laden" | Text-Kommentar | unbenannt | Bericht Nacharbeit 4 |
| N4-H2 | q | Nach Live-Submit mit abgelehnter Herkunft widersprechen gelber und grüner Kasten | Text-Kommentar | unbenannt | offene-befunde-q.md |
| SG-S1 | sg | `encryptBuffer(leer)` = 28 Byte, `decryptBuffer` verlangt ≥29 → leere Replika nicht wiederherstellbar | Code | unbenannt | core/file-crypto.js |
| SG-S3 | sg | `semgrep-hinweis.js`: Zusammenfassung im `catch` unmaskiert nach stdout (Workflow-Command-Kanal) | Code | sollte | ops/semgrep-hinweis.js:306-307 |
| V01-6 | vollpruefung | Unterschriftsdatum aus prozess-lokaler Zeit | Code | unbenannt | vollpruefung-befunde.md |
| V01-7r | vollpruefung | Rest: `datumPlusTage` bei Zeitumstellung auf UTC-Prozess | Code | Anmerkung | vollpruefung-befunde.md |
| V01-8 | vollpruefung | `mail_gesendet` für nicht enthaltene Typen | Code | unbenannt | vollpruefung-befunde.md |
| V02-2 | vollpruefung | Getränkeanlage löschen reißt Reinigungsnachweise per CASCADE mit; Oberfläche sagt Gegenteil | Code/SQL | mittel | vollpruefung-befunde.md |
| V02-3 | vollpruefung | Betriebszeiten: DB-Fehler → stille Standardkonfiguration | Code | mittel | vollpruefung-befunde.md |
| V02-4 | vollpruefung | Doppelter Reinigungs-POST meldet „gespeichert" | Code | unbenannt | vollpruefung-befunde.md |
| V02-5 | vollpruefung | Lageplan `parseFloat` ohne `isFinite` | Code | unbenannt | vollpruefung-befunde.md |
| V02-6 | vollpruefung | Negatives Reinigungsintervall | Code | unbenannt | vollpruefung-befunde.md |
| V02-7 | vollpruefung | `?ids=` ohne Obergrenze, still verschluckt | Code | Anmerkung | vollpruefung-befunde.md |
| V02-9 | vollpruefung | Health meldet `db:false` bei jedem Teilausfall | Code | Anmerkung | vollpruefung-befunde.md |
| V02-10 | vollpruefung | Datumswerte der Betriebszeiten nur formal geprüft | Code | Anmerkung | vollpruefung-befunde.md |
| V03-1 | vollpruefung | Verbandbuch-Weitergabe-Protokoll scheitert still (`catch (x) {}`) | Code | mittel | vollpruefung-befunde.md |
| V03-2 | vollpruefung | `ladeFotos()` verschweigt DB-Fehler | Code | unbenannt | vollpruefung-befunde.md |
| V03-3 | vollpruefung | Spülprotokoll ohne Doppelsende-Schutz | Code | unbenannt | vollpruefung-befunde.md |
| V03-4 | vollpruefung | Tablet-Zeiten in Prozesszeit geparst; zuerst TZ des Live-Servers messen | Code | unbenannt | vollpruefung-befunde.md |
| V03-5 | vollpruefung | Eskalationsstunde aus Prozesszeit | Code | unbenannt | vollpruefung-befunde.md |
| V04-1 | vollpruefung | Fachfirma-Prüfdatum nicht als Kalenderdatum geprüft | Code | sollte | vollpruefung-befunde.md |
| V04-4..17 | vollpruefung | Sammlung Bereich 04: TZ-Randfälle, Leistung, Texte, Magicline-Randfälle | Code/Test | unbenannt (gesammelt) | plaene/vollpruefung-befunde.md |
| V05-6 | vollpruefung | „Übernehmen" je Studio serialisieren, in Sperre erneut suchen (Import-Rennen) | Code | sollte | routes/admin/mitarbeiter.js:663-665 |
| V07-9 | vollpruefung | `decryptStream` lädt ganze Datei in den Speicher (`chunks`) | Code | Anmerkung | core/file-crypto.js:76-78 |
| V08-1 | vollpruefung | Jahres-Check: Name der Bestätigung per `MAX` statt aus jüngster Zeile; Test mit nur einer Zeile | Code/Test | unbenannt | vollpruefung-befunde.md |
| V08-2 | vollpruefung | `nachtragBanner()` liest geerbte Eigenschaften (`constructor`, `__proto__`) | Code | unbenannt | vollpruefung-befunde.md |
| V08-3 | vollpruefung | OneDrive ohne Zeitlimit (Backend inaktiv) | Code | Anmerkung | vollpruefung-befunde.md |
| V08-5 | vollpruefung | `hilfeButton` ignoriert `position` | Code | Anmerkung | vollpruefung-befunde.md |
| V08-6 | vollpruefung | `ladeMonatliche()` lädt zu viel | Code | Anmerkung | vollpruefung-befunde.md |
| V09-4 | vollpruefung | Bezirk-Archiv: `sendFile` ohne Wurzelprüfung | Code | unbenannt | vollpruefung-befunde.md |
| V09-5 | vollpruefung | `validateStorageReplicate(null)` TypeError | Code | unbenannt | vollpruefung-befunde.md |
| V09-6 | vollpruefung | Pausen-PDF scheitert an NULL-Zeit | Code | unbenannt | vollpruefung-befunde.md |
| V09-7 | vollpruefung | `core/` importiert `routes/betriebszeiten` | Code | Anmerkung | vollpruefung-befunde.md |
| V09-9 | vollpruefung | Detailabfrage in Doppelschleife | Code | Anmerkung | vollpruefung-befunde.md |
| V10-2 | vollpruefung | Signaturprüfung ohne Untergrenze: ein schwarzes Pixel gilt als Unterschrift | Code | mittel (vor dem Pentest) | vollpruefung-befunde.md |
| V10-3 | vollpruefung | Replik-`attempts` bei neuem Inhalt nicht zurückgesetzt → neue Version still ungespiegelt | Code | mittel | vollpruefung-befunde.md |
| V12-1 | vollpruefung | Offline-Warteschlange wiederholt Foto-Endzustände (409) endlos | Code | mittel | public/offline-queue.js:167-175 |
| V12-2 | vollpruefung | `fotosNachziehen` ruft `qPut` ohne Foto-Rest; bei `fotos.length === 0` wäre `qDelete` nötig | Code | Anmerkung | public/offline-queue.js:281 |
| V12-3 | vollpruefung | E2E-Datensparsamkeit ohne Status/Anker — grün bei 500 | Test | mittel | vollpruefung-befunde.md |
| V12-4 | vollpruefung | e2e-durchlauf bildet Monat aus lokaler Zeit (`getFullYear/getMonth`) statt `formatBerlinDate` | Test | Anmerkung | test/e2e-durchlauf.js:426-427 |
| V12-5 | vollpruefung | e2e-durchlauf schreibt nach `belehrungen-uploads` ohne PDF_ROOT/Upload-Umleitung; nicht in `run.sh` | Test | sollte | test/e2e-durchlauf.js:402,410 |
| V12-6 | vollpruefung | `utcJetzt()` umbenennen (2 Stellen) und Kommentar schärfen | Text-Kommentar | Anmerkung | public/offline-queue.js:61-63,270 |
| V12-7 | vollpruefung | `qDelete`-Aufruf und äußere Sync-Kette ohne `.catch`; Badge zeigt Speicherausfall nicht | Code | Anmerkung | public/offline-queue.js:231-234,322-373 |
| V12-8 | vollpruefung | `qr-kamera-scan.js`: alter Stream wird beim Neustart nicht gestoppt | Code | Anmerkung | public/qr-kamera-scan.js:411-424 |
| V20-4 | vollpruefung | `mangel_darstellung_einheitlich`: Gegenproben in die Suite holen oder als „manuell" führen | Test | Anmerkung | test_feature_mangel_darstellung_einheitlich.js:95-101,152-156 |
| P3-S1 | vollpruefung | Felder ohne `.trim()` speichern Arrays; `passwort` als Array an `bcrypt.compare` (unbelegt) | Code | gering | plaene/diffpruefung-p3.md |
| A-4 | w | Unprivilegierte User-Namespaces im Kind (`unshare -r`); seccomp/sysctl im Lauf prüfen | Server-Schritt | unbenannt | diffpruefung-w.md |
| A-1b | w | Ganz `/etc` ro sichtbar; nur benötigte Dateien einbinden | Code | unbenannt | diffpruefung-w.md |
| S13 | w | `/var/lib/dsv1` bleibt leer und root-eigen; beim Aufräumen entfernen oder bewusst lassen | Server-Schritt | unbenannt | diffpruefung-w.md |

**Positivkontrolle:** T1-K4 (c5e), Q1 (c5g), D-E1 (c5d), F5 (c5c), F2 (c5a) — alle fünf enthalten. ✔

## Zahl der Zeilen je Quelldatei

| Datei | Zeilen | Datei | Zeilen | Datei | Zeilen |
|---|---|---|---|---|---|
| offene-befunde-c1.md | 0 | offene-befunde-c2.md | 4 | offene-befunde-c3a.md | 1 |
| offene-befunde-c3b.md | 1 | offene-befunde-c5a.md | 6 | offene-befunde-c5c.md | 6 |
| offene-befunde-c5d.md | 7 | offene-befunde-c5e.md | 14 | offene-befunde-c5g.md | 16 |
| offene-befunde-d.md | 0 | offene-befunde-db-init.md | 0 | offene-befunde-dep.md | 0 |
| offene-befunde-drift.md | 1 | offene-befunde-g.md | 1 | offene-befunde-gh.md | 0 |
| offene-befunde-h1a.md | 3 | offene-befunde-h2.md | 1 | offene-befunde-ladebestand.md | 6 |
| offene-befunde-p2.md | 1 | offene-befunde-p4.md | 3 | offene-befunde-pentest-p1.md | 0 |
| offene-befunde-q.md | 6 | offene-befunde-qrj.md | 0 | offene-befunde-s6.md | 0 |
| offene-befunde-sg.md | 2 | offene-befunde-sperrordnung.md | 0 | offene-befunde-t2.md | 0 |
| offene-befunde-testsuite.md | 0 | offene-befunde-unlink.md | 0 | offene-befunde-vollpruefung.md | 42 |
| offene-befunde-w.md | 3 | | | **Summe** | **124** |

## Rechenschaft

**Gelesen:** alle 31 angeforderten `offene-befunde-*.md` (Zahl oben in der ersten Tabellenhälfte nachgewiesen) + `c5-entscheidungen.md`; zur Filterabsicherung zusätzlich `c5-zustand-30-09.md` und Suchen in den C5-Aufträgen (c5a-db, c5b-sperren-melden, c5c-n1, c5c-pdf-qr, c5d-routen, c5e-tests, c5f-ci-doku, c5g-kern-ops).

**Sicher nicht aufgenommen (Beispiele):** erledigt/durchgestrichen — C1-S1/S2/S3 (in den Aufträgen als „behoben" bestätigt, c5a-db:140, c5b:160), D-W1, GH-S1/S2, H1a-S4, C2-S18, C3a-S6, V04-2/3, V05-5, V07-1, V09-1/2/3, V11-5/7, V16-1/6, V17-1/4, V18-1, V19-1/2, V20-1/2, V21-1..5, V23-1/2, V24-1/2, V25-1/2/3, V26-1/2, R6-13, R7-9, ladebestand 7–21. Entschieden laut `c5-entscheidungen.md`: DEP-3, H2-R2-2, PP4b-19, PP4b-23, W-1, V25-5, B1, V1, QJ-S1, QJ6-8, QJ6-MU31, QJ9-A, QJ8-B3, V08-4, U-LOE1, U-LOE3, C2-S12, R5-12. In C5-Aufträgen bearbeitet (per Auftragsliste und/oder Treffer in den Auftragsdateien): u. a. C2-S2/3/4/6/9–17, C3a-S1/3/4/5/S-FK/S-FK2/S7, C3b-S1/S2/S3/3-4, DBI-1/2, DEP-1/2/4/5, GH-S3–S8, P2-S2–S7, T2-S1–S4, TS-1, U-REAP1, N9-b, R7-8, R9-12b, V06-1..9, V07-2–8, V10-4–6, V11-2..9, V13-1/3, V14-3–7, V15-1a/1r/2, V16-2/3/5/7, V17-2/3, V18-2–6, V19-3–5, V20-3, V21-6, V22-2–4, V23-3–5, V24-3, V25-4, V26-3/5, V27-1–7, Sperr-1–4, A3/F1/R2-N, G-V1, H1a-S1/S6, H2-R2-1/3/4, SG-S2, V02-1t, ladebestand#20.

**Positiv aufgenommen trotz C5-Kennung:** H2-D8 und P2-S1 — `c5-entscheidungen.md` führt sie ausdrücklich als „Später — bleiben offen" (Server-Schritte); ferner alle Punkte, die in c5a/c5c/c5d/c5e/c5g/drift erneut als offen stehen (darunter F2, F5, D-E1, Q1, T1-K4, V13-2, V23-6, V25-6, V24-4, V26-4, V07-8, U-LOE2).

**Unklare/erklärungsbedürftige Zuordnungen:**
1. **E2E-Drift (q.md) = E3-a (c5e):** derselbe Testbefund; nur einmal gezählt (unter c5e), q.md daher 6 statt 7 Zeilen.
2. **U-LOE2 (unlink.md) = G1-d (c5g):** einmal gezählt unter c5g, daher unlink.md 0 eigene Zeilen.
3. **V07-8 (vollpruefung) = G1-h (c5g):** einmal gezählt unter c5g.
4. **V13-2, V23-6, V25-6, V24-4, V26-4, T1-K4** stehen auch in `vollpruefung.md`; dort als Sammeleinträge („V13-1..3" usw.) enthalten, hier einmal unter c5e gezählt.
5. **ladebestand Punkt 20** („M10-Prämisse": Zustand teilweise/Anmerkung, Zuordnung „auftrag"; „nicht entscheidbar" laut b4a3) — nicht aufgenommen, weil als bearbeitet geführt und die beschriebenen Meldungen weg sind.
6. **V22-1** („teilweise | erledigt", Wächter prüft weiter nur `PDF_ROOT`; an T1-K4 gekoppelt) — nicht separat aufgenommen; die offene Restfrage steckt in T1-K4.
7. **Sammeleinträge** V04-4..17, V12-2/4..8, V13-1..3, V16-2,3,5..7, V17-1..4, V18-1..6, V19-1..5+V26, V21-1..6, V22-2..4, V23-1..6, V24-1..4, V25-3..6, V27-1..7: aufgelöst; nur die nicht in C5 bearbeiteten Einzelkennungen sind oben gelistet (V27-1..7 sind in `auftrag-c5e-tests.md` beauftragt und dort nicht als offen zurückgemeldet → raus; c5e führt nur die abweichende Formulierung in `routes/wartung.js` als c5e#1).
8. **Doppelkennung R2-4:** zwei verschiedene Punkte (q.md: Replay-Zuordnung; c5a: Monats-Lock-Wartezeit) — beide aufgenommen und durch die Quellspalte unterschieden.
9. **c5e#1..4 und c5c#1..3, c5d#1..2, c5g#1, ladebestand#1..6** haben in der Quelle keine Kennung; vergeben nach Vorgabe `<datei>#<laufende Nr>`.

**Gelesene Dateien insgesamt:** 31 `offene-befunde-*.md` + `c5-entscheidungen.md` = 32; ergänzend `c5-zustand-30-09.md` und Sichtprüfung der acht `auftrag-c5*.md`.

[Bericht regulaer erstellt, Rundenlimit nicht erreicht.]

---
GELESENE DATEIEN:
  plaene/c5-entscheidungen.md:1-38
  plaene/offene-befunde-c1.md:1-11
  plaene/offene-befunde-c2.md:1-45
  plaene/offene-befunde-c3a.md:1-30
  plaene/offene-befunde-c3b.md:1-16
  plaene/offene-befunde-c5a.md:1-15
  plaene/offene-befunde-c5c.md:1-17
  plaene/offene-befunde-c5d.md:1-14
  plaene/offene-befunde-c5e.md:1-29
  plaene/offene-befunde-c5g.md:1-31
  plaene/offene-befunde-d.md:1-8
  plaene/offene-befunde-db-init.md:1-8
  plaene/offene-befunde-dep.md:1-12
  plaene/offene-befunde-drift.md:1-12
  plaene/offene-befunde-g.md:1-8
  plaene/offene-befunde-gh.md:1-14
  plaene/offene-befunde-h1a.md:1-12
  plaene/offene-befunde-h2.md:1-11
  plaene/offene-befunde-ladebestand.md:1-74
  plaene/offene-befunde-p2.md:1-25
  plaene/offene-befunde-p4.md:1-11
  plaene/offene-befunde-pentest-p1.md:1-11
  plaene/offene-befunde-q.md:1-11
  plaene/offene-befunde-qrj.md:1-33
  plaene/offene-befunde-s6.md:1-7
  plaene/offene-befunde-sg.md:1-10
  plaene/offene-befunde-sperrordnung.md:1-19
  plaene/offene-befunde-t2.md:1-21
  plaene/offene-befunde-testsuite.md:1-9
  plaene/offene-befunde-unlink.md:1-22
  plaene/offene-befunde-vollpruefung.md:1-104
  plaene/offene-befunde-w.md:1-11
  plaene/c5-zustand-30-09.md:1-312
GESCHWAERZTE STELLEN (Geheimnis-Riegel; dort war die Pruefung blind):
  (keine)
ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; andere Teile derselben Datei koennen geliefert worden sein):
  (keine)
Suchen: 9  Lesungen: 33  Ablehnungen: 0
Runden: 8  Token rein: 427460  Token raus: 81720
Kosten geschaetzt: $0.2263
Protokoll: /tmp/claude-0/-home-user-Belehrungssystem/c200d6d7-f0a2-5a02-8fb8-a4f662e3a700/scratchpad/c6/verd-prot.jsonl
