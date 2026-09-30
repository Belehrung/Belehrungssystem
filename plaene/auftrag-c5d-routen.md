# Auftrag C5-D — Routen: stille Fehler, Eingaben, Statuscodes (Extrarunde)

Fassung 1, 30.09.2026. Repo GymDocu, Stand master `13448c8`.

**Herkunft der Fundstellen.** Die Fundorte stehen in `plaene/c5-zustand-30-09.md` (Abschnitte `b3a`, `b3b`),
gefunden per flash-Zustandsprüfung. Jede Fundstelle ist vor dem Bau NEU zu messen, denn Zeilen verschieben sich und
C5-A/B/C laufen parallel.

**Modell.** Standard-Executer. Viele kleine Einzelstellen, keine hergeleitete Schwelle.

**Grundsatz für alle Punkte:**
- Ein Fehler, der heute still geschluckt wird, wird SICHTBAR: `melde()` und ein Hinweis für den Benutzer.
- Aus „weniger anzeigen“ wird nie eine Behebung (CLAUDE.md).
- Bestehende Zusicherungen, die die alte Form pinnen, werden fachlich umgestellt, nie gestrichen. Vorher per `grep`
  auf Meldungstexte und Feldnamen suchen.

## Punkte

**Stille Fehler sichtbar machen**

1. **C2-S2** `routes/sichtpruefung.js` (catch bei „neue Fotos“):
   - `melde(error, req, 'sichtpruefung:neue_fotos')` ergänzen.
   - Weiterleiten mit einem eng geprüften Hinweis (`foto_seite=fehler`, reine Gleichheitsprüfung, kein Echo des
     Werts), dazu ein Banner. `saved=1` bleibt.
2. **C2-S6** `routes/wartung.js` (Wartungsabschluss): Die PDF-Erzeugung bekommt ein eigenes try/catch nach dem Muster
   `routes/spuelplan.js:365-397`.
   - Sperre und Techniker-Mail laufen vor dem PDF.
   - Die Seite bleibt mit einem Nachholweg stehen.
   - Der Link auf das PDF muss `null` vertragen.
3. **SG-S2** `routes/archiv.js` (Entschlüsselung des TOTP-Geheimnisses):
   - Eigenes try/catch mit `melde(e, req, 'archiv:totp_secret')`, OHNE den Wert.
   - Danach generische Weiterleitung. Der 429-Riegel bleibt.
4. **V06-1** `routes/admin/qr-bestellung.js` (Nebenabfrage „bestätigt?“):
   - try/catch mit `melde`, `warBestaetigt = null` (nicht `false`) und neutralem Hinweis. Die Seite bleibt 200.
5. **V06-8** `routes/admin/qr.js`: Token-Info und Übersicht bekommen je ein eigenes try/catch mit Hinweisbox und
   `melde`, der Rest der Seite rendert weiter. Der Hinweis darf nicht „alles ok“ sagen.
6. **V05-4** `routes/admin/mitarbeiter.js` (Import, Zeilenfehler):
   - `melde` mit EINER Meldung je Importlauf (Anzahl und erste Beispiele), nicht je Zeile, wegen der Flut.
   - Der Fehlergrund je Zeile erscheint begrenzt auf der Seite.

**Eingaben**

7. **V03-7** `routes/verbandbuch.js`:
   - Längendeckel je Textfeld. Die Werte aus dem Formular (`maxlength`) übernehmen, sonst 2000; die gewählten Werte
     kommen in den Bericht.
   - `unfall_zeit` wird gegen `YYYY-MM-DD HH:MM` und einen echten Kalendertag geprüft. Helfer
     `istGueltigesKalenderdatum` (`core/geraete-alter.js`).
8. **V03-8** `routes/spuelplan.js`: Die Zahl muss eine ganze Zahl von 0 bis 3650 sein, sonst 400 mit Hinweis.
   Vorher messen, was heute bei `0` passiert, und das beibehalten.
9. **V03-9** `routes/verbandbuch.js:601-604`: Die Auswahl nach Name wird über die ID eindeutig gemacht. Das Formular
   schickt `id` mit, der Server prüft `id` und `name` gemeinsam mit `studio_id`.
10. **V06-5** `routes/admin/qr-bestellung.js`: `(req.body || {}).auftragsnummer`.
11. **V06-7** `istGueltigeBestellungsform`: Nicht-Objekte werden verworfen, Elemente auf Objekttyp geprüft.
    Vorher messen, ob Altzeilen dadurch auf eine Fehlerseite fallen würden; falls ja, bleiben sie lesbar und es gibt
    einen Hinweis.

**Status und Rückgaben**

12. **P2-S3** `core/defekt_mailer.js` (Wartungsweg): Rückgabe mit Grund
    (`{ok:false, grund:'parallel'|'fehler'|'keinEmpfaenger'}`). Die Route bildet ab: `parallel` → 409,
    `fehler` → 500, `keinEmpfaenger` → wie heute. Tests, die `=== false` prüfen, ziehen mit. ACHTUNG: C5-B baut in
    derselben Datei einen Wiederholer; nur die Rückgabeform ändern und den Merge-Konflikt beim Zusammenführen lösen.
13. **P2-S2** `/intern/qr-block` (`server.js`): ZUERST den Aufrufer im Hauptserver-Repo messen
    (`/home/user/gymdocu-hauptserver`, nur lesen) und seine Behandlung der Codes auflisten. Danach wird der Vertrag
    festgeschrieben. Ohne Aufrufer-Messung wird NICHT geändert, sondern im Bericht widersprochen.
14. **P2-S4:** eine Zusicherung, dass der `/intern/qr-block`-Handler nur `{200, 400, 409}` antwortet (plus die aus
    P2-S2 neu festgelegten). Als Verhaltenstest über die Routen, nicht als Textmuster, wenn der Harness das erlaubt.
15. **P2-S6:** zwei Verhaltenszusicherungen:
    - Seil-Freigabe-catch bei gestörtem `auditAppend` ⇒ 500 mit Quelle.
    - Belehrungs-Vorlage-Datei fehlt ⇒ 500 mit Quelle.

**Webhooks und Magicline**

16. **C3a-S7 und S6-1** `routes/webhooks.js`:
    - `inaktiv_seit` wird in beiden UPDATEs aus derselben Formel wie `aktiv` abgeleitet (CASE).
    - `extern_id` wird nur geschrieben, wenn der neue Wert nicht leer ist (`COALESCE(NULLIF($4,''), extern_id)`).
    - `test_feature_pin_generation_static.js:305/307` pinnt die UPDATE-Texte und wird fachlich mitgezogen.
    - Vorher messen, ob ein leeres `extern_id` heute ein gewolltes Signal ist (Hauptserver bzw. Magicline-Doku im
      Repo). Wenn ja: widersprechen.

**Sonstiges**

17. **C2-S4** `server.js`: Der hubInfo-Zweig wird als reine Funktion nach `core/hub-status.js` gezogen. `server.js`
    ruft sie nur auf. `test_feature_status_messfehler.js` zieht mit (die Muster zielen heute auf `serverSrc`).
    Dazu ein Verhaltenstest der Funktion.
18. **H2-R2-1** `routes/auth.js`: Der Marker-Zweig schreibt immer ein frisches Feld (`markerBestaetigtAm`) statt nur
    `delete`. Das `pending2fa`-Verhalten bleibt unberührt, das Feld gibt es nur im Tablet-Zweig.
19. **V03-6:** nur Buchführung; der Eintrag wird mit Beleg `core/eingabe.js:35-41` geschlossen, kein Code.

## Regeln

- **Arbeitsbaum und DB:** Arbeitsbaum `/workspace/gymdocu-c5d` (Zweig `c5d-routen`, von `origin/master`).
  Einzeltests gegen `gymdocu_c5d_test`, NIE gegen `gymdocu_test`. Lock nie löschen. KEINE Migration.
- **Suite:**
  - `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`.
  - Dateizahl-Ritual (`TESTS=(`-Block).
  - `npm run lint` wörtlich melden.
  - Neue Testdateien registrieren.
- **Gegenproben:** Jede neue Zusicherung mit Gegenprobe (ROT und GRÜN). `node --check` vor jeder Gegenprobe.
  `melde` und Telegram in Tests nie echt.
- **Abschluss:** Committen und pushen, bevor ein langer Lauf abgewartet wird. Kein PR. Bericht je Punkt mit Beleg
  oder Widerspruch.
