# Planprüfung P4 Phase 2 (24.09.2026)

Material: Auftragspapier (Fassung 3, Nachtrag 3a, Phase 2), Regelmodul `f917c1d`. Zwei Lesespuren mit verschiedenen
Bündeln: DeepSeek mit Repo (10 Runden, 1,28 $ geschätzt), Kimi mit Bündel (1208 s). Normalpaarung.

| Nr. | Spur | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| PP4b-1 | DS 4c | `signatur_hash` wird über den EINGESCHICKTEN Wert gebildet; gespeichert wird künftig der kanonische → Hash passt nicht zur Zeile | gelesen `spuelplan.js:302-309` („bei Verifikation identisch verwenden“); kein automatischer Nachrechner im Repo | sollte — Hash über den gespeicherten (kanonischen) Wert |
| PP4b-2 | DS D5 / Kimi B5b | `core/signaturbild.js` zählt Sichtbarkeit und Echtheit weiter über Kanal 0 → rote Tinte: Regel „Tinte“, Server „leer“ | gelesen `:145-151`, `:202-210` | sollte — dieselbe Luminanzfunktion aus dem Regelmodul |
| PP4b-3 | DS D1 | Alpha wird ignoriert: transparentes Pixel (0,0,0,0) zählt als Tinte | Logik | sollte — Luminanz über Weiss zusammengesetzt |
| PP4b-4 | DS A2 | Offline-Nachzügler (E4, E11) von vor dem Deploy mit Punkt-Unterschrift → `validierung` → `konflikt`, nie wiederholt | gelesen `public/offline-queue.js:357-361`; Vorbild `sichtpruefung.js:2415-2432` (Altgeräte-Ausnahme) | sollte — Markerfeld der neuen Seite; fehlt es auf E4/E11, gilt nur Format/Deckel (+ Protokollzeile) |
| PP4b-5 | DS C4/C5 | Gegenproben (a)/(e) werden nicht rot, wenn Tests nur die erlaubte Grund-Menge prüfen (Rechteck fällt ohne Deckung als `punkt`) | Rechnung nachvollzogen | sollte — je Fixturdatei der EXAKTE Grund als Literal; Strich-Verhaltenstest diagonal |
| PP4b-6 | DS C6 | Schwellen aus dem Modul lesen = Test friert mit | gelesen | sollte — Literale |
| PP4b-7 | DS 1a | Bestehende Zusicherungen in `test_feature_signatur_verbrauch.js` (volle Rechtecke als „gültige Unterschrift“) werden rot | Liste gelesen | sollte — fachlich umstellen, Liste übernehmen |
| PP4b-8 | DS 3a | Wurf des neuen Helfers landet in route-eigenen `catch` → `intern()` + Alarm | gelesen `spuelplan.js:343` | sollte — Prüfung VOR dem try (P3-Muster), Fehlerklasse in der Positivliste |
| PP4b-9 | DS C2 / Kimi B5b | Luminanz (1a) hat keine Farbfigur; Gegenprobe (g) kann nie rot werden | gelesen | sollte — Farbfiguren (rot, blau, grün dunkel) in Validierung und Fixturen |
| PP4b-10 | Kimi B1 | Regel läuft synchron im Event-Loop; 16 MP blockiert alle Mandanten | `signaturbild.js:202-210` läuft SCHON HEUTE in JS über die Originalauflösung — neu ist nur der Mehraufwand | sollte — messen (16 MP realistisch + Worst Case, nach linearem Abgleich); über 250 ms → STOPP |
| PP4b-11 | Kimi B2 / DS D2 | Wandzeit-Obergrenze auf dem Deploy-Gate ist flatterhaft oder unempfindlich | Logik | sollte — Operationszähler `vergleiche ≤ c·laeufe` statt Wandzeit, kleines Worst-Case-Bild |
| PP4b-12 | Kimi B4 | Wurf aus `bewerteUnterschrift` → 500 + Alarm | Prämisse FALSCH: 16-bit-PNG liefert nach `flatten().raw()` 8 bit/3 Kanäle (gemessen: 36 Bytes für 4×3) | sollte — Wurf im Helfer als „nicht lesbar“ (400) |
| PP4b-13 | Kimi B6 | Offen, ob Sichtbarkeits-/Echtheitsprüfung bleiben | gelesen | Entscheidung: bleiben, auf Luminanz |
| PP4b-14 | Kimi B7 / DS B3 | `sharp().metadata()` ist async, `drawSignature` synchron | gelesen `pdf-engine.js:413-424` | sollte — synchroner Kopfleser (PNG-IHDR, JPEG-SOF), andere Formate „nicht darstellbar“ |
| PP4b-15 | Kimi B3 / DS A6 | „Formular bleibt erhalten“ gilt bei klassischen POSTs nicht | gelesen | Zusage einschränken: Server = keine Zeile, klare Meldung; Erhalt nur im Browser |
| PP4b-16 | Kimi B5a / DS C1 | „Server = Browser 2964/2964“ ist tautologisch | richtig | Papier berichtigt: Transport-/Determinismusprüfung, keine Abdeckung |
| PP4b-17 | DS A4 | Drei verschiedene Platzhaltertexte für nicht darstellbare Unterschriften; übergrosse Altbilder erscheinen künftig nicht mehr | gelesen `pdf-engine.js:422, 1164, 1772, 1883` | mitnehmen — ein Text, im Papier als gewollte Folge |
| PP4b-18 | Kimi B8 | `breite`/`hoehe` nicht ganzzahlig → undefiniertes Urteil | Logik | mitnehmen — `Number.isInteger` |
| PP4b-19 | DS D3 | Helle Farben (Gelb, Luminanz 226) gelten als leer | Rechnung | Grenze, dokumentiert (Pads zeichnen #000/#111) |
| PP4b-20 | DS B1 / C3 | Tremor-Paradox; Schwellen am selben Generator gelernt | richtig | Sammelliste: Auswertung `[unterschrift-masse]` nach 4 Wochen Betrieb |
| PP4b-21 | DS B2 | drei Dekodierungen je Upload in `signaturbild.js` | gelesen | Sammelliste (Leistung, kein Fehler) |
| PP4b-22 | DS 3b | `spuelplan.js:324` verschluckt PDF-Fehler als „gespeichert“ | gelesen, vorbestehend | Sammelliste |

22 Zeilen, 22 getragen (eine mit falscher Prämisse, Substanz getragen), 0 gefallen.
