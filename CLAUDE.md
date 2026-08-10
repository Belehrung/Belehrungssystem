# Arbeitsweise in diesem Projekt

## Umsetzung nur über den Executer-Agenten

Vorgabe des Betreibers (10.08.2026): Der Haupt-Agent baut selbst nichts.

- Jede Umsetzungsarbeit (Code, Dateien, Migrationen, Dokumente) wird an den
  Subagenten `executer` delegiert (.claude/agents/executer.md, läuft auf Sonnet).
- Der Haupt-Agent formuliert klar umrissene Aufträge, trifft die Entscheidungen
  und prüft am Ende das Ergebnis SELBST — Tests laufen lassen, Dateien lesen,
  nicht dem Bericht des Subagenten allein glauben.
- Lesen, Diagnose, Recherche und Git-Verwaltung darf der Haupt-Agent weiterhin
  selbst erledigen; nur das Bauen ist delegiert.

## Kostenregeln (Verfeinerung 10.08.2026, vom Betreiber gebilligt)

Ziel: Qualität halten, Kosten senken. Delegation hat Fixkosten (Auftrag
formulieren, Einlesen des Subagenten, Bericht, Prüfung) — sie lohnt erst,
wenn die Umsetzung selbst größer ist als diese Fixkosten.

- **Bagatellgrenze:** Kleinstkorrekturen (einzelne Zeilen, Tippfehler,
  Config-Werte) und Textdokumente, deren Inhalt der Haupt-Agent ohnehin
  wörtlich vorgibt, schreibt er direkt — ein Kopier-Subagent kostet nur.
  Ab etwa einer Datei echter Umsetzung: Executer.
- **Bündeln:** Mehrere kleine Änderungen in EINEN Executer-Auftrag packen
  statt einzeln zu delegieren.
- **Kostenbewusst prüfen:** Diffs und geänderte Stellen gezielt lesen und
  die Tests laufen lassen — nicht ganze Dateien nacherzählen lassen. Die
  Prüfung selbst bleibt Pflicht, nur ihr Umfang ist gezielt.
- **Hausregeln gehören ins Zielrepo:** Der Executer liest zu Beginn die
  CLAUDE.md des Repos, in dem er arbeitet (steht in seiner Definition).
  Projektregeln stehen deshalb DORT und werden nicht in jedem Auftrag
  wiederholt.

## Vorarbeit nach unten (Betreiber-Vorgabe 10.08.2026)

Der teuerste Posten ist nicht das Bauen, sondern das LESEN — und zwar das des
Haupt-Agenten. Suchen im Code kostet auf dem starken Modell ein Vielfaches
dessen, was es unten kostet. Deshalb:

- **Suchen und Lokalisieren gehen an den `kundschafter`** (Haiku, nur lesend):
  „Wo steht X, wie sieht Y aus, welche Stellen betrifft Z?" Er liefert Pfade,
  Zeilennummern und wörtliche Auszüge. Der Haupt-Agent liest große Dateien
  nicht mehr selbst durch.
- **Beurteilen bleibt oben.** Der Kundschafter sagt, WO etwas steht — nie, ob
  es gut ist. Diffs, Entwürfe und Abnahmen liest der Haupt-Agent im Original;
  eine Zusammenfassung enthält nur die Fehler, die ihr Verfasser kennt.
- **Auszüge in den Auftrag legen.** Was der Kundschafter geliefert hat, kommt
  wörtlich in den Executer-Auftrag. Dann muss der Executer die Datei nicht
  noch einmal suchen und lesen — dieselbe Arbeit wird sonst dreimal bezahlt.
- **Nacharbeit geht an DENSELBEN Agenten** (Fortsetzung statt Neustart). Ein
  neuer Agent liest alles noch einmal von null; der bestehende hat es schon.
- **Weniger, größere Aufträge.** Die Fixkosten fallen je Delegation an, nicht
  je Änderung.

## Große Recherche-Läufe: die teuerste Einzelentscheidung

Am 10.08.2026 kosteten drei vielköpfige Recherche-Läufe zusammen rund vier
Millionen Subagenten-Token — mehr als sämtliche Bau-Aufträge des Tages
zusammen. Einer davon starb an einem Sitzungslimit und lieferte gar nichts.
Das ist der größte Kostenhebel, den es gibt; alles andere ist Feinjustierung.

Vor jedem vielköpfigen Lauf beantworten:

1. **Hängt eine Entscheidung daran?** Eine Frage, die nur Neugier befriedigt,
   rechtfertigt keinen Fächer aus zwölf Agenten. Eine, die über Geld,
   Rechtssicherheit oder eine Architektur entscheidet, schon.
2. **Reicht ein Agent?** Der Fächer lohnt, wenn die Frage GENUINE Blickwinkel
   hat, die einander nicht sehen. Fünf Agenten, die dasselbe googeln, kosten
   fünfmal so viel für dasselbe Ergebnis.
3. **Was ist die billigste Antwort, die die Frage erledigt?** Ein `grep`, ein
   Test, ein Blick ins Repo — sehr oft ist es das. Erst wenn das nicht trägt,
   ein Agent; erst wenn EIN Agent nicht trägt, mehrere.
4. **Klein anfangen.** Lieber ein Lauf mit vier Agenten und danach gezielt
   nachlegen als einer mit vierundzwanzig, von dem zwanzig am Limit sterben.

Und: Ein Lauf, der abbricht, hat NICHTS geliefert — nicht „keine Befunde".
Das Ergebnis dann als das benennen, was es ist: ungeprüft.

## Recherche-Regeln (10.08.2026, empirisch geprüft)

Bei einer Markenrecherche meldeten fünf von sechs Agenten „Register nicht
erreichbar" und lieferten damit keine Aussage. Einer lieferte eine belastbare:
Er suchte zusätzlich nach einem Namen, den es GEBEN musste, fand ihn — und
hatte damit bewiesen, dass seine Abfrage funktioniert. Erst danach war sein
„0 Treffer" etwas wert.

- **Die Positivkontrolle ist Pflicht.** Ein negatives Ergebnis zählt nur, wenn
  dieselbe Methode nachweislich ein positives liefern kann. „Nichts gefunden"
  ohne Gegenprobe heißt „nicht gesucht" — es ist dieselbe Falle wie das leere
  Prüfergebnis, nur in der Recherche.
- **Der erste Fehlschlag ist keine Antwort.** 503, leere Seite, Zeitüberschreitung:
  Das ist der Anfang der Suche, nicht ihr Ende. Andere Endpunkte, andere
  Werkzeuge, andere Formulierung — und wenn wirklich nichts geht, wird die
  Lücke ausdrücklich benannt statt in ein „keine Treffer" verkleidet.
- **Diese Anforderung gehört in den Auftrag.** Agenten in einem Rechercheauftrag
  lesen diese Datei nicht; die Positivkontrolle muss im Prompt stehen.

Was die Umgebung hier WIRKLICH kann (am 10.08.2026 nachgemessen, nicht vermutet):

- `curl` über den Proxy erreicht das offene Netz (example.com und tmdn.org je
  HTTP 200). Für APIs und einfache Seiten ist das der verlässlichste Weg.
- **Der Browser (Chromium/Playwright) erreicht das Internet NICHT** — selbst
  example.com scheitert mit ERR_CONNECTION_RESET. Er ist ausschließlich für
  lokale Server da (Screenshots der eigenen Anwendung — das funktioniert und
  wurde heute mehrfach genutzt). Wer ihn für eine öffentliche Seite einplant,
  plant einen Fehlschlag ein.
- Viele Register (TMview, EUIPO) sind reine JavaScript-Anwendungen: `curl`
  bekommt dort nur die leere Hülle. Deshalb sind solche Auskünfte hier
  grundsätzlich unvollständig — und das ist zu sagen, nicht zu kaschieren.

## Prüf-Ritual des Haupt-Agenten (Verfeinerung 10.08.2026)

Reihenfolge nach jedem Executer-Auftrag, vor jedem Commit:

1. **Diff vollständig lesen**, Datei für Datei — nie den Bericht statt
   des Diffs. Ein Bericht kann nur Fehler enthalten, die der Ausführende
   kennt; Fehler sind definitionsgemäß das, was er nicht kennt.
2. **Beweise sichten statt nachbauen:** Der Executer liefert Testausgaben
   wörtlich und bei UI-Änderungen Screenshots MIT (steht in seiner
   Definition). Der Haupt-Agent beurteilt sie; Stichproben bleiben erlaubt.
3. **Vier Augen bei nicht-trivialen Diffs** (mehr als eine Datei echter
   Logik): unabhängige Review über den Diff (/code-review) — der
   Entwerfer ist für die Fehler seines eigenen Entwurfs blind.
4. **Volle Testsuite** (test/run.sh). WÄHREND des Laufs keine parallelen
   Skripte gegen dieselbe DB: der Studio-Zähl-Wächter schlägt sonst
   falsch an, und eine Pipe (`| tail`) verschluckt seinen Fehler-Exit
   (beides passiert am 10.08.2026).
5. Erst dann Commit und Push. PR-Nummern erst nennen, wenn GitHub sie
   bestätigt hat.
6. **Die CI ist die letzte Instanz, nicht der eigene Prüfstand.** Fertig
   ist, was GitHub Actions grün nennt. Der Merge-Link geht deshalb ERST
   nach grüner CI an den Betreiber (10.08.2026: die lokale Suite meldete
   grün, während die CI rot war; und drei PRs wurden 30–84 Sekunden vor
   dem Ende ihrer Prüfungen gemergt, weil der Link zu früh kam).

7. **Nach dem Merge: `bash tools/live-check.sh`.** Der öffentliche Teil des
   Live-Betriebs IST von hier aus erreichbar — das war lange eine falsche
   Annahme meinerseits. Der Check prüft von außen, ob der Betrieb noch steht
   (Landingpage, Echtheitsprüfung, Abweisung auf der Studio-Subdomain,
   ausgelieferte Handbuch-Version, Zertifikatslaufzeit). Bei GymDocu ist er
   nach jedem Merge fällig, weil der Merge dort automatisch deployt.
   Achtung: Er sagt „der Betrieb läuft", NICHT „die Änderung wirkt richtig" —
   was in der Datenbank steht, bleibt unsichtbar und soll es bleiben.

## Prüfstand-Regeln (10.08.2026)

Der Prüfstand war großzügiger als jede echte Umgebung und meldete
deshalb grün, was rot war. Daraus folgt:

- **Im unprivilegiertesten Umfeld prüfen, nicht im bequemsten.** Der
  Arbeitscontainer läuft als root, der CI-Runner nicht. Wo Rechte eine
  Rolle spielen, zusätzlich unprivilegiert laufen lassen
  (`sudo -u nobody env HOME=/tmp node …`).
- **Tests fassen weder echtes Dateisystem noch echte Prozesse an.**
  Dieselbe Suite läuft auf dem Live-Server als Deploy-Gate — ein Test,
  der dort `pm2`, `nginx` oder `/var/www` anfasst, ist eine Waffe.
  Stubben; der Stub ist dann zugleich der Beweis, dass das Richtige
  aufgerufen wurde.
- **Leeres Ergebnis ist nicht sauberes Ergebnis.** Ein Lauf, dessen
  Prüfstufe abgestürzt ist, meldet „keine Befunde" und meint „niemand
  hat geprüft". Jedes Gate muss „geprüft und sauber" von „nicht
  geprüft" unterscheiden können.
- **Ein Agent, der abbricht, ist wertvoller als einer, der immer
  liefert.** Fehlt eine Vorbedingung, ist der Abbruch mit Rückfrage das
  richtige Ergebnis — nicht etwas Plausibles hinzubauen.

## Kontext

Die eigentliche Arbeit findet meist im GymDocu-Repo statt
(/workspace/gymdocu, github.com/Belehrung/Gymdocu). Etablierte Regeln dort:
Deaktivieren statt Löschen, Migrationen für alle Studios, PR-Nummern erst
nennen, wenn GitHub sie bestätigt hat.
