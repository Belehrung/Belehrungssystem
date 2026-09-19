# Auftrag — Sammelbeitrag Rechtsstand-Wächter (die sieben festgehaltenen Punkte)

Nachfolger von `plaene/auftrag-rechtsstand-stufe1-runde5.md`. Die Stufe 1 ist
gemergt (`c1b052f`, Deploy 419). Dieser Beitrag räumt die sieben Punkte ab,
die bei der Abnahme bewusst NICHT gebaut wurden, weil keiner blockierend war.
Sie stehen datiert in `docs/offene-befunde-31-08-2026.md`, Abschnitt
„Nachtrag zur Abnahme von Runde 5 (17.09.2026)" — **dieser Abschnitt ist die
Quelle, nicht dieses Papier.** Wer hier etwas liest, das dort anders steht:
dort nachsehen und die Abweichung melden.

**Grundregel für diesen Beitrag: er ändert VERHALTEN an einem Wächter, der
wöchentlich auf dem Live-Server läuft und per Telegram meldet.** Jede der
sieben Änderungen bekommt ihre eigene Gegenprobe in beide Richtungen. Zwei
Dinge gelten dabei besonders, weil die fünf Runden davor sie teuer gelehrt
haben:

- **Jede Behebung ist selbst ein Verdächtiger.** In JEDER der fünf Runden hat
  die Behebung der vorigen Runde einen neuen Fehler eingebaut. Frag bei jeder
  Änderung: welche BESTEHENDE Zusicherung könnte mein neuer Rückgabewert,
  mein neuer Statuscode oder mein neuer Leerzustand ab jetzt erfüllen, ohne
  dass das Bewachte noch da ist?
- **Die installierte Ops-Kopie ist nicht der Code im Repo.**
  `core/rechtsstand.js` wird automatisch ausgeliefert,
  `ops/gymdocu-rechtsstand-watch.js` von Hand per `install`. Wer etwas an der
  Schnittstelle zwischen beiden ändert, ändert etwas, das zwischen Merge und
  `install` in zwei verschiedenen Fassungen existiert.

## Die sieben Punkte

### 1. `break` → `continue` in `fuelleAusfuehrlicheEintraege()`

Ein einzelner überlanger Eintrag unterdrückt heute ALLE folgenden.
Gemessen (Haupt-Agent, 17.09.2026): erster Eintrag mit 3900-Zeichen-Grund,
danach fünf kurze → Meldung 182 Zeichen, „0 von 6 ausführlich gezeigt", die
fünf kurzen fehlen vollständig, ~3900 Zeichen Budget ungenutzt. Dieselben
sechs Einträge in umgekehrter Reihenfolge → 1147 Zeichen, alle fünf sichtbar.

Zu beachten: mit `continue` läuft die Schleife weiter, die Reihenfolge bleibt.
Die Abschlusszeile „N von M ausführlich gezeigt" bleibt richtig, weil sie
`gezeigt` zählt. Die Zusicherung dazu darf NICHT wieder eine Zahl aus der
Meldung selbst ziehen (das war ein Review-Befund an Runde 5) — schreib die
erwartete Menge unabhängig hin.

### 2. `<enbez>`/`<textdaten>` auf den ordnungsunabhängigen Ausdruck

`<enbez\b[^>]*>` nimmt ein selbstschliessendes `<enbez/>` als Öffner —
dieselbe Klasse, die bei `<fussnoten>` in Runde 5 zurückgenommen werden
musste. Gemessen: `<enbez/>` vor dem echten `<enbez>§ 7</enbez>` → Wurf
„kein `<norm>`-Block … gefunden", also `pruefungsfehler` und ROT. Ebenfalls
gemessen und ausdrücklich ANDERS: `<textdaten/>` vor dem echten Block ist
harmlos (liefert korrekt den Text), ein Block mit NUR `<textdaten/>` wirft
zu Recht. Behebung: dasselbe `(?:[^>]*[^/])?` wie bei `<fussnoten>`, an
BEIDEN Mustern, plus je eine Fixtur mit selbstschliessender Form und die
Positivkontrolle über den alten Ausdruck.

### 3. `esc()` auf den Lagen-Bezeichner

`zaehleNachLage()` interpoliert `lage` roh; über `baueLagenUebersicht()`
steht dieser Wert seit Runde 5 in JEDER nicht-grünen Meldung. Eine künftige
Lage mit `&`, `<` oder `>` im Namen liesse Telegram bei `parse_mode:'HTML'`
die GANZE Meldung ablehnen, und `telegram()` protokolliert einen Fehlschlag
nur. `baueZeile()` escapt denselben Wert im default-Zweig bereits — die
Zusicherung gehört an die Meldung, nicht an die Funktion allein.

### 4. Eine „N von M"-Zeile für die Unerreichbar-Liste

Gemessen mit 60 unerreichbaren Quellen: 4062 Zeichen, **6 von 60 fehlen**,
der GEKÜRZT-Marker steht dabei in der Meldung — aber es gibt keine Zahl, die
das Fehlen beziffert. Für rot und ruhig gibt es sie. Bau sie analog; die
Liste selbst bleibt im reservierten Skelett.

### 5. Der Abruf-Vertragskommentar nennt `lieferung`

`core/rechtsstand.js` (um Zeile 1294) dokumentiert
`{ ok, stand, bytes?, xmlText? }` ohne `lieferung`, obwohl `bewerteGiiXml()`
seit Runde 5 daran „installierte Kopie veraltet" festmacht. In der PRODUKTION
kann daraus heute nichts folgen — einziger Weg ist `holeAbrufGiiXml()`, und
der Cache hält das VOLLSTÄNDIGE Abrufergebnis als Promise
(`giiCache.set(kuerzel, abrufFunktionen.giiXml(kuerzel))`, dann `await`), er
baut also kein neues Objekt. Nachgemessen, nicht vermutet. Trotzdem: ein
Vertrag, der ein Pflichtfeld verschweigt, führt den nächsten Aufrufer in die
Irre.

### 6. Eine gemeinsame Konstante für `lieferung: 'xml'`

Die Zeichenkette steht wörtlich an zwei Orten (gesetzt in
`ops/gymdocu-rechtsstand-watch.js`, verglichen in `core/rechtsstand.js`) —
„Dieselbe Aussage an zwei Orten", und ausgerechnet an dem Riegel, der die
Versionsabweichung erkennt. Eine aus `core/rechtsstand.js` exportierte
Konstante, die die ops-Datei importiert, macht den Bruch unmöglich statt nur
unwahrscheinlich. **Achtung:** die ops-Datei lädt `core/rechtsstand.js` über
einen Pfad, der auf dem Server nach `/var/www/gymdocu` zeigt — prüf, dass der
Import dort trägt, sonst tauschst du eine stille Doppelung gegen einen
Ladefehler im Cron.

### 7. Die doppelte Längenrechnung in `baueMeldung()`

`basis` wird gebaut, nur um seine Länge zu erfahren; danach werden dieselben
Teile in `teile` ein zweites Mal zusammengesetzt, und die Trennzeichen werden
an drei Stellen von Hand nachgerechnet (`VERBINDUNGS_RESERVE = 20` ist dabei
eine grosszügige Schätzung, kein gerechneter Wert). Kommt ein sechster
Skelettteil dazu, müssen vier Stellen gleichzeitig nachgezogen werden.
**Das ist der einzige Punkt, bei dem ein Umbau mehr Schaden anrichten kann
als die Doppelung**: fass ihn nur an, wenn die Zusicherungen aus Punkt 1 und 4
schon stehen, und miss danach dieselben Härtefälle wie Runde 5 (40 Funde mit
langen Gründen, 25 Unerreichbare mit langen URLs, Sonderzeichen im Namen —
überall ≤ 4096 Zeichen, `<b>`-Tags ausgeglichen, Übersicht und
Unerreichbar-Liste erhalten).

## Abnahme

Volle Suite mit eigenem `SUITE_EXIT`, Dateizahl-Ritual, `npm run lint`
wörtlich. Dazu der Registerabgleich gegen die echten Quellen — er muss
**57 stimmen, 0 Abweichungen, 4 nicht prüfbar** liefern wie vor dem Merge.
Bewegt sich auch nur EIN Fingerabdruck, ist das kein Nebenbefund, sondern
Abbruch und Meldung: dann hat eine der Normalisierungsänderungen den Text
verändert.
