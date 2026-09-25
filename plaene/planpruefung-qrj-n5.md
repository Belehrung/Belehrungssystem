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
| PQ5-9 | DSB 1 | §4 bricht im echten Lauf: `befehlKorrigieren` prüft frisch unter den Locks `abschnittGedecktFuer` (`tools/qr-journal.js:971-974`) — für ein gedecktes Studio immer wahr; §0 prüft nur Trockenläufe und sähe es nicht | gelesen | blockierend | Frischprüfung für den Fall angepasst; §0 mit echten Schreibläufen je Wegart |
| PQ5-10 | DSB 2 | `wegFuer`-Texte ohne `--grund`/`--studio` (Eigentümer-, keine-aufkleber-Weg) | gelesen (`core/qr-verbrauch.js:503-506`) | blockierend (mit PQ5-1/2) | jeder Weg-Text trägt alle Pflichtargumente ausser der belegten Spanne |
| PQ5-11 | DSB 3 | §4 scheitert an `:647` (Zeile global erledigt → Abbruch vor jeder Abschnittslogik) | gelesen | mittel | §4 gilt auch dort |
| PQ5-12 | DSB 1c, Frage 4 | Korrektur nach `keine_aufkleber`/Eigentümer-Erklärung: widersprüchliche Audit-Kette ohne Bezug; `erledigt_durch` kann auf die spätere Korrektur wandern; eine spätere Spanne kann als Nachbar die Obergrenze einer früheren Zeile senken (kostet Nummern) | gelesen (`vollErledigtDurch`) | gering | Payload nennt die widersprochenen Zeilen; `erledigt_durch` und Obergrenze benannt |
| PQ5-13 | DSB 6.3 | §2 nennt die zweite Formel `gedeckteAbschnitte` (`tools/qr-journal.js:1229-1230`) nicht | gelesen | gering | aus derselben Regel |

Zahlen: DS 8 (B1–B8), DSB 3 + Antworten; 13 Zeilen, keiner gefallen. Nur DS: PQ5-1/2 (Verwerfen- und (b)-Abbruch), PQ5-3..8.
Nur DSB: PQ5-9 (Schreibweg), PQ5-11, PQ5-12, PQ5-13. Beide: der Kern „genannter Weg ohne Pflichtargumente“.
