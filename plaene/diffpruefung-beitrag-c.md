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
