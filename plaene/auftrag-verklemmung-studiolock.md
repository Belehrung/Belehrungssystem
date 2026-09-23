# Bauauftrag: Sperrordnung um den Studio-Audit-Lock (Fassung 3)

**Zielrepo:** GymDocu, neuer Zweig `fix-studiolock-ordnung` ab dem dann aktuellen master
(mindestens `f4c0f07`; ist der Beitrag „nachweis-unlink" schon gemergt, ab diesem Stand).
**Betreiber-Vorgabe:** fehlerfreies System; Sammelliste `plaene/offene-befunde-ladebestand.md`,
CLAUDE.md „Transaktionen und Sperren"; schliesst zugleich U-AUDT1 und verallgemeinert U-LOCK1
(`plaene/durchgang-befunde.md`).
**Modellwahl, VOR dem Auftrag entschieden:** Fable 5.1 — sehr komplex nach den Merkmalen der
CLAUDE.md: systemweite Sperrordnung über rund 35 Transaktionen in 15 Dateien, zwei Prüfspuren
widersprachen sich in der Kreisfrage, Schwellen müssen hergeleitet werden, und jede
Nebenläufigkeitsprobe kann falsch grün sein.
**Nach SUCHMUSTER arbeiten, nicht nach Zeilennummer** (Zeilen = Stand `f4c0f07`).

Vorgeschichte: Fassung 1 (nur einen Weg umstellen) ist widerlegt, Fassung 2 (Regel + Wächter)
hatte vier blockierende Lücken. Beide Planprüfungen samt Nachmessung:
`plaene/planpruefung-verklemmung-studiolock.md`. Alle dort getragenen Befunde sind hier
Anforderungen.

## Die Regel

> **Jede Transaktion, die `auditAppend` mit ihrer Verbindung aufruft — direkt oder über einen
> Helfer —, nimmt den Studio-Lock L als ERSTE Sperre.** Vor L sind nur Lesezugriffe ohne Sperre
> erlaubt (einfaches `SELECT`), keine Schreibanweisung, kein `FOR UPDATE/SHARE`, kein anderer
> Advisory-Lock. Braucht eine Transaktion L mehrerer Studios, nimmt sie diese numerisch
> aufsteigend, jedes VOR der ersten Sperre auf Daten dieses Studios.
>
> **`auditAppend` OHNE Verbindung darf nie aus einer offenen Transaktion heraus laufen.**

Begründung: Alle L-Nehmer eines Studios sind dann untereinander serialisiert; ein Kreis über L
setzt voraus, dass ein Weg etwas VOR L hält, das ein anderer NACH L will. Ein
verbindungsloser Anhang aus einer Transaktion heraus öffnet eine zweite Verbindung, die auf das
L der ersten warten kann — ein Hänger, den PostgreSQL nicht erkennt (kein 40P01).

## Gemessene Inventur (Haupt-Agent, 23.09.2026, `f4c0f07`) — und ihre Grenze

AST-Skript über die Produktivdateien, gehalten gegen eine Textsuche: **111 Aufrufstellen,
AST = grep.** 76 ohne Verbindung (eigene Transaktion), 31 lexikalisch in `db.tx` mit `t`,
4 mit durchgereichter Verbindung in Helfern (`nachtragUebernehmen` zweimal,
`schliesseSeilSperren`, `schliesseDefektReparatur`), **0** verbindungslose Anhänge in einer
offenen Transaktion (eine Helferebene, Positivkontrolle 1 Treffer). Im Bestand gemessen:
keine Aliase von `auditAppend` oder `db.tx`, kein berechneter Zugriff, kein als Bezeichner
übergebener Callback; `dbTransaction` (`core/db-queue.js`) ist eine Hülle um `db.tx`, wird
importiert, aber 0-mal aufgerufen. **Grenze:** die Inventur erkennt Syntax nach Namen; sie ist
kein Beweis aller ausführbaren Wege. Deshalb Laufzeitschutz UND Wächter, beide verbindlich.

## Mechanik

1. **`auditTx(studioIdOderIds, callback)` in `core/integritaet.js`.** Öffnet `db.tx`, nimmt als
   erste Anweisung `SELECT pg_advisory_xact_lock($1)` je Studio-ID (mehrere: numerisch
   aufsteigend, ohne Doppelte), vermerkt die gesperrten IDs an der Verbindung (nicht
   aufzählbare Eigenschaft über ein `Symbol`) und führt den Callback in einem
   `AsyncLocalStorage`-Kontext aus. Dazu `sperreStudio(t, studioId)` für Wege, die weitere
   Studios erst im Lauf erfahren: prüft, dass die ID GRÖSSER ist als jede bisher gesperrte
   (sonst Wurf), sperrt, vermerkt. Die Kosten von `AsyncLocalStorage` stehen in
   `core/request-context.js` (gemessen 29.08.2026) — der Kontext ist dort schon im ganzen
   Prozess aktiv, es entsteht kein neuer Grundaufwand.
2. **`db.tx` bekommt denselben Kontext** (nur „eine Transaktion ist offen", ohne Vermerk), damit
   Punkt 3 auch blanke Transaktionen erkennt.
3. **`auditAppend` prüft, BEVOR es eine Verbindung holt oder eine Anweisung schickt:**
   * mit Verbindung: fehlt die Studio-ID im Vermerk DIESER Verbindung → Wurf
     `code = 'AUDIT_STUDIOLOCK_FEHLT'`;
   * ohne Verbindung und ein Transaktionskontext ist aktiv → Wurf
     `code = 'AUDIT_OHNE_VERBINDUNG_IN_TX'`;
   * ohne Verbindung ausserhalb jeder Transaktion → unverändert eigene Transaktion (die 76
     Stellen bleiben, wie sie sind).
   Der Lock-Griff in `append()` bleibt (wiedereintrittsfähig). **Werfen statt melden** ist
   entschieden (beide Spuren tragen es mit): ein übersehener Weg bricht sofort und rollt
   zurück; „nur melden" liesse eine unprotokollierte oder hängende Änderung zu. Der Wurf trägt
   Code und Aufrufstelle, damit er im Fehlerkanal sofort zuzuordnen ist.
4. **Alle Transaktionen mit Audit über die Verbindung auf `auditTx` umstellen** (die Liste
   erzeugt der Executer in Schritt 1 des Nachweises neu). Die bisherigen ausdrücklichen
   Studio-Locks darin (Freigabe, Belehrungen, Mangel-Nachtrag, Ausmusterung) entfallen, ihr
   Begründungskommentar wandert an `auditTx`. Die Ausmusterung nimmt L künftig bei JEDEM Typ.
   * **Frühausstiege:** wo ein Weg VOR dem Schreiben entscheiden kann, dass er nichts tut
     (vorhandenes Korrekturblatt, Umbenennung auf denselben Namen, 0 Platzierungen), wird diese
     Prüfung vor `auditTx` gezogen, sofern sie ohne Sperre gleich sicher ist; sonst bleibt sie
     drin und steht als Kosten im Bericht.
   * **Schlüsselrotation** (`ops/schluessel-rotieren.js`): bleibt EINE Transaktion (ihr Kopf
     begründet das). Studios aufsteigend lesen, je Studio `sperreStudio` vor dessen
     `FOR UPDATE`. Kein Listenvergleich. Folge, im Kopf der Datei zu vermerken: während des
     Laufs pausieren Audit-Schreibvorgänge der bereits durchlaufenen Studios bis zum Commit —
     ein seltener, von Hand gestarteter Lauf über wenige Zeilen, bewusst hingenommen.
   * **Geräte-Löschweg** (`routes/admin/geraete.js`, `db.tx` mit Tagesschlüssel, Audit ohne
     Verbindung NACH dem Commit): bleibt `db.tx` — richtig so, er ist kein Audit-Weg im Sinn der
     Regel.
   * Kommentar am Nachtrag-Lock N (eigenständiger Nachtrag): N steht NACH L; N allein
     verhindert den Kreis mit der Freigabe nicht, das leistet allein `auditTx`.
5. **Statischer Wächter** (neue Testdatei, AST mit `acorn`, Vorbild
   `test_feature_brandschutz_schreibplan_verhalten.js`). Jede Regel mit eigener FIXTUR (rot)
   und Durchlassfall (grün), in PRODUKTIONSFORM aufgerufen. Was der Wächter nicht zuordnen
   kann, ist ein FEHLER, kein Durchlass.
   * **(a) Vollständigkeit:** jedes Textvorkommen von `auditAppend`, `auditTx`, `.tx(` und
     `dbTransaction` in den Produktivdateien ist einem AST-Knoten zugeordnet — verglichen als
     MULTIMENGE über `Pfad:Zeile:Spalte`, nicht als Zeilenmenge. Berechneter Zugriff,
     Alias-Zuweisung, `.bind/.call/.apply` und als Bezeichner übergebene Callbacks an
     `tx`/`auditTx` sind Fehler. Dateiliste aus `git ls-files`, Produktivwurzeln LITERAL und
     gegen `git ls-files` gehalten.
   * **(b) Bindung:** das Verbindungsargument jedes `auditAppend`-Aufrufs ist GENAU der
     Bezeichner, den der umschliessende `auditTx`-Callback als Parameter bekommt — oder der
     Parameter eines Helfers, dem JEDER Aufrufer genau diesen Bezeichner an genau dieser
     Stelle übergibt (Fixpunkt je Datei). Ein anderes Verbindungsobjekt ist rot.
   * **(c)** kein `db.tx`/`dbTransaction`-Callback erreicht `auditAppend` mit Verbindung.
   * **(d)** kein verbindungsloses `auditAppend` in einem `tx`/`auditTx`-Callback oder in einer
     Funktion, die (transitiv, je Datei) aus einem solchen gerufen wird.
   * **(e) Sollmenge von aussen:** die Menge der Audit-Stellen MIT Verbindung als literal
     hingeschriebene Liste (Datei + Ereignisname). Wer eine neue hinzufügt, trägt sie bewusst
     ein.
6. **Bestehende Tests nachziehen:**
   * `test_feature_geistersperre_nachtrag_rennen.js` Abschnitt 7 (literales Inventar, heute 28
     Einträge): jede Änderung einzeln im Bericht begründen. Die „erste Anweisung"-Prüfung des
     Tagesschlüssels wird ZWEI Zusicherungen: erste Anweisung im `auditTx`-Callback für die
     Audit-Wege, erste Anweisung im `db.tx` für den Geräte-Löschweg. Die beiden
     Belehrungen-Prüfungen gehen in Wächter (b)/(c) auf — der Bericht zeigt, dass jede Mutation,
     die sie bisher rot machte, jetzt rot macht.
   * `test_feature_reparatur_freigabe_race.js`, `test_feature_seil_freigabe_race.js`,
     `test_feature_seil_freigabe_lock_reihenfolge.js` rufen die echten Helfer in blankem
     `db.tx` → auf `auditTx` umstellen, Positiv-, Null- und Rennfälle erhalten.
   * `test_feature_nutzung_nachtrag_sperrreihenfolge.js` und alle übrigen Tests, die Sperren
     oder `db.tx` um Audit-Helfer bauen: der Executer sucht sie selbst und nennt die Liste.

## Nachweis

1. **Inventur neu erzeugen** (Skript unter `test/helfer/`, NICHT in `test/run.sh`, da es
   `git ls-files` als Kindprozess startet): je Transaktion Sperrfolge VORHER und NACHHER,
   Erst- und Wiedereintritt von L getrennt, Transaktionsgrenzen sichtbar.
2. **Laufzeit-Einheitstest:** mit Vermerk läuft der Anhang; blankes `db.tx` mit Verbindung →
   `AUDIT_STUDIOLOCK_FEHLT`; `auditTx` mit verbindungslosem Anhang →
   `AUDIT_OHNE_VERBINDUNG_IN_TX`; ausserhalb jeder Transaktion ohne Verbindung → Zeile und
   Hash wie heute. **Der Wurf kommt vor jeder Anweisung**: belegt über eine Hülle, die die an
   die Verbindung bzw. den Pool gesendeten Anweisungen zählt (0 nach dem Wurf) — eine
   unveränderte `audit_log`-Zeilenzahl allein belegt das nicht, ein Rollback liefert dieselbe.
   Mehrere IDs absteigend und mit Doppeltem übergeben → aufsteigend, einmal. `sperreStudio`
   mit kleinerer ID → Wurf.
3. **Deterministische Nebenläufigkeitsproben über die ECHTEN Routen** (Wegwerf-DB, zwei echte
   Verbindungen) für drei Paare. Für JEDES Paar ist die Seite, die in der Gegenprobe
   zurückgebaut wird, festgelegt — samt dem Kreis, der dann entsteht:

   | Paar | Gegenprobe baut zurück | Kreis ohne Behebung |
   |---|---|---|
   | Tagescheck A – eigenständiger Nachtrag B | B (`db.tx`) | A hält L, will N; B hält N, will L |
   | Nachtrag B – Freigabe C | B | C hält L, will Zeile; B hält Zeile, will L |
   | Umbenennung R – Nachtrag B | R | B hält L, will Zeile; R hält Zeile, will L |

   In der Gegenprobe wird zusätzlich der Wurf aus Punkt 3 der Mechanik ausgeschaltet (sonst
   misst sie den Wurf statt des Kreises). Verbindlich für alle Proben:
   * **Tor je Anfrage**, nicht prozessglobal; parkt NACH der Gewährung der ersten Sperre der
     angehaltenen Transaktion, „erste Sperre, welche auch immer".
   * **Überschneidungsbeleg:** PIDs über `pg_backend_pid()` auf der Transaktionsverbindung;
     `pg_blocking_pids(pidWartend) @> ARRAY[pidHaltend]` UND der wartende Lock ist der
     erwartete (`locktype`, `classid/objid`).
   * **Gültigkeitsriegel:** positiver Beleg, dass jede Seite ihre kritische Stelle erreicht
     (UPDATE traf genau eine Zeile, der `auditAppend`-Pfad wurde betreten). Fehlt er: FAIL
     „Messung ungültig", nie „kein Kreis".
   * **Begrenzter Fehlerpfad:** jede Wartebedingung hat eine Obergrenze NUR als Abbruch — FAIL
     mit Diagnose, beide Anfragen sauber beendet, Suite läuft weiter.
   * **Nachher:** beide Anfragen erfolgreich, DB-Zustand beider Wege belegt, kein 40P01, die
     wartende Seite wartete auf L.
   * **Gegenprobe:** SQLSTATE `40P01` (`err.code`) auf genau einer Seite, die andere committet;
     Lock-Schlüssel des blockierten Statements im Bericht.
4. **Gegenproben für die Wächter** (a)–(e) und den Laufzeitschutz: je Regel eine Mutation im
   Bestand (Umstellung zurück auf `db.tx`; Helfer-Aufruf in blankes `db.tx`; verbindungsloser
   Anhang in einen Callback; Alias `const aa = auditAppend`; anderes Verbindungsobjekt an
   `auditAppend`; eine Datei aus der Scanliste) — jede rot, zurückgenommen grün.
   Mutationsskripte nach Hausregel.
5. **Haltedauer messen, Schwelle hergeleitet:** L-Haltedauer je umgestellter Transaktion an der
   jeweils grössten Testfixtur, dazu Retention (grösste Fixtur) und Korrekturblatt (PDF-Rendern
   unter L). **Schwelle 1000 ms** — ein Drittel des Pool-Checkout-Zeitlimits von 3000 ms
   (`core/db.js`, `connectionTimeoutMillis`), damit zwei aufeinanderfolgende Halter plus
   Warteschlange darunter bleiben (Pool `max: 10`). Überschreitet ein Weg die Schwelle:
   **anhalten und melden**, nicht selbst umbauen — die Entscheidung (Zerlegen, Vorziehen,
   `lock_timeout`) trifft der Haupt-Agent.
6. Volle Suite (`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`), Dateizahl-Ritual (neue
   Testdateien in `test/run.sh`), Lint, Marker-Scan 6.

## Kosten (gehören in den Bericht, mit Zahlen)

Alle Audit-Transaktionen eines Studios laufen über ihre GANZE Dauer nacheinander. Neu: Wege,
die L halten, ohne am Ende zu protokollieren (Frühausstiege). Wartende halten
Poolverbindungen. Die Schlüsselrotation pausiert Audit-Schreibvorgänge durchlaufener Studios
bis zu ihrem Commit. Die Alternative (Audit in eine eigene Transaktion) bleibt verworfen: sie
gibt die Atomarität von Geschäftsdaten und Protokoll auf.
