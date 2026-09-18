# Auftrag: Runde 4 — den Ernter verdrahten (EIN blockierender Punkt)

Repo `/home/user/gymdocu`, weiter auf `claude/verschluesselung-stufe0`.
PR #455 ist offen, CI läuft. **Nur dieser eine Punkt**, nichts sonst.

## Der Befund

Vom Review-Bot am PR gemeldet (P1), **von mir selbst nachgemessen und
zutreffend**: `ops/gymdocu-verbandbuch-pdf-aufraeumen.js` wird von NIEMANDEM
aufgerufen. Gemessen mit `grep -rn "verbandbuch-pdf-aufraeumen"` über das ganze
Repo: nur Kommentare in `core/retention.js:333`, `core/pdf-root.js:40` und zwei
Zeilen in `docs/offene-befunde-31-08-2026.md`. Kein Cron, kein Deploy-Schritt,
keine Zeile in `server.js`.

**Warum das blockierend ist:** In Runde 3 haben wir das Skript vom
Einmal-Werkzeug zum ERNTER gemacht, ausdrücklich um F5 und F6 zu lösen — eine
Datei, die bei einem Prozessabbruch zwischen Erzeugung und Auslieferung
liegenbleibt, sollte geerntet werden. Der Retention-Resolver kennt nur den
alten festen Namen, findet sie also nie. Wenn niemand den Ernter aufruft, ist
die Behebung von F5/F6 eine Absichtserklärung: Art.-9-Gesundheitsdaten bleiben
dann unbegrenzt im Klartext liegen, und `dateiFehltErwartet` sorgt dafür, dass
es niemandem auffällt.

Das ist wörtlich die Klasse aus der CLAUDE.md — „ein Verdrahtungsfehler ist die
Lücke, die eine Behebung hinterlässt" — und der Fehler steckte in MEINEM
Auftrag von Runde 3: ich habe den Ernter bestellt und vergessen, ihn
anzuschliessen.

## Zu bauen

**Den Ernter an den bestehenden täglichen Lauf hängen.** `server.js` hat 13
`cron.schedule`-Einträge, darunter „Retention-Löschen" (04:30) und eine
PDF-Archiv-Löschung (04:45). Dort gehört er hin — NICHT in eine neue
`cron.d`-Datei: die müsste jemand auf dem Server von Hand installieren, und
genau das passiert erfahrungsgemäß nicht.

Zu klären und im Bericht zu begründen:

1. **Die Aufräumlogik muss als Funktion aufrufbar sein**, ohne die
   CLI-Nebenwirkungen. Heute räumt `hauptlauf()` in seinem `finally` den
   Datenbankpool ab (`db.pool.end()`) — in einem laufenden Webprozess wäre das
   fatal. Trenne das: der CLI-Pfad behält sein Aufräumen, der In-Process-Pfad
   fasst den Pool NICHT an. Miss nach, dass der Pool danach noch benutzbar ist;
   das ist die gefährlichste Stelle dieses Auftrags.
2. **Der geplante Lauf läuft scharf** (`--wirklich`-Äquivalent), sonst zählt er
   nur. Die Altersschwelle aus Runde 3 bleibt unverändert der Schutz gegen das
   Löschen aktiver Downloads.
3. **Ein Wächter, der die Verdrahtung selbst zusichert.** Genau diese Lücke
   soll nicht wiederkommen: eine Zusicherung, die rot wird, wenn der Aufruf aus
   `server.js` verschwindet. Miss die Gegenprobe — Aufruf entfernen, Wächter
   muss fallen.
4. **Der Lauf darf den Webprozess nicht blockieren** und darf bei einem Fehler
   den Cron-Nachbarn nicht mitreissen. Sieh dir an, wie die benachbarten
   `cron.schedule`-Einträge ihre Fehler behandeln, und halte dich an dasselbe
   Muster statt ein eigenes zu erfinden.

## Ausdrücklich NICHT

- Keine neue `cron.d`-Datei, kein Eingriff in `ops/deploy.sh`.
- Keine Änderung an der Erntelogik selbst, an den Routen, an `core/retention.js`
  oder an `core/pdf-engine.js`.
- D19 bleibt offen und ungebaut.

## Abschluss

Gegenprobe zu jeder neuen Zusicherung in beide Richtungen mit Zahlen. Volle
Suite ohne Pipe, Dateizahl-Ritual als MENGENvergleich, `npm run lint` wörtlich,
Marker-Scan (Sollwert 6), `git status` sauber. Committen und pushen — der PR
ist offen, der Push aktualisiert ihn.

Widersprich, wo deine Messung meinen Angaben widerspricht. Insbesondere:
Wenn der In-Process-Aufruf aus einem Grund, den ich nicht bedacht habe, nicht
geht, brich ab und sag es, statt etwas zu bauen, das im Webprozess Schaden
anrichtet.
