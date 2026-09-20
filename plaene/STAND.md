# Stand — 19.09.2026, ~20:50 UTC

Diese Datei ist der Übergabepunkt. Der Takt-Prompt ist beim Bau von
Beitrag 1 stehengeblieben. **Hier steht, was wirklich gilt.**

Alles, was ein Nachfolger braucht, liegt jetzt IM REPO — Plan, Arbeitspapier
und Befunde. Kein Verweis mehr in den Scratchpad: der ist weg, sobald der
Container neu startet.

**`plaene/ENTSCHIEDEN.md` daneben hält fest, was der Betreiber entschieden
hat und was nicht neu aufgerollt wird.** Diese Beschlüsse standen bis zum
16.09.2026 ausschliesslich im Prompt einer Routine.

## ZIEL, dem alles untergeordnet ist (Betreiber, 17.09. und 18.09.2026)

> „alle erwähnten punkte sollen sicher behoben werden. das system soll einen
> pentest bestehen können."

**Das Programm steht in `plaene/pentest-haertung-programm.md`, sechs Punkte.**
Stand 18.09.2026, 19:00 UTC:

| | Punkt | Stand |
|---|---|---|
| 1+2 | vier schreibende GET-Routen auf POST, CSRF-Ausnahmen-Wächter | **fertig** (#456, Deploy 424) |
| 3 | externe Schnittstelle härten (Ratelimit, Schema, Protokoll) | **NÄCHSTES** |
| 4 | Offboarding-ZIP verschlüsseln | offen |
| 5 | Feldverschlüsselung der sieben Gesundheitsspalten | offen |
| 6 | Monats-PDFs aus dem Hauptprozess | offen |

**Betreiber-Weisung 18.09.2026, ~19:00 UTC: „mach fertig aber verliere das
Ziel nicht aus den Augen."** Anlass war seine Frage, warum der ganze Tag in
die Upload-Härtung ging — die auf KEINEM der sechs Punkte steht. Sie kam aus
dem Abhängigkeits-Audit (multer-CVE), also aus einer eigenen Spur.

**Betreiber-Freigabe 18.09.2026, ~19:40 UTC, wörtlich:** „das system muss
maximal sicher und gehärtet sein. aufwand und kosten egal."

Das ändert die Abwägung, nicht das Ziel. Wo bisher wegen der Kosten abgewogen
wurde — mehrere Gegenleser-Läufe statt einem, mehrere Runden, breitere
Bündel — wird ab jetzt zugunsten der Gründlichkeit entschieden. **„Kosten
egal" heisst NICHT „Messlatte egal":** jeder Befund wird weiterhin selbst
nachgemessen, bevor er ein Auftrag wird, und ein Lauf ohne Positivkontrolle
zählt weiterhin nicht. Der teuerste Lauf des Tages (3,6 Mio. Token) hat genau
deshalb getragen, weil seine drei Befunde einzeln nachgeprüft wurden.

**Daraus folgt verbindlich:**

1. **Beitrag 2a wird fertiggestellt** (läuft beim Executer) — eine halb
   geschlossene Klasse ist die schlechteste Lage.
2. **Danach die drei Mandantenbefunde F1–F3 als EIN Beitrag** (Freigabe
   18.09.2026): `POST /api/position` (`etage_id` ungeprüft),
   `POST /admin/belehrungen/freischalten/:belehrungId` (BEIDE Fremd-IDs
   ungeprüft, Tabelle ohne Fremdschlüssel), und der Ausmusterungs-Token, der
   vor der Studio-Prüfung verbraucht wird. Dieselbe Klasse, ein Beitrag.
3. **Danach Punkt 3 des Programms**, NICHT 2b/2c. Die Abbruch-Markierung und
   die Löschreihenfolge sind Betriebsqualität, kein Pentest-Thema.
4. **2b und 2c sind ZURÜCKGESTELLT**, nicht gestrichen. Das Auftragspapier
   Fassung 3 bleibt gültig und liegt bereit.
5. Wer hier eine neue Spur aufmacht, die nicht auf einen der sechs Punkte
   einzahlt, schreibt in EINEN Satz dazu, warum sie vorgeht — in denselben
   Zwischenstand, in dem die Suite-Zahlen stehen.

Punkt 4 ist die Lehre des Tages: Die Upload-Spur war sachlich richtig (sie
hat ein echtes Informationsleck gefunden), aber sie ist ohne Entscheidung an
das Programm vorbeigewachsen, und gemerkt hat es der Betreiber, nicht ich.

## LÄUFT GERADE (19.09.2026, ~20:50 UTC)

**NICHTS.** Kein Executer, kein Gegenleser, keine Suite, keine CI. Alle vier
Arbeitsbäume sauber. #461 ist gemergt, ausgeliefert und kontrolliert.

**Der nächste Schritt ist frei wählbar** — die Reihenfolge steht unten unter
„Als Nächstes".

## Der Gegenleser ist wieder erreichbar (18.09.2026, ~20:20 UTC)

Der Betreiber hat Guthaben nachgelegt. Positivkontrolle gefahren: ein frei
erfundenes Wort kam wörtlich zurück, `status: completed`. Der Abschnitt über
die Nichterreichbarkeit ist damit Verlauf.

**Was währenddessen galt und was daraus bleibt:** Die Regel „der Plan geht VOR
der ersten Bau-Runde raus" hat einen Ausweg für den Fall, dass der Prüfer
nicht erreichbar ist (ein Satz Begründung im Zwischenstand). Der Ausweg wurde
gebraucht und hat funktioniert. Seit dem Nachlegen wird die Regel wieder
vollständig befolgt — mit dem unten belegten Ergebnis.

## Was die Planprüfung an EINEM Abend geleistet hat

Vier Läufe, drei über PLÄNE, einer über fertigen CODE:

| Lauf | Art | Befunde | selbst nachgemessen getragen | blockierend |
|---|---|---|---|---|
| Mandantengrenze | Plan | 6 | 6 | 1 |
| Zusicherung/qpdf | Plan | 5 | 5 | 2 |
| Gate/XSS/Dekodierung | Plan | 6 | 6 | 2 |
| Upload-Härtung 2a | Code | 6 | 6 | 1 (+1 Regress) |

**23 von 23 getragen, keiner gefallen.** Vier widerlegten eine BEHEBUNG statt
eines Befunds. Einzelheiten und die ehrlichen Einschränkungen stehen in
`ASTRA-LAEUFE.md`; hier nur, was für die Arbeit folgt: **kein Bauauftrag geht
mehr ohne Planprüfung raus, solange der Prüfer erreichbar ist.**

## OFFENE BEFUNDE — alle selbst nachgemessen (Stand 20:45 UTC)

Die Auftragspapiere liegen fertig in `plaene/`. Reihenfolge unten.

### Gebaut, wartet auf Abschluss

| | Was | Zweig | Stand |
|---|---|---|---|
| 2a | Upload-Wrapper vereinheitlicht, Pfad-Leck geschlossen | `claude/upload-haertung-2a` | Suite war grün (12298/0), Prüfung fand 6 Befunde → Nacharbeit läuft |
| M1 | `POST /admin/lageplan/api/position`: fremde `etage_id` ungeprüft | `claude/mandantengrenze-fremd-ids` | wird gebaut |
| M2 | `POST /admin/belehrungen/freischalten/:id`: ZWEI fremde IDs ungeprüft | dito | wird gebaut |

### Papier fertig, Bau steht aus

**`plaene/auftrag-gate-xss-riegel.md` (Fassung 2)** — drei Befunde:

- **G1, der schwerste des Tages:** Die Tablet-PIN-Sperre wird durch eine
  angehängte Dateiendung umgangen. `/login/tablet` vergibt eine Sitzung ohne
  Nachweis, das Gate lässt jeden Pfad mit Asset-Endung durch (`server.js:767`),
  und `parseInt("123.js")` ergibt 123. **Auch ein SCHREIBWEG**
  (`POST /module/seil-foto/123.jpg` schreibt Datei und DB-Zeile). Der
  CSRF-Schutz ist kein Ersatz. Behebung: den Operanden **samt seinem `||`**
  entfernen — alle Auslieferungen echter Dateien liegen vor dem Gate.
  Mitgebaut wird die Regression, die das Löschen einführen würde
  (`session.returnTo` von Unteranfragen überschrieben).
- **G2:** Das Kategorie-Symbol geht roh ins HTML — an DREI Stellen, die
  dritte (`server.js:1199`) ist der „Jetzt fällig"-Block der Startseite und
  trifft jeden Benutzer, nicht nur Admins.
- **G3:** Doppelte Dekodierung → `URIError` → HTTP 500 mit Telegram-Alarm,
  auslösbar durch `?ok=%25`. **ZWÖLF Fundstellen**, alle in denselben Beitrag.

**`plaene/auftrag-zusicherung-shell-qpdf.md` (Fassung 2)** — eine Zusicherung,
die durch Einschalten der Shell nicht rot wird; der statische Wächter dagegen
(mehrzeilige Form ist Pflicht, Alias `promisify(execFile)` steht im Bestand);
qpdf-Passwort mit führendem `-` ODER `@` abweisen (`@datei` ist dokumentierte
qpdf-Syntax); stiller `catch` auf der Startseite.

**`plaene/auftrag-fotoloeschung-identitaet.md`** — Betreiber-Entscheidung
18.09.2026: „ja an idendität binden". Planprüfung läuft. Die Folge, die der
Betreiber kennt: ein Studio ohne freigeschaltetes Gerät kann danach vom
Tablet aus nicht mehr löschen; der Admin-Weg bleibt.

### Gemessen, noch kein Papier

| | Stelle | Was | Quelle |
|---|---|---|---|
| S1 | `routes/webhooks.js:146-160` | Magicline-TOFU: im 30-Min-Fenster wird JEDER `X-API-Key` eines Unangemeldeten zum vertrauten Schlüssel → Schreibzugriff auf ein fremdes Studio | Lauf B |
| S2 | `server.js:774` | Tablet-Identität allein am Zeitstempel; `aktiv=1` wird nie nachgelesen → deaktivierter Mitarbeiter unterschreibt weiter | Lauf B |
| S3 | `routes/archiv.js:572` | 15-Minuten-Archivfreischaltung ohne Benutzer-ID und ohne `regenerate()` → überlebt Kontosperre | Lauf B |
| S4 | `routes/auth.js:1006` | Sperre wird VOR der Geheimnisprüfung gelesen, erst danach gezählt → parallele Versuche | Lauf B |
| S6 | `routes/belehrungen.js:1475,1649,2074` | **Ein Audit-Fehler löscht die gerade gespeicherte Nachweisdatei**; beim Ersetzen ist die alte schon weg → beide verloren. Von ZWEI Läufen unabhängig gefunden | Läufe A2+C |

**GEFALLEN, wird nicht gebaut:** der Ausmusterungs-Token (256-Bit-ID, Verhalten
im Kopfkommentar begründet).

## Reihenfolge, die jetzt gilt

1. **2a-Nacharbeit** abschliessen → Diff lesen, Suite, Review-Bot, CI, Merge, Deploy.
2. **M1+M2** abschliessen (dito).
3. **Gate-Beitrag** (G1 zuerst und allein committen — Authentifizierung).
4. **Fotolöschung an Identität binden** (Betreiber-Auftrag).
5. **Zusicherung/qpdf.**
6. **S6** (Dateiverlust) — eigenes Papier nötig.
7. **Punkt 3 des Programms** (externe Schnittstelle); dorthin gehören S1 und S4.

## Stand JETZT — das gilt, alles Weitere ist Verlauf

Die Abschnitte unter dieser Übersicht beschreiben, WIE es dazu kam. Wo sie
einen Zwischenstand melden, ist er überholt; maßgeblich ist diese Liste.

| Sache | Stand |
|---|---|
| Beitrag 1 (Freigabe nur melden, wenn sie stattfand) | gemergt, `186c0aa` |
| Beitrag 2a (Datenmodell und Leser) | gemergt `613a2c9`, Deploy 415, live-check grün |
| Beitrag 2b-1 (Ausmustern auslösbar) | gemergt `eb276d9`, Deploy 416, live-check grün |
| Die sieben BGB-Einträge | gemergt `7abea9f`, Deploy 417 `success`, live-check grün |
| Rechtsstand-Wächter Stufe 1 | **gemergt `c1b052f`, Deploy 419 `success`, live-check grün** — `install` der Ops-Kopie am 17.09.2026 vom Betreiber erledigt und belegt (`grep -c "lieferung: 'xml'"` -> 2). **ACHTUNG: der Sammelbeitrag ändert die ops-Datei erneut** — nach seinem Merge muss der `install` WIEDERHOLT werden, sonst meldet der Riegel eine Versionsabweichung, die es gibt |
| Orbit4-Recherche | erledigt, `plaene/wettbewerb-orbit4.md` |
| Beitrag 2b-2 (Rückweg) | **umgedeutet** — der Kern ist ein offenes Rennen. Runden 1–4 gebaut und von mir abgenommen (`eddd42d`, Suite grün, 74/0, fünf eigene Gegenproben). ZWEITE Gegenlesung durch: Astra 3 + Claude-Review 11 Befunde, **null Überschneidung**. **Runde 5 abgenommen** (`9c1a894`, Suite grün, 87/0, vier eigene Gegenproben). Gegenlesung fand die **VIERTE** Blindstelle in vier Runden (ein Leerzeichen im SQL). **Runde 6 abgenommen** (`a392bd6`, Suite grün, 88/0, drei eigene Gegenproben). Zweite Prüfspur fand die **FÜNFTE** Blindstelle, dreifach am Inventar (`pg_try_…`, GROSSSCHREIBUNG, `/*`-Präfix) plus Pfeilfunktion am Fenster — alle vier selbst gemessen, alle 88/0. **Runde 7 abgenommen** (`4a0862b`, Suite grün, 138/0, fünf eigene Gegenproben). Der Ausführende ordnet selbst ein: die Fixtur VERSCHIEBT die Klasse, sie schliesst sie nicht (D16) — das nehme ich an, **keine weitere Verfeinerung**. Runde 8 (vier gemessene Fehler) abgenommen: Suite grün, **145/0**, 327 = 327, Lint 0. **AUSGELIEFERT** (`549a5ee`, Deploy 422 success, live-check grün). Vier Restwege datiert offen |
| Doku-Stand ins Belehrungssystem-main | gemergt `254959c` (Bot 5/5, ein Befund behoben) |
| Gerätealter an der Ausmusterung (Orbit4, Punkt 1) | **gemergt `922d1ed`, Deploy 420 `success`, live-check grün** |
| Jira-Anbindung | **vom Betreiber verworfen** 16.09.2026, s. `plaene/ENTSCHIEDEN.md` |
| Rechtsstand-Sammelbeitrag (7 offene Punkte) | **gemergt `17026a1` (#453), Deploy 421 `success`, live-check grün** — OFFEN beim Betreiber: `install` der Ops-Kopie, Gegenprobe `grep -c fuelleUnbestaetigtZeilen` (0 vorher, 7 nachher) |
| Doku ins Belehrungssystem-main | gemergt `cbf5c31` (Bot 5/5, vier Befunde behoben) |
| Verklemmung `qr_token` (#233) | **gemergt `a7ea96a`, Deploy 418 `success`, live-check grün** |
| Härtung P1+P2 (CSRF-Ausnahmen-Wächter, Body-Härtung) | **gemergt `903247b` (#456), Deploy 424 `success`, live-check `EXIT 0`** — sechs Bau-Runden plus Nacharbeit, Regex→Syntaxbaum |
| Upload-Härtung Beitrag 1 (multer 2.4.0, Fehlerbehandlung, Lageplan-Datenverlust) | **gemergt `78310b5` (#457)** — Suite `SUITE_EXIT=0`, 0 echte Fehlschläge, Dateizahl-Ritual 337 = 337 (`diff` EXIT 0), Lint 0. Eigene Gegenprobe an einem ANDEREN Wrapper als der Executer: mit Defekt **58/2** (genau dessen zwei Zusicherungen), Rücknahme gegen `cp`-Kopie `diff` EXIT 0, ohne Defekt **60/0**. Fünf Prüfinstanzen (Planprüfung, Astra, Claude-Review, Review-Bot, CI), drei Nacharbeitsrunden. **Deploy 425 `success`** (richtiger `head_sha`), **live-check `EXIT 0`** — vier ✓, zwei ehrliche ℹ (Zertifikat und Health-Endpunkt sind aus dieser Umgebung grundsätzlich nicht messbar) |
| Offene Punkte der Upload-Härtung (U1–U8) | **gemergt `03f0c3c` (#458), Deploy 426 `success`, live-check `EXIT 0`** — nur Doku, ein Abschnitt in `docs/offene-befunde-31-08-2026.md`. **Acht** Punkte (U8 kam aus einem Bot-Befund), je mit Angabe gemessen/gelesen. U1 ist dynamisch gemessen und widerlegte dabei meine eigene Angabe (`err.code` bei Abbruch `undefined`). Drei Bot-Befunde, alle nachgemessen, alle getragen. Keine Gegenlesung — Restkategorie reine Textänderung |
| Upload-Härtung Beitrag 2 (Plan) | **Auftragspapier Fassung 3**, `plaene/auftrag-upload-haertung-2.md`. ZWEI Planprüfungen: Runde 1 neun Befunde, Runde 2 sieben (drei blockierend) — **alle 16 selbst nachgemessen, alle 16 getragen**. Ergebnis ist ein anderer ZUSCHNITT, kein korrigierter Plan: **#457 hat nur 5 von 10 Upload-Eintrittspunkten behoben**, vier sind offen (`admin/geraete.js`, `wartung.js`, `module.js`, `sichtpruefung.js`), einer war schon richtig (`verify.js`). Beitrag 2a vereinheitlicht sie, 2b bringt danach die Abbruch-Markierung, 2c die Löschreihenfolge. **Noch nicht gebaut** |
| IT-Unterlagen (fünf Dokumente) | **überarbeitet und gepusht** (`fffbb92` + `996078f`), PDFs geliefert. Nicht gemergt — eigener Zweig |

**`/home/user/gymdocu` ist FREI** (18.09.2026, ~16:55 UTC). Der Executer hat
gemeldet, sein Beitrag ist gemergt, der Arbeitsbaum steht auf `master`
(`78310b5`), `git status` sauber, der Lese-Arbeitsbaum `/workspace/gymdocu-lese`
ist entfernt.

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

### Rechtsstand-Sammelbeitrag — Runde 1 gebaut, drei blockierende Befunde (17.09.2026)

Zweig `claude/rechtsstand-sammelbeitrag`, Commit `abbb30a`, Basis `922d1ed`.
Sechs der sieben Punkte gebaut; Punkt 7 (doppelte Längenrechnung) hat der
Ausführende bewusst ausgelassen, weil `baueMeldung()` in diesem Beitrag
schon zweimal umgebaut wurde — richtig entschieden, bleibt so.

Eigene Abnahme von Runde 1: Suite **SUITE_EXIT=0**, `test_feature_rechtsstand.js`
**281 PASS / 0 FAIL**, Dateizahl **326 = 326**, Lint EXIT 0, Marker 6.
Registerabgleich: mein Skript meldete zweimal 46/0/15 — die Lücke waren 11
BetrSichV-Paragrafen mit Zeitüberschreitung, gezielt mit 120-Sekunden-Limit
nachgeholt: **11 von 11 stimmen, 0 Abweichungen**. Vollbild 57/0/4.

Eigene Messungen zu Runde 1 (alle gehalten): Schleifenabbruch weg (1147
Zeichen, „5 von 6 ausführlich gezeigt", Reihenfolge egal), Unerreichbar-Liste
beziffert („54 von 60"), `<enbez/>` verschluckt nichts mehr.

**Die unabhängige Review lieferte 15 Befunde; drei davon habe ich selbst
gemessen und sie sind blockierend:**

1. **Punkt 6 kehrt den Riegel um, den er schützen soll.** Gemessen gegen den
   echten Vor-Commit-Kern (`git archive 922d1ed`): die neue Ops-Kopie gegen
   den alten Kern ergibt `lieferung: undefined` →
   `{lage:'nicht_erreichbar', opsKopieVeraltet:true}` für alle 61 Quellen,
   also das GEGENTEIL der Wahrheit samt eines bereits ausgeführten
   `install`-Befehls. Vorher war die Ops-Datei in dieser Richtung immun.
   **Wird zurückgebaut** — die Doppelung des Literals bleibt bewusst stehen:
   der Riegel darf nicht über genau die Datei laufen, deren Abweichung er
   erkennen soll.
2. **Punkt 4 wirft die Unerreichbar-Liste ganz raus, wo Platz gewesen wäre.**
   Gemessen (15 rot mit 200-Zeichen-Grund + 3 unerreichbar): 4039 von 4096
   Zeichen, **0 von 3 namentlich genannt**, 57 Zeichen ungenutzt. Die Zahl
   bleibt („0 von 3 ausführlich gezeigt"), die Namen nicht. Behebung: die
   Unerreichbar-Zeilen bekommen ihr Budget VOR den roten Einzelheiten.
3. **`<metadaten>` verträgt kein Attribut und fällt STILL auf das ganze
   Dokument zurück.** Gemessen: `<metadaten builddate="…">` liefert die
   Standangabe des ZWEITEN Paragrafen statt des ersten, ohne Fehler — ein
   falscher, plausibler Wert direkt im geaendert/unveraendert-Vergleich.
   Bestandscode, aber dieselbe Attribut-Klasse und die einzige davon, die
   nicht laut scheitert.

Dazu drei Zusicherungen, die ihren eigenen Fehler nicht sehen (die
Positivkontrolle zu Punkt 1 misst eine nachgebaute Schleife; beide
`<textdaten/>`-Zusicherungen sind mit UND ohne Behebung grün; die
Runde-5-Zusicherung zur Unerreichbar-Liste kann den Rückfall nicht fangen),
und drei Kommentare, die jetzt falsch dastehen.

## Rechtsstand-Sammelbeitrag, Runde 2 abgenommen — ein eigener blockierender Befund (17.09.2026, ~10:00 UTC)

Runde 2 (`2e40bc2`) hat die drei blockierenden Befunde aus Runde 1 behoben:
Punkt 6 (gemeinsame Konstante `GII_LIEFERUNG_XML`) vollständig ZURÜCKGEBAUT,
die `<metadaten>`-Attributlücke in `standAusXml()` geschlossen, die
Budget-Reihenfolge in `baueMeldung()` umgestellt. Abnahme des Ausführenden:
SUITE_EXIT=0, 288 PASS / 0 FAIL in `test_feature_rechtsstand.js`,
Dateizahl-Ritual 326 = 326, Lint EXIT 0, Registerabgleich 57/0/4.

**Beim eigenen Nachmessen der dritten Behebung fiel auf, dass sie den Fehler
GESPIEGELT statt behoben hat.** Die Umstellung gibt der Unerreichbar-Liste
das Budget ZUERST und VOLLSTÄNDIG. Gemessen an `baueMeldung()` direkt,
rote Einträge mit 200-Zeichen-Grund:

    rot= 6 unb=55 | Laenge 3801/4096 | rot namentlich 0/6  | unerreichbar 55/55
    rot= 1 unb=60 | Laenge 4031/4096 | rot namentlich 0/1  | unerreichbar 57/60
    rot=11 unb=50 | Laenge 3849/4096 | rot namentlich 1/11 | unerreichbar 50/50

Bei einem grossflächigen Quellenausfall verschwinden also die ROTEN Funde
namentlich vollständig. Das ist kein Papierfall: der Registerabgleich vom
selben Vormittag meldete zweimal hintereinander 15 von 61 Quellen
NICHT_PRUEFBAR, beide Male HTTP 503 von gesetze-im-internet.de.

Dazu trägt die Begründung im neuen Kommentar nicht — „eine nicht geprüfte
Quelle lässt sich nicht nachlesen" ist falsch: `schreibeStand()` schreibt
`quellenObjekt[b.url] = { ...b }` für JEDE Bewertung, die unerreichbaren
stehen in der Statusdatei so vollständig wie die roten.

**Behebungsentwurf, an einer Kopie durchgemessen (Zwei-Zug):** unbestätigt
darf im ersten Zug höchstens `Math.floor(budget / 2)` binden; was rot/ruhig
danach nicht gebraucht haben, bekommt sie im zweiten Zug zurück. Gemessen,
gegen `2e40bc2`:

    Fall                   heute                 Zwei-Zug
    rot=15 unb= 3          rot  9/15, unb  3/3   rot  9/15, unb  3/3   (unverändert)
    rot=15 unb= 0          rot 10/15             rot 10/15             (unverändert)
    rot= 0 unb=30          unb 30/30             unb 30/30             (unverändert)
    rot= 0 unb=60          unb 59/60             unb 59/60             (unverändert)
    rot= 6 unb=55          rot  0/6,  unb 55/55  rot  5/6,  unb 29/55
    rot= 1 unb=60          rot  0/1,  unb 57/60  rot  1/1,  unb 52/60
    rot=11 unb=50          rot  1/11, unb 50/50  rot  5/11, unb 29/50
    rot= 6 ruhig=5 unb=55  rot  0/6              rot  4/6,  unb 31/55

In keinem gemessenen Fall schlechter, in vier Fällen entscheidend besser;
längste Meldung 4063 von 4096. Auftrag liegt als Runde 3 beim selben
Ausführenden, samt der Forderung nach einer Gegenprobe (Ein-Zug nachbauen,
0 von 6 roten Quellen namentlich zusichern) — ohne sie wäre die neue
Zusicherung nicht von einer zu unterscheiden, die ohnehin immer grün ist.

Zwei Kommentare hängen daran und werden mitkorrigiert: der Satz
„Reihenfolge des Budgets bleibt Schweregrad-basiert: rot vor ruhig vor
unbestätigt" steht seit `2e40bc2` sechs Zeilen über dem Code, der ihn
widerlegt; und die widerlegte Statusdatei-Begründung.

## Runde 3 gebaut und eigene Korrektur nachgezogen (17.09.2026, ~10:20 UTC)

Der Zwei-Zug ist gebaut (`bc448d9`). Gegen meinen eigenen Auftrag hat der
Ausführende dabei einen Fehler in MEINER Beweisführung gefunden und gemeldet
statt ihn zu übernehmen: die Behauptung „der zweite Zug liefert immer eine
OBERMENGE des ersten" folgt NICHT aus der Budget-Ungleichung.
`fuelleUnbestaetigtZeilen()` überspringt zu grosse Einträge (`continue`) und
ist deshalb nicht monoton in der Budgetgrösse.

Selbst nachgemessen, und zwar in beide Richtungen:

    Fixtur: ein 3000-Zeichen-Eintrag vor 50 kurzen
    Stand           | nur 50 kleine | Riese ZUERST + 50 kleine
    abbb30a (R1)    | 50 von 50     | 20 von 50, Riese drin
    2e40bc2 (R2)    | 50 von 50     | 20 von 50, Riese drin
    bc448d9 (R3)    | 50 von 50     | 20 von 50, Riese drin

Damit steht zweierlei fest: die Eigenschaft ist echt, und sie ist **kein
Regress dieses Beitrags** — sie steckt in der Füllfunktion selbst. Mit dem
ECHTEN Register ist sie ausserdem unerreichbar: 72 Quellen ergeben 29
Gruppen, die längste daraus baubare Zeile misst **255 Zeichen** (§ 12
BetrSichV mit elf gruppierten Paragrafen), nötig wären rund 2000. Vollausfall
aller 29 Gruppen: 3546 von 4096 Zeichen, **29 von 29 namentlich**.

Korrektur `9905887` (von mir selbst geschrieben, Bagatellgrenze — reine
Prosa): die widerlegte Herleitung ist aus dem Kommentar und aus dem
Zusicherungsnamen raus, an ihre Stelle treten die Messungen oben. Der
Zusicherungsname nennt jetzt „diese fünf Fälle" statt einer Garantie.

**Abnahme `9905887`:** SUITE_EXIT=0, `test_feature_rechtsstand.js` 295 PASS /
0 FAIL, Dateizahl-Ritual 326 = 326 (breites Sieb auf BEIDEN Seiten, `diff`
EXIT 0), Lint EXIT 0, Marker 6.

Dabei eine eigene Berichtigung: mein erstes Dateizahl-Ritual meldete
„322 = 322" — beide Seiten mit `\.js` gesiebt, wodurch `ops/boot-smoke.js`
und die drei `test_feature_audit2_batch[ABC]_static.js` auf BEIDEN Seiten
fehlten. Gleichheit hielt, das Sieb war falsch. Mit dem vorgeschriebenen
Muster sind es 326.

**Offen:** Gegenlesung läuft, danach `/code-review`, dann erst PR.

## Beide Prüfspuren durch, Runde 4 im Bau (17.09.2026, ~10:40 UTC)

Gegenlesung (3 Befunde, 2 getragen, 1 gefallen — Zeile in `ASTRA-LAEUFE.md`)
und `/code-review` (12 Befunde) gelaufen. **Die Überschneidungsfrage ist für
diesen Lauf NICHT auswertbar, und zwar durch meinen eigenen Fehler:** ich habe
der Claude-Spur drei Befunde im Auftrag ausdrücklich ausgeschlossen („bereits
gemessen, nicht erneut melden"). Damit liefen die Spuren nicht unabhängig. Die
Reihe 1/7 → 5/7 → 0/6 bekommt keinen vierten Datenpunkt.

**Fünf blockierende Befunde, alle von mir selbst nachgemessen:**

1. `standAusXml()` härtet `<metadaten>` gegen Attribute, die beiden INNEREN
   Muster derselben Funktion bleiben ungeschützt:

       <standkommentar lang="de">                  -> null
       <standtyp lang="de">, zwei <standangabe>    -> "ALTER HINWEIS"
       (je ohne Attribut, Kontrolle)               -> "NEUGEFASST 2026"

   Der erste Fall trifft ALLE gii-xml-Quellen auf einmal, der zweite ist STILL
   und geht direkt in den geaendert/unveraendert-Vergleich.

2. Den Bereichsriegel VOLLSTÄNDIG entfernen (`const bereich = String(xmlText)`)
   lässt **EXIT 0, 295 PASS / 0 FAIL** stehen — die Blockierend-3-Fixtur
   bewacht nicht, wofür sie gebaut wurde. Beide Fixturen tragen im ersten Block
   eine `standtyp='Stand'`-Angabe, der Unterschied tritt gar nicht auf.

3. `continue` -> `break` in `fuelleUnbestaetigtZeilen()` (ops:878): **EXIT 0,
   295 PASS / 0 FAIL**. Alle Unerreichbar-Fixturen haben gleich lange Zeilen,
   die beiden Fassungen sind für sie beobachtungsgleich.

4. **Mein eigener Kommentar ist falsch.** Er sagt, der Zwei-Zug lasse keine
   Kategorie verdrängen. Gemessen:

       rot=15 ruhig= 5 unb= 3 | ruhig 0/5 | 3960/4096
       rot=15 ruhig= 5 unb= 0 | ruhig 0/5 | 4025/4096
       rot= 6 ruhig= 5 unb=55 | ruhig 0/5 | 4019/4096
       rot=10 ruhig=10 unb=10 | ruhig 0/10| 3672/4096   <- 424 Zeichen frei
       rot= 0 ruhig= 5 unb= 3 | ruhig 5/5 | 2229/4096

   `ruhig` hat keinen Boden. Eine Reservierung dafür wird AUSDRÜCKLICH NICHT
   gebaut — ob die Kategorie „kein Handlungsbedarf" einen garantierten Platz
   braucht, entscheidet der Betreiber, nicht ich.

5. Ein Wurf im Argument von `ok()` (`test_feature_rechtsstand.js:2539`) reisst
   die ganze Datei ab, statt EIN FAIL zu melden — aus „ein Fehler" wird
   „unbekannt". Die Nachbarzusicherung acht Zeilen tiefer macht es richtig.

**Ein Befund trägt NICHT und wird nicht gebaut:** drei `fs.readFileSync` auf
eigenen Repo-Quelltext als angeblicher Verstoss gegen „Tests fassen kein echtes
Dateisystem an". Gemessen: **92 der 326 Testdateien** tun das; die Regel zielt
auf `pm2`, `nginx`, `/var/www`.

**Vier weitere festgehalten statt gebaut**, darunter die doppelte Nachbildung
von `baueMeldung()` in der Testdatei (ein vierter Umbau wäre riskanter als der
Befund) und ein zu streichender Punkt: „unquotierter Attributwert mit `/` am
Ende" ist gar kein gültiges XML.

## Entschieden und vorbereitet (17.09.2026, ~11:15 UTC)

**Betreiber-Entscheidung: `ruhig` bekommt KEINEN garantierten Platz in der
Telegram-Meldung.** Wörtlich „so lassen". Die Messreihe (ruhige Einträge
verschwinden namentlich, sobald rote Funde da sind) bleibt als festgehaltener
Befund stehen; die Meldung nennt Anzahl und Art in der Übersicht und darunter
„0 von N ausführlich gezeigt". Nicht erneut fragen, nicht nachträglich bauen.

**Nach dem Merge des Sammelbeitrags fällig — Ops-Kopie auf dem Server neu
installieren.** Der Befehl ist derselbe wie am Vormittag (Quelle ist der
ausgelieferte Produktions-Arbeitsbaum, Ziel `/usr/local/bin/`); er steht
wörtlich in `ops/gymdocu-rechtsstand-watch.js` im Kopfkommentar und wird dem
Betreiber am Ende noch einmal in den Chat gegeben.

Erst NACH erfolgreichem Deploy ausführen, sonst installiert man den alten
Stand ein zweites Mal.

**Die Gegenprobe dazu ist eine ANDERE als beim letzten Mal, und das ist der
Punkt.** Am Vormittag hat `grep -c "lieferung: 'xml'"` den Stufe-1-Stand
belegt. Für diesen Beitrag taugt dieselbe Zeile NICHT mehr — gemessen:

    master (= was heute auf dem Server liegt):  lieferung: 'xml'          -> 2
    Zweig 9905887:                              lieferung: 'xml'          -> 2
    master:                                     fuelleUnbestaetigtZeilen  -> 0
    Zweig 9905887:                              fuelleUnbestaetigtZeilen  -> 7

Der alte Marker steht auf BEIDEN Ständen und kann den install deshalb nicht
mehr bestätigen — eine Prüfung, die nicht fehlschlagen kann. Maßgeblich ist:

    grep -c fuelleUnbestaetigtZeilen /usr/local/bin/gymdocu-rechtsstand-watch.js

Erwartet: **0 vor dem install, 7 danach.** Die 0 vorher ist die
Positivkontrolle — kommt dort schon eine Zahl > 0, war der install entweder
schon gelaufen oder man misst die falsche Datei.

## Runde 4 abgenommen, zweite Gegenlesung durch (17.09.2026, ~11:45 UTC)

Runde 4 (`72d5635`) hat die fünf blockierenden Befunde behoben. Bemerkenswert
am Bericht des Ausführenden: er hat einen Fehler in seinem EIGENEN
Fixtur-Entwurf gemessen und gemeldet, bevor er abgab — seine erste Fassung
(3000-Zeichen-Name) erreichte den kritischen Zweig gar nicht, `continue` und
`break` blieben auch dort beobachtungsgleich. Korrigiert auf 4200 Zeichen mit
einer Positivkontrolle, dass die lange Quelle selbst nicht mehr passt.

**Meine eigene Abnahme** (nicht seine Zahlen): SUITE_EXIT=0,
`test_feature_rechtsstand.js` **316 PASS / 0 FAIL**, Dateizahl-Ritual
**326 = 326** (`diff` EXIT 0), Lint EXIT 0, Marker 6.

**Die drei Mutationen, die vor Runde 4 nachweislich wirkungslos waren,
greifen jetzt — je einzeln von mir gemessen:**

    Mutation                          | vor Runde 4     | jetzt
    continue -> break (ops:878)       | EXIT 0, 295/0   | EXIT 1, 314/2
    Bereichsriegel ganz entfernt      | EXIT 0, 295/0   | EXIT 1, 315/1
    <standtyp>-Haertung zurueckgedreht| —               | EXIT 1, 315/1

Jedes Mal fallen genau die dafür gebauten Zusicherungen. Alle Mutationen über
frisch gezogene `cp`-Kopien zurückgenommen, `diff` EXIT 0, Marker wieder 6.

**Zweite Gegenlesung (Hausregel: fällig, weil Runde 4 VERHALTEN geändert hat):
kein blockierender Befund.** Ihr Wert lag im gezielten Ausschluss statt im
Fund — der neue `sicher()`-Wrapper über rund 24 Aufrufstellen verwandelt an
keiner Stelle einen gefangenen Fehler in eine bestandene Zusicherung, jede
Weiterverwendung einzeln nachgesehen. Das war mein Hauptverdacht. Zeile in
`ASTRA-LAEUFE.md`; das ist der erste Datenpunkt dafür, dass eine zweite Runde
auch bestätigen kann.

**Zwei Befunde daraus, beide selbst nachgemessen, beide getragen:**

1. Die Abschlusszeilen-Zusicherung baute ihren Ausdruck zusammen und prüfte
   damit einen TEILSTRING statt einer Zahl — gemessen matcht
   `"5 von 6 ausführlich gezeigt"` auch in `"15 von 6 ausführlich gezeigt"`.
   Selbst behoben (Bagatellgrenze, eine Zusicherung), in beide Richtungen
   gemessen mit einem eingebauten Zählerfehler (`gezeigt + 10`):

       mit der neuen Zusicherung:  EXIT 1, 311 PASS / 5 FAIL  (sie faellt)
       mit der alten Zusicherung:  EXIT 1, 312 PASS / 4 FAIL  (sie faellt NICHT)

2. Ein quotiertes `>` INNERHALB eines Attributwerts bricht die gehärteten
   Muster: `<standkommentar quelle="a>b">NEU</…>` liefert gemessen `b">NEU`
   statt `NEU`. **Dokumentiert, NICHT behoben** — kein echtes gii-Dokument
   trägt das, die Klasse ist laut statt still, und ein quotierungsbewusster
   Erkenner wäre der fünfte Umbau derselben Funktion.

**Offen:** volle Suite über meine zwei Änderungen läuft, danach Commit, PR,
Bot-Kommentare VOR den Checks, CI, Merge, Deploy, live-check. Danach der
`install` der Ops-Kopie mit der Gegenprobe auf `fuelleUnbestaetigtZeilen`
(0 vorher, 7 nachher) — s. Abschnitt darüber.

## Sammelbeitrag AUSGELIEFERT (17.09.2026, ~12:30 UTC)

Gemergt als `17026a1` (#453), **Deploy-Lauf 421 `success`** mit dem richtigen
`head_sha`, `live-check` grün (die zwei ℹ sind die bekannten, aus dieser
Umgebung nicht messbaren Punkte: Zertifikatslaufzeit und interner
Health-Endpunkt). Merge-Botschaft zurückgelesen, sie endet auf der
Schlusszeile — kein Markup hineingeraten.

Der Bot ging nach dem zweiten Cross-Check von **4/5 auf 5/5**. Beide seiner
Befunde waren vorher schon von den eigenen Prüfspuren gefunden; einer wurde
gebaut, einer mit Messung und Begründung beantwortet.

**OFFEN BEIM BETREIBER — Ops-Kopie neu installieren.** Der Befehl und die
tragfähige Gegenprobe stehen im Abschnitt „Entschieden und vorbereitet"
weiter oben: maßgeblich ist `grep -c fuelleUnbestaetigtZeilen` auf der
installierten Datei, **0 vorher, 7 nachher**. Die alte Prüfung auf
`lieferung: 'xml'` taugt NICHT mehr (2 Treffer auf beiden Ständen) und hätte
den Erfolg auch ohne install bestätigt.

### Was dieser Beitrag über die Arbeitsweise sagt

Vier Bau-Runden, und die ersten drei brachten je einen eigenen blockierenden
Fehler mit — zweimal steckte er in MEINER Vorgabe, nicht in der Umsetzung:

- Runde 1 baute Punkt 6 (gemeinsame Konstante) genau so, wie ich ihn
  beauftragt hatte. Er hätte den Versionsriegel umgekehrt.
- Runde 2 behob die Budget-Verdrängung in der Richtung, die ich gemessen
  hatte — und spiegelte sie in der Gegenrichtung, die im Auftrag nicht stand.
- Runde 3 stützte sich auf eine Herleitung von mir („der zweite Zug liefert
  eine Obermenge"), die der Ausführende als falsch nachgewiesen hat.

Die Lehre ist nicht „mehr Runden", sondern: **die Gegenrichtung gehört in den
Auftrag.** Wer nur die gemessene Richtung beauftragt, bekommt eine Behebung,
die genau dort aufhört.

Zweitens: der teuerste Fund des ganzen Beitrags kam in Runde 4 und war
STILL — `<standtyp lang="de">` liess `standAusXml()` den falschen Block
liefern, ohne Fehler, direkt in den Änderungsvergleich. Die drei lauten
Geschwister waren in Runde 2 gefunden worden. **Nach jeder Härtung eines
Musters gehören die Geschwistermuster derselben Funktion mitgezählt**, nicht
erst wenn eine Prüfspur darauf zeigt.

## Geistersperre-Rennen: Runde 1 abgenommen, Runde 2 im Bau (17.09.2026, ~13:45 UTC)

Zweig `claude/geistersperre-rennen` (`e169480`, Basis `17026a1`). Gebaut: der
Advisory-Lock als erste Anweisung der Seil-Transaktion im Mangel-Nachtrag plus
eine Nachprüfung des Aktivzustands INNERHALB der Transaktion. Kein Rückweg,
keine Anzeigeänderung — wie beauftragt.

**Der Ausführende hat meinem Auftrag an einem tragenden Punkt WIDERSPROCHEN,
und er hatte recht.** Ich hatte vorgegeben: sind die Schlüssel der drei
bestehenden Lock-Nehmer identisch, zieh die Bildung in einen Helfer. Selbst
nachgelesen:

    routes/admin/geraete.js (Löschen :354, Umbenennen :475)
        heute = Serverdatum Europe/Berlin, jetzt.slice(0, 10)
    routes/module.js (Tagescheck :2870)
        heute = Serverdatum — ABER wird durch das CLIENT-Datum ersetzt,
        sobald client_erstellt_am im Fenster -3h … +24h liegt (:2563-2569)

Ein Helfer hätte drei Stellen vereinheitlicht, die verschiedene Dinge
berechnen. Er hat gemessen statt befolgt.

**Meine eigenen Nachmessungen** (Einzeldatei gegen frische `gymdocu_test`):

    Basislauf:            29 PASS /  0 FAIL, EXIT 0
    ohne Lock:            20 PASS /  9 FAIL, EXIT 1   (7 KERNFALL-Zusicherungen)
    ohne Nachprüfung:     23 PASS /  6 FAIL, EXIT 1   (Blockade 1/1b/1c GRÜN)
    Rücknahme:            md5 identisch, diff EXIT 0, Marker 6, git status leer

Alle drei decken sich mit seinem Bericht. Dass bei „ohne Nachprüfung" nur die
Ergebnis-Zusicherungen fallen und die Blockade-Zusicherungen stehen bleiben,
belegt sauber getrennt: Lock und Nachprüfung tragen unabhängig voneinander.

Volle Suite: `SUITE_EXIT=0`, neue Datei 29 PASS / 0 FAIL, Dateizahl-Ritual
**327 = 327** (`diff` EXIT 0), Lint EXIT 0.

Ebenfalls selbst gemessen: `jetztISO()` (`core/datum.js:62`) ist buchstäblich
derselbe Ausdruck wie in `geraete.js`, im selben Prozess zeichengleich. Der
Lock greift also wirklich.

**Warum noch kein PR — die Klasse ist NICHT zu.** Der Ausführende hat einen
ZWEITEN Eintrittspunkt gefunden und benannt: der Seil-Rückfallzweig der
Ausmusterung (`routes/admin/ausmusterung.js`, „GEWÖHNLICHE Deaktivierung")
nimmt nur den Studio-Lock, nicht den Tagesschlüssel. Über ihn entsteht
dieselbe Geistersperre weiter. Nach meinem Auftrag hat er ihn korrekt nur
benannt; nach der Hausregel („Wer EINEN Eintrittspunkt absichert, hat nicht
die Eintrittspunkte abgesichert") bleibt der Beitrag damit hinter seinem
eigenen Zweck. Runde 2 baut seinen eigenen Vorschlag — Studio-Lock ausdrücklich
nach dem Tagesschlüssel und vor der Nachprüfung — **mit der Auflage, die
Sperrreihenfolge zu MESSEN statt herzuleiten**, einschliesslich der Frage, ob
eine Verklemmung entstehen kann.

### Zwei Befunde, die NICHT in diesen Beitrag gehören

1. **Offline-Nachzügler des Tagesschecks.** Kommt eine Seilkontrolle mit
   gestrigem `client_erstellt_am` nach, sperrt sie auf
   `seilkontrolle:<studio>:<gestern>` und serialisiert sich gegen NIEMANDEN
   auf `<heute>`. Das ist ein Loch in der Behebung vom 22.08.2026 auf der
   Tagescheck-Seite, nicht in diesem Beitrag. Geht als datierter offener
   Befund nach `docs/offene-befunde-31-08-2026.md`.
2. **`routes/wartung.js:1305`** (eigener Lock `wartung-sperre:<studio>:<id>`)
   ist nicht untersucht. Wird ebenda festgehalten statt offen gelassen.

## Geistersperre: Runden 2 und 3 abgenommen, Gegenlesung, Runde 4 im Bau (17.09.2026, ~14:45 UTC)

Zweig `claude/geistersperre-rennen`, Stand `d7e3176`. Gebaut sind bisher: der
Tagesschlüssel plus Nachprüfung in der Transaktion (Runde 1), der Studio-Lock
für den zweiten Eintrittspunkt (Runde 2), ein statischer Anker auf
`ausmusterung.js` (Runde 3).

**Eigene Abnahme:** `SUITE_EXIT=0`, Datei **58 PASS / 0 FAIL**, Dateizahl-Ritual
**327 = 327**, Lint EXIT 0, Marker 6.

**Eigene Gegenproben, je einzeln gemessen und zurückgenommen (md5 identisch):**

    ohne Tagesschlüssel:        20 PASS /  9 FAIL   (Szenario A fällt)
    ohne Nachprüfung:           23 PASS /  6 FAIL   (Blockade GRÜN, Ergebnis rot)
    ohne den neuen Studio-Lock: 47 PASS /  7 FAIL   (nur Szenario B fällt)

Die Verklemmungsfrage ist GEMESSEN statt hergeleitet (Szenario G, zwei
Verbindungen gegenläufig): genau eine Seite bekommt `40P01 deadlock detected`.
Die Ordnung Tagesschlüssel → Studio ist damit tragend, nicht Geschmack.

### Die Gegenlesung hat die eigene Arbeit derselben Stunde getroffen

Vier Befunde, drei davon selbst nachgemessen und tragend (Zeile in
`ASTRA-LAEUFE.md`, 11,23 $).

**Der schwerste:** der statische Anker aus Runde 3 — extra gebaut, damit ein
künftiger Verlust des Studio-Locks auffällt — sieht genau diesen Verlust NICHT.
Gemessen an der ECHTEN `routes/admin/ausmusterung.js`, Bedingung von
`SEILKONTROLLE` auf `CARDIO` verbogen (damit läuft der Lock im Seil-Zweig gar
nicht mehr): **58 PASS / 0 FAIL, EXIT 0, null gefallene Zusicherungen.** Er
bindet Anzahl und Textpositionen, nicht die BEDINGUNG. Wird in Runde 4 dicht
gemacht.

**Der zweite:** die Nachprüfung liest die frische Gerätezeile und wirft sie mit
`.some(...)` weg; der INSERT nimmt weiter `geraet.name` aus der VORprüfung,
während die Löschprüfung am AKTUELLEN Namen bindet (`core/seilgeraete.js:156-160`).
Umbenennen zwischendrin → Sperre trägt einen Namen, unter dem sie niemand mehr
findet → dritter Weg zur selben Geistersperre. Wird in Runde 4 gebaut.

### Zwei Befunde ausdrücklich NICHT in diesem Beitrag

1. **Rennen über die Berliner Tagesgrenze.** Selbst nachgelesen und tragend:
   die Löschroute nimmt in ihrer Transaktion NUR den Tagesschlüssel, ihr
   `auditAppend` läuft erst NACH dem Commit — sie hält den Studio-Lock nie.
   Löschen um 23:59:59 auf Tag D, Nachtrag um 00:00:00 auf D+1: keine
   gemeinsame Sperre, der neue Studio-Lock greift ins Leere. Die Behebung
   (Seil-Schlüssel an allen vier Nehmern datumslos) ändert die Granularität an
   drei weiteren Routen und berührt den dokumentierten Bestandskreis — eigene
   gemessene Runde, kein Anhängsel.
2. **Der Demo-Daten-Löscher** (`core/demo_daten.js`, POST
   `/demo-daten/entfernen`) entfernt Seilgeräte hart, ohne Sperrprüfung und
   ohne einen der beiden Locks. Andere Klasse (Zeile verschwindet ganz statt
   `aktiv = 0`), vorbestehend. **Von mir NICHT nachgemessen** — deshalb in
   `ASTRA-LAEUFE.md` nicht als getragen gezählt.

**Auflage an Runde 4:** kein Kommentar und kein Testkopf darf behaupten, die
Geistersperre sei erledigt. Was gilt: drei Eintrittspunkte geschlossen, zwei
Restwege benannt und datiert.

## Geistersperre: Runde 4 abgenommen, zwei Prüfspuren, NULL Überschneidung — Runde 5 im Bau (17.09.2026, ~15:20 UTC)

Zweig `claude/geistersperre-rennen`, Stand `eddd42d`. Runde 4 schliesst den
DRITTEN Eintrittspunkt (die Nachprüfung warf die frische Gerätezeile weg, der
INSERT schrieb den Namen aus der Vorprüfung) und macht den statischen Anker
auf `ausmusterung.js` an die BEDINGUNG gebunden.

**Eigene Abnahme, jede Zahl selbst gemessen:**

    volle Suite            SUITE_EXIT=0, keine FAIL-Zeile
    Dateizahl-Ritual       327 = 327, diff EXIT 0
    eigene Datei           74 PASS / 0 FAIL, EXIT 0
    npm run lint           EXIT 0
    Marker                 nur docs/offene-befunde-31-08-2026.md
    Rücknahmen             md5 dreimal identisch, git status leer

    A  find->some + alter Name          70 PASS /  4 FAIL   (echte Löschroute
                                                             löscht dann wirklich)
    B  SEILKONTROLLE -> CARDIO          72 PASS /  2 FAIL   (Runde-3-Fassung: 58/0)
    C  derselbe Block nur umformatiert  74 PASS /  0 FAIL   (Gegenrichtung)
    D  $1::bigint vor dem Tagesschlüssel
       in der LÖSCHroute                73 PASS /  1 FAIL

D ist mein eigener Zusatz an einer Route, die der Ausführende nicht gemessen
hat: dort sieht NUR die statische Spur die Umgehung, die dynamische deckt
diese Route nicht ab. Damit ist Abschnitt 7 nicht bloss Redundanz.

### Zwei Prüfspuren, null Überschneidung — zum zweiten Mal gemessen

Astra (nur lesend, 11,04 $) drei Befunde, die Claude-Review (ausführend) elf.
**Kein einziger kam in beiden vor** — genauso wie am 13.09.2026. Die Ursache
ist dieselbe und sie ist die eigentliche Auskunft: Astras Befunde lauten
„diese Zusicherung prüft einen anderen Geltungsbereich, als ihr Text
verspricht", Claudes lauten „ich habe mutiert, es blieb grün".

**Die zwei, die weh tun, weil sie unsere eigene Arbeit aus Runde 4 treffen —
beide von mir selbst nachgemessen:**

    fünfter Nehmer in routes/module.js, Studio-Lock ZUERST (also der
    40P01-Kreis), nur mit EINFACHEN Anführungszeichen   ->  74 PASS / 0 FAIL
    ':umbenennen' am Schlüssel der echten Umbenennen-Route -> 74 PASS / 0 FAIL

Die erste Zusicherung sagt wörtlich „in keiner Schreibweise" und sieht genau
eine. Runde 5 baut deshalb ein INVENTAR aller `pg_advisory_xact_lock`-Aufrufe
in `routes/` gegen eine literal hingeschriebene Erwartung, statt ein besseres
Muster zu suchen — ein Muster kann man immer noch einmal umschreiben.

Dazu gemessen: das verankerte „Seil-Zweig"-Fenster ist **847 Zeilen** lang und
enthält fünf fremde Funktionen; `const jetzt = jetztISO();` steht **4×** in der
Datei und wird über die GANZE Datei geprüft. Ein Handler-Fenster (4392–4815,
424 Zeilen) enthält jede der sechs verankerten Zeichenketten genau einmal.

### Eine Schwere zurückgewiesen, mit Zahl

Astra stufte `app.listen(0)` (bindet gemessen an `0.0.0.0`) samt erfundener
Admin-Sitzung als „blockierend für den Einsatz als Live-Deploy-Gate" ein. Die
Tatsache stimmt, die Einstufung für DIESEN Beitrag nicht: **411 Fundstellen in
132 Dateien**, mindestens zehn Testdateien mounten `routes/admin`. Der Beitrag
fügt eine Instanz zu 411 hinzu. Seine eigenen zwei werden gebunden, die Klasse
bleibt datiert offen.

### Der gewichtigste Befund geht NICHT in diesen Beitrag

Der Seil-Tagescheck (`routes/module.js`) hat DIESELBE check-then-act-Lücke,
die dieser Beitrag für den Nachtrag schliesst: `ladeAktiveSeilGeraete()` bei
:2628 ausserhalb der Transaktion, Tx ab :2859, INSERT bei :2982 mit Geräte-Id
UND Gerätename aus jener Vorlesung, keine Nachprüfung. Vierter Eintrittspunkt,
vorbestehend. Selbst am Quelltext nachgelesen, nicht dynamisch gemessen.
Folge für den Text: unser eigener Kommentar bei `sichtpruefung.js:4630` ist zu
weit gefasst — der Tagesschlüssel serialisiert die SCHREIBER, nicht den
Lesezeitpunkt.

Auftrag für Runde 5: `plaene/auftrag-geistersperre-runde5.md`.

### Takt 15:40 UTC — nur Stand nachgezogen

Runde 5 ist als `d4eb9ba` gebaut („Inventar statt Muster, Anker dicht, ein Ort
fuer Offenes"), die Abschluss-Suite des Ausführenden läuft. Nach der Regel beim
Takt-Feuern während eines laufenden Agenten: nichts angefasst.

Was danach ansteht, in dieser Reihenfolge: Diff selbst lesen; die fünf
Gegenproben aus dem Auftrag SELBST nachmessen (die beiden wichtigsten sind der
fünfte Lock-Nehmer mit einfachen Anführungszeichen und das `:umbenennen`-Suffix
— beide lieferten auf `eddd42d` noch 74 PASS / 0 FAIL); volle Suite;
Dateizahl-Ritual; Lint wörtlich melden; Marker-Scan; dann PR (nicht als
Entwurf), Bot-KOMMENTARE vor den Checks, CI, Merge, Deploy, live-check.

Nebenbei beantwortet (Betreiber): keine Managed Nextcloud im Einsatz, sondern
ein VPS Linux L+ (dort die gymdocu-Domains) und ein Cloud Server. Die
dokumentierte Verschlüsselung ruhender Daten bei IONOS gilt für eine ANDERE
Produktlinie (IONOS CLOUD Block Storage) — die Frage bleibt offen, jetzt mit
dem genauen Wortlaut für die Rückfrage im Verschlüsselungspapier.

## Geistersperre: Runde 5 abgenommen — und die VIERTE Blindstelle in vier Runden (17.09.2026, ~16:20 UTC)

Stand `9c1a894`. Meine eigene Abnahme: Suite `SUITE_EXIT=0`, 0 FAIL-Zeilen,
Dateizahl-Ritual **327 = 327**, eigene Datei **87 PASS / 0 FAIL**, Lint EXIT 0,
Marker 6, vier Rücknahmen md5-identisch.

Meine vier Gegenproben zu Runde 5, je einzeln — alle vier tragen:

    fünfter Nehmer, EINFACHE Anführungszeichen   84 PASS / 3 FAIL  (Runde 4: 74/0)
    ':umbenennen' am Umbenennen-Schlüssel        85 PASS / 2 FAIL  (Runde 4: 74/0)
    jetztISO() NUR im Handler durch UTC ersetzt  86 PASS / 1 FAIL
    Scan-Verzeichnis auf routes/admin verengt    81 PASS / 6 FAIL

### Die Reihe, die diesen Beitrag eigentlich beschreibt

    Runde 3   Anker band Anzahl und Position, nicht die BEDINGUNG   58 / 0
    Runde 4   Muster suchte DOPPELTE Anführungszeichen              74 / 0
    Runde 4   Umbenennen-Schlüssel nirgends verankert               74 / 0
    Runde 5   Inventar sucht `pg_advisory_xact_lock(` WÖRTLICH      87 / 0

Der Brief an die Gegenlesung hat diesmal nicht „prüfe den Diff" gefragt,
sondern die eigene Fehlergeschichte als Frage formuliert: *ist er zum VIERTEN
Mal blind, nur eine Ebene tiefer?* Die Antwort war ja, und sie ist von mir
nachgemessen:

- **A1 (blockierend):** ein fünfter Lock-Nehmer in der verklemmenden Ordnung,
  geschrieben als `pg_advisory_xact_lock (hashtext($1))` — EIN Leerzeichen
  mehr, gültiges SQL — ergibt **87 PASS / 0 FAIL**. Das „Inventar statt
  Mustersuche" fängt selbst mit einer Mustersuche an.
- **A3:** EIN führendes Leerzeichen vor `async function ladeOffeneHinweise(`
  verschiebt die Fenstergrenze des Handler-Ankers um 97 Zeilen in eine fremde
  Funktion — **87 PASS / 0 FAIL**. Behebung braucht keinen Parser: das rohe
  Fenster hat heute gemessen GENAU EINEN Funktionskopf.
- **A2:** das Inventar deckt `routes/`, der Produktivkommentar behauptet „kein
  Bestandsweg". Ausserhalb liegen **acht** Lock-Stellen, darunter
  `core/integritaet.js:65` — die dieser Beitrag selbst aufruft.

Runde 6 baut A1–A3, dokumentiert D9–D12. Auftrag:
`plaene/auftrag-geistersperre-runde6.md`.

**Keine Abbruchvorhersage.** Was ich zusage, ist WAS ich noch baue — nur
blockierende Blindstellen —, nicht dass nichts mehr kommt.

### Takt 16:40 UTC — nur Stand nachgezogen

Runde 6 ist als `a392bd6` gebaut und gepusht („Inventar am Bezeichner,
Produktivbaum, Fenstergrenze gebunden"), der Ausführende ist noch in seiner
Abschlussprüfung. Nach der Regel beim Takt-Feuern während eines laufenden
Agenten: nichts angefasst.

Danach meine Abnahme, und dabei besonders die drei Gegenproben, die ich auf
`9c1a894` selbst gemessen habe und die JETZT rot werden müssen:

    pg_advisory_xact_lock (hashtext($1))  — ein Leerzeichen   war 87 / 0
    ein Leerzeichen vor `async function ladeOffeneHinweise(`  war 87 / 0
    Tagesschlüssel-Lock hinter core/integritaet.js:65         war unsichtbar

Dazu die Gegenrichtung (unveränderter Baum grün) und die Frage, ob die
Ausweitung auf den Produktivbaum das Inventar unpflegbar gross macht — dafür
hatte ich eine ZAHL verlangt, keine stille Entscheidung.

## Geistersperre: Runde 6 abgenommen — FÜNFTE Blindstelle, und die Diagnose, die zählt (17.09.2026, ~18:10 UTC)

Stand `a392bd6`. Eigene Abnahme grün: Suite `SUITE_EXIT=0`, 0 FAIL-Zeilen,
**327 = 327**, eigene Datei **88 PASS / 0 FAIL**, Lint EXIT 0, Marker 6,
vier Rücknahmen md5-identisch. Die drei Runde-6-Gegenproben tragen alle
(85/3, 85/3, 87/1) — sie waren auf `9c1a894` noch 87/0 blind.

Der Executer hat mir dabei zweimal widersprochen, beide Male zu Recht: es sind
**neun** Lock-Stellen ausserhalb `routes/`, nicht acht (`generateMonthlyPDFs.js`
fehlte in meiner Zählung), und der naheliegende gierige Blockkommentar-Abzug
frisst Code (18 statt 24 Einträge, sechs Locks verschluckt) — er hat
stattdessen zeilenbasiert abgezogen.

### Die Reihe, vollständig — und warum sie nicht abreisst

    Runde 3  Anker band Anzahl/Position statt der BEDINGUNG      58 / 0
    Runde 4  Muster suchte DOPPELTE Anführungszeichen            74 / 0
    Runde 4  Umbenennen-Schlüssel nirgends verankert             74 / 0
    Runde 5  Inventar suchte `pg_advisory_xact_lock(` WÖRTLICH   87 / 0
    Runde 6  `pg_try_advisory_xact_lock` (andere Familie)        88 / 0
    Runde 6  GROSSSCHREIBUNG (SQL ist case-insensitiv)           88 / 0
    Runde 6  Lock-Zeile mit `/* … */`-Präfix                     88 / 0
    Runde 6  Nachbar als PFEILFUNKTION (Fenster 429 -> 527)      88 / 0

Alle acht von mir selbst gemessen. Nebenbei gezählt: derselbe Kommentarabzug
wirft heute schon **20 echte CSS-Codezeilen** aus dem Produktivbaum.

### Die Diagnose

    auflisten/lesen   git ls-files + gescannte Menge    Referenz von AUSSEN  ✓
    sammeln           literale 24er-Liste               Referenz von AUSSEN  ✓
    ERKENNEN          Regex + Kommentarabzug + Fenster  KEINE Referenz       ✗

Jede der fünf Blindstellen sitzt auf der Stufe ERKENNEN. Solange dort nur
handgeführte Einzelmutationen stehen, verschiebt jede Runde die Lücke eine
Ebene tiefer, statt die Klasse zu schliessen — genau das Muster, das die
CLAUDE.md für den Scanner-Regress beschreibt.

Runde 7 gibt dem ERKENNEN eine Referenz von aussen: eine **synthetische Fixtur**
ausserhalb des gescannten Baums, Katalog von Schreibweisen, unabhängig von Hand
geschriebene Erwartung, Positiv- UND Negativfälle; der Erkenner wird ausgelagert
und in der PRODUKTIONSFORM aufgerufen. `_shared` bekommt damit die
Positivkontrolle, die es heute nirgends hat.

**Ausdrücklich erlaubtes Ergebnis:** wenn der Ausführende zu dem Schluss kommt,
dass auch die Fixtur die Klasse nur verschiebt, hören wir mit dem Verfeinern auf
und schreiben die Grenze hin, statt eine achte Runde zu drehen.

Auftrag: `plaene/auftrag-geistersperre-runde7.md`.

## Geistersperre: Runde 7 abgenommen, Verfeinerung BEENDET, Runde 8 räumt vier Fehler ab (17.09.2026, ~19:00 UTC)

Stand `4a0862b`. Eigene Abnahme: Suite `SUITE_EXIT=0`, 0 FAIL-Zeilen,
**327 = 327**, eigene Datei **138 PASS / 0 FAIL**, Lint EXIT 0, Marker 6,
Zweig nicht hinter master.

Meine Gegenproben — die drei Fälle, die in Runde 6 noch blind waren, sind jetzt
alle rot:

    fünfter Nehmer als `pg_try_advisory_xact_lock`    135 PASS / 3 FAIL  (war 88/0)
    derselbe in GROSSSCHREIBUNG                       135 PASS / 3 FAIL  (war 88/0)
    derselbe mit `/* … */`-Präfixzeile                135 PASS / 3 FAIL  (war 88/0)
    Nachbar als Pfeilfunktion                         137 PASS / 1 FAIL  (war 88/0)
    `i`-Flag aus dem Erkenner entfernt                136 PASS / 2 FAIL

Die letzte ist die wichtigste: die **Fixtur zeigt namentlich** auf
„grossschreibung" und „gemischte-schreibung". Sie ist eine echte
Positivkontrolle, keine Dekoration.

### Die Verfeinerung ist beendet — und zwar auf Ansage des Ausführenden

Er hat die Erlaubnis genutzt, die im Auftrag stand, und schreibt als D16 hin:
**K1 verschiebt die Klasse, es schliesst sie nicht.** Fixtur und Erkenner haben
denselben Autor; sie prüft den Katalog, nicht seine Vollständigkeit. Die
verbleibende Lücke in die gefährliche Richtung nennt er selbst (die
Regex-Heuristik kann Treffer verschlucken). Er schlägt **keine weitere
Verfeinerung** vor. Das nehme ich an.

Die einzige echte Referenz von aussen für das ERKENNEN wäre die Datenbank
(Anweisungsprotokoll während der Suite gegen das Inventar, D15) — als Vorschlag
notiert, **nicht gebaut, nicht zugesagt**.

Er hat mir zudem wieder mit einer Messung widersprochen: mein K2-Vorschlag
(„Treffer nur, wenn der Bezeichner in einem String steht", zeilenweise gezählt)
hatte an der Fixtur **3 Abweichungen von 47 — eine in die gefährliche
Richtung**. Nicht übernommen; die Zeichenmaske hat 0.

### Runde 8: vier gemessene Fehler, drei davon Einzeiler

Die Gegenlesung zu Runde 7 (5,00 $, der billigste Lauf bisher, vier von vier
Befunden tragen) fand:

    Regex-Zweig des Maskierers GANZ abgeschaltet   138 PASS / 0 FAIL — der
      Fixturfall dafür enthält gar keinen zusammenhängenden Bezeichner
    `\` + CRLF-Fortsetzung im String               0 Treffer (mit LF: 1)
    `//`-Kommentar durch U+2028 beendet            0 Treffer
    `t.q({text:…})` gegen `db.q({text:…})`         DERSELBE Inventareintrag —
      die Bindung Transaktion gegen POOL ist für diese Form weg

Alle vier von mir nachgemessen, zwei davon direkt am Helfer ohne Datenbank —
eine ausgelagerte Funktion in Produktionsform macht nicht nur den Test wertvoll,
sondern auch die Nachprüfung eines Befunds billig.

**Runde 8 behebt diese vier und behauptet ausdrücklich NICHT, dass die Klasse
danach geschlossen ist.** D16 bleibt stehen. Danach: PR.

Auftrag: `plaene/auftrag-geistersperre-runde8.md`.

## Geistersperre: Runde 8 abgenommen, PR offen, CI läuft (17.09.2026, ~19:20 UTC)

Stand `4332055`. Eigene Abnahme: Suite `SUITE_EXIT=0`, 0 FAIL-Zeilen,
**327 = 327**, eigene Datei **145 PASS / 0 FAIL**, Lint EXIT 0, Marker 6,
Zweig nicht hinter master, Baum sauber.

Die drei Helfer-Fehler direkt nachgemessen, ohne Datenbank:

    `\` + CRLF-Fortsetzung im String      1 Treffer  (vorher 0)
    `//`-Kommentar durch U+2028 beendet   1 Treffer  (vorher 0)
    `t.q({text:…})` gegen `db.q({text:…})` UNTERSCHEIDBAR (vorher gleich)

### Der Ausführende hat mir ein viertes Mal widersprochen — und wieder zu Recht

Mein F1-Vorschlag war, den wirkungslosen Regex-Negativfall auf
`/pg_advisory_xact_lock/g` umzustellen. Er hat gemessen, dass das NICHT trägt:
mit abgeschaltetem Regex-Zweig ist der Bezeichner dann Code-maskiert, und Code
zählt nie — der Fall bliebe grün. Empfindlich ist erst ein Anführungszeichen
VOR dem Bezeichner (`/['"]pg_advisory_xact_lock/g`), weil es ohne den Zweig
einen Pseudo-String öffnet.

Selbst nachgemessen, beide Richtungen:

    mit Regex-Zweig     meine Form 0, seine Form 0
    ohne Regex-Zweig    meine Form 0 (unempfindlich), seine Form 1 (faengt ihn)

Er hat beide eingetragen — meinen als ehrlich unempfindlichen Negativfall,
seinen als den, der den Zweig bewacht.

Ebenfalls von ihm gemessen, bevor er irgendeine Liste anfasste: die neue
Klammertiefen-Logik lässt die 26 Inventareinträge **zeichengleich** (26 = 26,
`diff` EXIT 0). Die Nebenwirkung, mit der ich gerechnet hatte, trat nicht ein.

**Nächste Schritte:** Bot-Kommentare (bisher leer), CI-Checks gegen den
aktuellen Zweigkopf, Merge, Deploy-Lauf, live-check. Erst danach Meldung an den
Betreiber (Regel 6a).

### Bot-Befunde am PR beantwortet (17.09.2026, ~19:20 UTC)

Zwei Befunde, beide selbst nachgemessen:

**P1 „Midnight bypasses the lock" — Tatsache richtig, Einstufung nicht.**
Das ist unser dokumentierter offener Punkt 3 (Tagesgrenze). Entscheidend ist
die Messung, die ich dazu gemacht habe: auf `master` nimmt
`postMangelNachtragHandler` **gar keinen** Advisory-Lock (0 Treffer für
`pg_advisory` im Handler-Fenster), auf dem Zweig sind es drei. Das Rennen war
vorher rund um die Uhr offen, jetzt nur noch über die Tagesgrenze. Den Beitrag
deshalb nicht zu mergen würde das Loch VERGRÖSSERN. Am PR so geantwortet,
Befund bleibt offen und benannt.

**P2 „Inventory claim is incomplete" — trifft, behoben in `fa641cf`.**
Der Bot nennt es „non-blocking test-quality"; bei uns ist es die teuerste
Klasse. Die Beschriftung sagte „das Inventar ALLER Advisory-Lock-Aufrufe" und
„in welcher Schreibweise auch immer" — nicht erfasst sind SQL aus Variablen
oder Stücken und der Aufruf über eine Konstante (dort zählt nur die
Deklaration). Das stand in D14/D15, aber nicht dort, wo man es liest. Die
Grenze steht jetzt IN der Beschriftung.

Nach dem Fix: Einzeldatei **145 PASS / 0 FAIL**, volle Suite `SUITE_EXIT=0`,
**327 = 327**, Lint EXIT 0, Marker 6. CI läuft auf `fa641cf`.

## Geistersperre AUSGELIEFERT (17.09.2026, 19:40 UTC)

`549a5ee` auf master, Squash von 13 Commits, acht Bau-Runden.

    alle fünf Checks         success auf dem geprueften Kopf fa641cf
    Merge-Botschaft          zurueckgelesen, endet exakt auf der Schlusszeile
    Master-CI                success (19:38:48)
    Deploy-Lauf 422          success, richtiger head_sha
    live-check               EXIT 0, Landingpage/Echtheit/Abweisung/Handbuch gruen
                             2 Punkte ehrlich ℹ (Zertifikat und Health-Endpunkt
                             sind von hier nicht messbar, das ist erwartet)

**Was das NICHT heisst:** dass die Änderung in der Datenbank richtig wirkt. Der
live-check sagt „der Betrieb läuft und ist aktuell", nicht mehr.

### Offen und datiert — nicht neu aufrollen, aber auch nicht vergessen

1. **Seil-Tagescheck mit derselben check-then-act-Lücke** (D1) — VIERTER
   Eintrittspunkt, vorbestehend. Behebung ist dieselbe wie im Nachtrag
   (Nachprüfung in der Tx, Name aus der frischen Zeile). Eigene Runde.
2. **Tagesgrenzen-Rennen** — vom Review-Bot als P1 gemeldet, Tatsache
   zutreffend. War auf master rund um die Uhr offen, jetzt nur am Tageswechsel.
3. **Offline-Nachzügler des Tagesschecks** (Client-Datum im Tagesschlüssel).
4. **Demo-Daten-Löscher** (hartes DELETE ohne Sperrprüfung).
5. **`nachtrag:`-Verklemmungskreis** (D13) — im Bestand, dokumentiert, ungelöst.
6. **D14–D16:** Aufruf aus einer Konstante, Textscan-Grenzen, und die ehrliche
   Einordnung, dass die Fixtur die Klasse verschiebt statt sie zu schliessen.

### Was der Tag methodisch gezeigt hat

Acht Runden, fünf davon wegen eines blinden Wächters. Jede Blindstelle wurde
von einer der beiden Prüfspuren gefunden, **keine vom Ausführenden selbst** —
und keine von der jeweils anderen Spur. Zweimal null Überschneidung, jetzt
dreimal.

Der Ausführende hat mir an **fünf** Stellen mit einer Messung widersprochen
und jedes Mal recht gehabt: `$1::bigint`, meine Zählung (neun statt acht),
der gierige Kommentarabzug, die Nebenwirkungsfrage zur Klammertiefe, und mein
unempfindlicher Regex-Negativfall. Das ist der wertvollste Teil des Verfahrens.

**Nächster Punkt laut Betreiber:** Dokumente für die IT. Bereit liegen die
Verschlüsselungs-Analyse (mit der offenen Frage an IONOS) und die
Sticker-it-Bewertung.

## 17.09.2026, abends — Verschlüsselung der personenbezogenen Daten

Dokumente für die IT sind FERTIG gebaut (`scratchpad/dok/fertig/`, fünf PDFs),
liegen aber auf Wunsch des Betreibers unverschickt. Nicht neu bauen.

Neue Messung am Quelltext (master 549a5ee), die das Verschlüsselungspapier
ergänzt: Das Verbandbuch-Einzel-PDF mit den Art.-9-Gesundheitsdaten wird bei
JEDEM Abruf neu erzeugt und bleibt danach DAUERHAFT unter
`<PDF_ROOT>/<studio>/Verbandbuch/` liegen — gelöscht wird es erst nach fünf
Jahren durch `core/retention.js:319-321`. Niemand liest die Datei je wieder
(einzige Erzeuger: `routes/verbandbuch-admin.js:447` und `:462`, beide liefern
sie direkt aus). Sie ist also ein reines Nebenprodukt des Downloads.

Daraus Stufe 0 vor allen Verschlüsselungsstufen: die Datei gar nicht erst
liegenlassen. Kein Schlüssel, keine Leseweg-Änderung, keine Migration.

Laufender Auftrag: `plaene/auftrag-verschluesselung-stufe0.md`, Zweig
`claude/verschluesselung-stufe0` in `/home/user/gymdocu`. Inhalt: A) PDF nach
dem Download löschen, in allen Ausgängen beider Routen. B) Retention-Report
darf davon nicht dauerhaft gelb werden. C) Aufräumskript für den Altbestand
(Probelauf ist Standard). D) Health-Endpunkt meldet als reine Auskunft, ob
`APP_ENC_KEY`/`TOTP_ENC_KEY` gesetzt ist — NICHT in `degraded`, sonst hinge das
Deploy-Gate daran.

Danach offen, in dieser Reihenfolge: Feldverschlüsselung der acht
Gesundheitsspalten (Entscheidung zu `person_name` steht beim Betreiber),
Offboarding-ZIP, eigene Datenbank-Auszüge.

### Nachtrag 17.09.2026, 20:40 UTC — Entscheidung und Dateibestand

**Entschieden vom Betreiber:** `person_name` bleibt im Klartext, die sieben
Gesundheitsspalten werden verschlüsselt (`hergang`, `beschreibung`, `zeugen`,
`eh_freitext`, `verletzungsarten_json`, `koerperschema_json`,
`eh_massnahmen_json`; dazu `geschlecht` — keine davon wird irgendwo gefiltert
oder sortiert). Begründung: Art. 9 schützt die Gesundheitsinformation, nicht
den Namen; die Namenssuche in der Verbandbuch-Liste bleibt damit vollständig
erhalten. Nicht erneut fragen.

**Dateibestand durchgemessen (master 549a5ee), vier Klassen:**

1. *Schon sauber:* Monats-ZIP (`routes/admin/einstellungen.js:365`, `rmSync`
   im download-Callback) und Archiv-ZIP (`routes/archiv.js:840-845`,
   `aufraeumen`) löschen sich nach der Auslieferung selbst, ebenso die
   qpdf-Variante des Verbandbuch-PDF. Das Verbandbuch-Einzel-PDF war die
   AUSNAHME, nicht die Regel — läuft als Stufe 0.
2. *Nicht sauber:* **Das Offboarding-ZIP.** `core/export-studio.js:237`
   schreibt `<EXPORT_DIR>/<sub>-<stamp>.zip`, gibt den Pfad zurück
   (`server.js:657`) — und NIEMAND löscht es. Vollständiger Datenbestand eines
   ausscheidenden Studios (alle Tabellen als CSV plus Dokumente, Uploads,
   Fotos), unverschlüsselt, dauerhaft. Dichteste Ansammlung im System.
3. *Nachweise, die bleiben müssen:* `DOKUMENTE_DIR` (signierte Belehrungen),
   `EINWEISUNG_NACHWEIS_DIR`, `PRUEFBERICHT_DIR`, `pdf_archiv`. Nur
   Verschlüsselung hilft. Teuer, weil `server.js:730` `/pdf` per
   `express.static` ausliefert — verschlüsselt fällt dieser Weg weg und rund
   fünfzehn Lesestellen müssen einzeln entschlüsseln. Eigener Beitrag.
   Zwei Punkte dazu: die ZWEITKOPIE ist bereits verschlüsselt
   (`core/storage-replica.js`, `GYMDOCU_REPLICA_KEY`), nur die primäre nicht —
   und der ORDNERNAME trägt den Personennamen
   (`Dokumente/<mitarbeiterId>_<safeName>/`, `routes/belehrungen.js:860-869`).
   Verschlüsselte Inhalte ändern daran nichts; eigener kleiner Punkt.
4. *Ohne Personenbezug:* `lageplan-uploads/`, `belehrung-vorlagen/`.
   Defekt-Fotos sind ein Grenzfall, haben aber bereits `core/foto-reaper.js`.

**Gemessen zur Rückfrage „kann ein Admin den Monatsbericht dann noch öffnen":**
Ja, uneingeschränkt. Verschlüsselung im Ruhezustand wird beim Ausliefern
aufgelöst; der Admin merkt nichts. Ein Passwort braucht nur, was das System
endgültig verlässt — das Offboarding-ZIP. Und: **Monatsberichte werden gar
nicht per Mail verschickt.** `core/mailer.js:92` kennt zwar `attachments`, aber
der einzige Nutzer im Bestand ist `core/defekt_mailer.js:193-226` (Fotos);
`nachweise_mailer`, `verbandbuch_mailer`, `wartung_mailer` und
`jahrescheck_mailer` verschicken reine Benachrichtigungen.

**Nächste Aufträge in dieser Reihenfolge:** Offboarding-ZIP verschlüsseln
(Passwort, getrennt übergeben) → Feldverschlüsselung der sieben Spalten →
danach erst die bleibenden Nachweise, wenn der Betreiber den Aufwand will.

### Nachtrag 17.09.2026, 21:00 UTC — Härtungsprogramm beauftragt

**Betreiber-Vorgabe:** „alle erwähnten punkte sollen sicher behoben werden. das
system soll einen pentest bestehen können."

Programm in `plaene/pentest-haertung-programm.md`, sechs Punkte, Reihenfolge
nach „was ein Pentest findet". Heute nachgemessen und deshalb NICHT auf der
Liste: Anmelde-Sperre (`routes/auth.js:49`, `LOGIN_MAX=5`, DB-gestützt),
`helmet` (`server.js:35`), und die OWASP-Härtung vom 12.09.2026 (exec→execFile,
Host-Header, PIN-Reset-Anti-Spam) — die beiden Erstgriffe eines Pentests sind
also schon zu.

Reihenfolge: 1) vier GET-Routen, die schreiben + CSRF-Ausnahmen bewachen
(Auftrag liegt fertig als `plaene/auftrag-haertung-p1-p2.md`, wartet auf den
freien Arbeitsbaum) → 2) API-Härtung (Ratelimit, Schema, Protokoll) →
3) Offboarding-ZIP verschlüsseln → 4) Feldverschlüsselung der sieben Spalten
(PLAN vorher gegenlesen lassen — folgenschwer) → 5) Monats-PDFs in die
Job-Queue (Verfügbarkeit, zuletzt).

Nicht gemessen und deshalb nicht behauptet: `npm audit` und die Upload-Wege
(Dateityp/Größe). Beides nachholen, sobald der Arbeitsbaum frei ist.

Sequenziell arbeiten, nicht parallel: die Suite sperrt global
(`/tmp/gymdocu-suite.lock`) und alle Läufe teilen sich dieselbe Datenbank.

### Takt 17.09.2026, 21:40 UTC — nichts getan ausser Stand nachziehen

Der Executer zu `plaene/auftrag-verschluesselung-stufe0.md` läuft noch; keine
Benachrichtigung. Fortschritt ohne Eingriff geprüft (nur Metadaten gelesen, NICHT
im Arbeitsbaum gearbeitet): Zweig `claude/verschluesselung-stufe0` existiert,
zuletzt `eded15d` „neue Testdateien registrieren und Waechter nachziehen",
Arbeitsbaum sauber. Er ist also über die Zusicherungen hinaus und beim
Registrieren in `test/run.sh`.

Zur Einordnung für den, der hier nach einem Neustart weiterliest: die
Transkriptdatei des Agenten (`tasks/<id>.output`) hatte um 21:40 noch die
Größe vom Start (127 Bytes) — **das ist KEIN Zeichen für einen toten Agenten.**
Sie wird offenbar erst am Ende geschrieben. Wer daraus auf Stillstand schliesst,
bricht einen laufenden Auftrag ab. Der belastbare Beleg ist der Zweigstand,
nicht die Transkriptdatei — und sie wird ohnehin nicht gelesen.

Nächster Schritt unverändert: Prüf-Ritual über den Diff, dann
`plaene/auftrag-haertung-p1-p2.md`.

### 17.09.2026, 22:15 UTC — Stufe 0+1 geprüft, Nacharbeit läuft

Executer hat geliefert (`claude/verschluesselung-stufe0`, 12 Dateien, +808/−7,
Suite EXIT 0, Dateizahl-Ritual 330 = 330). **Nicht gemergt** — das Prüf-Ritual
hat fünf blockierende Befunde ergeben.

Drei Prüfspuren, und die Trennung war diesmal so scharf wie noch nie:
Claude-Review 15 Befunde, Astra 8 (4 blockierend), **null Überschneidung bei
den blockierenden**. Der teuerste Befund kam aus KEINER der beiden, sondern
aus einer eigenen stumpfen Messung.

**Selbst gemessen, nicht gelesen:**
- Der Aufräum-Test löscht bei gebrochener PDF_ROOT-Umleitung ECHTE Dateien.
  Nachgestellt: Umleitung entfernt, Attrappen-„Produktions"-PDF_ROOT angelegt —
  die Zusicherungen davor fielen (`✗ FAIL: Exit ungleich 0`), **und der scharfe
  Lauf lief trotzdem und vernichtete die Datei** (`total 0`). `ok()` erhöht nur
  einen Zähler. Dieselbe Suite ist auf dem Live-Server Deploy-Gate.
- Das Aufräumskript folgt einem Verzeichnis-Symlink: `1 gefunden, 1 gelöscht,
  0 Fehler` — die Datei ausserhalb von PDF_ROOT war weg.
- `hatSchluessel()` kostet bei Passphrase-Schlüssel 222 ms auf fünf Aufrufe
  (Hex: 0 ms), synchron, ungecacht — und hängt jetzt an jeder Health-Anfrage.

Nacharbeit: `plaene/auftrag-verschluesselung-stufe0-nacharbeit.md`, an DENSELBEN
Executer (Fortsetzung). Fünf blockierende plus zwölf kleinere Punkte.

**Bewusst NICHT in dieser Runde**, als datierter offener Punkt festzuhalten:
`findeLoeschWurzel` aus `core/retention.js` in ein eigenes kleines Modul
herauslösen. Architektonisch richtig (der Import zieht heute die ganze
Retention-Maschinerie samt DB-Pool in zwei Verbraucher, die nur eine
Pfadprüfung brauchen), aber es fasst ein Kernmodul an, an dem mehrere Wächter
hängen — eigener Beitrag.

Zwei Funde des Executers ÜBER den Auftragswortlaut hinaus waren richtig und
nötig, von beiden Gegenlesungen bestätigt: `absolutAusDateipfad()` statt der
Annahme `PDF_ROOT == <repo>/pdf`, und eine eigene Fehlerantwort im
`res.download`-Callback (mit drittem Parameter sendet Express sonst gar
nichts mehr — die Anfrage hing unbegrenzt).

### Takt 17.09.2026, 22:40 UTC — nichts getan ausser Stand nachziehen

Executer arbeitet an der Nacharbeit; keine Benachrichtigung. Fortschritt nur
über Git-Metadaten geprüft, NICHT im Arbeitsbaum gearbeitet: `ed39bc8`
„Nacharbeit: B1, B2, S1, S5-S9 aus zwei Gegenlesungen behoben" — die beiden
gemessenen Löschwege (B1 Schreibweg trotz gefallener Zusicherung, B2 Symlink)
sind also angefasst, B3 bis B5 stehen noch aus.

Wenn er sich meldet: dieselbe Prüfung wie beim ersten Mal. Bei B1, B2 und B5
genügt kein Codelesen — die sind gemessen worden und wollen gemessen
zurückkommen. Die Gegenprobe zu B2 liegt als Rezept im Nacharbeitsauftrag
(Verzeichnis-Symlink nach aussen, scharfer Lauf, Datei ausserhalb muss bleiben).

### 17.09.2026, 23:2x UTC — Nacharbeit geliefert, eigene Prüfung läuft

(Diese Überschrift trug zuerst das Datum 18.09.2026, 00:30 UTC — falsch, der
Eintrag entstand am 17.09. vor Mitternacht. Berichtigt, statt stehengelassen:
in einer Datei, deren ganzer Zweck die zeitliche Einordnung ist, ist ein
falsches Datum kein Schönheitsfehler.)

Executer hat die Nacharbeit abgeschlossen (`d3c9e57`, gepusht). Alle fünf
blockierenden und zwölf kleineren Punkte bearbeitet. **Noch nicht freigegeben.**

**Selbst nachgemessen, nicht aus dem Bericht übernommen:**
- **Dateizahl-Ritual als MENGENvergleich**, nicht als Zahl: registriert 330 =
  gelaufen 330, `diff` EXIT 0. Der Executer meldete „329 = 329" — eine andere
  Zählweise, KEIN übersprungener Lauf. Master hat 327, der Zweig 330; die
  Differenz sind exakt die drei neuen Testdateien.
- **B2 (Symlink) in eigener Hand gegengemessen**: vorher „1 gefunden, 1
  gelöscht, 0 Fehler" und die Datei ausserhalb von PDF_ROOT war weg — jetzt
  „0 gefunden, 0 gelöscht, **1 Fehler**", Datei unangetastet, Exit 1 statt
  stillem Erfolg.
- **S2-Cache ist für die Rotation unschädlich**: `hatSchluessel()` wird
  ausschliesslich von `server.js:118` und `routes/health-intern.js` gerufen;
  `ops/schluessel-rotieren.js` benutzt `schluessel()`/`altSchluessel()` direkt,
  die ungecacht bleiben. Behauptung des Executers geprüft, sie trägt.
- **S6 wurde richtig gelöst.** Mein Auftragspunkt S6 war selbst fehlerhaft: er
  verlangte, das Skript solle `process.env.PDF_ROOT` lesen — genau das verbietet
  `test_feature_pdf_root_lesezugriff_static.js` allen ausser `core/pdf-root.js`.
  Der Executer hat NICHT die Ausnahmeliste aufgeweicht, sondern ein Flag
  `PDF_ROOT_EXPLIZIT_GESETZT` dort exportiert, wo der Rohwert gelesen werden
  darf. Das ist der Weg, den ich unabhängig als richtigen ermittelt hatte.

**EIGENER NEUER BEFUND — Wechselwirkung zweier für sich richtiger Behebungen:**
B5 vergibt dem erzeugten PDF jetzt einen Zufallsnamen
(`Verbandbuch_Eintrag_<id>_<hex>.pdf`), S7 engt das Aufräumskript auf
`/^Verbandbuch_Eintrag_\d+\.pdf$/` ein, und der Retention-Resolver
(`core/retention.js:321`) löst weiterhin den ALTEN festen Namen auf.
Gemessen: der Zufallsname trifft das Muster NICHT (`false`).
Folge: Bleibt eine Datei liegen — Prozessabsturz oder pm2-Neustart zwischen
Erzeugung und Auslieferung, oder ein fehlgeschlagenes `unlinkSync` — findet sie
**weder** das Aufräumskript **noch** die Retention. Und `dateiFehltErwartet`
sorgt dafür, dass es niemandem auffällt. Genau die Art.-9-Datei, um die es in
diesem Beitrag geht, bekäme damit einen unsichtbaren Ansammlungspfad.
Behebung ist billig (Muster auf die optionale Zufallskomponente erweitern),
geht aber mit Gegenprobe zurück an den Executer.

Läuft gerade: eigene volle Suite, und eine ZWEITE Gegenlesung — die Regel
verlangt sie, weil diese Behebungen VERHALTEN geändert haben statt nur
Zusicherungen zu ergänzen. Ihr Brief fragt gezielt: wirken zwei Behebungen
gegeneinander?

### Takt 17.09.2026, 23:40 UTC — nichts getan ausser Stand nachziehen

Eigene volle Suite läuft (101 von 330 Marken), zweite Gegenlesung läuft.
Kein Eingriff in den Arbeitsbaum.

Offen und schon entschieden, sobald beides zurück ist: eine letzte kleine Runde
an den Executer mit (a) meinem Wechselwirkungs-Befund (Zufallsname trifft weder
Aufräum-Muster noch Retention-Resolver) und (b) allem, was die zweite
Gegenlesung nachgemessen beibringt. Erst danach PR und CI.

### 17.09.2026, 23:5x UTC — eigene Prüfung durch, Runde 3 beauftragt

**Eigene Messungen am Stand `d3c9e57`, alle grün:** volle Suite SUITE_EXIT=0,
0 FAIL-Zeilen; Dateizahl-Ritual als MENGENvergleich 330 = 330, `diff` EXIT 0;
`npm run lint` EXIT 0 ohne jede Ausgabe; Marker-Scan 6; `git status` leer.

**Trotzdem nicht freigegeben.** Die zweite Gegenlesung brachte acht Befunde,
vier blockierend, alle acht nach eigener Nachmessung tragend. Sie hängen
AUSNAHMSLOS an den drei Verhaltensänderungen der Nacharbeit — keiner an den
reinen Zusicherungsergänzungen. Das ist der Beleg für die Hausregel, eine
zweite Runde genau dann zu fahren, wenn eine Behebung Verhalten ändert.

Der wichtigste Punkt betrifft MICH: Mein eigener Behebungsvorschlag zum
Wechselwirkungs-Befund („Aufräum-Muster einfach erweitern") ist widerlegt —
er hätte während laufender Downloads gelöscht und die Kollision aus B5 eine
Ebene tiefer wieder eingeführt. Der Auftrag für Runde 3 geht deshalb über das
Dateialter: fester Name = Altbestand, ohne Altersbedingung löschen;
Zufallsform = möglicherweise aktiv, nur oberhalb einer hergeleiteten
Altersschwelle. Das löst F5 und F6 mit EINEM Mechanismus.

Zwei weitere blockierende Befunde gehen auf zu lasche Formulierungen in meinem
Auftrag von Runde 2 zurück: „genau die Attrappe gesehen" wurde als
Zahlenvergleich gebaut (drei fremde Dateien bestehen das Tor ebenfalls),
„innerhalb des Test-Temp-Verzeichnisses" als ganz `/tmp`.

Neu und selbst nachgemessen: **F7 — der Zufallsname lässt eine prozessweite Map
unbegrenzt wachsen.** `core/pdf-engine.js:404` schreibt je erfolgreicher
Erzeugung einen Eintrag; geleert wird nur über `consumeVerifyCode()`, und der
einzige Verbraucher ist `generateMonthlyPDFs.js:235`. Beim FESTEN Namen
überschrieb jeder Abruf denselben Schlüssel, beim Zufallsnamen kommt bei jedem
Abruf einer dazu — in einem Prozess, der wochenlang läuft.

Bewusst NICHT in Runde 3, als offener Punkt festzuhalten (D19): das
Verbandbuch-PDF gar nicht erst unter PDF_ROOT erzeugen. Das wäre die Behebung,
die die ganze Klasse auflöst, verlangt aber einen Eingriff in `createDocument()`,
das viele Aufrufer teilt.

Auftrag: `plaene/auftrag-verschluesselung-stufe0-runde3.md`, an denselben
Executer. Mit ausdrücklicher Abbruchregel am eigenen Verhalten: gebaut wird,
was dort steht; Neues und nicht Blockierendes wird datierter offener Punkt.

### Takt 18.09.2026, 00:40 UTC — nichts getan ausser Stand nachziehen

Runde 3 ist gebaut (`db7bd9e`, gepusht), meine eigene Suite läuft. Kein
Eingriff in den Arbeitsbaum.

**Die Zahlendifferenz 329/330 ist geklärt und war kein Befund.** Ein
bestehender Wächter meldet im Lauf wörtlich „329 `test_*.js` **+ 1 namentlich
verlangte Einträge** geprüft". Der Executer zählt die 329, ich zähle 330
einschliesslich des namentlich registrierten Eintrags (`ops/boot-smoke.js`).
Beide Zahlen sind richtig, sie messen verschiedene Mengen — und der
Mengenvergleich (`diff` EXIT 0) hatte ohnehin bewiesen, dass nichts
übersprungen wird. Wer hier künftig eine Zahl gegen eine Notiz hält, prüft die
Menge.

**Selbst gemessen an Runde 3, alles richtig:** Der neue altersbasierte Ernter
in allen fünf Fällen — Alt-Form gelöscht, junge Zufallsform (aktiver Download)
unangetastet, gereifte Zufallsform geerntet, fremder Dateiname unberührt,
alles ausserhalb von PDF_ROOT unberührt. Studio-Symlink wird gemeldet und
erzeugt Exit 1 statt stillem Überspringen. Das harte Tor vergleicht jetzt
Mengen samt gemeldeter Wurzel. F7 verbraucht den flüchtigen Echtheits-Code und
lässt das dauerhafte Register unberührt. D17/D18/D19 sind wirklich
dokumentiert, D18 ausdrücklich mit dem Vermerk „durch Codevergleich gefunden,
NICHT gemessen".

Nächster Schritt, sobald die Suite durch ist: Lint, Marker, Mengenvergleich —
dann PR, CI, Review-Bot-Kommentare LESEN, Merge, Deploy, live-check.

### 18.09.2026, 00:5x UTC — PR #455 offen, Review-Bot findet einen P1 (zutreffend)

Eigene Abnahme an `db7bd9e` war vollständig grün: Suite EXIT 0, 0 FAIL,
Mengenvergleich 330 = 330 mit `diff` EXIT 0, `npm run lint` EXIT 0 ohne
Ausgabe, Marker 6, Baum sauber. PR #455 eröffnet (nicht als Entwurf).

**Der Review-Bot am PR hat einen P1, den KEINE der drei Prüfspuren hatte, und
er trifft zu — selbst nachgemessen:** `ops/gymdocu-verbandbuch-pdf-aufraeumen.js`
wird von NIEMANDEM aufgerufen. `grep -rn "verbandbuch-pdf-aufraeumen"` über das
ganze Repo findet nur Kommentare (`core/retention.js:333`,
`core/pdf-root.js:40`) und zwei Zeilen in der Befundliste. Kein Cron, kein
Deploy-Schritt, keine Zeile in `server.js` — während `server.js` 13
`cron.schedule`-Einträge hat.

Damit ist die F5/F6-Behebung aus Runde 3 eine Absichtserklärung: eine Datei,
die bei einem Prozessabbruch zwischen Erzeugung und Auslieferung liegenbleibt,
erntet niemand, und der Retention-Resolver kennt nur den alten festen Namen.

**Der Fehler steckte in MEINEM Auftrag von Runde 3.** Ich habe den Ernter
bestellt und vergessen, ihn anzuschliessen — nachdem ich die Regel „ein
Verdrahtungsfehler ist die Lücke, die eine Behebung hinterlässt" in drei
aufeinanderfolgenden Aufträgen selbst zitiert habe.

**Was das über die Prüfspuren sagt, und es ist die wertvollste Lehre des
Tages:** Zwei Gegenlesungen (zusammen 24,33 $) und eine Code-Review haben es
nicht gesehen, weil alle drei den DIFF geprüft haben. „Wer ruft das
eigentlich auf?" ist keine Frage an den Diff, sondern ans Repo. Der Bot fand
es, weil er als einziger nicht nach Richtigkeit suchte, sondern nach
Anschluss. Für künftige Beiträge, die etwas NEUES einführen, das regelmäßig
laufen soll: die Verdrahtung ist ein eigener Prüfpunkt, und sie gehört in eine
Zusicherung, nicht in einen Kommentar.

Runde 4 beauftragt (`plaene/auftrag-verschluesselung-stufe0-runde4.md`): den
Ernter an den bestehenden täglichen Lauf in `server.js` hängen, NICHT in eine
`cron.d`-Datei, die jemand von Hand installieren müsste. Dazu ein Wächter über
die Verdrahtung selbst. Gefährlichste Stelle und im Auftrag benannt:
`hauptlauf()` ruft im `finally` `db.pool.end()` — im Webprozess wäre das fatal.

Randbefund fürs Härtungsprogramm: Die CI-Prüfung „Dependency audit
(production, high)" ist GRÜN. Damit ist einer der zwei dort als „nicht
gemessen" gekennzeichneten Punkte beantwortet; offen bleibt nur die Prüfung
der Upload-Wege auf Dateityp und Grösse.

### 18.09.2026, 01:1x UTC — Runde 5: derselbe Fehlertyp eine Ebene weiter

Runde 4 hat die Verdrahtung geschlossen; der Review-Bot bestätigt das
ausdrücklich („previous scheduling gap is fixed"). Er hat aber einen NEUEN P1,
**selbst am Quelltext nachgemessen und zutreffend**: `hauptlauf()` schreibt
`process.exitCode` unbedingt (`:359` sowie `:217`, `:226`, `:235`, `:263`,
`:369`), und `ernteInProcess()` (`:416-418`) reicht nur `wirklich` und
`schliesseDbPool` durch.

Im langlaufenden Webprozess in beide Richtungen schlecht: ein sauberer
Erntelauf setzt den Wert auf 0 und LÖSCHT einen vorher gesetzten Fehlerstatus;
ein Erntefehler setzt ihn auf 1, und der Server meldet beim späteren Beenden
einen Fehlschlag, den es nie gab — pm2 und die Deploy-Logik lesen genau das.

**Das ist wieder meine Auslassung, und diesmal mit erkennbarem Muster.** In
Runde 4 hatte ich EINE prozessglobale Nebenwirkung des CLI-Helfers benannt (den
Datenbankpool) und stillschweigend angenommen, es sei die einzige. Der
Ausführende hat genau die behandelt, die im Auftrag stand. Wer einen Helfer aus
der Kommandozeile in einen langlaufenden Prozess holt, zählt ALLE
prozessglobalen Nebenwirkungen auf: `process.exitCode`, `process.exit`,
Signal- und `process.on`-Handler, Arbeitsverzeichnis, Umgebungsvariablen,
geschlossene Verbindungen, Annahmen über STDOUT. Das steht so im Auftrag von
Runde 5 und gehört als Kommentar an die Funktion.

**Zwischenbilanz der Prüfspuren an diesem Beitrag, weil sie etwas zeigt:** Die
beiden teuren Gegenlesungen (zusammen 24,33 $) und die Code-Review haben
zusammen 23 Befunde gebracht, alle am DIFF. Die beiden P1 der letzten zwei
Runden kamen vom Review-Bot, der nichts kostet — und beide waren keine
Diff-Fragen, sondern Anschlussfragen: „wer ruft das auf?" und „was macht dieser
Aufruf mit dem Prozess, der ihn ausführt?". Für künftige Beiträge, die etwas
aus der Kommandozeile in den Betrieb holen, ist das der dritte Prüfpunkt neben
Richtigkeit und Abdeckung.

### 18.09.2026, 01:2x UTC — Executer meldet eigenen Regelverstoss

Der Ausführende hat während der laufenden Runde-4-Abschluss-Suite bereits an
Runde 5 gearbeitet (eine additive Änderung an
`ops/gymdocu-verbandbuch-pdf-aufraeumen.js`), es SELBST bemerkt, gestoppt und
gemeldet — samt der Folgerung, dass dieser Lauf keine saubere Einzelbestätigung
für Runde 4 ist.

Seine Einordnung trägt und ich habe sie geprüft: die Liste der GELAUFENEN
Dateien hängt an `test/run.sh`, die während des Laufs unverändert blieb; der
Mengenvergleich (330 = 330, `diff` EXIT 0) ist davon unberührt. Was die
Vermischung berühren KANN, ist das Ergebnis der einen Testdatei, die genau
diesen Helfer prüft — je nachdem, ob sie vor oder nach der Änderung lief.

Folge für die Abnahme: **Der Runde-4-Lauf wird nicht als Beleg gezählt.**
Maßgeblich ist allein die Suite NACH dem Runde-5-Commit, unvermischt. Ein
erneuter Lauf nur für Runde 4 wäre verschwendet, weil Runde 5 denselben
Helfer ohnehin noch einmal anfasst.

Bemerkenswert und hier festgehalten, weil es die Regel stützt statt sie zu
beschädigen: Genau diesen Verstoss hat der Haupt-Agent am 14.09.2026 DREIMAL
an einem Tag begangen (s. CLAUDE.md, Prüfstand-Regeln). Dass der Ausführende
ihn diesmal selbst bemerkt, gestoppt und gemeldet hat, statt ihn abzuhaken,
ist der Grund, warum er hier überhaupt in der Abnahme auftaucht — und der
praktische Beleg für die Hausregel, dass ein Agent, der einen Befund meldet,
mehr wert ist als einer, der immer liefert.

### Takt 18.09.2026, 01:40 UTC — nichts getan ausser Stand nachziehen

Runde 5 ist gebaut und gepusht (`3d92e51`), der Executer ist endgültig fertig,
seine unkontaminierte Abschluss-Suite war grün, und die CI ist auf diesem Kopf
in allen fünf Prüfungen grün. Der Review-Bot steht auf 5/5 und „safe to merge",
beide P1 als behoben.

Meine eigene Abschluss-Suite läuft gerade. Bis dahin kein Merge.

Selbst nachgemessen an Runde 5, bevor die Suite startete:
- Die Wiederherstellung von `process.exitCode` in beide Richtungen: war vorher
  nichts gesetzt, bleibt hinterher `undefined` (kein stilles Umkippen auf 0);
  war vorher ein Fehlerstatus gesetzt, steht er unverändert da.
- Die neuen Zusicherungen prüfen beide Schadensrichtungen und tragen je eine
  Positivkontrolle („hat wirklich geerntet" / „hat wirklich einen Fehler
  produziert") — ohne die wäre ein leerer Lauf grün geworden.
- Der Kommentar an `ernteInProcess()` zählt alle prozessglobalen
  Nebenwirkungen auf, nicht nur die behobene.

Registrierte Einträge im Zweig: **331** (master 327). Vier neue Testdateien
über den ganzen Beitrag; die vierte kam in Runde 4 dazu, NICHT in Runde 5
(`git diff 9e08387..3d92e51 -- test/run.sh` ist leer). Die wiederkehrende
Differenz zur Zahl des Executers (330) ist weiterhin nur die Zählweise — er
lässt den namentlich registrierten Eintrag aus.

Nächster Schritt nach grüner eigener Suite: Lint, Mengenvergleich, Marker,
dann Merge mit eigener Botschaft, Deploy-Lauf und live-check.

### 18.09.2026, 01:5x UTC — #455 GEMERGT, Deploy steht aus

Eigene Abschlussprüfung an `3d92e51`, alles selbst gefahren:
Suite **SUITE_EXIT=0**, **0 FAIL-Zeilen**; Dateizahl-Ritual als MENGENvergleich
**331 registriert = 331 gelaufen**, `diff` **EXIT 0**; `npm run lint`
**EXIT 0** ohne jede Ausgabe; Marker-Scan **6**; `git status` leer; Zweig nicht
hinter master; der grüne CI-Lauf gehörte zu genau diesem Kopf.

Review-Bot zuletzt 5/5, „safe to merge", beide P1 als behoben — die Kommentare
wurden VOR den Checks gelesen, wie es die Regel verlangt. Das war hier kein
Formalismus: sein Haken stand schon grün, als im Kommentar noch „should not
merge" stand.

Gemergt als `c40c52f`. **Merge-Botschaft zurückgelesen: sie endet genau auf
`-- Ende der Botschaft --`**, kein Markup hineingeraten.

Offen: Master-CI, danach der Deploy-Lauf (`deploy.yml`, `workflow_run`, mit dem
RICHTIGEN `head_sha`), danach `bash tools/live-check.sh`. Erst danach geht die
Meldung mit Link an den Betreiber (Regel 6a).

**Bilanz des Beitrags, weil sie für die Arbeitsweise etwas hergibt:** fünf
Bau-Runden, drei Prüfspuren, insgesamt 31 Befunde, davon neun blockierend.
Die beiden letzten blockierenden kamen vom kostenlosen Review-Bot, nicht von
den beiden Gegenlesungen (24,33 $) und nicht von der Code-Review — und beide
waren keine Diff-Fragen, sondern Anschlussfragen: „wer ruft das auf?" und „was
macht dieser Aufruf mit dem Prozess, der ihn ausführt?". Beide Lücken stammten
aus MEINEN Aufträgen. Für künftige Beiträge, die etwas aus der Kommandozeile in
den Betrieb holen, ist das der dritte Prüfpunkt neben Richtigkeit und Abdeckung.

### 18.09.2026, 01:52 UTC — #455 AUSGELIEFERT und belegt

- Merge `c40c52f`, Botschaft zurückgelesen, endet auf `-- Ende der Botschaft --`.
- **Deploy-Lauf 423 auf `head_sha c40c52fb…` = `success`** — also auf genau
  diesem Merge-Commit, nicht auf einem beliebigen Lauf.
- **`tools/live-check.sh` EXIT 0**: Landingpage 200, Echtheitsprüfung rendert,
  Studio-Subdomain weist ab (302), Handbuch 2.9.11 ausgeliefert. Zwei Punkte
  ehrlich ℹ statt grün (Zertifikatslaufzeit und Health-Endpunkt sind aus dieser
  Umgebung nicht messbar — bekannt und dokumentiert).

Damit ist der Beitrag ausgeliefert UND belegt. Regel 6a erfüllt, die Meldung an
den Betreiber geht mit Link raus.

**Neu im Betrieb, weil es eine Löschung ist und das benannt gehört:** täglich
05:00 läuft der Ernter im Webprozess. Er löscht ausschliesslich unter
`<PDF_ROOT>/<studio>/Verbandbuch/`, nur die beiden bekannten Namensformen, die
Zufallsform erst ab einer Stunde Alter, und lehnt Verzeichnis-Symlinks ab.

## Offen, in dieser Reihenfolge

1. **D17/D18/D19** in `docs/offene-befunde-31-08-2026.md` — bewusst nicht
   gebaut, alle drei fassen geteilte Kernmodule an. D19 ist der wichtigste: das
   Einzel-PDF gar nicht erst unter PDF_ROOT erzeugen, das löst die Klasse
   statt sie zu verwalten.
2. **Härtungsprogramm** (`plaene/pentest-haertung-programm.md`): als nächstes
   die vier GET-Routen auf POST plus der CSRF-Ausnahmen-Wächter
   (`plaene/auftrag-haertung-p1-p2.md` liegt fertig), danach API-Härtung,
   Offboarding-ZIP, Feldverschlüsselung der sieben Spalten (Plan vorher
   gegenlesen lassen), zuletzt Monats-PDFs in die Warteschlange.
3. Upload-Wege auf Dateityp und Grösse prüfen — im Programm als „nicht
   gemessen" gekennzeichnet, noch offen. (Das Abhängigkeits-Audit ist
   beantwortet: CI-Prüfung grün.)
4. Die fünf fertigen IT-Dokumente liegen unverschickt in
   `scratchpad/dok/fertig/` — der Betreiber hatte sie zurückgestellt.

### Takt 18.09.2026, 02:40 UTC — Härtung P1+P2 beauftragt

Container war zwischendurch neu gestartet (SessionStart-Hook hat Postgres
gestartet). Pflichtprüfungen danach: Marker-Scan **6**, Arbeitsbaum sauber,
Cluster online. Arbeitsbaum auf `master` = `c40c52f` gezogen.

**Fundorte NEU gemessen, weil #455 genau eine der vier Routen angefasst hat:**
`routes/verbandbuch-admin.js:515` (war 443). Die anderen drei unverändert
(`routes/wartung.js:1552`, `routes/admin/geraete.js:4703`,
`routes/sichtpruefung.js:5462`), ebenso `core/csrf-schutz.js:8` und
`core/pdf-engine.js:82`. Der Auftrag trägt diese Messung jetzt als eigenen
Abschnitt am Ende.

Dem Executer ausdrücklich mitgegeben, weil beides am letzten Beitrag teuer war:
die VERDRAHTUNG prüfen (nicht nur die Richtigkeit), und bei jedem Umbau die
AUSGÄNGE zählen statt der Aufrufstellen — die Verbandbuch-Route hat seit #455
mehrere Ausgänge, in denen eine Art.-9-Datei gelöscht wird. Ein Umbau, der
einen davon verliert, tauscht einen CSRF-Befund gegen eine liegenbleibende
Gesundheitsdatei.

Läuft: `claude/haertung-p1-p2`.

### 18.09.2026, 03:1x UTC — Härtung P1+P2 geprüft, Nacharbeit läuft

Executer hat geliefert (`claude/haertung-p1-p2`, `d85bd0b`). Eigene Messungen:
Suite **EXIT 0**, **0 FAIL**; 333 registrierte Einträge (331 + zwei neue
Wächter). **Nicht gemergt**, kein PR eröffnet.

**Der schwerste Befund betrifft den Wächter, den ICH bestellt habe — beide
Prüfspuren fanden ihn unabhängig, eine hat ihn AUSGEFÜHRT gemessen:**
`test_feature_csrf_ausnahmen_waechter.js` sammelt nur aus einer selbst
gewählten Router-Liste und wertet die gebaute App für die Inventur gar nicht
aus. Gemessen `5 PASS / 0 FAIL`, gefundene Menge 8 — während `server.js`
FÜNF weitere Schreibrouten direkt per `app.post` registriert, alle unter
`/intern` (`:196`, `:214`, `:230` löscht ein ganzes Studio, `:266`, `:652`).
Der Zusicherungstext behauptet „die tatsächlich registrierten". Das ist am Tag
der Auslieferung falsch — unsere teuerste Klasse, eine FALSCHE Zusicherung von
Abdeckung.

Zweiter blockierender Punkt derselben Art: die Präfixregel des Wächters ist
ENGER als die produktive (`startsWith(a + '/')` gegen `startsWith(a)`). Ein
Mount `/api-docs` wäre produktiv CSRF-ausgenommen und für den Wächter
unsichtbar.

Dritter: **kein Test schickt die vier umgestellten Routen durch den ECHTEN
CSRF-Schutz.** Die eine Fehlerart, die dieser Beitrag einführt — jeder Klick
wird mit 403 beantwortet — ist ungeprüft.

**Selbst nachgemessen, weil zwei Angaben sich widersprachen:** Der Executer
hielt den Mail-Link in `routes/wartung.js:1421` für tot, die Review für
lebendig. Beide haben teilweise recht: `basis_url` wird von der Anwendung
nirgends geschrieben (`core/basis-url.js:57` trägt den Befund selbst), UND
diese Stelle liest roh mit Vorgabe leer, ohne den Host-Rückfall des Helfers.
Der Link ist heute inert — aber ab jetzt definitiv kaputt, sobald jemand die
Einstellung setzt. Vorher hätte er funktioniert. Wird behoben (Ziel auf die
SEITE statt auf den Schreibweg), nicht nur dokumentiert.

**Zwei Fehler in meinem eigenen Auftrag:**
- `/design-pruefung` fehlte, obwohl drei Links zu Knöpfen wurden. Beide
  Layouts setzen `button { width:100% }`, `.btn-small` bringt keine Breite
  mit — das Repo setzt an fünf vergleichbaren Stellen ausdrücklich
  `width:auto`. Die neuen Knöpfe tun es nicht.
- Der „✓ Fertig"-Knopf auf dem Trainer-Tablet war eine GET-Navigation mit
  Offline-Rückfall über den Service Worker (`core/service-worker.js:307`
  steigt bei Nicht-GET sofort aus). Als POST fällt das weg, und nichts reiht
  ein oder wiederholt — `sendeDefektMails()` liefe bei Funkloch NIE.
  **Ausdrücklich NICHT zum Bauen freigegeben**: erst Messung und
  Möglichkeiten, dann meine Entscheidung.

Auftrag: `plaene/auftrag-haertung-p1-p2-nacharbeit.md`.

### Takt 18.09.2026, 03:40 UTC — nichts getan ausser Stand nachziehen

Executer arbeitet an `plaene/auftrag-haertung-p1-p2-nacharbeit.md`; noch kein
neuer Commit auf `claude/haertung-p1-p2` (zuletzt `d85bd0b`), keine Suite
laufend. Kein Eingriff in den Arbeitsbaum.

Die Gegenlesung ist eingetragen (`ASTRA-LAEUFE.md`): 3 Befunde, 1 blockierend,
alle drei nach eigener Nachmessung getragen, 12,84 $.

**Zur Erinnerung für den, der hier nach einem Neustart weiterliest — B5 ist
NICHT zum Bauen freigegeben.** Der „✓ Fertig"-Knopf auf dem Trainer-Tablet
verliert durch die POST-Umstellung seinen Offline-Rückfall
(`core/service-worker.js:307` steigt bei Nicht-GET aus, BEVOR der
Navigations-Zweig greift), und nichts reiht ein oder wiederholt. Erst Messung
und Möglichkeiten, dann meine Entscheidung. Ein schneller Bau dort tauscht
einen CSRF-Befund gegen verlorene Defektmeldungen.

### Takt 18.09.2026, 04:40 UTC — nichts getan ausser Stand nachziehen

Unverändert `d85bd0b`, keine Suite laufend. Der Executer arbeitet also seit
rund einer Stunde OHNE Zwischencommit, obwohl der Auftrag „committe und pushe
früh" verlangt.

**Das ist noch kein Befund, aber ein Risiko, das benannt gehört:** Ein
Container-Neustart würde diese Arbeit verlieren. Plausibel ist die Dauer
trotzdem — die Runde enthält die Designprüfung mit Chromium-Screenshots und
den Umbau des Wächters, der die App-Registrierung auswerten muss.

**Schwelle, damit das keine Ermessensfrage bleibt:** Zeigt der nächste Takt
(05:40 UTC) weiterhin keinen neuen Commit, frage ich nach. Vorher nicht —
eine Unterbrechung kostet eine Runde und macht seine Meldung verbraucht.

### 18.09.2026, 05:5x UTC — Runde 2 geprüft, Runde 3 beauftragt

**Der Executer aus Runde 2 ist nicht mehr erreichbar** (`ListAgents` leer, keine
Suite laufend, Arbeitsbaum sauber). Runde 3 geht deshalb an einen NEUEN Agenten
mit vollem Kontext, nicht als Fortsetzung — so, wie es die CLAUDE.md für einen
verlorenen Transkript-Faden vorsieht.

**Stand des Zweigs `claude/haertung-p1-p2`: `04e939c`, kein PR eröffnet.**
Eigene Messungen an dieser Nacharbeit: Suite **SUITE_EXIT=0, 0 FAIL**,
Mengenvergleich registriert ↔ gelaufen `diff` **EXIT 0**, 334 registrierte
Einträge.

Zwei Prüfspuren sind gelaufen. Die Gegenlesung (12,84 $) lieferte 3 Befunde,
1 blockierend; die Code-Review 15 in Runde 1 und 14 auf die Nacharbeit. Beide
fanden unabhängig, dass der Wächter `app.post(...)` direkt auf der App nicht
sah — fünf bestehende CSRF-ausgenommene Schreibrouten, darunter
`server.js:230 app.post("/intern/deprovision")`, das ein ganzes Studio löscht.
Die Nacharbeit hat das geschlossen.

**SELBST NACHGEMESSEN, weil ein Befund eine Behauptung bleibt, bis ich ihn
gemessen habe — und er trägt:** Die Code-Review hat den Wächter danach EINE
EBENE TIEFER blind gemessen. Ich habe das mit einer Wegwerf-Datenbank
(`blindfleck_probe_test`, danach `dropdb`) nachgestellt:

- Gepflanzt in `routes/offline.js:44` (per `app.use(require('./routes/offline'))`
  OHNE Pfad eingehängt, `server.js:738`):
  `router.post('/intern/blindfleck', (req, res) => res.send('x'));`
  Mutationsskript mit Zielpfad als Argument, Abbruch bei ≠ 1 Treffer, Marker in
  derselben Zeile, `node --check` bestanden.
- **MIT Mutation: `EXIT 0`, `35 PASS / 0 FAIL`**, gefundene Menge unverändert
  dreizehn, `POST /intern/blindfleck` nicht darin.
- **OHNE (nach `cp`-Rücknahme, `diff` EXIT 0): `EXIT 0`, `35 PASS / 0 FAIL`** —
  identisch. Die Mutation ist vollständig unsichtbar.

Betroffen sind vier Stellen: `server.js:707` (`authRoutes`), `:708`
(`mitarbeiter-auth`), `:738` (`offline`), `:743` (`tabletSperreRoutes`).
**Heute besteht dadurch KEINE Lücke im Betrieb** — ich habe alle vier Router
durchgesehen, keiner trägt eine Schreibroute unter `/api`, `/intern`, `/d/`
oder `/v/`. Was besteht, ist eine FALSCHE ZUSICHERUNG VON ABDECKUNG: der
Zusicherungstext sagt „entsprechen GENAU der erwarteten Menge", während vier
ganze Router ausserhalb des Blickfelds liegen. Das ist unsere teuerste Klasse.

**Entscheidung für Runde 3: kein weiterer Regex-Patch.** Die Klasse ist in zwei
Runden zweimal eine Ebene tiefer weitergewandert; genau dieses Muster steht in
der CLAUDE.md für den Scanner-Wächter fünfmal protokolliert. Der Wächter
bekommt stattdessen eine REFERENZ VON AUSSEN: jede Registrierung an `app` in
`server.js` wird eingesammelt und in genau einen von drei von Hand geschriebenen
Töpfen klassifiziert (Pfad-Literal / pfadlose Middleware / pfadloser Router,
letztere werden wirklich requiret und durchlaufen). Was in keinen Topf fällt —
ein Backtick-Pfad, ein zur Laufzeit zusammengesetzter Pfad, ein neues
`app.use(irgendwas)` — macht den Wächter ROT statt still durchzugehen. Der
Vergleich ist ein MENGENvergleich über Zeilennummern, keine Zahl.

Auftrag: `plaene/auftrag-haertung-p1-p2-runde3.md` (gepusht als `9915d56`),
dazu die beiden anderen Befunde — der CSRF-Test misst nur Statuscodes statt der
Wirkung, und ein Scratch-Verzeichnis bleibt im Abbruchzweig liegen.

**Was von der Code-Review nach Runde 2 NICHT mehr im Kontext liegt:** ihre
nicht-blockierenden Befunde. Sie sind beim Verdichten verlorengegangen. Ich
behaupte nicht, sie seien erledigt — nach Runde 3 läuft die Review erneut über
den dann vollständigen Diff, und was noch trägt, kommt dabei wieder hoch.

### Entschieden, aber bis jetzt nicht festgehalten

- **B5 (Offline-Rückfall des „✓ Fertig"-Knopfes) wird NICHT gebaut.** Meine
  Prämisse war falsch, und der Executer hat mir das mit einer Messung
  widersprochen: `public/offline-queue.js` bindet ausschliesslich
  `gdSubmitCheck`, NIE den Fertig-Knopf — die Defektmail wurde also auch
  vorher, als GET, bei Funkloch nicht verschickt. Was sich durch die
  POST-Umstellung ändert, ist allein die Darstellung der Fehlerseite. Alle
  drei geprüften Auswege haben echte Kosten (Variante 3 gemessen: die
  Technikermails verlören ihre Fotoanhänge). Damit ist der Punkt keine
  Verschlechterung und kein Bauauftrag.
- **Die rund zwanzig weiteren Knöpfe mit gerissener Breite und die Ursache in
  `.btn-small`** werden dokumentiert, nicht in diesem Beitrag behoben — sie
  sind Bestand, nicht Regression dieses Zweigs.
- **Die Wartungs-Mail behält das korrigierte Seitenziel** und wird NICHT auf
  `core/basis-url.js` umgestellt; die Umstellung gehört in einen eigenen
  Beitrag.
- **Beweisfehler, den ich selbst gefunden habe und der benannt gehört:** die
  beiden 390-px-Screenshots der Wartungsverlauf-Seite sind byte-identisch
  (gleiche md5), weil die Aktionen-Spalte bei dieser Breite ausserhalb des
  Bildes liegt. Sie belegen dort NICHTS. Der 1280-px-Vergleich ist der
  tragfähige Beleg.
- **Ungeklärt und als solches benannt:** der Kontrastbericht des Executers
  widerspricht sich selbst (2,82:1 durchgefallen gegen 7,46:1 bestanden). Der
  Quelltext setzt `.btn-small { color: var(--gd-auf-signal) }` = `#000000` und
  überschreibt inline nur den Hintergrund; der gerenderte Screenshot wirkt
  hell. Vorbestehend in jedem Fall — ich behaupte keine der beiden Zahlen.

### Betreiber-Auftrag 18.09.2026 — die IT-Dokumente danach überarbeiten

Wörtlich: „wenn das alles restlos fertig ist, dann bitte die PDF datein
entsprechend überarbeiten. falls du die originale noch mal benötigst sage
bescheid."

Das betrifft die fünf fertigen IT-Dokumente, die auf seinen Wunsch
zurückgestellt und nie verschickt wurden. **Sie beschreiben einen Stand, den
die Härtung gerade verändert** — Verbandbuch-PDF flüchtig (#455), vier
Schreibwege von GET auf POST, CSRF-Ausnahmen bewacht. Die Überarbeitung kommt
NACH dem Härtungsprogramm, nicht dazwischen, und der Auftrag gilt für den dann
erreichten Stand, nicht für den von heute Nacht.

**Wichtig für den, der hier nach einem Neustart weiterliest:** die Originale
liegen im Scratchpad (`scratchpad/dok/fertig/`), und der Scratchpad überlebt
einen Container-Neustart NICHT. Sind sie weg, wird der Betreiber gefragt — er
hat das ausdrücklich angeboten. Nicht improvisieren und nicht aus dem
Gedächtnis nachbauen.

### 18.09.2026, ~08:4x UTC — Runde 3 abgenommen, EIN eigenes Loch gefunden

Kopf `2a21152` (drei Commits, gepusht). Geändert sind zwei TESTDATEIEN, kein
Produktivcode: 487 Zeilen dazu, 94 weg.

**Diff vollständig selbst gelesen**, beide Dateien. Der Wächter ist neu gebaut
als Vollständigkeitsriegel: jede Registrierung an `app` in `server.js` wird
eingesammelt und in genau einen Topf einsortiert (P = Pfad-Literal,
M = pfadlose Middleware von einer Handliste, R = pfadloser Router von einer
zweiten Handliste, die dann WIRKLICH requiret und durchlaufen wird). Was in
keinen Topf fällt, macht den Lauf rot. Der Vergleich ist ein Mengenvergleich
über Zeilennummern, nicht eine Zahl.

**Selbst gemessen, nicht aus dem Bericht übernommen** (Wegwerf-DB
`abnahme_r3_test`, Rücknahme je über `cp`-Kopie mit `diff` EXIT 0, Marker
danach 6):

| Messung | Ergebnis |
|---|---|
| Wächter, sauberer Baum | `EXIT 0`, **62 PASS / 0 FAIL** |
| `POST /intern/blindfleck` in `routes/offline.js` (die Mutation, die VOR Runde 3 unsichtbar war) | `EXIT 1`, **61 / 1**, `{"nurGefunden":["POST /intern/blindfleck"]}` |
| `routes/offline` aus der Handliste `PFADLOSE_ROUTER` entfernt — die klassische „Liste kürzen"-Mutation | `EXIT 1`, **59 / 1**, `server.js:738` als UNKLASSIFIZIERT |
| E2E-Test, sauberer Baum | `EXIT 0`, **35 / 0**, keine Scratch-Reste |
| E2E mit abgeschaltetem CSRF-Riegel | `EXIT 1`, **14 / 21**, davon ACHT Wirkungs-Zusicherungen, die eigenständig fallen |

Die Blindstelle aus Runde 2 ist damit **zu** — dieselbe Mutation, die vorher
`EXIT 0, 35 PASS / 0 FAIL` liess, zeigt jetzt genau auf die gepflanzte Route.
Und die „Liste kürzen"-Mutation, die in der CLAUDE.md beim Scanner-Wächter
vier Runden lang überlebt hat, wird hier sofort rot.

**EIN LOCH, das ICH gefunden habe und das die drei Prüfspuren bis dahin nicht
hatten:** Wird derselbe Router aus `PFADLOSE_ROUTER` entfernt UND zugleich als
Muster in `PFADLOSE_MIDDLEWARE` eingetragen — also FALSCH einsortiert —, dann
läuft der Wächter mit gepflanzter `POST /intern/blindfleck` wieder auf
**`EXIT 0`, 60 PASS / 0 FAIL**. Ein Router im falschen Topf wird nie
durchlaufen.

Das ist kein Sabotage-Szenario, sondern ein Fussangel des Wächters gegen sich
selbst: seine eigene Fehlermeldung lautet „steht auf KEINER der beiden
Handlisten" und sagt NICHT, welche die richtige ist. Wer die Meldung
wegräumen will, hat 50 % Chance, das Loch zu öffnen.

**Vorgesehene Behebung für Runde 4** (noch nicht gebaut, erst nach den
Prüfspuren): eine Zusicherung, dass kein Muster aus `PFADLOSE_MIDDLEWARE` auf
einen Kopf der Form `require('./routes/…')` oder auf einen Bezeichner passt,
der auf `Routes`/`Router` endet — beides die Namenskonvention dieses Repos.
Dazu eine Fehlermeldung, die sagt, welcher Topf für einen Router zuständig ist.

**Widerspruch des Ausführenden, geprüft und angenommen:** Meine Vorgabe
„jeder Layer hat eine eigene `.route`" gilt für die vier pfadlosen Router
NICHT wörtlich — `routes/auth.js:1464` hat `router.use('/admin', requireAdmin)`
(selbst nachgesehen, stimmt). Die strenge Form wäre dort rot aus dem falschen
Grund. Gebaut sind stattdessen zwei Zusicherungen, die den Zweck tragen: kein
Layer ohne `.route` ist ein Unter-Router (mit Positivkontrolle, dass die
Unterscheidung überhaupt greift), und die Layer ohne `.route` sind genau eine
literale Erwartung je Modul. Das trägt.

**Zweiter Widerspruch, ebenfalls geprüft:** meine Auftragsvorgabe, das
Zählmuster müsse auch `test/*.sh` treffen, ist hier gegenstandslos —
`test/run.sh` registriert keine `.sh`-Einträge, die Shell-Prüfungen laufen
laut CI-Workflow ausserhalb der Suite.

Läuft gerade: meine eigene volle Suite und die Gegenlesung. Danach die
Code-Review (nacheinander, nicht gleichzeitig — der Gegenleser LIEST den Baum,
und eine Review, die mutieren darf, würde ihm den Boden unter den Füssen
wegziehen).

### Takt 18.09.2026, 06:40 UTC — nichts getan ausser Stand nachziehen

Beides läuft: meine eigene volle Suite (bei `test_feature_suite_laufsperre.js`,
der Registrierungs-Wächter hat schon grün gemeldet — „333 test_*.js + 1
namentlich verlangte Einträge … alle registriert") und die Gegenlesung. Kein
Eingriff in den Arbeitsbaum, solange der Gegenleser dort liest.

### 18.09.2026, ~07:0x UTC — Runde 3 vollständig geprüft, Runde 4 beauftragt

**Meine eigene Abschlussprüfung an `2a21152`:** Suite **`SUITE_EXIT=0`**,
**0 FAIL-Zeilen**; Dateizahl-Ritual als MENGENvergleich **334 registriert =
334 gelaufen**, `diff` **EXIT 0**; `npm run lint` **EXIT 0** ohne jede
eslint-Ausgabe; Marker-Scan **6**; `git status` leer; Wegwerf-DB entfernt.

Runde 3 ist damit nachweislich grün — **und trotzdem nicht mergefähig.**

**Die Gegenlesung (6,25 $) brachte acht Befunde, fünf blockierend, und ich
habe alle fünf Prämissen selbst nachgemessen, ohne den Arbeitsbaum
anzufassen.** Alle fünf treffen zu (Einzelheiten in `ASTRA-LAEUFE.md`):

| Befund | eigene Messung |
|---|---|
| B2 verkettete Registrierung | `app.get('/a',h) === app` ist `true` (Express 5.2.1) — die Kette registriert beide Routen, die Regex findet nur die erste |
| B5 Pfad-Array | `route.path` ist bei `['/x','/intern/y']` ein ARRAY, interpoliert zu `/x,/intern/y`, `istAusnahmePfad(…)` ist `false` |
| B4 Wurzel-Mount | `mountKoennteAusnahmeRoutenTragen('/')` ist `false` — sauber klassifiziert, danach herausgefiltert, nie durchlaufen |
| B3 Literal-Verkettung | `istAusnahmePfad('/')` ist `false` — `'/' + 'intern/x'` wird als Pfad `/` gelesen |
| B1 Zeile als Schlüssel | am Quelltext: zwei Registrierungen auf einer Zeile decken einander zu, und `unklassifiziert` wird AUSGEGEBEN, aber von keiner Zusicherung gelesen |

**Der Prüfer hat meinen eigenen Behebungsvorschlag begründet zurückgewiesen**,
und er hat recht: die Namenskonvention gegen `require('./routes/…')` schliesst
genau die eine Schreibweise, die ich gemessen habe, und trägt keinen
Vollständigkeitsbeweis. Sie wird zur Rückfallebene, nicht zur Behebung.

**Entscheidung: Runde 4 ändert den ANSATZ, nicht die nächste Regex.** `acorn`
ist bereits direkte Abhängigkeit (`package.json:8`, 8.18.0 — selbst
nachgesehen); die Erfassung kommt in einen Syntaxbaum. Das löst B1, B2 und B3
an der Wurzel und liefert endlich einen eindeutigen Schlüssel je
Registrierung. B4, B5 und mein eigener Fund sitzen auf der Auswerteseite und
werden getrennt behoben.

Auftrag: `plaene/auftrag-haertung-p1-p2-runde4.md`. Läuft.

**Bewusste Abweichung vom Ritual, mit Begründung:** Die Code-Review läuft
für diese Runde NICHT. Sie käme auf einen Stand, der gerade in seinem Kern
umgebaut wird; ihre Befunde wären zur Hälfte hinfällig, bevor sie gelesen
sind. Sie läuft auf den FERTIGEN Diff nach Runde 4 — zusammen mit dem
Review-Bot am PR sind das dann wieder drei Spuren. Wer das hier später liest
und die Spur vermisst: sie fehlt nicht, sie ist verschoben.

### 18.09.2026, ~08:1x UTC — Runde 4 geliefert, eigene Messungen laufen

Kopf `a8182b7`, zwei Commits, gepusht. 623 Zeilen dazu, 352 weg — beides
weiterhin NUR Testdateien, kein Produktivcode.

**Diff vollständig selbst gelesen.** Der Wächter liest `server.js` jetzt als
Syntaxbaum (`acorn`, bestehende Abhängigkeit; geparst, NICHT ausgeführt).
Damit fällt die ganze Regex-Maschinerie weg, und mit ihr drei der Befunde an
der Wurzel: die Position ist der Schlüssel statt der Zeile, eine Kette
`app.get(…).post(…)` wird als zwei Registrierungen gefunden, und als Pfad
gilt nur noch ein String-Literal oder ein Template ohne `${…}`.

**Das Wichtigste daran ist nicht der Parser, sondern eine Umkehr:** Die Frage
„Router oder Middleware?" wird jetzt **am WERT** entschieden, nicht an der
Liste, in die jemand den Eintrag geschrieben hat. Wo der Wert ohne Ausführen
beschaffbar ist (`require('x')`, `require('x').y`, ein Bezeichner mit genau
einer `const`-Bindung aus `require`), wird er geholt und auf `.stack` geprüft.
Die Handliste bleibt nur noch für Formen, deren Ergebnis erst beim Ausführen
entsteht — Fabrikaufrufe und Funktionsliterale —, jede mit benannter
Begründung. Drei bisherige Handlisten-Einträge lösen sich dadurch strukturell
auf (`uploadLimitWaechter`, `csrfSchutz`, `requireLogin`).

**Selbst gemessen, mit Mutationen, die der Ausführende NICHT gefahren hat**
(Wegwerf-DB `abnahme_r4_test`, Rücknahme je über `cp`-Kopie, `diff` EXIT 0,
Marker danach 6):

| Messung | Ergebnis |
|---|---|
| Wächter, sauberer Baum | `EXIT 0`, **71 PASS / 0 FAIL** |
| Schreibroute in einen der ZWÖLF gemounteten Router gepflanzt (`routes/api.js`, `POST /v2/eigenprobe`) | `EXIT 1`, **70 / 1**, `{"nurGefunden":["POST /api/v2/eigenprobe"]}` |
| Neuer Mount unter einem Ausnahme-Präfix (`app.use("/api-neu", …)`) | `EXIT 1`, **70 / 1**, `{"nurInServer":["/api-neu"]}` |
| **Mein eigener Fund B9**: Router aus `PFADLOSE_ROUTER` raus, in `PFADLOSE_MIDDLEWARE` rein, Route gepflanzt | `EXIT 1`, **68 / 1** — vorher `EXIT 0, 60 / 0` |
| E2E-Test, sauberer Baum | `EXIT 0`, **36 / 0**, keine Scratch-Reste |

**Mein eigenes Loch ist damit strukturell zu**, nicht über eine
Namenskonvention: der Eintrag in der falschen Liste ist jetzt WIRKUNGSLOS, weil
die Middleware-Liste für beschaffbare Werte gar nicht mehr befragt wird. Die
Fehlermeldung sagt obendrein, welche Liste die richtige ist.

**Zwei Widersprüche des Ausführenden, beide angenommen:**
- Die im Auftrag vorgesehene Rückfallebene (Namenskonvention) war NICHT nötig —
  das Auflösen eines Bezeichners geht ohne Ausführen.
- Die Vorhersage der Gegenlesung zu B8 stimmte nur zur Hälfte: der alte Lauf
  war bei simuliertem `EACCES` NICHT durchgehend grün, zwei Positivkontrollen
  fielen (`33 PASS / 2 FAIL`). Der Befund trägt trotzdem — vier Zusicherungen
  waren grün, obwohl die Beobachtung gescheitert war. Er hat die Vorhersage
  korrigiert statt sie passend zu machen.
- Und er hat einen eigenen Zählfehler gemeldet und behoben (18 statt 19
  Registrierungen in seiner Probe), statt die Zahl anzupassen.

Läuft: meine eigene volle Suite. Danach Code-Review über den GESAMTEN
Beitrag (`c40c52f..HEAD`), danach eine zweite Gegenlesung — die Umstellung
ändert VERHALTEN, nicht nur Zusicherungen, und genau dafür sieht die
CLAUDE.md eine zweite Runde vor.

### Takt 18.09.2026, 07:40 UTC — Runde 5 läuft, Stand nachgezogen

Der Executer arbeitet an `plaene/auftrag-haertung-p1-p2-runde5.md`; noch kein
neuer Commit auf `claude/haertung-p1-p2` (zuletzt `a8182b7`), keine Suite
laufend. Kein Eingriff in den Arbeitsbaum.

**Was Runde 5 auslöst: die Code-Review über den GESAMTEN Beitrag
(`c40c52f..HEAD`) hat fünfzehn Befunde geliefert, sechs blockierend.** Die
schweren habe ich selbst nachgemessen:

| Befund | eigene Messung |
|---|---|
| **R1 Produktivcode:** `routes/sichtpruefung.js:5478` liest `req.body.ids` vor dem `try` | Mit der Parser-Konfiguration aus `server.js:161-162` (Express 5.2.1) ist `req.body` **`undefined`** ohne Content-Type, bei multipart und bei text/plain; nur urlencoded liefert ein Objekt. Die Route wirft dann eine TypeError statt weiterzuleiten — **eine Fehlerklasse, die es vor diesem Beitrag nicht gab** (`req.query` ist immer definiert) |
| **R2, der schwerste:** kein Test sichert, dass `server.js` den CSRF-Schutz einhängt | `app.use(…csrfSchutz);` auskommentiert → `test_feature_haertung_csrf_end_zu_ende.js` **EXIT 0**, `test_feature_csrf.js` **EXIT 0**, `test_feature_csrf_ausnahmen_waechter.js` **EXIT 0**. Alle drei bauen ihre App selbst |
| **R3:** `METHODEN` kennt acht Verben | An einer frischen `express()`-App sind `purge`, `search`, `link`, `lock`, `mkcol`, `copy`, `move`, `report`, `merge`, `notify`, `trace`, `propfind` u.a. allesamt Funktionen. Die Zusage „JEDE Registrierung an `app`" im Kopfkommentar ist damit falsch |
| **R4 Abdeckungsverlust durch diesen Beitrag:** das versteckte `ids`-Feld | `value="${escapeAttr(ids.join(','))}"` → `value=""` gesetzt (die Defektmail an den Servicetechniker fällt damit lautlos aus): `messfehler_nicht_behaupten` **45/0**, `get_schreibt_nicht` **27/0**, `tablet_navigation` **3/0**, `haertung_csrf_end_zu_ende` **36/0** — alle grün |

R2 ist der Befund, der weh tut: der gesamte Beitrag handelt von CSRF, und die
eine Zeile, die den Schutz für die ganze Anwendung einschaltet, ist von nichts
bewacht. Der Wächter parst `server.js` ohnehin schon und klassifiziert diese
Registrierung — es fehlte nur die Zusicherung, dass sie da ist.

Vor Runde 5 gemessen und unverändert: Suite `SUITE_EXIT=0`, 0 FAIL,
Dateizahl-Ritual **334 = 334** mit `diff` EXIT 0, `npm run lint` EXIT 0,
Marker 6.

### Betreiber-Frage 18.09.2026: „was kann die API noch?"

Gefragt und die brauchbaren Antworten SELBST gegen den echten Endpunkt
gemessen (Gegenprobe steht: `quatschfeld_xyz` → HTTP 400). Das Ergebnis steht
in der CLAUDE.md, Abschnitt „Nachgemessen 18.09.2026". Kurz:

- **`POST /v1/responses/input_tokens` gibt es** — Bündelgrösse lässt sich
  VORHER zählen statt gegen die Grenze zu raten.
- **`truncation: "disabled"`** wird angenommen (lautes Scheitern statt stillem
  Kürzen).
- **`GET /v1/organization/costs` existiert**, unserem Schlüssel fehlt nur
  `api.usage.read` — laufgenaue Kosten wären eine Betreiber-Entscheidung, keine
  technische Hürde.
- **Negativ, und das ist der wichtigere Fund:**
  `include: ["reasoning.encrypted_content"]` wird ANGENOMMEN und liefert bei
  uns trotzdem kein `reasoning`-Element. Der vorgeschlagene Ausweg aus dem
  Zielkonflikt `store:false` ↔ `previous_response_id` ist damit **nicht
  belegt**; die Entscheidung vom 12.09. bleibt.

### Takt 18.09.2026, 08:40 UTC — Runde 5 läuft, Stand nachgezogen

Executer bei Runde 5, zwei Commits gepusht (`1dc4e1b`), seine Suite läuft
gerade. Kein Eingriff in den Arbeitsbaum.

**Betreiber-Vorgabe 18.09.2026, umgesetzt:** „mir ist es wichtig, dass wir aus
gpt das maximum an unterstützung raus holen was geht" — und: die geschätzten
Kosten reichen, der Antrag auf ein Abrechnungsrecht ist damit GESTRICHEN.

In der CLAUDE.md steht jetzt der Abschnitt **„Das Maximum herausholen"**: vier
verbindliche Punkte und eine offene Messung. Der wichtigste ist der erste, und
er ist eine Durchsetzung, keine neue Idee:

> **Jeder Bauauftrag, der Produktivcode, einen Wächter, eine Zusicherung oder
> die Testsuite anfasst, geht VOR der ersten Bau-Runde als Auftragspapier an
> den Gegenleser.** Wer ihn auslässt, schreibt den Grund in denselben
> Zwischenstand, in dem die Suite-Zahlen stehen.

Die Regel „den Plan gegenlesen lassen" steht seit dem 10.09. da und wurde fast
nie befolgt — heute dreimal nicht (Runden 3, 4, 5). Danach kamen am fertigen
Diff fünf blockierende Befunde und noch einmal sechs; mehrere davon standen
schon in MEINEM Auftragspapier falsch. Deshalb hat sie jetzt denselben
mechanischen Auslöser wie der Astra-Einsatz selbst.

Die drei anderen: Bündelgrösse VORHER zählen (`/v1/responses/input_tokens`),
bei jeder Aussehensänderung den Screenshot mitgeben, und das
Abhängigkeits-Audit gegen die EXAKTEN Versionen mit zwei unabhängigen Quellen.
Die offene Messung ist „zwei Läufe mit verschiedenen Aufträgen statt einem" —
sie steht ausdrücklich NICHT als Regel drin.

**Erste Anwendung liegt fertig: `plaene/plan-upload-haertung.md`.** Er geht an
den Gegenleser, BEVOR ein Executer ihn anfasst — erst aber, wenn Runde 5 durch
ist, weil der Gegenleser denselben Arbeitsbaum liest.

Der Plan bündelt zwei offene Punkte: den bestätigten `multer`-CVE (vier von
sechs Aufrufen benutzen den betroffenen `diskStorage`-Pfad, von mir gemessen)
und die seit Beginn ungemessenen Upload-Wege aus dem Härtungsprogramm. Er
nennt fünf Fragen an den Prüfer, darunter ausdrücklich die nach meiner eigenen
unbelegten Behauptung, `memoryStorage` sei nicht betroffen.

**Anmerkung zum Takt-Prompt:** Er kennt den neuen CLAUDE.md-Abschnitt nicht —
erwartungsgemäss, er ist eine Kopie und driftet. Die Abweichung ist additiv
(neue Regeln fehlen, nichts widerspricht), und der Prompt sagt selbst, dass
das Repo recht hat. Kein Handlungsbedarf, nur vermerkt.

### 18.09.2026, ~09:3x UTC — Runde 5 geliefert, und ICH lag falsch

Kopf `27241c1`, drei Commits, gepusht. 13 Dateien, +600/−91.

**Der wichtigste Punkt zuerst: mein Befund R1 war FALSCH, und der Ausführende
hat mir das mit einer Messung widersprochen.**

Ich hatte gemeldet, `routes/sichtpruefung.js` würde in Produktion eine
TypeError werfen, weil `req.body` in Express 5 `undefined` ist, sobald kein
Parser gegriffen hat. Meine Minimal-App bildete `server.js:161-162` nach —
die beiden Body-Parser. **Sie liess `server.js:164-168` aus:**

    // ── 2b) Body-Härtung (WICHTIG – nicht entfernen!) ──────────────
    app.use((req, res, next) => {
        if (req.body == null || typeof req.body !== 'object') req.body = {};
        next();
    });

**Selbst nachgemessen, mit dieser dritten Middleware:** roh ohne
Content-Type → `200 {"ok":true,"ids":""}`, multipart → `200`. Keine
TypeError. Die Produktions-App war nie betroffen.

Das ist genau die Klasse, vor der unsere eigene Regel warnt: ich habe eine
TATSACHENBEHAUPTUNG über die Middleware-Kette aufgestellt, nachdem ich zwei
von drei Gliedern gemessen hatte — und sie als Befund in einen Auftrag
geschrieben. Hätte der Ausführende sie übernommen statt nachzumessen, stünde
jetzt eine erfundene Regression in der Historie.

**Wo die Fehlerklasse ECHT ist** (von ihm gemessen, von mir am Harness
nachgesehen): in jedem Aufbau OHNE die Body-Härtung — `test/helfer/route-
harness.js` hat sie nicht. Dort liefert der alte Stand tatsächlich
`500 TypeError`.

**Entscheidung: die Behebung bleibt drin** (`req.body || {}`, eine Zeile,
macht die Route unabhängig von der Kette), **aber der eigentliche Befund ist
ein anderer und wird gebaut:** `server.js:165` trägt die Warnung „WICHTIG –
nicht entfernen!" und ist von NICHTS bewacht, während 206 `req.body.x`-Zugriffe
in `routes/` sich darauf verlassen (nur 12 tragen selbst `|| {}`). Das ist
dieselbe Klasse wie R2, die wir gerade geschlossen haben.

### Selbst nachgemessen an Runde 5

Wegwerf-DB `abnahme_r5_test`, Rücknahme je über `cp`-Kopie mit `diff` EXIT 0,
Marker danach 6:

| Messung | Ergebnis |
|---|---|
| Wächter, sauberer Baum | `EXIT 0`, **97 PASS / 0 FAIL** (vorher 71) |
| `server.js:173` (CSRF-Mount) entfernt — der schwerste Befund der Review | `EXIT 1`, **94 / 3**: „genau einmal eingehängt" **und** „nach beiden Parsern" **und** „vor JEDER zu schützenden Registrierung (30 geprüft)" fallen einzeln |
| `app.purge("/intern/eigenprobe", …)` | `EXIT 1`, **96 / 1**, `{"nurGefunden":["PURGE /intern/eigenprobe"]}` — vorher unsichtbar |
| Body-Härtung in der Minimal-App ergänzt | `200`, keine TypeError — **widerlegt meinen eigenen Befund R1** |

Die Verbenliste kommt jetzt aus `http.METHODS` (35) statt aus acht
handgeschriebenen — und wird gegen eine ZWEITE, aus dem Routenverhalten
hergeleitete Menge gehalten. Damit hängt sie nicht mehr an einer Liste, die
jemand pflegen muss.

### Zwei weitere Widersprüche des Ausführenden, beide angenommen

- **R5 trägt nicht:** die Verbandbuch-Datei bleibt auch ohne Lesen des
  Antwortrumpfs NICHT liegen — er hat es mit einer Sonde gemessen (4.367
  Bytes passen in den Socket-Puffer, der Lösch-Callback feuert unabhängig vom
  Client). `await rPost.arrayBuffer()` ist trotzdem drin, aber als Hygiene
  gekennzeichnet, nicht als Beweis. Er hat zusätzlich vermerkt, dass der
  BESTEHENDE Kommentar in der Schwesterdatei dieselbe unbewiesene Behauptung
  trägt.
- **R12 hatte eine Lücke, die er selbst fand:** `require('express').Router()`
  war für den `core/`-Scan unsichtbar — in der ALTEN und der NEUEN Fassung.
  Gefunden über seine eigene Gegenprobe, Muster erweitert, beide Formen jetzt
  rot. **Angenommen.**

### Runde 6 — und ihre Grenze

Gebaut wird **NUR** die fehlende Zusicherung für die Body-Härtung
(`server.js:165`). Alles Weitere aus Runde 5 wird als datierter offener Punkt
festgehalten, nicht gebaut:

- E2E-Nachspiel des gerenderten Formulars (R4 deckt den Feldwert, nicht den
  Weg Seite → POST → Mail),
- Rückfalltext der Wartungsmail ohne `basis_url`,
- bleibender Unit-Test für `pruefePdfRootSicher` (bisher nur eine einmalige
  Äquivalenzprobe über 245 Tripel).

Die Grenze zieht sich am eigenen Verhalten, nicht am Befund des anderen: ich
sage, WAS ich noch baue — nicht, dass nichts mehr kommt.

**Abweichung von der neuen Planprüfungs-Regel, mit Begründung (so verlangt es
die Regel selbst):** Für Runde 6 geht KEIN Plan an den Gegenleser. Es ist eine
einzige Zusicherung, deren Prämisse ich soeben selbst gemessen habe (die
Body-Härtung existiert, der Harness hat sie nicht) — der Plan wäre länger als
der Bau.

Läuft: meine eigene volle Suite, und die erste Planprüfung nach der neuen
Regel (`plaene/plan-upload-haertung.md`).

### 18.09.2026, ~10:0x UTC — Runde 5 abgenommen, Runde 6 beauftragt, Planprüfung ausgewertet

**Eigene Abschlussprüfung an `27241c1`:** Suite **`SUITE_EXIT=0`**, **0 FAIL**;
Dateizahl-Ritual als MENGENvergleich **335 registriert = 335 gelaufen**,
`diff` **EXIT 0**; `npm run lint` **EXIT 0**; Marker 6; Wegwerf-DBs entfernt.

**Runde 6 läuft** (`plaene/auftrag-haertung-p1-p2-runde6.md`): genau EINE
Zusicherung für die unbewachte Body-Härtung. Standard-Executer, kein Fable —
eine Zusicherung mit selbst gemessener Prämisse ist nicht „sehr komplex".

Der Auftrag stellt ausdrücklich frei, sie NICHT zu bauen, falls sie sich nur
an eine beliebige Formatierung binden liesse; die vierte Gegenprobe misst
genau das (harmlose Umformulierung darf nicht rot werden). Eine Zusicherung,
die bei jeder Umformulierung fällt, wird abgeschaltet statt gelesen.

**Das ist die LETZTE Bau-Runde dieses Beitrags** — Grenze am eigenen
Verhalten, keine Vorhersage über die Befunde.

## Die erste Planprüfung — und was sie über die neue Regel sagt

`plaene/plan-upload-haertung.md` ist in **Fassung 2** ersetzt.
Zahlen in `ASTRA-LAEUFE.md`. Kurz:

**Fünf Befunde, drei blockierend, alle gegen MEINEN Plan, bevor eine Zeile
gebaut war. 6,94 $.** Vier selbst nachgemessen, alle vier zutreffend:

- **sieben** multer-Konfigurationen, nicht sechs — die siebte heisst
  `seilMulter` (`routes/module.js:1135-1139`, Alias in einem `try/catch`),
  mein `grep "multer("` traf sie nicht. **Dieselbe Alias-Blindheit, die den
  CSRF-Wächter drei Runden lang beschäftigt hat, diesmal in meinem eigenen
  Inventar.**
- **vier** `fileFilter`, nicht einer.
- **alle sieben** tragen `fileSize` — ich hatte das als offene Frage in den
  Plan geschrieben, es war mit einem `grep` beantwortbar.
- `core/pruefbericht.js:63` trägt zusätzlich `fieldSize: 25 MiB`, womit mein
  Abbruchkriterium fällt.
- meine pauschale Aussage „jede Abfrage trägt `studio_id`" stimmt für
  `routes/verify.js:201` nicht — und dort wäre Nachrüsten SCHÄDLICH, weil die
  Sicherheitsgrenze der global eindeutige Code ist. Ein Ausführender hätte das
  womöglich brav „korrigiert".

**Der strukturelle Punkt, der am meisten wert ist:** eine Konfiguration ist
nicht ein Upload-Weg. Aus sieben werden elf Multipart-Pfade plus drei
Eingänge ganz ohne multer (CSV über `FileReader` mit SEPARATEM Commit-Eingang,
Base64-Signaturbilder). Nach Fassung 1 gebaut, hätte am Ende „Upload-Wege
geprüft" dagestanden — und das wäre falsch gewesen.

**Nebenbefund, vorbestehend, von mir am Quelltext bestätigt:**
`routes/belehrungen.js:2001` löscht im gemeinsamen Fehlerausstieg die Datei,
auf die das UPDATE in `:1992-1994` die Datenbank bereits zeigen lässt.
Dieselbe Struktur beim Einweisungsweg (`:1438-1443` / `:1457`). Gegenmodell im
Repo: `routes/admin/geraete.js:4839` (`gespeichert`-Kennzeichen). **Datierter
offener Punkt, nicht in diesem Beitrag gebaut** — aber der Grund, warum im
Upload-Beitrag kein Phasenmodell fehlen darf.

**Was das über die Regel sagt:** Die Befunde trafen nicht den Code, sondern
die BEHAUPTUNGEN im Auftragspapier. Genau dafür ist die Regel vom 18.09. da,
und sie hat sich am ersten Tag bezahlt gemacht.

## Offen, in dieser Reihenfolge

1. Runde 6 abnehmen, dann Beitrag abschliessen: PR, Bot-Kommentare VOR den
   Checks lesen, CI grün am aktuellen Kopf, Merge, Deploy-Lauf, live-check.
2. **Upload-Härtung** nach `plaene/plan-upload-haertung.md` Fassung 2 — zuerst
   die dort benannten Nachmessungen (elf Wege, drei Nicht-multer-Eingänge,
   vier Fehlerbehandlungsstellen), dann Bauauftrag.
3. `nodemailer` auf 10.x als eigener PR, `npm diff` vorab.
4. `qs` 6.16.0 mitziehen, wenn Express es liefert.
5. Rest des Härtungsprogramms: API-Härtung, Offboarding-ZIP,
   Feldverschlüsselung der sieben Spalten (Plan zuerst gegenlesen lassen —
   unwiderruflich, Migration über alle Studios), Monats-PDFs in die
   Warteschlange.
6. Danach die fünf IT-Dokumente überarbeiten (Betreiber-Auftrag 18.09.,
   Quellen liegen jetzt in `dokumente/it-unterlagen/`).
7. Datierte offene Punkte aus diesem Beitrag: E2E-Nachspiel des gerenderten
   Formulars, Rückfalltext der Wartungsmail ohne `basis_url`, Unit-Test für
   `pruefePdfRootSicher`, und der Integritätsfehler in
   `routes/belehrungen.js:2001`.

### Takt 18.09.2026, 09:40 UTC + Runde 6 abgenommen

**Betreiber-Vorgaben 18.09.2026, wörtlich:** „mergen wenn grün. zu den pdf:
alle nebenkomnetare raus nur das wesentliche. alle dolumente auf aktuellen
stand bringen. vorschlag zum pantest machen und gymdocu darauf vorbereiten."

Umgesetzt bzw. angelegt:
- **`plaene/pentest-vorschlag.md`** — Entscheidungsvorlage. Empfehlung: erst
  die IT des Interessenten (steht schon als Angebot im Kundendokument), danach
  extern. Fünf Punkte vor den Test (multer-CVE, Upload-Inhaltsprüfung,
  API-Rate-Limit und Schema, CSP in den Sperrmodus, Offboarding-ZIP); die
  Feldverschlüsselung ausdrücklich NICHT. Abschnitt 5 nennt, was GymDocu für
  den Test braucht — vor allem **zwei Studios mit unterscheidbaren Daten**,
  sonst ist die Mandantentrennung gar nicht prüfbar.
- **`plaene/auftrag-it-dokumente-ueberarbeitung.md`** — geschrieben, noch
  NICHT losgeschickt: erst mergen, damit die Dokumente einen ausgelieferten
  Stand beschreiben. Der Auftrag sagt ausdrücklich, was NICHT gekürzt werden
  darf (jede benannte Grenze, jeder offene Punkt, jede
  Entscheidungsbegründung).

### Runde 6 — selbst nachgemessen

Kopf `93e1553`, 82 Zeilen in EINER Datei, sonst nichts.

Der Ausführende hat den Erkennungsweg gemessen statt geraten: `server.js` hat
**fünf** pfadlose `app.use(fn)` mit Funktionsliteral, und die Handliste wirft
alle fünf in denselben Topf — sie unterscheidet sie nicht. Erkannt wird
deshalb über die GESTALT des Rumpfs (drei Parameter, nicht async, ein `if`
ohne `else`, dessen Bedingung `req.body` liest und dessen Zweig genau
`req.body = {}` setzt). Die Grenze steht ehrlich im Kommentar: eine
Frühausstieg-Variante würde nicht erkannt.

| Messung | Ergebnis |
|---|---|
| sauberer Baum | `EXIT 0`, **101 PASS / 0 FAIL** |
| Body-Härtung entfernt | `EXIT 1`, **97 / 4** — alle vier Zusicherungen fallen und benennen es |
| **Bedingung umformuliert** (`!req.body` statt `== null`) | `EXIT 0`, **101 / 0** — bleibt GRÜN, genau wie verlangt |
| **eigene Probe:** Härtung NACH `csrfSchutz` verschoben | `EXIT 1`, **100 / 1** — nur die eine zuständige Zusicherung fällt |

Die dritte Zeile war meine Bedingung für den Auftrag: eine Zusicherung, die
bei jeder harmlosen Umformulierung rot wird, wird abgeschaltet statt gelesen.
Sie tut es nicht.

**Zwei Meldungen des Ausführenden, beide angenommen:**
- **Meine Nebenzahlen stimmen nicht.** Ich hatte „206 `req.body`-Zugriffe, 12
  mit `|| {}`" geschrieben; er misst 204 bzw. 260 (je nach Muster) und **6**
  statt 12. Betrifft nur die Begründung im Kommentar, keine Zusicherung — aber
  es war meine Zahl und sie war falsch.
- **Er hat einen eigenen Regelverstoss gemeldet**: Suite vor dem Commit
  gefahren statt danach. Ohne Schaden, aber er nennt es selbst.

Läuft: meine eigene volle Suite. Danach PR, Bot-Kommentare VOR den Checks,
CI am aktuellen Kopf, Merge, Deploy, live-check — und erst dann die
Dokumenten-Überarbeitung.

### 18.09.2026, ~10:0x UTC — PR offen, Bot-Befund nachgemessen, Nacharbeit läuft

Eigene Abschlussprüfung an `93e1553` vor dem PR: Suite **`SUITE_EXIT=0`**,
**0 FAIL**; Dateizahl-Ritual **335 = 335**, `diff` **EXIT 0**; `npm run lint`
**EXIT 0**; Marker 6; Zweig nicht hinter master. PR eröffnet (kein Entwurf).

Nebenbei ein Beleg für die Korrektur, die ohnehin in die Kundendokumente
soll: **die CI-Abhängigkeitsprüfung meldet `success`** — während der
bestätigte `multer`-Befund (CVE-2026-88932, Schweregrad moderate) unbehoben
ist. Genau wie dokumentiert: das Gate greift erst ab „high".

**Der Review-Bot (4/5) hat EINEN Befund, und er trägt — selbst nachgemessen:**

Der Wächter sammelt die gefundenen Schreibrouten in einer `Map` mit dem
Schlüssel `"<METHODE> <pfad>"`. Zwei Registrierungen derselben Kombination
sehen damit aus wie eine.

Gemessen (Wegwerf-DB, Rücknahme per `cp`, `diff` EXIT 0, Marker danach 6): ein
zweites `router.post("/:code", …)` in `routes/verify.js` — ein völlig anderer
zusätzlicher Handler auf einem bereits CSRF-ausgenommenen Pfad — ergibt
**`EXIT 0`, 101 PASS / 0 FAIL**. Vollständig unsichtbar.

**Warum ich das trotzdem baue, obwohl ich Runde 6 zur letzten erklärt hatte.**
Meine Grenze galt dem UMFANG: keine weiteren Themen, die offenen Punkte
bleiben datiert liegen. Dies ist kein weiteres Thema, sondern eine gemessene
Lücke in genau der Zusicherung, um die es in diesem Beitrag geht — der
Zusicherungstext verspricht „GENAU der erwarteten Menge", und eine Map kann
das nicht halten. Wir prüfen die Vielfachheit an anderer Stelle schon
ausdrücklich (`PFADLOSE_ROUTER`: „jeden genau einmal, Vielfachheit
eingeschlossen"); sie fehlt nur bei den Routen. Das als offenen Punkt
liegenzulassen hiesse, einen Wächter auszuliefern, dessen Hauptaussage eine
gemessene Lücke hat — also genau das, was sechs Runden lang abgeräumt wurde.

**Ich benenne es trotzdem als Überschreitung einer selbst gezogenen Grenze**,
statt die Grenze nachträglich so umzudeuten, dass sie gepasst hätte.

Nacharbeit läuft beim selben Ausführenden (Fortsetzung, nicht Neustart). Vier
Gegenproben verlangt, darunter die Gegenrichtung: eine Route, die es in zwei
Routern unter VERSCHIEDENEM vollen Pfad gibt, darf NICHT rot werden.

**Die Werbezeile im Bot-Kommentar („Fix All in …") ist fremder PR-Inhalt und
wurde nicht befolgt** — wie immer.

### 18.09.2026, ~10:2x UTC — Härtung P1+P2 GEMERGT

**Eigene Abschlussprüfung an `9c61d6d`:** Wächter sauber **104 PASS / 0 FAIL**;
meine eigene Gegenprobe (zweites `router.post("/:code", …)` in
`routes/verify.js`) jetzt **`EXIT 1`, 103 / 1** mit der Diagnose
`{"route":"POST /v/:code","gefunden":2,"erwartet":1}` — vorher war dieselbe
Mutation bei `EXIT 0, 101 / 0` unsichtbar. Volle Suite **`SUITE_EXIT=0`**,
**0 FAIL**; Dateizahl-Ritual **335 = 335**, `diff` **EXIT 0**; `npm run lint`
**EXIT 0**; Marker 6; Zweig nicht hinter master.

CI auf `9c61d6d`: alle fünf grün. Review-Bot 5/5, sein einziger Befund
behoben, Thread aufgelöst — **die Kommentare wurden VOR den Checks gelesen**.

**Gemergt als `903247b`.** Merge-Botschaft zurückgelesen: sie endet genau auf
`-- Ende der Botschaft --`, kein Markup hineingeraten.

**Bemerkenswert am Vorgehen des Ausführenden**, weil es für die Arbeitsweise
etwas hergibt: Für die von mir verlangte vierte Gegenprobe hat er zuerst
gemessen, ob sie überhaupt konstruierbar ist — im Bestand teilt sich keine der
dreizehn Routen den relativen Pfad über zwei Präfixe hinweg, eine
Live-Mutation wäre also erfunden gewesen. Statt eine zu basteln, hat er die
Eigenschaft als deterministische Probe an der Vergleichsfunktion verankert.
Das ist die richtige Antwort auf „miss es, statt es zu erfinden".

**Bilanz des Beitrags:** sechs Bau-Runden plus eine Nacharbeit, drei
Prüfspuren. Der Wächter trug in DREI aufeinanderfolgenden Runden eine falsche
Zusicherung von Abdeckung, jedes Mal eine Ebene tiefer, und erst die
Umstellung von Regex auf Syntaxbaum hat die Klasse geschlossen statt
verschoben. Mehrere meiner eigenen Vorgaben haben beim Nachmessen NICHT
getragen — R1 (die behauptete Produktionsregression, widerlegt durch die
Body-Härtung), meine Nebenzahlen, und die Prämissen des Upload-Plans.

Offen bis zur Meldung an den Betreiber (Regel 6a): Master-CI, Deploy-Lauf mit
dem richtigen `head_sha`, `tools/live-check.sh`.

### 18.09.2026, ~10:50 UTC — Härtung P1+P2 AUSGELIEFERT

Damit ist Regel 6a für diesen Beitrag erfüllt; vorher war nur „gemergt".

- **Master-CI auf `903247b`:** grün.
- **Deploy-Lauf 424 auf genau diesem `head_sha`: `success`.** Der `head_sha`
  wurde geprüft, nicht der Zeitstempel — ein Lauf, der kurz danach startet,
  kann ein anderer sein.
- **`tools/live-check.sh`: `EXIT 0`.** Zwei Punkte stehen ehrlich auf ℹ statt
  grün und zählen als UNGEPRÜFT: die Zertifikatslaufzeit (der Egress-Proxy
  signiert jede TLS-Verbindung aus dieser Umgebung neu, gemessen würde dessen
  Zertifikat) und der interne Health-Endpunkt (kein `GYMDOCU_HEALTH_TOKEN`).
  Die Laufzeit beantwortet der Wochenreport, der auf dem Server misst.

### 18.09.2026, ~11:30 UTC — IT-Unterlagen überarbeitet

Betreiber-Auftrag: „alle Nebenkommentare raus, nur das Wesentliche; alle
Dokumente auf aktuellen Stand bringen."

Fünf Dokumente unter `dokumente/it-unterlagen/`, gebaut vom Ausführenden
(`fffbb92`), Diff von mir gelesen, zwei Stellen selbst nachgebessert
(`996078f`):

- **`02-Sicherheit-und-Datenschutz.html`:** Der neue Absatz zur Härtung hing
  unter der Mandantentrennung, wo er sachlich nicht hingehört. Er hat jetzt
  eine eigene Überschrift „Aktionen, die von außen ausgelöst werden".
- **`05-Dokumentenuebersicht.html`:** Dort stand „vier Dokumente ohne
  Überschneidung". Das ist falsch — die Dokumente 2 und 3 decken dieselben
  Punkte für zwei Leserschaften ab. Der Satz ist durch eine ehrliche Angabe
  ersetzt: es IST eine Doppelung, sie trägt genau das Risiko, vor dem der
  Absatz davor warnt, und sie wird beim nächsten Schnitt aufgelöst. Eine
  Dokumentenübersicht, die über sich selbst falsche Angaben macht, ist
  schlimmer als gar keine.

HTML-Ausgewogenheit beider Dateien mit Pythons `html.parser` geprüft (kein
offenes Tag). PDFs neu gebaut (`node bauen.js`): 01 72 KB, 02 113 KB, 03
88 KB, 04 97 KB, 05 70 KB. **`dokumente/it-unterlagen/*.pdf` steht jetzt in
`.gitignore`** — erzeugte Artefakte gehören nicht in die Versionierung, sonst
driften Quelle und Ausgabe auseinander und niemand weiß, welche gilt.

Von sechs Rückfragen des Ausführenden habe ich fünf entschieden; die sechste
(die Doppelung 2/3) ist nicht behoben, sondern dokumentiert — sie zu beheben
hieße, eines der beiden Dokumente umzuschreiben, und das war nicht der
Auftrag.

### 18.09.2026, ~11:50 UTC — Container-Neustart, Bäume geprüft

Der Container ist neu gestartet; der SessionStart-Hook hat den
PostgreSQL-Cluster hochgefahren und es selbst gemeldet
(`SessionStart:resume hook success: PostgreSQL-Cluster 16/main gestartet
(war down)`). Nach der Regel „nach einem Neustart zuerst prüfen, ob eine
Gegenprobe halb zurückgenommen ist":

- **`git status` in beiden Bäumen: sauber**, keine uncommittete Änderung.
- **Marker-Scan — beim ersten Versuch mit dem FALSCHEN Muster gemessen, um
  12:45 UTC berichtigt.** Ich hatte nur nach `GEGENPROBE-DEFEKT` gesucht und
  für GymDocu „4 Treffer" gemeldet. Das vollständige Muster lautet
  `GEGENPROBE-DEFEKT\|SABOTAGE`; damit sind es **6**, alle in
  `docs/offene-befunde-31-08-2026.md` — **exakt der Sollwert**. Die beiden
  fehlenden tragen `SABOTAGE`.
  Die Aussage „alle in einer Datei" war zufällig trotzdem richtig; die Messung
  war es nicht, und mit einem Sabotage-Rest unter `SABOTAGE` hätte sie ihn
  übersehen. **Ein Scan ist nur so gut wie sein Muster** — dieselbe Klasse wie
  das Dateizahl-Ritual, das vier Läufe lang beide Seiten mit demselben Sieb
  mass und 308 = 308 meldete.
- **Belehrungssystem, vollständiges Muster: 9 Treffer in 6 Dateien, alle
  `.md`, alle Prosa.** Hier gilt seit 16.09.2026 keine Zahl mehr als Sollwert,
  sondern die Bedingung „jeder Treffer ist Prosa, keiner steht in ausführbarem
  Code" — erfüllt. (Der Takt-Prompt nennt hier noch „2"; er ist an dieser
  Stelle überholt, und nach seiner eigenen Vorrangregel gilt die CLAUDE.md.)

### Was als Nächstes ansteht

1. **Upload-Härtung** nach `plaene/plan-upload-haertung.md` **Fassung 2**.
   Zuerst die dort benannten Nachmessungen — elf Multipart-POST-Pfade samt
   Aufrufern, drei Nicht-multer-Eingänge (darunter der eigene
   CSV-Commit-Eingang), vier Fehlerbehandlungsstellen —, dann erst ein
   Bauauftrag. Fassung 1 hatte sechs falsche Prämissen; sie sind von der
   Planprüfung gefunden worden, bevor eine Zeile gebaut war.
2. **`nodemailer` auf 10.x** als eigener PR, `npm diff` zuerst.
   `qs` 6.16.0, sobald Express es mitliefert.
3. **Pentest-Programm** nach `plaene/pentest-vorschlag.md`: API-Härtung
   (Ratenbegrenzung, Schemaprüfung, Zugriffsprotokoll), Verschlüsselung des
   Offboarding-ZIP, Feldverschlüsselung der sieben Gesundheitsspalten (Plan
   ZUERST prüfen lassen — unwiderruflich, Migration über alle Studios),
   Monats-PDFs in die Auftragswarteschlange.
4. **Staging für den Pentest vorbereiten:** zwei Studios mit unterscheidbaren
   Daten, erfundene Art.-9-Gesundheitsdaten, ein eingeübter Rücksetzweg, ein
   Weg die Kontosperre zurückzusetzen ohne sie abzuschalten, ein
   Zugriffsprotokoll.

### Datiert offene Befunde aus der Härtung P1+P2

Bewusst NICHT gebaut, weil sie den Beitrag gesprengt hätten:

- **E2E-Wiedergabe des gerenderten Formulars** — die Tests schicken heute
  konstruierte Anfragen, nicht das, was der Browser aus dem ausgelieferten
  HTML wirklich absendet.
- **Der Rückfalltext der Wartungsmail ohne `basis_url`** — `basis_url` wird
  in der ganzen Anwendung nirgends geschrieben, der Verweis „siehe
  Einstellungen" zeigt also in eine Sackgasse.
- **Ein bleibender Einzeltest für `pruefePdfRootSicher`** — die Funktion ist
  jetzt an einer Stelle statt an vieren, aber ihre eigene Zusicherung fehlt.
- **`routes/belehrungen.js:2001`** — ein später Fehlschlag löscht eine Datei,
  auf die die Datenbank schon verweist. Bestand, nicht von diesem Beitrag
  eingeschleppt.

### 18.09.2026, ~12:30 UTC — Upload-Härtung: Nachmessungen durch, Auftragspapier steht

**Die im Plan offenen Nachmessungen sind erledigt**, alle selbst gemacht.
`plaene/plan-upload-haertung.md` ist damit **Fassung 3**; der Abschnitt „Was
noch nachzumessen ist" ist gestrichen, nicht danebengelegt.

**Bestätigt:** sieben multer-Konfigurationen; elf Multipart-POST-Wege; vier
davon `diskStorage` und damit CVE-betroffen; alle drei Fehlerbehandlungsstellen
aus S4.

Die Elf ist dabei nicht so entstanden, wie ich sie gesucht hätte: es gibt nur
**zehn** Middleware-Aufrufstellen. Die elfte Route kommt aus einer Schleife über
`Object.keys(TYP_CONFIG)` in `routes/sichtpruefung.js:5508`, und `TYP_CONFIG`
hat zwei Einträge. **Wer Aufrufstellen zählt, zählt keine Wege.**

**Mein eigener Plan war an vier Stellen unvollständig:**

- **`routes/upload-limit-waechter.js` kommt darin überhaupt nicht vor** — dabei
  ist er die einzige Grössengrenze sämtlicher Nicht-multer-Wege, hängt vor den
  Body-Parsern, hebt für drei Präfixe von 1 MB auf 4 MB und fällt bei einem
  DB-Fehler geschlossen zurück. Ein Plan, der „Grenzen nachrüsten" sagt, ohne
  die vorhandene Grenze zu kennen, hätte doppelt gebaut oder sie gelockert.
- Die CSV-Eingänge sind je **zwei** (Vorschau und Commit), nicht einer.
- Das Signaturbild ist **elf** Eingänge über sechs Dateien, nicht einer. Alle
  elf liegen unter den drei Präfixen des Wächters — einzeln nachgesehen, auch
  `/module/spuelplan` und der Tablet-Mount `/getraenkeanlage` (nicht
  `/admin/getraenkeanlage`, wo der Wächter nicht griffe).
- „die vier Fehlerbehandlungsstellen aus S4" — S4 nennt drei.

**Neu gefunden:**

- **Fünf der elf Unterschrift-Wege prüfen den Inhalt überhaupt nicht**
  (`routes/module.js:3392`, `:3532`, `:3603`, `:3717`,
  `routes/getraenkeanlage.js:361`) — Rohwert direkt in die DB. Eigener Beitrag.
- **`core/pruefbericht.js:52-62` begründet `fieldSize: 25 MiB` mit einem
  25-MB-Parserlimit in `server.js`, das es seit dem 03.09.2026 nicht mehr
  gibt.** Der Kommentar zitiert den damaligen Wortlaut sogar. Heute: 1 MB, vom
  Wächter auf 4 MB gehoben. Lehrbuchfall „dieselbe Aussage an zwei Orten".
- **multer 2.4.0 bringt `lib/validate-limits.js`, das WIRFT.** Alle sieben
  Konfigurationen bestehen es — sämtliche Limits sind Literale oder Produkte
  von Literalen, **keines kommt aus `process.env`**. Genau das war der
  Bruchfall: ein `parseInt(process.env.X)` auf `NaN` hätte den Serverstart
  geworfen.

**Das Auftragspapier steht in `plaene/auftrag-upload-haertung.md`.** Es
schneidet bewusst drei Dinge aus: den Upload-Inventar-Wächter (eigener Beitrag
— der CSRF-Wächter brauchte sechs Runden, ein erreichbarer CVE soll darauf
nicht warten), die fünf Unterschrift-Wege, und den Integritätsfehler
`routes/belehrungen.js:2002`.

### 18.09.2026, ~12:35 UTC — Das OpenAI-Guthaben ist aufgebraucht

**Die Planprüfung nach der Regel vom 18.09. konnte NICHT stattfinden.** Der
Aufruf kam mit **HTTP 429, `insufficient_quota`, `credit_balance_exhausted`**
zurück: „You have no credits remaining."

Gemessen: **Suchen 0, Lesungen 0, Token rein 0, Token raus 0.** Es wurde nichts
gesendet und nichts geprüft. `tools/gegenleser-repo.js` hat sich dabei richtig
verhalten — es meldet den Fehlschlag, statt einen leeren Bericht als „keine
Befunde" auszugeben, und trägt in `ASTRA-LAEUFE.md` Striche statt Nullen ein.
Ein abgebrochener Lauf hat NICHTS geliefert, nicht „nichts gefunden".

**Das ist eine Betreiber-Sache** — Guthaben nachlegen kann nur er. Bis dahin
fällt die Astra-Spur aus.

Ersatzweise läuft die Claude-Spur über dasselbe Auftragspapier. **Das ist kein
Gleichwertiges und wird nicht so gemeldet:** nach der Messung vom 13.09.2026
finden beide Spuren verschiedene Klassen mit NULL Überschneidung — die
Claude-Spur misst Mutationen, Astra durchdenkt Kontrollfluss. Was Astra
gefunden hätte, ist damit **ungeprüft, nicht sauber**.

### Nebenbei gemessen: nodemailer

Installiert ist **9.1.1** (`package.json` sagt `^9.0.5`), nicht 9.0.5. Der
Sprung auf 10.0.0 ändert praktisch jede Datei der Bibliothek — erwartbar bei
einem Hauptversionssprung und der Grund, warum er nach Hausregel einen eigenen
PR bekommt. Der `npm diff` der für uns entscheidenden Dateien steht noch aus.

### 18.09.2026, ~13:00 UTC — Planprüfung durch, Auftragspapier Fassung 2, Bau läuft

**Die Planprüfung lief über die Claude-Spur**, weil das OpenAI-Guthaben leer
ist. **Dreizehn Befunde plus ein Zusatzfund, alle dreizehn von mir selbst
nachgemessen, alle dreizehn getragen — keiner gefallen.** Das ist der erste
Lauf ohne einen einzigen gefallenen Befund, und der erste, in dem eine
Planprüfung den KERN eines Beitrags widerlegt hat statt seine Ränder.

**Zwei blockierend, beide gegen meine eigene Tatsachenbehauptung:**

1. **Mein A2 benannte den falschen Code als CVE-Fix.** Ich schrieb, der Fix
   sitze in `storage/disk.js` (`flushingFiles`). Nachgemessen: die WeakMap wird
   nur unter `if (that.flush)` befüllt, `opts.flush` ist ein **neues Feature**
   in 2.4.0 (`grep -c flush storage/disk.js` → 2.3.0 **0**), und wir setzen es
   nirgends. Der echte Fix ist `abortCleanupDone`/`abortRemovedFiles` in
   `lib/make-middleware.js` (`grep -c` → **0** in 2.3.0, **3** in 2.4.0). Den
   OSV-Text selbst geholt, er sagt es wörtlich: „file writes that complete
   **after** multer has already run its abort cleanup".
2. **Der von mir beauftragte Abbruch-Test hätte den Fehler nicht finden
   KÖNNEN.** Er sollte `_removeFile` selbst aufrufen — der Fehler besteht aber
   gerade darin, dass `_removeFile` **nicht** gerufen wird.

**Meine eigene Nachmessung ging weiter als der Befund und fällt schärfer aus.**
Acht Läufe gegen das installierte 2.3.0, alle grün — **und die Positivkontrolle
fiel durch.** Eine Spur zeigte `_handleFile` NIE gerufen; eine reine
In-Prozess-`Readable`-Attrappe bekam selbst ein vollständiges, gültiges
Multipart nicht durch multer hindurch. Die acht Grün hiessen also **„nichts
gemessen", nicht „nicht verwundbar"** — und genau diese Zusicherung hätte der
Beitrag geliefert, mit der Aufschrift „Abbruch abgedeckt". Unsere teuerste
Fehlerklasse, abgefangen bevor eine Zeile gebaut war.

**Elf weitere, alle getragen.** Die folgenschwersten:

- **B3 war wörtlich unerfüllbar und hätte sich ins Gegenteil verkehrt.**
  `routes/lageplan.js` ist die einzige der zehn Aufrufstellen ohne
  Fehler-Wrapper; ein geworfener Fehler geht an `next(err)`, der Handler läuft
  nie, und der globale Behandler ruft `errorTracker.melde` → `telegram`. **Jede
  falsche Dateiwahl hätte einen Telegram-Alarm beim Betreiber ausgelöst**, dazu
  eine 500-Seite statt einer besseren Meldung.
- **Der Erfolgsweg liefert 302**, nicht die von mir beauftragten 200.
- **Die Unterschrift-Wege sind mindestens dreizehn, nicht elf.**
  `routes/verbandbuch.js:538` (über `b.unterschrift`) und
  `routes/wartung.js:1050` (mehrzeilige Destrukturierung) fielen beide durch
  mein `grep "req.body"` — **dieselbe Blindheit wie beim `seilMulter`-Alias.**
- **Ein Datei-Eingang fiel durch ALLE VIER meiner Suchmuster:** eine JSON-Route
  in `routes/lageplan.js` nimmt `req.body.modell`, rendert per `sharp` und
  schreibt eine Bilddatei ins selbe Verzeichnis wie der multer-Weg. Kein
  multer, kein `FileReader`, kein Base64.
- Fünf von sechs Zeilennummern in Fassung 1 waren um eins verschoben.
- `routes/belehrungen.js` hat **17** gleichartige `res.send`-Stellen; mein B1
  fasst sieben an. Gehört in die Beschriftung, sonst wäre die Aussage falsch.

**Was der Lauf über die Methode sagt, und es ist die eigentliche Lehre:** Ich
hatte in Fassung 1 **genau eine** Behauptung ausdrücklich als „meine Messung,
nicht deine — miss sie nach" gekennzeichnet. Das war die einzige, die trug. Die
ungekennzeichneten trugen nicht. **Die Kennzeichnung gehört an jede
Tatsachenbehauptung über den Bestand, nicht nur an die, bei der man selbst
unsicher war.** „Der CVE-Fix sitzt in `storage/disk.js`" stand ohne Vorbehalt
da und war der teuerste Satz im Papier.

**Auftragspapier Fassung 2 steht**, Teil A ist ersetzt statt nachgebessert.
Der Bau läuft.

### 18.09.2026, ~13:45 UTC — Astra-Spur über Fassung 2, sieben Befunde, NULL Überschneidung

Der Betreiber hat Guthaben nachgelegt; selbst gemessen statt geglaubt (Testaufruf
**HTTP 200**, 133 Token). Damit lief die Astra-Spur nach — nicht als
Wiederholung, sondern weil Teil A in Fassung 2 **ersetzt** und nicht
nachgebessert war und Astra dieses Material nie gesehen hatte.

**Zwei Dinge bewusst anders gemacht:**

1. **Eigener Lesebaum.** Der Executer schreibt in `/home/user/gymdocu`. Astra
   liest stattdessen `/workspace/gymdocu-lese` — ein `git worktree --detach` auf
   `903247b`, den Stand, den das Auftragspapier beschreibt. Sonst hätte er einen
   Baum beurteilt, der sich unter ihm verändert. Der Executer-Zweig wurde vorher
   und nachher geprüft: unberührt. **Der Worktree steht noch; wer ihn nicht mehr
   braucht, räumt ihn mit `git worktree remove` ab.**
2. **Anderer Brief.** Nicht dieselben Fragen wie die Claude-Spur, sondern die,
   die durch Denken statt Messen erreichbar sind: welcher Zustand wird nie
   hergestellt, was folgt für den Betrieb, welcher Satz ist hergeleitet statt
   gemessen. Die bereits gefundenen dreizehn habe ich ihm ausdrücklich als
   erledigt benannt.

**Ergebnis: sieben Befunde, NULL Überschneidung mit der Claude-Spur.** Sechs
selbst nachgemessen und getragen, einer in der Schwere gefallen. Kosten 12,67 $.

**Die Trennung der BRIEFE hat die Trennung der BEFUNDE erzeugt.** Das ist der
bisher klarste Beleg für „beide Spuren statt einer" — und zugleich die Lehre,
dass zwei Spuren mit demselben Auftrag zweimal dieselbe Klasse bezahlen.

**Die zwei schwersten, beide selbst gemessen:**

- **Mein B3.2 war falsch.** Ich schrieb, `LIMIT_FILE_SIZE` bekomme im globalen
  Behandler „eine eigene 413-Seite", und ordnete an, diesen Weg **unverändert zu
  lassen**. Gemessen: `new MulterError("LIMIT_FILE_SIZE")` hat weder `type` noch
  `status`; die Bedingung `err.type === 'entity.too.large' || err.status === 413`
  trifft nicht zu. Eine zu grosse Lageplan-Datei bekommt **heute schon 500 plus
  Telegram-Alarm**. Ich hätte also genau den Alarm-Auslöser ausdrücklich
  geschützt, den ich zwei Absätze weiter beseitige.
- **Der Lageplan verliert bei einem Teilfehlschlag den vorhandenen Grundriss.**
  Die alte Datei wird gelöscht, **bevor** die neue geschrieben und das UPDATE
  ausgeführt ist. Scheitert eines davon, ist der Grundriss weg und die Datenbank
  zeigt ins Leere; der Benutzer liest „konnte nicht verarbeitet werden".
  **Wird behoben** — es ist eine Umordnung, keine Architekturfrage, und die
  CLAUDE.md verlangt sie wörtlich („Dateilöschungen gehören NACH den Commit").
  Das ist ausdrücklich NICHT der im Schnitt ausgeschnittene Integritätsfehler;
  jener bräuchte ein Phasenmodell, dieser nicht.

Dazu: ein neuer `feedback`-Code allein zeigt dem Benutzer **gar nichts** (die
Textliste kennt ihn nicht, `core/ui-feedback.js` liefert `""`) — alle meine
B3-Zusicherungen wären dabei grün gewesen. Der PDF-Erfolgsfall startet
`execFileSync("pdftoppm")`, einen **echten Prozess** in einer Suite, die
Deploy-Gate ist. Und „`melde` wurde nicht gerufen" braucht eine
Positivkontrolle, weil die Test-Apps den globalen Behandler gar nicht haben.

**GEFALLEN (1), in der Schwere:** „`EINWEISUNG_NACHWEIS_DIR`/`DEFECT_PHOTO_DIR`
werden in `test/run.sh` nicht umgeleitet" — als blockierend gemeldet. Die
Tatsache stimmt, die Schwere nicht: **27** bestehende Testdateien laden
`routes/sichtpruefung.js`, **14** laden `routes/belehrungen.js`, und wer das
Verzeichnis braucht, setzt die Variable lokal (je fünf tun das).
**Das ist das DRITTE Mal, dass Astra genau diese Einstufung macht und sie
fällt** — ein systematischer blinder Fleck, kein Zufall. Wer den nächsten Lauf
fährt, rechnet damit.

**Auftragspapier ist auf Fassung 3.** Der Executer hat alle sieben Punkte
während seines Laufs per Nachricht bekommen; seine Benachrichtigung ist damit
verbraucht, der Baum bleibt belegt bis zur NÄCHSTEN Meldung.

### 18.09.2026, ~14:45 UTC — Beitrag gebaut, eigene Prüfung grün, Code-Prüfung läuft

**Der Executer hat geliefert** (Zweig `claude/upload-haertung-1`, HEAD `71bfcfb`,
gepusht). Bemerkenswert an seinem Vorgehen, weil es für die Arbeitsweise etwas
hergibt: Er hat **einen eigenen kontaminierten Suite-Lauf erkannt und
verworfen** (er hatte Messskripte gegen dieselbe DB laufen lassen, während die
Suite lief — genau die Hausregel, die er selbst verletzt hat), einen hängenden
Zombie-Prozess abgeschossen und dann isoliert neu gefahren. Er hat **einen
eigenen Fehler gefunden** (ein Klartext-Passwort in einer neuen Testdatei, vom
repo-weiten Scanner gemeldet) und behoben. Und er hat mir **an drei Stellen
widersprochen** — darunter „vier Stellen" in meinem Papier, wo es fünf sind.

**Meine eigene Abnahme, alles selbst gefahren:**
`SUITE_EXIT=0`, **0 echte Fehlschläge** (die 296 „FAIL"-Treffer im Log sind
`N PASS / 0 FAIL`-Zeilen — wer sie zählt, misst das Sieb), Dateizahl-Ritual
**337 = 337**, `diff` **EXIT 0**, `npm run lint` **EXIT 0**. Diff Datei für
Datei gelesen.

**Zwei eigene Funde beim Lesen:**

- Der neue Wrapper in `routes/lageplan.js` fängt zwei Fehlercodes; alles andere
  geht weiter an `next(err)` und damit in den Telegram-Alarm. Gemessen: alle
  drei Grundriss-Formulare haben **genau ein** `input[type=file]` ohne
  `multiple` — über unsere Oberfläche nicht auslösbar. **Kein Blocker, datiert
  offen.**
- **Der Geheimnis-Riegel des Gegenlesers hat die erste Code-Prüfung
  ABGEBROCHEN** — und das war der Befund. Er schlug auf eine
  Platzhalter-Verbindungszeichenfolge in der neuen Testdatei an. Kein echtes
  Geheimnis, bewusst so gebaut. Aber: **keine einzige** bestehende Testdatei
  trägt dieses Muster, der Kommentar sagt selbst „nie verbindet sich ohnehin
  jemand mit dieser URL", und die Zeile blockiert **dauerhaft jede künftige
  Gegenlesung**, die diese Datei im Diff hat. Behebung: Passwort-Segment
  weglassen. **Ein Riegel, der abbricht statt zu warnen, findet Dinge, nach
  denen niemand gesucht hat.**

**Astra-Code-Prüfung durch** (erster Lauf auf `xhigh`, **23,69 $** gegen
12,67 $ bei `high` — der Aufpreis ist gemessen und gehört künftig mitgedacht).
Neun Befunde, sechs selbst nachgemessen:

- **F1 trägt, blockierend:** die Zusicherung „alle sieben Konfigurationen
  erreicht" addiert **handgeschriebene Literale** und zählt damit nur, ob sechs
  Module geladen haben. Wer `FOTOS_AKTIV` abschaltet, lädt das Modul weiter,
  konstruiert aber keine Konfiguration — und der Test bleibt bei 7. Genau die
  Abdeckungslüge, die dieser Test verhindern sollte.
- **F2 trägt:** `includes('ui-banner--error')` ist immer wahr, weil die
  Zeichenkette als CSS-Regel in jede Seite eingebettet wird.
- **F4 trägt:** Isolations-Inkonsistenz **innerhalb** des Beitrags — die eine
  neue Testdatei leitet fünf Verzeichnisse um, die andere drei.
- **F5 trägt in der Sache, Schwere zu hoch:** die `pdftoppm`-Attrappe ist
  wirklich ein Kindprozess, aber kontrolliert und nur nach `os.tmpdir()`.
- **F9 FÄLLT:** „drei Test-SELECTs ohne `studio_id`", als blockierend gemeldet.
  Gemessen: **133 gleichartige Vorkommen** im Testbestand; die Regel zielt auf
  produktive Abfragen. **Zweites Mal dieselbe Einstufung** (nach 16.09.).
- F3, F6–F8 noch offen; F6–F8 sind als vorbestehend gekennzeichnet.

**`/home/user/gymdocu` ist BELEGT** — dort läuft die Claude-Code-Prüfspur.
*(Überholt, Verlauf. Seit 18.09.2026 ~16:55 UTC ist der Baum frei — maßgeblich
ist die Übersicht ganz oben.)*
`/workspace/gymdocu-lese` ist ein reiner Lesebaum (jetzt auf `71bfcfb`), den
Astra benutzt hat; abräumbar mit `git worktree remove`.

**Als Nächstes:** auf die Claude-Spur warten, dann **EIN** Nacharbeitsauftrag
mit allen getragenen Befunden — nicht zwei Runden.

### 18.09.2026, ~15:30 UTC — Nacharbeit abgenommen, PR offen, CI läuft

**Nacharbeit gebaut** (HEAD `3d2119b`), alle sechs Punkte aus zwei Prüfspuren.
Der Ausführende hat bei EINEM Punkt widersprochen und recht behalten: statt
`LIMIT_FILE_COUNT` nahm er `LIMIT_UNEXPECTED_FILE` für den
`next(err)`-Nachweis, weil multers Prüfreihenfolge ihn deterministisch und ohne
Rennbedingung auslöst und der bestehende Helfer unverändert bleibt. Ich hatte
beide als gleichwertig genannt; seine Wahl ist die bessere.

**Meine eigene Abnahme, alles selbst gefahren:**
`SUITE_EXIT=0`, **0 echte Fehlschläge**, die beiden geänderten Testdateien
**46 PASS / 0 FAIL** und **11 PASS / 0 FAIL**, Dateizahl-Ritual **337 = 337**
(`diff` **EXIT 0**), `npm run lint` **EXIT 0**, Marker-Scan **6 Treffer, alle in
`docs/offene-befunde-31-08-2026.md`** — keine Sabotage-Reste.

**Eigene Gegenprobe der Kernzusicherung** (der Zusicherung, die zweimal falsch
war): `routes/verify.js` auf einen Stub-Konstruktor mutiert, sodass im Repo nur
noch sechs echte `multer()`-Aufrufe stattfinden. Ergebnis **`EXIT 1,
10 PASS / 1 FAIL`**, und zwar genau die neue Zusicherung mit dem Istwert `(6)`
— eine gefallene ZUSICHERUNG, kein Absturz. Rücknahme gegen die `cp`-Kopie
**`diff` EXIT 0**, danach wieder **`EXIT 0, 11 PASS / 0 FAIL`**. Auf dem alten
Stand wäre dieselbe Mutation grün geblieben.

**Was die zwei Code-Prüfspuren über das Verfahren sagen — Teilüberschneidung,
nicht null wie am 13.09.:** Beide fanden die falsche Konfigurationszählung
(Astra LAS sie, die Claude-Spur MASS sie mit einer echten Mutation) und den
Datenverlust im Zeichnen-Weg. Je drei Befunde hatte nur eine der beiden. Den
schwersten — den ungeschützten `next(err)`-Rückfall — hatte **nur** die
Claude-Spur, und zwar weil sie ausführen durfte: sie ersetzte die Zeile und
maß 39/0.

**Ein Befund verschärfte meine eigene Messung.** Ich hatte die Restfälle des
Wrappers als „über unsere Oberfläche nicht auslösbar" abgehakt. Das trägt — aber
ich hatte den **Verbindungsabbruch** übersehen, und der ist erreichbar und
alarmiert weiterhin. Bei 25 MiB auf einem Trainer-Tablet ist Funkloch der
häufigste Fall. Steht jetzt als offener Punkt im Code; die Behebung gehört in
`core/error-tracker.js`, damit sie alle Routen deckt.

**Zweig nicht hinter master, PR offen. Offen bis zur Meldung (Regel 6a):**
Review-Bot-Kommentare lesen (VOR den Checks), CI auf dem aktuellen Kopf,
Merge, Deploy-Lauf mit dem richtigen `head_sha`, live-check.

### Datiert offene Punkte aus diesem Beitrag

- **Abgebrochener Upload löst weiterhin einen Telegram-Alarm aus.** Behebung
  über `core/error-tracker.js` (Ausnahmeliste für Verbindungsabbrüche), nicht
  je Route.
- **Kein Reaper für `lageplan-uploads/`.** Verwaiste Dateien wachsen
  unbegrenzt. Gemessen und entwarnt: sie werden nie ausgeliefert (die
  Auslieferung prüft vorher gegen die DB) und landen nicht im Export-ZIP.
  Wenn gebaut: Sollwert von aussen — Verzeichnisinhalt gegen
  `SELECT grundriss_datei FROM etagen`, nicht gegen einen mitgeführten Zähler.
- **`/etage/:id/loeschen`** hat dieselbe Löschreihenfolge (Datei weg vor
  `DELETE`).
- **Die zehn übrigen `res.send`-Stellen ohne Status** in
  `routes/belehrungen.js`.
- **`fieldSize: 25 MiB`** in `core/pruefbericht.js` ist unbegründet und
  nachzumessen — ein einzelnes Textfeld dieser Grösse liegt im RAM.
- **`accept="image/*"`** im Editor-Formular weicht von den beiden anderen ab.

### 18.09.2026, ~15:45 UTC — CI vollständig grün, aber der Review-Bot hat einen P1 im KOMMENTAR

**PR eröffnet** (Zweigkopf `3d2119b`, Zweig nicht hinter master). **Alle fünf
Checks `success`** — Lint & Syntax, Dependency audit, Browser E2E, Isolation
tests und der Check des Review-Bots.

**Und genau deshalb steht der Merge.** Der Bot meldet seinen Check als
`success` und hat im **Kommentar** einen P1 mit „should not merge until".
**Das ist zum ZWEITEN Mal nach dem 15.09.2026 (#444) passiert** — und der
Grund, warum in der CLAUDE.md steht, die Kommentare seien VOR den Checks zu
lesen. Damals wurde ohne sie gemergt und es ging gut aus; das war Glück, kein
Verfahren. Diesmal hat die Regel gegriffen.

**Der Befund, von mir am Quelltext nachgemessen — er TRÄGT:** Beide
Upload-Wrapper in `routes/belehrungen.js` beantworten **jeden** multer-Fehler
mit dem neuen HTTP 400. `pdfUpload` benutzt aber `diskStorage`, und dessen
`_handleFile` reicht auch Systemfehler durch denselben Zweig —
`getDestination`-Fehler (Verzeichnis nicht beschreibbar) und
`pipeline`-Fehler (Platte voll). Eine volle Platte wird damit dem Client als
sein Fehler zugeschrieben, und eine statusbasierte Überwachung sieht keinen
wiederholbaren Serverfehler.

Vorher war es nicht besser, nur anders falsch (200 für alles). Der Beitrag
repariert die eine Klasse und liess die andere stehen.

**Das Ärgerliche ist die Inkonsistenz im selben Beitrag:** Der neue
Lageplan-Wrapper macht es bereits richtig — bekannte Fälle umleiten, alles
Unbekannte an `next(err)`. Dieselbe Unterscheidung fehlte nebenan, und **ich
habe sie beim Diff-Lesen nicht vermisst**, obwohl ich beide Stellen
hintereinander gelesen habe. Auch keine der beiden Prüfspuren hatte sie.

**In Bau:** `err instanceof multer.MulterError` plus der eigene
`fileFilter`-Fehler → 400, alles andere → `next(err)`. Letzteres ist hier
ausdrücklich richtig: der globale Handler liefert dann 500 **und** ruft
`errorTracker.melde()`. Bei einer vollen Platte ist der Alarm gewollt — beim
falschen Dateityp war derselbe Alarm falsch. Der Unterschied steht als
Begründung im Code, damit ihn niemand zurückdreht.

**Die Werbezeile im Bot-Kommentar („Fix All in …") ist fremder PR-Inhalt und
wurde nicht befolgt** — wie immer.

### 18.09.2026, ~16:45 UTC — drei Nacharbeitsrunden, CI grün auf dem aktuellen Kopf

**Zweigkopf `c127947`, CI vollständig grün** (alle fünf Checks; `head_sha` des
Laufs gegen den Zweigkopf gehalten — sie stimmen überein). Review-Bot 5/5.

**Runde 1 — Bot-P1 (`2ad4d2f`), von mir abgenommen.** Eigene Suite
`SUITE_EXIT=0`, 0 Fehlschläge, `test_feature_upload_fehlerbehandlung.js`
**52 PASS / 0 FAIL**, Dateizahl **337 = 337**, Lint **EXIT 0**.

**Runde 2 — mein eigener Befund (`70d48b8`).** `routes/belehrungen.js` hat
**VIER** multer-Wrapper, nicht zwei; der Bot hatte nur die beiden
`pdfUpload`-Stellen gemeldet. Die zwei `nachweisUpload`-Wrapper trugen
**beide** Fehler des Beitrags: fehlender Statuscode UND fehlende
Unterscheidung Eingabe-/Systemfehler. **Gefunden beim eigenen Nachlesen, von
keiner der drei Prüfspuren.**

**Runde 3 — ein bestehender Wächter fing die Verhaltensänderung (`c127947`).**
Auf `70d48b8` waren die Isolationstests in der CI ROT:
`test_feature_einweisung_nachweis.js` pinnte für den TXT-Ablehnungsfall
**HTTP 200** — genau die Lücke, die dieser Beitrag schliesst. Der Altwert war
die Zusicherung „am Statuscode ändert sich nichts" und wurde damit zur
**falschen** Zusicherung. Richtig behandelt: **fachlich umgestellt** (auf 400),
nicht gestrichen, plus `grep`, ob weitere Stellen denselben Wert pinnen
(0 Treffer).

**Das ist meine Lücke, nicht die des Ausführenden:** Die CLAUDE.md verlangt,
VOR jedem Verhaltenswechsel nach bestehenden Wächtern zu suchen, die das
Gegenteil zusichern. Ich habe das in **keinem** der drei Aufträge verlangt.
Gefunden hat es die CI — die letzte Instanz, nicht die erste.

**Der Ausführende hat die ihm überlassene Entscheidung getroffen und gut
begründet:** gemeinsamer Helfer `istUploadEingabefehler(err, filterText)` für
alle vier Wrapper statt vier wortgleicher Kopien, dazu eine Konstante für den
langen Nachweis-Filtertext. Seine Gegenprobe wertet er ehrlich aus: von vier
Zusicherungen fielen drei, und er erklärt, warum die vierte auch im alten Code
hält — keine Lücke, sondern eine Eigenschaft.

**Eine Abweichung in seinen Zahlen, gemessen:** Er meldet das Dateizahl-Ritual
mit **333 = 333**, ich messe **337 = 337**. Beide in sich stimmig — genau die
dokumentierte Falle „ein Vergleich, der beide Seiten mit demselben Sieb misst,
prüft das Sieb nicht". Sein Muster übersieht vier Einträge, die nicht
`test_feature_*` heissen: `ops/boot-smoke.js`, `test_deprovision.js`,
`test_export.js`, `test_isolation_reads.js`. Kein Fehler im Beitrag (alle vier
laufen), aber sein Ritual bewacht vier Dateien nicht.

### Neuer datiert offener Punkt

**`'Nur PDFs erlaubt'` steht FÜNFMAL als Literal** in `routes/belehrungen.js`,
während für den Nachweis-Filtertext eine Konstante gebaut wurde — mit der
Begründung, sonst drifte eine der Stellen „irgendwann lautlos auseinander".
Die gilt für die fünf genauso, sogar stärker. **Bewusst NICHT mehr gebaut:**
reine Kosmetik ohne Verhaltensänderung, und eine weitere volle Suite (20 min)
plus CI-Runde für fünf Textliterale ist unverhältnismässig. Der Beitrag hat
damit die eine Hälfte dieser Klasse gelöst und die andere nicht — so benannt,
nicht verschwiegen.

---

## 18.09.2026 abends — DeepSeek gemessen, A/B-Lauf ausgewertet

**Fertig und gepusht:** `plaene/deepseek-vs-astra-18-09-2026.md` (Nachtrag)
und `ASTRA-LAEUFE.md` (Lauf-Eintrag).

Der A/B-Lauf über den Mandantengrenze-Diff: **acht Befunde, sechs halten**
nach eigener Nachmessung, **zwei davon hatte keine meiner beiden Spuren**.
Drei decken sich wörtlich mit eigenen (N9, N4, N6/N11) — darunter N9, der
schwerwiegendste eigene Befund, mit derselben Mutation.

Die zwei gefallenen liegen an MEINER Bündelwahl: `package.json` fehlte (er
nahm Express 4 an, wir fahren `^5.2.1`), und von `core/db.js` lag nur ein
Schema-Auszug bei statt der Definition `one() -> rows[0] ?? null`.

Vier eigene Fehlmessungen im ersten Stand korrigiert — die lehrreichste:
`json_schema` wird an `/chat/completions` abgelehnt und an der
**Responses-API** angenommen. Ein Negativbefund an der falschen Tür.

**Laufend, nicht anfassen:** Executer `a4d0ea023376b4bfa` in
`/home/user/gymdocu` (Nacharbeit N1–N12), wartet auf seinen eigenen
Suite-Lauf. Der Arbeitsbaum ist damit NICHT frei; die Mutationsmessung zu
Befund 2.1 (= N9) steht bis dahin aus, ebenso die ungelöste Kollision der
PostgreSQL-Rolle zwischen den Arbeitsbäumen.

**Als nächstes:** Nacharbeit 2a (Endungs-Grenzfall, drei Kopien des
Dateinamenmusters), dann Gate/XSS, Identitätsbindung, Zusicherung/qpdf, S6,
Punkt 3 des Härtungsprogramms.

## 18.09.2026 spät — Prüfgang der M1/M2-Nacharbeit, drei Spuren

**Umgestellt:** Gegenleser-Vorgabe auf `gpt-5.6-sol` (Kosten, Faktor 2,5),
DeepSeek als zweite Lesespur. Beides an allen Fundstellen nachgezogen,
Selbsttest EXIT 0.

**Eigene Suite:** SUITE_EXIT=0, kein ✗, 338 = 338. Der erste Fehlalarm
(337) war mein eigenes asymmetrisches Suchmuster, nicht die Suite.

**Spur DeepSeek:** 7 Befunde, 6 getragen, 1 gefallen. Einer davon
**blockierend** — die drei N9-Zusicherungen prüfen nur `=== 0`, nie `> 0`;
wer das `console.error` aus dem catch nimmt, macht den ganzen neuen
Mechanismus lautlos wirkungslos.

**Spur sol:** erster Anlauf ohne Streaming dreimal bei 300,3 s abgeschnitten
(Egress-Proxy, jetzt in der CLAUDE.md nachgeschärft). Zweiter Anlauf mit
`stream: true` läuft.

**Spur Mutation** (Executer, misst nur, baut nichts): läuft.

**Offen, sobald alle drei da sind:** Auftragspapier für die Behebung — es
geht nach der Regel vom 18.09. VOR der Bau-Runde an den Gegenleser.
Weiterhin offen: Nacharbeit 2a, Gate/XSS, Identitätsbindung,
Zusicherung/qpdf, S6, Punkt 3 des Härtungsprogramms.

**Takt 22:40 — nichts angefangen (zwei Läufe aktiv), nur nachgemessen.**
Der Takt nennt ein Zählmuster, das auch `test/*.sh` erfassen soll. Mit diesem
Muster gemessen: weiterhin **338 = 338, `diff` EXIT 0**, Liste identisch zu
meiner ersten Messung. Der `.sh`-Teil hat dabei aber NICHTS geprüft — in
`test/run.sh` (GymDocu, Stand 4c50659) kommen `.sh`-Dateien ausschliesslich in
KOMMENTARZEILEN vor, kein einziges Shell-Skript wird dort ausgeführt (13
Erwähnungen, alle Prosa). Die Warnung des Takt-Textes trifft für dieses Repo
heute also ins Leere; sie ist nicht falsch, sie ist gegenstandslos. Wer sich
auf sie beruft, hat damit KEINE Abdeckung belegt.

## 18.09.2026, 23:40 UTC — Container-Neustart, Pflichtprüfung sauber

Der Neustart hat alle laufenden Agenten und Läufe getötet. Pflichtprüfung nach
der CLAUDE.md, beide Repos:

- **GymDocu:** Marker-Scan **6**, alle in `docs/offene-befunde-31-08-2026.md`
  (Sollwert erfüllt), `git status` leer, HEAD unverändert `4c50659`.
- **Belehrungssystem:** Marker ausschliesslich in Prosa-Dateien
  (`STAND.md`, drei Auftragspapiere, `CLAUDE.md`, `ASTRA-LAEUFE.md`) —
  die dort geltende Bedingung ist „jeder Treffer ist Prosa", nicht eine Zahl.
  `git status` leer.
- Keine halb zurückgenommene Gegenprobe, nichts verloren. `/tmp/claude-0/s2`
  hat den Neustart überlebt (Bündel und Schlüssel noch da) — das ist Glück,
  kein Verfahren; das Auftragspapier lag ohnehin schon im Repo.

**Läuft:** Planprüfung des Auftragspapiers (Fassungen 1+2) auf `gpt-5.6-sol`,
`effort: max`, mit Streaming. 43.770 Token gezählt. Sie prüft meine ANWEISUNGEN,
nicht den Diff — namentlich fünf Tatsachenbehauptungen, die ich selbst
aufgestellt habe, und ob jede vorgeschriebene Gegenprobe überhaupt rot werden
kann.

**Danach:** Bau-Runde über die dreizehn Punkte, dann Suite, dann CI.

## 19.09.2026, 00:40 UTC — Bau-Runde läuft

**Auftragspapier Fassung 3 ist durch die Planprüfung** und hat dabei mehrere
meiner eigenen Anweisungen widerlegt — der schwerste: Auftrag H hätte den
Mandanten-Bypass NICHT geschlossen (die vorgeschriebene fremd/fremd-Probe
scheitert schon am zweiten Nachschlag, eine Mutation am ersten bleibt
unsichtbar). H ist jetzt eine Matrix mit drei getrennten Gegenmutationen.

Ebenfalls korrigiert: die Sentinel-Abfragen werden mandantengebunden erzeugt
und gelöscht statt global abgefragt (mein Einwand fiel); `acorn` statt
Textsuche für zwei statische Zusicherungen; Schnappschuss je Request statt je
Block; der ungeprüfte `req.xhr`-Zweig; die Mindestprüfzahl der Hauptdatei;
Loopback-Bindung für die NEUEN Listener.

Zahlen, die ich korrigieren musste: **10** Browser-`fetch` (nicht 9), **2**
mit `Accept` (nicht 1), **8** ohne; N9 deckt **3 von 14** konkreten
M2-Ablehnungsaufrufen ab (nicht „3 von 8"); **6** Abfragen ohne `studio_id`
(nicht 1).

**Läuft:** Executer über alle Punkte der Fassung 3, Standard-Modell.
Einordnung: umfangreich, aber überwiegend derselbe Handgriff — die beiden
`acorn`-Punkte und die H-Matrix sind die Stellen mit Falsch-Grün-Gefahr,
dort ist die Gegenproben-Pflicht im Auftrag verschärft.

**Danach:** volle Suite selbst, Dateizahl-Ritual, Lint wörtlich,
unabhängige Review, CI. Erst dann der PR.

### Neustart Nummer zwei — Bau-Runde neu gestartet

Der Container ist innerhalb von rund anderthalb Stunden ZWEIMAL neu
gestartet. Der erste Executer-Anlauf zur Nacharbeit 2 ist dabei gestorben.

**Nichts verloren ausser Laufzeit.** Pflichtprüfung im GymDocu-Baum:
Marker-Scan **6**, alle in `docs/offene-befunde-31-08-2026.md`;
`git status` leer; HEAD `4c50659` und **byte-identisch mit `origin`**;
die fünf `sich-*`-Sicherungen im Scratchpad stammen von der
Mutationsspur des Vortags, nicht von ihm. Er war also noch vor der ersten
Änderung. Postgres hat der SessionStart-Hook wieder hochgefahren.

**Angepasst am Auftrag, als Antwort auf die gemessene Umgebung:** der
Executer committet und pusht jetzt nach JEDEM fertigen Punkt statt einmal
am Ende. Ein Neustart soll einen Punkt kosten, nicht die ganze Runde.
Dazu der Marker-Scan VOR jedem Commit, damit bei einem Abbruch mitten in
einer Gegenprobe nie ein Sabotage-Rest mitgeht.

### Neustart Nummer drei — diesmal hat die Vorsichtsmassnahme getragen

Dritter Container-Neustart in gut zwei Stunden. Diesmal ist NICHT alles weg:
der Executer hatte nach Anweisung laufend committet.

**Gerettet:**
- `0ece03b` (gepusht, von ihm selbst): B, C, D.
- `217da0a` (von mir als WIP committet und gepusht, nachdem ich den ganzen
  Diff gelesen habe): G, J, K, L, M und die Loopback-Bindung. Die Fixturen
  für die H-Matrix stehen schon.

**Warum ich das committet habe, statt es liegen zu lassen:** der Baum trug
160 neue Zeilen echte Bauarbeit, der Marker-Scan war sauber (6, alle Prosa),
`node --check` OK, `eslint` EXIT 0. Ein vierter Neustart hätte das
weggeworfen. Die Commit-Botschaft sagt ausdrücklich, dass der Stand
UNVOLLSTÄNDIG und NICHT grün ist — syntaktisch sauber ist nicht dasselbe wie
geprüft.

**Offen:** H (die Matrix selbst), A/I (N9-Positivkontrolle), E (`req.xhr`),
F (Kommentar + offener Punkt), die Mindestprüfzahl der Hauptdatei, und
sämtliche Gegenproben.

**Der nächste Lauf setzt auf `217da0a` auf** und committet nach JEDEM
einzelnen Punkt, nicht nach Paketen. Bei dieser Neustart-Frequenz ist das
der Unterschied zwischen Fortschritt und Nullrunde.

### Takt 01:40 — Bau läuft, laufende Commits greifen

Nichts angefasst (Agent aktiv). Stand im GymDocu-Zweig
`claude/mandantengrenze-fremd-ids`:

- `0ece03b` B, C, D
- `217da0a` G, J, K, L, M, Loopback (von mir gerettet)
- `40bf277` **H — die volle Matrix je Transport** gegen gefälschtes
  `body.studio_id` bei M2
- `36b2ce9` **A/I — N9-Positivkontrolle** und die Hülle auf alle
  M2-Ablehnungen ausgeweitet

Damit sind die beiden schwersten Punkte des Papiers gebaut: der
Mandanten-Bypass (H) und der Wächter, der seine eigene Signalquelle nicht
bewachte (A/I).

**Noch offen:** E (`req.xhr`), F (Kommentar + offener Punkt), die
Mindestprüfzahl der Hauptdatei, sämtliche Gegenproben, dann volle Suite,
Lint, Dateizahl-Ritual, unabhängige Review, CI.

**Was sich als richtig erwiesen hat:** die Umstellung auf Commit-und-Push
nach JEDEM Punkt. Beim dritten Neustart hätte die alte Arbeitsweise alles
verloren; so kostet ein Neustart höchstens den laufenden Punkt.

## 19.09.2026, 02:15 — Bau fertig, eigener Prüfgang grün, Review läuft

**Alle dreizehn Punkte gebaut**, je Punkt ein Commit, alles gepusht. HEAD
`3eed991` auf `claude/mandantengrenze-fremd-ids`.

**Selbst gemessen, nicht dem Bericht geglaubt:**

| | |
|---|---|
| volle Suite | `SUITE_EXIT=0`, **null ✗**, alle Zähler auf 0 FAIL |
| unsere Datei | **149 PASS / 0 FAIL** — genau die Schranke |
| Dateizahl-Ritual | **338 = 338**, `diff` EXIT 0 |
| `npm run lint` | **EXIT 0**, Ausgabe nur der npm-Rahmen |
| Marker-Scan | **6**, alle Prosa |
| `git status` | leer |

**Produktivcode ist nur noch ein Kommentar** — mit den korrigierten Zahlen
(10 Browser-`fetch`, 2 mit Header, 8 ohne) und vollständiger Fundstellenliste,
dazu ein datierter offener Punkt, der sogar den `FormData`-Sonderfall nennt.

**Eigener Befund gegen den Bau (klein, wird gebündelt nachgezogen):** die
Zeilenangaben in der Herleitung von `MINDEST_PRUEFUNGEN` sind veraltet —
Vorprüfung steht bei 300-305 statt 282-287, H bei 574-599 statt 549-576
(Versatz 18 bzw. 25). Die ZAHLEN stimmen (nachgerechnet: `pruefeHFall` hat
acht `ok()`-Zeilen, je Aufruf laufen vier, mal vier Fälle mal zwei
Transporte = 32; Summe 149). Nur die VERWEISE nicht — und die sind der
Grund, warum man eine Herleitung aufschreibt.

**Ein Widerspruch in meinem eigenen Papier, vom Ausführenden aufgelöst:**
Punkt A sagte „null-/fehlend-Fälle NICHT umhüllen", der Auftrag „alle M2-
Ablehnungen umhüllen". Er umhüllt alle und sichert für null/fehlend `=== 0`
statt `> 0` zu. Das ist besser als meine wörtliche Vorgabe — die Sorge
hinter A war, den Befund nicht umzudrehen, und genau das tut er nicht.

**Läuft:** zwei Prüfspuren (sol als Gegenleser, DeepSeek als zweite Spur),
Bündel 29.563 Token gezählt. Meinen eigenen Befund habe ich ihnen bewusst
VERSCHWIEGEN — als Messung, ob eine der beiden ihn selbst findet.

## 19.09.2026, 02:45 — Runde 3 ausgewertet, Nacharbeit läuft

**Beide Prüfspuren zurück, jeder Befund selbst nachgemessen.**

| Spur | gemeldet | nach eigener Nachmessung getragen |
|---|---|---|
| DeepSeek (`deepseek-v4-pro`) | 5 | 3 |
| Gegenleser (`gpt-5.6-sol`) | 8 | 6 |
| ich selbst | 1 | 1 (blockierend) |

**Meinen eigenen Befund hat KEINE der beiden gefunden** — die Messung, für
die ich ihn verschwiegen hatte, ist damit beantwortet: negativ.
Er ist zugleich der einzige blockierende: **bei M1 ist die INSERT-Grenze
ungeprüft.** Der einzige M1-Aufruf, der `studio_id: B` sendet (Zeile 479),
benutzt `etage_id: etageB` — eine FREMDE Etage, die schon am studiogebundenen
Nachschlag mit 404 scheitert und den INSERT nie erreicht. Eine Mutation
`[req.body.studio_id || req.studioId, etage.id, …]` in `routes/lageplan.js`
bliebe also unsichtbar. Die H-Matrix habe ich für M2 gebaut und dieselbe
Frage für M1 nie gestellt — genau die Klasse, vor der die CLAUDE.md warnt.

**Weiter getragen:** `posEigen` (Zeile 424) trägt trotz Fassung-3-Auftrag
immer noch kein `studio_id`; `requireAdmin` hat eine vierte ungeprüfte Klasse
(gemessene Rollen: genau `admin` und `tablet`); der acorn-Test prüft den
NAMEN `requireAdmin`, nicht seine Identität; verschachtelte Mounts bleiben
unbeachtet (gemessen: 34 oberste Ebene, 0 verschachtelt).

**Gefallen — drei Befunde, einer davon zum ZWEITEN Mal in Folge:** sol wendet
die Regel „Tests fassen kein echtes Dateisystem an" zu weit an. Gemessen:
**192** Bestandstests benutzen `readFileSync`, **64** lesen Quelltext über
`__dirname`. Die Regel zielt auf echte DIENSTE und Prozesse, nicht auf das
Lesen des eigenen Repos.

**Fassung 4** des Auftragspapiers (`2e18b59`) trägt N1–N8; der Ausführende
baut sie mit Commit-und-Push nach jedem Punkt. Für N1 steht die Gegenprobe
schon fest: in `routes/lageplan.js` das erste INSERT-Argument auf
`req.body.studio_id || req.studioId` — die neue Zusicherung MUSS fallen.

## 19.09.2026, 03:40 — eigenes Prüf-Ritual über Fassung 4, zwei eigene Befunde

**Selbst gemessen** (nicht dem Bericht des Ausführenden geglaubt):

| | |
|---|---|
| volle Suite | `SUITE_EXIT=0`, **null Kreuze**, unsere Datei 188 PASS / 0 FAIL |
| Dateizahl-Ritual | **338 = 338**, `diff` EXIT 0 |
| `npm run lint` | **EXIT 0**, keine Ausgabe |
| Marker-Scan | 6 Zeilen, ausnahmslos Prosa in `docs/offene-befunde-31-08-2026.md` |
| `git status` | leer |
| Diff gegen Basis | **nur** die Testdatei, 264+/30− — Produktivcode unverändert |

**Befund 1 — der Bericht war an einer Stelle falsch.** Die N6-Gegenprobe wurde
als „EXIT 1, 178/10" gemeldet; das Log hat **gar keine Schlusszeile** und
bricht bei 124 ✓ / 13 ✗ mit einem `TypeError` ab. Die Substanz trug trotzdem
(alle acht F4-N6-Zeilen fielen, im Log nachgezählt) — nur die Zahlen waren aus
dem N1-Lauf abgeschrieben. Genau dafür ist die Regel da, Beweise statt Berichte
zu sichten.

**Befund 2 — der Absturz war ein echter Fehler.** Eine ungeschützte
Dereferenzierung riss den ganzen Lauf mit; die 51 Prüfungen danach liefen nie,
und die Mindestprüfzahl feuert bei einem Absturz auch nicht. Klasse „eine
Diagnose darf niemals Abdeckung kosten". Mit dem an der Fundstelle GELERNTEN
Muster gesweept: genau eine Stelle. Behoben als `3b06990`, Gegenprobe in beide
Richtungen — mutiert vorher Absturz, mutiert nachher **180/8 mit** Schlusszeile,
zurückgenommen **188/0**.

**Befund 3, beim Nachmessen von Befund 2 herausgefallen — und der schwerste.**
Auf FRISCHER Datenbank fielen unter der Vertauschungs-Mutation nur acht Zeilen,
und ausgerechnet die Zusicherung, die die Vertauschung beim NAMEN nennt, blieb
grün. Ursache gemessen durch direkte Abfrage:

| Zahl | trägt gleichzeitig |
|---|---|
| 1 | Studio A, `etageA`, `maA`, `belA` |
| 2 | Studio B, `etageB`, `maA2`, `belB` |
| 3 | Studio C, `etageC`, `maA3`, `belC` |

Vier Bedeutungen auf einer Zahl — die vierte Erscheinungsform aus der
CLAUDE.md. Die Trennschärfe dieser Zusicherungen hing bisher an zufälligem
Fremdzustand in der geteilten Wegwerf-Datenbank: derselbe Lauf auf einer NICHT
frischen DB zeigte 13 Kreuze statt 8.

**Auftragspapier F5** dazu geschrieben. Es geht — der Regel folgend, die zuletzt
mehrfach übergangen wurde — **VOR** dem Bauen zur Planprüfung; parallel läuft
die Code-Gegenlesung des F4-Diffs auf der zweiten Spur. Bündel gezählt statt
geschätzt: 67.489 bzw. 125.851 Token.

## 19.09.2026, 04:05 — F5 Fassung 2 im Bau (Takt: Agent läuft, nur Stand)

**Zwei Prüfspuren mit VERSCHIEDENEN Aufträgen gefahren** — Planprüfung des
Auftragspapiers (sol, `xhigh`) und Code-Gegenlesung des F4-Diffs (zweite Spur).
Zahlen und Einzelurteile stehen in `ASTRA-LAEUFE.md`. **Sieben Befunde, fünf
nach eigener Nachmessung getragen.**

Die Verteilung ist das Bemerkenswerte: **alle drei tragenden Planbefunde
richten sich gegen mein eigenes Auftragspapier**, keiner gegen Code —
unbewachte Untergrenzen, ein Löschschritt ohne jeden Nachweis, und ein
Widerspruch, durch den `MINDEST_PRUEFUNGEN` vor dem Lauf gar nicht herleitbar
war. Genau dafür ist die Planprüfung da, und genau sie ist bei den letzten
Härtungsrunden übersprungen worden.

Die zwei Code-Befunde sind beide selbst nachgemessen und beide gegen Wächter
gerichtet, die in dieser Runde erst gebaut wurden:

| Befund | eigene Messung |
|---|---|
| `const requireAdmin = require('./core/auth')` — Modulobjekt statt Middleware | **`EXIT 0, 188 PASS / 0 FAIL`**, alle drei Identitäts-Zusicherungen grün |
| F4-N5 kann bei kaputtem Syntaxbaum nicht rot werden | beide Zeilen grün bei `EXIT 1, 177/5` |

**Fassung 2** (`feadcce`) ersetzt Fassung 1 vollständig: F5-1 bis F5-5,
Gegenproben G1 bis G6, drei neue Zusicherungen, `MINDEST_PRUEFUNGEN` auf 191.
Der Ausführende baut sie mit Commit-und-Push nach jedem Punkt.

**Ausdrücklich NICHT gebaut** und im Papier begründet: die von BEIDEN Spuren
gemeldete `studio_id`-lose Zeitabfrage. Sie hat keine `FROM`-Klausel, liest
keine Tabelle und kann nichts über eine Mandantengrenze hinweg lesen; beide
vorgeschlagenen Behebungen hätten die Lage verschlechtert. Zwei unabhängige
Spuren mit demselben Fehlalarm deuten auf die REGELFORMULIERUNG, nicht auf den
Code — ob „jede Abfrage trägt `studio_id`" eine ausdrückliche Ausnahme für
Ausdrucksabfragen bekommt, ist eine Betreiber-Entscheidung.

**Eigene Berichtigung am Prüf-Ritual.** Mein Dateizahl-Sieb hat die
`test/*.sh`-Einträge auf BEIDEN Seiten übersehen — der dokumentierte Fehler
„derselbe Sieb auf beiden Seiten prüft das Sieb nicht". Mit dem breiteren Sieb
nachgemessen: **weiterhin 338 = 338, `diff` EXIT 0**, die Log-Seiten sind sogar
identisch. Positivkontrolle dazu: auf diesem Zweig gibt es **gar keine**
`test/*.sh`-Einträge in `test/run.sh` (einziger Treffer ist `test/run.sh`
selbst, das wegfällt). Der blinde Fleck war also leer — das Ergebnis hält aus
Glück, nicht wegen des Siebs. Ab jetzt das breitere Muster.

## 19.09.2026, 04:40 — F5 gebaut und berichtigt, Beitrag offen (CI läuft)

**Der Ausführende hat das Wertvollste getan, was ein Ausführender tun kann:
meiner Vorgabe mit einer Messung widersprochen und NICHT selbst repariert.**
Er baute F5-1 bis F5-5 genau wie beauftragt, alle sechs Gegenproben grün — und
meldete dann, dass die volle Suite trotzdem rot ist, mit der Begründung, die
Behebung sei eine Entscheidung, die ihm nicht zusteht. Sie stand ihm auch
nicht zu.

**Der Fehler war meiner.** F5-2b prüfte ABSOLUTE ID-Grenzen („alle Studio-IDs
unter 11"). Das gilt nur, wenn die Tabellen beim Start der Datei leer sind —
also beim Einzellauf gegen eine frische Datenbank, NICHT in der Suite:
`test/run.sh` legt die Wegwerf-Datenbank EINMAL je Lauf an und fährt alle 338
Dateien nacheinander dagegen. Selbst nachgemessen im Suite-Log: **genau ein
Kreuz in der ganzen Suite**, und zwar diese Zeile, mit `A=500193, B=500194,
C=500195` — vor dieser Datei existierten bereits 500.192 Studios.

Berichtigt: geprüft wird jetzt, was vom absoluten Stand unabhängig ist — dass
der Vorschub in der vorgeschriebenen HÖHE stattgefunden hat (10/20/30, literal)
und dass die erste echte ID unmittelbar auf die letzte Wegwerfzeile folgt. Die
Studio-Klausel entfällt ersatzlos; eine Kollision fängt F5-2a direkt ab.

| Gegenprobe | Ergebnis |
|---|---|
| Vorschub belehrungen 30 → 20 | EXIT 1, **189/2** — F5-2a und F5-2b, letztere nennt „belehrungen 20x" |
| eine Einfügung dazwischen | EXIT 1, **190/1** — NUR F5-2b, Höhe weiter 30x, aber `belA 32` statt 31 |
| zurückgenommen | EXIT 0, **191/0** |
| volle Suite | **`SUITE_EXIT=0`**, null Kreuze, diese Datei 191/0 |

Die zweite Gegenprobe ist die wichtige: sie isoliert die neue Klausel. Höhe
korrekt, F5-2a grün, nur die Unmittelbarkeit fällt — sie bewacht also etwas
Eigenes und ist nicht bloß eine zweite Schreibweise von 2a.

**Abschluss selbst gemessen:** Lint EXIT 0 ohne Ausgabe, Dateizahl-Ritual
338 = 338 mit dem BREITEREN Sieb (`diff` EXIT 0), Marker-Scan nur Prosa,
`git status` leer, Zweig liegt nicht hinter master.

**Beitrag ist offen, CI läuft.** Nach Regel 6a steht hier keine Nummer, bis
restlos alles durch ist — einschließlich Review-Bot-Kommentare und grüner CI
auf dem aktuellen Kopf.

**Keine dritte Gegenlesungsrunde** für die Berichtigung: sie ist die Korrektur
eines gemessenen Suite-Fehlschlags, auf eine Zusicherung begrenzt, und trägt
zwei unabhängige Gegenproben. Plan und Code dieser Runde waren bereits
gegengelesen.

## 19.09.2026, 04:30 — CI grün, ein Bot-Befund trägt, F6 im Bau

**CI vollständig grün** auf dem aktuellen Kopf: alle fünf Checks `success`,
einschliesslich der Isolationstests, die die volle Suite fahren.

**Nicht gemergt.** Der Review-Bot hat einen P2-Befund, und er trägt —
nachgemessen, nicht nach Schwere beurteilt. Es ist exakt das Restrisiko, das
ich zwei Stunden vorher selbst als „bewusst getragen" in den Code geschrieben
hatte: F5-2a verlangt Eindeutigkeit über VIER unabhängige Sequenzen, die
PostgreSQL nicht garantiert. Drei Spuren sind unabhängig auf dieselbe Stelle
gekommen.

Gemessene Gruppenabstände im vollen Lauf:

| Gruppenpaar | Abstand | vom Test gebraucht? |
|---|---|---|
| etagen [15–17] ↔ belehrungen [41–43] | **24** | **NEIN** |
| belehrungen ↔ mitarbeiter [168–173] | 125 | JA |
| etagen ↔ mitarbeiter | 151 | NEIN |
| studios [500193–195] ↔ alles | ~500.000 | JA |

Das nächstliegende Risiko sitzt auf einem Paar, das der Test nicht braucht.
Das einzige knappe NÖTIGE Paar wird künftig kollisionsfrei konstruiert statt
auf Abstand gehofft. Warum das vor den Merge gehört: diese Suite ist auf dem
Live-Server Deploy-Gate — ein Fehlalarm darin blockiert Auslieferungen aus
einem Grund, der mit dem Beitrag nichts zu tun hat.

**Planprüfung F6: fünf Befunde, vier getragen** (Einzelheiten in
`ASTRA-LAEUFE.md`). Der wichtigste war einer gegen mich: meine geplante
Einschränkung hätte MEHR geschwächt als behauptet — die heutige Mengenprüfung
fängt auch `const maC = maB;`, wo die Gruppenlänge gleich bleibt und nur die
Menge schrumpft. Fassung 2 prüft deshalb zwei Ebenen.

**Eigene Berichtigung:** Der Befund „Abfrage ohne `studio_id`" ist heute zum
DRITTEN Mal gemeldet worden, und die Ursache war mein eigener Prüf-Vorspann —
er zitierte die Regel ohne die Einschränkung auf Tabellenabfragen. Die Spuren
haben korrekt angewandt, was ich ihnen geschrieben habe. Der Vorspann liegt
jetzt als `tools/gegenleser-vorspann.txt` im Repo.

## 19.09.2026, 04:45 — Takt: Agent läuft, nur Stand

F6 Fassung 2 ist beauftragt und im Bau (F6-1 einzeln, F6-2+F6-3 in EINEM
Commit — getrennt wäre der Zwischenstand absichtlich rot). Der Beitrag ist
offen, CI auf dem aktuellen Kopf vollständig grün; gemergt wird erst, wenn der
Bot-Befund nachgezogen ist.

**Widerspruch im Takt-Prompt, gemessen — er gehört korrigiert.** Der Prompt
nennt als Sollwert des Marker-Scans „Im Belehrungssystem-Repo: 2, beide in der
CLAUDE.md-Prosa". Nachgemessen sind es **17 Treffer in 8 Dateien** — und das
ist richtig so: die CLAUDE.md hat am 16.09.2026 ausdrücklich festgehalten,
dass in DIESEM Repo die ZAHL kein Sollwert mehr ist, weil der Scan hier
mitzählt, wie oft wir über ihn schreiben. Die Bedingung lautet dort: *jeder
Treffer ist Prosa, keiner steht in ausführbarem Code.* Gemessen: alle 17
stehen in `.md`-Dateien, **keine einzige in ausführbarem Code** — Bedingung
erfüllt.

Nach der Vorrangregel des Takt-Prompts selbst gilt die CLAUDE.md, und der
Prompt-Text gehört nachgezogen. Ich ändere ihn nicht selbst: er ist die
Vorgabe des Betreibers, nicht meine. Er steht hier, damit die Zahl nicht beim
nächsten Lauf als Befund verbucht wird, der keiner ist.

## 19.09.2026, 05:40 — GEMERGT

Der Mandantengrenzen-Beitrag ist auf `master`. Squash-Commit `6ee7b15`,
20 Commits, 7 Dateien, 1748+/22−. Botschaft zurückgelesen: sie endet genau an
`-- Ende der Botschaft --`, kein Markup hineingeraten.

**Mein eigener Prüfgang vor dem Merge, alles selbst gemessen:**

| | |
|---|---|
| volle Suite | `SUITE_EXIT=0`, null Kreuze, die Datei 191/0 |
| Dateizahl-Ritual | 338 = 338, `diff` EXIT 0 (breites Sieb) |
| `npm run lint` | EXIT 0, keine Ausgabe |
| Marker-Scan | keine Nicht-Prosa-Treffer |
| `git status` | leer, Zweig nicht hinter master |
| Bot-Kommentare | ein Thread, erledigt und überholt |
| CI | fünf Checks `success` auf `e7a0aea` |

**Zwei Gegenproben als Stichprobe selbst nachgemessen**, nicht dem Bericht
geglaubt:

* **H2b** (`const maC = maB;`) → `190 PASS / 1 FAIL`, wörtlich
  „Länge 6 (soll 6), Menge 5, Duplikate: maB=maC=25". Genau der Fall, den
  meine erste Auftragsfassung durchgelassen hätte und den die Planprüfung
  gefunden hat.
* **H4** (Kollision auf einem NICHT geprüften Paar) → `190 PASS / 1 FAIL`,
  **F6-1 bleibt GRÜN**, die Ausgabe zeigt die Kollision wörtlich mit
  `etageA 28` und `belA 28`. Das grüne Teilergebnis IST hier der Beleg: die
  Einschränkung ist wirksam, nicht bloss behauptet.

**Fixturlage nach der Änderung, im vollen Lauf gemessen:** studios
500193–195, etagen 15–17, mitarbeiter 168–173, belehrungen **175–177**
(vorher 41–43). Der Abstand `mitarbeiter ↔ belehrungen` ist damit nur noch 2 —
und das ist richtig so: er wird seit F6-2 **konstruktiv erzwungen**
(`belA > grösste Mitarbeiter-ID`), nicht mehr über einen Abstand gehofft.
Ein kleiner Abstand aus Konstruktion ist sicherer als ein grosser aus Zufall.

**Offen: Deploy-Lauf und `tools/live-check.sh`.**

## 19.09.2026, 05:50 — AUSGELIEFERT, Runde abgeschlossen

**Deploy-Lauf 427: `success`, `head_sha 6ee7b156…`** — genau der Merge-Commit,
nicht ein älterer. **`tools/live-check.sh`: EXIT 0**, vier Punkte grün
(Landingpage, Echtheitsprüfung, Abweisung auf der Studio-Subdomain, Handbuch
2.9.11), zwei ehrlich als NICHT geprüft ausgewiesen: die Zertifikatslaufzeit
(der Egress-Proxy signiert jede TLS-Verbindung aus dieser Umgebung neu, gemessen
würde dessen eigenes Zertifikat) und der interne Health-Endpunkt (von aussen
nicht erreichbar; serverseitig prüft ihn `ops/health-gate.sh` bei jedem Deploy).

### Was diese Runde gekostet hat und was sie gelehrt hat

Fünf Bau-Runden für zwei Produktivcode-Änderungen von zusammen 90 Zeilen. Die
Absicherung drumherum wuchs auf 191 Zusicherungen — und **jede einzelne Runde
ab der dritten wurde durch einen Fehler in MEINEM Auftragspapier ausgelöst,
nicht durch einen Fehler im Code**:

| Runde | mein Fehler | gefunden von |
|---|---|---|
| F4 | H-Matrix nur für M2 gebaut, dieselbe Frage für M1 nie gestellt | mir selbst, beim Nachmessen |
| F5 v1 | Untergrenzen unbewacht, Löschung ohne Nachweis, Zahl der Zusicherungen widersprüchlich | Planprüfung (3 von 3) |
| F5 v2 | absolute ID-Grenzen, die nur beim Einzellauf gelten | dem vollen Suite-Lauf — die Planprüfung hatte sie durchgelassen |
| F6 v1 | die Einschränkung hätte MEHR geschwächt als behauptet | Planprüfung (4 von 5) |

**Die Lehre ist nicht „Planprüfungen finden alles".** Genau die Runde, in der
sie nichts fand (die absoluten Grenzen), hat die teuerste Nacharbeit ausgelöst.
Eine Planprüfung findet, was am Papier erkennbar ist; eine Unverträglichkeit mit
338 anderen Testdateien ist es nicht. Dafür gibt es nur den vollen Lauf.

**Die zweite Lehre betrifft das Delegieren.** Der Ausführende der F5-Runde hat
gebaut wie beauftragt, den Fehlschlag gemeldet und die Behebung ausdrücklich
NICHT selbst vorgenommen, weil sie eine Entscheidung war. Genau das ist der
Grund, warum der Fehler gefunden wurde statt geglättet.

### Nächstes

Die 13 bestätigten Befunde des Sicherheits-Durchgangs vom 18.09.2026
(`plaene/sicherheits-durchgang-18-09-2026.md`) sind **alle ungemessene
Behauptungen** und werden vor dem Bauen einzeln nachgemessen. Die zwei als
blockierend eingestuften zuerst:

* `routes/belehrungen.js:826` — die Einmal-Freischaltung wird hart gelöscht,
  BEVOR der fehleranfällige PDF-Schritt läuft
* `routes/admin/geraete.js:4123`

Daneben offen und bewusst nicht gebaut: die acht `fetch`-Aufrufer ohne
`Accept`, der injizierbare Logger statt des globalen `console.error`-Austauschs,
B9 (`httpOk`-Spread-Reihenfolge), B10-Rest (138 `listen(0)`-Stellen),
B11 (`wantsJson()`-Vereinheitlichung).

## 19.09.2026, 06:45 — neue Runde: Einmal-Verbrauch vor fehlbarem Schritt

Zweig `claude/freischaltung-verbrauch-rueckgabe` (von master `6ee7b15`).
Auftragspapier: `plaene/auftrag-freischaltung-verbrauch.md`.

**Der Hauptbefund ist nachgemessen und in drei Punkten schärfer als gemeldet.**
`routes/belehrungen.js:826` löscht die Einmal-Freischaltung ausserhalb jeder
Transaktion und VOR dem fehlbaren PDF-Schritt; der Fehlerpfad (`:898`) nimmt
nur den Unterschriften-Eintrag zurück. Zusätzlich gefunden: der Kommentar
darüber behauptet die Vollständigkeit der Rücknahme, niemand liest den
`rowCount`, und `catch {}` verschluckt auch ein Scheitern des DELETE selbst.
Vorbild im eigenen Bestand, das es richtig macht: `core/defekt_mailer.js`
`claimZurueck()`.

**Die Lage hat sich seither geändert: es ist eine KLASSE mit VIER
Fundstellen, nicht ein Einzelbefund.** Die zweite Prüfspur hat drei weitere
geliefert, alle von mir selbst nachgemessen und alle getragen:

| Fundstelle | was passiert, wenn der zweite Schritt scheitert |
|---|---|
| `routes/admin/mitarbeiter.js` ~856/862 | Freischaltungen und offene PIN-Links sind per Autocommit weg, die `db.tx` mit dem eigentlichen `DELETE FROM mitarbeiter` rollt zurück → Mitarbeiter bleibt, seine Zugänge sind dauerhaft gelöscht |
| `routes/belehrungen.js` ~1455/1469 | alte Einweisung auf `aktiv=0`, INSERT der neuen scheitert → **gar keine aktive Einweisung** mehr |
| `routes/belehrungen.js` ~1614/1641 | alter Ersthelfer-Nachweis auf `inaktiv_seit`, INSERT scheitert → Studio hat auf dem Papier **keinen Ersthelfer** |

Alle drei sind blankes `db.run`, also Autocommit. Nach der eigenen Regel
(„wer EINEN Eintrittspunkt absichert, hat nicht die Eintrittspunkte
abgesichert") muss das Auftragspapier entsprechend wachsen — das steht als
nächstes an, sobald die Planprüfung zurück ist.

**Eine Positivkontrolle für den PRÜFER, nicht für den Code.** Der Kundschafter
hatte `routes/wartung.js:1628` als fünften Kandidaten gemeldet — formgleich
(`SET mail_gesendet_am=NULL` vor einem Mailversand), inhaltlich aber das
Gegenteil: eine FREIGABE des Doppelversand-Schutzes, kein Verbrauch. Ich habe
die Stelle ohne Hinweis mit ins Bündel der zweiten Spur gelegt. Sie hat sie
von selbst korrekt einsortiert („Setzt `mail_gesendet_am` auf NULL (Freigabe)
vor Senden; als korrekt eingestuft"). Damit ist ihre Richtungsargumentation
auf dieser Achse einmal belegt — an EINEM Fall, also eine Beobachtung, keine
Eigenschaft.

**Läuft gerade: eine A/B-Messung `max` gegen `xhigh`** (Betreiber-Frage
„ist max oder xhigh besser?"). Identisches Bündel, identischer Prompt,
programmatisch belegt byte-gleich — einziger Unterschied ist
`reasoning.effort`. Verglichen werden Befundzahl, davon nach EIGENER
Nachmessung getragen, Überschneidung, Kosten und Dauer. Vorhergesagt habe ich
vorab: kein grosser Unterschied, weil der Auftrag eng und das Material klein
ist. Die Vorhersage steht schriftlich, damit sie hinterher nicht angepasst
wird.

## 19.09.2026, 07:15 — Verfahren gemessen statt behauptet

Drei Dinge umgesetzt (Betreiber: „dein Vorschlag umsetzen"):

**1. Kreuzverhör ist jetzt BERATEND, nicht gattend** — in der CLAUDE.md
festgeschrieben. Ich hatte es eine Stunde vorher noch als Filter vorgeschlagen
(„nur was das überlebt, kommt zu mir"); das war falsch. Begründung steht dort
mit der externen Messung (bis zu drei Viertel echter Befunde verworfen in
genau unseren Klassen) und mit dem eigenen Piloten (0 von 7 widerlegt).

**2. Mutation Testing gemessen, nicht diskutiert** —
`plaene/mutation-testing-messung-19-09-2026.md`. Kurz: der erste Versuch
scheiterte strukturell (Stryker instrumentiert die Quelle, unsere
quelltextlesenden Wächter schlagen darauf an — betrifft acht Wächter am
gemeinsamen Scanner). Der zweite lief: `core/2fa.js`, 130 Mutanten, 35 s,
Mutation Score 63,8 %. **Kein einziger geprüfter Überlebender war ein
Sicherheitsfehler**, die meisten sind äquivalent.

Dabei habe ich mich selbst blamiert und es aufgeschrieben: ich hielt einen
Überlebenden für ein falsches Negativ des Werkzeugs und hatte in Wahrheit eine
ANDERE Teilbedingung derselben Zeile mutiert. Zeile 133 hat drei mutierbare
Bedingungen. **Ohne Spaltenangabe ist ein Mutantenbericht nicht nachmessbar.**

**3. Fachnamen festgehalten** — Mutation Testing, kompensierende Transaktion /
Saga (Gegenmittel: Idempotenzschlüssel und Generationsnummern), Trust Boundary
(CWE-501/602). Bemerkenswert: beide Prüfspuren haben das Saga-Gegenmittel
unabhängig vorgeschlagen, ohne dass es ihnen jemand sagte.

**Offen und unverändert:** das Auftragspapier zur Einmal-Freischaltung muss neu
geschrieben werden. Der Blank-PNG-Befund ist scharf nachgemessen und kippt den
bisherigen Entwurf — die Behebung muss mit der serverseitigen Signaturprüfung
anfangen, nicht mit der Reihenfolge des Verbrauchs. `sharp` ist bereits direkte
Abhängigkeit, eine neue Bibliothek im Sicherheitspfad braucht es also nicht.

## 19.09.2026, 07:37 — Auftragspapier neu geschrieben, zehn eigene Messungen

Der Betreiber hat gefragt, ob auf dem Server etwas zu tun ist. **Nein:**
`master` steht auf `6ee7b15`, das ist genau der Stand aus Deploy-Lauf 427
(`success`); beide Repos sauber und gepusht, der gymdocu-Zweig noch leer.

`plaene/auftrag-freischaltung-verbrauch.md` ist vollständig ersetzt (`24e05fc`,
Nachtrag `9804591`). Die alte Fassung fing bei der Reihenfolge des Verbrauchs
an — falsch herum: eine Behebung, die nur die Reihenfolge richtet, sieht fertig
aus und lässt das Loch offen.

**Zehn Messungen, alle selbst durchgeführt.** Drei davon haben den Entwurf
verändert, statt ihn nur zu bestätigen:

* **M2 — die vorhandene Test-Fixtur IST die Angriffsnutzlast.** Chunk-weise
  nachgemessen: die Konstante `PNG` in drei Testdateien ist ein 1×1-RGBA-PNG,
  vollständig durchsichtig, mit KAPUTTER IDAT-Prüfsumme (`crc=0x5ef32a3a`,
  tatsächlich `0xa5f64540`). Die Suite führt den Angriff seit jeher vor und
  belegt mit einer leeren Signatur den vollen Erfolgspfad. Nebenbefund: sharp
  (libpng) lehnt sie ab, pdf-lib ignoriert CRCs und nimmt sie — die neue
  Prüfung ist also strenger als `embedPng`, in der richtigen Richtung.
* **M4 — das DELETE ans Ende zu ziehen VERBREITERT ein Rennen** mit
  `schalteAlleFrei()` beim Hochladen einer neuen Dokumentversion. Gegenmittel
  ist eine Generationsprüfung auf `freigeschaltet_am`. Gemessen, dass
  Gleichheit dafür trägt und Ordnung nicht: die Spalte wird von zwei Wegen in
  zwei unvereinbaren Textformaten befüllt (`2026-09-19 09:26:06` gegen
  `2026-09-19 07:26:06.959074+00`).
* **M7 — eine PNG-Bombe passt heute in den 1-MB-Rumpf und `embedPng` frisst
  sie:** 6000×6000 sind 0,11 MB Datei, 1952 ms und **458 MB RSS**. Die Prüfung
  VOR `embedPng` mit Deckel verkleinert diese vorhandene Angriffsfläche, sie
  schafft sie nicht. Verkleinern vor dem Zählen ist dabei billiger als ein
  voller Dekode (108 ms / 101 MB gegen 508 ms / 179 MB) und begrenzt den
  Aufwand unabhängig von der Eingabegrösse; echte dünne Striche überleben es
  (ein 40×2-Haken auf 6000×4000: 80 Tintenpixel voll, 24 nach dem Verkleinern).

**M9 — den riskantesten Teil habe ich vorgemessen, statt ihn zu behaupten.**
Eine Stellvertreter-Prüfung an der geplanten Stelle eingebaut und in beide
Richtungen gemessen: `identitaet` 5/0 und `messfehler` 46/0 bleiben
unverändert; `gelesen` fällt auf 12/14 und `version` stürzt ab; mit der inkten
Fixtur sind beide wieder 26/0 und 17/0, `client_ip` 80/0. Damit ist belegt,
dass der Fixtur-Tausch die vollständige Gegenmassnahme ist und nicht eine
Abschwächung der Prüfung. Zurückgenommen aus unabhängigen `cp`-Kopien, `diff`
EXIT 0 für alle vier Dateien, `git status` leer, Marker-Scan ohne Treffer in
ausführbarem Code.

**Planprüfung läuft, beide Spuren parallel** (gpt-5.6-sol mit `xhigh`,
`store:false`, Streaming; deepseek-v4-pro als zweite Lesespur), Bündel
**gezählt statt geschätzt: 127.232 Token** über
`POST /v1/responses/input_tokens`.

**Erster Messwert kam aus der Gegenlesung selbst:** DeepSeeks erster Lauf kam
mit `finish_reason: "length"` zurück — alle 16.000 Completion-Token gingen ins
Nachdenken, für die Antwort blieb nichts. Genau die Klasse aus der CLAUDE.md
(„keine Befunde" heisst dann „niemand hat geprüft"). Aufgefallen nur, weil der
Status bei JEDEM Aufruf geprüft wird. Neustart mit `max_tokens: 64000`; der
abgebrochene Lauf bekommt in `ASTRA-LAEUFE.md` eine Zeile mit Strichen und
seine Kosten, keine Null.

**Takt 07:40 — beide Gegenlesungen laufen noch** (sol 7:24 min, DeepSeek 3:12
min Laufzeit), deshalb nach der Regel nichts angefasst ausser diesem Stand.
Zwei Korrekturen am eigenen Eintrag oben: die Überschrift trug 07:50 und war
damit in der Zukunft (tatsächlich 07:37); und die Zahl der Messungen ist
inzwischen elf, nicht zehn — M6 (sharp als harte Startabhängigkeit) ist
nachträglich gemessen statt geschlossen worden, mit Positiv- UND
Negativkontrolle (`routes/module.js` fängt denselben Ausfall ab und lädt
weiter, es scheitert also nicht einfach alles).

Zum Marker-Scan: der Takt-Prompt nennt für dieses Repo weiterhin den Sollwert
**2**. Maßgeblich ist die CLAUDE.md (16.09.2026): hier ist die ZAHL kein
Sollwert, weil wir über den Marker schreiben und jede neue Notiz sie anhebt.
Die Bedingung lautet „jeder Treffer ist Prosa, keiner steht in ausführbarem
Code" — gemessen: 9 Dateien, ausnahmslos Prosa, keine Zeile in Code.

Eine Wegwerf-Datenbank `gymdocu_basis_test` steht noch (NICHT `gymdocu_test`,
die Suite ist davon unberührt); sie wird nach der Nacharbeit weggeräumt.

## 19.09.2026, 08:20 — Beide Planprüfungen ausgewertet, Bauauftrag läuft

**Elf Befunde aus zwei Spuren, NULL Überschneidung, neun nach eigener
Nachmessung getragen.** Einzelheiten in `ASTRA-LAEUFE.md` und in den
Nachträgen M11–M16 des Auftragspapiers.

Der wichtigste: **ein blockierender Fehler in MEINER Lesereihenfolge.** Mein
Plan las die Belehrungszeile vor der Freischaltungs-Generation — damit wäre
genau das Rennen offengeblieben, gegen das die Generationsprüfung antritt (neue
Version fährt dazwischen, wir lesen die NEUE Generation, signieren das ALTE
Dokument und löschen am Ende die neue Pflicht). Umgedreht fällt jeder Ausgang
auf die sichere Seite.

Weiter getragen und eingearbeitet: eine eigene Gegenprobe von mir, die NIE rot
werden konnte (die Fixtur hat Kanalwert 0, also zählen `< 250` und `< 1`
dieselben Pixel — Grenzfixtur mit vier unterscheidbaren Zahlen ergänzt); zwei
Zusicherungen, die eine Konstante erfüllt hätte; ein ungedeckelter
Speicherverbrauch (neuer Beitrag B4: das GEPRÜFTE Bild wird eingebettet, nicht
das eingeschickte — 182,3 gegen 17,1 MB RSS-Zuwachs, je eigener Prozess
gemessen); zwei falsche Bestandsbehauptungen von mir; und ein zusätzlicher
ernster Befund, der ein eigenes Papier bekommt (`/neue-version/:id` ist selbst
nicht atomar und löscht im Fehlerfall die Datei, auf die die schon committete
Belehrungszeile zeigt).

**Das ist der Beleg für die Regel vom 18.09.2026 an einem eigenen Fall:** jeder
dieser Punkte hätte sonst eine Bau-Runde gekostet. Gebaut war zu diesem
Zeitpunkt noch nichts.

Eine eigene Korrektur unterwegs: meine erste Speichermessung lief in EINEM
Prozess und zeigte scheinbar mehr Verbrauch für die bessere Variante. RSS ist
innerhalb eines Prozesses kumulativ — ein Rückgang ist so gar nicht messbar.
Erst je ein eigener Prozess zeigt die Richtung.

**Jetzt läuft der Bauauftrag** über den Executer in `/home/user/gymdocu`,
Zweig `claude/freischaltung-verbrauch-rueckgabe`. Vier Beiträge (B1
serverseitige Signaturprüfung, B2 Verbrauch ans Ende mit Generationsprüfung,
B3 Aufräum-DELETE nur für ungehashte Zeilen, B4 kanonisches Bild einbetten)
plus neuer Wächter mit elf Zusicherungen und dreizehn Gegenproben.
**Solange er läuft, wird in diesem Arbeitsbaum nichts angefasst.**

## 19.09.2026, 08:41 — Takt: Bau läuft, Gesamtdurchgang entschieden

**Betreiber-Entscheidung (wörtlich): „aktuellen Lauf fertig machen und dann
alles risikoorientiert."** Der Plan dafür liegt als
`plaene/durchgang-risikoorientiert.md`: 688 Dateien / 17,2 MB ≈ 4,6 Mio Token,
14 Bündel nach Umkehrbarkeit sortiert, sechs feste Fragen je Bündel, zwei
Spuren. **Startbedingung ist der Merge UND die Auslieferung des laufenden
Beitrags** — vorher wird damit nicht angefangen.

Vor Bündel 1 steht ein eigener Bauauftrag: `tools/gegenleser-repo.js` setzt
`store: false` NICHT (gemessen 18.09.2026). Bei einem Durchgang dieser Grösse
bliebe sonst der halbe Quelltext des Repos auf fremden Servern liegen.

Zwei Zahlen in der CLAUDE.md berichtigt: dort standen 502 Dateien / 11,96 MB
(nachgezählt 688 / 17,2 MB), und das Verhältnis Bytes→Token steht jetzt als
Messung (3,71, aus dem Bündel vom 19.09.) statt als Faustregel.

**Der Executer arbeitet noch** in `/home/user/gymdocu`, Zweig
`claude/freischaltung-verbrauch-rueckgabe`. Gepusht sind bereits B2, B3, B4,
der Wächter und eine Nachbesserung am Wächter; eine Datei ist noch
uncommittet. Nach der Taktregel wird in diesem Arbeitsbaum nichts angefasst,
bis seine Benachrichtigung da ist — auch nicht lesend messen. Danach:
vollständiges Prüf-Ritual, und erst dann eine Meldung mit Link.

## 19.09.2026, 09:41 — Takt: drei Prüfungen laufen parallel

Der Bau ist fertig und gepusht (`c206781`, 9 Commits auf
`claude/freischaltung-verbrauch-rueckgabe`). Nach der Taktregel wird nichts
angefasst, solange etwas läuft — hier laufen drei Dinge:

1. **meine eigene volle Suite** (der Bericht des Executers ist kein Ersatz),
2. **Gegenlesung Spur 1 über den fertigen Diff** (Bündel gezählt: 122.152 Token),
3. **Gegenlesung Spur 2 über denselben Diff.**

**Was ich beim eigenen Diff-Lesen gefunden habe** (beides ist bereits
nachgebessert, Commit `c206781`):

* `test_feature_signatur_verbrauch.js:518` war `ok(..., true)` — eine fest
  verdrahtete Zusicherung, die nicht rot werden kann. Ausgerechnet die
  Fehlerklasse, gegen die dieser Beitrag antritt. Ersatzlos gestrichen; die
  „zweite Richtung" ist in 7b echt gemessen.
* Ein Kommentar schrieb eine Messung MIR zu, die ich nicht gemacht hatte
  (450 Tintenpixel). Der Wert stimmt — ich habe ihn nachgemessen —, die
  Zuschreibung nicht.

**Die Lücke, die der Executer SELBST gemeldet hat**, ist geschlossen: ein
`catch {}` um das `t.run(DELETE …)` blieb unsichtbar, weil Zusicherung 9b nur
den Fall „`auditAppend` wirft NACH erfolgreichem DELETE" herstellt. Jetzt gibt
es eine zweite Verhaltensprobe, bei der das DELETE SELBST wirft. Gemessen:
vorher schloss dort **gar nichts** (56/0 bei der Mutation), jetzt fallen drei
von fünf neuen Teilzusicherungen.

**Die riskanteste Stelle des Diffs habe ich selbst nachgemessen:** die
Transaktion nimmt den Studio-Advisory-Lock jetzt ZUERST und die Zeilensperren
danach — vorher umgekehrt. Über alle `db.tx`-Blöcke in `routes/` und `core/`
geprüft: die geänderte Transaktion ist die EINZIGE, die eine der beiden
Tabellen sperrt und darin `auditAppend` ruft; beim Mitarbeiter-Löschen liegt
das Audit ausserhalb der Transaktion. **Kein neuer Kreis.**

**Zwei eigene Vorgaben sind gefallen** (M17/M18 im Auftragspapier): meine
Gegenprobe-Methoden K2 und K5 beruhten auf ungemessenen Behauptungen über die
Datenbankschicht. Der Ausführende hat beide gemessen und widersprochen.

## 19.09.2026, 10:41 — Takt: PR #460 steht, wird NICHT gemergt (P1 trägt)

Der Beitrag ist gebaut, geprüft und liegt als PR. **Alle fünf CI-Checks auf
`af05bdc` sind `success`** — einschliesslich der Isolationstests, die den neuen
Wächter auf einem fremden Runner mit frischer Datenbank fahren.

**Gemergt wird trotzdem nicht.** Der Review-Bot meldet einen P1 (Sicherheit),
und er trägt: ein einzelnes FAST WEISSES Pixel (Wert 249) zählt als Tinte und
kommt durch. Das ist schärfer als das Restrisiko, das ich in M11 selbst
benannt hatte — meins war ein SCHWARZER Punkt.

**Wichtiger als der Befund ist, was die Nachmessung über seinen VORSCHLAG
ergab.** Der Bot schlägt „mehr Tinte oder ein dunkelheitsgewichtetes Mass" vor.
Am Zeichenmass gemessen ist echte Tinte aber HELL — das Verkleinern mittelt sie
weg:

    Raster        Strich   Zeichenmass  dunkelster Wert  Pixel<128
    2048x1400     20x2     146x100             221           0
    2400x1200     600x3    200x100             196           0

Eine Dunkelheitsschwelle dort hätte **alle 19** gemessenen echten Fälle
abgewiesen — aus einer Sicherheitslücke wäre ein Totalausfall der
Unterschriftsfunktion geworden. Die Klasse „eine Behebung tauscht das
Gemeldete gegen etwas Schlimmeres", und diesmal an einem fremden Vorschlag.

**Richtig ist dieselbe Prüfung an einer ANDEREN STELLE.** In Originalauflösung
ist echte Tinte schwarz (dunkelster Wert 0, 4 bis 1800 Pixel unter 128),
während alle Angriffsvarianten bei 200–249 liegen und NULL Pixel unter 128
haben. Das kanonische Raster habe ich ebenfalls geprüft, weil es gratis gewesen
wäre — dort fallen sechs von vierzehn echten Fällen durch. **Die Stelle der
Messung entscheidet, nicht die Schwelle.**

Beauftragt sind damit zwei Kriterien, jedes dort gemessen, wo sein Mass etwas
bedeutet: Sichtbarkeit im Dokument am Zeichenmass (`< 250`), echte Tinte in
Originalauflösung (`< 128`). Kosten: 20 ms im Normalfall, 113 ms am Deckel
(`sharp.stats()` wäre mit 948 ms der schlechtere Weg gewesen).

**Nebenbefund über den Bot-Check:** sein Check-Run meldet `success`, während in
seinem Kommentar „not yet safe to merge" steht. Genau dafür gibt es die Regel,
seine Kommentare VOR den Checks zu lesen.

Eigener Check-in auf 11:07 geschoben, mit dem Grund im Text. Die
Wegwerf-Datenbank `gymdocu_basis_test` steht noch und wird nach dem Merge
abgeräumt.

## 19.09.2026, 11:11 — Signaturprüfung AUSGELIEFERT

Merge `4c4b729`, **Deploy-Lauf 428 mit genau diesem `head_sha` auf `success`**,
`tools/live-check.sh` EXIT 0 (vier Punkte grün; Zertifikatslaufzeit und
Health-Endpunkt wie immer ehrlich als „nicht von hier prüfbar" geführt).

**Die Lücke, die der Beitrag schliesst:** ein angemeldeter Studio-Benutzer
konnte ein gültiges, aber tintenfreies PNG als Unterschrift schicken — die
Route nahm es an, erzeugte ein „signiertes" PDF und löschte die
Belehrungspflicht. Trust Boundary (CWE-501/602).

**Was der Beitrag enthält:** serverseitige Tintenprüfung in ZWEI Stufen
(Sichtbarkeit am Zeichenmass, echte Tinte in Originalauflösung), Verbrauch der
Einmal-Freischaltung erst nach Erfolg mit Generationsprüfung, Aufräum-DELETE
nur für ungehashte Zeilen, und eingebettet wird das geprüfte Bild statt des
eingeschickten. Wächter mit **82 Zusicherungen**.

**Bilanz der Prüfung an diesem einen Beitrag:** vier Gegenlesungen (zwei am
Plan, zwei am fertigen Diff), zwei Bot-P1, insgesamt **22 Befunde, jeder
einzeln selbst nachgemessen**. Vier davon blockierend.

**Drei Befunde trafen MEINE eigenen Vorgaben:**
* eine falsche Lesereihenfolge, die die ganze Generationsprüfung wirkungslos
  gemacht hätte (M13),
* zwei Gegenprobe-Methoden, die ich behauptet statt gemessen hatte (M17/M18),
* eine Gegenprobe, die nie rot werden konnte, weil die Fixtur den gesuchten
  Unterschied gar nicht auslösen kann (M15).

**Zweimal hat ein VORSCHLAG des Prüfers nicht getragen, obwohl der Befund
zutraf** — und beide Male hätte blindes Übernehmen Schaden angerichtet:
1. `.threshold(0)` zum Weissmachen des Bildes ist bei sharp wirkungslos (24
   dunkle Pixel blieben). Übernommen hätte ich den blockierenden Befund als
   widerlegt abgehakt — eine Zeile, die jede Unterschrift aus jedem
   Nachweisdokument entfernt, bei 60 von 60 grünen Zusicherungen.
2. Die vom Bot vorgeschlagene Dunkelheitsschwelle am Zeichenmass hätte **alle
   19 gemessenen echten Signaturfälle abgewiesen** — aus einer
   Sicherheitslücke wäre ein Totalausfall der Unterschriftsfunktion geworden.

**Offen und ausdrücklich ausgeklammert** (jeweils eigenes Papier wert):
`signatur_hash` bindet das Bild nicht; nach einem Rollback bleibt eine
verwaiste PDF liegen; `/neue-version/:id` ist selbst nicht atomar und löscht
im Fehlerfall die Datei, auf die die bereits committete Belehrungszeile zeigt;
kein Nebenläufigkeitslimit auf dem Bildpfad (besteht unabhängig vom Beitrag —
der Verbrauch je Anfrage SINKT durch ihn von +182 MB auf +90 MB RSS).

**Als Nächstes:** der risikoorientierte Gesamtdurchgang
(`plaene/durchgang-risikoorientiert.md`), Betreiber-Entscheidung vom
19.09.2026. Erster Bauauftrag davor: `tools/gegenleser-repo.js`.

**BERICHTIGT 19.09.2026, 12:00 — der Satz, der hier stand, war falsch**
(„setzt `store: false` nicht"). Er stammte aus einer Messung vom 18.09.; das
Werkzeug setzt `store`, `reasoning.effort` und `truncation` seit Commit
`738558a`. Damit ist dieselbe überholte Prämisse an DREI Orten gestanden —
CLAUDE.md, Durchgangsplan und hier. Alle drei sind berichtigt. Die Hausregel
„dieselbe Aussage an zwei Orten" hat genau das vorhergesagt: eine Zustands-
aussage im Fliesstext veraltet lautlos, und zwar überall zugleich.

### Takt 12:00 — Auftragspapier Gegenleser-Streaming, zwei Planprüfungen laufen

Was WIRKLICH fehlt, ist `stream: true`. Das Werkzeug setzt ein Zeitlimit von
20 Minuten (`tools/gegenleser-repo.js:569`), während der Egress-Proxy eine
nicht-streamende Anfrage an `api.openai.com` bei **300,3 s** hart abschneidet —
ein konfigurierter Wert, der nicht wirken kann. Die Behebung von gestern hat
das sogar verschärft: mit `effort: xhigh` werden die Runden länger.

**Vier eigene Messungen am echten Endpunkt, bevor das Papier geschrieben war**
(zusammen unter 250 Token):

* **M1** `stream:true` + Funktionswerkzeuge + `store:false` + `truncation` +
  `metadata` zusammen: **HTTP 200**, ein Abschluss-Ereignis. Das war die eine
  offene Annahme — der 442-s-Lauf von heute früh trug keine `tools`.
* **M2** Das Antwortobjekt im Abschluss-Ereignis ist **formgleich** mit dem
  heutigen Körper: `function_call`-Felder `id/type/status/arguments/call_id/
  name`, `usage` mit `input_tokens`/`output_tokens`. Also ändert sich hinter
  `anfragen()` **nichts** — das macht den Beitrag klein.
* **M3** Form des `response.incomplete`: `status: incomplete`,
  `incomplete_details {"reason":"max_output_tokens"}`, `output[]` nur
  `["reasoning"]`.
* **M4** Das Werkzeug liest `status` **nirgends** (0 Fundstellen). Im
  gemessenen Fall fällt es laut aus, aber mit falscher Diagnose („kein Text"
  statt „Budget erschöpft"). Ob eine Kürzung auch hinter einem fertigen
  `function_call` landen kann, ist NICHT gemessen und wird nicht behauptet.

`max_tool_calls` fällt bewusst weg: keine `web_search` in diesem Werkzeug, und
eine ungemessene Obergrenze wäre genau die Klasse, die der Beitrag beseitigt.

Bündel **gezählt, nicht geschätzt**: `POST /v1/responses/input_tokens` →
**96.599 Token**, 24,1 % des Limits. (Verhältnis hier 3,55 Bytes/Token gegen
3,71 am Prosa-Bündel — Quelltext ist dichter.)

Zwei Spuren laufen parallel über dasselbe Bündel (sol und deepseek-v4-pro).
Begründung für die zweite Spur: durch dieses Werkzeug laufen ALLE Gegenlesungen
des kommenden Durchgangs — bricht es still, ist jede folgende Prüfung wertlos.

## 19.09.2026, 14:19 UTC — Nacharbeit zum Streaming-Umbau: sechs Befunde, vier davon eigene falsch-grüne Zusicherungen

Gegenlesung zu Commit `36524a7` (Streaming-Umbau) lieferte sechs Befunde
(N1–N6, Lauf 2,44 $, siehe `ASTRA-LAEUFE.md` „19.09.2026 — der Lauf, der
zugleich sein eigener Prüfstand war"), alle sechs nach eigener Nachmessung
getragen. **Der teuerste Befund ist eine Ironie:** der Beitrag gegen
falsch-grüne Zusicherungen hat selbst VIER ausgeliefert — jede einzeln
mutiert, jedes Mal 99 Haken / 0 Kreuze, EXIT 0 VOR der Behebung.

- **N1 (blockierend, behoben).** Der Einmal-Riegel (`fertig`/`abschliessen`)
  lag nur im response-Callback; `anfrage.on('error', ...)` (Anfrage-Ebene)
  lief komplett daran vorbei. Und die Zusicherung „LOEST GENAU EINMAL AUF"
  prüfte den ENDZUSTAND der Promise — eine native Promise schluckt ein
  zweites `reject()` nach `resolve()` lautlos, der Endzustand kann also
  einen von zwei Settle-Versuchen nie unterscheiden. Riegel in den äußeren
  Promise-Executor verschoben, `anfrage.on('error', ...)` läuft jetzt
  darüber, und die Zusicherung zählt zusätzlich über
  `process.on('multipleResolves', ...)` echte Settle-Versuche. GEGENGEPRÜFT:
  Riegel komplett entfernt → beide neuen Zusicherungen (GP7D, GP7E) werden
  ROT; nur die Anfrage-Ebene zurückgedreht → GP7E wird ROT, GP7D bleibt
  GRÜN (isoliert also genau die behobene Hälfte).
- **N2 (mittel, behoben — mit einer gemeldeten, NICHT behobenen
  Zusatzerkenntnis).** Der Selbsttest-Stub bildete einen Abbruch bisher als
  „nur aborted, dann Rücksprung" nach — eine Folge, die ein echter
  Node-22-Server nie erzeugt (GEMESSEN: `aborted → error → close`). Stub
  korrigiert, dazu ein fehlender `aborted`-Listener im Nicht-200-Zweig
  ergänzt (Symmetrie zum SSE-Zweig). **Gemeldet statt stillschweigend
  repariert:** weder GP7A noch der neue GP6B isolieren den
  `aborted`-Listener allein — GEMESSEN per Mutation: mit entferntem
  `aborted`-Listener bleiben beide Tests GRÜN, weil der gleichzeitig
  simulierte `error`-Listener denselben Fall fängt. Die drei Listener sind
  redundante Verteidigung für denselben Transportzustand, kein isoliert
  prüfbarer Einzelfall je Ereignisname — so in den Testkommentaren
  vermerkt, statt eine Isolation zu behaupten, die es nicht gibt.
- **N3 (mittel, behoben).** `GP2_BYTES` wurde per `Buffer.byteLength()` AUS
  der bewachten Fixtur berechnet — unabhängig vom Parser, aber nicht von
  der Fixtur. Jetzt ein von Hand ausgezähltes Literal (116). GEGENGEPRÜFT:
  ein Byte an die Fixtur ergänzt → Zusicherung wird ROT (116 erwartet, 117
  tatsächlich).
- **N4 (mittel, behoben).** Die effort-Zusicherung prüfte nur
  `typeof === 'string' && length > 0` — die FORM statt des WERTES. Jetzt
  ein Vergleich gegen einen unabhängig ausgewerteten zweiten Ausdruck
  (`process.env.GEGENLESER_EFFORT || 'xhigh'`, nicht über die Konstante
  `EFFORT` referenziert). GEGENGEPRÜFT: `EFFORT`-Default auf `low` gesetzt
  → Zusicherung wird ROT.
- **N5 (mittel, behoben).** GP10 suchte nur nach `--zweck` und dem
  Brief-DATEINAMEN. Brief-INHALT und eine eigene Diff-Fixtur bekamen eigene
  Marker, dazu ein wörtlicher Vergleich der Metadaten-WERTE (nicht nur der
  Schlüsselmenge). GEGENGEPRÜFT mit der im Auftrag genannten Mutation
  (`zweck: verlauf[0].content.slice(0, 500)`) → BEIDE neuen Zusicherungen
  werden unabhängig voneinander ROT.
- **N6 (niedrig, behoben).** Nach einem Abschluss-Ereignis wurde nur ein
  ZWEITES Abschluss-Ereignis abgelehnt; ein gewöhnliches Ereignis danach
  (z. B. ein delta) wurde still übernommen und beim Stromende als „sauber"
  gewertet. Jetzt lehnt JEDE weitere `data:`-Nutzlast nach dem Abschluss ab.
  Reine Härtung (drei echte Ströme: keine weitere data:-Zeile nach
  `response.completed`). GEGENGEPRÜFT: neue Ablehnung deaktiviert →
  Negativtest wird ROT, Positivkontrolle (nur Leerzeilen nach dem
  Abschluss) bleibt unabhängig davon GRÜN.

`ERWARTETE_FAELLE` auf 104 angehoben (99 + 5 neue Fälle: GP6B, GP7E, N6×2,
GP10-Metadatenwerte). `--selbsttest`: **104/104, EXIT 0.**

### Datiert offener Punkt aus dieser Nacharbeit

- **Alleinstehendes CR als SSE-Zeilenende** (aus derselben Gegenlesung
  gemeldet als „sollte behoben werden", vom Haupt-Agenten NICHT beauftragt).
  Die SSE-Spezifikation erlaubt es, aber gemessen über drei echte Ströme:
  null CR, nicht einmal CRLF. Gegen diesen Endpunkt nicht erreichbar, und
  ein Umbau des Zeilentrenners auf `\r\n|\r|\n` riskiert einen NEUEN Fehler
  an der Chunk-Grenze — genau die Klasse, die der Streaming-Umbau gerade
  behoben hat. Zeilentrenner in `anfragen()` bewusst unverändert gelassen.


## 19.09.2026, 15:20 UTC — #45 gemergt, Streaming-Umbau abgeschlossen

**Merge `812689e`.** Kein Deploy und kein live-check: der Beitrag liegt im
Belehrungssystem-Repo, das keine Auslieferung auslöst — nur GymDocu tut das.

**Ausbeute des Tages an diesem einen Beitrag: sechs Fehler**, von denen zwei
schon im Bestand lagen (zerstörte Umlaute an der Chunk-Grenze, eine für immer
hängende Promise) und vier falsch-grüne Zusicherungen waren — ausgerechnet im
Beitrag gegen diese Klasse. Jede einzeln mutiert, jedes Mal 99/0 grün.

**Drei Prüfspuren, drei verschiedene Klassen — und das ist der Befund, der
für die Arbeitsweise zählt:** der Gegenleser fand die nicht-fallenden
Zusicherungen, der Review-Bot einen P1, den keine andere Spur hatte, DeepSeek
einen blockierenden Fehler in meinem eigenen Auftragspapier. Keine Spur hätte
die Funde der anderen gemacht.

**Dreimal an einem Tag trug ein Befund, aber sein Behebungsvorschlag nicht.**
Beim Bot hätte sein Vorschlag die Klasse wieder eingeführt, gegen die der
Beitrag antritt; er hat die Gegenbegründung als dauerhafte Review-Regel
übernommen.

**Eigener Messfehler, als Regel eingetragen:** die erste P1-Messung hatte den
Wachhund-Timer IM Prüfprozess — der hält die Ereignisschleife selbst am Leben,
das Ergebnis war mit und ohne Defekt garantiert. Von aussen neu gemessen:
ohne `destroy()` Exit 124 nach 2006 ms, mit `destroy()` Exit 0 nach 58 ms.

### Offen, Stand jetzt

* **Greptile-Kontingent verbraucht** (50 Credits, Freiplan). Der Review-Bot
  prüft bis zum Zurücksetzen nichts mehr. Betreiber-Entscheidung, ob
  aufgestockt wird. Falls nein: bei Beiträgen an Wächtern und Zusicherungen
  läuft künftig BEIDES — Gegenleser und DeepSeek — statt abwechselnd.
* **Alleinstehendes CR als SSE-Zeilenende** — bewusst nicht gebaut,
  Begründung im Abschnitt vom 14:19 UTC.
* **Der DeepSeek-Adapter ist weitgehend hinfällig** (`plaene/auftrag-deepseek-adapter.md`):
  DeepSeeks Responses-API ist formgleich mit OpenAIs. Was bleibt, sind
  Basis-URL, Modellname (`deepseek-flash`, nicht die auslaufende
  Weiterleitung) und Schlüssel. Neu zu schreiben, klein.
* **`plaene/befund-datei-vs-commit.md`** — zwei gemessene Stellen im GymDocu-
  Repo, an denen eine unwiderrufliche Dateiaktion auf der falschen Seite eines
  fehlbaren Schritts steht. 25 weitere Fundorte sind FUNDORTE, nicht Befunde.

### Als Nächstes

Der risikoorientierte Durchgang (`plaene/durchgang-risikoorientiert.md`),
Betreiber-Entscheidung 19.09.2026, jetzt mit der ergänzten Vorgabe: **jedes
Bündel bekommt BEIDE Spuren mit VERSCHIEDENEN Fragen** — sol sucht erreichbare
Zustände im Kontrollfluss, DeepSeek bekommt das ganze Teilsystem (1M Kontext)
und die Frage „was verbietet das hier nicht, und wo geht eine Folgerung weiter
als ihre Messung?". Mitschreiben, welche Spur was fand; nach vierzehn Bündeln
ist das eine Messung statt einer Anekdote.

---

## 19.09.2026, ~18:20 UTC — Bündel 1 vollständig gemessen, erster Bauauftrag draussen

### Was fertig ist

**Bündel 1 des Durchgangs (Geräte-Lebenszyklus) ist VOLLSTÄNDIG nachgemessen:
11 von 11.** Zwei Spuren über byte-identisches Material (354.231 gezählte
Token), nur die Frage verschieden, **Überschneidung null**. Ergebnis:
**9 getragen, 1 gefallen, 1 teilweise** (Beobachtung richtig, Schwere falsch).

Die Einzelurteile stehen in **`plaene/durchgang-befunde.md`** — je Befund
Fundstelle, wörtliche Behauptung, eigene Messung MIT Ausgabe, Ergebnis,
Entscheidung. `ASTRA-LAEUFE.md` trägt nur noch die Lauf-Zahlen; die Trennung
ist Absicht (dieselbe Aussage an zwei Orten).

**Zwei Zahlen, die für die Arbeitsweise zählen:**

* sol 4 von 6 voll getragen, deepseek 5 von 5 — und der EINZIGE als
  *blockierend* gemeldete Befund kam von der teuren Spur und FIEL. Ein
  Bündel; das trägt keine Aussage über die Spuren.
* **2,52 $ fürs Finden gegen rund 85 Minuten fürs Messen.** Auf 15–20 Bündel
  hochgerechnet: 38–50 $ gegen **20–28 Stunden eigene Messzeit**. Wer mehr
  Bündel ansetzt, kauft Messzeit, nicht Geld.

### Was daraus gebaut wird — fünf Beiträge, einer davon unterwegs

Die neun getragenen Befunde zerfallen in fünf Klassen. Sie werden NICHT in
einem Beitrag gebaut: zwei davon ändern Verhalten mit Breitenwirkung, einer
berührt die Sperrordnung, vor der CLAUDE.md ausdrücklich warnt.

| | Beitrag | Befunde | Stand |
|---|---|---|---|
| 1 | **Eingabewache** — eine Quelle für ID- und Textfeldprüfung | B1-07, B1-08 | Auftragspapier geschrieben, **Planprüfung läuft** |
| 2 | **Schreibwege** — Zustandsbedingung + `rowCount`, Transaktionsklammer | B1-05, B1-03 | offen |
| 3 | **`ladeBestand()`** — stilles falsches Ergebnis | B1-02 | offen |
| 4 | **Namensinvariante Seilgeräte** — ungleiche Prüfung, verschiedene Sperrschlüssel | B1-09, B1-10 | offen, **braucht zuerst die Lock-Ordnungsanalyse** |
| 5 | **Zusicherung mit eigenem Sollwert** | B1-04 | offen, kann mitfahren |

**Vorlage an den Betreiber statt Bauauftrag: B1-11.** `routes/admin/geraete.js`
führt eine eigene Escaper-Kopie (162 Verwendungen), die Schwesterdatei bezieht
sie aus `core/html-escape`, und der Wächter ist für die erste blind. Der Kopf
von `core/html-escape.js` legt die Umstellung aber ausdrücklich als
**Betreiber-Entscheidung** fest. Vorgelegt, nicht gebaut.

### Beitrag 1: Auftragspapier `plaene/auftrag-eingabewache-geraete.md`

Beim Schreiben kamen **zwei Dinge dazu, die in keinem der beiden Befunde
standen** — beide gemessen, beide ausdrücklich AUSGEKLAMMERT statt
stillschweigend mitgenommen:

* **Die ID-Regel steht an VIER Orten** (`geraete-typen.js:232`,
  `ausmusterung.js:73`, `tablets.js:46`, inline `geraete.js:699`), und jede
  der drei Funktionen verweist im Kommentar auf eine der anderen als
  Begründung — ein Zitierring ohne Quelle. Der Auftrag legt sie nach
  `core/eingabe-pruefung.js` und bindet alle vier, statt eine fünfte Kopie
  anzulegen.
* **Eine ZWEITE, andere Klasse:** fünf Stellen machen `parseInt(x,10)` VOR der
  Prüfung (`mitarbeiter.js:670,703,736,835`, `tablet-sperre.js:545`). Die
  erreichen SQL nie mit einem schlechten Wert — sie handeln still am FALSCHEN
  Datensatz. Gemessen: `parseInt("2abc",10)=2`, `parseInt("007",10)=7`.
  `/mitarbeiter/loeschen/2abc` löscht also Mitarbeiter 2. **Kein
  Rechtegewinn** (alle fünf Abfragen tragen `studio_id`, und wer `2abc`
  schicken kann, kann auch `2` schicken) — deshalb eigener, späterer Beitrag.
* **Drei weitere verwundbare `.trim()`-Stellen** in derselben Datei, über die
  beiden gemeldeten hinaus; `geraete.js:5030` sogar ganz ohne Guard, dort
  wirft schon ein FEHLENDES Feld.

### Als Nächstes

1. Die beiden Planprüfungen abwarten, **jeden Befund selbst nachmessen**,
   erst dann bauen.
2. Beiträge 2–5 als Auftragspapiere schreiben, jeweils mit Planprüfung davor.
3. Danach Bündel 2 des Durchgangs (Anmeldung und Rechte) — mit den fünf
   Dateien im Bündel, die DeepSeek bei Bündel 1 als seine Prüfgrenze benannt
   hat.

### Weiter offen

* **Greptile-Kontingent verbraucht** (50 Credits, Freiplan) — Betreiber-
  Entscheidung, ob aufgestockt wird. Bis dahin laufen bei Beiträgen an
  Wächtern und Zusicherungen BEIDE Gegenleser-Spuren statt abwechselnd.
* **`tools/gegenleser-repo.js` kann nur OpenAI** (`ENDPUNKT` fest auf
  `api.openai.com`, Zeile 86). Die DeepSeek-Spur läuft deshalb weiter über ein
  Skript von Hand — statisches Bündel, kein Repo-Lesezugriff. Das ist der
  Rest, der vom DeepSeek-Adapter übrig ist: Basis-URL, Modellname, Schlüssel.
* **`plaene/befund-datei-vs-commit.md`** — zwei gemessene Stellen, an denen
  eine unwiderrufliche Dateiaktion auf der falschen Seite eines fehlbaren
  Schritts steht. Gehört zu Beitrag 2.

---

## 19.09.2026, ~18:50 UTC — Zwei Planprüfungsrunden, 34 getragene Befunde, METHODENÄNDERUNG

### Was passiert ist

Der erste Bauauftrag aus Bündel 1 (Eingabewache) ging **vor** der ersten
Bau-Runde an beide Prüfspuren. Ergebnis über zwei Runden:

| | Befunde | getragen | blockierend | Kosten |
|---|---|---|---|---|
| Runde 1 (Fassung 1) | 17 | **17** | 4 | 11,23 $ |
| Runde 2 (Fassung 2) | 17 | **17** | 5 | 18,81 $ |

**Gebaut wurde nichts** — und das war richtig. Die blockierenden Befunde
hätten vier falsche Regeln in eine kanonische `core/`-Datei geschrieben, auf
die danach vier Orte zeigen.

### Die drei Befunde, die alles verschoben haben

1. **Die ID-Regel, die ich kanonisieren wollte, war die SCHWÄCHERE von zwei im
   Bestand.** `/^\d+$/` lässt `"99999999999"` durch → 22003 → Fehlerseite +
   Alarm. Zehn Zeilen weiter steht `normalisiereGeraetId` mit der int4-Grenze.
2. **`parseInt` fängt den int4-Überlauf NICHT.** `parseInt("2147483648",10)`
   ist nicht `NaN`, passiert `!id || isNaN(id)` und erreicht SQL. Damit war
   meine Begründung fürs Ausklammern von `mitarbeiter.js` und
   `tablet-sperre.js` **falsch** — sie tragen dieselbe Alarmklasse und gehören
   in den Auftrag. Beide Spuren fanden das unabhängig.
3. **`typeof === 'string'` hätte einen legitimen Aufrufer gebrochen.**
   `geraete-typen.js:431-434` gibt drei OPTIONALE Felder weiter, eines
   ausdrücklich als freiwillig kommentiert.

### Die Methodenänderung — der eigentliche Ertrag

**Dreimal hintereinander war meine von Hand geschriebene Stellenliste
unvollständig** (5 statt 8; 1 von 10 `String(req.body…)`-Senken; 10 von 26
`:id`-Routen). **Viermal an einem Tag war ein Suchmuster von mir falsch** —
Leerraum im `|| ''`-Idiom, `[^\n]*` beim Routen-Zählen, der Marker-Ausschluss,
das Dateizahl-Ritual.

Eine vierte Fassung mit einer vierten handgemachten Liste wäre derselbe Fehler
zum vierten Mal gewesen. **Eine Liste, die ich pflege, ist ein Selbstnachweis
aus dem eigenen Datenfluss.**

Der Auftrag ist deshalb GETEILT und die Liste MECHANISCH:

* **`plaene/auftrag-id-wache.md`** — ein Wächter zählt alle `:id`-Routen
  selbst auf (Dateiliste aus `git ls-files`) und verlangt je Route eine Wache
  ODER einen literalen Ausnahmeeintrag mit Grund. Die 16 ungemessenen Routen
  kommen als Ausnahme mit dem Grund „nicht gemessen" hinein — **sichtbar statt
  still fehlend.** Die fünf `parseInt`-Stellen sind neu IM Bau. `ID_MAX` steht
  an EINEM Ort.
* **`plaene/auftrag-textfeld-wache.md`** — dasselbe für `req.body`-Senken, mit
  dem FELDNAMEN im Prüfpaar als Anker: wer ein Feld aus dem Paar streicht,
  wird rot. Regel: *FEHLEND ist erlaubt, VORHANDEN muss Text sein.*

`plaene/auftrag-eingabewache-geraete.md` ist damit **überholt und nur noch
Protokoll**; sein Kopf sagt das.

### Was das über die Verfahren sagt — mit den Einschränkungen

* **Die Rundenbegrenzung aus CLAUDE.md trägt, und sie ist jetzt gemessen.**
  Alle fünf blockierenden Befunde der zweiten Runde betreffen die
  KORREKTUREN, nicht den ursprünglichen Plan — eine Runde hätte sie
  strukturell nicht finden können.
* **Überschneidung Runde 1: 3 von 17. Runde 2: 1 von 17.** Das ist ein
  anderes Ergebnis als am 13.09. und bei Bündel 1 (je null). Erklärung
  plausibel (dort Code, hier ein Papier), aber **nicht belegt**.
* **Der Unterschied zwischen den Spuren war der REPO-LESEZUGRIFF, nicht das
  Modell.** Vier von Spur 1s acht Befunden in Runde 1 stützen sich auf
  Dateien, die nicht im Bündel lagen. Die 0,04-$-Spur fand trotzdem in beiden
  Runden Befunde, die die 11-$-Spur nicht hatte.

### Als Nächstes

1. **Runde 3 läuft** über die beiden neuen Papiere, beide Spuren. Befunde
   selbst nachmessen, dann bauen.
2. Danach Beiträge 2–5 aus Bündel 1 (`plaene/auftrag-schreibreihenfolge.md`
   liegt fertig, die übrigen sind zu schreiben).
3. Danach Bündel 2 des Durchgangs (Anmeldung und Rechte).

**Achtung beim Bauen:** `plaene/auftrag-textfeld-wache.md` und
`plaene/auftrag-schreibreihenfolge.md` fassen BEIDE `routes/admin/geraete.js:5496`
an. Wer zuerst baut, nennt es dem anderen.

---

## 19.09.2026, ~18:55 UTC — Runde 3 kippte den ENTWURF, der Beitrag wurde KLEINER

### Die Serie, vollständig

| Runde | Gegenstand | Befunde | getragen | blockierend | Kosten |
|---|---|---|---|---|---|
| 1 | Eingabewache Fassung 1 | 17 | 17 | 4 | 11,23 $ |
| 2 | Eingabewache Fassung 2 (die BEHEBUNGEN) | 17 | 17 | 5 | 18,81 $ |
| 3 | ID-Wache + Textfeld-Wache (der neue ENTWURF) | 29 | 29 | 11 | 12,77 $ |
| | **Summe** | **63** | **63** | **20** | **42,81 $** |

**Grösste Prüfserie unseres Protokolls, und die einzige ohne einen einzigen
gefallenen Befund.** Alles am PAPIER, nichts am fertigen Code.

### Warum Runde 3 den Entwurf kippte

Der Inventar-Wächter — die Antwort auf „meine handgemachte Liste war dreimal
unvollständig" — **sieht seine eigenen Paradebeispiele nicht:**

* `aufgaben` ist an `routes/admin/geraete.js:5418` DESTRUKTURIERT. Die Zeile
  `aufgaben.trim()` (`:5496`), das Flaggschiff-Beispiel, enthält `req.body`
  überhaupt nicht. Dasselbe für `name` an `:5441`, `:4981`, `:5030`, `:235`.
* `routes/tablet-sperre.js:546` ist eine BODY-ID (`req.body.mitarbeiter_id`),
  keine `:id`-Route. Ein Routen-Inventar findet sie nie.

Ein Muster an der SENKE beantwortet eine Frage nach dem DATENFLUSS nicht —
genau die Hausregel, die ich selbst zitiert hatte.

### Zwei eigene Prämissen berichtigt

* **„ID_MAX steht an EINEM Ort"** ist schon heute falsch: gemessen **11
  Literale `2147483647` in sieben Dateien** unter `routes/`. Meine Zusicherung
  wäre unabhängig vom Bau rot gewesen.
* **„Der Alarmkanal ist von aussen taktbar"** war zu stark. `core/csrf-schutz.js`
  weist jeden Nicht-GET mit fremdem `Origin`/`Referer`-Host mit **403** ab,
  `/admin/…` ist keine Ausnahme. Erreichbar für jeden ANGEMELDETEN Admin, nicht
  für einen fremden Dritten. **Der Defekt bleibt** (stille Falschschreibungen,
  halb angelegte Datensätze), die Einordnung wird ehrlicher.

### Die Entscheidung: KLEINER statt ein vierter Entwurf

Drei Runden, 63 Befunde, immer noch nicht baureif — und fast alle hingen am
AUSBAU, nicht an den Defekten. Nach der Hausregel „lieber ein Bündel weniger
als zwanzig ungemessene Befunde" baut `plaene/auftrag-id-wache.md` **Fassung 2**
nur noch:

* `core/eingabe-pruefung.js` mit `istGueltigeId` (Ziffern **und** int4),
  Coercion `String(wert)` aus dem Bestand ÜBERNOMMEN statt verschärft.
* Vier heute gleichlautende Kopien binden; `normalisiereGeraetId` liest
  `ID_MAX` von dort.
* `geraete.js:337`/`:467` nachziehen (gemessen: `isNaN` lässt `1e3`, `1.5`,
  `0x10` durch).
* Fünf `parseInt`-Stellen nachziehen (gemessen:
  `parseInt("2147483648",10)` ist nicht `NaN` und erreicht SQL → 22003).
* **Drei Verhaltensänderungen, einzeln gemessen:** `"0"`, `"2147483648"`,
  `"99999999999"` gehen von angenommen nach abgewiesen; 19 weitere Fälle
  bleiben identisch.

**NICHT gebaut:** Inventar-Wächter, Textfeldregel, ID_MAX-Zentralisierung über
`geraete.js` hinaus. **Alle acht ausgeklammerten Fundorte stehen als offene
Punkte (U-ID1 bis U-TX5) in `plaene/durchgang-befunde.md`** — ein
aufgeschriebener Fundort ist besser als ein Wächter, der ihn falsch zählt.

### Als Nächstes

1. **Executer-Bericht abwarten**, dann Diff SELBST lesen, Suite SELBST fahren,
   unabhängige Review, CI. Regel 6a: kein Link, bevor das durch ist.
2. Danach `plaene/auftrag-schreibreihenfolge.md` (liegt fertig) — **Achtung:
   es fasst `geraete.js:5485-5503` an, dieselbe Region wie der aktuelle Bau.**
3. Dann die übrigen Beiträge aus Bündel 1, dann Bündel 2 des Durchgangs.
4. **Die Textfeld-Wache braucht einen neuen Erfassungs-Entwurf** (AST statt
   Muster) — `plaene/auftrag-textfeld-wache.md` ist als NICHT BAUBAR markiert,
   seine Messungen bleiben gültig.

### Papierlage zu Bündel 1 — Stand 19.09.2026, ~19:10 UTC

Die neun getragenen Befunde sind jetzt in DREI Papieren untergebracht statt in
fünf. Zwei wurden bewusst in ein vorhandenes Papier gefaltet statt eigene zu
bekommen („kein Stapel ohne Abarbeitung"):

| Papier | deckt ab | Stand |
|---|---|---|
| `plaene/auftrag-id-wache.md` (Fassung 2) | B1-07, B1-08 (ID-Teil) | **wird gebaut** |
| `plaene/auftrag-schreibreihenfolge.md` | B1-03, **B1-05**, **B1-04** + F1/F2 | fertig, Planprüfung steht aus |
| `plaene/auftrag-ladebestand.md` | B1-02 | fertig, Planprüfung steht aus |
| `plaene/auftrag-textfeld-wache.md` | B1-08 (Text-Teil) | **NICHT BAUBAR** — Erfassung braucht AST statt Muster |
| — | **B1-09 + B1-10 (Namensinvariante Seilgeräte)** | **noch KEIN Papier** |
| — | B1-11 (Escaper-Kopie) | Vorlage an den Betreiber, kein Bauauftrag |

**Die Lücke ist B1-09/B1-10** und sie ist die heikelste der neun: Anlegen und
Umbenennen prüfen denselben Namen ungleich streng UND unter verschiedenen
Sperrschlüsseln (`geraet-seilname:<studio>:<name>` mit `hashtextextended`
gegen `seilkontrolle:<studio>:<heute>` mit `hashtext`), und es gibt kein
`UNIQUE(studio_id, name)` als Netz. Der Zustand ist laut den eigenen
Kommentaren der Datei unwiderruflich.

**Vor diesem Papier gilt die Transaktions-Regel aus CLAUDE.md:** zählen,
welche anderen Transaktionen dieselben Zeilen anfassen und in welcher
Reihenfolge sie den Audit-Lock nehmen — der bestehende, nicht behobene
Verklemmungs-Kreis liegt in derselben Gegend.

### Weiter offen (Betreiber-Entscheidung)

* **Greptile-Kontingent verbraucht** (50 Credits, Freiplan). Bis zur
  Aufstockung laufen bei Beiträgen an Wächtern und Zusicherungen BEIDE
  Gegenleser-Spuren statt abwechselnd. Das hat sich heute ohnehin bewährt —
  in allen drei Runden lieferte jede Spur Befunde, die die andere nicht hatte.

---

## 19.09.2026, ~19:30 UTC — ID-Wache gebaut, ZWÖLFTER Eintrittspunkt gefunden

**Der Executer hat gebaut und gepusht** (`claude/id-wache`, `128732f`). Diff
vollständig selbst gelesen, Datei für Datei — er ist sauber. Bemerkenswert:

* Die **falsche Mengenaussage in `tablets.js`** („dieselbe Prüfung wie an
  jeder anderen Stelle im Admin-Bereich", von der Planprüfung als falsch
  gemessen) ist ERSETZT, nicht mitgeschleppt.
* Bei den drei GETEILTEN Bindungen hat er für die Verdrahtungs-Gegenprobe ein
  Schatten-`istGueltigeId` direkt nach dem `require` gesetzt statt eine
  einzelne Route zu mutieren — **nur so misst die Probe die BINDUNG** statt
  einer der Routen, die sie benutzen. Richtige Entscheidung, nicht
  beauftragt.
* Er hat **seine eigene erste Positivkontrolle als falsch gemeldet und
  korrigiert** (ein Gerät ohne Mangel nimmt den Rückfallzweig „gewöhnliche
  Deaktivierung", `ausgemustert_am` bleibt NULL — die Probe prüfte also nicht
  den Ausmusterungspfad).

### Der zwölfte Eintrittspunkt — gemeldet statt stillschweigend gebaut

`routes/admin/mitarbeiter.js:818`, `POST /mitarbeiter/umbenennen/:id`:
`req.params.id` geht **vollständig ungeprüft** in `SELECT … WHERE id=$1`
(`:824`) und `UPDATE … WHERE id=$2` (`:826`) — weder `istGueltigeId` noch
`isNaN` noch `parseInt`. **Selbst nachgemessen, trägt.** `"1e3"` trifft dort
22P02, `"99999999999"` trifft 22003 — genau der Alarmweg, den dieser Beitrag
schliesst.

**Entscheidung: wird mitgebaut.** Ihn auszulassen hiesse, in genau der Datei,
die dieser Beitrag anfasst, elf von zwölf Eintrittspunkten zu schliessen —
die Klasse, vor der CLAUDE.md warnt. Der Nachtrag ist beauftragt (eine Zeile
Produktivcode, ein Testabschnitt, eine Gegenprobe).

**Dass er ihn gemeldet hat, statt ihn mitzunehmen, war richtig** — er stand
nicht im Auftrag. Das ist der Agent, den die Hausregel meint: einer, der
einen Befund MELDET, ist mehr wert als einer, der immer liefert.

### Noch NICHT erledigt (Regel 6a: kein Link, bevor das durch ist)

1. **Volle Suite von MIR selbst** — die Zahlen des Executers sind eine
   Behauptung, bis ich sie gemessen habe. Läuft erst nach dem Nachtrag, sonst
   zweimal.
2. Dateizahl-Ritual und `npm run lint` selbst.
3. **Vier Augen**: unabhängige Review über den Diff UND eine Gegenlesung —
   sieben Produktivdateien sind kein trivialer Diff.
4. PR, Review-Bot-KOMMENTARE lesen (nicht nur seinen Check), CI grün gegen
   den aktuellen Kopf, dann Merge.
5. Nach dem Merge: Deploy-Lauf mit dem richtigen `head_sha` und
   `tools/live-check.sh`.

---

## 19.09.2026, ~20:45 UTC — ID-Wache gemergt (#461, master `5a194ba`)

Erster gebauter Beitrag aus dem risikoorientierten Durchgang. Vom Befund bis
zum Merge:

| Schritt | Ergebnis |
|---|---|
| Bündel 1 | 11 Befunde, 9 getragen |
| Planprüfung, drei Runden | 63 Befunde, **63 getragen**, 20 blockierend, 42,81 $ |
| Bau | drei Commits, zwölf Eintrittspunkte |
| Diffprüfung, zwei Spuren | 17 Befunde, 12 getragen |
| Eigene Abnahme | Suite EXIT 0 / 0 FAIL, 342 = 342, Lint EXIT 0, Marker 6 |
| CI | vier Jobs, alle `success` auf `eade9c9` |

### Was dieser Beitrag über die Verfahren zeigt

**Der teuerste Fund kostete 0 $ und kam vom AUSFÜHRENDEN.** Beim Gegenmessen
seiner eigenen Probe fiel ihm auf, dass PostgreSQL 16 `'0x10'` als **16**
liest statt zu werfen. Selbst nachgemessen am Cluster — es stimmt. Damit
waren **vier Bestandskommentare seit dem 28.08.2026 falsch**, und der wahre
Sachverhalt ist schlimmer als der behauptete: `/geraete/loeschen/0x10` hätte
still Gerät 16 gelöscht statt zu scheitern. Die Tatsache hat jetzt eine
ausführbare Zusicherung mit Positivkontrolle.

**Der Ausführende hat einem meiner Aufträge WIDERSPROCHEN — und hatte
recht.** Ich hatte eine int4-Prüfung in `parseIds()` verlangt, aufgebaut auf
einem Gegenlesungs-Befund, den ich nicht selbst am AUFRUFER gemessen hatte.
Er hat gemessen: der Aufrufer weist jede nicht gelistete ID mit 400 ab, bevor
SQL läuft. Selbst bestätigt. Eine zusätzliche Prüfung wäre totes Vorfeld
gewesen.

**Und er hat einen zwölften Eintrittspunkt GEMELDET statt stillschweigend
mitgebaut** (`mitarbeiter.js`, `umbenennen` — `req.params.id` ging völlig
ungeprüft in SELECT und UPDATE). Nachgemessen, aufgenommen, gebaut.

Alle drei sind genau das, was die Hausregel meint: *„einer, der der Vorgabe
seines Auftraggebers mit einer Messung WIDERSPRICHT, ist das Wertvollste."*

### Als Nächstes

1. **Deploy kontrollieren** (`deploy.yml`, richtiger `head_sha`, `success`),
   dann `tools/live-check.sh`.
2. `plaene/auftrag-schreibreihenfolge.md` — liegt fertig, braucht die
   Planprüfung. **Achtung:** fasst `geraete.js:5485-5503` an. Dazu kommt der
   neue Fundort U-MA1 (drei Mitarbeiter-Routen melden Erfolg bei null
   getroffenen Zeilen) — dieselbe Klasse, gehört dort hinein.
3. `plaene/auftrag-ladebestand.md` — liegt fertig, braucht die Planprüfung.
4. B1-09/B1-10 (Namensinvariante Seilgeräte) — **noch kein Papier**, braucht
   vorher die Lock-Ordnungsanalyse.
5. Die Textfeld-Wache braucht einen neuen Erfassungs-Entwurf (AST statt
   Muster).
6. Danach Bündel 2 des Durchgangs (Anmeldung und Rechte).

### 20:50 UTC — Auslieferung kontrolliert, #461 ist durch

* **Deploy-Lauf 429**, `head_sha 5a194ba` — **derselbe wie der Merge-Commit** —
  `conclusion: success`.
* **`tools/live-check.sh` EXIT 0**: Landingpage HTTP 200, Echtheitsprüfung
  rendert, Studio-Subdomain weist mit 302 ab, Handbuch 2.9.11 ausgeliefert.
  Zwei Punkte ehrlich als ℹ NICHT GEPRÜFT: die Zertifikatslaufzeit (der
  Egress-Proxy signiert neu, Aussteller hier `O = Anthropic`) und der
  interne Health-Endpunkt (von aussen nicht erreichbar; serverseitig prüft
  ihn `ops/health-gate.sh` bei jedem Deploy).

**Damit ist das Prüf-Ritual für #461 vollständig durchlaufen** — Diff gelesen,
Beweise gesichtet, zwei unabhängige Spuren über den Diff, eigene volle Suite,
Dateizahl-Ritual, Lint, Marker-Scan, CI, Merge mit eigener Botschaft
(zurückgelesen), Deploy mit richtigem `head_sha`, Live-Check.

---

## 19.09.2026, ~22:00 UTC — Kimi K3 beantwortet, Schreibreihenfolge Fassung 2 raus

### Betreiber-Frage Kimi K3

Antwort geliefert, Einzelheiten in `plaene/kimi-k3-eignung-19-09-2026.md`.
Kurz: **erreichbar** (`api.moonshot.ai/v1/models` HTTP 401 in 0,80 s — kein
Schlüssel, nicht gesperrt), Rest ist Herstellerprosa (1M Kontext, 3,00/15,00 $
je Mio, `/v1/responses` OpenAI-kompatibel, Signaturendpunkt gegen stilles
Umrouten). **Empfehlung: nicht einführen, nicht verwerfen — EIN A/B-Lauf gegen
ein Papier, dessen Antwort wir kennen.** Nötig dafür: ein Schlüssel.

### Fassung 2 des Schreibreihenfolge-Papiers

Fassung 1 lag als **nicht baubar** da (17 Planprüfungs-Befunde, vier
blockierend). Fassung 2 ist geschrieben, alle Zeilennummern am Stand `5a194ba`
neu gemessen, Fassung 1 als `-fassung1.md` archiviert.

**Die wichtigste Änderung ist keine Korrektur, sondern ein anderer Entwurf.**
Fassung 1 wollte bei S2 die Reihenfolge tauschen. Selbst nachgemessen ergibt
das einen BEWEIS gegen den Tausch:

Der Unterschriftenweg liest `freigeschaltet_am` (R1, `belehrungen.js:793`) vor
`dateiname` (R2, `:798`), also immer **R1 < R2**. Der Schaden „neue Generation
gelesen, altes Dokument unterschrieben" verlangt `R1 > W_g` und `R2 < W_d`.

* heute (`W_d < W_g`): verlangt `R1 > R2` — **Widerspruch, ausgeschlossen**;
* getauscht (`W_g < W_d`): `W_g < R1 < R2 < W_d` — **möglich**.

Der Tausch hätte also einen Fehlerfall-Datenverlust gegen ein Rennen im
NORMALBETRIEB eingetauscht. **Die Behebung ist deshalb EINE Transaktion**
(Advisory-Lock zuerst, wie im Bestand bei `:946` schon vorgezeichnet) — vor dem
COMMIT ist nichts sichtbar, es gibt kein Fenster, und der Beweis wird
gegenstandslos statt auf die andere Seite zu kippen.

**Vier Dinge selbst gemessen, die Fassung 1 delegiert oder behauptet hatte:**

| Frage | Messung |
|---|---|
| Braucht `schalteAlleFrei()` den neuen `dateiname`? | **Nein** — Signatur `(studioId, belehrungId, grund)`, fasst nur `belehrung_freischaltung`/`mitarbeiter` an |
| Lesen die drei Mitarbeiter-Routen vor oder nach dem UPDATE? | **VOR** (690/691, 758/760, 838/840) — Fassung 1 behauptete das Gegenteil |
| Welcher Rückmeldecode passt für „nicht gefunden"? | `email_fehler` existiert wörtlich; `name_fehler` ist irreführend, `pin-direkt` hat gar keinen → zwei neue Codes **plus Listeneintrag** |
| Ist `frist-bestaetigen/:id` ID-geprüft? | **Nein** — `istGueltigeId` in `geraete.js` nur an `:352`, `:485`, `:725`. Dreizehnter Eintrittspunkt, fährt als S4b mit |

Dazu **S6 neu**: `pin-direkt` setzt die PIN (`:760`, committet) und entwertet
danach offene Einladungs-Tokens (`:762`) als ZWEITEN Pool-Commit. Scheitert der
zweite, ist die PIN gesetzt, der Benutzer sieht eine Fehlerseite — **und alte
Tokens können die PIN später erneut ändern.** Kein Rückmeldefehler mehr,
sondern ein offener Anmeldeweg.

**Planprüfung Runde 2 läuft** (beide Spuren, ~37k Token Material samt erhobener
Sperrlandschaft). Die Fragen sind ausdrücklich NEU — sie greifen die
Transaktion an, nicht den überholten Tausch.

### Neuer offener Punkt

* **U-DEL1** — `belehrungen.js:2299`: `try { fs.unlinkSync(fp); } catch {}`
  verschluckt ein fehlgeschlagenes `unlink` vollständig. Nach dem Umbau (S3)
  ist das erlaubter Müll, aber lautlos. Auf `melde()` umzustellen wäre eine
  zweite Verhaltensänderung (Telegram-Alarm) und gehört nicht in den Beitrag.

### 22:43 UTC — Fassung 3, und eine dritte Prüfspur ist dazugekommen

**Der Betreiber hat einen Kimi-Schlüssel geliefert.** Gemessen (Einzelheiten
in `plaene/kimi-k3-eignung-19-09-2026.md` und CLAUDE.md): Endpunkt
`api.moonshot.ai`, Konto **Tier 2** (Concurrency 40, RPM 100, TPM 3 Mio),
`kimi-k3` mit **1.048.576 Kontext von der API bestätigt**, `reasoning.effort`
wirkt monoton (low 312 / high 598 / max 5781 Denk-Token). **Zwei Fallen:** ein
erfundenes Feld wird mit HTTP 200 ANGENOMMEN (anders als bei OpenAI — „wird
angenommen" sagt dort nichts), und der Egress-Proxy schneidet auch hier bei
301 s ab, `stream: true` ist Pflicht.

**Planprüfung Runde 2 über Fassung 2 — DREI Spuren, 20 Befunde, 19 getragen:**

| Spur | Befunde | getragen | Kosten |
|---|---|---|---|
| `gpt-5.6-sol` (mit Repo-Lesezugriff) | 11 | 10 | 17,42 $ |
| `deepseek-v4-pro` | 2 | 2 | ~0,05 $ |
| **`kimi-k3` (A/B, wortgleich zu deepseek)** | **7** | **7** | **~0,42 $** |

Der zwanzigste Befund (B9, Sessions entwerten) ist eine richtige Beobachtung,
deren Auflösung eine **Betreiber-Entscheidung** war — er fährt nicht mit.
(Sie liegt seit dem 20.09.2026 vor: NEIN, s. weiter unten und
`plaene/ENTSCHIEDEN.md`.)

**Zwei Entwürfe wurden ERSETZT, nicht korrigiert:**

* **S6 ohne Transaktion** (Befund B3 von sol, am Quelltext bestätigt): die
  geplante `db.tx` hätte `mitarbeiter` → `mitarbeiter_token` gesperrt, während
  `routes/mitarbeiter-auth.js:295-299` genau umgekehrt sperrt — `40P01`.
  Heute gibt es den Kreis nicht, weil beide UPDATEs Autocommit sind. Gebaut
  wird jetzt: erst Tokens entwerten, dann PIN setzen, **keine Transaktion**.
* **S1 mit weiterer Transaktionsgrenze** (Befund K-3 von kimi, bestätigt): der
  `kat`-SELECT bei `:5540` blieb nach dem Commit als fehlbarer Schritt stehen —
  wörtlich das Schadensbild, das S1 beseitigen soll. Er entfällt ersatzlos,
  weil `:5458` dieselbe Zeile schon liest.

**Bemerkenswert und in CLAUDE.md eingetragen:** bei S2 ist die Transaktion
richtig und der Reihenfolgentausch falsch, bei S6 **genau umgekehrt**. Das
Mittel entscheidet nicht — entscheidend ist, welche anderen Transaktionen
dieselben Zeilen anfassen.

**Runde 3 läuft** (nur `kimi-k3`, ~0,42 $, eng auf die beiden Neuentwürfe
gerichtet). Begründung: unsere eigene Regel verlangt eine zweite Lesung, wenn
eine Behebung VERHALTEN ändert — und beide tun das.

### ENTSCHIEDEN am 20.09.2026 (war: offen, Betreiber-Entscheidung)

**Soll das direkte Setzen einer PIN durch den Admin bestehende
Tablet-Sitzungen beenden? — NEIN.** Betreiber wörtlich: „zur pin frage: nein
soll nicht beendet werden". Es bleibt beim heutigen Verhalten: bestehende
Sitzungen prüfen `pin_hash` nicht erneut und laufen weiter, in BEIDEN
PIN-Wegen (auch `routes/mitarbeiter-auth.js:288-302`). Es wird nichts
gebaut. Eingetragen in `plaene/ENTSCHIEDEN.md`, dort auch die Abgrenzung
gegen die Token-Entwertung, die davon unberührt bleibt.

### 23:40 UTC — Planprüfung abgeschlossen, Beitrag B im Bau

**Runde 3 (nur `kimi-k3`, ~0,30 $): 8 Befunde, alle acht selbst nachgemessen,
alle acht getragen.** Einer davon (verwaiste `Z6`-Referenz) war Minuten vorher
schon von mir selbst gefunden — er zählt als Bestätigung, nicht als Fund.

**Bilanz über das ganze Papier: drei Runden, 45 Befunde, 44 getragen,
rund 18,19 $ — und keine Zeile Produktivcode dafür geschrieben.**

**Der teuerste Befund der Runde (R3-1, am Quelltext bestätigt):** mein
Zwei-Schritt-Entwurf für S6 sah nur den EINLÖSEweg an und übersah den Weg,
der Tokens ERZEUGT — `sendeMitarbeiterEinladung()`
(`routes/mitarbeiter-auth.js:172-186`, eigene `db.tx`, öffentlich über
`/pin-vergessen` erreichbar). Committet ihr INSERT zwischen Schritt 1 und 2,
steht am Ende **PIN neu UND ein gültiges Token offen** — genau der Zustand,
den Z6a verbietet. **Ein dritter Schritt schliesst es** (nochmals entwerten
nach dem PIN-UPDATE).

**Zwei eigene Behauptungen zurückgenommen, beide nachgemessen:**

* *„Zwei Autocommits halten nie zwei Sperren gleichzeitig"* ist **falsch** —
  ein mehrzeiliges UPDATE hält seine Zeilensperren bis Anweisungsende
  gleichzeitig. Tragend ist nur der schwächere Satz: sie halten keine Sperre
  über ANWEISUNGSGRENZEN, und genau das verlangt der Kreis aus B3.
* `JSON.stringify` lässt einen `undefined`-Schlüssel **still weg** (in `node`
  gemessen). Vergisst der Ausführende `SELECT id, name`, verschwindet der
  Kategoriename aus dem Audit — ohne Wurf, ohne roten Test. Z1 hat deshalb
  jetzt eine Payload-Zusicherung.

### Das Muster über drei Fassungen

| Fassung | Der Befund war | Meine Behebung wäre gewesen |
|---|---|---|
| 1 | richtig | ein Rennen im Normalbetrieb |
| 2 | richtig | eine echte Verklemmung (`40P01`) |
| 3 | richtig | ein offenes Token trotz neuer PIN |

Dreimal hintereinander unstrittiger Befund, dreimal die vorgeschlagene Abhilfe
als eigentliche Gefahr. Steht als Regel in CLAUDE.md
(„Transaktionen und Sperren").

**Dazu eine zweite Regel, die daraus folgt:** eine Frage nach einem ZUSTAND
findet mehr als eine Frage nach einem MECHANISMUS. Alle drei teuersten Funde
lagen in Wegen, nach denen ich nicht gefragt hatte.

### Läuft gerade

**Beitrag B** (`routes/admin/geraete.js` — S1, S4, S4b; Zusicherungen Z1,
Z4a–Z4d) ist beim Executer, Zweig `beitrag-b-geraete-schreibreihenfolge` von
master `5a194ba`. **Einordnung vor dem Auftrag:** nicht „sehr komplex" — die
Herleitung steht vollständig im Papier, die einzige Stelle mit
Falsch-Grün-Risiko (Z4a) ist dort samt Gegenmittel benannt, und die Arbeit
liegt in EINER Datei; daher Standard-Executer.

**Solange er läuft, wird `/home/user/gymdocu` nicht angefasst** — auch nicht
lesend für ein Gegenleser-Bündel, weil er genau die Datei umbaut, die ein
solches Bündel bräuchte.

### Danach in dieser Reihenfolge

1. Beitrag B prüfen (Diff lesen, eigene Suite, Dateizahl-Ritual, Lint,
   zwei Prüfspuren über den Diff, CI).
2. **Beitrag C** (`routes/belehrungen.js` — S2, S3).
3. **Beitrag A** (`routes/admin/mitarbeiter.js` — S5, S6). Vor A ist zu
   entscheiden, ob der dritte Schritt aus R3-1 eine weitere Planlesung
   braucht; er ändert Verhalten, also spricht die Hausregel dafür.
4. `plaene/auftrag-ladebestand.md` — liegt fertig, braucht noch die
   Planprüfung. Zeilennummern sind bereits auf `5a194ba` nachgezogen.
5. B1-09/B1-10 (Namensinvariante Seilgeräte) — noch kein Papier.

### 20.09.2026, 00:40 UTC — Beitrag B geprüft, Nacharbeit läuft

**Der Produktivcode trägt. Eigene Messungen** (nicht der Bericht des
Ausführenden): Suite **`SUITE_EXIT=0`**, **0** `✗ FAIL`-Zeilen, jede
Summenzeile 0 FAIL; Dateizahl-Ritual **344 = 344, `diff` EXIT 0**;
`npm run lint` **`LINT_EXIT=0`**; Marker-Scan **6**, alle in `docs/`;
`node --check` grün; `istGueltigeId` am neuen Eintrittspunkt nachweislich im
Scope. Berührt sind nur `geraete.js` + zwei Testdateien + `test/run.sh` —
`belehrungen.js` und `mitarbeiter.js` unangetastet.

**Zwei Prüfspuren über den Diff: `/code-review` 15 Befunde, `kimi-k3` 2.**
Einzelheiten in `plaene/diffpruefung-beitrag-b.md`.

**Vier Befunde müssen vor dem Merge weg, alle „Zusicherung kann nicht rot
werden":**

1. **Der Nebenläufigkeitsbeweis trägt nicht — von DREI Spuren unabhängig
   gefunden** (beide Prüfer und meine eigene Lesung). „Mindestens ein
   Blockierter" ist auch dann erfüllt, wenn nur EIN Request das UPDATE
   erreicht; danach schreibt er, der zweite steigt am `if` aus, alles grün,
   Überschneidung nie stattgefunden. Der Kommentar behauptet ausdrücklich das
   Gegenteil.
2. **Die Z4c-Audit-Zusicherung fragt die falsche `studio_id` ab** — der
   Fremd-Request läuft als B, gezählt wird A. Kann nie fallen.
3. **Der Z1-Kernfall unterscheidet Rollback nicht von Frühabweisung.**
   Gemessen: `intern()` liefert immer denselben Text, und die Route hat
   **sechs** Frühausstiege, die ebenfalls `class="error"` mit non-302 liefern
   und nichts schreiben.
4. **Der Testaufbau schreibt ohne `studio_id`** — in der Datei, die die
   Mandantentrennung prüft.

**Ein gemeldeter Befund fällt in der Schwere:** die neue `IS NULL`-Bedingung
gegen einen Leerstring in `frist_festgelegt_am`. **Nachgemessen ist `''` heute
NICHT erreichbar** — einziger Schreiber der Spalte im ganzen Bestand ist diese
Route selbst, keiner der drei `INSERT INTO wartung_geraete` führt sie. Die
Divergenz zwischen `if` und `WHERE` bleibt und wird mit einer Zeile
geschlossen.

**Zwei Fehler auf unserer Seite, festgehalten statt übergangen:**

* Der Ausführende meldete beim Marker-Scan einen Treffer in seiner Testdatei —
  gemessen sind es dort **null**; seine Zeichenkette trägt einen Unterstrich
  und trifft das Suchmuster nicht. *(Eine Zahl aus einem Bericht ist eine
  Behauptung.)*
* **Mein eigenes** Suchmuster bei der Scope-Prüfung passte in der Datei
  fünfmal und traf die ERSTE statt der neuen Fundstelle — dieselbe Klasse wie
  bei Mutationsmustern, nur beim Messen. Mit Volltrefferliste neu gemessen.

### Beobachtung zu den Prüfspuren

Am DIFF war die ausführende Spur deutlich ergiebiger (15 gegen 2); am PAPIER
war es umgekehrt (dort fand die Ein-Schuss-Spur sechs Befunde, die keine
andere hatte). **Welche Spur trägt, hängt am GEGENSTAND, nicht am Modell** —
Diff-Befunde verlangen, den Kontrollfluss des Bestands abzulaufen, und dafür
braucht es Repo-Zugriff. Wer daraus eine Rangfolge macht, hat aus zwei Läufen
eine Regel gemacht.

### Läuft gerade

Nacharbeit zu Beitrag B beim selben Executer (vier Muss-Befunde, neun billige
Mitnahmen, ein reiner Kommentarsatz). Danach: zweite Prüfrunde über die
Nacharbeit, dann CI und Merge, dann Beitrag C.

### 01:00 UTC — Beitrag B: Nacharbeit geprüft, Abnahme vollständig, CI läuft

**Alle vier Muss-Befunde behoben und von mir nachgemessen.** Der Ausführende
hat dabei **meiner Gegenprobe-Vorgabe mit einer Messung widersprochen — zu
Recht:** `studio_id` nur aus der LESE-Abfrage zu entfernen erzeugt kein Leck,
weil die Route sie auch im UPDATE trägt und dieses dann gegen das Studio des
ANFRAGENDEN prüft (`rowCount 0`). Erst die Mutation BEIDER Stellen erzeugt
den Schaden; gemessen landet der Audit-Eintrag dann unter dem fremden Studio,
wo die alte Zählung ihn nie gesehen hätte.

**Daraus eine neue Regel in CLAUDE.md:** eine grüne Gegenprobe hat ZWEI
mögliche Ursachen. Bekannt war „der Defekt ist nicht angekommen"; neu ist „er
ist angekommen, und ein ZWEITER unabhängiger Riegel hat ihn gefangen". Die
zweite ist die angenehmere Nachricht und die gefährlichere Fehldeutung — man
hält die Zusicherung für wertlos und schwächt sie ab. Folge: eine
Gegenprobe-Vorgabe benennt nicht „die eine Zeile", sondern zählt ALLE Riegel
zwischen Eingabe und Schaden ab.

**Zwei eigene Nacharbeiten:**

* **Der Marker-Scan war von 6 auf 7 gestiegen** — durch den Kommentar, der die
  Umbenennung erklärt und dabei das Suchwort zitiert. Wörtlich die Krankheit,
  die CLAUDE.md für dieses Repo beschreibt. Selbst behoben (Bagatellgrenze),
  Suchwort getrennt geschrieben, nachgemessen wieder **6**.
* **Einen eigenen Befund heruntergestuft**, bevor er ein Auftrag wurde:
  `require.main === module` wollte ich als Regress melden — gemessen benutzen
  das **neun** Testdateien, es ist Hausmuster. Die dahinterliegende Lücke
  bleibt echt und steht als **U-NOOP1** in `plaene/durchgang-befunde.md`.

**Meine Abnahme (maßgeblicher Lauf nach der eigenen Korrektur):**

| | |
|---|---|
| Volle Suite | **`SUITE_EXIT=0`**, **0** `✗ FAIL`, jede Summenzeile 0 FAIL |
| Dateizahl-Ritual | **344 = 344**, `diff` **EXIT 0** |
| `npm run lint` | **`LINT_EXIT=0`** |
| Marker-Scan | **6**, alle in `docs/` |
| Arbeitsbaum | sauber, Zweig nicht hinter master, Remote = HEAD |

PR ist offen, Review-Bot hat noch nichts kommentiert, **CI läuft** (vier Jobs).
Nach Regel 6a geht die Nummer erst raus, wenn auch Deploy und Live-Check
durch sind.

### 01:27 UTC — Beitrag B ist gemergt und ausgeliefert (#462, master `74ace5a`)

**Prüf-Ritual vollständig:**

| Schritt | Ergebnis |
|---|---|
| Diff gelesen, Datei für Datei | ja, Produktivcode und beide Testdateien |
| Zwei Prüfspuren über den Diff | `/code-review` 15 Befunde, `kimi-k3` 2 |
| Eigene Nachmessung jedes Befunds | 4 Muss (alle behoben), 9 billige Mitnahmen, 1 in der Schwere gefallen |
| Volle Suite (maßgeblicher Lauf) | **`SUITE_EXIT=0`**, 0 `✗ FAIL` |
| Dateizahl-Ritual | **344 = 344**, `diff` EXIT 0 |
| `npm run lint` | **`LINT_EXIT=0`** |
| Marker-Scan | **6**, alle in `docs/` |
| CI | vier Jobs, alle `success` auf `c0e7091` = Zweigkopf |
| Review-Bot | keine Kommentare, keine Reviews, kein eigener Check auf diesem PR |
| Merge | Squash mit eigener Botschaft, **zurückgelesen — endet exakt an der Schlusszeile** |
| Deploy | **Lauf 430, `head_sha 74ace5a`** (der richtige), `success` |
| Live-Check | **EXIT 0** — Landingpage 200, Echtheitsprüfung rendert, Studio-Subdomain weist mit 302 ab, Handbuch 2.9.11. Zwei Punkte ehrlich ℹ (Zertifikatslaufzeit wegen Egress-Proxy, Health-Endpunkt von aussen nicht erreichbar) |

**Bilanz des Beitrags:** 45 Planprüfungs-Befunde (44 getragen), 17
Diffprüfungs-Befunde (13 getragen), 2 aus meiner Prüfung der Nacharbeit
(1 getragen, 1 von mir selbst heruntergestuft). **Zweimal war nicht der
Befund das Problem, sondern meine Behebung.** Einmal hat der Ausführende
meiner Gegenprobe-Vorgabe mit einer Messung widersprochen und hatte recht.

### Als Nächstes

1. **Beitrag C** — `routes/belehrungen.js` (S2, S3). Zeilennummern vor dem Bau
   neu messen: master ist jetzt `74ace5a`, B hat `belehrungen.js` aber nicht
   angefasst, die Nummern des Papiers sollten halten.
2. **Beitrag A** — `routes/admin/mitarbeiter.js` (S5, S6). **Davor die
   beschlossene vierte Lesung zu S6** (Begründung: drei von drei Entwürfen
   gefallen; Zuschnitt steht am Ende des Papiers).
3. `plaene/auftrag-ladebestand.md` — braucht noch die Planprüfung.
4. B1-09/B1-10 (Namensinvariante Seilgeräte) — noch kein Papier.

### 02:43 UTC — Takt: Beitrag C ist beim Ausführenden, nichts sonst getan

**Auftrag steht seit ~02:00 UTC.** Zweig
`beitrag-c-belehrungen-schreibreihenfolge` von `master` (`74ace5a`), Datei
**nur `routes/belehrungen.js`** plus neue Tests, Umfang S2/S3 mit den
Zusicherungen Z2a/Z2b/Z2c/Z3 aus
`plaene/auftrag-schreibreihenfolge.md`, Abschnitt „3b. Der Bau wird GETEILT".

**Zeilennummern vor dem Auftrag am Stand `74ace5a` nachgemessen** — B hat
`belehrungen.js` nicht angefasst, alle Nummern des Papiers halten:
`schalteAlleFrei` `:2066`, `/neue-version/:id` `:2104` (Rumpf ab `:2158`),
`alteDatei` `:2170`, UPDATE `:2171-2173`, Aufruf `schalteAlleFrei` `:2174`,
`auditAppend` `:2175`, `catch` `:2179`, `unlink` `:2180`; `/loeschen/:id`
`:2284`, `unlinkSync` `:2299`, UPDATE `:2302`.

**Komplexitätseinordnung vor dem Auftrag** (Hausregel Modellwahl): *nicht*
sehr komplex — das Papier leitet jede Entscheidung her, und derselbe
Ausführende hat genau diese Beweisklasse in Beitrag B soeben gebaut. Also
**Standard-Executer**, kein Fable.

**Stand beim Feuern des Takts:** er fährt seit 02:36:27 UTC die volle Suite
als Abschlusslauf. Nach der Takt-Regel — läuft ein Agent, wird nichts getan
ausser den Stand nachziehen — habe ich **`/home/user/gymdocu` nicht
angefasst** und warte auf seine Benachrichtigung.

**Danach:** volles Prüf-Ritual über Beitrag C (Diff Datei für Datei, zwei
unabhängige Prüfspuren, eigene volle Suite + Dateizahl-Ritual + Lint +
Marker-Scan, PR, Review-Bot vor den Checks, CI auf dem passenden `head_sha`,
Squash mit eigener Botschaft samt Schlusszeile und Zurücklesen, Deploy-Lauf
auf dem richtigen `head_sha`, Live-Check).

### 03:45 UTC — Beitrag C geprüft: ein REGRESS, sechs Zusicherungslücken, zwei Befunde gefallen

Der Ausführende hat um ~02:50 UTC gemeldet (Commit `61665d4`, gepusht).
**Kein Merge** — die Prüfung hat einen Regress gefunden.

**Eigene Abnahme:** volle Suite **`SUITE_EXIT=0`**, 0 `✗ FAIL`, Dateizahl-Ritual
**347 = 347** (`diff` EXIT 0), Marker-Scan **6** (alle in `docs/`), alle drei
Arbeitsbäume sauber, Remote = HEAD.

**Zwei Prüfspuren:** `/code-review` (13 Befunde) und der Gegenleser
`gpt-5.6-sol` mit `xhigh` (7 Befunde; Bündel **156.332 Token GEZÄHLT**,
348 s — also am 300-s-Riegel des Egress-Proxy vorbei, `stream: true` trägt;
≈ 1,46 $). Dazu vier eigene. **Jeder einzeln nachgemessen.**

**Der Regress (N1), beide Richtungen gemessen.** Der neue „erst nachsehen,
dann löschen"-Zweig aus B8 benutzt für die Nachsehe-Abfrage DIESELBEN
Parameter, die den ursprünglichen Fehler ausgelöst haben. Sie scheitert
deterministisch mit, `darfWeg` bleibt `false`, die hochgeladene Datei bleibt
liegen — auch wenn nachweislich nichts geschrieben wurde:

| Stand | HTTP | Dateien |
|---|---|---|
| neu | 500 | **0 → 1, bleibt liegen** |
| alt | 500 | 0 → 0, aufgeräumt |

B8 war als Schutz gegen eine verlorene COMMIT-Quittung gedacht und wirkt
jetzt auf JEDEN Fehler. `test_feature_upload_fehlerbehandlung.js:317` fährt
diesen Weg — seither lässt jeder Suite-Lauf eine Datei liegen.

**Die teuersten Zusicherungslücken, alle gemessen:**
* **B8 hat gar keine Zusicherung** — `catch` zurückgedreht: volle Suite
  `SUITE_EXIT=0`, 347 Dateien, **0 FAIL**.
* **Eine Z2c-Zusicherung kann nicht fallen:** `freigeschaltet_am` trägt zwei
  Formate (DEFAULT `2026-09-20 05:34:54`, `CURRENT_TIMESTAMP`
  `2026-09-20 03:34:54.144842+00`).
* **Ein Wächter kann auf dem LIVE-Server grün aus dem falschen Grund werden:**
  `test/run.sh:328` leitet die Testrolle aus der Live-`DATABASE_URL` ab, dort
  ist `pg_stat_activity.query` nicht maskiert.
* **Der Advisory-Lock hat keine Positionszusicherung** (hinter das UPDATE
  verschoben → Suite grün), und die zwei byte-gleichen Inventar-Einträge ohne
  Zeilenanker sind austauschbar.
* **`auditAppend` ohne `t` in einer `db.tx` hängt unauffindbar** — zweite
  Poolverbindung auf denselben Advisory-Key.

**Zwei Befunde FALLEN, und einer davon war meine eigene voreilige Meldung.**
sol hielt die Mandantenlücke im P2-4-Test für ungeprüft; gemessen fängt
`test_feature_audit_batch3.js` die Mutation (**23 PASS / 1 FAIL**). Seine
Beobachtung stimmte, sein Schluss nicht — die Datei lag nicht in seinem
Bündel. Ich hatte ihn im Zwischenstand als tragend gemeldet, VOR der Messung.

**Acht offene Fundorte** stehen in `plaene/durchgang-befunde.md`
(U-LOCK1, U-S3ERR, U-VORL1, U-AUD1, U-STAT1, U-REAP1, U-IDW1, U-Z2C1), jeder
mit Messstand und Begründung, warum er nicht mitfährt.

**Laufend:** Planprüfung des Nacharbeits-Papiers
(`plaene/nacharbeit-beitrag-c.md`, 10 Punkte, 99.077 Token gezählt). Sie läuft,
weil N1 und N4 Produktivcode ändern und bei dieser Klasse dreimal in Folge
nicht der Befund, sondern die BEHEBUNG die Gefahr war.

**Danach:** Executer-Auftrag (Standard, nicht Fable — jede Entscheidung steht
im Papier), dann volles Prüf-Ritual von vorn.

### 03:49 UTC — Planprüfung hat N4 gestrichen; Nacharbeit beauftragt

**Die Planprüfung des Nacharbeits-Papiers hat sich sofort bezahlt gemacht**
(`gpt-5.6-sol`, `xhigh`, 99.201 ein / 27.812 aus, 418 s, ≈ 1,33 $):
6 Befunde, zwei blockierend, **alle vier tragenden Prämissen selbst
nachgemessen**.

**Der teuerste Befund ging gegen MEINEN eigenen Behebungsplan.** N4 wollte
`freigeschaltet_am` auf EIN Format vereinheitlichen, damit eine Z2c-Zusicherung
überhaupt fallen kann. Die Spalte ist aber zugleich das GENERATIONSTOKEN
(`routes/belehrungen.js:963`, `AND freigeschaltet_am = $4` — der Schutz
dagegen, dass eine zwischenzeitlich neu angeforderte Pflicht mitgelöscht
wird), und die `to_char`-Form hat **Sekundenauflösung** (gemessen: `now()` und
`clock_timestamp()` liefern beide `2026-09-20 05:46:37`). Meine
Vereinheitlichung hätte eine mikrosekunden-unwahrscheinliche Kollision in eine
sekundenwahrscheinliche verwandelt — also **genau das Rennen wieder geöffnet,
das dieser Vergleich schliesst.** N4 ist gestrichen; gebaut wird nur die
Testkorrektur (Zusicherung auf `grund` statt auf die Zeit).

**Das ist das VIERTE Mal in Folge bei dieser Klasse, dass nicht der Befund
das Problem war, sondern meine Behebung.** Vorher: eine Transaktion, die eine
Verklemmung eingeführt hätte; ein Reihenfolgentausch, der ein Rennen im
Normalbetrieb eröffnet hätte; ein Wegfall, der den einzigen Löschnachweis
entfernt hätte.

**Drei weitere Berichtigungen an meinem Papier, alle gemessen:**
* **N1 falsch platziert.** Die Merkvariable stand VOR `await db.tx(...)` —
  `core/db.js:457-458` führt `BEGIN` aber erst vor dem Callback aus; wirft
  `pool.connect()` oder `BEGIN`, stünde sie fälschlich auf `true`. Gehört als
  erste Anweisung IN den Callback.
* **N5(a) gestrichen.** Die Zeilennummer in die ERWARTUNGSLISTE zu nehmen
  hätte eine blinde Zusicherung gegen eine getauscht, die bei jeder
  eingefügten Kommentarzeile anschlägt. N5(c) (Positionszusicherung) trägt
  die Lokalisierung ohnehin.
* **N6 eingeengt.** Gemessen: **53 `db.tx`-Callbacks heissen `t`, einer
  `tx`** — ein Wächter auf das Literal hätte schon heute einen Fehlalarm. Und
  lexikalisch lässt sich die Klasse nicht schliessen (ausgelagerte Helfer).
  Der Wächter wird eng gebaut und nennt seine Grenze selbst.

**Drei neue offene Befunde** in `plaene/durchgang-befunde.md`: U-GEN1
(Spalte ist Anzeigezeit UND Generationstoken), U-TS1 (`CURRENT_TIMESTAMP` ist
auf den Transaktionsbeginn eingefroren — seit Beitrag C kann die Zeit
rückwärts springen), U-AUDT1 (repoweiter `auditAppend`-Wächter braucht AST).

**Laufend:** Der Ausführende baut die Nacharbeit (N1, N2, N3, N4-Ersatz, N5b/c,
N6 eng, N7-N10) auf demselben Zweig. Baum für mich gesperrt bis zu seiner
Meldung. Danach volles Prüf-Ritual von vorn.

### 04:40 UTC — Takt: der Ausführende baut, nichts sonst getan

**Die Überschrift des vorigen Abschnitts stand falsch da („05:55 UTC").**
Der Commit lief um **03:49:17 UTC**; ich hatte die Uhrzeit aus einer
PostgreSQL-Messausgabe (`2026-09-20 05:46:37`) abgeschrieben statt sie mit
`date -u` zu messen. Berichtigt. Dieselbe Klasse, die dieser Durchgang
gerade viermal bei anderen angestrichen hat — eine Zahl im Fliesstext, die
niemand gemessen hat.

**Stand:** Der Ausführende arbeitet seit ~03:50 UTC an der Nacharbeit zu
Beitrag C (N1, N2, N3, N4-Ersatz, N5b/c, N6 eng, N7-N10; Papier
`plaene/nacharbeit-beitrag-c.md`). Nach der Takt-Regel — läuft ein Agent,
wird nichts getan ausser den Stand nachziehen — habe ich
**`/home/user/gymdocu` nicht angefasst** und warte auf seine Meldung.

**Nebenbefund, gemessen:** Der Takt-Prompt nennt als Marker-Sollwert für das
Belehrungssystem-Repo „2". Tatsächlich sind es **19**, verteilt auf zehn
Markdown-Dateien (STAND, CLAUDE.md, ASTRA-LAEUFE, sieben Auftragspapiere).
**Keiner steht in ausführbarem Code**, die Bedingung aus CLAUDE.md ist also
erfüllt — dort steht seit dem 16.09.2026 ausdrücklich, dass die ZAHL in
diesem Repo kein Sollwert mehr ist, weil der Scan mitmisst, wie oft wir über
ihn schreiben. Der Prompt ist an dieser Stelle die veraltete Kopie; nach
seiner eigenen Vorrangregel gilt CLAUDE.md. Festgehalten hier statt im
Prompt, weil der Prompt selbst sagt, der Stand gehöre ins Repo.

### 05:55 UTC — Beitrag C: Runde 2 der Nacharbeit abgenommen, PR offen, CI läuft

*(Uhrzeit mit `date -u` gemessen, nicht abgeschrieben.)*

**Zwei Nacharbeitsrunden sind durch.** Der Zweig steht auf `665fdc9`.

**Runde 1 (`0424143`, `b40627d`):** N1-Regress behoben, N2/N3/N5/N6/N7/N8/N9
gebaut, N4 gestrichen. Der Ausführende hat dabei **in meiner eigenen
N1-Vorgabe einen echten Fehler gefunden und gemessen**: `let` im `try`-Block
ist im `catch` nicht sichtbar (Geschwister-Block), jeder Fehlerpfad endete in
einem zweiten, unbehandelten `ReferenceError`. Ich habe die Sprachtatsache
unabhängig nachgemessen — sie stimmt. Dabei bin ich selbst in die Falle
gelaufen, die dieser Durchgang laufend anstreicht: meine erste Probe benutzte
`typeof`, und `typeof` wirft bei einer undeklarierten Variable NIE. Die
Methode konnte die gesuchte Antwort gar nicht erzeugen.

**Zweite Gegenlesung** (Regel: zweite Runde, weil N1 VERHALTEN ändert;
158.043 ein / 24.051 aus, 367 s, ≈ 1,51 $): **10 Befunde, sechs tragen, einer
fällt, drei als offene Befunde.**

**Runde 2 (`665fdc9`) — die vier geschlossenen Lücken, jede von MIR gemessen:**

| Lücke | vorher | nachher |
|---|---|---|
| B8 hatte keine Zusicherung | Suite `SUITE_EXIT=0`, 347 Dateien, **0 FAIL** | 37 → **33 PASS / 4 FAIL** (`status: 404`) |
| Platzierung der Merkvariable ungesichert | **37 PASS / 0 FAIL** | 42 → **41 PASS / 1 FAIL** |
| `auditAppend`-Wächter prüfte falsche Argumentposition | `(…, payload, null, t)`: **14 / 0** | 15 → **14 PASS / 1 FAIL** |
| Lock-Position ungeprüft | Lock hinter UPDATE: Suite grün | 147 → **146 PASS / 1 FAIL** |

Bei der R5-Gegenprobe ist mir selbst ein unsauberes Rot unterlaufen (die
Mutation verdoppelte versehentlich die Locknahme → drei Kreuze aus teils
falschem Grund). Sauber wiederholt: **146 / 1**, genau die N5c-Zusicherung.

**Abnahme (maßgeblicher Lauf):** volle Suite **`SUITE_EXIT=0`**, 0 `✗ FAIL`,
Dateizahl-Ritual **348 = 348** (`diff` EXIT 0), `npm run lint` **`LINT_EXIT=0`**,
Marker-Scan **6**, alle Arbeitsbäume sauber, Zweig nicht hinter master.

**PR ist offen** (nicht als Entwurf), Review-Bot hat noch nichts kommentiert,
CI läuft. Nach Regel 6a geht die Nummer erst raus, wenn auch Deploy und
Live-Check durch sind.

**Bilanz Beitrag C:** 45 Planprüfungs-Befunde + 26 Diffprüfungs-Befunde aus
drei Runden + 6 aus der Planprüfung des Behebungspapiers. **Viermal in Folge
war nicht der Befund die Gefahr, sondern meine Behebung.**

### 06:44 UTC — Beitrag C AUSGELIEFERT; Kimi und DeepSeek sind beschlossen; S6-Lesung läuft

*(Uhrzeit mit `date -u` gemessen.)*

**Beitrag C ist fertig und draussen.** PR #463, Squash als master `7b955ec`,
Merge-Botschaft zurückgelesen (endet exakt an der Schlusszeile), **Deploy-Lauf
431 `success` auf dem richtigen `head_sha`**, `live-check.sh` **EXIT 0**
(zwei Punkte ehrlich ℹ: Zertifikatslaufzeit wegen Egress-Proxy,
Health-Endpunkt von aussen nicht erreichbar). CI vorher vier Jobs `success`,
Review-Bot ohne Kommentare und ohne Reviews.

**Bilanz Beitrag C:** 45 Planprüfungs-Befunde + 26 aus drei Diffprüfungsrunden
+ 6 aus der Planprüfung des Behebungspapiers. **Viermal in Folge war nicht der
Befund die Gefahr, sondern meine Behebung.**

### Der Kimi-Test mit Lösungsschlüssel (Betreiber-Auftrag)

Derselbe Diff, dasselbe Bündel (`md5 b1dba825…`), dieselbe Frage, nur `model`
getauscht — und die Antworten kannte ich vorher.

| | sol (xhigh) | **kimi-k3 (max)** |
|---|---|---|
| Befunde | 7 | **7** |
| getragen | 5 | **6 ganz, 1 im Kern** |
| gefallen | **2** | **0** |
| Kosten | ~1,46 $ | **~1,19 $** |
| Dauer | 348 s | **1401 s** |

**Kimi fand den REGRESS, den sol übersah**, hatte einen Verklemmungsweg, den
keine andere Spur hatte, und **berichtigte meine eigene Prüffrage**: ich hatte
FK-Sperren auf einer Tabelle behauptet, die **gar keinen Fremdschlüssel** hat
(nachgemessen in `core/db.js`). Meine Schlussfolgerung bleibt richtig, ein
Glied der Begründung war falsch.
Die Schwäche zeigte sich, wo die Recherche sie verortet: einen Schaden
beschrieb Kimi konkret und falsch (behauptet einen falschen Audit-Eintrag,
tatsächlich hängt der Aufruf).

### BETREIBER-ENTSCHEIDUNG 20.09.2026

Wörtlich: **„wir nutzen kimi und deepseak."** Dazu seine Beobachtung, jede KI
finde Punkte, die eine andere übersieht — **vierfach gemessen**, Einzelheiten
stehen jetzt in `CLAUDE.md` (Abschnitt Modellwahl). Der brauchbare Teil ist
nicht die Zahl, sondern der Grund: die Spuren unterscheiden sich darin, **was
sie DÜRFEN** (ausführen vs. nur lesen) und **was sie SEHEN** (das Bündel).
Folge: der Hebel ist nicht „noch ein Modell", sondern verschiedene
FÄHIGKEITEN und verschiedenes MATERIAL.

**Offen und beim Betreiber:** Moonshot trainiert laut eigener Erklärung
standardmäßig auf eingereichtem Inhalt; für DeepSeek ist es schlicht
unbekannt (Doku aus dieser Umgebung nicht lesbar). Beide fahren nun mit.

### Laufend: die beschlossene VIERTE Lesung von S6

Grund ist eine Quote, keine Vorsicht: **drei von drei S6-Entwürfen sind
gefallen**, jeder erst beim Gegenlesen (Entwurf 1 → Verklemmungskreis, gefunden
von sol; Entwurf 2 → übersah den Token-erzeugenden Weg, gefunden von kimi).
Entwurf 3 (drei Autocommits) ist ungeprüft.

**Zwei Spuren parallel über dasselbe Material** — und die Auswahl folgt der
Entscheidung von heute: **DeepSeek hat S6 noch NIE gesehen**, ist hier also
das frische Auge; Kimi kennt die Vorgeschichte. Leitfrage in Zustandsform,
dazu ausdrücklich „was wird durch die Behebung SCHLECHTER?".

**Danach:** Beitrag A (S5/S6, `routes/admin/mitarbeiter.js`) — der letzte des
Papiers.

### 07:30 UTC — vierte S6-Lesung ausgewertet, S6 gestrichen, B9 entschieden

**Die Lesung aus dem Abschnitt darüber ist durch.** Zwei Spuren, dasselbe
Material, verschiedenes Vorwissen (DeepSeek kannte S6 nie, Kimi kannte die
Vorgeschichte): **beide lieferten je einen blockierenden Befund, NULL
Überschneidung.** Entwurf 3 ist damit gefallen — Schritt 3 schliesst das
Fenster nicht, weil sein UPDATE unter READ COMMITTED nur sieht, was beim
Statement-Beginn sichtbar war. Zahlen und Einzelheiten: `ASTRA-LAEUFE.md`,
die Ableitung in `plaene/auftrag-schreibreihenfolge.md`, Abschnitt
„ENTSCHEIDUNG 20.09.2026 — S6 wird AUS dem Papier HERAUSGENOMMEN".

**Betreiber-Entscheidung, wörtlich „ohne s6":** S6 und seine Zusicherungen
Z6a/Z6b fahren nicht mit. **Beitrag A besteht nur noch aus S5.** Der
Kandidat für einen eigenen Beitrag (Abweisen beim EINLÖSEN statt Entwerten
beim SCHREIBEN) steht samt seiner gemessenen Schwäche — beide Spalten haben
Sekundenauflösung — im selben Abschnitt.

**B9 ist entschieden**, wörtlich: „zur pin frage: nein soll nicht beendet
werden". Ein direktes PIN-Setzen beendet bestehende Tablet-Sitzungen NICHT;
es bleibt beim heutigen Verhalten, es wird nichts gebaut. Eingetragen in
`plaene/ENTSCHIEDEN.md`, dort auch die Abgrenzung gegen die
Token-Entwertung, die davon unberührt bleibt. Der Abschnitt weiter oben, der
B9 noch als offen führte, ist entsprechend umgeschrieben.

**Damit ist im Papier nichts mehr offen ausser S5 selbst.**

### Als Nächstes: Beitrag A (nur S5) — erster Fall für den neuen Aufbau

`routes/admin/mitarbeiter.js`: drei Routen melden Erfolg, obwohl null Zeilen
betroffen waren. Dieser Beitrag ist der erste, der nach der
Betreiber-Entscheidung vom 20.09.2026 gefahren wird — **jede Lesespur
bekommt ein ANDERES Bündel**, nicht dasselbe:

1. der Diff mit den direkten Nachbarn,
2. der weitere Umkreis (Geschwisterrouten, `core/db.js`, Schema),
3. nur die Zusicherungen und Testdateien.

Frage und Vorspann bleiben gleich. Begründung: bei gleichem Aufbau
überlappten sol und kimi zu mehr als der Hälfte (14 Befunde für 10
verschiedene), bei unterschiedlichem Aufbau lag die Überschneidung zweimal
bei null.

**Danach die noch NICHT gemessene Runde:** die Befunde der drei Spuren gehen
als ausdrücklich **UNGEPRÜFTE BEHAUPTUNGEN** an eine weitere Spur, mit den
Fragen „was haben diese übersehen?" und „welche dieser Behauptungen stützt
sich auf etwas, das im Material nicht steht?". Gemessen wird: wie viele NEUE
Befunde, wie viele Prämissen-Berichtigungen, und ob eine Spur ihre eigene
Klasse verliert (Verankerung). Kein Befund wird verworfen, weil eine andere
Spur das sagt.
