# Planprüfung „Extrarunde ladebestand" — 23.09.2026

Papier: `plaene/auftrag-extrarunde-ladebestand.md` (Fassung 1, Commit 54b3a76).
Zwei Lesespuren, verschiedene Bündel (Betreiber-Entscheidung 20.09.2026):

* **Spur A — `gpt-5.6-sol` mit Repo-Lesezugriff** (`tools/gegenleser-repo.js`,
  Wurzel `/home/user/gymdocu` @ e2a9e9e). Material: Papier + Sammelliste; den
  Rest hat sie selbst gesucht (59 Suchen, 43 Lesungen, 20 Runden).
* **Spur B — `kimi-k3`, festes Bündel**: Papier + Sammelliste +
  `geraete.js` 2040–2260 und 2600–3200 + vollständige Testdatei.

Jeder Befund unten ist SELBST nachgemessen; die Spalte „trägt" nennt die Messung.

## Spur A (sol) — 9 Befunde, 9 getragen

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| A-1 | blockierend | A1-POST-Folge erreicht nicht jeden Zweig: `unbekannt` endet VOR dem Bereich (`geraete.js:2771 continue`, Bereich ab 2773); `if (kategorieId)`-Falschkante unerreichbar (`brauchtKategorie` 2637–2650 legt die Kategorie vor der Schleife an); Feuerlöscher-Ablösung braucht Altbestand `^Feuerlöscher [0-9]+$` (`feuerloescherOhneProtokoll` 2206–2214); `!schonDa.durchfuehrung` braucht Altbestand; `fachfirmenExtern`-Zweig fehlt in der Folge | Zeilen gelesen, alle fünf bestätigt | ja |
| A-2 | blockierend | EIN Endhash über `volleZeilenmenge()` ist kein Anker: nur `aktiv = 1`, nur `name/intervall/durchfuehrung/notizen` + Aufgaben (`test…streng.js:284-310`); `art`, `naechste_faelligkeit`, `frist_herkunft`, `frist_norm`, `aktiv`, `pruefbereich_bestand` fehlen; Deaktivieren+Reaktivieren heben sich auf; SQL-Leerraum ändert den Zustand nicht → „SQL-Anweisung leicht verändern → Anker rot" ist nicht allgemein erfüllbar, BYTE-Gleichheit nicht belegbar | Abfrage gelesen, bestätigt | ja |
| A-3 | blockierend | `holeOderLegeAn` ist KEIN Lese-Helfer: eigene `db.tx`, `INSERT`, `art`-UPDATE (2047–2172); Zähler nur über `eintrag.neu`/`artGeaendert` im Aufrufer | gelesen, bestätigt | ja |
| A-4 | blockierend | Herauslösung: `continue` 2808 zielt auf die ÄUSSERE Positionsschleife (in einer Funktion Syntaxfehler → `return`); `brandschutz`, `plusMonate` fehlen in der Eingabeliste; `anzahl` wird im Bereich nicht gelesen; Zähler müssen je Position AUFADDIERT werden, nicht zugewiesen | gelesen, bestätigt | ja |
| A-5 | blockierend | Keine Zusicherung bindet das Modul an den Produktivpfad (Kopie + alter Inline-Bereich bliebe grün); `test_feature_brandschutz.js:320-328, 487-495, 800-812` liest den Bereich aus `geraete.js` (`SET aktiv = 0`, `if (p.schluessel === 'feuerloescher')`, `abgeloest.push(a.name)`, `if (!schonDa.durchfuehrung)`, „kein DELETE") — nach dem Umzug rot bzw. die DELETE-Prüfung blind | Zeilen gelesen, bestätigt | ja |
| A-6 | mittel | Aufräum-`DELETE … WHERE id = ANY($1)` ohne `studio_id` (`test…streng.js:2230, 2236`) — B13/21 deckt nur die Lesestellen | gelesen, bestätigt | ja |
| A-7 | mittel | Fehlerwege der neuen Funktion ungeprüft: ein neues `catch { return leere Zähler }` bliebe grün | Plausibel; A3 prüft nur Erfolgsfolgen | ja |
| A-8 | gering | B17 ohne Abnahme: `ursache()` läuft im grünen Lauf nie | gelesen, bestätigt | ja |
| A-9 | ausserhalb | Verklemmungskreis (`routes/module.js`) bleibt offen — „fehlerfrei" ist mit diesem Papier nicht erreicht | steht auf der Sammelliste „ausserhalb dieses Beitrags"; eigener Auftrag | ja (Abgrenzung, kein Auftrag hier) |

Kosten laut Werkzeug: **14,54 $** (2.721.811 Token rein über 20 Runden, 31.082 raus).
