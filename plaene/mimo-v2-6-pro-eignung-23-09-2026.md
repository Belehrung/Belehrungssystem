# MiMo-V2.6-Pro — Eignung als günstigerer Prüfer (Recherche 23.09.2026)

Betreiber-Frage: „prüfe online was MiMo-V2.6-Pro kann und ob es als ersatz für ein anderes
teureres modell dienen könnte". Alles hier ist RECHERCHIERT (Herstellerangaben und Dritte),
NICHT an unserem Bestand gemessen — nach CLAUDE.md eine Behauptung, bis ein A/B-Lauf vorliegt.

## Was es ist (laut Quellen)

* Xiaomi, erschienen 21.09.2026; MoE mit 1,02 Bio. Parametern, 42 Mrd. aktiv; 1 Mio. Token
  Kontext; Eingabe Text/Bild/Audio/Video; Gewichte offen (MIT).
* Artificial Analysis Intelligence Index **46** (bestes offenes Modell; Claude Opus 5: 51).
  Herstellerzahlen: DeepSWE v1.1 71,9; Terminal-Bench 2.1 89,9; **Terminal-Bench 4.0 34,9**
  (Opus 5: 49,0); ExploitBench 47,9 (Opus 5: 70,0).
* Preis **0,435 $ ein / 0,87 $ aus** je Mio. Token (Cache-Lesen 0,0036 $). Zum Vergleich unsere
  Preistabelle: `gpt-6-sol` 4,00/15,00 $, `gpt-5.6-sol` 5,00/30,00 $. Faktor ~10 (Eingabe) bis
  ~17 (Ausgabe) billiger als `gpt-6-sol`.
* Schwäche laut Artificial Analysis: **wortreich** (140 Mio. Ausgabe-Token für den Index) — der
  Preisvorteil schrumpft entsprechend.

## Schnittstelle

* `https://api.xiaomimimo.com/v1/chat/completions`, OpenAI-kompatibel — **berichtigt unten
  (Nachtrag offizielle Doku): `/v1/responses` gibt es ebenfalls**; `thinking` ein/aus, `max_completion_tokens` bis 131.072, Streaming,
  `tools`, `tool_choice` nur `auto`, `response_format`. Im Denkmodus sind `temperature`/`top_p`
  fest. Bei Werkzeugaufrufen muss `reasoning_content` in den Folgenachrichten mitgeschickt werden.
* **Offener Fehlerbericht** (GitHub XiaomiMiMo/MiMo #44, 17.05.2026, V2.5): mehrrundige
  Werkzeugaufrufe im OpenAI-Format werden mit HTTP 400 abgelehnt. Für V2.6 unbekannt. Genau
  diesen Weg braucht `tools/gegenleser-repo.js` (Lesewerkzeuge über viele Runden).
* Erreichbarkeit aus dieser Umgebung gemessen: `api.xiaomimimo.com` antwortet (Wurzel 404,
  d. h. Host erreichbar). Kein Schlüssel vorhanden.
* Aufbewahrung/Training mit Anfragedaten: in den gelesenen Seiten NICHT beschrieben.

## Einordnung für uns

* Ersatzkandidat wäre `gpt-6-sol` (teuerste laufende Spur). DeepSeek und Kimi sind schon billig.
* **Nicht belegt:** die Prüfgüte an unserem Material. Ein Index-Wert und ein Einzeltest bei einem
  Blog (23/23 wie Opus 5) sagen darüber nichts — dieselbe Regel wie bei `sol` am 18.09.
* Messplan, falls gewünscht: Schlüssel vom Betreiber; zuerst zwei Funktionsproben (Positiv-
  kontrolle erfundenes Feld; ZWEI Runden Werkzeugaufruf mit `reasoning_content`); dann ein
  wortgleicher A/B gegen `gpt-6-sol` an einem Papier mit bekanntem Befundschlüssel (z. B.
  Planprüfung S6 Fassung 1: 10 getragene Befunde, oder H2 Fassung 2: 9). Kosten des A/B nach
  Preistabelle wenige Cent.

## Nachtrag 23.09.2026 — offizielle Doku gelesen (mimo.mi.com/docs, per curl, serverseitig gerendert)

Vom Betreiber verlinkt. Gelesen: Models, First API Call, Pay-as-you-go, Rate Limit, Model
Hyperparameters, API-Integration-FAQ, Referenz „OpenAI Responses API". Weiterhin Herstellerangaben,
nichts davon an unserem Bestand gemessen.

**Was sich gegenüber oben ändert:**

* **`POST https://api.xiaomimimo.com/v1/responses` existiert** (dazu ein Anthropic-kompatibler
  Endpunkt `/anthropic`). Damit wäre `tools/gegenleser-repo.js` grundsätzlich ohne Umbau auf
  Chat Completions anschliessbar. Ausdrücklich NICHT unterstützt: `background`,
  `previous_response_id`, `context_management`.
* **`store` steht NICHT in der Parameterliste.** Die Doku sagt: nicht dokumentierte Parameter
  „werden herausgefiltert und können Fehler auslösen". Ob `store: false` angenommen wird — und
  vor allem, ob es WIRKT —, ist offen. Die Datenschutzerklärung und die Nutzungsbedingungen sind
  JavaScript-Seiten (gleiche Grösse wie die 404-Seite, 13.012 Bytes) und per curl NICHT lesbar.
  **Aufbewahrung und Training mit unseren Anfragen sind damit weiterhin unbekannt.** Das ist die
  Datengrenze unseres Quelltexts, keine Nebensache.
* **`reasoning.effort` kennt nur aus/an:** `none` schaltet das Denken ab, alle anderen Stufen
  verhalten sich laut Doku „identisch". Eine `xhigh`/`max`-Stufe wie bei `gpt-6-sol` gibt es
  also nicht.
* **Werkzeugaufrufe im Denkmodus sind laut Hersteller instabil:** Die FAQ sagt, dass
  `tool_calls` manchmal im `reasoning_content` statt im eigenen Feld landen („instability and
  incomplete output"), und EMPFIEHLT, das Denken bei Werkzeugaufrufen abzuschalten. Genau diese
  Kombination — Denken plus viele Runden Lesewerkzeuge — braucht unser Gegenleser. Das ist der
  schwerste Punkt gegen einen Ersatz, und er steht beim Hersteller selbst.
* **Inhaltsfilter auf Ein- und Ausgabe**; `content_filter` ist ein möglicher Abbruchgrund. Unser
  Status-Check fängt das (ein gefiltertes Ergebnis ist kein „keine Befunde").
* Empfohlener Systemprompt nennt **Wissensstand Dezember 2024**.
* Bestätigt: Kontext 1 Mio., Ausgabe bis 128K, RPM 100, TPM 10 Mio.; Preis 0,435 $ ein /
  0,87 $ aus je Mio. Token (Batch die Hälfte); Websuche extra (5 $ je 1000 Aufrufe).

**Einordnung danach:** Als Ersatz für `gpt-6-sol` weiterhin NICHT belegt, und die Doku selbst
liefert zwei Gegengründe, die vor jedem A/B zu messen wären: (1) nimmt der Endpunkt `store: false`
an und gibt es irgendeine Zusage zur Nicht-Aufbewahrung; (2) laufen ZWEI und mehr Runden
Werkzeugaufruf MIT Denken sauber durch (Werkzeugaufruf im richtigen Feld, keine Abbrüche). Erst wenn
beides trägt, lohnt der wortgleiche A/B. Voraussetzung bleibt ein Schlüssel vom Betreiber — und
seine Entscheidung, ob unser Quelltext zu einem Anbieter mit unbekannten Aufbewahrungsregeln darf.
