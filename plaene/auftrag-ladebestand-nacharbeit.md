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
  (auch ohne Änderung), sobald die Datenbank wieder erreichbar ist — der
  Abgleich holt dann nach, was fehlt."*
  Der erste Satz („Eure Antworten sind gespeichert.") bleibt auf BEIDEN
  Wegen, er ist auf beiden wahr (`:2555-2574` speichert vor der Schleife).

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

**Gegenprobe (Abnahmekriterium, wörtlich gemessen):** `:2121` von `idx` auf
`0` → Z2 muss ROT werden. Ebenso `:2118` und `:2137`. Und die
Positivkontrolle: unverändert → GRÜN.

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
