# Bauauftrag H2: Anonyme Sitzungen und Weiterleitungsschleife (Fassung 3, 23.09.2026)

**Zielrepo:** GymDocu, Zweig `fix-h2-cookie-schleife` ab dem dann aktuellen master.
**Herkunft:** `plaene/haertung-weitere-moeglichkeiten-23-09-2026.md`, H2; Pentest-Vorbereitung.
**Modellwahl, VOR dem Auftrag entschieden:** Standard-Executer — wenige Routen, keine Sperren,
keine Migration; die Falltabelle legt jeden Zweig fest.
**Nach SUCHMUSTER arbeiten** (Zeilen = Stand `f4c0f07`).
Planprüfung: `plaene/planpruefung-h2.md` (zwei Runden, je zwei Spuren). Alle getragenen Befunde
sind Anforderungen; die nicht getragenen stehen dort mit Begründung.

## Befund

* Ohne Cookies läuft eine Studio-Subdomain im Kreis: `/` → `requireLogin` → `/login/tablet` →
  Sitzung gespeichert → `/` → … (`curl -L` bricht nach 50 ab).
* **Sitzungszeilen OHNE Zugangsdaten** entstehen heute auf vier Wegen: `requireLogin` und
  `requireAdmin` (`returnToMerkenFallsGet` verändert die Sitzung → sie wird gespeichert, trotz
  `saveUninitialized: false`), `GET /login/tablet` (speichert ausdrücklich),
  `GET /tablet/freischalten` (speichert auch bei UNGÜLTIGEM Token). Jede Zeile lebt 8 h.
  Davon zu unterscheiden und NICHT Gegenstand: `pending2fa` nach richtigem Passwort, die
  Archiv-Anmeldung (`dArchivAuth`) — beide erst nach geprüften Zugangsdaten.
* `req.session.save(() => …)` in `/login/tablet` ignoriert Store-Fehler.
* Der Tablet-Filter für das Rücksprungziel (`/^\/(?!\/|admin|login)/`, an zwei Stellen:
  `routes/auth.js` `/login/tablet` und `routes/tablet-sperre.js` PIN-Erfolg) lässt
  `/favicon.ico` und andere Dateipfade durch.
* `requireTabletOrAdmin` (`core/auth.js`) ist exportiert, hat aber keinen Aufrufer (gemessen).

## Entwurf

**Grundsatz: das Rücksprungziel reist als geprüfter Query-Parameter `weiter`, nie in einer
Sitzung, die ein Anonymer anlegt.** (Der ursprüngliche Pfad steht ohnehin schon in den
Zugriffslogs der ersten Anfrage; es wird nichts preisgegeben, was nicht schon dort steht.)

1. **Ein Filter, eine Funktion** in `core/auth.js` (z. B. `erlaubtesTabletZiel(pfad)`): interner
   Pfad, kein `//`, kein `/admin`, kein `/login`, kein Datei-/Iconpfad (`favicon`,
   `apple-touch-icon`, Endungen `.ico .png .jpg .jpeg .svg .webp .js .css .map .webmanifest`);
   liefert den Pfad oder `null`. Benutzt von `requireLogin`, `/login/tablet` und dem PIN-Erfolg in
   `routes/tablet-sperre.js` (dort ersetzt er die zweite Kopie der Regex).
2. **`requireLogin`, GET ohne Anmeldung:** KEIN Schreiben in die Sitzung. Weiterleitung auf
   `/login/tablet?weiter=<kodiert>`, wenn der Filter das Ziel zulässt, sonst `/login/tablet`.
   Nicht-GET: `/login/tablet` ohne Ziel (wie heute: ein POST-Pfad ist nie ein Ziel).
3. **`requireAdmin`:** KEIN Schreiben in die Sitzung. Weiterleitung auf
   `/login?weiter=<kodiert>` für GET (Prüfung mit `sicheresReturnTo`), sonst `/login`.
   `GET /login` trägt `weiter` (erneut geprüft) als verstecktes Feld im Formular;
   `POST /login` liest es aus dem Rumpf, prüft es mit `sicheresReturnTo` und setzt es NACH der
   Passwortprüfung wie heute als `returnTo` in die regenerierte Sitzung. Damit bleiben tiefe
   Admin-Ziele auch in einem frischen Browser erhalten.
4. **`GET /login/tablet` ohne `c`:**
   * `benutzer` vorhanden → Admin nach `/admin`, jede andere Rolle nach dem geprüften `weiter`
     oder `/`;
   * sonst: Tablet-Sitzung anlegen, **Lebensdauer 5 Minuten** (`req.session.cookie.maxAge`),
     speichern; Speicherfehler → 500-Seite „Anmeldung konnte nicht gespeichert werden",
     `melde()`, KEINE Weiterleitung; sonst Weiterleitung auf
     `/login/tablet?c=1&weiter=<dasselbe geprüfte Ziel>`.
5. **`GET /login/tablet?c=1`** — steht VOR jedem anderen Zweig:
   * Tablet-Sitzung vorhanden → Lebensdauer auf 8 h, speichern (Fehler wie oben), Weiterleitung
     auf das geprüfte `weiter` oder `/`;
   * andere angemeldete Rolle → wie in 4 (Admin `/admin`, sonst `/`);
   * sonst (keine Sitzung oder Sitzung ohne `benutzer`, z. B. `pending2fa`) → Hinweisseite
     **HTTP 400**, `Cache-Control: no-store`, OHNE die Sitzung zu verändern. Text als MÖGLICHE
     Ursache: „Die Anmeldung konnte nicht bestätigt werden — womöglich lässt der Browser keine
     Cookies zu, oder die Anmeldung ist abgelaufen. Bitte Cookies für diese Seite zulassen und
     ‚Erneut versuchen' tippen; ein Neuladen dieser Seite genügt nicht." Knopf auf
     `/login/tablet` (mit demselben geprüften `weiter`). Kein Meta-Refresh.
6. **`GET /tablet/freischalten`:**
   * ungültiger Token → eine NICHT interaktive Fehlerseite (kein PIN-Formular — ohne
     Tablet-Sitzung liefe es an `requireLogin` auf) mit Knopf auf `/login/tablet`; KEINE
     Sitzung;
   * gültiger Token → wie heute; scheitert NUR das Speichern der Sitzung, ist das Gerät bereits
     freigeschaltet (Link verbraucht, Geräte-Cookie gesetzt): dann eine Erfolgsseite mit Knopf
     auf `/login/tablet`, `melde()`, kein 500.
7. **`requireTabletOrAdmin`** ohne Aufrufer entfernen (samt Export); vorher erneut messen, dass
   es keinen Aufrufer gibt.
8. Veraltete Zeilenangaben in Kommentaren auf `/login/tablet` durch Suchmuster ersetzen.

## Bestehende Tests, die das Gegenteil zusichern (fachlich umstellen, nicht streichen)

* `test_feature_qr_trainer_defekt.js` (Abschnitt um `returnToMerkenFallsGet`): verlangt „genau
  zwei Aufrufe" und nach `GET /login/tablet` sofort `/`. Umstellen auf: kein Schreiben von
  `returnTo` durch `requireLogin`/`requireAdmin`; ein POST liefert kein `weiter`; die Kette
  endet über den Marker-Sprung auf dem gefilterten Ziel. Die KERNAUSSAGE (ein POST-Pfad ist nie
  ein Ziel) bleibt als Zusicherung erhalten.
* Weitere Tests, die `returnTo`, `/login/tablet` oder `requireTabletOrAdmin` zusichern: der
  Executer sucht sie selbst (`grep`) und nennt die Liste mit der jeweiligen Umstellung.

## Nachweis (eigene Wegwerf-DB)

Sitzungen werden über die `sid` aus den `Set-Cookie`-Kopfzeilen der Antworten verfolgt (der
Server sendet sie, der cookielose Client ignoriert sie). Die `session`-Tabelle ist die
Rahmentabelle von `connect-pg-simple` ohne `studio_id`; Abfragen darauf laufen nur in der
Wegwerf-DB und nur über `sid`.

* **Ohne Cookie-Speicher, ab `/`:** Kette `/` → `/login/tablet?weiter=/` →
  `/login/tablet?c=1&weiter=/` → 400 mit Hinweis. Neue sids: **GENAU EINE** (literal), ihr
  `expire` unmittelbar NACH Schritt 2 ≤ jetzt + 5 min. Gegenprobe: `requireLogin` schreibt
  wieder `returnTo` → zwei sids, rot.
* **Mit Cookie-Speicher, frischer Kontext, ab tiefem Tablet-Pfad samt Query:** erstes
  `Location` enthält genau diesen Pfad als `weiter`; Marker-Antwort leitet genau dorthin; `expire`
  danach ≈ jetzt + 8 h (getrennt zu den beiden Zeitpunkten gemessen). Gegenproben: Ziel im
  Marker-Zweig auf `/` festnageln → rot; Marker-Zweig hinter „angemeldet" verschieben → rot.
* **Zwei Tabs:** zwei verschiedene tiefe Ziele verschränkt → jeder Tab landet auf SEINEM Ziel.
* **Filter:** `//fremd`, `/admin/x`, `/login`, `/favicon.ico`, `/apple-touch-icon.png`,
  `/x.js` → kein `weiter`; ein erlaubter Pfad → vorhanden. Je einzeln, Positivkontrolle dabei.
  Derselbe Filter am PIN-Erfolg (`/favicon.ico` als gemerktes Ziel → `/`).
* **Marker direkt** (ohne Vorlauf) → 400, keine neue sid. **Marker mit gespeicherter
  `pending2fa`-Sitzung und einem Merkfeld** → 400, sid und vollständiger `sess`-Inhalt
  unverändert (Vergleich vorher/nachher; die Zusicherung fällt, wenn der Zweig ein Feld löscht).
* **Speicherfehler:** Store-Attrappe liefert beim Speichern einen Fehler → 500, keine
  Weiterleitung, kein Cookie-Hinweis, `melde()` (Attrappe) genau einmal.
* **Freischaltweg:** ungültiger Token ohne Cookie → Fehlerseite ohne PIN-Formular, KEINE neue
  sid; gültiger Token mit gestörtem Speichern → Erfolgsseite, Gerätezeile angelegt, Geräte-Cookie
  gesetzt, `melde()` einmal.
* **Admin:** `/admin/…` ohne Cookie → `/login?weiter=/admin/…`, KEINE neue sid; Formular trägt
  das Ziel; nach Passwort + 2FA landet der Admin dort. Gegenprobe: das versteckte Feld entfernen
  → Landung auf `/admin`, rot.
* **Browser-E2E:** ein zusätzlicher Fall mit FRISCHEM Kontext ohne vorheriges Login: tiefer
  Tablet-Pfad → PIN-Sperre bzw. Ziel. Die bestehenden E2E-Fälle bleiben grün.
* Volle Suite, Dateizahl-Ritual, Lint, Marker-Scan.

## Server (Betreiber, nach dem Merge) — Pflichtteil

1. Wirksame nginx-Ratenbegrenzung für `/login/tablet`, `/login` und `/tablet/freischalten`
   prüfen (`nginx -T | grep -n "limit_req\|location"`) und mit einem echten Tablet-Einstieg (zwei
   Anfragen) gegenmessen; wo sie fehlt, ergänzen.
2. Überwachung: eine Studio-Subdomain ohne Cookies sieht künftig 400 statt einer Schleife;
   sitzungsfreier 200-Endpunkt ist `/login`.

# NACHARBEIT 1 (Diffprüfung Runde 1, `plaene/diffpruefung-h2.md`)

Einordnung: normaler Auftrag, derselbe Executer. Ort `/workspace/gymdocu-h2`, HEAD `e7dfc41`.

1. **H2-C1 — offene Weiterleitung.** `erlaubtesTabletZiel()` lässt `/\evil.com` durch; `Location: /\evil.com` löst der
   Browser als `https://evil.com/` auf (gemessen). Ablehnen: jeder Backslash und jedes Steuerzeichen
   (`/[\\\x00-\x1f\x7f]/`), dazu als zweiter Riegel: `new URL(pfad, 'http://ziel.invalid')` muss denselben Origin
   behalten. Dieselben zwei Riegel in `sicheresReturnTo()`. Zusicherungen je einzeln, mit Positivkontrolle:
   `/\evil.com`, `/\\evil.com/x`, `/%5Cevil.com` als Query-Wert (kommt dekodiert an), Tab, Zeilenumbruch — plus die
   GANZE Kette `GET /login/tablet?weiter=%2F%5Cevil.com` → Schritt 1 → Marker → letzte `Location` bleibt auf dem Host.
   Gegenprobe: Backslash-Riegel entfernt → rot.
2. **H2-D2 — Marker-Antwort ohne neues Cookie (blockierend).** Nur `cookie.maxAge` zu ändern macht die Sitzung für
   express-session nicht „geändert“ (Hash ohne `cookie`, `rolling` aus) → kein `Set-Cookie`, der Browser behält das
   5-Minuten-Cookie. Gemessen: `scratchpad/h2probe_marker_cookie.js`. Behebung: der Marker-Schritt ändert den
   SITZUNGSINHALT (z. B. Schritt 1 setzt ein Merkmal „Cookie unbestätigt“, der Marker entfernt es), sodass
   express-session ein neues Cookie mit 8 h ausstellt. Kein `rolling` für die ganze Anwendung. Zusicherung: die
   Marker-Antwort trägt `Set-Cookie` für DIESELBE sid mit `Expires` ≈ jetzt + 8 h (Toleranz 2 min) — der Rückfall
   `|| sidNachSchritt1` (`:220`) entfällt. Gegenprobe: Inhaltsänderung entfernt → rot. Prüfe zusätzlich: bleibt die
   DB-Zeile nach Schritt 1 bei ≤ 5 min (1i)?
3. **H2-C2 — 5c–5e aus falschem Grund grün.** Das Cookie `s:<sid>.stub` hat eine falsche Signatur, die
   `pending2fa`-Sitzung wird nie geladen (gemessen: `scratchpad/h2probe_stubcookie.js`). Richtig signieren
   (`cookie-signature` mit dem Test-Geheimnis) UND Positivkontrolle, dass der Server genau diese Sitzung lädt.
   Gegenprobe: im 400-Zweig des Markers `pending2fa` löschen → 5e rot.
4. **H2-D5 — 3a kann nicht fallen.** Ersetzen durch den echten Zwei-Tab-Fall mit GEMEINSAMEM Cookie: der zweite Tab
   erreicht sein Ziel direkt, ohne neue sid.
5. **H2-D7 — 8e umgeht das Formular.** Das Formular aus der HTML-Antwort von `GET /login?weiter=…` lesen und mit allen
   seinen Feldern absenden (versteckt + E-Mail + Passwort), dann 2FA → Landung auf dem Ziel. Gegenprobe: verstecktes
   Feld aus `routes/auth.js` entfernt → rot.

**Gegenproben** je Punkt ROT/GRÜN wörtlich; **Abschluss** wie gehabt (volle Suite mit `SUITE_EXIT`, Dateizahl-Ritual,
Lint, E2E, Marker-Scan, Commit, Push). Die Umgebungsänderungen aus dem Bau (Rolle `gymdocu_h2test`, `/etc/hosts`)
dürfen bleiben; kein erneutes `playwright install`.
