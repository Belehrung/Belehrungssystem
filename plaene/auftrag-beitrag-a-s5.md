# Auftragspapier — Beitrag A: `routes/admin/mitarbeiter.js`, nur S5

**Stand: 20.09.2026, gemessen gegen `master` = `7b955ec`.** Arbeitszweig
`beitrag-a-mitarbeiter-rowcount`, abgezweigt von genau diesem Stand.

Dies ist der DRITTE und letzte Beitrag aus
`plaene/auftrag-schreibreihenfolge.md`. **S6 fährt NICHT mit** —
Betreiber-Entscheidung vom 20.09.2026 („ohne s6"), Begründung dort im
Abschnitt „ENTSCHEIDUNG 20.09.2026 — S6 wird AUS dem Papier
HERAUSGENOMMEN". Dieses Papier ist eigenständig: wer es umsetzt, braucht das
grosse Papier nicht zu lesen.

**Damit entfällt auch der Satz „S5 und S6 MÜSSEN zusammen gebaut werden"** aus
dem grossen Papier. Er stand dort, weil beide dieselben zwei Zeilen (`:760`,
`:762`) angefasst hätten. S5 allein fasst `:762` NICHT an — s. Entscheidung E-2
unten, die genau das festlegt.

---

## 1. Der Befund (S5)

Drei Routen melden dem Benutzer Erfolg, obwohl ihr UPDATE NULL Zeilen
getroffen hat.

| Route | Zeile | SELECT davor | UPDATE | Antwort bei 0 Zeilen (HEUTE) |
|---|---|---|---|---|
| `POST /mitarbeiter/email/:id` | 677 | 690 | 691 | Redirect `feedback=email_gespeichert` |
| `POST /mitarbeiter/pin-direkt/:id` | 746 | 758 | 760 | Redirect `feedback=pin_gesetzt` |
| `POST /mitarbeiter/umbenennen/:id` | 818 | 838 | 840 | Redirect `feedback=name_geaendert` |

**Alle Zeilennummern am 20.09.2026 gegen `7b955ec` NEU gemessen**, nicht aus
dem alten Papier übernommen (Hausregel: „Aufgabennotizen veralten").

**Alle drei lesen VORHER** (SELECT-Spalte oben). Das ist gemessen und
widerspricht einer früheren Behauptung des grossen Papiers; es ändert die
Behebung, s. Abschnitt 2.

**Kein Datenrisiko.** `studio_id` steht in jeder der sechs WHERE-Klauseln
(gemessen an allen drei SELECTs und allen drei UPDATEs). Der Schaden ist eine
**falsche Zusage an den Benutzer** — „PIN gespeichert. Der Mitarbeiter kann
sich jetzt am Tablet anmelden." für einen Mitarbeiter, den es nicht gibt.

**Zwei verschiedene Fälle führen zu 0 Zeilen, und sie brauchen verschiedene
Riegel:**

1. **Die ID war nie vergeben** (oder gehört einem fremden Studio). Dann
   liefert schon der SELECT `ma = null`. Heute wird `ma` nur für den
   Protokolleintrag benutzt (`if (ma) { … }`), nicht für die Antwort.
2. **Die Zeile verschwindet ZWISCHEN SELECT und UPDATE** — `POST
   /mitarbeiter/loeschen/:id` löscht die Zeile hart (gemessen:
   `routes/admin/mitarbeiter.js:952`, echtes `DELETE FROM mitarbeiter`
   innerhalb einer `db.tx`, kein Deaktivieren). Dann ist `ma` gefüllt und das
   UPDATE trifft trotzdem nichts. Diesen Fall fängt NUR `rowCount`.

---

## 2. Was gebaut wird

### E-1 — beide Riegel, in jeder der drei Routen

**Riegel A (`ma`):** direkt nach dem vorhandenen SELECT

    if (!ma) return res.redirect("/admin/mitarbeiter?feedback=<code>");

**Riegel B (`rowCount`):** das vorhandene `await db.run(<UPDATE>)` bekommt
einen Rückgabewert, danach

    if (!r.rowCount) return res.redirect("/admin/mitarbeiter?feedback=<code>");

`db.run` liefert das volle pg-Ergebnis samt `rowCount` — gemessen,
`core/db.js:431-433` (`return pool.query(sql, params);`). Es muss also nichts
umgebaut werden, nur ausgewertet.

**Riegel B steht VOR dem `auditAppend`.** Sonst schreibt die gehashte
Protokollkette „mitarbeiter_pin_gesetzt" für einen Vorgang, der nicht
stattgefunden hat. Heute ist der Audit-Aufruf nur durch `if (ma)` geschützt —
und `ma` ist im Fall 2 gefüllt.

**Bei `pin-direkt` steht Riegel A VOR `bcrypt.hash`** (`:758` vor `:759`).
Das ist kein Schönheitsgewinn: `bcrypt.hash(pin, 12)` ist der teuerste
Schritt der Route, und eine nie vergebene ID soll ihn nicht auslösen.

### E-2 — Entscheidung: die Token-Entwertung bei `pin-direkt` bleibt, wo sie ist

`:762` entwertet offene Einladungs-/Reset-Tokens. **Riegel B wird bei
`pin-direkt` NACH dieser Zeile ausgewertet**, nicht davor.

Begründung: träfe das PIN-UPDATE null Zeilen, ist die Mitarbeiterzeile weg.
`loeschen` räumt deren Tokens zwar selbst ab (`:889`), tut das aber AUSSERHALB
der `db.tx`, in der die Mitarbeiterzeile selbst fällt (`:940-953`), und in einem
`try { … } catch {}` — schlägt es fehl, wird der Fehler verschluckt und die
Tokens überleben. Die Zeile `:762` räumt sie dann nebenbei mit ab. Wer Riegel B
davorsetzt, nimmt diese Aufräumung weg und führt einen Zustand neu ein, den es
heute nicht gibt.

Riegel A steht dagegen VOR `:762` — bei einer nie vergebenen ID gibt es nichts
aufzuräumen.

**Das ist eine Entscheidung, kein Messergebnis**, und sie gehört ausdrücklich
in die Prüffrage: *was wird dadurch schlechter?*

### E-3 — Rückmeldecodes

Die Liste steht bei `routes/admin/mitarbeiter.js:60-74` (dreizehn Codes,
gezählt). **Ein Code ohne Listeneintrag zeigt GAR NICHTS an**
(`core/ui-feedback.js#feedbackFromQuery`; im Bestand bei `:826-831`
kommentiert und dort ausdrücklich als GEMESSEN bezeichnet).

| Route | Code | vorhanden? |
|---|---|---|
| `email` | `email_fehler` | **ja, `:72`** — *„E-Mail-Adresse nicht gespeichert. / Der Mitarbeiter wurde nicht gefunden."* Passt wörtlich, wird bereits bei `:680` benutzt. Nichts Neues. |
| `umbenennen` | `name_nicht_gefunden` | **neu.** `name_fehler` (`:73`) trägt den Detailtext *„Bitte gib einen Namen ein."* — hier irreführend. |
| `pin-direkt` | `pin_fehler` | **neu.** Kein passender Code vorhanden. |

Vorgegebener Wortlaut, beide mit `tone: "error"`:

    pin_fehler:          { title: "PIN nicht gespeichert.",  detail: "Der Mitarbeiter wurde nicht gefunden." }
    name_nicht_gefunden: { title: "Name nicht gespeichert.", detail: "Der Mitarbeiter wurde nicht gefunden." }

### E-4 — was NICHT angefasst wird

* **`:762` selbst** (Reihenfolge, Transaktion) — das war S6, gestrichen.
* **`umbenennen` übergibt `req.params.id` als Zeichenkette** an beide
  SQL-Anweisungen (`:838`, `:840`), während die Geschwister `parseInt`
  benutzen. Gemessen, aber nicht Gegenstand dieses Beitrags: die ID-Wache
  `istGueltigeId` läuft davor, und `rowCount` wirkt unabhängig von der
  Schreibweise.
* **Der `exists`-Vorabtest bei `email`** (`:684-687`).
* **Alle übrigen Routen der Datei.**

---

## 3. Zusicherungen

### Z5a-1 — nie vergebene ID → keine Erfolgsmeldung (alle drei Routen)

Die Fixtur existiert bereits: `test_feature_id_wache_route.js` fährt jede der
drei Routen mit `ID_MAX_FORMAT_GUELTIG` (2147483647). **Drei Zusicherungen
dort schreiben heute das FALSCHE Verhalten fest** und werden umgedreht:

    :340  email       feedback=email_gespeichert  ->  feedback=email_fehler
    :379  pin-direkt  feedback=pin_gesetzt        ->  feedback=pin_fehler
    :427  umbenennen  feedback=name_geaendert     ->  feedback=name_nicht_gefunden

Ihre heutigen Meldungstexte sagen ausdrücklich *„tatsächliches ‚nicht
gefunden'-Verhalten (GEMESSEN: kein Fehler … 0 Zeilen betroffen, s. Fundort im
Bericht)"* — sie halten den Befund fest, statt ihn zu beheben. Der Text wird
mit umgeschrieben; ein Verweis auf diesen Beitrag kommt hinein.

**GEGENPROBE — und hier ist die Falle, die in CLAUDE.md am 20.09.2026 gemessen
wurde:** Z5a-1 wird NICHT rot, wenn man nur Riegel A entfernt. Dann läuft das
UPDATE, trifft null Zeilen, und Riegel B fängt es — grün aus dem zweiten
Riegel. **Es sind also BEIDE Riegel zu mutieren**, einzeln UND gemeinsam, und
alle drei Ergebnisse gehören wörtlich in den Bericht:

    nur Riegel A entfernt   -> erwartet GRÜN  (Riegel B fängt es)
    nur Riegel B entfernt   -> erwartet GRÜN  (Riegel A fängt es)
    BEIDE entfernt          -> erwartet ROT   (drei Zusicherungen)

### Z5a-1b — Riegel A steht bei `pin-direkt` VOR `bcrypt.hash` (statisch)

Weil Z5a-1 den Riegel A verhaltensmässig nicht von Riegel B unterscheiden
kann (s.o.), bekommt die EINE Eigenschaft, die nur Riegel A hat, eine eigene,
statische Zusicherung: im Quelltext der Route steht der `!ma`-Ausstieg
lexikalisch vor dem `bcrypt.hash`-Aufruf.

**Gegenprobe:** die beiden Zeilen vertauschen → ROT. Muster und
Fundstellenzählung wie bei den vorhandenen statischen Wächtern der Datei
(`test_feature_audit_benutzerverwaltung_static.js` benutzt dafür
`startMarker`) — **das Mutationsmuster muss GENAU EINMAL passen, sonst
abbrechen** (Hausregel).

### Z5a-2 — Löschung ZWISCHEN SELECT und UPDATE → keine Erfolgsmeldung

Der SELECT liest eine ECHTE Zeile; danach wird sie über eine ZWEITE Verbindung
gelöscht; erst dann läuft das UPDATE.

Aufbau wie in Beitrag C (`test_feature_belehrung_neue_version_transaktion.js`):
`db.one` der Route wird umhüllt, das Muster der Abfrage wird auf die EINE
gesuchte Anweisung festgelegt, und der Zähler der Aufrufe wird mitgeführt.
**Der Wrapper prüft, dass er wirklich gegriffen hat** — sonst misst der Lauf
den unveränderten Weg und meldet grün.

**Erwartet:** Fehlermeldung, kein `feedback=…gespeichert/gesetzt/geaendert`.

**Gegenprobe:** NUR Riegel B entfernen → **nur dieser Lauf** rot, Z5a-1 bleibt
grün. Genau das unterscheidet die beiden Riegel voneinander.

**Mindestens für `pin-direkt` zu bauen**, weil dort der Folgeschaden am
grössten ist (falsche Zusage „kann sich jetzt anmelden" + Protokolleintrag).
Für `email` und `umbenennen` genügt Z5a-1, wenn der Aufbau sie nicht ohnehin
billig mitnimmt.

### Z5c — bei 0 getroffenen Zeilen wird NICHTS protokolliert

Im Aufbau von Z5a-2: nach dem Durchlauf steht KEIN Eintrag
`mitarbeiter_pin_gesetzt` für diese ID in der Protokollkette.

**Gegenprobe:** Riegel B hinter den `auditAppend` schieben → ROT. Damit ist
die Reihenfolge aus E-1 bewacht und nicht nur behauptet.

### Z5b — die neuen Codes werden auch ANGEZEIGT

`GET /admin/mitarbeiter?feedback=pin_fehler` liefert eine Seite, die den
hinterlegten Titel UND den Detailtext enthält; dasselbe für
`name_nicht_gefunden`.

**Gegenprobe:** den jeweiligen Eintrag aus der Liste (`:60-74`) entfernen →
ROT. Ohne diese Zusicherung ist ein vergessener Listeneintrag ein stiller
Redirect, den Z5a nicht von einer Fehlermeldung unterscheiden kann.

---

## 4. Betroffene Prüfdateien (gemessen, `7b955ec`)

Gesucht wurde nach BEIDEM — Routenpfaden UND Rückmeldecodes/Meldungstexten
(ein Suchmuster, das nur nach Pfaden sucht, misst die Form mit; genau daran
fehlte in einer früheren Fassung `test_feature_employee_feedback.js`):

    test/e2e-durchlauf.js                          nur INSERT mit pin_gesetzt_am -- NICHT betroffen
    test_feature_audit_benutzerverwaltung_static.js  statischer Anker auf pin-direkt
    test_feature_audit_fehler_gemeldet.js            Anker auf den melde()-Pfad des pin-Audits
    test_feature_audit_mitarbeiter.js                Verhalten umbenennen/email mit ECHTEN IDs
    test_feature_employee_feedback.js                die drei ERFOLGScodes im Quelltext
    test_feature_id_wache_route.js                   drei umzudrehende Zusicherungen (s. Z5a-1)

**Jede dieser sechs Dateien läuft vor dem Commit einzeln**, und ihre Zahlen
gehören wörtlich in den Bericht — auch die der nicht betroffenen. Danach die
volle Suite.

---

## 5. Was an diesem Beitrag schiefgehen kann — meine eigene Liste

Sie steht hier, damit die Gegenlesung sie widerlegen oder ergänzen kann, nicht
damit sie sie übernimmt:

1. **Ein Riegel deckt den anderen zu** (s. Z5a-1) — die Klasse „Zusicherung
   misst den Frühausstieg statt des Riegels".
2. **E-2 könnte falsch herum sein.** Ich habe entschieden, die
   Token-Entwertung bei 0 Zeilen weiterlaufen zu lassen. Das ist eine
   Abwägung, kein Messergebnis.
3. **Ein neuer Rückmeldecode ohne Listeneintrag** ist ein stiller Redirect.
   Z5b soll genau das fangen — bewacht aber nur die zwei NEUEN Codes.
4. **`email_fehler` wird jetzt für ZWEI verschiedene Ursachen benutzt**
   (ungültige ID-Form bei `:680`, und neu: nicht gefunden). Eine bestehende
   Zusicherung, die `email_fehler` erwartet, kann ab jetzt aus dem anderen
   Grund grün sein — die Klasse „derselbe Statuscode aus einem neuen Grund".
5. **`umbenennen` arbeitet mit der ID als Zeichenkette** (E-4). Ich halte das
   für folgenlos, habe es aber nicht gemessen.
