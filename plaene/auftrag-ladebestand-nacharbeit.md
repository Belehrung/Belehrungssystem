# Auftragspapier — Nacharbeit am Ladebestand-Beitrag (Zweig `beitrag-ladebestand`)

**Stand 20.09.2026.** Grundlage sind zwei Prüfspuren über den Diff `e58eb2d`
(eine LESENDE, eine AUSFÜHRENDE) sowie eigene Messungen. **Jeder Befund unten
ist vom Haupt-Agenten SELBST nachgemessen**; einer fiel dabei und steht am
Ende.

Der Beitrag selbst ist CI-grün. Diese Nacharbeit behebt, was die Prüfung
DANACH gefunden hat.

---

## N1 — BLOCKIEREND: die Fehlerseite behauptet auf dem Brandschutz-Weg etwas Falsches

**Gemessen, am committeten Stand `e58eb2d`:**

    routes/admin/geraete.js:2606   UPDATE wartung_geraete SET aktiv = 0
    routes/admin/geraete.js:2635   UPDATE wartung_geraete SET aktiv=0 …
    routes/admin/geraete.js:2704   INSERT INTO wartung_geraete_aufgaben …
    routes/admin/geraete.js:2727   bestandJetzt = await ladeBestandStreng(…)   ← ERST HIER
    routes/admin/geraete.js:2730   return res.send(… ladeBestandFehlerinhalt('/admin/geraetewartung/brandschutz'))

Der Text dieser Seite (`routes/admin/geraete.js:1928-1930`) lautet:

> Eure Antworten sind gespeichert. Der anschließende Prüfplan-Abgleich konnte
> wegen eines Datenbankfehlers NICHT laufen — **es wurde nichts angelegt,
> geändert oder deaktiviert.**

**Auf dem Brandschutz-Weg ist der fett gesetzte Teil falsch:** Geräte sind
bereits deaktiviert und Aufgabenzeilen bereits angelegt, wenn das strenge
Lesen scheitert.

**Der Ausstattungs-Weg ist in Ordnung — das ist eine eigene Messung, die
keine Prüfspur hatte:**

    routes/admin/geraete.js:4233   bestandRoh = await ladeBestandStreng(…)   ← VOR allem Schreiben
    routes/admin/geraete.js:4268   UPDATE wartung_geraete SET aktiv=1 …
    routes/admin/geraete.js:4280   syncAufgaben(…)

Dort trifft der Satz zu.

**Behebung — der kleine, ehrliche Weg, und NICHT der grosse:**
`ladeBestandFehlerinhalt(zurueckUrl)` bekommt einen zweiten Parameter für
den Umfang und liefert zwei Texte:

* **Ausstattung (nichts geschrieben):** Text bleibt wörtlich wie heute.
* **Brandschutz (teilweise geschrieben):** der absolute Satz entfällt. Statt
  dessen wörtlich: *„Ein Teil des Prüfplans wurde bereits angepasst, der Rest
  nicht. Bitte den Assistenten unten noch einmal öffnen und dort speichern
  (auch ohne Änderung), sobald die Datenbank wieder erreichbar ist."*
  **Der Halbsatz „der Abgleich holt dann nach, was fehlt" ist GESTRICHEN.**
  Er wäre eine Idempotenz-Zusage über den Produktivcode, und nichts misst
  sie — das ist genau die Klasse, die dieser Beitrag bekämpft: nicht
  fehlende Abdeckung, sondern eine falsche Zusicherung von Abdeckung. Wer
  sie behalten will, misst sie zuerst (Aufbau in N1a).
* **Der erste Satz („Eure Antworten sind gespeichert.") bleibt auf BEIDEN
  Wegen — und das ist jetzt für beide belegt, nicht nur für einen:**
  Brandschutz speichert bei `:2555-2574` vor der Schleife, Ausstattung bei
  **`:4205-4211`** (`INSERT INTO pruefbereich_bestand … ON CONFLICT … DO
  UPDATE`) vor dem strengen Lesen bei `:4233`. Eine Prüfspur hatte hier
  vermutet, auf dem Ausstattungsweg sei der Satz womöglich falsch;
  nachgemessen trägt er.
* **ABER der absolute Satz ist auch auf dem Ausstattungsweg wörtlich zu
  weit** — dieselbe Prüfspur hat es im Nebensatz richtig gesehen: es wurde
  sehr wohl etwas „angelegt oder geändert", nämlich die Antwortzeile selbst.
  Gemeint war immer der Prüfplan. **Deshalb heisst der Satz dort ab jetzt:
  „Am Prüfplan wurde nichts angelegt, geändert oder deaktiviert."** Ein Wort,
  und die Aussage stimmt wörtlich.

**AUSDRÜCKLICH NICHT in diesem Beitrag:** alle Schreibvorgänge hinter das
strenge Lesen zu ziehen. Das wäre die saubere Lösung, ist aber ein
Verhaltensumbau in einem sehr langen Handler und berührt die Lock-Ordnung.
Er bekommt ein eigenes Papier und eine eigene Planprüfung. **Was hier gebaut
wird, macht die Aussage wahr — es macht den Ablauf nicht besser, und der
Kommentar an der Stelle sagt das ausdrücklich.**

**Gegenprobe:** den Brandschutz-Text durch den Ausstattungs-Text ersetzen →
die neue Zusicherung (N5) muss ROT werden. Und umgekehrt.

---

## N2 — BLOCKIEREND: Z2 bemerkt einen toten `reihenfolge`-Schreiber nicht

**Gemessen** (ausführende Prüfspur, vom Haupt-Agenten mit einem eigenen
vollen Suite-Lauf wiederholt): setzt man in `syncAufgaben()` den
INSERT-Zweig `routes/admin/geraete.js:2121` von `idx` auf `0` — und ebenso
die beiden UPDATE-Zweige `:2118` und `:2137` —, so tragen ALLE Aufgabenzeilen
`reihenfolge = 0`. In der Datenbank nachgemessen:
`verschiedene_reihenfolgen = 1, min_r = 0, max_r = 0`. Trotzdem:
**`SUITE_EXIT=0`, `12 PASS / 0 FAIL`.**

**Warum:** In der Z2-Fixtur ist der `reihenfolge`-Rang gleich dem `id`-Rang
(ein POST in ein frisches Studio, also nur der INSERT-Zweig, Einfügung in
Array-Reihenfolge). `ORDER BY reihenfolge, id` fällt damit auf
`ORDER BY id` zurück — und liefert dasselbe Ergebnis. Der `id`-Beistand
repariert genau den Defekt, den der Schlüssel bewachen soll.

**Die Folge im Betrieb ist grösser als im Test** — gemessen, die drei
Lesestellen der Tabelle:

    routes/admin/geraete.js:2104   ORDER BY reihenfolge, id    (nur syncAufgaben selbst)
    routes/admin/geraete.js:6141   ORDER BY reihenfolge        (Bearbeitungsformular)
    routes/wartung.js:592          ORDER BY reihenfolge        (Trainer-Checkliste)

Die beiden benutzersichtbaren Stellen haben **keinen Beistand**. Bei
konstanter `reihenfolge` liefern sie beliebige Reihenfolge — und das
Bearbeitungsformular schreibt diese beliebige Reihenfolge beim Speichern
über `syncAufgaben` wieder fest.

**Behebung, zwei Teile:**

1. **Z2 sichert die `reihenfolge` selbst zu**, nicht nur ihre Wirkung auf die
   Sortierung: `reihenfolge` mitselektieren und je Gerät zusichern, dass die
   Werte genau `0 … n-1` sind (lückenlos, ohne Dublette). Das ist eine
   Zusicherung über die MENGE, nicht über eine Zahl.
   **Dass `0 … n-1` der richtige Sollwert ist, ist gemessen, nicht geraten:**
   `syncAufgaben()` setzt `let idx = 0`, zählt je Soll-Eintrag hoch und führt
   die Zählung für behaltene Fremdzeilen fort (`[idx++, studioId, z.id]`);
   deaktivierte Zeilen behalten ihre alte `reihenfolge`, werden aber von der
   Z2-Abfrage über `aktiv=1` ohnehin nicht gelesen. Die aktiven Zeilen sind
   damit lückenlos ab null.
   **Eine Prüfspur wollte den Sollwert auf „paarweise verschieden" absenken**
   — die Produktion brauche nur Eindeutigkeit, und eine Deaktivierung ohne
   Neuvergabe erzeuge legitime Lücken. **Der zweite Teil ist nachgemessen
   FALSCH:** es gibt im ganzen Bestand genau EINEN Weg, der eine
   Aufgabenzeile deaktiviert (`routes/admin/geraete.js:2141`), und der liegt
   INNERHALB von `syncAufgaben()` — dieselbe Funktion nummeriert die
   verbleibenden aktiven Zeilen im selben Lauf neu. Lücken können so nicht
   entstehen. `0 … n-1` bleibt deshalb und ist schärfer: es fängt auch einen
   Schreiber, der eindeutige, aber willkürliche Zahlen vergibt und damit die
   Reihenfolge des Moduls verliert.
   **Was dabei bewusst in Kauf genommen wird und in den Kommentar gehört:**
   eine künftige, für sich genommen richtige Umstellung der Zählweise (etwa
   Zehnerschritte, um später einfügen zu können) macht die Zusicherung rot.
   Das ist gewollt — sie erzwingt dann eine bewusste Entscheidung statt einer
   stillen Änderung.
   **Die Zusicherung läuft VOR der Hash-Bildung.** Sonst ist bei einem
   Defekt nicht der Grund zu sehen, sondern nur ein abweichender Hash — und
   bei nicht eindeutiger `reihenfolge` wäre die Zeilenreihenfolge ohne
   `id`-Beistand nicht einmal stabil, der Hash also flatternd statt
   verlässlich rot.
2. **Der Test ruft in der PRODUKTIONSFORM ab.** Weil die beiden
   benutzersichtbaren Leser `ORDER BY reihenfolge` OHNE Beistand benutzen,
   liest Z2 ebenfalls OHNE `id` — dann ist der Test nicht länger strenger als
   die Produktion. Die Eindeutigkeit stellt Teil 1 sicher; ohne ihn wäre das
   Ergebnis nicht deterministisch, mit ihm ist es das.

**Gegenprobe (Abnahmekriterium):** `:2121` von `idx` auf `0` → Z2 muss ROT
werden. Positivkontrolle: unverändert → GRÜN.

**BERICHTIGUNG an diesem Papier, gefunden von der Planprüfung und selbst
nachgelesen:** hier stand zuerst „ebenso `:2118` und `:2137`". Das ist mit
der heutigen Fixtur **nicht erfüllbar** und widerspricht einem Satz, den
dieses Papier zwei Absätze weiter oben selbst schreibt: Z2 fährt EINEN POST
in ein FRISCHES Studio, also ausschliesslich den INSERT-Zweig. Die beiden
UPDATE-Zweige setzen bestehende Zeilen voraus und werden nie betreten — eine
Mutation dort kann Z2 gar nicht rot machen. Ein Abnahmekriterium, das die
eigene Fixtur nicht erreichen kann, ist keines.

**Folge, und sie gehört gebaut:** die Z2-Fixtur bekommt einen ZWEITEN POST
auf dasselbe Studio (eine Frage auf `nicht_vorhanden` und wieder zurück),
damit die UPDATE-Zweige wirklich laufen. **Erst dann** sind `:2118` und
`:2137` Abnahmekriterien — und erst dann bewacht die Zusicherung den
Schreiber, den jedes eingerichtete Studio bei jedem weiteren POST nimmt.

**NICHT in diesem Beitrag:** den beiden produktiven Lesestellen einen
Beistand zu geben. Das ändert Verhalten (heute beliebige, morgen feste
Reihenfolge bei Gleichstand) und gehört gemessen, nicht nebenbei gemacht.
Als offener Punkt notieren.

---

## N3 — der neue Kommentar nennt die Lesestellen falsch

**Gemessen:** der Kommentar bei `volleZeilenmenge()` schreibt, sortiert werde
nach „demselben Schlüssel, den die Produktion liest
(`routes/admin/geraete.js:2104`, `routes/wartung.js:592`)". Die erste Angabe
stimmt, **die zweite nicht** (`ORDER BY reihenfolge`, ohne `id`), und die
dritte Lesestelle (`routes/admin/geraete.js:6141`) fehlt ganz.

Das ist eine Tatsachenbehauptung in Prosa, und sie ist zur Hälfte falsch.
**Berichtigen, alle drei Stellen nennen und den Unterschied benennen** — er
ist nach N2 der Grund für die Änderung des Schlüssels.

---

## N4 — derselbe Vergleicher steht doppelt

`test_feature_ladebestand_streng.js:83` und `:115` tragen wörtlich dieselbe
Zeile `rows.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));`.
Wer eine nachschärft, hat die andere nicht. **In einen benannten Helfer
ziehen** (z. B. `nachZeichenwerten`), mit einem Satz Kommentar, warum nicht
`localeCompare`.

---

## N5 — die Aussagen der Fehlerseite sind nicht zugesichert

**Gemessen:** `Eure Antworten sind gespeichert` kommt im Test **0×** vor.
Geprüft wird nur der Teilmarker `Prüfplan-Abgleich konnte wegen`. Der Satz
liesse sich in sein Gegenteil verkehren, ohne dass etwas fällt.

**Behebung:** beide tragenden Sätze je Weg wörtlich zusichern — und nach N1
sind es zwei verschiedene Texte, also zwei verschiedene Zusicherungen. Dazu
die Gegenprobe aus N1.

---

## N6 — zwei Zusicherungen sind für die leere Menge wahr

**Gemessen:** `test_feature_ladebestand_streng.js:462` und `:475` prüfen
`ftNachFehler.every((r) => r.aktiv === 1)` bzw. `ftNachEcht.every(… === 0)`
**ohne Längenprüfung**. `[].every(...)` ist `true` — verschwindet das
Funktionstest-Sammelblatt ganz, bestehen beide.

**Behebung:** die erwartete Anzahl **von Hand hergeleitet** danebenstellen
(nicht aus dem Lauf abschreiben) und zusichern. Die Zahl wird VOR dem Bau
gemessen und im Kommentar begründet.

**Gegenprobe:** die Zeilen vor der Abfrage löschen → beide Zusicherungen
müssen ROT werden.

---

## Was GEFALLEN ist und nicht gebaut wird

**Die lesende Spur stufte als *blockierend* ein, das Muster
`/vor\s+\S*\s*Gericht/i` erkenne „vor Gericht" nicht** — mit eigenem
Nachmess-Schnipsel, der `false` behauptet. **Nachgemessen: `true`.** `\S*`
darf leer sein. (Der Befund gehört ohnehin zum Startseiten-Beitrag, nicht
hierher; er steht hier nur, weil er zeigt, dass auch ein gut begründeter,
hoch eingestufter Befund fallen kann.)

**Beobachtung ohne Befundcharakter** (ausführende Spur, selbst geprüft):
`AND aktiv=1` in der Aufgabenabfrage ist unbewacht — folgenlos, weil das
Z2-Studio keine inaktiven Aufgabenzeilen hat und der produktive
Deaktivierungsweg an anderer Stelle bewacht ist (dort wurde eine Mutation
korrekt rot). Wird notiert, nicht gebaut.

---

## Harte Tore

1. `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"` — ohne Pipe, ohne
   äusseres `flock`, `echo` in eigener Zeile; danach das Dateizahl-Ritual mit
   demselben Sieb auf beiden Seiten, `diff` EXIT 0 (heute 350).
2. **Keine parallelen Skripte gegen dieselbe Datenbank, solange die Suite
   läuft.**
3. Jede Mutation: Zielpfad als ARGUMENT, Fundstellen zählen, Abbruch bei 0
   UND bei >1, Marker `GEGENPROBE-` + `DEFEKT`, `node --check` davor,
   Rücknahme gegen eine unabhängige `cp`-Kopie mit `diff` EXIT 0, nie mit
   einem Testlauf verkettet.
4. Am Ende Marker-Scan mit Ausschluss auf dem PFAD: **6 Treffer**, alle in
   `docs/offene-befunde-31-08-2026.md`.
5. Kein Modellname in Commit-Botschaft oder Dateien. Kein PR.


---

## N7 — der Kopfkommentar des Tests behauptet nach N1 Falsches

**Gemessen:** `test_feature_ladebestand_streng.js:19` schreibt

    //   Z1 — Ein DB-Fehler deaktiviert NICHTS (beide strengen Wege)

Nach der Messung aus N1 deaktiviert der Brandschutzweg im Fehlerfall sehr
wohl (`:2606`, `:2635`) und legt Aufgabenzeilen an (`:2704`). Der Satz ist
für einen der beiden Wege falsch — und er steht an der Stelle, die ein
Prüfender zuerst liest.

**Nicht betroffen sind die beiden `ok()`-Texte** (`:322`, `:464`): sie sagen
„aktive Termine UNVERÄNDERT" bzw. „Begehungs-Checkliste UND
Funktionstest-Sammelblatt UNVERÄNDERT", und das trifft weiterhin zu — sie
behaupten nichts über die Fachfirmen-Termine. Das ist eine eigene Messung;
die Prüfspur hatte beide zusammen als falsch gemeldet.

**Behebung:** den Kopfkommentar wegspezifisch machen — Ausstattung: nichts
geschrieben; Brandschutz: Abbruch nach Teilschreiben, Checkliste und
Sammelblatt unverändert, Fachfirmen-Termine teilweise deaktiviert.

---

## N1a — die Idempotenz-Zusage, falls sie zurück in den Text soll

Der Halbsatz „der Abgleich holt dann nach, was fehlt" ist in N1 **gestrichen**,
weil ihn nichts misst. Wer ihn zurückhaben will, misst ihn so — der Aufbau
stammt aus der Planprüfung und ist brauchbar:

* **Studio A:** POST (alles vorhanden) → POST mit gestörtem Bestandslesen →
  POST ungestört.
* **Studio B:** zweimal ungestört, ohne Störung dazwischen.
* Danach die VOLLE Kategoriemenge beider Studios vergleichen (Geräte
  einschliesslich `aktiv`, alle Aufgabenzeilen).

Weichen A und B ab, holt der Abgleich eben NICHT nach — dann wäre der Satz
eine zweite Lüge an derselben Stelle. **Erst wenn A und B gleich sind, darf
der Halbsatz in den Text, und dann mit genau dieser Zusicherung daneben.**

---

## Was aus der Planprüfung GEFALLEN ist

**„Auf dem Ausstattungsweg sind die Antworten im Fehlerfall womöglich gar
nicht gespeichert."** Nachgemessen: `routes/admin/geraete.js:4205-4211`
schreibt `INSERT INTO pruefbereich_bestand … ON CONFLICT … DO UPDATE`
**vor** dem strengen Lesen bei `:4233`. Der Satz „Eure Antworten sind
gespeichert." trägt auf beiden Wegen.
**Was aus demselben Befund TRÄGT**, ist sein Nebensatz: dann ist „es wurde
nichts angelegt, geändert oder deaktiviert" wörtlich zu weit, weil die
Antwortzeile sehr wohl geschrieben wurde. Daraus ist die Wortänderung „Am
Prüfplan wurde nichts …" in N1 geworden.

**„Eine Deaktivierung ohne Neuvergabe erzeugt legitime Lücken in der
`reihenfolge`."** Nachgemessen: es gibt genau einen Deaktivierungsweg
(`routes/admin/geraete.js:2141`), und er liegt in `syncAufgaben()`, das im
selben Lauf neu nummeriert. Siehe N2.

---

# ZWEITE RUNDE — aus der Diffprüfung von `95c52ed`

Elf Befunde, vier als blockierend eingestuft. **Vier davon habe ich selbst
nachgemessen und sie tragen; sie werden gebaut. Die übrigen sind entweder
schon entschieden oder ohne Bauauftrag** (unten benannt).

## N8 — BLOCKIEREND: der neue Text kann in der Gegenrichtung falsch sein

Der Parameter sagt nicht, ob geschrieben WURDE, sondern nur, WELCHE Route
ruft. **Gemessen am Quelltext:** `routes/admin/geraete.js:2621` lautet

    if (antwort === 'unbekannt') continue;

und der Kommentar darüber sagt es selbst: *„Die Feststellung ist oben
gespeichert, **mehr passiert nicht**."* Werden also alle Brandschutz-Fragen
mit „Weiß ich nicht" beantwortet und scheitert danach das strenge Lesen,
behauptet die Seite „Ein Teil des Prüfplans wurde bereits angepasst" —
**und es wurde nichts angepasst.**

Damit hätte ich einen Satz, der auf einem WEG falsch war, gegen einen Satz
getauscht, der in einem FALL falsch ist. Dieselbe Klasse.

**Behebung: messen statt annehmen.** Die Brandschutz-Schleife zählt, was sie
wirklich am Prüfplan geändert hat (Deaktivierungen, Neuanlagen,
Reaktivierungen, Aufgabenzeilen), und übergibt diese Zahl. Null Änderungen →
derselbe Text wie auf dem Ausstattungsweg. Damit verschwindet auch die
Stellungs-Boolean-Falle: ein vergessener dritter Aufrufer bekommt keinen
stillschweigend falschen Text, sondern muss eine Zahl liefern.

**Abnahme:** ein Brandschutz-POST mit ausschliesslich `unbekannt` und
gestörtem Bestandslesen → die Seite trägt den „nichts geändert"-Text. Ein
POST mit echten Änderungen → den Teiländerungs-Text. Beide wörtlich.

## N9 — BLOCKIEREND: der zweite Prüfzeitpunkt beweist nicht, dass der UPDATE-Zweig SCHREIBT

Er beweist, dass eine VERFÄLSCHENDE Mutation auffällt. Ein **No-op** fällt
nicht auf: der Vorzustand trägt schon die richtige Reihenfolge aus dem
INSERT-Zweig, und der zweite POST ändert die Aufgabenlisten nicht.

    SET reihenfolge=reihenfolge + 0 * $1, aktiv=1     -- statt SET reihenfolge=$1

bliebe grün. Das ist unsere eigene dritte Erscheinungsform: **der Vorzustand
erzwingt das erwartete Ergebnis ohnehin.**

**Behebung:** nach dem ersten POST die gespeicherten `reihenfolge`-Werte
absichtlich verfälschen (etwa +100), DANN den UPDATE-Weg fahren. Nur ein
echter Schreibvorgang stellt `0 … n-1` wieder her.

**Abnahme:** mit der No-op-Mutation oben muss die Zusicherung ROT werden;
unverändert GRÜN.

## N10 — BLOCKIEREND: der erste Prüfzeitpunkt ist für leere Mengen vakuos

**Gemessen:**

    [].sort()  deepStrictEqual  [].map(...)   ->  besteht

Ein Gerät ohne aktive Aufgabenzeilen erfüllt die Zusicherung also immer. Und
die drei POSTs reparieren einen solchen Defekt anschliessend wieder, weil der
UPDATE-Zweig `aktiv=1` zurücksetzt — **eine zweite Maskierung durch dieselbe
Fixtur-Erweiterung.**

**Behebung:** am ersten Prüfzeitpunkt eine von Hand hergeleitete
Aufgabenanzahl je Gerät zusichern, mindestens aber `reihenfolgen.length > 0`.
Die Zahl wird VOR dem Bau gemessen und im Kommentar begründet.

**Abnahme:** die Aufgabenzeilen nach dem ersten POST deaktivieren → ROT.

## N11 — der Kommentar nennt zu wenig, und eine Zusicherungszahl stimmt nicht

Zwei Prosa-Berichtigungen, beide selbst nachgemessen:

* **Es gibt einen VIERTEN produktiven Leser**, den N3 nicht nennt:
  `core/pdf-engine.js` liest `ORDER BY a.reihenfolge, a.id` — MIT Beistand,
  und sein eigener Kommentar begründet das: *„alte reihenfolge, neue beginnen
  wieder bei 0 — ohne Tiebreaker könnte …"*. Das ist zugleich ein Beleg
  dafür, dass die Reihenfolgewerte im Bestand nicht global eindeutig sind.
* **„muss GENAU diese Zusicherung fallen"** stimmt nicht: beim Vertauschen
  der Texte fallen je Weg ZWEI Zusicherungen (die positive auf den richtigen
  und die negative gegen den falschen Text).

## Was NICHT gebaut wird, und warum

* **`0 … n-1` bleibt.** Die Prüfung nennt es überstreng (ein Schreiber mit
  Zehnerschritten wäre fachlich gleichwertig und würde rot). Das ist dieselbe
  Anmerkung, die schon die Planprüfung gemacht hat; die Entscheidung steht in
  N2 mit ihrer Begründung und ihrem in Kauf genommenen Preis. **Neu ist nur
  der vierte Leser — der geht in N11 ein, nicht in eine Änderung der
  Zusicherung.**
* **Der grosse Umbau** (alle Schreibvorgänge hinter das strenge Lesen)
  bleibt ausdrücklich draussen, mit eigenem Papier und eigener Planprüfung.
  Die Prüfung nennt das korrekt als verbleibenden Mangel; das ist er auch,
  und er ist benannt statt verdeckt.
