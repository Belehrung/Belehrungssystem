# Vollprüfung durch DeepSeek V4 Pro — Plan

Betreiber-Vorgabe 23.09.2026, wörtlich: „nicht als einziger prüfer aber dennoch möchte ich deep
seak ein mal alles prüfen lassen. es sol bei reinm coding mindestens so gut sein wie du .
wichtigere ist aber der andere blickwinkel".

## Zuschnitt

* Gegenstand: GymDocu-Repo, master `f4c0f07` (Lesebaum `/workspace/gymdocu-lock`). Danach der
  Hauptserver (hier noch nicht geklont).
* 25 Bereiche ≤ 180k Token, nach Verzeichnissen geschnitten (Skript im Scratchpad,
  `vollpruefung/schneide.py`, ohne `public/vendor/`): 11 Bereiche Produktivcode (~1,8 Mio. Token),
  14 Bereiche Tests (~2,4 Mio. Token). Bei Tests zählt vor allem Prüfreihenfolge 2 („kann nicht
  rot werden").
* Je Bereich ein Lauf `tools/gegenleser-repo.js --modell=deepseek-v4-pro` mit dem Bereich als
  Material und Lesezugriff auf das ganze Repo. Brief: Prüfreihenfolge aus CLAUDE.md, Zustandsfrage,
  Behauptungsfrage, feste Ausgabeform.
* Voraussetzung: der DeepSeek-Weg im Gegenleser (Bau läuft).

## Vorgehen

1. Pilot: Bereiche mit dem Sicherheitskern zuerst (Anmeldung, Zugangslinks, Mandantentrennung,
   Uploads, Löschwege). Ergebnis: Anteil der Befunde, die meiner Nachmessung standhalten.
2. Danach die übrigen Produktivbereiche, dann die Tests — parallel zu je 3–4 Läufen, weil das
   Nachmessen der Engpass ist, nicht das Finden.
3. Jeder Befund ist eine Behauptung, bis ich ihn gemessen habe. Blockierend und mittel werden
   einzeln nachgemessen; gering kommt gesammelt auf `plaene/offene-befunde-vollpruefung.md` und
   wird dort ebenfalls abgearbeitet (Extrarunde, keine stille Grenze).
4. Jede Zeile in `ASTRA-LAEUFE.md` mit Befundzahl und getragener Zahl — daraus entsteht die
   Messung „mindestens so gut beim Coding", nach der der Betreiber fragt.
5. Befunde in Code, den offene Zweige gerade ändern (S6, Sperrordnung, unlink), werden gegen den
   Zweigstand nachgemessen, nicht gegen master.

Kostenschätzung (NICHT gemessen): < 1 $ je Bereich ausserhalb der Spitzenzeit (Eingabe grösstenteils
aus dem Cache), zusammen grob 10–30 $.
