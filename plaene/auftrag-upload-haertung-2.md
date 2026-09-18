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
