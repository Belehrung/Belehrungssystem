# Planprüfung H2 (Cookie-Schleife), Fassung 1 — 23.09.2026

Papier: `plaene/auftrag-h2-cookie-schleife.md`.

## Spur A (`gpt-6-sol`, Repo-Lesezugriff) — nachgemessen (A1, A3, A5, A7 am Code; Rest am Kontrollfluss), alle getragen

| # | Schwere | Befund |
|---|---|---|
| H2-A1 | blockierend | Sollzahl „+1" falsch: `requireLogin` speichert schon über `returnTo` eine anonyme Sitzung → ab `/` sind es +2, direkt ab `/login/tablet` +1 |
| H2-A2 | mittel | „`/admin…` und `//fremd` verworfen" wäre auch bei bedingungslosem Redirect auf `/` grün; E2E prüft den Marker-Sprung nicht |
| H2-A3 | blockierend | `req.session.save(() => …)` ignoriert Store-Fehler → DB-Fehler erscheint als „Cookies erforderlich" |
| H2-A4 | mittel | `session`-Tabelle ohne `studio_id`; globale Zählung ist keine mandantenscharfe Aussage |
| H2-A5 | blockierend | Neuer Zwischenzustand „Tablet-Sitzung da, `returnTo` unverbraucht": der Zweig „schon angemeldet → `/`" vor dem Marker verliert das Ziel |
| H2-A6 | mittel | Hinweis erscheint auch MIT Cookies (direkter Marker, abgelaufene Sitzung, zweiter Tab regeneriert) — Text darf keine sichere Cookie-Diagnose behaupten |
| H2-A7 | mittel | Anonyme Sitzungszeilen entstehen auf mehr Wegen (jeder geschützte GET über `returnTo`, `GET /tablet/freischalten` auch bei ungültigem Token) |
| H2-A8 | mittel | Offline-Seite des Service Workers lädt die Marker-URL neu; zwei Tabs teilen `returnTo` |
| H2-A9 | mittel | Echte PG-Zählung passt nicht zum Gate; nginx-Limit zählt künftig zwei Sprünge je Einstieg |

## Spur B (`kimi-k3`, Bündel: Login-Weg, `core/auth.js`, Sitzungs-Setup, Freischaltweg, Service Worker) — nachgemessen

1010 s, 19.344 ein / 33.928 aus (27.317 Denken). Acht Befunde, alle getragen.

| # | Schwere | Befund | Überschneidung |
|---|---|---|---|
| H2-B1 | blockierend | „+1" falsch, ab `/` +2; Vorschlag: Ziel als geprüfter Query-Parameter statt in der Sitzung | = A1, Vorschlag neu |
| H2-B2 | mittel | Zeilen ohne Anmeldung auch ohne Schleife (jeder anonyme geschützte GET, `requireAdmin`, `/tablet/freischalten` bei ungültigem Token); H2 dämpft nur | ≈ A7 |
| H2-B3 | mittel | Freischaltweg: Fehlerfall braucht keine Sitzung (Meldung steht in `req.query`) → direkt rendern | neu |
| H2-B4 | mittel | Falltabelle für `?c=1` unvollständig (Sitzung ohne `benutzer`, Admin-Sitzung, Zweigreihenfolge) | ≈ A5 |
| H2-B5 | gering | Hinweis erscheint auch mit Cookies (Neuladen der 400-Seite, Lesezeichen, geprunte Zeile) | ≈ A6 |
| H2-B6 | gering | globale Zählung ohne `studio_id`, Pruner — sid-basiert nachweisen | ≈ A4 |
| H2-B7 | gering | `returnTo`-Überschreiben durch Icon-Anfragen: Tablet-Filter lässt `/favicon.ico` durch, Fenster verdoppelt sich | neu (`sicheresReturnTo` filtert nur für Admin, `routes/auth.js:971-979`) |
| H2-B8 | gering | Überwachung ohne Cookies sieht künftig 400 | neu |

**Folge:** Fassung 2 des Papiers (Ziel als Query-Parameter, kurze Lebensdauer unbestätigter
Sitzungen, Freischalt-Fehler ohne Sitzung, `requireAdmin` schreibt nur mit Sitzungs-Cookie).

---

# Runde 2 (Fassung 2)

## Spur A (`gpt-6-sol`, Repo-Lesezugriff) — nachgemessen

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| R2-A1 | blockierend | Bestehender Gate-Test verlangt `returnToMerkenFallsGet` an GENAU zwei Stellen und nach `GET /login/tablet` sofort `/`; Session-Attrappe ohne `cookie` | `test_feature_qr_trainer_defekt.js:677-737` gelesen | ja — fachlich umstellen, Kernaussage (POST merkt nichts) erhalten |
| R2-A2 | mittel | Browserfall „landet dort" grün aus falschem Grund, wenn der Helfer vorher schon angemeldet hat; Sollzahl literal | `e2e/helpers/ui.js:56-65` | ja |
| R2-A3 | mittel | „Sitzung ohne `benutzer`" als leeres Objekt ist tautologisch; realer Vorzustand: gespeicherte `pending2fa`-Sitzung | `routes/auth.js:1031-1035` | ja |
| R2-A4 | blockierend | Direkt gerenderte Sperrseite (ungültiger Freischalt-Link) bietet ein PIN-Formular, das ohne Tablet-Sitzung an `requireLogin` scheitert | Kontrollfluss | ja |
| R2-A5 | mittel | Gültiger Link wird VOR dem Sitzungs-Speichern verbraucht; ein 500 bei Speicherfehler macht ihn nicht wieder benutzbar | `core/tablet-geraet.js:136-157` | ja — das Geräte-Cookie ist schon gesetzt, der Weg über `/login/tablet` führt weiter |
| R2-A6 | mittel | Hinweis auch bei erlaubten Cookies (direkter Aufruf, abgelaufene Zwischensitzung) — Text als MÖGLICHE Ursache | — | ja |
| R2-A7 | mittel | Cookie-KOPF beweist keine geladene Sitzung (erfundenes/abgelaufenes `connect.sid`) → `requireAdmin` schriebe weiter anonyme Zeilen | express-session erzeugt bei unbekannter sid eine neue | ja — Fassung 3: Ziel für Admin ebenfalls als Parameter, keine Sitzung |
| R2-A8 | mittel | Ziel in der Sitzung zwischen zwei Sprüngen: zwei Tabs, PIN-Sperre schreibt ihr eigenes `returnTo` (`server.js:806-809`) | gelesen | ja — Fassung 3: Ziel auch über den Marker-Sprung als Parameter |
| R2-A9 | gering | Befund-Formulierung: `pending2fa` vor 2FA, Archiv-Anmeldung; QR-Einstiege zeigen direkt auf `/login/tablet` | gelesen | ja |
