# Auftrag C6-C — Löschwege, Offboarding, Meldekanal (Extrarunde C6)

Fassung 2, 01.10.2026. Planprüfung flash mit 13 Befunden (`scratchpad/c6plan/flash-c6c.txt`). Selbst nachgemessen und
getragen sind 1 (`test_feature_foto_reaper.js:249-250` verlangt im selben Fall `'zurueckgehalten'`), 2 (`'korrekturblatt'`
speichert relative Pfade, `core/retention.js:859-865`), 4 (kein Boot-Aufruf des Offboarding-Reapers,
`core/provisioning.js:53-54`, R6-11), 5 (zehn `catch (me)`-Blöcke) und 11 (`setzeVeralteteClaimsZurueck` liefert nur
Zähler, `core/defekt_mailer.js:236-243`). Die übrigen sind eingearbeitet. sol brach am Ausgabedeckel ab und prüft
Fassung 2. Repo GymDocu, Stand master `9dfe522` (oder neuer).

**Herkunft und Einzelheiten:** `/home/user/Belehrungssystem/plaene/c6-zustand-01-10/z3.md` (absoluter Pfad, liegt NICHT im
GymDocu-Baum), Abschnitte L-7, C-7, R2-7, R2-11, G1-c, G1-h, c5g#1, G1 (Drift), C3b4-1 bis C3b4-4. Jeder Abschnitt nennt
Beleg, Zustand, Behebung, Risiko und Test. Lies sie vollständig. Sie sind FUNDORTE: zuerst neu messen. Widerspricht der
Code, abbrechen und melden.

**Einordnung.** Mehrere Punkte löschen Dateien unwiderruflich (L-7, C-7, R2-11). Eine falsche Annahme löscht hier fremde
oder noch referenzierte Dateien, und ein Test kann dabei grün sein. Gebaut wird mit dem Standard-Executer (Übergangsregel
vom 01.10.2026). Die Diffprüfung bekommt wegen der harten Löschung eine dritte Spur.

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6c`, Zweig `c6c-loeschwege` ab `origin/master`. Einzeltests nur gegen
`gymdocu_c6c_test`. Tests fassen nur Wegwerf-Wurzeln an (`fs.mkdtempSync` unter `os.tmpdir()`, Umgebungsvariablen der
Wurzeln darauf gesetzt), nie echte Verzeichnisse. `melde()` ist immer eine Attrappe.

**Grundsätze (nicht verletzen):**
- Im Zweifel nicht löschen. Scheitert eine Referenz- oder Zuordnungsprüfung, bleibt die Datei liegen, der Auftrag
  bleibt erhalten, und es wird gemeldet.
- Die Referenzprüfung für `BELEHRUNGEN_UPLOAD_DIR` (`core/datei-loeschqueue.js`, `belehrungsDateiNochReferenziert`)
  gilt auf JEDEM neuen Löschweg.
- Keine neue Sperrklasse. Wer in einer Transaktion `auditAppend` benutzt, nimmt den Studio-Lock zuerst
  (`core/integritaet.js:72-74`). Vor jeder neuen Transaktion abzählen, welche anderen Transaktionen dieselben Zeilen
  anfassen und in welcher Reihenfolge sie sperren; das Ergebnis in den Bericht.
- Dateilöschungen stehen NACH dem Commit, nie in der Transaktion.

## Entscheidungen je Punkt

1. **L-7 — Queue-Zeilen überleben das Offboarding nicht still (sollte).**
   - Messen: Welche Zeilen von `retention_datei_loeschqueue` löscht `deprovisionStudio` heute mit
     (`core/provisioning.js:644-647`)? Wie ist `rec.ziele` aufgebaut, und welche Prüfungen wendet
     `raeumeOffboardingRueckstaende` je Kategorie an?
   - Behebung nach dem Muster der beiden Replica-DELETEs in derselben Transaktion (`core/provisioning.js:582-588`):
     Direkt danach und VOR `schreibeOffboardingRest` läuft `DELETE FROM retention_datei_loeschqueue WHERE studio_id = $1
     RETURNING dateipfad, kategorie`. Die zurückgegebenen Pfade kommen als eigenes Feld in `ziele`. Weil gelöscht wird,
     was zurückkommt, gibt es kein Fenster zwischen Lesen und Discovery (flash 7).
   - Die Sperrordnung dieses DELETE gegen `verarbeiteKorrekturDateiQueue` messen und in den Bericht schreiben. Die
     Queue-Zeilen sperrt heute schon die Discovery; neu ist nur die Stelle in der Reihenfolge.
   - Kategorie `'hauptdatei'` (absoluter Pfad): Beim Abarbeiten gelten dieselben Riegel wie in
     `verarbeiteKorrekturDateiQueue` (`core/retention.js:819-858`), also absolut, `findeLoeschWurzel` und für das
     Upload-Verzeichnis die studioübergreifende Referenzprüfung gegen die NOCH lebenden Studios.
   - Kategorie `'korrekturblatt'` (relativer bzw. `/pdf/…`-Pfad, `core/retention.js:859-865`; flash 2): Diese Dateien
     liegen unter `PDF_ROOT/<sid>/Korrekturen` und damit unter `studioPdfRoot`, den die Deprovisionierung ganz entfernt
     (`core/provisioning.js:787-788`). Messen und belegen. Trägt das, brauchen sie keinen eigenen Löschweg, aber einen
     Test. Trägt es nicht, kategorieabhängig auflösen wie `core/retention.js:859-865`.
   - Ein Upload, auf den ein lebendes Studio verweist, ist KEINE Auslassung (`core/provisioning.js:775-776`). Er wird
     eigens gezählt und gemeldet („geteilt, bleibt zu Recht“), nicht über `uebersprungen` (flash 3).
   - Scheitert die Referenzprüfung, geht das über `merke()` in `ok = false`. Die Offboarding-Queue-Datei bleibt dann
     liegen (`core/provisioning.js:1005-1013`).
   - Test (heute rot): Eine Queue-Zeile für Studio X zeigt auf eine unreferenzierte Datei unter dem Upload-Verzeichnis
     (Wegwerf-Wurzel). X wird deprovisioniert, `raeumeOffboardingRueckstaende()` läuft. Danach ist die Datei weg, und die
     Queue-Datei ist entfernt.
     - Vorbedingungen werden zugesichert: Die Datei existiert vorher. KEINE `belehrungen`-Zeile irgendeines Studios
       trägt diesen Namen, auch keine mit `datei_vorhanden = 0`. Sonst löscht schon der heutige `uploadNamen`-Zweig
       (`core/provisioning.js:496-498`), und der Test ist grün aus dem falschen Grund (flash 12).
   - Positivkontrolle: Verweist ein ANDERES, lebendes Studio auf dieselbe Datei, bleibt sie liegen und wird als „geteilt“
     gemeldet.
   - Test für `'korrekturblatt'`: Eine Queue-Zeile mit `/pdf/<sid>/Korrekturen/…`. Nach Deprovisionierung und
     Abarbeiten ist die Datei weg.
   - Zweite Positivkontrolle: Eine Queue-Zeile mit einem Pfad außerhalb aller Löschwurzeln wird nicht gelöscht.
2. **C-7 — scheitert der Queue-Eintrag, geht der Löschauftrag trotzdem nicht verloren (sollte).**
   - Behebung: Scheitert in `entferneDateiOderQueue` der Queue-INSERT, wird ein Spool-Eintrag auf die Platte
     geschrieben.
     - Ort: ein eigenes Verzeichnis nach dem Muster von `OFFBOARD_QUEUE_DIR` (`core/provisioning.js:63`), also
       `DATEI_LOESCHQUEUE_SPOOL_DIR` oder sonst `path.join(PDF_ROOT, '..', 'loeschqueue-spool')`.
     - Messen und im Bericht belegen, dass dieses Verzeichnis von keiner `express.static`-Route ausgeliefert wird.
     - Eine Datei je Auftrag, atomar geschrieben (temporäre Datei, `fsync`, `rename`, wie `schreibeOffboardingRest`).
       Der Name ist deterministisch aus Studio und Pfad, damit ein zweiter Fehlschlag keine zweite Datei erzeugt.
     - Inhalt: `studio_id`, absoluter `dateipfad`, `quelle`, Zeitpunkt.
   - Nachholen: `spoolNachholen()` läuft im nächtlichen Retention-Lauf VOR der Studio-Schleife (`server.js:1611-1617`,
     Fundstelle neu messen). Es gibt KEINEN Boot-Aufruf, aus demselben Grund wie beim Offboarding-Reaper (R6-11,
     `core/provisioning.js:53-54`; flash 4). Je Spool-Datei:
     - Prüfen: absoluter Pfad und `findeLoeschWurzel`. Ein ungültiger Eintrag bleibt liegen und wird mit eigener
       Kennung gemeldet.
     - Lebt das Studio noch, wird derselbe Queue-INSERT wie oben gemacht (`ON CONFLICT DO NOTHING`). Erst nach seinem
       Erfolg wird die Spool-Datei entfernt.
     - Existiert das Studio nicht mehr, wird direkt gelöscht, mit Referenzprüfung für das Upload-Verzeichnis. Gelingt
       es, wird die Spool-Datei entfernt, sonst bleibt sie für den nächsten Lauf.
     - Scheitert die DB wieder, bleibt die Spool-Datei liegen.
   - Scheitert auch das Spool-Schreiben: Meldung mit eigener Kennung und eigenem `grund`. Das ist der einzige verbleibende
     Verlustfall; er wird im Kopf von `core/datei-loeschqueue.js` als benannte Grenze geführt.
   - Den Vertrag im Dateikopf (Zeilen 16-26) nachziehen. Alle Aufrufer von `entferneDateiOderQueue` darauf prüfen, ob
     sie auf `grund` oder `queue` verzweigen; die Liste mit Fundstellen in den Bericht.
   - Messergebnis der Planprüfung (flash 10): Kein Produktionsaufrufer verzweigt auf `grund` oder `queue`
     (`core/pruefbericht.js:141`, die sechs Stellen in `routes/belehrungen.js`). Nachmessen und in den Bericht.
   - Tests:
     - Queue-INSERT wirft und `unlink` scheitert → genau eine Spool-Datei mit den richtigen Feldern. Ein zweiter
       Fehlschlag für denselben Pfad erzeugt keine zweite. Vorbedingung: Das Spool-Verzeichnis ist vorher leer. Die
       Sollwerte der Felder sind Literale, nicht aus dem Modul gelesen (flash 13).
     - `spoolNachholen()` bei erreichbarer DB → Queue-Zeile da, Spool-Datei weg.
     - Studio gelöscht → Datei gelöscht, Spool-Datei weg.
     - Positivkontrolle: Ein referenzierter Upload bleibt liegen, die Spool-Datei bleibt.
     - Ein Spool-Eintrag mit einem Pfad außerhalb aller Wurzeln wird nicht gelöscht und gemeldet.
3. **R2-7 — Stufe 2 des Foto-Reapers fragt nach einem Stufe-1-Fehler nicht erneut (Anmerkung).**
   - Heute überspringt Stufe 2 die Tabellenabfrage nur bei `'tabelle_fehlt'` (`core/foto-reaper.js:202-203`). Neu:
     auch bei `'fehler'`.
   - Gemeldet wird weiter `stufe.waisen = 'zurueckgehalten'` mit der Zahl der zurückgehaltenen Dateien (die Sperre
     greift). So bleibt `test_feature_foto_reaper.js:249-250` unverändert gültig, und es gibt keinen neuen Statuswert
     (flash 1).
   - Weil die Namen dieser Tabelle fehlen, ist die Zahl eine Obergrenze. Die Meldung sagt das („bis zu N, Tabelle
     seil nicht lesbar“).
   - Test (heute rot): Die Seil-Abfragen in Stufe 1 UND Stufe 2 werfen dauerhaft; die Attrappe trifft beide Muster und
     zählt das in der Zusicherung mit. Erwartet:
     - `stufenFehler === 1` (heute 2);
     - `stufe.waisen === 'zurueckgehalten'` (heute `'fehler'`);
     - `waisenZurueckgehalten >= 1`;
     - die Meldung ohne „waisen: fehler“.
   - Gelöscht wird weiterhin nichts. `test_feature_foto_reaper.js:249-250` und `:259-269` bleiben grün.
4. **R2-11 — ein `.enc` aus der Offboarding-Queue wird nicht gelöscht, wenn eine lebende Zeile darauf zeigt (Anmerkung).**
   - Hintergrund: Nach der Deprovisionierung gibt es die `storage_replica`-Zeilen des Studios nicht mehr. Ein Abgleich
     „gehört dem Studio“ ist dann nicht möglich. Möglich und billig ist der Abgleich „gehört keinem anderen“.
   - Behebung: Vor dem Löschen einer Replica-Referenz in `core/provisioning.js:866-882` wird geprüft, ob eine NOCH
     vorhandene Zeile in `storage_replica` (`remote_ref`) oder ein offener Auftrag in
     `storage_replica_loeschauftrag` auf genau diesen Pfad zeigt.
     - Wenn ja: nicht löschen, als Auslassung zählen und melden.
     - Scheitert die Prüfung, wird nicht gelöscht, und der Queue-Eintrag bleibt.
     - Die L-2-Fälle (Pfad außerhalb des aktuellen Spiegel-Roots, keine lebende Zeile) werden weiter gelöscht.
   - Die Spaltennamen messen, nicht raten.
   - Tests:
     - Ein Queue-Eintrag mit einem `.enc`-Pfad, auf den die `storage_replica`-Zeile eines lebenden Studios zeigt → die
       Datei bleibt (heute rot). Das ist ein konstruierter Verteidigungsfall: Die Namensbildung macht jede `.enc` zur
       Referenz genau einer Zeile (`core/storage-replica.js:340-344`, `:666`; flash 6). Der Bericht weist das so aus.
     - Vorbedingung: Die Datei existiert vorher (flash 13).
     - Positivkontrolle: ein Pfad außerhalb des Roots ohne lebende Zeile wird gelöscht. Der bestehende L-2-Test bleibt
       grün.
5. **G1-c — die Verdrahtung „Upload-Fehlerweg → Queue“ dynamisch belegen (Anmerkung).**
   - In einem Routentest wird `unlink` für die Upload-Datei auf EACCES gestellt. Je Fehlerzweig von
     `routes/belehrungen.js` (`upload_titel_fehlt`, `upload_gueltigkeit_ungueltig`, `upload_fehler`,
     `neue_version_fehler`) wird genau eine Queue-Zeile für genau diesen Pfad erwartet.
   - Die zwei übrigen Stellen (`neue_version_unbekannt`, `datei_ohne_verweis`; `routes/belehrungen.js:2361-2688`,
     neu zählen) werden ebenfalls dynamisch geprüft. Wo eine nicht erreichbar ist, steht der Grund im Bericht (flash 8).
   - Den Router echt mounten, mit Sitzung und CSRF wie in bestehenden Routentests.
   - Gegenprobe: Einen der Aufrufe auf `entferneDatei` (ohne Queue) zurückdrehen. Der Test wird an genau diesem Zweig
     rot.
6. **G1-h — entfällt in diesem Auftrag.**
   - Die Planprüfung hat gemessen (flash 11, selbst nachgemessen): Der Wiederholer kann einen verfallenen Claim nicht
     von einem nie versuchten Versand unterscheiden (`core/defekt_mailer.js:236-243`, `:480-490`).
   - Das Restfenster geht als Betreiberfrage hinaus: Die Zustellung bleibt „mindestens einmal“.
7. **c5g#1 — acorn und ipaddr.js in die Deckungsliste (Anmerkung).**
   - `"acorn"` und `"ipaddr.js"` in `ops/export-check-deckung.json` → `pakete` aufnehmen und den Kommentar in Zeile 2
     nachziehen.
   - `test_feature_export_gate_static.js` bekommt zwei Zusicherungen auf die Liste.
   - Vorher und nachher `node ops/export-check.js` laufen lassen (oder wie die CI es aufruft) und beide Ausgaben in den
     Bericht. Das Gate muss nach der Änderung grün sein. Ist es rot, abbrechen und melden.
8. **G1 (Drift, 0066) — den heute unerreichbaren Zustand laut machen, statt eine Migration zu bauen (Anmerkung).**
   - Eine neue Migration, die zwei Ausgabeformen annimmt, würde echten Drift verdecken. Sie nähme außerdem
     ACCESS EXCLUSIVE auf zwei Tabellen, also wird sie NICHT gebaut.
   - Stattdessen eine Zusicherung in `test_feature_check_namen_vereinheitlichen.js` mit zwei Teilen:
     - Im frisch aufgebauten Schema sind die drei Spalten weiterhin TEXT. Benannt sind sie in
       `migrations/0066_check_namen_vereinheitlichen.sql:3-10`, die Grenze steht in `:70-77`. Die Werte kommen aus
       `information_schema`, die Sollwerte stehen wörtlich da.
     - Keine Datei `migrations/*.sql` enthält ein `ALTER COLUMN … TYPE` auf eine dieser Spalten.
       - Der Scanbereich ist NUR `migrations/*.sql`. Die Testdatei selbst enthält solches SQL (`:429`, `:448`).
       - Die Zahl der gescannten Dateien ist > 0.
       - Kommentare werden vorher entfernt (`0061:67` ist ein Kommentar).
       - Eine Positivkontrolle zeigt, dass das Muster eine eingesetzte Zeile findet (flash 9).
   - Die Meldung verweist auf die benannte Grenze in 0066.
   - Gegenprobe: eine Wegwerf-Migrationsdatei mit `ALTER COLUMN … TYPE` im Testverzeichnis → rot.
9. **C3b4-1 bis C3b4-4 — Kommentare und Meldekanal (Anmerkung).**
   - C3b4-2:
     - ALLE `catch (me)`-Blöcke in `core/storage-replica.js` bekommen ein `console.warn` mit Quelle und Fehlermeldung.
       Gemessen sind es zehn (`:836`, `:1154`, `:1283`, `:1295`, `:1319`, `:1338`, `:1356`, `:1371`, `:1528`, `:1565`;
       flash 5).
     - Statische Zusicherung: Die Zahl der `catch (me)`-Blöcke ist gleich dem Literal 10, und jeder enthält
       `console.warn`.
     - Dazu ein dynamischer Test an EINER Stelle: `melde` wirft → genau eine Warnzeile. Der Erfolgsweg bleibt intakt
       (bestehendes N2i).
   - C3b4-1, C3b4-3, C3b4-4: Die Kommentare nach `z3.md` ändern, ohne Codeänderung.

## Bericht

- Je Punkt: die neue Messung der Fundstelle, der Diff, die Gegenproben wörtlich (ROT mit dem Defekt, GRÜN ohne).
  Bei L-7, C-7 und R2-11 zusätzlich: Welche Riegel stehen zwischen Eingabe und Löschung? Die Gegenprobe mutiert alle
  diese Riegel, nicht nur einen.
- Die Sperrordnung je neuer oder geänderter Transaktion (siehe Grundsätze).
- Die volle Suite mit `diff` EXIT 0, dazu Lint.
- Neue Testdateien kommen in `test/run.sh`. Liest eine neue Datei Quelltext, kommt sie auch in die Wächterlisten
  (`test_feature_provisioning_pdf_root_static.js` und Geschwister); vorher nachsehen, welche das sind.
