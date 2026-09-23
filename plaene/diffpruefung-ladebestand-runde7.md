# Diffprüfung Runde 7 „ladebestand" — ausführende Spur (Claude), 23.09.2026

Stand `4fc9bed` (Executer `dc799f3` + meine Nachbesserung), Zweig
`beitrag-ladebestand`. **Zwölf Befunde, alle zwölf tragen.**

Acht habe ich selbst nachgemessen, vier sind durch Lesen eindeutig.
**Drei sind REGRESSIONEN, die Runde 7 selbst eingeführt hat** — der Beitrag,
der Zusicherungen schärfen sollte, hat drei davon stumpf gemacht.

## Die drei Regressionen

### R1 — Punkt 7 hat den C7-Wächter BLIND gemacht

Der C7-Wächter (`!abschnitt.includes('PRUEFPLAN_SCHREIBBEREICH_BEGINN')`)
bewacht, dass der Schnitt nicht auf die Markenposition zurückfällt — ein
dokumentierter früherer Defekt. Die Marke steht in einem `//`-Kommentar.

```
ALTER Weg  (Ausschnitt maskieren), Schnitt ab begin -> Marke im Abschnitt?: true
NEUER Weg  (ganze Datei maskieren, dann schneiden)  -> Marke im Abschnitt?: false
```

Auf dem alten Weg startete der Masker MITTEN im Markenkommentar, die Marke
überlebte, der Wächter wurde rot. Auf dem neuen Weg ist sie überall
ausgeleert — **der Wächter kann nicht mehr fallen.** Genau die Regression,
gegen die er geschrieben wurde, liefert ab jetzt eine grüne Suite.

### R2 — die „Vertragsprüfung" ist zur slice-Tautologie geworden

`abschnitt = geraeteOhneKommentare.slice(zb, ende)`, danach
`assert.strictEqual(abschnitt.length, ende - zb)`. Das ist
`slice(a,b).length === b-a` — **immer wahr, unabhängig vom Masker.**

```
abschnitt.length === ende - zb ? true (15782 === 15782)
mit einem Masker, der 50 Zeichen verliert:
  abschnitt.length === ende - zb ? true (15782 === 15782)
  -> die Zusicherung merkt es: NEIN
  die VERWORFENE Form haette gemerkt: JA
```

**Und das widerlegt meine eigene Argumentation aus dem Auftragspapier.** Dort
steht, die von der Lesespur vorgeschlagene Form
`geraeteOhneKommentare.length === GERAETE_QUELLTEXT_ROH.length` sei „WÖRTLICH
die Tautologie, eine Ebene höher". **Das ist falsch, und zwar genau
umgekehrt:**

* Auf der GANZEN Datei vergleicht sie zwei unabhängig erzeugte Zeichenketten —
  sie KANN fallen, sobald der Masker die Längenerhaltung verliert.
* Auf dem SLICE vergleicht sie eine Zeichenkette mit ihrer eigenen
  Schnittlänge — sie kann NIE fallen.

Vor Punkt 7 war die Zusicherung `maskiereKommentare(ROH.slice(…)).length ===
…` und prüfte damit tatsächlich die Längenerhaltung für diesen Ausschnitt.
Punkt 7 hat sie zur Tautologie degradiert. Die Lesespur hatte recht, ich habe
ihren Vorschlag mit einer falschen Begründung verworfen.

### R3 — der geschärfte Riegel verliert die REFERENZ-Form

```
ALT: gefangen  NEU: DURCH   const f = pool["query"]; await f(sql);
```

Die neue Forderung nach einer aufrufenden Klammer (`\]\s*\(`) schliesst die
Fehlalarme (`req.body['q']`), kostet aber die Referenz-Form, die der ALTE
Ausdruck über sein schlampiges `.?` noch fing. Für `pool['run']` war sie schon
vorher offen — dort keine Regression.

Dasselbe Muster wie beim Backtick-Befund der Planprüfung: eine Schärfung an
einer Stelle öffnet an einer anderen.

## Die übrigen neun

| # | Kern | Ergebnis |
|---|---|---|
| R4 | Die `neu AS (`-Positivkontrolle prüft ein ANDERES Prädikat als das Fenster (kein `\b`) | **TRÄGT, gemessen** |
| R5 | Die Aufräum-Zusicherung belegt nur „keine Ausnahme", nicht „kein Rest" | **TRÄGT, gemessen** |
| R6 | Zeilenzahlen im Kommentar: 218/143 behauptet, **232/157** gemessen | **TRÄGT, gemessen** |
| R7 | Nicht-Leerraum roh: 345735 behauptet, **345720** gemessen | **TRÄGT, gemessen** |
| R8 | `GERAETE_OHNE_KOMMENTARE` — 3× in Prosa, **0 Deklarationen** | **TRÄGT, gemessen** |
| R9 | 40-Zeilen-Kommentarblock verwaist über dem Riegel, Begründung steht an zwei Orten | **TRÄGT** |
| R10 | „steht VOR jedem Verbrauch dieser Werte" stimmt nicht — Schnitt und Zusicherung 1 verbrauchen sie vorher | **TRÄGT** |
| R11 | Eine künftige Aufrufervariable namens `r` träfe den Helfer-Rumpf selbst | **TRÄGT, ungefährliche Richtung** |
| R12 | `e.message` bei einem Nicht-Error ergibt „…: undefined" | **TRÄGT** |

### R4, gemessen

```
Probe: "WITH gesperrt AS ( SELECT 1 FOR UPDATE), xneu AS ( SELECT 2 FOR UPDATE)"
Zaehlung  /neu AS \(/g    : 1   (Zusicherung 6 verlangt 1 -> geht durch)
Fenster   (?!\bneu AS \() : true (Fenster greift NICHT mehr)
```

Die Positivkontrolle sagt „Anker vorhanden", während das Fenster ihn nicht
mehr sieht — Riegel und Positivkontrolle prüfen verschiedene Prädikate.
**Dieselbe C11-Klasse, die diese Runde an drei anderen Stellen behoben hat.**

### R5, gemessen

```
zweites srv.close(): KEIN Wurf -> catch unerreichbar
```

Schritt 1 von 4 ist ein Wächter, der nicht feuern kann. Dazu: laufen die
DELETEs mit `undefined`-IDs, vergleichen sie gegen NULL, treffen nichts,
liefern `rowCount 0` und werfen nicht — `aufraeumFehler` bleibt leer, während
der Rest liegenbleibt. Die Meldung behauptet aber „kein Fixturrest in der
geteilten Wegwerf-DB". Gebraucht wird eine MENGEN-Prüfung (die vier IDs
zurückfragen), kein Ausnahmezähler.

### R6 — warum die Zahlen abweichen

Meine 218/143 waren korrekt, **als ich sie mass** — vor der Runde-7-Änderung
am Kommentar in `geraete.js`, die INNERHALB des bewachten Abschnitts liegt und
ihn um 14 Zeilen verlängert hat. Lehrbuchfall aus der eigenen CLAUDE.md: eine
Zahl im Fliesstext veraltet, und zwar durch den eigenen Beitrag.
