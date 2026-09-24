# Diffprüfung H2 — Cookie-Schleife / anonyme Sitzungen

Auftrag: `plaene/auftrag-h2-cookie-schleife.md` (Fassung 3), Planprüfung `plaene/planpruefung-h2.md`.
Zweig `fix-h2-cookie-schleife` in `/workspace/gymdocu-h2`, Lesebaum `/workspace/gymdocu-h2-lese`.

## Bau (`221a7b2..e7dfc41`) — gelesen

Executer: zwei Commits; Suite `SUITE_EXIT=0`, Dateizahl 363 = 363, Lint 0, E2E 12/12, neuer Test 58/0;
Gegenproben A (requireLogin schreibt wieder) 55/3, B (Marker-Ziel fest `/`) 55/3, C (Marker-Zweig verschoben) 57/1,
jeweils zurück auf 58/0. Diff selbst gelesen (`core/auth.js`, `routes/auth.js`, `routes/tablet-sperre.js`, E2E-Fall).
Vom Executer gemeldet, Umgebung (nicht im Diff): eigene Rolle `gymdocu_h2test` und DB `gymdocu_dev` auf dem
Hauptcluster angelegt (nur Container), `npx playwright install chromium` nachgeholt, `/etc/hosts` um `e2e.localhost`
ergänzt. Rohwert-Fund der Suite über zwei Konstanten in `routes/tablet-sperre.js` behoben.

## Runde 1 — Spur C (Claude, ausführend)

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| H2-C1 | **Offene Weiterleitung, durch H2 neu:** `erlaubtesTabletZiel()` prüft nur `startsWith('/')` und `!startsWith('//')`. `weiter` kommt jetzt aus der Query — `/login/tablet?weiter=%2F%5Cevil.com` ergibt `Location: /\evil.com`, das der Browser als `https://evil.com/` auflöst (WHATWG: `\` gilt in http(s) als `/`). Ohne Anmeldung auslösbar (Schritt 1 legt die Tablet-Sitzung selbst an). Vorher kam das Ziel aus `req.originalUrl`, wo ein Browser `/\` nie sendet | **gemessen** (`scratchpad/h2probe_redirect.js`, echter Filter + Express `res.redirect`): `%2F%5Cevil.com` → `"/\\evil.com"` → `https://evil.com/`; `%2F%5C%5Cevil.com%2Fx` → `https://evil.com/x`; `//evil.com` → `/` (abgewehrt); `%2F%09%2Fevil.com` → bleibt auf dem Host (Express kodiert den Tab) | **blockierend** |
| H2-C2 | Nachweis 5c–5e („Marker mit gespeicherter `pending2fa`-Sitzung → 400, Sitzung unverändert“) sind aus dem falschen Grund grün: das Test-Cookie `connect.sid=s%3A<sid>.stub` trägt eine FALSCHE Signatur — express-session verwirft es, lädt die `pending2fa`-Sitzung nie und legt eine frische an. Dass die Zeile unverändert bleibt, folgt daraus, dass sie gar nicht angefasst wurde | **gemessen** (`scratchpad/h2probe_stubcookie.js`, echte express-session mit dem Test-Geheimnis): Cookie `.stub` → neue `sessionID`, `pending: false`; korrekt signiert (`cookie-signature`) → `sessionID = h2-pending-abc`, `pending: true` | hoch (Prüfung, die nicht rot werden kann) |

## Runde 1 — Spur D (DeepSeek mit Repo, anderes Bündel: Diff + Auftragskern, 12 Runden, 1,74 $ geschätzt)

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| H2-D1 (F1) | Nachweis 8a/8c seien schon ROT: im Test hänge `requireLogin` vor dem Admin-Mount | **gefallen, gemessen:** eigener Lauf des Tests gegen eine Wegwerf-DB → **58 PASS / 0 FAIL**, 8a–8c grün. Grund: `routes/auth.js:1537` `router.use('/admin', requireAdmin)` hängt im Test wie in `server.js:707` VOR `requireLogin` (`:715`) | — |
| H2-D2 (F2) | **Die Marker-Antwort stellt KEIN neues Cookie aus:** Schritt 1 setzt das Cookie auf 5 min; im Marker-Schritt ändert sich nur `cookie.maxAge`, das express-session nicht in den Änderungs-Hash nimmt, `rolling` ist aus → kein `Set-Cookie`. Der Browser verwirft das Cookie nach 5 Minuten, obwohl die DB-Zeile 8 h trägt — jede Tablet-Sitzung ohne spätere Regeneration (PIN) endet nach 5 Minuten, mitten in einer Prüfung. Der Test prüft nur die DB-Zeile und toleriert ein fehlendes `Set-Cookie` (`:220`, `|| sidNachSchritt1`) | **gemessen** (`scratchpad/h2probe_marker_cookie.js`, express-session 1.19.0 aus dem Bestand, Konfiguration wie `server.js`): Schritt 1 → `Set-Cookie … Expires=+5 min`; Marker → **kein Set-Cookie**. Quelltext `express-session/index.js:485-487` (`shouldSetCookie`), `:611-620` (`hash` ohne `cookie`) | **blockierend** |
| H2-D3 (F3) | 5c–5e aus falschem Grund grün (`.stub`-Signatur) | = H2-C2, unabhängig gefunden | hoch |
| H2-D4 (F4) | Offene Weiterleitung über `/\` | = H2-C1, unabhängig gefunden | blockierend |
| H2-D5 (F5) | 3a „zwei Tabs bekamen verschiedene Sitzungen“ kann nicht fallen (zwei cookielose Anfragen haben immer zwei Zufalls-IDs) und prüft nicht den echten Zwei-Tab-Fall mit gemeinsamem Cookie | gelesen | gering |
| H2-D6 (F6) | 8a prüfe eine Kette, die es in Produktion nicht gibt | **gefallen** (s. H2-D1: dieselbe Reihenfolge wie `server.js`) | — |
| H2-D7 (F7) | 8e schickt `weiter` direkt im POST-Körper; das echte Formular (verstecktes Feld → Absenden) wird nie gefahren | gelesen `test_feature_h2_cookie_schleife.js:396-402` | gering |
| H2-D8 (F8) | `/login/tablet` ohne Cookie legt weiter je Anfrage eine Zeile an (5 min statt 8 h) — Restfläche | im Auftrag so gewollt; Ratenbegrenzung ist Betreiber-Teil nach dem Merge | Anmerkung |

**Nacharbeit 1**: H2-C1/D4, H2-D2, H2-C2/D3, H2-D5, H2-D7.

## Nacharbeit 1 (`e7dfc41..6d537a5`) — gelesen, Runde 2 läuft

Executer: ein Commit; volle Suite `SUITE_EXIT=0`, Dateizahl 363 = 363, Lint 0, E2E 12/12, H2-Test 78/0. Gegenproben:
Zeichen-Riegel entfernt → 77/1 (nur der Fall `/module\x?nr=1` fällt — die vier Beispiele aus dem Auftrag fängt schon
der Origin-Riegel; der Executer hat den unterscheidenden Fall selbst gesucht und ergänzt); Merkmal-`delete` im Marker
entfernt → 74/4 (Set-Cookie fehlt); `pending2fa` im 400-Zweig gelöscht → 77/1 (5g). Produktivdiff selbst gelesen:
`core/auth.js` (zwei Riegel in beiden Filtern), `routes/auth.js` (`cookieUnbestaetigt` gesetzt/gelöscht). Die neue
Route `/_debug/sitzung` steht nur in der Test-App (`test_feature_h2_cookie_schleife.js:167`), nicht im Produktivcode.
Runde 2: eine Lesespur (DeepSeek) über die Nacharbeit, weil sie Verhalten ändert.
