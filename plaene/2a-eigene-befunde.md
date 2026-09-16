# Beitrag 2a — eigene Befunde aus dem Prüf-Ritual (15.09.2026)

Gefunden beim Lesen des Diffs, VOR der unabhängigen Review. Jeder Befund
wird noch selbst gemessen; der Stand der Messung steht dabei.

## B1 — Die Mandantentrennungs-Zusicherung kann nicht rot werden (blockierend)

`test_feature_ausmusterung_retention.js`, Abschnitt 4. Die Zeile für Studio B
wird per `legeDefekt(B, …)` angelegt, und UNMITTELBAR danach wird zugesichert,
sie sei nicht markiert und existiere noch. Zwischen INSERT und Zusicherung
läuft KEIN `markiereAblaufkandidaten()`/`fuehreLoeschungenAus()` mehr — alle
A-Läufe liegen davor. Eine frisch eingefügte Zeile hat `markiert_zur_loeschung_am
= NULL` und existiert; beide Zusicherungen sind damit tautologisch.

Das ist genau Punkt 2 der Prüfreihenfolge („Prüfungen, die nicht rot werden
können") und zugleich Punkt 1 („Mandantentrennung") — die teuerste Kombination.

**Behebung:** die B-Zeile VOR den A-Läufen anlegen (zu den übrigen Fixturen),
oder nach dem INSERT noch einmal `markiereAblaufkandidaten(A)` UND
`fuehreLoeschungenAus(A)` fahren und ERST DANN zusichern.

**Messung (ausstehend):** `studio_id = $1` aus dem Markier-UPDATE in
`core/retention.js` entfernen und den Test fahren. Bleibt er grün, ist der
Befund belegt. Der Gegenprobenlauf des Ausführenden
(`out-ausm-retention-rot.log`) belegt ihn NICHT — dort fielen drei andere
Zusicherungen, die beiden Mandanten-Zusicherungen blieben in BEIDEN
Richtungen grün.

## B2 — Die Zeitzonenfalle steht wieder in einer NEUEN Datei (klein)

`test_feature_ausmusterung_pdf.js`:

    const bis = new Date(heute.getFullYear(), heute.getMonth() + 1, 0)
        .toISOString().slice(0, 10);

Genau das Muster, das #432 geschlossen hat und das der Takt ausdrücklich als
„nicht als Vorbild kopieren" führt: aus lokalen Werten gebaut, über
`toISOString()` gelesen. Östlich von UTC ergibt das den Vortag, der Zeitraum
endet also einen Tag zu früh.

**Heute folgenlos** — die Fixtur liegt auf dem 10. des Monats, der Container
und der CI-Runner laufen auf UTC. Die Datei setzt auch kein
`process.env.TZ='Europe/Berlin'`. Die beiden Schwesterdateien machen es
richtig (`toLocaleDateString('sv-SE', {timeZone:'Europe/Berlin'})` bzw. feste
Literale) und begründen es sogar im Kopfkommentar — hier ist es schlicht
durchgerutscht.

**Behebung:** `bis` aus den Komponenten zusammensetzen statt über
`toISOString()`.

## Geprüft und in Ordnung

- **SQL-Parameternummern in beiden PDF-Abfragen** nachgezählt, beide korrekt
  ($7/$8 bzw. $7/$8/$9 gegen die jeweilige Argumentliste).
- **`--gd-info-grund`/`--gd-info-text`** existieren in `core/design.js`
  (Zeilen 118/119); der Kontrast 9,61:1 ist dort bereits gerechnet und
  bestanden.
- **`datumSpalte` wird NUR in drei Prädikaten** (`core/retention.js:534-536`,
  `620-622`) und als Anzeigetext (`routes/aufbewahrung.js:324/335/645`)
  verwendet — nie als Spaltenname in einer SELECT-Liste oder einem ORDER BY.
  Der COALESCE-Ausdruck ist dort zulässig.
- **`fileResolver` fehlt auf BEIDEN Retention-Einträgen** — die Aufnahme von
  `test_feature_ausmusterung_retention.js` in die Bekannte-Lücke-Liste von
  `test_feature_provisioning_pdf_root_static.js` ist damit belegt, nicht
  behauptet.
- **Weitere Leser gesucht und gemessen:** `core/wiederholung.js:150
  statistik()` liefert `gesamt`/`offen`/`medianReparaturMs`, KEINEN
  abgeleiteten „repariert"-Zähler — die Kacheln in
  `routes/admin/geraete.js:4407-4415` behaupten also nichts Falsches.
  `routes/sichtpruefung.js:3187` fällt für eine ausgemusterte Zeile in den
  ehrlichen Zweig („hat inzwischen den Status …"). Kein Leser in `routes/`
  stellt `geraete_sperren.freigegeben_am` als Zustand dar (nur das PDF, und
  das ist behandelt).
- **Alle fünf Gegenproben des Ausführenden nachgesehen** (Rot-/Grün-Logs im
  Scratchpad): retention 3 gefallene Zusicherungen, pdf 8+, lesepfade 1
  (19858 Std statt 72), statistik 2, reparaturformular 6. Alle substanziell.

## Offene Punkte, ausdrücklich NICHT in 2a gebaut

- **`core/defekt-feedback.js:51/74`** filtert auf `status = 'repariert'`. Ein
  Melder erfährt vom Abschluss seiner Meldung also NICHTS, wenn das Gerät
  ausgemustert statt repariert wurde. Kein FALSCHER Satz — aber eine Lücke.
  Gehört nach 2b beurteilt.
- **`core/wiederholung.js:52`** zählt eine Ausmusterung bewusst NICHT als
  Reparatur für die Wiederkehr-Erkennung. Richtig so, und im Test in beide
  Richtungen belegt.
