# Auftrag: Geistersperre, Runde 7 — die Klasse SCHLIESSEN statt sie zu verschieben

Stand `a392bd6`. Die zweite Prüfspur hat die Leitfrage beantwortet: **ja, zum
FÜNFTEN Mal blind** — und diesmal dreifach am Inventar plus einmal am
Fenster-Wächter. Alle vier von mir selbst gemessen.

**Einordnung: sehr komplex.** Nicht wegen des Umfangs, sondern weil diese Runde
die Klasse strukturell schliessen muss. Fünf Runden Musterverfeinerung haben
fünf Mal eine Ebene tiefer verschoben.

## Die Reihe, vollständig

    Runde 3  Anker band Anzahl/Position statt der BEDINGUNG          58 / 0
    Runde 4  Muster suchte DOPPELTE Anführungszeichen                74 / 0
    Runde 4  Umbenennen-Schlüssel nirgends verankert                 74 / 0
    Runde 5  Inventar suchte `pg_advisory_xact_lock(` WÖRTLICH       87 / 0
    Runde 6  `pg_try_advisory_xact_lock` — andere Funktionsfamilie   88 / 0
    Runde 6  GROSSSCHREIBUNG — SQL-Bezeichner sind case-insensitiv   88 / 0
    Runde 6  Lock-Zeile mit `/* … */`-Präfix — vom Kommentarabzug
             weggeworfen                                             88 / 0
    Runde 6  Nachbar als PFEILFUNKTION — Fenster wächst auf 527
             Zeilen, `funktionsKoepfe` meldet weiter 1               88 / 0

## Die Diagnose, und sie ist der eigentliche Auftrag

Die Kette lautet: **auflisten → lesen → erkennen → sammeln → melden.**

    auflisten/lesen   git ls-files + gescannte Menge   Referenz von AUSSEN  ✓
    sammeln           literale 24er-Liste              Referenz von AUSSEN  ✓
    ERKENNEN          Regex + Kommentarabzug + Fenster  KEINE Referenz      ✗

Jede der fünf Blindstellen sitzt auf der Stufe ERKENNEN. Solange dort nur
handgeführte Einzelmutationen stehen, verschiebt jede weitere Runde die Lücke
eine Ebene tiefer. **Diese Runde gibt dem ERKENNEN eine Referenz von aussen.**

## ZU BAUEN

### K1 (der Kern): eine synthetische FIXTUR für den Erkenner

Eine Datei ausserhalb des erfassten Produktivbaums (z. B.
`test/fixturen/advisory-lock-schreibweisen.txt` — **kein `.js` im gescannten
Bereich**, sonst verändert sie das Inventar selbst), die einen KATALOG von
Schreibweisen enthält, dazu eine **unabhängig von Hand geschriebene
Erwartung**, welche Zeilen einen Eintrag ergeben und welche nicht.

Hinein gehören mindestens, je mit erwartetem Ergebnis:

*Muss ERKANNT werden* — jede einzelne heute gemessen blind oder ungeprüft:
 - `pg_advisory_xact_lock(` normal
 - `pg_advisory_xact_lock (` mit Leerraum vor der Klammer
 - `PG_ADVISORY_XACT_LOCK(` in Grossbuchstaben, dazu gemischte Schreibung
 - `pg_try_advisory_lock`, `pg_try_advisory_xact_lock`
 - die `_shared`-Varianten aller vier — **das ist zugleich die fehlende
   Positivkontrolle**: im ganzen Bestand übt heute KEINE Zeile diesen Zweig der
   Regex aus, die Behauptung „samt _shared" trägt also bisher nichts
 - `pg_advisory_lock` (sitzungsweit) und `pg_advisory_unlock` (s. K4)
 - eine echte Lock-Zeile mit vorangestelltem `/* … */` auf derselben Zeile

*Darf NICHT erkannt werden:*
 - der Bezeichner in der Prosa eines `/** … */`-Blocks (so steht er heute in
   `core/seilgeraete.js`)
 - der Bezeichner in einer `//`-Kommentarzeile
 - eine CSS-Zeile, die mit `*` beginnt (`*{box-sizing:border-box}`) — **davon
   gibt es im Produktivbaum heute 20, und der Kommentarabzug der Runde 6 wirft
   sie ALLE weg** (von mir gezählt)

**Der Erkenner wird dafür in eine eigene Funktion ausgelagert, und die Fixtur
ruft sie in der PRODUKTIONSFORM auf** — dieselben Argumente, dieselben Typen.
Eine ausgelagerte Funktion anders aufzurufen als die Produktion prüft einen
Zweig, den es in Produktion nicht gibt (Hausregel, gemessen 13.09.2026).

### K2: der Kommentarabzug darf keine Codezeilen fressen

Gemessen: `/^\s*(\/\*|\*)/` entfernt heute 20 echte CSS-Codezeilen aus dem
Produktivbaum, und eine Lock-Zeile mit `/* … */`-Präfix verschwindet
vollständig (88 / 0).

Der gierige Abzug über die ganze Datei war NACHWEISLICH schlimmer (18 statt 24
Einträge, sechs Locks verschluckt) — den also nicht zurückholen.

**Vorschlag, den du messen sollst statt ihn zu übernehmen:** gar nicht
vorab abziehen, sondern einen Treffer nur dann zählen, wenn der Bezeichner auf
seiner Zeile innerhalb einer ZEICHENKETTE steht (einfache, doppelte oder
Backtick-Anführungszeichen). Jeder echte Aufruf steht in gequotetem SQL; Prosa
in einem JSDoc-Block steht es nicht. Wenn du beim Messen an der Fixtur
feststellst, dass das nicht trägt, **sag mir WAS konkret dagegen spricht** und
schlag etwas anderes vor — aber nicht still.

### K3: der Inventareintrag beginnt am Bezeichner, nicht an der Anweisung

Gemessen von der Prüfspur: `await t.q("SELECT pg_advisory_xact_lock(…)")` nach
`await db.q(…)` zu ändern — also vom Transaktions- auf den POOL-Weg, womit der
Lock sofort wieder weg ist — lässt das Inventar zeichengleich (88 / 0).

**Zu bauen:** der Eintrag beginnt am Anfang der Anweisung (zurück bis zum
vorigen `;` oder Zeilenanfang), nicht am Bezeichner. Dann steht `t.q` bzw.
`db.q` IM Eintrag und ein Wechsel ist ein neuer Eintrag.

**Gegenprobe:** genau diese Mutation in `core/korrektur-pdf.js` -> MUSS rot
werden.

### K4: `pg_advisory_unlock` gehört ins Inventar

Zwei SITZUNGSWEITE Locks sind seit Runde 6 im Erfassungsbereich
(`core/migrate.js`, `generateMonthlyPDFs.js`). Bei ihnen ist die FREIGABE der
einzige Schutz gegen ein Leck auf einer Pool-Verbindung. Fällt sie weg, hält
die Verbindung den Lock bis zu ihrem Ende — das Inventar bliebe bei 24.

**Gegenprobe:** eine der beiden `pg_advisory_unlock`-Zeilen entfernen -> MUSS
rot werden.

### K5: die Fenstergrenze ist weiterhin an eine ZEICHENFOLGE gebunden

Gemessen: der Nachbar als Pfeilfunktion (`const ladeOffeneHinweise = async
(studioId) => {`) lässt das rohe Fenster von 429 auf 527 Zeilen wachsen, und
`funktionsKoepfe` meldet weiter 1 (88 / 0).

**Zu bauen (messen, welches trägt):** im rohen Fenster darf ausser dem eigenen
Kopf KEINE Bindung auf Spaltenposition 0 stehen — also kein `const `, `let `,
`var `, `function `, `async function `, `class ` oder `router.` am
Zeilenanfang. Sollwert literal 0 (der eigene Kopf ist der Fensteranfang und
zählt nicht mit). Miss das am unveränderten Baum, BEVOR du es festschreibst —
wenn heute schon etwas darin steht, sag es mir mit der Fundstelle.

**Gegenproben:** die Pfeilfunktion-Mutation -> rot; die Leerzeichen-Mutation
aus Runde 6 -> weiterhin rot; unveränderter Baum -> grün.

### K6: der Produktivkommentar behauptet mehr, als der Wächter hält

`routes/sichtpruefung.js` sagt „ein neuer Nehmer in beliebiger Schreibweise ist
ein neuer Eintrag" und zählt die Grenzen des Textscans ABSCHLIESSEND auf. Drei
gemessene Blindstellen fehlen in dieser Aufzählung. Ein Entwickler, der das
liest, baut in bester Absicht den 40P01-Kreis ein.

**Zu bauen:** der Kommentar sagt, was nach K1 wirklich gilt, und die
Grenzen-Aufzählung wird als NICHT abschliessend gekennzeichnet. Der Kommentar
ist das einzige Artefakt dieses Beitrags, das im Produktivcode überlebt.

### K7: der Kopfkommentar von Abschnitt 7 beschreibt den Runde-5-Stand

Er nennt „Inventar aller Advisory-Locks in routes/", „das INVENTAR unten läuft
über die routes/-Teilmenge" und die Bezeichner `BEREICH_ROUTES` /
`ERWARTETER_BEREICH_ROUTES`, die es nicht mehr gibt. Dieselbe Aussage an zwei
Orten, eine davon falsch — unsere häufigste Fehlerquelle.

**Zu bauen:** nachziehen. Dazu die Kleinigkeiten: `const inventarDateien =
gescannt;` ist ein toter Alias (auflösen), und `ERWARTETER_BEREICH_PRODUKTIV`
bekommt ein `Object.freeze` wie sein Gegenstück — es geht als `bereich` in den
Helfer, und ausgerechnet die Referenzseite ist heute ungeschützt.

### K8: der Erfassungsbereich lässt `ops/` und `tools/` aus

Die Geschwisterwächter desselben Helfers erfassen sechs Wurzeln, dieser drei.
`ops/schluessel-rotieren.js` hat ein `db.tx`, und `tools/qr-charge.js` fasst
genau den Nummernraum an, den `core/qr-token.js` und `server.js` mit
`qr-charge-nummer` sperren.

**Zu bauen:** ausweiten, wie in Runde 6 für `core`/`workers`. **Miss vorher,
wie viele Einträge dazukommen** — bei mehr als ein paar sag mir die Zahl,
bevor du die literale Liste aufbläst.

## ZU DOKUMENTIEREN, NICHT ZU BAUEN

- **D13:** die Ordnungs-Zusicherung prüft nur die `seilkontrolle:`-Nehmer, ihr
  TEXT liest sich nach der Ausweitung wie eine baumweite Garantie. Für die
  ebenfalls inventarisierte `nachtrag:`-Klasse steht ein dokumentierter,
  ungelöster Gegenkreis im Bestand (CLAUDE.md, „im Bestand, gemessen
  15.09.2026, NICHT behoben"). **Den Text der Zusicherung einengen** — das ist
  eine Textänderung, kein Bau — und den Gegenkreis hier nennen.
- **D14:** `core/migrate.js` trägt seinen Eintrag an einer STRING-KONSTANTEN,
  nicht an der Sperrstelle (`LOCK_SQL` bei :8, genommen bei :84). Wer den
  Aufruf verschiebt oder die Freigabe entfernt, ändert am Eintrag nichts.
  Gilt für jeden künftigen Lock, dessen SQL in einer Konstanten liegt.

## Auflagen

- Kein Kommentar und kein Testkopf darf mehr behaupten als der Wächter hält.
- Gegenproben wie gehabt (Zielpfad als Argument, Abbruch bei ≠ 1, Marker,
  `node --check`, Rücknahme gegen unabhängige `cp`-Kopie mit `diff` EXIT 0 und
  md5, nie mit einem Lauf verkettet).
- Zum Schluss: volle Suite ohne Pipe und ohne äusseres `flock`,
  Dateizahl-Ritual, `npm run lint` wörtlich, Marker-Scan, `git status` leer.
  COMMITTE UND PUSHE, BEVOR du auf einen Hintergrundlauf wartest.
- Wegwerf-DB `gymdocu_test`; fehlt sie: `sudo -u postgres createdb -O gymdocu
  gymdocu_test`.
- **Wenn du beim Bauen zu dem Schluss kommst, dass K1 die Klasse NICHT
  schliesst, sondern nur verschiebt — sag mir das mit der Begründung.** Dann
  hören wir mit dem Verfeinern auf und schreiben die Grenze hin, statt eine
  achte Runde zu drehen. Das ist ausdrücklich ein erlaubtes Ergebnis.
