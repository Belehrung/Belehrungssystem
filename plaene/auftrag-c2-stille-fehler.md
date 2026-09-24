# Auftrag C2 — stille Fehler sichtbar machen (Fassung 2, 24.09.2026)

Arbeitsbaum `/workspace/gymdocu-c2`, Zweig `fix-c2-stille-fehler`, Basis `946647a` (master nach P3).
Einordnung: Standard-Executer — acht kleine, gleichartige Stellen; keine hergeleiteten Schwellen, keine
Architektur über den Auftrag hinaus. Befundtexte: `plaene/vollpruefung-befunde.md` (V-Nummern),
`plaene/offene-befunde-p4.md` (PP4b-22). **Fassung 2** nach der Planprüfung (`plaene/planpruefung-c2.md`, 14 Zeilen);
Änderungen mit PC2-Nummern markiert, neue Punkte 9 und 10.

**Gemeinsame Regel für alle zehn:** ein Fehler, der heute als „leer“ oder „Erfolg“ weiterläuft, wird entweder
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
| `server.js:848` | `catch` → `betriebstag = true` (sicheres Verhalten bleibt), **neu: `console.error` mit Präfix** (PC2-1) |
| `core/spuelplan.js:100-112` (`ladeStatus`, gerufen von `server.js:983` und `routes/spuelplan.js:100`) | fängt SELBST (`catch (e) { wib = null; }`) — der Wurf erreicht weder `server.js` noch die Route. **Neu** (PC2-10): `ladeStatus` liefert zusätzlich `wibFehler: true` und schreibt `console.error`; die Tablet-Spülplanseite zeigt „Wiederinbetriebnahme konnte nicht geprüft werden — bitte der Leitung melden“. `server.js:983`: bleibt, **neu `console.error`** im eigenen `catch` (PC2-1) |
| `ladeKonfig()` → Editor | Wurf → zentrale Fehlerseite (500) |

`parseConfig()` (`:80-82`): kaputtes JSON in der DB fällt weiter auf `DEFAULT_CONFIG` zurück (sonst wäre der
Editor unbenutzbar), aber NICHT mehr still: `console.error` mit Studio-ID und `melde(e, { studioId }, 'betriebszeiten:parseConfig')` (Datenschaden; PC2-7/14 — `melde` liest die Studio-ID aus dem
zweiten Argument; dass die Drossel Studios zusammenfasst, ist eine benannte Grenze). `parseConfig` bekommt dafür die
Studio-ID als zweites Argument.

## 2. V03-1 — `routes/verbandbuch-admin.js:620-624` und `:656-660` (Art. 9 DSGVO)

Das Weitergabe-Protokoll für Gesundheitsdaten darf nicht still fehlen.
- **POST `/eintrag/:id/weitergabe`** (`:656-660`): scheitert der INSERT → `melde()`, KEIN Erfolgs-Redirect,
  sondern eine Fehlerantwort (Status 500, Text „Weitergabe konnte NICHT protokolliert werden — bitte erneut
  versuchen oder der Leitung melden“). Kein Hinweis auf Erfolg.
- **Geschützter PDF-Export** (`:620-624`): der Protokolleintrag steht heute NACH `qpdf` und VOR `res.download`.
  Scheitert er → **fail-closed**: geschützte Kopie und Original aufräumen (dieselben Aufrufe wie AUSGANG 1/3),
  `melde()`, Status 500 mit demselben Sinn. Begründung: Gesundheitsdaten ohne Protokoll hinauszugeben ist
  schlimmer als ein gescheiterter Download, der sich wiederholen lässt.
- Weitere Wege (offene PDF-Route `:536-582`, statischer `/pdf`-Wächter) schreiben kein Protokoll — gemessen in der
  Planprüfung (PC2-4); ob ein Admin-Download eine „Weitergabe“ ist, ist eine Rechtsfrage → Sammelliste, NICHT bauen.
- **Test** (PC2-11): `execFile` stubben (qpdf-Erfolg simulieren — kein echter Prozess im Deploy-Gate), `db.run` NUR
  für den `verbandbuch_weitergaben`-INSERT scheitern lassen; Zusicherung auf Status 500 UND den exakten neuen Text UND
  zwei Aufräum-Spione (geschützte Kopie, Original). Nur so ist die Gegenprobe vom äusseren `catch` (`:638-645`, auch
  500) unterscheidbar.

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
- Der stille Frühausstieg `if (!m) return;` bei vorhandenem Code: die Planprüfung fand statisch, dass alle Erzeuger
  `/pdf/<id>/<Typ>/<datei>` bauen (PC2-8, `core/pdf-engine.js:261, 1520, 1801`). **Executer misst ZUSÄTZLICH zur
  Laufzeit** (vorübergehende Protokollzeile ALLER `publicPath`-Werte, danach entfernt) und legt eine Abdeckungsliste
  vor: je `finalize`-Aufrufstelle mindestens ein belegter Pfad (PC2-12). Vollständig und alle treffen → wirft ebenfalls.
  Fehlt eine Aufrufstelle oder trifft einer nicht → NICHT werfen, melden, Rückfrage.
- Alle Aufrufer von `finalize` erben die Ablehnung. Executer zählt sie und meldet je Aufrufer, ob der Fehler
  dort sichtbar wird oder verschluckt wird (PP4b-22 unten und `generateMonthlyPDFs.js` sind bekannte Verschlucker,
  s. Punkt 10).

## 6. V08-4 — `workers/pdf-job-worker.js:21-28`

`if (!result || result.missing) return;` und `if (!absolute || !fs.existsSync(absolute)) return;` beenden den Job
heute als ERFOLG. Neu: Fehler mit `permanent = true` werfen → `queue.deadLetter` (`:85-87`), kein Wiederholen
(die Datei kommt durch Warten nicht zurück), KEINE Neuerzeugung (ein Dokument wird nie ersetzt, Hash steht in
der Kette). Tote Jobs zählt heute nur der Health-Endpunkt (`core/pdf-jobs.js:360,368`, `routes/health-intern.js:232-236`,
PC2-5) — ohne IDs. Deshalb zusätzlich ein Log mit Studio- und Korrektur-ID beim Übergang auf `dead` (keine
Personendaten).

## 7. PP4b-22 — `routes/spuelplan.js:324`

`try { pdfPath = await generateSpuelprotokollPDF(…); } catch (e) { pdfPath = null; }`: Das Protokoll IST
gespeichert (Transaktion committet), nur das PDF fehlt. Erfolgsbanner bleibt, dazu ein sichtbarer Hinweis
„PDF konnte nicht erzeugt werden — bitte der Leitung melden“ und `melde()`. **Kein Verweis auf einen Nachholweg** — es
gibt keinen (PC2-6; CLAUDE.md „Ein Verweis kann in eine Sackgasse zeigen“).

## 8. V03-2 — `routes/sichtpruefung.js:1515-1519` (`ladeFotos`)

Fünf Aufrufer (`:1291, :3003, :3185, :3191, :3511`), alle reine Anzeige (PC2-13). DB-Fehler → nicht mehr `[]`,
sondern an ALLEN fünf ein sichtbarer Hinweis „Fotos konnten nicht geladen werden“ + `console.error`. Kein Wurf: an
`:3511` endete er über den `catch` (`:3562-3565`) sogar als Erfolgsseite `?saved=1` (PC2-3; dieser `catch` selbst ist
vorbestehend → Sammelliste C2-S2). Findet der Executer doch einen Entscheidungs- oder Löschweg, meldet er ihn.

## 9. V04-2 — `routes/wartung.js:1544-1553` (PC2-9)

Nach dem Commit (`gespeichert = true`, `:1381`) meldet jeder spätere Fehler „Fehler beim Speichern“ — eine Wiederholung
erzeugt eine zweite Prüfung und einen doppelten Sperrgrund. Neu: im `catch`, NACH der `EingabeFehler`-Weiterleitung
(der P3-Wächter verbietet ein `return` davor) und nach der Upload-Aufräumung: ist `gespeichert` → Seite „Prüfung
gespeichert. Danach ist ein Fehler aufgetreten (…) — bitte NICHT erneut absenden, sondern der Leitung melden“ +
`melde()`. Nicht gespeichert → wie heute.

## 10. Monatslauf — `generateMonthlyPDFs.js:252-254` (PC2-2)

Der Monatslauf fängt jeden Modulfehler mit nur `console.error`; das Monats-PDF fehlt dann still im Archiv, die Mail wird
aus den übrigen gebaut — und erbt künftig die `finalize`-Ablehnung aus Punkt 5. Neu: `melde()` je gescheitertem Modul
(Quelle `generateMonthlyPDFs:<typ>`, Studio-ID) und in der Archiv-Mail eine Zeile „<Modul>: konnte nicht erzeugt werden
— bitte der Leitung melden“. Der Lauf bricht NICHT ab (die übrigen Module bleiben). Test: ein Modul-Stub wirft → Mail-
Stub enthält die Zeile, `melde`-Stub gerufen; Positivkontrolle ohne Wurf.

## Tests (je Stelle)

- Je Stelle ein Fehlerfall, der den DB-Aufruf gezielt scheitern lässt (Stub der jeweiligen Abfrage, keine
  echten Dienste; `melde` gestubbt, nie echt), mit Zusicherung auf das SICHTBARE Ergebnis (Text in HTML/PDF,
  Status, Job-Status `dead`) — nicht nur „wirft nicht“.
- **Positivkontrolle je Stelle:** derselbe Aufruf ohne Fehler zeigt den Hinweis NICHT.
- **Gegenprobe je Stelle:** den alten stillen `catch` zurücksetzen → der jeweilige Test wird ROT; zurücknehmen
  per `cp` aus einer Sicherung, `diff` EXIT 0. Zahlen wörtlich.
- Zustandsfrage für den Bericht: **welcher Zustand entsteht durch die Änderung, den es vorher nicht gab?**
  (z. B. verwaiste PDF-Dateien bei 5, tote Jobs bei 6, 500er bei 2, fehlende WIB-Karte mit Hinweis bei 1) — je Stelle ein Satz.
- Volle Suite nach Ritual, Dateizahl-Ritual.

-- Ende des Auftrags --
