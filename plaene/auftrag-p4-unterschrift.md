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
