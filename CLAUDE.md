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

## Kontext

Die eigentliche Arbeit findet meist im GymDocu-Repo statt
(/workspace/gymdocu, github.com/Belehrung/Gymdocu). Etablierte Regeln dort:
Deaktivieren statt Löschen, Migrationen für alle Studios, PR-Nummern erst
nennen, wenn GitHub sie bestätigt hat.
