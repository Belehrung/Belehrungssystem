# Diffprüfung Bauspur `tools/bau-spur.js` (03.10.2026)

Zweig `bauspur-qwen` (lokal, `/workspace/belehrung-bauspur`), Stand `a5fe850`, 5 Commits ab `1bcd203`.

**Selbsttests des Bauenden:**
- bau-spur 95 ohne root, 8 mit root.
- gegenleser 138; ausführende Spur 171, vorher 145.
- zweitmeinung 11, hooks 32, session-start 11.
- 136 Gegenproben.

**Probelauf mit `qwen3.8-max`:**
- Gegen `9ad8acd`: Exit 0, 6 Runden, 0,07 $, genau 1 Änderung.
- Gegen master: Exit 25 an der veralteten Namensliste.

**Spuren:**
- Produktionsdiff (3311 Zeilen) selbst gelesen. Den Umbau des Gegenlesers habe ich mechanisch nachgemessen: Die entfernten Zeilen und die Zeilen des Moduls stimmen per `comm` überein, bis auf die Parametrisierung von `sseAnfrage` und die Lauf-Dateien.
- Lesespur flash, Bündel „Zusicherungen“: 9 Runden, 0,63 $.
- Ausführende Angriffsspur (Claude, Sonnet): kein echtes Modell, netzlos. Sie hat alle 145 alten Fälle der Prüfspur im neuen Lauf wiedergefunden.
  - Abweichung, von ihr selbst gemeldet: Im Fall „Standardpfad der Schlüsseldatei“ las das Werkzeug den echten Schlüssel im Prozess und versuchte die Anfrage.
  - Die Anfrage scheiterte im netzlosen Namensraum (Exit 21). Kein Paket ging hinaus, der Inhalt wurde nie ausgegeben.

**Ergebnis: Keine Grenze wurde durchbrochen.** Kein Schreiben ausserhalb des Baums oder auf gesperrte Pfade, kein Schlüssel im
Protokoll, in `BAU-LAEUFE.md` oder beim Modell, kein Startriegel umgangen.

| Kennung | Befund | Quelle | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| X1 | Die Kanarie läuft im Baustand-Modus auf dem Stand des Modells. Eine neue, noch nicht registrierte Testdatei macht `test_feature_run_sh_registrierung_static.js` rot, das gilt als „Isolationsabbruch“, und danach ist keine Ausführung mehr möglich. | Angriff 1 | trägt (Reproduktion wörtlich; `kanarieSicherstellen` gelesen) | Nacharbeit 1 |
| X2 | `suche` übersetzt das Muster des Modells mit `new RegExp` ohne Zeitlimit (`spur-gemeinsam.js:225`). Mit einer selbst angelegten Datei friert ReDoS den Hauptprozess ein: SIGTERM wirkt nicht, der Cluster bleibt stehen, es gibt keine Zeile in `BAU-LAEUFE.md`. | Angriff 2 | trägt (Messreihe 22–28 Zeichen: 0,16 → 11 s) | Nacharbeit 1, auch für den Gegenleser |
| X3 | Die weiche Sperrliste deckt `CLAUDE.md` des Zielrepos ab (Anweisungen für Agenten) nicht, ebenso wenig `.semgrepignore`, `.gitignore`, `golive-studio.sh`, `setup-staging.sh`, `playwright.config.js` und `e2e/`. | Angriff 3, eigener Befund P-2 | trägt (alle Dateien vorhanden) | Nacharbeit 1 |
| X4 | Testcode, den das Modell geschrieben hat, läuft nach dem Lauf AUSSERHALB der Sandbox: in der vollen Suite (als root), in der CI und im Deploy-Gate. Ein selbst geschriebener Test belegt nichts (`console.log('7 PASS / 0 FAIL')` ergibt „bestanden“). | Angriff 4 | trägt | Neue Regel in CLAUDE.md §1, Kopf von `bau-spur.js` |
| X5 | Dateinamen ohne positive Zeichenmenge: `dir/$(id).js`, U+202E, `.git /x.js`. `git add -A` bricht daran ab. | Angriff 5 | trägt | Nacharbeit 1 |
| X6 | Die Symlink-Prüfung der Kopie ist nur lexikalisch (`d/up -> ..`, `lnk -> d/up/..`). | Angriff 6 | trägt (GymDocu hat heute keinen Symlink) | Nacharbeit 1: jedes `..` im Ziel ablehnen |
| X7 | Im Baustand-Modus kommen die Pflichtdateien der Sandbox aus dem Arbeitsbaum, nicht aus HEAD. Heute fehlt nur die zweite Schicht. | Angriff 7 | trägt | Nacharbeit 1 |
| X8 | Das Riegel-Muster `sk-` erkennt Schlüssel mit frühem Punkt nicht (75,8 % erkannt). | Angriff 8, eigener Befund P-4 | trägt | Nacharbeit 1: `\bsk-[A-Za-z0-9_.-]{20,}` |
| X9 | Der Endvergleich sieht `skip-worktree`/`assume-unchanged` nicht. Exit 27 verdrängt 24 entgegen dem Statuskatalog. | Angriff 9 | trägt (gelesen) | Nacharbeit 1 |
| X10 | `istHartGesperrt` unterscheidet beim Lesen Gross- und Kleinschreibung (`SECRET.PEM` lesbar). | Angriff 10 | trägt | Nacharbeit 1 (gilt auch für den Gegenleser) |
| X11 | Eine Schlüsseldatei als FIFO hängt. 0400 wird abgelehnt. `--protokoll` leert eine vorhandene Datei. | Angriff 11 | trägt (gelesen) | Nacharbeit 1 |
| F1 | Die Regel „Lauf-Dateien auch für `suche`“ hat keinen Fall, der rot wird (`alleErlaubten`, nur `suche`). | flash B-1 | trägt (grep) | Nacharbeit 1 |
| F2 | Wird die Zeile in `BAU-LAEUFE.md` nicht eingetragen, gibt es nur eine stderr-Warnung; der Lauf meldet trotzdem „fertig“. | flash B-2 | trägt (Diff gelesen) | Nacharbeit 1: eigener Exit und Fälle |
| F3 | `O_NOFOLLOW`/`O_EXCL`/`nlink` haben keinen roten Fall, weil `kettePruefen` davor greift. | flash B-3 | trägt (logisch) | Nacharbeit 1: Haken `vorOeffnen` |
| F4 | A1 für `mutiere_und_teste` ist nicht für sich belegt. | flash B-4 | trägt (logisch) | Nacharbeit 1 |
| F5 | Der Catch in `main()` ist ungefiltert. Ein Fehlertext bei einem anderen HTTP-Status als 200 bringt bis zu 800 Bytes Anbietertext mit. | flash B-5 | trägt (gelesen) | Nacharbeit 1 |
| P-1 | `TESTNAME_AUSNAHMEN` kennt das auf master registrierte `test/e2e-durchlauf.js` nicht. Die Literalliste wird driften. | eigener Befund | trägt (TESTS-Block von master) | Nacharbeit 1: sichere Zeichenmenge statt Ausnahmeliste |
| P-3 | `ERWARTETE_NAMEN` fehlen `DATEI_LOESCHQUEUE_SPOOL_DIR`, `GYMDOCU_TG_BOT_TOKEN` und `GYMDOCU_TG_CHAT_ID`. Die Werte sind eine Attrappe bzw. `mktemp`; alle echten `GYMDOCU_TG_*` werden entfernt. | eigener Befund, flash B-6 | trägt (`test/umgebung.sh:252-256, 318-331`) | Entscheidung: aufnehmen, Nacharbeit 1 |

Eine zweite Prüfrunde folgt nach der Nacharbeit, weil sie Verhalten ändert (Kanarie, Suche, Sperren).

## Runde 2 (Nacharbeit 1, `a5fe850..34f56e7`, 03.10.2026)

- Produktionsdiff selbst gelesen (`spur-gemeinsam.js`, `geheimnis-riegel.js`, `ausfuehr-aufbau.sh`, `gegenleser-repo.js`, `bau-spur.js`,
  `ausfuehr-spur.js`, `BAU-LAEUFE.md`): X1–X11, F1–F5, P-1, P-3 umgesetzt, nichts Blockierendes. Eigene Befunde: BS-6, BS-7.
- Lesespur Kimi („Zusicherungen und Schliessung“, voller Diff, effort high; Antwort am Längendeckel abgeschnitten, die fünf Befunde
  vollständig, die Rechenschaftstabelle nicht): N1 trägt nicht (das Fixtur-Repo samt Zweig und Worktree liegt in einem frischen
  `mkdtemp`-Verzeichnis, das im `finally` entfernt wird, `bau-spur-selbsttest.js:1300/1404`); N2–N5 als BS-8 bis BS-11 auf die Sammelliste.
- Qwens Testdatei aus Probelauf 3 gelesen (Regel §1): liest eine Datei, zwei `includes`, nichts ausserhalb; nicht committet.
- Ergebnis: mergefähig in den Arbeitszweig; CI entscheidet.
