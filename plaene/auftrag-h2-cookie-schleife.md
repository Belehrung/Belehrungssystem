# Bauauftrag H2: Anonyme Sitzungen und Weiterleitungsschleife (Fassung 2, 23.09.2026)

**Zielrepo:** GymDocu, Zweig `fix-h2-cookie-schleife` ab dem dann aktuellen master.
**Herkunft:** `plaene/haertung-weitere-moeglichkeiten-23-09-2026.md`, H2; Pentest-Vorbereitung.
**Modellwahl, VOR dem Auftrag entschieden:** Standard-Executer — wenige Routen, keine Sperren,
keine Migration; die Falltabelle unten legt jeden Zweig fest.
**Nach SUCHMUSTER arbeiten** (Zeilen = Stand `f4c0f07`).
Planprüfung Fassung 1: `plaene/planpruefung-h2.md` (zwei Spuren, 17 Befunde, alle getragen).

## Befund (gemessen am Code und von aussen)

* Ohne Cookies läuft eine Studio-Subdomain im Kreis: `/` → `requireLogin` → `/login/tablet` →
  Sitzung gespeichert → `/` → … (`curl -L` bricht nach 50 ab).
* **Sitzungszeilen ohne Anmeldung entstehen auf vier Wegen**, nicht nur in der Schleife:
  `requireLogin` (`core/auth.js`, `returnToMerkenFallsGet` schreibt `returnTo` → die Sitzung ist
  verändert und wird gespeichert, trotz `saveUninitialized: false`), `requireAdmin` (dasselbe),
  `GET /login/tablet` (speichert ausdrücklich), `GET /tablet/freischalten`
  (`routes/tablet-sperre.js`, speichert auch bei UNGÜLTIGEM Token). Jede Zeile lebt 8 h.
* `req.session.save(() => …)` in `/login/tablet` ignoriert Store-Fehler.
* Der Tablet-Filter für das Rücksprungziel lässt `/favicon.ico` und andere Dateipfade durch
  (anders als `sicheresReturnTo` für Admin, `routes/auth.js`).

## Entwurf — vollständige Falltabelle

1. **`requireLogin`, GET ohne Anmeldung:** KEIN Schreiben in die Sitzung. Weiterleitung auf
   `/login/tablet?weiter=<Pfad+Query, URL-kodiert>`, sofern das Ziel den Tablet-Filter besteht
   (interner Pfad, kein `//`, kein `/admin`, kein `/login`, KEIN Datei-/Iconpfad — `favicon`,
   `apple-touch-icon`, Endungen `.ico .png .jpg .svg .js .css .map .webmanifest`); sonst ohne
   `weiter`. Nicht-GET wie heute. Der Filter ist EINE Funktion, von beiden Stellen benutzt.
2. **`requireAdmin`:** schreibt `returnTo` nur noch, wenn die Anfrage bereits ein
   Sitzungs-Cookie mitbringt (Name aus dem Sitzungs-Setup in `server.js`, gemessen, nicht
   geraten). Ein ganz frischer Browser ohne Cookie landet nach dem Admin-Login auf `/admin`
   statt am tiefen Ziel — bewusst hingenommen, im Kommentar benannt.
3. **`GET /login/tablet` ohne `c`:**
   * angemeldet (beliebige Rolle) → wie heute weiter (`/`);
   * sonst: Tablet-Sitzung anlegen, `weiter` (erneut durch den Filter) in der Sitzung merken,
     **Lebensdauer der Sitzung 5 Minuten** (`req.session.cookie.maxAge`), speichern; bei
     Speicherfehler → 500-Seite „Anmeldung konnte nicht gespeichert werden", `melde()`, KEINE
     Weiterleitung; sonst Weiterleitung auf `/login/tablet?c=1`.
4. **`GET /login/tablet?c=1`** — dieser Zweig steht VOR „schon angemeldet":
   * Tablet-Sitzung vorhanden (das Cookie kam zurück) → Lebensdauer auf 8 h setzen, gemerktes
     Ziel lesen, löschen, speichern (Fehler wie oben), weiterleiten (Ziel oder `/`);
   * angemeldete Nicht-Tablet-Sitzung (Admin) → `/admin`;
   * sonst (keine Sitzung, oder Sitzung ohne `benutzer`) → Hinweisseite, **HTTP 400**,
     `Cache-Control: no-store`, OHNE die Sitzung zu verändern. Text wahrheitsgemäss:
     „Die Anmeldung konnte nicht bestätigt werden. Bitte Cookies für diese Seite zulassen und
     dann ‚Erneut versuchen' tippen — ein Neuladen dieser Seite genügt nicht." Knopf auf
     `/login/tablet` ohne Marker. Kein Meta-Refresh (erzeugte eine neue Schleife).
5. **`GET /tablet/freischalten`:** ungültiger Token → Sperrseite mit Fehlermeldung DIREKT
   rendern (die Meldung steht in `req.query`, braucht keine Sitzung), KEINE Sitzung anlegen;
   gültiger Token → wie heute (Sitzung + Geräte-Cookie), Speicherfehler behandeln wie in 3.
6. Veraltete Zeilenangaben in Kommentaren, die auf `/login/tablet` zeigen
   (`routes/tablet-sperre.js`: „routes/auth.js:452"), durch ein Suchmuster ersetzen.

## Nachweis (Wegwerf-DB; Sitzungen sid-basiert, nicht über eine globale Zahl)

Jede Antwort wird mit ihren `Set-Cookie`-Kopfzeilen ausgewertet (der Server sendet sie, der
cookielose Client ignoriert sie); geprüft wird, WELCHE `sid` in der `session`-Tabelle stehen —
immun gegen Pruner und fremden Verkehr. Die Tabelle hat keine `studio_id`; die Proben laufen
gegen eine eigene Wegwerf-DB.

* **Ohne Cookie-Speicher, ab `/`:** Kette `/` → `/login/tablet?weiter=/` →
  `/login/tablet?c=1` → 400 mit Hinweis; neu angelegte sid: GENAU EINE (aus Schritt 3), mit
  Lebensdauer ≤ 5 min. Gegenprobe: Schritt 1 auf das alte `returnTo`-Schreiben zurück → zwei
  sids, rot.
* **Ohne Cookie-Speicher, ab einem tiefen Tablet-Pfad mit Query:** das `weiter` im ersten
  `Location` ist genau dieser Pfad samt Query.
* **Mit Cookie-Speicher, ab tiefem Tablet-Pfad:** `Location` der Marker-Antwort ist genau das
  Ziel; die Sitzung hat danach 8 h. Gegenprobe: Ziel im Marker-Zweig auf `/` festnageln → rot.
  Gegenprobe: die beiden Zweige (Marker / „schon angemeldet") vertauschen → rot.
* **Filter:** `//fremd`, `/admin/x`, `/login`, `/favicon.ico`, `/apple-touch-icon.png` → kein
  `weiter`; ein erlaubter Pfad → vorhanden. Positivkontrolle und Negativfälle je einzeln.
* **Marker direkt ohne Vorlauf** → 400, keine neue sid; **Marker mit Sitzung ohne `benutzer`**
  → 400, sid unverändert, Inhalt unverändert.
* **Speicherfehler:** Store-Attrappe liefert beim Speichern einen Fehler → 500, keine
  Weiterleitung, kein Hinweis „Cookies", `melde()` (Attrappe) genau einmal.
* **Freischaltweg:** ungültiger Token ohne Cookie → Fehlermeldung sichtbar, KEINE neue sid;
  gültiger Token → wie heute.
* **`requireAdmin`:** ohne Cookie → keine neue sid; mit Sitzungs-Cookie → `returnTo` gespeichert
  wie heute (Positivkontrolle).
* Browser-E2E-Suite grün; ein zusätzlicher Browserfall: Tablet-Einstieg über einen tiefen Pfad
  landet dort.
* Volle Suite, Dateizahl-Ritual, Lint, Marker-Scan.

## Server (Betreiber, nach dem Merge) — Pflichtteil

1. nginx-Ratenbegrenzung für `/login/tablet` und `/tablet/freischalten` prüfen
   (`grep -n "location\|limit_req" /etc/nginx/conf.d/00-login-ratelimit.conf /etc/nginx/sites-enabled/*`)
   und, wo sie fehlt, ergänzen — mit der Zahl zwei Anfragen je normalem Tablet-Einstieg.
2. Überwachung: falls eine Studio-Subdomain ohne Cookies abgefragt wird, sieht sie künftig 400
   statt einer Schleife. Ein sitzungsfreier 200-Endpunkt ist `/login`.
