# Diffprüfung Sperrordnung (`auditTx`) — `f4c0f07..d90c8d5`

Stand 23.09.2026. Lesespur `gpt-6-sol` (Diff + Umkreis, 66 Lesungen,
11,10 $). Spalte „getragen" = Messung des Haupt-Agenten. Ausführende
Claude-Spur (Mutationen, 152 Werkzeugaufrufe) unten.

## Lesespur

| # | Schwere | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| L1 | blockierend | Rotation öffnet `auditTx([])`, L entsteht erst durch `sperreStudio(t, id)` (`ops/schluessel-rotieren.js:209`) VOR dem `FOR UPDATE` (:214-219). Diese Ordnung bewacht niemand — die Zeile hinter das `FOR UPDATE` geschoben, bleiben (a)–(e) und die Laufzeitproben grün | Zeilen gelesen; `sperreStudio` prüft nur die Reihenfolge zwischen Studio-IDs | ja |
| L2 | mittel | Inventur zählt `auditTx([])` sofort als Ersterwerb von L | `test/helfer/auditlock-inventur.js:162,204-207` | ja |
| L3 | mittel | Probe-Regex für „A hat N genommen" (`test_feature_auditlock_ordnung_nebenlaeufigkeit.js:239`) trifft mit der zweiten Alternative auch den Tagesschlüssel (`routes/module.js:2868`) — Entfernen des N-Griffs bleibt grün | Regex und Zielzeilen gelesen | ja |
| L4 | gering | „gleiche ID → No-op" misst keinen No-op (Advisory-Locks sind wiedereintrittsfähig) | `core/integritaet.js:161`, Test `:194-196` | ja |
| L5 | mittel | Frühausstiege in `core/korrekturen.js:880-884` / `core/korrektur-pdf.js:140-144` antworten ohne L, während Retention unter L löscht | fällt: die Antwort beschreibt einen Stand, der zum Lesezeitpunkt committet war; eine Löschung danach ist regulär und erzeugt keine falsche Datenlage | nein |
| L6 | mittel | Rotation hält alle Studio-Locks bis zum Ende einer Gesamttransaktion; Bestellversand verschickt vor `auditTx` | Kosten, kein Fehler: Rotation ist ein Wartungsvorgang mit geforderter Gesamtatomarität; Bestellversand hat bereits die „nicht erneut senden"-Seite. Kommt auf `offene-befunde-sperrordnung.md` (Betrieb: Rotation nur im Wartungsfenster) | als Kosten |

## Ausführende Claude-Spur

Kein blockierender Befund; jede Mutation an `auditTx`, `auditAppend`, `db.tx` wurde rot (M1–M7,
S1–S5, Paar-3-Gegenprobe mit echtem 40P01). Laufzeitwürfe im Bestand: 0.

| # | Schwere | Befund | Messung der Spur | eigene Nachmessung |
|---|---|---|---|---|
| B1 | mittel | Verschachtelte `auditTx` hängt unbegrenzt (kein Wurf, kein 40P01, kein `lock_timeout`) | Probe: nach 5013 ms wartend auf `pg_advisory_xact_lock`; Bestand 0 | `core/integritaet.js:133-148` gelesen: keine Prüfung auf offene Tx — trägt |
| B2 | mittel | Inventur listet nie ein Schreib-SQL: `sqlKlasse` bekommt das Literal samt Anführungszeichen, Regex ist verankert | Lauf `--vorher f4c0f07`: 0 Schreibeinträge | `test/helfer/auditlock-inventur.js:77,97-99` gelesen — trägt |
| B3 | gering | = L3; erste Alternative tot, weil die Hülle keine Parameter aufzeichnet | N-Lock entfernt: EXIT 0, 41/0 | deckt sich mit L3 |
| B4 | gering | Multimengen-Vergleich (a) ohne Fixtur | `if (false && …)`: EXIT 0, 36/0 | Messung übernommen |
| B5 | gering | Wächter sieht nur `.tx(` über Bezeichner; Alias-/`.call`-/Member-Helfer-Formen `befunde=[]` | sechs Formen gemessen; alle Alias-Formen werfen zur Laufzeit | Messung übernommen |
| B6 | gering | Zuweisung an den Tx-Parameter (`t = db`) unerkannt; Laufzeitwurf kommt NACH Pool-INSERTs → Zeilen ohne Audit | statisch 36/0; Laufzeit EXIT 1, 0 Audit-Zeilen | Messung übernommen |
| B7 | gering | `test_feature_seil_freigabe_lock_reihenfolge.js` umhüllt den Helfer selbst mit `auditTx` — der Lock kommt vom Test | Produktions-Defekt → Test 7/0 grün (andere Riegel rot) | Messung übernommen |
| B8 | gering | Kommentar „N5c in (b)/(c) aufgegangen" stimmt nur teilweise; `auditTx([])` bindet das Studio nicht | statisch 36/0, nur Signatur-Test rot | fällt mit L1 (leere Liste verboten) |

## Behebung (an denselben Executer)

- L1/L2: Rotation liest die Studio-IDs VOR der Transaktion und öffnet `auditTx(alleIds)`; leere Liste in `auditTx` verboten (Wurf); `sperreStudio` entfällt, falls danach kein Aufrufer mehr bleibt. Inventur zählt nur eine nicht-leere Liste als L.
- L3: Probe prüft den Schlüsselparameter `nachtrag:<studio>:seilkontrolle`, nicht jedes `hashtext`.
- L4: Anweisungszähler vor/nach dem Gleich-ID-Aufruf vergleichen (entfällt mit `sperreStudio`).
- B1: `auditTx` wirft `AUDIT_TX_IN_TX`, wenn `db.offeneTransaktion()` gesetzt ist; Laufzeitfall.
- B2: Literal-Begrenzer abstreifen (Wert bzw. Template-Quasis); Selbsttest mit bekannter Schreibanweisung.
- B4: Fixtur wie f8 in FIXTUREN.
- B5: `tx` als Eigenschaft ausserhalb eines Aufrufs = (a)-Fehler; Member-Aufrufe von Helfern in (c)/(d) konservativ als Fehler; doppelte Funktionsnamen als Fehler; Kopfkommentar an das Gemessene anpassen. Fehlalarme im Bestand: 0 verlangt.
- B6: Zuweisung an Callback-/Helfer-Parameter = (b)-Fehler, Fixtur.
- B7: T2 über die Route fahren; Kopfkommentar berichtigen.
- B8: `auditTx`-Erstargument als leeres Array-Literal statisch verboten (zusätzlich zum Laufzeitwurf aus L1); Kommentar berichtigen.
