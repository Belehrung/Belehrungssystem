# Auftragspapier — Einmal-Freischaltung wird vor dem fehlbaren Schritt verbraucht

Repo: `/home/user/gymdocu`, neuer Zweig `claude/freischaltung-verbrauch-rueckgabe`
(von `master`, `6ee7b15`). Betroffen: `routes/belehrungen.js` plus eine neue
Testdatei.

Einordnung der Komplexität: **Standard-Executer.** Eine Produktivdatei, eine
klar umrissene Umstellung, Gegenproben ausgeschrieben.

## Der Befund — vom Haupt-Agenten SELBST nachgemessen

Der Sicherheits-Durchgang vom 18.09.2026 hat ihn gemeldet; die folgenden
Angaben sind nachgemessen, nicht übernommen.

`routes/belehrungen.js:826`:

    // Manuelle Freischaltung entfernen
    try { await db.run("DELETE FROM belehrung_freischaltung WHERE studio_id = $1 AND mitarbeiter_id=$2 AND belehrung_id=$3", [req.studioId, mid, bid]); } catch {}

Die manuelle Freischaltung ist ein EINMAL-Token: ein Admin fordert damit eine
Neuunterschrift an. Sie wird hier verbraucht — **ausserhalb jeder Transaktion
und BEVOR der fehlbare Teil läuft.** Danach kommen mehrere Wurfstellen:
`fsP.readFile`, `PDFDocument.load`, `throw new Error('PDF hat keine Seiten')`
und `pdfDoc.embedPng(Buffer.from(signatur…, 'base64'))`.

Der Fehlerpfad (Zeile 898) nimmt **nur** den Unterschriften-Eintrag zurück:

    await db.run("DELETE FROM unterschriften WHERE studio_id = $1 AND id = $2", [req.studioId, dbId]);

Die Freischaltung bleibt gelöscht. Folge: die Belehrungspflicht verschwindet
aus der Tablet-Liste UND aus dem Admin-Dashboard, **ohne dass eine Unterschrift
entstanden ist.**

**Drei Dinge, die der Bericht NICHT sagt und die ich beim Messen gefunden habe:**

1. **Der Kommentar unmittelbar darüber behauptet die Vollständigkeit der
   Rücknahme:** „(bei jedem Fehler davor wird der Eintrag geloescht -> kein
   Audit)". Er meint den Unterschriften-Eintrag, liest sich aber wie eine
   Zusage für den ganzen Vorgang. Das ist die Klasse „ein Kommentar, der mehr
   behauptet, als gemessen ist".
2. **Niemand liest den `rowCount`.** Ob überhaupt eine Freischaltung verbraucht
   wurde, wird nirgends festgestellt — und `catch {}` verschluckt zusätzlich
   ein Scheitern des DELETE selbst.
3. **Es gibt ein Vorbild im eigenen Bestand**, und es macht es richtig:
   `core/defekt_mailer.js:177-180` definiert `claimZurueck()` und ruft es bei
   Fehlschlag auf (`:186`, `:229-230`).

**Erreichbarkeit, nachgemessen:** `signatur` wird auf dem ganzen Weg NUR auf
Nicht-Leere geprüft (`routes/belehrungen.js:752`). Der Identitätsriegel greift
nur bei `tablet_sperre_aktiv === '1'`, und die Voreinstellung ist `'0'`
(`:767`, `getConfigStrict(..., '0')`). Ein angemeldeter Studio-Benutzer kann
also mit `signatur: "x"` je Aufruf eine Freischaltung verbrennen.

**Sperrreihenfolge, nachgemessen — wichtig für die Behebung:** ALLE vier
Schreibzugriffe auf `belehrung_freischaltung` im Repo laufen über blankes
`db.run`, also unter Autocommit (`routes/admin/mitarbeiter.js:856`,
`routes/belehrungen.js:826`, `:1964`, `:1979`). Keine Transaktion hält heute
Zeilensperren auf dieser Tabelle, und `auditAppend` nimmt den studioweiten
Advisory-Lock (`core/integritaet.js:65`). Ein Kreis entsteht durch die
Umstellung also NICHT — aber die Regel der CLAUDE.md verlangt trotzdem, den
Lock im neuen Weg ausdrücklich ZUERST zu nehmen, damit ein künftiger Gegenweg
ihn nicht aufreissen kann.

## Was zu bauen ist

### V1 — Den Verbrauch ans ENDE ziehen, statt ihn zu kompensieren

**Nicht** eine Rücknahme im Fehlerpfad nachrüsten, sondern das Fenster
schliessen: das DELETE wandert in die bestehende Transaktion am Ende
(`db.tx` beim Signatur-Hash und `auditAppend`), also NACH dem Gelingen des
PDF-Schritts.

Begründung, warum nicht der `claimZurueck()`-Weg: eine Kompensation muss die
gelöschte Zeile originalgetreu wiederherstellen (`grund`, `freigeschaltet_am`),
also vorher lesen — und sie kann selbst scheitern. Das Fenster ganz zu
entfernen ist stärker als es auszugleichen.

Dabei verbindlich:

* **Den Studio-Advisory-Lock ausdrücklich ZUERST nehmen**
  (`SELECT pg_advisory_xact_lock($1)` mit `req.studioId` als erste Anweisung
  der Transaktion), mit einem Kommentar daneben, der sagt WARUM (Advisory-Locks
  sind innerhalb derselben Transaktion wiedereintrittsfähig, der spätere Griff
  in `auditAppend` stört also nicht; und der gegenläufige Weg wird damit
  unmöglich, bevor es ihn gibt). Ohne die Begründung räumt es jemand als
  „doppelt" wieder weg.
* **Den `rowCount` LESEN** und als `freischaltung_verbraucht` in die
  Audit-Nutzlast schreiben. Das ist der nachgelagerte Nachweis: er darf nur
  behaupten, was zum Zeitpunkt des Schreibens gemessen war.
* **Kein `catch {}` mehr.** Scheitert das DELETE, scheitert die Transaktion —
  und der bestehende Fehlerpfad räumt den Unterschriften-Eintrag ab. Das ist
  richtig: eine Unterschrift, deren Freischaltung nicht verbraucht werden
  konnte, ist ein halber Zustand.
* **Den irreführenden Kommentar berichtigen**, der die Vollständigkeit der
  Rücknahme behauptet.

**Prüfe vor dem Umbau und melde es**: liest irgendetwas zwischen Zeile 826 und
dem Transaktionsblock `belehrung_freischaltung`? Wenn ja, ändert das die
Reihenfolge und muss im Bericht stehen.

### V2 — Ein Wächter, der die Klasse bewacht

Eine neue Testdatei `test_feature_freischaltung_verbrauch.js`, registriert in
`test/run.sh`. Sie muss mindestens zusichern:

1. **Erfolgsfall:** gültige PNG-Signatur → Unterschrift entsteht UND die
   Freischaltung ist weg. Beides gelesen, nicht gezählt.
2. **Fehlerfall (der eigentliche Beitrag):** `signatur: "x"` (nicht-leer, aber
   kein gültiges PNG) → Aufruf schlägt fehl, KEINE Unterschrift bleibt übrig,
   **und die Freischaltung ist NOCH DA**. Mandantengebunden gelesen.
3. **Der Audit-Eintrag trägt `freischaltung_verbraucht` mit dem GEMESSENEN
   Wert**, nicht mit einer Konstanten.
4. **Mindestprüfzahl**, von Hand aus dem Quelltext hergeleitet, mit
   Abschnittsnamen statt Zeilennummern.

**Fixturen:** Studio-, Mitarbeiter- und Belehrungs-IDs müssen PAARWEISE
VERSCHIEDEN sein — auf frischer Datenbank trägt sonst jede Tabelle dieselbe
Zahl und eine Vertauschung wäre unsichtbar. `test_feature_mandantengrenze_fremd_ids.js`
hat dafür seit gestern ein Muster (`vorschiebeSequenz`, `vorschiebeSequenzBisUeber`,
F6-1); **lies es und übernimm den Ansatz, statt ihn neu zu erfinden.**

**Kein echtes Dateisystem, keine echten Dienste.** Die Suite ist auf dem
Live-Server Deploy-Gate. Eine echte PDF-Datei wird über eine Testfixtur im
Upload-Verzeichnis gebraucht — halte dich an das, was bestehende Tests dafür
tun, und melde, wenn das nicht geht.

## Gegenproben — verbindlich, beide Richtungen, je einzeln

Verfahren: unabhängige `cp`-Sicherung, Mutationsskript mit **Zielpfad als
Argument**, Fundstellenzählung mit Abbruch bei ungleich 1,
`GEGENPROBE-DEFEKT`-Marker, `node --check`, Lauf ohne Pipe, Rücknahme aus der
Kopie mit `diff` EXIT 0. **Nie `git checkout`/`git stash`**, Rücknahme nie mit
einem Lauf verketten.

**K1 — der Kernbeleg.** Das DELETE wieder an die ALTE Stelle setzen (vor den
PDF-Schritt, mit `catch {}`). Erwartung: die Zusicherung aus V2-Punkt 2 MUSS
fallen — die Freischaltung ist dann nach dem Fehlschlag weg. Fällt sie nicht,
ist der Wächter wertlos: melden, nicht nachbessern.

**K2 — der Erfolgsfall bleibt bewacht.** Das DELETE ganz entfernen. Erwartung:
die Zusicherung aus V2-Punkt 1 fällt (Freischaltung bleibt trotz Erfolg).

**K3 — der Nachweis ist echt.** `freischaltung_verbraucht` im Audit auf eine
feste `1` setzen statt den gemessenen `rowCount`. Erwartung: V2-Punkt 3 fällt.
Baue den Test so, dass das möglich ist — also mit einem Fall, in dem der
gemessene Wert NICHT 1 ist (z.B. ein zweiter Aufruf ohne Freischaltung).

**K4 — Positivkontrolle gegen eine leere Prüfung.** Läuft der Fehlerfall aus
V2-Punkt 2 überhaupt bis zum DELETE? Baue eine Messung ein, die zeigt, dass der
Aufruf den PDF-Schritt wirklich ERREICHT hat (und nicht schon vorher
ausgestiegen ist) — sonst ist „Freischaltung noch da" nicht von „gar nicht
angekommen" zu unterscheiden. Das ist die Klasse „eine Gegenprobe, die den
geprüften Code gar nicht erreicht, ist keine".

## Abschluss

Volle Suite als `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`
(kein Pipe, kein äusseres `flock`), `npm run lint` wörtlich auch bei Grün,
Dateizahl-Ritual mit dem BREITEN Sieb, Marker-Scan mit `--exclude-dir`,
`git status --short`.

**Die Sollzahl des Dateizahl-Rituals steigt um 1**, weil eine Testdatei
dazukommt — prüfe das und nenne beide Zahlen.

**Commit-und-Push nach JEDEM Punkt.** Kein PR.

Melde am Ende ausdrücklich, was NICHT geklappt hat, und melde Zahlen so, wie
sie im Log stehen.
