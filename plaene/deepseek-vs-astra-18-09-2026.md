# DeepSeek gegen GPT-6-astra — was jedes kann, gemessen am 18.09.2026

Betreiber-Auftrag, wörtlich: „finde raus was es kann und vergleiche mit gpt 6.
nutze jeweils das beste system für die aufgaben. deepseak ist günstiger…nutze
hier die maximale stufe."

**Alles hier ist am echten Endpunkt gemessen.** Was ich NICHT gemessen habe,
steht als solches da — besonders die Kosten und die Aufbewahrung.

## Die wichtigste Erkenntnis steht am Anfang, weil sie die METHODE betrifft

**Bei DeepSeek wird ein frei erfundenes Feld STILL GESCHLUCKT.**

```
{"quatschfeld_xyz": true}   ->  HTTP 200
```

Bei OpenAI wird dasselbe mit „Unknown parameter" abgelehnt. **Darauf stützt
sich unsere Regel aus der CLAUDE.md: „ein ‚wird angenommen' sagt hier also
etwas."** Gegen DeepSeek trägt diese Regel NICHT. Jede Fähigkeit muss dort an
ihrer WIRKUNG gemessen werden, nie an der Annahme.

Teilweise validiert es doch: ein unbekannter WERT eines bekannten Feldes wird
mit HTTP 422 abgelehnt (`reasoning_effort: "zzz"`), und ein unbekanntes
Werkzeug ebenso. Es prüft also Werte bekannter Felder, ignoriert aber
unbekannte Felder ganz.

**Zweiter Methodenfund:** `GET /models` nennt **zwei** Modelle
(`deepseek-flash`, `deepseek-v4-pro`), aber **vier** Namen antworten — auch
`deepseek-chat` und `deepseek-reasoner`. Die Liste ist also unvollständig,
nicht überladen. Unsere Regel „eine Liste ist keine Verfügbarkeit" galt
bisher in die andere Richtung (etwas steht drin und antwortet trotzdem 404);
hier fehlt umgekehrt etwas, das es gibt.

## Was die vier Namen sind (gemessen, identische Frage)

| Name | Denk-Token | Einordnung |
|---|---|---|
| `deepseek-chat` | **0** | denkt nicht |
| `deepseek-flash` | 38 | denkt wenig |
| `deepseek-reasoner` | 38 | wie flash |
| **`deepseek-v4-pro`** | **66** | denkt am meisten — die maximale Stufe |

## Gegenüberstellung — nur Gemessenes

| | **DeepSeek v4-pro** | **GPT-6-astra** |
|---|---|---|
| Denkstufen | `none minimal low medium high xhigh max` | `low medium high xhigh max` |
| wirken sie? | **ja**: 0 → 1155 → 1314 → 1430 (none→low→medium→high) | **ja**, monoton: 152 → 259 → 442 → 748 |
| oberste Stufen | **nicht monoton**: high 1031, xhigh 1504, **max 1360** | monoton bis `max` |
| max. Ausgabe | **393.216** Token | 45.000 in unseren Läufen |
| Kontext | **308.089 Token durchgegangen**, Grenze darüber nicht ausgelotet | ~412k abgelehnt, 145k durch |
| Funktionsaufrufe | **ja, wirken** (echtes `tool_calls`, `finish_reason: tool_calls`) | ja (unser Gegenleser-Werkzeug) |
| erzwungene Ausgabeform | **NEIN** — `json_schema` → HTTP 400 „unavailable now" | **ja**, `json_schema` + `strict` |
| `json_object` | ja | ja |
| eingebaute Websuche | **NEIN** — `tools:[{type:web_search}]` → HTTP 422 | **ja, wirkt** (Quellen im Ergebnis) |
| Aufbewahrung abschaltbar | **nicht gefunden** — kein `store`-Gegenstück gemessen | **ja**, `store:false` in beide Richtungen gemessen |
| unbekanntes Feld | **still geschluckt** (200) | abgelehnt (400) |
| Bild-/Dateieingang | Files-API laut Betreiber-Doku: **nur Bilder** (JPEG/PNG/GIF/WebP), 64 MiB | Bildeingabe gemessen (14.09.) |
| Antwortzeit klein | 1–15 s | 5–15 s |

## Was NICHT gemessen ist — und deshalb nicht behauptet wird

- **Die Kosten.** Der Betreiber sagt „günstiger", und die Token-Preise
  sprechen dafür. Ich habe sie NICHT gemessen; unser Schlüssel hat bei OpenAI
  nicht einmal das Recht auf die Kostenabfrage (`Missing scopes:
  api.usage.read`, gemessen 18.09.). Eine Kostenaussage gehört auf eine
  Abrechnung, nicht auf eine Schätzung.
- **Ob DeepSeek unsere Eingaben aufbewahrt oder zum Training verwendet.** Ein
  Gegenstück zu `store: false` habe ich nicht gefunden, und die API-Doku ist
  aus dieser Umgebung nicht lesbar: `api-docs.deepseek.com` ist eine reine
  JavaScript-Anwendung — Wurzel und 404-Seite sind byte-gleich (46.114),
  `curl` bekommt nur die Hülle. **Das ist eine offene Frage an den Betreiber,
  keine technische Hürde:** unsere Datengrenze erlaubt Quelltext, aber die
  Entscheidung vom 12.09. lautete ausdrücklich „`store: false` gewinnt — unser
  Quelltext bleibt nicht auf fremden Servern liegen". Für DeepSeek ist dieser
  Schalter derzeit weder gefunden noch widerlegt.
- **Die obere Kontextgrenze.** 308k sind durchgegangen; wo Schluss ist, weiss
  ich nicht.

## Empfehlung zur Aufgabenteilung — nach gemessener Eignung

**Zum Prüfen und Gegenlesen: weiterhin `gpt-6-astra`.** Nicht aus Gewohnheit,
sondern weil drei gemessene Eigenschaften genau dort hängen:

1. **`json_schema` mit `strict`** macht Befunde ZÄHLBAR. Das ist keine
   Bequemlichkeit — die Regel vom 12.09. verlangt zählbare Ausgaben, damit
   aus Anekdoten über die Zeit eine Messung wird. DeepSeek kann es nicht.
2. **Die eingebaute Websuche** brauchen wir für Schwachstellen zu den
   Versionen aus `package.json`. DeepSeek hat sie nicht.
3. **`store: false`** ist bei astra gemessen, bei DeepSeek offen.

**Für billige Massenarbeit ohne Urteil: DeepSeek v4-pro.** Grosser Kontext
(308k gemessen), riesiges Ausgabebudget, funktionierende Funktionsaufrufe,
schnell. Passende Aufgaben: Fundstellen kartieren, Listen normalisieren,
grosse Logs zusammenfassen, Übersetzungen, Rohentwürfe von Prosa.

**Was NICHT dorthin gehört — und das gilt für jedes billige Modell:** jede
Aussage über unseren Bestand. Die Regel „jeder Befund ist eine Behauptung,
bis der Haupt-Agent sie gemessen hat" gilt dort erst recht, und ein billiger
Lauf, dessen Befunde alle fallen, ist teurer als gar keiner.

**Diese Empfehlung steht unter Vorbehalt des A/B-Laufs** über einen echten
Diff, der zur Stunde läuft — derselbe Auftrag wörtlich, dasselbe Material,
gezählt wird nicht „wie viele Befunde", sondern „wie viele halten, nachdem
ich sie selbst nachgemessen habe". Das Ergebnis wird hier nachgetragen.

## Aufrufmuster (Schlüssel nie in der Kommandozeile)

    cfg=/tmp/claude-0/.curlcfg-ds; umask 077
    printf 'header = "Authorization: Bearer %s"\n' "$(tr -d '\r\n' < /tmp/claude-0/.deepseek-key)" > "$cfg"
    curl -sS -K "$cfg" -H "Content-Type: application/json" -d @anfrage.json \
         https://api.deepseek.com/chat/completions -o antwort.json
    rm -f "$cfg"

Der Schlüssel liegt in `/tmp/claude-0/.deepseek-key` (Rechte 600), NICHT im
Repo — gegengeprüft mit einer Suche über alle vier Arbeitsbäume.

**Er stand im Sitzungsprotokoll.** Dasselbe galt am 10.09.2026 für den
OpenAI-Schlüssel; der Betreiber hat damals ausdrücklich auf eine Rotation
verzichtet. Ich nenne es einmal und richte mich danach: Missbrauch zeigt sich
an der Abrechnung.
