# Auftrag SG — Semgrep-Hinweis am PR und GCM-Tag-Länge (27.09.2026, Fassung 1)

Grundlage: `plaene/semgrep-messung-27-09-2026.md`. Betreiber 27.09.2026 auf „Soll Semgrep als PR-Hinweis eingebaut
werden?": „Ja denn es kann auch nicht schaden". Neuer Zweig `fix-sg-semgrep` von `origin/master` (`d5c559d`), eigener
Arbeitsbaum `/workspace/gymdocu-sg`. Einzeltests nur gegen eine eigene DB (`gymdocu_sg_test`). Einordnung: nicht sehr
komplex (Standard-Executer) — zwei kleine, getrennte Teile, beide mit Muster im Bestand.

## Teil A — `core/secret-crypto.js`: kein gekürztes GCM-Tag

Befund (gemessen, Node 22.22.2): `versuchOeffnen()` schneidet `tag = buf.subarray(12, 28)` ohne Längenprüfung und ruft
`createDecipheriv('aes-256-gcm', key, iv)` ohne `authTagLength`. Ist der gespeicherte Wert kürzer als 28 Byte, wird
das Tag kürzer; ein auf 4 Byte gekürztes Tag mit richtigem Präfix wird ANGENOMMEN (Klartext ""), ein falsches abgelehnt.

1. In `versuchOeffnen()` vor dem Entschlüsseln: `buf.length < 12 + 16 + 1` → werfen (ein gültiger Wert hat immer
   mindestens 1 Byte Ciphertext, weil `verschluesseln('')` gar nicht verschlüsselt — `core/secret-crypto.js`, Anfang
   von `verschluesseln()`). Die Konstanten benennen (IV 12, Tag 16), nicht als Zahlen verstreuen.
2. `createDecipheriv(..., { authTagLength: 16 })`, beim Verschlüsseln ebenso `createCipheriv(..., { authTagLength: 16 })`.
3. `core/file-crypto.js` NICHT anfassen (feste Tag-Länge per `subarray` mit vorheriger Längenprüfung — gemessen
   unkritisch); nur im Bericht bestätigen, dass dort beide Wege (Buffer und Stream) die Länge prüfen.
4. Tests in `test_feature_secret_crypto.js`, über das ECHTE `entschluesseln()`:
   - Kontrolle der Bauweise: den Wert von Hand bauen (derselbe Schlüssel wie der Test, `iv | tag | ct`, Präfix
     `enc:v1:`, Klartext „x") → `entschluesseln()` liefert „x". Ohne diese Kontrolle könnte der folgende Fall aus dem
     falschen Grund werfen (falsche Bauweise statt Riegel).
   - Derselbe Bau mit leerem Ciphertext und auf 4 Byte gekürztem, aber RICHTIGEM Tag → wirft.
   - Leerer Ciphertext mit vollem 16-Byte-Tag → wirft (Längenprüfung).
   - Gegenproben, je einzeln, wörtlich mit Zahlen: (G1) Längenprüfung UND `authTagLength` entfernt → der 4-Byte-Fall
     wird ROT; (G2) nur `authTagLength` entfernt; (G3) nur die Längenprüfung entfernt. Bei G2/G3 ist zu erwarten, dass
     der jeweils andere Riegel den 4-Byte-Fall noch fängt (Tiefenstaffelung) — messen und berichten, welcher Fall bei
     welcher Gegenprobe rot wird. Erreicht eine Gegenprobe den Riegel nicht, das sagen, nicht umdeuten.

## Teil B — CI-Job „Semgrep-Hinweis" (nur PR, nie blockierend)

Vorbild für die Zustände: `ops/audit-gate.sh` (unterscheidet „geprüft, sauber" / „Funde" / „NICHT GEPRÜFT").

1. Neues Skript `ops/semgrep-hinweis.js` mit exportierter, reiner Funktion `auswerten(jsonText)` → `{ zustand:
   'sauber' | 'funde' | 'nicht_geprueft', funde: [{pfad, zeile, regel, text}], teilweise: [...] }`:
   - JSON fehlt/unlesbar/ohne `results` → `nicht_geprueft` (mit Grund).
   - `results` leer und keine `errors` → `sauber`.
   - `results` nicht leer → `funde`.
   - `errors` (z. B. `Timeout`, Parse-Fehler) → zusätzlich `teilweise` mit Datei und Fehlerart; sie dürfen einen
     sonst leeren Lauf NICHT als `sauber` erscheinen lassen (eigener Hinweis „teilweise ungeprüft").
   Als Kommandozeile: liest die Datei, schreibt je Fund eine GitHub-Anmerkung
   `::warning file=<pfad>,line=<zeile>,title=Semgrep <regel>::<text>` und eine Zusammenfassung nach
   `$GITHUB_STEP_SUMMARY` (falls gesetzt). Exit 0 bei `sauber` und `funde` (Hinweis, kein Gate); Exit 2 bei
   `nicht_geprueft` mit dem Wortlaut „NICHT GEPRÜFT". Pfade relativ zum Repo (Semgrep liefert sie so, prüfen).
2. Job in `.github/workflows/ci.yml`: `semgrep-hinweis`, `if: github.event_name == 'pull_request'`,
   `continue-on-error: true` (ein roter Hinweis-Job darf das CI-Ergebnis und damit das Deploy-Gate in `deploy.yml`
   NIE beeinflussen — dort am Wortlaut prüfen und im Bericht belegen, wie `workflow_run` die Gesamt-conclusion liest),
   `timeout-minutes: 20`, `permissions: contents: read`, `actions/checkout@v6` mit `fetch-depth: 0`,
   `pip install semgrep==1.178.0` (Version fest), Aufruf:
   `semgrep scan --metrics=off --config p/expressjs --config p/nodejsscan --baseline-commit "$BASE" --exclude node_modules --json --output semgrep.json`
   mit `BASE: ${{ github.event.pull_request.base.sha }}`; danach `node ops/semgrep-hinweis.js semgrep.json`.
   Der Semgrep-Exit-Code darf die Auswertung nicht überspringen (Funde → Exit ≠ 0 bei Semgrep; Auswertung muss
   trotzdem laufen, z. B. `set +e` / eigener Schritt mit `if: always()`).
3. Tests `test_feature_semgrep_hinweis.js` (in `test/run.sh` registrieren) gegen FESTE JSON-Fixturen, die aus einem
   echten Semgrep-Lauf stammen (Form am echten Ausgabeformat von 1.178.0 lernen, nicht raten): sauber / zwei Funde
   (verschiedene Dateien, verschiedene Zeilen — jede Zahl anders) / nur `errors` mit Timeout / kaputtes JSON /
   Datei fehlt. Literale Sollwerte, auch für den Anmerkungstext. Gegenproben je Zustand (z. B. `errors` ignoriert →
   Timeout-Fixtur wird fälschlich `sauber` → ROT).
4. Kein Test startet Semgrep oder braucht Netz. Semgrep nur im CI-Job.

## Messung, die der Bericht enthält

- Lokal: derselbe Aufruf wie im Job im Diff-Modus über einen echten, bereits gemergten Beitrag, z. B.
  `--baseline-commit <Commit vor C3a>` gegen den C3a-Merge (`d5c559d`), und über einen zweiten, kleineren PR:
  Anzahl neuer Funde, davon echt/Fehlalarm (je Fund ein Satz), Laufzeit.
- Positivkontrolle im Diff-Modus: eine Wegwerf-Änderung (NIE committen) mit `db.q` + Template-String aus `req.query`
  → muss als neuer Fund erscheinen; Rücknahme per `git checkout -- <datei>` und `git status` sauber belegen.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht, den es vorher nicht gab (neuer Job, Anmerkungen im PR, Wurf bei kurzen gespeicherten Werten)?
Kann danach (a) ein bisher lesbares Geheimnis (TOTP-Seed, andere `enc:v1:`-Werte) unlesbar werden — Bestand prüfen:
gibt es gültige Werte unter 29 Byte? — (b) das CI-Ergebnis oder ein Deploy vom Semgrep-Job abhängen, (c) ein Lauf,
der nichts geprüft hat, wie „keine Funde" aussehen?

-- Ende des Auftrags --
