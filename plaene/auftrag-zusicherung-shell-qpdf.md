# Auftrag: Die Shell-Zusicherung, die nicht rot werden kann — und zwei Nachbarn

Fassung 2 — 18.09.2026, nach der Planprüfung. Verfasser: Haupt-Agent.

**Der Gegenleser hat diesen Plan gesehen.** Urteil: „Das Papier sollte so noch
nicht als Bauauftrag freigegeben werden." Fünf Befunde, alle selbst
nachgemessen, **alle fünf getragen** — zwei davon blockierend, und beide
betreffen die BEHEBUNG, nicht den Befund. Die drei Befunde selbst sind
unverändert bestätigt.

## Warum dieser Beitrag zuerst kommt

Punkt 2 unserer Prüfreihenfolge: „Prüfungen, die nicht rot werden können" —
unsere teuerste Klasse, weil sie nicht Abdeckung FEHLEN lässt, sondern
Abdeckung VORTÄUSCHT. Hier liegt ein Musterfall: eine Zusicherung, die
wörtlich behauptet, sie beweise etwas, das sie nie prüft.

## Befund Z1 — „beweist, dass GAR KEINE Shell beteiligt ist" (prüft es nicht)

`test_feature_mandantengrenze_dateiwege.js`, die Zusicherung:

```js
ok('beide execFile-Aufrufe haben die erwartete Form (zip -j <zipPath>, restliche Argumente sind die PDF-Dateinamen, cwd=<tmpDir>) — beweist zusätzlich, dass GAR KEINE Shell mehr beteiligt ist',
    !!m1 && !!m2);
```

und die Funktion, aus der `m1`/`m2` stammen:

```js
function leseZipAufruf(aufruf) {
    if (!aufruf || aufruf.datei !== 'zip') return null;
    if (!Array.isArray(aufruf.args) || aufruf.args[0] !== '-j') return null;
    const zipPath = aufruf.args[1];
    const tmpDir = aufruf.opts && aufruf.opts.cwd;
    if (!zipPath || !tmpDir) return null;
    return { zipPath, tmpDir };
}
```

Geprüft werden: Programmname, `args[0] === '-j'`, ein ZIP-Pfad, ein `cwd`.
**`opts.shell` wird nie angesehen.** Node erlaubt bei `execFile` ausdrücklich
eine Shell — `execFile(datei, args, { shell: true })` fügt genau die
Shell-Zeile wieder ein, gegen die die Umstellung auf `execFile` überhaupt
gefahren wurde. Die Zusicherung wäre danach unverändert grün.

**Der Geschwisterwächter deckt es auch nicht ab.**
`test_feature_owasp_haertung_static.js` scannt `routes/` und `core/` mit zwei
Mustern:

```js
const IMPORT_ANKER_RE = /\{[^}]*\b(?:exec|execSync)\b[^}]*\}\s*=\s*require\(\s*['"]child_process['"]\s*\)|require\(\s*['"]child_process['"]\s*\)\s*\.\s*(?:exec|execSync)\b/;
const FREISTEHENDER_AUFRUF_RE = /(?<!\.)\b(?:exec|execSync)\s*\(/;
```

Beide suchen `exec`/`execSync`. **Die Shell-OPTION kommt in keinem der beiden
Muster vor.** Es gibt also im ganzen Repo keine Stelle, die `shell: true`
verhindern würde.

**Heute ist nichts kaputt** — gemessen: `grep -rn "shell[[:space:]]*:"` über
`routes/`, `core/` und `server.js` (ohne Tests) findet **null** Treffer. Es
geht um den Riegel, nicht um einen aktuellen Schaden. Genau das ist der Grund,
warum es billig ist und warum es trotzdem gemacht wird: die Zusicherung
BEHAUPTET den Riegel bereits.

### Was zu bauen ist

**Z1a — die Zusicherung prüfen lassen, was ihr Name verspricht.**
`leseZipAufruf()` weist einen Aufruf zusätzlich zurück, wenn `opts.shell`
gesetzt ist (irgendein wahrer Wert ODER eine Zeichenkette — `shell: '/bin/sh'`
ist genauso eine Shell wie `shell: true`). Dazu eine EIGENE Zusicherung, die
das ausspricht, statt es im Sammelurteil `!!m1 && !!m2` zu verstecken: bei
einem Sammelurteil ist hinterher nicht erkennbar, WELCHE Eigenschaft fiel.

**Z1b — ein statischer Wächter gegen die Shell-Option.**
In `test_feature_owasp_haertung_static.js`, Abschnitt neben den beiden
bestehenden Mustern: über dieselben Dateien scannen (derselbe Scanweg,
derselbe Kommentar-Abzug — ein Wächter, der an Prosa scheitert, wird
abgeschaltet statt gelesen) und jede Zeile melden, die in einem
`execFile`/`execFileSync`/`spawn`/`spawnSync`-Aufruf eine wahre Shell-Option
setzt.

**BLOCKIEREND BERICHTIGT (Planprüfung, selbst nachgemessen).** Fassung 1
sagte: fängt das Muster nur die einzeilige Form, reicht es, die Grenze zu
BENENNEN. Das ist hier falsch, und der Prüfer hat recht mit der Begründung:
Eine benannte Grenze macht aus einer Lücke eine bekannte Lücke — aber keinen
Riegel. Bei einem Wächter, der die Shell-Klasse ABSCHLIESSEN soll, ist das
nicht vertretbar; der funktionale Z1a-Test schützt nur die eine
Einstellungen-Route, alle übrigen Aufrufer blieben ungeschützt.

**Die mehrzeilige Form ist deshalb PFLICHTABDECKUNG, kein zulässiges
Negativergebnis.** Der bestehende Scanweg (`maskiereKommentare(text)
.split("\n").some(...)`, `test_feature_owasp_haertung_static.js:56-57`) kann
einen Aufruf und ein zwei Zeilen tiefer beginnendes Optionsobjekt
grundsätzlich nicht verbinden — wer diesen Weg benutzt, muss ihn für diesen
Abschnitt verlassen (etwa: Kommentare abziehen, dann über den GANZEN
Dateiinhalt statt zeilenweise suchen).

**Und der Bestand enthält bereits eine Schreibform, die Fassung 1 übersehen
hat** — ein Alias, kein exotischer Trick:

```js
const execFileP = require('util').promisify(execFile);   // routes/health-intern.js:26
await execFileP('df', ['--output=pcent', mount], {
    encoding: 'utf8',
    timeout: 3000,
});
```

Ein Wächter, der auf die vier Aufrufnamen `execFile`/`execFileSync`/`spawn`/
`spawnSync` zielt, sieht diesen Aufruf nicht — auch dann nicht, wenn das
Mehrzeilenproblem gelöst ist.

**Verbindliche Abdeckung, jede Form eigens gegengeprobt:**

| Schreibform | muss der Wächter |
|---|---|
| `execFile(x, y, {\n shell: true\n});` | FINDEN |
| `const opts = { shell: true }; execFile(x, y, opts);` | FINDEN oder als „nicht auflösbar" MELDEN |
| `execFile(x, y, { ...defaults });` mit Shell in `defaults` | melden |
| `opts.shell = true; execFile(x, y, opts);` | FINDEN |
| `execFile(x, y, { ['shell']: true });` | FINDEN |
| `execFileP(...)`, `const { execFile: run } = …; run(...)` | FINDEN (Alias steht im Bestand) |
| `{ cwd: tmpDir }`, `{ shell: false }`, das Wort „shell" in Prosa | NICHT anschlagen |

**Die Politik, die daraus folgt, und sie ist die eigentliche Entscheidung:**
Was der Wächter nicht statisch auflösen kann, gilt NICHT als sicher, sondern
wird GEMELDET. Ein Optionsobjekt aus einer Variablen ist damit entweder
auflösbar oder ein Befund — nie stillschweigend in Ordnung. Das ist unsere
Hausregel „leeres Ergebnis ist nicht sauberes Ergebnis", auf einen Scanner
angewandt.

**Der Geltungsbereich ist ebenfalls zu weiten:** `alleDateien` in jener Datei
umfasst nach `:70-72` nur `routes/` und `core/` — **nicht `server.js`** und
nicht die produktiven Wurzelskripte. Der neue Abschnitt nimmt sie dazu, sonst
bewacht er die halbe Anwendung.

**Die Beispiele laufen durch den VOLLSTÄNDIGEN Wächterpfad**, samt
Aufrufkontext — ein isoliertes `{ shell: true }` beweist nur, dass die Regex
eine Zeichenkette trifft, nicht dass sie den richtigen Aufruf findet. Und die
Kommentar-Negativkontrolle enthält eine VOLLSTÄNDIGE verbotene Schreibweise in
`//` und in `/* … */`, nicht bloss das Wort „shell".

**Positivkontrolle ist Pflicht** (der Abschnitt daneben macht es vor): das
Muster muss an hingeschriebenen Beispielen ANSCHLAGEN — `{ cwd: tmpDir, shell: true }`,
`{shell:'/bin/bash'}` — und an den erlaubten Formen NICHT: `{ cwd: tmpDir }`,
`{ shell: false }`, und `shell` als Wort in einer Prosa-Zeile.

## Befund Z3 — das qpdf-Passwort geht ungeprüft als Argument

`routes/verbandbuch-admin.js`:

```js
const pw = String(req.body.pdf_passwort || "");
if (pw.length < 4) return res.status(400).send("Passwort zu kurz.");
…
execFile("qpdf", ["--encrypt", pw, pw, "256", "--", abs, geschuetzt], async (qerr) => {
```

Keine Shell beteiligt — ein Shell-Ausbruch ist damit ausgeschlossen, und das
ist beim Melden zu sagen. Die verbleibende Frage ist eine andere:
**`qpdf` hat eine eigene Argumentsyntax**, und `--encrypt` nimmt seine beiden
Passwörter positionell. Ein Wert, der mit `-` beginnt, kann dort je nach
qpdf-Fassung als Option gelesen werden. Welche Fassung auf dem Server läuft,
ist im Repo nicht festgelegt, und der zugehörige Test ersetzt `qpdf` durch
einen Stub — aus dem Repo heraus ist die Frage also **nicht entscheidbar**.

**BLOCKIEREND BERICHTIGT (Planprüfung, selbst nachgemessen).** Fassung 1
wollte nur ein führendes `-` abweisen und behauptete, das mache „die
qpdf-Fassung gleichgültig". Beides war falsch:

1. **`@` fehlte.** qpdf kennt Argumentdateien über `@dateiname` (und `@-` für
   die Standardeingabe). Ein Passwort `@/pfad/zur/datei` besteht sowohl die
   Längenprüfung als auch die Bindestrichprüfung und ist trotzdem kein
   gewöhnliches Passwortargument mehr. Schon die Zusage „wird unverändert als
   Passwort behandelt" wäre damit unwahr.
2. **Die Bindestrich-Begründung war zu stark.** `--encrypt` nimmt seine
   Passwörter POSITIONELL; aus einem führenden `-` folgt nicht automatisch,
   dass qpdf es als Option liest. Eine konkrete Fassung, in der das passiert,
   kann ich nicht benennen — also ist es eine Vorsichtsmassnahme, keine
   Behebung einer nachgewiesenen Lücke, und so gehört es auch im Kommentar zu
   stehen.
3. **„Kostet den Benutzer nichts" ist keine technische Tatsache**, sondern
   eine Annahme über Passwortgewohnheiten. Ein mit `-` beginnendes Passwort
   ist eine legitime Wahl.

**Zu bauen ist deshalb:** abgewiesen werden führendes `-` UND führendes `@`.
Die Meldung nennt beide Zeichen ausdrücklich, damit der Benutzer nicht raten
muss. Im Kommentar steht getrennt, was belegt ist (`@` ist dokumentierte
qpdf-Syntax) und was Vorsicht ist (`-`).

Was daran NICHT übertrieben werden darf: Andere Zeichen — Leerzeichen,
Semikolon, `$`, Anführungszeichen — sind bei diesem direkten `execFile`-Aufruf
ohne Shell bedeutungslos. **Die Aussage „ein Shell-Ausbruch ist hier
ausgeschlossen" ist von der Prüfung ausdrücklich bestätigt worden.** Es geht
allein um die Argumentsyntax des Zielprogramms.

Die Ablehnung nimmt denselben Weg wie die bestehende Längenprüfung
(`res.status(400).send(...)`), mit einem Text, der SAGT, was erlaubt ist —
nicht „ungültig". Zusicherung: ein Passwort mit führendem `-` wird
abgewiesen, `execFile` **gar nicht erst gerufen** (über den vorhandenen Stub
zählbar), und ein gewöhnliches Passwort geht weiterhin durch.

**Was hier NICHT behauptet werden darf:** dass damit eine Lücke geschlossen
wurde. Es ist ein Riegel gegen eine Frage, die wir nicht beantworten können.
So gehört er auch im Kommentar zu stehen.

## Befund Z2 — der stille `catch` auf der Startseite (kleine Zugabe)

`server.js`, im Wartungs-Kachelblock:

```js
let wartungFarbe = 'var(--gd-signal)';
let wartungTextFarbe = 'var(--gd-auf-signal)';
let wartungOffen = 0;
…
        } catch(e) {}
```

und die Anzeige:

```js
${infoZeile(wartungTextFarbe === 'var(--gd-auf-status)' ? '⚠️ Prüfung fällig!' : '')}
```

Scheitert die Fälligkeitsabfrage, bleiben die Ausgangswerte stehen und die
Warnung fehlt.

**BERICHTIGT (Planprüfung, selbst nachgemessen):** Fassung 1 schrieb „die
Kachel ist grün". Sie ist GELB — `--gd-signal` ist `#F7D000` (`core/design.js`).
Der Fehler ändert den Befund nicht (der Zustand ist derselbe wie bei
erfolgreich ermittelten null Fälligkeiten, also „nichts zu tun"), aber eine
Abnahme darf sich nicht an einer Farbe festmachen, die es nicht gibt. Es gibt keinen dritten Zustand „nicht
ermittelbar", und der Fehler landet nicht einmal im Log. Das ist unsere
Hausregel „leeres Ergebnis ist nicht sauberes Ergebnis", auf die Oberfläche
angewandt.

**Zu bauen:** der `catch` protokolliert über `intern()` (dieselbe Funktion,
die die Datei ohnehin schon benutzt) und setzt einen eigenen Zustand, den die
Kachel als „Status nicht ermittelbar" anzeigt — NICHT als „alles in Ordnung"
und NICHT als „Prüfung fällig". Beides wäre eine Behauptung, die wir gerade
nicht belegen können.

**Vorbild im Bestand, aber ENG gefasst — und die Einschränkung ist gemessen:**
`routes/sichtpruefung.js:3561-3568` fängt denselben Fall richtig ab
(`messfehler = true`, Defektzahlen auf `null`), und die Anzeige wertet den
unbekannten Zähler wirklich aus (`:3738` → „Mängelstand nicht ermittelbar").
**Nur dieser Teil ist Vorbild.**

NICHT mitkopieren: dieselbe Datei führt `heuteGemacht` bei einem Fehler als
`false` weiter (`:3530`) und zeigt ab 10 Uhr trotzdem „Noch nicht erledigt!"
(`:3662`, `:3704-3711`) — also genau die Krankheit, die Z2 beheben soll, nur
in die andere Richtung: eine Behauptung über einen Zustand, der gar nicht
ermittelt wurde. Und die dortigen `catch`-Blöcke protokollieren den Fehler
ebenfalls nicht. Wer das Vorbild als Ganzes nachbaut, baut den Befund mit ein.

**Zwei gleichartige Stellen liegen daneben** (Belehrungs-Warnung, Spülplan) —
sie werden in DIESEM Beitrag NICHT mitgeändert, sondern als offener Punkt
festgehalten. Begründung: der Spülplan-Fall setzt bei Fehler `null` und
lässt die Kachel ganz verschwinden; ob das falsch ist, hängt daran, was die
Kachel bedeutet, wenn das Modul gar nicht aktiv ist. Das ist eine eigene
Frage und keine Zeile in diesem Beitrag.

## Was AUSDRÜCKLICH NICHT gebaut wird

- **Keine Umstellung der vier `let msg = err.message` in
  `routes/belehrungen.js`.** Dort ist der Fehler zu diesem Zeitpunkt bereits
  als Eingabefehler eingeordnet; `err.message` ist dann entweder multers
  eigener englischer Text oder der eigene Filtertext. Das ist eine
  Textqualitätsfrage, keine Sicherheitsfrage, und gehört nicht in einen
  Beitrag über Zusicherungen.
- **Keine Änderung an der qpdf-Aufrufform selbst** (etwa auf
  `@argfile`-Syntax umstellen). Das wäre eine Verhaltensänderung an einem
  Weg, dessen Zielprogramm wir im Repo nicht festlegen.

## Gegenprobe — für JEDE der drei Zusicherungen einzeln

Vor der Behebung messen, dass die neue Zusicherung ROT wird; nach der
Rücknahme, dass sie GRÜN wird. Beide Läufe mit `EXIT`-Code und
`PASS/FAIL`-Zahlen wörtlich in den Bericht.

Für Z1a ist die Mutation vorgegeben und steht schon fest: in
`routes/admin/einstellungen.js` die Optionen von `{ cwd: tmpDir }` auf
`{ cwd: tmpDir, shell: true }` ändern. **Heute lässt diese Mutation die
Zusicherung grün** — das ist der Befund. Nach Z1a muss sie fallen, und zwar
mit Z1a UND Z1b (zwei getrennte Meldungen, nicht eine).

Jede Mutation trägt den Marker `GEGENPROBE-` + `DEFEKT`, nimmt den Zielpfad
als ARGUMENT, bricht ab, wenn ihr Suchmuster nicht GENAU EINMAL passt, läuft
durch `node --check`, und wird gegen eine unabhängig angelegte `cp`-Kopie mit
`diff` (EXIT 0) zurückgenommen — nie per `git checkout` oder `git stash`.
