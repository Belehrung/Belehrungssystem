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
| 14.09.2026 | Fuenfte Bestaetigungsrunde: Waechter Zeitzonenfalle, Referenzen von aussen | Diff 579 Zeilen, Suchen 8, Lesungen 11, Token rein 231345, Token raus 6894, Runden 5 | 2 | 2 | 0 | 3,41 $ |
| 14.09.2026 | Sechste Bestaetigungsrunde: Waechter Zeitzonenfalle, Kopie und git-Referenz nach dem Lesen | Diff 373 Zeilen, Suchen 11, Lesungen 13, Token rein 276620, Token raus 6289, Runden 6 | 1 | 1 | 0 | 3,93 $ |
| 14.09.2026 | Gegenlesung Symbole-Ueberlauf (erster Beitrag ausserhalb der Zeitzonen-Reihe) | Diff + 7 Dateien + beide Testausgaben, ~144.000 Zeichen, Token rein 41296, Token raus 28810 | 2 | 1 | 1 (Behebungsvorschlag haette das Deploy-Gate lahmgelegt) | n. e. (nicht ablesbar) |
| 14.09.2026 | Gegenlesung Archiv-Abschneiden samt Herausloesung des Messwegs | Diff + 8 Dateien + VIER Testausgaben, ~175.000 Zeichen, Token rein 49235, Token raus 35756 | 2 | 2 | 0 | n. e. (nicht ablesbar) |
| 14.09.2026 | **PLAN**-Pruefung: Scan-Apparat herausloesen (VOR der Umsetzung) | Plan + 3 Dateien, 181.491 Zeichen, Token rein 53776, Token raus 9565 (davon 7040 Nachdenken) | 5 | 5 | 0 | n. e. (nicht ablesbar) |
| 14.09.2026 | Gegenlesung Scan-Apparat herausgeloest (Diff, NACH der Planpruefung) | Diff + 5 Dateien vollstaendig + Messungen, 293.727 Zeichen, Token rein 86823, Token raus 14265 (davon 12736 Nachdenken) | 3 | 1 voll + 2 teilweise | 0 ganz gefallen; bei einem fiel die Praemisse („Duplikat bliebe unentdeckt" — es wird erkannt), bei einem zwei von drei Vorschlaegen | n. e. (nicht ablesbar) |
| 14.09.2026 | **PLAN**-Pruefung: Erfassungsbereich parametrieren, zwei weitere Waechter anschliessen (VOR der Umsetzung) | Plan + 4 Dateien vollstaendig, 174.838 Zeichen, Token rein 51.981, Token raus 11.082 (davon 8.192 Nachdenken) | 8 | 8 | 0 | n. e. (nicht ablesbar) |
| 14.09.2026 | Gegenlesung Erfassungsbereich parametriert (Diff, NACH der Planpruefung) | Diff + Messungen + 5 Dateien vollstaendig, 311.837 Zeichen, Token rein 92.693, Token raus 15.087 (davon 12.992 Nachdenken) | 6 | 3 | 2 gefallen (beide Praemissen gegen den Bestand gemessen falsch: der Mengenvergleich gegen git faengt beides); 1 ging in einen tragenden auf | n. e. (nicht ablesbar) |
| 14.09.2026 | **PLAN**-Pruefung: `test/rohwert-scan.js` schluckt unlesbare Verzeichnisse (VOR der Umsetzung) | Plan + 6 Dateien vollstaendig, 198.325 Zeichen, Token rein 58.056, Token raus 11.819 (davon 9.152 Nachdenken) | 6 | 4 | 1 gefallen (Aufruferbehauptung am Quelltext widerlegt); 1 formal (meine eigene Fragenzahl) | n. e. (nicht ablesbar) |
| 14.09.2026 | Gegenlesung Rohwert-Scan an den Helfer (Diff, NACH der Planpruefung) | Diff + Messungen + 5 Dateien vollstaendig, 197.722 Zeichen, Token rein 58.277, Token raus 12.775 (davon 11.136 Nachdenken) | 5 | 1 voll (beide Seiten am selben Helfer — als „niedrig" eingestuft, gemessen BLOCKIEREND) | 0 ganz gefallen; 4 blieben Anmerkungen ohne eigene Messung | n. e. (nicht ablesbar) |
| 14.09.2026 | **OBERFLAECHE**: Trainer-Tablet, Uebersichtlichkeit bei Altdefekt + neuem Defekt (Betreiber-Auftrag) | Gerendertes HTML beider Bildschirme + 3 Dateien vollstaendig + **3 Bildschirmfotos** (Bildeingabe erstmals genutzt), 529.328 Zeichen, Token rein 143.982, Token raus 15.526 (davon 11.367 Nachdenken) | 3 | 3 (als Beobachtung) | 0 ganz gefallen; bei einem ist der VORSCHLAG gemessen falsch (Chip auf `--gd-info-grund` gegen den Kartengrund `#2a1a1a`: **1,00:1**, unsichtbar) | n. e. (nicht ablesbar) |
| 14.09.2026 | **PLAN**-Pruefung: gemeinsame Mangel-Darstellung ueber drei Pruefarten (VOR der Umsetzung) | Plan + 6 Dateien vollstaendig + 2 gerenderte HTML + 2 Bildschirmfotos, 830.131 Zeichen, Token rein 225.319, Token raus 16.034 (davon 14.501 Nachdenken) | 1 | 1 | 0 ganz gefallen; die RENDER-Begruendung des Befunds war falsch (die genannte Zeile hat in der genannten Datei **0 Treffer** — die Reparaturseite war gar nicht im Buendel), der Befund selbst am Quelltext bestaetigt. Beim eigenen Nachmessen kam eine FUENFTE Fundstelle dazu, die die Pruefung nicht hatte | n. e. (nicht ablesbar) |
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

## Der Regress wandert weiter — jetzt in die Veränderbarkeit (14.09.2026)

Sechste Bau-Runde, fünfte Gegenlesung (3,41 $). Zwei Befunde, beide blockierend,
beide von mir selbst nachgemessen: **`EXIT 0, 85 PASS / 0 FAIL` mit einer echten
Falle im Bestand.**

Die Runde davor hatte den Selbstnachweis durch zwei Referenzen von AUSSEN
ersetzt — `git ls-files` für die Erfassung, `fs.statSync().size` für den
Inhalt. Das war richtig und hat gehalten: beide Referenzen sind wirklich
unabhängig, keine Mutation im Scanner kann sie mitverändern. Trotzdem:

    for (const rel of (dateipfade.splice(4), dateipfade)) {

Der Leser bekommt die Dateiliste als **veränderbares Array**. Alle Prüfungen,
die VOR ihm laufen — Mindestzahlen, Verzeichnisliste, Duplikate, der
git-Vergleich — sehen die vollständige Erfassung und sind zufrieden. Der Leser
kürzt danach dieselbe Instanz auf vier Einträge, liest diese vier, und der
Pfadvergleich hält das Gelesene gegen eine Sollmenge, die inzwischen ebenfalls
vier Einträge hat. Der Grössenvergleich prüft dieselben vier. Alles grün, die
Falle ungelesen.

**Die Lehre, und sie ist schärfer als die vom Vortag:** Es genügt nicht, dass
der SOLLWERT von aussen kommt. Auch die Frage, **WELCHE Elemente überhaupt
gegen ihn gehalten werden**, darf nicht von etwas abhängen, das der Prüfling
verändern kann. Eine unabhängige Referenz, die gegen eine veränderbare Auswahl
verglichen wird, prüft nur noch den Ausschnitt, den der Prüfling übrig lässt.
Reihenfolge zählt: eine Zusicherung, die VOR dem geprüften Schritt läuft,
sichert nichts über dessen Wirkung.

Der zweite Befund ist einfacher und derselben Familie: `if (f.length > 0)` auf
`> 1` gedreht verwirft jeden Einzelfund. Die eingesetzte Gegenprobe hat genau
EINEN Fund, die P6-Fixtur hat bewusst ZWEI — also fällt nichts auf. Die
Fixturwahl „zwei Funde, damit die Zahlen auseinanderfallen" (eine Behebung aus
Runde 3) hat hier gegen sich selbst gearbeitet: sie deckt den Zweifund-Weg ab
und liess den Einzelfund-Weg ungeprüft.

**Kosten bis hier:** sechs Bau-Runden, sechs Gegenlesungen (3,72 + 2,89 + 3,38
+ 3,22 + 11,78 + 3,41 = 28,40 $), dazu eine Claude-Review, für eine einzige
neue Testdatei. Wer das gegen den Nutzen halten will, hat jetzt beide Zahlen.

**Was in dieser Runde KEINE Gegenlesung gefunden hat**, sondern erst das
Laufenlassen: die rote Suite (`test_feature_keine_systemeingriffe.js` verbietet
`child_process` in Testdateien und fing den neuen `git`-Aufruf) und der
vorgeschriebene unprivilegierte Lauf (git verweigert die Arbeit in einem Baum,
der einem anderen Nutzer gehört — auf dem Deploy-Gate hätte das zugeschlagen).
Beide Leser haben in fünf Runden keinen davon gesehen. Das ist das stärkste
Argument dafür, dass die Trennung lesend/ausführend mehr trägt als eine
weitere Lese-Spur.

## Sieben Runden, sieben blockierende Wege (14.09.2026)

Siebte Gegenlesung (3,93 $), ein Befund, blockierend, selbst nachgemessen.
Damit steht die Trefferquote bei **7 von 7**: jede einzelne Runde über diesen
einen Wächter hat einen Weg gefunden, auf dem er grün meldet, während eine
echte Falle im Bestand liegt.

Dieser hier ist die zeitliche Beweislücke eine Stufe später als die vom
Vortag:

    const f = findeTreffer(puffer.toString('utf8', 0, 1024));

Jede Datei wird VOLLSTÄNDIG gelesen, ihre volle Länge korrekt protokolliert
und gegen `fs.statSync().size` bestätigt — an den Erkenner geht aber nur das
erste Kilobyte. GEMESSEN mit einer echten Falle am Ende von `verify-daily.js`
(2.914 Byte, die Falle liegt weit hinter der Grenze; Positivkontrolle
unmutiert: EXIT 1, drei Kreuze):

    EXIT 0, 87 PASS / 0 FAIL, null Kreuze.

Die Größenprüfung belegt den gelesenen PUFFER, nicht den an den Erkenner
ÜBERGEBENEN Text. Alle vier P6-Dateien sind kürzer als 1 KiB, also sieht auch
dort niemand etwas.

**Was diese sieben Runden über die Methode sagen, und das ist der eigentliche
Ertrag:** Sie belegen NICHT, dass der Wächter schlecht gebaut ist — jede
einzelne Behebung hat gehalten, keine hat Abdeckung gekostet, und alle
früheren Mutationen bleiben bis heute rot. Sie belegen etwas anderes: **„es
gibt keinen weiteren Weg" ist eine negative Aussage, und ein Prüfer mit
beliebig vielen Versuchen findet gegen eine solche Aussage immer noch einen.**
Die Schleife wird nicht dadurch beendet, dass der Code gut genug wird, sondern
dadurch, dass jemand aufhört zu fragen. Das ist eine Entscheidung, keine
Messung — und sie gehört dem Betreiber, nicht dem Prüfgang.

**Kosten bis hier:** sieben Bau-Runden, sieben Gegenlesungen
(3,72 + 2,89 + 3,38 + 3,22 + 11,78 + 3,41 + 3,93 = **32,33 $**), dazu eine
Claude-Review, für eine einzige neue Testdatei.

## Achte Nacharbeit: die erste Behebung, die eine Klasse SCHLIESST (14.09.2026)

Keine achte Gegenlesung — eine Behebung des Befunds aus der siebten, und sie
ist aus einem Grund festgehalten, der über diesen Wächter hinausgeht: sie ist
die erste, die die Klasse schliesst, statt sie eine Ebene tiefer zu schieben.

Der Befund war: beide Referenzen von AUSSEN (`git ls-files`, `fs.statSync`)
belegen das LESEN. Keine belegt das ERKENNEN. Eine dritte Zusicherung über den
gelesenen Puffer hätte daran nichts geändert — sie käme wieder aus demselben
Datenfluss.

Stattdessen eine Fixtur (P7), deren Falle HINTER der grössten wirklich
gescannten Datei liegt. Die Schwelle kommt von aussen und wächst mit:
`fs.statSync` über die git-Referenz, heute `routes/admin/geraete.js` mit
420.036 Bytes; die Fixtur schreibt so viele Füllzeilen, dass die Falle bei
Byte 420.174 beginnt.

Das Argument, warum das die Klasse schliesst und nicht nur den Einzelfall:
schneidet jemand den Puffer bei N Bytes ab, dann gilt entweder N < grösste
Bestandsdatei — dann liegt die Falle der Fixtur hinter N, die Fixtur wird rot
—, oder N > jede Bestandsdatei, dann wird im Bestand gar nichts abgeschnitten
und es gibt nichts zu verstecken.

GEMESSEN, je einzeln, mit derselben Datei:

| Mutation | Ergebnis |
|---|---|
| keine | EXIT 0, 90 PASS / 0 FAIL |
| `toString('utf8', 0, 1024)` | **EXIT 1, 88 PASS / 2 FAIL** |
| `toString('utf8', 0, 419999)` (knapp unter der grössten Bestandsdatei) | **EXIT 1, 88 / 2** |
| `toString('utf8', 0, 999999)` (über jeder Bestandsdatei) | EXIT 0, 90 / 0 — richtigerweise |

Die letzte Zeile ist kein Loch, sondern der Beleg für die Grenze: bei dieser
Schranke wird im Bestand nichts abgeschnitten. Eine Gegenprobe, die nur den
ersten Wert misst, belegt den Einzelfall; erst die Grenze in beide Richtungen
belegt die Klasse.

Nebenbefund aus demselben Lauf, weil er eine Hausregel bestätigt: das
Mutationsskript brach beim zweiten Versuch mit `ABBRUCH: Muster kommt 2-mal
vor, erwartet genau 1 — nichts geaendert.` ab. Die zweite Fundstelle war der
Kopfkommentar, der den Befund dokumentiert. Ohne die Eindeutigkeitsprüfung
hätte `String.replace()` den Kommentar mutiert und ein grünes Ergebnis
geliefert, das wie „die Zusicherung bewacht nichts" ausgesehen hätte.

**Kosten dieser Nacharbeit:** keine Gegenlesung, also 0 $ — die Messung lief
im eigenen Prüfstand. Der Gesamtstand für diesen Wächter bleibt bei
**32,33 $** Gegenlesung, jetzt über acht Bau-Runden.

## Symbole-Überlauf: zwei Befunde, einer hält (14.09.2026)

Erste Gegenlesung zu einem anderen Beitrag als dem Zeitzonenfallen-Wächter —
die Reparatur des waagerechten Überlaufs auf `/admin/lageplan/symbole` samt
neuem verhaltensbasiertem Wächter.

**Material:** Diff, die neue Testdatei vollständig, der Geschwisterwächter
`test_feature_content_min_width_static.js`, `test/helfer/route-harness.js`,
`test/helfer/chromium-start.js`, `test_feature_keine_systemeingriffe.js`, ein
Ausschnitt aus `routes/lageplan.js`, dazu BEIDE Testausgaben (grün und die
Gegenprobe rot). Rund 144.000 Zeichen.

**Zahlen:** `status: completed`, 41.296 Eingabe-Token, 28.810 Ausgabe-Token,
70.106 gesamt. Der Dollarbetrag ist hier NICHT eingetragen, weil ich ihn nicht
abgelesen habe — er steht auf der OpenAI-Abrechnung. Eine geschätzte Zahl wäre
schlechter als keine.

**Befunde: 2. Nach eigener Nachmessung getragen: 1.**

*Befund 1 (wichtig) — trägt.* Fehlt Chromium, überspringt der neue Wächter
seine vier eigentlichen Zusicherungen und endet trotzdem mit `EXIT 0`. Selbst
nachgemessen mit leerem `PLAYWRIGHT_BROWSERS_PATH`:

    EXIT=0 — 2 PASS / 0 FAIL / 1 ÜBERSPRUNGEN

Auf einem Prüfstand ohne Chromium winkt er damit dauerhaft durch.

*Befund 2 (Anmerkung) — trägt NICHT.* Die Behauptung war, die Warnung im
Kopfkommentar sei überholt, weil `test_feature_keine_systemeingriffe.js` nur
noch echte `require`-Aufrufe erfasse und nicht mehr die bloße Zeichenkette.
Die Prämisse stimmt zur Hälfte, die Schlussfolgerung nicht: der Wächter liest
in Zeile 519 den ROHEN Quelltext (`fs.readFileSync`) und zieht keine
Kommentare ab. Selbst gemessen, ein Kommentar mit der vollständigen
require-Schreibweise:

    EXIT=1 — test_feature_lageplan_symbole_ueberlauf.js (child_process)

zurückgenommen `EXIT=0`. Die Warnung ist also nötig, nicht überholt. Übrig
bleibt eine Formulierungsschärfung: die bloße Zeichenkette ist harmlos, erst
die volle Schreibweise schlägt an.

**Der wichtigste Punkt dieses Laufs ist aber nicht der Befund, sondern sein
BEHEBUNGSVORSCHLAG — und der war falsch.** Vorgeschlagen war, „Chromium fehlt"
überall hart rot zu machen, hilfsweise über einen Opt-out-Schalter. Auf dem
Live-Server, wo dieselbe Suite als Deploy-Gate läuft, wird bewusst kein
Chromium installiert; der Vorschlag hätte also das Deploy-Gate lahmgelegt.
Die richtige Antwort stand längst im Repo, gemessen und begründet
(`test_feature_offline_service_worker.js`, Befund B2 vom 09.09.2026):
**in der CI ein FAIL, ausserhalb ein SKIP** — weil die CI-Stufe Chromium
ausdrücklich installiert und der Live-Server nicht.

Das ist das zweite Mal (nach dem 12.09.2026), dass ein Behebungsvorschlag der
Gegenlesung seinen eigenen Befund nicht richtig geschlossen hätte. Die
Hausregel dazu steht bereits in der CLAUDE.md und hat diesmal gehalten: der
Befund wurde übernommen, der Vorschlag nicht.

## Archiv-Abschneiden: zwei Anmerkungen, beide getragen (14.09.2026)

Zweite Gegenlesung des Tages, diesmal zur Reparatur des stillen Abschneidens
auf `/admin/archiv` samt neuem Wächter und der Herauslösung eines gemeinsamen
Messwegs.

**Material:** Diff, der neue Wächter vollständig, der herausgelöste Helfer, der
umgestellte Geschwisterwächter, `route-harness`, `chromium-start`, der
Systemeingriffe-Wächter, ein Ausschnitt aus `routes/archiv.js` — dazu VIER
Testausgaben (je grün und rot für beide Wächter). Rund 175.000 Zeichen.

**Zahlen:** `status: completed`, 49.235 Eingabe-Token, 35.756 Ausgabe-Token,
84.991 gesamt. Dollarbetrag wieder nicht eingetragen — nicht ablesbar.

**Befunde: 2, beide als Anmerkung eingestuft. Nach eigener Nachmessung
getragen: 2.** Erstmals hat kein Befund dieser Reihe nicht getragen.

*Befund 1 — die Zusicherung prüfte Stellvertreter, der Kommentar versprach
mehr.* Der Kopfkommentar beschrieb die Reparatur über eine Scroll-Probe, die
Zusicherungen prüften `overflow-x`, Boxlage und `scrollWidth`. Nachgezogen:
die Probe gehört jetzt zur Zusicherung.

*Befund 2 — die Verfügbarkeitsprüfung startete Chromium anders als der
Messpfad* (ohne Flags gegen `--no-sandbox`). **Selbst nachgemessen, und der
Schaden ist HIER NICHT herstellbar:** als root UND unprivilegiert startet
Chromium mit und ohne Flag. Nachgezogen trotzdem, aber mit der ehrlichen
Begründung im Kommentar — Hausregel, nicht Messung. Das gehört unterschieden,
sonst steht in einem Monat eine Behauptung im Code, die nie gemessen wurde.

**Der eigentliche Ertrag kam aber nicht aus den Befunden, sondern aus der
SUCHE nach einer Gegenprobe dazu.** Der Ausführende sollte eine Mutation
finden, die die drei alten Stellvertreter erfüllt und das Scrollen trotzdem
verhindert. Er prüfte sechs Kandidaten, fand nur `direction:rtl` wirksam
(`scrollLeft=9999` klemmt bei 1), stufte das als unrealistisch ein und meldete
es ausdrücklich als NICHT übernommenen Fund statt als Gegenbeweis.

Genau diese Ehrlichkeit legte die eigentliche Schwäche offen: die Schwelle
lautete „`scrollLeft` grösser als 0" — eine Schwelle über eine ZAHL, keine
Zusicherung über ERREICHBARKEIT, also unsere eigene Fehlerklasse. Verschärft
auf „bis ans Ende" (`sl >= scrollWidth - clientWidth - 1`) und gemessen:

| Fall | Ergebnis |
|---|---|
| unverändert | EXIT 0, 8 PASS / 0 FAIL (223/223, 155/155, 275/275) |
| Regel entfernt | **EXIT 1, 4 PASS / 4 FAIL** |
| `direction:rtl` | **EXIT 1, 4 PASS / 4 FAIL** |

Im dritten Fall sind alle drei alten Stellvertreter erfüllt und nur die neue
Zusicherung fällt. Die alte Fassung wäre bei zwei von drei Behältern grün
geblieben.

**Lehre für das Verfahren, und sie ist neu:** Ein Prüfer, der einen Fund
FINDET und ihn dann selbst als unrealistisch zurückstuft, liefert mehr als
einer, der ihn verschweigt ODER als Beweis verkauft. Der Fund war für seinen
ursprünglichen Zweck wertlos und für einen anderen entscheidend. Wer solche
Funde im Bericht unterdrückt, weil sie „nichts zeigen", wirft genau das weg.

Nebenbefund aus derselben Nacharbeit, vom Ausführenden beim Bauen selbst
entdeckt: bei `scroll-behavior:smooth` liefert ein sofortiges Zurücklesen von
`scrollLeft` den Wert 0, nach 50 ms 19, erst nach ~300 ms den vollen Wert.
Eine Probe ohne Wartezeit hätte künftig falsch rot gemeldet.

## Die erste PLAN-Pruefung, die es wirklich gab (14.09.2026)

Seit dem 10.09.2026 steht in der CLAUDE.md, der Plan sei „der Punkt mit dem
groessten Hebel" — und bis heute ging trotzdem immer nur der fertige Diff
raus. Das hier ist die erste Ausnahme, und sie hat sich sofort bezahlt
gemacht.

**Anlass:** `test_feature_geraete_datumsfallen.js` meldet gruen, waehrend vier
von sechs Verzeichnissen ungelesen bleiben. Selbst gemessen, acht Mutationen
einzeln, Basis `EXIT 0, 38 PASS / 0 FAIL`:

| Mutation | Ergebnis |
|---|---|
| `readdirSync` wirft fuer `ops` / `tools` / `workers` / `public` | je **EXIT 0, 38 PASS / 0 FAIL** |
| `wurzelJsDateien()` liefert `[]` | **EXIT 0, 38 PASS / 0 FAIL** |
| Verzeichnisliste sechs → zwei gekuerzt | **EXIT 0, 38 PASS / 0 FAIL** |
| dito `routes` / `core` | je EXIT 1, 37 PASS / 1 FAIL |

`routes` und `core` fallen nur ZUFAELLIG auf: die Ausnahmeliste hat genau dort
Eintraege. Das ist keine Absicherung des Scans, sondern ein Nebeneffekt.

**Material:** der Plan (87 Zeilen), beide Waechter vollstaendig, dazu
`test/helfer/ueberlauf-messung.js` als Vorbild fuer die Aufteilung
„Helfer liefert Tatsachen, Waechter entscheidet". 181.491 Zeichen.

**Fuenf Befunde, alle fuenf nach eigener Nachmessung getragen.** Das ist
ungewoehnlich — in dieser Reihe ist sonst regelmaessig einer gefallen. Der
Grund ist vermutlich die Gattung: ein Plan hat keine Zeilen, an denen sich
eine Schwereeinstufung vergreifen kann.

**Der Befund, der den Auftrag gerettet hat** — der Plan sagte „wortgleich
herausloesen". Im gehaerteten Waechter steht `const ROOT = __dirname;` und
wird fuer `safe.directory=${ROOT}` und `cwd: ROOT` benutzt. In
`test/helfer/` zeigte `__dirname` dann auf das Helferverzeichnis. Selbst
unprivilegiert nachgemessen, mit Positivkontrolle:

    sudo -u nobody env HOME=/tmp git -c safe.directory=<repo>/test/helfer \
         -C <repo>/test/helfer ls-files
      -> fatal: detected dubious ownership in repository at '<repo>'

    sudo -u nobody env HOME=/tmp git -c safe.directory=<repo> -C <repo> ls-files
      -> .env.example, .github/dependabot.yml, ...

Git will die WURZEL des Arbeitsbaums, nicht ein Unterverzeichnis. Die
wortgleiche Herausloesung waere im unprivilegierten Gegenlauf rot geworden —
mit einer Meldung, die auf git zeigt und nicht auf den Auftrag. Der Repo-Pfad
wird jetzt vom Aufrufer INJIZIERT.

**Die anderen vier, je selbst nachgemessen:**

*Die Liste der herauszuloesenden Bausteine war unvollstaendig.* Gezaehlt: alle
vier zusaetzlich genannten Funktionen (`verarbeiteWurzelEintrag`,
`wurzelJsDateien`, `alleGescanntenDateien`, `liegtImErfassungsbereich`)
existieren im gehaerteten Waechter. Ohne sie haette jeder Waechter den
Wurzel-Scan neu formuliert — genau die verbotene Klasse, und die gemessene
Mutation „Wurzeldateien leer" waere still geblieben.

*„Verhalten unveraendert" war ueber Zusicherungszahlen versprochen.* Eine Zahl
ist keine Menge — unsere eigene Regel, im Plan uebersehen. Der Auftrag verlangt
jetzt zusaetzlich einen Diff der erfassten PFADMENGE in beide Richtungen.

*Die Rotung von `routes`/`core` haengt an der Ausnahmeliste.* Der Plan sagte
„sechs Mutationen rot bekommen", ohne zu sagen, dass die Absicherung
UNABHAENGIG von Ausnahmeeintraegen tragen muss.

*Der neue Helfer faellt unter den Systemeingriffe-Waechter.* Gemessen:
`alleTestdateien()` sammelt `test/` VOLLSTAENDIG, das Muster
`require\(\s*['"](?:node:)?child_process['"]\s*\)` trifft also auch einen
Helfer, und der Schluessel ist `path.relative(__dirname, datei)`. Kein einziger
`test/helfer/`-Pfad steht bisher in der Ausnahmeliste. Dazu die
Nebenbehauptung, die ebenfalls hielt: der Geraete-Waechter begruendet in
Block 3b ausdruecklich Unabhaengigkeit „von git, Netzwerk und
Checkout-Tiefe" — das galt gegen `git show <commit>`, nicht gegen
`git ls-files`, aber der Satz wird mit diesem Beitrag falsch und gehoert
mitgezogen.

**Was das ueber das Verfahren sagt:** Vier der fuenf Befunde betreffen Dinge,
die ein Diff-Gegenleser erst NACH einer vollen Bau-Runde gesehen haette. Der
Plan war ein paar Kilobyte. Das ist kein Beweis, dass Planpruefungen immer
lohnen — es ist EIN Lauf —, aber es ist der erste eigene Messwert dazu
ueberhaupt, und er zeigt in dieselbe Richtung wie die Regel, die seit dem
10.09. unbefolgt dastand.

## Der Befund, der die eigene Behebung eine Ebene hoeher wiederholt (14.09.2026)

Zweiter Lauf zum selben Beitrag wie die Planpruefung weiter oben — diesmal der
fertige Diff. Das Material trug erstmals BEIDE Sorten Beleg zusammen: den Diff,
fuenf Dateien vollstaendig (Helfer, beide Waechter, den Systemeingriffe-
Waechter, den Messweg-Helfer als Vorbild) UND eine eigene Messungen-Seite mit
allen Gegenproben-Zahlen, vorher gegen nachher.

**Drei Befunde. Einer trug vollstaendig, zwei nur zum Teil** — und das ist
der Eintrag wert, weil es die erste Runde dieser Reihe ist, in der eine
PRAEMISSE eines Befunds messbar falsch war.

**Der tragende Befund, blockierend:** Der Geraete-Waechter schuetzt sich
dagegen, dass sein Scan lautlos schrumpft, allein dadurch, dass er die
git-Referenz mit seiner EIGENEN literalen Verzeichnisliste aufruft, waehrend
der Scan die Konstante aus dem Helfer benutzt. Tauscht jemand das Argument
gegen die Helfer-Konstante — eine plausible Aufraeum-Aenderung —, stammen beide
Seiten aus derselben Quelle. Selbst gemessen, in zwei Schritten:

| Schritt | Ergebnis |
|---|---|
| nur das Argument getauscht | EXIT 0, 40 PASS / 0 FAIL — nichts kaputt, aber der Schutz ist lautlos weg |
| zusaetzlich die Konstante sechs → zwei gekuerzt | **EXIT 0, 40 PASS / 0 FAIL**, waehrend `ops/`, `tools/`, `workers/`, `public/` verschwunden sind |

Das ist genau die Klasse, die dieser Beitrag schliessen sollte — eine Ebene
hoeher. Der gehaertete Waechter hat dagegen seit seiner dritten Runde eine
eigene Zusicherung („der Erfassungsbereich entspricht der unabhaengig
hingeschriebenen, literalen Erwartung"); dem Geschwisterwaechter fehlte sie.
**Verallgemeinert, und das ist die Lehre:** wer zwei Waechter an denselben
Helfer haengt, erbt dessen Staerken NICHT automatisch — die Zusicherungen
bleiben beim Aufrufer, und genau dort faellt eine fehlende nicht auf, weil der
Helfer ja „schon geprueft" ist.

**Die falsche Praemisse:** Befund 2 sagte, ein Duplikat in der Erfassungsliste
bliebe im Geraete-Waechter unentdeckt. Selbst gemessen, Duplikat eingeschleust:
**EXIT 1, 39 PASS / 1 FAIL**, ueber den Laengenteil des Mengenvergleichs
(`186 … gescannt 187`). Die Klasse ist gedeckt. Was trug, war die zweite
Haelfte desselben Befunds: der gehaertete Waechter NENNT die Ursache
(`gescannteDateien enthaelt keine Doppelten (1 Duplikate gefunden)`), der
andere nicht. Uebernommen wurde also die Diagnose, nicht die Abdeckung — und
genau so steht es jetzt auch im Kommentar, damit dort in einem Monat keine
Behauptung steht, die die Messung nicht hergibt.

**Zwei Vorschlaege ausdruecklich NICHT uebernommen:** das uebergebene
Verzeichnis-Array im Helfer zu validieren, und eine einschaltbare
Selbstpruefung zu exportieren, die der Helfer ueber seine eigene Konstante
fuehrt. Das zweite waere genau der Selbstnachweis aus dem eigenen Datenfluss,
gegen den der ganze Apparat gebaut ist; beim ersten hat niemand gemessen, dass
er etwas faengt.

**Was der Pruefer selbst benannt hat:** seine Pruefgrenze steht im Ergebnis —
er hat die Messzahlen aus dem Auftrag NACHVOLLZOGEN, nicht nachgemessen, weil
ihm dafuer kein Ausfuehrungswerkzeug bereitsteht. Jeder Befund blieb damit eine
Behauptung, bis ich sie selbst gemessen hatte; bei einem von dreien hat sich
das direkt ausgezahlt.

## Die Planpruefung, die zum zweiten Mal mehr trug als die Diffpruefung (14.09.2026)

Dritte und vierte Runde desselben Tages, diesmal zum Anschliessen der beiden
letzten Waechter an den Scan-Helfer. Zum zweiten Mal hintereinander wurde
ZUERST der Plan gegengelesen und erst danach gebaut — und zum zweiten Mal
liegt die Ausbeute deutlich auf der Planseite:

| Runde | Material | Befunde | getragen |
|---|---|---|---|
| Plan (vor dem Bau) | 174.838 Zeichen | 8 | **8** |
| Diff (nach dem Bau) | 311.837 Zeichen | 6 | 3 |

**Acht von acht Planbefunden hielten der eigenen Nachmessung stand.** Zwei
davon haetten je eine ganze Bau-Runde gekostet, wenn sie erst am Diff
aufgefallen waeren:

*Die `safe.directory`-Falle.* Der Plan liess offen, wie die git-Referenz im
Wurzel-Modus aufgerufen wird. Selbst nachgemessen, unprivilegiert: `git -c
safe.directory=<pfad>` will die WURZEL des Arbeitsbaums, nicht ein
Unterverzeichnis darin — mit einem Unterverzeichnis verweigert git den Dienst.
Der Helfer bekommt die Repo-Wurzel deshalb injiziert, nie `__dirname`.

*Das Schrumpfen am Pathspec.* Die beiden Modi brauchen verschiedene Muster,
und der Unterschied ist kein Feinheitsunterschied: `':(glob)*.js'` trifft
**320** Wurzeldateien, `':(glob)**/*.js'` **519** im ganzen Baum. Wer beim
Umbau versehentlich das eine gegen das andere tauscht, bekommt keinen Fehler,
sondern einen lautlos geschrumpften Erfassungsbereich — genau die Klasse, die
dieser ganze Apparat schliessen soll.

*Und eine dieser beiden Zahlen war bei mir selbst falsch notiert — auf genau
die Art, vor der dieser Apparat schuetzt.* In meiner Notiz stand „320 gegen
**3033**". Fuer diesen Eintrag noch einmal gemessen: `git ls-files --
':(glob)**/*.js'` liefert **519**. Die 3033 kam aus `find . -name '*.js'`
(heute 3035) — also aus einer Quelle, die `node_modules` mitzaehlt und mit
`git ls-files` nichts zu tun hat. Der Befund selbst bleibt unberuehrt, 320
gegen 519 ist genauso ein lautloses Schrumpfen. Aber die Zahl haette in einem
Monat als Messwert AN EINER git-Referenz dagestanden, obwohl sie von einer
ganz anderen Stufe stammt — dieselbe Verwechslung, die die Regel „eine
Referenz von AUSSEN belegt genau die Stufe, die sie misst" beschreibt, nur
diesmal in meiner eigenen Buchfuehrung statt im Code.

**Auf der Diffseite fielen dagegen drei von sechs**, und zwar an derselben
Stelle wie in der Runde davor: beide gefallenen Praemissen lauteten „das
bliebe unbemerkt", und beide Male fing es der Mengenvergleich gegen `git
ls-files` sehr wohl. Gemessen statt geglaubt — eine leere
Wurzeldatei-Injektion: **EXIT 1, 82 PASS / 3 FAIL** (B) bzw. **EXIT 1, 107 /
1** (C); `endsWith` auf `includes` gedreht: **EXIT 1, 89 PASS / 3 FAIL**,
weil im Bestand fuenf `.json`-Dateien `.js` als Teilzeichenkette tragen. Der
sechste Befund war kein eigener, er ging in einen der drei tragenden auf.

**Was das ueber das Verfahren sagt — und was nicht.** Zwei Runden mit
demselben Muster sind zwei Runden, keine Statistik; der Vorsprung des Plans
kann auch daran liegen, dass ein Plan weniger Text ist und die Aufmerksamkeit
nicht in Nebensaechlichkeiten laeuft. Was aber ueber beide Runden stabil ist
und gegen die eigene Bequemlichkeit spricht: **die gefallenen Befunde waren
ausnahmslos die auf der DIFF-Seite, und ausnahmslos von der Form „X bliebe
unentdeckt".** Ein Pruefer ohne Ausfuehrungswerkzeug kann diese Form nicht
selbst pruefen — er sieht, dass keine Zusicherung X namentlich nennt, und
schliesst daraus, dass X durchkaeme. Der Mengenvergleich nennt nichts
namentlich und faengt trotzdem alles. Daraus folgt kein Misstrauen gegen den
Pruefer, sondern eine Arbeitsanweisung an mich: **jeder Befund der Form „das
bliebe unbemerkt" wird als erstes mutiert, nicht als erstes geglaubt.**

## Der erste Lauf, der eine ABLEHNUNG von mir gekippt hat (14.09.2026)

Bis hierher hatte die Gegenlesung immer Lücken IN dem gefunden, was ich bauen
wollte. Dieser Lauf hat etwas anderes getroffen: einen Satz, mit dem ich einen
Vorschlag von vornherein AUSGESCHLOSSEN hatte.

Im Plan stand unter „Was ich bewusst NICHT vorschlage": keine Verschmelzung mit
dem parametrierten Helfer aus #437, weil dessen Parametermodell die
`test_`-Präfixregel für Wurzeldateien nicht kenne und man ihn dafür „für genau
einen Aufrufer verbreitern" müsste. Ich hatte dazugeschrieben, das sei eine
Entscheidung und kein Messergebnis — was ehrlich war und trotzdem nicht
genügt: eine Entscheidung auf einer falschen Tatsachengrundlage ist eine
falsche Entscheidung, egal wie sie gekennzeichnet ist.

Der Befund lautete, der Helfer trage alle drei genannten Unterschiede bereits:
Endungen über `bereich.endungen`, den Einzelausschluss über
`bereich.ausgeschlosseneDateien`, und die Präfixregel stecke in
`verarbeiteWurzelEintrag()`. Selbst nachgemessen, mit einer Probe ausserhalb
des Repos, die beide Scanner ruft und die Mengen elementweise vergleicht:

| Vergleich | Ergebnis |
|---|---|
| alter Scanner gegen Helfer mit Rohwert-Bereich | **212 = 212**, nur-im-Alten 0, nur-im-Neuen 0 |
| Helfer-Scan gegen `ermittleGitReferenz()` desselben Bereichs | **212 = 212**, nur-im-Scan 0, nur-in-git 0 |

Damit fällt nicht nur meine Begründung, sondern die ganze Struktur des Plans:
statt eine Fehlersammlung in den alten Scanner zu bauen, ziehen die drei
Wächter auf den Helfer um und erben dabei die git-Referenz, gegen die eine
blosse Fehlersammlung ohnehin nicht ankommt.

**Das war zugleich der blockierende Befund dieses Laufs**, und er ist eine
Anwendung unserer eigenen Regel auf einen Fall, den ich nicht als solchen
gesehen hatte: *eine Fehlersammlung ist AUCH ein Selbstnachweis aus dem
eigenen Datenfluss.* „Keine Scanfehler" fängt nur, was `readdirSync` als
Fehler meldet — eine gekürzte Endungsliste oder ein zusätzlicher Ausschluss
schrumpft den Scan, ohne je einen Fehler zu erzeugen. Ich hatte die Regel
zwei Tage lang selbst eingetragen und trotzdem einen Plan geschrieben, der
genau daran vorbeigeht.

**Was FIEL, und warum das den Lauf nicht entwertet:** Ein Befund behauptete,
`test_feature_wartung_faelligkeit_datumsfallen.js` benutze längst den neuen
Helfer, mein Plan sei insoweit überholt. Am Quelltext widerlegt — Zeile 475
lautet `const { alleGescanntenDateien } = require('./test/rohwert-scan');`,
und die Funktion wird in 477 und 502 mit null Argumenten gerufen. Alle drei
Aufrufer brauchen also Arbeit, nicht zwei. Ein sechster Befund war rein
formal (mein Vorspann sprach von vier Fragen, der Plan stellte fünf).

Die Lehre für die Aufgabenteilung ist dieselbe wie am 13.09., nur von der
anderen Seite: **der Prüfer liest gut und misst nicht.** Er hat in einer
grossen Datei richtig gesehen, welche Fähigkeiten der Helfer trägt — und in
einer anderen falsch geschlossen, welchen Scanner ein Wächter ruft. Beides
hätte ein einziger `grep` entschieden. Jeder Befund bleibt eine Behauptung,
bis ich sie selbst gemessen habe; hier hat sich das in BEIDE Richtungen
ausgezahlt.

## Der erste Befund, den BEIDE Spuren fanden — und der Unterschied war die Messung (14.09.2026)

Am 13.09.2026 steht weiter oben als Ergebnis: neun Befunde, zwei Spuren, **null
Überschneidung**. Heute gab es die erste, und sie ist lehrreicher als jede
Trennung.

Beide Spuren liefen über denselben Diff. Beide sahen dieselbe Struktur: der
Scan, die git-Referenz und das Bereichsprädikat schicken ihren `bereich` alle
durch dieselbe Funktion `pruefeBereich()`. Was sie daraus machten, war
gegensätzlich:

| | Astra (nur LESEN) | Claude-Spur (darf AUSFÜHREN) |
|---|---|---|
| Einstufung | **niedrig** | **hoch** |
| Formulierung | „Ein Fehler dort *könnte* beide Seiten auf dieselbe Menge ziehen, **wenn** der Pathspec ihn nicht bereits eliminiert" | „Eine Zeile, 212 → 167 Dateien, alle drei Wächter EXIT 0" |
| Vorschlag | eine „Minimalinvariante" ergänzen | den wirksamen Bereich exportieren und gegen das Literal halten |

Selbst nachgemessen, mit Reachability-Beleg (die gemeldete Dateizahl änderte
sich): **alle drei umgestellten Wächter EXIT 0, 92/0, 26/0 und 45/0**, während
45 Dateien fehlten — und die Zusicherung meldete „167 = 167, in beide
Richtungen". Dazu, und das wog schwerer als der Beitrag selbst: **der bereits
ausgelieferte `test_feature_geraete_typ_filter_static.js` (#437, Deploy 408)
blieb bei EXIT 0, 108 PASS / 0 FAIL**, Scan auf 164 geschrumpft.

**Die Lehre ist nicht „Astra war schlechter".** Astra hat die Stelle GEFUNDEN,
ohne sie ausführen zu können — das ist genau die Leistung, für die es da ist.
Aber ein Befund im Konjunktiv wird nach Konjunktiv eingestuft, und eine
Einstufung „niedrig" hätte ihn in der Nacharbeit hinter vier andere sortiert.
Erst die Mutation macht aus „könnte" ein „tut". Das schärft die Regel vom
13.09. („die eine Spur darf ausführen, die andere nur lesen") um einen Satz,
der praktisch wichtiger ist als die Zahlen: **eine Schwereeinstufung aus einer
Spur ohne Ausführungswerkzeug ist eine Vermutung über die Schwere, nicht eine
Feststellung — und sie fällt systematisch zu niedrig aus.** Wer Befunde nach
gemeldeter Schwere abarbeitet, arbeitet die lesende Spur damit in der falschen
Reihenfolge ab.

**Was die messende Spur allein fand** (vier weitere, alle selbst nachgemessen
und alle getragen): ein `catch (e) { continue; }` ohne Sammlung im LESEZUGRIFF
desselben Wächters, dessen Kommentar genau das an anderer Stelle anprangert
(Datei unlesbar → EXIT 0, 92/0, bei gepflanztem Fund); zwei Wächter mit
zweistelligem `ok()`, die ihre Diagnose still verwarfen; die Filter-/Lesestufe
als ungebundene Klasse (Filter halbiert → EXIT 0, 26/0, Metas still 27 → 25);
und eine Berichtigung von MIR, die selbst falsch war.

**Was Astra allein fand und was davon trug:** die vier übrigen Befunde blieben
Anmerkungen — ein undokumentierter Sonderfall im Pathspec (aus #437, nicht aus
diesem Diff), ein Erfassungsbereich, der weiter reicht als nötig, `git` als
Betriebsabhängigkeit, und die Beobachtung, dass die Doppelten-Zusicherung im
Wurzel-Modus strukturell nicht fallen kann. Der letzte ist der beste von den
vieren und bleibt offen: die messende Spur hat dafür ebenfalls keinen
Ein-Zeilen-Defekt gefunden, der sie fällt.

### Nachtrag am selben Tag: eine DRITTE Spur, die beide anderen schlug

Der Abschnitt oben vergleicht zwei Spuren. Am PR zu diesem Beitrag lief eine
dritte mit, die keine von uns eingerichtet hat: ein Review-Bot, der als
CI-Prüfung am Pull Request hängt. Er meldete sich mit einem Befund, den
**beide** anderen Spuren übersehen hatten — die Bereichs-Zusicherung verglich
`ausgeschlosseneDateien` nicht, obwohl `pruefeBereich()` auch dieses Feld
normalisiert und beide Seiten des Mengenvergleichs es anwenden.

Selbst nachgemessen (`'server.js'` dort injiziert, unprivilegiert, danach
zurückgenommen):

| Wächter | Ergebnis | gescannt |
|---|---|---|
| `test_feature_geraete_typ_filter_static.js` | **EXIT 0, 108 / 0** | 185 statt 186 |
| `test_feature_datum_zeitzonenfalle_static.js` | **EXIT 0, 90 / 0** | 185 statt 186 |
| die drei neuen Wächter | je EXIT 1 | 211 statt 212 |

Gegengezählt statt vermutet: von vier Wächtern führten drei das Feld
**null**-mal im Vergleich — exakt die drei, die der Bot genannt hatte.

**Was das für die Aufgabenteilung heisst.** Es ist genau dieselbe Klasse, die
die messende Spur eine Ebene tiefer gefunden hatte (Modus statt Einzeldatei) —
und trotzdem hat sie keine der beiden Spuren eine Feldebene weitergedacht. Der
Bot hat nichts gemessen; er hat eine Aufzählung gelesen und bemerkt, dass ein
Feld darin fehlt. Das ist eine dritte Suchmethode neben „gemessene Mutation"
und „durchdachter Kontrollfluss": **stumpfer Vollständigkeitsabgleich einer
Aufzählung.** Billig, automatisch, und bei genau dieser Fehlerform stärker als
beide teuren Spuren.

**Was es NICHT heisst:** ein Befund an einem Tag. Der Bot lief hier zum ersten
Mal überhaupt mit, er kostet uns nichts, und er hat in denselben vier Läufen
sonst nichts beigetragen. Wer daraus „der Bot ersetzt eine Spur" macht, stützt
sich auf eine Stichprobe von eins — dieselbe Falle wie beim Modellvergleich
weiter oben in der CLAUDE.md.
