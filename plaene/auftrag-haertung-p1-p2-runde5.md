# Auftrag — Härtung P1+P2, Runde 5

**Zweig:** `claude/haertung-p1-p2` im Repo `/home/user/gymdocu`, Kopf `a8182b7`.
**Basis:** `master` = `c40c52f`.

Runde 4 hat die fünf blockierenden Befunde der Gegenlesung abgeräumt — das ist
gemessen und es trägt. Die Code-Review über den GESAMTEN Beitrag
(`c40c52f..HEAD`) hat danach **fünfzehn** weitere Befunde geliefert. Ich habe
die schweren SELBST nachgemessen; die Zahlen stehen unten und stammen aus
meinen eigenen Läufen, nicht aus dem Bericht.

**Zwei davon betreffen PRODUKTIVCODE und sind Regressionen, die dieser Beitrag
selbst eingeführt hat.** Das wiegt schwerer als alles am Wächter.

**Einordnung: SEHR KOMPLEX.** Ein Befund zeigt, dass der gesamte Beitrag über
CSRF gebaut wurde, ohne dass irgendwo zugesichert ist, dass der CSRF-Schutz in
`server.js` überhaupt noch eingehängt ist.

---

## BLOCKIEREND

### R1 — `req.body` ist in Express 5 `undefined`, und die neue Route liest es ungeschützt

`routes/sichtpruefung.js:5478`:

    const ids = String(req.body.ids || '')...

steht VOR dem `try/catch`. Zwei Zeilen tiefer dasselbe mit
`req.body.nachtrag`.

**Von mir gemessen** an einer Minimal-App mit GENAU der Parser-Konfiguration
aus `server.js:161-162` (`express.urlencoded` + `express.json`, je 1 MB),
Express 5.2.1:

| Anfrage | `req.body` |
|---|---|
| `application/x-www-form-urlencoded` | `{"ids":"1"}` |
| ohne Content-Type | **`undefined`** |
| `multipart/form-data` | **`undefined`** |
| `text/plain` | **`undefined`** |

Damit wirft die Route `TypeError: Cannot read properties of undefined` statt
weiterzuleiten. **Die Fehlerklasse ist NEU** — vorher las sie `req.query.ids`,
und `req.query` ist immer definiert. In Produktion fängt der globale
Fehlerbehandler (`server.js:1467`) das ab, ruft aber `errorTracker.melde()`,
also Log plus gedrosselten Telegram-Alarm.

Behebung: `(req.body || {})` bzw. die beiden Zeilen in den `try`-Block ziehen.
**Und eine Zusicherung dazu** — eine Anfrage ohne passenden Content-Type darf
keine 500 erzeugen. Prüfe vorher, ob eine der drei ANDEREN umgestellten Routen
dasselbe Muster trägt; nach meiner Messung liest nur diese eine `req.body`
(`git diff c40c52f..HEAD -- routes/ | grep "^+.*req\.body"` → drei Treffer,
alle in dieser Datei), aber miss es selbst.

### R2 — kein Test sichert zu, dass `server.js` den CSRF-Schutz überhaupt einhängt

**Von mir gemessen:** `app.use(require('./core/csrf-schutz').csrfSchutz);`
(`server.js:173`) durch eine Kommentarzeile ersetzt — also CSRF-Schutz für die
GANZE Anwendung aus. Ergebnis:

    test_feature_haertung_csrf_end_zu_ende.js    EXIT 0
    test_feature_csrf.js                         EXIT 0
    test_feature_csrf_ausnahmen_waechter.js      EXIT 0

Alle drei bauen ihre App selbst und bemerken deshalb nicht, dass die
Produktions-App keinen Schutz mehr hat. **Der ganze Beitrag handelt von
CSRF** — und genau die eine Zeile, die ihn einschaltet, ist von nichts
bewacht. Das ist unsere teuerste Klasse in Reinform.

Behebung: Der Wächter parst `server.js` bereits und klassifiziert diese
Registrierung als Topf M. Es fehlt die Zusicherung, dass sie DA ist — und
zwar VOR jedem Router-Mount und NACH den Body-Parsern (die Reihenfolge ist
der Punkt, sonst greift er für schon ausgelieferte Routen nicht). Beides ist
aus der Grundgesamtheit mit Positionen ablesbar.

### R3 — `METHODEN` kennt acht Verben, `app` trägt gut dreissig

`test_feature_csrf_ausnahmen_waechter.js:187`. **Von mir gemessen:** an einer
frischen `express()`-App sind unter anderem `purge`, `search`, `link`,
`unlink`, `lock`, `mkcol`, `copy`, `move`, `report`, `checkout`, `merge`,
`notify`, `subscribe`, `trace`, `propfind` allesamt Funktionen.

Die Review hat gemessen: `app.purge("/intern/blindfleck", …)` in `server.js`
→ **EXIT 0, 71 PASS / 0 FAIL, keine UNKLASSIFIZIERT-Zeile**. Positivkontrolle
mit demselben Pfad als `app.post` → EXIT 1, 70 / 1. **Miss beides selbst
nach.**

Damit ist die wörtliche Zusage im Kopfkommentar („JEDE Registrierung an `app`
… was in keinen Topf fällt, macht den Lauf ROT") FALSCH.

Behebung: `METHODEN` nicht mehr literal acht Verben, sondern aus einer
vollständigen Quelle — und **zusätzlich eine Zusicherung, dass die benutzte
Menge alle HTTP-Verb-Methoden abdeckt, die eine frische `express()`-App
wirklich trägt.** Ohne diese zweite Zusicherung verschiebt sich die Lücke nur
auf das nächste Verb, das Express dazubekommt. `require('methods')` ist NICHT
direkte Abhängigkeit (von mir gemessen: `MODULE_NOT_FOUND` aus dem
Projektwurzelverzeichnis) — prüfe, ob es über `express` auflösbar ist, und
wenn nicht, leite die Menge aus der App selbst ab.

### R4 — der Beitrag hat Abdeckung GEKOSTET: das versteckte `ids`-Feld ist nirgends mehr geprüft

`test_feature_messfehler_nicht_behaupten.js:553` prüft seit der Umstellung nur
noch das `action`-Attribut des Formulars. Die ersetzte Fassung prüfte
`…/fertig?ids=' + defektId`.

**Von mir gemessen:** `value="${escapeAttr(ids.join(','))}"`
(`routes/sichtpruefung.js:3512`) durch `value=""` ersetzt — der „Fertig"-Knopf
schickt dann keine ids mehr, `sendeDefektMails()` läuft nie, die Defektmail an
den Servicetechniker unterbleibt LAUTLOS:

    test_feature_messfehler_nicht_behaupten.js   EXIT 0, 45 PASS / 0 FAIL
    test_feature_get_schreibt_nicht.js           EXIT 0, 27 PASS / 0 FAIL
    test_feature_tablet_navigation.js            EXIT 0,  3 PASS / 0 FAIL
    test_feature_haertung_csrf_end_zu_ende.js    EXIT 0, 36 PASS / 0 FAIL

Behebung: eine Zusicherung, die den WERT des versteckten Feldes gegen die
erwartete Defekt-ID hält — an der gerenderten Seite, nicht an einem selbst
zusammengebauten POST. Die beiden neuen Tests POSTen ids selbst und rendern
die Seite nie; sie können diese Lücke nicht schliessen.

### R5 — die Antwort des Verbandbuch-POST wird nie eingelesen (Art.-9-Datei bleibt womöglich liegen)

`test_feature_get_schreibt_nicht.js:162`: nur `rPost.status` wird gelesen, der
Rumpf nie. Bei `res.download()` feuert der Callback, der das Original löscht
(#455), erst NACH dem Ende des Streams. Die Schwesterdatei macht es richtig
und sagt warum (`test_feature_haertung_csrf_end_zu_ende.js:206-209`).

Behebung: `await rPost.arrayBuffer()`. **Und miss, ob die Datei ohne das
wirklich liegen bleibt** — wenn nicht, sag es, statt die Behebung als Beleg
auszugeben.

### R6 — die Wartungs-Mail behauptet etwas, das nicht mehr stimmt

`routes/wartung.js:1428` setzt `downloadUrl` auf
`${basisUrl}/admin/geraetewartung/verlauf`; der Ankertext darunter lautet
unverändert **„Wartungsprotokoll als PDF öffnen"**. Der Admin landet auf einer
gefilterten 12-Monats-Liste ALLER Prüfungen und muss die richtige Zeile selbst
suchen.

**Das Ziel bleibt wie es ist** — die Entscheidung dahinter ist richtig und
steht (ein GET-Link auf den POST-Weg wäre tot). Falsch ist der SATZ.
CLAUDE.md: „Ein Satz, den die Oberfläche neu behauptet, ist eine Zusicherung
und gehört gemessen."

Behebung: den Text an das Ziel angleichen (etwa „Wartungsverlauf öffnen"),
**und eine Zusicherung, die dem Mailrumpf das Wort „PDF" in diesem Anker
verbietet**, solange das Ziel die Liste ist. Keine Zusicherung im Repo liest
heute den Mailrumpf.

---

## SOLLTE BEHOBEN WERDEN

### R7 — toter Eintrag in `PFADLOSE_MIDDLEWARE` wird nur geloggt

`test_feature_csrf_ausnahmen_waechter.js:526`: `console.log` statt `ok(…)`.
**Das ist dieselbe Krankheit wie B1 aus Runde 4, eine Ebene tiefer** — und der
Kopfkommentar derselben Datei benennt sie wörtlich für den Vorgänger.
Behebung: eine Zusicherung.

### R8 — `test_feature_get_schreibt_nicht.js` verschluckt sein Aufräumen

Zeilen 315 und 321: `try { fs.rmSync(…) } catch (e2) {}`. Die Schwesterdatei
desselben Beitrags hat daraus in Runde 4 eine rote Zusicherung gemacht.
CLAUDE.md: „Wer zwei Wächter an denselben Helfer hängt, erbt dessen Stärken
NICHT automatisch." Behebung: dieselbe Form wie dort.

### R9 — die Layer-Prüfung der ZWÖLF ist pauschal und meldet das Falsche

`:617` wird von jeder harmlosen `router.use(middleware)` rot, mit einer
Meldung, die „unterrouter-artiges router.use()" behauptet. Gemessen von der
Review: `router.use(function protokoll(…))` in `routes/api.js` → EXIT 1,
70 / 1. Ein falsch-roter Wächter wird abgeschaltet statt gelesen. Sechzig
Zeilen tiefer steht für die VIER bereits die richtige, unterscheidende Form
(`istUnterRouter()` plus Erwartung nach Identität und Mount). Behebung: die
zwölf erben sie.

### R10 — die per Harness gebaute App ist toter Code

`:606-608`: `makeHarnessApp(1)` und die sechzehn `app.use()` werden danach nie
gelesen; alle Zusicherungen laufen gegen die rohen Router-Objekte. Der
Kommentar darüber liest sich aber, als liefen sie gegen eine zusammengebaute
App. Entweder wirklich auswerten oder streichen — **und beim Streichen prüfen,
ob damit eine Aussage verlorengeht** (der Harness-Bau ist heute der einzige
Ort, an dem auffiele, dass ein Mount überhaupt nicht einhängbar ist).

### R11 — Zusicherung und Diagnose messen zweimal

`test_feature_haertung_csrf_end_zu_ende.js:188/194` rufen `pdfDateien(sid)`
zweimal, `:309/316/320` `await mailGesendetAm()` zweimal. CLAUDE.md,
Prüfstand-Regeln: erst in eine Variable auswerten, dann prüfen UND ausgeben.

### R12 — der `core/`-Scan liest Rohtext und nur die oberste Ebene

`:322`: `/express\.Router\s*\(/` gegen den ROHEN Dateiinhalt — ein Kommentar,
der `express.Router()` nur ERWÄHNT, färbt den Lauf rot („Tests dürfen nicht an
Prosa scheitern"). Dazu: Unterverzeichnisse von `core/` werden nicht gesehen,
und ein Verzeichnis namens `*.js` liesse `readFileSync` mit EISDIR den ganzen
Lauf abreissen. Behebung: Kommentare abziehen, rekursiv laufen, Verzeichnisse
überspringen — und eine Positivkontrolle, dass nach dem Kommentarabzug noch
etwas übrig ist.

### R13 — vierte wörtliche Kopie des PDF_ROOT-Sicherheitsblocks

In `test_feature_get_schreibt_nicht.js:128-138` und
`test_feature_haertung_csrf_end_zu_ende.js:227-237`, dazu zwei Bestandskopien.
`test/helfer/env-pfade-scratch.js` existiert genau dafür und sagt das in
seinem eigenen Kopf. Behebung: ein `pruefePdfRootSicher(...)` im Helfer, EINE
Quelle. **Die beiden Bestandskopien mitziehen oder begründen, warum nicht.**

### R14 — falsche Zeilennummer in `docs/OFFENE-SICHERHEITSPUNKTE.md:59`

Dokument sagt `routes/wartung.js:1559`, tatsächlich `1567`. In derselben
Liste, die behauptet, die Nummern seien „die AKTUELLEN". Behebung: besser auf
Datei plus Routenname verweisen statt auf eine Zeile — dann veraltet es nicht.

### R15 — toter Gleichheitstest in `core/csrf-schutz.js:19`

`pfad === a || pfad.startsWith(a)` — der linke Operand kann das Ergebnis nie
ändern. Diese Funktion ist seit diesem Beitrag exportiert und die massgebliche
Definition der Ausnahme; sie soll so knapp lesbar sein, wie sie wirkt.
**Produktivcode — miss vorher, dass wirklich kein Fall existiert, in dem sich
etwas ändert**, und sag es, wenn doch.

---

## Reihenfolge

**Zuerst R1 und R2** — der eine ist eine Regression im Produktivcode, der
andere die fehlende Zusicherung für das, worum es im ganzen Beitrag geht.
Danach R3–R6, dann der Rest.

## Gegenproben

Zu jedem Befund eine eigene, bleibende Gegenprobe: Defekt einbauen, ROT
messen, zurücknehmen, GRÜN messen, beides wörtlich. Meine Messungen oben sind
der Vergleichswert für den ALTEN Stand — miss sie nach, und widersprich, wenn
eine nicht trifft.

Regeln unverändert: Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei
≠ 1 Treffer, Marker (`GEGENPROBE-` + `DEFEKT`) in derselben Zeile,
`node --check` vor dem Lauf, Rücknahme ausschliesslich über eine per `cp`
beiseitegelegte Kopie mit `diff` EXIT 0.

## Pflichten

Unverändert: früh committen und pushen; volle Suite selbst fahren
(`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`, ohne Pipe, ohne
äusseres `flock`); während der Suite keine Dateien ändern; Dateizahl-Ritual
als Mengenvergleich mit `diff` EXIT 0 (mein Vergleichswert auf diesem Kopf:
**334 = 334**); `npm run lint` fahren und WÖRTLICH melden; Marker-Scan vor
jedem Commit (Sollwert 6).

**Neu:** R1 und R6 fassen Produktivcode an, R15 auch. Für R6 gilt zusätzlich
die Bagatellgrenze NICHT — ein geänderter Mailtext ist eine Aussage an den
Benutzer und bekommt eine Zusicherung.

## Bericht

Wörtliche Testausgaben. Je Gegenprobe die Zahlen VOR, MIT und NACH der
Mutation, plus der `diff`-Exit. Dazu jede meiner Messungen oben, die sich
beim Nachmessen als falsch erwiesen hat.
