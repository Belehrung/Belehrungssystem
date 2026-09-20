# Nacharbeit Beitrag C — Auftragspapier (20.09.2026)

Zweig `beitrag-c-belehrungen-schreibreihenfolge`, Stand `61665d4`.
Alles unten ist von mir SELBST nachgemessen; die Zahlen stehen dabei.

**Komplexitätseinordnung vor dem Auftrag:** nicht „sehr komplex" — jede
Entscheidung ist unten ausgeschrieben, und derselbe Ausführende hat diese
Beweisklasse in den Beiträgen B und C schon gebaut. **Standard-Executer.**

---

## N1 (BLOCKIEREND, Produktivcode) — der neue `catch` ist ein REGRESS

`routes/belehrungen.js:2236-2245`.

**Gemessen, beide Richtungen, mit einer Einmalprobe gegen eine Wegwerf-DB:**
Ein Request an `/neue-version/:id` mit KAPUTTER `studioId` — ein Fehler, der
nachweislich VOR jedem Schreibzugriff passiert (die erste `SELECT` wirft) —

| Stand | HTTP | Dateien vorher → nachher |
|---|---|---|
| neu (B8) | 500 | **0 → 1, die Datei bleibt liegen** |
| alt (bedingungsloses `unlink`) | 500 | 0 → 0, aufgeräumt |

Die Ursache: die Nachsehe-Abfrage benutzt DIESELBEN Parameter
(`req.studioId`, `id`), die den ersten Fehler ausgelöst haben. Sie scheitert
deshalb deterministisch mit, `catch (_) { darfWeg = false; }` greift, und die
konservative Voreinstellung wirkt auf eine viel größere Klasse als gemeint.
`test_feature_upload_fehlerbehandlung.js:317` fährt genau diesen Weg —
seit diesem Beitrag lässt also JEDER Suite-Lauf eine Datei liegen.
Dazu derselbe Weg über `parseInt('abc',10)` → `NaN`; `pg` schickt das als
Zeichenkette `"NaN"` (gemessen: `prepareValue(NaN) === "NaN"`).

**Zu bauen:** eine Merkvariable, die NUR sagt, ob `db.tx` überhaupt BETRETEN
wurde.

    let txBetreten = false;
    …
    txBetreten = true;              // unmittelbar VOR await db.tx(
    await db.tx(async (t) => { … });
    …
    } catch (e) {
        if (req.file) {
            let darfWeg = !txBetreten;      // nie begonnen -> es KANN nichts geschrieben sein
            if (txBetreten) {
                try { … Nachsehe-Abfrage wie jetzt … } catch (_) { darfWeg = false; }
            }
            if (darfWeg) fs.unlink(req.file.path, () => {});
        }

**Der Kommentar daneben MUSS den Unterschied zu B8 benennen**, sonst räumt
ihn jemand als „genau die Merkvariable, die wir abgelehnt haben" wieder weg:
B8 lehnt ab „die Transaktion ist DURCH, also darf gelöscht werden" — das ist
nach einem Wurf nicht beweisbar. Erlaubt und nötig ist die Gegenrichtung
„die Transaktion wurde NIE BEGONNEN, also kann nichts geschrieben sein" —
das ist rein clientseitig und braucht keine Quittung.

**Zusicherung + Gegenprobe:** neuer Testfall mit kaputter `studioId` (oder
einer anderen Ursache, die vor `db.tx` wirft): Datei MUSS aufgeräumt sein.
Gegenprobe: `darfWeg = !txBetreten` durch `darfWeg = false` ersetzen → ROT.

---

## N2 (BLOCKIEREND, Test) — B8 hat ÜBERHAUPT keine Zusicherung

**Gemessen:** den ganzen Nachsehe-Block durch das alte
`if (req.file) fs.unlink(req.file.path, () => {});` ersetzt →
**volle Suite `SUITE_EXIT=0`, 347 Dateien, 0 `✗ FAIL`**, die drei neuen
Dateien unverändert 25/0, 11/0, 11/0. Nicht nur die neuen Dateien decken es
nicht ab — der ganze Bestand nicht.

**Zu bauen** in `test_feature_belehrung_neue_version_transaktion.js`:

* **Fall A — COMMIT durch, Wurf danach.** `db.tx` so wrappen, dass es
  `await echteTx(callback)` VOLLSTÄNDIG ausführt (die Transaktion committet
  also wirklich) und erst DANACH wirft. Zusichern: HTTP 500; `dateiname` in
  der DB ist die NEUE Datei B; **Datei B liegt NOCH auf der Platte**;
  Freischaltungszeile existiert; Audit-Eintrag existiert.
  Gegenprobe: catch auf das alte bedingungslose `unlink` zurückdrehen → ROT.
* **Fall B — Nachsehe-Abfrage scheitert.** Transaktion wirft VOR dem COMMIT,
  und die Nachsehe-Abfrage wirft ebenfalls. Zusichern: Datei überlebt.
  Gegenprobe: `catch (_) { darfWeg = false; }` → `darfWeg = true` → ROT.

Beide Fälle sichern SELBST zu, dass ihre Injektion gefeuert hat.

---

## N3 (BLOCKIEREND, Test) — `pg_stat_activity` ohne `datname`-Filter

`test_feature_belehrung_neue_version_wettlauf.js:99-104` und `110-113`.

**Gemessen:** `test/run.sh:328` leitet `TEST_ROLE` aus der LIVE-`DATABASE_URL`
ab (eigener Kommentar: „Prod: gymdocu"). Auf dem Deploy-Gate läuft der Test
also unter derselben Rolle wie die Anwendung — `pg_stat_activity.query` ist
dort NICHT als `<insufficient privilege>` maskiert. Eine echte, blockierte
Produktionsanfrage mit `UPDATE belehrungen SET dateiname…` bzw.
`INSERT INTO unterschriften…` erfüllt dann `neu >= 1` / `unt >= 1`, ohne dass
die beiden Anfragen dieses Tests je blockiert hätten: **grün aus dem falschen
Grund, auf dem Live-Server.**

**Zu bauen:** beide Abfragen um `AND datname = current_database() AND pid <>
pg_backend_pid()` ergänzen. Hausmuster existiert:
`test_feature_qr_zuordnung.js:2471` (nur `datname`),
`test_feature_monatslauf_poolverbindung.js:164` (`datname` UND `usename`).
Gegenprobe: eine zweite Verbindung auf eine ANDERE Datenbank desselben
Clusters mit passendem Anfragetext blockieren lassen → mit Filter wird sie
NICHT mitgezählt, ohne Filter schon.

---

## N4 (BLOCKIEREND, Produktivcode + Test) — eine Zusicherung, die nicht fallen kann

`routes/belehrungen.js:2055` und `:2078` schreiben `freigeschaltet_am` als
rohes `CURRENT_TIMESTAMP`. Der Spalten-DEFAULT ist `TS_DEFAULT`
(`core/db.js:526/1743`), also `to_char(now() AT TIME ZONE 'Europe/Berlin',
'YYYY-MM-DD HH24:MI:SS')`. **Gemessen gegen PostgreSQL:**

    DEFAULT-Form      2026-09-20 05:34:54
    CURRENT_TIMESTAMP 2026-09-20 03:34:54.144842+00

Zwei Formate in EINER TEXT-Spalte. Folge:
`test_feature_belehrung_neue_version_wettlauf.js:231`
(`genNach.freigeschaltet_am !== genVor.freigeschaltet_am`) ist
**strukturell immer wahr** — `genVor` stammt aus einem INSERT mit DEFAULT,
`genNach` aus dem ON-CONFLICT-Zweig. Die Zusicherung kann nicht fallen.

**Zu bauen:** beide ON-CONFLICT-Zweige schreiben dieselbe `to_char`-Form wie
der DEFAULT. **Vorher MESSEN, nicht annehmen**, dass das den
Gleichheitsvergleich bei `:963-964` nicht bricht (`DELETE … AND
freigeschaltet_am = $4`): der Wert wird vorher gelesen und unverändert
zurückgeschrieben, sollte also formatunabhängig treffen — das ist meine
Erwartung, kein Messwert. Bestandszeilen tragen beide Formate; das ist
hinzunehmen, NICHT zu migrieren.
Danach für die Zusicherung bei `:231` eine Gegenprobe bauen, die sie
tatsächlich fallen lässt.

---

## N5 (BLOCKIEREND, Test) — Inventar ohne Zeilenanker, Lock-Position ungeprüft

`test_feature_geistersperre_nachtrag_rennen.js:1017`:
`inventar.push(\`${rel} | ${tr.anweisung}\`)` — **kein Zeilenanker.** Seit
diesem Beitrag stehen zwei BYTE-GLEICHE `routes/belehrungen.js`-Einträge in
der Liste. Sie sind damit austauschbar: wer den Lock im Unterschriftenweg
(`:946`) löscht und den neuen dupliziert, bekommt dieselbe Liste, dieselbe
28 — **GRÜN**, während genau der Lock weg ist, der die beiden Wege
verklemmungssicher macht. Zusätzlich arbeiten `nurIst`/`nurErwartet` mit
`includes`, können also einen Vielfachheitsunterschied nicht anzeigen: bei
einer Abweichung ist die Diagnose LEER.

**Gemessen:** den Advisory-Lock in `/neue-version` HINTER das UPDATE
verschoben → volle Suite grün (der eine FAIL des Laufs kam von einer
unabhängigen zweiten Mutation). Die Position ist also ungeprüft, obwohl die
ganze Verklemmungsfreiheit daran hängt.

**Zu bauen:** (a) `tr.zeile` in den Inventar-Eintrag aufnehmen (steht schon
zur Verfügung, `tagesNehmer` benutzt sie) und die Erwartungsliste entsprechend
nachziehen; (b) Diagnose so, dass ein Vielfachheitsunterschied sichtbar wird;
(c) die vorhandene `ersteAnweisung`-Prüfung (heute nur für den
`seilkontrolle`-Lock, `ERSTE_ANWEISUNG_RE`) auf die BEIDEN
`belehrungen.js`-Studio-Locks ausweiten: jeder muss die ERSTE Anweisung
seiner `db.tx` sein.
Gegenprobe zu (c): Lock hinter das UPDATE verschieben → ROT.

---

## N6 (BLOCKIEREND, Test) — `auditAppend` ohne `t` innerhalb einer `db.tx` hängt

**Gemessen** an `core/integritaet.js`: `return conn ? append(conn) :
db.tx(append);`. Ohne `conn` öffnet `auditAppend` also eine ZWEITE
Poolverbindung und fordert DENSELBEN `pg_advisory_xact_lock(studioId)` an,
den die äußere Transaktion gerade hält. Das ist kein Fehler, sondern ein
Hänger: PostgreSQLs Deadlock-Erkennung sieht den Kreis nicht, weil die äußere
Transaktion auf einen CLIENT wartet, nicht auf eine Sperre. Die Anfrage kehrt
nie zurück, die Poolverbindung bleibt gebunden, Wiederholung erschöpft `max`.

Der Beitrag fügt den ZWEITEN Ort dieser Klasse hinzu (`:2217`); nichts
sichert das sechste Argument zu.

**Zu bauen:** ein statischer Wächter, repoweit: jeder `auditAppend`-Aufruf,
der lexikalisch innerhalb eines `db.tx(async (t) => {`-Rumpfs steht, übergibt
`t` als letztes Argument. Vorbild für die Technik:
`test_feature_geistersperre_nachtrag_rennen.js` (Kommentare vorher abziehen,
Positivkontrolle, dass nach dem Abzug noch etwas übrig ist).
Gegenprobe: an EINER Aufrufstelle das `t` entfernen → ROT; zurück → GRÜN.

---

## N7-N10 (billige Mitnahmen, im SELBEN Auftrag)

**N7 — Kommentare.** Alle fünf sind nachgemessen falsch:
1. `:936-938` behauptet, ALLE Schreibzugriffe auf `belehrung_freischaltung`
   liefen unter Autocommit und nähmen den Lock NICHT. Seit diesem Beitrag
   falsch — und es ist die Prämisse, auf der jemand später eine neue
   Transaktion entwirft. Durch die tatsächliche Matrix ersetzen: vier
   SQL-Stellen, fünf Aufrufpfade (`mitarbeiter.js:883` Autocommit;
   `belehrungen.js:963` in Transaktion MIT Lock; `:2053` Autocommit;
   `schalteAlleFrei` vom `/freischalten-alle`-Weg Autocommit; dieselbe
   Funktion aus `/neue-version` in Transaktion MIT Lock).
2. `:936-938` nennt `:1964/:1979` — tatsächlich `:2053` und `:2075`.
3. `:2203` sagt „derselbe Griff wie 1.200 Zeilen weiter UNTEN … (:946)" —
   `:946` liegt 1.266 Zeilen DARÜBER, und die Datei hat nur 2.567 Zeilen.
4. `:2071` nennt `:2082` für den zweiten Aufrufer — der steht auf `:2089`.
5. Die Begründung „laufen als blanke `db.run` unter Autocommit … können an
   einem Kreis nicht teilnehmen" ist zu allgemein: eine EINZELNE mehrzeilige
   Anweisung sperrt sehr wohl mehrere Zeilen und kann Teil eines Deadlocks
   sein. Ersetzen durch die tatsächlich geprüften Objektmengen.
6. „Müll, aufräumbar" bei `:2229`: **gemessen**, `core/retention.js` kennt
   vier Löschwurzeln (`PDF_ROOT`, `DOKUMENTE_DIR`, `EINWEISUNG_NACHWEIS_DIR`,
   `PRUEFBERICHT_DIR`) — `BELEHRUNGEN_UPLOAD_DIR` ist KEINE davon. Also
   „heute nur von Hand aufräumbar" schreiben, mit dieser Fundstelle.

**N8 — `test/helfer/multipart-post.js` benutzen** statt fünf handgerollter
`new FormData()`-Blöcke (`…transaktion.js:181/225/271/304`,
`…wettlauf.js:194`). Der Helfer wurde am 18.09.2026 genau dafür
herausgelöst und nennt `routes/belehrungen.js` in seinem eigenen Kopf als
vorgesehenen Aufrufer. Gleiche PASS-Zahlen vorher/nachher MESSEN — sie
beweisen für sich nichts, aber eine Abweichung wäre ein Befund.

**N9 — Aufräumen im Wettlauftest.** Er legt Dateien in `UPLOAD_DIR` und
`DOKUMENTE_DIR` an und räumt nichts weg; beide Geschwisterdateien desselben
Commits haben ein `aufgeräumteDateien`. Unter `test/run.sh` fällt es nicht
auf (mktemp-Wurzeln werden entfernt) — bei einem Einzelaufruf sammelt sich
im echten `Dokumente/`-Baum je Lauf eine signierte PDF mit Personendaten an.

**N10 — die vom Papier verlangte Messung nachholen:** Laufzeit des
studioweiten Advisory-Locks bei realistischer Mitarbeiterzahl (das
`INSERT … SELECT` von `schalteAlleFrei` läuft jetzt innerhalb der
Transaktion). **Einmalige Messung mit Zahl im Bericht, KEINE Zeitschwelle
als Zusicherung.** Mindestens zwei Größen messen (z. B. 50 und 500 aktive
Mitarbeiter), damit eine Abhängigkeit überhaupt sichtbar werden kann.

---

## Was AUSDRÜCKLICH NICHT gebaut wird

* Die Transaktion um `UPDATE` + `COUNT` in `/loeschen/:id` (Vorschlag beider
  Prüfspuren). Bei dieser Klasse war dreimal in Folge die BEHEBUNG die
  Gefahr; eine neue Transaktion auf `belehrungen`-Zeilen braucht dieselbe
  Lock-Ordnungsanalyse wie S2 und gehört in einen eigenen Beitrag.
* Ein `lock_timeout` auf der neuen Transaktion.
* Die gestaffelte Wettlauf-Gegenprobe in der Suite.
* Alles unter „offene Befunde" in `plaene/durchgang-befunde.md`.
