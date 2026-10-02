# Diffprüfung C6-H (SIGPIPE unter `pipefail`), Stand `3ce7332`

**Eigene Prüfung.** Ich habe alle Shell-Umbauten selbst gelesen (`ops/*.sh`, `setup-staging.sh`, `test/run.sh`).
- Unter `set -e` (`deploy.sh`, `staging-smoke.sh`, `setup-staging.sh`) bleibt der Produzentenstatus in der Bedingung.
- `grep -m1` ersetzt `| head -1`; `${L%%$'\n'*}` ersetzt `ls | head -1`.
- `restore-drill.sh:87` liest über eine Prozess-Substitution (begründete Abweichung von F3).

**Laut Bericht:** 29 Stellen (a: 9, b: 0, c: 20), Suite 470 = 470, Lint sauber. Die Gegenproben am Verhaltenstest waren vor
dem Fix 18/8, danach 30/0.

**Lesespur flash** (Diff mit Zugriff auf das Repo):

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| B1 | Anm. | Die Attrappe `ss` schreibt Port 3000 als letzte Zeile. `prod_port_3000` kann die Regression deshalb nicht zeigen, nur `prod_port_3200` trägt. | trägt (Mechanismus wie gemessen: der letzte Treffer erzeugt kein SIGPIPE) | offen, `offene-befunde-c6h.md` |
| B2 | sollte | Die Nadel zu `final-verification.sh` (`#` in Anführungszeichen) kann am behaupteten F5-Fehler nicht rot werden, weil hinter dem `#` keine Pipe steht. Der echte Beleg sind die Fixturen. | trägt | offen |
| B3 | Anm. | `R.gelesen` stammt aus der übergebenen Liste. Der Mengenvergleich mit `absListe` hat keine eigene Trennschärfe. Die äussere Referenz ist git gegen Dateisystem. | trägt | offen |
| B4 | Anm. | Heredoc-Körper werden übersprungen, auch wenn sie Shell-Code sind (`bash <<'SH'`). Diese Grenze ist im Kopf nicht benannt. | trägt (im Bestand kein Fall) | offen |
| B5 | Anm. | `CASE_MUSTER` nimmt `\bin` als Präfix: `( echo x in y \| head -1 )` würde unterdrückt, `case … in (a\|b)` falsch gemeldet. | trägt (im Bestand kein Fall) | offen |
| B6 | Anm. | Eine verwaiste Markierung wird auch in Dateien ohne `pipefail` gemeldet. | trägt | offen (vermutlich so lassen und dokumentieren) |
| B7 | Anm. | `deploy.sh`: Scheitert `git diff`, gilt das als „unverändert“, und `npm ci` entfällt. Das ist vorbestehend und nicht neu. | trägt | offen. Vorschlag: bei Fehlschlag `npm ci` laufen lassen (idempotent), statt abzubrechen, sonst entsteht der Zwischenzustand „neuer Code, alter Prozess“. |
| B8 | Anm. | `pitr-restore-test.sh`: Der Status von `tar xzf` wird nicht geprüft (ausserhalb des Diffs). | trägt | offen |

**Entscheidung:** Gemergt wird mit diesen offenen Punkten. Keiner ist blockierend, und alle betreffen die Güte von Tests
und Wächtern oder sind vorbestehend. Der Beitrag beendet die zufälligen Fehlschläge der Master-CI, die zweimal den
Deploy übersprungen haben. Die offenen Punkte kommen in die Extrarunde.

## Extrarunde (Zweig `c6h-extrarunde`, Stand `a8bfe5b`) — geprüft

- Suite des Bauenden: SUITE_EXIT=0, 503 = 503, `diff` EXIT 0, Lint sauber.
- Den Produktionsdiff (`ops/deploy.sh`, `ops/gymdocu-pitr-restore-test.sh`, `test/helfer/sigpipe-scan.js`) habe ich selbst gelesen.
- Eine flash-Spur über Tests und Lexer: 29 Runden, ~1,06 $.

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| X-F1 | `CASE_MUSTER`, Alternative `^`: Eine echte Pipe, deren Zeile mit `)` endet, gilt als case-Muster. Beispiel: mehrzeilige Untershell `(\n  ls \| head )`. Ein blankes `(` zählt der Lexer nicht als Tiefe. | trägt (selbst gemessen: `findePipen` liefert `[]`, alte UND neue Fassung, also vorbestehend) | Nacharbeit: Die `^`-Alternative entfällt. Muster gelten nur hinter einem `case … in`-Kopf oder `;;`/`;;&`/`;&`, auch über Zeilenumbrüche hinweg. Den Kopf an die Befehlsstelle binden (`echo case in x \| head )`). |
| X-F2 | Eine Markierung in einer Datei ohne `pipefail` heisst `markierung-verwaist`, auch wenn auf der Zeile ein Frühleser steht. Die Meldung behauptet dann etwas Falsches. | trägt (`sigpipe-scan.js:546` gegen `:563-566`) | Nacharbeit: eigene Art `markierung-ohne-pipefail`. Die Strenge (C6H-5) bleibt. |
| X-F3 | Die tar-Zusicherung nimmt auch eine auskommentierte Sicherung an: `tar xzf … # \|\| fail "…" 2`. | trägt (Regex nicht verankert, `[^"]*` frisst das `#`) | Nacharbeit: angehängten Kommentar vor dem Vergleich abschneiden. Gegenprobe mit der auskommentierten Form → rot. |
| X-F4 | „Fehlschlag bleibt hart“ hängt an `set -e`; kein Test pinnt `set -euo pipefail` in `ops/deploy.sh`. | trägt (nur Kommentarzeilen in den Tests) | Nacharbeit: Kopfzeile pinnen und kein `set +e` zulassen. Dazu X-Q1. |
| X-F5 | Die beiden neuen Port-Zusicherungen sind durch `JSON ok=true` schon erzwungen. | trägt, ist aber kein Fehler (bessere Meldung) | keine |
| X-Q1 | „Auf Verdacht kostet nur Zeit“ ist zu billig. `npm ci` löscht `node_modules`; scheitert es, bricht der Deploy ohne Meldung ab, mit halbem `node_modules` neben dem laufenden alten Prozess. Das gilt schon für den bestehenden Zweig „Sperrdatei geändert“. | trägt teilweise (es gibt keinen ERR-Trap, `die()` steht in `:27`) | Nacharbeit: beide `npm ci`-Zweige mit `\|\| die "…"` und einer Meldung, die den Zustand und den Ausweg nennt. Den Kommentar berichtigen. Die Entscheidung „laut statt still veraltet“ bleibt. |
| X-K | `ops/final-verification.sh:89-91` beschreibt als Messung die alte ss-Attrappe. | trägt (Bericht des Bauenden) | Nacharbeit: als Messung an der damaligen Attrappe kennzeichnen; seit C6H-1 fallen beide Ports. |
