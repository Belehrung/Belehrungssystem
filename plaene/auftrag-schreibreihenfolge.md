# Auftragspapier — Schreibreihenfolge: nichts Unwiderrufliches auf der falschen Seite eines fehlbaren Schritts

**Repo:** GymDocu (`/home/user/gymdocu`, Stand `4c4b729`).
**Herkunft:** B1-03 (SOL-3) aus `plaene/durchgang-befunde.md` und F1/F2 aus
`plaene/befund-datei-vs-commit.md` — drei Fundstellen, EINE Klasse.
**Warum das vorgeht** (STAND.md, Regel 5): Datenintegrität ist Punkt 4 der
Prüfreihenfolge; F1 erzeugt im Fehlerfall eine dauerhaft nicht auslieferbare
Belehrung, also Datenverlust im scheinbaren Erfolgszustand.

---

## 0. Die Klasse, in einem Satz

Ein Schritt, der sich nicht zurücknehmen lässt (ein bereits committetes
`db.run`/`db.one` über den POOL, ein `fs.unlink`), steht VOR einem Schritt,
der werfen kann. Wirft der zweite, bleibt der erste stehen — und niemand
räumt ihn auf.

**Die gemeinsame Ursache ist gemessen und steht in CLAUDE.md:** `db.q` und
`db.run` benutzen den POOL, nicht die Transaktionsverbindung
(`core/db.js:421-432`). Jeder Aufruf ist seine eigene, abgeschlossene
Transaktion. Eine Folge von `db.run` ist deshalb keine Folge von Schritten,
sondern eine Folge von Tatsachen.

---

## 1. Die drei Fundstellen, je mit gemessener Prämisse

### S1 — `POST /geraetewartung/geraet/neu` (`routes/admin/geraete.js:5417`)

Gemessen am Quelltext (Zeilen am Stand `4c4b729`, **vor dem Bau neu messen**):

    const result = await db.one(`INSERT INTO wartung_geraete … RETURNING id`);  // 5486, COMMITTET
    for (const text of aufgabenListe) {
        await db.run(`INSERT INTO wartung_geraete_aufgaben …`);                  // 5501, je COMMITTET
    }

Scheitert die zweite Aufgabenzeile, bleiben Gerät und erste Aufgabe stehen,
der Benutzer sieht eine Fehlerseite und legt das Gerät vermutlich erneut an —
danach steht es doppelt, eines davon mit halber Aufgabenliste.

**Behebung:** `db.tx()` um INSERT und Schleife, `t.one`/`t.run` statt
`db.one`/`db.run`.

**Der `auditAppend` (`:5518`) bleibt AUSSERHALB der Transaktion.** Das ist
Absicht, nicht Nachlässigkeit: `auditAppend()` nimmt einen studioweiten
Advisory-Lock (`core/integritaet.js:65`, `pg_advisory_xact_lock(studioId)` —
auch mit übergebenem `t`). Ihn in die neue Transaktion zu ziehen, erzeugt eine
Lock-Reihenfolge, die es unter Autocommit nicht gab, und CLAUDE.md führt einen
BESTEHENDEN, nicht behobenen Verklemmungs-Kreis auf, der genau diesen Lock
enthält. **Wer ihn doch hineinzieht, zählt vorher ab, welche anderen
Transaktionen dieselben Zeilen anfassen und in welcher Reihenfolge sie den
Audit-Lock nehmen — und schreibt das Ergebnis in den Bericht.**

### S2 — `POST /neue-version/:id` (`routes/belehrungen.js:2158`)

    const alteDatei = bel.dateiname;
    await db.run(`UPDATE belehrungen SET dateiname = $1, datei_vorhanden = 1, …`);  // 2170 COMMITTET
    const n = await schalteAlleFrei(req.studioId, bel.id, grund);                    // 2174 kann werfen
    await auditAppend(…);                                                            // 2175 kann werfen
    } catch (e) { if (req.file) fs.unlink(req.file.path, () => {}); }                 // 2180 LÖSCHT

**Gemessene Prämissen** (aus `plaene/befund-datei-vs-commit.md`, dort mit
Belegstellen): das UPDATE ist committet; `schalteAlleFrei()` ist ein blankes
`db.run` mit `INSERT … ON CONFLICT` und schlägt bei jedem DB-Fehler durch;
`auditAppend()` kann über den Advisory-Lock in einen dokumentierten
Verklemmungs-Kreis laufen; und `req.file.path` ist genau die Datei, auf die
`dateiname` jetzt zeigt (multer `diskStorage`: `path` ist der volle Pfad,
`filename` dessen Basisname).

**Folge:** In der Datenbank steht `datei_vorhanden = 1, dateiname = <neue
Datei>` — und die neue Datei ist gelöscht. Die alte liegt noch auf der Platte,
aber **nichts zeigt mehr auf sie**: `alteDatei` war eine lokale Variable in
einem abgestürzten Request.

**Behebung, zwei Teile:**
1. Der `catch`-Zweig löscht die hochgeladene Datei **nur, wenn das UPDATE noch
   nicht gelaufen ist.** Eine Merkvariable (`zeileZeigtAufNeueDatei`) direkt
   nach dem UPDATE setzen und im `catch` abfragen.
2. Der Fehlerfall muss den Benutzer in einen BRAUCHBAREN Zustand bringen, nicht
   nur in einen ehrlichen. Vorzuziehen: das UPDATE NACH `schalteAlleFrei()`
   ausführen, damit der fehlbare Schritt vor dem unwiderruflichen liegt. Dann
   greift der bestehende `catch` wieder richtig, und die alte Version bleibt
   vollständig funktionsfähig.

**Diese beiden Teile schliessen einander aus. Teil 2 ist der bessere Entwurf;
Teil 1 ist der Rückfall, falls die Umstellung der Reihenfolge eine Abhängigkeit
bricht.** Der Ausführende misst, ob `schalteAlleFrei()` den bereits
aktualisierten `dateiname` braucht — tut es das nicht, wird Teil 2 gebaut und
Teil 1 entfällt. **Das ist eine Messung, keine Wahl nach Geschmack, und ihr
Ergebnis gehört wörtlich in den Bericht.**

### S3 — `POST /loeschen/:id` (`routes/belehrungen.js:2286`)

    if (andere === 0) { … fs.unlinkSync(fp) … }                    // 2299 LÖSCHT
    await db.run("UPDATE belehrungen SET datei_vorhanden = 0 …");   // 2302 kann werfen

Wirft das UPDATE, sagt die Datenbank weiter `datei_vorhanden = 1`, während die
Datei weg ist. Der Eintrag bleibt als „vorhanden" gelistet und ist nicht
abrufbar.

**Behebung:** UPDATE zuerst, Dateilöschung danach. Das ist hier ohne Abwägung
möglich, weil es ohnehin eine Löschabsicht ist: scheitert die Dateilöschung
nach erfolgreichem UPDATE, bleibt eine verwaiste Datei auf der Platte — das ist
Müll, kein Datenverlust, und der bestehende `catch {}` um `unlinkSync` bleibt
damit vertretbar.

### S4 — `POST /geraetewartung/geraet/frist-bestaetigen/:id` (`routes/admin/geraete.js:6350`)

**Nachgetragen 19.09.2026** aus B1-05 (SOL-5). Andere Klasse als S1-S3
(Wettlauf statt Reihenfolge), aber dieselbe Datei und dieselbe Behebungsform —
deshalb hier statt in einem fünften Papier.

Gemessen:

    const g = await db.one("SELECT kategorie_id, frist_herkunft, frist_festgelegt_am
                            FROM wartung_geraete WHERE id=$1 AND studio_id=$2");   // :6353, POOL
    if (g.frist_herkunft === … && !g.frist_festgelegt_am) {                        // :6355
        await db.run("UPDATE wartung_geraete SET frist_festgelegt_am=$1,
                      frist_festgelegt_von=$2 WHERE id=$3 AND studio_id=$4");      // :6363
        await auditAppend(…);                                                       // :6366
    }

**Kein `db.tx`, keine Sperre, und die `WHERE` trägt KEINE Zustandsbedingung.
`rowCount` liest niemand.** Zwei parallele Requests lesen beide
`frist_festgelegt_am IS NULL`, bestehen beide die Prüfung, schreiben beide —
der zweite überschreibt Datum und Namen des ersten — und hängen **ZWEI**
Einträge in die gehashte Audit-Kette.

**Der Kommentar darüber (`:6345-6349`) verspricht wörtlich das Gegenteil:**
„sonst könnte ein zweiter Klick (offener Tab, Doppel-Submit) eine echte, schon
bestehende Bestätigung stillschweigend überschreiben". Die Zusicherung steht
im Kommentar, nicht im Code.

**Behebung:** die Zustandsbedingung in die `WHERE`
(`AND frist_herkunft = $ AND frist_festgelegt_am IS NULL`), `rowCount` lesen,
und **den `auditAppend` nur bei `rowCount === 1`**. Keine neue Sperre nötig —
die Zeilensperre des UPDATE plus die Bedingung machen es atomar. Damit
entfällt auch das `if` davor als alleiniger Schutz.

**Zusicherung Z4** (zusätzlich zu Z1-Z3 oben):

* Zwei parallele Requests → **genau ein** UPDATE wirkt, **genau ein**
  Audit-Eintrag entsteht, und der gespeicherte Name ist der des ERSTEN.
* **Beleg, dass es überhaupt zur Überschneidung kam** (sonst ist die Probe
  grün, wenn die eine Seite zufällig komplett vor der anderen läuft): eine
  ORDNUNG festhalten — der zweite Request endet nach dem Commit des ersten —,
  keine Zeitschwelle. Vorbild: `test_feature_geraete_loeschen.js`,
  Abschnitt (11), roher `pool.connect()`-Client mit `BEGIN` und Advisory-Lock.
* **Gegenprobe:** die Zustandsbedingung aus der `WHERE` entfernen → Z4 ROT,
  und zwar am Audit-Zähler (2 statt 1), nicht nur am Statuscode.
* **Zweite Gegenprobe:** `rowCount` ignorieren und den Audit unbedingt
  schreiben → ebenfalls ROT. Sonst misst Z4 nur die `WHERE`, nicht die
  Verdrahtung dahinter.

### Mitfahrer: B1-04 (SOL-4), nur Test

`test_feature_pruefbereich_kopf.js:340-351` liest `MIN(naechste_faelligkeit)`
aus genau den Zeilen, die die Route geschrieben hat. **Gemessen:** die
Produktionsmutation `faelligAm: plusMonate(heute, t.intervallMonate)` →
`faelligAm: heute` lässt den Wächter bei **EXIT 0, 19 PASS / 0 FAIL** —
identisch zum unmutierten Lauf (Positivkontrolle). Drei weitere Testdateien an
derselben Route ebenfalls unverändert (7/0, 131/0, 49/0).

**Behebung:** der erwartete Fälligkeitstag wird UNABHÄNGIG vom gespeicherten
Ergebnis gebildet — festes Testdatum plus eigene Kalendererwartung — und erst
danach gegen die Kopfzeile gehalten. **Gegenprobe:** dieselbe Mutation muss
danach ROT werden.

**Grenze dieser Messung, die so im Test stehen bleibt:** die VOLLE Suite lief
mit der Mutation nicht. „Kein Test irgendwo fängt es" ist NICHT gemessen.

---

## 2. Was ausdrücklich NICHT gebaut wird

* **Keine neue globale Lock-Klasse.** CLAUDE.md: solange der bestehende
  Verklemmungs-Kreis (`routes/module.js:2710/2725/2777` gegen `:3140`/`:997`)
  ungelöst ist, wird keine neue eingeführt. S1 nimmt keine neue Sperre — eine
  `db.tx()` um zwei INSERTs auf frische Zeilen kollidiert mit nichts.
* **Die 25 weiteren `unlink`-Fundorte** aus `plaene/befund-datei-vs-commit.md`
  bleiben FUNDORTE. Sie sind nicht gemessen. Wer sie mitnimmt, baut auf
  Fundorten statt auf Befunden.
* **Kein Umbau von `schalteAlleFrei()`** selbst. Dass es ein blankes `db.run`
  ist, ist die Prämisse des Befunds, nicht sein Gegenstand.

---

## 3. Zusicherungen — je mit der Gegenprobe, die sie rot macht

### Z1 — S1: ein Fehler in der zweiten Aufgabenzeile hinterlässt NICHTS

Über den echten POST-Weg, gegen eine Wegwerf-DB:

* Vorzustand messen: `SELECT COUNT(*)::int FROM wartung_geraete WHERE studio_id=$1`
  und dasselbe für `wartung_geraete_aufgaben`.
* Einen Fehler GENAU für den zweiten `INSERT INTO wartung_geraete_aufgaben`
  stellen (nicht für alle DB-Aufrufe — sonst misst die Probe den ersten
  INSERT).
* **Erwartet nach der Behebung:** beide Zählungen unverändert, Antwort eine
  Fehlerseite.
* **Positivkontrolle in die Gegenrichtung** (sonst prüft Z1 nur, dass eine
  leere DB leer ist): derselbe POST OHNE gestellten Fehler legt Gerät UND alle
  Aufgabenzeilen an — Zählungen um 1 bzw. um die Zeilenzahl erhöht.

**Gegenprobe:** `db.tx` zurück auf `db.one`/`db.run` → Z1 muss ROT werden, und
zwar mit einer FAIL-Zeile, nicht mit einem Absturz.

### Z2 — S2: nach einem Fehler ist die Belehrung noch auslieferbar

* Vorzustand: eine Belehrung mit Datei A, `datei_vorhanden = 1`.
* Neue Version mit Datei B hochladen, dabei `schalteAlleFrei()` werfen lassen.
* **Erwartet nach der Behebung:** `dateiname` ist weiterhin A, Datei A liegt
  auf der Platte, Datei B ist aufgeräumt, Antwort HTTP 500.
* **Die entscheidende Zusicherung ist ERREICHBARKEIT, nicht ein Feldwert**
  (CLAUDE.md: eine Schwelle über eine ZAHL ist keine Zusicherung über
  Erreichbarkeit): der Test ruft danach den Auslieferungsweg auf und verlangt,
  dass die Datei wirklich kommt.
* **Positivkontrolle:** ohne gestellten Fehler ist `dateiname` B, B liegt da,
  A ist je nach Entwurf aufgeräumt oder nicht — und der Auslieferungsweg
  liefert B.

**Gegenprobe:** die Reihenfolge zurückdrehen → Z2 muss ROT werden.

### Z3 — S3: ist die Datei weg, sagt das auch die Datenbank

* `datei_vorhanden = 0` und Datei weg, oder beides unverändert — **nie
  gemischt.**
* Fehler GENAU für das UPDATE stellen. **Erwartet nach der Behebung:** Datei
  liegt noch da, `datei_vorhanden` weiter 1.
* **Positivkontrolle:** ohne gestellten Fehler ist `datei_vorhanden = 0` UND
  die Datei weg.
* **Gegenprobe zur Mandanten-Schutzbedingung**, die dabei nicht verlorengehen
  darf: zeigt eine ANDERE Belehrung mit `datei_vorhanden = 1` auf denselben
  Dateinamen, bleibt die Datei liegen. Diese Zusicherung existiert als
  Kommentar („P2-4") und gehört nach dem Umbau ausdrücklich gemessen.

### Z4 — Kein Fehler wird durch die Umstellung stumm

Die drei Behebungen verschieben Fehlerbehandlung. Für jede gilt:
**welche bestehende Zusicherung erfüllt mein neuer Fehlerweg ab jetzt, ohne
dass das Bewachte noch da ist?** Vor dem Bau `grep` auf die Meldungstexte und
Statuscodes der drei Routen, und jeden Treffer im Bericht nennen — auch die,
die nicht betroffen sind.

---

## 4. Abnahme

Wie in `plaene/auftrag-eingabewache-geraete.md`, Abschnitt 4: volle Suite ohne
Pipe und ohne äusseres `flock`, Dateizahl-Ritual mit `diff` EXIT 0,
`npm run lint` **wörtlich gemeldet auch bei Grün**, alle Gegenproben beidseitig
mit `node --check` vorab, Marker-Scan mit Pfad-Ausschluss, Commit und Push VOR
dem Warten auf einen Hintergrundlauf.

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* Braucht `schalteAlleFrei()` den bereits aktualisierten `dateiname`, ist Teil 2
  von S2 nicht baubar: **melden, nicht improvisieren.**
* Findet er eine vierte Stelle derselben Klasse in einer dieser beiden Dateien:
  melden — meine Liste ist dann unvollständig.
* Lässt sich ein Fehler für GENAU EINEN der DB-Aufrufe nicht stellen, ohne die
  anderen mitzutreffen: melden. Eine Probe, die alle Aufrufe trifft, misst
  etwas anderes als Z1.
