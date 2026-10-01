# Auftrag C6-D1 — Eingabeprüfung (Extrarunde C6)

Fassung 2, 01.10.2026. Planprüfung flash mit 12 Befunden (`scratchpad/c6plan/flash-c6d1.txt`). Selbst
nachgemessen und getragen sind 2 (`routes/belehrungen.js:1666-1667`), 4 (`routes/module.js:1518`) und 11
(`core/demo_daten.js:337`). Alle übrigen sind eingearbeitet. Eine zweite Spur entfällt: Der Auftrag besteht aus
vielen gleichartigen Eingaberiegeln, und sol brach heute zweimal am Ausgabelimit ab. Repo GymDocu, Stand master `9dfe522` (oder neuer).

**Herkunft:** `plaene/c6-zustand-01-10/z1.md` (B8, F7), `z2.md` (N1-H2), `z5a.md` (V02-5, V02-6, V02-7, V02-10), `z5b.md`
(P3-S1, V08-2, V09-4). Jede Fundstelle ist neu zu messen. Widerspricht der Code dem Auftrag, wird abgebrochen und
gemeldet.

**Modell.** Standard-Executer. Viele kleine, gleichartige Riegel ohne hergeleitete Schwelle.

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6d1`, Zweig `c6d1-eingaben` ab `origin/master`, Einzeltests nur
gegen `gymdocu_c6d1_test`. Suite und Gegenproben wie üblich (`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`,
Sperrdatei nie anfassen, kein äußeres `flock`).

**Grundsätze.**
- Ungültige Eingaben werden abgewiesen, und zwar über den Fehlerkanal, den die jeweilige Route SCHON benutzt (400-Seite
  oder 302 mit `?fehler=…`). Es wird nichts still verworfen und nichts ersatzweise gespeichert.
- Bestehende Wächter, die die alte Form pinnen, werden fachlich nachgezogen, nie gestrichen. Vorher per `grep` auf
  Meldungstexte und Feldnamen suchen.
- Sollwerte von außen: Kalenderfakten und Grenzwerte als Literal im Test, nicht aus dem geprüften Helfer.
- Gegenproben wörtlich, ROT und GRÜN.

## Punkte

1. **B8 — Kalendertag statt nur Format (sollte).**
   - Sieben Formulare prüfen nur `^\d{4}-\d{2}-\d{2}$`: `routes/module.js:3530,3604,3679,3755`,
     `routes/belehrungen.js:1665,1823`, `routes/sichtpruefung.js:3336`.
   - Ergänzt wird `istGueltigesKalenderdatum()` aus `core/geraete-alter.js:56`. Es wird schon in
     `routes/wartung.js:1289` und `routes/verbandbuch.js:642` benutzt.
   - `gueltig_bis` (`routes/belehrungen.js:1827-1832`):
     - LEER bleibt beim Vorgabewert. So steht es zugesichert in `test_feature_nachweise.js:324-326`.
     - Ein ausgefüllter, aber ungültiger Tag wird abgewiesen.
     - Den Kommentar „Leer oder unlesbar -> Vorgabewert“ entsprechend berichtigen.
   - Test je Formular:
     - `2026-02-30` → der BESTEHENDE Fehlerkanal der Route, keine Zeile:
       - `routes/module.js` und `routes/sichtpruefung.js` antworten mit 400;
       - `routes/belehrungen.js:1666-1667` und `:1824-1825` mit 302 und `?fehler=1`, samt Aufräumen der Upload-Datei.
     - `2024-02-29` (Schalttag) wird angenommen, als Positivkontrolle.
   - Muster: `test_feature_kalendertag_pruefung.js:58-66`.
2. **V02-10 — Betriebszeiten: Ferien und Ausnahmen als Kalendertag (Anmerkung).**
   - `routes/betriebszeiten.js:511-519` prüft nur das Format. Ergänzt wird `istGueltigesKalenderdatum`.
   - Ein ungültiger Wert wird mit Hinweis abgelehnt, nicht still herausgefiltert.
   - Ein ungültiger Ferien- oder Ausnahmeeintrag verwirft NICHT die ganze Änderung.
     - Der Rest wird gespeichert, wie heute.
     - Der verworfene Eintrag erscheint als Hinweis auf der Folgeseite („1 Eintrag mit ungültigem Datum wurde nicht
       übernommen: …“). Er verschwindet nicht still.
   - Ebenso `routes/betriebszeiten.js:500` (`catch (e) { s = {}; }`):
     - Ein unlesbarer Zustand speichert KEINE leere Konfiguration als neue Version.
     - Stattdessen kommt eine Fehlerseite, die bisherige Version bleibt, und es gibt einen Test dazu.
3. **V02-5 — Lageplan: nur endliche Zahlen (sollte).**
   - `routes/lageplan.js:934-937` und `:954-957`: `Math.max(0, NaN)` ergibt NaN und wird als REAL gespeichert.
   - Neu: Nur die AUS DER ANFRAGE kommenden Werte werden mit `Number.isFinite` geprüft → 400. Muster `:868`.
   - Bei `:954-957` werden Rückfallwerte aus der gespeicherten Zeile nicht mitgeprüft. Sonst wäre ein reiner
     Label-Aufruf auf einer Zeile mit NULL- oder NaN-Altwert nicht mehr möglich.
   - Prüfe den Bestand auf NaN-Werte und berichte das Ergebnis.
   - Test: `x_prozent: "abc"` → 400, keine Zeile.
4. **V02-6 — Reinigungsintervall 1..365 (sollte).**
   - `routes/getraenkeanlage.js:1006`: `parseInt(...) || 7` lässt `-5` durch. Der Bereich wird in der Route geprüft,
     Vorgabe des Formulars ist `min="1"` (`:739`).
   - Dazu eine Migration: `CHECK (intervall_tage BETWEEN 1 AND 365)` nach dem Muster von Migration 0066:
     - Vorher in `pg_constraint` prüfen, ob die Regel unter dem Sollnamen schon existiert. Bei einer frischen
       Datenbank legt `db.init()` sie über das Schema in `core/db.js` vorher an.
     - Nur wenn sie fehlt: `ADD … NOT VALID`, dann `VALIDATE` mit `check_violation`-Handler.
     - Ein ungeschütztes `ADD CONSTRAINT` scheiterte an `duplicate_object` und legte über `runMigrations()` den Start
       lahm (flash 1).
     - Bei vorhandenen Verstößen bleibt der Constraint `NOT VALID`, mit `NOTICE`.
     - Der Constraintname folgt der Namensregel aus 0066 (`_check`).
   - Die Regel steht auch im Schema in `core/db.js`, der Drift-Wächter verlangt das. Getestet wird beides: eine
     frische DB (init, dann Migration ohne Fehler) und eine Bestands-DB ohne Regel (Migration legt sie an).
   - Tests:
     - `intervall_tage: "-5"` → 400.
     - Ein direktes INSERT mit `-5` scheitert am CHECK.
     - Ein Altbestand mit `-5` lässt die Migration durchlaufen; der Constraint bleibt dann `NOT VALID`.
5. **V02-7 — `?ids=` mit int4-Grenze, kein stilles Verschlucken (Anmerkung).**
   - `routes/lageplan.js:525-538` und `routes/sichtpruefung.js:3599-3603` bekommen den Riegel
     `<= PG_INTEGER_MAX` wie `routes/geraete-hinweisfenster.js:311-315`.
   - Das leere `catch (e) {}` (`lageplan.js:538`) wird zu `console.error` plus sichtbarem Hinweis. Kein `melde()`:
     Das ist eine Anzeigeschicht, siehe die begründete Nachbarstelle `routes/geraete-hinweisfenster.js:323-336`.
   - Test:
     - Tablet-Ansicht aktivieren. Sonst steigt der Handler bei `:529` vorher aus, und der Test wäre grün aus dem
       falschen Grund.
     - `?ids=<gültige ID>,99999999999` → kein 22003. Die gültige ID wird POSITIV als verarbeitet belegt, zum Beispiel
       durch die Markierung, die erscheint.
6. **N1-H2 — Verbandbuch-IDs getrimmt prüfen (Anmerkung).**
   - `routes/verbandbuch.js:687-692` prüft `istGueltigeId(req.body.…)` am Rohwert. Neu wird am getrimmten Wert
     geprüft.
   - Den Kommentar `:677-678` nachziehen.
   - Der P1-Wächter verlangt, dass der Validator GENAU den Fund-Ausdruck als Argument trägt
     (`test_feature_pentest_p1_body_query.js:196-199`). Die Prüfung so schreiben, dass er sie weiter erkennt, etwa
     `istGueltigeId(String(req.body.ersthelfer_id).trim())`. Andernfalls den Wächter fachlich erweitern und das mit
     Gegenprobe belegen.
   - Test: `ersthelfer_id: ' <id> '` → 302 und verknüpft.
7. **P3-S1 — Passwortfelder als Text (Anmerkung).**
   - `passwort`, `alt`, `neu` und `neu2` gehen roh an `bcrypt.compare`: `routes/auth.js:1006→1056`,
     `:1800→1810`, `routes/archiv.js:781→815`.
   - Neu laufen sie über `textFeld()` (`core/eingabe.js`). Ein Array ergibt 400 statt 500 oder undefiniertem
     Verhalten.
   - In der Login-Route steht die Zeile vor dem `try`; dort so einbauen, dass ein `EingabeFehler` sauber 400 ergibt.
   - `routes/archiv.js:815` hat kein `try`. Messen, was dort heute bei einem Array passiert, und berichten.
   - Ein vierter Weg: `/admin/benutzer/neu` reicht `passwort` roh an `validierePasswort` und `bcrypt.hash` (laut
     Planprüfung). Er wird gleich behandelt; Fundstelle selbst messen.
   - Der Wächter, der die Zahl der `textFeld()`-Aufrufe je Datei festhält, wird von Hand nachgezogen. Fundort laut
     Planprüfung ein `test_feature_p3_*`; per `grep` finden.
   - Test je Route: `passwort[]=x` → 400 (unter 500).
8. **F7 — Löschen nicht möglich: Erkennung unabhängig vom Constraint-Namen (Anmerkung).**
   - `routes/admin/geraete.js:5482,6970` und `routes/admin/mitarbeiter.js:1275` erkennen den 409-Fall am Namen
     `…_fkey`. Ein umbenannter Fremdschlüssel fiele auf 500.
   - Neuer Helfer `istRestrictFehler(e, { tabelle, referenziert })`: prüft `e.code === '23503'` plus `e.table` und
     `e.detail` gegen die erwartete Tabelle. Er erkennt nicht JEDEN 23503 als 409.
   - Diese Stellen werden darauf umgestellt, sofern das ohne Verhaltensänderung geht; das misst du:
     - die drei Stellen von oben;
     - `core/demo_daten.js:337`, die vierte Stelle; sie entscheidet „Prüfnachweis“ gegen „sonstig“;
     - der Getränkeanlage-Weg (`REINIGUNG_RESTRICT_FKS`, `routes/getraenkeanlage.js:924,1058`).
   - Test: ein Fehlerobjekt mit `code 23503`, passender Tabelle und ANDEREM Constraint-Namen → 409.
   - Gegenprobe: eine fremde Tabelle → kein 409.
9. **V08-2 — `nachtragBanner` nur mit eigenen Schlüsseln (Anmerkung).**
   - `core/nachtrag-ergebnis.js:133-136` liest `woerterbuch[teil]` ohne `hasOwn`. `?nachtrag=constructor` rendert
     `function Object()…`.
   - Neu: `Object.prototype.hasOwnProperty.call` wie in `routes/sichtpruefung.js:1483`. Den Kommentar `:144-146`
     berichtigen.
   - Der CLIENTSEITIGE Zwilling `routes/module.js:1500-1533` (`GD_NACHTRAG_MIT_SAVED[nachtrag]`,
     `GD_NACHTRAG_ALLEIN[nachtrag]`, danach `innerHTML`) bekommt dieselbe Wache. Zu messen über das ausgelieferte
     Skript, etwa in Chromium oder `vm` mit Fake-`location`.
   - Test: `constructor`, `__proto__` und `toString` ergeben `''`. Positivkontrolle: ein bekannter Schlüssel liefert
     sein Banner.
10. **V09-4 — Bezirk-Archiv liefert nur Dateien unter den erlaubten Wurzeln (sollte).**
    - `routes/bezirk-archiv.js:171-175` macht `res.sendFile(resolvePdfPfad(...))` ohne Wurzelprüfung.
      `core/pdf-pfad.js:69-82` sagt selbst, das Ergebnis könne `PDF_ROOT` verlassen.
    - Neu: Das Ergebnis wird nach `realpath` gegen die erlaubten Wurzeln geprüft (`PDF_ROOT`, gegebenenfalls
      `/var/www/studios/<sub>/pdf`), mit `+ path.sep` gegen Präfixkollisionen. Sonst 404.
    - Laut Planprüfung haben weitere Aufrufer KEINE Wurzelprüfung: `routes/archiv.js:875` (Monats-ZIP), `:956`
      (Download) und `routes/admin/einstellungen.js:343` (Studio-ZIP). Eine Prüfung gibt es nur in
      `routes/pdf-altform.js:116-134` und in `core/pdf-loeschung.js:112-115` (`innerhalbErlaubterWurzeln`, nicht
      exportiert).
    - Die Prüfung gehört deshalb in EINEN gemeinsamen Helfer, den alle ausliefernden Aufrufer nutzen. Die doppelte
      Logik in `pdf-loeschung` wird darauf umgestellt; keine zweite Kopie.
    - Die vollständige Liste misst du selbst nach.
    - Test:
      - Eine Markerdatei AUSSERHALB von `PDF_ROOT` (unter der Wegwerf-Wurzel).
      - Eine `pdf_archiv`-Zeile mit Ausbruchs-`dateipfad`. Ein GET mit gültigem Token ergibt 404 (heute 200).
      - Positivkontrolle: Eine reguläre Datei wird ausgeliefert.

## Bericht

- Je Punkt die neue Messung, der Diff und die Gegenproben wörtlich.
- Die Aufruferliste aus 10.
- Die Messung aus 7 (`archiv.js:815`).
- Volle Suite mit `diff` EXIT 0, Lint.
