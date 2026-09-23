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
