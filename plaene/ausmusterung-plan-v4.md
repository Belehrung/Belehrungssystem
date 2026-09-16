# Ausmusterung von Geräten mit offenem Mangel — Plan v4

Fassung 4 (15.09.2026). Sie zieht zehn Befunde einer zweiten unabhängigen
Prüfung nach; alle zehn selbst am Quelltext nachgemessen, alle zehn tragen
(mit Runde 1 zusammen: 18 von 18).

**Der wichtigste Unterschied zu v3 ist eine STREICHUNG, keine Ergänzung.**

## 0. Entscheidungen des Betreibers (bindend)

1. Ausmustern muss **mit offenem Mangel** möglich sein.
2. **Mittlerer Weg:** eigener Grund „ausgemustert", ausdrücklich KEINE
   Reparatur. Es darf nirgends als Reparatur erscheinen.
3. **Keine Reaktivierung** danach.
4. **Ein Bestätigungsschritt — ENTSCHIEDEN am 16.09.2026, nicht mehr offen.**
   Hier stand bis dahin „ANNAHME, nicht beantwortet"; beide Prüfrunden hatten
   ihn ausdrücklich als tragend bezeichnet, und der Betreiber hat ihn danach
   entschieden (`plaene/ENTSCHIEDEN.md`). Er wird gebaut, die Rückfrage dazu
   wird nicht erneut gestellt.

## Was gestrichen wurde und warum

v3 hatte einen dritten Beitrag: einen gemeinsamen, datumslosen
Advisory-Lock `mangel:<studio>:<typ>` an jeder Schreibstelle. **Er entfällt
ersatzlos.** Drei Gründe, in dieser Reihenfolge:

1. **Er wird für die Richtigkeit nicht gebraucht.** Der Schnappschuss wird
   INNERHALB der Bestätigungstransaktion erneut gelesen und verglichen; was
   davor committet wurde, fällt auf. Was danach committet, erzeugt einen
   inaktiven Gerätezustand mit einem offenen Mangel — einen Zustand, der
   **wiederherstellbar** ist (Abschnitt 3.4) und weder Daten verliert noch
   eine falsche Aussage erzeugt noch etwas Unwiderrufliches tut. Ein Riegel
   hätte eine seltene, behebbare Unbequemlichkeit verhindert.
2. **Der Preis wäre hoch und das Risiko real.** `auditAppend()` nimmt
   bereits einen STUDIOWEITEN Advisory-Lock (`core/integritaet.js:65`), und
   im Bestand stehen zwei Transaktionen mit gegenläufiger Lock-Reihenfolge
   (`routes/module.js:2710/2725/2777` gegen `:3140/:997`, beide übergeben
   `t`) — ein echter Verklemmungs-Kreis, selbst nachgemessen. Eine weitere
   globale Lock-Klasse auf eine ungelöste Ordnung zu legen, macht ihn
   wahrscheinlicher. Die Ordnungsregel „`mangel:` immer zuletzt" aus v3 löst
   den Kreis nicht, weil er den Audit-Lock gar nicht kannte.
3. **Es ist nicht, wonach gefragt wurde.** Eine verbindliche Ordnung aller
   Advisory-Locks dieses Systems ist ein eigener Auftrag. Er ist als Befund
   festgehalten, nicht stillschweigend fallengelassen.

Damit bleiben ZWEI Beiträge.

---

# BEITRAG 1 — Eine Freigabe wird nur gemeldet und protokolliert, wenn sie stattfand

**Eigener PR. Drei Dinge, die HEUTE falsch sind — keines davon braucht die
Ausmusterung, alle drei werden durch sie schlimmer.**

## 1.1 Die drei Befunde (alle selbst nachgemessen)

**(a) Falsches Reparatur-Protokoll.** `routes/sichtpruefung.js:3082-3101`:
das UPDATE trägt `AND status='offen'`, sein `rowCount` wird nicht
ausgewertet, danach läuft unbedingt
`auditAppend(…, 'reparatur_freigabe', …)`. Trifft es null Zeilen, steht eine
Reparatur samt `reparatur_hash` im fortlaufend gehashten Audit-Log.
Gleiches Muster in `routes/module.js:1208-1217` (`seilkontrolle_freigabe`).

**(b) Falsche Erfolgsmeldung am Tablet.** `routes/module.js:1205` steigt bei
leerem Sperren-SELECT mit `{ ok: true, schon: true }` aus. Der Client
(`:1104`) wertet `schon` nicht aus: `if(d.ok){ window.location.href=
'/module/seilkontrolle?freigegeben=1'; return; }` — und `:1294` zeigt
daraufhin wörtlich **„Gerät freigegeben. Das reparierte Gerät darf wieder
genutzt werden."** Heute erreichbar per Doppelabsendung; mit der
Ausmusterung erreichbar für ein verschrottetes Gerät. Das verletzt
Entscheidung 2 unmittelbar — und zwar an der Stelle, die der Trainer sieht.

**(c) Unwiderrufliche Fotolöschung in einem rollbaren Vorgang.**
`loescheSeilFotos()` (`routes/module.js:1173-1180`) benutzt `db.q`/`db.run`
(also den Pool, `core/db.js:421-432`) und `unlinkSync()`. v3 wollte den
Aufruf „in dieselbe `db.tx()` ziehen" — das macht ihn nicht transaktional:
die Pool-Abfragen laufen weiter ausserhalb, und `unlinkSync()` lässt sich
ohnehin nicht zurückrollen. Ein Auditfehler nach der Löschung rollt die
Freigabe zurück, die Fotos sind trotzdem weg.

## 1.2 Die Behebung

- **(a)** `const r = await t.run(UPDATE …)`. Kein Audit, keine Folgeaktion
  und kein Erfolg bei `r.rowCount === 0`; stattdessen den AKTUELLEN Zustand
  INNERHALB derselben Transaktion nachlesen und zurückmelden.
- **(b)** Der Frühausstieg bekommt einen eigenen Ergebniszustand (nicht
  `ok:true`), der Client unterscheidet ihn VOR `d.ok`, und es wird nicht auf
  `?freigegeben=1` weitergeleitet. Dieselbe Zustandsantwort auch aus dem
  `rowCount === 0`-Fall aus (a).
- **(c)** UPDATE und Audit atomar über dieselbe Verbindung, betroffene IDs
  per `RETURNING`; die Dateilöschung läuft **nach** erfolgreichem Commit.
- **Ausdrücklich NICHT angefasst:** `routes/module.js:2894` und
  `routes/wartung.js:1314` lösen Sperren ebenfalls ohne `rowCount`-Prüfung,
  schreiben danach aber KEIN Ereignis, das genau diese Zeile als freigegeben
  behauptet (im Bereich 2896-2990 steht nur `sperre_sichtkontrolle` auf
  `:2980`). Sie bleiben in Ruhe, damit die Behebung nicht „aus Symmetrie"
  ausgeweitet wird.

## 1.3 Gegenproben — und warum die aus v3 NICHT getaugt hätte

v3 verlangte: „Zeile vor dem POST auf `status='repariert'` setzen". Das
prüft nichts: `routes/sichtpruefung.js:3041` steigt dann schon vor dem
UPDATE aus (`if (defekt.status === 'repariert') return res.redirect(…)`),
ebenso `routes/module.js:1205` bei leerem SELECT. Die Audit-Differenz ist
bereits heute null — die Zusicherung wäre grün geblieben, auch wenn man den
neuen `rowCount`-Riegel wieder entfernt. Genau die Klasse „der Vorzustand
erzwingt das erwartete Ergebnis ohnehin".

Stattdessen:

- Die Schliess-Schritte (UPDATE + Audit) werden in eine eigene Funktion
  gezogen, die der Test **in der Produktionsform** aufruft — dieselben
  Argumente, dieselben Typen, dieselbe Transaktion. Der Vorzustand ist die
  einzige Variable. Damit werden die Frühausstiege übersprungen, ohne dass
  der Test einen Zweig prüft, den es in Produktion nicht gibt.
- **Nachweis, dass das UPDATE wirklich lief und null Zeilen traf** —
  `rowCount` wird ausgegeben und zugesichert. Sonst ist „0 neue Audits"
  nicht von „gar nicht angekommen" zu unterscheiden.
- **Rückdrehprobe, einzeln gemessen:** den `rowCount`-Riegel entfernen → die
  Zusicherung MUSS fallen. Wird sie nicht rot, bewacht sie nichts.
- **Positivkontrolle:** normale Reparatur → genau EIN Audit-Eintrag,
  `rowCount = 1`.
- **(b)** HTML-Probe: der Frühausstieg darf `?freigegeben=1` nicht auslösen,
  und die Antwortseite darf den Satz „darf wieder genutzt werden" nicht
  enthalten. Der Satz wird wörtlich zugesichert, nicht der Statuscode.
- **(c)** Auditfehler-Attrappe nach dem UPDATE: die Sperre muss offen
  bleiben UND die Fotodateien müssen noch da sein. Die Attrappe ersetzt
  `auditAppend`; es wird kein echtes Dateisystem ausserhalb des
  Testverzeichnisses angefasst.

## 1.4 Bestehende Wächter, die mitgezogen werden

Keine für Beitrag 1 — die beiden bekannten stehen bei Beitrag 2.

---

# BEITRAG 2 — Die Ausmusterung

## 2.1 Datenmodell (Migration 0057)

Letzte vorhandene Migration: `0056_wartung_pruefungen_fk_restrict.sql`.
Der Runner führt jede Migration transaktional aus (`core/migrate.js:138`).

- `geraete_defekte`: CHECK auf `status IN ('offen','repariert','ausgemustert')`
  (`geraete_defekte_status_check`, inline in `core/db.js:1250` — Migration
  droppt benannt und legt neu an, **`core/db.js` wird mitgezogen**). Neu:
  `ausgemustert_am TEXT`, `ausgemustert_durch TEXT`.
- `geraete_sperren`: neu `ausgemustert_am TEXT`, `ausgemustert_durch TEXT`.
  `aktiv` → 0, `freigegeben_am` bleibt **NULL**.
- `geraete`: neu `ausgemustert_am TEXT`, `ausgemustert_durch TEXT`.

Alle ALTER als `ADD COLUMN IF NOT EXISTS`.

## 2.2 Die Kandidatensuche

Zwei gemessene Tatsachen, die den Namensabgleich allein erledigen:
`routes/admin/geraete-typen.js:374-382` zieht beim Umbenennen nur
`geraete.name` nach, und der Tagescheck schreibt keine `geraet_id`
(`routes/sichtpruefung.js:2522-2528`), der Mangel-Nachtrag dagegen schon
(`:4428-4433`).

Die Bestätigungsseite zeigt deshalb bei Cardio/Kraft:

1. **Sicher zugeordnet** — offen, `geraet_id = <id>`. Vorausgewählt.
2. **Über den Namen zugeordnet** — offen, `geraet_id IS NULL`,
   `geraet_name = <aktueller Name>`. Vorausgewählt, mit Standort und
   Seriennummer.
3. **Nicht zugeordneter Altbestand** — offen, **`geraet_id IS NULL`** und
   Name abweichend. NICHT vorausgewählt. Das ist der Ausweg für umbenannte
   Geräte.

**Gegenüber v3 eingeschränkt:** Block 3 enthält **nur noch Zeilen ohne
`geraet_id`**. v3 bot „alle übrigen" an — darunter Mängel, die einem ANDEREN
Gerät sicher zugeordnet sind; ein Haken hätte deren dokumentierten Mangel
geschlossen, unwiderruflich, und Name/Standort/Seriennummer sind optional
(`core/db.js:1245-1246`), verhindern es also nicht.

**Für die Seilkontrolle entfällt Block 2 und Block 3 vollständig:**
`geraete_sperren.geraet_id` ist NOT NULL (`core/db.js:1379`), die Zuordnung
ist immer eindeutig.

**Die Route prüft Auswahl ⊆ zulässige Kandidaten**, serverseitig und erneut
in der Transaktion. `WHERE id = ANY($4) AND status='offen'` allein tut das
nicht — es erzwingt weder Bereich noch Gerätezugehörigkeit.

## 2.3 Der Ablauf

**Der Schnappschuss trägt einen Fingerabdruck des INHALTS, nicht nur IDs.**
v3 wollte die sortierte ID-Liste vergleichen. Das genügt nicht:
`routes/module.js:2842-2856` hängt einen NEUEN Befund an eine BESTEHENDE
aktive Sperre an (`gesperrt_grund = … || ' | ' || …`) — die ID-Menge bleibt
gleich, der Inhalt ändert sich, und der Admin bestätigte einen Mangel, den
er nie gesehen hat.

Der Fingerabdruck ist ein Hash über `(id, status/aktiv, Grund- bzw.
Beschreibungstext, Zeitstempel)` aller offenen Zeilen des Bereichs.

**Der Schnappschuss liegt SERVERSEITIG**, die Seite trägt nur ein opakes
Token. Grund, gemessen: `server.js:161-162` begrenzt URL-encoded und JSON
auf 1 MB; eine vollständige Liste im Formular kann diese Grenze reissen, und
eine gekürzte Liste wäre kein Schnappschuss mehr.

Transaktion (**ohne eigenen Advisory-Lock**, s. „Was gestrichen wurde"):

1. Gerät `SELECT … FOR UPDATE` — gegen paralleles Umbenennen.
2. Fingerabdruck neu berechnen und vergleichen. Ungleich → **Abbruch**,
   Seite mit dem neuen Stand erneut zeigen.
3. Auswahl gegen die zulässigen Kandidaten prüfen (2.2).
4. `UPDATE geraete_defekte SET status='ausgemustert', ausgemustert_am=$1,
   ausgemustert_durch=$2 WHERE studio_id=$3 AND id=ANY($4) AND
   status='offen' AND typ=$5 RETURNING id` — Menge muss der Auswahl
   entsprechen, sonst Rollback.
5. `UPDATE geraete SET aktiv=0, stillgelegt_seit=COALESCE(stillgelegt_seit,$1),
   ausgemustert_am=COALESCE(ausgemustert_am,$1),
   ausgemustert_durch=COALESCE(ausgemustert_durch,$2)
   WHERE studio_id=$3 AND id=$4 AND typ=$5` — **ohne**
   `COALESCE(aktiv,1)=1`, und mit `COALESCE` auf den Zeitstempeln, damit ein
   zweiter Durchgang den ersten nicht überschreibt.
6. Audit `geraet_ausgemustert` (neu, Beschriftung in
   `core/audit-filter.js`), nur bei tatsächlich geänderten Zeilen.

**Fortschrittsgarantie.** Ein Bereich unter Dauerlast könnte die Bestätigung
beliebig oft zurücksetzen. Das wird nicht behauptet, sondern begrenzt: nach
dem zweiten Fehlschlag nennt die Seite den Grund („in der Zwischenzeit hat
sich N geändert") und zeigt, WAS sich geändert hat, statt nur neu zu laden.

**Der N=0-Fall:** kein Vorab-Zählen mit anschliessendem Schreiben. Die
Zählung läuft in derselben Transaktion; findet sie N>0, Rollback und
Umleitung auf die Bestätigungsseite.

## 2.4 Der Weg zurück — weiter gefasst als in v3

v3 versprach den Knopf nur für ausgemusterte Geräte. Das reicht nicht: ein
Mangel-Nachtrag prüft den Aktivzustand VOR der Transaktion
(`routes/sichtpruefung.js:4473-4475`), eine gewöhnliche Deaktivierung kann
dazwischenkommen, und danach ist das Gerät **inaktiv, NICHT ausgemustert,
mit offenem Mangel**. In der Seil-Verwaltungsliste fehlt es dann ganz
(`routes/admin/geraete.js:107-109` lädt nur aktive Geräte).

Deshalb:

- Beide Geräteseiten zeigen einen Abschnitt **„Inaktive Geräte mit offenen
  Mängeln"** mit dem Knopf „Offene Mängel abschliessen" — für JEDES inaktive
  Gerät mit offenen Mängeln, ausgemustert oder nicht. Für die Seilkontrolle
  ist das zugleich die erste Stelle, an der ein inaktives Gerät überhaupt
  wieder auftaucht.
- Die Bestätigungsroute verlangt keinen aktiven Zustand und überschreibt
  einen vorhandenen `ausgemustert_am` nicht.
- **Reaktivieren bleibt gesperrt an der ROUTE**
  (`AND ausgemustert_am IS NULL` in `POST /geraete/:typ/aktivieren/:id`),
  nicht nur am Knopf.

## 2.5 Die Leser — was sonst still falsch würde

- **A-1 `core/pdf-engine.js:2032/2089/2168-2180`** — `istOffen` teilt in
  zwei Zweige; eine ausgemusterte Zeile bekäme `[Repariert]`,
  „Repariert am: " (leer), „Reparatur durch: —" und „Prüfung durch eine zur
  Prüfung befähigte Person …: Nein". → dritter Zweig mit eigenem Block.
- **A-2 `core/pdf-engine.js:993` + `:1077-1140` + `:913`** — die Kette
  `if (sp.freigegeben_am) … else if (istEchteSperreSp) … else if (!stufeSp)
  … else …`. `istEchteSperreSp = istAktiv && …` (`:973`) ist bei
  Ausmusterung falsch, `freigegeben_am` ist NULL → die Zeile landet im
  letzten Zweig und druckt „Status: Mangel noch offen — Reparatur steht noch
  aus." (`core/nutzungsentscheidung.js:344`). → eigener Zweig VOR
  `if (sp.freigegeben_am)`, plus die Platzbedarfsrechnung `:913`.
- **A-3 `core/retention.js:174-186`** —
  `datumSpalte: "COALESCE(repariert_am, ausgemustert_am)"` bzw.
  `"COALESCE(freigegeben_am, ausgemustert_am)"`, `zusatzBedingung` für
  Defekte auf `status IN ('repariert','ausgemustert')`, `infoFelder` um
  `ausgemustert_am`. EIN Eintrag je Tabelle (`storniereMarkierung()` `:697`,
  `routes/aufbewahrung.js:318/516/617`). Der Löschlauf prüft
  `zusatzBedingung`, nicht erneut `datumSpalte` (`:827-834`).
  Für `typ='wartung'`-Sperren ändert sich nichts: sie bekommen nie
  `ausgemustert_am`, `COALESCE` fällt auf `freigegeben_am` zurück.
- **A-4 `core/wiederholung.js:116`, SELECT-Liste `:105`** — `ende` auch bei
  `ausgemustert_am`; `:52` und `:151` bleiben auf `'repariert'`.
- **A-5 ZWEI Zeitraumfilter:** `core/pdf-engine.js:1996-2004` (Defekte) und
  `:772-781` (Sperren). Beide brauchen eine Bedingung auf `ausgemustert_am`
  im Zeitraum; sonst fällt eine im August gesperrte, im September
  ausgemusterte Zeile aus dem September-Nachweis.
- **A-6/A-7** `core/foto-reaper.js:54`, `core/defekt-feedback.js:51/74`,
  `core/korrekturen.js:296` — bleiben unverändert. Geprüft, nicht geändert.
- **A-8 `routes/sichtpruefung.js:2902/3041`** — eigener Zweig „Bereits
  ausgemustert". Höflichkeit, keine Absicherung; die steht in Beitrag 1.
- **A-10 `routes/admin/geraete-typen.js:54-62`** — der Kopfkommentar
  („KEIN db.tx()/Advisory-Lock … nötig") wird mitgezogen.
- **A-12 `routes/admin/geraete.js:4454`** — die Ausfallzeit-Statistik zeigt
  `a.offen ? '… offen' : 'alle repariert'`. Ein ausschliesslich
  ausgemustertes Gerät hat `offen=0` und stünde dort als **„alle
  repariert"**. → Abschlusszustände übernehmen oder neutral „keine offenen
  Mängel"; die Erklärzeile `:4445` mitziehen.

## 2.6 Bestehende Wächter, die mitgezogen werden

Das sind Deploy-Gates mit entgegenstehender Sollvorgabe — sie fallen, wenn
sie nicht mitgeändert werden, und sie ersatzlos zu streichen wäre Betrug am
eigenen Netz.

- **`test_feature_korrektur_dokumente_static.js:51-53`** schreibt per Regex
  `datumSpalte:\s+"repariert_am"` und `"freigegeben_am"` fest → fachlich
  umstellen auf „offene Defekte und aktive Sperren bleiben geschützt, beide
  Abschlussarten werden berücksichtigt".
- **`test_feature_admin_lifecycle.js:96-102`** und
  **`test_feature_geraete_loeschen.js:165-175`** sichern zu, dass Löschen
  bei aktiver Sperre blockiert und das Gerät aktiv bleibt → umstellen auf:
  erster POST ändert NICHTS und führt zur Bestätigung; erst die bestätigte
  Ausmusterung schliesst die Sperre ohne Freigabe.
- **`test_feature_geraete_loeschen.js:187-190`** verlangt, dass gelöschte
  Geräte nicht in der Verwaltungsliste stehen → muss den neuen Abschnitt
  „Inaktive Geräte mit offenen Mängeln" (2.4) davon unterscheiden.

## 2.7 Was ausdrücklich NICHT gebaut wird

- Keine Reaktivierung (Entscheidung 3).
- Keine Umbenennung der Knöpfe, keine Verschmelzung der Geräteseiten.
- **Keine Änderung an `geraete_bekannt`.** Das Tablet schlägt den Namen
  weiter vor (`routes/sichtpruefung.js:1112-1118` liest ohne `aktiv`-Filter
  und ohne Verbindung zu `geraete`). Löschen wäre trotzdem falsch:
  `UNIQUE(studio_id, typ, geraet_name)` (`core/db.js:1480`), Entstehung per
  Upsert am Tablet (`:2531`, `:4439`), `geraete`-Zeilen dagegen nur per
  QR-Aufkleber — es gibt bekannte Namen ohne Gerätezeile und zwei
  Gerätezeilen mit demselben Namen. Eigener Auftrag. Der Weg für einen so
  entstandenen Mangel ist 2.4.
- **Keine Ausmusterung für Wartungsgeräte.** `geraete_sperren` hat einen
  dritten Typ `wartung` (`core/db.js:1378`, geschrieben in
  `routes/wartung.js:1305/1309/1314`) mit eigener Gerätetabelle
  `wartung_geraete`. Dort besteht dieselbe Sackgasse womöglich auch —
  eigener Auftrag, hier ausdrücklich nicht mitgebaut.
- **Keine gemeinsame Lock-Ordnung.** Siehe „Was gestrichen wurde"; der
  gefundene Verklemmungs-Kreis ist als eigener Befund festgehalten.

## 2.8 Gegenproben

- **Aufbewahrung:** ausgemusterte Zeile jenseits der Frist MUSS Kandidat
  sein; `COALESCE` zurückdrehen → MUSS verschwinden.
- **PDF Defekt-Anhang:** `[Ausgemustert]` erwartet UND **Fehlen** von
  `[Repariert]`, „Repariert am" und dem Satz zur befähigten Person.
- **PDF Sperren-Anhang:** dasselbe, UND **Fehlen** des Satzes „Mangel noch
  offen — Reparatur steht noch aus". Genau dieser Satz ist der Befund.
- **Beide Zeitraumfilter:** Fixtur mit `gesperrt_am`/`erstellt_am` VOR dem
  Zeitraum und `ausgemustert_am` IM Zeitraum.
- **Ausfallzeit:** Sollwert als unabhängig hingeschriebenes Stundenliteral
  zwischen zwei festen Zeitstempeln. **Nicht** das Muster aus
  `test_feature_wiederholung.js:83-84` übernehmen (`setFullYear` gefolgt von
  `toISOString().slice(0,10)` — kann östlich von UTC um einen Kalendertag
  abweichen).
- **Statistik (A-12):** HTML-Probe mit ausschliesslich ausgemustertem Defekt
  muss „alle repariert" AUSSCHLIESSEN.
- **Reaktivierungssperre:** gegen die ROUTE, Vorzustand **inaktiv UND
  ausgemustert**. Bei einem aktiven Gerät erzwingt schon
  `COALESCE(aktiv,1)=0` null Treffer — der Test wäre grün, ohne den neuen
  Schutz je zu berühren.
- **Schnappschuss, ZWEI Proben:** (i) zusätzliche offene Zeile einschieben →
  nichts wird geschrieben; (ii) **denselben** Datensatz per UPDATE ändern
  (`gesperrt_grund` ergänzen) → ebenfalls nichts. Probe (ii) ist die, die
  eine reine ID-Liste bestehen würde.
- **Teilauswahl:** zwei gleichnamige Geräte mit je einem Mangel; nur einer
  angekreuzt → genau dieser geschlossen.
- **Fremdzuordnung:** ein Mangel mit `geraet_id = anderes Gerät` darf in
  keinem Block erscheinen und muss, direkt mitgesendet, von der Route
  ABGEWIESEN werden.
- **Weg zurück, BEIDE Ausgänge:** (i) ausgemustertes Gerät, neuer Mangel →
  abschliessbar, `ausgemustert_am` behält den ERSTEN Zeitstempel;
  (ii) gewöhnlich deaktiviertes Gerät (N=0-Ausgang), neuer Mangel →
  ebenfalls abschliessbar und in der Liste sichtbar.
- **Mandantentrennung:** zweites Studio, gleichnamiges Gerät, offener Mangel
  bleibt unberührt.
