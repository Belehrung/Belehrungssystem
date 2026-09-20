# M3 — Planprüfung, Spur `eng` (`gpt-5.6-sol`): acht Befunde, selbst nachgemessen

**Lauf:** 20.09.2026, 372,9 s, 25.305 Eingabe- / 26.434 Ausgabe-Token
(21.754 Nachdenken), Status `completed`. Bündel: `auftrag-landing-m3.md` plus
`landing/index.html` — **ohne** die beiden bestehenden Wächter.

Die zweite Spur (`kimi-k3`, mit den Wächtern statt der Seite) lief zum
Zeitpunkt dieser Notiz noch.

---

## Getragen — und zwar gegen MEINE eigenen Zahlen

### B3 (teilweise) — meine §-Tabelle ist zu grob

**Zwei von drei Teilbehauptungen tragen, nachgemessen:**

**(a) `§ 965 ff. BGB` ist falsch, richtig wäre `§§ 965 ff. BGB`.** Bei einer
Folge mehrerer Paragraphen steht die Mehrzahl. **Und die Seite weiss das
selbst:** `§§` kommt in `landing/index.html` genau **1×** vor — im `<cite>`
des Abschnitts `.stakes`, wörtlich `§§ 4, 14 BetrSichV ·
Verkehrssicherungspflicht · DGUV Info 202-044`. Die Konvention ist im Haus
also bekannt und wird bei den Abzeichen nicht angewandt. **Mein „neun richtig,
fünf falsch" war damit falsch: es sind acht richtig, sechs zu ändern.**

**(b) Mein Papier widerspricht sich bei den GEMISCHTEN Abzeichen.** Die
Tabelle notiert bei Nr. 10 richtig „ausserdem fehlt dem `14 BetrSichV`
dahinter sein eigenes §" — die Behebungsanweisung sagt dann aber pauschal
„die fünf falschen keines". Nachgemessen, die vollständigen Texte:

    6.  'Hausrecht · § 8 ArbSchG'          ← trägt sein § schon selbst
    10. 'DGUV Vorschrift 3 · 14 BetrSichV' ← braucht ein § VOR "14"

Nr. 6 ist nach dem Entfernen der CSS-Regel von selbst richtig. **Nr. 10 nicht
— dort muss ein § ergänzt werden.** Das stand so nicht in der Anweisung.

**(c) FÄLLT NICHT, geht aber über diesen Auftrag hinaus.** Die Spur behauptet
zusätzlich, die Rechtsbezüge seien teils inhaltlich unpassend — `§ 4 DGUV
Vorschrift 1` regle die Unterweisung von Versicherten und decke nicht, wer
ein Prüfblatt unterschreiben darf; `§ 8 ArbSchG` verpflichte nicht zur
Dokumentation von Dienstleister-Ankünften. **Das habe ich NICHT nachgemessen
und werde es hier auch nicht:** unsere Regel lautet, dass eine Rechtsaussage
am selbst geholten WORTLAUT der Quelle hängt, nicht an der Zusammenfassung
eines Modells. Das ist ein eigener, grösserer Punkt (**M3-f**), kein
Bestandteil dieses Beitrags. Er wird als offen geführt, nicht stillschweigend
mitgebaut und nicht stillschweigend verworfen.

### B4 — mein `manipulationssicher`-Zähler war falsch: 6×, nicht 2×

**Gemessen:** case-sensitiv kleingeschrieben `manipulationssicher` = **2**,
case-INSENSITIV = **6**. Die sechs Fundstellen:

    <title>                      manipulationssicher
    meta description             Manipulationssicher
    Hero                         manipulationssicheren
    trust-item                   Manipulationssicher
    Säulen-Überschrift <h3>      Manipulationssicher
    Preiskarte <li>              Manipulationssichere

**Ich habe case-sensitiv gezählt und daraus „2×, einmal im `<title>`"
geschrieben.** Beides falsch — es sind sechs, und `<title>` UND
Meta-Description tragen es, also genau das, was eine Suchmaschine anzeigt.
Dieselbe Krankheit wie beim Preismuster zwei Stunden davor: **das Muster hat
die SCHREIBWEISE mitgemessen.** Zweimal an einem Tag.

**Was das an der ENTSCHEIDUNG ändert — und was nicht.** Die Spur folgert, die
Absolutheitszusage werde „nicht konsistent entfernt". Das stimmt als
Beobachtung. Ob „Manipulationssicher" bleiben soll, ist aber eine
**Produktentscheidung des Betreibers**, keine Messung: es ist ein
Eigenschaftswort über ein Verfahren, während „vor Gericht zählt" eine Aussage
über ein Gerichtsurteil ist. **M3 fasst es weiterhin nicht an — aber das
Papier darf nicht mehr behaupten, die Absolutheit sei damit beseitigt.**

### B2 — fünf Mutationen, die grün blieben. Vier tragen.

Die Spur nennt für jede der fünf geplanten Zusicherungen eine Ein-Zeilen-
Änderung, die den Zustand zerstört und die Zusicherung grün lässt:

* **Z-a:** einer FRÜHEREN Sektion zusätzlich `id="module"` geben. Beide
  Prüfungen finden eine ID, der Browser springt zum ersten, falschen Ziel.
  **Trägt** — Z-a braucht Eindeutigkeit, nicht Existenz.
* **Z-d:** `content: "§"` MIT Leerzeichen entgeht einer wörtlichen Suche nach
  `content:"§"`. **Gemessen:** die Datei schreibt es heute ohne Leerzeichen
  (`content:"§"`), die Suche trägt also HEUTE — aber sie ist einen Tastendruck
  weit von nutzlos entfernt. **Trägt als Härtung.** Zusätzlich: ein bei einem
  als richtig geführten Abzeichen wieder entferntes § fällt durch keine der
  fünf Negativlisten. **Trägt.**
* **Z-e:** die Überschrift auf „Vom Tablet zur **gerichtsfesten** Akte"
  ändern — beide verbotenen Zeichenketten fehlen, die Gerichtszusage ist
  zurück. **Trägt**, und das ist der schärfste der acht Befunde: eine
  Zusicherung, die zwei Wörter verbietet, bewacht keine AUSSAGE.
* **Z-b / Z-c über `hidden`:** formal richtig, praktisch schwach — niemand
  setzt `hidden` auf eine Säule. **Trägt strukturell, aber als niedrig.**

### B5 — die Gestaltung des § geht verloren. Trägt, gemessen.

    .mod-legal        { … gap: 7px; font-weight: 500; color: var(--gruen-dunkel); … }
    .mod-legal::before{ content:"§"; font-weight: 700; color: var(--gruen); }

Das § ist heute **fetter (700 gegen 500) und heller (`--gruen` gegen
`--gruen-dunkel`)** als der Rest des Abzeichens, und der `gap: 7px` des
`inline-flex` setzt den Abstand. Ein ins Textfeld geschriebenes § erbt Gewicht
500 und die dunklere Farbe, und der `gap` greift nicht mehr, weil es kein
eigenes Flex-Kind mehr ist. **Das ist eine gemessene Nebenwirkung meines
Vorschlags, die im Papier fehlte.**

Der Ausweg der Spur ist richtig und billig: das § als echten Text behalten,
aber in ein eigenes Element mit einer Klasse setzen (dann bleibt es Flex-Kind
und behält Gewicht und Farbe), und zwischen § und Zahl ein **geschütztes**
Leerzeichen.

### B7 — „jeder `href=#x` braucht `id=x`" ist als allgemeine Regel zu weit

`#top` springt auch ohne Element an den Dokumentanfang; prozentkodierte
Fragmente zeigen auf dekodierte IDs; Textfragmente (`#:~:text=…`) brauchen
gar keine ID. **Trägt als Aussage.** **Für DIESE Seite aber gegenstandslos:**
gemessen ist die Fragmentmenge genau
`{#, #ablauf, #kontakt, #module, #preise, #registrierung, #stakes}` — kein
`#top`, keine Kodierung, kein Textfragment. Folge: die Regel bleibt, aber als
ausdrückliche **Projektkonvention** formuliert, mit einer Ausnahme für `#`,
und zusätzlich um **Eindeutigkeit der IDs** ergänzt (siehe B2/Z-a).

### B1 und B8 — richtig, und teils schon beantwortet

**B1** verlangt, „gemerged" und „ausgeliefert" als getrennte Zustände zu
führen. Das steht im Papier schon (Abschnitt 5: kein Deploy), **aber nicht als
Abschlussbedingung.** Wird nachgezogen.

**B8** sagt, die Frage nach betroffenen BESTEHENDEN Zusicherungen sei mit
diesem Bündel nicht beantwortbar, und nennt konkrete Kollisionsrisiken
(„Alle Module" steht auch in der Preisüberschrift; „Nachträgliche Änderungen"
steht schon in einer Säule). **Richtig — und genau dafür läuft die zweite
Spur mit den Wächtern statt der Seite.** Der Befund ist damit kein Mangel des
Plans, sondern eine korrekte Materialauskunft.

---

## GEFALLEN

**B5, Teilbehauptung „`#modules` bleibt unverändert kaputt".** Gemessen:
`href="#modules"` kommt in der Datei **0×** vor. Es gibt keinen solchen Link,
also auch nichts Kaputtes. Eine aus dem Klassennamen `class="modules"`
geratene Prämisse.

---

## Was daraus am Papier zu ändern ist

1. §-Solltabelle **vollständig ausschreiben**, alle 14, mit Ist und Soll —
   statt einer Regel „fünf tragen keines". Neu darin: `§§ 965 ff. BGB` und
   `DGUV Vorschrift 3 · § 14 BetrSichV`.
2. Das § **in ein eigenes Element mit Klasse** statt nackt in den Text, damit
   Gewicht, Farbe und Abstand erhalten bleiben; geschütztes Leerzeichen.
3. **Z-a** um Eindeutigkeit und Reihenfolge erweitern, als Projektkonvention
   formulieren, `#` ausnehmen.
4. **Z-d** gegen Leerraum normalisieren und die Solltabelle als Referenz von
   AUSSEN nehmen, statt fünf verbotene Präfixe zu führen.
5. **Z-e** von „zwei Wörter verboten" auf die **Solltabelle der Aussagen**
   umstellen; die `manipulationssicher`-Zahl auf 6 berichtigen und die
   Entscheidung, sie nicht anzufassen, als ENTSCHEIDUNG kennzeichnen.
6. Abschluss in zwei Zustände trennen: „gemerged, nicht ausgeliefert" und
   „ausgeliefert und nachgemessen".
7. **M3-f** als eigenen offenen Punkt aufnehmen: stimmen die Rechtsbezüge
   inhaltlich? Nur mit selbst geholtem Wortlaut, nicht auf Zuruf eines Modells.

---

# Spur `umkreis` (`kimi-k3`): 14 Befunde — und einer blockiert den Plan

**Lauf:** 1090,1 s, 20.647 Eingabe- / 42.934 Ausgabe-Token (33.181 Nachdenken),
Status `completed`. Bündel: das Papier plus `test_landing.js` und
`test_rechtsaussagen.js` — **ohne** die Startseite.

**Die Bündeltrennung hat sich ausgezahlt:** vier der fünf schwersten Befunde
dieser Spur sind aus den Wächtern gelesen, die die andere Spur nie gesehen
hat. Die Überschneidung mit `eng` liegt bei zwei Befunden (Badge 10, die
`manipulationssicher`-Inkonsequenz) — beide wurden unabhängig gefunden.

## BLOCKIEREND — und es hätte alle fünf Gegenproben unbrauchbar gemacht

**`test_landing.js` prüft einen SHA-256 je Landing-Datei gegen
`landing/manifest.json`. Mein Papier erwähnt das mit keinem Wort.**

Gemessen:

    test_landing.js:46-47  function sha256(datei) { … }
    test_landing.js:63     const manifest = JSON.parse(…'manifest.json'…)
    test_landing.js:73     ok(`Hash stimmt: ${rel}`, sha256(abs) === erwarteterHash);

    landing/manifest.json  "index.html":  "061afb57…fb1b89"
                           "ketten.html": "72956e62…c817087"
                           "_hinweis": "… Erzeugen nach jeder Aenderung:
                            sha256sum landing/index.html landing/ketten.html
                            -- Ausgabe hier von Hand eintragen, NICHT schaetzen."

**Erste Folge:** wer das Papier wörtlich ausführt, steht vor rotem Tor 1 —
die Suite kann gar nicht grün werden.

**Zweite Folge, und die ist schlimmer:** jede der fünf Gegenproben mutiert
`index.html`. Nach einer solchen Mutation fällt **auch** die Hash-Zusicherung.
Ein „Z-x ist rot" wäre dann nicht mehr von „der Hash ist rot" zu
unterscheiden — alle fünf ROT-Messungen wären konfundiert, und das Papier
verlangt ausdrücklich wörtliche PASS/FAIL-Zahlen, die dann falsch gelesen
würden. **Der Beweis, dass die neuen Zusicherungen überhaupt etwas bewachen,
wäre wertlos gewesen.**

Behebung im Papier: die Hash-Nachführung wird ein eigener Schritt, UND jede
Mutation zieht den Hash mit — dann fällt nachweislich nur die Z-Zusicherung.

## Getragen, gegen mein eigenes Papier

**B1 — Z-d ist wörtlich gelesen LOGISCH UNERFÜLLBAR.** Mein Papier verlangt:
„kein `mod-legal`-Text beginnt mit einem der fünf Fehlanfänge **und** trägt
zugleich ein führendes §". Nach M3-d steht das § IM Text. Ein Text, der mit
`VDI` beginnt, hat kein führendes §; einer mit `§ VDI` beginnt nicht mit
`VDI`. Die Konjunktion ist **nie** wahr — eine Zusicherung, die nicht rot
werden kann, und zwar von mir selbst frisch geschrieben. Verschärfend: meine
einzige vorgeschriebene Gegenprobe für Z-d (`content:"§"` zurückschreiben)
prüft nur die CSS-Hälfte; die inhaltliche Hälfte hätte **nie** eine
Gegenprobe bekommen.

**B3 — Badge 10 wird halbrepariert.** Dieselbe Lücke, die auch `eng` fand,
hier aber mit der Folge zu Ende gedacht: `DGUV Vorschrift 3 · 14 BetrSichV`
beginnt mit einem Fehlanfang und trägt danach kein führendes § — **Z-d bliebe
grün**, während der gemessene Defekt halb ausgeliefert ist.

**B6 — Z-a lässt sich mit einem Zeichen umgehen.** `href="#module"` →
`href="#"`. Meine Regel nimmt `#` ausdrücklich aus, `id="module"` bleibt
stehen, alle anderen Anker haben Ziele: **grün**, und der Navigationspunkt
ist wieder tot. Die Ausnahme, die ich für ungefährlich hielt, IST die Lücke.

**B8 — Z-c fällt bei einer ZIFFER durch.** `<li>Alle Module</li><li>Grundpreis
deckt 6 Module ab</li>` — „sechs Module" bleibt 0×, `<li>Alle Module</li>`
bleibt 1×, die Preiskarte trägt wieder eine falsche Modulzahl. Mein Anspruch
war „kein Zahlwort vor Module", mein Check war eine Zeichenkette.

**B9 — Z-e fällt bei GROSSSCHREIBUNG durch**, und das ist heute mein DRITTER
Musterfehler derselben Art. `Manipulationssichere Prüfkette` →
`Fälschungssichere Prüfkette` in der Preiskarte: eine case-sensitive Suche
nach `fälschungssicher` schlägt nicht an, die Positivkontrollen stehen
woanders — **grün**, und der Absolutheitsanspruch ist im Angebot zurück.
Zweite Variante ohne jeden Treffer: „hält vor **jedem** Gericht" enthält die
Zeichenkette `vor Gericht` nicht.

**B10 — meine Grenze bei `manipulationssicher` ist inkonsequent.** Meine
Begründung gegen „fälschungssicher" lautet: Absolutheitsanspruch für ein
Verfahren, das Manipulation ERKENNBAR macht. Derselbe Satz beschreibt
wortgenau auch „Manipulationssichere Prüfkette". Beide Spuren haben das
unabhängig gefunden. **Übernommen, aber nicht als Bauauftrag:** es wird eine
ausdrückliche Betreiber-Frage, und der Z-e-Zusatz stellt den Bestand fest,
ohne ihn zu rechtfertigen.

**B7 — Z-b ist im Kern sauber, aber vier Punkte offen:** das Zähltoken muss
das schliessende Anführungszeichen tragen (`class="pillar"`, sonst zählt es
`pillar-ic` mit und kommt auf 10); die Zahlworttabelle ist unspezifiziert
(Ziffer? Singular? Gross/klein?); der Binder „`section-sub` VOR `.pillars`"
hängt an der Dokumentposition; und es fehlt die Positivkontrolle „genau ein
Zahlwort-Absatz gefunden". **Gemessen, dass der Binder nicht trägt:** die
ERSTE `section-sub` in `index.html` lautet „GymDocu wurde von jemandem
gebaut, der selbst Fitnessstudios…" — nicht die Säulen-Zeile.

**B11 — richtig, und ich habe es nachgemessen.** Die Spur konnte aus ihrem
Material nicht sehen, ob Wächter und Seite im selben Repo liegen, und
verlangt den Nachweis als ersten Berichtspunkt. `git ls-files` im
Hauptserver-Repo listet alle fünf: `landing/index.html`,
`landing/manifest.json`, `test/run.sh`, `test_landing.js`,
`test_rechtsaussagen.js`. **Derselbe Baum.** Nachweis geführt.

## Ein zweiter Geltungsbereich, den mein Papier nicht kannte

`test_landing.js:44` — `const SEITEN = ['index.html', 'ketten.html'];`

Es gibt eine **zweite** Landing-Seite (`landing/ketten.html`, 34.190 Bytes).
Selbst nachgemessen, was von M3 sie berührt:

| Prüfung | index.html | ketten.html |
|---|---|---|
| `href="#module"` / `id="module"` | 1 / **0** | 0 / 0 |
| `class="mod-legal"` / `content:"§"` | 14 / 1 | **0 / 0** |
| `class="mod"` / `class="pillar"` | 14 / 5 | 4 / 2 |
| „vor Gericht" / „fälschungssicher" (i) | 1 / 1 | **0 / 0** |
| „manipulationssicher" (i) | 6 | 1 |
| tote Anker | `#module` | **keine** |

**Keiner der fünf Defekte steht auf `ketten.html`.** Das Papier bleibt also
inhaltlich richtig — aber **jede Zusicherung braucht ihren Geltungsbereich**,
sonst schlägt ein naiv über `SEITEN` laufender Wächter auf der Kettenseite
falsch an (sie hat zwei Säulen und keine Preiskarte).

## Gefallen — am selbst geholten Wortlaut

**B5: „§ 31 TrinkwV ist vermutlich falsch, mir ist § 14 geläufig."**
Selbst geholt von `gesetze-im-internet.de/trinkwv_2023/__31.html` (HTTP 200):

> **§ 31 Untersuchungspflichten in Bezug auf Legionella spec.**
> (1) Der Betreiber einer mobilen Wasserversorgungsanlage, einer
> Gebäudewasserversorgungsanlage oder einer zeitweiligen
> Wasserversorgungsanlage hat das Trinkwasser, sofern es im Rahmen einer
> gewerblichen oder öffentlichen Tätigkeit abgegeben wird, durch eine
> systemische Untersuchung …

**Der Bezug stimmt.** Die Spur hatte ihn ausdrücklich als Verdacht und nicht
als Nachweis gekennzeichnet — genau richtig, und genau deshalb war er billig
zu widerlegen.

## UNBESTÄTIGT — nicht widerlegt, nicht übernommen

**B4: „§ 24 Abs. 6 DGUV Vorschrift 1 hat vermutlich keine sechs Absätze."**
Die Quelle ist aus dieser Umgebung nicht erreichbar: die geratene
Publikations-URL antwortet **404**, `dguv.de` liefert eine JavaScript-Hülle
ohne Normtext. Nach unserer eigenen Regel gilt das als **unbestätigt** — kein
Befund und kein Freispruch.

Eine Beobachtung dazu, die nichts beweist, aber die Einordnung ändert:
dieselbe Zitierung steht bereits im Bestand, und zwar als ausdrücklich
ERLAUBTE Aussage in `test_rechtsaussagen.js:140`
(`ERLAUBT_VORSCHRIFT = "Die DGUV Vorschrift 1 (§ 24 Abs. 6) verlangt, jede
Erste-Hilfe-Leistung zu dokumentieren."`). Sie ist also weder neu noch durch
M3 eingeführt. Das macht sie nicht richtig — es heisst nur, dass M3 nicht ihr
Anlass ist. Gehört zu **M3-f**.
