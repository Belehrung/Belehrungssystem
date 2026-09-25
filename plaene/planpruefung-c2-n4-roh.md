# Planprüfung C2 Nacharbeit 4 — Rohberichte (25.09.2026)

Sparmodus: noch NICHT selbst nachgemessen; vor Fassung 2 (nach dem Reset) jeden Befund am Code nachsehen. Spuren: DeepSeek mit Repo-Lesezugriff, DeepSeek-Einzelaufruf (Bündel: Papier, error-tracker, Ernte, Test ganz).

## Spur 1 (Repo-Lesezugriff)

## Hinweis zur Grundlage

`plaene/auftrag-c2-nacharbeit4.md` und `plaene/diffpruefung-c2.md` sind im Arbeitsbaum nicht vorhanden (`lies` meldet „Datei nicht gefunden“; sie sind offenbar nicht eingecheckt). Ich habe deshalb den Auftragstext aus dem Prompt als maßgeblich genommen und die tragenden Codestellen im Repo nachgesehen.

Gelesen/geprüft wurden u. a.: `core/error-tracker.js` (vollständig), `ops/gymdocu-pdf-reste-ernte.js` (vollständig), `test_feature_error_tracking.js` (vollständig), `test_feature_pdf_reste_ernte.js` (relevanter Teil), `server.js:1755-1800`, `generateMonthlyPDFs.js:229-269,459`, `regenerierePdfMonat.js` (vollständig), `core/pdf-engine.js:136-140,329-356,484-560,2101-2125`, `core/datum.js:60-262`.

---

## Frage 1 — Neuer Zustand und Verlust-/Fehlerrisiken

**Neuer Zustand:** ein `unref()`-Zeitgeber je studioloser Fehlergruppe mit gesammelten Studios; am Fensterende genau eine Folgemeldung; ein `beforeExit`-Flush für CLI-Läufe; `melde()`-Rückgabe `telegram`; Ernte läuft nach Lesefehlern weiter, zählt sie je Verzeichnis und meldet am Laufende Anomalien/Abbrüche.

**(a) Verlust / Verspätung / falsches Studio:**

- **Verlust bei pm2-Reload und bei `process.exit()`-Wegen bleibt bestehen.** `beforeExit` feuert weder bei Signalen (pm2-Reload) noch bei `process.exit()`. Der Auftrag installiert keinen `SIGINT`/`SIGTERM`-Handler und benennt die `process.exit()`-Wege nicht konkret. Zwei Wege, die sammeln können:
  - `regenerierePdfMonat.js:59` — `process.exit(fehler ? 1 : 0);` nach `generateAllMonthlyPDFs()`, das in `generateMonthlyPDFs.js:266` `melde(e, { studioId }, …)` ruft.
  - `core/error-tracker.js:437` — `setTimeout(() => process.exit(1), 1500);` im `uncaughtException`-Handler; der unmittelbar davor liegende `melde()`-Aufruf kann sammeln.
  
  Damit gehen die bereits gesammelten Studios (alle außer dem auslösenden) verloren — genau die Klasse, die auf `a1a41d7` noch als eigener Ping ankam. **Blockierend.**

- **Verspätung:** gewollt höchstens ein Fenster; mehr als ein Fenster nur, wenn der Zeitgeber durch pm2-Reload/`process.exit`/fehlendes Timer-Cleanup nie feuert (s. o.).

- **Falsches Studio:** Der Papieransatz behebt den aktuellen Fensterwechsel-Fehler (`core/error-tracker.js:337-341` nennt das vorige statt des auslösenden Studios), sofern das Fenster beim Start der Folgemeldung atomar geschlossen und das auslösende Studio des neuen Fensters geführt wird. Die Race „`melde()` während der Folgemeldung“ ist aber nicht spezifiziert (Frage 2).

**(b) Prozess-Ende / Speicher / Zeitgeber:**

- `unref()` verhindert, dass der Zeitgeber allein einen CLI-Prozess am Leben hält. Der `beforeExit`-Flush kann den Prozess bis zum Telegram-Timeout (`AbortSignal.timeout(15000)`, `core/error-tracker.js:76`) aufhalten.
- Im Webprozess akkumulieren bei sehr vielen verschiedenen Signaturen bis zum jeweiligen Fensterende ein Zeitgeber + Set **je Gruppe**. Das ist durch `DROSSEL_MS` begrenzt, aber unbegrenzt viele Gruppen → unbegrenzt viele Timer. Keine Obergrenze im Papier. **Anmerkung.**
- `_reset()` löscht bisher nur die Maps (`core/error-tracker.js:454`); das Papier verlangt nicht, laufende Zeitgeber zu canceln → Testverschmutzung (Frage 2).

**(c) Ernte:**

- Das Papier macht die Ernte sicherer (Tiefe 3 bleibt; `.tmp-*` unter `_quarantaene/` wird Anomalie; Weiterlaufen).
- **Lücke:** `relTeile.length >= 4` ist nicht an „Studio ist Ziffern-Ordner“ (C2R4-12) gekoppelt. Ein Pfad `_quarantaene/foo/bar/datei.txt` (Nicht-Ziffern-Studio, Tiefe 4) würde als Quarantäne-Kandidat gelten und nach 30 Tagen gelöscht, obwohl „NUR das Schema `<Studio>/<Typ>/<Datei>`“ gelten soll. **Sollte behoben werden** (unwiderrufliches Löschen).
- **Still liegen lassen:** Anomalien werden laut Papier gemeldet, aber die Zahlen/Beispielpfade kommen über `melde()` nicht auf dem Telegram-Text an (s. Frage 5.1). Der Betreiber sähe nur eine Signatur ohne Zahlen.

**(d) Tests:** Das Papier verlangt zählende fetch-Attrappe und injizierte Zeit/Zeitgeber; kein echtes Warten, keine echten Dienste. Das ist konsistent. Kein Befund.

---

## Frage 2 — Grenzfälle

1. **pm2-Reload mitten im Fenster:** Gesammelte Studios gehen verloren. `beforeExit` greift bei Signalen nicht; ein Signal-Handler ist im Papier nicht vorgesehen. Nur die Sofortmeldung (auslösendes Studio) ist raus, die Folgemeldung entfällt. **Blockierend für den Leitgedanken.**
2. **`process.exit()` in einem Weg, der gesammelt hat:** Betroffen sind `regenerierePdfMonat.js:59` und der `uncaughtException`-Weg `core/error-tracker.js:437`. Das Papier sagt nur „benennen … dort vorher leeren“, benennt aber selbst keinen dieser Wege. Der Ausführende kann sie übersehen.
3. **`melde()` während der Folgemeldung:** Nicht spezifiziert. Die Implementierung muss die Gruppe **vor** dem `await` der Folgemeldung schließen und ein neues Fenster öffnen; sonst wird ein in dieser Zeit eintreffender Fehler in die laufende, bereits versandte Folgemeldung einsortiert oder geht verloren/doppelt.
4. **Zeitgeber feuert nach `_reset()` im Test:** `_reset()` löscht nur `state` und `telegramSammelState` (`core/error-tracker.js:454`). Laufende Zeitgeber werden nicht cancelt; ein später feuernder Timer würde im Folgetest eine unerwartete Telegram-Sendung auslösen. Das Papier muss das Canceln der Zeitgeber in `_reset()` fordern.
5. **Sehr viele verschiedene Signaturen:** Je Gruppe ein eigener Zeitgeber; bei vielen Gruppen entstehen viele Timer + Sets im Webprozess. `unref()` verhindert nur das Offenhalten des Prozesses, nicht die Akkumulation bis zum Fensterende.

---

## Frage 3 — Pflichttests, die trotz fehlendem Schutz grün sein können

1. **Auftrag §1, Pflichttest (c): „Route 100× in 30 min → Zähler im Text“.** Zu schwach: Es ist weder festgelegt, *welcher* Zähler (der Unterdrückungszähler der ersten Stufe, C2R4-4) noch *welcher Literalwert* erscheinen muss. Ein Test, der nur prüft, dass irgendeine Zahl oder „unterdrückt“ im Text steht, bleibt grün, wenn der geforderte Zähler fehlt. **Sollte behoben werden.**
2. **Auftrag §1, Pflichttest (e): „Rückgabewert“.** Es fehlen erzwungene Zustände. Ein Test, der nur prüft, dass `telegram` einen der drei Strings enthält, bleibt grün, wenn `melde()` immer `'gesendet'` meldet — genau C2R4-14. Die „Gegenprobe je Fall“ nennt nur (a) und (b), nicht (e). **Sollte behoben werden.**
3. **Auftrag §3, Ernte-Pflichttests:** „abbruch.js-Fall … eine Meldung“, „bleiben und werden gemeldet“, „Wurzel-Symlink → Meldung“ prüfen nur Anzahl/Existenz von `melde()`-Aufrufen, nicht den Inhalt. Da `melde()`/`baueSammelText()` an Telegram **keine** `err.message` sendet (`core/error-tracker.js:378-392`), können diese Tests grün sein, obwohl die geforderten Zahlen und bis zu drei Beispielpfade nie auf dem Telegram-Text ankommen. **Sollte behoben werden.**
4. **Auftrag §3, Pflichttests zu Tiefe 3/`.tmp-x`:** Sie decken Tiefe 2 und 3 ab, aber nicht Tiefe 4 mit Nicht-Ziffern-Studio (`_quarantaene/foo/bar/datei.txt`). Mit `relTeile.length >= 4` würde dieser Pfad gelöscht; der Test bleibt grün, der Schutz „NUR Schema“ fehlt. **Sollte behoben werden.**

---

## Frage 4 — Was wird gegenüber 32822d9 bzw. a1a41d7 schlechter?

- **Gegenüber `a1a41d7`:** Neu ist die Verzögerung der Nicht-Auslöser-Studios um bis zu ein Fenster (im Leitgedanken akzeptiert). Neu und schlechter ist der **Verlustweg** pm2-Reload/`process.exit()` ohne Flush; auf `a1a41d7` kam jeder Fehler sofort als eigener Ping an.
- **Gegenüber `32822d9`:**
  - Die geplante Ernte-Anomalie-Meldung „mit den Zahlen und bis zu drei Beispielpfaden“ wird über `melde()` nicht auf dem Telegram-Text ankommen, ohne dass man die DSGVO-Regel (`core/error-tracker.js:350-359`) bricht. Entweder unsichtbare Zahlen oder ein Datenschutz-Rückschritt.
  - Die Formulierung „NUR das Schema … (also `relTeile.length >= 4`)“ kollidiert mit dem bestehenden Test `test_feature_pdf_reste_ernte.js:141`, der Tiefe 5 (`_quarantaene/5/Wartung/sicherung/wichtig.pdf`) ausdrücklich als zu ernten erwartet. Ohne Klärung wird entweder der Alt-Test rot oder die eigene Anweisung verletzt.
  - `ernteInProcess` soll den Exit-Code nicht mehr still zurücksetzen; im Webprozess bliebe `process.exitCode` nach einem Fehlerlauf dauerhaft `1` (harmlos, solange der Prozess lebt, aber ein neuer Zustand).
  - Mehr Telegram-Pings im scharfen Erntelauf sind gewollt; sie sind aber inhaltsarm, solange Punkt Frage 5.1 nicht gelöst ist.

---

## Frage 5 — Mehrdeutige / widersprüchliche Anweisungen

1. **§3, C2R4-7:** „geht EIN `melde()` mit den Zahlen und bis zu drei Beispielpfaden raus“ widerspricht `core/error-tracker.js:378-392` (Telegram-Text enthält nur Signatur/Studio/Quelle, keine `err.message`) und `core/error-tracker.js:350-359` (DSGVO-by-design: kein Freitext an Telegram). **Blockierend**, weil der Leitgedanke „stille Fehler sichtbar machen“ sonst für die Ernte-Anomalien nicht erreicht wird.
2. **§3, C2R4-8:** „gilt NUR das Schema `<Studio>/<Typ>/<Datei>` (also `relTeile.length >= 4`)“. „NUR“ und `>= 4` sind nicht äquivalent; Tiefe 5 und Nicht-Ziffern-Studios erfüllen `>= 4`, aber nicht das Schema. Widerspricht außerdem dem bestehenden Kommentar `ops/gymdocu-pdf-reste-ernte.js:225-227` („tiefer verschachtelt bleibt … dem STUDIO zugeordnet“) und dem Test `test_feature_pdf_reste_ernte.js:141`. **Blockierend** (unwiderrufliches Löschen).
3. **§1, Prozessende:** „beforeExit, einmalig, awaitet die Sendungen“ ist technisch unscharf — `beforeExit`-Handler sind nicht await-bar, und `beforeExit` feuert weder bei `process.exit()` noch bei pm2-Signalen. Die konkreten Wege (`regenerierePdfMonat.js:59`, `core/error-tracker.js:437`) sind nicht benannt. **Sollte behoben werden.**
4. **§3, C2R4-12 vs. C2R4-8:** „Studio nur aus einem Ziffern-Ordner; sonst ‚ohne Studio‘“ ist nicht mit der Löschentscheidung (`relTeile.length >= 4`) verknüpft; unklar, ob die Ziffernprüfung auch das Löschen verhindern soll. **Sollte behoben werden.**
5. **§2:** „Gegenproben: `err.message` bzw. roher `originalUrl` im Sammeltext → ROT mit Zahl.“ — „ROT mit Zahl“ ist mehrdeutig (welche Zahl? Anzahl abgefangener Sendungen, Anzahl Studios?). **Anmerkung.**
6. **§1, Folgemeldung „seit HH:MM (Europe/Berlin)“:** Die Quelle der Uhrzeit wird nicht vorgeschrieben. Hier sollte `Intl`/`core/datum.js` (Europe/Berlin) bindend genannt werden, sonst entsteht die bekannte `toISOString()`-UTC-Falle. **Anmerkung.**

---

## Zusatzprüfung 1 — Zusicherungen, die nicht fehlschlagen können

Prüfgegenstand: `test_feature_error_tracking.js`.

**Klarer Befund: `test_feature_error_tracking.js:285-286`**
```
ok('Netz-Attrappe wurde von mindestens den zwei bekannten sendenden melde()-Aufrufen (mA, m1) wirklich getroffen',
    netzZaehler.blockiert >= 2, `blockiert=${netzZaehler.blockiert}`);
```
Der Sollwert `>= 2` ist ein globaler Mindestwert ohne Delta-Messung. `netzZaehler.blockiert` ist zu diesem Zeitpunkt bereits durch frühere sendende Aufrufe gefüllt (mA Zeile 202/203, die 6-Studios-Schleife Zeile 262, der andere Fehler Zeile 266, m1 Zeile 272). Die Zusicherung bleibt grün, auch wenn genau die benannten Aufrufe `mA` und `m1` nie senden. Es gibt **keine einzelne** Produktionszeile, deren Mutation genau diese Zusicherung fallen lässt, ohne dass andere Zusicherungen ebenfalls fallen; der Vorzustand erzwingt das Ergebnis. **Sollte behoben werden** (Delta um die benannten Aufrufe messen oder exakte Zählerstände je Aufruf).

Die übrigen zentralen Zusicherungen sind dagegen mit Literalen bzw. Delta-Messungen sauber:
- `:220-221` — „nur das erste sendet“ fällt durch Mutation von `core/error-tracker.js:344` (`senden:false` → `senden:true`).
- `:230-232` — „Rollover nennt alle 50“ fällt durch Mutation von `core/error-tracker.js:341` (Rückgabe der vorigen Liste → falsche Liste).
- `:263-264` — „6 Studios → genau 1 Telegram-Versuch“ fällt durch Entfernen/Ändern von `core/error-tracker.js:421` (`if (t.senden) telegram(…)`).
- `:233-234` — `/50 Studios/` ist ein von Hand eingetragenes Literal; kein Zirkelschluss, da `rollover.studios` nicht aus derselben Schleife wie der Sollwert gefüllt wird.
- `:396-397` — Handler-Idempotenz nutzt relative Sollwerte; fällt bei Doppelregistrierung.

Keine Zusicherung bezieht ihren Sollwert aus derselben Schleife, die sie prüft.

---

## Zusatzprüfung 2 — Zeitzonen

Gesucht wurde die Kombination „lokal gebautes `Date` → `toISOString()`“ (`new Date(j,m,t)`, `setDate`, `setMonth`), nicht `toISOString` allein.

- Der auffällige Treffer `regenerierePdfMonat.js:28` (`new Date(Date.UTC(j, m, 0)).toISOString().slice(0, 10)`) ist **unkritisch**, weil er auf `Date.UTC` basiert und zonenneutral den Monatsletzten berechnet.
- Im Auftragspapier selbst wird keine neue Datumsarithmetik mit lokalen Werten eingeführt.
- Einzige neue Datumsformatierung ist die Folgemeldungs-Uhrzeit „HH:MM (Europe/Berlin)“; die Quelle ist nicht vorgeschrieben (s. Frage 5.6, Anmerkung).

**Kein blockierender Zeitzonenbefund.**

---

## Zusatzprüfung 3 — Fehlerbehandlung

- Das Papier verlangt für die Ernte das Richtige: Lesefehler je Verzeichnis zählen und weiterlaufen; `server.js` wertet `abgebrochen` aus wie `fehler`; `ernteInProcess` setzt den Exit-Code nicht still zurück.
- Aktuell wirft `for await` in `durchlaufeDateien()` bei Fehlern während der Iteration (`ops/gymdocu-pdf-reste-ernte.js:111`) und reißt den ganzen Lauf ab; das Papier behebt genau das.
- **Anmerkung:** Der neue Zeitgeber-/Folgemeldungsweg braucht im Timer-Callback eine eigene Fehlerbehandlung (fangen/loggen). `telegram()` selbst fängt Fehler (`core/error-tracker.js:79`), aber ein werfender Callback (z. B. bei kaputtem Zustand) würde im Webprozess als `uncaughtException` enden. Das Papier schweigt dazu.

**Kein DB-Fehler-Befund im Papier.**

---

## Zusatzprüfung 4 — SQL

- Das Auftragspapier enthält **keine SQL-/Migrationsanteile**. Es werden keine neuen Spalten, Tabellen oder Abfragen eingeführt; die Ernte nutzt die DB nur für `db.pool.end()` (`ops/gymdocu-pdf-reste-ernte.js:309-311`).
- Daher gibt es keine `studio_id`-Bezüge, keine Idempotenz- oder Schema-Passung zu prüfen. **Nichts gefunden.**

---

## Zusammengefasste Befunde

| Nr | Fundstelle | Betroffene Zeichenkette | Schwere |
|---|---|---|---|
| 1 | Auftrag §1 Prozessende; `regenerierePdfMonat.js:59`, `core/error-tracker.js:437` | „(beforeExit, einmalig, awaitet die Sendungen)“ | blockierend |
| 2 | Auftrag §3 C2R4-7; `core/error-tracker.js:378-392` | „mit den Zahlen und bis zu drei Beispielpfaden raus“ | blockierend |
| 3 | Auftrag §3 C2R4-8; `test_feature_pdf_reste_ernte.js:141` | „gilt NUR das Schema … (also `relTeile.length >= 4`)“ | blockierend |
| 4 | Auftrag §1 Pflichttest (c) | „Zähler im Text“ | sollte behoben werden |
| 5 | Auftrag §1 Pflichttest (e) | „Rückgabewert“ | sollte behoben werden |
| 6 | Auftrag §3 Pflichttests Ernte | „eine Meldung“ / „werden gemeldet“ | sollte behoben werden |
| 7 | Auftrag §3 C2R4-12 vs. C2R4-8 | „Studio nur aus einem Ziffern-Ordner“ | sollte behoben werden |
| 8 | Auftrag §1; `core/error-tracker.js:454` | fehlendes Timer-Cancel in `_reset()` | sollte behoben werden |
| 9 | Auftrag §1; `core/error-tracker.js:329-345` | fehlende Spezifikation „melde() während Folgemeldung“ | sollte behoben werden |
| 10 | Auftrag §1 Folgemeldung | „seit HH:MM (Europe/Berlin)“ ohne Quellenangabe | Anmerkung |
| 11 | Auftrag §2 | „ROT mit Zahl“ | Anmerkung |

[Bericht regulaer erstellt, Rundenlimit nicht erreicht.]

---

## Spur 2 (Einzelaufruf)

## Befunde der Planprüfung (C2 Nacharbeit 4, Kopf 32822d9)

Ich prüfe ausschließlich das Auftragspapier gegen den beigelegten Code.  
Schwerpunkt wie vorgegeben: Fragen 1(a), 1(b) und 2.

---

## Frage 1 — welcher Zustand entsteht neu, und was kann schiefgehen?

Neue Zustände durch das Papier:

- laufender `unref()`-Zeitgeber je studioloser Fehlergruppe, maximal bis Fensterende
- gesammelte Studios in `telegramSammelState` mit Fensterende-Semantik
- `beforeExit`-Flush für gesammelte Meldungen
- Folgemeldung am Fensterende („Derselbe Fehler seit HH:MM … zusätzlich in N Studios …“)
- Anomalie-/Fehlermeldung am Laufende der Ernte
- Weiterlaufen der Ernte nach einzelnen Verzeichnis-Lesefehlern

### 1(a) Verlust, Verspätung, falsches Studio

**Befund A1 — pm2-Reload / externes SIGTERM verliert gesammelte Studios.**
Das Papier regelt Prozessende nur für CLI-Läufe (`beforeExit`). Für den Webprozess unter pm2 gibt es keinen SIGTERM-/SIGINT-Handler, und `beforeExit` wird bei einem externen Reload nicht emittiert.  
Hat `melde()` für eine studiolose Signatur bereits gesammelt, sind diese Studios im Reload weg, obwohl sie auf `a1a41d7` in der Regel sofort gesendet worden wären.  
**Stelle:** Auftrag §1 „Prozessende: ein CLI-Lauf … `beforeExit`“; core/error-tracker.js:426-439, dort kein Prozess-Signal-Handler außer `uncaughtException`.  
**Nachmessung:** Prozess mit zwei `melde()`-Aufrufen derselben studiolosen Signatur im selben Fenster füllen, dann `process.kill(process.pid, 'SIGTERM')` senden. Es darf keine Telegram-Anfrage für die gesammelte Gruppe beobachtet werden. Oder statisch: Das Papier verlangt nirgends `process.on('SIGTERM', …)`, der neue Zeitgeber ist `unref()`.

**Befund A2 — `uncaughtException`-Pfad kann den Flush abschneiden.**
In `core/error-tracker.js:434-438` läuft `melde()` und unabhängig davon nach 1500 ms `process.exit(1)`.  
Das Papier sagt nur „dort vorher leeren“; es definiert weder, dass auf den Abschluss der Telegram-Sendung gewartet werden muss, noch, wie lange gewartet wird. `telegram()` hat 15 s Timeout (`core/error-tracker.js:76`), der Exit kommt nach 1,5 s.  
**Nachmessung:** Netz-Attrappe, die den Telegram-Request 3 s verzögert, dann `uncaughtException` auslösen. Prozess endet nach 1,5 s; die Attrappe hat keinen abgeschlossenen Request gesehen.

**Befund A3 — Folgemeldungstext und Zähler sind nicht sauber spezifiziert.**
Der Auftrag verlangt „Weitere Studios … werden gesammelt (mit ihren Zählern)“, aber die Folgemeldung nach dem Auftragstext lautet „zusätzlich in N Studios: …“ und `baueSammelText()` (`core/error-tracker.js:378-392`) enthält keine Unterdrückungszähler je Studio.  
Damit ist unklar, was mit den Zählern geschehen soll. Die Gefahr: Der Ausführende verwirft sie oder erfindet ein unspezifiziertes Textformat.  
**Nachmessung:** `baueSammelText()` lesen — keine Zähler; der Auftragstext spezifiziert kein Format.

### 1(b) Prozess bleibt hängen / Ressourcen im Webprozess

**Befund B1 — `_reset()` räumt neue Zeitgeber nicht ab.**
`core/error-tracker.js:454` räumt bisher nur `state` und `telegramSammelState` auf. Das Papier führt Zeitgeber je Fehlergruppe ein, spezifiziert aber nicht, dass `_reset()` oder eine äquivalente Test-Routine aktive Zeitgeber abbrechen/entfernen muss.  
Ein nach Tests weiterlaufender echter Zeitgeber feuert auf einen geleerten Zustand, erzeugt unnötige Telegram-Versuche und verfälscht Folge-Tests.  
**Nachmessung:** Sammlung starten, `_reset()` rufen, Zeitgeber feuern lassen oder Zeit injizieren. Bei nicht aufgeräumten Timern sendet der alte Timer trotz Reset oder wirft einen Fehler.

**Befund B2 — langlebiger Webprozess kann Speicher und Timer anhäufen.**
Für jede neue studiolose Signatur entsteht ein Zeitgeber. Der Auftrag verlangt „Zeitgeber je Gruppe“, aber nicht, dass nach Fensterende der Zustand gelöscht wird.  
`telegramSammelState` ist in 32822d9 bereits eine dauerhaft wachsende Map. Mit den neuen Fenstern und Timern kann sie im Betrieb noch schneller wachsen, wenn viele eindeutige Signaturen auftreten.  
**Nachmessung:** Viele verschiedene studiolose Signaturen erzeugen; `_telegramSammelState.size` beobachten. Ohne Löschregel bleibt sie nach 15 min bestehen.

### 1(c) Die Ernte löscht etwas, das sie nicht darf / lässt etwas still liegen

**Befund C1 — `relTeile.length >= 4` widerspricht „NUR das Schema“.**
Das Papier §3 sagt:

> unter `_quarantaene/` gilt NUR das Schema `<Studio>/<Typ>/<Datei>` (also `relTeile.length >= 4`)

`>= 4` erlaubt auch 5, 6, … Teile. Ein Pfad wie `_quarantaene/13/notiz.txt/extra` (4 Teile) oder gar `_quarantaene/13/a/b/c` (5 Teile) würde als Quarantäne-Kandidat gelten, obwohl er nicht das Schema ist. Der existierende Code lässt tiefere Verschachtelung ebenfalls durch (`ops/gymdocu-pdf-reste-ernte.js:224-236`).  
Das Papier will laut Satz „NUR das Schema“, müsste also `relTeile.length === 4` verlangen.  
**Nachmessung:** Testpfad `_quarantaene/13/a/b/c` anlegen. Mit `>=4` wird er nach Altersgrenze gelöscht; mit exaktem Schema nicht.

### 1(d) Brauchen Tests echte Dienste oder echtes Warten?

Im Papier ist ausdrücklich festgelegt: zählende fetch-Attrappe, injizierte Zeit bzw. injizierbarer Zeitgeber, „kein Warten in Echtzeit“.  
Das ist konsistent. Es fordert vom Produktionscode eine injizierbare Zeitgeber-Erzeugung. Ein Risiko besteht höchstens darin, dass der `beforeExit`-Flush in Test (d) nicht ohne echten Prozessabbruch simuliert werden kann; das ist aber kein inhaltlicher Fehler des Papiers, sondern eine Umsetzungsanforderung.  
**Bewertung:** Keine Beanstandung.

---

## Frage 2 — Grenzfälle

**pm2-Reload mitten im Fenster:**  
Gesammelte Studios und offene Zeitgeber werden mit dem Prozess beendet. `beforeExit` wird nicht ausgelöst. Es gibt im Webprozess keinen vom Papier geforderten SIGTERM-Handler. Ergebnis: gesammelte Meldungen gehen verloren.  
→ Befund A1.

**`process.exit()` in einem Weg, der gesammelt hat:**  
Der bekannte Weg ist `installProcessHandlers` → `uncaughtException` in `core/error-tracker.js:434-438`. Der Weg kann sammeln; das Papier erkennt das an („dort vorher leeren“), aber die 1500-ms-Exit-Frist ist nicht an den Telegram-Abschluss gekoppelt.  
→ Befund A2.

**`melde()` während der Folgemeldung:**  
Das Papier definiert keinen Sperr-/Wartezustand für den Moment, in dem der Zeitgeber feuert und die Folgemeldung sendet. Wenn der Zeitgeber zuerst das Fenster zurücksetzt und danach sendet, kann ein unmittelbar eintreffendes `melde()` derselben Signatur bereits ein neues Fenster eröffnen und sofort senden. Die alte Folgemeldung kann danach ankommen oder mit dem neuen Zustand kollidieren.  
**Nachmessung:** Zeitgeber-Injektion so wählen, dass beim Feuern der Zustand gelöscht wird, dann vor Abschluss des künstlichen fetches ein neues `melde()` aufrufen; beobachten, ob zwei Sendungen entstehen und in welcher Reihenfolge.

**Zeitgeber feuert nach `_reset()` im Test:**  
→ Befund B1. Aktive Timer werden von `_reset()` nicht entfernt. Sie können auf den geleerten Zustand treffen und senden/werfen.

**Sehr viele verschiedene Signaturen:**  
Je studioloser Signatur wird ein Zeitgeber erzeugt. Ohne Obergrenze und ohne Löschung nach Fensterende entstehen in einem aktiven Webprozess potenziell Tausende Timer und wachsende Map-Einträge.  
→ Befund B2.

---

## Frage 3 — Pflichttest-Vorgaben, die grün sein können, obwohl der Schutz fehlt

**P1 — Pflichttest (a) Abschnitt 1:**  
Gefordert ist nur „Studio: 1“ und „zusätzlich in 49 Studios“.  
Der verlangte Unterdrückungszähler der ersten Stufe („(N× seit letztem Ping unterdrückt)“) wird nicht geprüft.  
→ C2R4-4 kann unentdeckt offenbleiben.  
**Stelle:** Auftrag §1 Pflichttest (a).

**P2 — Pflichttest (b) Abschnitt 1:**  
Geprüft wird nur „zweiter Ping nennt 8“.  
Dass der **erste** Ping im selben Fall das auslösende Studio (7) nennt, ist nicht Teil des Tests.  
Eine Implementierung, die nur beim zweiten Ping korrekt ist, aber im ersten Ping kein Studio nennt, bleibt grün.  
**Stelle:** Auftrag §1 Pflichttest (b).

**P3 — Pflichttest (c) Abschnitt 1:**  
„Route 100× in 30 min → Zähler im Text“ ist kein literaler Sollwert.  
Es fehlt die erwartete Zahl, z.B. „(99× seit letztem Ping unterdrückt)“. Ein Text mit „(0× …)“ oder „(1× …)“ kann den Test bestehen, obwohl der Zähler falsch ist.  
**Stelle:** Auftrag §1 Pflichttest (c).

**P4 — Pflichttest (d) Abschnitt 1:**  
„Folgemeldung vor dem Ende“ verlangt nicht, dass die gesammelten Studios vollständig und korrekt genannt werden.  
Ein Test, der nur irgendeine Telegram-Sendung vor dem Ende abfängt, kann grün sein, obwohl die Sammlung unvollständig ist.  
**Stelle:** Auftrag §1 Pflichttest (d).

**P5 — Pflichttest (e) Abschnitt 1:**  
„Rückgabewert“ ist völlig unbestimmt.  
Damit kann unbemerkt bleiben, ob `telegram` fehlt, ob `'gesendet'`/`'gesammelt'`/`'gedrosselt'` korrekt ist oder ob der Rückgabewert die Telegram-Entscheidung überhaupt abbildet.  
**Stelle:** Auftrag §1 Pflichttest (e).

**P6 — Datenschutzprüfung Abschnitt 2:**  
„Sofortmeldung UND Folgemeldung“ ist gefordert, aber das Papier verlangt nicht ausdrücklich, dass der Test beide Fälle getrennt erzwingt (z.B. erstes `melde()` für Sofortmeldung; Zeitgeber-Injektion für Folgemeldung).  
Ein Test, der nur den Sofortmeldungs-Text abfängt, kann grün sein, während in der Folgemeldung ein Token/OriginalUrl durchrutscht.  
**Stelle:** Auftrag §2, Satz „(Sofortmeldung UND Folgemeldung)“.

**P7 — Ernte-Pflichttest Abschnitt 3:**  
„`_quarantaene/13/notiz.txt` … bleiben und werden gemeldet“ — die Forderung „werden gemeldet“ wird nicht präzisiert. Es könnte „ein melde() am Ende“ sein, aber es fehlt die Zusicherung, dass die Meldung die betroffenen Pfade/Beispiele enthält.  
Eine Meldung ohne Beispielpfad oder ohne Erwähnung der Anomalie wäre nach dem Wortlaut unter Umständen grün.  
**Stelle:** Auftrag §3 Pflichttest „`_quarantaene/13/notiz.txt` … und `_quarantaene/.tmp-x` …“.

---

## Frage 4 — Was wird durch das Papier gegenüber 32822d9 bzw. a1a41d7 schlechter?

- **Zustellgarantie bei Prozessende / Reload wird schlechter als a1a41d7.**  
  Auf `a1a41d7` wurde ein Fehler, der per Telegram ankam, sofort gesendet (oder zumindest der Versuch sofort gestartet).  
  Durch das neue Sammeln kann ein Fehler bis zu einem Fensterende warten und bei pm2-Reload, SIGTERM oder harten `process.exit()` verloren gehen. Das Papier behandelt nur CLI-Läufe und uncaughtException unvollständig.  
  → siehe A1, A2.

- **Der Webprozess erhält neue Zeitgeber und wachsende Zustände.**  
  32822d9 hatte bereits `telegramSammelState` als wachsende Map, aber keine Zeitgeber. Die neue Mechanik erhöht den Ressourcenaufwand und das Speicherwachstum.  
  → siehe B2.

- **Der Rückgabewert `telegram: 'gesendet'` kann eine falsche Sicherheit erzeugen.**  
  Wenn `melde()` synchron bleibt, kann `'gesendet'` nur „Versand ausgelöst“, nicht „HTTP erfolgreich“ bedeuten. Das Papier klärt das nicht und kann vom Ausführenden falsch verstanden werden.  
  → siehe auch Frage 5.

- **Die Ernte kann durch die `>=4`-Regel tiefere unerwartete Dateien unter `_quarantaene` löschen.**  
  Das wäre gegenüber dem sachlich gewollten Schema eine Verschlechterung.  
  → siehe C1.

---

## Frage 5 — Mehrdeutig, widersprüchlich oder im Konflikt mit Code

**W1 — Probelauf vs. Fehlermeldung am Laufende (Widerspruch im Papier).**  
§3 verlangt:

> „hat der Lauf `fehler > 0` oder ist er `abgebrochen` …, geht EIN `melde()` … raus.“

§3 verlangt gleich danach:

> „Probelauf meldet nicht per `melde()`, nur ins Log; der scharfe Lauf meldet.“

Der Probelauf kann `fehler > 0` haben. Der allgemeine Satz fordert dann eine Meldung, der Probelauf-Satz verbietet sie.  
**Stelle:** Auftrag §3 „Melden am Laufende“ vs. §3 „Probelauf“.

**W2 — „NUR das Schema“ vs. `>=4` (Widerspruch).**  
Wie oben in Befund C1. „NUR das Schema `<Studio>/<Typ>/<Datei>`“ bedeutet exakt 4 Teile, die Anweisung `>=4` erlaubt mehr.  
**Stelle:** Auftrag §3 Schema-Absatz.

**W3 — „mit ihren Zählern“ vs. Folgemeldung ohne Zähler.**
Das Papier sagt „Weitere Studios … werden gesammelt (mit ihren Zählern)“, der definierte Folgetext und die bestehende `baueSammelText()`-Funktion (`core/error-tracker.js:378-392`) enthalten keine Zähler je Studio.  
**Stelle:** Auftrag §1, Satz Folgemeldung.

**W4 — „beforeExit … awaitet die Sendungen“ ist technisch irreführend.**
Ein `beforeExit`-Handler wartet in Node nicht auf ein darin gestartetes `async`-Promise.  
Der Prozess bleibt nur durch offene I/O-Handles (Fetch-Sockets) am Leben, nicht durch `await`.  
**Stelle:** Auftrag §1 „Prozessende“.

**W5 — Rückgabewert `'gesendet'` ist mehrdeutig.**
`melde()` ist in 32822d9 synchron (`core/error-tracker.js:395`) und ruft `telegram()` ohne `await` (`:421`).  
Der Rückgabewert kann daher nicht den echten HTTP-Erfolg kennen. Der Auftrag klärt nicht, ob `'gesendet'` nur „Sendung angeordnet“ oder „Sendung erfolgreich“ bedeutet.  
**Stelle:** Auftrag §1, Rückgabewert.

**W6 — Lesefehler mitten im Verzeichnis: „Weiterlaufen“ unklar.**
Der Auftrag verlangt: „ein Fehler beim Lesen eines Verzeichnisses (auch während der Iteration) wird für DIESES Verzeichnis gezählt, der Durchlauf geht weiter“.  
Im bestehenden Generator `durchlaufeDateien()` (`ops/gymdocu-pdf-reste-ernte.js:103-123`) bricht ein Fehler im `for await` den Iterator ab. „Weiterlaufen“ kann hier nur heißen: dieses Verzeichnis verlassen, andere Verzeichnisse weiterverarbeiten.  
Der Auftrag präzisiert nicht, ob die restlichen Einträge desselben Verzeichnisses verarbeitet werden sollen; technisch ist das nach einem Iteratorfehler meist nicht möglich.  
**Stelle:** Auftrag §3 „Fehler mitten im Durchlauf“.

**W7 — Studiozuordnung „Ziffern-Ordner“ und „eine Meldung dafür“ ist unbestimmt.**
Es bleibt offen, ob „013“ als gültige Studio-ID interpretiert wird, ob führende Nullen normalisiert werden und ob „eine Meldung dafür“ eine Sammelmeldung für alle Dateien ohne Studio oder eine Meldung je betroffene Datei sein soll.  
**Stelle:** Auftrag §3 „Studiozuordnung C2R4-12“.

---

## Zusammenfassung der wichtigsten Befunde

| Nr | Klasse | Kern | Stelle |
|---|---|---|---|
| A1 | 1(a)/2 | pm2-Reload verliert gesammelte Studios, weil nur `beforeExit`, kein SIGTERM-Handler | §1 Prozessende |
| A2 | 1(a)/2 | uncaughtException exit 1500 ms schneidet Flush ab | core/error-tracker.js:434-438 |
| B1 | 1(b)/2 | `_reset()` räumt Timer nicht ab | core/error-tracker.js:454 |
| B2 | 1(b)/2 | Zeitgeber/Speicher je Signatur wachsen unkontrolliert; keine Löschregel nach Fensterende | §1 Zeitgeber je Gruppe |
| C1 | 1(c)/5 | `>=4` erlaubt mehr als das Schema und kann tiefere Dateien löschen | §3 Schema-Absatz |
| P1-P7 | 3 | Pflichttests (a), (b), (c), (d), (e), Abschnitt 2, Ernte-Test sind blind bzw. unterbestimmt | §1, §2, §3 |
| W1-W7 | 5 | Widersprüche/Mehrdeutigkeiten, u.a. Probelauf vs. Fehlermeldung, `>=4` vs. `===4`, Folgemeldung/Zähler, `beforeExit`-await | diverse |

Alle Befunde sind ohne Repo-Zugriff prüfbar, in erster Linie als statische Analyse des Auftragspapiers gegen den gelieferten Code.
