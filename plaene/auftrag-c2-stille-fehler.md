# Auftrag C2 — stille Fehler sichtbar machen (Fassung 1, 24.09.2026)

Arbeitsbaum `/workspace/gymdocu-c2`, Zweig `fix-c2-stille-fehler`, Basis `946647a` (master nach P3).
Einordnung: Standard-Executer — acht kleine, gleichartige Stellen; keine hergeleiteten Schwellen, keine
Architektur über den Auftrag hinaus. Befundtexte: `plaene/vollpruefung-befunde.md` (V-Nummern),
`plaene/offene-befunde-p4.md` (PP4b-22).

**Gemeinsame Regel für alle acht:** ein Fehler, der heute als „leer“ oder „Erfolg“ weiterläuft, wird entweder
SICHTBAR (Oberfläche/PDF zeigt „konnte nicht geladen werden“) oder LAUT (Wurf an einen Aufrufer, der ihn
nachweislich sichtbar macht) — und landet im Server-Log. `melde()` (`core/error-tracker.js:258`, Telegram mit
Drossel je Signatur) nur dort, wo unten ausdrücklich verlangt. Nichts wird still „repariert“.

## 1. V02-3 — `routes/betriebszeiten.js:107-120`

`konfigNeueste()` und `konfigFuerTag()`: `try { … } catch (e) {}` ENTFERNEN — ein DB-Fehler wirft. Der Kommentar
bei `istKonfiguriert()` (`:122-143`) behauptet für `ladeKonfig()` heute schon eine ehrliche 500-Seite; mit der
Änderung stimmt er. Aufrufer (gemessen 24.09.2026, alle fangen bereits):

| Aufrufer | Verhalten nach dem Wurf |
|---|---|
| `routes/admin/dashboard.js:175` | liegt im „Heute wichtig“-`try` → Karte „konnte nicht geladen werden“ (`:551-569`) |
| `core/pdf-engine.js:453` (`zeichneBetriebstageUebersicht`) | im `try` → sichtbarer Fehlerkasten (`:489`) |
| `server.js:848` | `catch` → `betriebstag = true` (sicheres Verhalten, Kommentar dort) |
| `server.js:983` | `catch` → `spuelStatus = null` |
| `routes/spuelplan.js:100` | im `try` der Route — **Executer misst, was der `catch` dort zeigt, und meldet es** |
| `ladeKonfig()` → Editor | Wurf → zentrale Fehlerseite (500) |

`parseConfig()` (`:80-82`): kaputtes JSON in der DB fällt weiter auf `DEFAULT_CONFIG` zurück (sonst wäre der
Editor unbenutzbar), aber NICHT mehr still: `console.error` mit Studio-ID und `melde()` (Datenschaden).
`parseConfig` bekommt dafür die Studio-ID als zweites Argument.

## 2. V03-1 — `routes/verbandbuch-admin.js:620-624` und `:656-660` (Art. 9 DSGVO)

Das Weitergabe-Protokoll für Gesundheitsdaten darf nicht still fehlen.
- **POST `/eintrag/:id/weitergabe`** (`:656-660`): scheitert der INSERT → `melde()`, KEIN Erfolgs-Redirect,
  sondern eine Fehlerantwort (Status 500, Text „Weitergabe konnte NICHT protokolliert werden — bitte erneut
  versuchen oder der Leitung melden“). Kein Hinweis auf Erfolg.
- **Geschützter PDF-Export** (`:620-624`): der Protokolleintrag steht heute NACH `qpdf` und VOR `res.download`.
  Scheitert er → **fail-closed**: geschützte Kopie und Original aufräumen (dieselben Aufrufe wie AUSGANG 1/3),
  `melde()`, Status 500 mit demselben Sinn. Begründung: Gesundheitsdaten ohne Protokoll hinauszugeben ist
  schlimmer als ein gescheiterter Download, der sich wiederholen lässt.
- Executer prüft, ob es WEITERE Wege gibt, auf denen ein Verbandbuch-PDF das Haus verlässt (offene
  PDF-Route oberhalb, Sammel-Export), und meldet, ob dort ein Protokoll geschrieben wird. Nicht bauen, nur melden.

## 3. V04-3 — `routes/admin/dashboard.js:205-206`

`try { wRows = await getDieseWocheFaellig(sid); } catch (e) {}` → Fehlerflag nach dem Muster von `wdhFehler`
(`:363-370`): Zeile in `dieseWoche` mit `var(--gd-achtung-text)`, „Fällige Wartungen konnten nicht geladen werden
— bitte der Leitung melden“, plus `console.error` mit Präfix. Damit kann „Alles im grünen Bereich“ (`:544-549`)
bei diesem Fehler nicht mehr erscheinen. Keine neuen Rohwerte (Rohwert-Wächter).

## 4. V09-2 — `core/pdf-engine.js:1218` und `:2308`

Beide `catch (e) { … = []; }` für `sperr_sichtkontrollen`: statt des stillen Wegfalls zeichnet
`zeichneSperrSichtkontrollenAnhang()` einen sichtbaren Fehlerkasten nach dem Vorbild von
`zeichneBetriebstageUebersicht()` (`:489`ff., dieselbe Datei — Muster übernehmen, nicht neu erfinden) und
`console.error`. Die Funktion bekommt dafür einen Fehler-Parameter; ein ERFOLGREICH leeres Ergebnis zeichnet
weiter wie heute (leer ≠ nicht geladen).

## 5. V09-3 — `core/pdf-engine.js:71-85` (`registriereVerify`) und `:402-405` (`finalize`)

Ein PDF, dessen Prüfcode `/v/<code>` nicht findet, meldet einer Aufsicht „nicht echt“. Deshalb **fail-closed**:
- Scheitert Lesen/Hashen/INSERT → `registriereVerify` wirft; im `finish`-Handler von `finalize` wird das
  gefangen und die Zusage **abgelehnt** (`reject`), `verifyCodes.set` unterbleibt. Die Datei bleibt liegen
  (verwaist, aufräumbar — nicht löschen, s. CLAUDE.md „Im Zweifel nicht löschen“).
- Der stille Frühausstieg `if (!m) return;` bei vorhandenem Code: **Executer misst zuerst**, ob irgendein
  Erzeuger in der Suite einen `publicPath` liefert, der die Regex nicht trifft (vorübergehende Protokollzeile,
  danach entfernt; Ergebnis wörtlich melden). Trifft keiner → wirft ebenfalls. Trifft einer → NICHT werfen,
  sondern melden und Rückfrage.
- Alle Aufrufer von `finalize` erben die Ablehnung. Executer zählt sie und meldet je Aufrufer, ob der Fehler
  dort sichtbar wird oder verschluckt wird (PP4b-22 unten ist ein bekannter Verschlucker).

## 6. V08-4 — `workers/pdf-job-worker.js:21-28`

`if (!result || result.missing) return;` und `if (!absolute || !fs.existsSync(absolute)) return;` beenden den Job
heute als ERFOLG. Neu: Fehler mit `permanent = true` werfen → `queue.deadLetter` (`:85-87`), kein Wiederholen
(die Datei kommt durch Warten nicht zurück), KEINE Neuerzeugung (ein Dokument wird nie ersetzt, Hash steht in
der Kette). Executer prüft und meldet, ob tote Jobs heute irgendwo gemeldet werden (Health, Wochenreport); wenn
nicht, zusätzlich ein Log mit Studio- und Korrektur-ID (keine Personendaten).

## 7. PP4b-22 — `routes/spuelplan.js:324`

`try { pdfPath = await generateSpuelprotokollPDF(…); } catch (e) { pdfPath = null; }`: Das Protokoll IST
gespeichert (Transaktion committet), nur das PDF fehlt. Erfolgsbanner bleibt, dazu ein sichtbarer Hinweis
„PDF konnte nicht erzeugt werden — bitte der Leitung melden“ und `melde()`. Executer prüft, ob sich das PDF
später erzeugen lässt (Archiv, Nachholweg) und nennt ihn im Hinweis nur, wenn er nachweislich existiert
(CLAUDE.md: „Ein Verweis kann in eine Sackgasse zeigen“).

## 8. V03-2 — `routes/sichtpruefung.js:1515-1519` (`ladeFotos`)

Fünf Aufrufer (`:1291, :3003, :3185, :3191, :3511`). DB-Fehler → nicht mehr `[]`. Executer liest jeden Aufrufer
und wählt je Stelle: sichtbarer Hinweis „Fotos konnten nicht geladen werden“ (Anzeige) oder Wurf (wo die
Fotos für eine Entscheidung oder Löschung gebraucht werden — dort darf „keine Fotos“ nie aus einem Fehler
entstehen). Entscheidung je Stelle in einem Satz melden.

## Tests (je Stelle)

- Je Stelle ein Fehlerfall, der den DB-Aufruf gezielt scheitern lässt (Stub der jeweiligen Abfrage, keine
  echten Dienste; `melde` gestubbt, nie echt), mit Zusicherung auf das SICHTBARE Ergebnis (Text in HTML/PDF,
  Status, Job-Status `dead`) — nicht nur „wirft nicht“.
- **Positivkontrolle je Stelle:** derselbe Aufruf ohne Fehler zeigt den Hinweis NICHT.
- **Gegenprobe je Stelle:** den alten stillen `catch` zurücksetzen → der jeweilige Test wird ROT; zurücknehmen
  per `cp` aus einer Sicherung, `diff` EXIT 0. Zahlen wörtlich.
- Zustandsfrage für den Bericht: **welcher Zustand entsteht durch die Änderung, den es vorher nicht gab?**
  (z. B. verwaiste PDF-Dateien bei 5, tote Jobs bei 6, 500er bei 2) — je Stelle ein Satz.
- Volle Suite nach Ritual, Dateizahl-Ritual.

-- Ende des Auftrags --
