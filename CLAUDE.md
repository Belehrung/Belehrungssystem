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
