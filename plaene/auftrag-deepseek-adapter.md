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

---

# NACHTRAG 19.09.2026 — Planprüfung durch DeepSeek, und die Entscheidung zu WARTEN

## Die drei Befunde (alle selbst am Quelltext nachgeprüft, alle tragen)

**D1 (blockierend) — GP-A/GP-B verbieten keinen zweiten Lesepfad.**
Sie prüfen, dass eine Ablehnung korrekt erfolgt, WENN der Adapter
`werkzeugAufrufen()` benutzt. Sie erzwingen nicht, dass er es benutzt. Ein
Adapter mit eigenem `fs.readFileSync` umginge Erlaubnisliste UND
Geheimnis-Riegel, und beide Gegenproben blieben grün. Das ist genau der
Fehler, den mein eigenes Papier als „macht den Beitrag hinfällig" benennt.
**Behebung:** ein Quelltext-Wächter, der dem Adapterteil jeden direkten
Dateisystemzugriff VERBIETET und belegt, dass jeder Modell-Werkzeugaufruf
durch die eine gemeinsame Funktion läuft.

**D2 (mittel) — GP-F nennt nur EIN verbotenes Feld.** „Kein Protokollfeldname
in der Rundenschleife" gegen nur `antwort.output` geprüft, während `choices`,
`messages`, `input_tokens`, `prompt_tokens`, `tool_calls`, `call_id`,
`max_tokens` alle durchgingen. Eine Zusicherung, die einen NAMEN prüft statt
einer MENGE — dieselbe Klasse wie „eine Zahl ist keine Menge".

**D3 (niedrig, aber zeitkritisch) — der Fehlerweg für `usage` fehlt im Plan.**
Der Adapter muss bei einem Fehlschlag `prompt_tokens`/`completion_tokens` an
das Fehlerobjekt hängen, wie es der OpenAI-Weg über `gegenleserUsage` tut.
Sonst meldet die Zusammenfassung „Token rein: 0" für einen bezahlten Lauf.

## Warum der Adapter WARTET

Drei unabhängige Gründe, keiner davon Bequemlichkeit:

1. **D3 hängt an einem Mechanismus, der GERADE umgebaut wird.** Die laufende
   Nacharbeit verschiebt den Einmal-Riegel in den äusseren Executor und ändert,
   wie der Fehler `usage` trägt. Ein Adapter, der heute daran andockt, dockt an
   einen Stand an, den es in einer Stunde nicht mehr gibt.
2. **Betreiber-Meldung 19.09.2026: DeepSeek routet derzeit intern über das
   Flash-Modell.** Von unserer Seite sind die beiden IDs unterscheidbar —
   verschiedene Fingerprints (`a307abda…` gegen `aeb56401…`) und verschiedene
   Denktiefe bei derselben Frage (458 gegen 146 Denk-Token). Was der Anbieter
   intern tut, sehen wir nicht. Eine Integration auf ein bestimmtes Modell zu
   verdrahten, während der Anbieter routet, ist schlechtes Timing.
3. **Der grosse Hebel braucht den Adapter gar nicht — gemessen.**

## Der Hebel, der SOFORT verfügbar ist

**DeepSeeks Kontextgrenze ist 1.048.576 Token** (gemessen, die Fehlermeldung
nennt sie wörtlich: „This model's maximum context length is 1048576 tokens").
Zum Vergleich: OpenAIs `/v1/responses` liegt bei rund 400.000.

**Unsere bisherigen Bündel nutzen davon 11 %** — die Planprüfung oben lief mit
116.156 Eingabe-Token.

Der ganze Nutzen des Adapters lautet „DeepSeek findet, was niemand ins Bündel
gelegt hat". Ein **zehnfach grösseres Bündel** holt einen grossen Teil davon
sofort — ohne neue Angriffsfläche, ohne dass ein zweiter Anbieter adaptiven
Lesezugriff bekommt, und ohne eine Bau-Runde.

**Das ist ab sofort die Regel für DeepSeek-Bündel:** Grösse VORHER zählen und
den gewonnenen Platz in Geschwisterdateien stecken, nicht in mehr Prosa —
dieselbe Regel wie beim OpenAI-Leser, nur mit einer Grenze, die zweieinhalbmal
so hoch liegt.

## Was der Adapter zusätzlich bekommt, wenn er gebaut wird

* Die Behebung zu D1, D2, D3 oben.
* **Ein Lesebudget je Lauf.** Beim adaptiven Lesen entscheidet das Modell, was
  es zieht; die Erlaubnisliste begrenzt das WAS, nicht das WIEVIEL. Eine
  Obergrenze an gelesenen Bytes je Lauf bindet die Preisgabe an einen zweiten
  Anbieter — bei dem wir, anders als bei OpenAI, keine überprüfbare Aussage
  über den Verbleib haben.

---

# BERICHTIGUNG 19.09.2026 — an der Primärquelle geprüft

Der Betreiber hat die offizielle Ankündigung genannt; ich habe sie selbst
geholt (`api-docs.deepseek.com/news/news260910/`), nicht die Zusammenfassung
geglaubt. Wortlaut:

> „Starting at 04:00 UTC on Sept 14, 2026, all `deepseek-v4-pro` requests will
> route to V4.1-Flash at V4.1-Flash rates. This will continue until V4.1-Pro
> launches." · „We're phasing out V4-Pro." · „Set your model to
> `deepseek-flash`."

**Mein eigener Schluss von heute war falsch.** Ich hatte aus zwei
verschiedenen `system_fingerprint`-Werten (`a307abda…` gegen `aeb56401…`) und
verschiedener Denktiefe (458 gegen 146 Denk-Token) gefolgert, die beiden IDs
seien unterscheidbare Modelle. Die Dokumentation sagt, beide landen auf
V4.1-Flash. Den Unterschied kann ich von hier nicht erklären — aber **ein
Fingerprint ist kein Modellnachweis**, und eine Beobachtung, für die ich keine
Erklärung habe, schlägt keine Primärquelle.

**Folge für alle unsere bisherigen Zahlen:** jeder DeepSeek-Lauf seit dem
14.09.2026 war V4.1-Flash. Das betrifft die Messung vom 18.09. („zwei Befunde,
die keine andere Spur hatte") und beide Läufe von heute. Das macht die
Ergebnisse **besser**, nicht schlechter: sie stammen vom Modell, das wir
ohnehin weiter benutzen werden.

## Die Preise, an der Doku geprüft (je 1M Token)

| | Eingabe (Cache-Fehlschlag) | Ausgabe |
|---|---|---|
| off-peak | **0,15 $** | **0,60 $** |
| peak | 0,30 $ | 1,20 $ |

Peak ist 01:00–04:00 und 06:00–10:00 UTC, Montag bis Freitag. Alles andere —
inklusive Wochenende — ist off-peak zum halben Satz. Ausgabegrenze 384K,
Werkzeugaufrufe ✓, `json_object` ✓ (kein `json_schema`, gemessen).

**Was unsere Läufe wirklich gekostet haben** (heute ist Samstag, also ganztägig
off-peak):

    Planpruefung Streaming   103.416 rein / 19.057 raus  ->  0,0269 $
    Planpruefung Adapter     116.156 rein / 14.632 raus  ->  0,0262 $
                                                   zusammen  0,0531 $

Die beiden sol-Läufe desselben Tages kosteten **3,69 $**. Verhältnis rund
**70:1** — und der 2,6-Cent-Lauf hat einen BLOCKIERENDEN Fehler in meinem
eigenen Auftragspapier gefunden.

## Was sich dadurch an der Arbeitsweise ändert

1. **Modell-ID wird `deepseek-flash`.** `deepseek-v4-pro` ist eine
   VORÜBERGEHENDE Weiterleitung auf ein Modell, das ausläuft. Sich darauf zu
   stützen ist genau die Klasse, die wir heute den ganzen Tag beseitigt haben:
   ein konfigurierter Wert, der nicht das tut, was danebensteht.
2. **Der Grund „Routing-Unklarheit" fürs Warten ist erledigt** — er ist jetzt
   dokumentiert beantwortet. Es bleiben zwei Gründe: der Fehlerweg für `usage`
   wird gerade umgebaut, und der 1M-Kontext ist ohne Adapter zu haben.
3. **DeepSeek wird zur Regel-Zweitspur, nicht zur Ausnahme.** Bei drei Cent je
   Lauf und 1.048.576 Token Kontext gibt es keinen Kostengrund mehr, eine
   zweite Spur wegzulassen. Die Beweislast dreht sich um: nicht mehr begründen,
   warum man sie ruft, sondern warum nicht.
4. **`reasoning_effort` wird gesetzt, und `max_tokens` grosszügig.** Gemessen:
   ohne Deckel denkt das Modell das ganze Budget leer und liefert NICHTS
   (4000 von 4000 Token ins Denken) — genau der Fehlschlag von DeepSeek-Lauf 1
   heute früh. Mit `low`: 977 Denk-Token und eine Antwort.

---

# DER AUFTRAG OBEN IST GRÖSSTENTEILS HINFÄLLIG — gemessen 19.09.2026

Ich habe ihn gegen `/chat/completions` geschrieben. **DeepSeek hat eine
Responses-API, und sie ist formgleich mit der von OpenAI.** Gemessen, ein
Aufruf mit exakt unserer Werkzeugform:

    POST https://api.deepseek.com/v1/responses   ->  HTTP 200, status: completed
    flache Werkzeugform {type,name,parameters,strict}   angenommen
    store:false, truncation:"disabled"                  angenommen
    output[]: ["reasoning","function_call"]
    function_call-Felder: type,id,status,arguments,call_id,name   ← identisch
    usage: input_tokens / output_tokens                            ← identisch
    text.format json_schema strict:                     eingehalten (eigener Lauf)

**Damit entfällt die gesamte Übersetzungsschicht aus dem Auftrag oben.** Die
Tabelle der Protokollunterschiede (`messages` gegen `input`, verschachtelte
Werkzeugform, `tool_calls` gegen `function_call`, `prompt_tokens` gegen
`input_tokens`) beschreibt `/chat/completions` — an `/v1/responses` gibt es
sie nicht.

Was WIRKLICH unterschiedlich ist: die Basis-URL, der Modellname, der
Schlüssel. Das sind ein paar Zeilen, kein Protokoll-Adapter.

**Folge für die Sicherheit — sie wird BESSER, nicht schlechter.** DeepSeeks
blockierender Befund D1 (ein zweiter Lesepfad könnte Erlaubnisliste und
Geheimnis-Riegel umgehen) zielte auf eigenen Adaptercode. Wenn es keinen
eigenen Adaptercode gibt, sondern nur einen anderen Endpunkt für denselben
Weg, gibt es auch keine Stelle, an der sich ein zweiter Pfad einschleichen
kann. Die Zusicherung bleibt trotzdem drin — sie kostet nichts und bewacht
künftige Umbauten.

**Was noch zu messen ist, bevor gebaut wird:** ob `metadata`,
`reasoning.effort` und `max_tool_calls` an DeepSeeks Responses-API wirken
(angenommen heisst dort nichts — unbekannte Felder werden still geschluckt,
gemessen). Und ob der Egress-Proxy dort ohne Streaming eine harte Grenze hat;
für `/chat/completions` sind 518 s und 244 s durchgelaufen, für
`/v1/responses` ist es NICHT gemessen.

**Der Auftrag wird neu geschrieben, sobald die Streaming-Nacharbeit gemergt
ist.** Er wird klein.

---

# BETREIBER-ENTSCHEIDUNG 19.09.2026 — zwei Spuren, verschiedene Fragen

Angenommen ist der Vorschlag: der risikoorientierte Durchgang bekommt bei
jedem Bündel BEIDE Spuren, aber mit VERSCHIEDENEN Aufträgen — nicht demselben.
Dazu: „falls mehr Token genutzt werden können, dann lass DeepSeek auch gern
mehr prüfen. Erst wenn es mit der Belastung des Systems geht."

## Aufgabenteilung (Hypothese, wird am Durchgang gemessen)

| Spur | Frage | gemessene Eignung |
|---|---|---|
| **sol**, mit Repo-Lesezugriff | „Welchen Zustand kann der Code erreichen, den keine Fixtur herstellt?" | 13.09.: durchweg Kontrollfluss-Befunde; 19.09.: vier nicht-fallende Zusicherungen |
| **DeepSeek**, ganzes Teilsystem im Bündel | „Was verbietet das hier NICHT? Wo geht eine Folgerung weiter als ihre Messung?" | 19.09.: der blockierende Befund gegen meine eigenen Gegenproben; DS-2 gegen meine M2-Verallgemeinerung |
| **eigene Executer** | „Zeile zurückdrehen — bleibt es grün?" | durchgehend: gemessene Mutationen |

**Das ist eine Hypothese aus einer Handvoll Läufen, keine Regel.** Nach
vierzehn Bündeln mit mitgeschriebener Zuordnung („welche Spur fand was") ist
es eine Messung. Vorher wird sie nicht behauptet.

## Wo die Belastungsgrenze WIRKLICH liegt — gemessen

**Nicht bei DeepSeek.** Die Doku nennt 2500 gleichzeitige Verbindungen für
`deepseek-flash` (500 für pro), auf Kontoebene, darüber HTTP 429. Ein
Ratenlimit pro Minute steht dort nicht. Wir fahren eine Verbindung.

**Die Grenze ist unsere eigene, und sie ist seit dem 12.09. dieselbe: das
Nachmessen jedes Befunds durch den Haupt-Agenten.** Drei Cent je Lauf machen
das Prüfen von sechzehn Befunden keine Minute schneller. Daraus folgen drei
harte Regeln für das Hochfahren:

1. **Nie ein Prüflauf, während ein Executer im selben Arbeitsbaum baut.**
   Ausweg, heute benutzt und bewährt: das Bündel aus GIT-OBJEKTEN bauen
   (`git show <commit>:<pfad>`), nicht aus dem Arbeitsbaum — dann ist der
   Stand stabil und der Baum bleibt unberührt.
2. **Nicht mehr Läufe starten, als ich vor dem nächsten Takt nachmessen kann.**
   Ein Stapel ungeprüfter Befunde ist kein Fortschritt, sondern eine Schuld.
3. **Bündel hochfahren statt Läufe.** Der Gewinn liegt im Kontext, nicht in
   der Anzahl: 1.048.576 Token Grenze, bisher 11 % genutzt. Der gewonnene
   Platz geht in GESCHWISTERDATEIEN — das ganze betroffene Teilsystem statt
   eines Ausschnitts —, nicht in mehr Prosa.
