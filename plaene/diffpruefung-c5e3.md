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
