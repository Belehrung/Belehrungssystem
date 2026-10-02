# Offene Befunde zur CLAUDE.md-Neufassung (02.10.2026)

Herkunft: Bauauftrag `auftrag-claudemd-neu.md`, Prüfungen in `ASTRA-LAEUFE.md` (02.10.2026). Die Arbeitsdateien liegen in
`/workspace/claudemd-neu/`; dazu gehört `aenderungsliste.md` mit den Teilen A bis H.

| Kennung | Befund | Plan |
|---|---|---|
| CM-1 | Betreiber-Frage F1: Der Haupt-Agent baut nichts, auch keine Dokumente (10.08.). Dagegen steht die Bagatellgrenze, nach der er Kleinstkorrekturen und Textdokumente selbst schreibt. | entschieden 02.10.2026: „Kleinkram selbst“ |
| CM-2 | Betreiber-Frage F2: Gilt Prüf-Ritual Schritt 1 („Diff selbst vollständig lesen“) neben der Lesedelegation vom 30.09. fort? Und gilt „jeden Befund selbst nachmessen“ für alle Befunde oder nur für die tragenden? | entschieden 02.10.2026: „Produktion selbst“ |
| CM-3 | Frage F3: Die Datengrenze („nur Diffs, selbst geholte Gesetzestexte, git ls-files“) steht gegen die Pflicht, Testausgaben und Screenshots mitzugeben. | entschieden 02.10.2026: „Ja, erlauben“ |
| CM-4 | Frage F4: Zählt der Review-Bot am PR als „dritte Spur“ im Sinn der Spurenzahl vom 20.09.? | entschieden 02.10.2026: „Zählt nicht“ |
| CM-5 | `tools/gegenleser-repo.js`, Fixtur „DECKEL VERSETZT UND GEKUERZT“ (ab Zeile ~2410): Sie liest 11–999 auf 40 Zeilen, `bis` und `gesamt` sind also beide 40. Eine Vertauschung `bis: gesamt` bliebe unsichtbar. Das ist dieselbe Klasse, die CLAUDE.md als vierte Erscheinungsform beschreibt; die dort genannte Behebung schliesst sie nicht. Gefunden vom Bauenden beim Nachrechnen von V13, nicht selbst nachgemessen. | eigene Extrarunde am Werkzeug: Fixtur mit Datei länger als `MAX_LIES_ZEILEN` (400), z. B. 11–999 auf 500 Zeilen |
| CM-6 | Die Zielgrösse von etwa 900 Zeilen ist verfehlt: aktiviert mit 1066 Zeilen. Der Bauende nennt Kürzungskandidaten, das wären aber Inhaltsentscheidungen. | dem Betreiber mit der Freigabe vorlegen |
