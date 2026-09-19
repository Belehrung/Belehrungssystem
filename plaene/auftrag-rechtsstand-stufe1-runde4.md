# Auftrag — Rechtsstand-Wächter Stufe 1, RUNDE 4 (soll die letzte sein)

Runde 3 (`b7cb31d`) ist inhaltlich gut: Suite `SUITE_EXIT=0`, 184 PASS /
0 FAIL, Dateizahl 325 = 325, Lint EXIT 0, Marker 6. **Der Abgleich gegen die
ECHTEN Quellen, von mir unabhängig gefahren: 57 Fingerabdrücke stimmen,
0 Abweichungen**, 4 nicht prüfbar (die bekannten UVSV).

Beide Prüfspuren haben danach denselben blockierenden Befund gehabt — das
ist bisher nicht vorgekommen und heisst: er ist echt.

**EINE BERICHTIGUNG MEINERSEITS, VORWEG.** In Runde 3 habe ich geschrieben,
die Versionsabweichung ergäbe „61× rot pro Woche". **Das war falsch.** Ich
hatte gegen die NEUE Klassifizierung gemessen. Maßgeblich ist die ALTE, denn
sie ist die installierte. Sie macht daraus kein Rot, sondern Stille — der
Fehler ist also nicht laut, sondern unsichtbar. Meine Vorgabe stand damit auf
falscher Tatsachengrundlage; die Behebung, die daraus folgte, greift nicht.

---

## 1. BLOCKIEREND — die neue Lage erreicht den Kanal nicht, für den sie
gebaut wurde

**Selbst gemessen** (die alte Fassung wörtlich aus `master` nachgebaut):

    Lage bei fehlendem xmlText: ops_kopie_veraltet
    NEUE Ops-Kopie ->  rot
    ALTE Ops-Kopie ->  still

    Und alle anderen neuen Lagen unter der ALTEN Kopie:
      normtext_unbestaetigt        -> still
      norm_geaendert               -> still
      widerspruch                  -> still
      pruefungsfehler              -> still
      gesetz_geaendert_norm_gleich -> still

`master`s `klassifiziere()` endet auf `default: return 'still'`. Die
installierte Kopie entscheidet, was laut wird — und sie kennt keine der
sechs neuen Lagen. Im Fenster zwischen Merge (automatische Auslieferung von
`core/`) und dem manuellen `install` meldet der Wächter also **alles als
unauffällig, obwohl er nichts geprüft hat**. Falsches Grün, unsere teuerste
Klasse.

**Prämisse geprüft:** `ops/deploy.sh` enthält keine Zeile zu
`/usr/local/bin/` (`grep`: null Treffer), und `ops/README.md` beschreibt die
Installation ausdrücklich als Handarbeit. Das Fenster existiert wirklich.

**ABER der Befund ist kleiner, als er aussieht — und das ist der Schlüssel
zur Behebung.** Fehlt `xmlText`, greift der Riegel in `bewerteGiiXml()`
ZUERST, vor allen anderen Stufe-1-Zweigen (am Quelltext gelesen). Im
Versionsfenster kann deshalb gar keine andere neue Lage auftreten: jede
gii-Quelle landet bei der Versionslage. Es genügt also, **diese eine** so zu
melden, dass die alte Kopie sie versteht.

**Zu bauen:** Für den Versionsfall gibt `bewerte()` eine Lage zurück, die
die ALTE `klassifiziere()` bereits laut behandelt. Der ehrliche Kandidat ist
`nicht_erreichbar` — die Quelle konnte tatsächlich nicht geprüft werden.
Alte Kopie: Gnadenfrist beim ersten Mal, `rot` ab dem zweiten Lauf. Neue
Kopie: erkennt den Fall an einem zusätzlichen Feld (etwa
`opsKopieVeraltet: true`), überspringt die Gnadenfrist und druckt weiterhin
den `install`-Befehl.

**NICHT** `geaendert` oder `unbekannt` nehmen: beides wäre eine falsche
Tatsachenbehauptung (das Gesetz hat sich nicht geändert, und ein
Registereintrag ist vorhanden) — und es ist genau die Falle „derselbe
Statuscode aus einem neuen Grund", an der schon einmal eine bestehende
Zusicherung blind geworden ist.

**Zu beweisen, beide Richtungen:** eine Zusicherung, die die ALTE
Klassifizierung wörtlich nachbaut (wie meine Messung oben) und verlangt,
dass sie für den Versionsfall NICHT `still` liefert. Dazu die Gegenprobe:
mit der jetzigen Fassung muss sie fallen.

**Und dieselbe Frage einmal für alle künftigen Lagen beantworten:** Ein
Kommentar an `klassifiziere()` hält fest, dass jede NEUE Lage zwei Leser hat
— die neue Kopie und die alte, installierte — und dass eine Lage, die die
alte auf `still` abbildet, im Versionsfenster unsichtbar ist. Wer künftig
eine hinzufügt, muss diese Frage beantworten.

## 2. Die Normalisierung — zwei enge Lücken, beide gemessen

- **`<fussnoten>` mit Attribut wird nicht erfasst.** Gemessen: derselbe Text
  einmal mit `<fussnoten>` und einmal mit `<fussnoten builddate="20260910">`
  ergibt `"Der eigentliche Normtext."` gegen
  `"Der eigentliche Normtext.\nRedaktioneller Hinweis."` — der redaktionelle
  Zusatz fällt in den Fingerabdruck. Die Geschwistermuster in derselben
  Datei (`<norm\b[^>]*>`, die Standangabe) lassen Attribute sehr wohl zu;
  das ist eine Inkonsistenz in EINER Datei. Führt der Verlag ein Attribut
  ein, löst ein rein redaktioneller Zusatz `widerspruch` aus.
- **Der Strukturplatzhalter lässt sich aus der Quelle einschleusen.**
  Gemessen: `<P>A&#31;B</P>` ergibt `"A\nB"` statt `"A B"` — die Entity wird
  NACH der Tag-Ersetzung dekodiert und ist dann vom Platzhalter nicht mehr
  zu unterscheiden. Latent (Rechtstexte enthalten kein U+001F), aber der
  Kommentar daneben beruft sich auf eine Fixtur-Gegenprobe, die es nicht
  gibt (`grep` auf `x1F`/`TRENNER` in der Testdatei: null Treffer). Entweder
  die Gegenprobe bauen oder die Behauptung streichen — und den Platzhalter
  vor der Ersetzung aus dem Rohtext entfernen.

## 3. Eine unbekannte Lage wird in keinen Zähler gezählt

Gemessen mit drei Bewertungen, davon eine mit erfundener Lage:
`zusammenfassung.gesamt = 3`, Summe aller Lagen-Zähler = 2, **Differenz 1,
ohne jedes Signal**. Die if/else-Kette in `schreibeStand()` hat keinen
Abschlusszweig — dieselbe Klasse wie das `default: return 'still'`, das
Runde 2 gerade beseitigt hat, nur eine Datei weiter.

Zu bauen: ein Auffangzweig mit eigenem Zähler, damit die Summe aufgeht und
die Statusdatei den Fall sichtbar macht.

## 4. Die Nachrichtenaufteilung — vier Befunde gegen EIN Bauteil

Die Aufteilung ist in Runde 3 entstanden und hat sofort vier Befunde aus
zwei Spuren auf sich gezogen:

- Ein Schnitt mitten in einer HTML-Entity (`&amp` ohne Semikolon) lässt
  Telegram bei `parse_mode: 'HTML'` die GANZE Sendung ablehnen; `telegram()`
  loggt das nur. Gemessen: bei 2 von 12 durchgemessenen Ausrichtungen.
- Bei kleiner Grenze wird `effektiveGrenze - marker.length` negativ;
  `slice(0, -n)` schneidet dann vom Ende statt zu kürzen. Gemessen:
  `grenze=100` → Sendungen mit 280 Zeichen.
- Mehrere Teile gehen ohne Pause und ohne Wiederholversuch raus; Telegram
  drosselt und antwortet mit 429, was nur geloggt wird.
- Die Zusicherung über die Grenze bezieht ihren Sollwert aus derselben
  Konstante wie die Implementierung — verschiebt man sie, verschiebt sich
  der Sollwert mit.

**Mein Vorschlag: NICHT verfeinern, sondern vereinfachen.** Statt zu teilen,
wird die Meldung durch Bauart begrenzt: eine feste Höchstzahl ausführlicher
Einträge, danach eine Zeile „und N weitere Befunde — Einzelheiten in der
Statusdatei", und die Gesamtzahl je Lage. Das ergibt IMMER genau eine
Sendung unter der Grenze, hat keinen Schnitt (also keine zerrissene Entity),
keine Teilnummerierung und keine Drosselung. Was der Betreiber im
Massenfall braucht, ist „hier ist etwas systematisch kaputt" — nicht 61
Einzelzeilen.

**Das ist ein Vorschlag, kein Befehl.** Wenn du zeigen kannst, dass die
Aufteilung mit vertretbarem Aufwand dicht wird, bau sie fertig und melde die
Messung. In beiden Fällen gilt: **die Zusicherung über die Grenze prüft
gegen das Literal 4096**, nicht gegen die importierte Konstante.

## 5. Zwei Zusicherungen, die ihren Sollwert aus dem Prüfling beziehen

- **Der Produktions-Validator ist unbewacht.** Gemessen (fremde Spur, von
  mir am Quelltext nachvollzogen): `SHA256_HEX_REGEX` von `/^[0-9a-f]{64}$/i`
  auf `/^[0-9a-f]{64}/i` verkürzt — die Obergrenze fällt weg — und die Suite
  bleibt bei **EXIT 0, 184 PASS / 0 FAIL**. Der Test prüft eine EIGENE Kopie
  der Regel, und der einzige Weg durch die Produktionsfunktion benutzt einen
  Wert, den beide Fassungen ablehnen. Ein 65-stelliger Hex-String — der
  realistische Einfügefehler bei 57 Handeinträgen — gilt damit als gültig.
  Zu bauen: eine Zusicherung, die die PRODUKTIONSFUNKTION mit einem 65-, 63-
  und 64-stelligen Wert aufruft.
- **Die Grenzprüfung der Meldung**, s. Punkt 4.

## 6. Die gedruckten Fingerabdrücke gehören nur zur ERSTEN Norm der Gruppe

Die Gruppierung fasst mehrere Paragrafen desselben Gesetzes zusammen;
`normtextShaAlt`/`normtextShaNeu` stammen aber aus dem ersten Eintrag. Eine
Meldung über eine Gruppe druckt also EIN Hashpaar und behauptet damit
implizit, es gelte für alle genannten Paragrafen. Entweder je Paragraf
ausweisen oder die Hashes aus der Gruppenmeldung weglassen und nur bei
Einzelbefunden drucken.

Nicht von mir nachgemessen — am Quelltext hergeleitet. Miss es nach und
widersprich, wenn es nicht trägt.

## Ausdrücklich NICHT in dieser Runde

- `enbezAusUrl()` bleibt auf `__<Zahl>[<Buchstabe>].html` beschränkt.
- Die Superadmin-Anzeige im Hauptserver-Repo.
- Der Abbruch bei einem Schreibfehler der Statusdatei.
- Die doppelte Auswertung in `tools/rechtsstand-normtext-hashes.js`
  (Diagnose und Hash aus zwei Läufen) — trägt, ist aber ein Werkzeug ohne
  Deploy-Weg. Festhalten.
- Stufe 2, BGBl-Kettenverfolgung, echter XML-Parser.

## Abschluss

Volle Suite mit `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`,
keine Pipe, kein äusseres `flock`. Danach Dateizahl-Ritual, `npm run lint`
(Ergebnis wörtlich, auch bei Grün), Marker-Scan (Sollwert 6).

**Und zum Schluss noch einmal der Abgleich gegen die echten Quellen:** nach
allen Änderungen an der Normalisierung müssen weiterhin alle erreichbaren
Fingerabdrücke das Register treffen. Erwartung 0 Abweichungen — bewegt sich
einer, HALTE AN und melde, statt nachzuziehen. Bei Punkt 2 (Fussnoten,
Platzhalter) ist eine Bewegung NICHT zu erwarten, weil im Bestand weder ein
Fussnoten-Attribut noch ein U+001F vorkommt; miss es trotzdem.

Jedes Mutationsskript nimmt den Zielpfad als ARGUMENT, zählt die Fundstellen
und bricht bei 0 UND bei mehr als 1 ab, schreibt den Marker mit, läuft vorher
durch `node --check`, und wird gegen eine unabhängig angelegte Kopie
zurückgenommen (`diff` EXIT 0) — nie über `git checkout`, nie mit einem
Testlauf verkettet.

Committe und pushe, bevor du auf einen langen Lauf wartest.
