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
| PC2-10 | Kimi 1 | Die Aufrufer-Tabelle stimmt für beide Spülplan-Wege nicht: `ladeStatus()` fängt den Wurf SELBST (`core/spuelplan.js:112`, `catch (e) { wib = null; }`). Folge nach der Änderung: bei kaputten Betriebszeiten verschwindet die Wiederinbetriebnahme-Karte (Trinkwasser/Legionellen) still — neu still, ohne Log. | gelesen `core/spuelplan.js:100-112` | **mittel** (eigener Tabellenfehler; DeepSeek sah es nicht) | `ladeStatus` liefert `wibFehler: true` + `console.error`; Tablet-Spülplanseite zeigt „Wiederinbetriebnahme konnte nicht geprüft werden — bitte der Leitung melden“ |
| PC2-11 | Kimi 2 | Test für den geschützten Export braucht einen `execFile`-Stub (sonst echter qpdf-Prozess im Deploy-Gate oder AUSGANG 1), und die Zusicherung nur auf 500 wäre über den äusseren `catch` falsch grün. | gelesen `verbandbuch-admin.js:611-645` | mittel | Stub qpdf-Erfolg; `db.run` nur für den INSERT scheitern lassen; Status + exakter Text + zwei Aufräum-Spione |
| PC2-12 | Kimi 3 | Die Laufzeitmessung der `publicPath`-Regex beweist nur, was die Suite fährt. | Papier §5 | mittel | statisch (DeepSeek PC2-8) UND zur Laufzeit je `finalize`-Aufrufstelle ein belegter Pfad; fehlt einer → Rückfrage statt Wurf |
| PC2-13 | Kimi 4 | Keiner der fünf `ladeFotos`-Aufrufer nutzt die Fotos für eine Entscheidung/Löschung; ein Wurf blockierte Reparatur/Nachliefern. | Angabe übernommen (fünf Stellen bestätigt) | gering | alle fünf: Hinweis; Wurf nur mit gezeigtem Entscheidungsweg |
| PC2-14 | Kimi 5 | `melde(e, null, …)`: Telegram ohne Studio-ID, Drossel fasst Studios zusammen. | = PC2-7 | gering | `melde(e, { studioId }, …)`; Drossel über Studios hinweg als Grenze benannt (die Signatur ist per Konstruktion wertfrei) |

DeepSeek-Prüfgrenze behauptet, `server.js` habe keine eigene Fehler-Middleware — **fällt**: `server.js:1479`
(`baueFehlerbehandler`).

## Zahlen

14 Zeilen: DeepSeek 8 (1 Nebenbehauptung gefallen: „keine Fehler-Middleware“), Kimi 5, eigene 1. Überschneidung: nur
`melde` ohne `req` (PC2-7/14). Nur DeepSeek: `server.js`-Log, Monatslauf-Verschlucker, `saved=1`-catch, Weitergabe-Wege,
Nachholweg. Nur Kimi: Spülplan fängt selbst (mein Tabellenfehler), qpdf-Stub, Abdeckung der Regex-Messung.
