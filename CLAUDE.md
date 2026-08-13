# Arbeitsweise in diesem Projekt

## Umsetzung nur über den Executer-Agenten

Vorgabe des Betreibers (10.08.2026): Der Haupt-Agent baut selbst nichts.

- Jede Umsetzungsarbeit (Code, Dateien, Migrationen, Dokumente) wird an den
  Subagenten `executer` delegiert (.claude/agents/executer.md, läuft auf Sonnet).
- Der Haupt-Agent formuliert klar umrissene Aufträge, trifft die Entscheidungen
  und prüft am Ende das Ergebnis SELBST — Tests laufen lassen, Dateien lesen,
  nicht dem Bericht des Subagenten allein glauben.
- Lesen, Diagnose, Recherche und Git-Verwaltung darf der Haupt-Agent weiterhin
  selbst erledigen; nur das Bauen ist delegiert.

## Kostenregeln (Verfeinerung 10.08.2026, vom Betreiber gebilligt)

Ziel: Qualität halten, Kosten senken. Delegation hat Fixkosten (Auftrag
formulieren, Einlesen des Subagenten, Bericht, Prüfung) — sie lohnt erst,
wenn die Umsetzung selbst größer ist als diese Fixkosten.

- **Bagatellgrenze:** Kleinstkorrekturen (einzelne Zeilen, Tippfehler,
  Config-Werte) und Textdokumente, deren Inhalt der Haupt-Agent ohnehin
  wörtlich vorgibt, schreibt er direkt — ein Kopier-Subagent kostet nur.
  Ab etwa einer Datei echter Umsetzung: Executer.
- **Bündeln:** Mehrere kleine Änderungen in EINEN Executer-Auftrag packen
  statt einzeln zu delegieren.
- **Kostenbewusst prüfen:** Diffs und geänderte Stellen gezielt lesen und
  die Tests laufen lassen — nicht ganze Dateien nacherzählen lassen. Die
  Prüfung selbst bleibt Pflicht, nur ihr Umfang ist gezielt.
- **Hausregeln gehören ins Zielrepo:** Der Executer liest zu Beginn die
  CLAUDE.md des Repos, in dem er arbeitet (steht in seiner Definition).
  Projektregeln stehen deshalb DORT und werden nicht in jedem Auftrag
  wiederholt.

## Vorarbeit nach unten (Betreiber-Vorgabe 10.08.2026)

Der teuerste Posten ist nicht das Bauen, sondern das LESEN — und zwar das des
Haupt-Agenten. Suchen im Code kostet auf dem starken Modell ein Vielfaches
dessen, was es unten kostet. Deshalb:

- **Suchen und Lokalisieren gehen an den `kundschafter`** (Haiku, nur lesend):
  „Wo steht X, wie sieht Y aus, welche Stellen betrifft Z?" Er liefert Pfade,
  Zeilennummern und wörtliche Auszüge. Der Haupt-Agent liest große Dateien
  nicht mehr selbst durch.
- **Beurteilen bleibt oben.** Der Kundschafter sagt, WO etwas steht — nie, ob
  es gut ist. Diffs, Entwürfe und Abnahmen liest der Haupt-Agent im Original;
  eine Zusammenfassung enthält nur die Fehler, die ihr Verfasser kennt.
- **Auszüge in den Auftrag legen.** Was der Kundschafter geliefert hat, kommt
  wörtlich in den Executer-Auftrag. Dann muss der Executer die Datei nicht
  noch einmal suchen und lesen — dieselbe Arbeit wird sonst dreimal bezahlt.
- **Nacharbeit geht an DENSELBEN Agenten** (Fortsetzung statt Neustart). Ein
  neuer Agent liest alles noch einmal von null; der bestehende hat es schon.
- **Weniger, größere Aufträge.** Die Fixkosten fallen je Delegation an, nicht
  je Änderung.

## Große Recherche-Läufe: die teuerste Einzelentscheidung

Am 10.08.2026 kosteten drei vielköpfige Recherche-Läufe zusammen rund vier
Millionen Subagenten-Token — mehr als sämtliche Bau-Aufträge des Tages
zusammen. Einer davon starb an einem Sitzungslimit und lieferte gar nichts.
Das ist der größte Kostenhebel, den es gibt; alles andere ist Feinjustierung.

Vor jedem vielköpfigen Lauf beantworten:

1. **Hängt eine Entscheidung daran?** Eine Frage, die nur Neugier befriedigt,
   rechtfertigt keinen Fächer aus zwölf Agenten. Eine, die über Geld,
   Rechtssicherheit oder eine Architektur entscheidet, schon.
2. **Reicht ein Agent?** Der Fächer lohnt, wenn die Frage GENUINE Blickwinkel
   hat, die einander nicht sehen. Fünf Agenten, die dasselbe googeln, kosten
   fünfmal so viel für dasselbe Ergebnis.
3. **Was ist die billigste Antwort, die die Frage erledigt?** Ein `grep`, ein
   Test, ein Blick ins Repo — sehr oft ist es das. Erst wenn das nicht trägt,
   ein Agent; erst wenn EIN Agent nicht trägt, mehrere.
4. **Klein anfangen.** Lieber ein Lauf mit vier Agenten und danach gezielt
   nachlegen als einer mit vierundzwanzig, von dem zwanzig am Limit sterben.

Und: Ein Lauf, der abbricht, hat NICHTS geliefert — nicht „keine Befunde".
Das Ergebnis dann als das benennen, was es ist: ungeprüft.

## Recherche-Regeln (10.08.2026, empirisch geprüft)

Bei einer Markenrecherche meldeten fünf von sechs Agenten „Register nicht
erreichbar" und lieferten damit keine Aussage. Einer lieferte eine belastbare:
Er suchte zusätzlich nach einem Namen, den es GEBEN musste, fand ihn — und
hatte damit bewiesen, dass seine Abfrage funktioniert. Erst danach war sein
„0 Treffer" etwas wert.

- **Die Positivkontrolle ist Pflicht.** Ein negatives Ergebnis zählt nur, wenn
  dieselbe Methode nachweislich ein positives liefern kann. „Nichts gefunden"
  ohne Gegenprobe heißt „nicht gesucht" — es ist dieselbe Falle wie das leere
  Prüfergebnis, nur in der Recherche.
- **Der erste Fehlschlag ist keine Antwort.** 503, leere Seite, Zeitüberschreitung:
  Das ist der Anfang der Suche, nicht ihr Ende. Andere Endpunkte, andere
  Werkzeuge, andere Formulierung — und wenn wirklich nichts geht, wird die
  Lücke ausdrücklich benannt statt in ein „keine Treffer" verkleidet.
- **Diese Anforderung gehört in den Auftrag.** Agenten in einem Rechercheauftrag
  lesen diese Datei nicht; die Positivkontrolle muss im Prompt stehen.

Was die Umgebung hier WIRKLICH kann (am 10.08.2026 nachgemessen, nicht vermutet):

- `curl` über den Proxy erreicht das offene Netz (example.com und tmdn.org je
  HTTP 200). Für APIs und einfache Seiten ist das der verlässlichste Weg.
- **Der Browser (Chromium/Playwright) erreicht das Internet NICHT** — selbst
  example.com scheitert mit ERR_CONNECTION_RESET. Er ist ausschließlich für
  lokale Server da (Screenshots der eigenen Anwendung — das funktioniert und
  wurde heute mehrfach genutzt). Wer ihn für eine öffentliche Seite einplant,
  plant einen Fehlschlag ein.
- Viele Register (TMview, EUIPO) sind reine JavaScript-Anwendungen: `curl`
  bekommt dort nur die leere Hülle. Deshalb sind solche Auskünfte hier
  grundsätzlich unvollständig — und das ist zu sagen, nicht zu kaschieren.

## Abhängigkeiten anheben (11.08.2026, teuer gelernt)

Ein Dependabot-PR hob sechs Pakete auf einmal an, darunter drei
Hauptversionssprünge. Einer davon entfernte einen Export, an dem die
Zwei-Faktor-Anmeldung hing — und verlangte beim Prüfen längere Geheimnisse,
als die Vorgängerversion selbst erzeugt hatte. Ein Durchwinken hätte jeden
bestehenden Administrator ausgesperrt. Die Testsuite war grün.

- **Bei jedem Hauptversionssprung zuerst `npm diff`.** Kostet nichts, ist
  installiert, braucht keine Abhängigkeit:

      npm diff --diff=<paket>@<alt> --diff=<paket>@<neu> --diff-name-only
      npm diff --diff=<paket>@<alt> --diff=<paket>@<neu> -- index.d.ts

  Beim otplib-Fall zeigte die zweite Zeile in einer Sekunde `-export * from
  '@otplib/preset-default';` — genau den verschwundenen Export. Das ist der
  billigste Erstgriff, der existiert.
- **Majors gehören in einen eigenen PR.** In beiden Repos steht dafür jetzt
  `update-types: ["minor", "patch"]` in der Dependabot-Gruppe. Der Gewinn ist
  nicht weniger Rauschen, sondern eindeutige Schuldzuweisung: Ein roter Lauf
  zeigt auf EIN Paket statt auf sechs.
- **Eine grüne Suite beweist nur, was geprüft wurde.** Die 2FA-Tests erzeugten
  ihre Geheimnisse frisch, also im neuen Format; der einzige Fall, den die
  Wirklichkeit kennt — ein ALTES Geheimnis aus der Datenbank —, kam in keinem
  Test vor. Wo ein Format sich ändern kann, gehört ein wörtlich eingetragener
  Altwert in den Test. Kein Werkzeug ersetzt das; recherchiert und bestätigt.

## Hooks: Regeln, die sich selbst durchsetzen (11.08.2026)

Zwei Regeln dieser Datei wurden an einem einzigen Tag von mir selbst verletzt,
obwohl sie hier wörtlich stehen. Eine Regel braucht Aufmerksamkeit, ein Hook
nicht. In `.claude/settings.json` stehen deshalb zwei PreToolUse-Wächter: gegen
den durch eine Pipe verschluckten Exit-Code und gegen Schreibzugriffe unter
`/var/www`.

Was das Bauen dieser zwei Hooks an einem Nachmittag gelehrt hat — jede Zeile
ein eigener Fehlschlag:

- **Hooks laufen unter `/bin/sh`, nicht unter `bash`.** `${var//a/b}` warf dort
  „Bad substitution" — bei JEDEM Bash-Aufruf. Geprüft hatte ich mit `bash -c`,
  also im bequemeren Umfeld. Prüfen im tatsächlichen Umfeld, nicht im
  angenehmen; das steht unten schon einmal, gilt aber auch hier.
- **Ein logisches `||` enthält denselben senkrechten Strich wie eine Pipe.** Vor
  dem Suchen neutralisieren, sonst Fehlalarm.
- **Wer das Problem schon gelöst hat, darf nicht aufgehalten werden.**
  Ausdrücklicher Opt-out bei `pipefail`/`PIPESTATUS` — und die Fehlermeldung
  nennt den Ausweg, statt nur zu verbieten.
- **Ein Hook muss offen ausfallen.** Fehlt `jq`, ist die Prüfung wirkungslos —
  aber sie darf nicht jeden Befehl der Sitzung blockieren.
- **Nach jeder Änderung ALLE Fälle neu messen, nicht nur die geänderten.** Eine
  Nachbesserung machte den Wächter komplett wirkungslos; aufgefallen ist das
  nur, weil auch die unveränderten Fälle noch einmal liefen.

**Und genau das ist am 13.08.2026 trotzdem wieder passiert** — mit demselben
Hook, zwei Tage nachdem der Absatz oben geschrieben wurde. Im Meldungstext
stand `'set -o pipefail;'` in Apostrophen; die schlossen die umgebende
Zeichenkette vorzeitig. Der Rest der Meldung lief als Befehl, den es nicht gibt.
Ergebnis: abgeschnittenes JSON und Exit 127 statt einer Ablehnung — der Wächter
hat **nie** blockiert. Gefunden hat das eine unabhängige Review, nicht ich.

Daraus die Verschärfung, die wirklich trägt:

- **Ein Hook, der nie ausgeführt wurde, ist eine Absichtserklärung.** Nach jeder
  Änderung an `.claude/settings.json` die Hooks gegen echte Eingabe-JSON laufen
  lassen und BEIDES prüfen: den Exit-Code UND ob die Ausgabe gültiges JSON ist
  (`jq -e .`). Ein Hook, dessen Ausgabe niemand parsen kann, ist wirkungslos,
  sieht aber im Editor vollständig aus.
- **Ein Wächter, der nur den Sperrfall prüft, prüft nichts.** Zu jedem Lauf
  gehören die Durchlass-Fälle mit: Die Zeile, die den Alarm auslöst, und die
  Zeilen, die ihn NICHT auslösen dürfen — sonst merkt man eine wirkungslose
  Fassung nicht von einer wirksamen zu unterscheiden.
- **Apostrophe gehören nicht in eine einfach gequotete Zeichenkette.** Für
  Code-Beispiele in Hook-Meldungen Backticks nehmen; die sind in
  Single-Quotes literal und können nichts schließen.
- **Was eine Datei verspricht, muss das Werkzeug erzwingen, nicht die Prosa.**
  Der `kundschafter` war als „ändert nichts" beschrieben und hatte `Bash` in
  seiner Werkzeugliste. Beschreibung geändert wäre falsch gewesen — die
  Werkzeugliste ist die Zusicherung, also flog `Bash` raus.

## Prüf-Ritual des Haupt-Agenten (Verfeinerung 10.08.2026)

Reihenfolge nach jedem Executer-Auftrag, vor jedem Commit:

1. **Diff vollständig lesen**, Datei für Datei — nie den Bericht statt
   des Diffs. Ein Bericht kann nur Fehler enthalten, die der Ausführende
   kennt; Fehler sind definitionsgemäß das, was er nicht kennt.
2. **Beweise sichten statt nachbauen:** Der Executer liefert Testausgaben
   wörtlich und bei UI-Änderungen Screenshots MIT (steht in seiner
   Definition). Der Haupt-Agent beurteilt sie; Stichproben bleiben erlaubt.
3. **Vier Augen bei nicht-trivialen Diffs** (mehr als eine Datei echter
   Logik): unabhängige Review über den Diff (/code-review) — der
   Entwerfer ist für die Fehler seines eigenen Entwurfs blind.
4. **Volle Testsuite** (test/run.sh). WÄHREND des Laufs keine parallelen
   Skripte gegen dieselbe DB: der Studio-Zähl-Wächter schlägt sonst
   falsch an, und eine Pipe (`| tail`) verschluckt seinen Fehler-Exit
   (beides passiert am 10.08.2026).
5. Erst dann Commit und Push. PR-Nummern erst nennen, wenn GitHub sie
   bestätigt hat.
6. **Die CI ist die letzte Instanz, nicht der eigene Prüfstand.** Fertig
   ist, was GitHub Actions grün nennt. Der Merge-Link geht deshalb ERST
   nach grüner CI an den Betreiber (10.08.2026: die lokale Suite meldete
   grün, während die CI rot war; und drei PRs wurden 30–84 Sekunden vor
   dem Ende ihrer Prüfungen gemergt, weil der Link zu früh kam).

7. **Nach dem Merge zweierlei prüfen — steht der Betrieb, und ist er
   aktuell?**
   - `bash tools/live-check.sh` beantwortet das ERSTE: Landingpage,
     Echtheitsprüfung, Abweisung auf der Studio-Subdomain, ausgelieferte
     Handbuch-Version, Zertifikatslaufzeit. Der öffentliche Teil des
     Live-Betriebs ist von hier aus erreichbar — das war lange eine
     falsche Annahme meinerseits.
   - Das ZWEITE beantwortet er NICHT, und daran ist am 10.08.2026 ein
     ganzer Tag verloren gegangen: Der Deploy war sechsmal in Folge rot
     (eine unversionierte Datei im Prod-Worktree), der Server lief 24
     Stunden auf einem zwölf Commits alten Stand, und der live-check
     meldete durchgehend grün — völlig zu Recht, denn der Betrieb LIEF,
     er war nur alt. Deshalb: den Deploy-Lauf im Actions-Reiter ansehen
     (`actions_list` auf `deploy.yml`, Ergebnis `success`?), bevor eine
     Änderung als ausgeliefert gemeldet wird. Serverseitig wacht dafür
     `ops/gymdocu-deploy-drift.js` stündlich.
   - Und in beiden Fällen gilt: Diese Prüfungen sagen „der Betrieb läuft
     und ist aktuell", NICHT „die Änderung wirkt richtig". Was in der
     Datenbank steht, bleibt unsichtbar und soll es bleiben.

## Prüfstand-Regeln (10.08.2026)

Der Prüfstand war großzügiger als jede echte Umgebung und meldete
deshalb grün, was rot war. Daraus folgt:

- **Im unprivilegiertesten Umfeld prüfen, nicht im bequemsten.** Der
  Arbeitscontainer läuft als root, der CI-Runner nicht. Wo Rechte eine
  Rolle spielen, zusätzlich unprivilegiert laufen lassen
  (`sudo -u nobody env HOME=/tmp node …`).
- **Tests fassen weder echtes Dateisystem noch echte Prozesse an.**
  Dieselbe Suite läuft auf dem Live-Server als Deploy-Gate — ein Test,
  der dort `pm2`, `nginx` oder `/var/www` anfasst, ist eine Waffe.
  Stubben; der Stub ist dann zugleich der Beweis, dass das Richtige
  aufgerufen wurde.
- **Leeres Ergebnis ist nicht sauberes Ergebnis.** Ein Lauf, dessen
  Prüfstufe abgestürzt ist, meldet „keine Befunde" und meint „niemand
  hat geprüft". Jedes Gate muss „geprüft und sauber" von „nicht
  geprüft" unterscheiden können.
- **Ein Agent, der abbricht, ist wertvoller als einer, der immer
  liefert.** Fehlt eine Vorbedingung, ist der Abbruch mit Rückfrage das
  richtige Ergebnis — nicht etwas Plausibles hinzubauen.

## Werkzeuge, die schon da sind (12.08.2026)

Auf die Frage nach besseren Werkzeugen für Grafik und Arbeitsweise war der
erste Befund unangenehm: Von sechs aktiven Plugins hatte ich keines je
benutzt, und fünf Fähigkeiten lagen ungenutzt in derselben Sitzung. Ein
Werkzeug, das installiert ist und nicht aufgerufen wird, ist teurer als
keines — es kostet Beschaffung und liefert nichts.

- **Bei jeder Änderung, die das Aussehen einer Seite verändert**, gehören
  `/design:critique` und bei neuen Bedienelementen `/design:accessibility`
  (WCAG) dazu — vom Haupt-Agenten, von selbst, nicht auf Zuruf. Die
  Bagatellgrenze oben gilt weiter: Ein Tippfehler im Text oder ein
  umbenannter Button ist keine Änderung am Aussehen.
- **Diagramme, Kennzahlen, Cockpit-Auswertungen:** vorher die Fähigkeit
  `dataviz` laden. Sie legt Farbregeln, Diagrammform und Legende fest,
  BEVOR die erste Zeile Diagramm-Code entsteht.
- **Landingpage und Handbuch-Optik:** `theme-factory`.
- Der Browser hier erreicht das Internet nicht, `localhost` aber schon.
  Screenshots der eigenen Anwendung sind deshalb die einzige verlässliche
  Sichtprüfung — und sie funktionieren.

## Ein Ort für den Stil (Befund 12.08.2026)

In **GymDocu** gemessen, nicht geschätzt: 47 eigene `<style>`-Blöcke in 24
Dateien, kein einziges CSS-File. Jede Seite brachte ihre eigenen Farben,
Abstände und Radien mit. Solange das so ist, macht kein Design-Werkzeug das
System schöner — es macht eine von 24 Stellen schöner.

**Die zentrale Quelle existiert seit dem 12.08.2026: `core/design.js` im
GymDocu-Repo**, exportiert `DESIGN_CSS` (ein `:root{}`-Block mit
`--gd-…`-Token), Vorbild `core/icons.js` mit seinen 114 Icons. Sie ist zu
BENUTZEN, nicht neu zu erfinden — wer hier eine zweite Stil-Quelle anlegt,
hat das Problem verdoppelt statt gelöst. Wie sie eingebunden wird und was
bereits umgestellt ist, steht in `/workspace/gymdocu/CLAUDE.md`; dort
gehört es hin, weil der Executer die CLAUDE.md seines Zielrepos liest.

Regel für Neues in GymDocu: **keine neuen Farb-, Abstands-, Radien- oder
Schriftgrößenwerte direkt in einen `<style>`-Block schreiben.** Was
gebraucht wird, kommt aus `DESIGN_CSS`; fehlt es dort, wird es dort
ergänzt.

**Dieses Repo hat dieselbe Krankheit und noch keine Kur.** `server.js`
bringt in seinem `<head>` eigene Farben mit (`#111418`, `#1c2128`,
`#2a2f36`, `#e60023`), eigene Radien und Segoe UI — ohne jede zentrale
Quelle. Die Regel oben ist hier also derzeit gar nicht erfüllbar. Das ist
eine bekannte Lücke, kein Versehen: Wer hier an der Oberfläche baut,
benennt sie, statt so zu tun, als gälte die Regel schon.

## Kontext

Die eigentliche Arbeit findet meist im GymDocu-Repo statt
(/workspace/gymdocu, github.com/Belehrung/Gymdocu). Etablierte Regeln dort:
Deaktivieren statt Löschen, Migrationen für alle Studios, PR-Nummern erst
nennen, wenn GitHub sie bestätigt hat.
