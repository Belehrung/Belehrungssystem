# Auftrag C6-C — Löschwege, Offboarding, Meldekanal (Extrarunde C6)

Fassung 1, 01.10.2026, vor der Planprüfung. Repo GymDocu, Stand master `9dfe522` (oder neuer).

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
   - Behebung: `deprovisionStudio` liest die Queue-Zeilen des Studios VOR der Discovery und übernimmt ihre Pfade in
     die Offboarding-Ziele, mit einer eigenen Kategorie.
   - Beim Abarbeiten gelten für diese Kategorie dieselben Riegel wie in `verarbeiteKorrekturDateiQueue`
     (`findeLoeschWurzel`, für das Upload-Verzeichnis die studioübergreifende Referenzprüfung gegen die NOCH
     lebenden Studios).
   - Test (heute rot): Eine Queue-Zeile für Studio X zeigt auf eine unreferenzierte Datei unter dem Upload-Verzeichnis
     (Wegwerf-Wurzel). X wird deprovisioniert, `raeumeOffboardingRueckstaende()` läuft. Danach ist die Datei weg, und die
     Queue-Datei ist entfernt.
   - Positivkontrolle: Verweist ein ANDERES, lebendes Studio auf dieselbe Datei, bleibt sie liegen und wird als
     Auslassung gemeldet.
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
   - Nachholen: `spoolNachholen()` läuft beim Serverstart neben dem bestehenden Offboarding-Nachholen und im
     nächtlichen Retention-Lauf VOR der Studio-Schleife. Je Spool-Datei:
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
   - Tests:
     - Queue-INSERT wirft und `unlink` scheitert → genau eine Spool-Datei mit den richtigen Feldern. Ein zweiter
       Fehlschlag für denselben Pfad erzeugt keine zweite.
     - `spoolNachholen()` bei erreichbarer DB → Queue-Zeile da, Spool-Datei weg.
     - Studio gelöscht → Datei gelöscht, Spool-Datei weg.
     - Positivkontrolle: Ein referenzierter Upload bleibt liegen, die Spool-Datei bleibt.
     - Ein Spool-Eintrag mit einem Pfad außerhalb aller Wurzeln wird nicht gelöscht und gemeldet.
3. **R2-7 — Stufe 2 des Foto-Reapers fragt nach einem Stufe-1-Fehler nicht erneut (Anmerkung).**
   - In Stufe 2 wird die Tabellenabfrage auch bei `stat.stufe.<x> === 'fehler'` übersprungen. Gemeldet wird
     `stat.stufe.waisen = 'unbekannt'`, dazu die Zahl der zurückgehaltenen Waisen aus dem readdir-Zweig.
   - Test (heute rot): Die Stufe-1-Abfrage (seil) wirft dauerhaft. Erwartet: `stufenFehler === 1`,
     `stufe.waisen === 'unbekannt'`, die Meldung ohne „waisen: fehler“ und mit der zurückgehaltenen Zahl.
   - Gelöscht wird weiterhin nichts. `test_feature_foto_reaper.js:259-269` bleibt grün.
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
       Datei bleibt (heute rot).
     - Positivkontrolle: ein Pfad außerhalb des Roots ohne lebende Zeile wird gelöscht. Der bestehende L-2-Test bleibt
       grün.
5. **G1-c — die Verdrahtung „Upload-Fehlerweg → Queue“ dynamisch belegen (Anmerkung).**
   - In einem Routentest wird `unlink` für die Upload-Datei auf EACCES gestellt. Je Fehlerzweig von
     `routes/belehrungen.js` (`upload_titel_fehlt`, `upload_gueltigkeit_ungueltig`, `upload_fehler`,
     `neue_version_fehler`) wird genau eine Queue-Zeile für genau diesen Pfad erwartet.
   - Den Router echt mounten, mit Sitzung und CSRF wie in bestehenden Routentests.
   - Gegenprobe: Einen der Aufrufe auf `entferneDatei` (ohne Queue) zurückdrehen. Der Test wird an genau diesem Zweig
     rot.
6. **G1-h — eine möglicherweise doppelte Servicetechniker-Mail ist als solche erkennbar (Anmerkung).**
   - Das Restfenster selbst (Tod zwischen `sendMail` und `versandBestaetigen`) bleibt. Die Zustellung ist bewusst
     „mindestens einmal“; „genau einmal“ geht über SMTP nicht. Diese Grundsatzfrage geht als Betreiberfrage hinaus,
     nicht in diesen Auftrag.
   - Messen: Kann der Wiederholer (`core/defekt_mailer.js:474-508`) unterscheiden, ob er einen VERFALLENEN Claim (30 Min)
     zurückgesetzt hat oder einen nie versuchten Versand nachholt?
   - Wenn ja: Die Mail nach einem verfallenen Claim trägt im Betreff den Zusatz „(Wiederholung — möglicherweise schon
     zugestellt)“ und im Text einen Satz dazu. Test für beide Wege; der nie versuchte Versand bekommt keinen Zusatz.
   - Wenn nein: Nichts bauen. Das Messergebnis mit Fundstellen kommt in den Bericht.
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
     - Im frisch aufgebauten Schema sind die drei Spalten aus `migrations/0066_check_namen_vereinheitlichen.sql:70-77`
       weiterhin TEXT (Werte aus `information_schema`, Sollwerte wörtlich).
     - Keine Migrationsdatei enthält ein `ALTER COLUMN … TYPE` auf eine dieser Spalten. Die Kommentare werden vorher
       entfernt, und eine Positivkontrolle zeigt, dass das Muster eine eingesetzte Zeile findet.
   - Die Meldung verweist auf die benannte Grenze in 0066.
   - Gegenprobe: eine Wegwerf-Migrationsdatei mit `ALTER COLUMN … TYPE` im Testverzeichnis → rot.
9. **C3b4-1 bis C3b4-4 — Kommentare und Meldekanal (Anmerkung).**
   - C3b4-2:
     - In den `catch (me)`-Blöcken in `core/storage-replica.js` (`:835-836`, `:1151-1154`, `:1526-1528`,
       `:1562-1565`; die Fundstellen neu zählen) ein `console.warn` mit Quelle und Fehlermeldung ergänzen.
     - Test: `melde` wirft → je Stelle genau eine Warnzeile. Der Erfolgsweg bleibt intakt (bestehendes N2i).
   - C3b4-1, C3b4-3, C3b4-4: Die Kommentare nach `z3.md` ändern, ohne Codeänderung.

## Bericht

- Je Punkt: die neue Messung der Fundstelle, der Diff, die Gegenproben wörtlich (ROT mit dem Defekt, GRÜN ohne).
  Bei L-7, C-7 und R2-11 zusätzlich: Welche Riegel stehen zwischen Eingabe und Löschung? Die Gegenprobe mutiert alle
  diese Riegel, nicht nur einen.
- Die Sperrordnung je neuer oder geänderter Transaktion (siehe Grundsätze).
- Die volle Suite mit `diff` EXIT 0, dazu Lint.
- Neue Testdateien kommen in `test/run.sh`. Liest eine neue Datei Quelltext, kommt sie auch in die Wächterlisten
  (`test_feature_provisioning_pdf_root_static.js` und Geschwister); vorher nachsehen, welche das sind.
