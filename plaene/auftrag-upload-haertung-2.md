# Auftragspapier — Upload-Härtung Beitrag 2 (U1 + U2)

Stand 18.09.2026. Basis ist `78310b5` (#457) plus der Doku-Beitrag #458.
**Dieses Papier geht VOR der ersten Bau-Runde an den Gegenleser** (Regel vom
18.09.2026); es ist noch kein Auftrag an den Executer.

Gebündelt werden zwei kleine, unabhängig gemessene Punkte aus
`docs/offene-befunde-31-08-2026.md`, Abschnitt „OFFEN (18.09.2026)".

---

## Teil A — U1: ein abgebrochener Upload darf keinen Telegram-Alarm auslösen

### Was gemessen ist (nicht angenommen)

Echter Socket-Abbruch gegen einen lokalen Express+multer-Aufbau
(`Content-Length` 5 MiB angekündigt, 64 KiB gesendet, `socket.destroy()`):

    konstruktor : Error          MulterError?: false
    message     : Request aborted
    code        : undefined      type: undefined      status: undefined
    req.aborted : true           req.complete: false   req.destroyed: true

Der Abbruch geht durch die Wrapper an `next(err)` (richtig — er ist kein
Eingabefehler), erreicht den globalen Handler `server.js:1467`, der
ausschliesslich `entity.too.large`/413 abfängt, und landet bei
`errorTracker.melde()` (`:1488`). `melde()` hat keine Ausnahmeliste.

### Zwei Sackgassen, die das Papier ausdrücklich ausschliesst

1. **NICHT auf `err.code === 'ECONNABORTED'` filtern.** Gemessen `undefined`.
   So stand es in meiner ersten Notiz; der Bau darauf wäre grün
   durchgelaufen und hätte nichts bewirkt.
2. **NICHT primär auf die Meldung `Request aborted`.** Eine Meldung ist
   versionsabhängig. Höchstens als zweites, bestätigendes Merkmal.

### Der Entwurf

Merkmal am REQUEST, nicht am Fehler: `req.complete === false` (Node-Core-
Eigenschaft von `IncomingMessage`). Ergänzend `req.aborted`.

**`melde()` tut zwei Dinge, und nur EINES wird unterdrückt:**

- `console.error('[ERR-TRACK] …')` bleibt — der Abbruch bleibt nachweisbar.
- `telegram(...)` entfällt.

Wer den Fehler ganz verschluckt, macht auch einen echten Serverfehler
unsichtbar, der zufällig während eines abgebrochenen Requests auftritt.
Das ist die Klasse „eine Behebung kann Wächter blind machen"; sie ist hier
vermeidbar, also wird sie vermieden.

### Wächterkarte — VORHER erhoben, das ist die Lehre aus #457

Bei #457 fing ein bestehender Wächter die Verhaltensänderung und stoppte den
Deploy, weil in keinem der drei Aufträge stand, vorher nach solchen Wächtern
zu suchen. Deshalb hier zuerst:

**16 Testdateien fassen den Fehlerweg an.** Selbst gemessen, die drei
relevanten:

- **`test_feature_upload_fehlerbehandlung.js`** (meine eigene, aus #457)
  sichert an vier Stellen zu: „`errorTracker.melde()` wurde GENAU EINMAL
  gerufen". Sie stubbt `melde()` und zählt AUFRUFE. Ein Filter INNERHALB
  von `melde()` bricht sie folglich **nicht** — aber genau deshalb ist die
  neue Unterscheidung von ihr auch **nicht abgedeckt**.
- **`test_feature_error_tracking.js`** bewacht ausschliesslich die
  Signatur-Schwärzung (Token in Pfaden), **nicht** den Telegram-Weg.
  Gemessen: `grep` nach `telegram` dort → 0 Treffer.
- **`test_feature_keine_stillen_fehler.js`** ist ein statischer Wächter über
  leere `catch`-Blöcke mit **exaktem** Zahlenvergleich (nicht `≤`; die
  Verschärfung steht im Kopf der Datei). Wer einen `catch` hinzufügt ODER
  entfernt, zieht die Obergrenze nach — sonst wird der Lauf rot, und zwar
  zu Recht.

**Folge: der Telegram-Weg ist heute von KEINEM Wächter abgedeckt.** Eine
neue Zusicherung ist also Pflicht, sonst ist die Behebung unbewacht.

### Wie die neue Zusicherung aussieht — ohne echten Dienst

`melde()` gibt `{signatur, senden, unterdrueckt}` zurück. `senden` ist der
Schalter, den die Behebung umlegt. Zugesichert wird an diesem Rückgabewert,
**nicht** an einem echten Telegram-Aufruf — dieselbe Suite läuft auf dem
Live-Server als Deploy-Gate, ein Test darf dort keinen Dienst anfassen.

Verlangt sind beide Richtungen, wörtlich zu melden:

- abgebrochener Request → `senden === false`, UND das `[ERR-TRACK]`-Log ist
  trotzdem geschrieben (das ist die Hälfte, die man leicht vergisst);
- gewöhnlicher Serverfehler bei vollständigem Request → `senden === true`
  (Positivkontrolle: die Zusicherung kann überhaupt fallen);
- `melde(err, null, 'unhandledRejection')` (kein `req`) → unverändert
  `senden === true`; ein fehlendes `req` darf nicht als Abbruch gelten.

Der letzte Fall ist der gefährlichste: wer `req && req.complete === false`
falsch herum schreibt, schaltet Telegram für ALLE Prozessfehler ab.

---

## Teil B — U2: Löschreihenfolge in `/etage/:id/loeschen`

Gemessen am Quelltext (`routes/lageplan.js:603` ff.): `fs.unlinkSync(p)`
steht VOR `DELETE FROM etagen`. Scheitert das DELETE, ist die
Grundrissdatei unwiderruflich weg und der Datensatz zeigt weiter auf sie.

Dieselbe Klasse, die #457 in BEIDEN Schreibwegen behoben hat — dort wurde
die Löschung hinter Schreiben und UPDATE gezogen. Hier gehört sie hinter das
DELETE.

**Zwei Dinge, die dabei zu beachten sind:**

1. `unlinkSync()` lässt sich nie zurückrollen. Die Löschung gehört NACH den
   Commit, nicht in die Transaktion (Hausregel, `core/db.js:421-432`).
2. Die Gegenprobe muss das DELETE künstlich scheitern lassen und messen,
   dass die Datei DANACH noch da ist. Ohne diese Richtung ist die
   Zusicherung Dekoration — sie wäre auch grün, wenn gar nichts gelöscht
   würde.

---

## Was NICHT Teil dieses Beitrags ist

- **U8** (Erlaubnisliste statt `startsWith('image/')`). Braucht eine eigene
  Vorabmessung, welche MIME-Typen im Bestand wirklich ankommen; eine Liste,
  die HEIC vom iPhone aussperrt, tauscht einen theoretischen Punkt gegen
  einen echten Ausfall.
- **U3** (Ernter für `lageplan-uploads/`) — eigener Beitrag, eigener Zeitplan.
- **U4–U7** — Aufräumarbeiten ohne Dringlichkeit.

## Offene Frage an den Gegenleser

Gibt es einen Zustand, in dem `req.complete === false` gilt, OHNE dass der
Client abgebrochen hat — und in dem ein echter Serverfehler dadurch
lautlos würde? Das ist die Frage, an der dieser Entwurf hängt; ich habe
sie am Kontrollfluss nicht abschliessend beantworten können.
