# P4 — Unterschrift: einzelne Punkte oder Striche ablehnen (V10-2), an ALLEN Unterschriftsfeldern

Stand GymDocu master `221a7b2`. Betreiber-Entscheidung 24.09.2026, wörtlich: „einzelen punkte oder striche ablehnen".
Ausgelegt als: ein Punkt und ein gerader Strich (jede Richtung) gelten nicht als Unterschrift; ein geschwungener
Zug (eine Unterschrift in einem Zug) gilt. Bau NACH P3 (beide ändern `routes/belehrungen.js`).
Einordnung: sehr komplex im Sinne der CLAUDE.md — die Schwelle muss hergeleitet werden, und das Ergebnis kann falsch
grün aussehen (eine Regel, die nur an den eigenen Testfiguren gelernt ist, lehnt echte Unterschriften ab oder lässt
gerade Striche durch).

## Befund (gelesen, gegen `221a7b2`)

* Sieben Unterschriftsfelder mit je eigener Kopie des Zeichenfeldes: `routes/belehrungen.js`, `wartung.js`,
  `module.js`, `spuelplan.js`, `verbandbuch.js`, `getraenkeanlage.js`, `sichtpruefung.js` (`canvas.toDataURL`).
* Nur `belehrungen.js` prüft serverseitig (`core/signaturbild.js#pruefeSignaturbild`, Aufruf `:832`): Format PNG,
  Pixel-Deckel 16 MP, Sichtbarkeit am Zeichenmass, echte Tinte in Originalauflösung. Ein einzelnes schwarzes Pixel
  besteht (V10-2, gemessen).
* Die übrigen sechs speichern den eingeschickten Datenwert ungeprüft; `spuelplan.js:265` prüft nur das Präfix
  `data:image/png;base64,`. Die PDF-Erzeugung dekodiert ihn (`core/pdf-engine.js:413-419, 1158, 1769`). Folge:
  weder Format- noch Grössendeckel noch Tintenprüfung — dieselbe Vertrauensgrenze (CWE-501/602), die
  `core/signaturbild.js` für die Belehrung geschlossen hat, steht dort offen, dazu die PNG-Bombe aus deren Kopf.
* Clientseitig entscheidet heute „irgendein Pixel < 250“ bzw. ein `signed`-Merker beim ersten Zeichnen.

## Auftrag

1. **Eine Regel, ein Ort**: ein Modul, das im Browser UND im Server läuft (dieselbe Datei, kein Nachbau), mit einer
   Funktion `bewerteUnterschrift(pixel, breite, hoehe)` → `{ ok, grund, masse }`. Der Server ruft sie in
   `pruefeSignaturbild()` in Originalauflösung auf, jedes Zeichenfeld vor dem Absenden mit `getImageData`.
   Ablehnungsgründe mit eigener Meldung: „leer“, „nur ein Punkt“, „nur ein gerader Strich“.
2. **Mass und Schwelle werden GEMESSEN, nicht gesetzt.** Vorschlag, den die Messung bestätigen oder verwerfen
   muss: Hauptachsenanalyse der Tintenpixel (< 128) — Ausdehnung entlang der Hauptachse (Punkt: zu kurz) und
   Streuung quer dazu (gerader Strich: nur Strichdicke), jeweils bezogen auf eine Grösse, die nicht von der
   Geräteauflösung abhängt.
   **Messmenge** (Playwright am ECHTEN Zeichenfeld jeder der sieben Seiten, `devicePixelRatio` 1 und 2, zwei
   Feldgrössen): Tippen (Punkt), kurze und lange gerade Striche in 0°, 45°, 90°, 135°, zittrig gezogene gerade
   Striche; als Unterschriften mehrteilige Namenszüge und Einzugs-Unterschriften, erzeugt aus einer
   Einstrich-Schrift (Hershey-Script, gemeinfrei) plus Zittern, in verschiedenen Grössen, auch sehr klein und
   sehr flach. Ergebnis: Tabelle je Figur mit den Massen und dem Abstand zur Schwelle auf beiden Seiten.
   Liegt eine echte Unterschriftsfigur näher als 20 % an der Schwelle → STOPP und melden.
3. **Server: alle sieben Eintrittspunkte** gehen durch `pruefeSignaturbild()` (Format, Deckel, Tinte, neue Regel);
   eingebettet wird nur der kanonische Puffer, wie heute in `belehrungen.js`. Fehler → dieselbe Meldung wie im
   Browser, Formular bleibt erhalten, keine Zeile geschrieben.
4. **Browser**: alle sieben Zeichenfelder benutzen das Modul statt `signed`/`px[i] < 250`. Eine gemeinsame
   Zeichenfeld-Funktion statt sieben Kopien ist erwünscht, wenn sie ohne Verhaltensänderung geht — sonst benennen.
5. **Tests**: die Regel mit den Figuren aus 2 als Fixturen (PNG im Repo, Grenze in beide Richtungen); je
   Eintrittspunkt ein Verhaltenstest über den echten Router: Punkt, Strich, 1×1-Pixel, Nicht-PNG, übergrosses PNG →
   abgelehnt, nichts geschrieben; eine Unterschriftsfigur → angenommen. Bestehende Zusicherungen, die ein einzelnes
   Pixel als gültige Unterschrift benutzen, werden FACHLICH umgestellt (vorher suchen und auflisten).

## Gegenproben (je einzeln ROT und zurück GRÜN, wörtlich)

(a) Streuungs-Schwelle auf 0 → Strich-Fixturen rot. (b) Längen-Schwelle auf 0 → Punkt-Fixturen rot.
(c) An EINEM der sieben Eintrittspunkte den Aufruf entfernen → dessen Verhaltenstest rot.
(d) Im Browser-Pfad das Modul durch „irgendein Pixel“ ersetzen → Browser-Test rot.

## Fragen an die Planprüfung

* Welcher Zustand entsteht dadurch, den es vorher nicht gab? (Abgelehnte echte Unterschriften; Datensätze, die
  heute schon einen Punkt als Unterschrift tragen; PDF-Neuerzeugung alter Einträge.)
* Was wird durch die Behebung schlechter?
* Kann die Regel grün sein aus dem falschen Grund (Fixturen, die nur die eigene Figurenmenge abbilden)?
* Welche Eintrittspunkte fehlen in der Liste?

# FASSUNG 2 (24.09.2026) — nach der Planprüfung (`plaene/planpruefung-p4.md`)

Massgeblich; wo sie Fassung 1 widerspricht, gilt sie.

1. **Eintrittspunkte vor dem Bau als Tabelle** (Route, Methode, DB-Spalte, Zeichenfeld, PDF-Einbettung), per Suche
   über `toDataURL`, `isSigned_`, `saveSig_`, `unterschrift`, `freigegeben_unterschrift` und alle `doc.image`-Stellen
   in `core/`. Gegenprobe (c) und Verhaltenstests je Eintrittspunkt dieser Tabelle, nicht je Datei. Zeigt die
   Tabelle mehr als 10 Eintrittspunkte → melden, bevor gebaut wird.
2. **Mass vorher festlegen**, dann messen: (i) Deckungsgrad der Tinte an der Tintenbox (gefüllte Fläche, dicker
   Balken → abgelehnt); (ii) Länge entlang der Hauptachse, bezogen auf die Bildhöhe (Punkt); (iii) Verhältnis
   Querstreuung zu Längsstreuung (gerader Strich, jede Richtung). Momente laufend summieren, keine Koordinatenliste.
   Kanalzahl aus `pixel.length / (breite·hoehe)`.
3. **Messmenge erweitert:** Punkt als Mikro-Zug (down, ≤ 2 CSS-px Bewegung, up) — eine Figur mit 0 Tinte ist ein
   Messfehler und bricht ab. Dazu flache Bögen (Stich 2/4/8 CSS-px), flache Welle, „✓“, „X“, „=“, „!“, gefülltes
   Rechteck, dicker Balken, sehr kleine und sehr flache Namenszüge. Ergebnis-Tabelle je Figur mit Tintenmenge, den drei
   Massen und dem Urteil. Betreiber-Entscheidung 24.09.2026: abgelehnt werden nur einzelne Punkte und einzelne gerade Striche; Handzeichen („X“, „✓“) und Kombinationen („=“, „!“) gelten als Unterschrift und kommen als ANGENOMMEN-Fixturen hinein.
   Die 20-%-Grenze gilt in BEIDE Richtungen (echte Figur nahe an „ablehnen“ UND Strich/Punkt nahe an „annehmen“).
4. **Unabhängige zweite Quelle:** jede serverseitig geprüfte Unterschrift schreibt die drei Masse (nur Zahlen, kein
   Bild) als eine Protokollzeile `[unterschrift-masse]`. Damit lässt sich die Schwelle später an echten Unterschriften
   kalibrieren. Das ist KEINE Personenangabe; trotzdem keine Mitarbeiter-ID in der Zeile.
5. **Gespeichert UND eingebettet wird nur der kanonische Puffer** (als Daten-URL). Altdaten bleiben gültig und werden
   nicht neu bewertet; vor JEDEM `doc.image` einer Unterschrift liest `sharp(buf).metadata()` den Kopf und hält ihn
   gegen denselben Deckel (Fehler → „(nicht darstellbar)“ wie heute).
6. **Meldung** nennt, was gilt: „Bitte mit Namenszug oder Handzeichen unterschreiben — ein Punkt oder ein gerader
   Strich genügt nicht.“ Gleicher Text im Browser und vom Server.
7. **Tests:** Verhaltenstests sichern den GRUND der Ablehnung zu, nicht nur „abgelehnt“; ein Browser-Test sichert
   zu, dass bei Punkt/Strich KEIN POST abgeht (`page.route`), und dass eine Unterschriftsfigur abgeht; Regel-Test mit
   beiden Kanalzahlen, identisches Urteil.
8. **Benannte Grenzen:** Messung nur in Chromium (kein WebKit in dieser Umgebung); Kalibrierung an echten
   Unterschriften erst über Punkt 4.

Gegenproben (a)–(d) wie Fassung 1, dazu (e) Deckungsgrad-Regel aus → Rechteck-Fixtur rot; (f) Deckel vor
`doc.image` entfernt → Test mit übergrossem Alt-PNG rot.

# FASSUNG 3 (24.09.2026) — nach der Messung Phase 1 (`fix-p4-unterschrift` `528b6e1`)

Gemessen (Bericht Phase 1): 13 Eintrittspunkte; (i) Deckung und (ii) Länge trennen mit ≥ 20 %; **(iii) Verhältnis
trennt NICHT** (556 von 2444 Messungen falsch, „!“ 104/104 als Strich) — für einen geraden Strich ist
σ_quer/σ_lang = Dicke/Länge, also längenabhängig. Browser- und Server-Urteil identisch (0 Abweichungen in 2756).
Der Betreiber hat die Erkennung meiner Empfehlung überlassen; daraus diese Entscheidungen:

1. **(iii) entfällt als Urteilsmass.** Neue Reihenfolge: leer → Fläche (Deckung, (i)) → Komponenten (8er-Zusammenhang):
   jede Komponente, deren eigene Ausdehnung unter der Punktschwelle liegt, ist ein Punkt; **bestehen ALLE Komponenten
   aus Punkten → „punkt“** (auch zwei Punkte); **≥ 2 Komponenten, davon mindestens eine kein Punkt → ok** („!“, „=“,
   Namenszüge); **genau 1 Komponente → „strich“, wenn `geradheit` (σ_quer / Strichdicke) unter der Schwelle liegt**, sonst ok.
2. **Bezugsgrösse ist die Strichdicke** (`tinte/laenge`), nicht die Bildhöhe (E1 ist 444/220 hoch, E3 hat ein
   verzerrtes Raster). Für die Punktschwelle werden beide Bezüge gemessen; genommen wird der, der mit ≥ 20 % trennt.
3. **Klassen:** ablehnen = Punkte (auch mehrere), glatte und ±1-px-zittrige gerade Striche; **Grenze (keine Vorgabe)** =
   ±2-px-zittrige Striche, flache Paraphe 6 CSS-px, Bögen; annehmen = alles andere wie gehabt. Begründung der
   Asymmetrie: eine fälschlich abgelehnte echte Unterschrift hält die Arbeit auf, ein angenommener Zitterstrich ist der
   heutige Zustand. Die 20-%-Grenze gilt zwischen ablehnen und annehmen; Grenzfiguren werden nur berichtet.
4. **E3-Raster** (Pad wird bei verborgenem Dialog auf 400×200 initialisiert, danach anisotrop skaliert) und
   **E11/E12 `signed=true` beim blossen Tippen** sind vorbestehende Fehler der Zeichenfelder; beide werden in Phase 2
   mitbehoben (das Pad wird ohnehin angefasst), mit Browser-Test.
5. **13 Eintrittspunkte**: alle im Umfang, eine gemeinsame Serverprüfung. E12 bettet nicht ins PDF ein — dort entfällt
   der `doc.image`-Deckel.
6. **Hershey-Daten**: nicht gemeinfrei, sondern frei mit Namensnennung (Hershey/NBS, Hurt); Nennung im Dateikopf genügt,
   es sind Testdaten.
7. **Fixturen** auf das beschränken, was Tests benutzen (je Klasse die grenznahen Figuren, dPR 1 und 2, jede Feldart);
   die Rohtabelle bleibt.

Phase 1b: Regel nach 1–3 umbauen, neu messen, STOPP-Bedingungen wie Fassung 2 mit den Klassen aus 3. Danach
Planprüfung dieser Fassung mit den Messdaten, dann Phase 2 (Einhängen).

## Nachtrag 3a (24.09.2026) — nach Messung Phase 1b (`1adb0e2`)

Gemessen: Die Punktschwelle trennt in keinem Bezug; `geradheit` trennt mit 15,2 %; 38 Figuren liegen auf der falschen Seite.
Alle drei Treiber liegen auf E3 (verzerrtes Raster), dazu kommt `name_winzig_8_flach` („K. Li“ in 4 CSS-px Höhe). Ohne E3 und
ohne diese Figur: Punkt 29,2 %, geradheit 18,7 %. Entscheidungen:

1. **E3-Raster zuerst beheben** (Pad beim Öffnen des Dialogs auf die echte Grösse initialisieren), dann neu messen.
   Gemessen wird der Zustand, der ausgeliefert wird.
2. **`name_winzig_8_flach` → Grenze.** Eine Unterschrift von 4 CSS-px Höhe ist auf einem Tablet mit dem Finger nicht
   ernsthaft zu erwarten.
3. **Grund nur als erlaubte Menge:** Waagerechte und senkrechte Striche dürfen `flaeche` oder `strich` heissen,
   Einzelpunkte `punkt` oder `flaeche`. Der Betreiber sieht ohnehin eine gemeinsame Meldung. Tests sichern zu, dass
   der Grund in der erlaubten Menge liegt und NIE `leer`/`unbestimmt` ist, wo Tinte da ist.
4. **Asymmetrische Marge, vorab festgelegt:** Reicht der Abstand nicht für 20 % auf beiden Seiten, bekommt die
   ANNEHMEN-Seite 20 % und die Ablehnen-Seite den Rest. Liegt der Rest unter 10 %, gilt STOPP. Begründung wie
   Fassung 3 Punkt 3.
5. `unbestimmt` (Laufdeckel erreicht, gemessen Faktor 85 über dem grössten Namenszug) bleibt fail-closed.

## Messung abgeschlossen (Phase 1c, `f917c1d`)

E3 behoben (Raster = CSS × dPR, `getPos` isotrop: 32,1 px = 32,1 px). Kein STOPP: 0 von 2340 falsch, 0 falsche Gründe,
Server = Browser 2964/2964. Schwellen: `PUNKT_MIN` 4,69 (Bezug eigene Strichdicke, je Seite ≥ 22,6 %), `GERADHEIT_MIN`
0,4837 (asymmetrisch: annehmen 20 %, ablehnen 14,8 %), `DECKUNG_MAX` 0,7846 (≥ 21 %). Grenzfiguren: ±2-px-Striche
überwiegend ok, Bögen mit Stich 2 abgelehnt, `name_winzig_8_flach` als Punkt abgelehnt.

# PHASE 2 — Einhängen (Auftrag, nach Planprüfung)

0. **master hereinmergen** (P3 `946647a` ändert `routes/belehrungen.js`), dann weiter.
1. **Regelmodul härten** (eigene Lesung von `core/unterschrift-regel.js`):
   (a) Tinte über die LUMINANZ (0,299 R + 0,587 G + 0,114 B, bei 1/2 Kanälen der Grauwert), nicht nur Kanal 0. Heute gilt
   eine rein rote Linie als leer und eine blaue als Tinte. Browser und Server rechnen dieselbe Formel.
   (b) Der Abgleich der Läufe mit der Vorzeile läuft LINEAR über zwei Zeiger (beide Listen sind nach x sortiert). Heute
   ist er quadratisch je Zeile. Beleg: synthetisches Worst-Case-Bild in Deckelgrösse (Schachbrett, maximale Laufzahl)
   → Laufzeit gemessen, vorher und nachher, mit einer Obergrenze als Zusicherung.
   (c) Die Schwellen bleiben eingefroren.
2. **Validierung, bevor irgendetwas eingehängt wird:** neue Figuren mit anderem Seed, anderen Namen und anderen Grössen
   (nicht aus der Herleitungsmenge), Schwellen eingefroren. Eine Fehlbeurteilung ausserhalb der Grenzklasse → STOPP.
3. **Server, alle 13 Eintrittspunkte** über einen gemeinsamen Helfer. Reihenfolge: Format → Pixel-Deckel (Kopf per
   `sharp().metadata()`) → dekodieren mit `flatten` auf Weiss → `bewerteUnterschrift`. Gespeichert und eingebettet
   wird der kanonische Puffer. Fehler → dieselbe Meldung wie im Browser, Formular bleibt erhalten, keine Zeile
   geschrieben, 400 ohne Alarm. Protokollzeile `[unterschrift-masse]` mit den drei Massen und dem Grund, ohne
   Personen-ID.
4. **PDF:** vor jedem `doc.image` einer Unterschrift (Tabelle der Eintrittspunkte, Spalte „PDF-Einbettung“) wird der
   Kopf per `sharp().metadata()` gegen denselben Deckel gehalten, sonst „(nicht darstellbar)“. Altdaten werden nicht
   neu bewertet.
5. **Browser:** Alle sieben Pad-Implementierungen benutzen das Modul vor dem Absenden. E11/E12 setzen `signed` nicht
   mehr beim blossen Tippen. Browser-Test: Bei Punkt oder Strich geht KEIN POST ab (`page.route`), bei einer
   Unterschrift schon.
6. **Tests:** Regel-Test über die Fixturen mit beiden Kanalzahlen und identischem Urteil. Verhaltenstest je
   Eintrittspunkt über den echten Router: Punkt, Strich, 1×1, Nicht-PNG und übergrosses PNG werden abgelehnt, der Grund
   liegt in der erlaubten Menge, nichts wird geschrieben; eine Unterschrift wird angenommen. Bestehende
   Zusicherungen, die ein einzelnes Pixel als Unterschrift benutzen, werden fachlich umgestellt (vorher auflisten).
7. Gegenproben (a)–(f) aus Fassung 1/2, dazu (g) Luminanz → Kanal 0 zurück → Rot-Fixtur ROT und (h) quadratischer
   Abgleich zurück → Laufzeit-Zusicherung ROT.

# FASSUNG 4 (24.09.2026) — Phase 2 nach der Planprüfung (`plaene/planpruefung-p4-phase2.md`)

Massgeblich zusammen mit „PHASE 2“ oben; wo sie widerspricht, gilt diese Fassung.

A. **Tinte** = Luminanz über Weiss zusammengesetzt (Alpha berücksichtigt; 1/2/3/4 Kanäle). Das Regelmodul exportiert
   diese Funktion, `core/signaturbild.js` benutzt sie für Sichtbarkeit (250) und Echtheit (128). Beide Prüfungen
   BLEIBEN. `breite`/`hoehe` müssen ganze Zahlen sein.
B. **Laufzeit**: linearer Abgleich; `masse.vergleiche` zählt die Abgleichschritte; der Test sichert
   `vergleiche ≤ c · laeufe` an einem kleinen Worst-Case-Bild zu, NICHT die Wandzeit. Einmalig gemessen und
   berichtet werden die Wandzeit bei 16 MP (realistisch und Worst Case). Liegt eine über 250 ms → STOPP.
C. **Server-Helper**: Er läuft VOR dem route-eigenen `try` (P3-Muster) und wirft eine Fehlerklasse der Positivliste
   (400, kein Alarm, Meldung aus Fassung 2 Punkt 6). Auch ein Wurf aus `bewerteUnterschrift` wird so behandelt
   („konnte nicht gelesen werden“). **Zuerst kanonisieren, dann `signatur_hash` über den gespeicherten Wert bilden**,
   an allen Stellen der Tabelle.
D. **Offline-Nachzügler (E4, E11)**: Die neue Seite schickt ein Markerfeld. Fehlt es auf diesen beiden Routen, gelten
   nur Format und Deckel, dazu eine Protokollzeile `[unterschrift-altgeraet]` (Vorbild `sichtpruefung.js:2415-2432`).
   Die Ausnahme läuft von selbst aus.
E. **PDF**: ein synchroner Kopfleser (PNG-IHDR, JPEG-SOF) vor jedem `doc.image` einer Unterschrift; andere Formate
   und alles über dem Deckel → EIN gemeinsamer Platzhaltertext. Übergrosse Altbilder erscheinen dadurch nicht mehr —
   gewollt.
F. **Zusagen**: Der Server garantiert „keine Zeile, klare Meldung, 400“. Das Formular bleibt nur im Browser-Pfad
   erhalten.
G. **Tests**: je Fixturdatei der EXAKTE Grund als Literal; Schwellen als Literale; der Strich-Verhaltenstest benutzt
   einen diagonalen Strich; Farbfiguren (rot, blau, dunkelgrün) in Validierung und Fixturen; die Liste aus DS 1a
   (`test_feature_signatur_verbrauch.js`) wird fachlich umgestellt. „Server = Browser“ ist eine Transportprüfung,
   kein Abdeckungsbeleg.

## Nachtrag 4a (24.09.2026) — nach STOPP in Phase 2 Schritt 1 (`347e195`)

Gemessen: Die Validierung (40 neue Figuren, 2080 Messungen) beurteilt **`v_initialen_12`** („J. K.“, 12 px, dPR 1) 4-mal als
Punkt: Die grösste Komponente liegt bei 4,66, die Schwelle bei 4,69. Die Punktmarge fällt auf **9 %** (`v_punkt_25px` bei
dPR 2: 4,27). Das Punktmass `Ausdehnung²/Pixel` trennt kleine Buchstaben nicht sauber von kleinen Klecksen. Die Wandzeit
bei 16 MP liegt im Worst Case bei **615 ms** (volle Fläche) bzw. 461 ms (Schachbrett); realistisch sind es ≤ 231 ms.

1. **Punktmass neu herleiten (Phase 1d)**, Schwellen offen, beide bisherigen Mengen zusammen. Kandidaten:
   (a) wie bisher; (b) zusätzlich die Kompaktheit je Komponente (Pixel / Box) — ein Punkt ist klein UND gefüllt, ein
   Buchstabe ist dünn; (c) Strichdicke aus dem Umfang (2·Pixel/Umfang, je Komponente oder über die ganze Figur).
   Genommen wird das einfachste Mass, das mit Annehmen-Seite ≥ 20 % und Ablehnen-Seite ≥ 10 % trennt. Danach eine
   DRITTE, frische Validierungsmenge (andere Seeds und Namen, dazu kleine Initialen in 10/12/14 px und Mehrfachpunkte),
   Schwellen eingefroren. Trennt keines → STOPP.
   Ein einzelner Klecks, der der Punktregel entgeht, fällt über `geradheit` als `strich`. Für Einzelpunkte ist deshalb
   `strich` in der erlaubten Grund-Menge; entscheidend sind die MEHRpunkt-Figuren.
2. **Laufzeit**: `flaeche` und `unbestimmt` stehen nach Durchlauf 1 fest; beide kehren VOR Durchlauf 2 zurück (dasselbe
   Urteil, weniger Arbeit). **Pixel-Deckel für Unterschriften**: das grösste Pad-Raster auf realistischen Geräten
   messen (1920×1080 bei dPR 1, 1366×1024 bei dPR 2, 430×932 bei dPR 3) und den Deckel auf das Doppelte davon setzen,
   gerundet und höchstens 16 MP. Danach den Worst Case neu messen: > 250 ms → STOPP.
3. JSON-Wege (E1, E3, E4, E10, E11) fangen den Unterschriftsfehler selbst in ihrem Antwortformat ab — ohne Alarm. Die
   übrigen Routen prüfen vor dem `try`. Das ist in Ordnung.
