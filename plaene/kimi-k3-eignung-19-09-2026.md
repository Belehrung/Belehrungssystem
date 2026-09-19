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
