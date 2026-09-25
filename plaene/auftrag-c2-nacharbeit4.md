# Auftrag C2 Nacharbeit 4 (25.09.2026)

Grundlage: `plaene/diffpruefung-c2.md`, Abschnitt „Runde 4“ (C2R4-1..C2R4-14). Baum `/workspace/gymdocu-c2`, Zweig
`fix-c2-stille-fehler`, Kopf `32822d9`. Mess-Skripte der Prüfspur: `scratchpad/c2r4/cc/` (`sim1.js` Telegram-Zeitfolgen
mit zählender fetch-Attrappe, `m15.js` echter Monatslauf, `grenz.js`, `abbruch.js`, `perf.js`, `probe-*.js`,
Mutationsliste im Bericht) — vor dem Bau gegen deinen Stand laufen lassen (muss das gemeldete Verhalten zeigen), danach
erneut; BEIDES wörtlich (in Nacharbeit 2 und 3 fehlte die Vorher-Messung — diesmal Pflicht). Einzeltests nur gegen eine
eigene DB (`gymdocu_c2n4_test`). Einordnung: nicht sehr komplex (Standard) — der Zeitgeber ist die einzige neue Mechanik.

Leitgedanke des Beitrags: STILLE FEHLER sichtbar machen. Jeder Fehler, der vor diesem Zweig per Telegram ankam, muss
danach mindestens genauso vollständig, mit richtiger Studioangabe und höchstens ein Fenster später ankommen — nur mit
weniger Pings.

## 1. Telegram-Sammelstufe richtig (C2R4-1, C2R4-2, C2R4-4, C2R4-14 — blockierend)

Je studioloser Signatur:
- **Erste Meldung eines Fensters** geht sofort raus und nennt das AUSLÖSENDE Studio (mit dem Unterdrückungszähler der
  ersten Stufe, wie vor diesem Zweig: „(N× seit letztem Ping unterdrückt)“).
- **Weitere Studios im selben Fenster** werden gesammelt (mit ihren Zählern). Am Fensterende (Zeitgeber je Gruppe,
  `unref()`, damit er keinen Prozess am Leben hält) geht GENAU EINE Folgemeldung raus, wenn etwas gesammelt wurde:
  „Derselbe Fehler seit HH:MM (Europe/Berlin) zusätzlich in N Studios: …“ (Liste wie heute, begrenzt mit „+K weitere“).
  Danach ist das Fenster geschlossen; das nächste Auftreten eröffnet ein neues mit sofortiger Meldung.
- **Prozessende:** ein CLI-Lauf (Reste-Ernte, Monatslauf von der Kommandozeile) darf gesammelte Studios nicht verlieren —
  vor dem Ende gesammelte Gruppen senden (`beforeExit`, einmalig, awaitet die Sendungen). Wo ein Weg `process.exit()`
  direkt ruft, benennen, ob er sammeln kann; wenn ja, dort vorher leeren.
- `melde()` gibt zusätzlich zurück, was mit Telegram geschah (`telegram: 'gesendet' | 'gesammelt' | 'gedrosselt'`).
- Pflichttests über das ECHTE `melde()` mit zählender fetch-Attrappe und injizierter Zeit bzw. injizierbarem Zeitgeber
  (kein Warten in Echtzeit): (a) 50 Studios in 10 s, dann Ruhe → genau 2 Pings: „Studio: 1“ sofort und nach Fensterende
  „zusätzlich in 49 Studios“; (b) Einzelfehler Studio 7, zwei Stunden später Studio 8 → zweiter Ping nennt 8; (c) Route
  100× in 30 min → Zähler im Text; (d) CLI-Ende mit gesammelten Studios → Folgemeldung vor dem Ende; (e) Rückgabewert.
  Literale Sollwerte; Gegenprobe je Fall (u. a. Zeitgeber entfernt → (a) ROT; Auslöser nicht genannt → (b) ROT).

## 2. Datenschutz-Prüfung am gesendeten Text (C2R4-3 — blockierend)

Alle Datenschutz- und Token-Zusicherungen in `test_feature_error_tracking.js`, die heute `baueText()` prüfen, prüfen
den Text, den die fetch-Attrappe tatsächlich abfängt (Sofortmeldung UND Folgemeldung). Der Kommentar `:298` wird
berichtigt. Gegenproben: `err.message` bzw. roher `originalUrl` im Sammeltext → ROT mit Zahl. Ist `baueText()` danach
unbenutzt, entfernen (oder begründen, wer es noch braucht).

## 3. Reste-Ernte (C2R4-6..C2R4-9, C2R4-12, C2R4-13)

- **Fehler mitten im Durchlauf** (C2R4-6): ein Fehler beim Lesen eines Verzeichnisses (auch während der Iteration) wird
  für DIESES Verzeichnis gezählt, der Durchlauf geht weiter; gesunde Studios werden geerntet. `server.js` wertet
  `abgebrochen` aus wie `fehler`.
- **Melden am Laufende** (C2R4-7): hat der Lauf `fehler > 0` oder ist er `abgebrochen` (auch Wurzel-Symlink,
  übersprungene Symlinks, Anomalien), geht EIN `melde()` mit den Zahlen und bis zu drei Beispielpfaden raus.
  `ernteInProcess` setzt einen Fehler-Exit-Code nicht stillschweigend zurück (begründen, was es stattdessen tut).
- **Schema** (C2R4-8, C2R4-9): unter `_quarantaene/` gilt NUR das Schema `<Studio>/<Typ>/<Datei>` (also `relTeile.length
  >= 4`); alles andere darunter — auch `.tmp-*` — ist Anomalie (gezählt, gemeldet, nie gelöscht). Die `.tmp-`-Regel gilt
  nur ausserhalb von `_quarantaene/`. Vor dem Bau messen und berichten, welche Tiefen die Erzeuger schreiben
  (`createDocument`, `meta.modulFolder` — kann er einen Schrägstrich enthalten?).
- **Studiozuordnung** (C2R4-12): Studio nur aus einem Ziffern-Ordner; sonst „ohne Studio“ (eine Meldung dafür).
- **Probelauf** (C2R4-13): meldet nicht per `melde()`, nur ins Log; der scharfe Lauf meldet.
- Pflichttests: `abbruch.js`-Fall (EIO nach einem Eintrag in einem Studio → übrige Studios geerntet, `fehler 1`, eine
  Meldung); `_quarantaene/13/notiz.txt` (Tiefe 3) und `_quarantaene/.tmp-x` bleiben und werden gemeldet; Wurzel-Symlink →
  Meldung; Probelauf → 0 `melde()`. Je Gegenprobe ROT.

## 4. Tests, die fallen können (C2R4-5, C2R4-10, C2R4-11)

- Je ein Test, der unter E2, E9, E3, E4, E8, R8 ROT wird (Stellen: Bericht der Prüfspur, `scratchpad/c2r4/cc/`).
- Streaming im `hauptlauf` (C2R4-10): statt `ticks >= 1` eine REIHENFOLGE-Zusicherung — mit einer injizierten
  `opendir`-Attrappe, die viele Einträge liefert, wird festgehalten, dass der erste Kandidat verarbeitet (`stat`
  gerufen) ist, BEVOR der letzte Eintrag geliefert wurde. Gegenprobe R17 (erst alles sammeln) → ROT.
- Verdrahtungs-Wächter (C2R4-11): der Cron-Ausdruck der Ernte literal; der Aufruf steht in SEINEM EIGENEN try/catch (nicht
  im Fenster des Nachbarn). Gegenproben V1 (`'0 5 31 2 *'`) und „eigenes try entfernt“ → ROT.

Nicht in diesem Auftrag: C2R4-15 (Sammelliste C2-S11).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab (laufender Zeitgeber je Fehlergruppe, gesammelte Studios beim
Prozessende, Anomalie-Meldungen der Ernte) — und erreicht danach JEDER Fehler, der auf `a1a41d7` per Telegram ankam, den
Betreiber vollständig, mit richtigem Studio, höchstens ein Fenster später? Was passiert bei einem pm2-Reload mitten in
einem Fenster?

-- Ende des Auftrags --
