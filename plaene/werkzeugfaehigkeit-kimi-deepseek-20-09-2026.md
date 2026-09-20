# Können Kimi und DeepSeek selbst im Repo nachsehen? — JA, gemessen

**Betreiberfrage 20.09.2026:** „könnte kimi und deepseak auch direkt
nachsehen?"

**Antwort: ja, beide.** Nicht erschlossen, sondern an einer Aufgabe gemessen,
die ohne Werkzeug nicht lösbar ist.

## Der Aufbau — und warum er nicht zu schummeln ist

Ein Kontrollwort (`PFRIEMELDACHS-5027`) steht ausschliesslich in einer Datei,
die das Modell nicht kennen kann. Die Frage lautet: nenne es. Ohne
Werkzeugaufruf ist sie unbeantwortbar; ein geratenes Wort fällt sofort auf.

Gefahren wurde die VOLLE Schleife, nicht nur die erste Runde:
Werkzeugangebot → Werkzeugaufruf des Modells → Ergebnis zurückgeschickt →
Antwort gelesen.

**Das ist wichtig, weil bei Kimi ein frei erfundenes Feld mit HTTP 200
ANGENOMMEN wird** (gemessen 19.09.2026). „Wird akzeptiert" sagt dort also
nichts; nur die Wirkung zählt.

## Das Ergebnis, wörtlich

    [kimi] Runde 1: HTTP 200 finish=tool_calls Werkzeugaufrufe=1
    [kimi]   -> lies_datei({"pfad":"akte.txt"})
    [kimi] Runde 2: HTTP 200 finish=stop
    [kimi] ERGEBNIS: Kontrollwort WOERTLICH zurueck -- Werkzeugschleife TRAEGT.

    [deepseek] Runde 1: HTTP 200 finish=tool_calls Werkzeugaufrufe=1
    [deepseek]   -> lies_datei({"pfad": "akte.txt"})
    [deepseek] Runde 2: HTTP 200 finish=stop
    [deepseek] ERGEBNIS: Kontrollwort WOERTLICH zurueck -- Werkzeugschleife TRAEGT.

Beide: `api.moonshot.ai` bzw. `api.deepseek.com`, `/v1/chat/completions`,
OpenAI-kompatible `tools`-Form, `stream: true`, Schlüssel aus einer Datei und
nie in der Kommandozeile.

## Was das für uns ändert

Der Unterschied zwischen unserer OpenAI-Spur und den beiden anderen war
bisher **kein Güteunterschied, sondern ein Werkzeugunterschied**:
`tools/gegenleser-repo.js` lässt den Prüfer im Repo NACHSEHEN, die anderen
bekamen ein fertiges Bündel. Am 13.09.2026 war genau das der Unterschied
zwischen „findet eine Stelle" und „findet beide" — ein Befund jenes Tages war
NUR über die Suche im Repo erreichbar und stand in keiner Zeile des Diffs.

**Damit ist der Weg frei, denselben Apparat für alle drei Anbieter zu
öffnen.** Was dabei NICHT neu gebaut wird, weil es anbieterunabhängig ist:

* die **Erlaubnisliste** — genau das, was `git ls-files` auflistet,
* der **Geheimnis-Riegel** auf JEDES Funktionsergebnis,
* die **Lesedeckel** und die Liste der abgelehnten Lesungen,
* das **Lauf-Protokoll** in `ASTRA-LAEUFE.md`.

Anbieterabhängig sind nur drei Dinge: Endpunkt, Modellname, Schlüsseldatei.

## Was sich dadurch NICHT ändert

* **Lesen ja, ausführen und schreiben nein.** Die Ablehnung vom 11.09.2026
  steht unverändert: kein `run_tests`, kein `create_review_comment`, kein
  Schreibzugriff. Die Begründung („wer mitbaut, prüft seinen eigenen
  Entwurf") trägt gegen Ausführung und Schreiben, nicht gegen eine begrenzte
  Leseerlaubnis — das ist die Nachschärfung vom 13.09.2026.
* **Jeder Befund bleibt eine Behauptung, bis der Haupt-Agent sie selbst
  gemessen hat.** Ein Prüfer mit Lesewerkzeug ist ein besserer LESER, kein
  MESSER.
* **Die Prüfgüte der beiden ist damit nicht gemessen.** Gemessen ist die
  FÄHIGKEIT. Ob ihre Befunde unserer Nachmessung standhalten, ist eine
  eigene Frage; für Kimi gibt es dazu eine Stichprobe von eins (20.09.2026,
  über einen Diff mit Lösungsschlüssel: null Fehlalarme gegen zwei der
  OpenAI-Spur, und ein Regress, den nur sie fand).

## Bekannte Stolperstellen beim Bau

1. **`stream: true` ist bei beiden Pflicht** — der Egress-Proxy schneidet
   sonst bei rund 300 s ab.
2. **Das Ausgabebudget muss das Nachdenken mittragen.** Gemessen am
   20.09.2026: ein Kimi-Lauf mit `max_tokens: 20000` und `effort: high` kam
   mit HTTP 200 und LEERER Antwort zurück — das gesamte Budget ging ins
   Nachdenken. Ein Werkzeug, das das nicht meldet, liefert eine leere Datei,
   und die liest sich wie „keine Befunde".
3. **Die Argumente eines Werkzeugaufrufs kommen in Stücken** und müssen über
   den Strom hinweg je `index` zusammengesetzt werden.
4. **`$?` hinter einer Pipe** ist der Exit-Code des letzten Glieds. Am
   20.09.2026 meldete mein eigener Aufruf `EXIT=0`, während das Werkzeug mit
   5 abgebrochen war; aufgefallen ist es nur, weil das Werkzeug die leere
   Antwort selbst benannt hat.
