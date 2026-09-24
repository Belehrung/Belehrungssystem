# Auftrag T2 — Zusicherungen, die nicht rot werden können (Fassung 2, 24.09.2026)

Arbeitsbaum frisch von master (`/workspace/gymdocu-t2`, Zweig `fix-t2-zusicherungen`). Einordnung: Standard-Executer
— viele Dateien, immer derselbe Handgriff (Zusicherung schärfen, Gegenprobe rot/grün). Ausnahme: V08-1 ändert eine
Abfrage in `core/jahrescheck.js` (Produktivcode, eine Zeile, Vorbild in derselben Datei).

**Befundtexte** stehen in `/home/user/Belehrungssystem/plaene/vollpruefung-befunde.md` (V-Nummern) bzw.
`/home/user/Belehrungssystem/plaene/diffpruefung-t1.md` (T1-K4) und `/home/user/Belehrungssystem/plaene/offene-befunde-vollpruefung.md` (N-1).
Jeder Befund wird VOR der Änderung am Bestand nachgesehen; trägt er nicht (Zeile verschoben, Lücke schon zu), wird
das gemeldet statt gebaut. **Fassung 2** nach der Planprüfung (`plaene/planpruefung-t2.md`, 21 Zeilen): die dort
berichtigten Fundstellen und Zählungen gelten VOR den Befundtexten.

**Frist:** Teil C muss vor dem **11.10.2026** auf master sein — gemessen (PT2-14): ein Lauf am 12.10.2026 00:30 CEST
rechnet `+14·86400000` auf `2026-10-25` statt `2026-10-26`; das Deploy-Gate würde in diesem Fenster ohne Codefehler rot.

## Handgriff je Punkt

1. Befund am Bestand bestätigen: den bewachten Defekt einbauen (Mutation, Marker, `cp`-Sicherung) → Test bleibt
   GRÜN = Befund trägt. Bleibt er nicht grün → Befund fällt, melden, nichts ändern.
2. Zusicherung schärfen (Länge/Menge statt `every()`, Status + positiver Anker statt nur `not.toContain`, maskierter
   statt roher Quelltext, Fixture mit unterscheidbaren Werten — CLAUDE.md „Prüfen: was ein Ergebnis wert ist“).
3. Dieselbe Mutation → jetzt ROT; Rücknahme per `cp`, `diff` EXIT 0 → GRÜN. Zahlen wörtlich (PASS/FAIL je Lauf).

## Teil A — mittel

| Nr. | Datei | Kern |
|---|---|---|
| V16-1 | `test_feature_dguv3.js:98-100` | `every()` über leere Menge; Länge (2) zusichern |
| V20-1 | `test_feature_mangel_darstellung_einheitlich.js:103-108` | Teil 3 auf kommentarbereinigten Text (`ohneKomm_sicht`/`ohneKomm_modul` sind in der Datei schon da, `:76-79`; sonst `codeOhneKommentare` aus `test/helfer/advisory-lock-erkenner.js`); für BEIDE Dateien, obwohl nur `sichtpruefung.js` heute den Kommentar hat (PT2-16) |
| V12-3 | `e2e/gymdocu.spec.js:231-233` (PT2-1; `:187-191` ist ein anderer Test) | Status 200 + positiver Anker in DERSELBEN Zusicherungsgruppe wie `not.toContain`; läuft im CI-Job `browser-e2e` — Gegenprobe dort bzw. lokal mit Playwright |
| T1-K4 | statischer Wächter aus dem T1-Beitrag | alle neun Wegwerf-Variablen aus `test/run.sh:417-545` (PT2-7) als Literal; ZUSÄTZLICH Abgleich in beide Richtungen gegen die `_DIR`/`_ROOT`-Zuweisungen in `run.sh` (PT2-18: neue Variable in `run.sh` → ROT, toter Literal-Eintrag → ROT); Gegenproben: ein Test ohne Absicherung → ROT; `TESTPROBE_DIR` in `run.sh` ergänzt → ROT |
| N-1 | `test/helfer/quelltext-scan.js:491` (gemeinsamer Helfer, PT2-8) | `--exclude-standard` ergänzen — NICHT „nur Index“ (PT2-13: neue, ungestagte Dateien müssen drin bleiben). Executer nennt jeden Wächter, der den Helfer nutzt, mit Dateizahl vorher/nachher. Gegenproben: ignorierte `playwright-report/index.html` mit Rohwert → GRÜN; getrackte Datei mit Rohwert → ROT; neue, NICHT gestagte Datei mit Rohwert → ROT |

## Teil B — gering, „grün aus falschem Grund“

V14-1 (`=== 404`), V14-2 (Member-Aufrufe erfassen ODER als Grenze im Testkopf benennen — Executer misst, ob die
Erfassung Fehlalarme bringt), V17-1 (eigene `ladeCreds`-/Telegram-Attrappe vor dem `require`, nicht nur die
Netzsperre), V17-4, V24-2 (je Anker-Existenz zusichern), V23-1, V23-2 (Fixture mit zurückdatiertem `erstellt_am`, dann
`>` — uhrenstabil, PT2-21), V21-3 und V21-4 (erst die Fixture entkoppeln, dann ist die Gegenprobe messbar, PT2-11),
V21-5, V16-5, V18-2, V25-3 (die begründeten `alert(` in `routes/sichtpruefung.js:1046, 1052` als benannte Ausnahme,
PT2-19), V26-1 (`GYMDOCU_SUITE_LOCK` in Fall F aus der Kind-Umgebung entfernen, PT2-5), V19-1 (ALLE VIER Tests,
PT2-3: Zufallsslug UND Netz-Attrappe, Gegenprobe Einzelaufruf ohne Netzsperre → 0 ausgehende Verbindungen, PT2-17),
V11-5 (eigene Stufe „nicht geprüft“, kein pauschales FAIL, PT2-9), V11-7 (`xargs -r` UND Mindestzahl geprüfter
Dateien), V08-1 (`core/jahrescheck.js:279` wie die Schwesterfunktion `:455` mit `DISTINCT ON`, Filter `studio_id`,
`bereich`, `ergebnis` bleiben; Test mit ZWEI Bestätigungen, deren Namen das Text-Maximum und die jüngste Zeile
unterscheiden).

**Nur melden, nicht schärfen:** V13-3 (benannte Grenze im ok()-Namen; der Befundtext war verdreht — INNERHALB
00–02 Uhr Berlin prüft sie nichts, PT2-4/20) und V15-1a.

## Teil C — Zeitzonen-Fixtures (können das Deploy-Gate um die Zeitumstellung fälschlich rot machen)

V18-1, V19-2, V20-2 (`test_feature_mangel_darstellung_einheitlich.js:38-42`, PT2-2), V24-1
(`test_feature_retention_sperr_sichtkontrollen.js:32-37`), V16-6 (Fundstelle unbelegt, PT2-6 — suchen, sonst
streichen): Fixture-Daten über Berliner Kalenderarithmetik statt `Date.now() ± n·86400000` bzw. UTC-Tag. Vorhandene
Helfer benutzen (`core/datum.js`, Executer nennt die Funktion).

**Gegenprobe je Mechanismus (PT2-14, gemessen):**
- ±n·86400000-Fixtures (V18-1): eingefrorene Uhr über einen `node -r`-Preload, der `Date.now()` und argumentloses
  `new Date()` überklebt, auf **12.10.2026 00:30 CEST** (für `+14`/`+15`) bzw. **30.03.2026 00:30 CEST** (für `−1`).
  Alt → ROT, neu → GRÜN. Der Preload ist ein Testhelfer unter `test/helfer/`, keine Produktionsänderung.
- Lokale Datumskonstruktion ohne `timeZone` (V20-2, V24-1): `TZ=Pacific/Kiritimati` bzw. `TZ=Europe/Berlin` zur
  passenden Uhrzeit. `TZ=` wirkt NICHT bei `toLocaleDateString(…, { timeZone })` und `toISOString()`.
- UTC-Tag (V19-2): eingefrorene Uhr auf 00:30 Berlin (= Vortag UTC).

## Rahmen

- Keine Zusicherung abschwächen, keine löschen. Wo ein Befund eine BENANNTE Grenze im Testkopf ist (V15-1a), bleibt
  sie — nur melden.
- Testdaten so benennen, dass sie mit dem gesuchten Muster nichts gemein haben (CLAUDE.md).
- Volle Suite nach Ritual, Dateizahl-Ritual; Marker-Scan über den Arbeitsbaum am Ende leer.
- Bericht: Tabelle Nr. → trägt/fällt → Mutation → ROT-Zahlen → GRÜN-Zahlen.

-- Ende des Auftrags --
