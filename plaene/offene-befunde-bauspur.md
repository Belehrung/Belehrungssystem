# Sammelliste Bauspur (Abschnitt 3 CLAUDE.md)

Befunde: `plaene/diffpruefung-bauspur.md`.

| Kennung | Punkt | Stand |
|---|---|---|
| BS-1 | Ein SIGKILL (oder ein blockierter Prozess vor X2) hinterlässt keine Zeile in `BAU-LAEUFE.md`. Das Protokoll-JSONL zeigt den Lauf; die nächste Sandbox räumt den Cluster ab. | benannte Grenze |
| BS-2 | Ob der Anbieter Anfragen unabhängig von `store:false` aufbewahrt, ist nicht messbar. | benannte Grenze, Kopf von `bau-spur.js` |
| BS-3 | Der Kostendeckel schliesst vor dem Aufruf; ein Aufruf kann ihn um seine eigenen Kosten überschreiten. | benannte Grenze |
| BS-4 | Für einen Arbeitsbaum, dessen Eigentümer nicht root ist, ist nur der root-Fall geprüft (Meldung „dubious ownership“). | offen |
| BS-5 | Was ein Test in der Sandbox unter `/etc` und `/usr` (nur lesend eingehängt) sieht, geht über die Testausgabe an das Modell. Der Riegel ist dabei nur die zweite Schicht. | offen, Messung ausstehend |
| BS-6 | Exit 27/28 im `finally` von `bauspurLaufen` wird überschrieben: die Ausnahme läuft weiter zu `main()`, das 1 zurückgibt, und `.then` setzt `process.exitCode = 1`. Die LAUT-Zeile steht trotzdem da, der Exit ist ≠ 0. | offen, Extrarunde (eigene Lesung Runde 2) |
| BS-7 | Kopfkommentar `tools/bau-spur.js:33` nennt für `ersetze` noch `O_WRONLY|O_TRUNC`; seit F3 wird ohne `O_TRUNC` geöffnet und nach den Prüfungen gekürzt. | offen, Extrarunde (eigene Lesung Runde 2) |
| BS-8 | `baustandPflichtdateienPruefen` ist blind für Inhalt gleich + Modus geändert + `assume-unchanged`/`skip-worktree` auf einer Pflichtdatei (`git diff --quiet` sieht es nicht); `d.error` wird nicht geprüft (Meldung „Exit null“, fail closed). Schaden klein. | offen, Extrarunde (Kimi N2) |
| BS-9 | Das erweiterte Riegel-Muster `\bsk-[A-Za-z0-9_.-]{20,}` entfernt auch harmlose Zeilen mit Punkten (sichere Richtung, aber still); „keine neuen Treffer in 1372 Dateien“ steht nur im Kommentar, kein Test scannt das Repo, kein benannter harmloser Fall über 20 Zeichen. | offen, Extrarunde (Kimi N3) |
| BS-10 | P-3 hat keinen benannten Selbsttest-Fall (der Umgebungsvergleich im Kind deckt ihn nur mittelbar). | offen, Extrarunde (Kimi N4) |
| BS-11 | Zeitschranken der X2-Selbsttests (`< 1500 ms`, Frist 150 ms gegen 27×„a“) sind last- und hardwareabhängig; Flackern in der CI möglich. (Kimis Zusatz „Deploy-Gate“ trägt nicht: diese Selbsttests laufen in der CI des Belehrungssystems, nicht in der GymDocu-Suite.) | offen, Extrarunde (Kimi N5) |
