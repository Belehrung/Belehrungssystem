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
fünf Dateien.

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

Umsetzung genau wie in M6/M7 gemessen:

    sharp(buf, { limitInputPixels: 16e6, sequentialRead: true })
        .flatten({ background: '#ffffff' })
        .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .raw().toBuffer({ resolveWithObject: true })

danach `for (i = 0; i < data.length; i += info.channels) if (data[i] < 250) n++`.
`breite`/`hoehe` kommen aus `metadata()` (liest nur den Kopf, 0 ms — gemessen),
`geprueftBreite`/`geprueftHoehe` aus `info`. Das Präfix
`data:image/png;base64,` wird mit demselben Ausdruck abgestreift, den die Route
heute benutzt.

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

1. **Früh lesen** (bei den anderen Nachschlägen, vor dem INSERT):

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
   (`core/integritaet.js:65`) stört also nicht — und ein gegenläufiger
   Schreibweg wird damit unmöglich, bevor es ihn gibt.
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
2. Das inkte PNG → wirft nicht, `tintenPixel` ist der GEMESSENE Wert (nicht
   „> 0" — eine Schwelle über eine Zahl ist keine Zusicherung über eine Menge).
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
   gemessenen Werten. Baue einen Fall, in dem `freischaltung_verbraucht`
   NICHT 1 ist (Unterschrift ohne vorhandene Freischaltung), sonst ist eine
   fest verdrahtete `1` nicht von der Messung zu unterscheiden.
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

**K7 — die Tintenschwelle ist bewacht.** Im Modul `< 250` → `< 256`. Erwartung:
Zusicherung 1 fällt (alles gilt als unterschrieben). Gegenrichtung: `< 1`,
Erwartung: Zusicherung 2 fällt.

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
