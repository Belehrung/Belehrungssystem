# Offene Befunde „ladebestand" — für die Extrarunde

**Betreiber-Entscheidung 23.09.2026**, wörtlich: „Dem stimme ich zu, aber
dennoch müssen die offenen Befunde in einer Extrarunde irgendwann bearbeitet
werden. Ich möchte ein fehlerfreies System haben."

Heisst: Runde 9 wird gemergt, sobald die Prüfung nur noch Kleinigkeiten
findet. **Alles, was dann noch offen ist, bleibt NICHT als „benannte Grenze"
liegen, sondern kommt in eine eigene Extrarunde.** Eine benannte Grenze ist
ab jetzt ein Zwischenstand, kein Endzustand.

Diese Liste ist die Sammelstelle. Sie verweist auf die Befunddateien, statt
deren Inhalt zu kopieren (Hausregel „Dieselbe Aussage an zwei Orten").
Nach der Prüfung von Runde 9 wird sie ergänzt.

## Bisher bewusst NICHT behoben — für die Extrarunde

| # | Punkt | Quelle | Heutiger Zustand |
|---|---|---|---|
| 1 | Helfer-Rumpf im C9-Selbstscan: ein Aufrufer, dessen Variable wie der Helfer-Parameter heisst (`antwort`), löst einen Fehlalarm aus | Diffprüfung R8, M4; in Runde 9 herabgestuft | benannte Grenze |
| 2 | C9-Prädikat erkennt die Destrukturierung `const { text } = r` nicht | Auftrag R7, Punkt 2 | benannte Grenze |
| 3 | Ein Kommentar INNERHALB eines Template-Literals überlebt `maskiereKommentare()` — der Riegel kann an Prosa anschlagen | Diffprüfung R6, A8 | benannte Grenze, heute latent |
| 4 | Riegel schlägt an `req.body['query']` an (reiner Lesezugriff) | Auftrag R8, Punkt 3 | benannte Grenze, Fehlalarm |
| 5 | Riegel sperrt jeden lokalen Ein-Buchstaben-Helfer `q(` | Auftrag R7, Punkt 3 | benannte Grenze, Fehlalarm |
| 6 | Den Schleifenrumpf in eine Funktion ohne `db` im Gültigkeitsbereich ziehen — würde die ganze Riegel-Klasse strukturell schliessen statt sie per Muster zu jagen | Planprüfung R4, C11 | datierter offener Punkt, nicht gebaut |

**Punkt 6 ist der wichtigste.** Er ist die Wurzel, an der die Punkte 3–5 und
ein grosser Teil der Runden 6–9 hängen: solange der Riegel ein Textmuster über
Quelltext ist, bleibt er ein Wettrüsten zwischen Schreibweisen und
Fehlalarmen. Eine Funktion, in deren Gültigkeitsbereich `db` gar nicht
vorkommt, braucht kein Muster.

## Ausserhalb dieses Beitrags, aber unter dieselbe Entscheidung

* **Der bekannte Verklemmungs-Kreis im Bestand** (Seil-Tagescheck gegen
  Beurteilungs-Nachtrag, beschrieben in CLAUDE.md, „Transaktionen und
  Sperren"). Gemessen, nie behoben, als „eigener Auftrag" vermerkt.
* **`docs/offene-befunde-31-08-2026.md` im GymDocu-Repo** — die allgemeine
  Befundliste. Vor jedem Bau nachmessen, ob ein Punkt noch besteht.
