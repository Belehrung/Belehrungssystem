# Astra-Läufe — zählbares Protokoll

Die CLAUDE.md verlangt seit dem 12.09.2026: *„Jeder Lauf wird zählbar
festgehalten: Datum, Zweck, Material (Dateien/Token), Befunde, davon nach
EIGENER Nachmessung getragen, Kosten."* Bis zum 13.09.2026 gab es dafür keine
Datei — die Regel stand, wurde aber nirgends erfüllt. Das hier ist sie.

**Wozu.** Die Beweislage für „Astra lohnt sich" ist bewusst dünn beschrieben
(ein Diff, drei Läufe, ein Tag). Ohne Zählung bleibt sie das für immer. Diese
Datei macht aus Anekdoten über die Zeit eine Messung — oder belegt das
Gegenteil. Beides ist ein Ergebnis.

**Was „getragen" heißt.** Nicht „Astra hat es gemeldet", sondern: der
Haupt-Agent hat den Befund SELBST nachgemessen und er hielt. Ein Befund, der
beim Nachmessen fällt, wird als gefallen eingetragen, nicht weggelassen —
sonst misst diese Datei nur die eigene Zustimmung.

| Datum | Zweck | Material | Befunde | getragen | gefallen | Kosten |
|---|---|---|---|---|---|---|
| 10.09.2026 | Gegenlesung #144, nur Diff | Diff + 2 Testdateien | 4 | 4 | 0 | 0,21 $ |
| 10.09.2026 | Gegenlesung #144, volle Dateien | 8 Dateien, 192k Token | 4 | 4 | 0 | 2,03 $ |
| 12.09.2026 | Gegenlesung #167 (zwei Spuren zusammen) | 61 Dateien | 9 | 7 | 3 | n. e. |
| 13.09.2026 | Gegenlesung Drossel-Rennen `/passwort-vergessen` | Diff 129 Zeilen + Repo-Lesezugriff (20 Suchen, 30 Lesungen), 704k Token über 12 Runden | 3 | 2 | 1 (Schwereeinstufung) | 9,38 $ |
| 13.09.2026 | Gegenlesung Archiv-Drossel, **abgebrochen** | Geheimnis-Riegel schlug nach 2 Runden an (Fehlalarm) | — | — | — | 0,32 $ |
| 13.09.2026 | Gegenlesung Archiv-Drossel, Wiederholung ohne 13 gesperrte Dateien | Diff 115 Zeilen + Repo-Lesezugriff (130 Suchen, 26 Lesungen), 1.117k Token über 19 Runden | 3 | 2 | 1 (Prämissenfehler im Auftrag) | 15,39 $ |
| 13.09.2026 | Gegenlesung `allSettled`-Abdeckung | Diff 111 Zeilen + Repo-Lesezugriff (19 Suchen, 24 Lesungen), 562k Token über 9 Runden | 2 | 2 | 0 | 7,47 $ |
| 13.09.2026 | Gegenlesung Selbstprotokollierung des Gegenlesers | **abgebrochen** (Geheimnis-Riegel bei einer Werkzeug-Lesung (tools/geheimnis-riegel.js (116 von 300 Zeilen))): Diff 600 Zeilen, Suchen 1, Lesungen 4, Token rein 12886, Token raus 225, Runden 1 | — | — | — | 0,18 $ |
| 13.09.2026 | Gegenlesung Selbstprotokollierung des Gegenlesers, Wiederholung ohne die Musterdatei | Diff 600 Zeilen, Suchen 8, Lesungen 14, Token rein 190835, Token raus 9742, Runden 5 | 6 | offen (Nacharbeit mit Gegenproben laeuft) | offen | 3,12 $ |
| 13.09.2026 | Gegenlesung (e3)-Zustandsbeweis und neun Kardinalitaetspruefungen | Diff 143 Zeilen, Suchen 14, Lesungen 29, Token rein 592748, Token raus 8581, Runden 8 | 3 | 3 | 0 | 8,05 $ |
| 13.09.2026 | Gegenlesung CI-Fehlerlogs als Artefakt und Verrottungswaechter | **abgebrochen** (Geheimnis-Riegel auf dem Eingabediff): Diff 127 Zeilen, Suchen 0, Lesungen 0, Token rein 0, Token raus 0, Runden 0 | — | — | — | 0,00 $ |
| 13.09.2026 | Gegenlesung CI-Fehlerlogs als Artefakt, Wiederholung mit geschwaerzter Kennung | Diff 127 Zeilen, Suchen 8, Lesungen 15, Token rein 221528, Token raus 9633, Runden 6 | 2 | 2 | 0 | 3,49 $ |
| 13.09.2026 | Gegenlesung Offline-C7 Navigationsrennen | Diff 91 Zeilen, Suchen 11, Lesungen 12, Token rein 217868, Token raus 13426, Runden 6 | 4 | offen (Nacharbeit laeuft; Befund 1 selbst gemessen) | offen | 3,73 $ |
<!-- NEUE-LAUFZEILE-HIER: tools/gegenleser-repo.js traegt jede neue Zeile
     UNMITTELBAR UEBER dieser Marke ein. Sie darf nicht entfernt oder
     verschoben werden; fehlt sie, meldet das Werkzeug das LAUT und bricht
     nicht still ab. Grund fuer die Marke: diese Datei hat ZWEI Tabellen, und
     ohne sie landete die Zeile in der falschen. -->

**Diese Datei ist der einzige Ort für die Zahlen.** Die CLAUDE.md trug die
Läufe vom 10.09. bis zum 13.09.2026 als eigene Tabelle — dieselbe Aussage an
zwei Orten, angelegt am selben Tag wie dieses Protokoll. Sie ist dort durch
einen Verweis ersetzt; was dort blieb, sind die SCHLÜSSE für die Regel, nicht
die Daten. Wer hier etwas einträgt, trägt es deshalb nirgends sonst ein.

Die Zeilen vom 10./12.09. stammen aus jener Tabelle, sind also nicht neu
gemessen; die Spalte „gefallen" war dort teils nicht getrennt erfasst
(#167: neun Befunde, sieben getragen — die Differenz stand als „drei nicht"
da, was sich mit der Neun nicht sauber verrechnet). Das ist so
stehengelassen statt geglättet.

**Ein abgebrochener Lauf bekommt eine eigene Zeile mit Strichen, keine Null.**
„Null Befunde" hieße geprüft und sauber; hier hat niemand geprüft. Die Kosten
stehen trotzdem da — sie sind angefallen.

## Woher die Befunde kamen (Betreiberfrage 13.09.2026: ist Kontext der Hebel?)

Zählbar gemacht, weil sich sonst nie entscheiden lässt, ob Repo-Lesezugriff
wirklich trägt oder ob es sich nur so anfühlt. Erfasst wird, welcher Zugriff
einen Befund überhaupt ERMÖGLICHT hat — nicht, was daneben noch gelesen wurde.

| Befund | Erreichbar über | Wäre ohne diesen Zugriff auffindbar gewesen? |
|---|---|---|
| Test kann Konto- und IP-Riegel nicht unterscheiden | vollständiges Lesen der Testdatei | nein — der Diff zeigt nur den neuen Block, nicht die 600 Zeilen davor |
| Prüfen-dann-Zählen in `routes/archiv.js` | Suche im Repo | nein — steht in keiner Zeile des Diffs, und niemand hätte die Datei ins Bündel gelegt |
| Mailzahl unterscheidet Drossel nicht von Absturz | Diff allein | ja |
| Beide Renn-Zusicherungen nicht unabhängig | Diff allein (Arithmetik) | ja |
| Passwort-Reset-Reparatur fehlt im Baum | Lesen von `routes/auth.js` | nein — und es war ein Prämissenfehler im Auftrag, kein Codefehler |

**Stand nach zwei Läufen: 3 von 5 Befunden hingen am Lesezugriff.** Das ist
eine Tendenz, keine Messung — fünf Befunde an einem Tag. Wer sich darauf
beruft, nennt diese Zahl mit.

**Was der zweite Lauf zusätzlich zeigt, und es spricht gegen die Kosten:**
15,39 $ für 115 Diff-Zeilen, bei 130 Suchen und 19 Runden. Der erste Lauf kam
mit 12 Runden auf 9,38 $. Die Kosten wachsen mit der Freiheit, nicht mit dem
Umfang des Beitrags — und beide Läufe lieferten je zwei tragende Befunde.
Mehr Zugriff hat also nicht mehr gefunden, sondern anderes. Das deckt sich mit
der Messung vom 10.09. und ist der Grund, warum „öfter" nicht „breiter" heißt.

## 13.09.2026 — Drossel-Rennen `/passwort-vergessen`

**Getragen, nachgemessen:**

1. **Die neue Zusicherung konnte die halbe Reparatur verlieren, ohne rot zu
   werden.** Alle acht Anfragen liefen mit derselben Adresse UND derselben IP,
   also liefen beide Riegel gleichzeitig in die Schwelle; einer allein genügte.
   Eigene Mutationsmessung gegen eine frische Wegwerf-Datenbank:

       Ausgangslage (beide Riegel)          -> 53 PASS / 0 FAIL, GEMESSEN 5
       nur `resetWarBereitsGesperrt`        -> 53 PASS / 0 FAIL, GEMESSEN 5  (GRÜN)
       nur `ipResetWarBereitsGesperrt`      -> 53 PASS / 0 FAIL, GEMESSEN 5  (GRÜN)

   Behoben durch zwei isolierte Fälle (ein Konto/acht IPs, eine IP/acht
   Konten). Danach werden genau die beiden Mutationen rot, die vorher grün
   blieben.

2. **Die Mailzahl allein unterscheidet eine greifende Drossel nicht von einer
   Route, die nach dem Versand abstürzt.** Eigene isolierende Mutation
   (`throw` NACH erfolgreichem Versand): Mailzahl bleibt 5, die drei neuen
   Fehlerzeilen-Zusicherungen werden rot — 57 PASS / 3 FAIL. Ohne sie wäre
   dieser Zustand grün geblieben.

**Gefallen bei der Nachmessung:**

3. **Die Schwereeinstufung zum Prüfen-dann-Zählen-Muster in
   `routes/archiv.js`.** Der Fund selbst stimmt und war NUR über den
   Repo-Lesezugriff erreichbar — er steht in keiner Zeile des Diffs. Die
   Einordnung „trägt dieselbe Abgrenzung wie Login/2FA, weil keine Mail" trägt
   aber nicht: der Kommentar über jener Drossel nennt ihren Zweck selbst, und
   es ist kein Mail-Zweck, sondern *„nach zu vielen Fehlversuchen kein bcrypt
   mehr"* gegen Passwortraten auf Art.-9-DSGVO-Nachweise. Die teure Operation
   liegt dort VOR dem Zählen, Gleichzeitigkeit vervielfacht also genau das,
   was begrenzt werden soll.

**Was dieser Lauf über Astra aussagt — und was nicht.** Er hat eine echte
Lücke gefunden, die der eigene Prüfgang übersehen hatte, und zwar in der
Klasse, die dieses Projekt selbst als seine teuerste führt (Zusicherungen, die
nicht rot werden können). Er hat sie NICHT gemessen: er sagt selbst, dass ihm
dafür kein Ausführungswerkzeug zur Verfügung steht, und hat die Zahlen aus dem
Auftrag übernommen. Das Nadelöhr bleibt das eigene Nachmessen, nicht das
Finden.

## Was das Werkzeug NICHT eintragen kann (13.09.2026)

Seit `tools/gegenleser-repo.js` sich selbst einträgt, füllt es Datum, Zweck,
Material und Kosten — die Spalten **Befunde / getragen / gefallen** schreibt
es als `—`, weil es sie nicht wissen KANN. Astra liest, es misst nicht; ob
ein Befund trägt, entscheidet erst die eigene Nachmessung.

Bei einem ABGEBROCHENEN Lauf ist `—` richtig: niemand hat geprüft. Bei einem
ERFOLGREICHEN Lauf ist es irreführend — die Zeile sieht dann aus wie ein Lauf
ohne Befunde. Wer eine solche Zeile vorfindet, trägt die Zahlen nach; bis
dahin gehört dort `offen` und nicht `—`.

**Das ist eine erkannte Lücke der Automatisierung, keine Eigenschaft der
Daten.** Sie ist hier notiert, damit sie nicht in einem Monat als „damals
wurde nichts gefunden" gelesen wird.

## Der Geheimnis-Riegel bricht zu grob ab (13.09.2026)

Drei von sieben Laufversuchen an diesem Tag endeten am eigenen Riegel, ohne
dass je geprüft wurde:

- zweimal, weil der Prüfer `tools/geheimnis-riegel.js` lesen wollte. Diese
  Datei DEFINIERT die Muster und enthält sie deshalb zwangsläufig; 116 von
  300 Zeilen würden geschwärzt, das reißt den Deckel und beendet den
  **ganzen** Lauf statt nur diese eine Lesung. Kosten: 0,32 $ und 0,18 $.
- einmal auf dem EINGABEDIFF, weil in den Kontextzeilen von `ci.yml` eine
  Wegwerf-Zugangskennung der CI-Datenbank steht. Kosten 0,00 $ (es wurde
  nichts gesendet).

Der dritte Fall ist KEIN Fehler: der Abbruch auf dem Eingabediff ist
absichtlich so gebaut, damit der Auftraggeber sein eigenes Geheimnis SIEHT
statt es stillschweigend geschwärzt zu bekommen. Ich habe es gesehen, die
Zeile selbst geschwärzt und im Auftrag dazugeschrieben, was dort stand und
warum — genau der vorgesehene Ablauf.

Die ersten beiden sind einer: **eine abgelehnte Lesung sollte eine abgelehnte
Lesung sein, kein Abbruch des ganzen Laufs.** Das Werkzeug kann das schon —
`suche()` schwärzt und läuft weiter —, nur der Deckel bei `lies()` kippt in
einen Gesamtabbruch. Steht als eigener Punkt aus.

## Was die beiden Laeufe vom 13.09.2026 nachmittags leisteten

Fuenf von fuenf Befunden haben nach eigener Nachmessung getragen — die
bisher beste Quote, und sie sagt WENIGER, als sie aussieht: alle fuenf
betrafen Beitraege, die ich selbst kurz zuvor entworfen hatte. Ein Pruefer
findet im frischen Entwurf leichter etwas als im gewachsenen Bestand.

**Zwei Befunde waren Angriffe auf die eigene Behebung**, und das ist die
Klasse, um derentwillen das Verfahren existiert:

- Der CI-Waechter, den ich zum Schutz der Testsuite erweitert hatte, machte
  die Testsuite ABSCHALTBAR. `npm test` auf einen erlaubten Schrittnamen
  umbenennen, `if: failure()` dazu — und die gesamte Isolations-Suite laeuft
  bei gruenem Job nie, waehrend beide Waechter EXIT 0 melden. Selbst
  nachgebaut und gemessen: vorher gruen, nach der Behebung rot.
- Die Selbstprotokollierung, die „jeder Lauf wird festgehalten" erzwingen
  sollte, verlor einen bezahlten Lauf genau dann, wenn eine SPAETERE Runde
  an einem Netzfehler stirbt — in dieser Umgebung der haeufigste Fehlerweg.

**Eine Einschraenkung, die in keiner Zahl steht:** Beim (e3)-Sperrnachweis
fiel bei der entscheidenden Mutation auch die SCHWAECHERE Zusicherung. Der
Gewinn war dort nicht mehr Empfindlichkeit, sondern GENAUIGKEIT — die
Meldung sagt jetzt „in 3 s wurde niemand von As Backend blockiert" statt
„B war zufaellig schon fertig". Wer diese Zeile als „Astra findet, was
sonst durchrutscht" liest, liest sie falsch.
