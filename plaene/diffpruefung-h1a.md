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

## Runde 2 (25.09.2026, Kopf `df2f500`, Nacharbeits-Diff `9948f6b..df2f500`)

Anlass: die Nacharbeit ändert Verhalten (Mount ganz vorne, CSRF-Segmentgrenze für ALLE Ausnahmen). Spuren: Claude
ausführend (`gymdocu-h1-cc`, DB `gymdocu_h1cc_test`, Skripte `scratchpad/h1cc2/`), `deepseek-v4-pro` mit Repo-Lesezugriff
auf den Nacharbeits-Diff. Alle Runde-1-Reproduktionen über die echte Kette grün (json/urlencoded 204 in 1–11 ms, alter
Stand 3001–3005 ms hängend; M4c 403). **Kein bisher CSRF-freier echter Aufruf bekommt jetzt 403** (186 Schreibrouten
aufgezählt, 0 mit alt ≠ neu; Aufrufer Hauptserver/Magicline/Offline-Warteschlange alle mit Segmentgrenze — beide Spuren
unabhängig). 15 Gegenproben rot (Tabelle im CC-Bericht).

| # | Spur | Befund | Messung | Schwere | Entscheidung |
|---|---|---|---|---|---|
| H1a2-1 | CC R2-1 | Der blockierende Befund H1a-1 ist gegen Rückfall ungeschützt: Mount zurück hinter die Parser UND `readableEnded`-Rückfall entfernt → echte Kette hängt (3005 ms), alle Tests grün (48/0, 120/0, 36/0). Jeder Riegel allein hält | CC gemessen | mittel | Test über die echte `server.js`-Kette (json + urlencoded, Zeitlimit, Soll 204); Gegenprobe genau diese Doppelmutation |
| H1a2-2 | DS 5.2, CC R2-2 | H1a-8/1 „`req.destroy()`“ kann nicht rot werden (`'close'`/`'error'` lösen beide mit `true` auf); Wirkung ist messbar am Server-Socket | CC gemessen (48/0 ohne `destroy`), gelesen | gering–mittel | Server-Socket messen |
| H1a2-3 | DS 3 | Token-Redaktion unvollständig: `/passwort-reset/:token` (`routes/auth.js:1377/1406`) und `/mitarbeiter/pin-setzen/:token` (`routes/mitarbeiter-auth.js:368/391`) bleiben im Klartext; `core/error-tracker.js:199-207` führt beide in seiner eigenen Liste | selbst nachgelesen | mittel | EINE Quelle: Liste/Schwärzung aus `core/error-tracker.js` wiederverwenden statt zweiter Regex |
| H1a2-4 | CC R2-4 | `/csp-bericht` vor helmet → Antwort trägt `X-Powered-By: Express`, sonst nirgends im öffentlichen Bestand | CC gemessen | gering | `app.disable('x-powered-by')` global |
| H1a2-5 | CC R2-5 | `ip=`/`ua=` am Zeilenende sind über ein frei wählbares Feld fälschbar | CC gemessen | gering | Absenderfelder vor die frei wählbaren setzen und/oder Felder ohne Leerzeichen |
| H1a2-6 | CC R2-6, DS 5.2 | Sollwerte aus der bewachten Konstante: `GRENZE_BYTES` 8→9 KiB und `MAX_EINTRAEGE_JE_POST` 5→25 bleiben grün | CC gemessen (48/0) | gering | Literale 8192 und 5 |
| H1a2-7 | CC R2-7 | Ausnahme an EINER Stelle weiter statt enger: `POST /d`, `/v` (auch mit Query) jetzt CSRF-frei (vorher 403); heute keine Route, Wächter fängt neue (119/1) | CC gemessen | gering | Einträge mit eigenem Schrägstrich (`/d/`, `/v/`) behalten `startsWith(a)` ohne nackten Pfad |
| H1a2-8 | CC R2-3 | Feste 350 ms im Crawler verschieben die zeitliche Lücke nur (Verstoss nach 300 ms rot, nach 1000 ms grün), kosten ~36 s je Lauf | CC gemessen | gering–mittel | Verstösse über die Lebensdauer der Seite sammeln (vor der nächsten Navigation/beim Schliessen auswerten), feste Wartezeit weg |
| H1a2-9 | DS 2, CC R2-8 | Kommentare falsch: `routes/csp-bericht.js:7-8` (alter Mount), `server.js` „VOR den globalen Body-Parsern (frühere Fassung)“ statt NACH; `'none'` endet auf `chrome-error://`, nicht `about:blank`; `skip(…, 2)` für eine Zusicherung; `mailto:`/`javascript:` werfen nicht | gelesen/gemessen | Anmerkung | berichtigen, Skip-Zahl 1 |
| H1a2-10 | CC (ausserhalb) | Gesamt-Skip des Crawlers (`:570`) ohne CI-Zweig — fehlte in der CI die Headless-Shell, liefe der Crawler als SKIP mit EXIT 0 | gelesen | gering | derselbe CI→FAIL-Zweig wie beim Kanal |
| H1a2-11 | CC R2-10, DS 3 | Slowloris: Route ohne eigenes Zeitlimit, Verbindungen 300,1 s offen bis `408` (beide Stände gleich). In Produktion puffert nginx den Rumpf vor dem Weiterreichen | CC gemessen | gering | → Sammelliste |
| H1a2-12 | CC R2-10 | Aufräumen der Rate-Map bewusst ohne Test (B8 48/0), funktional gemessen | CC gemessen | Anmerkung | → Sammelliste |
| H1a2-13 | DS 4 | `channel:'chromium'` fehlt ausserhalb der CI → sichtbares SKIP statt FAIL | CC gemessen (630/0/2 ohne CI, 630/1 mit CI) | Anmerkung | **Entscheidung:** CI ist die letzte Instanz (Prüf-Ritual 6) und installiert den Kanal; ausserhalb SKIP sichtbar. Bleibt so |
| — | DS 5.3 | Status-200-Zusicherung allein bewacht `blob:` nicht | gelesen | — | **fällt:** die Folgezusicherungen bewachen es, C1 (`blob:` entfernt) wird rot (629/2) |
| — | CC R2-9 | `'/csp-bericht'` in `AUSNAHME_PREFIX` wirkt nur noch auf durchfallende Pfade | gemessen | — | Wächter braucht ihn (W4 114/6); dokumentieren |

Nacharbeit 2: `plaene/auftrag-h1a-nacharbeit2.md`. Danach eigene Nachmessung mit den `h1cc2`-Skripten (Doppelmutation
M3+B2, B1, B9b, B3b, R2-5, R2-7); eine dritte volle Runde nur, wenn die Nacharbeit mehr als Tests, Kommentare und die
genannten Einzeiler ändert.
