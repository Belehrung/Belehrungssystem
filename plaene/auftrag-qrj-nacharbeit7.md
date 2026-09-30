# Auftrag QR-J Nacharbeit 7 (30.09.2026, Fassung 1)

Grundlage: Diffprüfung Runde 7 von `66c0601` (nach master-Merge `7b1a49a`): Lesespur `scratchpad/qrjr7/antwort-lese.txt`
(R7-L1…L9), ausführende Spur `scratchpad/qrjr7/cc/befunde.md` (B1…B9, Skripte daneben). Nachgemessen in
`plaene/diffpruefung-qrj.md` (Runde 7). Baum `/workspace/gymdocu-qrj`, Zweig `fix-qrj-journal-reparatur`, Kopf `7b1a49a`.
Einordnung: sehr komplex (Fortsetzung desselben Agenten) — mehrere Lesergeln, die einander bedingen, und jede
Lockerung kann eine unwiderrufliche Doppelvergabe freigeben, die im Test grün aussieht.

Vor dem Bau die genannten Reproduktionen gegen `7b1a49a` wiederholen (müssen das gemeldete Verhalten zeigen), danach
erneut — beides wörtlich.

## §1 Korrektur-Bruchstück wird gelesen wie ein Chargen-Abschnitt (B1, B3, B4 — gemessen: Doppelvergabe)

Meine Vorgabe in N6 („Kürzeres ({"ty) bleibt Freitext", „Kandidat alle", „nr_von/nr_bis werden NICHT gelesen“) war
die Ursache; sie gilt nicht mehr.
1. **Erkennung (B1):** fail-closed ab Länge 3 — jeder getrimmte Abschnitt mit Länge ≥ 3, der ein Präfix von
   `{"typ` ist oder damit beginnt, ist ein Korrektur-Bruchstück, ausser der bestehenden f/v-Regel. `{` und `{"`
   bleiben wie heute (Anfang von `{"charge_id":`). Gemessen: Riss nach 3/4 Byte → `verwerfen` angenommen, S vergab
   1003010–1003014 in 1003010–1003109. J7-Zusicherung „kürzer bleibt Freitext“ fachlich umstellen.
2. **Kandidat (B3):** aus `studio_id` des Bruchstücks nach derselben Regel wie `kandidatenAus` (Komma = genau;
   unabgeschlossen am Ende = Präfix, führende Null = alle; sonst alle). Grund: die Nummernräume sind je Studio; das
   Bruchstück dokumentiert Aufkleber GENAU dieses Studios. Gemessen: drei Wege gaben S trotz lesbarem Studio frei
   (T korrigiert mit `--uebrige-nicht-betroffen`; T korrigiert und gibt frei; `--eigentuemer=99999
   --eigentuemer-unbekannt`). Nach der Änderung müssen alle drei für ein genau-S-Bruchstück abgelehnt werden wie
   bei einer Chargenzeile — messen, nicht annehmen.
3. **Untergrenze (B4):** `nr_von`/`nr_bis` des Bruchstücks werden nach der Chargen-Feldregel gelesen (Komma =
   abgeschlossen) und gehen wie `gelesenesNrBis` einer Chargenzeile in die Untergrenze (d) der Korrektur dieses
   Abschnitts ein. Gemessen: `--bis=1041049` statt 1041109 angenommen, S vergab 1041050–1041054.
4. Der Hinweistext (`korrekturBruchstueckHinweis`) nennt ab jetzt die gelesene Spanne als Mindestwert und die
   REIHENFOLGE (B6): zuerst das Bruchstück korrigieren, dann die Korrektur der Zeile Z wiederholen.
5. Wo der Weg-Text für genau/Präfix-Bruchstücke jetzt den Wegen der Chargenzeile entspricht, eine Stelle, nicht zwei
   (keine zweite Textkopie).

## §2 Frischprüfung in `befehlVerwerfen` (R7-L1 = B2)

Unter dem Lock denselben Erledigungsstand-Vergleich wie `befehlFreigeben` (`:1474`) und die (v)-Bedingung „Zeile trägt
eine Korrektur“ frisch wiederholen. Test über `vorFrischpruefungHook`-Muster (nebenläufige Korrektur zwischen Prüfung
und Lock) → Abbruch, nichts geschrieben; Gegenprobe ohne den Vergleich → ROT.

## §3 Nachher-Lesen in `befehlKorrigieren` (R7-L2 = B5)

`try/catch`: ein Lesefehler nach dem COMMIT macht aus dem geschriebenen Erfolg keinen Fehlschlag (Rückgabe
`geschrieben: true`, Logzeile „Zeilennummer der Korrektur nicht lesbar — die Korrektur ist geschrieben“). Test mit
werfendem Leser (gemessen per `preload_wirft.js` der Prüfspur).

## §4 Texte und Randfälle

- R7-L3: (k)-Text für das Bruchstück nennt `--studio=<subdomain>` im Eigentümer-Befehl.
- R7-L4: eine (Bestands-)`keine_aufkleber`-Erklärung, die laut Leser nicht trägt, blockt `--eigentuemer` nicht.
- R7-L5: `widerlegendeZeilen` zählt nur Abschnitte, in denen das Verwerfen ohne Widerlegung trüge.
- B7 (= R7-L9): `wegFuer` nennt `verwerfen` nicht, wenn die Zeile irgendeine Korrektur trägt (dieselbe Bedingung wie (v)).
- B8: der (v)-Text unterscheidet Korrektur-Bruchstück und Freigabe-/Verwerfen-Bruchstück mit angeklebter Charge.

## §5 Tests

- R7-L7: `test_feature_qr_journal.js:2808` mit `instanceof` statt `.message` am möglichen `null`.
- B9: literale Fälle für den Präfixrand `{"typ":"freigabeX` (R64–R66), für „Freigabe ohne Korrektur trägt nicht für
  ein Korrektur-Bruchstück“ (R26, heute nur Zufallsstrom), die Texte von (v) und der Widerlegt-Logzeile (R41–R43,
  R48, R52, R53) und den Schreibfehler-Pfad der Freigabe (R55).
- Jede neue Zusicherung mit Gegenprobe (ROT/GRÜN wörtlich); die Mutationsliste der Prüfspur (`qrjr7/cc/liste*.json`,
  `mut.js`) auf dem neuen Stand erneut fahren und die Überlebenden benennen.

## Nicht in diesem Auftrag (Sammelliste)

K04–K14 (Vollständigkeitsregeln des Lesers für Felder, die die Stichprobe nie beschädigt — Bestand), QJ6-MU31 (= R7-L6).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht, den es vorher nicht gab? Insbesondere: (a) gibt es nach §1 noch einen Riss einer
Korrekturzeile, der ohne Korrektur mit Spanne ≥ der gelesenen freigegeben werden kann; (b) wird ein Studio frei, das
vorher gesperrt war, und ist das begründet (§1.2 gibt Nicht-Kandidaten frei); (c) entsteht eine Sackgasse (Fuzz der
Prüfspur `qrjr7/cc/sack.js` erneut fahren)?

-- Ende des Auftrags --
