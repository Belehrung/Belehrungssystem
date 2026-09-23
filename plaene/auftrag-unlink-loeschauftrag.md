# Nachweis-unlink — Umbau: Löschauftrag als eigene Zeile (Fassung 1)

Stand 23.09.2026. Zweig `fix-nachweis-unlink` (HEAD `1fc97ee`), Migration 0060 ist NICHT auf master und
darf ersetzt werden. Anlass: Runde 4 (`plaene/diffpruefung-unlink.md`) — 13 Befunde, davon fünf mit
EINER Wurzel: der Löschauftrag hängt als Status `loeschen_offen` an der Replikationszeile, deren Lebenslauf
`processReplica()` (Erfolg/Fehler), `upsertReplica()`, `loescheReplikaFuerDatei()` und die Retention
mitschreiben. Jede Statusklausel verschiebt die Lücke eine Stelle weiter (R4-S1 ist durch A2 NEU entstanden).

Einordnung: normaler Auftrag mit Planprüfung, KEIN sehr komplexer — der Umbau ENTFERNT Nebenläufigkeit
(unveränderliche Auftragszeilen statt geteilter Statusmaschine), statt sie zu verfeinern.

## Gemessen vor dem Plan

* Leser von `.enc`-Pfaden nehmen ausnahmslos `remote_ref` aus der DB: `ops/replica-verify.sh:269-295`,
  `core/provisioning.js:401-406/554-560`, `core/retention.js:1104-1118`, `core/pdf-loeschung.js:246`.
  Keiner rechnet den Spiegelpfad aus `local_path` nach. → eindeutige Dateinamen je Upload sind verträglich.
* `processReplica()` schreibt `local_mirror` heute deterministisch nach `${mirrorRoot}/${rel}.enc`
  (`core/storage-replica.js:~275-280`) — ein Neu-Upload DESSELBEN Pfads überschreibt die alte `.enc`.
  Genau das macht einen Löschauftrag auf den Pfad gefährlich (er träfe die neue Datei).
* `onedrive`: jede Übertragung liefert eine neue Referenz (`onedriveImpl.uploadInhalt`).

## Zielbild

1. **Neue Tabelle** `storage_replica_loeschauftrag` (Migration 0060 ERSETZT den bisherigen Inhalt; die
   `loeschen_offen`-Erweiterung des Status-Checks entfällt, `core/db.js` deklarativ gleichziehen):
   `id` (Identität, PK), `studio_id` (NOT NULL, FK wie `storage_replica`), `backend`, `remote_ref` (NOT NULL),
   `local_path` (nur zur Auskunft), `grund` (`quelle_geloescht` | `ersetzt` | `verwaist`), `attempts`,
   `last_error`, `created_at`, `updated_at`. Eine Zeile = GENAU eine zu löschende Referenz. Niemand ausser
   dem Abarbeiter ändert sie.
2. **Eindeutige Spiegelnamen:** `local_mirror` schreibt nach `${rel}.${replica.id}-${zufall}.enc`
   (Zufall aus `crypto.randomBytes`), mit `COPYFILE_EXCL`-Äquivalent (`flag: 'wx'`). Damit kann keine
   Referenz je zwei Inhalte bezeichnen, und kein Löschauftrag trifft eine neuere Datei.
3. **`loescheReplikaFuerDatei(studio, pfad)`:** für jede Zeile mit Referenz Löschversuch; bei Fehlschlag
   INSERT Löschauftrag (`quelle_geloescht`). DANACH die Replikationszeilen löschen — wie vor Nacharbeit 6.
   Rückgabe bleibt `{ok, enc_geloescht, fehler}` (Aufrufer unverändert).
4. **`processReplica()` Erfolg:** `UPDATE … RETURNING` wie heute. (a) Keine Zeile mehr (Quelle
   zwischendurch gelöscht) → die GERADE hochgeladene Referenz sofort löschen, bei Fehlschlag Löschauftrag
   (`verwaist`). (b) Zeile trug vorher eine ANDERE Referenz → alte Referenz löschen, bei Fehlschlag
   Löschauftrag (`ersetzt`). Fehlerzweig: unverändert (schreibt nur Status/Fehler, keine Referenz).
5. **`requeueLoeschauftraege()`** (ersetzt `requeueLoeschenOffen`, gleicher Cron-Platz): je Auftrag
   Löschversuch; Erfolg (auch ENOENT) → `DELETE … WHERE id = $1 AND studio_id = $2`; Fehlschlag →
   `attempts + 1`. Keine Obergrenze (Löschpflicht endet nicht), sichtbar über `healthMetrics().loeschauftraege`
   und `melde()` je Fehlschlag. NICHT in `degraded` (Deploy-Gate).
6. **Entfernt:** Status `loeschen_offen`, A1a/A1b/A2-Sonderzweige, Rücksetzlogik, `veraltet`-Zähler.
   `upsertReplica`/`enqueueReplica`/Claim wieder wie vor Nacharbeit 6 (mit den Kommentaren berichtigt).
7. **Studio-Löschung:** `deprovisionStudio()` sammelt zusätzlich die Referenzen offener Löschaufträge
   (gleiche Mirror-Root-Prüfung wie `:554-560`), bevor die Zeilen per CASCADE verschwinden.

## Nachweis (je mit Gegenprobe ROT/GRÜN)

* Szenarien der Runde 4 als echte Tests (Test-DB, Attrappen für Löschen/Upload, kein echter Dienst):
  a1/a2/a3 (Upload läuft, Quelle wird gelöscht) → keine `.enc` ohne Zeile oder Auftrag; b (DELETE trifft
  `running`) → Auftrag `verwaist` oder gelöschte Datei; c (Retention-Retry) → nach Abschluss weder
  `.enc` noch Zeile; d (Upload zwischen Prüfung und Löschen) → neue Datei repliziert, alte gelöscht.
* **Invariante als eigener Test:** nach jedem Szenario gilt für jede `.enc` im Test-Spiegel: sie ist
  `remote_ref` GENAU EINER Replikationszeile ODER GENAU EINES Löschauftrags — Menge der Dateien auf der
  Platte gegen Vereinigung der Referenzen in der DB, beide Richtungen.
* Eindeutige Namen: zwei Uploads desselben Pfads → zwei verschiedene Referenzen, erste per Auftrag
  `ersetzt` gelöscht.
* Migration: neuer Test führt die DATEI aus (frische DB, zweiter Lauf idempotent); keine Kopie ihrer Logik.

## Fragen an die Planprüfung

1. Welcher ZUSTAND entsteht durch den Umbau, den es heute nicht gibt? Besonders: Aufträge, die nie
   abgearbeitet werden; eine `.enc`, die weder Zeile noch Auftrag hat; ein Auftrag auf eine Referenz, die
   eine lebende Zeile noch trägt.
2. Bleibt eine Verzahnung übrig, in der zwei Wege dieselbe Referenz verschieden behandeln?
3. Was wird SCHLECHTER (Speicher auf dem Spiegel, Betriebsübersicht, bestehende Spiegeldateien mit
   deterministischem Namen, `ops/replica-verify.sh`)?
4. Welche Fundstellen fehlen (weitere Schreiber auf `storage_replica`, weitere Leser von Spiegelpfaden)?

---

# FASSUNG 2 (ersetzt Fassung 1 vollständig; Befunde: `plaene/planpruefung-unlink-loeschauftrag.md`)

**Einordnung: SEHR komplex** — eine Zustandsmaschine zwischen Worker (rund um die Uhr), Cron und DB mit
Dateisystem-Nebenwirkungen, in der eine falsche Annahme still grün bleibt (zwei Planprüfungsrunden,
dreimal eine Lücke eine Stelle weiter). Nach CLAUDE.md damit Fable-fähig.

## Grundsatz: Anker ZUERST (write-ahead)

Jede Referenz auf eine Spiegeldatei, die gelöscht werden SOLL oder deren Schicksal offen ist, steht als
Zeile in `storage_replica_loeschauftrag`, BEVOR die Datei geschrieben oder gelöscht wird. Die Zeile
verschwindet erst, wenn feststeht, dass die Datei entweder weg ist oder einer lebenden
Replikationszeile gehört. Damit gilt nach JEDEM Absturz an JEDER Stelle:

> **Invariante:** jede `.enc` im Spiegel ist `remote_ref` GENAU EINER Replikationszeile oder GENAU
> EINES Löschauftrags — und kein Löschauftrag ausser `vorbelegt` zeigt auf eine Referenz, die eine
> Replikationszeile trägt.

## Schema

* Tabelle `storage_replica_loeschauftrag`: `id` (Identität), `studio_id` NOT NULL (FK wie
  `storage_replica`, ON DELETE CASCADE), `backend` (CHECK `= 'local_mirror'`), `remote_ref` NOT NULL,
  `local_path`, `grund` NOT NULL CHECK IN (`vorbelegt`, `quelle_geloescht`, `ersetzt`, `verwaist`),
  `attempts`, `last_error`, `created_at`, `updated_at`, UNIQUE (`studio_id`, `remote_ref`).
* Deklarativ in `core/db.js#init()` (CREATE TABLE IF NOT EXISTS, Hausmuster) UND als Migration.
  Die bisherige Datei `migrations/0060_storage_replica_loeschen_offen.sql` wird ersetzt durch
  `0060_storage_replica_loeschauftrag.sql` (strukturell idempotent). Status-Check von `storage_replica`
  zurück auf die fünf Werte von master. `loeschen_offen` verschwindet überall.
* **Vor dem Bau messen und melden:** legt `test/run.sh` `gymdocu_test` je Lauf frisch an? Hat irgendeine
  DB ausserhalb von Test-DBs die alte 0060 gesehen? (Soll: nein — der Zweig war nie auf master.) Wenn eine
  lokale Test-DB sie hält: neu anlegen, nicht migrieren; im Bericht nennen.

## Wege

1. **`processReplica()` — Schreiben:**
   a. Nach dem Claim, VOR `writeFile`: Name `${destPath}.${replica.id}-${hex(6)}.enc`; INSERT Auftrag
      (`vorbelegt`, diese Referenz).
   b. `writeFile` mit `flag: 'wx'`.
   c. EINE Transaktion: `SELECT remote_ref … FOR UPDATE` der Zeile (alte Referenz), `UPDATE … SET
      status='succeeded', remote_ref=neu … WHERE id AND studio_id RETURNING`, `DELETE` des eigenen
      `vorbelegt`-Auftrags (muss 1 Zeile treffen, sonst Abbruch der Transaktion — der Auftrag wurde
      inzwischen als verwaist abgearbeitet und die Datei ist weg), und falls die alte Referenz existiert
      und abweicht: INSERT Auftrag (`ersetzt`, alte Referenz). COMMIT.
   d. Nach dem COMMIT: alte Referenz löschen; Erfolg (auch ENOENT) → ihren Auftrag löschen.
   e. Trifft das UPDATE in c keine Zeile (Quelle inzwischen gelöscht): statt Abbruch den eigenen
      Auftrag auf `verwaist` umstellen, COMMIT, dann Datei löschen, Erfolg → Auftrag löschen.
   f. Fehlerzweig (catch): Status/Fehler wie heute; den eigenen `vorbelegt`-Auftrag auf `verwaist`
      umstellen (falls er noch existiert), dann Löschversuch, Erfolg → Auftrag löschen.
2. **`loescheReplikaFuerDatei(studio, pfad)`:** EINE Transaktion: `DELETE FROM storage_replica WHERE
   studio_id AND local_path RETURNING remote_ref` und für jede zurückgegebene `.enc`-Referenz unter dem
   Spiegel-Root INSERT Auftrag (`quelle_geloescht`, ON CONFLICT DO NOTHING). COMMIT. Danach je Auftrag
   Löschversuch, Erfolg → Auftrag löschen. Rückgabe `{ok, enc_geloescht, fehler}` wie bisher; `ok` nur,
   wenn alle Löschversuche gelangen. Ein laufender Worker trifft danach in 1c keine Zeile → 1e.
3. **`requeueLoeschauftraege()`** (ersetzt `requeueLoeschenOffen`, Cron 03:15 wie bisher): alle Aufträge
   ausser `vorbelegt`-Aufträgen, die jünger als `RUNNING_LEASE_MINUTES` sind. Löschversuch; Erfolg →
   `DELETE … WHERE id AND studio_id`; Fehlschlag → `attempts + 1`, `last_error`. Keine Obergrenze,
   `melde()` je Fehlschlag (wie heute über `entferneDatei`). Ein abgelaufener `vorbelegt`-Auftrag heisst:
   der Worker ist tot → die Datei ist Waise → löschen (trifft ein noch lebender Worker danach in 1c auf
   0 Zeilen beim DELETE des Auftrags, bricht er ab — kein `succeeded` auf eine gelöschte Datei).
4. **Entfernt:** Status `loeschen_offen`, alle Sonderzweige aus Nacharbeit 6/7 (Claim-, enqueue-,
   upsert-Ausnahmen, Rücksetzlogik, `veraltet`). Diese Stellen wieder wie auf master, Kommentare
   berichtigt.
5. **`healthMetrics()`:** Zähler `loeschauftraege` (ohne junge `vorbelegt`), in `countsCapped`; NICHT
   in `degraded` (Deploy-Gate). `routes/health-intern.js`-Kommentar nachziehen.
6. **`ops/replica-verify.sh`:** offene Aufträge zählen und als eigenen Zustand melden; „nicht
   konfiguriert“ nur, wenn BEIDE Tabellen leer sind. `docs/RESTORE_DRILLS.md` nachziehen.
7. **Studio-Löschung:** `deprovisionStudio()` nimmt die Auftrags-Referenzen in `ziele.replicaRefs` auf
   (persistierte Offboarding-Queue, `core/provisioning.js:405-416`), gleiche Spiegel-Root-Prüfung.
8. **Nicht angefasst, Sammelliste U-LOE2:** DB-Fehler in 2 → Aufrufer kommen nicht wieder (Bestand,
   `core/pdf-loeschung.js` setzt `datei_geloescht` vorher). Keine automatische Löschung von
   Replikationszeilen mit fehlender Quelle — eine Zweitkopie ohne Quelle ist gerade das, was ein
   Restore braucht.

## Fundstellen, die der Bau anfasst (gemessen, nicht vollständig — Bau misst nach)

`core/storage-replica.js`, `core/db.js` (Tabelle, Status-Check, Kommentar `:2246`),
`migrations/0060_*`, `server.js:1529-1543`, `routes/health-intern.js:210-230`, `core/provisioning.js:401-416`,
`ops/replica-verify.sh` + `ops/replica-verify-logik.js`, `docs/RESTORE_DRILLS.md`,
`test_feature_storage_replica.js` (umbauen), `test_feature_storage_replica_static.js`,
`test_feature_audit_batch3.js:80-93` (Pfad aus `remote_ref`), `test_feature_migration_0060_semantik.js`
(ersetzen), `test_feature_migrationen_unveraendert.js` (Pin), `test/run.sh`. Vor dem Bau per `grep`
nach weiteren Lesern von Spiegelpfaden suchen (`readdir`/Glob auf `pdf_zusatz_pfad`).

## Nachweis

* **Invariante als Test** (Dateimenge im Test-Spiegel per `readdir` rekursiv gegen die Vereinigung der
  Referenzen aus BEIDEN Tabellen, beide Richtungen, plus „kein nicht-vorbelegter Auftrag auf eine
  lebende Referenz“). Positivkontrolle: eine von Hand gelegte Datei macht sie ROT; mindestens eine
  Datei muss in jedem Szenario existiert haben (Zähler der Schreib-Attrappe > 0).
* **Szenarien, je mit Invariante danach:** normaler Upload; zweiter Upload desselben Pfads (zwei Namen,
  alte Datei weg); Löschfehlschlag der alten Datei (Attrappe) → Auftrag `ersetzt`, nach Reaper weg;
  UPDATE-Fehler nach `writeFile` (Attrappe) → `verwaist`, nach Reaper weg; Absturz simuliert zwischen
  `writeFile` und Transaktion (Auftrag bleibt `vorbelegt`, Lease abgelaufen) → Reaper löscht; Absturz nach
  COMMIT vor Schritt 1d → Auftrag `ersetzt` → Reaper; Quelle gelöscht während Upload läuft (2 zwischen
  1b und 1c) → 1e; `loescheReplikaFuerDatei` mit Löschfehlschlag → Auftrag, nach Reaper weg; ein
  lebender Worker nach abgelaufenem Lease (Reaper löscht zuerst) → kein `succeeded`.
  Nebenläufigkeit OHNE echte Zeitabhängigkeit (Attrappen, die an einer benannten Stelle den anderen Weg
  ausführen); zu jedem Szenario ein Beleg, dass die Verzahnung wirklich eintrat.
* **Migration:** die DATEI ausführen gegen (a) eine frische DB nach `db.init()`, (b) zweimal; danach
  Schema-Rundgang: INSERT ohne `studio_id` scheitert, ungültiger `grund` scheitert, doppelte Referenz
  scheitert, gültige Zeile geht.
* **Gegenproben** je Riegel (ROT/GRÜN wörtlich): write-ahead-INSERT in 1a entfernt; `wx` entfernt;
  1c ohne Prüfung „eigener Auftrag gelöscht = 1“; 2 als SELECT→löschen→DELETE statt RETURNING;
  Reaper ohne Lease-Schutz für `vorbelegt`; Invariante mit leerer Menge.

---

# FASSUNG 3 — Änderungen gegenüber Fassung 2 (sonst gilt Fassung 2)

Befunde: `plaene/planpruefung-unlink-loeschauftrag.md`, Runde 2.

1. **Beanspruchen vor Löschen (R2-K1, R2-D1).** Spalte `beansprucht_bis TIMESTAMPTZ NULL`. Der Reaper
   beansprucht je Auftrag atomar: `UPDATE … SET beansprucht_bis = now() + interval '10 minutes', attempts =
   attempts + 1 WHERE id = $1 AND studio_id = $2 AND (beansprucht_bis IS NULL OR beansprucht_bis < now())
   AND (grund <> 'vorbelegt' OR created_at < now() - make_interval(mins => $lease)) RETURNING remote_ref`.
   Nur bei 1 Zeile: Datei löschen; Erfolg → `DELETE … WHERE id AND studio_id`; Fehlschlag → `beansprucht_bis
   = NULL, last_error`. Ein Absturz nach dem Beanspruchen hinterlässt den Auftrag (Frist läuft ab).
   **1c** löscht den eigenen Auftrag mit `… AND grund = 'vorbelegt' AND beansprucht_bis IS NULL`; 0 Zeilen →
   Transaktion abbrechen. Damit gilt in beiden Reihenfolgen: wer den Auftrag zuerst hat, entscheidet.
2. **Eigene Datei immer löschen (R2-D1, R2-K5).** In 1e und 1f wird das Ergebnis des Umstellens NICHT
   ausgewertet; der Löschversuch der eigenen Datei ist unbedingt; nur sein Ergebnis steuert das DELETE des
   Auftrags (0 Zeilen dort ist kein Fehler). Ein 1c-Abbruch aus beliebigem Grund führt in 1f.
3. **Abbruch wegen entzogenem Auftrag ist kein Fehlversuch (R2-D3):** Status zurück auf `pending`,
   `attempts` um den Claim zurücksetzen; kein `dead` aus diesem Grund. Eigene Fehlerklasse, gemeldet NUR
   als Log-Zeile, nicht über `melde()`.
4. **Keine Root-Filterung beim Anlegen (R2-K2):** Weg 2 legt für JEDE zurückgegebene Referenz mit Endung
   `.enc` einen Auftrag an. Der Reaper löscht nur Referenzen, die (a) auf `.enc` enden, (b) nach
   `path.resolve` kein `..`-Segment enthalten, (c) absolut sind. Liegt eine Referenz nicht unter dem
   AKTUELLEN Spiegel-Root des Studios: trotzdem löschen, aber mit `melde()` Kennung
   `storage-replica:loeschauftrag_ausserhalb_root`; zählt in `healthMetrics` eigens.
5. **Studio-Löschung (R2-D2, R2-DC):** `deprovisionStudio()` löscht VOR der Discovery, in ihrer
   Transaktion und in fester Reihenfolge `DELETE FROM storage_replica … RETURNING remote_ref`, dann
   `DELETE FROM storage_replica_loeschauftrag … RETURNING remote_ref`, nimmt beide Mengen in
   `ziele.replicaRefs` und schreibt die Offboarding-Queue VOR dem COMMIT (Muster `:410-416`). Bleibende
   Grenze: stirbt ein Worker genau zwischen `writeFile` und 1c, während ein Studio gelöscht wird → Sammelliste
   U-LOE3.
6. **`ON CONFLICT (studio_id, remote_ref) DO NOTHING`** auch in 1c (R2-K6).
7. **Reaper stündlich** (eigener Cron, R2-K4) statt nur 03:15; `requeueStale()` bleibt 03:15.
8. **Invariante (R2-D4):** hart nur Richtung Datei → Referenz (jede Datei gehört genau einer Zeile oder
   genau einem Auftrag). Richtung Referenz → Datei als Endzustand je Szenario NACH dem Reaper, plus je
   Szenario eine positive Zusicherung „die `succeeded`-Referenz existiert als Datei“.
9. **Nachweis ergänzt:** Reaper beansprucht, BEVOR der Worker schreibt (R2-D1); Reaper zwischen Löschen
   und DELETE, Worker committet dazwischen (R2-K1); Weg 2 zwischen SELECT und DELETE mit Worker-COMMIT
   dazwischen als auslösendes Szenario der RETURNING-Gegenprobe (R2-K3); Root-Wechsel (R2-K2); Studio-
   Löschung mit laufendem Worker. Die Schreib-Attrappe schreibt echt (`fs.existsSync` je Szenario), zweite
   Positivkontrolle „Zeile mit Referenz ohne Datei“ macht die Endzustandsprüfung ROT. Jede Gegenprobe nennt
   ihr auslösendes Szenario.
10. **Migration (R2-E1, R2-D-Fund):** Test zusätzlich gegen eine DB, in der die Tabelle NACH `db.init()`
    wieder entfernt wurde (Master-Stand), dann Datei zweimal ausführen, dann Schema-Rundgang. Vor dem Bau
    messen: `core/migrate.js:47-54` wirft bei „Angewandte Migration ohne Datei“ — jede lokale Test-DB mit
    der alten 0060 wird neu angelegt; ob `test/run.sh` das ohnehin tut, im Bericht nennen.
11. **Weitere Fundstellen:** `workers/pdf-job-worker.js`, `core/pdf-jobs.js` (Job gilt als erledigt, auch
    wenn 1c abbrach — prüfen, ob der Job danach neu kommt), `core/datei-entfernen.js` (ENOENT = Erfolg),
    `docs/STORAGE_REPLICA.md`, `test_deprovision.js`.

---

# NACHARBEIT 8 (aus Diffprüfung Runde 5; Befunde `plaene/diffpruefung-unlink.md`, „Runde 5“)

Proben der Spur (gleiche Invariante wie der Test): Scratchpad `unlink-pruef5/` (`harness.js`,
`probe_*.js`). Jede Probe wird ein Szenario im Test, und die jeweilige Mutation muss danach ROT sein.

1. **Nach Eintritt in 1c fasst der Fehlerweg die eigene Datei NICHT mehr an (R5-1).** 1d bekommt ein eigenes
   try/catch, das nur protokolliert (der `ersetzt`-Auftrag bleibt für den Reaper). Wirft `db.tx` selbst
   (Rollback ODER verlorene COMMIT-Quittung — ungewiss, CLAUDE.md „Ein Wurf aus db.tx() beweist KEINEN
   Rollback“), stellt 1f nur den Anker auf `verwaist` (`… AND grund='vorbelegt' AND beansprucht_bis IS
   NULL`): hat die Transaktion committet, trifft das 0 Zeilen und die Datei gehört der Zeile; sonst holt der
   Reaper sie. Das Status-UPDATE im normalen catch bekommt `AND status = 'running'`, damit ein committetes
   `succeeded` nicht überschrieben wird. Szenarien: Fehler in 1d; COMMIT-Quittung verloren.
2. **Schreibabbruch (R5-2):** jeder `writeFile`-Fehler ausser `EEXIST` gilt als „eigene Datei
   (möglicherweise) geschrieben“ → Anker `verwaist` + Löschversuch. Szenario S17 (Attrappe legt an, schreibt
   16 Byte, wirft ENOSPC).
3. **Szenario zwei Worker nach abgelaufener Lease (R5-3)** — macht Mutation b ROT.
4. **Offboarding-Reaper prüft das Studio (R5-4):** existiert `studios.id` noch, wird der Queue-Eintrag
   NICHT abgearbeitet, sondern verworfen, mit `melde()` (eigene Kennung). Zusätzlich in
   `deprovisionStudio()` ein catch um die Transaktion, der den eben geschriebenen Queue-Eintrag entfernt.
   Test: Transaktion scheitert nach dem Queue-Schreiben → Studio lebt, Primär-PDF und Spiegeldateien bleiben.
5. **Offboarding verhaltensseitig (R5-5):** `test_deprovision.js` sichert zu: Queue-JSON trägt alle
   Referenzen (Zeile, `verwaist`, `vorbelegt`) bei scheiterndem `rmSync`, der Reaper löscht sie danach;
   scheitert die Transaktion, steht die `storage_replica`-Zeile noch. Mutationen t5 und t5b → ROT.
6. **Weg-2-Abbruch zwischen DELETE und INSERT (R5-6)** als Szenario (Rollback lässt die Zeile stehen).
7. **Weg-2-DB-Fehler (R5-7):** Transaktion einmal wiederholen; scheitert auch das, `melde()` mit Kennung
   `storage-replica:loeschauftrag_anlegen_fehlgeschlagen` (die Zeile steht dann noch, die Datei auch — sichtbar
   statt still). Szenario mit Attrappe.
8. **Entzogen-Riegel (R5-8):** `AND attempts = <eigener Claim-Wert>` zusätzlich zu `status='running'`;
   Szenario macht Mutation n ROT.
9. **Teilläufe (R5-9):** Positivitätsschwelle nur im Volllauf.
10. **Kommentare (R5-10, R5-11):** Kopf der Migration: alte 0060 lief nie ausserhalb von Test-DBs (gemessen);
    `core/provisioning.js:423` berichtigen.

Einordnung unverändert (sehr komplex). Abschluss wie immer: Gegenproben ROT/GRÜN wörtlich, volle Suite mit
Dateizahl-Ritual, Lint wörtlich, Commit + Push vor jedem langen Lauf.

---

# NACHARBEIT 9 — Fassung 1 (Diffprüfung Runde 6)

Einordnung: **sehr komplex** — unwiderrufliche Dateilöschung, Semantik eines ungewissen COMMIT, Änderung an
`core/db.js#tx` (wird überall benutzt). Befunde: `plaene/diffpruefung-unlink.md`, Abschnitt „Runde 6“.
Ort: `/workspace/gymdocu-unlink`, Zweig `fix-nachweis-unlink`, HEAD `dceda2c`.

**Wurzel (R6-1, R6-2, R6-3, R6-10):** Der Fehlerweg RÄT, ob committet wurde, obwohl `db.tx` es weiss: bis zum
Senden von `COMMIT` ist ein Wurf ein sicherer Rollback, danach ist er ungewiss.

1. **`core/db.js#tx`:** vor `client.query("COMMIT")` ein Merker `commitGesendet = true`. Im `catch` den geworfenen
   Fehler (nur wenn er ein Objekt ist, nie neu erzeugen) mit `commitUngewiss` kennzeichnen — **aber einen schon
   gesetzten `true` NIE mit `false` überschreiben** (ein innerer `db.tx`-Wurf, der durch den Callback eines äusseren
   läuft, behält seine Ungewissheit). `rollbackFehler` bleibt wie es ist.
   Test: Callback wirft → `false`; COMMIT scheitert serverseitig (z. B. verzögert geprüfte Bedingung
   `DEFERRABLE INITIALLY DEFERRED`, die erst beim COMMIT bricht) → `true`; innerer `true` durch äusseren Callback →
   bleibt `true`; ein Wurf, der kein Objekt ist, wird unverändert weitergereicht.
2. **`processReplica`, Abschluss 1c:** ist `error.commitUngewiss === false` (sicherer Rollback), wird die eigene Datei
   sofort geräumt wie vor 1c (`raeumeEigeneDatei`); sonst — `true` ODER fehlt (Attrappen, fremde Würfe) — bleibt es
   bei `markiereAnkerVerwaist`. Der Entzogen-Zweig bleibt unverändert. Szenario: der Callback wirft in einer ECHTEN
   Transaktion (z. B. Attrappe an `t.one` für das `SELECT … FOR UPDATE`) → Datei sofort weg, kein Auftrag übrig;
   S4 (Attrappe wirft ohne Kennzeichen) bleibt wie heute.
3. **Fehlerweg-UPDATEs** (Status und Entzogen-Rücksetzen) je in eigenem `try/catch` mit Log; das Aufräumen danach
   läuft IMMER, geworfen wird der URSPRÜNGLICHE Fehler (R6-4). Szenario: das Status-UPDATE wirft → ursprünglicher
   Fehler kommt an, Anker bzw. Datei werden trotzdem wie vorgesehen behandelt.
4. **Offboarding-Queue je Lauf eine eigene Datei** (R6-2): `schreibeOffboardingRest` schreibt
   `<studioId>-<laufkennung>.json` (Kennung aus `crypto.randomBytes`) und gibt den Namen zurück; Entfernen geht über
   den DATEINAMEN, nie über die Studio-ID. `cleanup_pending` nennt die eigene Datei. Bestehende Einträge im alten
   Format `<id>.json` (auf dem Server möglich) muss der Reaper weiter abarbeiten und entfernen
   (`test_feature_audit2_offboarding.js` schreibt solche; bleibt grün).
5. **`catch` in `deprovisionStudio`:** KEINE Studio-Prüfung mehr. `e.commitUngewiss === false` → eigene Queue-Datei
   entfernen (Rollback sicher). Sonst eigene Datei stehen lassen — der Reaper entscheidet nach der Karenz, wenn ein
   laufender COMMIT längst sichtbar ist (R6-1).
6. **Nach dem COMMIT, vor der Dateilöschung, die eigene Queue-Datei NEU schreiben** (frisches `erstellt`) — heilt
   den Fall, dass der Reaper sie während einer langen Transaktion verworfen hat (R6-3).
7. **Reaper `raeumeOffboardingRueckstaende`:**
   (a) Eintrag prüfen: `studio_id` positive Ganzzahl, `erstellt` lesbar — sonst `melde()` mit Kennung
   `provisioning:offboarding_rest_ungueltig`, Eintrag bleibt (R6-9);
   (b) scheitert die Studio-Prüfung → offen, nichts löschen (wie heute) — jetzt MIT Szenario (R6-6);
   (c) Karenz von 15 min auf 24 h (der Reaper läuft ohnehin nur täglich 03:20; eine Deprovisionierung dauert
   Sekunden; ein älterer Eintrag eines lebenden Studios ist ein gescheiterter Lauf) — Begründung als Kommentar;
   (d) entfernt wird die gelesene DATEI.
   Kommentar „(Boot/Cron)“ berichtigen (R6-11).
8. **Weg 2: Parameter `client` entfernen** (kein Produktivaufrufer übergibt ihn, gesucht) und damit auch den
   Zweig ohne eigene Transaktion. Die Wiederholung bleibt; `melde()` bekommt den ZWEITEN Fehler mit dem ersten als
   `cause` bzw. im Text (R6-5).
9. **Szenarien/Tests:** S23-Variante mit einem Fehler, der KEIN Entzogen ist (R6-7); S17 zusätzlich mit EIO und mit
   einem Fehler ohne `code` (R6-8); Reaper mit werfender Studio-Prüfung (R6-6); zwei gleichzeitige
   Deprovisionierungen: A scheitert im Callback, B committet und seine Dateilöschung scheitert → B's Eintrag
   überlebt, der Reaper räumt (R6-2); COMMIT „in der Luft“ (C-Probe `probe_e_offboarding.js` unter
   `scratchpad/dpu6/mess/` als Vorlage: COMMIT verzögert, Wurf sofort) → Eintrag bleibt, Reaper räumt (R6-1);
   Reaper verwirft während der Transaktion → nach dem COMMIT steht der Eintrag wieder (R6-3); beschädigte Einträge
   (R6-9). S24/S25 an die neue Logik anpassen (S24: Callback-Wurf → eigene Datei sofort weg; S25: Wurf nach dem
   COMMIT → Eintrag bleibt).

**Gegenproben** je Punkt 1–8 (ROT gemutiert, GRÜN zurück, Zahlen wörtlich), insbesondere: Merker vor statt nach
`COMMIT` gesetzt; `true` wird überschrieben; `=== false` durch `!` ersetzt (dann gilt „fehlt“ als sicher);
Queue-Entfernen wieder über die Studio-ID; Neuschreiben nach dem COMMIT weggelassen; Karenz zurück auf 15 min
(welche Zusicherung fällt?).
**Abschluss:** volle Suite, Dateizahl-Ritual, Lint, Marker-Scan, Commit, Push, Bericht mit Widersprüchen.
