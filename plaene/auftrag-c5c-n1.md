# Auftrag C5-C Nacharbeit 1 — Reparieren statt löschen

Stand 01.10.2026. Zweig `c5c-pdf-qr`, Kopf `8e391ab`, Arbeitsbaum `/workspace/gymdocu-c5c`. Befunde und Entscheidungen stehen in `plaene/diffpruefung-c5c.md`.

**Einordnung: sehr komplex.** Der Auftrag macht aus einem löschenden Weg einen reparierenden. Ein falsch gewähltes Kriterium kann still grün aussehen, weil dann trotzdem gelöscht oder falsch veröffentlicht wird. Deshalb baut ihn der Executer mit Modell `opus` (Übergangsregel in der CLAUDE.md).

## 0. master hereinnehmen

Vor jeder Änderung `origin/master` mergen. Das ist mindestens `9af3216` und enthält Q (#494) und E2 (#495). Danach gilt für die Konflikte:

- `test_feature_keine_stillen_fehler.js` OBERGRENZE nachmessen, nicht addieren.
- `test/run.sh` bekommt beide Listenenden.

## 1. Gemeinsamer Reparaturhelfer (C1, Kern)

Neu in `core/pdf-ablage.js`: `findeResteKandidaten(zielAbs)`. Ohne Datenbank (Blattmodul). Die Funktion liefert alle Dateien, die eine nicht veröffentlichte Kopie von `zielAbs` sein können:

- `dirname(zielAbs)/.tmp-<12 hex>-<basename>`, das ist das Schema von `tempPfadFuer`;
- `PDF_ROOT/_quarantaene/<dirname(rel)>/<ziffern>-<8 hex>-<basename>`, das ist das Schema von `quarantaenePfad`.

Das Muster ist an beiden Erzeugern gelernt und wird mit Regex streng gegen genau diese Formen gehalten. Symlinks sind keine Kandidaten (`lstat`).

Neu: `repariereAusResten(zielAbs, erwarteterHash, quelle)`.

1. Existiert `zielAbs` schon, endet die Funktion: Bei gleichem Hash liefert sie `'schon_da'`, bei anderem Hash meldet sie über `melde()` und liefert `'konflikt'`. Sie überschreibt nie.
2. Sonst wird für jeden Kandidaten der sha256 berechnet. Beim ersten mit `=== erwarteterHash` folgt `fs.linkSync(kandidat, zielAbs)`.
   - Bei EEXIST liest sie das Ziel neu: gleicher Hash ergibt `'schon_da'`, sonst `'konflikt'`.
   - Danach wird der Kandidat über `entferneDatei` entfernt. Das ist erlaubt, weil der Inhalt jetzt unter dem öffentlichen Namen steht.
   - Ergebnis `'repariert'`, dazu `melde()` mit Quelle und Pfaden.
3. Kein Kandidat passt: `'kein_kandidat'`. Kandidaten mit anderem Hash werden NICHT angefasst.
4. Die Funktion wirft nie. Ein E/A-Fehler ergibt `'fehler'` plus `melde()`.

## 2. Ernte (C1, Z1–Z3)

In `ops/gymdocu-pdf-reste-ernte.js` wird vor jedem Löschen einer `tmp`- oder `quarantaene`-Datei, die ihre Altersschwelle überschritten hat, gefragt: **Referenziert eine Registerzeile genau diesen Inhalt?**

- Abgeleitet werden Studio-ID, Ordner und öffentlicher Name. Bei `.tmp-<hex>-` und `<ziffern>-<hex>-` wird das Präfix abgeschnitten.
- Danach wird der sha256 des Kandidaten berechnet und `verify_dokumente WHERE studio_id = $1 AND dateiname = $2 AND pdf_hash = $3` abgefragt. Für Korrekturblätter zusätzlich `nachweis_korrektur_dokumente WHERE studio_id = $1 AND dateiname = $2 AND pdf_hash = $3`.
- Beide Tabellen VORHER im Schema nachsehen: Spaltennamen, Inhalt von `dateiname`, und ob `typ` zum Ordnernamen passt. Die Ableitung wird an je einem echten Erzeuger gelernt, `finalize()` und `korrektur-pdf.js`.
- **Treffer:** Liegt unter dem öffentlichen Namen keine Datei, wird repariert (Helfer aus 1). Liegt dort eine Datei mit gleichem Hash, ist der Kandidat überflüssig und wird gelöscht wie bisher. Bei einem Konflikt bleibt der Kandidat liegen, und es wird gemeldet.
- **Kein Treffer:** Gelöscht wird wie bisher.
- **Abfrage scheitert** (DB weg, Rechte): NICHTS löschen. Der Fall wird gezählt und gemeldet. Ein eigener Zähler im Ergebnis trennt ihn von „nicht geprüft“.
- Der Studio-Kontext muss stimmen: Jede Abfrage trägt `studio_id` aus dem Pfad. Einen Pfad ohne Ziffern-Studio behandelt die Ernte wie bisher.

## 3. Lesepfad (C1 Z1/Z2, C2)

`core/korrektur-pdf.js` `alsBestehend()`: Fehlt die öffentliche Datei, wird zuerst `repariereAusResten(absolute, existing.pdf_hash, 'korrektur-pdf:als_bestehend')` aufgerufen. `missing` ist nur noch wahr, wenn danach weiterhin keine Datei da ist. Damit sieht der Worker kein endgültiges `missing` mehr, solange eine passende Temp- oder Quarantänedatei existiert (C2).

`finalize()` in `core/pdf-engine.js` bekommt KEINE Reparatur im Lesepfad, nur die Ernte. Die Begründung gehört als Kommentar an die Stelle: Ein live laufendes `renameSync` auf einen schon verlinkten Namen ist laut POSIX ein No-op, die Temp-Datei bliebe dann stehen. Die Ernte erfasst nur Dateien jenseits der 24-h-Schwelle und kollidiert deshalb nicht.

## 4. Kleinere Punkte

- **C3:** Im catch von `erstelleKorrekturblattIntern` gilt: Ist `error.commitUngewiss === false`, ist der Rollback sicher. Dann wird nicht nachgemessen, die Temp-Datei wird entfernt und der Fehler weitergeworfen.
- **F3:** Wirft `renderPdf()` (eigenes Flag `gerendert`), ist nichts nachzumessen. `renderPdf` räumt über `bricheStromAb` selbst auf. Die Logzeile „Temp-Datei bleibt liegen“ darf dann nicht erscheinen.
- **C4:** Testfall `PDFTOPPM_WARTEZEIT` → 503 mit `Retry-After` in `test_feature_c5c_lageplan_pdftoppm.js`. Gegenprobe: Mutation L6 muss jetzt ROT werden.
- **C5:** Testfall „existing in der Transaktion“ mit überlappendem Start in `test_feature_c5c_korrekturblatt_ablauf.js`. Gegenprobe: K11 muss ROT werden.
- **C7:** In `test_feature_c5c_monatslauf_aktivitaet.js` laufen das FK-Aussetzen, das Einschieben der Waise, die Messung und die Wiederherstellung so, dass ein Prozesstod den FK nicht dauerhaft entfernt. Entweder alles in EINER Transaktion mit ROLLBACK, oder eine Waise, die den FK nicht braucht. Wähle und begründe.
- **C8:** Den falschen Testnamen im Kommentar (`test_feature_c5c_korrektur_veroeffentlichen.js`) korrigieren.

## 5. Tests und Gegenproben

Neue Tests gegen eine eigene DB `gymdocu_c5c_test` laufen ohne echte Dateien außerhalb eines `mkdtemp`-PDF_ROOT. Je Weg werden die Fälle mit ROT- und GRÜN-Zahlen belegt:

- Ernte: Z1-Temp wird repariert; Z3-Quarantäne wird repariert; ein Kandidat mit anderem Hash wird gelöscht wie bisher; bei gleichem Hash am Ziel wird der Kandidat gelöscht; beim Konflikt bleibt er liegen; bei einem DB-Fehler wird nichts gelöscht; ein Pfad mit fremdem Studio wird nicht über ein anderes Studio repariert.
- Lesepfad: `alsBestehend` repariert, `missing` ist `false`.
- Mutationen: Hashprüfung entfernen (dann muss „anderer Hash“ ROT werden); `studio_id` aus der Abfrage entfernen; DB-Fehler als „kein Treffer“ werten (dann muss „nichts löschen“ ROT werden); Reparatur im Lesepfad entfernen.
- Volle Suite nach dem master-Merge, Dateizahl-Ritual, Lint.

## Regeln

- Einzeltests nie gegen `gymdocu_test`. `/tmp/gymdocu-suite.lock` nie löschen. Volle Suite nur als `bash test/run.sh > /workspace/c5c-suite-n1.log 2>&1; echo "SUITE_EXIT=$?"` in einer Schleife bei Exit 99.
- Mutationsskripte nach Hausregel: Ziel als Argument, Abbruch bei ≠ 1 Treffer, Marker, `cp`-Rücknahme mit `diff` EXIT 0. Nie mit einem Testlauf verketten.
- Kein Test fasst ein echtes PDF_ROOT, echte Dienste oder `melde()`/Telegram an.
- Kein PR. Committen und pushen auf `c5c-pdf-qr`.

## Fassung 2 — verbindlich, geht §1 bis §3 vor (Planprüfung flash, 01.10.2026)

Die Planprüfung hat 8 Befunde geliefert. Ich habe sie nachgelesen, sie tragen. Daraus folgt:

1. **Umfang nur noch Korrekturblätter** (`PDF_ROOT/<sid>/Korrekturen/`).
   - Begründung: `verify_dokumente` überlebt absichtlich jede Fristlöschung (`core/pdf-loeschung.js`), und ein Name kann in einem Studio mehrere Hashes tragen (Neu erstellen). Das Kriterium „Registerzeile vorhanden“ würde dort gelöschte oder überholte Fassungen wieder veröffentlichen.
   - Bei Korrekturblättern gilt es nicht: `nachweis_korrektur_dokumente` hat `korrektur_id UNIQUE`, und die Retention löscht die Zeile per CASCADE mit (`core/retention.js` ~1006).
   - `finalize()` (Engine-Dokumente, auch `Verbandbuch`) bleibt bei „löschen wie bisher“. Ein dort im Absturzfenster liegengebliebenes Dokument wurde nie ausgeliefert und wird neu erzeugt; übrig bleibt höchstens eine verwaiste `verify_dokumente`-Zeile. Das gehört als Kommentar an `finalize()` und als Anmerkung auf `plaene/offene-befunde-c5c.md`.

2. **Kriterium:** `SELECT pdf_hash FROM nachweis_korrektur_dokumente WHERE studio_id = $1 AND dateipfad = $2`.
   - `dateipfad` ist der gespeicherte öffentliche Pfad. Das Format lernst du an `correctionPath()`/`file.publicPath`.
   - KEIN `typ`, KEIN `verify_dokumente`.

3. **Helfer mit festem Kandidaten:** `repariereAusKandidat(kandidat, zielAbs, erwarteterHash, { entfernen })`. Ergebnisse:

   | Ergebnis | Bedeutung |
   |---|---|
   | `repariert` | Link gesetzt |
   | `schon_da` | Ziel trägt denselben Hash |
   | `konflikt` | Ziel trägt einen anderen Hash |
   | `anderer_inhalt` | Kandidat-Hash ≠ erwarteter Hash |
   | `fehler` | E/A-Fehler |

   - Ein `link` mit EEXIST wird neu gelesen.
   - Wirft nie, überschreibt nie.
   - Den Kandidaten entfernt der Helfer nur mit `entfernen: true` UND bei `repariert` oder `schon_da`.
   - `findeResteKandidaten(zielAbs)` bleibt für den Lesepfad.

4. **Lesepfad `alsBestehend()`: Reparatur ohne Entfernen** (`entfernen: false`).
   - Grund: In einem anderen Prozess kann der Ersteller gerade zwischen COMMIT und `link()` stehen (Befund 3). Den Kandidaten räumt später die Ernte.
   - Dazu `veroeffentliche()` im Ersteller: Wirft `linkSync` EEXIST oder ENOENT und trägt das Ziel den Hash der Zeile, gilt das als Erfolg. Bei EEXIST wird die Temp-Datei danach entfernt. Ein Wettlauf mit dem Reparierer darf nicht in `quarantaeneNachCommit` und `missing: true` enden.

5. **Ernte, nur Kandidaten unter `<sid>/Korrekturen/` bzw. `_quarantaene/<sid>/Korrekturen/` jenseits der Altersschwelle:**
   - keine Zeile zum Pfad → löschen wie bisher;
   - Zeile da, `anderer_inhalt` → löschen wie bisher. Fehlt dabei die öffentliche Datei, zusätzlich melden;
   - `repariert` oder `schon_da` → Kandidat entfernen (`entfernen: true`);
   - `konflikt` oder `fehler` → liegen lassen, eigener Zähler, Meldung entprellt wie die übrigen. Kein Löschen, auch nicht später: Ein Korrekturblatt wird nie ersetzt, ein Konflikt ist ein Beweisstück;
   - DB-Abfrage scheitert → liegen lassen, eigener Zähler, Meldung.
   - Alle übrigen Pfade (Engine-Typen) bleiben unverändert.

6. **Tests:**
   - laufen in der Suite gegen deren DB (Muster `/_test$/`), Einzelläufe gegen `gymdocu_c5c_test`; `test/run.sh` NICHT ändern;
   - prüfen Mengen: genau welche Pfade danach existieren und welche nicht, als Literale;
   - führen einen eigenen Fall: `Verbandbuch`-Temp-Datei mit Registerzeile wird wie bisher gelöscht, NICHT repariert;
   - führen einen Wettlauf-Fall: Lesepfad repariert, danach ruft der Ersteller `veroeffentliche()` → Erfolg, kein `missing`.

§4 (C3, F3, C4, C5, C7, C8) und §0 bleiben unverändert.
