# Kimi K3 als dritte Prüfspur? — Erhebung 19.09.2026

Betreiber-Frage: „prüfe die Fähigkeiten von Kimi K3 und sage mir, ob das auch
wertvoll für uns sein kann."

**Diese Datei trennt strikt, was ICH GEMESSEN habe von dem, was die
Herstellerdokumentation BEHAUPTET.** Wir haben keinen Schlüssel, also ist
ausser der Erreichbarkeit nichts von uns geprüft.

---

## 1. GEMESSEN (von mir, 19.09.2026, aus diesem Container)

**Der Endpunkt ist erreichbar. Das ist die einzige Hürde, die wir sonst
zuerst finden.**

    https://api.moonshot.ai/v1/models   HTTP 401  0,80 s
    https://api.moonshot.cn/v1/models   HTTP 401  1,60 s
    https://www.moonshot.ai/            HTTP 200
    Fehlerkörper: {"error":{"message":"Incorrect API key provided",
                            "type":"incorrect_api_key_error"}}

**401 heisst „kein Schlüssel", nicht „gesperrt"** — der Unterschied ist bei uns
gemessen und wichtig: `api.github.com` wird vom Egress-Proxy geblockt,
`github.com/advisories` antwortet 403. Moonshot tut beides nicht. Die
Fehlerform ist OpenAI-kompatibel.

**Die Dokumentation ist maschinenlesbar abrufbar**: `platform.kimi.ai/docs/*.md`
liefert sauberes Markdown, dazu ein Index unter `/docs/llms.txt`. Kein
JavaScript-Gerüst, kein 403 — anders als bei TMview/EUIPO/DGUV.

## 2. BEHAUPTET (Herstellerdoku, Primärquelle, von uns NICHT gemessen)

| Punkt | Angabe |
|---|---|
| Kontextfenster | **1.048.576 Token** |
| Preis rein / raus | **3,00 $ / 15,00 $** je Mio. |
| Zwischengespeicherte Eingabe | **0,30 $** je Mio. (Zehntel) |
| Schnittstellen | Chat Completions, **Responses (OpenAI-kompatibel)**, Messages (Anthropic-kompatibel) |
| Werkzeugaufrufe | ja |
| Strukturierte Ausgabe | `response_format` / `text.format` |
| Denkstufen | `reasoning.effort` |
| Websuche | eingebautes Werkzeug |
| Speicherung | `store`, `background`, `previous_response_id`, `conversation` sind in der Responses-API als **„Always false" bzw. „Always null"** dokumentiert |

**Besonders für uns:** es gibt eine **Signaturprüfung** — man schickt eine
Nonce mit, bekommt Zeitstempel und Signatur zurück und kann nachweisen, dass
die Anfrage wirklich von diesem Modell bearbeitet wurde und **nicht
weitergeleitet** oder von einem anderen Modell beantwortet.

## 3. Was daraus FÜR UNS folgt

### Dafür

1. **Das Kontextfenster löst ein gemessenes Problem.** Bündel 1 musste in drei
   Schritten getrimmt werden (420.857 → 363.544 → 354.231 Token), um unter
   sols Grenze zu passen — und DeepSeek benannte danach seine Prüfgrenze:
   `core/seilgeraete.js` und vier weitere Dateien lagen nicht im Bündel,
   **genau dort entschied sich DS-3.** Am 12.09.2026 ist ausserdem gemessen,
   dass die Bündelwahl über einen Befund ENTSCHIEDEN hat.
2. **Der Preis.** Die heutigen Planprüfungen kosteten allein auf sol rund
   74 $. Bei 3,00/15,00 statt 5,00/30,00 wären das grob 40–50 % weniger.
3. **Die Signaturprüfung trifft genau die Klasse, die uns schon getroffen
   hat.** `deepseek-v4-pro` wurde still auf V4.1-Flash umgeleitet; erfahren
   haben wir es vom Betreiber, nicht von uns. Hier gäbe es ein Mittel, das
   nachzumessen statt zu glauben.
4. **Die Anbindung wäre klein.** Dieselbe Responses-Form wie OpenAI und
   DeepSeek — Basis-URL, Modellname, Schlüssel. Genau der Rest, der vom
   DeepSeek-Adapter übrig blieb.
5. **Werkzeugaufrufe** heisst: Repo-Lesezugriff möglich. Und **der war
   gemessen der Unterschied zwischen den Spuren**, nicht das Modell — vier
   von acht Befunden der ersten Runde stützten sich auf Dateien, die nicht im
   Bündel lagen.

### Dagegen

1. **Die PRÜFGÜTE ist null gemessen.** Kein einziger Befund ist durch unser
   Nachmessen gegangen. Das ist dieselbe Falle, die wir für `gpt-5.6-sol`
   schon aufgeschrieben haben — und dort wenigstens nach einem A/B-Lauf.
   Ein 1M-Fenster sagt nichts darüber, ob das Modell in unserem Code etwas
   findet.
2. **Der Engpass ist unsere Messzeit, nicht das Finden.** Heute: 17 Befunde
   auf EIN Papier aus zwei Spuren, alle einzeln nachgemessen. Eine dritte
   Spur macht daraus ~25. Das Geld ist nicht das Problem, die Stunden sind es.
3. **„Stateless" ist nicht ganz stateless.** Die automatische
   Präfix-Zwischenspeicherung hält Anfrage-Präfixe 5 Minuten bis 1 Stunde
   serverseitig — bei uns geht Quelltext raus. Das ist kein Ausschluss, aber
   es gehört benannt und nicht unter „store: false" verbucht.
4. **Kein Schlüssel.** Betreiber-Entscheidung (Konto, Guthaben). Es gälte
   dieselbe Handhabung wie bei den anderen: nie in der Kommandozeile, nur über
   eine curl-Konfigdatei, die danach gelöscht wird.

## 4. Empfehlung

**Nicht einführen, nicht verwerfen — EINEN A/B-Lauf gegen ein Papier fahren,
dessen Antwort wir schon kennen.**

Wir haben gerade den perfekten Prüfstein: die Planprüfung
`plaene/auftrag-schreibreihenfolge.md`. Dort ist bekannt, was drinsteht —
17 Befunde, alle nachgemessen, vier blockierend, **und einer, den BEIDE Spuren
unabhängig fanden** (der zentrale Behebungsvorschlag schliesst seine eigene
Klasse nicht).

Der Lauf ist damit eine echte Messung statt eines Eindrucks:

* **dasselbe Material, derselbe Brief, wörtlich** — sonst ist er wertlos
  (Hausregel vom A/B-Lauf am 06.09.2026).
* **Die eine Frage, an der er sich messen lassen muss:** findet er den
  blockierenden Befund, den beide anderen Spuren hatten?
* Kosten: bei ~350k Token Eingabe und ~30k Ausgabe grob **1,50 $**.

**Was der Lauf NICHT hergibt:** eine Stichprobe von eins. Genau wie beim
Fable-A/B vom 06.09. und beim DeepSeek-A/B vom 18.09. trägt er eine
Beobachtung, keine Umkehr — und ein Modellwechsel ist nie die Erklärung für
ein besseres Ergebnis, solange sich am selben Tag auch die Aufträge geändert
haben.

**Nötig dafür: ein Schlüssel.** Ohne den ist alles oberhalb von Abschnitt 1
Herstellerprosa.

---

# NACHTRAG 19.09.2026, 22:30 UTC — der Betreiber hat einen Schlüssel geliefert

Damit ist aus Herstellerprosa Messung geworden. **Alles ab hier ist am echten
Endpunkt gemessen**, die Gegenprobe steht jeweils dabei.

## 1. Zugang und Konto

    GET https://api.moonshot.ai/v1/models     HTTP 200   (Schlüssel gilt)
    GET https://api.moonshot.cn/v1/models     HTTP 401   "Invalid Authentication"

Der Schlüssel gehört zum **internationalen** Endpunkt; `.cn` ist ein eigener
Kontoraum. **Gegenprobe:** ein erfundenes Modell (`kimi-quatsch-9`) liefert
HTTP 400 `model_not_found` — ein „200" sagt hier also etwas.

**Konto gemessen** (`GET /v1/users/me`, `…/balance`):

| | |
|---|---|
| `max_concurrency` | **40** |
| `max_request_per_minute` | **100** |
| `max_token_per_minute` | **3.000.000** |
| `max_token_quota` | 124.378.100 |
| Guthaben | **24,88 $** (19,94 bar + 4,94 Gutschein) |

Das entspricht **Tier 2** der Herstellertabelle, nicht Tier 0. Parallele
Aufrufe sind also erlaubt — die Tier-0-Zeile („Concurrency 1, RPM 3") gilt
für dieses Konto NICHT.

## 2. Die vier Modelle — aus der API, nicht aus der Doku

    kimi-k3                    Kontext 1.048.576 | reasoning low/high/max (Standard max)
                               | Bild+Video ein | dynamische Werkzeuge | denkt IMMER
    kimi-k2.7-code             Kontext   262.144
    kimi-k2.7-code-highspeed   Kontext   262.144
    kimi-k2.6                  Kontext   262.144

**Die 1M-Kontextangabe ist damit von der API selbst bestätigt**, nicht nur
behauptet. `kimi-k3` ist das einzige mit 1M.

## 3. Was die Schnittstelle WIRKLICH tut

**`/v1/responses` UND `/v1/chat/completions` antworten beide mit HTTP 200.**
Der Responses-Weg ist der für uns wichtige — `tools/gegenleser-repo.js` müsste
also fast nichts ändern.

**Die wichtigste Warnung, und sie unterscheidet Kimi von OpenAI:**

> **Ein frei erfundenes Feld (`quatschfeld_xyz`) wird mit HTTP 200
> ANGENOMMEN.** Bei OpenAI gibt es dafür „Unknown parameter". **Auf diesem
> Endpunkt sagt „wird angenommen" also NICHTS über Wirkung.** Jeder Schalter
> ist an seiner WIRKUNG zu messen.

Ein Gegenbeispiel zeigt, dass es nicht pauschal alles schluckt: **`truncation`
wird ABGELEHNT** (HTTP 400, „truncation is not supported"). Bekannte, aber
nicht unterstützte Felder scheitern also laut — nur unbekannte fallen durch.

**`reasoning: {"effort": …}` WIRKT** — an einer Aufgabe gemessen, die ohne
Denken nicht lösbar ist (die `isNaN`/`parseInt`/int4-Frage aus #461):

| effort | Denk-Token | Dauer |
|---|---|---|
| `low` | 312 | 21,5 s |
| `high` | 598 | 29,0 s |
| `max` | **5781** | **157,0 s** |

Monoton, und der Sprung auf `max` ist zehnfach. **Wäre der Schalter ignoriert
worden, wären alle drei auf dem Standardwert `max` gelandet** — sie sind es
nicht, der Schalter wird also gelesen.

**Inhaltlich war die Antwort auf allen drei Stufen richtig — und schärfer, als
ich erwartet hatte.** Sie erkannte den Kern: `isNaN("0x10")` ist falsch, weil
`Number("0x10") = 16`, ABER `parseInt("0x10", 10) = 0`, weil Radix 10 am `x`
stoppt. Ebenso `"1e3"` → `Number` 1000 besteht die Prüfung, `parseInt` liefert
1. Als Abhilfe nannte sie von sich aus `^\d+$` plus Bereichsprüfung — genau
das, was wir in #461 gebaut haben. **`max` lieferte dieselben Antworten ohne
Begründung, bei zehnfachem Denkaufwand und 5,4-facher Dauer.** Für diese
Aufgabe war `high` also strikt das bessere Geschäft.

**Der Egress-Proxy schneidet auch hier bei 301 s ab** (curl-Exit 56, gemessen).
Dieselbe harte Grenze wie gegen `api.openai.com`; DeepSeek mit 518 s bleibt die
Ausnahme. **`stream: true` ist damit Pflicht**, nicht Kür — es funktioniert und
lief im A/B-Lauf über fünf Minuten ohne Abbruch durch.

**Automatischer Präfix-Cache** (Herstellerangabe, von uns nicht nachgemessen):
greift ab 256 Prompt-Token, TTL-Stufen 5 min und 1 h, wird gesondert berechnet.
Die Einschränkung aus Abschnitt 3 des Hauptteils bleibt damit stehen —
„zustandslos" ist es nicht.

## 4. Der A/B-Lauf

Läuft. **Wortgleich**: dasselbe `instructions`, dasselbe `input` wie der
DeepSeek-Lauf zur selben Planprüfung; maschinell verglichen, **einziges
abweichendes Feld ist `model`**. Zwei erzwungene Abweichungen sind zu nennen:
`truncation` musste raus (nicht unterstützt) und `stream` dazu (Proxy-Grenze).
Beide betreffen den Transport, nicht die Aufgabe.

Die Messlatte steht fest, bevor das Ergebnis da ist: **die andere Spur (sol)
fand an demselben Papier elf Befunde, darunter einen echten neuen
Verklemmungskreis (B3); DeepSeek fand zwei, beide eine Teilmenge davon.**
