# Auftrag — Rechtsstand-Wächter Stufe 1, RUNDE 5 (die letzte Bau-Runde)

**Eine Grenze, die ich an MEINEM Verhalten ziehe, nicht an euren Befunden:**
Nach dieser Runde baue ich nur noch, was BLOCKIEREND ist. Alles andere wird
als datierter offener Punkt festgehalten und ist ein eigener Beitrag. Das ist
keine Vorhersage, dass nichts mehr kommt — es ist eine Festlegung darauf, was
ich damit tue.

Runde 4 (`a855bfc`) ist gut gebaut: Suite `SUITE_EXIT=0`, 218 PASS / 0 FAIL,
Dateizahl 325 = 325, Lint EXIT 0, Marker 6. Alle vier beauftragten Punkte
tragen, von mir selbst nachgemessen, inklusive Positivkontrolle (eine ECHTE
Netzstörung bekommt weiterhin die Gnadenfrist, nur der Versionsfall
überspringt sie).

---

## 1. BLOCKIEREND — die Behebung aus Runde 4 hat einen SCHWEREREN Fehler eingebaut

Um die Fussnoten-Lücke zu schliessen, wurde `<fussnoten>` auf
`<fussnoten\b[^>]*>` erweitert. **Das matcht jetzt auch das
selbstschliessende `<fussnoten/>`** — und weil der gepaarte Ausdruck ZUERST
läuft, frisst er alles von dort bis zur nächsten schliessenden Fussnote,
**echten Normtext inklusive**.

**Selbst gemessen:**

    <text>ERSTER SATZ.</text><fussnoten/>
    <text>ZWEITER SATZ DARF NICHT VERSCHWINDEN.</text>
    <fussnoten><Content><P>Fussnote</P></Content></fussnoten>

    MIT  <fussnoten/> davor -> "ERSTER SATZ."
    OHNE <fussnoten/> davor -> "ERSTER SATZ.\nZWEITER SATZ DARF NICHT VERSCHWINDEN."

**Warum das schlimmer ist als ein falscher Hash:** Das Register wird von
DERSELBEN Funktion erzeugt (`tools/rechtsstand-normtext-hashes.js` ruft
`normtextAusXml()`). Eine in diesem Zustand bestätigte Quelle trüge den
Fingerabdruck eines GEKÜRZTEN Textes — und der Wächter bliebe für jede
Änderung im verschluckten Bereich **dauerhaft grün**. Genau die Blindheit,
gegen die dieser ganze Beitrag gebaut ist. Und `<fussnoten/>` ist keine
Theorie: unsere eigenen BGB-Fixturen benutzen es.

**Der Bestand ist heute NICHT betroffen** — von mir nachgemessen, mit dem
Code aus Runde 4 gegen die echten Quellen: **46 von 61 geprüft, 0
Abweichungen**, 15 netzbedingt nicht erreichbar. Kein bestätigter
Fingerabdruck hat sich bewegt. Die Lücke ist also latent, und die Behebung
ist deshalb billig — sie muss nur kommen, BEVOR jemand eine Quelle in diesem
Zustand bestätigt.

**Zu bauen:** Die selbstschliessende Form zuerst entfernen, dann die
gepaarte — oder einen Ausdruck, der die selbstschliessende nachweislich nicht
als Öffner nimmt. **Prüfe den Weg, übernimm ihn nicht ungemessen.**

**Zu beweisen:**
- Eine Fixtur mit BEIDEN Formen im selben `<textdaten>`, deren erwarteter
  Klartext von Hand hingeschrieben ist und den zweiten Satz enthält.
  Gegenprobe: mit der Reihenfolge aus Runde 4 muss sie fallen.
- Der Abgleich gegen die echten Quellen danach erneut: **0 Abweichungen**.
  Bewegt sich einer, HALTE AN und melde.

## 2. BLOCKIEREND — die neue Meldung verliert genau das, was sie retten sollte

Die Sicherheitskürzung am Ende schneidet die Sammelzeile „und N weitere
Befunde", den Abschnitt „Zusätzlich ruhig" und die Liste „N Quelle(n)
diesmal NICHT erreichbar" weg — sie stehen hinten und fliegen zuerst raus.

Gemessen (fremde Spur, gegen die echten Module, Zahlen im Befund): **genau
das Szenario, für das Runde 4 gebaut wurde** — alle 18 Gesetze melden sich
wegen der alten Ops-Kopie als nicht erreichbar — ergibt 4073 Zeichen, wird
gekürzt, zeigt nur 11 von 18 Gesetzen, und die Sammelzeile fehlt vollständig.
Ebenso: bei 15 roten, 5 ruhigen und 3 unbestätigten Quellen enthält die
Meldung weder den ruhigen Abschnitt noch die Unerreichbar-Liste.

Der Kommentar daneben behauptet, ein Fund werde „nur VOLLSTÄNDIG gezeigt oder
VOLLSTÄNDIG weggelassen, nie zerteilt". Gemessen wird nach der Kopfzeile
eines Eintrags geschnitten, sein Rumpf fällt weg.

**Zu bauen:** Was NIE wegfallen darf, wird zuerst gebaut und bekommt seinen
Platz reserviert: die Zahl der Befunde je Lage, die Sammelzeile, und die
Liste der nicht erreichbaren Quellen. Die ausführlichen Einträge füllen den
REST. Lieber zwei ausführliche Einträge und eine vollständige Übersicht als
elf Einträge und keine Übersicht — im Massenfall braucht der Betreiber
zuerst „was ist systematisch kaputt", nicht die ersten elf Einzelfälle.

**Zu beweisen:** genau die drei gemessenen Fälle oben als Zusicherungen, mit
Gegenprobe. Und die Zusicherung über die Länge prüft `<= grenze`, nicht
`< 2500` (s. Punkt 5).

## 3. Dieselbe Attribut-Inkonsistenz, zwei Muster weiter

Gemessen: `<enbez builddate="x">` wirft „kein `<norm>`-Block … gefunden",
`<textdaten builddate="x">` wirft „hat keinen `<textdaten>`-Block" — während
`<norm\b[^>]*>` und (seit Runde 4) `<fussnoten\b[^>]*>` Attribute zulassen.
Ein einziges Attribut beim Verlag machte damit ALLE 61 Quellen auf einmal zum
Prüfungsfehler.

Zu bauen: beide Muster gleichziehen, mit Zusicherung je Muster.

## 4. `pruefungsfehler` verschluckt eine geänderte Standangabe

Dieselbe Informationslücke, die Runde 3 für `normtext_unbestaetigt`
geschlossen hat, besteht im Nachbarzweig weiter: `bewerteGiiXml()` gibt bei
einem Extraktionsfehler weder `standAlt` noch `standNeu` zurück, obwohl
beide im Gültigkeitsbereich liegen. Der Betreiber behebt die Extraktion und
erfährt nie, dass sich das Gesetz zugleich bewegt hat.

Zu bauen: beide Felder mitgeben, die Meldung nennt sie, wenn sie abweichen —
wortgleich zur Lösung bei `normtext_unbestaetigt`.

## 5. Eine Zusicherung, die ihre eigene Eigenschaft nicht misst

Gemessen: `begrenzeMeldungsLaenge('a'.repeat(5000), 10)` liefert **108
Zeichen** — also mehr als die Grenze. Die deckende Zusicherung prüft nur
`.length < 2500` und ist damit vom Defekt wie von der Behebung gleichermassen
erfüllt.

Zu bauen: `<= grenze` zusichern. Das ist heute rot und muss es sein, bis die
Funktion ihre eigene Grenze einhält.

## 6. `STATUS_PFAD` geht ohne `esc()` in die Meldung

Er stammt aus `process.env.RECHTSSTAND_STATUS`, und `main()` liest
`/etc/environment` ein. Ein Pfad mit `&`, `<` oder `>` lässt Telegram bei
`parse_mode: 'HTML'` die GANZE Meldung ablehnen — der Lauf verliert alle
Befunde. Die statische `esc()`-Prüfung greift hier nicht: sie belegt nur, dass
`esc()` im Aufrufgraph erreichbar ist.

## 7. Die Versionsdiagnose schliesst aus einer Abwesenheit

`bewerteGiiXml()` leitet „die installierte Kopie ist veraltet" allein daraus
ab, dass `xmlText` fehlt — und sagt es dem Betreiber als Tatsache, mit einem
konkreten `install`-Befehl, unter Überspringen der Gnadenfrist. Jede andere
Ursache für ein fehlendes XML führt damit zu einer selbstbewussten
Fehldiagnose: der Betreiber installiert, nichts ändert sich, der echte Fehler
bleibt verdeckt.

Zu bauen: `holeAbrufGiiXml()` setzt ein ausdrückliches Merkmal (etwa
`lieferung: 'xml'`). Fehlt das Merkmal, ist es die alte Kopie; ist es da und
das XML trotzdem leer, ist es ein echter Abruf- oder Entpackfehler und
bekommt die normale Behandlung. **Die Aussage folgt dann aus einem
positiven Nachweis statt aus einer Abwesenheit.**

## Festhalten, NICHT in dieser Runde bauen

Jeweils mit Datum in `docs/offene-befunde-31-08-2026.md`:

- **Der Cache hält jetzt das entpackte XML aller 18 Gesetze gleichzeitig**
  (vorher ein paar hundert Byte je Gesetz). Auf dem Server ein echter
  Speicherzuwachs. Miss die tatsächliche Grösse und trag sie ein — bauen
  erst danach, mit Zahl.
- `normtextAusXml()` zerlegt das ganze Gesetz je Paragraf neu.
- `enbezAusUrl()` akzeptiert nur `__<Zahl>[<Buchstabe>].html`; ein Feld
  `enbez` im Register wäre der Ausweg (wie `ueberwachteUrl`/`standRegex` bei
  den anderen Prüfarten).
- Die doppelte Höflichkeitspause im Werkzeug.
- Die Superadmin-Anzeige im Hauptserver-Repo kennt `version: 3` nicht.
- Der Abbruch bei einem Schreibfehler der Statusdatei.

## Abschluss

Volle Suite mit `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`,
keine Pipe, kein äusseres `flock`. Dateizahl-Ritual, `npm run lint`
(wörtlich melden), Marker-Scan (Sollwert 6).

**Zum Schluss der Abgleich gegen die echten Quellen** — Erwartung 0
Abweichungen. Netzbedingte Ausfälle wiederholen, bis das Gesetz wirklich
geladen ist; bewegt sich ein Fingerabdruck, HALTE AN und melde, statt
nachzuziehen.

Mutationsskripte: Zielpfad als ARGUMENT, Fundstellen zählen (0 und >1
brechen ab), Marker mitschreiben, `node --check` davor, Rücknahme gegen eine
unabhängige Kopie (`diff` EXIT 0), nie `git checkout`, nie mit einem
Testlauf verkettet.

Committe und pushe, bevor du auf einen langen Lauf wartest.
