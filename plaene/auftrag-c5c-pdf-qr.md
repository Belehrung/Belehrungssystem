# Auftrag C5-C — PDF-Erzeugung und QR-Druckdaten (Extrarunde aus den Sammellisten)

Fassung 1, 30.09.2026. Repo GymDocu, Stand master `13448c8`.

**Herkunft der Befunde.** Die Zustandsprüfung lief mit `deepseek-flash` und Lesewerkzeugen
(`scratchpad/c5z-b1/antwort.txt`, verdichtet in `scratchpad/c5dicht/b1.md`). Der Haupt-Agent hat diese Stellen selbst
nachgelesen: `core/korrektur-pdf.js:54`, `core/pdf-engine.js:209-215` und `:496-522`, `generateMonthlyPDFs.js:455-470`
und `:222-232`. Alle übrigen Fundstellen sind FUNDORTE und vor dem Bau neu zu messen.

**Modellwahl.** Standard-Executer. Die Punkte sind einzeln klein; das Risiko eines falschen Grüns liegt in den
Abbruchtests, und dagegen steht die Gegenprobenpflicht.

## Punkte

### 1. C2-S9 — Korrekturblatt wird direkt unter dem öffentlichen Namen geschrieben

`core/korrektur-pdf.js:54` schreibt mit `createWriteStream(file.absolute, {flags:"wx"})`. Bricht die Erzeugung ab,
liegt ein halbes PDF öffentlich, und der nächste Versuch scheitert an `wx`.

- Umstellen auf das Muster aus `core/pdf-engine.js` (C2-1): erst in eine Temp-Datei im selben Verzeichnis schreiben,
  dann Hash, Registrierung bzw. INSERT, erst danach `renameSync` auf den öffentlichen Namen.
- Fehlerweg: die Temp-Datei in Quarantäne bzw. entfernen, genau wie dort (`raeumeTempAufBeiFehler`,
  `quarantaenePfad`), nicht eigens erfunden.
- Vorher messen: Wer verlässt sich auf `wx` (Doppelerzeugung)? Der Schutz muss erhalten bleiben, z. B. per
  `link`/Existenzprüfung vor dem `rename`, mit Begründung.
- Test: Abbruch mitten im Zeichnen ⇒ unter dem öffentlichen Namen liegt nichts, ein zweiter Versuch gelingt.
  Gegenprobe: direkt öffentlich schreiben ⇒ ROT.

### 2. C2-S10 — `schreibStrom()` räumt einen Abbruch der Zeichenroutine nicht auf

`core/pdf-engine.js:209-215`: Wirft die Zeichenroutine, bevor `doc.end()` läuft, bleiben ein offener Stream und die
Temp-Datei liegen.

- Einen Abbruchhelfer einführen: `stream.destroy()`, danach die Temp-Datei ENOENT-tolerant entfernen. Er wird im
  catch jeder Zeichenroutine aufgerufen, die `schreibStrom` benutzt.
- ALLE Aufrufer von `schreibStrom` auflisten. Der Helfer greift an jedem, oder die Nicht-Anwendung ist begründet.
- Test: Wurf mitten in einer Routine ⇒ keine `.tmp-*` im Verzeichnis, kein offener Deskriptor. Gegenprobe: Helfer
  entfernen ⇒ ROT.

### 3. C2-S11 — Registrierung vor `rename`, aber keine Kompensation

`core/pdf-engine.js:516-520`: Scheitert `renameSync` nach erfolgreichem `registriereVerify`, bleibt eine
`verify_dokumente`-Zeile stehen, die auf eine Datei zeigt, die es unter dem öffentlichen Namen nie gibt.

- Im catch die eben angelegte Registerzeile entfernen, eng über `verify_code` und `studio_id`.
- Zuerst messen, was `GET /v/:code` in diesem Fenster heute anzeigt.
- Test: `renameSync` scheitern lassen (Attrappe) ⇒ keine Registerzeile. Gegenprobe: Kompensation entfernen ⇒ ROT.

### 4. C3a-S4 — Monatslauf übersieht die Getränkeanlage beim „Aktivität vorhanden?“

Die Summe in `generateMonthlyPDFs.js:459-468` zählt sechs Tabellen, aber nicht `getraenkeanlage_reinigungen`. Ein
Monat, in dem es NUR Reinigungen gab, gilt als „nichts zu tun“; der Nachweis wird nie erzeugt.

- Siebte Zählung mit demselben JOIN wie `:226-229` (Anlage im selben Studio).
- Zusätzlich: `_z` schluckt DB-Fehler als 0. Das ist hier „im Zweifel nichts erzeugen“ und damit dieselbe Klasse. Ein
  Fehler in einer Zählung führt künftig NICHT zu „nichts zu tun“, sondern zu einer Meldung (`melde`) und zu „erzeugen“.
  Im Zweifel erzeugt der Lauf also.
- Test: Monat mit nur einer Reinigung ⇒ Aktivität erkannt. Zählfehler (Attrappe) ⇒ nicht „nichts_zu_tun“.
  Gegenprobe je Punkt.

### 5. V09-8 — Fehler in `addPageNumbers` wird geschluckt

In `core/pdf-engine.js:499-500` bekommt das PDF dann keine Seitennummern, keinen Fuss und keinen Prüf-QR, wird aber
ausgeliefert.

- Fail-closed wie V09-3: der Fehler wird zur Ablehnung, der Temp-Pfad geht in den bestehenden Fehlerweg.
- Test: `addPageNumbers` wirft (Attrappe) ⇒ Zusage abgelehnt, nichts öffentlich. Gegenprobe ⇒ ROT.

### 6. V06-2 — Charge wird ohne `studio_id` in der Abfrage geladen

`routes/admin/qr-druckdaten.js:246` lädt die Charge ohne `studio_id` in der WHERE-Klausel; die Prüfung folgt erst in
JavaScript.

- `AND studio_id = $2` ergänzen, die JavaScript-Prüfung bleibt (Tiefenstaffelung).
- Test mit fremdem Studio ⇒ wie heute abgewiesen. Statische Zusicherung auf die WHERE-Klausel, weil die
  Verhaltensprobe an der JavaScript-Prüfung hängenbleibt (CLAUDE.md „Gegenprobe, die an einem Frühausstieg
  hängenbleibt“).

### 7. V06-9 — „Keine Token“ und „Unbekanntes Format“ antworten mit 500

Betroffen ist `routes/admin/qr-druckdaten.js:361-366`.

- Statuscode nach der P2-Tabelle (`docs/p2-fehlerstatus-tabelle.md`) wählen und begründen. Der Zustand der Ressource
  erlaubt die Aktion nicht, also voraussichtlich 409.
- Die Tabelle nachziehen. Bestehende Zusicherungen auf 500 für diese Zweige suchen und fachlich umstellen.

### 8. V02-8 — `execFileSync("pdftoppm")` blockiert bis zu 15 s die Ereignisschleife

Betroffen ist `routes/lageplan.js:90-102`.

- Auf asynchrones `execFile` umstellen, mit einem Nebenläufigkeitsdeckel im Prozess (z. B. höchstens 2 gleichzeitig).
- Timeout und SIGKILL bleiben. Alle Aufrufer ziehen mit.
- Test mit Attrappe für `execFile`: Deckel greift, Timeout wird durchgereicht. Kein echter `pdftoppm`-Lauf nötig, wenn
  ein Test das heute auch nicht tut; bestehende Tests prüfen.

### 9. QJ7-K und QJ9-B — Tests und tote Zweige im QR-Journal

- **QJ7-K:** `metaZeileVollstaendig` in `core/qr-verbrauch.js:400-428` bekommt deterministische Fälle je Feld:
  - `roh_sha256` gekürzt bzw. mit Nicht-Hex-Zeichen;
  - `zeitpunkt` leer bzw. kein String;
  - `abschnitt` als `"0"` bzw. `1.5`.

  Jeder Fall muss ungültig sein. Fehlt eine Regel, wird der Leser nachgezogen; das kommt in den Bericht.
- **QJ9-B:** den Zeilenverweis 521→523 im Kommentar berichtigen. Den Test-Hook `tools/qr-journal.js:1009-1011` in
  try/catch fassen, ohne einen echten Schreibfehler zu verdecken; der Fehler wird weitergeworfen.
- Die unerreichbaren Zweige `core/qr-verbrauch.js:1287-1292` und `tools/qr-journal.js:1043-1045` bleiben als
  Verteidigung stehen und bekommen je einen Kommentar „unerreichbar, weil … — bleibt als Riegel“.

## Nicht in diesem Auftrag

Die folgenden Punkte gehen als Entscheidungsvorlage an den Betreiber: QJ-S1, QJ6-8, QJ6-MU31, QJ7-G, QJ8-B3, QJ9-A,
V08-4.

C3a-S1 steckt in C5-A (Punkt 1). V09-2 und V09-3 sind erledigt (C2).

## Regeln

- **Arbeitsbaum und Datenbank.** Arbeitsbaum `/workspace/gymdocu-c5c` (Zweig `c5c-pdf-qr`, von `origin/master`).
  Einzeltests nur gegen `gymdocu_c5c_test`, NIE gegen `gymdocu_test`. `/tmp/gymdocu-suite.lock` nie löschen. KEINE
  Migration.
- **Volle Suite und Dateizahl.**
  - Aufruf `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`.
  - Dateizahl-Ritual mit dem Sieb nur über den `TESTS=(`-Block.
  - Neue Testdateien registrieren.
  - `npm run lint` laufen lassen und das Ergebnis wörtlich melden.
- **Gegenproben.** Jede neue Zusicherung braucht eine Gegenprobe (ROT und GRÜN wörtlich). Tests fassen kein echtes
  Dateisystem ausserhalb von mktemp an. `melde` und Telegram sind nie echt.
- **Abschluss.** Commit auf dem Zweig, pushen, kein PR. Bericht je Punkt mit Beleg.
