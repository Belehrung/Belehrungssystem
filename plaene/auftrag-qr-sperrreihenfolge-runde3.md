# Runde 3 — WENIGER Gerüst, nicht mehr

Arbeitsbaum `/home/user/gymdocu`, Zweig `claude/qr-zuordnung-sperrreihenfolge`
(Stand `281bbd6`), sauber, gehört dir allein.

**Die Produktionsänderung ist fertig und bleibt, wie sie ist.** Zwei
unabhängige Gegenlesungen haben an der einen Anweisung nichts auszusetzen —
kein Mandantentrennungsbefund, kein Logikfehler, keine neue Sperr-Kante. Auch
dein Widerspruch zu `db.tx()` trägt.

**Was nicht trägt, sind die Beweise.** Und das ist inzwischen ein Muster:
nach zwei Runden ist die Testdatei auf rund 700 Zeilen gewachsen, und die
zweite Gegenlesung findet acht Befunde darin, zwei davon blockierend. Diese
Runde baut deshalb **weniger**: was nicht bindet, fliegt raus, statt dass
noch eine Schicht darüber kommt.

## Zwei blockierende Befunde — BEIDE von mir selbst gemessen

### A1. Die Kernprobe unterscheidet die beiden Fassungen NICHT

VON MIR GEMESSEN: die ALTE Zwei-Anweisungs-Fassung (`git show
0a3ded7:core/qr-zuordnung.js`) wieder eingesetzt, frische Datenbank,
Testdatei unverändert —

    EXIT=0, 32 PASS / 0 FAIL

**Auch der „P1-NACHHER KERNFALL (Punkt 1+2)" bleibt grün.** Der Beweis, der
die ganze Behebung tragen soll, hätte die Fassung, die er ersetzt, nicht
bemerkt.

Der Grund steht in der Probe selbst: `c` wird von `S_P1C` **vollständig
beansprucht**, bevor `b` freigegeben wird. Damit hätte auch das alte,
separate UPDATE `c` übersprungen — wegen seines eigenen `AND studio_id IS
NULL`, nicht wegen eines gemeinsamen Snapshots. Die Probe unterscheidet
„unsichtbar" nicht von „sichtbar, aber schon vergeben"; ihre Vorbedingung
entfernt genau den Unterschied, den sie zeigen soll.

**Zu bauen:** `c` bleibt UNBEANSPRUCHT. Dann muss die alte Fassung es
erfassen (und dabei entweder blockieren oder es mitbeanspruchen), die neue
nicht. **Abnahmebedingung, wörtlich: mit `git show
0a3ded7:core/qr-zuordnung.js` eingesetzt MUSS die Datei rot werden.** Miss
das und melde die Zahl — vorher gilt der Beweis nicht.

Der von dir gemeldete vorbestehende Klassifizierungsfehler (`throw`
„gebrochenes Invariant") steht dem im Weg, wenn `c` unentschieden bleibt.
**Behebe ihn NICHT** — er ist ein eigener Beitrag. Bau die Probe so, dass
sie ihn nicht auslöst: `c` darf am Ende schlicht frei bleiben, solange kein
zweiter Aufruf gleichzeitig daran arbeitet. Wenn das nicht geht, sag es mit
der Messung, statt es zu umgehen.

### A2. Die angekündigte Mutation HÄNGT, statt rot zu werden

VON MIR GEMESSEN, `await` vor `const p1E1 = qrZuordnung.beanspruche(A, …)`
in `(e1)`, frische Datenbank, harte Zeitgrenze von 180 Sekunden —

    EXIT=124 (die Zeitgrenze hat abgebrochen)
    Genau EINE (e1)-Zeile im Log:
      ✓ (e1) Testaufbau … die externe Verbindung hat ihre Sperre … erworben
    danach nichts mehr.

Kein FAIL, keine Zusicherung — ein Hänger. Der Halter wartet auf `gateE1`,
das erst nach der Beobachtungsschleife geöffnet wird; die wird nie erreicht.
**Deine gemeldete Zahl „308 PASS / 1 FAIL" für diese Mutation kann so nicht
gemessen worden sein** — vermutlich hast du an einer anderen Stelle mutiert.
Sag im Bericht, wo.

**Das ist der gefährlichere der beiden Befunde**, denn `test/run.sh` startet
Testdateien OHNE Laufzeitgrenze, und dieselbe Suite ist auf dem Live-Server
das Deploy-Gate. Eine Datei, die hängen kann, hält dort die Auslieferung an —
genau die Krankheit, die dieser Beitrag heilen soll, in neuer Verkleidung.

**Zu bauen:** JEDE Wartestelle bekommt eine harte Zeitgrenze, die den Lauf
mit einer FEHLGESCHLAGENEN ZUSICHERUNG beendet, nicht mit einem Hänger — auch
`await gateE1`, auch `await haltendeTx`, auch die Gate-Wartezeiten in der
neuen Datei (G3 wartet heute unbegrenzt auf `haltendeTx`). Freigabe und
Rollback gehören in `finally`, damit jeder Fehlerpfad sie erreicht.
**Abnahmebedingung: dieselbe Mutation muss danach eine rote Zusicherung
liefern, nicht EXIT 124.**

## Sechs weitere Befunde — knapp, weil sie klar sind

3. **Leere Probenschleifen gelten als bestanden.** `every()` auf einer leeren
   Liste ist wahr. Literale Längen dazu: `=== 4` bzw. `=== 5`.
4. **`P1b` akzeptiert BELIEBIGE Fehler als Nachweis.** Nur Erfolg oder der
   EINE eng identifizierte bekannte Fehler dürfen durchgehen; alles andere
   rot. Der Rückgabewert von `wartenBisBlockiert(...)` wird dort außerdem
   ignoriert.
5. **G2 hängt weiter an 200 ms**, nicht an einer Barriere: ersten Halter bis
   zur ausdrücklichen Freigabe offenhalten, zweiten starten, seine Blockade
   nachweisen, DANN freigeben.
6. **`(e1)` zählt zwei BELIEBIGE blockierte Verbindungen der Datenbank**, nicht
   die beiden geprüften. Die Teilnehmer-PIDs erfassen oder ihre Blockadeketten
   auf den Halter zurückführen.
7. **Unbehandelte Ablehnungen:** `Promise.allSettled([p1E1, p2E1])` wird erst
   nach der Beobachtungsphase erzeugt; lehnt einer vorher ab, kann der Prozess
   abbrechen. Sofort nach dem Start erzeugen, später abwarten. Dasselbe beim
   PID-Helfer der neuen Datei, dessen inneres `async`-IIFE weder
   zurückgegeben noch behandelt wird.
8. **Die Ordnungs-Aussage wird EHRLICH BEGRENZT, nicht ausgebaut.** G3 beweist
   EINEN Schnitt (vier kleinere gesperrt, fünf größere frei) — das schliesst
   „kleinste zuerst, Rest absteigend" aus, aber nicht jede denkbare Ordnung.
   **Entscheidung: der Schnitt reicht, der Anspruch wird zurückgenommen.**
   Schreib in die Zusicherung und den Kommentar, was wirklich bewiesen ist,
   statt einen vollständigen Reihenfolgenachweis zu behaupten. Mehr Gerüst
   wäre hier teurer als der Gewinn.

## Was AUSDRÜCKLICH NICHT in diese Runde gehört

Ich baue nur die acht Punkte oben. Findest du etwas anderes — melde es,
bau es nicht.

- **Die Produktionsdatei bleibt unverändert**, außer ein Befund zwingt dazu.
  Sagt eine Messung etwas anderes: melden, mit der Zahl.
- Der vorbestehende `throw`-Fehler (dein eigener Fund): eigener Beitrag.
- **Eine Laufzeitgrenze je Testdatei in `test/run.sh`** wäre die
  Wurzelbehebung zu A2 — aber sie ändert das Deploy-Gate für ALLE 325
  Dateien und gehört nicht in diesen Beitrag. Nur berichten.
- Seilkontroll-Fälle der Karte #233.
- **Testabfragen ohne `studio_id` sind KEIN Befund.**

## Abschluss

1. Volle Suite SELBST: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`
2. Dateizahl-Ritual, breites Muster. Stand 325 = 325, `diff` EXIT 0.
3. `npm run lint` — wörtlich, AUCH bei Grün.
4. Marker-Scan **mit dem vollen Muster und dem Ausschluss auf dem PFAD**:
   `grep -v "^\./node_modules/"`, NICHT `grep -v node_modules`. Genau daran
   lag unsere Differenz: zwei der sechs Markerzeilen zitieren das Kommando
   selbst und enthalten deshalb das Wort `node_modules`. Sollwert 6.
5. Committen und pushen, BEVOR du auf einen langen Lauf wartest.

**Melde wörtlich:** die beiden Abnahmebedingungen (alte Fassung eingesetzt →
ROT; `await`-Mutation → rote Zusicherung statt EXIT 124), dazu Suite-Exit,
Dateizahl, Lint, Marker. **Und sag, wo du die `await`-Mutation in Runde 2
angewandt hast** — die Zahl, die du gemeldet hast, passt nicht zu der Stelle,
die ich gemessen habe.

**Widersprich mir mit einer Messung, wenn eine Vorgabe nicht trägt.**
