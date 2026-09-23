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
