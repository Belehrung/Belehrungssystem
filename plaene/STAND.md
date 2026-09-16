# Stand — 16.09.2026, ~11:50 UTC

Diese Datei ist der Übergabepunkt. Der Takt-Prompt ist beim Bau von
Beitrag 1 stehengeblieben. **Hier steht, was wirklich gilt.**

Alles, was ein Nachfolger braucht, liegt jetzt IM REPO — Plan, Arbeitspapier
und Befunde. Kein Verweis mehr in den Scratchpad: der ist weg, sobald der
Container neu startet.

**`plaene/ENTSCHIEDEN.md` daneben hält fest, was der Betreiber entschieden
hat und was nicht neu aufgerollt wird.** Diese Beschlüsse standen bis zum
16.09.2026 ausschliesslich im Prompt einer Routine.

## Stand JETZT — das gilt, alles Weitere ist Verlauf

Die Abschnitte unter dieser Übersicht beschreiben, WIE es dazu kam. Wo sie
einen Zwischenstand melden, ist er überholt; maßgeblich ist diese Liste.

| Sache | Stand |
|---|---|
| Beitrag 1 (Freigabe nur melden, wenn sie stattfand) | gemergt, `186c0aa` |
| Beitrag 2a (Datenmodell und Leser) | gemergt `613a2c9`, Deploy 415, live-check grün |
| Beitrag 2b-1 (Ausmustern auslösbar) | gemergt `eb276d9`, Deploy 416, live-check grün |
| Die sieben BGB-Einträge | gemergt `7abea9f`, Deploy 417 `success`, live-check grün |
| Rechtsstand-Wächter Stufe 1 | Plan gegengelesen, Bauauftrag steht, noch nicht gebaut |
| Orbit4-Recherche | erledigt, `plaene/wettbewerb-orbit4.md` |
| Beitrag 2b-2 (Rückweg) | noch nicht geschrieben |
| Doku ins Belehrungssystem-main | gemergt `cbf5c31` (Bot 5/5, vier Befunde behoben) |
| Verklemmung `qr_token` (#233) | **Runde 2 läuft.** Runde 1 gebaut (`0a3ded7`), Suite grün, aber die Beweise tragen nicht: Gegenlesung 5 Befunde, drei davon von mir nachgemessen und alle drei zutreffend, dazu ein eigener (Datei nicht wiederholbar). Auftrag: `plaene/auftrag-qr-sperrreihenfolge-runde2.md` |

**`/home/user/gymdocu` ist BELEGT** — dort arbeitet ein Executer an der
Verklemmung. Nicht anfassen, bis seine Benachrichtigung da ist.

## Erledigt — Beitrag 1 ist gemergt

**PR #446, Squash `186c0aa`**, „Eine Freigabe wird nur gemeldet und
protokolliert, wenn sie stattgefunden hat". Drei Fehler behoben, die
vorher schon falsch waren:

- ein `reparatur_freigabe`/`seilkontrolle_freigabe`-Audit für ein UPDATE,
  das keine Zeile getroffen hat,
- die Tablet-Meldung „Das reparierte Gerät darf wieder genutzt werden" bei
  einer wirkungslosen Absendung,
- eine unwiderrufliche Fotolöschung innerhalb eines rollbaren Vorgangs.

Dazu ein eigener, nachgelagerter Löschnachweis `seil_fotos_geloescht`, der
Datei-Erfolge, „war bereits weg" und Fehlschläge getrennt beurkundet und
nur nennt, was er selbst gemessen hat.

Fünf Runden, vier Prüfspuren (eigene Lesung, Gegenlesung, Review-Bot, CI).
Der Bot ging von 4/5 auf 5/5; alle Befunde wurden nachgemessen, keiner
blind übernommen. Zwei Befunde betrafen Regressionen der Behebung selbst
(ein Verklemmungs-Kreis, ein verschwundener Löschnachweis), einer eine
Sandbox-Eigenschaft, die als allgemeingültige Tatsache festgeschrieben war
und deshalb erst in der CI aufflog.

**Noch zu tun nach dem Merge:** Deploy-Lauf prüfen (`actions_list` auf
`deploy.yml`, richtiger `head_sha`, `success`) und
`bash tools/live-check.sh`.

## Erledigt — Beitrag 2a ist gemergt und ausgeliefert

**PR #447, Squash `613a2c9`, Deploy 415 `success`, live-check grün.**
„Ausmusterung mit offenem Mangel (Teil 2a): Datenmodell und alle Leser".

Migration 0057 (status-CHECK um `ausgemustert` erweitert, eigene Zeitstempel
je Tabelle, drei Kopplungsregeln), dazu alle Leser: beide PDF-Anhänge, beide
Zeitraumfilter, Aufbewahrung, Ausfallzeit, Statistik, Reparaturformular,
Defekt-Mail und Tablet-Hinweis. Sechs neue Testdateien, vier bestehende
Wächter fachlich umgestellt, ein gemeinsames Textmodul
`core/ausmusterung-hinweis.js`.

**Drei Bau-Runden, zwei Gegenlesungen, zwei Prüfspuren.** Die drei teuersten
Funde waren allesamt Zusicherungen, die nicht rot werden konnten — und zwei
davon fand erst die ZWEITE Gegenlesung, die es nach unserer Rundenregel fast
nie gibt:

- Der Migrationstest prüfte den Schema-Umbau gar nicht (`db.init()` stellt sein
  Ergebnis her, die Migration nimmt den frühen Ausstieg). Gemessen: gesamter
  Umbau-Block entfernt → beide Schema-Tests grün. Danach prüfte der neue
  Abschnitt die drei NEUEN Kopplungsregeln immer noch nicht — gemessen: alle
  drei auf `CHECK (TRUE)` → 30 PASS / 0 FAIL.
- Eine der neuen Regeln erzwang wegen SQL-NULL nichts (`aktiv` ist nullable,
  `aktiv = 0` ergibt bei NULL weder wahr noch falsch). Gemessen mit
  Positivkontrolle. Dieselbe Lücke beim leeren Zeitstempel.
- Die Mandantentrennungs-Zusicherung der Aufbewahrung war tautologisch und
  deckte danach nur eine von drei Stufen ab.

**Abschließend selbst gemessen** (neun Proben, neun wie erwartet): beide
Lücken zu, bestehende Reparatur- und Freigabewege brechen nicht, der für 2b
geplante Schreibweg geht durch — auch für ein bereits inaktives Gerät.

## Verlauf — Beitrag 2b-1 (inzwischen gemergt und ausgeliefert)

**2b ist geteilt.** 2b-1 macht das Ausmustern auslösbar; 2b-2 baut den Rückweg
„Offene Mängel abschliessen" für JEDES anderweitig inaktive Gerät mit offenen
Mängeln. Getrennt, weil 2b-1 allein schon zwei Planprüfungen gebraucht hat.

**Das gültige Arbeitspapier ist `plaene/auftrag-2b1-v3.md`** — im Repo, nicht
im Scratchpad. Der Executer arbeitet damit in `/home/user/gymdocu` auf dem
Zweig `claude/ausmusterung-ausloesen`, Stand `master` = `613a2c9`. Solange er
läuft, fasst niemand sonst diesen Baum an.

### Warum es drei Fassungen brauchte

Der PLAN lag zweimal gegengelesen vor (18 Befunde, alle getragen). Trotzdem
wurden die Fassungen 1 und 2 des daraus geschriebenen ARBEITSPAPIERS beide
abgelehnt — je zehn Befunde, zusammen neun blockierende. **Fast alle standen
in meinem eigenen Auftragstext, nicht im Plan.**

Fassung 1, vier blockierende — alle vier von mir selbst nachgemessen:

- Der Block mit den nur über den NAMEN zugeordneten Mängeln war
  VORAUSGEWÄHLT. Gleichnamige Cardio-/Kraftgeräte sind ausdrücklich erlaubt
  und der Tagescheck schreibt keine `geraet_id` — zwei Geräte „Laufband",
  ein Klick, beide Mängel unwiderruflich geschlossen. Im Normalbetrieb.
- Der Weg für „keine Mängel" setzte den Ausmusterungsstempel bei JEDER
  Deaktivierung und sperrte zugleich die Reaktivierung — die gewöhnliche
  Deaktivierung wäre unwiderruflich geworden. Die Betreiber-Entscheidung
  „ausgemustert ist ausgemustert" galt dem Ausmustern, nicht dem Deaktivieren.
- „Nimm den Studio-Lock zuerst" hätte einen Verklemmungs-Kreis mit dem
  Reparaturweg erzeugt.
- Das Token war nur ans Studio gebunden und liess sich von Gerät A auf
  Gerät B umhängen.

Fassung 2, fünf blockierende — und sie zeigen ein Muster: **fast alle zielen
auf den EINEN Abschnitt, den ich zwischen den beiden Prüfungen selbst
hinzugefügt hatte.** Eine Ergänzung nach der Prüfung ist eine ungeprüfte
Ergänzung, und sie war der schlechteste Teil des Papiers.

### Die Entscheidung: gestrichen statt verfeinert

Der hinzugefügte Abschnitt verlangte, dass JEDER Erzeuger eines Mangels vorher
das Gerät prüft. Er ist in Fassung 3 **gestrichen**, aus drei selbst
gemessenen Gründen:

1. Er serialisiert nicht. `db.tx()` beginnt mit einem blanken `BEGIN`; ein
   gewöhnlicher SELECT des Erzeugers wird vom Geräte-Lock nicht aufgehalten.
2. Seine naheliegende Absicherung (ein Zeilen-Lock auf das Gerät) erzeugt eine
   neue gegenläufige Lock-Kante — und eine einheitliche vorhandene Ordnung, zu
   der sie „passen" könnte, gibt es nicht: der Reparaturweg nimmt erst die
   Defektzeile, dann den Studio-Lock, die Seil-Freigabe umgekehrt.
3. Die Wartung benutzt einen anderen ID-Raum (`geraete_sperren.geraet_id`
   trägt dort eine `wartung_geraete.id`) — die Prüfung hätte auf die falsche
   Tabelle gezielt.

**Der Wettlauf bleibt damit ein bekannter, festgehaltener Rest:** zwischen
dem letzten Lesen und dem Commit kann ein neuer Mangel entstehen. Er macht
nichts unwiderruflich falsch — er hinterlässt einen offenen Mangel an einem
ausgemusterten Gerät. Sichtbar macht ihn 2b-2. Dasselbe Verfahren hat zwei
Tage vorher schon einen ganzen geplanten Beitrag gekostet; das ist Absicht,
nicht Nachlässigkeit.

**Eine DRITTE Planprüfung habe ich bewusst nicht gefahren**: das Muster war
benannt und die Behebung eine Streichung, keine Verfeinerung. Eine Runde
kostet zwischen 7 und 16 $.

### Was Fassung 3 sonst ändert

Abschnitt 0 ist jetzt JE TYP formuliert (Cardio/Kraft bleibt gewöhnlich
reaktivierbar; die Seilkontrolle behält ihren Löschweg und die 404 für den
früheren Reaktivierungsweg). Abschnitt 1 definiert DREI Mengen — sicher
zugeordnet (vorausgewählt, nicht abwählbar), angeboten (nie vorausgewählt),
bestätigt ausgewählt (muss mindestens einen tatsächlich geschlossenen Mangel
enthalten, sonst ist es eine gewöhnliche Deaktivierung). Das Token bindet
Studio, Gerät, Typ, Aktion und Schnappschuss und wird vor dem ersten
Datenbank-`await` exklusiv verbraucht. Die Kandidatenzeilen werden `FOR
UPDATE` gesperrt, bevor massgeblich gelesen wird. Jeder unerwartete
`rowCount` muss WERFEN — `db.tx()` committet jeden normal zurückgegebenen
Wert, ein `return { fehler: … }` ist kein Abbruch.

### Stand der Prüfung (16.09.2026, ~07:00 UTC)

Der Bau ist fertig und gepusht (`a610ec0`, `fbb6f0d`, `963c05b`), **aber
NICHT mergefähig.** Zwei unabhängige Prüfspuren plus eigene Messungen; die
Gegenlesung sagt ausdrücklich „nicht freigeben". Eine Nacharbeitsrunde läuft.

Eigene Ritualzahlen am unveränderten Stand: Suite `SUITE_EXIT=0`, 0 FAIL;
Dateizahl 323 = 323, `diff` EXIT 0; `npm run lint` EXIT 0.

**Selbst gemessen, blockierend:**

- **Verklemmung.** Zwei gleichzeitige Ausmusterungen VERSCHIEDENER Geräte im
  selben Studio: `40P01 deadlock detected`. `ladeKandidaten()` sperrt in drei
  getrennten Abfragen, Block 2/3 teilen dieselbe Menge unzugeordneter Mängel
  je nach GERÄTENAME anders auf. Gegenrichtung ebenfalls gemessen: eine
  gemeinsame, namen-unabhängige Sperrabfrage löst es. Genau die Lock-Kante,
  die mein eigener Auftrag verboten hatte.
- **Die drei neuen `auditAppend()`-Aufrufe sind unbewacht.** Der
  Kapselungs-Wächter liest nur `routes/admin/geraete.js`. Ein angehängtes
  `.catch(() => {})` überlebt die VOLLE Suite (`SUITE_EXIT=0, 0 FAIL`);
  dieselbe Mutation in der bewachten Datei gibt `EXIT 1, 2 FAIL`. Die
  unwiderrufliche Ausmusterung könnte committen, ohne Eintrag in der
  gehashten Kette.
- **Drei Zusicherungen, die nicht rot werden können**, je einzeln gemessen
  gegen einen Basislauf von 63 PASS / 0 FAIL: Mandantenfilter der
  Block-2-Abfrage entfernt → **63/0**; Block 3 stillgelegt → **63/0**;
  Tokenverbrauch wirkungslos → **63/0**.

**Aus den Prüfspuren, von mir nachgelesen und übernommen:** der
Seil-Rückfallzweig umgeht die Sperr-Prüfung des bestehenden Löschwegs und
erzeugt die „Geistersperre", vor der dessen Kommentar wörtlich warnt; die
Oberfläche behauptet „ENDGÜLTIG", wo die Handlung umkehrbar ist; `aktionsart`
wird nie geprüft, obwohl der Dateikopf es behauptet; Block 2/3 werden ohne
den erfassten Gerätenamen gerendert. Dazu acht kleinere Punkte.

**Methodisch festgehalten:** Anders als am 13.09.2026 überschnitten sich die
beiden Prüfspuren diesmal in drei von sechs Befunden. Die dortige
Verallgemeinerung („null Überschneidung, zwei Suchverfahren") beschrieb einen
Lauf, keine Regel. Die Einzelheiten stehen in `ASTRA-LAEUFE.md`.

### 2b-1 IST AUSGELIEFERT (16.09.2026, 11:30 UTC)

**PR #448, Squash `eb276d9`, Deploy 416 `success` mit dem richtigen
`head_sha`, live-check grün** (die beiden bekannten ℹ-Punkte: Zertifikat und
Health-Endpunkt sind aus dieser Umgebung nicht messbar, das ist erklärt).

Sechs Bau-Runden, drei Gegenlesungen, eine Review-Spur mit
Ausführungsrechten, ein Review-Bot. Mein Ritual auf dem Endstand: Suite
`SUITE_EXIT=0`, 0 FAIL; **324 = 324**, `diff` EXIT 0; Lint EXIT 0; Marker 6.
Merge-Botschaft zurückgelesen, endet an der Schlusszeile.

**Runde 6 hat die Messung geliefert, die niemand hatte:** der
Verklemmungskreis ist erstmals empirisch erzeugt worden —
`T1: 40P01 — deadlock detected`, nach der Behebung kein Deadlock. Behoben an
der Wurzel (kanonische Sperrreihenfolge im Nachtrag), nicht durch Wiederholen
bei `40P01`.

**Zwei Widersprüche des Ausführenden, beide gemessen — einer trug, einer
nicht:**

- **Er hatte recht:** mein Satz „ein `try/finally` lässt die Transaktion ohne
  Audit-Eintrag committen" war falsch. Selbst nachgemessen: `ROLLBACK GRIFF`.
- **Er hatte unrecht:** seine Dateizahl 320 = 320 stammt aus einem zu engen
  Sieb auf BEIDEN Seiten und übersieht genau die vier Einträge, die die
  Hausregel als Falle nennt (`ops/boot-smoke.js`, `test_deprovision.js`,
  `test_export.js`, `test_isolation_reads.js`). Richtig sind 324 = 324.

**Der Review-Bot hatte genau einen Befund — mit falscher Begründung und
richtiger Schlussfolgerung.** Am Thread beantwortet und berichtigt.

## Als Nächstes

1. **LÄUFT: die sieben BGB-Einträge in `core/rechtsstand.js` bestätigen.**
   Zweig `claude/rechtsstand-bgb-nr226` ab master. Alle sieben tragen jetzt
   `Art. 6 G v. 23.7.2026 I Nr. 226` und `bestaetigt_am: '2026-09-16'`,
   dazu ein Kommentar mit der Kette der drei Änderungsgesetze und der
   Positivkontrolle. Beide Richtungen SELBST gemessen gegen das echt
   geholte `bgb/xml.zip` (HTTP 200, 467.258 Bytes, ausgelesener Stand
   `zuletzt geändert durch Art. 6 G v. 23.7.2026 I Nr. 226`): mit dem neuen
   Eintrag siebenmal `unveraendert`, mit dem alten siebenmal `geaendert`.
2. **Rechtsstand-Wächter Stufe 1 bauen.** Der Plan ist am 16.09.2026
   gegengelesen (sechs Befunde, vier blockierend, alle sechs nach eigener
   Nachmessung getragen — der Nachtrag steht in
   `plaene/rechtsstand-kette-plan.md`), und der daraus abgeleitete
   Bauauftrag liegt als `plaene/auftrag-rechtsstand-stufe1.md` bereit.
   Startet, sobald der BGB-Beitrag gemergt ist — beide fassen
   `core/rechtsstand.js` an.
3. **Beitrag 2b-2** — Rückweg „Offene Mängel abschliessen" für jedes
   anderweitig inaktive Gerät. Macht den in 2b-1 bewusst offengelassenen
   Wettlauf sichtbar.
4. **Der `qr_token`-Verklemmung an die Wurzel** (Karte #233). Am 16.09.2026
   ZUM DRITTEN MAL eingetreten und diesmal an einem eigenen PR: CI-Lauf 1136,
   `test_feature_qr_zuordnung.js` Fall (e1), `40P01` auf demselben Statement
   wie am 13.09. Zweimal davor hat es einen Deploy angehalten (Läufe 180 und
   390 auf `skipped`). **Es ist dieselbe Klasse, die 2b-1 heute geschlossen
   hat:** ein Mehrzeilen-Schreiber ohne kanonische Sperrreihenfolge —
   `beanspruche()` (`core/qr-zuordnung.js:440`) schreibt mit EINEM UPDATE über
   eine Nummernspanne und überlässt die Sperrreihenfolge dem Planer. Die
   Behebung ist naheliegend (erst `ORDER BY nummer FOR UPDATE`, dann
   schreiben), aber NICHT gebaut und NICHT gemessen; die Gegenprobe muss den
   `40P01` erst wirklich erzeugen. Kein Wiederholen bei `40P01`.
5. **Takt-Prompt eindampfen.** Die Vorbedingung ist seit dem 16.09.2026
   erfüllt: `ENTSCHIEDEN.md` und `STAND.md` stehen im Standardzweig (`#43`,
   Squash `cbf5c31`). **Vorher aber messen, was NUR im Prompt steht** — er
   ist laut eigenem Vorspann eine Kopie der CLAUDE.md, aber nicht durchweg.
   Gemessen am 16.09.2026, Trefferzahl in `CLAUDE.md`: `pg_lsclusters` 3,
   `flock` 3, `workflow_run` 4, `get_check_runs` 2, ZIP-Archiv 1,
   Schlusszeile 1 — diese Teile sind doppelt und gehören gestrichen, nicht
   gepflegt. **NICHT in der CLAUDE.md und deshalb VOR dem Kürzen dorthin zu
   übernehmen:** der Suite-Aufruf mit `echo "SUITE_EXIT=$?"` samt der
   Begründung („wer das `echo` vergisst, wartet auf ein Signal, das nie
   kommt"), und der Umgang mit dem Review-Bot am PR. Wer den Prompt kürzt,
   ohne das zuerst zu verschieben, löscht die einzige Fassung.

## Erledigt — Orbit4-Recherche (Betreiberfrage 16.09.2026)

`plaene/wettbewerb-orbit4.md`. Nur die öffentliche Seite erreichbar
(`orbit4.com`/`.io` blockt der Egress-Proxy, `orbit4.org` geht), nichts
hinter dem Login. Kern: Orbit4 ist ein Betriebskosten-Werkzeug
(Kostenbudget je Gerät, Ticketkette mit Belegen, SLA gegen die
Servicefirma), wir ein Nachweis-Werkzeug — ihre deutsche Seite trägt
gemessen null Treffer für DGUV, Prüfung, Norm, Haftung. Empfehlung:
Gerätealter und Reparaturhistorie an der Ausmusterung sichtbar machen;
das ist der billige Teil ihrer Idee und trägt die Entscheidung
reparieren-oder-ausmustern schon allein.

### Verlauf der Runden zu 2b-1

**Der Review-Bot am PR hat genau EINEN Befund**, und es ist derselbe, den der
Ausführende in Runde 2 selbst gemeldet und ich vertagt hatte: die
Sperrreihenfolge gegen den Nutzungsnachtrag. Damit dreimal unabhängig
gesichtet (Ausführender, Gegenlesung, Bot) — er wird nicht weiter vertagt.

**ZWEI eigene Fehlaussagen dabei berichtigt, beide nachgelesen:**

1. Ich hatte behauptet, die Sperrreihenfolge des Nachtrags komme aus
   `ORDER BY erstellt_am, id`. Sie kommt aus der **Reihenfolge der
   abgeschickten Formularfelder** (`routes/sichtpruefung.js:2222` baut die
   Liste, `:2234` läuft darüber). Eine Sortierung auf unserer Seite konnte
   also prinzipiell nie dazu passen.
2. Ich hatte eine Geschwisterstelle in `routes/module.js` behauptet. Es gibt
   **keine** — `eingereichteSchluessel` kommt im Repo nur an diesen zwei
   Zeilen vor.

Das verschiebt die Wurzel: nicht die neue Route ist das Problem, sondern ein
Mehrzeilen-Schreiber ohne kanonische Reihenfolge. **Zwei gleichzeitige
Nachträge haben dieselbe Kante schon heute**, ohne Zutun dieses Beitrags. Die
Behebung sitzt deshalb dort und schliesst beide Fälle.

**Der eigentliche Auftrag der Runde ist nicht die Zeile, sondern die
Messung:** den `40P01` erstmals wirklich erzeugen. Bisher hat den Kreis
NIEMAND von uns empirisch hergestellt — weder ich noch der Ausführende noch
die Gegenlesung. Ohne diese Messung ist auch die Behebung eine Vermutung.

Auch die `.sort()`-Zeile selbst braucht eine Zusicherung: ohne Test ist sie
ein stiller Schutz, den jemand wegnimmt, ohne dass es auffällt.

**Merkposten zum Verfahren:** der Greptile-CHECK stand auf `success`,
während sein KOMMENTAR den P1 trug. Genau deshalb verlangt das Ritual, die
Kommentare VOR dem Häkchen zu lesen. Hier hat es getragen.

### Stand vor Runde 6 (16.09.2026, ~12:35 UTC)

Fünf Bau-Runden, drei Gegenlesungen, eine Review-Spur mit Ausführungsrechten.
Stand `329200b`. **Mein Ritual auf dem Endstand, selbst gefahren:** Suite
`SUITE_EXIT=0`, 0 FAIL; `test_feature_ausmusterung_ausloesen.js` 115 PASS /
0 FAIL; Dateizahl **323 = 323**, `diff` EXIT 0; `npm run lint` EXIT 0;
Marker-Scan 6; Baum sauber; Zweig nicht hinter master.

Runde 5 hat genau einen Punkt gebaut: der Audit-Eintrag
`geraet_ausgemustert` hält die Blockherkunft je Mangel-ID fest
(`mangel_sicher` / `mangel_name_gleich` / `mangel_name_abweichend` statt
`mangel_ids` und `anzahl`). Vier Gegenproben, beide Richtungen, darunter die
wichtige: alle drei Listen LEER geschrieben → `110 PASS / 5 FAIL`. Die
Zusicherung prüft also Inhalt, nicht Feldexistenz.

**Ein Fehler in MEINEM Auftrag, vom Ausführenden gemeldet:** mein wörtliches
Rezept fürs Dateizahl-Ritual liess die `sed`-Normalisierung weg, mit der die
`── … ──`-Umrandung aus den Lognamen fällt. So hätte `diff` NIE EXIT 0
geliefert, unabhängig von den Zahlen. Er hat es ergänzt und ausdrücklich
nachgefragt, statt es stillschweigend zu tun. Das Rezept im Takt-Prompt
enthält den Schritt; mein Auftrag hatte ihn verloren.

Ebenfalls von ihm gemeldet statt verschwiegen: sein erster Suite-Versuch lief
kurz als zwei parallele Läufe gegeneinander. Er hat beide beendet, die
Wegwerf-DB neu angelegt und genau einen sauberen Lauf gemeldet. Meine eigene
Suite bestätigt das Ergebnis unabhängig.

**Noch zu tun:** CI abwarten, Kommentare des Review-Bots lesen (nicht nur sein
Häkchen), `head_sha` gegen den Zweigkopf halten, mergen, Deploy-Lauf prüfen,
`live-check`.

### Verlauf der früheren Runden

Runde 4 ist gebaut und von mir geprüft (`355776f`): Suite `SUITE_EXIT=0`,
0 FAIL; **323 = 323**, `diff` EXIT 0; Lint EXIT 0; Marker 6; Baum sauber.

**BERICHTIGUNG an einem meiner eigenen Befunde — der Ausführende hat mir
widersprochen und recht behalten.** Ich hatte gemeldet, ein `try/finally` um
den Audit-Aufruf lasse die Transaktion OHNE Audit-Eintrag committen. Das ist
FALSCH, von mir selbst nachgemessen (eigene Wegwerf-DB, fachliches UPDATE,
dann `try { throw } finally { void 0; }` im schluckenden äusseren catch):

    aeusserer catch lief: true
    Wert in der DB danach: "alt"
    ERGEBNIS: ROLLBACK GRIFF — die Aenderung wurde NICHT committet.

`finally` ohne `return`/`throw` unterdrückt nichts; der Fehler läuft weiter,
`db.tx()` rollt zurück und wirft erneut. Der äussere Routen-catch schluckt
ihn nur auf HTTP-Ebene. **Richtig blieb die andere Hälfte:** ein SCHLUCKENDER
catch INNERHALB des Callbacks, erreicht über ein `try/finally` oder einen
weiterwerfenden catch, wurde vom Wächter übersehen — der ist geschlossen.

Ebenso zutreffend: dass die Mutation den Wächter NICHT rot werden lässt, ist
das RICHTIGE Ergebnis. Würde die Suche die Funktionsgrenze überschreiten,
würden die unveränderten, korrekten Aufrufe zu Fehlalarmen — das deckt sich
mit meiner eigenen Messung `EXIT 1, 54 PASS / 4 FAIL` aus der Runde davor.

Kleine Abweichung ohne Folge: sein Dateizahl-Ritual meldete 319 = 319, weil
beide Seiten mit demselben zu engen Sieb gemessen wurden. Mit dem breiten
Muster sind es 323 = 323.

**Runde 5 baut GENAU einen Punkt:** der Audit-Eintrag `geraet_ausgemustert`
hält die Blockherkunft je Mangel-ID fest (drei Listen statt `mangel_ids` und
`anzahl`). Das ist die Voraussetzung der Betreiber-Entscheidung von heute —
nachgemessen wird `mangel_ids` ausserhalb des Schreibers nur an einer
einzigen Stelle gelesen, die Umstellung ist also frei.

**Danach: PR, CI, Review-Bot-Kommentare, Merge, Deploy, live-check.**

### Verlauf der früheren Runden

Die dritte Gegenlesung fand drei Befunde, alle an Stellen, die Runde 3 neu
gebaut hat. **Zwei habe ich selbst gemessen:**

- **Die neue Blockanalyse des Audit-Wächters lässt ein `finally` durch —
  STILL.** `try { await auditAppend(…) } finally { void 0; }` um den Aufruf
  → `EXIT 0, 58 PASS / 0 FAIL`, während der Fehler in den schluckenden
  äusseren catch der Route läuft und die Transaktion ohne Audit-Eintrag
  committet. **Rückschritt gegenüber der Fassung vor Runde 3** — die alte
  Vorwärtssuche lehnte ein folgendes `finally` ausdrücklich ab.
- **Eine gewöhnliche Funktion wird nicht als Grenze erkannt.**
  `db.tx(async (t) => {` → `db.tx(async function (t) {` ergibt
  `EXIT 1, 54 PASS / 4 FAIL`. Laute Richtung, deshalb weniger gefährlich.

Der dritte Befund (die Nachsperrabfrage prüft die Gerätezuordnung nicht mit)
ist eine **Lücke, kein erreichbarer Fehler**: von mir nachgemessen, sieben
`UPDATE geraete_defekte` im Bestand, keines setzt `geraet_id`
(Positivkontrolle steht).

**Abbruchregel, die MICH bindet:** an 2b-1 werden nur noch diese drei Punkte
gebaut. Was der Ausführende sonst findet, wird gemeldet und festgehalten,
nicht gebaut. Das ist keine Vorhersage über das Ergebnis der nächsten
Prüfung — nur eine Aussage darüber, was ich noch baue.

**Noch VOR dem Merge zu bauen** (Betreiber-Entscheidung 16.09.2026, s.
`plaene/ENTSCHIEDEN.md`): Der Audit-Eintrag `geraet_ausgemustert` muss die
BLOCKHERKUNFT je Mangel-ID mitschreiben. Entschieden ist, bei Block-2/3
KEINE `geraet_id` zu schreiben — das ist richtig, setzt aber voraus, dass die
Unterscheidung sicher/geraten woanders erhalten bleibt. Nachgemessen: heute
trägt der Eintrag nur `mangel_ids` und `anzahl`, die Blockherkunft NICHT. Mein
eigener Empfehlungssatz („steht im Audit-Eintrag") war insoweit falsch.

**Festgehaltene Reste von 2b-1** (nicht gebaut, bewusst):

- Der Nachvergleich aus B1 ist unbewacht (stillgelegt bleibt die Suite grün);
  das Fenster liegt innerhalb einer Transaktion, der Schreibweg fängt eine
  nebenläufig geschlossene Zeile ohnehin selbst.
- Der 40P01-Kreis ist von NIEMANDEM empirisch reproduziert — weder vorher
  noch nachher. Steht so im Kopfkommentar und bleibt so.
- Erzeuger-Prüfung, `core/korrekturen.js`, der Hinweistext in
  `routes/module.js`, die zweite schmalere Verklemmung.

**Methodisch, und es hat gewirkt:** Der Vorbehalt „Testabfragen ohne
`studio_id` sind kein Befund" stand diesmal im PRÜFBRIEF statt in der
Nachmessung — und wurde zum ersten Mal in vier Läufen nicht gemeldet. Der
Eintrag aus dem Lauf davor hat seinen Zweck erfüllt.

### Verlauf der früheren Runden

Alle vier A-Punkte und alle drei B-Punkte behoben, Stand `46cf2af`. Eigene
Ritualzahlen: Suite `SUITE_EXIT=0`, 0 FAIL; 323 = 323, `diff` EXIT 0; Lint
EXIT 0; Marker 6.

**Selbst nachgemessen:**

- **A1 behoben.** Dieselbe Mutation, die vorher `EXIT 1, „Mutation bleibt
  UNERKANNT"` lieferte, ergibt jetzt `EXIT 0, 58 PASS / 0 FAIL` — der
  schluckende catch wird wieder erkannt. Der Vorfilter ist durch eine echte
  `{}`-Blockanalyse ersetzt.
- **Der Nachvergleich aus B1 ist UNBEWACHT.** Stillgelegt
  (`if (false && !diffNachsperren.gleich)`) → `EXIT 0, 105 PASS / 0 FAIL`.
  Die Mutation liegt im durchlaufenen Pfad, sie hat nur nie etwas zu
  entscheiden: kein Test erzeugt eine Abweichung im Zwischenfenster, und das
  Fenster liegt innerhalb EINER Transaktion, ist also ohne Einspritzpunkt
  kaum herstellbar. **Eingeordnet als Rest, nicht als Blocker** — der
  Schreibweg fängt eine nebenläufig geschlossene Zeile weiterhin selbst
  (`AND status = 'offen'` + `RETURNING`-Längenprüfung + `throw`, von mir
  nachgelesen). Es bleibt: ein Mangel, dessen TEXT sich in diesem
  Mikrofenster ändert, wird mit leicht veralteter Anzeige geschlossen.
- **Der Vergleich der Blockzuordnung ist tautologisch** (beide Seiten
  beziehen sie aus `blockVonId` des ungesperrten Lesens) — trägt aber nichts,
  weil `geraet_name`, `standort` und `seriennummer` seit Runde 2 mitverglichen
  werden und eine Blockänderung dort auffällt.

**Von mir selbst behoben** (Bagatelle): der Kopfkommentar von
`routes/admin/ausmusterung.js` behauptete weiterhin, der Audit-Scanner lese
nur `routes/admin/geraete.js` — seit Runde 2 falsch. Der Ausführende hat es
gemeldet, ohne es anzufassen; richtig so, es lag ausserhalb seines Auftrags.

**Warum eine DRITTE Gegenlesung:** nicht wegen der Rundenzahl, sondern weil
B1 (Pool-Sperre weggenommen, Nachsperrung eingezogen) eine
verhaltensändernde Umstellung ist, die bisher NIEMAND gegengelesen hat — und
ich dort schon selbst eine Lücke gefunden habe. Der Diff ist eng (630 Zeilen).

### Vorherige Runde (Verlauf)

Die Nacharbeit hat alle fünf blockierenden Punkte behoben, jeden mit
Gegenprobe, und der Ausführende hat **eine zweite Verklemmung selbst
gefunden**, die ich nicht hatte. Eigene Ritualzahlen auf diesem Stand:
Suite `SUITE_EXIT=0`, 0 FAIL; 323 = 323, `diff` EXIT 0; Lint EXIT 0;
Marker-Scan wieder 6.

Die zweite Gegenlesung sagt trotzdem „noch nicht freigeben". Drei Befunde
habe ich selbst nachgemessen bzw. am Kontrollfluss bestätigt:

- **Der Audit-Wächter wurde beim Beheben eines ECHTEN Fehlalarms zu grob
  entschärft.** Gemessen: `void 0;` hinter `try {` im schluckenden Schnipsel
  → `EXIT 1, 53 PASS / 1 FAIL`, „Mutation bleibt UNERKANNT". Ein schluckender
  catch wird nicht mehr erkannt, sobald vor dem Aufruf noch eine Anweisung
  steht.
- **Der Geistersperren-Riegel hat einen ungesicherten Eintrittspunkt.** Er
  steht in `if (finalSelection.length === 0)` (Zeile 405), der
  Ausmusterungszweig beginnt bei 472. Hat das Gerät eine EIGENE aktive Sperre
  daneben, greift keiner der beiden Riegel — und das Gerät wird ENDGÜLTIG
  ausgemustert, die namensgleiche Sperre bleibt verwaist. Ein zusätzlicher
  Mangel macht also eine zuvor verweigerte Deaktivierung wieder möglich.
- **Keine Gegenprobe erreicht den POST-Riegel** — der Abschnitt fährt nur
  GETs und gibt die Sperre per direktem UPDATE frei.

**Eingeordnet statt übernommen:** Der gemeldete Verklemmungskreis mit dem
Nutzungsnachtrag trägt, ist aber **nicht neu** — der bestehende Reparaturweg
nimmt dieselbe Ordnung (`routes/sichtpruefung.js:3084` → `:3100`). Der Beitrag
verbreitert die Klasse von einer Defektzeile auf den ganzen unzugeordneten
Pool. Als „neu eingeführt" wäre es falsch gewesen.

**Eigener Fehler, festgehalten:** „Testabfragen ohne `studio_id`" wurde zum
DRITTEN Mal gemeldet und fiel zum dritten Mal. Nach dem zweiten Mal steht in
`ASTRA-LAEUFE.md`, der Vorbehalt gehöre in den Prüfbrief statt in die
Nachmessung — ich habe es wieder nicht getan. In Runde 3 steht er im Brief.

## Danach — Beitrag 2b-2

Rückweg „Offene Mängel abschliessen" für jedes inaktive Gerät mit offenen
Mängeln. Noch nicht geschrieben. Brauchbare Vorarbeit steht im überholten
`plaene/auftrag-2b-entwurf.md`, aber nur dieser Teil davon.

## Rechtsstand-Meldung vom 16.09.2026 — geprüft, Lexikon NICHT betroffen

Der Wächter meldete für das BGB einen neuen Änderungsstand
(`Art. 2 G v. 2.7.2026 I Nr. 198` → `Art. 6 G v. 23.7.2026 I Nr. 226`) und
fragte, ob der Lexikon-Text betroffen ist. **Antwort: nein.** Alle Quellen
selbst geholt (`recht.bund.de`, Volltext-PDFs), nicht zusammengefasst.

**Es war nicht EINE Änderung, sondern DREI.** Der Wächter vergleicht nur
Kopfstand gegen Kopfstand; was dazwischen liegt, sieht er nicht. Die Kette,
rückwärts über die Präambeln der Änderungsgesetze verfolgt bis zu unserem
festgehaltenen Stand:

| BGBl. 2026 I | Datum | ändert im BGB | trifft uns |
|---|---|---|---|
| Nr. 198 | 2.7. | unser bestätigter Stand | — |
| Nr. 212 | 16.7. | §§ 434, 445a, 453, 475, 475a, 475d, 479, 650 + Untertitel (EU-Reparatur-Richtlinie 2024/1799) | nein |
| Nr. 221 | 21.7. | §§ 1597a, 1598 (Vaterschaftsanerkennung) | nein |
| Nr. 226 | 23.7. | §§ 555b, 559e, neu 559f (Wärmepumpe, Mietrecht) | nein |

Unsere Normen — §§ 823, 309, 965, 966, 967, 973, 978 BGB — kommen in
KEINEM der drei Gesetze vor. **Positivkontrolle:** dieselbe Suche findet die
tatsächlich geänderten Normen sehr wohl (§ 434: 6 Treffer, § 475: 5,
§ 650: 1, § 1598: 6, § 555b: 1, § 559f: 1). „Null Treffer" heisst hier also
wirklich „nicht berührt".

Nr. 212 war der einzige ernsthafte Kandidat — „Förderung der Reparatur von
Waren" hätte § 309 (Klauselverbote) treffen können. Hat es nicht.

**Erledigt:** die sieben BGB-Einträge in `core/rechtsstand.js` tragen
`Art. 6 G v. 23.7.2026 I Nr. 226` und `bestaetigt_am: '2026-09-16'`; Zweig
`claude/rechtsstand-bgb-nr226`, geprüft, PR offen.

**Daraus wird ein eigener Beitrag** (Betreiber-Entscheidung 16.09.2026:
„ja plane es als eigenen schritt"). Der Plan liegt als
`plaene/rechtsstand-kette-plan.md`. Kern: der Wächter führt zusätzlich einen
Fingerabdruck des NORMTEXTES des jeweiligen Paragrafen und beantwortet damit
selbst, ob eine Gesetzesänderung uns betrifft. Tragende Messung: das XML,
das er ohnehin lädt, enthält jeden Paragrafen einzeln — die Kettenprüfung
braucht KEINEN zusätzlichen Abruf. Nebengewinn: der Regelfall („Gesetz
geändert, unsere Norm unverändert") wird ruhig statt rot.
**Am 16.09.2026 gegengelesen** — sechs Befunde, vier blockierend, alle sechs
nach eigener Nachmessung getragen. Der Nachtrag steht im Plan selbst, der
Bauauftrag daneben als `plaene/auftrag-rechtsstand-stufe1.md`.

Die zweite Meldung (§ 3 UVSV nicht erreichbar) hat sich erledigt: die Quelle
antwortet wieder (HTTP 200). Der Wächter hat richtig gehandelt — erster
Ausfall, kein Befund behauptet, Wiederholung beim nächsten Lauf.

## Notiert, aber ausdrücklich NICHT gebaut

- **Ein harmloser Wettlauf kann `beanspruche()` mit einem 500er abstürzen
  lassen — VORBESTEHEND, gefunden am 16.09.2026.** Das Klassifizierungs-Lesen
  NACH dem Schreiben (`alle = SELECT … WHERE nummer BETWEEN von AND bis`,
  `core/qr-zuordnung.js`) ist ein DRITTER Snapshot. Bleibt eine
  zwischenzeitlich eingefügte Zeile dort unentschieden (`studio_id` noch
  NULL, Besitzer nicht ableitbar — etwa weil ein zweiter, gleichzeitiger
  Aufruf sie beansprucht, aber noch nicht committet hat), läuft der Vorgang
  in den `throw` „gebrochenes Invariant". Der Ausführende hat es beim Bau der
  Gegenprobe gefunden, gemeldet statt gebaut (wie beauftragt) und in seiner
  Reproduktion 12 bis 20 von 25 Läufen getroffen. **Von mir bestätigt, dass
  es vorbesteht:** der Zweig ist wortgleich schon in `7abea9f`, also vor der
  ersten Runde dieses Beitrags. Eigener Beitrag, noch nicht geschrieben.


- **Rechtsstand-Wächter, Stufe 2: mittelbare Betroffenheit.** Ein Paragraf
  kann betroffen sein, ohne dass sein eigener Wortlaut sich ändert — wenn
  eine Norm, auf die er VERWEIST, geändert wird. Zurückgestellt durch
  Betreiber-Entscheidung 16.09.2026 (`plaene/ENTSCHIEDEN.md`), nicht
  verworfen. Stand der Messung: für den BGB-Fall vom 16.09. geprüft und
  ausgeschlossen — keiner unserer sieben Paragrafen verweist auf eine der
  dreizehn geänderten Normen, Positivkontrolle der Suchmethode steht.
  Automatisiert bräuchte es Hashes für ALLE Normen eines Gesetzes statt nur
  für unsere; beim BGB sind das einige tausend Registereinträge. Wer es
  baut, baut es als eigene Runde — sonst ist hinterher nicht zu sagen,
  welcher Teil gewirkt hat.
- **Drei Restrisiken des Rechtsstand-Wächters, die auch Stufe 1 NICHT
  löst** (im Plan benannt, hier, damit sie den Plan überleben):
  (1) Ändern und Zurückändern zwischen zwei Läufen bleibt unsichtbar — gilt
  heute genauso, der Fingerabdruck beseitigt es nicht.
  (2) Mittelbare Betroffenheit, s. o.
  (3) Der Wächter sagt „Wortlaut gleich", nicht „Rechtslage gleich" —
  Rechtsprechung, Auslegung und aufgehobene Verweisungen sieht er nicht.
  Das war noch nie anders, gehört aber in die Meldung, damit niemand aus
  der neuen ruhigen Lage mehr liest als dasteht.

- **Der Marker-Sollwert für dieses Repo ist überholt, und die Zählform taugt
  nicht.** Ich habe „Sollwert 2" weiter mitgeführt; gemessen am 16.09.2026
  trägt schon `HEAD` DREI Fundstellen (zweimal `CLAUDE.md`, einmal
  `plaene/auftrag-2b-entwurf.md:113`, dort seit dem 15.09.). Der Scan schlägt
  seither bei JEDEM Lauf an — also genau die Krankheit, vor der die CLAUDE.md
  warnt: ein Wächter, der immer meckert, wird abgeschaltet statt gelesen.
  Eine ZAHL ist hier ohnehin die falsche Zusicherung, weil jede berechtigte
  Erwähnung in der Dokumentation sie erhöht. Richtig wäre: im QUELLTEXT null
  Fundstellen, in Dokumenten beliebig viele. Eigener Auftrag — bis dahin gilt
  für dieses Repo 3, und der Scan ist nur noch ein Hinweis.

- **`UPDATE … RETURNING` im Aufbewahrungs-Schreibweg.** Das Markier-/Lösch-
  Protokoll wird aus ALLEN SELECT-Zeilen gefüllt, nicht aus den tatsächlich
  getroffenen; die gemeldete Anzahl kommt aus `rows.length`. Im unveränderten
  Code kein Übergriff (beide Seiten tragen denselben Filter), aber der Nachweis
  ist ein Selbstbericht. Gehört nicht in dieselbe Runde wie drei neue
  Schema-Regeln — eigener Auftrag.
- **Historische Monatsnachweise verlieren später geschlossene Mängel.** Ein
  Mangel, der VOR dem Berichtszeitraum entstand und NACH ihm geschlossen wurde,
  fehlt im Nachweis dazwischen, obwohl er durchgehend offen war. Gilt bei
  REPARIERTEN Mängeln schon heute; Aufrufweg ist die Neuerstellung alter
  Monats-PDFs in `routes/archiv.js`. Verändert bestehende Nachweisdokumente —
  eigener Auftrag.
- **Aufrüstungs-/Zweitboot-Test.** Der Migrations-Pfad-Test deckt
  „Altschema → 0057 → 0057" ab, nicht „Bestand → neues `init()` → Migrationen →
  zweites `init()`". Berechtigt, aber eigener Auftrag — und er darf den direkten
  Migrationstest NICHT ersetzen, sonst verdeckt `init()` wieder, was die
  Migration tut.
- **Zentrale `DEFECT_PHOTO_DIR`-Umleitung in `test/run.sh`.** 21 bestehende
  Testdateien laden `routes/sichtpruefung.js` ohne diese Variable — Eigenschaft
  der Suite, kein Fehler eines einzelnen Beitrags.
- **Den stündlichen Takt-Prompt eindampfen — aber ERST, nachdem
  `plaene/ENTSCHIEDEN.md` im Standardzweig steht.** Meine frühere Notiz hier
  („eine 8k-Token-Kopie der CLAUDE.md") war FALSCH und hätte zur falschen
  Handlung verleitet. Gemessen am 16.09.2026 über alle `*.md` BEIDER Repos:
  von acht Betreiber-Entscheidungen steht KEINE als Entscheidung im Repo,
  sechs kommen überhaupt nicht vor. Der Prompt war der einzige Träger — und
  `list_triggers` gibt seinen Text nicht zurück, man sieht ihn nur beim
  Feuern. Die Listen sind jetzt nach `plaene/ENTSCHIEDEN.md` übertragen;
  gestrichen wird im Prompt erst danach, sonst ist die einzige Kopie weg,
  bevor die neue da ist. Der übrige Abgleich (welche Regeln WIRKLICH doppelt
  sind) steht noch aus und braucht den Prompttext — also die Stunde nach
  einem Feuern.


- Drei weitere Fundstellen derselben Klasse wie Beitrag 1: die
  Seil-Verschärfung im Tagescheck (`routes/module.js:2911-2946`), die
  Rücknahme einer Einweisung (`routes/belehrungen.js:1409-1413`), die
  Lageplan-Markierung (`routes/lageplan.js:464-468`). Eigener Beitrag.
- Der Verklemmungs-Kreis um `auditAppend()` (CLAUDE.md, Abschnitt
  „Transaktionen und Sperren"). Eigener Auftrag, nur hergeleitet, nie
  beobachtet.
- `geraete_bekannt` schlägt ausgemusterte Gerätenamen weiter vor;
  Wartungsgeräte haben womöglich dieselbe Sackgasse. Beides eigene
  Aufträge, Begründung in v4 Abschnitt 2.7.
- Der kleine Folgebeitrag aus der Bot-Prüfung zu #444.
