# Planprüfung C2 Nacharbeit 4 — nachgemessen (29.09.2026)

Rohberichte: `plaene/planpruefung-c2-n4-roh.md` (zwei DeepSeek-Spuren, 25.09.2026, Sparmodus, damals ungeprüft). Hier je
Befund die eigene Nachmessung am Stand `32822d9` (`/workspace/gymdocu-c2`) und was daraus in Fassung 2 wurde.

| Befund (Spur) | Nachmessung | trägt? | Fassung 2 |
|---|---|---|---|
| A1/1.1 pm2-Reload verliert Gesammeltes (beide) | `grep SIGINT\|SIGTERM server.js core/error-tracker.js` leer; `ecosystem.config.js:18` `kill_timeout: 120_000`; ohne Handler beendet SIGINT sofort | ja | Signal-Handler in `installProcessHandlers()`, Deckel 5 s, Test (d) |
| A2 uncaughtException 1500 ms (S2) | `core/error-tracker.js:434-438` | ja, aber Parität | Leeren sofort anstossen, Frist bleibt wie heute |
| 1.2 `regenerierePdfMonat.js:59` exit (S1) | Zeile bestätigt, Monatslauf sammelt | ja | dort `await leereSammlung()` |
| 5.1/Frage 4 Zahlen/Pfade erreichen Telegram nicht (S1) | `baueSammelText` `:378-392` ohne `err.message`; DSGVO-Kommentar `:350-359` | ja | Zahlen/Pfade bewusst nur ins Log, fester `err.code` |
| C1/5.2 `>= 4` ≠ „NUR Schema“; Test `:141` Tiefe 5 (beide) | `:224-236` heute `>= 3`; `:141` erwartet Tiefe 5 geerntet; einziger Erzeuger `quarantaenePfad` (`core/pdf-engine.js:136-140`, Name `${Date.now()}-${hex8}-…`, seit `c354df7` unverändert) | ja | Ziffern-Studio + ≥ 4 Segmente + Erzeuger-Namensform |
| 3.1/P3 Test (c) ohne Literal (beide) | Auftrag Fassung 1 | ja | Szenario mit literalen 44× |
| 3.2/P5 Rückgabe unbestimmt (beide) | Auftrag | ja | drei literale Fälle + Gegenprobe |
| 3.3/P7 Ernte-Tests nur Anzahl (beide) | Auftrag | ja | `code` + Zahlen in `message` literal |
| 3.4 Tiefe 4 Nicht-Ziffern (S1) | wie C1 | ja | `foo`-Fall |
| 8/B1 `_reset()` ohne Zeitgeber (beide) | `:454` löscht nur Maps | ja | `clearTimeout`, Test (f) |
| 9/2.3 `melde()` während Folgemeldung (beide) | Auftrag schweigt | ja | synchron schliessen vor Senden, Fensterkennung |
| B2 Einträge wachsen (S2) | `telegramSammelState` wird heute nie gelöscht | ja | Eintrag lebt ≤ 1 Fenster, Test (g) |
| A3/W3 „mit ihren Zählern“ ohne Format (S2) | Auftrag | ja | Format literal (`3 (12×)`) |
| P1 Test (a) ohne Zähler (S2) | in (a) haben alle Studios Zähler 0 | nein für (a) | Zähler in (c) geprüft |
| P2 Test (b) erster Ping (S2) | Auftrag | ja | beide Pings |
| P4 Test (d) Inhalt (S2) | Auftrag | ja | Studios literal |
| P6 Sofort UND Folge getrennt (S2) | Auftrag | ja | getrennt erzwungen |
| W1 Probelauf vs. Laufende-Meldung (S2) | Widerspruch im Auftrag | ja | Probelauf geht vor |
| W4 `beforeExit` nicht awaitbar (beide) | Node-Semantik | ja | Merker, Sockets halten den Prozess |
| W5 `'gesendet'` mehrdeutig (S2) | `melde()` synchron, `:421` ohne await | ja | `'sofort'` = angestossen |
| W6 Iteratorfehler (S2) | `durchlaufeDateien` `:103-123` | ja | Rest des Verzeichnisses verloren, benannt |
| W7 Ziffern/„eine Meldung“ (S2) | Auftrag | teils | Regex `^[1-9][0-9]*$`, eine Gruppe „ohne Studio“ |
| Z1 `:285` `blockiert >= 2` (S1) | Zeile bestätigt, Vorzustand füllt den Zähler | ja | Differenzmessung |
| 5.6 HH:MM-Quelle (S1) | Auftrag | ja | `Intl` Europe/Berlin, Winter/Sommer im Test |
| Timer-Callback wirft (S1) | Auftrag | ja | fängt selbst |

Zahlen: Spur 1 11 Befunde, Spur 2 17 (inkl. P/W); nach Nachmessung 24 Zeilen, 23 tragen ganz oder teilweise, einer
(P1) nicht in der benannten Form. Einzig von Spur 1: 1.2, 5.1, Z1, 5.6. Einzig von Spur 2: A3, B2, P2, P4, P6, W1, W5–W7.

-- Ende --

## Planprüfung der Fassung 2 (30.09.2026, zwei Spuren `deepseek-flash`, verschiedene Bündel)

Spur A (§1/§2) 20 Befunde, Spur B (§3/§4) 14. Stichproben selbst nachgemessen: Env-Merker `core/error-tracker.js:427`
vererbt; `signatur()` nimmt `err.name` vor `err.code` (`:252`); Probelauf meldet je Studio vor `if (!wirklich)`;
`ops/boot-smoke.js` lädt `server.js` in-process; `test_feature_keine_systemeingriffe.js` sperrt `child_process`;
`routes/bezirk-export.js:112` löscht Quarantäne. Alle eingearbeitet in Fassung 3. Blockierend waren: A-B1 (alle
Kandidaten-Attrappen tragen fremde Namen) und B-B1 (Gegenprobe (f) kann wegen der Fensterkennung nicht rot werden).

-- Ende --
