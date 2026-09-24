# Messung „Modellwahl je Aufgabe“ (Adaptive Model Routing)

Betreiber-Auftrag 23.09.2026: „messe punkt 1 nebenbei. wenn genug daten da sind, dann gib eine empfehlung“.

## Was gemessen wird

Je Prüfrunde mit mindestens zwei Spuren eine Zeile. Gezählt wird nur, was der Haupt-Agent SELBST nachgemessen
hat (getragen/gefallen wie in den Befunddateien).

* **Aufgabe:** Planprüfung oder Diffprüfung; Gegenstand in Stichworten.
* **Spur:** Modell + Rechte (ausführend / lesend mit Repo / lesend mit Bündel).
* **B:** Befunde der Spur · **nur:** davon NUR diese Spur · **nur-hoch:** davon blockierend/hoch/„sollte“ ·
  **gef.:** gefallen · **Kosten**.

Getrennt gezählt wird, WAS eine Spur einzig fand. Die Gesamtzahl allein sagt wenig: Die Prüflast wächst mit
allen Befunden, der Nutzen nur mit den verschiedenen (CLAUDE.md, 20.09.2026).

## Damit Modelle überhaupt vergleichbar werden

Heute laufen immer dieselben Paarungen (Plan: DeepSeek mit Repo + Kimi mit Bündel; Diff: Claude ausführend
+ DeepSeek mit Repo). So lässt sich Modell und Rechte/Material nicht trennen. Deshalb **tauscht ab jetzt jede
dritte Diffprüfung die Lesespur** (Kimi statt DeepSeek, gleiche Rechte und gleiches Material), und jede
dritte Planprüfung gibt DeepSeek das Bündel und Kimi den Repo-Zugriff. Frage, Vorspann und Material bleiben
sonst wörtlich gleich.

**Grenze, gemessen 23.09.2026:** `tools/gegenleser-repo.js` hat keinen Kimi-Weg (kein Treffer für `kimi`/`moonshot`).
„Gleiche Rechte“ ist für Kimi bei der Diffprüfung also heute nicht herstellbar — Kimi liest nur Bündel. Bis ein
Kimi-Weg gebaut ist, bekommt eine Tauschrunde BEIDEN Lesespuren dasselbe Bündel (dann sind Rechte und Material
gleich und nur das Modell verschieden); die Zeile wird so gekennzeichnet.

## Schwelle für eine Empfehlung

Mindestens **12 Runden**, davon je Aufgabe (Plan/Diff) mindestens 4 und je getauschter Paarung mindestens
2. Vorher gibt es keine Empfehlung, nur den Zwischenstand. Eine Stichprobe von eins trägt eine Beobachtung,
keine Umkehr (CLAUDE.md).

## Daten

Kosten: siehe `ASTRA-LAEUFE.md`; Claude-Spur ohne Kosten, Kimi ohne Preisgrundlage.

| Datum | Aufgabe | Spur | B | nur | nur-hoch | gef. |
|---|---|---|---|---|---|---|
| 23.09. | Diff P1 R1 | Claude ausführend | 11 | 8 | 4 | 0 |
| 23.09. | Diff P1 R1 | DeepSeek, Repo | 11 | 8 | 1 | 0 |
| 23.09. | Diff P1 R2 | Claude ausführend | 9 | 7 | 4 | 0 |
| 23.09. | Diff P1 R2 | DeepSeek, Repo | 6 | 5 | 2 | 0 |
| 23.09. | Diff unlink R4 | Claude ausführend | 6 | 3 | 1 | 0 |
| 23.09. | Diff unlink R4 | DeepSeek, Repo | 7 | 4 | 0 | 0 |
| 23.09. | Diff unlink R5 | Claude ausführend | 9 | 6 | 4 | 0 |
| 23.09. | Diff unlink R5 | DeepSeek, Repo | 6 | 3 | 1 | 0 |
| 23.09. | Plan unlink F1 | DeepSeek, Repo | 11 | 7 | 5 | 0 |
| 23.09. | Plan unlink F1 | Kimi, Bündel | 10 | 6 | 1 | 1 |
| 23.09. | Plan unlink F2 | DeepSeek, Repo | 9 | 7 | 5 | 0 |
| 23.09. | Plan unlink F2 | Kimi, Bündel | 6 | 4 | 3 | 0 |
| 23.09. | Diff P1 R3 (nur diese Spur) | DeepSeek, Repo | 7 | — | — | 0 |
| 23.09. | Diff unlink R6 | Claude ausführend | 10 | 6 | 1 | 0 |
| 23.09. | Diff unlink R6 | DeepSeek, Repo | 5 | 3 | 2 | 0 |
| 23.09. | Diff unlink R6 | Kimi, Bündel | 5 | 1 | 0 | 0 |
| 24.09. | Plan unlink N9 | DeepSeek, Repo | 9 | 6 | 3 | 1 |
| 24.09. | Plan unlink N9 | Kimi, Bündel | 11 | 7 | 2 | 2 |
| 24.09. | Diff unlink R7 (TAUSCH) | Claude ausführend | 5 | 4 | 2 | 0 |
| 24.09. | Diff unlink R7 (TAUSCH) | DeepSeek, Bündel = K | 2 | 1 | 1 | 1 |
| 24.09. | Diff unlink R7 (TAUSCH) | Kimi, Bündel = D | 4 | 2 | 0 | 0 |
| 24.09. | Diff unlink R8 | Claude ausführend | 5 | 3 | 1 | 0 |
| 24.09. | Diff unlink R8 | DeepSeek, Repo | 8 | 6 | 0 | 0 |
| 24.09. | Diff unlink R9 | Claude ausführend | 7 | 4 | 0 | 0 |
| 24.09. | Diff unlink R9 | DeepSeek, Repo | 8 | 5 | 0 | 1 |
| 24.09. | Diff unlink R10 (eine Spur) | DeepSeek, Repo | 6 | — | — | 1 |
| 24.09. | Diff H2 R1 | Claude ausführend | 2 | 0 | 0 | 0 |
| 24.09. | Diff H2 R1 | DeepSeek, Repo | 8 | 4 | 1 | 2 |
| 24.09. | Diff H2 R2 (eine Spur) | DeepSeek, Repo | 4 | — | — | 0 |
| 24.09. | Plan T1 (Kimi gesperrt) | DeepSeek, Repo | 9 | 6 | 3 | 0 |
| 24.09. | Plan T1 (Kimi gesperrt) | DeepSeek, Bündel | 6 | 2 | 1 | 0 |
| 24.09. | Plan T1 Fassung 2 (eine Spur) | Kimi, Bündel | 10 | — | — | 2 |
| 24.09. | Plan P3 (TAUSCH: gleiches Bündel) | DeepSeek, Bündel = K | 6 | 3 | 1 | 1 |
| 24.09. | Plan P3 (TAUSCH: gleiches Bündel) | Kimi, Bündel = D | 8 | 6 | 3 | 0 |
| 24.09. | Plan P4 (TAUSCH: gleiches Bündel) | DeepSeek, Bündel = K | 4 | 2 | 2 | 0 |
| 24.09. | Plan P4 (TAUSCH: gleiches Bündel) | Kimi, Bündel = D | 10 | 7 | 4 | 1 |
| 24.09. | Diff T1 (TAUSCH: Kimi statt DeepSeek) | Claude ausführend | 3 | 2 | 0 | 0 |
| 24.09. | Diff T1 (TAUSCH: Kimi statt DeepSeek) | Kimi, Bündel | 7 | 6 | 4 | 0 |
| 24.09. | Diff P3 | Claude ausführend | 0 | 0 | 0 | 0 |
| 24.09. | Diff P3 | DeepSeek, Repo | 14 | 14 | 3 | 0 |
| 24.09. | Diff P3 R2 | Claude ausführend | 0 | 0 | 0 | 0 |
| 24.09. | Diff P3 R2 | DeepSeek, Repo | 7 | 7 | 4 | 2 |
| 24.09. | Plan P4 Phase 2 | DeepSeek, Repo | 20 | 14 | 7 | 0 |
| 24.09. | Plan P4 Phase 2 | Kimi, Bündel | 8 | 4 | 3 | 0 |
| 24.09. | Plan P2 | DeepSeek, Repo | 13 | 8 | 3 | 0 |
| 24.09. | Plan P2 | Kimi, Bündel | 8 | 3 | 3 | 1 |
| 24.09. | Plan C1 | DeepSeek, Repo | 9 | 3 | 1 | 0 |
| 24.09. | Plan C1 | Kimi, Bündel | 9 | 5 | 3 | 0 |
| 24.09. | Plan H1a | DeepSeek, Repo | 8 | 5 | 1 | 0 |
| 24.09. | Plan H1a | Kimi, Bündel | 8 | 3 | 0 | 1½ |
| 24.09. | Plan C2 | DeepSeek, Repo | 8 | 7 | 0 | ½ |
| 24.09. | Plan C2 | Kimi, Bündel | 5 | 4 | 0 | 0 |
| 24.09. | Diff P4 R2 (eine Spur) | DeepSeek, Repo | 4 | — | — | 1 |
| 24.09. | Plan T2 | DeepSeek, Repo | 12 | 10 | 0 | 0 |
| 24.09. | Plan T2 | Kimi, Bündel | 9 | 7 | 2 | 0 |

Zählweise: **eine Zeile der Befunddatei = ein Befund** (`plaene/diffpruefung-pentest-p1.md`,
`plaene/diffpruefung-unlink.md`, `plaene/planpruefung-unlink-loeschauftrag.md`); gruppierte Zeilen wie
„R2-B2/B3/B4“ zählen einmal, eine Zeile mit zwei Spuren („A1/B1“) zählt bei beiden und bei keiner als „nur“.
Eine Runde mit nur EINER Spur trägt bei „nur“ einen Strich — dort gibt es keinen Vergleich.
„nur-hoch“ = blockierend, hoch, mittel oder „sollte“ nach der NACHGEMESSENEN Einstufung.

**Zwischenstand 23.09.2026 (6 Runden, KEINE Empfehlung):** Bei den Diffprüfungen liefert die ausführende
Claude-Spur die meisten Befunde, die nur sie hat, und davon die meisten schweren. Das passt zur Messung vom
13.09. (Fähigkeit schlägt Modell). Bei den Planprüfungen liefert DeepSeek mit Repo mehr, Kimi mit Bündel hatte
aber je Runde mindestens einen schweren Befund, den nur es hatte. Modell und Rechte sind hier noch nicht
getrennt; der Tausch oben ist dafür da.

## EMPFEHLUNG 24.09.2026 (Schwelle erreicht: 17 Runden — 11 Diff, 6 Plan; je zwei Tauschrunden)

Summen „nur-hoch“ (schwere Befunde, die NUR diese Spur hatte) und „gef.“ aus der Tabelle oben:

| Vergleich | was sich unterscheidet | Ergebnis |
|---|---|---|
| Plan, Normalpaarung (unlink F1, F2, N9) | Modell UND Rechte | DeepSeek-Repo 13 / gef. 1 — Kimi-Bündel 6 / gef. 3 |
| Plan, gleiches Bündel (P3, P4) | nur das Modell | DeepSeek 3 / gef. 1 — **Kimi 7** / gef. 1 |
| Plan T1, gleiches Modell | nur die Rechte | DeepSeek-**Repo 3** — DeepSeek-Bündel 1 |
| Diff, Claude ausführend (11 Runden) | Fähigkeit | **17** / gef. 0 |
| Diff, DeepSeek-Repo (9 Runden) | — | 10 / gef. 3 |
| Diff, Kimi-Bündel (R6, R7, T1) | — | 4 / gef. 0 |

1. **Planprüfung: Paarung beibehalten (DeepSeek mit Repo + Kimi mit Bündel).** Bei GLEICHEM Material war Kimi
   das stärkere Modell; DeepSeeks Vorsprung in der Normalpaarung kommt vom Repo-Zugriff, nicht vom Modell.
   Nächster Hebel ist deshalb ein Kimi-Weg in `tools/gegenleser-repo.js` (Kimi MIT Repo) — erst danach lässt
   sich sagen, ob Kimi-Repo DeepSeek-Repo ersetzen kann.
2. **Diffprüfung: Claude ausführend bleibt Pflicht** (die meisten schweren Eigenbefunde, keiner gefallen).
   Lesespur bleibt DeepSeek mit Repo; Kimi mit Bündel liegt je Runde gleichauf (1,3 gegen 1,1) — nicht
   unterscheidbar, der Tausch jede dritte Runde läuft weiter.
3. **Grenzen:** viele Runden am selben Gegenstand (unlink), Zählung durch den Haupt-Agenten selbst, Kimi-Kosten
   ohne Preisgrundlage. Eine Empfehlung, keine Messung mit Signifikanz.
