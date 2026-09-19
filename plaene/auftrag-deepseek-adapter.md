# Auftrag: zweiter Protokoll-Adapter im Gegenleser (DeepSeek mit Repo-Lesezugriff)

**Betreiber-Entscheidung 19.09.2026.** Ich hatte abgeraten, weil sich bei
DeepSeek nicht überprüfen lässt, was mit unserem Quelltext geschieht; der
Betreiber hat die Frage nach dieser Auskunft bejaht. Das ist seine
Entscheidung über seine Daten — sie steht, und sie wird hier nicht erneut
aufgemacht. Festgehalten wird nur, was gemessen ist (siehe „Datengrenze").

**REIHENFOLGE: Dieser Auftrag beginnt ERST, wenn der Streaming-Umbau von
`tools/gegenleser-repo.js` gemerged ist.** Beide fassen dieselbe Datei an.

## Was gemessen ist (19.09.2026, echter Endpunkt)

Die volle Werkzeug-Schleife trägt bei DeepSeek: Runde 1 liefert
`finish_reason: tool_calls` mit korrekten Argumenten; Runde 2 mit
zurückgeschickter Assistenznachricht und `role:tool`-Ergebnis → HTTP 200,
`finish_reason: stop`, inhaltlich korrekte Antwort aus dem Werkzeugergebnis.

**Protokollunterschiede, je einzeln gemessen:**

| | OpenAI `/v1/responses` | DeepSeek `/chat/completions` |
|---|---|---|
| Verlauf | `input[]` | `messages[]` |
| Werkzeugschema | flach (`{type,name,parameters,strict}`) | verschachtelt (`{type,function:{…}}`) |
| Aufruf in der Antwort | `output[]`-Element `function_call` mit `call_id` | `choices[0].message.tool_calls[]` mit `id` + `function{}` |
| Ergebnis zurück | `{type:"function_call_output", call_id, output}` | `{role:"tool", tool_call_id, content}` |
| Zug zurück | alle `output[]`-Elemente einzeln | `choices[0].message` als Ganzes |
| Token-Deckel | `max_output_tokens` | `max_tokens` |
| Verbrauch | `input_tokens` / `output_tokens` | `prompt_tokens` / `completion_tokens` |
| Ende | `status` + Ausgabetypen | `finish_reason` |
| Strenges Schema | `text.format` json_schema strict | **gibt es NICHT** — HTTP 400 „This response_format type is unavailable now"; nur `json_object` |
| Streaming | **nötig** (Proxy schneidet bei 300,3 s) | **nicht nötig** — 244 s und 518 s gemessen durchgelaufen |

**Streaming für DeepSeek wird NICHT gebaut.** Begründung: die harte
300,3-s-Grenze gilt für `api.openai.com`, nicht hier. DeepSeeks Streaming
liefert ausserdem nur `chat.completion.chunk`-Deltas mit `data: [DONE]` und
KEIN Abschlussobjekt — die Werkzeugargumente müssten über Fragmente
zusammengesetzt werden. Das ist deutlich mehr Angriffsfläche für genau nichts.
Einzelne Runden einer Werkzeugschleife sind ohnehin kurz; die langen Zeiten
oben stammen von Einzelschuss-Tiefenanalysen.

## Datengrenze — was gilt und was NICHT behauptet werden darf

* **Der Geheimnis-Riegel und die `git ls-files`-Erlaubnisliste gelten
  unverändert für BEIDE Protokolle.** Sie sitzen in `werkzeugAufrufen()` bzw.
  der Pfadprüfung, also VOR dem Protokoll. **Prüfe das und sichere es zu** —
  wenn ein Adapter daran vorbeikäme, ist der ganze Auftrag hinfällig.
* **`store: false` wird mitgeschickt, darf aber NICHT als Schutz kommentiert
  werden.** Gemessen: DeepSeek nimmt ein frei erfundenes Feld
  (`quatschfeld_xyz`) mit HTTP 200 an — unbekannte Parameter werden still
  geschluckt. „Wird angenommen" sagt hier also nichts. Der Kommentar muss das
  wörtlich benennen. Ein konfigurierter Wert, von dem niemand zeigen kann,
  dass er wirkt, ist genau die Klasse, die wir in dieser Datei gerade behoben
  haben.
* **DeepSeek kommt NICHT in `PREISTABELLE`.** Wir kennen die Preise nicht und
  erfinden keine. `kostenSchaetzen()` liefert dann `null` und das Werkzeug
  meldet „Kosten unbekannt (Modell … nicht in der Preistabelle)" — das ist
  richtig und bleibt so, bis der Betreiber echte Zahlen nennt.

## Bauweise

Ein **Protokoll-Adapter** mit zwei Ausprägungen, gewählt am Modellnamen
(oder an einem eigenen Schalter). Jede Ausprägung bietet dieselben drei
Operationen, und die Rundenschleife wird protokollfrei:

1. `anfrageBauen(modell, verlauf, mitWerkzeugen)` → Anfragekörper
2. `antwortLesen(körper)` → `{ aufrufe[], text, verbrauch:{rein,raus}, abbruch }`
3. `verlaufErweitern(verlauf, antwort, ergebnisse)` → Zug und Ergebnisse anhängen

**Die Rundenschleife darf danach KEIN Protokollfeld mehr kennen** —
kein `output`, kein `choices`, kein `input_tokens`. Das ist die eigentliche
Zusicherung dieses Beitrags; wenn irgendwo noch ein Feldname durchschlägt,
ist der Adapter nur halb gebaut.

**Der Riegel der letzten zwei Runden (`mitWerkzeugen = false`) muss in BEIDEN
Ausprägungen wirken** — ohne `tools` im Körper kann das Modell keine Funktion
mehr aufrufen. Das ist heute über den aufgezeichneten Anfragekörper bewacht;
die Zusicherung braucht eine Entsprechung für den zweiten Weg.

## Gegenproben — je einzeln, Ausgabe wörtlich, mit Positivkontrolle

* **GP-A Erlaubnisliste gilt für den zweiten Weg.** Ein Pfad ausserhalb von
  `git ls-files` wird über den DeepSeek-Weg abgelehnt. Positivkontrolle: ein
  erlaubter Pfad geht durch.
* **GP-B Geheimnis-Riegel gilt für den zweiten Weg.** Ein Funktionsergebnis
  mit einem Geheimnis-Muster wird geschwärzt bzw. abgelehnt, und die Stelle
  taucht in der Zusammenfassung auf.
* **GP-C Rundenriegel.** In den letzten zwei Runden enthält der
  aufgezeichnete DeepSeek-Körper KEIN `tools`. Mutation, die ihn doch
  mitschickt, muss rot werden.
* **GP-D Feldabbildung in beide Richtungen.** Ein gestubbter
  DeepSeek-Antwortkörper mit `tool_calls` erzeugt denselben internen
  Aufrufzustand wie der entsprechende OpenAI-Körper. Mutation: `id` statt
  `tool_call_id` beim Zurückschicken → muss rot werden.
* **GP-E Verbrauchsabbildung.** `prompt_tokens`/`completion_tokens` landen in
  denselben Summen wie `input_tokens`/`output_tokens`. Mutation: die beiden
  vertauschen → muss rot werden. (Eine Zahl, die aus derselben Quelle kommt
  wie ihr Sollwert, bewacht nichts — der Sollwert steht als Literal in der
  Fixtur.)
* **GP-F Protokollfreiheit der Schleife.** Eine Zusicherung, die belegt, dass
  in der Rundenschleife kein Protokollfeldname mehr vorkommt. Am ehesten ein
  Quelltext-Wächter über den Funktionsrumpf — er muss an einem absichtlich
  wieder eingebauten `antwort.output` rot werden.

Regeln für die Mutationen wie immer: Zielpfad als ARGUMENT, Abbruch bei ≠1
Fundstelle, Marker in derselben Zeile, `node --check` davor, Rücknahme nur
gegen eine mit `cp` beiseitegelegte Kopie mit `diff` EXIT 0, Rücknahme NIE
mit einem Testlauf verkettet.

## Abnahme

* `node --check`, `node tools/gegenleser-repo.js --selbsttest` → EXIT 0,
  `ERWARTETE_FAELLE` von Hand hochgezogen.
* `npm run lint`, Ergebnis wörtlich — auch bei Grün.
* **KEIN echter Netzaufruf im Selbsttest** (läuft in CI bei jedem Push).
* **Ein echter Probelauf gegen DeepSeek ist NICHT Teil der Abnahme** —
  er kostet Geld und gehört zu meiner Prüfung, nicht zu deiner.
