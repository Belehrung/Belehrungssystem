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
