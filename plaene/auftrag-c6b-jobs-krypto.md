# Auftrag C6-B — PDF-Jobs, Health, Korrekturblatt-Lesepfad, Krypto, Werkzeuge (Extrarunde C6)

Fassung 1, 01.10.2026. Repo GymDocu, Stand master (nach C6-A1 oder neuer).

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
     - Dazu ein Wachhund je Schleifendurchlauf: Überschreitet ein Zyklus das Doppelte des Limits, gibt es `melde()`
       und `process.exit(1)`. pm2 startet dann neu, mit frischen Verbindungen.
   - Werte (gesetzt, mit Kommentar):
     - Abfragezeitlimit 60 s: weit über jeder normalen Worker-Abfrage.
     - Wachhund 120 s.
   - Test:
     - Der Worker läuft als KINDPROZESS mit einem gestubbten `claim`, das nie auflöst, und kleinem Limit über eine
       Testumgebungsvariable.
     - Die Zeitgrenze liegt im TESTPROZESS, nicht im Kind.
     - Erwartet: Das Kind endet von selbst mit Exit 1 innerhalb von Limit + Toleranz, und die Meldung wurde
       aufgezeichnet (Attrappe).
     - Gegenprobe: ohne Wachhund → das Kind läuft bis zur äußeren Grenze.
3. **R2-5 — Der Korrekturblatt-Lesepfad prüft den Inhalt, nicht nur die Existenz (sollte).**
   - `core/korrektur-pdf.js:301-310` liefert `missing:false`, sobald unter dem Namen irgendeine Datei liegt.
   - Neu: Bei vorhandener Datei wird `dateiHash(absolute) === existing.pdf_hash` geprüft.
     - Bei Abweichung: `melde()` und `{ missing: true, konflikt: true }`. Die Datei wird NICHT angefasst; sie ist ein
       Beweisstück.
     - Bei `pdf_hash IS NULL` (Altzeilen) bleibt das heutige Verhalten. Diese Grenze kommt als Kommentar in den Code
       und in den Bericht.
   - Prüfe, was der Worker bei `konflikt` tut (`workers/pdf-job-worker.js:63-67`, heute `missing` → dead). „dead“ ist
     richtig, denn das Korrekturblatt wird nie ersetzt. Der Grund steht in `last_error`.
   - Test: Zeile mit Hash H1, Datei mit Inhalt H2 → `missing:true, konflikt:true`, Meldung, Datei unverändert.
     Positivkontrolle: passende Datei → `missing:false`.
4. **c5c#3 — Die Reste-Ernte meldet einen Fehlschlag einmal, nicht doppelt (Anmerkung).**
   - Ernte-Pfad: `repariereAusKandidat(…, { entfernen: true })` meldet über `entferneDatei` selbst, und die Ernte
     zählt zusätzlich.
   - Neu: Im Ernte-Pfad läuft das Entfernen mit unterdrückter Einzelmeldung (Muster `melderUeberspringen` bei
     `entferneDateiSync`, `core/datei-entfernen.js:164-185`). Der Fehlschlag geht gebündelt in die entprellte
     Laufmeldung.
   - Ist der Zustand der Entprellung nicht lesbar oder schreibbar, wird wieder EINZELN laut gemeldet. Nie still.
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
   - Test: Ein Fund mit `nachricht = "\n::warning::x"` erzeugt keine Ausgabezeile, die mit `::` beginnt. Das wird
     auch im CLI-Pfad ohne `GITHUB_STEP_SUMMARY` geprüft.
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
   - Test: ein zählender Wrapper um `sharp` ergibt ≤ 2 Volldekodierungen je Aufruf.

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
