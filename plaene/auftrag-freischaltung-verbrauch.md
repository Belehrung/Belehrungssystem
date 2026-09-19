# Auftragspapier — Serverseitige Signaturprüfung + Einmal-Freischaltung

Repo: `/home/user/gymdocu`, Zweig `claude/freischaltung-verbrauch-rueckgabe`
(von `master`, `6ee7b15`, existiert schon und ist leer).

**Diese Fassung ersetzt die vom 18.09.2026 vollständig.** Die alte fing bei der
Reihenfolge des Verbrauchs an. Das war falsch herum: eine Behebung, die nur die
Reihenfolge richtet, sieht fertig aus und lässt das eigentliche Loch offen.
Sie hätte ausserdem eine Wettlaufsituation VERBREITERT (siehe M4).

Einordnung der Komplexität: **Standard-Executer** — jede Entscheidung
(Schwellen, Einbauort, Modulschnitt, Fixtur-Konstanten, Form der Gegenproben)
ist unten gemessen und festgelegt; was bleibt, ist sorgfältige Ausführung über
**sieben Dateien**: neues `core/signaturbild.js`, `routes/belehrungen.js`,
drei bestehende Fixtur-Tests, der neue Wächter und `test/run.sh`.

---

## Teil 0 — Was gemessen ist

Alles hier ist vom Haupt-Agenten am 19.09.2026 selbst gemessen, nicht aus einem
Bericht übernommen. Die Ausgaben stehen wörtlich dabei, damit niemand sie
nachbauen muss.

### M1 — Die eigentliche Lücke: ein gültiges, aber tintenfreies PNG

Der Server prüft die Signatur auf dem ganzen Weg NUR auf Nicht-Leere
(`routes/belehrungen.js:752`, `if (!signatur) throw new Error('Signatur fehlt')`).
Die Tintenprüfung steht ausschliesslich im Browser (`:637-639`):

    const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let signed = false;
    for (let i = 0; i < px.length; i += 4) { if (px[i] < 250) { signed = true; break; } }

Das ist ein **Trust-Boundary-Fehler** (CWE-501/602): clientseitig geprüft,
serverseitig nicht erzwungen. Wer den Browser umgeht, schickt ein gültiges,
leeres PNG — `pdfDoc.embedPng()` nimmt es an, das PDF wird "unterschrieben",
die Belehrungspflicht verschwindet aus Tablet-Liste und Dashboard, und es ist
nie jemand mit einem Stift am Gerät gewesen. Gemessen gegen die echte Route:
`{"status":"ok"}`, Freischaltung 1→0, signiertes PDF ohne sichtbare Unterschrift.

Erreichbar ist das für jeden angemeldeten Studio-Benutzer: der Identitätsriegel
greift nur bei `tablet_sperre_aktiv === '1'`, Voreinstellung ist `'0'`
(`:767`, `getConfigStrict(..., '0')`).

**Gemessen, dass pdf-lib beide Angriffsnutzlasten annimmt:**

    PNG_LEER_WEISS 16x8         Tinte=0   pdf-lib: 16x8 angenommen
    PNG_LEER_TRANSPARENT 16x8   Tinte=0   pdf-lib: 16x8 angenommen

### M2 — Die vorhandene Test-Fixtur IST die Angriffsnutzlast, und sie ist kaputt

Drei Testdateien schicken dieselbe Konstante `PNG` und erwarten `status === 'ok'`:
`test_feature_belehrung_version.js:20/91`, `test_feature_belehrung_gelesen.js:22`
(benutzt in `:74`, `:80`, `:117`), `test_feature_client_ip.js:762/765`.

Chunk-weise nachgemessen ist diese Konstante ein **1×1-RGBA-PNG mit kaputter
IDAT-Prüfsumme**, dessen einziges Pixel vollständig durchsichtig ist:

    IHDR len=13 crc=0x1f15c489 ist=0x1f15c489 OK
        1x1 bitdepth 8 colortype 6 interlace 0
    IDAT len=13 crc=0x5ef32a3a ist=0xa5f64540 FALSCH
        IDAT entpackt: 0,0,0,0,0
    IEND len=0 crc=0xae426082 ist=0xae426082 OK

Zwei Folgen, beide wichtig:

1. **Die Suite führt den Angriff seit jeher vor und niemand hat es gemerkt.**
   Drei Tests belegen mit einer leeren Signatur den vollen Erfolgspfad.
2. **sharp und pdf-lib sind sich über PNG-Gültigkeit NICHT einig.** libpng
   (sharp) lehnt die kaputte Prüfsumme ab (`vipspng: libpng read error`),
   pdf-lib ignoriert CRCs und nimmt sie. Die neue Prüfung ist damit strenger
   als `embedPng` — in der richtigen Richtung (fail-closed), aber es ist zu
   benennen: ein KORREKTES Browser-PNG ist davon nie betroffen, ein korruptes
   ab jetzt schon.

### M3 — Der Verbrauch der Freischaltung steht vor dem fehlbaren Teil

`routes/belehrungen.js:826`:

    // Manuelle Freischaltung entfernen
    try { await db.run("DELETE FROM belehrung_freischaltung WHERE studio_id = $1 AND mitarbeiter_id=$2 AND belehrung_id=$3", [req.studioId, mid, bid]); } catch {}

Die manuelle Freischaltung ist ein EINMAL-Token. Sie wird hier verbraucht,
ausserhalb jeder Transaktion und VOR den Wurfstellen `fsP.readFile`,
`PDFDocument.load`, `throw new Error('PDF hat keine Seiten')` und
`pdfDoc.embedPng(...)`. Der Fehlerpfad (`:898`) nimmt nur den
Unterschriften-Eintrag zurück — die Freischaltung bleibt gelöscht.

Drei Dinge, die der ursprüngliche Sicherheitsbericht nicht sagt:

1. Der Kommentar bei `:886` behauptet die Vollständigkeit der Rücknahme
   („bei jedem Fehler davor wird der Eintrag geloescht -> kein Audit"). Er
   meint den Unterschriften-Eintrag, liest sich aber als Zusage für den
   ganzen Vorgang.
2. Niemand liest den `rowCount`; `catch {}` verschluckt zusätzlich ein
   Scheitern des DELETE selbst.
3. Es gibt ein richtiges Vorbild im eigenen Bestand:
   `core/defekt_mailer.js:177-180` (`claimZurueck()`), gerufen bei Fehlschlag
   in `:186` und `:229-230`.

### M4 — Das DELETE einfach ans Ende zu ziehen VERBREITERT eine Wettlaufsituation

`schalteAlleFrei()` (`routes/belehrungen.js:1977`) legt beim Hochladen einer
neuen Dokumentversion (`/neue-version/:id`, `:2085`) für alle aktiven
Mitarbeiter eine Freischaltung an, per Upsert mit
`DO UPDATE SET freigeschaltet_am = CURRENT_TIMESTAMP`. Wird während einer
laufenden Unterschrift eine neue Version hochgeladen, löscht ein ans Ende
verschobenes, unbedingtes DELETE die **frisch entstandene** Pflicht — die
Unterschrift galt der ALTEN Fassung. Das Fenster gibt es heute auch, es wird
durch das Verschieben nur grösser.

**Gegenmittel ist eine Generationsprüfung** (Lehrbuchname: kompensierende
Transaktion / Saga mit Generationsnummer): `freigeschaltet_am` früh lesen und
am Ende nur die Zeile löschen, die noch genau diesen Wert trägt.

Gemessen, dass Gleichheit dafür trägt und Ordnung NICHT: die Spalte ist TEXT
und wird von zwei Wegen in **zwei unvereinbaren Formaten** befüllt —

    INSERT-Vorgabe (core/db.js:527):  2026-09-19 09:26:06
    Upsert CURRENT_TIMESTAMP::text:   2026-09-19 07:26:06.959074+00

Jede Neuanforderung ändert die Zeichenkette also sicher. Ein Vergleich auf
GLEICHHEIT ist damit brauchbar; jeder Vergleich auf GRÖSSER/KLEINER wäre
Unsinn. Restrisiko: zwei Neuanforderungen innerhalb derselben Mikrosekunde
wären ununterscheidbar — praktisch nicht herstellbar, hier benannt statt
versteckt.

### M5 — `res.json` sitzt im zerstörenden catch

`res.json({ status: 'ok' })` steht INNERHALB des `try`, dessen
`catch (pdfErr)` die Unterschriften-Zeile löscht (`:898`). Ein Wurf NACH dem
Commit der Transaktion (abgerissene Verbindung beim COMMIT-Quittieren, ein
Fehler in `res.json`) löscht damit eine **vollständige, gehashte Unterschrift**.
Dass `db.tx` wirft, heisst nicht, dass zurückgerollt wurde.

### M6 — Die Signaturprüfung mit sharp: gemessen, mit Positivkontrolle

`sharp` ist direkte Abhängigkeit (`package.json:26`, `^0.35.3`, geladen: vips
8.18.6) und faktisch eine **harte Startabhängigkeit**: `routes/lageplan.js:17`
lädt sie auf oberster Ebene, `server.js:1427` lädt `routes/lageplan` ungeschützt.
Ohne sharp startet der Server gar nicht. Ein neuer Ausfallweg entsteht durch
ihre Benutzung also nicht.

Nachgemessen (19.09.2026, „sharp fehlt" über einen Lade-Haken hergestellt, ohne
`node_modules` anzufassen), mit Positivkontrolle und Negativkontrolle:

    Positivkontrolle MIT sharp:  lageplan geladen
    OHNE sharp:                  lageplan NICHT ladbar: MODULE_NOT_FOUND
    routes/module.js OHNE sharp: "Seil-Foto-Feature inaktiv" -> geladen

Die dritte Zeile ist die Gegenkontrolle: `routes/module.js` fängt denselben
Ausfall ab und lädt weiter. Es scheitert also nicht einfach alles — nur der
ungeschützte Weg.

Verfahren: Alpha auf Weiss legen (`flatten`, das ist genau der Blick des
Clients — der Canvas ist mit `#fff` gefüllt, `:516-517`/`:545-546`, und wird
per `canvas.toDataURL('image/png')` verschickt, `:650`), dann Kanal 0 gegen
dieselbe Schwelle 250 halten wie der Client. Gemessen:

    a) weisse Flaeche, wie ein geleertes Feld      600x400 k=3  Tintenpixel=0    -> LEER
    b) VOLLSTAENDIG TRANSPARENT (der Angriff)      600x400 k=3  Tintenpixel=0    -> LEER
    c) 1x1 transparent (kleinster Angriff)         1x1 k=3      Tintenpixel=0    -> LEER
    d) weiss + EIN schwarzer Punkt                 600x400 k=3  Tintenpixel=1    -> UNTERSCHRIEBEN
    e) weiss + kurzer Strich (2px breit, 40 lang)  600x400 k=3  Tintenpixel=80   -> UNTERSCHRIEBEN
    f) GRAUSTUFEN-PNG, weiss (1 Kanal)             600x400 k=3  Tintenpixel=0    -> LEER
    g) fast weiss (#fcfcfc)                        600x400 k=3  Tintenpixel=0    -> LEER
    h) Muell, kein PNG                             WURF: Input buffer contains unsupported image format

Die Methode kann also beide Antworten geben — die Positivkontrolle steht.

### M7 — Der Deckel: warum er nötig ist und wo er liegt

Eine PNG-Bombe passt in den 1-MB-Rumpf (`server.js:161-162`), und **heute
frisst `embedPng` sie**:

    Bombe 6000x6000 = 36.0 MP, Datei 0.11 MB, base64 0.15 MB
      passt in den 1-MB-Rumpf: JA
      roher Raster waere: 103.00 MB
    sharp.metadata(): 6000x6000 in 0 ms, RSS 74.62 MB  <- liest nur den Kopf
    limitInputPixels 4 MP: WURF "Input image exceeds pixel limit"  RSS 74.78 MB
    pdf-lib embedPng(Bombe): DURCH in 1952 ms, RSS 458.03 MB

Die Prüfung VOR `embedPng` mit einem Deckel verkleinert diese vorhandene
Angriffsfläche, sie schafft sie nicht. Beim vorgeschlagenen Deckel gemessen:

    16-MP-Bild: Datei 0.1 MB
      pdf-lib embedPng: 916 ms, RSS 265.6 MB
    16.8 MP (ueber dem Deckel): WURF "Input image exceeds pixel limit"
    15.6 MP (unter dem Deckel): geht durch, 2340x2400

Verkleinern vor dem Zählen ist billiger als ein voller Dekode UND begrenzt den
Aufwand unabhängig von der Eingabegrösse — und echte dünne Striche überleben es:

    voller Dekode 36 MP : 6000x6000 tinte=0  508 ms  RSS 179.4 MB
    resize 1600 sequent.: 1600x1600 tinte=0  108 ms  RSS 101.1 MB
    grosser Raster, 400x2-Strich                  voll=  800  nach resize=  216  -> erkannt
    grosser Raster, 40x2-Strich (winziger Haken)  voll=   80  nach resize=   24  -> erkannt
    normaler Raster, 200x2-Strich                 voll=  400  nach resize=  400  -> erkannt

Normalfall-Kosten für den echten Benutzer: **9–14 ms** (1200×800).

**Herleitung der beiden Zahlen, damit sie nicht geraten wirken:**

* `limitInputPixels: 16e6`. Der Signaturblock ist `(CSS-Breite × devicePixelRatio)`;
  die Fläche steht in einem zweispaltigen Raster ohne `max-width`
  (`.sig-canvas-wrap`, `:351`). Grösster realistischer Raster: Tablet 1024 CSS
  bei dpr 2 ≈ 2048 px breit, Desktop ≈ 1800 px — also rund 3 MP. 16 MP liegt
  gut fünffach darüber und deckelt zugleich, was `embedPng` danach höchstens
  allokieren kann (gemessen 266 MB statt 458 MB).
* `resize` auf 2400 `fit: inside, withoutEnlargement: true`. Unterhalb davon
  wird NICHTS verändert — für jeden realistischen Raster ist die Serverprüfung
  damit bitgenau die Clientprüfung (gemessen: 400 = 400). Darüber wird
  verkleinert, und ein echter Strich überlebt mit grossem Abstand.

**Restrisiko, ausdrücklich benannt:** ein Bild, dessen einzige Tinte nach dem
Verkleinern unter ein Pixel fällt (ein isolierter Einzelpunkt auf riesigem
Raster), würde abgewiesen. Der echte Block erzeugt so etwas nicht — `lineWidth`
2 mit `lineCap: round`, und ein blosser Klick ohne Bewegung zeichnet gar nichts.

**Was die Prüfung NICHT leistet, und das gehört in den Bericht:** Sie
unterscheidet eine echte Unterschrift nicht von einem Gekritzel. Das kann kein
Server. Sie erzwingt genau die Regel, die der Client zu erzwingen behauptet —
nicht mehr. Eine strengere Mindestmenge wäre eine geratene Schwelle und bleibt
draussen.

### M8 — Einbauort: NACH dem Identitätsriegel, VOR dem INSERT

Gemessen an den bestehenden Wächtern:

* `test_feature_belehrung_identitaet.js:39` sichert zu, dass die Meldung bei
  einer Fremd-Unterschrift die Identität nennt (`/eigenen|angemeldet/i`). Läuft
  die Signaturprüfung DAVOR, fällt diese Zusicherung.
* `test_feature_messfehler_nicht_behaupten.js:715` schickt
  `signatur: 'data:image/png;base64,AAAA'` und sagt im Kommentar, die Anfrage
  scheitere danach „harmlos an *Belehrung nicht gefunden*". Läuft die Prüfung
  vor dem `belRow`-Nachschlag, wird dieser Kommentar falsch.

Beides zugleich erfüllt genau eine Stelle: **direkt nach `if (!maRow) throw`
(`:782`) und vor der Berechnung von `gueltigBis`/dem INSERT.** Dort einbauen.
Die Zusicherungen beider Dateien bleiben damit unverändert gültig — prüfe das
und melde es, statt es zu glauben.

---

## Was zu bauen ist

Drei Beiträge. **Jeder einzeln grün committen und pushen.** Kein PR.

### B1 — Serverseitige Tintenprüfung (der Sicherheitsbeitrag)

**Neu: `core/signaturbild.js`.** Eine exportierte Funktion, fail-closed durch
Bauart — sie wirft in allen drei Fehlerklassen, statt ein Urteil an den Aufrufer
zurückzugeben, das jemand vergessen kann:

    async function pruefeSignaturbild(signaturDataUrl)
      -> { tintenPixel, breite, hoehe, geprueftBreite, geprueftHoehe }
      wirft bei: nicht dekodierbar | über dem Deckel | null Tintenpixel

Umsetzung wie in M6/M7 und M11 gemessen. **Gezählt wird an dem Mass, in dem
das PDF die Unterschrift wirklich zeichnet** — nicht an einer festen Zielgrösse
(Begründung und Zahlen in M11):

    const { drawW, drawH } = zeichenmass(breite, hoehe);
    sharp(buf, { limitInputPixels: 16e6, sequentialRead: true })
        .flatten({ background: '#ffffff' })
        .resize({ width: drawW, height: drawH, fit: 'inside', withoutEnlargement: true })
        .raw().toBuffer({ resolveWithObject: true })

danach `for (i = 0; i < data.length; i += info.channels) if (data[i] < 250) n++`.
`breite`/`hoehe` kommen aus `metadata()` (liest nur den Kopf, 0 ms — gemessen),
`geprueftBreite`/`geprueftHoehe` aus `info`. Das Präfix
`data:image/png;base64,` wird mit demselben Ausdruck abgestreift, den die Route
heute benutzt.

**`zeichenmass(breite, hoehe)` gehört in dasselbe Modul und wird von der ROUTE
mitbenutzt.** Die Route rechnet das Mass heute inline (`routes/belehrungen.js`,
`drawW = 250` mit Deckelung auf `drawH = 100`). Wer die Formel im Modul
nachbaut, hat sie verdoppelt — zwei Orte derselben Aussage, und die Prüfung
würde still an einem anderen Mass messen, als das PDF zeichnet, sobald jemand
einen der beiden Werte ändert. Also: Formel EINMAL im Modul, Route ruft sie
auf, und eine Zusicherung hält ihr Ergebnis gegen literal hingeschriebene
Erwartungen.

Die Schwelle 250 und der Kommentar dazu: **sie ist aus `routes/belehrungen.js:639`
übernommen, nicht gewählt.** Schreib das als Kommentar daneben, mit Fundstelle —
sonst dreht sie später jemand an einer Stelle und nicht an der anderen ("Dieselbe
Aussage an zwei Orten").

**Route (`routes/belehrungen.js`):** an der in M8 bestimmten Stelle aufrufen.
Die drei Fehlermeldungen kommen in die `erwartet(...)`-Liste am Ende der Route
(`:900-907`), damit sie als 400 mit lesbarem Text herauskommen und nicht als 500.
Vorschlag für den Wortlaut, für den Benutzer verständlich:

* „Bitte unterschreiben — das Signaturfeld ist leer."
* „Die Unterschrift konnte nicht gelesen werden."
* „Die Unterschrift ist zu gross."

Bei den letzten beiden zusätzlich ein `console.error` mit den gemessenen
Abmessungen — eine Fehlabweisung soll SICHTBAR sein, nicht still.

**Kollateral, Pflicht (M2):** in `test_feature_belehrung_version.js:20`,
`test_feature_belehrung_gelesen.js:22` und `test_feature_client_ip.js:762` die
Konstante ersetzen. Verwende GENAU diese, sie ist nachgemessen (16×8, 24
Tintenpixel, von sharp UND pdf-lib angenommen):

    const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAGklEQVQoz2P4TyFgGDwGMDAwkISpb8DQDUQAGV+2WBGen6UAAAAASUVORK5CYII=';

Schreib in jede der drei Dateien einen Kommentar dazu, WARUM die alte nicht mehr
geht (leer + kaputte Prüfsumme) — sonst setzt sie jemand beim nächsten
Aufräumen zurück.

`test_feature_belehrung_identitaet.js` und `test_feature_messfehler_nicht_behaupten.js`
sollen nach M8 unverändert grün bleiben. **Melde beide Ergebnisse ausdrücklich.**

### B2 — Verbrauch ans Ende, mit Generationsprüfung

1. **Früh lesen — und zwar VOR dem Nachschlag der Belehrung (`belRow`).**
   Die Reihenfolge ist nicht Geschmack, sie entscheidet (Nachtrag M13): wird
   `belRow` zuerst gelesen, kann `/neue-version/:id` dazwischenfahren, und wir
   lesen danach die NEUE Generation, signieren aber das ALTE Dokument und
   löschen am Ende genau die neue Pflicht. Liest man die Generation ZUERST,
   hält man im Rennen die ALTE (oder gar keine), das DELETE trifft nichts, und
   die neue Pflicht überlebt. Der Fehler fällt damit immer auf die sichere
   Seite: schlimmstenfalls muss noch einmal unterschrieben werden, nie
   verschwindet eine Pflicht.

       SELECT freigeschaltet_am FROM belehrung_freischaltung
        WHERE studio_id = $1 AND mitarbeiter_id = $2 AND belehrung_id = $3

   Kein Treffer ist der Normalfall (Erstunterschrift ohne manuelle Freischaltung).

2. **Das DELETE an Zeile 826 entfernt** und in die bestehende Transaktion am
   Ende gezogen — nach dem Gelingen des PDF-Schritts, mit der
   Generationsbedingung:

       DELETE FROM belehrung_freischaltung
        WHERE studio_id = $1 AND mitarbeiter_id = $2 AND belehrung_id = $3
          AND freigeschaltet_am = $4

   Wurde zwischendurch neu angefordert, trifft es nichts und die neue Pflicht
   überlebt (M4). Nur ausführen, wenn früh ein Wert gelesen wurde.

3. **Den Studio-Advisory-Lock ausdrücklich ZUERST nehmen**
   (`SELECT pg_advisory_xact_lock($1)` mit `req.studioId` als erste Anweisung
   der Transaktion). Begründung als Kommentar daneben, sonst räumt es jemand
   als „doppelt" weg: Advisory-Locks sind innerhalb derselben Transaktion
   wiedereintrittsfähig, der spätere Griff in `auditAppend`
   (`core/integritaet.js:65`) stört also nicht.

   **BERICHTIGUNG (Planprüfung, Nachtrag M12): der Lock verhindert KEINEN der
   heutigen Schreibwege.** Ein Advisory-Lock bindet nur Wege, die ihn
   ebenfalls nehmen — alle vier bestehenden Schreibzugriffe laufen unter
   Autocommit und nehmen ihn nicht. Das Gegenmittel gegen das Rennen aus M4
   ist allein die Generationsprüfung aus Punkt 2. Der Lock ist VORSORGE für
   künftige Wege, die ihn respektieren, plus eine feste Reihenfolge, damit aus
   dem Zusammenziehen kein Kreis entsteht. Genau so gehört es in den
   Kommentar: ein Satz, der mehr behauptet, ist gefährlicher als gar keiner,
   weil er falsche Sicherheit erzeugt.
   Nachgemessen: alle vier Schreibzugriffe auf `belehrung_freischaltung`
   laufen heute über blankes `db.run` unter Autocommit
   (`routes/admin/mitarbeiter.js:856`, `routes/belehrungen.js:826`, `:1964`,
   `:1979`), es entsteht durch die Umstellung also KEIN Kreis.

4. **`rowCount` lesen** und als `freischaltung_verbraucht` in die Audit-Nutzlast
   schreiben — den gemessenen Wert, nie eine Konstante. Dazu
   `signatur_tinte_px` aus B1.

5. **Kein `catch {}` mehr.** Scheitert das DELETE, scheitert die Transaktion.

6. **Den irreführenden Kommentar bei `:886` berichtigen.**

### B3 — Der Aufräum-DELETE nur für ungehashte Zeilen

`:898` bekommt `AND signatur_hash IS NULL`. Eine Unterschrift, die ihren Hash
schon hat (die Transaktion also durch ist), kann der Fehlerpfad danach nicht
mehr zerstören (M5). Kommentar mit der Begründung daneben.

### B4 — Das GEPRÜFTE Bild einbetten, nicht das eingeschickte

Begründung und Zahlen in M16. Kurz: die Prüfung aus B1 deckelt nur ihre EIGENE
Pipeline; `pdfDoc.embedPng()` bekäme weiterhin den Originalpuffer und
dekodiert ihn vollständig. Damit bliebe der teure Verbraucher ungedeckelt, und
— schlimmer — es prüfte ein anderer Parser als der, der verbraucht (M2 zeigt,
dass sharp und pdf-lib nicht dieselbe Gültigkeitsmenge haben).

`pruefeSignaturbild()` gibt deshalb zusätzlich einen **kanonisch neu kodierten
PNG-Puffer** zurück, und die Route übergibt GENAU DIESEN an `embedPng`:

    .resize({ width: 1042, height: 417, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 6 }).toBuffer()

**Herleitung der Einbettgrösse, damit sie nicht geraten wirkt:** das PDF
zeichnet die Unterschrift auf höchstens 250×100 pt. Bei 300 dpi Druckauflösung
sind das 250·300/72 = 1042 und 100·300/72 = 417 Pixel. Mehr Pixel landen im
Dokument nie sichtbar.

Gemessen (je EIN eigener Prozess, weil RSS innerhalb eines Prozesses kumulativ
ist und ein Rückgang sonst gar nicht messbar wäre):

    heute 3900x4000   722 ms  RSS-Zuwachs 182.3 MB
    neu    407x417    131 ms  RSS-Zuwachs  17.1 MB

Die Tinte bleibt dabei exakt erhalten (am Zeichenmass gemessen: 252 gegen 252
beim grossen Bild, 76 gegen 76 im Normalfall), und ein normales Bild kostet
das Neukodieren 12 ms.

**Die Zusicherung dazu:** das im PDF eingebettete Bild hat die Abmessungen des
KANONISCHEN Puffers, nicht die des eingeschickten. Literal hingeschriebene
Erwartung, nicht aus dem Produktivcode abgeleitet.

---

## Der Wächter

Neu: `test_feature_signatur_verbrauch.js`, registriert in `test/run.sh`.
**Die Sollzahl des Dateizahl-Rituals steigt um 1** — nenne beide Zahlen.

### Fixturen

**Kontrollzeilen sind Pflicht.** Mit nur EINER Freischaltung überlebt eine
Mutation `AND belehrung_id=$3` → `AND $3=$3` unsichtbar. Lege an und sichere
zu, dass sie ALLE überleben:

* dieselbe Person, ANDERE Belehrung
* ANDERE Person, dieselbe Belehrung
* FREMDES Studio, gleiche Zahlen

**IDs paarweise verschieden.** Auf frischer Datenbank trägt sonst jede Tabelle
dieselbe Zahl und eine Vertauschung wäre unsichtbar.
`test_feature_mandantengrenze_fremd_ids.js` hat dafür seit gestern ein Muster
(`vorschiebeSequenz`, `vorschiebeSequenzBisUeber`, F6-1) — **lies es und
übernimm den Ansatz, statt ihn neu zu erfinden.**

Drei Bild-Konstanten, alle drei nachgemessen (Tinte / pdf-lib):

    PNG                   24 Tintenpixel   pdf-lib nimmt an    (siehe B1)
    PNG_LEER_WEISS         0 Tintenpixel   pdf-lib NIMMT AN    (der Angriff)
    PNG_LEER_TRANSPARENT   0 Tintenpixel   pdf-lib NIMMT AN    (der Angriff)

    const PNG_LEER_WEISS = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAIAAAB/FOjAAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQY02P4TyJgGNVACw0A7KR+kPQ67zsAAAAASUVORK5CYII=';
    const PNG_LEER_TRANSPARENT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAD0lEQVQoz2NgGAWjgIEBAAIIAAE8uf+zAAAAAElFTkSuQmCC';

Dass pdf-lib die beiden leeren annimmt, ist der Beweis, dass die Lücke echt ist
— schreib das als Kommentar dazu.

### Zusicherungen (Mindestbestand)

**Auf dem Modul, in PRODUKTIONSFORM aufgerufen** — dieselben Argumente,
dieselben Typen wie die Route sie übergibt (Regel vom 13.09.2026: eine Funktion
auszulagern macht sie prüfbar, nicht geprüft; und ein Test, der sie ANDERS
aufruft als die Produktion, prüft einen Zweig, den es in Produktion nicht gibt):

1. Beide leeren PNG → wirft.
2. **ZWEI verschiedene inkte PNG** → wirft nicht, und `tintenPixel` trägt je
   den GEMESSENEN Wert (nicht „> 0" — eine Schwelle über eine Zahl ist keine
   Zusicherung über eine Menge). **Zwei, nicht eins, und mit UNTERSCHIEDLICHER
   Tintenmenge:** mit nur einer Fixtur erfüllt ein fest zurückgegebenes
   `tintenPixel: <derselbe Wert>` die Zusicherung, ohne dass noch irgendetwas
   gezählt wird. Unsere Klasse „ein Aufruf mit MEHREREN unterscheidbaren
   Eingaben statt mehrerer Aufrufe mit je einer".
2b. **`zeichenmass()`** liefert für mehrere literal hingeschriebene
   Seitenverhältnisse das erwartete Mass (mindestens: quadratisch → 100×100,
   breit 1200×800 → 150×100, sehr breit 2400×1200 → 200×100).
3. Müll (`'x'`) → wirft, mit anderer Fehlerklasse als „leer".
4. Über dem Deckel → wirft; knapp darunter → geht durch. **Beide Richtungen**,
   sonst belegt die Messung den Einzelfall statt der Klasse.

**Durch die Route:**

5. Erfolgsfall: inktes PNG → Unterschrift entsteht, Freischaltung ist weg, die
   drei Kontrollzeilen sind UNBERÜHRT (gelesen, nicht gezählt).
6. Leeres PNG → HTTP 400, KEINE Unterschrift, Freischaltung **NOCH DA**,
   Kontrollzeilen unberührt.
7. Fehler NACH dem Verbrauchszeitpunkt (ein Wurf im PDF-Schritt, gestellt über
   eine nicht ladbare Dokumentdatei) → keine Unterschrift, Freischaltung
   **NOCH DA**.
8. Generationsprüfung: zwischen dem frühen Lesen und dem Ende wird
   `freigeschaltet_am` verändert (Neuanforderung nachgestellt) → die
   Freischaltung ÜBERLEBT, und die Unterschrift entsteht trotzdem.
9. Audit trägt `freischaltung_verbraucht` und `signatur_tinte_px` mit den
   gemessenen Werten. **Beide brauchen ZWEI Fälle mit VERSCHIEDENEN Werten**,
   sonst ist eine fest verdrahtete Konstante nicht von der Messung zu
   unterscheiden:
   * `freischaltung_verbraucht`: ein Aufruf MIT vorhandener Freischaltung
     (erwartet 1) und einer OHNE (erwartet 0).
   * `signatur_tinte_px`: zwei gültige PNG mit unterschiedlicher, literal
     hingeschriebener Tintenmenge durch die ECHTE Route.
   **Den Audit-Eintrag über `studio_id`, Ereignis UND `bezug_id` lesen**, nicht
   „den letzten Eintrag des Studios" — sonst beschreibt die Zusicherung
   womöglich einen anderen Aufruf als den gemessenen.
9b. **Der Verbrauch läuft auf der TRANSAKTIONSVERBINDUNG.** Ein Fall, in dem
   `auditAppend` NACH dem DELETE und vor dem Commit wirft (Test-Wrapper, nur
   für einen markierten Aufruf): danach muss die Freischaltung VOLLSTÄNDIG
   wieder da sein, es darf keine gehashte Unterschrift und keinen
   Audit-Eintrag geben. Ohne diese Zusicherung bewacht nichts, dass das DELETE
   überhaupt in der Transaktion liegt — `t.run` durch `db.run` zu ersetzen
   bliebe sonst unsichtbar (Nachtrag M14).
10. B3: eine Zeile mit gesetztem `signatur_hash` überlebt den Aufräum-DELETE,
    eine ohne nicht. Beide Richtungen.
11. Mindestprüfzahl, von Hand aus dem Quelltext hergeleitet, mit
    Abschnittsnamen statt Zeilennummern.

**Kein echtes Dateisystem, keine echten Dienste, keine echten Prozesse** — die
Suite ist auf dem Live-Server Deploy-Gate. Für das Dokument-PDF halte dich an
das, was `test_feature_belehrung_gelesen.js` tut, und melde, wenn das nicht geht.

---

## Gegenproben — verbindlich, je einzeln, beide Richtungen

Verfahren: unabhängige `cp`-Sicherung, Mutationsskript mit **Zielpfad als
Argument**, Fundstellenzählung mit Abbruch bei ungleich 1,
`GEGENPROBE-`+`DEFEKT`-Marker, `node --check`, Lauf ohne Pipe, Rücknahme aus der
Kopie mit `diff` EXIT 0. **Nie `git checkout`/`git stash`**, Rücknahme nie mit
einem Lauf verketten (der PreToolUse-Wächter lehnt den GANZEN Befehl ab).
Nach jeder Gegenprobe `git status --short` über ALLE Arbeitsbäume.

**K1 — der Kernbeleg.** Den Aufruf von `pruefeSignaturbild` in der Route
entfernen. Erwartung: Zusicherung 6 fällt. Fällt sie nicht, ist der Wächter
wertlos — melden, nicht nachbessern.

**K2 — der Verbrauch ist wirklich bewacht.** NICHT das DELETE entfernen (das
nimmt auch den `rowCount` mit und lässt mehrere Zusicherungen zugleich fallen,
isoliert also nichts). Stattdessen formerhaltend die Trefferwahl verbiegen:
`mitarbeiter_id = $2` → `mitarbeiter_id = -$2`. Die Anweisung läuft weiter und
liefert einen `rowCount`. Erwartung: Zusicherung 5 fällt.

**K3 — die Mandantenbindung ist bewacht.** `AND belehrung_id=$3` →
`AND $3=$3`. Erwartung: die Kontrollzeile „dieselbe Person, andere Belehrung"
fällt. Genau dafür gibt es sie.

**K4 — der Nachweis ist echt.** `freischaltung_verbraucht` auf feste `1`.
Erwartung: Zusicherung 9 fällt.

**K5 — die Generationsprüfung wirkt.** `AND freigeschaltet_am = $4` streichen.
Erwartung: Zusicherung 8 fällt.

**K6 — B3 wirkt.** `AND signatur_hash IS NULL` streichen. Erwartung:
Zusicherung 10 fällt.

**K7 — die Tintenschwelle ist bewacht. NUR mit der Grenzfixtur.** Gemessen
(M15): mit einem reinen Schwarz-Weiss-Bild ist die Gegenrichtung WIRKUNGSLOS —
dessen Tintenpixel haben Kanal 0 = 0, also zählen `< 250` und `< 1` dieselben
24. Deshalb gehört eine eigene Grenzfixtur in den Wächter, deren Kanalwerte
beiderseits der Grenze liegen; jede Mutation landet dann auf einer ANDEREN
Zahl:

    Schwelle <256  -> 48 Tintenpixel
    Schwelle <250  -> 24 Tintenpixel      <- der Sollwert
    Schwelle <249  -> 16 Tintenpixel
    Schwelle <1    ->  8 Tintenpixel

    const PNG_GRENZE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAECAYAAAC6Jt6KAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAJklEQVQI12P4+fPnfxAGgV+/foExCDQ0NIAxCDAwMIAxmD34NAAArMyaaVGUpLQAAAAASUVORK5CYII=';

Alle vier Mutationen einzeln fahren und je die Zusicherung über die
Grenzfixtur rot sehen.

**K11 — der Verbrauch liegt wirklich in der Transaktion.** `await t.run(<DELETE>)`
→ `await db.run(<DELETE>)`. Erwartung: Zusicherung 9b fällt (die Freischaltung
ist nach dem erzwungenen Audit-Wurf weg, obwohl nichts committet wurde).
Zweite Richtung: ein `catch {}` um dasselbe DELETE legen — Erwartung:
Zusicherung 9b fällt ebenfalls.

**K12 — `signatur_tinte_px` ist gemessen, nicht konstant.** Im Audit-Payload
`signatur_tinte_px: <gemessen>` → `signatur_tinte_px: <Wert der ersten
Route-Fixtur>`. Erwartung: Zusicherung 9 fällt an der ZWEITEN Route-Fixtur.

**K13 — das kanonische Bild wird wirklich eingebettet.** In B4 den
`embedPng`-Aufruf wieder auf den Originalpuffer zeigen lassen. Erwartung: die
Zusicherung aus B4 fällt.

**K9 — die Zählung ist echt, nicht konstant.** Im Modul die Pixelschleife durch
eine feste Rückgabe ersetzen (`tintenPixel: <Wert der ersten Fixtur>`).
Erwartung: Zusicherung 2 fällt, und zwar an der ZWEITEN Fixtur. Fällt sie
nicht, hatten beide Fixturen dieselbe Tintenmenge — dann ist die Fixturwahl
der Fehler, nicht die Zusicherung.

**K10 — das Zeichenmass ist bewacht.** In `zeichenmass()` die Deckelung
`if (drawH > 100)` auf `if (drawH > 1000)` setzen. Erwartung: Zusicherung 2b
fällt. Zweite Richtung: `drawW = 250` auf `drawW = 25`.

**K8 — Positivkontrolle gegen eine leere Prüfung.** Zeige, dass der Fehlerfall
aus Zusicherung 7 den PDF-Schritt WIRKLICH erreicht und nicht schon vorher
aussteigt — sonst ist „Freischaltung noch da" nicht von „gar nicht angekommen"
zu unterscheiden.

---

## Ausdrücklich NICHT in diesem Beitrag

Drei weitere Stellen derselben Klasse sind nachgemessen und bestätigt, bleiben
aber draussen, damit der Beitrag prüfbar bleibt. Sie bekommen ein eigenes Papier:

* `routes/admin/mitarbeiter.js` ~856/862 — zwei Autocommit-DELETEs vor der
  `db.tx` mit `DELETE FROM mitarbeiter`
* `routes/belehrungen.js` ~1455/1469 — Einweisung: `UPDATE …aktiv=0`, dann
  INSERT, beide Autocommit
* `routes/belehrungen.js` ~1614/1641 — Ersthelfer: `inaktiv_seit`, dann INSERT
* **`/neue-version/:id` ist selbst nicht atomar** (Planprüfung, von mir am
  Quelltext bestätigt): `UPDATE belehrungen SET dateiname` (Autocommit), dann
  `schalteAlleFrei()` (Autocommit), dann `auditAppend()` (eigene Transaktion).
  Scheitert einer der späteren Schritte, ist die neue Version bereits aktiv,
  ohne dass jemand zur Neuunterschrift verpflichtet wäre — und der `catch`
  führt `fs.unlink(req.file.path)` aus, **obwohl die bereits committete
  Belehrungszeile genau auf diese Datei zeigt**. Eigener, ernster Befund,
  eigenes Papier.

Ebenfalls draussen: eine Mindest-Tintenmenge über die Client-Regel hinaus
(wäre eine geratene Schwelle, siehe M7).

---

## Abschluss

Volle Suite als `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`
(kein Pipe, kein äusseres `flock` — sie sperrt selbst), `npm run lint` wörtlich
auch bei Grün, Dateizahl-Ritual mit dem BREITEN Sieb (`── [^ ]+\.js ──`),
Marker-Scan mit `--exclude-dir`, `git status --short`.

**Commit-und-Push nach JEDEM Beitrag.** Kein PR.

Melde am Ende ausdrücklich, was NICHT geklappt hat, und melde Zahlen so, wie sie
im Log stehen — nie aus einem früheren Lauf abgeschrieben.

---

## Nachtrag — nach dem Absenden der Planprüfung gemessen (19.09.2026)

Die beiden Gegenlesungen haben die Fassung ohne diesen Nachtrag bekommen
(Commit `24e05fc`). Er steht hier getrennt, damit nachvollziehbar bleibt, was
geprüft wurde und was danach dazukam.

### M9 — Der Einbauort aus M8 ist nicht mehr behauptet, sondern gemessen

Verfahren: unabhängige `cp`-Sicherung, Mutationsskript mit Zielpfad als
Argument und Abbruch bei ungleich einem Treffer, `GEGENPROBE-`+`DEFEKT`-Marker,
`node --check`, Läufe ohne Pipe gegen eine eigene Wegwerf-Datenbank
(`gymdocu_basis_test`, NICHT `gymdocu_test`), Rücknahme aus den Kopien mit
`diff` EXIT 0 für alle vier Dateien, danach `git status --short` leer und
Marker-Scan mit `--exclude-dir` ohne Treffer in ausführbarem Code.

Eingebaut wurde eine Stellvertreter-Prüfung an der in M8 bestimmten Stelle
(direkt nach `if (!maRow) throw`), inhaltlich wie in B1 beschrieben, plus die
zwei Meldungen in der `erwartet(...)`-Liste.

    Wächter                                   OHNE Prüfung   MIT Prüfung,     MIT Prüfung,
                                              (Ausgangslage) ALTE Fixtur      NEUE Fixtur
    test_feature_belehrung_identitaet.js      EXIT 0,  5/0   EXIT 0,  5/0     —
    test_feature_messfehler_nicht_behaupten   EXIT 0, 46/0   EXIT 0, 46/0     —
    test_feature_belehrung_gelesen.js         EXIT 0, 26/0   EXIT 1, 12/14    EXIT 0, 26/0
    test_feature_belehrung_version.js         EXIT 0, 17/0   EXIT 1 (Absturz) EXIT 0, 17/0
    test_feature_client_ip.js                 —              —                EXIT 0, 80/0

Damit ist in BEIDE Richtungen belegt:

* Der Einbauort lässt `identitaet` und `messfehler_nicht_behaupten`
  unverändert — die Sorge aus M8 trägt, und die gewählte Stelle löst sie.
* Die drei Erfolgspfad-Tests fallen mit der alten Fixtur und werden mit der
  neuen wieder grün. Der Fixtur-Tausch ist also die richtige und vollständige
  Gegenmaßnahme, nicht eine Abschwächung der Prüfung.

Gefallen sind bei `gelesen` unter anderem:

      ✗ FAIL: Unterschrift gespeichert (status ok)
      ✗ FAIL: Unterschrift-Datensatz vorhanden (PDF signiert)
      ✗ FAIL: Audit vermerkt gelesen_bestaetigt
      ✗ FAIL: Studio A / Max: jetzt 0 offen

**Folge für den Auftrag:** B1 ist damit in seinem riskantesten Teil vorgemessen.
Der Executer baut die endgültige Fassung (eigenes Modul `core/signaturbild.js`
statt der Stellvertreter-Zeilen) und misst selbst nach — er übernimmt diese
Zahlen NICHT, er reproduziert sie.

### M10 — Ein ungesicherter Zugriff in `test_feature_belehrung_version.js:125`

Beim Rotlauf oben meldete `version.js` keine FAIL-Zeile, sondern stürzte ab:

    FEHLER: TypeError: Cannot read properties of null (reading 'pdf')
        at /home/user/gymdocu/test_feature_belehrung_version.js:125:68

Das ist unsere Klasse „eine Diagnose darf niemals Abdeckung kosten": aus „ein
FAIL, Rest grün" wird „unbekannt", und alles nach Zeile 125 läuft nie. Nimm das
in B1 mit: den Zugriff absichern (Vorbild F4-N9 aus
`test_feature_mandantengrenze_fremd_ids.js`), sodass die Datei bei einem
künftigen Fehlschlag eine Zusicherung meldet statt abzubrechen. Eine Zeile,
eigener Commit, eigener Gegenbeweis (ohne den Schutz stürzt sie ab, mit ihm
meldet sie FAIL).

---

## Nachtrag — Planprüfung, Spur DeepSeek (19.09.2026)

Vier Befunde, alle vier SELBST nachgemessen. Zwei tragen und haben den Entwurf
geändert, einer trägt in der Sache mit falschem Beispiel, einer stand schon im
Papier.

### M11 — Befund 1: minimale Tinte. TRÄGT, aber anders als gemeldet

Gemeldet war: ein 1×1-PNG mit EINEM schwarzen Pixel gehe durch und erzeuge
„ein signiertes PDF, das praktisch keine sichtbare Unterschrift enthält".

**Das Beispiel trifft nicht.** Die Route rechnet `drawW = 250`, gedeckelt auf
`drawH = 100`; ein quadratisches Bild wird also als **100×100 pt** gezeichnet —
bei einem durchgehend schwarzen 1×1-PNG ein ausgefüllter schwarzer Block, das
Gegenteil von unsichtbar.

**Die Sache trägt trotzdem, in einer anderen Gestalt.** Gemessen:

    Fall                         Pruefung@2400   Zeichenmass im PDF   Tinte@Zeichenmass
    1x1 ganz schwarz                  1          100x100                  1  -> SICHTBAR
    2400x1200, EIN Punkt              1          200x100                  0  -> UNSICHTBAR
    echte Unterschrift 1200x800     600          150x100                 76  -> SICHTBAR

Ein einzelner Punkt auf einem grossen Raster kommt also durch eine Prüfung bei
2400 px, ist im PDF aber nicht mehr vorhanden.

**Behebung, und sie ist HERGELEITET statt geraten:** nicht eine Mindestmenge
festlegen (das wäre eine geratene Schwelle, wie vom Prüfer vorgeschlagen:
„mindestens 10 Pixel oder 1 %"), sondern **an dem Mass zählen, in dem das PDF
tatsächlich zeichnet.** Damit lautet die Zusicherung nicht mehr „genug Tinte",
sondern „im Dokument ist etwas zu sehen" — genau der Zweck.

Gegenrichtung gemessen, damit die Behebung keine echten Unterschriften
abweist — 19 Kombinationen aus fünf Rastern und vier Strichstärken:

    Raster        Zeichenmass   winziger Haken 20x2  kurzer Haken 60x2  kurz 200x2   normal 600x3
    600x400       150x100          12 ok                32 ok            102 ok      n/a
    1200x800      150x100           6 ok                16 ok             51 ok      152 ok
    1800x1000     180x100           4 ok                12 ok             40 ok      120 ok
    2048x1400     146x100           4 ok                 9 ok             29 ok       87 ok
    2400x1200     200x100           5 ok                11 ok             35 ok      101 ok

**Keine einzige Fehlabweisung**, und der knappste echte Fall (ein 20×2-Haken
auf 2048×1400) hat noch vier Tintenpixel Abstand zur Grenze.

**Was die Behebung NICHT leistet, und das bleibt benannt:** auf einem KLEINEN
Raster überlebt ein Einzelpunkt auch das Zeichenmass (600×400 → 150×100,
Tinte 1 → geht durch). Die Verkleinerung ist dort nur vierfach. Das ist keine
Lücke der Umsetzung, sondern die Grenze der Fragestellung: ein Server kann
einen absichtlichen Einzelpunkt nicht von einem echten winzigen Haken
unterscheiden, und der Browser kann es genauso wenig. Der Unterschied zu
vorher ist, dass der unsichtbare Fall auf normalen und grossen Rastern jetzt
zu ist — zum Preis von null und ohne Fehlabweisung.

### M12 — Befund 4: der Advisory-Lock-Satz war zu weit. TRÄGT

Mein Satz „ein gegenläufiger Schreibweg wird damit unmöglich, bevor es ihn
gibt" ist falsch. Ein Advisory-Lock bindet nur Wege, die ihn ebenfalls nehmen;
alle vier bestehenden laufen unter Autocommit und nehmen ihn nicht. Das
Gegenmittel gegen das Rennen ist allein die Generationsprüfung. Der Satz ist
im Auftrag berichtigt — er ist genau unsere Klasse „ein Kommentar, der mehr
behauptet, als gemessen ist", und er hätte einen künftigen Leser in falscher
Sicherheit gewiegt.

### Befund 2: Zusicherung 2 ist durch eine Konstante erfüllbar. TRÄGT

Mit EINER inkten Fixtur erfüllt ein fest zurückgegebenes `tintenPixel: 24` die
Zusicherung vollständig. Behoben: zwei Fixturen mit UNTERSCHIEDLICHER
Tintenmenge, dazu die neue Gegenprobe K9.

### Befund 3: Zeitstempel-Kollision. STAND SCHON IM PAPIER

Der Prüfer nennt das Restrisiko, das M4 bereits benennt, und schlägt eine
Versionsspalte oder ein Zufallstoken vor. **Nicht übernommen:** beides
verlangt eine Migration auf einer Tabelle, deren einziger Zweck ein
Einmal-Token ist, und der Kollisionsfall verlangt zwei Neuanforderungen
innerhalb derselben Mikrosekunde. Das Verhältnis stimmt nicht. Bleibt als
benanntes Restrisiko stehen.

### Was der Lauf über den PRÜFER sagt

Zehn Prüfungen wörtlich benannt, darunter drei, die meine eigenen Behauptungen
am Material nachgesehen haben (Autocommit, sharp, Einbauort) — alle drei
bestätigt, was mit meinen eigenen Messungen M6/M9 übereinstimmt. Der Prüfer
hat KEINEN der Punkte gemeldet, die ich selbst gefunden habe (M2, M4, M7) —
er hatte sie aber auch schon im Papier stehen.

---

## Nachtrag — Planprüfung, Spur gpt-5.6-sol xhigh (19.09.2026)

Sieben Befunde, 10 wörtlich benannte Prüfungen, `status: completed`, 24.331
Denk-Token. **Null Überschneidung mit der DeepSeek-Spur** — dieselbe
Beobachtung wie am 13.09.2026, und sie ist der ganze Grund, beide zu fahren.
Alle sieben selbst nachgemessen; **sechs tragen**, einer ist in der Sache
richtig und im Beispiel falsch.

### M13 — Befund 1 (blockierend): die Generationsprüfung schliesst das Rennen NICHT

Mein Plan las `belRow` VOR `freigeschaltet_am`. Damit bleibt genau der Ablauf
offen, gegen den die Generationsprüfung antritt: Signaturroute liest die alte
Datei → `/neue-version` schreibt Datei und neue Generation G1 → Signaturroute
liest G1, signiert aber die ALTE Datei und löscht am Ende genau G1.

Am Quelltext bestätigt: `routes/belehrungen.js` liest `belRow.dateiname` vor
allem Weiteren, und `/neue-version/:id` setzt `dateiname` per UPDATE und ruft
danach `schalteAlleFrei()`, das `freigeschaltet_am = CURRENT_TIMESTAMP` neu
setzt.

**Behebung: Reihenfolge umdrehen** — Generation zuerst, `belRow` danach. Dann
hält man im Rennen die ALTE Generation, das DELETE trifft nichts, die neue
Pflicht überlebt. Im Auftrag als B2.1 festgeschrieben.

**Nicht übernommen** wurde der stärkere Vorschlag (beim DELETE zusätzlich
prüfen, dass `belehrungen.dateiname` noch der signierte Wert ist). Mit
richtiger Reihenfolge fällt jedes Rennen ohnehin auf die sichere Seite; die
zusätzliche Bedingung würde eine Unterschrift SCHEITERN lassen, wo heute nur
eine Pflicht stehenbleibt. Das ist eine Verhaltensentscheidung, kein
Fehlerfix, und gehört nicht in denselben Beitrag.

**Ebenfalls zutreffend und übernommen:** dass der Advisory-Lock durch NICHTS
bewacht ist. Er bleibt als Vorsorge drin, und im Auftrag steht jetzt
ausdrücklich, dass er KEINE zugesicherte Invariante ist (siehe auch M12).

### M14 — Befund 3: nichts bewacht, dass der Verbrauch in der Transaktion liegt

`await t.run(<DELETE>)` → `await db.run(<DELETE>)` wäre durch keine der elf
Zusicherungen erkennbar gewesen. `db.run` nimmt den POOL, nicht die
Transaktionsverbindung (`core/db.js:421-432`) — das DELETE committet dann
sofort und überlebt einen späteren Fehler. Zusicherung 7 hilft nicht, weil ihr
PDF-Fehler zeitlich VOR dem neuen Verbrauch liegt.

Übernommen als Zusicherung 9b (erzwungener Wurf aus `auditAppend` nach dem
DELETE, davor Freischaltung muss vollständig zurück sein) und Gegenprobe K11.

### M15 — Befund 5: meine eigene Gegenprobe K7 war wirkungslos

Gemessen an der Fixtur, die ich selbst vorgegeben hatte:

    Kanal-0-Werte: 0x24  255x104
    Treffer bei <250: 24 | Treffer bei <1: 24

Die Tintenpixel sind exakt 0, also zählen `< 250` und `< 1` dieselben 24 —
die Gegenrichtung von K7 hätte nie rot werden können. Genau unsere Klasse
„Testdaten, die den gesuchten Unterschied gar nicht auslösen können", und ich
habe sie in derselben Datei vorgegeben, in der sie zweimal beschrieben steht.

Behoben mit einer Grenzfixtur (Kanalwerte 0, 128, 249, 250, 255), bei der jede
der vier Mutationen auf eine ANDERE Zahl fällt: 48 / 24 / 16 / 8.

### M16 — Befund 6: der Deckel schützt den Speicher nicht

Richtig: B1 deckelt nur seine eigene Pipeline, `embedPng` bekäme weiterhin das
Original. Gemessen in je einem eigenen Prozess — **182,3 MB gegen 17,1 MB
RSS-Zuwachs, 722 ms gegen 131 ms** — und übernommen als eigener Beitrag B4.
Der Vorschlag ist zusätzlich deshalb gut, weil er die von M2 belegte
Uneinigkeit der beiden Parser auflöst: geprüft und verbraucht wird ab dann
dieselbe Darstellung.

**Eigene Korrektur am Rande:** meine erste Messung dazu lief in EINEM Prozess
und zeigte scheinbar MEHR Speicher für die bessere Variante. RSS ist innerhalb
eines Prozesses kumulativ; ein Rückgang ist so gar nicht messbar. Erst je ein
eigener Prozess zeigt die Richtung.

### Befund 4: `signatur_tinte_px` mit einer Fixtur nicht bewacht — TRÄGT

Dieselbe Klasse, die die DeepSeek-Spur am MODUL gefunden hat, hier an der
ROUTE und am Audit-Feld. Beide Spuren fanden also dieselbe Krankheit an
verschiedenen Stellen — und keine fand die der anderen. Übernommen als
Zusicherung 9 mit zwei Fällen je Feld, dazu K12. Der Zusatz, den Audit-Eintrag
über `bezug_id` statt „letzter Eintrag des Studios" zu lesen, ist übernommen.

### Befund 7: zwei Bestandsbehauptungen von mir stimmen nicht — TRÄGT

„über fünf Dateien" sind in Wahrheit sieben; und M8 behauptete eine
EINZIGKEIT des Einbauorts, die nicht besteht — jede Stelle nach erfolgreichem
`belRow` lässt die beiden genannten Wächter unverändert. Nach `maRow` ist die
FRÜHESTE solche Stelle, und das ist der eigentliche Grund. Beides im Auftrag
berichtigt.

### Befund 2: `/neue-version/:id` ist selbst nicht atomar — TRÄGT, aber ausserhalb

Am Quelltext bestätigt, einschliesslich des `catch`, der die gerade
hochgeladene Datei löscht, obwohl die committete Belehrungszeile schon auf sie
zeigt. In die Ausschlussliste aufgenommen — eigener Befund, eigenes Papier.
Ihn hier mitzunehmen würde den Beitrag unprüfbar machen.

### Was der Lauf über die beiden Spuren sagt

Vier Befunde aus der einen Spur, sieben aus der anderen, **keine einzige
Überschneidung**. Die Trennung hat auch hier eine erkennbare Ursache: die eine
Spur las vor allem den PLAN gegen sich selbst (Schwellen, Beispiele,
Formulierungen), die andere den Plan gegen den KONTROLLFLUSS des Bestandes
(Lesereihenfolge, Transaktionsgrenzen, wer welchen Lock nimmt). Das sind zwei
Suchverfahren, nicht zwei Meinungen.
