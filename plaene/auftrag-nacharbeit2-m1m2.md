# Auftragspapier — Nacharbeit 2 an der Mandantengrenze M1/M2

Stand 18.09.2026, Zweig `claude/mandantengrenze-fremd-ids`, Basis Commit
`4c50659`. Fassung 1 — geht VOR der Bau-Runde an den Gegenleser.

## Woher die Befunde kommen

Drei Spuren über denselben Diff. Jeder Befund unten ist vom Haupt-Agenten
SELBST nachgemessen; was nicht getragen hat, steht am Ende mit Begründung.

- **Spur DeepSeek** (`deepseek-v4-pro`, `effort: max`): 7 Befunde, 6 getragen.
- **Spur Mutation** (Executer, misst nur): 2 Befunde, beide getragen, dazu
  drei Mutationen, die NICHTS zeigten — auch die stehen unten, weil ein
  geprüfter und robuster Punkt eine Auskunft ist.
- **Spur sol**: läuft noch. Diese Fassung wird ergänzt, nicht ersetzt.

**Die beiden Spuren haben sich bei EINEM Befund getroffen und bei je einem
NICHT.** Das ist dasselbe Muster wie am 13.09.: DeepSeek fand ihn durch
LESEN, die Mutationsspur durch MESSEN.

## A — BLOCKIEREND: N9 hat keine Positivkontrolle

**Von BEIDEN Spuren gefunden.**

Die drei N9-Zusicherungen (`test_feature_mandantengrenze_fremd_ids.js:356,
365, 374`) prüfen ausnahmslos `ce* === 0`. **Keine einzige Stelle im ganzen
Lauf prüft, dass `anzahlConsoleError` überhaupt `> 0` werden KANN.** `ceEE`
(Zeile 335) wird sogar erfasst und dann nie mit `ok()` geprüft.

Selbst nachgemessen (grep über die Datei): drei Treffer `ce.. === 0`, null
Treffer `> 0`. Damit folgt zwingend, was die Mutationsspur zusätzlich
gemessen hat:

- `console.error` → `console.warn` in `routes/belehrungen.js:1969`:
  **EXIT 0, 86 PASS / 0 FAIL**, identisch zur Grundmessung. Die gesamte
  Schutzwirkung von N9 ist lautlos weg.
- Positivkontrolle derselben Spur, damit klar ist, dass N9 überhaupt etwas
  bewacht: Wächter durch `if (false)` ersetzt → **EXIT 1, 83 PASS / 3 FAIL**,
  und es fallen GENAU die drei N9-Zeilen.

N9 bewacht also richtig — aber seine eigene Signalquelle ist unbewacht. Eine
Umstellung auf strukturiertes Logging (oder schlicht eine Umbenennung) nimmt
den Schutz weg, ohne dass eine der 86 Zusicherungen fällt.

**ZU BAUEN:** Mindestens einen Fall, der den ABSTURZPFAD sicher auslöst,
durch `mitConsoleErrorGezaehlt()` führen und `> 0` zusichern. Die
N1-Negativfälle `Array` und `Objekt` sind dafür belegt geeignet — die
Mutationsspur hat aus der Grundausgabe abgelesen, dass sie echte DB-Fehler
auslösen (`invalid input syntax for type integer`) und `Freischalten-Fehler:`
ins Log drucken. Sie laufen heute ohne die Zähl-Hülle.

**Ausdrücklich NICHT:** die `null`- und `fehlend`-Fälle mit umhüllen — die
laufen über den WÄCHTERpfad und müssen bei 0 bleiben. Wer sie mit umhüllt und
`> 0` zusichert, dreht den Befund um.

**GEGENPROBE (Pflicht, beide Richtungen):**
1. `console.error` in `routes/belehrungen.js:1969` auf `console.warn`
   umbenennen → die NEUE Zusicherung muss FALLEN. Heute: 86/0.
2. Zurücknehmen → wieder grün.
3. Zusätzlich: der Wächter-Fall muss weiterhin bei 0 bleiben (sonst prüft die
   neue Zusicherung nicht den Absturzpfad, sondern irgendeinen Aufruf).

## B — Die statische `return;`-Zusicherung kann für ihren eigenen Zweck nicht rot werden

**Nur von der Mutationsspur gefunden.**

`test_feature_lageplan_sicherheit_static.js:75` prüft
`iReturn = bp.indexOf('return;', iAuswertung)` gegen `iPush`. Das ist eine
reine Textsuche und unterscheidet eine Anweisung nicht von derselben
Zeichenkette in einem Kommentar.

Gemessen: das echte `return;` in `routes/lageplan.js:1917` auskommentiert →
**statische Datei EXIT 0, 24 PASS / 0 FAIL, unverändert**, während die
verhaltende vm-Prüfung in der Schwesterdatei korrekt **EXIT 1** liefert
(„Position NICHT übernommen" fällt, die Position wird trotz 404 übernommen).

Die Suite als Ganzes ist heute also geschützt — aber von der ANDEREN Datei.
Die statische Einzelzusicherung liefert für genau die Regression, die ihr
eigener Text nennt, keinen eigenen Beitrag.

**ZU BAUEN:** Vor den Textprüfungen die Kommentare abziehen (Hausregel:
„Statische Prüfungen über Quelltext entfernen zuerst Kommentarzeilen"), dazu
eine Positivkontrolle, dass nach dem Abzug überhaupt noch etwas übrig ist.

**GEGENPROBE:** dasselbe Auskommentieren wie oben → die statische Zusicherung
muss jetzt FALLEN. Heute: 24/0.

## C — Die statische Richtungsprüfung sucht im GANZEN Quelltext

`test_feature_lageplan_sicherheit_static.js:59-60`:
`!src.includes('if (res.httpOk){')` durchsucht die ganze Datei, nicht den
Ausschnitt der geprüften Funktion. Jedes künftige, völlig unschuldige
`if (res.httpOk){` an anderer Stelle färbt den Wächter rot.

**ZU BAUEN:** auf den Ausschnitt von `wertePositionsAntwort()` begrenzen —
analog zum bereits vorhandenen `bp`-Slice für `bindPlace()`.

## D — Die statische Datei hat keine Mindest-Prüfzahl

Die Schwesterdatei erzwingt `MINDEST_PRUEFUNGEN`; die statische nicht
(gemessen: null Treffer auf `MINDEST`). Ein stilles Entfernen von Abschnitt 4
liefe grün durch.

**ZU BAUEN:** dieselbe Schranke. **Die Zahl VON HAND herleiten, nicht aus dem
Lauf abschreiben** — sonst bewacht sie genau die neu ergänzten Zusicherungen
nicht.

## E — Die halbe Admin-Sitzung ist im N12-Test ungeprüft

`requireAdmin` hat drei Fallklassen; der Test fährt nur „leere Sitzung" und
„gültige Admin-Sitzung" (gemessen: `totpOk` kommt nur mit `true` vor). Der
Pfad `rolle:'admin', totpOk:false` — der die Sitzung LÖSCHT und danach je nach
`Accept` 401 oder 302 liefert — ist nicht abgedeckt.

**ZU BAUEN:** einen Fall mit `{ rolle:'admin', totpOk:false }`, der beide
Antwortformen prüft UND dass die Sitzung danach gelöscht ist.

## F — Der Kommentar in `core/auth.js` verallgemeinert unzulässig

Er sagt, der Zweig betreffe „unsere eigenen fetch()-Aufrufe". SELBST gezählt
über `git show 4c50659:routes/*.js`: **neun Browser-`fetch`-Aufrufe auf eigene
Endpunkte, genau EINER trägt den `Accept`-Header** (`routes/lageplan.js:1477`,
der `api()`-Helfer). Zwei der fehlenden stehen in derselben Datei
(`:1524`, `:2843`), weitere in `routes/belehrungen.js:575,598,646` und
`routes/module.js:1092,1102`. Die serverseitigen Aufrufe in
`routes/webhooks.js` zählen nicht mit — die gehen nach draussen.

**ZU BAUEN:** nur den KOMMENTAR auf die tatsächlich abgedeckte Klasse
begrenzen. **Die anderen acht Aufrufer NICHT mit umstellen** — das ist ein
eigener Beitrag, der acht Stellen und ihre Fehlerbehandlung anfasst, und er
gehört nicht in eine Nacharbeit an der Mandantengrenze. Stattdessen als
datierter offener Punkt in `docs/offene-befunde-31-08-2026.md`, mit den oben
gezählten Fundstellen.

## G — Test-Abfrage ohne `studio_id`

`test_feature_mandantengrenze_fremd_ids.js:276`:
`SELECT etage_id FROM geraete_positionen WHERE id=$1`.

Sachlich liefert das heute die richtige Zeile (`id` ist je Tabelle eindeutig),
es ist also kein Fehler, sondern Hygiene an unserer eisernen Regel. Einzeiler.

**ZU BAUEN:** `WHERE studio_id = $1 AND id = $2`.

## Was NICHT gebaut wird, und warum

- **Der Flakiness-Befund zum Zeitvergleich (DeepSeek 6) FÄLLT.** Seine
  Begründung läuft in die falsche Richtung: `clock_timestamp()` wird über
  JavaScript auf Millisekunden ABGESCHNITTEN, der Bezugspunkt rutscht also
  nach FRÜHER, und der Vergleich `>` wird dadurch wahrscheinlicher wahr, nicht
  unwahrscheinlicher.
- **Die acht fehlenden `Accept`-Header** (s. F) — eigener Beitrag.
- **Eine Mengenschwelle gegen „zwei entfernen, eine ergänzen"** — die
  Mutationsspur hat das ausdrücklich als generische Eigenschaft jeder
  Mengenschwelle benannt und nicht gemessen. Eine Schwelle kann das nicht;
  dafür sind die inhaltlichen Zusicherungen da.

## Geprüft und robust (kein Auftrag, aber Auskunft)

Die Mutationsspur hat drei Dinge gemessen, die NICHTS zeigten:

- **vm-Extraktion bei doppelter Marke:** eine zweite `// ── Etage wählen`-Zeile
  vor der echten → **EXIT 1 mit `SyntaxError: Unexpected end of input`**, also
  LAUTER Absturz statt falschem Grün. Nicht erschöpfend: andere
  Duplikat-Varianten am `bpStart`/`bpEnd`-Paar wurden nicht gefahren.
- **`MINDEST_PRUEFUNGEN`** fängt schon das Entfernen EINER Zusicherung
  (**EXIT 1, 85 PASS / 0 FAIL** plus die eigene Abbruchmeldung).
- **Kein anderer `console.error` liegt auf dem M2-Pfad** — statisch geprüft
  über alle Fundstellen in `routes/belehrungen.js` und `core/db.js`. N9 kann
  also nicht fälschlich rot werden.

## Unverhandelbar für diese Runde

- Jede Abfrage trägt `studio_id`.
- Dieselbe Suite ist auf dem Live-Server Deploy-Gate: keine echten Dienste,
  keine echten Prozesse, kein echtes Dateisystem.
- Jede neue Zusicherung braucht die Gegenprobe in BEIDE Richtungen, wörtlich
  gemeldet, mit `node --check` vor jeder Messung und Rücknahme gegen eine
  unabhängige `cp`-Kopie (`diff` EXIT 0), nie `git checkout`/`git stash`.
- `npm run lint` läuft und wird wörtlich gemeldet, auch bei Grün.
