# Auftrag C6-C — Löschwege, Offboarding, Meldekanal (Extrarunde C6)

Fassung 5, 01.10.2026. Vierte Planprüfung flash über Fassung 4 mit 10 Befunden (`scratchpad/c6plan/flash-c6c-f4.txt`).
Selbst nachgemessen sind 1 (`core/retention.js:1072-1077` fügt IN der Transaktion ein, nur `:1236-1240` nach dem Commit)
und 8 (`routes/belehrungen.js:50`: Die Nachweise löschen weiter über `entferneDatei`). 10 (ein älterer Reaper verwirft
ein unbekanntes `ziele`-Feld still) ändert den Entwurf: Die Queue-Pfade gehen in die BESTEHENDEN `ziele`-Felder, ein
neues Feld gibt es nicht. Die übrigen Befunde sind eingearbeitet.

Fassung 4: Dritte Planprüfung flash über Fassung 3 mit 13 Befunden (`scratchpad/c6plan/flash-c6c-f3.txt`).
Selbst nachgemessen sind 1 (`test_feature_storage_replica_loeschauftrag.js:1162-1177`, S27: Mit dem Studio-Lock zuerst
hinge der Test), 4 (`core/provisioning.js:488-495`: Mitarbeiter-Ordner `<maId>_…`, kein Studio-Ordner), 6
(`test_feature_offboarding_ziel_ausserhalb_root.js:115` verlangt keine Meldung) und 9 (Fremdschlüssel erst aus der
Boot-Härtung, `core/db.js:2980-2994`). Der Studio-Lock aus Fassung 3 entfällt deshalb; die Queue wird stattdessen am
ENDE der Discovery übernommen. Die übrigen Befunde sind eingearbeitet.

Fassung 3: Zweite Planprüfung sol über Fassung 2 mit 9 Befunden (`scratchpad/c6plan/sol-c6c4.txt`).
Selbst nachgemessen und getragen sind 1, 3 (`core/provisioning.js` nimmt keinen Studio-Lock, `fuehreLoeschungenAus`
nimmt ihn über `auditTx`), 7, 8 und 9 (`core/retention.js:832` prüft nur `path.resolve`, nicht `path.isAbsolute`).
2, 4, 5 und 6 folgen aus dem Code wie beschrieben und sind eingearbeitet, 5 als benannte Grenze.

Fassung 2: Planprüfung flash mit 13 Befunden (`scratchpad/c6plan/flash-c6c.txt`). Selbst nachgemessen und
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
   - Behebung:
     - Die Discovery nimmt `retention_datei_loeschqueue` aus.
     - NACH der Discovery und VOR dem Löschen der `studios`-Zeile läuft `DELETE FROM retention_datei_loeschqueue WHERE
       studio_id = $1 RETURNING dateipfad, kategorie`.
     - Jeder zurückgegebene Pfad wird über `darfFremdlosLoeschen` (unten) einem BESTEHENDEN `ziele`-Feld zugeordnet, es
       gibt KEIN neues Feld. Ein älterer Reaper (Rollback nach einem Deploy) würde ein unbekanntes Feld still verwerfen
       und die Queue-Datei als erledigt entfernen (`core/provisioning.js:777-784`, `:1005-1009`; flash F4-10). Die
       Zuordnung:
       - unter `PDF_ROOT/<X>/`, `PDF_ROOT/_quarantaene/<X>/` oder (Korrekturblatt) `PDF_ROOT/<X>/Korrekturen` → schon
         durch `studioPdfRoot` bzw. `studioQuarantaenePfad` abgedeckt, nichts hinzuzufügen;
       - in einem Mitarbeiter-Ordner von X unter `DOKUMENTE_DIR` → schon durch `dokumenteOrdner` abgedeckt;
       - DIREKT (flach, `path.dirname` gleich dem Verzeichnis) in `BELEHRUNGEN_UPLOAD_DIR`, `PRUEFBERICHT_DIR` oder
         `EINWEISUNG_NACHWEIS_DIR` → der Dateiname kommt zu `uploadNamen`, `berichtNamen` bzw. `nachweisNamen`
         (ohne Doppelte);
       - alles andere → nicht übernehmen, zählen, nach dem Commit melden.
     - Danach wird die Offboarding-Queue-Datei mit demselben Namen (`laufKennung`) noch VOR dem COMMIT neu geschrieben,
       atomar wie `schreibeOffboardingRest`. Scheitert dieses Neuschreiben, wirft der Callback; das ist ein sicherer
       Rollback wie bei R7-2.
   - Warum am Ende statt am Anfang (sol 3, flash F3-1): `fuehreLoeschungenAus` nimmt den Studio-Lock (`:1014`), sperrt
     dann eine Fachzeile (`:1050-1058`) und fügt danach Queue-Zeilen ein (`:1071-1077`; flash F4-9). Nimmt die Deprovisionierung die Queue-Zeilen
     ebenfalls NACH den Fachzeilen, sperren beide in derselben Reihenfolge, und für dieses Paar entsteht kein Kreis.
     Einen Studio-Lock nimmt die Deprovisionierung weiterhin NICHT; S27 bleibt unverändert.
   - Späte Einträge (sol 2): Ein Queue-Eintrag, der nach diesem DELETE noch eingefügt wird, lässt das Löschen des
     Studios am Fremdschlüssel scheitern. Die Transaktion rollt zurück, und es wird nichts gelöscht.
     - Voraussetzung: Den Fremdschlüssel `fk_retention_datei_loeschqueue_studio` in der Test-DB messen. Er entsteht
       erst in der Boot-Härtung (`core/db.js:2980-2994`, flash F3-9). Fehlt er, abbrechen und melden.
     - Die Fehlermeldung nennt diesen Grund ausdrücklich, nicht „FK-Zyklus“.
     - Test mit einer Barriere: Über eine zweite Verbindung wird nach dem RETURNING und vor dem Löschen des Studios eine
       Zeile eingefügt → Rollback, Studio lebt, Queue-Zeile da.
   - Die Sperrordnung des neuen DELETE gegen alle Wege messen, die die Queue anfassen
     (`verarbeiteKorrekturDateiQueue`, `entferneDateiOderQueue`, `fuehreLoeschungenAus`), und in den Bericht schreiben.
     Bestehende Verzahnungstests (S27 und Geschwister) bleiben unverändert grün.
   - Die Schleifen für `berichtNamen` und `nachweisNamen` im Reaper (`core/provisioning.js:847-866`, neu messen) bekommen
     dieselbe studioübergreifende Referenzprüfung wie `uploadNamen` (`:822-824`). Über die Queue können jetzt Namen
     hineinkommen, die nicht aus den eigenen Zeilen von X stammen (sol 1). Die Tabellen und Spalten messen, die
     `core/provisioning.js:523-531` liest.
   - Kategorie `'hauptdatei'`: Die Wurzelprüfung allein reicht NICHT, denn eine Löschwurzel sagt nichts darüber, welchem
     Studio die Datei gehört (sol 1). Gelöscht wird nur über EINE neue, gemeinsame Funktion (Arbeitsname
     `darfFremdlosLoeschen(pfad, kategorie, studioId, kontext)`), die L-7 und C-7 beide benutzen:
     - Kategorie `'korrekturblatt'`: Auflösen wie `core/retention.js:859-866` (relativ bzw. `/pdf/<sid>/…`). Der Pfad muss
       unter `PDF_ROOT/<studioId>/Korrekturen` liegen. Dann deckt ihn das Entfernen von `studioPdfRoot` ab, und der
       Eintrag gilt als abgeschlossen. Sonst wird er gezählt und gemeldet (flash F3-2).
     - Kategorie `'hauptdatei'`: `path.isAbsolute` wird VOR jeder Normalisierung geprüft (sol 9), danach
       `findeLoeschWurzel`.
     - Pfade unter `PDF_ROOT` müssen unter `PDF_ROOT/<studioId>/` oder `PDF_ROOT/_quarantaene/<studioId>/` liegen
       (`core/provisioning.js:546-556`, flash F3-5). Beide deckt das rekursive Entfernen ab, der Eintrag ist abgeschlossen.
     - Pfade unter `DOKUMENTE_DIR`: Die Ordner heißen `<maId>_…` (`core/provisioning.js:488-495`, flash F3-4).
       - Im Offboarding (Mitarbeiter-IDs von X sind vor der Discovery bekannt): Ein Pfad in einem Ordner von X ist
         abgedeckt (`dokumenteOrdner`).
       - Sonst, und immer im Spool-Nachholen ohne lebendes Studio, gibt es keinen belegbaren Bezug. Dann wird nicht
         gelöscht, sondern gezählt und gemeldet; das ist kein `merke()`.
     - Ein Pfad im Ordner eines ANDEREN Studios wird nie gelöscht, sondern gezählt und gemeldet.
     - Ablehnungen sind gezählt und abgeschlossen. Nur ein Fehler einer DB-Prüfung geht in `merke()` (`ok = false`).
       Sonst liefe der Eintrag jeden Tag erneut auf (flash F3-2).
     - Flache, mandanten-globale Verzeichnisse (`BELEHRUNGEN_UPLOAD_DIR`, `PRUEFBERICHT_DIR`, `EINWEISUNG_NACHWEIS_DIR`):
       Gelöscht wird nur, wenn KEIN lebendes Studio den Dateinamen referenziert. Für Belehrungen gibt es die Prüfung schon
       (`belehrungsDateiNochReferenziert`). Für Prüfberichte und Einweisungs-Nachweise die Tabellen und Spalten messen,
       die `core/provisioning.js:523-531` liest, und die Prüfung studioübergreifend analog bauen.
     - Lässt sich für ein Verzeichnis keine Referenzprüfung belegen, wird nicht gelöscht, sondern gemeldet.
     - Scheitert eine Prüfung, wird nicht gelöscht.
   - Kategorie `'korrekturblatt'` (relativer bzw. `/pdf/…`-Pfad, `core/retention.js:859-865`; flash 2): Diese Dateien
     liegen unter `PDF_ROOT/<sid>/Korrekturen` und damit unter `studioPdfRoot`, den die Deprovisionierung ganz entfernt
     (`core/provisioning.js:787-788`). Messen und belegen. Trägt das, brauchen sie keinen eigenen Löschweg, aber einen
     Test. Trägt es nicht, kategorieabhängig auflösen wie `core/retention.js:859-865`.
   - Ein Upload, auf den ein lebendes Studio verweist, ist KEINE Auslassung (`core/provisioning.js:775-776`). Er wird
     eigens GEZÄHLT, aber NICHT gemeldet, wie heute im `uploadNamen`-Zweig. Er bleibt zu Recht liegen, und
     `test_feature_offboarding_ziel_ausserhalb_root.js:115` und `:157` bleiben unverändert (flash 3, flash F3-6).
   - Scheitert die Referenzprüfung, geht das über `merke()` in `ok = false`. Die Offboarding-Queue-Datei bleibt dann
     liegen (`core/provisioning.js:1005-1013`).
   - Test (heute rot): Eine Queue-Zeile für Studio X zeigt auf eine unreferenzierte Datei unter dem Upload-Verzeichnis
     (Wegwerf-Wurzel). X wird deprovisioniert.
     - Die direkte Löschung nach dem Commit wird gezielt zum Scheitern gebracht, nach dem Muster
       `test_deprovision.js:173-201` (sol 8).
     - Zwischenzustand zusichern: Die Datei liegt, es gibt GENAU EINE Offboarding-Queue-Datei, und sie führt den
       Dateinamen in `uploadNamen`.
     - Danach die Attrappe zurückstellen und `raeumeOffboardingRueckstaende()` laufen lassen. Erwartet: Die Datei ist
       weg, und die Queue-Datei ist entfernt.
     - Vorbedingungen werden zugesichert: Die Datei existiert vorher. KEINE `belehrungen`-Zeile irgendeines Studios
       trägt diesen Namen, auch keine mit `datei_vorhanden = 0`. Sonst löscht schon der heutige `uploadNamen`-Zweig
       (Sammeln `core/provisioning.js:496-498`, Löschen `:822-824`), und der Test ist grün aus dem falschen Grund
       (flash 12, flash F4-7).
   - Positivkontrolle: Verweist ein ANDERES, lebendes Studio auf dieselbe Datei, bleibt sie liegen. Sie wird als
     „geteilt“ gezählt, nicht gemeldet.
   - Test für `'korrekturblatt'`: Eine Queue-Zeile mit `/pdf/<sid>/Korrekturen/…`. Nach Deprovisionierung und
     Abarbeiten ist die Datei weg.
   - Zweite Positivkontrolle: Eine Queue-Zeile mit einem Pfad außerhalb aller Löschwurzeln wird nicht gelöscht.
   - Dritte Positivkontrolle (sol 1): Eine Queue-Zeile von X zeigt INNERHALB einer erlaubten Wurzel auf eine vorhandene
     Datei des lebenden Studios B (`PDF_ROOT/<B>/…`). Datei bleibt, gezählt und gemeldet.
   - Vierte Positivkontrolle (sol 9): ein relativer Pfad, dessen Auflösung in einer erlaubten Wurzel läge, wird nicht
     gelöscht.
   - Derselbe `path.isAbsolute`-Riegel kommt auch in `verarbeiteKorrekturDateiQueue`, Zweig `'hauptdatei'`
     (`core/retention.js:832`). Test: Eine Queue-Zeile mit relativem Pfad wird nicht gelöscht und als Fehler gezählt
     (flash F3-8).
   - Fünfte Positivkontrolle (flash F3-5): ein eigener Pfad unter `PDF_ROOT/_quarantaene/<X>/`. Er gilt als abgedeckt
     und wird nicht als fremd gemeldet.
2. **C-7 — scheitert der Queue-Eintrag, geht der Löschauftrag trotzdem nicht verloren (sollte).**
   - Behebung: Ein Spool-Eintrag wird auf die Platte geschrieben, und zwar in drei Fällen:
     - in `entferneDateiOderQueue`, wenn der Queue-INSERT scheitert;
     - ebenda, wenn schon die Referenzprüfung scheitert (DB weg; `core/datei-loeschqueue.js:88-91`, sol 4). Dann wird
       nicht gelöscht, aber vorgemerkt;
     - im Retention-Weg NUR beim Queue-INSERT NACH dem Commit (`core/retention.js:1236-1240`; sol 4). Dafür derselbe
       Helfer.
     - NICHT beim INSERT in der Transaktion (`:1072-1077`, `'korrekturblatt'`): Scheitert er, rollt `auditTx` zurück,
       die Dokumentzeile lebt, und es gibt nichts vorzumerken. Ein Spool dort würde später eine noch referenzierte Datei
       löschen (flash F4-1). Test: Der INSERT wirft → das Spool-Verzeichnis bleibt leer, die Dokumentzeile lebt.
     - Ort: ein eigenes Verzeichnis nach dem Muster von `OFFBOARD_QUEUE_DIR` (`core/provisioning.js:63`), also
       `DATEI_LOESCHQUEUE_SPOOL_DIR` oder sonst `path.join(PDF_ROOT, '..', 'loeschqueue-spool')`.
     - Messen und im Bericht belegen, dass dieses Verzeichnis von keiner `express.static`-Route ausgeliefert wird.
     - Eine Datei je Auftrag, atomar geschrieben (temporäre Datei, `fsync`, `rename`, wie `schreibeOffboardingRest`).
       Der Name ist deterministisch aus Studio und Pfad, damit ein zweiter Fehlschlag keine zweite Datei erzeugt.
     - Inhalt: `studio_id`, `dateipfad`, `kategorie` (flash F4-2), `quelle`, Zeitpunkt, dazu die IDENTITÄT der Datei zum Zeitpunkt des
       Vormerkens: `dev`, `ino`, `size`, `mtimeMs` aus `fs.statSync` (sol 6). Ist die Datei schon weg, gibt es nichts
       vorzumerken.
   - Nachholen: `spoolNachholen()` läuft im nächtlichen Retention-Cron (`cron.schedule('30 4 * * *')`,
     `server.js:1741-1742`) VOR `fuerAlleStudios('Retention-Löschen', …)`. NICHT in der allgemeinen Hilfe
     `fuerAlleStudios` (`:1611`), die auch andere Jobs bedient (flash F3-3). Einen Boot-Aufruf gibt es nicht, aus
     demselben Grund wie beim Offboarding-Reaper (R6-11, `core/provisioning.js:53-54`; flash 4). Je Spool-Datei:
     - Prüfen: absoluter Pfad und `findeLoeschWurzel`. Ein ungültiger Eintrag bleibt liegen und wird mit eigener
       Kennung gemeldet.
     - Identität prüfen (sol 6). Ist die Datei weg, ist der Auftrag erledigt, und die Spool-Datei wird entfernt. Hat
       die Datei eine ANDERE Identität (Pfad neu belegt), wird der Auftrag verworfen: Spool-Datei entfernen und melden,
       nichts löschen, nichts einreihen. Nur bei gleicher Identität geht es weiter.
     - Lebt das Studio noch, wird der Queue-INSERT mit der gespeicherten Kategorie gemacht (`ON CONFLICT DO NOTHING`).
       Erst nach seinem Erfolg wird die Spool-Datei entfernt.
     - Existiert das Studio nicht mehr, wird nur über `darfFremdlosLoeschen` aus Punkt 1 gelöscht. Gelingt es, wird die
       Spool-Datei entfernt.
     - Endzustände (flash F4-5):
       - Eine ENDGÜLTIGE Ablehnung (referenzierter Upload, kein belegbarer Bezug, Pfad außerhalb aller Wurzeln) wird
         EINMAL gemeldet, und die Spool-Datei wird entfernt. Sonst entstünde nächtliches Dauerrauschen.
       - Nur ein vorübergehender Fehler (DB weg, `unlink` scheitert) lässt die Spool-Datei für den nächsten Lauf liegen.
   - Scheitert auch das Spool-Schreiben: Meldung mit eigener Kennung und eigenem `grund`.
   - Benannte Grenzen im Kopf von `core/datei-loeschqueue.js`; sie kommen auf die Sammelliste:
     - Das Spool-Schreiben scheitert.
     - Der Prozess stürzt VOR dem ersten dauerhaften Vormerken ab (sol 5). Das Prüfbericht-UPDATE etwa läuft vor dem
       Löschhelfer (`routes/admin/geraete.js:5193-5206`). Beide hinterlassen eine Waise ohne Auftrag.
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
     - Positivkontrolle bei gelöschtem Studio: Ein referenzierter Upload bleibt liegen. Die Spool-Datei wird entfernt,
       und es gibt genau eine Meldung.
     - Spool-Eintrag mit Kategorie `'korrekturblatt'` → wird mit dieser Kategorie eingereiht (flash F4-2).
     - Referenzprüfung wirft (DB weg) → Spool-Datei angelegt, Datei liegt (sol 4).
     - Identität: Spool anlegen, Datei löschen, unter demselben Pfad eine NEUE, UNREFERENZIERTE Datei anlegen,
       nachholen. Erwartet (sol 6, flash F3-7):
       - die neue Datei bleibt;
       - es entsteht KEIN Queue-Eintrag;
       - die Spool-Datei ist weg;
       - die Meldung trägt die eigene Kennung der Identitätsprüfung.
     - Die Tests setzen `DATEI_LOESCHQUEUE_SPOOL_DIR` auf eine Wegwerf-Wurzel, und zwar VOR dem ersten projekteigenen
       `require`, wie bei `OFFBOARDING_QUEUE_DIR` (flash F3-13).
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
     - eine GENAUE Zahl `waisenZurueckgehalten`: Die Fixtur hat eine Datei, die der gesunden Tabelle (`geraete`)
       bekannt ist, und eine unbekannte Waise. Erwartet wird genau 1 (flash F4-3);
     - die Attrappe zählt: Die `geraete`-Abfrage in Stufe 2 lief, die `seil`-Abfrage in Stufe 2 lief NICHT;
     - die Meldung ohne „waisen: fehler“.
   - Gelöscht wird weiterhin nichts. `test_feature_foto_reaper.js:249-250` und `:259-269` bleiben grün.
4. **R2-11 — ein `.enc` aus der Offboarding-Queue wird nicht gelöscht, wenn eine lebende Zeile darauf zeigt (Anmerkung).**
   - Hintergrund: Nach der Deprovisionierung gibt es die `storage_replica`-Zeilen des Studios nicht mehr. Ein Abgleich
     „gehört dem Studio“ ist dann nicht möglich. Möglich und billig ist der Abgleich „gehört keinem anderen“.
   - Behebung: Vor dem Löschen einer Replica-Referenz in `core/provisioning.js:866-882` wird geprüft, ob eine NOCH
     vorhandene Zeile in `storage_replica` (`remote_ref`) oder ein offener Auftrag in
     `storage_replica_loeschauftrag` auf genau diesen Pfad zeigt.
     - Wenn ja: nicht löschen. Gezählt wird unter einem EIGENEN Zähler und gemeldet mit eigener Kennung und eigenem Text
       („Referenz lebt, Datei bleibt“), NICHT über `uebersprungen` bzw. die Auslassungsmeldung (flash F4-4). Das ist
       anders als beim geteilten Upload in Punkt 1, weil es nach der Invariante nie vorkommen sollte.
     - Scheitert die Prüfung, wird nicht gelöscht, und der Queue-Eintrag bleibt.
     - Die L-2-Fälle (Pfad außerhalb des aktuellen Spiegel-Roots, keine lebende Zeile) werden weiter gelöscht.
   - Alle Referenzen eines Laufs gehen in EINE Abfrage je Tabelle (`remote_ref = ANY($1)`), nicht in eine Abfrage je
     Referenz. `remote_ref` hat allein keinen Index (flash F3-12).
   - Die Spaltennamen messen, nicht raten. Gemessen in der Planprüfung: `storage_replica.remote_ref` und
     `storage_replica_loeschauftrag.remote_ref` (`core/db.js:2238-2288`). Der Filter auf Aufträge darf `'vorbelegt'` und
     beanspruchte Aufträge NICHT ausschließen (sol 7).
   - Tests:
     - Ein Queue-Eintrag mit einem `.enc`-Pfad, auf den die `storage_replica`-Zeile eines lebenden Studios zeigt → die
       Datei bleibt (heute rot). Das ist ein konstruierter Verteidigungsfall: Die Namensbildung macht jede `.enc` zur
       Referenz genau einer Zeile (`core/storage-replica.js:340-344`, `:666`; flash 6). Der Bericht weist das so aus.
     - Vorbedingung: Die Datei existiert vorher (flash 13). Das Studio der Queue-Datei existiert NICHT mehr, sonst
       steigt der Reaper vorher aus (`core/provisioning.js:992-1003`; sol 7).
     - Eigene Fälle für „nur ein Löschauftrag, keine Replica-Zeile“: ein frischer `'vorbelegt'`-Auftrag und ein
       beanspruchter Auftrag (sol 7). Je Teilabfrage ein Fehlerfall: Die Abfrage wirft → es wird nicht gelöscht.
     - Den erreichten Schutzgrund (Zähler und Meldung) zusichern, nicht nur „Datei bleibt“.
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
       - Kommentare (`--` und `/* … */`) werden allgemein entfernt, nicht als Einzelfall. Roh gibt es zwei Treffer,
         beide Kommentare (`0061:67`, `0066:70`); nach dem Abzug wird 0 erwartet (flash F3-11, F4-6). Den Abzug von
         `ohneKommentare` in `test_feature_studio_fk_eigene_tabelle.js:81` wiederverwenden, wenn er passt.
       - Der Prüfer ist eine reine Funktion über eine Liste aus Name und Inhalt. Die Gegenprobe ruft sie mit einem
         eingesetzten Text auf. Es wird NIE eine Datei in `migrations/` geschrieben, auch nicht vorübergehend: Die Suite
         ist Deploy-Gate, und ein Migrationslauf könnte sie mitnehmen.
       - Eine Positivkontrolle zeigt, dass das Muster eine eingesetzte Zeile findet (flash 9).
   - Die Meldung verweist auf die benannte Grenze in 0066.
   - Gegenprobe: der Prüfer mit einem eingesetzten `ALTER COLUMN … TYPE` auf eine der drei Spalten → rot.
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
