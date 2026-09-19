# Auftrag: `tools/gegenleser-repo.js` auf Streaming umstellen

Stand 19.09.2026, geschrieben gegen den GEMESSENEN Quelltext (Commit `738558a`),
nicht gegen eine Notiz. Die Fassung dieses Papiers vom Vormittag ruhte auf einer
überholten Prämisse (`store`/`effort`/`truncation` seien nicht gesetzt — sie
sind es); die CLAUDE.md ist dazu bereits berichtigt.

## Warum überhaupt

`anfragen()` setzt ein Zeitlimit von 20 Minuten:

    timeout: 20 * 60 * 1000,                      // tools/gegenleser-repo.js:569
    anfrage.on('timeout', () => { anfrage.destroy(new Error('Zeitueberschreitung nach 20 Minuten')); });

**Dieses Versprechen kann durch diesen Egress-Proxy nie eingelöst werden.**
Gemessen 18.09.2026: eine Anfrage OHNE Streaming gegen `api.openai.com` wird bei
**300,3 s** hart abgeschnitten — drei Versuche, 300.313 / 300.383 / 300.3 ms,
jedes Mal `curl`-Exit 56, keine Antwortdatei. 1200 s konfiguriert, 300 s
erreichbar: ein Wert, der nicht wirken kann. Genau die Klasse, die wir sonst an
fremdem Code finden.

Verschärft hat es die letzte Behebung selbst: mit dem frisch gesetzten
`reasoning.effort: xhigh` werden die Runden LÄNGER, nicht kürzer.

**Dass Streaming das löst, ist nicht Theorie, sondern am eigenen Bestand
gemessen** (19.09.2026, 09:41–09:48, die Diffprüfung zu PR #460):

    curl -sS -N ... -d @anfrage-sol.json https://api.openai.com/v1/responses
    HTTP 200 | curl-Exit=0 nach 442 s | 1.519.478 SSE-Bytes | genau 1 Abschluss-Ereignis

442 s — ein Lauf, den der nicht-streamende Weg 142 s vor dem Ergebnis
weggeworfen hätte.

## Vier Messungen von heute, auf denen dieser Auftrag steht

Alle vier am echten Endpunkt, Kosten zusammen unter 250 Token.

**M1 — `stream: true` verträgt sich mit unseren Funktionswerkzeugen.**
Das war die eine offene Annahme: der 442-s-Lauf oben trug KEINE `tools`. Probe
mit `tools` + `stream:true` + `store:false` + `truncation:disabled` + `metadata`
zusammen: **HTTP 200**, 2 s, 9.874 Bytes, genau **ein** Abschluss-Ereignis.

**M2 — das Antwortobjekt im Abschluss-Ereignis ist FORMGLEICH mit dem heutigen
Körper.** Das ist der Befund, der diesen Beitrag klein macht:

    output[] Typen:            ["function_call"]
    function_call-Felder:      ["id","type","status","arguments","call_id","name"]
    usage:                     {"input_tokens":77, ..., "output_tokens":29, ...}

Dieselben Feldnamen, die `elementFunktionsaufrufBauen()` im Selbsttest baut, und
dasselbe `usage`, das die Rundenschleife bei `:1137` summiert. **Nichts hinter
`anfragen()` ändert sich** — nicht die Schleife, nicht `textAusAusgabe()`, nicht
die Kostenrechnung. Wer dort etwas anfasst, hat den Auftrag missverstanden.

**M3 — das `incomplete`-Ereignis sieht so aus:**

    Abschluss: response.incomplete | status: incomplete
    incomplete_details: {"reason":"max_output_tokens"}
    output[] Typen: ["reasoning"]

**M4 — das Werkzeug liest `status` heute NIRGENDS.** `grep -n "incomplete\|status ===" tools/gegenleser-repo.js`
findet null Stellen. Im gemessenen Fall M3 fällt es trotzdem laut aus (kein
`function_call`, kein Text → `return 5`), aber mit FALSCHER Diagnose: es meldet
„Das Modell hat am Ende keinen Text geliefert", während in Wahrheit das
Ausgabebudget erschöpft war. Bei 45.000 Ausgabe-Token je Runde und `xhigh` ist
das kein Randfall.
**NICHT gemessen, und deshalb nicht behauptet:** ob eine Kürzung auch NACH einem
fertigen `function_call` landen kann. Falls ja, liefe die Schleife still weiter
— dieselbe Klasse, nur stumm. Der Riegel unten deckt beides ab, ohne dass die
Frage beantwortet sein muss.

## Was zu bauen ist

### 1. `stream: true` in den Anfragekörper von `anfragen()`

Neben die bestehenden Felder, mit derselben Sorgfalt kommentiert wie `store`
und `truncation` — nämlich mit der Zahl 300,3 s und dem 442-s-Lauf, nicht mit
„wegen Zeitüberschreitungen".

### 2. SSE-Auswertung im Antworthandler

Der heutige Handler sammelt alles und ruft `JSON.parse(roh)`. Neu:

* **Zeilenpuffer über Chunk-Grenzen.** Ein `data:`-Element wird nicht
  garantiert in einem Stück geliefert. Wer chunkweise `split('\n')` macht,
  verliert die zerschnittene Zeile — und das ist die Sorte Fehler, die bei
  kleinen Antworten nie auftritt und bei 1,5 MB regelmäßig.
* Je Zeile: Präfix `data: ` prüfen, Rest als JSON lesen, unlesbare Zeilen
  überspringen (es gibt auch `event:`- und Leerzeilen).
* **Abschluss-Ereignis** ist `response.completed`, `response.incomplete` oder
  `response.failed`; `ereignis.response` ist das Antwortobjekt, das diese
  Funktion zurückgibt. Das ERSTE Abschluss-Ereignis gewinnt; kommt danach noch
  eines, wird das auf stderr gemeldet, aber der Lauf NICHT abgebrochen
  (gemessen kam bisher immer genau eines — eine Überraschung soll sichtbar
  sein, nicht tödlich).
* **Kein Abschluss-Ereignis = lautes Scheitern, niemals ein leeres Ergebnis.**
  Die Fehlermeldung nennt: empfangene Bytes, Zahl gelesener `data:`-Zeilen und
  den zuletzt gesehenen Ereignistyp. Ein abgeschnittener Lauf muss von „nichts
  gefunden" unterscheidbar sein — das ist unsere teuerste Klasse.
* **Der Statuscode wird VOR der SSE-Auswertung geprüft, wie heute.** Eine
  Fehlerantwort ist kein SSE, sondern ein gewöhnlicher JSON-Körper; der
  Rohauszug bleibt in der Meldung.

### 3. Statusprüfung auf dem Antwortobjekt (der Befund aus M4)

`anfragen()` gibt das Antwortobjekt nur zurück, wenn `status === 'completed'`.
Sonst wirft es — mit `status` UND `incomplete_details.reason` wörtlich in der
Meldung. Das ist der Riegel, der M4 in beiden Richtungen schließt: auch wenn
eine Kürzung hinter einem fertigen `function_call` landen sollte, kommt sie
nicht mehr als normale Runde durch.

Der `catch` um `anfragen()` in der Rundenschleife (`:1126-1131`) gibt bereits
die Zusammenfassung aus und wirft weiter — dort ist nichts zu ändern.

### 4. `metadata`

Gemessen angenommen (M1). Macht einen Lauf wiederfindbar. Inhalt: Zweck und
Datum, mehr nicht — **keine Pfade, keine Auftragstexte, keine Dateinamen aus
dem Repo.** `metadata` ist das einzige Feld, das bei `store:false` womöglich
trotzdem zur Abrechnung gespeichert wird; das ist unbelegt, also behandeln wir
es wie Protokoll, nicht wie Inhalt.

### 5. `max_tool_calls` — bewusst NICHT

Die CLAUDE.md nennt es in der Zielkonfiguration, dort aber ausdrücklich „nur mit
`web_search`; deckelt die Suchschleife". Dieses Werkzeug benutzt kein
`web_search`, sondern eigene Funktionswerkzeuge, und es hat mit `--max-runden`
bereits eine Bremse. Ob `max_tool_calls` auf Funktionswerkzeuge überhaupt wirkt,
ist NICHT gemessen — eine ungemessene Obergrenze würde genau die Klasse
einführen, die dieser Beitrag beseitigt: ein stiller Abbruch, der wie ein
Ergebnis aussieht. **Entscheidung des Haupt-Agenten: fällt weg.** Wer es später
will, misst zuerst, dass es wirkt, und dann, wo die Grenze liegt.

### 6. Der Selbsttest-Stub muss SSE sprechen

**Das ist der gefährlichste Teil des ganzen Auftrags.** `httpsStubBauen()`
(`:1285`) liefert heute `JSON.stringify(eintrag)` als einen Block. Bleibt das
so, prüfen die 72 Fälle einen Transportweg, den es nicht mehr gibt — und der
Lauf ist grün, während der echte Weg kaputt ist. Der Stub liefert also
SSE-Zeilen, und `antwortKoerperBauen()` bekommt einen Gegenpart, der daraus
einen Ereignisstrom baut.

## Gegenproben — jede EINZELN, Ausgabe wörtlich in den Bericht

Positivkontrolle ist Pflicht: zu jeder Gegenprobe gehört der unmutierte Lauf
mit seiner Zahl, sonst belegt sie nichts.

* **GP1 — Chunk-Grenze mitten in einer `data:`-Zeile.** Der Stub liefert
  denselben Strom in zwei Hälften, die Trennung liegt INNERHALB einer
  `data:`-Zeile. Muss durchlaufen. Ohne Zeilenpuffer muss dieselbe Fixtur
  fallen — beides messen.
* **GP2 — Strom ohne Abschluss-Ereignis.** Muss laut scheitern. Ein
  Durchlauf mit leerem Ergebnis ist ein Befund gegen den Bau.
* **GP3 — `response.incomplete` mit `reason: max_output_tokens`** (Form aus M3,
  wörtlich). `anfragen()` muss werfen, und `reason` muss in der Meldung stehen.
* **GP4 — `stream: true` aus dem Körper entfernen.** Eine Zusicherung muss
  fallen. Sie prüft am AUFGEZEICHNETEN Anfragekörper (`aufgezeichnet`), so wie
  es der bestehende Rundenriegel vormacht — nicht an einer Behauptung im Text.
  Dasselbe für `store:false`, `truncation`, `reasoning.effort`: die sind heute
  gesetzt und von NICHTS bewacht. Wenn das ohne Ausufern geht, kommen sie mit.
* **GP5 — der alte Stub (ein JSON-Block statt SSE).** Muss scheitern. Das ist
  die Gegenprobe gegen Punkt 6: sie belegt, dass die 72 Fälle wirklich den
  neuen Weg messen und nicht über einen Rückfallpfad am alten hängen.

**Jedes Mutationsskript** nimmt den Zielpfad als ARGUMENT, zählt die
Fundstellen und bricht bei 0 UND bei mehr als 1 ab, schreibt den Marker
(`GEGENPROBE-` + `DEFEKT` getrennt geschrieben), läuft durch `node --check`,
und die Rücknahme wird gegen eine unabhängig mit `cp` angelegte Kopie per
`diff` mit EXIT 0 geprüft — nie `git checkout`, nie `git stash`, und die
Rücknahme wird NICHT mit einem Testlauf verkettet.

## Abnahme

* `node --check tools/gegenleser-repo.js`
* `node tools/gegenleser-repo.js --selbsttest` → EXIT 0, und
  `ERWARTETE_FAELLE` (heute 72) auf die neue Zahl gezogen. Die Zahl wird
  HOCHgezählt, nicht angepasst, bis es passt.
* Die fünf Gegenproben oben, je mit Positivkontrolle, Ausgabe wörtlich.
* **Kein echter Netzaufruf aus dem Selbsttest.** Der Stub ist der Beweis;
  dieselbe Datei läuft in `.github/workflows/ci.yml:38` bei jedem Push.

## Offen, ausdrücklich UNGEMESSEN

Mit Streaming fließen ständig Daten, also ist `timeout` in den
`https.request`-Optionen ab sofort ein UNTÄTIGKEITS-Limit statt eines
Gesamtlimits — das wäre das, was wir eigentlich wollen. **Gemessen ist das
nicht**, und über den Stub (der keine echten Sockets benutzt) ist es auch nicht
billig zu messen. Es wird deshalb nicht behauptet, weder im Kommentar noch im
Bericht. Wer die 20 Minuten anfasst, misst vorher.
