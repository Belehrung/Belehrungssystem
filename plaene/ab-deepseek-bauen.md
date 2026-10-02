# A/B: Kann DeepSeek bauen? (Protokoll, 02.10.2026)

Betreiber-Auftrag 02.10.2026: „Ja mach mal den Vergleich“. Gemeint ist: ein kleiner, gemessener Versuch, ob ein externes
Modell einen Bauauftrag so gut erledigt wie der Standard-Executer. Ein Umstellen ist das nicht, entschieden wird erst
anhand der Zahlen.

## Aufbau

- **Auftrag:** `plaene/auftrag-c6h-extrarunde.md`, beiden Armen WÖRTLICH gleich übergeben, Stand master `749f2d2`.
- **Arm S:** Standard-Executer (Sonnet) in eigenem Arbeitsbaum, wie jeder Bauauftrag: er liest, ändert, testet und
  korrigiert selbst.
- **Arm D:** `deepseek-flash` über die API.
  - Keine Werkzeuge, keine Shell, keine Schlüssel. Grund: Betreiber-Grenze vom 26.09.2026 und CLAUDE.md, „Variante 1“.
  - Eingabe: der Auftrag, die Hausregeln (`CLAUDE.md` des GymDocu-Repos) und die betroffenen Dateien im Volltext. Alles
    davon steht in `git ls-files`, also innerhalb der Datengrenze.
  - Ausgabe: Ersetzungsblöcke (Datei, exakter Alttext, Neutext) und Gegenproben im selben Format, dazu die Angabe, welche
    Testdatei rot werden muss.
  - Der Haupt-Agent wendet die Blöcke mechanisch an (Abbruch bei ≠ 1 Treffer), fährt die genannten Tests und die Suite und
    führt die Gegenproben aus. Er ändert dabei selbst NICHTS am Inhalt.
  - Bei Rot geht die wörtliche Ausgabe zurück an DeepSeek, höchstens zwei Korrekturrunden.
- **Bewertung, blind:** Beide Diffs gehen unter zufälliger Kennung (X/Y) an dieselbe Prüfspur mit demselben Brief. Gemessen
  wird:
  - Suite grün, Lint, Ritual;
  - Gegenproben wirklich rot;
  - Zahl und Schwere der Befunde, je selbst nachgemessen;
  - Punkte des Auftrags erfüllt (je Punkt ja/teilweise/nein);
  - Korrekturrunden;
  - Kosten (Arm D: Token und $ laut API; Arm S: Subagent-Token);
  - Dauer.
- **Danach:** Der bessere Diff wird regulär weitergeführt (PR, CI, Merge). Der andere wird verworfen.

## Was dieser Versuch NICHT hergibt

Eine Stichprobe von EINS, dazu ungleiche Rechte: Arm S darf ausführen, Arm D nicht. Ein Sieg von D hiesse: „liefert als
Textpatch brauchbare Ergebnisse“. Ein Sieg von S hiesse nicht, dass D nicht bauen kann, sondern dass D ohne
Ausführungsrechte schlechter baut.

## Ergebnis

Abgebrochen vor dem Start der beiden Arme, Betreiber 02.10.2026: „Nein warte. Wir lassen alles so wie es ist.“
Es bleibt dabei: gebaut wird über den Executer (Sonnet), die externen Modelle bleiben Prüfspuren. Kein Lauf, keine Kosten
ausser der Planprüfung des Auftrags. Der Auftrag selbst wird als gewöhnliche Extrarunde C6-H weitergeführt.
