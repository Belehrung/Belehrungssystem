# Auftrag C6-B — PDF-Jobs, Health, Korrekturblatt-Lesepfad, Krypto, Werkzeuge (Extrarunde C6)

Fassung 2, 01.10.2026. Planprüfung flash mit 13 Befunden (`scratchpad/c6plan/flash-c6b.txt`). Selbst nachgemessen
und getragen: 1 (`melde()` hält Folgemeldungen, `process.exit` überspringt `beforeExit`; `core/error-tracker.js:24,540-552`)
und 3 (`requeue` setzt neue Spalten nicht zurück, `core/pdf-jobs.js:150-166`). Die übrigen sind eingearbeitet. Repo GymDocu, Stand master (nach C6-A1 oder neuer).

**Herkunft und Einzelheiten:** `/home/user/Belehrungssystem/plaene/c6-zustand-01-10/` mit `z1.md` (F4, C2-S5, R2-5,
c5c#1, c5c#3, SG-S1, SG-S3, PP4b-21), `z3.md` (C-6) und `z5b.md` (V09-5, V08-3). Jeder Abschnitt nennt Beleg,
Zustand, Behebung, Risiko und Test. Alles sind FUNDORTE: zuerst neu messen. Widerspricht der Code, abbrechen und
melden.

**Modell.** Standard-Executer. Mehrere unabhängige Punkte. Falle ist ein Wachhund-Test, der selbst hängt; die
Zeitgrenze liegt deshalb AUSSERHALB des geprüften Prozesses (CLAUDE.md, „Lebensdauer eines Prozesses“).

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6b`, Zweig `c6b-jobs-krypto` ab `origin/master`, Einzeltests nur
gegen `gymdocu_c6b_test`. Suite und Gegenproben wie üblich. Migrationsnummer: die nächste freie zur Bauzeit; bei
einer Kollision beim Merge wird umnummeriert, und die Prüfsummenliste wird nachgezogen.

## Punkte

1. **F4 und C2-S5 — Ein toter Job lässt sich quittieren oder neu einreihen (sollte).**
   - Heute hält ein toter `correction_sheet`-Job `/intern/health` dauerhaft auf „degraded“
     (`core/pdf-jobs.js:360,368`). Ein Bedienweg außer SQL fehlt.
   - Migration: `pdf_jobs` bekommt `quittiert_am TEXT` und `quittiert_grund TEXT`.
   - Neues Betriebswerkzeug `ops/pdf-jobs.js`, Unterbefehle:
     - `liste`: tote Jobs mit id, Typ, Studio, Zeit und der ersten Zeile von `last_error`. KEINE Payload, keine
       Personendaten.
     - `neu-einreihen <id>`: über das bestehende `pdfJobs.requeue`.
     - `quittieren <id> --grund "<text>"`.
   - Das Werkzeug fasst nur Zeilen mit passender `id` an. Jede Aktion steht im Audit-Protokoll des betroffenen
     Studios, wenn der Audit-Weg das ohne neue Sperrklasse hergibt; sonst wird mit Begründung geloggt. Das
     misst du.
   - `healthMetrics()` zählt tote Jobs mit `quittiert_am IS NULL` als „degraded“. Quittierte zählen getrennt als
     Information.
   - Ein toter Job verschwindet nie still. Quittieren ist ein bewusster Schritt mit Grund.
   - Die Quittung gilt nur für DIESEN Tod. Jeder Weg, der einen Job wieder in Bewegung setzt oder erneut sterben
     lässt, setzt `quittiert_am`/`quittiert_grund` zurück: `requeue` (`core/pdf-jobs.js:150-166`), `deadLetter` und
     die automatische Wiederbelebung `planeReplikationsJob`. Alle Wege per `grep` finden (flash 3).
     - Test: quittieren → `neu-einreihen` → erneut sterben → wieder degraded.
   - Quittieren und Audit stehen in EINER Transaktion: `auditTx(sid, t => { UPDATE …; auditAppend(…, t) })`
     (`core/integritaet.js:140-174`), damit „quittiert ohne Protokoll“ nicht entstehen kann (flash 9).
   - Die neue Zählung bekommt dieselbe Deckelung (`LIMIT 1001`) wie die bestehenden. Die Migration ist idempotent
     (`ADD COLUMN IF NOT EXISTS`).
   - `docs/PDF_JOBS.md:15` und `docs/MONITORING.md:9` werden nachgezogen. Das neue Ausgabefeld (z. B.
     `deadQuittiert`) wird benannt (flash 12).
   - Tests:
     - Ein toter Job → degraded. Quittieren → nicht mehr degraded, Grund gespeichert.
     - `neu-einreihen` → `pending`.
     - Eine fremde oder ungültige id → Fehler ohne Wirkung.
2. **C-6 — Ein PDF-Worker bleibt bei eingefrorener Datenbank nicht still stehen (sollte).**
   - `workers/pdf-job-worker.js:221-238` wartet ewig auf `queue.claim()`, wenn die DB bei offenem TCP nicht antwortet.
     `connectionTimeoutMillis` greift dort nicht (`core/db.js:419`).
   - Behebung:
     - Der Worker-Prozess bekommt für seinen Pool ein CLIENTSEITIGES Abfragezeitlimit (`query_timeout` von node-pg).
       Wie der Pool im Worker entsteht, misst du; die Option darf den Webprozess nicht betreffen.
     - Dazu ein Wachhund NUR um die Datenbankschritte der Schleife (`claim`, Heartbeat), NICHT um die
       Jobbearbeitung. Lange Jobs schützt der Lease-Heartbeat; ein Wachhund um den ganzen Zyklus würde jeden
       legitim langen Job, etwa einen großen Upload, töten (flash 2).
     - Läuft der Wachhund ab: `melde()`, dann die Sammelstufe begrenzt leeren (`leereSammlungBegrenzt()`), dann
       wird das Ende über den bestehenden Abbruchweg herbeigeführt. Das ist der Wurf aus `main()`, der
       `process.exitCode = 1` setzt, oder ein `process.exit(1)` erst NACH dem Leeren. Ein nacktes `process.exit` ist
       nicht erlaubt, denn es überspringt `beforeExit` und verliert gehaltene Meldungen (flash 1). pm2 startet dann
       neu.
   - Werte (gesetzt, mit Kommentar):
     - Abfragezeitlimit 60 s: weit über jeder normalen Worker-Abfrage.
     - Wachhund 120 s.
   - Test:
     - Der Worker läuft als KINDPROZESS mit einem gestubbten `claim`, das nie auflöst, und kleinem Limit über eine
       Testumgebungsvariable.
     - Die Zeitgrenze liegt im TESTPROZESS, nicht im Kind.
     - Erwartet: Das Kind endet von selbst mit Exit 1 innerhalb von Limit + Toleranz, und die Meldung wurde
       aufgezeichnet (Attrappe).
     - Zusätzlich ein Job, der länger als der Wachhund dauert, aber Heartbeats sendet: Er wird NICHT abgebrochen.
     - Gegenprobe: ohne Wachhund → das Kind läuft bis zur äußeren Grenze.
3. **R2-5 — Der Korrekturblatt-Lesepfad prüft den Inhalt, nicht nur die Existenz (sollte).**
   - `core/korrektur-pdf.js:301-310` liefert `missing:false`, sobald unter dem Namen irgendeine Datei liegt.
   - Neu: Bei vorhandener Datei wird `dateiHash(absolute) === existing.pdf_hash` geprüft.
     - Ist der Pfad keine reguläre Datei oder nicht lesbar (EISDIR, EACCES), gilt das als `konflikt` und reißt
       den Lesepfad nicht. Muster `zielZustand` in `core/pdf-ablage.js` (flash 10).
     - Bei Abweichung: `melde()` und `{ missing: true, konflikt: true }`. Die Datei wird NICHT angefasst; sie ist ein
       Beweisstück.
     - Bei `pdf_hash IS NULL` (Altzeilen) bleibt das heutige Verhalten. Diese Grenze kommt als Kommentar in den Code
       und in den Bericht.
   - Der Worker (`workers/pdf-job-worker.js:63-67`) schreibt bei `konflikt` den Grund („Inhalt passt nicht zum
     registrierten Hash“) in die Fehlermeldung, die über `deadLetter` in `last_error` landet. Heute ist der Text
     generisch (flash 4). „dead“ ist richtig, denn das Korrekturblatt wird nie ersetzt.
   - Der zweite Lesepfad `GET /dokument/:id` (`routes/korrekturen.js:393-406`) liefert heute per `existsSync`. Er
     bekommt dieselbe Hash-Prüfung: bei Abweichung keine Auslieferung, sondern ein Hinweis (flash 11).
   - Test: Zeile mit Hash H1, Datei mit Inhalt H2 → `missing:true, konflikt:true`, Meldung, Datei unverändert.
     Positivkontrolle: passende Datei → `missing:false`.
4. **c5c#3 — Die Reste-Ernte meldet einen Fehlschlag einmal, nicht doppelt (Anmerkung).**
   - Ernte-Pfad: `repariereAusKandidat(…, { entfernen: true })` meldet über `entferneDatei` selbst, und die Ernte
     zählt zusätzlich.
   - Der Ernte-Pfad entfernt über das ASYNCHRONE `entferneDatei` (`core/pdf-ablage.js:281-293`). Das kennt die Option
     `melderUeberspringen` heute nicht; nur `entferneDateiSync` hat sie (`core/datei-entfernen.js:164-185`).
     - Behebung: `entferneDatei` bekommt dieselbe Option.
     - Der statische Wächter, der die Option nur in `core/foto-reaper.js` erlaubt, wird fachlich um genau diese
       neue Aufrufstelle erweitert, mit Begründung (flash 5).
   - Der Fehlschlag geht gebündelt in die entprellte Laufmeldung.
   - Ist der Zustand der Entprellung zu Laufbeginn NICHT LESBAR, wird für diesen Lauf einzeln laut gemeldet.
   - Ein Schreibfehler am Laufende bleibt bei der bestehenden eigenen Meldung `ERNTE_ZUSTAND_NICHT_SPEICHERBAR`
     (`ops/gymdocu-pdf-reste-ernte.js:794-805`); das ist ausreichend und wird benannt (flash 6).
   - Test: zwei simulierte Läufe mit scheiterndem `unlink`. Genau eine Meldung je Ereignis, und im Rückfallfall eine
     Einzelmeldung.
5. **SG-S1 — Eine leere Datei ist verschlüsselt wieder entschlüsselbar (sollte).**
   - `core/file-crypto.js:36,79` verlangt mindestens 29 Byte. Eine leere Eingabe ergibt aber 28 Byte (12 + 16 + 0).
   - Neu: Grenze `< IV_LENGTH + TAG_LENGTH`, für Buffer- und Stream-Weg.
   - Test: `encryptBuffer(Buffer.alloc(0))` lässt sich mit beiden Wegen entschlüsseln. 28 Byte Müll scheitern am
     GCM-Tag, nicht an der Länge. 27 Byte scheitern an der Länge.
6. **SG-S3 — Die Semgrep-Zusammenfassung erzeugt keine Workflow-Befehle (sollte).**
   - `ops/semgrep-hinweis.js:306-331,406-413` gibt die Zusammenfassung unmaskiert auf stdout aus.
   - Neu: JEDE Zeile der Zusammenfassung läuft durch `maskiereDaten`, danach wird mit `\n` verbunden. Die
     Step-Summary bleibt lesbar.
   - Test: Ein Fund mit `nachricht = "\n::warning::x"`. In der ZUSAMMENFASSUNG beginnt keine Zeile mit `::`. Die
     beabsichtigten Anmerkungszeilen `::warning file=…` sind davon ausgenommen und werden getrennt als genau eine je
     Fund gezählt. Das wird auch im CLI-Pfad ohne `GITHUB_STEP_SUMMARY` geprüft (flash 7).
7. **V09-5 — `validateStorageReplicate(null)` wirft `ValidationError` (Anmerkung).**
   - `core/pdf-jobs.js:56-57` ruft `Object.keys(null)` auf.
   - Neu: Am Anfang steht `if (!plainObject(payload)) throw new ValidationError(...)`.
   - Prüfe die Catch-Pfade der Aufrufer.
   - Test: `assert.throws(..., ValidationError)`.
8. **V08-3 — OneDrive-Anfragen mit Zeitlimit (Anmerkung).**
   - `core/onedrive.js:33-40` (Token) und `:71-79` (Upload) haben kein Zeitlimit.
   - Neu: `timeout` (Socket-Inaktivität) und `req.on('timeout', () => req.destroy(...))`.
     - Token 30 s.
     - Upload 120 s Inaktivität. Das ist keine Gesamtdauer; große Uploads bleiben möglich.
   - Test: `https.request` stubben, die Optionen prüfen und den timeout-Pfad auslösen. Er endet als Fehler, nicht
     als Hängen.
9. **PP4b-21 — Signaturbild dekodiert höchstens zweimal (Anmerkung, Leistung).**
   - `core/signaturbild.js:149,213,255` dekodiert dasselbe PNG dreimal.
   - Bedingung: Maßprotokoll und Annahme/Ablehnung bleiben über ALLE vorhandenen P4-Fixturen identisch. Beide
     Seiten werden gemessen und die Werte im Bericht gegenübergestellt.
   - Weicht auch nur ein Wert ab: NICHT umstellen, abbrechen und melden. Die Unterschriftsprüfung ist ein
     rechtlicher Nachweis, Leistung geht hier nicht vor.
   - Test: ein zählender Wrapper um `sharp`, der nur Aufrufe mit PIXEL-Ausgabe (`.raw()`, `.png()`) zählt. Die
     Kopflesung `metadata()` zählt nicht. Ergebnis: ≤ 2 je Aufruf.
   - Neben Maßprotokoll und Urteil wird auch das KANONISCHE PNG gegenübergestellt. Es steht im Rechtsdokument und
     muss pixelgleich bleiben: Vergleich der dekodierten Pixel, nicht der Bytes (flash 8). Weicht es ab, wird
     abgebrochen.

## Ohne Bau

- **c5c#1** (verwaiste `verify_dokumente`-Zeile nach Prozesstod zwischen Registrierung und `rename`): gegenstandslos.
  Der Prüfcode steht nur im NIE veröffentlichten PDF; niemand kann ihn haben oder abfragen. Die Temp-Datei erntet
  die Reste-Ernte nach 24 h.
- **V07-9** (`decryptStream` puffert): Betreiber-Frage, siehe `c6-plan.md`.

## Bericht

- Je Punkt: die neue Messung, der Diff, die Gegenproben wörtlich.
- Die Werte-Gegenüberstellung aus Punkt 9.
- Die volle Suite mit `diff` EXIT 0.
- Lint.
