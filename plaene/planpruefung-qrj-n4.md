# Planprüfung QR-J Nacharbeit 4 (25.09.2026)

Material: `plaene/auftrag-qrj-nacharbeit4.md` Fassung 1. Spuren: DeepSeek (Papier + Repo-Lesezugriff auf `e94c4bc`),
Kimi (Papier + Befunde + `core/qr-verbrauch.js` ganz, ohne Werkzeug). Jeder Befund selbst gelesen bzw. am Code
nachgesehen; eingearbeitet in Fassung 2 desselben Auftrags.

| Nr | Quelle | Befund | Nachgesehen | Schwere | In Fassung 2 |
|---|---|---|---|---|---|
| PQ4-1 | Kimi B1 | Leserregel für `freigegeben` offen: ungegatet deckt eine Handzeile einen Chargenschlüssel-Abschnitt ohne Korrektur (QJ3-6 umgangen); am Gatter `korrekturDa` wirkt der Widerruf nie (Eigentümer-Freigabe ist korrekturlos) | `core/qr-verbrauch.js:362-372` gelesen | blockierend | §1 Formel: Gatter(D) ∧ (S ∉ A ∨ S ∈ F) |
| PQ4-2 | Kimi B2 | `abschnittVollGedeckt`/`vollErledigtDurch` im Papier nicht erwähnt: `keine_aufkleber` fällt durch alle Zweige, `freigegeben`-IDs haben keine eigene Korrektur → Sperre weg, Zeile ewig unerledigt, Daueralarm — bei grünen Pflichttests | `:389-413` gelesen | blockierend | §1 Voll-Deckung; Pflicht-Zusicherung `erledigt_durch`/`unerledigteKaputteZeilen` |
| PQ4-3 | DS 1, Kimi 2.1 | `--keine-aufkleber` widerspricht QJ3-6, ohne die Regel ausdrücklich zu ändern (Kopfkommentar `:141-147`, Gatter `:369-372`, `:399`, Werkzeug `gedeckteAbschnitte`) | gelesen | blockierend | §4 ändert QJ3-6 ausdrücklich, Stellenliste |
| PQ4-4 | DS 2, Kimi B4 | Sperrtext „eigene Korrektur“ für ein A-Studio, das nichts trägt, führt in die Scheinspanne; ehrlicher Weg unsichtbar; benannte Freigabe ohne Klartext-Warnung | Papier | blockierend | §1 Sperrtext verzweigt, Warnung |
| PQ4-5 | DS 3, Kimi 2.4 | „Abschnitt bereits gedeckt“ mehrdeutig (Korrektur eines anderen Studios deckt allein nichts) | `:360-365` gelesen | blockierend | „für alle Kandidaten ausser A gedeckt“ |
| PQ4-6 | DS 4, Kimi 2.2 | `metaZeileVollstaendig` kennt die neuen Felder nicht (Typprüfung, sonst Handzeile mit `"freigegeben":"64"` gedeckt oder TypeError); Audit-Kennzeichnung für `--eigentuemer-unbekannt`/`--keine-aufkleber`/benannte Freigabe fehlt | `:242-261` gelesen | blockierend | §1/§2/§4 Felder, Typprüfung, Payload |
| PQ4-7 | Kimi 2.3 | §1 in sich widersprüchlich: „nicht Eigentümer“ vs. „Eigentümer zusätzlich mit Widerruf“ | Papier | mittel | umgedreht formuliert |
| PQ4-8 | Kimi 4.3 | `bekannteStudios` nimmt Eigentümer aus Freigaben auf → eine einmal per `--eigentuemer-unbekannt` behauptete ID ist danach „bekannt“ | `:602-603` gelesen | mittel | `bekannteStudios` nur aus Chargen-/Korrekturzeilen; A deckt die Ausnahme |
| PQ4-9 | Kimi B3 | Eigentümer nicht an die Kandidatenmenge gebunden → Doppelvergabe | Werkzeug prüft bereits (`tools/qr-journal.js:1094`, (k) „kein Kandidat“); Leser nicht | gering (als Doppelvergabe gefallen, als Leser-Härtung getragen) | Leser ignoriert eine Eigentümer-Freigabe ohne Kandidatur |
| PQ4-10 | Kimi 4.2 | `--keine-aufkleber` mit `--eigentuemer` kombinierbar | Papier | mittel | gegenseitig ausschliessend |
| PQ4-11 | Kimi 2.5, DS | §3: `spannen` tragen kein `abschnitt`; Verhältnis zu `position`, angehängte Charge offen | `:553-557` gelesen | mittel | Tiebreak innerhalb gleicher Position |
| PQ4-12 | Kimi 2.6, DS, Kimi 4.5 | §4: welche Prüfungen bei unlesbarem `nr_von` entfallen; „beide Enden ausserhalb“ lässt eine Spanne zu, die einen Block umschliesst | Papier | mittel | Prüfung für Prüfung; „schneidet keinen Block“ |
| PQ4-13 | DS 9, Kimi 3.5 | §5 Mechanismus offen; Ursache `vergleicheQuellen(dbMax, journal.hoechste)` global (`core/qr-token.js:534`); Zusicherung „höchstens einmal“ ist mit Alarm-aus grün | gelesen | mittel | Spannen ausserhalb aller Blöcke aus dem Vergleich; `== 1` und echter Restore feuert weiter |
| PQ4-14 | DS 5/6, Kimi 3.1-3.4 | blinde Pflichttests: `e_korrpayload` ohne Mehr-Abschnitt-Studio, `c_zeigen` ohne zwei Kandidaten, `a_korr` mit 64 wieder in `ausgenommen`, `a_eig` in schon erledigtem Abschnitt, A je Abschnitt nicht von A über die Zeile unterscheidbar, keine `freigegeben`-Handzeile | Papier | mittel | Fixturvorgaben je Test |
| PQ4-15 | DS 7/8, DS 10 | bestehende Tests verlangen den alten AUSSERHALB-Text und „`zeigen` GENAU 6-mal“; Listenschalter-Validierung fehlt | gelesen | gering | genannt |

Zahlen: DS 10, Kimi 4 + 6 + 6 + 5 Unterpunkte; 15 Zeilen, einer als Doppelvergabe gefallen (PQ4-9, das Werkzeug prüft
schon). Nur Kimi: PQ4-1, PQ4-2 (die beiden schwersten), PQ4-7, PQ4-8, PQ4-10. Nur DS: Stellenbelege zu §5 und zu den
bestehenden Tests. Beide: PQ4-3..6, PQ4-14.
