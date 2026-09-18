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
| oberste Stufen | **nur drei echte Stufen** — `xhigh` ist intern `high` (s. Nachtrag) | monoton bis `max`, fünf echte Stufen |
| max. Ausgabe | **393.216** Token | 45.000 in unseren Läufen |
| Kontext | **308.089 Token durchgegangen**, Grenze darüber nicht ausgelotet | ~412k abgelehnt, 145k durch |
| Funktionsaufrufe | **ja, wirken** (echtes `tool_calls`, `finish_reason: tool_calls`) | ja (unser Gegenleser-Werkzeug) |
| erzwungene Ausgabeform | **ja, an der Responses-API** — an `/chat/completions` HTTP 400 (s. Nachtrag) | **ja**, `json_schema` + `strict` |
| `json_object` | ja | ja |
| eingebaute Websuche | **NEIN** — `tools:[{type:web_search}]` → HTTP 422 | **ja, wirkt** (Quellen im Ergebnis) |
| Aufbewahrung abschaltbar | **entfällt** — API ist zustandslos, Antwort trägt immer `store: false` (gemessen) | **ja**, `store:false` in beide Richtungen gemessen |
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

---

# Nachtrag 18.09.2026 abends — der A/B-Lauf, und vier eigene Fehlmessungen

Der Betreiber hat nach dem ersten Stand die API-Dokumentation nachgereicht.
Vier meiner Aussagen oben waren damit prüfbar falsch. Sie stehen korrigiert
in der Tabelle; hier steht, WORAN sie falsch waren, weil der Fehler jedes Mal
derselbe war: **ich habe an der falschen Tür gemessen und das Ergebnis für
eine Eigenschaft des Hauses gehalten.**

## 1. `json_schema` geht — nur nicht an `/chat/completions`

Gemessen hatte ich HTTP 400 „This response_format type is unavailable now",
in fünf Gestalten, und daraus geschlossen: kann es nicht. Die Doku nennt eine
zweite Tür, die Responses-API. Dort, mit demselben Schlüssel, derselben
Minute:

    POST https://api.deepseek.com/responses   (auch /v1/responses)
    text.format = json_schema, strict:true, Schlüssel "kwirzel"/"pfand"
    -> HTTP 200, status completed
    -> '{"kwirzel": 8, "pfand": "Spinne"}'

Die Positivkontrolle steckt in den Namen: `kwirzel` und `pfand` sind erfunden,
kein Modell schreibt sie von sich aus. Die Antwort spiegelt das Schema
zusätzlich in `text.format` zurück.

**Und `json_object` an `/chat/completions` geht auch** — mein erster Versuch
dort lieferte leeren Inhalt, aber **nicht, weil das Format scheitert**:
`finish_reason: length`, 300 von 300 Ausgabe-Token gingen ins Denken, für die
Antwort blieb nichts. Mit `reasoning_effort: "none"` kam
`{"kwirzel": 8, "pfand": "Spinne"}`. Das ist wörtlich die Falle aus der
CLAUDE.md („`status` gehört in JEDEN Aufruf geprüft"), hier unter dem Namen
`finish_reason` — und ich bin hineingelaufen, obwohl ich die Regel selbst
aufgeschrieben habe.

## 2. Die Denkstufen sind zu dritt, nicht zu siebt

Meine Beobachtung „nicht monoton: high 1031, **xhigh 1504**, max 1360" war
keine Beobachtung über Sorgfalt, sondern Rauschen. Die Doku bildet ab:
minimal→low, low→low, medium→high, high→high, **xhigh→high**, max→max,
ultra→max. Es gibt **drei** echte Stufen. `high` und `xhigh` sind dasselbe;
zwei Läufe derselben Stufe streuen, das ist alles, was ich gemessen habe.

Folge für uns: bei DeepSeek ist `max` wirklich die Spitze und `xhigh` ein
Synonym für die Mitte — umgekehrt zu `gpt-6-astra`, wo `xhigh` und `max`
zwei getrennte Stufen sind.

## 3. Der Denkschalter wirkt in beide Richtungen

| Variante | Denk-Token | `reasoning_content` |
|---|---|---|
| ohne Angabe (Vorgabe) | 405 | 976 Zeichen |
| `thinking: {"type":"enabled"}` | 268 | 609 Zeichen |
| `thinking: {"type":"disabled"}` | **0** | 0 |
| `reasoning_effort: "none"` | **0** | 0 |

## 4. Aufbewahrung: die Frage war falsch gestellt

Oben stand „kein `store`-Gegenstück gefunden, offene Frage an den Betreiber".
Die Responses-API ist **zustandslos**: `previous_response_id`, `conversation`,
`store`, `background` und `metadata` gibt es nicht, und die Antwort trägt
immer `store: false` — von mir gemessen, nicht abgeschrieben.

**Ehrlich dazu, weil es die Datengrenze berührt:** zustandslos heisst nicht
spurlos. Das Context Caching schreibt Eingabe-Präfixe auf Platte, ist
standardmässig an, lässt sich über die API nicht abschalten
(`prompt_cache_retention` wird nicht unterstützt) und hält die Präfixe laut
Doku „einige Stunden bis Tage". Die Antwort selbst wird nicht aufbewahrt, das
gesendete Material als Präfix schon. Gemessen sichtbar wird das an
`prompt_cache_hit_tokens`: mein zweiter Aufruf desselben Prompts meldete
`cached_tokens: 128` von 164. Bei OpenAI gilt dasselbe für deren Prompt-Cache,
das ist also kein Unterscheidungsmerkmal — aber „unser Quelltext bleibt nicht
auf fremden Servern" ist bei BEIDEN Anbietern eine Aussage über die
Antwort-Aufbewahrung, nicht über den Cache. Das gehört benannt, nicht
verschwiegen.

## Der A/B-Lauf — das eigentliche Ergebnis

Derselbe Diff (Mandantengrenze M1+M2), dasselbe Bündel (54.477 Zeichen),
derselbe Auftrag wörtlich wie an die beiden eigenen Spuren.
`reasoning_effort: "max"`, 18.344 Eingabe-Token, 27.197 Denk-Token, 31.453
Ausgabe-Token, 264 Sekunden, `finish_reason: stop`.

**Der erste Versuch lief ins Leere** (`max_tokens: 16000`, 0 Zeichen Inhalt,
62.186 Zeichen Denkprotokoll mitten im Satz abgeschnitten) — dieselbe Falle
wie oben unter 1. Wer nur den Text ausliest, meldet „keine Befunde" und meint
„niemand hat geprüft".

Acht Befunde. Jeden habe ich selbst am Quelltext nachgemessen:

| # | Befund | Verdikt | Deckung mit den eigenen Spuren |
|---|---|---|---|
| 2.1 | Ablehnung lässt sich mit `if (!ma)` in den `catch` verlagern, alle M2-Zusicherungen bleiben grün | **hält** | **= N9**, wörtlich dieselbe Mutation |
| 3 | Ununterscheidbarkeit nur für „fremd", nicht für „nicht vorhanden" zugesichert | **hält** | **= N4** |
| 4.1 | `api()` wirft bei Netzfehler, der neue `alert` wird nie erreicht | **hält** | **= N6/N11** |
| 2.2 | Zeilenzahl-Zusicherungen sind gegen `ON CONFLICT DO UPDATE` spröde | **hält** | ≈ N3 |
| 1.2 | 21 der 51 `INSERT`s ungeprüft, zweiter Eintrittspunkt nicht ausgeschlossen | **hält als Tatsache, Schwere überzogen** | **NEU** |
| 2.3 | `MINDEST_PRUEFUNGEN` zählt nur die MENGE der Prüfungen, nicht welche | **hält** | **NEU** |
| 4.2 | kein `try/catch` um den neuen SELECT, Express leitet die Rejection nicht weiter, Prozess kann sterben | **fällt** | — |
| 4.3 | `db.one` könnte nach pg-promise-Art werfen, beide `if`-Zweige wären tot | **fällt** | — |

**Sechs von acht halten, zwei davon hatte keine meiner beiden Spuren.**

**Die zwei, die fallen, sind MEIN Fehler, nicht seiner.** Beide hängen an
genau einer Tatsache, die im Bündel nicht drin war:

- 4.2 behauptet Express-4-Verhalten. Wir fahren `express: ^5.2.1`
  (`package.json:14`) — Express 5 leitet eine abgelehnte Promise aus einem
  async-Handler sehr wohl an den Fehlerhandler weiter, und den gibt es
  (`server.js:1467`), inklusive JSON-Antwort für `Accept: application/json`.
  **`package.json` lag nicht im Bündel** (gemessen: `grep -c '"express"'` → 0).
- 4.3 vermutet pg-promise-Semantik. `db.one` ist unser eigener Helfer:
  `return res.rows[0] ?? null` (`core/db.js:426-429`), im Kopf sogar
  kommentiert als „erste Zeile oder null". **Die Definition lag nicht im
  Bündel** — nur ein Schema-Auszug derselben Datei (gemessen:
  `grep -n "async function one(sql"` → kein Treffer).

Das bestätigt die Regel vom 12.09. („ins Bündel gehören die
Geschwisterstellen") ein zweites Mal, und diesmal mit einem Preis dran:
**zwei von acht Befunden waren Rauschen, das ich selbst erzeugt habe.** Zwei
Dateien mehr im Bündel — `package.json` und `core/db.js` ganz statt im
Auszug — hätten beide verhindert.

Was der Lauf NICHT hergibt: ein Diff, ein Lauf, ein Tag. Dieselbe
Einschränkung wie bei Astra. Und die drei Spuren hatten ungleiche Freiheit —
meine Claude-Spur durfte AUSFÜHREN, DeepSeek und Astra nur lesen.

## Was sich an der Empfehlung dadurch ändert

Meine Empfehlung oben nannte drei Gründe für `gpt-6-astra` beim Prüfen.
**Zwei davon sind durch die Messungen oben weggefallen** — das gehört gesagt,
nicht stillschweigend übergangen:

1. „`json_schema` kann DeepSeek nicht" — **falsch**, an der Responses-API
   kann es das, gemessen mit Positivkontrolle.
2. „`store: false` ist bei DeepSeek offen" — **erledigt**, die API ist
   zustandslos und meldet es selbst.
3. **Die eingebaute Websuche bleibt** der einzige harte Unterschied
   (DeepSeek: HTTP 422). Für das Abhängigkeits-Audit gegen `package.json`
   brauchen wir sie.

**Die Empfehlung bleibt trotzdem `gpt-6-astra` als Gegenleser** — aber ab
jetzt aus einem anderen Grund als vorher, und der ist schwächer: nicht weil
DeepSeek es nicht kann, sondern weil unser Verfahren an astra gemessen ist
und ein Modellwechsel nie die Erklärung für ein besseres Ergebnis ist,
solange sich am selben Tag auch etwas anderes geändert hat. Sechs von acht
gehaltenen Befunden sind kein Grund zu wechseln, aber ein sehr guter Grund,
**beide** laufen zu lassen, wo es drauf ankommt: die zwei neuen Befunde
(1.2, 2.3) hatte keine meiner eigenen Spuren, und das ist genau das Muster
vom 13.09. — verschiedene Sucher finden verschiedene Klassen, nicht
verschiedene Meinungen über dieselbe Frage.

**Für billige Massenarbeit bleibt es bei DeepSeek**, unverändert.
