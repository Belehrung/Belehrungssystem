# Auftrag A/B Qwen gegen Executer (03.10.2026): C6D3-4 und C6D2-5

Zweck: Messung nach CLAUDE.md Abschnitt 5 — derselbe Auftrag WÖRTLICH an zwei Bauwege (Executer und Bauspur mit Qwen), je ein
eigener Arbeitsbaum ab GymDocu master `bb7e7bc`. Bewertet wird blind (Diffs ohne Herkunft), dazu Claude-Token beider Wege und
Qwen-Kosten in `BAU-LAEUFE.md`.

Einordnung (vor dem Auftrag): nicht sehr komplex. Zwei Stellen mit je einer klaren Bedingung; die Falle ist eine Zusicherung,
die nicht rot werden kann (Punkt 1: der heutige catch ist unerreichbar).

Der Text unter „AUFTRAG“ geht unverändert an beide Wege.

---

## AUFTRAG

Repo GymDocu, Stand master `bb7e7bc`. Zwei kleine Behebungen, ein gemeinsamer neuer Test.

### 1. Magicline-Status: ein Lesefehler darf nicht wie „nicht verbunden“ aussehen (C6D3-4)

Befund: `routes/bezirk-magicline.js`, `GET /` (Zeilen 28-35) antwortet bei einem Fehler mit 500, ohne ihn zu melden.
Nachgesehen: der catch ist heute UNERREICHBAR. `getMagiclineStatus()` (`routes/webhooks.js:588`) liest alle Werte über
`getConfig()` (`core/db.js:3267`), und `getConfig()` verschluckt jeden Datenbankfehler zum Fallback. Ein Datenbankausfall
erscheint deshalb als `aktiv:false` („Nicht verbunden“), nirgends gemeldet.

Soll:
- `getMagiclineStatus()` liest über `getConfigStrict()` (`core/db.js:3282`, wirft bei einem Datenbankfehler). Gleiche Werte,
  gleiche Fallbacks wie heute, wenn kein Fehler auftritt.
- Alle drei Aufrufer behandeln den Wurf sichtbar:
  - `routes/bezirk-magicline.js` `GET /`: `melde(e, req, 'bezirk-magicline:status')` (im eigenen try/catch wie bei
    `POST /verbinden` in derselben Datei), Antwort bleibt `500 { error: 'fehler' }`.
  - `routes/bezirk-magicline.js` `POST /verbinden`: hat das Melden schon (`'bezirk-magicline:verbinden'`), prüfen, dass es
    auch einen Lesefehler aus `getMagiclineStatus()` trifft.
  - `routes/api-admin.js:106`: heute `mlStatus = null` → der ganze Magicline-Kasten verschwindet von der Seite. Soll: melden
    (`'api-admin:magicline-status'`) und statt des Kastens einen kurzen Hinweis zeigen, dass der Magicline-Status gerade nicht
    gelesen werden konnte (Design-Token aus `core/design.js`, keine neuen Farbwerte). Die übrige Seite bleibt wie heute.
- Nichts anderes in `routes/webhooks.js` ändert sich (die übrigen `getConfig()`-Aufrufe bleiben).

### 2. Wiederholer: Präfix plus Unsinn ist ein Fremdwert (C6D2-5)

Befund: `setzeVeralteteClaimsZurueck()` (`core/defekt_mailer.js:257`) vergleicht Text. Steht hinter dem Präfix
`MAIL_CLAIM_PRAEFIX` etwas, das KEIN Zeitstempel ist (`'wird gesendet seit zzz'`), ist es als Text grösser als jede Uhrzeit
und wird vom Wiederholer NIE zurückgesetzt. Der Trainer-Knopf in `routes/wartung.js` behandelt diesen Fall schon richtig
(seit C6-D2 Nacharbeit 1, A3, `FRISCHER_CLAIM_SQL` bei Zeile ~2127: Präfix mit einem Rest, der nicht die Form
`YYYY-MM-DD HH:MM:SS` hat, ist ein Fremdwert und wird zurückgesetzt).

Soll: der Wiederholer setzt zurück, was Präfix hat UND (dessen Rest NICHT die Zeitstempel-Form hat ODER älter als die Frist
ist). Ein Wert OHNE Präfix (Endzeitstempel, leer) bleibt unberührt, ein frischer Claim (Form stimmt, jünger als die Frist)
bleibt stehen. Die Formprüfung steht nur an EINER Stelle (CLAUDE.md des Repos: dieselbe Aussage an zwei Orten): eine
gemeinsame Definition, die Mailer und `routes/wartung.js` benutzen (`core/` importiert nicht aus `routes/`). Kommentare im
Kopf von `core/defekt_mailer.js` und bei `FRISCHER_CLAIM_SQL` auf den neuen Stand bringen.

### Test

- EINE neue Testdatei `test_feature_c6_restpunkte_ab.js`, in `test/run.sh` registriert. Bestehende Tests dürfen ergänzt
  werden, wenn eine Zusicherung dort besser hinpasst.
- Fehler über den ECHTEN Weg herstellen, wo es geht (z. B. ein `req.studioId`, an dem die echte Abfrage scheitert); wo nicht,
  ein Stub mit einem Satz Begründung im Test.
- Punkt 1: für `GET /` und `POST /verbinden` je Fehlerfall (500, genau eine Meldung mit der richtigen Quelle) und
  Positivkontrolle (200, keine Meldung, Werte wie vorher). Für `routes/api-admin.js`: Hinweis statt Kasten, Meldung; ohne
  Fehler der Kasten wie vorher. Für `getMagiclineStatus()` selbst: ohne Fehler dieselben Werte wie vorher (wörtlich
  eingetragene Erwartung).
- Punkt 2: mindestens diese Werte in BEIDEN Tabellen (`geraete_defekte`, `geraete_sperren`), jede Bedeutung mit einem
  eigenen Datensatz: Präfix + `zzz` (zurückgesetzt), Präfix + Zeitstempel älter als die Frist (zurückgesetzt), Präfix +
  frischer Zeitstempel (bleibt), Endzeitstempel ohne Präfix (bleibt), NULL (bleibt), ein anderes Studio mit Präfix + `zzz`
  (bleibt — Mandantentrennung). Zusätzlich: der Trainer-Knopf-Weg in `routes/wartung.js` verhält sich unverändert (die
  bestehenden Tests dazu bleiben grün).
- Für JEDE neue Zusicherung eine Gegenprobe: die Behebung zurückdrehen → der Test wird ROT; wieder herstellen → GRÜN. Beide
  Ergebnisse wörtlich melden.
- Einzeltests nur gegen eine eigene Datenbank `gymdocu_ab_<kürzel>_test`, nie gegen `gymdocu_test`.

### Meldung

Diff-Übersicht, Testausgaben wörtlich (Einzeltest, Gegenproben ROT/GRÜN), offene Punkte. Nichts committen, was nicht zum
Auftrag gehört.

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
