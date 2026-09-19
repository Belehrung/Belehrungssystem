# Auftrag: Runde 5 — der In-Process-Lauf darf `process.exitCode` nicht anfassen

Repo `/home/user/gymdocu`, weiter auf `claude/verschluesselung-stufe0`, PR #455.
**Ein Punkt.**

## Der Befund

Review-Bot am PR (P1), **von mir selbst am Quelltext nachgemessen und
zutreffend**: `hauptlauf()` schreibt `process.exitCode` unbedingt —
`:359` (`fehler > 0 ? 1 : 0`) sowie in jedem Abbruchzweig (`:217`, `:226`,
`:235`, `:263`, `:369`). `ernteInProcess()` (`:416-418`) reicht nur `wirklich`
und `schliesseDbPool` durch; einen Schalter für den Exit-Code gibt es nicht.

Folgen im LANGLAUFENDEN Webprozess, beide Richtungen schlecht:

- Ein sauberer Erntelauf setzt `process.exitCode = 0` und **löscht damit einen
  vorher gesetzten Fehlerstatus** des Servers.
- Ein Erntefehler setzt `process.exitCode = 1` — der Webprozess meldet dann
  beim späteren Beenden oder Neustart einen Fehlschlag, den es nie gab. pm2
  und die Deploy-Logik lesen genau das.

Der CLI-Pfad braucht diese Zuweisungen weiterhin; der In-Process-Pfad darf sie
nicht haben.

## Zu bauen

`ernteInProcess()` lässt `process.exitCode` unverändert — der vorherige Wert
steht danach unverändert da, auch wenn der Lauf Fehler hatte. Wähle selbst, ob
du den Wert sicherst und zurücksetzt oder das Setzen im gemeinsamen Pfad an
eine Bedingung hängst; begründe die Wahl kurz. Der Rückgabewert von
`hauptlauf()` trägt das Ergebnis ohnehin schon, `server.js` liest ihn bereits.

**Zusicherung mit Gegenprobe, beide Richtungen gemessen:**
`process.exitCode` vorher auf einen Wert ungleich 0 setzen, `ernteInProcess()`
über einen Lauf MIT Fehlern und über einen SAUBEREN Lauf schicken, danach
prüfen, dass der Wert unverändert ist. Und die Gegenrichtung: der CLI-Pfad
setzt ihn weiterhin (sonst hast du die eine Seite kaputtgemacht, um die andere
zu reparieren).

## Und die allgemeine Lehre, die in den Kommentar gehört

Ich hatte dir in Runde 4 EINE Nebenwirkung des CLI-Helfers genannt (den
Datenbankpool) und stillschweigend angenommen, es sei die einzige. Du hast den
Pool richtig behandelt und den Exit-Code übersehen — das ist meine
Auslassung, nicht deine.

Schreib deshalb an `ernteInProcess()` einen Kommentar, der die Klasse benennt,
nicht nur den Einzelfall: **wer einen CLI-Helfer in einen langlaufenden Prozess
holt, zählt ALLE prozessglobalen Nebenwirkungen auf** — `process.exitCode`,
`process.exit`, Signal- und `process.on`-Handler, Arbeitsverzeichnis,
Umgebungsvariablen, geschlossene Verbindungen, Annahmen über STDOUT. Geh diese
Liste für diesen Helfer einmal durch und nenne im Bericht, was du geprüft hast
und was davon zutrifft. Findest du eine weitere: melden, und nur bauen, wenn
sie denselben Schaden anrichten kann.

## Ausdrücklich NICHT

Keine Änderung an der Erntelogik, den Routen, `core/retention.js`,
`core/pdf-engine.js`. D19 bleibt offen.

## Abschluss

Volle Suite ohne Pipe, Dateizahl-Ritual als MENGENvergleich, `npm run lint`
wörtlich, Marker-Scan (Sollwert 6), `git status` sauber. Push aktualisiert den
offenen PR — keinen neuen eröffnen.
