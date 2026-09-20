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
