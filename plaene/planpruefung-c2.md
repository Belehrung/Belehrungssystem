# Planprüfung C2 — stille Fehler (24.09.2026)

Papier: `plaene/auftrag-c2-stille-fehler.md` (Fassung 1). Spuren: `deepseek-v4-pro` mit Repo-Lesezugriff (effort high,
29 Runden, ~2,98 $), `kimi-k3` mit Bündel (Papier, Auszüge der acht Stellen samt Aufrufern, `core/pdf-jobs.js`,
Worker, `melde`). Jeder Befund selbst nachgemessen.

| Nr. | Spur | Befund | Nachgemessen | Einstufung | Folge |
|---|---|---|---|---|---|
| PC2-1 | DeepSeek 1 | `server.js:848` und `:983` fangen den neuen Wurf aus `istBetriebstag()` weiter mit leerem `catch` — kein Log; verletzt die eigene gemeinsame Regel des Papiers. | gelesen `server.js:845-849, 980-984` | mittel | `console.error` mit Präfix in beide; Verhalten bleibt |
| PC2-2 | DeepSeek 2 | `generateMonthlyPDFs.js:252-254` verschluckt jeden Modulfehler des Monatslaufs (nur `console.error`); das Monats-PDF fehlt still im Archiv, die Mail wird aus den übrigen gebaut. Erbt künftig auch die `finalize`-Ablehnung (V09-3). | gelesen `:244-258` | **mittel** (Nachweis fehlt still) | `melde()` je Modul + Zeile in der Archiv-Mail „Modul X konnte nicht erzeugt werden“ |
| PC2-3 | DeepSeek 3 | `ladeFotos`-Aufrufer `sichtpruefung.js:3511` liegt in einem `try`, dessen `catch` auf `?saved=1` umleitet (`:3562-3565`) — ein Wurf dort endete als Erfolgsseite. | gelesen | mittel | dort Hinweis statt Wurf; der `catch`→`saved=1` selbst ist vorbestehend → Sammelliste (C2-S2) |
| PC2-4 | DeepSeek 4 | Offene Verbandbuch-PDF-Route `POST /eintrag/:id/pdf` (`verbandbuch-admin.js:536-582`) und der statische `/pdf`-Wächter liefern ohne Weitergabe-Protokoll. | gelesen (Angabe übernommen) | Anmerkung — ob ein Admin-Download eine „Weitergabe“ ist, ist eine Rechtsfrage | Sammelliste (C2-S1), nicht in C2 |
| PC2-5 | DeepSeek 5 | Tote PDF-Jobs sind im Health als Zähler sichtbar (`core/pdf-jobs.js:360,368`, `routes/health-intern.js:232-236`), ohne IDs. | gelesen (Angabe übernommen) | Anmerkung | Log mit Studio- und Korrektur-ID beim Übergang auf `dead` |
| PC2-6 | DeepSeek 6 | Kein Nachholweg für das Spülprotokoll-PDF (Verwaltung listet nur, Archiv kennt den Typ nicht). | Angabe übernommen | Anmerkung | Hinweis OHNE Verweis |
| PC2-7 | DeepSeek 7 | `melde(err, req, …)` liest die Studio-ID aus `req`; `parseConfig` hat kein `req`. | gelesen `core/error-tracker.js:246` | gering | `melde(e, { studioId }, 'betriebszeiten:parseConfig')` |
| PC2-8 | DeepSeek 8 | Alle `publicPath`-Erzeuger treffen die Regex von `registriereVerify`. | Angabe übernommen, im Bau zu messen | — | bestätigt die Planannahme |
| PC2-9 | eigene | V04-2 (`routes/wartung.js:1544-1553`): nach dem Commit (`gespeichert = true`, `:1381`) meldet jeder spätere Fehler „Fehler beim Speichern“ → Wiederholung erzeugt eine zweite Prüfung. Dieselbe Klasse wie PP4b-22. | gelesen | mittel | als Punkt 9 in Fassung 2; der Zweig `gespeichert` kommt NACH der `EingabeFehler`-Weiterleitung (P3-Wächter verbietet ein `return` davor) |

DeepSeek-Prüfgrenze behauptet, `server.js` habe keine eigene Fehler-Middleware — **fällt**: `server.js:1479`
(`baueFehlerbehandler`).

Kimi-Spur: folgt.
