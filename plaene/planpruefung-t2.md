# Planprüfung T2 — Zusicherungen (24.09.2026)

Papier: `plaene/auftrag-t2-zusicherungen.md` (Fassung 1) mit den Befundtexten. Spuren: `deepseek-v4-pro` mit
Repo-Lesezugriff (effort high, 26 Runden, ~4,45 $, 11 Lesungen vom Geheimnis-Deckel abgelehnt), `kimi-k3` mit Bündel
(Papier, Fenster ±30 Zeilen um jede zitierte Fundstelle, `test/run.sh`-Kopf).

## DeepSeek — Berichtigungen der Befundtexte (je nachgesehen)

| Nr. | Befund | Nachgesehen | Folge |
|---|---|---|---|
| PT2-1 | V12-3: Zusicherungen stehen in `e2e/gymdocu.spec.js:231-233`, nicht `:187-191`; E2E läuft im CI-Job `browser-e2e` (`.github/workflows/ci.yml:239-240`) | Angabe übernommen, im Bau zu bestätigen | Fundstelle berichtigt; Gegenprobe im CI-Job messbar |
| PT2-2 | V20-2: `vorTagen()` steht in `test_feature_mangel_darstellung_einheitlich.js:38-42`, nicht in `test_feature_ladestand_dbfehler.js` | Angabe übernommen | berichtigt |
| PT2-3 | V19-1: vier Magicline-Tests mit `process.pid`-Slug, nicht drei | Angabe übernommen | alle vier |
| PT2-4 | V13-3 verdreht: INNERHALB 00–02 Uhr Berlin ist die Zusicherung ohne Prüfwert, ausserhalb prüft sie | Angabe übernommen | benannte Grenze, NICHT schärfen (sonst zeitfensterabhängiger Fehlalarm im Gate) |
| PT2-5 | V26-1 nur noch bedingt: `test_feature_suite_laufsperre.js:636-643` ersetzt den Vorgabewert; Restlücke nur bei extern EXPORTIERTEM `GYMDOCU_SUITE_LOCK` | Angabe übernommen | `GYMDOCU_SUITE_LOCK` in Fall F aus der Kind-Umgebung entfernen |
| PT2-6 | V16-6 unbelegt: kein UTC-Fixture in `test_feature_dguv3.js` | Angabe übernommen | Executer sucht die Fundstelle; ohne Fund streichen |
| PT2-7 | T1-K4: `test/run.sh:417-545` setzt NEUN Wegwerf-Variablen (`PDF_ROOT`, `BELEHRUNGEN_UPLOAD_DIR`, `DOKUMENTE_DIR`, `LAGEPLAN_UPLOAD_DIR`, `EINWEISUNG_NACHWEIS_DIR`, `PRUEFBERICHT_DIR`, `DEFECT_PHOTO_DIR`, `EXPORT_DIR`, `OFFBOARDING_QUEUE_DIR`) | Angabe übernommen | Liste als Literal; Executer gleicht gegen `run.sh` ab |
| PT2-8 | N-1: Ursache ist `test/helfer/quelltext-scan.js:491` (`git ls-files --cached --others` ohne `--exclude-standard`) — ein GEMEINSAMER Helfer | Angabe übernommen | `--exclude-standard` im Helfer; Executer nennt alle Wächter, die ihn nutzen, und misst jeden (Zahl der gescannten Dateien vorher/nachher) |
| PT2-9 | V11-5: pauschales FAIL bei leerem `PROD_PDF_ROOT` machte jeden Staging-Smoke rot | `ops/staging-smoke.sh:41` | eigene Stufe „nicht geprüft“ (Exit ≠ 0 nur bei echtem Verstoss) |
| PT2-10 | V20-1: die im Test berichtete Gegenprobe trägt erst nach Umstellung auf maskierten Text; Maskierhelfer `test/helfer/advisory-lock-erkenner.js` (`codeOhneKommentare`) | Angabe übernommen | übernommen |
| PT2-11 | V21-3/V21-4: Gegenprobe am Bestand nicht messbar (Fixture koppelt `id`/`erstellt_am`; IDs nie gleich) — erst die neue Fixture macht sie messbar | Papier | Fixture zuerst, dann Gegenprobe |
| PT2-12 | Teil C: `test_feature_retention_sperr_sichtkontrollen.js:32-37` (`setFullYear`/`setDate` + `toISOString`) ist die gesuchte Falle; beide Seiten der Vergleiche stammen aus derselben Funktion — Fixture-Risiko, kein Fehlalarm | Angabe übernommen | V24-1 wie geplant |

## Kimi

| Nr. | Befund | Nachgemessen | Einstufung | Folge |
|---|---|---|---|---|
| PT2-13 | N-1: „nur `git ls-files`“ (Index) verlöre neue, noch nicht gestagte Dateien — ausgerechnet „keine NEUEN Rohwerte“; dazu cwd-Abhängigkeit und fehlende Mindestzahl | gelesen `test/helfer/quelltext-scan.js:485-495`: der Helfer läuft mit `cwd: repoRoot` und `--cached --others`; der richtige Griff ist `--exclude-standard` (DeepSeek PT2-8), NICHT „nur Index“ | mittel (mein Papiertext war falsch) | `--exclude-standard`; Gegenprobe 3: neue, nicht gestagte Datei mit Rohwert → ROT |
| PT2-14 | Teil C: „Uhr auf den Tag nach der Zeitumstellung“ kann für die ±n·86400000-Fixtures nicht rot werden; das Fehlerfenster für `+14 Tage` liegt ZWEI WOCHEN VOR der Umstellung, für `−1 Tag` im März. `TZ=` wirkt bei `toLocaleDateString(…, {timeZone})` und `toISOString()` nicht | **gemessen**: Lauf 12.10.2026 00:30 CEST, `+14·86400000` → `2026-10-25` (kalendarisch 26.10.); Lauf 26.10. 00:30 CET → `2026-11-09` (richtig); Lauf 30.03. 00:30 CEST, `−86400000` → `2026-03-28` (richtig 29.03.) | **mittel** — das nächste Fenster ist der 12.10.2026, dann wird das Deploy-Gate eine Stunde lang rot | Gegenprobe je Mechanismus: eingefrorene Uhr (Preload, der `Date.now`/`new Date()` überklebt) auf 12.10.2026 00:30 CEST bzw. 30.03. 00:30 CEST; `TZ=` nur bei V20-2/V24-1 |
| PT2-15 | V12-3: `:187-191` zeigt einen anderen Test | = PT2-1 | — | berichtigt |
| PT2-16 | V20-1 überzeichnet: für `routes/module.js` war die berichtete Gegenprobe valide, nur `sichtpruefung.js` hat den Kommentar | Angabe übernommen | gering | Schärfung für beide Dateien, Befundtext präzisiert |
| PT2-17 | V19-1 hat zwei Hälften; Zufallsslug behebt nur den geerbten Altzustand, nicht den echten Magicline-Abruf im Einzelaufruf | Angabe übernommen | gering | Netz-Attrappe wie bei V17-1; Gegenprobe: Einzelaufruf ohne Netzsperre → 0 ausgehende Verbindungen |
| PT2-18 | T1-K4: Literal-Liste driftet, sobald `run.sh` eine neue Wegwerf-Variable bekommt | Papier | gering | zusätzlich Abgleich in BEIDE Richtungen gegen die `_DIR`/`_ROOT`-Zeilen in `run.sh` |
| PT2-19 | V25-3: `alert(` in `sichtpruefung.js:1046, 1052` ist dort BEGRÜNDET (Kommentar `:1025-1032`); ein erweiterter Ausschnitt risse sie als Verstoss | Angabe übernommen | gering | die beiden als benannte Ausnahme im Testkopf, nicht als Verstoss |
| PT2-20 | V13-3 steht als „schärfen“ in Teil B, ist aber eine benannte Grenze wie V15-1a | = PT2-4 | — | aus Teil B genommen, nur melden |
| PT2-21 | V23-2: `>` statt `>=` wäre bei einer Uhr-Rückkorrektur flackeranfällig | Papier | gering | `erstellt_am` in der Fixture zurückdatieren, dann `>` — uhrenstabil |

## Zahlen

21 Zeilen: DeepSeek 12 (alles Berichtigungen/Präzisierungen der Befundtexte), Kimi 9 (2 Überschneidungen: V12-3,
V13-3). Nur Kimi: der Denkfehler im Papier zu N-1, die falsch kalibrierte Zeitumstellungs-Gegenprobe (mit einem
echten Fehlerfenster am 12.10.2026), Drift der T1-K4-Liste, begründete `alert(`-Stellen, NTP-Flackern. Nur DeepSeek:
die Fundstellen und Zählungen (V20-2-Datei, vier statt drei Magicline-Tests, V16-6 unbelegt), der gemeinsame
Scan-Helfer als Ort der N-1-Behebung, V11-5 als eigene Stufe.
