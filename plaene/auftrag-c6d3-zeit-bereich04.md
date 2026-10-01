# Auftrag C6-D3 — Berliner Zeit überall, Bereich 04 (Wartung, Einstellungen, Magicline) (Extrarunde C6)

Fassung 2, 01.10.2026. Planprüfung flash mit 14 Befunden (`scratchpad/c6plan/flash-c6d3.txt`). Selbst nachgemessen
und getragen: 1 (`try` ab `routes/admin/einstellungen.js:297`, `mkdtempSync` erst bei `:321`, also INNERHALB) und 2
(`test_feature_status_messfehler.js:369-370` stellt `Date.prototype.getHours` auf 9). Die übrigen sind eingearbeitet. Repo GymDocu, Stand master (aktuell).

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
   - Laut Planprüfung rechnet im Repo niemand einen `unterschriften.signatur_hash` nach (flash 9). Das wird
     nachgemessen und berichtet. Die Änderung betrifft nur NEUE Zeilen; das Format des Datums bleibt gleich.
   - Test: `TZ=UTC`, Uhr `2025-12-31T23:30:00Z` → gespeichertes `datum` = `2026-01-01 00:30:00`.
2. **V03-4 — Zonenlose Tablet-Zeiten als Berliner Zeit lesen (sollte).**
   - `routes/verbandbuch.js:649-655` und `routes/sichtpruefung.js:2421-2431` parsen `YYYY-MM-DD HH:MM` in
     Prozesszeit.
   - Neu: ein Helfer `berlinZeitZuMs(text)` in `core/datum.js`.
     - Er nimmt `YYYY-MM-DD HH:MM` UND `YYYY-MM-DD HH:MM:SS` an; `client_erstellt_am` trägt Sekunden.
     - Er behandelt Sommer- und Winterzeit korrekt.
   - Die DRITTE Geschwisterstelle `routes/module.js:2651-2659` (Seilkontrolle, derselbe Parse-Weg und dieselben
     Fenster) wird gleich umgestellt (flash 5). Vollständigkeit per `grep` auf `replace(' ', 'T')` bzw.
     `replace(" ", "T")`.
   - Test: `TZ=UTC`, `Date.now` fest auf `2026-10-25T21:00:00Z`, `unfall_zeit = '2026-10-25 19:30'` →
     `nachgetragen = 1`.
   - Die Grenzfälle der Zeitumstellung (doppelte und fehlende Stunde) testest du einzeln und benennst, wie der Helfer
     sie auflöst.
3. **V03-5 — Eskalationsstunde in Berliner Zeit (sollte).**
   - `routes/tablet-sperre.js:259` und `routes/sichtpruefung.js:3831` benutzen `new Date().getHours()`. Neu: die
     Berliner Stunde.
   - `test_feature_status_messfehler.js:369-370` (S4c) stellt diese Stelle über `Date.prototype.getHours = () => 9`
     still. Nach dem Umbau wirkt das nicht mehr. Die Stellschraube wird deshalb fachlich auf den neuen Helfer
     umgezogen, etwa über eine injizierbare Stunde oder einen Stub des Helfers, damit S4c tageszeitunabhängig bleibt
     (flash 2).
   - Test: `TZ=UTC`, Winter, `09:30Z` (= 10:30 Berlin) → Banner rot; der alte Code wäre hier nicht rot.
     - Dazu ein Fall, der umgekehrt unterscheidet: `TZ=Etc/GMT-12` (UTC+12), Winter, `21:30Z` des Vortags (= 22:30
       Berlin, Prozesszeit 09:30) → nicht rot; der alte Code wäre hier rot.
     - `08:30Z` unter UTC ist nur eine Vorbedingung; der alte Code ist dort auch nicht rot (flash 13).
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
     - ALLE Bestätigungsprüfungen (Cardio, Kraft, Seil) laufen VOR dem ersten Schreiben. Fehlt eine, wird nichts
       geschrieben. Gemeldet wird die erste fehlende in der bisherigen Reihenfolge (Cardio, Kraft, Seil), damit sich
       die gemeldete Ursache nicht ändert (flash 12).
     - Der pauschale `catch` entfällt. Es gibt hier keine Eingabefehler zu fangen (flash 8). DB-Fehler gehen an den
       Fehlerbehandler (500 und `melde()`).
     - Die Schreibvorgänge laufen in EINER Transaktion, wenn `setConfig`/`logChange` das mit übergebener Verbindung
       erlauben. Sonst wird die Teilspeicherung im Fehlerfall benannt; das misst du.
   - Tests:
     - Kachel ändern und Seil ohne Bestätigung → Kachel unverändert, `?error=seil`.
     - `setConfig` wirft → nicht `error=seil`.
7. **V04-9 — Toter Helfer `ensureWartungHashSpalte()` (Anmerkung).**
   - Entfernen (`routes/wartung.js:52-58`, Aufruf `:1414`). Die Spalte steht im Schema (`core/db.js:1001`).
   - Ebenso die beiden wortgleichen Zwillinge: `routes/belehrungen.js:827-832` (Aufruf `:953`) und
     `routes/module.js:3514-3519` (Aufruf `:3550`). Vorher messen, dass ihre Spalten im Schema stehen (flash 10).
8. **V04-10 — Audit-Seite rechnet die Kette nur auf Abruf nach (Anmerkung, Leistung).**
   - `routes/admin/audit.js:209` ruft bei JEDEM Seitenaufruf `auditVerify` über die ganze Kette.
   - Es gibt schon einen Knopf mit Parameter: `?geprueft=1` (`routes/admin/audit.js:281`), dazu das Banner „Prüfung
     soeben ausgeführt …“ (`:242-244`). Dieser bestehende Weg wird benutzt. Es kommt KEIN zweiter Parameter hinzu
     (flash 3).
   - Neu: Nur mit `?geprueft=1` wird die Kette gerechnet und das Ergebnis mit Zeitstempel gezeigt.
   - Kein Cache: Ein veraltetes „intakt“ wäre schlimmer als langsam.
   - Ohne Abruf zeigt die Seite keinen Prüfstatus. Sie sagt „nicht geprüft“, NICHT „intakt“.
   - Bestandszusicherungen, die „Kette intakt“ ohne Parameter erwarten, ziehst du fachlich nach. Laut Planprüfung
     sind es fünf; finde sie per `grep`.
   - Test über die injizierte Abhängigkeit (`routes/admin/audit.js:6`). Der Aufrufzähler ist der Beleg, der
     Screenshot nur Zusatz (flash 14):
     - Ohne Parameter wird `auditVerify` nicht aufgerufen, und der Text sagt „nicht geprüft“.
     - Mit Parameter wird es aufgerufen, und das Ergebnis erscheint.
     - Gegenprobe: eine manipulierte Kette mit `?pruefen=1` → „verletzt“.
9. **V04-11 — Studio-ZIP räumt im Fehlerweg auf (sollte).**
   - `routes/admin/einstellungen.js`: `const tmpDir` steht bei `:321` INNERHALB des `try` (ab `:297`), der `catch` bei
     `:432-435` sieht es nicht.
   - Neu: `let tmpDir = null` vor dem `try`, die Zuweisung bleibt an ihrer Stelle. Im `catch` folgt
     `if (tmpDir) entferneVerzeichnisSync(tmpDir, …)`; der Helfer existiert (`:319`). Der Erfolgs-Callback räumt
     wie heute auf, ohne doppeltes Löschen.
   - Test: `execFile`-Stub wirft → danach kein neues `studio-zip-*` unter `os.tmpdir()`. Der Test muss `os.tmpdir()`
     auf eine Wegwerf-Wurzel lenken; das misst du.
10. **V04-12 — „PDF-Download bestätigt“ erst nach erfolgreichem Download (Anmerkung).**
    - `routes/admin/einstellungen.js:400,404-409,417`: `setConfig` und das Audit wandern in den Rückruf von
      `res.download`, und zwar nur bei Erfolg (`err == null`). Den Kommentar `:404-409` passt du an.
    - Der Rückruf bekommt ein eigenes `try/catch` mit `melde()`. Ein Fehler dort kann keine 500 mehr erzeugen, weil
      die Antwort schon draußen ist, und darf keine unbehandelte Rejection werden (flash 4).
    - Bestehende Zusicherungen, die „GENAU EIN neuer Eintrag“ unmittelbar nach dem Body zählen, warten auf den
      Rückruf (ereignisgebunden, nicht per Zeitschwelle).
    - Test: `res.download`-Attrappe mit Fehler → kein `setConfig`. Ohne Fehler → `setConfig` nach dem Rückruf
      (Aufrufprotokoll).
11. **V04-13 — Kommentar zu den Wiederholungen (Anmerkung, Text).**
    - `routes/webhooks.js:87`: Neu heißt es „max. 6 Anfragen (5 Wiederholungen), Wartezeiten 1–16 s“. Der Code
      bleibt.
12. **V04-14 — `confirmActivation` mit Zeitlimit, Antwort verbraucht (Anmerkung).**
    - `routes/webhooks.js:545-565`: `timeout: 10000` UND `reqML.on('timeout', () => reqML.destroy(new Error(…)))`;
      `timeout` allein löst nur ein Ereignis aus (flash 7). Dazu `resML.resume()`. Fehler gehen über `melde()` statt
      nur `console.error`.
    - Der Aktivierungsstatus der eingehenden Anfrage bleibt unberührt, es bleibt bei Fire-and-forget.
    - Test: Die Netzattrappe kann Optionen und `resume` nicht beobachten (flash 7). Deshalb ein eigener Stub für
      `https.request`, der Optionen aufzeichnet, ein Antwortobjekt mit `resume`-Zähler liefert und das
      `timeout`-Ereignis auslösen kann. Erwartet: `destroy` wird gerufen, `melde()` ebenso.
13. **V04-16 — Magicline-Trennung meldet einen Teilfehlschlag (sollte).**
    - `routes/webhooks.js:597-605` und `routes/api-admin.js:286-289` schlucken jeden DELETE-Fehler.
    - Neu: `resetMagiclineConfig` sammelt die Fehlschläge und gibt `{ ok:false, fehlgeschlagen:[…] }` zurück. Die
      Admin-Seite zeigt den Fehlschlag mit `melde()` statt einer Erfolgsumleitung. Dafür wird der bestehende Weg
      `?ml_err=1` (`routes/api-admin.js:304`) benutzt.
    - Die Nachbarstelle `routes/api-admin.js:294-296` (`oeffneTofuFenster` mit leerem `catch`) wird gleich behandelt
      (flash 11).
    - Test: Der Stub wirft für einen Schlüssel → Fehlschlag sichtbar, KEINE Erfolgsumleitung.
14. **V04-17 — Berichtsspalten selbstheilend im Schema (Anmerkung).**
    - `core/db.js:997-1030`: Die fünf Spalten aus Migration 0020/0023 bekommen `ALTER TABLE … ADD COLUMN IF NOT
      EXISTS` im SCHEMA-Block. Muster `:1029-1030`.
    - Vorher den Drift-Wächter und `core/schema-stand.js` lesen, damit kein Konflikt entsteht.
    - Test auf einer WEGWERF-DB (Muster `test_feature_schema_drift_inhalt.js:53`). Die Suite-DB hat die Spalten über
      die Migrationen ohnehin; dort wäre der Test grün aus dem falschen Grund (flash 6).
      - Nur `db.init()` → `INSERT` mit allen 13 Spalten gelingt.
      - Negativkontrolle: ohne die neuen Schema-Zeilen scheitert er mit 42703.

## Ohne Bau

- **V04-8:** behoben.
- **V04-15:** Betreiber-Frage, ob Magicline Mitarbeiter ohne `id` und ohne E-Mail sendet; siehe `c6-plan.md`.

## Bericht

- Je Punkt: die neue Messung, der Diff, die Gegenproben wörtlich.
- Die Hash-Messung aus Punkt 1.
- Die Auflösung der Umstellungsstunden aus Punkt 2.
- Die volle Suite mit `diff` EXIT 0.
- Lint.
- Ein Screenshot der Audit-Seite (Punkt 8), mit und ohne Prüfung, als Zusatz.
