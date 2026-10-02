# Diffprüfung C6-C (Löschwege und Offboarding), Stand `7c4a1bc`

Eigene Prüfung des Produktivcodes: `core/datei-loeschqueue.js`, `core/provisioning.js`, `core/retention.js`,
`core/foto-reaper.js`, `core/storage-replica.js`, `server.js` vollständig gelesen.
- Mandantentrennung: Ohne lebendes Studio wird nur gelöscht, was sich dem Studio belegen lässt. Flache Verzeichnisse
  werden gegen lebende Verweise geprüft.
- Sperrordnung: Fachzeilen → Queue → `studios`, kein Studio-Lock. Dateilöschungen laufen erst nach dem COMMIT.
- Gegenprobe zu C6C-g5: `bericht_datei` speichert den Basisnamen (`routes/wartung.js:1305`).
- Laut Bericht ist die Suite grün mit 467 = 467, Lint sauber.

Zwei Lesespuren flash mit verschiedenen Bündeln: Produktions-Diff (P) und Test-Diff (T).

| Nr | Spur | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|---|
| P-B1 | P | sollte | Der Live-Zweig des Spools prüft nicht mit `darfFremdlosLoeschen`. | trägt nicht: Er reiht genau den Eintrag ein, den der direkte Queue-INSERT geschrieben hätte. Die Queue-Verarbeitung hat ihre eigenen Riegel. Es entsteht kein neuer Zustand. | — |
| P-B2 | P | sollte | Dauerhaft offene Spool-Einträge erzeugen nur `console.warn`, kein `melde()`. Das Geschwister `provisioning.js:1120` meldet. | trägt | N1 |
| P-B3 | P | Anm. | „Noch in derselben Nacht abgearbeitet“ gilt nicht für Studios mit `aktiv = 0` (`fuerAlleStudios` sieht nur `aktiv = 1`). | trägt (Zusage im Kommentar) | N1: Zusage berichtigen |
| P-B4 | P | Anm. | `.ungueltig`-Dateien bleiben unbegrenzt und tauchen in keiner Zusammenfassung auf. | trägt | N1: Bestand in `spoolZeile` nennen |
| T-1 | T | Anm. | „NUR die Grösse geändert“: `appendFileSync` ändert auch `mtimeMs`. Der Grössenvergleich wird von dieser Fixtur nicht isoliert. | trägt | N1 |
| T-2 | T | Anm. | Die Positivkontrolle in `test_feature_run_sh_wegwerf_variablen_static.js` nimmt ihren Sollwert aus der gepflegten Liste. | trägt | N1: Literal |
| T-3 | T | sollte | `test_feature_belehrung_upload_route_queue.js:186`: „kein Fehlschlag gemeldet“ wird nicht geprüft, `versuche.length === 0` ist tautologisch. | trägt (gelesen: Attrappe zählt nur bei `unlinkScheitert`) | N1 |
| T-4 | T | Anm. | Der Kommentarfilter im Spool-Test entfernt nur `//`-Zeilen. Ein `/* */`-stillgelegter Aufruf bleibt gezählt. | trägt | N1 |
| T-5 | T | Anm. | Keine Fixtur legt einen `.json.tmp-*`-Torso an; `tmpEntfernt` und `spoolZeile()` sind ohne Zusicherung. | trägt | N1 |
| T-6 | T | sollte | `eingereiht++` zählt auch, wenn `ON CONFLICT DO NOTHING` nichts eingefügt hat (Produktion), und keine Fixtur hat eine vorhandene Queue-Zeile. | trägt | N1 |
| T-7 | T | sollte | Der Test lädt `routes/belehrungen` vor dem `melde`-Stub. Die Route bindet `melde` beim Laden (`routes/belehrungen.js:24`). | trägt | N1: Stub vor dem require |
| T-8 | T | sollte | Die `express.static`-Prüfung liest nur `server.js`, nicht `routes/`. | trägt | N1 |
| T-9 | T | sollte | Abschnitt 8b: `path.join` normalisiert `unterordner/..` schon im Test, der Rohpfad mit `..` kommt nie an. | trägt (gelesen, `:261`) | N1 |
| E-7 | Bericht | Anm. | `offboarding_queue_spaeter_eintrag` wird in `/intern/deprovision` zu 500 statt zu 503 „wiederholbar“. | trägt (`server.js:284-287`) | N1 |

Benannte Grenzen des Bauenden: `offene-befunde-c6c.md` (C6C-g1 bis g8).

## Nacharbeit 1 (`e0862bb`, mit master `55ed24b` zusammengeführt)

Ich habe den Produktivcode selbst gelesen (`core/datei-loeschqueue.js`, `server.js`): Er sammelt `offen` je Grund und
meldet EINMAL je Lauf ohne Pfad. `eingereiht` folgt jetzt `rowCount`, `schonInQueue` ist neu. Der 503-Zweig ist eine
genaue Kopie des bestehenden Zweigs `offboarding_queue_nicht_schreibbar`. Die Kommentare zu `aktiv = 0` sind berichtigt.

Laut Bericht 35 Mutationen, alle rot, Rücknahme `diff` EXIT 0. Selbst nachgesehen: Suite-Log `SUITE_EXIT=0`, keine
`✗`-Zeile, Dateizahl-Ritual `diff` EXIT 0 (482), Lint sauber laut Bericht.

**Keine zweite Lesespur:** Die Nacharbeit ändert Verhalten nur bei Meldung, Zählung und Statuscode. Sie fügt keinen
Lösch- oder Schreibweg hinzu, und jede Änderung hat eine eigene rote Gegenprobe. Eine zweite Runde würde dieselbe
Prüflast für keine neue Klasse kaufen.

Hinweis des Bauenden, nachgemessen offen: siehe C6C-g9 in `offene-befunde-c6c.md`.
