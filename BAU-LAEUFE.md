# Bauspur-Läufe — zählbares Protokoll

Jeder Lauf von `tools/bau-spur.js` MIT Modellkontakt trägt sich selbst als Zeile ein (CLAUDE.md Abschnitt 1, Betreiber-Vorgabe
03.10.2026: Qwen baut über die Bauspur, `deepseek-flash` prüft). Ein Aufruf, der VOR dem ersten Modellaufruf abbricht (Exit 2,
10 bis 17), bekommt keine Zeile: es fand kein Lauf statt.

**Spalten.** Datum (Europe/Berlin, über `laufprotokollDatum()`, nicht `toISOString()`), Zweck (`--zweck`), Modell, Runden, Token
rein / raus, Kosten (geschätzt aus `PREISTABELLE` in `tools/spur-gemeinsam.js`; „mind.“ bei einem abgebrochenen Lauf: eine
gescheiterte Anfrage hat womöglich schon verbraucht), Ergebnis (Status und Exit-Code des Werkzeugs, Zahl der netto geänderten
Dateien). Die beiden letzten Spalten **Prüfung bestanden** und **Nacharbeiten** ergänzt der Haupt-Agent NACH seiner Prüfung von
Hand (Diff gelesen, volle Suite, Gegenleser): bis dahin steht dort „—“. Ein „—“ nach dem Merge heißt „nicht eingetragen“, nicht
„bestanden“.

**Ergebnis lesen.** `fertig, Exit 0` heißt: das Modell hat `fertig()` gerufen UND der Endvergleich (Schreibliste des Werkzeugs
gegen `git status` des Baums) stimmt. Ein Lauf mit `**abgebrochen**` ist ein TEILBERICHT und nie eine Fertigmeldung
(`budget-erschoepft`, `abbruch-netz`, `abbruch-antwort`, `kein-fertig`, `schreibliste-abweichung`, `isolation-abgebrochen`,
`werkzeug-befund`). Die Statuskataloge stehen im Kopf von `tools/bau-spur.js`. `laufprotokoll-fehler` (Exit 28) steht NICHT in dieser Tabelle,
weil es genau der Fall ist, dass die Zeile nicht eingetragen werden konnte: ein Lauf, der sonst fertig ist, aber im Bericht und im JSONL-Protokoll
als nicht abgelegt gemeldet wird; seine Zeile ist von Hand nachzutragen (Nacharbeit 1, F2).

**Benannte Grenze: Aufbewahrung beim Anbieter (Planprüfung B5, gemessen 03.10.2026).** Das Feld `store` existiert am
DashScope-Endpunkt und wirkt: eine Antwort ohne `store` ist hinterher über `GET /responses/<id>` abrufbar (HTTP 200), mit
`store:false` liefert derselbe Abruf HTTP 400 „not found“. Jeder Lauf setzt `store:false`. NICHT messbar bleibt, ob der Anbieter
Anfragen unabhängig davon vorhält (Betriebsprotokolle, Missbrauchserkennung). Quelltext aus dem Arbeitsbaum geht damit an einen
Anbieter in Singapur; die Datengrenze (keine Zugangsdaten, keine Kundendaten) gilt unverändert, der Geheimnis-Riegel stützt sie nur
als zweite Schicht (er erkennt das Qwen-Format seit Nacharbeit 1, X8; trotzdem zieht die Bauspur den Schlüssel zusätzlich exakt ab, für jedes Format, das der Riegel nicht kennt).

**Sperre.** Die Sandbox der Bauspur nimmt `/var/lock/dsv1.lock`, dieselbe wie die ausführende Prüfspur: Bauspur und Prüfspur laufen
nacheinander, ein zweiter Lauf bricht mit Exit 17 ab.

| Datum | Zweck | Modell | Runden | Token rein / raus | Kosten | Ergebnis | Prüfung bestanden | Nacharbeiten |
|---|---|---|---|---|---|---|---|---|
| 03.10.2026 | Probelauf Bauspur (Kommentar, teste, Gegenprobe) | qwen3.8-max | 3 | 11594 / 361 | mind. 0,03 $ | **abgebrochen** isolation-abgebrochen (AUSFÜHRUNG ABGEBROCHEN — Belege nach Aufruf 1 fehlen (Umgebungsnamen weichen von der Literalliste ab — Werkzeug-Befund (Stufe 24))), Exit 25; netto geaendert 1, neu 0, registriert 0 | — | — |
| 03.10.2026 | Probelauf Bauspur 2 (Kommentar, teste, Gegenprobe; Baustand 9ad8acd) | qwen3.8-max | 6 | 29007 / 1398 | 0,07 $ | fertig, Exit 0; netto geaendert 1, neu 0, registriert 0 | — | — |
| 03.10.2026 | Probelauf Bauspur 3 (neue Testdatei, registriere_test, teste, Gegenprobe; master bb7e7bc) | qwen3.8-max | 5 | 28125 / 1516 | 0,07 $ | fertig, Exit 0; netto geaendert 2, neu 1, registriert 1 | — | — |
| 03.10.2026 | A/B C6D3-4 und C6D2-5 (Weg Q) | qwen3.8-max | 39 | 2811654 / 65671 | mind. 6,02 $ | **abgebrochen** budget-erschoepft (Kostendeckel 6 $ erreicht (geschaetzt 6.0173 $)), Exit 20; netto geaendert 10, neu 1, registriert 1 | — | — |
<!-- NEUE-LAUFZEILE-HIER: tools/bau-spur.js traegt jede neue Zeile UNMITTELBAR UEBER dieser Marke ein. Sie darf nicht entfernt oder verschoben werden; fehlt sie, meldet das Werkzeug das LAUT und traegt nichts ein. -->
