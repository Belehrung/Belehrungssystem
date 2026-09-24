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
