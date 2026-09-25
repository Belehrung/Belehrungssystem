# Diffprüfung C3b Stufe 2 (Replik-Upsert)

Zweig `fix-c3b-replik-upsert`, Kopf `1d9b08d` auf master `22dc613`. Auftrag `plaene/auftrag-c3b-stufe2.md` (Fassung 3).

## Runde 1 (25.09.2026)

Bau (Fable): M1–M4 vorher Fehlverhalten, nachher behoben (Bericht); Suite 394 = 394 grün (zweiter Lauf; der erste
fand eine Textkopplung der S18-Attrappe an die alte 1c-SELECT), neuer Test `test_feature_storage_replica_upsert_rennen.js`
53/0, Mutationen G1–G9 je ROT, Lint 0. Migration 0063 ohne 0062 auf master: `core/migrate.js` wendet Ausstehendes in
Namensreihenfolge an, kein Lückenwächter (Bericht).

Eigene Lesung (Diff `core/storage-replica.js` ganz gelesen): Claim erhöht `claim_nr`, alle drei Riegel lesen
`claim_nr`; alle Stellen nach dem Claim lesen `running.*`; ein Lesepuffer für Hash und Chiffrat; Hashfilter in 1c VOR
jedem UPDATE; `planeReplikationsJob` schlägt über alle drei Indexspalten nach, `requeue` setzt Priorität/Zeitpunkt des
Aufrufers (`core/pdf-jobs.js:150-166` gelesen: 0 Zeilen → `DedupeConflictError`, als verlorenes Rennen „offen“);
`requeueStale` zählt jeden Wurf als Fehler. Offene Frage an die Spuren: endloses Kreisen bei schnell wechselnder Datei
(jeder Veraltet-Wurf kostet einen Job-Versuch, der Upsert belebt).
Spuren (unwiderruflich → drei; Kimi ohne Guthaben, deshalb zweite DeepSeek-Spur mit anderem Bündel): Claude
ausführend (`gymdocu-c3b-cc`, `scratchpad/c3bcc/`), DeepSeek mit Repo-Lesezugriff (Diff), DeepSeek-Einzelaufruf
(Endstand storage-replica, pdf-jobs, Worker, neuer Test).

| Nr | Quelle | Befund | Nachmessung | Schwere | Behebung |
|---|---|---|---|---|---|
| C3b-1 | CC B1 | „offen“ heisst nicht „kommt wieder“: Upsert nach dem 1c-COMMIT, vor `queue.succeed` → Job `succeeded`, Zeile `pending/H2` ohne Job, Health ok (unsichtbar), Heilung erst nach Stillstand beim täglichen Reaper; ebenso Upsert zwischen `dead`-Riegel und `deadLetter` | CC gemessen (R1, R1b, mit Positivkontrolle) | mittel | nach 1c/1d Hash nachlesen → nicht-permanenter Wurf; im permanenten Zweig auch bei getroffenem Riegel nachlesen; Reaper stündlich; Kommentare |
| C3b-2 | CC B2 | Ein-Puffer-Wache zählt nur `fsP.readFile`: die Vor-C3b-Form (`dateiHash` + zweites Lesen) und ein Chiffrat aus `fs.readFileSync` bleiben in allen vier Testdateien grün und erzeugen `succeeded/H1` mit Fernkopie H2 | CC gemessen (C1b, C2, R9) | mittel | alle Lese-Schnittstellen zählen, Summe 1; Variante mit Tausch vor dem ersten Lesen |
| C3b-3 | CC B3, DS 1, DSB 1/2 | `planeReplikationsJob`: jede `DedupeConflictError` aus `requeue` gilt ohne Nachlesen als „offen“ (gelöschter Job → still); Verlierer-Rennen, Konflikt ohne Zeile und DB-Fehler im `requeue` ungetestet | CC gemessen (R4a–c, C3/C4), DS gelesen (`core/pdf-jobs.js:164`) | gering-mittel | nach dem Wurf nachlesen: offen → offen, fehlt → laut; Tests R4a/R4b, DB-Fehler im requeue |
| C3b-4 | CC B4 | `TerminalDedupeError`-Zweig ungetestet (nur mit identischem `runAfter` erreichbar) | CC gemessen (C5) | gering | Test mit festem `runAfter` |
| C3b-5 | CC B5 | Texte: S26 nennt noch `attempts`-Riegel; Veraltet-Log verspricht beim 5. Versuch „nächster Lauf“; „bis zu fünf Job-Versuche“ gemessen 2 | CC gemessen (R2, R7) | gering | berichtigen |
| C3b-6 | CC B6 | `ALTER … ADD COLUMN IF NOT EXISTS` im Schema-Block nimmt bei jedem Start einen AccessExclusiveLock | CC gemessen (R6) | gering | → offener Punkt DB-INIT (Arbeitsplan) |
| — | DSB 3 | globale Reaper-/Warteschlangen-Abfragen ohne `studio_id` | vorbestehend und begründet (systemweite Warteschlange, Mandant je Zeile) | gefallen | — |

Zahlen: CC 6, DS 1, DSB 3; 6 Zeilen, einer gefallen. Nur CC: C3b-1, C3b-2 (die beiden mittleren), C3b-4..6. Alle drei:
C3b-3. Zustandsfrage (CC, 7.440 Verschränkungen über die echten Wege, Positivkontrolle 66/140 bzw. 278/560 mit
ausgeschaltetem Hashfilter): kein `succeeded` mit falschem Inhalt, keine richtige Fernkopie gelöscht, kein endloses
Kreisen (Lauf 5 → `dead`, nächster Upload belebt). Nacharbeit 1: `plaene/auftrag-c3b-nacharbeit1.md`.

## Runde 2 (Nacharbeit 1, `9ef94f1`)

Gegenstand: Diff `1d9b08d..9ef94f1` (7 Dateien, +420/−63). Spuren: Claude (ausführend, Baum `gymdocu-c3b-cc`, eigene
DB) und DeepSeek mit Repo-Lesezugriff (Baum `gymdocu-c3b-pruef`), Material der Diff der Nacharbeit. Zweite Runde, weil
die Behebung Verhalten ändert: der permanente Fehlerweg entscheidet jetzt über den STATUS der Zeile (permanent nur bei
fehlender oder `dead`-Zeile) — eine Entscheidung des Ausführenden über den Auftragswortlaut hinaus, begründet mit dem
Planungs-Fuzz r3 (vorher 15 Pläne mit totem Job neben gesunder Zeile, nachher 0). Benannte Grenze des Ausführenden:
Restfenster [Nachlesen … `queue.succeed`] nur über den jetzt stündlichen Reaper gedeckt.
