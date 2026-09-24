# Diffprüfung P4 — Unterschrift (24.09.2026)

Zweig `fix-p4-unterschrift`, Kopf `57c5ac5`. Executer-Suite: SUITE_EXIT=0, 376 = 376, Lint 0; Gegenproben (a)–(h)
einzeln rot/grün. Claude-Spur: Produktions-Diff selbst gelesen. Lesespur: DeepSeek mit Repo. Der erste Lauf mit
effort max auf dem ganzen Diff brach an `max_output_tokens` ab; der zweite lief mit effort high nur über den
Produktions-Diff, 1,x $.

| Nr. | Spur | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| P4-D1 | Claude + DS | `clearSig` in `getraenkeanlage.js:123`/`spuelplan.js:72` rechnet mit ungedeckeltem dPR → auf dPR 3 bleibt ⅓ Resttinte | gelesen | beheben |
| P4-D2 | Claude | PDF-Kopfdeckel bewertet ALTDATEN mit dem neuen 4-MP-Einreich-Deckel | gelesen `core/bildkopf.js` | 16 MP für die Einbettung, 4 MP fürs Einreichen |
| P4-D3 | DS | Fehlender Marker an E4/E11 setzt die Regel aus — frei wählbar | gelesen; Entwurf nach Fassung 4 D | befristen bis 15.10.2026 |
| P4-D4 | DS | E3-HTML-Weg antwortet 200 statt 400 | gelesen `module.js` `jFehler` | beheben (nur der Unterschriftsfehler; der Rest kommt mit P2) |
| P4-D5 | DS | `unterschrift[]=…` wird still stringifiziert | gelesen | `textFeld()` |
| P4-D6 | DS | `sharp().metadata()` läuft vor der PNG-Prüfung → SVG-Parser erreichbar | gelesen | Magic-Bytes/IHDR zuerst |
| P4-D7 | DS | Tests beziehen `EINBETT_*` und Meldungen aus dem Prüfling | gelesen | Literale |
| P4-D8 | DS | E1-Hash ohne Bilddaten | vorbestehend | nicht P4, keine Änderung |

8 Befunde, 8 getragen (P4-D8 vorbestehend), 0 gefallen. Nacharbeit 1 läuft.

## Runde 2 (Nacharbeit, `57c5ac5..3f011fa`, nur Produktionscode)

Nacharbeit 1 und 2 selbst gelesen (Diff vollständig). Executer: Suite `SUITE_EXIT=0`, 376 = 376, `DIFF_EXIT=0`,
Lint 0; G3 dreiteilig (Route weg → Helfer fängt, 202/0; Helfer weg → Route fängt, 202/0; beide weg → 200/2 ROT, 500
und Alarm). Lesespur DeepSeek mit Repo (effort high, 28 Runden, ~3,45 $): „kein Eintrittspunkt, an dem Array, Nicht-PNG
oder Übergrösse durchkommt oder mit 500 endet“.

| Nr. | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| P4-R2-1 | E3 (`routes/module.js:1431-1433`): der äussere `catch` antwortet im HTML-Zweig mit 200 | gelesen; `jFehler` ohne Status im HTML-Zweig | **P2** (Fehlerseiten-Status, PP2-K4 nennt `jFehler`) — beim P2-Diff nachsehen |
| P4-R2-2 | `EingabeFehler`-Zweig im E1-`catch` sei toter Code | **fällt**: er ist der Fänger des zweiten Riegels (`core/signaturbild.js` typeof → `EingabeFehler`), falls die Routenwache je fehlt — genau die Staffelung aus G3 | keine Änderung |
| P4-R2-3 | „Kopf vor `sharp`“ nur textuell zugesichert; Verhalten kann es nicht unterscheiden (sharp lehnt Nicht-PNG ohnehin ab) | gelesen `test_feature_unterschrift_eintrittspunkte.js:334,337` | Verhaltensprobe: `sharp`-Spion, SVG/JPEG an beide Helfer → 0 Aufrufe; Gegenprobe Kopfprüfung raus → >0 |
| P4-R2-4 | `routes/spuelplan.js:286`, `routes/verbandbuch.js:567` fangen nur `UnterschriftFehler` | gelesen | auf `EingabeFehler` wie die übrigen elf |

4 Befunde, 3 getragen (1 an P2 verwiesen), 1 gefallen. Nacharbeit 3 (klein) läuft.
