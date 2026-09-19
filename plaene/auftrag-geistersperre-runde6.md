# Auftrag: Geistersperre, Runde 6 — die vierte Blindstelle in vier Runden

Stand `9c1a894`. Die Gegenlesung zu Runde 5 hat genau das gefunden, wonach ich
sie gefragt habe: **der Wächter ist zum VIERTEN Mal blind, eine Ebene tiefer.**

Ich habe jeden Befund SELBST gemessen, Zahlen unten sind meine.

**Einordnung:** sehr komplex. Es geht um genau die Klasse, die hier viermal
nacheinander eine Ebene tiefer weitergelebt hat — jedes Mal sah der Wächter
vorher geschlossen aus.

## Die Reihe, damit klar ist, worum es geht

    Runde 3   Anker band Anzahl und Position, nicht die BEDINGUNG   58 / 0
    Runde 4   Muster suchte DOPPELTE Anführungszeichen              74 / 0
    Runde 4   Umbenennen-Schlüssel nirgends verankert               74 / 0
    Runde 5   Inventar sucht 'pg_advisory_xact_lock(' WÖRTLICH      87 / 0   <- neu

## Meine eigenen Messungen am Stand 9c1a894

    volle Suite   SUITE_EXIT=0, 0 FAIL-Zeilen, 327 = 327, Lint EXIT 0
    Basis         87 PASS / 0 FAIL

    (A1) fünfter Nehmer in routes/module.js#schliesseSeilSperren, Studio-Lock
         ZUERST (der 40P01-Kreis), geschrieben als
         `SELECT pg_advisory_xact_lock (hashtext($1))` — EIN LEERZEICHEN mehr,
         gültiges SQL                                 -> 87 PASS / 0 FAIL  BLIND
    (A3) EIN führendes Leerzeichen vor
         `async function ladeOffeneHinweise(` in routes/sichtpruefung.js —
         gültiges JS, Funktion unverändert, aber das Handler-Fenster wächst um
         97 Zeilen                                    -> 87 PASS / 0 FAIL  BLIND
    (A2) Advisory-Lock-Stellen AUSSERHALB routes/, von mir gezählt: ACHT
         (core/migrate.js, core/qr-token.js, core/integritaet.js:65,
          core/korrekturen.js ×2, core/seilgeraete.js, core/korrektur-pdf.js,
          server.js:377) — das Inventar sieht keine davon
    Hilfsmessung zu A3: das ROHE Handler-Fenster hat heute GENAU EINEN
         Funktionskopf (Muster `^\s*(async )?function name(`), nämlich den
         eigenen — die Zusicherung „genau ein Funktionskopf im Fenster" ist
         also verfügbar und wäre bei A3 rot geworden.

## ZU BAUEN

### A1 (blockierend): das Inventar erkennt seinen eigenen Gegenstand nicht

`code.indexOf('pg_advisory_xact_lock(')` bindet an die unmittelbar folgende
Klammer. SQL erlaubt dort Leerraum. Das ist wieder eine MUSTERSUCHE am Anfang
einer Kette, die sich Inventar nennt.

**Zu bauen:** die Erkennung an den BEZEICHNER binden, nicht an die Klammer —
`pg_advisory_xact_lock` bzw. `pg_advisory_lock` ohne Klammer suchen, Leerraum
(auch Zeilenumbruch) vor der Klammer zulassen, danach kanonisieren wie bisher.
Die kanonische Form entfernt den Leerraum ohnehin, der Inventareintrag bleibt
also zeichengleich mit dem heutigen — nur wird er jetzt überhaupt gefunden.

**Gegenproben, je einzeln:**
 - A1 wörtlich (mit Leerzeichen) -> MUSS rot werden. Heute 87 / 0.
 - derselbe Nehmer OHNE Leerzeichen, einfache und doppelte Anführungszeichen
   -> beide weiterhin rot (heute schon: 84 / 3).
 - unveränderter Baum -> 0 Kreuze, und das Inventar zählt dieselben Einträge
   wie heute.

**Benannte Grenze, die bleibt und in den Kommentar gehört:** SQL in einer
Variablen, aus Stücken zusammengesetztes SQL und ein Lock in einem
SQL-Kommentar werden weiterhin nicht erkannt. Das ist keine Ausrede — es ist
die Grenze eines Textscans, und sie gehört DASTEHEND statt stillschweigend.

### A2: das Inventar sagt `routes/`, der Kommentar behauptet „kein Bestandsweg"

`routes/sichtpruefung.js` behauptet an der Lock-Zeile: „Kein Bestandsweg nimmt
Studio-Lock -> Tagesschlüssel (statisch bewacht …)". Bewacht ist `routes/`.
Ausserhalb liegen ACHT weitere Stellen (von mir gezählt, Liste oben) — darunter
`core/integritaet.js:65`, die dieser Beitrag SELBST über `auditAppend(…, t)`
aufruft und die für seine Lock-Ordnung tragend ist.

**Zu bauen:** den Erfassungsbereich auf den PRODUKTIVBAUM ausweiten — `routes`,
`core`, `workers` plus die Wurzeldateien (der Helfer nimmt sie im
Verzeichnis-Modus ohnehin mit, `server.js:377` ist eine davon). Die literale
Inventarliste wächst entsprechend; die Tagesschlüssel-Erkennung und „erste
Anweisung" bleiben unverändert.

Wenn sich beim Bauen zeigt, dass das Inventar dadurch unpflegbar wird (zu viele
Einträge, zu häufige Änderungen), dann sag mir das MIT ZAHL — und wir engen
stattdessen den Kommentar ein, statt die Zusicherung zu verwässern. Aber
entscheide das nicht still.

**Gegenprobe:** eine Tagesschlüssel-Anweisung unmittelbar nach
`core/integritaet.js:65` einfügen -> MUSS rot werden (heute unsichtbar).

### A3: die Fenstergrenze des Handler-Ankers ist nicht gebunden

`\n(async function |function |router\.(get|post)\()` erkennt Zeichenfolgen nach
einem Zeilenumbruch, keine Funktionsgrenze. EIN führendes Leerzeichen verschiebt
das Fenster um 97 Zeilen in eine fremde Funktion hinein — gemessen 87 / 0.

**Zu bauen:** KEIN JS-Parser (zu gross für diesen Beitrag). Stattdessen die
billige Referenz, die ich schon gemessen habe: **im ROHEN Fenster (vor `glatt`)
darf genau EIN Funktionskopf stehen** — Muster `^\s*(async\s+)?function\s+
[A-Za-z0-9_]+\s*\(` mit `m`-Flag, Sollwert literal 1, heute gemessen 1. Das
fängt beides: eine verschobene Grenze zieht eine fremde Funktion herein (dann 2),
und ein eingerückter verschachtelter Funktionskopf fällt ebenfalls auf.

**Gegenproben:**
 - A3 wörtlich (ein Leerzeichen vor `async function ladeOffeneHinweise(`)
   -> MUSS rot werden.
 - unveränderter Baum -> grün, Zahl 1.

## ZU DOKUMENTIEREN, NICHT ZU BAUEN

In den Runde-5-Abschnitt von `docs/offene-befunde-31-08-2026.md`, je mit
„gemessen/gelesen":

- **D9:** `wirksamerBereich()` ist nur der Export-Alias von `pruefeBereich()`
  (`test/helfer/quelltext-scan.js`). Der Literalvergleich bewacht damit die
  DEKLARIERTE Endungsliste, nicht deren VERWENDUNG: ein Schnitt im inneren
  Prädikat des Scanners (`entry.name.endsWith('.js')` statt der Liste) ändert
  den gemeldeten wirksamen Bereich nicht. Im erfassten Baum gibt es heute keine
  `.cjs`/`.mjs`-Datei — der Bestand ist also keine Positivkontrolle für diese
  beiden Endungen. NICHT gebaut: eine synthetische Fixtur dafür gehört zum
  Helfer, nicht in diesen Beitrag. Festgehalten, damit „bewacht" nicht mehr
  behauptet als es hält.
- **D10:** das Inventar schneidet den Eintrag am ersten `;` ab. Ein Semikolon
  IM Schlüsseltext verschiebt die Grenze. Ein solcher Eingriff macht den
  Literalvergleich normalerweise rot, ein grüner Umweg ist daraus nicht
  hergeleitet — aber es ist eine Textheuristik und gehört benannt.
- **D11:** ein bereits inventarisierter Lock mit Schlüssel aus einer VARIABLEN
  (`routes/auth.js:530`, Schlüsselbildung getrennt bei `:1000`) wird vom
  Inventar als Eintrag geführt, seine Bedeutung aber nicht verfolgt: eine
  Änderung der Schlüsselbildung ändert den Eintrag nicht.
- **D12:** die 87 PASS sind NICHT 87 unabhängige Nachweise — mehrere
  Zusicherungen bewachen absichtlich denselben Eingriff. Das ist in Ordnung und
  gehört dokumentiert, damit die Zahl nicht als Abdeckungsmass gelesen wird.

## Auflagen

- Kein Kommentar und kein Testkopf darf behaupten, die Geistersperre sei
  erledigt, und keiner darf mehr behaupten als der Wächter hält. Wenn A2 den
  Bereich ausweitet, wird der Kommentar dadurch WAHR — dann bleibt er; wenn du
  A2 nach Messung anders löst, wird der Kommentar eingeengt.
- Gegenproben wie gehabt: Zielpfad als Argument, Abbruch bei ≠ 1 Fundstelle,
  Marker mitschreiben, `node --check`, Rücknahme gegen eine unabhängige
  `cp`-Kopie mit `diff` EXIT 0 und md5, nie mit einem Testlauf verkettet.
- Zum Schluss: volle Suite ohne Pipe und ohne äusseres `flock`,
  Dateizahl-Ritual, `npm run lint` mit wörtlichem Ergebnis, Marker-Scan,
  `git status` leer. COMMITTE UND PUSHE, BEVOR du auf einen Hintergrundlauf
  wartest.
- Wegwerf-DB `gymdocu_test`; fehlt sie nach einem Suite-Lauf:
  `sudo -u postgres createdb -O gymdocu gymdocu_test`.
- Widersprich mir, wo ich falsch liege. Bei A2 rechne ich ausdrücklich damit,
  dass du mir eine Zahl meldest, die gegen die Ausweitung spricht.
