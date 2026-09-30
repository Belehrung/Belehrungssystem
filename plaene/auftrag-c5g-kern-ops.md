# Auftrag C5-G — Kernmodule, Werkzeuge und Betriebsskripte (Extrarunde)

Fassung 2, 30.09.2026 (Planprüfung flash + kimi, `scratchpad/c5plan/flash-c5g.txt`, `dicht/kimi-c5g.md.tab.md`). Repo GymDocu. Der Bau startet ERST nach dem Merge von C5-B, weil `core/defekt_mailer.js` und
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

## Fassung 2 — verbindlich (geht dem Text oben vor)

**Aufteilung in zwei Bauende:**

- **G1 (Fable 5.1)** — V07-5, U-REAP1, U-LOE2, V07-8, N9-b, V11-6. Einordnung „sehr komplex“: Jeder Punkt berührt
  einen Lösch- oder Versandweg, eine falsche Annahme erzeugt einen neuen Datenverlustpfad, und die Planprüfung hat
  genau das zweimal gefunden (V07-5, U-REAP1).
- **G2 (Standard-Executer)** — alle übrigen Punkte.
- G2 fasst keine Datei an, die G1 ändert. Überschneidet sich etwas, geht der Punkt an G1.

**Gestrichen bzw. an den Betreiber:**

- **V06-6** (Doppelversand an die Druckerei). Der Doppelklick ist im Prozess schon abgefangen (`sendetGerade`,
  `routes/admin/qr-bestellung.js:2023-2048`). Offen bleibt nur das pm2-Reload-Fenster. Ein Claim bräuchte einen neuen
  Statuswert (CHECK `core/db.js:1218`) und damit eine Migration. Das geht in die nächste Entscheidungsvorlage und
  wird NICHT gebaut.

### G1

- **V07-5.**
  - Fällt eine Stufe aus, fehlt Stufe 2 der `bekannt`-Satz dieser Tabelle; sie würde deren Fotos als Waisen löschen.
    Deshalb: Bei einem Stufenausfall löscht Stufe 2 NICHTS, sie zählt nur und meldet.
  - `core/foto-reaper.js:133` (`readdirSync`-Fehler wird zu `[]`) wird gezählt und gemeldet, nicht zu „keine
    Waisen“.
  - `reapeFotos.js` endet bei einem Teilfehler mit Exit ≠ 0.
  - Test: Stufe 1 wirft ⇒ keine Datei gelöscht, Meldung da. Gegenprobe: Sperre entfernen ⇒ ROT (Foto gelöscht).
- **U-REAP1.**
  - Vor jedem Löschen bzw. jeder Queue-Wiederholung einer Datei aus `BELEHRUNGEN_UPLOAD_DIR` prüft eine
    Referenzprüfung (Muster `core/provisioning.js:749-755`, `nochReferenziert`), dass kein Studio mehr auf die Datei
    verweist.
  - Heute löscht die Route über `entferneDatei` (meldet, stellt aber nicht in die Queue, `routes/belehrungen.js:2407`,
    `core/datei-entfernen.js:108-120`). Die Aufrufstelle wird auf einen queue-fähigen Weg umgestellt; nur
    `findeLoeschWurzel` zu erweitern genügt NICHT.
  - Test:
    - eine geteilte Datei bleibt;
    - eine unreferenzierte wird gelöscht;
    - ein fehlgeschlagenes Löschen landet in der Queue und wird wiederholt.
- **U-LOE2.**
  - Die Prämisse „bereits gelesene Verweise“ ist widerlegt: die Verweise entstehen erst im `DELETE … RETURNING`
    (`core/storage-replica.js:1158-1216`).
  - Zuerst messen, ob beim zweimaligen Scheitern `.enc`-Dateien ohne Auftrag zurückbleiben. Falls ja: die Verweise
    vorab in einer eigenen Verbindung lesen und den Auftrag schreiben, dann löschen (Sperrordnung beachten, siehe
    CLAUDE.md). Ein Fehler im Fehlerpfad meldet und liefert nie `ok:true`.
  - Falls nein: mit dieser Messung schliessen.
- **V07-8.**
  - Tests:
    - der Claim schreibt den Übergangswert (belegt, nicht nur der Reset-Filter);
    - ein Übergangswert älter als 30 min wird zurückgesetzt und genau einmal gesendet;
    - der Leser zeigt den Übergangswert nicht als „gesendet“.
  - In die Leserliste gehören auch die Gates und alle `IS NOT NULL`-Filter.
  - Das Doppelversandfenster (Prozesstod NACH dem Senden, VOR dem Endwert) kommt als Restfenster in den Bericht.
- **N9-b:** Eine übersprungene Datei ausserhalb der Wurzel ist mit diesem Weg nie löschbar. Der Eintrag wird deshalb
  abgeschlossen, mit EINER Meldung unter eigener Signatur (nicht weggedrosselt). Kein Wiederholen.
- **V11-6:**
  - Backoff mit Obergrenze (z. B. 60 s).
  - `melde` nach 5 Fehlschlägen in Folge.
  - Nach 20 Fehlschlägen in Folge endet der Worker mit Exit 1, damit pm2 neu startet und die Liveness sichtbar bleibt.
  - Test mit `melde`-Spy.

### G2

- **V07-2:**
  - Die vier Einträge in `BEKANNTE_AUSNAHMEN` werden mitentfernt (`test_feature_geraete_datumsfallen.js:412-437`,
    `test_feature_datum_monatsrollover.js:401`); der Wächter verlangt sonst, dass sie gefunden werden.
  - Dazu ein statischer Wächter nach dem Muster `test_feature_datum_inline_berlin_static.js`.
- **V07-3:**
  - Die „Dashboard-Zusage“ wird wörtlich gesucht (`routes/admin/dashboard.js:765-766`). Gibt es keine: mit Beleg
    schliessen.
  - KEINE gefälschte Unterschrift in Demo-Daten.
- **V07-4:**
  - Scheitert die Registrierung, wird die Datenzeile idempotent zurückgenommen (keine Leichen, kein Duplikat beim
    nächsten Laden), mit `melde`.
  - Die Route (`routes/admin/einstellungen.js:665-685`) zeigt bei `ok:false` einen Hinweis statt `?demo=geladen`.
  - Den zweiten leeren catch (`core/demo_daten.js:276-279`) mitbeheben.
- **V07-6:** Alle DREI Aufrufer von `spaltenWennTabelle` (`core/export-studio.js:220-254`) fangen einzeln und setzen
  je einen Hinweis (Foto, Lageplan, LIESMICH). Der Export läuft weiter.
- **V07-7:**
  - Alle landesspezifischen Startjahre, auch Weltkindertag TH (2019). Belege per Quelle.
  - Jede Zusicherung braucht einen Positivanker: ein bundesweiter Feiertag (1.5.) steht in derselben Liste.
- **V10-4:**
  - `unknown` (keine Statusdatei) bleibt grün, solange der Drill nicht eingerichtet ist.
  - Ist er eingerichtet (vorher messen, woran das erkennbar ist; sonst eine Umgebungsvariable einführen), ist
    `unknown` ein Befund.
  - „Abgeschaltet“ erinnert einmal pro Woche.
- **V10-5:**
  - Ein dritter Zustand „teilweise extern“ mit Text, der BEIDE Parteien nennt.
  - Die Aufrufer `routes/admin/geraete.js:5505` und `routes/wartung.js:527` behandeln ihn ausdrücklich (kein
    truthy-Objekt als „extern“).
  - Tests je Mischlage.
- **V10-6:** Den Drei-Zustands-Vertrag (Wert, nie beantwortet, nicht ladbar) ausdrücklich festhalten. Aufrufer
  `routes/admin/geraete.js:5643/6134` und die Zusicherungen `test_feature_wartung_durchfuehrung.js:72,159`
  nachziehen. Je Aufrufer ein Test auf „nicht ladbar“.
- **V11-4:**
  - Im Trockenlauf lautet die Zeile „würde N umschlüsseln“.
  - Die Bedingung „nichts geändert“ gilt nur für `--wirklich`.
  - Test mit Positivanker.
- **V11-8:** Auch der Absturzpfad (`:320-325`) führt zu „nicht auswertbar“.
- **V11-9:** DB-Fehler (`fehlerLog` und `null`) von unbekannter Subdomain (`null` ohne Log) trennen; `db.one` bei 0
  Zeilen messen.
- **V11-2:** Die Altdaten-Toleranz in `routes/bezirk-archiv.js:127-129` bleibt als Regressionstest. Kommentare
  nachziehen. Der Test zählt mit `COUNT(*)`, nicht leer-wahr.
- **A3:**
  - Die Tokenprüfung kommt VOR `wacheIdParameter` (vor `routes/bezirk-archiv.js:37`).
  - `/` ist nicht tokenfrei, eine Ausnahme entfällt.
  - Begründung: „ohne Token keine Information preisgeben“ (nicht „Existenz“).
- **F1:** Den Ausnahme-Eintrag im Body-Query-Scan (`test_feature_pentest_p1_body_query.js:559-580`) streichen. Die
  Attrappe feuert im selben catch wie der Sensor. Die neue 400-Antwort für ungültige IDs wird benannt.
- **DEP-1:** Messung unter CI-Bedingung (frisches `npm ci`). Wird die Selbstprobe rot, wird mit Messung widersprochen.
- **V01-11:** Weitere Aufrufer von `generateMonthlyPDFs` mit freiem `monat` messen und gleich absichern.

## Regeln

- **Arbeitsbäume:** G1 `/workspace/gymdocu-c5g1` (Zweig `c5g1-loeschwege`), G2 `/workspace/gymdocu-c5g2` (Zweig `c5g2-kern`); beide von `origin/master` NACH dem Merge von C5-B. Einzeltests gegen `gymdocu_c5g1_test` bzw. `gymdocu_c5g2_test`.
- **DB und Lock:** Einzeltests gegen `gymdocu_c5g_test`, nie gegen `gymdocu_test`. Lock nie löschen. KEINE Migration.
- **Suite:**
  - Aufruf: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`.
  - Dateizahl-Ritual, Lint wörtlich.
  - Neue Tests registrieren.
- **Zusicherungen:** Jede neue Zusicherung mit Gegenprobe (ROT und GRÜN), vorher `node --check`. `melde` und Telegram
  nie echt, kein echter Mailversand.
- **Abschluss:** Committen und pushen vor langem Warten. Kein PR. Bericht je Punkt.
