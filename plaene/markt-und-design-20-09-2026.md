# Markt, Bedienung und Startseite — vier KI-Läufe vom 20.09.2026

**Betreiber-Auftrag** („kannst du die anderen ki beauftragen gymdocu mit
potenteillen mitbewerbern zu verglichen … ideen zur vereinfachung für admin,
trainer … vorschläge zum design der homepage … gerne mit animation. auch da
bitte bei den andeen hompages nachsehen lassen").

## Wie gelaufen wurde

Vier Spuren, **verschiedene Aufträge UND verschiedene Bündel** — nach der
Messung vom selben Tag überlappt gleiches Material zu mehr als der Hälfte.

| Spur | Modell | Websuche | Bündel |
|---|---|---|---|
| `mitbewerber` | `gpt-5.6-sol` | ja | nur die Produktbeschreibung — es soll nach AUSSEN sehen |
| `homepage` | `gpt-5.6-sol` | ja | Produktbeschreibung + der echte, live abgeholte Quelltext von gymdocu.de |
| `einfach-k` | `kimi-k3` | nein | Handbuch + **Trainer**-Einstieg + Einrichtungs-Assistent |
| `einfach-d` | `deepseek-v4-pro` | nein | Handbuch + **Admin-Dashboard** (Trainer-Einstieg NICHT im Bündel) |

**Websuche nur bei OpenAI**, weil nur dort eine funktioniert: kimis ist laut
Hersteller „being updated and not recommended", deepseek hat keine. Eine
Marktaussage ohne Quelle ist bei uns keine.

**Positivkontrolle vorweg** (`probe.js`): `tools:[{"type":"web_search"}]` und
`text.format` mit `json_schema`/`strict` gehen zusammen — HTTP 200, ein
`web_search_call` im Ergebnis, richtige Antwort mit URL.

**Der Vorspann erzwingt die Beweislast:** jede Tatsachenbehauptung trägt
`belegt` (mit URL, in dieser Sitzung gelesen), `vermutet` oder `unklar`;
Seiten, an die eine Spur nicht herankam, gehören in ein eigenes Feld. Eine
benannte Lücke ist ein Ergebnis, eine kaschierte ist Schaden.

**Alles hier ist eine BEHAUPTUNG, bis ich sie selbst gemessen habe.** Was
gemessen ist, steht ausdrücklich so da.

---

## Spur `einfach-d` (`deepseek-v4-pro`) — Admin-Dashboard

127,6 s, 26.492 Eingabe- / 9.569 Ausgabe-Token (davon 6.966 Nachdenken),
Status `stop`. Sechs Ideen, alle für die Rolle Admin — folgerichtig, denn das
Trainer-Material war nicht im Bündel, und **es hat das von sich aus gemeldet**
(„Trainer-Tablet-Oberfläche … fehlen vollständig; daher können Handgriffe und
Fehlerfälle für Trainer nicht belegt werden"). Genau so soll eine Spur mit
einer Materiallücke umgehen.

### NACHGEMESSEN und getragen — und es ist mehr als eine Idee

**Die grüne Karte lügt, sobald ein Studio die Getränkeanlage benutzt.**

Gemessen, je einzeln am Quelltext:

* `routes/admin/dashboard.js:545-548` zeigt „Alles im grünen Bereich —
  **Keine kritischen Aufgaben offen — alle Kontrollen aktuell**", sobald
  `!kritisch.length && !dieseWoche.length`.
* Die Zeichenkette `getraenke`/`Getränke` kommt in `routes/admin/dashboard.js`
  **null Mal** vor. Das Dashboard fragt den Bereich also gar nicht ab.
* Es gibt aber einen Zähler dafür:
  `routes/getraenkeanlage.js:70 zaehleUeberfaelligeReinigungen(db, studioId)`.
* Sein EINZIGER Aufrufer im Produktivcode ist `server.js:1177` — und das ist
  die **Trainer-Startseite**, nicht das Admin-Dashboard. Dort setzt `:1181`
  sogar `hart = true`, im Kommentar: „eine überfällige Pflichtreinigung ist
  harter Verzug".

**Folge:** derselbe Zustand heisst auf dem Trainer-Tablet „harter Verzug" und
auf dem Dashboard des Betreibers „alle Kontrollen aktuell" — bei genau dem
Benutzer, der bei einer Prüfung geradestehen muss. Das ist unsere teuerste
Klasse (eine FALSCHE Zusicherung von Vollständigkeit), nur in der Oberfläche
statt in einem Test.

**Einschränkung, gemessen:** die Kachel ist eine Opt-in-Einstellung
(`server.js:1174`, `conf('kachel_getraenkeanlage','0') === '1'`). Studios ohne
sie sind nicht betroffen. Das macht den Befund kleiner, nicht falsch.

**Nachgemessen, und es ist NICHT ein vergessenes Modul, sondern die
Bauweise:** DeepSeek hatte nebenbei angemerkt, beim Spülplan werde nur
geprüft, ob STELLEN fehlen, nicht ob eine Spülung FÄLLIG ist. Das trägt:

* `routes/admin/dashboard.js` erwähnt `spuel` an **genau zwei** Stellen
  (`:518-519` und `:524`), und beide fragen nur
  `SELECT COUNT(*) FROM spuel_stellen … aktiv = 1`.
* Die Fälligkeit rechnet `core/spuelplan.js:89 ladeStatus()` aus
  (`turnusFaellig` bei `:98`, dazu die Wiederinbetriebnahme nach einer
  Schliessphase). Aufgerufen wird sie im Produktivcode von `server.js:974` —
  **wieder die Trainer-Startseite**, nicht das Dashboard.

Damit stehen ZWEI Pflichtbereiche ausserhalb der grünen Karte, und der zweite
ist Trinkwasser (§ 31 TrinkwV, 72-Stunden-Regel) — also genau die Sorte
Nachweis, für die dieses System existiert. Der Befund lautet deshalb nicht
„die Getränkeanlage fehlt", sondern: **die grüne Karte prüft eine FESTE
Teilmenge und behauptet Vollständigkeit.** Jedes künftige Modul erbt den
Fehler, ohne dass jemand etwas falsch macht.

**Weiterhin NICHT gemessen:** ob es über Spülplan und Getränkeanlage hinaus
weitere Bereiche mit eigener Fälligkeit gibt (Verbandbuch, Betriebszeiten,
Korrekturen). Das ist eine eigene Kartierung — und nach der Hausregel eine,
bei der das Suchmuster zuerst an einem BEKANNTEN Fall gelernt wird: hier an
`zaehleUeberfaelligeReinigungen` und `ladeStatus`, die beide nur von
`server.js` gerufen werden.

### Strukturell bestätigt, Wirkung nicht beurteilt

* **Ein einziges `try/catch` um den ganzen „Heute wichtig"-Block** — bestätigt
  (`:145 let heuteHtml`, `:550 heuteHtml = dash`, `:567` die Fehlerkarte).
  Ein Fehler in einer von acht Abfragen ersetzt alle acht. Das ist dieselbe
  Klasse wie der Ladebestand-Beitrag, der gerade gebaut wird — dort geht es
  um den stillen Fehler, hier um den zu breiten Auffangraum.
* **Vier Fehlerzweige enden auf „bitte der Leitung melden"** ohne Link, ohne
  Wiederholung, ohne Angabe, welcher Bereich klemmt (u. a. `:415`).

### Übernommen als Ideen, NICHT nachgemessen

* Einrichtungs-Fortschrittszeile verschwindet nach Abschluss ersatzlos; kein
  dauerhafter Weg zurück zu den gegebenen Antworten.
* Fachbegriffe ohne Erklärung auf dem Dashboard (DGUV V3, Maßnahmenwert,
  72-Stunden-Regel).
* Karten zeigen nur die ANZAHL, die Namen stecken in `<details>` — die
  häufigste Frage („welche Geräte?") kostet immer einen Klick extra.

---

## Spur `einfach-k` (`kimi-k3`) — Trainer-Einstieg und Einrichtungs-Assistent

462,3 s, 20.513 Eingabe- / 14.408 Ausgabe-Token (8.213 Nachdenken), Status
`completed`. Acht Ideen, davon vier für den Trainer — genau die Rolle, die
der anderen Spur fehlte. **Sieben Einträge unter „fehlendes Material"**,
darunter die Selbstauskunft, dass `mitarbeiter-auth.js` den Tablet-Login gar
nicht enthält („kommt in der nächsten Phase"). Auch hier: die Lücke wurde
benannt, nicht überspielt.

### NACHGEMESSEN und getragen

**1. Die ✓-Taste des PIN-Feldes ist praktisch unerreichbar** — und beim
Nachmessen fand sich daneben ein Fehler, den kimi NICHT hatte.

`routes/mitarbeiter-auth.js:126 pinNumpad()`, wörtlich:

    if (d === '⌫') { pin = pin.slice(0, -1); updateDisplay(); return; }
    if (d === '✓') { if (pin.length === ${PIN_LEN}) absenden(); return; }
    if (pin.length >= ${PIN_LEN}) return;
    pin += String(d);
    updateDisplay();
    if (pin.length === ${PIN_LEN}) setTimeout(absenden, 200);

Kimis Befund trägt, seine BEGRÜNDUNG ist aber leicht daneben: es heisst dort,
der Zustand `pin.length === 6` halte „nach einem Tastendruck nie an". Er hält
sehr wohl — **200 Millisekunden lang**. In diesem Fenster ist die Taste
erreichbar und löst ein ZWEITES `submit()` desselben Formulars aus.

Und in demselben Fenster liegt ein Fehler, den keine Spur gemeldet hat: **⌫
ist nicht gesperrt.** Wer innerhalb der 200 ms zurücklöscht, hat `pin.length
=== 5`, der bereits gestartete Zeitgeber feuert trotzdem, und `absenden()`
liest `pin` ERST beim Auslösen — abgeschickt wird eine **fünfstellige PIN**.
Der Zeitgeber nimmt keinen Schnappschuss. Das ist dieselbe Klasse wie unsere
Transaktionsfälle: zwischen Entscheidung und Ausführung liegt ein Fenster,
in dem sich die Grundlage ändern kann.

*Behebung gehört zusammen:* ✓ durch „C" ersetzen (kimis Vorschlag) UND den
Zeitgeber bei ⌫ abbrechen. Wer nur das eine tut, lässt das andere stehen.

**2. Die PIN-Regeln stehen nirgends, bevor man tippt.** Gemessen: die Seite
(`:259-266`) sagt genau einen Satz — „Wähle deinen persönlichen 6-stelligen
PIN. Damit meldest du dich am Tablet an." Die Ausschlussregeln stecken in
`core/pin-regeln.js:18 pinSchwach()` und wirken erst nach dem Absenden. Der
Benutzer erfährt die Regel also ausschliesslich dadurch, dass er sie bricht.

### Übernommen als Ideen, NICHT nachgemessen

* Erfolgsseite „PIN gespeichert" ohne jeden weiterführenden Schritt, während
  die FEHLERseite „Link ungültig" einen Knopf hat.
* „Link ungültig" nennt nur den Selbstbedienungsweg über E-Mail — Studios
  ohne hinterlegte E-Mail laufen dort in eine Sackgasse.
* Abzeichen „Zu prüfen" im Einrichtungs-Assistenten ohne Datum und Melder,
  solange die Seite nicht mit `?bereich=` aufgerufen wird.
* Fehlerseite „Datenbankfehler" ohne die (wahre und beruhigende) Aussage,
  dass nichts verändert wurde.

**Kimi hat bei zwei seiner acht Ideen selbst `vermutet` gesetzt**, weil das
Material die Behauptung nicht deckte — und bei Idee 8 ausdrücklich
dazugeschrieben, ein Link auf ein nicht existierendes Ziel wäre schlimmer
als keiner. Das ist die Haltung, die der Vorspann verlangt.

---

## Spur `mitbewerber` (`gpt-5.6-sol`, mit Websuche)

306,2 s, **13 Suchaufrufe**, 111.443 Eingabe- / 22.941 Ausgabe-Token
(12.657 Nachdenken), Status `completed`. Elf Anbieter in drei Ringen,
16 Lücken, **9 ausdrücklich als nicht erreichbar benannte Quellen**.

**Bemerkenswert, weil es das Gegenteil von Konfabulation ist:** Magicline und
EGYM wurden ausdrücklich NICHT als Dokumentations-Mitbewerber gelistet, mit
Begründung — auf den zugänglichen Seiten war kein Prüfpflicht-Modul belegbar,
die Kundenoberfläche ist anmeldepflichtig. Ebenso wurden die eigenen
„GymDocu ist im Vorteil"-Aussagen als `vermutet` markiert, weil sie nur aus
unserer eigenen Produktbeschreibung stammen.

### Eigene Nachmessung der URLs — 11 von 11 erreichbar

Alle elf Hauptadressen liefern HTTP 200 mit 117 KB bis 537 KB Inhalt. Keine
erfundene Domain.

### Eigene Nachmessung der Preisangaben — 5 bestätigt, 1 teils, 1 GEFALLEN

| Anbieter | Behauptung | eigene Messung |
|---|---|---|
| NOVAproof | 49 € netto/Monat | **`49 €` auf `/fitness/`** ✓ |
| firstaudit | Free / 12 € / 22 € je Nutzer, ab 5 | **`€0`, `€12`, `€22` auf `/preise/`**, Text „Premium €22 pro User/Monat (Mind. 5 Benutzer)" ✓ |
| Timly | Essential+ 195 €, Professional 495 € | **`€ 195`, `€ 495`** ✓ |
| TARGPatrol | Gratis-Tarif, 15 US-$ je Nutzer, 12 US-$ jährlich | **`$0`, `$12`, `$15`** ✓ |
| KEVOX | Basic 83 €; Premium **168 € auf der Preisseite gegen 162 € auf einer anderen** | **bestätigt, beide Seiten selbst abgerufen:** `/preise/` → `168€`, `83€`; `/software/` → `162€`, `83€` ✓ |
| LiteLog | 39 € bzw. 35 € | Preisseite unter der genannten Adresse **404**; unter `/de/pricing` stehen `39 €` UND `35 €`. Zahlen ja, Fundstelle falsch — **teilweise** |
| CheckTouch | „Professional ab 79 €, Enterprise auf Anfrage" | **GEFALLEN.** `/preise` zeigt `39 €`, `69 €`, `345 €`, `8,63 €`. Das Wort „Professional" kommt **0-mal** vor, es gibt keine Tarifstufen, sondern einen Rechner. |

**Der KEVOX-Fund ist der wertvollste der ganzen Spur** — und zwar nicht wegen
des Betrags: es ist unsere eigene Hausregel „Dieselbe Aussage an zwei Orten"
bei einem Mitbewerber, im Preis, also an der teuersten Stelle. Sein Vorschlag
daraus („eine einzige maschinenlesbare Preisquelle, automatisierter Test
schlägt bei abweichenden Beträgen fehl") ist für UNS anwendbar: auf
gymdocu.de steht `49,90 €` — gemessen genau einmal, also heute sauber.

**Ein eigener Messfehler, der hierher gehört:** Mein erstes Suchmuster fand
nur `22 €`, nicht `€22`. Damit fielen firstaudit, Timly und TARGPatrol
zunächst fälschlich als „keine Preise" durch, und ich war im Begriff, drei
richtige Befunde als unbelegt abzutun. Dieselbe Krankheit wie am 19.09.2026
bei den `.trim()`-Stellen: **das Muster hat die SCHREIBWEISE mitgemessen.**
Erst beide Stellungen des Währungszeichens ergaben das richtige Bild.

**Eine Einordnung, die ich korrigiere:** CheckTouch wird als „Ring 1 —
fitnessspezifisch" geführt. Die Branchenseite nennt „Fitness" 21-mal, die
PREISseite rechnet aber mit „Kleines Café" und „Restaurant-Kette". Das ist
ein allgemeines Produkt mit Branchen-Landeseiten, kein Fitnessprodukt.

### Die Lücken, geordnet — alle `vermutet`, weil sie gegen unsere eigene Beschreibung gehalten wurden

Vier stuft die Spur als `hoch` ein, und sie hängen zusammen:

1. **Ein Mangel ist bei uns kein eigener Vorgang.** Anderswo: Zuständiger,
   Frist, Priorität, Eskalation, Bearbeitungsstand, Behebungsnachweis,
   formale Schliessung (LiteLog, firstaudit, Lumiform).
2. **Zweistufige Schliessung:** Fachkraft meldet behoben, eine ANDERE
   berechtigte Person prüft und gibt frei — erst dann wird entsperrt (KEVOX).
3. **Vollständiger Offline-Betrieb** mit konfliktfester Synchronisation
   (firstaudit, Lumiform, CheckTouch, ToolSense).
4. **Vorfallakte** für Unfall und Beinaheunfall, getrennt vom technischen
   Mangel (TARGPatrol).

Punkt 1 und 2 zielen auf denselben wunden Punkt und sind **die einzigen, die
ich für sofort entscheidungsreif halte**: unser System hält fest, DASS geprüft
wurde, aber der Weg eines offenen Mangels bis zu seiner Schliessung ist kein
eigener Zustand. Genau dieser Weg ist das, was bei einem Unfall gefragt wird.

**Nicht wegwerfen** (die Gegenrichtung, die ausdrücklich verlangt war): der
Rechts-Assistent, der den Prüfplan mit der Herkunft jedes Intervalls erzeugt;
die gehashte Kette; Löschfristen und Litigation Hold; die anmeldefreie
QR-Defektmeldung; die Herstellerneutralität; PIN und Wandtablet für
wechselnde Teilzeitkräfte.

---

## Spur `homepage` (`gpt-5.6-sol`, mit Websuche)

371,1 s, **11 Suchaufrufe**, 112.264 Eingabe- / 23.568 Ausgabe-Token
(14.053 Nachdenken), Status `completed`. 16 Ist-Befunde, 12 Vorschläge,
10 Referenzseiten, 6 benannte Lücken.

### Vier Befunde, von mir am ausgelieferten HTML nachgemessen — alle vier TRAGEN

| Befund | eigene Messung am live abgeholten `landingpage.html` |
|---|---|
| **Der Navigationslink „Module" zeigt ins Leere** | `href="#module"` **1×**, `id="module"` **0×**, `id="modules"` **0×**. Der Abschnitt hat nur `class="modules"`. Ein Klick springt nirgendwohin. |
| **„Vier Dinge" — es sind fünf** | Text `class="section-sub"`: „Vier Dinge, die ein Ordner voller Zettel nicht leisten kann." Darunter `class="pillar"` **5×**, `pillar-ic` **5×**. |
| **14 Module, die Preiskarte verspricht sechs** | `class="mod"` **14×**, `mod-ic` **14×**; in der Preiskarte steht wörtlich **„Alle sechs Module"**. |
| **Das automatische § steht vor Dingen, die keine Paragraphen sind** | `.mod-legal::before { content:"§" … }`, und von den 14 Rechtsangaben bekommen **fünf** dadurch ein falsches Zeichen: „§ DGUV Vorschrift 3", „§ VDI/DVGW 6023", „§ Hausrecht", „§ VO (EG) 852/2004", „§ Art. 5 DSGVO". |

Der vierte ist der unangenehmste. Die Seite verkauft Rechtssicherheit; ein
falsch gesetztes Paragraphenzeichen auf genau diesen Abzeichen ist der
sichtbarste mögliche Widerspruch. Nebenbei ist es wieder „dieselbe Aussage an
zwei Orten": bei „Hausrecht · § 8 ArbSchG" ist das zweite § von Hand
geschrieben, das erste kommt aus dem Stylesheet.

### Zwei Formulierungen, die mehr versprechen, als wir halten können

Gemessen, wörtlich auf der Seite:

* „So entsteht aus dem täglichen Rundgang ein Nachweis, **der vor Gericht
  zählt**." (1×)
* „Der Eintrag wird signiert und in die hash-verkettete Prüfkette geschrieben
  — **fälschungssicher**." (1×)
* **„manipulationssicher"** (2×, einmal davon im `<title>`).

Das ist eine Garantie über die Beweiswürdigung eines Gerichts, die niemand
geben kann, und ein Absolutheitsanspruch („fälschungssicher") für ein
Verfahren, das Manipulation ERKENNBAR macht, nicht unmöglich. Der Vorschlag —
ersetzen durch „Nachträgliche Änderungen werden in der Protokollkette
erkennbar" — ist sachlich richtig und schwächt den Verkauf kaum.
**Preis geprüft:** `49,90 €` steht genau einmal auf der Seite, die Spur hat
ihn richtig zitiert.

*Eine Kleinigkeit, die NICHT trägt:* Der Vorschlag will auch „Alle
Dokumentationspflichten" ersetzen — diese Zeichenkette kommt auf der Seite
**0-mal** vor. Eine Paraphrase, als Zitat ausgegeben.

### Die Vorschläge — und was daran brauchbar ist

Zwölf Stück, jeder mit Aufbau, Wortlaut, Massen und einer eigenen
Risikoangabe. Der Kern ist derselbe wie bei den Mitbewerbern: **die Seite
erklärt zuerst das Risiko und erst viel später das Produkt.** Die erste
sichtbare Zeile lautet „Prüfpflichten dokumentieren statt nachts wachliegen"
— die Produktkategorie steht nirgends darüber.

**Animation** wurde wie verlangt konkret beantwortet, und die Antwort ist
überwiegend „sparsam bis gar nicht", mit Begründung:

* Der Hero-Text wird NICHT animiert — nichts, was den ersten sichtbaren
  Inhalt verzögert.
* Im Prüfpfad füllt sich nach 400 ms nur die 2 px starke Verbindungslinie
  über 700 ms, danach wechseln drei Statuspunkte im Abstand von 120 ms die
  Farbe. **Kein Inhalt wird zurückgehalten** — er ist von Anfang an da.
* Knöpfe: nur Farbwechsel plus höchstens 1 px Bewegung, 120–160 ms; bei
  Tastaturfokus keine Bewegung, sondern ein 3 px Fokusring.
* `<details>`: nur der Pfeil dreht sich, keine animierte Höhe.
* Der heutige endlos pulsierende grüne Punkt (`@keyframes ping`) soll WEG —
  er zeigt keinen wechselnden Zustand an.
* Bei `prefers-reduced-motion: reduce` entfällt jede Transformation; als
  Beleg die W3C-Erläuterung zu WCAG 2.2.

**Vorschlag 12 ist eine eigene Antwort auf die Gegenrichtungsfrage** und
zählt vier akzeptierte Nachteile auf, darunter den wichtigsten: echte
Screenshots machen Schwächen der Anwendung sichtbar.

---

## Was daraus folgt

**Sofort umsetzbar, weil klein und nachgemessen** (kein Prüflauf nötig, aber
Beitrag und Gegenprobe wie immer):

1. Toter Anker `#module` auf der Startseite.
2. „Vier Dinge" gegen fünf Säulen.
3. „Alle sechs Module" gegen vierzehn.
4. Das automatische § vor fünf Angaben, die keine Paragraphen sind.
5. „vor Gericht zählt" und „fälschungssicher" entschärfen.

**Eigene Beiträge wert, weil sie Verhalten ändern:**

6. **Die grüne Karte des Dashboards prüft eine feste Teilmenge und behauptet
   Vollständigkeit** (Getränkeanlage und Spülplan-Turnus fehlen). Unsere
   teuerste Klasse, in der Oberfläche.
7. **Der 200-ms-Zeitgeber im PIN-Feld nimmt keinen Schnappschuss** —
   zusammen mit der toten ✓-Taste.
8. PIN-Regeln vor der Eingabe zeigen.

**Entscheidung des Betreibers, nicht meine:**

9. Der Mangel als eigener Vorgang mit zweistufiger Schliessung. Das ist die
   grösste gefundene Lücke gegenüber dem Markt und zugleich der grösste
   Bau — es ist eine Produktentscheidung, kein Befund.
10. Umbau der Startseite nach Vorschlag 1/5 (Produkt vor Risiko).

**Was diese vier Läufe NICHT hergeben:** keine Aussage darüber, wie die
Mitbewerber sich WIRKLICH bedienen — in neun Fällen stand eine Anmeldung
davor, und das steht in der Antwort so drin. Keine Preisaussage ohne meine
eigene Nachmessung; eine von sieben ist gefallen. Und keine der
Vereinfachungsideen ist gemessen worden, ausser den dreien oben.
