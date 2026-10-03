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

-- Ende des Auftrags --
