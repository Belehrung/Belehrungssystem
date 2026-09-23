# Diffprüfung Nachweis-unlink — `e2a9e9e..f095ec3`

Stand 23.09.2026. Lesespur `gpt-6-sol` mit Lesezugriff auf den Lesebaum
`/workspace/gymdocu-unlink-lese` (83 Lesungen, 9,83 $). Spalte „getragen" = Messung des
Haupt-Agenten. Die ausführende Prüfung lief in den Nacharbeiten 1–3 (Gegenproben dort).

| # | Schwere | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| L1 | blockierend | Erkenner kennt nur `unlink`/`unlinkSync`; `rm`/`rmSync`/`fsP.rm` mit Dateipfad und Aliase aus `fs/promises` fallen durch. Real: `core/export-studio.js:269` (`rmSync(workDir)` mit sensiblen CSV/PDF, stiller catch), `routes/archiv.js` (tmpDir mit Monats-PDFs, stiller catch), `core/storage-replica.js:354-359` (`fsP.rm` einer `.enc`, DB-Zeile wird danach IMMER gelöscht) | alle drei Stellen gelesen — tragen | ja |
| L2 | mittel | Ausnahmen nur über die ANZAHL je Datei gebunden, nicht an Stelle und Fehlerbehandlung — Zähler aus `core/foto-reaper.js:82` entfernt bleibt grün | Wächter `:464-474` gelesen | ja |
| L3 | mittel | echter Helfer ohne Vertragstest | = Nacharbeit 4 (läuft) | ja |
| L4 | mittel | awaited `unlink` ohne Zeitgrenze vor dem Redirect — ein hängendes Dateisystem hält die bereits gespeicherte Anfrage offen | Herleitung trägt; lokal kaum erreichbar, Behebung billig | ja |
| L5 | mittel | Kommentar im Helfer: `quelle` verhindere gegenseitiges Verdecken in der Telegram-Drossel — der Drosselschlüssel enthält `quelle` nicht (`core/error-tracker.js` `signatur()` = Name:Methode Pfad) | gelesen — trägt; Behebung: Kommentar berichtigen | ja |
| L6 | mittel | `core/foto-reaper.js`: nach gescheitertem Unlink wird die DB-Zeile trotzdem gelöscht und als „entfernt" gezählt; `dateiFehler` wertet niemand aus | `:47-65` gelesen — trägt (vorbestehend, im Diff berührt) | ja |
| L7 | mittel | Helferkommentar stellt `ops/nachweis-waisen-melden.js` als Auffangnetz dar — löscht nichts, kein Cron, deckt Belehrungs-Uploads/Prüfberichte nicht | Fundstellen genannt — Kommentar berichtigen; fehlender Reaper = U-REAP1, Sammelliste | ja |
| L8 | gering | Ausnahmebegründung `core/retention.js` behauptet PII-Redaktion; `:1069` loggt `e.message` mit vollem Pfad | gelesen — trägt | ja |

Kein Befund: Zeitzonen, Mandantentrennung (drei bewusst globale Abfragen begründet).

## Runde 2 — Lesespur `deepseek-v4-pro` mit Repo-Lesezugriff (Nacharbeit 4/5, 1,76 $)

| # | Schwere | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| R2-1 | mittel | `core/storage-replica.js`: die bei gescheitertem `.enc`-Löschen behaltene Zeile ist KEIN Wiederholungsanker — beide Aufrufer rufen je Quellzeile genau einmal (`pdf-loeschung.js` setzt `datei_geloescht = 1` vorher, `retention.js` löscht die Quellzeile vorher); die Zeile bleibt `succeeded`, `requeueStale`/`healthMetrics` übergehen sie | `core/pdf-loeschung.js:234-246` gelesen — trägt | ja |
| R2-2 | gering | Foto-Reaper meldet bei dauerhaftem Fehler täglich je Datei (Log je Datei, Telegram gedrosselt) | trägt | ja |
| R2-3 | gering | `entferneVerzeichnis` (async) ohne Zeitlimit, obwohl die Begründung nur für die Sync-Form gilt | trägt | ja |
| R2-4 | gering | Wächter-Endzusicherung ohne unabhängige Gesamtzahl der Ausnahmen; Fragmentsuche findet auch einen Kommentar im catch | trägt | ja |
| R2-5 | gering | „denselben Fehler" prüft nur den Code, nicht die Objektidentität | trägt | ja |
| R2-6 | gering | Erkennerlücken: `const { unlink: u } = require('fs')`, `rmdir/rmdirSync` (beide im Bestand 0) | trägt | ja |
