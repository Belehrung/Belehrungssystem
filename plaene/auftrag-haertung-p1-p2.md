# Auftrag: Härtung P1+P2 — kein GET schreibt mehr, und die CSRF-Ausnahmen werden bewacht

Repo: `/home/user/gymdocu`. Zweig: `claude/haertung-p1-p2`, angelegt auf dem
AKTUELLEN `master` — der Beitrag „Verschlüsselung Stufe 0" muss vorher darin
sein, er fasst `routes/verbandbuch-admin.js` an.

**Alle Zeilennummern unten sind FUNDORTE vom 17.09.2026, keine Befunde. Vor
dem Bauen neu messen.** Sie stammen aus `git grep` auf master, nicht aus einer
Durchsicht der Umgebung.

## Warum das gebaut wird

`core/csrf-schutz.js` lässt GET/HEAD/OPTIONS bewusst und richtig immer durch —
ein GET soll nichts verändern. Vier Routen tun es trotzdem. Damit lässt sich
über ein eingebettetes `<img src="…">` auf einer fremden Seite ein
Schreibvorgang im angemeldeten Admin-Konto auslösen.

## A — Die vier Routen auf POST umstellen

| Route | Fundort |
|---|---|
| `GET /admin/verbandbuch/eintrag/:id/pdf` | `routes/verbandbuch-admin.js:443` |
| `GET /module/wartung/pruefung-pdf/:id` | `routes/wartung.js:1552` (Link `:1534`) |
| `GET /admin/geraetewartung/verlauf/pdf/:id` | `routes/admin/geraete.js:4703` (Links `:4445`, `:4657`) |
| `GET /module/<pfad>/neue-fotos/fertig` | `routes/sichtpruefung.js:5462` (Link `:3447-3448`) |

Der Schreibvorgang der drei PDF-Routen sitzt in `core/pdf-engine.js:82`
(`INSERT INTO verify_dokumente`).

**Wichtig, damit niemand das Falsche „aufräumt": dieser INSERT ist kein
Versehen und wird NICHT entfernt.** Ein erzeugtes PDF bekommt einen Prüfcode,
damit es später als echt nachgewiesen werden kann — „ein prüfbares Dokument
erzeugen" IST eine Zustandsänderung und gehört genau deshalb hinter POST.

Ebenfalls nicht anfassen: dass das Verbandbuch-PDF seit Stufe 0 nach der
Auslieferung gelöscht wird. Die Echtheitsprüfung braucht die Datei nicht — sie
vergleicht eine hochgeladene Datei gegen den gespeicherten Hash
(`routes/verify.js`, POST `/:code`). Prüfe das nach, bevor du dich darauf
verlässt.

Aufgaben je Route:
- Aus dem Link wird ein absendendes Element, das POST benutzt. Halte dich an
  das Muster, das im Repo für vergleichbare Knöpfe schon da ist — such danach,
  statt eines zu erfinden, und nenne im Bericht, welches du genommen hast.
- Die Auslieferung der Datei muss unverändert funktionieren.
- `neue-fotos/fertig` ist ein NAVIGATIONSSCHRITT mit Abfrageparametern
  (`?ids=…`, `nachtrag=…`), keine Datei-Auslieferung. Miss zuerst, was die
  Route tut und wohin sie danach leitet. **Wenn POST hier den Ablauf kaputt
  macht, brich ab und melde es, statt zu improvisieren** — dann entscheide ich.
- Prüfe für JEDE Route, ob sie noch woanders verlinkt wird als an den
  Fundorten oben. Ein übersehener Link ist ein toter Knopf in der Oberfläche.

## B — Ein Wächter, der GET-Schreibvorgänge künftig verhindert

Eine einmalige Behebung ist kein Schutz gegen die nächste solche Route.

Prüfe VERHALTEN, nicht Quelltextform: für jede der vier Routen ein GET
absetzen und zusichern, dass er NICHT durchgeht, und dass dabei **keine neue
Zeile in `verify_dokumente`** entsteht. Beide Hälften — eine Route, die gar
nichts mehr tut, erfüllt „kein INSERT" ebenfalls.

Dazu die Gegenrichtung: derselbe Aufruf als POST liefert die Datei UND legt
genau EINE Zeile an. Zähle vorher und nachher; eine Zusicherung „es gibt
Zeilen" ist keine.

## C — Wächter über die CSRF-Ausnahmen

`core/csrf-schutz.js:8`: `AUSNAHME_PREFIX = ['/api', '/intern', '/d/', '/v/']`.
Diese Pfade sind vollständig vom CSRF-Schutz ausgenommen. Das ist heute
richtig — sie haben eigene Anmeldung. Die Gefahr ist die Zukunft.

Gebaut wird ein Wächter, der die tatsächlich registrierten Routen gegen eine
LITERAL hingeschriebene Erwartung hält:

1. Die App über `test/helfer/route-harness.js` bauen.
2. Aus dem Express-Router-Stapel ALLE Nicht-GET-Routen einsammeln, deren Pfad
   mit einem der Ausnahme-Präfixe beginnt.
3. Diese Menge gegen eine im Test von Hand geschriebene Liste halten —
   die MENGE, nicht die Anzahl. Wer eine neue Schreibroute unter `/api` anlegt,
   bekommt einen roten Lauf und muss bewusst entscheiden.
4. Zusätzlich `AUSNAHME_PREFIX` selbst gegen eine literale Erwartung halten.

**Die Falle dabei, und sie ist der Kern des Auftrags:** In der CLAUDE.md steht,
dass `server.js` einige Router ausserhalb von `routes/admin.js` einhängt, die
in `makeApp` FEHLEN. Ein Wächter, der nur die Hälfte der Routen sieht,
bestätigt fröhlich, dass unter `/api` alles in Ordnung ist.

**Miss deshalb ZUERST, welche Router `route-harness.js` einhängt und welche
`server.js` zusätzlich einhängt, und lege die Differenz im Bericht offen.**
Dann eines von beiden, und begründe die Wahl:
- den Harness so erweitern, dass er vollständig ist, oder
- die Lücke im Zusicherungstext WÖRTLICH benennen („erfasst die über
  `makeApp` eingehängten Router; NICHT erfasst: …").
Was nicht geht: die Lücke offenlassen und den Wächter so klingen lassen, als
prüfe er alles.

## Gegenproben — Pflicht, jede einzeln, Zahlen wörtlich

Defekt einbauen → ROT messen → über eine vorher beiseitegelegte `cp`-Kopie
zurücknehmen → `diff` EXIT 0 → GRÜN messen.

1. Eine der vier Routen wieder auf GET zurückdrehen → der Wächter aus B muss
   fallen, und zwar auf DIESE Route zeigend.
2. Den Zeilenzähler auf `verify_dokumente` lahmlegen (so, dass er immer 0
   liefert) → die Zusicherung muss fallen. Sonst misst sie nichts.
3. Ein Präfix aus `AUSNAHME_PREFIX` entfernen bzw. hinzufügen → der Wächter
   aus C muss fallen.
4. Eine erfundene POST-Route unter `/api` einhängen → der Wächter aus C muss
   sie melden. **Das ist die Positivkontrolle für C und sie ist nicht
   optional:** ohne sie ist nicht belegt, dass der Wächter überhaupt etwas
   sieht. Danach wieder entfernen.
5. Für jede Gegenprobe vorher `node --check` auf die sabotierte Datei, und bei
   jedem roten Ergebnis prüfen, ob wirklich eine ZUSICHERUNG gefallen ist und
   nicht bloss etwas abgestürzt ist.

## Ausdrücklich NICHT in diesem Auftrag

- Kein Ratelimit für `routes/api.js` (eigener Auftrag).
- Keine Verschlüsselung, weder Felder noch Dateien.
- Der `INSERT` in `core/pdf-engine.js:82` bleibt.
- Nichts am echten Dateisystem, kein `pm2`, kein `nginx`, kein `/var/www`.
  Dieselbe Suite läuft auf dem Live-Server als Deploy-Gate.

## Abschluss

- `bash test/run.sh > /tmp/claude-0/suite-p1p2.log 2>&1; echo "SUITE_EXIT=$?"`
  — keine Pipe, kein äusseres `flock`.
- Dateizahl-Ritual, `diff` EXIT 0.
- `npm run lint` — Ergebnis wörtlich melden, auch bei Grün.
- Marker-Scan vor jedem Commit, `git status` am Ende sauber.
- Bericht: Diff Datei für Datei, Testausgaben wörtlich, alle Gegenproben in
  beide Richtungen, die Router-Differenz aus C, und jeder Punkt, an dem deine
  Messung meinen Fundorten widerspricht.
