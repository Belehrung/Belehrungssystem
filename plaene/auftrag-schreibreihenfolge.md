# Auftragspapier — Schreibreihenfolge (FASSUNG 2)

**Fassung 1 ist überholt** und liegt als `plaene/auftrag-schreibreihenfolge-fassung1.md`
daneben (samt ihrem Prüf-Nachtrag). Sie war nach eigener Nachmessung **nicht
baubar**: vier Tatsachenbehauptungen falsch, der zentrale Behebungsvorschlag
schloss seine eigene Klasse nicht.

**Repo:** GymDocu (`/home/user/gymdocu`).
**Gemessen am Stand `5a194ba`** (master nach #461), 19.09.2026.
**Jede Zeilennummer in diesem Papier ist an diesem Stand gemessen und VOR DEM
BAU NEU ZU MESSEN** — #461 hat die S4-Nummern um rund 28 Zeilen verschoben,
und dieses Papier wird nicht der letzte Merge davor sein.

**Herkunft:** B1-03 und B1-05 aus `plaene/durchgang-befunde.md`, F1/F2 aus
`plaene/befund-datei-vs-commit.md`, dazu N-5 aus der Planprüfung (S6).

---

## 0. Die Klasse, in einem Satz

Ein Schritt, der sich nicht zurücknehmen lässt (ein bereits committetes
`db.run`/`db.one` über den POOL, ein `fs.unlink`), steht VOR einem Schritt,
der werfen kann. Wirft der zweite, bleibt der erste stehen — und niemand
räumt ihn auf.

**Die gemeinsame Ursache ist gemessen und steht in CLAUDE.md:** `db.q` und
`db.run` benutzen den POOL, nicht die Transaktionsverbindung
(`core/db.js:426-433`). Jeder Aufruf ist seine eigene, abgeschlossene
Transaktion. Eine Folge von `db.run` ist deshalb keine Folge von Schritten,
sondern eine Folge von Tatsachen.

**Das Werkzeug dagegen ist da und wird in diesem Repo bereits benutzt:**
`db.tx(callback)` (`core/db.js:441-481`) reicht ein gebundenes `{q, one, run}`
durch, macht `BEGIN`/`COMMIT`/`ROLLBACK` und gibt die Verbindung bei
fehlgeschlagenem ROLLBACK aus dem Pool frei. `auditAppend()` nimmt als
SECHSTEN Parameter genau so ein Handle (`core/integritaet.js:63`, Kommentar
`:58-62`) und läuft dann IN der Transaktion des Aufrufers.

---

## 1. Die sechs Fundstellen, je mit gemessener Prämisse

### S1 — `POST /geraetewartung/geraet/neu` (`routes/admin/geraete.js:5445`)

Gemessen:

    try {                                                             // 5512
        const result = await db.one(`INSERT INTO wartung_geraete … RETURNING id`);  // 5513, COMMITTET
        const geraetId = result.id;                                   // 5522
        if (aufgaben && …) { for (const text of aufgabenListe) {       // 5527
            await db.run(`INSERT INTO wartung_geraete_aufgaben …`);    // 5528, je COMMITTET
        } }
        const kat = await db.one("SELECT name FROM wartung_kategorien …");  // 5540
        try { await auditAppend(…); } catch (e) { … melde(…) }        // 5541-5549
        res.redirect(…);                                              // 5551
    } catch (error) { … Fehlerseite … }                               // 5552

Scheitert die zweite Aufgabenzeile, bleiben Gerät und erste Aufgabe stehen,
der Benutzer sieht eine Fehlerseite und legt das Gerät vermutlich erneut an —
danach steht es doppelt, eines davon mit halber Aufgabenliste.

**Behebung:** `db.tx()` um INSERT und Schleife, `t.one`/`t.run` statt
`db.one`/`db.run`.

**Der `auditAppend` (`:5541-5549`) bleibt AUSSERHALB der Transaktion.** Zwei
gemessene Gründe, nicht einer:

1. **Er kann ohnehin nicht nach aussen werfen** — er steht bereits in einem
   eigenen `try/catch`, das den Fehler an `melde()` gibt (`:5546-5549`). Er
   ist also gar kein fehlbarer Schritt für diese Route.
2. Ihn hineinzuziehen, erzeugte eine Lock-Reihenfolge, die es unter
   Autocommit nicht gab (`pg_advisory_xact_lock(studioId)`,
   `core/integritaet.js:65`) — für Null Gewinn, siehe (1).

*(Fassung 1 nannte hier `:5518` und den zweiten Grund allein. Die Nummer war
falsch, und der erste Grund ist der stärkere.)*

---

### S2 — `POST /neue-version/:id` (`routes/belehrungen.js:2104`, Rumpf ab `:2158`)

Gemessen (Nummern unverändert gegenüber Fassung 1, nachgeprüft):

    const alteDatei = bel.dateiname;                                   // 2170
    await db.run(`UPDATE belehrungen SET dateiname=$1, datei_vorhanden=1,
                  hochgeladen_am=…  WHERE studio_id=$2 AND id=$3`);    // 2171-2173 COMMITTET
    const n = await schalteAlleFrei(req.studioId, bel.id, grund);      // 2174 kann werfen
    await auditAppend(…);                                              // 2175 kann werfen
    } catch (e) { if (req.file) fs.unlink(req.file.path, () => {});     // 2179-2180 LÖSCHT
                  res.status(500)… }                                   // 2181

**Gemessene Prämissen:**

* Das UPDATE ist committet (`db.run` über den Pool) und schreibt **DREI
  Spalten**, nicht nur `dateiname`: `dateiname`, `datei_vorhanden`,
  `hochgeladen_am`. *(Fassung 1 sprach durchgehend nur von `dateiname`.)*
* `schalteAlleFrei()` (`:2066-2074`) ist ein blankes `db.run` mit
  `INSERT … SELECT … ON CONFLICT DO UPDATE` — jeder DB-Fehler schlägt durch.
* `auditAppend()` (`:2175`) hat hier **KEIN** eigenes `try/catch` (anders als
  bei S1) und kann über den Advisory-Lock in den in CLAUDE.md dokumentierten
  Verklemmungs-Kreis laufen.
* `req.file.path` ist genau die Datei, auf die `dateiname` jetzt zeigt
  (multer `diskStorage`: `path` voller Pfad, `filename` dessen Basisname).
* **`schalteAlleFrei()` braucht den neuen `dateiname` NICHT.** Gemessen an der
  Signatur (`schalteAlleFrei(studioId, belehrungId, grund)`, `:2066`) und am
  Rumpf: es fasst ausschliesslich `belehrung_freischaltung` und `mitarbeiter`
  an, liest `belehrungen` nicht. *(Fassung 1 hat diese Messung dem Ausführenden
  überlassen; sie entscheidet über den Entwurf und gehört ins Papier.)*

**Folge heute:** Wirft (2174) oder (2175), steht in der Datenbank
`datei_vorhanden=1, dateiname=<neue Datei>` — und die neue Datei ist gelöscht.
Die alte liegt noch auf der Platte, aber **nichts zeigt mehr auf sie**.

#### Warum das blosse Vertauschen FALSCH wäre — Beweis, nicht Vermutung

Fassung 1 wollte das UPDATE hinter `schalteAlleFrei()` ziehen. **Das kehrt
eine bestehende, im Quelltext dokumentierte Schutzordnung um.**

Der Unterschriftenweg derselben Datei liest in dieser Reihenfolge:

    const freischaltungVor = await db.one("SELECT freigeschaltet_am FROM
                                belehrung_freischaltung WHERE …");      // R1, :793
    const belRow = await db.one("SELECT dateiname, titel, … FROM belehrungen …"); // R2, :798

und verbraucht die Freischaltung am Ende nur, wenn sie noch **genau die früh
gelesene Generation** trägt (`:961-967`, `AND freigeschaltet_am = $4`). Der
Bestandskommentar `:780-792` beschreibt genau dieses Rennen.

Immer gilt **R1 < R2** (zwei aufeinanderfolgende Anweisungen).

Sei `W_d` der Commit des `dateiname`-UPDATE, `W_g` der Commit von
`schalteAlleFrei()`. Der Schaden tritt ein, wenn der Unterschreibende die
**NEUE** Generation liest (`R1 > W_g`), aber das **ALTE** Dokument
(`R2 < W_d`) — dann unterschreibt er A und verbraucht die Pflicht für B.

* **Heutige Ordnung** `W_d < W_g`: der Schaden verlangte
  `R1 > W_g > W_d > R2`, also `R1 > R2`. **Widerspruch zu R1 < R2 — der
  Schaden ist ausgeschlossen.**
* **Vertauschte Ordnung** `W_g < W_d`: der Schaden verlangt
  `W_g < R1 < R2 < W_d`. **Widerspruchsfrei, also möglich.**

Das blosse Vertauschen tauscht also einen Fehlerfall-Datenverlust gegen ein
Rennen im NORMALBETRIEB. Genau die Klasse, vor der CLAUDE.md warnt: *„was
sieht der Benutzer NACHHER, und ist das besser als vorher?"*

#### Behebung: EINE Transaktion, nicht eine andere Reihenfolge

    await db.tx(async (t) => {
        await t.run('SELECT pg_advisory_xact_lock($1)', [req.studioId]);   // ZUERST
        await t.run(`UPDATE belehrungen SET dateiname=$1, datei_vorhanden=1,
                     hochgeladen_am=… WHERE studio_id=$2 AND id=$3`, […]);
        n = await schalteAlleFrei(req.studioId, bel.id, grund, t);
        await auditAppend(req.studioId, 'belehrung_neue_version', …, t);
    });
    zeileZeigtAufNeueDatei = true;     // erst NACH dem Commit

**Warum das die Klasse schliesst, und das Vertauschen nicht:** vor dem COMMIT
ist **nichts** sichtbar. Es gibt kein Fenster zwischen den beiden Schreibungen,
also auch keine Ordnung, die sich umkehren liesse — der Beweis oben wird
gegenstandslos statt auf die andere Seite zu kippen. Wirft irgendetwas, rollt
alles zurück, nichts zeigt auf die neue Datei, und der `catch` löscht sie
korrekt.

**Der Advisory-Lock wird ZUERST genommen** — CLAUDE.md nennt genau das als den
billigen Ausweg, und derselbe Griff steht 1.200 Zeilen weiter oben in dieser
Datei bereits im Bestand (`:946`, mit Begründung `:940-945`). Beide
Transaktionen, die `belehrung_freischaltung` anfassen, nehmen ihn damit in
DERSELBEN Reihenfolge; ein Kreis entsteht nicht. **Gemessen:** ausser diesen
beiden gibt es nur zwei weitere Schreiber auf `belehrung_freischaltung`
(`routes/admin/mitarbeiter.js:883`, `routes/belehrungen.js:2053`), beide
blanke `db.run` unter Autocommit — sie halten keine Sperre über mehrere
Anweisungen und können an einem Kreis nicht teilnehmen.

**`schalteAlleFrei()` bekommt einen optionalen VIERTEN Parameter**
`conn = null`, benutzt `(conn || db).run` und bleibt für seinen zweiten
Aufrufer (`:2082`, `/freischalten-alle/:belehrungId`) unverändert.

**Die Merkvariable im `catch` bleibt trotzdem** (`zeileZeigtAufNeueDatei`,
gesetzt NACH dem Commit, abgefragt vor dem `unlink`). Sie ist nach der
Transaktion nicht mehr nötig, um den heutigen Befund zu schliessen — sie ist
der Riegel dagegen, dass ein späterer Beitrag wieder einen committenden
Schritt vor den `catch` schiebt. CLAUDE.md: *„ein Verdrahtungsfehler ist die
Lücke, die eine Behebung hinterlässt."*

**Was dabei zu MELDEN ist, nicht zu lösen:** die Transaktion hält den
studioweiten Lock jetzt über das mehrzeilige `INSERT … SELECT` von
`schalteAlleFrei()`. Der Ausführende misst die Laufzeit bei einer realistischen
Mitarbeiterzahl und nennt sie im Bericht. Ist sie auffällig, ist das eine
Entscheidung, keine stille Annahme.

---

### S3 — `POST /loeschen/:id` (`routes/belehrungen.js:2284`)

Gemessen:

    const row = await db.one("SELECT dateiname FROM belehrungen WHERE …");   // 2287
    if (row && row.dateiname) {
        const andere = (await db.one("SELECT COUNT(*)::int AS c … "))c;      // 2294-2296
        if (andere === 0) {
            if (fp.startsWith(UPLOAD_DIR + path.sep)) {
                try { fs.unlinkSync(fp); } catch {}                          // 2299 LÖSCHT, still
            }
        }
    }
    await db.run("UPDATE belehrungen SET datei_vorhanden=0 WHERE …");        // 2302 kann werfen

Wirft (2302), sagt die Datenbank weiter `datei_vorhanden = 1`, während die
Datei weg ist. Der Eintrag bleibt als „vorhanden" gelistet und ist nicht
abrufbar.

**Behebung:** UPDATE zuerst, Dateilöschung danach. Ohne Abwägung möglich, weil
es ohnehin eine Löschabsicht ist: scheitert die Dateilöschung nach
erfolgreichem UPDATE, bleibt eine verwaiste Datei auf der Platte — Müll, kein
Datenverlust.

**Das `catch {}` bei `:2299` wird NICHT angefasst — bewusst, mit Begründung.**
Es verschluckt ein fehlgeschlagenes `unlink` vollständig. Daraus folgt, dass
die Invariante **einseitig** ist und Z3 entsprechend formuliert sein muss
(s.u.): verboten ist `datei_vorhanden=1` bei fehlender Datei; erlaubt ist
`datei_vorhanden=0` bei liegengebliebener Datei. Es auf `melde()` umzustellen
wäre eine zweite Verhaltensänderung (Telegram-Alarm für einen Fall, den wir
gerade als „Müll" einstufen) und gehört nicht in diesen Beitrag.
**Als offener Punkt nach `plaene/durchgang-befunde.md` eintragen.**

---

### S4 — `POST /geraetewartung/geraet/frist-bestaetigen/:id` (`routes/admin/geraete.js:6378`)

**Alle Nummern neu gemessen** — Fassung 1 nannte 6350/6353/6363/6366, das war
der Stand vor #461:

    const id = req.params.id;                                          // 6379  ← UNGEPRÜFT
    const g = await db.one("SELECT kategorie_id, frist_herkunft, frist_festgelegt_am
                            FROM wartung_geraete WHERE id=$1 AND studio_id=$2");  // 6381, POOL
    if (g.frist_herkunft === FRIST_HERKUNFT.EIGENE_FESTLEGUNG
        && !g.frist_festgelegt_am) {                                   // 6383
        await db.run("UPDATE wartung_geraete SET frist_festgelegt_am=$1,
                      frist_festgelegt_von=$2 WHERE id=$3 AND studio_id=$4");     // 6391-6392
        try { await auditAppend(…); } catch (e) { … melde(…) }         // 6393-6399
    }

**Kein `db.tx`, keine Sperre, keine Zustandsbedingung in der `WHERE`.
`rowCount` liest niemand.** Zwei parallele Requests lesen beide
`frist_festgelegt_am IS NULL`, bestehen beide das `if`, schreiben beide — der
zweite überschreibt Datum und Namen des ersten — und hängen **ZWEI** Einträge
in die gehashte Audit-Kette.

**Der Kommentar `:6373-6377` verspricht wörtlich das Gegenteil:** „sonst könnte
ein zweiter Klick (offener Tab, Doppel-Submit) eine echte, schon bestehende
Bestätigung stillschweigend überschreiben". Die Zusicherung steht im Kommentar,
nicht im Code.

**Behebung:**

    const r = await db.run(`UPDATE wartung_geraete
                            SET frist_festgelegt_am=$1, frist_festgelegt_von=$2
                            WHERE id=$3 AND studio_id=$4
                              AND frist_herkunft=$5
                              AND frist_festgelegt_am IS NULL`, [...]);
    if (r.rowCount === 1) { try { await auditAppend(…) } catch … }

**`studio_id` bleibt in der `WHERE`** — Fassung 1 hat die neue Klausel ohne sie
zitiert; das ist Punkt 1 der Prüfreihenfolge und wird eigens zugesichert (Z4c).
Keine neue Sperre nötig: Zeilensperre plus Bedingung machen es atomar.

**Mitfahrer S4b — der dreizehnte Eintrittspunkt.** `:6379` nimmt `req.params.id`
**ungeprüft** und gibt ihn roh an `id=$1`. Gemessen: `istGueltigeId` ist in
dieser Datei an drei Stellen gebunden (`:352`, `:485`, `:725`), hier nicht.
PostgreSQL 16 liest `'0x10'` als **16** (gemessen, `test_feature_id_wache_pruefung.js`)
— `POST …/frist-bestaetigen/0x10` bestätigt also die Frist an **Gerät 16**.
Kein Mandantenleck (`studio_id=$2` steht in beiden Anweisungen), aber ein
Schreibzugriff auf den falschen Datensatz. Diese eine Zeile fährt mit, weil der
Beitrag die Route ohnehin anfasst; sie steht in
`plaene/durchgang-befunde.md` bereits als offener Fundort der U-ID-Klasse, und
**die übrigen Fundorte dieser Klasse fahren ausdrücklich NICHT mit.**

---

### S5 — Drei Mitarbeiter-Routen melden Erfolg bei NULL getroffenen Zeilen

| Route | Zeilen | Antwort bei 0 getroffenen Zeilen |
|---|---|---|
| `POST /mitarbeiter/email/:id` | 677, SELECT 690, UPDATE 691 | Redirect `feedback=email_gespeichert` |
| `POST /mitarbeiter/pin-direkt/:id` | 746, SELECT 758, UPDATE 760 | Redirect `feedback=pin_gesetzt` |
| `POST /mitarbeiter/umbenennen/:id` | 818, SELECT 838, UPDATE 840 | Redirect `feedback=name_geaendert` |

**BERICHTIGUNG gegenüber Fassung 1.** Dort stand: *„Alle drei lesen die Zeile
erst NACH dem schreibenden UPDATE."* **Gemessen — alle drei lesen VORHER**
(Zeilen oben). Ich hatte den Satz aus dem Bericht des Ausführenden übernommen,
ohne ihn zu messen; derselbe methodische Fehler wie zwei Stunden zuvor bei
`parseIds`.

**Was sich dadurch an der Behebung ändert:** `ma` ist bereits ein verlässlicher
„nicht gefunden"-Hinweis — bei `pin-direkt` sogar VOR dem teuren
`bcrypt.hash` (`:758` vor `:759`). `rowCount` bleibt trotzdem nötig, aber aus
einem anderen Grund als in Fassung 1 behauptet: als atomare Entscheidung gegen
eine Löschung ZWISCHEN SELECT und UPDATE.

**Kein Datenrisiko** — `studio_id` steht in jeder WHERE-Klausel. Der Schaden ist
eine **falsche Zusage an den Benutzer**: „PIN gesetzt" für einen Mitarbeiter,
den es nicht gibt.

**Behebung:** `rowCount` lesen und bei 0 die „nicht gefunden"-Antwort geben.

**Die Rückmeldecodes sind gemessen** (Definitionsliste
`routes/admin/mitarbeiter.js:60-74`, dreizehn Codes) — Fassung 1 hat diese
Messung delegiert, sie gehört ins Papier:

* `email`: **`email_fehler` existiert und passt wörtlich** — *„E-Mail-Adresse
  nicht gespeichert. Der Mitarbeiter wurde nicht gefunden."* (`:72`). Es wird
  bereits an `:680` benutzt. **Nichts Neues nötig.**
* `umbenennen`: `name_fehler` (`:73`) trägt den Detailtext *„Bitte gib einen
  Namen ein."* — für „nicht gefunden" **irreführend**. Neuer Code
  `name_nicht_gefunden`, **mit Eintrag in der Liste bei `:60-74`**.
* `pin-direkt`: **kein passender Code vorhanden.** Neuer Code `pin_fehler`,
  ebenfalls mit Eintrag in der Liste.

**Ein Code ohne Listeneintrag zeigt GAR NICHTS an** (`feedbackFromQuery`,
`core/ui-feedback.js`; gemessen und im Bestand kommentiert bei
`routes/admin/mitarbeiter.js:828-831`). Wer den Eintrag vergisst, baut einen
stillen Redirect und hält ihn für eine Fehlermeldung.

---

### S6 — PIN gesetzt, Einladungs-Tokens bleiben gültig (`routes/admin/mitarbeiter.js:746`)

**Neu in Fassung 2** (N-5 der Planprüfung, selbst nachgemessen):

    const ma   = await db.one("SELECT name FROM mitarbeiter WHERE id=$1 AND studio_id=$2"); // 758
    const hash = await bcrypt.hash(pin, 12);                                     // 759
    await db.run("UPDATE mitarbeiter SET pin_hash=$1, pin_gesetzt_am=… WHERE …"); // 760 COMMITTET
    await db.run("UPDATE mitarbeiter_token SET verwendet=1 WHERE … verwendet=0"); // 762 kann werfen
    …
    } catch (error) { … Fehlerseite … }                                          // 778-780

Scheitert (762), ist die **PIN gesetzt**, der Benutzer bekommt die Fehlerseite
— **und alte Einladungs-/Reset-Tokens bleiben gültig und können die PIN später
erneut ändern.** Das ist keine irreführende Rückmeldung mehr, sondern ein
offener Anmeldeweg.

**Behebung:** beide UPDATEs in EINE `db.tx`. **`bcrypt.hash` bleibt DAVOR** —
es steht bereits davor (`:759`), und es gehört nicht in eine Transaktion:
12 Runden bcrypt halten sonst eine Datenbankverbindung.

**Der Kommentar `:763-767` behauptet heute:** *„Keine Transaktion hier — der
Protokolleintrag darf das bereits erfolgte Setzen nicht scheitern lassen."*
Das bleibt für den **`auditAppend`** richtig (`:769-776`, eigenes `try/catch`,
bleibt draussen). Für die **Tokenentwertung** war es nie ein Protokolleintrag.
**Der Kommentar ist entsprechend zu berichtigen, nicht nur zu ergänzen** —
CLAUDE.md: ein Kommentar ist eine Zusicherung.

**S5 und S6 treffen sich in derselben Route.** Die `rowCount`-Prüfung aus S5
gehört dann auf das UPDATE **innerhalb** der Transaktion, und bei `rowCount===0`
wird die Transaktion abgebrochen (throw), damit auch die Tokenentwertung
unterbleibt.

---

### Mitfahrer: B1-04 (SOL-4), nur Test

`test_feature_pruefbereich_kopf.js:340-351` liest `MIN(naechste_faelligkeit)`
aus genau den Zeilen, die die Route geschrieben hat. **Gemessen:** die
Produktionsmutation `faelligAm: plusMonate(heute, t.intervallMonate)` →
`faelligAm: heute` lässt den Wächter bei **EXIT 0, 19 PASS / 0 FAIL** —
identisch zum unmutierten Lauf. Drei weitere Testdateien an derselben Route
ebenfalls unverändert (7/0, 131/0, 49/0).

**Behebung:** der erwartete Fälligkeitstag wird UNABHÄNGIG vom gespeicherten
Ergebnis gebildet — festes Testdatum plus eigene Kalendererwartung — und erst
danach gegen die Kopfzeile gehalten. **Gegenprobe:** dieselbe Mutation muss
danach ROT werden.

**Grenze dieser Messung, die so im Test stehen bleibt:** die VOLLE Suite lief
mit der Mutation nicht. „Kein Test irgendwo fängt es" ist NICHT gemessen.

---

## 2. Was ausdrücklich NICHT gebaut wird

* **Keine neue globale Lock-Klasse.** S2 nimmt den BESTEHENDEN Studio-Lock,
  und zwar in derselben Reihenfolge wie der einzige andere Transaktionsweg auf
  dieselben Zeilen. S1, S4 und S6 nehmen gar keine Sperre.
* **Die übrigen 25 `unlink`-Fundorte** aus `plaene/befund-datei-vs-commit.md`
  bleiben FUNDORTE. Sie sind nicht gemessen.
* **Die übrigen ungeprüften `:id`-Eintrittspunkte** (U-ID-Klasse in
  `plaene/durchgang-befunde.md`). Nur S4b fährt mit, weil der Beitrag genau
  diese Route ohnehin öffnet.
* **Kein Umbau von `schalteAlleFrei()`** über den durchgereichten
  `conn`-Parameter hinaus.
* **Das `catch {}` bei `belehrungen.js:2299`** (Begründung bei S3).

---

## 3. Zusicherungen — je mit der Gegenprobe, die sie rot macht

*Fassung 1 hatte den Bezeichner `Z4` doppelt vergeben. Hier ist jede
Zusicherung eindeutig.*

### Z1 — S1: ein Fehler in der zweiten Aufgabenzeile hinterlässt NICHTS

* Vorzustand messen: `SELECT COUNT(*)::int` auf `wartung_geraete` und
  `wartung_geraete_aufgaben`, je `WHERE studio_id=$1`.
* Einen Fehler GENAU für den zweiten `INSERT INTO wartung_geraete_aufgaben`
  stellen, nicht für alle DB-Aufrufe.
* **Erwartet:** beide Zählungen unverändert, Antwort eine Fehlerseite.
* **Positivkontrolle:** derselbe POST ohne gestellten Fehler legt Gerät UND
  alle Aufgabenzeilen an — Zählungen um 1 bzw. um die Zeilenzahl erhöht.
* **Gegenprobe:** `db.tx` zurück auf `db.one`/`db.run` → Z1 ROT, mit einer
  FAIL-Zeile, nicht mit einem Absturz.

### Z2a — S2: nach einem Fehler ist die Belehrung noch AUSLIEFERBAR

* Vorzustand: Belehrung mit Datei A, `datei_vorhanden=1`.
* Neue Version mit Datei B hochladen, dabei `schalteAlleFrei()` werfen lassen.
* **Erwartet:** `dateiname` weiterhin A, Datei A auf der Platte, Datei B
  aufgeräumt, Antwort HTTP 500.
* **Die entscheidende Zusicherung ist ERREICHBARKEIT, nicht ein Feldwert:**
  der Test ruft danach den Auslieferungsweg auf und verlangt, dass die Datei
  wirklich kommt.
* **Zweiter Wurfpunkt, eigener Durchlauf:** dasselbe mit `auditAppend()`
  werfend. Fassung 1 hat nur `schalteAlleFrei()` geprüft — der Befund N-1
  hing genau daran.
* **Positivkontrolle:** ohne gestellten Fehler ist `dateiname` B, und der
  Auslieferungsweg liefert B.
* **Gegenprobe:** die `db.tx` auflösen (zurück auf zwei `db.run`) → Z2a ROT.

### Z2b — S2: alle DREI Spalten fallen gemeinsam zurück

Nach dem geworfenen Lauf tragen `dateiname`, `datei_vorhanden` **und**
`hochgeladen_am` unverändert ihre Vorwerte. **Gegenprobe:** eine der drei aus
dem UPDATE herausnehmen und vor die Transaktion ziehen → Z2b ROT.
*(Ohne diese Zusicherung misst Z2a nur `dateiname`.)*

### Z2c — S2: das Unterschriften-Rennen bleibt auf der sicheren Seite

Der Beweis in §1 zeigt, dass die Transaktion das Fenster schliesst — eine
Zusicherung, die das MISST, braucht es trotzdem, sonst hängt die Aussage an
meiner Herleitung.

* Ein externer Client hält `SELECT … FOR UPDATE` auf die Belehrungszeile.
* `/neue-version/:id` wird gestartet und blockiert nachweislich
  (`pg_blocking_pids`).
* Ein Unterschriftenvorgang läuft vollständig durch, WÄHREND die Transaktion
  hängt: er sieht **weder** die neue Generation **noch** den neuen
  `dateiname` — beides, nicht nur eines.
* Sperre lösen, beide beenden lassen; die Pflicht zur neuen Fassung besteht.
* **Gegenprobe:** die Transaktion durch zwei `db.run` in der VERTAUSCHTEN
  Reihenfolge ersetzen → Z2c ROT.
* **Keine Zeitschwelle als Überschneidungsbeweis.**

### Z3 — S3: ist die Datei weg, sagt das auch die Datenbank

* Die Invariante ist **einseitig** (Begründung bei S3): verboten ist
  `datei_vorhanden=1` **und** Datei fehlt. `datei_vorhanden=0` bei
  liegengebliebener Datei ist erlaubt.
* Fehler GENAU für das UPDATE stellen. **Erwartet:** Datei liegt noch da,
  `datei_vorhanden` weiter 1.
* **Positivkontrolle:** ohne gestellten Fehler `datei_vorhanden=0` UND Datei
  weg.
* **Gegenprobe zur Mandanten-Schutzbedingung (`:2289-2296`, „P2-4"), die beim
  Umbau nicht verlorengehen darf:** zeigt eine ANDERE Belehrung mit
  `datei_vorhanden=1` auf denselben Dateinamen, bleibt die Datei liegen.
  Diese Zusicherung existiert heute nur als Kommentar.

### Z4a — S4: zwei parallele Requests, EIN Ergebnis

* Externer Client hält `SELECT … FOR UPDATE` auf die Gerätezeile.
* Beide Requests starten; über `pg_blocking_pids` wird BELEGT, dass beide
  UPDATEs hinter dieser Zeilensperre warten. Sperre lösen.
* **Erwartet:** genau **ein** wirksames UPDATE, genau **ein** Audit-Eintrag,
  gespeicherter Name der des ERSTEN.
* **Gegenprobe:** die Zustandsbedingung aus der `WHERE` entfernen → Z4a ROT,
  und zwar **am Audit-Zähler (2 statt 1)**, nicht nur am Statuscode.

*(Fassung 1 verwies hier auf `test_feature_geraete_loeschen.js` Abschnitt (11)
als Vorbild. Das trägt NICHT: dort funktioniert der externe Advisory-Lock nur,
weil die geprüfte Route denselben Lock VOR ihrem SELECT nimmt. Die
Frist-Route nimmt gar keinen.)*

### Z4b — S4: `rowCount` entscheidet, nicht nur die `WHERE`

Den `rowCount`-Zweig unabhängig prüfen: `rowCount` ignorieren und den Audit
unbedingt schreiben → ROT. Sonst misst Z4a die `WHERE`, nicht die
Verdrahtung dahinter.

### Z4c — S4: die Mandantenbedingung überlebt den Umbau

Ein Request eines FREMDEN Studios auf dieselbe `:id` → kein UPDATE, kein
Audit-Eintrag, Zeile unverändert. **Gegenprobe:** `studio_id` aus der neuen
`WHERE` entfernen → Z4c ROT. *(Punkt 1 der Prüfreihenfolge; Fassung 1 zitierte
die neue Klausel ohne `studio_id`.)*

### Z4d — S4b: die ID-Wache greift an diesem Eintrittspunkt

`POST …/frist-bestaetigen/0x10` → keine Wirkung auf Gerät 16, Antwort wie an
den zwölf bestehenden Punkten. **Positivkontrolle:** dieselbe Route mit der
echten ID wirkt. **Gegenprobe:** die Wache mit `if (false && …)` abhängen →
genau dieser Ausschnitt ROT.

### Z5a — S5: keine Erfolgsmeldung ohne getroffene Zeile

Je Route ein POST mit einer **format-gültigen, nicht vergebenen** ID →
**keine** Erfolgsmeldung, DB unverändert. **Positivkontrolle:** dieselbe Route
mit echter ID → Erfolgsmeldung UND nachweisbare Wirkung in der DB.
**Gegenprobe:** die `rowCount`-Abfrage entfernen → genau diese drei Fälle ROT.

### Z5b — S5: die neuen Rückmeldecodes werden auch ANGEZEIGT

Für `name_nicht_gefunden` und `pin_fehler`: nach dem Redirect enthält die
gelieferte Seite den hinterlegten Text. **Gegenprobe:** den Eintrag aus der
Definitionsliste (`:60-74`) entfernen → Z5b ROT.
*(Ohne diese Zusicherung ist ein vergessener Listeneintrag ein stiller
Redirect, den Z5a nicht von einer Fehlermeldung unterscheidet.)*

### Z6 — S6: PIN und Tokenentwertung fallen gemeinsam

* Vorzustand: Mitarbeiter mit offenem, unverbrauchtem `mitarbeiter_token`.
* Fehler GENAU für das `mitarbeiter_token`-UPDATE stellen.
* **Erwartet:** `pin_hash` **unverändert** (die alte PIN gilt weiter), Token
  unverändert offen, Antwort Fehlerseite.
* **Positivkontrolle:** ohne gestellten Fehler ist die PIN neu **und** das
  Token entwertet.
* **Gegenprobe:** `db.tx` auflösen → Z6 ROT, und zwar an `pin_hash`, nicht nur
  am Token.

### Z7 — kein Fehler wird durch die Umstellung stumm

Alle sechs Behebungen verschieben Fehlerbehandlung. **Die Gegenfrage aus
CLAUDE.md ist für JEDE einzeln zu beantworten: welche bestehende Zusicherung
erfüllt mein neuer Fehlerweg ab jetzt, ohne dass das Bewachte noch da ist?**

Vor dem Bau `grep` auf die Meldungstexte, Rückmeldecodes und Statuscodes der
sechs Routen, und jeden Treffer im Bericht nennen — auch die nicht
betroffenen. **Die betroffenen Testdateien sind bereits gemessen** und
gehören ausnahmslos durchgesehen:

    neue-version        test_feature_belehrung_version.js, …multer_2_4_bestandsschutz.js,
                        …signatur_verbrauch.js, …upload_fehlerbehandlung.js
    belehrungen/loeschen  test_feature_audit_batch3.js
    frist-bestaetigen   …audit_kapselung_geraete_static.js, …_verhalten.js, …frist_herkunft.js
    pin-direkt          …audit_benutzerverwaltung_static.js, …id_wache_route.js
    umbenennen/email    …audit_mitarbeiter.js, …id_wache_route.js
    geraetewartung/geraet/neu   acht Dateien, s. eigene Messung

---

## 4. Abnahme

Wie in `plaene/auftrag-id-wache.md`, Abschnitt 4: volle Suite ohne Pipe und
ohne äusseres `flock` (`bash test/run.sh > <logdatei> 2>&1; echo
"SUITE_EXIT=$?"`), Dateizahl-Ritual mit `diff` EXIT 0, `npm run lint`
**wörtlich gemeldet auch bei Grün**, alle Gegenproben beidseitig, jedes
Mutationsskript mit Zielpfad als ARGUMENT und Abbruch bei ≠ 1 Fundstelle,
Marker-Scan mit Pfad-Ausschluss (`--exclude-dir`, nicht `| grep -v`), Commit
und Push VOR dem Warten auf einen Hintergrundlauf.

**Tests fassen weder echtes Dateisystem noch echte Prozesse noch echte Dienste
an** — dieselbe Suite ist auf dem Live-Server Deploy-Gate. Für S2/S3 heisst
das: Upload- und Löschwege laufen gegen ein Wegwerf-Verzeichnis, nicht gegen
`UPLOAD_DIR` der Installation.

## 5. Was der Ausführende MELDEN soll, statt es zu lösen

* **Die Haltedauer des Studio-Locks in S2** bei realistischer
  Mitarbeiterzahl — gemessen, nicht geschätzt.
* Findet er eine **siebte** Stelle derselben Klasse in einer dieser drei
  Dateien: melden — meine Liste ist dann unvollständig.
* Lässt sich ein Fehler für GENAU EINEN der DB-Aufrufe nicht stellen, ohne die
  anderen mitzutreffen: melden. Eine Probe, die alle Aufrufe trifft, misst
  etwas anderes als Z1/Z2a/Z6.
* **Widerspricht eine Prämisse dieses Papiers seiner Messung, gilt seine
  Messung.** Fassung 1 hatte vier falsche Tatsachenbehauptungen; die teuerste
  Korrektur des letzten Beitrags kam aus einem Widerspruch des Ausführenden.

---

## Anhang — was sich gegenüber Fassung 1 geändert hat

| # | Fassung 1 | Fassung 2 | Quelle |
|---|---|---|---|
| 1 | S2: Reihenfolge tauschen, Merkvariable als Rückfall | **Eine Transaktion**, Lock zuerst, Merkvariable als zweiter Riegel | N-1 (beide Spuren) + eigener Beweis |
| 2 | Rennen beim Tauschen nicht gesehen | Beweis `R1<R2` gegen `W_g<W_d` | N-2 (sol), selbst nachgemessen |
| 3 | Wettlauf-Vorbild `…geraete_loeschen.js` (11) | `FOR UPDATE` + `pg_blocking_pids` | N-3 (sol) |
| 4 | „alle drei lesen NACH dem UPDATE" | **falsch** — alle drei lesen vorher | N-4 (beide) |
| 5 | — | **S6** neu (PIN/Token) | N-5 (beide) |
| 6 | S4-Nummern 6350/6353/6363/6366 | 6378/6381/6391/6394 | N-6 (deepseek) |
| 7 | nur `dateiname` | drei Spalten, Z2b | Planprüfung |
| 8 | Z3 zweiseitig („nie gemischt") | einseitig, mit Begründung | Planprüfung |
| 9 | neue `WHERE` ohne `studio_id` | Z4c | Planprüfung |
| 10 | `Z4` doppelt vergeben | Z1…Z7 eindeutig | Planprüfung |
| 11 | Rückmeldecode delegiert | gemessen: einer da, zwei neu + Z5b | eigene Messung |
| 12 | `schalteAlleFrei`-Abhängigkeit delegiert | gemessen: keine | eigene Messung |
| 13 | S1-Audit nur mit Lock-Begründung | zusätzlich: kann gar nicht werfen | eigene Messung |
| 14 | — | **S4b**, dreizehnter ID-Eintrittspunkt | eigene Messung |

**Dass der zentrale Vorschlag der Fassung 1 seine eigene Klasse nicht
schliesst, hätte kein Diff-Review gefunden** — es hätte den gebauten Code
gegen den Plan geprüft, und der Plan war falsch.
