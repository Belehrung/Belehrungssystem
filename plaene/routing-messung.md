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
