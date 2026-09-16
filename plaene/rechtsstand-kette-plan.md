# Plan — Der Rechtsstand-Wächter soll sagen, OB es uns betrifft

Betreiber-Auftrag 16.09.2026: „ja plane es als eigenen schritt", nach dem
Befund aus der BGB-Meldung vom selben Tag.

Alles unten mit **GEMESSEN** ist am echten Gegenstand gemessen, nicht
angenommen. Der Rest ist Entwurf und als solcher gekennzeichnet.

## Anlass

Der Wächter meldete am 16.09.2026 für sieben BGB-Fundstellen einen neuen
Änderungsstand und stellte die Frage, die er nicht beantworten kann: „ob das
den Lexikon-Text inhaltlich betrifft, muss ein Mensch prüfen".

Die Beantwortung von Hand kostete etwa zwanzig Minuten: drei
Bundesgesetzblatt-PDFs holen, die Präambeln rückwärts verfolgen, die
geänderten Normen auflisten, gegen unsere sieben halten. **Ergebnis war
„nicht betroffen"** — und das ist der Regelfall, nicht die Ausnahme.

## Was der Wächter heute tut — GEMESSEN

- Für `gii-xml`-Quellen lädt er `https://www.gesetze-im-internet.de/<kürzel>/xml.zip`
  und liest daraus die **Standangabe des GANZEN Gesetzes**
  (`core/rechtsstand.js`, `standAusXml()` bei `:325`, Prüfart bei `:97`).
- `bewerte()` (`:904`) vergleicht genau eine Zeichenkette: `eintrag.stand`
  gegen `abruf.stand`. Zwei Lagen — gleich oder geändert.
- Folge: **jede** Änderung am BGB färbt **alle sieben** Fundstellen rot,
  auch wenn sie das Mietrecht betrifft. Der Kommentar bei `:800` sagt das
  selbst („derselbe Gesetzes-Abruf … deshalb erwartungsgemäß derselbe Stand").

## Der Befund — GEMESSEN

**Der Wächter vergleicht Kopfstand gegen Kopfstand. Was dazwischen liegt,
sieht er nicht.** Zwischen unserem bestätigten Stand und der Meldung lagen
nicht eine, sondern DREI Änderungen:

| BGBl. 2026 I | Datum | ändert im BGB |
|---|---|---|
| Nr. 198 | 2.7. | unser bestätigter Stand |
| Nr. 212 | 16.7. | §§ 434, 445a, 453, 475, 475a, 475d, 479, 650 + Untertitel |
| Nr. 221 | 21.7. | §§ 1597a, 1598 |
| Nr. 226 | 23.7. | §§ 555b, 559e, neu 559f |

Hätte eine der übersprungenen unsere Normen berührt, **sähe die Meldung genau
gleich aus**. Ein Bestätigen ohne Kettenprüfung hätte sie zugedeckt. Das ist
die Lücke.

## Die tragende Messung — sie macht den Bau billig

**Das XML, das der Wächter ohnehin lädt, enthält jeden Paragrafen einzeln.**
GEMESSEN am echten Abruf: `bgb/xml.zip` = 467.258 Bytes, entpackt 2.489.137
Zeichen, eine Datei; `<enbez>§ 823</enbez>` genau 1 Treffer, ebenso § 309,
§ 965, § 978 — und auch der brandneue `§ 559f`, das Archiv ist also aktuell.

Der Normtext lässt sich sauber herauslösen (`<norm>`-Block, darin
`<textdaten>`): § 823 → 512 Zeichen, beginnend „(1) Wer vorsätzlich oder
fahrlässig das Leben, den Körper …"; § 309 → 8.941 Zeichen, beginnend „Auch
soweit eine Abweichung von den gesetzlichen Vorschriften zulässig ist …".

**Damit braucht die Kettenprüfung KEINEN einzigen zusätzlichen Abruf.** Sie
ist eine reine Auswertungsänderung an Daten, die schon im Speicher liegen.

## Entwurf

### Stufe 1 — Normtext-Fingerabdruck je Fundstelle

Zusätzlich zur Gesetzes-Standangabe führt jeder `gii-xml`-Eintrag einen
`normtext_sha256` **seines eigenen Paragrafen**. `bewerte()` bekommt vier
Lagen statt zwei:

| Standangabe | Normtext | Lage | Meldung |
|---|---|---|---|
| gleich | gleich | unverändert | keine |
| geändert | **gleich** | `gesetz_geaendert_norm_gleich` | **ruhig**, kein 🔴: „Gesetz geändert, unsere Norm im Wortlaut unverändert" |
| geändert | geändert | `norm_geaendert` | 🔴, benennt den Paragrafen |
| **gleich** | **geändert** | `widerspruch` | 🔴 **laut** — darf nicht vorkommen |

Die vierte Lage ist der Punkt, an dem der Wächter sich selbst prüft: ein
geänderter Normtext bei unveränderter Standangabe heißt, dass die
Abrufkette etwas verschluckt oder die Quelle still korrigiert hat. Ohne
diese Lage wäre der Fingerabdruck ein Selbstnachweis aus demselben
Datenfluss wie die Standangabe.

**Die Zwischenänderungen erledigen sich damit von selbst.** Ein
Hash-Vergleich fragt nicht „wie viele Schritte", sondern „ist der Wortlaut
heute ein anderer als beim Bestätigen". Drei Änderungen oder dreißig — die
Antwort ist dieselbe und sie ist richtig.

**Der Nebengewinn ist der eigentliche:** Lage 2 ist der Regelfall und wird
ruhig. Heute wäre jede BGB-Änderung ein roter Alarm über sieben Zeilen.

### Stufe 2 — mittelbare Betroffenheit — NICHT in dieser Runde

Ein Paragraf kann betroffen sein, ohne dass sein eigener Wortlaut sich
ändert: wenn eine Norm, auf die er verweist, geändert wird.

Für DIESEN Fall GEMESSEN und ausgeschlossen: keiner unserer sieben
Paragrafen verweist auf eine der dreizehn geänderten Normen (Suche nach
`§ <nr>` im jeweiligen Normtext, alle sieben „keine"). **Positivkontrolle
der Methode:** dieselbe Suche findet die geänderten Normen in den
Änderungsgesetzen sehr wohl (§ 434: 6 Treffer, § 475: 5, § 650: 1,
§ 1598: 6, § 555b: 1, § 559f: 1).

Automatisierbar wäre es: man müsste Hashes für ALLE Normen des Gesetzes
halten, nicht nur für unsere sieben, und bei einer Änderung schneiden.
Beim BGB sind das einige tausend Einträge im Register.

**Empfehlung: Stufe 2 jetzt NICHT bauen**, sondern als benannten Rest
führen. Grund: Stufe 1 schließt die gemeldete Lücke vollständig, Stufe 2
löst ein anderes Problem, und ein Register mit mehreren tausend Hashes je
Gesetz ist eine Größenordnung mehr Bau und Pflege. Wer beides in eine Runde
legt, kann hinterher nicht sagen, welcher Teil gewirkt hat.

## Was NICHT gebaut wird — und warum

- **Kein Verfolgen der Bundesgesetzblatt-Kette im Code.** Ich habe es von
  Hand getan und es funktioniert, aber es hängt an PDF-Textextraktion und an
  der Formulierung von Gesetzespräambeln. Der Hash-Vergleich beantwortet
  dieselbe Frage direkt, ohne diese Abhängigkeit.
- **Kein Ersetzen der Standangabe durch den Hash.** Die Standangabe bleibt
  als billiger Stolperdraht und als das, was ein Mensch im Register liest.
  Ein Hash allein ist für niemanden lesbar.
- **Kein automatisches Bestätigen.** Auch bei Lage 2 („Norm unverändert")
  trägt ein Mensch den neuen Stand ein. Der Wächter berichtet, er entscheidet
  nicht — dieselbe Trennung wie überall bei uns.

## Gegenproben, die der Bau zu liefern hat

Jede in beiden Richtungen, mit echten Zahlen:

1. **Normtext geändert → ROT.** Einen gespeicherten `normtext_sha256`
   verfälschen; die Zusicherung MUSS fallen. Zurücknehmen → grün.
2. **Nur die Standangabe geändert → RUHIG.** Gespeicherte Standangabe
   verfälschen, Hash korrekt lassen; es darf **kein** 🔴 entstehen, und die
   Lage muss `gesetz_geaendert_norm_gleich` heißen — nicht bloß „kein Alarm".
3. **Widerspruchslage.** Standangabe korrekt, Hash verfälscht → laute
   Meldung. Diese Lage darf NIE stillschweigend als „unverändert" durchgehen.
4. **Die Extraktion selbst.** Den `<enbez>`-Treffer auf einen nicht
   existierenden Paragrafen umbiegen → der Wächter muss LAUT scheitern, nicht
   mit leerem Text weiterlaufen. „Leeres Ergebnis ist nicht sauberes
   Ergebnis": ein leerer Normtext hashte sonst stabil und meldete für immer
   „unverändert".
5. **Positivkontrolle der Extraktion.** Der herausgelöste Text von § 823 muss
   wörtlich mit „(1) Wer vorsätzlich oder fahrlässig" beginnen und 512 Zeichen
   lang sein — ein literal hingeschriebener Sollwert, nicht einer, den
   derselbe Code erzeugt.
6. **Kein zusätzlicher Netzabruf.** Zählen, dass die Zahl der HTTP-Anfragen je
   Lauf sich nicht erhöht. Sonst ist aus einer Auswertungsänderung heimlich
   eine Lastfrage geworden.

Zusicherung 5 ist die wichtige: ohne sie misst der Test die Extraktion mit
demselben Sieb, mit dem sie stattfindet.

## Restrisiken — benannt, nicht gelöst

- **Ändern und Zurückändern zwischen zwei Läufen** bleibt unsichtbar. Gilt
  heute genauso; der Hash verschiebt es nicht, er beseitigt es auch nicht.
- **Mittelbare Betroffenheit** (Stufe 2, s. o.).
- **Der Wächter sagt „Wortlaut gleich", nicht „Rechtslage gleich".**
  Rechtsprechung, Auslegung und aufgehobene Verweisungen sieht er nicht. Das
  war noch nie anders, gehört aber in die Meldung, damit niemand aus der
  ruhigen Lage 2 mehr liest als dasteht.

## ENTSCHIEDEN — 16.09.2026

**Stufe 1 allein wird gebaut.** Betreiber wörtlich: „stufe 1 sollte erst mal
genug sein aber nimm den rest in dein gedächtniss". Stufe 2 ist
zurückgestellt, nicht verworfen, und steht als offener Punkt in
`plaene/STAND.md` samt der drei Restrisiken. Der Abschnitt unten bleibt als
Beleg stehen, wie die Frage gestellt war.

## Wie die Frage gestellt war

Ich empfehle **Stufe 1 allein** und melde Stufe 2 als Rest. Wer widerspricht,
bekommt beides in einer Runde — dann aber mit der Ansage, dass das Register
je Gesetz um mehrere tausend Einträge wächst.

---

# NACHTRAG 16.09.2026 — Gegenlesung des Plans, sechs Befunde

Gegengelesen am 16.09.2026 (Kosten 3,64 $, 6 Runden, 12 Suchen, 14 Lesungen).
**Vier blockierende, zwei „sollte behoben werden" — ich habe JEDEN selbst
nachgemessen, alle sechs tragen.** Der Plan oben bleibt als Beleg stehen, wie
er eingereicht wurde; verbindlich für den Bau ist ab hier dieser Nachtrag.

Zwei Bemerkungen der Gegenlesung sind KEINE Befunde, sondern Folgen meines
eigenen Auftrags: sie fand `plaene/STAND.md` nicht und den Plan nicht im
Repo — beide liegen im Belehrungssystem-Repo, während ich als Wurzel
`/home/user/gymdocu` gesetzt hatte. Mein Fehler beim Zuschnitt, nicht ihrer.

## B1 (blockierend) — Zusicherung 5 verschiebt den Selbstnachweis

Präfix und Länge sind kein Sollwert für einen TEXT. Ein falscher Text mit
richtigem Anfang und gleicher Länge besteht die Prüfung; und die 512 stammt
aus meiner eigenen Extraktionsmessung, ist also nur von Hand abgeschrieben,
nicht unabhängig gewonnen. Das ist unsere eigene Klasse „eine Zusicherung
über eine ZAHL ist keine Zusicherung über eine MENGE".

**Verbindlich:** eingefrorener XML-Ausschnitt UND der vollständige erwartete
Klartext im Repo, Vergleich auf VOLLSTÄNDIGE Gleichheit. Mutationen am ENDE
des Textes, am letzten Listenpunkt und eine GLEICH LANGE Wortänderung
gehören zu den Gegenproben — sonst prüft man nur den Anfang.

## B2 (blockierend) — fehlende Hashes haben keinen Vertrag

GEMESSEN am Bestand: `core/rechtsstand.js:925-930` — ein vorhandener Eintrag
genügt heute für den Vergleich, `undefined === undefined` wäre „Normtext
gleich". **Und der Umfang war mir nicht klar: 61 der 72 Quellen sind
`gii-xml`, verteilt auf 18 Gesetze** (selbst gezählt über `quellen()` und
`artFuer()`). 61 Hashes müssen also erstmals bestätigt werden.

**Verbindlich:** fehlender oder ungültiger SOLL-Hash → eigene Lage
„Normtext noch nicht bestätigt", NIE ruhig und NIE unverändert. Fehlender
IST-Hash oder misslungene Extraktion → Prüfungsfehler. Erst nach dieser
Gültigkeitsprüfung greifen die vier Vergleichslagen. Ein heute erzeugter
Hash bekommt sein EIGENES Bestätigungsdatum; er wird nicht unter das alte
`bestaetigt_am` geschoben, denn für den damaligen Wortlaut haben wir keinen
Beleg.

## B3 (blockierend) — der Verbraucher verschweigt neue Lagen

**Der teuerste Befund, von mir nachgemessen** an
`ops/gymdocu-rechtsstand-watch.js:411-417`:

    case 'unbekannt': return 'rot';
    case 'geaendert': return eintrag.nurPruefsumme ? 'ruhig' : 'rot';
    case 'nicht_erreichbar': return warVorherNichtErreichbar ? 'rot' : 'unbestaetigt';
    default: return 'still';

Alle drei neuen Lagen fielen auf `still` — kein Telegram-Alarm, kein
Exit-Code 1. Der Wächter hätte eine geänderte Norm erkannt und
geschwiegen. Genau unsere Klasse „leeres Ergebnis ist nicht sauberes
Ergebnis".

Dazu zwei eigene Messungen: **`klassifiziere` wird in
`test_feature_rechtsstand.js:43` importiert und in der ganzen Datei NIE
aufgerufen** (1 Vorkommen insgesamt) — die Funktion ist heute völlig
unbewacht. Und der Cron startet eine **von Hand installierte Kopie** unter
`/usr/local/bin/` (`ops/cron.d-gymdocu-rechtsstand:20-28` warnt selbst
davor, mit Präzedenzfall) — neues Core-Modul plus alte Ops-Kopie ergäbe
eine Mischversion.

**Verbindlich im Bauumfang:** `klassifiziere`, Meldungstexte,
Zusammenfassungszähler, Exit-Code-Regel und Statusformat. Nur
`unveraendert` darf `still` ergeben; eine UNBEKANNTE Lage muss laut
scheitern statt still durchzugehen. `klassifiziere` bekommt seine erste
Zusicherung überhaupt. Das `install -m 755` ist ein benannter
Auslieferungsschritt, kein Nebensatz.

## B4 (blockierend) — Einzelparagraf, Cache und Mehrdeutigkeit

**Die Cache-Falle ist real und wäre ein stilles falsches Grün**, von mir
nachgelesen an `ops/gymdocu-rechtsstand-watch.js:294-315`: `giiCache` hält
EIN Abrufergebnis JE GESETZ, das sich alle Paragrafen teilen. Ein
`normtext_sha256` im Abrufergebnis würde bedeuten, dass alle sieben
BGB-Fundstellen gegen den Hash des ZUERST angefragten Paragrafen
vergleichen. **Verbindlich: der Cache trägt das XML bzw. einen Normindex,
NIE einen Hash.** Eine Fixtur mit mehreren Normen, verschiedenen erwarteten
Hashes und Änderung nur EINER Norm muss das beweisen.

**Buchstabenzusätze gibt es im Bestand schon:** `core/rechtsstand.js:509`
trägt `arbst_ttv_2004/__3a.html`. Ein Präfixvergleich auf `§ 3` würde dort
falsch greifen. Auch „null Treffer" ist nicht der einzige Fehlerfall —
zwei Treffer, vorhandener `<enbez>` mit leerem Text und weggefallene
Normen gehören unterschieden.

**Nicht übernommen, weil gemessen gegenstandslos:** mehrere XML-Dateien im
Archiv sind bereits sicher behandelt (`core/rechtsstand.js:241-244` wirft
bei `length !== 1`, geprüft in `test_feature_rechtsstand.js:485-492`) — das
bleibt, wie es ist. Und die geforderte „sichere Parserkonfiguration ohne
externe Entitäten" zielt auf einen XML-Parser; wir schneiden mit regulären
Ausdrücken, es gibt keine Entity-Auflösung. Wer das später ändert, holt
sich die Frage zurück.

## B5 (sollte) — die vier Lagen sind eine Teilmenge

Sie setzen ZWEI gültige Vergleichspaare voraus. **Im Bestand gibt es aber
Einträge, deren `stand` gar keine Standangabe ist** — vier UVSV-Einträge
(`core/rechtsstand.js:660-675`) tragen wörtlich „kein
`<standangabe>`-Element im XML-Metadatenblock". „Stand nicht verfügbar",
„Hash unbestätigt", „Norm fehlt" und „Extraktion mehrdeutig" passen in
keine der vier Zeilen.

**Verbindlich:** die vier Zeilen gelten NACH erfolgreicher Gültigkeits-
prüfung. Und die vierte Lage wird nicht länger als „Selbstprüfung des
Wächters" beschrieben — sie erkennt eine bestimmte Inkonsistenz, sie macht
einen gemeinsamen Datenfluss nicht unabhängig. Der Satz im Plan oben war zu
stark.

## B6 (sollte) — mein Plan verspricht mehr, als er hält

„Die Zwischenänderungen erledigen sich von selbst" und „Stufe 1 schliesst
die gemeldete Lücke vollständig" widersprechen meinem eigenen Abschnitt
„Restrisiken", in dem Ändern-und-Zurückändern als unsichtbar steht. Es ist
ein **Endpunkt-Wortlautvergleich**, keine Kettenprüfung, und so wird es
genannt — auch in jeder ruhigen Meldung.

Ebenso zu stark war „mittelbare Betroffenheit ausgeschlossen": belegt ist
„keine mit der Suchform `§ <nr>` gefundenen direkten Verweise".
Bereichsangaben wie „§§ 434 bis 479" und ausgeschriebene Verweise deckt sie
nicht. Die Positivkontrolle belegt EINE Schreibweise, nicht alle.

## Bestehende Testschwächen, die dabei aufgefallen sind

Nicht aus diesem Plan, aber am selben Wächter — zwei davon selbst
nachgelesen und bestätigt:

- `test_feature_rechtsstand.js:179-180` hält `mitEintrag` gegen
  `alleQuellen.length`; beide Seiten stammen aus derselben Liste. Fiele eine
  Quelle aus `quellen()` heraus, bliebe die Zusicherung grün.
- `:667/677-678` prüft die Pausen gegen dieselben importierten
  Produktionskonstanten (`ABRUF_PAUSE_MS`, `WIEDERHOLUNG_PAUSE_MS`) — 1500→0
  und 8000→1 blieben grün. Die Relation „zweite länger als erste" trägt
  immerhin.
- Weiter gemeldet, noch NICHT selbst nachgemessen: die Kollisions-Gegenprobe
  bei `:119-145` benutzt eine Kopie der Prüflogik statt des Helfers; die
  `esc()`-Zusicherung bei `:810-813` genügt sich mit EINEM erreichbaren
  Aufruf; die Hostliste bei `:858-867` ist eine Kopie der Liste aus
  `test_feature_lexikon.js:92-103`.

**`klassifiziere` gehört NICHT in diese Liste, sondern in den Bauumfang**
(B3): Stufe 1 führt Lagen ein, die genau durch diese ungeprüfte Funktion
laufen.
