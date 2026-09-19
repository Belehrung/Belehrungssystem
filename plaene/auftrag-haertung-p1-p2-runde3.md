# Auftrag — Härtung P1+P2, Runde 3

**Zweig:** `claude/haertung-p1-p2` im Repo `/home/user/gymdocu`, Kopf `04e939c`.
**Basis:** `master` = `c40c52f`. Der Zweig liegt NICHT hinter master (geprüft).
**Arbeitsbaum:** `/home/user/gymdocu` ist FREI — kein anderer Agent arbeitet dort.

Runde 1 und 2 sind gebaut und von mir abgenommen worden, soweit sie tragen.
Diese Runde räumt DREI Befunde ab, die eine zweite unabhängige Prüfung nach
Runde 2 gefunden hat. Einen davon habe ich vor diesem Auftrag SELBST
nachgemessen (Zahlen unten) — er ist kein Verdacht, sondern ein Messergebnis.

**Einordnung (CLAUDE.md verlangt sie vor dem Auftrag, in einem Satz):** Dieser
Auftrag ist SEHR KOMPLEX, weil sein Kern ein Wächter ist, dessen Versagen sich
als grüner Lauf tarnt — dieselbe Datei hat jetzt zweimal hintereinander eine
FALSCHE Zusicherung von Abdeckung getragen, und die Aufgabe besteht genau
darin, diese Klasse zu schliessen statt sie eine Ebene tiefer zu verschieben.

---

## Befund 1 (BLOCKIEREND) — der Wächter ist immer noch blind, eine Ebene tiefer

### Was gemessen ist

`test_feature_csrf_ausnahmen_waechter.js` sieht Routen, die auf einem
**ohne Pfad eingehängten Router** (`app.use(router)`) registriert sind,
weder über Teil A noch über Teil B.

**Meine eigene Messung, 18.09.2026, mit Wegwerf-Datenbank
(`blindfleck_probe_test`, danach `dropdb`):**

- Gepflanzt in `routes/offline.js` (Zeile 44, direkt nach
  `const router = express.Router();`):
  `router.post('/intern/blindfleck', (req, res) => res.send('x'));`
  Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Treffer,
  Marker in derselben Zeile, `node --check` bestanden.
- **Lauf MIT gepflanzter Route: `EXIT 0`, `35 PASS / 0 FAIL`.**
  Gefundene Menge unverändert dreizehn Einträge, `POST /intern/blindfleck`
  kommt darin NICHT vor.
- **Lauf OHNE (nach Rücknahme über `cp`, `diff` EXIT 0): `EXIT 0`,
  `35 PASS / 0 FAIL`** — identisch. Die Mutation ist vollständig unsichtbar.

`routes/offline.js` ist in `server.js:738` per `app.use(require('./routes/offline'))`
eingehängt, also OHNE Pfad. Eine dort registrierte Route liegt produktiv unter
ihrem eigenen Pfad — hier `/intern/blindfleck` — und ist damit nach
`core/csrf-schutz.js` VOLLSTÄNDIG vom Origin/Referer-Schutz ausgenommen.

Der Zusicherungstext lautet trotzdem wörtlich „Die registrierten Schreibrouten
unter den Ausnahme-Präfixen … entsprechen GENAU der erwarteten Menge". Das ist
die teuerste Klasse aus der CLAUDE.md: eine falsche Zusicherung von Abdeckung.

### Die vier betroffenen Stellen (von mir aus `server.js` gemessen)

    :707  app.use(authRoutes);                          // = require('./routes/auth')       (server.js:83)
    :708  app.use(require('./routes/mitarbeiter-auth'));
    :738  app.use(require('./routes/offline'));
    :743  app.use(tabletSperreRoutes);                  // = require('./routes/tablet-sperre') (server.js:742)

**Heute trägt KEINER dieser vier eine Schreibroute unter einem der vier
Ausnahme-Präfixe** — von mir gemessen (`grep -nE "router\.(get|post|put|patch|delete|all)\("`
über alle vier Dateien: `/setup`, `/login`, `/logout`, `/passwort-*`,
`/admin/benutzer*`, `/admin/2fa*`, `/admin/passwort`, `/admin-zugang`,
`/mitarbeiter/pin-setzen/:token`, `/pin-vergessen`, `sw.SW_PFAD`,
`sw.OFFLINE_PFAD`, `/tablet/sperre`, `/tablet/freischalten`, `/tablet/logout`).
**Es gibt also heute KEINE Lücke im Betrieb** — die erwartete Menge bleibt bei
dreizehn. Dieser Auftrag behebt die BLINDHEIT, nicht ein Loch.
Wenn deine Messung davon abweicht: melden, nicht anpassen.

### Was NICHT gebaut werden soll

**Nicht die Regex Schreibweise für Schreibweise nachpatchen.** Genau das ist in
Runde 1 und 2 zweimal gescheitert — jede Runde sah geschlossen aus, und die
Klasse lebte eine Ebene tiefer weiter. Dieselbe Krankheit ist in der CLAUDE.md
für den Scanner-Wächter fünfmal in Folge protokolliert.

### Was gebaut werden soll: ein VOLLSTÄNDIGKEITSRIEGEL

Die Leitfrage aus der CLAUDE.md lautet nicht „ist der Nachweis fein genug?",
sondern: **woher kommt der Sollwert, und kann derselbe Defekt ihn
mitverändern?** Der Riegel beantwortet das so:

**(1) Die Grundgesamtheit.** Über den kommentar-maskierten Quelltext von
`server.js` JEDE Registrierung an `app` einsammeln — Muster in der Art von
`\bapp\s*\.\s*(use|get|post|put|patch|delete|all)\s*\(` —, und zwar MIT
ZEILENNUMMER. Das ist die Referenz, gegen die alles andere gehalten wird.

**(2) Die Grundgesamtheit selbst absichern.** Zusätzlich messen und bei einem
Treffer FAIL (nicht stillschweigend übergehen):
- `app[` — Registrierung über Klammer-Indizierung (`app['post'](…)`),
- eine Zuweisung, die `app` unter einem anderen Namen weiterreicht
  (`= app;`, `= app,`), über die dann registriert werden könnte.
Beides ist heute nicht vorhanden; wenn es auftaucht, ist die Grundgesamtheit
unvollständig und der Wächter MUSS das sagen statt grün zu bleiben.

**(3) Jede einzelne Fundstelle wird KLASSIFIZIERT**, in genau einen Topf:

- **P — Pfad-Literal:** erstes Argument ist eine Zeichenkette in `'`, `"` oder
  Backtick OHNE `${`. Pfad ist statisch bekannt; Teil A/B behandeln sie wie
  bisher. **Die vorhandenen Regexe in Teil A und Teil B erfassen den Backtick
  heute NICHT — das ist mit zu beheben**, sonst fällt eine Backtick-Route in
  „unklassifiziert" und der Riegel meldet einen Befund, der in Wahrheit nur
  eine Lücke der Extraktion ist.
- **M — pfadlose Middleware:** `app.use(<Ausdruck>)`, wobei der Ausdruck auf
  einer VON HAND geschriebenen Liste bekannter Nicht-Router steht (helmet,
  session, `express.urlencoded`, `express.json`, `express.static`,
  `csrfSchutz`, `requireLogin`, `studioContext()`, `pfadKontext()`,
  `wartungMiddleware()`, `uploadLimitWaechter`, anonyme Funktionen/Pfeile,
  Fehlerbehandler mit vier Parametern …). Die Liste ist Handarbeit und soll es
  sein: wer eine neue Zeile einträgt, trifft eine Entscheidung.
- **R — pfadloser ROUTER:** `app.use(<Ausdruck>)`, Ausdruck auf einer zweiten,
  ebenfalls VON HAND geschriebenen Liste. Das sind heute genau die vier oben.
  Diese Router werden **wirklich requiret und wie die zwölf durchlaufen**
  (Präfix `''`), ihre Schreibrouten fliessen in die gefundene Menge.
- **alles andere → UNKLASSIFIZIERT → FAIL**, mit Zeilennummer und dem
  Quelltext der Zeile in der Meldung. Ein Backtick-Pfad MIT `${` gehört
  ausdrücklich hierher: ein zur Laufzeit zusammengesetzter Pfad ist statisch
  nicht beurteilbar, und der Wächter muss das laut sagen statt ihn zu
  überspringen.

**(4) Die Zusicherung ist ein MENGENvergleich, keine Zahl.** Die Menge der
klassifizierten ZEILENNUMMERN muss der Menge aller gefundenen Zeilennummern
entsprechen; die Differenz wird in BEIDE Richtungen ausgegeben. Eine Zahl
(„alle 63 klassifiziert") trägt hier nicht — CLAUDE.md, „Eine Zusicherung über
eine ZAHL ist keine Zusicherung über eine MENGE".

**(5) Die Alias-Falle schliessen.** `app.use(authRoutes)` und
`app.use(tabletSperreRoutes)` nennen einen Bezeichner, kein `require`. Für
jeden Bezeichner der R-Liste gehört — wie es `MODUL_AUSDRUCK_ERWARTET` für die
zwölf schon tut — eine literale Erwartung her, gegen die der tatsächliche
`require`-Ausdruck aus `server.js` geprüft wird. Sonst tauscht jemand
`const authRoutes = require('./routes/auth')` still gegen ein anderes Modul und
der Wächter zählt fröhlich das falsche.

**(6) Die bestehende Layer-Zusicherung mitziehen.** „Jeder Layer hat eine
eigene `.route`" gilt ab jetzt auch für die vier neuen Router. CLAUDE.md, „Wer
zwei Wächter an denselben Helfer hängt, erbt dessen Stärken NICHT automatisch":
die ZUSICHERUNGSLISTE der zwölf durchgehen und prüfen, welche davon für die
vier ebenfalls gelten muss.

**(7) Warum das Durchlaufen stärker ist als das Lesen — und warum es hier
zählt:** `routes/offline.js:45/57` registriert seine Pfade über VARIABLEN
(`sw.SW_PFAD`, `sw.OFFLINE_PFAD`). Ein Quelltext-Scan kann daraus nichts
ableiten; der durchlaufene `router.stack` trägt den aufgelösten Wert. Genau
deshalb gehören die vier in Teil A (ausführen) und nicht in Teil B (lesen).

**(8) Die Grenze ehrlich benennen.** Was der Riegel nachweislich NICHT deckt,
gehört wörtlich in den Zusicherungstext bzw. den Kopfkommentar — nicht in eine
Behauptung, die mehr verspricht. Was du nicht gemessen hast, schreibst du nicht
hin.

### Gegenproben zu Befund 1 (jede einzeln, jede wörtlich melden)

Pflicht sind mindestens diese fünf. Jede über ein Mutationsskript, das den
**Zielpfad als ARGUMENT** nimmt und bei ≠ 1 Treffer abbricht; Marker (`GEGENPROBE-` + `DEFEKT`, dazu „absichtlich, wird zurueckgenommen") in derselben Zeile;
`node --check` auf die sabotierte Datei VOR dem Lauf; Rücknahme ausschliesslich
über eine vorher per `cp` beiseitegelegte Kopie, danach `diff` mit EXIT 0.

1. **`router.post('/intern/blindfleck', …)` in `routes/offline.js`** — muss
   ROT werden. Vergleichswert von mir: vorher `EXIT 0, 35 PASS / 0 FAIL`.
2. **Eine neue Zeile `app.use(irgendEinNeuerBezeichner);` in `server.js`** —
   muss ROT werden, als UNKLASSIFIZIERT, mit Zeilennummer in der Meldung.
3. **Ein Backtick-Pfad `app.post(\`/intern/backtick-probe\`, …)` in
   `server.js`** — muss ROT werden. Miss und melde, ÜBER WELCHEN Weg
   (als P erkannt und dann nicht in der Erwartung, oder unklassifiziert).
4. **`app.use('/api-neu', irgendeinRouter);` in `server.js`** — muss ROT
   werden.
5. **Positivkontrolle auf dem sauberen Baum:** GRÜN, und die gefundene Menge
   enthält GENAU die dreizehn erwarteten Einträge.

Zusätzlich, weil eine Gegenprobe aus dem falschen Grund grün sein kann: bei
JEDEM grünen Ergebnis zuerst prüfen, ob die Mutation überhaupt angekommen ist
(eine Zahl suchen, die sich hätte ändern müssen).

---

## Befund 2 (BLOCKIEREND) — der CSRF-Test misst nur den Status, nicht die Wirkung

`test_feature_haertung_csrf_end_zu_ende.js` prüft je Route drei Statuscodes
(403 ohne Origin, 403 mit fremdem Origin, 200/302 mit passendem Origin). Der
SINN des CSRF-Schutzes ist aber, dass die WIRKUNG ausbleibt — und die misst
niemand. Ein 403 kann auch aus einem ganz anderen Grund kommen; die CLAUDE.md
hat dafür einen eigenen Abschnitt („Derselbe Statuscode aus einem neuen
Grund").

**Zu bauen:** je Route und je Richtung zusätzlich die WIRKUNG messen.

- **403-Fall: die Wirkung ist AUSGEBLIEBEN.**
- **Fall mit passendem Origin: die Wirkung ist EINGETRETEN.** Das ist die
  Positivkontrolle und sie ist PFLICHT — ohne sie ist „keine Wirkung" nicht von
  „die Anfrage ist nie am Handler angekommen" zu unterscheiden.

**FUNDORTE, keine Befunde — selbst nachmessen, welche Spur die Route wirklich
hinterlässt, und bei Abweichung widersprechen:**

- Verbandbuch `POST /admin/verbandbuch/eintrag/:id/pdf`: eine Zeile in
  `verify_dokumente` (geschrieben in `core/pdf-engine.js` über
  `registriereVerify()` in `finalize()`). Der Routen-Kommentar in
  `routes/verbandbuch-admin.js` benennt genau das als die dauerhafte Spur —
  die DATEI wird seit #455 sofort wieder gelöscht und taugt NICHT als Beleg.
- Wartung `POST /module/wartung/pruefung-pdf/:id` und Geräte-Wartungsarchiv
  `POST /admin/geraetewartung/verlauf/pdf/:id`: vermutlich dieselbe Spur.
- Sichtprüfung `POST /module/cardio-check/neue-fotos/fertig`: setzt
  `mail_gesendet_am` auf den betroffenen `geraete_defekte`-Zeilen und
  verschickt Mail (der Mailer ist in dieser Datei bereits attrappiert).

**Vor jeder dieser Messungen den Weg vom Einstiegspunkt bis zur gemessenen
Zeile durchgehen und JEDEN Frühausstieg dazwischen benennen** (CLAUDE.md: eine
Gegenprobe, die den geprüften Code gar nicht erreicht, ist keine). Wenn eine
Route bei der gewählten Fixtur ohnehin vorher aussteigt, ist die Zusicherung
„keine Wirkung" grün ohne jeden Wert — dann die Fixtur ändern, nicht die
Zusicherung.

---

## Befund 3 (klein, aber echt) — Scratch-Verzeichnis bleibt im Abbruchzweig liegen

In `test_feature_haertung_csrf_end_zu_ende.js` räumt der Abbruchzweig
`if (!pdfRootSicher) { … process.exit(1); }` das angelegte `PDF_ROOT_TEMP`
NICHT ab; die beiden anderen Ausgänge tun es. Beheben, so dass JEDER Ausgang
aufräumt. Dieselbe Frage einmal an `test_feature_get_schreibt_nicht.js`
stellen und das Ergebnis melden — auch wenn dort nichts zu tun ist.

---

## Pflichten für diese Runde (CLAUDE.md, nicht verhandelbar)

- **Früh committen und pushen**, BEVOR du auf einen Hintergrundlauf wartest.
  Ein Container-Neustart hat schon einmal eine fertige Runde vernichtet.
- **Volle Suite selbst fahren, ohne Pipe und ohne äusseres `flock`:**
  `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`.
  Warten mit `until grep -q '^SUITE_EXIT=' <logdatei>`.
- **Dateizahl-Ritual als MENGENvergleich**, nicht als Zahl, mit dem Muster aus
  der CLAUDE.md (es muss auch `ops/boot-smoke.js`, die `test/*.sh`-Einträge und
  Grossbuchstaben treffen). `diff` muss EXIT 0 liefern.
- **`npm run lint` fahren und das Ergebnis WÖRTLICH melden, auch bei Grün.**
  Ein nicht gelaufener Schritt ist kein bestandener.
- **Marker-Scan vor jedem Commit**, Treffer ZÄHLEN (Sollwert im GymDocu-Repo: 6,
  alle in `docs/offene-befunde-31-08-2026.md`).
- **Während die Suite läuft KEINE Dateien ändern.** In Runde 2 ist genau das
  passiert; du hast es selbst gemeldet und den Lauf für nicht massgeblich
  erklärt — richtig gehandelt, aber es hat eine Runde gekostet.
- **Keine neuen Rohwerte** (Farben, Radien, Schriftgrössen) direkt in einen
  `<style>`-Block. Diese Runde sollte am Aussehen ohnehin nichts ändern; falls
  doch, sag es, dann kommt `/design-pruefung` dazu.
- **Widersprich mir.** Wenn eine Vorgabe oben an der Wirklichkeit vorbeigeht —
  ein Fundort stimmt nicht, eine Gegenprobe erreicht den geprüften Code nicht,
  eine Messung widerlegt meine Zahl —, dann melde das, statt es passend zu
  machen. Das war in den letzten Runden mehrfach das Wertvollste am Bericht.

## Bericht

Wörtliche Testausgaben, nicht Zusammenfassungen. Je Gegenprobe: Zahlen VOR der
Mutation, Zahlen MIT, Zahlen NACH der Rücknahme, plus `diff`-Exit. Dazu, welche
Vorgaben aus diesem Auftrag sich beim Messen als falsch erwiesen haben.
