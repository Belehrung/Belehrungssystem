# Beitrag 2b-1 (Fassung 3) — Die Ausmusterung auslösbar machen

Arbeitsbaum `/home/user/gymdocu`, **Stand `master` = 613a2c9**. Neuer Zweig
`claude/ausmusterung-ausloesen`. Der Baum gehört dir allein.

**Zwei Planprüfungen, 20 Befunde, 11 von mir selbst nachgemessen.** Fassung 1
und 2 wurden beide NICHT freigegeben. Wo unten „Fassung 1/2 hatte …" steht,
ist das ein Warnschild.

**Die wichtigste Änderung gegenüber Fassung 2 ist eine STREICHUNG**, keine
Verfeinerung: der Abschnitt, der in JEDEM Erzeuger eines Mangels eine
Geräteprüfung verlangte, ist weg. Begründung in Abschnitt 6.

## Vorgeschichte

Teil 2a ist gemergt (#447): Datenmodell (Migration 0057) und alle Leser. Drei
Kopplungs-CHECKs greifen SOFORT, nicht erst beim Commit. Keine Route erzeugt
den Zustand — das baust du. **Keine neue Migration nötig.**

## Unverhandelbar

- **JEDE Abfrage trägt `studio_id`.**
- Dieselbe Suite läuft auf dem Live-Server als Deploy-Gate.
- **`db.q`/`db.run` benutzen den POOL** (`core/db.js:421-432`).
- **`auditAppend()` nimmt einen studioweiten Advisory-Lock**
  (`core/integritaet.js:65`), auch mit `t`.
- **KEINE neue globale Lock-Klasse, und KEINE neue Lock-Kante.**
- **`db.tx()` committet JEDEN normal zurückgegebenen Wert** — von mir gemessen
  (`core/db.js:457-460`: `BEGIN`, `callback`, `COMMIT`, `return`). Nur ein
  GEWORFENER Fehler rollt zurück. `return { fehler: … }` ist KEIN Abbruch.
- Zeitstempel über `jetztISO()` (`core/datum.js`, Berlin-Zeit); Token-Fristen
  numerisch über `Date.now()`.
- KEINE Modellnamen im Repo.
- Mutationsskript: Zielpfad als ARGUMENT, Abbruch bei nicht GENAU EINEM
  Treffer, Marker in derselben Zeile, Rücknahme über eine vorher
  beiseitegelegte Kopie. Marker-Sollwert 6, Ausschluss auf den PFAD.
- Einzelläufe: Test-DB auf `_test`, `DATABASE_URL` aus `.env` mit getauschtem
  Namen, `createdb -O <rolle>`.
- Der PreToolUse-Wächter lehnt den GANZEN Befehl ab, wenn ein Testlauf in eine
  Pipe geht.
- Committe und pushe, BEVOR du auf einen Hintergrundlauf wartest.

## 0. ZWEI Übergänge — und sie sehen JE TYP anders aus

**Fassung 1 machte jede Deaktivierung unwiderruflich.** Gemessen:
`test_feature_geraeteseite_typen.js:289-306` bewacht Deaktivieren →
Reaktivieren → `aktiv=1`; `:395-409` verlangt, dass `stillgelegt_seit` dabei
wieder NULL wird.

**Fassung 2 formulierte den gewöhnlichen Weg Cardio/Kraft-förmig und wandte
ihn allgemein an.** Gemessen: für die Seilkontrolle gibt es diesen Weg gar
nicht — der mängelfreie Weg dort ist ein LÖSCHWEG mit Audit `geraet_geloescht`
(`routes/admin/geraete.js:384-386`), und die Suite verlangt für die frühere
Reaktivierungsroute ausdrücklich **404** (`test_feature_geraete_loeschen.js:309-315`).

**Verbindlich:**

- **Cardio/Kraft, gewöhnlich deaktivieren** (keine offenen Mängel ODER keiner
  bestätigt zugeordnet, s. Abschnitt 1): wie heute — `aktiv=0`,
  `stillgelegt_seit` gesetzt, **KEIN `ausgemustert_am`**, reaktivierbar, Audit
  `geraet_stillgelegt`. Unverändert.
- **Seilkontrolle, mängelfrei:** der bestehende Löschweg bleibt unverändert,
  samt Audit `geraet_geloescht` und fehlender Reaktivierungsroute. **Baue dort
  keinen neuen Rückweg.**
- **Ausmustern** (beide Typen, mindestens ein bestätigt zugeordneter offener
  Mangel): Bestätigungsseite, danach endgültig — `ausgemustert_am` gesetzt,
  Audit `geraet_ausgemustert`, Reaktivierung gesperrt (Abschnitt 7).

Die Unwiderruflichkeit hängt am ABSCHLUSS dokumentierter Mängel.

## 1. Kandidaten UND Auswahl — drei Mengen, sauber getrennt

**Fassung 1 hatte Block 2 vorausgewählt.** Gemessen: kein UNIQUE-Schutz auf
`geraete` für (studio_id, typ, name), gleichnamige Geräte ausdrücklich erlaubt
(`routes/admin/geraete-typen.js:46-52`), Tagescheck schreibt keine `geraet_id`
(`routes/sichtpruefung.js:2531-2537`). Zwei „Laufband" mit je einem Mangel →
beide in Block 2, beide angekreuzt, ein Klick schliesst beide.

**Fassung 2 hielt Kandidatenzahl und bestätigte Zuordnung nicht auseinander.**
Zwei Folgen: eine LEERE Auswahl hätte den unwiderruflichen Stempel gesetzt,
ohne einen einzigen Mangel zu schliessen; und ein sicher zugeordneter Mangel
liess sich ABWÄHLEN — das Gerät wäre ausgemustert und sein eigener Mangel
bliebe offen und unsichtbar (`core/seilgeraete.js:43` lädt nur aktive Geräte).

**Verbindlich — drei Mengen:**

- **SICHER ZUGEORDNET (Block 1):** `status='offen'`, `geraet_id = <id>`.
  Vorausgewählt **und nicht abwählbar**. Ein POST, der einen davon auslässt,
  wird ABGEWIESEN. Bei der Seilkontrolle sind das alle aktiven Sperren des
  Geräts — der bestehende Freigabeweg löst ebenfalls ALLE in EINEM UPDATE
  (`routes/module.js:1349-1352`, Begründung dort: eine Einzel-Freigabe liess
  die ältere aktiv).
- **ANGEBOTEN (Blöcke 2 und 3, nur Cardio/Kraft):** Block 2 `geraet_id IS NULL`
  und gleicher Name, Block 3 `geraet_id IS NULL` und abweichender Name.
  **BEIDE nicht vorausgewählt.** Die Überschrift sagt, dass die Zuordnung
  nicht gesichert ist.
- **BESTÄTIGT AUSGEWÄHLT:** Block 1 vollständig plus das, was der Admin aus
  2/3 ankreuzt.

**Ausgemustert wird nur, wenn die bestätigte Auswahl mindestens EINEN Mangel
enthält, der tatsächlich geschlossen wird.** Sind nur unzugeordnete Kandidaten
da und keiner angekreuzt, ist das eine GEWÖHNLICHE Deaktivierung (Abschnitt 0)
— nicht eine Ausmusterung ohne Mangel.

Eine Zeile mit `geraet_id` = ANDERES Gerät erscheint in KEINEM Block.

**Zur Entscheidungsgrundlage** (Prüfung Runde 2): zeige je Kandidat
Befunddatum, Erfasser und den Mangeltext, nicht nur Name/Standort/Seriennummer
— und mach sichtbar, wenn die Unterscheidungsmerkmale fehlen ODER wenn es im
selben Studio und Typ ein WEITERES gleichnamiges Gerät gibt, zu dem derselbe
Kandidat passen würde. **Halte im Bericht fest, dass eine wirklich
unentscheidbare Zuordnung damit immer noch möglich ist** — das ist ein
bekannter Rest, kein gelöstes Problem.

**Ins Audit gehört dauerhaft, WELCHE Mangel-IDs welchem Gerät zugeordnet
wurden.** Der Schnappschuss aus Abschnitt 2 verschwindet; das Audit bleibt.

## 2. Das Token bindet die HANDLUNG

**Fassung 1 band es nur ans Studio** — der Fingerabdruck ist für zwei Geräte
desselben Studios und Bereichs identisch, ein Token für A liess sich an einen
POST für B hängen.

**Verbindlich — der serverseitige Eintrag trägt mindestens:** `studio_id`,
Geräte-ID, Typ, Aktionsart, den Kandidaten-Schnappschuss, Ablaufzeit,
Verbrauchszustand. **Die Route prüft GEGEN DIESE WERTE** und übernimmt das
Ziel nie aus dem POST allein. Das Beanspruchen ist exklusiv und passiert VOR
dem ersten `await` auf die Datenbank.

Kurzzeitspeicher im Prozess: pm2 `instances: 1, exec_mode: 'fork'`
(`ecosystem.config.js:17`, gemessen). Vorbilder `core/verify-schutz.js:8`,
`core/2fa.js:53`. **Einprozess-Annahme samt Fundstelle als Kommentar
danebenschreiben.**

## 3. Fingerabdruck über die BESTÄTIGUNGSANSICHT — und er muss halten

**Fassung 1 hashte zu wenig** (Umbenennen, Standort/Seriennummer und eine
reine Verschärfung der Nutzungsentscheidung berührten keines der Felder).
**Fassung 2 hashte genug, aber der Schutz endete beim Vergleich** — die
Mangelzeilen waren danach ungesperrt, ein Schreiber konnte committen, die
Zeile blieb offen und typgleich, und das Abschluss-UPDATE traf sie weiter.

**Verbindlich:**

- Gehasht wird alles, was auf der Seite ANGEZEIGT wird und die Entscheidung
  trägt: Geräteidentität und -merkmale, je Kandidat die Blockzuordnung,
  Nutzungsentscheidung und -auflage, Befunddatum, Erfasser, Mangeltext.
- Der kanonische Altstand wird mitgespeichert, damit „WAS hat sich geändert"
  wirklich beantwortbar ist. Eine Änderung kann bei GLEICHEM N auftreten — die
  Meldung darf dann nicht behaupten, N habe sich geändert.
- **Die Kandidatenzeilen werden VOR dem massgeblichen Lesen gesperrt**
  (`FOR UPDATE`), damit der verglichene Stand bis zum Abschluss hält.
- **Bekannter Rest, ausdrücklich NICHT gelöst:** eine Korrektur-Überlagerung
  wird in `nachweis_korrekturen` eingefügt (`core/korrekturen.js:916-927`) und
  von einem Zeilen-Lock auf der Mangelzeile nicht verhindert. Halte das im
  Bericht fest.

## 4. Die Transaktion

1. **Nur bei Seilkontrolle:** `SELECT pg_advisory_xact_lock($1)` (Studio) —
   ZUERST. Begründung in Abschnitt 5.
2. Gerät `SELECT … FOR UPDATE`. **Trägt es schon `ausgemustert_am`, ist das
   ein Endzustand: sofort abbrechen, VOR jeder Mangeländerung.**
3. Kandidatenzeilen `SELECT … FOR UPDATE`.
4. Bestätigungsansicht neu aufbauen, Fingerabdruck vergleichen. Ungleich →
   Abbruch mit dem konkreten Unterschied.
5. Auswahl prüfen: Block 1 vollständig enthalten, alles Übrige aus der
   angebotenen Menge, mindestens einer insgesamt (Abschnitt 1).
6. `UPDATE geraete_defekte SET status='ausgemustert', ausgemustert_am=$1,
   ausgemustert_durch=$2 WHERE studio_id=$3 AND id=ANY($4) AND status='offen'
   AND typ=$5 RETURNING id` — die Menge MUSS der Auswahl entsprechen.
7. Seilkontrolle entsprechend über `geraete_sperren … AND aktiv=1 RETURNING id`.
8. `UPDATE geraete SET aktiv=0, stillgelegt_seit=COALESCE(stillgelegt_seit,$1),
   ausgemustert_am=$1, ausgemustert_durch=$2 WHERE studio_id=$3 AND id=$4 AND
   typ=$5 AND ausgemustert_am IS NULL` — **`rowCount` MUSS 1 sein.**
9. Audit `geraet_ausgemustert` mit den zugeordneten Mangel-IDs. Beschriftung in
   `core/audit-filter.js` ergänzen (Vorbild `:92-93`).

**JEDE unerwartete Trefferzahl in 6, 7 oder 8 führt zu einem GEWORFENEN Fehler
und damit zum ROLLBACK** — niemals zu `return`, `[]`, `N=0` oder einem
Erfolgs-Redirect. **Fassung 2 hatte hier ihren schwersten Rest:** der
Zustandsfilter in Schritt 8 schützt den Gerätestempel, aber nicht die in 6/7
bereits geschlossenen Mängel; ein `return` danach hätte sie COMMITTET.
`routes/admin/geraete.js:366-375` zeigt den Zustandsfilter als Vorbild.

**PostgreSQL zählt auch ein UPDATE als Treffer, das dieselben Werte erneut
setzt** — `rowCount` allein belegt keinen Übergang, deshalb der
`ausgemustert_am IS NULL`-Filter.

Die Kopplungs-CHECKs greifen sofort: `status` und `ausgemustert_am` im SELBEN
UPDATE, `aktiv=0` und `ausgemustert_am` im SELBEN UPDATE.

## 5. Lock-Reihenfolge — festgelegt, nicht gewählt

**Fassung 2 sagte „miss die vorhandenen und wähle die passende". Gemessen: es
gibt keine einheitliche.** Der Cardio/Kraft-Reparaturweg nimmt die Defektzeile
zuerst, dann den Studio-Lock (`routes/sichtpruefung.js:3083` → `:3100`); die
eigenständige Seil-Freigabe nimmt den Studio-Lock ZUERST, dann die Sperrenzeile
(`routes/module.js:1301` → `:1303`).

**Verbindlich — je Route die Ordnung des dortigen Bestands:**

- **Cardio/Kraft:** Gerätezeile → Defektzeilen → (Audit nimmt den Studio-Lock).
  Passt zum Reparaturweg.
- **Seilkontrolle:** Studio-Lock ZUERST → Gerätezeile → Sperrenzeilen. Passt
  zur eigenständigen Freigabe.

Advisory-Locks sind innerhalb derselben Transaktion wiedereintrittsfähig, der
spätere Griff in `auditAppend` stört also nicht. **Schreib die Begründung samt
den beiden Fundstellen als Kommentar daneben** — sonst räumt sie jemand als
„inkonsistent" wieder weg.

Behandle SQLSTATE `40P01` ehrlich als fehlgeschlagenen Vorgang.

## 6. GESTRICHEN: die Prüfung in jedem Erzeuger

Fassung 2 verlangte, dass JEDER Erzeuger eines Mangels unmittelbar vor dem
INSERT prüft, ob das Zielgerät ausgemustert ist. **Das wird NICHT gebaut.**
Drei gemessene Gründe:

1. **Es serialisiert nicht.** `db.tx()` macht ein gewöhnliches `BEGIN`; der
   Geräte-Lock der Ausmusterung blockiert einen gewöhnlichen SELECT des
   Erzeugers nicht. Lesen → Ausmusterung committet → INSERT bleibt möglich.
2. **Die naheliegende Absicherung erzeugt eine NEUE Verklemmungs-Kante.** Ein
   wirksamer Geräte-Lock unmittelbar vor dem Seil-INSERT würde vom Tagescheck
   NACH dem Audit genommen: Ausmusterung hält das Gerät und wartet auf den
   Studio-Lock, der Tagescheck hält den Studio-Lock und wartet auf das Gerät.
3. **Die Wartung benutzt eine andere ID-Domäne.** Ihr Sperren-INSERT
   (`routes/wartung.js:1305`) schreibt eine `wartung_geraete.id`, nicht eine
   `geraete.id`; das Bindeglied ist `wartung_geraete.geraet_id`
   (`core/db.js:808-815`). Eine pauschale Prüfung liefe gegen die falsche
   Tabelle.

**Was stattdessen gilt:** der Wettlauf bleibt ein BEKANNTER, festgehaltener
Rest — ein Erzeuger kann unmittelbar nach einer Ausmusterung noch einen
offenen Mangel an das Gerät hängen. Sichtbar wird er über Beitrag 2b-2 (Rückweg
für inaktive Geräte mit offenen Mängeln), der unmittelbar danach kommt.
**Schreib den Rest in den Kopfkommentar der neuen Route**, mit den drei
Gründen. Ein sauberer Lock-Plan für die gemeinsam betroffenen Wege ist ein
eigener Auftrag.

## 7. Reaktivierung gesperrt an der ROUTE

`routes/admin/geraete-typen.js:524`: `AND ausgemustert_am IS NULL` in die
WHERE-Klausel — an der Route, nicht nur am Knopf. **Nur Cardio/Kraft**; die
Seilkontrolle hat keine Reaktivierungsroute, und die Suite verlangt dort 404
(Abschnitt 0). Ein gewöhnlich deaktiviertes Gerät bleibt reaktivierbar.

## 8. Bestehende Wächter

Fachlich umstellen, nie ersatzlos streichen. **Prüfe jede Stelle selbst und
melde, was du vorgefunden hast:**

- `test_feature_admin_lifecycle.js:101-107`
- `test_feature_geraete_loeschen.js:173-180`, `:281-291` (Idempotenz prüft
  zusätzlich den unveränderten Zeitstempel), `:309-315` (404), `:355-369`
- `test_feature_geraeteseite_typen.js:289-306`, `:395-409` — **die dürfen
  NICHT fallen** (Abschnitt 0).
- `test_feature_audit_kapselung_geraete_static.js:389-397`: feste Sollmenge
  `=== 3`. **NICHT mechanisch auf 4 erhöhen** — der Scanner liest laut
  Prüfung nur `routes/admin/geraete.js` (`:71-73`). Miss selbst, ob dein Audit
  überhaupt in seinen Bereich fällt, und melde das Ergebnis.

Such nach Zustandsübergängen, Audit-Ereignissen und Lock-Zusicherungen, nicht
nur nach Meldungstexten.

## 9. Gegenproben

Zu jeder: `node --check`; bei GRÜN prüfen, ob die Mutation angekommen ist
(eine ZAHL nennen). Sollzahlen unabhängig hinschreiben. **Jede Schutzstelle
EINZELN isolieren — mehrere Schichten können einander verdecken.**

- **Schnappschuss (i):** zusätzliche zulässige, NICHT gewählte Zeile; die
  gewählte bleibt offen. Mutation: nur die Vergleichs-Abbruchstelle. Soll 0
  Abschlüsse, sabotiert 1.
- **Schnappschuss (ii):** NUR ein Textfeld ändern. Mutation: genau dieses Feld
  aus dem Hash nehmen. Soll 0, sabotiert 1.
- **Schnappschuss (iii), Pause NACH der Neulesung:** ein Schreiber ändert die
  Nutzungsentscheidung, nachdem der Vergleich lief. Mit den Zeilen-Locks aus
  Abschnitt 3 muss er warten; ohne sie geht er durch. Mutation: `FOR UPDATE`
  auf den Kandidaten entfernen.
- **Teilauswahl:** beide Mängel `geraet_id IS NULL`, gleicher Name, einer
  angekreuzt. Mutation: Auswahl durch Kandidatenmenge ersetzen. Soll 1/1,
  sabotiert 2/0.
- **Block 1 nicht abwählbar:** POST, der einen sicher zugeordneten Mangel
  auslässt → ABGEWIESEN, 0 Abschlüsse.
- **Leere Auswahl:** nur unzugeordnete Kandidaten, keiner angekreuzt → GEWÖHNLICHE
  Deaktivierung, **kein** `ausgemustert_am`, danach reaktivierbar.
- **Fremdzuordnung:** anderes Gerät im SELBEN Studio, SELBEN Typ, GLEICHEM
  Namen. Anzeige und POST getrennt. **Beide serverseitigen Auswahlprüfungen
  einzeln isolieren** — eine Mutation nur am UPDATE reicht nicht.
- **Rollback bei Nulltreffer:** Gerät trägt schon `ausgemustert_am`, Kandidaten
  offen. Soll: Abbruch VOR jeder Mangeländerung, 0 geschlossen. Mutation: den
  Endzustands-Riegel aus Schritt 2 entfernen → dann MUSS der Nulltreffer in
  Schritt 8 werfen und 0 geschlossene Mängel hinterlassen.
- **Reaktivierungssperre:** Vorzustand inaktiv UND ausgemustert; Mutation nur
  `AND ausgemustert_am IS NULL`. Soll `aktiv=0`, sabotiert `aktiv=1`. Plus
  Positivkontrolle inaktiv/NICHT ausgemustert → gelingt.
- **Mandantentrennung, vier getrennte Zusicherungen:** fremder Gerätename
  nicht angezeigt (mit UNTERSCHEIDBAREN Namen), fremde Kandidaten-ID nicht
  angeboten, fremde ID mitgesendet abgewiesen, fremde Geräte-ID als Routenziel
  abgewiesen. B-Fixtur VOR allen A-Läufen. **Ein grüner Einzelmutant belegt
  hier nichts** — IDs sind global eindeutig; redundante Filter ISOLIERT prüfen.
- **Doppelte Absendung:** Token-Replay und DB-Idempotenz GETRENNT. Für letztere
  das UPDATE wirklich erneut erreichen (zwei feste Zeitpunkte). Soll:
  Audit-Anzahl 1, Gerätezeitstempel exakt der ERSTE, zweites Geräte-UPDATE
  trifft 0, keine weiteren Mangeländerungen.
- **Token, fremdes Studio:** sonst gültige lokale Werte; zusätzlich den
  ABLEHNUNGSGRUND prüfen (Tokenbindung, 0 DB-Aufrufe) — sonst verdeckt der
  spätere Hashvergleich die fehlende Bindung.
- **Token, anderes Gerät:** gleiches Studio, gleicher Typ. **Besonders leicht
  verdeckt**, weil die Geräteidentität inzwischen im Hash steckt — die
  Bindungsprüfung isoliert testen, BEVOR die Datenbank erreicht wird.
- **Verbrauchtes Token:** ausdrückliche Ablehnung, nicht nur „keine Änderung".
  Bei zwei gleichzeitigen Verwendungen zusätzlich beweisen: **nur eine erreicht
  den DB-Weg.**

## 10. Aussehen

Neues Bedienelement mit folgenschwerer Entscheidung. Skill `/design-pruefung`
laden, `core/design.js` benutzen (keine neuen Farb-, Radien- oder
Schriftgrössenwerte im `<style>`-Block), Kontraste mit `kontrast.js` rechnen.
Screenshot beilegen.

## Ausdrücklich NICHT bauen

- Die Erzeuger-Prüfung (Abschnitt 6).
- Der Rückweg für anderweitig inaktive Geräte (2b-2).
- Ein Weg, ein mängelfreies Gerät als ausgemustert zu kennzeichnen.
- Änderungen am Korrekturweg. Die Prüfung fand, dass `core/korrekturen.js:440-450`
  für eine ausgemusterte Sperre weiterhin „Freigegeben am/durch" anbietet und
  der SELECT bei `:512-526` weder `ausgemustert_am` noch `aktiv` lädt. Halte es
  im Bericht fest, bau es nicht.
- Ein neuer Rückweg für die Seilkontrolle (Abschnitt 0).

## Abschluss und Bericht

1. Volle Suite SELBST: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`
2. Dateizahl-Ritual, `diff` EXIT 0.
3. `npm run lint` — wörtlich, AUCH bei Grün.
4. Marker-Scan, Sollwert 6.
5. Committen und pushen.

**Melde wörtlich:** Suite-Exit und PASS/FAIL je berührter Datei, Lint, BEIDE
Richtungen JEDER Gegenprobe mit echten Zahlen, den Screenshot, was du an den
Wächtern aus Abschnitt 8 vorgefunden hast, das Messergebnis zum
Audit-Scanbereich — und alles, was du gefunden und NICHT umgesetzt hast.
**Widersprich mit einer Messung, wenn eine meiner Vorgaben nicht trägt.**
