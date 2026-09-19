# Nacharbeit zum Streaming-Umbau — sechs Befunde, alle selbst nachgemessen

Repo `/home/user/Belehrungssystem`, Zweig `claude/gym-docu-codo-access-4q3bn0`,
Stand `eaac8d5`. Der vollständige Prüfbericht steht in `ASTRA-LAEUFE.md` unter
„19.09.2026 — der Lauf, der zugleich sein eigener Prüfstand war".

**Der Kern in einem Satz: der Beitrag gegen falsch-grüne Zusicherungen hat
vier falsch-grüne Zusicherungen ausgeliefert.** Jede davon habe ich selbst
mutiert und jedes Mal **99 Haken / 0 Kreuze, EXIT 0** gemessen. Das ist kein
Vorwurf — es ist die Klasse, die genau deshalb so teuer ist.

## N1 (blockierend) — der Einmal-Riegel ist nicht bewacht und deckt den Request nicht

**Gemessen:** `const abschliessen = (fn) => { fn(); };` (Riegel komplett
entfernt) → **99/99, EXIT 0.** Die Zusicherung heisst
`GP7 NORMALER end-DANN-close LOEST GENAU EINMAL AUF` und kann nicht fallen.

**Ursache, und sie ist der eigentliche Punkt:** eine native Promise schluckt
ein zweites `reject()` nach einem `resolve()` lautlos. Wer den ENDZUSTAND der
Promise prüft, kann einen Settle-VERSUCH von zwei nie unterscheiden. Die
Zusicherung misst die falsche Grösse.

Dazu die zweite Hälfte: `abschliessen` entsteht erst IM Response-Callback,
`anfrage.on('error', ablehnen)` läuft vollständig daran vorbei.

**Zu bauen:**
* `fertig`/`abschliessen` in den ÄUSSEREN Promise-Executor, und **jeder**
  Abschluss läuft darüber — auch `anfrage.on('error', …)` und der
  `timeout`-Zweig.
* Die Zusicherung zählt **Settle-VERSUCHE**, nicht den Endwert. Ein Zähler im
  Riegel oder `process.on('multipleResolves', …)` — was du wählst, begründe
  im Kommentar.
* Der Stub muss Request-Listener SPEICHERN (heute: `on() { return this; }`
  verwirft sie) und gezielt `error`/`timeout` auslösen können.

**Gegenprobe:** Riegel entfernen muss die neue Zusicherung rot machen.
Zusätzlich: nach einem regulären `end` den Request-`error` auslösen — das
muss genau EINEN Settle-Versuch ergeben.

## N2 (mittel, war als blockierend gemeldet) — der Stub bildet einen Abbruch falsch nach

**Die gemeldete Folgerung trägt NICHT, und das ist gemessen.** Gemeldet war,
der fehlende `aborted`-Listener im Nicht-200-Zweig lasse Fehlerantworten
hängen. An einem echten lokalen Node-22-Server, der nach einem 400er den
Socket zerstört, ist die Ereignisfolge **`aborted` → `error` → `close`** —
und `error` wie `close` sind dort registriert. In Produktion hängt nichts.

**Was wirklich dahintersteckt, ist wichtiger:** der Stub sendet bei
`abgebrochen` **nur** `aborted` und kehrt zurück (`:1589`). Diese Folge
erzeugt echtes Node nie. Die Abbruchfälle prüfen also gegen einen
Transportzustand, den es nicht gibt — dieselbe Krankheit wie beim alten
JSON-Block-Stub, eine Ebene feiner.

**Zu bauen:**
* Der Stub sendet bei `abgebrochen` die GEMESSENE Folge `aborted` → `error`
  → `close`, mit der Messung im Kommentar.
* **Danach GP7A neu beurteilen und den Befund MELDEN, nicht stillschweigend
  reparieren:** mit der echten Folge fängt vermutlich schon `error` oder
  `close` den Fall, und GP7A bliebe auch OHNE den `aborted`-Listener grün.
  Miss das und sag, was herauskommt. Wenn GP7A damit nichts mehr bewacht,
  braucht es eine andere Zusicherung — oder den ehrlichen Vermerk, dass
  `aborted` allein nicht isoliert prüfbar ist.
* `aborted` zusätzlich im Nicht-200-Zweig registrieren (eine Zeile,
  Symmetrie ist billiger als die Begründung ihres Fehlens).

## N3 (mittel) — `GP2_BYTES` bezieht seinen Sollwert aus der bewachten Fixtur

`const GP2_BYTES = Buffer.byteLength(gp2Text, 'utf8')` (`:2521`). Der
Kommentar daneben verrät den Denkfehler selbst: „unabhängiges
`Buffer.byteLength`, NICHT der SSE-Parser" — unabhängig vom PARSER ist nicht
unabhängig von der FIXTUR. Mein Auftragsblatt hatte hier ausdrücklich
LITERALE verlangt; `GP2_DATENZEILEN` und `GP2_LETZTER_TYP` sind welche, die
Bytezahl nicht.

**Zu bauen:** `const GP2_BYTES = 116;` — von Hand nachzählen, nicht
abschreiben, und die Zahl im Kommentar herleiten.
**Gegenprobe:** ein Byte an die Fixtur → die Zusicherung MUSS rot werden.

## N4 (mittel) — die effort-Zusicherung prüft die FORM statt des WERTES

**Gemessen:** `EFFORT` von `'xhigh'` auf `'low'` → **99/99, EXIT 0.** Geprüft
wird `typeof === 'string' && length > 0`.

**Zu bauen:** gegen den erwarteten Wert prüfen, und zwar gegen eine Quelle,
die NICHT dieselbe Konstante ist — `process.env.GEGENLESER_EFFORT || 'xhigh'`
literal in der Zusicherung wiederholt, mit einem Kommentar, warum die
Wiederholung hier Absicht ist.
**Gegenprobe:** `EFFORT` auf `low` → muss rot werden.

## N5 (mittel) — GP10 prüft Brief-INHALT und Diff nicht

GP10 sucht nur nach `--zweck` und dem Brief-DATEINAMEN. Eine einzeilige
Produktionsmutation

    metadata: { ...metadatenBauen(), zweck: verlauf[0].content.slice(0, 500) },

kopierte Auftrag und Diff in die Metadaten und bliebe grün. Das ist eine
Lücke in MEINER GP10-Vorgabe, nicht in deiner Umsetzung.

**Zu bauen:** auffällige Marker auch in den Brief-INHALT und in das
Diff-Material, und keiner davon darf in `metadata` auftauchen. Dazu die
Metadaten-WERTE wörtlich prüfen (`werkzeug`, `zweck` fest; `datum` gegen die
Datumsform), nicht nur die Schlüsselmenge.
**Gegenprobe:** die obige Mutation einsetzen → muss rot werden.

## N6 (niedrig) — ein Ereignis NACH dem Abschluss wird still akzeptiert

Abgelehnt wird nur ein zweites Ereignis aus der Abschlussmenge. Ein
gewöhnliches `response.output_text.delta` NACH `response.completed` wird
angenommen, und am Stromende gilt der frühere Abschluss als sauberes
Ergebnis — eine beschädigte Reihenfolge wird still normalisiert.

**Gemessen:** in drei echten Strömen steht nach `response.completed` **keine**
weitere `data:`-Zeile. Es ist also Härtung, kein lebender Defekt — aber es
ist billig und dient direkt unserer Regel gegen stille Normalisierung.

**Zu bauen:** nach einem Abschluss lehnt jede weitere `data:`-Nutzlast ab.
**Positivkontrolle:** Abschluss gefolgt nur von Leerzeilen bleibt erfolgreich.

## NICHT zu bauen — Entscheidung des Haupt-Agenten

**Alleinstehendes CR als SSE-Zeilenende** (gemeldet als „sollte behoben
werden"). Die SSE-Spezifikation erlaubt es, aber gemessen über drei echte
Ströme: **null CR, nicht einmal CRLF.** Gegen diesen Endpunkt ist es nicht
erreichbar, und ein Umbau des Zeilentrenners auf `\r\n|\r|\n` riskiert einen
NEUEN Fehler an der Chunk-Grenze — genau die Klasse, die wir gerade behoben
haben. Wird als datierter offener Punkt in `plaene/STAND.md` festgehalten,
nicht gebaut. Fass den Zeilentrenner nicht an.

## Regeln

Wie gehabt: Mutationsskripte mit Zielpfad als ARGUMENT, Abbruch bei ≠1
Fundstelle, Marker aus zwei Teilen zusammengesetzt, `node --check` davor,
Rücknahme nur gegen eine `cp`-Kopie mit `diff` EXIT 0, Rücknahme nie mit
einem Testlauf verkettet. Bei jedem GRÜNEN Ergebnis zuerst prüfen, ob die
Mutation überhaupt angekommen ist.

`ERWARTETE_FAELLE` von Hand hochziehen. `npm run lint` gibt es hier nicht
(kein `package.json` im Repo) — gemessen, nicht anwendbar.

Abnahme: `node --check`, `--selbsttest` EXIT 0, dazu die fünf weiteren
CI-Schritte aus `.github/workflows/ci.yml` (hooks-pruefen.sh,
zweitmeinung --selbsttest, `sh -n` auf den SessionStart-Hook,
session-start-hook-pruefen.sh, `jq -e .` auf settings.json).

**Committe und pushe, bevor du auf irgendetwas wartest.** Und wenn eine
meiner Vorgaben sich beim Messen als falsch erweist: sag es und bau sie
nicht — bei N2 rechne ich ausdrücklich damit.
