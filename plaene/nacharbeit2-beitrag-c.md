# Nacharbeit RUNDE 2 zu Beitrag C — Auftragspapier (20.09.2026)

Zweig `beitrag-c-belehrungen-schreibreihenfolge`, Stand `b40627d`.
Grundlage: zweite Gegenlesung (10 Befunde). **Jeder Punkt unten ist von mir
SELBST nachgemessen**, die Zahlen stehen dabei. Drei Befunde der Gegenlesung
fahren NICHT mit (Begründung am Ende), einer fällt.

**Komplexitätseinordnung:** nicht „sehr komplex" — **kein Punkt fasst
Produktivcode an** (nur Wächterlogik, Zusicherungstexte und Kommentare),
jede Entscheidung steht ausgeschrieben. **Standard-Executer.**

**Warum dieses Papier NICHT durch die Planprüfung geht** (die Regel vom
18.09. verlangt einen Satz Begründung): die sechs Punkte SIND das Ergebnis
einer vollen Gegenlesungsrunde über genau dieses Material, jeder ist von mir
einzeln nachgemessen, und die Fehlerklasse, gegen die Planprüfungen hier
geholfen haben — eine Behebung, die es schlimmer macht — kann beim Schärfen
einer Zusicherung ohne Produktivänderung nicht entstehen.

---

## R4 (BLOCKIEREND) — der N6-Wächter prüft die falsche ARGUMENTPOSITION

`test_feature_belehrung_auditappend_bindung.js`.

`auditAppend(studioId, ereignis, bezugTyp, bezugId, payloadObj, conn = null)`
— `conn` ist der **sechste** Parameter, nicht „das letzte Argument". Der
Wächter vergleicht aber nur das letzte.

**Gemessen:** die Ein-Zeilen-Mutation
`auditAppend(…, { …payload… }, null, t)` lässt ihn bei **14 PASS / 0 FAIL,
EXIT 0** — während `conn` zur Laufzeit `null` ist, `auditAppend` also eine
ZWEITE Poolverbindung öffnet und am gehaltenen Studio-Lock hängt. Genau der
Hänger, gegen den der Wächter gebaut wurde.

**Zu bauen:** GENAU SECHS Argumente verlangen und `args[5]` gegen den
Callback-Parameter halten (nicht `args[args.length-1]`). Eine Zusicherung,
die die Argumentzahl selbst prüft, damit ein siebtes Argument nicht
stillschweigend durchrutscht.
**Neue Negativ-Fixtur:** `auditAppend(req.studioId,'e','t',id,{a:1}, null, t)`
→ MUSS als Fehlbindung erkannt werden.
**Gegenprobe:** dieselbe Mutation am echten Produktivcode → ROT; zurück → GRÜN.

---

## R5 (BLOCKIEREND) — das N5c-Prädikat lässt Datenbankzugriffe durch

`test_feature_geistersperre_nachtrag_rennen.js`, `nurLokalesBookkeeping`.

Heute: `!/await|\bt\./.test(zwischen)`. Das Muster `\bt\.` trifft
`t.run(...)` — aber NICHT `t['run'](...)` und nicht
`const { run } = t; run(...)`. Beide starten eine Anweisung VOR der
Locknahme, ändern also genau die Sperrordnung, die der Wächter bewacht.

**Zu bauen:** Prädikat auf `/await|\bt\b/` verschärfen. **Vorher messen,
nicht annehmen**, dass die heute erlaubte Zeile weiterhin durchgeht:
`txCallbackBetreten = true;` enthält kein `\bt\b` (nach dem `t` in
`txCallbackBetreten` folgt `x`, nach dem in `true` folgt `r` — keine
Wortgrenze). **Das ist meine Erwartung, kein Messwert** — miss es.
**Gegenproben, beide Richtungen:**
* `t['run']('UPDATE …');` vor den Lock → MUSS ROT werden (heute grün).
* unverändert → MUSS GRÜN bleiben (147 PASS / 0 FAIL, von mir gemessen).

---

## R7 (BLOCKIEREND) — der DRITTE N1-Fall fehlt, und er sichert die Platzierung

Mein Papier verlangte ihn wörtlich: „`db.tx` wirft VOR dem Callback …
Datei MUSS aufgeräumt sein. Gegenprobe: die Zuweisung VOR `await db.tx`
ziehen → ROT." Gebaut wurden Fall A und Fall B; dieser nicht.

**Gemessen:** die Zuweisung zusätzlich VOR `await db.tx(...)` gesetzt (also
genau die Semantik „true, obwohl der Callback nie lief") →
`test_feature_belehrung_neue_version_transaktion.js` bleibt bei
**37 PASS / 0 FAIL, EXIT 0**. Die Platzierung, die die Planprüfung in meiner
eigenen Vorgabe als falsch entlarvt hat, ist damit vollständig ungesichert.
*(Umfang meiner Messung: diese eine Datei — sie ist die einzige, die diesen
Fehlerweg fährt. Die volle Suite habe ich dafür NICHT gefahren.)*

**Zu bauen — Fall C:** ein `db.tx`-Wrapper, der wirft, OHNE den Callback je
aufzurufen, UND die Nachsehe-Abfrage scheitern lassen. Zusichern:
* der Callback wurde nachweislich NIE betreten (eigener Zähler im Wrapper),
* kein UPDATE hat stattgefunden (`dateiname` unverändert),
* HTTP 500,
* **die hochgeladene Datei IST aufgeräumt** — das ist der Kern.
**Gegenprobe:** die Zuweisung vor `await db.tx(...)` ziehen → Fall C MUSS ROT
werden. Zurück → GRÜN.

---

## R8 (billig) — die N4-Ersatzzusicherung ist schwächer als ihre Beschriftung

`test_feature_belehrung_neue_version_wettlauf.js`. Beschriftet ist „grund ist
der neue Text", geprüft wird `grund !== 'Vor dem Rennen'`. Die Mutation
`grund = NULL` im ON-CONFLICT-Zweig bliebe grün — `null !== 'Vor dem Rennen'`
ist wahr. Ein Name, der mehr verspricht als die Zusicherung hält.

**Zu bauen:** auf den tatsächlich erwarteten Text prüfen (Präfix
`Neue Version vom`), nicht nur auf Ungleichheit zum Altwert.
**Gegenprobe:** `grund = excluded.grund` → `grund = NULL` → MUSS ROT werden.

---

## R9 (billig) — die neue Kommentar-Matrix trägt drei FALSCHE Zeilenzahlen

Und das ist die Ironie: es ist derselbe Kommentar, der erklärt, warum exakte
Zeilenzahlen gefährlich sind. **Von mir gemessen am Stand `b40627d`:**

| Kommentar sagt | tatsächlich |
|---|---|
| `:963 (DELETE, dieser Block)` | Zeile 963 ist die **Locknahme**; das DELETE steht auf **980** |
| `:2053 (Einzel-Freischaltung)` | Zeile 2053 ist `});`; der INSERT steht auf **2070** |
| `:2075` (schalteAlleFrei) | der INSERT steht auf **2095** |

Sie waren beim Schreiben richtig und sind INNERHALB desselben Commits
gealtert, durch die eigenen Kommentarzeilen davor.

**Zu bauen:** in der Matrix semantische Anker statt Zahlen — „DELETE im
Unterschriften-Tx", „POST /freischalten/:belehrungId", „schalteAlleFrei()",
„routes/admin/mitarbeiter.js, Mitarbeiter-Löschweg". Dieselbe Begründung,
die zwölf Zeilen weiter unten schon steht, hier anwenden.

---

## Was AUSDRÜCKLICH NICHT gebaut wird

* **Befund 1 der Gegenlesung FÄLLT** (`pg_stat_activity` ohne `studio_id`):
  ein Systemkatalog ist keine Mandantentabelle. Das ist die DRITTE Runde in
  Folge, in der derselbe Fehlalarm kommt — ich ergänze deshalb den Vorspann
  `tools/gegenleser-vorspann.txt` um eine ausdrückliche Ausnahme für
  Systemkataloge. Sein Vorschlag (PID-Inventar statt Katalogabfrage) würde
  erneut die Referenz von AUSSEN gegen einen Selbstnachweis tauschen.
* **Befund 2** (der Nachsehe-Block kann eine bereits veröffentlichte, inzwischen
  ersetzte Zwischenversion löschen) — **trägt, ist aber KEIN Regress**: vor
  Beitrag C löschte der catch sie bedingungslos, das Ergebnis war dasselbe.
  Offener Befund.
* **Befund 3** (Multer-Namenskollision) — formal richtig, praktisch
  vernachlässigbar (`Date.now()` plus `crypto.randomBytes(6)`). Offener Befund.
* **Befund 6** (Zustandszusicherung statt Aktionszusicherung bei `fs.unlink`)
  — die realistische Mutation ist nachweislich gefangen (von mir gemessen:
  37 → 33 PASS / 4 FAIL, darunter `status: 404` am Auslieferungsweg). Die
  vorgeschlagene Verschärfung ist eine Verbesserung, kein Mangel. Offener Befund.
* **Befund 10** (N10-Messwerte fehlen im Repo) — trägt; ich trage die Zahlen
  selbst in die Befundakte ein, das ist Bagatellgrenze.
