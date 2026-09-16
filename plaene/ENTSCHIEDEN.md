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
