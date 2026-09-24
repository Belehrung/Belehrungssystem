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
