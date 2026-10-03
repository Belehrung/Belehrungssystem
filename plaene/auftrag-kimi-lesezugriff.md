# Auftrag: Kimi mit Repo-Lesezugriff im Gegenleser (`tools/gegenleser-repo.js --modell=kimi-k3`)

Fassung 1, 03.10.2026. Betreiber hat zugestimmt („Ja“, 03.10.2026): Kimi bekommt denselben lesenden Repo-Zugriff wie die
DeepSeek-Spur. Heute läuft Kimi nur als Einzelaufruf mit Bündel (`scratchpad/kimi-pruefen.js`, nicht im Repo) und sieht
nur, was im Bündel liegt.

Ein falscher Befund vom 03.10.2026 kam genau daher: K7 kannte die Trennung der Studios nach Subdomain nicht. Dazu kommt:
Kimi liefert keine `usage`, die Kosten sind deshalb unbekannt.

**Einordnung: nicht „sehr komplex“, Standard-Executer.**
- Es kommt ein weiterer Anbieter-Weg in ein bestehendes Werkzeug, mit derselben Erlaubnisliste und demselben Riegel.
- Gebaut wird auf dem Stand des Bauspur-Zweigs (`bauspur-qwen` nach Nacharbeit 1), weil dort `tools/spur-gemeinsam.js` die
  Lesewerkzeuge und die streamende Anfrage hält.

## Zuerst messen (am echten Endpunkt, Schlüssel aus `/tmp/claude-0/.kimi-key`, nie in der Kommandozeile)

1. Geht `https://api.moonshot.ai/v1/responses` mit Werkzeugen in der flachen Form des Gegenlesers (`tools: [{type:'function',
   name, parameters}]`)?
   - Trägt eine zweite Runde mit `function_call_output`?
   - Wenn nicht: `/v1/chat/completions` mit `tools`/`tool`-Nachrichten. Dann ist zu belegen, dass die Argumente in Stücken
     kommen und je `index` zusammengesetzt werden müssen (Stolperstelle in `plaene/ENTSCHIEDEN.md`).
2. Liefert der Endpunkt `usage` (Token rein/raus)? Wenn nicht, misst das Werkzeug die Kosten über den Kontostand.
   - `GET /v1/users/me/balance` vor dem ersten und nach dem letzten Aufruf. Die Differenz kommt als Kosten in die
     ASTRA-Zeile.
   - Bei parallelen Läufen ist die Differenz unscharf. Das steht als benannte Grenze in der Zeile.
3. `store`: Kimi nimmt erfundene Felder mit HTTP 200 an. Die Wirkung von `store:false` ist deshalb nur über einen Abruf der
   Antwort zu messen (Muster der Bauspur, B5). Ist sie nicht messbar, steht das als benannte Grenze im Kopf.
4. `reasoning: {effort}` wirkt laut 18.4. Die Vorgabe für Kimi ist `high` (`max` lieferte dieselbe Antwort bei zehnfachem
   Aufwand); `--effort` darf es überschreiben.
5. `stream: true` ist Pflicht (Proxy-Grenze 301 s). Zu belegen ist, dass der vorhandene SSE-Pfad (`sseAnfrage`) die
   Abschluss-Ereignisse von Moonshot erkennt.
6. Preis von `kimi-k3` je Million Token laut Preisseite von Moonshot, mit Quelle und Datum. Lässt er sich nicht belegen:
   kein Eintrag in der PREISTABELLE; die Kosten kommen dann nur aus dem Kontostand.

## Bau

- `--modell=kimi-k3` wählt den Moonshot-Weg. Andere Kimi-Modelle nur aus einer festen Liste (die in 18.4 gemessenen).
- Schlüssel aus `KIMI_KEY_DATEI` (Vorgabe `/tmp/claude-0/.kimi-key`). Vor dem Lesen gelten dieselben Prüfungen wie in der
  Bauspur: reguläre Datei, Rechte 600 oder 400, Eigentümer root.
- Dieselben Lesewerkzeuge, dieselbe Erlaubnisliste über `git ls-files`, derselbe Geheimnis-Riegel auf jedem Ergebnis,
  derselbe Rundendeckel wie bei DeepSeek. KEINE ausführende Spur für Kimi: `--ausfuehren` bleibt bei `deepseek-flash`
  (Betreiber-Vorgabe 26./27.09.2026).
- Die ASTRA-Zeile wird automatisch angelegt wie bei den anderen Modellen, mit Kosten aus `usage` oder dem Kontostand.
- Kopf von `tools/gegenleser-repo.js` und CLAUDE.md 18.4 (`plaene/pruefmodelle-schnittstellen.md`): die Messungen
  wörtlich nachtragen.

## Tests

- Selbsttest des Gegenlesers mit einer Attrappe für den Kimi-Weg, wie bei DeepSeek:
  - Werkzeugrunde;
  - zweite Runde;
  - fehlende `usage` mit Kontostand (Attrappe);
  - Abbruch ohne Abschluss-Ereignis;
  - Status-Abbruch;
  - Riegel auf einem Leseergebnis;
  - Schlüssel nie in Protokoll und Ausgabe.
- Je neue Regel eine Gegenprobe, nach dem bisherigen Verfahren.
- Die Sollzahl des Selbsttests wächst als Literal.
- Bestehende Selbsttests bleiben grün: gegenleser, ausführende Spur, Bauspur, zweitmeinung, hooks.
- Ein echter Probelauf: eine kleine Planprüfung (z. B. dieses Auftragspapier) mit `--modell=kimi-k3 --wurzel=<dieses Repo>`.
  Belegt werden die Werkzeugaufrufe, die Kosten und die ASTRA-Zeile.

## Planprüfung (03.10.2026): Pflichtergänzungen

Spur A (flash, Mechanik) und Spur B (Kimi, Anbieter und Sicherheit); flash hat beide auf eine Befundtabelle verdichtet.
Nachgemessen sind A1 (`gegenleser-repo.js:594` sendet `truncation:'disabled'` immer; Moonshot antwortet darauf mit HTTP 400,
Eignungspapier :175) und A2 (`EFFORT_OPENAI` ist `xhigh`, einen Schalter `--effort` gibt es nicht). Die übrigen Punkte sind als
Planlücken übernommen.

- **A1 (blockierend):** Für Kimi geht KEIN `truncation` mit. Felder werden je Anbieter gesetzt; dazu eine Attrappe, die den
  gesendeten Körper je Modell prüft (Vorbild GP4).
- **A2/B2:** Die Vorgabe für Kimi ist `effort: high`. Überschreiben geht über `GEGENLESER_EFFORT`; es gibt keinen neuen
  Schalter `--effort`, und der Auftrag sagt das jetzt so.
  - Die Wirkung im Werkzeugweg ist zu messen: zwei echte Aufrufe mit `tools`, einmal `low`, einmal `high`, die Denk-Token
    werden verglichen.
  - Die Attrappe prüft `reasoning.effort === 'high'` im gesendeten Körper. Die Mutante mit falsch verschachteltem Feld wird
    ROT.
- **A3/A4:**
  - Nur `kimi-k3` ist am Werkzeugweg gemessen und deshalb das einzige erlaubte Kimi-Modell. Jedes andere `kimi-*` führt zum
    Abbruch mit eigener Meldung, nie zu einem stillen Wechsel auf einen anderen Endpunkt.
  - Endpunkt, Schlüsselname und Effort hängen an EINER Anbieterwahl.
  - Test, dass es keinen stillen Rückfall gibt: Mit nur `OPENAI_API_KEY` liefert `kimi-k3` `null`, mit nur dem Kimi-Schlüssel
    liefert `gpt-6.1-sol` `null`.
- **A5/B7, A6/B3/B6, Kosten:**
  - Fehlt `usage`, steht in der ASTRA-Zeile „Kosten unbekannt“ bzw. die Kontostand-Differenz mit Herkunft, nie `0,00 $` und
    nie `0` in den Token-Spalten.
  - Der Kontostand wird vor dem ersten Aufruf und im `finally` gelesen. Scheitert eine Abfrage, steht „Kosten unbekannt
    (Grund)“.
  - Eine negative oder steigende Differenz gilt als „unscharf (Gutschrift oder Parallelbetrieb)“ und wird nicht als Zahl
    eingetragen.
  - Tests: Attrappe mit zwei Kontoständen (gleich, fallend, steigend) und einer gescheiterten Abfrage.
- **A7:** Die Prüfung der Schlüsseldatei kommt aus dem gemeinsamen Modul. Liegt sie heute in `bau-spur.js`, zieht der Bau
  sie dorthin um, ohne zweite Kopie. Der Selbsttest ohne root nimmt die erwartete UID als Parameter.
- **A8:** Ob `/v1/responses` eine `usage` liefert, ist Messschritt 2; die Antwort wird wörtlich festgehalten.
- **A9:** Der Probelauf braucht `--brief`; Beispielaufruf mit `--brief=<datei>`.
- **B1:** Der echte Probelauf ist KEIN Teil eines Selbsttests oder der Suite (Deploy-Gate). Der Selbsttest benutzt nur
  Attrappen, kein Netz. Ein `grep` nach `api.moonshot.ai` und `KIMI_KEY` im Selbsttest belegt, dass es dort keinen echten
  Aufruf gibt.
- **B4:** `sseAnfrage` kennt nur die Abschluss-Ereignisse von `/v1/responses`. Trägt `/v1/responses` nicht, braucht der
  Fallback auf chat/completions einen eigenen Leser (`chat.completion.chunk`, `data: [DONE]`, Werkzeugargumente in Stücken je
  `index`), mit eigener Attrappe.
- **B5:** Die Datengrenze bleibt bei „Dateien aus `git ls-files`“. Der Bericht listet, welche Testdaten-Dateien (seed,
  fixture, csv, sql) darunter fallen, und ob echte Personendaten darin stehen. Fixturen mit erfundenen Daten sind erlaubt.
- **A10/B8:** Die Grenze des Präfix-Caches und die Frage einer Signatur oder Nonce kommen als benannte Grenze in den Kopf
  (Nonce messen, wenn billig).

-- Ende des Auftrags --
