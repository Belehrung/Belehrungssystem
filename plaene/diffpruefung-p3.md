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

## Runde 2 — Nacharbeits-Diff `0dbdadc..da06de0` (DeepSeek mit Repo, 7 Runden, 1,00 $ geschätzt)

Lokal vorher: Lint EXIT 0; volle Suite auf `62eb5f7` läuft.

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| P3-R2-1 | `postGeraeteHinweisUebernehmenHandler`: `textFeld(req.body.pruefer)` (`sichtpruefung.js:5361`) läuft NACH dem `DELETE … RETURNING` (`:5323`) — die einzige Stelle, an der ein Schreibvorgang VOR `textFeld` blieb; der Hinweis wird beansprucht und im `catch` wiederhergestellt | gelesen; `zusatz` wirft nicht (`normalisiereZeilenumbrueche` hüllt in `String`) | sollte — vor das `try` heben |
| P3-R2-2 | Derselbe `catch` (`:5462`) verwirft die Warnung von `hinweisWiederherstellen()` („Hinweis verloren“) | auf master schon so (`:5448`), also VORBESTEHEND; `hinweisWiederherstellen` wirft nie, `.catch(() => {})` ist toter Code | sollte — Warnung in die Fehlerseite |
| P3-R2-3 | `/admin/einstellungen`: `studio_name`, `studio_ort`, `archiv_mail_an`, `mail_absender_name` laufen weiter ungeprüft | Prämisse FALSCH: es wirft nichts und schreibt nicht halb — `pg` macht aus einem Array einen Array-Literal-Text (`node_modules/pg/lib/utils.js:63`), gespeichert wird `{"a","b"}`. Substanz = P3-S1 | sollte — gleiche Route, mitnehmen |
| P3-R2-4 | Wächter-Regel `eingabetyp-scan.js:175` prüft nur, dass im `if (e instanceof EingabeFehler)` irgendwo `next`/`throw` steht (auch unerreichbar hinter `return`) | gelesen | sollte — erste Anweisung muss weiterreichen |
| P3-R2-5 | Sollzahl 69 ist eine ZAHL: −1 an einer Stelle, +1 an einer anderen bleibt grün | gelesen; 69 per Nachzählung richtig | Anmerkung — Zuordnung je Datei statt Summe |
| P3-R2-6 | JSON-Aufrufer (`antwort=json`) bekommen bei Feldtyp-Fehler HTML | gelesen `fehlerbehandler.js:111`; nur bei manipulierter Anfrage (eigene Formulare senden Strings) | kein Defekt |
| P3-R2-7 | Verschärfungen: `geraetName`/`standort` immer gelesen, `/setup` 403 vor 400, `/einstellungen` 400 statt Redirect | beabsichtigt, im Diff kommentiert | kein Defekt |

7 Befunde, 5 getragen (davon 1 vorbestehend), 1 mit falscher Prämisse (Substanz getragen), 2 kein Defekt.

**Nacharbeit 2 (`ea5e2db`)**: Diff vollständig gelesen. Alle fünf Punkte umgesetzt, jede Gegenprobe ROT → GRÜN (Bericht);
Suite des Executers 372 = 372, Lint 0. Eigene Lesung: zwei Reste → Nacharbeit 3 (Kommentar behauptet eine Race, die es
nicht gab; Wächter: `return`/`throw` auf oberster Ebene VOR dem `if` macht es unerreichbar). **Keine dritte
DeepSeek-Runde:** die Behebungen sind klein, jede hat eine gemessene Gegenprobe, und den einen Rest der Klasse habe
ich bei der eigenen Lesung gefunden.
