# Auftrag C6-F — Tests: Wettlauf, Einzelläufe, Arbeitsverzeichnis, Werkzeug (Extrarunde C6)

Fassung 1, 01.10.2026. Repo GymDocu, Stand master `9dfe522`.

**Herkunft:** `plaene/c6-zustand-01-10/z1.md` (CI-Wettlauf), `z3.md` (G1-g), `z4.md` (alle übrigen). Jede Fundstelle
ist neu zu messen. Widerspricht der Code dem Auftrag, wird abgebrochen und gemeldet.

**Modell.** Standard-Executer. Viele gleichartige Handgriffe, eine kleine Produktivänderung (Punkt 2).

**Arbeitsbaum und Datenbank.**
- `/workspace/gymdocu-c6f`, Zweig `c6f-tests` ab `origin/master`.
- Einzeltests NUR gegen `gymdocu_c6f_test`, nie gegen `gymdocu_test`.
- Volle Suite als `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. Die Sperrdatei nie anfassen, kein äußeres
  `flock`.

**Grundsätze.**
- Jede neue Zusicherung bekommt eine Gegenprobe mit ROT/GRÜN wörtlich im Bericht.
- Sollwerte von außen.
- Ein Wächter über Quelltext entfernt Kommentarzeilen und hat eine Positivkontrolle, dass danach noch etwas übrig ist.
- Gegenproben-Skripte nehmen den Zielpfad als Argument, brechen bei ≠ 1 Treffer ab und werden nie mit einem
  Testlauf verkettet.

## Punkte

### 1. CI-Wettlauf in `test_feature_csp_crawler.js` (blockierend)

- Um `:960` folgt `tabletPage.goto(...)` direkt auf einen POST, nach dem die Seite selbst per
  `window.location.href` navigiert. In der CI liefert `goto` dann `null`, und `navResp.status()` wirft (rot auf
  C5-C, ein Neustart war grün).
- Behebung: Vor dem `goto` den Abschluss der selbst ausgelösten Navigation abwarten (`waitForURL` auf das bekannte
  Ziel oder `waitForLoadState('load')`).
- Liefert `goto` trotzdem `null`, gilt das genau EINMAL als Wettlauf: neu laden, dann Status 200 zusichern. Jeder
  andere Fehlschlag bleibt ein Fehler.
- Dieselbe Bauart (POST mit Selbstnavigation, direkt danach `goto` oder `status()` auf einer möglicherweise `null`
  gelieferten Antwort) suchst du in allen Playwright-Tests und behebst jede Fundstelle gleich. Liste in den Bericht.
- Gegenprobe:
  - Den Wettlauf erzwingen: Die Seite navigiert nach dem POST sofort selbst, und der alte Testcode läuft ohne
    Warten. Er muss ROT werden (TypeError oder `null`).
  - Mit der Behebung GRÜN.
  - Ein echter Fehlstatus (z. B. 500 auf `/belehrungen/tablet`) bleibt ROT, auch mit dem Wiederholversuch.

### 2. T1-K4 — Laden von `routes/belehrungen.js` legt kein Verzeichnis an

- `routes/belehrungen.js:1218-1219` legt beim Modulladen `EINWEISUNG_NACHWEIS_DIR` an. Ohne `test/umgebung.sh` ist
  das `<repo>/einweisung-nachweise/`.
- Behebung: `mkdirSync` in den Schreibweg verlegen (lazy, unmittelbar vor dem ersten Schreiben, `recursive: true`).
  Muster `core/pruefbericht.js`.
- Prüfen, ob dieselbe Bauart (`mkdirSync` beim Modulladen mit einem Repo-Pfad als Rückfall) in weiteren `routes/`-
  oder `core/`-Dateien steht. Jede Fundstelle gleich behandeln und in den Bericht.
- Test: Kindprozess `node -e "require('./routes/belehrungen')"` mit `EINWEISUNG_NACHWEIS_DIR=<tmp>/nicht-da`, ohne
  `umgebung.sh` (Kindumgebung von Hand gebaut). Danach existiert `<tmp>/nicht-da` nicht. Heute ROT.
- Positivkontrolle: Ein Upload über den echten Weg legt das Verzeichnis an.

### 3. c5e#2 — Tests lesen unabhängig vom Arbeitsverzeichnis

- Rund 121 Stellen in `test*.js` lesen relativ zum Arbeitsverzeichnis (`readFileSync("routes/...")`,
  `"./routes/..."`).
- Behebung: Alle auf `path.join(__dirname, …)` umstellen, JE STELLE mit dem richtigen Bezugspunkt. Testdateien in
  `test/` liegen eine Ebene tiefer als die im Wurzelverzeichnis.
- Neuer statischer Wächter `test_feature_tests_cwd_unabhaengig.js`:
  - Kein `readFileSync`/`existsSync`/`readdirSync` mit einem relativen Literal (beginnt nicht mit `/` und ist kein
    `path.join(__dirname…)`) in Testdateien.
  - Ausnahmeliste leer.
  - Die Menge der gescannten Dateien hält er gegen `git ls-files 'test*.js' 'test/**/*.js'`, die Referenz kommt von
    außen.
  - Gegenprobe: eine Stelle zurückdrehen → ROT, an genau dieser Datei.
- Zusätzlich messen: Drei Stichproben-Dateien laufen mit `cwd=/tmp` grün. Vorher waren sie ROT, zum Beispiel
  `test_feature_audit2_batchA_static.js`.
- `test/run.sh` macht `cd "$REPO"`. Die Suite ist also nicht betroffen, wohl aber jeder Einzellauf.

### 4. E3-b, E3-e und G1-g — keine Bindung an den Namen `gymdocu_test`

- Diese Dateien brechen bei einer eigenen `…_test`-DB ab oder melden falsch rot:
  - `test_feature_audit_batch3.js:26`, `test_feature_bodyparser_und_sequenz.js:397`;
  - `test_feature_qr_charge.js:710` (Zusicherung auf den Namen);
  - `test_feature_deprovision_route_queue.js:35`, `test_feature_schluessel_rotation.js:17`,
    `test_feature_migrations.js:17-18`, `test_feature_db_tx_commit_ungewiss.js:29`, `test_feature_db_pool_timeout.js:41`;
  - `test_feature_pdf_jobs.js:8,15`, `test_feature_pdf_jobs_korrektur.js:21-26`, `test_feature_storage_replica.js:14,26`,
    `test_feature_storage_replica_loeschauftrag.js:59-60`;
  - `test_feature_migration_0060_loeschauftrag.js:33`, `test_feature_korrekturen.js:32-33`,
    `test_feature_korrektur_dokumente.js:86-87`, `test_feature_getraenke_race.js:82-83`,
    `test_feature_pdf_crlf_saeuberung.js:379-380`.
- Behebung: Der Riegel wird generisch nach dem Muster `core/db.js:330` (Name endet auf `_test` oder `_e2e`, Wortende
  beibehalten). Vorbild ist `test_feature_storage_replica_upsert_rennen.js:62-66`.
- Bei `qr_charge:710` sichert die Zusicherung den TATSÄCHLICHEN DB-Namen aus der `DATABASE_URL` zu, nicht das
  Literal.
- Vollständigkeit per `grep -rn "gymdocu_test" --include='test*.js' .` herstellen, nicht nur aus dieser Liste. Die
  Liste ist ein Hinweis.
  - Bleiben Fundstellen, die bewusst `gymdocu_test` brauchen (z. B. weil `test/run.sh` sie so anlegt), dann je eine
    Begründung im Bericht.
- Neuer statischer Wächter (oder Erweiterung eines bestehenden):
  - Kein Test verweigert eine DB nur wegen des Namens `gymdocu_test`.
  - Gegenprobe: einen alten Riegel zurück → ROT.
- Messung: Fünf der umgestellten Dateien laufen gegen `gymdocu_c6f_test` grün. Vorher Abbruch bzw. FAIL.

### 5. E3-a und V12-5 — `test/e2e-durchlauf.js` wieder in Betrieb

- Die Datei steht nicht in `test/run.sh`. Ihr Zustand heute ist unbekannt (früher 17 ✓ / 5 ✗, dann TypeError).
- Zuerst gegen `gymdocu_c6f_test` laufen lassen und das Ergebnis wörtlich berichten.
- Rote Stellen beheben, wenn die Ursache im Test liegt (veraltete Erwartung). Liegt sie im Produktivcode: NICHT
  beheben, sondern abbrechen und melden.
- Ist der Lauf grün und dauert unter 120 s, wird er in `test/run.sh` registriert. Er bekommt dieselbe Umgebung wie
  die übrigen Kindprozess-Tests und die Netzsperre bleibt; dafür die Mechanik der Nachbarn nachmessen.
- Sonst bekommt er in `test/run.sh` einen dokumentierten Ausschluss mit Begründung (Laufzeit in Sekunden).
- Ein Wächter „`run.sh` nennt `test/e2e-durchlauf.js` ODER trägt den dokumentierten Ausschluss“ mit Gegenprobe.

### 6. c5e#4 (V24-4) — gii-xml-Lagen in der Unverwechselbarkeits-Matrix

- `test_feature_rechtsstand.js:163-165` nennt die gii-xml-Lagen (`normtext_unbestaetigt`, `pruefungsfehler`,
  `norm_geaendert` …) ausdrücklich als nicht abgedeckt.
- Fixturen mit gültigem Normtext-Hash ergänzen und alle Paare in die Matrix aufnehmen.
- Abdeckungswächter: Die Menge der beprobten Lagen ist gleich einer handgeschriebenen Literalliste ALLER Lagen, die
  `core/rechtsstand.js` erzeugen kann. Die Liste schreibst du nach eigenem Lesen von `core/rechtsstand.js` hin, nicht
  per Import.
- Gegenprobe: eine Lage aus den Fixturen nehmen → ROT.

### 7. G-B7 — `tools/mutationsprobe.js` startet Tests mit der Testumgebung

- `tools/mutationsprobe.js:521-528` baut die Kindumgebung selbst (`{ ...process.env, DATABASE_URL, … }`). Ohne
  vorher gesourcte `test/umgebung.sh` fehlen Netzsperre, Dateisperre, Telegram-Attrappen und Wegwerfwurzeln.
- Behebung: Das Kind läuft über `bash -c '. test/umgebung.sh && exec node "$1"' _ <datei>`. `umgebung.sh` bleibt die
  einzige Quelle.
- Prüfe, was `umgebung.sh` voraussetzt (Wegwerf-`DATABASE_URL`, mktemp-Wurzeln) und dass die Wurzeln nach dem Lauf
  geräumt werden. Gibt es dafür schon einen Aufräummechanismus, wird er benutzt.
- Statischer Wächter, dass das Werkzeug `test/umgebung.sh` benutzt, mit Gegenprobe.
- Verhaltensprobe: Ein Kindprozess unter dem Werkzeug sieht `GYMDOCU_TG_BOT_TOKEN` = Attrappe und eine gesetzte
  Wegwerf-`PDF_ROOT`.

### 8. Ohne Bau (zur Kenntnis, NICHT anfassen)

- E3-d: Durch den systemischen Export in `test/umgebung.sh` ist es gegenstandslos. Teil 4 von
  `test_feature_kind_umgebung.js` misst die Wirkung in der Suite.
- V20-4: Als „manuell geführt“ umgesetzt.
- ladebestand#3: Benannte Grenze, die Entscheidung liegt beim Betreiber.

## Bericht

- Je Punkt: die neue Messung der Fundstelle, der Diff, jede Gegenprobe wörtlich.
- Die Listen aus 1, 2 und 4.
- Das e2e-Ergebnis wörtlich.
- Die volle Suite: Exit, gelaufene gegen registrierte Dateien, `diff` EXIT 0.
- Lint.
