# Auftrag — Rechtsstand-Wächter Stufe 1, RUNDE 3

Runde 2 (`ad2b447`) trägt in der Sache: Suite `SUITE_EXIT=0`, 147 PASS / 0 FAIL,
Dateizahl 325 = 325, Lint EXIT 0, Marker 6. **Die beiden Hauptbefunde der
Runde sind von mir selbst nachgemessen und behoben:** alle sieben überwachten
BGB-Paragrafen sind jetzt gegen kosmetische Umformatierung stabil (vorher 6
von 7), und ein Soll-Hash in Grossbuchstaben erzeugt keinen Fehlalarm mehr —
bei erhaltener Positivkontrolle (ein wirklich falscher Hash bleibt
`widerspruch`).

Runde 3 behebt, was **zwei unabhängige Prüfspuren** danach gefunden haben.
Jeder Punkt unten ist von mir SELBST gemessen; die Zahlen stehen dabei.
Widersprich mit einer Messung, wo eine Vorgabe nicht trägt.

**REIHENFOLGE:** Punkt 5 (Zwischenraum im Text) ändert die Normalisierung.
Miss VORHER und NACHHER, ob sich dadurch ein eingetragener Fingerabdruck
bewegt — nach meiner Messung darf sich KEINER bewegen. Bewegt sich doch
einer, halte an und melde es, statt Hashes nachzuziehen.

---

## 1. BLOCKIEREND — die alte Ops-Kopie macht ALLE 61 Quellen rot

`core/rechtsstand.js` wird automatisch ausgeliefert, die Wächter-Kopie unter
`/usr/local/bin/gymdocu-rechtsstand-watch.js` wird von HAND installiert
(`ops/cron.d-gymdocu-rechtsstand`, `ops/README.md`). Zwischen Merge und
`install` läuft also der NEUE Kern gegen die ALTE Kopie — und die liefert
kein `xmlText`.

**Selbst gemessen**, mit dem echten Register und passender Standangabe:

    bewerte('…/bgb/__823.html', { ok:true, stand:<Registerstand> }, FINGERABDRUECKE)
    -> {"lage":"pruefungsfehler","art":"gii-xml","grund":"kein XML im Abrufergebnis"}

`klassifiziere()` bildet das ohne Gnadenfrist auf `rot` ab. Der
Mittwochslauf meldete damit sämtliche 61 gii-Quellen rot, wöchentlich, bis es
jemandem auffällt — und die Meldung nennt als Grund „kein XML im
Abrufergebnis", was niemanden auf die eigentliche Ursache führt.

**Zu bauen:** ein EIGENER, selbsterklärender Zustand für genau diesen Fall.
Fehlt bei `art:'gii-xml'` und `abruf.ok === true` das `xmlText`, ist das
strukturell eine Versionsabweichung — der neue Kern kann nur von einem
Wächter gerufen werden, der es mitliefert. Die Meldung nennt die Ursache und
den Befehl (`install -m 755 ops/gymdocu-rechtsstand-watch.js
/usr/local/bin/gymdocu-rechtsstand-watch.js`), NICHT „Normtext liess sich
nicht extrahieren".

Die Lage bleibt **rot** — sie ist ein echter Mangel, nur ein anderer. Sie
darf NICHT auf „ruhig" oder „still" fallen und NICHT auf die
Standangabe-Prüfung zurückfallen: ein stiller Rückfall wäre genau die
Klasse, gegen die Stufe 1 gebaut wurde.

Zusicherung dazu, mit Gegenprobe in beide Richtungen.

## 2. BLOCKIEREND — die Behebung aus Runde 2 ist selbst unbewacht

**Selbst gemessen:** die Zeile `roh = roh.replace(/>\s+</g, '><');` durch
`void 0;` ersetzt (eine Fundstelle, Marker gesetzt, gegen eine unabhängige
Kopie zurückgenommen, `diff` EXIT 0) → **EXIT 0, 147 PASS / 0 FAIL**.

Genau die Zeile, um die Runde 2 ging, lässt sich entfernen, ohne dass etwas
rot wird. Grund: die Gegenprobe „Punkt 1a" vergleicht
`normtextAusXml(original)` mit `normtextAusXml(umformatiert)` — **beide
Seiten bewegen sich mit der mutierten Funktion**. Das ist der Selbstnachweis
aus dem eigenen Datenfluss, den die CLAUDE.md beschreibt.

**Was das in Produktion hiesse, ebenfalls gemessen:** mit der Mutation ergibt
§ 3 ArbSchG aus der echten Fixtur `66e06ad9…` (1019 Zeichen) statt des
eingetragenen `8eb66bab…`. Der Wächter meldete `widerspruch` — die Lage, die
laut eigener Meldung „nicht vorkommen darf".

**Zu bauen: eine Referenz von AUSSEN.** Für jede echte Fixtur im Test wird
zugesichert, dass

    sha256(normtextAusXml(fixtur, enbez)) === FINGERABDRUECKE[url].normtext_sha256

Der Sollwert kommt damit aus dem Register, nicht aus der Funktion. Gegenprobe:
mit der Mutation aus Punkt 2 MUSS diese Zusicherung fallen — miss es und
melde beide Zahlen.

## 3. BLOCKIEREND — bei vielen Prüfungsfehlern kommt GAR NICHTS an

**Selbst gemessen:** 61 Quellen mit je eigenem Extraktionsgrund ergeben
**61 Meldungsgruppen und 14.221 Zeichen** — das 3,5-fache der
Telegram-Grenze von 4096. Im Sendeweg gibt es keine Aufteilung (`grep` auf
`4096`, `slice`, `chunk`: null Treffer); `baueMeldung()` fügt alles zu EINEM
String, `telegram()` sendet EINMAL, ein HTTP-Fehler wird nur geloggt.

Das trifft genau den Fall, für den der Wächter existiert: die Quelle ändert
ihre Struktur, jeder Paragraf scheitert einzeln — und keine einzige Zeile
erreicht den Betreiber. Die Fehlerisolierung aus Runde 1 schützt die
Bewertung, nicht die Zustellung.

**Zu bauen:** die Meldung wird an EINTRAGSGRENZEN in mehrere Sendungen
aufgeteilt. Ein einzelner überlanger Befund wird gekürzt, aber ausdrücklich
als gekürzt gekennzeichnet — nie stillschweigend abgeschnitten. Jeder Befund
muss in mindestens einer Sendung vollständig genug vorkommen, dass man ihn
wiederfindet.

Zusicherung mit **gestubbtem Versand** (kein echter Netzzugriff): ein
Massenfehlerfall mit allen 61 Quellen, gemessen wird, dass jede Sendung unter
der Grenze bleibt UND dass jede Quelle in genau einer Sendung vorkommt.

## 4. BLOCKIEREND — der neue Statusdatei-Test fasst das echte Dateisystem an

`test_feature_rechtsstand.js:1554` benutzt `fs.mkdtempSync(...)` und
`:1575` `fs.rmSync(tmpDir, { recursive: true, force: true })`.

Dieselbe Suite läuft auf dem Live-Server als Deploy-Gate. Die Hausregel ist
kategorisch: **Tests fassen weder echtes Dateisystem noch echte Prozesse an.**
Ein rekursives Löschen in einem Deploy-Gate ist eine Waffe, auch wenn der Pfad
heute eng erzeugt wird.

**Zu bauen:** die Schreibfunktion wird injiziert (wie `abrufFunktionen` bei
`bewerteAlleQuellen`), der Test prüft die übergebenen Argumente IM SPEICHER.
Kein temporäres Verzeichnis, kein Aufräumen. **Der Stub ist zugleich der
Beweis, dass das Richtige geschrieben wurde** — er sichert zu, WAS in die
Datei ginge, nicht nur DASS geschrieben wurde. Damit wird der Test zugleich
schärfer: er kann den Inhalt je Quelle prüfen, nicht nur `version` und fünf
Zähler.

## 5. Zwischenraum INNERHALB des Textes — beide Prüfspuren, gemessen

**Selbst gemessen:** ein Zeilenumbruch im Text verändert den Normtext, und
`\r` überlebt vollständig:

    '<P>Ein langer Satz der umbrochen wird.</P>'    -> "Ein langer Satz der umbrochen wird."
    '<P>Ein langer Satz der\numbrochen wird.</P>'   -> "Ein langer Satz der\numbrochen wird."
    '<P>…der\r\numbrochen…</P>'                     -> "\r\n" bleibt stehen

Ein Umbruch beim Verlag löste damit `widerspruch` aus, ohne dass sich am
Recht etwas ändert — dieselbe Klasse wie Punkt 2, nur eine Ebene tiefer. Die
Gegenprobe der Runde 2 kann das bauartbedingt nicht sehen: sie fügt
Umbrüche nur ZWISCHEN Tags ein.

**Und der Bestand ist heute NICHT betroffen — das ist der Grund, es JETZT zu
machen.** Gemessen über BGB, ArbZG und IfSG: 4982 Textblöcke, davon **null**
mit einem Umbruch im Text, und **null** Normtexte mit `\r`. Die Behebung
bewegt heute also keinen einzigen der 57 Fingerabdrücke; nach dem nächsten
Verlagsumbruch wäre sie teuer.

**Zu bauen:** Struktur und Zwischenraum sauber trennen. Ein Weg: Tags durch
ein Steuerzeichen ersetzen, DANN jeden Zwischenraum (einschliesslich `\r`
und `\n`) zu einem Leerzeichen vereinheitlichen, DANN das Steuerzeichen zum
Zeilentrenner machen. Prüfe den Weg, übernimm ihn nicht ungemessen.

**Pflichtmessung:** vor und nach der Änderung ALLE erreichbaren
Fingerabdrücke neu berechnen und gegen das Register halten. Erwartung: 0
Abweichungen. Weicht einer ab, HALTE AN und melde — nicht nachziehen.

## 6. Die 57 Fingerabdrücke haben keinen Riegel — beide Prüfspuren

Zwei unabhängige Spuren haben dasselbe gefunden, mit verschiedenen Belegen:
einen Hash durch `''` zu ersetzen bleibt grün, und
`SHA256_HEX_REGEX` von `/^[0-9a-f]{64}$/i` auf `/^[0-9a-f]{64}/i` zu
verkürzen ebenfalls — die Obergrenze ist ungeprüft, und ein zu langer
Einfügefehler ist der realistische Fall bei 57 von Hand eingetragenen Werten.

Der bestehende Registertest ruft `bewerte()` OHNE `xmlText` und wertet das
Ergebnis bei vorhandenem Eintrag gar nicht aus.

**Zu bauen:** eine Zusicherung über das Register selbst — JEDE
`art:'gii-xml'`-Quelle trägt einen gültigen 64-stelligen Hex-Hash UND ein
`normtext_bestaetigt_am`. Die vier UVSV-Quellen sind die einzige Ausnahme und
stehen als AUSDRÜCKLICHE Liste im Test, mit Begründung — nicht als stiller
Filter. Dazu die Gegenprobe zur Formatprüfung in beide Richtungen (zu kurz,
zu lang, leer, Nicht-Hex fallen ab; ein gültiger geht durch).

## 7. Der Resilienztest beweist nicht, was sein Name sagt

Die intakte Quelle steht VOR der fehlerhaften; nach der fehlerhaften kommt
nichts mehr. Hängt man an die Zeile, die den Fehler isoliert, ein
`bewertungen.push(bewertung); break;` an, bleiben alle drei Zusicherungen
erfüllt — in Produktion würde jede FOLGENDE Quelle übersprungen.

**Zu bauen:** die Reihenfolge `gut – kaputt – gut`, und die letzte Quelle
wird auf ihr Ergebnis geprüft, nicht nur gezählt. Zusätzlich eine zweite
Quelle DESSELBEN gescheiterten Gesetzes, damit auch der Weg über den
zwischengespeicherten Fehler geprüft ist. Gegenprobe: mit dem `break` muss es
rot werden.

## 8. Kleinigkeiten, alle billig

- **`normtext_unbestaetigt` verschluckt eine geänderte Standangabe.**
  Gemessen: das Ergebnis trägt `standAlt:'ALTER STAND'`,
  `standNeu:'NEUER STAND'`, die Meldung nennt beide NICHT. Der Betreiber
  bestätigte den heutigen — geänderten — Wortlaut, ohne je zu erfahren, dass
  das Gesetz sich bewegt hat. Genau die Wäsche, gegen die das Register
  existiert. Die Meldung nennt beide Stände, wenn sie abweichen.
- **Dieselbe Meldung sagt „hat noch KEINEN Fingerabdruck", auch wenn einer
  dasteht und nur unbrauchbar ist** (63 Zeichen, Nicht-Hex). „fehlt" und
  „unbrauchbar (n Zeichen)" gehören unterschieden.
- **`normtextShaAlt`/`normtextShaNeu` werden erzeugt, aber von keiner Meldung
  gedruckt** — der Kommentar daneben behauptet ausdrücklich das Gegenteil
  („damit eine Meldung sagen kann, WAS abweicht"). Entweder in die
  `widerspruch`- und `norm_geaendert`-Meldung aufnehmen (das macht einen
  Widerspruch erst nachvollziehbar) oder die Felder streichen. Ich bin für
  aufnehmen, gekürzt auf die ersten Stellen.
- **Der Hash-Ausdruck steht an drei Orten** (Werkzeug, Kern, Test). Eine
  exportierte Funktion `normtextFingerabdruck(xmlText, enbez)` ersetzt alle
  drei. „Dieselbe Aussage an zwei Orten."
- **`--nur=<tippfehler>` liefert einen fröhlichen Leerlauf mit Exit 0.**
  „Leeres Ergebnis ist nicht sauberes Ergebnis": trifft der Filter kein
  Gesetz, wird abgebrochen.
- **`ops/README.md` beschreibt noch das alte Zwei-Lagen-Modell** und kennt
  weder `normtext_sha256` noch das Erzeugungswerkzeug. Zweite Kopie derselben
  Aussage — nachziehen.

## Ausdrücklich NICHT in dieser Runde

- `enbezAusUrl()` bleibt auf `__<Zahl>[<Buchstabe>].html` beschränkt (alle 61
  heutigen Quellen passen, gemessen).
- Die Superadmin-Anzeige im Hauptserver-Repo (anderes Repo).
- Der Abbruch bei einem Schreibfehler der Statusdatei — bestehender
  Fehlerpfad, keine Regression dieser Runde. Festhalten, nicht bauen.
- Stufe 2, BGBl-Kettenverfolgung, echter XML-Parser.

## Ein Befund, der GEFALLEN ist — nicht erneut aufrollen

Eine Prüfspur meldete, der Gruppierungsschlüssel sei ungeprüft: `b.lage`
daraus zu entfernen bleibe grün. **Selbst nachgemessen: EXIT 1, 144 PASS /
3 FAIL** — drei Zusicherungen greifen, darunter „die drei
testgesetz-Paragrafen landen in EINER Gruppe". Der Befund trägt nicht.

## Abschluss

Volle Suite mit `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`,
keine Pipe, kein äusseres `flock`. Danach Dateizahl-Ritual, `npm run lint`
(Ergebnis wörtlich, auch bei Grün), Marker-Scan (Sollwert 6, alle in
`docs/offene-befunde-31-08-2026.md`).

Jedes Mutationsskript nimmt den Zielpfad als ARGUMENT, zählt die Fundstellen
und bricht bei 0 UND bei mehr als 1 ab, schreibt den Marker mit, und vor
jeder Messung läuft `node --check` auf die sabotierte Datei — ein EXIT 1 aus
einem Syntaxfehler ist kein Beleg. Zurückgenommen wird gegen eine unabhängig
angelegte Kopie (`cp` hin, `cp` zurück, `diff` EXIT 0), nie über
`git checkout`, und die Rücknahme wird NICHT mit einem Testlauf verkettet.

Committe und pushe, bevor du auf einen langen Lauf wartest.
