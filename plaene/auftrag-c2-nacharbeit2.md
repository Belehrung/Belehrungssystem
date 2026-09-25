# Auftrag C2 Nacharbeit 2 (25.09.2026)

Grundlage: `plaene/diffpruefung-c2.md`, Abschnitt „Runde 2“ (C2R2-1..C2R2-9). Baum `/workspace/gymdocu-c2`, Zweig
`fix-c2-stille-fehler`, Kopf `2f1c569`. Mess-Skripte der Prüfspur: `scratchpad/c2cc2/` (m1–m14, Mutationen M1–M14) —
vor dem Bau gegen deinen Stand (muss das gemeldete Verhalten zeigen), danach erneut; beides wörtlich. Einzeltests nur
gegen eine eigene DB (`gymdocu_c2n2_test`), nie `gymdocu_test`. Einordnung: nicht sehr komplex (Standard).

## 1. Quarantäne darf Offboarding, Export und Ernte nicht überleben (C2R2-1, blockierend)

- Abgelehnte PDFs FLÜCHTIGER Typen (Verbandbuch — alles, was `ops/gymdocu-verbandbuch-pdf-aufraeumen.js` erntet)
  werden gelöscht statt in Quarantäne verschoben. Begründung als Kommentar: die Datei war nie öffentlich, jede
  Registerzeile zeigt auf den öffentlichen Pfad, der nicht existiert — „im Zweifel nicht löschen“ schützt hier nichts,
  und die Datei enthält Gesundheitsdaten.
- `deprovisionStudio()` (`core/provisioning.js:~712`) löscht zusätzlich `PDF_ROOT/_quarantaene/<id>` — mit derselben
  Pfadprüfung wie für `PDF_ROOT/<id>`; fremde Studios bleiben unberührt.
- Der DSGVO-Export (`core/export-studio.js`) nimmt die Quarantäne NICHT mit (kein ausgeliefertes Dokument) — das
  steht als Kommentar dort.
- Altersernte für `_quarantaene` (älter als 30 Tage) im BESTEHENDEN täglichen Aufräumlauf des App-Prozesses; findest
  du keinen passenden, Rückfrage statt eines neuen Crons. Jede geerntete Datei wird gezählt und über `melde()`
  gemeldet (Quarantäne heißt: jemand muss hinsehen).
Pflichttests: Verbandbuch-Ablehnung hinterlässt 0 Dateien (Temp und Quarantäne); Deprovision entfernt
`_quarantaene/<A>` und lässt `_quarantaene/<B>` stehen (zwei Studios); Export enthält keine Quarantäne. Je Gegenprobe.

## 2. Temp-Reste (C2R2-2)

- Scheitert Strom oder Rendern VOR `finalize()`, entfernt die Engine die `.tmp-`-Datei selbst (nicht gelöscht wird
  eine Datei, auf die eine Registerzeile zeigt — eine Temp-Datei ist das nie).
- Nach Prozesstod: Altersernte `.tmp-*` älter als 24 h im selben Aufräumlauf wie §1, gezählt und gemeldet.
- `core/export-studio.js`: `fs.cpSync` filtert `.tmp-*`.
Pflichttests: m13 der Prüfspur (3→6→7) wird 1→1→1 bzw. 0-Reste; Export-Fixtur mit `.tmp-`-Datei. Gegenproben.

## 3. bezirk-export: Pfade aus der Engine, nicht aus einer zweiten Tabelle (C2R2-3)

- `finalize()` hängt an den Ablehnungsfehler, wo die Datei geblieben ist (`e.tempPfad` bzw. `e.quarantaenePfad`,
  oder nichts, wenn §1/§2 gelöscht haben). `routes/bezirk-export.js` räumt genau diese Pfade; die Tabelle `ordner`
  und `aufraeumPfade` entfallen.
- Ein `existsSync → null`-Zweig, der einen fehlenden Ergebnispfad als „nichts zu tun“ behandelt, wird ein Fehler.
Pflichttests: M6 und M6c der Prüfspur werden ROT.

## 4. Testlücken (C2R2-4) und kleine Punkte (C2R2-5, -7, -8)

- Je ein Fall mit Gegenprobe für: Totalausfall-Mail; archiv `?ok` bei Teilfehlschlag; `intern`-Argument;
  Spülplan-Text; Entdoppelung `parseConfig`; Spülplan-Kachel/-Rahmen; Signatur-Quelle. Ziel: M3–M12 der Prüfspur ROT.
- C2R2-5: `_konfigUnlesbar` bis in die Hub-Kachel durchreichen (Hinweis „Konfiguration unlesbar“) und testen.
- C2R2-7: Hat `melde()` eine `studioId` im Kontext, gehört sie in die Signatur (neben die Quelle); Kommentar in
  `core/error-tracker.js` an das echte Verhalten anpassen; Test „gleicher Modulfehler in zwei Studios → zwei Meldungen“.
- C2R2-8: Kommentar `_quarantaene/<Studio>/<Typ>`; der Verbandbuch-Ernter überspringt Ordner mit `_`-Präfix, Test mit
  vorhandenem `_quarantaene` (der Riegel „keinen einzigen Studio-Ordner“ muss dabei weiter greifen).

Nicht in diesem Auftrag: C2R2-6 (→ C2-S7), C2R2-9 (→ Sammelliste).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab — und bleibt nach deiner Änderung irgendeine Datei eines
Studios nach dessen Deprovisionierung auf der Platte?

-- Ende des Auftrags --
