# Auftragspapier — Schreibreihenfolge (FASSUNG 3)

**Fassung 1 ist überholt** und liegt als `plaene/auftrag-schreibreihenfolge-fassung1.md`
daneben (samt ihrem Prüf-Nachtrag). Sie war nach eigener Nachmessung **nicht
baubar**: vier Tatsachenbehauptungen falsch, der zentrale Behebungsvorschlag
schloss seine eigene Klasse nicht.

**Fassung 2 ist in diese Datei hinein überarbeitet worden** (Planprüfung Runde 2,
drei Spuren, 20 Befunde, 19 getragen — die Nachträge am Ende führen sie
einzeln auf). Zwei Änderungen sind keine Korrekturen, sondern andere
Entwürfe und deshalb hier oben genannt:

* **S6 wird OHNE Transaktion gebaut** — die geplante hätte einen echten
  Verklemmungskreis mit `routes/mitarbeiter-auth.js:295-299` eingeführt.
* **S1 zieht zusätzlich den `kat`-SELECT bei `:5540` heraus** — die
  Transaktionsgrenze der Fassung 2 war zu eng, der Schritt blieb fehlbar.

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
(`core/db.js:421-432` — `q` bei 421, `one` bei 426, `run` bei 431;
Fassung 2 nannte `426-433` und schnitt `q` damit ab, B10). Jeder Aufruf ist seine eigene, abgeschlossene
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

**Behebung, ZWEI Teile — der zweite ist neu (Kimi-3, selbst nachgemessen):**

1. `db.tx()` um INSERT und Schleife, `t.one`/`t.run` statt `db.one`/`db.run`.
2. **Der `kat`-SELECT bei `:5540` muss WEG.** Fassung 2 zog die Transaktion nur
   „um INSERT und Schleife" — danach bleibt bei `:5540` ein blankes `db.one`
   über den Pool stehen, INNERHALB des äusseren `try` (`:5512-5553`), NACH dem
   Commit und VOR dem `res.redirect` (`:5551`). **Wirft es, greift der `catch`
   bei `:5552` und zeigt eine Fehlerseite — während Gerät und Aufgaben bereits
   angelegt sind.** Das ist wörtlich das Schadensbild, das S1 beseitigen soll;
   die Transaktionsgrenze war schlicht zu eng gezogen.

   **Die Behebung ist ein Wegfall, kein Zusatz:** `:5458` liest dieselbe Zeile
   schon (`SELECT id FROM wartung_kategorien WHERE id=$1 AND studio_id=$2`) und
   ist die Mandantenprüfung.

   **Was sich dadurch an der BEDEUTUNG ändert, und es wird hier festgelegt
   statt übergangen (R3-6):** der Audit protokolliert danach den
   Kategorienamen zum Zeitpunkt der MANDANTENPRÜFUNG (Anfang des Requests)
   statt zum Zeitpunkt des Schreibens. Benennt ein zweiter Admin die
   Kategorie dazwischen um, steht im Protokoll der alte Name. **Das ist
   gewollt:** das Ereignis heisst `wartung_geraet_angelegt`, und der Name zum
   Anlagezeitpunkt ist dafür die richtige Angabe — im Löschfall der
   Kategorie sogar die einzige noch verfügbare. Sie wird auf `SELECT id, name` erweitert, der
   zweite Aufruf bei `:5540` entfällt ersatzlos, und der Audit nimmt `kat.name`
   aus der ersten Lesung. Damit ist der fehlbare Schritt nicht verschoben,
   sondern **verschwunden** — und eine doppelte Abfrage derselben Zeile gleich
   mit. *(Die beiden heissen im Bestand BEIDE `kat`, der innere verdeckt den
   äusseren; nach dem Wegfall gibt es nur noch einen.)*

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
  bei S1) und kann werfen — jeder Datenbankfehler schlägt durch, und am
  Studio-Lock kann es warten. **BERICHTIGT nach der Gegenlesung (B11):**
  Fassung 2 schrieb, es könne „in den dokumentierten Verklemmungs-Kreis
  laufen". Das trägt für DIESE Stelle nicht: unter Autocommit öffnet
  `auditAppend` seine eigene Transaktion und hält dabei keine Geschäftszeile,
  die als Gegenkante dienen könnte. Der dokumentierte Kreis entsteht durch
  Transaktionen, die VORHER schon Geschäftszeilen halten. Dass es werfen
  kann, genügt für den Befund; die stärkere Begründung war falsch.
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

**Was der Beweis TRÄGT — selbst nachgemessen:** `belRow.dateiname` wird bei
`:861` benutzt, um genau diese Datei zu lesen und zu stempeln
(`fsP.readFile(path.join(UPLOAD_DIR, belRow.dateiname))`). Die Route
unterschreibt also wirklich das Dokument, das R2 liest — der Beweis redet
nicht über eine Anzeige, sondern über die signierte Datei.

**Und was er NICHT trägt, damit es niemand später für erledigt hält.** Es
gibt im Bestand vier Leser von `belehrung_freischaltung`
(`routes/admin/dashboard.js:71/216/224`, `routes/belehrungen.js:711/794/963`,
`routes/admin/mitarbeiter.js:883`). Gemessen: **keiner von ihnen liest im
selben Vorgang auch `dateiname`** — `:709-714` prüft nur `datei_vorhanden=1`.
Ein dritter Leser, für den `R1 < R2` nicht gälte, existiert also nicht.

Die PDF-Vorschau (`GET /vorschau/:id`, `:726-736`) ist ein **eigener
Request**, der `dateiname` unabhängig liest. Zwischen „Mensch liest die
Vorschau" und „Mensch unterschreibt" liegt deshalb ein Fenster, das weder die
heutige Reihenfolge noch die neue Transaktion schliesst: wird dazwischen eine
neue Version hochgeladen, hat der Mensch A gesehen und die Route stempelt B.
**NACHGESCHÄRFT nach der Gegenlesung (B1) — die Folge ist schlimmer, als ich
sie zuerst notiert hatte.** Ich hatte geschrieben „der Mensch hat A gesehen
und gestempelt wird B". Der Prüfer hat die Ordnung zu Ende gedacht, und beim
Nachmessen stimmt sie: bei

    P(A)  <  COMMIT(W_d, W_g)  <  R1  <  R2

liest der POST die **neue** Generation (R1) UND den **neuen** `dateiname`
(R2). Er stempelt also B, und sein DELETE (`:962-965`) trifft die neue
Generation — **die frisch entstandene Pflicht zur neuen Fassung wird
verbraucht, obwohl der Mensch nur A gelesen hat.** Nicht bloss ein falscher
Stempel: eine Pflicht verschwindet.

**Das ändert nichts am Entwurf, aber alles an seiner Reichweite.** Die
Transaktion schliesst das Fenster zwischen den beiden DATENBANKSCHREIBUNGEN —
dafür ist sie da, und das leistet sie vollständig. Sie bindet **nicht** das
AUSGELIEFERTE Dokument an die Unterschrift; dazu bräuchte es einen Versions-
oder Prüfsummenwert, den der Client vom Vorschau-Abruf bis zum POST mitführt
und den der Server gegen den aktuellen Stand hält.

**Dieser Beitrag darf nicht als Lösung von U-SIG1 gelesen werden** — weder im
Papier noch in einem Kommentar noch in der Commit-Botschaft. Er fährt nicht
mit; er ist ein eigener Entwurf und steht als offener Punkt in
`plaene/durchgang-befunde.md`.

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
DERSELBEN Reihenfolge; ein Kreis entsteht nicht. **Gemessen, und die Zählung ist gegenüber Fassung 2
berichtigt (Kimi-5):** ausser diesen beiden gibt es drei weitere
SchreibWEGE auf `belehrung_freischaltung` — `routes/admin/mitarbeiter.js:883`,
`routes/belehrungen.js:2053` und **`:2082`, der zweite Aufrufer von
`schalteAlleFrei()`** (`/freischalten-alle/:belehrungId`), der denselben
INSERT bei `:2068` erreicht. Fassung 2 zählte ANWEISUNGEN statt WEGEN und kam
deshalb auf zwei. **Die Schlussfolgerung bleibt:** alle drei laufen als blanke
`db.run` unter Autocommit, halten keine Sperre über mehrere Anweisungen und
können an einem Kreis nicht teilnehmen. Der Satz war trotzdem falsch, und ein
falscher Satz mit richtigem Schluss bleibt ein falscher Satz.

**`schalteAlleFrei()` bekommt einen optionalen VIERTEN Parameter**
`conn = null`, benutzt `(conn || db).run` und bleibt für seinen zweiten
Aufrufer (`:2082`, `/freischalten-alle/:belehrungId`) unverändert.

#### Der `catch` darf sich NICHT auf eine Merkvariable verlassen (B8)

Fassung 2 wollte eine Merkvariable `zeileZeigtAufNeueDatei` nach dem Commit
setzen und im `catch` abfragen. **Das reicht nicht, und der Grund ist
unangenehm:** ein Wurf aus `db.tx` beweist KEINEN Rollback. Geht die
COMMIT-Quittung auf dem Weg verloren — Verbindung stirbt, Proxy schneidet ab —,
hat PostgreSQL womöglich längst committet, während `db.tx` nach aussen wirft.
`core/db.js:471` benennt genau diese Ungewissheit für den ROLLBACK-Fall
(„ist der Client-Zustand ungewiss"). Die Merkvariable bliebe dann `false`, der
`catch` löschte Datei B — **und die Datenbank zeigt auf B.** Exakt der Schaden,
den S2 beseitigen soll, durch eine schmalere Tür zurück.

**Gebaut wird deshalb: im Fehlerweg wird erst NACHGESEHEN, dann gelöscht.**

    } catch (e) {
        if (req.file) {
            let darfWeg = false;
            try {
                const jetzt = await db.one("SELECT dateiname FROM belehrungen
                                            WHERE studio_id=$1 AND id=$2", […]);
                darfWeg = !jetzt || jetzt.dateiname !== req.file.filename;
            } catch (_) { darfWeg = false; }   // ungewiss -> NICHT loeschen
            if (darfWeg) fs.unlink(req.file.path, () => {});
        }
        …
    }

**Die Regel dahinter, und sie gilt über diesen Beitrag hinaus:** bei
Ungewissheit ist eine verwaiste Datei auf der Platte (Müll, aufräumbar) immer
besser als eine gelöschte Datei, auf die eine Zeile zeigt (Datenverlust,
nicht aufräumbar). **Im Zweifel nicht löschen.**

*(Die Stützbehauptung der Gegenlesung, ein Bestandskommentar im
Unterschriftenweg benenne genau diesen Fall, ist von mir NICHT bestätigt
worden — gefunden habe ich nur `core/db.js:471`. Die Sache trägt trotzdem:
sie folgt aus dem Verbindungsverhalten, nicht aus einem Kommentar.)*

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
        const andere = (await db.one("SELECT COUNT(*)::int AS c … ")).c;      // 2294-2296
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

**BEHEBUNG — GEÄNDERT nach der Gegenlesung (B3, selbst am Quelltext
nachgemessen). Die Transaktion fällt WEG; stattdessen wird die Reihenfolge
umgedreht.**

Fassung 2 wollte beide UPDATEs in EINE `db.tx`. **Das hätte eine echte
Verklemmung neu eingeführt.** Gemessen an `routes/mitarbeiter-auth.js:288-302`
(der öffentliche Weg, mit dem ein Mitarbeiter seinen PIN über einen
Einladungslink setzt):

    await db.tx(async (tx) => {
        await tx.run("UPDATE mitarbeiter_token … WHERE id=$2 AND verwendet=0"); // :295 TOKEN
        if (!verbraucht.rowCount) throw …;                                      // :298
        await tx.run("UPDATE mitarbeiter SET pin_hash=$1 … WHERE id=$3");       // :299 MITARBEITER
        await tx.run("UPDATE mitarbeiter_token … WHERE mitarbeiter_id=$2");     // :301 TOKEN
    });

Seine Ordnung ist **`mitarbeiter_token` → `mitarbeiter`**. Die geplante
Admin-Transaktion hätte **`mitarbeiter` → `mitarbeiter_token`** gehabt. Setzt
ein Admin den PIN, während derselbe Mitarbeiter gerade seinen Einladungslink
einlöst, hält der eine die Mitarbeiterzeile und wartet auf die Tokenzeile,
der andere umgekehrt: **`ERROR: deadlock detected`, SQLSTATE 40P01.**

**Heute gibt es das nicht** — und das ist der Punkt: `:760` und `:762` sind
zwei blanke `db.run` unter Autocommit. Jede Anweisung gibt ihre Sperre am
Anweisungsende wieder frei; der Weg hält NIE zwei Sperren gleichzeitig und
kann an keinem Kreis teilnehmen. Die Transaktion hätte also einen echten
Fehler gegen eine **neue Regression** getauscht.

**Ein blosses „dann eben Token zuerst" reicht nicht.** Die Admin-Seite
sperrt ALLE offenen Tokens des Mitarbeiters auf einmal, die Einlöseseite
erst EINEN bestimmten (`:295`) und danach die übrigen (`:301`). Hält A
Token 2 und wartet auf Token 1, während B Token 1 und die Mitarbeiterzeile
hält und auf Token 2 wartet, entsteht derselbe Kreis eine Ebene tiefer.

**Gebaut wird OHNE Transaktion, mit umgedrehter Reihenfolge — und mit einem
DRITTEN Schritt (R3-1, selbst nachgemessen):**

    // 1. offene Einladungs-/Reset-Tokens ZUERST entwerten (eigener Commit)
    await db.run("UPDATE mitarbeiter_token SET verwendet=1 WHERE studio_id=$1
                  AND mitarbeiter_id=$2 AND verwendet=0", […]);
    // 2. erst danach die PIN setzen (eigener Commit, rowCount aus S5)
    const r = await db.run("UPDATE mitarbeiter SET pin_hash=$1, pin_gesetzt_am=… 
                            WHERE id=$2 AND studio_id=$3", […]);
    if (r.rowCount === 0) return <nicht gefunden>;
    // 3. NOCH EINMAL entwerten — schliesst das Fenster zwischen 1 und 2
    await db.run("UPDATE mitarbeiter_token SET verwendet=1 WHERE studio_id=$1
                  AND mitarbeiter_id=$2 AND verwendet=0", […]);

**Warum Schritt 3 sein muss — gemessen, und es ist ein Fehler meines eigenen
Entwurfs.** Die Zwei-Schritt-Fassung sah nur den EINLÖSEweg an. Sie übersah
den Weg, der Tokens ERZEUGT: `sendeMitarbeiterEinladung()`
(`routes/mitarbeiter-auth.js:172-186`) ist eine eigene `db.tx`, die erst alle
offenen Tokens entwertet und dann ein NEUES einfügt — und sie ist nicht nur
vom Admin erreichbar, sondern öffentlich über `/pin-vergessen` (`typ:
'reset'`) und über `routes/webhooks.js`.

Damit gilt für die Zwei-Schritt-Fassung die Ordnung

    Schritt 1 (entwerten, Commit)  <  INSERT eines NEUEN Tokens  <  Schritt 2 (PIN)

und am Ende steht **`pin_hash` neu UND ein gültiges, frisch verschicktes Token
offen** — genau der Zustand, den Z6a verbietet. Mein Entwurf hätte den alten
Fehler durch ein schmaleres Fenster wieder hereingelassen.

Schritt 3 schliesst es, kostet nichts und öffnet keinen neuen Sperrpfad (es
ist dieselbe Anweisung wie Schritt 1, wieder ein eigener Commit).
**Die verbleibenden Fehlerfälle sind dann:** scheitert Schritt 2, ist alles
tot und die PIN alt (s. Abwägung unten); scheitert Schritt 3, ist die PIN neu
und höchstens ein Token aus dem schmalen Fenster offen — **das ist der heutige
Zustand, aber nur noch für dieses Fenster statt für alle Bestandstokens.**

**Warum das die Klasse schliesst, ohne eine neue zu öffnen:**

* **Keine neue Sperrordnung** — aber die Begründung dafür war in Fassung 3
  zunächst FALSCH formuliert (R3-4, trifft zu). Dort stand: *„Zwei Autocommits
  halten nie zwei Sperren gleichzeitig.“* Das stimmt nicht: Schritt 1 und
  Schritt 3 sind MEHRZEILIGE UPDATEs, und PostgreSQL nimmt deren Zeilensperren
  während der Anweisung nacheinander und hält sie bis zum Anweisungsende
  gleichzeitig. Zwei nebenläufige mehrzeilige UPDATEs auf derselben
  Token-Menge können sich also sehr wohl verklemmen.
  **Richtig ist der schwächere, aber tragende Satz:** zwei Autocommits halten
  keine Sperre ÜBER ANWEISUNGSGRENZEN hinweg — und genau das verlangt der
  Kreis aus B3 (eine Sperre auf `mitarbeiter` HALTEN, während auf
  `mitarbeiter_token` gewartet wird). **Dieser Kreis kann nicht entstehen.**
  Das Restrisiko mehrzeiliger UPDATEs gegeneinander besteht heute schon
  (`:762` ist dieselbe Anweisung) und wird von diesem Beitrag weder
  eingeführt noch behoben — es ist zu NENNEN, nicht stillschweigend
  wegzulassen.
* **Der verbleibende Fehlerfall ist harmloser als heute — aber nicht
  kostenlos, und das gehört gesagt.** Scheitert Schritt 2, sind die alten
  Links tot und die PIN unverändert. Selbst nachgemessen, was das für den
  Mitarbeiter heißt:
  * **Hatte er schon eine PIN**, meldet er sich weiter an wie bisher
    (`routes/tablet-sperre.js:559-561` prüft nur `pin_hash`); verloren sind
    nur die ohnehin ungenutzten Einladungslinks. Schaden: keiner.
  * **Hatte er noch KEINE PIN** (`mitarbeiter.pin_hash` ist `TEXT`, also
    NULL-fähig), war der Token sein einziger Weg — und der ist jetzt tot.
    Er kommt bis zu einer neuen Einladung nicht hinein. Anmelden konnte er
    sich vorher allerdings auch nicht (`:561` und `:595` verlangen beide
    `pin_hash IS NOT NULL`), und der Admin, der gerade eine Fehlerseite
    gesehen hat, löst es mit einem Klick neu ein.
  **Dagegen steht der heutige Fehlerfall:** PIN gesetzt, alte Links weiter
  gültig — ein offener Anmeldeweg, der niemandem auffällt und erst mit
  `gueltig_bis` verfällt. Ein Zugangsverlust mit Ein-Klick-Behebung gegen
  einen unbemerkten offenen Zugang: die Richtung ist eindeutig, die
  Behauptung „strikt harmlos“ war es nicht.
* **Die Rennen mit dem Einlöseweg bleiben sauber.** Entwertet der Admin
  zuerst, scheitert die Einlösung an ihrem eigenen `rowCount`-Riegel
  (`:298`) und wird ordentlich abgewiesen. Löst der Mitarbeiter zuerst ein,
  gewinnt wie heute der spätere Schreiber die PIN.

**`bcrypt.hash` bleibt VOR beiden Schritten** — es steht bereits davor
(`:759`), 12 Runden bcrypt gehören in keinen Schreibpfad hinein.

**Der Kommentar `:763-767` wird BERICHTIGT, nicht nur ergänzt — eine
Anweisung, nicht zwei (R3-8: sie stand hier doppelt und leicht abweichend).**

Er sagt heute: *„Keine Transaktion hier — der Protokolleintrag darf das
bereits erfolgte Setzen nicht scheitern lassen."* Für den **`auditAppend`**
(`:769-776`, eigenes `try/catch`) bleibt das richtig, und er bleibt draussen.
Für die **Tokenentwertung** war es nie ein Protokolleintrag — dort ist der
Satz schlicht falsch.

Der neue Kommentar trägt DREI Angaben, und alle drei sind nötig:

1. **warum die Reihenfolge so ist** (entwerten – setzen – nochmals entwerten,
   mit dem Erzeugungsfenster als Grund, s.o.);
2. **warum hier ausdrücklich KEINE Transaktion steht** — mit Verweis auf
   `routes/mitarbeiter-auth.js:295-301`, sonst zieht sie jemand später als
   „Verbesserung" wieder ein und baut den Kreis aus B3;
3. **dass der `auditAppend` aus einem ANDEREN Grund draussen bleibt** als die
   Tokenentwertung — sonst liest sich Punkt 2 so, als gälte er auch für ihn.

CLAUDE.md: ein Kommentar ist eine Zusicherung.

**S5 und S6 treffen sich in derselben Route** — und die Reihenfolge aus S6
entscheidet, wie sie zusammenwirken: die `rowCount`-Prüfung aus S5 sitzt auf
Schritt 2 (dem `mitarbeiter`-UPDATE). Trifft es null Zeilen, sind die Tokens
bereits entwertet. **Das ist gewollt und harmlos** — Tokens eines nicht
(mehr) vorhandenen Mitarbeiters sollen ohnehin nicht gelten.

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
Zusicherung eindeutig — und was KEINE Zusicherung ist, steht am Ende
dieses Abschnitts ausdrücklich als Prüfschritt, nicht als „Z7“.*

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
* **ZWEITE Zusicherung, weil der `kat`-Umbau sonst still schiefgehen kann
  (R3-5, gemessen).** Vergisst der Ausführende, `:5458` von `SELECT id` auf
  `SELECT id, name` zu erweitern, ist `kat.name` `undefined`. Der Ausdruck
  `kat ? kat.name : null` liefert dann **nicht `null`, sondern `undefined`**
  (`kat` ist truthy) — und `JSON.stringify` **lässt den Schlüssel still weg**.
  Gemessen: `JSON.stringify({name:"X", kategorie: ({id:7}).name})` ergibt
  `{"name":"X"}`, der Schlüssel `kategorie` ist **nicht vorhanden**. Kein
  Wurf, kein roter Test — der Audit-Eintrag `wartung_geraet_angelegt` trägt
  ab da schlicht keinen Kategorienamen mehr, und Z1 misst bisher nur
  Zeilenzählungen.
  **Also:** nach dem fehlerfreien POST den jüngsten `audit_log`-Eintrag mit
  `ereignis='wartung_geraet_angelegt'` lesen und zusichern, dass sein Payload
  den Schlüssel `kategorie` mit dem NAMEN der angelegten Kategorie trägt.
  **Gegenprobe:** `:5458` zurück auf `SELECT id` → genau diese Zusicherung ROT.

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

**EIGENER LAUF mit unterscheidbaren Vorwerten — sonst ist ein Drittel der
Zusicherung blind (B6).** Z2a arbeitet mit `datei_vorhanden = 1`; das UPDATE
schreibt ebenfalls `1`. Vorher 1, nachher 1 — für genau diese Spalte KANN die
Zusicherung nicht fallen, egal ob sie aus der Transaktion gezogen wurde.
Genau die Krankheit aus CLAUDE.md: *„der Vorzustand erzwingt das erwartete
Ergebnis ohnehin."*

Z2b läuft deshalb gegen einen eigenen Vorzustand, in dem **jede der drei
Spalten einen anderen, wiedererkennbaren Wert trägt** — insbesondere
`datei_vorhanden = 0`, `dateiname = 'SENTINEL-ALT.pdf'` und ein
`hochgeladen_am`, das im Testbestand sonst nirgends vorkommt. Dann fällt jede
Spalte einzeln auf, und die Gegenprobe wird je Spalte einzeln gefahren.

### Z2c — S2: das Unterschriften-Rennen bleibt auf der sicheren Seite

Der Beweis in §1 zeigt, dass die Transaktion das Fenster schliesst — eine
Zusicherung, die das MISST, braucht es trotzdem, sonst hängt die Aussage an
meiner Herleitung.

**BERICHTIGT nach der Gegenlesung (DS-1, selbst nachgemessen).** Die erste
Fassung dieser Zusicherung verlangte, ein Unterschriftenvorgang laufe
„vollständig durch, WÄHREND die Transaktion hängt". **Das ist unmöglich:** die
neue S2-Transaktion nimmt den studioweiten Advisory-Lock als erste Anweisung,
und der Unterschriftenweg nimmt denselben Lock bei `:946`. Er blockiert dort,
er kommt nicht zum Commit. Eine Zusicherung, die einen unerreichbaren Zustand
verlangt, ist keine — sie ist eine Anweisung zum Scheitern.

**Gemessen, was der Unterschriftenweg VOR dem Lock erledigt** — und das ist
genau das, worauf es ankommt: R1 (`:793`), R2 (`:798`), PDF lesen und stempeln
(`:861-888`), signierte Datei schreiben (`:915`), `UPDATE unterschriften SET
pdf = …` als eigener Pool-Commit (`:918`), Kopie (`:920`). **Erst bei `:932`
beginnt seine Transaktion, erst bei `:946` nimmt er den Lock.** Welches
Dokument gestempelt wird, steht also längst fest, bevor irgendeine Sperre im
Spiel ist.

Die Zusicherung lautet deshalb:

* Ein externer Client hält `SELECT … FOR UPDATE` auf die Belehrungszeile.
* `/neue-version/:id` wird gestartet und blockiert nachweislich
  (`pg_blocking_pids`).
* Ein Unterschriftenvorgang wird gestartet und läuft **bis an seinen
  Lock-Wartepunkt**. Gemessen wird, was er dabei gelesen hat: **weder** die
  neue Generation **noch** den neuen `dateiname` — beides, nicht nur eines.
  Dass er wartet, wird über `pg_blocking_pids` BELEGT, nicht über eine
  Zeitschwelle.
* Sperre lösen, beide beenden lassen. **Erwartet:** sein DELETE
  (`:962-965`) trifft NICHTS, weil es gegen die alte Generation läuft — die
  Pflicht zur neuen Fassung überlebt.
* **Gegenprobe:** die Transaktion durch zwei `db.run` in der VERTAUSCHTEN
  Reihenfolge ersetzen → Z2c ROT, und zwar an der überlebenden Pflicht, nicht
  am Wartepunkt.
* **Keine Zeitschwelle, an keiner Stelle.**

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
* **Erwartet:** genau **ein** wirksames UPDATE, genau **ein** Audit-Eintrag.
* **NICHT erwartet: „der Name des ERSTEN“ (Kimi-4).** Fassung 2 verlangte das,
  und es hängt an einer Ordnung, die PostgreSQL nicht zusichert: wer von zwei
  Wartenden nach dem Lösen der Sperre zum Zug kommt, ist nicht als FIFO
  spezifiziert. Eine Zusicherung darauf kann zufällig rot werden — oder, viel
  schlimmer, eine Ordnung BELEGEN, die es gar nicht gibt. Geprüft wird
  stattdessen: der gespeicherte Name gehört zu **einem der beiden** Requests,
  und `frist_festgelegt_am` trägt genau **einen** Wert — der Verlierer hat
  NICHTS überschrieben. Das ist die Eigenschaft, um die es geht.
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
Audit-Eintrag, Zeile unverändert.

**Die naheliegende Gegenprobe trägt NICHT (B4, selbst nachgemessen).** Sie
lautete: `studio_id` aus der neuen `WHERE` entfernen → Z4c ROT. Tatsächlich
bleibt Z4c GRÜN, denn der Fremdstudio-Request erreicht das UPDATE gar nicht:
der vorgelagerte SELECT (`:6381`) trägt selbst `AND studio_id=$2`, findet die
fremde Zeile nicht, und `:6382` (`if (!g) return res.redirect(…)`) beendet die
Route. **Eine Gegenprobe, die den mutierten Code nicht erreicht, misst
nichts.**

Z4c besteht deshalb aus ZWEI Teilen:

1. **Der Verhaltenstest** oben — er bewacht den Frühausstieg, und das ist für
   sich genommen wertvoll.
2. **Eine STATISCHE Zusicherung auf die UPDATE-Anweisung selbst:** ihre
   `WHERE` enthält `studio_id`. Ihre Gegenprobe ist eine reine
   Quelltextmutation und wird zwangsläufig rot, weil sie an keinem
   Frühausstieg vorbeimuss. **Nur Teil 2 bewacht die Mandantenbedingung der
   Schreibabfrage.**

### Z4d — S4b: die ID-Wache greift an diesem Eintrittspunkt

`POST …/frist-bestaetigen/0x10` → keine Wirkung auf Gerät 16.

**Die Antwortform wird HIER festgelegt, nicht dem Ausführenden überlassen
(Kimi-7).** Fassung 2 schrieb „Antwort wie an den zwölf bestehenden Punkten“ —
gemessen antworten die zwölf aber NICHT einheitlich: `geraete.js:352` gibt
**400 mit „Ungültige ID.“**, `pin-direkt:748` und `umbenennen:832` geben einen
**baren Redirect ohne feedback**, `einladen:714` einen **Redirect mit
`feedback=einladung_fehler`**. Gegen „wie die zwölf“ ist gar nichts prüfbar.

**Festgelegt: `frist-bestaetigen/:id` antwortet wie sein nächster Nachbar in
derselben Datei** — `400` mit `Ungültige ID.`, wie `geraete.js:352/485/725`.
Grund: die Route liefert im Erfolgsfall ebenfalls kein feedback, und ein neuer
Code bräuchte einen Listeneintrag, den es hier nicht gibt.

**Positivkontrolle:** dieselbe Route mit der echten ID wirkt. **Gegenprobe:**
die Wache mit `if (false && …)` abhängen → genau dieser Ausschnitt ROT.

### Z5a — S5: keine Erfolgsmeldung ohne getroffene Zeile

Je Route ein POST mit einer **format-gültigen, nicht vergebenen** ID →
**keine** Erfolgsmeldung, DB unverändert. **Positivkontrolle:** dieselbe Route
mit echter ID → Erfolgsmeldung UND nachweisbare Wirkung in der DB.

**Die angekündigte Gegenprobe trägt so NICHT (B5).** „`rowCount`-Abfrage
entfernen → diese drei Fälle ROT“ gilt nicht: bei einer NIE vergebenen ID
liefert schon der vorgelagerte SELECT `ma = null`, und die Behebung steigt
dort aus. Entfernt man danach nur die `rowCount`-Auswertung, bleiben alle drei
Fälle grün. **Die Zusicherung misst dann den `ma`-Frühausstieg, nicht den
Riegel, für den `rowCount` da ist.**

`rowCount` bewacht einen ANDEREN Fall: die Zeile verschwindet ZWISCHEN SELECT
und UPDATE. Z5a zerfällt deshalb in zwei Läufe:

* **Z5a-1 (Frühausstieg):** nie vergebene ID → keine Erfolgsmeldung.
  Gegenprobe: den `ma`-Ausstieg entfernen → ROT.
* **Z5a-2 (`rowCount`):** der SELECT liest eine ECHTE Zeile, danach wird sie
  über eine ZWEITE Verbindung gelöscht, erst dann läuft das UPDATE.
  **Erwartet:** keine Erfolgsmeldung. **Gegenprobe:** die
  `rowCount`-Auswertung entfernen → NUR dieser Lauf ROT.

Erst Z5a-2 unterscheidet die beiden Riegel voneinander.

### Z5b — S5: die neuen Rückmeldecodes werden auch ANGEZEIGT

Für `name_nicht_gefunden` und `pin_fehler`: nach dem Redirect enthält die
gelieferte Seite den hinterlegten Text. **Gegenprobe:** den Eintrag aus der
Definitionsliste (`:60-74`) entfernen → Z5b ROT.
*(Ohne diese Zusicherung ist ein vergessener Listeneintrag ein stiller
Redirect, den Z5a nicht von einer Fehlermeldung unterscheidet.)*

### Z6a — S6: keine PIN ohne tote Tokens

*Neu geschnitten, weil S6 nach B3 ohne Transaktion gebaut wird. Die
Zusicherung ist ab jetzt eine über die REIHENFOLGE, nicht über Atomarität.*

* Vorzustand: Mitarbeiter mit offenem, unverbrauchtem `mitarbeiter_token`,
  bekannte alte `pin_hash`.
* Fehler GENAU für das `mitarbeiter`-UPDATE (Schritt 2) stellen.
* **Erwartet:** `pin_hash` **unverändert**, Token **entwertet**, Antwort
  Fehlerseite. Das ist der bewusst in Kauf genommene Zustand — ärgerlich,
  kein offener Anmeldeweg.
* **Der VERBOTENE Zustand bekommt eine eigene Zusicherung:** es darf NIE
  `pin_hash` neu UND ein Token offen sein. Gegenprobe: die beiden Schritte
  zurücktauschen (PIN zuerst) und den Tokenschritt werfen lassen → genau
  diese Zusicherung ROT. **Das ist der heutige Bestandszustand** — die
  Gegenprobe misst also den Befund selbst.
* **Positivkontrolle:** ohne gestellten Fehler ist die PIN neu **und** das
  Token entwertet.

### Z6b — S6: die beiden PIN-Wege verklemmen sich NICHT

*Diese Zusicherung gibt es nur, weil die Gegenlesung den Kreis gefunden hat
(B3). Sie hält fest, was der Verzicht auf die Transaktion erkauft — sonst
zieht sie jemand später als „Verbesserung“ wieder ein.*

* Ein Mitarbeiter mit MEHREREN offenen Tokens.
* Zwei echte, gleichzeitige Vorgänge: `POST /admin/mitarbeiter/pin-direkt/:id`
  und `POST /mitarbeiter/pin-setzen/:token` desselben Mitarbeiters. Die
  Überschneidung wird über `pg_blocking_pids` BELEGT, nicht über eine
  Zeitschwelle.
* **Erwartet, und zwar NUR das, was in JEDER Verschränkung gilt (R3-3):**
  **kein** `40P01`, und am Ende ist **kein Token mehr offen**.
  *Fassung 3 verlangte hier zusätzlich „der andere wird fachlich über seinen
  `rowCount`-Riegel abgewiesen“. Das widerspricht dem Behebungstext von S6,
  der für eine der beiden Verschränkungen ausdrücklich sagt, dass BEIDE
  Vorgänge erfolgreich sind (löst der Mitarbeiter zuerst ein, gewinnt der
  spätere Schreiber die PIN — der Admin-Schritt 1 trifft dann `rowCount 0`,
  und das ist dort kein Fehler, sondern der Normalfall). Eine Zusicherung,
  die eine Abweisung VERLANGT, wäre in genau dieser Reihenfolge falsch rot.*
* **Die Abweisung wird nur für den EINEN Fall geprüft, in dem sie gilt:**
  löst der Mitarbeiter NACH Admin-Schritt 1 ein, greift sein eigener Riegel
  (`routes/mitarbeiter-auth.js:298`) und der Einlöseversuch wird abgewiesen.
* **Gegenprobe:** die beiden Admin-Schritte in eine `db.tx` in der Ordnung
  `mitarbeiter` → `mitarbeiter_token` packen (also genau der Entwurf der
  Fassung 2) → Z6b muss mit `deadlock detected` / SQLSTATE `40P01` ROT
  werden. **Ohne diese Gegenprobe ist Z6b nur eine Behauptung, dass zwei
  Autocommits sich nicht verklemmen können.**
* **Die Gegenprobe braucht einen ERZWINGUNGSMECHANISMUS, sonst misst sie den
  Zufall (R3-2).** Ein Deadlock zwischen zwei echten Requests tritt nur ein,
  wenn beide ihre erste Sperre HALTEN, bevor eine die zweite anfordert. Ohne
  Erzwingung kann die mutierte Fassung wiederholt grün laufen — und ein
  grünes Ergebnis ist hier der gefährlichste Befund: es liest sich als „den
  Kreis gibt es gar nicht“ und hiesse in Wahrheit „die Probe hat ihn nicht
  getroffen“.
  **Festgelegt:** das Mutationsskript setzt in die mutierte Transaktion
  zwischen die beiden Anweisungen ein `SELECT pg_sleep(2)` — nur dort, nie im
  Produktivcode — und der Gegenweg wird während dieser Pause gestartet. Die
  Überschneidung wird wie bei Z4a über `pg_blocking_pids` BELEGT, nicht über
  eine Zeitschwelle. **Bleibt die Probe trotz Erzwingung grün, ist das ein
  Befund gegen meine eigene Begründung für den Transaktionsverzicht** und
  wird gemeldet (Abschnitt 5), nicht weggeschrieben.

### KEINE Zusicherung, sondern ein PFLICHT-PRÜFSCHRITT: kein Fehler wird stumm

*Stand hier bis zur Gegenlesung als „Z7" zwischen den Zusicherungen (DS-2,
trägt). Das war falsch einsortiert: alle anderen hier haben ein
maschinelles Rot/Grün mit Gegenprobe, dieser hat keins. Er bleibt
verbindlich, aber als Schritt der Abnahme (§4), nicht als Test — sonst
steht in der Liste ein Eintrag, den kein Lauf je rot machen kann.*

Alle sechs Behebungen verschieben Fehlerbehandlung. **Die Gegenfrage aus
CLAUDE.md ist für JEDE einzeln zu beantworten: welche bestehende Zusicherung
erfüllt mein neuer Fehlerweg ab jetzt, ohne dass das Bewachte noch da ist?**

Vor dem Bau `grep` auf die Meldungstexte, Rückmeldecodes und Statuscodes der
sechs Routen, und jeden Treffer im Bericht nennen — auch die nicht
betroffenen.

**Die Liste unten war UNVOLLSTÄNDIG, und der Grund ist lehrreich (B7).** Ich
hatte nach ROUTENPFADEN gesucht (`mitarbeiter/email`, `pin-direkt`, …). Damit
fehlte `test_feature_employee_feedback.js` — nachgemessen prüft es genau die
drei Erfolgscodes, die S5 ändert (`feedback=email_gespeichert`,
`=pin_gesetzt`, `=name_geaendert`), nennt aber keinen Routenpfad. **Ein
Suchmuster, das eine Form voraussetzt, misst die Form mit.** Gesucht wird
deshalb nach BEIDEM: Routenpfaden UND Rückmeldecodes/Meldungstexten.

Gemessen betroffen (`5a194ba`):

    neue-version        test_feature_belehrung_version.js, …multer_2_4_bestandsschutz.js,
                        …signatur_verbrauch.js, …upload_fehlerbehandlung.js
    belehrungen/loeschen  test_feature_audit_batch3.js
    frist-bestaetigen   …audit_kapselung_geraete_static.js, …_verhalten.js, …frist_herkunft.js
    pin-direkt          …audit_benutzerverwaltung_static.js, …id_wache_route.js
    umbenennen/email    …audit_mitarbeiter.js, …id_wache_route.js
    geraetewartung/geraet/neu   acht Dateien, s. eigene Messung
    Erfolgscodes S5    test_feature_employee_feedback.js  <- fehlte in Fassung 2
    email_fehler/name_fehler   test_feature_id_wache_route.js

---

## 3b. Der Bau wird GETEILT — drei Beiträge, je eine Datei

**Entschieden 19.09.2026, nach der zweiten Planprüfung.** Das Papier
beschreibt sechs Fundstellen in drei Dateien. Sie in EINEN Beitrag zu legen,
wäre der bequeme Weg und der falsche: die Zusicherungen dieses Papiers
reichen von „eine Zeile mehr in der `WHERE`" bis zu „erzeuge einen echten
`40P01` in der Gegenrichtung". Ein Beitrag, der beides zugleich trägt, macht
jede Gegenprobe teurer und jeden Fehlschlag mehrdeutig.

**Der Schnitt folgt den DATEIEN, weil sich die Fundstellen genau so
gruppieren — kein Beitrag fasst eine Datei an, die ein anderer auch anfasst:**

| | Datei | Fundstellen | Zusicherungen |
|---|---|---|---|
| **B** | `routes/admin/geraete.js` | S1, S4, S4b | Z1, Z4a, Z4b, Z4c, Z4d |
| **C** | `routes/belehrungen.js` | S2, S3 | Z2a, Z2b, Z2c, Z3 |
| **A** | `routes/admin/mitarbeiter.js` | S5, S6 | Z5a-1, Z5a-2, Z5b, Z6a, Z6b |

**S5 und S6 MÜSSEN zusammen gebaut werden** — beide fassen
`POST /mitarbeiter/pin-direkt/:id` an, und zwar dieselben zwei Zeilen
(`:760`, `:762`). Getrennt würde derselbe Code zweimal umgeschrieben.

**Reihenfolge: B, dann C, dann A.**

* **B zuerst**, weil es die geschlossenste Einheit ist und die Muster
  einübt, die C und A brauchen (Transaktion, `rowCount`, `FOR UPDATE` plus
  `pg_blocking_pids` bei Z4a).
* **C danach**, weil dort der Befund liegt, der das ganze Papier ausgelöst
  hat — Datenverlust im scheinbaren Erfolgszustand.
* **A zuletzt**, weil Z6b die schwerste Zusicherung des Papiers ist: sie
  verlangt, in der GEGENRICHTUNG einen echten `deadlock detected` zu
  erzeugen. Wer das als Letztes baut, hat die beiden anderen
  Nebenläufigkeitsproben schon hinter sich.

**Jeder Beitrag geht einzeln durch das volle Prüf-Ritual** — eigene Suite,
Dateizahl-Ritual, Lint, CI, Merge. Kein Beitrag wartet auf einen anderen;
sie berühren keine gemeinsame Datei.

## 4. Abnahme

**Je Beitrag einzeln** (s. Abschnitt 3b) — nicht einmal am Ende für alle
drei. Wie in `plaene/auftrag-id-wache.md`, Abschnitt 4: volle Suite ohne Pipe und
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
  Mitarbeiterzahl — gemessen, nicht geschätzt. *(Nur Beitrag C.)*
* Findet er eine **siebte** Stelle derselben Klasse in einer dieser drei
  Dateien: melden — meine Liste ist dann unvollständig.
* Lässt sich ein Fehler für GENAU EINEN der DB-Aufrufe nicht stellen, ohne die
  anderen mitzutreffen: melden. Eine Probe, die alle Aufrufe trifft, misst
  etwas anderes als Z1, Z2a oder Z6a.
* **Gelingt es nicht, in der Gegenrichtung von Z6b einen echten `40P01` zu
  erzeugen: MELDEN, nicht die Zusicherung abschwächen.** Entweder ist der
  Kreis anders als beschrieben — dann ist meine Begründung für den
  Verzicht auf die Transaktion falsch und S6 gehört neu entschieden — oder
  die Probe trifft ihn nicht. Beides ist ein Befund, keines ist ein Grund,
  die Zusicherung weicher zu schreiben.
* **Widerspricht eine Prämisse dieses Papiers seiner Messung, gilt seine
  Messung.** Fassung 1 hatte vier falsche Tatsachenbehauptungen; die teuerste
  Korrektur des letzten Beitrags kam aus einem Widerspruch des Ausführenden.

---

## Anhang — was sich gegenüber Fassung 1 geändert hat

*(Runde 2 und 3 stehen in den Nachträgen darunter.)*

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
| 10 | `Z4` doppelt vergeben | Z1…Z6 eindeutig, der Rest als Prüfschritt | Planprüfung + DS-2 |
| 11 | Rückmeldecode delegiert | gemessen: einer da, zwei neu + Z5b | eigene Messung |
| 12 | `schalteAlleFrei`-Abhängigkeit delegiert | gemessen: keine | eigene Messung |
| 13 | S1-Audit nur mit Lock-Begründung | zusätzlich: kann gar nicht werfen | eigene Messung |
| 14 | — | **S4b**, dreizehnter ID-Eintrittspunkt | eigene Messung |

**Dass der zentrale Vorschlag der Fassung 1 seine eigene Klasse nicht
schliesst, hätte kein Diff-Review gefunden** — es hätte den gebauten Code
gegen den Plan geprüft, und der Plan war falsch.

---

# NACHTRAG — Planprüfung Runde 2 (19.09.2026, beide Spuren)

**13 Befunde** (sol 11, deepseek 2). **Alle 13 selbst nachgemessen; 12 tragen
vollständig, einer (B9) ist eine richtige Beobachtung, deren Auflösung eine
Betreiber-Entscheidung ist.** Die beiden deepseek-Befunde waren eine
TEILMENGE der sol-Befunde — anders als am 13.09.2026, wo zwei Spuren NULL
Überschneidung hatten. Eine Stichprobe, keine Umkehr.

Kosten: 17,42 $ (sol, 21 Runden / 92 Suchen / 47 Lesungen) + ~0,05 $ (deepseek).

| ID | Spur | Schwere (Prüfer) | Nach eigener Messung |
|---|---|---|---|
| B1 | sol | blockierend | **trägt** — die Folge (die neue Pflicht wird VERBRAUCHT) hatte ich nicht gezogen. Blockiert die BEHAUPTUNG, nicht den Bau |
| B2 / DS-1 | beide | blockierend / mittel | **trägt** — Z2c verlangte einen unerreichbaren Zustand |
| **B3** | sol | blockierend | **trägt — teuerster Befund.** Echter neuer Verklemmungskreis; S6 wurde daraufhin GANZ anders gebaut |
| B4 | sol | sollte behoben | **trägt** — Gegenprobe erreicht das mutierte UPDATE nicht |
| B5 | sol | sollte behoben | **trägt** — Gegenprobe misst den Frühausstieg statt `rowCount` |
| B6 | sol | sollte behoben | **trägt** — `datei_vorhanden` 1 vorher = 1 nachher, kann nicht fallen |
| B7 / DS-2 | beide | sollte behoben | **trägt** — Z7 ist nicht rotfähig; und meine Testliste war unvollständig |
| B8 | sol | blockierend | **trägt in der Sache**; die Stützstelle („ein Bestandskommentar benennt den Fall") ist von mir NICHT bestätigt |
| B9 | sol | sollte behoben | Beobachtung richtig, **Entscheidung gehört dem Betreiber** — fährt nicht mit |
| B10 | sol | Anmerkung | **trägt** — `core/db.js` 421-432 statt 426-433 |
| B11 | sol | Anmerkung | **trägt** — meine `auditAppend`-Begründung war zu stark |

## Was daraus wirklich folgt

**1. Der teuerste Befund war einer, den ich ausdrücklich gesucht hatte.** Meine
Frage 1 im Auftrag lautete wörtlich: *„Nenne jeden konkreten Weg, auf dem die
neue Transaktion mit einem bestehenden zu einem Kreis wird."* Für S2 kam die
Antwort „kein Kreis" — geprüft und begründet. Für S6, wo ich gar nicht gefragt
hatte, kam B3. **Eine gezielte Frage bringt auch dort etwas, wo man sie nicht
gestellt hat**; sie richtet die Aufmerksamkeit aus, statt sie zu verengen.

**2. Zweimal hintereinander war meine BEHEBUNG die Gefahr, nicht der Befund.**
In Fassung 1 hätte der Reihenfolgentausch ein Rennen im Normalbetrieb
geöffnet; in Fassung 2 hätte die Transaktion eine Verklemmung eingeführt. Der
BEFUND war beide Male richtig. Das ist ein Muster und gehört benannt: *bei
dieser Klasse ist die Behebung gefährlicher als der Fehler.*

**3. Und die Richtung ist nicht vorhersagbar.** Bei S2 war die Transaktion
richtig und der Tausch falsch. Bei S6 ist es GENAU UMGEKEHRT: der Tausch ist
richtig und die Transaktion falsch. Wer aus dem einen Fall eine Regel macht,
baut den anderen kaputt. **Was entscheidet, ist nicht das Mittel, sondern die
Frage, welche ANDEREN Transaktionen dieselben Zeilen anfassen — und in welcher
Reihenfolge.** Genau das ist vor jeder Behebung dieser Klasse abzuzählen.

**4. Vier der elf Befunde betrafen Zusicherungen, die nicht rot werden
können** (B4, B5, B6, B7) — Punkt 2 unserer Prüfreihenfolge, unsere teuerste
Klasse. Alle vier hätte ein Diff-Review erst nach dem Bau gefunden, als
fertiger Test mit grünem Lauf.

## Was NICHT mitfährt, und warum

* **B9 (Sessions entwerten).** Bestehende Tablet-Sitzungen prüfen `pin_hash`
  nicht erneut; ein direktes PIN-Setzen beendet sie also nicht. Ob das
  Setzen einer PIN durch den Admin ein Credential-Reset SEIN SOLL, ist keine
  technische Feststellung, sondern eine Festlegung — und sie beträfe BEIDE
  PIN-Wege, auch den öffentlichen. **Offener Punkt, Betreiber-Entscheidung.**
* **U-SIG1** (B1) — eigener Entwurf, s. `plaene/durchgang-befunde.md`.
* **U-DEL1** — das stille `unlink` bei `:2299`, unverändert.

---

# NACHTRAG 2 — die DRITTE Spur: Kimi K3 (19.09.2026, 22:38 UTC)

**Warum es diesen Lauf gibt:** Der Betreiber hat abends einen Kimi-Schlüssel
geliefert. Der A/B-Lauf, den ich dafür vorgeschlagen hatte, ist genau dieser:
**dasselbe Papier, wortgleiches Material, wortgleicher Auftrag** wie die
DeepSeek-Spur — maschinell verglichen, einziges abweichendes Feld `model`.
Zwei erzwungene Abweichungen betreffen nur den Transport: `truncation` musste
raus (Kimi unterstützt es nicht), `stream` dazu (der Egress-Proxy schneidet
sonst bei 301 s ab — gemessen, der erste Versuch starb genau dort).

**Ergebnis: 7 Befunde, und SECHS davon hatte keine der beiden anderen Spuren.**
Alle sieben von mir am Quelltext nachgemessen, alle sieben tragen.

| # | Schwere | Befund | Nachgemessen |
|---|---|---|---|
| K-1 | blockierend | Z2c in der positiven Richtung undurchführbar | **trägt** — deckungsgleich mit B2/DS-1, die einzige Überschneidung |
| K-2 | hoch | **S6 widerspricht Z5b:** `throw` bei `rowCount===0` landet im generischen `catch` (`:778-780`) → `res.send(layout)`, KEIN Redirect. Z5b verlangt aber einen Redirect mit `pin_fehler` | **trägt** gegen den eingereichten Stand. Durch den S6-Umbau (B3) bereits gegenstandslos: dort steht `return`, kein `throw` |
| K-3 | mittel | **S1 schliesst seine eigene Klasse nicht:** der `kat`-SELECT (`:5540`, `db.one` über den Pool) steht NACH dem Commit und VOR dem Redirect, INNERHALB des äusseren `try` | **trägt** — eingearbeitet, der SELECT entfällt ersatzlos |
| K-4 | mittel | Z4a verlangt „der Name des ERSTEN"; PostgreSQL sichert keine FIFO-Ordnung der Sperrwarteschlange zu | **trägt** — Zusicherung umformuliert |
| K-5 | niedrig | „zwei weitere Schreiber" zählt ANWEISUNGEN statt WEGEN; `:2082` erreicht denselben INSERT | **trägt** — berichtigt, Schluss bleibt |
| K-6 | niedrig | Codezitat `"))c;` statt `")).c;` — syntaktisch kaputt | **trägt** — berichtigt |
| K-7 | niedrig | Z4d („Antwort wie an den zwölf Punkten") ist nicht prüfbar: die zwölf antworten in **drei** verschiedenen Formen | **trägt** — Antwortform jetzt festgelegt |

## Was dieser Lauf zeigt — und was NICHT

**Was er zeigt:** Eine dritte Spur mit demselben Material und demselben
Auftrag findet ANDERES, nicht MEHR VOM SELBEN. Sechs von sieben Befunden
hatte weder `gpt-5.6-sol` (mit Repo-Lesezugriff, 21 Runden, 92 Suchen) noch
`deepseek-v4-pro`. Das ist dieselbe Beobachtung wie am 13.09.2026 —
verschiedene Sucher finden verschiedene Klassen — jetzt an einem dritten
Gegenstand.

**Die Klasse, die nur Kimi traf, ist auffällig einheitlich: INNERE
WIDERSPRÜCHE DES PAPIERS.** K-2 (S6 gegen Z5b), K-3 (S1 gegen seine eigene
Schadensbeschreibung), K-7 (Z4d gegen den tatsächlichen Bestand), K-5 und K-6
(Zählung und Zitat gegen den Quelltext). Es hat das Papier gegen SICH SELBST
gelesen, nicht nur gegen den Code. Sol hat dagegen die UMGEBUNG abgesucht und
fand dort den Verklemmungskreis (B3), den Kimi nicht hatte — es hatte den
Quelltext von `mitarbeiter-auth.js` auch nicht im Bündel.

**Was er NICHT zeigt.** Ein Papier, ein Lauf, ein Tag. Der Vergleich ist
ausserdem NICHT gleichwertig: sol durfte im Repo LESEN und hat 47 Lesungen
gemacht, Kimi bekam ein festes Bündel und einen Schuss. Dass Kimi mehr NEUE
Befunde hatte, sagt damit nichts über „besser" — es sagt, dass der dritte
Sucher eine Klasse abdeckt, die die anderen beiden nicht abdecken. Genau dafür
ist er da.

**Kosten, gerechnet aus der gemeldeten Nutzung** (44.704 rein, davon 44.544
aus dem automatischen Präfix-Cache; 26.885 raus, davon 20.183 Denken) und den
Herstellerpreisen (3,00 / 15,00 $ je Mio, Cache-Treffer 0,30): **rund 0,42 $.**
Zum Vergleich derselbe Gegenstand: sol **17,42 $** (mit Repo-Zugriff),
deepseek **~0,05 $**. Die Cache-Treffer stammen aus den beiden abgebrochenen
Versuchen davor — **der automatische Präfix-Cache ist damit an unserem
eigenen Material belegt**, nicht nur behauptet.

---

# NACHTRAG 3 — Runde 3, nur auf die beiden NEUENTWÜRFE gerichtet (22:53 UTC)

Gefahren, weil unsere eigene Regel eine zweite Lesung verlangt, wenn eine
Behebung VERHALTEN ändert — S6 (Transaktion → drei Autocommits) und S1
(engere → weitere Transaktionsgrenze) tun beides. **Eine Spur, `kimi-k3`,
~0,30 $, 32.901 Token rein / 21.653 raus.**

**8 Befunde. Alle acht selbst nachgemessen, alle acht tragen.** Einer davon
(R3-7, die verwaiste `Z6`-Referenz) war Minuten vorher schon von mir selbst
gefunden und behoben — er zählt trotzdem, aber als BESTÄTIGUNG, nicht als
Fund.

| # | Schwere | Befund | Nachgemessen |
|---|---|---|---|
| **R3-1** | hoch | **Der Zwei-Schritt-Entwurf übersieht den Weg, der Tokens ERZEUGT.** `sendeMitarbeiterEinladung()` (`mitarbeiter-auth.js:172-186`, eigene `db.tx`) ist öffentlich über `/pin-vergessen` erreichbar. Committet ihr INSERT zwischen Schritt 1 und 2, steht am Ende PIN neu UND Token offen | **trägt** — Quelltext bestätigt. **Schritt 3 eingeführt** |
| R3-2 | mittel | Z6b hat keinen Erzwingungsmechanismus; ein Deadlock zwischen echten Requests ist zeitabhängig, die Gegenprobe kann zufällig grün bleiben | **trägt** — `pg_sleep(2)` im Mutationsskript festgelegt |
| R3-3 | mittel | Z6b verlangt eine Abweisung, die S6s eigener Text für eine der Verschränkungen ausschliesst | **trägt** — auf die verschränkungs-invarianten Eigenschaften umgestellt |
| R3-4 | mittel | „Zwei Autocommits halten nie zwei Sperren gleichzeitig" ist **falsch**: ein mehrzeiliges UPDATE hält seine Zeilensperren bis Anweisungsende gleichzeitig | **trägt** — auf den schwächeren, tragenden Satz berichtigt |
| R3-5 | mittel | Vergisst der Ausführende `SELECT id, name`, ist `kat.name` `undefined`, und `JSON.stringify` lässt den Schlüssel **still weg** — kein Wurf, kein roter Test | **trägt** — in `node` nachgemessen, Z1 um eine Payload-Zusicherung erweitert |
| R3-6 | niedrig | Die Semantik des früh gelesenen Kategorienamens war nicht festgelegt | **trägt** — festgelegt |
| R3-7 | niedrig | Verwaiste `Z6`-Referenz in §5 | **trägt** — war selbst schon gefunden |
| R3-8 | niedrig | Die Kommentar-Anweisung stand zweimal, leicht abweichend | **trägt** — zu einer zusammengeführt |

## Was diese Runde über das Verfahren sagt

**Der teuerste Befund ist wieder ein Fehler MEINER BEHEBUNG, nicht des
Befunds.** Das ist jetzt die DRITTE Fassung in Folge, in der das so war:

| Fassung | Der Befund war | Meine Behebung wäre gewesen |
|---|---|---|
| 1 | richtig | ein Rennen im Normalbetrieb (N-2) |
| 2 | richtig | eine echte Verklemmung (B3) |
| 3 | richtig | ein offenes Token trotz neuer PIN (R3-1) |

Dreimal hintereinander war der GEFUNDENE Fehler unstrittig und die von mir
vorgeschlagene Abhilfe die eigentliche Gefahr. **Das ist kein Zufall mehr,
sondern eine Eigenschaft dieser Klasse:** wer eine Schreibreihenfolge ändert,
verschiebt ein Fenster, statt es zu schliessen — und ob das hilft, hängt an
allen ANDEREN Wegen, die dieselben Zeilen anfassen. Die Regel steht seit
heute in CLAUDE.md; dieser dritte Fall belegt sie ein weiteres Mal.

**Und die Frage, die R3-1 gefunden hat, hatte ich zweimal gestellt und
zweimal zu eng.** In Runde 2 fragte ich nach Verklemmungen; in Runde 3 nach
Verschränkungen mit dem EINLÖSEweg und dem LÖSCHweg. Der Weg, der Tokens
ERZEUGT, stand in keiner meiner Fragen — gefunden wurde er trotzdem, weil die
Frage „welchen Zustand erzeugt das, den es heute nicht gibt?" offen genug
gestellt war. **Eine Frage nach einem ZUSTAND findet mehr als eine Frage nach
einem MECHANISMUS.**
