# Auftragspapier — Upload-Härtung, Beitrag 2a

**Fassung 3, 18.09.2026.** Fassung 2 ging als zweite Planprüfung an den
Gegenleser. Urteil: **„Fassung 2 noch nicht freigeben"**, sieben Befunde,
davon drei blockierend — **alle sieben selbst nachgemessen, alle sieben
getragen**. Das Ergebnis ist kein korrigierter Plan, sondern ein anderer
ZUSCHNITT. Basis ist `03f0c3c`.

---

## Warum der Zuschnitt sich geändert hat

Fassung 1 und 2 wollten die Abbruch-Markierung (U1) und die Löschreihenfolge
(U2) zusammen bauen. Die Prüfung hat gezeigt, dass darunter eine Schicht
liegt, die zuerst fällig ist.

**#457 hat die Klasse „Systemfehler wird als Eingabefehler behandelt" NICHT
geschlossen, sondern zur Hälfte.** Selbst gezählt über alle Aufrufmuster —
einschliesslich `seilUpload(req, res, …)`, das ein reines
`.single()`-Suchmuster ÜBERSIEHT:

| | Eintrittspunkte | Stand |
|---|---|---|
| `routes/belehrungen.js` (1399, 1557, 2005, 2087) | 4 | behoben in #457 |
| `routes/lageplan.js:644` | 1 | behoben in #457 |
| `routes/verify.js:30` | 1 | **war schon richtig** — fängt `LIMIT_*` ab, Rest an `next(err)` |
| `routes/admin/geraete.js:4820` | 1 | **offen** |
| `routes/wartung.js:998` | 1 | **offen** |
| `routes/module.js:1145` | 1 | **offen** |
| `routes/sichtpruefung.js:3259` | 1 | **offen** |
| **Summe** | **10** | **6 richtig, 4 offen** |

Eine Abbruch-Markierung einzuführen, die vier dieser Wege gar nicht
durchreichen, baut eine Zusicherung auf einen Pfad, den es dort nicht gibt.
Deshalb: **erst vereinheitlichen, dann markieren.**

**Eigene Zahlenkorrektur, damit sie niemand erbt:** Ich hatte zwischendurch
„fünf offene" gezählt und `verify.js` ungeprüft dazugenommen. Nachgemessen
ist es richtig. Die Prüfung nannte vier — das trifft zu.

---

## Der Befund, den KEINE Prüfspur genannt hat

Beim Nachmessen von Befund 6 gefunden, nicht im Bericht enthalten:

**`routes/wartung.js:1000` und `routes/admin/geraete.js:4822` setzen
`msg = err.message || 'Upload-Fehler'` und rendern das in die Fehlerseite.**
Bei einem Systemfehler ist `err.message` gemessen:

    ENOENT: no such file or directory, open '/tmp/…/gibtesnicht/x.bin'

Also **der absolute Serverpfad an den Benutzer**. Das ist ein
Informationsleck und trifft genau die beiden Wrapper, die dieser Beitrag
ohnehin anfasst.

---

## Was gebaut wird

**Ein gemeinsamer Helfer, und zwar in `core/`, nicht in `routes/`.** #457 hat
`istUploadEingabefehler()` lokal in `routes/belehrungen.js` angelegt; für vier
weitere Dateien in drei Verzeichnissen ist das der falsche Ort (`core/`
importiert nicht aus `routes/` — die Richtung stimmt nur so herum).

Der Helfer beantwortet EINE Frage: *ist dieser Fehler ein Eingabefehler des
Clients?* Also `MulterError` (deckt alle `LIMIT_*` ab) oder ein bekannter
eigener `fileFilter`-Text. Alles andere ist ein Systemfehler und geht an
`next(err)`.

**Je Wrapper ist zu entscheiden, was „durchreichen" dort bedeutet** — das ist
Befund 6, und er ist der Grund, warum dieser Beitrag nicht schematisch ist:

- `routes/wartung.js`, `routes/admin/geraete.js`: rendern heute eine HTML-Seite.
  Ein Systemfehler geht künftig an `next(err)`; die Eingabefehler behalten
  ihre Seite — **aber ohne `err.message`**, sondern mit einem festen Text je
  bekanntem `LIMIT_*`-Code. Das schliesst zugleich das Pfad-Leck.
- `routes/module.js:1145`: antwortet JSON. Eingabefehler behalten ihr 400,
  Systemfehler gehen an `next(err)`.
- `routes/sichtpruefung.js:3259`: antwortet 400 oder Redirect, je nach
  `fotoJson`. Dieselbe Trennung, beide Zweige behalten ihre Form.

**Der Kontrollfluss ändert sich also sehr wohl — für Systemfehler.** Fassung 2
behauptete „am Kontrollfluss ändert sich nichts"; das war für diese vier
Wrapper falsch und ist hier berichtigt.

## Wächterkarte — VORHER erhoben, berichtigte Fassung

Fassung 2 nannte drei Dateien. Es sind **mindestens sechs**; die drei
zusätzlichen hat erst die Prüfung genannt, selbst nachgemessen:

| Datei | sichert zu | Verhältnis zu diesem Beitrag |
|---|---|---|
| `test_feature_upload_fehlerbehandlung.js` | `melde()` GENAU EINMAL (vier Stellen), stubbt `melde()` | muss um die vier neuen Wrapper erweitert werden |
| `test_feature_error_tracking.js` | echtes `melde()`, `senden` (12×), `unterdrueckt` (6×), `_state`, Drossel, `baueText`, Express-Roundtrips | kann fallen |
| `test_feature_keine_stillen_fehler.js` | statisch, `alle.length === 60`, exakt | nur bei geänderter catch-ZAHL |
| `test_feature_audit_mitarbeiter.js:174` | `errorTracker._state.has('Error:POST /admin/mitarbeiter')` | kann fallen |
| `test_feature_audit_einstellungen.js:298,592` | dasselbe für zwei weitere Routen | kann fallen |
| `test_feature_audit_geraetewartung.js:180` | dasselbe für `/admin/geraete` | kann fallen |

**Zur dritten Zeile, ebenfalls aus der Prüfung:** der Vergleich ist eine ZAHL,
keine MENGE. Ein leerer catch entfernt und andernorts einer hinzugefügt hält
die 60 und bleibt grün. Fassung 2 behauptete, „jedes Hinzufügen oder
Entfernen" werde bemerkt — zu stark, hier berichtigt. Die Behebung ist ein
eigener offener Punkt, nicht Teil dieses Beitrags.

## Zusicherungen — je Wrapper, nicht pauschal

Für JEDEN der vier umgestellten Wrapper, mit unabhängig hingeschriebenen
Sollwerten:

- Eingabefehler (`LIMIT_FILE_SIZE` erzwungen) → die bisherige Antwortform
  bleibt (Seite / 400 / Redirect), `melde()` wird **0×** gerufen;
- Systemfehler (Zielverzeichnis entfernt → `ENOENT`) → `next(err)`, HTTP 500,
  `melde()` **genau 1×**;
- **Pfad-Leck:** die Antwort auf einen Systemfehler enthält weder
  `err.message` noch einen Pfad, der mit `/` beginnt. Positivkontrolle: mit
  dem alten Code steht der Pfad drin.

**Und eine Zusicherung ÜBER DIE MENGE, nicht über eine Zahl:** ein Wächter
hält die Liste der Wrapper-Fundstellen gegen eine literal hingeschriebene
Erwartung. Ohne ihn übersieht der nächste Umbau denselben fünften Weg, den
mein `.single()`-Muster heute übersehen hat.

## Gegenproben

Zu jeder neuen Zusicherung: Defekt einbauen, ROT messen, zurücknehmen, GRÜN
messen, beides wörtlich. Rücknahme gegen eine `cp`-Kopie mit `diff` EXIT 0,
nie `git checkout`. Mutationsskript mit Zielpfad als ARGUMENT, Abbruch bei
≠1 Fundstelle, `node --check` vor jedem Lauf.

**Ausdrücklich verlangt, weil Fassung 2 daran scheiterte:** eine Mutation, die
den Helferaufruf aus EINEM Wrapper entfernt, muss GENAU dessen Zusicherungen
fallen lassen — und die der drei anderen grün. Eine Zusicherung, die einen
bereits eingeordneten Fehler prüft statt den Weg dorthin, belegt den Umbau
nicht.

---

## Was danach kommt, in dieser Reihenfolge

**Beitrag 2b — U1, die Abbruch-Markierung.** Erst wenn alle Wrapper denselben
Weg gehen. Der Entwurf steht (Markierung an der Quelle über `req.aborted`,
zusätzlich `err.code === undefined`, weil ein `fs`-Fehler immer einen Code
trägt — gemessen: Abbruch `undefined`, ENOENT `'ENOENT'`), samt der Auflage,
dass der Filter VOR `pruefeDrossel()` greift (gemessen: sonst verbraucht der
Abbruch den Sendeplatz, und die Signatur trägt keine `studio_id`, träfe also
auch andere Studios 15 Minuten lang).

**Beitrag 2c — U2, die Löschreihenfolge.** Unabhängig von 2a und 2b. Der
Dateiname kommt aus `DELETE … RETURNING`, gelöscht wird nach dem Commit. Die
Prüfung hat zwei Lücken in meinen Gegenproben genannt, beide nachgemessen:
„SELECT wie bisher, danach DELETE, danach Unlink des SELECT-Ergebnisses"
besteht beide Fassung-2-Proben, und ein verschluckter DELETE-Fehler besteht
den Fehlerfall. Beide Proben müssen die Quelle des Dateinamens auseinander
treiben und einen ausdrücklich nicht erfolgreichen Ausgang verlangen.

**Nicht in dieser Reihe, eigener Beitrag:** der Mandantenbefund an
`POST /api/position` (`etage_id` aus dem Body ohne Zugehörigkeitsprüfung,
Fremdschlüssel kaskadiert ohne `studio_id`), U8 (Erlaubnisliste statt
`startsWith('image/')`), U3 (Ernter), U4–U7.

---

# NACHARBEIT 2 — zwei Befunde aus MEINER Prüfung des Nacharbeits-Diffs

Der Ausführende hat die fünf Prüfbefunde behoben und dabei an drei Stellen
meine Vorgabe mit einer Messung widerlegt. **Alle drei Widersprüche habe ich
nachgemessen, alle drei tragen** — Einzelheiten unten unter „Was der
Ausführende richtig zurückgewiesen hat".

Beim Lesen des Diffs sind mir zwei Dinge aufgefallen, die niemand sonst
hatte.

## F-A — Die Kürzung greift nicht, wenn die ENDUNG lang ist

`kuerzeAufBytes()` nimmt die Endung vom Budget AUS:

```js
const ext = path.extname(name);
const extBytes = Buffer.byteLength(ext, 'utf8');
const basisBudget = Math.max(0, maxBytes - extBytes);
```

Bei `basisBudget = 0` bleibt die Endung übrig — in voller Länge.
`path.extname()` liefert alles ab dem letzten Punkt, und ein Dateiname wie
`a.` + 300 Zeichen hat damit eine 301 Byte lange „Endung".

**Selbst gemessen**, mit dem echten Helfer und dem echten Präfix (27 Byte):

| Eingabe | gespeicherter Name |
|---|---|
| 240 × `a` + `.pdf` | 177 Byte — ok |
| 240 × `ä` + `.pdf` | 177 Byte — ok |
| `a.` + 300 × `b` | **328 Byte — reisst die 255er-Grenze** |
| `a.` + 500 × `b` | **528 Byte — reisst sie** |

Damit steht genau der Befund wieder da, den B6 schliessen sollte: 
`ENAMETOOLONG`, kein MulterError, kein Filtertext → `next(err)` → HTTP 500
**und Telegram-Alarm**, ausgelöst durch eine reine Benutzereingabe.

**Zu bauen:** Die Endung ebenfalls deckeln, bevor sie vom Budget abgezogen
wird — eine Endung von mehr als etwa 16 Byte ist keine Endung mehr, sondern
Text hinter einem Punkt. Die Gegenprobe ist vorgegeben: die vier Zeilen der
Tabelle oben als Zusicherung, mit den gemessenen Zahlen.

## F-B — Dieselbe Stelle steht DREIMAL im Repo, behoben ist EINE

Der Ausführende hat es selbst gemeldet statt abgehakt — das ist der Grund,
warum es hier steht. Nachgemessen, das Muster kommt im ganzen Repo genau
dreimal vor:

```
routes/belehrungen.js:142    (pdfUpload — Belehrungs-PDF)
routes/belehrungen.js:1029   (nachweisUpload — Einweisungs-/Ersthelfer-Nachweis)
core/pruefbericht.js:94-97   (berichtUpload — BEHOBEN)
```

Alle drei bauen denselben Namen: `Date.now() + '_' + zufall + '_' +
originalname.replace(…)`, ohne Längengrenze.

**Und das ist KEIN reines Zweig-Problem — es ist LIVE.** Beitrag 1 (#457)
ist gemergt und ausgeliefert, und er hat genau diese beiden Wrapper auf
`next(err)` für Nicht-Eingabefehler umgestellt. Ein Belehrungs-PDF oder ein
Nachweis mit einem sehr langen Dateinamen erzeugt auf dem Live-Server also
heute schon HTTP 500 samt Alarm. **Das gehört als erstes behoben, nicht als
letztes.**

**Zu bauen:** Den Namensbau in EINEN gemeinsamen Helfer ziehen und alle drei
Stellen darauf umstellen. Drei wortgleiche Kopien derselben Zeile sind keine
Konsistenz, sondern drei Orte derselben Aussage — und genau deshalb wurde
nur einer geheilt.

Wo der Helfer hingehört, entscheidest du am Bestand: `core/pruefbericht.js`
ist das falsche Zuhause (`routes/belehrungen.js` würde dann aus einem
Prüfbericht-Modul importieren). Ein eigenes kleines `core/`-Modul neben
`core/upload-fehler.js` liegt näher. Sag, was du gewählt hast und warum.

**Zusicherung:** Ein Wächter, der zählt, wie viele Stellen im Repo einen
Speichernamen aus `file.originalname` bauen, und ihn gegen eine literal
hingeschriebene Erwartung hält — sonst steht die vierte Kopie in einem Monat
wieder ungedeckelt da. Das ist dieselbe Bauform wie der Mengen-Wächter über
die Upload-Eintrittspunkte, den dieser Beitrag schon hat.

## Was der Ausführende richtig zurückgewiesen hat — nachgemessen

**1. „Beliebige Empfängernamen erfassen" hätte den Wächter zerstört.**
Meine Vorgabe lautete, den Namensfilter `[Uu]pload` fallenzulassen. Selbst
nachgemessen über `git ls-files routes`, kommentarbereinigt:

| Muster | Treffer |
|---|---|
| `([a-zA-Z]*[Uu]pload)\(req, *res,` | **1** |
| `(\w+)\(req, *res,` | **84** |

Allein `fehlerSeite` matcht 33-mal, `zustandFehlerSeite` 14-mal — `(req, res,
next)` ist die verbreitetste Middleware-Signatur in Express überhaupt. Der
Ausführende hat den Filter für die direkte Aufrufform behalten und nur die
Methodenform geweitet. **Richtig entschieden, und mit einer Messung begründet
statt mit einer Meinung.**

**2. Die Rückfalllösung hätte die vorgegebene Gegenprobe nicht gefangen.**
Ich hatte ersatzweise eine Liste aller aus `multer(...)` entstehenden
Bezeichner angeboten. Die Mutation fügt aber keine neue Deklaration hinzu,
sie benutzt eine bestehende bloss als Middleware. Er hat stattdessen einen
fensterbegrenzten Scan über `router.*(…)`-Aufrufe gebaut — und dazu
gemessen, warum ein echter Klammer-Parser nicht trägt: ein naiver
Tiefenzähler endet in 4 von 8 Dateien „unbalanciert", weil Regex-Literale
Klammern enthalten. **Eine benannte Fenstergrenze ist ehrlicher als ein
Parser, der falsch zählt.**

**3. Die B6-Zusicherung prüft den erreichten Handler, nicht den vollen
Schreibvorgang.** Begründet mit dem Testrahmen (ein echter Erfolgspfad
bräuchte Gerätedatensatz, Prüfername und Unterschrift). Das ist die früheste
Stelle, an der sich „multer hat nicht geworfen" von der
Systemfehlerbehandlung trennen lässt. Trägt.

**Und eine Umgebungslücke, die keine Auftragslücke ist:** Der frische
Arbeitsbaum hatte weder `.env` noch eine Postgres-Rolle mit Passwort; der
erste Suite-Lauf war deshalb rot (`test_feature_qr_block.js`, fehlendes
`SESSION_SECRET`). Er hat die Ursache richtig ausserhalb seines Diffs
verortet, behoben und beide Läufe gemeldet. Für künftige Worktrees gehört
das in die Vorbereitung, nicht in die Fehlersuche.
