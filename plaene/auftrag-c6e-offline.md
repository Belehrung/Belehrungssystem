# Auftrag C6-E — Offline-Warteschlange: Zuordnung, Zwischenseiten, Merker, Texte (Extrarunde C6)

Fassung 1, 01.10.2026. Repo GymDocu, Stand master `9dfe522` (oder neuer).

**Herkunft und Einzelheiten:** `plaene/c6-zustand-01-10/z2.md`, Abschnitte R2-4, R3-8, R4-3, R4-9, N4-H1 und N4-H2. Jeder
Abschnitt nennt Beleg, Zustand, Behebung, Risiko und Test. Lies sie vollständig. Sie sind FUNDORTE: zuerst neu messen.
Widerspricht der Code, abbrechen und melden.

**Modell.** Standard-Executer. Clientseitiges JS mit bestehendem Verhaltens-Harness
(`test_feature_offline_queue_verhalten.js`, Chromium) plus eine kleine Migration.

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6e`, Zweig `c6e-offline` ab `origin/master`, Einzeltests nur gegen
`gymdocu_c6e_test`. Suite und Gegenproben wie üblich. Neue Chromium-Testdateien kommen in die ausdrückliche Liste in
`eslint.config.js`.

**Grundsatz der Offline-Warteschlange (nicht verletzen):**
- Eine gültige Prüfung wird nie in eine Sackgasse geschoben.
- Es gibt keinen Kettenstopp, der andere Einträge blockiert (R4-2-Lehre).
- Nichts, was die letzte Kopie einer Eingabe zerstören könnte, wird empfohlen, ohne den Zielkonflikt zu nennen.

## Entscheidungen je Punkt

1. **R2-4 — Replay-Zuordnung über die Menge der Formularindizes (sollte).**
   - Migration nach dem Muster der bestehenden: `ALTER TABLE geraete_defekte ADD COLUMN IF NOT EXISTS formular_idx
     INTEGER`, dazu dieselbe Spalte im Schema in `core/db.js`.
   - Beim INSERT (`routes/sichtpruefung.js:2681-2688`) wird `d.idx` mitgeschrieben.
   - Der Replay vergleicht die MENGE der Indizes mit der gespeicherten Menge. Nur bei Gleichheit gibt es Paare
     `{idx, id}`, sonst kein `idx`. Altzeilen ohne `formular_idx` verhalten sich wie heute (ohne `idx`).
   - Test in `test_feature_defekt_ids_formularindex.js`: ein Replay mit Indizes 3,4 statt 1,2 liefert kein `idx`. Die
   bestehende A4 bleibt grün.
2. **R3-8 — Zwischenseite (Captive Portal) sichtbar, ohne zu zählen (sollte).**
   - `antwortLesen` kennzeichnet ein Nicht-JSON bei Status 200 als `zwischenseite: true`.
   - Das Badge zeigt einen eigenen Hinweis nach dem Muster `herkunftHinweisHtml`: „Der Server antwortet mit einer
     anderen Seite (Anmeldeportal?) — bitte die Netzwerk-Anmeldung abschließen.“
   - Weiter KEIN Zählen, KEIN Konflikt.
   - Test: Stub liefert 200 mit `text/html`. Der Hinweis erscheint, und `versuche` bleibt 0.
3. **R4-3 — Merker `sitzung_ok` wird dauerhaft geschrieben (Anmerkung).**
   - Das Ergebnis von `qPutSicher` wird ausgewertet. Bei Fehlschlag wird beim nächsten Sync erneut geschrieben; die
     Abkürzung gilt erst nach einem ERFOLGREICHEN Schreiben.
   - Dazu ein eigener Hinweis: „Prüfung ist gespeichert, der Merker nicht — bitte Speicher freimachen und die Seite
     nicht neu laden.“
   - Test: Das Schreiben scheitert einmal; ein zweiter Sync ohne Neuladen schreibt `sitzung_ok` dauerhaft.
4. **R4-9 — Übernommene Sitzung zeigt keine Nachtrageliste (sollte).**
   - In den Zweigen `bereits_geprueft` und `validierung` (`public/offline-queue.js:831-834`) wird bei `e.sitzung_ok` so
     behandelt wie im übrigen Pfad (`:839-843`): Konflikt mit Art „fotos“ bzw. dem Text „Prüfung ist auf dem Server
     gespeichert — offen ist nur der Rest“.
   - Keine Nachtrageliste. „Erneut versuchen“ wird angeboten, „Verwerfen“ warnt weiterhin.
   - Test mit Seed `{sitzung_ok: true, …}` und 409 `bereits_geprueft`: Das Badge enthält NICHT „manuell nachtragen“.
5. **N4-H1 — CSRF-403 bei Speicherausfall (sollte).**
   - Im catch (`:722-726`) wird `herkunftAbgelehnt` ausgewertet und `herkunftFehler` gesetzt.
   - Neuer Text: „Die Herkunftsprüfung hat abgelehnt — helfen kann nur Neuladen. ACHTUNG: Diese Eingaben sind NICHT
     zwischengespeichert und gehen beim Neuladen verloren; bitte vorher notieren.“
   - Test: CSRF-403 plus erzwungener IDB-Schreibfehler. Der Text nennt Neuladen UND die Warnung.
6. **N4-H2 — Gelb und Grün widersprechen sich nicht (sollte).**
   - Der gelbe Kasten hängt an `herkunftFehler`. Ist es gesetzt, heißt es „wird nach dem Neuladen der Seite
     automatisch übertragen“, sonst bleibt der Text unverändert.
   - Test: Solange `herkunftFehler` gesetzt ist, enthält kein sichtbarer Kasten „sobald Verbindung besteht“.
   - Positivkontrolle: Ohne Herkunftsfehler steht der alte Text da.

## Bericht

- Je Punkt: die neue Messung der Fundstelle, der Diff, die Gegenproben wörtlich.
- Die volle Suite mit `diff` EXIT 0.
- Lint.
- Screenshots der drei neuen Hinweistexte (Tablet-Breite 820 px) sind Pflicht, weil sich die Oberfläche ändert.
