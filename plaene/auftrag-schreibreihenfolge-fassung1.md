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

### S5 — Drei Mitarbeiter-Routen melden Erfolg bei NULL getroffenen Zeilen

**Nachgetragen 19.09.2026**, gefunden beim Bau von #461: der Ausführende
stellte die Grenzwert-Zusicherungen von negativ auf positiv um, musste dafür
das tatsächliche Verhalten messen — und fand, dass drei Routen eine
format-gültige, aber real nicht vergebene ID **lautlos als ERFOLG** behandeln:

| Route | Antwort bei 0 getroffenen Zeilen |
|---|---|
| `POST /mitarbeiter/email/:id` | Redirect `feedback=email_gespeichert` |
| `POST /mitarbeiter/pin-direkt/:id` | Redirect `feedback=pin_gesetzt` |
| `POST /mitarbeiter/umbenennen/:id` | Redirect `feedback=name_geaendert` |

Alle drei lesen die Zeile erst NACH dem schreibenden UPDATE und überspringen
bei fehlender Zeile nur das AUDIT, nicht die Erfolgsmeldung.

**Kein Datenrisiko** — `studio_id` steht in jeder WHERE-Klausel, es wird
nichts Fremdes getroffen. Der Schaden ist eine **falsche Zusage an den
Benutzer**: „PIN gesetzt" für einen Mitarbeiter, den es nicht gibt.

**Dieselbe Klasse wie S4 und wie B1-05:** *ein UPDATE, dessen `rowCount`
niemand liest, ist ein stiller No-op — und was danach unbedingt läuft,
behauptet etwas, das nie passiert ist.* Deshalb gehört es hierher und nicht in
ein eigenes Papier.

**Behebung:** `rowCount` des UPDATE lesen und bei 0 die „nicht
gefunden"-Antwort geben statt der Erfolgsmeldung. **Vorher messen, welchen
Rückmeldecode diese Datei dafür schon hat** — ein neuer Code ohne Eintrag in
der Definitionsliste bei `GET /mitarbeiter` zeigt gar nichts an (im Repo
gemessen, 19.09.2026).

**Zusicherung Z5:** je Route ein POST mit einer format-gültigen, nicht
vergebenen ID → **keine** Erfolgsmeldung, und die DB ist unverändert.
**Positivkontrolle:** dieselbe Route mit einer echten ID → Erfolgsmeldung UND
nachweisbare Wirkung in der DB. **Gegenprobe:** die `rowCount`-Abfrage
entfernen → genau diese drei Fälle ROT.

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

---

# NACHTRAG — Planprüfung 19.09.2026, beide Spuren. **Dieses Papier ist so NICHT baubar.**

17 Befunde (sol 8, deepseek 9), vier blockierend. Die wichtigsten selbst
nachgemessen. **Vier Tatsachenbehauptungen des Papiers sind falsch, und der
zentrale Behebungsvorschlag schliesst seine eigene Klasse nicht.**

Kosten: 13,79 $ (sol, 76 Suchen / 51 Lesungen / 21 Runden) + ~0,05 $ (deepseek).

## N-1 (BEIDE Spuren, blockierend) — S2 Teil 2 behebt die Klasse NICHT

Mein Vorschlag war: das UPDATE hinter `schalteAlleFrei()` ziehen, dann greife
der bestehende `catch` wieder richtig. **Gemessen am heutigen Stand
(`routes/belehrungen.js:2171-2180`): falsch.** Auch nach der Umstellung steht
`auditAppend` (`:2175`) NACH dem UPDATE, und der `catch` (`:2180`) löscht
weiterhin `req.file.path`. Wirft `auditAppend` — und es kann werfen, der
Advisory-Lock-Verklemmungskreis ist im Repo dokumentiert —, zeigt die Zeile
auf die neue Datei, und die neue Datei ist gelöscht. **Genau der Schaden, den
S2 beseitigen soll.**

Mein Papier schreibt: *„Diese beiden Teile schliessen einander aus. Teil 2 ist
der bessere Entwurf; Teil 1 ist der Rückfall."* **Das ist die falsche
Alternative — es braucht BEIDE:** die Reihenfolge UND die Merkvariable im
`catch`.

## N-2 (sol, blockierend) — zwischen den beiden Commits liegt ein ECHTER Leser

Die Umstellung veröffentlicht die Freischaltungen VOR dem `dateiname`-UPDATE.
Dazwischen kann ein Mitarbeiter die neue Freischaltung sehen, noch
`dateiname = A` lesen, **A unterschreiben und damit die neue
Freischaltungs-Generation verbrauchen** — die Pflicht zur neuen Fassung
verschwindet, obwohl nur die alte unterschrieben wurde.

Der Prüfer nennt sechs tragende Fundstellen, darunter einen
**Bestandskommentar bei `:780-790`, der genau dieses Rennen beschreibt.** Zwei
Autocommit-Anweisungen zu vertauschen reicht nicht; die beiden Änderungen
müssen atomar veröffentlicht werden.

## N-3 (sol, blockierend) — mein Vorbild für den Wettlauf-Beweis trägt nicht

Z4 verweist auf `test_feature_geraete_loeschen.js`, Abschnitt (11). **Gemessen:
dort funktioniert der externe Advisory-Lock nur, weil die geprüfte Löschroute
denselben Lock VOR ihrem SELECT nimmt.** Die Frist-Route nimmt gar keinen; ihr
Studio-Lock kommt erst im nachgelagerten `auditAppend`. Der zweite Request
läse also schon den neuen Zustand und stiege am `if` aus — die Gegenprobe
erreicht die UPDATE-Zeile nicht deterministisch und kann grün bleiben.

Richtig: ein externer Client hält `SELECT … FOR UPDATE` auf die Zeile, beide
Requests werden gestartet, und über `pg_blocking_pids` wird belegt, dass beide
UPDATEs hinter dieser Zeilensperre warten. **Keine Zeitschwelle als
Überschneidungsbeweis.**

## N-4 (BEIDE Spuren) — meine S5-Behauptung ist schlicht FALSCH

Ich schrieb: *„Alle drei lesen die Zeile erst NACH dem schreibenden UPDATE."*
**Gemessen — alle drei lesen VORHER:** `email` SELECT `:690` vor UPDATE
`:691`; `pin-direkt` SELECT `:758` vor UPDATE `:760`; `umbenennen` ebenso.

Ich hatte den Satz aus dem Bericht des Ausführenden übernommen, ohne ihn zu
messen. **Das ändert die Behebung:** `ma` ist bereits ein verlässlicher
„nicht gefunden"-Hinweis VOR dem teuren `bcrypt`-Aufruf. `rowCount` bleibt
trotzdem nötig — als atomare Entscheidung gegen eine Löschung zwischen SELECT
und UPDATE.

## N-5 (BEIDE Spuren) — ein SECHSTER Fundort, und er ist mehr als eine falsche Meldung

`routes/admin/mitarbeiter.js:760-762`: das PIN-UPDATE committet, danach läuft
`UPDATE mitarbeiter_token SET verwendet=1` als ZWEITER Pool-Commit. Scheitert
der zweite, ist die PIN gesetzt, der Benutzer bekommt die Fehlerseite
(`:778-779`) — **und alte Einladungs-/Reset-Tokens bleiben gültig und können
die PIN später erneut ändern.**

Das ist keine irreführende Rückmeldung mehr, sondern ein offener
Anmeldeweg. Gehört als **S6** in dieses Papier, mit `db.tx` um beide UPDATEs
und `bcrypt` davor.

## N-6 (deepseek) — meine Zeilennummern für S4 sind veraltet

**Gemessen:** Route `6378` (Papier: 6350), SELECT `6381` (6353), UPDATE `6391`
(6363), `auditAppend` `6394` (6366) — rund 28 Zeilen Versatz, verursacht von
#461. Mein Papier sagt „vor dem Bau neu messen" nur bei S1; bei S4 und S5 gar
nicht.

## Die übrigen elf

Ebenfalls gelesen und überwiegend zutreffend: das verschobene Statement
schreibt DREI Spalten, nicht nur `dateiname` (meine Entscheidungsfrage nennt
nur eine); bei S3 verschluckt der `catch {}` ein fehlgeschlagenes `unlink`
vollständig, sodass Z3s Invariante „nie gemischt" nicht gelten kann und aus
einem lauten Fehler ein leiser wird; die neue WHERE bei S4 wird im Papier
ohne `studio_id` zitiert, und keine Zusicherung schützt sie; nach Einführung
des „nicht gefunden"-Redirects wird die bestehende Guard-Zusicherung
mehrdeutig; und der Bezeichner `Z4` steht in meinem Papier für **zwei
verschiedene** Zusicherungen.

---

## Was daraus folgt

**Fassung 2 muss geschrieben werden, bevor irgendetwas gebaut wird.** Die
Kernkorrekturen:

1. **S2 bekommt BEIDE Teile** (Reihenfolge UND Merkvariable im `catch`) — und
   muss die beiden DB-Änderungen ATOMAR veröffentlichen, sonst öffnet die
   Umstellung das Unterschriften-Rennen aus N-2.
2. **S4s Wettlauf-Beweis wird auf `FOR UPDATE` + `pg_blocking_pids`
   umgestellt.**
3. **S5 wird auf die gemessene Lesereihenfolge korrigiert.**
4. **S6 kommt dazu** (PIN und Tokenentwertung in eine Transaktion).
5. Alle Zeilennummern neu messen; „vor dem Bau neu messen" an JEDEN Abschnitt.
6. Die beiden `Z4` auseinanderbenennen.

**Dass der zentrale Vorschlag dieses Papiers seine eigene Klasse nicht
schliesst, hätte kein Diff-Review gefunden** — es hätte den gebauten Code
gegen den Plan geprüft, und der Plan war falsch.
