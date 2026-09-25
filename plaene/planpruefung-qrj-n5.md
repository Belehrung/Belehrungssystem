# Planprüfung QR-J Nacharbeit 5 (25.09.2026)

Material: `plaene/auftrag-qrj-nacharbeit5.md` Fassung 1. Spuren (Kimi ohne Guthaben): DeepSeek mit Repo-Lesezugriff auf
`24b9be8` (Papier + Runde-5-Tabelle) und DeepSeek-Einzelaufruf (Papier, Auftrag N4, `core/qr-verbrauch.js` und
`tools/qr-journal.js` ganz). Jeder Befund am Code nachgesehen; eingearbeitet in Fassung 2.

| Nr | Quelle | Befund | Nachgesehen | Schwere | In Fassung 2 |
|---|---|---|---|---|---|
| PQ5-1 | DS B1 | §1 „Freigabe ohne Korrektur, Audit über `--studio`“ bricht an der bestehenden (b)-Prüfung ab: `--studio` muss heute ein Korrektur-Studio der Zeile sein (`tools/qr-journal.js:1215-1217`), ohne `--studio` Pflichtabbruch (`:1224`) | gelesen | blockierend | (b) für den schlüssellosen Fall ausdrücklich gelockert |
| PQ5-2 | DS B2 | Verwerfen verlangt `--studio=<subdomain>` (`:1040-1041`); §1 nennt nur „das Verwerfen“ | gelesen | blockierend | Weg-Text mit `--studio=<subdomain>` |
| PQ5-3 | DS B3 | §0 „Trockenlauf“ offen: `pruefe…` umgeht Schalter- und Pflichtargumentprüfung | gelesen (`:916-924`, `:1052-1057`, `:1277-1283`) | mittel | über `befehl…` ohne `--ja` |
| PQ5-4 | DS B4 | Korrektur-Wege enthalten `...`; keine Regel für `--von/--bis/--quelle` | gelesen (`core/qr-verbrauch.js:499-506`) | mittel | Regel: belegte Spanne aus der Fixtur, im Test benannt |
| PQ5-5 | DS B5 | §4 unvollständig: wo angenommen (ohne offenen Abschnitt / mit `--abschnitt`), Ausschluss `--uebrige-nicht-betroffen` als eigener Abbruch, Regel für die Zeilenangabe | gelesen (`tools/qr-journal.js:668-678`) | mittel | präzisiert |
| PQ5-6 | DS B6 | §1 „sonst die Freigabe“ vs. `wegFuer` „genau S“ nennt die Korrektur | gelesen | gering | Geltungsbereich genannt |
| PQ5-7 | DS B7 | „drei Zeilen“ mehrdeutig, der Weg-Teil hat keine Umbrüche; bestehende wörtliche Tests (`test_feature_qr_journal.js:1050`) | gelesen | gering | „drei kaputte Journalzeilen“, Tests genannt |
| PQ5-8 | DS B8 | Feldname offen | gelesen | gering | Feldnamen festgelegt |
