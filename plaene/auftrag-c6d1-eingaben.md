# Auftrag C6-D1 — Eingabeprüfung (Extrarunde C6)

Fassung 1, 01.10.2026. Repo GymDocu, Stand master `9dfe522` (oder neuer).

**Herkunft:** `plaene/c6-zustand-01-10/z1.md` (B8, F7), `z2.md` (N1-H2), `z5a.md` (V02-5, V02-6, V02-7, V02-10), `z5b.md`
(P3-S1, V08-2, V09-4). Jede Fundstelle ist neu zu messen. Widerspricht der Code dem Auftrag, wird abgebrochen und
gemeldet.

**Modell.** Standard-Executer. Viele kleine, gleichartige Riegel ohne hergeleitete Schwelle.

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6d1`, Zweig `c6d1-eingaben` ab `origin/master`, Einzeltests nur
gegen `gymdocu_c6d1_test`. Suite und Gegenproben wie üblich (`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`,
Sperrdatei nie anfassen, kein äußeres `flock`).

**Grundsätze.**
- Ungültige Eingaben werden mit 400 und einem verständlichen Hinweis abgewiesen. Es wird nichts still verworfen und
  nichts ersatzweise gespeichert.
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
   - `gueltig_bis` (`routes/belehrungen.js:1831`): Ein ungültiger Tag ergibt 400, keinen Vorgabewert.
   - Test je Formular:
     - `2026-02-30` → 400, keine Zeile.
     - `2024-02-29` (Schalttag) wird angenommen, als Positivkontrolle.
   - Muster: `test_feature_kalendertag_pruefung.js:58-66`.
2. **V02-10 — Betriebszeiten: Ferien und Ausnahmen als Kalendertag (Anmerkung).**
   - `routes/betriebszeiten.js:511-519` prüft nur das Format. Ergänzt wird `istGueltigesKalenderdatum`.
   - Ein ungültiger Wert wird mit Hinweis abgelehnt, nicht still herausgefiltert.
   - Wächter gegen einen stillen Filter (`.filter(...)`) mitbedenken: Die heutige Filterlogik darf ungültige Daten
     nicht stillschweigend wegwerfen.
3. **V02-5 — Lageplan: nur endliche Zahlen (sollte).**
   - `routes/lageplan.js:934-937` und `:954-957`: `Math.max(0, NaN)` ergibt NaN und wird als REAL gespeichert.
   - Neu: `if (![x,y,b,h].every(Number.isFinite))` → 400. Muster `:868`.
   - Test: `x_prozent: "abc"` → 400, keine Zeile.
4. **V02-6 — Reinigungsintervall 1..365 (sollte).**
   - `routes/getraenkeanlage.js:1006`: `parseInt(...) || 7` lässt `-5` durch. Der Bereich wird in der Route geprüft,
     Vorgabe des Formulars ist `min="1"` (`:739`).
   - Dazu eine Migration: `CHECK (intervall_tage BETWEEN 1 AND 365)` nach dem Muster von Migration 0066:
     - `ADD … NOT VALID`, dann `VALIDATE` mit `check_violation`-Handler.
     - Bei vorhandenen Verstößen bleibt der Constraint `NOT VALID`, mit `NOTICE`.
     - Der Constraintname folgt der Namensregel aus 0066 (`_check`).
   - Prüfe, ob der Drift-Wächter (Defaults/CHECK) die neue Regel im `core/db.js`-Schema verlangt, und trage sie dort
     gleich ein.
   - Tests:
     - `intervall_tage: "-5"` → 400.
     - Ein direktes INSERT mit `-5` scheitert am CHECK.
     - Ein Altbestand mit `-5` lässt die Migration durchlaufen; der Constraint bleibt dann `NOT VALID`.
5. **V02-7 — `?ids=` mit int4-Grenze, kein stilles Verschlucken (Anmerkung).**
   - `routes/lageplan.js:525-538` und `routes/sichtpruefung.js:3599-3603` bekommen den Riegel
     `<= PG_INTEGER_MAX` wie `routes/geraete-hinweisfenster.js:311-315`.
   - Das leere `catch (e) {}` (`lageplan.js:538`) wird zu `melde()` plus Hinweis.
   - Test: `?ids=99999999999` → kein 22003, die gültigen IDs werden verarbeitet.
6. **N1-H2 — Verbandbuch-IDs getrimmt prüfen (Anmerkung).**
   - `routes/verbandbuch.js:687-692` prüft `istGueltigeId(req.body.…)` am Rohwert. Neu wird am getrimmten Wert
     geprüft.
   - Den Kommentar `:677-678` nachziehen.
   - Test: `ersthelfer_id: ' <id> '` → 302 und verknüpft.
7. **P3-S1 — Passwortfelder als Text (Anmerkung).**
   - `passwort`, `alt`, `neu` und `neu2` gehen roh an `bcrypt.compare`: `routes/auth.js:1006→1056`,
     `:1800→1810`, `routes/archiv.js:781→815`.
   - Neu laufen sie über `textFeld()` (`core/eingabe.js`). Ein Array ergibt 400 statt 500 oder undefiniertem
     Verhalten.
   - In der Login-Route steht die Zeile vor dem `try`; dort so einbauen, dass ein `EingabeFehler` sauber 400 ergibt.
   - `routes/archiv.js:815` hat kein `try`. Messen, was dort heute bei einem Array passiert, und berichten.
   - Test je Route: `passwort[]=x` → 400 (unter 500).
8. **F7 — Löschen nicht möglich: Erkennung unabhängig vom Constraint-Namen (Anmerkung).**
   - `routes/admin/geraete.js:5482,6970` und `routes/admin/mitarbeiter.js:1275` erkennen den 409-Fall am Namen
     `…_fkey`. Ein umbenannter Fremdschlüssel fiele auf 500.
   - Neuer Helfer `istRestrictFehler(e, { tabelle, referenziert })`: prüft `e.code === '23503'` plus `e.table` und
     `e.detail` gegen die erwartete Tabelle. Er erkennt nicht JEDEN 23503 als 409.
   - Die drei Stellen und den Getränkeanlage-Weg (`REINIGUNG_RESTRICT_FKS`, `routes/getraenkeanlage.js:924,1058`)
     darauf umstellen, sofern das ohne Verhaltensänderung geht. Das misst du.
   - Test: ein Fehlerobjekt mit `code 23503`, passender Tabelle und ANDEREM Constraint-Namen → 409.
   - Gegenprobe: eine fremde Tabelle → kein 409.
9. **V08-2 — `nachtragBanner` nur mit eigenen Schlüsseln (Anmerkung).**
   - `core/nachtrag-ergebnis.js:133-136` liest `woerterbuch[teil]` ohne `hasOwn`. `?nachtrag=constructor` rendert
     `function Object()…`.
   - Neu: `Object.prototype.hasOwnProperty.call` wie in `routes/sichtpruefung.js:1483`. Den Kommentar `:144-146`
     berichtigen.
   - Test: `constructor`, `__proto__` und `toString` ergeben `''`. Positivkontrolle: ein bekannter Schlüssel liefert
     sein Banner.
10. **V09-4 — Bezirk-Archiv liefert nur Dateien unter den erlaubten Wurzeln (sollte).**
    - `routes/bezirk-archiv.js:171-175` macht `res.sendFile(resolvePdfPfad(...))` ohne Wurzelprüfung.
      `core/pdf-pfad.js:69-82` sagt selbst, das Ergebnis könne `PDF_ROOT` verlassen.
    - Neu: Das Ergebnis wird nach `realpath` gegen die erlaubten Wurzeln geprüft (`PDF_ROOT`, gegebenenfalls
      `/var/www/studios/<sub>/pdf`), mit `+ path.sep` gegen Präfixkollisionen. Sonst 404.
    - Prüfe, ob andere Aufrufer von `resolvePdfPfad` (`core/pdf-loeschung.js:192` u. a.) denselben Riegel brauchen;
      die Liste kommt in den Bericht. Sind es mehrere, gehört die Prüfung in einen gemeinsamen Helfer, nicht an jede
      Stelle einzeln.
    - Test:
      - Eine Markerdatei AUSSERHALB von `PDF_ROOT` (unter der Wegwerf-Wurzel).
      - Eine `pdf_archiv`-Zeile mit Ausbruchs-`dateipfad`. Ein GET mit gültigem Token ergibt 404 (heute 200).
      - Positivkontrolle: Eine reguläre Datei wird ausgeliefert.

## Bericht

- Je Punkt die neue Messung, der Diff und die Gegenproben wörtlich.
- Die Aufruferliste aus 10.
- Die Messung aus 7 (`archiv.js:815`).
- Volle Suite mit `diff` EXIT 0, Lint.
