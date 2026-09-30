# Auftrag GH Nacharbeit 1 (30.09.2026, klein)

Grundlage: Lesespur `scratchpad/ghd/antwort.txt` (B1–B7) und eigene Prüfung von `a68f3a7`. Baum `/workspace/gymdocu-gh`,
Zweig `fix-gh-workflow-haertung` (master mit C2 eingemergt; Suite dort EXIT 0, 409 = 409, Lint 0). Einordnung: Standard.

1. **Pipe ohne pipefail (eigene Prüfung):** `gitleaks-hinweis.yml`, Schritt „Referenz": `INHALT="$(git log … | awk …)"`
   liefert als `$?` den Exit von awk — ein scheiternder `git log` ergäbe `PR_INHALT=0`. `set -o pipefail` in diesem
   Schritt (oder Exit von `git log` getrennt sichern); Test statisch + Gegenprobe.
2. **B1:** `nichts_zu_pruefen`-Text nennt, was nicht gelesen wurde (Merge-, leere, Lösch-, Umbenennungs-Commits,
   Binärdateien, Moduswechsel) und steht zusätzlich als `::notice` am PR. Fixtur mit Binär-Commit.
3. **B2:** Kopfkommentar und Zusammenfassung sagen ausdrücklich: Merge-Commits im PR (Konfliktauflösungen) werden nicht
   gelesen. Keine neue Mechanik (Sammelliste: zweiter Lauf über den Kopfstand).
4. **B3:** die „kein Wert in einem Kanal"-Zusicherung deckt auch den Schreibweg in die Job-Zusammenfassung (Kanarienwert
   → 0 Treffer); Gegenprobe.
5. **B4:** Dateinamen/Regeln in der Zusammenfassung wie in der Anmerkung maskieren (Steuerzeichen/Zeilenumbrüche weg);
   Test mit Dateinamen, der `\n` enthält.
6. **B5:** ein abgewiesener workflow_run (Kopf `master`, Erfolg, Ereignis nicht push/workflow_dispatch) wird LAUT: eigener
   kleiner Job, der dann mit `::error` rot endet, statt still übersprungen zu werden; `ERWARTETES_IF` und die
   Schritt-Wächter in `test_feature_deploy_gate_static.js` fachlich nachziehen; Gegenproben.
7. **B7:** Anmerkungen gedeckelt wie beim Semgrep-Hinweis (wichtigste zuerst, Rest gezählt); Test umstellen.

Nicht in diesem Auftrag: B6 (Wortlaut „Deploy-Gate" im Testkopf, steht gleich im Semgrep-Test — Sammelliste).
Volle Suite, Dateizahl, `npx eslint .`, wörtlich; Commit+Push vor dem langen Lauf; kein PR.

-- Ende des Auftrags --
