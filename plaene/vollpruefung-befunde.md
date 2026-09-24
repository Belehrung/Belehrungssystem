# DeepSeek-Vollprüfung GymDocu — Befunde und Nachmessung

Plan: `plaene/deepseek-vollpruefung.md`. Stand der Prüffläche: master `221a7b2` (Lesebaum `/workspace/gymdocu-lock`),
27 Bereiche ≤ 180k Token (`scratchpad/vollpruefung/g221/liste.tsv`). Jeder Befund ist eine Behauptung, bis er hier
nachgemessen steht. Geringe Befunde gehen auf `plaene/offene-befunde-vollpruefung.md`.

## Bereich 06 (Pilot) — `routes/admin/qr-*.js`, `routes/admin/tablets.js`, `core/2fa.js` … `core/db-queue.js`

Lauf 24.09.2026 04:05–04:21 UTC, 15 Runden, 3,72 Mio. Token ein, 63.560 aus, geschätzt 5,17 $ (obere Schranke).
Abdeckung ungleich: der Bericht arbeitet sich an `qr-bestellung.js` ab; `core/auth.js`, `core/csrf-schutz.js`,
`core/bezirk-token.js`, `core/client-ip.js` nur gestreift („öffentliche Wege geprüft“).

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| V06-1 | `gabEsJeBestaetigung()` ohne eigenes try/catch — ein DB-Fehler dieser Nebenabfrage lässt die ganze Vorgangsseite 500 antworten | gelesen `qr-bestellung.js:1625-1670`; der äussere catch fängt (500 + `intern()`), die Seite fällt ganz statt ohne Hinweis | gering (Modell: „sollte“) |
| V06-2 | `qr-druckdaten.js:246` `SELECT * FROM qr_charge WHERE id = $1` ohne `studio_id`, Trennung erst danach in JS | gelesen; Riegel wirkt (fremde ID → 404), Hausregel „jede Abfrage trägt studio_id“ verletzt, Schwesterdatei hat es nachgezogen | gering (Modell: „sollte“) |
| V06-3 | Modulo-Verzerrung bei Recovery-Codes (Alphabet 31 Zeichen) | **gefallen:** das Alphabet hat 32 Zeichen (`256 % 32 = 0`, nachgerechnet). Daraus ein anderer Punkt: der Kommentar „ohne … L“ stimmt nicht, `L` ist enthalten — wer es „richtig“ stellt (31 Zeichen), erzeugt genau die Verzerrung | Text |
| V06-4 | Kommentar an `vorgangNichtGefundenInhalt()`: nicht-numerische `:id` liefere dieselbe Seite — seit der ID-Wache (#470) 400 | gelesen `:781-783` | Text |
| V06-5 | `req.body.auftragsnummer` ohne Absicherung — POST ohne Content-Type lässt `req.body` in Express 5 `undefined` → 500 statt 400 | gelesen `:1891`; Express 5 setzt `req.body` nicht mehr auf `{}` | gering |
| V06-6 | Prozess-Tod zwischen `sendMail()` und dem Commit: Mail raus, Vorgang bleibt „erzeugt“, erneuter Klick bestellt doppelt | gelesen; strukturell (erst senden, dann vermerken), unbenannt | gering |
| V06-7 | `istGueltigeBestellungsform()` lässt `formate: [null]` durch → `baueBestelltext()` wirft → Ergebnis/PDF dauerhaft 500 | gelesen `:599-601`, `:524`; nur über eine von Hand veränderte Zeile | gering |
| V06-8 | `GET /qr/kleben` ohne try/catch | gelesen; der globale Fehlerbehandler (`server.js:1467`) fängt — nur Abweichung vom Dateimuster | Anmerkung |
| V06-9 | „keine Token“/„unbekanntes Format“ antworten 500, obwohl der Kommentar sagt „kein Datenbankfehler“ | gelesen `qr-druckdaten.js:361-366` | Anmerkung |

9 Befunde, 8 getragen, 1 gefallen; nichts Blockierendes, nichts zur Mandantentrennung mit Leck.
