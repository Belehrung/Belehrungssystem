# Auftrag: sporadischer Fehlschlag in `test_feature_qr_journal.js` (C6D2-1), 02.10.2026

Einordnung: nicht sehr komplex, also baut der Standard-Executer. Es geht um zwei Testdateien und keinen Produktivcode.

## Befund (gemessen)

- In der vollen Suite fällt am Ende von `test_feature_qr_journal.js` die Zusicherung „Aufräumen: keine qr_charge-Zeile im Band der Nacharbeiten … übrig“ sporadisch, beide Male mit genau **9** Zeilen.
  - Fundstellen: `/workspace/c6d2-suite-lauf3.log` und `/workspace/c6h2-suite-n2-lauf1.log`.
  - Heute 2 Fälle in rund 99 Logs, die diesen Test enthalten. Einzeln ist er grün.
- Die Zusicherung (`test_feature_qr_journal.js`, am Dateiende, `restH`) zählt `qr_charge`-Zeilen **aller Studios** in festen Nummernbändern. Darunter sind 500000–500999, 601000–601999 und 900000–950999.
- `test_feature_qr_beanspruchen_sperrreihenfolge.js` läuft in `test/run.sh` VOR dem Journal-Test. Er zieht je Prozess ein Zufallsband `150000 + crypto.randomInt(0, 9_700_000)` der Breite 300 (`waehleBand`).
  - Darin legt er mit `chargeManuellReihenfolge` und `einzelToken` genau **9** `qr_charge`-Zeilen an, alle mit `studio_id = NULL`.
  - Er räumt sie NICHT ab: In der Datei gibt es kein `DELETE FROM qr_charge` und kein `DELETE FROM qr_token`.
  - Trifft das Zufallsband eines der restH-Bänder (rechnerisch etwa 0,55 % je Lauf), zählt der Journal-Test genau diese 9.
- Damit ist die Hypothese belegt, aber nicht bewiesen: Die Ausgabe des Sperrreihenfolge-Tests (sein Band) steht im Suite-Log nicht, weil er grün war.

## Was zu bauen ist

1. **`test_feature_qr_beanspruchen_sperrreihenfolge.js` räumt seine Zeilen ab.**
   - Alle angelegten Charge-IDs sammeln (`chargeManuellReihenfolge` liefert `chargeId`; `einzelToken` muss sie zusätzlich liefern oder sammeln).
   - Am Ende `DELETE FROM qr_token WHERE charge_id = ANY($1)` und `DELETE FROM qr_charge WHERE id = ANY($1)`, nach dem Muster in `test_feature_qr_lage_blocklokal.js` (Aufräumen am Ende).
   - Das Aufräumen läuft auch, wenn eine Zusicherung fällt, aber nicht, wenn der Prozess hart abbricht. Benenne das.
   - Danach eine Zusicherung: Im eigenen Band [BASIS, BASIS+300] ist keine `qr_charge`-Zeile mit der eigenen `notiz` übrig. Der Sollwert 0 steht als Literal.
   - Vorher prüfen: Sperrt eine `qr_token`-Zeile das Löschen (FK, Verweise aus `geraete`/`qr_zuordnung` o. ä.)? Dann in der richtigen Reihenfolge löschen und die Reihenfolge begründen.
2. **`test_feature_qr_journal.js`: Die `restH`-Zusicherung bekommt den eigenen Bezug.**
   - Gezählt werden nur Zeilen der eigenen Studios (`studio_id = ANY(angelegteStudioIds)`) ODER Zeilen mit `studio_id IS NULL`, deren `notiz` von DIESER Datei stammt.
   - Prüfe zuerst, ob die Datei überhaupt Chargen ohne Studio anlegt (z. B. über `tools/qr-journal.js` oder `chargeAnlegen`). Wenn nicht, genügt der Studio-Bezug; begründe das mit der Suche und einer Positivkontrolle der Suche.
   - Die Bänder und der Sollwert 0 bleiben UNVERÄNDERT. Eine Toleranz (`<= 9`), gestrichene Bänder oder eine globale Ausnahme für fremde Zeilen sind nicht erlaubt.
   - Dasselbe gilt für die Zusicherung zum Band 101000–104999 (`rest`), falls sie dieselbe Schwäche hat.
   - **Diagnose:** Fällt eine der beiden Zusicherungen, gibt sie die übrig gebliebenen Zeilen aus (id, studio_id, nr_von, nr_bis, notiz; höchstens 20).
3. Die Kommentare am Aufräumblock berichtigen: „F2 nutzt ein bestehendes Studio F“ stimmt nicht mehr, die Fixtur legt O/F/W/Z selbst an. Miss das nach, bevor du es änderst.

## Gegenproben (Pflicht, je ROT und GRÜN wörtlich)

- In `test_feature_qr_beanspruchen_sperrreihenfolge.js` das Aufräumen entfernen → die neue End-Zusicherung wird rot.
- Den Fehler herstellen:
  - eine eigene Wegwerf-DB (`gymdocu_qrjf_test`);
  - darin von Hand 9 `qr_charge`-Zeilen mit `studio_id NULL` und einer FREMDEN `notiz` im Band 900000–900300 anlegen;
  - dann `test_feature_qr_journal.js` auf derselben DB laufen lassen.
  - Ergebnis: grün, weil die Zeilen fremd sind.
- Positivkontrolle für die geschärfte Zusicherung: In `test_feature_qr_journal.js` das `DELETE FROM qr_charge WHERE studio_id = ANY(...)` entfernen → `restH` wird rot (eigene Zeilen übrig), und die Diagnose nennt sie.
- Jede Mutation: Fundstellen zählen (≠ 1 → Abbruch), Marker `GEGENPROBE-` + `DEFEKT`, Rücknahme aus einer Kopie mit diff 0.

## Rahmen

- Arbeitsbaum: neuer `git worktree` unter `/workspace/gymdocu-qrjf`, Zweig `qrj-flake` ab `origin/master` (aus `/home/user/gymdocu`).
- Einzeltests nur auf eigener DB (`gymdocu_qrjf_test`), nie auf `gymdocu_test`.
- Danach die volle Suite: `bash test/run.sh > /workspace/qrjf-suite.log 2>&1; echo "SUITE_EXIT=$?"`. Die Sperrdatei nie löschen, kein äusseres flock; eine fremde Suite kann die Sperre halten.
- Dateizahl-Ritual (beide Seiten ohne Muster, `diff` EXIT 0), Lint, Marker-Scan mit `--exclude-dir`.
- Commit und Push, kein PR. Keine Modellnamen in Commits.

## Bericht

Je Punkt Diff-Kern und Gegenprobe wörtlich; SUITE_EXIT, Dateizahl, Lint; die Antwort auf die Frage „legt der Journal-Test Chargen ohne Studio an?“ mit Beleg.

-- Ende des Auftrags --
