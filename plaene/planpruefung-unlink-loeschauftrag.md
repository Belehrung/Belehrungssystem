# Planprüfung „Löschauftrag als eigene Zeile“ — Fassung 1

Stand 23.09.2026. Spur A `deepseek-v4-pro` mit Repo-Lesezugriff (Lesebaum `1fc97ee`), Spur B `kimi-k3`
mit Bündel (Plan + storage-replica, 0060, retention/pdf-loeschung/provisioning-Ausschnitte,
replica-verify, Worker, datei-entfernen). „getragen“ = Messung des Haupt-Agenten.

| # | Spur | Schwere | Befund | getragen |
|---|---|---|---|---|
| A1/B1 | beide | blockierend | Eindeutige Namen: Absturz oder UPDATE-Fehler zwischen `writeFile` und `UPDATE` → `.enc` ohne Zeile und ohne Auftrag; heute heilt es der deterministische Name still | ja (`core/storage-replica.js:282/289`) |
| A2 | A | blockierend | DBs mit schon angewandter alter 0060: Prüfsummensperre `core/migrate.js:51-53/133-135`; neue Tabelle muss AUCH in `core/db.js#init()` stehen | ja — prod hat 0060 nie gesehen (Zweig nie gemergt); betrifft nur Zweig-/Test-DBs; `db.js` fehlte im Plan |
| B2 | B | blockierend | `loescheReplikaFuerDatei`: SELECT → löschen → DELETE; ein Worker-UPDATE dazwischen trägt eine neue Referenz, die das DELETE mitreisst. Vorschlag `DELETE … RETURNING` | ja (gelesen `:550-580`) |
| A3/B3 | beide | sollte | Anker erst NACH beobachtetem Fehlschlag → Absturzfenster ohne Anker. Vorschlag: write-ahead (Auftrag zuerst, bei Erfolg löschen) | ja |
| A4 | A | sollte | INSERT Auftrag + DELETE Zeilen nicht atomar | ja |
| A5 | A | Anmerkung | kein UNIQUE auf Aufträgen | ja |
| B1-A | A | sollte | `ops/replica-verify.sh:220` zählt nur `storage_replica` → offene Aufträge unsichtbar für den Restore-Drill | ja |
| C1 | A | Anmerkung | „ausnahmslos remote_ref“ gilt nicht für Tests: `test_feature_storage_replica.js:91`, `test_feature_audit_batch3.js:80-84` rechnen den Pfad nach | ja |
| C3/B5 | beide | Anmerkung | onedrive-Satz gegenstandslos: `BACKENDS = ['local_mirror']` (`:41`) | ja |
| B5b | B | Anmerkung | `pruefeZweitkopieVorhanden` (`core/pdf-loeschung.js:122-133`) fehlt in der Leserliste | ja — liest nur `storage_replica` per `local_path`, kein Pfad |
| D1–D6 | A | sollte | fehlende Fundstellen: Prüfsummen-Pin, `test_feature_migration_0060_semantik.js`, `test_feature_storage_replica.js`, `test_feature_audit_batch3.js`, `server.js:1540-1542`, `core/db.js` | ja |
| B6 | B | Anmerkung | `countsCapped` muss den neuen Zähler einschliessen | ja |
| B7 | B | Anmerkung | Studio-Löschung: Auftrags-Referenzen in die PERSISTIERTE Offboarding-Queue (`provisioning.js:410-416`) | ja |
| E1 | A | sollte | Migrationstest nur auf frischer DB | teilweise — massgeblich ist der Master-Stand (prod); Test dagegen aufnehmen |
| E2/B4 | beide | sollte | Invariante über leerer Menge; `ersetzt`-Test ohne Fehlerinjektion nie rot; Schema-Roundtrip fehlt | ja |
| B-1b | B | Anmerkung | zwei Studios mit gleichem Spiegel-Root: `/dokumente/…` nicht studio-segmentiert → Pfadkollision | **gefallen**: Ordnername `${id}_${name}` (`routes/belehrungen.js:187-189`) trägt die global eindeutige Mitarbeiter-ID |
| B3-iii | B | Anmerkung | DB-Fehler in `loescheReplikaFuerDatei` → Aufrufer kommen nie wieder (`pdf-loeschung` setzt `datei_geloescht` vorher) | ja, Bestand → Sammelliste U-LOE2 |

→ Fassung 2 in `plaene/auftrag-unlink-loeschauftrag.md`.

## Runde 2 — Fassung 2 (Spur A `deepseek-v4-pro` mit Repo, Spur B `kimi-k3` mit Bündel)

| # | Spur | Schwere | Befund | getragen |
|---|---|---|---|---|
| R2-K1 | B | blockierend | Reaper löscht die DATEI vor dem Auftrag (Schnappschuss der Kandidatenliste): committet der Worker 1c dazwischen, steht `succeeded` auf einer gelöschten Datei. Der Nachweis „Reaper löscht zuerst“ legt genau die günstige Reihenfolge fest. Vorschlag: Auftrag zuerst atomar beanspruchen, dann löschen | ja (Herleitung trägt) |
| R2-D1 | A | blockierend | Reaper räumt `vorbelegt` per ENOENT ab, BEVOR die Datei existiert; Worker schreibt danach; 1c trifft 0 → Plan sagt nicht, dass die eigene Datei trotzdem gelöscht wird | ja (`core/datei-entfernen.js:146`) |
| R2-K5 | B | niedrig | = R2-D1 für 1e (0 Zeilen beim Umstellen) | ja |
| R2-K2/D-B5 | beide | hoch/Anmerkung | Weg 2 legt Aufträge nur für Referenzen unter dem AKTUELLEN Spiegel-Root an → nach Root-Wechsel fällt die Löschpflicht still weg (heute wird ohne Root-Bedingung versucht, `:556-560`) | ja |
| R2-D2 | A | sollte | Studio-Löschung: Aufträge, die nach dem Einsammeln entstehen, löscht die Discovery ungesammelt | ja; mit unbedingtem Selbstlöschen in 1e/1f bleibt nur „Worker stirbt genau dann“ |
| R2-DC | A | sollte | Discovery in `deprovisionStudio()` löscht die Tabellen in unbestimmter Reihenfolge, fängt nur 23503, nicht 40P01 → Kreis mit 1c möglich | ja (`core/provisioning.js:322-325/455-470`) |
| R2-D3 | A | Anmerkung | Abbruch wegen entzogenem Auftrag zählt als Fehlversuch → nach 5 `dead` | ja |
| R2-D4 | A | sollte | Invariante beidseitig im Test hält in legitimen Zwischenzuständen nicht; Richtung Datei→Referenz hart, Referenz→Datei nur als Endzustand nach dem Reaper | ja |
| R2-K3 | B | mittel | Gegenprobe „RETURNING“ wird im genannten Szenario nicht rot; braucht die Verzahnung SELECT → Worker-COMMIT → DELETE | ja |
| R2-K4 | B | mittel | Leichen je Absturz + Reaper nur täglich → Spiegel wächst bis zu 24 h | ja |
| R2-K6 | B | niedrig | INSERT `ersetzt` ohne ON CONFLICT (anders als Weg 2) | ja |
| R2-E1 | A | sollte | Migrationstest nach `db.init()` übt die Migrations-DDL nie mit Wirkung aus | ja |
| R2-E3/E4/E5 | A | Anmerkung | Schreib-Attrappe muss wirklich schreiben; zweite Positivkontrolle Referenz→Datei; jede Gegenprobe an ihr auslösendes Szenario binden | ja |
| R2-D-Fund | A | sollte | Fundstellen: `core/migrate.js:47-54` („Angewandte Migration ohne Datei“ → Startabbruch auf DBs mit alter 0060), `workers/pdf-job-worker.js`, `core/pdf-jobs.js`, `docs/STORAGE_REPLICA.md`, `test_deprovision.js` | ja |
| — | A | kein Befund | Schlüsselrotation fasst weder Tabelle noch Spiegel an; kein weiterer Schreiber; keine Verklemmung 1c ↔ Weg 2 | — |

→ Fassung 3 im Auftragspapier.

## Nacharbeit 9, Fassung 1 — Planprüfung (DeepSeek mit Repo, Kimi mit Bündel)

Zwei Versuche verloren (Container-Neustarts 22:1x und 22:40, `ASTRA-LAEUFE.md`); dritter Versuch mit im Vordergrund
gehaltener Sitzung. Alle Punkte selbst nachgesehen.

| Nr. | Befund | Spur | Nachgemessen | Einstufung |
|---|---|---|---|---|
| PN9-1 | `test_deprovision.js` R5-5 baut `${a}.json` fest ein — mit Laufdateien rot bzw. vakuös; das Papier nennt die Datei nicht | D | gelesen (`:128`, `:131`, `:141`, `:163`) | blockierend |
| PN9-2 | `test_feature_audit2_batchB_static.js:73` pinnt wörtlich `entferneOffboardingRest(s.id)` | D | gelesen | hoch |
| PN9-3 | `test_feature_audit2_offboarding.js:35` prüft nur `${r.id}.json` — nach dem Umbau vakuös | D, K | gelesen | hoch |
| PN9-4 | ebd. `:56-59`: Guard-Eintrag ohne `erstellt` — mit Punkt 7a erreicht der Reaper den Pfad-Guard nie mehr, die Zusicherung wird vakuös | K | gelesen | hoch |
| PN9-5 | Gegenprobe „Karenz 15 min“ ohne mittelalten Eintrag nicht rot-fähig | D, K | Logik | mittel |
| PN9-6 | Szenario R6-2 muss DASSELBE Studio zweimal deprovisionieren, sonst bleibt die Mutation „Entfernen über Studio-ID“ grün; Injektionspunkt benennen | K | Logik | mittel |
| PN9-7 | „COMMIT in der Luft“: Konstruktion beschreiben statt auf eine Probe-Datei zu verweisen; echter Weg `commitUngewiss === true` braucht eine benannte Konstruktion | D | berechtigt | mittel |
| PN9-8 | `commitUngewiss` als gewöhnliche Eigenschaft erscheint in `JSON.stringify`/`deepStrictEqual`; ein eingefrorener Fehler würfe bei der Zuweisung | K | `core/db.js` ohne `'use strict'` (gelesen: 0 Treffer) — dort still, in strict-Aufrufern nicht | niedrig |
| PN9-9 | Dateiname im `catch`: Kennung VOR `db.tx` erzeugen, sonst greift der Bau wieder zur Studio-ID | K | gelesen | niedrig |
| PN9-10 | Test „Nicht-Objekt-Wurf“ ist in `core/db.js` (sloppy mode) gegen fehlenden Guard blind | D | 0× `use strict` | niedrig |
| PN9-11 | `JSON.parse`-Fehler im Reaper bleibt stumm | D | gelesen (`:633`) | niedrig |
| PN9-12 | ungültiger Eintrag meldet jeden Lauf neu (Dauerfeuer); Zähler fehlt | D, K | Logik | niedrig |
| PN9-13 | Meldung „Studio lebt“ verzögert sich auf bis zu 24 h | K | Preis der Karenz, benennen | Anmerkung |
| PN9-14 | „Deprovisionierung dauert Sekunden“ unbelegt | K | richtig — Begründung auf „weit unter 24 h“ umstellen | Anmerkung |
| PN9-15 | R6-3-Szenario braucht einen Haken, um `erstellt` während der offenen Transaktion zurückzudatieren | K | vorhanden: `db.tx`-Attrappe mit Gate (Muster S24) | Anmerkung |
| — | `client`-Parameter in Tests benutzt | K | **gefallen**: kein Test übergibt ein drittes Argument (`grep`) | — |
| — | Boot-Aufruf des Reapers | K | **gefallen**: einziger Aufruf `server.js:1556` (Cron) | — |
| — | `plaene/`/`scratchpad/` nicht im Repo | D | **gefallen**: der Executer liest beide Orte | — |
