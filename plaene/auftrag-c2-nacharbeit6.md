# Auftrag C2 Nacharbeit 6 (30.09.2026, klein)

Grundlage: Lesespur Runde 6 (`scratchpad/c2r6/antwort.txt`, B1–B5), selbst nachgemessen. Einordnung: Standard.

1. **B1 (Rückfall):** `core/error-tracker.js` `neuAusloesen`: nach `process.kill(process.pid, name)` einen Rückfall-
   Zeitgeber (unref, 1 s) → `process.exit(128 + Signalnummer)`, falls der Signaltod ausbleibt (fremder Listener).
   Test: im Kindprozess einen zweiten, fremden SIGTERM-Listener registrieren → Prozess endet trotzdem (Exit-Code statt
   hängen); Regelfall bleibt Signaltod (bestehende Zusicherung). Gegenprobe ohne Rückfall → ROT (Zeitlimit).
   (Die vermutete `SIG_IGN`-Variante nicht bauen; libuv setzt beim Abmelden `SIG_DFL` — wer das anders misst, meldet es.)
2. **B3:** Kommentar der Ausnahme in `test_feature_keine_systemeingriffe.js` (Ernte-Test) nennt `mkfifo` im selben
   Temp-Verzeichnis.
3. **B4:** Wache in `test_feature_error_tracking_sammelstufe.js:247` schickt den Gruppen-SIGKILL nur, solange das Kind
   lebt (`exitCode === null && signalCode === null`), wie der Zweitsignal-Pfad.

Nicht in diesem Auftrag (Sammelliste `plaene/offene-befunde-c2.md`): B2 (`exit`-Haken der Datei-Sperre laufen in
signal-beendeten Testprozessen nicht — gegenüber master unverändert, dort endete SIGINT ebenfalls per Signal), B5
(`kill_timeout` wirkt erst, wenn pm2 es übernimmt — nur auf dem Server messbar).

-- Ende des Auftrags --
