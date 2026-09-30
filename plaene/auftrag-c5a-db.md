# Auftrag C5-A — Datenbank-Integrität (Extrarunde aus den Sammellisten)

Fassung 1, 30.09.2026. Repo GymDocu, Stand master `13448c8`. Zustandsprüfung: `deepseek-flash` mit Lesewerkzeugen
(`scratchpad/c5b2/antwort.txt`); die tragenden Belege hat der Haupt-Agent selbst am Quelltext nachgelesen
(0062:80-82, `routes/archiv.js:1098/1114/1124`, `routes/admin/geraete.js:5951-5962`, `core/storage-replica.js:554`,
`core/db.js:2036`).

Modell: Standard-Executer. Die Punkte sind zahlreich, aber keiner braucht eine hergeleitete Schwelle. Das Risiko
eines falschen Grüns steckt in den Migrationstests; dagegen stehen die Gegenproben-Pflicht und die Planprüfung.

Betreiber-Entscheidungen 30.09.2026: DBI-1 → „Wächter erweitern“; C3b-S2 → „nach 7 Tagen, mit Meldung“.

## Punkte

### 1. C3a-S-FK2 und C3a-S5 — Reinigungen gegen Anlage und Aufgabe im SELBEN Studio absichern

**Befund S-FK2.** `getraenkeanlage_reinigungen.aufgabe_id` hat keinen FK (`core/db.js:2036`). Löscht ein Schreiber
ausserhalb der App eine Aufgabe, zeigt das Monats-PDF in der Spalte „Reinigung“ nur „–“.

**Befund S5.** Die Waisenzählung in `migrations/0062…:80-82` und `:113-116` ignoriert `studio_id`. Eine Reinigung
aus Studio A mit einer Anlage aus Studio B gilt deshalb nicht als Waise. Im PDF von A fällt sie ganz heraus, weil der
INNER JOIN auf `studio_id` geht (`core/pdf-engine.js:1635`).

- **0062 NICHT ändern.** Sie ist auf allen Datenbanken schon gelaufen; eine Änderung wirkt nirgends. Alles kommt in
  eine NEUE Migration (nächste freie Nummer, heute 0065; vorher `ls migrations/`).
- **Ziel ist eine Zusicherung auf DB-Ebene, dass Anlage und Aufgabe zum selben Studio gehören wie die Reinigung.**
  Vorschlag: zusammengesetzte FKs `(anlage_id, studio_id) → getraenkeanlagen(id, studio_id)` und
  `(aufgabe_id, studio_id) → getraenkeanlage_aufgaben(id, studio_id)`, beide `ON DELETE RESTRICT`. Dafür braucht es
  UNIQUE `(id, studio_id)` auf den Zieltabellen.
- **Zuerst messen:**
  - Hat `getraenkeanlage_aufgaben` überhaupt `studio_id`?
  - Welche Sperren nimmt der Aufbau?
  - Wie verhält sich der Boot-Pfad `core/db.js` (FK-Härtungsschleife `:2956-2981`), wenn der alte einspaltige FK
    `…_anlage_id_fkey` aus 0062 neben dem neuen steht? Der alte bleibt stehen, sonst legt der Boot ihn neu an.
  - Wo löscht die App Aufgaben oder Anlagen hart (`routes/getraenkeanlage.js:976-992`)? Mit RESTRICT darf kein
    App-Weg neu scheitern.
- **Waisen, auch studioübergreifende, vorher zählen** (Muster 0062). Gibt es welche: `NOT VALID` plus `RAISE WARNING`
  mit Beispiel-IDs, der Rest der Migration läuft weiter. Der Endbeweis prüft, dass der Constraint existiert, und zwar
  unabhängig von seinem Namen (wie 0062).
- **Tests (eigene DB):**
  - Aufgabe mit Reinigung löschen ⇒ 23503.
  - Reinigung mit `anlage_id` aus einem fremden Studio einfügen ⇒ 23503.
  - Positivkontrolle: dieselbe Reinigung mit der Anlage des eigenen Studios wird angenommen.
  - Migrationslauf gegen eine DB mit vorbereiteter studioübergreifender Waise ⇒ WARNING und `convalidated = false`.
  - Gegenprobe je Test: Constraint weglassen ⇒ ROT.

### 2. V01-4 — `/admin/archiv/neu-single` ersetzt den Archiveintrag nicht atomar

**Befund.** `routes/archiv.js:1114` (DELETE) und `:1124` (INSERT) sind zwei Autocommits, `consumeVerifyCode` läuft
schon vorher (`:1098`). Scheitert der INSERT, ist der alte Eintrag weg und der Prüfcode verbraucht.

- DELETE und INSERT kommen in EINE `db.tx` (mit `t`, nicht mit `db`; `db.q/run` benutzen den Pool).
- **Vorher abzählen:** welche anderen Wege `pdf_archiv` für dasselbe `(studio, monat, typ)` schreiben und in welcher
  Reihenfolge sie sperren. Auch `auditAppend` zählt, falls es hier greift; siehe CLAUDE.md „Transaktionen und
  Sperren“.
- **Reihenfolge von `consumeVerifyCode`:** nach dem Messen begründet festlegen, was bei einem Absturz zwischen
  Datei und Commit übrig bleibt.
- Test: INSERT scheitern lassen (z. B. Trigger in der Test-DB) ⇒ der alte Eintrag steht noch. Gegenprobe:
  Transaktion wieder auflösen ⇒ ROT.

### 3. V05-3 — Datums-CSV-Import und Handformular ohne Kalendertag-Prüfung

**Befund.** `routes/admin/geraete.js:5951-5962` (`norm2Date`) nimmt `2026-02-31` bzw. `31.02.2026` an. Das
Handformular prüft an `:5754` und `:6584` ebenfalls nur das Format.

- Beide Stellen bekommen den vorhandenen Helfer `istGueltigesKalenderdatum` (`core/geraete-alter.js:56-59`).
- Ungültige Tage werden abgewiesen bzw. als Fehler der Zeile gemeldet, nicht still ersetzt.
- Vorher nachsehen, was die CSV-Vorschau heute bei `null` aus `norm2Date` tut, und dasselbe Verhalten nehmen.
- Test: `31.02.2026`, `2026-02-31` und `29.02.2025` werden abgewiesen, `29.02.2028` wird angenommen (Schaltjahr als
  Positivkontrolle). Gegenprobe: Helferaufruf entfernen ⇒ ROT.

### 4. V15-1r — `belehrung_freischaltung.freigeschaltet_am` in zwei Formaten

**Befund.** Die Spalte bekommt beim Anlegen einen Berliner Text ohne Sekundenbruchteile (DEFAULT, `core/db.js:1860`).
Bei `DO UPDATE` schreiben `routes/belehrungen.js:2155-2158` und `:2179-2184` dagegen `CURRENT_TIMESTAMP` im Format
der Sitzung.

- **Achtung: der Wert ist zugleich ein Generationstoken** (Lesen `:837`, Löschen mit `= $4` `:1019-1020`). Eine
  Behebung darf zwei Freischaltungen in derselben Sekunde NICHT gleich machen. Das würde der schlichte Wechsel auf
  das Sekundenformat des DEFAULT tun.
- Zuerst ALLE Leser und Vergleicher der Spalte auflisten, per grep über `freigeschaltet_am`, mit Leerraum-Toleranz.
- Danach EIN Format für beide Schreibwege, mit Mikrosekunden und in Berliner Zeit. Bestand normalisieren nur, wenn
  kein Leser den alten Text wörtlich vergleicht.
- Test: Erstanlage und Neufreischaltung erfüllen dasselbe Muster. Zwei Neufreischaltungen hintereinander ergeben
  verschiedene Werte. Gegenprobe: Ausdruck in einem der Schreibwege zurückdrehen ⇒ ROT.

### 5. DBI-1 — Drift-Wächter erkennt geänderte Defaults und Regelinhalte (Betreiber: erweitern)

**Befund.** `ops/gymdocu-schema-drift.js:126-145` vergleicht nur Tabellen, Spaltentyp/nullable und Indexnamen.
Handgeänderte DEFAULTs und CHECK-/FK-Inhalte gleichen Namens bleiben unbemerkt. `db.init()` schreibt den Istzustand
danach als Stand fest (`core/db.js:2722-2731`).

- Der Wächter vergleicht zusätzlich die Default-Ausdrücke (`pg_get_expr` über `pg_attrdef`) und die
  Constraint-Definitionen (`pg_get_constraintdef`) von SOLL und LIVE.
- **Nur melden, nichts reparieren.** Keine neuen Sperren beim Start.
- **Fehlalarme durch Normalisierung messen:** SOLL und LIVE kommen beide aus PostgreSQL, sollten also gleich
  formatiert sein. Belegt wird das mit einem Lauf, bei dem LIVE und SOLL gleich sind ⇒ keine Meldung.
- Test: in der LIVE-Test-DB einen DEFAULT und einen CHECK-Inhalt ändern ⇒ Wächter meldet beide (Menge der Meldungen
  gegen eine literale Erwartung, nicht nur eine Anzahl). Gleiche DBs ⇒ nichts.
- Gegenprobe: neuen Vergleich abklemmen ⇒ ROT.

### 6. DBI-2 — neue Tabellen mit `studio_id` tragen ihren FK selbst

**Befund.** Legt eine Migration eine Tabelle mit `studio_id` ohne eigenen FK an, holt die Boot-Schleife den FK nach
(`core/db.js:2977-2981`). Das kostet beim ersten Start ShareRowExclusive auf die neue Tabelle und auf `studios`.

- Statischer Wächter über `migrations/*.sql`: Jede Datei, die eine Tabelle mit Spalte `studio_id` anlegt, deklariert
  darin einen FK auf `studios(id)`. Ausnahmen stehen in einer literalen Liste mit Begründung, mindestens die
  bestehenden aus `FK_HAERTUNG_AUSNAHME` (`core/db.js:2956`), und nur diese.
- Bestand: alle heutigen Migrationen müssen durchgehen oder in der Liste stehen. Die Liste gehört literal in den Test,
  nicht aus `core/db.js` gelesen.
- Gegenprobe:
  - Fixture-Migration ohne FK ⇒ ROT.
  - Mit FK ⇒ GRÜN.
  - Ausnahmeliste um einen Eintrag gekürzt ⇒ ROT.
- Kommentare entfernen, bevor gesucht wird. Ein Kommentar mit „FOREIGN KEY“ darf nicht zählen.

### 7. C3b-S2 — tote Replikations-Jobs ohne Zeile (Betreiber: nach 7 Tagen abräumen, mit Meldung)

**Befund.** Fehlt die `storage_replica`-Zeile, stirbt der Job permanent (`core/storage-replica.js:554`), und Health
bleibt dauerhaft `degraded` (`core/pdf-jobs.js:368`).

- **Nur diese Klasse:** Jobs vom Typ `storage_replicate` mit Status `dead`, deren Zeile fehlt und deren Tod mehr als
  7 Tage zurückliegt.
- Das Abräumen erzeugt EINE `melde()`-Meldung je Lauf mit Anzahl und Beispielen. In Tests ist `melde` nie echt.
- `test_feature_pdf_jobs_static.js:40` verbietet `DELETE FROM pdf_jobs` im Queue-Modul, und das mit Absicht. Bevorzugt
  wird deshalb KEIN Löschen, sondern ein eigener Endstatus, den Health nicht als `degraded` zählt. Das geht nur, wenn
  das Schema einen neuen Wert zulässt; CHECK-Constraint prüfen.
- Ist Löschen unvermeidlich, bleibt die statische Zusicherung für das Queue-Modul stehen. Der Weg kommt in
  `core/storage-replica.js` mit eigener Begründung.
- **Andere tote Jobs bleiben unberührt.** Test: ein toter Job mit fehlender Zeile, älter als 7 Tage ⇒ abgeräumt und
  Health `ok`. Dieselben Fälle bleiben unberührt, wenn:
  - der Job erst 6 Tage tot ist,
  - die Zeile noch vorhanden ist,
  - er einen anderen Typ hat.
- Gegenprobe: Altersbedingung entfernen ⇒ ROT (der 6-Tage-Fall würde abgeräumt).

## Ohne Bau erledigt (Begründung in der Sammelliste nachtragen)

- **C1-S3:** DB-INIT #488 (behoben).
- **C3b-S3:** verweist auf C3b-6, also DB-INIT (ausgeliefert).
- **V01-1, V01-2, V01-9, V01-10:** S20 ist seit der Entscheidung vom 24.09.2026 stillgelegt, der Code ist
  unerreichbar.
- **V05-2:** C3a (behoben).
- **V15-2:** nach Entscheidung 24.09. umgesetzt.
- **C3a-S-FK:** nur noch Doku. Die fehlende ON-DELETE-Klausel ist der gewollte NO-ACTION-Schutz; das kommt als ein
  Kommentarsatz an die Tabelle in `core/db.js`.

## Regeln

- Arbeitsbaum `/workspace/gymdocu-c5a` (Zweig `c5a-db`, von `origin/master`). Einzeltests gegen
  `gymdocu_c5a_test`, NIE gegen `gymdocu_test`. `/tmp/gymdocu-suite.lock` nie löschen.
- Volle Suite am Ende: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. Dazu das Dateizahl-Ritual (Sieb nur
  über den `TESTS=(`-Block).
- Neue Testdateien in `test/run.sh` registrieren.
- Jede neue Zusicherung mit Gegenprobe, ROT und GRÜN wörtlich melden. Mutationsskripte nach Hausregel.
- Migrationsnummer: C5-A nimmt 0065 (und ggf. 0066). Ein paralleler Beitrag C5-B baut keine Migration.
- Commit auf dem Zweig, pushen (ohne PR). Bericht: je Punkt erledigt/widersprochen mit Beleg.
