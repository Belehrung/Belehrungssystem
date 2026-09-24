# Diffprüfung P2 — Fehlerseiten-Status (24.09.2026)

Zweig `fix-p2-fehlerstatus`, Kopf `c85f440`. Executer: vierter Suite-Lauf `SUITE_EXIT=0`, 374 = 374, Lint 0 (Läufe 1–3
deckten drei eigene Folgefehler auf, alle behoben). Produktions-Diff selbst gelesen (247 reine Status-Hunks, 16 mit
Logik); Wächter-Filter selbst nachgelesen (B1 bestätigt: `if (f.status !== null) return false`). Spuren: Claude
ausführend (eigener Baum), `deepseek-v4-pro` mit Repo (effort high, 30 Runden, ~4,68 $).

| Nr. | Spur | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| P2-B1 | Claude | Wächter: `res.status(200)` mit Fehlerinhalt ohne Marker gilt als erledigt (Filter lässt JEDEN gesetzten Status durch); die Selbstprobe „weiterhin Fund (PP2-3)“ prüft nur das Finden | `400→200` an `module.js:3456` → 34/0; selbst gelesen `:209` | **blockierend** — Verstoss ist alles ausser Zahl ≥ 400 oder gültigem Marker |
| P2-B2 | Claude, DeepSeek 6b | Kennung gilt für die ganze Datei (`teilausfall` deckt 112 Stellen in geraete.js) — Gegenprobe (c) greift nicht | Marker vor fremder 404-Stelle → 34/0 | Kennung an die Stelle binden (Funktion/Route + Zeilenfenster) und Obergrenze je Kennung als Literal |
| P2-B3 | Claude, DeepSeek 5 | `teilausfall` an den strengen Ladebestand-Stellen (`geraete.js:2869, 4388`) gegen Fassung 2/PP2-10 (dort 500); der Verhaltenstest ruft den GET mit dem milden `ladeBestand()` und erreicht die Stelle nie; `test_feature_ladebestand_streng.js` hält die 200 fest | 500 gesetzt → Verhaltenstest 15/0, ladebestand_streng rot | beide 500, Marker weg, ladebestand_streng fachlich umstellen, Verhaltensprobe über den POST |
| P2-B4 | Claude, DeepSeek D | Zwei Fehlerseiten weiter 200 und für den Scanner unsichtbar: `belehrungen.js:2077` (`adminLayout(…"Fehler"…)`, maskierte Anführungszeichen), `wartung.js:1674` (`class="${ok ? … : 'error'}"`, POST); `belehrungen.js:2414` unsichtbar | Claude: 200 gemessen; stellengenauer Vergleich 403 vs 391 → 5 echte zusätzliche Stellen | beide mit Status; Scanner `\w*[Ll]ayout\(`, maskierte Quotes; Flash-Ausnahme nur bei Bedingung aus `req.query`; Gegenmessung stellengenau |
| P2-B5 | Claude | Jeder berechnete Status zählt als gesetzt (`DYNAMISCH`) — Helfer mit Statusparameter (`JFEHLER_STATUS`, `fehler(msg,status)`, `sendeBereits…(…, status = 200)`, `fehlerSeite`, `fehlerAntwort`) ungeprüft | `JFEHLER_STATUS` auf 200 → 34/0 | Aufrufstellen der Helfer prüfen (Literal ≥ 400); Voreinstellung 200 nur mit Marker |
| P2-B6 | Claude, DeepSeek C | Falsche Klasse: `verbandbuch.js:653` 400→500 (catch); `aufbewahrung.js:620` 400→404/500; `sichtpruefung.js:3264` 400→409; `:4465` 400→409 (Test `qr_mitglied_meldung.js:873` hält 400); `module.js:2660, 2722` 400→409; `belehrungen.js:2511` 400→500, `:2495` 400→404; `auth.js:1028` 400→429 (429 im Haus schon benutzt); multer-Rückrufe `geraete.js:5097`, `wartung.js:1019` nur LIMIT-Fehler 400, sonst 500; `einstellungen.js:247` 400→500, `:223` 400→404; `module.js:3778` „nicht gefunden ODER bereits erledigt“ trennen (404/409) | Claude: zwei gemessen (verbandbuch, aufbewahrung), Rest gelesen; DeepSeek gelesen | übernommen |
| P2-B7 | Claude | Wächter wirft bei einer fehlgeschlagenen Selbstprobe (`funde[0].status`) und bricht vor dem Bestandsscan ab | gemessen | robust machen |
| P2-B8 | Claude | Tabelle `docs/p2-fehlerstatus-tabelle.md:133` widerspricht PP2-11 (Warteschlange wiederholt HTML-Antworten alle 60 s); Zeile 2871 statt 2869 | gelesen | berichtigen |
| P2-B9 | eigene (aus P4-R2-1) | Äusserer catch der Seil-Freigabe (`module.js`, „Freigabe konnte nicht gespeichert werden.“) antwortet 400 statt 500 | gelesen | 500 |
| P2-B10 | eigene | `wartung.js:1086` `throw new Error("Gerät nicht gefunden")` → 500 statt 404 | gelesen | 404 |
| P2-B11 | DeepSeek A | `wartung.js:586` liefert 409 auf eine GET-Navigation (Zuständigkeit offen) | gelesen | bleibt (Ablehnung einer Handlung, Seite rendert); im Kommentar begründen |
| P2-B12 | Claude | fail2ban auf dem Server: zählt eine nginx-Jail 4xx, können Eingabefehler jetzt eine Studio-IP sperren | aus dem Repo nicht messbar | Sammelliste P2-S1 (auf dem Server prüfen) |

12 Befunde, 11 getragen (einer nicht messbar), 0 gefallen. Überschneidung: B2, B3, B4, B6 (je beide Spuren). Nur Claude:
B1 (blockierend), B5, B7, B8, B12. Nur DeepSeek: Teile von B6 (`einstellungen.js`, `module.js:3778`), B11.
Nacharbeit läuft; danach zweite Runde (Verhalten ändert sich).
