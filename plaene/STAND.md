# Stand — 16.09.2026, ~03:53 UTC

Diese Datei ist der Übergabepunkt. Der Takt-Prompt ist beim Bau von
Beitrag 1 stehengeblieben. **Hier steht, was wirklich gilt.**

Alles, was ein Nachfolger braucht, liegt jetzt IM REPO — Plan, Arbeitspapier
und Befunde. Kein Verweis mehr in den Scratchpad: der ist weg, sobald der
Container neu startet.

**`plaene/ENTSCHIEDEN.md` daneben hält fest, was der Betreiber entschieden
hat und was nicht neu aufgerollt wird.** Diese Beschlüsse standen bis zum
16.09.2026 ausschliesslich im Prompt einer Routine.

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

## Läuft gerade — Beitrag 2b-1

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

**Offen:** die sieben BGB-Einträge in `core/rechtsstand.js` auf
`Art. 6 G v. 23.7.2026 I Nr. 226` mit `bestaetigt_am: '2026-09-16'`
nachziehen. Wartet, weil im GymDocu-Baum ein Executer arbeitet.

**Eigener Befund für später, nicht gebaut:** Dass der Wächter drei
Änderungen als eine meldet, ist kein Fehler — aber eine Lücke. Hätte eine
der übersprungenen unsere Normen berührt, sähe die Meldung genau gleich aus,
und ein Bestätigen ohne Kettenprüfung hätte sie zugedeckt. Entweder der
Wächter verfolgt die Kette selbst, oder die Regel lautet ausdrücklich: vor
jedem Bestätigen die Präambeln rückwärts bis zum festgehaltenen Stand lesen.

Die zweite Meldung (§ 3 UVSV nicht erreichbar) hat sich erledigt: die Quelle
antwortet wieder (HTTP 200). Der Wächter hat richtig gehandelt — erster
Ausfall, kein Befund behauptet, Wiederholung beim nächsten Lauf.

## Notiert, aber ausdrücklich NICHT gebaut

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
