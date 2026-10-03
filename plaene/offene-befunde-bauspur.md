# Sammelliste Bauspur (Abschnitt 3 CLAUDE.md)

Befunde: `plaene/diffpruefung-bauspur.md`.

| Kennung | Punkt | Stand |
|---|---|---|
| BS-1 | Ein SIGKILL (oder ein blockierter Prozess vor X2) hinterlässt keine Zeile in `BAU-LAEUFE.md`. Das Protokoll-JSONL zeigt den Lauf; die nächste Sandbox räumt den Cluster ab. | benannte Grenze |
| BS-2 | Ob der Anbieter Anfragen unabhängig von `store:false` aufbewahrt, ist nicht messbar. | benannte Grenze, Kopf von `bau-spur.js` |
| BS-3 | Der Kostendeckel schliesst vor dem Aufruf; ein Aufruf kann ihn um seine eigenen Kosten überschreiten. | benannte Grenze |
| BS-4 | Für einen Arbeitsbaum, dessen Eigentümer nicht root ist, ist nur der root-Fall geprüft (Meldung „dubious ownership“). | offen |
| BS-5 | Was ein Test in der Sandbox unter `/etc` und `/usr` (nur lesend eingehängt) sieht, geht über die Testausgabe an das Modell. Der Riegel ist dabei nur die zweite Schicht. | offen, Messung ausstehend |
