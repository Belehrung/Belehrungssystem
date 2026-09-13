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
