# Diffprüfung qrj-flake (02.10.2026)

Zweig `qrj-flake` ab `1ff391f`, Stand `9d85d5d`. Zwei Testdateien, kein Produktivcode.
- Suite des Bauenden: SUITE_EXIT=0, 503 = 503, Lint sauber.
- Gegenproben: alt rot, neu grün (9 fremde Handzeilen im Band 900000 und 500600); ohne das eigene DELETE neu rot.
- Den Diff habe ich gelesen. Eine flash-Spur, ~1 $.

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| B1 | `clientT1` (P1-VORHER) hält `FOR UPDATE` ohne try/finally. Ein Wurf dazwischen lässt die Sperre offen, das Aufräumen im Fehlerweg hängt bis zum 120-s-Wächter und räumt nicht auf. Der Kommentar sagt „höchstens 15 s“. | trägt (Zeilen 435-480 gelesen) | Nacharbeit 1 |
| B2 | Kommentar „13 bis 15 von 20“; nach der Aufrufstruktur 14 oder 15. | trägt | Nacharbeit 1 |
| B3 | „0,55 %“ sei falsch, gerechnet 0,94 %. | trägt NICHT: Die Rechnung zählt Bänder unter 150000 mit, die das Zufallsband nie trifft | keine |
| B4 | restH ist bei leerer `angelegteStudioIds` grün, ohne etwas geprüft zu haben. | trägt | Nacharbeit 1: `length > 0` |
| B5 | Der Journal-Test räumt im eigenen Fehlerweg nicht auf. | trägt; Wirkung begrenzt, die DB ist je Lauf frisch | keine (Anmerkung) |

## Nacharbeit 1 (Stand `ca70d53`) — geprüft

- Den Diff habe ich gelesen: T1 steht in try/catch (ROLLBACK, release, pool.end, Weiterwurf), die Zahl ist berichtigt, restH verlangt `angelegteStudioIds.length > 0`.
- Gegenproben laut Bericht:
  - B1: mit Behebung 3 s und 0 Chargen, ohne Behebung 121 s und 4 Chargen.
  - B4: alt grün, neu rot (die Annahme, `rest` fange es heute, traf nicht zu).
- Beide Dateien einzeln grün, Lint sauber. Die volle Suite fährt die CI am PR.
