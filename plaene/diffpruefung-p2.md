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

## Runde 2 — Nacharbeit 1 (Kopf `55c3989`, 25.09.2026)

Spuren: Claude ausführend (eigener Baum `/workspace/gymdocu-p2-cc`, 37 Mutationen am Wächter, 47 berührte Einzeltests
gegen eigene DB), `deepseek-v4-pro` mit Repo (33 Runden, ~5,41 $), dazu zwei eigene Messungen (K1, K2). Diff selbst
gelesen (Commit `6713eaf`, Konfliktauflösung per `--remerge-diff`, `c501b67..55c3989`).

| Nr. | Spur | Befund | Nachgemessen | Entscheidung (= Auftrag Nacharbeit 2) |
|---|---|---|---|---|
| P2-R2-1 | Claude, DeepSeek 1a | Neuer JSON-Code `zustand` (`routes/module.js:2729, :2794`): `public/offline-queue.js:356-364` kennt nur `bereits_geprueft`/`validierung` als endgültig — Eintrag bleibt offen, wird alle 60 s wiederholt, blockiert alle späteren. Drei Tests rot (`seilkontrolle_geraet_geloescht` 13/2, `seilkontrolle_ohne_geraete` 11/1, `geraete_typ_filter` 33/1) | Queue-Code gelesen; Test erwartet `code === 'validierung'` (`:89`) | **blockierend** — Rumpf behält `code:'validierung'`, nur der Status wird 409 (expliziter Status-Parameter); Warteschlange NICHT umbauen (zwischengespeicherte alte `offline-queue.js` auf Tablets) |
| P2-R2-2 | Claude | `test_feature_unterschrift_eintrittspunkte.js` 205/18: E4/E11 erwarten `json200` (P4-Vertrag), P2 liefert 400 `validierung` | `:187, :207, :242, :343` gelesen | **blockierend** (Test) — E4/E11 auf 400 mit `code:'validierung'` umstellen (neue Art, keine abgeschwächte) |
| P2-R2-3 | Claude | fileFilter-Ablehnung (`core/pruefbericht.js:76`, normales `Error`) ist kein `MulterError` → falscher Dateityp gibt **500** statt 400; `test_feature_pruefbericht.js:424-431` prüft keinen Status | gelesen; Vorbild `routes/belehrungen.js:175` `istUploadEingabefehler(err, filterText)` | Vorbild übernehmen: MulterError oder Filtertext → 400, sonst `next(err)` (globaler Handler mit Alarm); Test sichert 400 zu |
| P2-R2-4 | Claude | B1-Behebung ungeschützt: `istErledigt` auf `status !== null` (M29) oder `>= 200` (M30) → 85/0 | Mutationen gemeldet, Stelle gelesen | Verstoss-Filter als Funktion herauslösen, Selbstproben mit Fixturen (200, DYNAMISCH ohne Freistellung, Marker an fremder Stelle) |
| P2-R2-5 | Claude, DeepSeek 2c | `findeLookupFallback`/`findeParameterDefault` nur erster Treffer; zweite `|| 200`-Stelle (M34) und unbekannter Code `jFehler('zustnd', …)` (M35) → 85/0 | `fehlerstatus-scan.js:363, :422` gelesen | JEDE `||`-Stelle prüfen; Code-Literale in `jFehler(<code>, …)` müssen Schlüssel der Tabelle sein |
| P2-R2-6 | Claude | Freistellung `HELFER_DEFINITIONEN` hängt nur an Datei:Zeile — `aufbewahrung.js:633` auf `ergebnis.status || 200` (M12) bzw. Schlüssel-Tippfehler (M11) → grün; /storno-Aufteilung ohne Verhaltenstest | Mutationen gemeldet | Freistellung zusätzlich an den QUELLTEXT des Status-Ausdrucks binden; /storno-Verhaltenstest (404 nie vergeben, 409 nicht markiert, 404 fremdes Studio, 400 unbekannte Tabelle, 302 Erfolg) |
| P2-R2-7 | Claude | Neues SELECT in `/dienstleister/abfahrt` ohne Test: Mutation `studio_id=$1 OR TRUE` → fremdes Studio sieht 409 statt 404 (verrät Existenz), alle Tests grün | Mutation gemeldet | Test „fremdes Studio → 404, fremder Eintrag bleibt aktiv“ |
| P2-R2-8 | Claude | Helfer-Liste unvollständig: `routes/sichtpruefung.js:3382` `jf(status, body)`, `server.js:610` `res.status(ergebnis.status)` — M36/M37 → 85/0 | Mutationen gemeldet | `jf` in die Pflichtparameter-Prüfung; `server.js:610`: Erzeuger von `ergebnis.status` prüfen oder als benannte Grenze auf die Sammelliste |
| P2-R2-9 | Claude | B4-Nachschärfungen ohne Selbstprobe: `[Ll]ayout`→`layout` (M32), `req.query`-Nachweis entfernt (M33) → 85/0 | an Scanner-Kopie gemessen: zwei Fixturen machen beide rot | beide Fixturen aufnehmen |
| P2-R2-10 | Claude | Mail-Seite: `ok===false` heisst paralleler Claim/schon gesendet oder verschluckter DB-Fehler, nicht SMTP (das wirft) — Kommentar falsch, 500 beim parallelen Versand irreführend | `core/defekt_mailer.js:329-369` gelesen | Kommentar berichtigen; Rückgabegrund des Mailers → C3a (dieselbe Datei, V07-1), Sammelliste P2-S3 |
| P2-R2-11 | Claude | `/dienstleister/abfahrt`: `rowCount 0` nach SELECT kann auch Löschung (Aufbewahrung) sein; Kommentar „keine Nichtexistenz“ zu stark | gelesen | Kommentar berichtigen |
| P2-R2-12 | Claude | `server.js` QR-Block: „Bestellung existiert nicht“/„fremdes Studio“ 400 statt 404 — Schnittstelle zum Hauptserver | gelesen | NICHT ändern; Sammelliste P2-S2 (Aufrufer im Hauptserver zuerst messen) |
| P2-R2-13 | DeepSeek 2d | Kennungsanker zu lose: `keineAuskunft(` steht auch in Definition `qr-scan.js:299` und Kommentaren `:437, :769, :801`, `pm2Degraded` in der Definition `health-intern.js:214` — Marker lässt sich wegschieben | `grep` gemessen | Anker an den ANTWORTAUSDRUCK binden (z. B. `res.status(200).send(keineAuskunft(`) in den Zeilen NACH dem Marker; Gegenprobe Marker verschieben → ROT |
| P2-R2-14 | DeepSeek 1b, Claude F1 | Neue 500er ohne Alarm (`geraete.js` Ladebestand ×2, Verbandbuch-catch, Seil-Freigabe-catch, Vorlagen-Datei fehlt, PDFs fehlen); `/storno` meldet — uneinheitlich | gelesen | an jeder neuen 500-Stelle für eine unerwartete Ausnahme `melde()` (bzw. `next(err)`) |
| P2-R2-15 | DeepSeek 5 | `sichtpruefung.js:5532` `echtesSend(layout("Fehler"…))` ohne eigenen Status | gelesen: alle Nicht-Erfolgswege des inneren Handlers setzen 400/409/500 VOR `send` — der Status wird geerbt, **nicht 200** (Schwere fällt) | trotzdem ausdrücklich `res.status(500)` (Wiederherstellung gescheitert = Serverfehler), gering |
| P2-R2-16 | DeepSeek 1c, Claude F1 | Login-Sperre 429 ohne `Retry-After`; fail2ban-Regeln zählen 429 womöglich nicht | gelesen | `Retry-After` (Sekunden) setzen; fail2ban → P2-S1 |
| K1 | eigene Messung | Umbau `const seite = …; res.status(N).send(seite)` (auth /setup, Multer-Rückrufe wartung/geraete, Mail-Seite) macht diese Stellen für den Scanner unsichtbar: 0 Funde in den Bereichen, 500→200 bliebe grün | Scanner an den Dateien ausgeführt | Scanner löst einen Bezeichner-Rumpf auf seine `const`-Zuweisung in derselben Funktion auf (eine Ebene); SOLL neu herleiten |
| K2 | eigene Messung | `ternaerBedingungsVariable()` nimmt die ERSTE Ternary; eine vorangehende `req.query`-Ternary spricht eine echte Fehler-Ternary frei | Probe: Fund nur ohne vorangehende Ternary | Bedingung der Ternary nehmen, die `class="error"` enthält; Fixtur |

16 Befunde aus zwei Spuren + zwei eigene. Überschneidung: R2-1 und R2-5 (beide Spuren), R2-14/R2-16 teilweise. Nur
Claude: R2-2, -3, -4, -6..-12. Nur DeepSeek: R2-13, R2-15 (Schwere fällt). Keiner widerlegt. Nacharbeit 2 ändert
wieder Verhalten (R2-1, R2-3, R2-14) → Runde 3 als ausführende Spur über den Nacharbeit-2-Diff.
