# Auftrag — Härtung P1+P2, Runde 4

**Zweig:** `claude/haertung-p1-p2` im Repo `/home/user/gymdocu`, Kopf `2a21152`.
**Basis:** `master` = `c40c52f`. Geändert sind bisher NUR zwei Testdateien.

Runde 3 hat die Blindstelle aus Runde 2 geschlossen — das ist gemessen und es
trägt. Die Gegenlesung danach hat **acht** weitere Befunde gebracht, **fünf
davon blockierend**, und ich habe ihre Prämissen einzeln nachgemessen. Dazu
kommt ein Loch, das ich selbst gefunden habe.

**Einordnung: SEHR KOMPLEX.** Der Wächter hat jetzt in DREI Runden
hintereinander eine falsche Zusicherung von Abdeckung getragen, und jedes Mal
sah er vorher geschlossen aus. Diese Runde ändert deshalb nicht die nächste
Regex, sondern den Ansatz.

---

## Die Kernentscheidung: Teil B wird ein AST statt einer Regex

`acorn` ist bereits DIREKTE Abhängigkeit (`package.json:8`, Version 8.18.0 —
von mir nachgesehen). Die Grundgesamtheit der Registrierungen an `app` wird
deshalb ab jetzt nicht mehr über `REGISTRIERUNG_RE` aus dem Text geklaubt,
sondern aus dem **Syntaxbaum von `server.js`** gewonnen. `server.js` wird
dafür weiterhin NICHT ausgeführt — geparst, nicht instanziiert.

Das löst drei der fünf blockierenden Befunde an der Wurzel (B1, B2, B3) und
liefert nebenbei das, was die Zeilennummer nie war: einen EINDEUTIGEN
Schlüssel je Registrierung (`node.start`/`node.end`).

Was der AST zu liefern hat:

- **Jeden Aufruf, dessen Empfänger auf `app` zurückgeht** — auch am Ende einer
  Kette. `app.get(…).post(…)` ist gültiges Express (nachgemessen: `app.get()`
  liefert `app` zurück, Express 5.2.1), und die alte Regex fand davon nur den
  ersten Aufruf.
- **Die Position** jeder Registrierung als Schlüssel, nicht die Zeile.
- **Den vollständigen ERSTEN Argumentknoten.** Ein `Literal` vom Typ String
  ist ein Pfad. Ein `TemplateLiteral` OHNE `expressions` ist ein Pfad. **Alles
  andere** — `BinaryExpression` (Verkettung), `Identifier`, `TemplateLiteral`
  MIT `expressions`, `ArrayExpression`, `NewExpression` (RegExp), … — ist
  entweder M/R (nur bei `use`, nur über die Handlisten) oder
  UNKLASSIFIZIERT.
- **Eine ausdrückliche Ablehnung jeder Form, die der Parser zwar sieht, der
  Riegel aber nicht beurteilen kann.** Laut, nicht still.

Die Zusicherung lautet danach **`unklassifiziert.length === 0`** — eine
eigenständige, direkte Zusicherung. Der Mengenvergleich über Positionen darf
daneben stehen, ersetzt sie aber nicht.

---

## Die acht Befunde im Einzelnen

### B1 (BLOCKIEREND) — UNKLASSIFIZIERT auf derselben Zeile wie P bleibt grün

`test_feature_csrf_ausnahmen_waechter.js:294-301`. Die Zeilennummer ist kein
eindeutiger Schlüssel: liegen zwei Registrierungen auf EINER Zeile und ist
eine davon klassifiziert, deckt sie die unklassifizierte zu. Der
`UNKLASSIFIZIERT`-Hinweis wird sogar AUSGEGEBEN — der Lauf bleibt trotzdem
grün, weil keine Zusicherung `unklassifiziert` selbst liest.

Zweitens ist die Gegenrichtung konstruktiv leer: `klassifizierteZeilen`
entsteht durch Filtern von `registrierungen`, `nurKlassifiziert` kann also nie
etwas enthalten. Das ist keine Kontrolle, das ist Dekoration.

**Von mir am Quelltext nachgemessen — beides trifft zu.**

Behebung: Positionen als Schlüssel, und `unklassifiziert.length === 0` als
eigene Zusicherung.

### B2 (BLOCKIEREND) — verkettete Registrierungen fehlen in der Grundgesamtheit

`app.get('/x', h).post('/intern/blindfleck', h)` registriert BEIDE Routen; die
Regex `(?<![\w$.])app\s*\.\s*(…)` findet nur die erste. Der zweite Aufruf
beginnt nicht mit `app.`.

**Von mir nachgemessen:** `app.get('/a', h) === app` ist `true` (Express
5.2.1). Die Kette ist also gültig und die Lücke real.

Behebung: über den AST (s.o.).

### B3 (BLOCKIEREND) — ein Ausdruck mit führendem Literal wird als Pfad gelesen

`ersteZeichenkette()` liest das erste String-Literal und prüft NICHT, ob das
erste Argument damit zu Ende ist. `app.post('/' + 'intern/blindfleck', h)`
wird deshalb als Topf P mit dem Pfad `/` klassifiziert.

**Von mir nachgemessen:** `istAusnahmePfad('/')` ist `false` — die Route wäre
unsichtbar, ohne dass irgendetwas UNKLASSIFIZIERT meldet.

Behebung: über den AST (nur `Literal`/`TemplateLiteral` ohne Ausdrücke gelten
als Pfad).

### B4 (BLOCKIEREND) — ein ausdrücklicher Wurzel-Mount umgeht die Router-Abdeckung

`mountKoennteAusnahmeRoutenTragen('/')` liefert `false`
(**von mir nachgemessen**: `istAusnahmePfad('/')` = `false`,
`AUSNAHME_PREFIX.includes('//')` = `false`). Ein `app.use('/', router)` wird
also sauber als P klassifiziert, danach aus `serverMountsAusnahme`
HERAUSGEFILTERT und nie durchlaufen — obwohl unter `/` jeder Ausnahme-Pfad
liegen kann.

Dieser Befund überlebt den AST; er sitzt auf der Auswerteseite.

Behebung: Die Frage lautet nicht „beginnt der Mount mit einem Ausnahme-
Präfix?", sondern **„kann sich ein Pfad unter diesem Mount mit einem
Ausnahme-Präfix überschneiden?"** Für Mount `M` und Präfix `P` also:
`P.startsWith(M)` ODER `M.startsWith(P)` — mit `M = '/'` ist das für jedes `P`
wahr. Die vorhandenen vier Mount-Proben (`/d`, `/v`, `/api-docs`, `/admin`)
bleiben; `/admin` muss weiterhin `false` liefern, sonst wird die Prüfung
wertlos. **Neue Proben für `/` (true) und für einen echten Fremdmount.**

Achtung: ein gemounteter Router, der ab jetzt zusätzlich durchlaufen wird,
muss auch in `MEINE_MOUNTS`-artiger Form requiret werden können. Miss, welche
Mounts dadurch neu hereinkommen, und melde es — wenn daraus ein grosser
Rattenschwanz wird, sag es, statt ihn stillschweigend zu bauen.

### B5 (BLOCKIEREND) — Pfad-Arrays werden zu einem falschen Einzelpfad

`layer.route.path` muss kein String sein. **Von mir nachgemessen** an Express
5.2.1: bei `router.post(['/x','/intern/y'], h)` ist `route.path` ein ARRAY,
und die Template-Interpolation in `schreibendeRoutenVoll()` macht daraus den
Text `/x,/intern/y`. `istAusnahmePfad('/x,/intern/y')` ist `false` — die
Route ist unsichtbar, und beide Layer-Zusicherungen bleiben grün, weil der
Layer sehr wohl eine `.route` hat.

Behebung: Pfad-Arrays ELEMENTWEISE behandeln. Jeder Pfadtyp, der weder String
noch Array von Strings ist (RegExp!), wird ausdrücklich ABGELEHNT — laut, mit
Zusicherung, nicht stillschweigend stringifiziert. Und: Methode und Pfad bis
zur Ausgabe als STRUKTURIERTE Werte halten, nicht per
`eintrag.split(' ')[1]` aus einem zusammengesetzten Text zurückgewinnen.

### B6 (sollte behoben werden) — ein Funktionsname beweist keine Middleware

`MIDDLEWARE_LAYER_ERWARTET` vergleicht `l.handle.name`. Ein Name beweist weder
Identität noch Verhalten, und ein Wrapper um einen Router hat selbst keinen
`.stack` — `istUnterRouter()` sieht ihn also nicht.

Behebung: für die eine bewusst zugelassene Ausnahme die FUNKTIONSIDENTITÄT
gegen den Import prüfen (`requireAdmin` aus `core/auth.js`, Fundort
`core/auth.js:54-75`), nicht den Namen. Zusätzlich den Mount-Pfad des Layers
gegen eine literale Erwartung (`/admin`).

### B7 (sollte behoben werden) — die Location-Zusicherung vergleicht nur den Basename

`test_feature_haertung_csrf_end_zu_ende.js:180-183` prüft Studio-Präfix und
Basename, nicht den vollständigen relativen Pfad. Eine Weiterleitung nach
`/pdf/<sid>/NichtVorhanden/<name>` bliebe grün, obwohl der Zusicherungstext
„dieselbe wie in Location" verspricht.

Behebung: den VOLLSTÄNDIGEN relativen Pfad vergleichen, Typverzeichnis
eingeschlossen.

### B8 (sollte behoben werden) — zwei verschluckte Dateisystemfehler

`pdfDateien()` behandelt JEDEN `readdirSync`-Fehler wie „Verzeichnis nicht
vorhanden" (`catch (e) { return; }`) — bei `EACCES` wäre „keine PDF-Datei"
grün, obwohl die BEOBACHTUNG gescheitert ist. Und `raeumeAuf()` verschluckt
jeden Fehler, ohne `fail` oder den Exitcode anzufassen; „JEDER Ausgang räumt
ab" ist damit nicht abgesichert.

Behebung: beim Lesen NUR `ENOENT` tolerieren, alles andere weiterwerfen; ein
gescheitertes Aufräumen meldet und färbt den Lauf rot.

### B9 (mein eigener Fund, BLOCKIEREND) — ein Router im falschen Topf

**Selbst gemessen:** Wird ein Router aus `PFADLOSE_ROUTER` entfernt UND als
Muster in `PFADLOSE_MIDDLEWARE` eingetragen, läuft der Wächter mit gepflanzter
`POST /intern/blindfleck` wieder auf **`EXIT 0`, 60 PASS / 0 FAIL**. Ein
Router im falschen Topf wird nie durchlaufen.

Das ist eine Fussangel des Wächters gegen sich selbst: seine eigene
Fehlermeldung nennt beide Listen und sagt NICHT, welche die richtige ist.

**Meine ursprüngliche Idee war eine Namenskonvention** (`require('./routes/…')`
bzw. Bezeichner auf `Routes`/`Router`). Die Gegenlesung hat zu Recht gesagt,
dass das keinen Vollständigkeitsbeweis trägt — sie schliesst die gemessene
Schreibweise und sonst nichts.

**Baue stattdessen das Strukturelle, soweit es geht:** Mit dem AST ist der
Argumentknoten jeder M-Registrierung bekannt. Für die Formen, die überhaupt
ein Router sein KÖNNEN — ein `require('…')`-Aufruf oder ein blosser
`Identifier` — wird der Wert BESORGT und zugesichert, dass er KEINEN `.stack`
trägt. Für die übrigen (`helmet(…)`, `session(…)`, `express.json(…)`,
anonyme Funktionen) bleibt die Handliste, dann aber mit einer benannten
Begründung je Eintrag.
Und die Fehlermeldung sagt ab jetzt, welcher Topf für einen Router zuständig
ist.

Wenn du beim Bauen misst, dass das Besorgen eines Bezeichners aus `server.js`
heraus nicht geht, ohne `server.js` auszuführen: **sag es und baue die
Namenskonvention als Rückfallebene** — aber schreib die Grenze in den
Kopfkommentar, statt sie zu verschweigen.

---

## Reihenfolge

Die Gegenlesung nennt sie, und sie ist richtig: **zuerst B1 und die
AST-Umstellung (B2, B3), dann B4 und B5, dann B9, zuletzt B6/B7/B8.** Nur das
bekannte M/R-Loch zu schliessen hinterliesse wieder einen grünen Wächter mit
nachweisbaren Blindstellen.

## Gegenproben

Zu JEDEM der neun Befunde eine eigene, bleibende Gegenprobe: Defekt einbauen,
ROT messen, zurücknehmen, GRÜN messen, beides wörtlich. Die
Einzeiler stehen oben je Befund und stammen aus der Gegenlesung — sie sind
VORHERSAGEN, keine Messungen. **Miss sie nach und widersprich, wenn eine nicht
trifft.** Eine Vorhersage, die nicht eintritt, ist ein Befund über die
Vorhersage, kein Grund, sie passend zu machen.

Regeln unverändert: Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei
≠ 1 Treffer, Marker (`GEGENPROBE-` + `DEFEKT`) in derselben Zeile,
`node --check` vor dem Lauf, Rücknahme ausschliesslich über eine per `cp`
beiseitegelegte Kopie mit `diff` EXIT 0. Bei jedem GRÜNEN
Gegenprobenergebnis zuerst prüfen, ob die Mutation überhaupt angekommen ist.

## Pflichten

Unverändert aus Runde 3: früh committen und pushen; volle Suite selbst fahren
(`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`, ohne Pipe, ohne
äusseres `flock`); während der Suite keine Dateien ändern; Dateizahl-Ritual
als Mengenvergleich mit `diff` EXIT 0; `npm run lint` fahren und das Ergebnis
WÖRTLICH melden; Marker-Scan vor jedem Commit (Sollwert 6).

**Neu und wichtig:** `acorn` ist vorhanden, aber prüfe, ob eine neue
Testdatei, die `acorn` benutzt, irgendeine Eintragung in `eslint.config.js`
oder anderswo braucht — und melde das Ergebnis, auch wenn es „nichts nötig"
lautet.

## Bericht

Wörtliche Testausgaben. Je Gegenprobe: Zahlen VOR, MIT und NACH der Mutation,
plus `diff`-Exit. Dazu jede Vorgabe aus diesem Auftrag und jede Vorhersage der
Gegenlesung, die sich beim Messen als falsch erwiesen hat.
