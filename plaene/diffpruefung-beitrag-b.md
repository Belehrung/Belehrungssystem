# Diffprüfung Beitrag B (`routes/admin/geraete.js` — S1/S4/S4b)

Branch `beitrag-b-geraete-schreibreihenfolge`, zwei Commits auf master `5a194ba`.
Geprüft 20.09.2026, ~00:0x UTC.

## Meine eigenen Messungen (nicht der Bericht des Ausführenden)

| | |
|---|---|
| Volle Suite | **`SUITE_EXIT=0`**, **0** `✗ FAIL`-Zeilen, jede Summenzeile 0 FAIL |
| Dateizahl-Ritual | **344 = 344**, `diff` **EXIT 0** |
| `npm run lint` | **`LINT_EXIT=0`** (nur der npm-Update-Hinweis) |
| `node --check` | grün |
| Marker-Scan | **6**, alle in `docs/offene-befunde-31-08-2026.md` |
| Scope-Prüfung | `istGueltigeId` am neuen Eintrittspunkt (`:6431`) nachweislich im Scope — Klammertiefe 2 gegen require-Tiefe 1 |
| Berührte Dateien | nur `geraete.js` + zwei Tests + `test/run.sh`; `belehrungen.js`/`mitarbeiter.js` unberührt |

**Ein Berichtsfehler:** Der Ausführende meldete unter „Marker-Scan" *„1 Treffer
in `test_feature_wartung_geraet_neu_transaktion.js`"*. Gemessen sind es dort
**null** — seine Zeichenkette heisst `GEGENPROBE_DEFEKT_…` mit UNTERSTRICH und
trifft das Suchmuster `GEGENPROBE-DEFEKT` (Bindestrich) nicht. Folgenlos,
aber falsch berichtet. *(Eine Zahl aus einem Executer-Bericht ist eine
Behauptung — hier wieder belegt.)*

**Ein eigener Messfehler unterwegs, der hierher gehört:** Beim Prüfen der
Scope-Frage suchte ich nach `if (!istGueltigeId(id)) return res.status(400)` —
das Muster passt in dieser Datei **fünfmal**, und `findIndex` nahm die ERSTE
(`:352`) statt der neuen. Genau die Klasse, vor der unsere eigene Regel zu
Mutationsmustern warnt, nur beim Messen statt beim Mutieren. Mit einer
Volltrefferliste neu gemessen: alle zehn Fundstellen liegen im Scope.

## Zwei unabhängige Prüfspuren über den Diff

| Spur | Befunde | Kosten |
|---|---|---|
| `/code-review` (eingebaut, darf ausführen) | **15** | — |
| `kimi-k3` (fester Bündel, ein Schuss) | **2** | ~0,40 $ |

**Der wichtigste Befund kam von DREI Spuren unabhängig** — beiden Prüfern und
meiner eigenen Lesung: **der Nebenläufigkeitsbeweis trägt nicht.**

Der Kommentar behauptet, bei sequenzieller Ausführung würde „KEIN Request je
blockiert gemeldet, weil beide vor der Freigabe gar nicht erst am UPDATE
ankämen". Falsch: erreicht NUR Request 1 das UPDATE, blockiert er genau dort,
`pg_blocking_pids` meldet EINEN Blockierten, `blockiert >= 1` wird grün — ohne
jede Überschneidung. Danach committet der Halter, Request 1 schreibt, Request 2
steigt am `if` aus: ein UPDATE, ein Audit-Eintrag, alles grün, Rennen nie
stattgefunden.

## Was ich selbst nachgemessen habe

**Trägt (vier Befunde, alle „Zusicherung kann nicht rot werden"):**

1. **Der Nebenläufigkeitsbeweis** (oben) — drei Spuren.
2. **Die Z4c-Audit-Zusicherung fragt die falsche `studio_id` ab.**
   `anzahlAudit(A, gId)` filtert Studio A, der Fremd-Request läuft als B; seine
   Audit-Zeile trüge `studio_id=B` und erschiene dort nie. Entfernt jemand
   `studio_id` aus der SELECT-WHERE der Route, bleibt die Zusicherung grün.
3. **Der Z1-Kernfall unterscheidet Rollback nicht von Frühabweisung.**
   Gemessen: `intern()` (`core/fehler-antwort.js:5-9`) liefert IMMER denselben
   konstanten Text, und die Route hat **sechs** Frühausstiege (`:5450`,
   `:5464`, `:5471`, `:5479`, `:5509`, `:5513`), die ebenfalls `class="error"`
   mit non-302 rendern und nichts schreiben. Bricht der Aufbau, bleiben alle
   vier Zusicherungen grün, während die Fehlerinjektion nie gefeuert hat.
4. **Der Testaufbau schreibt ohne `studio_id`** — in der Datei, die die
   Mandantentrennung prüft.

**Beobachtung richtig, SCHWERE zu hoch (einer):**

* Gemeldet als Regression: die neue WHERE `frist_festgelegt_am IS NULL` treffe
  ein Gerät mit `''` nicht, während das `if` (`!g.frist_festgelegt_am`) es als
  offen sieht und `core/einrichtung.js:205` ebenfalls (`IS NULL OR = ''`).
  **Nachgemessen ist `''` heute NICHT erreichbar:** einziger Schreiber der
  Spalte im ganzen Bestand ist diese Route selbst (`geraete.js:6459`, schreibt
  `jetztISO()`), und keiner der drei `INSERT INTO wartung_geraete` führt die
  Spalte. Die Divergenz zwischen den beiden Orten bleibt trotzdem und wird
  geschlossen — eine Zeile.

**Neun weitere, billig und mitgenommen:** toter Defensivzweig
(`kat ? kat.name : null`), ein Kommentar, der einen Zustand beschreibt, den es
nie gab, „für null Gewinn" als zu starke Behauptung, eine Zusicherung, deren
NAME mehr verspricht als sie prüft, eine statische Prüfung, die bei
Musterfehlschlag stumm übersprungen wird, fehlender Laufzeitwächter,
handgebautes Zählwerk statt `neuerZaehler()`, die Marker-Zeichenkette, und die
zweite Kopie der `UNGUELTIGE_WERTE`-Liste samt der Zahl „zwölf
Eintrittspunkte", die jetzt dreizehn sind.

## Was das über die Spuren sagt

**Die ausführende Spur war diesmal deutlich ergiebiger** (15 gegen 2) — und
das passt zum Gegenstand: geprüft wurde ein DIFF mit fertigen Tests, und die
meisten Befunde verlangen, den Kontrollfluss des Bestands abzulaufen
(Frühausstiege, andere Schreiber derselben Spalte, bestehende Register in
anderen Testdateien). Genau dafür braucht es Repo-Zugriff. Am PAPIER war es
umgekehrt: dort fand die Ein-Schuss-Spur mit festem Bündel sechs Befunde, die
keine andere hatte.

**Das ist dieselbe Beobachtung wie am 13.09.2026, an einem dritten
Gegenstand:** verschiedene Sucher finden verschiedene Klassen — und welche
Spur ergiebig ist, hängt am GEGENSTAND, nicht am Modell. Wer daraus eine
Rangfolge macht, hat aus zwei Läufen eine Regel gemacht.
