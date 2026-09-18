# Auftragspapier — Upload-Härtung Beitrag 2 (U1 + U2)

**Fassung 2, 18.09.2026.** Fassung 1 ging als Planprüfung an den Gegenleser;
**neun Befunde, alle neun selbst nachgemessen, alle neun getragen** — zwei
davon blockierend und gegen den Entwurf selbst. Diese Fassung ist die Antwort
darauf. Basis ist `03f0c3c`.

Immer noch kein Auftrag an den Executer: erst wenn dieses Papier steht.

---

## Was aus Fassung 1 WIDERLEGT ist — zuerst, damit es niemand wieder einbaut

**1. `req.complete === false` ist KEIN Abbruchmerkmal.** Fassung 1 wollte
darauf filtern. Selbst nachgemessen an einem echten Serverfehler während eines
laufenden, NICHT abgebrochenen Uploads:

    err.message   : echter Serverfehler, nichts mit Upload zu tun
    req.complete  : false        <- der geplante Filter hätte ihn verschluckt
    req.aborted   : false
    req.destroyed : false

`req.complete` heisst „HTTP-Nachricht noch nicht vollständig empfangen und
geparst", nicht „Client hat abgebrochen". Ein Filter darauf hätte echte
Serverfehler stumm geschaltet — dieselbe Klasse, die dieser Beitrag beheben
soll, nur in die andere Richtung und in der Produktion.

**2. Die Wächterkarte aus Fassung 1 war falsch.** Dort stand,
`test_feature_error_tracking.js` bewache „ausschliesslich die
Signatur-Schwärzung". Nachgemessen ruft die Datei das ECHTE `melde()` an
sieben Stellen und prüft `senden` (12×), `unterdrueckt` (6×), `_state`,
Drosselverhalten, `baueText` (11×) und echte Express-Roundtrips. Mein
grep-Muster hatte nur einen Ausschnitt erfasst, und `grep telegram` → 0
Treffer hatte ich als „keine Verhaltensabdeckung" gelesen — ein negatives
Ergebnis ohne Positivkontrolle. **Ein Filter innerhalb von `melde()` KANN
also bestehende Zusicherungen brechen.**

---

## Teil A — U1: ein abgebrochener Upload darf keinen Telegram-Alarm auslösen

### Was gemessen ist

Echter Socket-Abbruch (`Content-Length` 5 MiB angekündigt, 64 KiB gesendet,
`socket.destroy()`) gegen einen lokalen Express+multer-Aufbau:

    konstruktor : Error          MulterError?: false
    message     : Request aborted
    code        : undefined      type: undefined      status: undefined
    req.aborted : true           req.complete: false

Der Abbruch geht durch die Wrapper an `next(err)` (richtig — kein
Eingabefehler), erreicht den globalen Handler `server.js:1467`, der
ausschliesslich `entity.too.large`/413 abfängt, und landet bei
`errorTracker.melde()` (`:1488`). `melde()` hat keine Ausnahmeliste.

**`req.aborted` unterscheidet die beiden Fälle** (Abbruch `true`, echter
Fehler während Upload `false`) — `req.complete` tut das nicht.

### Drei Sackgassen, die dieses Papier ausschliesst

1. **NICHT `err.code === 'ECONNABORTED'`** — gemessen `undefined`.
2. **NICHT die Meldung `Request aborted`** — versionsabhängig, höchstens als
   zweites, bestätigendes Merkmal.
3. **NICHT `req.complete === false`** — siehe oben, verschluckt echte Fehler.

### Der Entwurf, Fassung 2: an der QUELLE markieren statt in `melde()` raten

Die Entscheidung fällt dort, wo der Kontext bekannt ist — im Upload-Wrapper,
der weiss, dass er gerade einen Body gelesen hat. Nicht in einer generischen
Meldefunktion, die aus Requestzuständen raten muss.

- Ein gemeinsamer Helfer (neben `istUploadEingabefehler`) erkennt den
  Transportabbruch **positiv**: kein `MulterError`, kein eigener Filtertext,
  UND `req.aborted === true`. Er markiert den Fehler
  (`err.transportabbruch = true`) und reicht ihn unverändert an `next(err)`
  weiter — am Statuscode und am Kontrollfluss ändert sich nichts.
- `melde()` prüft **nur diese Markierung**, nicht den Requestzustand.

Damit bleibt der Filter zentral (ein Helfer, alle Wrapper) und trifft trotzdem
nur Fälle, die eine Upload-Route positiv als Abbruch erkannt hat. Ein
Serverfehler aus einer beliebigen anderen Middleware kann die Markierung nie
tragen.

**Was `melde()` tut und was NICHT:**

- `console.error('[ERR-TRACK] …')` bleibt — der Abbruch bleibt nachweisbar.
- `telegram(...)` entfällt.
- **Der Drosselzustand wird NICHT angefasst.** Begründung unten.

### Der Drosselzustand darf nicht verbraucht werden — gemessen

Läge der Filter NACH `pruefeDrossel()`, hätte ein Abbruch den ersten
Sendeplatz verbraucht. Selbst gemessen:

    1. Abbruch                         -> senden: true   (Sendeplatz weg)
    2. ECHTER Fehler gleicher Signatur -> senden: false, unterdrueckt: 1
    Gegenprobe ohne vorangehenden Abbruch -> senden: true
    DROSSEL_MS = 900000  (15 Minuten)

**Und es wäre mandantenübergreifend.** Die Signatur trägt keine `studio_id` —
selbst gemessen:

    Studio 1 : Error:POST /u
    Studio 99: Error:POST /u        IDENTISCH

Ein abgebrochener Upload in einem Studio hätte also einen echten Serverfehler
eines ANDEREN Studios auf derselben Route bis zu 15 Minuten stumm geschaltet.
Der Filter gehört deshalb VOR `pruefeDrossel()`.

### Wächterkarte — berichtigte Fassung

**16 Testdateien fassen den Fehlerweg an.** Die drei relevanten, jeweils nach
dem, was sie WIRKLICH zusichern:

| Datei | sichert zu | blind gegenüber einem Filter in `melde()`? |
|---|---|---|
| `test_feature_upload_fehlerbehandlung.js` | `melde()` GENAU EINMAL gerufen (vier Stellen) — stubbt `melde()`, zählt AUFRUFE | **ja**, blind |
| `test_feature_error_tracking.js` | ruft das ECHTE `melde()`, prüft `senden`, `unterdrueckt`, `_state`, Drossel, `baueText`, Express-Roundtrips | **nein** — kann fallen |
| `test_feature_keine_stillen_fehler.js` | statisch: `alle.length === OBERGRENZE` (60), exakt | nur bei geänderter catch-ZAHL |

**Zur dritten Zeile, ebenfalls ein Befund der Prüfung:** Der Vergleich ist
eine ZAHL, keine MENGE (`test_feature_keine_stillen_fehler.js:122-138`). Wer
einen leeren catch entfernt und andernorts einen hinzufügt, bleibt bei 60 und
der Lauf bleibt grün. Fassung 1 behauptete, „jedes Hinzufügen oder Entfernen"
werde bemerkt — das ist zu stark und hier berichtigt. Das ist unsere eigene
Hausregel („eine Zusicherung über eine ZAHL ist keine über eine MENGE"),
angewandt auf unseren eigenen Wächter; ihre Behebung ist NICHT Teil dieses
Beitrags, sondern ein eigener offener Punkt.

### Die Zusicherung — am TRANSPORT, nicht am Rückgabewert

Fassung 1 wollte an `{senden}` zusichern. Das reicht nicht: eine Umsetzung
könnte `senden: false` zurückgeben und trotzdem `telegram()` rufen, oder
umgekehrt. Der Rückgabewert beschreibt den Schalter, nicht die Wirkung.

**Verlangt ist ein Transport-Stub**, der die Sendeversuche zählt, und
Zusicherungen mit UNABHÄNGIG hingeschriebenen Sollwerten:

- markierter Transportabbruch → **0 Senderaufrufe**, UND das
  `[ERR-TRACK]`-Log ist geschrieben, UND der Drosselzustand ist unverändert;
- gewöhnlicher Serverfehler bei vollständigem Request → **1 Senderaufruf**
  mit geprüftem Inhalt (Positivkontrolle: die Zusicherung kann fallen);
- echter Serverfehler WÄHREND eines laufenden Uploads (`complete:false`,
  `aborted:false`, keine Markierung) → **1 Senderaufruf**. Das ist der Fall,
  an dem Fassung 1 gescheitert wäre;
- `melde(err, null, 'unhandledRejection')` ohne `req` → **1 Senderaufruf**.
  Der gefährlichste Fall: wer `req && …` falsch herum schreibt, schaltet
  Telegram für ALLE Prozessfehler ab;
- Abbruch, DANN echter Fehler gleicher Signatur innerhalb des
  Drosselfensters → der zweite **erreicht** den Stub.

### Testisolation — bevor der erste Aufruf läuft

**Gemessen, mit Positivkontrolle:** `telegram()` holt seine Zugangsdaten aus
`process.env` UND als Rückfall aus `/etc/environment`
(`core/error-tracker.js`, Zeilen ~40-55); ohne sie ist es still
(`if (!bot || !chat) return false`). Mit gesetzten Zugangsdaten erzeugt
`test_feature_error_tracking.js` heute **7 Sendeversuche an
api.telegram.org**, ohne sie **0** — und bleibt dabei unauffällig grün
(69 PASS / 0 FAIL).

**Ehrliche Einordnung, weil die Erreichbarkeit NICHT entscheidbar ist:** Der
Actions-Weg fährt die Suite ausdrücklich nicht, die CI setzt keine
Zugangsdaten, und der Hand-Deploy liegt auf dem Server unter
`/usr/local/bin/`. Aus dem Repo heraus lässt sich also nicht belegen, dass
heute Nachrichten hinausgehen. Das ist eine **latente Waffe, kein belegter
laufender Schaden** — und ein Grund, die Isolation in diesem Beitrag
mitzunehmen statt sie als Notfall zu behandeln.

Verlangt: die Transportgrenze samt Credential-Rückfall wird isoliert, **bevor**
der erste Testaufruf läuft. Kein Test dieses Beitrags darf einen echten Dienst
erreichen können, auch nicht versehentlich.

---

## Teil B — U2: Löschreihenfolge in `/etage/:id/loeschen`

Gemessen (`routes/lageplan.js:603` ff.): `fs.unlinkSync(p)` steht VOR
`DELETE FROM etagen`. Scheitert das DELETE, ist die Grundrissdatei
unwiderruflich weg und der Datensatz zeigt weiter auf sie.

**Zusätzlich gemessen, und es ändert die Behebung:** der Weg läuft OHNE
Transaktion — `db.one` und `db.run` sind zwei Autocommit-Vorgänge über den
Pool. Zwischen SELECT und DELETE kann ein paralleler Upload
`grundriss_datei` austauschen; dann löscht der Code die alte Datei, das DELETE
entfernt die Zeile mit der NEUEN, und die neue bleibt verwaist.

**Deshalb nicht nur verschieben, sondern die Quelle wechseln:** der Dateiname
kommt aus `DELETE … WHERE studio_id=$1 AND id=$2 RETURNING grundriss_datei`,
also aus der tatsächlich gelöschten Zeile. Gelöscht wird erst danach.
`unlinkSync()` lässt sich nie zurückrollen und gehört nach den Commit, nicht
in eine Transaktion (`core/db.js:421-432`).

### Gegenproben — BEIDE Richtungen, der Erfolgsfall ist Pflicht

Fassung 1 verlangte nur „DELETE scheitert → Datei bleibt". Das wäre auch bei
vollständig entferntem `unlinkSync` grün geblieben — der Vorzustand erzwingt
das Ergebnis ohnehin. Verlangt sind deshalb beide:

- **Erfolgsfall:** vor bestätigtem Commit kein Unlink; danach wird **genau
  die zugehörige** Datei entfernt und keine andere.
- **Fehlerfall:** DELETE künstlich zum Scheitern gebracht → Datensatz UND
  Datei unverändert.

### Mandantentrennung ist Abnahmekriterium, auch im Test

**Gemessen:** die Testvorlage aus #457
(`test_feature_upload_fehlerbehandlung.js`) liest `etagen` an fünf Stellen mit
`WHERE id=$1` OHNE `studio_id` (Zeilen 570, 596, 627, 646, 668). Der
Produktionscode ist korrekt gefiltert (`WHERE studio_id = $1 AND id=$2`) —
es ist also **kein Leck**, aber die Vorlage darf nicht unverändert übernommen
werden.

Verlangt: jede Abfrage, auch jede Testabfrage, bindet `studio_id`. Dazu ein
Fremdmandantenfall — ein Löschversuch von Studio A gegen eine Etage von
Studio B lässt deren Datensatz UND Datei unverändert.

---

## Was NICHT Teil dieses Beitrags ist

- **U8** (Erlaubnisliste statt `startsWith('image/')`) — braucht eine eigene
  Vorabmessung der wirklich ankommenden MIME-Typen.
- **U3** (Ernter für `lageplan-uploads/`) — eigener Beitrag.
- **U4–U7** — Aufräumarbeiten ohne Dringlichkeit.
- **Der Mengenschutz für `test_feature_keine_stillen_fehler.js`** — neu
  aufgenommen aus dieser Prüfung, eigener Beitrag.

## Was diese Fassung dem Gegenleser schuldet

Die offene Frage aus Fassung 1 ist beantwortet, und zwar gegen den Entwurf.
Eine zweite Prüfrunde ist nach unserer Rundenregel fällig, weil die Behebung
VERHALTEN ändert statt nur eine Zusicherung zu ergänzen — der Entwurf ist ein
anderer als der geprüfte.
