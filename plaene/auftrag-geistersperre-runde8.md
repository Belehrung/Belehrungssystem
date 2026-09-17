# Auftrag: Geistersperre, Runde 8 — VIER gemessene Fehler beheben, dann Schluss

Stand `4a0862b`. Das ist **keine weitere Verfeinerung** des Erkenners — D16
bleibt wortwörtlich stehen: K1 verschiebt die Klasse, es schliesst sie nicht.
Hier werden vier KONKRETE, von mir gemessene Fehler behoben, drei davon in
einer Zeile. Danach geht der Beitrag raus.

**Einordnung: nicht sehr komplex** — vier umrissene Fehler mit je einer
vorgeschriebenen Gegenprobe in beide Richtungen.

## Meine eigenen Messungen am Stand 4a0862b

    Basis                                     138 PASS / 0 FAIL, EXIT 0

    (F1) den GANZEN Regex-Zweig des Maskierers abgeschaltet
         (`if (false && c === '/' && istRegexStart(i))`)
                                           -> 138 PASS / 0 FAIL  WIRKUNGSLOS

    (F2a) Backslash + CRLF-Zeilenfortsetzung im String
          `'await t.run("SELECT \\' + CRLF + 'pg_advisory_xact_lock($1)", …'`
                                           -> 0 Treffer (fachlich 1)
          dieselbe Eingabe mit LF statt CRLF -> 1 Treffer   (Kontrolle)
    (F2b) `//`-Kommentar, durch U+2028 beendet, danach ein echter Lock
                                           -> 0 Treffer (fachlich 1)

    (F3) Objektform:
         `await t.q({ text: "SELECT pg_advisory_xact_lock($1)" }, [studioId]);`
         `await db.q({ text: … }, [studioId]);`
         ergeben BEIDE denselben Eintrag
             `text:"SELECT pg_advisory_xact_lock($1)"},[studioId]);`
         Kontrolle: in der einfachen Form sind die beiden UNTERSCHIEDLICH.

## ZU BEHEBEN

### F1: der Regex-Negativfall der Fixtur prüft nichts

`test/fixturen/advisory-lock-schreibweisen.txt`, Fall
`bezeichner-im-regex-literal`, enthält `/pg_advisory_(?:xact_)?lock/g` — darin
steht gar kein zusammenhängender Bezeichner, den `BEZEICHNER_RE` finden könnte.
Der Fall ist grün, egal was der Maskierer tut. Gemessen: ganzer Regex-Zweig
aus -> 138 / 0.

**Zu bauen:** den Fall auf einen ECHTEN Bezeichner umstellen
(`/pg_advisory_xact_lock/g`, erwartet 0), und den beiden Regex-UMGEBUNGS-Fällen
eine `anweisung:`-Erwartung geben — heute prüfen sie nur die Trefferzahl, und
ein falscher Anweisungsanfang fällt dabei nicht auf.

**Gegenprobe:** Regex-Zweig abschalten -> MUSS rot werden. Unverändert -> grün.

### F2: zwei Zeilentrenner verschlucken einen echten Lock

Beide gemessen, beide in die GEFÄHRLICHE Richtung (ein Treffer zu wenig ist der
grüne Umweg):

- **F2a**, `advisory-lock-erkenner.js` in der Schleife für `'`/`"`: nach einem
  Backslash wird GENAU EIN Zeichen übersprungen. Bei `\` + CRLF ist das nur das
  CR; das LF beendet die Stringerkennung, obwohl der JavaScript-String
  weiterläuft.
- **F2b**, in der Behandlung von `//`: `text.indexOf('\n', i)`. JavaScript
  beendet einen Zeilenkommentar auch an CR, U+2028 und U+2029 — ein Lock
  dahinter gilt dem Maskierer als Kommentar.

**Zu bauen:** `\r\n` nach einem Backslash als EINE Einheit überspringen; den
Zeilenkommentar an `\n`, `\r`, ` ` und ` ` enden lassen. Je ein
FIXTURFALL für beide, mit von Hand hingeschriebener Erwartung.

**Gegenproben:** je die Behebung zurückdrehen -> MUSS rot werden.

### F3: eine Objektklammer schneidet den Verbindungsempfänger ab

Der Rückwärtslauf zur Anweisungsgrenze hält an JEDEM Code-`{`/`}` — auch an
einer Objektliteral-Klammer INNERHALB des Aufrufs. Damit fällt `await t.q(`
bzw. `await db.q(` aus dem Eintrag, und genau die Bindung, für die K3 gebaut
wurde (Transaktionsverbindung gegen POOL, `core/db.js:421` gegen `:443`), ist
für diese Form weg.

`{ text: … }` ist keine erfundene Schreibweise: das ist die
Konfigurationsobjekt-Form der pg-Bibliothek.

**Zu bauen:** beim Rückwärtslauf die Klammertiefe mitzählen — ein `{`/`}`, das
INNERHALB der Klammern des Aufrufs steht, ist keine Anweisungsgrenze.
**Miss dabei, dass die heutigen 26 Inventareinträge zeichengleich bleiben** —
wenn nicht, sag mir welche sich ändern, BEVOR du die literale Liste anpasst.

**Gegenprobe:** die beiden Objektformen (`t.q` und `db.q`) als Fixturfälle mit
je eigener `anweisung:`-Erwartung — sie müssen UNTERSCHIEDLICH sein. Dazu die
Rückdrehung der Behebung -> rot.

### F4: der Kopf der Fixtur stuft eine Grenze falsch ein

Er sagt, alle `GRENZE-`-Fälle irrten „in die SICHERE Richtung". Der Fall
`GRENZE-zusammengesetztes-sql-unsichtbar` (erwartet 0 bei einem ECHTEN Aufruf
aus zusammengesetztem SQL) irrt in die gefährliche. D15 beschreibt es richtig,
der Fixturkopf nicht.

**Zu bauen:** den Kopf berichtigen — die `GRENZE-`-Fälle irren teils sicher,
teils gefährlich, und bei jedem steht dabei, in welche Richtung.

## Auflagen

- **D16 bleibt unverändert.** Diese Runde behauptet NICHT, dass die Klasse
  danach geschlossen ist. Wenn du beim Bauen den Eindruck bekommst, dass
  irgendein Text das doch behauptet, zieh ihn zurecht.
- Die literalen Kennzahlen der Fixtur (47/38/11/10) ändern sich durch die neuen
  Fälle. **Von Hand herleiten, nicht aus dem Lauf abschreiben.**
- Gegenproben wie gehabt: Zielpfad als Argument, Abbruch bei ≠ 1 Fundstelle,
  Marker mitschreiben, `node --check`, Rücknahme gegen unabhängige `cp`-Kopie
  mit `diff` EXIT 0 und md5, nie mit einem Lauf verkettet.
- Zum Schluss: volle Suite ohne Pipe und ohne äusseres `flock`,
  Dateizahl-Ritual, `npm run lint` wörtlich, Marker-Scan, `git status` leer.
  COMMITTE UND PUSHE, BEVOR du auf einen Hintergrundlauf wartest.
- Wegwerf-DB `gymdocu_test`; fehlt sie: `sudo -u postgres createdb -O gymdocu
  gymdocu_test`.
- Widersprich mir, wo ich falsch liege — bei F3 rechne ich damit, dass die
  Klammertiefe Nebenwirkungen auf bestehende Einträge hat.
