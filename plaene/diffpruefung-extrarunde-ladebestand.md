# Diffprüfung „Extrarunde ladebestand" — 23.09.2026

Stand `91f7a5e` (Zweig `extrarunde-ladebestand`, drei Commits auf `e2a9e9e`).
Zwei Spuren: Claude (darf ausführen) und `gpt-6-sol` mit Repo-Lesezugriff
auf einer eigenen Kopie (`/workspace/gymdocu-lese`), Diff ohne Golden Files.

## Claude-Spur — selbst gemessen

| # | Schwere | Befund | Messung |
|---|---|---|---|
| C1 | **blockierend** | **Zeitbombe im Deploy-Gate.** `db-schreibspur.js` normalisiert Datumswerte als Tagesabstand zu heute; `plusMonate(heute,3)` ist 90–92 Tage je nach Monat, und die Schritt-0-Fixturen tragen ein festes `'2027-01-01'` (`brandschutz-schreibplan-szenarien.js`), dessen Abstand sich TÄGLICH ändert | JS-Uhr per Preload um 30 Tage vorgestellt: `anker` **EXIT 1, 30 PASS / 5 FAIL** (u. a. `bs_neuanlage` Schreibspur Eintrag 7, `bs_durchfuehrung_nachtrag` Zustand); unverschoben 35 / 0 |
| C2 | **blockierend** | `deaktiviert = delta.deaktiviert` statt `+=` im Aufrufer bleibt unentdeckt | Mutation einzeln: `anker` 35/0, `brandschutz` 55/0, `ladebestand_streng` 28/0, `verhalten` 186/0 — **alle EXIT 0**; Rücknahme `diff` EXIT 0 |
| C3 | mittel | veraltete Prosa: Modul („Bereichsmarke oben", Block über die gestrichene statische FOR-UPDATE-Zusicherung), `geraete.js` Kommentar an `feuerloescherOhneProtokoll` (Riegel) und an `schreibePruefplan` („alles durch schreibePruefplan" — `holeOderLegeAn` schreibt selbst; „In Kauf genommen: rowCount=1 …" ist seit der CTE mit `IS DISTINCT FROM` behoben); `ladebestand_streng` Punkt-1-Kopfkommentar zerrissen („behoben … bewusst NICHT behoben") | gelesen |
| C4 | mittel | Gegenproben B-2, B-13/21, B-17 fehlen im Bericht; A1a-Rohwerte verloren | Bericht |
| C5 | gering | B19 nicht umgesetzt — Fundstelle ist der Kommentar `M10 (Diffprüfung Runde 8 …)` in `test_feature_ladebestand_streng.js` (Prämisse „las genau die Variablen" — das Array war schon Wertkopie; Nutzen ist die Existenzprüfung) | gelesen |
| C6 | gering | A3-2 „Aufruf INNERHALB der POSITIONEN-Schleife" prüft nur „nach dem Schleifenbeginn" | gelesen |
| C7 | gering | Modulrumpf steht auf der alten Einrückung (erste Zeile Spalte 0, Rest 16 Leerzeichen); byte-gleich müssen nur die SQL-Literale sein | gelesen |

## Lesespur `gpt-6-sol` — 10 Befunde, alle nachgemessen

| # | Schwere | Befund | trägt |
|---|---|---|---|
| L1 | mittel | Anker prüft nicht, dass alle elf Szenarien laufen (`SZENARIEN.slice(0,1)` bliebe grün) | ja (Code gelesen) |
| L2 | mittel | Meldungsprobe nur für genau 2; `<strong>2</strong>` fest verdrahtet bliebe grün | ja |
| L3 | gering | `faelligAm` im Unit-Test mit derselben `plusMonate` erwartet; FOR-UPDATE-Prüfung nur „wenn CTE gefunden" | ja |
| L4 | mittel | Import-Erlaubnisliste sieht `import('./db.js')` nicht (Text sucht nur `require(`, Laufzeit nur ausgeführte Zweige) | ja |
| L5 | gering | Destrukturierung entnimmt nur die Methode, liest den Body nicht — C9-Kommentar überzeichnet (Richtung: Fehlalarm, sicher) | ja |
| L6 | mittel | `heute` einmal vor mehreren POSTs — Lauf über Berliner Mitternacht wird rot | ja (deckt sich mit eigener Beobachtung) |
| L7 | gering | `abgeloest.push(...delta.abgeloest)` — Spread ohne Grenze, nach bereits geschriebenen Deaktivierungen | ja (praktisch unrealistisch, trivial zu beheben) |
| L8 | mittel | „HTTP 200" ist kein Erfolg — der äussere `catch` liefert die generische Fehlerseite mit 200 | ja (`geraete.js` äusserer catch) |
| L9 | gering | Begründung des `audit_log`-Ausschlusses behauptet eine Auffanggarantie, die es nicht gibt | ja |
| L10 | gering | Diagnose-Map `erwarteteStudioJeId` nur nach Zahl geschlüsselt, Tabellen haben eigene IDs | ja |

Kosten Lesespur: 15,40 $ (3.731.458 ein / 31.843 aus, 22 Runden).
