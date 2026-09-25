# Auftrag C3b Nacharbeit 2 (25.09.2026)

Grundlage: `plaene/diffpruefung-c3b.md`, Abschnitt „Runde 2“ (C3b2-1..C3b2-7). Baum `/workspace/gymdocu-c3b`, Zweig
`fix-c3b-replik-upsert`, Kopf `9ef94f1`. Mess-Skripte der Prüfspur: `scratchpad/c3br2/cc/` (`m1-permanent-matrix.js`,
`m2-nach-commit.js` M2a–M2d, `m7-riegel-dbfehler.js`, `harness.js`, `gp.py` mit X1–X16 und F1/F2) — vor dem Bau gegen
deinen Stand (muss das gemeldete Verhalten zeigen), danach erneut; beides wörtlich. Einzeltests nur gegen eine eigene DB
(`gymdocu_c3bn2_test`). Einordnung: nicht sehr komplex (Standard) — die Behebungen sind von der Prüfspur schon als
Mutation gemessen. Keine neue Migration.

Die Status-Regel aus Nacharbeit 1 (`permanent` nur bei fehlender oder `dead`-Zeile) ist ANGENOMMEN (Fuzz r3 von der
Prüfspur reproduziert: 0 Verletzungen); diese Nacharbeit verfeinert sie nur.

## 1. Nachlesen nach dem COMMIT darf keinen toten Job erzeugen (C3b2-1, C3b2-3)

- Wirft `zeileJetzt` nach dem COMMIT (DB-Fehler), wird das geloggt (`console.warn`, mit Replica-ID und Studio) und als
  „keine Aussage“ behandelt: `processReplica` gibt die committete Zeile zurück, der Job endet `succeeded`. Einen in
  diesem Moment verpassten Upsert deckt der Reaper wie das benannte Restfenster (Kommentar mit Verweis).
- Wurf `ReplikatUeberholtError` auch dann, wenn der Hash gleich ist, die Zeile aber nicht mehr `succeeded` ist (ABA
  H1→H2→H1; nach dem eigenen COMMIT ändert nur ein Upsert mit anderem Hash den Status) — Vorschlag F1 der Prüfspur.
- Pflichttests: M2b (DB-Fehler im Nachlesen beim letzten Versuch → Job `succeeded`, Health ok, Zeile `succeeded/H1`);
  M4 (ABA → Job `pending`, nächster Lauf `succeeded`); je Gegenprobe ROT mit Zahl.

## 2. Eigene Lease bleibt eigene Lease (C3b2-2)

`zeileJetzt` liest zusätzlich `claim_nr`. Im permanenten Fehlerweg bleibt `permanent` stehen, wenn die Zeile fehlt, `dead`
ist ODER `running` mit der EIGENEN `claim_nr` (das Riegel-UPDATE ist dann selbst gescheitert). Pflichttest `m7`
(Riegel-UPDATE wirft, Fehler „Backend nicht aktiv“ → Job `dead/1`, Health degraded wie vor Nacharbeit 1); dazu
`running` mit FREMDER `claim_nr` (bleibt nicht permanent). Gegenprobe: `claim_nr`-Vergleich entfernt → ROT.

## 3. `planeReplikationsJob`: kein Fehlalarm bei richtigem Zustand (C3b2-4)

Ist der Job nach dem verlorenen `requeue` beim Nachlesen terminal, wird `requeue` EINMAL wiederholt (dieselben
Parameter); erst wenn auch das scheitert, wirft es. Das heilt zugleich „Job terminal, Zeile `pending`“. Kommentar
`:209` berichtigen (die Lage ist erklärt: der Job lief dazwischen durch). Pflichttest M5 (Job läuft zwischen verlorenem
`requeue` und Nachlesen durch → kein Wurf, Ergebnis literal); Gegenprobe X5 (`if (false)`) → ROT.

## 4. Überlebende Mutationen (C3b2-7)

Je ein Test, der ROT wird unter: X2 (`if (!jetzt || …)` am Nachlesen nach dem COMMIT — Weg 2 nach dem COMMIT darf keinen
toten Job ohne Zeile erzeugen), X16 (`pending` mit gleichem Hash im permanenten Fehlerweg), X4 (`running`/`failed`
ausgenommen), X3 (`bleibt = false` im catch — DB-Fehler beim Nachlesen bleibt permanent), X1 (Mandantenriegel in
`zeileJetzt`: ein Test mit ZWEI Studios und gleicher Replica-ID-Lage, nicht über den SQL-Text). Die Ein-Puffer-Wache
zählt zusätzlich `fs.open`, `fs.openSync`, `fsP.open` auf den Quellpfad (X8: ungezähltes Vorab-Lesen über
`fsP.open().readFile()` muss ROT werden). Stellen und Mutationstexte: `scratchpad/c3br2/cc/gp.py`.

## 5. Texte (C3b2-5, C3b2-6)

- `core/storage-replica.js:264` „täglicher Reaper“ → stündlich; `docs/STORAGE_REPLICA.md:33` auf die Status-Regel;
  Kommentar zur Status-Regel: bei fremder `running`-Lease endet der Job `succeeded`, erst der Reaper setzt `dead`.
- `docs/STORAGE_REPLICA.md` benennt C3b2-5: ein Überholen im LETZTEN Job-Versuch hinterlässt einen toten Job neben einer
  `pending`-Zeile, Health „degraded“, bis der Reaper sie belebt (≤ ~75 min) — ehrlicher Alarm, heilt selbst.
- `test_feature_audit_batch3_static.js:21`: entweder den stündlichen Takt prüfen (Muster auf `cron.schedule('15 * * *
  *'` mit `requeueStale()` im selben Block) oder den Text auf das zurücknehmen, was geprüft wird.

Nicht in diesem Auftrag: C3b2-8 und das Restfenster (Sammelliste `plaene/offene-befunde-c3b.md`).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab (Job `succeeded` trotz nicht nachlesbarer Zeile; wiederholtes
`requeue`) — und kann danach (a) eine Zeile `succeeded` mit anderem Fernkopie-Inhalt stehen, (b) eine richtige
Fernkopie gelöscht werden, (c) eine Zeile länger als eine Reaper-Periode ohne Job bleiben, (d) ein Job kreisen?

-- Ende des Auftrags --
