# Auftrag: Bauspur für Qwen (`tools/bau-spur.js`), 03.10.2026

Grundlage: Betreiber-Vorgabe 03.10.2026 (CLAUDE.md Abschnitt 1). Qwen soll bauen, DeepSeek prüfen; die Freigabe für eine
Bauspur mit Werkzeugen ist ausdrücklich erteilt. Repo: Belehrungssystem (dieses Repo), Zweig
`claude/gym-docu-codo-access-4q3bn0`; das Werkzeug arbeitet gegen GymDocu-Arbeitsbäume unter `/workspace`.

**Einordnung: sehr komplex.** Es ist eine Sicherheitsgrenze: Ein fremdes Modell bekommt Schreibrechte. Ein Fehler darin
wirkt über jeden späteren Auftrag hinaus, und ein grüner Selbsttest kann falsch grün sein. Nach CLAUDE.md Abschnitt 5
(Übergang) baut trotzdem der Standard-Executer.

## Ziel

`node tools/bau-spur.js --auftrag=<datei> --baum=<arbeitsbaum> --modell=<qwen-modell> --protokoll=<datei> --zweck=<text>
[--max-runden=N] [--max-kosten-usd=X] [--erlaubt=<pfadmuster,…>]`

Qwen bekommt den Auftragstext und baut in `--baum` über feste Werkzeuge. Ergebnis ist der geänderte Arbeitsbaum (nicht
committet) plus ein Bericht. Commit, Push, volle Suite und Prüfung macht der Haupt-Agent.

## Wiederverwenden statt neu bauen

- `tools/gegenleser-repo.js`:
  - Werkzeugschleife, Lesewerkzeuge `lies`/`suche`;
  - Pfadprüfung (`pfadPruefen`, `istHartGesperrt`, Erlaubnisliste über `git ls-files`);
  - Geheimnis-Riegel auf jedes Ergebnis, Schlüssel aus Datei (nie in der Kommandozeile);
  - Kostenschätzung (`PREISTABELLE`), Laufprotokoll, `ASTRA-LAEUFE.md`-Eintrag (für die Bauspur eine eigene Datei, s. u.).
- `tools/ausfuehr-spur.js`: die Sandbox für Testläufe (Namensraum, `pivot_root`, Benutzer 65534, Wegwerf-Cluster, Zeitlimit von aussen, Manifest, Exit-Vertrag) mit `teste` und `mutiere_und_teste`. Diese Sandbox ist die EINZIGE Stelle, an der Code des Baums ausgeführt wird.
- Gemeinsames gehört in ein Modul, das beide Werkzeuge laden; eine zweite Kopie ist verboten (Abschnitt 11).

## Werkzeuge des Modells (abschliessende Liste)

1. `lies(pfad, von, bis)` und `suche(muster, dateimuster)`: wie im Gegenleser. Erlaubt sind die Dateien aus `git ls-files` des Baums plus die Dateien, die DIESER Lauf neu angelegt hat.
2. `ersetze(pfad, alt, neu)`: Das Muster `alt` muss genau EINMAL vorkommen. Sonst gibt es einen Fehler mit der Trefferzahl, und nichts wird geändert. Nur bestehende, erlaubte Dateien.
3. `neue_datei(pfad, inhalt)`:
   - nur, wenn der Pfad noch nicht existiert;
   - erlaubte Endungen (`.js`, `.cjs`, `.json`, `.sql`, `.sh`, `.md`, `.html`, `.css`);
   - Grössendeckel 200 KB.
4. `teste(testdatei)` und `mutiere_und_teste(datei, alt, neu, testdatei)`:
   - Beide laufen über die Sandbox von `ausfuehr-spur.js`, auf einer Kopie des AKTUELLEN Baumstands (also mit den Änderungen dieses Laufs, auch den noch nicht committeten).
   - Heute verlangt die Sandbox einen sauberen Baum. Für die Bauspur kopiert sie den Arbeitsstand: alle Dateien aus `git ls-files` plus die neuen Dateien dieses Laufs, ohne `.git`. Die Manifest-Prüfung bleibt.
   - `mutiere_und_teste` ist für Gegenproben: Die Mutation landet NUR in der Wegwerfkopie, nie im Baum.
5. `fertig(bericht)` beendet den Lauf. Der Bericht ist strukturiert:
   - geänderte und neue Dateien;
   - je Punkt des Auftrags: umgesetzt / nicht umgesetzt mit Grund;
   - gelaufene Tests mit Status;
   - Gegenproben mit ROT/GRÜN.

Keine weiteren Werkzeuge: keine Shell, kein Git, kein Netz, kein Löschen, kein Umbenennen.

## Pfadregeln (für `ersetze` und `neue_datei`)

- Nur innerhalb von `--baum`. Abgelehnt werden `..`, absolute Pfade, Symlinks (auch in Zwischenebenen; `lstat` je Ebene) und Pfade, die über `realpath` ausserhalb landen.
- Immer gesperrt, auch mit `--erlaubt`:
  - `.git/`, `node_modules/`;
  - `.env*` und alles, was `istHartGesperrt` sperrt;
  - `.claude/`, `.github/`;
  - `test/run.sh`, `test/umgebung.sh`, `test/db-vorbereiten.js` (die Pflichtdateien der Sandbox).
- Ohne ausdrückliches `--erlaubt` gesperrt: `ops/`, `migrations/`, `package.json`, `package-lock.json`, `server.js`, `eslint.config.js`.
  - Der Haupt-Agent gibt sie je Auftrag frei. Die Freigabe steht im Protokoll.
  - Ausnahme `test/run.sh`: Neue Tests müssen dort registriert werden. Dafür gibt es eine eigene, enge Freigabe: genau eine Zeile im `TESTS=(…)`-Block anfügen, sonst nichts. Schlag dafür ein eigenes Werkzeug `registriere_test(datei)` vor; die Pflichtdateien der Sandbox bleiben sonst gesperrt.
- `--baum` muss ein verknüpfter Arbeitsbaum unter `/workspace` sein. Sein Zweig darf nicht `master`/`main` heissen. Sonst Abbruch mit eigenem Exit-Code vor dem ersten Modellaufruf.

## Modell und Endpunkt

- Endpunkt: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`. Schlüssel aus `QWEN_KEY_DATEI` (Vorgabe `/tmp/claude-0/.qwen-key`).
- Gemessen am 03.10.2026: Auf `/chat/completions` liefern `qwen3.8-max`, `qwen3.7-plus`, `qwen3-coder-plus` und `qwen3.5-plus` Werkzeugaufrufe; `qwen9-quatschmodell` gibt 404.
- Selbst zu messen und zu belegen:
  1. Geht `/responses` mit Werkzeugen? Wenn ja und wenn der vorhandene Pfad des Gegenlesers dann trägt, wird er genommen. Sonst `/chat/completions` mit `tool`-Nachrichten über mehrere Runden.
  2. Trägt eine zweite Runde mit Werkzeugergebnis?
  3. Wo liegt die Zeitgrenze des Egress-Proxys gegen diesen Endpunkt? Ist `stream: true` nötig?
  4. Was nimmt der Endpunkt an, und was davon wirkt? Gegenprobe mit einem erfundenen Feld.
- Die Preise je Modell kommen aus der Preisseite von Alibaba Cloud Model Studio (Quelle und Datum im Kommentar). Was sich nicht belegen lässt, steht als UNBESTÄTIGT da.
- Ohne `--modell` bricht das Werkzeug ab; eine stille Vorgabe gibt es nicht. Erlaubt sind nur Modelle aus einer festen Liste (die vier oben).

## Grenzen und Abbruch

- `--max-runden` (Vorgabe 60) und `--max-kosten-usd` (Vorgabe 3) werden VOR jedem Modellaufruf geprüft.
- Bei Erreichen eines Grenzwerts: Lauf beenden mit eigenem Status „Budget erschöpft“ und einem Teilbericht, nie still.
- Jeder Schreibzugriff kommt ins Protokoll: Pfad, sha256 vorher und nachher, Grösse.
- Am Ende druckt das Werkzeug selbst (nicht das Modell) die Liste der geänderten Dateien aus `git status --porcelain` des Baums und vergleicht sie mit der eigenen Schreibliste. Eine Abweichung ist ein lauter Fehler.

## Ablage

- Jeder Lauf bekommt eine Zeile in `BAU-LAEUFE.md` (neu): Datum, Zweck, Modell, Runden, Token rein/raus, Kosten, Ergebnis.
- Der Haupt-Agent ergänzt später: Prüfung bestanden ja/nein, Zahl der Nacharbeiten.

## Tests (Pflicht, in der CI dieses Repos)

Ein Selbsttest mit Attrappen-Modell (kein Netz, festes Drehbuch von Werkzeugaufrufen) belegt jede Regel in beide Richtungen:
- jeder gesperrte Pfad (`.git`, `.env`, `.github`, `.claude`, `../`, absolut, Symlink in Zwischenebene, Pflichtdateien, `ops/` ohne und mit `--erlaubt`);
- `ersetze` mit 0, 1 und 2 Treffern;
- `neue_datei` auf eine bestehende Datei;
- Budget-Abbruch nach Runden und nach Kosten;
- Geheimnis-Riegel auf einem Lese-Ergebnis;
- Schreibliste gegen `git status`, Abweichung künstlich hergestellt;
- `--baum` auf master und ausserhalb von `/workspace`.

Je Regel eine Gegenprobe: die Regel im Werkzeug entfernen → der Selbsttest wird rot. Zählung der Fundstellen, Marker, Rücknahme aus Kopie mit diff 0. Den Selbsttest in `.github/workflows/ci.yml` eintragen, wie den Job `ausfuehr-spur`.

## Echter Probelauf (Pflicht, nach grünem Selbsttest)

- In einem Wegwerf-Arbeitsbaum von GymDocu (`/workspace/gymdocu-baupilot`, Zweig `baupilot`) ein Mini-Auftrag mit `qwen3.8-max`:
  - in einer Testdatei einen Kommentar ergänzen;
  - eine bestehende Testdatei mit `teste` laufen lassen;
  - eine Gegenprobe mit `mutiere_und_teste` fahren;
  - `fertig`.
- Zu belegen:
  - Schleife, Sandbox und Bericht funktionieren;
  - Protokoll, Kosten und `BAU-LAEUFE.md`-Zeile stimmen;
  - der Baum enthält danach genau die eine Änderung.
- Den Wegwerf-Baum danach entfernen (`git worktree remove`).

## Rahmen

- Executer-Regeln wie immer: Gegenproben mit Zählung und Marker, kein Schlüssel in Kommandozeile, Protokoll oder Commit.
- Keine Modellnamen in Commit-Botschaften. Gemeint sind Claude-Modelle; die Qwen-Modellnamen als Konfiguration im Werkzeug sind nötig.
- Die bestehenden Tests dieses Repos bleiben grün: `test/*.sh`, Selbsttest Gegenleser, Selbsttest ausfuehr-spur.
- Commit und Push auf den Zweig, kein PR.

## Planprüfung (03.10.2026): Pflichtergänzungen

Spur B (flash, Sicherheitsgrenze) lieferte 7 Befunde. B1, B2, B3, B6 und B7 sind am Bestand nachgemessen; B4 und B5 sind
als Planlücken übernommen. Diese Ergänzungen gehen den Abschnitten oben VOR.

- **B1 `registriere_test` (blockierend).** `test/run.sh` ist eine bash-Datei. Eine Zeile mit `$(…)` oder Backticks im
  `TESTS=(…)`-Block wird ausgeführt, sobald die Datei eingelesen wird, auch auf dem Live-Server als Deploy-Gate.
  - Die Sandbox prüft Testnamen heute nur auf `'` und Zeilenumbruch (`ausfuehr-spur.js:497`). `path.join(kopie, testdatei)`
    (`:784`) lässt `..` durch.
  - Deshalb nimmt `registriere_test(datei)` nur Namen nach `^test_[A-Za-z0-9_-]+\.js$`, ohne Pfadsegment. Im Bestand haben
    alle Einträge diese Form, ausser `ops/boot-smoke.js`.
  - Die Datei muss in DIESEM Lauf per `neue_datei` entstanden sein. Sie wird genau einmal eingefügt, vor der schliessenden
    Klammer des Blocks.
  - Prüfung danach: Die alte Datei ohne die neue Zeile ist bytegleich mit der Datei vorher (sha256). Ein zweites
    Registrieren derselben Datei wird abgelehnt.
  - Dieselbe Namensprüfung gilt in der Sandbox für `teste`/`mutiere_und_teste`, VOR `sha256Datei` und vor dem Kindlauf. Sie
    gilt auch für die bestehende Prüfspur.
  - Selbsttest abgelehnt: `$(…)`, Backtick, `..`, führendes `/`, Zeilenumbruch, Unterverzeichnis, nicht in diesem Lauf
    angelegte Datei, Doppelregistrierung.
  - Selbsttest angenommen: der reguläre Fall, und `test/run.sh` bleibt bis auf diese eine Zeile bytegleich.
  - Der `fertig`-Bericht führt neue Testdateien und Registrierungen als eigene Kategorie.
- **B2 Bindung an das Zielrepo (blockierend).** „Unter `/workspace`, nicht `master`“ trifft auch einen Arbeitsbaum DIESES
  Repos. Dort wären `tools/` (Sandbox, Riegel, Gegenleser) und `CLAUDE.md` beschreibbar.
  - Deshalb prüft das Werkzeug positiv: `git rev-parse --git-common-dir` des Baums muss auf den GymDocu-Hauptklon zeigen.
    Vorgabe `/home/user/gymdocu/.git`, überschreibbar mit `BAU_ZIELREPO_GIT`; die Prüfung erfolgt über `realpath`.
  - Zusätzlich: Die URL von `origin` endet auf `Belehrung/Gymdocu(.git)`, ohne Rücksicht auf Gross- und Kleinschreibung.
  - Der Baum darf nicht unter dem Verzeichnis des laufenden Werkzeugs liegen und das Werkzeug nicht unter dem Baum.
  - Jede Verletzung führt zum Abbruch mit eigenem Exit-Code VOR dem ersten Modellaufruf, mit Selbsttestfall in beide
    Richtungen.
- **B3 Kopierquelle „Arbeitsstand“.** Heute verlangt die Sandbox einen sauberen Baum (`ausfuehr-spur.js:485-486`) und
  klont mit `git clone --depth 1` (`:779`). Dabei landet nur HEAD in der Kopie, nicht der Arbeitsstand.
  - Der neue Modus ist ein eigener, benannter Modus der Bauspur und keine stille Lockerung. Die Prüfspur behält „sauberer
    Baum + Klon“ samt ihrem Selbsttestfall.
  - Pflichtfälle:
    - (a) Eine nur im Arbeitsstand vorhandene Änderung wirkt in der Kopie: Ein Test, der an ihr scheitert, scheitert.
    - (b) Eine ungetrackte Datei, die NICHT in der Schreibliste des Laufs steht, kommt NICHT in die Kopie.
    - (c) Eine per `neue_datei` angelegte Testdatei ist in der Kopie lauffähig.
    - (d) Die Prüfspur verweigert einen unsauberen Baum weiterhin.
- **B4 Riegel auf jeden Modelltext.** Der Bericht aus `fertig(bericht)`, Fehlertexte und jede Modellantwort, die in das
  Protokoll oder in `BAU-LAEUFE.md` geht, laufen durch `entferneGeheimnisse`. Dazu kommt die Steuerzeichen-Neutralisierung
  aus `ausfuehr-spur.js:116-118`. Die benannten blinden Flecken des Riegels (`ausfuehr-spur.js:20-22`) stehen wörtlich im
  Kopf von `bau-spur.js`.
- **B5 Aufbewahrung beim Anbieter.** Gemessen wird, ob der DashScope-Endpunkt ein Aufbewahrungsfeld kennt (`store`) und ob
  es wirkt: Lässt sich eine Antwort hinterher abrufen?
  - Ist eines vorhanden und wirksam, wird es gesetzt.
  - Ist nichts messbar, steht das als benannte Grenze im Kopf der Datei und in `BAU-LAEUFE.md`.
- **B6 Atomar schreiben.**
  - `neue_datei` öffnet mit `O_CREAT | O_EXCL | O_NOFOLLOW`.
  - `ersetze` öffnet mit `O_WRONLY | O_TRUNC | O_NOFOLLOW`, nach `lstat` je Ebene (Vorbild `ausfuehr-spur.js:627`).
  - Vor jedem Schreiben wird `nlink === 1` verlangt, sonst wird abgelehnt.
- **B7 Sperrliste.**
  - Ohne `--erlaubt` gesperrt ist zusätzlich `ecosystem.config.js` (pm2-Konfiguration im Wurzelverzeichnis des Zielrepos,
    vorhanden), ebenso jedes `Dockerfile*` und `Procfile*`.
  - Immer gesperrt ist zusätzlich der exakte Name `.git` als Datei (im verknüpften Arbeitsbaum ist `.git` eine Datei).
  - Gesperrte Pfade werden nach `path.normalize` auf Segmentgrenzen geprüft.
  - Selbsttestfall: Ein immer gesperrter Pfad bleibt auch mit `--erlaubt=*` und `--erlaubt=.github/` gesperrt.
- **Weitere Punkte aus derselben Spur:**
  - Sollwerte in den Selbsttests (Runden, Kosten, PASS-Zahlen) stehen als von Hand eingetragene Literale da, nie aus
    `PREISTABELLE` zurückgerechnet (Vorbild `gegenleser-repo.js:3263`). Der Kosten-Abbruch wird mit festen Token- und
    Preiswerten getestet.
  - Das Datum in `BAU-LAEUFE.md` kommt über `laufprotokollDatum()` (Europe/Berlin), nicht über `toISOString()`.
  - Netz- und HTTP-Fehler mitten im Lauf und kaputte Werkzeugargumente bekommen einen festen Statuskatalog (Vorbild
    `ausfuehr-spur.js:120-136`):
    - Ein Argumentfehler geht als Ablehnung an das Modell zurück und kommt ins Protokoll.
    - Ein Abbruch endet mit Teilbericht und eigenem Exit-Code.
    - Jedes Werkzeugergebnis hat einen Längendeckel.

### Spur A (Kimi, Mechanik): weitere Pflichtergänzungen

Spur A lief mit Kimi, nachdem flash zweimal am Antwortstrom abgebrochen war. Sie lieferte 8 Befunde und 5 kleinere. A1, A2
und A5 sind am Bestand nachgemessen; der Rest ist als Planlücke übernommen. Auch diese Punkte gehen den Abschnitten oben VOR.

- **A1 Testliste ist eingefroren (blockierend).** `testsAusRunSh` läuft nur einmal (`ausfuehr-spur.js:493`).
  `testdateiPruefen` prüft gegen diese Liste (`:982`). Ein per `registriere_test` eingetragener Test wäre deshalb mit
  `teste` NICHT fahrbar.
  - Im Baustand-Modus wird die Liste vor jedem `teste`/`mutiere_und_teste` neu aus dem aktuellen `test/run.sh` des Baums
    gelesen.
  - Selbsttestfall: `neue_datei` → `registriere_test` → `teste` läuft. Gegenprobe: Ohne die Aktualisierung wird der Fall
    abgelehnt.
- **A2 Grundlauf-Zwischenspeicher.** `lauf.grundlauf` wird nie geleert (nur `has`/`get`/`set`, `:1029`/`:1047`/`:1053`).
  In der Bauspur ändert sich der Baum zwischen zwei Aufrufen. Damit gilt ein alter Grundlauf für einen neuen Stand, und
  ROT/GRÜN einer Gegenprobe wäre falsch beschriftet.
  - Nach jedem erfolgreichen `ersetze`/`neue_datei`/`registriere_test` wird der Zwischenspeicher geleert, oder er wird an
    einen Hash des Baustands gebunden.
  - Selbsttest beide Richtungen:
    - Test brechen → `teste` (gescheitert) → reparieren → `mutiere_und_teste` meldet NICHT `grundlauf-rot`.
    - Grün gemerkt → Produktivcode verschlechtern → `mutiere_und_teste` nimmt NICHT den alten Grundlauf.
- **A3 Sauberer Start.** Vor dem ersten Modellaufruf muss `git status --porcelain` des Baums leer sein, sonst Abbruch mit
  eigenem Exit-Code. `--protokoll` muss AUSSERHALB des Baums liegen, sonst ebenfalls Abbruch. Erst damit ist der
  Endvergleich „Schreibliste gegen `git status`“ wohldefiniert.
- **A4 Benutzer und Rechte.** Das Werkzeug läuft als root, weil die Sandbox root braucht (`:469`).
  - Jede geschriebene Datei und jedes neu angelegte Verzeichnis bekommt Eigentümer und Gruppe der Baumwurzel
    (`stat(--baum)`). In diesem Container ist das root, Selbsttest trotzdem mit einer Fixtur eines anderen Eigentümers.
  - Die Schlüsseldatei muss Rechte 600 haben und root gehören, sonst Abbruch (Vorbild `gegenleser-repo.js:1499`).
- **A5 Kostendeckel schliesst bei unbekanntem Preis.** `kostenSchaetzen` liefert `null` ohne Preiseintrag
  (`gegenleser-repo.js:384-388`).
  - Hat das gewählte Modell keinen belegten Preiseintrag, bricht die Bauspur VOR dem ersten Aufruf ab, mit eigenem
    Exit-Code. „UNBESTÄTIGT“ heisst: kein Eintrag, nicht ein Kommentar.
  - Selbsttestfall „Preis unbekannt“.
  - Für den Probelauf muss deshalb mindestens der Preis von `qwen3.8-max` belegt sein (Quelle und Datum im Kommentar).
- **A6 `registriere_test` gehört in die abschliessende Werkzeugliste** als Punkt 6, mit der Spezifikation aus B1.
  - Zusätzlich nach dem Einfügen: `bash -n test/run.sh` muss 0 liefern, und `testsAusRunSh` muss auf der neuen Datei die
    alte Liste plus genau diesen Eintrag ergeben, sonst wird zurückgenommen und abgelehnt.
  - Selbsttest: Eine Zeile `)` und eine Zeile mit Kommentar oder Anführungszeichen werden abgelehnt.
- **A7 `ersetze` gilt auch für in diesem Lauf neu angelegte Dateien.** Selbsttest: `neue_datei` → `ersetze` → `lies`
  zeigt den neuen Inhalt.
- **A8 Baustand-Modus der Sandbox als Vertrag.**
  - Kopiert werden die Dateien aus `git ls-files` plus die Lauf-neuen Dateien, mit Dateimodus. Symlinks aus `ls-files`
    werden als Symlinks kopiert und zeigen nicht aus der Kopie heraus, sonst Ablehnung. `node_modules` wird ausgelassen
    (es wird wie heute aus dem Baum gebunden), ebenso `.git`.
  - `ERWARTETE_FAELLE` des Sandbox-Selbsttests wächst als Literal mit.
  - Der Attrappen-Selbsttest der Bauspur braucht weder root noch Cluster: eigener CI-Job ohne `sudo`. Die Sandbox-Fälle
    des neuen Modus laufen im bestehenden Job `ausfuehr-spur`.
- **Kleinere Punkte:**
  - Die Deckel der Sandbox (`MAX_AUFRUFE = 30`, `MAX_AUSFUEHRUNGSZEIT_MS` 45 min, `:78-79`) bleiben. Ihr Erreichen endet
    als „Budget erschöpft (Sandbox)“ mit Teilbericht, wie die Bauspur-Deckel.
  - `package.json` und `package-lock.json` sind für die Bauspur IMMER gesperrt, auch mit `--erlaubt`. Die Kopie bindet die
    alten `node_modules`; Abhängigkeiten ändert der Haupt-Agent.
  - Der Probelauf-Baum braucht vorher `npm ci` (macht der Haupt-Agent bzw. der Executer beim Probelauf).
  - Der Geheimnis-Riegel liegt auch auf dem Schreibweg: `pruefeGeheimnisse` auf `inhalt` (`neue_datei`) und `neu`
    (`ersetze`), ein Treffer führt zur Ablehnung.
  - `ersetze` hat einen Längendeckel für `neu` (200 KB wie `neue_datei`). Nach dem Schreiben läuft bei `.js`/`.cjs`
    `node --check`. Ein Syntaxfehler sperrt nicht, er geht als Hinweis ins Werkzeugergebnis, denn Zwischenstände dürfen
    kaputt sein.
  - Die Sandbox-Sperre `/var/lock/dsv1.lock` teilt sich die Bauspur mit der Prüfspur. Sie laufen also nacheinander;
    das steht im Kopf von `bau-spur.js`.

## Bericht

- je Abschnitt: Diff-Kern, Messungen am Endpunkt (wörtlich), Gegenproben ROT/GRÜN wörtlich;
- der Probelauf mit Protokollauszug und Kosten;
- was offen bleibt.

-- Ende des Auftrags --
