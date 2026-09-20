# Diffprüfung Beitrag C — `routes/belehrungen.js`, S2/S3 (20.09.2026)

Zweig `beitrag-c-belehrungen-schreibreihenfolge`, Commit `61665d4` von
`master`/`74ace5a`. Papier: `plaene/auftrag-schreibreihenfolge.md`, §3b.

## Eigene Abnahme (vor den Befunden)

| | |
|---|---|
| Volle Suite | **`SUITE_EXIT=0`**, **0** `✗ FAIL`, keine Summenzeile mit FAIL > 0 |
| Dateizahl-Ritual | **347 = 347**, `diff` **EXIT 0** |
| Marker-Scan | **6**, alle in `docs/offene-befunde-31-08-2026.md` |
| Arbeitsbäume | alle drei sauber |
| Push | Remote `61665d4` = lokaler HEAD |

## Was ich am Diff selbst nachgemessen habe

* `t.run` liefert `client.query(...)`, also dieselbe Ergebnisform wie `db.run`
  samt `rowCount` (`core/db.js:445`) — `r.rowCount || 0` in `schalteAlleFrei`
  trägt in beiden Aufrufarten.
* `schalteAlleFrei` hat genau **zwei** Aufrufer: `:2089` (ohne `conn`, also
  Pool wie bisher) und `:2216` (mit `t`). Kein dritter im Repo.
* Beide Advisory-Lock-Griffe in `belehrungen.js` nehmen `[req.studioId]` und
  stehen als ERSTE Anweisung ihrer Transaktion (`:946`, `:2212`) — gleiche
  Reihenfolge, kein neuer Kreis.
* Die drei übrigen Schreibwege auf `belehrung_freischaltung` sind nachgemessen
  blankes Autocommit: `routes/admin/mitarbeiter.js:883`,
  `routes/belehrungen.js:2053`, `schalteAlleFrei` über `/freischalten-alle`.
* `test/run.sh` leitet `DOKUMENTE_DIR` und `BELEHRUNGEN_UPLOAD_DIR` je Lauf auf
  ein `mktemp -d` um, mit Abbruch bei Fehlschlag — der Wettlauftest schreibt
  also nicht in echte Produktionspfade.

## Prüfspuren

| Spur | Befunde | nach eigener Nachmessung getragen |
|---|---|---|
| `gpt-5.6-sol`, `xhigh`, Bündel **156.332 Token gezählt** (nicht geschätzt), 348 s, ≈ 1,46 $ | 7 | s.u. |
| eigene Diffprüfung | 4 | 4 |

Zwei Befunde fanden beide Spuren unabhängig (B8 ohne Zusicherung; die
widersprüchlichen Kommentare). Einen hatte nur sol (die Mandantenlücke im
P2-4-Test), zwei hatte nur ich (die fehlende Laufzeitmessung, die fehlende
ID-Wache).

## Die Befunde, jeder einzeln nachgemessen

### Was TRÄGT

| Nr | Spur | Schwere (Prüfer) | Eigene Messung |
|---|---|---|---|
| N1 | code-review | — | **REGRESS, beide Richtungen gemessen.** Einmalprobe gegen Wegwerf-DB, Request mit kaputter `studioId` (Fehler passiert nachweislich VOR jedem Schreibzugriff): neuer Stand HTTP 500, **0 → 1 Datei, bleibt liegen**; alter Stand HTTP 500, **0 → 0, aufgeräumt**. Ursache: die Nachsehe-Abfrage benutzt dieselben Parameter, die den ersten Fehler ausgelöst haben, scheitert deterministisch mit, und `catch (_) { darfWeg = false }` greift. `prepareValue(NaN) === "NaN"` gemessen; `test_feature_upload_fehlerbehandlung.js:317` fährt diesen Weg, jeder Suite-Lauf lässt seither eine Datei liegen |
| N2 | code-review **und** sol (unabhängig) | hoch | **trägt.** Ganzer Nachsehe-Block auf das alte `fs.unlink` zurückgedreht → **volle Suite `SUITE_EXIT=0`, 347 Dateien, 0 FAIL**, die drei neuen Dateien unverändert 25/0, 11/0, 11/0 |
| N3 | code-review (Verschärfung von sol) | hoch | **trägt, und es ist ein Live-Risiko.** `test/run.sh:328` leitet `TEST_ROLE` aus der LIVE-`DATABASE_URL` ab — auf dem Deploy-Gate ist `pg_stat_activity.query` also nicht maskiert, und die ungefilterte Abfrage kann echte Produktionsanfragen zählen |
| N4 | code-review | — | **trägt.** Gegen PostgreSQL gemessen: DEFAULT-Form `2026-09-20 05:34:54`, `CURRENT_TIMESTAMP`-Form `2026-09-20 03:34:54.144842+00`. Zwei Formate in einer TEXT-Spalte → die Z2c-Zusicherung „es ist die NEUE Generation" kann nicht fallen |
| N5 | code-review + sol#4 + eigene Messung | hoch | **trägt.** `inventar.push(\`${rel} \| ${tr.anweisung}\`)` ohne Zeilenanker, zwei byte-gleiche Einträge; `nurIst`/`nurErwartet` über `includes` können keine Vielfachheit zeigen. Dazu gemessen: Advisory-Lock hinter das UPDATE verschoben → Suite grün, die Position ist ungeprüft |
| N6 | code-review | — | **trägt.** `core/integritaet.js`: `return conn ? append(conn) : db.tx(append)` — ohne `conn` eine ZWEITE Poolverbindung auf denselben Advisory-Key. Kein Fehler, ein unentdeckbarer Hänger |
| N7 | beide Spuren | niedrig | **trägt**, sechs nachgemessene Kommentarfehler (darunter „1.200 Zeilen weiter unten" für eine Stelle 1.266 Zeilen DARÜBER, in einer 2.567-Zeilen-Datei) |
| N8 | code-review | — | **trägt.** `test/helfer/multipart-post.js` existiert und nennt `routes/belehrungen.js` im eigenen Kopf als vorgesehenen Aufrufer |
| N9 | code-review | — | **trägt**, beide Geschwisterdateien desselben Commits räumen auf, der Wettlauftest nicht |
| N10 | eigener Befund | — | Das Papier VERLANGTE die Laufzeitmessung; sie wurde ehrlich als nicht gemacht gemeldet |

### Was FÄLLT

| Nr | Spur | Behauptung | Messung |
|---|---|---|---|
| sol #3 | sol (hoch) | Die Mandantenlücke im P2-4-Test sei ungeprüft; `AND studio_id = $2` in der COUNT-Abfrage bleibe unbemerkt | **FÄLLT.** Mutation gefahren: `test_feature_audit_batch3.js:157-174` fängt sie (**23 PASS / 1 FAIL**, `✗ FAIL: Datei überlebt, solange Studio B sie noch referenziert`). Dort steht der echte mandantenübergreifende Fall mit Studio A und B. Seine BEOBACHTUNG war exakt richtig („lässt alle drei neuen Testdateien grün"), der SCHLUSS daraus nicht — die Datei lag nicht im Bündel, er konnte sie nicht kennen |
| sol #1 | sol (blockierend) | `pg_stat_activity` ohne `studio_id` verletze die Mandantenregel | **FÄLLT in diesem Teil** — ein Systemkatalog ist keine Mandantentabelle. Sein Behebungsvorschlag (Katalogabfragen entfernen, durch testlokale Barrieren ersetzen) hätte eine Referenz von AUSSEN gegen einen Selbstnachweis aus dem eigenen Datenfluss getauscht, also die Lage verschlechtert. Der Rest des Befunds trägt und ist als N3 aufgenommen |
| CR-6 (Teilaussage) | code-review | Der Diff verbreitere das Fenster zwischen `COUNT` und `unlink` um eine Rundreise | **FÄLLT.** Alt: SELECT → COUNT → unlink → UPDATE. Neu: SELECT → UPDATE → COUNT → unlink. Der Abstand COUNT→unlink ist unverändert. Das Rennen selbst ist echt und vorbestehend (`vorlage-${key}-${Date.now()}.pdf` ohne Zufallsanteil, gemessen) → offener Befund |

### Eigene Korrektur

Ich hatte sol #3 im Zwischenstand als „trägt, und den hatte ich NICHT" gemeldet — **das war vor der Messung und es war falsch.** Der Befund fällt. Dieselbe Regel, die ich am 20.09. selbst in die CLAUDE.md geschrieben habe: eine Mutation kann von einem ZWEITEN, unabhängigen Riegel gefangen werden, den man nicht kennt. Hier war es kein Riegel im Produktivcode, sondern eine Zusicherung in einer Datei, die ich nicht ins Bündel gelegt hatte.
