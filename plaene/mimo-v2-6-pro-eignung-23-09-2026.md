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

* `https://api.xiaomimimo.com/v1/chat/completions`, OpenAI-kompatibel (Chat Completions, nicht
  `/v1/responses`); `thinking` ein/aus, `max_completion_tokens` bis 131.072, Streaming,
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
