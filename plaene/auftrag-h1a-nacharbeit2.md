# Auftrag H1a Nacharbeit 2 (25.09.2026)

Grundlage: `plaene/diffpruefung-h1a.md`, Abschnitt „Runde 2“. Baum `/workspace/gymdocu-h1`, Zweig `fix-h1a-csp-enforce`,
Kopf `df2f500`. Reproduktionen der ausführenden Spur: `scratchpad/h1cc2/` (`harness.js`, `m1.js`, `b1_probe.js`,
`mut2.py`, `spec/*.json`) — vor dem Bau gegen deinen Stand laufen lassen, nach dem Bau erneut, beides wörtlich.
Einordnung: Standard (Tests, Kommentare, Einzeiler; kein neuer Mechanismus).

1. **H1a2-1:** Test über die ECHTE `server.js`-Kette (so geladen wie andere Tests, die `server.js` ohne Autostart
   benutzen): `POST /csp-bericht` mit `application/json` und `application/x-www-form-urlencoded`, je mit Zeitlimit,
   Soll 204. Gegenprobe: Mount zurück hinter die Body-Parser UND `readableEnded`-Rückfall entfernt → ROT; jede der
   beiden Mutationen einzeln darf grün bleiben (zwei Riegel) — alle drei Zahlen melden.
2. **H1a2-2:** H1a-8/1 misst den SERVER-Socket (`connection`-Ereignis, nach dem 413 `socket.destroyed`), Gegenprobe
   ohne `req.destroy()` → ROT.
3. **H1a2-3:** `redigiereDocumentUri` benutzt dieselbe Liste/Schwärzung wie `core/error-tracker.js` (dort ggf. exportieren)
   statt einer eigenen Regex — `/passwort-reset/:token`, `/mitarbeiter/pin-setzen/:token`, `/q`, `/d`, `/d/auth`, `/v`.
   Test je Route mit einem erfundenen Token, das im Log NICHT stehen darf; Gegenprobe je eine Route aus der Liste
   nehmen → ROT.
4. **H1a2-4:** `app.disable('x-powered-by')` global oben in `server.js`; Test: Antwort von `/csp-bericht` ohne
   `x-powered-by`.
5. **H1a2-5:** Logzeile so, dass kein frei wählbares Feld `ip=`/`ua=` vortäuschen kann (Absenderfelder zuerst und frei
   wählbare Felder ohne Leerzeichen, oder gequotet). Test mit dem Fälschungsfall aus R2-5.
6. **H1a2-6:** Literale 8192 und 5 in den Tests; Gegenprobe B9b/B3b → ROT.
7. **H1a2-7:** Einträge mit eigenem Schrägstrich (`/d/`, `/v/`) wirken wie vor dem Umbau (`startsWith(a)`, kein nackter
   Pfad); `/api`, `/intern`, `/csp-bericht` mit Segmentgrenze. Wächter-Zusicherung: `/d` und `/v` nackt → nicht
   ausgenommen; Gegenprobe → ROT.
8. **H1a2-8:** Crawler sammelt CSP-Verstösse über die Lebensdauer jeder Seite und wertet sie vor der nächsten Navigation
   bzw. beim Schliessen aus; die feste Wartezeit entfällt. Gegenprobe: Verstoss 1000 ms nach `load` (C3b) → ROT.
9. **H1a2-9/10:** Kommentare berichtigen (Liste in der Befundtabelle), Skip-Zahl 1; Gesamt-Skip des Crawlers bekommt
   denselben CI→FAIL-Zweig wie der Kanal-Schritt.

Einzeltests nur gegen eine EIGENE DB (`gymdocu_h1_test`), nie `gymdocu_test`. Volle Suite mit Dateizahl-Ritual.
Committen, pushen, kein PR.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab — besonders durch 3 (andere Schwärzung als bisher) und 7?

-- Ende des Auftrags --
