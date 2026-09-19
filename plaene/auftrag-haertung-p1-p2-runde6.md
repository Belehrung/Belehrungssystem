# Auftrag — Härtung P1+P2, Runde 6 (klein, genau EINE Zusicherung)

**Zweig:** `claude/haertung-p1-p2` im Repo `/home/user/gymdocu`, Kopf `27241c1`.
Von mir geprüft: Suite `SUITE_EXIT=0`, 0 FAIL, Dateizahl-Ritual **335 = 335**
mit `diff` EXIT 0, `npm run lint` EXIT 0, Marker 6.

**Einordnung: NICHT sehr komplex.** Eine einzige Zusicherung, deren Prämisse
ich selbst gemessen habe. Standard-Executer, kein Fable.

## Der Befund

`server.js:164-168` trägt die Body-Härtung:

    // ── 2b) Body-Härtung (WICHTIG – nicht entfernen!) ──────────────
    app.use((req, res, next) => {
        if (req.body == null || typeof req.body !== 'object') req.body = {};
        next();
    });

**Von mir gemessen:** ohne sie ist `req.body` in Express 5.2.1 `undefined`,
sobald kein Body-Parser gegriffen hat (roh ohne Content-Type, multipart,
text/plain); mit ihr ist es `{}`. **206 `req.body.x`-Zugriffe in `routes/`
verlassen sich darauf**, nur 12 tragen selbst `|| {}`.

Diese eine Zeile trägt eine Warnung im Kommentar — und ist von NICHTS bewacht.
Wer sie beim Aufräumen entfernt, bekommt einen grünen Lauf und eine
Anwendung, die bei jeder Anfrage ohne passenden Content-Type 500 antwortet.

**Das ist dieselbe Klasse wie R2 aus Runde 5** (der fehlende Nachweis, dass
`csrfSchutz` überhaupt eingehängt ist), und die haben wir gerade geschlossen.

## Was zu bauen ist

In `test_feature_csrf_ausnahmen_waechter.js` — er parst `server.js` bereits
als Syntaxbaum und klassifiziert diese Registrierung als Topf M.

Eine Zusicherung nach dem Vorbild der bestehenden csrfSchutz-Zusicherung
(R2, gleiche Datei), die zusichert:

1. Die Body-Härtung ist **genau einmal** registriert, **pfadlos** per
   `app.use()`, **unbedingt** (nicht in einer Funktion, nicht hinter einer
   Verzweigung).
2. Sie liegt **NACH beiden Body-Parsern** (`express.urlencoded` und
   `express.json`) — vorher hätte sie keine Wirkung, weil die Parser `req.body`
   danach wieder setzen.
3. Sie liegt **VOR `csrfSchutz`** und vor jeder Registrierung, die `req.body`
   liest.

**Wie du sie ERKENNST, ist die eigentliche Frage** — sie ist ein anonymes
Funktionsliteral, also nicht über einen Bezeichner identifizierbar wie
`csrfSchutz`. Miss, welcher Weg trägt, und schreib die Grenze in den
Kommentar. Ein Vorschlag, kein Befund: über den Syntaxbaum die Gestalt des
Funktionsrumpfs prüfen (eine `if`-Anweisung, die `req.body` auf ein Objekt
prüft und zuweist). **Wenn du einen besseren Weg misst, nimm ihn und sag es.**

**Wenn du misst, dass es keinen tragfähigen Weg gibt**, ohne die Zusicherung
an eine beliebige Formatierung zu binden: sag das und baue sie NICHT. Eine
Zusicherung, die bei jeder Umformulierung rot wird, wird abgeschaltet statt
gelesen — das ist schlechter als keine.

## Gegenproben (Pflicht, beide Richtungen)

1. **Die Härtung ganz entfernen** → muss ROT werden, mit einer Meldung, die
   sagt, was fehlt.
2. **Die Härtung VOR die Parser verschieben** → muss ROT werden (Punkt 2).
3. **Positivkontrolle:** sauberer Baum GRÜN.
4. **Und die wichtigste:** eine harmlose UMFORMULIERUNG derselben Härtung
   (etwa `if (!req.body || typeof req.body !== 'object')` statt
   `req.body == null || …`) darf NICHT rot werden. Miss das. Wird sie rot,
   ist die Zusicherung zu eng und du sagst es, statt sie so zu lassen.

Regeln unverändert: Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei
≠ 1 Treffer, Marker (`GEGENPROBE-` + `DEFEKT`) in derselben Zeile,
`node --check` vor dem Lauf, Rücknahme ausschliesslich über eine per `cp`
beiseitegelegte Kopie mit `diff` EXIT 0.

## Pflichten

Früh committen und pushen. Volle Suite selbst fahren
(`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`, ohne Pipe, ohne
äusseres `flock`), währenddessen keine Dateien ändern. `npm run lint` fahren
und WÖRTLICH melden. Dateizahl-Ritual als Mengenvergleich, mein
Vergleichswert: **335 = 335**. Marker-Scan vor jedem Commit (Sollwert 6).
Einzelläufe brauchen eine Wegwerf-DB auf `_test`, danach `dropdb`.

**Ausdrücklich NICHT zu bauen** (bleibt als datierter offener Punkt):

- ein E2E-Nachspiel des gerenderten Formulars (Seite → POST → Mail),
- der Rückfalltext der Wartungsmail ohne `basis_url`,
- ein bleibender Unit-Test für `pruefePdfRootSicher`.

Dies ist die LETZTE Runde dieses Beitrags, was das BAUEN angeht — das ist eine
Grenze an meinem eigenen Verhalten, keine Vorhersage über deine Befunde. Was
du findest, meldest du trotzdem vollständig.
