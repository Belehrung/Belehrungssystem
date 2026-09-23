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
