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
Ausgabebudget erschöpft war. Der Istwert ist `MAX_ANTWORT_TOKEN = 24000`
(`tools/gegenleser-repo.js:150`) — nicht die 45.000 aus der CLAUDE.md-
Zielkonfiguration, die hier zuerst stand. Bei 24.000 ist die Erschöpfung sogar
WAHRSCHEINLICHER. Der Wert wird in diesem Beitrag NICHT angehoben.
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


---

# NACHTRAG 19.09.2026: zwei Planprüfungen, 16 Befunde, alle selbst nachgemessen

Zwei Spuren über dasselbe Bündel (96.599 gezählte Token): `gpt-5.6-sol`
(388 s, 13 Befunde) und `deepseek-v4-pro` (244 s, 3 Befunde). Die Regel vom
18.09.2026 — „der Plan geht raus, BEVOR gebaut wird" — hat sich hier zum
ersten Mal in ihrer stärksten Form belegt:

**ZWEI der Befunde sind gar keine Planfehler, sondern bestehende Fehler im
heutigen Code** (SOL-4, SOL-11). Beide sitzen in genau der Funktion, die
umgebaut werden soll, beide sind von mir mit Positivkontrolle nachgemessen,
und beide wären ohne diese Prüfung mit in den Umbau gewandert.

## Die zwei bestehenden Fehler — sie sind ab jetzt Teil des Auftrags

### B1 — `roh += stueck` zerstört Mehrbytezeichen an der Chunk-Grenze

`tools/gegenleser-repo.js:572` lautet `antwort.on('data', (stueck) => { roh += stueck; });`.
`roh` ist eine Zeichenkette, `stueck` ein Buffer — das `+=` dekodiert JEDEN
Chunk EINZELN als UTF-8. Fällt eine Chunk-Grenze zwischen die Bytes eines
Mehrbytezeichens, entstehen Ersatzzeichen.

**Gemessen, dieselbe Konstruktion, Trennung auf einem Folgebyte:**

    Bestandsweg (roh += stueck): "Pruefung: Groesse der Datei ��� ungueltig (ae"
      Ersatzzeichen: true  | identisch mit Original: false
    StringDecoder:               "Pruefung: Groesse der Datei — ungueltig (ae/o"
      Ersatzzeichen: false | identisch mit Original: true

Die Positivkontrolle steht: derselbe Eingang, derselbe Schnitt, einmal falsch
und einmal richtig. **Unsere Berichte sind deutsch**, und ein Strom von 1,5 MB
hat viele Chunk-Grenzen. Zu bauen: `StringDecoder('utf8')` oder Zusammenführen
der Roh-Buffer bis zur vollständigen Zeile.

Gefährlich wird es im Zusammenspiel mit B3 unten: ein so beschädigtes JSON
scheitert am `JSON.parse` — und würde nach meiner ursprünglichen Regel
„unlesbare Zeilen überspringen" **still** übersprungen.

### B2 — der Antwortstrom kann die Promise für immer hängen lassen

Die Promise löst NUR in `antwort.on('end')` auf; Listener gibt es nur auf
`anfrage` („timeout", „error"), nicht auf dem ANTWORT-Strom. **Gemessen an
einem Nachbau genau dieser Konstruktion, mit Wachhund:**

    sauberes end               -> aufgeloest
    close OHNE end             -> HAENGT (Wachhund nach 300ms)
    Fehler am ANTWORTSTROM     -> HAENGT (Wachhund nach 300ms)

Der erste Fall ist die Positivkontrolle — der Nachbau kann auflösen. Die
anderen beiden nicht. Ein Socket-Zeitlimit rettet hier nicht: es greift bei
UNTÄTIGKEIT, nicht bei einem geschlossenen Socket.

Heute fällt das meist nicht auf, weil der Proxy-Abbruch bei 300,3 s als Fehler
am ANFRAGE-Objekt ankommt. **Mit Streaming wird ein mitten im Strom sauber
geschlossener Socket zum Regelfall der Störung** — die Klasse wird also von
unwahrscheinlich zu wahrscheinlich, genau durch diesen Umbau.

Zu bauen: Listener auf `antwort` für `error`, `aborted` und vorzeitiges
`close`, dazu eine Abschlussfunktion, die genau EINMAL wirkt (ein normales
`close` nach `end` darf nicht doppelt ablehnen).

## Was sich am Auftrag ändert

**B3 — eine kaputte `data:`-Zeile wird NICHT übersprungen.** Meine Regel
„unlesbare Zeilen überspringen" warf zwei Dinge zusammen: `event:`- und
Leerzeilen (dürfen ignoriert werden) und einen `data:`-Datensatz mit
ungültigem JSON (ist ein beschädigter Protokolldatensatz und bricht den Lauf
laut ab). Beide Spuren haben diesen einen Satz getroffen.

**B4 — der Ereignistyp kommt aus dem `type`-Feld im JSON.** Gemessen über drei
echte Ströme: **3.977 `data:`-Zeilen, davon 3.977 mit `type`-Feld; 3.977
`event:`-Zeilen; Abweichung zwischen beiden: 0.** Der Parser liest `data:` und
nimmt `e.type`; `event:` wird nicht gebraucht. Das gehört ins Papier, weil es
bisher nirgends stand — nicht, weil es ein Fehler wäre.

**B5 — ein ZWEITES Abschluss-Ereignis lehnt den Lauf ab.** Meine Fassung sagte
„melden, aber weiterlaufen". Das ist die schwächere Wahl: `completed` gefolgt
von `failed` ergäbe einen gedruckten Bericht und EXIT 0. Gemessen hatte JEDER
der drei echten Ströme **genau ein** Abschluss-Ereignis — eine Ablehnung ist
also nicht empfindlich, sondern schlicht nie ausgelöst.

**B6 — Fehlerdiagnosen nach Form getrennt.** `incomplete_details.reason` bei
`incomplete`; `response.error` bei `failed` (das Feld existiert — gemessen als
`"error":null` im `response.created`-Ereignis); dazu ein Ereignis vom Typ
`error` als sofort fatal. Kein `undefined` in einer Fehlermeldung.

**B7 — die Fixtur `antwortKoerperBauen()` braucht ein Top-Level-`status`.**
Sie liefert heute nur `{output, usage}`. Die neue Statusprüfung würde damit
JEDEN bestehenden Selbsttestlauf ablehnen. `incomplete` und `failed` bekommen
eigene, ausdrücklich gebaute Antwortobjekte; der Ereignistyp ist NICHT der
Ersatz für den Objektstatus.

**B8 — der Verbrauch darf beim Statusabbruch nicht verloren gehen.**
`promptTokenSumme += …` steht bei `:1137`, also NACH `anfragen()`. Wirft die
Funktion, meldet die Zusammenfassung bei `:1096` `Token rein: 0` und
`Kosten geschaetzt: $0.0000` für einen Lauf, der Geld gekostet hat. Der
Fehler trägt Status, Grund und `usage`; der Catch verbucht sie genau einmal.
(Die Protokollzeile bei `:1016` sagt bei 0/0 bereits korrekt „Kosten
unbekannt" — die Konsolenausgabe nicht.)
**Damit ist mein Satz „hinter `anfragen()` ändert sich nichts" falsch:** für
die DATENFORM stimmt er (gemessen, M2), für den KONTROLLFLUSS nicht.

**B9 — der Stub muss einen MEHREREIGNIS-Strom liefern**, nicht eine einzelne
`response.completed`-Zeile: `event:`- und Leerzeilen, `response.created`,
mindestens ein Delta, dann erst der Abschluss. Sonst laufen 72 Fälle durch
SSE, ohne je den echten Zustand zu sehen — und eine Implementierung, die beim
ersten Nicht-Abschluss-Ereignis abbricht, bliebe in CI grün.

**B10 — der Stub bekommt einen konfigurierbaren Statuscode.** Er hat heute
fest `statusCode: 200`; damit ist der Nicht-200-Weg von nichts bewacht.

**B11 — `metadata` bekommt feste Werte, keine abgeleiteten.** `--zweck` ist
freier Text und fällt sonst auf den Basisnamen der Brief-Datei zurück — genau
die Pfade und Auftragstexte, die dort nicht hingehören.

**B12 — die Riegel auf `store:false`, `truncation` und `reasoning.effort` sind
PFLICHT, nicht „wenn es ohne Ausufern geht".** Mein eigener Halbsatz hat den
wichtigsten Datenschutzriegel des Werkzeugs zur Kür erklärt. Für `store:false`
ist die Gegenmutation zwingend.

**B13 — GP2 und GP3 bekommen wörtliche Sollwerte.** „Laut scheitern" bestünde
auch ein `throw new Error('kaputt')`. GP2 prüft Bytes, Zahl der `data:`-Zeilen
und letzten Ereignistyp als Literale aus der Fixtur; GP3 prüft `status` UND
`reason`. Jedes Pflichtfeld wird einzeln entfernt und muss einzeln rot werden.

**B14 — GP1 bekommt eine Mehrbyte-Fixtur**, deren Schnitt ZWISCHEN den Bytes
eines Zeichens liegt (siehe B1). Eine ASCII-Fixtur kann diese Klasse nicht
auslösen — Lehrbuchfall „Testdaten, die den gesuchten Unterschied gar nicht
erzeugen können".

## Was NICHT trägt, und warum es trotzdem hier steht

* **DS-1 („blockierend": der Parser könne den Abschluss nicht erkennen)** —
  **Schwere widerlegt.** Seine eigene Nachmess-Anweisung behauptet, ein nur
  `data:` lesender Parser würde „das JSON direkt als Antwortobjekt ansehen (das
  kein `status` hat)". Gemessen ist das Gegenteil: das JSON trägt `type` und
  `response`. Übrig bleibt der echte Teil — mein Papier sagte nirgends, woher
  der Typ kommt (jetzt B4). Aus blockierend wird niedrig.
* **DS-2 (Formgleichheit zu weit verallgemeinert)** — der Hinweis ist fair,
  das VERMUTETE Risiko löst sich aber in der Messung auf. Ich habe daraufhin
  drei Dinge gemessen, die vorher niemand gemessen hatte: ein Abschluss mit
  Ausgabetyp `message` (im 442-s-Lauf, 40× `reasoning` + 1× `message`); einen
  echten ZWEI-RUNDEN-Lauf mit Streaming, bei dem das unveränderte
  `function_call`-Element plus `function_call_output` zurückgeht (**beide
  Runden HTTP 200**, mit `gpt-5.4` und mit `gpt-5.6-sol`); und ein echtes
  `reasoning`-Element im `input[]` einer neuen Anfrage (**HTTP 200**). Damit
  ist auch SOL-13 erledigt, das genau diese Messung verlangte.
* **SOL-3** trägt in der Sache (B8), aber nicht in der Schwere: der Lauf endet
  mit Nichtnull-Exit, er wird nicht falsch grün. Von „hoch" auf „mittel".

## Was dieser Lauf für die REGEL hergibt

**Überschneidung der beiden Spuren: 2 von 16.** DS-1 und SOL-10 trafen
DENSELBEN Satz meines Papiers aus zwei Richtungen, DS-3 und SOL-9 dieselbe
Fehlerform. Das ist ein anderes Bild als am 13.09.2026, wo zwei Spuren neun
Befunde mit NULL Überschneidung lieferten — und es ist die ehrlichere Zahl,
weil hier beide dasselbe Material und dieselbe Frage hatten. Eine Stichprobe
bleibt es trotzdem.

**Der Engpass war wieder das eigene Nachmessen, nicht das Finden.** Sechzehn
Befunde, davon 14 in der Sache getragen, 2 mit falscher Schwere. Die zwei
teuersten (B1, B2) waren keine Planfehler — sie lagen im Bestand und wären in
jedem Bau-Durchgang unsichtbar geblieben, weil niemand nach ihnen gesucht hat.
