# Auftrag C6-A1 — Monatslauf: Nachholen, Hinweise, Datumsrechnung (Extrarunde C6)

Fassung 2, 01.10.2026. Repo GymDocu, Stand master `9dfe522`.

**Planprüfung Fassung 1:** flash (14 Befunde) und gpt-6.1-sol (13 Befunde). Die tragenden habe ich selbst
nachgemessen, unter anderem die `pg_locks`-Wartebelege in `test_feature_monatslock_verbindung.js:172-175` und den
Modul-catch in `generateMonthlyPDFs.js:301-341`. Daraus folgt eine Aufteilung:
- Die Punkte zur Monatssperre und zur Archivversion (F3/R2-4, R2-1, F2) sind herausgelöst. Sie bekommen einen
  eigenen Auftrag `auftrag-c6a2-archivversionen.md` mit eigener Planprüfung, weil die Planprüfung dort mehrere
  blockierende Lücken fand.
- Dieser Auftrag enthält den Rest.

**Herkunft:** `plaene/c6-zustand-01-10/z1.md`, `z5a.md`, `z5b.md`. Jede Fundstelle ist neu zu messen. Widerspricht
der Code dem Auftrag, wird abgebrochen und gemeldet.

**Modell.** Standard-Executer. Keine hergeleitete Schwelle; Falle ist ein Test gegen einen Vorzustand, der das
Ergebnis ohnehin erzwingt.

**Arbeitsbaum und Datenbank.**
- `/workspace/gymdocu-c6a1`, Zweig `c6a1-monatslauf` ab `origin/master`.
- Einzeltests NUR gegen `gymdocu_c6a1_test`.
- Volle Suite als `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. Die Sperrdatei nie anfassen, kein äußeres
  `flock`.
- In einem anderen Baum baut parallel C6-F (Tests). Konflikte in Testdateien beim späteren Merge sind erwartet.

**Grundsätze.**
- Jede neue Zusicherung bekommt eine Gegenprobe (ROT/GRÜN wörtlich). Gegenproben-Skripte nehmen den Zielpfad als
  Argument, brechen bei ≠ 1 Treffer ab und werden nie mit einem Testlauf verkettet.
- Sollwerte von außen: handgeschriebene Typenlisten, Zeilenzahlen aus `pdf_archiv` und Kalenderfakten als Literal.
  Ein Sollwert aus dem geprüften Modul zählt nicht.
- Wer echte PDFs erzeugt, schreibt unter eine Wegwerf-`PDF_ROOT`. Muster: `test_feature_c5c_monatslauf_aktivitaet.js:22-26`.

## Punkte

### 1. c5c#2 — Nachholen je fehlendem Typ, nicht „irgendein Eintrag“ (sollte)

- `vormonatNachholen()` (`generateMonthlyPDFs.js:479-490`) tut heute nichts, sobald für den Vormonat irgendeine
  `pdf_archiv`-Zeile existiert. Bricht der Monatslauf nach Modul k ab, bekommen die Module k+1..8 im Nachholfenster
  keinen Nachweis.
- `generateAllMonthlyPDFs(studioId, { nurFehlende: true })` überspringt in der Modulschleife ein Modul, wenn für
  (Studio, Monat, Typ) bereits eine `pdf_archiv`-Zeile existiert.
  - Die Prüfung läuft unter der Monatssperre, direkt vor dem Modul.
  - Alle übrigen Regeln bleiben, auch `modulAktiv()` samt Erzwingung bei Daten. Ein aktives Modul erzeugt immer ein
    PDF („aktiv und leer“ ergibt „keine Einträge“). Ein aktives Modul ohne Zeile fehlt also tatsächlich.
- `vormonatNachholen()`:
  - Bei `vorhanden > 0` wird mit `nurFehlende: true` erzeugt statt abgebrochen.
  - Bei `vorhanden === 0` bleibt alles wie heute (Gründungsdatum, Aktivitätszählung mit `_zaehlfehler`).
  - Rückgabe: `nichts_zu_tun` NUR, wenn kein Modul fehlte; sonst `generiert` mit den nachgeholten Typen.
  - `monatKey` und `vorhanden` stehen in BEIDEN Zweigen, denn `test_feature_c5c_monatslauf_aktivitaet.js:104-105` und
    `:178-179` lesen `vorhanden`.
- Verhaltensänderung, die in den Bericht gehört: Eine einzige vorhandene Zeile lässt jetzt alle aktiven, auch leeren
  Module nachholen, mit Mail.
- Test (ROT auf master):
  - Vormonat mit Aktivität in mindestens zwei Modulen.
  - Eine `pdf_archiv`-Zeile nur für `seilkontrolle` seeden, dann `vormonatNachholen()` aufrufen.
  - Erwartet: Die Typenmenge in `pdf_archiv` ist eine handgeschriebene Liste der aktiven Typen. `seilkontrolle`
    bleibt unverändert (gleiche `id`, gleicher `pdf_hash`).
  - Positivkontrolle: Ein Modul, das per Schalter aus ist und keine Daten hat, entsteht NICHT.
  - Ein zweiter Aufruf erzeugt KEINE weitere Zeile. Gemessen wird das über `COUNT(*)` vor und nach dem Aufruf; der
    Rückgabewert allein reicht nicht.

### 2. V01-8 — `mail_gesendet` gehört zu dem, was die Mail tatsächlich nennt (Anmerkung)

- `sendeArchivMail` (`generateMonthlyPDFs.js:467-470`) setzt heute `mail_gesendet` für ALLE Zeilen des Monats, auch
  für einen Typ, dessen Modul in diesem Lauf scheiterte und dessen alte Zeile gar nicht genannt wird.
- Neue Regel: Die Mail nennt die in diesem Lauf erstellten Typen UND die bereits vorhandenen Zeilen des Monats mit
  `mail_gesendet = 0`, die nicht unter den gescheiterten Typen sind. Das sind Nachweise, die nie gemeldet wurden,
  etwa nach einem Abbruch vor der Mail.
- `mail_gesendet = 1` wird genau für die genannten Zeilen gesetzt (über `id` oder `typ`, mit `studio_id`).
- Der zweite Aufrufer `routes/archiv.js` `/mail/:monat` schickt den ganzen Monat. Er setzt das Flag weiter für alle
  Zeilen des Monats; das stimmt dort. Du misst das nach und benennst es.
- Tests:
  - Ein Modul scheitert und hat eine alte Zeile: Diese bleibt bei 0, die erstellten stehen auf 1.
  - Nachholfall: Eine alte Zeile mit `mail_gesendet = 0` steht in der Nachhol-Mail und danach auf 1.
  - Sollwerte sind handgeschriebene Typenlisten.

### 3. C2-S8 und V09-7 — Unlesbare Betriebszeiten im Monats-PDF sichtbar; `core/` importiert keine Route (sollte / Anmerkung)

- `core/pdf-engine.js:659` lädt `require('../routes/betriebszeiten')`. Das ist laut Planprüfung der einzige
  `core/ → routes/`-Require.
  - Die reine Logik (`istKonfiguriert`, `istBetriebstag`, `konfigFuerTag`, `tagesStatus` und was sie brauchen) zieht
    nach `core/betriebszeiten-logik.js`.
  - `routes/betriebszeiten.js` re-exportiert dieselben Namen. Es gibt keine zweite Kopie.
  - Neuer statischer Wächter: kein `require('../routes/` bzw. `require("../routes/` in `core/**/*.js`.
    - Kommentare werden vorher abgezogen, mit Positivkontrolle.
    - Die Dateimenge kommt gegen `git ls-files 'core/**/*.js'`.
    - Gegenprobe: den alten Require zurück → ROT.
- Einen Außenkanal gibt es schon (`istKonfigUnlesbarHeute`, Oberfläche). Neu ist der Weg in das MONATS-PDF.
  - War die Konfiguration an mindestens einem Tag des Monats unlesbar, zeichnet die Betriebstage-Übersicht einen
    Warnkasten: „Betriebszeiten konnten nicht gelesen werden — die Übersicht behandelt ersatzweise alle Tage als
    Betriebstage.“
  - Die bestehende gedrosselte Meldung bleibt.
- Test:
  - Ungültiges JSON in `betriebszeiten_versionen` seeden. Der erzeugte Inhalt (Stub-doc, Muster
    `test_feature_messfehler_nicht_behaupten.js`) enthält den Hinweis.
  - Mit gültiger Konfiguration fehlt er.

### 4. V09-6 — Pausen-PDF übersteht fehlende Pausenzeiten (sollte)

- `core/pdf-engine.js:1516-1518` ruft `r.pause_von.split(':')` auf. Die Spalten dürfen NULL sein (`core/db.js:779-780`,
  Korrektur-Registry `nullable`).
- Fehlt eine der beiden Zeiten, werden die Pausenzellen mit „nicht erfasst“ gezeichnet und die Dauer bleibt leer.
  Die Zeile wird NICHT weggelassen.
- Test: eine Zeile mit NULL-Pause neben einer normalen. Die Promise löst, die Datei existiert, und der Inhalt enthält
  beide Zeilen und „nicht erfasst“. Heute ROT.

### 5. V01-7r — Datumsrechnung im Berliner Kalender (Anmerkung)

- `datumPlusTage()` (`generateMonthlyPDFs.js:52-56`) und dieselbe Bauart in `routes/archiv.js:1178-1189` rechnen mit
  `setDate(getDate()+n)` in Prozesszeit.
- Neu: `plusTage(formatBerlinDate(new Date()), n)` aus `core/datum.js`. Ein `heuteBerlinStr()` gibt es nicht.
- Heute wirft ein vorhandener, nicht-numerischer Konfigwert einen `RangeError` vor dem ersten Modul. Ein fehlender
  Wert nimmt den Vorgabewert. Beides bleibt so: Neu wirft `plusTage` laut, und es gibt KEINEN stillen Ersatzwert.
  `Number('')` wird nicht eingeführt.
- Test: `TZ=UTC`, festgehaltene Zeit `2026-10-24T22:30:00Z`, `pdf_loeschen_tage = '1'`. Dann gilt
  `loeschen_nach === '2026-10-26'`; handgerechnet ist Berlin dann der 25.10. Heute ROT (`2026-10-25`). Das
  Uhrstell-Muster steht in `test_feature_fundsachen_ablauf_rollover.js:55-74`.

### 6. V09-9 und V08-6 — doppelte Abfragen (Anmerkung, Leistung)

- V09-9: `core/pdf-engine.js:957-961` lädt die Sitzungsdetails je Geräte-Chunk UND Sitzung.
  - Neu: einmal je Sitzung vor der Chunk-Schleife laden.
  - Test: Zähler um `db.q`, bei 9 Geräten (2 Chunks) und 2 Sitzungen gibt es 2 Detailabfragen. Das Ergebnis-PDF ist
    inhaltlich gleich.
- V08-6: `core/monatskontrollen.js:112-119` lädt Protokolle für alle monatlichen Betreibergeräte statt nur für die
  Pflicht-Teilmenge.
  - Neu: die zweite Abfrage mit `AND p.geraet_id = ANY($2)` auf die gefilterten Einträge beschränken.
  - Den Kommentar `:105-109` präzisieren: Er gilt nur für die erste Abfrage.
  - Test: Ein Nicht-Pflicht-Monatsgerät mit Prüfung taucht in den Parametern der zweiten Abfrage nicht auf.
  - Das sichtbare Ergebnis bleibt gleich; bestehende Tests, die beide Wege gegeneinander halten, bleiben grün.

## Bericht

- Je Punkt zuerst die NEUE Messung der Fundstelle, dann:
  - der Diff;
  - jede Gegenprobe wörtlich;
  - die volle Suite: Exit, gelaufene gegen registrierte Dateien, `diff` EXIT 0;
  - Lint.
- Die Verhaltensänderung aus Punkt 1 und die Messung zu `/mail/:monat` ausdrücklich nennen.
- Ein Fund, den du für unrealistisch hältst, gehört trotzdem hinein.
