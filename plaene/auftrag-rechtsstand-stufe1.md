# Auftrag — Rechtsstand-Wächter Stufe 1: Normtext-Fingerabdruck

Arbeitsbaum `/home/user/gymdocu`, eigener Zweig ab `master`. Der Baum gehört
dir allein.

**Einordnung (Vorgabe der CLAUDE.md, vor dem Auftrag getroffen):** Standard-
Executer, nicht Fable. Die Aufgabe ist gross, aber nicht sehr komplex — die
vier gefährlichen Stellen sind durch die Gegenlesung BENANNT und unten
wörtlich zitiert; es ist kein Herleiten von Schwellen und kein Entwurf über
den Auftrag hinaus.

Grundlage: `plaene/rechtsstand-kette-plan.md` im Belehrungssystem-Repo
(`/home/user/Belehrungssystem`). **Lies zuerst den NACHTRAG ab „Gegenlesung
des Plans" — er ist verbindlich, der Plan davor ist nur die Vorgeschichte.**

## Wozu

Der Wächter (`ops/gymdocu-rechtsstand-watch.js`, Register und Logik in
`core/rechtsstand.js`) vergleicht heute nur die Standangabe des GANZEN
GESETZES. Folge: eine Mietrechtsänderung färbt alle sieben BGB-Fundstellen
rot, und mehrere Änderungen zwischen zwei Läufen sind nicht auseinander zu
halten. Stufe 1 führt zusätzlich einen SHA-256 des NORMTEXTES des jeweiligen
Paragrafen.

**Die tragende Messung steht schon** (von mir, am echten Abruf): das XML, das
der Wächter ohnehin lädt, enthält jeden Paragrafen einzeln. `bgb/xml.zip` =
467.258 Bytes, entpackt 2.489.137 Zeichen, EINE XML-Datei; `<enbez>§ 823</enbez>`
genau 1 Treffer. **Es braucht KEINEN zusätzlichen Netzabruf.**

## Was zu bauen ist

### 1. Extraktion des Einzelparagrafen

Aus dem entpackten Gesetzes-XML den `<norm>`-Block zum gesuchten `<enbez>`
herauslösen und daraus den Normtext (`<textdaten>`) gewinnen. Neue Funktion
in `core/rechtsstand.js`, exportiert, mit den anderen Extraktoren daneben.

**Verbindlich:**
- **Exakter Vergleich der Bezeichnung, kein Präfix.** Im Bestand liegt
  `arbst_ttv_2004/__3a.html` (`core/rechtsstand.js:509`) — ein Präfixtreffer
  auf „§ 3" würde dort die falsche Norm nehmen.
- **Null Treffer, MEHR als ein Treffer und ein Treffer mit leerem Text sind
  DREI verschiedene Fehler** und müssen alle drei laut scheitern. Ein leerer
  Normtext hashte sonst stabil und meldete für immer „unverändert".
- Die Normalisierung (Absatztrenner, Entities, Whitespace) wird im
  Kopfkommentar festgeschrieben — sie ist Teil des Sollwerts.

### 2. Der Cache darf NIE einen Hash tragen

`bewerteAlleQuellen()` (`ops/gymdocu-rechtsstand-watch.js:294-315`) hält EIN
Abrufergebnis JE GESETZ, das sich alle Paragrafen teilen. **Läge
`normtext_sha256` im Abrufergebnis, verglichen alle sieben BGB-Fundstellen
gegen den Hash des ZUERST angefragten Paragrafen** — ein stilles falsches
Grün. Der Cache trägt das XML bzw. einen Normindex; der Hash entsteht JE
QUELLE.

**Das ist die Zusicherung, die diese Runde am dringendsten braucht:** eine
Fixtur mit mehreren Normen, VERSCHIEDENEN erwarteten Hashes und Änderung nur
EINER Norm. Ändert sich dabei die Bewertung der anderen mit, ist der Cache
falsch verdrahtet.

### 3. Gültigkeit VOR den vier Lagen

Erst prüfen, dann vergleichen:

- Soll-Hash fehlt oder ist ungültig → eigene Lage „Normtext noch nicht
  bestätigt". **NIE ruhig, NIE unverändert.** `undefined === undefined` darf
  nirgends „Normtext gleich" bedeuten.
- Ist-Hash fehlt oder die Extraktion misslang → Prüfungsfehler, je Quelle
  isoliert (s. Punkt 5).
- Erst danach die vier Vergleichslagen:

| Standangabe | Normtext | Lage |
|---|---|---|
| gleich | gleich | `unveraendert` |
| geändert | gleich | `gesetz_geaendert_norm_gleich` (ruhig) |
| geändert | geändert | `norm_geaendert` (rot) |
| gleich | geändert | `widerspruch` (rot, laut) |

**Im Bestand gibt es Einträge, deren `stand` gar keine Standangabe ist** —
vier UVSV-Einträge (`core/rechtsstand.js:660-675`) tragen wörtlich „kein
`<standangabe>`-Element im XML-Metadatenblock". Die vier Lagen gelten NACH
der Gültigkeitsprüfung, nicht davor.

### 4. Der Verbraucher muss die neuen Lagen kennen — sonst ist alles umsonst

**VON MIR GEMESSEN, und es ist der gefährlichste Punkt des Auftrags:**
`klassifiziere()` (`ops/gymdocu-rechtsstand-watch.js:411-417`) endet mit

    default: return 'still';

Alle neuen Lagen fielen damit auf `still` — **kein Telegram-Alarm, kein
Exit-Code 1.** Der Wächter hätte eine geänderte Rechtsnorm erkannt und
geschwiegen.

Zum Bauumfang gehören deshalb ausdrücklich: `klassifiziere`, die
Meldungstexte, die Zusammenfassungszähler (`:386-395`), die Exit-Code-Regel
und das Statusformat.

**Nur `unveraendert` darf `still` ergeben. Eine UNBEKANNTE Lage muss laut
scheitern** statt still durchzugehen — sonst wiederholt sich derselbe Fehler
bei der nächsten Erweiterung.

**`klassifiziere` hat heute keine einzige Zusicherung.** VON MIR GEMESSEN:
die Zeichenkette kommt in `test_feature_rechtsstand.js` GENAU EINMAL vor,
nämlich in der Importzeile 43. Sie bekommt in dieser Runde ihre erste.

### 5. Ein defekter Normblock darf nicht den ganzen Lauf reissen

`bewerteAlleQuellen()` hat um die Verarbeitung EINER Quelle keinen eigenen
Fehlerfang. Ein geworfener Extraktionsfehler bräche bis zum äusseren catch
durch, und die übrigen 60 Quellen blieben ungeprüft. Je Quelle fangen, als
Prüfungsfehler melden, weiterlaufen.

### 6. Die Erstbefüllung ist eine eigene Bestätigung

**VON MIR NACHGEZÄHLT: 61 der 72 Quellen sind `gii-xml`, verteilt auf 18
Gesetze.** So viele Hashes müssen erstmals in das Register. Dazu:

- Ein Werkzeug (nicht der Wächter selbst!), das die Hashes ERZEUGT und
  ausgibt. Der Wächter schreibt das Register NIE selbst fort — die
  Begründung steht im Kopfkommentar von `core/rechtsstand.js` und gilt
  unverändert.
- **Jeder neu erzeugte Hash bekommt sein EIGENES Bestätigungsdatum.** Er
  wird NICHT unter das alte `bestaetigt_am` geschoben: für den damaligen
  Wortlaut haben wir keinen Beleg.
- **Melde mir die erzeugte Liste, trag sie NICHT selbst ein.** Ob 61 Hashes
  in einem Zug bestätigt werden oder ob wir mit dem BGB anfangen, entscheide
  ich, nicht du.

## Gegenproben — beide Richtungen, mit echten Zahlen

1. **Normtext geändert → ROT.** Fixtur-TEXT ändern (nicht nur den
   gespeicherten Hash — das prüfte nur den Vergleicher). Zurücknehmen → grün.
2. **Nur die Standangabe geändert → RUHIG.** Die Lage muss wörtlich
   `gesetz_geaendert_norm_gleich` heissen, nicht bloss „kein Alarm".
3. **Widerspruchslage:** Stand gleich, Text geändert → laut. Diese Lage darf
   NIE als „unverändert" durchgehen.
4. **Die Extraktion, vier Fälle einzeln:** null Treffer, ZWEI Treffer,
   vorhandener `<enbez>` mit leerem Text, weggefallene Norm. Jeder muss laut
   scheitern, jeder mit unterscheidbarem Grund.
5. **Der Sollwert kommt von aussen.** Der erwartete Klartext von § 823 steht
   VOLLSTÄNDIG und literal im Test, nicht als Präfix und nicht als Länge.
   **Mutationen am ENDE des Textes und eine GLEICH LANGE Wortänderung
   müssen auffallen** — sonst prüfst du nur den Anfang.
6. **Der Cache isoliert.** Fixtur mit mehreren Normen, verschiedene Hashes,
   Änderung nur einer: die anderen bleiben unverändert bewertet.
7. **Kein zusätzlicher Netzabruf.** Zähl die Abrufe je Lauf gegen einen
   literal hingeschriebenen Sollwert. Es gibt dafür schon ein Vorbild:
   `test_feature_rechtsstand.js:585-590` zählt 1/1/2.
8. **`klassifiziere`:** jede neue Lage einzeln, PLUS eine erfundene Lage, die
   laut scheitern muss.

**Alle Tests bleiben speicherintern.** Keine echten Netzabrufe, kein
`main()`, kein Schreiben der echten Statusdatei. Dieselbe Suite läuft auf dem
Live-Server als Deploy-Gate.

## Ausdrücklich NICHT in dieser Runde

- **Stufe 2 (mittelbare Betroffenheit).** Betreiber-Entscheidung 16.09.2026:
  „stufe 1 sollte erst mal genug sein".
- **Keine Verfolgung der Bundesgesetzblatt-Kette im Code.**
- **Mehrere XML-Dateien im Archiv nicht anfassen.** Das ist bereits sicher
  behandelt (`core/rechtsstand.js:241-244` wirft bei `length !== 1`, geprüft
  in `test_feature_rechtsstand.js:485-492`). Den Abbruch BEIBEHALTEN.
- **Keine XML-Parser-Umstellung.** Wir schneiden mit regulären Ausdrücken;
  es gibt keine Entity-Auflösung und damit auch nicht die Frage nach
  externen Entitäten.
- Die vier gemeldeten Altschwächen der Testdatei (`:119-145`, `:179-180`,
  `:667/677-678`, `:810-813`, `:858-867`). Nur berichten, nicht beheben.

## Wichtig zum Ausliefern — nicht vergessen

`ops/cron.d-gymdocu-rechtsstand:20-28` warnt selbst davor: der Cron startet
eine **von Hand installierte Kopie** unter `/usr/local/bin/`. Neues Core-Modul
plus alte Ops-Kopie ergibt eine Mischversion, in der die neuen Lagen im
alten `klassifiziere` auf `still` fallen. **Nenn den nötigen
`install -m 755`-Schritt in deinem Bericht**, damit ich ihn nicht übersehe.

## Abschluss

1. Volle Suite SELBST: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`
2. Dateizahl-Ritual, breites Muster, MIT der Normalisierung
   `sed 's/── //; s/ ──//'` auf der Log-Seite. Stand heute: 324 = 324,
   `diff` EXIT 0 — kommt eine Testdatei dazu, sag die neue Zahl und woher
   die Abweichung kommt.
3. `npm run lint` — wörtlich, AUCH bei Grün.
4. Marker-Scan, Sollwert 6.
5. Committen und pushen, BEVOR du auf einen langen Lauf wartest.

**Melde wörtlich:** Suite-Exit und PASS/FAIL, Dateizahl, Lint, Marker, und zu
JEDER der acht Gegenproben beide Richtungen mit echten Zahlen. Dazu die Liste
der erzeugten Hashes (nicht eingetragen) und den Auslieferungsschritt.

**Widersprich mir mit einer Messung, wenn eine Vorgabe nicht trägt.** In den
letzten Runden hatten Ausführende damit mehrfach recht, und einmal hat es
einen falschen Satz aus meinem Bericht an den Betreiber geholt.
