# Planprüfung Auftrag SG (27.09.2026)

Zwei Lesespuren, verschiedene Bündel: A `deepseek-v4-pro` (Teil A: Kryptomodule, Test, Rotation, Messskript; 58 KB,
19.407 ein / 32.660 aus, 357 s); B `kimi-k3` (Teil B: ci.yml, deploy.yml, audit-gate.sh, echte Semgrep-JSON-Form,
Positivkontrolle; 55 KB, 19.383 ein / 23.140 aus, 722 s). Antworten: Scratchpad `sgp/antwort-A.json`, `antwort-B.json`.

## Befunde und eigene Nachmessung

| Nr | Spur | Befund | Nachmessung | Urteil |
|---|---|---|---|---|
| PSG-1 | A+B | Lauf ohne geprüfte Datei wird `sauber` | gemessen: `--baseline-commit` = HEAD → `results 0, errors 0, scanned 0`, EXIT 0 | **trägt**, blockierend |
| PSG-2 | B | Zustand „`results` leer + `errors`" undefiniert | Papier gelesen: keine der drei Regeln greift | **trägt** |
| PSG-3 | B | „nie blockierend" nicht abgesichert | `test_feature_ci_gates.js:184` legt die Jobliste fest, `:294–308` verbietet `continue-on-error` an jedem Job und Schritt, dazu `BEKANNTE_IFS` → der geplante Job in `ci.yml` hätte den Wächter rot gemacht bzw. hätte ihn aufweichen müssen | **trägt**, blockierend — nur Spur B (hatte `ci.yml` im Bündel) |
| PSG-4 | B | „Funde → Exit ≠ 0" falsch | gemessen: 34 Funde → EXIT 0; kaputte Konfiguration → EXIT 7 | **trägt** (Falschaussage im Papier) |
| PSG-5 | B | Anmerkungs-Text nicht maskiert (`%`, Zeilenumbruch) | echte Fehlermeldung enthält `\n` (Messung) | trägt |
| PSG-6 | B | Fehler ohne `path` (Regelsatz nicht ladbar) | gemessen: `p/gibtsnicht-xyz` → zwei `SemgrepError` ohne `path`, EXIT 7 | **trägt** |
| PSG-7 | B | CLI-Teil (Anmerkung, Exit, Wortlaut) nicht testbar spezifiziert | Papier gelesen | trägt |
| PSG-8 | B | Mess-Fixturen tragen `gd/`-Präfix | gemessen: aus der Repo-Wurzel relative Pfade (`core/db.js`) | trägt als Falle |
| PSG-9 | A | Timeout/Abbruch des Jobs könnte das Deploy beeinflussen | `deploy.yml:114-117`: Deploy nur bei `head_branch == 'master'`; PR-Läufe lösen nie aus | fällt für das Deploy; durch den eigenen Workflow (Fassung 2) ohnehin gegenstandslos |
| PSG-10 | A | kurze Bestandswerte (< 29 Byte) würden unlesbar, Rotation bricht ab | Historie im flachen Klon nicht belegbar (`cab4d5c` = erste sichtbare Fassung); Live-DB nicht einsehbar | **trägt als Risiko** → Fassung 2: Grenze 28 statt 29 (volles Tag, leerer Ciphertext bleibt lesbar), kein Bestand kann brechen |
| PSG-11 | A | Tests erzwingen nicht BEIDE Riegel | mit Grenze 28 ist ein kurzes Tag bei vorhandener Längenprüfung unerreichbar → Riegel verhaltensgleich | trägt → Fassung 2: statische Zusicherung je Riegel |
| PSG-12 | B | `entschluesseln()` würde neu werfen (Vertragswechsel) | `entschluesseln()` wirft schon heute bei manipulierten Werten (`core/secret-crypto.js:102–116`) | **fällt** |

## Eigener Messbefund, den keine Spur hatte

Diff-Modus über den echten C3a-PR (`22dc613..d5c559d`, 30 JS-Dateien, 73 s): **34 neue Funde**, davon
`express_xss` 17, `raw-html-format` 5, `regex_dos` 4, `express_open_redirect` 3, `direct-response-write` 2 — alles
Regeln, die im Bestand hunderte Fehlalarme liefern. Mit den vollen Regelsätzen wäre der Hinweis Rauschen.

Positivkontrolle × Regel (ein Treffer genügt je Klasse), Bestand / C3a-Diff:

| Klasse | leise Regel | Bestand | C3a |
|---|---|---|---|
| SQL (P1, P2 inkl. `db.q`) | `javascript.express.security.injection.tainted-sql-string.tainted-sql-string` | 3 | 0 |
| exec (P3) | `ajinabraham.njsscan.exec.exec_os_command.generic_os_command_exec` | 0 | 0 |
| Weiterleitung (P5) | `javascript.express.security.audit.express-open-redirect.express-open-redirect` | 0 | 0 |
| eval (P6) | `ajinabraham.njsscan.eval.eval_node.eval_nodejs`, `javascript.lang.security.audit.code-string-concat.code-string-concat` | 0 | 0 |
| Geheimnis (P7) | `ajinabraham.njsscan.generic.hardcoded_secrets.node_secret` | 1 | 0 |
| XSS (P4) | nur laute Regeln (259 / 138 / 55 im Bestand) | — | — |

Folge: Hinweis auf die leisen Regeln beschränken; XSS bleibt draussen (dort tragen CSP und `esc()`).

-- Ende --
