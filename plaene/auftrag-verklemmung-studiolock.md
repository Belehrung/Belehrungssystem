# Bauauftrag: Sperrordnung um den Studio-Audit-Lock (Fassung 2)

**Zielrepo:** GymDocu, neuer Zweig `fix-studiolock-ordnung` ab master `f4c0f07`.
**Betreiber-Vorgabe:** fehlerfreies System; Sammelliste `plaene/offene-befunde-ladebestand.md`
(„ausserhalb dieses Beitrags") und CLAUDE.md „Transaktionen und Sperren".
**Modellwahl, VOR dem Auftrag entschieden:** Fable 5.1 — sehr komplex nach den Merkmalen der
CLAUDE.md: systemweite Sperrordnung über rund 30 Transaktionen in 15 Dateien, zwei Prüfspuren
widersprachen sich in der Kreisfrage, und jede Nebenläufigkeitsprobe kann falsch grün sein.
**Nach SUCHMUSTER arbeiten, nicht nach Zeilennummer** (Zeilen = Stand `f4c0f07`).

Fassung 1 (nur Weg B umstellen) ist durch die Planprüfung widerlegt
(`plaene/planpruefung-verklemmung-studiolock.md`): sie erzeugt einen NEUEN Kreis mit der
Seil-Umbenennung und lässt weitere offen. Es braucht eine Regel für das ganze System.

## Die Regel

> **Jede Transaktion, die `auditAppend(…, t)` mit ihrer Verbindung aufruft — direkt oder über
> einen Helfer —, nimmt den Studio-Lock L als ERSTE Sperre.** Vor L sind nur Lesezugriffe ohne
> Sperre erlaubt (einfaches `SELECT`, kein `FOR UPDATE/SHARE`), keine Schreibanweisung, kein
> anderer Advisory-Lock.

Begründung: Alle L-Nehmer eines Studios sind dann untereinander vollständig serialisiert. Ein
Kreis über L setzt voraus, dass ein Weg etwas VOR L hält, das ein anderer NACH L will — das
schliesst die Regel für alle L-Nehmer aus. Kreise zwischen Wegen, die L gar nicht nehmen, sind
eine andere Klasse (reine Zeilenordnung) und nicht Gegenstand dieses Auftrags.

## Gemessene Inventur (Haupt-Agent, 23.09.2026, `f4c0f07`)

AST-Skript über alle getrackten Produktivdateien (ohne `test*`, `public/`, `tools/`), gehalten
gegen eine Textsuche als Referenz von aussen: **111 Aufrufstellen, AST = grep, `diff` leer.**

| Klasse | Anzahl | Folge |
|---|---|---|
| `auditAppend` ohne Verbindung (eigene Transaktion, L ist dort ohnehin die erste Anweisung) | 76 | unberührt |
| lexikalisch in einem `db.tx`-Callback, mit `t` | 31 | umstellen |
| mit durchgereichter Verbindung in einem Helfer | 4 | Aufrufer umstellen |
| ohne Verbindung INNERHALB einer offenen Transaktion (auch eine Ebene über Helfer) | **0** | Wächter, damit es 0 bleibt |

Die vierte Zeile ist mit Positivkontrolle gemessen (künstliche Datei mit einem solchen Aufruf:
1 Treffer). Die Helfer mit durchgereichter Verbindung: `nachtragUebernehmen` (zweimal, in
`routes/module.js` und `routes/sichtpruefung.js`), `schliesseSeilSperren`
(`routes/module.js`), `schliesseDefektReparatur` (`routes/sichtpruefung.js`); ihre Aufrufer:
`module.js` Tagescheck und eigenständiger Nachtrag, `sichtpruefung.js` Cardio/Kraft-Tagescheck
und Mangel-Nachtrag, beide `db.tx((t) => schliesse…(t, …))`.

Die Transaktionen mit Sperren VOR L heute (Auszug, vollständig im Skriptergebnis — der
Executer erzeugt die Liste selbst neu, s. Schritt 1): Seil-Tagescheck (S1 → INSERT → L → N),
eigenständiger Nachtrag (N → Zeile → L), Umbenennung (S1 → UPDATE `geraete`/`geraete_sperren`
→ L), Korrektur-Durchschreiben (Korrektur-Locks → UPDATE Zielzeile → L), Korrekturblatt,
Wartungs-Unterschrift, Cardio/Kraft-Tagescheck, Mangel-Nachtrag, Retention, Schlüsselrotation,
QR-Bestellung, Benutzer sperren/löschen/Passwort/2FA, Getränkeanlage, Spülplan, Pausenzeiten,
Lageplan, Wartungs-Kategorie/-Gerät löschen, Ausmusterung (L nur beim Seil-Typ).

Bekannte Kreise, die die Regel schliesst: Tagescheck–Nachtrag (A–B, gemessen 15.09.),
Nachtrag–Freigabe (B–C), Umbenennung–Freigabe und Umbenennung–Nachtrag nach Fassung 1,
Korrektur–Freigabe, Ausmusterung–Umbenennung.

## Mechanik

1. **`auditTx(studioIdOderIds, callback)` in `core/integritaet.js`.** Öffnet `db.tx`, nimmt als
   erste Anweisung `SELECT pg_advisory_xact_lock($1)` je Studio-ID — bei mehreren Studios
   numerisch aufsteigend, ohne Doppelte —, vermerkt die gesperrten IDs an der Verbindung
   (nicht aufzählbare Eigenschaft über ein `Symbol`) und ruft dann den Callback.
2. **`auditAppend(…, conn)` prüft den Vermerk**, BEVOR es irgendeine Anweisung schickt: fehlt die
   Studio-ID im Vermerk der Verbindung, wirft es einen Fehler mit `code =
   'AUDIT_STUDIOLOCK_FEHLT'`. Die Transaktion rollt zurück. Der bisherige Lock-Griff in
   `append()` bleibt stehen (wiedereintrittsfähig, schadet nicht, schützt den Fall ohne `conn`).
   *Entscheidung, zur Prüfung gestellt:* werfen statt nur melden. Begründung: ein fehlender
   Vermerk ist ein Programmierfehler, und der schlimmste Fall heute (ein 40P01) bricht die
   Anfrage ebenfalls ab — nur selten statt sofort. Der statische Wächter (Punkt 4) soll dafür
   sorgen, dass der Wurf nie in Produktion erreicht wird.
3. **Alle Transaktionen aus der Inventur auf `auditTx` umstellen.** Die bisherigen
   ausdrücklichen Studio-Locks in diesen Transaktionen (Freigabe, Belehrungen, Mangel-Nachtrag,
   Ausmusterung) werden dadurch überflüssig; sie bleiben NICHT als Doppel stehen, sondern
   entfallen, und der Kommentar wandert an `auditTx`. Ausnahme: die Ausmusterung nimmt L heute
   nur beim Seil-Typ — nach der Umstellung bei jedem Typ, weil sie immer `auditAppend(…, t)`
   ruft.
   * **Schlüsselrotation** (`ops/schluessel-rotieren.js`) läuft über ALLE Studios in einer
     Transaktion: Studio-IDs vorher lesen, `auditTx(ids, …)`, im Callback die Studio-Liste
     erneut lesen und abbrechen, wenn sie von der gesperrten abweicht.
   * **Retention** hält L künftig für die ganze Lösch-Transaktion einer Tabelle. Das ist der
     längste L-Halter (s. Kosten).
   * In den Helfern mit durchgereichter Verbindung ändert sich nichts; ihre Aufrufer werden
     `auditTx`.
   * Der Kommentar am Nachtrag-Lock N (Weg B) sagt ausdrücklich: N steht NACH L; N allein
     verhindert den Kreis mit der Freigabe NICHT, das leistet allein `auditTx`.
4. **Statischer Wächter** (neue Testdatei, AST mit `acorn` wie in
   `test_feature_brandschutz_schreibplan_verhalten.js`):
   * **(a)** Die Menge der `auditAppend`-Aufrufstellen im AST ist GLEICH der Menge aus einer
     unabhängigen Textsuche (Pfad:Zeile, als Menge, nicht als Zahl). Dateiliste aus
     `git ls-files`, Produktivwurzeln LITERAL hingeschrieben und gegen `git ls-files` gehalten.
   * **(b)** Jeder Aufruf mit Verbindungsargument liegt lexikalisch in einem
     `auditTx`-Callback ODER in einer Funktion, die die Verbindung als Parameter bekommt — und
     JEDER Aufruf einer solchen Funktion liegt wiederum in einem `auditTx`-Callback (Fixpunkt
     über Funktionsnamen je Datei; ein Aufruf, der sich nicht zuordnen lässt, ist ein FEHLER,
     kein Durchlass).
   * **(c)** Kein `db.tx`-Callback enthält `auditAppend` oder einen Helfer aus (b).
   * **(d)** Kein `auditAppend` OHNE Verbindung in einem `db.tx`/`auditTx`-Callback oder in
     einer Funktion, die aus einem solchen gerufen wird.
   * **(e)** In jedem `auditTx`-Callback kommt vor dem ersten `await` auf die Verbindung kein
     Advisory-Lock-Aufruf eines anderen Studios vor — entfällt, wenn (1) das strukturell
     ausschliesst; dann steht die Begründung im Test.
   * Jede Regel hat eine eigene FIXTUR mit Verstoss (rot) und Durchlassfall (grün), in
     PRODUKTIONSFORM aufgerufen (dieselbe Funktion, dieselben Argumente wie gegen den Bestand).
5. **Bestehendes Lock-Inventar nachziehen:** `test_feature_geistersperre_nachtrag_rennen.js`,
   Abschnitt 7 (literale Liste der Advisory-Lock-Anweisungen, heute 26 Einträge plus die
   „erste Anweisung"-Prüfungen für den Tagesschlüssel und die zwei Belehrungen-Locks). Jede
   Änderung an der Liste wird EINZELN im Bericht begründet. Die „erste Anweisung"-Prüfung für
   den Tagesschlüssel heisst künftig: erste Anweisung im `auditTx`-Callback. Die beiden
   Belehrungen-Prüfungen werden durch Wächter (b)/(c) ersetzt — der Bericht zeigt, dass jede
   Mutation, die sie bisher rot machte, jetzt (b) oder (c) rot macht.

## Nachweis

1. **Inventur neu erzeugen** (Skript im Zweig unter `test/helfer/`, nicht in `test/run.sh`),
   Ergebnis in den Bericht: je Transaktion die Sperrfolge VORHER und NACHHER.
2. **Laufzeit-Einheitstest** für `auditTx`/`auditAppend`: mit Vermerk läuft der Append; in
   einem blanken `db.tx` wirft er `AUDIT_STUDIOLOCK_FEHLT` und schreibt NICHTS (Zeilenzahl
   `audit_log` vorher = nachher); mehrere IDs werden aufsteigend gesperrt (Reihenfolge der
   gesendeten Anweisungen über eine Hülle protokolliert, Eingabe absichtlich absteigend).
3. **Deterministische Nebenläufigkeitsproben über die ECHTEN Routen** (Wegwerf-DB, zwei echte
   Verbindungen) für drei Paare: Tagescheck–Nachtrag, Nachtrag–Freigabe, Umbenennung–Nachtrag.
   Anforderungen aus beiden Prüfspuren, alle verbindlich:
   * **Tor je Anfrage**, nicht prozessglobal (AsyncLocalStorage oder eine Kennung an der
     Verbindung). Das Tor parkt NACH der Gewährung der ersten Sperre der angehaltenen
     Transaktion — „erste Sperre, welche auch immer", damit es auch in der Gegenprobe greift.
   * **Überschneidungsbeleg eingegrenzt:** PIDs beider Verbindungen vorab über
     `pg_backend_pid()`; Beleg ist `pg_blocking_pids(pidWartend) @> ARRAY[pidHaltend]` UND der
     wartende Lock ist der erwartete (`locktype`, `objid` für L bzw. den Gegen-Lock).
   * **Gültigkeitsriegel:** jede Probe belegt positiv, dass sie ihren Weg bis zur kritischen
     Stelle gegangen ist (UPDATE traf genau eine Zeile, L-Griff erreicht). Fehlt der Beleg, ist
     das ein FAIL „Messung ungültig", nie ein „kein Kreis".
   * **Begrenzter Fehlerpfad:** jede Wartebedingung hat eine Obergrenze NUR als Abbruch — sie
     endet als FAIL mit Diagnose, beide Anfragen werden sauber beendet, der Rest der Suite
     läuft weiter. Nie als Erfolgskriterium.
   * **Nachher:** beide Anfragen erfolgreich, DB-Zustand beider Wege belegt, kein 40P01, und
     die wartende Seite wartete auf L (nicht auf eine Zeile).
   * **Gegenprobe je Paar:** `auditTx` auf EINER Seite durch `db.tx` ersetzen UND den Wurf in
     `auditAppend` ausschalten (sonst misst die Gegenprobe den Wurf statt des Kreises) →
     SQLSTATE `40P01` (`err.code`, kein Textvergleich) auf genau einer Seite, die andere
     committet; der Bericht nennt den Lock-Schlüssel, an dem der Kreis entstand.
   * Die Proben ersetzen NICHT den statischen Wächter; sie belegen die Wirkung an drei Paaren,
     der Wächter die Regel für alle.
4. **Gegenproben für den Wächter** (je Regel (a)–(d)): eine Umstellung zurückdrehen (`auditTx`
   → `db.tx`), einen Helfer-Aufruf in ein blankes `db.tx` verschieben, ein `auditAppend` ohne
   Verbindung in einen Callback setzen, eine Datei aus der Scanliste nehmen — jede rot, und
   zurückgenommen grün. Mutationsskripte nach Hausregel (Zielpfad als Argument, Abbruch bei ≠1
   Fundstelle, Marker, Rücknahme per Kopie mit `diff` EXIT 0).
5. Volle Suite (`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`), Dateizahl-Ritual, Lint,
   Marker-Scan 6.

## Kosten der Behebung (gehört in den Bericht)

Alle Audit-Transaktionen eines Studios laufen künftig über ihre GANZE Dauer nacheinander statt
nur über den Audit-Anhang. Die längsten L-Halter sind der Nachtrag (bis 200 Einträge), die
Retention je Tabelle und die Ausmusterung. Das ist der Preis der Kreisfreiheit; die
Alternative (Audit in eine eigene Transaktion) ist verworfen, weil sie die Atomarität von
Geschäftsdaten und Protokoll aufgibt. Der Bericht misst die Haltedauer der Retention an der
grössten Testfixtur und nennt sie.

## Offene Fragen an die Planprüfung

1. Welchen ZUSTAND erzeugt diese Regel, den es heute nicht gibt?
2. Was wird durch sie SCHLECHTER — Durchsatz, Wartezeiten, neue Reihenfolgen, Ausfallverhalten
   durch den Wurf?
3. Gibt es einen Weg, auf dem eine Transaktion nach der Umstellung L NACH einer anderen Sperre
   nimmt, oder zwei L verschiedener Studios in unterschiedlicher Reihenfolge?
4. Kann einer der Wächter (a)–(d) falsch grün sein?
