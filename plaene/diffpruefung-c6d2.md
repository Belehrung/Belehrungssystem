# Diffprüfung C6-D2 Doppelsenden (02.10.2026)

Zweig `c6d2-doppelsenden`, Stand `8e58d5c`, 7 Commits ab `b8fe304`, 31 Dateien (+2178/−263).

Suite des Bauenden, Lauf 4: SUITE_EXIT=0, 510 = 510, `diff` EXIT 0, Lint sauber, Marker 6 (alle in `docs/offene-befunde-31-08-2026.md`). Lauf 3 auf demselben Baum war rot, mit einem FAIL in `test_feature_qr_journal.js`: „keine qr_charge-Zeile im Band der Nacharbeiten … übrig (9)“. Das Log ist gesichert unter `/workspace/c6d2-suite-lauf3.log` und `/workspace/c6d2-qrjournal-flake.log`.

- Den Produktionsdiff (core, routes, Migration; 1445 Zeilen) habe ich selbst gelesen. Daraus kommen zwei eigene Befunde (P-1, P-2).
- Eine flash-Lesespur über den weiteren Umkreis: Geschwisterrouten, `core/integritaet.js`, `core/db.js`, Tests ganz. 25 Runden, ~1,75 $.

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| P-1 = A1 | Geräte-CSV-Import: Ein Audit- oder DB-Fehler einer Zeile endet in `catch (err) { nFehler++; }` ohne `melde`. Vorher meldete der Import einen Audit-Ausfall an den Fehlerkanal. Scheitert das Audit für alle Zeilen, bleibt die Seite bei „N Fehler“, und der Betrieb erfährt nichts. Der Mitarbeiter-Import meldet seine Zeilenfehler gesammelt (`mitarbeiter.js:788-791`). | trägt (selbst gelesen) | Nacharbeit 1: eine Sammelmeldung wie beim Mitarbeiter-Import (Zahl, drei Beispiele mit Zeile und Grund) |
| P-2 | Geräte-CSV-Import: Die Vorab-Zählung `erwarteteNeu` entscheidet, ob eine Zuständigkeit Pflicht ist. Wird ein Gerät zwischen Vorab-Zählung und Zeilen-Transaktion nicht mehr gefunden (z. B. umbenannt), legt die Zeile es mit ungültiger `durchfuehrung` an. Der Bauende hat das benannt. | trägt (Code gelesen; selten) | Nacharbeit 1: In der Zeilen-Transaktion prüfen, ob ohne `best` und ohne gültige Zuständigkeit angelegt würde; dann Zeilenfehler (ohne `melde`, es ist eine Eingabelage) |
| A2 | Die Replay-Prüfung steht in der Transaktion, also HINTER der Fachprüfung. Ändern sich zwischen Erst- und Zweitversand die Aufgaben oder Spülstellen („Zurück und nochmal“ nach Minuten), scheitert der Zweitversand mit 400/409 („Status fehlt für …“), obwohl der Nachweis gespeichert ist. | trägt (Reihenfolge gelesen: `spuelplan.js` 386/392 vor 420; `wartung.js` 1607 vor 1678) | Nacharbeit 1: eine LESENDE Vorabprüfung auf `client_uuid` vor der Fachprüfung (Abkürzung zur Replay-Seite). Die Prüfung in der Transaktion bleibt der Riegel gegen das gleichzeitige Rennen. |
| A3 | `FRISCHER_CLAIM_SQL` vergleicht Text: Präfix plus beliebiger Rest (`'zzz' >= '2026-…'`) gilt 30 Minuten als frisch. Der Mailer-Kommentar sagt, ein Fremdwert werde zurückgesetzt. | trägt (SQL gelesen); heute aus eigenem Code nicht erzeugbar | Nacharbeit 1: das Zeitstempelformat per Regex verlangen, den Kommentar berichtigen |
| A4 | Die Replay-Seite sagt „Das PDF liegt noch nicht vor“, auch wenn die Erzeugung beim Erstversand gescheitert ist. Es kommt dann nie von selbst. | trägt | Nacharbeit 1: neutraler Titel („Das PDF liegt nicht vor.“), der Text nennt beide Fälle und den Weg über den Verlauf (Wartung und Spülplan) |
| A5 | Der Fachfirma-Replay zeigt `pruefung.datum` (Prüfdatum + Erfassungszeit), der Erstversand `jetzt`. | trägt; beide Angaben stimmen, nur unterschiedlich | keine; die gespeicherte Angabe ist die richtige |
| A6 | `ANZAHL_BROWSER = 18` steht nur in der SKIP-Meldung. | trägt; in der CI ist SKIP ohnehin FAIL | keine |
| A7 | Vier neue DB-Tests ohne `istWegwerfDb`-Riegel (spuelplan_replay, wartung_replay, idempotenz_schema, import_serialisiert). Nur reinigung_bereits hat ihn. | trägt (`grep`) | Nacharbeit 1: Riegel ergänzen, Liste im Wächter nachziehen |
| B4 | Einige Zusicherungen waren schon vor dem Diff grün (reinigung „Zeilen 1“) oder sind redundant (csp :66). | trägt; die tragenden Zusicherungen (Text „bereits gespeichert“, Merker, PDF-Inode, Byte-Gleichheit) haben Gegenproben | keine |
| B5 | Ein frischer Claim eines gestorbenen Prozesses blockiert den Knopf bis zu 30 Minuten. Die Meldung nennt die Uhrzeit. | trägt; gewollte Folge von D-E1 | keine |
| Q | `test_feature_qr_journal.js`: Die Aufräum-Zusicherung „Band der Nacharbeiten“ war in Lauf 3 rot (9 Zeilen), in Lauf 4 grün; einzeln grün. Das ist der zweite Fall nach C5-E1. | trägt (Log gesichert) | Sammelliste `offene-befunde-c6d2.md` (C6D2-1), eigene Untersuchung |
