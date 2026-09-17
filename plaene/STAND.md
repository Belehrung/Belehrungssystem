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
| Rechtsstand-Wächter Stufe 1 | **gemergt `c1b052f`, Deploy 419 `success`, live-check grün** — OFFEN beim Betreiber: `install` der Ops-Kopie auf dem Server |
| Orbit4-Recherche | erledigt, `plaene/wettbewerb-orbit4.md` |
| Beitrag 2b-2 (Rückweg) | **umgedeutet** — der Kern ist ein offenes Rennen, s. `plaene/auftrag-geistersperre-nachtrag.md` |
| Doku-Stand ins Belehrungssystem-main | gemergt `254959c` (Bot 5/5, ein Befund behoben) |
| Gerätealter an der Ausmusterung (Orbit4, Punkt 1) | **gemergt `922d1ed`, Deploy 420 `success`, live-check grün** |
| Jira-Anbindung | **vom Betreiber verworfen** 16.09.2026, s. `plaene/ENTSCHIEDEN.md` |
| Rechtsstand-Sammelbeitrag (7 offene Punkte) | Auftrag geschrieben, `plaene/auftrag-rechtsstand-sammelbeitrag.md` — wartet auf einen freien Arbeitsbaum |
| Doku ins Belehrungssystem-main | gemergt `cbf5c31` (Bot 5/5, vier Befunde behoben) |
| Verklemmung `qr_token` (#233) | **gemergt `a7ea96a`, Deploy 418 `success`, live-check grün** |

**`/home/user/gymdocu` ist BELEGT** — seit 17.09.2026 ~02:05 UTC arbeitet
dort ein Executer am Gerätealter (`plaene/auftrag-geraetealter.md`, Zweig
`claude/geraetealter`, Basis `c1b052f`). Nicht anfassen, bis seine
Benachrichtigung da ist; eine Benachrichtigung ist verbraucht, sobald ich ihn
fortgesetzt habe.

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
   **ERLEDIGT am 16.09.2026:** beide stehen jetzt in der CLAUDE.md dieses
   Repos — der Suite-Aufruf in Schritt 4 des Prüf-Rituals, der Review-Bot als
   eigener Schritt 6b. Damit ist die letzte Sperre gegen das Kürzen weg; der
   Abgleich, welche übrigen Regeln WIRKLICH doppelt sind, braucht weiterhin
   den Prompttext und damit die Stunde nach einem Feuern.

   **Der Abgleich ist am 16.09.2026 abends gemacht**, beim Feuern um 17:40 UTC.
   Ergebnis: Was noch AUSSCHLIESSLICH im Prompt steht, ist fast durchweg
   GymDocu-Arbeitswissen, und es gehört nach der Hausregel „Hausregeln gehören
   ins Zielrepo" in **`/home/user/gymdocu/CLAUDE.md`**, nicht hierher — der
   Executer liest die CLAUDE.md des Repos, in dem er arbeitet. Gemessen
   (Trefferzahl in `CLAUDE.md` / `plaene/ENTSCHIEDEN.md` dieses Repos):

   | Nur im Prompt | CLAUDE.md | ENTSCHIEDEN.md |
   |---|---|---|
   | `test/helfer/route-harness.js` (Seiten-HTML ohne Server; `server.js` mountet Router ausserhalb von `routes/admin.js`) | 0 | 0 |
   | `test/helfer/ueberlauf-messung.js` | 0 | 0 |
   | `test/helfer/quelltext-scan.js` (`scanneDateien`, eigene Liste `erkennerFehler`, die JEDER Aufrufer selbst zusichert) | 0 | 0 |
   | `test/helfer/chromium-start.js` | 0 | 0 |
   | `TEST_ROLE` beim `createdb` (sonst „permission denied for schema public") | 0 | 0 |
   | Die ausdrückliche Chromium-Liste in `eslint.config.js` (kein Muster, kein `eslint-disable`) | 0 | 0 |
   | `server.js:161-162` begrenzt URL-encoded und JSON auf 1 MB | 0 | 0 |
   | Python-Patchskripte für deutschen Text brauchen Dreifachquotes | 0 | 0 |

   Bereits abgedeckt und damit im Prompt streichbar: der Studio-Wächter-Hinweis,
   die 405-Falle beim Entwurfs-PR, die unterschiedlichen Standardzweignamen und
   die Berichtigungsliste stehen in `plaene/ENTSCHIEDEN.md`; Suite-Aufruf,
   Marker-Scan, Review-Bot, Sperren/Transaktionen und die Prüfreihenfolge in
   der CLAUDE.md dieses Repos.

   **Nächster Schritt, sobald `/home/user/gymdocu` frei ist:** die acht Zeilen
   oben in die dortige CLAUDE.md übernehmen, DANN erst den Prompt kürzen. Die
   Reihenfolge ist wichtig — wer zuerst kürzt, löscht die einzige Fassung.

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

- **Keine Abfrage-Zeitgrenzen im Repo, und `test/run.sh:865` startet jede
  Testdatei ohne Laufzeitgrenze** (Gegenlesung 16.09.2026, von mir am
  Quelltext bestätigt). Ein hängender Test hält damit das Deploy-Gate auf.
  Die Testdateien dieses Beitrags bekommen deshalb einen eigenen
  Laufzeitwächter — die WURZEL bleibt offen, denn eine Grenze in
  `test/run.sh` trifft alle 325 Dateien und gehört in einen eigenen Beitrag
  mit eigener Prüfung.
- **Bewusster Abdeckungsverlust:** mit `P1b` ist die Integration ZWEIER
  echter `beanspruche()`-Aufrufe über überlappende Spannen entfallen. Das war
  MEIN Zuschnitt („was nicht bindet, fliegt raus"), kein Fehler des
  Ausführenden — und es steht im Kopfkommentar der Datei, damit der nächste
  Leser es weiß. **Regel daraus: wer eine Streichung anordnet, lässt auch
  prüfen, was mitgeflogen ist.**


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

## Befund 16.09.2026 — die Geistersperre ist wieder offen

Bei der Vorarbeit zu Beitrag 2b-2 selbst gemessen, nicht aus einem Bericht
übernommen. Der Auftrag dazu steht in
`plaene/auftrag-geistersperre-nachtrag.md`; hier nur, was für den Stand zählt.

**Der Plan v4 lag in der Ursache falsch, nicht im Ergebnis.** Er beschrieb
den Zustand „inaktiv, nicht ausgemustert, mit offenem Mangel" richtig, führte
ihn aber allgemein auf eine Prüfung vor der Transaktion zurück. Gemessen ist
es enger und schlimmer: Der Schlüssel `seilkontrolle:<studio>:<tag>` wird von
DREI Stellen genommen (`routes/admin/geraete.js:342` Löschen, `:463`
Umbenennen, `routes/module.js:2870` Tagescheck), aber eine Seil-Sperre
schreiben ZWEI Stellen — `routes/module.js:2982` mit Lock,
`routes/sichtpruefung.js:4630` **ohne jeden**. `grep -n
"advisory_xact_lock" routes/sichtpruefung.js` findet drei Treffer, keinen
davon in der Seil-Transaktion ab `:4609`.

Das Rennen wurde am 22.08.2026 geschlossen; der Nachtragsweg entstand am
26.08.2026 und hat es wieder geöffnet. Am selben 22.08. wurde auf
Betreiber-Entscheidung der Heilweg `/geraete/reaktivieren/:id` entfernt
(Begründung im Kopf von `routes/admin/geraete.js:283-290`), und für
`seilkontrolle` gibt es keinen Ersatz: `routes/admin/geraete-typen.js:98`
lässt nur Cardio und Kraft zu. Ein so entstandenes Gerät steht damit in
keiner Liste und ist über die Oberfläche nicht mehr erreichbar.

**Was sich am Zuschnitt ändert:** Der Bauauftrag schliesst NUR das Rennen.
Der Rückweg für bereits entstandene Fälle ist eine Betreiber-Frage, weil er
genau die Entscheidung vom 22.08.2026 berührt — und ob es solche Fälle im
Betrieb überhaupt gibt, ist von hier aus nicht feststellbar und soll es
bleiben.

**Zwei Punkte aus Plan v4 Abschnitt 2.4 sind bereits erledigt** und gehören
nicht mehr in den Auftrag: die Reaktivierungssperre steht an der Route
(`routes/admin/geraete-typen.js:552-554`, `AND ausgemustert_am IS NULL`, mit
benanntem Wächter daneben), und die Cardio/Kraft-Liste zeigt ohnehin alle
Geräte (`:283`, kein Aktivfilter) samt Ausmustern-Verweis bei
`!g.ausgemustert_am` (`:344`). Die Lücke betrifft allein die Seilkontrolle.

## Rechtsstand-Wächter Stufe 1 — Stand nach Runde 2 (16.09.2026 abends)

`ad2b447` auf `claude/rechtsstand-normtext-stufe1`. Mein Prüfgang war grün:
Suite `SUITE_EXIT=0`, `test_feature_rechtsstand.js` 147 PASS / 0 FAIL,
Dateizahl 325 = 325 (`diff` EXIT 0), Lint EXIT 0, Marker 6, Arbeitsbaum sauber.

**Die beiden Hauptbehebungen tragen, selbst nachgemessen** — inklusive
Positivkontrolle, dass der Vergleich nicht stumpf geworden ist: ein wirklich
falscher Hash bleibt `widerspruch`, eine echte Textänderung bewegt den Hash.
Alle sieben überwachten BGB-Paragrafen sind gegen kosmetische Umformatierung
stabil (vorher 6 von 7), § 309 misst unabhängig bestätigt 8941 Zeichen.

**Trotzdem nicht mergefähig.** Zwei unabhängige Prüfspuren, Überschneidung
1 von 7 bzw. 1 von 14 — jede fand fast durchweg Anderes. Vier blockierende
Befunde, alle von mir selbst gemessen:

1. **Die Behebung aus Runde 2 ist selbst unbewacht.** Die eine Zeile durch
   `void 0;` ersetzt → EXIT 0, 147 PASS / 0 FAIL, während § 3 ArbSchG in
   Produktion `66e06ad9…` statt `8eb66bab…` ergäbe, also `widerspruch`. Die
   Gegenprobe vergleicht die Funktion mit sich selbst.
2. **Bei vielen Prüfungsfehlern kommt gar nichts an:** 61 Quellen → 61
   Meldungsgruppen → 14.221 Zeichen gegen Telegrams 4096, ohne Aufteilung im
   Sendeweg.
3. **Der neue Statusdatei-Test fasst das echte Dateisystem an**
   (`mkdtempSync`, `rmSync` rekursiv) — in einer Suite, die auf dem
   Live-Server Deploy-Gate ist.
4. **Die von Hand installierte Ops-Kopie liefert kein `xmlText`** → gemessen
   `pruefungsfehler` für jede gii-Quelle, also 61× rot pro Woche zwischen
   Merge und `install`, mit einer Meldung, die auf die falsche Ursache zeigt.

**Ein Befund ist beim Nachmessen GEFALLEN** und steht als gefallen im
Auftrag: der Gruppierungsschlüssel ohne `b.lage` ergibt EXIT 1, 144 PASS /
3 FAIL — er ist sehr wohl bewacht.

**Nach dem Merge zusätzlich nötig** (aus Runde 1, weiterhin gültig):
`install -m 755 ops/gymdocu-rechtsstand-watch.js /usr/local/bin/gymdocu-rechtsstand-watch.js`
auf dem Server. Ohne das läuft der neue Kern gegen die alte Kopie — s.
Befund 4.

**Offen, nicht in diesem Beitrag:** die 11 betrsichv_2015-Fingerabdrücke
sind über den Stand-Abgleich bestätigt, aber nicht end-to-end über die
Pipeline (der Executer meldet eine Anomalie: `curl` auf dieselbe URL geht in
unter einer Sekunde durch, der Node-Abrufpfad scheitert wiederholt mit
Zeitüberschreitung — bei über 40 anderen Quellen desselben Pfades am selben
Tag erfolgreich). Dazu die Superadmin-Anzeige im Hauptserver-Repo, die
`version: 3` und die fünf neuen Lagen nicht kennt.

## Rechtsstand-Wächter — Stand nach Runde 4 (17.09.2026 nachts)

`a855bfc`. Mein Prüfgang grün: Suite `SUITE_EXIT=0`, 218 PASS / 0 FAIL,
Dateizahl 325 = 325, Lint EXIT 0, Marker 6. Alle vier beauftragten Punkte
tragen, selbst gemessen — inklusive Positivkontrolle, dass eine ECHTE
Netzstörung weiterhin die Gnadenfrist bekommt und nur der Versionsfall sie
überspringt.

**Das Muster dieses Beitrags, und der Grund für die Grenze:** Jede Runde hat
einen Fehler gefunden, den die VORHERIGE Behebung eingebaut hat.

- Runde 2 behob die Normalisierung — und ihre Gegenprobe verglich die
  Funktion mit sich selbst.
- Runde 3 machte die Versionsabweichung „laut" — gemessen gegen die falsche
  (neue) Klassifizierung; die installierte alte macht daraus Stille.
- Runde 4 schloss die Fussnoten-Lücke mit `<fussnoten\b[^>]*>` — und das
  matcht nun auch das selbstschliessende `<fussnoten/>`, frisst also alles
  bis zur nächsten schliessenden Fussnote, **echten Normtext inklusive**.
  Selbst gemessen; schlimmer als ein falscher Hash, weil das Register von
  derselben Funktion erzeugt wird.

**Entwarnung, ebenfalls selbst gemessen:** Der Bestand ist NICHT betroffen —
mit dem Code aus Runde 4 gegen die echten Quellen **46 von 61 geprüft,
0 Abweichungen**, 15 netzbedingt nicht erreichbar. Kein bestätigter
Fingerabdruck hat sich bewegt; die Lücke ist latent.

**Grenze am eigenen Verhalten (17.09.2026):** Nach Runde 5 wird nur noch
gebaut, was BLOCKIEREND ist. Alles andere wird datiert in
`docs/offene-befunde-31-08-2026.md` festgehalten und ist ein eigener
Beitrag. Das ist keine Vorhersage, dass nichts mehr gefunden wird — es ist
eine Festlegung darauf, was ich damit tue.

**Offen festgehalten, nicht gebaut:** der Cache hält jetzt das entpackte XML
aller 18 Gesetze gleichzeitig (vorher ein paar hundert Byte je Gesetz) —
Grösse messen, bevor jemand baut; `normtextAusXml()` zerlegt das ganze Gesetz
je Paragraf neu; `enbezAusUrl()` akzeptiert nur `__<Zahl>[<Buchstabe>].html`;
die doppelte Höflichkeitspause im Werkzeug; die Superadmin-Anzeige im
Hauptserver-Repo kennt `version: 3` nicht; der Abbruch bei einem Schreibfehler
der Statusdatei.

**Nach dem Merge zusätzlich nötig:**
`install -m 755 ops/gymdocu-rechtsstand-watch.js /usr/local/bin/gymdocu-rechtsstand-watch.js`
auf dem Server — sonst läuft der neue Kern gegen die alte Kopie. Seit Runde 4
meldet der Wächter das in dem Fall selbst und laut (auch unter der alten
Kopie, ab dem zweiten Lauf).

## Rechtsstand-Wächter Stufe 1 — Runde 5 abgenommen (17.09.2026)

Fünf Bau-Runden, sechs unabhängige Prüfgänge (drei `/code-review`, zwei
Astra, eine Abnahme-Review). **Jede Runde fand einen Fehler, den die
Behebung der VORIGEN Runde eingebaut hatte** — das ist der eigentliche
Befund dieser Reihe, nicht eine einzelne Lücke:

- Runde 2: eine Zusicherung, die ihren Sollwert aus dem Prüfling zog.
- Runde 3: mein eigener Auftrag mass gegen den NEUEN Klassifizierer, während
  die installierte ALTE Kopie alle sechs neuen Lagen auf `still` abbildet —
  also stilles falsches Grün statt der behaupteten „61× rot pro Woche".
- Runde 4: `<fussnoten\b[^>]*>` liess das selbstschliessende `<fussnoten/>`
  als Öffner durch und frass echten Normtext — schlimmer als die Lücke, die
  dieselbe Zeile schliessen sollte.
- Runde 5: die eigene Behebung der Meldung verlor genau das, was sie retten
  sollte (der Ausführende hat das SELBST gefunden, vor der Auslieferung).

**Eigene Messungen zur Abnahme** (nicht der Bericht des Ausführenden):

- Fussnoten-Fix über sieben Varianten, dazu die Positivkontrolle über den
  mutierten Runde-4-Ausdruck: genau die drei selbstschliessenden Fälle fallen.
- Registerabgleich gegen die echten Quellen: **57 stimmen, 0 Abweichungen,
  4 nicht prüfbar** (UVSV, strukturell). Kein Fingerabdruck hat sich bewegt.
- Härteprüfung der Meldung (40 Funde mit 300-Zeichen-Gründen, 25
  Unerreichbare mit langen URLs, Sonderzeichen): überall ≤ 4096 Zeichen,
  `<b>`-Tags ausgeglichen, Übersicht und Unerreichbar-Liste erhalten.
- Vier eigene Mutationen, je einzeln: `lieferung`-Riegel zurückgedreht →
  **EXIT 1, 2 FAIL**; Budget-Reservierung entfernt → **EXIT 1, 2 FAIL**;
  null gezeigte Einträge → **EXIT 1, 3 FAIL**; Höchstzahl 15→1 →
  **EXIT 1, 1 FAIL**. Jede gegen eine unabhängige Kopie zurückgenommen
  (`diff` EXIT 0).
- Suite **SUITE_EXIT=0**, `test_feature_rechtsstand.js` 251 PASS / 0 FAIL,
  Dateizahl-Ritual **325 = 325**, Lint EXIT 0, Marker **6 = 6**.

**Von den 13 Befunden der Abnahme-Review sind vier GEFALLEN** (alle vier
behaupteten stilles Grün, das es nicht gibt — je einzeln mutiert und
gemessen). Die sieben echten sind keiner blockierend und stehen datiert in
`docs/offene-befunde-31-08-2026.md` im GymDocu-Repo.

**Nach dem Merge bleibt EIN Schritt beim Betreiber**, den ich nicht tun kann
(kein SSH): `sudo install -m 755 ops/gymdocu-rechtsstand-watch.js
/usr/local/bin/gymdocu-rechtsstand-watch.js` auf dem Server. Ohne ihn läuft
die alte Kopie weiter — sie liefert kein XML mit, und der neue Code meldet
das ab Runde 4 ausdrücklich als Versionsabweichung mit genau diesem Befehl.

### Nachtrag 17.09.2026, 02:00 UTC — gemergt und ausgeliefert

`c1b052f`, alle fünf Prüfungen grün, Review-Bot 4/5 „safe to merge" mit
genau zwei Befunden — beide waren vorher selbst gemessen und stehen als
datierte offene Punkte in `docs/offene-befunde-31-08-2026.md`; sie wurden
bewusst nicht mitgebaut und im PR mit Begründung beantwortet. Deploy-Lauf
419 mit dem richtigen `head_sha` auf `success`, `tools/live-check.sh` grün
(zwei Punkte wie immer ℹ statt ✓: Zertifikat und Health-Endpunkt sind aus
dieser Umgebung nicht messbar).

**Der nächste Beitrag ist der Sammelbeitrag aus diesen sieben Punkten** —
Schleifenabbruch (`break` → `continue`), `<enbez/>`/`<textdaten/>` mit dem
ordnungsunabhängigen Ausdruck, `esc()` auf den Lagen-Bezeichner, eine
„N von M"-Zeile für die Unerreichbar-Liste, der Abruf-Vertragskommentar,
eine gemeinsame Konstante für `lieferung: 'xml'`, die doppelte
Längenrechnung. Keiner davon ist blockierend; zusammen sind sie ein
sauberer eigener Beitrag statt einer sechsten Bau-Runde.

### Gerätealter — Runde 1 abgenommen mit EINEM blockierenden Befund (17.09.2026)

Zweig `claude/geraetealter`, Commits `9150669` + `1f97954`, Basis `c1b052f`.
Suite **SUITE_EXIT=0**, `test_feature_geraete_alter.js` 70 PASS / 0 FAIL,
Dateizahl **326 = 326**, Lint EXIT 0 — und trotzdem nicht auslieferbar.

**Der Befund (vom Ausführenden gemeldet, von mir am gerenderten HTML
nachgemessen):** Die neue Zeile „Mängel: keine Mängel erfasst" kann auf
DERSELBEN Seite stehen wie die offenen Mängel dieses Geräts zum Ankreuzen.
Ursache: die tägliche Sammelprüfung — der Hauptweg — trägt `geraet_id` gar
nicht in ihrer INSERT-Spaltenliste (`routes/sichtpruefung.js:2543-2547`,
gemessen), während die Blöcke 2/3 derselben Seite über den NAMEN zuordnen
(`core/ausmusterung.js:118-120`). Eigene Messung, zwei Mängel mit der
echten Produktions-Spaltenliste geschrieben:

    ladeMaengelHistorie -> {"gesamt":0,"offen":0,"letzter":null}
    ladeKandidaten      -> block1: 0  block2: 2  block3: 0
    Seite sagt "keine Mängel erfasst": true
    Seite zeigt beide Mängel:          true
    WIDERSPRUCH_AUF_EINER_SEITE=true

**Die Ursache stand in MEINEM Auftrag** („zähle über `geraet_id`, nicht über
den Namen"). Die Vorgabe war richtig gegen Umbenennen und Namensvetter, aber
sie macht aus einer Deckungslücke einen falschen Satz auf der Seite, auf der
über das Verschrotten entschieden wird.

**Nachbesserung beauftragt** (Runde 2, derselbe Ausführende): zwei GETRENNTE
Gruppen — sicher zugeordnet (`geraet_id`) und namensgleich (`geraet_id IS
NULL AND geraet_name = …`) —, nie zu einer Summe verschmolzen; bei null
Treffern für Cardio/Kraft der Satz „keine Mängel gefunden (gesucht über
Gerätekennung und Gerätenamen)", also eine Aussage über die SUCHE statt über
die Welt; für Seilkontrolle bleibt es bei „keine Mängel erfasst" (dort ist
`geraete_sperren.geraet_id` NOT NULL, die Zählung ist vollständig).

### Gerätealter — Runde 2 abgenommen, Runde 3 im Bau (17.09.2026, ~04:30 UTC)

Runde 2 (`b5fca2f`) behebt den Widerspruch: zwei getrennte Gruppen, nie zu
einer Summe verschmolzen. **Eigene Nachmessung am gerenderten HTML:**
`WIDERSPRUCH_AUF_EINER_SEITE=false`, `BEZIFFERT_STATT_VERSCHWIEGEN=true`,
Suite **SUITE_EXIT=0**, 81 PASS / 0 FAIL, Dateizahl **326 = 326**, Lint
EXIT 0, Marker 6. Der Ausführende hat dabei eine Lücke meiner Vorgabe
selbst geschlossen („keine sicher zugeordneten Mängel" für sicher=0 bei
namensgleich>0) — richtig, übernommen.

**Die unabhängige Review lieferte 15 Befunde. Neun gehen in Runde 3, fünf
werden festgehalten, einer ist ausgesondert.** Selbst nachgemessen:

- **BLOCKIEREND, dieselbe Klasse eine Tabelle weiter:** offene
  Mitglieds-Hinweise (`geraete_hinweise`) kommen auf der Ausmusterungsseite
  NICHT vor (`grep -c`: 0 in `routes/admin/ausmusterung.js` und
  `core/ausmusterung.js`), während der SCHWÄCHERE Weg — das blosse
  Deaktivieren — ausdrücklich warnt (`geraete-typen.js:319`, „Zu diesem
  Gerät liegt 1 offener Hinweis vor"). Die unwiderrufliche Entscheidung
  bekommt eine Entwarnung, die rückholbare eine Warnung.
- `pruefeInbetriebnahme('2015-02-31')` → `{ok:true}`, ebenso `2019-04-31`,
  `2015-02-30`, `0000`, `9999-12-31`. Die Rundlaufprobe dafür hat das Repo
  schon (`core/audit-filter.js#datumWert`). Die DB-CHECK bleibt bewusst
  gröber — ein Regex kann keinen Rundlauf, und `to_date` rollt den 31.02.
  still weiter.
- Die Mandantentrennungs-Zusicherung zur ROUTE kann nicht rot werden: die
  Route antwortet 404 (`ausmusterung.js:242`), bevor die geprüfte Funktion
  (`:258`) überhaupt gerufen wird.
- Das Aufräumen von `qr_charge` steht nicht in einem `finally`;
  `test_feature_qr_token.js` läuft danach (run.sh 645 gegen 817) und
  verlangt eine leere Tabelle.
- Ausmustern lässt `geraet_id` auf NULL (`ausmusterung.js:742-745`) —
  geschlossene Mängel bleiben dauerhaft in der namensgleich-Menge jedes
  gleichnamigen Geräts, und die Anzeige nennt dort keine Offen-Zahl.

**Ausgesondert, mit Begründung:** dass „keine Mängel erfasst" bei der
Seilkontrolle strukturell vollständig sei, ist überzogen (es gibt Sperren
mit gleichem Namen und anderer `geraet_id`, `routes/admin/geraete.js:568`)
— aber die Sperren eines ANDEREN Geräts sind nicht die Mängel dieses
Geräts. Ein namensbasierter Zweitzweig für Seilkontrolle wäre ein eigener
Beitrag; festgehalten statt gebaut.

### Gerätealter — Runde 3 abgenommen, Gegenlesung gelaufen, Runde 4 ist die letzte (17.09.2026, ~05:45 UTC)

Runde 3 (`39abb48`): Suite **SUITE_EXIT=0**, 117 PASS / 0 FAIL, Dateizahl
**326 = 326**, Lint EXIT 0, Marker 6. Eigene Messungen am gerenderten HTML:
offener Mitglieds-Hinweis wird bei Cardio UND Seilkontrolle genannt,
Positivkontrolle ohne Hinweis sagt weiter „keine Mängel gefunden"; `1e3` →
400, `2015-02-31` → 400, `2016-02-29` → 302. Kalenderprüfung fünfzehn Fälle,
FEHLER=0.

**Die Gegenlesung (10,30 $) fand SECHS Befunde, Überschneidung mit der
Claude-Spur NULL von 6** — die Zeile steht fertig in `ASTRA-LAEUFE.md`.
Bemerkenswert im Vergleich: beim Rechtsstand-Wächter am selben Tag lag die
Überschneidung bei 5 von 7. Dieselbe Methode, gegensätzliches Ergebnis; die
These „jede Spur findet Anderes" hängt am Material, nicht am Prüfer.

Zwei davon blockierend, beide von mir selbst nachgemessen:

- **Falsche Sicherheitszusicherung.** Die Zusicherung verspricht wörtlich
  „studio_id-Filter wirkt wirklich, beide Gruppen" — die Fremddaten in
  Studio B tragen aber alle eine gesetzte `geraet_id`, während die
  namensgleich-Gruppe `geraet_id IS NULL` verlangt. Gemessen, beide
  Richtungen: `studio_id` aus der Abfrage entfernt → **Suite EXIT 0, 117
  PASS / 0 FAIL**, während ein eigens angelegter Freitext-Mangel aus Studio
  B bei Studio A mitgezählt wird (`LECK=true`); zurückgenommen `LECK=false`.
- **Die neuen Anzeigewerte umgehen den Änderungsriegel.** `baueAnsicht()`
  nimmt nur `{id, typ, name, standort, seriennummer}`, der POST-SELECT lädt
  `inbetriebnahme_am` gar nicht, `vergleicheAnsichten()` vergleicht drei
  Gerätefelder. Korrigiert jemand die Inbetriebnahme, während ein zweiter
  das Formular offen hat, schweigt der Riegel — bei einer UNWIDERRUFLICHEN
  Entscheidung.

**Ausdrücklich NICHT in den Fingerabdruck aufgenommen: die drei Mängel- und
Hinweiszahlen.** Sie sind lebendig; ein neu eintreffender Mitglieds-Hinweis
würde die Ausmusterung blockieren — gegen die Betreiber-Entscheidung vom
15.09.2026, dass ein Gerät AUCH MIT offenem Mangel ausgemustert werden
können muss.

**Eigener Fehler bei der Gegenprobe, gemessen statt übersehen:** das
Mutationsskript hängt `// GEGENPROBE-DEFEKT` an — mitten in einem
SQL-Template-Literal ist das kein Kommentar, PostgreSQL kennt `//` nicht.
`node --check` merkt nichts, weil der JS-String gültig bleibt. Marker dort
als `--`-Kommentar setzen.

### Gerätealter — Runde 4 abgenommen, PR offen, Runde 5 wegen eines P1 (17.09.2026, ~06:05 UTC)

Runde 4: Suite **SUITE_EXIT=0**, 137 PASS / 0 FAIL, Dateizahl **326 = 326**,
Lint EXIT 0, Marker 6. Beide Gegenproben selbst nachgefahren:

    studio_id aus der namensgleich-Abfrage entfernt
        VOR  Runde 4:  EXIT 0, 117 PASS / 0 FAIL   (blind)
        NACH Runde 4:  EXIT 1, 136 PASS / 1 FAIL   (Diagnose druckt die Fremdzeile mit)
    inbetriebnahme_am aus dem Fingerabdruck entfernt
                       EXIT 1, 135 PASS / 2 FAIL

Vier von fünf CI-Prüfungen grün. **Der Review-Bot meldet 4/5 mit einem P1
und dem Satz „should not merge"** — und er trifft genau den Punkt, den ich
in Runde 3 ausgesondert hatte.

**Meine Aussonderung stand auf einer ungemessenen Tatsachenbehauptung.** Ich
hatte geschrieben: „die Sperren eines ANDEREN Geräts sind nicht die Mängel
dieses Geräts." Nachgemessen trägt das nicht:

- `routes/admin/geraete.js:563-571` misst Sperren mit demselben Namen und
  anderer `geraet_id` ausdrücklich als vorbestehende Inkonsistenz, im
  Kommentar steht der Betreiberauftrag „will ich wissen, ob es sie gibt".
- `core/seilgeraete.js#aktiveNamensSperre` verknüpft für die Seilkontrolle
  über den NAMEN, nicht über die ID.
- Ein Seilgerät lässt sich löschen (`POST /geraete/loeschen/:id`) und unter
  demselben Namen neu anlegen; die Sperrzeilen zeigen dann auf eine ID, die
  es nicht mehr gibt.

Runde 5 baut deshalb die namensgleich-Gruppe auch für die Seilkontrolle
(`geraet_name` gleich, `geraet_id <> $2`) und **vereinheitlicht den
Nullsatz für beide Typen** auf „keine Mängel gefunden (gesucht über
Gerätekennung und Gerätenamen)". Die Sonderbehandlung der Seilkontrolle
entfällt samt ihrer widerlegten Begründung; der offene Punkt in
`docs/offene-befunde-31-08-2026.md` bekommt einen Nachtrag „doch gebaut,
Begründung war falsch" statt gelöscht zu werden.

**Der zweite Bot-Befund (P2) trifft zu, sein Patch nicht:** ein Audit-Eintrag
entsteht auch, wenn derselbe Wert erneut gespeichert wird. Sein Vorschlag
liefert bei Gleichheit `{ treffer: false }` — das ist im Aufrufer der Zweig
„Gerät nicht gefunden", der Benutzer bekäme eine Fehlerseite für eine
erfolgreiche Speicherung. Übernommen wird der Befund, nicht der Patch.

### Gerätealter — Runde 5 gebaut, Bot 5/5 (17.09.2026, ~06:45 UTC)

Der Ausführende hat die Geistersperren-Gruppe für die Seilkontrolle gebaut
und den Nullsatz für beide Typen vereinheitlicht. Der Kopfkommentar
widerruft dabei ausdrücklich meine eigene, ungemessene Begründung aus
Runde 3 — mit drei gemessenen Belegen, darunter einem, den ich nicht
genannt hatte: `core/seilgeraete.js#seilNamenskollision` erlaubt einen
Namen erneut, sobald das alte Gerät nicht mehr aktiv ist. Ein Seilgerät
kann also unter demselben Namen mit frischer ID neu entstehen.

**Er hat meiner Vorgabe mit einer Messung widersprochen, und der
Widerspruch trägt** (selbst nachgelesen): Ich hatte verlangt, die Seite
müsse bei einer Geistersperre die namensgleichen beziffern. Für eine
AKTIVE Geistersperre stimmt das nicht — `routes/admin/ausmusterung.js:306`
weist diesen Fall schon vorher mit 409 ab (A2-Prüfung aus Beitrag 2b-1),
die Mängelzeile wird nie gerendert. Erst bei einer FREIGEGEBENEN Sperre
(`aktiv = 0`, genau der Fall aus dem Bot-Befund „Nach Freigabe einer
solchen Sperre") greift der bestehende Riegel nicht mehr, und dort
schliesst die neue Gruppe die Lücke. Er hat beide Zustände getrennt
geprüft, statt meinen angenommenen einen zu bauen.

Der Review-Bot steht jetzt auf **5/5** („no actionable new defect or
outstanding previous finding remains"). Meine eigene Suite und die Messung
des freigegebenen Falls am gerenderten HTML laufen noch — erst danach wird
gemergt.

### Gerätealter — gemergt und ausgeliefert (17.09.2026, ~06:55 UTC)

`922d1ed`, alle fünf Prüfungen grün, Review-Bot 5/5, Deploy-Lauf **420**
mit dem richtigen `head_sha` auf `success`, `tools/live-check.sh` grün
(zwei Punkte wie immer ℹ statt ✓).

Eigene Abnahme vor dem Merge: Suite **SUITE_EXIT=0**, 151 PASS / 0 FAIL in
der neuen Datei, Dateizahl **326 = 326**, Lint EXIT 0, Marker 6. Der Fall
aus dem P1 des Bots am gerenderten HTML selbst gemessen:

    Freigegebene Geistersperre (aktiv=0, gleicher Name, andere ID):
       Entwarnung: false  |  beziffert: true
    Positivkontrolle (sauberes Gerät):
       Entwarnung: true   |  beziffert: false

**Was dieser Beitrag über die Arbeitsweise sagt — fünf Runden, und DREI
davon gingen gegen denselben Fehler in drei verschiedenen Tabellen:** die
Seite behauptete „keine Mängel", während die Wahrheit anderswo stand — bei
den Freitext-Mängeln ohne `geraet_id` (Runde 2), bei den offenen
Mitglieds-Hinweisen (Runde 3) und bei den Geistersperren der Seilkontrolle
(Runde 5). Jedes Mal war die Ursache dieselbe Denkfigur: eine Zusicherung
über Vollständigkeit, die auf EINER Verknüpfung beruht, während das System
mehrere kennt.

**Und dreimal lag der Fehler in MEINER Vorgabe, nicht in der Umsetzung:**
„zähle über `geraet_id`, nicht über den Namen" (Runde 1), die ungemessene
Aussonderung der Geistersperren (Runde 3) und die Annahme, eine
Geistersperre werde auf der Seite überhaupt gerendert (Runde 5 — der
Ausführende hat gemessen, dass der bestehende A2-Riegel den aktiven Fall
schon mit 409 abweist, und BEIDE Zustände getrennt geprüft).

### Betreiber-Befund 17.09.2026: festes Studio-Kürzel im Einrichtungs-Test

Gemeldet: `test_feature_einrichtung_seite.js` legt sein Studio ohne
Zufallssuffix an, deshalb ist der zweite Lauf gegen dieselbe Datenbank rot.
**Der Befund stimmt, ist aber seit `cab4d5c` (12.09.2026) behoben** — der
Melder arbeitete auf einem älteren Stand (seine Zeilennummern 209/317 gegen
heute 229/353, seine „11" Einrichtungspunkte gegen heute 12).

Selbst gemessen statt geglaubt:

- Mechanismus: fester Slug → `id=1` und `id=1` (dieselbe Zeile),
  Zufallssuffix → `id=3` und `id=4`. Ursache ist `core/db.js#createStudio`
  mit `ON CONFLICT (subdomain) DO NOTHING` und Rückfall auf `SELECT id`.
- Dreimal hintereinander gegen dieselbe Wegwerf-DB: **EXIT 0 / 0 / 0**,
  je 59 PASS / 0 FAIL.
- Die Klasse war grösser als diese Datei: die Messung vom 12.09. (im Kopf
  von `test/helfer/studio-kuerzel.js`) fand **48 von 306** Dateien, die im
  zweiten Lauf rot wurden — und ein Kürzel je Datei genügte nicht.
- Ein Wächter verhindert den Rückfall:
  `test_feature_keine_festen_studio_kuerzel_static.js` (registriert in
  `test/run.sh:576`). **Positivkontrolle mit der gemeldeten Zeile selbst:**
  `createStudio('einrichtung-seite', …)` in eine neue Testdatei gelegt →
  **EXIT 1, 23 PASS / 1 FAIL**, mit Datei, Zeile und Literal benannt. Probe
  gelöscht, Baum sauber.

**Nichts gebaut.** `/workspace/gymdocu` existiert weder in diesem Container
noch auf dem Server — der Pfad in der CLAUDE.md zeigt ins Leere und gehört
bei Gelegenheit berichtigt.
