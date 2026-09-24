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

Kimi-Spur: folgt.
