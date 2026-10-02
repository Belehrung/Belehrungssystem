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

## Runde 2 (nach Nacharbeit 1, Stand `0f58695`)

Nacharbeit 1: Suite des Bauenden SUITE_EXIT=0, 510 = 510 (selbst nachgezählt), Lint sauber, qr_journal grün. Den Produktionsdiff habe ich selbst gelesen; den Screenshot der neuen Fehlerliste im Import habe ich angesehen (Tokens `--gd-achtung-*` vorhanden). Zweite flash-Runde über den vollen Diff, gleicher Auftrag plus eine Frage zur Vorabprüfung.

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| R2-A | Wartung: Die Vorabprüfung steht HINTER der Prüfer- und Unterschriftsprüfung (`wartung.js:1475-1491` vor `:1509`). Ist die PIN-Sitzung beim Zweitversand weg, ist `erfasser` leer (angemeldete Nutzer haben kein Feld `pruefer_name`). Der Zweitversand bekommt dann 400 statt Replay, obwohl gespeichert ist. Im Spülplan steht die Vorabprüfung richtig, vor `von`. | trägt (Zeilen gelesen) | Nacharbeit 2: Vorabprüfung direkt nach dem Lesen von `clientUuid`, vor Prüfer/Unterschrift; das Gerät dafür vorher lesen oder in `replaySeite` lesen |
| R2-B | Wartung: Die Replay-Abfrage verlangt `geraet_id`, der Unique-Index nicht. Ein `client_uuid` einer Prüfung an einem anderen Gerät desselben Studios läuft in 23505 → 500 „Fehler beim Speichern“. Das geht nur mit einer von Hand gebauten Anfrage. | trägt; selten | Nacharbeit 2: Vorabprüfung ohne `geraet_id`; anderes Gerät → 409 mit klarem Text („gehört zu einer anderen Prüfung, Seite neu laden“), kein 500 |
| R2-C | Der Replay vergleicht keinen Inhalt. Eine NICHT identische Zweitabsendung (zurück, geändert, erneut gesendet) zeigt den gespeicherten Stand als „gespeichert“; die Änderung ist ohne Hinweis verloren. | trägt (`signatur_hash` enthält die Zeit, taugt also nicht zum Vergleich) | Nacharbeit 2: Die Replay-Seite trägt einen Info-Banner wie bei der Reinigung („Dieses Formular war bereits gespeichert. Angezeigt wird der gespeicherte Stand; Änderungen nach dem ersten Absenden wurden nicht übernommen. Für eine neue Prüfung die Seite neu laden.“). Die Byte-Gleichheit in den Tests wird zu „Erstseite plus Banner“. |
| R2-D | Der Replay zählt die Mängel aus Freitext-Marken; enthält ein Nutzertext die Marke, weicht die Zahl ab. Beim Fachfirma-Datum gilt dasselbe wie A5. | trägt als Randfall | Sammelliste C6D2-4 |
| R2-E | Der Browser-Test `test_feature_c6d2_senden_ohne_seitenwechsel.js` schreibt in die DB ohne `istWegwerfDb`-Riegel und steht nicht in der Nutzerliste. | trägt (`grep`: 0) | Nacharbeit 2 |
| R2-F | `?bereits=<beliebig>` zeigt den Banner. | trägt (`req.query.bereits ?`) | Nacharbeit 2: `=== "1"` |
| R2-G | Scheitert `replaySeite` an der DB, sagt die Route „Fehler beim Speichern“ (500), obwohl der Nachweis längst gespeichert ist. | trägt | Nacharbeit 2: eigenes try/catch um den Replay, mit ehrlichem Text („gespeichert, Anzeige gerade nicht möglich“) und `melde` |
| R2-4 | Schwache Zusicherungen: Wartung (E) hat denselben Body bei beiden POSTs; Import (C) prüft `protokoll.length >= 4`. | trägt | Nacharbeit 2: (E) den zweiten POST mit abweichenden Statuswerten senden (die Seite muss die gespeicherten zeigen); (C) eine exakte Zahl, wenn sie herleitbar ist, sonst begründen |

### Nacharbeit 2 (Stand `33d0576`, mit master `1ff391f` gemergt) — geprüft

- Suite des Bauenden auf dem gemergten Stand: SUITE_EXIT=0, 510 = 510 (selbst nachgezählt), Lint sauber, qr_journal grün. Der Merge lief ohne Konflikte.
- Den Produktionsdiff (wartung.js, spuelplan.js, getraenkeanlage.js) habe ich selbst gelesen:
  - Die Vorabprüfung steht jetzt gleich nach `clientUuid`, ohne `geraet_id`; ein fremdes Gerät gibt 409.
  - Der Replay läuft nur über `sendeReplay` (try/catch, eigene Meldequelle).
  - Hinweis-Banner auf der Replay-Seite; `?bereits === "1"`.
- Screenshot der Replay-Seite (820 px) angesehen.
- Gegenproben je Punkt laut Bericht. Gegenprobe C zu R2-B blieb grün, weil die Transaktion denselben sequentiellen Fall fängt (zweiter Riegel). Benannt; Gegenprobe A (beide Stellen) war rot.
- Keine dritte Prüfrunde: Die Behebungen sind Platzierung, Antworttext und Banner, jede mit Gegenprobe. Die Rundenbegrenzung (CLAUDE.md 7.2) sieht eine zweite Runde vor, und die ist gefahren.
