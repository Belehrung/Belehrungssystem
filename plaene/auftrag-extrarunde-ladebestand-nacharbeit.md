# Nacharbeit Extrarunde „ladebestand" — nach der Diffprüfung (23.09.2026)

Arbeitsbaum `/workspace/gymdocu-extra`, Zweig `extrarunde-ladebestand`, Stand `91f7a5e`.
Befunde samt Messungen: `plaene/diffpruefung-extrarunde-ladebestand.md` (C = eigene
Spur, L = Lesespur). Jeder Punkt unten ist nachgemessen.

## N1 — BLOCKIEREND: Zeitbombe im Anker (C1, L6)

Heute gemessen: JS-Uhr +30 Tage → `test_feature_brandschutz_schreibplan_anker.js`
EXIT 1, 30 PASS / 5 FAIL. Die Suite ist Deploy-Gate; sie würde ab morgen rot.

1. **Normalisierung kalendertreu:** ein Datum D wird zu `«MONATE±N»`, wenn es eine ganze
   Zahl N (|N| ≤ 1200) mit `plusMonate(heute, N) === D` gibt, sonst `«TAGE±d»`. Dieselbe
   Regel in `db-schreibspur.js` (Parameter) UND in `brandschutzZustand()` (EINE Funktion,
   beide rufen sie). Prüfen, ob `pg` Datumsspalten als `Date` oder als Zeichenkette liefert,
   und beides gleich behandeln.
2. **Schritt-0-Daten relativ zu heute** (z. B. `plusMonate(heute, 4)`), nie ein festes Datum —
   auch das Prüfungsdatum `'2026-08-01'`, falls es in eine gehashte oder aufgezeichnete Menge
   eingeht.
3. **Mitternacht:** `fuehreSzenarioAus` bestimmt `heute` vor UND nach dem Szenario; weichen
   beide ab, das Szenario EINMAL mit frischem Studio wiederholen (begründet im Kommentar).
4. **Golden Files und Hashes NEU erzeugen — am ALTEN Routen-Code.** Eigener Arbeitsbaum unter
   `/workspace` auf `e2a9e9e`, die neuen Test-Helfer und die Ankerdatei hineinkopieren,
   Erzeuger dort laufen lassen, Golden Files/Hashes zurückholen; danach am neuen Code grün.
   Im Bericht: `git diff --stat` der Golden Files und eine Stichprobe, dass sich NUR
   Datumsmarken geändert haben.
5. **Nachweis der Tagesunabhängigkeit:**
   * neue Unit-Zusicherung über die Normalisierung mit `heute` ∈ {`2026-01-31`,
     `2026-12-31`, `2027-03-01`, `2028-02-29`} und N ∈ {1, 3, 12, 24}: immer `«MONATE+N»`;
   * Gegenprobe mit verschobener JS-Uhr (Preload, der `Date`/`Date.now` verschiebt — Vorlage:
     `/tmp/claude-0/-home-user-Belehrungssystem/c200d6d7-f0a2-5a02-8fb8-a4f662e3a700/scratchpad/zeitversatz.js`,
     `ZEIT_VERSATZ_TAGE=n`, per `NODE_OPTIONS="--require …"`): Versätze 1, 30, 100, 160, 365,
     1000 → Anker jeweils grün. Achtung: die Datenbankuhr läuft dabei NICHT mit — fällt ein Wert
     aus `now()`/`CURRENT_DATE` der DB, das benennen;
   * und umgekehrt: `faelligAm: plusMonate(heute, g.intervallMonate)` → `faelligAm: heute`
     muss weiterhin rot werden.

## N2 — BLOCKIEREND: Zähler des Aufrufers unbewacht (C2, L2)

Gemessen: `deaktiviert = delta.deaktiviert` → alle vier Testdateien grün. Für JEDEN der
fünf Übernahmen (`deaktiviert`, `angelegt`, `uebersprungen`, `praefplanGeaendert`,
`abgeloest`) muss die Zuweisungs- bzw. Verlustmutation EINZELN rot werden.
* Wo die Erfolgsseite eine Zahl zeigt: in JEDEM Szenario die angezeigte Zahl gegen ein
  Literal prüfen; dazu Mehr-Positionen-POSTs, in denen die Zahlen VERSCHIEDEN sind (keine
  zwei Bedeutungen auf derselben Zahl), und ein Fall mit genau EINER Neuanlage
  (`<strong>2</strong>` fest verdrahtet muss rot werden).
* `praefplanGeaendert` erscheint nur auf der Teilfehlerseite: Zwei-Positionen-POST mit
  gestörtem `ladeBestandStreng()` (Muster wie in `test_feature_ladebestand_streng.js`) und
  literaler Zahl auf der Fehlerseite.
* `abgeloest`: Zwei-Positionen-Fall oder Feuerlöscher mit ≥ 2 abgelösten Namen, Namen auf
  der Seite literal.
* Statt `abgeloest.push(...delta.abgeloest)` eine Schleife (L7).

## N3 — mittel

* **L8:** jede POST-Antwort in den Szenarien auf die generische Fehlerseite prüfen
  (`test/helfer/fehlerseiten-pruefung.js`), BEVOR Spur und Hash zählen — HTTP 200 allein
  ist kein Erfolg.
* **L1:** Szenarioliste gegen eine LITERALE Liste der elf Namen, und `ZUSTAND_HASHES` hat
  genau diese Schlüssel. Gegenprobe `SZENARIEN.slice(0,1)` → rot.
* **L4:** Import-Erlaubnisliste über einen PARSER (`acorn` ist bereits Abhängigkeit, siehe
  `tools/mutationsprobe.js`): jedes `require(…)` UND jedes `import(…)` im Modul und in den
  erlaubten Modulen; ein nicht-literales Argument ist ein FAIL. Die Laufzeitprüfung bleibt.
  Gegenprobe `if (false) await import('./db.js');` → rot.
* **C3:** veraltete Prosa berichtigen (Fundstellen in der Befunddatei). Kein Kommentar darf
  mehr eine Zusicherung nennen, die es nicht mehr gibt.
* **C4:** Gegenproben B-2, B-13/21, B-17 messen und berichten; die neun A1a-Mutationen am
  NEUEN Code (im Modul) erneut messen, je mit erstem FAIL wörtlich.

## N4 — gering

* **C5 / B19:** Kommentar `M10 (Diffprüfung Runde 8 …)` in `test_feature_ladebestand_streng.js`
  berichtigen: die Prämisse „las genau die Variablen, gegen die er immun sein soll" stimmt
  nicht — `[katEigenId, katFremdId]` war schon eine Wertkopie; der Nutzen der
  Bestätigungsabfrage ist die EXISTENZprüfung.
* **C6:** A3-2 prüft zusätzlich, dass der Aufruf VOR dem Ende der POSITIONEN-Schleife liegt.
* **C7:** Modulrumpf normal einrücken; die SQL-Literale bleiben byte-gleich (die Schreibspur
  prüft das).
* **L3:** Unit-Erwartung für `faelligAm` als Datumsliteral (HEUTE `2026-01-15` → literal);
  im Fall `bs_notiz_zusatz` erst die EXISTENZ der CTE zusichern, dann `FOR UPDATE`.
* **L5:** C9-Kommentar: Destrukturierung entnimmt die Methode, liest den Body nicht —
  Formulierung berichtigen (Prädikat bleibt, Richtung Fehlalarm ist die sichere).
* **L9:** Begründung des `audit_log`-Ausschlusses berichtigen (keine Auffanggarantie über
  den Status).
* **L10:** Diagnose-Map nach `(tabelle, id)` schlüsseln.

## Abnahme

Volle Suite (`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`), Dateizahl-Ritual,
`npm run lint` wörtlich, Marker-Scan 6. Jede Gegenprobe: erwartet / gemessen / erster FAIL
wörtlich, Rücknahme gegen `cp`-Kopie mit `diff` EXIT 0. Commit + Push, keine PR.
**Widersprich mit einer Messung, wenn ein Punkt falsch ist.**
