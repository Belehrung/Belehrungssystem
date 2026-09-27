# Auftrag SG — Semgrep-Hinweis am PR und GCM-Tag-Länge (27.09.2026, Fassung 2)

Grundlage: `plaene/semgrep-messung-27-09-2026.md`, Planprüfung `plaene/planpruefung-sg.md` (PSG-1..12, dort je
Nachmessung). Betreiber 27.09.2026: „Ja denn es kann auch nicht schaden". Zweig `fix-sg-semgrep` von `origin/master`
(`d5c559d`), Arbeitsbaum `/workspace/gymdocu-sg` (steht, sauber). Einzeltests nur gegen eine eigene DB
(`gymdocu_sg_test`). Einordnung: nicht sehr komplex (Standard-Executer) — zwei kleine, getrennte Teile.

Änderungen gegenüber Fassung 1: eigener Workflow statt Job in `ci.yml` (PSG-3), kuratierte Regeln + Kontrolllauf
(eigener Messbefund), Zustände vollständig (PSG-1/2/6), Exit-Codes berichtigt (PSG-4), Längengrenze 28 (PSG-10).

## Teil A — `core/secret-crypto.js`: kein gekürztes GCM-Tag

Befund (gemessen, Node 22.22.2): `versuchOeffnen()` schneidet `tag = buf.subarray(12, 28)` ohne Längenprüfung und ruft
`createDecipheriv` ohne `authTagLength`; ein auf 4 Byte gekürztes Tag mit richtigem Präfix wird ANGENOMMEN.

1. In `versuchOeffnen()` vor dem Entschlüsseln: `buf.length < IV_LAENGE + TAG_LAENGE` (12 + 16 = 28) → werfen. Grenze
   BEWUSST 28, nicht 29: ein Wert mit vollem Tag und leerem Ciphertext bleibt lesbar (PSG-10 — ob solche Werte im
   Bestand existieren, ist nicht einsehbar; bei 28 kann keiner brechen, und ein volles Tag ist nicht fälschbar).
   Konstanten benennen.
2. `createDecipheriv(..., { authTagLength: TAG_LAENGE })` und ebenso beim `createCipheriv`.
3. `core/file-crypto.js` NICHT anfassen; im Bericht bestätigen, dass beide Wege (Buffer, Stream) die Länge prüfen.
4. Tests in `test_feature_secret_crypto.js` über das ECHTE `entschluesseln()`:
   - Kontrolle der Bauweise: Wert von Hand bauen (Testschlüssel, `iv | tag | ct`, Präfix `enc:v1:`, Klartext „x") →
     liefert „x".
   - Leerer Ciphertext, volles richtiges Tag (28 Byte) → liefert `""` (bleibt lesbar).
   - Leerer Ciphertext, Tag auf 4 Byte gekürzt, richtiges Präfix → wirft.
   - Statische Zusicherungen (PSG-11; beide Riegel sind verhaltensgleich, weil ein kurzes Tag bei vorhandener
     Längenprüfung unerreichbar ist): Quelltext ohne Kommentare enthält die Längenprüfung vor `createDecipheriv` und
     `authTagLength` in BEIDEN `create…iv`-Aufrufen.
   - Gegenproben, je einzeln, wörtlich: (G1) beide Riegel entfernt → 4-Byte-Fall ROT; (G2) nur `authTagLength`
     entfernt → statische Zusicherung ROT; (G3) nur die Längenprüfung entfernt → statische Zusicherung ROT; (G4) Grenze
     auf 29 → der 28-Byte-Fall ROT.

## Teil B — eigener Workflow „Semgrep-Hinweis" (nur PR, nie Teil der CI)

**Eigene Datei `.github/workflows/semgrep-hinweis.yml`, `name: Semgrep-Hinweis`** — NICHT in `ci.yml`. Grund
(gemessen): `test_feature_ci_gates.js` legt die Jobliste von `ci.yml` fest (`:184`), verbietet `continue-on-error` an
jedem Job und Schritt (`:294–308`) und prüft jedes `if:` gegen `BEKANNTE_IFS`. Diese Wächter schützen das Deploy-Gate
und werden NICHT angefasst. `deploy.yml` hört nur auf `workflows: ["CI"]` (`test_feature_deploy_gate_static.js:222`,
dort auch „genau eine Datei mit `name: CI`"); ein eigener Workflow kann das Deploy nie beeinflussen. `ci.yml` und
`deploy.yml` bleiben unverändert.

1. Workflow: `on: pull_request` (branches `[master]`), sonst nichts; `permissions: contents: read`; keine `secrets.`;
   ein Job, `timeout-minutes: 25`, `actions/checkout@v6` mit `fetch-depth: 0`, `actions/setup-node@v7` (Node 22),
   `pip install semgrep==1.178.0`. Schritte, jeder Semgrep-Aufruf in `timeout 15m …` und mit `set +e`, Exit-Code in
   eine Datei/Umgebungsvariable gesichert (Semgrep liefert bei Funden EXIT 0, bei kaputter Konfiguration EXIT 7 —
   gemessen, PSG-4):
   a. **Kontrolllauf** gegen die Probedatei (Punkt 3) mit denselben `--config`-Angaben → `kontrolle.json`.
   b. **Diff-Lauf**: `semgrep scan --metrics=off --config p/expressjs --config p/nodejsscan --baseline-commit "$BASE"
      --exclude node_modules --exclude <Probeverzeichnis> --json --output semgrep.json` mit
      `BASE: ${{ github.event.pull_request.base.sha }}` über `env:` (nicht direkt in `run:` einsetzen).
   c. **Referenz von aussen**: Liste der geänderten `.js`-Dateien per `git diff --name-only "$BASE" HEAD -- '*.js'`
      (ohne `node_modules/` und Probeverzeichnis) → `geaendert.txt`.
   d. `node ops/semgrep-hinweis.js` mit den drei Dateien und beiden Exit-Codes.
2. `ops/semgrep-hinweis.js`, zwei reine, exportierte Funktionen plus dünne Kommandozeile:
   - `REGELN` = genau die leisen Regeln aus `plaene/planpruefung-sg.md` (Tabelle „Positivkontrolle × Regel"), als
     literale Liste. Funde anderer Regeln werden gezählt, aber nicht angemerkt („N Funde aus nicht ausgewählten
     Regeln ausgeblendet").
   - `auswerten({ semgrepJson, semgrepExit, kontrolleJson, kontrolleExit, geaenderteDateien })` → `{ zustand, funde,
     teilweise, grund }`. Entscheidungstabelle, VOLLSTÄNDIG und in dieser Reihenfolge:
     1. Ein Exit-Code ∉ {0, 1}, JSON fehlt/unlesbar/ohne `results`, oder ein `errors`-Eintrag OHNE `path` →
        `nicht_geprueft` (Grund nennen).
     2. Kontrolllauf: fehlt für eine Klasse der Tabelle (SQL, exec, Weiterleitung, eval, Geheimnis) jeder Treffer einer
        ausgewählten Regel → `nicht_geprueft` („Regel X nicht mehr wirksam — Registry geändert?").
     3. `geaenderteDateien` leer → `nichts_zu_pruefen`.
     4. Eine geänderte Datei fehlt in `paths.scanned` → `nicht_geprueft` bzw. bei Teilmenge Liste unter `teilweise`
        (Semgrep überspringt z. B. sehr grosse Dateien — messen, wie es sie meldet).
     5. `errors` MIT `path` (z. B. `Timeout`) zu einer AUSGEWÄHLTEN Regel → Eintrag unter `teilweise` (Datei, Regel,
        Art); zu einer nicht ausgewählten Regel → nur gezählt.
     6. Funde ausgewählter Regeln → `funde`; sonst `sauber`. `teilweise` bleibt in beiden Fällen sichtbar erhalten
        und macht aus `sauber` die Meldung „keine neuen Funde, TEILWEISE UNGEPRÜFT: …".
   - `baueAusgabe(ergebnis)` → `{ zeilen: [...], zusammenfassung: '...', exitCode }`: je Fund
     `::warning file=<pfad>,line=<zeile>,title=Semgrep <regel-kurzname>::<meldung>`, Maskierung nach GitHub-Vorgabe
     (Daten: `%`→`%25`, `\r`→`%0D`, `\n`→`%0A`; Eigenschaften zusätzlich `:`→`%3A`, `,`→`%2C`); alle Funde auch in
     der Zusammenfassung (GitHub begrenzt Anmerkungen je Schritt). exitCode 0 bei `sauber`, `funde`,
     `nichts_zu_pruefen`; 2 bei `nicht_geprueft` mit dem Wortlaut „NICHT GEPRÜFT".
   - Kommandozeile: liest Dateien und Argumente, ruft beide Funktionen, schreibt Zeilen nach stdout und die
     Zusammenfassung nach `$GITHUB_STEP_SUMMARY` (falls gesetzt), setzt den Exit-Code. Keine weitere Logik.
3. Probedatei im Repo (Verzeichnis z. B. `ops/semgrep-probe/`, von jedem anderen Scan ausgeschlossen) mit je einem
   Fall der fünf Klassen im Stil unserer Routen (`db.q` mit Template-String aus `req.query`, `exec`, `eval`,
   `res.redirect(req.query…)`, fest eingetragenes Geheimnis). Das „Geheimnis" darf keinem echten Muster ähneln und muss
   durch `tools/geheimnis-riegel.js` des Belehrungssystem-Repos NICHT als Geheimnis erkannt werden (einmal messen); die
   Datei darf von keinem Code geladen werden und nicht in Syntax-/Lint-Prüfungen stören (prüfen, ob `check:syntax`,
   ESLint oder ein Wächter sie erfasst, und sie dort sauber ausnehmen — begründet im Kopf der Datei).
4. Tests `test_feature_semgrep_hinweis.js` (in `test/run.sh` registrieren), gegen FESTE Fixturen, die aus echten
   Läufen AUS DER REPO-WURZEL stammen (relative Pfade; die Mess-JSONs im Scratchpad tragen ein `gd/`-Präfix und taugen
   nicht, PSG-8). Je Zeile der Entscheidungstabelle ein Fall mit literalem Sollwert für `zustand`, Anmerkungszeile und
   exitCode, dazu Maskierung (`a\nb%, c:`) und „Funde nicht ausgewählter Regeln erscheinen nicht als Anmerkung".
   Statisch (Muster `test_feature_deploy_gate_static.js`, js-yaml): `semgrep-hinweis.yml` hat `name` ≠ „CI",
   `on` genau `pull_request`, `permissions` genau `contents: read`, kein `secrets.`, jeder Semgrep-Aufruf mit
   `--metrics=off`; `deploy.yml` bleibt bei `workflows: ["CI"]`. Gegenproben je Tabellenzeile und je statischer
   Zusicherung (u. a. Zeile 3 entfernt → leerer Diff wird `sauber` → ROT; `on: push` ergänzt → ROT).
5. Kein Test startet Semgrep oder braucht Netz.

## Messung, die der Bericht enthält

- Den Workflow-Ablauf lokal nachstellen (dieselben Befehle wie im Job) über: (i) C3a-PR `22dc613..d5c559d`,
  (ii) einen kleinen PR aus der Historie, (iii) leeren Diff, (iv) kaputte Konfiguration. Je: Zustand, Anmerkungen,
  Laufzeit. Erwartung für (i): 0 Anmerkungen aus ausgewählten Regeln (Stand Planprüfung) — abweichend? Dann berichten.
- Positivkontrolle im Diff-Modus: Wegwerf-Änderung mit `db.q` + Template-String aus `req.query` in einer Route (NIE
  committen) → genau eine Anmerkung; Rücknahme per `git checkout -- <datei>`, `git status` sauber belegen.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht, den es vorher nicht gab (neuer Workflow, Anmerkungen im PR, Probedatei im Repo, Wurf bei
Werten unter 28 Byte)? Kann danach (a) ein bisher lesbares Geheimnis unlesbar werden, (b) CI oder Deploy vom neuen
Workflow abhängen, (c) ein Lauf, der nichts oder nicht alles geprüft hat, wie „keine neuen Funde" aussehen, (d) die
Probedatei von einem anderen Scan, Lint oder Wächter erfasst werden?

-- Ende des Auftrags --
