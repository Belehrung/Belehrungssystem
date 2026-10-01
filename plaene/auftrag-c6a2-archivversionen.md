# Auftrag C6-A2 — Monatssperre und Archivversionen (Extrarunde C6)

Fassung 2, 01.10.2026. Repo GymDocu, Stand master nach dem Merge von C6-A1. **Erst bauen, wenn C6-A1 gemergt ist.**
Beide fassen `generateMonthlyPDFs.js` an, und E7 setzt das Nachholen je Typ aus C6-A1 voraus.

**Herkunft:** `plaene/c6-zustand-01-10/z1.md` (F2, F3/R2-4, R2-1). Dazu zwei Planprüfungen.
- Runde 1 an Fassung 1 von C6-A: flash 14, sol 13 Befunde.
- Runde 2 an Fassung 1 von C6-A2: flash 13, sol 16 Befunde.
- Dateien: `scratchpad/c6plan/{flash,sol}-c6a*.txt`.

Selbst nachgemessen und getragen:
- die `pg_locks`-Wartebelege;
- der Modul-catch, der alles schluckt;
- das Nachholfenster 2.–10.;
- kein UNIQUE auf `pdf_archiv(studio_id, monat, typ)`;
- `retention_datei_loeschqueue` erwartet für `hauptdatei` einen ABSOLUTEN Pfad und hat `UNIQUE(studio_id, dateipfad)` (`core/retention.js:819-834`, `core/db.js:1851-1862`);
- `hashtext` wird vorzeichenerweitert (`test_feature_geistersperre_nachtrag_rennen.js:317-320`);
- `verarbeiteKorrekturDateiQueue` arbeitet ALLE Einträge eines Studios ab (`core/retention.js:809-813`);
- `finalize()` veröffentlicht mit überschreibendem `renameSync` (`core/pdf-engine.js:567`);
- Altform-Pfade `/pdf/Typ/x.pdf` ohne Studio gibt es (`core/pdf-pfad.js:15-25`).

**Nicht übernommen:** sol R2-1, „eine Wegwerf-`PDF_ROOT` ist echtes Dateisystem“. Die Testumgebung legt Wegwerf-Wurzeln
per mktemp an (`test/umgebung.sh`), und Tests schreiben dort seit Langem echte PDFs. Verboten ist der Zugriff auf
Betriebspfade, nicht auf Wegwerf-Wurzeln.

**Modell.** Standard-Executer. Einordnung: SEHR komplex (Sperrbesitz, Commit-Ungewissheit, Dateiversionen; ein Stub
ohne Datei ist falsch grün). Ein Opus-Einsatz wäre nach CLAUDE.md nur mit gemessenem Vorteil zulässig; die
Planprüfung trägt deshalb mehr als sonst.

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6a2`, Zweig `c6a2-archivversionen` ab master (mit C6-A1),
eigene DB `gymdocu_c6a2_test`. Suite und Gegenproben wie üblich.

## Ziel

Drei Zustände dürfen nicht mehr vorkommen:
1. Warten ohne Grenze an der Monatssperre.
2. Ein Archivtausch nach Verlust der Sperre.
3. Eine Archivzeile, die auf fremde oder überschriebene Bytes zeigt, oder eine veröffentlichte Archiv-PDF ohne
   Archivzeile und ohne Löschanker.

## Entscheidungen

### E1. Eindeutiger Archivpfad, atomar nicht überschreibend veröffentlicht

- JEDE Archiv-PDF bekommt einen eindeutigen Dateinamen, im Monatslauf und in `/neu-single`.
  - Muster: `<Basis> v<16 hex>.pdf` (64 Bit), gebildet beim Archiv-Aufrufer.
  - Er muss den Namensriegel von `createDocument()` bestehen (`core/pdf-engine.js:320-325`).
- `finalize()` bekommt eine Option, die NICHT überschreibend veröffentlicht: `link` und danach `unlink` der
  Temp-Datei. Muster ist `core/pdf-ablage.js` (`veroeffentliche`, `:266`, `:326-329`).
  - Existiert das Ziel schon, ist das ein Fehler. Es wird nichts überschrieben, und die Registerzeile wird
    zurückgenommen wie heute bei einem gescheiterten Rename.
  - Gegenprobe: denselben Namen zweimal erzwingen → die bestehenden Bytes bleiben.
  - Nur die beiden Archiv-Aufrufer benutzen die Option. Andere Erzeuger bleiben unverändert, z. B.
    `routes/admin/geraete.js:819-908`.
- `dateiname` (Anzeige, Download, ZIP) bleibt der deterministische Name. Nachmessen, dass alle Leser ihn aus
  `dateiname` nehmen; die Planprüfung nennt `routes/archiv.js:877,970`, Admin-ZIP und Bezirksdownload.
- Verhaltensänderung, die in den Bericht gehört: Die alte öffentliche URL einer ersetzten Version liefert danach
  404 (`routes/pdf-altform.js` vergleicht exakt).

### E2. Vorab-Löschanker vor der Erzeugung

- VOR dem Aufruf der Engine legt der Archiv-Aufrufer einen Queue-Eintrag für den ABSOLUTEN Zielpfad der neuen
  Datei an: `kategorie = 'archiv_vorab'`, mit `studio_id`.
  - Den Pfad nach derselben Regel bilden, die `createDocument()` benutzt; keine zweite Kopie der Regel.
  - Grund: Stirbt der Prozess nach `finalize()` und vor dem Tausch, oder scheitert der Tausch bzw. etwas dazwischen
    (auch die Konfig-Abfragen in `/neu-single`), räumt der nächtliche Lauf die Datei ab. Ein
    Kompensations-catch ist nicht nötig.
- Die Abarbeitung fasst `archiv_vorab`-Einträge erst an, wenn sie älter als 24 h sind (`erstellt_am`).
  - Grund: Ein laufender Tausch darf seine eigene Datei nicht verlieren.
  - 24 h ist gesetzt, nicht hergeleitet. Begründung: länger als jeder Monatslauf, kürzer als die Ernte-Frist der
    Temp-Reste.
- Die Tauschtransaktion LÖSCHT ihren eigenen `archiv_vorab`-Eintrag (E3, Schritt 4). Bleibt er stehen, hat der Tausch
  nicht stattgefunden.

### E3. Archivtausch auf der SPERRVERBINDUNG

- `mitMonatsLock` übergibt `arbeit` einen Kontext `{ tx(fn), istGehalten() }`.
  - `tx(fn)` führt `BEGIN … COMMIT` auf der Verbindung aus, die die Session-Advisory-Sperre hält. `fn` bekommt
    dieselbe Schnittstelle wie `t` aus `db.tx` (`run`, `one`, `q`), soweit der Tausch sie braucht.
  - Ist die Sitzung weg, scheitert jede Anweisung dieser Transaktion. Ein Tausch ohne Sperre ist damit unmöglich.
    Das ersetzt den `pg_locks`-Nachweis aus Fassung 1, und mit ihm entfallen Vorzeichenformel und PID-Kanal.
  - Fehlt der Kontext (Stubs, alte Aufrufer), wird NICHT stillschweigend auf `db.tx` ausgewichen, sondern laut
    geworfen.
  - Betroffene Stubs ziehst du fachlich nach, z. B. `test_feature_archiv_monatsende.js:42`.
- Ablauf der Tauschtransaktion (Monatslauf und `/neu-single`), in dieser Reihenfolge:
  1. `pg_advisory_xact_lock` je beteiligtem Pfad (neuer Pfad und alle alten), sortiert. Das ist die Barriere zu E4.
     Dieselben Schlüssel nimmt der Queue-Verarbeiter je Eintrag einzeln. Weil er höchstens einen auf einmal hält,
     entsteht kein Kreis. Diese Begründung kommt als Kommentar daneben.
  2. `DELETE FROM pdf_archiv WHERE studio_id=$1 AND monat=$2 AND typ=$3 RETURNING dateipfad`. Erfasst werden ALLE
     alten Pfade.
  3. `INSERT` der neuen Zeile.
  4. Den eigenen `archiv_vorab`-Eintrag löschen. Für jeden alten Pfad, der STUDIOSEGMENTIERT ist (`/pdf/<studio>/…`),
     dedupliziert und ungleich dem neuen, einen Queue-Eintrag `kategorie = 'hauptdatei'` mit dem ABSOLUTEN Pfad
     anlegen. Ein Konflikt mit einem bestehenden Eintrag (UNIQUE) ist kein Fehler (`ON CONFLICT DO NOTHING`).
     - Alte Pfade in Altform (`/pdf/Typ/x.pdf` ohne Studio) bekommen KEINEN Eintrag. Sie können von mehreren Studios
       referenziert sein (sol 12). Sie bleiben liegen, wie heute, und ihre Zahl kommt in den Lauf-Bericht.
- Nach dem COMMIT werden NUR die eben angelegten Queue-IDs sofort abgearbeitet. Dafür bekommt die Queue-Abarbeitung
  einen optionalen ID-Filter; der nächtliche Lauf bleibt ungefiltert.
  - Läuft die Sofortabarbeitung noch unter der Monatssperre, ist das in Ordnung: Es sind nur die eigenen Einträge.
  - Fehler der Sofortabarbeitung, auch beim ersten SELECT, sind KEIN Erzeugungsfehler. Das Modul zählt als erzeugt,
    der Fehler wird gemeldet, und die Einträge bleiben für den nächtlichen Lauf.
- `MONATSLOCK_VERLOREN`:
  - Scheitert die Tauschtransaktion an der toten Sperrverbindung, wird das als `MONATSLOCK_VERLOREN` erkannt, im
    Modul-catch weitergeworfen und beendet den Lauf. Normale Modulfehler bleiben isoliert.
  - Vor der Archiv-Mail prüft der Lauf `istGehalten()` mit einer echten Abfrage auf der Sperrverbindung. Ist die
    Sperre weg, gibt es keine Mail, und der Lauf wirft `MONATSLOCK_VERLOREN`. Die schon getauschten Zeilen bleiben
    gültig mit `mail_gesendet = 0`; das Nachholen aus C6-A1 nennt sie in der nächsten Mail.
  - Vor dem Wurf wird eine Fehler-Mail für gewöhnliche Modulfehler NICHT verschickt, denn ohne Sperre wird nichts
    verschickt. Die Modulfehler sind per `melde()` schon gemeldet. Das schreibst du so in den Kommentar.

### E4. Die Queue löscht nur, was keine Archivzeile mehr braucht

- Gilt für `hauptdatei`-Einträge unter `PDF_ROOT` und für `archiv_vorab`, im Sofortweg UND im nächtlichen Lauf.
- Je Eintrag in EINER Transaktion:
  1. `pg_advisory_xact_lock` auf den Pfadschlüssel (dieselbe Ableitung wie in E3; wartet auf einen laufenden Tausch).
  2. Prüfen, ob eine `pdf_archiv`-Zeile mit `COALESCE(datei_geloescht,0)=0` auf diese physische Datei zeigt.
     - Verglichen werden aufgelöste absolute Pfade, nicht Textformen.
     - Weil nur studiosegmentierte Pfade in die Queue kommen (E3), reicht die Suche im Studio des Pfades.
     - Wenn ja: nicht löschen, Eintrag verwerfen, gemeldet.
  3. Sonst Datei und Replik löschen, Eintrag entfernen.
- Scheitert die Prüfung selbst, wird nicht gelöscht, und der Eintrag bleibt.
- Muster: `belehrungsDateiNochReferenziert` in `core/datei-loeschqueue.js`.
- Wächter, die die Zahl der schreibenden Queue-Anweisungen in `core/retention.js` zählen (z. B.
  `test_feature_belehrung_upload_loeschqueue.js:219-222`), fachlich nachziehen.

### E5. Begrenzte Wartezeit an der Monatssperre, das Warten bleibt in `pg_locks` sichtbar

- Die Sperre wird weiter blockierend mit `pg_advisory_lock` genommen, davor `SET lock_timeout`.
  - Damit bleiben die Wartebelege gültig: `test_feature_monatslock_verbindung.js:172-179`,
    `test_feature_archiv_neu_single_atomar.js:94-97,189-206,230-244`, statisch
    `test_feature_audit_batch3_static.js:42,44`, `test_feature_geistersperre_nachtrag_rennen.js:1132-1133`. Ziehe
    sie nur fachlich nach.
  - VORHER messen, dass `lock_timeout` ein wartendes `pg_advisory_lock` mit SQLSTATE `55P03` abbricht. Wenn nicht,
    abbrechen und melden.
- EINE Frist für den ganzen Weg (Verbindungsaufbau, SET, Sperre), mit Restbudget:
  - Verbindungsaufbau mit `connectionTimeoutMillis = Rest`.
  - `lock_timeout = Rest`.
  - Clientseitiges `query_timeout = Rest + 2000 ms`. So gewinnt der Server mit `55P03`, und der 409-Weg ist
    beobachtbar.
  - Nach jedem Abbruch wird die Sperrverbindung geschlossen. Es bleibt keine Verbindung übrig, und es wird später
    keine Sperre mehr erworben; zu prüfen über `pg_stat_activity` bzw. `pg_locks`.
- Abbildung der Fehler:
  - `55P03` wird zu `err.code = 'MONATSLOCK_BELEGT'`.
  - Verbindungsaufbau-Fehler bleiben ihr eigener Fehler. Gegenprobe in beide Richtungen.
- Werte:
  - Vorgabe 15 min (Cron, Nachholen, CLI).
  - Die Admin-Routen übergeben 20 s über `generateAllMonthlyPDFs(…, { wartezeitMs })` bzw. direkt in `/neu-single`.
    KEIN zweiter äußerer Lock.
  - Begründung als Kommentar:
    - 20 s liegen unter dem Standard-`proxy_read_timeout` von nginx (60 s). Sie begrenzen das WARTEN, nicht die
      Erzeugung.
    - 15 min: Ein normaler Monatslauf wird fertig, ein hängender blockiert nicht alle folgenden Studios.
- Admin-Antworten:
  - `MONATSLOCK_BELEGT`: 409 „Für dieses Studio läuft gerade eine PDF-Erzeugung — bitte in einigen Minuten erneut
    versuchen.“ Ohne `melde()`.
  - `MONATSLOCK_VERLOREN`: 500, Fehlerseite und `melde()`.
- Cron und Nachholen: Die Callbacks melden beide Codes per `melde()`, denn `fuerAlleStudios` loggt nur.

### E6. Wortlaut

- Die Meldung zu `MONATSLOCK_VERLOREN` sagt: „Bereits erzeugte Nachweise bleiben gültig; fehlende Typen holt das
  Nachholfenster (2.–10.) nach, danach nur von Hand über ‚Neu erzeugen‘.“ Das stimmt erst mit C6-A1.
- Der Kommentar „RESTFENSTER, nicht schliessbar“ in `routes/archiv.js` wird ersetzt. Er beschreibt dann den neuen
  Ablauf und die verbleibende benannte Grenze: Altform-Pfade werden nicht gelöscht.

## Tests (Dateien nur unter Wegwerf-Wurzeln; keine echten Dienste)

1. **Kollision ohne E1 sichtbar machen:**
   - Zwei Erzeugungen über DENSELBEN Archiv-Aufrufer, die zweite mit scheiterndem Tausch.
   - Zugesichert: Die Pfade beider Erzeugungen sind verschieden; Pfad und Bytes der alten Datei bleiben, Sollwert ist
     der Hash aus dem Seed; die alte Zeile ist unverändert.
   - Gegenprobe: Versionszusatz entfernen → ROT.
   - Die bisherigen Stubs schreiben keine Datei (`test_feature_archiv_neu_single_atomar.js:45-55`). Der Stub muss
     unter dem ANGEFORDERTEN Namen unterscheidbare Bytes schreiben.
2. **Erfolgreicher Tausch:**
   - Die neue Zeile zeigt auf den neuen Pfad; die alte Datei und ihre Replik sind weg; `archiv_vorab` ist entfernt.
   - Fixtur mit ZWEI alten Zeilen: beide Dateien sind weg.
   - Fixtur mit einer alten ALTFORM-Zeile: Ihre Datei bleibt, und es gibt keinen Queue-Eintrag dafür.
3. **Absturz zwischen COMMIT und Sofortabarbeitung:**
   - Die Sofortabarbeitung wird kontrolliert ausgelassen, ohne catch-Kompensation.
   - Zugesichert: die EXAKTEN alten absoluten Pfade, Kategorie und Anzahl der Queue-Einträge.
   - Danach der echte nächtliche Verarbeiter: Dateien und Repliken sind weg.
   - Ein vorher geseedeter FREMDER Queue-Eintrag bleibt bei der Sofortabarbeitung unverändert (ID-Filter).
4. **Absturz nach `finalize()`, vor dem Tausch:**
   - Der `archiv_vorab`-Eintrag existiert.
   - Der Verarbeiter löscht ihn nicht vor Ablauf von 24 h, danach schon. Die Uhr stellst du über das Muster aus
     `test_feature_fundsachen_ablauf_rollover.js`.
   - Hat der Tausch doch committet, bleibt die Datei (E4).
5. **Barriere:**
   - Eine Tauschtransaktion bleibt nach Schritt 3 offen (zweite Verbindung).
   - Der Verarbeiter wartet auf den Pfadschlüssel, belegt über `pg_locks NOT granted`, und löscht nach dem COMMIT
     NICHT.
   - Gegenprobe: ohne Pfadsperre wird gelöscht → ROT.
6. **Sperrverlust:**
   - `pg_terminate_backend` auf die Sperrverbindung vor dem Tausch des LETZTEN aktiven Moduls. Erwartet:
     `MONATSLOCK_VERLOREN`, keine neue Zeile für das Modul, keine Mail.
   - Positive Vorbedingung: `sendMail: true`, Testadresse, zählender Mailstub. Ein identischer Lauf OHNE
     Sperrverlust erzeugt genau EINE Mail.
   - Ein früheres Modul ist sichtbar committet.
   - Dazu: Sperrverlust NACH dem letzten Tausch, vor der Mail → keine Mail, Wurf.
7. **Wartezeit:**
   - Fremder Halter: `MONATSLOCK_BELEGT`, `arbeit` nicht gelaufen (Zähler 0), vorher `pg_locks NOT granted`.
   - Nach der Freigabe läuft der Aufruf durch.
   - Verbindungsaufbau scheitert: kein `MONATSLOCK_BELEGT`.
   - Hänger getrennt bei Aufbau, Lock-Abfrage und Schließen: Abbruch in Frist + Toleranz, danach keine Restverbindung
     und kein später erworbener Lock.
8. **Routen:**
   - `/neu-single` und `/neu/:monat` liefern bei belegter Sperre 409 mit Text.
   - `test_feature_archiv_monatsende.js`: Stub liefert ein gültiges Ergebnisarray, zugesichert wird `ok=` und KEIN
     `err=` (sol 5).

Jede Zusicherung bekommt eine Gegenprobe, die genau sie trifft.

## Bericht

- Messung `lock_timeout`/`pg_advisory_lock` (`55P03`).
- Liste der Pfadleser (E1).
- Was `GET /v/<alter code>` nach einem Tausch zeigt; messen, nicht vermuten.
- Je Test die Gegenprobe wörtlich, volle Suite mit `diff` EXIT 0, Lint.
- Wo ein Wächter fachlich nachgezogen wurde, das Vorher und Nachher.
