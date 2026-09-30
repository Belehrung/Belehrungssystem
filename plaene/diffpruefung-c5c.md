# Diffprüfung C5-C — PDF und QR

Stand 30.09.2026, Zweig `c5c-pdf-qr`, Commit `a27e6fa` (enthält master mit C5-A und C5-B).

Spuren:
- Lesespur `deepseek-flash`, Ausgabe in `scratchpad/c5c-diff/flash.txt`. Präfix F.
- Ausführende Claude-Spur, eigener Arbeitsbaum `/workspace/gymdocu-c5cpr`, eigene DB. Präfix C.

## Lesespur flash (7 Befunde)

F1 habe ich selbst nachgelesen:
- `core/korrektur-pdf.js:342-348`: im Zweig „unklar“ bleibt `.tmp-*` liegen.
- `ops/gymdocu-pdf-reste-ernte.js:258/:511`: `klassifiziere()` ordnet `.tmp-*` als `'tmp'` ein und löscht nach 24 h.

War die Zeile committet, ist die Temp-Datei die einzige Kopie. Der Befund trägt.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| F1 | blockierend | Ist der Commit-Ausgang unklar, bleibt die einzige Kopie eines womöglich committeten Korrekturblatts als `.tmp-*` liegen. Die Resteernte löscht sie nach 24 h, die Zeilen zeigen danach auf eine Datei, die es nie gab. | Nacharbeit 1 |
| F2 | sollte | `if (laeuft) await laeuft` wartet IN der Transaktion, die den Studio-Lock hält, ohne Zeitlimit auf `link()`. | Nacharbeit 1: das Warten vor die Transaktion ziehen oder zeitlich begrenzen |
| F3 | sollte | Wirft `renderPdf()`, läuft trotzdem die Nachmessung, und die Meldung behauptet „Temp-Datei bleibt liegen“. | Nacharbeit 1 |
| F4 | sollte | Zwischen zwei Prozessen gibt es neu ein Fenster „Zeile sichtbar, Datei noch nicht“. Der Worker wertet `missing` als endgültig, `deadLetter`. | Nacharbeit 1 |
| F5 | Anmerkung | Ein Zählfehler erzwingt einen leeren Monat. Die Archivzeile verhindert danach das Nachholen. | Sammelliste |
| F6 | Anmerkung | Ein Kommentar nennt einen Testnamen, den es nicht gibt. | Nacharbeit 1 |
| F7 | Anmerkung | `SOLL_FAELLE = 152` als Literal. | So lassen |
