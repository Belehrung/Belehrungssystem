# Planprüfung P3 — Formularfelder mit falschem Typ

Papier `plaene/auftrag-p3-eingabetypen.md` Fassung 1. **Tauschrunde der Routing-Messung:** beide Lesespuren bekamen
DASSELBE Bündel (Papier, grep-Liste, `server.js` Ausschnitte, `core/error-tracker.js`, `routes/tablet-sperre.js`
500-640, `routes/qr-scan.js` 620-660, `test_feature_bodyparser_und_sequenz.js`), dieselbe Frage, `effort: high`.
D = DeepSeek (409 s), K = Kimi (710 s). Selbst nachgemessen gegen `221a7b2`.

| Nr. | Befund | Spur | Nachgemessen | Folge |
|---|---|---|---|---|
| PP3-1 | Von den 68 grep-Stellen sind 38 in `String(…)` gehüllt und werfen NICHT; `textFeld` dort würde legitime Formen brechen (`lageplan.js:451` `ids[]=…`, Zahlen aus JSON) | D (D2, D5), K (K6) | `grep` → 38 mit `String(`, 30 ohne, davon 1 Kommentar (`module.js:3258`) → **29 echte Stellen** | nur die 29; `String(…)`-Stellen bleiben |
| PP3-2 | Wächter: `textFeld(String(req.body.x))` wäre grün, obwohl `String` vorher umwandelt | D | Logik eindeutig | `textFeld` nur mit dem Rohwert als Argument, sonst Verstoss |
| PP3-3 | Das Vorbild-Testmuster baut einen EIGENEN Mini-Fehlerbehandler — Gegenprobe (b) am echten Handler bliebe grün | K | gelesen `test_feature_bodyparser_und_sequenz.js:116-118` | Fehlerbehandler in ein eigenes Modul, `server.js` und Tests benutzen dasselbe |
| PP3-4 | `expose && 4xx` trennt nicht „Eingabefehler“ von anderen 4xx (`request.aborted`, `createError` aus Integrationen) | K, D (D4) | eigener Code setzt `expose` nirgends (`grep`); CSRF antwortet direkt mit 403 (`core/csrf-schutz.js:43-45`), D4-Prämisse fällt, die Folgerung trägt | Positivliste: `EingabeFehler` + benannte Body-Parser-Typen |
| PP3-5 | Wächter und Behebung teilen dieselbe blinde Menge (`.test(arr)`, `parseInt`, Vorlagen-Literale, Hilfsfunktionen) | K | Logik eindeutig | Grenzen im Wächter-Kopf benennen; einmalige unabhängige Querprüfung im Bericht; Rest auf die Sammelliste |
| PP3-6 | Mengen-Zusicherung gegen `git ls-files`: leeres/fehlschlagendes `git` muss rot werden; Filter unabhängig vom Scanner | K | (i) Server ist ein git-Checkout (Deploy per `git pull`) — Teil fällt; (ii) trägt | Exit ≠ 0 oder leer → FAIL; Filter eigenständig im Test |
| PP3-7 | Verhaltenstest mit Mini-App bindet `tablet-sperre.js` nicht ein — „Verhaltenstest rot“ in Gegenprobe (a) unerreichbar | K | gelesen `:115` (Dummy-Handler) | echter Router über `test/helfer/route-harness.js` |
| PP3-8 | `status || statusCode` | D | Logik | übernommen |
| PP3-9 | 1(c) ohne Sollwert | D | Papier | Liste immer vollständig melden |
| PP3-10 | `EingabeFehler` ohne `type`, Warnzeile loggt `undefined` | K | Papier | `type: 'eingabe.feldtyp'` |
| PP3-11 | `headersSent` vor dem neuen Zweig prüfen | K | gelesen `server.js:1488-1489` | übernommen |
| PP3-12 | Warnzeile ungebündelt, anders als `[id-wache]` | K | gelesen `core/error-tracker.js:38-43` | dasselbe Bündelungsmuster |
| PP3-13 | `server.js:626` Studio-Suche ohne `studio_id` | D | **gefallen**: die Tabelle `studios` IST der Mandant, die Suche nach Subdomain ist die Mandantenauflösung | — |
| PP3-14 | `parameters.too.many` landet im 413-Zweig mit „25 MB“ | K (Randnotiz) | nicht gemessen | Sammelliste |

D: 6 Befunde, 5 getragen, 1 gefallen. K: 8 Befunde, alle getragen (PP3-6 teilweise). Überschneidung: PP3-1, PP3-4.
