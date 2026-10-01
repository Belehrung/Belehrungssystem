# OpenAI „Dots“ – Prüfung vom 01.10.2026

Anlass war die Frage des Betreibers, ob es bei GPT einen neuen Agenten „Dot“ gibt und ob er uns etwas bringt.

## Gemessen

- **Modellliste:** `GET /v1/models` liefert 133 Modelle. Keines heißt „dot“. Positivkontrolle: `gpt-6-astra` wird gefunden. Neu seit dem 23.09. ist nur `gpt-6.1-sol`.
- **Recherche:** gelaufen über `gpt-6.1-sol` mit Websuche, `store:false`, 48k Token rein, 2,7k raus. Die tragenden Aussagen habe ich selbst an den Quellen nachgelesen:
  - **learn.chatgpt.com/docs/dots:** „an always-on agent … Powered by GPT-6 Astra … has its own computer and browser … can keep working even when your computer is off“.
  - **Verfügbarkeit:** „Pro 100, Pro 200, and Pro 500: For users over 18 outside the European Economic Area, United Kingdom, and Switzerland“. „Business Premium“ und „Enterprise“: „Rolling out worldwide“.
  - **learn.chatgpt.com/docs/dots/computers-and-apps:** Ein Dot hat einen eigenen Cloud-Rechner. Ein lokaler Rechner lässt sich zusätzlich verbinden.
  - **developers.openai.com, Agents API:** Die Agents API (`POST /v1/agents/sessions`, `OpenAI-Beta: agents=v1`) ist ein eigenes Produkt. Sie „does not support Zero Data Retention (ZDR)“, auch nicht mit selbst gehosteter Sandbox.
- **Nicht nachlesbar** waren die Seiten auf help.openai.com (HTTP 403, JavaScript-Prüfung). Ungeprüft bleiben deshalb die Aussagen zu Aufbewahrung und Löschung eines Dots sowie zum Rollout-Datum 29.09.2026.

## Bewertung für uns

- **Ein Dot ist ein ChatGPT-Produkt, keine API.** Einen Dot-Endpunkt oder Modellnamen hat die Recherche nicht gefunden, die Modellliste auch nicht. In unsere Prüfspuren (`tools/gegenleser-repo.js`, `store:false`) lässt er sich nicht einbauen.
- **Er widerspräche unserer Rollentrennung.** Ein Dot hat einen eigenen Rechner, Browser, GitHub-Zugriff und ein Gedächtnis über Sitzungen hinweg. Er kann also bauen und PRs vorbereiten. Prüfer bekommen bei uns aber keine Ausführung und keinen Schreibzugriff (Ausnahme: DeepSeek „Variante 1“ mit festen Werkzeugen). Außerdem bliebe unser Quelltext auf fremden Servern liegen; Kontext bleibt erhalten, solange der Dot besteht. Das widerspricht der Datengrenze.
- **Die Agents API scheidet aus demselben Grund aus:** Sie bietet kein ZDR.
- **Pro ist im EWR nicht verfügbar,** also auch nicht in Österreich. Zugang gäbe es nur über Business Premium oder Enterprise.
- **Der Kern (GPT-6 Astra) ist schon unser Gegenleser über die API.** Neu ist das Gehäuse (Dauerläufer, eigener Rechner), nicht das Modell.

**Empfehlung:** nicht einsetzen. Einen Nutzen gäbe es nur für Aufgaben außerhalb des Repos, etwa Recherche oder Dokumente im ChatGPT-Konto des Betreibers. Für Bau und Prüfung von GymDocu bringt er nichts, was wir nicht schon haben, und er brächte zwei Regelverstöße mit.
