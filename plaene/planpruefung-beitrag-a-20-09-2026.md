# Planprüfung Beitrag A (S5) — drei Spuren, VERSCHIEDENE Bündel

**20.09.2026.** Erster Lauf nach der Betreiber-Entscheidung vom selben Tag:
jede Lesespur bekommt ein ANDERES Bündel, Frage und Vorspann bleiben gleich.
Geprüft wird das AUFTRAGSPAPIER (`plaene/auftrag-beitrag-a-s5.md`), nicht
fertiger Code — der Bau hat noch nicht begonnen.

| Spur | Modell | Bündel | Bytes | Token (gesch.) |
|---|---|---|---|---|
| **eng** | `gpt-5.6-sol` | Papier + `routes/admin/mitarbeiter.js` | 74.475 | ~20.100 |
| **umkreis** | `kimi-k3` | + `routes/mitarbeiter-auth.js`, `core/ui-feedback.js`, `core/db.js` | 259.640 | ~70.000 |
| **tests** | `deepseek-v4-pro` | + die fünf Prüfdateien, die der Beitrag anfasst | 156.704 | ~42.200 |

Frage in Zustandsform („welchen Zustand erzeugt dieser Plan, den es heute
nicht gibt?"), dazu ausdrücklich die Gegenrichtung („was wird durch diese
Behebung SCHLECHTER?") und je Zusicherung die Ein-Zeilen-Mutation.

**Zwei Betriebsbefunde am eigenen Aufbau, beide gemessen:**

1. **Der Geheimnis-Riegel hat angeschlagen** — `core/db.js` enthält in zwei
   Hilfetexten eine Verbindungszeichenfolge mit Platzhalter-Passwort
   (`:71`, `:334`). Nicht abgeschaltet, sondern über `entferneGeheimnisse()`
   geschwärzt (2 Zeilen von rund 3.900, weit unter beiden eingebauten
   Deckeln) und danach ERNEUT geprüft. Das ist zugleich die Positivkontrolle:
   der Riegel kann anschlagen.
2. **Der erste DeepSeek-Lauf lieferte NULL Zeichen** — `finish_reason:
   length`, 16.000 von 16.000 Ausgabe-Token gingen ins Nachdenken
   (`reasoning_tokens: 16000`). Genau die Klasse aus der CLAUDE.md: wer nur
   den Text ausliest, meldet „keine Befunde" und meint „niemand hat geprüft".
   Wiederholt mit `max_tokens: 64000`.

---

## Spur „eng" (`gpt-5.6-sol`) — 8 Befunde

Nachmessung durch den Haupt-Agenten, jeder Befund einzeln. **Reihenfolge wie
geliefert; die Bewertung ist meine, nicht seine.**

### E1 „Z5a-2 löscht eine echte Zeile im Live-Deploy-Gate" — **FÄLLT als
blockierend, zwei Teilpunkte tragen**

Die Prämisse ist gemessen falsch. `core/db.js:323` lässt einen Nicht-Produktiv-
Einstieg nur gegen eine Datenbank zu, deren Name auf `_test` oder `_e2e`
endet; sonst wirft die TEST-SICHERHEITSSPERRE (`:325-340`). `test/run.sh`
legt `gymdocu_test` frisch an (`:325-330`) und wirft sie am Ende weg
(`:967`). Eine Testlöschung kann die Live-Datenbank nicht erreichen. Ausserdem
ist die Klasse im Bestand längst üblich: `test_feature_id_wache_route.js`
legt eigene Mitarbeiterzeilen an und ruft `POST /mitarbeiter/loeschen/:id`
gegen sie auf (`:392-405`).

**Was trägt und ins Papier gehört:** (a) die Löschabfrage des Tests trägt
`studio_id` — Unverhandelbare Tatsache 1, und mein Papier hat sie nicht
vorgeschrieben; (b) gelöscht wird ausschliesslich eine im SELBEN Lauf
angelegte Zeile. Beides kostet je eine Zeile im Papier.

### E2 „‚Für email und umbenennen genügt Z5a-1' ist logisch falsch" — **TRÄGT**

Das Papier weist zwei Absätze weiter oben selbst nach, dass Z5a-1 beim
Entfernen NUR eines Riegels grün bleibt. Damit kann in zwei von drei Routen
der `rowCount`-Riegel einzeilig entfallen, ohne dass irgendeine Pflichtprüfung
rot wird. **Mein eigener Satz widerspricht meiner eigenen Messung im selben
Papier.** Folge: Z5a-2 wird für alle drei Routen gebaut.

### E3 „Riegel A nimmt eine heute vorhandene Aufräumchance weg" — **TRÄGT,
und es widerlegt meine Begründung zu E-2**

Heute läuft bei `ma === null` die Route WEITER: bcrypt, PIN-UPDATE (0 Zeilen),
und dann `:762`, das offene Tokens des Mitarbeiters auf `verwendet=1` setzt.
War die Mitarbeiterzeile vorher gelöscht und hat der verschluckte
Token-DELETE der Löschroute (`:889`, `try {} catch {}` ausserhalb der
Transaktion) versagt, räumt `:762` das verwaiste Token heute nebenbei ab.
Mit Riegel A entfällt genau das.
Mein Satz „bei einer nie vergebenen ID gibt es nichts aufzuräumen" gilt für
NIE VERGEBENE IDs und eben nicht für BEREITS GELÖSCHTE — E-2 behandelt zwei
nur zeitlich verschiedene Löschrennen widersprüchlich.
**Behebung, die beide Eigenschaften hält:** im `!ma`-Zweig dieselbe
Token-Entwertung ausführen und ERST DANN zurückkehren. bcrypt bleibt
übersprungen, die Aufräumung bleibt erhalten.

### E4 „Ein-Zeilen-Mutationen je Zusicherung" — **TRÄGT in vier von fünf
Punkten**

* **Z5a-1**: bestätigt, was das Papier selbst schon sagt (kein neuer Fund).
* **Z5a-1b**: `const ma = (await db.one(...)) || {};` lässt den `!ma`-Ausstieg
  lexikalisch stehen und nie greifen. **Die statische Zusicherung ist damit
  wertlos.** Ersatz: VERHALTEN messen — bei nie vergebener ID darf
  `bcrypt.hash` NICHT aufgerufen werden (die Route holt bcrypt erst im
  Handler über `require`, ein Zähler auf dem Modulobjekt greift also).
* **Z5a-2**: `if (!r.rowCount)` → `if (true)` bleibt grün, solange nur der
  Negativfall läuft. **Positivkontrolle im selben Lauf ist Pflicht** (echte ID
  → Erfolg).
* **Z5b**: Der Fehlercode im rowCount-Zweig lässt sich vertauschen, ohne dass
  die GET-Prüfung der Katalogeinträge rot wird. Z5a-2 muss den EXAKTEN Code je
  Route zusichern.
* **Z5c**: Ein Audit-Eintrag unter anderem Namen bliebe grün. Die Überschrift
  („NICHTS protokolliert") ist weiter als die Zusicherung — sie wird auf „kein
  Erfolgs-Audit für diese ID" verengt.

### E5 „`email_fehler` bekommt einen zweiten Grund und maskiert die ID-Wache"
— **TRÄGT in der Klasse; der vorgeschlagene Mechanismus NICHT**

Der Mechanismus, den sol nennt (DB-Stub liefert null), existiert hier nicht:
**gemessen, keine der fünf Prüfdateien stubbt `db.one` oder `db.run`** — sie
laufen gegen echtes PostgreSQL (`core/db`, `runMigrations`); gestubbt wird
ausschliesslich der Mailer und ein Audit-Wurf.
Die KLASSE trägt trotzdem, und sie ist die aus der CLAUDE.md: derselbe
Rückmeldecode aus einem NEUEN Grund. Nach dem Umbau liefert die E-Mail-Route
`email_fehler` aus drei Gründen statt einem. Die bestehende Zusicherung prüft
nur den Code.
**Noch NICHT gemessen** (steht aus, s.u.): ob das Entfernen der
`istGueltigeId`-Wache die Zusicherung wirklich grün lässt. Vorüberlegung am
Quelltext: für `1e3`/`1.5`/`0x10`/`0` liefe sie auf `parseInt` → 1 bzw. 0 und
bliebe grün, für `2147483648` erzwingt der int4-Überlauf einen PG-Fehler und
damit ROT. Die Zusicherung würde also fallen — aber aus einem Zufall
(Überlauf), nicht aus dem Riegel. Das ist zu MESSEN, nicht zu behaupten.

### E6 „DB-Stubs könnten `rowCount` nicht liefern" — **FÄLLT**

Gemessen: keine der fünf Dateien stubbt `db.run`. `db.run` gibt immer
`pool.query()` zurück (`core/db.js:431-433`), also ein vollständiges
pg-Ergebnis mit `rowCount`. sol hat die Unsicherheit korrekt benannt („die
Testdateien fehlen im Material") — das ist die BLINDE STELLE dieses Bündels,
nicht ein Fehler des Papiers.

### E7 „Z5c braucht eine Positivkontrolle für den Audit-Zugriff" — **TRÄGT**

Eine leere oder falsch parametrierte Audit-Abfrage wäre grün und hiesse
„nicht geprüft". Gegenmittel wie vorgeschlagen: die Abfrage absichtlich auf
die falsche ID richten und rot werden lassen.

### E8 „Die drei Zeilennummern sind aus diesem Bündel nicht prüfbar" — **kein
Befund gegen das Papier, sondern der gewollte blinde Fleck**

`test_feature_id_wache_route.js` lag der Spur „tests" vor, nicht dieser. Genau
dafür sind verschiedene Bündel da. sol hat die Grenze korrekt benannt, statt
zu raten — das ist das gewünschte Verhalten, nicht ein Fund.

---

## Spur „tests" (`deepseek-v4-pro`) — 4 Befunde

324 s, 49.145 Eingabe- / 18.253 Ausgabe-Token (davon 16.545 Nachdenken).

### T1 „Bei identischem Wert liefert das UPDATE `rowCount = 0`" — **FÄLLT,
gemessen**

Das ist **MySQL-Semantik**, nicht PostgreSQL. Gemessen an einer
Wegwerf-Datenbank, vier Fälle einzeln:

    UPDATE t SET email='a@b.de' WHERE id=1   -- Wert IDENTISCH   -> UPDATE 1
    UPDATE t SET email='c@d.de' WHERE id=1   -- Wert GEAENDERT   -> UPDATE 1
    UPDATE t SET email='x@y.de' WHERE id=999 -- Zeile FEHLT      -> UPDATE 0
    UPDATE t SET email=NULL     WHERE id=1   -- NULL auf NULL    -> UPDATE 1

`rowCount` ist in PostgreSQL die Zahl der GETROFFENEN Zeilen, nicht der
GEÄNDERTEN. Der behauptete Falsch-Rot-Fall existiert nicht. **Der Befund war
als blockierend eingestuft** — eine Schwereeinstufung ist eben in beide
Richtungen eine Behauptung, bis sie gemessen ist.

**Was aus ihm TROTZDEM übernommen wird:** seine eigene Nachmess-Anweisung ist
eine sinnvolle Zusicherung, die es heute nicht gibt — speichert der Admin
denselben Wert erneut, muss weiterhin der ERFOLGScode kommen. Kostet eine
Zeile je Route und schliesst zugleich T4.

### T2 „Z5a-1 kann eine alleinige Regression von Riegel A nicht melden" —
**TRÄGT, und zusammen mit T3 ändert es den ENTWURF**

Deckungsgleich mit E4 (Spur „eng"), aber mit einem Zusatz, den sol nicht
hatte: Z5a-1b gibt es NUR für `pin-direkt`; in `email` und `umbenennen` steht
Riegel A ohne jede eigene Zusicherung da.

**Daraus folgt etwas Besseres als eine weitere Zusicherung: in `email` und
`umbenennen` ist Riegel A ÜBERFLÜSSIG.** Er spart dort nichts (kein bcrypt),
und Riegel B allein liefert für eine nie vergebene ID dasselbe Ergebnis. Fällt
Riegel A dort weg, hat jede Route genau so viele Riegel, wie sich einzeln
messen lassen:

| Route | Riegel | wird bewacht durch |
|---|---|---|
| `email` | nur B (`rowCount`) | Z5a-1 — entfernt man B, wird sie ROT |
| `umbenennen` | nur B | dito |
| `pin-direkt` | A (spart bcrypt) **und** B | A durch Z5a-1b (Verhalten), B durch Z5a-2 |

Damit lösen sich E2, E4-Punkt-1, T2 und T3 gemeinsam auf — nicht durch mehr
Prüfungen, sondern durch weniger Code.

### T3 „Riegel B in `email`/`umbenennen` ist unbewacht" — **TRÄGT, durch
dieselbe Änderung erledigt**

Mit nur einem Riegel je Route ist Z5a-1 die Gegenprobe für genau diesen
Riegel. Z5a-2 (Löschrennen) wird trotzdem für alle drei Routen gebaut — der
Aufbau ist geteilt, der Mehraufwand gering, und er bewacht einen Fall, den
Z5a-1 strukturell nicht erreichen kann.

### T4 „Die bestehenden No-Op-Gegenproben prüfen nur Status 302" — **TRÄGT
als Lücke, nicht als Folge des Plans**

Gemessen am Quelltext: `test_feature_audit_mitarbeiter.js:197` und `:221`
schicken denselben Wert erneut und prüfen die Audit-Anzahl; den
Rückmeldecode prüft dort niemand. Das ist unabhängig von diesem Beitrag eine
Lücke. Sie wird mit der Zusicherung aus T1 geschlossen.

---

## Spur „umkreis" (`kimi-k3`) — erster Lauf ABGEBROCHEN, Wiederholung läuft

**Kein „keine Befunde", sondern „niemand hat geprüft".** `status:
incomplete`, `reason: max_output_tokens`: **44.997 von 45.000 Ausgabe-Token
gingen ins Nachdenken, für die Antwort blieben drei.** 1310 s Laufzeit.

Gemessen und für die CLAUDE.md brauchbar: **`kimi-k3` mit `reasoning.effort:
xhigh` auf einem Bündel von rund 80.000 Eingabe-Token braucht mehr als 45.000
Ausgabe-Token allein fürs Denken.** Wiederholt mit `high` (die CLAUDE.md sagt
für Sachfragen ohnehin, `high` sei das bessere Geschäft) und einem Dach von
120.000.

Dass es überhaupt auffiel, liegt an der Statusprüfung bei JEDEM Aufruf — wer
nur den Text ausliest, hätte hier „0 Befunde" gemeldet.

**Wiederholung mit `high`: 883 s, `status: completed`, 79.660 Eingabe- /
28.577 Ausgabe-Token (davon 21.158 Nachdenken), 9 Befunde.** Also weniger
Denken UND ein Ergebnis — die CLAUDE.md-Notiz „für Sachfragen ist `high` das
bessere Geschäft" bestätigt sich an einer echten Prüfaufgabe.

### K1 „Kein Erfolgspfad-Test für `pin-direkt`; `if (true)` bliebe grün" —
**FÄLLT im Kern, ein Teil TRÄGT**

Die Prämisse ist falsch, und der Grund ist wieder das Bündel:
`test_feature_id_wache_route.js:381-384` fährt `pin-direkt` mit einer ECHTEN
ID, erwartet `feedback=pin_gesetzt` und kontrolliert positiv, dass
`pin_hash` in der Datenbank steht. Die Mutation `if (!r.rowCount)` →
`if (true)` würde daran ROT. Die Datei lag nur der Spur „tests" vor.

**Was TRÄGT:** für den ERFOLGSPFAD von `pin-direkt` sichert niemand den
AUDIT-Eintrag zu. `test_feature_audit_mitarbeiter.js` deckt anlegen,
umbenennen und E-Mail ab, `pin-direkt` nicht; die beiden übrigen
Audit-Wächter sind statisch. Damit fehlt genau die Positivkontrolle, die Z5c
braucht (→ K4).

### K2 „E-2 ist eine opportunistische Aufräumung und erzeugt einen
unprotokollierten Schreibzugriff" — **TRÄGT, und es KIPPT die Entscheidung
gegen sol**

Zwei Spuren, dieselbe Tatsache, **entgegengesetzte Empfehlung**: sol (E3) will
die Aufräumung erhalten, kimi will sie fallen lassen. Entschieden wird es
nicht durch Abstimmung, sondern am Argument — und kimis zweite Flanke ist
das stärkere:

* **Flanke 1:** `:762` räumt ein verwaistes Token nur dann ab, wenn ZUFÄLLIG
  ein Admin `pin-direkt` auf genau diese veraltete ID abschickt. Ohne diesen
  Zufall überleben die Tokens genauso. Das ist kein Riegel, sondern ein
  glücklicher Nebeneffekt.
* **Flanke 2:** Mit E-2 ändert das System bei 0 getroffenen Zeilen seinen
  Zustand (`mitarbeiter_token` wird geschrieben), während es dem Benutzer
  „nicht gespeichert" meldet und NICHTS protokolliert. Ein unbelegter
  Schreibzugriff auf einem für gescheitert erklärten Weg — in einem System,
  dessen Kern die Beweiskette ist. **Das ist dieselbe Krankheit, die der
  Beitrag heilen soll, nur spiegelverkehrt.**

**ENTSCHEIDUNG: Riegel B kommt VOR `:762`.** Auf einem Weg, den wir als
gescheitert melden, wird nichts geschrieben. Sols Beobachtung bleibt richtig
(heute räumt die Route auf), seine Empfehlung wird verworfen.

**NICHT in diesem Beitrag** — kimis Wurzelvorschlag (`loeschen`: den stillen
`catch {}` bei `:889` an `melde()` hängen oder das Token-DELETE in die `db.tx`
bei `:940-953` ziehen). Begründung: das Hineinziehen in die Transaktion ist
genau die Klasse, für die die CLAUDE.md eine eigene Lock-Ordnungs-Analyse
verlangt (der öffentliche PIN-Weg sperrt `mitarbeiter_token` → `mitarbeiter`;
`loeschen` würde dieselbe Ordnung brauchen). Der Befund wird als eigener
Punkt festgehalten, nicht nebenbei mitgebaut.

### K3 „Z5a-1b: nur das Wort `return` löschen lässt sie grün" — **TRÄGT**

`if (!ma) res.redirect(...)` ohne `return` lässt Muster und lexikalische
Reihenfolge unverändert, der Frühausstieg feuert aber nicht mehr. Deckt sich
mit E4 der Spur „eng" — **beide Spuren unabhängig auf derselben Zeile.**
Behebung: der Anker enthält das `return`, UND es kommt ein Verhaltensanker
dazu (bcrypt-Zähler).

### K4 „Z5c ist eine reine Nicht-Existenz-Zusicherung" — **TRÄGT**

Deckt sich mit E7. Positivkontrolle im selben Lauf: mit echter ID fahren und
den Eintrag als VORHANDEN zusichern. Erst „Eintrag da, wenn geschrieben
wurde / kein Eintrag bei 0 Zeilen" belegt die Reihenfolge aus E-1.

### K5 „`email_fehler` bekommt zwei Erzeuger" — **TRÄGT in der Klasse**

Dritte Spur auf denselben Punkt (E5, K5). kimi liefert den schärfsten
Mechanismus: jeder Fixtur-Wert, dessen numerischer Kopf auf eine nicht
vergebene ID führt, liefert nach dem Umbau `email_fehler` aus dem NEUEN
Riegel — die alte Zusicherung bleibt grün, obwohl der Format-Riegel weg ist.
**Noch nicht gemessen, weil erst nach dem Bau messbar:** unsere echte
Fixturliste ist `['1e3','1.5','0x10','2147483648','0']`; `2147483648` löst
einen int4-Überlauf aus und dürfte die Zusicherung weiterhin röten — dann
aber aus einem Zufall, nicht aus dem Riegel. **Das ist die ERSTE Messung der
Bau-Runde.** Behebung unabhängig davon: die Zusicherung sichert zu, dass bei
ungültigem FORMAT gar keine Datenbankabfrage läuft.

### K6 „Z5b bewacht den `tone` nicht" — **TRÄGT, gemessen**

`core/ui-feedback.js:158` setzt `item.tone || "success"`; `banner()`
(`:138-148`) leitet Klasse UND `role` daraus ab. Streicht jemand
`tone: "error"`, erscheint die Fehlermeldung als grünes Erfolgsbanner mit
`role="status"` — und Z5b prüft laut Papier nur Titel und Detailtext.
Behebung: zusätzlich auf `ui-banner--error` zusichern.

### K7 „Dreigeteilte Antwort auf denselben Formatfehler" — **TRÄGT als
Beobachtung, wird NICHT behoben**

`email` → `email_fehler`, `pin-direkt` und `umbenennen` → barer Redirect ohne
Anzeige. Das ist BESTAND, nicht Folge dieses Beitrags. kimi räumt das selbst
ein. Es kommt als benannte Inkonsistenz ins Papier, damit es nicht als
übersehen durchgeht; die Behebung von K5 (Zusicherung auf „keine DB-Abfrage
bei Formatfehler") fasst den eigentlichen Schaden ohnehin.

### K8 „Das Wrapper-Muster ist nicht routenscharf, und ein Restore fehlt" —
**TRÄGT, gemessen**

`SELECT name FROM mitarbeiter WHERE id=$1 AND studio_id=$2` steht WÖRTLICH
IDENTISCH an drei Stellen: `:731` (einladen), `:758` (pin-direkt), `:838`
(umbenennen). Das ist die Klasse „ein Mutationsmuster, das mehr als einmal
passt". Dazu fehlt die Vorschrift, den Wrapper in `finally` zurückzunehmen —
sonst wird aus „ein FAIL" ein „mehrere FAILs aus fremder Ursache", und eine
Diagnose darf nie Abdeckung kosten.

### K9 „Prüflücke durch fehlendes Material" — **kein Befund, aber ein
brauchbarer Auftrag**

Wie E8: der gewollte blinde Fleck. Der verwertbare Teil ist die Frage, die
kimi daraus ableitet: **überleben die statischen Anker auf `pin-direkt`
(`test_feature_audit_benutzerverwaltung_static.js`) das Einfügen zweier neuer
`if (...)`-Zeilen, ohne ihre GENAU-EINMAL-Zählung zu verlieren?** Das wird in
der Bau-Runde gemessen.

---

## Bilanz der drei Spuren

**21 Befunde, 16 tragen nach eigener Nachmessung.**

| | Befunde | tragen | fallen | „kein Befund" |
|---|---|---|---|---|
| `gpt-5.6-sol` (eng) | 8 | 6 | 1 (E1 im Kern), 1 (E6) | 1 (E8) |
| `deepseek-v4-pro` (tests) | 4 | 3 | 1 (T1, war „blockierend") | – |
| `kimi-k3` (umkreis) | 9 | 7 | 1 (K1 im Kern) | 1 (K9) |

**Was die verschiedenen Bündel gebracht haben — und was nicht.** Vier Punkte
fanden MEHRERE Spuren unabhängig (Z5a-1b schwach; Z5c ohne Positivkontrolle;
`email_fehler` mit zwei Erzeugern; die beiden Riegel decken einander zu). Das
ist keine Überraschung: alle drei lasen dasselbe Papier. Die Ergänzung kam
aus dem ZUSATZmaterial, und zwar in beide Richtungen —

* **kimi (Umkreis)** fand allein: den `tone`-Befund (nur mit
  `core/ui-feedback.js` sichtbar), das dreifach vorkommende SQL-Muster, die
  dreigeteilte Formatfehler-Antwort und die Wurzel in `loeschen`.
* **deepseek (Tests)** fand allein: dass die bestehenden No-Op-Gegenproben nur
  Status 302 prüfen.
* **sol (eng)** fand allein: die fehlende `studio_id`-Vorschrift für die
  Löschabfrage des Tests.
* **Und die beiden Spuren OHNE die Testdateien haben genau dort ihre
  Fehlschlüsse** — E1, E6, K1 fallen alle drei an einer Tatsache, die in den
  Testdateien steht. Der blinde Fleck ist also nicht gratis: er kostet
  Fehlalarme, die ich nachmessen muss.

**Ein Ergebnis, das ohne mehrere Spuren nicht zustande gekommen wäre:** sol
und kimi geben zu E-2 ENTGEGENGESETZTE Empfehlungen, gestützt auf dieselbe,
von beiden richtig gelesene Tatsache. Ein einzelner Prüfer hätte mir eine der
beiden als „die" Antwort geliefert.
