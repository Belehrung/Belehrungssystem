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

## Ausführende Claude-Spur (54 Mutationen, eigene Proben gemessen)

Getragen und von mir nachgelesen: C1/Z2 (= F1) über die Ernte-Stellen. Z1 und Z3 hat die Spur gemessen: SIGKILL in `linkSync` bzw. Quarantäne nach 31 Tagen, beide Male wird geerntet und die Zeile steht weiter. C3 hat sie über `commitUngewiss === false` gemessen.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| C1 | blockierend (erweitert F1) | Die einzige Kopie eines committeten Blatts wird auf drei Wegen geerntet: Z1 Prozesstod zwischen COMMIT und `link()`, Z2 Ausgang unklar, Z3 `link()` scheitert und die Datei geht in Quarantäne (Ernte nach 30 Tagen). Nebenbefund derselben Klasse: `finalize()` in `core/pdf-engine.js` registriert vor dem `rename`. | Nacharbeit 1: REPARIEREN statt löschen. Ernte und `alsBestehend()` suchen bei fehlender öffentlicher Datei nach `.tmp-*-<Name>` bzw. `_quarantaene/…/*-<Name>`. Stimmt der Hash mit der registrierten Zeile (`pdf_hash`/`verify_dokumente`) überein, wird veröffentlicht (`link`) und gemeldet. Gelöscht wird nur, was keine Zeile referenziert. Das gilt für alle Erzeuger mit dem `.tmp-<hex>-<Name>`-Schema, also auch `finalize()`. |
| C2 | sollte (= F4) | Ein zweiter Prozess sieht „Zeile ohne Datei“ als `missing`, und der Job landet per `deadLetter`. | Die Reparatur aus C1 deckt das mit ab. Zusätzlich gilt `missing` nicht mehr als endgültig, solange eine passende Temp-Datei existiert. |
| C3 | sollte (= F3) | `commitUngewiss === false` wird nicht ausgewertet. Die Folge sind ein falscher Alarm und eine falsche Logzeile. | Nacharbeit 1 |
| C4 | sollte | `PDFTOPPM_WARTEZEIT` → 503 ist ungetestet (Mutation L6 überlebt, 34/0). | Nacharbeit 1: Testfall |
| C5 | Anmerkung | Der Weg „existing in der Transaktion“ ist in der neuen Datei ungeprüft (K11 überlebt). | Nacharbeit 1: Testfall mit überlappendem Start |
| C6 | Anmerkung (= F2) | Das Warten in der Transaktion ist in der heutigen Topologie praktisch nicht erreichbar. | Keine Nacharbeit; F2 ist damit herabgestuft. |
| C7 | Anmerkung | Die Behebung in `e539e56` setzt den FK der Suite-DB per DDL aus. Stirbt der Prozess dazwischen, fehlt der FK für den Rest der Suite. | Nacharbeit 1: DDL und Prüfung in EINER Transaktion mit ROLLBACK, oder Daten, die den FK erfüllen |
| C8 | Anmerkung (= F6) | Falscher Testname im Kommentar. | Nacharbeit 1 |

## Nacharbeit 1 — Planprüfung und Auftrag (01.10.2026)

Auftrag `plaene/auftrag-c5c-n1.md`. Die Planprüfung (flash) fand 8 Befunde, drei davon blockierend. Alle trugen.
- `verify_dokumente` überlebt Fristlöschungen. Damit würde eine gelöschte oder überholte Fassung wieder veröffentlicht.
- `FLUECHTIGE_TYPEN` (Verbandbuch) waren nicht ausgenommen.
- Der Lesepfad entfernt beim Reparieren die Temp-Datei eines laufenden Erstellers in einem anderen Prozess. Folge: dead letter.

Fassung 2 schränkt die Reparatur deshalb auf Korrekturblätter ein, mit dem Kriterium `nachweis_korrektur_dokumente`, `korrektur_id UNIQUE`, CASCADE durch die Retention. Der Lesepfad repariert, ohne die Temp-Datei zu entfernen, und die Rückgabewerte sind festgelegt. Gebaut wird mit dem Executer auf Opus.

## Nacharbeit 1 (`5d05d58..da30d70`), Runde 2

Selbst gelesen habe ich `repariereAusKandidat`, `findeResteKandidaten` und `zielZustand` (`core/pdf-ablage.js`). Der Helfer prüft zuerst das Ziel, wirft nie, überschreibt nie und entfernt nur mit `entfernen:true`.

Laut Bericht des Bauenden ist die Suite rot, und zwar nur durch `test_feature_qr_journal.js`. Die Fixtur hängt dort von der Studio-ID-Folge ab. Die Behebung kam mit C5-E1 auf master und wird jetzt hereingenommen; beim Merge gab es einen Konflikt in `test_feature_korrektur_dokumente_static.js`, den ein Executer löst.

Lesespur flash, Runde 2 (5 Befunde, keiner blockierend):

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| R2-1 | sollte | ENOENT im catch um `linkSync` wird als `fehler` gemeldet, ohne dass der Zielzustand neu gelesen wird. Im Wettlauf mit einem Ersteller in einem anderen Prozess gibt das einen Fehlalarm und Exit 1. | trägt (Code gelesen) | N2 |
| R2-2 | sollte | Der Fall „`veroeffentliche()` mit EEXIST und anderem Hash“ ist ungetestet. Die Hashprüfung lässt sich entfernen, ohne dass ein Test fällt. | trägt | N2 |
| R2-3 | sollte | Für den Traversalschutz `istEinfacherName`/`korrekturZiel` gibt es keine Zusicherung. | trägt | N2 |
| R2-4 | Anmerkung | Der ENOENT-Erfolgszweig in `veroeffentliche()` ist ungetestet. | trägt | N2 |
| R2-5 | Anmerkung | Lesepfad: Steht unter dem Namen eine Datei mit falschem Inhalt, liefert er `missing:false` ohne Meldung. Das war schon vorher so. | trägt | Sammelliste |
