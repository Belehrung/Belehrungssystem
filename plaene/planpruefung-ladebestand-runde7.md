# Planprüfung Bauauftrag Runde 7 „ladebestand"

## Spur A — `kimi-k3`, Bündel „Auftrag + Testdatei + Hausstandard + bewachte Produktivregion"

Lauf: 1342,5 s, `beendet=stop`, 77.903 ein / 50.417 aus (43.208 Denken).
Zehn Befunde.

# Planprüfung Auftrag Runde 7 „ladebestand"

Geprüft gegen den vollständigen heutigen Stand der Testdatei, `test/rohwert-scan.js` und den gezeigten Ausschnitt von `routes/admin/geraete.js`. Ich fand neun Befunde; die sechs Fragen beantworte ich innerhalb der Befunde (Zuordnung: Frage 1 → Befund 3, Frage 2 → Befunde 1+4, Frage 3 → Befund 5, Frage 4 → Befund 7, Frage 5 → Befund 9, Frage 6 → Befund 3).

---

**1.**
SCHWERE: **hoch** (blockiert die Abnahme: zwei Gegenproben können ihre Wirkung so nicht belegen)
DATEI + ZEILE: Auftragspapier Punkt 1 (Z. 660-Bereich) × Punkt 3 (Gegenprobe 3a) und Punkt 8 (Gegenprobe 8a); Testdatei Z. 654-676
PROBLEM: Die neue Zusicherung `nichtLeerraum(abschnitt) === 2291` steht im Kontrollfluss VOR dem Punkt-4-Riegel und vor der neuen `neu AS (`-Existenz-Zusicherung — jede Gegenprobe, die Code im Abschnitt mutiert (3a: zwei Zeilen einfügen; 8a: `neu AS (` → `nachtrag AS (` im notizZusatz-SQL, das INNERHALB des bewachten Abschnitts liegt), lässt zuerst den 2291-Wächter fallen (3a: +~40 Nicht-Leerraum-Zeichen; 8a: +5), der Lauf bricht dort ab, und Riegel bzw. Existenz-Zusicherung werden nie erreicht — exakt die Isolationsfalle, die der Auftrag bei 3a selbst benennt („sonst fällt die Anzahl-Zusicherung zuerst und isoliert den Riegel nicht"), gegen die neue Mengen-Zusicherung aus Punkt 1 aber nicht bedacht hat; derselbe Mechanismus trifft den 9b-Ganzdatei-Sollwert (fällt bei 8a ebenfalls, Platzierung im Block ist im Auftrag offen).
NACHMESSUNG: Nach dem Bau von Punkt 1 die 3a-Mutation setzen (`pool["run"]("UPDATE x")` als NEUE Zeile in den Abschnitt) und das Log lesen: steht dort die Riegel-Meldung („im PRUEFPLAN_SCHREIBBEREICH steht der Bezeichner…") oder die 2291-Meldung? Erwartung nach heutiger Blockreihenfolge (includes → 2291 → Anzahl 6 → C7 → Riegel → cteNamen → FOR-UPDATE): die 2291-Meldung, der Riegel bleibt unbewiesen. Dasselbe für 8a: die Existenz-Zusicherung wird nicht erreicht.
VORSCHLAG: Im Auftrag die Blockreihenfolge festschreiben — inhaltliche Prädikate VOR den Mengen-Wächtern: (1) `includes('schreibePruefplan(')` [Vorbedingung], (2) Riegel `PRUEFPLAN_VERBOTENES_MUSTER`, (3) C7, (4) `cteNamenTreffer`, (5) Existenz `neu AS (`, (6) FOR-UPDATE, (7) 9b-Code-Anker — und ERST DANACH 2291, Anzahl 6, Ganzdatei-Sollwert. Unter der 1a-Mutation (Masker frisst `req.studioId`) bleibt der Riegel grün (kein verbotenes Muster) und 2291 fällt weiterhin — keine Gegenprobe verliert ihren Beweis. Alternativ: bei 3a/8a die Sollwerte in der Mutation mit anpassen — teurer und fehleranfälliger.

**2.**
SCHWERE: **hoch** (die Behebung öffnet einen heute gefangenen Umgehungsweg — Frage B)
DATEI + ZEILE: Auftragspapier Punkt 3; Testdatei Z. 521 (Muster)
PROBLEM: Der alte Teilausdruck `\[\s*.?query.?\s*\]` fängt `pool[`query`](x)` (Template-Literal als Property-Key), weil `.?` JEDES Zeichen matcht — der neue `\[\s*['"](?:query|run|one|tx|q|pool)['"]\s*\]` verlangt `'` oder `"` und lässt den Backtick durch; `pool[`run`]("UPDATE x")` ist legales JS und ab dieser Behebung ein offener Weg, der heute (zufällig, über die Schlampigkeit) geschlossen ist. R4 wird geschlossen, A5 wird geschlossen, aber ein dritter Weg wird dabei still geöffnet — und die Neun-Proben-Messung im Papier enthält keinen Backtick-Fall.
NACHMESSUNG: `node -e 'const alt=/\[\s*.?query.?\s*\]/; const neu=/\[\s*['\x22"](?:query|run|one|tx|q|pool)['\x22"]\s*\]/; const s="pool[`+"`"+`query`](1)"; console.log("alt:",alt.test(s),"neu:",neu.test(s))'` → erwartet `alt: true neu: false`. Zusätzlich `pool[`+"`"+`run`](1)` gegen beide.
VORSCHLAG: Backtick in beide Zeichenklassen aufnehmen: `\[\s*['"\`](?:query|run|one|tx|q|pool)['"\`]\s*\]`, die Neun-Proben-Tabelle um die zwei Backtick-Zeilen ergänzen und in Gegenprobe 3a eine der beiden Umgehungszeilen als Backtick-Variante setzen. (Dieselbe Lücke steckt im neuen C9-Prädikat aus Punkt 2: `r[`text`]()` wird nicht gefangen — dort ist sie exotischer; mindestens als benannte Grenze wie die Destrukturierung behandeln.)

**3.**
SCHWERE: **mittel** (Antwort auf Frage 1 und Frage 6: für Punkt 9b lautet die Antwort „nein, nicht wert"; für Punkt 1 „ja")
DATEI + ZEILE: Auftragspapier Punkt 9b („ein literaler Sollwert für nichtLeerraum(geraeteOhneKommentare)")
PROBLEM: Der 9b-Sollwert bewacht die GANZE 7000+-Zeilen-Datei und fällt bei JEDER künftigen Code-Änderung an `geraete.js` — auch an Stellen, die mit dem FOR-UPDATE-Block nichts zu tun haben (reine Kommentar- oder Leerraum-Änderungen fallen nicht durch, jede echte Token-Änderung schon). Der gekaufte Schutz ist dünn: Gegenprobe 9b-b (`return src;`) lässt ohnehin andere Wächter der 43 Masker-Nutzer rot werden (Kommentare mit Rohwerten werden mitgezählt, Budgets kippen), und der billige Code-Anker deckt „Code gefressen" bereits ab. Der Preis ist ein rotes Deploy-Gate bei praktisch jedem Beitrag, der `geraete.js` berührt — bei einem Team, das dreimal in Folge Zeilennummern nicht nachgezogen hat (A6), ist ein Wächter, der ständig falsch rot ist, der schnellste Weg, ihn künftig zu ignorieren. Punkt 1 (2291) ist davon zu unterscheiden: der Abschnitt ist klein, sicherheitskritisch und ohnehin reviewpflichtig — dort ist der Literale Hausstil (hashZ2-Präzedenz) und bleibt vertretbar, zumal diese Runde selbst schon SQL im Abschnitt geändert hat und der Wert erneut gemessen wurde.
NACHMESSUNG: Eine legitime Codezeile außerhalb des Abschnitts in `geraete.js` einfügen (z.B. `const PLATZHALTER_KOMMENTAR_FIX = 1;` an einer beliebigen anderen Route), Suite laufen lassen → 9b fällt, kein Defekt liegt vor; Rücknahme. Das ist die zu beantwortende Frage „welche legitime Änderung macht ihn rot" — und sie wird bei jedem zweiten Beitrag eintreten.
VORSCHLAG: Den Ganzdatei-Literalen streichen (das ist meine Antwort auf Frage 6 — der streichbare Punkt) und 9b ersetzen durch: (a) den Code-Anker aus dem Auftrag, (b) einen zweiten Code-Anker, der `req.studioId` ENTHÄLT (z.B. `includes('ladeBestand(req.studioId,')`) — der fängt die 1a-Mutation im Ganzdatei-Weg, (c) die Richtungskontrolle für 9b-b als Ungleichung statt Literal: `nichtLeerraum(geraeteOhneKommentare) < nichtLeerraum(GERAETE_QUELLTEXT_ROH)` (fällt bei `return src;`, kostet bei legitimen Änderungen nichts). Beide Gegenproben 9b-a/9b-b bleiben damit wirksam, kein Sollwert muss je nachgezogen werden. Wird am Literalen festgehalten, MUSS die Meldung das Messkommando und „fällt bei jeder Code-Änderung an geraete.js" enthalten — sonst produziert der Wächter genau die irreführende Meldung, die A14 an anderer Stelle moniert.

**4.**
SCHWERE: **mittel** (Frage 2, zweiter Teil: Punkte 6 und 7 sind einzeln unvollständig, zusammen unbestimmt)
DATEI + ZEILE: Auftragspapier Punkt 6 (Zeile 1792) × Punkt 7; Testdatei Z. 739 (`const geraeteOhneKommentare` innerhalb des Punkt-3-Blocks) und Z. 1792 (Z3-Block)
PROBLEM: `geraeteOhneKommentare` ist block-lokal im Punkt-3/4-Block deklariert (`const` in `{ … }`); die einzige Verwendung des zu löschenden Reinigers, Zeile 1792, liegt in einem ANDEREN Block und kann die Konstante nicht sehen. Punkt 6 sagt nur „auf den maskierten Quelltext umstellen" — nicht woher der kommt; Punkt 7 rechnet mit „beiden Verwendungen" (Z. 643 + 739) und übersieht, dass es nach Punkt 6 DREI Verwendungen der Ganzdatei-Maskierung gibt. Naive Umsetzung wirft einen ReferenceError zur LAUFZEIT — `node --check` in der Abnahme bleibt grün, weil das kein Syntaxfehler ist. Die einzig richtige Reihenfolge lautet deshalb: ERST Punkt 7 (einmal maskieren, auf IIFE-Ebene, sichtbar für alle drei Verwendungen), mit Punkt 6 zusammen, DANN Punkt 1 (Sollwert am finalen Weg messen — nicht am alten, dann ist der im Auftrag vorgesehene Abweichungsfall gar nicht erst möglich), DANACH 9b. Die im Papier nummerierte Reihenfolge (1 vor 7) mit „danach neu messen" reicht für den Sollwert, aber nicht für die Gegenprobe: der 1a-Erwartungswert 2195 ist wegabhängig und wird nirgends neu gemessen.
NACHMESSUNG: `grep -n "geraeteOhneKommentare\|const quelltext" test_feature_ladebestand_streng.js` und die umschließenden Blockgrenzen markieren — Deklaration (Z. 739) und Verwendung (Z. 1792) liegen in verschiedenen Blöcken. Naive Umsetzung (`const quelltext = geraeteOhneKommentare;` an 1792) → `node --check` EXIT 0, aber der Lauf wirft `ReferenceError: geraeteOhneKommentare is not defined`.
VORSCHLAG: Im Auftrag festschreiben: die einmalige Ganzdatei-Maskierung steht auf IIFE-Ebene VOR dem Punkt-3-Block; Abschnitt per `.slice(zeilenbeginnNachMarke, ende)` daraus (Punkt 7), FOR-UPDATE/9b und Z3 (Punkt 6) bedienen sich derselben Konstanten; Punkte 6+7 als EIN Schritt, danach erst 1 und 9b (Messung am finalen Weg).

**5.**
SCHWERE: **mittel** (Frage 3: der neue Zustand ist, dass der C9-Block erstmals im eigenen Trefferraum liegt)
DATEI + ZEILE: Auftragspapier Punkt 2 (Positivkontrolle „gegen eine synthetische Verletzungszeichenkette"); Testdatei Z. 546-580
PROBLEM: Durch A3 (Suche über die ganze Datei statt vorwärts ab Aufruf) liegt der C9-Block — der bisher VOR allen Aufrufen stand und nie im Suchfenster war — erstmals im Trefferraum des eigenen Scans. Die neu zu bauende synthetische Verletzungszeichenkette liegt als Zeichenkette in eben dieser Datei, und Zeichenketten werden von `maskiereKommentare()` NICHT geleert. Zwei dauerrote Endzustände sind damit eine Umbenennung entfernt: (a) trägt die synthetische Verletzung einen der 15 echten Aufrufernamen (z.B. `await rAusloesen.text();`), schlägt die Verstoß-Zusicherung an der eigenen Fixtur an; (b) enthält die Fixtur das Aufrufmuster `pruefeKeinFehlerseiten(<name>` (etwa um einen vollständigen fiktiven Block nachzubilden), zählt die Positivkontrolle 16 statt 15 und ERWARTETE_HELFERAUFRUFE kippt. Der Auftrag spezifiziert die Fixtur nicht („wie sie Fixtur 4 für den Masker schon hat" — Fixtur 4 liegt im Scanbereich einer ANDEREN Datei, geraete.js, deshalb stellt sich die Frage dort nicht).
NACHMESSUNG: Nach dem Bau von Punkt 2 die Fixtur einmal absichtlich mit einem echten Aufrufernamen formulieren (`await r1Z1.text();`) → die Verstoß-Zusicherung MUSS anschlagen, obwohl kein Defekt vorliegt; danach eine Fixtur, die `pruefeKeinFehlerseiten(rFiktiv` enthält → die Positivkontrolle muss mit „gefunden 16" fallen. Beides belegt die Kollision; die zulässige Fixtur muss beide Fallen vermeiden.
VORSCHLAG: Im Auftrag drei Bedingungen an die Fixtur festschreiben: fiktiver Bezeichner, der garantiert kein Aufrufer ist und es nie wird (z.B. `rC9SynthetischNiemals`); die Fixtur darf die Zeichenfolge `pruefeKeinFehlerseiten(` NICHT enthalten; ein Kommentar an der Fixtur, der beide Kollisionen benennt (sonst „repariert" die nächste Runde den künstlichen Namen in einen realistischen). Zusätzlich Befund A14 zu Ende bringen (s. Befund 6), weil die 15 trotzdem bleibt.

**6.**
SCHWERE: **niedrig** (A14 nur halb umgesetzt)
DATEI + ZEILE: Auftragspapier Punkt 2/A14; Testdatei Z. 564-568
PROBLEM: Befund A14 benennt ZWEI Fehlalarmwege — die Doppelvergabe r1/r3 (wird durch die Umbenennung geschlossen) UND den literalen Sollwert 15 mit irreführender Meldung beim legitimen 16. Aufrufer („keinen Hinweis darauf, dass die Zahl von Hand nachzuziehen ist — der Hinweis steht nur im Kommentar"). Der Auftrag schließt nur den ersten Weg; die Meldung bleibt wortgleich ohne Nachzieh-Hinweis — genau der beanstandete Zustand, jetzt aber als „umgesetzt" deklariert.
NACHMESSUNG: Einen 16. legitimen Aufruf `await pruefeKeinFehlerseiten(rNeu, ABBRUCH_MARKER, 'x');` ergänzen → Lauf rot, Meldung lesen: „es müssen 15 Aufrufe … gefunden werden, gefunden 16" ohne jeden Hinweis, was zu tun ist. Rücknahme.
VORSCHLAG: Eine Zeile: die Meldung um „— bei einer bewussten Ergänzung eines Aufrufers ist diese Zahl nachzuziehen" ergänzen (Vorbild: die Meldung der schreibePruefplan-Anzahl in Z. 668 trägt genau diesen Hinweis bereits). Damit ist A14 vollständig und konsistent zum Hausstil.

**7.**
SCHWERE: **niedrig** (Frage 4: die Unterscheidung IST sauber herstellbar — aber nicht so, wie der Auftragstext sie umschreibt)
DATEI + ZEILE: Auftragspapier Punkt 5 („Wichtig, damit die Behebung nichts verschlimmert"); Testdatei Z. 1676 ff.
PROBLEM: Im finally selbst ist „Erfolgspfad/Fehlerpfad" NICHT sauber herstellbar — ein finally weiß nicht, ob der try warf; ein `assert` IM finally würde den Originalfehler verdrängen, und ein Erfolgs-Flag ist der fehleranfällige Umweg. Die saubere Konstruktion ist die POSITION: die Zusicherung gehört NACH das gesamte try/finally-Konstrukt. Dann liefert der Kontrollfluss die Unterscheidung gratis: ein Wurf im try propagiert nach dem finally weiter, die Zusicherung dahinter wird nie erreicht (Originalfehler bleibt maßgeblich, Aufräumfehler sind nur console.error), auf dem Erfolgspfad wird sie erreicht und fällt. Der Auftrag sagt „Nach dem Block eine echte Zusicherung" — trifft die Lösung also implizit —, der Absatz „Läuft der finally nach einem geworfenen Fehler…" liest sich aber, als müsse die Unterscheidung IM finally gebaut werden; ein Ausführender, der das wörtlich nimmt, baut das Flag oder das assert an die falsche Stelle. Außerdem verlangt Gegenprobe 5a „eine Meldung, die alle drei gescheiterten Schritte nennt" — dafür reicht ein Zähler nicht, es muss ein Array der Fehlermeldungen gesammelt werden; „einen Zähler führen" ist im Auftrag die Leitformulierung.
NACHMESSUNG: Drei Läufe: (a) Erfolgspfad + `spalte_gibt_es_nicht` im ersten DELETE → EXIT 1, Meldung nennt alle drei Schritte; (b) Fehlerpfad: eine Zusicherung im try brechen UND denselben Aufräumdefekt → EXIT 1, und die FEHLGESCHLAGEN-Zeile zeigt den ORIGINALFEHLER des Tests, nicht einen Aufräumfehler; (c) unverändert → EXIT 0. Fall (b) ist der, den nur die Positionslösung richtig macht.
VORSCHLAG: Im Auftrag festnageln: „Die Zusicherung steht NACH dem try/finally-Block, nicht im finally; im finally wird nur gezählt/gesammelt und protokolliert. Die Zusicherung gibt das gesammelte Fehler-Array aus (nicht nur die Anzahl)."

**8.**
SCHWERE: **niedrig** (Gegenprobe 6b ist ohne Einfügestelle nicht eindeutig erfüllbar)
DATEI + ZEILE: Auftragspapier Punkt 6, Gegenprobe 6b
PROBLEM: Der einzufügende mittige Blockkommentar mit `ladeBestand(req.studioId,` muss im CODE-Kontext von `geraete.js` stehen. In einem Template-Literal überlebt ein mittiger Kommentar auch den Hausstandard (das ist exakt Befund A8, den Punkt 10 nur benennt statt behebt) — setzt das Mutationsskript den Kommentar dorthin, steigt die Z3-Zählung unter dem NEUEN Reiniger weiterhin auf 9, und die geforderte „Nachher"-Richtung („sie MUSS grün bleiben") ist unerfüllbar: die Gegenprobe scheitert an der falschen Einfügestelle, nicht an der Behebung.
NACHMESSUNG: Den Kommentar einmal in ein Template-Literal von geraete.js setzen (z.B. in einen gerenderten HTML-Block): alter Reiniger → Z3 zählt 9, rot ✓; Hausstandard → Z3 zählt WEITERHIN 9 (A8-Verhalten, an der Eingabe `const s = \`…/* … */\`` im Befund A8 selbst nachmessbar), „nachher grün" scheitert. Dieselbe Probe im Code-Kontext (z.B. direkt über einer der acht milden Aufrufstellen) → nachher grün ✓.
VORSCHLAG: Die Einfügestelle im Auftrag festlegen („mittiger Blockkommentar in einer Codezeile außerhalb von Template-Literalen, z.B. unmittelbar über dem Dashboard-Aufruf `ladeBestand(req.studioId, …)`") und im Mutationsskript die Fundstellen-Prüfung (Abbruch bei ≠ 1) entsprechend verankern.

**9.**
SCHWERE: **niedrig** (Frage 5: die legitimen Zeilen, die der NEUE Ausdruck fälschlich verbietet)
DATEI + ZEILE: Auftragspapier Punkt 3; Testdatei Z. 521
PROBLEM: Konkret neue Sperren gegenüber dem alten Ausdruck: (a) Die Klammer-Alternative `\[\s*['"](?:query|run|one|tx|q|pool)['"]\s*\]` verlangt KEINE aufrufende Klammer dahinter — reine LESEZUGRIFFE wie `req.body['q']` (Suchfeld!), `row['tx']`, `params['one']`, `daten['run']`, `config['pool']` werden neu verboten, ohne dass ein Datenbankaufruf vorläge (für `query` galt das schon alt — `req.body['query']` war bereits gesperrt —, für die fünf neuen Namen ist es neu). (b) `\bq\s*\(` sperrt einen künftigen lokalen Helfer `const q = …; q(…)` im Abschnitt auch dann, wenn er nichts mit der Datenbank zu tun hat. (c) In den vier SQL-Templates des Abschnitts (die der Masker nicht bereinigt, A8) entsteht gegenüber dem alten Ausdruck keine NEUE Sperre — die dortige Prosa-Gefahr (`\bdb\b` in einem SQL-Kommentar) trug schon der alte Ausdruck und ist Gegenstand von Punkt 10.
NACHMESSUNG: `node -e 'const m=/\bdb\b|\.\s*query\s*\(|\[\s*['\x22"](?:query|run|one|tx|q|pool)['\x22"]\s*\]|\b(?:run|one|tx|q|pool)\s*\(/; for (const s of ["const s = req.body['q'];","const t = row['tx'];","const n = params['one'];"]) console.log(m.test(s), s)'` → dreimal `true`, ohne Aufruf, ohne DB.
VORSCHLAG: Die Klammer-Alternative um eine aufrufende Klammer schärfen: `\[\s*['"\`](?:query|run|one|tx|q|pool)['"\`]\s*\]\s*\(` (deckt auch `pool["query"] (x)` mit Leerzeichen ab, lässt `req.body['q']`-Lesefälle frei) — oder die Lese-Sperre als bekannte Grenze benennen, wie es Punkt 2 für die Destrukturierung vormacht. Die `\bq\s*\(`-Kante ist als Konventionswächter hinnehmbar (lokale Ein-Buchstaben-Helfer sind im Abschnitt ohnehin nicht erwünscht) und sollte in der Riegel-Meldung namentlich bleiben, damit ein Fehlalarm richtig gelesen wird.

**10.**
SCHWERE: **niedrig**
DATEI + ZEILE: Auftragspapier Punkt 9 (der neue Kommentar für `routes/admin/geraete.js:2915`)
PROBLEM: Der neue Kommentar enthält das erste Suchmuster wörtlich im grep-Kommando — `grep -n 'router.post("/geraetewartung/geraet/bearbeiten/:id"'` findet künftig ZWEI Zeilen: die Route (6614) und den Kommentar selbst (der das Muster unmaskiert als Kommentartext trägt). Der Suchende landet damit zuerst auf dem Kommentar, der ihm sagt, wo er suchen soll — Zirkelschluss. Das zweite Muster (`UPDATE wartung_geraete SET name=\$1`) ist davon frei, weil der Backslash im Kommentar den Selbsttreffer verhindert.
NACHMESSUNG: Nach dem Bau `grep -n 'router.post("/geraetewartung/geraet/bearbeiten/:id"' routes/admin/geraete.js` ausführen → zwei Treffer statt einer.
VORSCHLAG: Im Kommentar das Muster so verzerren, dass es sich nicht selbst findet (z.B. `grep -n 'geraetewartung/geraet/bearbeiten'` — ohne `router.post("`-Präfix) oder mit eckiger Klammer: `grep -n 'router\.post("/geraetewartung/geraet/bearbeiten'`), und beide Kommandos nach dem Einfügen einmal ausführen und die Trefferzahl (je 1) in den Bau-Bericht schreiben — das kostet zwei Zeilen und schließt die Selbsttreffer-Klasse, die der Auftrag mit dem Wechsel auf Suchmuster gerade erst einführt.

---

## PRÜFGRENZE

* **Der vollständige `geraete.js`-Bestand außerhalb der Zeilen 2700-3000 lag mir nicht vor.** Ich konnte nicht verifizieren, dass der 9b-Code-Anker `router.post("/geraetewartung/brandschutz"` wörtlich existiert (der Auftrag formuliert ihn mit „etwa" — der Ausführende muss ihn messen; mein Befund 3 ist davon unabhängig, weil er die FORM der Kontrolle betrifft, nicht den Anker). Ebenso konnte ich die genaue Position der `PRUEFPLAN_SCHREIBBEREICH_ENDE`-Marke und damit beweisen, dass das `neu AS (`-SQL und der Kommentar Z. 2915 INNERHALB des Abschnitts liegen — beides folgt aber zwingend aus dem gezeigten Text (BEGINN bei ~2773, das notizZusatz-SQL mit `FOR UPDATE` bei ~2965, ENDE im gezeigten Ausschnitt nach der Schleife); Befund 1 (8a-Kollision) hängt daran und ist anhand des gezeigten Ausschnitts nachvollziehbar.
* **`core/db.js` und `test/run.sh` lagen nicht vor** — die Exportliste (`pool, q, one, run, tx`) habe ich aus dem Papier und den Aufrufen in der Testdatei (`db.q`, `db.one`, `db.run`, `db.pool`, `db.createStudio`, `db.provisionStudio`, `db.init`) als konsistent angenommen, nicht selbst gezählt.
* **Die genauen Blockgrenzen der Testdatei** (Befund 4) habe ich aus dem vollständig gegebenen Text abgeleitet: der Punkt-3-Block öffnet mit `{` nach der C9-Prüfung und schließt nach dem FOR-UPDATE-`ok(...)` mit `}`; `geraeteOhneKommentare` ist darin deklariert; der Z3-Block mit Zeile 1792 folgt separat. Das ist anhand des gelieferten Textes verifizierbar, nicht geraten.
* **Ob die synthetische C9-Fixtur im finalen Bau kollidiert** (Befund 5), hängt von einer Formulierung ab, die das Papier bewusst offen lässt — ich habe den Zustand benannt, nicht eine konkrete Zeile bemängelt.

---

## Eigene Nachmessung des Haupt-Agenten (23.09.2026)

**Alle zehn tragen.** Zwei mit Einschränkung, und eine davon ist wichtig: bei
Befund 10 trägt der BEFUND, aber der vorgeschlagene BEHEBUNGSWEG nicht.

| # | Kern | Ergebnis |
|---|---|---|
| 1 | Zusicherungs-Reihenfolge: der neue Mengen-Wächter steht VOR dem Riegel | **TRÄGT** |
| 2 | Backtick-Property-Key: meine Behebung öffnet `pool[`query`]` | **TRÄGT im Kern, Behauptung zu weit** |
| 3 | 9b-Literal für die ganze Datei ist zu spröde | **TRÄGT** (hatte ich selbst korrigiert; sein Vorschlag ist besser) |
| 4 | `geraeteOhneKommentare` ist blocklokal → ReferenceType zur Laufzeit | **TRÄGT** |
| 5 | Der C9-Block liegt erstmals im eigenen Trefferraum | **TRÄGT** |
| 6 | A14 nur halb umgesetzt: Meldung ohne Nachzieh-Hinweis | **TRÄGT** |
| 7 | `finally`: POSITION statt Flag, und 5a braucht ein Array | **TRÄGT, besser als mein Vorschlag** |
| 8 | Gegenprobe 6b ist an der falschen Einfügestelle unerfüllbar | **TRÄGT** |
| 9 | Die neue Klammer-Alternative verbietet reine LESEzugriffe | **TRÄGT** |
| 10 | Das grep-Kommando im Kommentar findet sich selbst | **TRÄGT — Behebung NICHT** |

### Befund 1 — die Reihenfolge, gemessen

Die sieben Zusicherungen des Blocks stehen heute so:

```
1 includes('schreibePruefplan(')        ← Vorbedingung
2 Längengleichheit                      ← hier käme nichtLeerraum === 2291
3 Anzahl 6
4 kein BEGINN-Marker
5 PRUEFPLAN_VERBOTENES_MUSTER           ← DER RIEGEL
6 cteNamenTreffer
7 FOR UPDATE
```

`assert` wirft beim ersten Verstoss. Ein Mengen-Wächter auf Position 2 fällt
also VOR dem Riegel auf Position 5 — und die Gegenproben 3a (zwei Zeilen
einfügen) und 8a (`neu AS (` umbenennen) verändern beide den Abschnitt.
Sie hätten am Mengen-Wächter rot gemeldet und den Riegel nie erreicht.
**Genau die Isolationsfalle, die mein eigener Auftrag bei 3a benennt und bei
Punkt 1 nicht bedacht hat.**

### Befund 2 — trägt im Kern, die Behauptung ist zu weit

Kimi schreibt, der ALTE Ausdruck fange `pool[`run`]("UPDATE x")`. Gemessen:

```
ALT: gefangen  NEU: DURCH      pool[`query`](1)
ALT: DURCH     NEU: DURCH      pool[`run`]("UPDATE x")
ALT: DURCH     NEU: DURCH      pool[`one`](1)
```

Nur bei `query` ist es ein **Regress meiner Behebung** (`.?` matcht den
Backtick, meine Zeichenklasse nicht). Bei `run` und `one` war der Weg schon
vorher offen; meine Behebung verschlechtert dort nichts, sie schliesst ihn
bloss auch nicht. Der Kern trägt, die Reichweite nicht.

### Befund 9 — gemessen

```
ALT: DURCH     NEU: gefangen   const s = req.body['q'];
ALT: DURCH     NEU: gefangen   const t = row['tx'];
ALT: DURCH     NEU: gefangen   const n = params['one'];
```

Meine Klammer-Alternative verlangt keine aufrufende Klammer — drei reine
Lesezugriffe wären neu verboten.

### Die Behebung für 2 + 9 zusammen, gemessen: 15 von 15

```
\bdb\b|\.\s*query\s*\(|\[\s*['"`](?:query|run|one|tx|q|pool)['"`]\s*\]\s*\(|\b(?:run|one|tx|q|pool)\s*\(
```

Acht Fangfälle gefangen (inkl. beider Backtick-Formen und `pool["query"] (x)`
mit Leerzeichen), sieben Durchlassfälle durch, **0 Abweichungen**, und am
heutigen Abschnitt schlägt er nicht an. Damit sind A5, R4, Befund 2 und
Befund 9 mit EINEM Ausdruck geschlossen.

### Befund 4 — gemessen

`const geraeteOhneKommentare` steht auf Zeile 739, im Block **590–746**.
`const quelltext = GERAETE_QUELLTEXT_OHNE_KOMMENTARE` steht auf Zeile 1792,
im Block **1788–…**. Verschiedene Blöcke — die naive Umsetzung von Punkt 6
ergäbe einen `ReferenceError` zur LAUFZEIT, und `node --check` bliebe grün.

### Befund 5 — gemessen

```
Eingabe : const fixtur = "await rAusloesen.text();";
maskiert: const fixtur = "await rAusloesen.text();";
```

`maskiereKommentare` leert ZEICHENKETTEN nicht. Eine synthetische
Verletzungs-Fixtur für das C9-Prädikat läge damit im Trefferraum des eigenen
Scans, sobald Punkt 2 die Suche auf die ganze Datei erweitert.

### Befund 10 — der Befund trägt, die BEHEBUNG nicht

Gemessen an einer Probedatei mit dem vorgeschlagenen Kommentar:

```
Muster 1 Treffer: 2      ← der Kommentar findet sich selbst
Muster 2 Treffer: 1      ← der Backslash rettet es
Kimis Vorschlag  : 2     ← behebt es NICHT
```

Sein Alternativvorschlag (`grep -n 'geraetewartung/geraet/bearbeiten'`) trifft
den eigenen Kommentar genauso. Was trägt, ist der Klammertrick, den wir aus
demselben Grund schon bei `GEGENPROBE-`+`DEFEKT` benutzen:

```
Klammertrick Muster 1: 1 Treffer, Zeile 3 (die Route)
Klammertrick Muster 2: 1 Treffer, Zeile 4 (das UPDATE)
```

also `bearbeite[n]` und `name=[$]1` im Kommentar.

**Das ist zum fünften Mal in Folge dieselbe Lehre:** der Befund einer Prüfspur
ist eine Behauptung, und ihr Behebungsvorschlag ist eine ZWEITE, die
unabhängig gemessen gehört. Hier war die erste richtig und die zweite falsch.
