# Auftrag C5-G — Kernmodule, Werkzeuge und Betriebsskripte (Extrarunde)

Fassung 1, 30.09.2026. Repo GymDocu. Der Bau startet ERST nach dem Merge von C5-B, weil `core/defekt_mailer.js` und
`core/storage-replica.js` dort mitgeändert werden. Stand dann `origin/master`.

**Fundorte:** `plaene/c5-zustand-30-09.md` (Abschnitte `v07-11-12`, `b4a2`, `b6`, `b3b`). Jede Fundstelle wird vor
dem Bau neu gemessen.

**Modell:** Standard-Executer.

**Grundsatz:** Stille Fehler werden sichtbar (`melde`). Nichts wird still ersetzt oder ausgeblendet.

## Punkte

**Demo-Daten und Aufräumwege**

1. **V07-2** `core/demo_daten.js`: „heute/gestern“ über `formatBerlinDate`/`plusTage`, „jetzt“ über den Berliner
   Helfer. Die Hausregel zu Zeitzonen gilt; der Test setzt `TZ` als erste Zeile.
2. **V07-3** `core/demo_daten.js`: Die Demo-Sitzung bekommt eine gültige Minimal-Unterschrift, die die
   Signaturprüfung besteht. Geht das nicht, fällt die Zusage im Dashboard-Text weg. Die Entscheidung kommt in den
   Bericht.
3. **V07-4** `core/demo_daten.js:70-76`: Das leere `catch` wird zu `melde` plus Zähler. Der Lauf meldet
   `ok:false`, wenn eine Registrierung scheitert.
4. **V07-5** `core/foto-reaper.js` / `reapeFotos.js`: die drei Stufen einzeln kapseln (fehlende Tabelle per
   `to_regclass`). Ein Teilergebnis mit Fehlerzähler wird gemeldet; ein Stufenfehler bricht die anderen Stufen nicht
   ab.
5. **V07-6** `core/export-studio.js:228-232`: `spaltenWennTabelle` schluckt Fehler als `[]`. Künftig wird der Fehler
   durchgereicht; der Export setzt in LIESMICH und im Foto-Hinweis „Erhebung fehlgeschlagen — prüfen“, statt
   stillschweigend nichts zu listen.

**Feiertage und Zuständigkeit**

6. **V07-7** `core/feiertage.js`: Startjahr je Land für landesspezifische Feiertage, z. B.
   - Internationaler Frauentag: BE ab 2019, MV ab 2023;
   - Reformationstag: in HB/HH/NI/SH ab 2018.

   Die Jahreszahlen selbst per Quelle belegen (Gesetzestext bzw. Landesrecht, per curl geholt). Zahlen aus diesem
   Papier sind FUNDORTE, keine Belege. Tests je Land: Vorjahr ⇒ kein Feiertag, Startjahr ⇒ Feiertag.
7. **V10-5** `core/zustaendigkeit.js:34-39`: Bei gemischter Zuständigkeit (Anlage extern, Geräte intern oder
   umgekehrt) nennt der Text beide Parteien, statt eine zu unterschlagen. Test je Mischlage.
8. **V10-6** `core/steckbrief.js:144-153`: Ladefehler geben heute still leere Daten zurück. Künftig wird ein
   Fehlerkennzeichen durchgereicht und der Steckbrief zeigt „nicht ladbar“. Alle Aufrufer ziehen mit (Liste in den
   Bericht).

**Mail und Druckerei**

9. **V07-8** `core/defekt_mailer.js`: Ein Claim, dessen Versand nie bestätigt wurde (Prozesstod zwischen Claim und
   Senden), bleibt heute für immer „gesendet“.
   - Behebung OHNE Migration: Der Claim schreibt einen erkennbaren Übergangswert und erst der erfolgreiche Versand
     den endgültigen Zeitstempel.
   - Der Wiederholer aus C5-B setzt alte Übergangswerte (älter als 30 min) zurück und versucht erneut.
   - Vorher alle Leser von `mail_gesendet_am` auflisten (Anzeige, Filter). Keiner darf den Übergangswert als
     „gesendet“ ausgeben.
   - Beide Tabellen (Defekte und Sperren).
10. **V06-6** `routes/admin/qr-bestellung.js:2002-2018` (Versand an die Druckerei): Bei einem Doppelklick oder einer
    Wiederholung kann heute zweimal bestellt werden. Behebung: ein Vorab-Claim auf die Bestellung (Zustand
    „wird gesendet“) per UPDATE mit Bedingung und `rowCount`.
    - Nur der Gewinner sendet.
    - Scheitert der Versand, wird der Claim zurückgesetzt, und das mit Meldung.
    - Ein Claim, der nach 30 min hängt, zeigt der Admin-Seite einen Hinweis „Versand unklar — prüfen“, statt ihn
      still zurückzusetzen, denn eine Bestellung ist nach aussen gegangen oder nicht.
    - Test: zwei gleichzeitige Anfragen ⇒ genau ein Versand (Mail-Attrappe).

**Betriebsskripte**

11. **V10-4** `ops/monitoring-alert.sh:111`: Nur `RESTORE_OK = ok` gilt als grün. „Drill abgeschaltet“ bekommt einen
    eigenen Zustand mit eigener Meldung, nicht dauerhaft Alarm. Test gegen Attrappen wie bei den bestehenden
    Shell-Tests.
12. **V11-2** `ops/seed-performance-data.js:54`: Der Monatsschlüssel wird `YYYY-MM`.
13. **V11-3** `tools/aufkleber.js:2099`: Der Text nennt +30 %, passend zu `KOPF_BREITE_AUFSCHLAG = 1.30`.
14. **V11-4** `ops/schluessel-rotieren.js:317`: Die Erfolgsmeldung hängt an der Anzahl umgeschlüsselter Zeilen; bei 0
    lautet sie „nichts geändert“. ACHTUNG: C5-B ändert dieselbe Datei; Stand nach dessen Merge.
15. **V11-6** `workers/pdf-job-worker.js:165`: `claim` kommt in try/catch mit Backoff. Retry- und DeadLetter-Fehler
    in `processJob` behandeln; der Worker läuft weiter und meldet.
16. **V11-8** `tools/ausmusterung-gegenproben.js:198-206`: „nicht auswertbar“ ist ein eigener Zustand,
    `alleOk = false`.
17. **V11-9** `tools/qr-charge.js:247`: Der Studio-Lookup kommt in try/catch; ein DB-Fehler geht über `fehlerLog`,
    danach `return null`.
18. **DEP-1** `ops/export-check-deckung.json`: `nodemailer` in `pakete` aufnehmen. Vorher lokal laufen lassen, ob die
    Selbstprobe dadurch rot wird. Wenn ja, mit Messung widersprechen, nicht hart schalten.

**Provisioning, Offboarding, Replikation**

19. **N9-b** `core/provisioning.js:921-923`: Übersprungene Ziele (ausserhalb der Wurzel) werden gezählt und über
    `provisioning:offboarding_ziel_ausserhalb_root` gemeldet. Der Eintrag gilt dann NICHT als „erledigt“, sondern als
    „erledigt mit Auslassungen“. Vorher messen, welche Folgen das für die Wiederholung hat.
20. **R7-8** `server.js:278-280`: `queue_fehlt:false` kommt in den 503-Körper, damit der Hauptserver beide Fälle
    unterscheiden kann. Vorher den Hauptserver-Leser messen (nur lesen).
21. **U-REAP1** `routes/belehrungen.js` / `core/retention.js`: Für `BELEHRUNGEN_UPLOAD_DIR` und ersetzte Prüfberichte
    gibt es keinen Reaper.
    - `findeLoeschWurzel` bekommt diese Wurzeln, damit fehlgeschlagene Löschungen in die bestehende
      `retention_datei_loeschqueue` gehen.
    - Vorher messen, welche Wege dort löschen.
22. **U-LOE2** `core/storage-replica.js:410-411`: Ein DB-Fehler in Weg 2 verliert heute die bereits gelesenen
    Verweise. Im Fehlerpfad kommt ein persistenter Löschauftrag (bestehende Tabelle `storage_replica_loeschauftrag`)
    für diese Verweise.

**Pentest-Reste**

23. **A3** `routes/bezirk-archiv.js`: Die Tokenprüfung kommt als `router.use` VOR die Routen, damit 403 vor jeder
    Eingabeprüfung kommt und kein 400/403-Unterschied etwas über Existenz verrät.
    - `test_feature_pentest_p1_verhalten.js:172-181` wird fachlich umgestellt.
    - Vorher messen, ob `/` absichtlich ohne Token erreichbar ist (Kettenportal). Wenn ja, ist `/` ausgenommen, mit
      Begründung.
24. **F1** `routes/belehrungen.js:2126-2162`: `istGueltigeId(mitarbeiter_id)` vor der Abfrage. Dazu eine Attrappe im
    Test `test_feature_mandantengrenze_fremd_ids.js`, die einen Absturz auslöst, damit die N9-Zusicherung nicht blind
    wird. Positivkontrolle: dieselbe Anfrage mit gültiger ID läuft durch.

**Texte und Kommentare**

25. **V01-5 / V01-11 / V06-3b / V06-4:**
    - V01-5: Die Meldung bei zu großer Anfrage nennt keine falsche Zahl.
    - V01-11: `/mail/:monat` prüft `^\d{4}-\d{2}$` vor dem DB-Zugriff.
    - V06-3b: Kommentar „ohne 0 O 1 I“ (L bleibt).
    - V06-4: Kommentar auf „wohlgeformte IDs“ eingrenzen.

## Regeln

- **Arbeitsbaum:** `/workspace/gymdocu-c5g` (Zweig `c5g-kern-ops`, von `origin/master` NACH dem Merge von C5-B).
- **DB und Lock:** Einzeltests gegen `gymdocu_c5g_test`, nie gegen `gymdocu_test`. Lock nie löschen. KEINE Migration.
- **Suite:**
  - Aufruf: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`.
  - Dateizahl-Ritual, Lint wörtlich.
  - Neue Tests registrieren.
- **Zusicherungen:** Jede neue Zusicherung mit Gegenprobe (ROT und GRÜN), vorher `node --check`. `melde` und Telegram
  nie echt, kein echter Mailversand.
- **Abschluss:** Committen und pushen vor langem Warten. Kein PR. Bericht je Punkt.
