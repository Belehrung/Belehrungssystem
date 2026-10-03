# Diffprüfung C6-D3 Zeit und Bereich 04 (03.10.2026)

Zweig `c6d3-zeit`, Stand `d7d3956`, 36 Dateien (+1925/−221), davon Produktion 14 Dateien (+391/−187).

Suite des Bauenden auf `d7d3956`: SUITE_EXIT=0, 1194 s. Ich habe 518 = 518 selbst nachgezählt (`diff` EXIT 0). Lint 0; Marker 6, alle in
`docs/offene-befunde-31-08-2026.md`. Der erste Lauf auf `497177f` war rot (6 Wächter); alle sechs sind in `d7d3956`
nachgezogen, jeweils mit Gegenprobe.

- **Produktionsdiff** (1029 Zeilen): selbst gelesen. Kein blockierender Befund. Am Bestand nachgemessen:
  - `jetztISO` liefert um Mitternacht `00` und nicht `24`.
  - `formatDatumDe(dbDatum)` liefert dasselbe Dateinamenformat wie vorher.
  - Beide Aufrufer von `berechneNaechsteFaelligkeit` liefern ein geprüftes Datum. `"null"` warf auch vorher.
  - `audit.js` greift auf `pruefung.*` nur hinter der `null`-Weiche zu.
  - `setConfig` nimmt `t`.
  - `resetMagiclineConfig` und `confirmActivation` haben je einen Aufrufer.
- **Lesespur** flash, Bündel „weiterer Umkreis“ (Geschwisterstellen, Aufrufer, Sperrordnung): 15 Runden, 0,88 $.

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| B1 | `routes/admin/shared.js:246-247` (Badge „neue PDFs“) und `routes/admin/dashboard.js:601-602` (ZIP-Link, Monatsname) bilden den Vormonat über den Prozesskalender. Das ist dieselbe Rechnung, die A1-a9 in `getLastMonthRange` behoben hat, hier zweimal wörtlich. | trägt (gelesen). Auf einem Nicht-Berliner Server ist im Fenster um den Berliner Monatswechsel der Vormonat der falsche. | Nacharbeit 1: EIN Helfer `vormonatKey()` in `core/datum.js`, genutzt von shared, dashboard und `getLastMonthRange` |
| B2 | `routes/bezirk-magicline.js:44`: Der dritte Aufrufer von `oeffneTofuFenster` antwortet mit 500, meldet aber nicht. | trägt | Nacharbeit 1: `melde()` |
| B3 | `core/wiederholung.js:171-174`: Die 12-Monats-Achse läuft über den Prozesskalender. Ein Defekt kurz nach dem Berliner Monatswechsel fällt aus der Achse. | trägt (gelesen), gleiche Klasse | Nacharbeit 1 |
| B4 | `verbandbuch.erstellt_am` ist UTC, `unfall_zeit` Berliner Wandzeit. | trägt, ist aber schon im Repo benannt (`core/datum.js:53-60`) und nicht neu | Sammelliste (C6D3-1) |
| B5 | `routes/verbandbuch.js:466-467`: Das Formular bildet `client_erstellt_am` mit `getHours()` in der Gerätezone. Der Server liest den Wert seit V03-4 fest als Berliner Zeit. Die Offline-Warteschlange macht es richtig (`public/offline-queue.js`, `jetztBerlin()`). | trägt (gelesen) | Nacharbeit 1: derselbe `Intl`-Ausdruck wie in der Warteschlange |
| Z1 | `test_feature_c6d3_magicline.js:61-64`: Der Sollwert 6/5 wird aus dem geprüften Code gezogen. | trägt | Nacharbeit 1: Literal |
| Z2 | `test_feature_c6d3_schema_baseline.js:91` ist gegenüber Zeile 90 tautologisch. | trägt | Nacharbeit 1: streichen |
| Z3 | Testfixturen mit `Date.now() ± n*86400000`: `test_feature_unterschriften_neueste.js:264-265`, `test_feature_dashboard.js:63` (sogar UTC über `toISOString`). | trägt (gelesen); kann an Umstellungstagen bzw. 0–2 Uhr Berlin kippen | Nacharbeit 1: `plusTage(formatBerlinDate(…))` |
| S1 | Schlechter als vorher: Die Download-Bestätigung (V04-12) bleibt aus, wenn der Prozess zwischen Senden und Rückruf stirbt; das Badge zeigt dann weiter „neue PDFs“. | trägt; gewollte Folge (fehlt statt falsch) | Sammelliste (C6D3-2) |
| S2 | `POST /admin/module`: Zwischen Commit und Protokoll gibt es ein Fenster (im Kommentar als benannte Grenze geführt). Die alten Werte werden ausserhalb der Transaktion gelesen. | trägt; bestand vorher je Schlüssel | Sammelliste (C6D3-3) |
| S3 | V04-10: Die Kette wird nicht mehr beiläufig bei jedem Aufruf geprüft. | trägt; ist die Entscheidung des Auftrags | keine |

Der Plan-Gegenleser für Nacharbeit 1 entfällt: Sie behebt Geschwisterstellen derselben Klasse, deren Auftrag schon geprüft
war, und ändert keine Architektur.
