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

    let txCallbackBetreten = false;
    …
    await db.tx(async (t) => {
        txCallbackBetreten = true;   // ERSTE Anweisung IM Callback, nicht davor
        … });
    …
    } catch (e) {
        if (req.file) {
            let darfWeg = !txCallbackBetreten;   // Callback nie betreten -> nichts geschrieben
            if (txCallbackBetreten) {
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

**BERICHTIGT nach der Planprüfung (P-3), und die Berichtigung ist der Punkt:**
Meine erste Fassung setzte die Variable UNMITTELBAR VOR `await db.tx(...)`.
Das ist falsch. `db.tx` kann bei `pool.connect()` oder bei `BEGIN` werfen,
BEVOR der Callback je läuft — die Variable stünde dann auf `true`, obwohl
nichts betreten wurde, und bei einer Poolstörung scheitert auch die
Nachsehe-Abfrage: die Datei bliebe wieder liegen. **Gemessen:**
`core/db.js:457-458` führt `await client.query("BEGIN")` VOR
`await callback(bound)` aus. Als erste Anweisung IM Callback ist `BEGIN`
also nachweislich durch.

**Zusicherung + Gegenproben — DREI Fälle:**
1. Fehler VOR `db.tx` (kaputte `studioId`): Datei MUSS aufgeräumt sein.
   Gegenprobe: `darfWeg = !txCallbackBetreten` → `darfWeg = false` → ROT.
2. `db.tx` wirft VOR dem Callback (Wrapper, der vor dem Aufruf wirft) UND
   die Nachsehe-Abfrage scheitert: Datei MUSS aufgeräumt sein. Selbst
   zusichern, dass der Callback nie lief und kein UPDATE passierte.
   Gegenprobe: die Zuweisung VOR `await db.tx` ziehen → ROT.
3. Callback betreten, Wurf darin: Verhalten wie bisher (Nachsehen).

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

**Die Grenze gehört in den Kopfkommentar der Datei, nicht verschwiegen**
(Planprüfung P-2): `datname` schliesst Fremdtreffer aus ANDEREN Datenbanken
aus, nicht aus DERSELBEN. Zwei Sitzungen in `gymdocu_test` mit passendem
Anfragetext könnten die Zähler weiterhin erfüllen. Das ist hinnehmbar, weil
`test/run.sh:330` diese Datenbank je Lauf frisch anlegt und die Suite
sequenziell läuft — aber es ist eine ANNAHME über den Aufrufer, und die
gehört benannt.

**Was ausdrücklich NICHT gebaut wird:** beide Prüfspuren schlagen vor, die
Katalogabfragen ganz zu entfernen und durch testlokale Promise-Barrieren zu
ersetzen. Das wird ABGELEHNT: eine Barriere belegt, dass der eigene Wrapper
gefeuert hat — sie kann nicht belegen, dass ZWEI Backends gleichzeitig auf
Datenbankebene blockiert waren. `pg_stat_activity` ist hier die Referenz von
AUSSEN, und die Hausregel sagt, dass der Regress genau dort endet. Eine
Barriere DANEBEN wäre eine Verbesserung; sie ist kein Ersatz.

---

## N4 — **GESTRICHEN nach der Planprüfung.** Stattdessen: nur der TEST

**Was ich beauftragt hatte:** beide `ON CONFLICT`-Zweige sollten
`freigeschaltet_am` im `to_char`-Format des Spalten-DEFAULT schreiben, damit
die Z2c-Zusicherung „es ist die NEUE Generation" überhaupt fallen kann.

**Warum das NICHT gebaut wird — gemessen, und es ist der teuerste Befund
dieses Papiers.** Die Spalte ist NICHT nur eine Anzeigezeit, sie ist zugleich
das GENERATIONSTOKEN: `routes/belehrungen.js:963` löscht die verbrauchte
Freischaltung mit `AND freigeschaltet_am = $4` gegen den früh gelesenen Wert
— das ist der Schutz (M4/M13) dagegen, dass eine zwischenzeitlich NEU
angeforderte Pflicht mitgelöscht wird.

Die `to_char`-Form hat **Sekundenauflösung** (gemessen: `now()` und
`clock_timestamp()` liefern beide `2026-09-20 05:46:37`). Nach der
Vereinheitlichung trügen zwei Erneuerungen innerhalb derselben Sekunde
denselben Wert — der Vergleich träfe die NEUE Pflicht und löschte sie.
Heute ist das mikrosekunden-unwahrscheinlich, weil die beiden Formen
verschieden sind; meine Vereinheitlichung hätte daraus ein Rennen im
Sekundentakt gemacht. **Ich hätte mit der Behebung genau das Rennen wieder
geöffnet, das der Vergleich schliesst.**

**Was STATTDESSEN gebaut wird (nur Test, keine Produktivänderung):** die
Zusicherung bei `test_feature_belehrung_neue_version_wettlauf.js:231`
unterscheidet auf einem Feld, das TATSÄCHLICH unterscheidet — `grund`. Der
`ON CONFLICT`-Zweig setzt `grund = excluded.grund`, der Vorzustand des Tests
schreibt `'Vor dem Rennen'`, die Route schreibt `'Neue Version vom …'`.
Zusichern: `genNach.grund` ist der neue Text, NICHT `'Vor dem Rennen'`.
Die Zeitzusicherung entfällt ersatzlos — sie behauptet mehr, als sie hält.

**Gegenprobe:** `grund = excluded.grund` im `ON CONFLICT`-Zweig
(`routes/belehrungen.js:2078`) auf `grund = belehrung_freischaltung.grund`
ändern (alter Wert bleibt stehen) → die neue Zusicherung MUSS ROT werden.
Danach zurücknehmen und GRÜN messen.

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

**BERICHTIGT nach der Planprüfung (P-5): Teil (a) ist GESTRICHEN.** Ich
hatte die Zeilennummer in die ERWARTUNGSLISTE aufnehmen wollen. Das tauscht
eine blinde Zusicherung gegen eine, die bei jeder eingefügten Kommentarzeile
rot wird, ohne dass sich an einer Sperre etwas geändert hat — und eine
Zusicherung, die ständig ohne Grund anschlägt, wird weggeklickt.

**Zu bauen:** (b) die Diagnose so, dass ein VIELFACHHEITS-Unterschied
sichtbar wird (`nurIst`/`nurErwartet` über `includes` können ihn heute nicht
zeigen — bei einer Abweichung ist die Diagnose LEER); (c) die vorhandene
`ersteAnweisung`-Prüfung (heute nur für den `seilkontrolle`-Lock,
`ERSTE_ANWEISUNG_RE`) auf die BEIDEN `belehrungen.js`-Studio-Locks
ausweiten: jeder muss die ERSTE Anweisung seiner `db.tx` sein, und es muss
GENAU ZWEI solcher `db.tx`-Blöcke mit Studio-Lock in dieser Datei geben.

**(c) trägt dabei auch die Lokalisierung, die (a) leisten sollte:** wer den
Lock bei `:946` löscht und den bei `:2212` dupliziert, hat danach einen
`db.tx`-Block OHNE Lock als erste Anweisung → ROT. Kein Zeilenanker nötig.
Gegenprobe zu (c): Lock hinter das UPDATE verschieben → ROT.

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

**BERICHTIGT nach der Planprüfung (P-4) — der Wächter wird ENGER gebaut,
als ich ihn beauftragt hatte, und sagt das selbst.** Zwei Messungen:
* Ein Wächter auf das LITERAL `t` hätte schon heute einen Fehlalarm:
  **53 Callbacks heissen `t`, EINER heisst `tx`** (gemessen über den ganzen
  Produktivbaum). Gebunden wird deshalb an den TATSÄCHLICHEN Parameternamen
  des nächstgelegenen `db.tx`-Callbacks, nicht an einen festen Bezeichner.
* Ein LEXIKALISCHER Wächter kann die Klasse nicht schliessen: wird der
  `auditAppend`-Aufruf in eine ausserhalb definierte Hilfsfunktion
  verschoben, ist lexikalisch nichts mehr im Callback — zur Laufzeit hängt
  es trotzdem. **Der Wächter darf deshalb nicht „repoweit jeder Fall"
  behaupten.**

**Zu bauen:** ein statischer Wächter über `routes/belehrungen.js`, der für
die beiden `db.tx`-Blöcke dieser Datei zusichert, dass JEDER darin
lexikalisch enthaltene `auditAppend`-Aufruf den Callback-Parameter dieses
Blocks als letztes Argument übergibt. **Die Beschriftung nennt die Grenze
ausdrücklich:** direkte Aufrufe im Rumpf, keine über Hilfsfunktionen
ausgelagerten. Kommentare vorher abziehen, Positivkontrolle, dass danach
noch etwas übrig ist.
Gegenprobe: an EINER Aufrufstelle das `t` entfernen → ROT; zurück → GRÜN.
Dazu eine Fixtur mit einem Callback-Parameter `conn` → darf NICHT anschlagen.

Die repoweite Fassung (AST, Aliasauflösung, Inventar der aus Transaktionen
gerufenen Audit-Helfer) ist ein eigener Beitrag — s. offene Befunde.

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
* **Die Vereinheitlichung von `freigeschaltet_am`** (war N4) — Begründung
  oben; die Wurzel ist, dass die Spalte zugleich Anzeigezeit und
  Generationstoken ist. Die saubere Lösung ist eine EIGENE Generation
  (BIGINT hochzählen oder UUID) und ein `clock_timestamp()` für die
  Anzeigezeit. Eigener Beitrag, s. U-GEN1.
* **Der Rückwärtssprung von `freigeschaltet_am`** (Planprüfung P-6):
  `CURRENT_TIMESTAMP` ist auf den TRANSAKTIONSBEGINN eingefroren, und unsere
  Transaktion beginnt jetzt VOR der Lock-Wartezeit. Ein später ausgeführter
  Autocommit-Weg kann damit einen NEUEREN Wert schreiben, den unser
  `ON CONFLICT` anschliessend mit dem ÄLTEREN überschreibt. Neu durch diesen
  Beitrag. s. U-TS1.
* **Die repoweite Fassung des `auditAppend`-Wächters** (AST, Aliase,
  ausgelagerte Helfer), s. U-AUDT1.
