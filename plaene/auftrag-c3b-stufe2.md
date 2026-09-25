# Auftrag C3b Stufe 2 — Replik-Upsert: Hash-Generation, Lease-Kennung, Budget, Wiederbelebung (Fassung 3, 25.09.2026)

Grundlage: Stufe 1 aus `plaene/auftrag-c3b-replik-upsert.md`, gemessen am 25.09.2026 auf master `00bd9c9` (Skripte
`scratchpad/c3b/m1-…`, `m2-…`, `m3-…`). Planprüfungen Fassung 1 und 2: `plaene/planpruefung-c3b.md` (daraus Fassung 2 bzw. 3; Fassung 3 präzisiert, gestaltet
nicht um). Zeilenangaben: `core/storage-replica.js` auf `00bd9c9`, vor dem Bau NEU messen.
Einordnung: **sehr komplex** — nebenläufige Zustände über zwei Leases (Zeile und Job), ein Ergebnis, das falsch grün
aussieht (`succeeded` mit falschem Inhalt), und dieselbe Datei hatte im unlink-Beitrag zehn Prüfrunden.

## Gemessen (Stufe 1)

- **M1 (V10-3):** `dead` entsteht bei `:566` (`permanent || running.attempts >= MAX_REPLICA_ATTEMPTS`, MAX 5), geschrieben
  `:575-579`. `upsertReplica` (`:108-125`) setzt bei neuem Hash `status='pending'`, lässt `attempts` stehen: `dead/5` →
  Upsert H2 → `pending/5/H2` → EIN Fehlschlag → `dead/6/H2`.
- **M2 (R6-13a):** A läuft (H1 gelesen), Upsert H2 setzt `pending`, B claimt, lädt H2, `succeeded/H2`; danach schliesst A
  ab (1c-UPDATE `:478-484` ohne Status-/Hashfilter): `succeeded/H2`, `remote_ref` zeigt auf **A's Datei mit H1**, B's
  H2-Datei ist über den in 1c angelegten Auftrag „ersetzt“ (`:496-503`) in 1d (`:513-531`) gelöscht.
- **M3 (R6-13b):** Upsert H2 zwischen erstem SELECT (`:361-364`) und Claim (`:382-388`), Datei bleibt H1: geprüft wird
  `replica.sha256` = H1 (`:411`), gebucht `succeeded/H2`, Fernkopie H1.

Gemeinsame Ursache: der hochgeladene Hash ist nirgends an die Zeile gebunden (Prüfung M3, Abschluss M2, Budget M1), und
`attempts` ist Budget UND Lease-Kennung (`:548`, `:578`: `status='running' AND attempts=$`).

## Aus der Planprüfung NACHGELESEN, im Bau zuerst zu MESSEN (vorbestehend, nicht durch C3b entstanden)

- **M4 (Kimi 2, selbst gelesen):** `pdf_jobs` hat einen eindeutigen Index über `(studio_id, job_type, dedupe_key)` für ALLE
  Status (`core/db.js:2163`), terminale Jobs werden nie gelöscht (kein `DELETE FROM pdf_jobs` im Produktivcode).
  `enqueue` (`core/pdf-jobs.js:123-148`) aktualisiert bei Konflikt nur, wenn payload, priority, **run_after** und
  max_attempts gleich sind — sonst `rowCount 0` → `DedupeConflictError`, noch VOR der Prüfung auf `TerminalDedupeError`.
  `enqueueReplica` (`:144-151`) und `requeueStale` (`:625-632`) setzen `runAfter: new Date()`. Vermutete Folge: sobald der
  erste Job einer Replik-Zeile terminal ist, (a) bekommt eine neue Dateiversion keinen Job (Aufrufer sieht
  `DedupeConflictError`; `kopierePDF` fängt und legt nur die Zeile an), (b) behandelt `requeueStale` den Fall als „offener
  Job existiert“ (`:638-641`) und tut nichts. Die Zweitkopie einer geänderten Datei entstünde dann NIE. Die Tests umgehen
  das, indem sie `pdf_jobs` von Hand löschen (`test_feature_storage_replica.js:132`, Löschauftrags-Test `:177`).
  **Erster Bauschritt: M4 über den ECHTEN Weg messen** (Datei neu schreiben → `enqueueForFile` → Job? → `requeueStale` →
  Job?), mit Positivkontrolle (derselbe Weg ohne terminalen Vorgänger-Job erzeugt einen Job). Trägt die Messung nicht,
  entfällt Punkt 6 und der Bericht sagt warum.
- **`requeueStale` läuft TÄGLICH** (`server.js:1538`, `15 3 * * *`); 15 min sind nur die Stillstandsschwelle der Abfrage.

## 1. Lease-Kennung von `attempts` trennen

Neue Spalte `claim_nr BIGINT NOT NULL DEFAULT 0`: neue Migration mit der nächsten FREIEN Nummer (C3a belegt `0062`; beim
Bau nachsehen), dazu der deklarative Block in `core/db.js` nach dem Muster von 0060 (eigener Marker, derselbe Text wie
die Migration; `test_feature_storage_replica_static.js` entsprechend erweitern) und das erneute Anwenden der Migration
in `test_feature_storage_replica.js:71-76`. Der Claim setzt `claim_nr = claim_nr + 1`; nie zurückgesetzt. Beide Riegel
im Fehlerweg (`:548`, `:578`) prüfen `status='running' AND claim_nr = <eigener Claim>`.
Warum: mit Budget-Rücksetzung (Punkt 3) träfe sonst ein Riegel über `attempts` fremde Leases (A langsam, Lease
abgelaufen, C reclaimt und scheitert, Upsert H2 setzt `attempts=0`, D claimt mit `attempts=1` = A's Claim). **Die
Gegenprobe „Riegel zurück auf `attempts`“ wird NUR in diesem Kollisionstest rot** — S23/S26 bleiben dabei grün, weil dort
beide Zähler synchron laufen; das ist erwartet, kein Beleg gegen den Test. S23/S26 und die Hilfsfunktion `zeile()`
(`test_feature_storage_replica_loeschauftrag.js:207`) selektieren zusätzlich `claim_nr` und sichern ihn literal zu.
Hinweis DB-INIT: das zusätzliche `ALTER TABLE … ADD COLUMN IF NOT EXISTS` in der SCHEMA-Transaktion folgt dem Muster des
Bestands und verschärft den offenen Punkt DB-INIT um eine Tabelle — im Bericht benennen.

## 2. Hash an den Claim binden, aus DENSELBEN Bytes prüfen (M3)

Nach dem Claim gelten `running.sha256`, `running.local_path`, `running.backend` — nicht `replica.*`. Die Datei wird EINMAL
gelesen, der Hash über genau diesen Puffer gebildet und gegen `running.sha256` gehalten, derselbe Puffer wird
verschlüsselt. **Diese Ein-Puffer-Prämisse trägt Punkt 4** (der Abschluss vergleicht den Hash der hochgeladenen Bytes);
deshalb ein eigener Test, der sie bewacht: ein Hook auf das Lesen liefert beim zweiten Aufruf andere Bytes bzw. zählt
die Aufrufe (Soll: genau EIN Lesen je Upload) — ohne ihn bleibt die Gegenprobe „zweites Lesen statt Puffer“ grün
(Planprüfung F2, Kimi 1).

## 3. Upsert: neuer Hash bekommt neues Budget; Status-Verhalten BLEIBT (M1)

`upsertReplica`: Hash NEU (`IS DISTINCT FROM`) → `status='pending'`, `attempts=0`, `last_error=NULL` — AUCH bei einer
`running`-Zeile (wie heute: die Zeile ist sofort neu beanspruchbar; das heilt einen toten Worker, Kimi 3). Hash gleich →
wie heute. **Geändert gegenüber Fassung 1:** der Upsert lässt eine laufende Lease NICHT mehr stehen — die Richtigkeit
gegen M2 liefert Punkt 4 (bedingter Abschluss), nicht das Aussperren eines zweiten Workers; Fassung 1 hätte einen neuen
Dauerzustand `running` mit totem Job erzeugt.

## 4. Abschluss nur für den Hash, der hochgeladen wurde (M2)

1c liest `sha256` und `claim_nr` mit `FOR UPDATE`. Weicht `sha256` vom hochgeladenen Hash ab, ist der Upload veraltet:
kein `succeeded`, kein Auftrag „ersetzt“, die EIGENE Datei wie in 1e (Anker `verwaist`, Datei weg). Die Zeile wird
NICHT angefasst: ein Hash-Wechsel entsteht nur über den Upsert, und der hat sie schon auf `pending`/`attempts=0` gesetzt
(Planprüfung F2, Kimi 3 — ein Rücksetzen hier wäre unerreichbar; ohne Riegel gebaut, würde es ein `succeeded` eines
anderen Workers zurückkippen). Die literalen `attempts`/`claim_nr`-Werte im M2-Test sind die Wache dagegen. Danach wirft
der Worker einen
EIGENEN, NICHT permanenten Fehler (Vorbild `LoeschauftragEntzogenError`, `:534ff`: kein Fehlversuch der Zeile), damit
der Job über `queue.retry` wiederkommt und den neuen Inhalt lädt. Der neue Zweig hängt in der bestehenden
`phase`/`commitUngewiss`-Maschinerie (R5-1/R6-10): bei ungewissem COMMIT keine Dateibehandlung über den Anker hinaus.
Gleicher Hash (abgelaufene Lease, zwei Worker, derselbe Inhalt): wie heute.
Bekannte Grenze, im Bericht zu benennen: jeder solche Wurf verbraucht einen Versuch des `pdf_jobs`-Jobs (max 5); danach
ist der Job `dead`, und es trägt Punkt 6.

## 5. Fehlerweg bei inzwischen geändertem Hash

Scheitert ein Worker und steht in der Zeile inzwischen ein ANDERER Hash als `running.sha256` (Upsert während des Laufs),
gilt der Fehlschlag dem alten Inhalt: die Zeile steht durch den Upsert schon auf `pending`/`attempts=0` (der Riegel mit
eigenem `claim_nr` trifft 0 Zeilen — so lassen), und `error.permanent` wird ENTFERNT (sonst `deadLetter` im Worker,
`workers/pdf-job-worker.js:85-88`). Benannte Folge: auch ein echter permanenter Fehler (`pdf_zusatz_pfad fehlt`,
`Backend nicht aktiv`), der mit einem Upsert zusammenfällt, wird so zu bis zu fünf Job-Versuchen statt sofort `dead`. Steht derselbe Hash (Datei ausgetauscht, der
Upsert kommt erst noch), bleibt es beim heutigen Verhalten (`SHA-256 stimmt nicht überein` permanent → `dead`); der
spätere Upsert belebt die Zeile mit `attempts=0` — und den Job über Punkt 6. Ausnahme (Planprüfung F2, DS Q1): kam der
Upsert schon VOR dem Claim, sieht sein Enqueue einen offenen Job und belebt nichts; die Zeile endet ehrlich `dead`
(Health „degraded“, blockiert den Deploy nicht — `ops/health-gate.sh` Stufe 2), bis die Datei erneut hochgeladen wird.
Das ist gewollt und im Bericht zu benennen.

## 6. Terminaler Job blockiert keine Wiederbelebung (M4, nur wenn gemessen)

`enqueueReplica` und `requeueStale`: liefert `enqueue` `DedupeConflictError` ODER `TerminalDedupeError` (bei gleichen
Parametern, DS Q2a), wird der vorhandene Job nachgeschlagen — `DedupeConflictError` trägt KEINE `jobId` (Kimi F2-2), also
über `WHERE studio_id=$1 AND job_type='storage_replicate' AND dedupe_key=$2` (alle drei Spalten des eindeutigen Index,
nie `dedupe_key` allein). Ist er terminal (`succeeded`/`dead`), wird er über `pdfJobs.requeue` wiederbelebt — mit
`priority` und `runAfter` wie beim normalen Enqueue (`requeue` setzt sonst Priorität 0, DS Q2b); ist er offen, bleibt es
beim Hinweis (der laufende Job kommt über Punkt 4/5 wieder). Verliert ein Aufrufer das Rennen zweier Wiederbelebungen
(`requeue` wirft `DedupeConflictError`, weil der Job inzwischen offen ist), gilt das als Erfolg. Ein DB-Fehler beim
Nachschlagen oder Wiederbeleben ist LAUT (`fehler++` bzw. Wurf), nie der stille Zweig „offener Job existiert“ (DS Z3). Die falschen Kommentare werden berichtigt — im Produktivcode (`core/storage-replica.js:611`); im Test
(`test_feature_storage_replica.js:129-131`) nur der Teil „requeueStale heilt täglich“, denn dort (festes `runAfter`)
fliegt tatsächlich `TerminalDedupeError` (Kimi F2-4.3). Mindestens ein Test fährt den ECHTEN Weg ohne händisches
Löschen von `pdf_jobs` und mit echtem `new Date()` (mit festem `runAfter` misst er den Produktivfehler nicht), und
mindestens einer hat ZWEI Studios mit gleichem `dedupe_key` (sonst bleibt ein Nachschlagen ohne `studio_id` grün).

## Tests (Pflicht, Vorbild: Rennen-Tests aus dem unlink-Beitrag)

M1, M2, M3 als Rennen über ZWEI Verbindungen im echten Zeitfenster (Stub genau zwischen den Anweisungen, kein direktes
Setzen des Endzustands), je mit LITERALEN Sollwerten (Status, `attempts`, `claim_nr`, `sha256`, Inhalt der Datei hinter
`remote_ref`, Löschaufträge, Status des `pdf_jobs`-Jobs). Dazu der Lease-Kollisionsfall (Punkt 1), der Fehlerweg aus
Punkt 5 (Job NICHT `dead`, kommt wieder), M4 über den echten Weg. Je Schutz eine Gegenprobe (Mutation → ROT, Rücknahme →
GRÜN, Zahlen wörtlich, die ROT-Datei benennen): Claim ohne `claim_nr`-Erhöhung, Riegel zurück auf `attempts`,
Hashvergleich gegen `replica.sha256` (rot nur über literale
`last_error`/`attempts`/`claim_nr` im M3-Test), zweites Lesen statt Puffer (rot nur im Ein-Puffer-Test), Nachschlagen ohne
`studio_id` (rot nur im Zwei-Studio-Test), 1c ohne Hashfilter, `permanent` nicht entfernt,
Upsert ohne `attempts=0`, Wiederbelebung terminaler Jobs entfernt. Bestehende Tests bleiben grün.

## Was NICHT gebaut wird

Keine Änderung an Löschauftrags-Abarbeitung (`requeueLoeschauftraege`), Reaper-Takt, OneDrive-Weg und
`MAX_REPLICA_ATTEMPTS`. Keine neue globale Lock-Klasse. DB-INIT bleibt eigener Beitrag.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht durch diese Änderung, den es vorher nicht gab — welche Zeile kann nach ihr noch `succeeded`
sagen, während die Datei hinter `remote_ref` einen anderen Inhalt hat, und welche Zeile kann `pending` stehen, ohne dass
je wieder ein Job für sie läuft?

-- Ende des Auftrags --
