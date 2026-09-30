# Auftrag SG Nacharbeit 2 (30.09.2026, klein)

Grundlage: Lesespur Runde 2 (`scratchpad/sgd/antwort-n1.txt`, B1–B8). Baum `/workspace/gymdocu-sg`, Kopf `ebb21b4`.
Planprüfung ausgelassen: fünf kleine, vom Prüfer benannte Korrekturen ohne neue Mechanik. Einordnung: Standard.
Ausführende Claude-Spur für SG ausgelassen (Betreiber 30.09.: DeepSeek zuerst; der Bau hat 127 Mutanten selbst rot
gemessen, der Workflow gattet nichts).

1. **B1:** `nichts_zu_pruefen` nur, wenn zusätzlich `semgrep.errors` und `time.fixpoint_timeouts` leer sind; sonst
   `nicht_geprueft` (Widerspruch Referenz/Semgrep). Test + Gegenprobe.
2. **B2/B3:** Falltabelle der Zustandsfrage bekommt eine literale Sollzahl (14) und je Fall den literalen Zustand; die
   redundante Zeile `:489` entfernen oder zu einer eigenständigen Zusicherung machen. Gegenprobe: ein Fall gestrichen → ROT.
3. **B4:** Fixtur `TIMEOUT_NICHT_AUSGEWAEHLT_ECHT` (`regex_dos`) kann mit den sechs Regeln nicht entstehen — Herkunft
   klären; ist der Zweig „nicht ausgewählte Regel“ im neuen Aufbau unerreichbar, Fixtur als konstruiert kennzeichnen und
   den Zweig im Kommentar so benennen.
4. **B8:** eine geänderte Probedatei (`ops/semgrep-probe/`) gilt als vom Kontrolllauf geprüft (nicht „ungescannt“);
   Zusammenfassung nennt „Probedatei geändert — geprüft durch den Kontrolllauf“. PR nur mit Probedatei → nicht rot. Test.
5. **B6:** Kopfkommentar `ops/schluessel-rotieren.js:77-80` präzisieren („IDs und Länge, nie der Wert“).

Volle Suite + Dateizahl-Ritual. Bericht knapp.

-- Ende des Auftrags --
