# Diffprüfung H1a — CSP mit Bericht (Stufe 1) und Crawler für Stufe 2 (25.09.2026)

Kopf `9948f6b` (Bau `06a68d4`/`b4f20b4`/`25839ca` + master `00bd9c9`, konfliktfrei gemergt, Lint EXIT 0). Nicht
unwiderruflich → zwei Spuren: Claude ausführend (eigener Baum `gymdocu-h1-cc`, eigene DB), `deepseek-v4-pro` mit
Repo-Lesezugriff (ganzer Diff). Executer-Bericht: Suite `SUITE_EXIT=0`, Crawler 536 Zusicherungen, Gegenproben (a)–(g)
rot/grün; Mount-Entscheidung (Präfix + `AUSNAHME_PREFIX`) selbst getroffen.

## Eigene Lesung (vor den Spuren)

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| H1a-E1 | `test_feature_csp_bericht.js` hängt den Router an eine EIGENE express-App — ob ein Bericht durch die echte Kette von `server.js` (globales `express.json`/`urlencoded` davor, `:161-162`) ankommt, prüft kein Test; würde der globale Parser den Körper je lesen, feuert `end` im eigenen Leser nie, die Anfrage hängt | Test `:18-41` gelesen; `express.json()` ohne `type` greift nach `type-is` nur `application/json` — heute also vermutlich unberührt, aber unbelegt | mittel |
| H1a-E2 | Rate-Map `versuche` wird nie aufgeräumt (Vorbild `core/qr-scan-schutz.js:124-127` räumt per `setInterval`) — wächst mit jeder neuen IP bzw. jedem /64 | gelesen | gering–mittel |
| H1a-E3 | Die Ratengrenze greift erst NACH dem Einlesen des Körpers (bis 8 KiB je Anfrage) | gelesen | gering |

Eigener Suite-Lauf auf `9948f6b`: `SUITE_EXIT=0`, Ritual 392 = 392 (`diff` EXIT 0), Crawler 536 PASS / 0 FAIL, Lint EXIT 0.
