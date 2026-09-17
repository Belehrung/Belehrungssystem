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
