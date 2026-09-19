# Planprüfung Runde 3 über `auftrag-id-wache.md` und `auftrag-textfeld-wache.md`

19.09.2026, beide Spuren, verschiedene Fragen. **29 Befunde** (sol 13, deepseek 16),
Urteil von Spur 1: *„Nicht baureif. **Der Inventar-Ansatz ist sinnvoll**, aber
beide Papiere enthalten blockierende Erfassungs- und Abnahmefehler."*

| | Spur 1 (`sol`, Repo-Zugriff) | Spur 2 (`deepseek-flash`, statisch) |
|---|---|---|
| Befunde | 13 (9 blockierend) | 16 (2 blockierend) |
| Verbrauch | 2.315.434 rein / 38.490 raus, 21 Runden, 86 Suchen, 39 Lesungen | 19.9k rein / ~39k raus, 189 s |
| Kosten | **12,73 $** | **~0,04 $** |

## Die fünf, die den Entwurf tragen oder kippen — selbst nachgemessen

### R3-1 (beide Spuren) — Der Scanner sieht seine EIGENEN Paradebeispiele nicht

Beide Papiere lassen den Wächter nach `req.body` bzw. `:id` suchen.
**Gemessen:**

* `routes/admin/geraete.js:5418` destrukturiert:
  `let { kategorie_id, name, …, aufgaben, … } = req.body;`
  **Das Flaggschiff-Beispiel `aufgaben.trim()` (`:5496`) enthält `req.body`
  überhaupt nicht.** Dasselbe für `name` an `:5441`, `:4981`, `:5030`, `:235`.
* `routes/tablet-sperre.js:546` ist `parseInt(req.body.mitarbeiter_id, 10)` —
  eine **Body-ID, keine `:id`-Route.** Ein Inventar über Routenpfade sieht
  diesen Eintrittspunkt nie, auch wenn die Datei in der Dateiliste steht.

**TRÄGT, und es kippt den Entwurf.** Eine Textsuche nach `req.body` an der
SENKE beantwortet eine Frage nach dem DATENFLUSS — genau das, wovor die
Hausregel warnt. Der Wächter bräuchte Bindungsverfolgung (AST), nicht ein
Muster. Das ist ein eigener Beitrag, kein Nebensatz in diesem.

### R3-2 (deepseek) — Der Anker misst die ANWESENHEIT des Bezeichners, nicht die Wirkung

`1.4` verlangt „ein Aufruf von `istGueltigeId` im Rumpf". `if (false &&
!istGueltigeId(id))` lässt den Bezeichner stehen. **Genau die Mutation, gegen
die der Wächter gebaut werden sollte, überlebt ihn.**

**TRÄGT, mit Einschränkung:** Z1 fährt dieselbe Mutation über HTTP und würde
sie fangen — aber nur für die zwölf gebauten Routen, nicht für die sechzehn
Ausnahmen. Der INVENTAR-Teil misst die Verdrahtung nicht.

### R3-3 (sol) — `ID_MAX steht an EINEM Ort` ist schon heute falsch

**Gemessen:** `grep -rn "2147483647" routes/` → **11 Treffer in sieben
Dateien** (`geraete.js`, `qr-bestellung.js`, `qr-druckdaten.js`, `qr.js`,
`geraete-hinweisfenster.js`, `module.js`, `sichtpruefung.js`; die anderen
heissen `PG_INTEGER_MAX`). Mein Z3 („`grep` findet den Literalwert in
`routes/` nicht mehr") wäre **unabhängig vom Bau rot**.

**TRÄGT.** Die ehrliche Fassung: `geraete.js` bindet an die Quelle, die
übrigen sechs Dateien behalten ihre eigene Konstante und werden NAMENTLICH als
offener Punkt geführt.

### R3-4 (deepseek) — Die Begründung des Auftrags ist ZU STARK

„Der Alarmkanal ist von aussen taktbar." **Gemessen an `core/csrf-schutz.js`:**
jeder Nicht-GET ohne `Origin`/`Referer`-Host gleich `req.headers.host` wird mit
**403** abgewiesen, und `/admin/…` steht nicht in `AUSNAHME_PREFIX`
(`/api`, `/intern`, `/d/`, `/v/`).

**TRÄGT.** Ein fremder Dritter erreicht diese Routen nicht. Erreichbar sind
sie für **jeden angemeldeten Admin** (auch versehentlich, über eine
vertippte URL) und für jeden, der bereits eine Sitzung hat.

**Was der Befund NICHT hergibt:** dass der Defekt keiner ist. Die stillen
Schreibfehler (`"[object Object]"` als Gerätename) sind ein
Datenintegritätsproblem unabhängig davon, wer sie auslöst, und ein halb
angelegtes Gerät bleibt ein halb angelegtes Gerät. **Die Dringlichkeits-
Begründung wird berichtigt, der Auftrag bleibt.**

### R3-5 (sol) — `git ls-files` im Wächter: Beobachtung richtig, SCHWERE falsch

Als blockierend gemeldet („startet einen echten Kindprozess, die Suite ist
Deploy-Gate"). **Gemessen:** `test/helfer/quelltext-scan.js` tut das seit
Wochen, ausdrücklich als „Referenz von AUSSEN" dokumentiert, und **acht
Wächter hängen daran**. Es ist etablierte, begründete Praxis, keine neue
Verletzung.

**Ergebnis: TEILWEISE.** Der brauchbare Kern des Befunds ist ein anderer: ich
hätte einen ZWEITEN git-Aufruf gebaut, statt den vorhandenen Helfer zu
benutzen — „dieselbe Aussage an zwei Orten". Das wird übernommen.

## Die übrigen 24

Alle gelesen, die meisten am Quelltext oder am Papier nachprüfbar und
zutreffend: die Routenzahl stimmt nur für vier der sechs genannten Dateien
(mit `mitarbeiter.js` sind es 34, nicht 26); `mitarbeiter.js:947-952` sind
mehrzeilige Expression-Handler, an denen eine Handler-Erkennung scheitert, die
Blockrümpfe erwartet; die Ausnahmeliste hat nur eine Ratsche nach OBEN, nichts
misst, dass sie schrumpft; „zwölf Stellen" in Z1 ergibt sich aus keiner
nachvollziehbaren Zählweise; `geraete.js:708` ist entgegen meinem Satz NICHT
die einzige `typeof`-Wache der Datei (das steht zwei Abschnitte weiter oben im
selben Papier); der Verweis auf `:5496` ist nicht bilateral, sondern
**trilateral** (beide neuen Papiere UND `auftrag-schreibreihenfolge.md`).

---

# WAS DARAUS FOLGT — der Entwurf wird KLEINER, nicht wieder größer

**Drei Runden, 63 getragene Befunde, immer noch nicht baureif.** Das ist ein
Ergebnis über den ENTWURF, nicht nur über die Papiere: die gemessenen Defekte
sind klein und lokal, die 63 Befunde hängen fast alle am AUSBAU (kanonische
Quelle, Inventar-Wächter, Ausnahmeliste, ID_MAX-Zentralisierung).

Nach der Hausregel „lieber ein Bündel weniger als zwanzig ungemessene Befunde"
ist die Antwort **nicht** eine vierte Entwurfsrunde, sondern ein kleinerer
Beitrag:

**`plaene/auftrag-id-wache.md` Fassung 2 baut nur noch, was gemessen defekt
ist**, mit Zusicherungen, die fallen können:

* `core/eingabe-pruefung.js` mit `istGueltigeId` (Ziffern **und** int4).
* Die vier bestehenden, heute identischen `istGueltigeId`-Kopien binden.
* `geraete.js:337` und `:467` nachziehen (gemessen: `isNaN` lässt `1e3`,
  `1.5`, `0x10` durch).
* Die fünf `parseInt`-Stellen nachziehen (gemessen:
  `parseInt("2147483648",10)` ist nicht `NaN` und erreicht SQL).
* HTTP-Fälle für **genau diese elf Eintrittspunkte**, je einzeln, mit den
  Mutations-Gegenproben.

**NICHT in diesem Beitrag:** der Inventar-Wächter (braucht Bindungsverfolgung,
eigener Beitrag), die Textfeldregel (eigener Beitrag, und ihr Scanner hat
dasselbe Datenflussproblem), die ID_MAX-Zentralisierung über `geraete.js`
hinaus (sechs weitere Dateien, eigener offener Punkt).

**Die Erfassungslücke wird dabei nicht versteckt, sondern AUFGESCHRIEBEN:** die
sechzehn ungemessenen `:id`-Routen, die acht weiteren in `mitarbeiter.js`, die
Body-IDs und die sechs `PG_INTEGER_MAX`-Dateien stehen als offene Punkte in
`plaene/durchgang-befunde.md`. Ein Fundort, der aufgeschrieben ist, ist besser
als ein Wächter, der ihn falsch zählt.
