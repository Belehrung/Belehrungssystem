# Auftragspapier M3 — FASSUNG 2

**Fünf gemessene Fehler auf der Startseite gymdocu.de.**

Fassung 1 ging am 20.09.2026 an zwei Planprüfungen mit verschiedenen Bündeln.
**22 Befunde, 16 nach eigener Nachmessung getragen, 2 gefallen, 1
unbestätigt, 3 ausserhalb des Auftrags.** Einer davon hätte diesen Beitrag
unbrauchbar gemacht, ohne dass es auffällt (Abschnitt 0). Alle Einzelheiten:
`plaene/m3-planpruefung-befunde.md`.

---

## 0. Was Fassung 1 falsch hatte — zuerst, weil es den Ablauf bestimmt

**0.1 — Der Hash-Riegel. Ohne ihn wären ALLE fünf Gegenproben wertlos gewesen.**

`test_landing.js:46-73` prüft einen SHA-256 je Landing-Datei gegen
`landing/manifest.json` (heute: `index.html` → `061afb57…fb1b89`,
`ketten.html` → `72956e62…c817087`). Fassung 1 erwähnte ihn nicht.

Die erste Folge wäre nur lästig gewesen (Tor 1 rot). Die zweite ist die
gefährliche: **jede Gegenprobe mutiert `index.html` und lässt damit AUCH den
Hash fallen.** „Z-x ist rot" wäre nicht mehr von „der Hash ist rot" zu
unterscheiden — fünf ROT-Messungen, die nichts belegen, und das Papier
verlangt ausdrücklich wörtliche PASS/FAIL-Zahlen, die dann falsch gelesen
würden. **Daraus folgt die Ablaufregel in Abschnitt 3.**

**0.2 — Z-d war wörtlich gelesen logisch unerfüllbar.** Fassung 1 verlangte:
„kein `mod-legal`-Text beginnt mit einem der fünf Fehlanfänge UND trägt
zugleich ein führendes §". Nach M3-d steht das § IM Text: ein Text, der mit
`VDI` beginnt, hat kein führendes §; einer mit `§ VDI` beginnt nicht mit
`VDI`. Die Konjunktion ist nie wahr. Eine Zusicherung, die nicht rot werden
kann — frisch von mir geschrieben.

**0.3 — Drei Musterfehler derselben Art an einem Tag.** `22 €` gegen `€22`;
`manipulationssicher` case-sensitiv gezählt (2 statt 6, gemessen);
`fälschungssicher` gegen `Fälschungssichere`. **Regel für dieses Papier: jedes
Muster über Text ist case-insensitiv UND leerraum-normalisiert, oder es
begründet im Kommentar, warum nicht.**

**0.4 — Drei Umgehungen mit einem Zeichen.** `href="#module"` → `href="#"`
(Z-a blieb grün, Navigation wieder tot); `6 Module` statt `sechs Module`
(Z-c blieb grün); `Fälschungssichere Prüfkette` (Z-e blieb grün).

**0.5 — Es gibt eine ZWEITE Landing-Seite.** `test_landing.js:44` —
`const SEITEN = ['index.html', 'ketten.html']`. Nachgemessen: **keiner der
fünf Defekte steht auf `ketten.html`** (0 `mod-legal`, 0 `href="#module"`,
0 „vor Gericht", 0 „fälschungssicher", keine toten Anker). Das Papier bleibt
inhaltlich richtig — aber **jede Zusicherung bekommt ab jetzt ihren
Geltungsbereich**, sonst schlägt ein über `SEITEN` laufender Wächter auf der
Kettenseite falsch an (sie hat 2 Säulen und keine Preiskarte).

**0.6 — Nachweis geführt (eine Spur konnte ihn nicht führen):** `git ls-files`
im Hauptserver-Repo listet `landing/index.html`, `landing/manifest.json`,
`test/run.sh`, `test_landing.js`, `test_rechtsaussagen.js` — **alle fünf im
SELBEN Baum.** Die `__dirname`-Annahme von `test_landing.js` trägt.

**0.7 — „Alle Module" gibt es schon.** Gemessen im Preisblock: die
Testphase-Karte trägt bereits `Alle Module sofort freigeschaltet`. Eine
Teilstring-Suche nach „Alle Module" findet nach M3-c also ZWEI Stellen. Z-c
wird deshalb auf den BEZAHLTEN Block (`pcard-amt`) eingegrenzt.

---

## 1. Ort und Randbedingungen

**Repo: `Belehrung/gymdocu-hauptserver`**, Datei `landing/index.html`
(67.476 Bytes, Stand `47730a3`). **Nicht** das GymDocu-Repo — das war in
Fassung 1 selbst ein Befund.

**Zweig:** `landing-m3`, von `master`.

**Der Hauptserver hat KEINEN automatischen Deploy.** Deshalb enden die
Zustände getrennt (Abschnitt 5): „gemerged, nicht ausgeliefert" ist kein
Abschluss.

---

## 2. Die fünf Änderungen

### M3-a — Der Navigationslink „Module" zeigt ins Leere

**Gemessen:** `href="#module"` 1×, `id="module"` 0×, `id="modules"` 0×. Die
Fragmentmenge ist `{#, #ablauf, #kontakt, #module, #preise, #registrierung,
#stakes}`; `ablauf`, `kontakt`, `preise`, `registrierung`, `stakes` existieren
alle als `id`. **Genau einer ist tot.** Auf `ketten.html` ist keiner tot.

**Behebung:** `<section class="modules">` → `<section id="module" class="modules">`.
Nicht den Link umbenennen — `#module` kann in Lesezeichen stehen.

### M3-b — „Vier Dinge", darunter stehen fünf

**Gemessen:** `Vier Dinge` 1×, `class="pillar"` 5×. Der Binder trägt: im
`<section>`, das `class="pillars"` enthält, gibt es **genau eine**
`section-sub`, und das ist die richtige.

**Behebung:** „Vier Dinge" → „Fünf Dinge". **Keine Säule entfernen** — welche,
wäre eine inhaltliche Entscheidung.

### M3-c — „Alle sechs Module", die Seite zeigt vierzehn

**Gemessen:** `class="mod"` 14×, in der bezahlten Karte
`<li>Alle sechs Module</li>` neben `<div class="pcard-amt">49,90 €</div>`.

**Behebung:** → `<li>Alle Module</li>`. Keine Zahl, auch keine richtige: eine
Zahl im Fliesstext veraltet lautlos, sobald ein Modul dazukommt — genau die
Krankheit, die hier behoben wird.

### M3-d — Das automatische § und die vollständige Solltabelle

**Gemessen:** `.mod-legal::before { content:"§"; font-weight: 700; color: var(--gruen); }`
gegen `.mod-legal { … display: inline-flex; gap: 7px; font-weight: 500;
color: var(--gruen-dunkel); … }`.

**Die Solltabelle ist der Prüfgegenstand, nicht eine Regel über Präfixe.**
Beide Planprüfungen haben unabhängig darauf bestanden; Fassung 1 hatte
stattdessen „die fünf falschen tragen keines" und hätte damit Nr. 10 halb
repariert ausgeliefert, **mit grünem Wächter**. Rechtszitate sind stabil und
dürfen als Positivliste festgeschrieben werden.

| # | Text HEUTE im HTML | gerendert heute | **SOLL-Text im HTML** | Änderung |
|---|---|---|---|---|
| 1 | `4 Abs. 5 BetrSichV · DGUV Info 202-044` | § 4 Abs. 5 … | `§ 4 Abs. 5 BetrSichV · DGUV Info 202-044` | § in den Text |
| 2 | `3 BetrSichV · Verkehrssicherungspflicht` | § 3 … | `§ 3 BetrSichV · Verkehrssicherungspflicht` | § in den Text |
| 3 | `14 BetrSichV · DGUV Info 202-044` | § 14 … | `§ 14 BetrSichV · DGUV Info 202-044` | § in den Text |
| 4 | `12 ArbSchG · DGUV Vorschrift 1` | § 12 … | `§ 12 ArbSchG · DGUV Vorschrift 1` | § in den Text |
| 5 | `965 ff. BGB` | § 965 ff. BGB | **`§§ 965 ff. BGB`** | **Mehrzahl** |
| 6 | `Hausrecht · § 8 ArbSchG` | § Hausrecht · § 8 ArbSchG | `Hausrecht · § 8 ArbSchG` | **unverändert** |
| 7 | `24 Abs. 6 DGUV V1 · DGUV Info 204-021` | § 24 Abs. 6 … | `§ 24 Abs. 6 DGUV V1 · DGUV Info 204-021` | § in den Text |
| 8 | `10 ArbSchG · ASR A2.2` | § 10 … | `§ 10 ArbSchG · ASR A2.2` | § in den Text |
| 9 | `31 TrinkwV` | § 31 TrinkwV | `§ 31 TrinkwV` | § in den Text |
| 10 | `DGUV Vorschrift 3 · 14 BetrSichV` | § DGUV Vorschrift 3 · 14 BetrSichV | **`DGUV Vorschrift 3 · § 14 BetrSichV`** | **§ wandert** |
| 11 | `VDI/DVGW 6023` | § VDI/DVGW 6023 | `VDI/DVGW 6023` | § entfällt |
| 12 | `VO (EG) 852/2004 · LMHV` | § VO (EG) 852/2004 · LMHV | `VO (EG) 852/2004 · LMHV` | § entfällt |
| 13 | `4 DGUV Vorschrift 1` | § 4 DGUV Vorschrift 1 | `§ 4 DGUV Vorschrift 1` | § in den Text |
| 14 | `Art. 5 DSGVO` | § Art. 5 DSGVO | `Art. 5 DSGVO` | § entfällt |

**Zu Nr. 5:** `§§` ist die Mehrzahl bei einer Paragraphenfolge — und die Seite
kennt die Schreibweise schon: gemessen steht `§§ 4, 14 BetrSichV ·
Verkehrssicherungspflicht · DGUV Info 202-044` im `<cite>` des
`.stakes`-Abschnitts, genau 1× im Dokument.

**Zu Nr. 12:** eine Planprüfung schlug zusätzlich `VO (EG) **Nr.** 852/2004`
vor. **Nicht übernommen** — das ist eine Zitierstil-Behauptung, die ich nicht
an einer Primärquelle gemessen habe. Gehört zu M3-f.

**Behebung, technisch — und sie erhält die Gestaltung:**

1. Die Regel `.mod-legal::before { content:"§"; … }` **entfällt vollständig.**
2. Das FÜHRENDE § (bzw. `§§`) wird ein eigenes Element:
   `<span class="mod-legal-p">§</span>`. Weil `.mod-legal` ein `inline-flex`
   ist, bleibt der Span ein Flex-Kind — `gap: 7px` wirkt also weiter.
3. Neue Regel: `.mod-legal-p { font-weight: 700; color: var(--gruen); }` —
   dieselben Werte wie das alte Pseudoelement.

*Warum nicht einfach „§ " in den Text:* gemessen erbt nackter Text
`font-weight: 500` und `--gruen-dunkel`, und der `gap` greift nicht mehr. Das
§ verlöre Fettung, Farbe und Abstand — eine Nebenwirkung, die Fassung 1 nicht
sah.

*Bekannte Ungleichheit, ausdrücklich in Kauf genommen:* die INNEN liegenden §
(Nr. 6 und neu Nr. 10) bleiben einfacher Text ohne die Klasse. Das ist
**heute schon so** (das `§ 8` in Nr. 6 ist bereits von Hand gesetzt und
ungestylt) — also keine Verschlechterung, aber es gehört benannt statt
entdeckt.

### M3-e — Zwei Zusagen, die niemand halten kann

**Gemessen, wörtlich:**

* `<p class="section-sub">So entsteht aus dem täglichen Rundgang ein Nachweis,
  der vor Gericht zählt.</p>`
* `<p>Der Eintrag wird signiert und in die hash-verkettete Prüfkette
  geschrieben — fälschungssicher.</p>`

**Behebung, im Wortlaut:**

* → „…ein Nachweis, den du bei einer Kontrolle, im Versicherungsfall oder
  intern vorlegen kannst."
* → „…geschrieben. Nachträgliche Änderungen werden dadurch erkennbar."

**BERICHTIGUNG gegenüber Fassung 1, und sie ändert die Einordnung:** Dort
stand „manipulationssicher bleibt bei 2× — das ist KEIN Befund". **Gemessen
sind es 6×** (ich hatte case-sensitiv gezählt): `<title>`,
Meta-Description, Hero, `trust-item`, Säulen-Überschrift `<h3>`, Preiskarte.
Also auch in dem, was eine Suchmaschine anzeigt.

**Beide Planprüfungen haben unabhängig dieselbe Inkonsequenz gefunden:** meine
Begründung gegen „fälschungssicher" — Absolutheitsanspruch für ein Verfahren,
das Manipulation ERKENNBAR macht — beschreibt wortgenau auch
„Manipulationssichere Prüfkette". Die Grenze, die ich gezogen hatte, trennt
nur „vor Gericht zählt" sauber ab.

**Entscheidung der Fassung 2 — SEITHER ÜBERHOLT, maßgeblich ist Abschnitt 6.**
Hier stand: „M3 fasst ,manipulationssicher' NICHT an", weil das eine Produkt-
und Marketingfrage des Betreibers sei und keine Messung. Die Frage ist am
20.09.2026 beantwortet worden („ja nimm das so"), und damit ist daraus ein
Bauauftrag geworden — **M3-g in Abschnitt 6, sieben Stellen über beide
Seiten.** Der Absatz bleibt stehen, damit niemand den Widerspruch für einen
Flüchtigkeitsfehler hält.

*Nicht übernommen:* eine Planprüfung wollte zusätzlich „Alle
Dokumentationspflichten" ersetzen. Diese Zeichenkette kommt **0×** vor — eine
Paraphrase, als Zitat ausgegeben.

---

## 3. Der Bau-Ablauf — er ist wegen 0.1 vorgeschrieben

1. **Die fünf Änderungen einbauen.**
2. **`manifest.json` nachziehen:** `sha256sum landing/index.html
   landing/ketten.html`, Ausgabe VON HAND eintragen (so verlangt es
   `_hinweis` in der Datei selbst), `aktualisiert_am` mitziehen.
3. **Volle Suite grün.** Erst jetzt existiert ein Nullpunkt.
4. **Erst danach die `cp`-Kopien für die Gegenproben ziehen.**
5. **Jede Gegenprobe zieht den Hash MIT** (mutieren → `sha256sum` → Manifest
   nachtragen → messen). Sonst ist das ROT konfundiert.
   **Und die Gegenprobe muss zeigen, dass GENAU die gemeinte Zusicherung
   fällt** — nicht „irgendwas ist rot". Die FAIL-Zeile wörtlich melden.
6. Rücknahme über die `cp`-Kopie, `diff` EXIT 0, Manifest zurück, GRÜN messen.

---

## 4. Die Zusicherungen — mit Geltungsbereich

Sie gehören in den BESTEHENDEN `test_landing.js` (511 Zeilen), der für genau
diese Klasse Präzedenz hat: er sichert zu, dass die FALSCHE Aussage
„isolierte Datenbank" weg ist UND die RICHTIGE („streng getrennt") dasteht,
mit eigener Positivkontrolle. **Keine neue Datei.**

### Z-a — Fragmentziele (beide Seiten)

1. Jeder `href="#x"` mit nichtleerem `x` hat **genau ein** `id="x"` im selben
   Dokument. Dokumentierte Ausnahme: `#top` (springt laut HTML-Spezifikation
   auch ohne `id` an den Seitenanfang; kommt heute auf keiner Seite vor).
2. Alle `id`-Werte eines Dokuments sind **eindeutig**. *Gemessen heute:
   index.html 20 ids / 20 verschieden, ketten.html 7 / 7.*
3. **Nur index.html, gegen die `href="#"`-Umgehung:** `href="#module"` kommt
   genau 1× vor. Ein fester String ist hier vertretbar — die Navigation IST
   das bewachte Verhalten.
4. `href="#"` kommt höchstens so oft vor wie heute. *Gemessen: index.html 2×,
   ketten.html 1×.* Sollzahl von Hand hergeleitet, nicht aus dem Lauf
   abgeschrieben.

### Z-b — Zahlwort gegen Säulenzahl (nur index.html)

* Zähltoken **mit schliessendem Anführungszeichen**: `class="pillar"`.
  *Ohne es zählt das Muster `pillar-ic` mit und kommt auf 10.*
* Binder: das `<section>`, das `class="pillars"` enthält; darin die
  `section-sub`. *Gemessen: genau eine, und die richtige.*
* **Positivkontrolle:** genau ein Zahlwort-Absatz gefunden — bei 0 ein FAIL,
  kein stilles Durchlaufen.
* Zahlworttabelle 1–20, mit Singular („Ein Ding"), case-insensitiv. Ziffern
  ebenfalls zulässig als Ist-Wert.

### Z-c — keine Modulzahl in der bezahlten Preiskarte (nur index.html)

* Geltungsbereich ist **der Block mit `pcard-amt`**, nicht die Seite. *Grund:
  gemessen trägt die Testphase-Karte bereits `Alle Module sofort
  freigeschaltet`.*
* Darin: kein Treffer auf `/(\d+|ein|zwei|…|zwanzig)\s+Module/i` —
  **ausdrücklich inklusive Ziffern** (0.4).
* Positiv: `<li>Alle Module</li>` genau 1× in diesem Block.
* Die Zahlwortliste wird mit Z-b geteilt, nicht zweimal geschrieben.

### Z-d — Rechtsabzeichen (beide Seiten)

1. **CSS:** `/content\s*:\s*["']\s*§/` kommt **0×** vor. *Regex statt
   Exaktstring: `content: "§"` mit Leerzeichen entginge einer wörtlichen
   Suche (0.4).*
2. **Inhalt, als Referenz von AUSSEN:** die normalisierten Texte aller
   `mod-legal`-Elemente entsprechen **exakt der Solltabelle** aus M3-d.
   Normalisieren heisst: Leerraum zusammenziehen, HTML-Entities auflösen,
   umschliessende Spans abziehen. Auf `ketten.html` ist die Sollmenge **leer**
   (gemessen: 0 `mod-legal`) — und das ist eine eigene Zusicherung, keine
   Ausnahme.
3. **Zusätzlich die Klassenregel** (fängt ein künftiges Abzeichen, das nicht
   in der Tabelle steht): führendes `§`/`§§` samt Leerraum abziehen; lag ein
   führendes § vor UND beginnt der Rest mit `DGUV Vorschrift`, `VDI`,
   `VO (EG)`, `Art.` oder `Hausrecht`, dann FAIL. *So herum ist sie
   erfüllbar — Fassung 1 war es nicht (0.2).*

### Z-e — keine Absolutheits- und Gerichtszusagen (beide Seiten)

* `/fälschungssicher/i` 0×, `/gerichtsfest|gerichtsverwertbar/i` 0×,
  `/vor\s+\S*\s*Gericht/i` 0× — **alle case-insensitiv** (0.3), und das
  letzte Muster fängt auch „vor **jedem** Gericht".
* Positiv: die beiden neuen Sätze stehen wörtlich da.
* **Pflichtabschnitt im Kopfkommentar: „Was dieser Wächter NICHT leistet"** —
  nach dem Vorbild von `test_rechtsaussagen.js`. Hinein gehört wörtlich: er
  bannt eine Musterklasse, keine Aussage; ein Synonym, das keines der Muster
  trifft, schlüpft durch; und „Manipulationsschutz" (Abschnitt 6) nimmt die
  Absolutheit heraus, ohne das Gegenteil zuzusichern — nachträgliche
  Änderungen werden dadurch ERKENNBAR, nicht unmöglich. Wer mehr hineinliest,
  liest es nicht aus diesem Wächter.

---

## 5. Harte Tore

1. **`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`** — ohne Pipe, ohne
   äusseres `flock`, `echo` in eigener Zeile. Danach das Dateizahl-Ritual mit
   demselben Sieb auf BEIDEN Seiten, `diff` EXIT 0. **Sollzahl nicht aus einer
   Notiz** — massgeblich ist die Liste aus `test/run.sh` im aktuellen Baum
   (heute 87 Einträge).
2. **`npm run lint`** — Ergebnis wörtlich melden, auch bei Grün. Gibt es kein
   `lint`-Skript (`package.json` kennt heute nur `test`), wird DAS gemeldet.
3. **Marker-Scan** mit Ausschluss auf dem PFAD
   (`--exclude-dir=node_modules --exclude-dir=.git`), **Treffer zählen**.
   Sollwert in diesem Repo **VORHER einmal messen und im Bericht nennen** —
   die Werte 6 bzw. 2 aus der CLAUDE.md gelten für die beiden anderen Repos.
4. **Committen und pushen, BEVOR auf einen Hintergrundlauf gewartet wird.**
5. **Kein Modellname** in Commit-Botschaft, PR-Titel oder -Rumpf.
6. **Abschluss in zwei getrennten Zuständen melden:** „gemerged, nicht
   ausgeliefert" und „ausgeliefert und nachgemessen". Der Hauptserver zieht
   nicht selbst nach; ohne `git pull --ff-only origin master` auf dem Server
   liefert die öffentliche Seite weiter die alten Versprechen aus. **Der
   Deploy ist NICHT Teil dieses Auftrags** — aber „fertig" ist er erst
   danach, und das gehört so gemeldet.

---

## 6. M3-g — „Manipulationsschutz" statt „manipulationssicher" (ENTSCHIEDEN)

**Betreiber-Entscheidung 20.09.2026**, auf die Frage aus Fassung 2. Wörtlich:
„könnte man stattdessen auch das wort ,manipulationsschutz' verwenden?" —
und danach: „ja nimm das so".

**Warum das trägt, und es ist kein Wortspiel:** „-sicher" ist ein
Ergebnis-Suffix (wasserdicht, kugelsicher, fälschungssicher) — es behauptet,
das Ergebnis sei garantiert, und kann nicht teilweise wahr sein.
„-schutz" benennt eine MASSNAHME: etwas wird dagegen getan, ohne Vollständig-
keit zu versprechen. Ein Schutz darf lückenhaft sein und das Wort bleibt
richtig. Genau das haben wir: Hash-Kette und Append-only machen nachträgliche
Änderungen **erkennbar**, nicht unmöglich.

**Ehrlich dazu:** auch „Schutz" klingt für einen Laien nach Verhindern. Die
vollständig präzise Formulierung wäre „nachträgliche Änderungen werden
erkennbar". Der Begriff ist der Mittelweg — er nimmt die unhaltbare
Absolutheit heraus und behält die Werbekraft. Das ist eine Abwägung, keine
Messung, und steht hier als solche.

**Gemessen: kein bestehender Wächter hängt an dem Wort.** `grep -rni` über
alle `test_*.js`, `ops/` und `.github/` im Hauptserver-Repo: **null Treffer**.
Die Änderung reisst nichts mit.

**Die sechs Stellen in `landing/index.html`, im gemessenen Wortlaut:**

| Zeile | heute | SOLL |
|---|---|---|
| `:6` `<title>` | `…dokumentieren, manipulationssicher nachweisen` | `…dokumentieren, mit Manipulationsschutz nachweisen` |
| `:7` `<meta description>` | `Manipulationssicher protokolliert, DSGVO-konform, …` | `Mit Manipulationsschutz protokolliert, DSGVO-konform, …` |
| `:683` Hero | `einen lückenlosen, manipulationssicheren Nachweis` | `einen lückenlosen Nachweis mit Manipulationsschutz` |
| `:747` `trust-item` | `🔒 Manipulationssicher <b>signiert</b>` | `🔒 Signiert mit <b>Manipulationsschutz</b>` |
| `:828` `<h3>` Säule | `Manipulationssicher` | `Manipulationsschutz` |
| `:1081` `<li>` Preiskarte | `Manipulationssichere Prüfkette` | `Prüfkette mit Manipulationsschutz` |

**Und eine siebte auf der ZWEITEN Seite**, die ohne den Geltungsbereich aus
0.5 durchgerutscht wäre:

| Zeile | heute | SOLL |
|---|---|---|
| `ketten.html:467` | `…beide mit derselben manipulationssicheren Prüfkette wie im Einzelstudio.` | `…beide mit derselben Prüfkette mit Manipulationsschutz wie im Einzelstudio.` — **gemessener Wortlaut**, nicht gekürzt |

**NICHT anzufassen: `revisionssicher`** (`index.html:735`, im Prüfpfad-
Widget). Das ist ein etablierter Fachbegriff aus den GoBD mit eigener
Bedeutung, kein Absolutheitswerbewort. Es gehört in dieselbe Prüfung wie die
Rechtsbezüge (M3-f), nicht in diesen Beitrag. **Ausdrücklich benannt, damit
es niemand stillschweigend mitändert oder stillschweigend übergeht.**

**Z-e wird entsprechend erweitert** (Geltungsbereich: beide Seiten):
* `/manipulationssicher/i` kommt **0×** vor — zusätzlich zu
  `/fälschungssicher/i`, `/gerichtsfest|gerichtsverwertbar/i` und
  `/vor\s+\S*\s*Gericht/i`.
* Positiv: `Manipulationsschutz` kommt auf `index.html` **6×** und auf
  `ketten.html` **1×** vor. *Sollwerte von Hand hergeleitet aus den Tabellen
  oben, nicht aus dem Lauf abgeschrieben.*
* Die Gegenprobe dazu: EINE der sieben Stellen auf `manipulationssicher`
  zurückschreiben → die Negativ- UND die Positivzusicherung müssen fallen.

**Damit entfällt die halbe Lösung**, die beide Planprüfungen an Fassung 1 und
2 zu Recht kritisiert hatten: „fälschungssicher" und „manipulationssicher"
sind dieselbe Anspruchsklasse und fallen jetzt in einem Zug.

**Was NICHT hierher gehört:** dieselben Formulierungen im GymDocu-Repo
(Handbuch-Generator, die Audit-Ansicht in der Anwendung, `docs/SICHERHEIT.md`).
Das ist ein eigener Beitrag in einem anderen Repo mit eigener Suite —
`plaene/auftrag-manipulationsschutz-m5.md`.

## 7. M3-f — eigener offener Punkt: stimmen die Rechtsbezüge INHALTLICH?

Nicht Teil dieses Beitrags. M3 räumt die **Zitierform** auf, nicht die
**Sachaussage**.

* **`§ 31 TrinkwV` — GEPRÜFT UND RICHTIG.** Eine Planprüfung hielt ihn für
  falsch („mir ist § 14 geläufig"), ausdrücklich als Verdacht. Selbst geholt
  von `gesetze-im-internet.de/trinkwv_2023/__31.html` (HTTP 200): „**§ 31
  Untersuchungspflichten in Bezug auf Legionella spec.**". Der Befund fällt.
* **`§ 24 Abs. 6 DGUV Vorschrift 1` — UNBESTÄTIGT.** Verdacht, die Vorschrift
  habe dort keine sechs Absätze. Die Quelle ist aus dieser Umgebung nicht
  erreichbar (`publikationen.dguv.de` → 404, `dguv.de` → JavaScript-Hülle).
  Kein Befund und kein Freispruch. *Beobachtung ohne Beweiskraft: dieselbe
  Zitierung steht bereits als ausdrücklich ERLAUBTE Aussage in
  `test_rechtsaussagen.js:140` — M3 ist also nicht ihr Anlass.*
* **Weitere Verdachte ohne Nachmessung:** ob `§ 4 DGUV Vorschrift 1` die
  Unterschriftsberechtigung deckt; ob `§ 8 ArbSchG` die
  Dienstleister-Dokumentation trägt; ob `VO (EG) Nr. 852/2004` die richtige
  Zitierform ist; die inkonsistente Schreibweise `DGUV V1` gegen
  `DGUV Vorschrift 1`.

**Für M3-f gilt unsere Regel ohne Abstriche:** eine Rechtsaussage hängt am
selbst geholten WORTLAUT der Quelle, nie an der Zusammenfassung eines
Modells. Wo die Quelle nicht erreichbar ist, wird der Punkt als UNBESTÄTIGT
geführt — nicht als Befund und nicht als erledigt.

---

## 8. Was dieser Auftrag NICHT umfasst

* **Kein Umbau der Startseite.** Die Gegenlesung lieferte zwölf Vorschläge
  (neue Abschnittsreihenfolge, echte Screenshots statt Grafik, ein einziger
  Preisblock, vollständige Typografie- und Farbliste). Betreiber-Entscheidung.
* **Keine Animation**, auch nicht das Entfernen des endlos pulsierenden
  grünen Punkts (`.pulse`, `@keyframes ping`).
* **Kein Deploy** (s. Tor 6).
* **Nichts im GymDocu-Repo** — Handbuch, Audit-Ansicht und `docs/SICHERHEIT.md`
  tragen dieselben Formulierungen und sind ein eigener Beitrag (M5).
* **Nichts an den Sachaussagen der Rechtsbezüge** (s. M3-f).
