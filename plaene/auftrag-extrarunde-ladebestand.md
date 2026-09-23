# Bauauftrag Extrarunde „ladebestand" — die offenen Punkte schliessen

**Zielrepo:** `/home/user/gymdocu`, Zweig `extrarunde-ladebestand`, Basis
`e2a9e9e` (master nach dem Merge von #465).
**Grundlage:** `plaene/offene-befunde-ladebestand.md` (21 Punkte).
**Betreiber-Vorgabe 23.09.2026:** „Ich möchte ein fehlerfreies System haben."
Kein Punkt bleibt als „benannte Grenze" liegen.

**Modellwahl (vor dem Auftrag entschieden):** Standard-Executer. Punkt A ist
ein Umbau im Produktivcode, aber eine mechanische Herauslösung mit einem
VORHER gemessenen Verhaltensanker — ein falsch grünes Ergebnis ist damit
ausgeschlossen, soweit der Anker reicht.

**Nach SUCHMUSTER arbeiten, nicht nach Zeilennummer.**

---

## Die Idee in einem Absatz

Die Runden 6–9 haben einen **textuellen Riegel** über einen Quelltextbereich
von `routes/admin/geraete.js` immer weiter geschärft („im Bereich kein
Datenbankzugriff ausser über `schreibePruefplan()`"). Jede Runde fand neue
Schreibweisen, Fehlalarme und Schnittfehler. **Punkt A ersetzt das Muster durch
Struktur:** der Bereich wird eine Funktion in einem eigenen Modul, das `db`
gar nicht importiert und nur `schreibePruefplan` und zwei benannte
Lese-Helfer übergeben bekommt. Dann gibt es nichts mehr zu erraten — und
13 der 21 offenen Punkte werden gegenstandslos, weil es die Stelle, an der sie
sitzen, nicht mehr gibt.

---

## A — Punkt 6: den Schreibbereich in ein Modul ohne `db` ziehen

### A1. ZUERST der Verhaltensanker, gemessen am HEUTIGEN Code

Für Brandschutz gibt es keinen Hash über die volle Zeilenmenge (Z2 existiert
nur für Ausstattung, gemessen). **Bevor irgendetwas umgebaut wird**:

* Eine Folge von Brandschutz-POSTs gegen ein frisches Studio, die JEDEN Zweig
  des Bereichs durchläuft: `nicht_vorhanden` (Deaktivierung), `vorhanden`
  (Neuanlage mit Aufgaben), `unbekannt`, Feuerlöscher-Ablösung, eine Position
  mit `notizZusatz` (Notiz-Nachtrag über die CTE), Reaktivierung einer
  deaktivierten Zeile, fehlende `durchfuehrung` nachtragen.
  **Welche POST-Folge jeden Zweig erreicht, am Code belegen** und im Bericht
  je Zweig nennen, welcher Schritt ihn trifft (Hausregel: eine Gegenprobe,
  die den Code nicht erreicht, ist keine).
* Danach `volleZeilenmenge()` (existiert, Z2 benutzt sie) über die
  Brandschutz-Kategorie, SHA-256, Sollwert LITERAL hinterlegen.
* **Auf dem unveränderten Code messen, committen, pushen.** Erst dann A2.

**Gegenprobe (A1a):** im heutigen Bereich eine Zeile verändern, die ein
Zweig benutzt (z. B. `idx++` → `idx`) → der Hash MUSS sich ändern. Das
belegt, dass der Anker den Bereich überhaupt sieht.

### A2. Der Umbau

* Neues Modul, z. B. `core/brandschutz-schreibplan.js`, mit EINER exportierten
  Funktion, die den heutigen Bereich (von `if (antwort !== 'vorhanden')` bis
  zum Ende der `for (const g of geplant)`-Schleife) enthält.
* Eingaben als Objekt: `studioId, kategorieId, p, antwort, anzahl, geplant,
  fachfirmenExtern, heute`, dazu die Werkzeuge `schreibePruefplan`,
  `holeOderLegeAn`, `feuerloescherOhneProtokoll`. Ausgabe: die Zähler
  (`deaktiviert, angelegt, uebersprungen, praefplanZusatz`) und `abgeloest`.
* **Das Modul importiert `core/db` NICHT** und bekommt weder `db` noch `t`
  noch `pool` übergeben.
* Reihenfolge und Inhalt jeder SQL-Anweisung bleiben BYTE-GLEICH.
* Der Aufrufer in `geraete.js` ruft die Funktion und übernimmt die Zähler.

**Der Anker aus A1 muss danach unverändert gleich sein.** Weicht er ab, wird
nicht der Sollwert nachgezogen, sondern der Umbau korrigiert.

### A3. Die neuen Zusicherungen — Struktur statt Muster

1. **Erlaubnisliste der Importe des neuen Moduls**: alle `require(...)` des
   Moduls (über `maskiereKommentare`, damit Kommentare nicht zählen) müssen in
   einer LITERAL hingeschriebenen Liste stehen; `core/db` darf nicht darin
   stehen. Eine Erlaubnisliste statt eines Verbotsmusters — sie kann an einer
   neuen Schreibweise nicht vorbeilaufen.
2. **Verhaltensprobe der Funktion** mit aufzeichnenden Attrappen für die drei
   Werkzeuge: je Zweig die Folge der aufgezeichneten SQL-Aufrufe und
   Parameter gegen eine literal hingeschriebene Erwartung. Jeder
   `schreibePruefplan`-Aufruf trägt `studio_id` in Anweisung UND Parametern —
   das wird je Aufruf zugesichert (Mandantentrennung, Punkt 1 unserer
   Prüfreihenfolge).
3. **`FOR UPDATE` an der CTE `gesperrt`**: über die AUFGEZEICHNETE Anweisung
   des Notiz-Nachtrags prüfen (eine kurze Zeichenkette), nicht mehr über ein
   Fenster in `geraete.js`.

### A4. Was damit wegfällt — und JEDER Wegfall wird belegt

Die Bereichsmarken, der textuelle Riegel `PRUEFPLAN_VERBOTENES_MUSTER` samt
Fixturen, der Bereichsschnitt samt Längen-, C7-, 4b- und
`nichtLeerraum`-Zusicherungen und das FOR-UPDATE-Fenster über `geraete.js`.

**Nicht einfach löschen.** Für jede entfernte Zusicherung im Bericht nennen,
welche NEUE Zusicherung ihre Aufgabe übernimmt, oder warum die Aufgabe nicht
mehr besteht. Hausregel: eine Behebung darf Abdeckung nicht still kosten.

Damit gegenstandslos: Punkte **3, 4, 5, 7, 8, 9, 10, 11, 12, 16, 18, 20**
der Sammelliste (alle am textuellen Riegel oder am Bereichsschnitt).

---

## B — die übrigen Punkte

* **Punkt 1 (Helfer-Rumpf im C9-Selbstscan):** `pruefeKeinFehlerseiten()`
  in eine Helferdatei unter `test/helfer/` verlegen. Dann liegt ihr Rumpf
  nicht mehr in der gescannten Datei, und der Fehlalarm ist strukturell
  ausgeschlossen, nicht umgangen.
* **Punkt 2 (Destrukturierung):** das C9-Prädikat erkennt auch
  `const { text } = <r>` / `({ text } = <r>)`. Eigene Fixtur dafür, wie die
  drei vorhandenen.
* **Punkte 13 + 21 (`studio_id` in Testabfragen):** beide Befunde zeigen in
  entgegengesetzte Richtungen — ein Filter auf `studio_id` VERENGT die
  Resterkennung, ein fehlender verstösst gegen die Hausregel. Lösung, die
  beides erfüllt: die Abfragen lesen über die IDs OHNE Studio-Filter,
  liefern aber `studio_id` mit, und der Test sichert für JEDE Zeile das
  erwartete Studio zu. Das ist strenger als beide bisherigen Fassungen.
* **Punkt 14:** die Zusicherung `srvEigen.listening === false` entfernen
  (gemessen: kann nach erfolgreichem `close(cb)` nie fallen). Das echte
  Signal ist der Fehler im Rückruf (`ERR_SERVER_NOT_RUNNING`, gemessen), und
  der landet bereits im Sammler.
* **Punkt 15:** Rest-Abfrage in `try`, dann EINE Zusicherung, deren Meldung
  sowohl die Reste als auch die gesammelten Ursachen nennt.
* **Punkt 17:** `ursache()` behält Klasse und Code:
  `e instanceof Error ? \`${e.name}${e.code ? ' ' + e.code : ''}: ${e.message}\` : String(e)`.
  Gemessen: heute wird aus `TypeError x` mit Code nur `"x"`. Kommentar
  berichtigen.
* **Punkt 19:** den M10-Kommentar berichtigen (das Array war schon vorher eine
  Wertkopie; der Nutzen der Bestätigungsabfrage ist die Existenzprüfung, nicht
  der Schutz vor späterer Neuzuweisung).

---

## Abnahme

* Reihenfolge der Commits: **A1 (Anker, am alten Code) → A2+A3+A4 → B.**
* Volle Suite `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`, kein
  äusseres `flock`, Dateizahl-Ritual mit demselben Sieb, `diff` EXIT 0.
  Kommt eine neue Testdatei dazu, ist sie in `test/run.sh` einzutragen.
* `npm run lint`, wörtlich.
* Gegenproben, jede mit erwartetem Ergebnis vorher, gemessenem danach und
  ERSTER FAIL-Zeile wörtlich:
  * **A1a** — Anker sieht den Bereich (s. o.).
  * **A3-1** — `require('../core/db')` ins neue Modul → Erlaubnisliste rot.
  * **A3-2** — eine SQL-Anweisung im Modul ohne `studio_id` → Verhaltensprobe rot.
  * **A3-3** — `FOR UPDATE` aus der CTE entfernen → rot.
  * **A2** — eine SQL-Anweisung im Modul leicht verändern → Anker aus A1 rot.
  * **B-2** — Destrukturierungs-Fixtur: das Prädikat ohne die neue
    Alternative → rot.
  * **B-13/21** — eine Fixturzeile auf ein drittes Studio umhängen → rot.
* Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei ≠ 1 Fundstelle,
  Marker im Ersatztext, `node --check`, Rücknahme gegen `cp`-Kopie mit
  `diff` EXIT 0.
* Am Ende `git status` sauber, Marker-Scan 6 Treffer in
  `docs/offene-befunde-31-08-2026.md`.
* **Widersprich mit einer Messung, wenn das Papier falsch liegt.**
