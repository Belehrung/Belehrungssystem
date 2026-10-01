# Auftrag C6-E — Offline-Warteschlange: Zuordnung, Zwischenseiten, Merker, Texte (Extrarunde C6)

Fassung 2, 01.10.2026. Planprüfung flash mit 13 Befunden (`scratchpad/c6plan/flash-c6e.txt`). Selbst nachgemessen
und getragen sind 1 (`public/offline-queue.js:839-843` zählt nur gegen den Foto-Deckel, kein Konflikt) und 7
(`test_feature_seil_tablet_ux.js:84-88` verlangt zweimal die exakte Form `.catch(function () { fertig(); formFehler`).
Die übrigen sind eingearbeitet. Repo GymDocu, Stand master `9dfe522` (oder neuer).

**Herkunft und Einzelheiten:** `/home/user/Belehrungssystem/plaene/c6-zustand-01-10/z2.md` (absoluter Pfad, liegt NICHT im
GymDocu-Baum), Abschnitte R2-4, R3-8, R4-3, R4-9, N4-H1 und N4-H2. Jeder
Abschnitt nennt Beleg, Zustand, Behebung, Risiko und Test. Lies sie vollständig. Sie sind FUNDORTE: zuerst neu messen.
Widerspricht der Code, abbrechen und melden.

**Modell.** Standard-Executer. Clientseitiges JS mit bestehendem Verhaltens-Harness
(`test_feature_offline_queue_verhalten.js`, Chromium) plus eine kleine Migration.

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6e`, Zweig `c6e-offline` ab `origin/master`, Einzeltests nur gegen
`gymdocu_c6e_test`. Suite und Gegenproben wie üblich. Neue Chromium-Testdateien kommen in die ausdrückliche Liste in
`eslint.config.js`.

**Grundsatz der Offline-Warteschlange (nicht verletzen):**
- Eine gültige Prüfung wird nie in eine Sackgasse geschoben.
- Es gibt keinen NEUEN Kettenstopp wegen eines Zähler- oder Speicherausfalls (R4-2-Lehre). Die bestehenden,
  gewollten Stopps (auth, abgelehnte Herkunft, vorübergehend; `:768-782`) bleiben.
- Nichts, was die letzte Kopie einer Eingabe zerstören könnte, wird empfohlen, ohne den Zielkonflikt zu nennen.

## Entscheidungen je Punkt

1. **R2-4 — Replay-Zuordnung über die Menge der Formularindizes (sollte).**
   - Migration nach dem Muster der bestehenden: `ALTER TABLE geraete_defekte ADD COLUMN IF NOT EXISTS formular_idx
     INTEGER`, dazu dieselbe Spalte im Schema in `core/db.js`.
   - Beim INSERT (`routes/sichtpruefung.js:2681-2688`) wird `d.idx` mitgeschrieben.
   - Die Replay-Abfrage (`SELECT id FROM geraete_defekte … ORDER BY id`) liest `formular_idx` mit.
   - Tragen ALLE gespeicherten Zeilen der Sitzung `formular_idx`: Die Menge der Indizes wird mit der Menge aus dem
     Body verglichen. Nur bei Gleichheit gibt es Paare `{idx, id}` (über den gespeicherten Index, nicht über die
     Position), sonst kein `idx`.
   - Tragen sie KEINEN (Altzeilen vor dem Deploy): Es gilt unverändert die heutige Anzahl-Regel. Sonst verlöre ein
     noch in der Queue liegender Fotorest seine Zuordnung (flash 3).
   - Die Migrationsnummer ist die nächste freie zur Bauzeit. Parallel bauen C6-A1/A2/D1 eigene Migrationen; beim
     Merge wird bei einer Kollision umnummeriert.
   - Die Datei kommt in die Prüfsummenliste `ERWARTET`. Hand-Sollzahlen der betroffenen Tests ziehst du nach.
   - Test in `test_feature_defekt_ids_formularindex.js`: ein Replay mit Indizes 3,4 statt 1,2 liefert kein `idx`. Die
   bestehende A4 bleibt grün.
2. **R3-8 — Zwischenseite (Captive Portal) sichtbar, ohne zu zählen (sollte).**
   - `antwortLesen` kennzeichnet ein Nicht-JSON bei Status 200 ZUSÄTZLICH mit `zwischenseite: true`.
     `voruebergehend: true` BLEIBT, damit beide Aufrufer (Sitzung `:782`, Fotos `:390`/`:827`) weiter nicht zählen
     (flash 5).
   - Ein Seitenzustand wie `herkunftFehler` merkt sich die Zwischenseite. Das Badge zeigt dann einen eigenen Hinweis
     nach dem Muster `herkunftHinweisHtml`: „Der Server antwortet mit einer anderen Seite (Anmeldeportal?) — bitte die
     Netzwerk-Anmeldung abschließen.“ Bei der nächsten echten App-Antwort wird er zurückgesetzt, wie `herkunftFehler`.
   - Test, für Sitzung UND Fotos: Ein Stub liefert 200 mit `text/html`.
     - Der Hinweis erscheint (positiv).
     - `versuche` und `foto_versuche` bleiben 0.
     - Es entsteht kein Konflikt.
3. **R4-3 — Merker `sitzung_ok` und Zählung (Anmerkung).**
   - Laut Planprüfung (flash 6) liest jeder Sync die Queue neu (`qAlle`, `:748`). Ein gescheitertes Schreiben des
     Merkers wird im nächsten Sync also ohnehin wiederholt; der in Fassung 1 geforderte Test wäre schon heute grün.
   - ZUERST das eigentliche Szenario messen:
     - Das Schreiben des Merkers scheitert, die Seite wird neu geladen, danach antworten die Fotos zehnmal mit 500.
     - Entsteht dabei ein `wiederholt`-Konflikt MIT Nachtrageliste, obwohl der Replay die Sitzung im selben Sync
       bestätigt hat?
   - Wenn ja: Fotofehler zählen gegen den Foto-Deckel, sobald die Sitzung IM SELBEN Sync bestätigt wurde (Kenntnis
     im Speicher), unabhängig vom persistierten Merker. Dazu der Hinweis „Prüfung ist gespeichert, der Merker nicht —
     bitte Speicher freimachen“. Test über genau dieses Szenario.
   - Wenn nein: keinen Code ändern. Das Messergebnis mit Zahlen in den Bericht; der Punkt gilt dann als
     gegenstandslos.
4. **R4-9 — Widerspruch zwischen Merker und Server sichtbar machen statt Nachtrageliste (sollte).**
   - Hintergrund (flash 10): Bei `sitzung_ok` kehrt der Replay-Zweig vor jeder Ablehnung zurück, SOFERN die Sitzung
     mit dieser `client_uuid` existiert (`routes/sichtpruefung.js:2435-2460`). Ein `bereits_geprueft` oder
     `validierung` bei gesetztem Merker heißt also: Dieser Server kennt die Sitzung NICHT, etwa nach einem
     Studio-/Hostwechsel oder einer Löschung. Der Merker ist für diesen Server nicht belegbar.
   - Behebung: In den Zweigen `bereits_geprueft` und `validierung` (`public/offline-queue.js:831-834`) wird bei
     `e.sitzung_ok` ein Konflikt mit EIGENER Art `merker_widerspruch` gesetzt, mit diesem Text: „Diese Prüfung wurde
     bereits übertragen, der Server findet sie aber nicht mehr. Bitte mit der Leitung klären, ob sie im Protokoll
     steht — NICHT doppelt erfassen.“
   - Die erfassten Defekte erscheinen nur als Referenz („zur Klärung“), NICHT als „bitte manuell nachtragen“.
   - Kein „Erneut versuchen“, denn der Versuch scheitert gleich wieder. „Verwerfen“ warnt weiterhin.
   - Tests:
     - POSITIV: Seed `{sitzung_ok: true, …}` (Muster `window.__seed`, `test_feature_offline_queue_verhalten.js:624-692`),
       409 `bereits_geprueft`. Danach enthält das Badge den neuen Text, die Referenzliste und den Verwerfen-Knopf,
       und es enthält NICHT „manuell nachtragen“.
     - Verhaltenszusicherung für den Zweig OHNE Merker (bisher nur geseedet, nie per Sync gefahren): Dort bleibt
       die bisherige Nachtrageliste.
5. **N4-H1 — CSRF-403 bei Speicherausfall (sollte).**
   - Im catch (`:722-726`) wird `herkunftAbgelehnt` ausgewertet und `herkunftFehler` gesetzt.
   - In diesem Zustand hält das Formular die Eingaben noch; gescheitert ist nur der Zwischenspeicher. Der Text sagt
     deshalb (flash 8): „Nicht gespeichert: Die Herkunftsprüfung hat abgelehnt und der Zwischenspeicher ist voll oder
     gesperrt. Bitte zuerst Speicher freimachen und ERNEUT speichern, erst danach die Seite neu laden. Neuladen allein
     verwirft diese Eingaben.“
   - Ohne Herkunftsablehnung bleibt der bisherige Text („Nicht gespeichert. Bitte Verbindung …“) unverändert.
   - `test_feature_seil_tablet_ux.js:84-88` verlangt zweimal die exakte Form
     `.catch(function () { fertig(); formFehler`. Die Auswertung so einbauen, dass diese Form erhalten bleibt, etwa
     indem `formFehler` den Text über einen Ausdruck wählt. Sonst den Wächter fachlich nachziehen, mit Gegenprobe.
   - Test: CSRF-403 plus erzwungener IDB-Schreibfehler. Der Text nennt „erneut speichern“ und „Neuladen allein
     verwirft“. Positivkontrolle: Ohne 403 kommt der alte Text.
6. **N4-H2 — Gelb und Grün widersprechen sich nicht (sollte).**
   - Der gelbe Kasten hängt an `herkunftFehler`. Ist es gesetzt, heißt es „wird nach dem Neuladen der Seite
     automatisch übertragen“, sonst bleibt der Text unverändert.
   - Test: Solange `herkunftFehler` gesetzt ist, steht der NEUE Satz im gelben Kasten (positiv), und kein sichtbarer
     Kasten enthält „sobald Verbindung besteht“.
   - Positivkontrolle: Ohne Herkunftsfehler steht der alte Text da.

## Bericht

- Je Punkt: die neue Messung der Fundstelle, der Diff, die Gegenproben wörtlich.
- Die volle Suite mit `diff` EXIT 0.
- Lint.
- Screenshots (Tablet-Breite 820 px) der neuen Badge-Texte (R3-8, R4-9, N4-H2) sind Pflicht.
- Für N4-H1 (`formFehler` → im Harness `alert`) gibt es einen sichtbaren Inline-Kasten über eine
  `gdFormFehler`-Attrappe. Geht das nicht, wird im Bericht begründet, warum der Screenshot fehlt.
