# Auftrag C5-B — Sperren, Replikation und Meldewege (Extrarunde aus den Sammellisten)

Fassung 2, 30.09.2026 (Planprüfung: flash mit Repo-Lesewerkzeugen + kimi-k3 mit Codebündel, `scratchpad/c5plan/`; tragende Befunde selbst nachgemessen — u. a. `workers/pdf-job-worker.js:5-11` gegen `core/error-tracker.js:59-74`). Repo GymDocu, Stand master `13448c8`. Zustandsprüfung: `deepseek-flash` mit Lesewerkzeugen
(`scratchpad/b5/antwort.txt`). Die Belege hat der Haupt-Agent selbst nachgelesen:

- `core/retention.js:896-938`
- `routes/belehrungen.js:204-214`
- `workers/pdf-job-worker.js:187-198`
- `reapeFotos.js:23-24`

Modell: Standard-Executer. Die einzige Schwelle (1000 ms, Sperr-1) ist vorgegeben, nicht herzuleiten.

Betreiber-Entscheidungen 30.09.2026:

- Sperr-4 → Rotation nur 02:00–05:00 Uhr Berliner Zeit, mit ausdrücklichem Schalter für den Notfall.
- C2-S15 → entprellen: bei Änderung sofort melden, bei Unverändertem einmal pro Woche.

## Punkte

### 1. Sperr-1 — Retention hält den Studio-Audit-Lock über die ganze Löschung einer Tabelle

**Befund.** `core/retention.js:896-900` nimmt eine `auditTx` um die ganze Kandidatenschleife ab `:924`. Gemessen im
Sperrordnungs-Auftrag:

| Zeilen | Haltedauer |
|---|---|
| 2000 | ≈ 3,2 s |
| 8000 | 20,8 s |

In dieser Zeit warten alle Audit-Transaktionen des Studios und belegen dabei Pool-Slots (Pool 10,
`connectionTimeoutMillis` 3000).

- **Behebung:** Kandidaten in Blöcken abarbeiten, je Block eine eigene `auditTx`. Der Lock bleibt dabei die erste
  Anweisung, die Sperrordnung ändert sich nicht. Die Kandidaten werden per Keyset geholt (`ORDER BY id`, `LIMIT n`,
  `id > letzte`), nicht per OFFSET.
- **Vorher messen:** Was hängt an der Atomarität „je Tabelle“? Ein Audit-Eintrag je Lauf, ein Zähler oder ein
  Endvermerk, der nur bei vollständiger Tabelle stimmt? Die Antwort gehört in den Bericht. Bei Blockbetrieb muss ein
  Abbruch nach Block k einen Zustand hinterlassen, den der nächste Lauf fortsetzt, ohne doppelt zu löschen oder
  doppelt zu auditieren.
- **Test:** 2000 fällige Zeilen (Vorbild `test_feature_retention_buendelung.js`). Während der Löschung startet eine
  zweite Verbindung eine `auditTx` auf dasselbe Studio. Deren Wartezeit muss ≤ 1000 ms sein, das ist ⅓ des
  Pool-Zeitlimits (Quelle: `offene-befunde-sperrordnung.md` Punkt 1).
- Zusätzlich deterministisch: Anzahl der Lock-Erwerbe ≥ 2 (Zeitmessung allein flattert).
- Gegenprobe: Blockgrösse auf „alles“ ⇒ ROT.

### 2. Sperr-2 und Sperr-3 — blinde Flecken des Sperr-Wächters

**Befund.** Zwei Fälle erkennen `test/helfer/auditlock-inventur.js:38-39` und
`test_feature_auditlock_ordnung_static.js:59-64` nicht: eine verschachtelte `auditTx` in einer offenen
Transaktion, und Anweisungen über `(x || db).run(…)`.

- **Wächterregel:** In einem `auditTx`-/`tx`-Callback und in Helfern, die eine Verbindung durchreichen, muss jede
  `.run/.q/.one/.query` direkt über den Verbindungsparameter laufen.
  - `(x || db)` oder ein berechneter Zugriff ⇒ Befund.
  - `auditTx(` innerhalb eines solchen Callbacks ⇒ Befund.
- Heute bekannte Stelle: `routes/belehrungen.js:2179`, `schalteAlleFrei`, `(conn || db).run`. Sie kommt als
  benannte Ausnahme mit Begründung in eine literale Liste im Test. Kein Duplizieren des SQL.
- Fixturen:
  - `(t || db).run('… FOR UPDATE')` im Callback ⇒ Befund.
  - verschachtelte `auditTx` ⇒ Befund.
  - Positivkontrolle: `t.run(…)` ⇒ kein Befund.
- Gegenproben: neue Regel abklemmen ⇒ ROT; Ausnahmeliste gekürzt ⇒ ROT.

### 3. Sperr-4 — Schlüsselrotation nur im Wartungsfenster (Betreiber-Entscheidung)

`ops/schluessel-rotieren.js` bricht ausserhalb von 02:00–05:00 Uhr Europe/Berlin mit klarer Meldung und Exit ≠ 0 ab.

- Ein ausdrücklicher Schalter `--ausserhalb-wartungsfenster` hebt die Sperre auf und protokolliert das.
- Die Uhr ist injizierbar. Berlin-Zeit wird per `Intl`/`toLocaleString` mit `timeZone` berechnet, nicht per festem
  Offset. Die Hausregel zu Zeitzonen gilt.
- Testfälle (je einer):
  - 01:59 und 05:00 Berlin ⇒ Abbruch.
  - 02:00 und 04:59 Berlin ⇒ läuft.
  - Tag der Zeitumstellung: 25.10.2026, 02:30 kommt zweimal vor ⇒ läuft.
  - Schalter um 12:00 ⇒ läuft.
- Gegenprobe: Prüfung entfernen ⇒ ROT.
- Tests fassen weder echte Schlüssel noch die echte DB an. Die Fensterprüfung ist deshalb als eigene Funktion
  prüfbar.

### 4. C3a-S3 — Defekt-Mail ohne Wiederholungsweg

Ein Claim-Fehler in `core/defekt_mailer.js:185-194` lässt die Mail dauerhaft aus. Einziger Auslöser ist heute der
Upload.

- **Wiederholer:** im bestehenden Cron (`server.js`) werden Defekte mit `mail_gesendet_am IS NULL` erneut über
  `sendeEineDefektMail` aufgegriffen. Der atomare Claim `:166-197` bleibt der Schutz gegen Doppelversand; der
  Wiederholer ruft NIE am Claim vorbei.
- Nur Defekte, die älter als ein Mindestalter sind (Begründung nennen), damit der Wiederholer nicht mit dem
  Upload-Weg um denselben Defekt läuft.
- Alle Abfragen tragen `studio_id` bzw. laufen studioweise.
- Test (Vorbild `test_feature_defekt_mailer_claim_failclosed.js`):
  - Claim-Fehler, danach Wiederholer ⇒ genau EINE Mail.
  - Wiederholer zweimal ⇒ weiterhin genau eine.
  - Defekt mit gesetztem `mail_gesendet_am` ⇒ keine Mail.
- Mail-Versand ist eine Attrappe.

### 5. C3b-S1 — Restfenster pending-Zeile / fertiger Job bis zum Reaper

Der Reaper läuft stündlich (`core/storage-replica.js:961-966`). Das Fenster reicht bis ≈ 75 min, und Health zeigt
dabei `ok`.

- **Behebung:** Reaper-Takt auf alle 10 Minuten. Die Stale-Schwelle (15 min) bleibt, das Fenster sinkt auf ≈ 25 min.
- **Keine** Health-Verschärfung (Alarmmüdigkeit).
- Vorher messen, ob ein Reaper-Lauf mit einem anderen Cron desselben Takts um Sperren konkurriert.
- Test: der Zeitplan steht literal im Test.

### 6. C3b3-4 — Fallback schreibt den vorab gebildeten Hash

**Befund.** In `routes/belehrungen.js:204-214` nimmt `markiereReplicaFehlend(…, hash)` den Hash von VOR dem
Enqueue.

- Im `catch` übergibt der Aufruf `null`, damit `core/storage-replica.js:302` frisch rechnet. Wirft das (Datei weg),
  greift der vorhandene `catch (e2)`.
- Test: Enqueue scheitert (Attrappe), Datei wird vor dem Fallback geändert ⇒ die Zeile trägt den NEUEN Hash.
- Gegenprobe: alten Hash wieder übergeben ⇒ ROT.

### 7. C2-S12 — CLI-Enden ohne Leeren der Meldungs-Sammelstufe

**Befund.** Unter anderem `reapeFotos.js:23-24` beendet per `process.exit` ohne `leereSammlungBegrenzt()`, obwohl
`core/foto-reaper.js:162-168` `melde()` ruft.

- **Zuerst ALLE Einstiegsskripte finden,** die `melde()` erreichen können und per `process.exit` enden. Die Liste
  kommt mit Fundstellen in den Bericht. Vorbild ist `regenerierePdfMonat.js:60-70`.
- Jedes davon ruft vor dem Exit `await leereSammlungBegrenzt()`.
- Statischer Wächter: jedes Skript aus dieser literalen Liste enthält den Aufruf vor jedem `process.exit`. Die Liste
  gehört in den Test.
- Ein Verhaltenstest per Kindprozess mit Telegram-Attrappe für EIN Skript.
- Gegenprobe: Aufruf entfernen ⇒ ROT.

### 8. C2-S13 — PDF-Worker leert die Sammelstufe beim Signal nicht

In `workers/pdf-job-worker.js:187-198` ruft der Handler nur `worker.stop()`.

- Vorher kommt `await leereSammlungBegrenzt()` (Deckel 5 s).
- NICHT `installProcessHandlers()` aufrufen: dessen Signalweg beendet den Prozess und würde den Job-Drain zerstören.
- Test mit Prozessattrappe: Signal ⇒ erst Leeren, dann `stop`.
- Gegenprobe: Reihenfolge tauschen oder Leeren entfernen ⇒ ROT.

### 9. C2-S15 — tägliche Wiederholmeldung der PDF-Resteernte entprellen (Betreiber-Entscheidung)

`ops/gymdocu-pdf-reste-ernte.js:401-413` meldet bei Fehlern und Anomalien jeden Tag.

- Neu wird sofort gemeldet, wenn sich Anzahl oder Art (Fehlername und Menge der Beispielpfade) gegenüber dem letzten
  gemeldeten Stand ändert. Bei Unverändertem gibt es höchstens eine Erinnerung pro 7 Tage.
- Zustand: KEINE neue Migration. Vorher nachsehen, ob es einen globalen Zustandsspeicher gibt; `getConfig` ist
  studiobezogen.
- Gibt es keinen, kommt eine Zustandsdatei im Verzeichnis, das die Ernte ohnehin benutzt, mit injizierbarem Pfad.
  Tests fassen kein echtes Dateisystem außerhalb eines `mktemp`-Verzeichnisses an.
- Ist der Zustand unlesbar oder kaputt, wird gemeldet. Im Zweifel laut, nie still.
- Tests:
  - gleiche Anomalie an Tag 1 ⇒ Meldung.
  - dieselbe an Tag 2 ⇒ keine.
  - dieselbe an Tag 8 ⇒ Erinnerung.
  - Tag 2 mit größerer Anzahl ⇒ Meldung.
  - kaputter Zustand ⇒ Meldung.
- Gegenprobe: Vergleich entfernen ⇒ ROT (Tag 2 meldet).

## Ohne Bau erledigt bzw. nur Sammelliste berichtigen

- **C1-S1, C1-S2:** behoben (C1-Nacharbeit).
- **C2-S3:** die Zusammenfassung ist die gewollte Größe; überholt.
- **C2-S14:** die Sammelliste wird berichtigt, kein Code.
- **C2-S16:** `kill_timeout` 15000 am 30.09. per `pm2 jlist` auf dem Server bestätigt; erledigt.

**Offen für den Betreiber (nicht in diesem Auftrag):** C2-S12 bei SIGKILL/OOM. Nur persistente Fenster würden das
lösen; die Einzelfälle stehen im Server-Log.

## Fassung 2 — verbindliche Änderungen aus der Planprüfung (gehen dem Text oben vor)

**Zu 1 (Sperr-1):**
- **Blockgrösse 100.** Gemessen ≈ 1,6 ms je Zeile ⇒ ≈ 160–260 ms je Block, deutlich unter der 1000-ms-Schwelle.
  Die Schwelle entscheidet also nicht ein knapp gewähltes n.
- **Zähler und Cleanup je Block.** Der Zähler (`geloescht`) wird je Block aufsummiert. Der Datei-Cleanup
  (`core/retention.js:1022-1028`) läuft je Block direkt nach dessen Commit, damit ein Wurf in Block k+1 keine
  committeten Zeilen ohne Dateiaufräumen hinterlässt. Der `catch` meldet die bis dahin tatsächlich gelöschte Zahl,
  nicht 0 (`:1133-1142`).
- **Zählmetrik.** Deterministisch gezählt wird die ANZAHL der `auditTx`-Transaktionen, NICHT die der
  `pg_advisory_xact_lock`-Anweisungen: `auditAppend` nimmt den Lock je Zeile erneut (`core/integritaet.js:209`), das
  wäre grün aus dem falschen Grund.
- **Überlappung im Zeittest erzwingen.** Ein Haken nach Block 1 startet den Konkurrenten, der nachweislich während
  eines mittleren Blocks wartet. Ohne nachgewiesene Überlappung gilt der Test als ungültig, nicht als grün.
- **Kommentar.** `:896-900` beschreibt danach den Blockbetrieb.

**Zu 2 (Sperr-2/3):**
- Verschachtelte `auditTx` ist zur LAUFZEIT schon verboten (`AUDIT_TX_IN_TX`, `core/integritaet.js:157-162`,
  eigener Test), und die Inventur weist sie als `verschachtelt` aus. Sperr-2 wird deshalb NICHT statisch gebaut,
  sondern in der Sammelliste mit diesem Beleg erledigt.
- Die `(x || db)`-Regel bleibt. VOR der Einführung wird die vollständige Ist-Trefferliste erhoben (in den Bericht),
  die Ausnahmeliste enthält genau diese Treffer mit Begründung.

**Zu 3 (Sperr-4):**
- **Ort der Fensterprüfung.**
  - CLI-Zweig UND injizierbar in `fuehreRotationAus({ …, jetzt, ausserhalbWartungsfenster })`.
  - Die bestehenden Tests in `test_feature_schluessel_rotation.js` übergeben künftig eine Uhr im Fenster.
  - Die Anleitung `ops/schluessel-rotieren.md` beschreibt den Schalter.
- **Welche Modi betroffen sind.**
  - Das Fenster gilt NUR für den scharfen Modus (`--wirklich`).
  - Trockenlauf und `--fingerabdruecke` bleiben jederzeit erlaubt, je ein Testfall.

**Zu 4 (C3a-S3):**
- **Zwillingsweg.** Der Wiederholer deckt BEIDE Claim-Wege: `geraete_defekte` UND den Wartungsweg
  `sendeWartungsDefektMail` über `geraete_sperren.mail_gesendet_am` (`core/defekt_mailer.js:363-375`). Tests je
  Tabelle.
- **Welche Fälle.**
  - Nur offene Fälle; die Statuswerte misst der Bauende (`core/db.js:1385-1387`).
  - Nur Studios mit hinterlegtem Empfänger. Sonst claimt und gibt der Wiederholer endlos zurück.
  - Test: ein reparierter/ausgemusterter Defekt bekommt keine Mail; ein Studio ohne Empfänger erzeugt keinen
    Claim-Versuch.
- **Befundtext berichtigen.** Es gibt heute ZWEI Auslöser: den Foto-Abschluss (`routes/sichtpruefung.js:5696`) und
  den Mangel-Nachtrag (`:4731`). Mit `FOTOS_AKTIV=false` bekommt ein Defekt heute gar keine Mail; der Wiederholer
  schliesst das mit.
- **Mindestalter.**
  - Richtig ist es nur durch den Claim; das Mindestalter senkt lediglich die Konkurrenz.
  - `erstellt_am` ist Berliner TEXT und kann die Client-Zeit sein. Deshalb gilt das Hausmuster
    `to_char(now() AT TIME ZONE 'Europe/Berlin', …)`, kein Cast über die Sitzungszeitzone.
  - Testfall: Defekt jünger als das Mindestalter ⇒ keine Mail. Gegenprobe: Mindestalter 0 ⇒ ROT.
- **Cron.** Welcher Cron es ist, steht im Bericht (`server.js`, Zeile).

**Zu 5 (C3b-S1):**
- `test_feature_storage_replica_static.js:61-65` pinnt `'15 * * * *'` wörtlich und wird auf den neuen Takt
  mitgezogen.
- Texte mitziehen: „stündlich“, „~75 min“ und „stündlichen Reaper“ in `core/storage-replica.js:775-777`, `:792`,
  `:961-966` und `server.js:1646`. Eine Text-Inventur im Test verbietet die alten Aussagen an diesen Stellen.
- **Selbstüberlappung.** Die Laufzeit des Reapers wird gemessen. Überlappt ein Lauf den nächsten, kommt eine
  einfache Laufsperre dazu (im Prozess; kein neuer globaler Advisory-Lock, CLAUDE.md „Transaktionen und Sperren“).

**Zu 6 (C3b3-4):**
- Mit `null` fällt im Fall „Datei weg“ die bisherige (veraltete) Zeile weg. Der innere `catch (e2)` bekommt deshalb
  ein `melde()`, damit keine stille Backup-Lücke entsteht.
- **Test.**
  - Eine vorher `succeeded`-Zeile fällt nach Änderung der Datei korrekt auf `pending` mit NEUEM Hash.
  - Datei weg ⇒ Meldung.
- `dateiHash` wird injiziert oder in einem `mktemp`-Verzeichnis gearbeitet.

**Zu 7 (C2-S12):**
- Die Inventur umfasst `tools/` und `ops/`; die `melde()`-Reichweite wird transitiv bestimmt (z. B.
  `core/datei-entfernen.js`, `core/foto-reaper.js`, `core/migrate.js`). Bekannte Kandidaten:
  - `tools/mutationsprobe.js`
  - `ops/seed-performance-data.js`
  - `ops/pdf-loeschung-probelauf.js`
  - `tools/ausmusterung-gegenproben.js`
- Der Wächter verlangt `await leereSammlungBegrenzt()` als AWAIT vor jedem `process.exit`. Gegenprobe: `await`
  entfernen ⇒ ROT.
- Ein Kindprozess-Test mit `node` ist zulässig; es gibt Vorbild und Bestand in
  `test_feature_error_tracking_sammelstufe.js`. Die Telegram-Attrappe kommt auf demselben Weg wie dort hinein.

**Zu 8 (C2-S13):**
- Leeren und `worker.stop()` laufen NEBENEINANDER (`Promise.all` o. ä.), nicht nacheinander. Der Drain darf nicht um
  den 5-s-Deckel verzögert werden; der Worker hat `kill_timeout` 120000, bestätigt am 30.09.
- **Zuerst messen und in den Bericht:** Kann `melde()` aus dem Worker überhaupt zustellen? Der Worker löscht die
  TG-Variablen (`workers/pdf-job-worker.js:5-11`), `ladeCreds()` liest aber `/etc/environment` nach
  (`core/error-tracker.js:59-74`).
- Dieser Widerspruch zur Absicht „keine Zustellgeheimnisse im Worker“ wird NICHT in diesem Auftrag aufgelöst. Er kommt
  als neuer Punkt auf die Sammelliste.

**Zu 9 (C2-S15):**
- **Zustandsdatei.**
  - Über einen injizierten Leser/Schreiber (Muster `ops/gymdocu-rechtsstand-watch.js:78, :489-499`).
  - Vorgabepfad unter `/var/log` per Umgebungsvariable, AUSSERHALB der Erntemenge.
  - Tests benutzen nur den injizierten Schreiber, kein echtes Dateisystem.
- **Umfang.** Die Lauf-Meldung (`:401-413`) wird entprellt. Für die Je-Studio-Meldung (`:377-381`) entscheidet der
  Bauende nach demselben Prinzip; die Entscheidung kommt in den Bericht.
- **Merkmal „geändert“.** Fehlername plus Anzahlen. Pfade gehen nur als Anhang mit, sonst meldet jeder Tag neu.
  Testfall: gleiche Anzahl, andere Pfade an Tag 2 ⇒ keine Meldung.
- **Uhr.** Die Uhr ist injizierbar.

## Regeln

- Arbeitsbaum `/workspace/gymdocu-c5b` (Zweig `c5b-sperren-melden`, von `origin/master`). Einzeltests gegen
  `gymdocu_c5b_test`, NIE gegen `gymdocu_test`. `/tmp/gymdocu-suite.lock` nie löschen.
- KEINE Migration (C5-A belegt 0065/0066).
- Volle Suite am Ende: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. Dazu das Dateizahl-Ritual (Sieb nur
  über den `TESTS=(`-Block).
- Neue Testdateien registrieren.
- Jede neue Zusicherung mit Gegenprobe (ROT und GRÜN wörtlich). `melde()` und Telegram sind in Tests nie echt.
- Commit auf dem Zweig, pushen (ohne PR). Bericht je Punkt mit Beleg.
