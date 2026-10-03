# Auftrag A/B Qwen gegen Executer (03.10.2026): C6D3-4 und C6D2-5

Zweck: Messung nach CLAUDE.md Abschnitt 5 — derselbe Auftrag WÖRTLICH an zwei Bauwege (Executer und Bauspur mit Qwen), je ein
eigener Arbeitsbaum ab GymDocu master `bb7e7bc`. Bewertet wird blind (Diffs ohne Herkunft), dazu Claude-Token beider Wege und
Qwen-Kosten in `BAU-LAEUFE.md`.

Einordnung (vor dem Auftrag): nicht sehr komplex. Zwei Stellen mit je einer klaren Bedingung; die Falle ist eine Zusicherung,
die nicht rot werden kann (Punkt 1: der heutige catch ist unerreichbar).

Planprüfung (03.10.2026): flash mit Repo-Zugriff (11 Befunde, `ASTRA-LAEUFE.md`) und Kimi mit Bündel (7 Befunde). Eingearbeitet:
Wegwerf-DB-Muster (flash B1, blockierend), mitzuändernde Bestandstests (flash B2, Kimi 1), kein negiertes
`FRISCHER_CLAIM_SQL` (flash B3), Mechanik der gemeinsamen Funktion (Kimi 2), statische Einmaligkeit (Kimi 3), Weg über den
Wiederholer (Kimi 4a), Aufruferzählung (Kimi 5), Stub für `POST /verbinden` (flash B4, Kimi 6), Wurf-Test statt
„Werte wie vorher“ (flash B5), Wortlaut toter catch (B6/B7), Import (B8), Berliner Text (B9), fehlende Werte (B10, Kimi 7),
falscher Testverweis (B11). Nicht übernommen: Kimi 4b (Mailflut beim Erstlauf) trägt nicht — der Wiederholer sendet nur
Defekte jünger als 7 Tage (`core/defekt_mailer.js:471-475` und `:493`, `WIEDERHOLER_HOECHSTALTER_MINUTEN`), eine Zählung auf der
Produktiv-DB bleibt ausserhalb der Datengrenze.

Der Text unter „AUFTRAG“ geht unverändert an beide Wege.

---

## AUFTRAG

Repo GymDocu, Stand master `bb7e7bc`. Zwei kleine Behebungen, ein gemeinsamer neuer Test. Diese Anweisung ist vollständig; wo
sie eine Wahl lässt, steht das ausdrücklich da.

### 1. Magicline-Status: ein Lesefehler darf nicht wie „nicht verbunden“ aussehen (C6D3-4)

Befund: `getMagiclineStatus()` (`routes/webhooks.js:588`) liest alle Werte über `getConfig()` (`core/db.js:3267`), und
`getConfig()` verschluckt jeden Datenbankfehler zum Fallback. `getMagiclineStatus()` wirft deshalb nie: bei einem
Datenbankausfall antwortet `GET /` in `routes/bezirk-magicline.js` mit 200 und `aktiv:false` („nicht verbunden“), nirgends
gemeldet. Der catch dort (Zeilen 28-35) ist toter Code; würde er erreicht, antwortete er 500 ohne Meldung.

Aufrufer von `getMagiclineStatus()` ausserhalb der Tests (gezählt mit `git grep -n getMagiclineStatus -- '*.js' ':!test_*'`,
genau drei): `routes/bezirk-magicline.js:32` (`GET /`), `routes/bezirk-magicline.js:43` (`POST /verbinden`),
`routes/api-admin.js:106`. Vor dem Umbau die Zählung wiederholen und das Ergebnis wörtlich melden; findet sich ein weiterer
Aufrufer, ihn NICHT ändern, sondern als offenen Punkt melden.

Soll:
- `routes/webhooks.js`: Import um `getConfigStrict` ergänzen (`core/db.js:3282`, wirft bei einem Datenbankfehler);
  `getMagiclineStatus()` liest damit. Gleiche Schlüssel, gleiche Fallbacks wie heute. Alle anderen `getConfig()`-Aufrufe in
  der Datei bleiben unverändert.
- `routes/bezirk-magicline.js` `GET /`: im catch `melde(e, req, 'bezirk-magicline:status')` in einem eigenen try/catch (wie
  `POST /verbinden` in derselben Datei), Antwort bleibt `500 { error: 'fehler' }`.
- `routes/bezirk-magicline.js` `POST /verbinden`: unverändert (meldet schon als `'bezirk-magicline:verbinden'`). Scheitert dort
  das Lesen NACH dem Öffnen des Fensters, ist 500 trotz geöffnetem Fenster in Ordnung: ein erneuter Aufruf öffnet es erneut.
- `routes/api-admin.js:106`: heute würde ein Wurf `mlStatus = null` setzen, und `mlBlock` (Zeile 108) entfiele ersatzlos. Soll:
  `melde(e, req, 'api-admin:magicline-status')` in einem eigenen try/catch, und statt des Kastens eine `<div class="card">` mit
  dem Satz „Der Magicline-Status konnte gerade nicht gelesen werden. Bitte die Seite später neu laden.“ in den Farben der
  vorhandenen Klasse `.newkey-box` (Zeile 69, Achtung-Token). Die Formulare des Magicline-Kastens entfallen in diesem Fall. Die
  übrige Seite bleibt wie heute.

### 2. Wiederholer: Präfix plus Unsinn ist ein Fremdwert (C6D2-5)

Befund: `setzeVeralteteClaimsZurueck()` (`core/defekt_mailer.js:257-264`) vergleicht Text. Steht hinter dem Präfix
`MAIL_CLAIM_PRAEFIX` etwas, das KEIN Zeitstempel der Form `YYYY-MM-DD HH:MM:SS` ist (`'wird gesendet seit zzz'`), ist es als
Text grösser als jede Uhrzeit und wird vom Wiederholer NIE zurückgesetzt. Der Trainer-Knopf in `routes/wartung.js` behandelt
diesen Fall schon richtig (`FRISCHER_CLAIM_SQL`, Zeilen 2128-2130, seit C6-D2 Nacharbeit 1, A3).

Soll für den Wiederholer: zurückgesetzt wird, was den Präfix trägt UND (dessen Rest NICHT die Zeitstempel-Form hat ODER älter
als die Frist ist). Der Präfix-Teil bleibt beim Wiederholer stehen. `FRISCHER_CLAIM_SQL` wird NICHT negiert übernommen: der
Trainer-Reset trifft mit `NOT (…)` auch Endzeitstempel und NULL, der Wiederholer darf das nie (ein zurückgesetzter Endwert
macht einen Defekt wieder zum Kandidaten → zweite Mail).

Eine Stelle für die Formprüfung (dieselbe Aussage an zwei Orten ist verboten; `core/` importiert nicht aus `routes/`):
- In `core/defekt_mailer.js` eine exportierte Funktion, die den SQL-Ausdruck „Rest hinter dem Präfix hat die Zeitstempel-Form“
  für übergebene Platzhalter erzeugt (die Parameternummern unterscheiden sich: Mailer `$2` = Präfixlänge, wartung.js `$3`).
  Der reguläre Ausdruck `^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$` steht danach im Produktivcode genau einmal,
  in dieser Funktion. Name und Signatur in der Meldung nennen.
- `routes/wartung.js` baut `FRISCHER_CLAIM_SQL` damit; sein Verhalten ändert sich nicht.
- Die Kommentare im Kopf von `core/defekt_mailer.js` und bei `FRISCHER_CLAIM_SQL` auf den neuen Stand bringen; dabei den Verweis
  auf die nicht existierende Datei `test_feature_c6d2_sperrmail_claim.js` (`test_feature_defekt_mail_claim_uebergang.js:353`)
  durch die tatsächliche Verhaltenswache ersetzen (`test_feature_c5d_stille_fehler.js:631-656`). Benannte Restlücke in den
  Kopfkommentar: ein Claim-Zeitstempel in der Zukunft verfällt nie (unverändert aus dem Vorzustand).

Bestehende Tests, die diese Umstellung zwingend mitändert (Änderung ist Teil des Auftrags; jede geänderte Zusicherung in der
Meldung einzeln mit alt → neu ausweisen):
- `test_feature_defekt_mail_claim_uebergang.js:355-366` (`WARTUNG_LESER`, wörtliche Zeilen von `FRISCHER_CLAIM_SQL` und
  Zeilenzahl).
- Die Mailer-Attrappen in `test_feature_wartung_mail_reset_failclosed.js:20-24` und `test_feature_wartung_mail_seite_status.js`
  (feste Exportliste; fehlt dort die neue Funktion, scheitert schon das `require('./routes/wartung')`).
- `test_feature_c5d_stille_fehler.js:631-656` (Verhaltenswache des Trainer-Knopfs) bleibt UNVERÄNDERT und grün.

Zum Erstlauf nach der Auslieferung: der Wiederholer sendet nur Defekte jünger als 7 Tage (`WIEDERHOLER_HOECHSTALTER_MINUTEN`);
ein zurückgesetzter Fremdwert an einem älteren Defekt erzeugt keine Mail. Fremdwerte entstehen aus eigenem Code nicht.

### Test

- EINE neue Testdatei `test_feature_c6_restpunkte_ab.js`, in `test/run.sh` registriert, dazu die oben genannten Änderungen an
  Bestandstests.
- Einzeltests nur gegen eine eigene Datenbank im Muster `gymdocu_<kürzel>_test` mit genau EINEM Kürzel-Segment (z. B.
  `gymdocu_c6rest_test`; Muster in `test/helfer/wegwerf-db.js`, wird nicht geändert), nie gegen `gymdocu_test`.
- Fehler über den ECHTEN Weg herstellen, wo es geht; wo nicht, ein Stub mit einem Satz Begründung im Test.
- Punkt 1:
  - `getMagiclineStatus()` direkt: mit einem `studioId`, an dem die echte Abfrage scheitert (z. B. `'kein-int'`), WIRFT sie
    (das ist die Kernänderung; zurückgedreht auf `getConfig` wird dieser Fall ROT). Ohne Fehler liefert sie für ein Studio mit
    gesetzten Werten genau diese Werte (wörtlich eingetragene Erwartung).
  - `GET /`: Fehlerfall über den echten Weg (`req.studioId` wie oben) → 500 `{ error: 'fehler' }` und genau eine Meldung mit
    Quelle `bezirk-magicline:status`; Positivkontrolle → 200, keine Meldung.
  - `POST /verbinden`: ein echter Datenbankfehler trifft immer zuerst `oeffneTofuFenster()` (Schreiben vor dem Lesen); der
    Lesefehler NACH dem Öffnen wird deshalb per Stub hergestellt (nur das Lesen scheitert, das Schreiben läuft) → 500, genau
    eine Meldung `bezirk-magicline:verbinden`. Der bestehende Schreibfehler-Fall in `test_feature_c6d3_magicline.js` bleibt.
  - `routes/api-admin.js`: Lesefehler → der Hinweissatz steht auf der Seite, der Kasten „Magicline-Integration“ nicht, genau
    eine Meldung `api-admin:magicline-status`; ohne Fehler: Kasten da, Hinweis nicht, keine Meldung.
- Punkt 2:
  - Werte, jede Bedeutung ein eigener Datensatz, in BEIDEN Tabellen (`geraete_defekte`, `geraete_sperren`), über
    `setzeVeralteteClaimsZurueck()`: Präfix + `zzz` (zurückgesetzt), Präfix ohne Rest (zurückgesetzt), Präfix + ISO-Form mit
    `T` (zurückgesetzt, neu), Präfix + Zeitstempel älter als die Frist (zurückgesetzt), Präfix + frischer Zeitstempel (bleibt),
    Endzeitstempel ohne Präfix (bleibt), Leerstring (bleibt), NULL (bleibt), ein anderes Studio mit Präfix + `zzz` (bleibt).
    Zeitstempel hinter dem Präfix ausschliesslich in SQL erzeugen
    (`to_char((now() - … ) AT TIME ZONE 'Europe/Berlin', 'YYYY-MM-DD HH24:MI:SS')`, Hausmuster
    `test_feature_defekt_mail_claim_uebergang.js:62`), nie mit `toISOString()`.
  - Mindestens Präfix + `zzz` zusätzlich über `wiederholeOffeneDefektMails()`: Defekt (jünger als 7 Tage, älter als 60 min,
    Empfänger gesetzt, Mail gestubbt) → zurückgesetzt, genau eine Mail, danach Endwert; zweiter Lauf: keine Mail. Sperre →
    zurückgesetzt, keine Mail.
  - Statisch: der reguläre Ausdruck der Zeitstempel-Form steht im Produktivcode (`core/`, `routes/`, ohne Tests und Kommentare)
    genau einmal, in der neuen Funktion; `routes/wartung.js` und `setzeVeralteteClaimsZurueck()` rufen sie auf.
- Für JEDE neue Zusicherung eine Gegenprobe: die Behebung zurückdrehen → der Test wird ROT; wieder herstellen → GRÜN. Beide
  Ergebnisse wörtlich melden.

### Meldung

Diff-Übersicht, Zählung der Aufrufer, Name und Signatur der neuen Funktion, geänderte Bestandszusicherungen (alt → neu),
Testausgaben wörtlich (Einzeltest, Gegenproben ROT/GRÜN), offene Punkte. Nichts ändern, was nicht zum Auftrag gehört.

---

## Durchführung (nicht Teil des Auftragstexts)

- Weg E: Executer, Arbeitsbaum `/workspace/gymdocu-ab-e` (Zweig `ab-e`), dazu die Hausregeln des Repos (volle Suite am Ende,
  Lint).
- Weg Q: `tools/bau-spur.js` mit `qwen3.8-max`, Arbeitsbaum `/workspace/gymdocu-ab-q` (Zweig `ab-q`), Auftrag = Abschnitt
  AUFTRAG wörtlich. Die volle Suite fährt danach der Haupt-Agent bzw. ein Executer-Prüflauf; Qwens Testcode wird VOR dem
  ersten Lauf ausserhalb der Sandbox gelesen (CLAUDE.md §1).
- Bewertung: beide Diffs ohne Herkunft an eine Lesespur (Kimi), Fragen: Fehler, Zusicherungen, die nicht rot werden können,
  Vollständigkeit gegen den Auftrag. Dazu mein eigenes Lesen der beiden Produktionsdiffs. Der bessere Diff geht als Beitrag
  weiter; der andere wird verworfen.
- Zählung in `BAU-LAEUFE.md`: Claude-Token Weg E (`subagent_tokens` der Agentenmeldung), Weg Q (Qwen-Kosten laut Werkzeug,
  dazu mein Mehraufwand für Lesen und Prüfen, geschätzt aus den Werkzeugaufrufen).
