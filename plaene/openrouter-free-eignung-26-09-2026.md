# OpenRouter Free-Modelle — Eignung für uns (gemessen 26.09.2026)

Anlass: Betreiber-Frage „kannst du die free modelle bei openrouter auf ihre eignung für uns prüfen?". Schlüssel in
`/tmp/claude-0/.openrouter-key` (nie in der Kommandozeile), Konto ohne Guthaben (Free-Kontingent). Mess-Skripte:
Scratchpad `orfree/probe1.js` (Datengrenze), `probe2.js` (ZDR), `probe3.js` (Qualität).

## 1. Datengrenze zuerst — sie entscheidet fast alles

Unsere Regel: Quelltext bleibt nicht auf fremden Servern (Gegenstück zu `store:false`). Bei OpenRouter heisst das
`provider: {zdr: true}` (Zero Data Retention); `data_collection: "deny"` ist schwächer (nur „kein Training").

Gemessen an allen **17** `:free`-Modellen, je derselbe Aufruf mit und ohne Filter. **Die Methode unterscheidet** —
Positivkontrolle steht: ohne Filter antworten die Modelle (HTTP 200), mit Filter kommt bei den betroffenen
HTTP 404 „No endpoints found matching your data policy".

| Ergebnis | Modelle |
|---|---|
| **ZDR erfüllt** (HTTP 200 mit `zdr:true`) | `inclusionai/ling-3.0-flash-fin`, `inclusionai/ling-3.0-flash-sante` (beide über Novita) |
| nur „kein Training“, aber KEIN ZDR | `dots-studio/dots-3-note-preview`, `cohere/north-mini-code`, `google/gemma-4-31b-it` |
| trainiert auf Eingaben (scheitert schon an `deny`) | alle `nvidia/nemotron-*` (5), `poolside/laguna-s-2.1`, `-xs-2.1`, `liquid/lfm-2.5-2.6b` |
| ZDR-Endpunkt vorhanden, aber unbrauchbar | `qwen/qwen3.8-27b` — nimmt `zdr:true` an, lieferte in 8 Versuchen keine einzige Antwort (s. Abschnitt 2) |
| nicht messbar | `google/gemma-4-26b-a4b-it` (HTTP 429, Anbieter überlastet); `thinkingmachines/inkling`, `-small` (HTTP 403 „nur über Agenten-Harnesses“) |

Für unseren Code kommen damit nur **zwei** in Frage (qwen nimmt ZDR an, antwortet aber nicht). Beide sind Fachvarianten eines kleinen „Flash“-Modells
(`-fin` = Finanzen, `-sante` = Gesundheit) — keine Code-Modelle.

**Was ZDR NICHT belegt:** dass der Anbieter sich daran hält. Wir messen OpenRouters Routing-Zusage, nicht Novitas
Speicher. Dasselbe gilt für `store:false` bei OpenAI.

## 2. Qualitätsprobe an einem BEKANNTEN Befund (Positiv- und Negativfall)

Material: `routes/webhooks.js` Z. 280–379 auf `e2f4cc7` (enthält C3a4-1: Lesen ausserhalb der Transaktion,
unbedingtes `aktiv`-UPDATE → Admin-Deaktivierung still aufgehoben) und Z. 280–444 auf `35c4e01` (behoben:
`auditTx` + CASE-Riegel). Wortgleiche Frage (Zustandsfrage), ZDR erzwungen.

| Modell | ALT (Befund muss kommen) | NEU (darf keinen Befund melden) |
|---|---|---|
| `ling-3.0-flash-fin` | **Treffer** — Wurzel richtig (Lesen vor dem Lock, Schreiben danach); gewählter Ablauf läuft über den `auditTx`-Zweig (dann MIT Audit, also nicht „still“) — gültige Variante, nicht der schärfste Weg | **richtig: kein Befund**, Prüfweg nachvollziehbar (Lock + CASE) |
| `ling-3.0-flash-sante` | **Treffer** — Endzustand richtig (`aktiv=1, manuell_deaktiviert=1, inaktiv_seit=NULL`); Reihenfolge ungenau (das UPDATE wartet auf die Zeilensperre des Admins, schreibt also NACH dessen COMMIT, nicht davor) | **Fehlalarm** — „ein Nicht-App-Schreiber setzt `manuell_deaktiviert=0`“: dann hat dieser Schreiber reaktiviert, nicht der Webhook |
| `qwen3.8-27b` | **keine Antwort** — 4× HTTP 429 | **keine Antwort** — 4× HTTP 200 mit LEEREM Inhalt |

Dauer 7–33 s, Kosten 0.

## 3. Einordnung

- **Stichprobe von EINS** je Modell, und der Befund ist klein, mit Kontext vorgekaut. Das ist eine Beobachtung,
  keine Eignung (dieselbe Einschränkung wie beim Fünf-Modelle-Vergleich vom 18.09.: an einer Frage mit
  mitgeliefertem Kontext reicht fast jedes Modell).
- Für unsere eigentliche Aufgabe (Werkzeugweg mit Repo-Lesezugriff über viele Runden) ist nichts gemessen.
- Free-Kontingent ohne Guthaben laut OpenRouter-Doku 50 Aufrufe/Tag, 20/min (nicht von uns gemessen); die Anbieter drosseln zusätzlich (gemessen: qwen, gemma 429).
  Für eine Prüfspur mit 20–60 Werkzeugrunden je Lauf reicht das nicht verlässlich.

## 4. Empfehlung

Keines der Free-Modelle als Prüfspur einführen. Zwei erfüllen die Datengrenze, eines davon lieferte hier einen
Fehlalarm; beide sind klein und fachfremd trainiert, das Kontingent trägt keinen Werkzeuglauf. Als Einsatz denkbar
höchstens **Routinearbeit ohne Urteil** an Material OHNE Quelltext — dafür haben wir `gpt-5.4` mit `effort:none`
schon, gemessen und billig. Neu prüfen, wenn ein Code-Modell mit ZDR-Endpunkt frei wird.

-- Ende --
