# Diffprüfung Teil G (test/umgebung.sh, test/db-vorbereiten.js) — 30.09.2026

Stand `6d90468`. Lesespur `deepseek-flash` (`scratchpad/gpruef/antwort.txt`, 0,85 $), eigene Lesung des Diffs (Block
Zeile für Zeile gegen `be7ace5:test/run.sh:392-592` verglichen: nur zehn `exit`→`return`, zwei Kommentare, neuer Kopf),
eigene Gegenprobe (`DATABASE_URL`-Zuweisung in `umgebung.sh` → 63/1, zurück 64/0), Dateizahl 412 = 412 aus dem Suite-Log
(Sieb auf den `TESTS=(`-Block beschränkt — das bisherige Sieb über ganz `run.sh` trifft jetzt `test/umgebung.sh`).
Eine ausführende Claude-Spur entfällt: der Bauer hat 27 Mutationen am Wächter gemessen, und das Gate-Verhalten ist durch
den Vergleich je Testdatei (412 Dateien, nur der umgestellte Wächter weicht ab) belegt.

| Nr | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| G-B1 | `GYMDOCU_BOOT_SMOKE_STARTPFAD=1` in einer importierbaren Datei ohne DB-Vorbedingung; boot-smoke umgeht die `_test`-Sperre (`core/db.js` `PRODUKTIVE_EINSTIEGE`) | trägt | Nacharbeit: lesende `_test`/`_e2e`-Prüfung in `umgebung.sh` |
| G-B2 | DATABASE_URL-Zusicherung verbietet jede Nennung | trägt | Nacharbeit: auf Schreibformen einengen |
| G-B3 | `exit` in mktemp-Blöcken nicht verboten; Nicht-source-Zweig unbewacht | trägt | Nacharbeit |
| G-B4 | `run.sh:333-375` aus der Überwachung gefallen; Reihenfolge Vorbereitung/source unbewacht | trägt | Nacharbeit |
| G-B5 | Kommentare verweisen auf `test/run.sh` | trägt | Nacharbeit (nur Text) |
| G-B6 | Exit-Vertrag enger formuliert als der Code | trägt | Nacharbeit (Kommentar) |
| G-B7 | `tools/mutationsprobe.js` baut seine Umgebung selbst | trägt (vorbestehend) | Sammelliste |
| G-A4 | `NODE_OPTIONS`-Zeilen unbewacht | trägt NICHT: `test_feature_netzsperre.js` (a) prüft den Preload-Marker zur Laufzeit, `test_feature_dateisperre.js` ebenso | — |

Nacharbeit `001ff65`: G-B1..B6 umgesetzt, 21 Gegenproben (Basis 71/0), Suite 412 = 412 EXIT 0, eslint sauber. Von mir
gelesen: DB-Prüfung in `umgebung.sh` (Name nach letztem `/`, ohne `?`/`#`, `*_test|*_e2e`, sonst `return 1` vor jedem
Export); übrige Dateien nur Kommentare/Beschreibungstexte. Offen, Sammelliste: G-B7; die Auswertelogik der DB-Prüfung ist
nur per Handprobe belegt (kein Verhaltenstest).

-- Ende --
