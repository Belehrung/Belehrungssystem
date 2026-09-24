# Planprüfung P4 — Unterschrift

Papier `plaene/auftrag-p4-unterschrift.md` Fassung 1. **Zweite Plan-Tauschrunde:** DeepSeek (D, 712 s) und Kimi
(K, 836 s) mit demselben Bündel und derselben Frage. Nachgemessen am Code `221a7b2`.

| Nr. | Befund | Spur | Nachgemessen | Folge |
|---|---|---|---|---|
| PP4-1 | „Tippen“ zeichnet nichts: Tinte entsteht nur in `mousemove`/`touchmove`; ein Tipp ist eine leere Fläche | D, K | gelesen `belehrungen.js:541-547` (`stroke()` nur im Move-Zweig) | Punkt = Mikro-Zug; eine Figur mit 0 Tinte bricht die Messung als Messfehler ab |
| PP4-2 | Sechs Wege SPEICHERN den Rohwert; jede spätere PDF-Erzeugung dekodiert ihn ungeprüft | D | gelesen `wartung.js:1248`, `pdf-engine.js:1769` | gespeichert wird der kanonische Puffer |
| PP4-3 | Altdaten: Einbettung ohne Deckel bleibt offen (PNG-Bombe im Bestand) | K | gelesen `pdf-engine.js:419, 1158, 1769` | Deckel über `metadata()` vor jedem `doc.image`; Altdaten bleiben gültig |
| PP4-4 | Gefüllte Fläche und dicker Balken bestehen die Hauptachsenregel; Koordinatenliste über 16 MP ist ein Lastvektor | D | Rechnung | Deckungsgrad-Regel; Momente laufend statt Liste |
| PP4-5 | Flache Bögen fallen als „Strich“, „=“ und „!“ bestehen; Gegenprobe (b) hängt an der Mass-Form; Tests prüfen nur „abgelehnt“, nicht den Grund | K | Rechnung | Mass vorher festlegen (Verhältnis + Mindestlänge), Figurenliste erweitert, Grund zusichern, STOPP beidseitig |
| PP4-6 | Schwelle und Prüffiguren aus demselben Generator | K | Planlogik | zweite, unabhängige Quelle: Messwerte echter Unterschriften aus dem Betrieb (nur Zahlen) |
| PP4-7 | „Sieben“ zählt Dateien, nicht Eintrittspunkte (`module.js` hat u. a. die Seilkontroll-Freigabe) | K | gelesen `module.js:1097-1105` | Tabelle der Eintrittspunkte vor dem Bau |
| PP4-8 | Browser-Gegenprobe ohne eigenen Test bzw. vom Server verdeckt | D, K | Planlogik | Browser-Test sichert „kein POST“ |
| PP4-9 | Kanalzahl 3 (Server) gegen 4 (Browser) | K | gelesen `signaturbild.js:145`, `belehrungen.js:643` | Stride ableiten, Test mit beiden |
| PP4-10 | Messung nur Chromium, Zielgerät iPad | K | Umgebung hat nur Chromium | benannte Grenze; Kalibrierung über PP4-6 |
| PP4-11 | Keine Handlungsanweisung bei Ablehnung | K | Planlogik | Meldung nennt, was gilt |
| PP4-12 | Akzeptanz-Tests schreiben echte Zeilen/PDFs | K | **gefallen**: Suite läuft gegen `_test`-DB mit umgeleiteten Datenwurzeln (`run.sh`), T1-Riegel erzwingt das | — |

D: 4 Befunde, alle getragen. K: 10, davon 9 getragen, 1 gefallen. Überschneidung: PP4-1, PP4-8.
