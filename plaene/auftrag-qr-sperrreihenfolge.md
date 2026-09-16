# Auftrag — `beanspruche()` bekommt eine kanonische Sperrreihenfolge

Arbeitsbaum `/home/user/gymdocu`, Zweig `claude/qr-zuordnung-sperrreihenfolge`
ab `master` = `7abea9f`, sauber, gehört dir allein.

**Einordnung (Vorgabe der CLAUDE.md, vor dem Auftrag getroffen):** Standard-
Executer, nicht Fable. Eine Funktion, eine kanonische Reihenfolge — und der
schwierige Teil (den `40P01` wirklich herstellen) ist unten benannt und hat
seit gestern ein gemessenes Vorbild im selben Repo.

## Der Befund — dreimal eingetreten, nicht vermutet

`test_feature_qr_zuordnung.js`, Fall **(e1)**: zwei gleichzeitige
`beanspruche()`-Aufrufe über dieselbe Nummernspanne verklemmen sich, einer
wird mit `40P01` abgebrochen.

Aus dem Postgres-Log des CI-Laufs 1136 vom 16.09.2026, wörtlich:

    2026-09-16 12:00:33.783 UTC [1095] ERROR:  deadlock detected
    DETAIL:  Process 1095 waits for ShareLock on transaction 28003;
             blocked by process 1086.
      Process 1086 waits for ShareLock on transaction 28004; blocked by 1095.
      Process 1095: UPDATE qr_token SET studio_id = $1, beansprucht_am = $2
               WHERE nummer BETWEEN $3 AND $4 AND studio_id IS NULL
                 AND charge_id IN (SELECT id FROM qr_charge
                                   WHERE studio_id IS NULL OR studio_id = $1)
               RETURNING nummer
      Process 1086: dasselbe UPDATE

Dreimal belegt: 28.08.2026 (Deploy 180 `skipped`), 13.09.2026 (Deploy 390
`skipped`), 16.09.2026 (ein PR blockiert). Karte #233, dort im Kommentar vom
13.09. und 16.09. durchdiagnostiziert.

**Die Ursache liegt nicht im Planer, sondern eine Ebene darüber:**
`beanspruche()` (`core/qr-zuordnung.js:440`, das UPDATE bei `:517`) schreibt
mit EINEM Statement über eine Nummernspanne und überlässt die
Sperrreihenfolge dem Scan. Zwei Aufrufer haben damit keine gemeinsame
Ordnung — nicht, weil jemand zwei verschiedene gewählt hätte, sondern weil
KEINER eine gewählt hat.

Die Karte nennt `synchronize_seqscans` (Vorgabe `on`) als plausiblen Weg zur
Ungleichordnung und sagt ausdrücklich dazu: **vermutet, nicht gemessen.** Das
bleibt so. Du musst es nicht messen — die Behebung setzt eine Ordnung, egal
woher die Ungleichordnung kommt.

## Das Vorbild im eigenen Repo — nachlesen, nicht neu erfinden

Beitrag 2b-1 (#448, gemergt `eb276d9`) hat gestern GENAU DIESE KLASSE
geschlossen: der Nutzungsnachtrag sperrte Defektzeilen in der Reihenfolge der
abgeschickten Formularfelder, die Ausmusterung aufsteigend nach `id`. Dort
wurde der `40P01` zum ersten Mal wirklich hergestellt und durch eine
kanonische Sortierung beseitigt (`routes/sichtpruefung.js`, die
`.sort()`-Zeile mit ihrem Kommentar — lies sie, samt der Begründung, warum
sie NACH dem `.slice()` steht).

## Zu bauen

`beanspruche()` sperrt die betroffenen Zeilen zuerst in **kanonischer
Reihenfolge** und schreibt danach — beides in EINER Transaktion:

    SELECT nummer FROM qr_token
     WHERE nummer BETWEEN $von AND $bis AND studio_id IS NULL
       AND charge_id IN (...)
     ORDER BY nummer
     FOR UPDATE

dann das bestehende UPDATE mit denselben Bedingungen.

**Drei Dinge, die dabei schiefgehen können — lies sie, bevor du tippst:**

1. **`db.q`/`db.run` benutzen den POOL, nicht die Transaktionsverbindung**
   (`core/db.js:421-432`). Ein `SELECT … FOR UPDATE` über `db.q` hält seine
   Sperre nur bis zum Ende seiner eigenen impliziten Transaktion — also gar
   nicht. Beide Anweisungen müssen über dasselbe übergebene `t` laufen.
2. **`db.tx()` rollt nur bei einem GEWORFENEN Fehler zurück.** Ein
   zurückgegebenes Fehlerobjekt ist kein Abbruch.
3. **Die Fehlerwege von `beanspruche()` werfen `QrZuordnungFehler`** (siehe
   `:452`, `:493`, `:505`). Diese Würfe stehen VOR dem Schreiben und dürfen
   nicht in eine Transaktion geraten, die dadurch sinnlos eröffnet und
   zurückgerollt wird. Zieh die Transaktion so eng wie möglich um Sperren
   und Schreiben.

**Prüf, ob `beanspruche()` heute überhaupt schon in einer Transaktion
läuft** — ich habe es NICHT nachgesehen, das ist ein Fundort, kein Befund.
Läuft es unter Autocommit, ist das Einführen der Transaktion selbst schon
eine Verhaltensänderung: sag im Bericht, welche Aufrufer betroffen sind.

**Und die Frage, die bei uns zu jedem Zusammenziehen gehört:** welche
ANDEREN Transaktionen fassen `qr_token` an, und in welcher Reihenfolge nehmen
sie Sperren? `auditAppend()` nimmt einen STUDIOWEITEN Advisory-Lock
(`core/integritaet.js:65`) — auch mit übergebenem `t`. Zähl die Schreibwege
auf `qr_token` und sag, ob durch die neue Transaktion eine gegenläufige Kante
entsteht. Wenn ja: **melden, nicht heimlich lösen.**

## Gegenproben — hier liegt die eigentliche Arbeit

1. **Den `40P01` VORHER wirklich erzeugen.** Zwei echte `pg`-Verbindungen,
   Wegwerf-DB (Name MUSS auf `_test` oder `_e2e` enden, sonst greift die
   Sperre in `core/db.js`; ohne `-O "$TEST_ROLE"` beim `createdb` scheitert
   alles mit `permission denied for schema public`). T1 sperrt Nummer A dann
   B, T2 sperrt B dann A. Erwartung: `40P01`. **Ohne diesen Nachweis ist die
   Behebung eine Vermutung** — genau diesen Satz hat gestern die Runde 6 von
   2b-1 getragen.
2. **NACHHER ausbleiben lassen**, derselbe Aufbau, beide Seiten kanonisch:
   beide kommen durch, eine wartet.
3. **Eine Zusicherung, die FÄLLT, wenn die Sortierung fehlt.** Eine
   `ORDER BY`-Klausel ohne Test ist ein stiller Schutz. Miss BEIDE
   Richtungen: ohne `ORDER BY nummer` muss sie rot werden. Der Sollwert darf
   NICHT aus derselben Quelle stammen wie die Sortierung — schreib die
   erwartete Reihenfolge literal hin.
4. **(e1) muss weiterhin das prüfen, was es verspricht.** Der Fall zerlegt
   heute die Verteilung von 40 Nummern auf zwei Aufrufer. Nach der Behebung
   darf er nicht dadurch grün werden, dass beide Aufrufer nacheinander
   laufen und der zweite nichts mehr findet — dann prüfst du eine
   Serialisierung, keine Verteilung. **Sag im Bericht, wie du das
   ausgeschlossen hast.**
5. **Kein Wiederholen bei `40P01`.** Das verdeckt die Ursache, statt sie zu
   beseitigen. Ausdrückliche Vorgabe, keine Empfehlung.

## Was NICHT zu tun ist

- Keine Änderung an der Fachlogik von `beanspruche()` — die fünf Gruppen,
  die Chargenbesitz-Prüfung, `MENGE_MAX`, die Fehlerarten bleiben, wie sie
  sind. Das ist eine Sperrreihenfolge, keine Umgestaltung.
- Nichts an den Seilkontroll-Fällen der Karte #233. Anderer Mechanismus
  (Reihenfolge und Zustand aus Vorgängerdateien), eigener Auftrag.
- Die Härtung in (e1) von 13.09.2026 (laut durchfallen statt abstürzen)
  bleibt stehen, auch wenn die Verklemmung weg ist. Sie hat sich am 16.09.
  bewährt: 301 PASS blieben messbar statt abzureissen.
- **Testabfragen ohne `studio_id` sind KEIN Befund.**

## Abschluss

1. Volle Suite SELBST: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`
2. Dateizahl-Ritual, breites Muster, MIT `sed 's/── //; s/ ──//'` auf der
   Log-Seite. Stand heute 324 = 324, `diff` EXIT 0 — kommt eine Testdatei
   dazu, nenn die neue Zahl und woher die Abweichung kommt.
3. `npm run lint` — wörtlich, AUCH bei Grün.
4. Marker-Scan, Sollwert 6.
5. Committen und pushen, BEVOR du auf einen langen Lauf wartest.

**Melde wörtlich:** die Zahlen aus Gegenprobe 1 und 2 (den `40P01` selbst),
beide Richtungen von Gegenprobe 3, deine Antwort auf Gegenprobe 4, die Liste
der Schreibwege auf `qr_token`, Suite-Exit, Dateizahl, Lint, Marker.

**Widersprich mir mit einer Messung, wenn eine Vorgabe nicht trägt.** In den
letzten Runden hatten Ausführende damit mehrfach recht, und einmal hat es
einen falschen Satz aus meinem Bericht an den Betreiber geholt.
