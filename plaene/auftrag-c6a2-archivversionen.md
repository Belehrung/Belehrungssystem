# Auftrag C6-A2 — Monatssperre und Archivversionen (Extrarunde C6)

Fassung 1, 01.10.2026. Repo GymDocu, Stand master `9dfe522`. **Erst bauen, wenn C6-A1 gemergt ist.** Beide fassen
`generateMonthlyPDFs.js` an.

**Herkunft:** `plaene/c6-zustand-01-10/z1.md` (F2, F3/R2-4, R2-1). Dazu die Planprüfung von C6-A Fassung 1:
- flash: `scratchpad/c6plan/flash-c6a.txt`, Befunde 1, 2, 3, 4, 7, 8, 14;
- sol: `scratchpad/c6plan/sol-c6a.txt`, Befunde 1, 2, 4–13.

Die tragenden Befunde habe ich selbst nachgemessen:
- die `pg_locks NOT granted`-Belege in `test_feature_monatslock_verbindung.js:172-175` und
  `test_feature_archiv_neu_single_atomar.js:94-97,189,231-233`;
- der Modul-catch, der jeden Fehler schluckt (`generateMonthlyPDFs.js:301-341`);
- das Nachholfenster nur am 2.–10. (`server.js:1720`);
- kein UNIQUE auf `pdf_archiv(studio_id, monat, typ)`.

**Modell.** Standard-Executer. Einordnung: SEHR komplex. Sperrbesitz, Commit-Ungewissheit und Dateiversionen greifen
ineinander, und ein Test mit Stub ohne echte Datei ist falsch grün. Ein Opus-Einsatz wäre nach CLAUDE.md nur mit
gemessenem Vorteil zulässig. Die Planprüfung trägt hier deshalb mehr als sonst.

**Arbeitsbaum und Datenbank:**
- `/workspace/gymdocu-c6a2`, Zweig `c6a2-archivversionen`;
- eigene DB `gymdocu_c6a2_test`;
- Suite und Gegenproben wie üblich.

## Ziel

Drei heutige Zustände sollen verschwinden.
1. Ein Admin-Klick oder Cron wartet ohne Grenze auf die Monatssperre.
2. Nach Verlust der Sperrsitzung schreibt ein Lauf ungeschützt weiter. Dabei kann er die Datei eines zweiten Laufs
   überschreiben.
3. Eine Archivzeile (alter `pdf_hash`, alter `verify_code`) zeigt nach einem gescheiterten Tausch auf eine NEUE
   Datei, und alte Dateien bleiben ohne Löschanker liegen.

## Entscheidungen

### E1. Jede Archiv-PDF bekommt einen eindeutigen, nie überschriebenen Pfad

- Das gilt für die Modulschleife des Monatslaufs UND für `/neu-single`, bei JEDER Erzeugung, nicht nur bei einer
  Neuerzeugung.
- Der Name lautet `<Basis> v<8 hex>.pdf` oder ähnlich. Er muss den Namensriegel von `createDocument()` bestehen
  (`core/pdf-engine.js:320-325`). Vorher messen, ob `finalize()` überschreibend umbenennt. Wenn ja, ist das durch den
  eindeutigen Namen gegenstandslos. Das schreibst du ausdrücklich in den Bericht.
- `dateiname` (Anzeige, Download, Mail-ZIP) bleibt der deterministische Name. Download und ZIP nehmen ihn schon heute
  aus `dateiname` (`routes/archiv.js:877`, `:970`). Ebenso Admin-ZIP und Bezirksdownload (laut sol). Das misst du
  nach.
- Andere Erzeuger mit deterministischem Namen OHNE Archivzeile (z. B. `routes/admin/geraete.js:819-908`) bleiben
  unverändert. Die Entscheidung über den Namen sitzt in den beiden Archiv-Aufrufern, nicht in `createDocument()`.
- Alle Stellen, die den Archivpfad lesen oder vergleichen, gehören mit Befund in den Bericht: Ernte, Retention,
  `pdf-loeschung`, `pdf-altform`, Replik, Verify, CLI, Tests. Die Liste aus der Planprüfung ist ein Hinweis, keine
  Vollständigkeit.

### E2. Archivtausch und Löschanker in EINER Transaktion

Die Tauschtransaktion (Monatslauf und `/neu-single`) macht in dieser Reihenfolge:
1. **Prüfen, ob die Sperre noch gehalten wird (E4).** Fehlt sie, wirft sie `MONATSLOCK_VERLOREN`.
2. `DELETE FROM pdf_archiv WHERE studio_id=$1 AND monat=$2 AND typ=$3 RETURNING dateipfad`. ALLE alten Pfade werden
   erfasst; es gibt kein UNIQUE.
3. `INSERT` der neuen Zeile.
4. Für jeden alten Pfad (dedupliziert, ungleich dem neuen) ein Eintrag in die bestehende persistente Löschqueue
   `retention_datei_loeschqueue`, mit `studio_id`. Wie Einträge aussehen und wie der Retention-Lauf sie abarbeitet
   (`core/retention.js#verarbeiteKorrekturDateiQueue`), liest du dort nach; Datei und Replik werden gemeinsam
   gelöscht.

Nach dem COMMIT werden genau diese Einträge sofort abgearbeitet. Das ist der schnelle Weg. Stirbt der Prozess
vorher, holt der nächtliche Lauf sie nach. Dafür gibt es keinen neuen Reaper.

### E3. Die Queue löscht keine Datei, auf die eine Archivzeile zeigt

- Vor dem Löschen eines Pfads unter `PDF_ROOT` prüft die Abarbeitung (Sofortweg UND nächtlicher Lauf), ob eine
  `pdf_archiv`-Zeile mit `COALESCE(datei_geloescht,0)=0` auf genau diesen Pfad zeigt (mit `studio_id`).
  - Wenn ja: nicht löschen, den Eintrag mit Meldung verwerfen.
  - Scheitert die Prüfung selbst: nicht löschen, Eintrag bleibt.
- Muster: `belehrungsDateiNochReferenziert` in `core/datei-loeschqueue.js`.
- Erst das macht E5 sicher.

### E4. Sperrbesitz wird in der Datenbank nachgewiesen, nicht nur per Ereignis vermutet

- Das `error`-Ereignis der Sperrverbindung setzt weiterhin ein Signal. Das ist der schnelle Abbruch vor jedem Modul.
- Der harte Nachweis steht IN der Tauschtransaktion (E2 Schritt 1): Ein `SELECT` auf `pg_locks` zeigt, dass die
  Backend-PID der Sperrverbindung (`lockClient.processID`) die Advisory-Sperre für den Schlüssel
  `monthly_pdfs:<studio>` hält (`granted`).
  - Den Abgleich von `hashtext(...)` mit `classid`/`objid` leitest du her und belegst ihn mit Positiv- und
    Negativprobe.
- `MONATSLOCK_VERLOREN` wird im Modul-catch ERKANNT und weitergeworfen. Er ist kein gewöhnlicher Modulfehler. Normale
  Modulfehler bleiben isoliert, und die Zusicherung „ein Modulfehler stoppt die übrigen nicht“ bleibt grün.
- Der Lauf endet mit einem Wurf. Es gibt keine Erfolgs-Mail und keinen Erfolgsrückgabewert. Die CLI
  (`regenerierePdfMonat.js`) meldet einen Fehler.

### E5. Scheitert die Tauschtransaktion, wird die neue Datei über die Queue entsorgt, nie direkt

- Die neue (eindeutige) Datei kommt per eigenem INSERT in `retention_datei_loeschqueue`. Die Referenzprüfung aus E3
  entscheidet bei der Abarbeitung.
- Bei `commitUngewiss === false` darf sofort abgearbeitet werden.
- Bei ungewissem COMMIT wird NICHT sofort abgearbeitet; der nächtliche Lauf entscheidet. Hat der COMMIT doch
  gegriffen, zeigt die Zeile auf die Datei, und E3 verhindert das Löschen. So entscheidet kein negativer SELECT über
  einen noch offenen Commit (sol 12).
- Scheitert schon der Queue-INSERT (DB weg), folgt `melde()`. Die Datei bleibt als Müll liegen, nicht als
  Datenverlust.

### E6. Die Wartezeit an der Monatssperre ist begrenzt, und `pg_locks` zeigt das Warten weiterhin

- Die Sperre wird weiter blockierend mit `pg_advisory_lock` genommen. Davor setzt die Sperrverbindung
  `SET lock_timeout = '<wartezeitMs>ms'`.
  - So bleibt die nicht erteilte Anforderung in `pg_locks` sichtbar. Die bestehenden Wartebelege und statischen
    Wächter bleiben gültig: `test_feature_monatslock_verbindung.js:172-179`,
    `test_feature_archiv_neu_single_atomar.js:94-97,189-206,230-244`, `test_feature_audit_batch3_static.js:42`,
    `test_feature_geistersperre_nachtrag_rennen.js:1132-1133`. Prüfe sie und ziehe sie nur fachlich nach, wo nötig.
  - VORHER messen, dass `lock_timeout` ein wartendes `pg_advisory_lock` wirklich mit SQLSTATE `55P03` abbricht.
    Wenn nicht: abbrechen und melden.
- Gesamtfrist inklusive Verbindungsaufbau und hängender Abfrage: `connectionTimeoutMillis` und ein clientseitiges
  `query_timeout` auf der Sperrverbindung. Gemessen wird mit einer nie auflösenden Attrappe (sol 7).
- `55P03` wird zu `err.code = 'MONATSLOCK_BELEGT'`. Ein gescheiterter Verbindungsaufbau bleibt sein eigener Fehler
  und wird NICHT zu `MONATSLOCK_BELEGT` (flash 8). Es gibt eine Gegenprobe in beide Richtungen.
- Werte:
  - Vorgabe 15 Minuten (Cron, Nachholen, CLI).
  - Die Admin-Routen `/neu/:monat` und `/neu-single` übergeben 20 s.
  - `generateAllMonthlyPDFs(studioId, { …, wartezeitMs })` reicht die Wartezeit an `mitMonatsLock` durch. NICHT
    außen einen zweiten Lock darum legen (sol 8).
- Begründung als Kommentar an den Konstanten:
  - 20 s liegen unter dem Standard-`proxy_read_timeout` von nginx (60 s). Sie begrenzen das WARTEN, nicht die
    Erzeugung.
  - 15 min: Ein normaler Monatslauf eines Studios wird fertig, ein hängender blockiert nicht alle folgenden.
- Die Admin-Routen antworten bei `MONATSLOCK_BELEGT` mit 409: „Für dieses Studio läuft gerade eine PDF-Erzeugung —
  bitte in einigen Minuten erneut versuchen.“ Dabei gibt es kein `melde()`.
- Bei `MONATSLOCK_VERLOREN` antworten sie mit 500, Fehlerseite und `melde()`.
- Cron und Nachholen: `fuerAlleStudios` loggt heute nur (`server.js:1615-1617`). Die Callbacks des Monats-Crons und
  der beiden Nachhol-Wege melden `MONATSLOCK_BELEGT` und `MONATSLOCK_VERLOREN` zusätzlich per `melde()`.

### E7. Wortlaut zum Nachholen

- Das Nachholen läuft nur am 2.–10. und beim Serverstart (`server.js:1720`, `:1873-1878`).
- Die Meldung zu `MONATSLOCK_VERLOREN` sagt deshalb: „fehlende Typen holt das Nachholfenster (2.–10.) nach, danach
  nur von Hand über ‚Neu erzeugen‘.“
- Einen neuen täglichen Weg gibt es nicht.

## Tests (Dateisystem nur unter Wegwerf-`PDF_ROOT`, keine echten Dienste)

- **Bestehende Stubs** in `test_feature_archiv_neu_single_atomar.js` schreiben heute keine Datei (`stubPfad`
  nicht vorhanden). Für die Datei-Zusicherungen braucht es einen Stub, der unter dem ANGEFORDERTEN Namen echte,
  unterscheidbare Bytes unter der Wegwerf-Wurzel schreibt (flash 3, sol 1).
- Tausch scheitert eindeutig (Trigger wie heute):
  - Die alte Zeile ist unverändert.
  - Die alte Datei trägt die alten Bytes, Sollwert ist der Hash aus dem Seed.
  - Die neue Datei steht in der Queue und ist nach der Sofortabarbeitung weg.
- Tausch gelingt:
  - Die neue Zeile zeigt auf den neuen, eindeutigen Pfad.
  - Die alte Datei ist weg, die Replik der alten Datei auch.
  - Eine Fixtur mit ZWEI alten Zeilen und verschiedenen Pfaden: beide alten Dateien sind weg (sol 13).
- Absturz zwischen COMMIT und Sofortabarbeitung, simuliert durch eine geworfene Ausnahme nach dem COMMIT: Der
  Queue-Eintrag existiert, und der echte Queue-Verarbeiter räumt ihn danach ab.
- Ungewisser COMMIT:
  - Die Queue enthält die neue Datei, es gibt keine Sofortabarbeitung.
  - Hat der COMMIT gegriffen, löscht der Verarbeiter NICHT (E3).
  - Positivkontrolle: Zeigt keine Zeile darauf, wird gelöscht.
- Sperrverlust:
  - `pg_terminate_backend` auf die Sperrverbindung, bevor der Tausch des LETZTEN aktiven Moduls läuft.
  - Erwartet: Wurf `MONATSLOCK_VERLOREN`, keine neue Archivzeile für dieses Modul, keine Erfolgs-Mail.
  - Positivkontrolle: Der Tausch eines früheren Moduls ist sichtbar committet. Es gab also einen weiteren
    möglichen Schreibschritt.
  - Den verzögerten Weg extra prüfen: Die Sitzung ist weg, das `error`-Ereignis aber noch nicht zugestellt. Dann
    fängt der `pg_locks`-Nachweis (E4) den Tausch.
- Wartezeit:
  - Ein fremder Sperrhalter: `MONATSLOCK_BELEGT` nach kleinem `wartezeitMs`, `arbeit` lief nicht (Zähler 0), und
    `pg_locks` zeigte vorher die wartende Anforderung.
  - Nach der Freigabe läuft der Aufruf durch.
  - Verbindungsaufbau scheitert: KEIN `MONATSLOCK_BELEGT`.
  - Hängende Attrappe: Abbruch innerhalb von Frist + Toleranz.
- Route: `/neu-single` und `/neu/:monat` liefern bei belegter Sperre 409 mit dem Text, über den echten Weg mit
  20 s, im Test mit kleinem Wert über einen Konfig- oder Testhaken.
- Jede Zusicherung bekommt eine Gegenprobe, die genau sie trifft.

## Bericht

- Die Liste der Pfadverbraucher (E1), die Messung zu `lock_timeout` und `pg_advisory_lock` (E6), die
  `pg_locks`-Abgleichsformel mit Positiv- und Negativprobe (E4).
- Je Test die Gegenprobe wörtlich, die volle Suite mit `diff` EXIT 0, Lint.
- Ausdrücklich: Was sieht `GET /v/<alter code>` nach einem Tausch, wenn die alte Datei gelöscht ist? Messen, nicht
  vermuten.
