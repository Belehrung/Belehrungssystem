# Sammelstand C5/C6 — alle offenen Punkte der Sammellisten (30.09.2026)

Verdichtet von `deepseek-flash` aus 24 `offene-befunde-*.md` (Stand d3f7251); Stichprobe (Sperr-1, V12-1, U-REAP1, ladebestand-7) vom Haupt-Agenten gegen die Quellen gehalten. Maßgeblich bleiben die Sammellisten; diese Datei ist der Arbeitsindex. Bündel 2 und 5 → `auftrag-c5a-db.md`, `auftrag-c5b-sperren-melden.md`.

## Tabelle aller noch offenen Punkte

| Kennung | Datei | Kurzbeschreibung (max. 20 Wörter) | Art | Betroffene Codestelle |
|---|---|---|---|---|
| C1-S1 | c1 | QR: aktiver Block ohne eigene Journalspur + kaputte Zeile → keine Sperre | Betreiber-Entscheidung | |
| C1-S2 | c1 | a194 für Unterschriften-Wächter unsichtbar, solange Muster statt Zuordnungsliste geprüft wird | Code | |
| C1-S3 | c1 | Verklemmungen von db.init() mit gleichzeitigen INSERT unterschriften | Code | db.init() |
| C2-S1 | c2 | Offene Verbandbuch-PDF-Route und statischer /pdf-Wächter ohne Eintrag in verbandbuch_weitergaben | Code | routes/verbandbuch-admin.js:536-582 |
| C2-S2 | c2 | makeNeueFotosHandler: jeder Fehler endet als Erfolgsumleitung ?saved=1 | Code | routes/sichtpruefung.js:3562-3565 |
| C2-S3 | c2 | melde()-Drossel fasst gleichartige Fehler verschiedener Studios zusammen | Code | |
| C2-S4 | c2 | Hub-Berechnung in server.js für Wächter unsichtbar | Code | server.js |
| C2-S5 | c2 | Toter correction_sheet-Job hält Health dauerhaft degraded, kein Requeue-Weg | Code | |
| C2-S6 | c2 | Nach Ablehnung nach dem Commit entfallen Admin-Protokollmail und Servicetechniker-Frage | Code | |
| C2-S7 | c2 | Verbandbuch fail-closed: verify_dokumente-Zeile bleibt für nie ausgeliefertes, gelöschtes Dokument | Code | |
| C2-S8 | c2 | Monats-PDF bei kaputter Konfiguration ohne Hinweis | Code | |
| C2-S7 (erweitert) | c2 | Verify-Zeile ohne veröffentlichte Datei auch bei Prozesstod vor rename und gescheitertem rename | Code | |
| C2-S9 | c2 | core/korrektur-pdf.js:54 schreibt Korrekturblätter direkt unter öffentlichem Namen; Absturz hinterlässt halbe PDF | Code | core/korrektur-pdf.js:54 |
| C2-S10 | c2 | Renderfehler vor finalize lassen .tmp- und offenen Dateideskriptor liegen | Code | |
| C2-S11 | c2 | core/pdf-engine.js:517-519 registriereVerify vor renameSync; Registerzeile bleibt ohne Datei | Code | core/pdf-engine.js:517-519 |
| C2-S12 | c2 | Hartes Prozessende verliert FOLGEMELDUNG eines Fensters | Code | |
| C2-S13 | c2 | workers/pdf-job-worker.js hat keinen Signal-Weg für Sammelstufe | Code | workers/pdf-job-worker.js |
| C2-S14 | c2 | Zähler nach Halten eines Studios erscheinen erst im nächsten Fenster; Summenbildung ungetestet | Code | |
| C2-S15 | c2 | ERNTE_FEHLER meldet täglich, solange Anomalie liegt (Dauerrauschen möglich) | Code | |
| C2-S16 | c2 | Synchron hängender Webprozess reagiert mit JS-Signal-Handler nicht sofort auf SIGINT | Server-Schritt | |
| C2-S17 | c2 | test/helfer/datei-sperre.js:257-267 wertet Verstösse über process.on('exit') aus; Signal beendet Testprozess ohne Haken | Test | test/helfer/datei-sperre.js:257-267 |
| C3a-S1 | c3a | getraenkeanlage_reinigungen.aufgabe_id ohne FK: gelöschte Aufgabe entwertet Zuordnung | Code | core/pdf-engine.js:1434 |
| C3a-S2 | c3a | Defekt-/Wartungsmail ohne Wiederholungsweg: scheitern Versand oder Claim, ruft niemand erneut | Code | |
| C3a-S-FK | c3a | unterschriften.mitarbeiter ohne ON-DELETE-Klausel: Mitarbeiterlöschung scheitert | Code | core/db.js:1237 |
| C3a-S3 | c3a | Claim-Fehler im Mailer: Mail bleibt dauerhaft aus, nur Alarm; scheitert claimZurueck, stumm | Code | |
| C3a-S4 | c3a | vormonatNachholen zählt keine Getränkeanlage-Reinigungen | Code | generateMonthlyPDFs.js |
| C3a-S5 | c3a | Waisenprüfung in Migration 0062 ohne studio_id | Code | Migration 0062 |
| C3a-S-FK2 | c3a | kein Fremdschlüssel getraenkeanlage_reinigungen.aufgabe_id → getraenkeanlage_aufgaben | Code | |
| C3a-S6 | c3a | routes/admin/mitarbeiter.js Löschweg: DELETE FROM belehrung_freischaltung nach Commit in leerem catch {} | Code | routes/admin/mitarbeiter.js |
| C3a-S7 | c3a | routes/webhooks.js Upsert: inaktiv_seit folgt im Rennen altem JS-Wert | Code | routes/webhooks.js |
| C3b-S1 | c3b | Restfenster [Nachlesen … queue.succeed/deadLetter]: Zeile pending mit terminalem Job bis Reaper | Code | |
| C3b-S2 | c3b | Permanenter Fehler bei fehlender Zeile → toter pdf_jobs-Job ohne Zeile, Health degraded | Code | |
| C3b-S3 | c3b | C3b-6 (DB-INIT) | Code | |
| C3b3-4 | c3b | Fallback nach gescheitertem Enqueue schreibt vorab gebildeten Hash; bei Upsert Zeile dead mit veraltetem Hash | Code | routes/belehrungen.js:205-214 |
| C3b4-1..4 | c3b | N3i-Kommentar falsch; catch (me) um melde() ohne console.warn; Negativkontrollen kennzeichnen | Code | core/storage-replica.js:798 |
| D-B7 | d | usesGesamt >= 10 liegt auf ci.yml-Bestand; legitimer Wegfall gäbe Fehlalarm | Code | |
| D-B5 | d | zwei dominierte Zusicherungen im Wächter (StrictHostKeyChecking/UserKnownHostsFile) | Code | |
| DBI-1 | db-init | Abweichung, die SCHEMA nicht heilen kann, läuft einmal durch und wird als Stand festgehalten | Code | |
| DBI-2 | db-init | Erster Start nach Migration mit studio_id nimmt ShareRowExclusive auf neue Tabelle und studios | Code | |
| DEP-1 | dep | ops/export-check-deckung.json erfasst nodemailer 10 nicht | Code | ops/export-check-deckung.json |
| DEP-2 | dep | Kommentare nennen node_modules/nodemailer/lib/shared/index.js:59; in 10 dist/cjs/shared/index.js:85 | Doku | test/helfer/netz-sperre.js:41, test_feature_netzsperre.js:237 |
| DEP-3 | dep | GymDocu qs (moderate) bleibt offen | Code | |
| DEP-4 | dep | Hauptserver-Suite berührt Mailpfad nicht und hat keine Netzsperre | Test | |
| DEP-5 | dep | DEP-Bauende hat eigene Zweige per amend + --force-with-lease neu geschrieben | Doku | |
| G-B7 | g | tools/mutationsprobe.js:520-527 baut Kind-Umgebung selbst statt test/umgebung.sh zu sourcen | Code | tools/mutationsprobe.js:520-527 |
| G-V1 | g | DB-Prüfung in test/umgebung.sh nur per Handprobe belegt | Test | test/umgebung.sh |
| GH-S3 | gh | ob Dependabot Kennungen samt # vN-Kommentar nachzieht, erst nach erster Dependabot-Woche messbar | Beobachten-mit-Datum | |
| GH-S4 | gh | zizmor-Persona-Befunde (postgres:16 per Tag statt Digest, secrets-outside-env, concurrency-limits) | Code | |
| GH-S5 | gh | docs/PERFORMANCE_TESTS.md:78 Beispiel mit actions/checkout@v6 | Doku | docs/PERFORMANCE_TESTS.md:78 |
| GH-S6 | gh | Hauptserver ohne Workflow-Wächter | Code | |
| GH-S7 | gh | gitleaks liest Merge-Commits im PR nicht | Code | |
| GH-S8 | gh | Testköpfe nennen Suite „Deploy-Gate auf dem Live-Server“, ops/deploy.sh ruft sie nicht auf | Doku | test_feature_semgrep_hinweis.js, test_feature_gitleaks_hinweis.js |
| H1a-S1 | h1a | Acht Routen im Seiteninventar des Crawlers als „ungeprüft“ geführt | Code | |
| H1a-S2 | h1a | Safari/WebKit ungemessen (Tablets der Trainer) | Test | |
| H1a-S3 | h1a | Header-Zusicherung prüft eigenen Patch, nicht nginx | Code | |
| H1a-S5 | h1a | /csp-bericht ohne eigenes Zeitlimit: langsamer Rumpf hält Verbindung bis requestTimeout | Code | |
| H1a-S6 | h1a | Aufräumen der Rate-Map ohne Test, funktional gemessen | Test | |
| H2-D8 | h2 | /login/tablet ohne Cookie legt weiter je Anfrage eine 5-Minuten-Sitzung an | Server-Schritt | |
| H2-R2-1 | h2 | Marker auf Sitzungen ohne Merkmal stellt kein neues Cookie aus | Code | |
| H2-R2-2 | h2 | Zeichen-Riegel auch im Query-Teil | Code | |
| H2-R2-3 | h2 | cookie-signature im Test ohne Eintrag in package.json | Test | |
| H2-R2-4 | h2 | session-DDL in Tests uneinheitlich | Test | |
| ladebestand-1 | ladebestand | Helfer-Rumpf im C9-Selbstscan: Fehlalarm bei Variable wie Helfer-Parameter | Code | |
| ladebestand-2 | ladebestand | C9-Prädikat erkennt Destrukturierung const { text } = r nicht | Code | |
| ladebestand-3 | ladebestand | Kommentar INNERHALB Template-Literal überlebt maskiereKommentare() | Code | |
| ladebestand-4 | ladebestand | Riegel schlägt an req.body['query'] an (reiner Lesezugriff) | Code | |
| ladebestand-5 | ladebestand | Riegel sperrt jeden lokalen Ein-Buchstaben-Helfer q( | Code | |
| ladebestand-6 | ladebestand | Schleifenrumpf in Funktion ohne db ziehen — strukturelle Lösung | Code | |
| ladebestand-Verklemmung | ladebestand | Bekannter Verklemmungs-Kreis im Bestand (Seil-Tagescheck gegen Beurteilungs-Nachtrag) | Code | |
| ladebestand-docs | ladebestand | docs/offene-befunde-31-08-2026.md im GymDocu-Repo — allgemeine Befundliste | Doku | docs/offene-befunde-31-08-2026.md |
| ladebestand-7 | ladebestand | Riegel-Fixturen 4c: \bdb\b-Alternative unbewacht (db.run(1) trifft auch run() | Test | |
| ladebestand-8 | ladebestand | Klammer-Aufruf-Zweig nur für run mit Fixtur, nicht für one/tx/q/pool | Test | |
| ladebestand-9 | ladebestand | Keine Fixtur mit einfachen Anführungszeichen pool['query'] | Test | |
| ladebestand-10 | ladebestand | Leerraum-Toleranzen unbewacht | Test | |
| ladebestand-11 | ladebestand | Wortgrenzen \b in Durchlassfällen unbewacht | Test | |
| ladebestand-12 | ladebestand | Strukturelle Lösung für 7–11: Top-Level-Alternative programmatisch prüfen | Test | |
| ladebestand-13 | ladebestand | Mengenabfrage: studio_id = ANY($4) verengt Erkennung | Code | |
| ladebestand-14 | ladebestand | M5: srvEigen.listening === false nach close(cb) kann nie fallen | Test | |
| ladebestand-15 | ladebestand | M6: Ursachen und Rest nicht in EINER Meldung | Code | |
| ladebestand-16 | ladebestand | 4b bindet nur Längen, nicht Grenzen | Test | |
| ladebestand-17 | ladebestand | Kommentar zu ursache() beschreibt Kante verkehrt | Doku | |
| ladebestand-18 | ladebestand | Etiketten „4b“/„4c“ doppelt vergeben | Doku | |
| ladebestand-19 | ladebestand | M10-Prämisse im Kommentar falsch | Doku | |
| ladebestand-20 | ladebestand | Meldungen von Fixtur 1/3 und R3-Prosa beschreiben alte Klammerregel | Doku | |
| ladebestand-21 | ladebestand | Testabfrage zustandRows liest wartung_geraete nur über id, ohne studio_id | Test | |
| P2-S1 | p2 | fail2ban auf Server: nginx-Jail zählt 4xx, neue 400er können Studio-IP sperren | Server-Schritt | |
| P2-S2 | p2 | server.js QR-Block antwortet bei Bestellung existiert nicht/gehört nicht zu Studio 400 statt 404 | Code | server.js |
| P2-S3 | p2 | sendeWartungsDefektMail meldet nur false, ohne Grund | Code | |
| P2-S1 (ergänzt) | p2 | Login-Sperre antwortet seit P2 mit 429 — fail2ban-Regeln auch darauf prüfen | Server-Schritt | |
| P2-S4 | p2 | server.js:610 res.status(ergebnis.status).json — Status aus db.tx()-Zweigen, Wächter kennt nur Funktionsaufrufe | Code | server.js:610 |
| P2-S5 | p2 | Scanner-Grenzen: K2 nur für ${ident[.prop] ?, K1 nur const, typWache spricht frei | Test | test/helfer/fehlerstatus-scan.js |
| P2-S6 | p2 | melde()-Aufrufe an Verbandbuch-catch, Seil-Freigabe-catch, Vorlagen-Datei fehlt, PDFs fehlen ohne Zusicherung | Code | |
| P2-S7 | p2 | R2-15 (res.status(500) vor echtesSend in sichtpruefung.js) ohne Test | Test | routes/sichtpruefung.js |
| PP4b-20 | p4 | Schwellen an synthetischen Figuren gelernt; Tremor-Paradox. Auswertung nach 4 Wochen Betrieb | Beobachten-mit-Datum | |
| PP4b-21 | p4 | core/signaturbild.js dekodiert je Upload dreimal | Code | core/signaturbild.js |
| PP4b-22 | p4 | routes/spuelplan.js:324 verschluckt PDF-Fehler und meldet „gespeichert“ | Code | routes/spuelplan.js:324 |
| PP4b-19 | p4 | Helle Farben (Luminanz ≥ 128) gelten nicht als Tinte → „leer“ | Betreiber-Entscheidung | |
| PP4b-23 | p4 | Ein gerader Strich in zwei Ansätzen gilt als Unterschrift | Code | |
| B1 | pentest-p1 | Fehlerseite der zentralen Wache ohne Admin-Layout | Code | |
| A3 | pentest-p1 | /intern/bezirk-archiv/datei/:id: Formatfehler ohne Token → 400 statt 403 | Code | |
| F1 | pentest-p1 | routes/belehrungen.js /freischalten/:belehrungId: mitarbeiter_id ohne istGueltigeId | Code | routes/belehrungen.js |
| V1 | pentest-p1 | Eigene 400-Texte in admin/ausmusterung.js, geraete-typen.js, tablets.js und Altlink-Redirects unerreichbar | Code | routes/admin/ausmusterung.js, geraete-typen.js, tablets.js, routes/admin/mitarbeiter.js:1101-1107 |
| R2-N | pentest-p1 | test_feature_legionellen.js scheitert an Migration 0013, wenn andere Tests vorher liefen | Test | test_feature_legionellen.js |
| QJ-S1 | qrj | §5-Quellenvergleich blendet ausserhalb_bloecke-Korrekturspannen aus | Code | |
| QJ6-8 | qrj | Zeile mit schlüssellosem Vorspann und „genau Q“-Rest bleibt nach Freigabe unerledigt | Code | |
| QJ6-MU31 | qrj | Korrektur-Anfang MITTEN in Chargen-Abschnitt wird nicht als Bruchstück erkannt | Code | core/qr-verbrauch.js:933-940 |
| QJ7-K | qrj | Vollständigkeitsregeln des Lesers für Felder ohne Stichprobe (abschnitt, roh_sha256, durch/zeitpunkt) | Code | |
| QJ7-G | qrj | Benannte Grenzen: studio_id nur Präfix, --von, unlesbarer Typ, Frischprüfung, nr_bis, KORREKTUR_Z_BEFEHL, ungetestet, (v)-Text | Code | core/qr-verbrauch.js |
| QJ8-B3 | qrj | --art-laut-meldung nur an Wert, unlesbaren Typ und Länge 1–2 gebunden | Code | |
| QJ9-A | qrj | Schreibfehler-Meldung bindet Bereich ab groesseVorher nicht an eigene Bytes | Code | |
| QJ9-B | qrj | Tote Zweige, Test-Hook-Wurf verdeckt Schreibfehler, Kommentar zu commitUngewiss | Code | |
| S6-1 | s6 | Webhook-Upsert ohne id setzt extern_id auf NULL | Code | routes/webhooks.js:305 |
| SG-S1 | sg | core/file-crypto.js: encryptBuffer(leer) erzeugt 28 Byte, decryptBuffer verlangt ≥ 29 | Code | core/file-crypto.js |
| SG-S2 | sg | routes/archiv.js:824 fängt jeden Entschlüsselungsfehler als „Code falsch“ | Code | routes/archiv.js:824 |
| SG-S3 | sg | ops/semgrep-hinweis.js bildet Zusammenfassung unmaskiert; im catch-Fall nach stdout | Code | ops/semgrep-hinweis.js |
| Sperr-1 | sperrordnung | Retention hält Studio-Lock über ganze Löschung einer Tabelle (500 Zeilen 948 ms, 8000 → 20,8 s) | Code | |
| Sperr-2 | sperrordnung | Verschachtelte auditTx in offener Transaktion wird weder statisch noch zur Laufzeit erkannt | Code | |
| Sperr-3 | sperrordnung | Wächtergrenzen: berechneter Zugriff über Variable, Weitergabe unter anderem Namen, (t || db).run | Code | |
| Sperr-4 | sperrordnung | Rotation hält alle Studio-Locks bis Ende einer Gesamttransaktion | Betreiber-Entscheidung | ops/schluessel-rotieren.js |
| T2-S1 | t2 | lokal erzeugte, git-ignorierte Datei mit Rohwert macht Rohwert-Wächter lokal rot | Test | |
| T2-S2 | t2 | Selbsttests für V23-1 und V21-5; V18-2 falsches Rot bei Kommentar über 100 Zeichen | Test | |
| T2-S3 | t2 | V13-3 und V15-1a nur gemeldet; dieselbe [\s\S]*-Klasse in test_feature_korrektur_dokumente_static.js | Test | test_feature_korrektur_dokumente_static.js |
| T2-S4 | t2 | R2-2-Probe startet node über PATH von sudo | Test | test_feature_syntax_check_verhalten.js |
| TS-1 | testsuite | test_feature_monatslauf_poolverbindung.js:111-113 in voller Suite rot unter Last | Test | test_feature_monatslauf_poolverbindung.js:111-113 |
| U-REAP1 | unlink | kein Reaper für BELEHRUNGEN_UPLOAD_DIR und ersetzte Prüfberichte | Code | |
| U-LOE1 | unlink | loescheReplikaFuerDatei() setzt/löscht ganze Gruppe ohne Statusklausel; Erfolgs-UPDATE in processReplica() ohne Statusklausel | Code | |
| U-LOE2 | unlink | DB-Fehler in loescheReplikaFuerDatei() → Aufrufer kommen nicht wieder | Code | core/pdf-loeschung.js |
| U-LOE3 | unlink | Worker stirbt genau zwischen writeFile und 1c, während Studio gelöscht wird → Datei ohne Anker | Code | |
| R5-12 | unlink | stündlicher Reaper sequenziell (bis 200 × 10 s), Seq-Scan ohne passenden Index | Code | |
| R6-13 | unlink | Upsert setzt laufende Lease auf pending; Hash-Prüfung in processReplica nutzt replica.sha256 statt running.sha256 | Code | |
| N9-b | unlink | loescheStudioDateien überspringt Ziel ausserhalb PDF_ROOT STILL (ok:true) | Code | |
| R7-8 | unlink | Hauptserver als Verbraucher von cleanup_pending; 503 offboarding_queue_nicht_schreibbar; queue_fehlt fehlt im 503-Körper | Code | |
| R7-9 | unlink | core/error-tracker.js: Drossel über Signatur Error:- - gilt quellenübergreifend 15 min | Code | core/error-tracker.js |
| R9-12b | unlink | Jeder Test, der server.js lädt, installiert Prozess-Handler mit MODUL-internem melde | Test | |
| W-1 | unlink | Grenzen des statischen Wächters test_feature_unlink_leerer_rueckruf_static.js | Test | test_feature_unlink_leerer_rueckruf_static.js |
| V06-1 | vollpruefung | Vorgangsseite fällt bei DB-Fehler der Nebenabfrage ganz | Code | |
| V06-2 | vollpruefung | qr_charge-Lesen ohne studio_id im WHERE | Code | qr-druckdaten.js:246 |
| V06-3b | vollpruefung | Kommentar „ohne L“ in core/2fa.js:94 falsch | Doku | core/2fa.js:94 |
| V06-4 | vollpruefung | veralteter Kommentar zu nicht-numerischer :id | Doku | qr-bestellung.js:781 |
| V06-5 | vollpruefung | req.body ohne Absicherung | Code | qr-bestellung.js:1891 |
| V06-6 | vollpruefung | Doppelbestellung nach Prozess-Tod zwischen Mail und Commit | Betreiber-Entscheidung | |
| V06-7 | vollpruefung | formate: [null] besteht die Formprüfung | Code | |
| V06-8 | vollpruefung | GET /qr/kleben ohne eigenes try/catch | Code | |
| V06-9 | vollpruefung | 500 statt 422 für Datenzustände | Code | qr-druckdaten.js:361-366 |
| V01-1 | vollpruefung | S20-migrate.js REPLACE löscht zentral entstandene Tabellen mit | Code | S20-migrate.js |
| V01-2 | vollpruefung | setval in S20 nicht transaktional | Code | S20-migrate.js |
| V01-4 | vollpruefung | /admin/archiv/neu-single ersetzt Archiv-Eintrag nicht atomar | Code | |
| V01-5 | vollpruefung | 413-Meldung nennt 25 MB | Doku | |
| V01-6 | vollpruefung | Unterschriftsdatum aus prozess-lokaler Zeit | Code | |
| V01-7r | vollpruefung | Rest: datumPlusTage bei Zeitumstellung auf UTC-Prozess | Code | |
| V01-8 | vollpruefung | mail_gesendet für nicht enthaltene Typen | Code | |
| V01-9 | vollpruefung | S20-Overlap-Guard nur bei Offset > 0 | Code | |
| V01-10 | vollpruefung | S20 importiert unter fremde, schon belegte Studio-ID | Code | |
| V01-11 | vollpruefung | /admin/archiv/mail/:monat ungeprüft/unescaped | Code | |
| V02-1t | vollpruefung | Testfall „doppelt kodiertes ..“ in test_feature_mandantengrenze_dateiwege.js fehlt | Test | test_feature_mandantengrenze_dateiwege.js |
| V02-2 | vollpruefung | Getränkeanlage löschen reisst Reinigungsnachweise per CASCADE mit | Code | |
| V02-3 | vollpruefung | Betriebszeiten: DB-Fehler → stille Standardkonfiguration | Code | |
| V02-4 | vollpruefung | doppelter Reinigungs-POST meldet „gespeichert“ | Code | |
| V02-5 | vollpruefung | Lageplan parseFloat ohne isFinite | Code | |
| V02-6 | vollpruefung | negatives Reinigungsintervall | Code | |
| V02-7 | vollpruefung | ?ids= ohne Obergrenze, still verschluckt | Code | |
| V02-8 | vollpruefung | pdftoppm synchron | Code | |
| V02-9 | vollpruefung | Health meldet db:false bei jedem Teilausfall | Code | |
| V02-10 | vollpruefung | Datumswerte der Betriebszeiten nur formal geprüft | Code | |
| V08-1 | vollpruefung | Jahres-Check: Name der Bestätigung per MAX statt aus jüngster Zeile | Code | |
| V08-2 | vollpruefung | nachtragBanner() liest geerbte Eigenschaften (constructor, __proto__) | Code | |
| V08-3 | vollpruefung | OneDrive ohne Zeitlimit (Backend inaktiv) | Code | |
| V08-4 | vollpruefung | verlorenes Korrekturblatt wird nie neu erzeugt, still | Code | |
| V08-5 | vollpruefung | hilfeButton ignoriert position | Code | |
| V08-6 | vollpruefung | ladeMonatliche() lädt zu viel | Code | |
| V09-1 | vollpruefung | QR-Vergabe läuft bei kaputten Journalzeilen weiter (nur Alarm) | Code | |
| V09-2 | vollpruefung | Monats-PDF: Sperr-Sichtkontrollen fehlen bei Ladefehler still | Code | |
| V09-3 | vollpruefung | Echtheits-Registrierung scheitert still, PDF trägt toten Prüfcode | Code | |
| V09-4 | vollpruefung | Bezirk-Archiv: sendFile ohne Wurzelprüfung | Code | |
| V09-5 | vollpruefung | validateStorageReplicate(null) TypeError | Code | |
| V09-6 | vollpruefung | Pausen-PDF scheitert an NULL-Zeit | Code | |
| V09-7 | vollpruefung | core/ importiert routes/betriebszeiten | Code | |
| V09-8 | vollpruefung | PDF ohne Seitenzahlen/QR bei Fehler in addPageNumbers, still | Code | |
| V09-9 | vollpruefung | Detailabfrage in Doppelschleife | Code | |
| V03-1 | vollpruefung | Verbandbuch-Weitergabe-Protokoll scheitert still (catch (x) {}) | Code | |
| V03-2 | vollpruefung | ladeFotos() verschweigt DB-Fehler | Code | |
| V03-3 | vollpruefung | Spülprotokoll ohne Doppelsende-Schutz | Code | |
| V03-4 | vollpruefung | Tablet-Zeiten in Prozesszeit geparst (Server-TZ unbelegt) | Server-Schritt | |
| V03-5 | vollpruefung | Eskalationsstunde aus Prozesszeit | Server-Schritt | |
| V03-6 | vollpruefung | /tablet/sperre: Array-Body → 500 + Alarm, ohne Anmeldung | Code | |
| V03-7 | vollpruefung | Verbandbuch-Eingaben ohne Format-/Längenprüfung | Code | |
| V03-8 | vollpruefung | negativer Stillstand | Code | |
| V03-9 | vollpruefung | Namenszuordnung nicht deterministisch | Code | |
| V04-1 | vollpruefung | Fachfirma-Prüfdatum nicht als Kalenderdatum geprüft | Code | |
| V04-2 | vollpruefung | „Fehler beim Speichern“ nach Commit → Doppelprüfung | Code | |
| V04-3 | vollpruefung | Dashboard verschluckt DB-Fehler bei Wochenfälligkeiten | Code | |
| V04-4..17 | vollpruefung | Anmerkungen aus Bereich 04 (TZ-Randfälle, Leistung, Texte, Magicline-Randfälle) | Code | |
| V10-2 | vollpruefung | Signaturprüfung ohne Untergrenze: ein schwarzes Pixel gilt als Unterschrift | Code | |
| V10-3 | vollpruefung | Replik-attempts bei neuem Inhalt nicht zurückgesetzt | Code | |
| V10-4 | vollpruefung | fehlender Restore-Bericht zählt als ok | Code | |
| V10-5 | vollpruefung | DGUV-V3-Zuständigkeit bei Mischlage | Code | |
| V10-6 | vollpruefung | Steckbrief-Ladefehler still; Kommentar zu Aufrufern ungenau | Code | |
| V11-5 | vollpruefung | staging-smoke.sh meldet PDF_ROOT-Trennung ungeprüft als PASS | Test | staging-smoke.sh |
| V11-7 | vollpruefung | syntax-check.sh grün bei null gefundenen Dateien | Test | syntax-check.sh |
| V11-2..9 | vollpruefung | übrige Anmerkungen aus Bereich 11 (Seed-Format, Meldetexte, Worker-Neustart, Gegenproben-Auswertung) | Code | |
| V05-2 | vollpruefung | Mitarbeiter-Löschung: Audit ausserhalb der Transaktion, ohne Absicherung | Code | |
| V05-3 | vollpruefung | CSV-Import ohne Kalendertag-Prüfung | Code | |
| V05-4..7 | vollpruefung | Import-Fehler still, Freischaltungs-Aufräumen still, Import-Rennen, Z2-Sollwert | Code | |
| V12-1 | vollpruefung | Offline-Warteschlange wiederholt Foto-Endzustände (409) endlos | Code | |
| V12-3 | vollpruefung | E2E-Datensparsamkeit ohne Status/Anker — grün bei 500 | Test | |
| V12-2,4..8 | vollpruefung | übrige Befunde aus Bereich 12 | Code | |
| V07-1 | vollpruefung | Mailversand ohne Doppelversand-Schutz, wenn Claim scheitert; mail_gesendet_am ohne Nachzug | Code | |
| V07-2..9 | vollpruefung | übrige Befunde aus Bereich 07 (Demo-Daten, Reaper, Export-Hinweis, Feiertags-Historie, Claim-Verwaisung, Speicher) | Code | |
| V13-1..3 | vollpruefung | Test-Stub DESIGN_TOKENS_CSS; falsche Begründung in Ausnahmeliste; Zusicherung ohne Prüfung zählt als PASS | Test | |
| V21-1..6 | vollpruefung | Test-PDFs ohne Umleitung, Aufräumpfad, Vorzustand erzwingt Sortierung, Mandantenfilter ungeprüft, stilles Überspringen, ungeschütztes git ls-files | Test | |
| V14-1..7 | vollpruefung | Testfragen: status !== 200 akzeptiert 500, Wächter blind für Member-Aufrufe, tautologische Oder-Zweige, SQL-Kommentare, Helfer ohne studio_id, festes Kürzel, fehlende Sollzahl | Test | |
| V22-1 | vollpruefung | Tests, die core/provisioning laden: OFFBOARDING_QUEUE_DIR nicht suite-weit gesetzt, DOKUMENTE_DIR nur über run.sh gedeckt | Test | |
| V22-2..4 | vollpruefung | Zählangabe im Kommentar, Erfassungsbereich des PIN-Wächters, Backtick-Muster | Test | |
| V15-1a | vollpruefung | Rennen-Test Neue-Version erkennt vertauschte Reihenfolge nicht | Test | |
| V15-1r | vollpruefung | belehrung_freischaltung.freigeschaltet_am: zwei Formate in einer TEXT-Spalte | Code | |
| V15-2 | vollpruefung | Gültigkeitsregel der Belehrungsübersicht: MAX(gueltig_bis) oder neueste Unterschrift? | Code | |
| V23-1..6 | vollpruefung | Rechtsaussagen-Wächter schluckt Datei-Lesefehler; >=-Zusicherung; wandernder Sollwert; Gegenprobe ohne Rücknahme; Studio nicht entsperrt; Satztrenner-Grenze | Test | |
| V17-1..4 | vollpruefung | Error-Tracking-Test ohne eigene Versandsperre; Sollwert aus derselben Funktion; dekorative PASS-Zeilen; indexOf-Rückfall | Test | |
| V24-1..4 | vollpruefung | UTC-Tag im Retention-Test, Text-Anker ohne Positivkontrolle, Test-Abfragen ohne studio_id, Unverwechselbarkeit nur ein Paar | Test | |
| V16-1 | vollpruefung | DGUV-Test: „deaktiviert, nie gelöscht“ leer wahr bei Löschung | Test | |
| V16-2,3,5..7 | vollpruefung | Design-Token-Wächter-Erfassung, implizierte Zusicherung, leere Arrays, UTC-Fixture, Funktionsende per indexOf | Test | |
| V25-1 | vollpruefung | Tests löschen per path.join(__dirname, pfad) im echten PDF-Archiv des Live-Servers (10 Stellen, 4 Dateien) | Test | |
| V25-2 | vollpruefung | test_feature_spuelplan.js löscht rekursiv unter einem beim require fixierten PDF_ROOT | Test | test_feature_spuelplan.js |
| V21-1/2 | vollpruefung | dieselbe Klasse (Aufräumen über __dirname) in nutzungsentscheidung/nutzung_nachtrag | Test | |
| V25-3..6, V18-1..6 | vollpruefung | übrige Testbefunde der Bereiche 18 und 25 | Test | |
| V26-2 | vollpruefung | test_feature_verbandbuch_meldepflicht.js löscht über __dirname (Zwischenvariable) | Test | test_feature_verbandbuch_meldepflicht.js |
| V19-1..5, V26-1,3..5 | vollpruefung | übrige Testbefunde der Bereiche 19 und 26 | Test | |
| V27-1..7 | vollpruefung | Kommentar- und Schrankenbefunde aus Bereich 27 | Code | |
| V20-1 | vollpruefung | Wächter „mangel_darstellung_einheitlich“ Teil 3 grün über Kommentare | Test | |
| V20-2..4 | vollpruefung | Zeitzonenfalle vorTagen, Test-Abfragen ohne studio_id, globale Gegenprüfung | Test | |
| N-1 | vollpruefung | test_feature_keine_neuen_rohwerte.js scannt auch IGNORIERTE Dateien | Test | test_feature_keine_neuen_rohwerte.js |
| T1-K4 | vollpruefung | Einzelaufruf ohne run.sh: nur PDF_ROOT statisch gesichert, EINWEISUNG_NACHWEIS_DIR & Co. nicht | Test | |
| P3-S1 | vollpruefung | Felder ohne .trim() speichern Array ungeprüft; passwort als Array an bcrypt.compare | Code | |
| A-4 | w | unprivilegierte User-Namensräume im Kind (unshare -r) | Code | |
| A-1b | w | ganz /etc ro sichtbar | Code | |
| S13 | w | /var/lib/dsv1 bleibt leer und root-eigen stehen | Server-Schritt | |

## Baubündel (Code- und Testpunkte)

### Bündel 1: PDF- und QR-Erzeugung
- **Kennungen:** C2-S9, C2-S10, C2-S11, C3a-S1, C3a-S4, QJ-S1, QJ6-8, QJ6-MU31, QJ7-K, QJ7-G, QJ8-B3, QJ9-A, QJ9-B, V06-2, V06-9, V08-4, V09-2, V09-3, V09-8, V02-8, V10-2 (teilw.)
- **Betroffene Dateien:** core/pdf-engine.js, core/korrektur-pdf.js, core/qr-verbrauch.js, qr-druckdaten.js, generateMonthlyPDFs.js

### Bündel 2: Datenbank, Migrationen, DB-INIT
- **Kennungen:** C1-S3, C3a-S-FK, C3a-S-FK2, C3a-S5, DBI-1, DBI-2, C3b-S2, C3b-S3, V01-1, V01-2, V01-4, V01-9, V01-10, V05-2, V05-3, V15-1r, V15-2
- **Betroffene Dateien:** core/db.js, Migrationen (0062), S20-migrate.js, core/provisioning

### Bündel 3: Server, Routen, Webhooks
- **Kennungen:** C2-S2, C2-S4, C2-S5, C2-S6, C3a-S6, C3a-S7, H2-R2-1, H2-R2-2, P2-S2, P2-S3, P2-S4, P2-S6, V03-6, V03-7, V03-8, V03-9, V04-1, V04-2, V04-3, V05-4..7, V06-1, V06-5, V06-6, V06-7, V06-8, V07-1, V07-2..9, V09-1, V10-4, V10-5, V10-6, V11-2..9, V12-1, V12-2,4..8, V16-1, V20-2..4, S6-1, SG-S2, SG-S3
- **Betroffene Dateien:** server.js, routes/*, core/error-tracker.js, core/file-crypto.js

### Bündel 4: Tests und Testinfrastruktur
- **Kennungen:** C2-S17, DEP-4, G-V1, H1a-S2, H1a-S6, H2-R2-3, H2-R2-4, P2-S5, P2-S7, T2-S1..S4, TS-1, U-REAP1, U-LOE1, U-LOE2, U-LOE3, R5-12, R6-13, N9-b, R7-8, R7-9, R9-12b, W-1, V02-1t, V11-5, V11-7, V12-3, V13-1..3, V14-1..7, V15-1a, V17-1..4, V20-1, V21-1..6, V22-1, V22-2..4, V23-1..6, V24-1..4, V25-1, V25-2, V21-1/2, V25-3..6, V18-1..6, V26-2, V19-1..5, V26-1,3..5, N-1, T1-K4, ladebestand-7..21
- **Betroffene Dateien:** test/*, tools/mutationsprobe.js, test/umgebung.sh

### Bündel 5: Sperren, Locks, Retention
- **Kennungen:** C3a-S3, Sperr-1, Sperr-2, Sperr-3, Sperr-4, C3b3-4, C3b-S1, C2-S3, C2-S12, C2-S13, C2-S14, C2-S15, C2-S16, C1-S1, C1-S2
- **Betroffene Dateien:** core/audit, routes/belehrungen.js, core/storage-replica.js, workers/pdf-job-worker.js

### Bündel 6: Doku, Ops und Server-Schritte
- **Kennungen:** DEP-1, DEP-2, DEP-3, DEP-5, GH-S3..S8, H1a-S1, H1a-S3, H1a-S5, H2-D8, P2-S1, P2-S1 (ergänzt), V01-5, V01-11, V06-3b, V06-4, V27-1..7, A-4, A-1b, S13
- **Betroffene Dateien:** docs/*, ops/*, ci.yml, Server-Konfiguration

## Nicht eindeutig als offen oder erledigt einordenbar

- **D-B5** (d): Als „harmlos“ markiert, aber nicht als erledigt. Es ist unklar, ob die dominierten Zusicherungen als entschieden-ohne-Handlung gelten.
- **B1** (pentest-p1): „bewusst so gebaut“ – könnte als entschieden-ohne-Handlung gelten, aber eine Lösungsidee ist genannt und der Punkt bleibt in der Befundliste.
- **V1** (pentest-p1): „Vertragsänderung; in den PR-Rumpf“ – könnte als erledigt/dokumentiert gewertet werden, steht aber weiter als Befund.
- **C2-S3** (c2): „Grenze, benannt“ – laut ladebestand-Datei ein Zwischenstand, aber in c2 nicht explizit als offen geführt.
- **H1a-S3, H1a-S6** (h1a): „Grenze, benannt“ – wie C2-S3.
- **PP4b-19, PP4b-23** (p4): „Grenze, dokumentiert/benannt“ – Betreiber-Entscheidung offen bzw. neue Regel nötig, aber nicht als offener Punkt im engeren Sinne markiert.

## Rechenschaft

- **Gelesene Dateien:** 24
- **Punkte insgesamt gesehen:** 243
- **Offen:** 238
- **Erledigt:** 5 (C2-S18, D-W1, GH-S1, GH-S2, H1a-S4)
-- Ende --
