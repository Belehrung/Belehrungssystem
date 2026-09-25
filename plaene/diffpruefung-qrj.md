# Diffprüfung QR-J — Reparaturweg für kaputte Journalzeilen (25.09.2026)

Kopf `dc7ebac` (Zweig `fix-qrj-journal-reparatur`, master `00bd9c9` hereingemergt). Unwiderruflich → drei Spuren:
Claude ausführend (eigener Baum `gymdocu-qrj-cc`, eigene DB), `deepseek-v4-pro` mit Repo-Lesezugriff (ganzer Diff),
`kimi-k3` mit Bündel (Endstand von Leser, Werkzeug, `qr-token.js`, neuem Test, `integritaet.js`; nur der Test-Diff).
Executer-Bericht: 31 Mutationen alle rot, Suite 390 = 390, Lint EXIT 0.

## Eigene Lesung (vor den Spuren)

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| QJ-E1 | `verwerfen` prüft nur, ob ein VOLLSTÄNDIGER Schlüssel (`charge_id`, …) im Rohtext steht. Ein Bruchstück wie `{"char` oder `{"` ist der Anfang einer Chargenzeile und lässt sich trotzdem verwerfen — dieselbe Unbelegbarkeit, die PQJ-2 für Zeilen MIT Schlüssel ausschliesst | `pruefeVerwerfen` gelesen: `CHARGEN_SCHLUESSEL.filter((k) => roh.includes(k))` | mittel (Leitregel: nach oben) — Vorschlag: auch ablehnen, wenn der getrimmte Text ein Präfix von `{"charge_id":` ist |
| QJ-E2 | Ein abgeschnittenes METAzeilen-Bruchstück (`{"typ":"korrektur",…,"studio_id":…`) lässt sich nicht verwerfen (enthält einen Schlüssel) und nur über eine erfundene Korrektur mit `--studio` auflösen — obwohl sein Verwerfen nichts freigibt (die Zeile, die es erledigen sollte, bleibt dann unerledigt und sperrt weiter) | gelesen | gering (Bedienbarkeit) |
| QJ-E3 | Leeres Journal (0 Zeilen) + keine Charge des Studios: Leiter wirft, der Text rät nur noch `zeigen`, das Werkzeug hat keinen Befehl — Sackgasse. Eine LEERE Datei enthält keine Spur; sie zu entfernen verliert nichts und führt in den heute schon akzeptierten Zustand „Datei fehlt = Erstinbetriebnahme“. Der alte Rat war für GENAU diesen Fall richtig | Leiter `core/qr-token.js:~467` gelesen | mittel — Vorschlag: nur im Fall `zeilen === 0` den Rat wiederherstellen (leere Datei entfernen, wenn nachweislich noch nie gedruckt wurde); `zeigen` sagt dasselbe |

Sonst gelesen und in Ordnung: Zuordnung verankert und abgeschlossen; Erledigung als Paar Nummer + Hash über Rohbytes;
Korrekturspanne zählt; neue Sperre hinter dem C1-Zweig bei jeder relevanten Zeile; `eintragAnhaengen` mit `\n`-Vorspann
am selben Deskriptor; Werkzeug prüft (a)–(f) vor der Transaktion und die Zeile unter dem Studio-Lock erneut; Journal vor
dem COMMIT; kein Text rät mehr zum Entfernen der ganzen Datei.
