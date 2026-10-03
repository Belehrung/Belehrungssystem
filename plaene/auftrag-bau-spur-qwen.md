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

## Bericht

- je Abschnitt: Diff-Kern, Messungen am Endpunkt (wörtlich), Gegenproben ROT/GRÜN wörtlich;
- der Probelauf mit Protokollauszug und Kosten;
- was offen bleibt.

-- Ende des Auftrags --
