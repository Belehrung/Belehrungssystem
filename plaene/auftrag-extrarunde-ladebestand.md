# Bauauftrag Extrarunde „ladebestand" — die offenen Punkte schliessen (Fassung 2)

**Zielrepo:** `/home/user/gymdocu`, Zweig `extrarunde-ladebestand`, Basis
`e2a9e9e` (master nach dem Merge von #465).
**Grundlage:** `plaene/offene-befunde-ladebestand.md` (21 Punkte) und die
Planprüfung `plaene/planpruefung-extrarunde-ladebestand.md` (16 Befunde aus
zwei Spuren, alle nachgemessen). Fassung 1 hatte eine falsche Tatsache
(`holeOderLegeAn` als „Lese-Helfer") und einen Anker, der nicht trug.
**Betreiber-Vorgabe 23.09.2026:** „Ich möchte ein fehlerfreies System haben."
Kein Punkt bleibt als „benannte Grenze" liegen.

**Modellwahl (vor dem Auftrag entschieden):** Standard-Executer. Die
Gefahr eines falsch grünen Ergebnisses sitzt im Anker (A1); sie wird durch
die Pflicht-Gegenproben A1a am ALTEN Code abgefangen, bevor umgebaut wird.

**Nach SUCHMUSTER arbeiten, nicht nach Zeilennummer.** Zeilenangaben unten
sind Stand `e2a9e9e` und nur Orientierung.

**Ausserhalb dieses Auftrags** (eigener nächster Beitrag der Extrarunde):
der Verklemmungskreis in `routes/module.js` (Planprüfung A-9).

---

## Die Idee in einem Absatz

Die Runden 6–9 haben einen **textuellen Riegel** über einen Quelltextbereich
von `routes/admin/geraete.js` immer weiter geschärft. **Punkt A ersetzt das
Muster durch Struktur:** der Bereich wird eine Funktion in einem eigenen
Modul, das `core/db` nicht importiert und seine Datenbankwirkung NUR über
drei ausdrücklich übergebene Fähigkeiten hat. Die Garantie lautet damit
nicht „keine Datenbankzugriffe", sondern: **kein eigener DB-Import;
DB-Wirkung nur über benannte Fähigkeiten, deren Zählvertrag geprüft ist.**

Die drei Fähigkeiten, richtig eingeordnet:

| Fähigkeit | Art | Zählweg heute |
|---|---|---|
| `schreibePruefplan(sql, params)` | gezählter SQL-Schreibkanal | zählt `rowCount` selbst in `praefplanGeaendert` |
| `holeOderLegeAn(studioId, kategorieId, name, anlegen)` | **ZWEITER Schreibkanal** (eigene `db.tx`, `INSERT`, `art`-UPDATE) | Aufrufer addiert `eintrag.neu ? 1 : 0` und `eintrag.artGeaendert \|\| 0` |
| `feuerloescherOhneProtokoll(studioId, kategorieId)` | reiner Leser | — |

---

## A1 — ZUERST der Verhaltensanker, gemessen am HEUTIGEN Code

Ein einzelner Endhash über `volleZeilenmenge()` trägt NICHT (nur aktive
Zeilen, nur Teilspalten, Deaktivieren+Reaktivieren heben sich auf, SQL-Leerraum
unsichtbar). **`volleZeilenmenge()` NICHT erweitern** — an ihr hängt der
committete Z2-Literalhash `ed8ceb41…` für Ausstattung.

### A1.0 Szenarien und Zweigtabelle

Je Szenario ein EIGENES frisches Studio (kein Endzustand, der frühere Schritte
überdeckt). Altbestände, die kein POST herstellen kann, werden per direktem
`INSERT`/`UPDATE` angelegt — ausdrücklich als „Schritt 0" benannt (Muster wie
Punkt 1/4c der Testdatei; Wegwerf-DB, kein Deploy-Gate-Problem).

Pflicht: im Bericht eine Tabelle **Zweig ↔ auslösendes Szenario ↔ Beleg am
Code**. Mindestens diese Zweige:

| Zweig im Bereich | Szenario (Vorschlag) |
|---|---|
| `antwort !== 'vorhanden'` → Deaktivierung (inkl. äusserem `continue`) | vorher `vorhanden`, dann `nicht_vorhanden` |
| Neuanlage mit Aufgaben (`idx++`) | frisch `vorhanden` |
| `schonDa` aktiv, nichts anfassen | zweimal derselbe POST |
| `schonDa` inaktiv → Reaktivierung | `vorhanden` → `nicht_vorhanden` → `vorhanden` |
| `!schonDa.durchfuehrung` → Nachtrag | Schritt 0: Vorlagenzeile mit `durchfuehrung = NULL` |
| `art`-Korrektur in `holeOderLegeAn` (`artGeaendert`) | Schritt 0: Vorlagenzeile mit falscher `art` |
| Feuerlöscher-Ablösung (`for (const a of alt)`) | Schritt 0: `Feuerlöscher 1`, `Feuerlöscher 2` ohne Protokoll, dazu einer MIT Protokoll (bleibt) |
| `notizZusatz` → Notiz-CTE mit `FOR UPDATE` | Position mit Anzahl, zweiter POST mit anderer Anzahl |
| `fachfirmenExtern && g.wer === FACHFIRMA` → überspringen | Zuständigkeit `zentrale` |
| `g.sammelblatt` → überspringen | Position mit Sammelblatt-Gerät |

**Nicht Zweige des Bereichs, getrennt benennen:** `unbekannt` endet VOR dem
Bereich (`if (antwort === 'unbekannt') continue;`) — als Routenszenario
prüfen (schreibt nur `pruefbereich_bestand`, keine Prüfplan-Schrift). Die
Falschkante von `if (kategorieId)` ist über keinen POST erreichbar (die Route
legt die Kategorie vor der Schleife an) — als unerreichbar ausweisen, Code
bleibt.

### A1.1 Zwei Anker je Szenario

1. **Schreibspur (DB-Ebene):** im Testprozess `core/db` umhüllen (`run`,
   `one`, `q`, `tx` und die Methoden des an `tx` übergebenen `t`) und je
   Szenario die Folge `(methode, sql, params)` WÄHREND DES POST aufzeichnen
   (Schritt 0 nicht). Normalisieren nur, was zwischen Läufen schwankt: IDs →
   Ordnungsmarken in Reihenfolge des ersten Auftretens; Datums-/Zeitwerte →
   Abstand zu heute (ein fälliges Datum in 12 Monaten bleibt so von einem in
   24 unterscheidbar). **SQL wird NICHT normalisiert** — byte-genau. Ausschlüsse (z. B. Audit-Tabellen, wenn deren
   Nutzlast schwankt) als LITERALE Liste mit Begründung.
   Die Spur wird am alten Code aufgezeichnet und als Datei unter `test/`
   committet (Golden File). **Die Suite erzeugt sie nie selbst neu**; bei
   Abweichung meldet der Test den ersten abweichenden Eintrag wörtlich.
2. **Zustand:** eigene Funktion `brandschutzZustand(sid)` — ALLE Zeilen der
   Brandschutz-Kategorie INKLUSIVE inaktiver, mit `aktiv, name,
   intervall_monate, durchfuehrung, notizen, art, frist_herkunft, frist_norm`
   und `naechste_faelligkeit` als Abstand zu heute (Monate/Tage), dazu die
   Aufgaben (mit `aktiv`, `reihenfolge`) und die `pruefbereich_bestand`-Zeilen
   des Studios. SHA-256 je Szenario, Sollwert LITERAL.

Die Schreibspur deckt die ganze Route ab, nicht nur den Bereich — damit ist
auch die Lücke K-3 geschlossen (ein neuer Prüfplan-Schreibzugriff irgendwo im
Fenster vor `ladeBestandStreng()` ändert die Spur).

### A1a — Gegenproben am ALTEN Code, BEVOR umgebaut wird

Jede einzeln, je mit erstem FAIL wörtlich; jede muss MINDESTENS EINEN der
beiden Anker rot machen (welchen, im Bericht nennen):

| Mutation im heutigen Bereich | erwartet |
|---|---|
| `idx++` → `idx` | Zustand rot |
| `? 'vorgang' : 'geraet'` vertauschen | Zustand rot |
| `faelligAm: plusMonate(heute, g.intervallMonate)` → `faelligAm: heute` | Zustand rot |
| `fristHerkunft: g.fristHerkunft` → `null` (und `fristNorm` → `null`) | Zustand rot |
| Deaktivierungs-UPDATE `SET aktiv = 0` → `SET aktiv = aktiv` | beide rot |
| `fachfirmenExtern && …` → `false && …` | beide rot |
| `const alt = await feuerloescherOhneProtokoll(…)` → `const alt = []` | beide rot |
| nur Leerraum INNERHALB eines SQL-Template-Literals ändern | Schreibspur rot, Zustand grün — **genau so ist es richtig** |
| Positivkontrolle: `durchfuehrung: g.wer` → `'betreiber'` | Zustand rot |

**Auf dem unveränderten Code messen, committen, pushen.** Erst dann A2.

---

## A2 — Der Umbau

* Neues Modul `core/brandschutz-schreibplan.js`, EIN Export, z. B.
  `schreibeBrandschutzPosition(eingabe, faehigkeiten)`, aufgerufen **je
  Position** innerhalb von `for (const p of brandschutz.POSITIONEN)`.
* `eingabe`: `{ studioId, kategorieId, p, antwort, geplant, fachfirmenExtern,
  heute }` — `anzahl` NICHT (wird im Bereich nicht gelesen).
* `faehigkeiten`: `{ schreibePruefplan, holeOderLegeAn,
  feuerloescherOhneProtokoll }` — sonst nichts.
* Rückgabe: ein DELTA `{ deaktiviert, angelegt, uebersprungen,
  praefplanZusatz, abgeloest }`. `praefplanZusatz` enthält NUR die Schriften
  aus `holeOderLegeAn` (`neu`, `artGeaendert`); die Schriften über
  `schreibePruefplan` zählt dessen Closure weiterhin selbst.
* Der Aufrufer **addiert** (`deaktiviert += delta.deaktiviert`, …,
  `abgeloest.push(...delta.abgeloest)`), er weist nicht zu.
* Kontrollfluss: das `continue` am Ende des Deaktivierungszweigs zielt auf
  die ÄUSSERE Schleife und wird zu `return delta`. Die übrigen `continue`
  (innere `for (const g of geplant)`) bleiben.
* `req.studioId` → `studioId`. Imports des Moduls: `./brandschutz-vorlage`
  (`brandschutz`) und `./datum` (`plusMonate`) — kein Nachbau.
* **Jede SQL-Zeichenkette bleibt BYTE-GLEICH**, auch der Leerraum in
  mehrzeiligen Template-Literalen (die Schreibspur aus A1 prüft das).
* Fehler der Fähigkeiten werden NICHT gefangen — sie laufen wie heute bis zum
  äusseren `catch` der Route.

**Beide Anker aus A1 müssen danach unverändert gleich sein.** Weicht einer
ab, wird der Umbau korrigiert, nicht der Sollwert.

---

## A3 — Die neuen Zusicherungen: Struktur statt Muster

1. **Import-Erlaubnisliste, transitiv:** alle `require(...)` des Moduls (über
   `maskiereKommentare`) stehen in einer LITERALEN Liste
   (`./brandschutz-vorlage`, `./datum`); für jedes erlaubte Modul ebenso seine
   eigenen `require`s (`brandschutz-vorlage` → `./frist-herkunft`; `datum` und
   `frist-herkunft` → keine). `core/db` kommt in der ganzen Hülle nicht vor.
2. **Produktivbindung in `geraete.js`:** genau EIN `require` des Moduls,
   genau EIN Aufruf des Exports, und zwar innerhalb der POSITIONEN-Schleife
   der Brandschutz-Route; die Schlüssel der beiden Aufruf-Objekte gegen eine
   LITERALE Liste (schliesst `db`/`t`/`pool` als Parameter aus). Dazu: die
   kennzeichnenden Stellen des alten Bereichs kommen in `geraete.js` NICHT
   mehr vor (z. B. `WITH gesperrt AS`, `abgeloest.push(a.name)`,
   `if (!schonDa.durchfuehrung)`) — sonst bliebe eine Kopie inline.
3. **Verhaltensprobe** mit aufzeichnenden Attrappen je Zweig aus A1.0:
   * die Folge der Fähigkeiten-Aufrufe (`name, sql, params`) gegen eine
     LITERALE Erwartung;
   * das zurückgegebene DELTA je Zweig LITERAL (Attrappen liefern gestellte
     `neu`/`artGeaendert`);
   * jeder `schreibePruefplan`-Aufruf trägt `studio_id` im SQL UND die
     Studio-ID in den Parametern (Mandantentrennung);
   * `FOR UPDATE` an der CTE `gesperrt` in der AUFGEZEICHNETEN Anweisung;
   * kein aufgezeichnetes SQL enthält `DELETE` (Deaktivieren statt Löschen).
   **Reihenfolge:** die semantischen Prüfungen (`studio_id`, `FOR UPDATE`,
   kein `DELETE`) VOR dem literalen Folgenvergleich — sonst fällt eine
   Gegenprobe am allgemeinen Vergleich statt an ihrer eigenen Zusicherung.
4. **Fehlerproben:** jede Fähigkeit wirft beim ersten, mittleren und letzten
   Aufruf eines Zweigs → die Funktion lehnt mit DEMSELBEN Fehlerobjekt ab, und
   nach dem Wurf ist kein weiterer Fähigkeiten-Aufruf aufgezeichnet.

---

## A4 — Was wegfällt, und JEDER Wegfall wird belegt

Weg: Bereichsmarken, `PRUEFPLAN_VERBOTENES_MUSTER` samt Fixturen 1 und 3
(Riegel-Prädikat), Bereichsschnitt samt Längen-, C7-, 4b-, 4c- und
`nichtLeerraum`-Zusicherungen, FOR-UPDATE-Fenster über `geraete.js`, die
`schreibePruefplan(`-Zählung.

**Bleibt:** Fixturen 2 (URL mit zweitem `//`) und 4 (Anführungszeichen im
Regex-Literal) prüfen `maskiereKommentare()` selbst — sie bleiben, als eigener
Masker-Block.

**`test_feature_brandschutz.js` umstellen**, nicht löschen: die Zusicherungen,
die heute im Routenblock suchen (`SET aktiv = 0`, „kein `DELETE`",
`if (p.schluessel === 'feuerloescher')` samt Ablöse-UPDATE, `NOT EXISTS …
wartung_pruefungen`, `abgeloest.push(a.name)`, `if (!schonDa.durchfuehrung)`),
gehen auf das neue Modul (Quelltext) bzw. auf die Verhaltensprobe. Die
„kein `DELETE`"-Prüfung gilt danach für Modul UND Routenblock.

Im Bericht je entfernter Zusicherung: welche neue übernimmt, oder warum die
Aufgabe entfällt. Gegenstandslos werden damit die Sammellisten-Punkte
**3, 4, 5, 7, 8, 9, 10, 11, 12, 16, 18, 20**.

---

## B — die übrigen Punkte

* **Punkt 1:** `pruefeKeinFehlerseiten()` nach `test/helfer/` verlegen.
* **Punkt 2:** C9-Prädikat erkennt `const { text } = <r>` und
  `({ text } = <r>)` — je Schreibweise EINE eigene Fixtur.
* **Punkte 13 + 21:** die Lese-Abfragen über die IDs OHNE Studio-Filter,
  `studio_id` mitliefern, je Zeile das erwartete Studio zusichern. Dazu die
  Aufräum-`DELETE`s (`wartung_geraete`, `wartung_kategorien`) mit
  (id, studio_id)-PAAREN, z. B. über `unnest($1::int[], $2::int[])`.
* **Punkt 14:** `srvEigen.listening === false` entfernen.
* **Punkt 15:** Rest-Abfrage in `try`; scheitert sie, ist IHR Fehler selbst
  eine Ursache. Dann EINE Zusicherung, deren Meldung Reste UND Ursachen nennt.
* **Punkt 17:** `ursache()`:
  `e instanceof Error ? \`${e.name}${e.code ? ' ' + e.code : ''}: ${e.message}\` : String(e && e.message != null ? e.message : e)`
  — mit drei literalen Zusicherungen direkt dahinter:
  `TypeError` mit `code: 'E_X'` → `'TypeError E_X: x'`; `{message:'x'}` →
  `'x'`; `'roh'` → `'roh'`. Kommentar berichtigen.
* **Punkt 19:** M10-Kommentar berichtigen.

---

## Abnahme

* Commits: **A1 (Anker + Gegenproben, am alten Code) → A2+A3+A4 → B.**
* Volle Suite `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`, kein
  äusseres `flock`, Dateizahl-Ritual mit demselben Sieb, `diff` EXIT 0. Neue
  Testdateien in `test/run.sh` eintragen.
* `npm run lint`, wörtlich.
* Gegenproben, je erwartet vorher / gemessen danach / erste FAIL-Zeile:
  * **A1a** — die ganze Tabelle oben, am ALTEN Code.
  * **A2** — nach dem Umbau Leerraum in einem SQL-Literal des Moduls ändern →
    Schreibspur rot.
  * **A3-1** — `require('./db')` ins Modul → Erlaubnisliste rot.
  * **A3-2** — alter Bereich zusätzlich inline in `geraete.js` stehen lassen
    (Modul nur importiert) → Produktivbindung rot.
  * **A3-3** — `studio_id` aus einer Anweisung im Modul → Mandanten-Zusicherung
    rot (nicht erst der Folgenvergleich).
  * **A3-4** — `FOR UPDATE` aus der CTE → rot, an der FOR-UPDATE-Zusicherung.
  * **A3-5** — `praefplanZusatz` ohne `artGeaendert` → Delta-Zusicherung rot.
  * **A3-6** — `try { … } catch { return delta; }` um den Rumpf → Fehlerprobe rot.
  * **A3-7** — Aufrufer weist zu statt zu addieren → Schreibspur/Zustand oder
    Meldungszahl rot (welches, nennen).
  * **B-2** — Prädikat ohne die neue Alternative → Destrukturierungs-Fixtur rot.
  * **B-13/21** — eine Fixturzeile auf ein drittes Studio umhängen → rot.
  * **B-17** — `${e.name}` entfernen → literale `ursache`-Zusicherung rot.
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker im Ersatztext, `node --check`, Rücknahme gegen `cp`-Kopie mit
  `diff` EXIT 0.
* Am Ende `git status` sauber, Marker-Scan 6 Treffer in
  `docs/offene-befunde-31-08-2026.md`.
* **Widersprich mit einer Messung, wenn das Papier falsch liegt.**
