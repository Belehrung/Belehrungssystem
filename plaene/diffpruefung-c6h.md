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
