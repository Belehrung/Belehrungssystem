# Auftragspapier — M3-Härtung, FASSUNG 2: echter Parser im Gate, echter Browser in der CI

**Betreiber-Entscheidung 20.09.2026** (Wortlaut der gewählten Möglichkeit:
*„Gleich den Parser und den CI-Render-Lauf"*). Fassung 1 dieses Papiers ist
damit **verworfen** — sie schlug eine Härtung der regulären Ausdrücke vor,
und zwei Planprüfungen haben darin unabhängig voneinander **dieselben zwei
blockierenden Fehler** gefunden. Beide habe ich selbst nachgemessen:

    manipulations<strong>sicher</strong>   → Browser: "manipulationssicher"   (EIN Wort)
    <p>Wir beugen vor</p><p>jedem …</p>    → Browser: "…vor\n\njedem …"       (harter Umbruch)

Meine Vorgabe „Inline-Auszeichnung durch ein LEERZEICHEN ersetzen" hätte
daraus `manipulations sicher` gemacht — und damit **genau die Lücke erzeugt,
die sie schliessen sollte** (gemessen: `/manipulationssicher/i` trifft dann
nicht mehr, und die Sollzählung für `Manipulationsschutz` verliert einen
Treffer). Meine Vorgabe „Block-Tags stehen lassen" trägt ebenfalls nicht: das
erweiterte Gerichts-Muster verbraucht die Tags selbst als Zwischenwörter
(gemessen: `<p>Wir beugen vor </p> <p>jedem deutschen Gericht</p>` trifft).

**Die Lehre, und sie bestimmt diese Fassung:** ein von Hand aus regulären
Ausdrücken gebauter Parser ist ein Parser — nur ein unvollständiger. Wenn
ohnehin geparst wird, dann mit einem, der die Sprache kennt.

---

## 0. Die gemessene Randbedingung, die den Bau bestimmt

**Der Parser gehört in `dependencies`, NICHT in `devDependencies`.**

Nachgemessen, alles im Hauptserver-Repo:

    ops/gymdocu-deploy:553        REPO="${GYMDOCU_DEPLOY_REPO_HAUPTSERVER:-/var/www/hauptserver}"
    ops/gymdocu-deploy:1978-1984  elif [ -x "$REPO/test/run.sh" ]; then … bash "$REPO/test/run.sh"
    ops/gymdocu-deploy:70         „Produktionsserver installiert mit `npm ci --omit=dev` (bewusst …)"
    package.json                  hat heute ÜBERHAUPT KEINEN devDependencies-Block

Die Suite dieses Repos läuft also auf dem Produktionsserver als Pflicht-Gate,
und der Server installiert bewusst ohne Entwicklungsabhängigkeiten. Eine
`devDependency` fehlte dort — das Gate würde mit `MODULE_NOT_FOUND` rot, und
zwar erst auf dem Server, nicht hier und nicht in der CI.

**Vor dem Einbau zu messen und im Bericht zu nennen:**
1. `parse5` baut nichts nativ (kein `binding.gyp`, keine Build-Skripte) — ein
   nativer Baustein bräuchte auf dem Server eine Werkzeugkette.
2. `npm audit --omit=dev --audit-level=high` bleibt grün (das ist ein
   CI-Gate, `.github/workflows/ci.yml:27-28`).
3. Wie viele Pakete `npm ci` danach installiert (heute 272) — die Zahl gehört
   in den Bericht, nicht geschätzt.

---

## 1. Teil A — Live-Gate: `test_landing.js` parst statt zu raten

**Kein Server, kein Kindprozess, kein Browser.** Nur ein Parser im selben
Node-Prozess.

### 1.1 Der Helfer `seiteLesen(html)`

Liefert **eine Liste von Textblöcken**, keine einzelne Zeichenkette — das ist
der Kern, denn alle Verbotsmuster laufen danach je Block und können keine
Absatzgrenze mehr überqueren.

Regeln, jede aus einer Messung am echten Browser (`page.setContent`,
`innerText`), nicht aus der Anschauung:

| Fall | gemessen | Regel |
|---|---|---|
| `manipulations<strong>sicher</strong>` | `"manipulationssicher"` | Inline-Element trennt **nicht**, kein Ersatzzeichen |
| `Manipulations<strong>schutz</strong>` | `"Manipulationsschutz"` | dito, auch für die Positivzählung |
| `<p>a</p><p>b</p>` | `"a\n\nb"` | Block-Element erzeugt eine **Blockgrenze** |
| `alle <b>sechs</b> Module` | `"alle sechs Module"` | der Leerraum steht schon im Quelltext |

Weiter:
* **Kommentare** liefert parse5 als eigene Knoten — sie zählen NICHT zum
  sichtbaren Text (siehe aber 1.4, sonst verlieren wir heutige Abdeckung).
* **`<script>`, `<style>`, `<template>`** liefern keinen sichtbaren Text. Das
  schliesst die Umgehung, ein `id="module"` im Rohtext eines
  `<script type="text/plain">` unterzubringen.
* **Entities löst parse5 selbst auf, genau einmal.** Keine eigene Tabelle —
  eine Teilliste benannter Entities ist keine Browsersemantik, und doppelt
  dekodiertes `&amp;shy;` erzeugt Treffer, die es nicht gibt.
* **`hidden` und `aria-hidden="true"`** werden übersprungen.
  **Grenze, die in den Kopfkommentar gehört:** echte Sichtbarkeit hängt am
  berechneten Stil (`display`, `visibility`, `clip-path`, Schriftgrösse 0).
  Das kann der Parser NICHT sehen — dafür ist Teil B da.

### 1.2 Struktur statt Schreibweise

Alles über den geparsten Baum, nicht über Zeichenketten:

* **`#module`** muss ein ELEMENT mit dieser `id` sein. (Heute zählt eine `id`
  im HTML-Kommentar mit — gemessen: `matchAll(/\bid="([^"]+)"/g)` über
  `<!-- <section id="module"> -->` liefert `['module']`, während der Browser
  `null` liefert.)
* **Klassen als TOKEN** aus dem geparsten Attribut. `class="pillar hervor"`
  ist eine Säule (gemessen: das heutige Muster zählt bei drei sichtbaren nur
  zwei), `pillar-ic` ist keine.
* **Jedes `.mod-legal` muss einen Vorfahren `.mod` haben** — nicht nur
  irgendwo in `.mod-list` liegen. (Gemessen: ein Abzeichen in den `<footer>`
  verschoben, Solltabelle meldete weiterhin `✓`.)
* **`.mod-legal-p`**: muss ein Element sein UND genau `§` oder `§§`
  enthalten. Ein LEERES Span mit dem § als Nachbartext erfüllt heute die
  Struktur und verliert Fettung und Farbe.
* **Solltabelle**: je Abzeichen der normalisierte Text UND die Angabe, ob es
  ein `mod-legal-p` trägt (9× ja, 5× nein). Reihenfolge wie bisher.

### 1.3 Das CSS-Verbot wird ein VERBOT, keine Wertprüfung

Heute: `/content\s*:\s*["']\s*§/`. Gemessen umgangen durch
`content:"\00A7"`, `Content:"§"` — und eine Wertprüfung bleibt auch bei
`content: var(--p)` blind, während sie bei
`content:"§"; content:none` einen Fehlalarm erzeugt.

**Deshalb: jede `content`-Deklaration in einer Regel, deren Selektor
`.mod-legal::before` (oder `::after`) trifft, ist verboten — unabhängig vom
Wert.** Das Element darf überhaupt keinen erzeugten Inhalt haben; damit gibt
es keinen Wert mehr zu umgehen und keinen Fehlalarm.
**Bekannte Grenze, in den Kommentar:** ein anderer Selektor, der dasselbe
Element trifft (`.mod-list .mod-legal::before`), entginge einer Suche über
den Selektortext. Das misst Teil B.

### 1.4 Was NICHT verloren gehen darf

Kommentare aus dem sichtbaren Text zu nehmen ist richtig — **es nimmt aber
heutige Abdeckung weg**: gemessen trifft `/manipulationssicher/i` den rohen
Kommentar `<!-- manipulationssicher -->` heute. Deshalb **zusätzlich** eine
eigene Zusicherung: die verbotenen Wörter kommen auch in Kommentaren nicht
vor. Zwei Zusicherungen, zwei Begründungen — sichtbarer Text und
Quelltext-Hygiene sind zwei Fragen.

### 1.5 „Gericht" wird ganz verboten, statt ein Muster zu verfeinern

Mein Vorschlag aus Fassung 1 (`/\bvor\b(?:\s+\S+){0,3}\s+Gericht\b/i`) ist
gemessen zu weit UND zu eng: er trifft über einen Punkt hinweg
(`vor dem Termin. Das Gericht` → `true`) und harmlose Sätze
(`Ein Streit wird vor dem zuständigen Gericht geklärt.` → `true`), während
`vor allen deutschen Gerichten` durchrutscht.

**Gemessen kommt `Gericht` auf beiden Seiten heute 0× vor.** Also: das Wort
`Gericht` (mit allen Beugungen, `/gericht/i` als Wortbestandteil) ist auf
diesen beiden Seiten verboten — Punkt. Kein Muster, keine Ausnahme.
**Der Preis gehört in den Kommentar:** eine künftige, sachlich richtige
Erwähnung löst einen Fehlalarm aus und erzwingt eine bewusste Entscheidung.
Das ist bei einer Werbeseite gewollt.

---

## 2. Teil B — CI: ein eigener Lauf mit echtem Browser

**Neuer Job in `.github/workflows/ci.yml`, getrennt von `npm test`.** Heute
fährt die CI nur `npm ci`, `npm test` und `npm audit` (gemessen,
`.github/workflows/ci.yml:16-18,27-28`).

* Playwright als Abhängigkeit **des Jobs**, nicht des Repos; Browser im Job
  installiert.
* **`page.setContent()`** statt eines HTTP-Servers.
* **Alle Netzanfragen abweisen** (`page.route('**', r => r.abort())`), damit
  der Lauf nichts nach draussen tut.
* Geprüft wird die WIRKUNG, nicht der Quelltext:
  1. jedes `.mod-legal`: `getComputedStyle(el,'::before').content === 'none'`
  2. jedes `.mod-legal-p`: Gewicht 700, Farbe `rgb(26, 122, 74)`, Text `§`
     oder `§§` (Sollwerte gemessen, nicht geraten)
  3. `document.getElementById('module')` ist nicht `null`
  4. Zahl der SICHTBAREN `.pillars .pillar` (berechnetes `display !== none`)
     stimmt mit dem Zahlwort überein
  5. jedes `.mod-legal` hat `closest('.mod')`
  6. `document.body.innerText` beider Seiten enthält keines der verbotenen
     Wörter
  7. `ketten.html` zeigt kein bezahltes Angebot (gerenderter Text, nicht
     Klassenname)
* **Dieser Job steht NICHT in `test/run.sh`.** Der Live-Server bleibt
  browserfrei. Das gehört als Satz in den Kopf der Datei, mit Verweis auf
  `test/e2e-landing-netzwerk.js:16-31`, wo dieselbe Trennung schon begründet
  ist.

**Zur Begründung, die ich in Fassung 1 zu weit gefasst hatte:** das Verbot
lautet „keine unkontrollierten Systemwirkungen", nicht „kein Kindprozess".
Gemessen startet das Gate heute schon `bash` (`test_landing.js:391,415`)
unter einer ausdrücklich dokumentierten Ausnahme
(`test_feature_keine_systemeingriffe.js:111-118,319`). Ein Browser im
Live-Gate bleibt trotzdem abgelehnt — er ist schwerer, auf dem Server nicht
vorhanden und hat deutlich mehr Nebenwirkungen.

---

## 3. Abnahme: siebzehn Mutationen, die ROT werden müssen

**Acht sind bereits gemessen und waren GRÜN** — sie sind wörtliche
Abnahmekriterien, keine erfundenen:

1. `.mod-legal::before { content:"\A7"; … }` (alle 14 Abzeichen bekommen ihr
   § zurück, Suite blieb grün)
2. Abschnittskopf auskommentieren, daneben ohne `id` neu setzen
3. `alle sechs&nbsp;Module` im bezahlten Block
4. `mit allen sechs Modulen`
5. `alle <b>sechs</b> Module`
6. `manipulations&shy;sicheren`
7. sechste Säule mit `class="pillar hervor"`
8. `Art. 5 DSGVO` aus dem Modul in den `<footer>` verschieben

**Neun kommen aus den Planprüfungen** und sind ebenfalls Abnahmekriterien:

9. `:root{--p:"§"} .mod-legal::before{content:var(--p)}`
10. `<script type="text/plain"><span id="module"></span></script>` statt des
    Abschnittskopfs
11. `<li>Nur ein Modul enthalten</li>` im bezahlten Block (Singular)
12. `manipulations<strong>sicher</strong>` in einem sichtbaren Absatz
13. `gilt vor allen deutschen Gerichten` (Beugung)
14. `<div class="pillar" hidden>` an einer der fünf Säulen
15. ein `mod-legal` als direktes Kind von `.mod-list`, ausserhalb jeder `.mod`
16. `<span class="mod-legal-p"></span>§ 31 TrinkwV` (leeres Span)
17. auf `ketten.html` ein Angebot, das nur über CSS sichtbar wird
    (`.angebot::before{content:"Kettenpaket · 99 €/Monat"}`)

**Je Mutation ist anzugeben, welche Stufe sie fängt** — Gate oder CI-Lauf.
Nr. 9, 14 und 17 sind ausdrücklich Fälle für den CI-Lauf; wer behauptet, das
Gate fange sie, misst es.

**Positivkontrollen, ohne die keine Rotmessung zählt:**
* `content:"XY"` an einem ANDEREN Pseudoelement bleibt grün.
* `pillar-ic` erhöht die Säulenzahl nicht.
* `Manipulations&shy;schutz` und `Manipulations<strong>schutz</strong>` sind
  GRÜN (heute ist ersteres ein gemessener **Fehlalarm** — die Behebung muss
  ihn beseitigen, nicht vergrössern).
* Der unveränderte Baum: Gate und CI-Lauf beide grün.

---

## 4. Harte Tore

1. `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"` — ohne Pipe, ohne
   äusseres `flock`, `echo` in eigener Zeile; danach das Dateizahl-Ritual mit
   demselben Sieb auf beiden Seiten, `diff` EXIT 0. **Sollzahl im Baum
   messen** (heute 86).
2. `npm run lint` — es gibt hier kein `lint`-Skript; GENAU DAS melden.
3. `npm audit --omit=dev --audit-level=high` nach dem Einbau — wörtlich
   melden.
4. **Jede Mutation an `landing/*.html` zieht den Manifest-Hash mit**, sonst
   ist „rot" nicht von „der Hash ist rot" zu unterscheiden.
5. Mutationswerkzeug: Zielpfad als ARGUMENT, Fundstellen zählen, Abbruch bei
   0 UND bei >1, Marker `GEGENPROBE-` + `DEFEKT`, `node --check` davor,
   Rücknahme gegen unabhängige `cp`-Kopie mit `diff` EXIT 0, nie mit einem
   Testlauf verkettet.
6. Am Ende: `git status` sauber, Marker-Scan **0 Treffer**, Manifest-Hashes
   gleich den eingetragenen.
7. Kein Modellname in Commit-Botschaft oder Dateien. Kein PR.

## 5. Was NICHT gebaut wird

* **Keine Änderung an `landing/index.html` und `landing/ketten.html`** ausser
  einer: ein Kommentar dort behauptet, das alte Pseudoelement habe bei Nr. 6
  UND Nr. 10 „zweimal §" erzeugt. Für Nr. 6 stimmt das, für Nr. 10 nicht —
  dort stand EIN, falsch platziertes §. Drei Wörter berichtigen, Manifest
  mitziehen.
* **Kein Umbau der Seite**, keine Animation, kein Deploy.
* **`revisionssicher`** bleibt unangetastet (GoBD-Fachbegriff, eigener Punkt).
