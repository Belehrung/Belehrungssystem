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

---

## Eigene Nachmessung der zweiten Runde (Haupt-Agent, 20.09.2026)

Nicht der Bericht des Ausführenden, sondern eigene Messungen an `b820fb2`
und `70d1489`. Jede Mutation über ein Skript mit Zielpfad als **Argument**,
Fundstellenzählung (Abbruch bei ≠ 1), `GEGENPROBE-`+`DEFEKT`-Marker,
`node --check`, Rücknahme gegen eine unabhängig angelegte `cp`-Kopie mit
`diff` EXIT 0. Läufe gegen eine eigene Wegwerf-DB `gymdocu_gegenprobe_test`,
nicht gegen `gymdocu_test`.

### Das geweitete Zeichenfenster (600 → 700) — die Stelle, die ich verboten hatte

Ein Wächter-Budget zu weiten ist genau die Richtung „abgeschwächt", die im
Auftrag ausgeschlossen war. Deshalb zuerst und am gründlichsten gemessen.

**Am Quelltext gezählt:** im abgegrenzten Assistenten-Block gibt es GENAU
ZWEI Fundstellen des Musters `ladeBestand(Streng)?\(req\.studioId,
brandschutz\.BEREICH\)` — die milde bei Zeile 2262, die strenge bei 2793.
Abstand zu `begehungsAufgaben` (Zeile 2801):

    Zeile 2262 (mild)   ->  36173 Zeichen
    Zeile 2793 (streng) ->    607 Zeichen

607 belegt, dass die Weitung nötig war; 36173 belegt, dass 700 die falsche
Fundstelle nicht erreichen kann. Ein Budget müsste um den Faktor 52 wachsen.

**Gegenprobe am Verhalten**, `bestandJetzt = await ladeBestandStreng(…)` durch
`bestandJetzt = {}` ersetzt:

    test_feature_brandschutz.js        EXIT 1 — „Die Begehungs-Checkliste wird
                                       nicht aus den gespeicherten Antworten
                                       zusammengesetzt"
    zurückgenommen                     EXIT 0, 55 PASS / 0 FAIL

**Und der Fund, der die Weitung endgültig entschärft:** dieselbe Mutation
macht auch `test_feature_ladebestand_streng.js` rot, und zwar an einer
VERHALTENS-Zusicherung mit unabhängig hingeschriebener Zahl:

    FEHLGESCHLAGEN: Vorbedingung: bei allen acht Positionen "vorhanden"
    müssen 24 Begehungszeilen aktiv sein, waren 10

Die statische Nähe-Prüfung ist also NICHT die einzige Absicherung der
Verdrahtung Route → `begehungsAufgaben`. Damit trägt die Weitung.

**Was dabei auffiel und stehen bleibt (kein Befund gegen diesen Beitrag, aber
notiert):** die Nähe-Prüfung arbeitet auf dem ROHEN Quelltext INKLUSIVE
Kommentaren. Ein künftiger Kommentar, der den Aufruf nur ZITIERT, kann sie
erfüllen, während der Code fehlt — die Umkehrung von „Tests dürfen nicht an
Prosa scheitern". Heute sind beide Fundstellen echter Code (gezählt, s.o.).

### N8 — Zähler statt Weg-Boolean

Alle Schreibstellen zwischen Schleifenbeginn und `ladeBestandStreng()`
abgezählt und je gegen den Zähler gehalten: Sammel-Deaktivierung (`rowCount`),
Ablösung alter Einträge, Reaktivierung, Nachtrag `durchfuehrung`, Nachtrag
`notizen`, Neuanlage samt Aufgabenzeilen — **jede erhöht `praefplanGeaendert`.**
Die Antwortzeile in `pruefbereich_bestand` zählt bewusst NICHT mit; genau das
sagt der Text („Am Prüfplan"). Zwischen Schleifenende und dem strengen Lesen
steht kein weiterer Schreibvorgang.

Gegenprobe (Parameter durch die Konstante `1` ersetzt):

    FEHLGESCHLAGEN: N8 KERNFALL: Brandschutz-Abbruch-Antwort bei
    ausschliesslich "unbekannt" muss den "nichts geänderte"-Text tragen

### N9 — die Verfälschung war nötig, und sie wirkt

Hier die Messung, die der Ausführende nur behauptet hatte. Derselbe No-op im
UPDATE-Zweig (`SET reihenfolge = reihenfolge + 0 * $1, aktiv=1`), zweimal
gefahren:

    MIT der +100-Verfälschung    EXIT 1 — „reihenfolge von 'AED — Elektroden
                                 und Batterie: Verfallsdaten' ist nicht
                                 lückenlos 0…n-1, war [100,101,102]"
    OHNE die Verfälschung        EXIT 0, 15 PASS / 0 FAIL

Der zweite Prüfzeitpunkt war also wirklich vakuos und ist es jetzt nicht mehr.
Das ist der Kern von N9, und er steht nicht mehr auf einem Bericht.

### N10 — die Zusicherung greift, die Vakuität ist belegt

    Zusicherung rot: INSERT-Zweig auf aktiv=0 gedreht →
    „AED — Elektroden und Batterie: Verfallsdaten" muss 3 aktive
    Aufgabenzeile(n) haben (aus core/ausstattung.js), waren 0

Die Vakuität der ALTEN Fassung ist als JS-Identität belegt
(`[].sort() deepStrictEqual [].map(…)` besteht), **nicht** über diese
Mutation: sie ist zu breit. Sie leert auch die Begehungszeilen, und die alte
Fassung wird davon ebenfalls rot — nur später und über eine fremde
Vorbedingung (7 Haken statt 4). Ehrlich benannt: die Mutation zeigt, dass die
neue Zusicherung FRÜHER und GENAUER anschlägt, nicht dass die alte
nichtsgesehen hätte.

### Der unveränderte Hash — meine Vorhersage war falsch

Mein Auftrag sagte: *„Der Sollwert-Hash ändert sich durch N9 und N10 erneut."*
Der Ausführende hat widersprochen und recht behalten. Grund, am Quelltext
nachgelesen: der Hash wird über `mengeZ2` gebildet, also über den Zustand
NACH dem zweiten/dritten POST. Die +100-Verfälschung liegt DAVOR und wird vom
UPDATE-Zweig wieder ausgebügelt; N10 fügt nur eine Zusicherung hinzu und
berührt die serialisierte Menge nicht. `ed8ceb41…` bleibt gültig, und die
grüne Zusicherung ist die Messung.

**Merksatz für mich:** eine Vorhersage über ein Messergebnis gehört in den
Auftrag als FRAGE („neu messen"), nicht als Tatsache („ändert sich"). Der
Satz war beides, und der zweite Teil war falsch.

---

## DRITTE RUNDE — N12, eigener Fund beim Nachmessen (Haupt-Agent, 20.09.2026)

Gefunden NICHT von einer Prüfspur, sondern beim Abzählen der Schreibstellen
für N8 (Punkt C meines eigenen Prüfauftrags an die Lesespur).

### N12 — der Satz „Am Prüfplan wurde nichts angelegt" ist im N8-Kernfall falsch

**Gemessen, ohne Datenbank:**

    core/brandschutz-vorlage.js:50   ANTWORTEN = ["vorhanden","nicht_vorhanden","unbekannt"]
    istGueltigeAntwort('unbekannt')  ->  true

Damit ist `brauchtKategorie` bei lauter „Weiß ich nicht" WAHR, und auf einem
frischen Studio legt `routes/admin/geraete.js:2557-2560` eine Zeile in
`wartung_kategorien` an — BEVOR die POSITIONEN-Schleife überhaupt beginnt.

**Der Beweis steckt im neuen N8-Testfall selbst:** er sichert zu, dass der
Stub GENAU EINMAL gegriffen hat. `ladeBestandStreng()` wird aber nur innerhalb
von `if (kategorieId)` gerufen. Ein Treffer ⇒ `kategorieId` ≠ null ⇒ auf dem
frischen Studio `lbs-bs-n8-` wurde die Kategorie angelegt. Die Seite behauptet
in genau diesem Lauf: *„Am Prüfplan wurde nichts angelegt, geändert oder
deaktiviert."*

**Wie gross ist der Schaden?** Klein, aber es ist genau unsere Klasse — ein
Satz, den die Oberfläche neu behauptet und den niemand gemessen hat. Zurück
bleibt eine LEERE Kategorieüberschrift im Prüfplan. Im Erfolgsfall wäre sie
nicht leer (der Begehungs-Grundblock gilt für jeden Betrieb), aber der
Erfolgsfall liegt hinter dem strengen Lesen und wird hier nie erreicht.

**Was NICHT die Behebung ist:** die Kategorieanlage in `praefplanGeaendert`
mitzuzählen. Dann stünde bei lauter „Weiß ich nicht" *„Ein Teil des Prüfplans
wurde bereits angepasst, der Rest nicht"* — für eine leere Überschrift ist das
eine grössere Übertreibung als der heutige Satz. Das wäre N8 in der
Gegenrichtung zum dritten Mal.

**Behebung (Wortlaut, keine Verhaltensänderung):**

    alt:  Am Prüfplan wurde nichts angelegt, geändert oder deaktiviert.
    neu:  Am Prüfplan wurden keine Einträge angelegt, geändert oder deaktiviert.

„Einträge" ist genau das, was `praefplanGeaendert` zählt (`wartung_geraete`,
`wartung_geraete_aufgaben`) — die Kategorie ist der Behälter, kein Eintrag.
Der Satz wird damit wahr, ohne dass sich das Verhalten ändert.

**Abnahme:** die Textkonstante `AUSSTATTUNG_ABBRUCH_TEXT` in
`test_feature_ladebestand_streng.js` zieht mit; vertauscht man sie mit dem
Brandschutz-Text, müssen weiterhin je Weg ZWEI Zusicherungen fallen (N11).
Zusätzlich eine Zusicherung, die dem Satz das Wort „Einträge" VERLANGT —
sonst rutscht beim nächsten Umformulieren dieselbe Übertreibung zurück.

### N13 — `erwarteteAufgabenanzahl()` kann einen Sollwert lautlos überschreiben

`karte.set(t.name, t.aufgaben.length)` benutzt den Termin-NAMEN als Schlüssel.
Kämen zwei Termine mit gleichem Namen vor, bliebe stillschweigend der letzte
stehen — und der Sollwert, gegen den N10 prüft, wäre falsch, ohne dass
irgendetwas rot wird. Genau die Klasse, gegen die N10 antritt.

**Heute gemessen, ohne Datenbank:**

    Termine gesamt:          12
    ohne aufgaben-Array:     []
    doppelte Termin-Namen:   []
    eindeutige Namen:        12

Der Fall tritt also heute nicht ein — das ist aber eine Momentaufnahme, kein
Riegel. **Behebung:** eine Zeile, die verlangt, dass die Karte so viele
Einträge hat wie es Termine gibt. Fällt sie, hat jemand einen Namen doppelt
vergeben, und der Sollwert wäre ab da eine Behauptung.

**Abnahme:** in einer Wegwerf-Kopie einen Termin-Namen verdoppeln → die neue
Zeile muss rot werden. (`t.aufgaben.length` an einem Termin ohne
`aufgaben`-Array wirft laut — das ist kein stiller Ausfall und braucht keinen
eigenen Riegel.)

---

## DRITTE RUNDE — Befunde der Lesespur, alle selbst nachgemessen

Lesespur `gpt-5.6-sol` über `tools/gegenleser-repo.js` (mit Repo-Leserechten),
14 Runden, 1.580.722 Token rein, 8,78 $. Bündel: der Diff `95c52ed..70d1489`;
die 30 weiteren Lesungen hat sie selbst gewählt.

### N14 (BLOCKIEREND) — `holeOderLegeAn()` schreibt, ohne dass der Zähler es erfährt

`routes/admin/geraete.js:2010-2021` schreibt bei einem VORHANDENEN Eintrag
dessen `art` nach, wenn sie abweicht — und gibt dem Aufrufer nicht zurück,
dass geschrieben wurde (`return { ...da, neu: false }`). Der Aufrufer erhöht
`praefplanGeaendert` nur bei `!aktiv`, `!durchfuehrung` und `notizZusatz`.

**Selbst nachgemessen, zwei Schritte:**

1. Die Bearbeiten-Route schreibt `art` NICHT mit — die UPDATE-Spaltenliste
   (`:6495-6498`) nennt `name … durchfuehrung … geraet_id`, kein `art`.
   Ein umbenannter Vorgang behält also `art='vorgang'`, während der Assistent
   für denselben Namen `art='geraet'` erwartet.
2. `notizZusatz` ist nur bei Positionen mit Stückzahl gesetzt — gezählt:
   **1 von 9** geplanten Einträgen trägt ihn, **8 nicht**. Bei einem aktiven
   Eintrag mit gesetzter Zuständigkeit und ohne `notizZusatz` laufen also
   ALLE drei anderen Zählstellen nicht.

Ergebnis: `praefplanGeaendert === 0`, obwohl das `art`-UPDATE committet ist —
die Seite behauptet „Am Prüfplan wurde nichts angelegt, geändert oder
deaktiviert".

**Und das ist eine VERSCHLECHTERUNG durch diesen Beitrag**: vor N8 übergab der
Brandschutzweg immer `true`, der Teiländerungs-Text war für genau diesen
Zustand richtig.

**Behebung:** `holeOderLegeAn()` gibt zurück, ob es geschrieben hat
(`artGeaendert`), der Aufrufer zählt es mit. Ein Feld, eine Zeile — nicht ein
dritter Umbau der Textlogik.

### N15 (BLOCKIEREND) — der leere Ausstattungs-POST behauptet gespeicherte Antworten

`routes/admin/geraete.js:4291` hält bei `beantwortet === 0` selbst fest
*„nichts gespeichert — es wurde keine Frage beantwortet"*, ruft danach aber
unbedingt `ladeBestandStreng()`. Scheitert die, liefert die Seite Titel
**„Feststellung gespeichert — Prüfplan nicht abgeglichen"** und Text
**„Eure Antworten sind gespeichert."** — beides falsch.

Der Test sendet genau diesen leeren POST (`:458-470`) und prüft dort nur den
Abbruchmarker, nicht den Satz.

**Nur der Ausstattungsweg ist betroffen** (selbst nachgemessen): beim
Brandschutz ist `brauchtKategorie` ohne gültige Antwort falsch, `kategorieId`
bleibt null, der `if (kategorieId)`-Block mit dem strengen Lesen läuft gar
nicht.

**Behebung:** die Zahl der gespeicherten Antworten mitgeben; bei 0 weder Titel
noch Satz eine Speicherung behaupten.

### N16 (BLOCKIEREND) — N9 beweist nicht, dass der Sollindex geschrieben wird

Der wichtigste Befund des Laufs, und er trifft genau die Zusicherung, die
diese Runde neu gebaut hat. Die Verfälschung `+100` verschiebt nur den
OFFSET, nicht die ZUORDNUNG Aufgabentext → Position. Ein UPDATE-Zweig, der
den gebundenen Sollindex `$1` gar nicht benutzt, kann sie trotzdem aufheben.

**Selbst gemessen**, Produktionszeile `routes/admin/geraete.js:2167`:

    SET reihenfolge = MOD(reihenfolge,100) + 0 * $1, aktiv=1
    ->  EXIT 0, 15 PASS / 0 FAIL

Der Sollindex wird nicht geschrieben, `pruefeReihenfolgeLueckenlos()` UND der
SHA-256 sehen trotzdem den Sollzustand.

**Behebung:** eine PERMUTIERENDE statt einer verschiebenden Verfälschung,
z. B. `SET reihenfolge = 1000 - reihenfolge` — sie dreht die Ordnung um, und
dann kann nur ein echtes Schreiben des Sollindex sie wiederherstellen. Der
Hash trägt die Aufgabentexte in Reihenfolge und fällt mit.
**Abnahme: genau die obige MOD-Mutation muss danach ROT sein.**

### N17 — der N10-Sollwert teilt sich die Array-Referenz mit der Produktion

`core/ausstattung.js:493` kopiert flach (`{ ...t, frage: f.schluessel }`) —
`t.aufgaben` bleibt dieselbe Referenz, die als `soll` an `syncAufgaben()`
geht. Eine In-place-Mutation dort (`soll.pop()`, eine Sortierung) veränderte
gleichzeitig den Produktions-Sollwert UND den später gelesenen Test-Sollwert.

**Behebung:** die Karte EINMAL beim Laden der Testdatei bilden, nicht bei
jedem Aufruf nach den POSTs — dann ist sie ein Schnappschuss von vorher.
Zusammen mit **N13** (Kartengröße gegen die Terminzahl) ist das eine Stelle.

### N18 — ein Erfolgs-POST ist an HTTP 200 nicht von einer Fehlerseite zu unterscheiden

Der äußere `catch` beider Routen (`routes/admin/geraete.js:4403`) sendet ohne
Statuscode, also **HTTP 200**. Jede Zusicherung der Form
`assert.strictEqual(r.status, 200)` für einen ERFOLGS-POST ist damit auch von
der generischen Fehlerseite erfüllt.

**Behebung:** bei den Erfolgs-POSTs zusätzlich zusichern, dass die Antwort den
Fehlerseiten-Marker NICHT trägt.

### N19 — drei Zählstellen lesen `rowCount` nicht

`:2734`, `:2745`, `:2762` erhöhen unbedingt nach einem Einzel-UPDATE. Wird die
zuvor gelesene Zeile parallel gelöscht, trifft das UPDATE null Zeilen und der
Zähler steigt trotzdem. **Behebung:** dieselbe Form wie bei der
Sammel-Deaktivierung (`rowCount` addieren).

### Was NACHGEMESSEN NICHT trägt bzw. nicht gebaut wird

* **Der Vorwurf gegen das 700er-Fenster trägt nur zur Hälfte.** Dass
  Kommentare das Muster erfüllen oder aufblasen können, stimmt (habe ich
  selbst notiert). Dass 700 „den Bereich erweitert, in dem ein anderer Text
  das Muster erfüllen kann", ist theoretisch richtig und praktisch ohne
  Fundstelle: gezählt liegt die einzige andere 36173 Zeichen entfernt. Kein
  Bauauftrag — die Verdrahtung hängt ohnehin zusätzlich an einer
  Verhaltens-Zusicherung („24 Begehungszeilen … waren 10", selbst gemessen).
* **`fremdBehalten` hat keine ausführbare Zusicherung** — gezählt: 0
  `assert`-Zeilen, nur zwei Kommentarzeilen. Das ist richtig beobachtet und
  im Test bereits als bekannte Lücke benannt, kein neuer Befund.
* **Das Notiz-UPDATE zählt auch einen wertgleichen Schreibvorgang mit.**
  Trägt sachlich, wird aber NICHT gebaut: PostgreSQL meldet auch bei
  identischen Werten `rowCount 1`, eine saubere Behebung müsste den Wert
  vorher vergleichen. Das ist ein eigener Umbau und steht als benannte
  Ungenauigkeit im Kommentar, nicht als stiller Mangel.

### N20 (BLOCKIEREND) — fünf von sechs Erhöhungswegen des Zählers sind ungeprüft

Befund der AUSFÜHRENDEN Prüfspur (eigener Arbeitsbaum, eigene Wegwerf-DB).
Sie durfte messen, und sie hat gemessen: vier Ein-Zeilen-Mutationen im
Produktivcode, die je ein `praefplanGeaendert++` ersatzlos entfernen, lassen
BEIDE berührten Testdateien vollständig grün.

**Selbst nachgemessen — der folgenreichste Fall und die Positivkontrolle:**

    M5  praefplanGeaendert++ beim NEUANLEGEN entfernt (angelegt++ bleibt)
        test_feature_ladebestand_streng.js   EXIT 0, 15 PASS / 0 FAIL
        test_feature_brandschutz.js          EXIT 0, 55 PASS / 0 FAIL

    M6  dasselbe beim DEAKTIVIEREN (Positivkontrolle)
        EXIT 1, Abbruch nach 8 Haken:
        „N1/N5: Brandschutz-Abbruch-Antwort trägt nicht den wegspezifischen
         Text 'Ein Teil des Prüfplans wurde bereits angepasst, der Rest nicht.'"

M6 ist der Beleg, dass die Fixtur diese Klasse GRUNDSÄTZLICH fangen kann —
sie erreicht nur den einen Weg. Und M5 ist der häufigste Weg überhaupt: die
erste Bestandsfeststellung jedes Studios.

Die Spur meldet dieselbe Beobachtung zusätzlich für Reaktivierung (2734,
mit eigenem HTTP-Nachbau belegt), Zuständigkeits-Nachtrag (2745),
Stückzahl-Nachführung (2762, ebenfalls nachgebaut) und die
Feuerlöscher-Ablösung (2699). **Diese vier habe ich NICHT einzeln
nachgemessen** — M5 und M6 zusammen belegen die Klasse, und die Behebung
unten schliesst sie ohnehin als Ganzes statt Weg für Weg.

---

## DER BAUAUFTRAG DER DRITTEN RUNDE — FASSUNG 1, ÜBERHOLT

> **NICHT NACH DIESEM ABSCHNITT BAUEN.** Die Planprüfung hat Punkt 7 als
> Tausch der Lücke widerlegt und sieben weitere Punkte nachgeschärft.
> Massgeblich ist **FASSUNG 2** am Ende dieser Datei. Dieser Abschnitt
> bleibt stehen, weil die Begründungen darin weiter gelten — aber gebaut
> wird nach Fassung 2.

N14 und N20 sind dieselbe Krankheit auf zwei Ebenen: ein Weg zählt gar nicht,
fünf Wege sind ungeprüft. Sie werden deshalb NICHT Weg für Weg behoben —
das wären sechs Fixturen und beim siebten Schreibweg dasselbe Problem von
vorn. Stattdessen:

**1. Jeder Schreibvorgang der Schleife geht durch EINEN Weg** (schliesst N19
und die künftige siebte Stelle mit). Ein lokaler Helfer in der Route:

    async function schreibePruefplan(sql, params) {
        const r = await db.run(sql, params);
        praefplanGeaendert += (r && r.rowCount) || 0;
        return r;
    }

Alle Schreibvorgänge auf `wartung_geraete` / `wartung_geraete_aufgaben`
zwischen Schleifenbeginn und `ladeBestandStreng()` benutzen ihn. Damit zählt
der Zähler ECHTE getroffene Zeilen statt Absichten — die drei unbedingten
`++` verschwinden.

**2. `holeOderLegeAn()` meldet, ob es geschrieben hat** (N14). Es liegt
ausserhalb der Schleife und kann den Helfer nicht benutzen; es gibt deshalb
`artGeaendert` bzw. `neu` zurück, und der Aufrufer addiert beides.
`neu === true` deckt Gerätezeile UND Aufgabenzeilen ab — eine Zahl, kein
Vertrag über die genaue Anzahl (der Kommentar „zählt JEDEN echten
Schreibvorgang" wird entsprechend berichtigt, er stimmt heute nicht).

**3. Ein STATISCHER Riegel gegen den nächsten ungezählten Weg** (schliesst
N20 als KLASSE statt als sechs Einzelfälle). Über den
KOMMENTARBEREINIGTEN Quelltext (`GERAETE_QUELLTEXT_OHNE_KOMMENTARE` gibt es
in der Testdatei schon): zwischen dem Schleifenbeginn und dem Aufruf von
`ladeBestandStreng(req.studioId, brandschutz.BEREICH)` darf KEIN blankes
`db.run(` mit `wartung_geraete` vorkommen — nur `schreibePruefplan(`.
**Gegenprobe:** ein blankes `db.run("UPDATE wartung_geraete …")` in diesen
Bereich setzen ⇒ ROT.

**4. ZWEI Verhaltensproben, nicht sechs** — für die beiden Wege, die die
Prüfspur live nachgebaut hat:
   * **Neuanlage:** frisches Studio, EIN POST `antwort_rwa=vorhanden` mit
     gestörtem strengen Lesen ⇒ Seite MUSS den Teiländerungs-Text tragen.
     (Heute trägt sie ihn, aber M5 zeigt: ohne Zusicherung.)
   * **Reaktivierung:** POST anlegen → POST `nicht_vorhanden` → POST
     `vorhanden` mit gestörtem Lesen ⇒ ebenfalls Teiländerungs-Text.

**5. Wortlaut (N12):** „Am Prüfplan wurden keine **Einträge** angelegt,
geändert oder deaktiviert." Dazu eine Zusicherung, die dem Satz das Wort
„Einträge" VERLANGT.

**6. Der leere Ausstattungs-POST (N15):** `ladeBestandFehlerinhalt()` bekommt
die Zahl der in diesem Submit gespeicherten Antworten. Bei 0 darf weder der
Seitentitel („Feststellung gespeichert") noch der erste Satz („Eure Antworten
sind gespeichert.") eine Speicherung behaupten. **Abnahme:** der bestehende
Leer-POST-Testfall (`:458-470`) sichert den neuen Satz wörtlich zu.

**7. N9 permutierend statt verschiebend (N16):** `SET reihenfolge = 1000 -
reihenfolge` statt `+ 100`. **Abnahme, wörtlich:** die Mutation
`SET reihenfolge = MOD(reihenfolge,100) + 0 * $1, aktiv=1` muss danach ROT
sein — heute gemessen EXIT 0, 15 PASS / 0 FAIL.

**8. N10-Sollwert als Schnappschuss (N17 + N13):** die Karte EINMAL beim Laden
der Testdatei bilden, nicht bei jedem Aufruf; dazu eine Zeile, die die
Kartengrösse gegen die Zahl der Termine hält (heute 12).

**9. Erfolgs-POSTs (N18):** zusätzlich zusichern, dass die Antwort den
Fehlerseiten-Marker NICHT trägt — sonst ist ein Erfolg an HTTP 200 nicht von
der generischen Fehlerseite zu unterscheiden.

**Nicht in diesem Auftrag** (begründet oben): das geweitete 700er-Fenster,
die fehlende `fremdBehalten`-Zusicherung, das wertgleiche Notiz-UPDATE.

---

## PLANPRÜFUNG DER DRITTEN RUNDE — und was sie am Auftrag ändert

Zwei Lesespuren, verschiedene Bündel (Betreiber-Entscheidung 20.09. abends).

* **Spur A** `gpt-5.6-sol` über `tools/gegenleser-repo.js` mit Repo-Leserechten,
  Schwerpunkt Route. 12 Runden, 5,95 $. **6 Befunde, alle 6 getragen.**
* **Spur B** `kimi-k3`, festes Bündel Plan + Testdatei, `effort: max`,
  1676 s Laufzeit. **9 Befunde, 7 getragen, 2 gefallen.** Lauf endete
  `incomplete` (50.901 von 60.000 Ausgabe-Token gingen ins Nachdenken) — die
  Befunde kamen vollständig durch, die Rechenschaft am Ende nicht. **Das ist
  mein Parameterfehler, nicht das Modell:** die CLAUDE.md sagt selbst, `high`
  ist bei Kimi das bessere Geschäft.

**Überschneidung: 3 von 6 bzw. 9** (die Involution, der falsche Marker, die
fehlende N14-Abnahme) — das passt zur gemessenen Erwartung, dass
verschiedene Bündel die Überschneidung etwa halbieren.

### Der Befund, der den Auftrag kippt — beide Spuren, unabhängig

Mein Punkt 7 (`SET reihenfolge = 1000 - reihenfolge`) ist eine INVOLUTION.
Die Ein-Zeilen-Mutation

    SET reihenfolge = LEAST(reihenfolge, 1000 - reihenfolge) + 0 * $1, aktiv=1

hebt sie auf, OHNE den Sollindex zu schreiben. **In Postgres nachgerechnet:**

    r        1000-r    LEAST darauf    LEAST auf r    r+100   LEAST darauf
    0        1000      0               0              100     100
    2         998      2               2              102     102

Das heutige `+100` FÄNGT diese Mutation (der Wert bliebe verschoben), meine
geplante Umkehrung nicht. Mein Punkt 7 wäre also ein **Tausch der Lücke**
gewesen, kein strengerer Nachweis — gefunden, bevor eine Zeile gebaut wurde.

### Die Behebung, selbst gemessen — eine KOLLABIERENDE Verfälschung

    UPDATE wartung_geraete_aufgaben SET reihenfolge = 1000 WHERE studio_id=$1

**Warum das die Klasse schliesst statt sie zu verschieben:** stehen alle
Zeilen eines Geräts auf DEMSELBEN Wert, liefert jeder Ausdruck der Form
`f(reihenfolge)` für alle Zeilen wieder denselben Wert. `0…n-1` braucht bei
n > 1 aber n VERSCHIEDENE. Nur ein Schreiber, der den Sollindex je Zeile
benutzt, kann das herstellen. Das ist ein Konstruktionsargument, kein
Glücksfall.

**Gemessen, je einzeln:**

    Verfaelschung = 0      korrekter Code  EXIT 0, 15 PASS / 0 FAIL
                           MOD(...,100)    EXIT 1, war [0,0,0]
                           LEAST(...)      EXIT 1, war [0,0,0]
    Verfaelschung = 1000   korrekter Code  EXIT 0, 15 PASS / 0 FAIL
                           LEAST(...)      EXIT 1, war [0,0,0]

**Und 1000 ist besser als 0, obwohl beide heute messen:** gezählt haben die
zwölf Termine `[6,3,7,3,3,5,3,9,4,3,3,3]` Aufgaben — kein Gerät mit nur
EINER. Bei einem solchen Gerät wäre `0` ein LEGALER Sollwert und die
Verfälschung stillschweigend wirkungslos. **Meine Fassung hing an einer
Eigenschaft der DATEN, die von Kimi an der KONSTRUKTION.** Genau der
Unterschied, den die CLAUDE.md unter „Referenz von AUSSEN" meint.

### Was noch am Auftrag geändert wird

| Punkt | Änderung | Quelle |
|---|---|---|
| 2 | TOTALER Rückgabevertrag mit ZAHLEN, nicht zwei optionale Booleans — `true + undefined` ist `NaN`, `NaN > 0` ist `false` (gemessen), und die Neuanlagenprobe führte genau dorthin | A4 |
| 3 | Riegel muss BEIDE Bereichsmarken finden UND ihre Reihenfolge prüfen (sonst leerer Bereich = stilles Grün); verbietet `db.run(`, `db.q(`, `.query(` UNABHÄNGIG vom SQL-Text (sonst hilft eine hochgezogene SQL-Konstante); entfernt ALLE Blockkommentare | A/D, B3 |
| 3 | **Und er wird ehrlich benannt:** er ist ein KONVENTIONSwächter über einen lexikalischen Bereich, kein DML-Wächter. Helfer, die ausserhalb definiert sind, sieht er NICHT — `holeOderLegeAn` ist der lebende Beleg | A/H, B3 |
| 4 | DRITTE Verhaltensprobe für den reinen `art`-Fall; sonst hat der blockierende Befund N14 keine eigene Abnahme | A3, B5 |
| 4 | Die Reaktivierungsprobe sichert ihren VORZUSTAND zu (dieselbe Zeilen-ID, `aktiv=0` davor, `aktiv=1` danach) — sonst wäre Löschen-und-Neuanlegen ununterscheidbar | A6 |
| 5 | Die „Einträge"-Zusicherung bindet an die gerenderte Seite bzw. den PRODUKTIV-Quelltext, NIE an die eigene Testkonstante — sonst kann sie nicht falsch werden | B7 |
| 6 | Der neue Titel UND der neue Satz werden WÖRTLICH im Auftrag festgelegt; der Titel steht ausserhalb von `ladeBestandFehlerinhalt()` und muss an beiden Aufrufstellen abgeleitet werden | A2, B6 |
| 4/6 | Überall NEGATIVE Zusicherungen daneben (alter Satz/Titel muss FEHLEN) — reine Anwesenheitsprüfung besteht auch eine Seite, die beide Sätze trägt | B6 |
| 8 | Der Bauort der Sollwert-Karte wird gepinnt (Top-Level, vor jedem POST) | B9 |
| 9 | Abwesenheit von **`<div class="error">`** UND von `ABBRUCH_MARKER` — zwei Zusicherungen. `ABBRUCH_MARKER` allein taugt nicht: die generische Fehlerseite trägt ihn gar nicht (gemessen) | A5, B4 |

### Was NACHGEMESSEN NICHT trägt

* **B1 (blockierend gemeldet): „`syncAufgaben()` schreibt im gezählten
  Fenster".** Gemessen: die Aufrufe liegen bei **2829** und **2898**
  (Brandschutz) bzw. **4346** (Ausstattung), das strenge Lesen bei **2793**
  bzw. **4299** — **alle danach.** Die Prämisse ist falsch, der Befund fällt.
  Was übrig bleibt, ist kein eigener Befund, sondern dasselbe wie A/H: der
  Riegel sieht keine ausserhalb definierten Helfer. Das steht jetzt als
  ehrliche Grenze im Auftrag statt als „schliesst die Klasse".
* **B8: „der Geschwisterwächter trägt den alten Satz".** `grep` über das
  ganze Repo: **genau zwei** Fundstellen — die Produktionszeile und EINE
  Testkonstante in `test_feature_ladebestand_streng.js`.
  `test_feature_brandschutz.js` trägt ihn nicht. Fällt.

---

# FASSUNG 2 — DER MASSGEBLICHE BAUAUFTRAG DER DRITTEN RUNDE

Nach zwei Planprüfungen. Wo diese Fassung und Fassung 1 sich widersprechen,
gilt DIESE. Die Begründungen stehen oben; hier steht, was zu tun ist.

Zweig `beitrag-ladebestand`, Datei `routes/admin/geraete.js` und
`test_feature_ladebestand_streng.js`. **Zeilennummern vor dem Bau NEU
messen** — sie haben sich in dieser Nacharbeit schon zweimal verschoben.

## 1 — Ein Weg für alle Schreibvorgänge der Schleife

Im Rumpf der Brandschutz-Route ein lokaler Helfer:

    async function schreibePruefplan(sql, params) {
        const r = await db.run(sql, params);
        praefplanGeaendert += (r && r.rowCount) || 0;
        return r;
    }

Alle Schreibvorgänge auf `wartung_geraete` / `wartung_geraete_aufgaben`
ZWISCHEN dem Beginn der POSITIONEN-Schleife und dem Aufruf von
`ladeBestandStreng(req.studioId, brandschutz.BEREICH)` gehen durch ihn; die
drei unbedingten `++` entfallen.

**Der Zähler zählt ab jetzt GETROFFENE ZEILEN, nicht semantische
Änderungen.** Das ist eine bewusste Entscheidung und gehört in den Kommentar:
PostgreSQL meldet `rowCount 1` auch bei einem wertgleichen UPDATE, der
Teiländerungs-Satz kann also bei einem inhaltsgleichen Wiederholungs-POST
erscheinen. Eine saubere Behebung bräuchte einen Wertvergleich vor dem UPDATE
und ist ein EIGENER Beitrag. **Benannt statt verdeckt.**

## 2 — `holeOderLegeAn()` meldet, was sie geschrieben hat

Sie liegt ausserhalb des Routenrumpfs und kann den Helfer nicht benutzen.
**TOTALER Rückgabevertrag mit ZAHLEN**, beide Zweige tragen beide Felder:

    return { ...da, neu: false, artGeaendert: <rowCount des art-UPDATE, sonst 0> };
    return { ...r,  neu: true,  artGeaendert: 0 };

Aufrufer, ausdrücklich numerisch:

    praefplanGeaendert += eintrag.neu ? 1 : 0;
    praefplanGeaendert += eintrag.artGeaendert || 0;

**Nicht `+= eintrag.neu + eintrag.artGeaendert`.** Fehlt ein Feld, ist das
`true + undefined === NaN`, und `NaN > 0` ist `false` — die Seite zeigte dann
den Null-Text, obwohl ein Gerät angelegt wurde. Gemessen; dieser Zustand
existiert heute nicht und darf nicht entstehen.

`artGeaendert` kommt aus dem `rowCount` des UPDATE, nicht aus dem Eintritt in
den `if`-Zweig — sonst meldet eine zwischen SELECT und UPDATE gelöschte Zeile
eine Änderung, die nicht stattfand.

Der Kommentar „zählt JEDEN echten Schreibvorgang" wird berichtigt: bei einer
Neuanlage entstehen Gerätezeile UND Aufgabenzeilen, gezählt wird einmal. Der
Vertrag ist „> 0 heisst: es wurde geschrieben", kein Zahlenvertrag.

## 3 — Statischer Riegel, und er wird ehrlich benannt

Über `GERAETE_QUELLTEXT_OHNE_KOMMENTARE`, **nachdem ALLE Blockkommentare
entfernt sind** (die bestehende Bereinigung lässt Blockkommentare mitten in
der Zeile stehen — sonst schlägt der Riegel an einem zitierten Beispiel an).

* **Beide Bereichsmarken MÜSSEN gefunden werden, und in der richtigen
  Reihenfolge.** Fehlt eine, ist das ein **FAIL**, kein leerer Bereich —
  „leeres Ergebnis ist nicht sauberes Ergebnis".
* Im Bereich ist **JEDER direkte Schreib-Aufruf verboten** — `db.run(`,
  `db.q(`, `db.one(`, `.query(` — **unabhängig vom SQL-Text.** Sonst genügt
  eine oberhalb hochgezogene SQL-Konstante, um beide Musterbestandteile zu
  trennen. Erlaubt ist nur `schreibePruefplan(`.
* **Gegenproben, alle drei:** (a) ein blankes `db.run("UPDATE
  wartung_geraete …")` in den Bereich setzen ⇒ ROT; (b) eine Bereichsmarke
  umbauen ⇒ ROT (nicht still grün); (c) ohne Defekt ⇒ GRÜN.

**In den Kommentar, wörtlich:** *Dieser Riegel ist ein KONVENTIONSwächter
über einen lexikalischen Bereich, kein DML-Wächter. Eine Funktion, die
ausserhalb dieses Bereichs definiert ist, sieht er NICHT — `holeOderLegeAn()`
ist der lebende Beleg dafür, und genau deshalb steht Punkt 4c daneben.*

## 4 — DREI Verhaltensproben

Jede mit gestörtem `ladeBestandStreng()` und jede mit **positiver UND
negativer** Zusicherung (der jeweils andere Text muss FEHLEN — reine
Anwesenheitsprüfung bestünde auch eine Seite, die beide Sätze trägt).

**4a Neuanlage** — frisches Studio, EIN POST `antwort_rwa=vorhanden`
⇒ Teiländerungs-Text, NICHT der Keine-Einträge-Text.

**4b Reaktivierung** — anlegen → `nicht_vorhanden` → `vorhanden`.
**Der Vorzustand wird ZUGESICHERT**, sonst ist Löschen-und-Neuanlegen davon
nicht zu unterscheiden: vor dem dritten POST genau EINE RWA-Zeile mit
bekannter ID und `aktiv=0`, danach DIESELBE ID mit `aktiv=1`.

**4c Nur `art` weicht ab** — die Abnahme für N14, den einzigen Schreibweg
ausserhalb des Helfers. Vorzustand: Eintrag vorhanden, `aktiv=1`,
`durchfuehrung` gesetzt, kein `notizZusatz`, und `art` auf dem falschen
zulässigen Wert. Erwartung: Teiländerungs-Text UND `art` ist korrigiert.
**Ohne diese Probe hat ein blockierender Befund seinen eigenen Fix nicht
abgesichert.**

## 5 — Wortlaut

    alt:  Am Prüfplan wurde nichts angelegt, geändert oder deaktiviert.
    neu:  Am Prüfplan wurden keine Einträge angelegt, geändert oder deaktiviert.

Die Zusicherung, die das Wort „Einträge" VERLANGT, bindet an die **gerenderte
Antwort** bzw. den **PRODUKTIV-Quelltext** — **NIE an die eigene
Testkonstante.** Eine Prüfung der Konstante gegen sich selbst kann nicht
falsch werden; Produktionstext und Konstante liessen sich gemeinsam
umformulieren, ohne dass etwas rot wird.

Fundstellen des alten Satzes im ganzen Repo (gezählt): **genau zwei** —
`routes/admin/geraete.js` und die Konstante in
`test_feature_ladebestand_streng.js`. `test_feature_brandschutz.js` ist
NICHT betroffen.

## 6 — Der leere Ausstattungs-POST

`ladeBestandFehlerinhalt()` bekommt als dritte Eingabe die Zahl der in DIESEM
Submit gespeicherten Antworten. **Der Seitentitel steht AUSSERHALB der
Funktion** (`layout(req.studioId, "…", …)` an beiden Aufrufstellen) und muss
dort ebenfalls abgeleitet werden.

Wörtlich festgelegt, damit eine wörtliche Abnahme möglich ist:

    Titel bei 0 Antworten:  Keine Feststellung gespeichert — Prüfplan nicht abgeglichen
    Satz  bei 0 Antworten:  In diesem Durchgang wurden keine Antworten gespeichert.

Bei > 0 Antworten bleiben Titel und erster Satz wie heute.

**Abnahme, positiv UND negativ:** der bestehende Leer-POST-Testfall verlangt
den neuen Titel und den neuen Satz WÖRTLICH und verbietet den alten Titel
(`Feststellung gespeichert — Prüfplan nicht abgeglichen`) und den alten Satz
(`Eure Antworten sind gespeichert.`).

## 7 — Die N9-Verfälschung wird KOLLABIEREND

    UPDATE wartung_geraete_aufgaben SET reihenfolge = 1000 WHERE studio_id=$1

statt `+ 100`. Begründung im Kommentar: stehen alle Zeilen eines Geräts auf
DEMSELBEN Wert, liefert jeder Ausdruck `f(reihenfolge)` für alle denselben
Wert — `0…n-1` braucht bei n > 1 aber n VERSCHIEDENE. Nur ein Schreiber, der
den Sollindex je Zeile schreibt, stellt das her.

**`1000`, nicht `0`:** die zwölf Termine haben `[6,3,7,3,3,5,3,9,4,3,3,3]`
Aufgaben, heute also keiner mit nur einer — bei einem solchen wäre `0` ein
LEGALER Sollwert und die Verfälschung wirkungslos. `1000` kann nie legal sein.

**Abnahme, alle drei wörtlich gemessen und gemeldet:**

    unmutiert                                            ⇒ GRÜN
    SET reihenfolge=MOD(reihenfolge,100) + 0 * $1        ⇒ ROT
    SET reihenfolge=LEAST(reihenfolge,1000-reihenfolge)
                    + 0 * $1                             ⇒ ROT

Die Vorbedingung (`rowCount > 0` der Verfälschung) bleibt.

## 8 — Sollwert-Karte als Schnappschuss

`erwarteteAufgabenanzahl()` wird **EINMAL auf Top-Level der Testdatei**
gebildet, VOR jedem POST — nicht bei jedem Aufruf. Grund: `core/ausstattung.js`
kopiert in `geplanteTermine()` flach, `t.aufgaben` ist dieselbe Referenz, die
als `soll` in die Produktion geht; eine In-place-Mutation dort veränderte
sonst auch den Test-Sollwert.

Dazu die Zeile aus N13: **Kartengrösse == Zahl der Termine** (heute 12, aus
derselben Schleife gezählt, kein Literal). Ein doppelter Termin-Name fiele
sonst lautlos zusammen.

In den Kommentar: dass Karte und Produktions-Soll weiterhin aus DERSELBEN
Quelle `FRAGEN` kommen, ist Absicht — verankert ist das über den literalen
SHA-256 weiter unten.

## 9 — Erfolgs-POSTs von Fehlerseiten unterscheiden

Bei JEDEM Erfolgs-POST zusätzlich zu `status === 200` **zwei** Zusicherungen:
die Antwort trägt weder `<div class="error">` (generische Fehlerseite des
äusseren `catch`, HTTP 200!) noch `ABBRUCH_MARKER`.

**`ABBRUCH_MARKER` allein genügt NICHT** — gemessen: die generische
Fehlerseite (`layout(req.studioId, "Fehler", '<div class="error">…')`) trägt
diesen Marker gar nicht.

## Abnahme insgesamt

* Volle Suite `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"` — kein
  Pipe, kein äusseres `flock`.
* `npm run lint`, Ergebnis WÖRTLICH melden, auch bei Grün.
* Jede neue Zusicherung mit Gegenprobe in BEIDE Richtungen, wörtlich
  gemeldet (Mutation → ROT mit der Fehlerzeile, Rücknahme gegen eine
  unabhängige `cp`-Kopie mit `diff` EXIT 0 → GRÜN).
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker mit, `node --check` danach.
* Am Ende `git status` sauber und der Marker-Scan nur mit Prosatreffern.

---

## DIFFPRÜFUNG DER DRITTEN RUNDE — Lesespur (gpt-5.6-sol, 16 Runden, 11,07 $)

Material: der Diff `70d1489..9d3fc3b` plus freier Repo-Lesezugriff. **Zwei neue
Befunde, beide selbst nachgemessen, beide tragen.** Eine Bewertung fällt.

### R1 (BLOCKIEREND) — die Feuerlöscher-Ablösung hat ihre Verdrahtung verloren

Die Auslagerung nach `feuerloescherOhneProtokoll()` war nötig, damit der neue
Bereichs-Riegel keinen rohen `db.q()` im Bereich sieht. Sie hat aber die
statische Zusicherung in `test_feature_brandschutz.js` von der AUFRUFSTELLE
getrennt: das Muster findet jetzt die Definition des Helfers, nicht den Aufruf.

**Selbst gemessen**, `const alt = await feuerloescherOhneProtokoll(...)` durch
`const alt = []` ersetzt — die Ablösung ist damit vollständig tot:

    test_feature_brandschutz.js         EXIT 0, 55 PASS / 0 FAIL
    test_feature_ladebestand_streng.js  EXIT 0, 20 PASS / 0 FAIL

**Dass es vorher getragen hat, ist ebenfalls gemessen**, nicht vermutet: das
SQL-Literal `NOT EXISTS (SELECT 1 FROM wartung_pruefungen` kommt auf `70d1489`
GENAU EINMAL vor — in der Route selbst (Z. 2693). Dieselbe Mutation hätte es
dort ersatzlos entfernt und das Muster wäre gefallen. Heute steht es genau
einmal im Helfer (Z. 2203) und überlebt die Mutation.

**Eine Verhaltensprobe für die Ablösung gibt es nirgends** (`grep` über alle
Testdateien: nur die beiden statischen Muster).

Das ist die Klasse „eine Behebung kann Abdeckung KOSTEN" — verursacht von
genau dem Beitrag, der diese Klasse schliessen sollte.

**Behebung: eine echte Verhaltensprobe**, keine zweite statische Zusicherung.
Zwei nummerierte Altbestände im selben Studio: einer OHNE Prüfprotokoll muss
deaktiviert und in `abgeloest` gemeldet werden, einer MIT muss aktiv bleiben.
Das fängt zugleich den vertauschten Aufruf
(`feuerloescherOhneProtokoll(kategorieId, req.studioId)`), den eine reine
Aufrufmuster-Zusicherung nur zufällig träfe.

### R2 — mein eigener Titel-Wortlaut ist zu absolut

`Keine Feststellung gespeichert — Prüfplan nicht abgeglichen` habe ich in
Fassung 2 wörtlich vorgegeben. **Nachgemessen am Testablauf:** der leere POST
läuft auf demselben Studio wie drei vorherige POSTs mit Antworten
(`test_feature_ladebestand_streng.js`, `sid`/`port` aus Schritt 1). Es IST
also eine Feststellung gespeichert — nur nicht in diesem Durchgang. Der
Fliesstext sagt das korrekt („In diesem Durchgang wurden keine Antworten
gespeichert."), der Titel nicht.

**Behebung, Wortlaut:** `Keine neue Feststellung gespeichert — Prüfplan nicht
abgeglichen`. Die Testkonstante `LEERER_POST_TITEL_NEU` zieht mit; der exakte
`<title>`-Vergleich bleibt.

Das ist in diesem Beitrag die **fünfte** eigene Vorgabe, die beim Messen
gefallen ist.

### R3 (Anmerkung, wird mitgenommen) — `pruefeKeinFehlerseiten()` verbraucht den Körper

`await r.text()` konsumiert den Fetch-Körper; ein zweites `r.text()` wirft
`TypeError: Body is unusable`. **Heute greift kein Aufrufer danach erneut zu**
(alle prüfen, keiner liest weiter) — also kein Defekt, aber eine Falle für den
nächsten. `r.clone().text()` kostet ein Wort und nimmt sie weg.

### Was NACHGEMESSEN NICHT trägt

**„Die beiden `html.includes('Einträge')`-Zusicherungen sind redundant neben
dem Volltext-Vergleich."** Sie sind es nicht. Der Volltext-Vergleich läuft
gegen die TESTKONSTANTE `AUSSTATTUNG_ABBRUCH_TEXT` (Z. 369). Würden Produktion
und Konstante gemeinsam umformuliert — genau der Fall, den Punkt 5 der
Fassung 2 verhindern soll —, bliebe er grün, und NUR die
`'Einträge'`-Zeile fiele. Sie ist der nicht-selbstbezügliche Anker, als der
sie gebaut wurde.

Ebenfalls nicht übernommen: die Anmerkung, die Positivkontrolle des
Bereichs-Riegels beweise nur „mindestens ein `schreibePruefplan(`". Das ist
richtig und ausdrücklich so gewollt — sie ist die Bremse gegen einen LEEREN
Bereich („leeres Ergebnis ist nicht sauberes Ergebnis"), nicht der Nachweis
der einzelnen Wege. Den leisten die Verhaltensproben 4a–4c.

---

## AUSFÜHRENDE PRÜFSPUR — zweimal am Kontingent gescheitert, Messungen selbst zu Ende geführt

Beide Anläufe (21.09.2026) endeten mit HTTP 429 — der erste am Wochenlimit,
der zweite am Konto-Limit. **Beide starben MITTEN in einer Mutation**, und
beide Male lag der Rest im eigenen Prüf-Arbeitsbaum, nie im Hauptbaum. Genau
dafür ist die Trennung da; sie hat zweimal gehalten.

Was liegen blieb, war brauchbar und ist von mir zu Ende gemessen worden.

### R4 — die Klammer-Schreibweise umgeht den Bereichs-Riegel

Liegengeblieben aus Anlauf 1: `await db["run"](…)` statt
`await schreibePruefplan(…)` beim Notiz-UPDATE.

**Gemessen:** `test_feature_ladebestand_streng.js` **EXIT 0, 20 PASS / 0 FAIL**
— der Riegel sieht sie nicht, und der Schreibvorgang zählt nicht mehr mit.

Das ist kein plausibler Versehensfehler, und der Riegel ist ausdrücklich als
KONVENTIONSwächter benannt. Es lässt sich aber **ohne Wettrüsten** schliessen:
im kommentarbereinigten Bereich kommt der Bezeichner `db` heute **null mal**
vor, bei sechs `schreibePruefplan(`-Aufrufen. **Behebung:** der Riegel
verbietet im Bereich `\bdb\b` statt einer Liste einzelner Methodennamen — das
deckt Klammer- und Template-Schreibweise und `db.pool.query` mit ab.

### R5 (NEU, gemessen statt benannt) — der wertgleiche Wiederholungs-POST lügt

Bis hierher stand die Sache als „benannte Ungenauigkeit" im Kommentar.
**Jetzt gemessen**, zwei Fälle, je frisches Studio, POST zweimal mit
IDENTISCHEM Rumpf, beim zweiten das strenge Lesen gestört:

    A  antwort_rwa=vorhanden (kein notizZusatz)
       Teilaenderungs-Text: false | "keine Eintraege": true   -> RICHTIG
    B  antwort_feuerloescher=vorhanden, anzahl=2 (beide Male 2)
       Teilaenderungs-Text: true  | "keine Eintraege": false  -> FALSCH

In Fall B hat sich am Prüfplan nichts geändert — die Stückzahl ist dieselbe —,
und die Seite behauptet trotzdem eine Teiländerung. Ursache ist das
`notizen`-UPDATE: PostgreSQL meldet `rowCount 1` auch dann, wenn
`regexp_replace` denselben Text wieder erzeugt.

**Behebung, eine Bedingung statt eines SQL-Umbaus:** `holeOderLegeAn()` gibt
`notizen` mit zurück (eine Spalte mehr im vorhandenen SELECT), und der
Aufrufer feuert das UPDATE nur noch, wenn der Bestandstext den neuen
`notizZusatz` NICHT schon wörtlich enthält:

    if (g.notizZusatz && !(schonDa.notizen || '').includes(g.notizZusatz)) { … }

Das ist genau die Bedingung, unter der die `CASE`-Ersetzung denselben String
erzeugt — kein Nachbau der SQL-Logik in JavaScript, keine doppelte Aussage.
**Abnahme:** Fall B muss danach „keine Einträge" zeigen, Fall A unverändert
bleiben, und eine ECHTE Stückzahländerung (2 → 5) weiterhin den
Teiländerungs-Text.

### R6 (BLOCKIEREND, Prüfreihenfolge Punkt 1) — die Mandantentrennung im ausgelagerten Helfer ist unbewacht

Liegengeblieben aus Anlauf 2, und es ist der schwerste Fund dieser Runde.
Mutation in `feuerloescherOhneProtokoll()`:

    WHERE (g.studio_id=$1 OR TRUE) AND g.kategorie_id=$2 AND g.aktiv=1

**Gemessen:** `test_feature_brandschutz.js` **EXIT 0, 55 PASS / 0 FAIL**,
`test_feature_ladebestand_streng.js` **EXIT 0, 20 PASS / 0 FAIL**.

**Und die GESAMTE Suite ebenfalls — nachgetragen 22.09.2026.** Zwei Dateien
sind kein Beleg dafür, dass kein Geschwisterwächter einspringt; der `grep -l`
über die fünf `mandantengrenze`/`studio`-Dateien war ein Indiz, keine Messung.
Mit derselben Mutation im eigenen Prüf-Arbeitsbaum auf `9d3fc3b`:

    bash test/run.sh   →   SUITE_EXIT=0   (270 s, kein einziges FAIL)

Die Mutation lag dabei nachweislich an Ort und Stelle (`git diff` zeigt genau
die zwei Zeilen und sonst nichts, Marker `GEGENPROBE-`+`DEFEKT M13` gesetzt) —
die Prüfung, die die CLAUDE.md nach jedem unerwarteten Grün verlangt. Sie war
hier nicht unerwartet, gehört aber trotzdem gemacht.

Und es gibt auch keinen Geschwisterwächter, der einspringt: von den fünf
Dateien mit `mandantengrenze`/`studio` im Namen liest **keine einzige**
`routes/admin/geraete.js` (gezählt mit `grep -l`).

**Das hängt unmittelbar an R1.** Vor der Auslagerung stand die Abfrage in der
Route und war über das statische Muster in `test_feature_brandschutz.js` an
ihre Aufrufstelle gebunden; heute steht sie im Helfer und ist es nicht mehr.
Dieselbe Behebung deckt beides ab — **die Verhaltensprobe aus R1 bekommt ein
ZWEITES Studio**: eine gleichnamige `Feuerlöscher N`-Zeile ohne Prüfprotokoll
im FREMDEN Studio muss nach dem POST unangetastet und aktiv bleiben.
Dann fällt dieselbe Probe sowohl bei `const alt = []` (R1) als auch bei der
aufgehobenen Mandantentrennung (R6).

---

## EIGENE NACHMESSUNG 22.09.2026 — R6 ist BERICHTIGT, und meine Probe hätte nichts gemessen

Vor dem Bauauftrag habe ich die R6-Probe entworfen („eine gleichnamige
`Feuerlöscher N`-Zeile ohne Prüfprotokoll im FREMDEN Studio muss unangetastet
bleiben"). Beim Nachrechnen des Kontrollflusses fällt sie — es ist die
**sechste** eigene Vorgabe dieses Beitrags, die beim Messen fällt.

### Der Fehler in meinem Probenentwurf

`feuerloescherOhneProtokoll()` filtert mit ZWEI Klauseln:

    WHERE g.studio_id=$1 AND g.kategorie_id=$2 AND g.aktiv=1 …

`wartung_kategorien` ist studio-eigen — `core/db.js:797` hat
`CREATE UNIQUE INDEX idx_wkat_studio_name ON wartung_kategorien(studio_id, name)`,
jedes Studio bekommt also eine EIGENE Zeile mit eigener `id`. Eine realistisch
angelegte Fremdstudio-Zeile trägt damit eine ANDERE `kategorie_id` und fällt
schon an `g.kategorie_id=$2` heraus — **mit oder ohne Mandantenklausel.**
Meine Probe wäre bei der R6-Mutation grün geblieben und hätte genau das
behauptet, was sie widerlegen sollte.

Das ist wörtlich die Klasse aus der CLAUDE.md vom 20.09.2026: *„nicht ‚die eine
Zeile' benennen, sondern alle Riegel abzählen, die zwischen der Eingabe und dem
Schaden stehen, und genau diese Menge mutieren."* Hier sind es zwei, ich hatte
einen gezählt.

### Und daraus folgt zugleich die Berichtigung der SCHWERE

Die zweite Klausel ist kein zufälliger Filter, sondern selbst
mandantengesichert. **Gemessen am Quelltext, alle Wege einzeln:**

    routes/admin/geraete.js:2632   SELECT id FROM wartung_kategorien
                                   WHERE studio_id=$1 AND name=$2     ← kategorieId des POST
    routes/admin/geraete.js:5752   SELECT id,name FROM wartung_kategorien
                                   WHERE id=$1 AND studio_id=$2  + !kat-Abweisung (5753)
    routes/admin/geraete.js:6184   SELECT * FROM wartung_kategorien
                                   WHERE id=$1 AND studio_id=$2       ← CSV-Import
    core/demo_daten.js:165/171/175 katId frisch für dasselbe studioId angelegt

`INSERT INTO wartung_geraete` kommt im Produktivcode **fünfmal** vor (gezählt
über `routes/ core/ ops/ workers/`, `wartung_geraete_aufgaben` abgezogen), und
in allen fünf stammt `kategorie_id` aus einer dieser Quellen. Es gibt **keinen
Produktivweg**, der eine Gerätezeile mit einer FREMDEN `kategorie_id` erzeugt —
die Datenbank erzwingt das allerdings NICHT: der Fremdschlüssel steht auf
`kategorie_id` allein (`core/db.js:874`), nicht zusammengesetzt.

**Damit ist R6 nicht mehr BLOCKIEREND, sondern:** die Mandantenklausel ist
UNBEWACHT (keine Zusicherung merkt ihre Entfernung — das bleibt richtig und
wird behoben), in Produktion heute aber durch einen zweiten, unabhängigen,
selbst studio-gesicherten Riegel gedeckt. Genau der zweite der beiden Gründe
für eine grüne Gegenprobe aus der CLAUDE.md — „die angenehmere Nachricht und
die gefährlichere Fehldeutung".

### Was die Probe stattdessen braucht — ZWEI Fremdzeilen, nicht eine

* **Fremdzeile A, realistisch:** fremdes Studio, EIGENE Kategorie des fremden
  Studios, `Feuerlöscher 7`, ohne Prüfprotokoll. Muss aktiv bleiben. Sie fällt
  nur, wenn BEIDE Klauseln weg sind — sie bewacht die Tiefenstaffelung als
  Ganzes.
* **Fremdzeile B, konstruiert:** fremdes Studio, aber die `kategorie_id` des
  EIGENEN Studios, `Feuerlöscher 8`, ohne Prüfprotokoll. Muss aktiv bleiben.
  Sie ist die einzige, die bei der R6-Mutation allein rot wird, weil sie den
  zweiten Riegel bewusst neutralisiert.

Fremdzeile B ist ein Zustand, den heute **kein Produktivweg herstellt** — das
gehört als Kommentar an die Fixtur, sonst räumt sie jemand als „unrealistisch"
wieder weg. Sie ist trotzdem richtig: der Fremdschlüssel verbietet sie nicht,
und sobald sich die Herkunft von `kategorie_id` an EINER der fünf Stellen
ändert, ist die Mandantenklausel der einzige verbliebene Riegel.

### Abnahme der Probe — drei Messungen, nicht eine

    unmutiert                                   GRÜN
    const alt = []                          (R1) ROT  — Fremdzeile A und B unberührt,
                                                       aber Eigenzeile 1 bleibt aktiv
    (g.studio_id=$1 OR TRUE)                (R6) ROT  — allein über Fremdzeile B
    beide WHERE-Klauseln entfernt                ROT  — auch über Fremdzeile A

Die dritte Messung ist die Positivkontrolle für Fremdzeile A: ohne sie wäre
nicht belegt, dass die realistische Zeile überhaupt fallen KANN.

---

# DER BAUAUFTRAG DER VIERTEN RUNDE — FASSUNG 1

**Sechs Punkte, EINE Runde.** Grundlage: R1–R6 oben plus die eigene
Nachmessung vom 22.09.2026 (R6 berichtigt). Arbeitsbaum `/home/user/gymdocu`,
Zweig `beitrag-ladebestand`, Kopf `9d3fc3b`.

Reihenfolge ist Absicht: Punkt 1 ist der einzige, der Produktionsverhalten
absichert statt es zu ändern; Punkt 5 ändert Produktionsverhalten und braucht
deshalb die eigene Gegenprobe zuerst.

---

## 1 — EINE Verhaltensprobe für die Feuerlöscher-Ablösung (schliesst R1 UND R6)

Neu in `test_feature_ladebestand_streng.js`, eigenes frisches Studio, KEIN
Anhängen an ein bestehendes.

**Fixtur, vier Zeilen, alle `name ~ '^Feuerlöscher [0-9]+$'`, alle `aktiv=1`:**

| Zeile | Studio | `kategorie_id` | Prüfprotokoll | Sollverhalten nach dem POST |
|---|---|---|---|---|
| `Feuerlöscher 1` | eigenes | eigene Brandschutz-Kategorie | nein | `aktiv=0`, Name steht auf der Ergebnisseite |
| `Feuerlöscher 2` | eigenes | eigene Brandschutz-Kategorie | **ja** | `aktiv=1`, Name steht NICHT auf der Seite |
| `Feuerlöscher 7` | **fremdes** | Kategorie des FREMDEN Studios | nein | `aktiv=1`, unberührt |
| `Feuerlöscher 8` | **fremdes** | Kategorie des **EIGENEN** Studios | nein | `aktiv=1`, unberührt |

`Feuerlöscher 8` ist ein Zustand, den heute **kein Produktivweg herstellt**
(alle fünf `INSERT INTO wartung_geraete` leiten `kategorie_id` studio-gesichert
her — Fundstellen im Abschnitt „EIGENE NACHMESSUNG 22.09.2026"). Der
Fremdschlüssel auf `wartung_kategorien(id)` ist einspaltig und verbietet sie
nicht. **Diese Begründung gehört als Kommentar an die Fixtur**, sonst räumt sie
der nächste als unrealistisch weg — sie ist die EINZIGE Zeile, die bei
aufgehobener Mandantenklausel allein fällt.

Das Prüfprotokoll für `Feuerlöscher 2` ist eine Zeile in `wartung_pruefungen`
mit `studio_id` und `geraet_id` der Zeile (der Helfer prüft
`NOT EXISTS (… WHERE p.studio_id=g.studio_id AND p.geraet_id=g.id)`).

**Ausgelöst wird die Ablösung durch einen POST mit
`antwort_feuerloescher=vorhanden`** (plus Stückzahl), also über den echten Weg,
nicht durch Direktaufruf des Helfers.

**Zusicherungen, je einzeln und benannt:**
1. `Feuerlöscher 1` → `aktiv=0` (DB-Abfrage, nicht HTML).
2. `Feuerlöscher 2` → `aktiv=1`.
3. `Feuerlöscher 7` → `aktiv=1`, und `studio_id` unverändert.
4. `Feuerlöscher 8` → `aktiv=1`.
5. Die Ergebnisseite nennt `Feuerlöscher 1` und nennt `Feuerlöscher 2` NICHT.

**Gegenproben — DREI, und alle drei wörtlich melden:**

    (a) unmutiert                                  → muss GRÜN sein
    (b) `const alt = await feuerloescher…(…)`  →  `const alt = []`
                                                   → muss ROT werden (Zus. 1 und 5)
    (c) `g.studio_id=$1`  →  `(g.studio_id=$1 OR TRUE)`
                                                   → muss ROT werden, und zwar
                                                     über Zusicherung 4
    (d) BEIDE WHERE-Klauseln (`g.studio_id=$1 AND g.kategorie_id=$2`) entfernt
                                                   → muss ROT werden, und zwar
                                                     AUCH über Zusicherung 3

(d) ist die Positivkontrolle für `Feuerlöscher 7`: ohne sie ist nicht belegt,
dass die realistische Fremdzeile überhaupt fallen KANN.

**Bei (c) ausdrücklich melden, WELCHE Zusicherung fällt.** Fällt sie über
Zusicherung 3 statt 4, stimmt die Fixtur nicht und der Befund ist ein anderer.

---

## 2 — R2: Titel-Wortlaut

`routes/admin/geraete.js`, `ladeBestandFehlerTitel()`:

    "Keine Feststellung gespeichert — Prüfplan nicht abgeglichen"
      →  "Keine neue Feststellung gespeichert — Prüfplan nicht abgeglichen"

Die Testkonstante `LEERER_POST_TITEL_NEU` zieht wörtlich mit. Der exakte
`<title>`-Vergleich über `titelAus(html)` bleibt, wie er ist.

**Gegenprobe:** alte Zeichenkette im Produktivcode wiederherstellen → der
Vergleich muss rot werden. (Er vergleicht exakt, `ALT` ist kein Teilstring von
`NEU` in dieser Richtung — das ist genau der Grund, warum er exakt vergleicht.)

---

## 3 — R3: `pruefeKeinFehlerseiten()` verbraucht den Körper nicht mehr

`await r.text()`  →  `await r.clone().text()`.

Kein Verhaltenswechsel heute (kein Aufrufer greift danach erneut zu), reine
Fallenbeseitigung. **Keine eigene Gegenprobe nötig** — die bestehenden
Aufrufer dieser Funktion sind der Nachweis, dass sie weiter trägt.

---

## 4 — R4: Der Bereichs-Riegel verbietet `db` statt einer Methodenliste

`test_feature_ladebestand_streng.js`, Punkt-3-Riegel. Heute verbotenes Muster:

    /\bdb\.(run|q|one)\(|\.query\(/

Neu: im kommentarbereinigten Bereich ist der Bezeichner **`db` selbst**
verboten — `/\bdb\b/`. Gemessen (20./21.09.2026): er kommt dort heute
**null mal** vor, bei sechs `schreibePruefplan(`-Aufrufen. Das deckt
Klammer- (`db["run"]`), Template- und `db.pool.query`-Schreibweise mit ab,
ohne Wettrüsten.

Die Fehlermeldung nennt den Ausweg: *jeder Datenbankzugriff im Bereich läuft
über `schreibePruefplan()`; reine Lesezugriffe werden wie
`feuerloescherOhneProtokoll()` AUSSERHALB des Bereichs definiert.*

Die Positivkontrolle (`abschnitt.includes('schreibePruefplan(')`) bleibt
unverändert — sie ist die Bremse gegen einen LEEREN Bereich, nicht der
Nachweis der einzelnen Wege.

**Gegenproben, beide wörtlich melden:**

    (a) `await schreibePruefplan("UPDATE wartung_geraete SET aktiv=0 …", …)`
        →  `await db["run"]("UPDATE wartung_geraete SET aktiv=0 …", …)`
        → muss ROT werden (wurde mit dem ALTEN Muster gemessen: EXIT 0, 20 PASS)
    (b) dieselbe Zeile  →  `await db.run(…)`
        → muss ebenfalls ROT werden (Nachweis, dass der alte Fall weiter trägt)

---

## 5 — R5: Der wertgleiche Notiz-UPDATE zählt nicht mehr mit

**Der Befund, gemessen (Abschnitt R5 oben):** ein zweiter POST mit identischer
Stückzahl meldet eine Teiländerung, weil PostgreSQL für ein wertgleiches
UPDATE `rowCount 1` zurückgibt.

**Behebung — NICHT die im R5-Abschnitt skizzierte `includes()`-Bedingung.**
Ich habe sie verworfen: sie sagt in JavaScript voraus, was die
`regexp_replace`-Ersetzung tun wird, und liegt in einem Fall daneben (stehen
durch eine Handbearbeitung ZWEI „Erfasster Bestand"-Zeilen in den Notizen,
ersetzt `regexp_replace` ohne `g`-Flag nur die erste — eine echte Änderung,
die `includes()` unterdrücken würde). Statt einer Vorhersage entscheidet die
Datenbank selbst:

    await schreibePruefplan(`
        WITH neu AS (
            SELECT id, notizen AS alt, CASE
                     WHEN notizen IS NULL THEN $1
                     WHEN notizen ~ 'Erfasster Bestand: [0-9]+ Stück'
                       THEN regexp_replace(notizen, 'Erfasster Bestand: [0-9]+ Stück', $1)
                     ELSE notizen || E'\\n' || $1 END AS text
              FROM wartung_geraete WHERE id=$2 AND studio_id=$3)
        UPDATE wartung_geraete g
           SET notizen = neu.text
          FROM neu
         WHERE g.id = neu.id AND g.studio_id = $3
           AND neu.text IS DISTINCT FROM neu.alt`,
        [g.notizZusatz, schonDa.id, req.studioId]);

Der `CASE`-Ausdruck steht weiterhin **genau einmal** da. `g.studio_id = $3`
bleibt im UPDATE stehen, obwohl die CTE bereits danach filtert — Prüfreihenfolge
Punkt 1, und eine Abfrage ohne `studio_id` in ihrer eigenen WHERE-Klausel wäre
für jeden Leser und jeden Wächter eine Lücke.

`holeOderLegeAn()` bleibt damit **unverändert** — kein zusätzliches
Rückgabefeld, kein breiterer Vertrag.

**Ein Kommentar daneben nennt den Grund**, sonst zieht der nächste die CTE als
„umständlich" wieder zurück: *ein wertgleiches UPDATE liefert in PostgreSQL
`rowCount 1`; der Zähler des Prüfplan-Abgleichs würde daraus eine Teiländerung
melden, die nicht stattgefunden hat.*

**Abnahme, drei Fälle, je frisches Studio, POST zweimal mit identischem Rumpf,
beim zweiten das strenge Lesen gestört (Aufbau wie in der R5-Messung):**

    A  antwort_rwa=vorhanden (kein notizZusatz)
       → unverändert: "keine Einträge"-Text, KEIN Teiländerungs-Text
    B  antwort_feuerloescher=vorhanden, anzahl=2 (beide Male 2)
       → NEU: "keine Einträge"-Text, KEIN Teiländerungs-Text
    C  antwort_feuerloescher: erst anzahl=2, dann anzahl=5
       → weiterhin Teiländerungs-Text, KEIN "keine Einträge"-Text

C ist die Positivkontrolle: ohne sie belegt B nur, dass der Zähler nicht mehr
erhöht — nicht, dass er es bei einer ECHTEN Änderung noch tut.

**Gegenprobe:** `AND neu.text IS DISTINCT FROM neu.alt` entfernen → Fall B muss
ROT werden, Fall C GRÜN bleiben. Beides wörtlich melden.

**Und die Frage aus der CLAUDE.md dazu beantworten, nicht überspringen:**
welche BESTEHENDE Zusicherung kann der neue Leerzustand (`rowCount 0`, wo
vorher immer 1 stand) ab jetzt erfüllen, ohne dass das Bewachte noch da ist?
Konkret zu prüfen sind die Zählstellen um `praefplanGeaendert` und die
Zusicherungen, die am „keine Einträge"-Text hängen.

---

## 6 — Die Fixtur-Grösse zieht mit

`ERWARTETE_AUFGABENANZAHL` und `terminAnzahlGesamt()` (N13) sind
Schnappschuss-Sollwerte. Punkt 1 legt vier zusätzliche `wartung_geraete`-Zeilen
an. **Vor dem Commit prüfen, ob eine dieser Zusicherungen dadurch verschoben
wird** — und wenn ja, den Sollwert NICHT blind nachziehen, sondern im Bericht
benennen, welcher Wert sich um wie viel ändert und warum das richtig ist.

---

## Abnahme insgesamt

1. `node --check` auf jede geänderte Datei.
2. Die Gegenproben aus Punkt 1 (vier), 2 (eine), 4 (zwei), 5 (eine) — **jede
   einzeln, jede wörtlich mit EXIT-Code und PASS/FAIL-Zahlen.**
3. Jede Mutation über ein Skript, das den Zielpfad als ARGUMENT nimmt, bei
   ungleich einer Fundstelle abbricht, den Marker `GEGENPROBE-`+`DEFEKT`
   schreibt und gegen eine vorher per `cp` angelegte Kopie mit `diff` EXIT 0
   zurückgenommen wird. **Rücknahme nie mit einem Testlauf verketten.**
4. `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"` — ohne Pipe, ohne
   äusseres `flock`.
5. Markerscan mit `--exclude-dir` auf dem PFAD, nicht per `grep -v`.
6. `git status` über ALLE Arbeitsbäume.

**Nicht committen.** Der Haupt-Agent liest den Diff, misst nach und committet.

---

## EIGENE NACHMESSUNG 22.09.2026 (zweite) — Punkt 4 hat eine Prosa-Lücke

Vor dem Bauauftrag habe ich die Tatsachenbehauptung aus Punkt 4 auf dem
heutigen Kopf `9d3fc3b` nachgemessen, mit derselben Bereinigung, die der Test
benutzt (`ohneAlleKommentare`, `test_feature_ladebestand_streng.js:462`):

    Bereich roh 8.863 Zeichen, bereinigt 3.772
    schreibePruefplan(   6
    \bdb\b               0

**Die Behauptung trägt.** Dabei ist aber eine Schwäche aufgefallen, die schon
HEUTE besteht und die Punkt 4 deutlich verschärfen würde.

`ohneAlleKommentare()` entfernt Blockkommentare vollständig, von den
`//`-Kommentaren aber nur die GANZZEILIGEN (`/^\s*\/\//`). Ein
Kommentar am ZEILENENDE bleibt stehen. Gemessen:

    Eingabe:  await schreibePruefplan(x);   // hier nie db.run() benutzen
    nach der Bereinigung: unverändert
    trifft das heutige Muster \bdb\.(run|q|one)\(|\.query\( :  JA
    trifft das vorgeschlagene \bdb\b                        :  JA

Das ist die Klasse „Tests dürfen nicht an Prosa scheitern", und der Kommentar
über `ohneAlleKommentare()` nennt genau diese Gefahr — er hat sie nur für
Blockkommentare geschlossen, nicht für nachgestellte Zeilenkommentare. Mit
`\bdb\b` genügt künftig JEDE nachgestellte Erwähnung des Wortes, um den Riegel
auszulösen; heute braucht es noch ein vollständiges Aufrufmuster.

**Punkt 4 bekommt deshalb einen Zusatz — Punkt 4b:**

`ohneAlleKommentare()` entfernt zusätzlich nachgestellte `//`-Kommentare, und
zwar mit einem Muster, das `://` NICHT trifft (sonst zerschneidet es URLs in
Zeichenketten):

    .split('\n').map((z) => z.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n')

Das kann nur Text ENTFERNEN, der hinter einem `//` steht; ein
`db.q("SELECT 'a//b'")` bleibt erkennbar, weil `db.q(` VOR dem `//` steht.

**Zwei Zusicherungen dazu, sonst ist es eine stille Verschärfung:**
1. Der bereinigte Bereich enthält weiterhin `schreibePruefplan(` (die
   bestehende Positivkontrolle — sie fängt eine zu gierige Bereinigung).
2. Eine eigene Gegenprobe über die FUNKTION selbst, nicht über den Bestand:
   `ohneAlleKommentare('await schreibePruefplan(x);   // nie db.run()')`
   darf `db` NICHT mehr enthalten, und
   `ohneAlleKommentare('const u = "https://x/y";')` MUSS `https://x/y`
   weiterhin enthalten. Beide wörtlich melden.

**Die Grenze bleibt und gehört in den Kommentar:** Das ist und bleibt ein
KONVENTIONSwächter. `const eigen = db; await eigen.run(…)` kommt weiterhin
durch, und das ist Absicht — ein textueller Wächter kann keinen Datenfluss
verfolgen. Was er leistet, ist, dass die naheliegende Schreibweise auffällt.

---

## EIGENE NACHMESSUNG 22.09.2026 (dritte) — Punkt 6 ist beantwortet, und Punkt 1 braucht eine Präzisierung

**Punkt 6 („verschieben vier zusätzliche Zeilen die Schnappschuss-Sollwerte?")
ist am Quelltext entschieden — NEIN, und zwar aus zwei unabhängigen Gründen:**

1. Beide Sollwerte kommen gar nicht aus der Datenbank. `erwarteteAufgabenanzahl()`
   (`test_feature_ladebestand_streng.js:120`) und `terminAnzahlGesamt()`
   (`:147`) laufen ausschliesslich über `ausstattung.FRAGEN` — eine statische
   Vorlage. Vier Gerätezeilen mehr ändern daran nichts.
2. Die Zeilenmengen, gegen die geprüft wird, sind doppelt eingegrenzt:
   `volleZeilenmenge()` (`:245-248`) und `aktiveNamen()` (`:185-189`) filtern
   `wg.studio_id = $1 AND k.name = $2`. Ein frisches Studio mit der
   BRANDSCHUTZ-Kategorie kann eine Ausstattungs-Prüfung nicht erreichen.

**Punkt 1 bekommt dadurch aber eine Präzisierung, die sonst eine Bau-Runde
gekostet hätte.** Beide Lesehelfer verbinden über

    JOIN wartung_kategorien k ON k.id = wg.kategorie_id AND k.studio_id = wg.studio_id

Die konstruierte **Fremdzeile B** (fremdes Studio, `kategorie_id` des EIGENEN
Studios) erfüllt diese Verbindung per Konstruktion NICHT — `k.studio_id` ist
das eigene, `wg.studio_id` das fremde. Wer ihren Zustand über
`volleZeilenmenge()` oder `aktiveNamen()` prüfen will, bekommt eine leere
Menge und liest daraus „ist nicht mehr da" statt „ist unangetastet".

**Vorgabe für Punkt 1:** Der Zustand ALLER vier Fixturzeilen wird über eine
DIREKTE Abfrage auf `wartung_geraete` nach `id` geprüft
(`SELECT aktiv, studio_id FROM wartung_geraete WHERE id = ANY($1)`), nicht
über die vorhandenen Lesehelfer. Die IDs stammen aus dem `RETURNING id` der
Fixtur-INSERTs.

Damit ist zugleich eine Falle der dritten Erscheinungsform gebannt („das
geprüfte Element ist strukturell geschützt"): eine Zusicherung über eine
Menge, die diese Zeile ohnehin nie enthalten kann, wäre unempfindlich — sie
bliebe grün, egal was mit der Zeile passiert.

---

## EIGENE NACHMESSUNG 22.09.2026 (vierte) — die CTE aus Punkt 5 ist gegen PostgreSQL gemessen

Ein Vorschlag im Auftragspapier ist eine BEHAUPTUNG, bis jemand ihn laufen
lässt. Gemessen gegen PostgreSQL 16 in einer Wegwerf-Datenbank
(`cte_probe_test`, danach gelöscht), zuerst mit einer plpgsql-Variablen, dann
noch einmal mit ECHTEN gebundenen Parametern über `PREPARE p(text,int,int)` —
`$3` kommt darin zweimal vor, genau wie im vorgeschlagenen Code.

**Erster Lauf, sieben Fälle, alle gegen `studio_id=1` angefragt:**

| Fall | Vorzustand | `rowCount` | danach |
|---|---|---|---|
| id1 | `… Erfasster Bestand: 2 Stück` | **0** | unverändert |
| id2 | `… Erfasster Bestand: 5 Stück` | 1 | auf 2 gesetzt |
| id3 | `NULL` | 1 | `Erfasster Bestand: 2 Stück` |
| id4 | Text ohne Bestandszeile | 1 | angehängt |
| id5 | **ZWEI** Bestandszeilen (9 und 2) | **1** | erste ersetzt, zweite bleibt |
| id6 | fremdes Studio (2) | **0** | unberührt |
| id99 | existiert nicht | 0 | — |

**Zweiter Lauf, gebundene Parameter:** A id1 wertgleich → `UPDATE 0`;
B id2 echte Änderung → `UPDATE 1`; C id6 mit fremdem Studio angefragt →
`UPDATE 0`; D id6 mit dem richtigen Studio, wertgleich → `UPDATE 0`;
E id6 mit dem richtigen Studio, echte Änderung → `UPDATE 1`. Fünf von fünf
wie vorhergesagt.

**Gegenproben, beide gemessen:**

    ohne "AND neu.text IS DISTINCT FROM neu.alt", wertgleich   rowCount=1
    heutiges schlichtes UPDATE, wertgleich                      rowCount=1   ← das IST R5

Die erste belegt, dass die Bedingung die Wirkung hat und nicht etwas anderes;
die zweite reproduziert den Befund R5 im Kleinen.

**Und id5 entscheidet die Designfrage aus Punkt 5 — gemessen statt
argumentiert.** Bei zwei Bestandszeilen ersetzt `regexp_replace` ohne
`g`-Flag nur die erste: es findet eine ECHTE Änderung statt, `rowCount=1` ist
richtig. Die im R5-Abschnitt skizzierte `includes()`-Bedingung hätte hier
unterdrückt, weil der Zieltext schon vorkam — sie hätte also eine
stattgefundene Änderung als „keine Änderung" gemeldet. Die CTE nicht.

**Was diese Messung NICHT hergibt:** sie sagt nichts über Sperren. Ob die CTE
eine andere Sperrreihenfolge nimmt als das heutige UPDATE, ist eine eigene
Frage — sie steht der Planprüfung als ausdrücklicher Prüfpunkt im Auftrag.

**Nebenbei, für die Prüfstand-Regeln:** die Probe scheiterte zuerst mit
`psql: Permission denied`, weil die SQL-Datei im Scratchpad unter
`/tmp/claude-0/…` lag — `drwx------`, für den Nutzer `postgres` nicht
durchquerbar. Unter `/workspace/…` mit `chmod 755` lief sie. Genau die Regel
aus der CLAUDE.md, und sie hat hier zum zweiten Mal zugeschlagen.

---

## EIGENE NACHMESSUNG 22.09.2026 (fünfte) — eine Zählung in der Suite ist NICHT nach Studio eingegrenzt

Die Fixtur aus Punkt 1 legt vier Gerätezeilen an, und die ganze Suite läuft
gegen DIESELBE Wegwerf-Datenbank. Also gefragt: zählt irgendein Test
`wartung_geraete`, ohne nach `studio_id` einzugrenzen?

Über alle Testdateien gesucht. Die meisten Treffer sind `WHERE id=$1` (über
den Primärschlüssel eingegrenzt, harmlos) oder mehrzeilige Abfragen, bei
denen `studio_id` in der nächsten Zeile steht. **Einer ist es nicht:**

    test_feature_zustaendigkeit.js:257  SELECT COUNT(*)::int AS c
                                          FROM wartung_geraete WHERE kategorie_id=$1
    test_feature_zustaendigkeit.js:263  dieselbe Zählung noch einmal

Sie zählt über eine KATEGORIE, nicht über ein Studio. Für sich genommen ist
das in Ordnung (Kategorien sind studio-eigen), aber sie ist genau die Form,
die von der konstruierten **Fremdzeile B** getroffen würde — eine Zeile in
einem fremden Studio, die auf eine fremde Kategorie zeigt.

**Vorgabe für Punkt 1, damit daraus kein Fehlalarm in einer ganz anderen
Datei wird:** Die Fixtur legt für BEIDE Studios FRISCHE Kategorien an und
verwendet keine bestehende `kategorie_id` wieder. Die `kategorie_id` der
Fremdzeile B ist die des eigenen, in diesem Test frisch angelegten Studios —
nie eine, die eine andere Testdatei schon benutzt.

**Und eine Sache, die der Ausführende dabei prüfen muss statt sie
anzunehmen:** ob `test_feature_zustaendigkeit.js` in der Suite VOR oder NACH
`test_feature_ladebestand_streng.js` läuft. Kommt sie danach und fände sie
eine fremde Zeile in ihrer Kategorie, wäre der Fehlalarm in der ANDEREN Datei
— dort, wo niemand ihn sucht. Mit frischen Kategorien kann das nicht
passieren; die Reihenfolge ist trotzdem zu nennen, nicht zu unterstellen.

---

# PLANPRÜFUNG DER VIERTEN RUNDE — Spur B (`deepseek-v4-pro`, Zusicherungsseite)

541 s, `finish_reason: stop`, 69.198 Eingabe- / 26.424 Ausgabe-Token (davon
24.173 Denken). Drei Befunde. **Jeder selbst nachgemessen.**

*Nebenbei eine Berichtigung an unserer eigenen Umrechnung:* ich hatte das
Bündel mit dem Faktor 3,71 auf 59k Token geschätzt, gezählt wurden 69.198 —
rund 17 % daneben. Für die Nähe zur Kontextgrenze ist das relevant.

## B1 (BLOCKIEREND, trägt) — meine Gegenproben (c) und (d) messen nichts

**Der Befund:** Die Deaktivierungsschleife lautet

    routes/admin/geraete.js:2819
      await schreibePruefplan("UPDATE wartung_geraete SET aktiv=0
                                WHERE studio_id=$1 AND id=$2", [req.studioId, a.id]);

`$1` ist IMMER `req.studioId`. Gibt der mutierte Helfer eine fremde Zeile
zurück, trifft dieses UPDATE sie nicht — `rowCount 0`, die Zeile bleibt aktiv,
und meine Zusicherungen 3 und 4 („Fremdzeile bleibt `aktiv=1`") bleiben GRÜN.
**Die Gegenproben (c) und (d) aus Punkt 1 wären wirkungslos gewesen.**

**Selbst nachgemessen** (Quelltext gelesen, Zeile 2817-2821): `[req.studioId,
a.id]` steht dort wörtlich, und `abgeloest.push(a.name)` prüft den `rowCount`
NICHT — in diesen vier Zeilen kommt `rowCount` **null mal** vor.

Das ist die **siebte** eigene Vorgabe dieses Beitrags, die beim Messen fällt.

### Und damit wird R6 SCHÄRFER, nicht schwächer — die Wirkung ist eine andere

Zwischen der Eingabe und dem Schaden stehen hier **DREI** Riegel, nicht zwei:

    1. g.studio_id=$1      in der SELECT des Helfers      ← die Klausel aus R6
    2. g.kategorie_id=$2   in derselben SELECT            ← selbst studio-gesichert
    3. studio_id=$1        im Deaktivierungs-UPDATE       ← NEU gefunden

Fällt Riegel 1 allein, wird die fremde Zeile GELESEN, ihr Name landet
unbedingt in `abgeloest` und erscheint auf der Ergebnisseite unter
„… wurden **deaktiviert, nicht gelöscht**: Feuerlöscher 8". Geschrieben wird
dank Riegel 3 nichts.

**Die Wirkung ist also keine mandantenübergreifende SCHREIBUNG, sondern eine
mandantenübergreifende PREISGABE** — Gerätenamen eines fremden Studios auf
unserer Ergebnisseite, samt einer Behauptung („deaktiviert"), die für diese
Zeile nicht stimmt. Das ist beobachtbar und damit bewachbar; mein
Probenentwurf hat nur an der falschen Stelle hingesehen.

### Der Behebungsvorschlag der Spur wird ABGELEHNT

Vorgeschlagen war, die Schleife auf `[a.id, a.studio_id]` umzustellen. **Das
wäre die Behebung, die schlimmer ist als der Fehler:** sie nimmt Riegel 3
heraus und macht aus der Preisgabe eine echte mandantenübergreifende
SCHREIBUNG, sobald Riegel 1 je fällt. Die Schleife bleibt wie sie ist.

### Punkt 1 in FASSUNG 2 — der Nachweis läuft über die SEITE, nicht über die Zeile

Fixtur unverändert (vier Zeilen, Tabelle oben). **Zusicherungen neu:**

1. `Feuerlöscher 1` → `aktiv=0` (direkte Abfrage über die id)
2. `Feuerlöscher 2` → `aktiv=1`
3. `Feuerlöscher 7` (fremdes Studio, fremde Kategorie) → `aktiv=1`
4. `Feuerlöscher 8` (fremdes Studio, EIGENE Kategorie) → `aktiv=1`
5. Die Ergebnisseite NENNT `Feuerlöscher 1`
6. Die Ergebnisseite nennt `Feuerlöscher 2` NICHT
7. **Die Ergebnisseite nennt `Feuerlöscher 7` NICHT und `Feuerlöscher 8`
   NICHT** ← das ist der R6-Melder

**Gegenproben, was JEWEILS fallen muss:**

    (a) unmutiert                        GRÜN
    (b) const alt = []                   ROT über 1 und 5
    (c) (g.studio_id=$1 OR TRUE)         ROT über 7, und zwar ÜBER
                                         "Feuerlöscher 8" — NICHT über 3/4
    (d) beide WHERE-Klauseln entfernt    ROT über 7, jetzt AUCH über
                                         "Feuerlöscher 7"

Dass (c) nur `Feuerlöscher 8` trifft und (d) beide, ist der Beweis, dass die
Fixtur die beiden Riegel wirklich trennt: `Feuerlöscher 7` trägt die Kategorie
des fremden Studios und fällt bei (c) noch an Riegel 2 heraus.

**Ausdrücklich in den Kommentar, sonst räumt sie der nächste weg:** die
Zusicherungen 3 und 4 können bei (c)/(d) NICHT rot werden — Riegel 3
verhindert jede Schreibung. Sie sind der Rückhalt gegen eine künftige
Änderung an der Deaktivierungsschleife, nicht der R6-Melder.

## B2 (trägt zur HÄLFTE) — `\bdb\b` ist zu breit und zu schmal

**Die „zu schmal"-Hälfte trägt** (Alias: `const eigen = db;` ausserhalb des
Bereichs, dann `eigen.run(…)` darin) — sie steht allerdings bereits als
ausdrückliche Grenze in Punkt 4. Gemessen: `await eigen.run(x)` trifft
`\bdb\b` nicht.

**Die „zu breit"-Hälfte trägt in der gemeldeten Form NICHT.** Die
vorgeschlagene Nachmessung war `const dbHinweis = 'kein Zugriff';`.
Nachgemessen, sieben Fälle:

    const dbHinweis = 1;          \bdb\b trifft NICHT
    const db_hinweis = 1;         \bdb\b trifft NICHT
    const x='kein db Zugriff';    \bdb\b trifft
    await db.run(x);              \bdb\b trifft
    await db["run"](x);           \bdb\b trifft
    const eigen=db;               \bdb\b trifft
    await eigen.run(x);           \bdb\b trifft NICHT

`\b` verlangt eine Wortgrenze; `dbHinweis` und `db_hinweis` haben keine. Zu
breit ist das Muster nur gegenüber dem ALLEINSTEHENDEN Wort in Prosa oder
Zeichenketten — und genau das ist mein eigener Punkt 4b, der es schliesst.

**Der Gegenvorschlag `\bdb\s*(\.|\[)` wird ABGELEHNT, gemessen:**

    Zeile                      \bdb\b   \bdb\s*[.[]
    await db.run(x);             JA        JA
    await db["run"](x);          JA        JA
    await db.pool.query(x);      JA        JA
    const eigen = db;            JA        —     ← der Unterschied
    await eigen.run(x);          —         —

Das engere Muster übersieht die Alias-BILDUNG im Bereich. Da die
Alias-Schwäche der einzige verbliebene Umgehungsweg ist, wäre es ein Tausch
der einzigen Stelle, an der der Riegel ihn noch sehen könnte. **`\bdb\b`
bleibt, zusammen mit Punkt 4b.**

## B3 (Beobachtung, bestätigt meine eigene Messung)

Die Spur beantwortet die beiden Arbeitsfragen aus Punkt 5 und 6 unabhängig
so, wie ich sie am 22.09. selbst gemessen habe: keine bestehende Zusicherung
wird durch den neuen Leerzustand fälschlich erfüllt, und keine verschiebt
sich durch vier zusätzliche Zeilen in einem frischen Studio. **Sie hat dabei
die eine nicht studio-gesicherte Zählung in `test_feature_zustaendigkeit.js`
NICHT gesehen** — sie hatte diese Datei nicht im Bündel. Das ist kein
Versäumnis der Spur, sondern eine Eigenschaft des Bündels, und der Grund,
warum verschiedene Bündel gefahren werden.

## Prüfgrenze, die die Spur selbst nennt

Sie hatte `feuerloescherOhneProtokoll()` nicht im Bündel (nur den
Routenausschnitt) und schreibt ausdrücklich, ihr Befund B1 hinge daran, wie
der Helfer aussieht. **Das war richtig und ehrlich — und der Befund trägt
trotzdem**, weil er an der Schleife hängt, die sie sehr wohl sah.

---

## EIGENE NACHMESSUNG 22.09.2026 (sechste) — Fixtur-Einzelheiten, am Quelltext geprüft

Ankerstellen über den Kundschafter geholt, die strittige Angabe selbst
nachgezählt. Was für Punkt 1 in FASSUNG 2 bindend ist:

**Die Bereichsmarken.** Der Kundschafter meldete eine in sich widersprüchliche
Häufigkeitsangabe. Selbst gezählt: `PRUEFPLAN_SCHREIBBEREICH_BEGINN` **1×**
(Z. 2765), `..._ENDE` **1×** (Z. 2901), die Zeichenkette
`PRUEFPLAN_SCHREIBBEREICH` insgesamt **3×** — das dritte Vorkommen ist Prosa
in Z. 2192, also VOR dem Bereich und ohne Suffix. Der `indexOf` trifft damit
richtig.

**`provisionStudio()` legt die Brandschutz-Kategorie NICHT an.** Gemessen
(`core/db.js:2495-2500`): geseedet werden genau vier — Cardio, Kraftgeräte,
Leitern, Automaten. `"Sicherheit & Brandschutz"`
(`core/brandschutz-vorlage.js:52`) entsteht erst im POST selbst
(`routes/admin/geraete.js:2637-2641`).

Folge für die Fixtur: die Kategorie des **fremden** Studios muss der Test
ausdrücklich anlegen, sonst gibt es für `Feuerlöscher 7` keine passende
`kategorie_id`. Sie ist dabei automatisch frisch (neues Studio → neue id), die
Auflage aus der fünften Nachmessung ist damit von selbst erfüllt.

**Das frische Studio** entsteht über `neuesStudio(praefix)`
(`test_feature_ladebestand_streng.js:342-346`): `db.createStudio(...)` plus
`db.provisionStudio(s)`.

**Der auslösende POST** ist in Z. 813-823 vorgezeichnet — `alleVorhanden` mit
`antwort_feuerloescher: 'vorhanden'`, `anzahl_feuerloescher: '2'`. Die Fixtur
benutzt denselben Weg, nicht einen Direktaufruf des Helfers.

**Zu Punkt 2, damit es niemand „vereinfacht":** `LEERER_POST_TITEL_ALT`
(Z. 377) ist auch nach der Umbenennung noch ein TEILSTRING von
`LEERER_POST_TITEL_NEU` — „Keine neue **Feststellung gespeichert — Prüfplan
nicht abgeglichen**". Der exakte `<title>`-Vergleich über `titelAus()`
(Z. 421-424) bleibt deshalb zwingend; ein `includes()` wäre hier grün aus dem
falschen Grund.

**Zu Punkt 3:** `pruefeKeinFehlerseiten()` (Z. 79-86) endet mit `return html;`.
Die Umstellung auf `r.clone().text()` ändert daran nichts — der Rückgabewert
bleibt derselbe Text.

---

# DER BAUAUFTRAG DER VIERTEN RUNDE — FASSUNG 2 (MASSGEBLICH)

**FASSUNG 1 weiter oben ist ÜBERHOLT.** Sie hatte zwei Fehler, die beim
Messen gefallen sind: der Probenentwurf zu R6 hätte nichts gemessen (eigene
Nachmessung, erste), und die Gegenproben (c)/(d) wären an der
studio-gesicherten Deaktivierungsschleife hängengeblieben (Planprüfung Spur B,
selbst nachgemessen). Was hier steht, gilt.

Arbeitsbaum `/home/user/gymdocu`, Zweig `beitrag-ladebestand`, Kopf `9d3fc3b`.
**Nicht committen** — der Haupt-Agent liest den Diff, misst nach, committet.

---

## 1 — Verhaltensprobe für die Feuerlöscher-Ablösung (schliesst R1 UND R6)

Neu in `test_feature_ladebestand_streng.js`, in einem EIGENEN Abschnitt mit
ZWEI frischen Studios über `neuesStudio(praefix)` (Z. 342-346).

### Was hier wirklich bewacht wird — bitte vor dem Bauen lesen

Zwischen einer aufgehobenen Mandantenklausel im Helfer und einem Schaden
stehen **DREI** Riegel, alle selbst nachgemessen:

    1. g.studio_id=$1     in der SELECT von feuerloescherOhneProtokoll()  (Z. 2201)
    2. g.kategorie_id=$2  in derselben SELECT — selbst studio-gesichert
    3. studio_id=$1       im Deaktivierungs-UPDATE                        (Z. 2819)

Riegel 3 bindet IMMER `req.studioId`. Eine fremde Zeile wird deshalb **nie
geschrieben** — aber ihr Name landet unbedingt in `abgeloest`
(`abgeloest.push(a.name)` fragt den `rowCount` nicht ab, nachgezählt: null
Vorkommen von `rowCount` in Z. 2817-2821) und erscheint auf der Ergebnisseite
(Z. 3135-3143) unter „… wurden **deaktiviert, nicht gelöscht**: …".

**Die Wirkung ist also eine mandantenübergreifende PREISGABE von Gerätenamen,
keine Schreibung.** Der Nachweis läuft deshalb über die SEITE, nicht über den
Zeilenzustand.

### Fixtur — vier Gerätezeilen, alle `aktiv=1`, alle `name ~ '^Feuerlöscher [0-9]+$'`

| Zeile | Studio | `kategorie_id` | Prüfprotokoll |
|---|---|---|---|
| `Feuerlöscher 1` | eigenes | Brandschutz-Kategorie des EIGENEN Studios | nein |
| `Feuerlöscher 2` | eigenes | Brandschutz-Kategorie des EIGENEN Studios | **ja** |
| `Feuerlöscher 7` | **fremdes** | Brandschutz-Kategorie des FREMDEN Studios | nein |
| `Feuerlöscher 8` | **fremdes** | Brandschutz-Kategorie des **EIGENEN** Studios | nein |

Drei Dinge dazu, alle gemessen und alle nötig:

* **Die Brandschutz-Kategorie muss der Test selbst anlegen.**
  `provisionStudio()` seedet nur Cardio, Kraftgeräte, Leitern, Automaten
  (`core/db.js:2495-2500`); `"Sicherheit & Brandschutz"`
  (`core/brandschutz-vorlage.js:52`) entsteht sonst erst im POST. Für das
  EIGENE Studio genügt es, sie vom POST anlegen zu lassen und ihre id danach
  zu lesen; für das FREMDE Studio legt der Test sie ausdrücklich an.
* **`Feuerlöscher 8` ist ein Zustand, den heute kein Produktivweg herstellt.**
  Alle fünf `INSERT INTO wartung_geraete` leiten `kategorie_id`
  studio-gesichert her; der Fremdschlüssel ist aber einspaltig
  (`core/db.js:874`) und verbietet die Zeile nicht. **Das gehört als Kommentar
  an die Fixtur** — sie ist die EINZIGE, die bei aufgehobener Mandantenklausel
  allein anschlägt, und sonst räumt sie der nächste als unrealistisch weg.
* Das Prüfprotokoll für `Feuerlöscher 2` ist eine Zeile in `wartung_pruefungen`
  mit `studio_id` und `geraet_id` dieser Zeile — der Helfer prüft
  `NOT EXISTS (… WHERE p.studio_id=g.studio_id AND p.geraet_id=g.id)`.
* **Der Abschnitt räumt seine Fixtur am Ende wieder ab**, und zwar in dieser
  Reihenfolge: erst die `wartung_pruefungen`-Zeile (der Fremdschlüssel ist
  `ON DELETE RESTRICT`, Migration 0056), dann die vier Gerätezeilen, dann die
  Kategorien und Studios. Grund: `Feuerlöscher 8` ist die erste Zeile im
  Bestand, deren `kategorie_id` zu einem ANDEREN Studio gehört als ihre
  `studio_id`, und die Suite fährt alle Dateien gegen DIESELBE Wegwerf-DB.
  **Heute stört das nichts** — gemessen: von den acht Testdateien mit
  `JOIN wartung_kategorien` benutzt KEINE `k.studio_id <> wg.studio_id` als
  Unreinheits-Kriterium, alle filtern auf Gleichheit und schliessen die Zeile
  damit aus. Es ist eine benannte Falle für den nächsten, kein heutiger
  Defekt; das Abräumen kostet fünf Zeilen und nimmt sie weg.

### Ausgelöst wird über den ECHTEN Weg

Ein POST auf `/admin/geraetewartung/brandschutz` mit
`antwort_feuerloescher: 'vorhanden'`, `anzahl_feuerloescher: '2'` — Vorbild ist
`alleVorhanden` in Z. 813-823. Kein Direktaufruf des Helfers.

### Zusicherungen — sieben, jede einzeln benannt

Der Zustand ALLER vier Fixturzeilen wird über eine **direkte Abfrage nach id**
geprüft (`SELECT aktiv, studio_id FROM wartung_geraete WHERE id = ANY($1)`),
NICHT über `volleZeilenmenge()` oder `aktiveNamen()`. Grund, gemessen: beide
verbinden mit `JOIN wartung_kategorien k ON k.id = wg.kategorie_id AND
k.studio_id = wg.studio_id` — `Feuerlöscher 8` erfüllt das per Konstruktion
nie, eine Zusicherung über diese Menge wäre unempfindlich.

1. `Feuerlöscher 1` → `aktiv=0`
2. `Feuerlöscher 2` → `aktiv=1`
3. `Feuerlöscher 7` → `aktiv=1`, `studio_id` unverändert
4. `Feuerlöscher 8` → `aktiv=1`, `studio_id` unverändert
5. Die Ergebnisseite NENNT `Feuerlöscher 1`
6. Die Ergebnisseite nennt `Feuerlöscher 2` NICHT
7. Die Ergebnisseite nennt `Feuerlöscher 7` NICHT **und** `Feuerlöscher 8`
   NICHT ← **der R6-Melder**

**Zusicherung 5 ist die Positivkontrolle für 7.** Ohne sie wäre 7 vakuos
erfüllt, sobald der `abgeloest`-Block gar nicht gerendert wird.

Beim Suchen im HTML mit einer Ziffern-Grenze arbeiten
(`/Feuerlöscher 1(?![0-9])/`), sonst trifft „Feuerlöscher 1" auch ein
künftiges „Feuerlöscher 10".

### Gegenproben — VIER, jede einzeln, jede wörtlich mit EXIT und PASS/FAIL

    (a) unmutiert                        muss GRÜN sein
    (b) const alt = await feuerloescher…(…)  →  const alt = []
                                         muss ROT werden, über 1 UND 5
    (c) g.studio_id=$1  →  (g.studio_id=$1 OR TRUE)
                                         muss ROT werden über 7, und zwar
                                         ausschliesslich wegen "Feuerlöscher 8"
    (d) beide WHERE-Klauseln entfernt (g.studio_id=$1 AND g.kategorie_id=$2)
                                         muss ROT werden über 7, jetzt AUCH
                                         wegen "Feuerlöscher 7"

**Bei (c) und (d) ausdrücklich melden, WELCHER Name die Zusicherung reissen
lässt.** Trifft (c) auch `Feuerlöscher 7`, stimmt die Fixtur nicht — dann trägt
`Feuerlöscher 7` versehentlich die Kategorie des eigenen Studios.

(d) ist die Positivkontrolle für `Feuerlöscher 7`: ohne sie ist nicht belegt,
dass die realistische Fremdzeile überhaupt anschlagen KANN.

**Die Zusicherungen 2, 3 und 4 können bei (c)/(d) NICHT rot werden** — Riegel 3
verhindert jede Schreibung. Das gehört als Kommentar daneben, sonst hält der
nächste sie für nutzlos. Sie sind der Rückhalt gegen eine künftige Änderung an
der Deaktivierungsschleife.

**Die Deaktivierungsschleife selbst wird NICHT angefasst.** Ein Vorschlag aus
der Prüfung lautete, sie auf `[a.id, a.studio_id]` umzustellen — das nähme
Riegel 3 heraus und machte aus der Preisgabe eine echte mandantenübergreifende
Schreibung. Abgelehnt.

---

## 2 — R2: Titel-Wortlaut

`routes/admin/geraete.js:2023-2027`, `ladeBestandFehlerTitel()`, NUR der
`else`-Zweig:

    "Keine Feststellung gespeichert — Prüfplan nicht abgeglichen"
      →  "Keine neue Feststellung gespeichert — Prüfplan nicht abgeglichen"

`LEERER_POST_TITEL_NEU` (`test_feature_ladebestand_streng.js:378`) zieht
wörtlich mit.

**Der exakte `<title>`-Vergleich über `titelAus()` (Z. 421-424) bleibt
zwingend und wird NICHT zu einem `includes()` vereinfacht:**
`LEERER_POST_TITEL_ALT` (Z. 377) ist auch nach der Umbenennung noch ein
Teilstring der neuen Zeichenkette — „Keine neue *Feststellung gespeichert —
Prüfplan nicht abgeglichen*".

**Gegenprobe:** alte Zeichenkette im Produktivcode wiederherstellen → der
Vergleich muss rot werden.

---

## 3 — R3: `pruefeKeinFehlerseiten()` verbraucht den Körper nicht mehr

`test_feature_ladebestand_streng.js:80`: `await r.text()` → `await
r.clone().text()`. Die Funktion endet weiterhin mit `return html;`, der
Rückgabewert ändert sich nicht.

Kein Verhaltenswechsel heute, reine Fallenbeseitigung. Keine eigene Gegenprobe
nötig — die bestehenden Aufrufer sind der Nachweis, dass sie weiter trägt.

---

## 4 — R4: Der Bereichs-Riegel verbietet den Bezeichner `db`

`test_feature_ladebestand_streng.js:499`:

    /\bdb\.(run|q|one)\(|\.query\(/   →   /\bdb\b/

Gemessen auf `9d3fc3b`: der kommentarbereinigte Bereich (3.772 Zeichen)
enthält **6×** `schreibePruefplan(` und **0×** `db`.

**Warum nicht das engere `/\bdb\s*[.[]/`, das eine Prüfspur vorschlug** —
gemessen, fünf Fälle:

    Zeile                      \bdb\b   \bdb\s*[.[]
    await db.run(x);             JA        JA
    await db["run"](x);          JA        JA
    await db.pool.query(x);      JA        JA
    const eigen = db;            JA        —
    await eigen.run(x);          —         —

Das engere Muster übersieht die Alias-BILDUNG im Bereich — also genau die
Stelle, an der der Riegel den einzigen verbliebenen Umgehungsweg noch sehen
könnte.

Die Fehlermeldung nennt den Ausweg: *jeder Datenbankzugriff im Bereich läuft
über `schreibePruefplan()`; reine Lesezugriffe werden wie
`feuerloescherOhneProtokoll()` AUSSERHALB des Bereichs definiert.*

Die Positivkontrolle `abschnitt.includes('schreibePruefplan(')` (Z. 497) bleibt
unverändert.

**Die Grenze gehört in den Kommentar:** Das ist und bleibt ein
KONVENTIONSwächter. `const eigen = db;` AUSSERHALB des Bereichs, dann
`eigen.run(…)` darin, kommt weiterhin durch — ein textueller Wächter kann
keinen Datenfluss verfolgen.

**Gegenproben, beide wörtlich melden:**

    (a) ein schreibePruefplan(…)  →  db["run"](…)      muss ROT werden
        (mit dem ALTEN Muster gemessen: EXIT 0, 20 PASS — er sah sie nicht)
    (b) dieselbe Zeile           →  db.run(…)          muss ebenfalls ROT werden

---

## 4b — Die Bereinigung entfernt auch NACHGESTELLTE Kommentare

`ohneAlleKommentare()` (Z. 462-465) entfernt Blockkommentare vollständig, von
den `//`-Kommentaren aber nur die GANZZEILIGEN. **Gemessen:**

    Eingabe:  await schreibePruefplan(x);   // hier nie db.run() benutzen
    nach der heutigen Bereinigung: unverändert
    trifft das heutige Muster:   JA        trifft \bdb\b:  JA

Die Lücke besteht also schon heute; mit `\bdb\b` genügt künftig jede
nachgestellte Erwähnung des Wortes. Das ist die Klasse „Tests dürfen nicht an
Prosa scheitern", und sie führt zum Abschalten statt zum Lesen.

Die Bereinigung bekommt deshalb zusätzlich:

    .split('\n').map((z) => z.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n')

Das Muster trifft `://` bewusst NICHT, sonst zerschneidet es URLs. Es kann nur
Text HINTER einem `//` entfernen; `db.q("SELECT 'a//b'")` bleibt erkennbar,
weil `db.q(` davor steht.

**Zwei Gegenproben an der FUNKTION selbst, beide wörtlich melden:**

    ohneAlleKommentare('await schreibePruefplan(x);   // nie db.run()')
        darf 'db' NICHT mehr enthalten
    ohneAlleKommentare('const u = "https://x/y";')
        MUSS 'https://x/y' weiterhin enthalten

Die vorhandene Positivkontrolle (`includes('schreibePruefplan(')`) fängt
zusätzlich eine zu gierige Bereinigung.

---

## 5 — R5: Der wertgleiche Notiz-UPDATE zählt nicht mehr mit

`routes/admin/geraete.js:2879-2888`. **Die im R5-Abschnitt skizzierte
`includes()`-Bedingung wird NICHT gebaut** — sie sagt in JavaScript voraus, was
`regexp_replace` tun wird, und liegt bei zwei Bestandszeilen daneben (gemessen,
s. unten). Stattdessen entscheidet die Datenbank selbst:

    await schreibePruefplan(`
        WITH gesperrt AS (
            SELECT id, notizen FROM wartung_geraete
             WHERE id=$2 AND studio_id=$3 FOR UPDATE),
        neu AS (
            SELECT id, notizen AS alt, CASE
                     WHEN notizen IS NULL THEN $1
                     WHEN notizen ~ 'Erfasster Bestand: [0-9]+ Stück'
                       THEN regexp_replace(notizen, 'Erfasster Bestand: [0-9]+ Stück', $1)
                     ELSE notizen || E'\\n' || $1 END AS text
              FROM gesperrt)
        UPDATE wartung_geraete g
           SET notizen = neu.text
          FROM neu
         WHERE g.id = neu.id AND g.studio_id = $3
           AND neu.text IS DISTINCT FROM neu.alt`,
        [g.notizZusatz, schonDa.id, req.studioId]);

**`FOR UPDATE` in der ersten CTE ist NICHT schmückendes Beiwerk — ohne sie
löscht diese Behebung Daten.** Gemessen, s. den Abschnitt „Planprüfung Spur A"
weiter unten: eine CTE ohne Sperre rechnet auf dem Statement-Schnappschuss und
überschreibt einen nebenläufig committeten Fremdschreiber. Der Fremdschreiber
ist real erreichbar — `/geraetewartung/geraet/bearbeiten/:id`
(`routes/admin/geraete.js:6524`) schreibt `notizen` in Z. 6633. Diese
Begründung gehört als Kommentar an die Zeile, sonst räumt sie der nächste als
überflüssig weg.

Der `CASE` steht weiterhin an genau EINEM Ort. `g.studio_id = $3` bleibt im
UPDATE, obwohl die CTE schon filtert — Prüfreihenfolge Punkt 1, und eine
Abfrage ohne `studio_id` in der eigenen WHERE wäre für jeden Leser und jeden
Wächter eine Lücke. `holeOderLegeAn()` bleibt UNVERÄNDERT.

**Diese CTE ist gegen PostgreSQL 16 gemessen** (Wegwerf-DB, danach gelöscht),
in der Fassung MIT `FOR UPDATE`, über `PREPARE p3(text,int,int)` mit echten
gebundenen Parametern:

    id1 wertgleich                      rowCount 0   unverändert
    id2 echte Änderung 5 → 2            rowCount 1
    id3 notizen IS NULL                 rowCount 1
    id4 Text ohne Bestandszeile         rowCount 1   angehängt
    id5 ZWEI Bestandszeilen (9 und 2)   rowCount 1   erste ersetzt
    id6 fremdes Studio                  rowCount 0
    id99 existiert nicht                rowCount 0

`id5` ist der Grund gegen `includes()`: dort findet eine ECHTE Änderung statt,
`includes()` hätte sie unterdrückt.

**Ein Kommentar nennt den Grund**, sonst zieht der nächste die CTE als
„umständlich" zurück: *ein wertgleiches UPDATE liefert in PostgreSQL
`rowCount 1`; der Zähler des Prüfplan-Abgleichs meldete daraus eine
Teiländerung, die nicht stattgefunden hat.*

**Abnahme — drei Fälle, je frisches Studio. A und B mit IDENTISCHEM Rumpf,
C mit GEÄNDERTER Stückzahl; in allen drei Fällen wird beim ZWEITEN POST das
strenge Lesen gestört** (ohne Störung gäbe es keine Fehlerseite und nichts zu
prüfen — die frühere Fassung dieses Satzes widersprach ihrem eigenen dritten
Fall):

    A  antwort_rwa=vorhanden (kein notizZusatz)
       unverändert: "keine Einträge"-Text, KEIN Teiländerungs-Text
    B  antwort_feuerloescher, anzahl=2 beide Male
       NEU: "keine Einträge"-Text, KEIN Teiländerungs-Text
    C  antwort_feuerloescher, erst anzahl=2, dann anzahl=5
       weiterhin Teiländerungs-Text, KEIN "keine Einträge"-Text

C ist die Positivkontrolle: ohne sie belegt B nur, dass der Zähler nicht mehr
erhöht — nicht, dass er es bei einer echten Änderung noch tut.

**Gegenproben, ZWEI, beide wörtlich melden:**

    (a) `AND neu.text IS DISTINCT FROM neu.alt` entfernen
        → B muss ROT werden, C GRÜN bleiben.
    (b) `FOR UPDATE` aus der ersten CTE entfernen
        → die Suite bleibt GRÜN. Das ist KEIN Befund gegen den Test, sondern
          die gemessene Tatsache, dass diese Zeile eine NEBENLÄUFIGKEITS-
          eigenschaft schützt, die keine Zusicherung der Suite herstellt.
          **Melden, nicht überspringen** — und im Kommentar an der Zeile
          festhalten, dass sie unbewacht ist.

**Und die Pflichtfrage beantworten, nicht überspringen:** welche BESTEHENDE
Zusicherung kann der neue Leerzustand (`rowCount 0`, wo vorher immer 1 stand)
ab jetzt erfüllen, ohne dass das Bewachte noch da ist? Die Zählstellen um
`praefplanGeaendert` und alles, was am „keine Einträge"-Text hängt, einzeln
durchgehen und das Ergebnis melden — auch wenn es „keine" lautet.

---

## 6 — Die Schnappschuss-Sollwerte

**Bereits beantwortet, NICHT erneut untersuchen:** `ERWARTETE_AUFGABENANZAHL`
(Z. 137) und `terminAnzahlGesamt()` (Z. 147) speisen sich aus
`core/ausstattung.js#FRAGEN`, also aus einer statischen Vorlage; und
`volleZeilenmenge()` (Z. 245-248) wie `aktiveNamen()` (Z. 185-189) filtern
`wg.studio_id = $1 AND k.name = $2`. Vier Zeilen in frischen Studios unter der
Brandschutz-Kategorie verschieben nichts.

**Was trotzdem zu tun ist:** nach dem Bau die volle Suite fahren und melden,
ob sich irgendein Sollwert bewegt hat. Wenn ja — NICHT nachziehen, sondern
melden, welcher, um wie viel und warum.

---

## Abnahme insgesamt

1. `node --check` auf jede geänderte Datei.
2. Die Gegenproben aus Punkt 1 (vier), 2 (eine), 4 (zwei), 4b (zwei), 5 (eine)
   — **jede einzeln, jede wörtlich mit EXIT-Code und PASS/FAIL-Zahlen.**
3. Jede Mutation über ein Skript, das den Zielpfad als ARGUMENT nimmt, bei
   ungleich einer Fundstelle abbricht, den Marker `GEGENPROBE-`+`DEFEKT`
   schreibt, `node --check` fährt und gegen eine vorher per `cp` angelegte
   Kopie mit `diff` EXIT 0 zurückgenommen wird. **Rücknahme NIE mit einem
   Testlauf verketten** — der PreToolUse-Wächter lehnt den GANZEN Befehl ab,
   und dann steht der Defekt noch, während die Meldung „zurückgenommen" lautet.
4. `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"` — ohne Pipe, ohne
   äusseres `flock`.
5. Markerscan mit `--exclude-dir` auf dem PFAD, nicht per `grep -v`.
6. `git status` über ALLE Arbeitsbäume.

---

# PLANPRÜFUNG DER VIERTEN RUNDE — Spur A (`kimi-k3`, Produktionsseite)

1011 s, `finish_reason: stop`, 69.675 Eingabe- / 31.729 Ausgabe-Token (davon
27.234 Denken). Vier Befunde. **Jeder selbst nachgemessen.**

## A1 — dieselbe Klasse wie B1, unabhängig gefunden

Spur A zählt ebenfalls den DRITTEN Riegel (`studio_id=$1` im
Deaktivierungs-UPDATE, Z. 2819) und kommt unabhängig auf dieselbe Folge: die
Gegenproben der FASSUNG 1 wären grün geblieben, der Nachweis muss über die
Seite laufen. **Zwei verschiedene Modelle, zwei verschiedene Bündel, derselbe
Befund** — bei der Betreiber-Entscheidung vom 20.09. („verschiedene Bündel")
ist das der Fall, der laut Messung selten ist; hier lag er vor.

FASSUNG 2 setzt das bereits um. Spur A ergänzt eine Warnung, die
hineingehört und jetzt drinsteht: **`abgeloest.push` darf NICHT an
`rowCount > 0` gehängt werden**, ohne die Zusicherung 7 umzubauen — das machte
die Seite wahrheitsgemässer und den Wächter blind. Genau die Klasse „eine
Behebung kann Wächter BLIND machen".

## A2 (NEU, BLOCKIEREND, gemessen) — meine CTE hätte DATEN GELÖSCHT

**Der Befund:** Eine CTE liest auf dem Statement-Schnappschuss. Kommt ein
nebenläufiger Schreiber derselben Zeile dazwischen, wertet PostgreSQL per
EvalPlanQual zwar die Verbindungsbedingung auf der NEUESTEN Zeilenversion neu
aus — die in der CTE BERECHNETEN Werte (`neu.text`, `neu.alt`) bleiben aber
die des alten Schnappschusses. Das heutige schlichte UPDATE rechnet den `CASE`
dagegen in der SET-Klausel, und die wird unter EPQ auf der neuen Zeilenversion
neu ausgewertet.

**Selbst gemessen**, PostgreSQL 16, Wegwerf-DB, drei Varianten, jeweils mit
einem Fremdschreiber, der die Zeile drei Sekunden gesperrt hält und dann
committet (`BEGIN; UPDATE … SET notizen='Admin-Notiz des Betreibers'; pg_sleep(3);
COMMIT;`):

| Variante | Endzustand der Zeile |
|---|---|
| **v1 — heutiges schlichtes UPDATE** | `Admin-Notiz des Betreibers / Erfasster Bestand: 2 Stück` |
| **v2 — meine CTE aus FASSUNG 2** | `Grundlage X / Erfasster Bestand: 2 Stück` — **die Admin-Notiz ist WEG** |
| **v3 — CTE mit `FOR UPDATE`** | `Admin-Notiz des Betreibers / Erfasster Bestand: 2 Stück` |

**Und der Fremdschreiber ist real erreichbar, nicht theoretisch:**
`routes/admin/geraete.js:6524` (`POST /geraetewartung/geraet/bearbeiten/:id`)
schreibt `notizen` in Z. 6633. Ein Admin, der die Notiz eines Geräts
bearbeitet, während der Brandschutz-Assistent läuft, hätte seine Eingabe
verloren.

**Das ist wörtlich die Klasse aus der CLAUDE.md: „Bei dieser Klasse ist die
BEHEBUNG gefährlicher als der Fehler."** Mein Punkt 5 hätte einen falschen
Satz auf einer Fehlerseite gegen echten Datenverlust getauscht. **Achte eigene
Vorgabe dieses Beitrags, die beim Messen fällt** — und die erste, bei der das
Messen nicht Aufwand gespart, sondern Schaden verhindert hat.

**FASSUNG 2 Punkt 5 ist auf v3 umgestellt.** Die vollständige Fallmatrix ist
mit `FOR UPDATE` nachgemessen und identisch mit v2: wertgleich `UPDATE 0`,
echte Änderung `1`, NULL-Zweig `1`, Anhang-Zweig `1`, zwei Bestandszeilen `1`,
fremdes Studio `0`, nicht vorhandene Zeile `0`.

**Keine neue Sperr-Reihenfolge:** die Zeilensperre, die `FOR UPDATE` nimmt,
hätte das UPDATE ohnehin genommen; `schreibePruefplan` läuft über `db.run`,
also im Autocommit, die Sperre ist statementgebunden. Kein Kreis.

## A3 (trägt) — meine Abnahmevorschrift widersprach sich selbst

„POST zweimal mit identischem Rumpf" gegen „C: erst anzahl=2, dann anzahl=5".
Wörtlich ausgeführt wäre C nicht durchführbar. In FASSUNG 2 berichtigt.

## A4 (trägt als benannte Falle, kein heutiger Defekt) — die Anomalie bleibt in der Test-DB

`Feuerlöscher 8` ist die erste Zeile im Bestand mit studiofremder
`kategorie_id`, und die Suite fährt alle Dateien gegen dieselbe Wegwerf-DB.
**Selbst nachgemessen:** von den acht Testdateien mit `JOIN
wartung_kategorien` benutzt KEINE `k.studio_id <> wg.studio_id` als
Unreinheits-Kriterium — alle filtern auf Gleichheit und schliessen die Zeile
aus. Heute also folgenlos. FASSUNG 2 verlangt trotzdem das Abräumen der
Fixtur, in der von Spur A genannten Reihenfolge (Prüfprotokoll zuerst, der
Fremdschlüssel ist `ON DELETE RESTRICT`).

## Was Spur A zu R6 beisteuert — und wo sie ehrlich abbricht

Sie bestätigt den EINEN INSERT-Weg, den ihr Bündel enthielt (Z. 2632-2641 plus
`holeOderLegeAn` Z. 2155-2162, beide studio-gesichert), und schreibt
ausdrücklich, die übrigen vier Wege habe sie NICHT sehen können: „von mir nur
zu einem Fünftel nachgemessen." Das ist genau die Rechenschaft, die der
Vorspann verlangt, statt einer geratenen Bestätigung.

Sie stellt dabei eine Frage, die ich nicht beantwortet hatte: **kann ein
UPDATE die `kategorie_id` nachträglich auf eine fremde setzen?** Nachgemessen
über alle `UPDATE wartung_geraete` im Produktivcode (30 Stück):
`kategorie_id` kommt in **NULL** SET-Listen vor, ausschliesslich in
WHERE-Klauseln und Verbindungsbedingungen. Damit ist die R6-Kernaussage von
der anderen Seite geschlossen: weder ein INSERT noch ein UPDATE erzeugt eine
Gerätezeile mit fremder Kategorie.

## Was NACHGEMESSEN NICHT trägt

Nichts. Alle vier Befunde tragen — A4 als benannte Falle statt als Defekt,
was die Spur selbst so eingeordnet hat („Erwartung heute vermutlich: kein
Treffer — dann ist der Befund eine benannte Falle").

---

# DIFFPRÜFUNG DER VIERTEN RUNDE (Diff `9d3fc3b..3a7cad5`)

Zwei Spuren nach der Spurenreduktion vom 20.09.2026: die ausführende
Claude-Spur (freie Dateiwahl, darf messen) und EINE Lesespur (`kimi-k3`,
anderes Bündel — Diff, Schema-Ausschnitt, Routenbereich, Geschwisterwächter
`test_feature_brandschutz.js` vollständig, dazu alle Gegenproben-Zahlen).

**Die Lesespur ist ABGESCHNITTEN gelaufen und zählt deshalb nur teilweise:**
`finish_reason=length`, 29.611 von 32.000 Ausgabe-Token gingen ins Denken,
55.325 Eingabe-Token, 781,3 s. Vier Befunde kamen vollständig durch, der
vierte bricht mitten im Satz ab. Was danach gekommen wäre, ist UNBEKANNT —
nicht „nichts". Lehre fürs nächste Mal: bei `effort: high` und einem Bündel
dieser Grösse reichen 32.000 Ausgabe-Token nicht.

## Was nach EIGENER Nachmessung trägt

### C1 (BLOCKIEREND, ausführende Spur) — `\bdb\b` hat die `.query(`-Abdeckung VERLOREN

Das alte Muster war `/\bdb\.(run|q|one)\(|\.query\(/`, das neue `/\bdb\b/`.
Die Alternative `\.query\(` ist ersatzlos weggefallen. `core/db.js` exportiert
`pool` (Zeile 2621). **Selbst gemessen:** ein Alias AUSSERHALB des Bereichs
(`const { pool } = require("../../core/db");` direkt nach der
deps-Destrukturierung) plus `await pool.query("UPDATE wartung_geraete SET
aktiv=0 …")` INNERHALB des Bereichs ergibt

    test_feature_ladebestand_streng.js   EXIT 0, 25 PASS / 0 FAIL

Der Riegel sieht den Schreibvorgang nicht, `praefplanGeaendert` zählt ihn
nicht, und die Abbruchseite meldet „Am Prüfplan wurden keine Einträge
angelegt, geändert oder deaktiviert." Verschärfend: die Erfolgsmeldung
behauptet wörtlich „deckt … /.query(/ … mit ab" — eine FALSCHE ZUSICHERUNG
VON ABDECKUNG, unsere teuerste Klasse, erzeugt von genau dem Beitrag, der
diese Klasse schliessen sollte.

### C2 + Lesespur-1 (BLOCKIEREND, von BEIDEN Spuren unabhängig gefunden) — mein eigener Punkt 4b reisst ein neues Loch in Punkt 4

`z.replace(/(^|[^:])\/\/.*$/, '$1')` kennt keine Zeichenkettengrenzen.
**Selbst gemessen**, je Eingabe:

    await schreibePruefplan("SET n='//a'", p); db.run("UPDATE x");
      -> "await schreibePruefplan(\"SET n='"        db vorhanden? NEIN
    const u = "https://a//b";
      -> "const u = \"https://a"                     URL zerschnitten
    const rx = /\/\//g; await db.run(x);
      -> "const rx = /\\/\\"                         db vorhanden? NEIN

Ein `//` in einer Zeichenkette oder einem Regex-Literal schneidet die Zeile
ab, und ein `db` DAHINTER verschwindet mit. Die Bereinigung, die Punkt 4
vor Prosa schützen sollte, ist damit selbst ein Umgehungsweg geworden.
Zugleich ist mein eigener Kommentar („lässt `://` in URLs unangetastet")
für den Fall mit ZWEITEM `//` schlicht falsch.

### C8 (ausführende Spur) — die URL-Gegenprobe von 4b kann den Wegfall nicht sehen

Die Fixtur `const u = "https://x/y";` enthält genau ein `//`, und das ist
doppelpunkt-vorangestellt. Die Ersetzung findet dort also überhaupt keinen
Treffer — die Zusicherung bliebe auch dann grün, wenn der `.map()`-Schritt
ganz entfernt würde. Sie ist nur gegen ÜBERGIER empfindlich (das hat meine
Gegenprobe gemessen), nicht gegen WEGFALL. Eine Fixtur mit einem zweiten
`//` hinter der URL unterscheidet beides.

### C7 (ausführende Spur) — die erste Zeile des Abschnitts ist unbereinigte Prosa

`GERAETE_QUELLTEXT_ROH.slice(begin, ende)` beginnt MITTEN im Markenkommentar.
**Selbst gemessen**, erste Zeile des „bereinigten" Abschnitts:

    "PRUEFPLAN_SCHREIBBEREICH_BEGINN (dritte Prüfrunde \"ladebestand\","

Sie beginnt nicht mit `//` (Zeilenfilter greift nicht) und enthält kein `//`
(Nachlauf-Stripper greift nicht). Mit dem alten engen Muster folgenlos; mit
`\bdb\b` genügt ab jetzt ein künftiges Wort „db" in dieser einen Zeile, damit
der Riegel an reiner Prosa rot wird.

### C3 (ausführende Spur) — beide Fundstellen in meinem FOR-UPDATE-Kommentar sind falsch

**Selbst gemessen:** der POST beginnt bei `:6600`, nicht `:6524` (dort steht
eine Kommentarzeile im GET-Rendering); geschrieben wird bei `:6709`
(`UPDATE wartung_geraete SET name=$1, inventarnummer=$2, notizen=$3, …`),
nicht `:6633` (dort steht ein Kommentar, bei `:6631` die
CRLF-Normalisierung). Der Kommentar nennt diesen Weg als EINZIGEN Beleg
dafür, dass `FOR UPDATE` trägt — wer ihn nachschlägt, landet im Rendering.

### C4 (ausführende Spur) — `FOR UPDATE` ist datenverlust-tragend und unbewacht

Meine eigene Gegenprobe (b) hat das gemessen (EXIT 0, 25 PASS / 0 FAIL ohne
die Zeile) und ich habe es als Kommentar festgehalten. Die Spur widerspricht
der Schlussfolgerung zu Recht: dass eine FIXTUR den nebenläufigen Schreiber
nicht herstellen kann, schliesst eine STATISCHE Zusicherung nicht aus —
dieselbe Datei prüft in Punkt 4 und Z3 bereits den Quelltext dieser Datei.

### C5 (ausführende Spur, TRÄGT — und ist der lehrreichste Befund) — die CTE erzeugt die Gefahr erst selbst

Behauptung: die einfache Form mit `IS DISTINCT FROM` in der WHERE-Klausel hat
die Schnappschuss-Gefahr gar nicht, weil `SET` und `WHERE` eines einfachen
UPDATE unter EvalPlanQual gegen die frisch committete Zeilenversion NEU
ausgewertet werden. **Selbst gemessen gegen PostgreSQL 16**, Fremdschreiber
hält die Zeile drei Sekunden und committet:

    CTE OHNE FOR UPDATE   -> "Erfasster Bestand: 5 Stück"
                             (Admin-Notiz WEG — Datenverlust)
    CTE MIT FOR UPDATE    -> "Admin-Notiz des Betreibers\nErfasster Bestand: 5 Stück"
    WHERE-Form            -> "Admin-Notiz des Betreibers\nErfasster Bestand: 5 Stück"

Und die Fallmatrix ohne Nebenläufigkeit trifft die WHERE-Form EXAKT wie die
CTE: `0, 1, 1, 1, 1, 0, 0` für wertgleich / echte Änderung / NULL / Text ohne
Bestandszeile / ZWEI Bestandszeilen (nur die erste ersetzt) / fremdes Studio /
nicht vorhanden.

**Der Befund trägt. Die Behebung wird trotzdem NICHT übernommen, und der
Grund ist gemessen, nicht ästhetisch:** die WHERE-Form schreibt den
CASE-Ausdruck ZWEIMAL hin. Das ist „Dieselbe Aussage an zwei Orten" — laut
unserer eigenen CLAUDE.md „die häufigste Fehlerquelle in diesem Projekt" —
und zwar in der Variante, die sich nicht auflösen lässt: die zweite Kopie
kann man hier nicht löschen, man müsste sie pflegen. Wer eine der beiden
Kopien ändert, bekommt lautlos ein UPDATE, das X schreibt und gegen Y
vergleicht.

Damit stehen zwei Gefahren gegeneinander, und beide sind absicherbar:

    CTE + FOR UPDATE   ein Wort entfernt -> Datenverlust, heute kein rotes Signal
                       -> absicherbar durch eine STATISCHE Zusicherung (C4)
    WHERE-Form         eine Kopie geändert -> falsche Zählung, kein rotes Signal
                       -> absicherbar durch eine Zusicherung auf Textgleichheit

Entschieden wird für die CTE plus die statische Zusicherung aus C4: die
CTE ist gebaut, in allen sieben Fällen UND im Nebenläufigkeitsfall gemessen,
und die Absicherung schliesst genau die eine gefährliche Eigenschaft. Ein
dritter Weg ohne beide Nachteile gäbe es — eine `IMMUTABLE`-SQL-Funktion, die
beide Stellen aufrufen — aber der braucht eine Migration und sprengt diesen
Beitrag.

**Was die Spur dabei zu Recht rügt und was hiermit nachgeholt ist:** der Diff
begründete nur, warum KEIN `includes()`-Vergleich in JavaScript gebaut wurde,
nicht, warum die WHERE-Variante verworfen wurde. Eine Abwägung, die nicht
aufgeschrieben ist, hat nicht stattgefunden.

### C6 + Lesespur-2 (von BEIDEN Spuren unabhängig gefunden) — das Aufräumen steht auf dem Erfolgspfad

Zwischen den Fixtur-INSERTs und den drei DELETEs liegen zehn Zusicherungen.
Schlägt eine an, greift `process.exit(1)` und die DELETEs laufen nie —
„Feuerlöscher 8" bleibt in der gemeinsamen Wegwerf-DB liegen, also genau die
Zeile, die der eigene Kommentar als „erste Zeile im Bestand, deren
kategorie_id zu einem ANDEREN Studio gehört" benennt. **Selbst gemessen:** die
Laufschleife in `test/run.sh:888-891` macht nach einem Fehlschlag weiter
(`else`-Zweig, kein `exit`). Entschärfend, und ebenfalls gemessen:
`test_feature_ladebestand_streng.js` ist heute der LETZTE Eintrag in `TESTS` —
es läuft nichts danach. Das ist aber eine Reihenfolge, keine Eigenschaft.

### C9 (ausführende Spur) — der Kopfkommentar widerspricht der eigenen Korrektur

`routes/admin/geraete.js:2021-2022` sagt unverändert „Dieselbe Bedingung wie
der erste Satz oben: 0 Antworten heisst, dass auch keine Feststellung
zustande kam." Vier Zeilen darunter steht die BERICHTIGUNG, die genau das
Gegenteil sagt und der Grund für „neue" im Titel ist. Zwei einander
widersprechende Sätze über dieselbe Tatsache in Nachbarzeilen; nach unserer
eigenen Regel wird die überholte Kopie GELÖSCHT, nicht ergänzt.

### C10 (ausführende Spur) — `r.clone()` ist unnötig, die Funktion gibt den Text längst zurück

`pruefeKeinFehlerseiten()` endet mit `return html;`. Punkt 1 ruft danach
`rAusloesen.text()` ein zweites Mal — deshalb wurde der Klon nötig. Wer
stattdessen den RÜCKGABEWERT nimmt, braucht weder Klon noch Tee, und der
Kommentar („kein Verhaltenswechsel") wird wahr statt bloss ungenau.

### Lesespur-3 (NEU, nur diese Spur) — der Priming-Kommentar nennt einen unmöglichen Grund

Zwei Ungenauigkeiten, beide selbst nachgemessen:
(a) „legt nur die Kategorie an" ist falsch — der POST läuft den vollständigen
Handler und schreibt unter anderem `pruefbereich_bestand`
(`routes/admin/geraete.js:1480`/`:1529`) sowie die monatliche Begehung. Das
Aufräumen funktioniert nur deshalb, weil das Kategorie-DELETE per CASCADE
nachzieht.
(b) „antwort_feuerloescher fehlt hier bewusst, die Ablösungsschleife darf die
Fixtur unten noch nicht berühren" ist zeitlich unmöglich: die Fixtur wird
ERST NACH dem Priming-POST eingefügt. Der wirkliche Grund ist ein anderer —
mit beantwortetem `feuerloescher` entstünde der Sammelposten schon hier, und
der Auslöse-POST nähme den `schonDa`-Pfad statt des Anlegepfads.

### Lesespur-4 (NEU, nur diese Spur) — `\bdb\b` kann an einer ZEICHENKETTE anschlagen

Der Riegel prüft den kommentarbereinigten, aber nicht zeichenkettenbereinigten
Bereich. Das Wort „db" in einem String-Literal im Bereich liesse ihn rot
werden, ohne dass ein Zugriff stattfindet. **Heute 0 Treffer** (gemessen), und
die Richtung ist die ungefährliche: ein FEHLALARM, kein Durchlass. Er wird
deshalb BENANNT statt bekämpft — eine Zeichenketten-Ausblendung brächte eine
neue Blindheit mit (`${…}` in Template-Literalen), und die wäre die
gefährliche Richtung.

## Der zeichenweise Stripper — vom Haupt-Agenten SELBST gebaut und gemessen

Weil an dieser einen Funktion eine falsche Annahme still ein grünes Ergebnis
erzeugt, ist sie nicht delegiert, sondern hier wörtlich vorgegeben. Gemessen
über acht Anforderungen: **alte Fassung verletzt 3 von 8, neue verletzt 0 von
8.** Gegen den echten Quelltext: der Bereich enthält weiterhin `db` NULL mal,
`.query(` NULL mal, und `schreibePruefplan(` SECHS mal.

```js
function ohneAlleKommentare(text) {
    let aus = '';
    let i = 0;
    const n = text.length;
    let inZeichenkette = null;   // ' " oder `
    let inZeile = false;
    let inBlock = false;
    while (i < n) {
        const c = text[i];
        const c2 = text[i + 1];
        if (inZeile) {
            if (c === '\n') { inZeile = false; aus += c; }
            i++; continue;
        }
        if (inBlock) {
            if (c === '*' && c2 === '/') { inBlock = false; i += 2; continue; }
            if (c === '\n') aus += c;
            i++; continue;
        }
        if (inZeichenkette) {
            aus += c;
            if (c === '\\' && i + 1 < n) { aus += c2; i += 2; continue; }
            if (c === inZeichenkette) inZeichenkette = null;
            i++; continue;
        }
        if (c === '\\' && i + 1 < n) { aus += c; aus += c2; i += 2; continue; }
        if (c === '/' && c2 === '/') { inZeile = true; i += 2; continue; }
        if (c === '/' && c2 === '*') { inBlock = true; i += 2; continue; }
        if (c === '"' || c === "'" || c === '`') { inZeichenkette = c; aus += c; i++; continue; }
        aus += c; i++;
    }
    return aus;
}
```

**Bekannte Grenze, die dazugehört und benannt wird:** ein Regex-Literal, das
ein UNESCAPTES `//` enthält, wird weiterhin als Kommentarbeginn gelesen. Mit
Escape (`/\/\//`) trägt der Backslash-Zweig und es geht gut — gemessen. Eine
vollständige Lösung bräuchte einen Tokenizer, der weiss, ob ein `/` eine
Division oder ein Regex beginnt; das ist mehr Apparat, als der Riegel wert
ist.

## Was NICHT gebaut wird

**C11 (ausführende Spur) — den Schleifenrumpf in eine eigene Funktion ziehen,
die `db` gar nicht im Gültigkeitsbereich hat.** Der Vorschlag ist richtig: er
würde die Invariante vom Modulsystem erzwingen lassen statt von einer Regex
über Quelltext, und C1, C2, C7 und Lesespur-4 fielen ersatzlos weg. Er
verlangt aber einen Umbau des Routenhandlers weit über diesen Beitrag hinaus.
Als datierter offener Punkt festgehalten, nicht stillschweigend übergangen.

---

# DER BAUAUFTRAG DER FÜNFTEN RUNDE

Arbeitsbaum `/home/user/gymdocu`, Zweig `beitrag-ladebestand`, Kopf `3a7cad5`.
**Nicht committen** — der Haupt-Agent liest den Diff, misst nach, committet.

## 1 — C1 (BLOCKIEREND): die `.query(`-Abdeckung zurückholen

`test_feature_ladebestand_streng.js`, im Punkt-4-Block:

    const verbotenesMuster = /\bdb\b/;
      ->  const verbotenesMuster = /\bdb\b|\.query\(/;

Der Kommentar darüber bekommt einen Absatz: dass die Alternative `\.query\(`
aus dem ALTEN Muster stammt und NICHT wegfallen darf, weil `core/db.js` einen
`pool` exportiert (dortige Zeile 2621) und ein Alias ausserhalb des Bereichs
(`const { pool } = require(…)`) den Bezeichner `db` im Bereich vermeidet —
gemessen EXIT 0, 25 PASS / 0 FAIL, bevor die Alternative wieder da war.

**Gegenprobe (1a):** in `routes/admin/geraete.js` direkt nach `} = deps;`
die Zeile `const { pool } = require("../../core/db");` einfügen UND im
Bereich `await schreibePruefplan("UPDATE wartung_geraete SET aktiv=0 WHERE
studio_id=$1 AND id=$2", [req.studioId, a.id]);` durch
`await pool.query(…)` mit demselben Rumpf ersetzen. Muss ROT werden.
(Ohne diesen Punkt gemessen: EXIT 0, 25 PASS / 0 FAIL.)

## 2 — C2/C8/Lesespur-1 (BLOCKIEREND): zeichenkettenfester Stripper

`ohneAlleKommentare()` wird durch die Fassung aus dem Abschnitt
„Der zeichenweise Stripper" WÖRTLICH ersetzt. Nicht neu erfinden, nicht
„verbessern" — sie ist gemessen.

Der Kommentar darüber wird neu geschrieben und sagt:
* warum zeichenweise statt zeilenweise (die alte Fassung schnitt an einem
  `//` INNERHALB einer Zeichenkette ab und liess ein `db` dahinter
  verschwinden — gemessen, Beispiele im Prüfabschnitt oben),
* dass die frühere Zusage „lässt `://` in URLs unangetastet" für
  `"https://a//b"` FALSCH war,
* die bekannte Grenze (unescaptes `//` in einem Regex-Literal),
* Lesespur-4: das Wort „db" in einer Zeichenkette im Bereich löst den Riegel
  aus. Heute 0 Treffer, Richtung ist der FEHLALARM, nicht der Durchlass;
  bewusst nicht bekämpft, weil eine Zeichenketten-Ausblendung `${…}` in
  Template-Literalen blind machen würde.

**Die beiden 4b-Fixturen werden ersetzt**, weil die alten den Wegfall nicht
sehen (C8). Neu, drei Stück:

    ohneAlleKommentare('await schreibePruefplan(x);   // hier nie db.run() benutzen')
        darf 'db' NICHT enthalten
    ohneAlleKommentare('const u = "https://a//b";')
        MUSS 'https://a//b' VOLLSTÄNDIG enthalten   (fängt den Wegfall UND die Übergier)
    ohneAlleKommentare(`await schreibePruefplan("SET n='//a'", p); db.run("UPDATE x");`)
        MUSS 'db' enthalten   (der Umgehungsweg, den die alte Fassung öffnete)

**Gegenproben (2a)(2b):** (2a) den Stripper auf die alte, zeilenweise Fassung
zurückdrehen -> die dritte Fixtur muss ROT werden. (2b) den Stripper durch
`(text) => text` ersetzen -> die erste Fixtur muss ROT werden.

## 3 — C7: der Schnitt beginnt am Zeilenende der Markenzeile

Im Punkt-4-Block:

    const abschnitt = ohneAlleKommentare(GERAETE_QUELLTEXT_ROH.slice(begin, ende));
      ->  der Schnitt beginnt bei GERAETE_QUELLTEXT_ROH.indexOf('\n', begin) + 1

Die bestehenden `assert.notStrictEqual(begin, -1)` und `begin < ende` bleiben
auf der MARKENPOSITION (sonst prüfen sie etwas anderes als sie sagen).
Kommentar dazu: die Marke steht in einem Kommentar, der Schnitt begann bisher
MITTEN darin, und diese eine Zeile erreichte weder Zeilenfilter noch Stripper.
Zusätzlich eine Zusicherung, dass der bereinigte Abschnitt NICHT mehr mit
`PRUEFPLAN_SCHREIBBEREICH_BEGINN` beginnt.

**Gegenprobe (3a):** den Schnitt auf `begin` zurückdrehen -> die neue
Zusicherung muss ROT werden.

## 4 — C4: `FOR UPDATE` bekommt eine statische Zusicherung

Neu im Punkt-4-Block (oder als eigener Block daneben), gegen
`GERAETE_QUELLTEXT_ROH`:

    /WITH gesperrt AS \([\s\S]{0,300}?FOR UPDATE\)/

muss GENAU EINMAL zutreffen. Dazu eine Positivkontrolle, dass die Zeichenkette
`WITH gesperrt AS (` überhaupt genau einmal vorkommt — sonst ist die
Zusicherung bei einer Umbenennung vakuos statt rot.

Der vorhandene Kommentarabsatz „DIESE ZEILE IST VON KEINER ZUSICHERUNG
BEWACHT" wird entsprechend BERICHTIGT: sie ist ab jetzt statisch bewacht;
was weiterhin KEINE Zusicherung herstellt, ist der nebenläufige Fremdschreiber
selbst. Der Unterschied gehört hingeschrieben.

**Gegenprobe (4a):** `FOR UPDATE` aus der CTE entfernen -> muss jetzt ROT
werden. (Vor diesem Punkt gemessen: EXIT 0, 25 PASS / 0 FAIL.)

## 5 — C3: die beiden falschen Fundstellen berichtigen

Im FOR-UPDATE-Kommentar: `:6524` -> `:6600` (dort steht
`router.post("/geraetewartung/geraet/bearbeiten/:id"`), `:6633` -> `:6709`
(dort steht `UPDATE wartung_geraete SET name=$1, inventarnummer=$2,
notizen=$3, …`). Beide Zahlen VOR dem Eintragen am Quelltext nachsehen, nicht
von hier abschreiben — die Zeilen verschieben sich durch die übrigen Punkte
dieses Auftrags.

## 6 — C9: die überholte Kopie löschen

`routes/admin/geraete.js`, im Kopfkommentar von `ladeBestandFehlerTitel()`:
die zwei Zeilen

    // Dieselbe Bedingung wie der erste Satz oben: 0 Antworten heisst, dass auch
    // keine Feststellung zustande kam.

werden ERSATZLOS GELÖSCHT. Sie sagen das Gegenteil des BERICHTIGT-Absatzes
vier Zeilen darunter.

## 7 — C6/Lesespur-2: Aufräumen in `finally`

Der Punkt-1-Block bekommt `try { … } finally { … }`: Fixtur-Aufbau,
Auslösung und alle Zusicherungen in den `try`, die drei DELETEs und
`srvEigen.close()` in den `finally`. Die DELETEs sind idempotent
(`WHERE id = ANY($1)`), treffen also auf nichts, wenn der Aufbau scheiterte.

Der bestehende Kommentar am Aufräumblock bleibt (Kaskaden- und
Studio-Begründung) und bekommt einen Satz dazu: WARUM `finally` — weil
`test/run.sh:888-891` nach einem Fehlschlag mit der nächsten Datei
WEITERMACHT und „Feuerlöscher 8" sonst in der gemeinsamen Wegwerf-DB
liegenbliebe. Dass diese Datei heute die LETZTE in `TESTS` ist, ist eine
Reihenfolge und keine Eigenschaft — auch das gehört in den Satz.

## 8 — Lesespur-3: der Priming-Kommentar sagt die Wahrheit

Die beiden falschen Aussagen ersetzen:
* nicht „legt nur die Kategorie an" — der POST läuft den vollständigen
  Handler und schreibt unter anderem `pruefbereich_bestand`
  (`routes/admin/geraete.js:1480`/`:1529`) und die monatliche Begehung; das
  Aufräumen trägt nur, weil das Kategorie-DELETE per CASCADE nachzieht.
* nicht „die Ablösungsschleife darf die Fixtur unten noch nicht berühren" —
  die Fixtur existiert zu diesem Zeitpunkt gar nicht. Richtig: mit
  beantwortetem `feuerloescher` entstünde der Sammelposten schon hier, und
  der Auslöse-POST nähme den `schonDa`-Pfad statt des Anlegepfads.

Beide Ersatzaussagen VOR dem Eintragen am Quelltext nachprüfen.

## 9 — C10: den Klon wieder herausnehmen

`pruefeKeinFehlerseiten()` liest wieder `await r.text()` (ohne `clone()`).
In Punkt 1 wird der RÜCKGABEWERT benutzt:

    await pruefeKeinFehlerseiten(rAusloesen, ABBRUCH_MARKER, 'Punkt 1 Auslösung');
    const htmlAusloesen = await rAusloesen.text();
      ->  const htmlAusloesen = await pruefeKeinFehlerseiten(rAusloesen, ABBRUCH_MARKER, 'Punkt 1 Auslösung');

Der R3-Kommentar wird umgeschrieben: die Falle („ein zweites `text()` wirft")
bleibt beschrieben, der Ausweg ist aber der Rückgabewert, nicht der Klon.
Die Behauptung „kein Verhaltenswechsel" fällt weg — sie war ungenau, der Klon
puffert den ungelesenen Zweig.

## Abnahme insgesamt

* Volle Suite `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"` — kein
  Pipe, kein äusseres `flock`.
* `npm run lint`, Ergebnis WÖRTLICH melden, auch bei Grün.
* Die fünf Gegenproben (1a, 2a, 2b, 3a, 4a) einzeln, jede wörtlich mit EXIT
  und PASS/FAIL, Mutation UND Rücknahme.
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker mit, `node --check` danach. Rücknahme gegen eine unabhängige
  `cp`-Kopie, `diff` EXIT 0 — NIE `git checkout`/`git stash`, und NIE mit
  einem Testlauf verkettet.
* Am Ende `git status` sauber und der Marker-Scan nur mit Prosatreffern.

---

# DIFFPRÜFUNG DER FÜNFTEN RUNDE — die ausführende Spur hat meinen eigenen Entwurf widerlegt

14 Befunde. Der erste trifft das eine Stück, das ich in Runde 5 ausdrücklich
NICHT delegiert habe, weil „an dieser Funktion eine falsche Annahme still ein
grünes Ergebnis erzeugt" — und genau das ist passiert.

## C1 (BLOCKIEREND, trägt) — mein zeichenweiser Automat wird BLIND

Er kennt weder Regex-Literale noch die Regel „ein Zeilenumbruch beendet eine
`'`/`"`-Zeichenkette". Ein Regex mit einem Anführungszeichen darin
(`/['"]/`) kippt den Zeichenketten-Zustand; ein späteres `/*` in einer
ECHTEN Zeichenkette wird dann als Blockkommentar gelesen und verschluckt
alles bis zum nächsten `*/`.

**Selbst gemessen**, sechs Zeilen mit echtem Code dazwischen:

| | Länge | `pool.query(` | `rowCount`-Zeile | Riegel |
|---|---|---|---|---|
| mein Automat | 187 → **56** | weg | weg | **schlägt NICHT an** |
| `maskiereKommentare` | 187 → 187 | da | da | schlägt an |

Der Riegel ist damit grün UND blind — unsere teuerste Klasse, erzeugt von
der Behebung, die sie schliessen sollte. **Meine acht Prüffälle enthielten
keinen einzigen mit einem Anführungszeichen im Regex-Literal:** ich habe die
Klasse gemessen, die ich mir vorgestellt hatte, nicht die, die es gibt.

## C2 (BLOCKIEREND, trägt — und schwerer als gemeldet) — der Apparat existiert längst

`test/rohwert-scan.js:172` exportiert `maskiereKommentare` (Export bei
`:656`). Die Spur nannte drei Verbraucher; **selbst nachgezählt sind es 45
Dateien** — es ist der Hausstandard. Er behandelt Regex-vs-Division über den
letzten Token, Anführungszeichen IM Regex (dortiger Kommentar: „gemessene
Ursache, Auftrag #84"), unbeendete Zeichenketten am Zeilenumbruch und
`${…}`-Substitutionen über einen Stapel.

**Selbst gemessen:** er besteht ALLE DREI neuen 4b-Fixturen, löst zusätzlich
den von mir als unlösbar deklarierten Fall `const rx = /\/\//g; await
db.run(x);`, und wird im Blindheitsfall oben NICHT blind. Gegen den echten
Bereich: Riegel schlägt nicht an, sechs `schreibePruefplan(`, Markenzeile
draussen — ein direkter Ersatz, der in jeder Hinsicht besser ist.

**Mein Kommentar behauptet, ein solcher Tokenizer sei „mehr Apparat, als der
Riegel wert ist".** Das ist eine falsche TATSACHENBEHAUPTUNG, die einen
Vorschlag ausschliesst — der Apparat liegt im selben Repo und wird von 45
Dateien benutzt. Dieselbe Klasse wie am 14.09.2026 („X geht nicht, weil Y").

## C3 (BLOCKIEREND, trägt) — die `.query(`-Behebung schliesst nur EINEN Alias

`core/db.js` exportiert `pool, q, one, run, tx`. Ein Alias AUSSERHALB des
Bereichs (`const { run, one } = require('../../core/db');`) plus `await
run("UPDATE wartung_geraete SET aktiv=0 …")` INNERHALB — **gemessen: der
Riegel schlägt NICHT an.** Exakt dieselbe Klasse, die die `.query(`-Behebung
gerade geschlossen hat, und die Erfolgsmeldung zählt wieder Abdeckung auf.

**Muster gemessen, beide Richtungen**, gegen den echten heutigen Bereich:

    /\bdb\b|\.query\(/                             kein Fehlalarm | run(/one( DURCH
    /\bdb\b|\.query\(|\b(?:run|one|tx|q|pool)\s*\(/  kein Fehlalarm | run(/one( GEFANGEN

Die bare-Aufrufe im heutigen Bereich sind `feuerloescherOhneProtokoll(`,
`holeOderLegeAn(`, `plusMonate(`, `position(`, `push(`, `map(`,
`regexp_replace(`, `schreibePruefplan(` — keine Kollision.

## Weitere getragene Befunde, alle selbst nachgemessen

**C7 — das 300-Zeichen-Fenster der C4-Zusicherung greift zu weit.** Von
`WITH gesperrt AS (` bis `FOR UPDATE)` sind es **164 Zeichen**; bei 300 endet
das Fenster mitten in der FOLGENDEN CTE (`…zen AS alt, CASE`). Ein
`FOR UPDATE)` an der falschen Stelle erfüllt die Zusicherung.

**C4 (Umfang) — die Punkt-3-Positivkontrolle prüft DASS, nicht WIE VIEL.**
Im Blindheitsfall oben schrumpft der Abschnitt auf ein Sechstel, und
`abschnitt.includes('schreibePruefplan(')` bleibt wahr.

**C8 — den Bereichsmarken fehlt die Eindeutigkeits-Kontrolle**, die C4 für
den CTE-Namen gerade eingeführt hat. Heute je 1× (gemessen), aber unbewacht:
`indexOf` nimmt das erste Vorkommen, und in dieser Datei werden Marken
regelmässig in Prosa zitiert.

**C6 — der neue `finally`-Block kann die Originalmeldung ersetzen.** Wirft
eines der drei Aufräum-Statements, meldet die Datei dessen Fehler statt der
gerissenen Zusicherung. (Der `undefined`-Fall ist dabei unkritisch: selbst
gemessen liefern beide DELETE-Formen rowCount 0, ohne zu werfen.)

**C13 — die Fundstelle `test/run.sh:888-891` belegt nichts.** Nachgezählt:
888 Schleifenkopf, 889 `echo`, 890 `if`, 891 `else`. Der Rumpf ohne `exit`
beginnt bei 892. Diesen Satz habe ICH diktiert.

**C9 — die Rücknahme des Klons öffnet die R3-Falle wieder.** 14 der 15
Aufrufer verwerfen den Rückgabewert; der Klon schützte ALLE, der Rückgabewert
nur den, der ihn kennt. Beide Befunde (Runde 4 „Klon unnötig", jetzt „Klon
schützte") treffen zu — die Auflösung ist eine Zusicherung, die ein zweites
`rX.text()` nach `pruefeKeinFehlerseiten(rX` verbietet.

**C10 — `${ende - begin}` in der Erfolgsmeldung** beschreibt seit dem Schnitt
bei `zeilenbeginnNachMarke` einen Bereich, der so nie geprüft wurde.

**C11 — Fixtur 3 prüft `includes('db')`**, der Riegel `\bdb\b` — zwei
verschiedene Prädikate.

**C12 — `indexOf('\n', begin)` kann -1 liefern**, dann beginnt der Abschnitt
bei 0.

**C5 — kein `/*` in den Fixturen und null `/*` im Bereich:** der
Blockkommentar-Zweig ist durch nichts belegt. (Entfällt mit C2 — der
Hausstandard bringt seine eigenen Prüfungen mit.)

**C14 — der `try`-Rumpf ist nicht eingerückt** (rund 130 Zeilen auf der alten
Ebene).

## Was das über das Verfahren sagt

Ich hatte den Stripper selbst gebaut, gegen acht Anforderungen gemessen und
als „das einzige heikle Stück, vom Haupt-Agenten gemessen" wörtlich
vorgegeben — mit der ausdrücklichen Anweisung an den Ausführenden, ihn
NICHT neu zu erfinden. Er hat sich daran gehalten, zeichengenau. **Der
Fehler war vollständig meiner**, und gefunden hat ihn die Spur, die
AUSFÜHREN darf: sie hat den Automaten gegen den echten Bereich laufen lassen
statt ihn zu lesen. Das ist dieselbe Messung wie am 13.09.2026 — die
ausführende Spur findet, was eine Lesespur nicht findet.

Und: **eine selbstgebaute Lösung ist zuerst gegen den BESTAND zu halten.**
Ich habe nicht gefragt, ob es das schon gibt. Es gab es, in 45 Dateien.

---

# DIFFPRÜFUNG DER FÜNFTEN RUNDE — Lesespur (`kimi-k3`, vollständig)

`beendet=stop`, 52.674 Eingabe-, 37.567 Ausgabe-Token (33.771 davon Denken),
982,1 s. **Das höhere Ausgabebudget (64.000 statt 32.000) hat die Abschneidung
der vierten Runde behoben** — das ist die Lehre aus `ASTRA-LAEUFE.md`
nachgezogen und hat gewirkt.

Sieben Befunde, zwei mit eigenem Gehalt:

**K1 (trägt) — die `.query(`-Behebung deckt nur EINE Schreibweise.** Selbst
gemessen, vier Formen gegen drei Muster:

    heute                        pool.query(x) gefangen | pool.query (x) DURCH | pool["query"](x) DURCH | run(x) DURCH
    mein C3-Vorschlag            pool.query(x) gefangen | pool.query (x) DURCH | pool["query"](x) DURCH | run(x) gefangen
    kombiniert (s. Auftrag)      alle vier gefangen

**K2 (trägt zur HÄLFTE) — die C4-Zusicherungen laufen gegen den ROHEN
Quelltext**, also gegen Kommentare mit. Ein künftiger Kommentar, der den
CTE-Kopf samt Sperrhinweis zitiert, hielte sie grün, auch wenn die echte CTE
entsperrt wird — die Umkehrung von „Tests dürfen nicht an Prosa scheitern":
Prosa hält den Wächter wach. Der Vorschlag (gegen den BEREINIGTEN Quelltext
prüfen) ist richtig und selbst gemessen: Anker trifft, CTE-Name 1× in beiden
Fassungen.
**Die andere Hälfte FÄLLT:** die Spur hielt das 300-Zeichen-Fenster für
„plausibel" und schätzte ~90 Zeichen bis `FOR UPDATE)`. Selbst gemessen sind
es **164**, und bei 300 endet das Fenster mitten in der FOLGENDEN CTE. Die
ausführende Spur (C7) hatte recht, die Lesespur hier nicht.

**K3 (trägt) — die CASCADE-Behauptung im Kommentar ist falsch.** Selbst
gemessen an `core/db.js:1567-1570`: `pruefbereich_bestand` trägt `studio_id`
und `bereich`, **keine** Referenz auf `wartung_kategorien`. Das
Kategorie-DELETE nimmt diese Zeilen also NICHT mit. Der Satz stammt aus
meiner eigenen Kommentarverbesserung von heute.

**K5 (trägt, schärfer als C6) — wirft das ERSTE Aufräum-DELETE, werden die
übrigen übersprungen**, und liegen bleibt ausgerechnet die Verunreinigung,
derentwegen der Block eingeführt wurde. Zusätzlich: `close()` läuft jetzt
NACH den DELETEs statt vorher — ein stiller Verhaltenswechsel.

**K6 (trägt, klein) — „Die BEIDEN alten Fixturen sind ERSETZT" stimmt nicht:**
Fixtur 1 ist wortgleich die alte.

**K4** zählt weitere Grenzen meines Automaten auf (Anführungszeichen im
Regex, `${…}`, verschachtelte Templates) — **entfällt mit dem Ersatz durch
den Hausstandard**. **K7** ist eine Zustandsantwort ohne eigenen Vorschlag.

**Überschneidung der beiden Spuren:** drei von zwanzig Befunden berühren
dieselbe Stelle (Automatengrenzen, C4-Fenster, `finally`-Block), und zwar
aus verschiedenen Richtungen — die ausführende Spur MASS, die Lesespur
zählte Formen auf. Beim C4-Fenster war die ausführende Spur richtig und die
Lesespur falsch; bei K1 und K3 war es umgekehrt.

---

# DER BAUAUFTRAG DER SECHSTEN RUNDE

Arbeitsbaum `/home/user/gymdocu`, Zweig `beitrag-ladebestand`, auf dem
UNCOMMITTETEN Stand der fünften Runde. **Nicht committen.**

## 1 — BLOCKIEREND (C1/C2/K4): mein Automat fliegt RAUS, der Hausstandard kommt REIN

`ohneAlleKommentare()` wird **ERSATZLOS GELÖSCHT** und überall durch
`maskiereKommentare` aus `test/rohwert-scan.js` ersetzt:

    const { maskiereKommentare } = require('./test/rohwert-scan.js');

**Nicht danebenstellen, nicht „anpassen" — löschen.** Es ist eine zweite,
schwächere Fassung derselben Aussage, und die zweite Kopie wird nach
Hausregel gelöscht, nicht gepflegt.

Selbst gemessen und als Vorgabe verbindlich:
* der Hausstandard besteht **alle drei** bestehenden 4b-Fixturen,
* er wird im Blindheitsfall NICHT blind (187 → 187 Zeichen, Riegel schlägt
  an; mein Automat: 187 → 56, Riegel blind),
* gegen den echten Bereich: Riegel schlägt nicht an, **6** `schreibePruefplan(`,
  Markenzeile draussen,
* er ist LÄNGENERHALTEND (ersetzt Kommentarinhalt durch Leerzeichen) — Offsets
  und Längenvergleiche bleiben damit gültig.

**Der Kommentar wird neu geschrieben** und sagt: dass hier bis zur fünften
Runde ein selbstgebauter Automat stand; woran er gemessen blind wurde; dass
die frühere Behauptung, ein Tokenizer sei „mehr Apparat, als der Riegel wert
ist", FALSCH war, weil dieser Apparat im selben Repo liegt und von **45**
Dateien benutzt wird (selbst nachgezählt).

**VIERTE Fixtur, neu**, genau der Fall, an dem mein Automat gescheitert ist:

    const ein = [
      "const rx = /['\"]/;",
      "const s = 'a';",
      "const t = 'pfad /* ';",
      `await pool.query("UPDATE wartung_geraete SET aktiv=0");`,
      "const u = ' */ ';",
    ].join('\n');
    -> maskiereKommentare(ein) MUSS "pool.query(" noch enthalten

**Gegenprobe (1a):** `maskiereKommentare` versuchsweise durch den gelöschten
Automaten ersetzen (Kopie im Auftragspapier, Abschnitt „Der zeichenweise
Stripper") → die vierte Fixtur muss ROT werden.

## 2 — BLOCKIEREND (C3/K1): der Riegel fängt alle vier Schreibweisen

    const verbotenesMuster = /\bdb\b|\.query\s*\(|\[\s*.?query.?\s*\]|\b(?:run|one|tx|q|pool)\s*\(/;

**Selbst gemessen**, gegen den mit dem Hausstandard bereinigten echten
Bereich: **kein Fehlalarm**, sechs `schreibePruefplan(`. Und in der
Fangrichtung: `pool.query(x)`, `pool.query (x)`, `pool["query"](x)`, `run(x)`
— alle vier gefangen; mit dem heutigen Muster gehen drei davon durch.

Die Erfolgsmeldung wird nachgezogen und zählt auf, was WIRKLICH abgedeckt ist.
Kommentar: `core/db.js` exportiert `pool, q, one, run, tx` — jeder davon ist
über einen Alias AUSSERHALB des Bereichs erreichbar, deshalb steht die
Bezeichnerliste da und nicht nur `db`.

**Gegenproben (2a)(2b):** je einmal `await run("UPDATE wartung_geraete SET
aktiv=0 WHERE studio_id=$1", [req.studioId]);` und einmal
`await pool["query"]("UPDATE wartung_geraete SET aktiv=0 …");` im Bereich
statt eines `schreibePruefplan(`-Aufrufs — beide müssen ROT werden.

## 3 — C7/K2: die C4-Zusicherung wird eng UND läuft gegen den bereinigten Quelltext

Beide C4-Prüfungen laufen ab jetzt gegen `maskiereKommentare(GERAETE_QUELLTEXT_ROH)`,
nicht gegen den rohen Text — sonst kann Prosa sie still erfüllen. Und das
300-Zeichen-Fenster wird durch einen ANKER ersetzt:

    /WITH gesperrt AS \((?:(?!\bneu AS \()[\s\S])*?FOR UPDATE\s*\)/

**Selbst gemessen:** von `WITH gesperrt AS (` bis `FOR UPDATE)` sind es 164
Zeichen; das alte 300er-Fenster endet mitten in der folgenden `neu`-CTE, ein
`FOR UPDATE)` dort erfüllte die Zusicherung. Mit dem Anker trifft die Prüfung,
und der CTE-Name kommt in beiden Fassungen genau 1× vor. `\s*` vor der
Klammer nimmt die Leerzeichen-Schreibweise mit.

**Gegenprobe (3a):** `FOR UPDATE` aus der `gesperrt`-CTE entfernen und
gleichzeitig ein `FOR UPDATE)` in die `neu`-CTE setzen → muss ROT werden
(mit dem alten 300er-Fenster wäre es grün geblieben).

## 4 — C8: Eindeutigkeit der Bereichsmarken zusichern

Analog zur C4-Positivkontrolle, gegen den ROHEN Quelltext (die Marken stehen
bewusst in Kommentaren, s. bestehender Kommentar dort):

    PRUEFPLAN_SCHREIBBEREICH_BEGINN  muss GENAU 1x vorkommen
    PRUEFPLAN_SCHREIBBEREICH_ENDE    muss GENAU 1x vorkommen

Heute je 1× (selbst gemessen). Ohne diese Zusicherung schrumpft eine
Prosa-Erwähnung den bewachten Bereich lautlos.

**Gegenprobe (4a):** die Zeichenkette `PRUEFPLAN_SCHREIBBEREICH_ENDE` ein
zweites Mal in einen Kommentar OBERHALB des Bereichs schreiben → muss ROT
werden.

## 5 — C4 (Umfang): eine Untergrenze gegen eine UNABHÄNGIGE Referenz

Die Positivkontrolle „enthält `schreibePruefplan(`" sagt DASS, nicht WIE VIEL.
Weil `maskiereKommentare` LÄNGENERHALTEND ist, gibt es jetzt eine saubere
unabhängige Referenz: die Rohlänge des Ausschnitts. Zusichern, dass der
bereinigte Abschnitt **dieselbe Länge** hat wie der rohe Ausschnitt
(`ende - zeilenbeginnNachMarke`) — schrumpft er, hat die Bereinigung Code
gefressen.

Zusätzlich die Zahl der `schreibePruefplan(`-Aufrufe gegen eine **literal
hingeschriebene** Erwartung halten (heute gemessen: 6), mit einem Kommentar,
dass diese Zahl beim Ergänzen eines Aufrufs BEWUSST nachzuziehen ist.

**Gegenprobe (5a):** im Bereich einen `schreibePruefplan(`-Aufruf entfernen
→ muss ROT werden.

## 6 — C6/K5: jeder Aufräumschritt einzeln abgesichert

Im `finally` bekommt JEDER Schritt sein eigenes `try/catch` mit
`console.error` — sonst überspringt ein geworfenes erstes DELETE die übrigen
(dann bleibt ausgerechnet „Feuerlöscher 8" liegen) UND ersetzt die
Originalmeldung des Tests. `srvEigen.close()` ebenso, und es läuft wieder
ZUERST (vor den DELETEs), wie vor dem Umbau — der stille
Reihenfolgenwechsel wird zurückgenommen.

## 7 — K3: die CASCADE-Behauptung berichtigen

Der Satz „das Kategorie-DELETE nimmt per CASCADE auch diese Zeilen mit" ist
FALSCH, soweit er `pruefbereich_bestand` einschliesst. **Selbst gemessen**
(`core/db.js:1567-1570`): diese Tabelle trägt `studio_id` und `bereich`,
keine Referenz auf `wartung_kategorien`. Der Satz wird auf das eingeschränkt,
was wirklich kaskadiert (Begehung und Sammelposten über
`wartung_geraete`/`-aufgaben`), und benennt, dass die
`pruefbereich_bestand`-Zeilen im Wegwerf-Studio liegen bleiben — genau wie
die Studios selbst, mit derselben Begründung.

## 8 — C13: die Fundstelle berichtigen

`test/run.sh:888-891` belegt die Aussage nicht — nachgezählt: 888
Schleifenkopf, 889 `echo`, 890 `if`, 891 `else`. Der Rumpf ohne `exit`
beginnt bei **892**. Richtig ist `test/run.sh:888-899` oder die Angabe des
`else`-Rumpfs ab `:892`. **Am Quelltext nachsehen, nicht von hier
abschreiben.**

## 9 — C9: das zweite `text()` wird verboten

`r.text()` ohne Klon bleibt. Damit die in Runde 4 geschlossene Falle nicht
zurückkommt, eine STATISCHE Zusicherung über den Quelltext DIESER Datei:
nach einem `pruefeKeinFehlerseiten(<r>` darf für dasselbe `<r>` kein
späteres `<r>.text()` stehen. Heute erfüllt (Punkt 1 nutzt den Rückgabewert,
alle übrigen 14 Aufrufer verwerfen ihn und lesen nicht nach).

**Gegenprobe (9a):** in Punkt 1 wieder `const htmlAusloesen = await
rAusloesen.text();` hinter den Helferaufruf setzen → muss ROT werden.

## 10 — Die kleinen, alle gemessen

* **C10:** `${ende - begin}` in der Erfolgsmeldung → `ende - zeilenbeginnNachMarke`.
* **C11:** Fixtur 3 prüft `includes('db')`, der Riegel `\bdb\b` → auf
  `verbotenesMuster.test(...)` umstellen, damit beide dasselbe Prädikat prüfen.
* **C12:** `indexOf('\n', begin)` kann -1 liefern → `assert.notStrictEqual`
  darauf, sonst beginnt der Abschnitt stillschweigend bei 0.
* **K6:** „Die BEIDEN alten Fixturen sind ERSETZT" stimmt nicht — Fixtur 1 ist
  unverändert. Satz berichtigen.
* **C14:** den `try`-Rumpf im Punkt-1-Block einrücken (rund 130 Zeilen),
  ebenso den `finally`-Rumpf. Reines Nachrücken, kein Verhaltenswechsel.

## Abnahme insgesamt

* Volle Suite `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`.
* `npm run lint`, Ergebnis WÖRTLICH melden, auch bei Grün.
* Die sieben Gegenproben (1a, 2a, 2b, 3a, 4a, 5a, 9a) einzeln, jede wörtlich
  mit EXIT und PASS/FAIL, Mutation UND Rücknahme.
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker mit, `node --check` danach, Rücknahme gegen eine unabhängige
  `cp`-Kopie mit `diff` EXIT 0.
* Am Ende `git status` sauber und der Marker-Scan nur mit Prosatreffern.
