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

Vorgabe des Betreibers (23.08.2026): **Claude Fable 5 ist reserviert.** Nur für

- komplexe Refactorings der GESAMTEN Systemarchitektur, oder
- vollautomatische CI/CD- und Testing-Pipelines.

Alles andere geht an den Standard-Executer. „Reserviert" heißt: Der Regelfall
ist der Standard, nicht die Ausnahme. Ein Auftrag über mehrere Dateien ist noch
kein Architektur-Refactoring, und ein einzelner CI-Job ist noch keine Pipeline —
wer die Regel so auslegt, hat sie aufgehoben. Im Zweifel Standard-Executer.

Ein Modellwechsel ist ohnehin nie die Erklärung für ein besseres Ergebnis,
solange sich am selben Tag auch die Aufträge geändert haben. Wer beides
zugleich ändert, kann hinterher nicht sagen, woran es lag — und darf es dann
auch nicht behaupten.

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
4. **Volle Testsuite** (test/run.sh). WÄHREND des Laufs keine parallelen
   Skripte gegen dieselbe DB: der Studio-Zähl-Wächter schlägt sonst
   falsch an, und eine Pipe (`| tail`) verschluckt seinen Fehler-Exit.
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
   - **Hauptserver hat KEINEN automatischen Deploy.** Dort braucht es
     `git pull --ff-only origin master` auf dem Server — und für alles, was
     unter `/usr/local/bin/` liegt, zusätzlich ein `install`. Ohne das läuft
     die alte Fassung weiter.
   - In beiden Fällen gilt: Diese Prüfungen sagen „der Betrieb läuft und ist
     aktuell", NICHT „die Änderung wirkt richtig". Was in der Datenbank
     steht, bleibt unsichtbar und soll es bleiben.

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
- **Ein Agent, der abbricht, ist wertvoller als einer, der immer liefert.**
  Fehlt eine Vorbedingung, ist der Abbruch mit Rückfrage das richtige Ergebnis.
- **Sollwerte statt geratener Schwellen.** Wer eine Prüfanweisung an den
  Betreiber gibt, nennt den erwarteten Wert oder den Vergleich gegen eine
  Quelle — keine aus dem Bauch gegriffene Grenze.

## Prüfstand-Regeln

- **Im unprivilegiertesten Umfeld prüfen, nicht im bequemsten.** Der
  Arbeitscontainer läuft als root, der CI-Runner nicht. Wo Rechte eine Rolle
  spielen, zusätzlich unprivilegiert laufen lassen
  (`sudo -u nobody env HOME=/tmp node …`).
- **Tests fassen weder echtes Dateisystem noch echte Prozesse an.** Dieselbe
  Suite läuft auf dem Live-Server als Deploy-Gate — ein Test, der dort `pm2`,
  `nginx` oder `/var/www` anfasst, ist eine Waffe. Stubben; der Stub ist dann
  zugleich der Beweis, dass das Richtige aufgerufen wurde.
- **Tests dürfen nicht an Prosa scheitern.** Statische Prüfungen über Quelltext
  entfernen zuerst Kommentarzeilen — sonst schlägt der Wächter am erklärenden
  Kommentar an und wird abgeschaltet statt gelesen. Dazu eine Positivkontrolle,
  dass nach dem Abzug überhaupt noch etwas übrig ist.

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
- **Bekannte Grenze:** Der Pipe-Wächter matcht auf die Zeichenkette `test/run.sh`
  im Befehl, nicht auf einen Dateipfad, und gilt für die ganze Sitzung — er hat
  am 22.08.2026 nachweislich einen Befehl blockiert, der auf `/workspace/gymdocu`
  zielte. Eine Sitzung, deren Projektverzeichnis `/workspace/gymdocu` ist, hätte
  aber gar keinen Wächter, weil dort kein `.claude/settings.json` liegt. Keine
  zweite Kopie dorthin legen — sie würde driften. Wer dort ohne diese Sitzung
  Testläufe pipet, ist ungeschützt.

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
