# Diffprüfung Runde 8 „ladebestand" — ausführende Spur (Claude), 23.09.2026

Stand `ee7179f`, Zweig `beitrag-ladebestand`. **Elf Befunde.**

Drei selbst nachgemessen und schwer, acht strukturell und durch Lesen
eindeutig. **Zwei sind Behebungen aus Runde 8, die ihr Ziel nicht
erreichen.**

## Die drei gemessenen

### M1 — die C7-Behebung hat die Blindheit VERSCHOBEN, nicht beseitigt

Runde 8 hat den C7-Wächter vom maskierten `abschnitt` auf einen **eigenen,
zweiten Schnitt** `rohAusschnitt` umgestellt. Beide benutzen dieselben
Versatzwerte — aber es sind **zwei unabhängige `slice`-Aufrufe**. Verändert
jemand den EINEN (die dokumentierte C7-Regression), bleibt der ANDERE
unberührt, und der Wächter sieht nichts.

Gemessen mit genau dieser Mutation
(`geraeteOhneKommentare.slice(begin, ende)`):

```
TEST_EXIT=0   ──── 32 PASS / 0 FAIL ────
```

**Alle elf Zusicherungen bleiben grün.** Die einzige, die es gemerkt hätte,
war ausgerechnet die in Runde 8 als „Tautologie" GELÖSCHTE
`abschnitt.length === ende - zeilenbeginnNachMarke` — sie war tautologisch
gegenüber der LÄNGENERHALTUNG des Maskers, aber nicht gegenüber den
SCHNITTGRENZEN. Sie war die einzige Verbindung zwischen `abschnitt` und den
Versatzwerten.

**Die Behebung, gemessen:**

```
richtiger Schnitt : abschnitt.length === rohAusschnitt.length ? true  (15782 / 15782)
falscher  Schnitt : abschnitt.length === rohAusschnitt.length ? false (15847 / 15782)
```

Zwei unabhängig geschnittene Zeichenketten gegeneinander — das feuert und ist
keine Tautologie.

### M2 — die Klammerformen des Riegels sind von NICHTS bewacht

Gemessen: beide in Runde 8 reparierten Klammer-Alternativen aus
`PRUEFPLAN_VERBOTENES_MUSTER` entfernt →

```
TEST_EXIT=0   ──── 32 PASS / 0 FAIL ────
```

Fixtur 1 bleibt `false`, Fixtur 3 bleibt `true` (sie trifft schon auf
`\bdb\b`), der Riegel am echten Abschnitt bleibt `false`. **Genau die
Regression, die Runde 8 repariert hat, könnte lautlos wieder aufgehen.**

Meine „15 Proben, 0 Abweichungen" stehen als PROSA im Kommentar — sie sind
nie zu Zusicherungen geworden. Das ist dieselbe Lehre, die derselbe Beitrag
beim C9-Prädikat anwendet („eine einzige Fixtur, die beide Formen enthält,
prüft das Prädikat NICHT"), nur beim Riegel nicht angewandt.

### M3 — eine Tatsachenbehauptung im Kommentar ist falsch

Der Kommentar sagt: „roh wie maskiert dieselben 15 Treffer … die Maskierung
nimmt heute nichts weg". Gemessen am committeten Stand:

```
ROH      Treffer: 18
MASKIERT Treffer: 15
```

Drei Kommentar-Erwähnungen schreiben NICHT `<r>`. **Die Maskierung ist also
tragend, nicht dekorativ** — und der Satz behauptet das Gegenteil.

Bemerkenswert: die Zahl war RICHTIG, als ich sie in Runde 7 mass (15 und 15).
Die neuen Kommentare der Runde 8 haben sie widerlegt. **Zweites Mal in zwei
Runden, dass mein eigener Beitrag meine eigene Messung ungültig macht** (das
erste Mal waren es die Zeilenzahlen 218/143 → 232/157).

## Die acht strukturellen

| # | Kern |
|---|---|
| M4 | Die R11-Umbenennung verschiebt die Selbsttreffer-Gefahr nur: ein künftiger Aufrufer namens `antwort` trifft den Helfer-Rumpf. Wurzel wäre, den Helfer-Rumpf aus dem Scan auszunehmen |
| M5 | `srvEigen.close()` bleibt ungeprüft und nicht abgewartet — Schritt 1 von 4 ist weiterhin ein Wächter, der nicht feuern kann, und das `close()` läuft gegen die folgenden DELETEs |
| M6 | Die Mengenabfrage läuft NACH der schwächeren Ausnahme-Zusicherung — im gemessenen Fall wird sie nie erreicht, und man erfährt nicht, WELCHE Zeilen überlebt haben |
| M7 | Die Mengenabfrage deckt zwei der drei aufgeräumten Tabellen; `wartung_pruefungen` fehlt, und die literale „4" in der Meldung beschreibt eine andere Menge als die Abfrage |
| M8 | Die Riegel-Meldung beschreibt eine einheitliche Klammerregel, obwohl R3 sie aufgespalten hat — `req.body['query']` schlägt an, die Erklärung steht 320 Zeilen entfernt |
| M9 | `UNION ALL` verwirft die Herkunft: `IDs: 4711, 4711` ist nicht auflösbar, Geräte- und Kategorie-IDs sind unabhängige Sequenzen |
| M10 | Der Kategorie-Schnappschuss liest die Variablen, gegen die er immun sein soll — nur die Geräteseite ist DB-bestätigt (hatte ich selbst beim Diff-Lesen notiert) |
| M11 | `String(e && e.message || e)` viermal kopiert, unparenthesiert; dazu `nichtLeerraum()` doppelt aufgerufen statt einmal in eine Variable (Hausregel „Zusicherung und Diagnose beschreiben denselben Wert") |

## Was das über den Verlauf sagt

Runde 6: 14 Befunde. Runde 7: 12, davon 3 Regressionen. Runde 8: 11, davon 2
Behebungen, die ihr Ziel verfehlen. **Die Zahl sinkt kaum — die SCHWERE
schon:** in Runde 7 hat der Beitrag Dinge kaputtgemacht, die funktionierten;
in Runde 8 decken zwei Behebungen nicht ab, was sie abdecken sollten.

Der gemeinsame Nenner von M1 und M2 ist derselbe und strukturell: **eine
Behebung, die eine zweite, parallele Fassung erzeugt** (zweiter Schnitt,
Prosa-Probenmatrix statt Fixturen) statt die vorhandene zu binden.
