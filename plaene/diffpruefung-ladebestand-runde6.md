# Diffprüfung Runde 6 — ausführende Spur (Claude), 22.09.2026

Stand `5735eac`, Zweig `beitrag-ladebestand`. 14 Befunde.

**Gerettet aus dem Transkript**, weil sie nur im Subagenten-Rückgabe standen und
bei der Verdichtung beinahe verloren gegangen wären. Lehre: Prüfbefunde gehören
in eine DATEI, nicht nur in eine Rückgabe.

## Rohbefunde

```json
[
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 660,
    "summary": "Die neue Zusicherung `abschnitt.length === ende - zeilenbeginnNachMarke` ist eine Tautologie und blind gegen genau die Klasse, für die sie eingeführt wurde.",
    "failure_scenario": "maskiereKommentare() gibt `out.join(\"\")` über ein Array zurück, das aus `src.split(\"\")` entsteht — die Länge ist per Konstruktion immer gleich der Eingabe (selbst gemessen: 14743 = 14743). Die Zusicherung kann nur fallen, wenn der Hausstandard selbst aufhört, längenerhaltend zu sein; sie sagt NICHTS über den Abschnitt. Schlimmer: der benannte Blindheitsfall (ein `/*` in einer echten Zeichenkette verschluckt Code) erzeugt bei einem MASKIERENDEN Reiniger identische Länge — dort, wo der alte Automat 187 auf 56 Zeichen schrumpfte, bleiben es beim neuen 187 zu 187, mit ausgeleertem Code. `ok('… ist längengleich zum rohen Ausschnitt')` meldet damit einen Beweis, den es nicht gibt. Der Bestand hat für genau diesen Zweck `nichtLeerraum()` (test/rohwert-scan.js:360, exportiert, Kopfkommentar: 'wo ein reiner .length-Vergleich blind ist') — gemessen fällt der Abschnitt von 9137 auf 2291 Nicht-Leerraum-Zeichen, hier wäre ein literal hingeschriebener Sollwert wirksam."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 575,
    "summary": "Punkt 9 (C9): die Positivkontrolle deckt nur die Aufruf-AUFZÄHLUNG ab, nicht das Prädikat, das den Verstoß erkennt — die Zusicherung kann vakuos grün sein.",
    "failure_scenario": "`aufrufe.length === 15` belegt, dass Aufrufer gefunden werden. Ob `new RegExp(\\`\\\\b${r}\\\\.text\\\\(\\\\)\\`)` einen Verstoß überhaupt noch ERKENNEN kann, belegt nichts. Schreibt jemand künftig `await rPriming.text( )`, `rPriming\\n    .text()`, `rPriming['text']()` oder `const { text } = rPriming`, bleibt `zweitesTextVerstoesse` leer, alle 15 Aufrufe werden weiterhin gezählt, die Zusicherung ist grün — und `ok('kein Aufrufer liest … ein zweites Mal')` behauptet eine Prüfung, die nicht stattgefunden hat. Der Kommentar erkennt die Vakuität ausdrücklich für die erste Hälfte ('bliebe zweitesTextVerstoesse leer und die Zusicherung darunter VAKUOS grün') und schliesst sie nur dort. Behebung analog zu Fixtur 4: das Prädikat einmal gegen eine synthetische Verletzungszeichenkette laufen lassen und ein Treffen verlangen."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 548,
    "summary": "Punkt 9 (C9) sucht nur VORWÄRTS ab dem Aufruf — die gleich tödliche umgekehrte Reihenfolge (erst `r.text()`, dann `pruefeKeinFehlerseiten(r, …)`) ist unsichtbar.",
    "failure_scenario": "`eigenerQuelltext.slice(nachStelle)` schneidet alles VOR dem Aufruf weg. Schreibt ein künftiger Block `const html = await rNeu.text(); … await pruefeKeinFehlerseiten(rNeu, ABBRUCH_MARKER, 'x');`, wirft der Helfer an seinem eigenen `await r.text()` (Zeile 93) 'TypeError: Body is unusable' — dieselbe R3-Falle, gegen die C9 antritt —, während C9 15 Aufrufe zählt und 0 Verstöße meldet. Seit dem Wegfall von `r.clone()` in dieser Runde ist genau diese Richtung neu scharf: vorher hätte der Klon sie abgefangen."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 743,
    "summary": "Der neue ANKER `neu AS (` der FOR-UPDATE-Prüfung hat keine Existenz-Zusicherung — verschwindet der Ankername, dehnt sich das Fenster lautlos bis zum Dateiende aus.",
    "failure_scenario": "`/WITH gesperrt AS \\((?:(?!\\bneu AS \\()[\\s\\S])*?FOR UPDATE\\s*\\)/` begrenzt das Fenster ausschliesslich über die Zeichenkette `neu AS (`. Wird die zweite CTE umbenannt (z. B. in `nachtrag AS (`) — eine harmlos aussehende Aufräum-Änderung —, reicht das Fenster wieder bis zum Dateiende, und ein `FOR UPDATE)` an IRGENDEINER späteren Stelle von geraete.js erfüllt die Zusicherung, während die CTE `gesperrt` ungesperrt ist. Das ist exakt die Klasse, die die Runde mit dem Anker beheben wollte (300-Zeichen-Fenster reichte in die folgende CTE), nur eine Ebene weiter. Für den CTE-NAMEN wurde die Positivkontrolle gebaut (`cteNamenTreffer === 1`, Zeile 741) und für die Bereichsmarken ebenfalls (C8, Zeile 660ff.) — für den Anker nicht. Heute unentdeckt nur deshalb, weil nach :2965 kein weiteres `FOR UPDATE)` im Code steht (selbst gemessen: die übrigen Treffer bei :699, :2903, :2922, :2935, :2947, :5514 sind Kommentare, :746 steht davor)."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 521,
    "summary": "PRUEFPLAN_VERBOTENES_MUSTER deckt die KLAMMER-Schreibweise nur für `query` ab — `pool[\"run\"](…)`, `pool[\"one\"](…)`, `pool[\"tx\"](…)` laufen unbeanstandet durch.",
    "failure_scenario": "Selbst gemessen gegen das Muster: `pool[\"run\"](\"UPDATE wartung_geraete SET aktiv=0\")` → DURCH, `pool[\"one\"](\"UPDATE x\")` → DURCH (dagegen `pool.query(`, `run(`, `q(`, `t.run(`, `client.query(` → GEFANGEN). Die Alternative `\\[\\s*.?query.?\\s*\\]` kennt nur den Namen `query`, und `\\b(?:run|one|tx|q|pool)\\s*\\(` verlangt unmittelbar eine runde Klammer. Damit steht die Umgehung, die die fünfte Runde bei `db[\"run\"](…)` als BLOCKIEREND geschlossen hat, eine Aliasbildung weiter (`const { pool } = require('../../core/db')` AUSSERHALB des Bereichs) wieder offen — genau der Weg, den der Kommentar bei Zeile 259ff. selbst als die eigentliche Klasse beschreibt ('jeder davon ist über einen Alias AUSSERHALB des Bereichs erreichbar')."
  },
  {
    "file": "routes/admin/geraete.js",
    "line": 2915,
    "summary": "Die in dieser Runde BERICHTIGTEN Zeilennummern des Fremdschreibers sind um 9 Zeilen falsch.",
    "failure_scenario": "Der Kommentar nennt jetzt `:6605` für die Route und `:6714` für das notizen-UPDATE. Nachgemessen im Stand 5735eac: `router.post(\"/geraetewartung/geraet/bearbeiten/:id\"` steht auf **6614**, `UPDATE wartung_geraete SET name=$1, …, notizen=$3` auf **6723**. Im Basisstand 3a7cad5 waren es 6600 bzw. 6709; der Beitrag fügt in geraete.js netto +14 Zeilen davor ein (28 Einfügungen / 14 Löschungen), fortgeschrieben wurde aber nur um +5. Wer der Fundstelle folgt, landet neun Zeilen vor dem Routenkopf, mitten im vorhergehenden Handler — dieselbe Klasse wie die alten, ebenfalls falschen `:6524`/`:6633`, die diese Runde ersetzen sollte."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 739,
    "summary": "Die Datei maskiert geraete.js zweimal und wirft dabei bei der ersten Maskierung die Eigenschaft weg, für die der Hausstandard längenerhaltend gebaut ist.",
    "failure_scenario": "Zeile 643 maskiert ein AUSSCHNITT (`GERAETE_QUELLTEXT_ROH.slice(zeilenbeginnNachMarke, ende)`), Zeile 739 maskiert die GANZE Datei. maskiereKommentare() ist ein ZUSTANDSBEHAFTETER Tokenizer (Stapel offener Template-Literale, `letztesTokenWert` für Regex-vs-Division); ein Ausschnitt startet ihn ohne Kontext, während der Kopfkommentar des Helfers gerade betont, dass Längenerhaltung existiert, damit 'jede Fundstelle-Position im maskierten Text zugleich eine gueltige Position im Original' ist — also damit man EINMAL maskiert und danach schneidet. `maskiereKommentare(GERAETE_QUELLTEXT_ROH).slice(zeilenbeginnNachMarke, ende)` wäre kontextrichtig, kürzer und spart einen Durchlauf (gemessen 51 ms ganze Datei, 1 ms Ausschnitt — die 51 ms fallen zehn Zeilen später ohnehin an). Heute liefern beide Wege byteweise dasselbe Ergebnis (selbst gemessen: identisch), der Unterschied ist latent — er wird scharf, sobald der Ausschnitt an einer Stelle beginnt, an der der Tokenizer-Zustand nicht neutral ist."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 643,
    "summary": "Der Wechsel auf den Hausstandard macht die Prosa-Immunität INNERHALB von Template-Literalen schlechter als vorher — genau im bewachten Bereich, der vier SQL-Templates enthält.",
    "failure_scenario": "Der gelöschte `ohneAlleKommentare()` entfernte `/* … */` global (`.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')`) und nachgestellte `//` zeilenweise, also auch innerhalb von Template-Literalen. maskiereKommentare() behandelt Template-TEXT ausdrücklich nicht als Code und maskiert dort nur, was nach ausschliesslich Leerraum seit dem letzten `\\n` mit `//` oder `/*` beginnt (test/rohwert-scan.js:236-255). Ein künftiger mittiger Erklärkommentar in einem der vier Templates des Bereichs — `… color:red; /* nie db.query() hier */` oder `foo(); // db.run() verboten` mit Code davor — überlebt die Bereinigung, und `\\bdb\\b` bzw. `.query\\s*\\(` schlägt an REINER PROSA an. Das ist die Umkehrung von CLAUDE.md 'Tests dürfen nicht an Prosa scheitern' und war mit dem alten Reiniger nicht möglich. Heute latent: gemessen 0 übriggebliebene `//` und 0 `db` im maskierten Abschnitt bei 8 Backticks."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 1676,
    "summary": "Der neue finally-Block verschluckt jeden Aufräumfehler in `console.error` — auf dem Erfolgspfad bleibt genau die Verunreinigung liegen, gegen die er gebaut wurde, und die Suite meldet trotzdem grün.",
    "failure_scenario": "Vier `try { … } catch (e) { console.error(…) }` ohne Zähler, ohne Rückwurf, ohne Einfluss auf den Exit-Code; die Datei endet mit `process.exit(0)`. Scheitert etwa das erste DELETE (`wartung_pruefungen`), scheitert danach zwangsläufig auch `DELETE FROM wartung_geraete` am FK ON DELETE RESTRICT und anschliessend `DELETE FROM wartung_kategorien` an derselben RESTRICT-Kette über den CASCADE auf wartung_geraete — alle drei still. 'Feuerlöscher 8' (studio_id ≠ studio der kategorie_id) bleibt in der geteilten Wegwerf-DB stehen, also genau der Zustand, dessen Vermeidung der Block im Kommentar als seinen Zweck nennt, und niemand erfährt es: drei console.error-Zeilen gehen im Suite-Log unter, das nach einem bestandenen Lauf nur die letzte Zeile spiegelt (test/run.sh:890). Nach CLAUDE.md 'eine Zusicherung, die nur einen Zähler erhöht, hält keinen Schreibweg auf' — hier wird nicht einmal ein Zähler erhöht. Auf dem Erfolgspfad gehört ein Aufräumfehler in den Fehlerzähler."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 546,
    "summary": "Der C9-Selbstscan liest den EIGENEN Quelltext roh statt durch den frisch importierten Hausstandard — eine künftige Prosazeile macht die Suite rot.",
    "failure_scenario": "`fs.readFileSync(__filename, 'utf8')` ohne `maskiereKommentare()`, obwohl die Datei den Masker seit Zeile 513 importiert. Schreibt jemand in einem Kommentar oder einer Auftragsnotiz `pruefeKeinFehlerseiten(rNeu` (mit Wortzeichen nach der Klammer — genau das, was `(\\w+)` verlangt), steigt `aufrufe.length` auf 16 und die Positivkontrolle in Zeile 565 schlägt fehl: 'es müssen 15 Aufrufe … gefunden werden, gefunden 16'. Der heutige Lauf hält nur, weil alle Kommentar-Erwähnungen von Hand mit `<r>` statt eines Bezeichners geschrieben sind (Zeilen 536, 537, 566, 576) — eine Disziplin, keine Zusicherung. CLAUDE.md 'Prüfstand-Regeln': 'Statische Prüfungen über Quelltext entfernen zuerst Kommentarzeilen'."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 476,
    "summary": "Die Begründung dafür, den zweiten, schwächeren Kommentar-Reiniger stehen zu lassen, ist nachgemessen FALSCH — die Z3-Messung ändert sich nicht.",
    "failure_scenario": "Der Kommentar hält fest: 'Bewusst NICHT als Ersatz für GERAETE_QUELLTEXT_OHNE_KOMMENTARE oben verwendet: die Z3-Aufruferzählung ist an DEREN bekannter Grenze bereits gemessen … eine zweite, strengere Bereinigung hier zu spät einzuführen würde diese Messung stillschweigend verändern.' Selbst nachgemessen über beide Reiniger gegen das heutige geraete.js: `ladeBestand(` 9 : 9, `ladeBestandStreng(` 4 : 4, `ladeBestand(req.studioId,` 8 : 8, `ladeBestandStreng(req.studioId,` 2 : 2 — identisch. Die Messung ändert sich also nicht, und der einzige genannte Grund für die zweite Fassung derselben Aussage trägt nicht. GERAETE_QUELLTEXT_OHNE_KOMMENTARE (Zeile 466-468: `^[ \\t]*\\/\\*…\\*\\/` plus Ganzzeilenfilter) kennt weder Zeichenketten noch Regex-Literale — also genau die Klasse, die diese Runde bei ihrem Geschwister als BLOCKIEREND eingestuft hat — und bewacht damit weiterhin die Z3-Zählungen in Zeile 1792. CLAUDE.md 'Dieselbe Aussage an zwei Orten … eine zweite Kopie wird gelöscht, es sei denn, es gibt einen benannten Grund'."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 763,
    "summary": "Fixtur 1 prüft weiter `includes('db')`, während Fixtur 3 in derselben Runde auf PRUEFPLAN_VERBOTENES_MUSTER umgestellt wurde — die C11-Regel ist nur halb angewandt.",
    "failure_scenario": "C11 lautet ausdrücklich: 'Riegel und Fixtur müssen DASSELBE Prädikat prüfen, sonst zeigt eine bestehende Fixtur nicht mehr, was der Riegel wirklich abfängt.' Fixtur 3 (Zeile 775) wurde deshalb umgestellt, Fixtur 1 (Zeile 763) nicht. Folge: der Nachweis 'ein nachgestellter //-Kommentar wird neutralisiert' gilt nur für den Bezeichner `db`. Ein nachgestellter Kommentar wie `await schreibePruefplan(x);   // nie .query( hier` würde von Fixtur 1 weiterhin als in Ordnung gemeldet, obwohl der Riegel in Zeile 754 genau auf `.query\\s*\\(` anschlägt — die Fixtur belegt also nicht mehr, was der Riegel abfängt."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 776,
    "summary": "Die Fehlermeldung von Fixtur 3 nennt nur `\"db\" muss erhalten bleiben`, während das geprüfte Prädikat inzwischen sechs weitere Alternativen umfasst.",
    "failure_scenario": "Die Zusicherung prüft `PRUEFPLAN_VERBOTENES_MUSTER.test(mitUmgehungsweg)`, die Meldung behauptet aber weiterhin eine Aussage über `db`. Fällt die Fixtur künftig, weil der Reiniger `db.run(` frisst, liest der Prüfende die richtige Meldung; frisst er stattdessen nur `.query(`-artigen Text, meldet dieselbe Zeile ebenfalls '\"db\" muss erhalten bleiben' und schickt die Diagnose in die falsche Richtung. Dieselbe Klasse wie CLAUDE.md 'ein Name, der mehr verspricht als die Zusicherung hält' — nur umgekehrt: die Zusicherung prüft mehr, als ihr Name sagt."
  },
  {
    "file": "test_feature_ladebestand_streng.js",
    "line": 564,
    "summary": "ERWARTETE_HELFERAUFRUFE = 15 ist ein Sollwert aus demselben Datenfluss wie die Prüfung und macht jede legitime Ergänzung eines Aufrufers zu einem roten Lauf mit irreführender Meldung.",
    "failure_scenario": "Wer künftig einen 16. Erfolgs-POST mit `await pruefeKeinFehlerseiten(rNeu, …)` absichert — also GENAU das Richtige tut —, bekommt 'Punkt 9 (C9) Positivkontrolle: es müssen 15 Aufrufe … gefunden werden, gefunden 16' und keinen Hinweis darauf, dass die Zahl von Hand nachzuziehen ist (der Hinweis steht nur im Kommentar darüber). Zusammen mit der ebenfalls dokumentierten Doppelvergabe der Namen `r1` und `r3` und der Suche bis zum Dateiende hat die Zusicherung zwei bekannte Fehlalarmwege. Eine Eingrenzung auf den umschliessenden Block (Suche nur bis zum nächsten `pruefeKeinFehlerseiten(`-Treffer statt bis EOF) nimmt beide weg und macht den literalen Sollwert entbehrlich."
  }
]
```

## Eigene Nachmessung des Haupt-Agenten (23.09.2026)

Jeder Befund ist eine Behauptung, bis ich ihn selbst gemessen habe. Ergebnis:
**14 von 14 tragen**, davon drei LATENT (heute folgenlos, die Klasse ist echt)
und einer geringfügig.

| # | Zeile | Kern | Ergebnis |
|---|-------|------|----------|
| A1 | test:660 | Längengleichheit ist Tautologie | **TRÄGT, gemessen** |
| A2 | test:575 | C9-Prädikat ungeprüft → vakuos grün möglich | **TRÄGT, gemessen** |
| A3 | test:548 | C9 sucht nur VORWÄRTS | **TRÄGT** |
| A4 | test:743 | Anker `neu AS (` ohne Existenz-Zusicherung | **TRÄGT, latent** |
| A5 | test:521 | `pool["run"]`/`pool["one"]` laufen durch | **TRÄGT, gemessen** |
| A6 | geraete:2915 | Zeilennummern um 9 falsch | **TRÄGT, gemessen** |
| A7 | test:739 | Ausschnitt statt ganze Datei maskiert | **TRÄGT, latent** |
| A8 | test:643 | Prosa-Immunität in Templates schlechter | **TRÄGT, latent** |
| A9 | test:1676 | finally verschluckt Aufräumfehler | **TRÄGT, gemessen** |
| A10 | test:546 | C9-Selbstscan liest ROH | **TRÄGT** |
| A11 | test:476 | Begründung für den zweiten Reiniger ist FALSCH | **TRÄGT, gemessen** |
| A12 | test:763 | Fixtur 1 prüft anderes Prädikat als der Riegel | **TRÄGT** |
| A13 | test:776 | Fixtur-3-Meldung nennt nur „db" | **TRÄGT** |
| A14 | test:564 | literaler Sollwert + zwei Fehlalarmwege | **TRÄGT, gering** |

### A1 — die Tautologie, mit eigener Gegenprobe belegt

`maskiereKommentare` baut aus `src.split("")` und gibt `out.join("")` zurück —
die Länge ist PER KONSTRUKTION gleich. Gemessen am bewachten Abschnitt:
`14743 → 14743`, `Laenge gleich? true`.

Die Zusicherung ist damit nicht nur wirkungslos, sie ist blind gegen genau die
Klasse, für die sie eingeführt wurde. GEMESSEN mit einer längenerhaltenden
Mutation des Maskers (`return out.join("").replace(/req\.studioId/g, "            ")`):

```
Laenge gleich? (C4-Tautologie): true (14743 / 14743)
includes schreibePruefplan(  : true
Anzahl schreibePruefplan(    : 6
req.studioId noch im Abschnitt: false
nichtLeerraum (Sollwert 2291): 2195
```

Vollständiger Lauf der Testdatei unter dieser Mutation: **TEST_EXIT=0,
29 PASS / 0 FAIL** — jedes `req.studioId` war aus dem Abschnitt gefressen, den
die Datei zu prüfen behauptet, und alle drei C4-Zusicherungen blieben grün.
`nichtLeerraum()` fiel 2291 → 2195, ein literal hingeschriebener Sollwert hätte
also gefangen. Rücknahme gegen unabhängige `cp`-Kopie, `diff` EXIT 0.

**Nebenbefund, der den Riegel ENTLASTET:** Ich hatte befürchtet, der Abzug von
9137 auf 2291 Nicht-Leerraum-Zeichen (75 %) bedeute, dass der Punkt-4-Riegel
einen weitgehend ausgeleerten Abschnitt durchsucht — also vakuos grün ist.
Nachgezählt: von 218 Zeilen werden 143 vollständig geleert, und **alle 143 sind
echte Kommentarzeilen**, keine einzige Codezeile. Der Riegel durchsucht echten
Code. Die Vermutung trägt nicht.

### A2 — das C9-Prädikat fängt nur die exakte Schreibweise

Gemessen gegen `new RegExp(`\\b${r}\\.text\\(\\)`)`:

```
GEFANGEN  "rTest.text()"
DURCH     "rTest.text( )"
DURCH     "rTest\n    .text()"
DURCH     "rTest['text']()"
DURCH     "const { text } = rTest"
```

Die Positivkontrolle deckt die AUFZÄHLUNG der Aufrufer ab (15), nicht das
Prädikat, das den Verstoß erkennen soll.

### A5 — die Klammer-Umgehung steht eine Aliasbildung weiter offen

```
DURCH    pool["run"]("UPDATE x")
DURCH    pool["one"]("SELECT 1")
gefangen pool["query"]("UPDATE x")
gefangen run("UPDATE x")
```

Die Alternative `\[\s*.?query.?\s*\]` kennt nur den Namen `query`.

### A6 — dritte Runde in Folge falsche Zeilennummern

Gemessen im Stand `5735eac`:

```
6614:router.post("/geraetewartung/geraet/bearbeiten/:id", …
6723:            UPDATE wartung_geraete SET name=$1, inventarnummer=$2, notizen=$3, …
```

Der Kommentar nennt `:6605`/`:6714`. **Das ist die dritte Runde in Folge, in der
genau diese zwei Zahlen falsch sind** (vorher `:6524`/`:6633`). Eine Zeilennummer
als Verweis ist in einer Datei, die sich ändert, keine haltbare Angabe — der
Round-7-Auftrag ersetzt sie durch ein SUCHMUSTER.

### A9 — der finally-Block, gemessen

Erster Aufräum-DELETE künstlich zum Scheitern gebracht
(`spalte_gibt_es_nicht`). Ergebnis:

```
Aufräumen (Punkt 1): DELETE FROM wartung_pruefungen fehlgeschlagen: column "spalte_gibt_es_nicht" does not exist
Aufräumen (Punkt 1): DELETE FROM wartung_geraete fehlgeschlagen: … violates foreign key constraint "wartung_pruefungen_geraet_id_fkey"
Aufräumen (Punkt 1): DELETE FROM wartung_kategorien fehlgeschlagen: … violates foreign key constraint "wartung_pruefungen_geraet_id_fkey"
──── 29 PASS / 0 FAIL ────
TEST_EXIT=0
```

Die vom Prüfer vorhergesagte FK-Kette trat genau so ein: ein gescheiterter
Schritt reisst alle drei mit, „Feuerlöscher 8" bleibt in der geteilten
Wegwerf-DB liegen — der Zustand, dessen Vermeidung der Block im Kommentar als
seinen Zweck nennt — und der Lauf meldet grün.

### A11 — die Begründung für den zweiten Reiniger ist nachgemessen falsch

```
ladeBestand\(                      schwach:9  hausstandard:9  IDENTISCH
ladeBestandStreng\(                schwach:4  hausstandard:4  IDENTISCH
ladeBestand\(req\.studioId,        schwach:8  hausstandard:8  IDENTISCH
ladeBestandStreng\(req\.studioId,  schwach:2  hausstandard:2  IDENTISCH
```

Der Kommentar in Zeile 476 begründet das Stehenlassen damit, eine strengere
Bereinigung „würde diese Messung stillschweigend verändern". Sie verändert sie
nicht. Damit trägt der einzige genannte Grund nicht, und nach der Hausregel
„dieselbe Aussage an zwei Orten" wird die zweite Kopie gelöscht.

Das ist ein Lehrbuchfall aus der eigenen CLAUDE.md: **ein Satz der Form „X geht
nicht, weil Y" ist eine TATSACHENBEHAUPTUNG über Y** — und Y war hier nie
gemessen worden. Geschrieben hatte ihn ich selbst.

### A4, A7, A8 — latent, aber echt

* **A4:** im maskierten `geraete.js` steht nur EIN `FOR UPDATE)` (Zeile 2965),
  nämlich das richtige. Verschwände der Anker `neu AS (`, dehnte sich das
  Fenster bis Dateiende aus und träfe trotzdem dasselbe — heute also folgenlos.
  Die Klasse ist echt, sobald irgendwo ein zweites `FOR UPDATE)` entsteht.
* **A7:** `maskiereKommentare(ausschnitt)` und
  `maskiereKommentare(ganzeDatei).slice(…)` liefern heute **byteweise
  dasselbe**. Der Unterschied wird scharf, sobald der Ausschnitt an einer
  Stelle beginnt, an der der Tokenizer-Zustand nicht neutral ist.
* **A8:** gemessen bleibt ein mittiger Kommentar in einem Template-Literal
  VOLLSTÄNDIG stehen: `maskiereKommentare("const s = \`SELECT 1 /* nie db.query() hier */\`;")`
  gibt die Eingabe unverändert zurück. Der bewachte Abschnitt enthält acht
  Backticks (vier Templates); ein künftiger Erklärkommentar darin lässt den
  Riegel an REINER PROSA anschlagen. Heute 0 übriggebliebene `//` im Abschnitt.

### A14 — Fehlalarmwege, gezählt

`r1` und `r3` kommen je ZWEIMAL als Helferargument vor. Zusammen mit der Suche
bis Dateiende ist das ein dokumentierter Fehlalarmweg; er tritt heute nicht auf.
