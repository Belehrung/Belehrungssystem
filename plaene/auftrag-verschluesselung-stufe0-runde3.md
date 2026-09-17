# Auftrag: Runde 3 — die Wechselwirkungen auflösen

Repo `/home/user/gymdocu`, weiter auf `claude/verschluesselung-stufe0`.

Quelle: zweite Gegenlesung (8 Befunde) plus eigene Messungen. **Was hier steht,
habe ich selbst am Quelltext nachgemessen** — die Fundstellen stimmen.

**Abgrenzung vorweg, damit diese Runde endet:** Gebaut wird, was unten steht.
Was dabei NEU auffällt und nicht blockierend ist, wird als datierter offener
Punkt in `docs/offene-befunde-31-08-2026.md` festgehalten statt mitgebaut.
Das ist eine Grenze an meinem eigenen Verhalten, keine Vorhersage darüber, was
du findest — findest du etwas Blockierendes, sag es.

---

## Der Kern: EIN Mechanismus löst drei Befunde

Drei Befunde haben dieselbe Wurzel — seit B5 heisst die Datei
`Verbandbuch_Eintrag_<id>_<hex>.pdf` statt `Verbandbuch_Eintrag_<id>.pdf`:

- **F5 (blockierend, von mir gemessen):** Der Zufallsname trifft weder das
  Muster des Aufräumskripts (`/^Verbandbuch_Eintrag_\d+\.pdf$/`, gemessen:
  `false`) noch den Retention-Resolver (`core/retention.js:321`, fester Name).
  Bleibt eine Datei liegen — Prozessneustart zwischen Erzeugung und
  Auslieferung, oder ein fehlgeschlagenes `unlinkSync` —, findet sie NIEMAND
  mehr. `dateiFehltErwartet` sorgt zusätzlich dafür, dass es nicht auffällt.
- **F6 (blockierend):** `core/pdf-engine.js:117` öffnet den Schreibstrom
  ASYNCHRON. Wirft das Rendern danach synchron (erreichbar über
  `koerperschema_json: "[null]"` — `routes/verbandbuch.js:548-552` prüft nur
  `Array.isArray`, nicht die Elemente, und `core/pdf-engine.js:2441` liest
  `m.ansicht`), dann kann die Datei NACH dem einmaligen Aufräumen entstehen.
  Die Route beendet den Strom nicht.
- **F8 (sollte):** Ein symlinkter STUDIO-Ordner wird stillschweigend
  weggefiltert (`ops/…:138-140`) — weder gemeldet noch gezählt. Beim
  Verbandbuch-Unterordner wird derselbe Fall korrekt als Fehler gemeldet.

**Mein Lösungsweg — er löst F5 und F6 mit EINEM Mechanismus, statt beide
einzeln zu flicken:**

Das Aufräumskript wird vom Einmal-Werkzeug zum **Ernter**: Es erkennt BEIDE
Namensformen und unterscheidet aktiv von verwaist über das **Alter der Datei**.

- Fester Name (`Verbandbuch_Eintrag_<id>.pdf`) = Altbestand von VOR diesem
  Beitrag. Die Routen erzeugen diese Form nicht mehr. Ohne Altersbedingung
  löschen.
- Zufallsform (`Verbandbuch_Eintrag_<id>_<hex>.pdf`) = kann gerade
  ausgeliefert werden. **Nur löschen, wenn älter als eine Schwelle.**

Die Gegenlesung warnt ausdrücklich davor, einfach das Muster zu erweitern —
das würde während laufender Downloads löschen und B5 eine Ebene tiefer wieder
einführen. Genau deshalb die Altersbedingung.

Die Schwelle leitest du HER, statt sie zu raten, und schreibst die Herleitung
als Kommentar daneben: sie muss deutlich über der längsten plausiblen
Auslieferungsdauer liegen. Nenne im Bericht, woran du sie festgemacht hast.

Damit wird F6 mitgelöst: eine verspätet angelegte Datei ist eine verwaiste
Datei und wird geerntet. **Die Engine bleibt unverändert** — ich habe geprüft,
ob das PDF stattdessen ausserhalb von PDF_ROOT geschrieben werden könnte; das
wäre der sauberere Weg, verlangt aber einen Eingriff in `createDocument()`,
das viele Aufrufer teilt. Nicht in dieser Runde. **Halte diesen Gedanken als
datierten offenen Punkt fest** (D19): „Verbandbuch-Einzel-PDF gar nicht erst
unter PDF_ROOT erzeugen" wäre die Behebung, die die ganze Klasse auflöst.

---

## F7 — Zufallsnamen lassen einen Zwischenspeicher unbegrenzt wachsen

**Von mir nachgemessen.** `core/pdf-engine.js:404` schreibt nach jeder
erfolgreichen Erzeugung `verifyCodes.set(publicPath, code)` in eine
prozessweite Map (`:57`). Geleert wird sie NUR durch `consumeVerifyCode()`
(`:64-67`), und der einzige Verbraucher ist `generateMonthlyPDFs.js:235`.

Vorher überschrieben wiederholte Abrufe desselben Eintrags denselben
Schlüssel — die Map blieb beschränkt. Jetzt legt **jeder Abruf einen neuen
Schlüssel an, der bis zum Prozessende bleibt**, auch wenn die Datei längst
gelöscht ist. Ein Multi-Tenant-Prozess läuft wochenlang.

Behebung: Die Route verbraucht den Code nach der Erzeugung selbst. Das
DAUERHAFTE Register `verify_dokumente` (`core/pdf-engine.js:82`) bleibt davon
UNBERÜHRT — es ist der Nachweis für ausgelieferte Dokumente und wird NICHT
mitgelöscht. Prüfe das nach, bevor du etwas anfasst.

Zusicherung: nach N Abrufen desselben Eintrags wächst die Map nicht um N.

---

## F1 — Das harte Tor vergleicht eine ZAHL, keine MENGE

**Blockierend, und es ist mein Formulierungsfehler aus Runde 2.** Ich hatte
„wenn der Probelauf nicht genau die Attrappe gesehen hat" geschrieben; gebaut
wurde `probeGefunden === 3`.

Bei gebrochener Umleitung gegen ein fremdes Verzeichnis mit ZUFÄLLIG genau
drei passenden Dateien bestehen alle Tore: Exit 0, „PROBELAUF" in der Ausgabe,
Anzahl 3, und die eigenen vier Attrappen liegen noch — gerade WEIL woanders
gesucht wurde. Danach läuft `--wirklich` gegen das fremde Verzeichnis.

Zu bauen: Das Skript muss im Probelauf **die gefundenen Pfade oder die
benutzte Wurzel nachprüfbar melden** (heute meldet `ops/…:225` nur eine
Zusammenfassung), und das Tor bindet gegen die eigene Scratch-Wurzel — Menge
gegen Menge, nicht Zahl gegen Zahl.

Beim B2-Abschnitt (`test_feature_verbandbuch_pdf_aufraeumen.js:171-172`) fehlt
das Tor ganz: dort wird vor dem scharfen Lauf weder Exit noch Ausgabe noch
Fundmenge geprüft. Nachziehen.

**Gegenprobe, und sie ist Pflicht:** gebrochene Umleitung gegen eine getrennte
„Produktions"-Attrappe, die EBENFALLS genau drei passende Dateien enthält.
Erwartung: Abbruch VOR `--wirklich`, alle drei fremden Dateien unangetastet.

## F2 — Der qpdf-Stub darf in ganz `/tmp` schreiben

**Von mir nachgemessen**, `test_feature_verbandbuch_pdf_fluechtig.js:88-91`:
der Riegel prüft gegen `os.tmpdir()`, nicht gegen das eigene
Testverzeichnis. Unter `/tmp` liegen fremde Dateien; eine falsche
Zielberechnung im Produktivcode überschreibt sie, und die Route löscht sie
danach sogar (`routes/verbandbuch-admin.js:561`). Ausserdem folgt
`writeFileSync` einem vorhandenen Symlink, ein rein lexikalischer Vergleich
schützt also ohnehin nicht.

Zu bauen: eigenes, exklusiv angelegtes Scratch-Verzeichnis für qpdf-Ausgaben,
und vor dem Schreiben die TATSÄCHLICHE Zugehörigkeit erzwingen (nicht nur den
Pfadtext). Gegenprobe mit einer zweiten Scratch-Wurzel als „fremdes /tmp" samt
Sentinel-Datei: Ziel muss hart abgewiesen werden, Inhalt unverändert bleiben.

## Kleinere Punkte

- **F3:** `test_feature_verbandbuch_pdf_fluechtig.js:199-203` prüft die selbst
  gesetzte Variable, nicht die effektiv exportierte Wurzel. Gegen
  `require('./core/pdf-root').PDF_ROOT` prüfen. Und `path.resolve('')` liefert
  das Arbeitsverzeichnis, nie `''` — die Bedingung `!== ''` ist wirkungslos.
- **F4:** Die B5-Zusicherung hängt an `setTimeout(300)`. Eine ZEITSCHWELLE ist
  kein Beleg für eine Überschneidung; auf einem belasteten Läufer kann auch die
  fehlerhafte Fassung bestehen. Anfrage A nach der Erzeugung an einem
  ausdrücklichen Promise anhalten, B vollständig samt beobachteter Löschung
  abschliessen lassen, dann A freigeben. Die Restdateiprüfung (`:318`) erfasst
  zudem nur die neue Namensform — beide prüfen.
- **S11-Rest:** `pfadAusLetztemAufruf()` rechnet den Pfad weiter selbst aus
  (`:188-190`), und in den Erfolgs- und qpdf-Fehlerfällen fehlt die beobachtete
  Existenz VOR der Löschung. „Datei weg" ohne „Datei war da" belegt keine
  Löschung.
- **PDF-Inhalt:** `length > 0` plus `%PDF` besteht auch eine auf vier Bytes
  gekürzte Antwort. Gegen die erzeugte Grösse prüfen.
- **S8-Rest:** Der neue `.catch` meldet keinen erreichten Löschstand; die
  Zähler stehen im `try` (`ops/…:157`), die Zusammenfassung wird bei einem Wurf
  übersprungen. Nach einem teilweise scharfen Lauf weiss niemand, wie weit er
  kam.
- **Retention:** Die verlangte Warn-Zusicherung für die Korrekturblatt-Queue
  fehlt, ebenso ein Fall oberhalb des Warnungsdeckels. Die Queue-Warnung gibt
  es weiterhin (`core/retention.js:818-819`). Ergänzen — oder mit einem Satz
  begründen, warum sie hier ausser Verhältnis steht; ich nehme beides an.

## Abschluss

Zu jedem Punkt eine Gegenprobe in beide Richtungen mit Zahlen. Volle Suite
ohne Pipe, Dateizahl-Ritual als MENGENvergleich (`diff` EXIT 0), `npm run lint`
wörtlich auch bei Grün, Marker-Scan (Sollwert 6), `git status` sauber.

Widersprich, wo deine Messung meinen Angaben widerspricht.
