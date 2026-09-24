# Auftrag T2 — Zusicherungen, die nicht rot werden können (Fassung 1, 24.09.2026)

Arbeitsbaum frisch von master (`/workspace/gymdocu-t2`, Zweig `fix-t2-zusicherungen`). Einordnung: Standard-Executer
— viele Dateien, immer derselbe Handgriff (Zusicherung schärfen, Gegenprobe rot/grün). Ausnahme: V08-1 ändert eine
Abfrage in `core/jahrescheck.js` (Produktivcode, eine Zeile, Vorbild in derselben Datei).

**Befundtexte** stehen in `/home/user/Belehrungssystem/plaene/vollpruefung-befunde.md` (V-Nummern) bzw.
`/home/user/Belehrungssystem/plaene/diffpruefung-t1.md` (T1-K4) und `/home/user/Belehrungssystem/plaene/offene-befunde-vollpruefung.md` (N-1).
Jeder Befund wird VOR der Änderung am Bestand nachgesehen; trägt er nicht (Zeile verschoben, Lücke schon zu), wird
das gemeldet statt gebaut.

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
| V20-1 | `test_feature_mangel_darstellung_einheitlich.js:103-108` | Teil 3 auf kommentarbereinigten Text umstellen (vorhandenen Maskierhelfer im Repo benutzen, Executer nennt ihn) |
| V12-3 | `e2e/gymdocu.spec.js:187-191` | Status 200 + positiver Anker zusätzlich zu `not.toContain`; Executer meldet, wo das E2E läuft (CI-Job?) und ob die Gegenprobe dort messbar ist |
| T1-K4 | statischer Wächter aus dem T1-Beitrag | ausser `PDF_ROOT` auch `EINWEISUNG_NACHWEIS_DIR` und alle weiteren Verzeichnis-Variablen, die `test/run.sh` auf Wegwerfpfade setzt — Liste aus `run.sh` ABLEITEN und als Literal in den Wächter; Gegenprobe: ein Test ohne die Absicherung |
| N-1 | `test_feature_keine_neuen_rohwerte.js` | nur `git ls-files` scannen (ignorierte Dateien raus); Gegenprobe: `playwright-report/index.html` mit Rohwert anlegen → grün, getrackte Datei mit Rohwert → rot |

## Teil B — gering, „grün aus falschem Grund“

V14-1, V14-2 (Member-Aufrufe erfassen ODER als Grenze im Testkopf benennen — Executer misst, ob die Erfassung
Fehlalarme bringt), V17-1 (eigene `melde`-/Telegram-Attrappe im Test, nicht nur die Netzsperre), V17-4, V24-2, V23-1,
V23-2, V21-3, V21-4, V21-5, V13-3, V16-5, V18-2, V25-3, V26-1, V19-1, V11-5, V11-7 (`xargs -r` UND Mindestzahl
geprüfter Dateien), V08-1 (`core/jahrescheck.js:279` wie die Schwesterfunktion `:455` mit `DISTINCT ON`; Test mit
ZWEI Bestätigungen, deren Namen das Text-Maximum und die jüngste Zeile unterscheiden).

## Teil C — Zeitzonen-Fixtures (können das Deploy-Gate um die Zeitumstellung fälschlich rot machen)

V18-1, V19-2, V20-2, V24-1, V16-6: Fixture-Daten über Berliner Kalenderarithmetik statt `Date.now() ± n·86400000`
bzw. UTC-Tag. Vorhandene Helfer benutzen (`core/datum.js`, Executer nennt die Funktion). Gegenprobe: Prozesszeit per
`TZ=Europe/Berlin` und eine eingefrorene Uhr auf den Tag nach der Zeitumstellung (Ende Oktober) — vorher ROT, nachher
GRÜN; wo sich die Uhr nicht einfrieren lässt, melden.

## Rahmen

- Keine Zusicherung abschwächen, keine löschen. Wo ein Befund eine BENANNTE Grenze im Testkopf ist (V15-1a), bleibt
  sie — nur melden.
- Testdaten so benennen, dass sie mit dem gesuchten Muster nichts gemein haben (CLAUDE.md).
- Volle Suite nach Ritual, Dateizahl-Ritual; Marker-Scan über den Arbeitsbaum am Ende leer.
- Bericht: Tabelle Nr. → trägt/fällt → Mutation → ROT-Zahlen → GRÜN-Zahlen.

-- Ende des Auftrags --
