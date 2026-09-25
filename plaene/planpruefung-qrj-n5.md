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

## Zweite Runde (Fassung 2)

Spuren: DeepSeek mit Repo-Lesezugriff (Papier + Planprüfung) und DeepSeek-Einzelaufruf (Bündel wie Runde 1 mit Fassung 2).
Eingearbeitet in Fassung 2.1.

| Nr | Quelle | Befund | Nachgesehen | Schwere | In Fassung 2.1 |
|---|---|---|---|---|---|
| PQ5b-1 | DSB 1 | eine Korrektur, die einer `keine_aufkleber`- oder Eigentümer-Erklärung widerspricht, wird nur im Payload benannt — die widerlegte Erklärung bleibt tragende Deckung und hält die übrigen Kandidaten frei (Doppelvergabe für Dritte) | gelesen (`core/qr-verbrauch.js:426-427`, `:438-439`) | blockierend | Widerlegungsregel: eine spätere Korrektur eines von der Erklärung gedeckten Studios nimmt ihr die tragende Wirkung |
| PQ5b-2 | DS B1 | §4 nennt die Stelle nicht, an der ein gedecktes Studio heute abgewiesen wird: `abschnittWaehlen` (`tools/qr-journal.js:669-683`, `offeneAbschnitteFuer` leer) | gelesen | blockierend | genannt |
| PQ5b-3 | DS B2 | die verbleibende Ablehnung (zweite Korrektur desselben Studios) nennt „Zeile der tragenden Deckung“ — richtig ist die eigene Korrekturzeile | gelesen | gering | berichtigt |
| PQ5b-4 | DS B4 | §1 nennt `:1207-1208` (`!korrekturen.length`) nicht | gelesen | gering | genannt |
| PQ5b-5 | DS B5, DSB 2 | `erledigt_durch` wandert zwangsläufig (`vollErledigtDurch` = jüngste Metazeile); Texte „erledigt durch Zeile N“ (`:647`, `:1126`) werden dann schief | gelesen (`core/qr-verbrauch.js:467-472`) | gering | Texte „zuletzt durch Zeile N“ |
| PQ5b-6 | DS B6 | leere-`every`-Klasse auch `test_feature_qr_journal.js:1223` (G5); `:1614` ist durch die literale Zusicherung `:1612` gedeckt | gelesen | gering (für `:1614` gefallen) | `:1223` mit aufgenommen |
| PQ5b-7 | DS B3 | Geltungsbereich §1 ist am Code entschieden (`core/qr-verbrauch.js:307-313`, `:326-331`), keine Messung nötig | gelesen | gering | umformuliert |
| PQ5b-8 | DS 8, DSB 6 | neues Feld `widerspricht_zeilen` ohne Typprüfung in `metaZeileVollstaendig`; „grep auf alte Namen“ unterbestimmt (Schalter UND Journal-/Payload-Felder `core/qr-verbrauch.js:257,297`, `tools/qr-journal.js:1202-1204,1323`) | gelesen | gering | festgelegt |
| PQ5b-9 | DSB Frage 2 | echter Schreiblauf je Wegart reicht nicht: der Zustand „global erledigt, keine eigene Korrektur von S in i“ und der Widerlegungsfall brauchen je einen eigenen | Papier | mittel | aufgenommen |

Zahlen: DS 6 + Tabelle zu PQ5-1..13 (PQ5-5 „nur teilweise“), DSB 2 + Antworten (PQ5-9, PQ5-12 „nicht wirklich geschlossen“);
9 Zeilen, einer teilweise gefallen. Nur DSB: PQ5b-1 (der schwerste — eine Widerlegung, die nur dokumentiert statt wirkt).

## Dritte Prüfung, gezielt (Fassung 2.1, nur die Widerlegungsregel)

Eine Spur: DeepSeek-Einzelaufruf (Papier Fassung 2.1, Leser und Werkzeug ganz). Eingearbeitet in Fassung 2.2.

| Nr | Befund | Nachgesehen | Ergebnis |
|---|---|---|---|
| PQ5c-1 | Widerlegung und §2 „nicht umgesetzt“ | der Prüfer las den unveränderten Stand `24b9be8` — das Papier verlangt den Einbau erst | gefallen |
| PQ5c-2 | „von e gedeckt“ über `e.ausgenommen` ist falsch: das Werkzeug schreibt nur NEUE Ausgenommene in die Zeile (`tools/qr-journal.js:1237-1243`); ein über eine frühere Erledigung ausgenommener Eigentümer würde e durch seine eigene Korrektur fälschlich widerlegen | gelesen | getragen (blockierend für den Bau) → Definition über A(i) bis einschliesslich e |
| PQ5c-3 | nach einer Widerlegung ohne verbleibende tragende Deckung nennt `wegFuer` für einen Ausgenommenen die benannte Freigabe, die dann mit (k) abbricht (`:1200`) | gelesen | getragen → Weg „erst Freigabe durch das Korrektur-Studio, dann benannt“ |
| PQ5c-4 | eine Freigabe ohne Abschnitt trägt EINE `ausgenommen`-Liste für alle Abschnitte → „nicht in e.ausgenommen“ ist nicht abschnittsweise | gelesen (`core/qr-verbrauch.js:292-298`) | getragen → abschnittsweise über A(i) |

Zahlen: 4 Befunde, 3 getragen, 1 gefallen (Stand statt Papier gelesen).
