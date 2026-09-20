# Entschieden — nicht erneut fragen, nicht neu aufrollen

Wörtlich übertragen aus dem stündlichen Takt-Prompt, Stand 16.09.2026
04:40 UTC.

## Warum es diese Datei gibt

Diese Beschlüsse standen bis heute an genau EINEM Ort: im Prompt einer
Routine. Gemessen am 16.09.2026 über beide Repos, `*.md`, ohne
`node_modules`:

| gesucht | Belehrungssystem | GymDocu |
|---|---|---|
| `admin_sidebar_v2` | 0 | 0 |
| `Hausworte` | 0 | 0 |
| `Wartungskategorien` | 0 | 0 |
| `Litigation Hold` | 0 | 0 |
| „ausgemustert ist ausgemustert" | nur STAND/ASTRA-LAEUFE | 0 |
| `Durchschreiben statt` | 0 | nur als Stichwort in `docs/offene-befunde-31-08-2026.md` |
| `BESCHNITT_MM` | 0 | nur als Konstante in drei `docs/` |
| „Pop-up bei jeder Defektmeldung" | 0 | 0 |

Ein Routinen-Prompt ist kein Aufbewahrungsort: er lässt sich ändern oder
löschen, er steht unter keiner Versionskontrolle, und `list_triggers`
liefert seinen Text nicht einmal zurück — man bekommt ihn nur zu sehen,
wenn die Routine feuert. Damit hing der Bestand an einer stündlichen
Zustellung.

**Meine eigene Notiz in `plaene/STAND.md` war falsch** und ist dort
berichtigt: der Takt-Prompt sei „eine 8k-Token-Kopie der CLAUDE.md". Ein
Teil von ihm ist das; die beiden Listen unten sind es ausdrücklich NICHT.

**Was diese Datei NICHT ist:** keine Begründung und kein Plan. Sie hält
fest, WAS entschieden ist, damit niemand es erneut fragt. Das WARUM steht,
wo es hergeleitet wurde — bei der Ausmusterung etwa in
`plaene/ausmusterung-plan-v4.md`.

**Nächster Schritt (noch offen):** Sobald diese Datei im Standardzweig
steht, gehören die beiden Listen aus dem Takt-Prompt ENTFERNT und durch
einen Verweis hierher ersetzt. Vorher nicht — sonst ist die einzige Kopie
weg, bevor die neue da ist. Danach gilt die Hausregel „dieselbe Aussage an
zwei Orten" wieder: hier steht sie, dort nicht mehr.

## Vom Betreiber entschieden — nicht erneut fragen

- **#78 angenommen**: Führung durch REIHENFOLGE, nichts sperren. Hausworte
  bleiben.
- **GH #236 (Wartung = Einzelgeräte): ja.** Erst NACH #57.
- **Wartungskategorien bleiben.** Nicht umbenennen.
- **admin_sidebar_v2 ist ABGEBAUT.**
- **Durchschreiben statt Überlagern** (01.09.2026).
- **Großes Pop-up bei jeder Defektmeldung** (31.08.2026).
- **`BESCHNITT_MM = 2` bleibt vorerst stehen** (13.09.2026): die Druckerei
  hat noch nicht geantwortet. Nicht raten, nicht ändern, nicht erneut
  fragen.
- **Die Scanner-Klasse wird über den PARAMETRIERTEN Helfer geschlossen**
  (14.09.2026).
- **In der Darstellung KEINE optischen Unterschiede zwischen den
  Prüfkategorien** (15.09.2026). Umgesetzt mit #442.
- **AUSMUSTERUNG, Entscheidungen vom 15.09.2026:**
  1. **Geräte müssen auch mit OFFENEM Mangel deaktiviert werden können.**
     Wörtlich: „gerät so defekt, dass es nicht mehr repariert werden kann
     oder soll. es wird verkauft oder verschrottet. es vorher zu reparieren
     wäre kompletter unsinn."
  2. **Der offene Mangel wird dabei mit einem eigenen Grund „ausgemustert"
     geschlossen** — ausdrücklich KEINE Reparatur, eigenes Kennzeichen.
     Verworfen: offen lassen; aus den Listen ausblenden.
  3. **Reaktivierung nach Ausmusterung: NEIN.** Wörtlich: „ausgemustert ist
     ausgemustert."
  4. **Der Bestätigungsschritt beim Ausmustern ist entschieden und wird
     gebaut** — die Rückfrage dazu ist NICHT mehr offen (Begründung in
     `plaene/ausmusterung-plan-v4.md`, Abschnitt 0). Nicht erneut fragen.

- **RECHTSSTAND-WÄCHTER, 16.09.2026: Stufe 1 genügt vorerst.** Wörtlich:
  „stufe 1 sollte erst mal genug sein aber nimm den rest in dein gedächtniss".
  Gebaut wird also NUR der Normtext-Fingerabdruck je Fundstelle
  (`plaene/rechtsstand-kette-plan.md`, Stufe 1). Stufe 2 (mittelbare
  Betroffenheit über Verweisungen) ist NICHT verworfen, sondern
  zurückgestellt — sie steht als offener Punkt in `plaene/STAND.md`. Nicht
  erneut fragen; wer sie bauen will, holt vorher eine Entscheidung.

- **AUSMUSTERUNG, 16.09.2026: bei Block-2/3-Kandidaten wird KEINE `geraet_id`
  geschrieben.** Betreiber folgt der Empfehlung. Begründung: eine geschriebene
  Zuordnung liesse eine nur über den Namen geratene Zeile im Datenmodell
  genauso „sicher zugeordnet" aussehen wie eine bewiesene — an einer
  unwiderruflich geschlossenen Zeile. Die drei Blöcke existieren gerade, um
  diese Unsicherheit auszudrücken.
  **ABER: die Empfehlung stützte sich auf einen halb falschen Satz von mir**
  („die Information steht im Audit-Eintrag"). Nachgemessen: der Eintrag
  `geraet_ausgemustert` trägt `mangel_ids` und `anzahl` — die IDs also, NICHT
  die Blockherkunft. Damit ist nach der Ausmusterung nirgends mehr feststellbar,
  welcher geschlossene Mangel sicher zugeordnet war und welcher geraten.
  **Folge, und sie gehört zur Entscheidung:** das Audit muss die Blockherkunft
  je ID mitschreiben. Erst dann trifft zu, was die Entscheidung voraussetzt.
  Kleiner Zusatz, gehört zu Beitrag 2b-1, VOR dem Merge.

- **PIN-SETZEN BEENDET KEINE TABLET-SITZUNG (20.09.2026).** Wörtlich: „zur
  pin frage: nein soll nicht beendet werden". Damit ist B9 aus
  `plaene/auftrag-schreibreihenfolge.md` entschieden: setzt ein Admin einem
  Mitarbeiter direkt eine PIN, laufen dessen bestehende Tablet-Sitzungen
  WEITER. Es wird also KEIN Credential-Reset daraus gemacht — weder im
  Admin-Weg noch im öffentlichen PIN-Weg (`routes/mitarbeiter-auth.js`,
  PIN-Setzen über Einmaltoken). Das ist der heutige Zustand: bestehende
  Sitzungen prüfen `pin_hash` nicht erneut. Es wird nichts gebaut, und die
  Frage wird nicht erneut gestellt.
  **Was davon UNBERÜHRT bleibt und nicht mit weggeworfen werden darf:** die
  Entwertung der EINMALTOKEN beim PIN-Setzen. Sie ist kein Sitzungsende,
  sondern verhindert, dass mit demselben Einladungs- oder Reset-Link ein
  zweites Mal eine PIN gesetzt wird. Sie steht heute in BEIDEN Wegen
  (`routes/admin/mitarbeiter.js:762`, `routes/mitarbeiter-auth.js:293-300`)
  und bleibt. Offen ist allein ihre SCHREIBREIHENFOLGE im Admin-Weg (dort
  PIN zuerst, Tokens danach, beides Autocommit) — das war S6, und S6 ist am
  20.09.2026 auf Betreiber-Wunsch („ohne s6") AUS dem Papier genommen
  worden. Wer es später aufgreift, tut das als eigenen Beitrag und liest
  vorher die drei gefallenen Entwürfe in
  `plaene/auftrag-schreibreihenfolge.md`.

## Berichtigungen — nicht neu aufrollen

1. Zuständigkeit ist auf allen sechs Schreibwegen erzwungen (#14).
2. Litigation Hold `mitarbeiter_einweisungen`/`mitarbeiter_nachweise`:
   keine Lücke.
3. Kontrast: maßgeblich `#2F6B9E:#101113` = 3,34 BESTANDEN.
4. „PDF-Textextraktion verdreht die Reihenfolge" ist WIDERLEGT.
5. **Aufgabennotizen veralten.** Zeilennummern vor jedem Bau NEU messen.
6. Der Tablet-QR auf dem Dashboard ist KEIN Defekt.
7. #56, #60, #62, #63 sind erledigt.
8. „Gerät 4 berichtigen" ist ERLEDIGT (#292).
9. `core/pdf-engine.js` liest KEINE Korrektur-Überlagerung.
10. `.seil-sperr-karte` ist seit #291 korrigiert.
11. Der QR-Bestellweg ist seit 06.09.2026 fertig und ausgeliefert
    (#359–#364).
12. Der Gedankenstrich geht NICHT im PDF verloren, sondern im Prüfhelfer
    (`latin1`-Dekodierung).
13. Die Zeitzonenfallen-Klasse ist ZU und bewacht (#432).
14. Der Studio-Wächter-Hinweis ist erklärt — kein Defekt.
15. OFFEN 2 ist beantwortet UND behoben (#433).
16. `/admin/archiv` schneidet nichts mehr ab (#434).
17. Die Ursachenbeschreibung „ohne `min-width:0`" ist berichtigt (#435).
18. Der Verzeichnis-Scan der DATUMS-Wächter ist gemeinsam (#436).
19. Der Erfassungsbereich ist PFLICHTPARAMETER des Helfers (#437).
20. Der Rohwert-Scan hängt am Helfer, und der Vergleich misst nicht mehr
    beide Seiten mit demselben Sieb (#438).
21. Eine Darstellung für offene Mängel über alle drei Prüfarten (#442,
    Deploy 410).
22. **Die Zusicherungen binden das UNTERSUCHEN, nicht nur das AUFLISTEN**
    (#443, Deploy 411).
23. **Die beiden letzten Verbraucher von `test/rohwert-scan.js` sind
    gebunden** (#444, Deploy 412). ACHT Wächter hängen am gemeinsamen
    Helfer. Nicht neu aufrollen.

## Arbeitsweise, die nur im Takt-Prompt stand

Diese Punkte sind beim Eindampfen ebenfalls zu prüfen und dürfen nicht mit
den echten Kopien zusammen gestrichen werden. Gemessen am 16.09.2026 über
alle `*.md` BEIDER Repos (ohne `node_modules`): `405`, `get_comments`,
`Standardzweig` und „merge wenn grün" kommen nirgends vor; `head_sha` nur
als Protokoll vergangener Deploys, nie als Regel; der einzige `405`-Treffer
im GymDocu-Repo ist eine Zeilennummer (`geraete.js:399-405`), nicht der
HTTP-Status.

- **Der PR wird NICHT als Entwurf angelegt** — sonst HTTP 405 beim Merge.
- **Die CI-Grünmeldung muss zum AKTUELLEN Zweigkopf gehören**: vor dem
  Merge den `head_sha` des grünen Laufs gegen den Zweigkopf halten.
- **Vor dem Merge die KOMMENTARE des Review-Bots lesen, nicht nur seinen
  Check** (`pull_request_read` mit `method: get_comments` VOR
  `get_check_runs`). Gemessen am 15.09.2026 an #444: Check `success`,
  während im Kommentar „should not merge until…" stand.
- **Läuft beim Feuern des Takts noch eine Suite oder ein Agent: nichts tun
  außer den Stand nachziehen.**
- **Der Standardzweig heißt nicht überall gleich:** GymDocu `master`,
  Belehrungssystem `main`.
- **Der Betreiber mag kurze Antworten, immer auf Deutsch.** Die Freigabe
  „merge wenn grün" gilt fort.

## Der Zweck des Produkts — Betreiber-Vorgabe 16.09.2026

Wörtlich: *„ich möchte eigentlich nur ein software die die betreiberpflichten
protokolliert. alles darüber hinaus ist luxus"*

Das ist die schärfste Fassung des Zuschnitts, die es bisher gibt, und sie
entscheidet Zweifelsfälle: **Was eine Betreiberpflicht dokumentiert, gehört
dazu. Was den Betrieb bequemer macht, ist Luxus und wird einzeln begründet.**

Anlass war die Orbit4-Recherche (`plaene/wettbewerb-orbit4.md`) und die Frage,
wie weit wir deren Ideen übernehmen. Ergebnis der Anwendung dieser Regel auf
die vier Vorschläge von dort:

- **Gerätealter und Mängelhistorie an der Ausmusterung** — wird gebaut. Nicht
  weil es bequem ist, sondern weil die Entscheidung „weiterbenutzen oder
  ausmustern" selbst dokumentationspflichtig ist und heute ohne Grundlage
  getroffen wird.
- **Manuelle Zwischenstände beim Mangel** („Techniker beauftragt",
  „Ersatzteil fehlt") — NICHT gebaut. Sie wären Mehraufwand für das Personal
  bei geringem Nachweiswert (Betreiber-Einwand 16.09.2026).
- **Gerätebezug für den Dienstleisterbesuch** — zurückgestellt, nicht
  verworfen. Er kostet fast nichts, weil `dienstleister` (Firma,
  Mitarbeiter, Ankunft, Abfahrt, Tätigkeit, Servicefallnummer, Unterschrift)
  bereits erfasst wird und nur der Bezug zum Gerät fehlt.
- **Anbindung an ein fremdes Ticketsystem** — Luxus, wird NICHT gebaut.
  **Vom Betreiber ausdrücklich entschieden, 16.09.2026, wörtlich: „ok. wir
  lassen jira weg".** Das ist eine Entscheidung, keine Empfehlung von mir —
  nicht erneut aufrollen. Die Begründungen unten erklären sie nur.

### Zur Jira-Frage — meine Behauptung war falsch, gemessen

Ich hatte behauptet, Ketten nutzten Jira nicht für diesen Vorgang, wir bauten
also „gegen das System, das die wenigsten Kunden haben". **Widerlegt am
16.09.2026 an einer Primärquelle:** FitX (nach eigener Darstellung
Deutschlands zweitgrösster Anbieter, 95 Studios) führt seit 2021 Jira Service
Management als Serviceportal — wörtlich „problems, malfunctions and damage
can be easily reported and specifically processed in all 95 fitness studios",
Meldung durch das Studiopersonal, Bearbeitung durch mehrere Teams in der
Zentrale (catworkx/TIMETOACT, Referenzseite).

**Der Grund fiel damit weg, die Entscheidung bleibt — aus einem anderen:**
Wo bereits in Jira gemeldet wird, wäre eine Anbindung eine ZWEITE TÜR in
einen fremden Arbeitsablauf, und es stünde sofort die Frage im Raum, welches
System führt. Die beiden Aufzeichnungen sind ausserdem verschieden: Jira ist
der Betriebsablauf, wir sind der Nachweis. Dazu kommt, dass ein Zustand aus
einem fremden System in einer gehashten Kette von niemandem stammt, den wir
benennen können — er dürfte dort nur als „gemeldet von System X" stehen, nie
so, als hätte ihn ein Mensch bestätigt.

**Was stattdessen gilt und heute schon geht:** `dienstleister.servicefallnummer`
existiert bereits. Eine Kette trägt dort ihren Jira-Vorgang ein; damit sind
beide Aufzeichnungen verknüpft, ohne dass wir etwas anbinden.

**Falls die Frage je wieder aufkommt**, ist der richtige Zuschnitt NICHT
„Jira", sondern ein generischer Eingangsweg (Webhook oder Studio-Mailadresse),
der genau eine Zeile schreibt: „externer Vorgang \<Servicefallnummer\> meldet
Status X am \<Zeit\>". Das passt auf Jira, auf das System der Servicefirma und
auf alles andere — und die Herkunft bleibt ehrlich. Bis dahin: nicht bauen.
