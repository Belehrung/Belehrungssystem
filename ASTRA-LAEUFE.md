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
| 13.09.2026 | Gegenlesung Selbstprotokollierung des Gegenlesers, Wiederholung ohne die Musterdatei | Diff 600 Zeilen, Suchen 8, Lesungen 14, Token rein 190835, Token raus 9742, Runden 5 | 6 | 6 | 0 | 3,12 $ |
| 13.09.2026 | Gegenlesung (e3)-Zustandsbeweis und neun Kardinalitaetspruefungen | Diff 143 Zeilen, Suchen 14, Lesungen 29, Token rein 592748, Token raus 8581, Runden 8 | 3 | 3 | 0 | 8,05 $ |
| 13.09.2026 | Gegenlesung CI-Fehlerlogs als Artefakt und Verrottungswaechter | **abgebrochen** (Geheimnis-Riegel auf dem Eingabediff): Diff 127 Zeilen, Suchen 0, Lesungen 0, Token rein 0, Token raus 0, Runden 0 | — | — | — | 0,00 $ |
| 13.09.2026 | Gegenlesung CI-Fehlerlogs als Artefakt, Wiederholung mit geschwaerzter Kennung | Diff 127 Zeilen, Suchen 8, Lesungen 15, Token rein 221528, Token raus 9633, Runden 6 | 2 | 2 | 0 | 3,49 $ |
| 13.09.2026 | Gegenlesung Offline-C7 Navigationsrennen | Diff 91 Zeilen, Suchen 11, Lesungen 12, Token rein 217868, Token raus 13426, Runden 6 | 4 | 4 | 0 | 3,73 $ |
| 13.09.2026 | Gegenleser: Deckel lehnt Lesung ab statt Lauf | Diff 229 Zeilen, Suchen 8, Lesungen 11, Token rein 213092, Token raus 7458, Runden 6 | 2 | 1 | 1 (Schwereeinstufung: angeblich neuer Ausgabekanal, gegen HEAD~1 als wortgleich bestehend gemessen) | 3,22 $ |
| 13.09.2026 | Bestaetigungsrunde: Deckel gilt dem Ausschnitt | Diff 336 Zeilen, Suchen 5, Lesungen 9, Token rein 174972, Token raus 6859, Runden 5 | 3 | 3 | 0 | 2,70 $ |
| 13.09.2026 | Waechter gegen Zeitzonenfalle (repo-weit, statisch) | Diff 490 Zeilen, Suchen 13, Lesungen 22, Token rein 246849, Token raus 8508, Runden 6 | 5 | 5 | 0 | 3,72 $ |
| 13.09.2026 | Bestaetigungsrunde: Waechter Zeitzonenfalle, fuenf Behebungen | Diff 331 Zeilen, Suchen 9, Lesungen 17, Token rein 185595, Token raus 7654, Runden 6 | 3 | 3 | 0 | 2,89 $ |
| 13.09.2026 | Zweite Bestaetigungsrunde: Waechter Zeitzonenfalle, Runde-2-Behebungen | Diff 418 Zeilen, Suchen 9, Lesungen 18, Token rein 226531, Token raus 7283, Runden 6 | 6 | 5 | 1 (Schwereeinstufung: mkdtemp-Fixtur als „blockierend", gegen 64 gleichartige Testdateien und den Zweck der Regel gemessen) | 3,38 $ |
| 13.09.2026 | Dritte Bestaetigungsrunde: Waechter Zeitzonenfalle, Runde-3-Behebungen | Diff 442 Zeilen, Suchen 8, Lesungen 13, Token rein 223229, Token raus 5762, Runden 6 | 4 | 4 | 0 | 3,22 $ |
| 13.09.2026 | Vierte Bestaetigungsrunde: Waechter Zeitzonenfalle (als „letzte" angesetzt, war es nicht) | Diff 608 Zeilen, Suchen 49, Lesungen 9, Token rein 876854, Token raus 10903, Runden 13 | 2 | 2 | 0 | 11,78 $ |
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

## Die erste Bestaetigungsrunde, die es wirklich gab (13.09.2026 abends)

Die CLAUDE.md hat am selben Tag die zweite Runde vom Regelfall zur Ausnahme
gemacht, weil sie **nie stattgefunden hatte** — dreimal hintereinander nicht.
Dies ist die erste. Ausloeser war genau das Kriterium, das dort steht: die
Behebung aenderte VERHALTEN (Form von `ort`, Text an das Modell, Ueberschrift
des Berichtsblocks, Konstruktor der Ausnahme), nicht bloss eine Zusicherung.

Sie hat sich bezahlt gemacht, und zwar nicht dort, wo ich es erwartet haette:

- **Der Befund war nicht vollstaendig geschlossen.** Dieselbe Falschaussage
  stand an einer VIERTEN Stelle — im Kommentar des Ausnahmebehandlers selbst,
  zwoelf Zeilen ueber dem korrigierten Text, den er widerspricht. Drei Orte
  waren bekannt und behoben; der vierte lag im geaenderten Hunk und ist beim
  Lesen des Diffs trotzdem niemandem aufgefallen, mir eingeschlossen.
- **Meine neuen Zusicherungen konnten zwei Verwechslungen nicht bemerken.**
  Alle Deckel-Fixtures lesen 1–40 einer 40-zeiligen Datei; damit fallen `bis`,
  `gbis`, `gesamt` und `ausschnittZeilen` auf dieselbe Zahl 40 zusammen.
  SELBST GEMESSEN, je einzeln: `gesamt` durch die Ausschnittslaenge ersetzt →
  **EXIT 0, 69 Haken, 0 Kreuze**; `bis: ende` durch `bis: gbis` ersetzt →
  **EXIT 0, 69 Haken, 0 Kreuze**. Genau die Trennung, fuer die die
  strukturierten Felder eingefuehrt wurden, war ungeprueft. Dieselbe Klasse
  wie die dritte Erscheinungsform in der CLAUDE.md: der gemessene Wert kann
  von der geprueften Eigenschaft gar nicht abhaengen, weil die Testdaten ihn
  vorher gleichgemacht haben.
- **Eine meiner vier Begruendungen war schlicht falsch.** Ich hatte den
  Verzicht auf eine Pfad-Schwaerzung unter anderem mit einer Re-Entranz
  begruendet: der Schwaerzer wuerde im Behandler fuer die Ausnahme aufgerufen,
  die er selbst wirft. Nachgemessen: `tools/geheimnis-riegel.js` enthaelt
  **null** `throw`-Anweisungen, `entferneGeheimnisse()` liefert
  `{text, entfernt, zuViel}` zurueck, und geworfen wird erst beim Aufrufer.
  Die Entscheidung traegt weiter — auf den drei anderen Gruenden —, die
  Begruendung nicht. Sie stand da schon woertlich in einer Commit-Botschaft.

**Was die Runde NICHT geleistet hat:** keinen neuen Laufzeitfehler. Alle drei
Befunde sind Testluecke, Kommentar und Begruendung. Wer daraus „die zweite
Runde findet die schweren Sachen" macht, liest zu viel hinein; sie hat hier
eine unvollstaendige Behebung und eine blinde Zusicherung gefunden — beides
teuer genug, aber beides von der leiseren Sorte.

**Kosten der Runde: 2,70 $** gegen 3,22 $ der ersten. Der Rueckbezug ueber
`previous_response_id` bleibt durch `store: false` ausgeschlossen; das
Material ging vollstaendig erneut mit, und es war trotzdem die billigere der
beiden Runden — weil der Auftrag eng war (zwei benannte Fragen statt einer
offenen Pruefung) und der Pruefer weniger suchen musste.

## Der Lauf, bei dem die eigenen Gegenproben nicht reichten (13.09.2026)

Bis hierher lief es so: Gegenlesung findet etwas, ich messe nach, die Hälfte
trägt. Dieser Lauf ist der erste, bei dem **alle fünf Befunde trugen** — und
der einzige bisher, bei dem der Beitrag ohne ihn **fehlerhaft gemergt worden
wäre**, obwohl drei eigene Gegenproben ihn für gut befunden hatten.

Gegenstand war ein neuer statischer Wächter gegen die Zeitzonenfalle. Meine
eigenen Messungen vorher: Wächter grün (22 Fälle), Gegenprobe im neu
gedeckten Bereich rot mit genau zwei betroffenen Fällen, Gegenprobe mit der
korrekten UTC-Form grün, volle Suite grün. Alles richtig — und alles am
selben blinden Fleck vorbei.

Was die Gegenlesung fand und ich danach SELBST gemessen habe:

- **Ein fehlendes Verzeichnis meldet sich als sauber.** `workers/` komplett
  weggenannt: `22 PASS / 0 FAIL`, EXIT 0, einschliesslich der Zeile „keine
  Lesefehler beim Scan (0 von 185 Dateien)". Die Zusicherung erfasste nur
  `readFileSync`, nicht `readdirSync`. Der Wächter gegen „eine gescheiterte
  Messung meldet sich als unveraendert" hatte genau diesen Defekt selbst.
- **Drei zugesicherte Schnittformen waren von nichts bewacht.** Die
  Erkennungsregel auf `.slice(0,10)` verkürzt: alle 22 blieben gruen.
  `.split('T')[0]`, `.substring`, `.substr` standen nur im Kommentar.
- **Ein Leerzeichen umgeht alles.** `d .toISOString().slice(0, 10)` — gültiges
  JavaScript, trägt die Falle exakt, `22 PASS / 0 FAIL`.
- Setter-Liste wich still vom bestehenden Wächter ab (4 gegen 6 Einträge).
- Die Sollzahl Null war aus der Freiliste abgeleitet statt gegen ein Literal
  geprüft.

**Was das für die Beweislage heisst.** Bisher stand hier sinngemäss, das
Nadelöhr sei das eigene Nachmessen, nicht das Finden. Dieser Lauf zeigt die
Gegenrichtung: meine drei Gegenproben waren methodisch einwandfrei und haben
trotzdem nichts gefunden, weil sie **dieselbe Annahme teilten wie der
Entwurf** — dass die Erkennungsregel die Formen trifft, die ihr Kommentar
behauptet. Eine Gegenprobe prüft, ob eine Zusicherung fallen KANN; sie prüft
nicht, ob sie das Richtige zusichert.

**Was er NICHT hergibt:** ein Lauf. Und der Beitrag war ein frischer Entwurf
— dort findet ein Prüfer leichter etwas als im gewachsenen Bestand, das steht
weiter oben schon. Die Quote 5 von 5 ist keine Rate, sie ist ein Datenpunkt.

## Die zweite Runde, die sich ein zweites Mal gelohnt hat (13.09.2026)

Zum Wächter gegen die Zeitzonenfalle: erste Runde fünf Befunde (alle
getragen, einer blockierend), Bestätigungsrunde drei weitere (alle
getragen). Das ist die erste Bestätigungsrunde, die NICHT nur bestätigt hat.

Was sie fand, und was daran gemeinsam ist:

- **Zwei Teile der C-Behebung waren von keiner Fixtur bewacht.** Die
  `hatSetter`-Regex auf die alte Fassung zurückgedreht: `38 PASS / 0 FAIL`.
  Grund: die `$d`-Fixtur hat keinen Setter und greift über den anderen
  Zweig, alle Setter-Fixturen sind kompakt geschrieben.
- **Ein Symlink fällt lautlos aus dem Scan.** 186 Dateien werden 185, und
  „keine Verzeichnisfehler" bleibt grün. Ein `Dirent` für einen Symlink
  erfüllt weder `isDirectory()` noch `isFile()`.
- **Die Fixturen prüfen die Hilfsfunktion, nicht den Wächter.**
  `const f = findeTreffer(roh)` durch `const f = []` ersetzt liesse alles
  grün. Die Regel dazu steht wörtlich in der CLAUDE.md.

**Das Muster über beide Runden:** Jeder einzelne Befund war „die Behebung
ist da, aber nichts würde ihren Verlust bemerken". Nicht falscher Code —
ungesicherter richtiger Code. Das ist genau die Klasse, für die eine
Gegenprobe nicht reicht: sie zeigt, dass eine Zusicherung fallen KANN, nicht
dass sie beim Rückbau der Behebung fällt.

**Eigener Messfehler in derselben Runde, festgehalten weil er die Lehre
verdoppelt:** Mein erster Mutationsversuch für Befund 1 griff nicht
(`NICHT EINDEUTIG: 0`), das gemessene `EXIT=0` galt der UNVERÄNDERTEN Datei.
Ohne Nachsehen wäre daraus ein „bewacht, alles gut" geworden — also die
umgekehrte Fehlaussage zum Befund selbst. Die Regel dagegen steht seit heute
Vormittag in der CLAUDE.md; ich bin am selben Tag hineingelaufen.

**Kosten der Bestätigungsrunde: 2,89 $** gegen 3,72 $ der ersten. Wieder war
die engere Frage die billigere.

## Die DRITTE Runde über denselben Wächter — und was sie über Auslagerungen zeigt (13.09.2026 nachts)

Derselbe statische Wächter gegen die Zeitzonenfalle, dritter Gegenlese-Lauf,
3,38 $. Sechs Befunde, fünf haben nach eigener Nachmessung getragen, einer ist
in der Schwere gefallen. Zwei der getragenen waren BLOCKIEREND — nach zwei
vorangegangenen Runden über dieselbe Datei.

**Warum das kein Argument gegen die Rundenregel ist, sondern für sie.** Die
CLAUDE.md sagt seit heute: Regelfall eine Runde, eine weitere nur, wenn die
Behebung VERHALTEN ändert statt bloß eine Zusicherung zu ergänzen. Genau das
war hier jedes Mal der Fall — Runde 2 hatte die Scanschleife in eine eigene
Funktion ausgelagert, eine Regex umgebaut und einen neuen Fehlerweg
eingeführt. Die Regel hat also richtig vorhergesagt, dass noch einmal
hingesehen werden muss. Sie taugt.

**Der Befund, der es wert ist, allgemein aufgeschrieben zu werden:** Runde 2
hatte eine Lücke geschlossen, indem sie den Lesepfad in `scanneDateien()`
AUSLAGERTE — vorher prüfte kein Test den vollständigen Weg Lesen →
Erkennen → Sammeln. Die neue Funktion nimmt einen optionalen Basispfad. Der
echte Scan ruft sie MIT Basisverzeichnis, der neue Test OHNE. Damit prüfte der
Test einen Zweig, den die Produktion nie geht.

Selbst gemessen, beide Male mit vorher bestätigter Mutation und Rückbau über
eine beiseitegelegte Kopie:

    const f = basisVerzeichnis ? [] : findeTreffer(roh);   -> EXIT 0, 49 PASS / 0 FAIL
    scanneDateien([], ROOT) statt (gescannteDateien, ROOT) -> EXIT 0, 49 PASS / 0 FAIL

Im ersten Fall wird keine einzige Bestandsdatei mehr auf Fallen geprüft, im
zweiten überhaupt nichts mehr gelesen — und der Wächter meldet beide Male
grün, einschließlich seiner Zeile „mindestens 170 Dateien gescannt". Die zählt
die AUFGELISTETEN Dateien, nicht die gelesenen.

Daraus die Regel, die jetzt auch in der CLAUDE.md steht: **eine Funktion
auszulagern macht sie PRÜFBAR, nicht GEPRÜFT** — und wenn der Test sie anders
aufruft als die Produktion, ist sie es weiterhin nicht.

**Der zweite blockierende Befund war eine halbe Behebung.** Runde 2 hatte
Symlinks geschlossen — aber nur im Baum-Scan, nicht im Wurzelverzeichnis, das
an `verarbeiteEintrag()` vorbeigeht. Selbst gemessen: ein Wurzel-Symlink
`zzz_gegenprobe_symlink.js` auf eine Datei mit einer echten Falle ergab
`EXIT 0, 49 PASS / 0 FAIL, „0 von 186 Dateien"` — dieselbe Dateizahl wie ohne
ihn. Die Falle war vollständig unsichtbar. Auch das ist ein Muster: wer einen
Eintrittspunkt absichert, hat nicht die Eintrittspunkte abgesichert.

**Der gefallene Befund war eine Schwereeinstufung**, und sie ist die dritte
dieser Art an einem Tag. Die Gegenlesung stufte die temporäre Datei der neuen
Fixtur (`mkdtempSync`/`writeFileSync`/`rmSync`) als blockierenden Verstoß gegen
„Tests fassen kein echtes Dateisystem an" ein und verlangte einen Stub. Die
Regel zielt aber auf `pm2`, `nginx`, `/var/www` — echte Prozesse, Dienste und
Produktivpfade, weil dieselbe Suite auf dem Live-Server als Deploy-Gate läuft;
64 Testdateien dieser Suite benutzen `mkdtempSync`. Vor allem: ein Stub auf
`readFileSync` nähme der Fixtur genau das, wofür sie da ist. Die genannten
Restrisiken (untergeschobener Symlink zwischen `mkdtemp` und dem Schreiben,
`os.tmpdir()` über die Umgebung verschiebbar, `finally` läuft bei `SIGKILL`
nicht) treffen zu und stehen jetzt im Kommentar — sie tragen die Umstellung
nur nicht.

**Was diese drei Runden zusammen NICHT belegen.** Es ist EIN Artefakt. Dass
hier drei Runden je echte Befunde brachten, sagt etwas über diese Datei — ein
Wächter, dessen Fehler sich definitionsgemäß als grüner Lauf tarnen —, nicht
über Beiträge im Allgemeinen. Die Kosten sind ebenfalls real: 3,72 $ + 2,89 $
+ 3,38 $ = 9,99 $ für eine einzige neue Testdatei, dazu vier Bau-Runden. Wer
das verallgemeinern will, braucht andere Artefakte in dieser Tabelle.

**Und eine Selbstkorrektur, die hierher gehört:** dieser Lauf hat auch
gefunden, dass meine eigene Aufräumarbeit unvollständig war. Ich hatte kurz
zuvor die Herkunftsvermerke im Wächter vereinheitlicht (drei verschiedene
Rundennummern für Befunde aus EINEM Bericht) — und dabei vier Stellen
übersehen, alle in AUSGABETEXTEN statt in Kommentaren. Wer eine Datei
aufräumt, prüft danach mit demselben `grep`, mit dem er sie gefunden hat.

## Zwei Spuren über denselben Diff, NULL Überschneidung (13.09.2026 nachts)

Vierte Gegenlese-Runde über den Zeitzonenfallen-Wächter, diesmal ZWEI Spuren
parallel über denselben Diff: Astra (3,22 $) und eine Claude-Review mit freier
Dateiwahl und Ausführungsrechten. **Neun Befunde zusammen, alle neun nach
eigener Nachmessung getragen — und KEIN EINZIGER kam in beiden Spuren vor.**

Das ist die bisher deutlichste Messung zu der Frage „reicht eine Spur?". Die
Antwort ist nein, und sie ist nicht knapp.

**Was nur die Claude-Spur fand** (jede Mutation von mir selbst nachgemessen,
Ergebnis jeweils `EXIT 0, 65 PASS / 0 FAIL`):

- `ERFASSTE_WURZELVERZEICHNISSE` auf vier statt sechs Einträge gekürzt — der
  Wächter meldet zufrieden „0 von 182 Dateien" und „gelesen entspricht der
  Anzahl gescannter Dateien (182 von 182)". `workers/` und `public/`
  verschwinden lautlos: genau die 29 Dateien, deren Aufnahme in einem eigenen
  Commit als Zweck der Nacharbeit benannt ist. **Beide Seiten der
  Gleichung stammen aus derselben Liste** — die Hausregel „eine Zusicherung,
  die ihren Sollwert aus dem bezieht, was sie bewachen soll, ist keine", in
  ihrer teuersten Ausprägung.
- `catch (fehler) { continue; }` statt der Fehlersammlung: der Zweig, der
  einen Leseausfall überhaupt sichtbar macht, ist von keiner Fixtur berührt.
- `gelesen: dateipfade.length`: die neue Zählung ist von der Länge der
  Übergabeliste nirgends unterscheidbar.
- Die Zusicherung „gelesen erreicht die Mindestschwelle" kann nicht ALLEIN
  fallen — sie folgt logisch aus zwei anderen. Gemessen: eine Kürzung auf 180
  Dateien lässt sie grün, während die Nachbarzusicherung fällt. Eine der 65
  gezählten Zusicherungen ist damit hohl.
- Der Verzeichniszweig in der neuen Wurzelbehandlung ist unbewacht.

**Was nur Astra fand** (ebenfalls je selbst nachgemessen, alle `EXIT 0,
65 PASS / 0 FAIL`):

- Die Dateiliste durch `gescannteDateien.map(() => 'core/datum.js')` ersetzt:
  ein und dieselbe fundfreie Datei wird 186-mal gelesen, die Zählung stimmt,
  der Bestand ist ungeprüft. `gelesen` zählt LESEVORGÄNGE, nicht Dateien.
- `wurzelJsDateien([])` statt `wurzelJsDateien(scanFehler)`: die neue
  Wurzelfehler-Weitergabe ist abgeschnitten. Nachgemessen mit einem ECHTEN
  Wurzel-Symlink auf eine Datei mit echter Falle — er ist wieder vollständig
  unsichtbar, „0 von 186 Dateien", grün. Meine eigene Symlink-Gegenprobe
  bestätigt also die heutige Implementierung, ist aber keine bleibende
  Zusicherung gegen diesen Verdrahtungsfehler.
- `gelesen: gelesen + proDateiFunde.size`: für die Fallen-Datei wird `gelesen`
  gar nicht ausgelesen, die Doppelzählung fällt niemandem auf.
- `workers` selbst als Symlink auf einen leeren Baum: 185 statt 186 Dateien,
  KEIN Scanfehler, grün. Die Zusage „Symlink wird als Scanfehler gemeldet,
  nicht aufgelöst" gilt ausgerechnet für die sechs Baumwurzeln nicht, weil
  `readdirSync` dem Pfad folgt und `withFileTypes` die KINDER beschreibt.

**Warum sich die Spuren so sauber trennen**, soweit sich das an einem Fall
sagen lässt: Die Claude-Spur durfte AUSFÜHREN und hat mutiert und gemessen —
ihre Funde sind durchweg „diese Zeile zurückdrehen, Lauf bleibt grün". Astra
durfte nur LESEN und hat am Kontrollfluss gedacht — seine Funde sind durchweg
„es gibt einen Zustand, den keine Fixtur je herstellt". Das sind zwei
verschiedene Suchverfahren, keine zwei Meinungen über dieselbe Frage.

**Astra hat außerdem eine eigene frühere Einstufung zurückgenommen** (die
temporäre Datei als blockierender Verstoß gegen die Dateisystem-Regel): „Für
die bewusste Temp-Verzeichnis-Entscheidung habe ich keinen zusätzlichen
konkreten Angriffspfad nachgewiesen. Ich wiederhole deshalb die frühere
blockierende Einstufung nicht." Das ist die Sorte Antwort, die ein Prüfer
geben können muss, damit seine Befunde etwas wert sind.

**Der gemeinsame Nenner aller neun Befunde** ist EIN struktureller Mangel, und
das ist die eigentliche Erkenntnis: Es gibt keine Zusicherung darüber, WELCHE
Dateien der echte Scan tatsächlich gelesen hat. Alles, was es gibt, sind
Zahlen — und jede dieser Zahlen lässt sich aus derselben Quelle erzeugen wie
ihr Sollwert. Vier der neun Befunde sind nur Ausprägungen davon.

## Der Regress: jede Behebung erzeugt die nächste Blindstelle (13.09.2026, fünfte Runde)

Ich hatte diese Runde als LETZTE angesetzt und mich vorher auf eine
Abbruchregel festgelegt: nur noch blockierende Befunde werden gebaut. Sie kam
mit zwei blockierenden zurück, 11,78 $ — der teuerste Lauf des Tages, weil die
Prüfung 49 Suchen und 13 Runden brauchte.

**Beide sind derselbe Fehler wie in Runde 4, nur eine Ebene tiefer — und die
Ebene hat MEINE eigene Behebung eingezogen.**

Runde 4 hatte gezeigt: der Wächter sichert eine ZAHL zu, wo er eine MENGE
zusichern muss. Die Behebung ersetzte den Zähler durch `gelesenePfade`, die
Liste der tatsächlich gelesenen Pfade, und verglich sie elementweise gegen die
gescannten Dateien. Das sah nach dem Ende der Klasse aus.

Gemessen, mit einer ECHTEN Falle in `verify-daily.js` als gemeinsamer
Gegenprobe (Positivkontrolle zuerst: unmutiert meldet der Wächter sie,
**EXIT 1, drei Kreuze**):

    // in scanneDateien(), eine Zeile:
    fs.readFileSync(basisVerzeichnis ? path.join(basisVerzeichnis, dateipfade[0]) : rel, 'utf8')
    -> EXIT 0, 86 PASS / 0 FAIL

    // an alleGescanntenDateien(), eine Zeile:
    ergebnis.push(...wurzelJsDateien(scanFehler, wurzelEintraege).slice(0, 7));
    -> EXIT 0, 86 PASS / 0 FAIL

Im ersten Fall wird bei jedem Durchlauf DIESELBE erste Datei gelesen, während
`gelesenePfade.push(rel)` weiterhin alle 186 verschiedenen Namen protokolliert.
Der Mengenvergleich, den ich gerade als Lösung eingebaut hatte, bestätigt
zufrieden eine Menge, die aus den ANGEFORDERTEN Namen stammt — nicht aus dem,
was gelesen wurde. Im zweiten Fall wird die Wurzelliste auf sieben Einträge
gekürzt; die literale Mindestzahl für Wurzeldateien steht auf genau 7, und der
Leser bekommt die schon verkürzte Liste und bestätigt korrekt, dass er *diese*
gelesen hat.

**Das Muster, und es ist allgemeiner als dieser Wächter:** Jeder Nachweis, den
ein Prüfling über die eigene Arbeit führt, stammt aus seinem EIGENEN
Datenfluss. Man kann ihn beliebig verfeinern — Zahl, dann Menge, dann Menge
mit Reihenfolge — und verschiebt die Lücke nur eine Ebene tiefer, statt sie zu
schliessen. Der Regress endet erst an einer Referenz von AUSSEN.

Für diesen Wächter heisst das konkret: die erwartete Dateimenge kommt aus
`git ls-files` (der Scanner benutzt es nicht), und P6 ruft mit MEHREREN
verschiedenen Dateien in EINEM Aufruf, damit ein falsch gelesener Inhalt eine
falsche Fundzuordnung erzeugt statt nur eine falsche Zahl. Drei getrennte
Ein-Datei-Aufrufe ersetzen das nicht — bei einer einelementigen Liste ist
`rel` immer `dateipfade[0]`, die Mutation ist dort unsichtbar.

**Was das über die Abbruchregel sagt:** Sie war richtig formuliert und hat
funktioniert — „nur noch blockierend" hat die drei Anmerkungen dieser Runde
korrekt aussortiert. Falsch war die Ankündigung „letzte Runde". Man kann
festlegen, WAS man noch baut; man kann nicht vorher festlegen, dass nichts
Blockierendes mehr kommt.

**Kosten bis hier, damit es jemand gegen den Nutzen halten kann:** fünf
Bau-Runden, fünf Gegenlesungen (3,72 + 2,89 + 3,38 + 3,22 + 11,78 = 24,99 $)
plus eine Claude-Review, für EINE neue Testdatei. Der Gegenwert ist ein
Wächter, der neun gemessene Wege, still zu erblinden, nicht mehr hat — und ein
Geschwisterwächter im selben Repo, der die meisten davon weiterhin hat.
