# Bauauftrag H2: Weiterleitungsschleife ohne Cookies (Fassung 1, 23.09.2026)

**Zielrepo:** GymDocu, Zweig `fix-h2-cookie-schleife` ab master (nach den laufenden Beiträgen).
**Herkunft:** `plaene/haertung-weitere-moeglichkeiten-23-09-2026.md`, H2; Pentest-Vorbereitung.
**Modellwahl, VOR dem Auftrag entschieden:** Standard-Executer — eine Route, ein klarer
Ablauf, keine Sperren, keine Migration.
**Nach SUCHMUSTER arbeiten** (Zeilen = Stand `f4c0f07`).

## Befund (gemessen von aussen, 23.09.2026)

Ohne Cookies läuft eine Studio-Subdomain im Kreis: `/` → `requireLogin` → `/login/tablet` →
Sitzung angelegt und gespeichert → `/` → … (`curl -L` bricht nach 50 ab). Jeder Sprung
schreibt eine NEUE Zeile in die Sitzungstabelle (PostgreSQL-Store, Lebensdauer 8 h,
`saveUninitialized: false`, aber `/login/tablet` speichert ausdrücklich).

Fundstellen: `core/auth.js` `function requireLogin` (`res.redirect('/login/tablet')`),
`routes/auth.js` `router.get('/login/tablet'` (`req.session.save(() => res.redirect(weiter))`),
Sitzungs-Setup `server.js` `app.use(session({`.

**Folge:** ein Client ohne Cookies (Bot, Scanner, Pentest-Werkzeug) erzeugt ohne Anmeldung
beliebig viele Sitzungszeilen, die 8 h liegen bleiben; ein echter Benutzer mit gesperrten
Cookies sieht eine Browser-Fehlermeldung „zu viele Weiterleitungen" statt eines Hinweises.

## Entwurf

1. `GET /login/tablet` ohne Marker: Sitzung anlegen wie heute (Tablet-Rolle, `returnTo`
   bleibt IN der Sitzung), speichern, Weiterleitung auf `/login/tablet?c=1`.
2. `GET /login/tablet?c=1`:
   * Sitzung mit Tablet-Benutzer da (das Cookie kam zurück) → `returnTo` aus der Sitzung
     lesen, dieselbe Filterregel wie heute (nur interne Pfade, kein `/admin`, kein `/login`),
     löschen, weiterleiten.
   * keine Sitzung → Seite „Cookies erforderlich" mit HTTP 400, OHNE eine Sitzung anzulegen
     oder zu speichern. Text: dass die Anmeldung am Tablet Cookies braucht und wie man sie
     zulässt; ein Knopf „Erneut versuchen" auf `/login/tablet` (ohne Marker).
3. Schon angemeldet (`req.session.benutzer` vorhanden) → wie heute sofort weiter.
4. Der Kommentar zur ausdrücklichen Speicherung (verwaiste Zweit-Session beim PIN-POST) bleibt
   gültig und bleibt stehen.
5. `routes/tablet-sperre.js` verweist in Kommentaren auf `GET /login/tablet`
   („Wie GET /login/tablet …", „Dieselbe Pruefung wie /login/tablet (routes/auth.js:452)").
   Nachsehen, ob dort derselbe Ablauf nachgebaut ist; wenn ja, dieselbe Behebung, sonst die
   veraltete Zeilenangabe im Kommentar durch ein Suchmuster ersetzen.

## Nachweis (echte App, Wegwerf-DB, kein Netz)

* **Ohne Cookie-Speicher:** Kette `/` → `/login/tablet` → `/login/tablet?c=1` endet mit 400
  und dem Hinweis; Sitzungszeilen vorher/nachher: **genau +1** (vom ersten Sprung).
  **Gegenprobe:** Schritt 2 auf den alten Ablauf zurückdrehen → Kette endet nicht (Begrenzung
  im Test als Abbruch, nicht als Erfolgskriterium) und die Sitzungszahl wächst je Sprung.
* **Mit Cookie-Speicher:** landet auf `/` bzw. dem gemerkten Ziel; `returnTo` bleibt erhalten
  (ein Tablet-Pfad als Ziel, Positivkontrolle), `/admin…` und `//fremd` werden weiterhin
  verworfen.
* **Marker ohne Weg davor:** direkter Aufruf `/login/tablet?c=1` ohne Cookie → Hinweisseite,
  +0 Sitzungen.
* Browser-E2E-Suite läuft unverändert grün (Tablet-Einstieg über `/login/tablet`).
* Volle Suite, Dateizahl-Ritual, Lint.

## Server (Betreiber, nach dem Merge)

Ob `conf.d/00-login-ratelimit.conf` auch `/login/tablet` erfasst, ist von hier nicht
sichtbar. Befehl an den Betreiber: `grep -n "location\|limit_req" /etc/nginx/conf.d/00-login-ratelimit.conf /etc/nginx/sites-enabled/*`
— fehlt der Pfad, eine eigene `location = /login/tablet` mit derselben Zone.

## Offene Fragen an die Planprüfung

1. Welchen ZUSTAND erzeugt der zusätzliche Sprung, den es heute nicht gibt (zwei Tabs, abgelaufene
   Sitzung mitten im Ablauf, Offline-Service-Worker)?
2. Was wird SCHLECHTER (ein Sprung mehr bei jedem Tablet-Einstieg, Caching des Service Workers)?
3. Kann der Hinweis einem echten Benutzer MIT Cookies erscheinen?
