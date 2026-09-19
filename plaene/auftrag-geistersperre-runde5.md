# Auftrag: Geistersperre, Runde 5 — zwei Gegenlesungen, NULL Überschneidung

Stand `eddd42d` auf `claude/geistersperre-rennen`. Zwei unabhängige Prüfspuren
(Astra, lesend im Repo; Claude-Review, ausführend) haben zusammen elf Befunde
geliefert — **kein einziger kam in beiden vor**. Ich habe jeden tragenden
Befund SELBST nachgemessen; die Zahlen unten sind meine, nicht die der Prüfer.

**Einordnung nach der Modellregel:** Diese Runde IST sehr komplex — vier der
sieben Bauten gehören zur Klasse „eine Zusicherung, die still grün bleibt",
und drei davon sind Zusicherungen, die WIR in Runde 4 selbst eingeführt haben
und deren Text mehr behauptet, als sie hält.

## Meine eigenen Messungen am Stand eddd42d

    volle Suite            SUITE_EXIT=0, Dateizahl-Ritual 327 = 327 (diff EXIT 0)
    eigene Datei           74 PASS / 0 FAIL, EXIT 0
    npm run lint           EXIT 0

    (M1) fünfter Nehmer in routes/module.js#schliesseSeilSperren, Studio-Lock
         ZUERST, Tagesschlüssel danach, EINFACHE Anführungszeichen
                                           -> 74 PASS / 0 FAIL, EXIT 0  BLIND
    (M2) Umbenennen-Schlüssel + ':umbenennen' in routes/admin/geraete.js:475
                                           -> 74 PASS / 0 FAIL, EXIT 0  BLIND
    (M3) `seil`-Fenster: Anker Zeile 4578, Ende 5424 = 847 Zeilen, darin FÜNF
         weitere Funktionen; `const jetzt = jetztISO();` liegt gar nicht darin
    (M4) `const jetzt = jetztISO();` steht 4× in routes/sichtpruefung.js
         (2869, 3188, 3296, 4413) — die Zusicherung prüft die GANZE Datei
    (M5) Handler-Fenster `async function postMangelNachtragHandler(` bis zur
         nächsten Top-Level-Funktion: Zeile 4392–4815, 424 Zeilen, und JEDE
         der sechs verankerten Zeichenketten kommt darin GENAU EINMAL vor
    (M6) `app.listen(0)` ohne Host bindet gemessen an 0.0.0.0
    (M7) routes/module.js Tagescheck: `ladeAktiveSeilGeraete(req.studioId)`
         bei :2628 AUSSERHALB der Tx (ohne `t`, also über den Pool), Tx-Beginn
         :2859, INSERT :2982 mit `e.geraet_id`/`e.geraet_name` aus genau jener
         Vorlesung — KEINE Nachprüfung von `aktiv` in der Tx

## ZU BAUEN

### B1 (schwerste): Abschnitt 7 sieht nur EINE Schreibweise

`NEHMER_MUSTER` verlangt `hashtext($1))"` mit DOPPELTEM Anführungszeichen,
unmittelbar gefolgt von ``[`seilkontrolle:${``. Die Zusicherung bei :731 sagt
wörtlich „in keiner Schreibweise". M1 zeigt: einfache Anführungszeichen
genügen, und die Nehmerzahl bleibt bei 4, weil der fünfte gar nicht gefunden
wird. Das ist genau die Klasse, gegen die Runde 4 angetreten ist.

**Zu bauen:** nicht das Muster nachschärfen, sondern die Frage umdrehen —
INVENTAR statt Mustersuche. Sammle ALLE Aufrufe von `pg_advisory_xact_lock`
in `routes/` (nach Kommentarabzug; heute 23 Fundstellen roh, davon rund 15
echte Aufrufe) und halte die vollständige Liste gegen eine LITERAL
hingeschriebene Erwartung (Datei + Schlüsselausdruck, kanonische Form).
Ein neuer Nehmer — in welcher Schreibweise auch immer — erscheint dann als
neuer Eintrag und macht die Liste rot; wer ihn hinzufügt, trägt ihn bewusst
nach. Die Prüfung „Tagesschlüssel als ERSTE Anweisung der Tx" bleibt und gilt
weiterhin für jeden Eintrag, der auf `seilkontrolle:` sperrt.

**Gegenproben, beide Richtungen, je einzeln gemessen:**
 - M1 wörtlich wiederholen (einfache Anführungszeichen, gegenläufige Ordnung)
   -> MUSS rot werden. Vorher war es 74/0.
 - dieselbe Zeile mit DOPPELTEN Anführungszeichen -> ebenfalls rot (heute
   schon, von mir gemessen: 73 PASS / 1 FAIL).
 - unveränderter Baum -> 0 Kreuze.

### B2: der Schlüssel der ECHTEN Umbenennen-Route ist nirgends verankert

M2: Suffix an `routes/admin/geraete.js:475` -> alles grün, obwohl die
gemeinsame Serialisierung mit dem Nachtrag damit weg wäre. Für Löschen und
Nachtrag gibt es je einen `abschnitt()`-Anker (Test :617-628), für das
Umbenennen keinen — dabei ist es genau die Route, deren Rennen Szenario C
nachspielt, und H3 ist dort eine Attrappe.

**Zu bauen:** ein `abschnitt()`-Anker auf
`router.post("/geraete/umbenennen/:id"` nach dem Vorbild des Löschen-Ankers:
Positivkontrolle (Abschnitt gefunden und nach Kommentarabzug nicht leer),
`const jetzt = <AUSDRUCK>;`, `const heute = jetzt.slice(0, 10);` und die
Lock-Zeile ZEICHENGLEICH.

**Gegenprobe:** M2 wörtlich -> MUSS rot werden.

### B3: der verankerte „Seil-Zweig" ist 847 Zeilen lang und enthält fünf
### fremde Funktionen; die `jetzt`-Zusicherung prüft die ganze Datei

M3/M4. Die vier `seil.includes(...)` und die Reihenfolge-Zusicherung sagen
heute nur, dass die Zeilen IRGENDWO in 847 Zeilen in dieser Reihenfolge
stehen; die `jetzt`-Zusicherung findet ihren Treffer in einem von drei
fremden Handlern.

**Zu bauen:** das Fenster aus dem HANDLER ableiten — von
`async function postMangelNachtragHandler(` bis zur nächsten Top-Level-
Funktion bzw. Routen-Registrierung (M5: 4392–4815, 424 Zeilen). Darin jede
verankerte Zeichenkette auf **GENAU EINMAL** prüfen, nicht auf `includes`
(M5 belegt, dass das heute für alle sechs zutrifft). Die `jetzt`-Zusicherung
wandert in dieses Fenster. Die Prüfung des `jetztISO()`-Rumpfes in
`core/datum.js` bleibt, wie sie ist.

**Gegenproben:**
 - in `routes/sichtpruefung.js:4413` NUR `jetztISO()` durch einen
   UTC-Ausdruck ersetzen -> MUSS rot werden (heute grün, weil drei weitere
   Vorkommen in der Datei stehen).
 - eine der beiden Lock-Zeilen aus dem Handler in den nachfolgenden
   `postGeraeteHinweisUebernehmenHandler` verschieben -> MUSS rot werden.
 - unveränderter Baum -> 0 Kreuze.

### B4: der Dateiscan von Abschnitt 7 hat keine Referenz von AUSSEN

`sammle()` läuft nur über `routes/`, nimmt nur `.js`, und `e.isDirectory()`
ist bei einem symbolisch verlinkten Verzeichnis false — der Teilbaum wird
still übersprungen. Es gibt keinen Abgleich gegen `git ls-files`, obwohl
`test/helfer/quelltext-scan.js` genau dafür `ermittleGitReferenz()` mitbringt
(diese Klasse ist bei uns am 14.09.2026 gemessen worden).

**Zu bauen:** den eigenen Scan durch den vorhandenen Helfer ersetzen ODER die
gescannte MENGE gegen `git ls-files` halten. Endungen `.js`, `.cjs`, `.mjs`.
Ein Scan-Fehler (Symlink, unlesbar) ist ein FEHLER, kein stilles Auslassen.

**Achtung, Hausregel:** wer einen bestehenden Helfer anschliesst, erbt dessen
Zusicherungen NICHT — die Erfassungs-Konstante des Helfers gehört am AUFRUFER
gegen eine EIGENE, literal hingeschriebene Erwartung gehalten.

**Gegenproben:** die Endungsliste kürzen; ein Verzeichnis aus dem
Erfassungsbereich nehmen -> beides MUSS rot werden.

### B5: dieselbe Aussage an DREI Orten

Die Liste „WAS OFFEN BLEIBT" (Tagesgrenze, Offline-Nachzügler, Demo-Löscher)
steht wortgleich im Produktivkommentar `routes/sichtpruefung.js:4666-4679`,
im Testkopf :75-81 und in `docs/offene-befunde-31-08-2026.md`. Das ist die
Fehlerquelle, die unsere CLAUDE.md als häufigste dieses Projekts führt — und
sie ist durch MEINEN Auftrag zu Runde 4 entstanden.

**Zu bauen:** EIN Ort bleibt vollständig (`docs/offene-befunde-31-08-2026.md`).
Kommentar und Testkopf bekommen je EINE Zeile, die den Abschnitt beim Namen
nennt und auf ihn verweist — keine Aufzählung der Punkte mehr. Der Verweis
nennt beide Abschnitte genau (Runde 2 trägt die Punkte 1-2, Runde 4 die
Punkte 3-4); „OFFEN 17.09.2026" allein ist heute mehrdeutig, es gibt fünf
Abschnitte mit diesem Datum.

### B6: beide Testserver binden an 0.0.0.0

M6. Der zweite (`:462`) mountet den ECHTEN Admin-Router und vergibt jedem
eingehenden Request eine erfundene Admin-Sitzung; dieselbe Suite läuft auf
dem Live-Server als Deploy-Gate.

**Zu bauen:** beide `listen(0)` in DIESER Datei auf `listen(0, '127.0.0.1')`.
Mehr nicht — die Klasse ist vorbestehend und gross (siehe D7), sie wird hier
NICHT repo-weit behoben.

### B7: Szenario G misst PostgreSQL, nicht den Prüfling

Die beiden G-Zusicherungen können durch KEINE Änderung an Produktivcode rot
werden — sie fahren ad-hoc-SQL gegen einen eigens erfundenen Schlüssel. Das
ist in Ordnung (sie belegen, WARUM die Ordnung tragend ist), aber es muss
DASTEHEN.

**Zu bauen:** ein Satz im Testkopf und bei Szenario G: diese beiden
Zusicherungen messen eine Eigenschaft von PostgreSQL, nicht des Prüflings,
und tragen keine Regressionsaussage. Kein Code.

## ZU DOKUMENTIEREN, NICHT ZU BAUEN

Alles nach `docs/offene-befunde-31-08-2026.md`, in den Abschnitt der Runde 5,
jeweils mit der Angabe, ob ich es gemessen oder nur gelesen habe.

- **D1 (der gewichtigste): der Seil-Tagescheck hat dieselbe Lücke, die dieser
  Beitrag für den Nachtrag schliesst — VIERTER Eintrittspunkt.** M7, von mir
  am Quelltext nachgelesen: Lesen bei :2628 ausserhalb der Tx, Tx ab :2859,
  INSERT :2982 mit Gerät-Id UND Gerätename aus der Vorlesung, keine
  Nachprüfung. Der Tagesschlüssel serialisiert die SCHREIBER, nicht den
  Lesezeitpunkt. **Damit ist zugleich unser eigener Kommentar bei
  `routes/sichtpruefung.js:4630` zu weit gefasst** — er sagt, das Rennen sei
  am 22.08.2026 geschlossen worden, „indem BEIDE Seiten diesen Schlüssel
  nehmen". Für das Löschen stimmt das, für den Tagescheck nicht. Den Satz
  entsprechend einschränken (das ist die einzige Textänderung aus D1).
  NICHT dynamisch gemessen.
- **D2:** der Nachtrag HÄLT den Tagesschlüssel, während er auf den Studio-Lock
  wartet — den jede auditschreibende Transaktion des Studios hält. Solange er
  wartet, blockiert er Tagescheck, Löschen und Umbenennen desselben Studios
  für denselben Tag. Vor diesem Beitrag nahm er den Tagesschlüssel gar nicht.
  Benannte Folge dieses Beitrags, kein `lock_timeout` im Repo.
- **D3:** `heute` entsteht im Nachtrag ganz oben im Handler (:4413), bei den
  anderen Nehmern unmittelbar vor der Tx. Die Tagesgrenzen-Fenster sind
  deshalb NICHT gleich gross — Punkt 3 des Runde-4-Abschnitts behauptet
  derzeit das Gegenteil und ist zu korrigieren.
- **D4:** `ladeAktiveSeilGeraete(studioId, exec = db)` — ein künftiger Aufruf
  OHNE `exec` innerhalb einer `db.tx` zieht eine zweite Pool-Verbindung,
  während die Tx eine hält. Ein Riegel wie bei `seilNamenskollision` passt
  hier NICHT (die Funktion wird zu Recht auch ohne Tx aufgerufen). Einziger
  Schutz bleibt die — nach B3 handlergebundene — Literalzusicherung.
- **D5:** die Nachprüfung liest `SELECT *` über ALLE aktiven Seilgeräte des
  Studios und filtert in JavaScript, während zwei Locks gehalten werden.
  Hier nicht optimiert.
- **D6:** drei veränderliche Aussen-Variablen statt eines Rückgabewerts der
  `db.tx`; das Repo hat daneben das Muster `const ergebnis = await db.tx(...)`.
  Hier nicht umgebaut.
- **D7:** `app.listen(0)` ohne Host ist repo-weit: **411 Fundstellen in 132
  Dateien**, und mindestens zehn Testdateien mounten `routes/admin`. Von mir
  gezählt. Die eine Prüfspur hat den Befund „blockierend" genannt — nach
  dieser Zahl trägt die Einstufung für DIESEN Beitrag nicht; er fügt eine
  Instanz zu 411 hinzu und behebt seine eigenen zwei.
- **D8:** Abschnitt 7 vergleicht `davor` samt nachgestellter Kommentare
  (`ohneKommentare` entfernt nur GANZE Kommentarzeilen). Ein Kommentar am
  Tx-Kopf macht ihn deshalb rot, obwohl nichts Fachliches geschah — Alterung
  in die sichere Richtung, aber es gehört benannt.

## Auflagen

- Kein Kommentar und kein Testkopf darf behaupten, die Geistersperre sei
  erledigt. Was gilt: drei Eintrittspunkte geschlossen, VIER Restwege benannt
  und datiert (neu: der Tagescheck).
- Jede Gegenprobe: Zielpfad als Argument, Fundstellen zählen, Abbruch bei ≠ 1,
  Marker `GEGENPROBE-DEFEKT (absichtlich, wird zurueckgenommen)` mitschreiben,
  `node --check`, Rücknahme gegen eine unabhängige `cp`-Kopie mit `diff`
  EXIT 0 und md5. Rücknahme NIE mit einem Testlauf verketten.
- Zum Schluss: volle Suite (`bash test/run.sh > <log> 2>&1; echo
  "SUITE_EXIT=$?"`, ohne Pipe, ohne äusseres `flock`), Dateizahl-Ritual,
  `npm run lint`, Marker-Scan, `git status` leer.
- Die Wegwerf-DB heisst `gymdocu_test`; fehlt sie nach einem Suite-Lauf:
  `sudo -u postgres createdb -O gymdocu gymdocu_test`.
- Melde JEDE Stelle, an der du mir widersprichst. Bei B1 rechne ich
  ausdrücklich damit, dass das Inventar unbequemer ist als gedacht — dann
  sag mir, WAS konkret dagegen spricht, statt es zu verkleinern.
