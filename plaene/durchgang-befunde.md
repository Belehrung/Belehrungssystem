# Befunde aus dem risikoorientierten Gesamtdurchgang

Ablageort für `plaene/durchgang-risikoorientiert.md`, Abschnitt 5. Angelegt am
19.09.2026 im selben Zug wie die Regel, die ihn voraussetzt — am 12.09.2026
stand eine solche Regel einen Tag lang ohne Datei da, in der sie hätte erfüllt
werden können.

**Bündel 1 (Geräte-Lebenszyklus) ist gelaufen und VOLLSTÄNDIG nachgemessen:
elf Befunde aus zwei Spuren, alle elf selbst am Quelltext bzw. per Mutation
gemessen. Die Einträge stehen unten.**

## Wie hier eingetragen wird

Ein Befund ist eine **Behauptung**, bis der Haupt-Agent sie selbst gemessen
hat. Deshalb hat jeder Eintrag zwei getrennte Felder: was BEHAUPTET wurde und
was die eigene Messung ergeben hat. Ein Eintrag ohne Messung wird als
**UNGEMESSEN** geführt — nie als offen und nie als behoben. „Null Befunde"
heisst geprüft und sauber; ein abgebrochener Lauf bekommt Striche, keine Null.

Je Eintrag:

| Feld | Inhalt |
|---|---|
| Nr. | fortlaufend, `B<Bündel>-<lfd>` |
| Datum | Tag der Meldung |
| Bündel | Nummer und Name aus dem Durchgangsplan |
| Spur | welche der beiden Prüfspuren |
| Frage | welche der sechs festen Fragen |
| Schwere (gemeldet) | wie der Prüfer sie eingestuft hat — eine Meinung |
| Fundstelle | Datei und Zeile, wie gemeldet |
| Behauptung | wörtlich, was der Prüfer sagt |
| Eigene Messung | WIE gemessen und WAS herauskam, mit Ausgabe |
| Ergebnis | TRÄGT / FÄLLT / TEILWEISE / UNGEMESSEN |
| Schwere (gemessen) | nach eigener Nachmessung — kann in beide Richtungen abweichen |
| Entscheidung | behoben in <PR> / eigenes Papier / bewusst nicht behoben, mit Grund |


## Bündel 1 — Geräte-Lebenszyklus (19.09.2026)

Zwei Spuren über BYTE-IDENTISCHES Material (354.231 gezählte Token), nur die
Frage verschieden. Spur 1 = `gpt-5.6-sol`, Frage „erreichbare Zustände im
Kontrollfluss". Spur 2 = `deepseek-flash`, Frage „ungesicherte Annahmen,
vergessene Geschwisterstellen". **Überschneidung: null.**

Alle Fundstellen liegen im GymDocu-Repo (`/home/user/gymdocu`, Stand
`4c4b729`), sofern nicht anders genannt.

### B1-01 — SOL-1 · FÄLLT

| Feld | Inhalt |
|---|---|
| Spur / Frage | sol · 5 (Mandantentrennung) |
| Schwere gemeldet | **blockierend** |
| Fundstelle | `migrations/0014_*.sql` |
| Behauptung | Migration setzt einen Eintragsnamen ohne `studio_id` — Mandantenleck. |
| Eigene Messung | Migration gelesen. Sie setzt einen systemdefinierten Eintragsnamen für ALLE Studios. |
| Ergebnis | **FÄLLT** |
| Schwere gemessen | keine |
| Entscheidung | Nicht behoben. Die `studio_id`-Pflicht gilt request-bezogenen Abfragen; eine Migration hat weder Request noch Mandanten. Unsere eigene Regel lautet „Migrationen für alle Studios". Beobachtung richtig, Einordnung nicht. |

### B1-02 — SOL-2 · TRÄGT

| Feld | Inhalt |
|---|---|
| Spur / Frage | sol · 4 (abgebrochener Lauf als leerer Bestand) |
| Schwere gemeldet | hoch |
| Fundstelle | `routes/admin/geraete.js:1821` (`ladeBestand`), `:4123` (POST `/geraetewartung/ausstattung`), `:2626` (Brandschutz) |
| Behauptung | `ladeBestand()` verwandelt jeden DB-Fehler in `{}` mit nicht aufzählbarem `fehler=true`; kein Aufrufer prüft das Merkmal, und die Ableitung deaktiviert danach vorhandene Termine. |
| Eigene Messung | (1) `grep "\.fehler\b"` über die Datei: EINZIGER Treffer ist Zeile 1835 — der Kommentar, der das Merkmal EINFÜHRT. Kein Aufrufer liest es. (2) Die Ableitung selbst gerechnet, mit genau dem Fehlerobjekt aus dem `catch`: `Object.entries(...).length = 0`, `geplant = 0`, `unklar = 0`, `alleTerminNamen = 12`, **`weg = 12`, `weg === alleNamen: true`**. Danach `UPDATE wartung_geraete SET aktiv = 0 … name = ANY($2)` über alle zwölf. Antwort bleibt die normale Erfolgsseite. (3) Zweite Fundstelle gegengerechnet: `begehungsAufgaben(voll)` = 24 Zeilen, `begehungsAufgaben({})` = 10 — **14 Vorlagenzeilen** fielen weg und würden von `syncAufgaben(nurVerwaltete)` deaktiviert. |
| Ergebnis | **TRÄGT**, beide Fundstellen |
| Schwere gemessen | **hoch** — ein vorübergehend fehlgeschlagener SELECT baut einen dokumentierten Prüfplan ab und meldet Erfolg. |
| Entscheidung | Bauauftrag. Das `catch` in `ladeBestand()` ist genau die Stelle, an der ein LAUTES Scheitern in ein stilles falsches Ergebnis verwandelt wird (CLAUDE.md, „Wer ein lautes Scheitern … verwandelt"). Ohne das `catch` hätte der äußere `catch` der Route eine saubere Fehlerseite gezeigt. |

### B1-03 — SOL-3 · TRÄGT

| Feld | Inhalt |
|---|---|
| Spur / Frage | sol · 1 (erreichbare Zustände) |
| Schwere gemeldet | hoch |
| Fundstelle | `routes/admin/geraete.js`, POST `/geraetewartung/geraet/neu` |
| Behauptung | `db.one(INSERT … RETURNING id)` und danach eine Schleife `db.run` — beide über den Pool, also je eine bereits committete Anweisung. |
| Eigene Messung | Quelltext gelesen; `db.q`/`db.run` benutzen den Pool (`core/db.js:421-432`), nicht die Transaktionsverbindung. Scheitert die zweite Aufgabenzeile, bleiben Gerät und erste Aufgabe stehen. |
| Ergebnis | **TRÄGT** |
| Schwere gemessen | hoch |
| Entscheidung | Bauauftrag, gemeinsam mit `plaene/befund-datei-vs-commit.md` — dieselbe Klasse (Unwiderrufliches vor bzw. ohne Transaktionsklammer). |

### B1-04 — SOL-4 · TRÄGT (per Mutation gemessen)

| Feld | Inhalt |
|---|---|
| Spur / Frage | sol · 2 (Sollwert aus dem bewachten Zustand) |
| Schwere gemeldet | hoch |
| Fundstelle | `test_feature_pruefbereich_kopf.js:340-351` gegen `routes/admin/geraete.js:4146` |
| Behauptung | Der Test liest `MIN(naechste_faelligkeit)` aus genau den Zeilen, die die Route geschrieben hat, und erwartet, dass die Kopfzeile denselben Wert zeigt. Mutation `faelligAm: plusMonate(heute, t.intervallMonate)` → `faelligAm: heute` bleibt grün. |
| Eigene Messung | **Positivkontrolle zuerst:** unmutiert `EXIT 0, 19 PASS / 0 FAIL` — der Wächter läuft und ist grün, ein Nullbefund heißt also blind, nicht kaputt. **Mutiert** (Mutationsskript mit Zielpfad als Argument, Fundstellen gezählt = 1, `GEGENPROBE-`+`DEFEKT`-Marker gesetzt, `node --check` OK): **`EXIT 0, 19 PASS / 0 FAIL`** — identisch. Zusätzlich die drei anderen Testdateien gemessen, die diese Route anfassen, jede gegen eine FRISCHE Wegwerf-DB: `test_feature_ausstattung.js` 7/0, `test_feature_frist_herkunft.js` 131/0, `test_feature_wartung_geraet_verknuepfung.js` 49/0 — **mit und ohne Mutation identisch.** Rücknahme gegen eine unabhängig angelegte `cp`-Kopie, `diff` EXIT 0, `git status` leer, Marker-Scan über alle vier Arbeitsbäume sauber. |
| Ergebnis | **TRÄGT** |
| Schwere gemessen | hoch |
| Entscheidung | Bauauftrag: erwarteter Fälligkeitstag unabhängig vom gespeicherten Ergebnis bilden (festes Testdatum, eigene Kalendererwartung), erst danach gegen die Kopfzeile halten. |
| **Grenze dieser Messung** | Die VOLLE Suite (rund 340 Dateien) lief mit der Mutation NICHT. „Kein Test irgendwo fängt es" ist damit NICHT gemessen — gemessen ist, dass der benannte Wächter und die drei naheliegendsten Geschwister es nicht fangen. |

### B1-05 — SOL-5 · TRÄGT

| Feld | Inhalt |
|---|---|
| Spur / Frage | sol · 1 (erreichbare Zustände) |
| Schwere gemeldet | hoch |
| Fundstelle | Fristbestätigung, `routes/admin/geraete.js` |
| Behauptung | Der Doppel-Submit-Schutz ist ein ungesichertes SELECT-dann-UPDATE über den Pool; die `WHERE` trägt keine Zustandsbedingung. |
| Eigene Messung | Quelltext gelesen. Der Kommentar verspricht wörtlich Schutz gegen den zweiten Klick („offener Tab, Doppel-Submit … stillschweigend überschreiben"). Keine Transaktion, keine Sperre, `WHERE` ohne `frist_festgelegt_am IS NULL`. Zwei parallele Requests bestehen beide die Prüfung und hängen ZWEI Einträge in die gehashte Audit-Kette. |
| Ergebnis | **TRÄGT** — und der Kommentar macht es schärfer, weil er den Schutz zusichert, den der Code nicht leistet. |
| Schwere gemessen | hoch |
| Entscheidung | Bauauftrag: Zustandsbedingung in die `WHERE`, `rowCount` lesen. |

### B1-06 — SOL-6 · Beobachtung richtig, SCHWERE falsch

| Feld | Inhalt |
|---|---|
| Spur / Frage | sol · 6 (Tests fassen echtes Dateisystem an) |
| Schwere gemeldet | hoch |
| Fundstelle | ein Wächter der Suite |
| Behauptung | Der Wächter fasst das echte Dateisystem an — dieselbe Suite ist auf dem Live-Server Deploy-Gate. |
| Eigene Messung | Er fasst es an, aber umgeleitet auf ein Wegwerf-Verzeichnis unter `os.tmpdir()`; der Dateikopf begründet das über zehn Zeilen. |
| Ergebnis | **TEILWEISE** |
| Schwere gemessen | keine |
| Entscheidung | Bleibt als bewusste, dokumentierte Abweichung stehen. Die Regel zielt auf `pm2`, `nginx`, `/var/www` — ein eigenes Temp-Verzeichnis ist nicht diese Klasse. |

### B1-07 — DS-1 · TRÄGT

| Feld | Inhalt |
|---|---|
| Spur / Frage | deepseek · 4 (Geschwisterstelle vergessen) |
| Schwere gemeldet | mittel |
| Fundstelle | `routes/admin/geraete.js:337` und `:467`, verglichen mit `:699` |
| Behauptung | Drei schreibende Seilkontroll-Routen prüfen ihre `:id` ungleich streng. Nur `/geraete/inbetriebnahme/:id` benutzt `/^\d+$/` + `res.status(400)`; Löschen und Umbenennen benutzen weiter `isNaN(id)` + `res.send()` ohne Status. |
| Eigene Messung | Alle drei Routen gelesen — stimmt wörtlich. Gemessen: `isNaN("1e3") = false`, `isNaN("1.5") = false`, `isNaN("0x10") = false`; alle drei fallen bei `/^\d+$/` durch. Der Kommentar an der Inbetriebnahme-Route (`:688-696`) dokumentiert die Nachbesserung vom 17.09.2026 samt Folge (22P02 → HTTP 200 „Datenbankfehler" statt 400) — an den beiden älteren Geschwisterstellen derselben Datei ist sie nicht nachgezogen. |
| Ergebnis | **TRÄGT** |
| Schwere gemessen | mittel — Falscheingabe erzeugt HTTP 200 mit Fehlerseite und einen Telegram-Alarm über `intern()`. |
| Entscheidung | Bauauftrag, gebündelt mit B1-08. Lehrbuchfall der Hausregel „Wer EINEN Eintrittspunkt absichert, hat nicht die Eintrittspunkte abgesichert." |

### B1-08 — DS-2 · TRÄGT

| Feld | Inhalt |
|---|---|
| Spur / Frage | deepseek · 4 (Geschwisterstelle vergessen) |
| Schwere gemeldet | mittel |
| Fundstelle | `routes/admin/geraete.js:234-235` (POST `/geraete`) und `:467-468` (POST `/geraete/umbenennen/:id`) |
| Behauptung | Beide rufen `.trim()` auf einen `req.body`-Wert VOR dem `try`. Bei Objekt/Array ist `!wert` falsy, `wert.trim` keine Funktion → TypeError außerhalb von `try/catch` → HTTP 500. Die Schwesterdatei fängt genau das mit `pruefeTextfelder()` ab. |
| Eigene Messung | Beide Stellen gelesen — die Prüfung steht wörtlich vor dem `try`. Bodyparser gemessen: `server.js:161` `express.urlencoded({ extended: true })`, also `qs` → Klammernotation liefert ein Objekt. Express-Version gemessen: **5.2.1** — eine abgelehnte Promise aus einem `async`-Handler wird also an den globalen Fehlerbehandler weitergereicht (`server.js:1467`): `errorTracker.melde(err, req)` (Log + gedrosselter Telegram-Alarm) und HTTP 500. `pruefeTextfelder()` in `routes/admin/geraete-typen.js:246` prüft `typeof === 'object'` und antwortet 400. |
| Ergebnis | **TRÄGT** |
| Schwere gemessen | mittel |
| Entscheidung | Bauauftrag, gebündelt mit B1-07 — dieselbe Datei, dieselbe Klasse, verschiedene Wache. |

### B1-09 — DS-3 · TRÄGT

| Feld | Inhalt |
|---|---|
| Spur / Frage | deepseek · 1 (nicht durchgesetzte Invariante) |
| Schwere gemeldet | hoch |
| Fundstelle | `core/seilgeraete.js#seilNamenskollision` gegen `routes/admin/geraete.js:513-516` |
| Behauptung | Anlegen und Umbenennen prüfen denselben Namen ungleich streng. |
| Eigene Messung | Anlegen filtert `COALESCE(aktiv,1)=1` (nur aktive Geräte); Umbenennen prüft OHNE `aktiv`-Filter und zusätzlich gegen vorhandene Prüfhistorie. Ein Gerät unter dem Namen eines GELÖSCHTEN anzulegen geht durch; dorthin umzubenennen wird verweigert. |
| Ergebnis | **TRÄGT** |
| Schwere gemessen | hoch — warum es schadet, steht in unserem eigenen Kommentar auf der Umbenennen-Seite: `geraete_pruefung_detail` hängt am NAMEN, nicht an einer `geraet_id`, und lässt sich nachträglich nicht mehr trennen. |
| Entscheidung | Bauauftrag, gemeinsam mit B1-10 — beide betreffen dieselbe Invariante „höchstens ein aktives Seilgerät je Name". |

### B1-10 — DS-4 · TRÄGT (schärfer als gemeldet)

| Feld | Inhalt |
|---|---|
| Spur / Frage | deepseek · 1 (nicht durchgesetzte Invariante) |
| Schwere gemeldet | mittel |
| Fundstelle | `core/seilgeraete.js:194` gegen `routes/admin/geraete.js:475` |
| Behauptung | Anlege- und Umbenennen-Weg sichern dieselbe Invariante unter VERSCHIEDENEN Sperrschlüsseln ab. **Der Prüfer hat seine eigene Grenze benannt:** `core/seilgeraete.js` lag nicht im Bündel, er konnte die Ungleichheit nicht zweifelsfrei behaupten. |
| Eigene Messung | Genau das nachgeholt. Die Schlüssel unterscheiden sich in BEIDEM — Zeichenkette und Hashfunktion: Anlegen `pg_advisory_xact_lock(hashtextextended('geraet-seilname:<studio>:<name>', 0))`, Umbenennen `pg_advisory_xact_lock(hashtext('seilkontrolle:<studio>:<heute>'))`. Zusätzlich gemessen: **kein `UNIQUE(studio_id, name)` auf `geraete`** — weder in `migrations/*.sql` noch im Schema-Literal (`core/db.js:555`). Unter READ COMMITTED sieht keine der beiden Transaktionen die noch nicht committete Zeile der anderen; beide Kollisionsprüfungen bestehen, beide committen. |
| Ergebnis | **TRÄGT** |
| Schwere gemessen | **mittel bis hoch** — der Zustand ist unwiderruflich (beide Kommentare der Datei sagen das selbst), braucht aber zwei gleichzeitige Admin-Vorgänge im selben Studio. |
| Entscheidung | Bauauftrag mit B1-09. Der billige Weg ist, den Umbenennen-Weg zusätzlich unter den NAMENSSCHLÜSSEL zu stellen (alter UND neuer Name) — Advisory-Locks sind innerhalb derselben Transaktion wiedereintrittsfähig. Vor dem Bau gilt die Transaktions-Regel aus CLAUDE.md: zählen, welche anderen Transaktionen dieselben Zeilen anfassen und in welcher Reihenfolge sie den Audit-Lock nehmen. |

### B1-11 — DS-5 · TRÄGT als Beobachtung, Vorschlag NICHT unsere Entscheidung

| Feld | Inhalt |
|---|---|
| Spur / Frage | deepseek · 2/3 (Name verspricht mehr als die Zusicherung misst) |
| Schwere gemeldet | niedrig |
| Fundstelle | `routes/admin/geraete.js:20` gegen `routes/admin/geraete-typen.js:64` und `test_feature_geraeteseite_typen.js:627-628` |
| Behauptung | Die Schwesterdatei bezieht ihren Escaper aus der einen Quelle und lässt sich das von einem Wächter zusichern; `geraete.js` führt daneben eine zweite Implementierung, für die dieselbe Zusicherung weder eingelöst noch geprüft ist. |
| Eigene Messung | Stimmt. `geraete.js:20` hat `auditEsc` (**162 Verwendungen**), `geraete-typen.js:64` hat `require('../../core/html-escape')`. Der Wächter liest `quelltext` — und `quelltext` ist in Zeile 594 wörtlich `readFileSync('routes/admin/geraete-typen.js')`, er ist also strukturell blind für `geraete.js`. Die beiden Ersetzungen sind zeichengleich (`/[<>&"']/g`, dieselben fünf Abbildungen); ein Funktionsfehler ist es heute nicht. |
| Ergebnis | **TRÄGT** (Beobachtung), **Vorschlag zurückgestellt** |
| Schwere gemessen | niedrig |
| Entscheidung | **Kein Bauauftrag ohne Betreiber-Entscheidung.** Der Kopf von `core/html-escape.js` legt ausdrücklich fest: „Ob die drei bestehenden später hierauf umgestellt werden, ist eine Betreiber-Entscheidung, keine Executer-Entscheidung." DS-5 schlägt genau diese Umstellung vor. Vorgelegt, nicht gebaut. |

## Zählwerk je Bündel

Wird nach jedem Bündel fortgeschrieben, damit aus Anekdoten eine Messung wird.
Bis heute stützt sich alles auf Prüfungen an DIFFS und PLÄNEN — wie ergiebig
ein KALTER Durchgang über Bestandscode ist, hat niemand gemessen.

| Bündel | Token | Befunde Spur 1 | Spur 2 | Überschneidung | getragen | gefallen | ungemessen | Kosten | eigene Messzeit |
|---|---|---|---|---|---|---|---|---|---|
| 1 — Geräte-Lebenszyklus | 354.231 | 6 (sol) | 5 (deepseek) | **0** | **9** | 1 | 0 | **2,52 $** | **~85 min** |

Lesart der Zeile 1: „getragen 9" zählt B1-02 bis B1-05 und B1-07 bis B1-11.
B1-06 ist TEILWEISE (Beobachtung richtig, Schwere falsch) und in keiner der
beiden Zahlen enthalten; B1-01 ist die einzige gefallene.

**Die teuerste Spalte ist die letzte, und sie bestätigt, was seit dem
12.09.2026 gemessen wird: der Engpass ist das eigene Nachmessen, nicht das
Finden.** 2,52 $ für elf Befunde gegen rund 85 Minuten, um sie zu messen —
und die Hochrechnung des Durchgangsplans (15–20 Bündel) bedeutet damit
**20–28 Stunden eigene Messzeit** gegen 38–50 $. Wer die Bündelzahl erhöht,
kauft nicht Geld, sondern Messzeit.

**Zur Trefferquote je Spur, und was sie NICHT hergibt:** sol 4 von 6 voll
getragen, deepseek 5 von 5. Das ist EIN Bündel — genau die Stichprobengrösse,
der diese Datei sonst misstraut. Festhalten lässt sich nur: die 0,08-$-Spur
hat in diesem Bündel nicht weniger Getragenes geliefert als die 2,44-$-Spur,
und der einzige als BLOCKIEREND gemeldete Befund kam von der teuren und fiel.

**Nach Bündel 1 und 2 wird die Hochrechnung aus dem Durchgangsplan (15–20
Bündel, 50–80 $) gegen die tatsächlichen Zahlen gehalten und berichtigt.**
Die Spalte „eigene Messzeit" ist dabei die wichtigste: sie ist der Engpass,
nicht das Geld und nicht das Finden.

## Vergleichszahlen aus den bisherigen Läufen

Damit die Ausbeute des Durchgangs einen Maßstab hat (alles an DIFFS oder
PLÄNEN gemessen, nicht an kaltem Bestandscode):

| Datum | Gegenstand | Befunde | getragen | Überschneidung der Spuren |
|---|---|---|---|---|
| 10.09.2026 | ein Diff (#144), drei Läufe | 12 | 12 | teilweise |
| 12.09.2026 | ein Diff (#167), zwei Spuren | 9 | 7 | teilweise |
| 13.09.2026 | ein Diff, zwei Spuren | 9 | 9 | **null** |
| 15.09.2026 | ein PLAN, zwei Runden | 18 | 18 | — |
| 18.09.2026 | ein Doku-Beitrag (#458), Review-Bot | 3 | 3 | — |
| 19.09.2026 | ein PLAN, zwei Spuren | 11 | 9 | **null** |

---

## Offene Fundorte aus den Planprüfungen zu B1-07/B1-08 (19.09.2026)

Das Auftragspapier `plaene/auftrag-id-wache.md` (Fassung 2) klammert sie
ausdrücklich aus. **Sie stehen hier, damit sie nicht verschwinden** — ein
Fundort, der aufgeschrieben ist, ist besser als ein Wächter, der ihn falsch
zählt.

| Nr. | Fundort | Stand |
|---|---|---|
| U-ID1 | **16 ungemessene `:id`-Routen** in `geraete.js`, `geraete-typen.js`, `ausmusterung.js`, `tablets.js` (26 gezählt, 10 bewacht) | ob ihre `:id` roh an SQL geht: NICHT gemessen |
| U-ID2 | **acht weitere `:id`-Routen** in `routes/admin/mitarbeiter.js`, darunter drei mehrzeilige Expression-Handler (`:947-952`) | NICHT gemessen |
| U-ID3 | **`PG_INTEGER_MAX` in sechs weiteren Dateien** — `qr-bestellung.js`, `qr-druckdaten.js`, `qr.js`, `geraete-hinweisfenster.js`, `module.js`, `sichtpruefung.js` (gemessen: 11 Literale `2147483647` in sieben Dateien unter `routes/`) | jede Zusicherung „steht nicht mehr in `routes/`" wäre unabhängig vom Bau rot |
| U-TX1 | **Zehn `String(req.body…)`-Senken in `geraete.js`** (`:1583`, `:2379`, `:2435`, `:3102`, `:3137`, `:3525`, `:3555`, `:3852`, `:4353`, `:4355`) — koerzieren `[object Object]` bzw. `"a,b"` und SCHREIBEN es | gemessen, Behebung im eigenen Beitrag |
| U-TX2 | **Rohe `.trim()`-Stellen in `geraete.js`**: `:235`, `:469-470`, `:4981-4982`, `:5030-5031` (ganz ohne Guard), `:5441-5445` (vor dem `try` → 500) sowie `:5490-5492`, `:5496` (im `try` → 200 **und halb angelegtes Gerät**) | gemessen |
| U-TX3 | **Dieselbe Klasse in `mitarbeiter.js`**: `:346`, `:347`, `:671`, `:737` (`(req.body.x \|\| '').trim()` — ein Objekt überlebt das `\|\| ''`) und `:808` (vor dem `try`) | gemessen |
| U-TX4 | **Der Scanner-Entwurf für U-TX1/2/3 ist gescheitert** — er sucht `req.body` an der SENKE, aber `aufgaben` ist an `geraete.js:5418` destrukturiert; die Zeile `aufgaben.trim()` enthält kein `req.body`. Braucht Bindungsverfolgung (AST) | Neufassung steht aus |
| U-TX5 | **`typeof === 'object'` fängt Zahlen und Booleans nicht** — `(42).trim()` wirft, `String(42)` schreibt still `"42"`. `express.json()` ist global, CSRF prüft keinen Content-Type | gemessen |

**Berichtigung zu einer eigenen Prämisse:** Die Dringlichkeit dieser Klasse
wurde zweimal mit „der Alarmkanal ist von aussen taktbar" begründet.
**Gemessen an `core/csrf-schutz.js` ist das zu stark:** jeder Nicht-GET mit
fremdem `Origin`/`Referer`-Host bekommt 403, `/admin/…` ist keine Ausnahme.
Erreichbar sind die Routen für jeden angemeldeten Admin und für jeden, der
bereits eine Sitzung hat — nicht für einen fremden Dritten. Der Defekt bleibt
(stille Falschschreibungen, halb angelegte Datensätze), die Einordnung ändert
sich.

### Berichtigung 19.09.2026 — mein Auftrag war falsch, der Ausführende hat es gemessen

**U-ID4 `parseIds()` FÄLLT.** Ich hatte aus einem Gegenlesungs-Befund
(`ausmusterung.js#parseIds` gibt `parseInt(w,10)` unbegrenzt weiter,
`"99999999999"` erreicht int4 → 22003) einen Bauauftrag gemacht: die
int4-Grenze dort nachziehen.

**Der Ausführende hat widersprochen und gemessen.** Selbst am Quelltext
nachgeprüft und bestätigt: der einzige Aufrufer baut bei
`routes/admin/ausmusterung.js:618` ein `erlaubtSet` aus den REAL
existierenden Kandidaten genau dieses Geräts und weist bei `:619-621` jede
eingereichte ID ab, die dort nicht vorkommt — `status: 'fremde_id'` → `:899`
→ **HTTP 400, bevor irgendein UPDATE läuft.** Eine Zahl über der int4-Grenze
kann in `erlaubtSet` gar nicht vorkommen (die Menge stammt aus
DB-Zeilen-IDs). Er hat es zusätzlich zweimal über den echten POST-Weg
gemessen; beide Fälle 400, keiner erreichte SQL.

**Mein Fehler war methodisch, nicht sachlich:** Ich habe einen Befund über
die FUNKTION übernommen, ohne den AUFRUFER zu messen. Genau die Hausregel,
die ich selbst zitiere — „ein Auftrag, der behauptet ‚X verletzt Regel Y
nicht', hat Y nicht geprüft" — nur in die andere Richtung: ein Auftrag, der
behauptet „X erreicht SQL", hat den Weg dorthin nicht geprüft.

Dass er der Vorgabe seines Auftraggebers mit einer Messung widersprochen hat,
ist nach unserer eigenen Rangordnung das wertvollste Ergebnis dieses Bau-Laufs.

### U-MA1 (NEU, vom Ausführenden gefunden, nicht behoben)

Beim Umstellen der Grenzwert-Zusicherungen von negativ auf positiv fiel auf:
**drei Mitarbeiter-Routen (`email`, `pin-direkt`, `umbenennen`) melden lautlos
Erfolg, obwohl ihr UPDATE null Zeilen trifft.** Dieselbe Klasse wie B1-05:
„ein UPDATE, dessen `rowCount` niemand liest, ist ein stiller No-op — und was
danach unbedingt läuft, behauptet etwas, das nie passiert ist."

Ausserhalb des Auftrags, deshalb als Fundort geführt. Gehört zu
`plaene/auftrag-schreibreihenfolge.md`, wo dieselbe Klasse schon zweimal
vorkommt.

---

## Offene Fundorte aus der Planprüfung zu B1-03/B1-05 (Fassung 2, 19.09.2026)

Beide beim eigenen Nachmessen für `plaene/auftrag-schreibreihenfolge.md`
gefunden. Beide fahren ausdrücklich **NICHT** mit diesem Beitrag.

| ID | Fundort | Stand |
|---|---|---|
| U-DEL1 | `routes/belehrungen.js:2299` — `try { fs.unlinkSync(fp); } catch {}` verschluckt ein fehlgeschlagenes `unlink` vollständig. Nach dem S3-Umbau ist das erlaubter Müll (`datei_vorhanden=0` + Datei bleibt liegen), aber **lautlos**: niemand erfährt, dass die Platte volläuft oder Rechte fehlen. | gemessen. Eine Umstellung auf `melde()` wäre eine zweite Verhaltensänderung (Telegram-Alarm für einen Fall, den derselbe Beitrag gerade als „Müll" einstuft) — eigener Beitrag, eigene Abwägung |
| U-SIG1 | **Der Mensch liest ein anderes Dokument, als die Route stempelt.** `GET /vorschau/:id` (`routes/belehrungen.js:726-736`) liest `dateiname` in einem EIGENEN Request; der Unterschriftenweg liest ihn erneut bei `:798` und stempelt bei `:861` genau diese Datei. Wird dazwischen eine neue Version hochgeladen, hat der Mensch A gesehen und unterschrieben wird B. | gemessen. **Vorbestehend** — weder die heutige Reihenfolge noch die geplante Transaktion schliesst dieses Fenster. Eine Behebung bräuchte eine Generations- oder Prüfsummenangabe, die der Client vom Vorschau-Request bis zur Unterschrift mitführt — eigener Beitrag |

**Gemessene Negativaussage, die dazugehört** (sonst liest sich U-SIG1 grösser,
als es ist): Von den sieben Lesern von `belehrung_freischaltung`
(`routes/admin/dashboard.js:71/216/224`, `routes/belehrungen.js:711/794/963`,
`routes/admin/mitarbeiter.js:883`) liest **keiner im selben Vorgang auch
`dateiname`**. Innerhalb EINES Requests gilt die Lesereihenfolge des
Unterschriftenwegs also ausnahmslos; das Fenster von U-SIG1 liegt ZWISCHEN
Requests, nicht in einem.

---

## Offener Fundort aus der Diffprüfung zu Beitrag B (20.09.2026)

| ID | Fundort | Stand |
|---|---|---|
| U-NOOP1 | **Ein Test, der nichts ausführt, meldet sich als bestanden.** `test/run.sh:884` ruft `if out=$(node "$t" 2>&1); then …` — gewertet wird NUR der Exit-Code, und die Ausgabe wird mit `tail -1` auf eine Zeile eingedampft. Eine Datei, die gar keine Zusicherung fährt, endet mit Exit 0 und erscheint als grün, mit leerer Ergebniszeile. **Gemessen: neun Testdateien benutzen bereits `require.main === module`** (mit Beitrag B zehn) — bei jeder davon genügte eine Änderung daran, wie die Suite ihre Tests startet, um sie lautlos stillzulegen. Ein Wächter gegen eine FEHLENDE Summenzeile existiert nicht (gesucht, keiner gefunden). | gemessen. **KEIN Regress von Beitrag B** — das Muster ist Hausbestand, der Beitrag ist der zehnte Fall. Behebung wäre ein Wächter, der je registrierter Datei eine `N PASS / M FAIL`-Zeile im Log verlangt: eine Referenz von AUSSEN auf die Ausführung statt auf den Exit-Code. Eigener Beitrag |

**Wie dieser Fundort entstanden ist, gehört dazu:** Ich hatte ihn zuerst als
Befund GEGEN Beitrag B notiert (er führt das Muster in einer bestehenden
Deploy-Gate-Datei ein). Die eigene Nachmessung — `grep -rln "require.main ===
module" test_*.js | wc -l` → **9** — hat die Schwere gekippt: wer ein
etabliertes Hausmuster als Regress eines einzelnen Beitrags meldet, misst die
Gewohnheit statt der Änderung. Die zugrundeliegende Lücke ist trotzdem echt
und deshalb hier.

---

## Offene Fundorte aus der Diffprüfung zu Beitrag C (20.09.2026)

Alle unten sind nachgemessen und fahren **NICHT** mit Beitrag C. Der Grund
steht jeweils dabei; „aus Zeitgründen" ist keiner.

| ID | Fundort | Stand |
|---|---|---|
| U-LOCK1 | **Der studioweite Advisory-Lock wird jetzt über eine blockierende Anweisung gehalten.** `routes/belehrungen.js:2212` nimmt ihn als ERSTE Anweisung, danach kann das `UPDATE belehrungen` auf einer Zeilensperre warten — und währenddessen blockiert JEDER `auditAppend` desselben Studios (jede Unterschrift, jede Gerätewartung, jede Sichtprüfung), weil `core/integritaet.js:65` denselben Schlüssel nimmt. Unter Autocommit war der Radius eine Zeile, jetzt ist er der ganze Mandant. | gemessen am Aufbau, **nicht am Betrieb**. Die Lock-Reihenfolge ist trotzdem richtig gewählt: sie umzudrehen löst das Problem nicht, sondern verschiebt es. Brauchbare Mittel wären ein `lock_timeout` auf dieser Transaktion oder das Herausnehmen des `INSERT … SELECT` aus dem Lock-Bereich — beides eigene Abwägungen mit eigener Messung |
| U-S3ERR | **Neuer schlechter Fehlerweg in `/loeschen/:id`.** Das `UPDATE datei_vorhanden=0` ist committet, wenn die nachfolgende COUNT-Abfrage wirft: der Admin sieht eine Fehlerseite, der Eintrag ist aber schon aus der aktiven Liste verschwunden. Vor dem Beitrag blieb bei demselben Fehler alles stehen und der Versuch war wiederholbar. | gemessen am Kontrollfluss. **Kein Datenverlust** — die einseitige Invariante (`datei_vorhanden=0` + Datei liegt noch) ist ausdrücklich erlaubt. Es ist eine irreführende Rückmeldung. Die von beiden Prüfspuren vorgeschlagene Behebung (Transaktion um UPDATE und COUNT) braucht dieselbe Lock-Ordnungsanalyse wie S2 |
| U-VORL1 | **`vorlage-${key}-${Date.now()}.pdf` (`routes/belehrungen.js:2330`) hat keinen Zufallsanteil** — anders als der Upload-Pfad, der dafür `crypto.randomBytes(6)` bekam. Zwei Studios, die dieselbe Vorlage in derselben Millisekunde übernehmen, kollidieren by construction; `fs.copyFileSync` überschreibt dabei. Dazu das vorbestehende Fenster zwischen `COUNT` und `unlink` in `/loeschen/:id`. | gemessen (`grep` auf die Zeile). **Vorbestehend** — die Teilbehauptung, der Diff verbreitere das Fenster, ist nachgemessen FALSCH (der Abstand COUNT→unlink ist unverändert) |
| U-AUD1 | **`/loeschen/:id` schreibt gar keinen Audit-Eintrag** — anders als `/neue-version` und `/freischalten-alle`. Eine unwiderrufliche Dateilöschung ist damit nirgends protokolliert, und ein fehlgeschlagenes `unlink` (`try { … } catch {}`) ist von einem erfolgreichen nicht unterscheidbar. | gemessen. Vorbestehend; durch die Umstellung ist die Löschung jetzt der LETZTE, völlig ungesicherte Schritt der Route |
| U-STAT1 | **`/loeschen/:id` antwortet im Fehlerfall HTTP 200** (`res.send` ohne `.status`). Die Schwesterroute `/neue-version/:id` wurde in der Upload-Härtung bereits auf 500 korrigiert. Der neue Test dokumentiert es und umgeht es, indem er auf `class="error"` im Rumpf prüft. | gemessen. Vorbestehend; eine Änderung wäre ein neuer HTTP-Vertrag und gehört in einen eigenen Beitrag |
| U-REAP1 | **Kein Reaper für `BELEHRUNGEN_UPLOAD_DIR`.** `core/retention.js` kennt vier Löschwurzeln (`PDF_ROOT`, `DOKUMENTE_DIR`, `EINWEISUNG_NACHWEIS_DIR`, `PRUEFBERICHT_DIR`) — diese ist keine. Verwaiste Uploads sind heute nur von Hand aufräumbar. | gemessen. Erst durch N1 überhaupt aufgefallen: der Kommentar nennt verwaiste Dateien „aufräumbar" und behauptet damit einen Mechanismus, den es nicht gibt |
| U-IDW1 | **`routes/belehrungen.js` hat keine ID-Wache.** 0 Treffer für `istGueltigeId`; die zentrale Prüfung aus #461 deckt sechs andere Routendateien ab. `POST /admin/belehrungen/loeschen/12abc` erreicht über `parseInt` den Datensatz 12 und löscht ihn. | gemessen. Dieselbe Klasse wie S4b in Beitrag B, dort behoben. Vorbestehend, ausserhalb des Schnitts von Beitrag C |
| U-Z2C1 | **Der Wettlauftest bewacht die Schreibreihenfolge nicht.** Der Ausführende hat es selbst gemeldet: die vertauschte Reihenfolge blieb ZWEIMAL grün, erst eine gestaffelte Einmalprobe ausserhalb der Suite zeigt den Fehler. Eigene Messung daneben: den Advisory-Lock hinter das UPDATE zu verschieben lässt die ganze Suite grün. | gemessen. N5 schliesst den Lock-Teil STATISCH (Positionszusicherung im Inventar-Wächter). Der Reihenfolge-Teil braucht eine deterministische Staffelung ohne Zeitschwelle — eigener Beitrag |

## Drei weitere aus der PLANPRÜFUNG des Nacharbeits-Papiers (20.09.2026)

Diese drei hat erst die Prüfung des BEHEBUNGSPLANS gefunden — nicht die
Prüfung des Diffs. Sie sind der Beleg dafür, warum das Papier vor der
Bau-Runde rausgeht.

| ID | Fundort | Stand |
|---|---|---|
| U-GEN1 | **`belehrung_freischaltung.freigeschaltet_am` ist zugleich Anzeigezeit UND Generationstoken.** `routes/belehrungen.js:963` löscht die verbrauchte Freischaltung mit `AND freigeschaltet_am = $4` — das ist der Schutz dagegen, dass eine zwischenzeitlich neu angeforderte Pflicht mitgelöscht wird. Zwei Schreibformen stehen in der Spalte: DEFAULT (`to_char`, **Sekundenauflösung**) und `ON CONFLICT … CURRENT_TIMESTAMP` (Mikrosekunden). | gemessen. **Meine eigene geplante Behebung (N4) hätte beide auf Sekundenauflösung vereinheitlicht** — und damit eine mikrosekunden-unwahrscheinliche Kollision in eine sekundenwahrscheinliche verwandelt, also genau das Rennen wieder geöffnet, das der Vergleich schliesst. N4 ist deshalb GESTRICHEN. Saubere Lösung: eigene Generation (BIGINT hochzählen oder UUID) für den Vergleich, `clock_timestamp()` für die Anzeige |
| U-TS1 | **`freigeschaltet_am` kann seit Beitrag C RÜCKWÄRTS springen.** `CURRENT_TIMESTAMP`/`now()` ist auf den TRANSAKTIONSBEGINN eingefroren. Die neue Transaktion beginnt vor der Wartezeit am Studio-Advisory-Lock; ein später ausgeführter Autocommit-Weg (`/freischalten`, `:2053`) schreibt einen NEUEREN Wert, den unser `ON CONFLICT` nach der Freigabe mit dem ÄLTEREN überschreibt. | gemessen am Aufbau (`core/db.js:457`, `BEGIN` vor dem Callback), **nicht am Betrieb**. NEU durch diesen Beitrag: vorher war `schalteAlleFrei` eine eigene Autocommit-Anweisung, deren `CURRENT_TIMESTAMP` ihrem eigenen Zeitpunkt entsprach. Behebung gehört mit U-GEN1 zusammen |
| U-AUDT1 | **Ein lexikalischer Wächter kann die `auditAppend`-ohne-`t`-Klasse nicht schliessen.** Wird der Aufruf in eine ausserhalb des `db.tx`-Rumpfs definierte Hilfsfunktion verschoben, ist lexikalisch nichts mehr im Callback — zur Laufzeit öffnet `core/integritaet.js` trotzdem eine zweite Poolverbindung auf denselben Advisory-Key und hängt unauffindbar. | gemessen: **53 Callbacks heissen `t`, einer `tx`** — ein Wächter auf das Literal hätte schon heute einen Fehlalarm. N6 wird deshalb ENG gebaut (die beiden Blöcke in `routes/belehrungen.js`, gebunden an den tatsächlichen Parameternamen) und nennt seine Grenze in der Beschriftung. Die repoweite Fassung braucht AST, Aliasauflösung und ein Inventar der aus Transaktionen gerufenen Audit-Helfer — eigener Beitrag |
