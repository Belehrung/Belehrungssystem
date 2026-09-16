# Eigene Nachträge zu PLAN-v2 (während die Gegenlesung läuft)

Diese Punkte sind NACH dem Absenden an die Gegenlesung aufgefallen. Sie
werden nach deren Bericht zusammen mit ihren Befunden in den Plan
eingearbeitet — nicht vorher, damit es nicht zwei Fassungen gibt.

## N-1 — Abschnitt 7 begründet das Auslassen von `geraete_bekannt` nicht

Der Plan schreibt nur "Keine Änderung an `geraete_bekannt` (der Name bleibt
dem Tablet bekannt)". Das ist eine Entscheidung ohne Begründung, und der
dazugehörige "bekannte Rest" in Abschnitt 4.1 ist damit schärfer, als er
dort klingt: das Tablet SCHLÄGT den ausgemusterten Gerätenamen aktiv weiter
vor.

GEMESSEN: `ladeBekannteGeraete()` (`routes/sichtpruefung.js:1112-1118`) liest
`SELECT geraet_name, standort FROM geraete_bekannt WHERE studio_id = $1 AND
typ = $2` — ohne jede Verbindung zu `geraete` und ohne `aktiv`-Filter.

WARUM TROTZDEM NICHTS GELÖSCHT WIRD (die Begründung, die im Plan fehlt):
`geraete_bekannt` trägt `UNIQUE(studio_id, typ, geraet_name)` und ist nur
lose an `geraete` gekoppelt — ein Name dort entsteht per Upsert beim
Absenden am Tablet (`routes/sichtpruefung.js:2531`, `:4439`), eine
`geraete`-Zeile dagegen nur beim Bekleben mit einem QR-Aufkleber. Es kann
also einen bekannten Namen OHNE Gerätezeile geben und zwei Gerätezeilen MIT
demselben Namen. Den Namen beim Ausmustern zu entfernen, würde im zweiten
Fall dem verbliebenen Gerät den Vorschlag wegnehmen.

Richtig wäre deshalb entweder gar nichts (heutiger Plan) oder ein eigener
Folgeauftrag mit eigener Entscheidung des Betreibers. Der Plan muss das
sagen, statt es als Nebensatz zu führen.

---

# Eigene Nachträge zu PLAN-v3 (während die zweite Gegenlesung läuft)

## E-1 — Beitrag 2 sagt „an JEDER Schreibstelle". Das ist zu breit und wäre falsch.

Vollständige Bestandsaufnahme, selbst erhoben (`grep` über
`core/ routes/ workers/ ops/ server.js`):

`geraete_defekte` — INSERT: `core/demo_daten.js:146`,
`routes/sichtpruefung.js:2522`, `:4428`. UPDATE: `core/defekt_mailer.js:166`,
`:175`, `routes/lageplan.js:464`, `routes/sichtpruefung.js:2239`, `:3082`.

`geraete_sperren` — INSERT: `routes/wartung.js:1305`, `routes/module.js:2822`,
`routes/sichtpruefung.js:4516`. UPDATE: `core/defekt_mailer.js:333`, `:342`,
`routes/admin/geraete.js:558`, `routes/wartung.js:1309`, `:1314`, `:1606`,
`routes/module.js:988`, `:1208`, `:2854`, `:2894`.

Das sind 8 bzw. 13 Stellen. Den Riegel an alle zu hängen wäre schädlich:
`core/defekt_mailer.js` setzt nur `mail_gesendet_am`, `routes/lageplan.js:464`
nur `position_id`, `routes/admin/geraete.js:558` nur `geraet_name`. Der
Mailer läuft als Hintergrundlauf — unter dem Riegel würde er sich gegen den
Tagescheck am Tablet serialisieren, ohne dass er am OFFEN/GESCHLOSSEN-Zustand
irgendetwas ändert.

**Die Regel muss deshalb am ZUSTAND hängen, nicht an der Tabelle:** den Riegel
nimmt, wer `status` bzw. `aktiv` ändert oder eine neue offene Zeile anlegt.
Das sind: `sichtpruefung.js:2522`, `:2239`(?), `:3082`, `:4428`, `:4516`;
`module.js:988`(?), `:1208`, `:2822`, `:2854`(?), `:2894`;
`wartung.js:1305`, `:1309`(?), `:1314`. Die mit `(?)` sind vor dem Bau einzeln
zu entscheiden — `:2239` und `:988` schreiben eine Beurteilung, `:2854` eine
Verschärfung, `:1309` ergänzt einen Grund. Der Wächter aus 2.3 zählt dann
nicht „alle INSERT/UPDATE", sondern genau diese von Hand festgelegte Liste.

## E-2 — `geraete_sperren` hat einen DRITTEN Typ: `wartung`

`CHECK(typ IN ('seilkontrolle','wartung'))` (`core/db.js:1378`), geschrieben
von `routes/wartung.js:1305/1309/1314`. Der Plan behandelt nur
`seilkontrolle`. Folgen, die er benennen muss statt sie zu übergehen:

- **Aufbewahrung:** harmlos. Eine Wartungs-Sperre bekommt nie
  `ausgemustert_am`, `COALESCE(freigegeben_am, ausgemustert_am)` fällt dort
  auf den bisherigen Wert zurück — gleiches Verhalten.
- **PDF:** zu prüfen, ob es für Wartungs-Sperren eine eigene Ausgabe mit
  derselben `freigegeben_am`-Kette gibt.
- **Die Wartungsgeräte selbst** (`wartung_geraete`, eigene Tabelle, eigene
  `aktiv`-Spalte) haben womöglich dieselbe Sackgasse. Das ist ein EIGENER
  Auftrag; er gehört genannt, nicht mitgebaut.

## E-3 — Beitrag 1 ist enger, als er klingt, und das ist Absicht

Gemessen: nur ZWEI Stellen schreiben nach einem Freigabe-/Reparatur-UPDATE
ein Audit-Ereignis, das genau diese eine Zeile als repariert bzw. freigegeben
behauptet — `routes/sichtpruefung.js:3080-3101` (`reparatur_freigabe`) und
`routes/module.js:1204-1217` (`seilkontrolle_freigabe`).

`routes/module.js:2894` und `routes/wartung.js:1314` lösen ebenfalls Sperren
ohne `rowCount`-Prüfung, schreiben danach aber KEIN solches Ereignis (im
Bereich 2896-2990 steht nur `sperre_sichtkontrolle` auf `:2980`, ein anderer
Vorgang). Sie bleiben deshalb unangetastet. Das gehört in den Plan, damit
niemand die Behebung „aus Symmetrie" auf sie ausweitet.

---

# E-4 — Ein Verklemmungs-Kreis, der HEUTE schon im Bestand steht

Gefunden beim Nachmessen von Befund F5 der zweiten Runde. **Nicht Teil dieses
Auftrags**, aber zu wertvoll, um in einem Prüfbericht zu versanden.

`auditAppend()` nimmt einen STUDIOWEITEN Advisory-Lock, in jeder Variante:
`core/integritaet.js:65`, `await c.q('SELECT pg_advisory_xact_lock($1)',
[studioId])`. Wird `t` übergeben, liegt er in DERSELBEN Transaktion wie die
fachlichen Locks des Aufrufers.

Damit gibt es in `routes/module.js` zwei Transaktionen mit
GEGENLÄUFIGER Lock-Reihenfolge — beide selbst nachgesehen, beide übergeben
`t` an `auditAppend`:

| Seil-Tagescheck (`:2704`ff) | Eigenständiger Beurteilungs-Nachtrag (`:3126`ff) |
|---|---|
| `:2710` `seilkontrolle:<studio>:<heute>` | `:3140` `nachtrag:<studio>:seilkontrolle` |
| `:2725` `auditAppend(…, t)` → `studioId` | `:3141` → `nachtragUebernehmen()` |
| `:2777` `nachtrag:<studio>:seilkontrolle` | `:997` `auditAppend(…, t)` → `studioId` |

Also: A nimmt `studioId`, dann `nachtrag`. B nimmt `nachtrag`, dann
`studioId`. Laufen beide gleichzeitig im selben Studio, erkennt PostgreSQL
den Kreis und bricht eine der beiden mit `deadlock detected` ab — kein
Hänger, aber eine gescheiterte Absendung am Tablet.

**Wie wahrscheinlich das ist, habe ich NICHT gemessen** — beide Wege müssen
gleichzeitig und im selben Studio laufen, und der Audit-Eintrag bei `:2725`
setzt eine Unterschrift voraus. Es ist ein Kreis, kein beobachteter Vorfall.

**Die Folge für DIESEN Auftrag ist trotzdem eindeutig:** Auf eine ungelöste
Lock-Ordnung eine WEITERE globale Lock-Klasse zu legen, macht einen latenten
Kreis wahrscheinlicher. Beitrag 2 des Plans v3 (der gemeinsame
`mangel:`-Riegel) wird deshalb gestrichen, nicht verfeinert — Begründung
vollständig in PLAN-v4, Abschnitt „Was gestrichen wurde und warum".

Eigener Auftrag, wenn der Betreiber ihn will: eine verbindliche Ordnung
ALLER Advisory-Locks dieses Systems, `auditAppend` eingeschlossen.
