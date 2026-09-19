# Befund: unwiderrufliche Dateiaktion auf der falschen Seite eines fehlbaren Schritts

Gemessen 19.09.2026 am Bestand (`/home/user/gymdocu`, master `4c4b729`).
Zwei Fundstellen, dieselbe Klasse, entgegengesetzte Richtung.

**Anlass:** einer der vier zurückgestellten Befunde aus PR #460. Meine Notiz
dazu nannte drei weitere Stellen der „Einmal-Zustand vor fehlbarem Schritt
verbraucht"-Klasse (`mitarbeiter.js`, Einweisung, Ersthelfer). **Nachgemessen
stimmt das nicht:** `belehrung_freischaltung` wird im ganzen Bestand an genau
ZWEI Stellen verbraucht (`routes/admin/mitarbeiter.js:856`,
`routes/belehrungen.js:963`), und die zweite ist die bereits behobene. Die
Notiz war eine Vermutung, kein Befund. Was beim Nachmessen stattdessen
auffiel, steht hier.

## F1 — `/neue-version/:id` löscht im Fehlerzweig die Datei, auf die die schon committete Zeile zeigt

`routes/belehrungen.js:2159-2186`. Reihenfolge, wie sie dasteht:

    const alteDatei = bel.dateiname;
    await db.run(`UPDATE belehrungen SET dateiname = $1, datei_vorhanden = 1, …`,
                 [req.file.filename, req.studioId, bel.id]);   // (1) COMMITTET
    const n = await schalteAlleFrei(req.studioId, bel.id, grund);  // (2) kann werfen
    await auditAppend(req.studioId, 'belehrung_neue_version', …);  // (3) kann werfen
    …
    } catch (e) {
        if (req.file) fs.unlink(req.file.path, () => {});          // (4) LÖSCHT
    }

**Gemessene Prämissen:**

* **(1) ist committet.** `db.run` benutzt den POOL, nicht eine
  Transaktionsverbindung (`core/db.js:421-432`, steht so auch in der
  CLAUDE.md) — jeder Aufruf ist seine eigene, abgeschlossene Transaktion.
* **(2) kann werfen.** `schalteAlleFrei()` ist ein blankes `db.run` mit
  INSERT … ON CONFLICT (`routes/belehrungen.js`, Funktionsrumpf) — jeder
  Datenbankfehler schlägt durch.
* **(3) kann werfen, und zwar mit einer im Repo bereits dokumentierten
  Ursache.** `auditAppend()` nimmt einen studioweiten Advisory-Lock
  (`core/integritaet.js:65`), und die CLAUDE.md führt einen BESTEHENDEN,
  nicht behobenen Verklemmungs-Kreis auf, der genau diesen Lock enthält.
  Ein `deadlock detected` ist hier kein Gedankenexperiment.
* **(4) löscht genau die Datei aus (1).** multer `diskStorage` setzt
  `req.file.path` auf den vollen Pfad und `req.file.filename` auf dessen
  Basisnamen — es ist dieselbe Datei.

**Folge:** Wirft (2) oder (3), steht in der Datenbank
`datei_vorhanden = 1, dateiname = <neue Datei>` — und die neue Datei ist
gelöscht. Die Belehrung ist damit dauerhaft nicht mehr auslieferbar, und
`alteDatei` ist nur noch eine lokale Variable in einem abgestürzten Request:
die alte Datei liegt zwar noch auf der Platte, aber **nichts zeigt mehr auf
sie.** Der Benutzer sieht eine Fehlerseite und hat danach eine kaputte
Belehrung statt der alten, funktionierenden.

**Was es NICHT ist:** kein Mandantenleck, keine stille Falschmeldung — der
Lauf endet mit HTTP 500. Der Schaden ist Datenverlust im Erfolgspfad-Zustand,
nicht eine falsche Zusicherung.

## F2 — `/loeschen/:id` löscht die Datei VOR dem UPDATE

`routes/belehrungen.js:2284-2306`. Dieselbe Klasse, andere Richtung:

    if (andere === 0) { … fs.unlinkSync(fp) … }                    // (1) LÖSCHT
    await db.run("UPDATE belehrungen SET datei_vorhanden = 0 …");   // (2) kann werfen

Wirft (2), sagt die Datenbank weiterhin `datei_vorhanden = 1`, während die
Datei weg ist. Der Eintrag bleibt als „vorhanden" gelistet und ist nicht
abrufbar. Gegenüber F1 ist der Schaden kleiner (es ist ohnehin eine
Löschabsicht), die Klasse aber dieselbe.

## Was das für unsere eigene Regel heißt

Die CLAUDE.md sagt heute: *„`unlinkSync()` lässt sich ohnehin nie
zurückrollen — Dateilöschungen gehören NACH den Commit."*

**F1 erfüllt diesen Satz wörtlich und ist trotzdem falsch.** Die Löschung
steht nach dem Commit — sie löscht nur das Falsche. Der Satz ist also zu
schwach und gehört geschärft:

> Eine unwiderrufliche Dateiaktion gehört hinter den LETZTEN fehlbaren
> Schritt, und sie darf nur eine Datei treffen, auf die zu diesem Zeitpunkt
> **nichts mehr zeigt**. Wer im Fehlerzweig aufräumt, prüft zuerst, ob ein
> bereits committeter Zustand inzwischen auf die Datei verweist.

Das ist derselbe Gedanke wie beim Signatur-Beitrag, nur eine Ebene höher:
dort war der Einmal-Zustand die Freischaltung, hier ist er die Datei.

## Noch NICHT gemessen

* Ob ein bestehender Test einen dieser Fehlerzweige überhaupt betritt. Vier
  Testdateien nennen `neue-version`
  (`test_feature_belehrung_version.js`, `…multer_2_4_bestandsschutz.js`,
  `…signatur_verbrauch.js`, `…upload_fehlerbehandlung.js`), eine nennt den
  Löschweg (`test_feature_audit_batch3.js`) — ob eine davon einen WURF nach
  dem UPDATE erzwingt, ist offen und vor dem Bau zu messen.
* **Die Klasse ist viel grösser als diese zwei Stellen — gemessen, aber noch
  nicht beurteilt.**

  Zuerst eine Berichtigung an mir selbst: ich hatte oben „17
  `unlinkSync`-Fundstellen" geschrieben. Das war eine Zahl aus einer Suche, die
  nur die SYNCHRONE Form kannte. **Tatsächlich sind es 44 echte
  `unlink`-Aufrufe** in `routes/` und `core/` — `/neue-version/:id` selbst
  benutzt die asynchrone Form und wäre durch mein eigenes Muster gefallen.
  Dieselbe Krankheit wie heute schon viermal: eine Zahl behauptet, statt sie zu
  messen.

  Von den 44 haben **27** einen Datenbankaufruf innerhalb von zehn Zeilen vor
  oder nach der Löschung:

      routes/belehrungen.js   13 Stellen (u.a. 1506-1743, also Einweisung und Ersthelfer)
      routes/lageplan.js       2
      routes/wartung.js        2
      routes/sichtpruefung.js  2
      core/                    4 (foto-reaper, pdf-loeschung, retention)
      routes/admin/geraete.js  1

  **Diese 27 sind FUNDORTE, keine Befunde.** Der Filter misst NÄHE, nicht
  KONTROLLFLUSS — und die CLAUDE.md sagt ausdrücklich, dass Textsuche für die
  Frage „wird X geprüft, bevor Y passiert?" grundsätzlich nicht taugt. Ob an
  einer Stelle wirklich ein committeter Zustand auf die gelöschte Datei zeigt,
  entscheidet sich nur beim Lesen. Bei F1 und F2 habe ich gelesen; bei den
  übrigen 25 nicht.

  **Vor jedem „die Klasse ist zu": jede einzeln messen.** Diese Klasse ist im
  Repo schon fünfmal eine Ebene tiefer weitergelebt, und jedes Mal sah sie
  vorher geschlossen aus.

## Status

**Fundstelle und Messung, KEIN Bauauftrag.** Der Bauauftrag entsteht erst,
wenn die offenen Punkte oben gemessen sind und entschieden ist, ob F1 und F2
in einen Beitrag gehören oder in zwei.
