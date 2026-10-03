# Schnittstellen der Prüfmodelle (Nachschlageteil zu CLAUDE.md, Abschnitt 18)

Am 03.10.2026 wörtlich aus `CLAUDE.md` hierher verschoben (Betreiber: „Wenn es noch sparsamer geht dann gerne“). Die
Nummern 18.1–18.5 bleiben, damit Verweise „18.x“ in `CLAUDE.md` weiter treffen. Was bei JEDEM Aufruf gilt, steht als Kurzfassung
in `CLAUDE.md`, Abschnitt 18.

## 18. Schnittstellen der Prüfmodelle

Alles hier ist am echten Endpunkt gemessen, soweit nicht als BEHAUPTET oder NICHT gemessen geführt (Auslöser: die
Betreiber-Fragen „nutzen wir Astra schon optimal?" am 12.09. und „was kann diese API noch?" am 18.09.2026). **Angenommen
heisst nicht wirksam.** OpenAI lehnt einen frei erfundenen Parameter mit „Unknown parameter" ab — ein „OK" sagt dort also
wirklich etwas (`truncation` und `prompt_cache_key` werden angenommen, ihre Wirkung ist NICHT gemessen). Kimi und DeepSeek
nehmen ein erfundenes Feld mit HTTP 200 AN: dort sagt „wird angenommen" NICHTS über Wirkung, jeder Schalter ist an seiner
WIRKUNG zu messen (18.3, 18.4).

### 18.1 OpenAI: Aufrufmuster und Zielkonfiguration

Schlüssel NIE in die Kommandozeile (Prozessliste, s. #99), sondern über eine curl-Konfigdatei, die danach gelöscht wird
(Kimi ebenso: `/tmp/claude-0/.kimi-key`):

    cfg=/tmp/claude-0/.curlcfg-oai; umask 077
    printf 'header = "Authorization: Bearer %s"\n' "$(tr -d '\r\n' < /tmp/claude-0/.oai-key)" > "$cfg"
    curl -sS -K "$cfg" -H "Content-Type: application/json" -d @anfrage.json \
         https://api.openai.com/v1/responses -o antwort.json
    rm -f "$cfg"

Endpunkt `/v1/responses`, Feld `input` (nicht `messages`), dazu `max_output_tokens`. Der Betreiber hat am 10.09.2026
ausdrücklich auf eine Rotation des Schlüssels VERZICHTET, obwohl er im Sitzungsprotokoll steht; Missbrauch zeigte sich an
der OpenAI-Abrechnung.

**ZIELKONFIGURATION einer Gegenlesung (Betreiber-Vorgabe 12.09.2026 „nutze Astra optimaler"; am Stück gemessen):**

    "stream": true,          // Egress-Proxy bricht lange Läufe sonst ab
    "store": false,          // unser Quelltext bleibt nicht auf fremden Servern
    "instructions": "…",     // die Unverhandelbaren, getrennt vom Material
    "reasoning": {"effort":"xhigh"},  // NICHT high — das ist die Mitte (18.09.)
    "max_tool_calls": N,     // nur mit web_search; deckelt die Suchschleife
    "metadata": {…},         // Lauf wiederfindbar machen
    "max_output_tokens": 45000,
    "truncation": "disabled",  // laut scheitern statt still kuerzen (18.09.)
    "text": {"format": {"type":"json_schema","strict":true, …}}

Dazu die **Wiederholschleife** (ein Fehlschlag ist keine Antwort), die **Statusprüfung bei JEDEM Aufruf** und davor die
**Bündelzählung** über `POST /v1/responses/input_tokens`. **Umsetzungsstand `tools/gegenleser-repo.js`:** am 19.09.2026
gesetzt waren `store: false`, `reasoning.effort` und `truncation: 'disabled'` (Commit `738558a`); es fehlten `stream: true`
(am dringendsten: Zeitlimit des Werkzeugs 20 Minuten, `timeout: 20 * 60 * 1000`, die Proxy-Grenze liegt bei 300 s, 18.2),
`metadata` und `max_tool_calls`. **Stand 02.10.2026, im Werkzeug nachgesehen (`anfragen()`):** `stream: true` und `metadata`
sind gesetzt; `max_tool_calls` wird BEWUSST nicht gesetzt (der Kommentar dort: die CLAUDE.md nennt es nur für `web_search`,
das Werkzeug bremst über `--max-runden`, und eine ungemessene Obergrenze würde einen stillen Abbruch einführen, der wie ein
Ergebnis aussieht).

### 18.2 OpenAI: gemessene Eigenheiten

- **`status` GEHÖRT IN JEDEN AUFRUF GEPRÜFT.** Eine Antwort mit NULL Zeichen war nicht „nichts gefunden", sondern
  `status: "incomplete"` mit `incomplete_details.reason = "max_output_tokens"` (die Token gingen ins Nachdenken und in
  Suchaufrufe). Wer nur den Text ausliest, meldet „keine Befunde" und meint „niemand hat geprüft". Bei Websuche muss
  `max_output_tokens` deutlich höher (30.000 statt 8.000 reichte).
- **Der Egress-Proxy bricht lange Läufe ab** (curl Exit 56): gegen `api.openai.com` bei **300,3 s**, gegen `api.moonshot.ai`
  bei 301 s — eine harte Grenze, kein Flattern; die Wiederholschleife hilft dagegen NICHT. Ausweg **`"stream": true`**: die
  SSE-Zeilen (`data: {…}`) parsen und das Abschluss-Ereignis `response.completed` / `.incomplete` / `.failed` nehmen, in dem
  das vollständige Antwortobjekt samt `usage` steckt. Nicht pauschal: gegen `api.deepseek.com` lief ein Aufruf OHNE
  Streaming 518 s durch — die Grenze hängt an der Gegenstelle; wer sie für einen neuen Endpunkt behauptet, misst sie.
- **BILDEINGABE geht** (14.09.2026, Positivkontrolle mit dem erfundenen Wort `KWIRZELPFAND-7742`):
  `{"type":"input_image","image_url":"data:image/png;base64,…"}` neben `{"type":"input_text",…}` im `content`; `input` muss
  dafür die Listenform `[{"role":"user","content":[…]}]` haben, keine Zeichenkette.
- **`tools: [{"type":"web_search"}]` existiert UND WIRKT** (`web_search_call`-Einträge, Quellen, tagesaktueller Stand):
  bekannte Schwachstellen zu den Versionen in `package.json` nachschlagen; Abschnitt 7.11 bleibt unberührt.
- **`text.format` mit `json_schema` und `strict: true` ERZWINGT die Ausgabeform**
  (Schweregrad/Datei/Zeile/Problem/Vorschlag). Außerdem angenommen: `store: false` (nicht aufbewahrt), `max_tool_calls`,
  `metadata`, `instructions`, `reasoning.summary`, `background: true`; `service_tier: "flex"` wurde mit HTTP 429
  beantwortet, nicht abgelehnt.
- **`store: false` und `previous_response_id` SCHLIESSEN EINANDER AUS** („Previous response with id '…' not found.").
  **ENTSCHEIDUNG: `store: false` gewinnt** — das Material erneut mitzuschicken kostet Geld, die Aufbewahrung kostet die
  Datengrenze (bei 200k Token gegen rund 400k Limit ist Platz). `include: ["reasoning.encrypted_content"]` wird ANGENOMMEN,
  liefert bei uns aber NICHTS; die Entscheidung „`store: false` gewinnt, Material geht erneut mit" bleibt.
- **`POST /v1/responses/input_tokens`** antwortet (`{"object":"response.input_tokens","input_tokens":14}`).
  **`truncation: "disabled"`** wird angenommen (soll einen zu grossen Aufruf SCHEITERN lassen; dass es hart scheitert, ist
  NICHT gemessen). `context_management` nimmt `[{"type":"compaction","compact_threshold":N}]`; `prompt_cache_key` wird
  akzeptiert (Rabatt NICHT nachgemessen). `GET /v1/organization/costs` existiert, unser Schlüssel darf nicht darauf (HTTP
  401, `Missing scopes: api.usage.read`) — eine Betreiber-Entscheidung; bis dahin sind die Kosten in `ASTRA-LAEUFE.md` die
  geschätzten aus dem Werkzeug.
- **`reasoning.effort` ist je Modell eine Teilmenge** von `none, minimal, low, medium, high, xhigh, max` (so listet es die
  Fehlermeldung bei einem erfundenen Wert, generisch — wer daraus auf Verfügbarkeit schließt, liegt falsch; Tabelle 18.5).
  Es WIRKT: bei `gpt-6-astra` steigen Denk-Token und Dauer monoton (`medium` 152 / 5,5 s bis `max` 748 / 15,1 s;
  `effort: "ultrahoch"` → `invalid_value`). **`high` war die MITTE, nicht das Maximum:** für Prüfläufe gilt `xhigh`, bei
  besonders folgenschweren `max` (Betreiber 18.09.2026: „das Maximum an Unterstützung"). Was das kostet, ist NICHT gemessen
  (letzter voller Lauf mit `high`: 12,67 $); wer die erste Runde mit `max` fährt, trägt die Kosten in `ASTRA-LAEUFE.md` ein.
- **BEHAUPTET, von uns NICHT gemessen** (wer eines benutzt, misst es zuerst): `file_search`, `code_interpreter`, `shell`,
  `apply_patch`, `mcp`, `input_file`/`file_id`, `prompt_cache_options` mit `ttl`, `POST /v1/batches` (50 % billiger, bis 24
  h), `tool_choice` mit Grammatik-Ausgabe, `expires_after`, Container mit `network_policy`. Ausführung, Schreibzugriff und
  fremde Ablage scheiden nach 7.8 ohnehin aus.
- **„Context Notes":** Der Betreiber nannte am 10.09.2026 ein Feature „Context Notes", das Notizen über das ganze
  Kontextfenster hält statt stur zusammenzufassen, und empfahl, Astra zusätzlich Datenbankschema und API-Dokumentation als
  dauerhaften Kontext mitzugeben. Der Schalter existiert unter diesem Namen NICHT (`context_notes` → „Unknown parameter");
  `context_management` gibt es (Struktur oben). Für einen Einzelaufruf mit Bündel nebensächlich; gratis gilt die andere
  Hälfte des Tipps: Schema und Schnittstellenbeschreibung gehören ins Bündel (7.6).

### 18.3 DeepSeek

- **Modell: nur `deepseek-flash`** (Betreiber-Vorgabe 27.09.2026, 7.1). **Pro ist NICHT Flash und wird nicht auf Flash
  umgeleitet** (gemessen 23.09.2026): eigener `system_fingerprint`, andere Token-Zählung, und die Bildprobe trennt sie —
  `deepseek-flash` erkennt ein rotes Pixel („Rot"), `deepseek-v4-pro` liefert leer. Umgeleitet werden laut Doku nur die
  ALTnamen `deepseek-v4-flash*` auf V4.1-Flash. Wer das behauptet oder bezweifelt: dieselbe Bildprobe, nicht der Name im
  Antwortfeld.
- **Denkstufe — das Feld hängt am ENDPUNKT** (gemessen 23.09.2026, damals mit `deepseek-v4-pro`, je mit ungültigem Wert als
  Gegenprobe): auf `/v1/chat/completions` wirkt nur `reasoning_effort` (oberste Ebene; `reasoning: {effort:"quatsch"}` →
  HTTP 200, still ignoriert); auf `/v1/responses`, den `tools/gegenleser-repo.js` benutzt, wirkt nur `reasoning: {effort}`
  (`"quatsch"` → HTTP 422; `low` 232 / `max` 10865 Denk-Token an derselben Aufgabe). Ein erfundenes Feld nehmen BEIDE
  Endpunkte mit HTTP 200 an; frühere Bündelläufe über `/v1/chat/completions` mit `reasoning.effort` liefen auf `high`.
- **`max` ohne Werkzeuge kann sich tot denken** (23.09.2026): Einzelaufruf mit Bündel (97 KB), `reasoning_effort: max`,
  `max_tokens` 200.000 → 200.000 Denk-Token, 0 Zeichen Antwort, 31 Minuten; über `tools/gegenleser-repo.js` (viele kurze
  Runden mit Lesewerkzeugen) lieferte `max` dreimal vollständige Berichte. Für Einzelaufrufe mit Bündel deshalb `high`;
  `max` nur mit Werkzeugweg. Zwei Runden Werkzeugaufruf MIT Denken tragen (23.09.2026); `tools/gegenleser-repo.js` hat dafür
  seit 23.09.2026 einen DeepSeek-Weg mit denselben Lesewerkzeugen und Riegeln.

### 18.4 Kimi K3 (Schlüssel seit 19.09.2026; Einzelheiten `plaene/kimi-k3-eignung-19-09-2026.md`)

- **Endpunkt ist `api.moonshot.ai`, NICHT `.cn`** (dort HTTP 401, eigener Kontoraum); `/v1/responses` und
  `/v1/chat/completions` antworten beide. **Konto ist Tier 2** (`GET /v1/users/me`): `max_concurrency 40`, RPM 100, TPM 3
  Mio.; Parallelaufrufe sind erlaubt, die Tier-0-Zeile der Herstellertabelle („Concurrency 1, RPM 3") gilt für uns NICHT.
  Guthaben: `/v1/users/me/balance`. **`kimi-k3`: Kontext 1.048.576** (von der API bestätigt); die anderen drei
  (`kimi-k2.7-code`, `-highspeed`, `kimi-k2.6`) haben 262.144.
- **WICHTIGSTER UNTERSCHIED ZU OPENAI: ein erfundenes Feld (`quatschfeld_xyz`) wird mit HTTP 200 ANGENOMMEN.** Hier sagt
  „wird angenommen" NICHTS über Wirkung — jeder Schalter ist an seiner WIRKUNG zu messen. Bekannt-aber-nicht-unterstützt
  scheitert (`truncation` wird mit „not supported" ABGELEHNT), unbekannt rutscht durch.
- **`reasoning: {"effort": …}` wirkt** (Aufgabe, die ohne Denken nicht lösbar ist): `low` 312 Denk-Token / 21,5 s, `high`
  598 / 29,0 s, `max` 5781 / 157,0 s. Alle drei Antworten waren richtig; `max` lieferte dieselbe Antwort ohne Begründung bei
  zehnfachem Aufwand — für Sachfragen ist `high` das bessere Geschäft.
- **Der Egress-Proxy schneidet bei 301 s ab** (curl-Exit 56); **`stream: true` ist Pflicht** (lief über fünf Minuten durch).
- **Prüfgüte:** gemessen in A/B-Läufen (19.09.2026 Planprüfung; 20.09.2026 gegen `gpt-5.6-sol` über einen Diff mit
  Lösungsschlüssel: Kimi fand den REGRESS, den sol übersah, einen Verklemmungsweg, den keine andere Spur hatte, und null
  Fehlalarme gegen sols zwei), s. 7.4 und `ASTRA-LAEUFE.md`. Websuche ist laut Hersteller „being updated and not
  recommended".

### 18.5 OpenAI-Modelle und Wofür was

**Eine Liste ist keine Verfügbarkeit:** `GET /v1/models` listet 130 Modelle, `gpt-5-codex` steht darin und antwortet HTTP
404 (09.09.2026); jedes Modell wird mit einem echten Aufruf geprüft (Positivkontrolle `gpt-5.9-quatschmodell` →
`model_not_found`). Erreichbar und brauchbar, mit den gemessenen `effort`-Stufen:

    gpt-6-astra                  low medium high xhigh max (kein none/minimal). Denkt IMMER. Langsamste, gründlichste Stufe.
    gpt-6.1-sol                  low … max (kein none). Erreichbar seit 01.10.2026.
    gpt-6-sol, gpt-6-luna        none … max; seit 23.09.2026 erreichbar. Preise: PREISTABELLE in tools/gegenleser-repo.js
                                 (sol ~1/5 von astra). Werkzeugweg mit zweiter Runde und store:false trägt.
    gpt-5.6-terra/-sol/-luna     none low medium high xhigh max. Alle drei denken.
    gpt-5.5                      none low medium high xhigh (kein max). Denkt von sich aus, auch ohne effort-Angabe.
    gpt-5.4, -mini, -nano        none low medium high xhigh (kein max). Schnell; mit effort "none" ganz ohne Denkphase.
    gpt-5, gpt-5-mini, gpt-5-nano  minimal low medium high (kein xhigh/max). Ältere Generation.

**Wofür was.** Das ist eine Empfehlung aus den Messungen, keine Vorschrift — ausgenommen, was eine Betreiber-Entscheidung
festlegt (7.1, 18.3 und der erste Punkt unten).

- **`gpt-6.1-sol` ersetzt `gpt-6-sol` überall, wo bisher `gpt-6-sol` stand** (Betreiber 01.10.2026: „nutze die neue Version
  6.1"; auch die Vorgabe in `tools/gegenleser-repo.js`). Gemessen am echten Endpunkt: erreichbar (Gegenprobe →
  `model_not_found`), Denk-Token steigen monoton, erfundenes Feld → „Unknown parameter", Werkzeugweg mit zweiter Runde und
  `store:false` trägt, Websuche liefert Quellen. Preis laut Preisseite wie `gpt-6-sol`; es gibt nur die sol-Stufe. **Die
  Prüfgüte ist NICHT gemessen;** die A/B-Messung vom 23.09.2026 (7.1) gilt `gpt-6-sol` und wird nicht auf 6.1 übertragen.
- **Routinearbeit ohne Urteil** (umformulieren, eine Liste sortieren, eine Datei zusammenfassen): `gpt-5.4` mit
  `effort: "none"` — gemessen 44 Ausgabe-Token und 1,7 s gegen 198 Token und 3,1 s bei `high`. **Was NICHT dorthin gehört:**
  jede Aussage über unseren Bestand.
- **Ein Modell einordnen:** mit einer Aufgabe, die ohne Denken nicht lösbar ist (18.09.2026: `gpt-5.6-terra` schien nicht zu
  denken, gemessen an „Hauptstadt von Österreich"; an einer Rechenaufgabe denkt es). Der Vergleich an EINER Frage (was tut
  der globale Fehlerbehandler bei einem `MulterError`?) unterschied terra, sol, luna, `gpt-6-astra` und `gpt-5.4` nicht —
  alle fünf antworteten richtig; er zeigt nur, dass für eine Frage MIT mitgeliefertem Kontext das billigste Modell reicht.
  Die Aufgabe, für die wir den Gegenleser brauchen, ist eine andere: im Repo SUCHEN, über viele Runden, und Zustände finden,
  die niemand beschrieben hat. Wer aus so einem Test auf Prüfeignung schliesst, hat eine zweite Behauptung aufgestellt, die
  er nicht gemessen hat.
- Bis 23.09.2026 `gpt-5.6-sol` (Betreiber-Entscheidung 18.09.2026, wegen der Kosten); ersetzt, s. Archiv, Abschnitt „Welche
  Modelle zur Verfügung stehen — gemessen 18.09.2026".
