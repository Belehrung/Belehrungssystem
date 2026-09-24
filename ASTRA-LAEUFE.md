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

**Eine Zeile wird fertig geschrieben, wenn die Runde schliesst — nicht
spaeter.** Ein Platzhalter wie „NACHMESSUNG LAEUFT" ist richtig, solange die
Messung wirklich laeuft, und wird wertlos, sobald der Beitrag gemergt ist: die
Einzelurteile stehen dann nur noch im Sitzungsverlauf, und der ueberlebt keine
Kontextverdichtung. Gemessen am 16.09.2026 — drei Zeilen trugen nach dem Merge
noch Platzhalter, zwei davon sind endgueltig unvollstaendig geblieben. Wo eine
Zahl fehlt, steht ab jetzt ausdruecklich „nicht mehr rekonstruierbar" statt
einer geschaetzten: eine erfundene Zahl macht diese Datei nicht unvollstaendig,
sondern falsch.

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
| 14.09.2026 | Gegenlesung Mangel-Darstellung einheitlich (DIFF, NACH der Planpruefung) | Diff + 7 Dateien vollstaendig + eigene Messungen + 3 Bildschirmfotos, 851.847 Zeichen, Token rein 234.089, Token raus 23.451 (davon 20.435 Nachdenken) | 3 | 2 | 1 gefallen, und zwar **gemessen widerlegt**: die Behauptung, der Entdoppelungs-Waechter haenge nur an den Vorgabewerten von `mangelKarte()` und ein `icon:'💥'` im echten Aufrufer bliebe gruen — mutiert **EXIT 1, 48 PASS / 10 FAIL**, zurueckgenommen **EXIT 0, 58 PASS / 0 FAIL** (md5 identisch). Die Zusicherungen balancieren sich. | n. e. (nicht ablesbar) |
| 15.09.2026 | **PLAN**-Pruefung: das UNTERSUCHEN binden, nicht nur das AUFLISTEN (sechs Waechter, VOR der Umsetzung) | Plan + Helfer + Vorbild + 6 umzustellende Waechter vollstaendig, 397.301 Zeichen, Token rein 117.642, Token raus 28.862 (davon 25.689 Nachdenken) | 2 | 2 | 0 gefallen. Beide am Quelltext selbst nachgemessen: `scanneDateien()` legt nur `readFileSync` in try/catch, der Erkenner-Aufruf steht ungeschuetzt — zwei AST-Waechter behandeln Parsefehler heute als BENANNTEN Fehler (Zeilen 794/812 bzw. 586/597), ein naiver Umbau machte daraus einen Abbruch. Dazu: die zweite Schleife in `wartung_faelligkeit` (PLUSTAGE_AUSNAHME, Zeile 588/592) braucht eine eigene Gegenprobe | n. e. (nicht ablesbar) |
| 15.09.2026 | Gegenlesung untersuchen-binden: sechs Waechter binden das GELESENE (DIFF) | Diff 1080 Zeilen + Repo-Lesezugriff (Suchen 15, Lesungen 30, davon 8 Dateien ausserhalb des Diffs), Token rein 810.312, Token raus 6.113, Runden 9 | 5 | **5** | **0 gefallen — alle fuenf selbst nachgemessen und bestaetigt.** 1 Selbsttest (e) in `test_feature_viewport_zoom.js` mit `"existiert-nicht.js"` statt der Fixtur: **EXIT 0, 29 PASS / 0 FAIL** (die Zusicherung, die "nie geprueft" von "geprueft und sauber" trennen soll, ist selbst gruen aus einem nie-geprueft-Zustand). 2 `nichtEntscheidbar`-Zweig des neuen Inline-Adapters entfernt: **EXIT 0, 94 PASS / 0 FAIL**, identisch zum unmutierten Lauf. 3 `test/rohwert-scan.js` um `tools/` gekuerzt: beide verbliebenen Verbraucher **EXIT 0**, unveraenderte Zahlen (13 bzw. 46 PASS). 4 **blockierend**: Erkennerwurf fuer EINE Datei, dann `--senken`: **EXIT 0**, Budget von 40 auf 39 Dateien gesenkt, `core/admin-sidebar.js` geloescht — die neue FAIL-Zeile stand im Log und aenderte nichts. 5 `f = erkennerFehler.length ? [] : erkenner(...)`: P8 bleibt **EXIT 0, 95 PASS / 0 FAIL** (P8 belegt Weiterlesen, nicht Weitererkennen). Drei der fuenf (1, 4, 5) sind Regresse DESSELBEN Umbaus: das neue try/catch um den Erkenner hat lautes Scheitern in stilles Gruen verwandelt, und nur die direkten `erkennerFehler`-Zusicherungen wurden nachgezogen | 10,59 $ |
| 15.09.2026 | Gegenlesung untersuchen-binden, ZWEITE Runde ueber die BEHEBUNGEN (nicht ueber den Ursprungsdiff) | Diff 614 Zeilen + Repo-Lesezugriff (Suchen 16, Lesungen 21), Token rein 655.786, Token raus 3.812, Runden 8 | **0** | — | **Keine neuen Befunde — und das ist hier ein brauchbares Ergebnis, weil die Rechenschaft mitgeliefert wurde.** Anlass der Runde war die Hausregel, dass eine zweite Runde faellt, wenn eine Behebung VERHALTEN aendert statt nur eine Zusicherung zu ergaenzen; zwei der zehn Behebungen taten das (Abbruchpunkt vor dem Budget-Schreibweg, entfernter Funktionsparameter). Der Pruefer hat beide gezielt verfolgt und dabei ZWEI strukturelle Aussagen geliefert, die ich selbst nachgeprueft habe und die stimmen: genau ZWEI `schreibeBudget()`-Aufrufe (435, 473), der einzige `writeFileSync` auf die Budget-Datei liegt in dieser einen Funktion (96) — es gibt also keinen dritten Schreibweg, den der Abbruchpunkt verfehlen koennte; und genau 13 Aufrufstellen von `findeVerstoesse()`, von denen nur die beiden Bestandswege einen Dateipfad brauchen und beide aussen taggen (selbst nachgezaehlt: 13 echte Aufrufe, die uebrigen grep-Treffer sind Kommentare; alle fuenf `.datei`-Verbraucher lesen ausschliesslich `repoFunde`). Zusaetzlich hat er BEIDE neuen Sollzahlen unabhaengig nachgerechnet (99 und 44) und ist auf dieselben Werte gekommen. Er hat ausserdem die bewusste Nichtbehebung des rohwert-scan-Befunds ausdruecklich als vertretbar bezeichnet, ohne sie zu seinem Befund umzuwidmen | 8,48 $ |
| 15.09.2026 | **PLAN**-Pruefung: Ausmusterung eines Geraets mit offenem Mangel (VOR der Umsetzung) | Plan 144 Zeilen + Repo-Lesezugriff (Suchen 50, Lesungen 53 — mit Abstand der groesste Lesehunger bisher), Token rein 1.270.320, Token raus 10.218, Runden 17 | 9 (6 als blockierend eingestuft) | **5 bisher** | **Fuenf konkrete Zeilenbehauptungen selbst nachgeprueft, alle fuenf stimmen. Die uebrigen vier (zwei Wettlaeufe, ein Korrekturmasken-Befund, ein Hinweistext-Befund) sind NICHT von mir nachgemessen — ihre Behebung ist unabhaengig davon richtig, aber sie zaehlen hier nicht als getragen.** Der teuerste Fund war Befund 3: `core/retention.js` sucht Loeschkandidaten ueber `repariert_am` bzw. `freigegeben_am` (Zeilen 175/182), mein Plan liess BEIDE bewusst leer — er haette also genau die Halde erzeugt, die er verhindern sollte. Dieselbe Klasse wie am 12.09.2026: ein Vorschlag, der seinen eigenen Befund nicht schliesst. Zweitteuerster: mein Rueckfall ueber den Geraetenamen. Das Repo erlaubt gleichnamige Geraete ausdruecklich (`routes/admin/geraete-typen.js:353`, Kommentar "KEINE Kollisionspruefung") und zieht beim Umbenennen nur `geraete.name` nach — ein Schliessen ueber den Namen haette FREMDE Maengel schliessen koennen, unwiderruflich. Dazu berichtigt der Pruefer eine falsche Zeilenangabe in meinem eigenen Plan (`core/db.js:806` ist `wartung_geraete`, die gemeinte Defektspalte steht auf :1318) — selbst nachgesehen, er hat recht. Drittens: `core/pdf-engine.js` druckt `[Repariert]` fuer alles Nicht-Offene und `[Freigegeben]` fuer jede inaktive Sperre, `core/wiederholung.js:116` beendet die Ausfallzeit nur bei `status === "repariert"` — das PDF haette eine Reparatur behauptet, die nie stattfand | 16,65 $ |
| 15.09.2026 | Gegenlesung ui-feedback-binden: zwei Waechter binden das GELESENE (DIFF) | Diff 310 Zeilen + Repo-Lesezugriff (Suchen 19, Lesungen 13), Token rein 265.585, Token raus 6.313, Runden 8 | 2 (1 blockierend) | **1 bisher** | **Der blockierende Befund traegt, von mir selbst gemessen — und er ist der billigste Lauf dieser Tabelle (3,79 $) mit dem groessten Ertrag.** Der Bau hatte die Kandidatenliste korrekt gegen `git ls-files` gebunden, danach aber die LESEMENGE gegen `geleseneDateien` gehalten — also gegen den Bericht des Lesers ueber sich selbst. GEMESSEN, eine Zeile in `test/helfer/quelltext-scan.js` (`for (const rel of dateipfade)` um `.filter((q) => !q.startsWith("tools/"))` ergaenzt, drei Dateien werden nie gelesen, ohne Lese- oder Erkennerfehler): `test_feature_ui_feedback_aufrufer_static.js` **EXIT 0, 49 PASS / 0 FAIL**, alle neuen Zusicherungen gruen; `test_feature_ui_feedback_token_verfuegbar.js` EXIT 1, aber durch einen **TypeError** — also rot aus dem falschen Grund, keine Zusicherung. Das Vorbild aus #443 (`test_feature_viewport_zoom.js`, Block um `ERWARTUNG_ZIELDATEIEN`) macht beides ueber die ERWARTETEN Pfade; genau das fehlte. Damit ist es das FUENFTE Mal in Folge, dass diese Klasse eine Ebene tiefer weiterlebt, obwohl sie vorher geschlossen aussah. Der zweite Befund (das unabhaengige Praedikat entscheidet rein nach Dateinamen und zaehlt einen `.js`-Symlink mit, den `alleJsDateienOhneTests()` ueber `entry.isFile()` gar nicht aufnimmt) ist NICHT von mir gemessen — heute gibt es im Bestand keinen solchen Symlink, die Zusicherung ist also nur zufaellig gruen; er zaehlt hier deshalb nicht als getragen | 3,79 $ |
| 15.09.2026 | **PLAN**-Pruefung Ausmusterung, ZWEITE Fassung (die erste war an der Aufbewahrung gescheitert) | Plan 295 Zeilen + Repo-Lesezugriff (Suchen 32, Lesungen 34), Token rein 794.242, Token raus 7.634, Runden 13 | 8 (6 blockierend, 2 „sollte behoben werden") | **8** | **0** — **Alle acht selbst nachgemessen, alle acht tragen — der erste Lauf dieser Tabelle ohne einen einzigen gefallenen Befund.** Drei davon widerlegen ausdrueckliche Behauptungen MEINES Plans, nicht nur Luecken darin: (1) Mein A-2 wollte bei einer ausgemusterten Sperre nur das Kennzeichen tauschen. Die Statuszeile darunter haengt aber an `if (sp.freigegeben_am)` (`core/pdf-engine.js:1077`) — mit `freigegeben_am = NULL` faellt die Zeile durch alle Zweige bis in den letzten und druckt woertlich „Status: Mangel noch offen — Reparatur steht noch aus" (`core/nutzungsentscheidung.js:344`) unter der Ueberschrift `[Ausgemustert]`. Selbst nachgesehen: die Kette ist `freigegeben_am` → `istEchteSperreSp` (`:973`, `istAktiv && …`, bei Ausmusterung falsch) → `!stufeSp` → Rest. (2) Mein Abschnitt 4.1 nannte zwei Advisory-Locks als „die beiden Schluessel, unter denen `geraete_defekte` geschrieben wird". Falsch: der Mangel-Nachtrag oeffnet seine Transaktion bei `routes/sichtpruefung.js:4411` und die Seilkontroll-Mangelanlage bei `:4496` — beide OHNE jeden Advisory-Lock (selbst geprueft, kein Treffer auf `advisory` zwischen 4380 und 4560). Dazu traegt der Tagescheck-Lock ein OFFLINE-Datum von bis zu 24 h Rueckstand (`:2287-2293`), ein Lock auf „heute" greift also ohnehin daneben. (3) Mein zugegebener „bekannter Rest" („wird ueber denselben Weg noch einmal ausgemustert") war nicht unscharf, sondern unmoeglich: das Deaktivieren-UPDATE verlangt `COALESCE(aktiv,1) = 1` (`routes/admin/geraete-typen.js:486`), und der Knopf erscheint fuer inaktive Geraete gar nicht (`:324-326`) — genau die Sackgasse, die der ganze Auftrag beseitigen soll. Dazu zwei Fehler, die schon HEUTE falsch sind und ohne die Ausmusterung nie aufgefallen waeren: das Reparatur-UPDATE prueft `rowCount` nicht und schreibt danach unbedingt `reparatur_freigabe` ins manipulationssichere Audit-Log (`routes/sichtpruefung.js:3080-3101`, gleiche Klasse in `routes/module.js:1204-1217`); und `test_feature_korrektur_dokumente_static.js:51-53` schreibt die alte Aufbewahrungs-Konfiguration woertlich per Regex fest, faellt also mit der geplanten Behebung. Der Pruefer hat ausserdem eine Ungenauigkeit in MEINEM Auftrag berichtigt (`scanZusammenfassung()` gibt es nicht, der Weg heisst `letzterScan()`) — nachgesehen, er hat recht, und `routes/aufbewahrung.js:318` baut daraus eine Map nach Tabellenname, was meine Entscheidung „ein Eintrag je Tabelle" unabhaengig bestaetigt | 10,50 $ |
| 15.09.2026 | **PLAN**-Pruefung Ausmusterung, DRITTE Fassung (zweite Runde ueber denselben Auftrag) | Plan 378 Zeilen + Repo-Lesezugriff (Suchen 32, Lesungen **59** — neuer Hoechstwert), Token rein 1.270.482, Token raus 11.415, Runden 16 | 10 (7 blockierend, 3 „sollte behoben werden") | **10** | **0** — **Zum zweiten Mal in Folge tragen alle Befunde — ueber beide Runden zusammen 18 von 18.** Zwei davon haben den ZUSCHNITT geaendert, nicht nur den Inhalt: (1) Der Pruefer wies nach, dass meine eigene Gegenprobe aus §1.3 den Riegel, den sie bewachen sollte, GAR NICHT ERREICHT: `routes/sichtpruefung.js:3041` steigt bei `status === 'repariert'` schon vor dem UPDATE aus, `routes/module.js:1205` bei leerem SELECT — der Vorzustand, den ich vorgeschrieben hatte, erzwingt die Zusicherung ohnehin. Genau unsere teuerste Klasse, und sie stand in MEINER Pruefvorschrift. (2) `auditAppend()` nimmt einen STUDIOWEITEN Advisory-Lock (`core/integritaet.js:65`) — das kannte ich nicht. Beim Nachmessen kam ein Verklemmungs-Kreis heraus, der HEUTE schon im Bestand steht: der Seil-Tagescheck nimmt `studioId` (`:2725`, mit `t`) vor `nachtrag:` (`:2777`), der eigenstaendige Beurteilungs-Nachtrag `nachtrag:` (`:3140`) vor `studioId` (`:997`, mit `t`). Daraufhin habe ich einen ganzen geplanten Beitrag GESTRICHEN statt verfeinert (den gemeinsamen `mangel:`-Riegel) — er war fuer die Richtigkeit nicht noetig, und eine weitere globale Lock-Klasse auf eine ungeloeste Ordnung zu legen macht einen latenten Kreis wahrscheinlicher. Weitere getragene Befunde: der Tablet-Frühausstieg meldet ueber `d.ok` woertlich „Das reparierte Geraet darf wieder genutzt werden" (`routes/module.js:1104` → `:1294`) — heute schon falsch, mit der Ausmusterung eine Luege ueber ein verschrottetes Geraet; `loescheSeilFotos()` benutzt Pool-Abfragen und `unlinkSync()` und laesst sich nicht zurueckrollen; mein ID-Schnappschuss haette ein UPDATE auf DERSELBEN Zeile nicht bemerkt (`routes/module.js:2842-2856` haengt einen neuen Befund an eine bestehende Sperre); mein „Block 3" haette Maengel zum Abschluss angeboten, die einem ANDEREN Geraet sicher zugeordnet sind; der N=0-Ausgang erzeugt ein inaktives, NICHT ausgemustertes Geraet mit offenem Mangel, fuer das die Seil-Verwaltungsliste gar keine Zeile hat; und ZWEI weitere bestehende Deploy-Gates (`test_feature_admin_lifecycle.js:96`, `test_feature_geraete_loeschen.js:165`) sichern woertlich das alte Verbot zu | 16,74 $ |
| 15.09.2026 | Gegenlesung Beitrag 1 „Freigabe nur melden, wenn sie stattfand" (CODE, nicht Plan) | Diff 651 Zeilen + Repo-Lesezugriff (Suchen 52, Lesungen 48 — beides neuer Hoechstwert), Token rein 1.516.535, Token raus 12.612, Runden 17 | 11 (5 blockierend eingestuft) | **6** | **1** (Schwereeinstufung widerlegt) — **Der teuerste Fund ist eine REGRESSION, die der Beitrag selbst erzeugt haette — und ausgerechnet die Klasse, wegen der ich zwei Stunden vorher einen ganzen geplanten Beitrag gestrichen hatte.** Der Umbau zieht UPDATE und `auditAppend(..., t)` in EINE Transaktion; damit haelt der eigenstaendige Seil-Freigabeweg erst die Zeilensperren auf `geraete_sperren` und will DANACH den studioweiten Advisory-Lock, den `auditAppend` nimmt (`core/integritaet.js:65`). Der Seil-Tagescheck macht es genau umgekehrt: Audit bei `routes/module.js:2782`, UPDATEs derselben Zeilen bei `:2911`/`:2951`. Gegenlaeufig, also ein Kreis — und vorher gab es ihn NICHT, weil das UPDATE als blankes `db.run` im Autocommit lief und die Zeilensperre vor dem Audit schon wieder weg war. Selbst nachgemessen, beide Reihenfolgen am Quelltext. Weitere getragene Befunde: der Chromium-SKIP faellt in der CI nicht durch (`process.exit(fail ? 1 : 0)`, `skipped` zaehlt nicht mit) — das Repo hat dafuer ein etabliertes Muster in `test_feature_frist_herkunft.js:448-458`, das der neue Test nicht uebernimmt; der Browsertest steuert `?keineSperre=1` SELBST an und laesst damit genau die Produktionszeile `routes/module.js:1108` ungeprueft (dort testweise `?freigegeben=1` einsetzen und keine Zusicherung faellt); der Fototest belegt „nicht vor dem Audit", aber nicht „erst nach dem Commit" (eine Zeile `await loescheSeilFotos(...)` vor dem `return` zurueck in die Transaktion — der Rollback-Test bleibt gruen, weil seine Attrappe vorher wirft); der Loeschnachweis der Fotos ist ersatzlos verschwunden (weder `loescheSeilFotos` noch `core/foto-reaper.js` schreiben ein Audit, `server.js:1548` nur ein `console.log`) und die Zusicherung wurde auf die ABWESENHEIT des frueheren Nachweises umgedreht; und `routes/module.js:2911-2946` traegt dieselbe Klasse wie der Ausgangsbefund im Tagescheck (Audit unbedingt, `rowCount`-Pruefung erst danach und nur fuers Hinweisfenster). **GEFALLEN, und zwar die Schwereeinstufung:** „blockierend — der neue Test fasst beim Import echtes Dateisystem an" stuetzte sich darauf, dass `test/run.sh` weder `DEFECT_PHOTO_DIR` noch `LAGEPLAN_UPLOAD_DIR` umleite. Gemessen: `test/run.sh:463-477` leitet `LAGEPLAN_UPLOAD_DIR` sehr wohl in ein `mktemp -d` um, mindestens ZWANZIG bestehende Testdateien laden dieselben Routen ohne gesetztes `DEFECT_PHOTO_DIR`, und kein neuer Test SCHREIBT ausserhalb seines Wegwerfverzeichnisses. Der Beitrag verhaelt sich wie der Bestand — kein Befund gegen ihn. NICHT von mir nachgemessen und deshalb hier nicht als getragen gezaehlt: die verschluckten Foto-Loeschfehler, die acht Testabfragen ohne `studio_id`, sowie die beiden Bestandsfunde in `routes/belehrungen.js:1409` und `routes/lageplan.js:464` | 19,90 $ |
| 16.09.2026 | Beitrag 2a Ausmusterung: Datenmodell und Leser (CODE) | Diff 1497 Zeilen + Repo-Lesezugriff (Suchen 26, Lesungen 42), Token rein 1.178.221, Token raus 7.748, Runden 14 | 9 | **7** | **2** (beide Schwereeinstufung) — **Der erste Lauf, in dem BEIDE Spuren denselben schwersten Befund fanden — und er war der teuerste des Tages.** Astra (F2) und die Claude-Spur (Befund 1) sagten unabhaengig, dass `test_feature_ausmusterung_migration.js` den Schema-Umbau gar nicht prueft: `db.init()` legt die Tabelle auf einer frischen Datenbank BEREITS mit der neuen CHECK-Regel unter dem Sollnamen an, also nimmt der DO-Block der Migration seinen fruehen `RETURN`. SELBST GEMESSEN, und zwar eindeutig: den GANZEN `DO $$ … END $$;`-Block entfernt (6330 → 3232 Zeichen), frische Wegwerf-DB — `test_feature_ausmusterung_migration.js` **EXIT 0, 13 PASS / 0 FAIL**, `test_feature_geraete_typ_filter.js` **EXIT 0, 34 PASS / 0 FAIL**. Nur der Pruefsummenwaechter schlug an, und der belegt „die Datei wurde geaendert", nicht „der Umbau wirkt". Der Bestandsdatenbank-Pfad — der einzige, auf dem der Umbau je laeuft, und der beim Scheitern den Serverstart verhindert — war vollstaendig unbewacht. Drei weitere getragene Befunde sind Astra allein: (F1) die Fixtur des Offen-Zaehlers hat JE EINEN offenen, ausgemusterten und reparierten Mangel, `misch.offen === 1` faellt also auch dann nicht, wenn man `g.offen++` auf `status === "ausgemustert"` umhaengt — drei Bedeutungen auf derselben Zahl. (F3) Astra grenzt MEINE EIGENE Behebung ein: die vorgezogene Studio-B-Fixtur macht nur das MARKIEREN pruefbar; der Trockenlauf wird bloss ueber `anzahl >= 1` gehalten (eine Untergrenze) und der Loeschlauf gar nicht getrennt. (F4) Alle Retention-Fixturen haben `erstelltAm === ausgemustertAm`, der Test bestuende also auch mit einem Fristbeginn ab `erstellt_am` — er belegt „alt gegen jung", nicht „die Frist beginnt mit dem ABSCHLUSS". Die Claude-Spur allein trug fuenf weitere: ein achtzeiliger HTML-Kommentar steht INNERHALB des `.map()` und geht bis zu dreissigmal an den Browser; `core/defekt_mailer.js:137` und `routes/sichtpruefung.js:3459` geben einem ausgemusterten Vorbefund denselben leeren Zusatz wie einem reparierten (beide selbst nachgelesen, woertlich `f.status === 'offen' ? … : ''`); die Aufbewahrungs-Oberflaeche zeigt jetzt „Datumsfeld: COALESCE(repariert_am, ausgemustert_am)"; das Schema koppelt `status='ausgemustert'` an keinen Zeitstempel (der Migrationstest fuegt genau diesen Zustand selbst ein — Folge: `COALESCE` ist NULL und die Zeile wird NIEMALS geloescht, genau die Halde, die der Migrationskopf zu verhindern verspricht); und derselbe Satz steht woertlich an drei Orten. **GEFALLEN, beide in der Schwere:** (1) „der neue Reparaturformular-Test fasst beim `require` echtes Dateisystem an" — gezaehlt: **21 BESTEHENDE** Testdateien laden `routes/sichtpruefung.js` ebenso ohne `DEFECT_PHOTO_DIR`, und der ausgeloeste Vorgang ist ein idempotentes rekursives `mkdir`. Eigenschaft der Suite, kein Fehler dieses Beitrags — **exakt dieselbe Einstufung war schon im Lauf davor gefallen**, und zwar aus demselben Grund. (2) „Testabfragen ohne `studio_id`" — Astra raeumt selbst ein, dass die IDs aus eigenen INSERTs stammen und kein Fremdzugriff moeglich ist; die Regel zielt auf produktive Abfragen. NICHT als Befund gegen diesen Beitrag gewertet, aber festgehalten: F5 (ein Mangel, der VOR dem Zeitraum entstand und NACH ihm ausgemustert wurde, fehlt im Monatsnachweis dazwischen) besteht bei REPARIERTEN Maengeln schon heute — eigener Auftrag, weil er bestehende Nachweisdokumente veraendert | 15,31 $ |
| 16.09.2026 | Beitrag 2a Nacharbeit: drei neue CHECK-Constraints, Migrations-Pfad-Test, gemeinsames Textmodul (ZWEITE Runde ueber denselben Beitrag) | Diff 1207 Zeilen, Suchen 26, Lesungen 54, Token rein 927677, Token raus 12648, Runden 12 | 6 | **5** | **0** — **Die erste zweite Runde, die es wirklich gab — und sie hat die Klasse der ersten Runde eine Ebene tiefer wiedergefunden.** Runde 1 hatte gezeigt, dass der Migrationstest den Status-Umbau nicht prueft (db.init() stellt sein Ergebnis schon her, der DO-Block nimmt den fruehen RETURN). Die Behebung baute die Vor-0057-Fassung literal nach — richtig. Astra fand, dass der neue Abschnitt die DREI NEU HINZUGEKOMMENEN Kopplungs-CHECKs weiterhin nicht bewacht: die Negativproben laufen weiter oben auf dem init()-Schema, dort stammen die Regeln aus core/db.js. SELBST GEMESSEN: alle drei CHECK-Ausdruecke NUR in der Migration durch `CHECK (TRUE)` ersetzt, core/db.js unveraendert, frische Wegwerf-DB — **EXIT 0, 30 PASS / 0 FAIL**. Drei neue Integritaetsregeln koennen auf dem Bestandsdatenbank-Pfad wirkungslos werden, ohne dass etwas anschlaegt. Der zweite tragende Befund ist SQL-NULL-Semantik: `geraete_sperren.aktiv` ist nullable, und `CHECK (ausgemustert_am IS NULL OR (aktiv = 0 AND freigegeben_am IS NULL))` ergibt bei `aktiv=NULL` NULL statt FALSE — PostgreSQL nimmt die Zeile an. SELBST GEMESSEN am echten Server, mit Positivkontrolle: `aktiv=NULL` + ausgemustert_am **ANGENOMMEN**, `aktiv=1` + ausgemustert_am **abgelehnt 23514**. Die Verletzersuche der Migration ist NULL-blind aus demselben Grund. Folge: core/retention.js verlangt `aktiv = 0`, eine so angelegte Zeile faellt aus der Aufbewahrung — genau die Halde, die der Migrationskopf zu verhindern verspricht. Dieselbe Klasse ein drittes Mal bei der leeren Zeichenkette: `ausgemustert_am = ''` erfuellt `IS NOT NULL`, wird **ANGENOMMEN**, und retention schliesst den leeren Wert ausdruecklich aus. Dazu drei weitere getragene Befunde: das Markier-Protokoll wird aus ALLEN SELECT-Zeilen gefuellt statt aus den tatsaechlich getroffenen (deshalb war der Einzel-Mutant am Markier-SELECT unsichtbar, und die B-ID landet im Protokoll fuer Studio A, das dem Admin ausgeliefert wird); die Statistik-Zusicherung sucht global im HTML und kann ihr Ergebnis seit der zweiten Fixtur vom REPARIERTEN Geraet beziehen; und die ausfuehrliche Verletzerdiagnose der Migration wird nie erreicht, weil init() die Constraints vorher anlegt und bei einem Verletzer schon dort mit der nackten PostgreSQL-Meldung scheitert. Astra hat ausserdem BEIDE Leitfragen des Auftrags sauber beantwortet — kein heutiger Schreibweg bricht an den neuen Regeln (Tabelle ueber 16 nachgelesene Wege), und der geplante Weg von Teil 2b ist nicht verbaut — und dabei ausdruecklich gesagt, dass es NICHT gemessen, sondern gelesen hat. | 12,54 $ |
| 16.09.2026 | **PLAN**-Pruefung Beitrag 2b-1: Ausmusterung ausloesbar machen (VOR der Umsetzung) | Diff 242 Zeilen, Suchen 38, Lesungen 51, Token rein 1109756, Token raus 13249, Runden 15 | 10 (4 blockierend) | **6** | **0** — **Der Lauf, der einen unwiderruflich falsch geschlossenen Mangel verhindert hat — und zwei der vier blockierenden Befunde standen in MEINEM Auftrag.** (1) Ich hatte Block 2 der Bestaetigungsseite VORAUSGEWAEHLT — die Maengel, die nur ueber den NAMEN zugeordnet sind. SELBST GEMESSEN: es gibt keinen UNIQUE-Schutz auf `geraete` fuer (studio_id, typ, name), gleichnamige Cardio-/Kraftgeraete sind ausdruecklich erlaubt (`routes/admin/geraete-typen.js:46-52`), und der Tagescheck schreibt KEINE `geraet_id` (`routes/sichtpruefung.js:2531-2537`). Zwei Geraete "Laufband" mit je einem Tagescheck-Mangel liefern damit zwei Zeilen mit `geraet_id IS NULL` und gleichem Namen — beide in Block 2, beide angekreuzt, ein Klick schliesst beide. Ohne Manipulation, ohne Wettlauf, im Normalbetrieb: genau der Fehler, den der ganze Entwurf verhindern soll. (2) Mein N=0-Weg setzte den Ausmusterungsstempel bei JEDER Deaktivierung und sperrte gleichzeitig jede Reaktivierung — die gewoehnliche Deaktivierung waere damit unwiderruflich geworden. SELBST GEMESSEN: `test_feature_geraeteseite_typen.js:289-306` bewacht ausdruecklich Deaktivieren -> Reaktivieren -> `aktiv=1`. Die Betreiber-Entscheidung "ausgemustert ist ausgemustert" galt dem Ausmustern, nicht dem Deaktivieren. (3) Meine Vorgabe "nimm den Studio-Lock ZUERST" haette einen Verklemmungs-Kreis mit dem Reparaturweg erzeugt. SELBST GEMESSEN: `routes/sichtpruefung.js:3083` sperrt per UPDATE zuerst die Defektzeile, `:3100` ruft erst danach `auditAppend()`. Dieselbe Klasse, die zwei Tage vorher schon einen ganzen Beitrag gekostet hat — nur mit umgekehrtem Vorzeichen. (4) Mein Token war nur ans Studio gebunden; der Fingerabdruck geht ueber alle offenen Zeilen des Bereichs und ist fuer zwei Geraete desselben Studios identisch — ein Token fuer Geraet A liess sich an einen POST fuer Geraet B haengen. Folgt zwingend aus dem Wortlaut meines eigenen Auftrags. Dazu zwei weitere getragene: der Fingerabdruck liess entscheidungsrelevante Aenderungen durch (Umbenennen, Standort/Seriennummer, eine reine Verschaerfung der Nutzungsentscheidung aendern keines der gehashten Felder); und `rowCount` belegt keinen Uebergang, weil PostgreSQL auch ein UPDATE als Treffer zaehlt, das dieselben Werte erneut setzt — das Audit haette eine zweite Ausmusterung beurkundet, die nie stattfand. **VON MIR NOCH NICHT NACHGEMESSEN und deshalb hier NICHT als getragen gezaehlt** (an den Ausfuehrenden zur Pruefung weitergegeben): die vier zusaetzlich genannten Deploy-Waechter, der Wettlauf mit dem Seil-Mangel-Nachtrag, die Unvollstaendigkeit im Korrekturweg. **Was dieser Lauf ueber das Verfahren sagt:** der Plan lag bereits ZWEIMAL gegengelesen vor (18 Befunde, alle getragen) — und trotzdem steckte der teuerste Fehler im AUFTRAG, den ich daraus geschrieben habe. Ein geprueft er Plan ist kein geprueftes Arbeitspapier | 14,87 $ |
| 16.09.2026 | **PLAN**-Pruefung 2b-1 Fassung 2 (ZWEITE Runde ueber dasselbe Arbeitspapier) | Diff 335 Zeilen, Suchen 26, Lesungen 54, Token rein 986305, Token raus 13763, Runden 14 | 10 (5 blockierend) | **6** | **0** — **Fast jeder blockierende Befund stammte aus dem EINEN Abschnitt, den ich zwischen den Pruefungen selbst hinzugefuegt hatte — deshalb habe ich ihn GESTRICHEN statt verfeinert.** Abschnitt 6 ("jeder Erzeuger eines Mangels prueft vorher das Geraet") war in Fassung 2 neu; F3, F4 und F8 zielen ausschliesslich auf ihn, F5 auf seine naheliegende Absicherung. SELBST GEMESSEN, die fuenf tragenden Originalbelege: (F2) `core/db.js:457-460` — `db.tx()` macht `BEGIN`, Callback, `COMMIT`, `return`; nur ein GEWORFENER Fehler rollt zurueck. Mein `return { fehler: … }` haette bereits geschlossene Maengel FESTGESCHRIEBEN, wenn das Geraete-UPDATE null Zeilen trifft — unwiderrufliche Abschluesse ohne den Uebergang, zu dem sie gehoeren. (F5) Meine Vorgabe lautete "nimm die Reihenfolge, die zu den vorhandenen PASST" — es gibt keine. `routes/sichtpruefung.js:3083` sperrt per UPDATE zuerst die Defektzeile und ruft erst bei `:3100` `auditAppend()`; die eigenstaendige Seil-Freigabe nimmt bei `routes/module.js:1301` den Studio-Lock und erst bei `:1303` die Zeile. Eine Anweisung, die sich auf eine einheitliche Ordnung beruft, die es nicht gibt, ist keine Anweisung. (F3) `routes/wartung.js:1305` schreibt eine `wartung_geraete.id` in `geraete_sperren.geraet_id`, Bruecke `core/db.js:808-815` — ein anderer ID-Raum; mein Abschnitt 6 haette dort auf die falsche Tabelle geprueft. (F7) `routes/module.js:1349-1352` schliesst ALLE aktiven Sperren eines Geraets in EINEM UPDATE, mit dem Kommentar, dass eine Einzelfreigabe die aeltere aktiv liess. Genau diese Erfahrung stand gegen meine frei abwaehlbare Auswahl: zwei sicher zugeordnete Seil-Maengel, einer abgewaehlt, Geraet ausgemustert — und ein eigener Mangel bleibt aktiv an einem Geraet, das `core/seilgeraete.js:43` nicht mehr laedt. Dazu der leere Fall: null Maengel geschlossen und trotzdem der unwiderrufliche Stempel. (F10) Mein Abschnitt 0 war Cardio/Kraft-foermig geschrieben und galt auch fuer die Seilkontrolle — `routes/admin/geraete.js:384-386` kennt dort nur `geraet_geloescht`, und `test_feature_geraete_loeschen.js:309-315` verlangt fuer den frueheren Reaktivierungsweg ausdruecklich 404. F4 folgt aus derselben Messung wie F2: `db.tx()` beginnt mit einem blanken `BEGIN`, ein gewoehnlicher SELECT des Erzeugers serialisiert dagegen nicht. **VON MIR NICHT NACHGEMESSEN und deshalb NICHT als getragen gezaehlt:** F1 (die Gegenproben in Abschnitt 9 koennen ohne den gemeinten Schutz gruen bleiben), F6 (der Fingerabdruck ist nach seinem Vergleich wieder ungeschuetzt), F8, F9. **F6 habe ich trotzdem UMGESETZT** — Fassung 3 sperrt die Kandidatenzeilen `FOR UPDATE` vor dem massgeblichen Lesen — also eine Aenderung auf eine Behauptung hin, die ich nicht selbst gemessen habe; das steht hier, statt es zu verschweigen. **Was dieser Lauf ueber das Verfahren sagt:** der Plan war zweimal gegengelesen, das Arbeitspapier einmal — und was ich DANACH hinzufuegte, war der ungepruefteste und schlechteste Teil. Eine Ergaenzung nach der Pruefung ist eine ungeprueste Ergaenzung. Eine DRITTE Planpruefung habe ich bewusst NICHT gefahren: das Muster war benannt und die Behebung eine Streichung, keine Verfeinerung | 13,36 $ |
| 16.09.2026 | Gegenlesung Beitrag 2b-1: Ausmusterung ausloesbar machen (DIFF, NACH zwei Planpruefungen) | Diff 1615 Zeilen + Repo-Lesezugriff (Suchen 23, Lesungen 44), Token rein 1.042.743, Token raus 6.642, Runden 12 | 6 (1 blockierend) | **3** | **1** — **0 gefallen von den dreien, die ich nachgemessen habe — aber der wichtigste Satz dieses Laufs steht nicht in den Befunden, sondern im Vergleich der Spuren.** Am 13.09.2026 hatte ich hier eingetragen, zwei Spuren ueber EINEN Diff haetten **NULL Ueberschneidung**, und daraus abgeleitet, Claude messe Mutationen und Astra denke Kontrollfluss — „zwei Suchverfahren, nicht zwei Meinungen". **Heute, bei derselben Asymmetrie (Claude durfte ausfuehren, Astra nur lesen), ueberschneiden sich DREI von sechs Astra-Befunden mit der Claude-Spur**: die Verklemmung, die doppelt messende Zusicherung und die weggeworfenen Kandidatenmerkmale. Die Verallgemeinerung vom 13.09. traegt damit NICHT als Regel; sie beschrieb einen Lauf. Was bleibt, ist die schwaechere und weiterhin belegte Aussage: beide Spuren hatten JE etwas, das die andere nicht hatte. **SELBST GEMESSEN und getragen:** (F4) Zwei gleichzeitige Ausmusterungen VERSCHIEDENER Geraete im selben Studio verklemmen. `ladeKandidaten()` sperrt in drei getrennten Abfragen, und Block 2/3 teilen dieselbe Menge unzugeordneter Maengel je nach GERAETENAME anders auf — zwei Vorgaenge nehmen dieselben Zeilen also in umgekehrter Reihenfolge. An echten Postgres-Sitzungen gemessen, Wegwerf-DB: `T1 Block3: 40P01 deadlock detected`, `T2 Block3: durch`. Gegenrichtung ebenfalls gemessen — EINE gemeinsame, gerätenamen-UNABHAENGIGE Sperrabfrage: beide kommen durch, einer wartet. Kein Angriff, kein Nachtrag, kein Erzeuger noetig; genau die Lock-Kante, die mein eigener Auftrag verboten hatte. (F2) Die Replay-Zusicherung des Tokens ist gruen aus dem FALSCHEN GRUND: beim zweiten Absenden ist das Geraet schon ausgemustert, also antwortet bereits der Endzustand-Riegel mit 409 — dieselbe Zahl, anderer Grund. Gemessen: `eintrag.verbraucht = true` durch `false` ersetzt -> **EXIT 0, 63 PASS / 0 FAIL**. (F5) `vereinheitlicheKandidat()` wirft `geraet_name`, `standort` und `seriennummer` weg, obwohl `ladeKandidaten` sie laedt, und zeigt `nutzung_entscheidung` nie an — der Admin kreuzt unwiderruflich an, ohne die Angabe zu sehen, an der die Zuordnung haengt; die Ueberschrift sagt „abweichender Name" und nennt den Namen nicht. Selbst am Quelltext nachgelesen. **GEFALLEN:** (F1) „Testabfragen ohne studio_id" — Astra raeumt selbst ein, dass die IDs aus eigenen INSERTs stammen; die Regel zielt auf produktive Abfragen. **Exakt dieselbe Einstufung ist schon am 16.09. gefallen, aus demselben Grund** — das ist jetzt zweimal, und beim naechsten Mal gehoert der Vorbehalt in den Pruefbrief statt in die Nachmessung. **VON MIR NICHT NACHGEMESSEN und deshalb NICHT gezaehlt:** F3 (die Zusicherung „genau EIN Geraete-UPDATE" baut dieselbe Abfrage zweimal auf) und F6 (die Seilkontrolle verspreche eine nicht vorhandene Reaktivierung) — beide an den Ausfuehrenden zur Pruefung weitergegeben. **Was die EIGENEN Messungen daneben fanden, die KEINE Spur hatte:** die drei neuen `auditAppend()`-Aufrufe liegen ausserhalb des Scanbereichs von `test_feature_audit_kapselung_geraete_static.js` (dessen `DATEI`-Konstante nennt nur `routes/admin/geraete.js`) — ein angehaengtes `.catch(() => {})` ueberlebt die VOLLE Suite mit **SUITE_EXIT=0, 0 FAIL**, waehrend dieselbe Mutation in der bewachten Datei **EXIT 1, 2 FAIL** liefert. Die unwiderrufliche Ausmusterung koennte damit committen, ohne dass ihr Eintrag in der gehashten Kette entsteht | 13,53 $ |
| 16.09.2026 | Gegenlesung 2b-1 NACHARBEIT (ZWEITE Runde, Behebungen aendern Verhalten) | Diff 1516 Zeilen + Repo-Lesezugriff (Suchen 16, Lesungen 31), Token rein 786.477, Token raus 9.249, Runden 9 | 7 (3 blockierend) | **4** | **1** — **Die erste ZWEITE Runde seit der Rundenregel, und sie war faellig: die Behebungen aenderten VERHALTEN, und genau dort entstanden die neuen Befunde.** Urteil „noch nicht freigeben". **SELBST GEMESSEN und getragen:** (F1) Die Behebung eines ECHTEN Fehlalarms im Audit-Kapselungswaechter hat eine Falsch-Negativ-Klasse eingefuehrt. Der neue Vorfilter leitet die Existenz eines umschliessenden catch aus den unmittelbar vorhergehenden Token ab; steht vor dem Aufruf noch irgendeine Anweisung, wird der SCHLUCKENDE catch gar nicht mehr geprueft. Gemessen: `void 0;` hinter `try {` im schluckenden A5-Schnipsel, sonst nichts — **EXIT 1, 53 PASS / 1 FAIL**, woertlich „Mutation bleibt UNERKANNT — pruefeAufruf() meldet ok:true". Dass der Selbsttest das ueberhaupt sichtbar macht, ist gut; was er sichtbar macht, ist es nicht. (F6) Der neue Geistersperren-Riegel hat einen UNGESICHERTEN Eintrittspunkt — am Kontrollfluss bestaetigt: er steht in `if (finalSelection.length === 0)` ab Zeile 405, der Ausmusterungszweig beginnt bei 472. Hat das Geraet eine EIGENE aktive Sperre neben der Geistersperre, laufen GET- und POST-Riegel beide ins Leere und das Geraet wird ENDGUELTIG ausgemustert, waehrend die namensgleiche Sperre verwaist zurueckbleibt. **Ein zusaetzlicher offener Mangel macht damit eine zuvor verweigerte Deaktivierung wieder moeglich — als unwiderrufliche Handlung.** Schlimmer als der Befund, den die Behebung schliessen sollte. (F2) Keine einzige Gegenprobe erreicht den POST-Riegel: der zugehoerige Testabschnitt faehrt nur GETs und gibt die Sperre per direktem UPDATE frei. Unsere Klasse „eine Gegenprobe, die den geprueften Code gar nicht erreicht, ist keine". (F7) Der neue Hinweistext raet, „in der Seilkontrolle freizugeben" — `schliesseSeilSperren` (`routes/module.js:1306`) gleicht aber ueber `geraet_id` ab, und die blockierende Sperre traegt eine FREMDE. Denselben Befund hatte ich beim Diff-Lesen unabhaengig; er ist aus der bestehenden Loeschweg-Meldung geerbt, kein Rueckschritt. **EINGEORDNET STATT UEBERNOMMEN:** (F4) Astra meldet einen Verklemmungskreis mit dem Nutzungsnachtrag, der KEINE umgekehrte ID-Reihenfolge braucht — der Ablauf traegt. **Meine Nachmessung aendert aber die Schwere:** der BESTEHENDE Reparaturweg nimmt dieselbe Ordnung (`routes/sichtpruefung.js:3084` UPDATE, dann `:3100` auditAppend), die Klasse ist also NICHT neu. Der Beitrag verbreitert sie — von einer Defektzeile auf den ganzen unzugeordneten Pool des Studios. Als „blockierend, neu eingefuehrt" waere es falsch gewesen; als Verbreiterung ist es richtig und behebenswert. **GEFALLEN:** (F5) „Testabfragen ohne studio_id" — **zum DRITTEN Mal derselbe Befund, zum dritten Mal gefallen.** Nach dem zweiten Mal steht in genau dieser Datei, der Vorbehalt gehoere in den PRUEFBRIEF statt in die Nachmessung. Ich habe es wieder nicht getan; das ist mein Fehler, nicht der des Pruefers, und es hat zum dritten Mal Nachmesszeit gekostet. In Runde 3 steht er jetzt im Brief. (F3) bleibt eine Anmerkung: die `xmin`-Zusicherung misst weniger, als ihr Name verspricht — der Inhalt ist brauchbar, die Beschriftung nicht | 10,52 $ |
| 16.09.2026 | Gegenlesung 2b-1 Runde 3 (DRITTE Runde, enger Diff: Pool-Sperre verengt, Riegel am vierten Eintrittspunkt) | Diff 630 Zeilen + Repo-Lesezugriff (Suchen 19, Lesungen 33), Token rein 726.430, Token raus 7.267, Runden 9 | 3 (0 blockierend eingestuft) | **3** | **0** — **Der bisher billigste Lauf (9,63 $) und der erste, in dem ich die Rundenzahl NICHT als Grund genommen habe.** Gefahren, weil EINE Behebung (die Pool-Sperre verengt, Nachsperrung eingezogen) Verhalten aendert und von niemandem gegengelesen war — nicht, weil eine Regel eine dritte Runde vorsaehe. Der Diff war eng (630 Zeilen), der Preis entsprechend. **SELBST GEMESSEN, beide an der echten Datei, beide getragen:** (F2) Die neue Blockanalyse des Audit-Waechters haelt beim INNEREN `try` an. Ein `try { await auditAppend(...) } finally { void 0; }` passiert sie lautlos — **EXIT 0, 58 PASS / 0 FAIL** —, waehrend der Fehler durch das `finally` in den schluckenden aeusseren catch der Route laeuft und die Transaktion OHNE Audit-Eintrag committet. **Das ist ein RUECKSCHRITT gegenueber der Fassung vor Runde 3:** die alte Vorwaertssuche lehnte ein unmittelbar folgendes `finally` ausdruecklich ab. Die stille Richtung, deshalb der schwerste Befund des Laufs. (F3) Eine gewoehnliche Funktion wird nicht als Grenze erkannt — vor ihrem Rumpf steht `)`, nicht `function`. Gemessen: `db.tx(async (t) => {` durch `db.tx(async function (t) {` ersetzt, sonst nichts — **EXIT 1, 54 PASS / 4 FAIL**, die Aussensuche entkommt ueber die Funktionsgrenze in den aeusseren catch. Das ist die LAUTE Richtung (Fehlalarm), weniger gefaehrlich, aber ein Waechter, der bei gewoehnlicher Funktionssyntax grundlos anschlaegt, wird abgeschaltet statt gelesen. (F1) Die Nachsperrabfrage prueft die Geraetezuordnung nicht mit; eine zwischen den beiden Lesungen umgehaengte Zeile wuerde unwiderruflich mitgeschlossen. **Astra grenzt den Befund SELBST ein** — es habe keinen produktiven Umzuordnungsweg gefunden — und meine Nachmessung bestaetigt das: sieben `UPDATE geraete_defekte` im Bestand, KEINES setzt `geraet_id` (Positivkontrolle: dieselbe Suche findet die sieben sehr wohl). Eine Luecke der zugesicherten Nachvalidierung, kein ueber die Oberflaeche erreichbarer Fehler — und der Kommentar an der Stelle behauptet mehr, als er haelt. **Was dieser Lauf ueber den Pruefer sagt:** er hat von sich aus SECHS B1-Faelle durchgegangen und vier davon ausdruecklich als NICHT betroffen abgegrenzt (Namensaenderung, verschwundene Zeile, nebenlaeufig geschlossene Zeile, neu hinzugekommene Zeile — letztere mit der Begruendung, auch das frueher vorhandene `FOR UPDATE` habe noch nicht existierende Zeilen nicht gesperrt, es sei also keine neue Klasse). Und er hat die von mir im Brief ausgeschlossene Nicht-Befund-Klasse diesmal NICHT gemeldet — nachdem sie in drei Laeufen dreimal gefallen war. **Der Vorbehalt im Brief hat gewirkt; das war der Eintrag aus dem Lauf davor** | 9,63 $ |
| 16.09.2026 | PLAN Rechtsstand-Kette Stufe 1 (Normtext-Fingerabdruck je Fundstelle) | Plan 176 Zeilen + Repo-Lesezugriff (Suchen 12, Lesungen 14), Token rein 233.041, Token raus 9.685, Runden 6 | 6 (4 blockierend) | **6** | **0** — **Der billigste Lauf bisher (3,64 $) und der mit der hoechsten Trefferquote: alle sechs Befunde haben meiner eigenen Nachmessung standgehalten.** Und es war ein PLAN, kein Diff — genau die Stelle, an der diese Datei seit dem 12.09. den groessten Hebel behauptet. **SELBST GEMESSEN und getragen:** (B3, der teuerste) `klassifiziere()` in `ops/gymdocu-rechtsstand-watch.js:411-417` endet mit `default: return 'still'` — alle drei neu geplanten Lagen waeren lautlos zu KEIN Telegram-Alarm und KEIN Exit-Code 1 geworden. Der Waechter haette eine geaenderte Rechtsnorm erkannt und geschwiegen. Dazu zwei eigene Messungen: `klassifiziere` kommt in `test_feature_rechtsstand.js` GENAU EINMAL vor, naemlich in der Importzeile 43 — die Funktion ist heute voellig unbewacht; und der Cron startet eine von Hand installierte Kopie unter `/usr/local/bin/` (`ops/cron.d-gymdocu-rechtsstand:20-28` warnt selbst davor, mit Praezedenzfall), neues Core plus alte Ops-Kopie ergaebe eine Mischversion. (B4) Die Cache-Falle: `bewerteAlleQuellen()` (`:294-315`) haelt EIN Abrufergebnis JE GESETZ, das sich alle Paragrafen teilen — ein `normtext_sha256` darin haette alle sieben BGB-Fundstellen gegen den Hash des ZUERST angefragten Paragrafen verglichen, ein stilles falsches Gruen. Buchstabenzusaetze gibt es im Bestand schon (`core/rechtsstand.js:509`, `arbst_ttv_2004/__3a.html`). (B2) Fehlende Hashes haben keinen Vertrag: `:925-930` laesst einen vorhandenen Eintrag genuegen, `undefined === undefined` waere „Normtext gleich". **Selbst nachgezaehlt und im Plan gar nicht benannt: 61 der 72 Quellen sind `gii-xml`, verteilt auf 18 Gesetze** — so viele Hashes muessen erstmals von Hand bestaetigt werden. (B5) Vier UVSV-Eintraege (`:660-675`) tragen als `stand` gar keine Standangabe, sondern den Satz „kein `<standangabe>`-Element im XML-Metadatenblock" — die geplanten vier Lagen setzen zwei gueltige Vergleichspaare voraus, die es im Bestand nicht ueberall gibt. (B1) Praefix und Laenge sind kein Sollwert fuer einen TEXT, und die 512 stammte aus meiner eigenen Extraktionsmessung — von Hand abgeschrieben ist nicht unabhaengig gewonnen. (B6) Mein eigener Plan versprach „die Zwischenaenderungen erledigen sich von selbst" und widersprach damit seinem eigenen Restrisiko-Abschnitt; es ist ein Endpunkt-Wortlautvergleich, keine Kettenpruefung. **NICHT UEBERNOMMEN, und zwar gemessen statt abgelehnt:** die geforderte Behandlung mehrerer XML-Dateien im Archiv — die nimmt der Pruefer im selben Bericht selbst zurueck (`core/rechtsstand.js:241-244` wirft bei `length !== 1`, geprueft in `test_feature_rechtsstand.js:485-492`); und die „sichere Parserkonfiguration ohne externe Entitaeten" zielt auf einen XML-Parser, waehrend wir mit regulaeren Ausdruecken schneiden. **MEIN Fehler, nicht seiner:** er fand weder `plaene/STAND.md` noch den Plan im Repo — beide liegen im Belehrungssystem-Repo, waehrend ich `--wurzel=/home/user/gymdocu` gesetzt hatte. Wer einen Plan aus Repo A gegen Code in Repo B pruefen laesst, nennt das im Brief | 3,64 $ |
| 16.09.2026 | CODE qr-zuordnung Sperrreihenfolge (Verklemmung aus Karte #233) | Diff 484 Zeilen + Repo-Lesezugriff (Suchen 25, Lesungen 31), Token rein 607.824, Token raus 9.791, Runden 9 | 5 (1 blockierend eingestuft) | **mind. 1 (B5)** | **nicht mehr einzeln rekonstruierbar** — NACHGETRAGEN 16.09.2026 abends, nachdem der Review-Bot am Doku-PR die offenen Felder gemeldet hat. Belegt ist B5: er wurde am Quelltext bestaetigt und der ausgelieferte Beitrag (`a7ea96a`) ist auf ihm gebaut. Fuer die uebrigen vier ist das Einzelurteil getragen/gefallen NIE festgehalten worden und nach der Kontextverdichtung nicht mehr zu belegen. Es wird deshalb NICHT geschaetzt: eine erfundene Zahl waere schlimmer als eine fehlende, weil diese Datei genau dagegen existiert. **Schon am Quelltext bestaetigt (B5, der schwerste):** Sperr-SELECT und UPDATE sind zwei Anweisungen mit zwei Snapshots, eine dazwischen eingefuegte Zeile ist NICHT mitgesperrt und wird vom UPDATE nachtraeglich angefordert — damit bleibt ein zweiter Verklemmungskreis. **Die tragende Annahme selbst nachgelesen und sie traegt:** `core/qr-token.js:464-479` vergibt Nummern bewusst JE BLOCK statt global fortlaufend, im Quelltext begruendet mit „sonst ist ein niedrig nummerierter Block, der NACH einem hoeheren zugestellt wurde, fuer immer unerreichbar" — eine neue Nummer kann also UNTERHALB vorhandener entstehen. **Und der Behebungsvorschlag des Pruefers hat eine Folge, die er nicht nennt:** das UPDATE auf die gesperrten Nummern einzuschraenken schickt eine spaet eingefuegte Zeile in den `throw`-Zweig bei `core/qr-zuordnung.js:611` („gebrochenes Invariant") — aus einem harmlosen Wettlauf wuerde ein 500er. Der Ausweg ist EINE Anweisung (`UPDATE … WHERE nummer IN (SELECT … ORDER BY nummer FOR UPDATE)`): ein Snapshot, kanonische Ordnung, kein neuer Fehlerpfad | 8,33 $ |
| 16.09.2026 | CODE qr-zuordnung Sperrreihenfolge, ZWEITE Runde (Behebung hatte Verhalten geaendert) | Diff 923 Zeilen + Repo-Lesezugriff (Suchen 22, Lesungen 25), Token rein 483.452, Token raus 18.400, Runden 8 | 8 (2 blockierend) | **mind. 2 (B1, B7)** | **nicht mehr einzeln rekonstruierbar** — NACHGETRAGEN 16.09.2026 abends, s. Zeile darueber. Belegt sind die beiden blockierenden: B1 am Quelltext bestaetigt, B7 durch eigene Messung (die reine Mutation HAENGT, EXIT 124 — der Ausfuehrende hatte 308 PASS / 1 FAIL gemeldet und auf Nachfrage offengelegt, dass er in KOMBINATION mutiert hatte). Aus B7 ist der Laufzeitwaechter je Testdatei entstanden. Die sechs weiteren sind in Runde 3 und 4 allesamt behandelt worden, ein Einzelurteil wurde je Befund aber nicht protokolliert. — **Die zweite Runde war faellig und hat sich gelohnt: sie trifft genau die Stelle, an der ich selbst zufrieden war.** **B1, am Quelltext BESTAETIGT (reines Lesen genuegt):** die NACHHER-Kernprobe beweist den gemeinsamen Snapshot NICHT. Sie laesst `c` von einem dritten Studio VOLLSTAENDIG beanspruchen, bevor `b` freigegeben wird — damit haette auch die alte Zwei-Anweisungs-Fassung `c` uebersprungen, naemlich wegen ihres eigenen `AND studio_id IS NULL`, nicht wegen eines gemeinsamen Snapshots. Die Probe unterscheidet „unsichtbar" nicht von „sichtbar, aber schon vergeben"; ihre Vorbedingung entfernt genau den Unterschied, den sie zeigen soll. **B7, blockierend, NOCH ZU MESSEN und im Widerspruch zu einer Executer-Messung:** die angekuendigte Mutation (`await` vor dem ersten Aufruf in (e1)) soll laut Ausfuehrendem 308 PASS / 1 FAIL ergeben; nach Aktenlage HAENGT sie stattdessen — der Halter wartet auf ein Gate, das erst nach der Beobachtungsschleife geoeffnet wird, und `test/run.sh` startet Testdateien ohne Laufzeitgrenze. Ein Test, der haengen kann, gehoert nicht in ein Deploy-Gate. **Sechs weitere:** leere Probenschleifen gelten als bestanden (`every()` auf leerer Liste); `P1b` akzeptiert BELIEBIGE Fehler als Nachweis; G2 haengt weiter an 200 ms statt an einer Barriere; `(e1)` zaehlt zwei BELIEBIGE blockierte Verbindungen der Datenbank statt der beiden geprueften; unbehandelte Promise-Ablehnungen; nur EIN Ordnungsschnitt statt der vollen Reihenfolge. **Was daraus fuer die Arbeitsweise folgt, ist wichtiger als die Einzelbefunde:** die PRODUKTIONSaenderung ist klein und nach beiden Runden unbeanstandet (kein Mandantentrennungsbefund), das TESTGERUEST ist in zwei Runden auf ~700 Zeilen gewachsen und bindet immer noch nicht. Runde 3 baut deshalb WENIGER Geruest, nicht mehr — und jede Wartestelle bekommt eine harte Zeitgrenze | 7,42 $ |
| 16.09.2026 | CODE qr-zuordnung, DRITTE Runde (nur die Beweise; Produktionscode unveraendert) | Diff 369 Zeilen + Repo-Lesezugriff (Suchen/Lesungen nicht protokolliert), Token rein 314.694, Token raus 12.338, Runden 6 | 3 (1 blockierend) | **3** | **0** — **Der billigste Lauf dieses Beitrags (4,86 $) und der erste mit einer ENTLASTENDEN Kernaussage:** „keine generell unerreichbare rote Sachzusicherung in dieser Datei gefunden", und P1-NACHHER bindet jetzt gegen die alte Zwei-Anweisungs-Fassung. Der Pruefer geht dafuer JEDE `ok()`-Stelle einzeln durch und nennt zu jeder die Einzeilen-Mutation, die sie fallen laesst — genau die Rechenschaft, die ein „nichts gefunden" tragfaehig macht. **SELBST AM QUELLTEXT NACHGELESEN, alle drei getragen:** (B3, blockierend) es bleiben ZWEI benannte Haengerpfade — der Halter in P1-NACHHER hat keinen eigenen Timer (`clientHold` haelt die Zeile, Freigabe nur ueber den spaeteren sequenziellen Ablauf), und `(e3)` traegt bei `test_feature_qr_zuordnung.js:2608` weiterhin ein unbegrenztes `await gate;`. Die Gate-Zeitgrenze aus Runde 3 wirkt dort, wo sie steht, nicht ueberall. (B1) Die vier bzw. fuenf NOWAIT-Proben muessen keine VERSCHIEDENEN Nummern pruefen: `Array(4).fill(nummernG3[0])` besteht Laenge, Groessenrelation und alle vier Abfragen — die Eindeutigkeitspruefung gilt nur der Gesamtliste, nicht den daraus gebildeten Teillisten. (B2) In `(e1)` wandert die Sollzahl weiter mit dem Aufbau (`const R = 2` laesst alles gruen, waehrend die Texte 40 Nummern behaupten). **Was der Lauf ausserdem leistet, und was ich ausdruecklich BESTELLT hatte:** die Gegenfrage „was ist durch das Entfernen von P1b verlorengegangen?". Antwort: die Integration ZWEIER echter `beanspruche()`-Aufrufe ueber ueberlappende Spannen. Das war MEIN Zuschnitt („was nicht bindet, fliegt raus"), kein Fehler des Ausfuehrenden — und es gehoert in den Kopfkommentar, statt unbemerkt zu verschwinden. **Wer eine Streichung anordnet, laesst auch pruefen, was mitgeflogen ist** | 4,86 $ |
| 16.09.2026 | CODE Rechtsstand Stufe 1, Runden 1+2 zusammen | Diff 1981 Zeilen, Suchen 11, Lesungen 19, Token rein 552468, Token raus 6308, Runden 7 | 7 (2 blockierend) | **5** | **0, aber 2 UNGEMESSEN** — **Der erste Lauf, in dem der Prüfer einen Verstoß gegen eine Regel fand, die ich ihm SELBST als unverhandelbar in den Vorspann geschrieben hatte:** der neue Statusdatei-Test legt mit `mkdtempSync` echte Verzeichnisse an und löscht mit `rmSync(..., {recursive:true})` — in einer Suite, die auf dem Live-Server Deploy-Gate ist. Am Quelltext bestätigt (`test_feature_rechtsstand.js:1554/:1575`). **Der teuerste Fund, selbst nachgemessen:** bei einem Massen-Extraktionsfehler ergeben 61 Quellen mit je eigenem Grund 61 Meldungsgruppen und **14.221 Zeichen** gegen Telegrams 4096 — und der Sendeweg teilt nichts auf (`grep` auf `4096`/`slice`/`chunk`: null Treffer). Ausgerechnet im Fall, für den der Wächter existiert, erreicht KEINE Zeile den Betreiber; die Fehlerisolierung aus Runde 1 schützt die Bewertung, nicht die Zustellung. **Zwei weitere selbst bestätigt:** ein Umbruch INNERHALB des Textes verändert den Normtext und `\r` überlebt (gemessen an drei Fassungen desselben Satzes) — dieselbe Klasse wie der Hauptbefund, eine Ebene tiefer, und heute noch folgenlos (4982 geprüfte Textblöcke, null Treffer), also jetzt billig zu schliessen; und der Resilienztest stellt die intakte Quelle VOR die fehlerhafte, kann das Weiterarbeiten danach also gar nicht belegen (Reihenfolge am Quelltext gelesen). **Einer deckt sich mit der Claude-Spur** (kein Riegel über die 57 Fingerabdrücke) — dort gemessen, hier unabhängig hergeleitet. **EHRLICH: zwei Befunde habe ich NICHT nachgemessen** (1.3 Meldungstests, 3.3 Abbruch bei Schreibfehler der Statusdatei). Sie stehen deshalb nicht als getragen; 3.3 ist als bestehender Fehlerpfad ausdrücklich zurückgestellt. **Überschneidung mit der Claude-Spur: 1 von 7** | 7,38 $ |
| 17.09.2026 | CODE Rechtsstand Stufe 1, ZWEITE Runde nach Runde 3 | Diff 2666 Zeilen, Suchen 15, Lesungen 17, Token rein 796704, Token raus 9906, Runden 8 | 7 (1 blockierend) | **7** | **0** — **Die erste zweite Runde, die sich eindeutig gelohnt hat, und der erste Lauf, in dem BEIDE Spuren denselben blockierenden Befund hatten.** Er trifft meine EIGENE Vorgabe aus Runde 3: ich hatte verlangt, die Versionsabweichung zwischen automatisch ausgeliefertem Kern und von Hand installierter Wächter-Kopie laut zu machen — und dabei gegen die NEUE Klassifizierung gemessen. Maßgeblich ist die ALTE, denn sie ist die installierte. Selbst nachgemessen, die alte Fassung wörtlich aus `master` nachgebaut: **alle SECHS neuen Lagen fallen dort auf `still`**, auch `widerspruch` und `norm_geaendert`. Im Fenster zwischen Merge und `install` meldet der Wächter also alles als unauffällig, obwohl er nichts geprüft hat — falsches Grün. Meine Formulierung „61× rot pro Woche" war damit falsch; der Fehler ist nicht laut, sondern unsichtbar. **Was den Befund beherrschbar macht, habe ich ebenfalls selbst gemessen:** der xmlText-Riegel greift VOR allen anderen Stufe-1-Zweigen, im Versionsfenster kann also keine andere neue Lage auftreten — es genügt, diese eine unter der alten Kopie laut zu machen. **Sechs weitere, alle getragen:** die Grenzprüfung der Meldungsaufteilung bezieht ihren Sollwert aus derselben Konstante wie die Implementierung; die Hash-Formatgegenproben prüfen eine eigene Kopie der Regel statt des Produktionsvalidators; ein gekennzeichnetes Kürzen kann eine HTML-Entity zerschneiden und damit die ganze Sendung ungültig machen; mehrere Teile gehen ohne Drosselung und ohne Wiederholversuch raus; die gedruckten Fingerabdrücke gehören bei einer Gruppe nur zur ERSTEN Norm; und der Strukturplatzhalter lässt sich aus der Quelle einschleusen (selbst gemessen: `A&#31;B` → `"A\nB"`). **Was dieser Lauf über die Methode sagt:** die Überschneidung mit der Claude-Spur war diesmal **5 von 7** statt 1 von 7 — beide Spuren fanden fast dasselbe. Die frühere Beobachtung „jede Spur findet Anderes" gilt also NICHT allgemein; sie hing offenbar am Material. Das ist ein Datenpunkt gegen die eigene Lieblingsthese und gehört genau deshalb hier hin | 10,70 $ |
| 17.09.2026 | Geraetealter und Maengelhistorie an der Ausmusterung, Runde 3 | Diff 1667 Zeilen, Suchen 18, Lesungen 35, Token rein 780805, Token raus 7168, Runden 9 | 6 (2 blockierend) | **6** | **0** — **Überschneidung mit der Claude-Spur: NULL von 6.** Damit steht es bei den beiden Läufen dieses Tages 0/6 gegen 5/7 — dieselbe Methode, gegensätzliches Ergebnis. Die These „jede Spur findet Anderes" hängt also am MATERIAL, nicht am Prüfer; wer sie allgemein behauptet, hat den jeweils anderen Lauf nicht angesehen. **Der teuerste Befund ist eine falsche Sicherheitszusicherung** und trifft Punkt 1 der Prüfreihenfolge: die Zusicherung verspricht wörtlich „studio_id-Filter wirkt wirklich, beide Gruppen", die Fremddaten in Studio B tragen aber alle eine gesetzte `geraet_id` — für die namensgleich-Gruppe gilt jedoch `geraet_id IS NULL`, sie werden also schon durch die ANDERE Bedingung ausgeschlossen. Selbst nachgemessen, beide Richtungen: `studio_id` aus der Abfrage entfernt (als `$1::integer IS NOT NULL`, damit Parameterzahl und Typisierung gültig bleiben) → **Suite EXIT 0, 117 PASS / 0 FAIL**, während ein eigens angelegter Freitext-Mangel aus Studio B bei Studio A mitgezählt wird (`LECK=true`); zurückgenommen `LECK=false`, `diff` EXIT 0. **Der zweite blockierende:** die neu angezeigten Entscheidungsdaten umgehen den bestehenden Änderungsriegel — `baueAnsicht()` nimmt nur `{id, typ, name, standort, seriennummer}`, der POST-SELECT lädt `inbetriebnahme_am` gar nicht, `vergleicheAnsichten()` vergleicht drei Gerätefelder. Korrigiert jemand die Inbetriebnahme, während ein zweiter das Formular offen hat, bleibt der Fingerabdruck identisch und die UNWIDERRUFLICHE Ausmusterung fällt auf veralteter Grundlage. Gelesen, nicht vermutet. **Vier weitere, alle getragen:** `app.listen(0)` ohne Host bindet auf alle Schnittstellen und stellt damit für die Dauer des Deploy-Gates authentifizierungsfreie Admin-Endpunkte bereit (die Netzsperre der Suite kontrolliert nur AUSGEHENDE Verbindungen); die Audit-Wertetests prüfen ausschliesslich Übergänge, die bei NULL beginnen, ein fest verdrahtetes `inbetriebnahme_alt: null` bliebe grün; zwei neue Datumssätze werden nur an der Überschrift geprüft, nie am Wert („mindestens seit 01.01.1900" bliebe unbemerkt); und ein Fehler der Zusatzabfragen reisst die ganze Bestätigungsseite — das ist LAUT und damit die sichere Seite, ein Rückfall auf `{gesamt: 0}` wäre das Gegenteil, deshalb bewusst nur festgehalten. **Eigener Fehler bei der Gegenprobe, gemessen statt übersehen:** mein Standard-Mutator hängt `// GEGENPROBE-DEFEKT` an — innerhalb eines SQL-Template-Literals ist das kein Kommentar, PostgreSQL kennt `//` nicht. `node --check` merkt davon nichts, weil der JS-String gültig bleibt. Die Probe wäre am Syntaxfehler gescheitert statt an der Sache | 10,30 $ |
| 17.09.2026 | Sammelbeitrag Rechtsstand-Waechter, Runden 1-3, vor PR | Diff 1387 Zeilen, Suchen 20, Lesungen 23, Token rein 729370, Token raus 9572, Runden 10 | 3 (1 blockierend) | **2** | **1** — **Dieser Lauf lässt sich zur Überschneidungsfrage NICHT auswerten, und daran bin ich schuld:** ich habe der Claude-Spur drei Befunde dieses Laufs im Auftrag ausdrücklich als „bereits gemessen, nicht erneut melden" ausgeschlossen. Die Spuren liefen damit nicht mehr unabhängig; jede Zahl zur Überschneidung wäre erfunden. Die Reihe 1/7 → 5/7 → 0/6 bekommt heute also KEINEN vierten Datenpunkt. **Der blockierende Befund, selbst nachgemessen:** `continue` → `break` in `fuelleUnbestaetigtZeilen()` (ops:878) ergibt **TEST_EXIT=0, 295 PASS / 0 FAIL** — genau die Schutzwirkung, die der Kommentar darüber behauptet, ist von keiner Zusicherung bewacht. Ursache ist die vierte Erscheinungsform aus der CLAUDE.md: ALLE Unerreichbar-Fixturen haben gleich lange Zeilen, `break` und `continue` sind für sie beobachtungsgleich. **Der zweite getragene ist eine falsche URSACHE in meiner eigenen Dokumentation:** der Kommentar in `standAusXml()` erklärt die falschen Werte mit einem „stillen Rückfall auf das GANZE Dokument". Selbst gemessen: `metaMatch` ist bei BEIDEN neuen Fixturen **nicht null**, der Rückfallzweig wird gar nicht betreten — der Ausdruck findet schlicht den nächsten `<metadaten>`-Block irgendwo im Dokument. Die beobachteten Werte stimmen, die Begründung nicht; den Rückfall zu entfernen hätte den Fall nicht behoben. Das ist die Klasse „eine Begründung, die schlicht nicht stimmt", und sie stand in einem Dokument, das als Entscheidungsgrundlage dient. **Der gefallene:** drei neue `fs.readFileSync` auf eigenen Repo-Quelltext als angeblicher Verstoss gegen „Tests fassen kein echtes Dateisystem an". Selbst gemessen: **92 der 326 Testdateien** tun genau das; die Regel zielt auf `pm2`, `nginx` und `/var/www`. Der Prüfer hatte selbst relativiert („ich setze diese Lesestellen nicht mit einem rekursiven Löschen gleich") — ein Prüfer, der seine eigene Einstufung dämpft, ist mehr wert als einer, der jeden Fund maximal einstuft | 9,84 $ |
| 17.09.2026 | Sammelbeitrag Rechtsstand-Waechter, Runde 4, zweite Gegenlesung | Diff 866 Zeilen, Suchen 7, Lesungen 27, Token rein 814419, Token raus 7544, Runden 9 | 2 (0 blockierend) | **2** | **0** — **Die erste zweite Runde, die nach der Regel vom 13.09. wirklich faellig war** (die Nachbesserung aenderte VERHALTEN — drei Regex-Muster im Kern —, nicht nur Zusicherungen) **und die KEINEN blockierenden Befund brachte.** Das ist fuer die Regel ein Datenpunkt in die andere Richtung als der vom 12.09.: eine zweite Runde kann auch bestaetigen. **Der Wert lag diesmal im gezielten AUSSCHLUSS, nicht im Fund.** Mein Hauptverdacht war der neue `sicher()`-Wrapper ueber ~24 Aufrufstellen: ein gefangener Fehler, der als bestandene Zusicherung durchgeht, waere schlimmer als der Absturz, den er behebt. Der Pruefer ist JEDE Weiterverwendung des gefangenen Werts einzeln durchgegangen und hat keine solche Stelle gefunden — mit Nennung der Riegel, inklusive der beiden Registeraufbauten, wo ein gefangenes `null` ueber `normtext_unbestaetigt` zu einem FAIL fuehrt statt zu Gruen. Ein begruendetes "nichts gefunden" ist hier das Ergebnis, das ich gekauft habe. **Beide Befunde selbst nachgemessen, beide tragen, beide rein lesend messbar:** (1) die neue Abschlusszeilen-Zusicherung baut ihren Ausdruck ungebunden zusammen — `"5 von 6 ausfuehrlich gezeigt"` matcht gemessen auch in `"15 von 6 ausfuehrlich gezeigt"` (`true`), sie prueft also einen Teilstring statt der Zahl; die strenge Fassung liest korrekt 15 aus. (2) Ein quotiertes `>` INNERHALB eines Attributwerts bricht die neu gehaerteten Muster: `<standkommentar quelle="a>b">NEU</standkommentar>` liefert gemessen `b">NEU` statt `NEU`. Das ist die Grenze des Regex-Ansatzes, kein Fehler dieser Runde — der Pruefer hat ausdruecklich KEINEN solchen Fall im echten gii-XML gefunden und es selbst als Anmerkung statt als Befund eingestuft. Wird dokumentiert, nicht behoben. **Zur Ueberschneidungsfrage traegt dieser Lauf nichts bei:** es gab keine zweite Spur, ich habe nur Astra laufen lassen | 10,75 $ |
| 17.09.2026 | Geistersperre-Rennen, drei Runden, vor PR | Diff 799 Zeilen, Suchen 28, Lesungen 34, Token rein 823799, Token raus 12369, Runden 12 | 4 (2 blockierend) | **3 gemessen, 1 ungemessen** | **0** — **Der teuerste Lauf bisher, und er trifft die eigene Arbeit derselben Stunde.** Befund 1: der statische Anker, den ich in Runde 3 EXTRA hatte bauen lassen, damit ein kuenftiger Verlust des Studio-Locks in `routes/admin/ausmusterung.js` auffaellt, sieht genau diesen Verlust NICHT. Selbst gemessen an der echten Datei, Bedingung von `SEILKONTROLLE` auf `CARDIO` verbogen (damit laeuft der Lock im Seil-Zweig gar nicht mehr): **58 PASS / 0 FAIL, EXIT 0, null gefallene Zusicherungen**. Er bindet Anzahl und Textpositionen, nicht die BEDINGUNG. Das ist die Klasse, die er verhindern sollte — und die Entscheidung, ihn ueberhaupt zu bauen, war trotzdem richtig; nur seine Form reichte nicht. Befund 2 (Tagesgrenze): selbst nachgelesen und tragend — die Loeschroute nimmt in ihrer Tx NUR den Tagesschluessel, ihr `auditAppend` laeuft erst NACH dem Commit, sie haelt den Studio-Lock also nie. Loeschen um 23:59:59 auf Tag D und Nachtrag um 00:00:00 auf D+1 teilen KEINE Sperre; der in Runde 2 ergaenzte Studio-Lock greift dort ins Leere. Nicht behoben (aendert die Granularitaet an drei weiteren Routen und beruehrt den dokumentierten Bestandskreis), datiert festgehalten. Befund 3 (Umbenennen): selbst nachgelesen und tragend — die neue Nachpruefung liest die frische Gerdaetezeile und wirft sie mit `.some(...)` weg, der INSERT nimmt weiter den Namen aus der VORpruefung, waehrend die Loeschpruefung am AKTUELLEN Namen bindet. Dritter Weg zur selben Geistersperre, wird in Runde 4 gebaut. Befund 4 (Demo-Daten-Loescher entfernt Seilgeraete hart, ohne jede Sperre): **von mir NICHT nachgemessen**, deshalb nicht als getragen gezaehlt; die Fundstellen sind plausibel, die Klasse ist eine andere (Zeile verschwindet ganz statt aktiv=0) und vorbestehend. **Was der Lauf ueber die Methode sagt:** der Pruefer hat ausdruecklich vermerkt, dass er nichts ausfuehren kann und seine Ablaeufe am Code hergeleitet sind. Drei von vier haben trotzdem gehalten — aber erst meine eigene Mutation hat aus Befund 1 eine Zahl gemacht. Ohne sie waere er eine Behauptung geblieben, die man auch haette wegdiskutieren koennen | 11,23 $ |
| 17.09.2026 | Geistersperre-Rennen, Runde 4 (Verhaltensaenderung), vor PR | Diff 1041 Zeilen, Suchen 24, Lesungen 34, Token rein 845297, Token raus 6268, Runden 10 | 3 (1 als blockierend eingestuft) | **2 getragen, 1 in der SCHWERE falsch eingestuft** | **0** — **Zweiter vollstaendiger Messpunkt zur Ueberschneidungsfrage, und er faellt aus wie der vom 13.09.: NULL Ueberschneidung.** Zwei Spuren parallel ueber denselben Diff, Astra (nur lesend) drei Befunde, die Claude-Review (ausfuehrend) elf — **kein einziger kam in beiden vor.** Die Ursache ist dieselbe wie am 13.09. und sie ist die eigentliche Auskunft: Astras Befunde lauten „diese Zusicherung prueft einen anderen Geltungsbereich, als ihr Text verspricht", Claudes lauten „ich habe mutiert, es blieb gruen". Zwei Suchverfahren, nicht zwei Meinungen. Damit steht „beide statt eine" auf ZWEI vollstaendigen Trennungen statt auf einer. GETRAGEN 1 (Umbenennen-Schluessel): der Schluessel der ECHTEN Umbenennen-Route ist nirgends verankert — fuer Loeschen und Nachtrag gibt es je einen Anker, fuer das Umbenennen keinen, obwohl genau dessen Rennen Szenario C nachspielt. SELBST GEMESSEN: Suffix `:umbenennen` an `routes/admin/geraete.js:475` -> **74 PASS / 0 FAIL, EXIT 0**, die gemeinsame Serialisierung waere weg und nichts wird rot. GETRAGEN 2 (Geltungsbereich von `jetzt`): `quelleSicht.includes('const jetzt = jetztISO();')` prueft die GANZE Datei; SELBST GEZAEHLT: der Ausdruck steht dort **4x** (2869, 3188, 3296, 4413). Eine Aenderung allein an der Handler-Zeile bliebe gruen. Die vorgeschlagene Behebung traegt dabei NICHT wie formuliert — selbst nachgemessen: das verankerte `seil`-Fenster enthaelt den Ausdruck gar nicht (Anker 4578, Fenster bis 5424); es braucht ein HANDLER-Fenster (4392-4815), und dort kommt jede der sechs verankerten Zeichenketten genau einmal vor. SCHWERE FALSCH (listen(0) auf 0.0.0.0 mit erfundener Admin-Sitzung, eingestuft als „blockierend fuer den Einsatz als Live-Deploy-Gate"): die Tatsache stimmt — `listen(0)` bindet gemessen an `0.0.0.0` —, die Einstufung fuer DIESEN Beitrag nicht. SELBST GEZAEHLT: **411 Fundstellen in 132 Dateien**, und mindestens zehn Testdateien mounten `routes/admin`. Der Beitrag fuegt eine Instanz zu 411 hinzu. Er behebt seine eigenen zwei, die Klasse bleibt datiert offen. Eine zu hoch angesetzte Schwere ist bei uns kein Einzelfall (13.09.: dasselbe an einem anderen Befund) — der Fund selbst war trotzdem richtig und wurde gebaut | 11,04 $ |
| 17.09.2026 | Geistersperre Runde 5: Waechter-Umbau (Inventar), nach drei blinden Runden | Diff 560 Zeilen, Suchen 24, Lesungen 24, Token rein 795307, Token raus 9250, Runden 11 | 4 (1 blockierend) | **3 gemessen getragen, 1 als Reichweiten-Anmerkung getragen** | **0** — **Der Lauf, der eine gezielte Frage beantwortet hat, und die Antwort war JA.** Ich hatte im Brief nicht "pruefe den Diff" gefragt, sondern: der Waechter war in DREI Runden hintereinander blind (58/0, 74/0, 74/0) — **ist die neue Fassung zum VIERTEN Mal blind, nur eine Ebene tiefer?** Sie war es. BEFUND 1, selbst gemessen: das "Inventar statt Mustersuche" faengt selbst mit einer Mustersuche an — `code.indexOf('pg_advisory_xact_lock(')` bindet an die unmittelbar folgende Klammer, SQL erlaubt dort Leerraum. Fuenfter Lock-Nehmer in gegenlaeufiger (verklemmender) Ordnung, geschrieben als `pg_advisory_xact_lock (hashtext($1))` — EIN Leerzeichen mehr, gueltiges SQL: **87 PASS / 0 FAIL, EXIT 0**. BEFUND 3, selbst gemessen: EIN fuehrendes Leerzeichen vor `async function ladeOffeneHinweise(` verschiebt die Fenstergrenze des Handler-Ankers um 97 Zeilen in eine fremde Funktion — **87 PASS / 0 FAIL**; das Muster erkennt Zeichenfolgen nach einem Zeilenumbruch, keine Funktionsgrenze. BEFUND 2, selbst gezaehlt: das Inventar deckt `routes/`, der Produktivkommentar behauptet "kein Bestandsweg" — ausserhalb liegen **ACHT** Lock-Stellen, darunter `core/integritaet.js:65`, die dieser Beitrag SELBST ueber `auditAppend(…, t)` aufruft. BEFUND 4 (`wirksamerBereich()` ist nur der Alias von `pruefeBereich()`, bewacht also die DEKLARIERTE Endungsliste statt ihrer Verwendung) traegt als Reichweiten-Anmerkung; der Pruefer hat ihn selbst so eingestuft und ausdruecklich dazugesagt, es sei **keine** tautologische Sollwertliste. **Was der Lauf ueber die Methode sagt:** ein Brief, der die eigene Fehlergeschichte als Frage formuliert ("ist er zum vierten Mal blind?"), liefert etwas anderes als "pruefe diesen Diff". Der Pruefer hat ausserdem von sich aus vermerkt, dass er nichts ausfuehren kann und seine Gegenproben am Quelltext hergeleitet sind — beide tragenden habe ich danach selbst gemessen, beide stimmten aufs Wort | 10,64 $ |
| 17.09.2026 | Geistersperre Runde 7: neuer Zeichenautomat als Erkenner, letzte Bau-Runde | Diff 942 Zeilen, Suchen 6, Lesungen 16, Token rein 364543, Token raus 5919, Runden 6 | 4 (0 blockierend) | **4 gemessen, alle vier tragen** | **0** — **Der billigste Lauf bisher (5,00 $) und der mit der hoechsten Trefferquote: vier von vier.** Ein gezielter Brief auf die EINE neue Sache des Beitrags (ein Zeichenautomat, der JavaScript maskiert) schlaegt einen breiten Diff-Auftrag. BEFUND 1: der Regex-Negativfall der Fixtur prueft nichts — `/pg_advisory_(?:xact_)?lock/g` enthaelt gar keinen zusammenhaengenden Bezeichner. SELBST GEMESSEN: den GANZEN Regex-Zweig des Maskierers abgeschaltet -> **138 PASS / 0 FAIL**. Ein Fixturfall, der eine Eigenschaft benennt und sie nicht pruefen KANN, ist genau die Klasse, gegen die die Fixtur gebaut wurde. BEFUND 2 (zwei Zeilentrenner, beide in die GEFAEHRLICHE Richtung): `\` + CRLF-Fortsetzung im String -> **0 Treffer** (mit LF: 1, Kontrolle steht); `//`-Kommentar durch U+2028 beendet -> **0 Treffer**. Beide am Helfer direkt gemessen, ohne Datenbank. BEFUND 3: die Objektform `t.q({text: …})` und `db.q({text: …})` ergeben denselben Inventareintrag — die Bindung Transaktionsverbindung gegen POOL, fuer die K3 ueberhaupt gebaut wurde, ist dort weg. Kontrolle: in der einfachen Form sind sie unterschiedlich. `{text: …}` ist die Konfigurationsobjekt-Form von pg, keine erfundene Schreibweise. BEFUND 4: der Fixturkopf stuft eine Grenze falsch ein (ein GRENZE-Fall irrt gefaehrlich, nicht sicher). **Was der Lauf ueber die Methode sagt:** der Pruefer hat von sich aus vermerkt, dass er nichts ausfuehren kann und seine Gegenbeispiele hergeleitet sind — ich habe alle vier nachgemessen, alle vier stimmten. Zwei davon (F2, F3) waren am HELFER direkt messbar, ohne Suite und ohne DB: eine ausgelagerte Funktion in Produktionsform macht nicht nur den Wert eines Tests aus, sondern auch die Nachpruefung eines Befunds billig | 5,00 $ |
| 17.09.2026 | Verschluesselung Stufe 0+1: Verbandbuch-PDF fluechtig, Retention-Differenzierung, Aufraeumskript, Health-Schluesselstand | Diff 1040 Zeilen, Suchen 19, Lesungen 40, Token rein 501336, Token raus 9504, Runden 9 | 8 (4 blockierend) | **8 getragen — einer davon von mir GEMESSEN, sieben am Quelltext geprueft** | **0** — **Der Lauf mit der bisher schaerfsten Trennung der beiden Spuren: NULL Ueberschneidung bei den blockierenden Befunden.** Parallel lief eine Claude-Review ueber denselben Diff (15 Befunde). Astras BEFUND 1 hatte sie NICHT: der qpdf-Stub im neuen Test reicht jeden unbekannten Programmnamen an die ECHTE Prozessausfuehrung durch (`if (datei !== 'qpdf') return echterExecFile(...)`) — in einer Suite, die auf dem Live-Server Deploy-Gate ist, und die Begruendung in der Ausnahmeliste des Systemeingriffs-Waechters behauptet woertlich das Gegenteil („kein echter Kindprozess“). Umgekehrt hatte die Claude-Spur die Kosten von `hatSchluessel()` je Anfrage, die Astra nicht sah. SELBST GEMESSEN habe ich BEFUND 6 (Symlink): `<root>/101/Verbandbuch` als Verzeichnis-Symlink nach aussen, scharfer Lauf meldet **„1 gefunden (29 B), 1 geloescht, 0 Fehler“** und die Datei AUSSERHALB von PDF_ROOT ist weg — `findeLoeschWurzel()` prueft nur den lexikalischen Pfad, der Kopfkommentar des Skripts behauptet das Gegenteil. **Was der Lauf ueber die Methode sagt:** Astra hat von sich aus vermerkt, dass es nichts ausfuehren kann und die uebermittelten PASS-Zahlen deshalb unbestaetigt bleiben — und hat trotzdem vier blockierende Befunde rein aus dem Kontrollfluss hergeleitet. Der teuerste Befund des Tages kam allerdings aus KEINER der beiden Spuren, sondern aus meiner eigenen stumpfen Messung am Testskript (s. B1 des Nacharbeitsauftrags: der scharfe Loeschlauf laeuft weiter, obwohl die Zusicherungen davor schon gefallen sind) | 6,98 $ |
| 17.09.2026 | Nacharbeit Stufe 0+1, Runde 2: wirken zwei Behebungen gegeneinander? | Diff 1186 Zeilen, Suchen 42, Lesungen 42, Token rein 1326189, Token raus 10362, Runden 16 | 8 (4 blockierend) | **8 getragen — F5 hatte ich VORHER selbst gemessen, sieben am Quelltext geprüft; F6 ist statisch hergeleitet und ausdrücklich als solches gekennzeichnet** | **0** — **Der teuerste Lauf bisher (17,35 \$) und der einzige, in dem eine Gegenlesung meinen EIGENEN Behebungsvorschlag widerlegt hat.** Der Brief fragte nicht „prüfe den Diff“, sondern: **wirken zwei Behebungen gegeneinander?** — nachdem ich selbst eine solche Wechselwirkung gefunden hatte (Zufallsname aus B5 trifft weder das eingeengte Aufräum-Muster aus S7 noch den Retention-Resolver). Der Prüfer bestätigte sie als F5 UNABHÄNGIG und fügte hinzu, was ich nicht gesehen hatte: mein Behebungsgedanke „Muster einfach erweitern“ hätte während laufender Downloads gelöscht und B5 eine Ebene tiefer wieder eingeführt. Das ist die Hausregel „der Behebungsvorschlag ist selbst ein Befund“ — diesmal gegen mich. F7, ebenfalls aus der Zufallsnamen-Klasse und von mir nachgemessen: `verifyCodes.set(publicPath, …)` (core/pdf-engine.js:404) wurde beim FESTEN Namen bei jedem Abruf überschrieben, beim Zufallsnamen wächst die prozessweite Map unbegrenzt — einziger Verbraucher ist generateMonthlyPDFs.js:235, die Verbandbuch-Routen verbrauchen nie. Zwei weitere blockierende Befunde (F1, F2) gehen auf zu lasche Formulierungen in MEINEM Auftrag zurück: „genau die Attrappe gesehen“ wurde als Zahlenvergleich gebaut (drei fremde Dateien bestehen das Tor ebenfalls), „innerhalb des Test-Temp-Verzeichnisses“ als `os.tmpdir()`. **Was der Lauf über die Methode sagt:** eine zweite Runde lohnt genau dann, wenn die erste VERHALTEN geändert hat — alle acht Befunde hängen an den drei Verhaltensänderungen der Nacharbeit, keiner an den reinen Zusicherungsergänzungen. Und ein Brief, der nach WECHSELWIRKUNGEN fragt statt nach Richtigkeit, findet eine Klasse, die eine Diff-Prüfung strukturell nicht sieht | 17,35 \$ |
| 18.09.2026 | Haertung P1+P2: vier GET-Schreibrouten auf POST, Waechter ueber CSRF-Ausnahmen | Diff 821 Zeilen, Suchen 45, Lesungen 45, Token rein 960050, Token raus 11185, Runden 13 | 3 (1 blockierend) | **3 getragen, alle am Quelltext nachgeprueft** | **0** — **Der erste Lauf, in dem BEIDE Spuren denselben blockierenden Befund unabhaengig fanden — und die andere Spur ihn AUSGEFUEHRT gemessen hat.** F1: der neu gebaute CSRF-Waechter sammelt nur aus einer selbst gewaehlten Router-Liste und wertet die gebaute App fuer seine Inventur gar nicht aus; `server.js` registriert fuenf weitere Schreibrouten direkt per `app.post` (`:196`, `:214`, `:230` loescht ein ganzes Studio, `:266`, `:652`), alle unter `/intern` und damit CSRF-ausgenommen. Die Claude-Spur hat die Datei laufen lassen: **5 PASS / 0 FAIL, gefundene Menge 8** — waehrend der Zusicherungstext „die TATSAECHLICH registrierten" behauptet. Falsche Zusicherung von Abdeckung, am Tag der Auslieferung. F2: „POST liefert die Datei" prueft bei den Wartungsrouten nur einen 302 mit passendem Namensfragment — `res.redirect('/nicht-vorhanden' + pdfPath)` bliebe gruen. F3: eine Zusicherung heisst „GENAU EINMAL" und misst `!== null`. **Was der Lauf ueber die Methode sagt:** der Brief fragte nicht „ist der Umbau richtig", sondern vier gezielte Fragen — wer erreicht die Route jetzt NICHT mehr, was macht der erstmals greifende CSRF-Schutz, greifen die Loeschpfade noch, welche Schreibweise uebersieht der Regex. Drei der vier trugen. Und Astra hat von sich aus die Verbandbuch- Loeschpfade EINZELN nachgelesen und als unversehrt bestaetigt — ein negatives Ergebnis MIT Rechenschaft, genau die Form, die der Prompt seit dem 11.09. verlangt | 12,84 $ |
| 18.09.2026 | Haertung P1+P2 Runde 3 — Vollstaendigkeitsriegel CSRF-Waechter | Diff 777 Zeilen, Suchen 9, Lesungen 34, Token rein 437098, Token raus 10549, Runden 8 | 8 (5 blockierend) | **8 getragen, 0 gefallen** | **5** | **Der ertragreichste Lauf bisher, und der billigste unter den grossen.** Der Pruefer sagt selbst, dass er NICHTS ausgefuehrt hat und seine Laufergebnisse Vorhersagen fuer meine Nachmessung sind — genau so hat es getragen. Ich habe alle fuenf blockierenden Praemissen EINZELN nachgemessen, ohne den Arbeitsbaum anzufassen: **B2** `app.get('/a',h) === app` ist `true` (Express 5.2.1) — eine Kette `app.get(…).post(…)` registriert beide Routen, die Regex findet nur die erste. **B5** bei `router.post(['/x','/intern/y'],h)` ist `route.path` ein ARRAY, die Template-Interpolation macht daraus `/x,/intern/y`, und `istAusnahmePfad('/x,/intern/y')` ist `false`. **B4** `mountKoennteAusnahmeRoutenTragen('/')` ist `false` — ein ausdruecklicher Wurzel-Mount wird als P sauber klassifiziert und danach herausgefiltert. **B3** `istAusnahmePfad('/')` ist `false` — `app.post('/' + 'intern/blindfleck', h)` wird mit dem Pfad `/` als P gelesen. **B1** am Quelltext: die Zeilennummer ist kein eindeutiger Schluessel, und `unklassifiziert` wird zwar AUSGEGEBEN, aber von keiner Zusicherung gelesen — der Hinweis steht im Log und der Lauf bleibt gruen. Dazu die strukturelle Empfehlung, die den Ansatz aendert: **`acorn` ist bereits direkte Abhaengigkeit** (`package.json:8`, 8.18.0 — selbst nachgesehen), Teil B gehoert also in einen Syntaxbaum statt in die naechste Regex. Das loest B1/B2/B3 an der Wurzel und liefert endlich einen eindeutigen Schluessel je Registrierung. **Und er hat meinen eigenen Behebungsvorschlag begruendet zurueckgewiesen:** die Namenskonvention gegen `require('./routes/…')` schliesst die von mir gemessene Schreibweise und traegt keinen Vollstaendigkeitsbeweis — richtig, sie wird zur Rueckfallebene | 6,25 $ |
| 18.09.2026 | PLAN Upload-Haertung (multer 2.4.0 + Dateityp/Groesse) — erste Planpruefung nach neuer Regel | Plan 152 Zeilen, Suchen 29, Lesungen 36, Token rein 501072, Token raus 9036, Runden 10 | 5 (3 blockierend) | **4 selbst nachgemessen, alle 4 getragen; der fuenfte als Fundort uebernommen** | **3** | **Der erste Lauf ueber einen PLAN statt einen Diff — und er hat MEINEN Plan zerlegt, bevor eine Zeile gebaut war.** Selbst nachgemessen: (1) es sind **sieben** multer-Konfigurationen, nicht sechs — die siebte heisst `seilMulter` (`routes/module.js:1135-1139`, Alias in einem try/catch), mein `grep "multer("` traf sie nicht; dieselbe Alias-Blindheit, die den CSRF-Waechter drei Runden lang beschaeftigt hat, diesmal in meinem eigenen Inventar. (2) **Vier** Dateien tragen einen `fileFilter`, nicht eine. (3) **Alle sieben** tragen `fileSize` — ich hatte das als offene Frage in den Plan geschrieben, es war mit einem grep beantwortbar. (4) `core/pruefbericht.js:63` traegt zusaetzlich `fieldSize: 25 MiB`, womit mein Abbruchkriterium („wenn alle Grenzen tragen, schrumpft der Beitrag") faellt. (5) Meine pauschale Aussage „jede Abfrage traegt studio_id" stimmt fuer `routes/verify.js:201` nicht — und **dort waere Nachruesten schaedlich**, weil die Sicherheitsgrenze der global eindeutige Code ist; ein Ausfuehrender haette das womoeglich brav „korrigiert". **Der schaerfste Punkt ist strukturell:** eine Konfiguration ist nicht ein Upload-Weg — aus sieben werden elf Multipart-Pfade plus drei Eingaenge ganz ohne multer (CSV ueber FileReader mit SEPARATEM Commit-Eingang, Base64-Signaturbilder). Nach Plan gebaut haette am Ende „Upload-Wege geprueft" dagestanden, und das waere falsch gewesen. **Nebenbefund, vorbestehend, von mir am Quelltext bestaetigt:** `routes/belehrungen.js:2001` loescht im gemeinsamen Fehlerausstieg die Datei, auf die das UPDATE in `:1992-1994` die Datenbank bereits zeigen laesst; Gegenmodell im Repo bei `routes/admin/geraete.js:4839`. Datiert offen, nicht hier gebaut. **Was der Lauf ueber die Methode sagt:** 6,94 $ gegen eine Bau-Runde, und die Befunde trafen nicht den Code, sondern die BEHAUPTUNGEN im Auftragspapier. Genau dafuer ist die Regel vom 18.09. da | 6,94 $ |
| 18.09.2026 | PLANPRUEFUNG Upload-Haertung Beitrag 1 (multer 2.4.0 + Fehlerbehandlung) | **ABGEBROCHEN — das OpenAI-Guthaben ist aufgebraucht.** HTTP 429, `insufficient_quota`, `credit_balance_exhausted`: „You have no credits remaining." Material 498 Zeilen, **Suchen 0, Lesungen 0, Token rein 0, Token raus 0** — es wurde NICHTS gesendet und NICHTS geprueft. Das Werkzeug hat sich richtig verhalten: es meldet den Fehlschlag, statt einen leeren Bericht als „keine Befunde" auszugeben, und traegt hier Striche statt Nullen ein. **Folge fuer die Arbeitsweise: die Astra-Spur faellt aus, bis der Betreiber Guthaben nachlegt.** Die Regel vom 18.09. („jeder Bauauftrag geht vor der ersten Bau-Runde an den Gegenleser") ist damit nicht aus Nachlaessigkeit unerfuellt, sondern technisch unerfuellbar — ersatzweise laeuft die Claude-Spur. Das ist KEIN Gleichwertiges: nach der Messung vom 13.09. finden beide Spuren verschiedene Klassen mit NULL Ueberschneidung, die Claude-Spur misst Mutationen, Astra durchdenkt Kontrollfluss. Was Astra gefunden haette, ist damit ungeprueft, nicht sauber | **0,00 $** (nichts gesendet) |
| 18.09.2026 | PLANPRUEFUNG Upload-Haertung Beitrag 1 — **CLAUDE-Spur als ERSATZ**, weil das OpenAI-Guthaben aufgebraucht war (Zeile darueber) | Auftragspapier 231 Zeilen + Plan, Repo-Lesezugriff auf /home/user/gymdocu, 57 Werkzeugaufrufe, ~237k Token, Laufzeit 19 min | **13 + ein Zusatzfund** | **13 von 13 selbst nachgemessen, ALLE GETRAGEN** | **0** — **der erste Lauf ohne einen einzigen gefallenen Befund**, und zugleich der erste, in dem eine Planpruefung den KERN eines Beitrags widerlegt hat statt seine Raender. Zwei blockierend, beide gegen meine eigene Tatsachenbehauptung: **(1)** Mein A2 benannte `flushingFiles` in `storage/disk.js` als CVE-Fix. Selbst nachgemessen: die WeakMap wird nur unter `if (that.flush)` befuellt, `opts.flush` ist ein NEUES FEATURE in 2.4.0 (`grep -c flush storage/disk.js` -> 2.3.0 **0**), und wir setzen es nirgends. Der echte Fix ist `abortCleanupDone`/`abortRemovedFiles` in `lib/make-middleware.js` (`grep -c` -> **0** in 2.3.0, **3** in 2.4.0). Der OSV-Text selbst geholt und woertlich bestaetigt: „file writes that complete AFTER multer has already run its abort cleanup". **(2)** Der von mir beauftragte Abbruch-Test haette den Fehler nicht finden KOENNEN: er sollte `_removeFile` selbst aufrufen, waehrend der Fehler gerade darin besteht, dass `_removeFile` NICHT gerufen wird — ein Test, der den fehlenden Aufruf nachholt, prueft einen Zweig, den es im verwundbaren Fall nicht gibt. **Meine eigene Nachmessung ging dabei weiter als die des Pruefers und faellt schaerfer aus:** acht Laeufe gegen 2.3.0, alle gruen — und die POSITIVKONTROLLE FIEL DURCH. Eine Spur zeigte `_handleFile` NIE gerufen; eine reine In-Prozess-`Readable`-Attrappe bekam selbst ein vollstaendiges gueltiges Multipart nicht durch multer. Die acht Gruen hiessen also „nichts gemessen", nicht „nicht verwundbar" — haargenau die Zusicherung, die der Beitrag geliefert haette. **Elf weitere, alle getragen:** Erfolgsweg liefert **302**, nicht die von mir beauftragten 200 (`res.redirect`, beide Wege); B3 war wOERTLICH unerfuellbar und haette sich ins Gegenteil verkehrt — `routes/lageplan.js` ist die EINZIGE der zehn Aufrufstellen ohne Fehler-Wrapper, ein geworfener Fehler geht an `next(err)`, der Handler laeuft nie, der globale Behandler ruft `errorTracker.melde` -> `telegram`, also **ein Telegram-Alarm bei jeder falschen Dateiwahl** plus 500-Seite statt einer besseren Meldung; `wrappedFileFilter` reserviert den Platz schon in 2.3.0 synchron (neu ist die RUECKGABE) und die einzige `.array`-Stelle hat gar keinen `fileFilter`, die Aenderung kann hier also nicht eintreten; die einzige Textaenderung ist `LIMIT_UNEXPECTED_FILE` -> `Unexpected file field`, an vier Stellen ueber `err.message` sichtbar, waehrend der Testbestand **null** Zusicherungen auf multer-Fehlertexte hat; `storage/memory.js` ist umgeschrieben und `concat-stream` entfaellt; `postMultipart` hat eine FESTE URL und einen festen Feldnamen, meine D-Auflage war damit per Konstruktion unerfuellbar, und daneben steht eine zweite Kopie `postAdminBericht`; die Unterschrift-Wege sind **mindestens 13**, nicht 11 (`routes/verbandbuch.js:538` ueber `b.unterschrift`, `routes/wartung.js:1050` als mehrzeilige Destrukturierung — beide fielen durch mein `grep "req.body"`, dieselbe Blindheit wie beim `seilMulter`-Alias); `routes/belehrungen.js` hat **17** gleichartige `res.send`-Stellen, mein B1 fasst sieben an; fuenf von sechs Zeilennummern waren um eins verschoben; `package.json` steht auf `^2.1.1`, „gepinnt" gab es nie. **Zusatzfund (c):** ein Datei-Eingang, der durch ALLE VIER meiner Suchmuster fiel — eine JSON-Route in `routes/lageplan.js` nimmt `req.body.modell`, rendert per `sharp` und schreibt eine Bilddatei ins SELBE Verzeichnis wie der multer-Weg. Kein multer, kein `FileReader`, kein Base64. **Der Pruefer hat zwei eigene Einschaetzungen im Lauf zurueckgenommen** und es dazugeschrieben. **Was der Lauf ueber die Methode sagt:** die eine Behauptung, die ich ausdruecklich als „meine Messung, miss sie nach" gekennzeichnet hatte, war die EINZIGE, die trug. Die Kennzeichnung gehoert an jede Tatsachenbehauptung ueber den Bestand, nicht nur an die, bei der man selbst unsicher war | — (Claude-Spur, keine OpenAI-Kosten) |

| 18.09.2026 | PLANPRUEFUNG Upload-Haertung Beitrag 1, Fassung 2 (Astra-Spur, nach Guthaben-Nachlage) | Diff 608 Zeilen, Suchen 27, Lesungen 50, Token rein 960079, Token raus 8911, Runden 14 | — | — | — | 12,67 $ |
| 18.09.2026 | PLANPRUEFUNG Upload-Haertung Beitrag 1, **Fassung 2** (Astra-Spur, nach Guthaben-Nachlage) | Auftragspapier 341 Zeilen + Plan, Repo-Lesezugriff auf einen EIGENEN Worktree (`/workspace/gymdocu-lese`, `903247b`), weil der Executer parallel im Hauptbaum schrieb; Suchen 27, Lesungen 50, Token rein 960079, Token raus 8911, Runden 14 | 7 (2 als blockierend gemeldet) | **6 von 7 selbst nachgemessen und getragen** | **1** (Schwereeinstufung) | **Der Beleg fuer „beide Spuren statt einer" — NULL Ueberschneidung mit der Claude-Spur desselben Tages, bei voellig anderem Auftrag im Brief.** Die Claude-Spur hatte Fassung 1 zerlegt (13 Befunde, Messungen und Zeilennummern); Astra bekam ausdruecklich NICHT dieselben Fragen, sondern: welcher Zustand wird nie hergestellt, was folgt fuer den BETRIEB, welcher Satz ist hergeleitet statt gemessen. Ergebnis: sieben Befunde, von denen die Claude-Spur KEINEN hatte. Selbst nachgemessen: **(1)** Mein B3.2 behauptete, `LIMIT_FILE_SIZE` bekomme im globalen Behandler „eine eigene 413-Seite". Gemessen: `new MulterError("LIMIT_FILE_SIZE")` hat weder `type` noch `status`, die Bedingung `err.type === "entity.too.large" || err.status === 413` trifft nicht zu — eine zu grosse Lageplan-Datei bekommt HEUTE SCHON 500 **plus Telegram-Alarm**. Ich wollte diesen Weg „ausdruecklich unveraendert lassen" und haette damit denselben Alarm-Ausloeser stehengelassen, den ich zwei Absaetze weiter beheben wollte. **(2)** `routes/lageplan.js` loescht im Grundriss-Upload die ALTE Datei bei `:633` — VOR dem Schreiben der neuen (`:637`) und vor dem UPDATE (`:638`). Scheitert eines davon, ist der alte Grundriss weg und die DB zeigt ins Leere; der Benutzer liest „konnte nicht verarbeitet werden". Vorbestehend, in genau dem Weg, den der Beitrag anfasst, und die CLAUDE.md verbietet es woertlich („Dateiloeschungen gehoeren NACH den Commit"). **(3)** Ein neuer `feedback`-Code allein zeigt GAR NICHTS an: die Definitionen stehen bei `:898-900`, und `core/ui-feedback.js` liefert fuer einen unbekannten Code `""` — alle meine B3-Zusicherungen waeren gruen gewesen, waehrend der Benutzer keine Erklaerung sieht. **(4)** Mein B3.4 („vier Typen einzeln, darunter PDF") laesst den PDF-Zweig `execFileSync("pdftoppm")` starten — ein ECHTER Prozess in einer Suite, die auf dem Live-Server Deploy-Gate ist. **(5)** Meine A3-Aussage „alle elf Multipart-Wege funktionieren" ist nicht gedeckt, weil Teil A laut meinem eigenen D gar keine Route anfaehrt. **(6)** „`melde` wurde NICHT gerufen" braucht eine Positivkontrolle: die Test-Apps bauen Express OHNE den globalen Behandler, die Attrappe bliebe auch bei einem faelschlichen `next(err)` unberuehrt. **GEFALLEN (1), in der Schwere:** „`EINWEISUNG_NACHWEIS_DIR`/`DEFECT_PHOTO_DIR` werden nicht umgeleitet, schon das Laden schreibt" — als blockierend gemeldet. Die Tatsache stimmt, die Schwere nicht: gemessen laden **27** bestehende Testdateien `routes/sichtpruefung.js` und **14** `routes/belehrungen.js`, und wer das Verzeichnis braucht, setzt die Variable in seiner eigenen Datei (je fuenf tun das); `einweisung-nachweise/` steht in `.gitignore`. Bestehende Suite-Eigenschaft mit etabliertem Umgang. **Das ist das DRITTE Mal, dass Astra genau diese Einstufung macht und sie faellt** (s. Lauf vom 16.09.) — ein systematischer blinder Fleck, kein Zufall. **Astra hat ausserdem eine eigene Verdachtsannahme unaufgefordert zurueckgenommen** („DB-Ausfall laesst das Fehlerlayout erneut werfen") mit Fundstellen dagegen. **Was der Lauf ueber die Methode sagt:** die Trennung der BRIEFE hat die Trennung der BEFUNDE erzeugt. Wer beiden Spuren denselben Auftrag gibt, bezahlt zweimal fuer dieselbe Klasse | **12,67 $** |

| 18.09.2026 | **A/B gegen Astra: IDENTISCHES Material und Brief, nur Modell `gpt-5.6-luna` statt `gpt-6-astra`** | Material 608 Zeilen, Suchen 10, Lesungen 24, Token rein 510311, Token raus 7555, Runden 11 | 5 (2 als blockierend gemeldet) | **3 von 5 selbst nachgemessen und getragen** | **1 ganz, 1 in der Schwere** | **Der erste echte A/B nach Hausregel-Bedingungen: derselbe Auftrag woertlich, dasselbe Material, derselbe Lesebaum, nur das Modell getauscht — und ein Preisunterschied von Faktor 23 (0,56 $ gegen 12,67 $).** GETRAGEN: (1) **Ein Widerspruch, den ICH SELBST erzeugt und Astra am selben Material UEBERSEHEN hatte** — ich hatte den CVE-Ort im Auftragspapier auf `abortCleanupDone` korrigiert und den eingebetteten Plan Fassung 3 stehenlassen, wo weiter „Der CVE-Fix sitzt in `storage/disk.js`" stand. Ein Ausfuehrender, der den Grundlagentext liest, haette weiter den falschen Code kommentiert. Dieselbe Aussage an zwei Orten, eine nachgezogen, eine nicht — unsere haeufigste Fehlerquelle. Sofort behoben. (2) „alle sieben Module laden" ist ungenau: es sind sieben Konfigurationen in SECHS Dateien, und zwei davon sind bedingt aktiv (`SEIL_FOTOS_AKTIV`, `FOTOS_AKTIV`) — ein blosses `require()` beweist also weder sieben Konfigurationen noch sieben aktive Wege. (3) Die Entscheidung zur englischen multer-Meldung war nicht als pruefbarer Vertrag formuliert. **GEFALLEN (1 ganz):** Befund 1, als blockierend gemeldet — „der Auftrag aendert nur den Wrapper, nicht die Ursache `cb(null,false)`". Das Papier verlangt beides woertlich (B3, Schritt 1 nennt den geworfenen Fehler samt Vorbild-Fundstelle). Luna hat das Papier an dieser Stelle nicht genau gelesen und daraus den schwersten seiner Befunde gemacht. **GEFALLEN (1 in der Schwere):** die Testisolation der neuen Routentests — dieselbe Klasse, die bei Astra am selben Tag fiel. **WAS DER LAUF FUER DIE AUFGABENTEILUNG HERGIBT, und es ist der eigentliche Ertrag:** Luna fand ausschliesslich **PAPIER**fehler (Widersprueche, ungenaue Formulierungen, fehlende Vertraege). Astra fand am selben Material die beiden **BESTANDS**fehler, die diesen Beitrag getragen haben — dass ein `MulterError` weder `type` noch `status` traegt, und dass der Lageplan die alte Datei vor dem UPDATE loescht. Beide erforderten Graben im Repo, und genau dort liegt der Unterschied: **50 Lesungen gegen 24.** Vorlaeufige Regel, noch eine Stichprobe von EINS: Luna fuer Plan- und Textpruefungen (bei dem Preis auch zusaetzlich), Astra fuer Code und Bestand | **0,56 $** |
| 18.09.2026 | CODE-Pruefung Upload-Haertung Beitrag 1 vor dem Merge (Astra) | **ABGEBROCHEN durch den eigenen Geheimnis-Riegel** — Diff 1104 Zeilen, Suchen 0, Lesungen 0, Token rein 0, Token raus 0, Runden 0. **Es wurde NICHTS gesendet und NICHTS geprueft.** | — | — | — | 0,00 $ — **aber der Abbruch war der Befund.** Der Riegel schlug auf `postgresql://gymdocu:PASSWORT@127.0.0.1/gymdocu_test` in der neuen Datei `test_feature_multer_2_4_bestandsschutz.js` an. **Kein echtes Geheimnis:** dort steht woertlich der Platzhalter `PASSWORT`, der Ausfuehrende hat das bewusst so gebaut, ausfuehrlich begruendet und sogar den repo-weiten Klartext-Scanner beruecksichtigt. Der Riegel unterscheidet aber keine Platzhalter — und das ist richtig so, er bricht ab statt zu warnen. **Der Befund dahinter traegt trotzdem, und ich haette ihn ohne den Abbruch nicht gesucht:** (1) `grep` ueber den Testbestand — **KEINE einzige** bestehende Testdatei traegt dieses Muster; das etablierte ist `process.env.DATABASE_URL` OHNE Fallback-Literal. (2) Der Kommentar des Ausfuehrenden sagt selbst „nie verbindet sich ohnehin niemand mit dieser URL" — das Passwort-Segment ist also schlicht ueberfluessig. (3) Die Folge ist nicht kosmetisch: die Zeile blockiert DAUERHAFT jede kuenftige Gegenlesung, die diese Datei im Diff hat. Behebung: Passwort-Segment weglassen (`postgresql://gymdocu@127.0.0.1/gymdocu_test` ist eine gueltige URL), sobald der Arbeitsbaum frei ist. **Lehre fuer die Arbeitsweise: ein Riegel, der abbricht statt zu warnen, findet Dinge, nach denen niemand gesucht hat** — der Lauf wurde mit bereinigtem Material wiederholt, siehe naechste Zeile |
| 18.09.2026 | **CODE-Pruefung** Upload-Haertung Beitrag 1 vor dem Merge (Astra; **die Beschriftung „effort `xhigh`“ war FALSCH** — gemessen 18.09.2026 setzt `tools/gegenleser-repo.js` gar kein `reasoning`, der Lauf lief auf der Voreinstellung) | Diff 1104 Zeilen, Suchen 73, Lesungen 49, Token rein 1795110, Token raus 16628, Runden 22 | 9 (4 als blockierend gemeldet) | **bisher 6 selbst nachgemessen, 5 getragen** | **1 ganz, 1 in der Schwere** — 3 noch offen | **Der erste Lauf, bei dem die SUITE SCHON GRUEN war** (`SUITE_EXIT=0`, 0 Fehlschlaege, Dateizahl 337=337, Lint 0) — der Brief fragte deshalb nicht „laeuft es", sondern „ist es gruen aus dem RICHTIGEN Grund". GETRAGEN: **F1 (blockierend, und der teuerste):** die Zusicherung „alle SIEBEN Konfigurationen erreicht" addiert HANDGESCHRIEBENE Literale aus der `MODULE`-Liste und zaehlt damit nur, ob sechs Module geladen haben — nicht, ob sieben multer-Konstruktoren liefen. Wer `FOTOS_AKTIV` in `routes/sichtpruefung.js` abschaltet, laedt das Modul weiterhin, konstruiert aber KEINE Konfiguration, und der Test zaehlt trotzdem `anzahl: 1` und bleibt bei 7. Beide Seiten des Vergleichs stammen aus derselben Quelle — genau die Abdeckungsluege, die dieser Test verhindern sollte. **F2:** `seiteExe.text.includes("ui-banner--error")` ist IMMER wahr, weil die Zeichenkette als CSS-Regel in `core/ui-feedback.js:71` steht und ueber `UI_FEEDBACK_CSS` in jede Lageplan-Seite eingebettet wird (`routes/lageplan.js:1342`); ein `tone: "success"` statt `"error"` fiele nicht auf. Der Titel-Teil derselben UND-Verknuepfung bewacht dagegen etwas. **F4:** Isolations-Inkonsistenz INNERHALB des Beitrags — `test_feature_multer_2_4_bestandsschutz.js` leitet FUENF Verzeichnisse um (inkl. `EINWEISUNG_NACHWEIS_DIR`, `DEFECT_PHOTO_DIR`), `test_feature_upload_fehlerbehandlung.js` nur DREI; derselbe Ausfuehrende hat es einmal vollstaendig gemacht und einmal vergessen. **F5 (Schwere zu hoch):** die `pdftoppm`-Attrappe ist in der Sache wirklich ein echter Kindprozess (PATH-Attrappe, gestartet wird node statt poppler) — aber sie ist vollstaendig kontrolliert und schreibt nur nach `os.tmpdir()`; der Zweck der Regel (keine Live-Eingriffe) ist gewahrt. Was traegt, ist der KOMMENTAR, der mehr Isolation behauptet als besteht. **GEFALLEN (1 ganz): F9** — „drei neue SELECTs ohne `studio_id`", als BLOCKIEREND gemeldet. Gemessen: allein die acht haeufigsten Varianten von `SELECT … FROM … WHERE id=$1` ohne `studio_id` ergeben **133 Vorkommen** im Testbestand; es sind Fixture-Lesezugriffe auf selbst eingefuegte IDs, und die Regel zielt auf PRODUKTIVE Abfragen. Astra raeumt die Eindeutigkeit sogar selbst ein und stuft trotzdem blockierend ein. **Das ist das ZWEITE Mal, dass genau diese Einstufung faellt** (nach dem 16.09.) — zusammen mit der Testisolations-Klasse der zweite systematische blinde Fleck. NOCH OFFEN, nicht nachgemessen: F3 (Aufraeumen/Dateiintegritaet unbewacht), F6/F7/F8 (alle als VORBESTEHEND gekennzeichnet, gehoeren in die offenen Punkte, nicht in diesen Beitrag). **Zur Stufe:** `xhigh` kostete hier **23,69 $** gegen 12,67 $ bei `high` am selben Tag — der Aufpreis ist real und gehoert bei der naechsten Wahl mitgedacht | **23,69 $** |
| 18.09.2026 | Planpruefung Upload-Haertung 2, RUNDE 2 (neuer Entwurf: Markierung an der Quelle) | Diff 235 Zeilen, Suchen 30, Lesungen 40, Token rein 909495, Token raus 9012, Runden 13 | 7 (3 blockierend) | **3 bisher, alle 3** | 0 (4 noch nicht nachgemessen) | 12,04 $ |
| 18.09.2026 | SICHERHEIT: Fremd-ID ohne Zugehoerigkeitspruefung, systematische Suche in routes/ | Diff 2853 Zeilen, Suchen 86, Lesungen 95, Token rein 3646637, Token raus 14871, Runden 26 | 3 (F1 bekannt, **F2 neu**, F3 Anmerkung) | **3, alle** | 0 | 46,70 $ |
| 18.09.2026 | SICHERHEIT A: Einschleusung (SQL, Kommando, Pfad, HTML) | **abgebrochen** (Ausgabemenge ueber dem Limit): Diff 1750 Zeilen, Suchen 88, Lesungen 50, Token rein 2467904, Token raus 6771, Runden 19 | — | — | — | 31,36 $ |
| 18.09.2026 | SICHERHEIT C: Datenabfluss (Fehlerantworten, Logs, Dateien, Koepfe) | **abgebrochen** (Ausgabemenge ueber dem Limit): Diff 282 Zeilen, Suchen 74, Lesungen 95, Token rein 2747959, Token raus 11097, Runden 24 | — | — | — | 35,18 $ |
| 18.09.2026 | SICHERHEIT B: Anmeldung, Sitzung, Token, Ratenbegrenzung | **abgebrochen** (Ausgabemenge ueber dem Limit): Diff 2058 Zeilen, Suchen 47, Lesungen 80, Token rein 2956200, Token raus 11845, Runden 20 | — | — | — | 37,84 $ |
| 18.09.2026 | SICHERHEIT A1: SQL und Kommandos (Wiederholung, Deckel 3 MB) | Diff 1750 Zeilen, Suchen 53, Lesungen 87, Token rein 3156742, Token raus 14875, Runden 22 | 4 (0 Einschleusung, 2 Zusicherung/Fehlerweg, 2 Anmerkungen) | 4 | 0 | 40,57 $ |
| 18.09.2026 | SICHERHEIT C: Datenabfluss (Wiederholung, Deckel 3 MB) | **abgebrochen** (HTTP 429 `insufficient_quota` — OpenAI-Guthaben erschoepft, NICHT das Mengenlimit): Diff 282 Zeilen, Suchen 47, Lesungen 91, Token rein 1923042, Token raus 13174, Runden 19 | — | — | — | mind. 25,03 $ |
| 18.09.2026 | SICHERHEIT A2: Pfade und HTML-Ausgabe | **abgebrochen vor dem ersten Modellkontakt** (HTTP 429 `insufficient_quota` auf die ERSTE Anfrage): Buendel **gezaehlt** 52.860 Token, Suchen 0, Lesungen 0, Runden 1 | — | — | — | 0,00 $ |
| 18.09.2026 | SICHERHEIT B: Anmeldung, Sitzung, Token (Wiederholung, Deckel 3 MB) | Diff 2058 Zeilen, Suchen 49, Lesungen 89, Token rein 2874094, Token raus 17697, Runden 20 | 10 (2 blockierend, 4 zu beheben, 2 Anmerkungen, 2 Zusicherungen) | laufend nachgemessen, s. Abschnitt | laufend | 37,25 $ |
| 18.09.2026 | SICHERHEIT A2: Pfade und HTML-Ausgabe (Neustart nach Guthaben) | Diff 3247 Zeilen, Suchen 99, Lesungen 107, Token rein 4897220, Token raus 19066, Runden 28 | 8 (2 blockierend) | 3 bisher (H1 XSS, F4 URIError, F1 Dateiloeschung) | 0 | 62,65 $ |
| 18.09.2026 | **PLANPRUEFUNG** Mandantengrenze Fremd-IDs, vor der ersten Bau-Runde | Diff 7036 Zeilen, Suchen 41, Lesungen 52, Token rein 2723506, Token raus 19639, Runden 15 | 6 (1 blockierend) | **6** | 0 | 35,52 $ |
| 18.09.2026 | SICHERHEIT C: Datenabfluss (Neustart nach Guthaben) | Diff 282 Zeilen, Suchen 67, Lesungen 110, Token rein 3411776, Token raus 24910, Runden 26 | 10 (2 blockierend) | 2 bisher (D1 Gate-Umgehung, F1 Dateiloeschung) | 0 | 44,52 $ |
| 18.09.2026 | **PLANPRUEFUNG** Zusicherung Shell/qpdf/stiller catch, vor der ersten Bau-Runde | Diff 3289 Zeilen, Suchen 31, Lesungen 56, Token rein 1606111, Token raus 24732, Runden 13 | 5 (2 blockierend) | **5** | 0 | 21,93 $ |
| 18.09.2026 | **CODEPRUEFUNG** Upload-Haertung 2a vor dem Merge | Diff 2018 Zeilen, Suchen 26, Lesungen 38, Token rein 766614, Token raus 25127, Runden 10 | 6 (1 blockierend, 1 Regress) | **6** | 0 | 11,47 $ |
| 18.09.2026 | **PLANPRUEFUNG** Gate-Endungsausnahme, Symbol-XSS, doppelte Dekodierung | Diff 3673 Zeilen, Suchen 62, Lesungen 82, Token rein 2822763, Token raus 22255, Runden 20 | 6 (2 blockierend) | **6** | 0 | 36,95 $ |
| 18.09.2026 | **PLANPRUEFUNG** Fotoloeschung an Identitaet binden, vor der ersten Bau-Runde | Diff 1748 Zeilen, Suchen 56, Lesungen 66, Token rein 1860326, Token raus 22688, Runden 18 | 6 (1 blockierend) | **6** | 0 | 24,96 $ |
| 18.09.2026 | **CODEPRUEFUNG** Mandantengrenze M1+M2 vor dem Merge | Diff 926 Zeilen, Suchen 32, Lesungen 44, Token rein 836548, Token raus 22085, Runden 12 | 4 | **4** | 0 | 12,11 $ |
| 19.09.2026 | diffpruefung-streaming-umbau | Diff 757 Zeilen, Suchen 14, Lesungen 18, Token rein 323750, Token raus 27525, Runden 5 | 6 (2 als blockierend gemeldet) | **6** | 0 (1 Schwere korrigiert) | 2,44 $ |
| 19.09.2026 | Planpruefung Eingabewache (Spur 1: was bricht der Plan) | Diff 699 Zeilen, Suchen 62, Lesungen 44, Token rein 2041937, Token raus 32995, Runden 17 | 8 | **8** | 0 | 11,20 $ |
| 19.09.2026 | Planpruefung Eingabewache (Spur 2, `deepseek-flash`: was verspricht der Plan, das er nicht einlöst) | statisches Bündel, kein Repo-Zugriff; Token rein 14458, Token raus 34237 (davon 26768 Denken), 150 s | 9 | **9** | 0 | ~0,03 $ |
| 19.09.2026 | Planpruefung Eingabewache Fassung 2 (Spur 1: was bricht die Verschaerfung) | Diff 961 Zeilen, Suchen 76, Lesungen 48, Token rein 3562404, Token raus 31864, Runden 24 | 6 (3 blockierend) | **6** | 0 | 18,77 $ |
| 19.09.2026 | Planpruefung Eingabewache Fassung 2 (Spur 2, `deepseek-flash`: was verspricht sie, das sie nicht einlöst) | statisches Bündel; Token rein 19161, Token raus 36308; 160 s | 11 (2 blockierend) | **11** | 0 | ~0,04 $ |
| 19.09.2026 | Planpruefung ID-Wache + Textfeld-Wache (Spur 1: wo scheitert der Inventar-Waechter) | Diff 1356 Zeilen, Suchen 86, Lesungen 39, Token rein 2315434, Token raus 38490, Runden 21 | 13 (9 blockierend) | **13** | 0 | 12,73 $ |
| 19.09.2026 | Planpruefung ID-Wache + Textfeld-Wache (Spur 2, `deepseek-flash`: was verspricht das Verfahren, das es nicht einlöst) | statisches Bündel; Token rein 19161, Token raus ~39000; 189 s | 16 (2 blockierend) | **16** | 0 | ~0,04 $ |
| 19.09.2026 | Diffpruefung ID-Wache (Spur 1: was bricht der Diff) | Diff 1249 Zeilen, Suchen 47, Lesungen 43, Token rein 3330243, Token raus 26664, Runden 24 | 5 (2 blockierend) | **3** | **2** (beide Schwere falsch) | 17,45 $ |
| 19.09.2026 | Diffpruefung ID-Wache (Spur 2, `deepseek-flash`: was verspricht der Diff, das er nicht einlöst) | statisches Bündel; 236 s | 12 | **9** | 3 | ~0,05 $ |
| 19.09.2026 | Planpruefung Schreibreihenfolge (Spur 1: was bricht der Plan, welche Lock-Ordnung entsteht) | Diff 809 Zeilen, Suchen 76, Lesungen 51, Token rein 2580807, Token raus 29375, Runden 21 | 8 (3 blockierend) | **8** | 0 | 13,79 $ |
| 19.09.2026 | Planpruefung Schreibreihenfolge (Spur 2, `deepseek-flash`: was verspricht der Plan, das er nicht einlöst) | statisches Bündel; 168 s | 9 (1 blockierend) | **9** | 0 | ~0,05 $ |
| 20.09.2026 | Planpruefung Schreibreihenfolge Fassung 2 | Diff 2198 Zeilen, Suchen 92, Lesungen 47, Token rein 3286959, Token raus 32890, Runden 21 | — | — | — | 17,42 $ |
| 20.09.2026 | Diffpruefung Z2-Kollationsbehebung | Diff 819 Zeilen, Suchen 49, Lesungen 50, Token rein 2839786, Token raus 31454, Runden 27 | 6 | **6** (5 Maengel + 1 zutreffende Beobachtung ohne Mangelcharakter) | 0 | 15,14 $ |
| 20.09.2026 | Diffpruefung M3 Startseite | **abgebrochen** (unerwarteter Fehler nach Modellkontakt (Exit 1)): Diff 773 Zeilen, Suchen 4, Lesungen 12, Token rein 68913, Token raus 8136, Runden 3 | — | — | — | mind. 0,59 $ |
| 20.09.2026 | Diffpruefung M3 Startseite (zweiter Versuch nach Ueberlast-Abbruch) | Diff 773 Zeilen, Suchen 45, Lesungen 36, Token rein 1574605, Token raus 27412, Runden 20 | 9 | **7** | 2 (eine als *blockierend* eingestufte Musterbehauptung, nachgemessen falsch; eine Zustandsbehauptung, die eine fremde Gegenprobe im Arbeitsbaum fuer den Repo-Stand hielt) | 8,70 $ |
| 20.09.2026 | Planpruefung M3-Haertung Spur A (Buendel: Papier + heutiger test_landing.js) | Diff 1021 Zeilen, Suchen 37, Lesungen 31, Token rein 1127792, Token raus 35652, Runden 15 | — | — | — | 6,71 $ |
| 20.09.2026 | Planpruefung M3-Haertung Spur B (Buendel: Papier + rendernder Test + Gate-Liste) | Diff 410 Zeilen, Suchen 21, Lesungen 21, Token rein 666439, Token raus 33316, Runden 8 | — | — | — | 4,33 $ |
| 20.09.2026 | Planpruefung Ladebestand-Nacharbeit Spur A (Buendel: Papier + Testdatei) | **abgebrochen** (unerwarteter Fehler nach Modellkontakt (Exit 1)): Diff 787 Zeilen, Suchen 33, Lesungen 39, Token rein 580260, Token raus 12499, Runden 10 | — | — | — | mind. 3,28 $ |
| 20.09.2026 | Planpruefung Ladebestand-Nacharbeit auf `kimi-k3` (ERSTER Versuch) | **abgebrochen** (HTTP 200, LEERE Antwort -- das Ausgabebudget von 20.000 ging vollstaendig ins Nachdenken, gemessen 121.875 Denkzeichen) | — | — | — | nicht bezifferbar (Kimi fehlt in der Preistabelle) |
| 20.09.2026 | Planpruefung Ladebestand-Nacharbeit auf `kimi-k3` (zweiter Versuch, Budget 60.000) | `finish_reason: stop`, 20.134 Antwortzeichen, 121.875 Denkzeichen; Buendel Papier + Testdatei, kein Repo-Lesewerkzeug | 9 | **3 klar getragen** (unerfuellbares Abnahmekriterium, ungemessene Idempotenz-Zusage, falscher Kopfkommentar); 2 ueberwiegend gefallen MIT tragendem Teil; 2 nicht einzeln nachgemessen; 2 waren Rechenschaft ohne Befundcharakter | 2 | nicht bezifferbar |
| 20.09.2026 | Diffpruefung Ladebestand-Nacharbeit | Diff 579 Zeilen, Suchen 24, Lesungen 27, Token rein 659200, Token raus 39225, Runden 8 | 11 (4 blockierend) | **4 selbst nachgemessen und getragen** (Text haengt an der Route statt am Schreibzustand; zweiter Pruefzeitpunkt faengt keinen No-op; erster ist fuer leere Mengen vakuos; vierter produktiver Leser nicht genannt) — die uebrigen entweder schon entschieden oder ohne Bauauftrag | 0 | 4,47 $ |
| 20.09.2026 | Diffpruefung ladebestand Runde 2 (N8-N11 + Geschwisterwaechter) | Diff 405 Zeilen, Suchen 53, Lesungen 30, Token rein 1580722, Token raus 29292, Runden 14 | 7 (2 als blockierend gemeldet) | **6 selbst nachgemessen und getragen** — davon DREI blockierend: `holeOderLegeAn()` schreibt `art` nach, ohne es dem Zaehler zu melden (eine VERSCHLECHTERUNG durch diesen Beitrag); der leere Ausstattungs-POST behauptet gespeicherte Antworten; und der schaerfste: die +100-Verfaelschung verschiebt nur den OFFSET, nicht die ZUORDNUNG — `MOD(reihenfolge,100) + 0 * $1` laesst den Sollindex ungeschrieben und ergibt **EXIT 0, 15 PASS / 0 FAIL** (selbst gemessen). Dazu: N10-Sollwert teilt die Array-Referenz mit der Produktion; Erfolgs-POSTs sind an HTTP 200 nicht von der Fehlerseite zu unterscheiden; drei Zaehlstellen ohne `rowCount` | 1 (der Vorwurf gegen das geweitete 700er-Fenster: die Kommentar-Kritik traegt, die behauptete Kollisionsgefahr nicht — die einzige andere Fundstelle liegt gezaehlt 36173 Zeichen entfernt) | 8,78 $ |
| 20.09.2026 | Planpruefung ladebestand Runde 3 Spur A (Repo-Lesezugriff, Schwerpunkt Route) | Diff 299 Zeilen, Suchen 42, Lesungen 25, Token rein 1023427, Token raus 27906, Runden 12 | 6 (4 blockierend) | **alle 6 selbst nachgemessen und getragen** — der entscheidende: mein geplantes `1000 - reihenfolge` waere gegen `LEAST(reihenfolge, 1000-reihenfolge) + 0 * $1` blind, waehrend das heutige `+100` sie faengt (in Postgres nachgerechnet: LEAST auf den umgekehrten Zustand gibt r zurueck, auf den verschobenen r+100). Ein Tausch der Luecke, kein strengerer Nachweis. Dazu: der Seitentitel steht AUSSERHALB von `ladeBestandFehlerinhalt()`; der N14-Kernfall wird von keiner der zwei geplanten Proben und nicht vom statischen Riegel erreicht; `true + undefined` ergibt NaN und `NaN > 0` ist false (gemessen); `ABBRUCH_MARKER` steht auf der generischen Fehlerseite gar nicht, richtig ist `<div class="error">`; die Reaktivierungsprobe belegt ihren Vorzustand nicht | 0 | 5,95 $ |
| 20.09.2026 | Planpruefung ladebestand Runde 3 Spur B auf `kimi-k3` (Buendel: Plan + Testdatei, effort max, 1676 s) | **unvollstaendig** (`status: incomplete`, `max_output_tokens`: 50.901 von 60.000 Ausgabe-Token gingen ins Nachdenken) -- die 9 Befunde kamen vollstaendig durch, die Rechenschaft am Ende nicht. Eingabe 26.983 Token | 9 | **7 selbst nachgemessen und getragen**, darunter DREI, die keine andere Spur hatte: die Zusicherung darf nicht an die eigene Testkonstante binden; der statische Riegel kann bei verlorener Bereichsmarke inhaltsleer gruen werden; und die KONSTANTE Verfaelschung (`= 1000`) statt meiner Umkehrung -- gemessen besser als meine eigene Fassung (`= 0`), weil 0 bei einem Geraet mit nur EINER Aufgabe ein legaler Sollwert waere | 2 (`syncAufgaben` schreibe im gezaehlten Fenster -- gemessen liegen alle Aufrufe DANACH; der Geschwisterwaechter trage den alten Satz -- gezaehlt genau zwei Fundstellen, keine davon dort) | nicht bezifferbar (Kimi fehlt in der Preistabelle) |
| 21.09.2026 | Diffpruefung ladebestand Runde 3 (Lesespur, Repo-Lesezugriff) | Diff 904 Zeilen, Suchen 47, Lesungen 32, Token rein 2073463, Token raus 23412, Runden 16 | 2 | **beide selbst nachgemessen und getragen.** R1 (blockierend): die Auslagerung nach `feuerloescherOhneProtokoll()` hat die statische Zusicherung von der AUFRUFSTELLE getrennt — `const alt = []` macht die Abloesung tot und laesst beide Testdateien gruen (55 PASS / 20 PASS); dass es vorher getragen haette, ist ebenfalls gemessen (das SQL-Literal kam auf 70d1489 genau einmal vor, in der Route selbst). R2: mein eigener Titel-Wortlaut ist zu absolut — der leere POST laeuft auf einem Studio, das bereits Feststellungen traegt | 1 (die `Eintraege`-Zusicherungen seien redundant — sie sind es nicht: der Volltext-Vergleich laeuft gegen eine TESTKONSTANTE und bliebe bei gemeinsamer Umformulierung gruen) | 11,07 $ |
| 23.09.2026 | Planpruefung Extrarunde ladebestand, Spur A (`gpt-5.6-sol`, Repo-Lesezugriff) | Papier 229 Zeilen, Suchen 59, Lesungen 43, Token rein 2721811, Token raus 31082, Runden 20 | 9 (5 blockierend) | **alle 9 selbst nachgemessen und getragen** (Einzelheiten `plaene/planpruefung-extrarunde-ladebestand.md`). Der wichtigste: `holeOderLegeAn` ist ein ZWEITER Schreibkanal, mein Papier nannte ihn Lese-Helfer; dazu Endhash als Anker unbrauchbar (nur aktive Zeilen, Teilspalten) und keine Bindung des Moduls an den Produktivpfad | 0 | 14,54 $ |
| 23.09.2026 | **A/B `gpt-6-sol`** gegen `gpt-5.6-sol`: dieselbe Planpruefung Extrarunde ladebestand, Papier, Auftrag, Wurzel und Stand wortgleich | Papier 229 Zeilen, Suchen 30, Lesungen 48, Token rein 1702560, Token raus 22528, Runden 19 | 8 | **8 selbst nachgemessen und getragen** (einer nur teilweise: Punkt 3 der Sammelliste bleibe offen, weil A3 wieder `maskiereKommentare` nutze). NUR diese Spur: der erste FAIL der A1a-Gegenprobe faellt am ALTEN Bereichswaechter statt am Anker; der `eingewiesen`-Arm ist tot (alle `eingewiesen`-Geraete sind `sammelblatt`); die B13/21-Gegenprobe erreicht die Restabfrage nur mit gezielt liegengelassenem Fremdrest. VERPASST gegenueber `gpt-5.6-sol`: die Strukturtests in `test_feature_brandschutz.js`, die der Umzug rot bzw. blind macht | 0 | 7,15 $ (halb so viel wie `gpt-5.6-sol`, 14,54 $) |
| 23.09.2026 | Diffpruefung Extrarunde ladebestand, Lesespur (`gpt-6-sol`, eigene Kopie `91f7a5e`, Diff ohne Golden Files) | Diff 3065 Zeilen, Suchen 31, Lesungen 46, Token rein 3731458, Token raus 31843, Runden 22 | 10 | **alle 10 nachgemessen und getragen** (Einzelheiten `plaene/diffpruefung-extrarunde-ladebestand.md`); die wichtigsten: „HTTP 200" ist kein Erfolg (generische Fehlerseite kommt mit 200), `import()` umgeht die Import-Erlaubnisliste, Szenariozahl ungesichert. Die beiden BLOCKIERENDEN des Tages (Zeitbombe, Zaehler-Zuweisung) fand die ausfuehrende Claude-Spur | 0 | 15,40 $ |
| 23.09.2026 | Planpruefung Verklemmung Studio-Lock, Spur A | **abgebrochen** (Ausgabemenge ueber dem Limit): Diff 73 Zeilen, Suchen 39, Lesungen 73, Token rein 1653936, Token raus 10510, Runden 16 | — | — | — | 6,77 $ |
| 23.09.2026 | Planpruefung Verklemmung Studio-Lock, Spur A (Wiederholung, Ausgabegrenze 1,6 MB) | Diff 73 Zeilen, Suchen 37, Lesungen 86, Token rein 3761267, Token raus 19751, Runden 25 | 6 | **6** (drei blockierend: neuer Kreis mit der Umbenennung, Korrektur-Durchschreiben, Probe unspezifisch samt literalem Lock-Inventar); Einzelheiten `plaene/planpruefung-verklemmung-studiolock.md` | 0 | 15,34 $ |
| 23.09.2026 | Planpruefung Verklemmung Studio-Lock, Spur B (`kimi-k3`, festes Auszugsbuendel) | 20.520 ein / 38.636 aus (32.420 Denken), 1255 s | 9 + Gesamturteil | **8 ganz, 1 teilweise**; das Gesamturteil „kein neuer Kreis" faellt an Material, das im Buendel FEHLTE (`routes/admin/geraete.js`), der Wartungs-Verdacht faellt an der `typ`-Bedingung | 1 | unbekannt |
| 23.09.2026 | Planpruefung Sperrordnung Fassung 2, Spur A (`gpt-6-sol`, Repo-Lesezugriff) | Diff 168 Zeilen, Suchen 67, Lesungen 77, Token rein 2529813, Token raus 22024, Runden 18 | 8 + 1 Anmerkung | **alle getragen** (F2-A1 als Grenze der Namenserkennung, heute kein Fehlfund); der schwerste: `auditAppend` OHNE Verbindung in `auditTx` haengt unsichtbar. Einzelheiten `plaene/planpruefung-verklemmung-studiolock.md` | 0 | 10,45 $ |
| 23.09.2026 | Planpruefung Sperrordnung Fassung 2, Spur B (`deepseek-v4-pro`, Buendel Kernmodule + Inventurskripte + Lock-Inventar-Test) | 35.051 ein / 34.745 aus (31.218 Denken), 712 s | 5 | **5** (F2-B1 als Praezisierung, F2-B4 als Grenze); nur bei B: Multimenge statt Zeilenmenge, Bindung des Verbindungsarguments | 2 mit Spur A | unbekannt |
| 23.09.2026 | Planpruefung S6 Generationszaehler, Spur A (`gpt-6-sol`, Repo-Lesezugriff) | Diff 171 Zeilen, Suchen 36, Lesungen 41, Token rein 1650341, Token raus 24759, Runden 18 | 10 | **10** (sieben blockierend: Stoerhelfer trifft `db.run` nicht, serieller Zweit-POST erreicht den Riegel nie, Sommerzeit im Altbestand, NULL-Zeiten, schlafendes Token nach Reaktivierung, dynamischer Import `S20-migrate.js`, JOIN an `SELECT *`); Einzelheiten `plaene/planpruefung-s6.md` | 0 | 6,97 $ |
| 23.09.2026 | Planpruefung S6 Generationszaehler, Spur B (`kimi-k3`, festes Buendel Einloese-/Erzeugerweg, Admin-Weg, Webhook, Schema) | 26.156 ein / 40.165 aus (31.978 Denken), 1062 s | 8 + 1 Zusatz | **8** (Zusatz „Deploy-Fenster" faellt: pm2 fork, 1 Instanz); nur bei B: Riegel 2 unbelegt, Verbotsliste Erzeuger, Totgeburt, Waechterregel | 4 mit Spur A | unbekannt |
| 23.09.2026 | Planpruefung H2 Cookie-Schleife, Spur A (`gpt-6-sol`, Repo-Lesezugriff) | Diff 68 Zeilen, Suchen 38, Lesungen 41, Token rein 1129355, Token raus 17972, Runden 17 | 9 | **9** (A1, A3, A5, A7 am Code gemessen: `returnTo` speichert schon anonym, `save`-Fehler ignoriert, „schon angemeldet" vor dem Marker, `/tablet/freischalten` legt Sitzungen an; Rest am Kontrollfluss); `plaene/planpruefung-h2.md` | 0 | 4,79 $ |
| 23.09.2026 | Planpruefung H2 Cookie-Schleife, Spur B (`kimi-k3`, festes Buendel Login-Weg, Auth, Sitzung, Freischaltweg, Service Worker) | 19.344 ein / 33.928 aus (27.317 Denken), 1010 s | 8 | **8**; nur bei B: Ziel als Query-Parameter, Freischalt-Fehler ohne Sitzung, Icon-Anfragen ueberschreiben das Ziel, Ueberwachung sieht 400 | 5 mit Spur A | unbekannt |
| 23.09.2026 | Planpruefung S6 Fassung 2, Spur A (`gpt-6-sol`, Repo-Lesezugriff) | Diff 123 Zeilen, Suchen 35, Lesungen 47, Token rein 1346828, Token raus 31715, Runden 15 | 11 | **11** (fuenf blockierend: zwei uebersehene Deaktivierer in den Webhook-Upserts, Gegenprobe Leser-Riegel logisch umgekehrt, Webhook-Gegenprobe faengt am Hausputz, Hausputz nach Commit verbraucht neue Tokens, Waisen-Token mit wiedervergebener ID); `plaene/planpruefung-s6.md` | 0 | 5,86 $ |
| 23.09.2026 | Planpruefung S6 Fassung 2, Spur B (`deepseek-v4-pro`, festes Buendel Anmelde-/Admin-/API-/Webhook-Wege, S20, Stoerhelfer, Migrationsmechanik) | 24.107 ein / 52.775 aus (49.777 Denken), 1020 s | 6 | **6** (vier decken sich mit Spur A; nur bei B: Vorbedingung am konkreten Token, Generation sinkt beim REPLACE-Import) | 4 mit Spur A | unbekannt |
| 23.09.2026 | Planpruefung H2 Fassung 2, Spur A (`gpt-6-sol`, Repo-Lesezugriff) | Diff 91 Zeilen, Suchen 55, Lesungen 62, Token rein 1545718, Token raus 17588, Runden 18 | 9 | **9** (zwei blockierend: bestehender Gate-Test verlangt das alte Verhalten, direkt gerenderte Sperrseite mit totem PIN-Formular); `plaene/planpruefung-h2.md` | 0 | 6,45 $ |
| 23.09.2026 | Planpruefung H2 Fassung 2, Spur B (`deepseek-v4-pro`, festes Buendel Auth-Kern, Login-Wege, Sitzung, Freischaltweg, Tests) | 17.889 ein / 23.435 aus (19.025 Denken), 492 s | 5 | **1** (Lebensdauer zu zwei Zeitpunkten messen); vier fallen, drei davon an Material, das im Buendel fehlte (Rolle `mitarbeiter` gibt es nicht, `requireTabletOrAdmin` ohne Aufrufer), einer an der Rahmentabelle ohne `studio_id` | 0 | unbekannt |
| 23.09.2026 | Diffpruefung Sperrordnung auditTx, Lesespur (`gpt-6-sol`, Repo-Lesezugriff auf den Zweig) | Diff 2841 Zeilen, Suchen 38, Lesungen 66, Token rein 2703689, Token raus 18979, Runden 18 | 6 | **5** (blockierend: Rotation mit `auditTx([])` — die Ordnung L vor FOR UPDATE bewacht niemand, Zeilen gelesen; Probe-Regex fuer N trifft auch den Tagesschluessel, Zeile gelesen; Inventur zaehlt leere Liste als L; No-op ungemessen; Bestellversand/Rotation als Kosten). Faellt: Fruehausstieg gegen laufende Retention (keine falsche Datenlage) | offen bis Claude-Spur | 11,10 $ |
| 23.09.2026 | Diffpruefung S6 Generationszaehler, Lesespur (`gpt-6-sol`, Repo-Lesezugriff auf den Zweig) | Diff 1735 Zeilen, Suchen 22, Lesungen 40, Token rein 1906077, Token raus 29310, Runden 14 | 11 | **10** + 1 teilweise (blockierend: Verbrauchs-UPDATE ohne Token-Generation; S20 nicht gegen Erzeuger serialisiert. Teilweise: Loeschweg-Rennen traegt nur als Kommentarbefund, der Waise ist tot). Einzelheiten `plaene/diffpruefung-s6.md` | offen bis Claude-Spur | 8,06 $ |
| 23.09.2026 | Planpruefung Pentest P1/P2 Fassung 1, Spur A (`gpt-6-sol`, Repo-Lesezugriff) | Papier 82 Zeilen, Suchen 68, Lesungen 94, Token rein 1991252, Token raus 16873, Runden 18 | 11 | **10** + 1 offen (blockierend: `:anlageId` fehlte — mein Musterfehler; gemeinsamer Admin-Router; Antwortform je Anfrage statt je Router; 265 keine Arbeitsliste; catch→500 bei Teilausfall). Einzelheiten `plaene/planpruefung-pentest.md` | — | 8,22 $ |
| 23.09.2026 | Diffpruefung Nachweis-unlink, Lesespur (`gpt-6-sol`, Repo-Lesezugriff auf den Zweig) | Diff 1864 Zeilen, Suchen 48, Lesungen 83, Token rein 2387078, Token raus 19096, Runden 18 | 8 | **8** (blockierend: `rm`/`rmSync`/`fsP.rm` unerkannt, drei reale Stellen darunter `storage-replica` mit DB-Loeschung nach gescheitertem `rm`). Einzelheiten `plaene/diffpruefung-unlink.md` | — | 9,83 $ |
| 23.09.2026 | Planpruefung Pentest P1/P2 Fassung 1, Spur B (`kimi-k3`), Bündel „Auszüge" | 80 KB; 25.497 ein / 37.379 aus (30.401 Denken), 1239,9 s | 10 | **7** + 2 teilweise + 1 offen (B1 und B7: Beispiele fallen, Regel trägt; B8 braucht `nginx -T`). Einzelheiten `plaene/planpruefung-pentest.md` | 0 | unbekannt |
| 23.09.2026 | Abnahme DeepSeek-Weg (`deepseek-v4-pro`, Funktionsprobe, keine Prüfung) | Diff 5 Zeilen, Suchen 3, Lesungen 2, Token rein 12271, Token raus 2709, Runden 4 | — | — (Funktionsprobe: Wert `0.20` nur über das Lesewerkzeug erreichbar, richtig genannt) | — | 0,03 $ |
| 23.09.2026 | Diffpruefung DeepSeek-Weg im Gegenleser — ERSTER Lauf ueber den neuen Weg (`deepseek-v4-pro`, effort max, Repo-Lesezugriff) | Diff 516 Zeilen, Suchen 13, Lesungen 17, Token rein 677613, Token raus 43268, Runden 10 | 11 | **10** (B1 Endpunkt-Zusicherungen gegen dieselbe Konstante; B2 „store:false wirksam" unbelegt — nachgemessen: DeepSeek meldet store:false auch bei store:true, Abruf 404 in beiden Faellen, Wirkung ueber die API NICHT messbar; B3–B11 Anmerkungen, alle am Quelltext bestaetigt) | 1 (B5: Preise stimmen, gegen die Preisseite gehalten) | 1,07 $ |
| 23.09.2026 | Diffpruefung S6 Runde 2 (Nacharbeit), `deepseek-v4-pro` effort max, Repo-Lesezugriff | Diff 1261 Zeilen, Suchen 10, Lesungen 27, Token rein 904408, Token raus 67401, Runden 8 | 6 | **6** (mittel: L3-Zusicherung misst nicht die Sperre; ungeschütztes Entwerten in zwei Zweigen). Einzelheiten `plaene/diffpruefung-s6.md` | 0 | 1,46 $ |
| 23.09.2026 | Planpruefung Pentest P1 Fassung 2, Spur A | **abgebrochen** (unerwarteter Fehler nach Modellkontakt (Exit 1)): Diff 89 Zeilen, Suchen 45, Lesungen 29, Token rein 401265, Token raus 46323, Runden 9 | — | — | — | mind. 0,71 $ |
| 23.09.2026 | Diffpruefung Nachweis-unlink Runde 2 (Nacharbeit 4/5), `deepseek-v4-pro` effort max, Repo-Lesezugriff | Diff 2179 Zeilen, Suchen 8, Lesungen 25, Token rein 1177422, Token raus 52278, Runden 12 | 6 | **6** (mittel: Wiederholungsanker in storage-replica ohne Wiederholung — tragende Begruendung des Diffs falsch). Einzelheiten `plaene/diffpruefung-unlink.md` | 0 | 1,76 $ |
| 23.09.2026 | Planpruefung Pentest P1 Fassung 2, Spur B (`kimi-k3`), Bündel „Mounts, Router, Verträge" | 52 KB; 17.729 ein / 34.074 aus (29.905 Denken), 1039 s | 8 | **7** (blockierend: gemeinsamer Admin-Router kann nicht 404 und 400 zugleich) | 1 (R2-B2: Gate schreibt in eine eigene Test-DB, nicht in Produktion — `test/run.sh` fehlte im Bündel) | unbekannt |
| 23.09.2026 | Diffpruefung Sperrordnung Runde 2 (`deepseek-v4-pro`, Buendel ueber /v1/chat/completions, Lauf 1: effort-Feld still ignoriert = high, max_tokens 64k) | 31.218 ein / 64.000 aus (62.187 Denken), 1327 s — ABGESCHNITTEN (finish_reason length), 3 Befunde lesbar | — | — | — | ~0,26 $ |
| 23.09.2026 | Diffpruefung Sperrordnung Runde 2, Lauf 2 (`deepseek-v4-pro`, `reasoning_effort: max`, max_tokens 200k) | 31.218 ein / 200.000 aus (ALLES Denken, 712.022 Zeichen), 1865 s — **KEINE ANTWORT** (Denkschleife bis ans Limit). Niemand hat geprueft. | — | — | — | ~0,79 $ |
| 23.09.2026 | Planpruefung Pentest P1 Fassung 2, Spur A (Wiederholung nach Stromabbruch) (`deepseek-v4-pro`, Repo-Lesezugriff) | Diff 89 Zeilen, Suchen 42, Lesungen 44, Token rein 1839414, Token raus 60908, Runden 19 | 12 | **12** (blockierend: = Kimi R2-B1; neu u. a. Autostart von server.js im Test, Leseprobe wirkungslos, Identitaet statt Existenz). Einzelheiten `plaene/planpruefung-pentest.md` | 0 | 2,67 $ |
| 23.09.2026 | Diffpruefung Sperrordnung Runde 2 (Nacharbeit), Werkzeugweg (`deepseek-v4-pro`, Repo-Lesezugriff) | Diff 1096 Zeilen, Suchen 13, Lesungen 38, Token rein 1827678, Token raus 53218, Runden 19 | 5 | **5** (mittel: Inventur zaehlt FOR UPDATE als Schreibanweisung). Einzelheiten `plaene/diffpruefung-sperrordnung.md` | 0 | 2,62 $ |
| 23.09.2026 | Diffpruefung Nachweis-unlink Runde 3 (Nacharbeit 6) (deepseek-v4-pro) | Diff 1253 Zeilen, Suchen 10, Lesungen 25, Token rein 898698, Token raus 64687, Runden 10 | 8 | **8** (A1 als blockierend gemeldet, nachgemessen mittel: Wiederholungsweg ohne Statusklausel gegen Neu-Upload; P1 Sollwert aus dem Bewachten). Einzelheiten `plaene/diffpruefung-unlink.md` | 0 | 1,44 $ |
| 23.09.2026 | Diffpruefung Pentest P1 (deepseek-v4-pro) (deepseek-v4-pro) | Diff 2294 Zeilen, Suchen 24, Lesungen 23, Token rein 1195781, Token raus 67569, Runden 11 | 11 | **11** (sollte: `fetch` ohne Accept bekommt HTML-400 — eine Geschwisterstelle selbst gefunden; Mount-Zusicherung prüft die Liste statt den Stack; Pfadregel der JSON-Erkennung ungeprüft; Validierungs-Regex ohne Reihenfolge). Einzelheiten `plaene/diffpruefung-pentest-p1.md` | 0 | 1,85 $ |
| 23.09.2026 | Diffpruefung Nachweis-unlink Runde 4 (Nacharbeit 7) (deepseek-v4-pro) | Diff 850 Zeilen, Suchen 18, Lesungen 27, Token rein 2460084, Token raus 58545, Runden 26 | 7 | **7** (R4-B1: `processReplica()` überschreibt den Löschauftrag ohne Statusklausel — Worker läuft rund um die Uhr; R4-B2: Neu-Upload auf `loeschen_offen` verpufft bis zu 24 h oder für immer). Führte zum Umbau „Löschauftrag als eigene Zeile“. Einzelheiten `plaene/diffpruefung-unlink.md` | 0 | 3,48 $ |
| 23.09.2026 | Planpruefung unlink Loeschauftrag Spur A (deepseek-v4-pro) (deepseek-v4-pro) | Diff 70 Zeilen, Suchen 20, Lesungen 31, Token rein 970063, Token raus 41802, Runden 16 | 17 | **17** (blockierend: Waise bei Absturz zwischen Schreiben und UPDATE; Prüfsummensperre/`db.js`-Deklaration). Einzelheiten `plaene/planpruefung-unlink-loeschauftrag.md` | 0 | 1,45 $ |
| 23.09.2026 | Planpruefung unlink Loeschauftrag Runde 2 Spur A (deepseek-v4-pro) (deepseek-v4-pro) | Diff 103 Zeilen, Suchen 13, Lesungen 32, Token rein 1808925, Token raus 64288, Runden 21 | 12 | **12** (blockierend: Reaper räumt `vorbelegt` vor dem Schreiben ab; Verzahnung mit der Studio-Löschung; Startabbruch durch `core/migrate.js` bei ersetzter 0060). Einzelheiten `plaene/planpruefung-unlink-loeschauftrag.md` Runde 2 | 0 | 2,64 $ |
| 23.09.2026 | Diffpruefung Pentest P1 Runde 2 (deepseek-v4-pro) (deepseek-v4-pro) | Diff 1595 Zeilen, Suchen 34, Lesungen 51, Token rein 3364940, Token raus 85730, Runden 24 | 6 | **6** (sollte: DB-Zähler sieht `getConfig` nicht — Zusicherung sagt mehr als sie misst; Drossel fällt bei voller Tabelle aus, Fehler aus MEINER Vorgabe). Einzelheiten `plaene/diffpruefung-pentest-p1.md` Runde 2 | 0 | 4,78 $ |
| 23.09.2026 | Diffpruefung Nachweis-unlink Runde 5 Umbau Loeschauftrag (deepseek-v4-pro) (deepseek-v4-pro) | Diff 2598 Zeilen, Suchen 12, Lesungen 30, Token rein 1704818, Token raus 60623, Runden 13 | 6 | **6** (blockierend: Teil-Datei bei Schreibabbruch ohne Anker, von beiden Spuren; still verlorene Löschpflicht bei DB-Fehler in Weg 2; Offboarding-Reaper gegen lebendes Studio). Einzelheiten `plaene/diffpruefung-unlink.md` Runde 5 | 0 | 2,49 $ |
| 23.09.2026 | Diffpruefung Pentest P1 Runde 3 (deepseek-v4-pro) (deepseek-v4-pro) | Diff 1363 Zeilen, Suchen 17, Lesungen 40, Token rein 1156061, Token raus 60082, Runden 12 | 7 | 7 (alle klein: Logzeile widerspricht ihrem Kommentar, `every` auf leerer Menge, zwei Sollwerte aus dem bewachten Modul, SQL-Zusicherung schwächer als ihr Name, Selbstprobe behauptet „erste Zuweisung", `ok` im `finally` ohne `catch`). Einzelheiten `plaene/diffpruefung-pentest-p1.md` Runde 3 | 0 | 1,76 $ |
| 23.09.2026 | Diffpruefung unlink Runde 6 (deepseek-v4-pro) (deepseek-v4-pro) | Diff 940 Zeilen, Suchen 4, Lesungen 22, Token rein 880935, Token raus 66507, Runden 11 | 5 | 5 (einzig von dieser Spur: gleichzeitige Deprovisionierungen teilen sich den Queue-Eintrag; Status-UPDATEs im Fehlerweg ohne eigenes `try/catch`). Einzelheiten `plaene/diffpruefung-unlink.md` Runde 6 | 0 | 1,43 $ |
| 23.09.2026 | Diffpruefung unlink Runde 6 Spur K (kimi-k3, Bündel 249 KB, effort high) | Bündel 78.975 Token ein, 37.222 aus, 949 s | 5 | 5 (Kern-Vorschlag: `db.tx` weiss, ob COMMIT gesendet wurde — der Fehlerweg soll das nutzen statt nachzumessen) | 0 | — (keine Preisgrundlage im Repo) |
| 23.09.2026 | Planpruefung unlink Nacharbeit 9 (deepseek-v4-pro), ERSTER Versuch | abgebrochen durch Container-Neustart (22:0x UTC), keine Ausgabe | — | — | — | unbekannt (angefallen, nicht messbar) |
| 23.09.2026 | Planpruefung unlink Nacharbeit 9 (deepseek-v4-pro) + Spur K (kimi-k3), ZWEITER Versuch | beide abgebrochen durch Container-Neustart (22:40 UTC, nach ~23 min), keine Ausgabe | — | — | — | unbekannt (angefallen, nicht messbar) |
| 24.09.2026 | Planpruefung unlink Nacharbeit 9 (deepseek-v4-pro) (deepseek-v4-pro) | Diff 59 Zeilen, Suchen 30, Lesungen 27, Token rein 2363994, Token raus 46827, Runden 29 | 9 | 8 (einzig von dieser Spur: `test_deprovision.js` und der statische Wächter `test_feature_audit2_batchB_static.js` pinnen das alte Dateiformat; Nicht-Objekt-Test in sloppy mode blind). Einzelheiten `plaene/planpruefung-unlink-loeschauftrag.md` | 1 | 3,31 $ |
| 23.09.2026 | Planpruefung unlink Nacharbeit 9 Spur K (kimi-k3, Buendel 117 KB, effort high), dritter Versuch | Bündel 36.553 Token ein, 36.191 aus, 890 s | 11 | 9 (einzig von dieser Spur: Pfad-Guard-Test wird vakuös; R6-2-Szenario braucht dasselbe Studio; Kennung vor `db.tx`; nicht aufzählbare Kennzeichnung). Einzelheiten `plaene/planpruefung-unlink-loeschauftrag.md` | 2 | — (keine Preisgrundlage im Repo) |
| 24.09.2026 | Diffpruefung unlink Runde 7 Spur D (deepseek-v4-pro, Buendel 320 KB, effort high, /v1/chat/completions) | Bündel 102.115 Token ein, 37.548 aus, 421 s | 2 | 1 (Queue-Schreibfehler in der Transaktion ohne Abbruch) | 1 (Alteinträge ohne `erstellt` gibt es nicht) | — (nicht vom Werkzeug erfasst) |
| 24.09.2026 | Diffpruefung unlink Runde 7 Spur K (kimi-k3, dasselbe Buendel, effort high) | Bündel 103.024 Token ein, 27.117 aus, 778 s | 4 | 4 (nicht atomares Neuschreiben, gemeinsam mit C; Umbenennen überschreibt Beweisdatei; Hauptserver unbelegt; abgelehntes COMMIT konservativ) | 0 | — (keine Preisgrundlage im Repo) |
| 24.09.2026 | Diffpruefung unlink Runde 8 (deepseek-v4-pro) (deepseek-v4-pro) | Diff 364 Zeilen, Suchen 9, Lesungen 22, Token rein 1185497, Token raus 50320, Runden 16 | 8 | 8 (mit C gemeinsam: dauerhafter Lesefehler bleibt stumm offen — blockierend; Abbruch nur als generischer 500er. Einzig: `cleanup_pending` ins Leere, zwei zu schwache Test-Zusicherungen, Seed-Skript). Einzelheiten `plaene/diffpruefung-unlink.md` Runde 8 | 0 | 1,76 $ |
| 24.09.2026 | Diffpruefung unlink Runde 9 (deepseek-v4-pro) (deepseek-v4-pro) | Diff 801 Zeilen, Suchen 17, Lesungen 29, Token rein 831519, Token raus 76466, Runden 8 | 8 | 7 (einzig: `queue_fehlt` fehlt in ok:false-Rückgaben; falsche Logzeile nach Verzeichnis-fsync; zwei nie fallende Teilklauseln; `new URL("")`). Einzelheiten `plaene/diffpruefung-unlink.md` Runde 9 | 1 (Merker-Zusicherung im Route-Test sei nicht falsifizierbar — dort rot gemessen) | 1,40 $ |
| 24.09.2026 | Diffpruefung unlink Runde 10 (deepseek-v4-pro), abschliessend, eine Spur | Diff 458 Zeilen, Suchen 25, Lesungen 28, Token rein 2910032, Token raus 66199, Runden 26 | 6 | 5 (zwei Rückschritte durch Nacharbeit 12: gestrichene S35-Klauseln — Ursache MEIN Auftrag nach ungemessenem R9-9 —, ENOENT verdeckt hängenden Symlink; `s31b` fehlt im Aufräummuster; `queueDateiLesbar` prüft nur Parsbarkeit; 503 ohne `queue_fehlt`). Einzelheiten `plaene/diffpruefung-unlink.md` Runde 10 | 1 (TG-Zusicherung tautologisch — `dotenv` in `server.js:3` füllt nach; daraus ein neuer Punkt) | 4,10 $ |
| 24.09.2026 | Diffpruefung unlink Runde 10 (deepseek-v4-pro) (deepseek-v4-pro) | Diff 458 Zeilen, Suchen 25, Lesungen 28, Token rein 2910032, Token raus 66199, Runden 26 | — | — | — | 4,10 $ |
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
| 18.09.2026 | **PLANpruefung** Upload-Haertung Beitrag 2 (U1+U2), vor der ersten Bau-Runde | Auftragspapier + 6 Dateien (Kernmodul, globaler Handler, `routes/lageplan.js` ganz, 3 Waechter), **gezaehlt** 79.520 Token rein / 12.696 raus (9.840 Denken), `xhigh` | 9 (2 blockierend) | **9** | 0 | n. e. (Schluessel ohne `api.usage.read`) |

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

## Planpruefung 18.09.2026 — erster Lauf, bei dem ALLE Befunde trugen

**Neun Befunde, neun nach eigener Nachmessung getragen, null gefallen.** Das
ist bisher einmalig; am 13.09. fielen zwei von sechs, am 12.09. drei von neun.
Eine Erklaerung dafuer draengt sich auf, ist aber NICHT gemessen: geprueft
wurde ein PLAN, kein Diff — an einem Plan gibt es keine Implementierung, deren
Details man falsch raten kann. Wer daraus eine Regel macht, misst es an einem
zweiten Plan.

**Zwei Befunde widerlegten den Entwurf selbst**, und beide an Stellen, an
denen ich mir sicher war:

- Der geplante Filter `req.complete === false` haette ECHTE Serverfehler
  verschluckt. Selbst nachgemessen an einem laufenden, NICHT abgebrochenen
  Upload: `complete:false, aborted:false, destroyed:false`. Das war genau die
  offene Frage, die ich dem Pruefer ausdruecklich gestellt hatte — die Antwort
  fiel gegen mich aus.
- Meine WAECHTERKARTE war falsch. Ich hatte `test_feature_error_tracking.js`
  als „bewacht ausschliesslich die Signatur-Schwaerzung" eingetragen;
  nachgemessen ruft sie das echte `melde()` an sieben Stellen und prueft
  `senden` (12x), `unterdrueckt` (6x), `_state`, Drossel und `baueText`. Mein
  grep-Muster hatte nur einen Ausschnitt erfasst, und `grep telegram` -> 0
  Treffer hatte ich als „keine Verhaltensabdeckung" gelesen. Ein negatives
  Ergebnis ohne Positivkontrolle.

**Ein Befund war nach eigener Messung SCHWERER als gemeldet.** Der Pruefer
meldete, ein ausgenommener Abbruch verbrauche den Drossel-Sendeplatz. Gemessen
stimmt das (`senden:true`, danach `senden:false, unterdrueckt:1`,
`DROSSEL_MS = 900000` = 15 Minuten) — und die Signatur traegt KEINE studio_id
(`Error:POST /u` fuer Studio 1 und 99 identisch). Ein Abbruch in einem Studio
haette also echte Fehler ANDERER Studios auf derselben Route 15 Minuten stumm
geschaltet. Das stand so nicht im Befund.

**Ein Befund wandte unsere eigene Hausregel auf unseren eigenen Waechter an:**
`test_feature_keine_stillen_fehler.js` vergleicht `alle.length` gegen
`OBERGRENZE = 60` — eine ZAHL. Wird ein leerer catch entfernt und andernorts
einer hinzugefuegt, bleibt der Lauf gruen. „Eine Zusicherung ueber eine ZAHL
ist keine ueber eine MENGE" steht seit dem 13.09. in der CLAUDE.md; auf diesen
Waechter hatte sie niemand angewandt.

**Was der Lauf NICHT geleistet hat:** die Einordnung. Der Pruefer meldete den
Telegram-Befund als blockierend; erst die eigene Messung zeigte, dass die
Erreichbarkeit aus dem Repo gar nicht entscheidbar ist (der Hand-Deploy liegt
auf dem Server, und die CLAUDE.md belegte ihn mit einer Datei, die es nicht
gibt). Aus „blockierend" wurde damit „latente Waffe, kein belegter laufender
Schaden". Das Nadeloehr bleibt das eigene Nachmessen, nicht das Finden.

## Runde 2 am 18.09.2026 — und ein Befund am WERKZEUG selbst

Diese Runde lief über `tools/gegenleser-repo.js` statt über einen direkten
Aufruf, wegen des Repo-Lesezugriffs: **30 Suchen, 40 Lesungen, 909.495
Eingabe-Token über 13 Runden** gegen 79.520 Token beim handgebündelten Lauf
derselben Sache am Vormittag. Der Prüfer holt sich also gut das Zehnfache an
Material — und fand damit einen BESTANDSBEFUND, den niemand im Bündel gehabt
hätte (`POST /api/position` prüft die Zugehörigkeit der `etage_id` nicht).

**Das Werkzeug setzt die Zielkonfiguration NICHT um.** Gemessen am Quelltext:
`anfragen()` (Zeile ~510) baut genau vier Felder — `model`, `input`, `tools`,
`max_output_tokens`. Es gibt nur EINEN Aufrufpfad (Zeile 1083), und `effort`
wird nirgends aus argv gelesen. Es fehlen also `store: false`,
`reasoning.effort`, `truncation`, `stream`, die erzwungene Ausgabeform und
`metadata`.

**Zwei Folgen, beide unangenehm:**

1. **`store` fehlt, und die Voreinstellung ist `true`** — gemessen mit
   Gegenprobe in beide Richtungen: ohne das Feld ist eine Antwort hinterher
   über `GET /v1/responses/<id>` abrufbar, mit `store: false` nicht. Jeder
   Lauf über dieses Werkzeug liegt damit auf fremden Servern, und zwar
   ausgerechnet der materialreichste. Das widerspricht der Entscheidung vom
   12.09.2026 unmittelbar.
2. **Eine frühere Zeile dieser Tabelle war dadurch FALSCH BESCHRIFTET.** Sie
   trug „effort `xhigh` — erster Lauf auf dieser Stufe" und war an ihren
   Metriken (Suchen 73, Lesungen 49) erkennbar ein Werkzeug-Lauf; das
   Werkzeug kann diese Stufe aber gar nicht setzen. Die Beschriftung kam aus
   `--zweck=`, also von mir. Berichtigt.

Das ist die Klasse „ein Kommentar behauptet eine Begründung, die es nicht
gibt" — hier in einem MESSPROTOKOLL, wo sie besonders teuer ist: eine Zeile,
die eine Einstellung behauptet, die nicht gesetzt war, entwertet jeden
späteren Vergleich über diese Einstellung.

## Sicherheitslauf 18.09.2026 — der teuerste Lauf bisher, und er hat geliefert

**3.646.637 Eingabe-Token über 26 Runden, 86 Suchen, 95 Lesungen.** Das ist
das 46-fache des handgebündelten Laufs vom selben Tag (79.520) und weit über
allem bisherigen. Anlass war die Betreiber-Weisung „versuche mit allen Mitteln
Lücken zu finden und zu schliessen".

**Drei Befunde, alle drei selbst nachgemessen, alle drei getragen:**

- **F1** `POST /api/position` — `etage_id` aus dem Body ungeprüft. War bereits
  aus der Planprüfung bekannt; hier unabhängig bestätigt.
- **F2 — NEU:** `POST /admin/belehrungen/freischalten/:belehrungId` nimmt
  BEIDE Fremd-IDs ungeprüft (`mitarbeiter_id` aus dem Body, `belehrungId` aus
  dem Pfad) und schreibt sie in einen Upsert. `belehrung_freischaltung` hat
  **keinen** Fremdschlüssel auf Mitarbeiter oder Belehrungen — auch nicht
  existierende IDs gehen durch.
- **F3** Anmerkung: `ausmusterungToken.beanspruche()` setzt
  `eintrag.verbraucht = true`, BEVOR `daten.studioId !== req.studioId` geprüft
  wird. Wer einen fremden Token kennt, kann ihn entwerten.

**Was den Lauf trägt, ist nicht die Zahl der Befunde, sondern WELCHE.** F2 ist
genau die Stelle, die meine eigene Textsuche ZWEIMAL als „in Ordnung"
abgehakt hatte — aus demselben Grund wie bei F1: `studio_id` steht dort, aber
als EINGESETZTER Wert im INSERT, nicht als Prüfung. Eine Mustersuche kann
diese Klasse nicht sehen; sie ist eine Frage nach dem Kontrollfluss.

**Die Einordnung kam wieder vom eigenen Nachmessen, nicht aus dem Bericht** —
wobei der Prüfer diesmal selbst sehr vorsichtig eingestuft hat (er nennt bei
jedem Befund ausdrücklich, was der Angreifer NICHT erreicht). Nachgemessen
gilt: keine der drei erlaubt das LESEN fremder Daten, und bei F2 ist
`studio_id` Teil des Konfliktschlüssels, also gibt es kein Schreiben in fremde
Zeilen. Es bleibt Datenintegrität, kein Datenabfluss.

## 18.09.2026 — DREI Läufe am selben Deckel gescheitert, alle ohne Bericht

Drei Sicherheitsläufe über den BESTAND (Einschleusung, Anmeldung/Sitzung,
Datenabfluss) brachen **alle drei** mit derselben Meldung ab:

    ABBRUCH: Gesamtausgabemenge ueber 614400 Bytes (620900 / 615640 / 616114)
    — der Bericht ist UNVOLLSTAENDIG.

**Nach unserer Hausregel haben sie NICHTS geliefert, nicht „keine Befunde".**
Die Kosten sind trotzdem angefallen; die Zeilen oben tragen deshalb Striche,
keine Null.

**Die Ursache ist zweiteilig, und der zweite Teil ist meiner:**

1. **Das Werkzeug ist für DIFFS gebaut.** `MAX_AUSGABE_BYTES` deckelt die
   Summe aller gelesenen Ausschnitte auf 600 KiB — für einen Diff reichlich,
   für eine Bestandssuche über 500 Dateien zu knapp. Der Prüfer las 36+
   Dateien und war noch nicht fertig. Jetzt über
   `GEGENLESER_MAX_AUSGABE_BYTES` hebbar, Voreinstellung unverändert
   (Gegenprobe: mit Variable 2.500.000, ohne 614.400).
2. **Mein Auftrag war zu breit.** Lauf A sollte VIER Klassen auf einmal prüfen
   (SQL, Kommandos, Pfade, HTML-Ausgabe). Das ist dieselbe Krankheit wie ein
   überladenes Bündel: er verausgabt sich, bevor er berichten kann. Aufgeteilt
   in A1 (SQL + Kommandos) und A2 (Pfade + HTML).

**Was die Fehlläufe trotzdem gezeigt haben** — als Hinweis, nicht als
Ergebnis: Lauf C hatte die beiden bekannten Pfad-Lecks (`routes/wartung.js`,
`routes/admin/geraete.js`) bereits erwähnt, bevor er abbrach. Die
Positivkontrolle im Auftrag trägt also. Lauf B hatte die Anmelde-Sperre zum
Abbruchzeitpunkt NICHT erwähnt — dort ist offen, ob der Auftrag trägt.

**Lehre für den nächsten Bestandslauf:** EINE Klasse je Lauf, Deckel vorher
heben, und die Positivkontrolle in den Auftrag schreiben — sonst ist ein
Abbruch nicht von einem sauberen Ergebnis zu unterscheiden.

## 18.09.2026, abends — der Gegenleser ist NICHT MEHR ERREICHBAR (Guthaben)

**Gemessen, nicht vermutet:** Die Läufe C (Wiederholung) und A2 endeten mit

    HTTP 429: {"error":{"message":"You have no credits remaining. …",
               "type":"insufficient_quota","code":"credit_balance_exhausted"}}

Das ist KEIN Mengenlimit und kein Egress-Abbruch, sondern ein leeres
OpenAI-Konto. Die Unterscheidung ist wichtig, weil die beiden früheren
Abbrüche desselben Tages eine ganz andere Ursache hatten (Ausgabedeckel) und
eine andere Abhilfe brauchten.

**Was das für die Arbeitsweise heisst, solange kein Guthaben nachgelegt ist:**

- Die Vorgabe „der PLAN geht VOR der ersten Bau-Runde an den Gegenleser"
  (18.09.2026, Punkt 1) ist nicht erfüllbar. Sie hat einen eingebauten
  Ausweg — „wer ihn auslässt, schreibt in EINEN Satz dazu, warum" —, und
  dieser Satz lautet ab jetzt: *Gegenleser nicht erreichbar, HTTP 429
  insufficient_quota.* Er gehört in denselben Zwischenstand wie die
  Suite-Zahlen.
- Die zweite Prüfspur fällt damit weg. Übrig bleiben die Claude-Review über
  den Diff, der Review-Bot am PR und das eigene Nachmessen. Am 13.09.2026 ist
  gemessen, dass die beiden Spuren NULL Überschneidung hatten — der Wegfall
  kostet also eine ganze Klasse, nicht nur Redundanz. Das ist zu benennen,
  nicht zu kaschieren.
- **Kosten des Tages, damit die Entscheidung über das Nachlegen auf Zahlen
  steht:** sieben Bestandsläufe, davon drei am Ausgabedeckel und zwei am
  Guthaben abgebrochen. Summe der geschätzten Kosten dieser sieben Zeilen:
  rund 207 $. Zwei davon (A1 und B) haben einen vollständigen Bericht
  geliefert, zusammen 14 Befunde.

**Was die beiden vollständigen Läufe geliefert haben** (Einzelheiten und der
Stand des eigenen Nachmessens stehen in `plaene/STAND.md`, nicht hier):

- **A1 (SQL und Kommandos):** keine Einschleusung gefunden, mit
  Positivkontrolle in beide Richtungen (eine korrekt parametrisierte Abfrage
  und eine korrekte `execFile`-Stelle wörtlich benannt). Der Wert des Laufs
  liegt woanders: er hat eine **Zusicherung gefunden, die nicht rot werden
  kann** — ein Test behauptet wörtlich, die Argumentliste beweise, „dass GAR
  KEINE Shell mehr beteiligt ist", prüft aber `opts.shell` nicht. Selbst
  nachgemessen am Quelltext: `leseZipAufruf()` sieht nur Programmname,
  `-j`, ZIP-Pfad und `opts.cwd`. Der statische Geschwisterwächter sucht
  ebenfalls nur `exec`/`execSync`, nicht die Shell-Option.
- **B (Anmeldung, Sitzung, Token):** die eingebaute Positivkontrolle trägt —
  die bekannte Anmelde-Sperre wurde diesmal gefunden und wörtlich belegt
  (`routes/auth.js:49–50`, studioscharfe Schlüssel, Advisory Lock). Beim
  Abbruch am Vormittag hatte derselbe Auftrag sie NICHT erwähnt; der Auftrag
  war also in Ordnung, der Lauf war zu früh zu Ende.

## 18.09.2026, nach dem Nachlegen des Guthabens — was die PLANPRÜFUNG leistet

**Die Regel „der Plan geht VOR der ersten Bau-Runde raus" steht seit dem
10.09.2026 in der CLAUDE.md und war bis heute fast nie befolgt.** An diesem
Abend wurde sie zum ersten Mal für zwei Beiträge hintereinander angewandt.
Ergebnis, zählbar:

| Lauf | Befunde | nach eigener Nachmessung getragen | davon blockierend |
|---|---|---|---|
| Planprüfung Mandantengrenze | 6 | **6** | 1 |
| Planprüfung Zusicherung/qpdf | 5 | **5** | 2 |

**Elf von elf getragen, null gefallen.** Das ist die höchste Trefferquote, die
in dieser Datei steht — und der Grund ist strukturell, nicht Glück: ein Papier
behauptet mehr als ein Diff. Es enthält Begründungen, Vorbilder,
Abgrenzungen und Testkonzepte, und jede dieser Aussagen ist prüfbar, bevor
sie Code geworden ist.

**Drei der elf haben eine BEHEBUNG widerlegt, nicht einen Befund** — das ist
die teuerste Sorte, weil sie sonst erst nach dem Bauen auffällt:

1. Mein Testkonzept für `POST /freischalten/:belehrungId` verlangte drei
   Zusicherungen. Die Route hat aber ZWEI unabhängig wählbare Ziel-IDs. Eine
   Attrappe von einer Zeile — `const bel = { id: req.params.belehrungId };` —
   hätte alle drei grün gelassen und die Grenze „eigener Mitarbeiter, fremde
   Belehrung" offen. Die Prüfung lieferte den Einzeiler wörtlich mit.
2. Mein qpdf-Riegel wies ein führendes `-` ab und behauptete, das mache die
   qpdf-Fassung gleichgültig. qpdf liest Argumente aus Dateien über
   `@dateiname` — der Riegel hätte daran vorbeigegriffen.
3. Mein geplanter statischer Shell-Wächter durfte die mehrzeilige
   Schreibweise als „benannte Grenze" offenlassen. Dazu übersah er einen
   Alias, der im Bestand SCHON STEHT (`promisify(execFile)` in
   `routes/health-intern.js`).

**Was das NICHT hergibt:** zwei Läufe an einem Abend. Die Quote 11/11 ist eine
Beobachtung, keine Statistik, und beide Papiere stammen vom selben Verfasser
am selben Tag — ein Verfasser, der schon müde war, macht womöglich mehr
Fehler als üblich. Wer sich darauf beruft, nennt diese Einschränkung mit.

**Was es SEHR WOHL hergibt:** Die Kosten. Die beiden Planprüfungen zusammen
kosteten 57,45 $. Eine einzige Bau-Runde des Executers für Beitrag 2a hat
431.277 Token und 270 Werkzeugaufrufe gebraucht. Drei der elf Befunde hätten
je eine solche Runde ausgelöst.

### Eine Beobachtung zur Arbeitsteilung, die neu ist

Bei zwei Befunden dieses Abends ist meine EIGENE Nachmessung über den Bericht
hinausgegangen — nicht gegen ihn, sondern weiter:

- Der Prüfer nannte **zwei** rohe Ausgabestellen des Kategorie-Symbols. Eine
  Vollerhebung aller 18 `.symbol`-Stellen fand eine **dritte**, und
  ausgerechnet die folgenreichste: den „Jetzt fällig"-Block der Startseite,
  also jeden Benutzer statt nur die Admins.
- Beim Gate-Befund nannte der Prüfer den Weg. Die Frage, ob die
  Endungs-Ausnahme überhaupt gebraucht wird, hat erst die eigene Messung der
  Mount-Reihenfolge beantwortet — und sie hat die Behebung von „Muster
  verschärfen" auf „Zeile löschen" gedreht.

Das ist dieselbe Trennung wie am 13.09.2026, nur andersherum: **der Prüfer
findet den Zustand, die eigene Messung findet seinen Umfang.** Wer nur den
Bericht umsetzt, baut beide Male das Richtige — aber zu klein.


## 18.09.2026, spaeter Abend — die Planpruefung steht jetzt bei 17 von 17

Nach zwei weiteren Laeufen (Gate-Beitrag als PLAN, Upload-Beitrag 2a als
fertiger CODE) sieht die Bilanz des Abends so aus:

| Lauf | Art | Befunde | getragen | blockierend |
|---|---|---|---|---|
| Mandantengrenze | Plan | 6 | 6 | 1 |
| Zusicherung/qpdf | Plan | 5 | 5 | 2 |
| Gate/XSS/Dekodierung | Plan | 6 | 6 | 2 |
| Upload-Haertung 2a | Code | 6 | 6 | 1 (+1 Regress) |

**23 Befunde, 23 getragen, null gefallen.** Vier von ihnen widerlegten eine
BEHEBUNG statt eines Befunds, zwei einen Satz, der in meinem Papier als
Tatsache stand.

**Der teuerste eigene Fehler des Abends steht im Gate-Papier** und ist ein
Lehrbuchfall aus dieser Datei: Ich hatte behauptet, keine dynamische Route
ende auf eine Asset-Endung — gesucht hatte ich nach Routen-LITERALEN. Die
Grundriss-Auslieferung traegt die Endung im PARAMETER
(`tabletRouter.get("/grundriss/:datei")`, Dateien `etage_<id>_<uuid>.jpg`).
Die Regel „erst das Muster an einer bekannten Fundstelle LERNEN, dann damit
suchen" steht seit dem 18.09. vormittags in der CLAUDE.md, aufgeschrieben
nach drei Fehlschlaegen derselben Art am selben Tag. Sie hat mich am selben
Abend ein viertes Mal erwischt.
Das Ergebnis der Nachmessung war am Ende guenstig (die einbindenden Seiten
liegen selbst hinter dem Gate, die Ausnahme ist dort ein zweites Leck) — aber
das war Glueck, nicht Methode.

**Zwei Befunde haben die SCHWERE erhoeht, nicht nur die Begruendung:**

- Der Gate-Befund betrifft auch einen SCHREIBWEG (`POST /module/seil-foto/
  123.jpg` schreibt Datei und DB-Zeile ohne PIN). Fassung 1 nannte nur
  Lesewege. Ein Waechter, der nur Statuscodes prueft, haette das nicht
  gefangen — er muss null SCHREIBAUFRUFE verlangen.
- Der Upload-Beitrag hatte einen REGRESS, den weder der Ausfuehrende noch ich
  gesehen hatten: `ENAMETOOLONG` bei einem 244 Zeichen langen Dateinamen ist
  weder MulterError noch Filtertext, geht also ab 2a an `next(err)` — aus
  einer Fehlerseite wird HTTP 500 mit Telegram-Alarm, ausgeloest durch eine
  Benutzereingabe. Selbst nachgerechnet: 27 Byte Praefix + 244 = 271 gegen
  die 255-Byte-Grenze.

**Und ein Befund war wortwoertlich fatal:** „die Regex-Zeile entfernen" haette
ein haengendes `||` hinterlassen — Syntaxfehler. Eine Anweisung, die man
woertlich befolgen soll, muss woertlich stimmen.


## Nachtrag zum 18.09.2026 — der Lauf, der eine MELDUNG an den Betreiber widerlegt hat

Die Planprüfung zur Fotolöschung ist der fünfte Lauf des Abends und bringt
die Bilanz auf **29 Befunde, 29 getragen, keiner gefallen.** Sie ist aber aus
einem anderen Grund die wichtigste.

**Sie hat nicht nur meinen Plan berichtigt, sondern eine Aussage, die beim
Betreiber schon angekommen war.** Ich hatte ihm gemeldet: ein Studio ohne
freigeschaltetes Tablet könne nach der Änderung vom Tablet aus nicht mehr
löschen. Der Schluss kam aus einer richtigen Beobachtung
(`routes/tablet-sperre.js:497-499` füllt die Mitarbeiterliste nur mit
freigeschaltetem Gerät) und einer falschen Verallgemeinerung: **keine Liste
ist nicht keine Anmeldung.** Gemessen steht dort eine Selbstfreischaltung mit
Namensfeld und PIN (`:262-285`, `:650`, `:697-699`).

Zwei Dinge folgen daraus, und beide sind allgemeiner als dieser Fall:

1. **Eine Aussage über eine ABWESENHEIT („kommt nicht zu einer Identität")
   braucht die Suche nach dem ALTERNATIVEN Weg, nicht nur den Beleg für die
   fehlende Variante.** Ich hatte vier Messungen gemacht und mich davon so
   gut abgesichert gefühlt, dass ich die fünfte nicht mehr für nötig hielt.
   Genau dort lag sie.
2. **Was beim Betreiber angekommen ist, gehört ausdrücklich zurückgenommen,
   nicht still im Papier korrigiert.** Ein Auftragspapier liest er nicht; die
   Meldung hat er gelesen. Die Berichtigung ist deshalb in derselben Form
   herausgegangen wie der Fehler.

**Der blockierende Befund desselben Laufs** ist eine andere Klasse und gehört
zu den teuersten, die wir kennen: Mein Satz „jede erfolgreiche Löschung
schreibt ein Audit" nahm „erfolgreich" als gegeben an. Das DELETE wertet sein
Ergebnis heute nicht aus — zwei gleichzeitige Anfragen hätten ZWEI
Audit-Einträge für EINE Löschung erzeugt, dauerhaft und gehasht. Ein
Protokoll, das eine Handlung beurkundet, die nicht stattgefunden hat, ist
schlimmer als gar keines.


## 18.09.2026, Nacht — ein Lauf, der die eigene Behauptung EINGESCHRÄNKT hat

Die Codeprüfung der Mandantengrenze (vier Befunde, alle getragen) ist aus
einem Grund bemerkenswert, der nichts mit ihrer Zahl zu tun hat.

**Bei einem ihrer eigenen Befunde hat sie sich selbst korrigiert, bevor
jemand nachgemessen hat.** Sie führte eine Mutation an
(`SELECT id FROM belehrungen WHERE studio_id = $1 ORDER BY id LIMIT 1`) und
schrieb dazu:

> „Die Zeilenzahl-Zusicherung in Testzeile 171 bleibt grün. **Wichtig: Der
> Redirect-Test in Zeile 169 wird rot.** Deshalb wäre die Behauptung ‚die
> ganze Datei bleibt grün' für diese Mutation falsch."

Und zog daraus den eigentlichen Schluss: nicht „kein Befund", sondern **der
Kommentar der Testdatei ist falsch**. Dort stand, das Redirect-Ziel sei bloss
Diagnose und die Zeilenzahl die tragende Zusicherung. Die Mutation beweist das
Gegenteil — hier trägt das Redirect-Ziel, und die Zeilenzahl nicht.

Das ist die Sorte Prüfung, die mehr wert ist als eine, die immer liefert: Sie
hat eine Behauptung abgeschwächt, die ihr eigener Befund gestützt hätte, und
dabei einen ANDEREN, besseren Befund gefunden.

**Drei der vier Befunde sind dieselbe Klasse, und es ist unsere eigene:** eine
Zusicherung über eine ZAHL ist keine Zusicherung über eine MENGE. Die
Testdatei zählt Zeilen und prüft nie, WELCHE IDs gespeichert wurden. Folge,
je einzeln hergeleitet: `bel.id` durch `ma.id` ersetzen (falsche Referenz
gespeichert) — alle 20 Zusicherungen grün. `DO UPDATE` durch `DO NOTHING`
ersetzen (reguläre Neufreischaltung wirkungslos) — alle 20 grün. Und eine
Typweiche, die numerische IDs an der Besitzprüfung vorbeilässt — alle 20
grün, weil der Test ausschliesslich Formular-POSTs schickt, also nur
Zeichenketten.

**Der vierte Befund deckt sich mit einem, den ich selbst gefunden hatte**
(die Ununterscheidbarkeit von „fremd" und „nicht vorhanden" ist nirgends
zugesichert, obwohl der Beitrag mit ihr die Wahl von 404 begründet). Zwei
unabhängige Spuren, derselbe Befund — das kommt selten genug vor, um es
festzuhalten.

---

## 18.09.2026, abends — A/B-Lauf DeepSeek v4-pro gegen denselben Diff

**Zweck:** Betreiber-Auftrag „finde raus was es kann und vergleiche mit gpt 6,
nutze jeweils das beste System für die Aufgaben". Kein zusätzlicher Prüflauf,
sondern eine MESSUNG des Prüfers — derselbe Diff (Mandantengrenze M1+M2),
dasselbe Bündel, derselbe Auftrag wörtlich wie an die beiden eigenen Spuren.

**Modell/Stufe:** `deepseek-v4-pro`, `reasoning_effort: "max"`.
**Material:** 54.477 Zeichen (Diff, Gegenproben des Ausführenden, Vorbildstelle
`routes/getraenkeanlage.js`, Schema-Auszug aus `core/db.js`) = 18.344 Token.
**Ausgabe:** 27.197 Denk-Token, 31.453 Ausgabe-Token gesamt, 264 s,
`finish_reason: stop`.

**Befunde: 8. Nach eigener Nachmessung getragen: 6. Gefallen: 2.**
Davon **zwei Befunde, die KEINE der beiden eigenen Spuren hatte** (21
ungeprüfte INSERTs; `MINDEST_PRUEFUNGEN` zählt nur die Menge). Drei Befunde
decken sich wörtlich mit eigenen (N9, N4, N6/N11) — darunter N9, der
schwerwiegendste Befund der eigenen Spur, mit derselben Mutation.

**Die beiden gefallenen gehen auf MEINE Bündelwahl zurück, nicht auf den
Prüfer:** `package.json` lag nicht bei (er nahm Express 4 an, wir fahren
`^5.2.1` plus globalen Fehlerhandler `server.js:1467`), und von `core/db.js`
lag nur ein Schema-Auszug bei, nicht die Definition `one() -> rows[0] ?? null`
(`core/db.js:426-429`). Zwei Dateien mehr hätten beide verhindert.

**Erster Versuch: ABGEBROCHEN, Striche statt Null.** `max_tokens: 16000`,
`finish_reason: length`, 0 Zeichen Bericht bei 62.186 Zeichen Denkprotokoll.
Geprüft hat da niemand. Kosten sind trotzdem angefallen.

**Kosten:** nicht gemessen — wie bei den OpenAI-Läufen fehlt uns das Recht
auf die laufgenaue Kostenabfrage. Token stehen oben, Geld steht auf der
Abrechnung.

---

## 18.09.2026, abends — DeepSeek als ZWEITE Lesespur (Nacharbeit M1/M2)

**Zweck:** Erster Einsatz nach der Betreiber-Entscheidung, DeepSeek bei
folgenschweren Beiträgen als zweite Spur neben dem Gegenleser zu fahren.
Geprüft: der Diff, der zwölf Befunde zweier Prüfspuren nachzieht.

**Modell/Stufe:** `deepseek-v4-pro`, `reasoning_effort: "max"`, Responses-API
(zustandslos, `store: false` in der Antwort bestätigt).
**Material:** 136.075 Zeichen = **43.145 Token** — Diff, `package.json`,
db-Semantik, `core/auth.js` vollständig, globaler Fehlerhandler, unveränderte
M2-Route, BEIDE Testdateien vollständig, Test-Harness. Vorher gezählt über
`/v1/responses/input_tokens` (38.811 ohne den Auftrag), nicht geschätzt.
**Ausgabe:** 66.524 Token, davon 62.536 Denken. 518 s, ohne Streaming
durchgelaufen.

**Befunde: 7. Nach eigener Nachmessung getragen: 6. Gefallen: 1.**

| # | Befund | Verdikt |
|---|---|---|
| 2 | N9-Zähler prüft nur `=== 0`, nie `> 0` — wer das `console.error` aus dem catch nimmt, macht den Mechanismus lautlos wirkungslos | **hält, blockierend** |
| 7 | Kommentar in `core/auth.js` verallgemeinert „unsere eigenen fetch()-Aufrufe" | **hält, SCHÄRFER als gemeldet** |
| 3 | statische Richtungsprüfung sucht im ganzen Quelltext statt im Funktionsausschnitt | hält |
| 4 | statische Testdatei hat keine Mindest-Prüfzahl | hält |
| 5 | halbe Admin-Session (`totpOk:false`) im N12-Test ungeprüft | hält |
| 1 | Test-Abfrage ohne `studio_id` (`posEigen`) | hält als Hygiene, Schwere leicht überzogen |
| 6 | Zeitvergleich `>` sei flaky | **fällt** |

**Warum 6 fällt:** die Begründung läuft in die falsche Richtung. `clock_timestamp()`
wird über JavaScript auf Millisekunden ABGESCHNITTEN, der Bezugspunkt rutscht
also nach FRÜHER — der Vergleich wird dadurch wahrscheinlicher wahr, nicht
unwahrscheinlicher.

**Warum 7 schärfer ist als gemeldet:** selbst gezählt — von NEUN
Browser-`fetch`-Aufrufen auf eigene Endpunkte trägt genau EINER den
`Accept`-Header, und zwei der fehlenden stehen in derselben Datei, die gerade
repariert wurde (`routes/lageplan.js:1524`, `:2843`).

**Kosten:** nicht gemessen (kein Recht auf die laufgenaue Abfrage). Token oben.

---

## 19.09.2026 — Runde 4, ZWEI Läufe parallel mit VERSCHIEDENEN Aufträgen

Zum ersten Mal die offene Frage aus der CLAUDE.md („zwei Läufe mit
VERSCHIEDENEN Aufträgen statt einem") tatsächlich gefahren — allerdings über
zwei MODELLE, nicht innerhalb eines. Das beantwortet die dortige Frage also
NICHT; es ist unsere übliche Zwei-Spuren-Praxis mit getrennten Fragestellungen.

### Lauf A — PLANPRÜFUNG (`gpt-5.6-sol`, effort `xhigh`)

Zweck: das Auftragspapier F5 prüfen, **bevor** gebaut wird. Die Regel steht
seit dem 10.09. als „Punkt mit dem grössten Hebel" und wurde bei den
Härtungsrunden 3–5 übergangen.

Material: Vorspann + Auftragspapier + die zu ändernde Testdatei +
`routes/belehrungen.js` + `core/auth.js`. **Gezählt, nicht geschätzt:
67.489 Token** (`POST /v1/responses/input_tokens`). Verbraucht: 67.722 rein,
16.541 raus (davon 14.472 Denken). Dauer 321 s.

**Kosten nach der Preistabelle in `tools/gegenleser-repo.js` (5,00/30,00 $
je Mio): rund 0,83 $.** Zum Vergleich: derselbe Lauf mit `gpt-6-astra` hätte
nach derselben Tabelle rund 2,08 $ gekostet.

**Befunde: 4. Nach eigener Nachmessung getragen: 3. Gefallen: 1.**

| # | Befund | Verdikt |
|---|---|---|
| 2 | die vorgeschriebenen ID-Untergrenzen wären vom geplanten Wächter gar nicht bewacht — paarweise Verschiedenheit gilt auch bei ganz anderen Zahlen | **hält** |
| 3 | die Löschung der Wegwerfzeilen ohne jeden Nachweis: ein unwirksames DELETE lässt die Sequenzen trotzdem vorrücken, alles bleibt grün | **hält** |
| 4 | mein Auftrag widerspricht sich bei der Zahl der neuen Zusicherungen — damit ist die Mindestprüfzahl vor dem Lauf nicht herleitbar | **hält** |
| 1 | zwei Abfragen ohne `studio_id` (`clock_timestamp()`, Zeitvergleich) | **fällt als Bauauftrag** |

**Warum 1 fällt:** beide Abfragen haben keine `FROM`-Klausel, lesen also keine
Tabelle und können nichts über eine Mandantengrenze hinweg lesen. Der
vorgeschlagene Umbau — `SELECT clock_timestamp() … FROM mitarbeiter WHERE
studio_id=$1 AND id=$2` — hängt einen sinnlosen Tabellenlesezugriff an eine
Zeitabfrage und macht sie von Fixturzustand abhängig. Der Befund ist gegen den
WORTLAUT der Regel richtig und in der Sache leer; er wird als datierter offener
Punkt geführt statt gebaut.

**Bemerkenswert an diesem Lauf: alle drei tragenden Befunde richten sich gegen
meinen eigenen AUFTRAG, keiner gegen Code.** Genau dafür ist die Planprüfung
da — am Papier kosten sie nichts, an drei Bau-Runden schon.

### Lauf B — CODE-GEGENLESUNG (`deepseek-v4-pro`)

Zweck: der fertige F4-Diff, zweite Spur.

Material: Vorspann + Diff + Testdatei vollständig + `routes/lageplan.js` +
`routes/belehrungen.js` + `core/auth.js`. **Gezählt: 125.851 Token.**
Verbraucht: 136.509 rein, 24.992 raus (davon 23.184 Denken). Dauer 267 s.
**Kosten: in unserer Preistabelle steht DeepSeek nicht — nicht ableitbar,
Token oben.**

**Befunde: 3. Nach eigener Nachmessung getragen: 2. Gefallen: 1.**

| # | Befund | Verdikt |
|---|---|---|
| 1 | `istRequireCoreAuth` prüft die FORM, nicht die TATSACHE: `const requireAdmin = require('./core/auth')` erfüllt sie, obwohl `requireAdmin` dann das Modulobjekt statt der Middleware ist | **hält — gemessen `EXIT 0, 188 PASS / 0 FAIL`, alle drei Identitäts-Zusicherungen bleiben grün** |
| 2 | F4-N5 kann bei nicht parsbarem `server.js` nicht rot werden (leeres Array === sauber) | **hält — gemessen: beide Zeilen grün bei `EXIT 1, 177/5`** |
| 3 | Zeitvergleich ohne `studio_id` | **fällt**, siehe Lauf A Befund 1 |

### Was die beiden Läufe ZUSAMMEN zeigen

**Null Überschneidung bei den tragenden Befunden** — die drei aus Lauf A
betreffen ausschliesslich das Auftragspapier, die zwei aus Lauf B ausschliesslich
gebauten Wächtercode. Das ist aber KEINE Wiederholung der Messung vom
13.09.2026: die Spuren hatten hier **verschiedene Fragen und verschiedenes
Material**, Disjunktheit ist damit weitgehend erzwungen und nicht überraschend.

**Was beide Spuren gemeinsam hatten, ist der EINZIGE gefallene Befund** — beide
meldeten dieselbe `studio_id`-lose Zeitabfrage, beide mit einer Behebung, die
die Lage verschlechtert hätte. Zwei unabhängige Spuren, die denselben
Fehlalarm liefern, sind ein Hinweis auf die REGEL, nicht auf den Code: der
Wortlaut „jede Abfrage trägt `studio_id`" unterscheidet nicht zwischen
Tabellen- und Ausdrucksabfragen. Ob er das soll, entscheidet der Betreiber.

**Und der schwerste Befund der Runde kam von keiner der beiden Spuren**,
sondern aus dem eigenen Nachmessen einer Gegenprobe: dass auf frischer
Datenbank Studio-, Etagen-, Mitarbeiter- und Belehrungs-ID dieselbe Zahl
tragen. Dasselbe Muster wie am 12.09.2026 — das Nadelöhr bleibt das eigene
Nachmessen, nicht das Finden.

## 19.09.2026 — Planprüfung F6 (`gpt-5.6-sol`, effort `xhigh`)

Zweck: das Auftragspapier F6 prüfen, BEVOR gebaut wird. Anlass war ein
P2-Befund des Review-Bots am Beitrag, den ich zuvor selbst nachgemessen hatte.

Material: Vorspann + Messungen + Auftragspapier + die Testdatei vollständig +
`routes/lageplan.js` + `routes/belehrungen.js`. **Gezählt: 120.649 Token.**
Verbraucht: 120.822 rein, 13.741 raus (davon 11.912 Denken). Dauer 271 s.
**Kosten nach der Preistabelle: rund 1,02 $.**

**Befunde: 5. Nach eigener Nachmessung getragen: 4. Gefallen: 1.**

| # | Befund | Verdikt |
|---|---|---|
| 2 | F6-1 schwächt MEHR als behauptet: die heutige Mengenprüfung fängt auch `const maC = maB;` — Länge bleibt 6, Menge wird 5 | **hält, der wichtigste** |
| 3 | F6-2 und F6-3 sind nicht getrennt grün commitfähig; der vorgeschriebene Zwischencommit wäre absichtlich ROT | **hält** |
| 5 | „abbrechen und melden" war zweideutig — als Laufzeit-Wurf gebaut hätte es alle Prüfungen dahinter gekostet | **hält** |
| 4 | meine Vollständigkeitsbehauptung ist wörtlich falsch (`etageA`/`maA`/`belA` stehen gemeinsam in F5-2b), und H4 ist dadurch nicht isoliert | **hält** |
| 1 | zwei Abfragen ohne `studio_id` | **fällt — zum DRITTEN Mal** |

**Warum 1 zum dritten Mal fällt, und was daran diesmal MEIN Fehler war:**
Die Abfragen haben keine `FROM`-Klausel. Entscheidend ist aber die Ursache:
Mein eigener Prüf-Vorspann zitierte die Regel als „JEDE Datenbankabfrage trägt
`studio_id`" — ohne die Einschränkung auf Tabellenabfragen. Die Spur hat also
korrekt angewandt, was ich ihr geschrieben habe. Drei Läufe lang habe ich
denselben Fehlalarm selbst bestellt und dann als Fehlalarm verbucht.
Der Vorspann liegt jetzt als `tools/gegenleser-vorspann.txt` im Repo und
stellt es klar.

**Was dieser Lauf über Planprüfungen zeigt — zum zweiten Mal an einem Tag:**
**alle vier tragenden Befunde richten sich gegen mein AUFTRAGSPAPIER, keiner
gegen Code.** Bei der Planprüfung F5 war es genauso (drei von drei). Zusammen
mit dem 15.09.2026 (18 Befunde über zwei Planprüfungen, alle getragen) ist das
die konsistenteste Beobachtung, die diese Datei bisher trägt. Sie ersetzt keine
Statistik — aber sie deckt sich mit der Regel aus der CLAUDE.md, dass der
grösste Hebel am Papier liegt und nicht am Diff.

**Was sie NICHT zeigt:** dass eine Planprüfung genügt. Dieselbe Spur hat in der
Runde davor Fassung 1 von F5 geprüft und die ABSOLUTEN Bereichsgrenzen NICHT
beanstandet — die sind dann im vollen Suite-Lauf rot geworden. Eine
Planprüfung findet, was am Papier erkennbar ist; die Unverträglichkeit mit 338
anderen Testdateien war es nicht.

---

## 19.09.2026 — A/B `max` gegen `xhigh` (Betreiber-Frage „was ist besser?")

Identisches Bündel, identischer Prompt, **programmatisch als byte-gleich
belegt**; einziger Unterschied `reasoning.effort`. Auftrag: das
Auftragspapier zur Einmal-Freischaltung ADVERSARISCH brechen. Bewertung
blind — beide Befundlisten zusammengeführt, nach Datei/Zeile sortiert, Quelle
erst nach dem Nachmessen aufgedeckt.

| | `max` | `xhigh` |
|---|---|---|
| Befunde | 4 | 3 |
| nach eigener Nachmessung getragen | **4** | **3** |
| Denk-Token | 31.057 | 13.984 |
| Dauer | 874 s | 439 s |
| Kosten (Preistabelle) | **~1,26 $** | **~0,74 $** |

**Überschneidung: 2 von 7.** Beide fanden die zwei strukturell wichtigsten
Punkte (Gegenprobe K2 nicht formtreu; das geplante „Fenster schliessen"
vergrössert in Wahrheit ein Wettlauf-Fenster). Darüber hinaus disjunkt:
`max` zwei eigene, `xhigh` einen eigenen.

**Der teuerste Fund war einer von `max`** und kippte den ganzen Entwurf: ein
gültiges, aber tintenloses PNG läuft durch alle Prüfungen. **Scharf
nachgemessen am echten Endpunkt** (weisses UND transparentes 1×1-PNG):
`{"status":"ok"}`, Freischaltung 1 → 0, signierte PDF entsteht. Die geplante
Behebung hätte fertig ausgesehen und die Lücke offengelassen.

**Der eigene Fund von `xhigh`** ist ebenfalls schwer: der geplante Wächter
verlangt nur EIN Token, deshalb überlebt `AND belehrung_id=$3` → `AND $3=$3`
sämtliche vier vorgesehenen Gegenproben.

**Was das NICHT hergibt:** ein Auftragspapier, ein Lauf je Stufe. Eine
Beobachtung, keine Regel. **Meine schriftlich vorher festgehaltene Vorhersage
(„kein grosser Unterschied") war falsch** — das gehört dazu, sonst misst diese
Datei nur die eigene Zustimmung.

**Was daraus folgt:** nicht „max ist besser". Sondern: beide zusammen kosteten
2,00 $ und lieferten fünf eigenständige Befunde; jede Stufe allein hätte vier
bzw. drei geliefert. Der billigste Weg zu allen fünf war, beide zu fahren.

## 19.09.2026 — Kreuzverhör-Pilot (beide Spuren, je gegen die Befunde der anderen)

Zweck: messen, ob die Widerlegungsstufe taugt — an Material, dessen Antwort
ich schon kannte (alle sieben Behauptungen hatte ich selbst als tragend
nachgemessen).

| Spur | geprüfte Behauptungen | widerlegt | Schwere korrigiert |
|---|---|---|---|
| zweite Spur gegen `max` | 4 | 0 | 1 |
| `sol` gegen `xhigh` | 3 | 0 | 1 |

**0 von 7 widerlegt.** Beide Spuren stuften unabhängig voneinander DIESELBE
Behauptung von „hoch" auf „mittel" zurück (K2 sei eine Lücke des
Prüfverfahrens, kein Produktionsfehler) — dem habe ich zugestimmt.

Zusätzlich geliefert: eine erkenntnistheoretische Einschränkung, die ich selbst
nicht gemacht hatte, und zwei neue Tatsachen, beide von mir nachgemessen und
beide zutreffend (`/api/offen` zählt ohne Dokumentversion; die Tinten-Prüfung
existiert nur im Browser).

**Urteil: das Kreuzverhör erhöht die Präzision, senkt aber die Messlast NICHT.**
Deshalb steht es in der CLAUDE.md als beratend und ausdrücklich nicht als Gate —
gestützt zusätzlich auf eine externe Messung, nach der automatische Filter in
genau unseren Fehlerklassen bis zu drei Viertel der echten Befunde verwerfen.

## 19.09.2026 — Planprüfung Signaturbild (zwei Spuren, PLAN statt Diff)

Erste Anwendung der Regel vom 18.09.2026 („der Plan geht raus, BEVOR gebaut
wird") auf einen sicherheitsrelevanten Auftrag. Material: das Auftragspapier
plus der IST-Zustand — `routes/belehrungen.js`, `core/db.js`,
`core/integritaet.js`, vier betroffene Testdateien, `package.json` und vier
Auszüge (Geschwisterstellen). **Bündel GEZÄHLT statt geschätzt:
127.232 Token** über `POST /v1/responses/input_tokens`.

| Lauf | Modell | Stufe | Ergebnis | Befunde | getragen | Token / Kosten |
|---|---|---|---|---|---|---|
| a) abgebrochen | deepseek-v4-pro | — | `finish_reason: "length"` | — | — | 139.138 ein / 16.000 aus |
| b) Wiederholung | deepseek-v4-pro | — | `stop`, 202 s | 4 | **3** | 139.138 ein (139.136 aus dem Cache) / 15.382 aus |
| c) | gpt-5.6-sol | xhigh | `completed`, 695 s | 7 | **6** | 127.407 ein / 27.730 aus (24.331 davon Denken) ≈ **1,47 $** |

Kosten: für `gpt-5.6-sol` aus der Preistabelle in `tools/gegenleser-repo.js`
(5,00/30,00 $ je Mio). **Für `deepseek-v4-pro` steht in unserer Tabelle kein
Preis** — deshalb hier nur Token, keine Zahl in Dollar. Eine Kostenaussage
gehört auf eine Rechnung, nicht auf eine Schätzung.

**Null Überschneidung zwischen den beiden Spuren — elf Befunde, kein einziger
doppelt.** Dieselbe Beobachtung wie am 13.09.2026, und diesmal an einem PLAN
statt an einem Diff. Die Trennung hat eine erkennbare Ursache: Spur (b) las
vor allem den Plan gegen sich selbst (Schwellen, Beispiele, Formulierungen),
Spur (c) den Plan gegen den KONTROLLFLUSS des Bestandes (Lesereihenfolge,
Transaktionsgrenzen, wer welchen Lock nimmt).

**Neun von elf getragen, zwei gefallen** — beide aus Spur (b): das Beispiel
eines Befundes traf nicht (ein 1×1-schwarzes PNG wird als 100×100 pt Block
gezeichnet, also gerade nicht unsichtbar), und ein Restrisiko, das schon im
Papier stand, wurde als neuer Befund gemeldet. Der erste zählt trotzdem
halb: die SACHE dahinter trug und hat den Entwurf verändert, nur das Beispiel
war falsch gewählt.

**Was die Läufe am Plan geändert haben** (vorher gebaut wurde nichts):
ein blockierender Fehler in meiner Lesereihenfolge, der die ganze
Generationsprüfung wirkungslos gemacht hätte; eine eigene Gegenprobe, die nie
rot werden konnte; zwei Zusicherungen, die eine Konstante erfüllt hätte; ein
ungedeckelter Speicherverbrauch; zwei falsche Bestandsbehauptungen von mir;
ein zusätzlicher ernster Befund für ein eigenes Papier. **Das ist der Beleg
für die Regel vom 18.09.2026 („der Plan geht raus, BEVOR gebaut wird") an
einem eigenen Fall** — jeder dieser Punkte hätte sonst eine Bau-Runde
gekostet.

**Lauf (a) ist ein Abbruch, keine Null.** Alle 16.000 Completion-Token gingen
ins Nachdenken (`completion_tokens_details.reasoning_tokens: 16000`), für die
Antwort blieb nichts. Das ist die Klasse aus der CLAUDE.md: wer nur den Text
ausliest, meldet „keine Befunde" und meint „niemand hat geprüft". Aufgefallen
ist es allein daran, dass `finish_reason` bei JEDEM Aufruf geprüft wird.
Die Kosten sind angefallen und stehen deshalb in der Zeile.

**Merkposten für künftige DeepSeek-Läufe:** `max_tokens` deckelt dort Denken
UND Antwort gemeinsam. 16.000 reichen bei einem 127k-Bündel nicht; die
Wiederholung fährt mit 64.000.

## 19.09.2026 — Diffprüfung Signaturbild (zwei Spuren, fertiger Diff)

Zweiter Lauf am selben Beitrag, diesmal über den GEBAUTEN Diff statt über den
Plan. Material: der vollständige Diff (9 Commits), `core/signaturbild.js`,
`routes/belehrungen.js`, der neue Wächter, `core/db.js`, `core/integritaet.js`,
zwei Geschwisterauszüge und **die gefahrenen Gegenproben mit ihren Ausgaben**.
Bündel gezählt: **122.152 Token**.

| Lauf | Modell | Stufe | Ergebnis | Befunde | getragen | Token / Kosten |
|---|---|---|---|---|---|---|
| a) | gpt-5.6-sol | xhigh | `completed`, 442 s | 8 | 7 (2 blockierend) | 122.286 ein / 24.592 aus (20.718 Denken) ≈ **1,35 $** |
| b) | deepseek-v4-pro | — | `stop`, 303 s | 1 | 1 (eng), Schwere gefallen | 133.700 ein / 27.199 aus (25.715 Denken) |

**Null Überschneidung — zum DRITTEN Mal** (13.09., 19.09. am Plan, 19.09. am
Diff). Neun Befunde, kein einziger doppelt.

**Die zwei blockierenden, beide selbst nachgemessen:**

1. **B4 war vollständig unbewacht.** Eine Zeile in der kanonischen
   Bild-Pipeline (`.linear(0, 255)`) macht jede eingebettete Unterschrift
   weiß — sie verschwindet aus dem Nachweisdokument — und **alle 60
   Zusicherungen bleiben grün, EXIT 0**. Die Tinte wird in der ERSTEN
   Pipeline gezählt, eingebettet wird das Ergebnis der ZWEITEN; die einzige
   B4-Zusicherung misst die PDF-Dateigröße, und ein weißes Bild macht die
   Datei sogar kleiner.
2. **Die Route nimmt seit dem Beitrag JPEG, WebP und SVG an** — gemessen,
   alle drei mit gelogenem `data:image/png;base64,`-Präfix. Das ist eine
   ERWEITERUNG gegenüber vorher: der alte Weg gab den Puffer direkt an
   `pdfDoc.embedPng()`, das alles außer PNG abgelehnt hätte. SVG ist dabei
   eine eigene Parserfläche (librsvg), vorher nicht erreichbar.

**Was dieser Lauf über das VERFAHREN zeigt, und es ist der wichtigere Teil:**
Die vom Prüfer VORGESCHLAGENE Mutation für Befund 1 (`.threshold(0)`) ist bei
sharp **wirkungslos** — 24 dunkle Pixel blieben stehen. Hätte ich sie blind
übernommen, hätte ich den Befund als widerlegt abgehakt und einen
blockierenden Fehler durchgewinkt. Erst die Kontrolle „ist die Mutation
überhaupt angekommen?" und eine eigene, wirksame Mutation haben ihn belegt.
**Ein Behebungs- oder Messvorschlag eines Prüfers ist selbst ein Befund, der
nachgemessen gehört** — das steht so in der CLAUDE.md und hat hier genau den
Unterschied gemacht.

**Gefallen bzw. herabgestuft:**

* DeepSeeks einziger Befund („9b-c erzeugt falsche Sicherheit", *hoch*) trägt
  nur im engen Teil: `9b-a` bis `9b-d` bleiben tatsächlich grün, wenn man den
  DELETE-Block aus der Transaktion zieht. Die Folgerung trägt NICHT — der
  Wächter als Ganzes fällt dabei laut (**EXIT 1, 54 PASS / 6 FAIL**).
  Übrig bleibt eine Beschriftung, die mehr behauptet, als sie misst.
* sols Befund zur Diagnose-Robustheit des Wächters trägt in der Sache, aber
  nicht in der Schwere: ein unerwarteter Wurf beendet den Lauf mit EXIT 1 und
  ohne Zusammenfassung — das ist ROT und laut, nicht falsch grün.

**Drei Befunde sind richtig, aber VORBESTEHEND** und damit außerhalb dieses
Beitrags: `signatur_hash` bindet das Bild nicht; nach einem Rollback bleibt
eine verwaiste PDF liegen; `freigeschaltet_am` ist theoretisch NULL-fähig.
Sie bekommen ein eigenes Papier statt einer stillen Mitnahme.

### Abschluss des Beitrags (19.09.2026)

Beide blockierenden Befunde der Diffprüfung sind behoben, die Gegenproben vom
Haupt-Agenten SELBST nachgemessen: Bild-Weissmachung vorher 60/0 (nichts fiel)
→ **70/4**; Formatprüfung → **71/3**. Dazu zwei P1 des Review-Bots: einer
zutreffend und behoben (fast weisses Pixel), einer gegen den Endstand
widerlegt.

**Gesamt an diesem Beitrag: 22 Befunde aus vier Gegenlesungen und zwei
Bot-Meldungen, jeder einzeln nachgemessen, vier blockierend.** Merge `4c4b729`,
Deploy 428 `success`, live-check EXIT 0.

**Der für die Regel wichtigste Befund ist keiner der 22, sondern ein Muster:**
ZWEIMAL trug ein Befund, aber sein VORSCHLAG nicht — einmal eine Mutation, die
gar nicht wirkt (`.threshold(0)`), einmal eine Behebung, die alle 19
gemessenen echten Fälle abgewiesen hätte. Die Regel „der Behebungsvorschlag
einer Gegenlesung ist selbst ein Befund, der nachgemessen gehört" hat hier
zweimal an einem Tag den Unterschied gemacht.

---

## 19.09.2026 — Planprüfung `tools/gegenleser-repo.js` auf Streaming (zwei Spuren)

| | Spur A | Spur B |
|---|---|---|
| Modell | `gpt-5.6-sol`, `effort: xhigh` | `deepseek-v4-pro` |
| Material | identisch: Auftragspapier + vollständiges Werkzeug (2.732 Zeilen) + `ci.yml` + CLAUDE.md | identisch |
| Bündel | **96.599 Token gezählt** (`POST /v1/responses/input_tokens`), 24,1 % des Limits | dasselbe, 103.416 vom Anbieter gezählt |
| Dauer | 388 s, HTTP 200, 1.889.745 SSE-Bytes, 1 Abschluss-Ereignis | 244 s, HTTP 200, `finish_reason: stop` |
| Verbrauch | 96.798 rein / 25.412 raus (davon 20.200 Denk-Token) | 103.416 rein / 19.057 raus (davon 17.093 Denk-Token) |
| Kosten | **1,25 $** (5,00/30,00 je Mio) | **unbekannt** — `deepseek-v4-pro` steht nicht in unserer Preistabelle; eine Zahl wird nicht erfunden |
| Befunde | 13 | 3 |
| Nach EIGENER Nachmessung getragen | 12 in der Sache (1 Schwere korrigiert: SOL-3 hoch → mittel) | 2 in der Sache (1 Schwere widerlegt: DS-1 blockierend → niedrig) |

**Gesamt 16 Befunde, 14 getragen, 2 mit falscher Schwere.**

**Das Bemerkenswerte sind nicht die Planfehler, sondern zwei BESTEHENDE
Fehler im heutigen Code**, beide in der Funktion, die umgebaut werden soll,
beide von mir mit Positivkontrolle nachgemessen:

1. **`roh += stueck` zerstört Mehrbytezeichen an der Chunk-Grenze.** Gemessen:
   derselbe Eingang, derselbe Schnitt — Bestandsweg `"… Datei ��� ungueltig …"`
   (Ersatzzeichen: ja), `StringDecoder` `"… Datei — ungueltig …"` (byte-gleich
   mit dem Original). Unsere Berichte sind deutsch.
2. **Ein Antwortstrom, der ohne `end` schliesst, lässt die Promise für immer
   hängen.** Gemessen am Nachbau mit Wachhund: sauberes `end` → aufgelöst
   (Positivkontrolle); `close` ohne `end` → HÄNGT; Fehler am Antwortstrom →
   HÄNGT. Ein Socket-Zeitlimit rettet nicht — es greift bei Untätigkeit, nicht
   bei einem geschlossenen Socket. Und der Umbau macht genau diese Störung vom
   unwahrscheinlichen zum wahrscheinlichen Fall.

**Überschneidung der Spuren: 2 von 16** (DS-1/SOL-10 trafen denselben Satz aus
zwei Richtungen, DS-3/SOL-9 dieselbe Fehlerform). Anderes Bild als am
13.09.2026 (null Überschneidung bei neun Befunden) — und die ehrlichere Zahl,
weil hier beide Spuren dasselbe Material und dieselbe Frage hatten.

**Eigene Messungen am echten Endpunkt im Zuge der Nachmessung** (zusammen
unter 500 Token, sie beantworten DS-2 und SOL-13):
`stream:true` + Funktionswerkzeuge + `store:false` + `truncation` + `metadata`
zusammen → HTTP 200 · Abschluss-Ereignis formgleich mit dem nicht-gestreamten
Körper · `response.incomplete` mit `{"reason":"max_output_tokens"}`, `output[]`
nur `["reasoning"]` · ZWEI-Runden-Lauf mit zurückgeschicktem `function_call` +
`function_call_output` → beide Runden HTTP 200 (`gpt-5.4` und `gpt-5.6-sol`) ·
echtes `reasoning`-Element im `input[]` einer neuen Anfrage → HTTP 200 ·
3.977 `data:`-Zeilen über drei echte Ströme, **alle** mit `type`-Feld, 0
Abweichungen zur `event:`-Zeile.

**Für die Regel vom 18.09.2026 („der Plan geht raus, BEVOR gebaut wird"): das
ist der bisher stärkste Beleg.** Nicht weil die Planfehler teuer waren, sondern
weil die beiden teuersten Funde gar keine Planfehler sind. Sie lagen im
Bestand und wären in jeder Bau-Runde unsichtbar geblieben — niemand hätte nach
ihnen gesucht.


### 19.09.2026 — der Lauf, der zugleich sein eigener Prüfstand war

Dieser Lauf lief durch das **frisch umgebaute Werkzeug**, dessen Diff er prüfen
sollte. Das ist der Beleg, den kein Selbsttest liefern kann: 5 Runden,
323.750 Token rein, 11 Dateibereiche selbst aus dem Repo gelesen, regulärer
Bericht, Rundenlimit nicht erreicht. Streaming trägt gegen den echten
Endpunkt — mit Werkzeugen, über mehrere Runden, mit Repo-Lesezugriff.

**Sechs Befunde, alle sechs nach eigener Nachmessung in der Sache getragen,
einer mit falscher Schwere.**

**Der teuerste Befund ist eine Ironie:** der Beitrag, der falsch-grüne
Zusicherungen beseitigen sollte, hat VIER davon ausgeliefert. Je einzeln
gemessen, jedes Mal **99 Haken / 0 Kreuze, EXIT 0**:

* Den Einmal-Riegel (`if (fertig) return; fertig = true;`) vollständig
  entfernt — die Zusicherung heisst „LOEST GENAU EINMAL AUF" und kann nicht
  fallen. Grund: eine native Promise schluckt ein zweites `reject()` lautlos,
  also unterscheidet der Endzustand niemals einen von zwei Settle-Versuchen.
* `EFFORT` von `xhigh` auf `low` gesetzt — die Zusicherung prüft
  `typeof === 'string' && length > 0`, also die FORM statt des WERTES.
* `GP2_BYTES` wird mit `Buffer.byteLength(gp2Text)` aus genau der Fixtur
  berechnet, die es bewachen soll. Der Kommentar daneben verrät den
  Denkfehler selbst: „unabhängiges `Buffer.byteLength`, NICHT der
  SSE-Parser" — unabhängig vom PARSER ist eben nicht unabhängig von der
  FIXTUR.
* GP10 sucht nur nach `--zweck` und dem Brief-DATEINAMEN, nicht nach
  Brief-INHALT oder Diff. Eine einzeilige Produktionsmutation, die
  `verlauf[0].content` in `metadata.zweck` kopiert, bliebe grün.

**Die falsche Schwere, und wie sie auffiel:** Befund 1 („`aborted` lässt
Nicht-200-Antworten hängen", als blockierend gemeldet) beschreibt eine echte
Asymmetrie im Code — der `aborted`-Listener steht hinter dem frühen `return`
und gilt nur für HTTP 200. Seine FOLGERUNG trägt aber nicht. Gemessen an
einem echten lokalen Node-22-Server, der nach einem 400er den Socket
zerstört: die Ereignisfolge ist **`aborted` → `error` → `close`**, und
`error` wie `close` sind im Nicht-200-Zweig registriert. In Produktion hängt
dort nichts.
Was wirklich dahintersteckt, ist wertvoller als das Gemeldete: **der STUB
sendet bei `abgebrochen` nur `aborted` und kehrt zurück** — eine Folge, die
echtes Node nie erzeugt. Die Abbruchfälle prüfen also gegen einen
Transportzustand, den es nicht gibt. Dieselbe Krankheit wie beim alten
JSON-Block-Stub, nur eine Ebene feiner.

**Für die Regel:** Der Lauf kostete 2,44 $ — der billigste der ganzen Tabelle
— und fand vier Zusicherungen, die nicht fallen können. „Der Preis eines
Laufs sagt nichts über den Ertrag" hat sich damit zum zweiten Mal bestätigt.

---

## 19.09.2026 — Durchgang Bündel 1 (Geräte-Lebenszyklus), ZWEI Spuren mit VERSCHIEDENEN Fragen

Erster Lauf nach der Betreiber-Entscheidung „beide Spuren, verschiedene
Fragen". **Material identisch**, gezählt auf 354.231 Token (in drei Schritten
getrimmt: 420.857 → 363.544 → 354.231; die erste Fassung wäre an sols Grenze
abgelehnt worden). Damit ist ein Unterschied der Frage zuzurechnen, nicht dem
Bündel.

| | sol | deepseek-flash |
|---|---|---|
| Frage | erreichbare Zustände im Kontrollfluss | ungesicherte Annahmen, vergessene Geschwisterstellen |
| Dauer | 366 s | 198 s |
| Verbrauch | 354.946 rein / 22.291 raus | 371.849 rein / 43.308 raus |
| Kosten | **2,44 $** | **0,08 $** |
| Befunde | 6 | 5 |

**Überschneidung: NULL.** sol lieferte durchweg erreichbare Zustände (Wettlauf
bei Doppel-Submit, Commit vor fehlbarem Folgeschritt, eine Zusicherung mit
Sollwert aus dem bewachten DB-Zustand, ein Wächter am echten Dateisystem).
DeepSeek lieferte durchweg ungesicherte Annahmen (ungleich strenge
Namensprüfungen, verschiedene Sperrschlüssel für dieselbe Invariante, eine
lokale Escaper-Kopie gegen die eine Quelle).

Das ist methodisch sauberer als die Messung vom 13.09.: dort hatten die Spuren
ungleiche Freiheiten, hier war das Material Byte für Byte dasselbe.

**VOLLSTÄNDIG nachgemessen: 11 von 11.** Ergebnis: **9 getragen, 1 gefallen,
1 teilweise** (Beobachtung richtig, Schwere falsch). Eigene Messzeit rund
85 Minuten.

**Die Einzelurteile stehen NICHT hier, sondern in
`plaene/durchgang-befunde.md`** — Datei, Zeile, Behauptung, eigene Messung mit
Ausgabe, Ergebnis, Entscheidung, je Befund. Diese Datei ist das Lauf-Protokoll
(Material, Dauer, Verbrauch, Kosten, Zahlen); die Befunde gehören in die
Befunddatei. Dieselbe Trennung wie am 13.09.2026, als die Lauftabelle an zwei
Orten stand.

Zwei Zahlen, die für die REGEL zählen und deshalb hierbleiben:

* **sol 4 von 6 voll getragen, deepseek 5 von 5.** Der EINZIGE als
  *blockierend* gemeldete Befund kam von der teuren Spur und FIEL (eine
  Migration ohne `studio_id` ist bei uns Absicht, kein Leck). Das ist ein
  Bündel — dieselbe Stichprobengrösse, der diese Datei sonst misstraut; es
  trägt keine Aussage „deepseek ist so gut wie sol", sondern nur: in diesem
  Bündel hat die 0,08-$-Spur nicht weniger Getragenes geliefert als die
  2,44-$-Spur.
* **Der Engpass bleibt das eigene Nachmessen.** 2,52 $ Finden gegen ~85 min
  Messen. Auf die Hochrechnung des Durchgangsplans (15–20 Bündel) sind das
  38–50 $ gegen **20–28 Stunden eigene Messzeit**. Wer mehr Bündel ansetzt,
  kauft Messzeit, nicht Geld.

**Ein Befund, den ein Prüfer selbst als UNSICHER kennzeichnet, ist mehr wert
als einer, der sich sicher gibt.** DeepSeek schrieb bei DS-4 ausdrücklich, es
habe `core/seilgeraete.js` nicht vorliegen und könne die Ungleichheit der
Sperrschlüssel nicht zweifelsfrei behaupten — es nannte stattdessen die
Messung, die sie entscheidet. Genau die habe ich gefahren, und der Verdacht
bestätigte sich in beidem: verschiedene Zeichenkette UND verschiedene
Hashfunktion, dazu kein `UNIQUE(studio_id, name)` als Netz. Ein Prüfer, der
seine Prüfgrenze benennt, macht aus einer Vermutung einen Auftrag.

**DeepSeek hat seine Prüfgrenze auch insgesamt von selbst benannt** —
`core/seilgeraete.js` und vier weitere Dateien lagen nicht im Bündel. Genau
dort entschieden sich DS-3 und DS-4. Für den nächsten Durchlauf gehören sie
hinein; Platz ist da (34 % von DeepSeeks Kontext genutzt).

---

## 19.09.2026 — Planprüfung Eingabewache, ZWEI Spuren über EIN Papier

Erste Planprüfung nach der Regel „der Plan geht VOR der ersten Bau-Runde
raus". **17 Befunde, alle 17 nach eigener Nachmessung getragen, null
gefallen.** Spur 1 nennt ihr Urteil ausdrücklich `nicht_freigabefaehig`.

Die Einzelurteile stehen in `plaene/auftrag-eingabewache-geraete.md`
(zwei Nachträge); hier nur, was für die REGEL folgt.

**Erstens: die Planprüfung ist der Hebel, und das ist jetzt zum zweiten Mal
gemessen.** Am 15.09.2026 waren es 18 von 18 an der Ausmusterung, heute 17 von
17. Vier der heutigen Befunde hätten eine FALSCHE REGEL in eine kanonische
`core/`-Datei geschrieben — an genau der Stelle, an der ein Fehler danach an
vier Orten gleichzeitig gilt.

**Zweitens: DREI von siebzehn Befunden überschnitten sich.** Das ist ein
anderes Ergebnis als am 13.09.2026 und bei Bündel 1 (dort je NULL). Die
naheliegende Erklärung — dort war das Material Code, hier ein PAPIER, über
dessen Schwächen beide Fragen stolpern müssen — ist eine VERMUTUNG über eine
Stichprobe von eins und wird hier nicht als Befund geführt.

**Drittens, und das ist die brauchbarste Zahl des Tages: der Unterschied war
der REPO-LESEZUGRIFF, nicht das Modell.** Vier von Spur 1s acht Befunden
(S-2, S-4, S-6, S-7) stützen sich auf Dateien, die im Bündel NICHT enthalten
waren — `normalisiereGeraetId` in einer anderen Region derselben Datei,
`parseIds()` in `ausmusterung.js`, die Spülplan-Route, `route-harness.js`.
Spur 2 konnte sie strukturell nicht finden. Umgekehrt fand Spur 2 mit
demselben Papier fünf Befunde, die Spur 1 nicht hatte, darunter eine
invertierte Bauanweisung.

**Viertens: der Preis sagt weiter nichts über den Ertrag — aber er sagt etwas
über die Klasse.** 11,20 $ gegen ~0,03 $, und beide lieferten. Die teure Spur
lieferte die vier blockierenden, die billige die vollständigere Kritik an der
Prosa des Papiers.

---

## 19.09.2026 — Planprüfung Eingabewache, RUNDE 2: was die zweite Runde wirklich leistet

Die erste Runde ist oben protokolliert (17 Befunde, alle getragen). **Runde 2
über die BEHOBENE Fassung brachte 17 weitere, ebenfalls alle getragen, fünf
blockierend.** Einzelurteile in `plaene/auftrag-eingabewache-geraete.md`.

**Das ist die erste Messung, die die Rundenbegrenzung aus CLAUDE.md wirklich
prüft.** Dort steht seit dem 13.09.2026: EINE Runde ist der Regelfall, eine
zweite nur, wenn die Behebung VERHALTEN ändert. Genau dieser Fall lag vor
(zwei verschärfte Regeln in einer kanonischen Datei), und die zweite Runde
lieferte ebenso viel wie die erste. **Die Regel trägt — und sie hätte fast
nicht gegriffen, weil die Versuchung gross war, die Korrekturen als „nur
Nachziehen" einzustufen.**

**Was die zweite Runde fand, das die erste strukturell NICHT finden konnte:**
alle fünf blockierenden Befunde beziehen sich auf die KORREKTUREN, nicht auf
den ursprünglichen Plan — auf die neu gezogene int4-Grenze, auf die neue
`typeof === 'string'`-Regel, auf die neu geordnete Stellenliste, auf den neuen
Z3-Wortlaut. Eine Runde hätte davon nichts sehen können, weil es sie noch
nicht gab.

**Der teuerste einzelne Befund kam von BEIDEN Spuren** und widerlegte eine
Tatsachenbehauptung, die ich in Fassung 2 selbst als gemessen ausgegeben
hatte: `parseInt` fängt den Teilstring-Fall, aber NICHT den int4-Überlauf
(`parseInt("2147483648",10)` ist nicht `NaN`). Die Ausklammerung einer ganzen
Fehlerklasse stand auf diesem Satz.

**Und die eigentliche Lehre ist methodisch:** dreimal hintereinander war meine
von Hand geschriebene Stellenliste unvollständig, viermal an einem Tag war ein
Suchmuster von mir falsch. Die Papiere, die daraus entstanden
(`plaene/auftrag-id-wache.md`, `plaene/auftrag-textfeld-wache.md`), lassen
deshalb einen WÄCHTER die Eintrittspunkte aufzählen statt mich. Eine Liste,
die ich pflege, ist ein Selbstnachweis aus dem eigenen Datenfluss — und der
Regress endet erst an einer Referenz von aussen.

**Kosten beider Runden zusammen: 30,04 $ für 34 getragene Befunde**, davon
sieben blockierend. Zum Vergleich: eine einzelne Bau-Runde mit anschliessender
Diff-Prüfung kostet ein Vielfaches an eigener Messzeit — und hätte die vier
falschen Regeln erst am fertigen Code gefunden, in einer kanonischen Datei,
auf die dann schon vier Orte zeigen.

---

## 19.09.2026 — DREI Planprüfungsrunden über EINEN Beitrag: 63 Befunde, 63 getragen

| Runde | Gegenstand | Befunde | getragen | blockierend | Kosten |
|---|---|---|---|---|---|
| 1 | Eingabewache Fassung 1 | 17 | 17 | 4 | 11,23 $ |
| 2 | Eingabewache Fassung 2 (die Behebungen) | 17 | 17 | 5 | 18,81 $ |
| 3 | ID-Wache + Textfeld-Wache (der neue ENTWURF) | 29 | 29 | 11 | 12,77 $ |
| | **Summe** | **63** | **63** | **20** | **42,81 $** |
| 19.09.2026 | **Planprüfung Schreibreihenfolge Fassung 2** (sol, Repo-Lesezugriff) | Papier + 13 Auszüge + Sperrlandschaft, 42.838 Token; 92 Suchen / 47 Lesungen / 21 Runden | 11 | **10** | 0 (1 = Betreiber-Entscheidung) | **17,42 $** |
| 19.09.2026 | dieselbe Planprüfung, zweite Spur (deepseek-v4-pro, ohne Repo) | wortgleich, 42.838 Token rein / 23.649 raus | 2 | **2** | 0 | ~0,05 $ |
| 19.09.2026 | dieselbe Planprüfung, dritte Spur (**kimi-k3**, A/B) | wortgleich bis auf `model`; 44.704 rein (44.544 aus dem Cache) / 26.885 raus | 7 | **7** | 0 | **~0,42 $** |
| 19.09.2026 | **Planprüfung Runde 3** (kimi-k3), eng auf die beiden Neuentwürfe S6/S1 | Papier + 10 Auszüge, 32.901 rein / 21.653 raus | 8 | **8** | 0 | **~0,30 $** |

**Das ist die mit Abstand grösste Prüfserie dieser Datei — und die einzige, in
der KEIN einziger Befund gefallen ist.** Zum Vergleich: am 12.09. fielen drei
von neun, am 13.09. einer von drei.

**Was daraus für die REGEL folgt — drei Dinge, und das dritte ist das
unangenehmste:**

**1. Die Regel „der Plan geht VOR der ersten Bau-Runde raus" ist jetzt
belegt, nicht mehr behauptet.** Zwanzig blockierende Befunde an PAPIER, für
42,81 $. Vier davon hätten falsche Regeln in eine kanonische `core/`-Datei
geschrieben, auf die danach vier Orte zeigen; einer hätte einen legitimen
heutigen Aufrufer gebrochen; einer stützte eine ganze Ausklammerung auf eine
falsche Tatsachenbehauptung.

**2. Eine Runde über die BEHEBUNGEN findet eine eigene Klasse.** Alle fünf
blockierenden Befunde der zweiten Runde betrafen die Korrekturen, nicht den
ursprünglichen Plan — eine Runde hätte sie strukturell nicht finden können.
Die Rundenbegrenzung aus CLAUDE.md („zweite Runde, wenn die Behebung Verhalten
ändert") trägt und hat hier zum ersten Mal wirklich gegriffen.

**3. Die dritte Runde hat den ENTWURF gekippt, nicht das Papier — und das ist
ein Ergebnis über MICH.** Sie fand, dass mein Inventar-Wächter seine eigenen
Paradebeispiele nicht sieht (`aufgaben` ist destrukturiert, die Zeile
`aufgaben.trim()` enthält kein `req.body`; `tablet-sperre.js:546` ist eine
Body-ID, keine `:id`-Route). Die Antwort war deshalb **kein vierter Entwurf,
sondern ein KLEINERER Beitrag**: elf gemessene Eintrittspunkte, drei
gemessene Verhaltensänderungen, jeder ausgeklammerte Fundort aufgeschrieben.
Dreimal hintereinander war meine handgemachte Stellenliste unvollständig und
viermal an einem Tag ein Suchmuster von mir falsch — wer nach so einer Serie
noch einmal grösser plant, hat aus der Serie nichts gelernt.

**Über die Spuren, mit der nötigen Einschränkung:** Überschneidung 3 von 17,
1 von 17, wenige in Runde 3 — deutlich mehr als bei Bündel 1 und am 13.09.
(je null). Plausible Erklärung: dort war das Material Code, hier ein Papier,
über dessen Schwächen beide Fragen stolpern müssen. **Nicht belegt.** Was
belegt ist: die 0,04-$-Spur lieferte in ALLEN DREI Runden Befunde, die die
teure nicht hatte — und die teure in allen drei welche, die nur mit
Repo-Lesezugriff erreichbar waren.

---

## 19.09.2026 — Diffprüfung ID-Wache: der wertvollste Befund kam vom AUSFÜHRENDEN

Zwei Spuren über den fertigen Diff, 17 Befunde, **12 nach eigener Nachmessung
getragen, 5 gefallen** (drei davon in der Schwere, zwei sachlich).

**Der schärfste Befund des ganzen Beitrags stammt aber aus keiner der beiden
Prüfspuren, sondern aus einer Nebenbeobachtung des EXECUTERS** bei seiner
eigenen Gegenprobe: PostgreSQL 16 akzeptiert `'0x10'` als int4. Selbst
nachgemessen am echten Cluster:

    '0x10'       -> 16            (KEIN Fehler)
    '1e3'        -> ERROR 22P02
    '1.5'        -> ERROR 22P02
    '2147483648' -> ERROR 22003
    ' 12'        -> 12

**Damit sind vier Produktivkommentare falsch**, die seit dem 28.08.2026
behaupten, `0x10` werfe 22P02. Es wirft nicht — `/geraete/loeschen/0x10` hätte
vor diesem Beitrag **still Gerät 16 gelöscht**. Das ist schlimmer als der
dokumentierte Fehler und der eigentliche Grund für die Wache.

**Spur 1 hat denselben Befund unabhängig geliefert** (B4) — und sie war die
einzige der beiden, die ihn hatte. Spur 2 fand dafür, dass die
Verhaltensänderung nicht „genau drei Fälle" umfasst, sondern zusätzlich jede
reine Null-Ziffernfolge (`"00"`, `"000"`, … — gemessen: alt gültig, neu
ungültig). Beides sind Korrekturen an MEINEN eigenen Messungen.

**Was gefallen ist, und warum es zählt:**

* **Zum DRITTEN Mal** hat Spur 1 einen normalen statischen Wächter als
  blockierenden Verstoss gegen „Tests fassen kein echtes Dateisystem an"
  gemeldet. Gemessen: **187 bestehende Testdateien** benutzen
  `fs.readFileSync`, und `test/helfer/quelltext-scan.js` benutzt sogar
  `git ls-files` als ausdrücklich gesegnete Referenz von aussen. Der blinde
  Fleck ist systematisch, nicht zufällig — er steht seit dem 16.09. in dieser
  Datei und hat sich seither zweimal wiederholt.
* Eine geforderte Zusatzprüfung (`99999999999` je Route) fiel, weil
  `2147483648` der SCHÄRFERE Grenzwert ist und bereits in jeder Routenmatrix
  steht. Mehr Fälle sind nicht mehr Abdeckung.

**Für die Regel:** Die Diffprüfung hat sich gelohnt (12 getragene Befunde,
davon sieben falsche Kommentar-Behauptungen und zwei echte Testschwächen) —
aber der teuerste Fund des Tages kostete 0 $ und kam aus einer Gegenprobe, die
jemand nicht abgehakt, sondern gelesen hat. **Ein Ausführender, der eine
Nebenbeobachtung MELDET, ist die billigste Prüfspur, die wir haben.**

---

## 19.09.2026 — Planprüfung Schreibreihenfolge: der PLAN war falsch, nicht seine Ausführung

17 Befunde, **17 nach eigener Nachmessung getragen**, vier blockierend.
Einzelurteile im Nachtrag von `plaene/auftrag-schreibreihenfolge.md`.

**Der Befund, der für die REGEL zählt: der zentrale Behebungsvorschlag des
Papiers schliesst seine eigene Fehlerklasse nicht** — und **BEIDE Spuren
fanden das unabhängig voneinander.** Ich wollte ein committendes UPDATE hinter
den fehlbaren Schritt ziehen; gemessen steht `auditAppend` auch danach dahinter
und der `catch` löscht weiterhin die frisch referenzierte Datei. Mein Papier
stellte die zwei Behebungsteile ausdrücklich als Alternativen dar („Teil 2 ist
der bessere Entwurf") — es braucht beide.

**Das hätte KEINE Diffprüfung gefunden.** Eine Diffprüfung hält den gebauten
Code gegen den Plan; hier war der Plan falsch. Damit steht zum zweiten Mal
gemessen, wofür die Regel „der Plan geht VOR der ersten Bau-Runde raus" da
ist — beim ersten Mal (15.09., Ausmusterung) strich ein Befund einen ganzen
geplanten Beitrag.

**Dritter Fall an einem Tag, dass eine Tatsachenbehauptung von MIR fiel:**
Ich schrieb, drei Mitarbeiter-Routen läsen ihre Zeile NACH dem UPDATE.
Gemessen lesen alle drei VORHER. Ich hatte den Satz aus dem Bericht des
Ausführenden übernommen, ohne ihn zu messen — dieselbe Klasse wie der
`parseIds`-Auftrag zwei Stunden zuvor. **Eine Zahl oder Aussage aus einem
Bericht ist eine Behauptung, auch wenn der Bericht sonst zuverlässig war.**

**Und ein Fundort, dessen Schwere ich zu niedrig angesetzt hatte:** Bei
`pin-direkt` committet das PIN-UPDATE, danach läuft die Token-Entwertung als
zweiter Pool-Commit. Scheitert sie, ist die PIN gesetzt, der Benutzer sieht
eine Fehlerseite — und alte Einladungs-/Reset-Tokens bleiben gültig und
können die PIN später erneut ändern. Ich hatte die drei Routen als „kein
Datenrisiko, nur irreführende Rückmeldung" geführt.


---

## 19.09.2026 abends — Planprüfung Runde 2, und was sie über die Spuren sagt

**Überschneidung diesmal VOLLSTÄNDIG statt null.** Beide DeepSeek-Befunde
(Z2c unerreichbar, Z7 nicht rotfähig) waren eine echte TEILMENGE der elf
sol-Befunde. Am 13.09.2026 hatten zwei Spuren über einen Diff **null**
Überschneidung; heute über ein PAPIER volle. Das ist keine Umkehr der
damaligen Messung — es ist eine zweite Stichprobe mit anderem Gegenstand
(Plan statt Diff) und anderem Zuschnitt (sol mit Repo-Lesezugriff, deepseek
ohne). **Wer daraus „die zweite Spur lohnt nicht" ableitet, hat aus einem
Lauf eine Regel gemacht.** Sie kostete 0,05 $.

**Der teuerste Befund war einer, nach dem ich gefragt hatte — aber an der
falschen Stelle.** Meine Frage 1 lautete wörtlich: „Nenne jeden konkreten Weg,
auf dem die neue Transaktion mit einem bestehenden zu einem Kreis wird." Sie
zielte auf S2. Für S2 kam „kein Kreis", sauber begründet. Der Kreis lag bei
**S6**, wo ich nicht gefragt hatte. Eine gezielte Frage richtet die
Aufmerksamkeit aus; sie verengt sie nicht.

**Zwei Fassungen hintereinander war meine BEHEBUNG die Gefahr, nicht der
Befund** — und zwar in entgegengesetzte Richtungen: bei S2 war die Transaktion
richtig und der Reihenfolgentausch falsch, bei S6 genau umgekehrt. Die Regel
dazu steht jetzt in CLAUDE.md unter „Transaktionen und Sperren".

**Vier von elf Befunden betrafen Zusicherungen, die nicht rot werden können**
(B4, B5, B6, B7) — unsere teuerste Klasse, und alle vier an einem Papier
gefunden, das noch keine Zeile Code hatte.

## 19.09.2026, 22:38 UTC — der erste Kimi-Lauf, und was der A/B wirklich hergibt

**7 Befunde, alle sieben nach eigener Nachmessung getragen, SECHS davon hatte
keine der beiden anderen Spuren.** Der Auftrag war wortgleich zur
DeepSeek-Spur (maschinell verglichen, einziges abweichendes Feld `model`).

**Die Klasse, die nur Kimi traf, ist einheitlich und das ist der eigentliche
Befund:** innere Widersprüche des PAPIERS. S6 gegen Z5b, S1 gegen seine eigene
Schadensbeschreibung, Z4d gegen den tatsächlichen Bestand, eine Zählung und
ein Codezitat gegen den Quelltext. Es hat das Papier gegen SICH SELBST
gelesen. Sol hat stattdessen die Umgebung abgesucht und dort den
Verklemmungskreis gefunden (B3), den Kimi nicht hatte — es hatte
`mitarbeiter-auth.js` gar nicht im Bündel.

**Der Vergleich ist NICHT gleichwertig, und das gehört dazu:** sol durfte im
Repo lesen (47 Lesungen, 92 Suchen, 21 Runden), Kimi bekam ein festes Bündel
und einen Schuss. „Kimi findet mehr" wäre deshalb eine Behauptung, die diese
Messung nicht trägt. Was sie trägt: **der dritte Sucher deckt eine Klasse ab,
die die anderen beiden nicht abdecken** — dieselbe Beobachtung wie am
13.09.2026, an einem dritten Gegenstand.

**Kostenverhältnis am selben Gegenstand:** sol 17,42 $ (mit Repo-Zugriff),
kimi ~0,42 $, deepseek ~0,05 $.

**Nebenbefund, der uns etwas spart:** 44.544 der 44.704 Eingabe-Token kamen
aus dem automatischen Präfix-Cache — Reste der beiden abgebrochenen Versuche
davor. **Damit ist der Cache an unserem eigenen Material belegt**, nicht nur
behauptet; er hat die Kosten dieses Laufs auf etwa ein Fünftel gedrückt.

## 19.09.2026, 22:53 UTC — Runde 3, und ein Muster über drei Fassungen

**8 Befunde, alle acht nach eigener Nachmessung getragen.** Einer davon war
Minuten vorher schon von mir selbst gefunden — er zählt als BESTÄTIGUNG, nicht
als Fund, und steht so in der Tabelle des Papiers.

**Der teuerste Befund ist zum DRITTEN Mal in Folge ein Fehler meiner
BEHEBUNG, nicht des Befunds:**

| Fassung | Der Befund war | Meine Behebung wäre gewesen |
|---|---|---|
| 1 | richtig | ein Rennen im Normalbetrieb |
| 2 | richtig | eine echte Verklemmung (`40P01`) |
| 3 | richtig | ein offenes Token trotz neuer PIN |

Dreimal hintereinander unstrittiger Befund, dreimal die vorgeschlagene Abhilfe
als eigentliche Gefahr. **Das ist keine Pechsträhne, sondern eine Eigenschaft
dieser Klasse:** wer eine Schreibreihenfolge ändert, VERSCHIEBT ein Fenster,
statt es zu schliessen — und ob das hilft, hängt an allen anderen Wegen, die
dieselben Zeilen anfassen. Die Regel steht seit heute in CLAUDE.md.

**Und eine Beobachtung zur Fragestellung.** Der Fund R3-1 lag in einem Weg,
nach dem ich NICHT gefragt hatte: ich fragte nach Verklemmungen (Runde 2) und
nach Verschränkungen mit dem Einlöse- und dem Löschweg (Runde 3). Der Weg, der
Tokens ERZEUGT, stand in keiner meiner Fragen. Gefunden wurde er, weil eine
Frage offen genug gestellt war: *„welchen Zustand erzeugt das, den es heute
nicht gibt?"* — **eine Frage nach einem ZUSTAND findet mehr als eine Frage
nach einem MECHANISMUS.** Das ist übertragbar und gehört in jeden künftigen
Prüfauftrag.

**Kostenbilanz der drei Runden über dieses eine Papier:** 17,42 $ (sol) +
0,05 $ (deepseek) + 0,42 $ (kimi, Runde 2) + 0,30 $ (kimi, Runde 3) =
**rund 18,19 $ für 45 Befunde, von denen 44 getragen haben** — und keine
einzige Zeile Produktivcode wurde dafür geschrieben.
## 20.09.2026 — Kimi gegen einen Diff MIT Lösungsschlüssel

Der erste Lauf, bei dem wir die Antworten vorher kannten: derselbe Diff
(Beitrag C), dasselbe Bündel (`md5 b1dba825…`), dieselbe Frage
(`md5 0b59e544…`), nur `model` getauscht. 26 Befunde aus zwei Spuren waren
vorher von mir einzeln nachgemessen.

| | sol (xhigh) | kimi-k3 (max) |
|---|---|---|
| Befunde | 7 | **7** |
| nach eigener Nachmessung getragen | 5 | **6 ganz, 1 im Kern** |
| gefallen | **2** | **0** |
| Kosten | ~1,46 $ | **~1,19 $** |
| Dauer | 348 s | **1401 s** |
| Ein-/Ausgabe | 156.450 / 22.586 | 171.502 / 44.944 (37.596 Denk) |

**Was Kimi hatte und sol NICHT: den REGRESS.** K5 = der catch-Zweig lässt die
hochgeladene Datei bei ungültiger `:id` liegen, obwohl nachweislich nichts
geschrieben wurde. Das war der teuerste Befund des ganzen Beitrags; sol hat
ihn nicht gesehen, nur `/code-review`.

**Was NUR Kimi hatte (keine der drei anderen Spuren):** ein konkreter
Verklemmungsweg zwischen `/freischalten-alle` (Autocommit) und
`/neue-version` (jetzt in der Transaktion) — dasselbe
`INSERT … SELECT … ON CONFLICT` ohne `ORDER BY` über dieselbe Schlüsselmenge,
und die neue Transaktion hält ihre Zeilensperren bis zum COMMIT statt nur
für die Statementdauer. **Plausibel, aber NICHT gemessen** — es bräuchte eine
Lastprobe. Als offener Befund geführt.

**Und eine Berichtigung MEINER eigenen Prüffrage, von mir nachgemessen:** ich
hatte geschrieben, die neue Transaktion halte „FK-Sperren auf `mitarbeiter`".
`belehrung_freischaltung` hat **gar keinen Fremdschlüssel** (`core/db.js`,
nur `UNIQUE(studio_id, mitarbeiter_id, belehrung_id)`). Meine Schlussfolgerung
(kein Kreis) bleibt richtig — eine Sperre, die es nicht gibt, kann keinen
Kreis schliessen —, aber ein Glied meiner Begründung war falsch.

**Die Schwäche zeigte sich genau dort, wo die Recherche sie verortet.** K2
beschreibt die Lücke richtig (ohne `t` wird die Mutation von keinem Test
gefangen) und den SCHADEN falsch: Kimi behauptet, ein Audit-Eintrag bliebe
als falsche Beweisurkunde stehen. Gemessen am Quelltext hängt der Aufruf
stattdessen (zweite Poolverbindung auf denselben Advisory-Lock,
`core/integritaet.js:97`). Selbstbewusst, konkret, im Mechanismus falsch —
das Profil aus der Recherche im Kleinen.

**Was dieser Lauf NICHT hergibt:** ein Diff, ein Tag. Er sagt nichts darüber,
ob Kimi bei einem Diff OHNE Lösungsschlüssel ebenso präzise wäre — und der
Lösungsschlüssel hat die Bewertung erst möglich gemacht, nicht die Befunde.

## 20.09.2026 — S6, vierte Lesung: ZWEI Spuren, ZWEI verschiedene blockierende Klassen

Erste Anwendung der Betreiber-Entscheidung von heute. Auswahl nach dem
Grundsatz „verschiedene Spuren sehen Verschiedenes": **DeepSeek hatte S6 noch
NIE gesehen** (frisches Auge), Kimi kannte die Vorgeschichte (es hatte
Entwurf 2 gekippt). Dasselbe Bündel, dieselbe Frage, parallel.

| | deepseek-v4-pro | kimi-k3 |
|---|---|---|
| Befunde | 4 | 5 |
| Dauer | 564 s | 1120 s |
| Ein/Aus | 57.836 / 25.510 | 61.415 / 30.219 |
| Kosten | ~0,06 $ | **~0,64 $** |

**Beide fanden eine blockierende Klasse — und JEDE übersah die der anderen.**

* **DeepSeek D1:** Schritt 3 schliesst das Erzeugerfenster NICHT. Unter
  READ COMMITTED sieht sein UPDATE nur, was beim Statement-Beginn sichtbar
  war; eine Einladung, die danach committet, überlebt. Endzustand: neue PIN
  UND gültiges Token — genau der von Z6a verbotene Zustand.
  **Nachgemessen:** `sendeMitarbeiterEinladung` (`routes/mitarbeiter-auth.js:183-186`)
  ist der EINZIGE Erzeuger von `mitarbeiter_token`; Isolationsstufe ist
  `read committed` (gegen die DB gemessen). **Trägt.**
  Kimi hat denselben Mechanismus in K4 berührt, ihn aber als
  Dokumentationsungenauigkeit mit Schwere „niedrig" eingestuft — die
  blockierende Folge zog nur DeepSeek.
* **Kimi K1:** Z6b sichert „kein 40P01 in JEDER Verschränkung" zu. Das ist
  falsch. **Nachgemessen:** kein Index auf `mitarbeiter_token(mitarbeiter_id)`
  (nur PK und `token UNIQUE`) → der Mehrzeilen-UPDATE läuft als Seqscan in
  physischer Reihenfolge; der öffentliche PIN-Weg sperrt erst EINE Zeile per
  `id` (`:296`) und nimmt danach den Mehrzeilen-UPDATE (`:301`). Bei zwei
  offenen Tokens ist ein Kreis konstruierbar. **Trägt** — aber als Befund
  gegen die ZUSICHERUNG, nicht als neuer Defekt: derselbe Mehrzeilen-UPDATE
  steht heute schon in `pin-direkt`. Auf dem Live-Deploy-Gate wäre das ein
  Test, der auf KORREKTEM Code rot werden kann.
  DeepSeek hatte diesen Befund nicht.

**Beide unabhängig:** weder Z6a noch Z6b bewacht Schritt 3 — ihn ersatzlos zu
streichen lässt beide grün (D2 und K2, getrennt hergeleitet). Die Suite würde
also den bereits gefallenen Entwurf 2 wortwörtlich durchwinken.

**Nur Kimi (K3):** der Kommentar über `sendeMitarbeiterEinladung` behauptet,
die Transaktion verhindere zwei gültige Links. Unter READ COMMITTED tut sie
das nicht — und genau das macht „mehrere offene Tokens" (die Vorbedingung von
Z6b und von K1) überhaupt erreichbar.

**Folge: Entwurf 3 fällt. Drei Entwürfe, drei gefallen** — jeder erst beim
Gegenlesen, jeder an einer anderen Klasse (Verklemmung / übersehener
Erzeuger / Sichtbarkeitsfenster).

**Was dieser Lauf für die Entscheidung von heute hergibt:** er ist der
bisher klarste Beleg. Zwei Spuren, zwei blockierende Befunde, NULL
Überschneidung bei den blockierenden — und die billigere (0,06 $) fand den
Befund, der den Entwurf kippt. Der Preis sagt weiterhin nichts über den Ertrag.

---

## 20.09.2026 — Planprüfung Beitrag A (S5): DREI Spuren, VERSCHIEDENE Bündel

**Erster Lauf nach der Betreiber-Entscheidung „verschiedene Bündel statt
desselben".** Geprüft wurde ein AUFTRAGSPAPIER vor der ersten Bau-Runde, nicht
ein Diff. Frage und Vorspann bei allen drei Spuren wörtlich gleich; nur das
Material unterschied sich.

| Spur | Modell | Bündel | Eingabe-Token | Ausgabe (davon Denken) | Dauer | Befunde | tragen |
|---|---|---|---|---|---|---|---|
| eng | `gpt-5.6-sol` (xhigh) | Papier + `routes/admin/mitarbeiter.js` | ~20.100 | – | ~330 s | 8 | 6 |
| tests | `deepseek-v4-pro` | + fünf Prüfdateien | 49.145 | 18.253 (16.545) | 324 s | 4 | 3 |
| umkreis | `kimi-k3` (high) | + PIN-Weg, `core/ui-feedback.js`, `core/db.js` | 79.660 | 28.577 (21.158) | 883 s | 9 | 7 |

**21 Befunde, 16 tragen nach eigener Nachmessung.** Kosten grob: sol der
teuerste, deepseek und kimi im Cent- bis Ein-Dollar-Bereich.

**ZWEI ABGEBROCHENE LÄUFE, beide mit Strichen statt Nullen:**

| Spur | Modell | Abbruch | Befunde | Kosten |
|---|---|---|---|---|
| tests | `deepseek-v4-pro` | `finish_reason: length`, 16.000/16.000 Ausgabe-Token ins Denken | — | angefallen |
| umkreis | `kimi-k3` (xhigh) | `status: incomplete`, `max_output_tokens`, **44.997 von 45.000** ins Denken, drei Token Antwort | — | angefallen |

Beide hätten als „0 Befunde" durchgehen können. Aufgefallen sind sie nur,
weil bei JEDEM Aufruf der `status` geprüft wird.

**GEMESSEN und für die Praxis brauchbar: `kimi-k3` mit `reasoning.effort:
xhigh` braucht auf einem Bündel von ~80.000 Eingabe-Token mehr als 45.000
Ausgabe-Token allein fürs Denken.** Mit `high` auf demselben Material: 21.158
Denk-Token, `completed`, neun Befunde. Also weniger Denken UND ein Ergebnis —
die CLAUDE.md-Notiz „für Sachfragen ist `high` das bessere Geschäft"
bestätigt sich hier an einer echten Prüfaufgabe.

### Was die verschiedenen Bündel gebracht haben

**Überschneidung bei allem, was IM PAPIER steht** — vier Punkte fanden
mehrere Spuren unabhängig (Z5a-1b schwach; Z5c ohne Positivkontrolle;
`email_fehler` mit zwei Erzeugern; die beiden Riegel decken einander zu). Das
ist keine Überraschung: alle drei lasen dasselbe Papier.

**Die Ergänzung kam aus dem ZUSATZmaterial**, und jede Spur hatte etwas, das
keine andere hatte:

* **kimi (Umkreis), allein:** der `tone`-Befund (nur mit
  `core/ui-feedback.js` sichtbar — ohne `tone: "error"` rendert die
  Fehlermeldung als grünes Erfolgsbanner), das dreifach vorkommende
  SQL-Muster, die dreigeteilte Formatfehler-Antwort, die Wurzel in
  `loeschen`.
* **deepseek (Tests), allein:** dass die bestehenden No-Op-Gegenproben nur
  Status 302 prüfen.
* **sol (eng), allein:** die fehlende `studio_id`-Vorschrift für die
  Löschabfrage des Tests.

**Der blinde Fleck ist NICHT gratis — das ist der neue Teil der Messung.**
Alle drei gefallenen Befunde (sol E1 und E6, kimi K1) fallen an einer
Tatsache, die in den TESTDATEIEN steht: dass die Suite nur gegen eine
`_test`-Datenbank läuft, dass keine der Dateien `db.run` stubbt, und dass es
sehr wohl einen Erfolgspfad-Test für `pin-direkt` gibt. Wer das Material
verteilt, kauft Ergänzung mit Fehlalarmen, die der Haupt-Agent nachmessen
muss.

### Das Ergebnis, das nur mehrere Spuren liefern konnten

**sol und kimi gaben zur selben Entscheidung ENTGEGENGESETZTE Empfehlungen** —
gestützt auf dieselbe, von beiden richtig gelesene Tatsache (dass
`pin-direkt:762` heute ein verwaistes Token nebenbei abräumt). sol wollte die
Aufräumung erhalten, kimi sie fallen lassen. Entschieden wurde am Argument:
ein unprotokollierter Schreibzugriff auf einem als gescheitert gemeldeten Weg
ist in einem System, dessen Kern die Beweiskette ist, teurer als eine
zufällige Aufräumung. **Ein einzelner Prüfer hätte mir eine der beiden als
„die" Antwort geliefert.**

**Und ein „blockierend" fiel wieder an einer Prämisse:** deepseek T1
behauptete, ein UPDATE mit unverändertem Wert liefere `rowCount = 0`. Das ist
MySQL-Semantik. Gemessen an einer Wegwerf-Datenbank, vier Fälle einzeln —
identischer Wert, geänderter Wert, fehlende Zeile, NULL auf NULL — `rowCount`
zählt in PostgreSQL die GETROFFENEN Zeilen. Die Schwereeinstufung ist eben in
beide Richtungen eine Behauptung, bis sie gemessen ist.

---

## 20.09.2026 — sieben weitere Läufe an einem Tag

Vier davon sind **keine Code-Prüfungen**, sondern Markt- und
Gestaltungsrecherche (Betreiber-Auftrag). Sie stehen hier trotzdem, weil die
Hausregel jeden Lauf des Gegenlesers zählbar verlangt — und weil ihr Ertrag
sich nach derselben Regel bemisst: getragen ist, was der Haupt-Agent SELBST
nachgemessen hat.

**Kosten:** `kimi-k3` und `deepseek-v4-pro` stehen NICHT in der Preistabelle
von `tools/gegenleser-repo.js`. Sie werden hier als **unbekannt** geführt,
nicht als Null — genau die Unterscheidung, die der Kommentar bei
`kostenSchaetzen()` verlangt.

### Planprüfung Ladebestand (Papier), zwei Spuren

| Spur | Modell | Material | rein | raus (denk) | Dauer | Befunde | Kosten |
|---|---|---|---|---|---|---|---|
| eng | `gpt-5.6-sol` (xhigh) | Papier + `routes/admin/geraete.js` (alle zehn Aufrufer) | 119.451 | 21.188 (17.562) | 269,5 s | s. u. | 1,23 $ |
| umkreis | `kimi-k3` (high) | Papier + bestehender Wächter + die Module der destruktiven Ableitung + `core/db.js`, OHNE die Routendatei | 110.508 | 24.396 (17.659) | 661,5 s | s. u. | unbekannt |

**Der teuerste Befund dieses Papiers kam von KEINER der beiden Spuren**,
sondern aus meiner eigenen Mutationskette: die geplante Umbenennung hätte
`test_feature_brandschutz.js:410` rot gemacht (Fenster 400 Zeichen). Das ist
dieselbe Beobachtung wie am 20.09. früh — die ausführende Spur findet, was
Lesespuren nicht finden können.

### Diffprüfung Ladebestand, EINE Lesespur (nach der Spurenreduktion)

| Spur | Modell | Material | rein | raus (denk) | Dauer | Befunde | getragen | Kosten |
|---|---|---|---|---|---|---|---|---|
| geschwister | `deepseek-v4-pro` | Diff + Testausgaben + `test_feature_ladestand_dbfehler.js` + `core/ausstattung.js` + `core/brandschutz-vorlage.js` + `core/db.js`, OHNE die 442-KB-Routendatei | 107.236 | 19.305 (16.741) | 303,0 s | 5 | **1** gebaut, 3 zutreffend aber bewusst nicht gebaut, 1 bekannter offener Punkt | unbekannt |

**Der eine gebaute Befund ist die teuerste Klasse und wurde von ZWEI Spuren
unabhängig gefunden** — von dieser und von mir beim Diff-Lesen:
`getRouteExistiertImQuelltext` liest den ROHEN Quelltext, also mit
Kommentaren. **Selbst gemessen, zweiteilig:** Route umbenannt auf
`…/ausstattung-x` UND eine Kommentarzeile mit dem alten Pfad eingefügt →
**EXIT 0, 12 PASS / 0 FAIL**, während der Link in Wirklichkeit 404 liefert.
Eine Zusicherung, die nicht rot werden kann.

*Methodischer Nebenertrag:* Der erste Mutationsversuch (die Route schlicht
auskommentieren) ergab einen **SyntaxError** — der Handler-Rumpf hängt dann
in der Luft. Ohne das vorgeschriebene `node --check` wäre dieses EXIT 1 als
Beleg durchgegangen. Die Regel hat an diesem Tag zum ersten Mal gemessen
gegriffen.

**Drei zutreffende Befunde wurden NICHT gebaut**, jeder mit Grund im
Auftragstext: die verbleibende sichtbare Inkonsistenz (beabsichtigter Tausch
gegen stille Zerstörung), die spröde SQL-Literalkopplung (absichtlich, ein
loseres Muster träfe die Nachbarabfragen), und HTTP 200 auf dem Fehlerweg
(bekannter offener Punkt über das ganze Repo, nicht von diesem Beitrag
eingeführt).

### Planprüfung M3 (Startseite), zwei Spuren, verschiedene Bündel

| Spur | Modell | Material | rein | raus (denk) | Dauer | Befunde | Kosten |
|---|---|---|---|---|---|---|---|
| eng | `gpt-5.6-sol` (xhigh) | Papier + `landing/index.html` | 25.305 | 26.434 (21.754) | 372,9 s | 8 | 0,92 $ |
| umkreis | `kimi-k3` (high) | Papier + `test_landing.js` + `test_rechtsaussagen.js`, OHNE die Seite | 20.647 | 42.934 (33.181) | 1090,1 s | 14 | unbekannt |

**22 Befunde, 16 nach eigener Nachmessung getragen, 2 gefallen, 1
unbestätigt, 3 ausserhalb des Auftrags. Überschneidung: 2 von 22.**

**Der blockierende Befund war nur über das WÄCHTER-Bündel erreichbar:**
`test_landing.js:46-73` prüft einen SHA-256 je Landing-Datei gegen
`manifest.json`. Ohne ihn wäre nicht nur Tor 1 unerreichbar gewesen — **jede
der fünf geplanten Gegenproben hätte zugleich den Hash fallen lassen**, und
„Z-x ist rot" wäre nicht mehr von „der Hash ist rot" zu unterscheiden
gewesen. Fünf ROT-Messungen ohne Beweiswert, ohne dass es auffällt.

**Vier Befunde trafen meine eigenen Zusicherungen:** Z-d war wörtlich gelesen
logisch unerfüllbar (eine Konjunktion, die nie wahr werden kann); Z-a fiel bei
`href="#"` nicht; Z-c nicht bei einer Ziffer; Z-e nicht bei Grossschreibung.

**GEFALLEN, beide sauber widerlegt:**
1. *„`#modules` bleibt kaputt"* — gemessen `href="#modules"` **0×**. Aus dem
   Klassennamen `class="modules"` geraten.
2. *„§ 31 TrinkwV ist vermutlich falsch"* — selbst geholt von
   `gesetze-im-internet.de/trinkwv_2023/__31.html` (HTTP 200): **„§ 31
   Untersuchungspflichten in Bezug auf Legionella spec."** Der Bezug stimmt.
   **Die Spur hatte ihn ausdrücklich als Verdacht und nicht als Nachweis
   gekennzeichnet** — genau deshalb war er billig zu widerlegen.

**UNBESTÄTIGT (weder Befund noch Freispruch):** ob `§ 24 Abs. 6 DGUV
Vorschrift 1` existiert. `publikationen.dguv.de` → HTTP 404, `dguv.de` →
JavaScript-Hülle ohne Normtext. Aus dieser Umgebung nicht entscheidbar.

### Markt- und Gestaltungsrecherche, vier Läufe (KEINE Code-Prüfung)

| Spur | Modell | Suche | rein | raus (denk) | Dauer | Ertrag | Kosten |
|---|---|---|---|---|---|---|---|
| mitbewerber | `gpt-5.6-sol` (xhigh) | **13 Suchaufrufe** | 111.443 | 22.941 (12.657) | 306,2 s | 11 Anbieter, 16 Lücken, 9 benannte unerreichbare Quellen | 1,25 $ |
| homepage | `gpt-5.6-sol` (xhigh) | **11 Suchaufrufe** | 112.264 | 23.568 (14.053) | 371,1 s | 16 Ist-Befunde, 12 Vorschläge, 10 Referenzseiten | 1,27 $ |
| einfach-k | `kimi-k3` (high) | nein | 20.513 | 14.408 (8.213) | 462,3 s | 8 Ideen (4 für den Trainer), 7 benannte Materiallücken | unbekannt |
| einfach-d | `deepseek-v4-pro` | nein | 26.492 | 9.569 (6.966) | 127,6 s | 6 Ideen (alle Admin), 2 benannte Materiallücken | unbekannt |

**Eigene Nachmessung, und sie fiel ungleich aus:**

* **Startseite: 4 von 4 geprüften Befunden tragen** — toter Anker `#module`
  (`href` 1×, `id` **0×**); „Vier Dinge" gegen **fünf** `.pillar`; „Alle sechs
  Module" gegen **14** `.mod`; das `.mod-legal::before`-§ vor **fünf**
  Angaben, die keine Paragraphen sind.
* **Mitbewerber: 11 von 11 URLs erreichbar** (HTTP 200, 117–537 KB), keine
  erfundene Domain. Von sieben Preisangaben **5 exakt bestätigt, 1 teilweise
  (Zahlen richtig, Fundstelle falsch), 1 GEFALLEN** — CheckTouchs
  „Professional ab 79 €" gibt es nicht; die Seite kennt weder den Tarifnamen
  (0 Treffer) noch den Betrag, sondern einen Rechner ab 39 €.
* **Der schärfste Marktbefund, selbst nachgeprüft:** KEVOX nennt denselben
  Premium-Tarif auf `/preise/` mit **168 €** und auf `/software/` mit
  **162 €**. Beide Seiten selbst abgerufen. Dieselbe Aussage an zwei Orten,
  beim Preis.
* **Vereinfachung: 3 von 3 geprüften Ideen tragen**, eine davon grösser als
  gemeldet — die grüne Dashboard-Karte „alle Kontrollen aktuell" prüft eine
  FESTE Teilmenge (`getraenke` kommt in `dashboard.js` **0×** vor, `spuel`
  nur als Frage nach vorhandenen STELLEN). Beide Zähler existieren und werden
  nur von der Trainer-Startseite gerufen, wo eine überfällige Reinigung als
  „harter Verzug" gilt.

**Was diese vier Läufe NICHT hergeben:** keine Aussage über die tatsächliche
Bedienung der Mitbewerber — in neun Fällen stand eine Anmeldung davor, und
die Spur hat das von sich aus in ein eigenes Feld geschrieben statt zu raten.

**Ein eigener Messfehler, der hierher gehört:** mein erstes Preismuster fand
nur `22 €`, nicht `€22`, und hätte drei richtige Befunde als unbelegt
verworfen. Zusammen mit `manipulationssicher` (case-sensitiv 2 statt 6) und
`fälschungssicher` gegen `Fälschungssichere` waren das **drei Musterfehler
derselben Art an einem Tag**. Folge für die Arbeitsweise: jedes Muster über
Text ist case-insensitiv und leerraum-normalisiert, oder es begründet im
Kommentar, warum nicht.

**Summe der bezifferbaren Kosten dieses Abschnitts: 4,67 $** (vier
OpenAI-Läufe). Drei Läufe auf `kimi-k3` und zwei auf `deepseek-v4-pro` sind
angefallen und nicht bezifferbar, solange die Preistabelle sie nicht führt.

---

## 22.09.2026 — Planprüfung der VIERTEN Runde am Ladebestand-Beitrag

Zwei Lesespuren, **verschiedene Bündel** (Betreiber-Entscheidung 20.09.2026),
je ein Aufruf, `reasoning.effort: high`, `stream: true` (Pflicht — der
Egress-Proxy schneidet gegen beide Gegenstellen bei ~300 s ab).

Geprüft wird ein AUFTRAGSPAPIER, nicht ein Diff: der Code der vierten Runde ist
noch nicht gebaut.

| | Spur A | Spur B |
|---|---|---|
| Modell | `kimi-k3` | `deepseek-v4-pro` |
| Schwerpunkt | Produktionsseite | Zusicherungsseite |
| Bündel | Auftragspapier, `geraete.js` 1900-2300 (Helfer), `geraete.js` 2580-3170 (Route), `core/brandschutz-vorlage.js`, Schema `wartung_*` | Auftragspapier, `test_feature_ladebestand_streng.js` (vollständig), `geraete.js` 2580-3170 (Route), Schema `wartung_*` |
| Umfang geschätzt (Faktor 3,71) | 212.478 Bytes ≈ 57k | 220.453 Bytes ≈ 59k |
| Umfang GEZÄHLT (`usage`) | **69.675** | **69.198** |
| Dauer / `finish_reason` | 1011,1 s / `stop` | 541,2 s / `stop` |
| Ausgabe-Token (davon Denken) | 31.729 (27.234) | 26.424 (24.173) |
| Befunde | 4 | 3 |
| davon nach EIGENER Nachmessung getragen | **4** | **2,5** |
| Kosten | nicht bezifferbar (Preistabelle führt Kimi/DeepSeek nicht) | dito |

Überschneidung der Bündel: Papier, Routenausschnitt, Schema. Verschieden:
A hat die Vorlage und die Helferdefinitionen, B hat die Testdatei.

**Positivkontrolle der Methode, vor den Läufen gemessen:** beide Endpunkte
beantworten eine Sachfrage richtig (`kimi-k3` 4,2 s, `deepseek-v4-pro` 1,9 s,
beide „Wien"), ein erfundenes Modell (`kimi-quatschmodell-9`) wird mit HTTP 404
`resource_not_found_error` abgewiesen. Die Methode lehnt also nicht einfach
alles ab und nimmt nicht einfach alles an.

**Verbrauchszahlen:** `deepseek-v4-pro` liefert `usage` im SSE-Strom von sich
aus, `kimi-k3` nur mit `stream_options: {include_usage: true}` — ohne das Feld
kam `usage: null` zurück. Nachgetragen, bevor die grossen Läufe starteten.

### Was die Läufe gebracht haben

**Sieben Befunde, EINE Überschneidung — also sechs verschiedene.** Die
Überschneidung (A1 = B1) ist der blockierende Befund, und dass ihn BEIDE
Spuren hatten, ist bemerkenswert: bei verschiedenen Bündeln überlappt nach der
Messung vom 20.09. normalerweise wenig.

**Der teuerste Fund war A2, und er hat Schaden verhindert statt Aufwand zu
sparen.** Meine geplante Behebung (eine CTE ohne `FOR UPDATE`) hätte bei einem
nebenläufigen Schreiber dessen committete Änderung überschrieben —
Datenverlust gegen einen falschen Satz auf einer Fehlerseite eingetauscht.
Gemessen gegen PostgreSQL 16 mit einem echten Fremdschreiber; der
Fremdschreiber ist über die Bearbeiten-Route real erreichbar. Einzelheiten in
`plaene/auftrag-ladebestand-nacharbeit.md`, Abschnitt „Planprüfung Spur A".

**Die halbe Zählung bei Spur B** betrifft B2: die „zu schmal"-Hälfte (Alias)
trägt und stand schon im Auftrag, die „zu breit"-Hälfte fällt beim
Nachmessen — `\bdb\b` trifft `dbHinweis` und `db_hinweis` nicht, weil `\b`
eine Wortgrenze verlangt. Ihr Gegenvorschlag wurde abgelehnt, ebenfalls
gemessen: das engere Muster übersieht die Alias-BILDUNG im Bereich.

**Eine eigene Berichtigung, die aus diesen Läufen folgt:** die
Bytes→Token-Umrechnung mit Faktor 3,71 lag bei beiden Bündeln rund 17 % zu
niedrig (57k/59k geschätzt gegen 69,7k/69,2k gezählt). Für die Nähe zur
Kontextgrenze ist das erheblich. Der Faktor stammt aus einer Messung an EINEM
Bündel vom 19.09.2026; diese beiden hier sind zwei weitere Datenpunkte und
zeigen in dieselbe Richtung.

**Die Spuren haben nicht dasselbe gekonnt, und zwar nachvollziehbar:** Spur B
hatte die Testdatei und beantwortete die Zusicherungsfragen; Spur A hatte die
Vorlage und die Helferdefinitionen und fand die Nebenläufigkeit. Spur A hat
ihre eigene Grenze dabei ausdrücklich benannt („von mir nur zu einem Fünftel
nachgemessen"), statt eine Bestätigung zu raten — und genau diese Ehrlichkeit
hat eine Messung angestossen, die ich nicht geplant hatte (`kategorie_id`
kommt in null SET-Listen vor).

---

## 22.09.2026 — Diffprüfung der vierten Runde `ladebestand` (Diff `9d3fc3b..3a7cad5`)

Erster Lauf nach der Spurenreduktion vom 20.09.2026 in der vorgesehenen
Besetzung: **ausführende Claude-Spur + EINE Lesespur mit anderem Bündel.**

| | ausführende Spur (Claude, `/code-review`) | Lesespur (`kimi-k3`) |
|---|---|---|
| Material | Diff, freie Dateiwahl, darf messen | Diff, Schema-Ausschnitt `core/db.js:780-900`, Routenbereich `:2660-3000`, Geschwisterwächter `test_feature_brandschutz.js` vollständig, ALLE Gegenproben-Zahlen |
| Befunde | 11 | 4 (abgeschnitten) |
| nach eigener Nachmessung getragen | 10 von 11 | 4 von 4 |
| nur von dieser Spur | 7 | 2 |

**Der Lauf der Lesespur ist ABGESCHNITTEN und wird als solcher geführt.**
`finish_reason=length`; 29.611 von 32.000 Ausgabe-Token gingen ins Denken,
55.325 Eingabe-Token, 781,3 s, Antwort 7.220 Zeichen und mitten im vierten
Befund abbrechend. Was danach gekommen wäre, ist UNBEKANNT — nicht „nichts"
und nicht „null Befunde". **Lehre, und sie ist neu:** bei `effort: high` und
einem Bündel dieser Grösse (55k Eingabe) reichen 32.000 Ausgabe-Token nicht.
Das ist dieselbe Klasse wie der OpenAI-Fall vom 11.09.2026, nur bei einem
anderen Anbieter — und die eingebaute Statusprüfung hat sie diesmal sofort
gemeldet, statt sie als „keine Befunde" durchzureichen.

**Die Überschneidung ist gemessen und klein: 2 von 13 verschiedenen
Befunden.** Beide Spuren fanden unabhängig (a) dass die neue
Kommentarbereinigung an einem `//` INNERHALB einer Zeichenkette abschneidet
und damit ein neues Loch in genau den Riegel reisst, den sie schützen sollte,
und (b) dass das Aufräumen der Fixtur auf dem Erfolgspfad statt in einem
`finally` steht. Alles Übrige war disjunkt.

**Der teuerste Befund kam von der ausführenden Spur und war eine FALSCHE
ZUSICHERUNG VON ABDECKUNG** — unsere Klasse Nummer zwei: die
Musterverschärfung `/\bdb\.(run|q|one)\(|\.query\(/` → `/\bdb\b/` hat die
Alternative `\.query\(` ersatzlos verloren, während die Erfolgsmeldung
wörtlich weiter behauptete, `.query(` sei abgedeckt. Selbst nachgemessen über
einen `pool`-Alias ausserhalb des Bereichs: **EXIT 0, 25 PASS / 0 FAIL** bei
umgangenem Riegel.

**Der lehrreichste Befund war einer, den ich NICHT übernommen habe** (C5): die
einfache WHERE-Form statt der CTE. Er trägt vollständig — gegen PostgreSQL 16
gemessen, gleiche Fallmatrix (`0,1,1,1,1,0,0`) und im Nebenläufigkeitsfall
dasselbe Ergebnis wie die CTE MIT `FOR UPDATE`, nur ohne Sperre. Abgelehnt
wurde er trotzdem, weil er den CASE-Ausdruck zweimal hinschreibt, also die
laut eigener CLAUDE.md „häufigste Fehlerquelle in diesem Projekt" in der
Variante einführt, die sich nicht auflösen lässt. **Berechtigt war die Rüge
trotzdem:** der Diff begründete nur, warum kein `includes()`-Vergleich gebaut
wurde, nicht, warum die WHERE-Form verworfen wurde — eine Abwägung, die nicht
aufgeschrieben ist, hat nicht stattgefunden.

**Der einzige gefallene Befund** war C8 in seiner starken Form („die
URL-Gegenprobe kann nicht fallen"): sie kann sehr wohl fallen, meine Mutation
hat sie rot gemessen. Was trägt, ist die schwächere Hälfte — sie ist gegen
ÜBERGIER empfindlich, nicht gegen WEGFALL. Die Behebung ist dieselbe.

**Kosten:** Lesespur 87.325 Token (55.325 ein, 32.000 aus). Die ausführende
Spur läuft im eigenen Kontingent und wird hier nicht beziffert.

---

## 23.09.2026 — Diffprüfung der fünften Runde `ladebestand`

| | ausführende Spur (Claude, darf messen) | Lesespur (`kimi-k3`, Zusicherungsseite) |
|---|---|---|
| Befunde | 14 | 7 |
| nach eigener Nachmessung getragen | 13 (1 fällt zur Hälfte) | 5 (1 fällt zur Hälfte, 1 entfällt) |
| nur von dieser Spur | 9 | 2 |

**Der Lauf, der etwas Grundsätzliches gemessen hat.** Die ausführende Spur
hat den Kommentar-Reiniger widerlegt, den ICH in Runde 5 selbst gebaut,
selbst gegen acht Anforderungen gemessen und dem Executer ausdrücklich als
„das einzige heikle Stück, nicht neu erfinden" vorgegeben hatte. Gemessen:
ein Regex mit einem Anführungszeichen kippt den Zeichenketten-Zustand, ein
späteres `/*` in einer echten Zeichenkette verschluckt dann echten Code —
187 auf 56 Zeichen, der Riegel schlägt nicht mehr an. **Grün und blind,
unsere teuerste Klasse, erzeugt von der Behebung, die sie schliessen sollte.**

**Zwei Lehren, beide über mich:**
1. **Meine acht Prüffälle enthielten keinen mit einem Anführungszeichen im
   Regex-Literal.** Ich habe die Klasse gemessen, die ich mir vorgestellt
   hatte, nicht die, die es gibt. Das ist dieselbe Krankheit wie „Testdaten,
   die den gesuchten Unterschied gar nicht auslösen können" — nur an meiner
   eigenen Messung statt an einer fremden.
2. **Ich habe nicht gefragt, ob es das schon gibt.** `maskiereKommentare`
   liegt in `test/rohwert-scan.js` und wird von **45 Dateien** benutzt
   (selbst nachgezählt); mein Kommentar behauptete, ein solcher Tokenizer sei
   „mehr Apparat, als der Riegel wert ist". Eine falsche Tatsachenbehauptung,
   die einen Vorschlag ausschliesst. **Eine selbstgebaute Lösung gehört ZUERST
   gegen den Bestand gehalten.**

**Das bestätigt die Rangfolge vom 20.09. am teuersten Einzelfall bisher:**
verschiedene FÄHIGKEIT schlägt alles. Die Lesespur hat die Grenzen meines
Automaten korrekt AUFGEZÄHLT (K4) — gefunden, dass er im ECHTEN Bereich
blind wird, hat nur die Spur, die ihn laufen lassen durfte.

**Und die Spuren haben sich gegenseitig berichtigt, in beide Richtungen:**
beim Prüf-Fenster der neuen Sperr-Zusicherung hielt die Lesespur 300 Zeichen
für „plausibel" und schätzte ~90 bis zum Sperrhinweis — gemessen sind es 164,
und bei 300 endet das Fenster in der folgenden Anweisung; dort hatte die
ausführende Spur recht. Umgekehrt fand die Lesespur zwei Dinge, die die
ausführende übersah: dass der Riegel nur eine von vier Schreibweisen abdeckt
(gemessen: `pool.query (x)` mit Leerzeichen und `pool["query"](x)` gehen
durch), und dass eine CASCADE-Behauptung in meinem eigenen Kommentar von
heute falsch ist (`pruefbereich_bestand` hat keine Referenz auf die
Kategorien, `core/db.js:1567-1570`).

**Die Abschneidung der vierten Runde ist behoben:** mit 64.000 statt 32.000
Ausgabe-Token lief die Lesespur vollständig durch (`beendet=stop`, 52.674 ein,
37.567 aus, davon 33.771 Denken, 982,1 s). Die Lehre aus dem vorigen Eintrag
hat gewirkt und ist damit gemessen, nicht nur notiert.

---

## 23.09.2026 — Diffprüfung Runde 6 „ladebestand", Lesespur (`deepseek-v4-pro`)

**Aufbau:** eine Lesespur neben der ausführenden Claude-Spur (Betreiber-Vorgabe
zur Spurenreduktion vom 20.09.2026 abends), mit einem **anderen Bündel**: nicht
Diff + Produktivkontext, sondern Diff + der neuangeschlossene Wächter + der
Hausstandard + **DREI GESCHWISTERWÄCHTER**, die denselben Helfer seit längerem
benutzen. Leitfrage nach der Hausregel „wer zwei Wächter an denselben Helfer
hängt, erbt dessen Stärken NICHT automatisch".

**Material:** 6 Dateien, 331.847 Bytes, gezählt ≈ 89k Token (Abrechnung nennt
105.410 prompt / 22.304 completion, davon 18.953 Denken). 304,5 s,
`beendet=stop`, keine Abschneidung. `stream: true`, `effort: high`.

| Datum | Zweck | Material | Befunde | getragen | gefallen | Kosten |
|---|---|---|---|---|---|---|
| 23.09.2026 | Diffprüfung Runde 6 „ladebestand", Lesespur, Bündel „Geschwisterwächter" | 6 Dateien, 332 KB, 105.410 ein / 22.304 aus, 304,5 s | 6 | **6** | 0 | **unbekannt** (s. u.) |
| 23.09.2026 | Diffprüfung Runde 6 „ladebestand", ausführende Claude-Spur (darf messen) | Diff + beide Dateien + Hausstandard, eigene statische Proben | 14 | **14** | 0 | — |

**Kosten: UNBEKANNT, und das bleibt so.** Ich hatte hier zuerst „~0,05 $"
eingetragen — abgeschrieben aus einer Nachbarzeile, die für `deepseek-flash`
gilt, nicht für `deepseek-v4-pro`. Dieses Protokoll sagt an zwei Stellen selbst,
dass für `deepseek-v4-pro` kein Preis in unserer Tabelle steht und „eine Zahl
wird nicht erfunden". Zeile 2273 verstösst bereits dagegen; ich hätte sie
beinahe ein zweites Mal fortgeschrieben. Eine Kostenzahl gilt je MODELL, nicht
je Anbieter.

**Überschneidung: 3 von 6.** Neu nur in der Lesespur:

* **R3** — der GANZDATEI-Maskierweg (`geraeteOhneKommentare`, für die
  FOR-UPDATE-Zusicherung) hat **überhaupt keine** Positivkontrolle: keine
  Längenprüfung, kein `nichtLeerraum`, kein Code-Anker (selbst nachgemessen).
  Die ausführende Spur fand die Tautologie am AUSSCHNITTS-Weg (A1) und übersah,
  dass der Ganzdatei-Weg gar nichts hat.
* **R4** — `\[\s*.?query.?\s*\]` ist zugleich zu BREIT: gemessen schlägt es an
  `werte[query]`, `obj[ query ]` und `a[queryX]` an. Die ausführende Spur fand
  am selben Teilausdruck die Gegeneigenschaft (zu ENG bei den Namen, A5).
  **Beide sind wahr** — dasselbe Muster ist bei den Namen zu eng und bei den
  Trennzeichen zu breit.
* **Die Prosa-Begründung zu R1/R5** — der schwache Zweitreiniger ist nicht nur
  überflüssig (A11: seine Begründung ist falsch), er ist ein aktiver
  Fehlalarmweg. Gemessen: ein MITTIGER Blockkommentar
  `/* Beispiel: ladeBestand(req.studioId, "wo") */` überlebt ihn vollständig und
  würde in der Z3-Zählung MITGEZÄHLT — die Suite würde an reiner Prosa rot.
  Der Hausstandard maskiert ihn korrekt weg.

### Was diese Lesespur NICHT konnte — und das ist der Beleg für die andere Spur

Auf die ausdrückliche Frage „welche Zusicherung dieses Beitrags kann NICHT ROT
WERDEN?" antwortete sie:

> „Frage 4 konnte ich im aktuellen Stand **nicht** identifizieren: Alle
> hinzugefügten Zusicherungen verwenden literale Sollwerte … oder unabhängige
> Referenzen (Längen aus der Originaldatei, roher vs. bereinigter Ausschnitt)."

**Das ist falsch, und zwar genau bei dem Befund, den die ausführende Spur mit
einer Mutation belegt hat:** die Längengleichheit des Ausschnitts (A1) ist eine
Tautologie, gemessen blieb sie unter einer codefressenden Mutation grün
(29 PASS / 0 FAIL). Die Lesespur hat die Zeile gesehen und für eine
„unabhängige Referenz" gehalten.

**Schlimmer — ihr eigener Behebungsvorschlag hätte den Defekt EINGEBAUT.** Zu
R3 schlägt sie vor: „a) `geraeteOhneKommentare.length ===
GERAETE_QUELLTEXT_ROH.length` (Längenerhalt)". Das ist wörtlich die Tautologie,
die die andere Spur eine Ebene tiefer als blind gemessen hat.

Damit steht zum vierten Mal dieselbe Messung aus dem eigenen Bestand: **eine
Spur, die AUSFÜHREN darf, findet eine andere KLASSE als eine, die nur LESEN
kann** (13.09., 18.09., 20.09., jetzt 23.09.). Die Lesespur liefert
Kontrollfluss und Vergleich mit den Geschwistern; die messende Spur liefert
„diese Zeile zurückdrehen, der Lauf bleibt grün". Wer eine davon weglässt,
verliert nicht Redundanz, sondern eine Klasse.

Und zum dritten Mal in Folge gilt: **der BEFUND trug, die BEHEBUNG war die
Gefahr.** Kein Vorschlag einer Prüfspur geht ungemessen in einen Bauauftrag.

---

## 23.09.2026 — Planprüfung Bauauftrag Runde 7 „ladebestand", ZWEI Lesespuren

Nach der Betreiber-Entscheidung vom 20.09.2026 (abends): Planprüfung = zwei
Lesespuren, **verschiedene Bündel**. Frage und Vorspann gleich, Material
verschieden.

| Datum | Zweck | Material | Befunde | getragen | gefallen | Kosten |
|---|---|---|---|---|---|---|
| 23.09.2026 | Planprüfung Runde 7, Spur A (`kimi-k3`), Bündel „Auftrag + Testdatei + Hausstandard + bewachte Produktivregion" | 5 Dateien, 236 KB; 77.903 ein / 50.417 aus (43.208 Denken), 1342,5 s | 10 | **10** | 0 | unbekannt |
| 23.09.2026 | Planprüfung Runde 7, Spur B (`deepseek-v4-pro`), Bündel „Auftrag + Testdatei + DREI GESCHWISTERWÄCHTER", kein Produktivcode | 6 Dateien, 281 KB; 89.927 ein / 32.036 aus (27.661 Denken), 497,4 s | 5 | **4** | 1 | unbekannt |

Kosten für beide Modelle stehen nicht in unserer Preistabelle; eine Zahl wird
nicht erfunden.

**Überschneidung: 1 von 15** (beide griffen meinen Flag-Vorschlag für den
`finally`-Block an — Spur A über den saubereren Weg, Spur B über den konkreten
Versagensfall `return`). Die restlichen vierzehn Befunde hatte jeweils nur
eine der beiden.

### Was die Planprüfung wirklich gebracht hat

**Sechs der zehn Befunde von Spur A treffen Fehler in MEINEM Auftragspapier,
nicht im Bestand.** Der teuerste wäre gewesen, dass zwei Gegenproben ihren
eigenen Beweis verloren hätten: der neue Mengen-Wächter stand im Kontrollfluss
VOR dem Riegel, `assert` wirft beim ersten Verstoss, also wären 3a und 8a am
falschen Ort rot geworden. Das ist wörtlich dieselbe Isolationsfalle, die mein
eigener Auftrag drei Punkte weiter oben selbst benennt.

Dazu ein `ReferenceError` zur LAUFZEIT (Blockgrenzen), den `node --check`
nicht gesehen hätte, und ein Ausdruck, der einen heute gefangenen
Umgehungsweg GEÖFFNET hätte.

### Der Beleg für VERSCHIEDENE Bündel — der bisher stärkste

**Spur B hatte als einzige die Geschwisterwächter und fand damit den Befund,
der die Bewertung der ganzen Runde 6 zur Hälfte kippt.** Der tragende Hinweis
stand nicht im Diff, sondern in einem KOMMENTAR des Vorbilds
(`test_feature_audit_kapselung_geraete_static.js:647`): „die Fenster-/
Klammer-Arithmetik unten setzt das voraus".

Nachgemessen erzeugt Punkt 7 unseres Auftrags genau diese Arithmetik: Versatz-
werte aus dem ROHEN Quelltext werden in den MASKIERTEN geschnitten, und die
Bereichsmarken stehen selbst in Kommentaren. Der Schnitt trifft
ausschliesslich, weil die Längen gleich sind (459.772 = 459.772).

**Damit sind A1 und B2 BEIDE wahr:** die Längengleichheit sagt nichts über den
Abschnitt (A1), ist aber als Vertragsprüfung über den geteilten Helfer tragend
(B2). Sie bleibt — mit einer ehrlichen Meldung — und `nichtLeerraum` kommt
daneben. **Keine der drei Prüfspuren hatte diese Synthese; sie entstand erst
beim eigenen Nachmessen zweier Befunde gegeneinander.**

### Zum siebten Mal: der Behebungsvorschlag ist eine EIGENE Behauptung

Spur A, Befund 10: das grep-Kommando im Kommentar findet sich selbst
(gemessen 2 Treffer). **Der Befund trägt, der vorgeschlagene Behebungsweg
nicht** — sein Vorschlag ergibt ebenfalls 2 Treffer. Der Klammertrick behebt
es, gemessen 1 Treffer auf der richtigen Zeile.

Spur B, Befund B3: nachgemessen ist die behauptete Reihenfolge umgekehrt
(Zeile 739 gegen 762), der Befund FÄLLT. Die Vorsicht dahinter ist trotzdem
übernommen: zu jeder roten Gegenprobe wird ab jetzt die ERSTE FAIL-Zeile
gemeldet, nicht nur der Exit-Code.

### Betriebsbeobachtung: `kimi-k3` mit `effort: high`

**1342,5 s — 22 Minuten** für ein 78k-Bündel, davon 43.208 Denk-Token. Das
Zeitlimit von `frage.js` liegt bei 1800 s; der Lauf hat also zwei Drittel
davon verbraucht. Wer `kimi-k3` mit `high` auf ein grosses Bündel setzt,
plant das ein — und fährt die zweite Spur parallel, statt zu warten.

---

## 23.09.2026 — Planprüfung Bauauftrag Runde 9 „ladebestand" (`deepseek-v4-pro`)

**EINE** Lesespur statt zweier — Abweichung von der Regel, begründet: die
beiden Kernbehebungen waren vorab selbst gemessen. Bündel: Auftrag + Befunde
der Vorrunde + heutiger Stand der Testdatei, 176 KB ≈ 48k Token.
327,6 s, `beendet=stop`, 56.317 ein / 20.664 aus (16.887 Denken).

| Datum | Zweck | Material | Befunde | getragen | gefallen | Kosten |
|---|---|---|---|---|---|---|
| 23.09.2026 | Planprüfung Runde 9, eine Lesespur | 3 Dateien, 176 KB, 56.317 ein / 20.664 aus, 327,6 s | 6 | **5** | 1 (in der Folge) | unbekannt |

### Warum sie sich gelohnt hat

**Die Leitfrage war eine Diagnose, keine Suche:** „welche Behebung in diesem
Auftrag macht denselben Fehler noch einmal?" — mit dem Nenner, den ich aus
den zwei Fehlschlägen der Runde 8 gezogen hatte. Vier von sechs Befunden
treffen konkrete Lücken in MEINEM Papier:

* die Fixturliste bewachte den bare-Aufruf-Zweig nur für `run` (gemessen:
  `q|one|tx|pool` entfernt → alle meine Fangfälle bleiben gefangen);
* die Leerzeichen-Fixtur testete das Leerzeichen gar nicht (gemessen:
  `pool["query"] (x)` trifft schon ohne Aufrufklammer);
* dem `INSERT INTO wartung_pruefungen` fehlt `RETURNING id` — die dritte
  Tabelle wäre in der Mengenabfrage blind gewesen;
* die Bestätigungsabfrage hätte ohne `studio_id` gebaut werden können — das
  ist Punkt 1 unserer Prüfreihenfolge.

### Ein Befund, der in der FOLGE fällt — zum vierten Mal dasselbe Muster

Befund 1 hält fest, meine neue Längenbindung sei blind gegen eine Mutation
der Versatzwerte SELBST (beide Schnitte gleich falsch). **Die Prämisse
stimmt, die Folge nicht:** genau dafür ist der C7-Wächter da, und er feuert.
Selbst nachgemessen als Abdeckungstabelle:

| Mutation | gefangen von |
|---|---|
| nur `abschnitt` ab `begin` | Längenbindung (neu) |
| BEIDE ab `begin` | C7 |
| `ende` 500 zu früh | nichtLeerraum |
| `ende` 500 zu spät / `zb` 200 zu spät | keiner — **und das ist richtig**: beide Bereiche sind reiner Kommentar (`nichtLeerraum` des Zusatzes = 0) |

**Zum vierten Mal in Folge trägt die Beobachtung einer Prüfspur, während ihre
vorhergesagte Messung nicht eintritt** (13.09. Schwereeinstufung, 20.09.
Prämisse, 23.09. Lesespur „Vorbedingung fällt zuerst", jetzt hier). Das ist
kein Argument gegen die Spuren — es ist das Argument für die Hausregel, jeden
Befund SELBST nachzumessen, bevor er ein Auftrag wird.

### Eine Behebung wurde HERABGESTUFT statt gebaut

Befund 4 (Helfer-Rumpf aus dem Selbstscan ausnehmen) ist richtig beobachtet
und schlägt eine AST-Lösung vor. Abgelehnt, mit drei Gründen: der heutige
Zustand ist die SICHERE Richtung (Fehlalarm statt stillem Grün); jede
einfache Abgrenzung tauscht die ungefährliche Richtung gegen die
gefährliche ein (Klammerzählung ist hier zudem unzuverlässig, weil der
Masker Zeichenketten nicht leert); und ein AST-Parser als neue Abhängigkeit
in einem Wächter kostet mehr als der Fehlalarm, den er verhindert.
Stattdessen: die Grenze wird benannt.
| 23.09.2026 | Planpruefung unlink Loeschauftrag Spur B (kimi-k3, Buendel 95 KB, effort high) | Bündel 31.203 Token ein, 36.570 aus, 1059 s | 9 | **8** (blockierend: `DELETE … RETURNING` statt SELECT→löschen→DELETE, einzig von dieser Spur). Einzelheiten `plaene/planpruefung-unlink-loeschauftrag.md` | **1** (Studio-Pfadkollision: Mitarbeiter-ID macht den Ordner eindeutig) | — (keine Preisgrundlage im Repo; Verbrauch s. Material-Spalte) |
| 23.09.2026 | Planpruefung unlink Loeschauftrag Runde 2 Spur B (kimi-k3, Buendel 98 KB, effort high) | Bündel 31.938 Token ein, 34.134 aus, 894 s | 6 | **6** (blockierend, einzig von dieser Spur: Reaper löscht die Datei vor dem Auftrag, Worker committet dazwischen → `succeeded` auf gelöschter Datei; Root-Wechsel lässt Löschpflicht fallen). Einzelheiten `plaene/planpruefung-unlink-loeschauftrag.md` Runde 2 | 0 | — (keine Preisgrundlage im Repo) |
