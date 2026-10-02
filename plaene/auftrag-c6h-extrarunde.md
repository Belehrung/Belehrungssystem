# Auftrag C6-H Extrarunde — Nachschärfungen am SIGPIPE-Wächter und zwei Ops-Skripte (Fassung 1, 02.10.2026)

Repo GymDocu, Stand master `749f2d2` oder neuer. Gebaut wird wie üblich über den Executer. Der zunächst geplante
A/B-Vergleich ist auf Wunsch des Betreibers entfallen (`plaene/ab-deepseek-bauen.md`).

Herkunft: `plaene/offene-befunde-c6h.md` (C6H-1 bis C6H-7) und `plaene/diffpruefung-c6h.md` (B1 bis B8). Jeder Punkt ist ein
FUNDORT. Miss ihn vor dem Ändern neu.

## Punkte

1. **C6H-1 — `test_feature_final_verification_verhalten.js`:** Die `ss`-Attrappe schreibt Port 3000 als letzte Zeile. Für den
   letzten Treffer entsteht kein SIGPIPE, deshalb kann `prod_port_3000` die Regression nicht zeigen. Die Attrappe soll nach
   JEDEM gelisteten Port noch eine Zeile schreiben (z. B. eine Füllzeile), damit auch `prod_port_3000` mit der alten
   `port_listening`-Form (Pipe in `grep -q`) rot wird. Gegenprobe: die alte Form nur für den zweiten Aufruf
   (`ss -tln | grep -q ":$port "`) wiederherstellen → mindestens eine `prod_port_3000`-Zusicherung rot.
2. **C6H-2 — `test_feature_sigpipe_pipefail_static.js`:** Die Nadel zur Zeile `if ! grep -q "Merge pull request #${num} " …`
   in `ops/final-verification.sh` behauptet, das `#` in Anführungszeichen zu prüfen. Weil hinter dem `#` keine Pipe steht,
   kann sie an einer falschen `#`-Behandlung nicht rot werden. Entweder durch eine Fixtur ersetzen, die eine Pipe HINTER einem
   zitierten `#` trägt und bei falscher Behandlung rot wird, oder den Kommentar auf das berichtigen, was sie belegt. Gegenprobe:
   Lexer behandelt `#` in Anführungszeichen als Kommentarbeginn → rot.
3. **C6H-3 — derselbe Wächter:** Der Mengenvergleich `R.gelesen` gegen `absListe` hat keine eigene Trennschärfe (`R.gelesen`
   wird aus der übergebenen Liste gefüllt). Streichen oder an eine äussere Grösse binden. Ein Kopfkommentar, der ihn als
   Selbstnachweis verkauft, wird berichtigt.
4. **C6H-4 — `test/helfer/sigpipe-scan.js`:**
   - (a) Heredoc-Körper werden übersprungen, auch wenn sie Shell-Code sind (`bash <<'SH'`, `sh <<EOF`). Entweder solche Körper
     als Shell mitprüfen oder die Grenze im Kopf benennen.
   - (b) `CASE_MUSTER` nimmt `\bin` als Präfix: `( echo x in y | head -1 )` würde unterdrückt, `case … in (a|b)` falsch
     gemeldet. Nachschärfen, mit je einer Fixtur für beide Fälle.
5. **C6H-5 — derselbe Helfer:** Eine verwaiste `# sigpipe-geprueft:`-Markierung wird auch in Dateien OHNE `pipefail`
   gemeldet. Entscheidung: so lassen (Strenge ist gewollt). Das wird im Kopf dokumentiert und mit einer Fixtur festgehalten.
6. **C6H-6 — `ops/deploy.sh` (Schritt 3/8):** Scheitert `git diff --name-only "$BEFORE" "$AFTER"`, gilt das heute als
   „unverändert“, und `npm ci` entfällt. Neu: Scheitert `git diff`, läuft `npm ci --omit=dev` trotzdem, mit einer Warnzeile.
   `npm ci` ist idempotent. Ein Abbruch an dieser Stelle hinterliesse neuen Code auf der Platte und den alten Prozess im
   Speicher. Unter `set -e` darf kein neuer Abbruchpfad entstehen. Die Entscheidungstabelle (git scheitert / Treffer / kein
   Treffer) steht als Kommentar daneben. Ein statischer Test hält die drei Zweige fest, in einer bestehenden Testdatei, die
   `ops/deploy.sh` schon liest, oder in einer neuen (dann in `test/run.sh` registrieren).
7. **C6H-7 — `ops/gymdocu-pitr-restore-test.sh`:** Die beiden `sudo -u postgres tar xzf …` prüfen ihren Status nicht (das
   Skript läuft ohne `set -e`). Scheitert ein Auspacken, soll das Skript mit `fail "<Text>" <Code>` abbrechen, nach dem Muster
   der übrigen `fail`-Aufrufe darin. Ein statischer Test hält das fest.

## Rahmen

- Kein Verhalten ausserhalb der genannten Punkte ändern. Ausgaben und Exit-Codes der Skripte bleiben, ausser wo ein Punkt es
  ausdrücklich verlangt.
- Bestehende Wächter werden fachlich nachgezogen, nie abgeschwächt.
- Zu jeder neuen oder geänderten Zusicherung gehört eine Gegenprobe: eine Mutation, die genau sie rot macht, und das
  Ergebnis ROT/GRÜN.
- Tests fassen nichts Echtes an (Attrappen, Wegwerfwurzeln).
- In Skripten mit `pipefail` steht kein früh endender Leser hinter einer Pipe.
- Am Ende: volle Suite grün, `npm run lint` sauber, Dateizahl-Ritual `diff` EXIT 0.

-- Ende des Auftrags --
