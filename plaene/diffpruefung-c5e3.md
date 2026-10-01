# Diffprüfung C5-E3: E2-Reste und kleine Testbefunde

Stand 01.10.2026, Zweig `c5e3-reste`, Kopf `e477c95`.
- Laut Bericht: Suite 0, 438 = 438, Lint 0.
- Den Diff habe ich selbst gelesen.
- Zwei Abweichungen des Bauenden habe ich übernommen:
  - Punkt 4: Telegram-Attrappen statt entfernter Variablen. Fehlen sie, fällt `ladeCreds` auf `/etc/environment` zurück, und dotenv füllt sie aus `.env` auf.
  - Punkt 5: Die Formulierung stand nicht in Zeile 345, sondern in 352-357.

## Lesespur flash (8 Befunde)

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| E-1 | sollte | `test/helfer/eingefrorene-uhr-kindprozess.js:72` startet Kinder mit `...process.env`. Zwei Aufrufer laden darin den Melder (retention_sperr_sichtkontrollen, audit_csv). Dazu kommen viele Kinder ganz ohne `env`. | trägt (grep: 30 Fundstellen mit `...process.env`) | N1: systemisch über `test/umgebung.sh` (Attrappen exportiert), dazu der Helfer |
| E-2 | sollte | Die Aussagen „vier Tests“ (versand-sperre.js) und der Kopf von kind_umgebung sind unvollständig. | trägt | N1 |
| E-3 | sollte | Kleingeschriebenes `s.` (siehe) ist ungeschützt. Das Zitat aus `core/db.js` ist selbst „Siehe“. | trägt (`core/db.js:2901`) | N1 |
| E-4 | Anmerkung | Die Negativkontrolle in nachweis_waisen erreicht nur die Vorprüfung, nicht die Schreibklauseln. | trägt; die Tiefenstaffelung hat der Bauende gemessen | N1: nur den Kommentar |
| E-5 | Anmerkung | Die Tabellen-Zusicherung in session prüft nur den Normalfall. Den Wurf-Pfad belegt nur die Mutation. | trägt | Sammelliste |
| E-6 | Anmerkung | Die Anker in kind_umgebung Teil 2/3 prüfen nur die Präsenz. | trägt | Sammelliste (mit E-1 systemisch entschärft) |
| E-7 | Anmerkung | qr_block N1: „ECHT-Wert steht nirgends“ fängt den Rückfall auf `...process.env` nicht, weil process.env vor dem Spawn zurückgesetzt wird. | trägt | N1: erst nach dem Spawn zurücksetzen |
| E-8 | Anmerkung | Der Kommentar in wartung.js gilt nur für Winter→Sommer. | trägt | N1 |

## Nacharbeit 1 (`bd851e5`, `1d8f93c`, `69ac7f9`), selbst gelesen

- **E-1:** `test/umgebung.sh` entfernt alle `GYMDOCU_TG_*` und exportiert die Attrappe; der Wert kommt aus einer Quelle (`kind-umgebung.js`), ist er leer, wird abgebrochen. Gemessen über alle 444 Tests, mit und ohne Attrappe:
  - dieselben Fehlschläge;
  - mit Attrappe 16 Sendeversuche in 13 Dateien, alle von der Netzsperre abgefangen, keiner lässt einen Test scheitern;
  - Laufzeit gleich.
  - Der Helfer `eingefrorene-uhr` nimmt `kindUmgebung()`.
  - Teil 4 von `kind_umgebung` (31/0) misst am Kind ohne `env`. Gegenproben 2, 4, 4 und 3 FAIL.
- **E-3:** Kleines `s.` ist geschützt; `S.` vor einem Wort ist im Bestand dreimal belegt, jedes Mal als „Siehe“. Rechtsaussagen 70/0, Gegenproben 4 und 3 FAIL.
  - Zerlegung gegenüber `baaf698`: +128 Sätze, 58 Dateien zerlegen anders.
  - Kein Satz mit „DGUV Info“ wird anders zerlegt.
- **E-7:** Die Rücksetzung erfolgt jetzt nach dem Spawn. Gegenprobe 197/2; mit der alten Anordnung blieb sie bei 199/0.
- **E-8:** Der Kommentar wurde präzisiert. Mein Verweis auf `_dst.js:17` war falsch: Er beschreibt Sommer→Sommer. Der Bauende hat alle vier Richtungen gemessen.
- **Suite:** 0, 444 = 444, Lint 0.
- **Offen:** master hereinnehmen (G2, G1) und die Suite neu fahren, dann PR.
- **Zusatz für die Sammelliste E3-b:** Mindestens 13 weitere Tests sind fest auf `gymdocu_test` verdrahtet. Liste im Bericht des Bauenden.

## master herein (`314b9a2`, `ab3db58`), selbst gelesen

- Ohne Konflikte.
- Neu gefunden: `test_feature_check_namen_vereinheitlichen.js` aus 0066 startete Kinder mit `...process.env`. Jetzt nimmt er `kindUmgebung()` und steht in der Verdrahtungsliste. Gegenprobe 33/1.
- Suite auf `ab3db58`: 0, 463 = 463. Lint 0.
- PR offen.
