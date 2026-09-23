# Planprüfung H2 (Cookie-Schleife), Fassung 1 — 23.09.2026

Papier: `plaene/auftrag-h2-cookie-schleife.md`.

## Spur A (`gpt-6-sol`, Repo-Lesezugriff) — Nachmessung ausstehend bis Spur B

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
