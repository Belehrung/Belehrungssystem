# Planprüfung `auftrag-ladebestand.md` — ZWEI Spuren, verschiedene Bündel

**20.09.2026, erster Lauf nach der Reduktion auf zwei Spuren.** Geprüft wurde
das Auftragspapier VOR der ersten Bau-Runde.

| Spur | Modell | Bündel | Eingabe-Token | Ausgabe (Denken) | Dauer | Befunde |
|---|---|---|---|---|---|---|
| eng | `gpt-5.6-sol` | Papier + `routes/admin/geraete.js` | 119.451 | 21.188 (17.562) | 270 s | 9 |
| umkreis | `kimi-k3` | Papier + der bestehende Wächter + `core/brandschutz-vorlage.js`, `core/ausstattung.js`, `core/pruefbereich-kopf.js`, `core/db.js` — **ohne** `geraete.js` | 110.508 | 24.396 (17.659) | 662 s | 8 |

**17 Befunde, rund 12 verschiedene.** Höhere Überschneidung als bei der
Diffprüfung mit vier Spuren — erwartbar, beide lasen dasselbe Papier.

## Der Bündelschnitt hat gehalten, und zwar in BEIDE Richtungen

**Jede Spur fand, was nur ihr Bündel erlaubte:**

* **Nur sol (mit `geraete.js`):** die frühere Abfrage `SELECT antwort,
  bemerkung FROM pruefbereich_bestand …` bei `:2485`, die eine naive
  Fehlerstellung treffen würde (S7); und die Reihenfolge „Antworten werden
  VOR dem Laden geschrieben" (S1).
* **Nur kimi (mit dem Wächter):** dass der naheliegende Helfer
  `mitGestoertemBereich` die Antwort-INSERTs mitträfe (K1).

**Und kimi hat seine Materiallücke ZWEIMAL ausdrücklich benannt statt zu
raten** — K3: *„MATERIALRÜCKSTAND, ausdrücklich: `routes/admin/geraete.js`
liegt mir nicht vor — ich kann weder die GET/POST-Trennung noch die
Behauptung … verifizieren"*, ebenso K7 zum elliptisch zitierten UPDATE. Das
ist das Verhalten, das die Bündeltrennung erst benutzbar macht: eine Spur,
die ihre Grenze kennt, liefert keine geratenen Befunde.

---

## Eigene Nachmessungen

### Der schwerste Befund betrifft NICHT den Plan, sondern den BESTAND (S3)

**GEMESSEN, und er trägt vollständig.** `ladeBestand` mutiert:
`return leer;` → `throw e;` (Muster genau einmal getroffen, `node --check`
bestanden). Dann `test_feature_ladestand_dbfehler.js` einzeln:

    EXIT 0, 78 PASS / 0 FAIL
      ✓ ladeBestand(): bei DB-Fehler protokolliert, Seite bleibt HTTP 200
      ✓ ladeBestand(): Durchlass — mit echter DB kein console.error

**Der Wächter bleibt vollständig grün, während das Bewachte weg ist.** Die
Ursache ist zweiteilig und beides gemessen: das `console.error` steht im
`catch` VOR dem `return`, läuft also weiter; und der äussere `catch` der
GET-Route (`routes/admin/geraete.js:2391-2393`) sendet seine Fehlerseite mit
`res.send(...)` OHNE `.status(...)`, also ebenfalls **HTTP 200**. Der Wächter
prüft Status und Protokollpräfix, nicht den Seiteninhalt.

Das ist unsere teuerste Klasse — eine falsche Zusicherung von Abdeckung —, sie
steht seit dem 02.09.2026 im Bestand, und sie ist KEIN Fehler dieses Papiers.

### S7 / K1 — die Fehlerstellung, zwei verschiedene Fallen für dieselbe Lücke

Das Papier verlangt einen Fehler „für GENAU den nächsten SELECT auf
`pruefbereich_bestand`" und nennt den Mechanismus nicht. Beide Spuren haben
unabhängig gezeigt, dass die naheliegende Lesart etwas anderes misst — mit
**verschiedenen** Fallen:

* **sol:** im Brandschutz-POST steht vor `:2654` bereits `SELECT antwort,
  bemerkung FROM pruefbereich_bestand WHERE studio_id=$1 AND bereich=$2 AND
  schluessel=$3` (**gemessen: `:2485`**). Wer auf den Tabellennamen stellt,
  trifft diese.
* **kimi:** der im selben Wächter vorhandene Helfer `mitGestoertemBereich`
  matcht `sql.includes('pruefbereich_bestand') && params[1] === bereich` —
  und **gemessen** tragen die Antwort-INSERTs genau diese Signatur
  (`[req.studioId, ausstattung.BEREICH, …]`, `:4127-4135`; Brandschutz
  analog `:2462-2471`). Der Stub würde also die Antworten killen, BEVOR die
  strenge Schwester überhaupt läuft — und Z1 wäre grün, auch ohne jede
  Behebung.

**Beide tragen.** Der Ausweg existiert im Bestand: `mitGestoertemQ` matcht den
SQL-Text als Teilzeichenkette, und der Wächter übergibt ihm bereits den
VOLLEN Literaltext `SELECT * FROM pruefbereich_bestand WHERE studio_id=$1 AND
bereich=$2` — der trifft weder `:2485` noch die INSERTs. Der Mechanismus
gehört ins Papier, statt dem Ausführenden überlassen zu werden.

### S1 / K6 — der Teilpersistenz-Zustand, den das Papier nicht benennt

**GEMESSEN am Kontrollfluss:** im Ausstattungs-POST laufen die
Antwort-INSERTs samt Audit in einer Schleife (`:4126-4145`), erst DANACH
kommt `const bestandRoh = await ladeBestand(...)` (`:4151`). Alles Autocommit,
kein `db.tx`. Scheitert die strenge Schwester, bleiben die Antworten stehen
und der Benutzer bekommt eine Fehlerseite.

**Das ist ein neuer Zustand, und er gehört ins Papier.** Aber er ist NICHT
schlechter als heute: heute werden bei demselben Fehler zwölf Termine
deaktiviert und Erfolg gemeldet. „Antworten gespeichert, nichts zerstört,
Fehlerseite" ist die bessere Hälfte — nur darf die Antwort dann nicht
behaupten, es sei gar nichts passiert.

### S6 / K2 — Z3 kann nicht rot werden

Beide unabhängig, und es ist dieselbe Mutation wie bei S3: `return leer;` →
`throw e;`. Z3 zählt Aufrufstellen; die bleiben acht. Dass alle acht dabei von
„liefert immer ein Objekt" auf „wirft" umgestellt werden, sieht Z3 nicht.
**Der Zusatz von kimi trägt und ist billig:** Z3 bekommt einen
Verhaltens-Pin — `ladeBestand` einmal direkt mit werfender Datenbank
aufrufen und zusichern, dass ein Objekt mit nicht aufzählbarer
`fehler`-Markierung herauskommt UND mit dem Präfix protokolliert wird.

### S9 / K4 — mein Papier widerspricht sich selbst

Beide unabhängig. Abschnitt 1.2 sagt „heute liest sie genau der neue Weg" —
das gilt nur für die ZWEITE Variante. Bei der bevorzugten strengen Schwester
liest die Markierung **niemand**. Würde der Kommentar bei `:1866` nach 1.2
„berichtigt", behauptete er frisch einen Leser, den es nicht gibt — genau die
falsche Zusicherung, die 1.2 beseitigen will.

### S5 / K5 — Z2 ist zu grob für seine eigene Überschrift

Beide unabhängig. „Der normale Weg bleibt unverändert" wird durch einen
Vergleich von Terminen/Zeilen geprüft. sol: ein `if (false)` vor einem
`auditAppend` bleibt grün. kimi: eine Änderung an `intervallMonate` oder am
`wer`-Feld in `core/ausstattung.js` ebenso. **Beide tragen in der Klasse.**
Entweder die Überschrift ehrlich verengen oder den Sollwert auf die vollen
Zeilen ausdehnen. kimis Zusatz trägt: **Z2 hat als einzige der drei gar keine
Gegenprobe** — die gehört dazu.

### S8 / K7 — `studio_id` im TESTaufbau

Beide unabhängig, beide mit derselben Einschränkung: im Produktionsmaterial
trägt jede sichtbare Abfrage `studio_id`; für die noch nicht geschriebenen
Messabfragen des Tests steht es nirgends. Trägt, ist billig, gehört in die
Abnahme — zumal derselbe Wächter viele Studios in EINER Wegwerf-DB anlegt.

### Was NICHT trägt oder nicht gebaut wird

* **S3s Behebungsvorschlag geht weiter als der Befund** („der bestehende
  Wächter muss zusätzlich einen Inhalt prüfen") — das ist richtig, aber es
  ist ein eigener Punkt am Bestand, nicht Teil dieses Papiers. Es kommt als
  eigener Befund in `plaene/durchgang-befunde.md` und wird in diesem Beitrag
  mitgenommen, WEIL der Beitrag dieselbe Funktion anfasst und sich sonst auf
  einen Wächter stützen würde, der nichts hält.
* **K8** (der SQL-Text steht nach dem Umbau zweimal da) trägt formal, aber die
  vorgeschlagene gemeinsame Konstante ist die schlechtere Lösung: kimi nennt
  selbst die bessere — `ladeBestand` als „`ladeBestandStreng` mit `catch`"
  formulieren. Dann gibt es die Abfrage genau einmal. **Das wird so gebaut.**
* **S4** (Z1 braucht leere und teilweise POSTs) trägt, ist aber eine
  Erweiterung des Prüfumfangs, keine Korrektur. Wird mitgenommen, weil die
  bedingte Ein-Zeilen-Mutation, die sol nennt, sonst durchginge.
