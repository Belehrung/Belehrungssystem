# Auftrag C6-D3 — Berliner Zeit überall, Bereich 04 (Wartung, Einstellungen, Magicline) (Extrarunde C6)

Fassung 1, 01.10.2026. Repo GymDocu, Stand master (aktuell).

**Herkunft und Einzelheiten:** `/home/user/Belehrungssystem/plaene/c6-zustand-01-10/`. Aus `z5a.md` kommen V01-6, V03-4
und V03-5, aus `z6.md` V04-4 bis V04-17. Jeder Abschnitt nennt Beleg, Zustand, Behebung, Risiko und Test. Alles
sind FUNDORTE: zuerst neu messen. Widerspricht der Code, abbrechen und melden.

**Modell.** Standard-Executer. Zeitzonen-Tests setzen `process.env.TZ` als ALLERERSTE Zeile und prüfen gegen einen
handgerechneten Berliner Sollwert. Unter UTC liefert der alte Fehler oft zufällig das richtige Ergebnis, deshalb
laufen die Tests mindestens unter `UTC` UND `Etc/GMT+5`.

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6d3`, Zweig `c6d3-zeit` ab `origin/master`, Einzeltests nur gegen
`gymdocu_c6d3_test`. Suite und Gegenproben wie üblich.

## A. Berliner Zeit, unabhängig von der Zone des Servers

1. **V01-6 — Unterschriftsdatum aus Berliner Zeit (sollte).**
   - `routes/belehrungen.js:950-951,1002,1015-1018` bilden Datum und Uhrzeit aus der Prozesszeit. Neu: Berliner Zeit
     über einen Helfer in `core/datum.js`. Gibt es schon einen passenden, wird er benutzt; sonst kommt er dorthin.
   - VORHER messen, ob alte Signatur-Hashes weiter prüfbar bleiben. Die Prüfung muss vom gespeicherten `datum` und
     nicht von „jetzt“ ausgehen. Ändert sich nur die Zeitbasis, nicht das Format, bleibt jeder alte Hash gültig.
     Das Ergebnis kommt in den Bericht.
   - Test: `TZ=UTC`, Uhr `2025-12-31T23:30:00Z` → gespeichertes `datum` = `2026-01-01 00:30:00`.
2. **V03-4 — Zonenlose Tablet-Zeiten als Berliner Zeit lesen (sollte).**
   - `routes/verbandbuch.js:649-655` und `routes/sichtpruefung.js:2421-2431` parsen `YYYY-MM-DD HH:MM` in
     Prozesszeit.
   - Neu: ein Helfer `berlinZeitZuMs('YYYY-MM-DD HH:MM')` in `core/datum.js`, der Sommer- und Winterzeit korrekt
     behandelt.
   - Test: `TZ=UTC`, `Date.now` fest auf `2026-10-25T21:00:00Z`, `unfall_zeit = '2026-10-25 19:30'` →
     `nachgetragen = 1`.
   - Die Grenzfälle der Zeitumstellung (doppelte und fehlende Stunde) testest du einzeln und benennst, wie der Helfer
     sie auflöst.
3. **V03-5 — Eskalationsstunde in Berliner Zeit (sollte).**
   - `routes/tablet-sperre.js:259` und `routes/sichtpruefung.js:3831` benutzen `new Date().getHours()`. Neu: die
     Berliner Stunde.
   - Test: `TZ=UTC`, Winter, `09:30Z` (= 10:30 Berlin) → Banner rot. `08:30Z` → nicht rot.
4. **V04-4 — Fälligkeit über `plusMonate` (Anmerkung).**
   - `routes/wartung.js:341-358`: Der Rumpf wird `plusMonate(heute, monate)` (`core/datum.js`). Der vorgelagerte
     Rückfall `monate = 12` bleibt.
   - Test unter `Etc/GMT+5`: `2026-03-01`, Intervall 1 → `2026-04-01`.
5. **V04-5/6 — Tagesgrenzen über Berliner Kalendertage (Anmerkung).**
   - Diese Stellen rechnen mit absoluten 24-h-Schritten bzw. lokalem `setDate`. Neu: `plusTage(formatBerlinDate(jetzt), ±n)`.
     - `routes/admin/dashboard.js:202` (`vor7`);
     - `routes/wartung.js:443-445` (`bald`);
     - `routes/belehrungen.js:766,1925,2852`.
   - Für den Test bekommen die Stellen ihr „jetzt“ übergeben, oder sie benutzen einen Helfer, dem es übergeben wird.
   - Test am Umstellungstag. Der Sollwert wird von Hand gerechnet und als Literal hingeschrieben.

## B. Bereich 04

6. **V04-7 — Modul-Einstellungen: Seil-Bestätigung VOR jedem Schreiben; kein Pauschal-catch (sollte).**
   - `routes/admin/einstellungen.js:602-651` schreibt Cardio, Kraft und Kacheln, bevor die Seil-Bestätigung geprüft
     wird. Der catch macht aus JEDEM Fehler „Bestätigung fehlt“.
   - Neu:
     - Die Prüfung kommt zuerst. Fehlt die Bestätigung, wird nichts geschrieben.
     - Der catch fängt nur Eingabefehler. Alles andere geht an den Fehlerbehandler (500 und `melde()`).
   - Bestehende Tests, die `error=seil` bei Ausnahmen erwarten, ziehst du fachlich nach.
   - Tests:
     - Kachel ändern und Seil ohne Bestätigung → Kachel unverändert, `?error=seil`.
     - `setConfig` wirft → nicht `error=seil`.
7. **V04-9 — Toter Helfer `ensureWartungHashSpalte()` (Anmerkung).**
   - Entfernen (`routes/wartung.js:52-58`, Aufruf `:1414`). Die Spalte steht im Schema (`core/db.js:1001`).
8. **V04-10 — Audit-Seite rechnet die Kette nur auf Abruf nach (Anmerkung, Leistung).**
   - `routes/admin/audit.js:209` ruft bei JEDEM Seitenaufruf `auditVerify` über die ganze Kette.
   - Neu: Die Seite zeigt einen Knopf „Integrität jetzt prüfen“. Erst `?pruefen=1` rechnet die Kette und zeigt das
     Ergebnis mit Zeitstempel.
   - Kein Cache: Ein veraltetes „intakt“ wäre schlimmer als langsam.
   - Ohne Abruf zeigt die Seite keinen Prüfstatus. Sie sagt „nicht geprüft“, NICHT „intakt“.
   - Test:
     - Ohne Parameter wird `auditVerify` nicht aufgerufen, und der Text sagt „nicht geprüft“.
     - Mit Parameter wird es aufgerufen, und das Ergebnis erscheint.
     - Gegenprobe: eine manipulierte Kette mit `?pruefen=1` → „verletzt“.
9. **V04-11 — Studio-ZIP räumt im Fehlerweg auf (sollte).**
   - `routes/admin/einstellungen.js:321,432-435`: `tmpDir` wird außerhalb des `try` angelegt. Im `catch` folgt
     `entferneVerzeichnisSync(tmpDir, …)`; der Helfer existiert (`:319`).
   - Test: `execFile`-Stub wirft → danach kein neues `studio-zip-*` unter `os.tmpdir()`. Der Test muss `os.tmpdir()`
     auf eine Wegwerf-Wurzel lenken; das misst du.
10. **V04-12 — „PDF-Download bestätigt“ erst nach erfolgreichem Download (Anmerkung).**
    - `routes/admin/einstellungen.js:400,404-409,417`: `setConfig` und das Audit wandern in den Rückruf von
      `res.download`, und zwar nur bei Erfolg (`err == null`). Den Kommentar `:404-409` passt du an.
    - Test: `res.download`-Attrappe mit Fehler → kein `setConfig`. Ohne Fehler → `setConfig` nach dem Rückruf
      (Aufrufprotokoll).
11. **V04-13 — Kommentar zu den Wiederholungen (Anmerkung, Text).**
    - `routes/webhooks.js:87`: Neu heißt es „max. 6 Anfragen (5 Wiederholungen), Wartezeiten 1–16 s“. Der Code
      bleibt.
12. **V04-14 — `confirmActivation` mit Zeitlimit, Antwort verbraucht (Anmerkung).**
    - `routes/webhooks.js:545-565`: `timeout: 10000`, `resML.resume()`. Fehler gehen über `melde()` statt nur
      `console.error`.
    - Der Aktivierungsstatus der eingehenden Anfrage bleibt unberührt, es bleibt bei Fire-and-forget.
    - Test über die Netzattrappe (`test/helfer/netz-attrappe.js`): Optionen gesetzt, `resume` aufgerufen.
13. **V04-16 — Magicline-Trennung meldet einen Teilfehlschlag (sollte).**
    - `routes/webhooks.js:597-605` und `routes/api-admin.js:286-289` schlucken jeden DELETE-Fehler.
    - Neu: `resetMagiclineConfig` sammelt die Fehlschläge und gibt `{ ok:false, fehlgeschlagen:[…] }` zurück. Die
      Admin-Seite zeigt den Fehlschlag mit `melde()` statt einer Erfolgsumleitung.
    - Test: Der Stub wirft für einen Schlüssel → Fehlschlag sichtbar, KEINE Erfolgsumleitung.
14. **V04-17 — Berichtsspalten selbstheilend im Schema (Anmerkung).**
    - `core/db.js:997-1030`: Die fünf Spalten aus Migration 0020/0023 bekommen `ALTER TABLE … ADD COLUMN IF NOT
      EXISTS` im SCHEMA-Block. Muster `:1029-1030`.
    - Vorher den Drift-Wächter und `core/schema-stand.js` lesen, damit kein Konflikt entsteht.
    - Test: frische DB, nur `db.init()` → `INSERT` mit allen 13 Spalten gelingt.

## Ohne Bau

- **V04-8:** behoben.
- **V04-15:** Betreiber-Frage, ob Magicline Mitarbeiter ohne `id` und ohne E-Mail sendet; siehe `c6-plan.md`.

## Bericht

- Je Punkt: die neue Messung, der Diff, die Gegenproben wörtlich.
- Die Hash-Messung aus Punkt 1.
- Die Auflösung der Umstellungsstunden aus Punkt 2.
- Die volle Suite mit `diff` EXIT 0.
- Lint.
- Ein Screenshot der Audit-Seite (Punkt 8), mit und ohne Prüfung.
