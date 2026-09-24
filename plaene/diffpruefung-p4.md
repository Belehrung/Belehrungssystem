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

## Runde 2, ausführende Claude-Spur (eigener Baum `/workspace/gymdocu-p4-pruef` @ `4b03d32`)

Mutationen je per cp zurückgenommen, Baum danach sauber. Stichprobe selbst nachgemessen: P4-C5 (Bedingung entfernt →
`test_feature_unterschrift_regel.js` EXIT 0, 45 PASS / 0 FAIL; Rücknahme `diff` EXIT 0).

| Nr. | Befund | Messung (Spur) | Entscheidung |
|---|---|---|---|
| P4-C1 | Die Kopf-Riegel an den vier `doc.image`-Stellen (`core/pdf-engine.js:424, 1171, 1784, 1897`) hält kein Verhaltenstest; der PDF-Test prüft eine eigene Kopie der Logik | `if (false && !bild.ok)` → 28/0; mit 4100×4100-Altbild mutiert `image()` 4100x4100, RSS +262 MB | je Generator ein Verhaltenstest mit Altbild > 16 MP und Spion auf `PDFDocument.prototype.image` |
| P4-C2 | Der Kopfleser deckelt IHDR-Pixel, nicht die entpackte Menge: IHDR 10×10, IDAT = 300 MB Nullen → `unterschriftBild` ok, PDF-Erzeugung RSS +608 MB (vorbestehend, nur Altdaten) | gemessen von der Spur | `zlib.inflateSync` mit `maxOutputLength` probeweise im Kopfleser; Überlauf → Platzhalter |
| P4-C3 | Im Browser sind nur 2 von 12 Absende-Handlern verhaltensgeprüft; `if (false && !sigPruefung.ok)` an E11 → browser 21/0 | gemessen von der Spur | `page.route`-Muster als Schleife über alle Pad-Seiten, mindestens E4 und E11 |
| P4-C4 | E3-Raster-Behebung ungeprüft: `if(false)initSig_freigabePad();` → browser 21/0, race 48/0; mutiert Raster 400×200 auf CSS 516×150 | gemessen von der Spur | Dialog öffnen, „Raster = CSS × dPR“ zusichern; `/unterschrift-regel.js` im race-Test montieren |
| P4-C5 | `&& masse.verhaeltnis < VERHAELTNIS_MAX` hält keine Zusicherung; nicht tot (Zickzack 80×30, 30° → heute ok, mutiert „strich“) | **selbst nachgemessen**: 45/0 unter Mutation | Zickzack als ANGENOMMEN-Fixtur |
| P4-C6 | Kalibrierprotokoll `[unterschrift-masse]` (PP4b-20 hängt daran) ohne Zusicherung; Aufruf entfernt → 210/0 | gemessen von der Spur | `console.log`-Spion: Pflichtfelder + Verbotsliste für ID-Schlüssel |
| P4-C7 | Gerader Strich in zwei Ansätzen (3 px Lücke) → ok (2 Komponenten) | gemessen von der Spur | benannte Grenze, Sammelliste (PP4b-23): ≥ 2 Komponenten = ok ist Fassung 3; kollineare Stücke zu erkennen wäre eine neue, ungemessene Regel |
| P4-C8 | 1×4.000.000 (unter dem 4-MP-Deckel) braucht 238 ms, STOPP-Grenze 250 ms | gemessen von der Spur | zusätzlich Kantenlänge je Seite ≤ 4096 (gut das Doppelte der breitesten gemessenen Fixtur, 1880 px) → „zu gross“ |
| P4-C9 | Eintrittspunkte-Test räumt `SCRATCH_DIR` nie ab (45 Reste in /tmp; Vorbild `signatur_verbrauch` 217) — läuft auch auf dem Live-Gate | gemessen von der Spur | Aufräumen bei Prozessende, in beiden Tests |
| P4-C10 | unbenutzte Importe `vomAltenTablet, MARKER_FELD` in vier Routen | gelesen | entfernen |

10 Befunde, 10 getragen (einer als Grenze), 0 gefallen. Nacharbeit 4 läuft.
