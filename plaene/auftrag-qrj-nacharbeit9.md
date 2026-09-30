# Auftrag QR-J Nacharbeit 9 (30.09.2026) — nur Zusicherungen

Baum `/workspace/gymdocu-qrj`, Zweig `fix-qrj-journal-reparatur`, Kopf `4f8450b`. Grundlage: Diffprüfung Runde 9,
ausführende Spur `scratchpad/qrjr9/cc/befunde.md` (Skripte und Beleg-Testblöcke daneben). Produktivcode bleibt
unverändert; jede neue Zusicherung muss die genannte Mutation ROT machen (Gegenprobe mit dem Mutationsskript der Spur,
Regeln wie immer) und unmutiert GRÜN sein. Einordnung: Standard. Planprüfung entfällt: jede Zusicherung ist durch eine
gemessene überlebende Mutation samt Beleg-Testblock festgelegt, die Gegenprobe ist die Mutation selbst.

1. **U4** (`tools/qr-journal.js` `untergrenzeAusBruchstuecken`, `reduce` Maximum): zwei spätere Bruchstücke derselben
   Zeile/desselben Studios mit verschiedenem `nr_bis` → `plan.untergrenzeKb` ist das MAXIMUM, `--bis` dazwischen wird
   mit (d) abgelehnt (Text literal). Mutation Maximum→Minimum → ROT.
2. **R3f** (Frischprüfung der Korrektur): Plan hat Untergrenze U1, zwischen Prüfung und Lock entsteht ein zweites
   Bruchstück mit U2 > U1 → Abbruch (Wurf literal „Plan: U1, jetzt: U2“), nichts geschrieben, Audit +0. Mutation
   „vergleicht nur Null/Nicht-Null“ → ROT.
3. **R4b/R4d** (Grösse unter dem Nummernraum-Lock gemessen): für Freigabe, Korrektur, Verwerfen UND `chargeAnlegen`
   je ein Fall — der Test hält den Lock, der Befehl wartet, eine fremde vollständige Zeile wird angehängt, Lock frei,
   dann Riss: die Meldung nennt die EIGENE Zeile, nicht die fremde (literal). Mutation „Grösse vor dem Lock gemessen“
   je Pfad → ROT (mindestens Freigabe und chargeAnlegen einzeln messen).
4. **R1i1**: vollständige Chargenzeile im Bereich (mit und ohne abschliessendes `"\n"`) → „VOLLSTÄNDIG“ (literal). Mutation
   `|| istChargenObjekt(o)` entfernt → ROT.
5. **chargeAnlegen** zusätzlich: älteres Bruchstück ohne Umbruch am Dateiende, Riss nach genau dem Vorspann → „nur ein
   Zeilenumbruch“ (literal), keine Charge (Rollback).

Bericht: je Punkt Testname, unmutiert/mutiert Zahlen wörtlich; beide QR-J-Testdateien; volle Suite (Aufruf laut
CLAUDE.md, Dateizahl-Ritual); `npx eslint .`; Marker-Scan.

-- Ende des Auftrags --
