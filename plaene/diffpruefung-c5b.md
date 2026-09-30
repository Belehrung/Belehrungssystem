# Diffprüfung C5-B (Sperren, Replikation, Meldewege) — 30.09.2026

Stand `c5b-sperren-melden` `61380af`. Suite des Bauenden: 0 FAIL, 420 = 420. Die Prüfung lief in zwei Spuren:

- Claude, ausführend, mit Mutationen in einem eigenen Arbeitsbaum;
- flash, lesend (`scratchpad/c5b-diff/flash.txt`).

Eigene Lesung: `core/retention.js`, `core/defekt_mailer.js`, `server.js`, `workers/pdf-job-worker.js`,
`routes/belehrungen.js`.

| Nr | Befund | Quelle / Messung | Entscheidung |
|---|---|---|---|
| 1 | Regel (f) übersieht destrukturiert importierte Helfer (20 Durchreichungen im Bestand) | Claude: Mutation EXIT 0 (62/0) | Nacharbeit 1 |
| 2 | Alias-Ausnahme pinnt nur den Namen | Claude: `const c = db` EXIT 0 | Nacharbeit 2 |
| 3 | CLI-Wächter zählt statt Menge; Kernmodule weggefiltert | Claude: Tausch der `await`-Stelle EXIT 0; flash 2 | Nacharbeit 3 |
| 4 | Studio-Signatur der Entprellung nur Anzahl ⇒ neue Datei ohne Meldung gelöscht | Claude: Sonde gemessen | Nacharbeit 4 |
| 5 | Wiederholer ohne Höchstalter ⇒ Altbestand wird nachgesendet | eigene Lesung, Claude 6 | Nacharbeit 5 (7 Tage) |
| 6 | Trockenlauf der Rotation hält alle Studio-Locks (806 ms gemessen) | Claude 5, flash 1 | Nacharbeit 6: Kommentar und Doku berichtigen, Trockenlauf bleibt erlaubt (Entscheidung Haupt-Agent) |
| 7 | Worker: Fehler des Meldekanals setzt exitCode 1 | flash 4, Claude 12 | Nacharbeit 7 |
| 8 | Reaper alle 10 min belebt `dead` ggf. dreimal so oft | flash 5 | Nacharbeit 8 (erst messen) |
| 9 | Keyset-Kommentar falsch; Grundlinie ohne `fehler`-Prüfung; Testtitel | Claude 8/9, flash 6 | Nacharbeit 9 |
| 10 | Grenzen der Regel (f) unbenannt; g3-Kommentar falsch | Claude 10 | Nacharbeit 10 |
| 11 | Zustandsdatei unter `/var/log` — Schreibbarkeit unbelegt | Claude 11 | Nacharbeit 11 |
| 12 | Claim vor Versand, Prozesstod ⇒ nie gesendet | flash 3 | = V07-8, Auftrag C5-G (G1) |
| 13 | Wartungsweg nicht im Wiederholer | Claude 7 | quittiert: einziger Aufrufer ist der manuelle Knopf |

Ohne Befund gemessen (Mutation ⇒ ROT):
- Blockgrösse;
- catch meldet 0;
- Cleanup erst am Ende;
- Abbruchzähler;
- Statusfilter und Empfänger;
- Studio-Erinnerung;
- fester UTC-Offset;
- Leeren nach dem Drain;
- alter Hash.

Sonde „alle 100 Zeilen des ersten Blocks bekommen einen Hold“: 150 gelöscht, keine Schleife.

-- Ende --
