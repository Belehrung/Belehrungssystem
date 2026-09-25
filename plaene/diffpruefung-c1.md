# Diffprüfung C1 — entschiedene Befunde (24.09.2026)

Zweig `fix-c1-entschiedene`, Kopf `12ae792`. Executer: Suite `SUITE_EXIT=0`, 374 = 374, Lint 0; Gegenproben je Fundort.
Drei Spuren (V09-1 berührt das Nummernbuch = unwiderruflich): Claude ausführend (eigener Baum, Wegwerf-DB, eigenes
Journal), `deepseek-v4-pro` mit Repo (effort high, 19 Runden, ~2,29 $), `kimi-k3` mit Bündel (Diff, `core/qr-token.js`,
`core/qr-verbrauch.js`, Fundort-Tabelle, QR-Test). Produktions-Diff selbst gelesen.

| Nr. | Spur | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| C1-D1 | **alle drei** | Die QR-Sperre prüft den ersten Block mit `frei > 0`, vergeben wird aus `waehleBlock(kandidaten, menge)` — bei `menge` > Rest von A aus B, der nie geprüft wurde → doppelt vergebene Nummern (Sperrloch); spiegelbildlich Fehlsperre, wenn A defekt, B intakt | Claude: `chargeAnlegen(10)` → `VERGEBEN 122011-122020` trotz erfüllter Bedingung für B; Mutation `gewaehlt = kandidaten[0]` → 26/0 | **blockierend** — Sperre über DIESELBE Blockwahl wie die Vergabe (`menge` hineinreichen), vor `eintragAnhaengen` |
| C1-D2 | Claude | Blockwechsel: A laut Journal voll, DB dahinter; kaputte Zeile = erste Charge aus B; B leer → vergibt 124001–124010, obwohl `dbMax < journal.hoechste` (Vorfall `datenbank_zurueckgespielt` wird sogar gemeldet) | gemessen | hoch — die Betreiber-Entscheidung lautet „fail-closed, wenn die DB hinter dem lesbaren Journal liegt“; der GLOBALE Vergleich gehört deshalb dazu: `kaputt && (dbMax < journal.hoechste ODER Vergabeblock zurück)` |
| C1-D3 | DeepSeek C2, Kimi B4 | Aktiver Block ohne lesbare eigene Journalspur (DS: `lokalJournal` null bei `lokalDb` gesetzt; Kimi: beide null, Studio hat anderswo Spuren) + kaputte Zeile → keine Sperre, obwohl die kaputte Zeile genau dieser Block sein kann | Weg aus dem Code belegt (beide Spuren) | **geht über die Betreiber-Entscheidung hinaus** → Frage an den Betreiber; bis dahin benannte Grenze (Sammelliste C1-S1) |
| C1-D4 | Claude F3 | Der Unterschriften-Wächter ist eine Schwarzliste aus drei Mustern (a194 unsichtbar; `MAX(COALESCE(…))`, `array_agg … [1]`, `FETCH FIRST`, `reduce` unerkannt); „166 Dateien, 0 Treffer“ zählt die LISTE, nicht die Verarbeitung (`slice(0,1)` → weiter grün) | gemessen | Zuordnungsliste jeder `gueltig_bis`-Stelle an `unterschriften` + gelesene Dateimenge gegen `git ls-files` |
| C1-D5 | Claude F4 | `NULLS LAST` und „neueste unbefristet → keine Warnung“ nicht festgelegt (beide Mutationen 34/0) | gemessen | Fixturen: neueste mit `datum` NULL und höherer id; neueste `gueltig_bis` NULL + ältere abgelaufen, an b1877, b1954, s927 |
| C1-D6 | Claude F5, Kimi B6, eigene | Sicht mit `*`: `ALTER COLUMN … TYPE` und `DROP COLUMN` an `unterschriften` scheitern; `RENAME COLUMN` geht durch, danach scheitert `db.init()` beim NÄCHSTEN Start („cannot change name of view column“); kein Spiegel-Wächter | Claude gemessen | ausdrückliche Spaltenliste; in `db.init()` `DROP VIEW IF EXISTS` + `CREATE VIEW` statt `OR REPLACE`; Wächter `pg_get_viewdef` ↔ db.js; Hinweis in 0061 |
| C1-D7 | Claude F6, Kimi B3 | Archiv a194: neueste Zeile `pdf='pending'` (Offline-Tablet, hängende Zeile) → Belehrung fällt aus der Zählung, obwohl ein gültiges PDF der Vorgängerin existiert; das Dashboard zeigt gültig | Claude: vorher 1, nachher 0 | Gültigkeit aus der Sicht (Entscheidung), PDF-Existenz wie vorher über ALLE Zeilen (`EXISTS`) — die Entscheidung betraf die Gültigkeit, nicht das Dokument |
| C1-D8 | Claude F7, Kimi B2 | s927 (Hub-Kachel): neueste unbefristet + ältere befristet → „nochNie“ statt gültig; die Fundort-Tabelle behauptet „unverändert“ | Claude gemessen | „nochNie“ an die EXISTENZ binden; neueste `gueltig_bis` NULL = gültig (dieselbe Regel wie b1877/b1954); Tabelle berichtigen |
| C1-D9 | Claude F8 | `test_feature_s20_migrate_functional.js`: „kein Verbindungsversuch“ kann nicht rot werden (SQLite-Pfad fehlt, das Skript stirbt vorher) | `process.exit(1)` auskommentiert → Fall (1) 4/4 grün | echte leere SQLite-Datei als Fixtur |
| C1-D10 | Claude F9, Kimi B8 | QR-Test (7)/(8): Nummern 601–900 liegen unter dem CHECK (≥ 100000) — „kein Teil-Schreiben“ grün aus dem falschen Grund; Journal-Seite nie geprüft | gemessen | Nummern ≥ 100000; Journal-Zeilenzahl/Bytes vorher = nachher |
| C1-D11 | Claude F11, Kimi B5 | Eine abgebrochene Charge (Journal > DB, bisher „sichere Richtung“) sperrt mit JEDER kaputten Zeile (auch eines Nachbarstudios) das Studio; Text nennt nur „zurückgespieltes Backup“ | gemessen | von der Entscheidung gedeckt; Kommentar und Fehlertext nennen die abgebrochene Charge und „kaputte Zeilen sind keinem Studio zuordenbar“ |
| C1-D12 | Claude F12 | BASE-TABLE-Filter nur in `core/provisioning.js` durch einen Test gebunden (Export: 15/0 mutiert; FK-Härtung: nur Warnzeile) | gemessen | Zusicherungen für Export (keine `unterschriften_neueste.csv`) und FK-Härtung (keine Warnzeile) |
| C1-D13 | Claude F13 | `test/run.sh` räumt `QR_VERBRAUCH_WURZEL` nicht ab; der QR-Test hinterlässt je Lauf ein Verzeichnis — auch auf dem Live-Gate | gemessen | Aufräumen wie die übrigen `*_WURZEL`; Test räumt sein Verzeichnis |
| C1-D14 | Claude F14 | Index `datum DESC` = NULLS FIRST, Sicht sortiert `NULLS LAST` → zusätzlicher Sort; Kommentar behauptet Übereinstimmung | EXPLAIN gemessen | Index `datum DESC NULLS LAST, id DESC` (neue Migration, 0061 ist ausgeliefert-unveränderlich? → siehe Wächter `test_feature_migrationen_unveraendert.js`: 0061 ist noch NICHT auf master, darf also geändert werden) |
| C1-D15 | Kimi B7 | Aufräum-`DELETE`s im QR-Test ohne `studio_id` | gelesen | `AND studio_id = ANY(...)` |
| C1-D16 | DeepSeek | `server.js:957` leerer `catch` um die Hub-Kachel-Abfrage (jetzt mit der Sicht) → bei DB-Fehler „alles in Ordnung“ | gelesen (vorbestehend) | → C2 (stille Fehler), Punkt 11 |
| C1-D17 | DeepSeek | `unterschriften.datum` aus Prozess-Lokalzeit (`routes/belehrungen.js:872`), die Sicht sortiert danach | vorbestehend = V01-6 | bleibt V01-6 (Sammelliste Vollprüfung) |

17 Befunde, alle getragen; einer (C1-D3) braucht eine Betreiber-Entscheidung. Überschneidung: C1-D1 alle drei Spuren;
C1-D6/D7/D8/D10/D11 je zwei. Nur Claude: D2, D4, D5, D9, D12, D13, D14. Nur DeepSeek: D16, D17. Nur Kimi: D15.
Nacharbeit läuft.

## Runde 2 — Nacharbeit 1 (Kopf `2948f77`, 25.09.2026)

Executer: volle Suite `SUITE_EXIT=0` (Log nach dem letzten Commit), 379 = 379 (`diff` EXIT 0, selbst nachgezählt),
Lint 0. Diff selbst gelesen (fünf Commits, Merge ohne Konflikt). Drei Spuren (unwiderruflich): Claude ausführend
(eigener Baum, Fuzzer 25.000 Szenarien, Mutationen, Sperrmessungen), `deepseek-v4-pro` mit Repo (29 Runden, ~4,73 $;
erster Start am Riegel abgebrochen, s. `ASTRA-LAEUFE.md`), `kimi-k3` mit QR-Bündel (972 s).

**Frage 2 (Doppelvergabe ausserhalb V09-1): von ALLEN DREI Spuren verneint** — Claude mit Fuzzer (259 Doppelvergaben,
alle V09-1; Positivkontrolle: fünf Mutationen erzeugen je 1–2 neue), DeepSeek und Kimi mit vollständiger
Fallaufzählung (fünf Kombinationen, eine unerreichbar). Einziger mengenloser Aufrufer ist die Anzeige.

| Nr. | Spur | Befund | Nachgemessen | Entscheidung (= Auftrag Nacharbeit 2) |
|---|---|---|---|---|
| C1-R2-1 | Claude B1 | **Verklemmung beim Start:** das Sicht-DDL steht im SCHEMA-Block, der als EINE Transaktion läuft; wartet `DROP VIEW` auf einen Leser der Sicht, hält `db.init()` schon 23 Relationssperren — fremde INSERTs warten 3–5 s, mit gleichzeitigem `INSERT unterschriften` **`deadlock detected` in 5 von 5 Läufen**. Trifft die Ladeprobe 5/8 gegen die Produktions-DB und jeden Neustart, während der alte Prozess bedient. Ohne Sicht-DDL im SCHEMA: 0 Verklemmungen. Master hat die Sicht noch nicht — C1 würde es einführen | Messskript der Spur (`sperre.js`), PG-Log | **blockierend** — Sicht-DDL aus dem SCHEMA heraus, eigener `pool.query`, nur wenn die Sicht fehlt oder ihre Definition abweicht (Vergleich über `pg_get_viewdef`); dann DROP+CREATE. Migration 0061 entsprechend (noch nicht ausgeliefert). Messung der Spur wiederholen: 0 Verklemmungen |
| C1-R2-2 | Claude B3 | Archiv: `EXISTS` über ALLE Zeilen zählt „1/1 gültig“, wenn die neueste Zeile gültig, aber `pending` ist und nur eine ÄLTERE, ABGELAUFENE ein PDF hat (vor C1 und in Runde 1: 0) | Probe `a194probe.js` | `EXISTS` zusätzlich `AND (u2.gueltig_bis IS NULL OR u2.gueltig_bis >= $2)`; Test mit genau diesem Fall |
| C1-R2-3 | Claude B2 | `server.js:949` `LEFT JOIN` → `JOIN` bleibt grün (63/0): kein Test hat einen positiven „nochNie“-Fall | Mutation gemessen | Fixtur Mitarbeiter ohne Unterschrift → `nochNie = 1` |
| C1-R2-4 | Kimi 2, DeepSeek 2 | Fehlertext: im globalen Zweig nennt „Auflösung: … (Block X)“ den PRÜFblock, der Rückstand liegt in einem anderen Block (6b: nennt 601–700, Rückstand in 801–900); sind global UND „ohne eigene Spur“ wahr, entfällt der Hinweis auf `aufkleber_bestellung` | Kimi an den Test-Fixturen, Code gelesen | im globalen Zweig die Blöcke mit Rückstand nennen (aus `kandidaten`); D3-Hinweis immer, wenn „ohne eigene Spur“ zutrifft; Test je Fall |
| C1-R2-5 | Kimi 1 | Aufräum-Abfragen `test_feature_qr_lage_blocklokal.js:631, :635` ohne `studio_id`, obwohl der D15-Kommentar das Gegenteil behauptet | gelesen | `studio_id` ergänzen (qr_token über qr_charge) |
| C1-R2-6 | Kimi 3 | Test (10) findet mit `indexOf` den Anker im KOMMENTAR (`core/qr-token.js:603`), nicht im Wurf (`:610`) | `grep` gemessen | im Wurf-Ausdruck suchen (z. B. `` `Auflösung: Verbrauchsjournal``) |
| C1-R2-7 | Claude B5 | `tools/qr-charge.js:305` `{ menge }` → `{}` bleibt grün (53/0): Test (8) nutzt `menge 1` | Mutation gemessen | Test (8) mit einer Menge über dem Rest des ersten Blocks |
| C1-R2-8 | Claude B4, DeepSeek | Die Klammer `(dbMax != null \|\| journal.hoechste != null)` ist an dieser Stelle immer wahr (die Leiter davor wirft) — „Erstdruck bleibt frei“ ist toter Code | M7/M8 je 53/0, Fuzzer bitgleich | Kommentar ehrlich machen („hier immer wahr, weil …“); an QR-J weitergereicht (dort wird die Leiter umgebaut, eigener Test nötig) |
| C1-R2-9 | Claude B6, B7 | DROP+CREATE nur über einen Textanker bewacht (OR REPLACE mit stehendem Anker → 63/0); Index `NULLS LAST` ohne Zusicherung; `CREATE INDEX IF NOT EXISTS` zieht einen alten Index nicht nach | gemessen | mit R2-1: Verhaltensprobe (gleiche Definition → Sicht unberührt, OID gleich; abweichende → neu angelegt); `pg_indexes.indexdef` enthält `NULLS LAST` |
| C1-R2-10 | Claude B8 | Zuordnungsliste blind bei mehr als 400 Zeichen Abstand zwischen Tabellenname und `gueltig_bis`; die Behauptung „JEDE Stelle“ ist zu stark | gemessen (63/0 vs. Positivkontrolle 62/1) | Behauptung auf „innerhalb von 400 Zeichen“ berichtigen |

Nur Claude: R2-1 (blockierend), R2-2, R2-3, R2-7, R2-9, R2-10. Nur Kimi: R2-5, R2-6. Kimi und DeepSeek: R2-4.
Claude und DeepSeek: R2-8. DeepSeeks „DROP bei jedem Start“ (Lock/Eigentümer) fällt in der Schwere (s.
`ASTRA-LAEUFE.md`), die Verklemmung dahinter fand nur die ausführende Spur. Keiner widerlegt. Nacharbeit 2 ändert
`db.init()` → Runde 3 als ausführende Spur (Sperrmessung wiederholen, Fuzzer erneut).

## Runde 3 — Nacharbeit 2 (Kopf `15b990c`, 25.09.2026)

Eine Spur (ausführend, eigener Baum, PostgreSQL 16.13, 50.000 bzw. 500.000 Unterschriften). **C1-R2-1 behoben:**
0 Verklemmungen in 25 Sperrläufen (Runde 2: 5/5), fremder INSERT 3 ms. Fuzzer: 27 bzw. 19 Doppelvergaben, alle
V09-1, 0 neue (Positivkontrolle C1-D1 zurückgedreht → 1 neue). Runde-2-Mutationen jetzt ROT (LEFT JOIN, EXISTS-Filter,
`{ menge }`, Fehlertext-Block, OR REPLACE). Kein blockierender Befund.

| Nr. | Befund | Nachgemessen (Spur) | Entscheidung |
|---|---|---|---|
| C1-R3-1 | Sichtvergleich prüft nur Spaltenliste und ORDER BY — WHERE, DISTINCT ON, LIMIT, OFFSET werden ignoriert: `WHERE false`, `DISTINCT ON (studio_id, mitarbeiter)`, `LIMIT 10` u. a. bleiben als „stimmt überein“ stehen (OID gemessen). Folge auch für künftige Änderungen: eine neue Sichtdefinition, die nur WHERE ändert, würde NIE eingespielt | gemessen, Positivkontrollen korrekt | Nacharbeit 3: exakter Vergleich — Soll-Definition als TEMP-Sicht anlegen, `pg_get_viewdef` beider vergleichen |
| C1-R3-2 | R2-9 unbewacht: `if (!idxPasst)` → `if (true)` (Index bei JEDEM Start neu, 4 s Blockade hinter einem Leser) → 73/0; Spaltenvergleich gestrichen → 73/0 | gemessen | Nacharbeit 3: OID-Stabilität des Index zusichern; Abweichungsfall mit anderer Spaltenliste |
| C1-R3-3 | Drei gleichzeitige `db.init()` bei fehlender Sicht UND fehlendem Index: 20 von 30 scheitern (`duplicate key … pg_class_relname_nsp_index`); Runde 1: 30/0; der Kommentar „racesicher“ ist falsch. Im Deploy nicht erreichbar (nacheinander), laut | gemessen | Nacharbeit 3: Prüfung + DDL unter dem vorhandenen Advisory-Lock `gymdocu:schema-migrations`; Kommentar berichtigen |
| C1-R3-4 | Indexabfrage nicht in try/catch (Sichtabfrage schon): 1 von 30 `cache lookup failed` bei gleichzeitiger DDL | gemessen | mit R3-3 erledigt; beide gleich behandeln |
| C1-R3-5 | Sicht wird ohne Schema gesucht: eine gleichnamige korrekte Sicht in einem anderen Schema verhindert die public-Sicht | gemessen | `relnamespace = 'public'::regnamespace` |
| C1-R3-6 | Indexprüfung per Teilstring: partieller Index (`WHERE false`), führende Zusatzspalte, Index auf anderer Tabelle gelten als passend | gemessen | über `pg_index` (`indrelid`, `indpred IS NULL`) bzw. exakten Abgleich |
| C1-R3-7 | R2-4 zweite Hälfte (D3-Hinweis bei gleichzeitigem Globalfall) und Text „keinem bekannten Block…“ ohne Test (58/0) | gemessen | Zusicherung in Fixtur (13) |
| C1-R3-8 | Kommentar Migration 0061 „strukturell nicht betroffen“ stimmt nicht: Transaktion „INSERT unterschriften → Sicht lesen“ gegen die Migration → 3/3 Verklemmung (heute nicht erreichbar) | gemessen | Kommentar abschwächen |
| C1-R3-9 | Test (10) wird ROT, wenn der Anker nur aus einem Kommentar entfernt wird (Prosa) | gemessen | Kommentarabzug VOR dem Zählen |
| C1-R3-10 | Kommentar zu Test (8) „GLOBAL greift nicht“ falsch (DB 100610 < Journal 100620) | gemessen | berichtigen |

**Vorbestehend auf master, NICHT C1 — neuer Punkt DB-INIT-SPERREN (Sammelliste):** die SCHEMA-Transaktion von
`db.init()` nimmt `ALTER TABLE mitarbeiter ADD COLUMN IF NOT EXISTS …` (exklusive Sperre auf `mitarbeiter`) und später
ShareLock auf `unterschriften`; ein gleichzeitiger `INSERT unterschriften` (FK-Sperre auf `mitarbeiter`) bildet einen
Kreis — master 3/3 `deadlock detected`, teils mit `db.init()` selbst als Opfer (Exit 1). Und
`ALTER TABLE unterschriften ADD COLUMN IF NOT EXISTS aufbewahrung_hold` nimmt die exklusive Sperre auch ohne Arbeit
(Leser/Schreiber warten ~4 s hinter einem Leser). Trifft die Ladeprobe 5/8 gegen die Produktions-DB und jeden
Neustart. Eigener Beitrag.

Nach Nacharbeit 3 keine vierte Prüfrunde; stattdessen fährt der Executer die Messskripte der Runde-3-Spur
(`sperre3.js`, `zweiinit3.sh`, `vergleich.js`, `vergleich_idx.js`, `schema_probe.js`) gegen den neuen Stand und
liefert die Zahlen; Diff lese ich selbst.
