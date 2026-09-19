# Bauauftrag: `tools/gegenleser-repo.js` auf Streaming umstellen

Repo: `/home/user/Belehrungssystem`, Zweig `claude/gym-docu-codo-access-4q3bn0`.
Du arbeitest ALLEIN in diesem Arbeitsbaum. Lies die `CLAUDE.md` dort.

Das vollständige Auftragspapier liegt als
`plaene/auftrag-gegenleser-streaming.md` im Repo — **lies es ganz, inklusive
des Nachtrags am Ende.** Dieses Blatt hier ist die Arbeitsliste, das Papier
trägt die Begründungen und die Messwerte.

## Warum

`anfragen()` (`tools/gegenleser-repo.js:534-585`) setzt `timeout: 20 Minuten`,
während der Egress-Proxy eine nicht-streamende Anfrage an `api.openai.com` bei
**300,3 s** hart abschneidet. Mit `stream: true` lief derselbe Endpunkt
gemessen **442 s** durch.

**Hinter `anfragen()` ändert sich an der DATENFORM nichts** — das ist gemessen
(Papier, M2): das Antwortobjekt im Abschluss-Ereignis hat dieselben Felder wie
der heutige Körper. Die Rundenschleife, `textAusAusgabe()` und die
Kostenrechnung bleiben unberührt. Am KONTROLLFLUSS ändert sich etwas, aber nur
an der einen Stelle, die Punkt 8 unten benennt.

## Die 14 Punkte

### Am Anfragekörper

1. **`stream: true`** neben die bestehenden Felder. Kommentar mit den zwei
   Zahlen (300,3 s / 442 s), nicht mit „wegen Zeitüberschreitungen".
2. **`metadata`** mit FESTEN Werten — ein konstanter Zweckbegriff und ein
   Datum. **`--zweck`, der Briefname, Pfade und Auftragstexte dürfen
   ausdrücklich KEINE Quelle sein** (`--zweck` ist freier Text und fällt sonst
   auf den Basisnamen der Brief-Datei zurück).
3. **`max_tool_calls` wird NICHT gesetzt.** Entscheidung steht im Papier.
4. **`MAX_ANTWORT_TOKEN` bleibt bei 24000.** Nicht anheben.

### Am Antworthandler

5. **Zeilenpuffer mit `StringDecoder('utf8')`.** Der Bestandsweg
   `roh += stueck` dekodiert jeden Chunk EINZELN und zerstört Mehrbytezeichen
   an der Chunk-Grenze — gemessen, siehe Papier B1. Roh-Buffer bis zur
   vollständigen Zeile zusammenführen ist die Alternative; eine der beiden.
6. **Ereignistyp aus dem `type`-Feld im JSON der `data:`-Zeile**, nicht aus
   der `event:`-Zeile (gemessen: 3.977 von 3.977 `data:`-Zeilen tragen `type`,
   0 Abweichungen). `event:`- und Leerzeilen werden ignoriert.
7. **Eine `data:`-Zeile mit UNGÜLTIGEM JSON bricht laut ab.** Nicht
   überspringen — das ist ein beschädigter Protokolldatensatz, kein
   Nichtdatenfeld.
8. **Abschluss-Ereignisse:** `response.completed`, `response.incomplete`,
   `response.failed`; `ereignis.response` ist der Rückgabewert.
   **Ein ZWEITES Abschluss-Ereignis lehnt den Lauf ab** (nicht: warnen und
   weiterlaufen). **Ein Ereignis vom Typ `error` ist sofort fatal.**
9. **Kein Abschluss-Ereignis = laute Ablehnung**, niemals ein leeres Ergebnis.
   Die Meldung nennt: empfangene Bytes, Zahl gelesener `data:`-Zeilen, zuletzt
   gesehener Ereignistyp. Alle drei sind Pflicht.
10. **Listener auf dem ANTWORT-Strom** für `error`, `aborted` und vorzeitiges
    `close`, dazu eine Abschlussfunktion, die genau EINMAL wirkt (normales
    `close` nach `end` darf nicht doppelt ablehnen). Gemessen, siehe Papier
    B2: heute hängt die Promise in diesen Fällen FÜR IMMER.
11. **Der Statuscode wird VOR der SSE-Auswertung geprüft**, wie heute. Eine
    Fehlerantwort ist kein SSE; der Rohauszug bleibt in der Meldung.

### Statusprüfung und Fixturen

12. **`anfragen()` gibt nur bei `status === 'completed'` zurück**, sonst wirft
    es. Diagnose NACH FORM getrennt: `incomplete_details.reason` bei
    `incomplete`, `response.error` bei `failed`, `code`/`message` beim
    top-level `error`-Ereignis. **Kein `undefined` in einer Fehlermeldung** —
    fehlt ein erwartetes Feld, wird das selbst als Protokollfehler gemeldet.
13. **Der geworfene Fehler trägt `usage`, Status und Grund.** Der Catch bei
    `:1126-1131` verbucht die `usage` GENAU EINMAL, bevor er die
    Zusammenfassung ausgibt. Sonst meldet `:1096` `Token rein: 0` und
    `Kosten geschaetzt: $0.0000` für einen Lauf, der Geld gekostet hat.
    Fehlt `usage` wirklich, sagt die Ausgabe „unbekannt", nicht „0".
14. **`antwortKoerperBauen()` bekommt ein Top-Level-`status`.** Sie liefert
    heute nur `{output, usage}`; ohne das lehnt Punkt 12 JEDEN bestehenden
    Selbsttestlauf ab. `incomplete` und `failed` bekommen eigene, ausdrücklich
    gebaute Antwortobjekte — **der Ereignistyp ist NICHT der Ersatz für den
    Objektstatus.**
15. **`httpsStubBauen()` liefert SSE und einen konfigurierbaren
    Statuscode.** Heute: ein JSON-Block und fest `statusCode: 200`.
    Der SSE-Gegenpart baut einen MEHREREIGNIS-Strom: `event:`- und
    Leerzeilen, `response.created`, mindestens ein Delta, DANN erst der
    Abschluss. Ein Ein-Ereignis-Strom würde den echten Zustand nie messen.

## Gegenproben — jede EINZELN, Ausgabe wörtlich

Zu jeder gehört die Positivkontrolle (der unmutierte Lauf mit seiner Zahl).

* **GP1 Chunk-Grenze.** Zwei Hälften, Trennung INNERHALB einer `data:`-Zeile.
  **Und eine Mehrbyte-Fixtur**, deren Schnitt ZWISCHEN den Bytes eines
  Zeichens liegt (`ü`, `—`, `ö`). Zurückgegebener Text muss zeichengetreu
  sein. Mutation `StringDecoder` → chunkweises `.toString()` muss rot werden.
  Eine ASCII-Fixtur kann diese Klasse NICHT auslösen.
* **GP2 kein Abschluss-Ereignis.** Muss ablehnen. **Bytes, Zahl der
  `data:`-Zeilen und letzter Ereignistyp werden als LITERALE aus der Fixtur
  zugesichert** — nicht vom Produktionsparser berechnet. Jedes der drei
  Felder einzeln aus der Meldung entfernen; jede Mutation muss einzeln rot
  werden. Sonst bestünde auch ein `throw new Error('kaputt')`.
* **GP3 `response.incomplete`.** `status: incomplete` UND
  `reason: max_output_tokens` einzeln zusichern, einzeln entfernen, einzeln
  rot messen.
* **GP4 Riegel am AUFGEZEICHNETEN Anfragekörper** (`aufgezeichnet`, wie der
  bestehende Rundenriegel). **PFLICHT, nicht optional:** `stream:true`,
  `store:false`, `truncation:'disabled'`, vorhandenes `reasoning.effort`,
  und die exakte Schlüsselmenge von `metadata`. Für `store:false` ist die
  Gegenmutation zwingend.
* **GP5 alter Stub** (ein JSON-Block statt SSE) muss scheitern.
* **GP6 HTTP 400** mit Körper `{"error":{"message":"HTTP-MARKER-4711"}}`.
  Die Ablehnung enthält `HTTP 400` UND `HTTP-MARKER-4711`, NICHT „kein
  Abschluss-Ereignis". Danach die Statusprüfung hinter die SSE-Auswertung
  mutieren — genau dieser Fall muss rot werden.
* **GP7 Strom-Abbruch.** Je einzeln: (a) partielle `data` + `aborted`,
  (b) partielle `data` + `error` am Antwortstrom, (c) partielle `data` +
  `close` ohne `end`. Alle drei müssen kontrolliert ablehnen, mit einem
  Wachhund (kurzes Zeitlimit) als Beleg, dass nichts hängt. Ein normaler
  `end`-dann-`close`-Fall muss genau EINMAL auflösen.
* **GP8 Mehrereignis-Strom.** Nicht-Abschluss-Ereignisse vor dem Abschluss;
  zurückgegeben wird ausschliesslich `ereignis.response` des Abschlusses.
  Mutation „beim ersten JSON-Ereignis auflösen" muss rot werden.
* **GP9 zweites Abschluss-Ereignis.** `completed` mit Bericht, dann `failed`,
  dann `end`. Muss ablehnen, kein Bericht, kein regulärer Protokolleintrag.
* **GP10 `metadata`-Datengrenze.** Lauf mit auffälligem
  `--zweck=GEHEIM-PFAD-routes/x.js` und auffälligem Briefnamen; KEINER dieser
  Marker darf in `metadata` des aufgezeichneten Körpers vorkommen.

## Regeln für die Gegenproben (unverhandelbar)

* Jedes Mutationsskript nimmt den **Zielpfad als ARGUMENT**, zählt die
  Fundstellen und **bricht bei 0 UND bei mehr als 1 ab**.
* Jede Sabotage trägt in derselben Zeile den Marker (schreib ihn im Skript
  aus zwei Teilen zusammen, damit er nicht in committeten Quelltext gerät).
* **`node --check` auf die sabotierte Datei VOR jedem Lauf** — sonst ist ein
  EXIT 1 womöglich ein SyntaxError statt eines gefallenen Tests.
* **Bei jedem roten Ergebnis prüfen, ob wirklich eine ZUSICHERUNG gefallen
  ist** (FAIL-Zeile), nicht nur der Prozess abgestürzt.
* **Bei jedem grünen Ergebnis prüfen, ob die Mutation überhaupt angekommen
  ist** — eine Zahl suchen, die sich hätte ändern müssen.
* Rücknahme **nur gegen eine vorher mit `cp` beiseitegelegte Kopie**,
  danach `diff` mit EXIT 0. **Niemals `git checkout`/`git stash`.**
  **Die Rücknahme NICHT mit einem Testlauf verketten** — der Pipe-Wächter
  lehnt den GANZEN verketteten Befehl ab, und dann steht der Defekt noch,
  während die Meldung „zurückgenommen" lautet.

## Abnahme

* `node --check tools/gegenleser-repo.js`
* `node tools/gegenleser-repo.js --selbsttest` → **EXIT 0**.
  `ERWARTETE_FAELLE` (heute 72, `:1310`) auf die neue Zahl **hochziehen** —
  von Hand hergeleitet, nicht aus dem Lauf abgeschrieben.
* `npm run lint` — **Ergebnis wörtlich melden, auch bei Grün.** Ein nicht
  gelaufener Schritt ist kein bestandener.
* **KEIN echter Netzaufruf aus dem Selbsttest.** Dieselbe Datei läuft in
  `.github/workflows/ci.yml:38` bei jedem Push.
* Marker-Scan vor dem Commit:
  `grep -rn "GEGENPROBE-DEFEKT\|SABOTAGE" --include=* . --exclude-dir=node_modules --exclude-dir=.git`
  — **im Belehrungssystem-Repo gilt KEINE feste Zahl** (derzeit 17), sondern:
  **jeder Treffer steht in Prosa (`.md`), keiner in ausführbarem Code.**

## Meldung

**Committe und pushe, BEVOR du auf irgendetwas wartest.**

Melde: den Diff-Umfang, die wörtliche Ausgabe von `--selbsttest` (Zeilen mit
der Fallzahl), die wörtliche Lint-Ausgabe, und **je Gegenprobe die BEIDEN
Zahlen** (unmutiert / mutiert) mit der wörtlichen Zeile, die gefallen ist.

**Wenn eine meiner Vorgaben sich beim Messen als falsch erweist, sag es und
bau sie nicht.** Eine Vorgabe von mir ist eine Behauptung; wer sie ausführt,
misst sie nach. Das ist ausdrücklich erwünscht — es ist in diesem Projekt
schon mehrfach der wertvollste Teil eines Berichts gewesen.
