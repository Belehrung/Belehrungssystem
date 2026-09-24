# P3 — Formularfelder mit falschem Typ (Pentest-Vorzug V03-6)

Stand GymDocu master `221a7b2`. Einordnung: Standard-Executer. Viele Stellen mit demselben Handgriff; heikel sind nur
die Fehlerbehandlung (welcher Fehler darf den Alarm verlieren?) und der Wächter (er kann falsch grün sein).

## Befund

* `express.urlencoded({ extended: true })` (`server.js:161`) macht aus `pin[]=1` ein Array und aus `pin[x]=1` ein
  Objekt. Die Body-Härtung darunter (`server.js:165-168`) prüft nur, ob `req.body` selbst ein Objekt ist.
* 68 Stellen der Form `(req.body.X || '').trim()` bzw. `.toLowerCase()/.slice()/.replace()/.split()` auf `req.body`
  oder `req.query` (Liste: Anhang, per `grep` gegen `221a7b2`). Bei Array oder Objekt → `TypeError` → der globale
  Fehlerbehandler (`server.js:1467-1500`) antwortet 500 und ruft `errorTracker.melde()` (Telegram, je Route auf
  15 min gedrosselt).
* Ohne Anmeldung erreichbar u. a. `routes/tablet-sperre.js:551, 593` (kein eigenes `try/catch`, gelesen). Dieselbe
  Klasse ist in `routes/auth.js` (K1) und `routes/qr-scan.js` schon einzeln behoben.
* Dazu 38 Destrukturierungen `const { … } = req.body|query` — ob deren Variablen später einen String-Aufruf bekommen,
  ist nicht gemessen.
* Der Fehlerbehandler kennt ausser 413 keinen 4xx: Fehler, die Express-Middleware selbst mit `status` 400 und
  `expose: true` erzeugt (z. B. `express.json()` bei kaputtem JSON, `entity.parse.failed`), werden heute ebenfalls
  500 + Alarm. Gelesen, NICHT gemessen — der Executer misst es zuerst.

## Auftrag

1. **Vorher messen** (Bericht, bevor gebaut wird, nur melden wenn es vom Erwarteten abweicht):
   (a) Mit dem echten Middleware-Aufbau (Muster `test_feature_bodyparser_und_sequenz.js`): `pin[]=1` und `pin[x]=1`
   an `/tablet/sperre` → heute 500 und `melde()` aufgerufen? (b) kaputtes JSON an eine JSON-Route → heute 500 und
   `melde()`? (c) Die endgültige Menge der Stellen per AST, nicht per `grep` (auch Destrukturierungen, `?.`, `??`,
   Zwischenvariablen, `req.query`).
2. **Helfer `core/eingabe.js`**: `textFeld(wert)` gibt einen String zurück (`undefined`/`null` → `''`); bei Array,
   Objekt, Zahl o. Ä. wirft er einen `EingabeFehler` (`status 400`, `expose: true`). Kein stilles `''` bei falschem
   Typ — ein Array darf ein Feld nicht still leeren. Jede Fundstelle aus 1(c) benutzt ihn.
3. **Fehlerbehandler**: Fehler mit `expose === true` und `status` 400–499 → dieser Status, HTML- bzw. JSON-Antwort
   wie beim 413-Zweig, **kein** `melde()`, dafür eine `console.warn`-Zeile mit Route und `err.type`. Alle anderen
   Fehler unverändert 500 + `melde()`. Nicht `err.status` allein: ein Fehlerobjekt aus einem Aufruf nach aussen
   (Magicline, Mail) kann `status: 401` tragen und würde sonst still.
4. **Wächter (statisch, AST, Muster der vorhandenen acorn-Wächter)**: kein String-Methodenaufruf auf einem Wert, der
   aus `req.body`/`req.query` stammt, ohne `textFeld()` dazwischen. Die Erkennungsregel wird an den Fundstellen aus
   1(c) gelernt (Positivfälle), nicht geraten. Fixturen rot/grün, dazu eine Zusicherung über die MENGE der
   gescannten Dateien gegen `git ls-files` (nicht über eine Anzahl).
5. **Verhaltenstests**: `pin[]=1`, `pin[x]=1` und kaputtes JSON → 400, `melde()` NICHT aufgerufen (Stub, nie echt);
   Positivkontrolle: ein normaler Fehler (Wurf ohne `expose`) → 500 und `melde()` aufgerufen; ein Fehler mit
   `status: 401` ohne `expose` → 500 und `melde()`.

## Gegenproben (je einzeln ROT und zurück GRÜN, wörtlich melden)

(a) An `routes/tablet-sperre.js:551` den alten Ausdruck zurück → Verhaltenstest rot UND Wächter rot.
(b) Im Fehlerbehandler die `expose`-Bedingung weglassen → der 401-ohne-`expose`-Test rot.
(c) Im Wächter eine Fundstellenform aus 1(c) (z. B. Destrukturierung) nicht mehr erkennen → Fixtur rot.

## Fragen an die Planprüfung

* **Welcher Zustand entsteht dadurch, den es vorher nicht gab?** (Fehler, die jetzt ohne Alarm bleiben; Routen mit
  eigenem `catch`, die den `EingabeFehler` fangen und anders antworten; Felder, die legitim Arrays sind.)
* **Was wird durch diese Behebung schlechter?**
* Ist „werfen statt leer" richtig, oder gibt es Stellen, an denen ein Array heute legitim ankommt (Mehrfachauswahl)?
* Kann der Wächter grün sein, obwohl eine Fundstelle übrig ist?

## Anhang: Fundstellen (grep, 68)

Liegt dem Bündel bei.
