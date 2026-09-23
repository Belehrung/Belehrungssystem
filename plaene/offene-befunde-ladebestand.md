# Offene Befunde „ladebestand" — für die Extrarunde

**ERLEDIGT 23.09.2026 mit #467 (Squash `f4c0f07`).** Alle 21 Punkte gebaut oder durch den
Umbau gegenstandslos; Nachweise in `plaene/diffpruefung-extrarunde-ladebestand.md` und im
PR-Rumpf. Offen aus dieser Liste bleibt nur, was „ausserhalb dieses Beitrags" steht
(Verklemmungskreis: `plaene/auftrag-verklemmung-studiolock.md`).

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

## Aus der Diffprüfung Runde 9 (Claude-Spur, 23.09.2026) — NOCH NICHT nachgemessen

Keiner ist eine Regression im Produktivcode. Vor dem Bau jeden einzeln
nachmessen (Hausregel).

| # | Punkt |
|---|---|
| 7 | Riegel-Fixturen 4c: `\bdb\b`-Alternative unbewacht (`db.run(1)` trifft auch `run(`) |
| 8 | Klammer-Aufruf-Zweig nur für `run` mit Fixtur, nicht für `one/tx/q/pool` |
| 9 | Keine Fixtur mit einfachen Anführungszeichen `pool['query']` |
| 10 | Leerraum-Toleranzen `\[\s*`, `\s*\]`, `\.\s*query\s*\(`, bare `\s*\(` unbewacht |
| 11 | Wortgrenzen `\b` in Durchlassfällen unbewacht (`done(`, `prerun(`, `dbName`) |
| 12 | Strukturelle Lösung für 7–11: jede Top-Level-Alternative programmatisch auf Notwendigkeit prüfen statt Fixturen von Hand |
| 13 | Mengenabfrage: `studio_id = ANY($4)` verengt die Erkennung bei Primärschlüsseln; Studio-Schnappschuss aus Variablen |
| 14 | M5: `srvEigen.listening === false` nach `close(cb)` kann nie fallen |
| 15 | M6: Ursachen und Rest nicht in EINER Meldung; bei DB-Ausfall gehen die Ursachen verloren |
| 16 | 4b bindet nur Längen, nicht Grenzen (gleich langes verschobenes Fenster fängt nur 2291) |
| 17 | Kommentar zu `ursache()` beschreibt die Kante verkehrt (Klasse/Code gehen bei nicht-leerer Meldung verloren) |
| 18 | Etiketten „4b"/„4c" doppelt vergeben |
| 19 | M10-Prämisse im Kommentar falsch (Array war schon eine Wertkopie) |
| 20 | Meldungen von Fixtur 1/3 und R3-Prosa beschreiben die alte Klammerregel |
| 21 | Testabfrage `zustandRows` (Punkt 1) liest `wartung_geraete` nur über `id`, ohne `studio_id` — schon vor Runde 9 so (Lesespur R9) |

Lesespur R9 (`deepseek-v4-pro`): **keine Regression** gegenüber `ee7179f`;
ihr zweiter Befund (Leerraum in `.query(`) deckt sich mit Punkt 10.

Quelle: Claude-Review `ee7179f..43449e4` im Sitzungsverlauf; Einzelheiten
werden beim Nachmessen in `plaene/diffpruefung-ladebestand-runde9.md`
festgehalten.
