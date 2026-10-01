# Auftrag C6-A — Monatslauf und PDF-Nachweise (Extrarunde C6)

Fassung 1, 01.10.2026. Repo GymDocu, Stand master `9dfe522`.

**Herkunft der Fundstellen.** Die Fundorte stehen in `plaene/c6-zustand-01-10/z1.md`, `z5a.md` und `z5b.md`,
gefunden per flash-Zustandsprüfung gegen `9ad8acd`. Jede Fundstelle ist eine BEHAUPTUNG, bis sie vor dem Bau neu
gemessen ist. Widerspricht der Code dem Auftrag, wird abgebrochen und gemeldet, statt passend gemacht.

**Modell.** Standard-Executer. Einordnung: komplex (Sperre, Abbruch, Nachholen greifen ineinander; ein Test gegen
eine leere Datenbank wäre falsch grün), aber keine Schwelle, die hergeleitet werden müsste. Die beiden Zeitlimits
unten sind gesetzt und begründet.

**Arbeitsbaum und Datenbank.**
- `/workspace/gymdocu-c6a`, Zweig `c6a-monatslauf` ab `origin/master`.
- Einzeltests NUR gegen eine eigene DB `gymdocu_c6a_test`, nie gegen `gymdocu_test`.
- Volle Suite als `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. Die Sperrdatei nie anfassen, kein äußeres
  `flock`.

**Grundsätze.**
- Jede neue Zusicherung bekommt eine Gegenprobe (Defekt herstellen → ROT, zurücknehmen → GRÜN, beides wörtlich im
  Bericht). Gegenproben-Skripte nehmen den Zielpfad als Argument, brechen bei ≠ 1 Treffer ab und werden nie mit
  einem Testlauf verkettet.
- Sollwerte kommen von außen, als Literal im Test: ein von Hand hingeschriebener Typensatz, ein fester Kalendertag.
  Ein Sollwert aus dem geprüften Modul (`MODULE`, `istBetriebstag()`) zählt nicht.
- Fixturen so wählen, dass verschiedene Bedeutungen verschiedene Zahlen tragen.

## Punkte

### 1. c5c#2 — Nachholen je fehlendem Typ, nicht „irgendein Eintrag“ (sollte)

`generateMonthlyPDFs.js` `vormonatNachholen()` tut heute nichts, sobald für den Vormonat irgendeine
`pdf_archiv`-Zeile existiert (`COUNT(*) … > 0`). Bricht der Monatslauf nach Modul k ab, bekommen die Module k+1..8
dieses Monats dauerhaft keinen Nachweis.

- `generateAllMonthlyPDFs(studioId, { nurFehlende: true })`:
  - In der Schleife wird ein Modul übersprungen, wenn für (Studio, Monat, Typ) bereits eine `pdf_archiv`-Zeile
    existiert.
  - Die Prüfung läuft UNTER der Monatssperre, direkt vor dem Modul.
  - Alle übrigen Regeln bleiben dieselben, auch `modulAktiv()` mit der Erzwingung bei Daten. Ein aktives Modul
    erzeugt immer ein PDF („aktiv und leer“ ergibt „keine Einträge“). Ein aktives Modul ohne Zeile fehlt also
    tatsächlich.
- `vormonatNachholen()`:
  - Bei `vorhanden > 0` wird nicht mehr abgebrochen, sondern mit `nurFehlende: true` erzeugt.
  - Bei `vorhanden === 0` bleiben die bisherigen Prüfungen (Gründungsdatum, Aktivitätszählung mit
    `_zaehlfehler`).
  - Rückgabe:
    - `aktion: 'nichts_zu_tun'` NUR, wenn kein Modul fehlte;
    - sonst `'generiert'` mit den nachgeholten Typen.
- Die Archiv-Mail eines Nachhol-Laufs nennt nur die nachgeholten Typen.
- Test (ROT auf master):
  - Vormonat mit Aktivität in mindestens zwei Modulen.
  - Eine `pdf_archiv`-Zeile nur für `seilkontrolle` seeden, dann `vormonatNachholen()` aufrufen.
  - Erwartet: die übrigen AKTIVEN Typen entstehen, `seilkontrolle` bleibt unverändert (gleiche `id`, gleicher
    `pdf_hash`).
  - Die Erwartungsmenge ist eine handgeschriebene Liste.
  - Positivkontrolle: Ein Modul, das per Schalter aus ist und keine Daten hat, entsteht NICHT. Ein zweiter Aufruf
    meldet `nichts_zu_tun`, damit belegt ist, dass es keine Dauerschleife gibt.

### 2. F3 / R2-4 — Wartezeit an der Monatssperre begrenzen (sollte)

`mitMonatsLock()` wartet heute mit `pg_advisory_lock` unbegrenzt. Ein Admin-Klick auf „neu-single“ hängt damit ohne
Rückmeldung, und `fuerAlleStudios` (`server.js`, sequentiell) wartet für alle folgenden Studios mit.

- `mitMonatsLock(studioId, arbeit, { wartezeitMs })` holt die Sperre mit `pg_try_advisory_lock` in einer Schleife
  (Abstand 250 ms) bis `wartezeitMs`.
- Läuft die Zeit ab, wirft die Funktion einen eigenen, erkennbaren Fehler (`err.code = 'MONATSLOCK_BELEGT'`). Die
  Arbeit läuft dann NICHT.
- Vorgaben:
  - Ohne Angabe gelten 15 Minuten. Das betrifft den Cron, das Nachholen und `regenerierePdfMonat.js`.
  - Die Admin-Routen in `routes/archiv.js` (`/neu/:monat`, `/neu-single`) übergeben 20 Sekunden und antworten bei
    `MONATSLOCK_BELEGT` mit 409 und einer Seite „Für dieses Studio läuft gerade eine PDF-Erzeugung — bitte in
    einigen Minuten erneut versuchen.“ Dabei gibt es KEIN `melde()`, denn das ist ein erwarteter Zustand.
  - Cron und Nachholen melden `MONATSLOCK_BELEGT` mit `melde()`. Danach läuft `fuerAlleStudios` mit dem nächsten
    Studio weiter, wie bei jedem anderen Fehler.
- Ob `fuerAlleStudios` einen Wurf schon heute je Studio abfängt, misst du selbst, bevor du dich darauf verlässt.
- Begründung der Werte, als Kommentar an die Konstanten:
  - 20 s liegen unter dem Standard-`proxy_read_timeout` von nginx (60 s), damit der Benutzer eine Antwort statt
    eines 504 bekommt.
  - 15 min sind so gewählt, dass ein normaler Monatslauf eines Studios fertig wird, ein hängender aber nicht alle
    folgenden blockiert.
- Test:
  - Eine zweite Verbindung hält die Sperre.
  - Der Aufruf mit kleinem `wartezeitMs` endet mit `MONATSLOCK_BELEGT`, ohne dass `arbeit` lief (Zähler 0).
  - Danach die Sperre freigeben: Der Aufruf läuft durch (Zähler 1).
  - Für die Route: 409 und der Text.

### 3. R2-1 — Nach Sperrverlust nicht weiterschreiben (sollte)

Verliert die Sperrverbindung ihre Sitzung, wird heute nur gemeldet, und `arbeit()` schreibt ungeschützt weiter. Das
ist der ursprüngliche P1-8b-Schaden: zwei Läufe auf demselben Dateipfad.

- `mitMonatsLock` reicht `arbeit` ein Signal (`{ verloren: boolean }` oder `AbortSignal`) herein. Das
  `error`-Ereignis der Sperrverbindung setzt es.
- `generateAllMonthlyPDFsLocked` prüft das Signal vor jedem Modul und unmittelbar vor jeder `db.tx`. Ist es gesetzt,
  wird mit einem eigenen Fehler abgebrochen.
- Der Abbruch ist ein Fehlschlag des Laufs, kein Erfolg. Die fehlenden Typen holt Punkt 1 am nächsten Tag nach.
- `routes/archiv.js` `/neu-single` prüft das Signal vor seiner Transaktion.
- Test:
  - Die Sperrverbindung während `arbeit()` per `pg_terminate_backend` (über eine zweite Verbindung) trennen.
  - Danach darf kein weiteres Modul eine `pdf_archiv`-Zeile schreiben. Gemessen wird an der Ereignisfolge bzw.
    Zeilenzahl, nicht am Rückgabewert.
  - Gegenprobe: ohne Signalprüfung schreibt der Lauf weiter (ROT).

### 4. F2 — Neu erzeugte Archiv-PDF erst nach COMMIT gültig machen (sollte)

`routes/archiv.js` `/neu-single` (und ebenso die Modul-Schleife des Monatslaufs) schreibt die neue Datei unter dem
DETERMINISTISCHEN Namen. Damit ist die alte Datei schon überschrieben, bevor die Transaktion den Archiv-Eintrag
ersetzt. Scheitert die Transaktion oder stirbt der Prozess, steht der alte Eintrag (alter `pdf_hash`, alter
`verify_code`) auf der neuen Datei. Heute wird das nur gemeldet (`archiv:neu_single_restfenster`).

**Entscheidung:**
- Existiert unter dem deterministischen Namen bereits eine Datei (also bei einer Neuerzeugung), schreibt die Engine
  unter einem EINDEUTIGEN Namen. Das Muster wählst du so, dass es den Namensriegel von `createDocument()` besteht,
  z. B. `<Basis> v<8 hex>.pdf`.
- Die Spalte `dateiname` (Anzeige und Download-Name) bleibt der deterministische Name, `dateipfad` zeigt auf die
  neue Datei. Vorher messen, dass Download und Mail-ZIP den Anzeigenamen aus `dateiname` nehmen und nicht den
  Pfad-Basisnamen. Tun sie das nicht, umstellen.
- Nach dem COMMIT wird die ALTE Datei (alter `dateipfad`, falls verschieden) über denselben Löschweg entfernt, den
  die Retention für Archiv-PDFs benutzt, einschließlich Replik. Den Weg per `grep` finden und benennen.
  - Scheitert das Löschen, folgt `melde()`; die verwaiste Datei ist Müll, kein Datenverlust.
- Scheitert die Transaktion, wird die NEUE Datei nur gelöscht, wenn eine Messung über eine FRISCHE Verbindung
  belegt, dass keine `pdf_archiv`-Zeile auf sie zeigt. Ein Wurf aus `db.tx()` beweist keinen Rollback. Im Zweifel
  bleibt sie liegen, mit `melde()`.
- Ein erster Lauf ohne vorhandene Datei bleibt beim deterministischen Namen. Das hält die Änderung klein: Ernte,
  Replik und Retention sehen bei Erst-Erzeugung nichts Neues.
- Vorher messen und im Bericht nennen:
  - Welche Stellen setzen einen deterministischen Archivpfad voraus? Gesucht wird nach dem Dateinamensmuster
    `<Typ> MM-JJJJ.pdf` und nach `dateipfad`-Vergleichen, z. B. in der Reste-Ernte, im Replik-Abgleich, in
    `regenerierePdfMonat.js` und in Tests.
  - Wenn eine davon bricht und sich nicht im Auftrag lösen lässt: ABBRECHEN und melden.
- Der Kommentar „RESTFENSTER, nicht schliessbar“ wird an das neue Verhalten angepasst. Den Melde-Pfad für den Fall,
  der übrig bleibt, behältst du.
- Test (`test_feature_archiv_neu_single_atomar.js` Abschnitt B erweitern):
  - Die Transaktion scheitert.
  - Danach muss die Datei am Pfad des ALTEN Eintrags noch den ALTEN Hash tragen. Sollwert ist der vorher gemessene
    Hash als Literal bzw. aus dem Seed.
  - Heute ROT.
  - Dazu der Erfolgsfall: Der neue Eintrag zeigt auf die neue Datei, und die alte Datei ist weg.

### 5. C2-S8 und V09-7 — Unlesbare Betriebszeiten im Monats-PDF sichtbar; `core/` importiert keine Route (sollte / Anmerkung)

- `core/pdf-engine.js` `zeichneBetriebstageUebersicht` lädt heute `require('../routes/betriebszeiten')`. Das
  verstößt gegen die Hausregel „core/ importiert nicht aus routes/“.
  - Die reine Logik (`istKonfiguriert`, `istBetriebstag`, `konfigFuerTag`, `tagesStatus` und was sie brauchen) zieht
    nach `core/betriebszeiten-logik.js`.
  - `routes/betriebszeiten.js` re-exportiert dieselben Namen. Keine zweite Kopie, Tests und Aufrufer bleiben gültig.
  - Einen statischen Wächter „kein `require('../routes/` in `core/**/*.js`“ gibt es, falls noch keiner existiert,
    mit Gegenprobe.
- `_konfigUnlesbar` (heute nur intern gesetzt) wird nach außen gereicht. Ist die Konfiguration im Monat unlesbar,
  zeichnet die Übersicht einen Warnkasten: „Betriebszeiten konnten nicht gelesen werden — die Übersicht behandelt
  ersatzweise alle Tage als Betriebstage.“ Der Wortlaut ist frei, muss aber genau das sagen.
- Die bestehende Meldung (`melde`, gedrosselt) bleibt.
- Test:
  - Ungültiges JSON in `betriebszeiten_versionen` seeden. Der erzeugte Inhalt (Stub-doc, Muster
    `test_feature_messfehler_nicht_behaupten.js`) enthält den Hinweis.
  - Mit gültiger Konfiguration fehlt er.

### 6. V09-6 — Pausen-PDF übersteht fehlende Pausenzeiten (sollte)

`core/pdf-engine.js` (`generatePausenPDF`, `rowDrawer`) ruft `r.pause_von.split(':')` auf. `pause_von`/`pause_bis`
dürfen NULL sein (Schema; Korrektur-Registry `nullable`). Eine einzige solche Zeile lässt den ganzen Monatsnachweis
scheitern.

- Fehlt eine der beiden Zeiten, werden die Pausenzellen mit „nicht erfasst“ gezeichnet und die Dauer bleibt leer.
- Die Zeile wird NICHT weggelassen.
- Test: Eine Zeile mit NULL-Pause neben einer normalen. Die Promise löst, die Datei existiert, und der Inhalt
  enthält beide Zeilen und „nicht erfasst“. Heute ROT.

### 7. V01-8 — `mail_gesendet` nur für die Typen der Mail (Anmerkung)

- `sendeArchivMail` setzt `mail_gesendet` heute für ALLE Zeilen des Monats.
- Neu: nur für die Typen in `erstellte` (`AND typ = ANY($3)`).
- Test: Ein Modul scheitert und hat eine alte Zeile. Diese Zeile bleibt bei `mail_gesendet = 0`, die Zeilen der
  erstellten Typen stehen auf 1.

### 8. V01-7r — Datumsrechnung im Berliner Kalender (Anmerkung)

- `datumPlusTage()` in `generateMonthlyPDFs.js` und dieselbe Bauart in `routes/archiv.js` rechnen mit
  `setDate(getDate()+n)` in Prozesszeit.
- Neu: `plusTage(heuteBerlinStr(), n)` aus `core/datum.js`.
- Für einen nicht-numerischen Konfigwert gilt dieselbe Rückfallregel wie heute; miss sie und behalte sie bei.
- Test: Unter `TZ=UTC` mit festgehaltener Zeit `2026-10-24T22:30:00Z` liefert `+1` den Wert `2026-10-26`
  (handgerechnet: Berlin ist dann der 25.10.).

### 9. V09-9 und V08-6 — doppelte Abfragen (Anmerkung, Leistung)

- V09-9: `core/pdf-engine.js` lädt in der Seilkontrolle die Sitzungsdetails je Geräte-Chunk UND Sitzung. Die Details
  einmal je Sitzung vor der Chunk-Schleife laden. Test: Zähler um `db.q`, Detailabfragen = Sitzungszahl.
- V08-6: `core/monatskontrollen.js` `ladeMonatliche()` lädt Protokolle für alle monatlichen Betreibergeräte statt
  nur für die Pflicht-Teilmenge. Die zweite Abfrage auf `geraet_id = ANY($2)` der gefilterten Einträge beschränken.
  Der Kommentar, der „filtert schon in der Datenbank“ behauptet, wird berichtigt.
  - Test: Ein Nicht-Pflicht-Monatsgerät mit Prüfung taucht in der zweiten Abfrage nicht auf.
  - Das sichtbare Ergebnis bleibt gleich; bestehende Tests, die beide Wege gegeneinander halten, bleiben grün.

## Bericht

- Zuerst je Punkt die NEUE Messung der Fundstelle.
- Danach:
  - der Diff je Datei;
  - jede Gegenprobe wörtlich (ROT/GRÜN mit Zahlen);
  - die volle Suite: Exit, gelaufene gegen registrierte Dateien, `diff` EXIT 0;
  - Lint.
- Ausdrücklich nennen:
  - die Löschfunktion aus Punkt 4;
  - jede Stelle, die einen deterministischen Archivpfad voraussetzt;
  - was aus der Messung „fängt `fuerAlleStudios` je Studio ab?“ herauskam.
- Ein Fund, den du für unrealistisch hältst, gehört trotzdem in den Bericht.
