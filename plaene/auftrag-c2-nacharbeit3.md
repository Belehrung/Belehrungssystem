# Auftrag C2 Nacharbeit 3 (25.09.2026)

Grundlage: `plaene/diffpruefung-c2.md`, Runde 3 (C2R3-1..C2R3-10). Baum `/workspace/gymdocu-c2`, Zweig
`fix-c2-stille-fehler`, Kopf `a1a41d7`. Messskripte der Prüfspur: `scratchpad/c2cc3/` (m15–m21, `mut/N*`, `mt.sh`,
`zr.sh`) — VOR dem Bau gegen deinen Stand und NACH dem Bau; beides wörtlich. Einzeltests nur gegen `gymdocu_c2n3_test`.
Einordnung: nicht sehr komplex (Standard).

## 1. Die tägliche Löschung wird bewacht (C2R3-1, blockierend; C2R3-4, -5, -6)

- Verhaltenstest für `ops/gymdocu-pdf-reste-ernte.js` nach dem Muster von `test_feature_verbandbuch_pdf_aufraeumen.js`:
  eigenes PDF_ROOT, Alter per `utimes` — Quarantäne 29 Tage bleibt / 31 Tage geht, `.tmp-` 23 h bleibt / 25 h geht,
  eine alte VERÖFFENTLICHTE PDF (ohne `.tmp-`, ausserhalb `_quarantaene`) bleibt, Symlink innerhalb wird übersprungen,
  Probelauf löscht nichts, `--wirklich` löscht genau die Sollmenge (Menge, nicht Zahl), PDF_ROOT-Riegel, gezählte
  Meldungen. Die überlebenden Mutationen N14–N22 der Prüfspur werden damit ROT (je Zahlen).
- Verdrahtungs-Wächter auf `pdfResteErnte.ernteInProcess(` im 05:00-Cron (N22 → ROT).
- Wurzel-Symlink (`PDF_ROOT` und `_quarantaene`) per `lstat` prüfen → Abbruch mit Meldung, nichts gelöscht.
- `statSync`: nur ENOENT still überspringen, alles andere als Fehler zählen.
- Scan: beim Durchlaufen filtern (keine Liste aller Pfade), asynchron (`fs.promises.opendir`), damit der App-Prozess
  nicht blockiert; Messung m17/200.000 Dateien vorher/nachher.
- Meldung: EINE je Lauf und Studio mit `{ studioId }`, Anzahl und Beispielpfad (C2R3-3), vor dem Löschen protokolliert.

## 2. Keine Telegram-Flut durch die Studio-Signatur (C2R3-2)

Die Signatur behält das Studio (die Trennung je Studio im LOG bleibt), aber die TELEGRAM-Sendung bekommt eine zweite
Drosselstufe je Quelle: innerhalb des Drosselfensters höchstens eine Meldung je Quelle; weitere Studios desselben
Fehlers werden gesammelt und in der nächsten Meldung mit Anzahl und Studioliste genannt (oder am Fensterende). Test:
derselbe Fehler in 50 Studios → höchstens eine Meldung im Fenster, sie nennt „50 Studios“; zwei verschiedene Quellen →
zwei Meldungen; Gegenprobe (Stufe aus) → 50.

## 3. Kleinere Punkte

- C2R3-7: Testfall „ENOSPC ab dem ersten Schreiben“ (`stream._fehler`-Zweig in `finalize()`), N5a → ROT.
- C2R3-8: `QUARANTAENE_ORDNER` und `FLUECHTIGE_TYPEN` in ein kleines Blattmodul (z. B. `core/pdf-ablage.js`), das
  `core/pdf-engine.js`, `core/provisioning.js` und die Ernte gemeinsam laden — eine Quelle, kein pdfkit im
  Deprovisionierungsweg.

Nicht in diesem Auftrag: C2R3-9 (→ C2-S10), C2R3-10 (→ C2-S4).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht durch die gesammelte Telegram-Meldung, den es vorher nicht gab — und kann ein Fehler, der
NUR ein Studio betrifft, darin untergehen oder verspätet ankommen?

-- Ende des Auftrags --
