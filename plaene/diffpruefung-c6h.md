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

### Runde 2 (nach Nacharbeit 1, Stand `5dfc97c`)

Nacharbeit 1: Suite des Bauenden SUITE_EXIT=0, 503 = 503, Lint sauber. Den Produktionsdiff habe ich selbst gelesen und den Lexer an fünf Grenzfällen selbst durchgemessen (Untershell gemeldet, mehrzeiliges case, case hinter `then`, verschachteltes case, Pipe hinter `esac`: alle richtig). Zweite flash-Runde mit demselben Auftrag über den vollen Diff: 21 Runden, ~0,92 $.

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| R2-B1 | Die neue Meldung sagt „den Deploy wiederholen“. Das hilft nicht: Nach dem Abbruch steht der Baum schon auf AFTER. Ein zweiter Lauf hat BEFORE = AFTER (`ops/deploy.sh:238/250`), `git diff` ist leer, `npm ci` wird übersprungen, und das halbe `node_modules` bleibt. Der Test pinnt den falschen Satz. | trägt (Zeilen gelesen) | Nacharbeit 2: Die Meldung nennt den Handgriff `cd $APP_ROOT && npm ci --omit=dev`, erst dann den Deploy wiederholen, und sagt, warum der Deploy das nicht selbst tut. Den Test mitziehen. Der vorbestehende Mechanismus (ein zweiter Lauf erkennt die halbe Installation nicht) kommt auf die Sammelliste (C6H-9). |
| R2-B2 | Seit `^` entfallen ist, wird ein case-Kopf mit `\|`, `;` oder `&` im Subjekt (`case "$(cat f \| tr -d ' ')" in`) nicht erkannt. Seine Muster gelten dann als Pipes, und `ok\|head)` wird ein Fund: ein Fehlalarm im Gate. | trägt (Regex gelesen: `[^\n;\|&]*?`) | Nacharbeit 2: Das Subjekt darf jedes Zeichen ausser dem Zeilenumbruch tragen. Maskiert wird NUR die Musterliste, nicht der Kopf; sonst verschwände eine echte Pipe im Subjekt (`case "$(git log \| head -1)" in`). |
| R2-B3 | Der `;;`-Vorspann ist an keine offene case-Anweisung gebunden; nur die Grammatik deckt ihn. | trägt als Grenze, im Bestand kein Fall | Nacharbeit 2: als benannte Grenze in den Helferkopf. |
| R2-B4 | `die()` wird über den ersten Treffer gesucht. Eine zweite Definition zwischen `:27` und Schritt 3 bliebe grün. | trägt | Nacharbeit 2: `einzigeZeile` (genau eine Definition). |
| R2-B5 | Die Füllzeile (C6H-1) ist selbst nicht zugesichert. Entfernt man sie, bleibt der Test grün. | trägt (die Zusicherungen prüfen nur das reparierte Skript) | Nacharbeit 2: Im Test die alte Pipe-Form gegen dieselbe Attrappe laufen lassen und ihr Scheitern für BEIDE Ports verlangen. |
| R2-B6 | Ein Git-Fehler löst jetzt ein löschendes `npm ci` aus. | trägt; im Kommentar benannt, bewusst getragen | keine |
