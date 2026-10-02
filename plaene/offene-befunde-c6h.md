# Offene Befunde C6-H (SIGPIPE unter `pipefail`)

Stand 02.10.2026. Die Herkunft steht in `diffpruefung-c6h.md` (B1 bis B8) und im Bericht des Bauenden (benannte Grenzen).
Die Zeilen werden hier nicht kopiert.

| Kennung | Befund | Plan |
|---|---|---|
| C6H-1 | B1: Die Attrappe `ss` braucht eine Füllzeile nach jedem Port, damit auch `prod_port_3000` regressionsempfindlich ist. | Extrarunde C6-H |
| C6H-2 | B2: Die F5-Nadel ersetzen oder den Kommentar berichtigen. | Extrarunde C6-H |
| C6H-3 | B3: Den Mengenvergleich `R.gelesen` gegen `absListe` streichen oder an eine äussere Grösse binden. | Extrarunde C6-H |
| C6H-4 | B4 und B5: Heredoc-Körper mit Shell-Code und `case`-Erkennung (`\bin`, Klammerform) nachschärfen oder als Grenze benennen. | Extrarunde C6-H |
| C6H-5 | B6: Eine verwaiste Markierung in einer Datei ohne `pipefail` wird gemeldet. | Extrarunde C6-H (Strenge dokumentieren) |
| C6H-6 | B7: `deploy.sh`: Scheitert `git diff`, entfällt `npm ci`. Vorschlag: dann `npm ci` laufen lassen. | Extrarunde C6-H |
| C6H-7 | B8: `pitr-restore-test.sh`: Der Status von `tar xzf` bleibt ungeprüft. | Extrarunde C6-H |
| C6H-8 | Grenzen laut Bericht, alle im Wächterkopf benannt: erkannte Leser nur grep/head/sed q/awk exit/read/cmp (nicht `dd count=`, `while read … break`, eigene Funktionen als Pipe-Ziel); der Lexer ist kein vollständiger Parser; `run:`-Blöcke in Workflows werden nicht gelesen (von Hand: 0 Funde); Skripte unter `/usr/local/bin` und im Hauptserver-Repo; Skripte in JS-Strings. | benannt. Der Hauptserver-Teil gehört in den Hauptserver-Plan. |
| C6H-9 | R2-B1 (`diffpruefung-c6h.md`, Runde 2): Ein wiederholter Deploy nach einem gescheiterten `npm ci` sieht BEFORE = AFTER und überspringt `npm ci`. Das halbe `node_modules` bleibt, bis jemand von Hand installiert. Das ist vorbestehend; seit Nacharbeit 2 nennt die Meldung den Handgriff. Vorschlag: Schritt 3/8 entscheidet über einen Stempel (sha256 von `package-lock.json`, nach erfolgreichem `npm ci` in `node_modules/` geschrieben) statt über `git diff`. Ein fehlender oder abweichender Stempel heisst `npm ci`. Damit entfällt auch C6H-6 an der Wurzel. | Extrarunde |
| C6H-10 | Grenzen des Lexers nach Nacharbeit 2: Ein case in `$(…)` oder Backticks meldet seine Muster als Pipes (Rahmen-Wächter `tief`, der Lexer verzählt sich dort an der Musterklammer). Ein case-Kopf mit Zeilenfortsetzung wird nicht erkannt. Beides geht in die laute Richtung. | benannt; mit C6H-9 prüfen |
