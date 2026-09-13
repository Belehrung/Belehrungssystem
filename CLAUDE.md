# Arbeitsweise in diesem Projekt

Diese Datei enthält nur Anweisungen. Wo eine Begründung dabeisteht, ist sie
kurz und dient dazu, die Regel im Zweifel richtig auszulegen — nicht dazu, zu
erzählen, wie sie entstand.

## Umsetzung nur über den Executer-Agenten

Vorgabe des Betreibers (10.08.2026): Der Haupt-Agent baut selbst nichts.

- Jede Umsetzungsarbeit (Code, Dateien, Migrationen, Dokumente) wird an den
  Subagenten `executer` delegiert (.claude/agents/executer.md, läuft auf Sonnet).
- Der Haupt-Agent formuliert klar umrissene Aufträge, trifft die Entscheidungen
  und prüft am Ende das Ergebnis SELBST — Tests laufen lassen, Dateien lesen,
  nicht dem Bericht des Subagenten allein glauben.
- Lesen, Diagnose, Recherche und Git-Verwaltung darf der Haupt-Agent weiterhin
  selbst erledigen; nur das Bauen ist delegiert.

## Modellwahl beim Delegieren

**Vorgabe des Betreibers (08.09.2026 — sie ersetzt alles Frühere): Fable 5.1
NUR bei SEHR komplexen Aufgaben. Ausnahme davon nur dort, wo ein messbarer
Vorteil BELEGT ist — und belegt ist bisher keiner (siehe unten).**

Der Regelfall ist damit der Standard-Executer; Fable ist die eng begründete
Ausnahme. „Sehr komplex" heisst NICHT „umfangreich": ein Auftrag über acht
Dateien mit immer demselben Handgriff ist es nicht, ein Auftrag über eine
einzige Datei, in der eine falsche Annahme still ein grünes Ergebnis erzeugen
kann, kann es sein. Brauchbare Merkmale sind: mehrere Quellen, die einander
widersprechen können; Schwellen oder Zahlen, die hergeleitet statt gesetzt
werden müssen; ein Ergebnis, das falsch grün aussehen kann; Architektur, die
über den Auftrag hinaus wirkt. Die Einordnung trifft der Haupt-Agent VOR dem
Auftrag und schreibt sie in einem Satz dazu — sonst wird jeder Auftrag im
Nachhinein sehr komplex.

**Was „messbarer Vorteil" heisst — und warum bisher keiner vorliegt.** Gemeint
ist eine Messung am eigenen Bestand, nicht ein Herstellerwert und nicht ein
Eindruck. Die einzige, die es gibt, ist der A/B-Lauf zu #103 weiter unten: eine
Stichprobe von EINS, deren Vorsprung zum Teil aus einer Strukturentscheidung
folgt und deren Sieger einen eigenen blockierenden Fehler hatte. Das trägt eine
Ausnahme im Einzelfall, KEINEN belegten Vorteil. Wer sich auf diesen Halbsatz
beruft, nennt die Messung, auf die er sich stützt — sonst gilt der Regelfall.

Zur Vorgeschichte, weil sie erklärt, warum die Regel weder die eine noch die
andere frühere Fassung ist: Am 06.09.2026 nachmittags galt „nur bei schwierigen
Sachen"; die Fassung vom 08.09. zieht dieselbe Linie enger und verlangt für
jede Ausweitung einen Beleg. Am Vormittag des 06.09. galt kurzzeitig „im
Zweifel AUCH Fable" — das war zu weit. Davor (23.08.2026) galt „reserviert für
Refactorings der GESAMTEN Systemarchitektur oder vollautomatische
CI/CD-Pipelines" — das war zu eng, und zwar aus zwei gemessenen Gründen:

- Sie wurde über **Fable 5** geschrieben. Fable 5.1 erschien am 01.09.2026 und
  liegt beim agentischen Programmieren messbar woanders (Terminal-Bench 4.0:
  55,8 % gegen 42,0 % für Fable 5).
- Ein A/B-Lauf am 06.09.2026 über EINEN echten Auftrag (#103, Vorwarnung beim
  QR-Nummernraum): derselbe Auftrag wörtlich, zwei getrennte Arbeitsbäume auf
  demselben Stand, blinde Bewertung durch dieselbe Prüfung. Ergebnis „A
  deutlich besser", A war Fable 5.1. Ausschlaggebend war kein Umfang, sondern
  ein **gemessenes falsches Grün** beim Standard-Entwurf: er las nur den
  Hochwasserstand der Datenbank, während die Vergabe zusätzlich das
  Nummernbuch heranzieht — im zurückgespielten Backup meldete er „0 %
  verbraucht", während zehn Nummern übrig waren.

**Was diese Messung NICHT hergibt, und was deshalb nicht behauptet werden
darf:** Es ist eine Stichprobe von EINS. Ein Teil des Vorsprungs folgt aus einer
Strukturentscheidung (eigenständiges Skript mit austauschbaren Abhängigkeiten
statt inline gerufenem Modul), nicht aus mehr Sorgfalt. Und der Fable-Entwurf
hatte einen eigenen blockierenden Fehler — er hätte den Wochenreport dauerhaft
gelb gefärbt, also genau die Krankheit erzeugt, aus der er zwölf Zeilen weiter
oben seine eigene Schwelle herleitet. „Fable ist besser" ist damit NICHT belegt;
belegt ist nur, dass die enge Reservierung vom 23.08. auf einer überholten
Tatsachengrundlage stand. Genau deshalb steht oben „nur bei sehr komplexen
Aufgaben" und nicht „im Zweifel auch": eine Stichprobe von eins trägt eine
Ausnahme, keine Umkehr.

Ein Modellwechsel ist ohnehin nie die Erklärung für ein besseres Ergebnis,
solange sich am selben Tag auch die Aufträge geändert haben. Wer beides
zugleich ändert, kann hinterher nicht sagen, woran es lag — und darf es dann
auch nicht behaupten. Der A/B-Lauf oben hielt den Auftrag deshalb wörtlich
gleich; anders wäre er wertlos gewesen.

## Prüf-Ritual des Haupt-Agenten

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
   **Bei folgenschweren Änderungen kommt Astra als zweite, unabhängige
   Kontrollinstanz DANEBEN** (eigener Abschnitt unten; sie ersetzt diese
   Review nicht). Gemessen am 10.09.2026: beide Spuren fanden Befunde, die
   die jeweils andere nicht hatte.
4. **Volle Testsuite** (test/run.sh). WÄHREND des Laufs keine parallelen
   Skripte gegen dieselbe DB: der Studio-Zähl-Wächter schlägt sonst
   falsch an, und eine Pipe (`| tail`) verschluckt seinen Fehler-Exit.
   Danach das Dateizahl-Ritual: die im Log gelaufenen Dateien gegen die in
   `test/run.sh` registrierten halten und `diff` EXIT 0 verlangen — sonst
   meldet ein Lauf grün, der die Hälfte nie angefasst hat. **Zum Normalisieren
   `sed 's/^[[:space:]]*//'` nehmen, NIE `tr -d '[:space:]'`:** letzteres
   frisst auch die Zeilenumbrüche, aus 232 Zeilen wird eine, und der Vergleich
   meldet „registriert: 1" (gemessen 30.08.2026).
5. Erst dann Commit und Push.
6. **Die CI ist die letzte Instanz, nicht der eigene Prüfstand.** Fertig
   ist, was GitHub Actions grün nennt — die lokale Suite hat schon grün
   gemeldet, während die CI rot war.
6a. **Der Link geht ERST raus, wenn RESTLOS alles fertig ist — Kontrolle
   eingeschlossen** (Betreiber-Vorgabe 24.08.2026). Also: Diff gelesen,
   volle Suite grün, **unabhängige Review durch UND ihre Befunde
   nachgezogen**, CI grün. Vorher wird der PR gar nicht erwähnt — kein
   „Entwurf, wartet noch auf …", keine Nummer, keine URL.
   Grund: Ein Link liest sich als „fertig", egal was danebensteht. Am
   24.08.2026 lieferte der Haupt-Agent zwei Entwurfs-Links mit dem Zusatz
   „wartet noch auf die Prüfung" — der Betreiber mergte einen davon
   folgerichtig sofort, während die Vier-Augen-Prüfung noch lief. Die
   Einschränkung im Fließtext hebt den Link nicht auf.
   **Pushen ja, melden nein.** Der Branch wird trotzdem sofort gepusht (ein
   Push merged nichts und liefert nichts aus, er sichert nur — am 24.08.2026
   ging ein fertiger, ungepushter Bau bei einer Container-Rücksetzung
   verloren). Nur die MELDUNG an den Betreiber wartet.
   Zwischenstände ohne Link sind weiterhin erwünscht: „#56 gebaut, Suite
   grün, Prüfung läuft" ist eine Auskunft, „…, hier ist der PR" ist eine
   Freigabe.
7. **Nach dem Merge zweierlei prüfen — steht der Betrieb, und ist er
   aktuell?**
   - `bash tools/live-check.sh` beantwortet das ERSTE: Landingpage,
     Echtheitsprüfung, Abweisung auf der Studio-Subdomain, ausgelieferte
     Handbuch-Version. Die **Zertifikatslaufzeit NICHT** — jede TLS-Verbindung
     aus dieser Umgebung wird vom Egress-Proxy neu signiert, gemessen würde
     dessen Zertifikat statt des echten. Das Skript sagt das selbst (ℹ statt ✓)
     und zählt den Punkt als ungeprüft, solange kein Aussteller mit der
     Organisation aus `ERWARTETE_ZERT_ORGANISATION` (Kopf der Datei) passt —
     in dieser Umgebung bleibt das so, weil der Egress-Proxy neu signiert.
     Wer die Laufzeit wissen will, liest den Wochenreport (Telegram, Mo
     06:00 UTC) — der misst auf dem
     Server und warnt unter 21 Tagen. Seit 22.08.2026 prüft es zusätzlich den
     internen Health-Endpunkt — aber nur mit `GYMDOCU_HEALTH_TOKEN` gesetzt,
     sonst bleibt auch dieser Punkt ehrlich ℹ statt grün.
   - Das ZWEITE beantwortet er NICHT. Ein Betrieb kann laufen und trotzdem
     zwölf Commits alt sein; der live-check meldet dann völlig zu Recht
     grün. Deshalb den Deploy-Lauf ansehen (`actions_list` auf
     `deploy.yml`, Ergebnis `success`?), bevor eine Änderung als
     ausgeliefert gemeldet wird. Serverseitig wacht `gymdocu-deploy-drift.js`.
   - **Ein Deploy lässt sich jederzeit von Hand anstoßen.** `deploy.yml` hat
     `workflow_dispatch: {}`; der Schritt „master darf seit dem geprüften
     CI-Lauf nicht weitergezogen sein" trägt `if: github.event_name ==
     'workflow_run'` und wird dabei bewusst übersprungen. Gebraucht am
     29.08.2026: nach drei an `?? lageplan-uploads/` gescheiterten Läufen war
     der Server drei Merges zurück; ein `git pull --ff-only` auf dem Server
     räumte den Riegel, lieferte aber nichts aus — pm2 lief weiter mit dem
     alten Code und Migration 0042 war nicht eingespielt. Erst der von Hand
     angestoßene Lauf 191 hat wirklich ausgeliefert.
   - **Ein `git pull` auf dem Server ist KEIN Deploy.** Er erledigt nur, was
     Schritt 2/8 täte. Es fehlen npm, Syntax-Check, Ladeprobe, **pm2 reload**,
     Health-Gate und Handbuch. Gefährlich ist dabei der Zwischenzustand: neuer
     Code auf der Platte, alter Prozess im Speicher, Migration offen — beim
     nächsten ungeplanten Neustart zieht der neue Code ungeprüft hoch.
     Migrationen laufen NICHT in einem eigenen Deploy-Schritt, sondern beim
     App-Start (`server.js`, `runMigrations()` vor `app.listen`); die Ladeprobe
     in 5/8 fährt bewusst nur `db.init()`, nicht `runMigrations()`. Der
     Health-Check in 7/8 ist deshalb der einzige Beleg, dass eine Migration
     durchgegangen ist.
   - **`if [ "$BEFORE" = "$AFTER" ]` in `ops/deploy.sh` ändert NUR die
     Logzeile.** Die Schritte 3/8 bis 8/8 laufen auch dann. „Bereits aktuell —
     nichts Neues" heißt also nicht, dass nichts passiert ist; es wurde
     trotzdem neu geladen und geprüft.
   - **Hauptserver hat KEINEN automatischen Deploy.** Dort braucht es
     `git pull --ff-only origin master` auf dem Server — und für alles, was
     unter `/usr/local/bin/` liegt, zusätzlich ein `install`. Ohne das läuft
     die alte Fassung weiter.
   - **Eine Änderung an `ops/deploy.sh` wirkt erst beim ÜBERNÄCHSTEN Deploy.**
     SSH startet das Skript, und dieses laufende Skript holt erst danach den
     neuen Stand: ausgeführt hat die ALTE Fassung, die neue liegt hinterher
     nur auf der Platte. Gemessen am 26.08.2026 (PR #218): das Log zeigte
     `Updating 38cb20c..1885ea0` und trotzdem die alte Zeile
     `✓ Health-Check OK (Versuch 1)` statt des neuen `ops/health-gate.sh`,
     dazu `ℹ Schritt 2 … NICHT GEPRÜFT`, obwohl `ops/deploy.sh:108` das nötige
     Flag setzt. Was als eigener Unterprozess startet (`node ops/boot-smoke.js`),
     war dagegen schon neu — daher die widersprüchlich wirkende Mischung.
     Folge für die Meldung: ein Gate, das mit seinem eigenen Deploy
     ausgeliefert wurde, ist AUSGELIEFERT, nicht BEWIESEN. Das zeigt sich erst
     am nächsten Merge, und bis dahin wird es nicht als „geprüft" gemeldet.
   - In beiden Fällen gilt: Diese Prüfungen sagen „der Betrieb läuft und ist
     aktuell", NICHT „die Änderung wirkt richtig". Was in der Datenbank
     steht, bleibt unsichtbar und soll es bleiben.

## Astra als unabhängige Kontrollinstanz

Betreiber-Vorgabe 10.09.2026. Sie ERWEITERT Schritt 3 des Prüf-Rituals, sie
ersetzt ihn nicht: die Claude-Review bleibt, Astra kommt daneben.

**Die Rollen sind getrennt, und die Trennung ist der ganze Wert.** Claude
baut — über den Executer, wie gehabt. Astra baut NICHTS. Nicht „zu 90 %
Claude", sondern beim Bauen 100 zu 0: Astra hat in dieser Umgebung keine
Werkzeuge, und wer mitgebaut hat, prüft seinen eigenen Entwurf. Eine
Kontrollinstanz, die zehn Prozent selbst geschrieben hat, ist keine mehr.

Ablauf: **Claude baut → Astra prüft → Claude korrigiert → Astra bestätigt.**

**„Astra bestätigt" heißt: seine Befunde sind nachgezogen. Es heißt NIE
„mergefähig".** Das Tor bleiben die CI und das Prüf-Ritual. Der Grund ist
gemessen: am 10.09.2026 kam der Wert nicht aus den Befunden, sondern daraus,
dass jeder einzelne SELBST nachgemessen wurde, bevor er ein Auftrag wurde —
und einer wurde bewusst NICHT umgesetzt (die harten Löschrouten), weil er
den Beitrag gesprengt hätte. Diese Entscheidung braucht die Vorgeschichte
des Repos; sie kann nicht ausgelagert werden. Sobald am Ende eine Freigabe
steht, verlagert sich die Verantwortung dorthin und der eigene Prüfgang
wird zur Formsache.

**Rundenbegrenzung — entschieden am 13.09.2026, und zwar GEGEN die
Bestätigungsrunde als Regelfall.** Bis hierher stand hier „eine volle Prüfung,
eine Bestätigungsrunde". Die zweite Runde hat seit Einführung des Verfahrens
**kein einziges Mal** stattgefunden: am 12.09. nicht (das stand schon als
offener Widerspruch weiter unten), und am 13.09. bei drei Läufen ebenfalls
nicht. Eine Regel, die nie befolgt wird, ist keine Regel, sondern eine
Behauptung über uns selbst.

Was STATTDESSEN wirklich passiert, und es trägt: Astra prüft den Diff, JEDER
Befund wird vom Haupt-Agenten selbst nachgemessen, die Nacharbeit wird
wiederum selbst geprüft — Diff gelesen, Gegenprobe in beide Richtungen, volle
Suite. Am 13.09. fielen dabei zwei von sechs Befunden (eine falsche
Schwereeinstufung, eine Prämisse aus meinem eigenen Auftrag). Diese Messung
leistet keine zweite Astra-Runde; sie leistet der eigene Prüfgang.

**Der Regelfall ist damit: EINE Runde.** Eine zweite wird gefahren, wenn die
Behebung selbst nicht trivial ist — also wenn sie VERHALTEN ändert statt nur
eine Zusicherung zu ergänzen. Begründung, aus dem eigenen Bestand: am
12.09.2026 lieferte eine Prüfung einen Behebungsvorschlag, der seinen eigenen
Befund nicht geschlossen hätte. Diese Klasse trifft Behebungen, nicht Tests.

Praktisch heißt „zweite Runde" ohnehin: dasselbe Material noch einmal
schicken. `store: false` schließt `previous_response_id` aus (gemessen, siehe
unten), es gibt also keinen billigen Rückbezug. Eine Runde kostete am
13.09.2026 zwischen 7,47 $ und 15,39 $. Wer sie fährt, fährt sie ganz.

### Wann

**Betreiber-Vorgabe 11.09.2026: Astra wird ÖFTER eingesetzt — die Regel
unten ist ab jetzt der Regelfall, nicht die Ausnahme.** Anlass war kein
neuer Beleg, sondern eine Unterlassung: an diesem Tag gingen zwei Beiträge
durch, die BEIDE unter „immer bei Wächtern und Zusicherungen" fallen (die
Netzsperre der Testsuite, die Laufsperre am Deploy-Gate), und bei keinem
von beiden wurde Astra gerufen. Die Regel war also nicht zu eng, sie wurde
nicht angewandt.

Was sich damit NICHT ändert: die Beweislage. Sie ist weiterhin ein Diff,
drei Läufe, ein Tag (Zahlen unten). „Öfter" heißt deshalb NICHT „bei
allem" — eine Kontrastkorrektur oder eine Tippfehlerzeile braucht es
weiterhin nicht. Und „Astra bestätigt" heißt weiter NIE „mergefähig".

**Nachgeschärft am 12.09.2026 (Betreiber-Vorgabe, nachdem die Frage nach
einem DRITTEN Prüfer verneint wurde: lieber den vorhandenen öfter).**
Die Fassung vom 11.09. sagte „Regelfall" und überließ die Auslösung
trotzdem der Einschätzung im Moment — genau daran ist sie am selben Tag
gescheitert. Deshalb jetzt ein Auslöser, der ohne Tagesform funktioniert:

> **Astra läuft bei JEDEM Beitrag, der Produktivcode, einen Wächter, eine
> Zusicherung oder die Testsuite selbst anfasst — also bei allem außer
> reinen Text-, Doku- und Kosmetikänderungen.** Wer ihn auslässt, schreibt
> in einem Satz dazu, WARUM der Beitrag in diese Restkategorie fällt.

Die Umkehrung der Beweislast ist der ganze Punkt: vorher musste man
begründen, warum man ihn RUFT, jetzt, warum nicht. Die Begründung fürs
Auslassen gehört in denselben Zwischenstand, in dem die Suite-Zahlen
stehen — sonst merkt es wieder niemand.

Was das NICHT heißt: dass Astra mehr findet. Gemessen am 12.09.2026 an
#167 (61 Dateien, neuer Wächter): neun Befunde aus zwei Spuren, sieben
trugen nach eigener Nachmessung, drei nicht — darunter ein
Behebungsvorschlag, der seinen eigenen Befund nicht geschlossen hätte.
Den teuersten Fund des Tages (einen REGRESS des eigenen Zweigs) fand
KEINE der beiden Prüfspuren, sondern eine stumpfe Messung mit
objektivem Ergebnis. Das Nadelöhr bleibt das eigene Nachmessen jedes
Befunds, nicht das Finden.

Nach Umkehrbarkeit, nicht nach Umfang. Eine Kontrastkorrektur über zwölf
Dateien braucht es nicht; eine unwiderrufliche Vergabe über zwei Repos
braucht es, auch wenn sie klein aussieht.

- **VOR der Umsetzung den Plan prüfen lassen**, wenn die Änderung
  folgenschwer oder über zwei Repos verteilt ist. Das ist der Punkt mit dem
  größten Hebel: die beiden teuersten Fehler des 10.09.2026 standen im
  AUFTRAG, nicht im Code — eine zu grobe Vorgabe (#126, der Executer musste
  widersprechen) und eine Lücke, die eine ganze Umgehung offenließ (#144,
  `.catch()` am Transaktionsaufruf). Ein Plan ist ein paar Kilobyte; eine
  Bau-Runde ist es nicht.
- **NACH der Umsetzung den Code prüfen lassen** — immer bei Änderungen an
  Wächtern und Zusicherungen. Dort war die Ausbeute am höchsten, und dort
  tarnt sich ein Fehler als grüner Lauf.

### Was Astra bekommt

Volles Material, keine Diffs allein — gemessen macht das den Unterschied
(s. Zahlen unten). Praktisch heißt „volles Material" der betroffene
Teilbaum, nicht das Repo: 502 getrackte Dateien sind 11,96 MB ≈ 3,2 Mio.
Token. **Das Eingabelimit liegt bei rund 400.000, NICHT bei 922.000** — die
frühere Zahl hier war falsch und hätte zu einem Bündel verleitet, das
scheitert. Gemessen am 11.09.2026 gegen den echten Endpunkt: ~412.500 Token
werden mit „Your input exceeds the context window" ABGELEHNT, 145.000 gehen
durch (Positivkontrolle: die Methode lehnt nicht einfach alles ab). Die
Grenze ist bewusst nicht genauer eingegrenzt — für unseren Zweck genügt
„deutlich unter 400k bleiben". Ein brauchbares Bündel waren am 10.09.2026
acht Dateien mit 192k Token für 2,03 $.

Dazu gehören:
- der Diff,
- die Dateien, die zum Verständnis nötig sind (auch unveränderte —
  Geschwisterwächter, aufgerufene Kernmodule, das Schema),
- **die Testausgaben, einschließlich der Gegenproben-Zahlen.** Am
  10.09.2026 hat Astra die Suite-Ausgabe NIE gesehen und rein am Quelltext
  geurteilt. Gerade an „welche Zusicherungen fielen im ROT-Lauf, welche
  nicht" erkennt man grün aus dem falschen Grund.

Die Datengrenze bleibt: nur Diffs, selbst geholte Gesetzestexte und
Dateien, die `git ls-files` auflistet. Keine Zugangsdaten, keine
Kundendaten, keine Datenbankinhalte.

### Prüfreihenfolge

Nicht die allgemeine Liste, sondern die für DIESES System:

1. **Mandantentrennung und Rechte** — jede Abfrage trägt `studio_id`. Der
   eine Fehler, der wirklich katastrophal wäre.
2. **Prüfungen, die nicht rot werden können.** Steht bewusst so weit oben:
   das ist unsere teuerste Klasse, nicht fehlende Abdeckung, sondern eine
   FALSCHE Zusicherung von Abdeckung. Am 10.09.2026 drei Fälle in einer
   einzigen kleinen Änderung, dazu der Telegram-Fund; im August das falsche
   Grün beim QR-Nummernraum.
3. **Logikfehler.**
4. **Datenintegrität** — besonders alles Unwiderrufliche (Nummernbuch,
   harte Löschungen, append-only).
5. **Architektur**, soweit sie über den Auftrag hinaus wirkt.
6. **Fehlende Fälle und Randbedingungen.**
7. **Performance.**

### Worauf sich das stützt — und was es nicht hergibt

**Die Zahlen je Lauf stehen in `ASTRA-LAEUFE.md`, nicht hier.** Dieser
Abschnitt trägt nur, was daraus für die REGEL folgt. Der Grund für die
Trennung ist eine Hausregel aus dieser Datei: Bis zum 13.09.2026 stand die
Lauftabelle an BEIDEN Orten — dieselbe Aussage an zwei Orten, angelegt am
selben Tag, an dem das Protokoll entstand. Eine Liste, die bei jedem Lauf
wächst, gehört in die Datei, die für sie da ist; hier stünde sie in einem
Monat falsch da und niemand würde es merken.

Grundlage ist bis heute: drei Läufe über EINEN Diff (#144) am 10.09.2026,
Prompt wörtlich gleich, zwei Spuren (Astra mit und ohne volles Material,
dazu eine Claude-Review mit freier Dateiwahl). Alle zwölf Befunde wurden
selbst am Quelltext nachgeprüft, alle trafen zu.
**Mehr Material ließ Astra nicht MEHR finden, sondern ANDERES** — und jede
der drei Spuren hatte etwas, das keine andere hatte. Das ist der Beleg für
„beide", nicht für „das bessere".

Der Fund, der die Entscheidung trägt: Astra sah, dass ein neuer
Verhaltenstest ECHTE Telegram-Alarme auslöst (der melde-Wrapper reichte an
das echte `melde()` weiter, und dieselbe Suite läuft auf dem Live-Server als
Deploy-Gate). Der Executer hatte das als VORZUG in den Kommentar
geschrieben, die Claude-Prüfung sortierte dieselbe Zeile in ihre
„geprüft und in Ordnung"-Liste. **Beide sahen die Tatsache und zogen den
falschen Schluss** — nicht aus Unaufmerksamkeit, sondern weil beide
dieselbe Frage nicht stellten: was bedeutet das auf dem Live-Server?

**Was das NICHT hergibt:** ein Diff, drei Läufe, ein Tag. Das ist ein
Anfang, keine Statistik. Und die Spuren hatten ungleiche Freiheit — Claude
durfte wählen, was es liest, Astra bekam ein zusammengestelltes Bündel.
Wer sich auf diesen Abschnitt beruft, um mehr zu behaupten, nennt die
Messung, auf die er sich stützt.

**Nicht als Rechtsquelle.** Für #32 und #117 wird der Wortlaut weiterhin
SELBST geholt. Der Vorbehalt „Wissensstand 30.04.2026" ist dabei seit dem
11.09.2026 überholt, aber die Regel bleibt: das Modell kann per `web_search`
den aktuellen Stand holen (gemessen, s. unten) — nur ändert das nichts
daran, dass eine Rechtsaussage bei uns am Wortlaut der Quelle hängt und
nicht an einer Zusammenfassung.

### Aufrufmuster

Schlüssel NIE in die Kommandozeile (Prozessliste, s. #99), sondern über eine
curl-Konfigdatei, die danach gelöscht wird:

    cfg=/tmp/claude-0/.curlcfg-oai; umask 077
    printf 'header = "Authorization: Bearer %s"\n' "$(tr -d '\r\n' < /tmp/claude-0/.oai-key)" > "$cfg"
    curl -sS -K "$cfg" -H "Content-Type: application/json" -d @anfrage.json \
         https://api.openai.com/v1/responses -o antwort.json
    rm -f "$cfg"

Endpunkt `/v1/responses`, Feld `input` (nicht `messages`), dazu
`max_output_tokens`. Der Betreiber hat am 10.09.2026 ausdrücklich auf eine
Rotation des Schlüssels VERZICHTET, obwohl er im Sitzungsprotokoll steht;
Missbrauch zeigte sich an der OpenAI-Abrechnung.

**ZIELKONFIGURATION einer Gegenlesung (Betreiber-Vorgabe 12.09.2026
„nutze Astra optimaler"; am Stück gemessen, s. Abschnitt unten):**

    "stream": true,          // Egress-Proxy bricht lange Läufe sonst ab
    "store": false,          // unser Quelltext bleibt nicht auf fremden Servern
    "instructions": "…",     // die Unverhandelbaren, getrennt vom Material
    "reasoning": {"effort":"high"},
    "max_tool_calls": N,     // nur mit web_search; deckelt die Suchschleife
    "metadata": {…},         // Lauf wiederfindbar machen
    "max_output_tokens": 45000,
    "text": {"format": {"type":"json_schema","strict":true, …}}

Dazu weiterhin die **Wiederholschleife** (ein Fehlschlag ist keine Antwort)
und die **Statusprüfung bei JEDEM Aufruf**.

### Drei Zusätze am Prompt (Betreiber-Entscheidung 11.09.2026)

Der Betreiber hat Astra selbst gefragt, was es für uns tun kann. Das
meiste der Antwort beschrieb, was wir schon tun (unabhängige Prüfung vor
dem Merge, Astra sieht unsere eigene Review nicht, zwei Runden, CI als
letzte Instanz, Datengrenze). Drei Punkte daraus sind neu und übernommen:

1. **Die Prüfanweisung verlangt einen Fund ODER eine Rechenschaft.** Nicht
   „ist der Code gut?", sondern: *finde mindestens einen Fehler, den der
   Ausführende übersehen hat — findest du keinen, nenne die Prüfungen, die
   du durchgeführt hast.* Das ist unsere Regel „Positivkontrolle ist
   Pflicht", auf die Review angewandt: ein „nichts gefunden" ohne
   Rechenschaft ist ein „nicht gesucht".
2. **Strukturierte Ausgabe** je Befund: Schweregrad, Datei, Zeile, Problem,
   Vorschlag. Nicht, weil es das eigene Nachmessen erspart — das bleibt —,
   sondern weil Befunde damit ZÄHLBAR werden. Unsere Beweislage ist bisher
   ein Diff und drei Läufe; erst zählbare Ausgaben machen daraus über die
   Zeit eine Messung statt einer Anekdote.
3. **Fester Vorspann mit den Unverhandelbaren** statt nur des Materials:
   jede Abfrage trägt `studio_id`; dieselbe Suite ist auf dem Live-Server
   Deploy-Gate; Tests fassen weder echtes Dateisystem noch echte Prozesse
   noch echte Dienste an. Dazu die Testausgaben — die hat Astra am
   10.09.2026 nie gesehen, dabei erkennt man erst daran, ob etwas aus dem
   falschen Grund grün ist.

**Ausdrücklich NICHT übernommen**, obwohl vorgeschlagen:

- **AUSFÜHRUNG UND SCHREIBZUGRIFF für den Prüfer** (`run_tests`,
  `get_ci_status`, `create_review_comment`). `create_review_comment` wäre ein
  Schreibweg in unseren Ablauf, den niemand gemessen hat; `run_tests` und
  `get_ci_status` koppeln den Prüfer an unsere Infrastruktur. Bleibt abgelehnt.

  **NACHGESCHÄRFT 13.09.2026 — reines LESEN fällt NICHT unter diese
  Ablehnung.** Bis hierher stand hier „Werkzeuge und Repo-Zugriff" in einem
  Atemzug, mit `read_file` in derselben Klammer. Das widersprach zwei Dingen
  zugleich: `tools/gegenleser-repo.js` (Freigabe 09.09.2026, umgebaut 12.09.)
  gibt dem Prüfer genau zwei LESENDE Werkzeuge, begrenzt auf das, was
  `git ls-files` auflistet — und der Abschnitt „Nachgemessen 12.09." verlangt
  weiter unten SELBST, die Geschwisterstellen mitzugeben, weil Astra eine von
  zwei Stellen derselben Regelverletzung nicht finden KONNTE: die zweite lag
  in einer Datei, die nicht im Bündel war. Lesen ist nicht Bauen; die
  Begründung der Ablehnung („er baut nicht, er fasst nichts an, er hat keinen
  Anteil") trägt gegen Ausführung und Schreibzugriff, nicht gegen eine
  begrenzte Leseerlaubnis.
  GEMESSEN am 13.09.2026: Von zwei Befunden dieses Laufs war einer NUR über
  die Suche im Repo erreichbar — das Prüfen-dann-Zählen-Muster in
  `routes/archiv.js` stand in keiner Zeile des Diffs. Ohne Lesewerkzeuge wäre
  er unauffindbar gewesen, und über die Bündelwahl hätte ihn niemand
  hineingelegt, weil niemand wusste, dass er existiert.
  ERLAUBT ist damit: lesender Zugriff über `tools/gegenleser-repo.js`,
  Erlaubnisliste `git ls-files`, Geheimnis-Riegel auf JEDES
  Funktionsergebnis. NICHT erlaubt bleibt alles darüber — kein Ausführen,
  kein Schreiben, kein Zugriff auf CI oder Betrieb.
  WAS SICH DADURCH NICHT ÄNDERT: Astra bleibt ein LESER, kein MESSER. Es sagt
  das am 13.09. selbst („Prüfgrenze: … keine Tests oder Mutationen ausgeführt;
  dafür steht hier kein Ausführungswerkzeug bereit") und hat die Messwerte aus
  dem Auftrag übernommen, statt sie nachzuvollziehen. Jeder Befund bleibt eine
  BEHAUPTUNG, bis der Haupt-Agent sie selbst gemessen hat — am selben Tag in
  beide Richtungen bestätigt: der eine Befund hielt der eigenen
  Mutationsmessung stand, beim anderen war die SCHWEREEINSTUFUNG falsch.
- **„Erst danach wird gemerged."** Astra bestätigt, er gibt nie frei. Sobald
  am Ende eine Freigabe steht, verlagert sich die Verantwortung dorthin und
  der eigene Prüfgang wird zur Formsache. Das Tor bleiben die CI und das
  Prüf-Ritual.
- Die vorgeschlagene Werkzeug- und MCP-Liste (Kubernetes, Sentry, Jira,
  Docker) und die allgemeine Sicherheits-Checkliste. Beides ist generische
  Beratung; unsere Prüfreihenfolge oben ist schärfer, weil sie aus
  Messungen an DIESEM System kommt.

### Was die Schnittstelle wirklich kann (gemessen 11.09.2026)

Alles hier ist am echten Endpunkt gemessen, nicht aus einer Doku
abgeschrieben. Die Gegenprobe steht dabei: ein frei erfundener Parameter
wird mit „Unknown parameter" abgelehnt — ein „OK" sagt also wirklich etwas.

- **`tools: [{"type":"web_search"}]` existiert UND WIRKT.** Nicht nur
  akzeptiert: im Ergebnis stehen `web_search_call`-Einträge, die Antwort
  nennt Quellen und trifft den tagesaktuellen Stand. Damit kann der Prüfer
  bekannte Schwachstellen zu den Versionen in `package.json` nachschlagen,
  statt aus dem Gedächtnis zu raten. Die Regel „nicht als Rechtsquelle"
  bleibt davon unberührt.
- **`reasoning: {"effort": "high"}` ist das Maximum für dieses Modell.**
  `xhigh` wird ausdrücklich abgelehnt („Supported values are: 'minimal',
  'low', 'medium', and 'high'"). Wer mehr Tiefe will, bekommt sie nicht
  über diesen Schalter.
- **`context_management` nimmt `[{"type":"compaction","compact_threshold":N}]`.**
  Das ist die Struktur, an der der Versuch vom 10.09.2026 scheiterte
  („expected an array of objects"). Für eine EINZELNE Gegenlesung bleibt
  sie trotzdem nebensächlich — ein Aufruf, ein Kontext.
- **`prompt_cache_key` wird akzeptiert.** Laut Recherche kostet
  wiederholte Eingabe damit ein Zehntel. Das ist der Hebel für die ZWEITE
  Runde („Astra bestätigt"), in der dasselbe Material noch einmal
  mitgeht. Der Rabatt selbst ist NICHT von uns nachgemessen — nur dass
  der Schalter angenommen wird.

**Zwei Betriebsfallen, beide am selben Tag hineingelaufen:**

1. **`status` GEHÖRT IN JEDEN AUFRUF GEPRÜFT.** Eine Antwort kam mit NULL
   Zeichen zurück — nicht „nichts gefunden", sondern `status: "incomplete"`
   mit `incomplete_details.reason = "max_output_tokens"`: 6528 von 7289
   Ausgabe-Token gingen ins Nachdenken und in 23 Suchaufrufe, für die
   Antwort blieb nichts. Wer nur den Text ausliest, meldet „keine Befunde"
   und meint „niemand hat geprüft" — unsere teuerste Klasse. Bei
   eingeschalteter Websuche muss `max_output_tokens` deutlich höher
   (30.000 statt 8.000 reichte).
2. **Der Egress-Proxy bricht lange Läufe ab**, `curl` meldet Exit 56
   („Failure when receiving data from the peer"). Am 11.09.2026 zweimal
   passiert, beide Male lief der ZWEITE Versuch durch. Eine
   Wiederholschleife gehört deshalb ins Aufrufmuster; ein einzelner
   Fehlschlag ist keine Antwort.

### Nachgemessen 12.09.2026 — und was sich dadurch an der Arbeitsweise ändert

Anlass: Betreiber-Frage „nutzen wir Astra schon optimal?" — Antwort war
NEIN, mit drei benannten Lücken (unten). Zehn Parameter am echten Endpunkt
geprüft, Gegenprobe bestanden (`erfundenes_feld_xyz` → HTTP 400 „Unknown
parameter"), ein „wird angenommen" sagt hier also etwas.

**Angenommen und für uns brauchbar:**

- **`text.format` mit `json_schema` und `strict: true` ERZWINGT die
  Ausgabeform.** Gemessen: die Antwort kam als gültiges JSON genau nach
  vorgegebenem Schema zurück (Felder Schweregrad/Datei/Zeile/Problem/
  Vorschlag). Das schliesst die Lücke aus dem 11.09. („strukturierte
  Ausgabe, damit Befunde ZÄHLBAR werden") — bis dahin war die Form eine
  Bitte im Prompt, jetzt ist sie eine Zusicherung der Schnittstelle.
- **`store: false`** — die Anfrage wird nicht aufbewahrt. Wir schicken
  Quelltext; das gehört dazu.
- **`max_tool_calls`** — deckelt die Suchschleife, die am 11.09.2026 die
  ganze Ausgabe aufgefressen hat (6528 von 7289 Token ins Nachdenken und
  23 Suchaufrufe, für die Antwort blieb nichts).
- **`metadata`**, **`instructions`** (eigener Vorspann, getrennt vom
  Material), **`reasoning.summary`**, **`background: true`** (Antwort
  `status: "queued"`).
- **`service_tier: "flex"`** wurde NICHT abgelehnt, sondern mit HTTP 429
  („too many requests") beantwortet — der Parameter ist gültig, war nur
  gerade nicht bedienbar. Ein 429 ist KEINE Ablehnung des Parameters;
  wer das verwechselt, streicht eine Möglichkeit, die es gibt.

**Ein erzwungener Zielkonflikt, gemessen statt vermutet:**

`store: false` und `previous_response_id` SCHLIESSEN EINANDER AUS. Eine
mit `store:false` erzeugte Antwort ist danach nicht mehr referenzierbar:
„Previous response with id '…' not found." Damit steht die zweite Runde
(„Astra bestätigt") vor der Wahl — entweder das Material bleibt auf dem
fremden Server liegen, oder es geht noch einmal mit.

**ENTSCHEIDUNG: `store: false` gewinnt.** Das Material erneut mitzuschicken
kostet Geld, die Aufbewahrung kostet die Datengrenze. Bei 200k Token
gegen ein Limit von rund 400k ist Platz genug; die CLAUDE.md sagt an
anderer Stelle ohnehin, der billigere Weg sei, es einfach erneut
mitzuschicken. Der Halbsatz zu `prompt_cache_key` oben bleibt als
Kostenhebel gültig, ist aber weiterhin von uns NICHT nachgemessen.

**DREI ÄNDERUNGEN AN DER ARBEITSWEISE** (nicht an der Schnittstelle —
das waren die eigentlichen Lücken, alle drei gegen unsere eigenen Regeln):

1. **Der PLAN geht raus, nicht nur der Diff.** Steht seit dem 10.09. als
   „Punkt mit dem größten Hebel" in dieser Datei und wurde trotzdem nie
   gemacht. Gemessen am 12.09.2026 am eigenen Auftrag: er deckte zwei von
   DREI gleichartigen Shell-Aufrufen ab; der dritte fiel erst beim
   Gegenlesen auf, nach zwei Bau-Runden. Ein Plan ist ein paar Kilobyte.
2. **Ins Bündel gehören die GESCHWISTERSTELLEN, nicht nur die geänderten
   Dateien.** Gemessen am selben Tag: Astra fand eine von zwei Stellen
   derselben Regelverletzung — die zweite lag in einer Datei, die nicht
   im Bündel war. Es KONNTE sie nicht finden. Die Bündelwahl entscheidet
   also über den Befund, und wer nur die geänderten Dateien mitgibt,
   bekommt einen Teil und hält ihn für das Ganze.
3. **Jeder Lauf wird zählbar festgehalten — in `ASTRA-LAEUFE.md`**, nicht
   hier und nicht im Sitzungsprotokoll: Datum, Zweck, Material
   (Dateien/Token), Befunde, davon nach EIGENER Nachmessung getragen,
   Kosten. Ohne das bleibt die Beweislage für immer, was sie seit dem
   10.09. ist — ein Diff, drei Läufe, ein Tag. Mit `json_schema` ist der
   Zählteil jetzt Maschinenarbeit statt Fleißarbeit.
   Die Regel stand vom 12.09. bis zum 13.09.2026 da, OHNE dass die Datei
   existierte — eine Anweisung ohne Ort, an dem sie erfüllt werden konnte.
   Wer hier eine Regel einträgt, die einen Ablageort voraussetzt, legt ihn
   im selben Zug an.
   **Ein abgebrochener Lauf bekommt dort eine Zeile mit Strichen, keine
   Null.** „Null Befunde" hiesse geprüft und sauber; bei einem Abbruch hat
   niemand geprüft. Die Kosten werden trotzdem eingetragen, sie sind
   angefallen.

**Was sich NICHT ändert:** Astra bekommt keine Werkzeuge und keinen
Repo-Zugriff (Begründung unverändert: wer mitbaut, prüft seinen eigenen
Entwurf), und „Astra bestätigt" ist keine Freigabe. Tor bleiben die CI
und das Prüf-Ritual.

**Ehrlich dazu — der Widerspruch stand hier vom 12. bis zum 13.09.2026 und
ist ENTSCHIEDEN, nicht weggeräumt:** Die zweite Runde („Astra bestätigt")
lief am 12.09. faktisch nicht, und am 13.09. bei drei Läufen ebenfalls nicht.
Statt die Regel ein drittes Mal unbefolgt stehen zu lassen, ist sie geändert:
der Regelfall ist EINE Runde, eine zweite nur bei einer Behebung, die
Verhalten ändert. Die Begründung steht bei der Rundenbegrenzung oben, wo die
Regel gilt — hier bleibt nur die Spur, dass es ein erkannter Widerspruch war
und wie lange er stand.

Das Muster ist allgemeiner und gehört benannt: Eine Regel, die zweimal
hintereinander nicht befolgt wurde, ist keine Regel mehr. Sie wird entweder
durchgesetzt oder geändert — sie unverändert stehen zu lassen macht das
ganze Dokument unzuverlässig, weil dann niemand mehr weiß, welche Sätze
darin gelten und welche nur gut gemeint sind.

### Context Notes — was daran stimmt und was nicht

Der Betreiber nannte am 10.09.2026 ein Feature „Context Notes", das Notizen
über das ganze Kontextfenster hält statt stur zusammenzufassen, und
empfahl, Astra zusätzlich Datenbankschema und API-Dokumentation als
dauerhaften Kontext mitzugeben.

**Der Schalter existiert unter diesem Namen NICHT — gemessen, nicht
vermutet.** `context_notes` beantwortet die API mit „Unknown parameter";
`context_management` gibt es dagegen, es scheitert nur an der Form
(„expected an array of objects"). Der Unterschied der beiden Fehlermeldungen
IST die Positivkontrolle: die API unterscheidet zwischen „kenne ich nicht"
und „kenne ich, falsch befüllt". Wer das Feature einschalten will, ermittelt
also zuerst die richtige Struktur von `context_management` — die Empfehlung
per Namen abzuschreiben, schaltet nichts ein und fällt nicht auf.

**Für unseren Einsatz ist der Schalter ohnehin nebensächlich.** Eine
Gegenlesung ist EIN Aufruf mit EINEM Kontext; über Fenstergrenzen hinweg
wird da nichts gehalten. Er würde erst in der zweiten Runde zählen
(„Astra bestätigt"), und auch dort ist der billigere Weg, das Material
einfach erneut mitzuschicken — bei 192k Token gegen 922k Limit ist Platz.

**Die andere Hälfte des Tipps gilt und ist gratis:** Schema und
Schnittstellenbeschreibung gehören ins Bündel. Das steht oben unter „Was
Astra bekommt" schon als „auch unveränderte Dateien", ist aber die Stelle,
an der es am ehesten vergessen wird — ohne `core/db.js` und die Migration
kann niemand beurteilen, ob eine Abfrage `studio_id` trägt, und das ist
Punkt 1 der Prüfreihenfolge.

## Kosten

Delegation hat Fixkosten (Auftrag formulieren, Einlesen, Bericht, Prüfung) —
sie lohnt erst, wenn die Umsetzung größer ist als diese Fixkosten.

- **Bagatellgrenze:** Kleinstkorrekturen (einzelne Zeilen, Tippfehler,
  Config-Werte) und Textdokumente, deren Inhalt der Haupt-Agent ohnehin
  wörtlich vorgibt, schreibt er direkt. Ab etwa einer Datei echter
  Umsetzung: Executer.
- **Bündeln:** Mehrere kleine Änderungen in EINEN Auftrag.
- **Kostenbewusst prüfen:** Diffs und geänderte Stellen gezielt lesen, Tests
  laufen lassen — nicht ganze Dateien nacherzählen lassen. Die Prüfung bleibt
  Pflicht, nur ihr Umfang ist gezielt.
- **Hausregeln gehören ins Zielrepo.** Der Executer liest die CLAUDE.md des
  Repos, in dem er arbeitet. Projektregeln stehen DORT, nicht in jedem Auftrag.

## Vorarbeit nach unten

Der teuerste Posten ist nicht das Bauen, sondern das LESEN des Haupt-Agenten.

- **Suchen und Lokalisieren gehen an den `kundschafter`** (Haiku, nur lesend):
  „Wo steht X, wie sieht Y aus, welche Stellen betrifft Z?" Er liefert Pfade,
  Zeilennummern und wörtliche Auszüge.
- **Beurteilen bleibt oben.** Der Kundschafter sagt, WO etwas steht — nie, ob
  es gut ist. Diffs, Entwürfe und Abnahmen liest der Haupt-Agent im Original.
- **Auszüge in den Auftrag legen.** Was der Kundschafter geliefert hat, kommt
  wörtlich in den Executer-Auftrag — sonst wird dieselbe Arbeit dreimal bezahlt.
- **Nacharbeit geht an DENSELBEN Agenten** (Fortsetzung statt Neustart).
- **Weniger, größere Aufträge.** Fixkosten fallen je Delegation an.
- **Gelieferte Listen sind Hinweise, keine Befunde.** Wer eine Fundstellenliste
  bekommt, lässt sie beim Umsetzen nachprüfen — sie ist regelmäßig richtig und
  unvollständig zugleich.

## Vielköpfige Recherche-Läufe

Der größte Kostenhebel überhaupt: Drei solche Läufe kosteten an einem Tag mehr
als sämtliche Bau-Aufträge zusammen, und einer starb am Sitzungslimit ohne
Ergebnis. Vor jedem Fächer beantworten:

1. **Hängt eine Entscheidung daran?** Neugier rechtfertigt keinen Fächer.
2. **Reicht ein Agent?** Der Fächer lohnt nur bei GENUINE verschiedenen
   Blickwinkeln. Fünf Agenten, die dasselbe googeln, kosten fünfmal so viel.
3. **Was ist die billigste Antwort?** Ein `grep`, ein Test, ein Blick ins Repo
   — sehr oft ist es das. Erst dann ein Agent, erst dann mehrere.
4. **Klein anfangen** und gezielt nachlegen.

Ein Lauf, der abbricht, hat NICHTS geliefert — nicht „keine Befunde". Das
Ergebnis dann als das benennen, was es ist: ungeprüft.

## Prüfen: was ein Ergebnis wert ist

- **Positivkontrolle ist Pflicht.** Ein negatives Ergebnis zählt nur, wenn
  dieselbe Methode nachweislich ein positives liefern kann. „Nichts gefunden"
  ohne Gegenprobe heißt „nicht gesucht". In Rechercheaufträgen muss diese
  Anforderung im Prompt stehen — Subagenten lesen diese Datei nicht.
- **Gegenprobe zu jeder neuen Prüfung.** Fehler herstellen, ROT messen,
  zurücknehmen, GRÜN messen — beides wörtlich melden. Ohne diesen Nachweis ist
  eine Prüfung Dekoration. Am 17.08.2026 rutschten fünf konstruierte Verstöße
  mit 46 PASS durch einen brandneuen Wächter.
- **Leeres Ergebnis ist nicht sauberes Ergebnis.** Ein Lauf, dessen Prüfstufe
  abgestürzt ist, meldet „keine Befunde" und meint „niemand hat geprüft". Jedes
  Gate muss „geprüft und sauber" von „nicht geprüft" unterscheiden können.
- **Eine grüne Suite beweist nur, was geprüft wurde.** Wo ein Format sich
  ändern kann, gehört ein wörtlich eingetragener Altwert in den Test; frisch
  erzeugte Testdaten haben immer das neue Format.
- **Eine Zusicherung, die ihren Sollwert aus dem bezieht, was sie bewachen
  soll, ist keine.** Sie kann nicht falsch werden. Zwei Erscheinungsformen,
  beide am 27.08.2026 an EINEM Tag dreimal aufgetreten:
  *Dieselbe Konstante auf beiden Seiten* — der Test rechnete gegen
  `MASSPROBE_LAENGE_MM`, also blieb er grün, als die Konstante von 100 auf 50
  zurückgesetzt wurde; genau der Befund, dessen Behebung er absichern sollte.
  Ebenso beim Pool-Zeitlimit: 50 ms, 250 ms und 15000 ms blieben alle grün.
  *Der Vorzustand erzwingt das erwartete Ergebnis ohnehin* — alle Fehlerfälle
  eines Werkzeugs liefen gegen eine leere Datenbank, in der die Vergabe sowieso
  scheitert. Die Zusicherung „liefert null" traf zu, ob der geprüfte Riegel
  existierte oder nicht. Geprüft wurde, dass eine leere Datenbank leer ist.
  Der Gegenbeweis ist billig und gehört zu jeder neuen Zusicherung: den
  bewachten Wert versuchsweise zurückdrehen bzw. den Defekt entfernen — wird
  der Test dabei nicht rot, bewacht er nichts. Der wörtliche Altwert im Test
  und eine Positivkontrolle (derselbe Aufruf OHNE den Defekt muss das
  Gegenteil bewirken) lösen beide Formen.
  **Dritte Erscheinungsform, gemessen am 30.08.2026: das geprüfte Element ist
  strukturell geschützt.** Vier CSS-Zusicherungen sollten belegen, dass ein
  `button` nicht mehr auf volle Formularbreite läuft — sie blieben mit UND
  ohne die Reparatur bei exakt denselben 213px bzw. 180px. Grund: die Knöpfe
  standen in einem `<form>`, das seinerseits Flex-Item mit
  `flex-basis:content` war; bei dessen intrinsischer Breitenberechnung
  ignoriert der Browser die Prozentbreite des Kindes. Dasselbe gilt für
  `display:inline-block` (shrink-to-fit). Die Zusicherung war also nicht
  falsch, sie war unempfindlich — und hätte den Befund, den sie bewachen
  sollte, nie wieder gefunden. Der Ausweg ist nicht eine andere Schwelle,
  sondern ein anderer Beleg: ein Element ohne diesen Schutz (hier: ein Knopf
  in einer `<td>`, 66px gut ↔ 162px defekt, und ein DIREKTES Flex-Item,
  71px ↔ 862px). Verallgemeinert: bei jeder Messung fragen, ob der gemessene
  Wert überhaupt von der geprüften Eigenschaft abhängen KANN.
- **Ein Agent, der abbricht, ist wertvoller als einer, der immer liefert.**
  Fehlt eine Vorbedingung, ist der Abbruch mit Rückfrage das richtige Ergebnis.
- **Sollwerte statt geratener Schwellen.** Wer eine Prüfanweisung an den
  Betreiber gibt, nennt den erwarteten Wert oder den Vergleich gegen eine
  Quelle — keine aus dem Bauch gegriffene Grenze.
- **Eine Zusicherung kann aus dem falschen Grund grün sein.** Nicht nur
  „prüft sie überhaupt etwas?", sondern: **kann der gesuchte Wert AUCH aus
  einer anderen Quelle stammen als der geprüften?** Am 29.08.2026 zweimal
  am selben Tag: ein Gerätename stand im PDF ohnehin in der Gerätetabelle
  (`geraete.typ` hat DEFAULT `'seilkontrolle'`) — die Zusicherung auf den
  Sichtkontroll-Anhang wäre auch grün geblieben, wenn dieser Anhang
  vollständig tot gewesen wäre. Gegenmittel: den gesuchten Wert
  unverwechselbar machen (anderer Name als in jeder anderen Tabelle) und
  zusätzlich messen, dass die Zusicherung ROT wird, wenn man genau den
  geprüften Weg lahmlegt.
- **Eine Testattrappe, die am echten Schreibweg vorbeischreibt, prüft nicht
  die Wirklichkeit.** Hand-INSERTs in Testdateien bilden ab, was der
  Schreiber IRGENDWANN tat — sie ziehen nicht mit, wenn er eine Spalte
  dazubekommt, und fallen dann still aus den Lesestellen heraus. Wo möglich
  über den echten Weg schreiben; wo eine Attrappe nötig bleibt, ein Wächter,
  der ihre Spaltenliste gegen die Wirklichkeit hält.
- **„Stelle X macht es auch so" ist keine Messung.** Am 30.08.2026 stand in
  einem Auftrag von mir: „Rückfall auf die lokale IP wie /admin/qr". Die
  Vorlage funktionierte nicht — der Server lauscht auf `127.0.0.1`
  (`server.js:1331`), der Port stand fest verdrahtet auf `:3100` gegen
  `PORT=3200` aus der `.env`, und die Subdomain-Auflösung liefert für
  `10.20.30.40:3100` null, also 404. Toter Code, den mein Auftrag in eine
  zweite Datei kopiert hätte. Wer eine bestehende Stelle als Vorbild nennt,
  hat sie damit nicht geprüft; sie ist eine Fundstelle, kein Beleg.
- **Ein Verweis kann in eine Sackgasse zeigen.** Derselbe Tag: mein Auftrag
  ließ einen Hinweis „siehe Einstellungen" bauen — `basis_url` wird in der
  ganzen Anwendung nirgends geschrieben (`setConfig(…,'basis_url',…)` nur in
  Tests, `routes/admin/einstellungen.js` enthält die Zeichenkette null mal).
  Vor jedem „siehe X" nachsehen, ob X das kann, was der Satz verspricht.
- **Eine Gegenprobe darf ihren eigenen Zielwert nicht im Bezeichner tragen.**
  Ein Wächter suchte nach dem Muster `[Hh]ost`; die Gegenprobe hieß
  `MeinTestHost` und erfüllte das Muster durch ihren eigenen Namen — grün aus
  dem falschen Grund. Mit `meinRechner` wiederholt: der Wächter blieb GRÜN
  (EXIT=0), der Befund war echt. Testdaten so benennen, dass sie mit dem
  gesuchten Muster nichts gemein haben.
- **Ein Mutationsskript mit fest verdrahtetem Pfad mutiert den falschen
  Baum — lautlos.** Gemessen am 13.09.2026: ein Skript trug den Pfad
  `/home/user/gymdocu/...` fest im Quelltext, wurde aber aus einem ZWEITEN
  Arbeitsbaum heraus aufgerufen. Es veränderte den erstgenannten Baum, der
  auf einem ganz anderen Zweig stand; gemessen wurde im zweiten. Die
  Sabotage blieb danach im ersten Baum liegen.
  ZWEI Schutzmechanismen haben dabei NICHT gegriffen, und nur einer war
  Absicht:
  *Der Marker-Scan fand nichts* — weil das Skript gar keinen
  `GEGENPROBE-DEFEKT`-Marker schrieb, sondern nur eine unauffällige Zeile.
  **Der Scan ist nur so gut wie die Marker; ein Skript, das keinen setzt,
  hebelt ihn aus.** Jede Mutation schreibt den Marker MIT, auch die
  vermeintlich offensichtliche.
  *Gerettet hat `git add <datei>` statt `git add -A`.* Deshalb steht die
  Zeile in keinem Commit. Das war Gewohnheit, keine Prüfung — verlassen
  kann man sich darauf nicht.
  Regeln daraus: Mutationsskripte nehmen den Zielpfad als ARGUMENT, nicht
  fest verdrahtet; und `git status` über ALLE Arbeitsbäume gehört zum
  Abschluss einer Gegenprobe, nicht nur über den, in dem man gerade misst.
- **Eine Behebung kann Wächter BLIND machen, die vorher gesehen haben.**
  Nicht nur „kostet sie Abdeckung" — sie kann eine bestehende Zusicherung
  in eine verwandeln, die nicht mehr fallen KANN. Dreimal gemessen am
  10.09.2026, in drei verschiedenen Verkleidungen:
  *Derselbe Statuscode aus einem neuen Grund.* Der Bestellbezug-Riegel
  antwortet 400. `(d)` und `(d2)` in `test_feature_qr_block.js` bewachen die
  Spannen- und die Nummernraumprüfung — also den Schutz gegen unwiderruflich
  falsch vergebene Nummern — und prüften nur „Status 400, nichts
  geschrieben". Nimmt man den bewachten Schutz heraus, liefert seither DER
  RIEGEL das 400: beide Abschnitte bleiben grün, während der Schutz weg ist.
  Gemessen ohne Nummernraum-Riegel: die Zustellung wird STILL ANGENOMMEN
  (200, `ok:true`, Zeile geschrieben).
  *Der Wächter bewacht alles außer sich selbst.* Der neue
  `ops/gymdocu-qr-block-abgleich.js` hatte 32 Zusicherungen über seine
  Vergleichslogik und KEINE über `main()`, den Alarm-Entscheid oder
  `process.exitCode`. Fünf Defekte — `main()` durch nichts ersetzen, den
  Alarmfilter auf „nie ernst" drehen, `telegram()` sofort zurückkehren
  lassen, den Leser leere Listen liefern lassen, die beiden Leseoperationen
  vertauschen — ließen alle 32 grün.
  *Ein Name, der mehr verspricht als die Zusicherung hält.* Ein Testfall hieß
  „alle drei Spalten geprüft" und unterschied eine. Der Code war richtig, die
  Zusicherung log über sich selbst — die unangenehmere Sorte, weil ein
  Prüfender sie liest und abhakt.
  Die Gegenfrage gehört deshalb in jede Behebung: **welche bestehende
  Zusicherung könnte mein neuer Rückgabewert, Statuscode oder Fehlerweg ab
  jetzt erfüllen, ohne dass das Bewachte noch da ist?** Wer einen bereits
  verwendeten Statuscode für einen neuen Zweck einführt, hat diese Frage
  IMMER zu beantworten.
- **Ein vollständig kaputter Ausdruck fällt laut aus, ein halb kaputter
  still.** Wiederholt am 30.08.2026: eine Regex, die gar nichts mehr matcht,
  reißt den Lauf mit einer Ausnahme ab und wird sofort bemerkt; eine, die
  noch die Hälfte trifft, liefert weiter grün. Die gefährlichere Änderung ist
  deshalb die kleine.

## Prüfstand-Regeln

- **Im unprivilegiertesten Umfeld prüfen, nicht im bequemsten.** Der
  Arbeitscontainer läuft als root, der CI-Runner nicht. Wo Rechte eine Rolle
  spielen, zusätzlich unprivilegiert laufen lassen
  (`sudo -u nobody env HOME=/tmp node …`).
- **Ein Arbeitsbaum gehört nach `/workspace`, NICHT unter den Scratchpad-Pfad.**
  Maßgeblich ist aber nicht der ORT, sondern eine Eigenschaft: jede Ebene des
  Pfades muss für den Zielnutzer DURCHQUERBAR sein (`o+x`). `/tmp/claude-0` und
  alles darunter ist `drwx------ root root` und erfüllt das nicht. `/workspace`
  erfüllt es heute — garantiert ist es dort nicht, ein `mkdir` unter strenger
  `umask` erzeugt auch dort `drwx------`.
  Die Suite startet Unterprozesse als fremde Nutzer (`postgres` in
  `test_feature_s20_migrate_functional.js` im GymDocu-Repo, `nobody` beim
  unprivilegierten Gegenlauf oben). Klemmt eine Ebene, scheitern sie mit
  `MODULE_NOT_FOUND` — einem Fehler, der auf die eigene Änderung zeigt statt
  auf den Pfad.
  **Geprüft wird mit dem AUSFÜHR-Bit, nie mit dem Lese-Bit:**

      sudo -u postgres test -x /workspace/gymdocu && echo ok || echo "klemmt"
      namei -l /workspace/gymdocu     # zeigt, WELCHE Ebene klemmt

  Nachgemessen am 27.08.2026, beide Richtungen: `drwxr--r--` besteht `test -r`,
  node scheitert trotzdem; `drwx--x--x` fällt bei `test -r` durch, node lädt.
  `test -r` beantwortet also die falsche Frage — und zwar in beide Richtungen
  falsch.
  Behebung: `git worktree move`, aber nur bei einem VERKNÜPFTEN Arbeitsbaum —
  auf einem Haupt-Arbeitsbaum bricht es mit `fatal: '.' is a main working tree`
  ab. Dann neu klonen oder `chmod o+x` auf die klemmende Ebene.
- **Der Container kann jederzeit neu starten** (in der Nacht zum 29.08.2026
  zweimal). `/workspace` überlebt, laufende Subagenten NICHT, und beiseite-
  gelegte Kopien unter `/tmp` womöglich auch nicht. Folgen: früh committen und
  pushen statt am Ende; und nach einem Neustart jeden fortgesetzten Agenten
  ZUERST fragen, ob eine Gegenprobe halb zurückgenommen ist — ein
  Sabotage-Rest, der unbemerkt mitcommittet wird, ist teurer als der ganze
  Auftrag. Ein Agent lässt sich per SendMessage aus seinem Transkript
  fortsetzen; ist das Transkript weg, bekommt ein NEUER Agent den vollen
  Kontext, statt dass improvisiert wird.
- **Tests fassen weder echtes Dateisystem noch echte Prozesse an.** Dieselbe
  Suite läuft auf dem Live-Server als Deploy-Gate — ein Test, der dort `pm2`,
  `nginx` oder `/var/www` anfasst, ist eine Waffe. Stubben; der Stub ist dann
  zugleich der Beweis, dass das Richtige aufgerufen wurde.
  Es gibt ZWEI Auslieferungswege, und sie verhalten sich gegensätzlich —
  wer nur einen ansieht, zieht den falschen Schluss (26.08.2026):
  `gymdocu-deploy` (`/usr/local/bin/`, von Hand) fährt `test/run.sh` auf dem
  Server als PFLICHT-Gate (`ops/gymdocu-deploy:156`, Notausgang nur
  `GYMDOCU_SKIP_TESTS=1`); GitHub Actions → `ops/deploy.sh` fährt sie dort
  bewusst NICHT (Begründung im Kopf von `.github/workflows/deploy.yml`).
  Maßgeblich ist der strengere Weg: die Regel gilt.
- **Tests dürfen nicht an Prosa scheitern.** Statische Prüfungen über Quelltext
  entfernen zuerst Kommentarzeilen — sonst schlägt der Wächter am erklärenden
  Kommentar an und wird abgeschaltet statt gelesen. Dazu eine Positivkontrolle,
  dass nach dem Abzug überhaupt noch etwas übrig ist.
- **Eine Diagnose darf niemals Abdeckung kosten.** Ein Block, der bei einem
  Fehlschlag Zusatzinformation ausgibt, gehört in `try/catch`. Ungeschützt
  reißt schon eine fehlgeschlagene Abfrage darin den ganzen Lauf mit — aus
  „ein FAIL, Rest grün" wird „unbekannt", und der eigentliche Befund ist weg.
- **Zusicherung und Diagnose beschreiben denselben Wert, nicht zwei.** Erst
  in eine Variable auswerten, dann prüfen UND ausgeben. Zwei getrennte
  Aufrufe sind zwei Messungen; bei einem flatternden Befund beschreibt die
  Diagnose dann womöglich einen anderen Durchlauf als den roten.
- **Eine Zuweisung aus einer gescheiterten Kommandosubstitution IST
  zugewiesen** — `set -u` greift nicht, die Variable ist nur leer. Unter
  `set -uo pipefail` OHNE `-e` gilt deshalb: jedes `VAR=$(mktemp -d …)`
  bekommt seine eigene Erfolgsprüfung. Gemessen am 29.08.2026: ohne sie
  hätte `test/run.sh` seine Fehlerlogs nach `/<name>.log` geschrieben, also
  ins Wurzelverzeichnis — und dieselbe Suite läuft auf dem Live-Server als
  Deploy-Gate. Ein Verzeichnis, das nur der Fehlerfall braucht, wird im
  Erfolgsfall wieder abgeräumt; `rmdir` (nicht `rm -rf`) verweigert sich bei
  gefülltem Verzeichnis und kann deshalb nie Beweise mitreißen.

## Dieselbe Aussage an zwei Orten

Die häufigste Fehlerquelle in diesem Projekt. Am 17.08.2026 in fünf
Verkleidungen an einem Tag: zwei Kopien derselben Hilfetexte (eine korrigiert,
eine vergessen), zwei Darstellungen desselben Eintrags, eine Aussage im Text
und dieselbe als Konstante im Code.

- Vor jeder Korrektur fragen: **Wo steht das noch, und ist es dort noch
  richtig?** Besonders: Text und Verhalten sind zwei Orte. Wer eine Aussage in
  einem Hilfetext korrigiert, hat die Konstante nicht korrigiert, die daraus
  einen Datensatz erzeugt.
- Eine zweite Kopie wird gelöscht, nicht nachgezogen — es sei denn, es gibt
  einen benannten Grund (etwa: `core/` importiert nicht aus `routes/`). Dann
  steht der Grund im Kopf der Datei.

## Hooks und Werkzeuge, die sich selbst durchsetzen

In `.claude/settings.json` stehen zwei PreToolUse-Wächter: gegen den durch eine
Pipe verschluckten Exit-Code und gegen Schreibzugriffe unter `/var/www`.

- **Hooks laufen unter `/bin/sh`, nicht unter `bash`.** Im tatsächlichen Umfeld
  prüfen, nicht im bequemen. Nachgemessen (22.08.2026, C2): `.claude/settings.json`
  trug bei beiden Hooks zusätzlich `"shell": "bash"` — dieses Feld gehört nicht
  zum Hook-Schema der Claude-Code-CLI und wird beim Ausführen ignoriert
  (bestätigt sowohl im Quelltext der CLI als auch per Probe: `[[ 1 -eq 1 ]]`
  scheiterte, `$BASH_VERSION` blieb leer). Das Feld wurde deshalb aus
  `settings.json` entfernt, statt eine Wirkung vorzutäuschen, die es nicht hat.
- **Ein Hook, der nie ausgeführt wurde, ist eine Absichtserklärung.** Nach jeder
  Änderung an `.claude/settings.json` gegen echte Eingabe-JSON laufen lassen und
  BEIDES prüfen: Exit-Code UND ob die Ausgabe gültiges JSON ist (`jq -e .`). Das
  bleibt so, ist seit 22.08.2026 aber zusätzlich automatisiert:
  `test/hooks-pruefen.sh` extrahiert beide Hook-Befehle per `jq` direkt aus der
  echten `.claude/settings.json` (keine Kopie) und prüft sie mit denselben
  Sperr-/Durchlassfällen, die vorher nur einmalig in einem Scratchpad-Prüfstand
  liefen — ein Lauf, der mit dem Container verschwunden wäre. `.github/workflows/
  ci.yml` führt es bei jedem Push/PR aus. Führt eine eigene Sollzahl mit und
  bricht ab, wenn weniger Fälle liefen als erwartet ("leeres Ergebnis ist nicht
  sauberes Ergebnis"), und behandelt eine gescheiterte `jq`-Extraktion (Datei
  fehlt, Struktur geändert) als Fehler, nicht als stillen Durchlauf. **Deckt
  NICHT ab:** ob die Claude-Code-CLI `.claude/settings.json` tatsächlich so lädt
  und ausführt wie hier angenommen (siehe C2 — das wurde separat am
  CLI-Quelltext und per Probe gemessen, nicht von diesem Skript). `tools/
  live-check.sh` läuft in CI nur mit `bash -n` (Syntax), nicht wirklich — es
  geht live gegen gymdocu.de, das gehört nicht auf einen Runner, der bei jedem
  Push feuert.
- **Ein Wächter, der nur den Sperrfall prüft, prüft nichts.** Die Durchlass-Fälle
  gehören zu jedem Lauf dazu.
- **Ein Hook muss offen ausfallen.** Fehlt `jq`, ist die Prüfung wirkungslos —
  aber sie darf nicht jeden Befehl der Sitzung blockieren.
- **Wer das Problem schon gelöst hat, darf nicht aufgehalten werden.**
  Opt-out bei `pipefail`/`PIPESTATUS`, und die Meldung nennt den Ausweg.
- **Apostrophe gehören nicht in eine einfach gequotete Zeichenkette.** Für
  Code-Beispiele in Hook-Meldungen Backticks nehmen.
- **Was eine Datei verspricht, muss das Werkzeug erzwingen, nicht die Prosa.**
  Der `kundschafter` war als „ändert nichts" beschrieben und hatte `Bash` in
  der Werkzeugliste — die Werkzeugliste ist die Zusicherung, also flog `Bash` raus.
- **Bekannte Grenze — er greift WEITER, als hier lange stand.** Nachgemessen am
  08.09.2026 gegen den echten Befehl aus `.claude/settings.json`: Er erfasst
  nicht nur `test/run.sh`, sondern auch `node test_…` (im Quelltext:
  `case "$c" in *test/run.sh*|*'node test_'*`). Gemessen wurden BEIDE
  Richtungen — drei Sperrfälle (`node test_x.js | tail -5`,
  `bash test/run.sh | tail -1`, verkettet) alle `deny`, vier Durchlassfälle
  (Umleitung in eine Datei, `set -o pipefail;` davor, `cat test/run.sh | grep`,
  `ls -la`) alle durch. Er sperrt also nicht pauschal.
- **Er lehnt den GANZEN Befehl ab, nicht nur das gepipete Segment.** Bei
  `cp sicherung.js ziel.js && node test_x.js | tail` läuft das `cp` NIE. Wer
  eine Gegenprobe zurücknimmt, darf die Rücknahme deshalb nicht mit einem
  Testlauf verketten — sonst steht der Defekt noch, während die Meldung
  „zurückgenommen" lautet. Am 08.09.2026 genau so passiert; aufgefallen ist es
  nur, weil die Rücknahme gegen eine UNABHÄNGIG angelegte Kopie geprüft wurde
  (`diff`/`md5sum`), nicht gegen die Behauptung des Ausführenden. Nach jedem
  blockierten verketteten Befehl gilt: prüfen, was davon schon lief.
- **Er fällt auf Prosa herein — auch auf die eigene.** Er segmentiert an `&&`,
  `||`, `;` und Zeilenumbruch und hält jedes Segment, das nach dem Trimmen mit
  einem Ausführungs-Verb beginnt, für einen Lauf. Eine Commit-Botschaft, die
  einen solchen Befehl nur ZITIERT, löst ihn deshalb aus: am 08.09.2026 hat er
  genau den Commit blockiert, der diesen Absatz hier einträgt. Er fällt dabei
  sicher aus (deny, nicht allow) — aber es ist die Krankheit, vor der die Regel
  „Tests dürfen nicht an Prosa scheitern" ein paar Zeilen weiter oben warnt,
  und sie führt zum Abschalten statt zum Lesen. Ausweg bis dahin: in Botschaften
  und Dokumenten `node <testdatei>.js` schreiben statt eines echten Dateinamens.
- Er gilt für die ganze Sitzung und matcht auf Zeichenketten, nicht auf
  Dateipfade — er hat am 22.08.2026 einen Befehl blockiert, der auf
  `/workspace/gymdocu` zielte. Eine Sitzung, deren Projektverzeichnis
  `/workspace/gymdocu` ist, hätte aber gar keinen Wächter, weil dort kein
  `.claude/settings.json` liegt. Keine zweite Kopie dorthin legen — sie würde
  driften. Wer dort ohne diese Sitzung Testläufe pipet, ist ungeschützt.

## Abhängigkeiten anheben

- **Bei jedem Hauptversionssprung zuerst `npm diff`.** Kostet nichts, ist
  installiert:

      npm diff --diff=<paket>@<alt> --diff=<paket>@<neu> --diff-name-only
      npm diff --diff=<paket>@<alt> --diff=<paket>@<neu> -- index.d.ts

  Beim otplib-Fall zeigte die zweite Zeile in einer Sekunde den verschwundenen
  Export, an dem die Zwei-Faktor-Anmeldung hing. Billigster Erstgriff.
- **Majors gehören in einen eigenen PR.** In beiden Repos steht dafür
  `update-types: ["minor", "patch"]` in der Dependabot-Gruppe. Gewinn ist nicht
  weniger Rauschen, sondern eindeutige Schuldzuweisung.

## Was diese Umgebung wirklich kann (nachgemessen)

- **`curl` erreicht das offene Netz.** Für APIs und einfache Seiten der
  verlässlichste Weg. `gesetze-im-internet.de` liefert brauchbaren Volltext.
- **Der Browser (Chromium/Playwright) erreicht das Internet NICHT** — selbst
  example.com scheitert. Er ist ausschließlich für lokale Server da; Screenshots
  der eigenen Anwendung funktionieren und sind die einzige verlässliche
  Sichtprüfung.
- **Viele Seiten sind reine JavaScript-Anwendungen** (TMview, EUIPO,
  publikationen.dguv.de): `curl` bekommt nur die leere Hülle. Erkennbar daran,
  dass Wurzel und 404-Seite gleich groß sind. Andere blocken mit einer
  JavaScript-Prüfung (HTTP 403, „Please enable JavaScript"). Solche Auskünfte
  sind unvollständig — und das ist zu sagen, nicht zu kaschieren.
- **Der erste Fehlschlag ist keine Antwort.** 503, leere Seite, Zeitüberschreitung:
  Anfang der Suche, nicht ihr Ende. Andere Endpunkte, andere Werkzeuge, andere
  Formulierung — und wenn nichts geht, wird die Lücke benannt.
- **Umlaute in `grep`:** `.` matcht ein Byte, ein Umlaut belegt in UTF-8 zwei.
  `gef.hrdungsbeurteilung` findet nichts. Ohne Umlaut suchen oder `-P`.
- **GitHub geht NUR über die MCP-Werkzeuge.** Ein direkter API-Aufruf per
  `curl` gegen `api.github.com` scheitert am Egress-Proxy („GitHub access is
  not enabled for this session"), auch mit gesetztem `GH_TOKEN` —
  nachgemessen am 29.08.2026. `mcp__github__actions_list` ignoriert dabei
  `per_page` und liefert regelmäßig dreißig vollständige Läufe samt
  Commit-Botschaften; sparsam abfragen und `workflow_runs_filter` benutzen.
  Achtung bei diesem Filter: `event: workflow_run` blendet einen von Hand
  angestoßenen Lauf (`workflow_dispatch`) aus — wer danach filtert und
  nichts findet, hat nicht bewiesen, dass kein Deploy lief.
- **CI-Stand eines PR: `get_check_runs` lesen, NICHT `get_status`.** Zwei
  verschiedene Quellen. Unsere CI läuft als GitHub-Actions-Jobs, also als
  CHECK-RUNS; `pull_request_read` mit `method: get_status` liefert dagegen
  nur Commit-Statuses und meldete am 11.09.2026 für zwei frische PRs
  `{"state":"pending","total_count":0,"statuses":[]}` — während
  `get_check_runs` zur selben Zeit VIER Jobs zeigte, drei davon bereits
  `success`. Wer `get_status` liest, schließt aus „total_count 0"
  fälschlich „die CI hat noch nicht angefangen" und wartet endlos.
  Dieselbe Klasse wie „ein Wächter, der die falsche Quelle liest".
- **An das VOLLSTÄNDIGE CI-Log kommt man nur über das ZIP-Archiv des Laufs**
  (gemessen 13.09.2026). `get_job_logs` liefert ausschliesslich das ENDE des
  Logs, und dort steht bei uns der Postgres-Dienstcontainer: rund 330 Zeilen
  erwartetes Rauschen aus absichtlich verletzten Constraints. Die eigentliche
  Fehlerzeile lag an jenem Tag ~1.100 Zeilen davor und war über diesen Weg
  NICHT erreichbar — auch nicht mit `failed_only`, und einen Offset gibt es
  nicht. Wer nur das Ende liest, sucht den Fehler an der falschen Stelle.
  Der Ausweg: `actions_get` mit `get_workflow_run_logs_url`, dann
  `curl -L -o logs.zip "<url>"` und entpacken. **Das geht durch den
  Egress-Proxy**, weil die URL auf `results-receiver.actions.githubusercontent.com`
  zeigt und nicht auf `api.github.com` — die Sperre eine Zeile weiter oben
  gilt dafür also NICHT. Im Archiv liegt je Job eine Textdatei plus ein
  Verzeichnis mit einer Datei je Schritt; `grep` darüber findet die
  FAIL-Zeile sofort.
- **Nach jedem Squash-Merge die entstandene Botschaft ZURÜCKLESEN.** Am
  13.09.2026 sind bei ZWEI Merges hintereinander die schliessenden Marken des
  Werkzeugaufrufs (`</commit_message>`, `</invoke>`) im Parameterwert gelandet
  und damit wörtlich in die Master-Historie. Gemerkt habe ich es erst, als die
  Botschaft beim Lesen eines Deploy-Laufs zurückkam — zwei Merges zu spät.
  Dieselbe Klasse wie früher beim `git commit` mit Heredoc, nur über ein
  anderes Werkzeug: eine mehrzeilige Botschaft, die durch ein Argument geht,
  kann das Markup ihres eigenen Aufrufs einschliessen. Umschreiben scheidet
  aus (Force-Push auf master), die Botschaft bleibt also falsch stehen —
  deshalb hinterher LESEN und sehen, dass sie dort endet, wo sie enden soll.
  Ein Commit, den niemand zurückgelesen hat, ist ungeprüft; das gilt für die
  eigene Botschaft wie für fremden Code.

## Werkzeuge

- **Bei jeder Änderung am Aussehen den Skill `/design-pruefung` laden**
  (`.claude/skills/design-pruefung/`). Der Kontrastrechner geht auch direkt:
  `node .claude/skills/design-pruefung/kontrast.js "<vg>:<bg>[:<rolle>]" …`
  — Rollen sind `text`, `grosstext`, `flaeche`; Exit 1, sobald ein Paar seine
  Schwelle reißt, damit auch als Gate einsetzbar. Ersetzt keine vollständige
  Barrierefreiheitsprüfung; was fehlt, steht in der dortigen SKILL.md. Die
  Bagatellgrenze gilt weiter: ein umbenannter Button ist keine Änderung am
  Aussehen.
- **Diagramme und Kennzahlen:** vorher `dataviz` laden. Form zuerst, Farbe
  ZULETZT; Palette mit `scripts/validate_palette.js` rechnen; nie zwei y-Achsen.
- **`theme-factory` ist für Dokumente, nicht für die Landingpage.** Vier
  Hex-Farben und zwei Schriften je Thema, kein Design-System. Für Handbuch-PDF
  und Verkaufsunterlagen richtig; die Landingpage hat eine eigene, ausgearbeitete
  Optik, die ein Fertigthema ERSETZEN statt verbessern würde.
- **Die Marktplatz-Plugins sind in Claude-Code-Sitzungen NICHT geladen.**
  `design:critique`, `design:design-critique`, `engineering:code-review` — alle
  „Unknown skill", obwohl im Konto aktiv und aufgelistet.
- **Verfügbarkeit wird ausprobiert, nicht aus einer Liste geschlossen.**
  `dataviz` steht in keiner Liste und ist da; `design:critique` steht drin und
  ist es nicht. Dieselbe Positivkontrolle wie in der Recherche.

## Ein Ort für den Stil

**Die zentrale Quelle ist `core/design.js` im GymDocu-Repo**, exportiert
`DESIGN_CSS` (ein `:root{}`-Block mit `--gd-…`-Token). Sie ist zu BENUTZEN,
nicht neu zu erfinden. Einbindung und Umstellungsstand stehen in
`/workspace/gymdocu/CLAUDE.md`, weil der Executer die CLAUDE.md seines
Zielrepos liest.

Regel für Neues in GymDocu: **keine neuen Farb-, Radien- oder
Schriftgrößenwerte direkt in einen `<style>`-Block.** Was fehlt, wird in
`DESIGN_CSS` ergänzt.

Zwei bekannte Lücken, die zu BENENNEN sind statt zu übergehen:

- **Für Abstände gibt es kein Token**, und der Rohwert-Wächter deckt sie nicht
  ab (`ALLE_TYPEN` in `test/rohwert-scan.js` kennt nur farbe/radius/
  schriftgroesse/schriftfamilie). Die Regel ist dort derzeit nicht erfüllbar.
- **Dieses Repo hat keine zentrale Quelle.** `server.js` bringt in seinem
  `<head>` eigene Farben (`#111418`, `#1c2128`, `#2a2f36`, `#e60023`), eigene
  Radien und Segoe UI mit.

## Kontext

Die eigentliche Arbeit findet meist im GymDocu-Repo statt (/workspace/gymdocu,
github.com/Belehrung/Gymdocu), daneben im Hauptserver
(/workspace/gymdocu-hauptserver). Etablierte Regeln dort: Deaktivieren statt
Löschen, jede Abfrage trägt `studio_id`, Migrationen für alle Studios,
PR-Nummern erst nennen, wenn GitHub sie bestätigt hat.
