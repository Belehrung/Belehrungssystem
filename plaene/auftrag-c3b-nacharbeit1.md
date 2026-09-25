# Auftrag C3b Nacharbeit 1 (25.09.2026)

Grundlage: `plaene/diffpruefung-c3b.md`, Runde 1 (C3b-1..C3b-6). Baum `/workspace/gymdocu-c3b`, Zweig
`fix-c3b-replik-upsert`, Kopf `1d9b08d`. Messskripte der Prüfspur: `scratchpad/c3bcc/` (r1-offen-nach-abschluss.js,
r2-veraltet-budget.js, r3-verschraenkungen.js, r4-plane-rennen.js, r9-ein-puffer-folge.js, gegenproben*.py) — vorher
gegen deinen Stand (muss das gemeldete Verhalten zeigen), danach erneut; beides wörtlich; r3 danach mit 0 Verletzungen
und der Positivkontrolle. Einzeltests nur gegen `gymdocu_c3b_test`. Einordnung: sehr komplex (unverändert, derselbe
Zustandsraum).

## 1. Kein Job-Verlust nach dem Abschluss (C3b-1)

- Nach erfolgreichem 1c (und 1d) den Hash der Zeile frisch nachlesen; weicht er von `sollHash` ab (Upsert während des
  Abschlusses), einen NICHT-permanenten Wurf auslösen, damit `queue.retry` den Job wiederholt und den neuen Inhalt lädt.
  Das `succeeded` des alten Inhalts bleibt stehen, bis der neue es ersetzt — prüfen und begründen, dass der Wurf nach
  dem COMMIT keinen Aufräumzweig auslöst (phase `nach_abschluss`), der die gerade committete Datei anfasst.
- Im permanenten Fehlerweg den Hash auch nachlesen, wenn der Riegel eine Zeile getroffen hat (R1b).
- `requeueStale` stündlich statt täglich (server.js), Stillstandsschwelle unverändert; die Kommentare „kommt über 1c/1f
  wieder“ berichtigen.
Pflichttests: R1 und R1b über die echten Wege (Upsert zwischen 1c-COMMIT und `queue.succeed` bzw. zwischen Riegel und
`deadLetter`) → Job nicht terminal bzw. wiederbelebt, Endzustand `succeeded/H2` mit Fernkopie H2, literal.

## 2. Ein-Puffer-Wache über alle Lese-Schnittstellen (C3b-2)

Der Test zählt Lesezugriffe auf den Quellpfad über `fs.readFileSync`, `fs.readFile`, `fsP.readFile`,
`fs.createReadStream` (und `integritaet.dateiHash`), Soll genau 1; dazu eine Variante, die die Datei VOR dem ersten Lesen
tauscht. Gegenproben C1b und C2 aus dem Prüfbericht → ROT.

## 3. `planeReplikationsJob` nachlesen statt annehmen (C3b-3, C3b-4)

Nach einer `DedupeConflictError` aus `requeue` den Job erneut nachschlagen: offen → „offen“ (mit dem FRISCHEN Job im
Rückgabewert), fehlt → laut werfen, terminal → laut werfen. Tests: R4a (Verlierer des Rennens → offen, genau ein Job),
R4b (Konflikt ohne Zeile → Wurf), R4c (Job zwischen Nachschlagen und requeue gelöscht → Wurf), DB-Fehler im `requeue`
→ Wurf, `TerminalDedupeError` mit festem `runAfter` → Wiederbelebung. Je Gegenprobe (C3, C4, C5 aus dem Bericht) ROT.

## 4. Texte (C3b-5)

S26-Kommentar (`claim_nr`), Veraltet-Logzeile (beim letzten Versuch: „Job danach dead, der nächste Upload belebt ihn“),
Kommentar „bis zu fünf Job-Versuche“ an die gemessene Zahl anpassen (R7) oder die Aussage ohne Zahl formulieren.

Nicht in diesem Auftrag: C3b-6 (DB-INIT, Arbeitsplan).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht durch den Wurf nach dem Abschluss, den es vorher nicht gab (ein Job, der nach einem
erfolgreichen Upload scheitert) — und wer liest ihn falsch (Health, Warteschlangen-Metriken, Alarm, Budget des Jobs)?
Bleibt irgendeine Zeile länger als eine Reaper-Periode ohne Job?

-- Ende des Auftrags --
