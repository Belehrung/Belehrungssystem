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

## Spur „umkreis" (`kimi-k3`) — steht aus

## Spur „tests" (`deepseek-v4-pro`) — steht aus
