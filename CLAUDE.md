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

## Kontext

Die eigentliche Arbeit findet meist im GymDocu-Repo statt
(/workspace/gymdocu, github.com/Belehrung/Gymdocu). Etablierte Regeln dort:
Deaktivieren statt Löschen, Migrationen für alle Studios, PR-Nummern erst
nennen, wenn GitHub sie bestätigt hat.
