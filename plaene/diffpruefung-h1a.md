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

## Runde 1 — Befunde der Spuren, selbst nachgemessen

Spuren: Claude ausführend (16 Zeilen, keiner blockierend), DeepSeek (9). **Regelverstoss der ausführenden Spur,
selbst offengelegt:** drei lesende GET-Anfragen an echte Hosts (`qr.`, `md001.`, `verify.gymdocu.de`) — Vorgabe war
„kein Netz nach aussen“. Nur Befund 16 stützt sich darauf.

| Nr. | Spur | Befund | Nachgemessen | Einstufung | Auftrag |
|---|---|---|---|---|---|
| H1a-1 | CC 1, E1, DS 3 | `POST /csp-bericht` mit `application/json` oder `urlencoded` bekommt NIE eine Antwort: die globalen Parser (`server.js:161-162`) haben den Rumpf schon gelesen, `end` feuert im eigenen Leser nie; offene Verbindungen ohne Zeitlimit, keine Ratengrenze davor. Der Einzeltest (eigene App ohne Parser) sichert das Gegenteil zu | **eigener Minimalfall** (Parser + Router): `application/json` → keine Antwort nach 2005 ms, `urlencoded` → 2002 ms, `csp-report` → 204 in 17 ms | **hoch** (öffentlicher, anonymer Endpunkt, der Verbindungen offen hält) | Mount vor Session und Body-Parser ziehen UND im Leser einen schon gelesenen Rumpf erkennen (204); Test über die echte Kette |
| H1a-2 | CC 2, DS 1, E2 | Rate-Map nie aufgeräumt (15.001 Schlüssel → Map 15.007; 169 Byte je Eintrag) | CC gemessen; gelesen | mittel | Takt wie `core/qr-scan-schutz.js:124-128` mit `unref()`, Test |
| H1a-3 | CC 3 | Crawler liest Verstösse sofort nach `load` — ein Verstoss nach 300 ms bleibt grün (EXIT 0, 536/0; ohne Verzögerung 534/2) | CC gemessen | mittel | Verstösse über die Lebensdauer der Seite sammeln |
| H1a-4 | CC 4 | Wegfall von `blob:` bleibt im Crawler grün (536/0); im Chromium bricht dann die Foto-Verkleinerung (`onerror`, Verstoss `img-src blob`) | CC gemessen | mittel | Crawler-Schritt mit echter Verkleinerung (`setInputFiles`) |
| H1a-5 | CC 5 | „frame-ancestors nicht messbar“ stimmt nur für die Headless-Shell; mit `channel:'chromium'` rendert die Vorschau bei `'self'` und scheitert mit Konsolenmeldung bei `'none'` (534/2) | CC gemessen | mittel | `channel:'chromium'` für den Vorschau-Schritt (Verfügbarkeit in CI prüfen; fehlt es: CI → FAIL, sonst sichtbares SKIP), Antwortwahl über den Frame; Kommentar (e) berichtigen |
| H1a-6 | CC 6 | Routen direkt auf `app` fehlen in der Sollmenge („JEDE GET-Route“ stimmt nicht) — neue `app.get` mit fremdem Skript: 536/0 | CC gemessen | gering | Wurzelrouten aufnehmen |
| H1a-7 | CC 7 | Formular-/fetch-Ziel-Prüfung übersieht `//evil.example` und läuft nur auf einer Seite | CC gemessen | gering | `new URL(z, base).origin`, über alle Seiten |
| H1a-8 | CC 8, DS 4 | Sechs Mutationen gegen `test_feature_csp_bericht.js` bleiben 19/0 (kein `req.destroy()`, `blocked-uri` nicht redigiert → Token im Log, `/d/` nicht redigiert, Grenze +1 KiB, ein Schlüssel für alle, Vorgabe 240000) | CC gemessen | gering | je eine Zusicherung |
| H1a-9 | CC 9, DS 4 | Redaktion lässt U+2028/2029/0085, C1, Bidi, Zero-Width durch | CC gemessen | gering | `/[\p{Cc}\p{Cf}  ]/gu` |
| H1a-10 | CC 10, DS 5 | `reports+json` vervielfacht Logzeilen (234 je POST) — Browser senden das Format mit dieser Richtlinie nie | CC gemessen | gering | höchstens 5 Einträge je POST |
| H1a-11 | CC 11, DS 8 | `'/csp-bericht'` in `AUSNAHME_PREFIX` wirkt NICHT auf die Route (die hängt vor `csrfSchutz`), nur auf Geschwisterpfade ohne Segmentgrenze (`/csp-berichtX/…`); dieselbe Klasse besteht für `/api-x/…` | CC gemessen (M4c: fremde Origin → 200) | gering–mittel | Segmentgrenze in `istAusnahmePfad` für ALLE Einträge (Präfix gleich Pfad oder gefolgt von `/`), vorher messen, dass keine echte Route davon abhängt; Eintrag nur, wenn der Wächter ihn wirklich braucht |
| H1a-12 | CC 12 | Mit Session-Cookie berührt jeder Bericht die Sitzung (SELECT + UPDATE, `expire` +7 h) | CC gemessen | gering | erledigt mit H1a-1 (Mount vor Session) |
| H1a-13 | CC 13 | Logzeilen sind von aussen beliebig fälschbar und entscheiden über Stufe 2 | CC gemessen | gering | gekürzten Client-Schlüssel und kurzen User-Agent mitloggen |
| H1a-14 | CC 14 | Crawler räumt `/tmp/csp-crawler-*` nie auf (38 Verzeichnisse) | CC gezählt | gering | `rmSync` im `finally` |
| H1a-15 | CC 15, DS 7 | Header-Zusicherung prüft den eigenen Patch, nicht nginx | gelesen | Anmerkung | als Harness-Prüfung benennen |
| H1a-16 | CC 16 | Schnipsel A nennt `qr.` nicht; live liefert `qr.` schon Report-Only | aus den (regelwidrigen) Live-Anfragen | gering | `qr.` in der Doku nennen |
| H1a-17 | DS 2 | CSRF-Wächter prüft für `/csp-bericht` das eingehängte Modul nicht (`MODUL_AUSDRUCK_ERWARTET` ohne Eintrag), Text „zwölf Router“ veraltet | gelesen `:1004-1026` | gering | Eintrag + Zahl |
| H1a-18 | DS 6 | `/d/auth/<token>` wird zu `/d/:token/<token>` redigiert | gelesen `routes/csp-bericht.js:140` | gering | Regex |
| H1a-19 | DS 9 | toter Code im Crawler (`signCanvas`, `SIG`, drei `*_PARAM`) | gelesen | gering | entfernen |

Zahlen: 25 Befunde aus zwei Spuren plus drei eigene, 19 Aufträge, keiner gefallen. Nur CC: alle Messungen am echten
Browser und an der echten Kette (1, 3–7, 12–14). Nur DS: Modul-Prüfung im Wächter, `/d/auth`. Beide: Map, Log-Flut,
Präfix, Header-Zusicherung.
