# Auftrag C2 Nacharbeit 4 (Fassung 2, 29.09.2026)

Grundlage: `plaene/diffpruefung-c2.md`, Abschnitt „Runde 4“ (C2R4-1..C2R4-14); Planprüfung der Fassung 1
`plaene/planpruefung-c2-n4-roh.md`, am Code nachgemessen in `plaene/planpruefung-c2-n4.md`. Baum `/workspace/gymdocu-c2`,
Zweig `fix-c2-stille-fehler`, Kopf `32822d9`. Mess-Skripte der Prüfspur: `scratchpad/c2r4/cc/` (`sim1.js`, `m15.js`,
`grenz.js`, `abbruch.js`, `perf.js`, `probe-*.js`, Mutationsliste im Bericht) — vor dem Bau gegen deinen Stand laufen
lassen (muss das gemeldete Verhalten zeigen), danach erneut; BEIDES wörtlich. Einzeltests nur gegen eine eigene DB
(`gymdocu_c2n4_test`). Einordnung: nicht sehr komplex (Standard) — Zeitgeber und Signal-Weg sind die einzige neue
Mechanik, beide unten festgelegt.

Leitgedanke: STILLE FEHLER sichtbar machen. Jeder Fehler, der auf `a1a41d7` per Telegram ankam, kommt danach mindestens
so vollständig, mit richtigem Studio und höchstens ein Fenster (15 min) später an — nur mit weniger Pings. Wo das nicht
erreichbar ist, steht die Grenze unten ausdrücklich, und das Server-Log (`[ERR-TRACK]`, schreibt `melde()` bei JEDEM
Aufruf) hat den Fehler trotzdem.

## 1. Telegram-Sammelstufe (C2R4-1, -2, -4, -14; Planprüfung A1–A3, B1, B2, Frage 2.3)

Je studioloser Signatur (Schlüssel wie heute `signaturOhneStudio`) ein FENSTER von `DROSSEL_MS`:

- **Öffnen:** Die erste Meldung, die die erste Stufe (`pruefeDrossel`) durchlässt, öffnet das Fenster und geht SOFORT
  raus, mit dem AUSLÖSENDEN Studio (`Studio: <id>`) und dem Zähler der ersten Stufe wie bisher
  („(N× seit letztem Ping unterdrückt)“, nur bei N > 0). Beim Öffnen wird EIN Zeitgeber auf Fensterende gestellt
  (`unref()`).
- **Sammeln:** Jede weitere durchgelassene Meldung derselben Gruppe im offenen Fenster wird gesammelt, nicht gesendet:
  je Studio einmal, mit der SUMME der Zähler der ersten Stufe seiner gesammelten Meldungen.
- **Schliessen:** Ein Fenster ist geschlossen, sobald `now - start >= DROSSEL_MS` — gleich, ob der Zeitgeber schon lief.
  Geschlossen wird SYNCHRON und vor jedem Senden: Liste übernehmen, Eintrag entfernen, dann (nicht awaitend) senden.
  Wurde etwas gesammelt, geht GENAU EINE Folgemeldung raus:
  `Derselbe Fehler seit HH:MM (Europe/Berlin) zusätzlich in N Studios: 3 (12×), 4, 9` — Studios aufsteigend, Zähler nur
  bei > 0, höchstens 10 genannt, sonst `, +K weitere`. HH:MM = Fensterbeginn, gebildet mit `Intl`/`toLocaleString` und
  `timeZone: 'Europe/Berlin'` (Muster `core/datum.js:62`), nie `getHours()`/`toISOString()`.
  Ruft `melde()` die Gruppe mit abgelaufenem Fenster auf, bevor der Zeitgeber lief, schliesst `melde()` das alte Fenster
  selbst (Folgemeldung) und öffnet ein neues (Sofortmeldung). Der später feuernde alte Zeitgeber erkennt über eine
  Fensterkennung, dass sein Fenster nicht mehr existiert, und tut nichts. Der Zeitgeber-Rückruf fängt jeden Fehler
  selbst (Log), wirft nie.
- **Speicher:** Ein Eintrag lebt höchstens ein Fenster; danach ist er entfernt (Zeitgeber oder `melde()`). Keine
  weitere Obergrenze — die Zahl gleichzeitiger Einträge ist die Zahl verschiedener studioloser Signaturen der letzten
  15 min.
- **`_reset()`** löscht zusätzlich alle laufenden Zeitgeber (`clearTimeout`).
- **Zeit und Zeitgeber injizierbar** (kein Warten in Echtzeit in Tests).
- **Rückgabe:** `melde()` gibt zusätzlich `telegram: 'sofort' | 'gesammelt' | 'gedrosselt'` zurück. `'sofort'` heisst
  „Versand angestossen“, NICHT „zugestellt“ (`melde()` bleibt synchron); so im Kommentar.
- **Leeren:** exportiertes `leereSammlung()` → schliesst ALLE offenen Fenster (Folgemeldungen) und liefert ein Promise,
  das erfüllt ist, wenn diese Sendungen fertig sind.

Prozessende — drei Wege, jeder mit eigener Zusicherung:
- **Natürliches Ende eines Prozesses** (CLI ohne `process.exit`): `beforeExit`-Handler, einmalig (Merker), startet
  `leereSammlung()`. Ein `beforeExit`-Handler wird nicht awaited; der Prozess lebt weiter, solange die fetch-Sockets
  offen sind, und `beforeExit` feuert danach erneut — daher der Merker.
- **Signal** (pm2 schickt beim Reload `SIGINT`, `ecosystem.config.js:18` `kill_timeout: 120_000`): `installProcessHandlers()`
  registriert zusätzlich `SIGINT` und `SIGTERM`: erstes Signal → `Promise.race([leereSammlung(), 5 s])`, dann
  `process.exit(128 + Signalnummer)` (130 bzw. 143, wie Nodes Standard). Zweites Signal während des Leerens → sofort
  `process.exit` mit demselben Code. Vor dem Bau per `grep` alle Tests und Skripte finden, die `server.js` als
  Kindprozess starten und per Signal beenden (u. a. `ops/boot-smoke.js`, E2E-Helfer), und berichten, ob einer
  `signal === 'SIGTERM'`/`'SIGINT'` statt eines Exit-Codes prüft — dann dort anpassen.
- **`uncaughtException`** (`core/error-tracker.js:434-438`): nach `melde()` sofort `leereSammlung()` anstossen; der
  bestehende 1500-ms-Exit bleibt (dieselbe Frist wie heute für die Sofortmeldung des Absturzes selbst).
- **`process.exit()` in CLI-Wegen:** `regenerierePdfMonat.js:59` und `:60` (Monatslauf von der Kommandozeile, sammelt)
  awaiten vorher `leereSammlung()` (Deckel 5 s). Weitere Wege: nur solche, die als eigener Prozess starten UND den
  Monatslauf oder die Ernte ausführen — Methode am bekannten Positivfall `regenerierePdfMonat.js` lernen, Liste im
  Bericht.

**Benannte Grenzen** (kommen auf die Sammelliste `plaene/offene-befunde-c2.md`, nicht still): ein harter Abbruch
(SIGKILL, OOM) oder ein hier nicht gelistetes `process.exit()` verliert höchstens die FOLGEMELDUNG eines Fensters — die
Sofortmeldung ist raus, jeder Einzelfall steht im Server-Log. `workers/pdf-job-worker.js` ruft
`installProcessHandlers()` nicht und bekommt keinen Signal-Weg (hat eigene SIGTERM-Behandlung, nicht Teil dieses
Auftrags).

Pflichttests über das ECHTE `melde()` mit zählender fetch-Attrappe, injizierter Zeit und injiziertem Zeitgeber; jeder
Sollwert literal im Test, jede Gegenprobe mit PASS/FAIL-Zahl:
- (a) Studios 1..50 je einmal bei t = 0,2 s … 9,8 s (Schritt 0,2 s), dann Ruhe. Start t0 = `2026-01-15T11:00:00Z`.
  Genau 2 Pings: der erste enthält `Studio: 1` und NICHT `zusätzlich`; der zweite (Zeitgeber bei t0 + 900 s) enthält
  wörtlich `Derselbe Fehler seit 12:00 (Europe/Berlin) zusätzlich in 49 Studios: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, +39 weitere`.
  Dasselbe mit t0 = `2026-07-15T11:00:00Z` → `seit 13:00`. Gegenproben: Zeitgeber entfernt → ROT; `getUTCHours` statt
  Berlin → ROT.
- (b) Studio 7 bei t = 0, Studio 8 bei t = 7200 s → genau 2 Pings, erster enthält `Studio: 7`, zweiter `Studio: 8`, keiner
  `zusätzlich`. Gegenprobe „Auslöser nicht genannt“ → ROT.
- (c) Studio 5, dieselbe Route, 100 Aufrufe bei t = 10 + 20·i s (i = 0..99). Genau 3 Pings (t = 10, 910, 1810): der erste
  ohne `unterdrückt`, der zweite und dritte mit `(44× seit letztem Ping unterdrückt)`. Zweimal gefahren: bei t = 910 und
  1810 einmal ERST den Zeitgeber, dann `melde()`, einmal umgekehrt — beide Reihenfolgen dieselben 3 Pings.
- (d) Folgemeldung am Prozessende, je ein KINDPROZESS (`node` mit einer per `--require` vorgeladenen fetch-Attrappe,
  die jeden Aufruf in eine Datei im eigenen Temp-Verzeichnis schreibt; kein Netz): natürliches Ende; `SIGTERM` bei
  offenem Fenster; `uncaughtException`. Je Sollwert: die Folgemeldung mit den gesammelten Studios steht in der Datei,
  Exit-Code literal (0 bzw. 143 bzw. 1). Gegenproben: `beforeExit`-Handler entfernt, Signal-Handler entfernt → je ROT.
- (e) Rückgabe literal je Fall: erster Aufruf `'sofort'`, gesammelter `'gesammelt'`, von der ersten Stufe gedrosselter
  `'gedrosselt'`. Gegenprobe: immer `'sofort'` → ROT.
- (f) `_reset()` bei offenem Fenster mit gesammelten Studios, danach Zeitgeber feuern lassen → 0 fetch-Aufrufe.
  Gegenprobe: `clearTimeout` entfernt → ROT.
- (g) Nach Fensterende ist der Eintrag entfernt (`_telegramSammelState.size === 0`). Gegenprobe: Löschen entfernt → ROT.

## 2. Datenschutz am gesendeten Text (C2R4-3)

Alle Datenschutz- und Token-Zusicherungen in `test_feature_error_tracking.js`, die heute `baueText()` prüfen, prüfen den
Text, den die fetch-Attrappe abfängt — getrennt für eine Sofortmeldung UND eine per Zeitgeber erzwungene Folgemeldung.
Kommentar `:298` berichtigen. Gegenproben: `err.message` in die Folgemeldung → die betreffende Zusicherung ROT;
roher `originalUrl` in die Sofortmeldung → ROT; je mit PASS/FAIL-Zahl. Ist `baueText()` danach unbenutzt, entfernen.
`test_feature_error_tracking.js:285` (`netzZaehler.blockiert >= 2`, Vorzustand erzwingt das Ergebnis): durch eine
Differenzmessung um genau die benannten Aufrufe ersetzen; Gegenprobe: einer der beiden sendet nicht → ROT.

## 3. Reste-Ernte (C2R4-6..-9, -12, -13; Planprüfung C1, W1, W6, W7, Frage 5.1/5.2)

- **Kandidat unter `_quarantaene/`** nur, wenn ALLES gilt: zweites Segment ist eine Studio-ID (`/^[1-9][0-9]*$/`),
  mindestens vier Segmente (`_quarantaene/<Studio>/<Typ>/…/<Datei>` — tiefer bleibt erlaubt, s. Kommentar `:225-227`),
  und der Dateiname hat die Form, die `core/pdf-engine.js#quarantaenePfad` (`:136-140`) erzeugt:
  `/^\d{13}-[0-9a-f]{8}-./`. Einziger Erzeuger laut Stand ist `quarantaenePfad` (vor dem Bau per `grep` bestätigen und
  berichten); `core/provisioning.js` löscht dort nur. Alles andere unter `_quarantaene/` — auch `.tmp-*`, Tiefe 3,
  Nicht-Ziffern-Studio, fremde Dateinamen — ist ANOMALIE: gezählt, ins Log, nie gelöscht. Die `.tmp-`-Regel gilt nur
  ausserhalb von `_quarantaene/`.
  `test_feature_pdf_reste_ernte.js:141` (Tiefe 5, `wichtig.pdf`): die Attrappe bekommt einen Namen der Erzeugerform (bleibt
  geerntet); zusätzlich derselbe Pfad mit `wichtig.pdf` → bleibt.
- **Studiozuordnung:** nur aus einem Ziffern-Ordner; sonst „ohne Studio“ (`studioId` null) — eine Gruppe für alle.
- **Fehler mitten im Durchlauf** (C2R4-6): ein Fehler beim Öffnen ODER Iterieren eines Verzeichnisses wird für DIESES
  Verzeichnis gezählt; dessen restliche Einträge sind verloren (ein Iterator-Fehler lässt kein Weiterlesen zu — so im
  Kommentar), Geschwister- und Elternverzeichnisse laufen weiter. `server.js` wertet `abgebrochen` wie `fehler`.
- **Melden am Laufende** (C2R4-7), NUR im scharfen Lauf: bei `fehler > 0`, Anomalien oder `abgebrochen` genau EIN
  `melde()` mit festem `err.code` (`ERNTE_FEHLER` bzw. `ERNTE_ABGEBROCHEN`), `quelle: 'pdf-reste-ernte:lauf'`, ohne Studio.
  Zahlen und bis zu drei Beispielpfade stehen in `err.message` — sie landen damit NUR im Server-Log; der Telegram-Text
  trägt Signatur (Code) und Hinweis auf das Log (DSGVO-Regel `core/error-tracker.js:350-359`, gewollt, im Kommentar
  benannt).
- **Probelauf** (C2R4-13): ruft `melde()` NIE, auch nicht bei Fehlern oder Anomalien — nur Log. Das geht der Regel davor
  vor.
- **`ernteInProcess`**: stellt den Exit-Code weiter zurück (der Webprozess darf ihn nicht erben — beim Signal-Ende
  setzt §1 den Code ohnehin selbst); die Auswertung liegt beim Rückgabewert (`server.js`) und bei der Meldung oben.
  So im Kommentar.
- Pflichttests: `abbruch.js`-Fall (EIO beim Iterieren nach einem Eintrag in Studio 3 → Studios 4 und 5 geerntet,
  `fehler: 1`, genau ein `melde()` mit `code === 'ERNTE_FEHLER'`, `message` enthält die Zahlen literal);
  `_quarantaene/13/notiz.txt` (Tiefe 3), `_quarantaene/.tmp-x`, `_quarantaene/foo/Wartung/<Erzeugername>`,
  `_quarantaene/13/Wartung/notiz.txt` (fremder Name) — alle 60 Tage alt, alle bleiben, alle im Log als Anomalie,
  genau ein `melde()`; Wurzel-Symlink → ein `melde()` mit `ERNTE_ABGEBROCHEN`; Probelauf mit denselben Fällen → 0
  `melde()`. Je Gegenprobe ROT (u. a. Namensprüfung entfernt → `_quarantaene/13/Wartung/notiz.txt` gelöscht → ROT;
  Ziffernprüfung entfernt → `foo`-Fall gelöscht → ROT).

## 4. Tests, die fallen können (C2R4-5, -10, -11)

- Je ein Test, der unter E2, E9, E3, E4, E8, R8 ROT wird (Stellen: Bericht der Prüfspur, `scratchpad/c2r4/cc/`).
- Streaming im `hauptlauf` (C2R4-10): Reihenfolge-Zusicherung mit injizierter `opendir`-Attrappe (erster Kandidat
  verarbeitet — `stat` gerufen —, BEVOR der letzte Eintrag geliefert wurde). Gegenprobe R17 → ROT.
- Verdrahtungs-Wächter (C2R4-11): Cron-Ausdruck der Ernte literal; der Aufruf steht in SEINEM EIGENEN try/catch.
  Gegenproben V1 (`'0 5 31 2 *'`) und „eigenes try entfernt“ → ROT.

Nicht in diesem Auftrag: C2R4-15 (Sammelliste C2-S11).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab (Zeitgeber je Gruppe, Signal-Handler im Webprozess, gesammelte
Studios beim Prozessende, Anomalie-Meldungen der Ernte) — und erreicht danach JEDER Fehler, der auf `a1a41d7` per
Telegram ankam, den Betreiber vollständig, mit richtigem Studio, höchstens ein Fenster später? Was passiert bei einem
pm2-Reload mitten in einem Fenster, und verändert der Signal-Handler das Verhalten eines Deploys (Dauer, Exit-Code,
Health-Gate)?

-- Ende des Auftrags --
