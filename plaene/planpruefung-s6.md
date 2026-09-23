# Planprüfung S6 (Generationszähler), Fassung 1 — 23.09.2026

Papier: `plaene/auftrag-s6-token-einloesen.md`, Abschnitt „BAUAUFTRAG S6 (Fassung 1)".

## Spur A (`gpt-6-sol`, Repo-Lesezugriff) — nachgemessen

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| S6-A1 | blockierend | `test/helfer/db-stoerung.js` stört nur `db.q`; der Admin-Hausputz und das Token-DELETE laufen über `db.run` → der Nachweis prüft die Generation gar nicht | Helfer gelesen: `mitGestoertemQZaehlend` ersetzt ausschliesslich `db.q` | ja |
| S6-A2 | blockierend | Zwei nacheinander ausgegebene Links sind nie beide offen (die Ausgabe entwertet zuerst); ein serieller zweiter POST erreicht das Vergleich-und-Setzen nie | `routes/mitarbeiter-auth.js:184` entwertet vor dem INSERT | ja |
| S6-A3 | mittel | Sollmenge des Wächters muss von Hand stehen; dynamischer Schreibweg fehlt | — | ja |
| S6-A4 | blockierend | Altbestand über Berliner TEXT-Zeit: Sommerzeit-Rückstellung kehrt die Ordnung um → altes Token bleibt gültig | Spalten TEXT, Ortszeit (`core/db.js:526-527`) | ja — Fassung 2 verzichtet auf jeden Zeitvergleich |
| S6-A5 | blockierend | `NULL` in `pin_gesetzt_am`/`erstellt_am` fällt durch den Vergleich | Spalten nullable | ja — entfällt mit Fassung 2 |
| S6-A6 | blockierend | Schlafendes Token: Deaktivieren (API-Sync `routes/api.js:307`, Webhook `routes/webhooks.js:324/332`) ohne Generationswechsel, Reaktivierung (`api.js:277`, `webhooks.js:289/296`) macht es wieder gültig; der API-Sync entwertet gar keine Tokens | Fundstellen gelesen | ja |
| S6-A7 | blockierend | `S20-migrate.js` kopiert `mitarbeiter` und `mitarbeiter_token` dynamisch (`mitarbeiter_token: ["mitarbeiter_id"]`, Zeile 147) — nach 0059 bekommen importierte Tokens Generation 0 | Fundstelle gelesen | ja |
| S6-A8 | mittel | `INSERT … SELECT` mit 0 Zeilen wirft nicht → ohne `rowCount`-Prüfung geht die Mail trotzdem raus | Postgres-Semantik | ja |
| S6-A9 | blockierend | JOIN an `SELECT *` macht `studio_id` mehrdeutig und projiziert `m.id` → Verbrauch träfe womöglich die Mitarbeiter-ID | `routes/mitarbeiter-auth.js:240`, `:296` | ja |
| S6-A10 | mittel | „Heute kein Verklemmungskreis" ist falsch: zwei gültige Tokens, zwei parallele Einlösungen → A→Mitarbeiter→B gegen B→Mitarbeiter | Sperrfolge `mitarbeiter-auth.js:296/299/301` | ja (Ableitung, am Code belegt) |

Kosten laut Werkzeug in `ASTRA-LAEUFE.md`.

## Folge für Fassung 2 (nach Spur B)

* Kein Zeitvergleich mehr. Altbestand: jedes offene Token eines Mitarbeiters MIT PIN oder
  ohne aktiven Mitarbeiter bekommt `-1`.
* Generation steigt auch beim Deaktivieren (API-Sync, Webhook).
* `S20-migrate.js`: importierte offene Tokens ungültig.
* Einlöse-Transaktion ohne die Entwertung der übrigen Tokens (sie wird Hausputz nach dem
  Commit) — das schliesst den bestehenden Kreis A10.
* `SELECT t.*`, qualifizierte Spalten, `rowCount` am INSERT, zählender `db.run`-Störhelfer.

## Spur B (`kimi-k3`, Bündel: Einlöse- und Erzeugerweg vollständig, Admin-Weg, Webhook, Schema) — nachgemessen

1062 s, 26.156 ein / 40.165 aus (31.978 Denken).

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| S6-B1 | mittel | Das dritte UPDATE (übrige Tokens entwerten) bleibt in der Einlöse-Transaktion → „gestörtes Entwerten" rollt die ganze Einlösung zurück, der Nachweis ist unbaubar | `routes/mitarbeiter-auth.js:301` in derselben `db.tx` | ja (deckt sich im Mittel mit S6-A10) |
| S6-B2 | mittel | Gegenprobe „beide Riegel" belegt Riegel 2 (Vergleich-und-Setzen) nie; alle Tests enden am Leser | Kontrollfluss gelesen | ja — Fenstertest + Einzelgegenproben |
| S6-B3 | mittel | Sommerzeit: unsichere Richtung existiert; `erstellt_am NULL` fällt durch | = S6-A4/A5 | ja |
| S6-B4 | gering–mittel | INSERT mit 0 Zeilen committet das Entwerten und meldet „keine E-Mail" | Tx-Reihenfolge gelesen | ja |
| S6-B5 | mittel | Kreisfreiheit hängt auch daran, dass der Erzeuger die Mitarbeiterzeile NIE sperrt (kein `FOR UPDATE`, kein FK) | kein FK in Schema und Migrationen (gemessen) | ja |
| S6-B6 | gering | Tot geborenes Token (Generation ändert sich zwischen INSERT und Mail) | READ COMMITTED | ja |
| S6-B7 | gering | Reaktivierung nach gescheitertem Webhook-Hausputz; Webhook-Entwerten wirft | = S6-A6 (Spur A stärker: API-Sync entwertet gar nicht) | ja |
| S6-B8 | gering | Wächterregel „jeder Leser mit `verwendet=0`" trifft auch Entwerter/Verbrauch | Regeltext | ja |
| S6-B-A5 | — | Deploy-Fenster alte App / neue Migration | pm2 `exec_mode: 'fork'`, `instances: 1` (`ecosystem.config.js`), Migration beim Start | nein (praktisch kein Fenster) |

Überschneidung: B1≈A10, B3≈A4/A5, B7≈A6, B4≈A8. Nur bei B: B2, B5, B6, B8.

**Folge:** Fassung 2 im Papier; zweite Planprüfung, weil die Umgestaltung Verhalten ändert.

---

# Runde 2 (Fassung 2) — 23.09.2026

## Spur A (`gpt-6-sol`, Repo-Lesezugriff) — nachgemessen

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| R2-A1 | blockierend | Zwei weitere Deaktivierer: die Webhook-Upserts schreiben `aktiv = $3`/`$2` aus `status === 'INACTIVE' ? 0 : 1` — Sollmenge „3" falsch, heute 5 | `routes/webhooks.js:261`, `:289-299` gelesen | ja |
| R2-A2 | blockierend | Gegenprobe „nur Leser-Bedingung gestrichen → Fenstertest rot" ist umgekehrt; der Leser-Riegel zeigt sich am GET eines VOR dem Lesen veralteten Tokens | Kontrollfluss | ja |
| R2-A3 | blockierend | Webhook-Deaktivierer: Gegenprobe „Generationserhöhung weg" bleibt grün, weil der Hausputz (`verwendet=1`) als zweiter Riegel fängt | `routes/webhooks.js:339-345` | ja |
| R2-A4 | mittel | Erzeuger entwertet über `t.run` — ein `db.run`-Stub trifft dort nie; ein echter Fehler rollt alles zurück | `core/db.js:441-447` (`t.run` = `client.query`) | ja |
| R2-A5 | mittel | Nachlesen vor der Mail muss gegen die EINGEFÜGTE Generation vergleichen (`RETURNING`), und die Lücke bis `sendMail` bleibt | — | ja |
| R2-A6 | mittel | S20-Nachweis verträgt sich nicht mit der Testgrenze (liest SQLite-Datei, eigener PG-Client, `process.exit`) | `S20-migrate.js` Kopf | ja |
| R2-A7 | mittel | Admin-Einladen protokolliert bei `mailfehler` — neue Abbruchgründe brauchen ein eigenes Merkmal | `routes/admin/mitarbeiter.js:741-762` | ja |
| R2-A8 | blockierend | Hausputz NACH dem Commit kann ein inzwischen neu ausgestelltes, gültiges Token verbrauchen | Reihenfolge | ja — Hausputz auf ältere Generationen beschränken |
| R2-A9 | blockierend | Waisen-Token + wiedervergebene Mitarbeiter-ID (Löschweg läuft nach gescheitertem Token-DELETE weiter; S20 fügt IDs mit `OVERRIDING SYSTEM VALUE` ein) | Fundstellen gelesen | ja |
| R2-A10 | mittel | `mitarbeiter.aktiv` ist nullable → „nicht aktiv" NULL-sicher (`IS DISTINCT FROM 1`) | `core/db.js:645` | ja |
| R2-A11 | mittel | „Zweimal laufen lassen" belegt nur das Überspringen; das Backfill ist nicht wiederholbar | `core/migrate.js:128-147` | ja (Dokumentation) |
