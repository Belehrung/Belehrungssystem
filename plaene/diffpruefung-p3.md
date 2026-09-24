# Diffprüfung P3 — Formularfelder mit falschem Typ

Zweig `fix-p3-eingabetypen`, Kopf `e0b0384` (+ master-Merge `0dbdadc`: SUITE_EXIT=0, 371 = 371, Lint 0). Lesespur
DeepSeek mit Repo (9 Runden, 1,73 $ geschätzt). Claude-Spur: Diff gelesen, Befunde nachgemessen, keine eigenen.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| P3-A1 | `/admin/einstellungen`: `textFeld()` im `try`, dessen `catch` „saved=0“ meldet — zwei Werte sind zu dem Zeitpunkt schon geschrieben (halbe Speicherung), keine 400 | gelesen `einstellungen.js:156-170` | sollte |
| P3-A2 | Neun Routen mit eigenem `catch` fangen den `EingabeFehler` und antworten 200/302/500 statt 400 (`getraenkeanlage.js` 2×, `module.js` `/seilkontrolle`, `sichtpruefung.js` 3 Handler, `belehrungen.js` 2×); Verhaltenstests decken nur `/tablet/sperre` und `/login` | gelesen (Bericht mit Zeilen) | sollte |
| P3-C1 | Berechnete Zugriffe `req.body[\`…${id}\`] || '').trim()` sieht der Wächter nicht; fünf Absturzstellen offen (`wartung.js:1215`, `module.js:2748`, `sichtpruefung.js:2400-2402`) | `grep` bestätigt (die `String(…)`-Formen daneben werfen nicht) | sollte |
| P3-D1 | `/setup`: `textFeld()` läuft vor der Token-Prüfung (eigener Kommentar „Token ZUERST“) | gelesen `auth.js:888-896` | Anmerkung, mitnehmen |
| P3-C4 | Kommentar kündigt eine Mutation am echten Bestand an, die es nicht gibt | gelesen | Anmerkung, mitnehmen |
| P3-C5 | Untergrenze `>= 40` bei 64 tatsächlichen Aufrufen | Zahl übernommen | Anmerkung, mitnehmen |
| P3-C2 | Test r7 unterscheidet „headersSent richtig“ nicht von „Handler fehlt“ | Logik | Anmerkung |
| P3-C3 | Registrierung in `run.sh` entfernen → nichts wird rot | gilt für jede Testdatei | Anmerkung |
| P3-B2..B5 | Stille catches, Vertragswechsel `/login` 302→400, 413 nach headersSent meldet, kaputtes JSON ohne Alarm | gelesen | Anmerkung |
| P3-D2 | `/d/…`: Array-E-Mail wird vor dem Versuchszähler abgewiesen | gelesen | Anmerkung |
| P3-D3 | `/freischalten-alle`: SELECT (mit `studio_id`) vor dem Wurf | gelesen | Anmerkung |

14 Zeilen (A2 gebündelt), alle getragen, 0 gefallen. Aus der Klasse, aber NICHT P3 (Sammelliste): Felder ohne
`.trim()` wie `req.body.studio_name || 'Standard'` speichern ein Array ungeprüft; `passwort` als Array an
`bcrypt.compare` (unbelegt).
