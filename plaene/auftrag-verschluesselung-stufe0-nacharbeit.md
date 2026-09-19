# Auftrag: Nacharbeit Verschlüsselung Stufe 0+1 — fünf blockierende Befunde

Repo `/home/user/gymdocu`, **weiter auf `claude/verschluesselung-stufe0`** (kein
neuer Zweig, der Beitrag ist noch nicht gemerged).

Quelle: zwei unabhängige Gegenlesungen plus eine eigene Messung des
Haupt-Agenten. **Drei der Befunde sind GEMESSEN, nicht gelesen** — die Messung
steht jeweils dabei. Zeilennummern sind Fundorte vom 17.09.2026; vor dem Bauen
neu messen.

---

## BLOCKIEREND

### B1 — Der Test löscht bei gebrochener Umleitung ECHTE Dateien

**GEMESSEN vom Haupt-Agenten**, nicht vermutet. Aufbau: in
`test_feature_verbandbuch_pdf_aufraeumen.js` die Zeile
`env: { ...process.env, PDF_ROOT: pdfRoot },` durch `env: { ...process.env },`
ersetzt (simuliert einen späteren Umbau, der die Umleitung verliert), ein
Attrappen-„Produktions"-PDF_ROOT mit einer Datei angelegt, Test gestartet.

Ergebnis: Die Zusicherungen davor fielen (`✗ FAIL: Exit ungleich 0`,
`✗ FAIL: Meldet ABBRUCH auf stderr`) — **und der scharfe Lauf `--wirklich`
lief trotzdem und löschte die Datei im echten Verzeichnis.** Nachher: `total 0`.

Ursache ist die Hausregel wörtlich: `ok()` erhöht nur einen Zähler. **Eine
Zusicherung, die nur zählt, hält keinen Schreibweg auf.** Dieselbe Suite läuft
auf dem Live-Server als Deploy-Gate; dort wären es echte Art.-9-PDFs.

**Zu bauen:** Vor dem `--wirklich`-Aufruf ein echtes TOR, kein Zähler. Der Test
bricht HART ab (`throw`), wenn der Probelauf davor nicht genau die Attrappe
gesehen hat — also wenn Exit, Ausgabe oder gefundene Menge nicht stimmen.
Erst wenn bewiesen ist, dass das Skript die Attrappe sieht, darf scharf
gelöscht werden.

Dieselbe Frage für JEDEN anderen Test dieses Beitrags einmal beantworten: gibt
es dort einen Schreib- oder Löschweg, der nach einer gefallenen Zusicherung
weiterläuft? Was du findest, gehört in den Bericht.

### B2 — Das Aufräumskript folgt einem Symlink und löscht ausserhalb von PDF_ROOT

**GEMESSEN vom Haupt-Agenten.** Aufbau: `<root>/101/Verbandbuch` als Symlink
auf ein Verzeichnis ausserhalb, dort eine PDF-Datei. Scharfer Lauf meldete
`1 gefunden (29 B), 1 gelöscht, 0 Fehler` — **die Datei ausserhalb von
PDF_ROOT war danach weg.**

`findeLoeschWurzel()` (`core/retention.js:91-95`) prüft nur den LEXIKALISCHEN
Pfad (`path.resolve` + `startsWith`), löst keine Symlinks auf; `path.relative`
ebenso wenig. Der Kopfkommentar des Skripts behauptet, es rühre nichts
ausserhalb an — **das ist widerlegt und der Kommentar gehört mitkorrigiert.**

**Zu bauen:** Verzeichnis-Symlinks im Scan ausdrücklich ablehnen (Studio-Ordner
UND `Verbandbuch`-Ordner) und die tatsächliche Wurzelzugehörigkeit absichern.
Den gemeinsamen Riegel NICHT durch eine zweite eigene Implementierung
ersetzen — ergänzen. Genau diese Attrappe wird zugesichert.

Prüfe dabei, ob `core/retention.js` selbst dieselbe Lücke hat. Wenn ja: **melde
es, baue es NICHT mit** — das ist ein eigener Beitrag mit eigener Prüfung.

### B3 — Der qpdf-Stub reicht unbekannte Programme an die ECHTE Ausführung durch

`test_feature_verbandbuch_pdf_fluechtig.js:55`:
`if (datei !== 'qpdf') return echterExecFile(datei, args, callback);`

Genau der Fehler, gegen den ein Deploy-Gate schützen soll — ein falscher
Programmaufruf aus dem Produktivcode — wird damit AUSGEFÜHRT statt abgewiesen.
Dazu schreibt der Stub ungeprüft an das vom Produktivcode übergebene Ziel
(`args[args.length - 1]`): eine falsche Pfadberechnung wird zu einem echten
Schreibzugriff an falscher Stelle.

Die Ausnahme in `test_feature_keine_systemeingriffe.js:575-584` begründet sich
wörtlich mit „kein echter Kindprozess". **Das trifft nicht zu — die Begründung
ist falsch und gehört mitkorrigiert**, nicht nur der Stub.

**Zu bauen:** Unbekannte Programme hart ablehnen (werfen, nicht durchreichen).
Zielpfad vor dem Schreiben prüfen: muss innerhalb des Test-Temp-Verzeichnisses
liegen. Danach die Begründung in der Ausnahmeliste auf das korrigieren, was
wirklich zutrifft.

### B4 — Bei fehlgeschlagener PDF-Erzeugung bleibt eine angefangene Datei liegen

`core/pdf-engine.js:117` öffnet `fs.createWriteStream(filePath)` und schreibt
den Kopf, BEVOR ein späterer Fehler (`:399`, `:407-408`, z. B. ENOSPC) die
Erzeugung ablehnen kann. Gelöscht wird dort nichts.

Folge in beiden Routen: das `await` wirft, `abs` ist noch `null`, der neue
Aufräumpfad bekommt `null` und tut nichts — **die angefangene Datei mit dem
Personennamen im Kopf bleibt dauerhaft liegen.** Die GET-Route
(`routes/verbandbuch-admin.js:504-505`) hat im äusseren `catch` überhaupt
keinen Aufräumpfad, die POST-Route hat ihn, er greift aber ins Leere.

Der Kommentar bei AUSGANG 3/3 behauptet ausdrücklich, bei fehlgeschlagener
Erzeugung sei noch keine Datei entstanden. **Das ist falsch und gehört
mitkorrigiert.**

Verschärfend: `core/retention.js` markiert die Regel jetzt
`dateiFehltErwartet` — eine so liegengebliebene Datei fällt also auch später
niemandem mehr auf.

**Zu bauen:** Den Zielpfad VOR dem Erzeugungsaufruf festlegen (die Engine kennt
`customFilename`, `core/pdf-engine.js:2363`) und im Fehlerpfad beider Routen
aufräumen. Zusicherung: ein Erzeuger-Fehlerfall, der ZUERST eine Datei anlegt
und erst danach wirft — sonst prüfst du einen Weg, den es so nicht gibt.

### B5 — Zwei gleichzeitige Anfragen löschen einander die Datei weg

Beide Routen erzeugen denselben festen Pfad
(`core/pdf-engine.js:2368`: `"Verbandbuch_Eintrag_" + e.id + ".pdf"`). Seit dem
unbedingten Löschen gilt: Anfrage A liefert aus und löscht, während Anfrage B
für denselben Eintrag die Datei erst noch öffnen will — B scheitert.

Beim geschützten Weg wird daraus eine FALSCHE Diagnose: der Benutzer liest
„Verschlüsselung fehlgeschlagen (qpdf nicht verfügbar?)", obwohl qpdf da ist.

**Vor dieser Änderung ging beides gut**, weil die Datei liegenblieb — das ist
also ein Rückschritt, den dieser Beitrag selbst einführt. Der Diff erkennt die
Klasse für die Temp-Kopie ausdrücklich an (eigener Zufallsname je Anfrage,
`:522-524`), zieht sie für das Original aber nicht.

**Zu bauen:** Ein eigener Originalname je Anfrage über den dritten Parameter
des Erzeugers. Der Dateiname im Download bleibt für den Benutzer unverändert.
Zusicherung: zwei über eine kontrollierte Barriere überlappende Anfragen auf
denselben Eintrag — beide müssen vollständig durchkommen.

---

## SOLLTE BEHOBEN WERDEN (in dieselbe Runde, alle klein)

- **S1** `core/retention.js:1050-1052`: `dateiFehltErwartet` deckelt nur den
  neuen Zähler; `fehlendGemeldet++` und die `console.warn` laufen weiter. Der
  erklärte Normalfall erscheint also weiterhin als Warnzeile, ebenso die
  Sammelmeldung (`:1093`). Auch vom Warnpfad ausnehmen — und für `pdf_archiv`
  und die Korrekturblatt-Queue ausdrücklich zusichern, dass die Warnungen dort
  BLEIBEN. Der Kommentar bei `:861-865` nennt nur Rückgabe und Server-Logzeile
  und ist damit unvollständig.
- **S2** `routes/health-intern.js:228`: `hatSchluessel()` bei JEDER Anfrage.
  **GEMESSEN vom Haupt-Agenten:** mit 64-Hex-Schlüssel 5 Aufrufe = 0 ms, mit
  einer Passphrase **5 Aufrufe = 222 ms** (≈44 ms je Aufruf, synchron, kein
  Cache — `core/secret-crypto.js:40-49`, scrypt N=16384). Der Endpunkt wird
  alle 5 Minuten gepollt und vom Deploy-Gate in einer Schleife. Einmal
  auswerten und merken, oder nur das Vorhandensein der Variablen prüfen —
  für ein Ja/Nein braucht es keine Schlüsselableitung.
- **S3** `test_feature_pdf_health.js`: beide Fälle injizieren `hatSchluessel`.
  Die PRODUKTIVE Verdrahtung (`routes/health-intern.js:181`) läuft in keiner
  Zusicherung. Ein Fall OHNE Injection, mit gesetzter bzw. leerer
  Umgebungsvariable, schliesst das.
- **S4** `test_feature_pdf_health.js:79`: die Zusicherung „kein
  Schlüsselmaterial" sucht nach dem VARIABLENNAMEN (`totp_enc_key`) — den gäbe
  auch eine Fassung nicht aus, die den Schlüssel selbst ausliefert. Sie kann
  nicht rot werden. Gegen den WERT prüfen.
- **S5** `ops/…-aufraeumen.js:101-103`: der `catch` um `readdirSync` behandelt
  JEDEN Fehler als „kein Ordner" — auch EACCES und EIO. Ein nicht gelesener
  Altbestand erscheint dann als sauberer Lauf mit null Fehlern. Nur den
  erwarteten Nichtvorhanden-Fall überspringen, alles andere zählen und melden.
  Den Lesefehler STUBBEN, nicht über `chmod` herstellen — wir laufen als root.
- **S6** `ops/…-aufraeumen.js:79`: geprüft wird nur, ob der AUFGELÖSTE Pfad
  existiert. Ist `PDF_ROOT` gar nicht gesetzt, nimmt `core/pdf-root.js:39` den
  Default `<repo>/pdf` — und bei `--wirklich` wird dort gelöscht. Zusätzlich
  verlangen, dass `process.env.PDF_ROOT` gesetzt und nicht leer ist. Dazu:
  wurde KEIN Studio-Ordner gefunden, ist das ein Abbruch, kein „0 gefunden,
  alles gut".
- **S7** `ops/…-aufraeumen.js`: es wird JEDE `*.pdf` in `<studio>/Verbandbuch/`
  gelöscht. Auf den dokumentierten Zweck einengen —
  `/^Verbandbuch_Eintrag_\d+\.pdf$/`, genau der Name, den
  `core/retention.js:322` auflöst.
- **S8** `ops/…-aufraeumen.js:146`: `hauptlauf()` ohne `.catch`. Ein Wurf endet
  als unbehandelte Ablehnung ohne Schlussmeldung — nach einem scharfen Lauf
  weiss dann niemand, wie weit er kam.
- **S9** `test_feature_verbandbuch_pdf_aufraeumen.js:56,63`: `/3 gefunden/`
  trifft auch „13 gefunden". Auf den vollen Wortlaut verankern oder die Zahl
  auslesen und gegen eine unabhängig hingeschriebene 3 halten.
- **S10** `test_feature_verbandbuch_pdf_fluechtig.js`: kein Riegel gegen das
  ECHTE PDF_ROOT. Das Geschwisterstück
  `test_feature_retention_verbandbuch_fluechtig.js:57-72` hat ihn (harter
  Abbruch vor jeder Löschung). Übernehmen — dieselbe Klasse wie B1.
- **S11** `test_feature_verbandbuch_pdf_fluechtig.js` Zusicherung 1: der Test
  rechnet den Pfad selbst aus, statt ihn an der Route zu verankern. Ist die
  Route irgendwann woanders, ist die Datei dort nie gewesen und „existiert
  nicht mehr" ist grün, ohne dass je eine Löschung beobachtet wurde. Vorher
  erzeugen und die Existenz zusichern (wie es Zusicherung 2b bereits tut).
- **S12** qpdf-Aufruf: geprüft werden nur zwei Argumentpositionen. Das erste
  Passwort durch `""` zu ersetzen bliebe unbemerkt. Die vollständige
  Argumentfolge zusichern.

---

## AUSDRÜCKLICH NICHT in dieser Runde

- **`findeLoeschWurzel` aus `core/retention.js` in ein eigenes kleines Modul
  herauslösen.** Ein Vorschlag aus der Gegenlesung, und er ist architektonisch
  richtig — der Import zieht heute die ganze Retention-Maschinerie samt
  `core/db.js` und Verbindungspool in zwei Verbraucher, die nur eine
  Pfadprüfung brauchen (daher das `db.pool.end()` im `finally`). Aber er fasst
  ein Kernmodul an, an dem mehrere Wächter hängen. Eigener Beitrag, eigene
  Prüfung. **Halte das als datierten offenen Punkt in
  `docs/offene-befunde-31-08-2026.md` fest**, statt es zu vergessen.
- Keine Feldverschlüsselung, keine anderen Dateien, nichts an
  `core/pdf-engine.js` ausser der Nutzung des vorhandenen `customFilename`.

## Abschluss

Zu jedem Befund eine Gegenprobe, die den BEHOBENEN Fall rot werden lässt —
ROT und GRÜN mit Zahlen, wörtlich. Bei B1, B2 und B5 genügt kein Codelesen:
diese drei sind gemessen worden und wollen gemessen zurückkommen.

`bash test/run.sh > /tmp/claude-0/suite-nacharbeit.log 2>&1; echo "SUITE_EXIT=$?"`,
Dateizahl-Ritual mit `diff` EXIT 0, `npm run lint` mit wörtlichem Ergebnis auch
bei Grün, Marker-Scan (Sollwert 6, alle in
`docs/offene-befunde-31-08-2026.md`), `git status` sauber.

Widersprich mir, wo deine Messung meinen Angaben widerspricht — das ist das
Wertvollste, was du liefern kannst.
