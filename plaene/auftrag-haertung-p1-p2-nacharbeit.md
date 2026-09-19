# Auftrag: Nacharbeit Härtung P1+P2 — der Wächter bewacht zu wenig, und drei Knöpfe sind zu breit

Repo `/home/user/gymdocu`, weiter auf `claude/haertung-p1-p2`. Kein PR offen.

Quelle: zwei unabhängige Prüfspuren. **Der wichtigste Befund kam von beiden**,
und eine davon hat ihn AUSGEFÜHRT gemessen.

---

## BLOCKIEREND

### B1 — Der neue Wächter sieht `app.post(...)` nicht und meldet trotzdem „0 Abweichungen"

**Gemessen von der Claude-Review** (sie hat die Datei laufen lassen):
`EXIT 0, 5 PASS / 0 FAIL`, gefundene Menge = 8 Routen. Tatsächlich registriert
`server.js` FÜNF weitere Schreibrouten direkt auf der App, alle unter
`/intern` und damit CSRF-ausgenommen:

| Fundstelle | Route |
|---|---|
| `server.js:196` | `app.post("/intern/provision", …)` |
| `server.js:214` | `app.post("/intern/setup-link", …)` |
| `server.js:230` | `app.post("/intern/deprovision", …)` — **löscht ein ganzes Studio** |
| `server.js:266` | `app.post("/intern/qr-block", …)` |
| `server.js:652` | `app.post("/intern/export", …)` |

Der Wächter sammelt nur aus `MEINE_MOUNTS` — die gebaute App wird für die
Inventur gar nicht ausgewertet. Die Zusicherung sagt wörtlich „**Die
tatsächlich registrierten** Nicht-GET-Routen … entsprechen GENAU der
erwarteten Menge". Das ist am Tag der Auslieferung falsch.

**Das ist unsere teuerste Klasse: eine FALSCHE Zusicherung von Abdeckung.**
Ein Wächter, der nichts findet, ist schlimmer als keiner — er beruhigt.

Zu bauen:
- Den Quelltext-Scan von `server.js` auf `app.post/put/patch/delete/all`
  erweitern, nicht nur `app.use`.
- Die fünf bestehenden Routen in die literale Erwartung aufnehmen. Sie sind
  nicht falsch (nginx sperrt `/intern` nach aussen), aber sie gehören
  inventarisiert — genau dafür ist der Wächter da.
- **Positivkontrolle je Registrierungsart**, die der Wächter zu erfassen
  behauptet: für jede eine Route pflanzen und messen, dass der Wächter sie
  meldet. Was er nachweislich NICHT findet, gehört wörtlich in den
  Zusicherungstext — nicht in einen Kommentar.

### B2 — Die Präfixregel des Wächters ist enger als die produktive

`core/csrf-schutz.js:15` benutzt `p === a || p.startsWith(a)` — ohne
Segmentgrenze. Der Wächter verlangt `=== a || startsWith(a + '/')`.

Folge: ein Mount `/api-docs` oder `/internal-tools` wäre in Produktion
CSRF-AUSGENOMMEN (`'/api-docs/x'.startsWith('/api')` ist wahr), für den
Wächter aber unsichtbar. Er bliebe grün.

Zu bauen: **dieselbe Prüffunktion benutzen wie der Produktivcode**, nicht
nachbauen. Exportiere aus `core/csrf-schutz.js` das Prädikat statt (oder
zusätzlich zu) der rohen Liste, und lass den Wächter es aufrufen.

### B3 — Kein Test schickt die vier Routen durch den ECHTEN CSRF-Schutz

Die eine neue Fehlerart, die dieser Beitrag einführt, ist: jeder Klick wird
mit 403 beantwortet. Genau die prüft niemand. `route-harness.js#makeApp`
hängt `csrfSchutz` nicht ein, `test_feature_csrf.js` prüft nur synthetische
Pfade, keinen der vier umgestellten.

Zu bauen: Für alle vier Routen durch den ECHTEN `csrfSchutz` senden — mit
passendem Origin (muss durchgehen) und ohne Origin/Referer (muss abgewiesen
werden). Beide Richtungen, sonst ist es keine Prüfung.

### B4 — Die Wartungs-E-Mail verlinkt per GET auf die jetzt POST-only-Route

`routes/wartung.js:1420-1421` baut
`${basisUrl}/admin/geraetewartung/verlauf/pdf/${pruefungId}` als
Anklickziel in einer Mail an den Studio-Admin. Diese Route ist jetzt POST —
der Knopf liefert eine 404.

**Nachgemessen, und es ist knapper als es aussieht:** `basis_url` wird von der
Anwendung nirgends geschrieben (`core/basis-url.js:57` trägt diesen Befund
selbst), und diese Stelle liest die Einstellung ROH mit Vorgabe leer, ohne den
Host-Rückfall aus `core/basis-url.js`. Der Link ist heute also inert. Aber er
ist ab jetzt DEFINITIV kaputt, sobald jemand die Einstellung setzt — vorher
hätte er funktioniert. Das ist ein Rückschritt, den dieser Beitrag einführt.

Zu bauen: Das Ziel auf die SEITE richten, von der aus der Admin handeln kann
(`/admin/geraetewartung/verlauf`), nicht auf den Schreibweg. Eine E-Mail
verlinkt nie auf einen Endpunkt, der etwas ändert — sie kann kein Formular
absenden.

### B5 — Der Offline-Rückfall auf dem Trainer-Tablet fällt weg

`core/service-worker.js:307` steigt bei jedem Nicht-GET sofort aus, BEVOR der
Navigations-Zweig (`:315`) greift. Der „✓ Fertig"-Knopf war eine
GET-Navigation: bei Funkloch fing der Worker den Fehler ab und lieferte
`/offline.html`. Jetzt ist es ein POST — der Browser zeigt seine eigene
Fehlerseite, und anders als beim Absenden der Prüfung selbst
(`public/offline-queue.js`) wird nichts eingereiht oder wiederholt.
`sendeDefektMails()` läuft für diese Defekte dann NIE.

Die Tablets sind der dokumentierte Hauptzugang für diese Seite.

**Miss das zuerst und widersprich mir, wenn es anders ist.** Wenn es trägt,
brauchen wir eine Entscheidung statt eines schnellen Baus — melde mir, was die
Möglichkeiten sind (Einreihung wie beim Prüfungs-Absenden; oder der Worker
behandelt diese eine POST-Navigation; oder der Knopf bleibt GET und der
Seiteneffekt wandert woanders hin) mit Aufwand und Nebenwirkungen. **Baue
hier nichts, bevor ich entschieden habe.**

---

## AUSSEHEN — drei Knöpfe werden zu breit (gemessen an bestehenden Vorbildern)

Beide Layouts setzen `button { width:100% }`
(`routes/admin/shared.js:383`, `routes/wartung.js:261-263`), und `.btn-small`
setzt keine Breite. Die neuen Submit-Knöpfe stehen in einem
`<form style="display:inline">`, das keinen Rahmen aufspannt — sie lösen 100 %
gegen die Tabellenzelle auf und schieben die Nachbar-Links in die nächste
Zeile.

Das Repo kennt die Falle bereits: `geraete.js:4254`, `geraete.js:6055`,
`admin/qr-bestellung.js:1042/1766` und `wartung.js:1482` setzen dafür
ausdrücklich `width:auto`.

Betroffen: `routes/admin/geraete.js:4445` und `:4657`, `routes/wartung.js:1534`.

Dazu `routes/sichtpruefung.js:3511`: der „✓ Fertig"-Knopf war ein
`display:block`-Element über die volle Breite — die primäre Bestätigung des
Foto-Ablaufs auf einem Tablet. Jetzt schrumpft er auf Textbreite, während der
danebenstehende „🏠 Hauptmenü" voll breit bleibt, und die generische
`button`-Regel gibt ihm eine andere Schriftgröße.

**Lade `/design-pruefung` und miss das, statt es zu schätzen.** Das hätte in
meinem Auftrag stehen müssen — jede Änderung am Aussehen verlangt das, und
ich habe es vergessen. Screenshots vorher/nachher gehören in den Bericht.

---

## SOLLTE BEHOBEN WERDEN (alle klein, in dieselbe Runde)

- **S1** `test_feature_get_schreibt_nicht.js:157,185`: „POST liefert die Datei"
  prüft bei den Wartungsrouten nur einen 302 mit passendem Namensfragment.
  `res.redirect('/nicht-vorhanden' + pdfPath)` bliebe grün. Die echte
  Auslieferung mit Scratch-`PDF_ROOT` einhängen, dem Redirect folgen, Inhalt
  prüfen.
- **S2** `:219`: heisst „GENAU EINMAL", misst `!== null`. Entweder ehrlich
  benennen oder die Anzahl wirklich messen.
- **S3** Der Wächter vergleicht den Mount-PFAD gegen `server.js`, nicht die
  MODUL-Identität. Wird `/api` auf ein anderes Modul umgehängt, bleibt er grün
  und zählt das falsche Modul aus.
- **S4** `if (!layer.route) continue` überspringt Unterrouter
  (`router.use()`). Der Kommentar behauptet, es gebe keine — das ist nicht
  gemessen. Entweder messen und zusichern, oder die Lücke im
  Zusicherungstext benennen.
- **S5** `serverMountsAlle.length >= 15` ist eine ZAHL. Gegen eine literale
  Liste bekannter Mounts prüfen.
- **S6** `docs/OFFENE-SICHERHEITSPUNKTE.md:53-63` führt alle vier Routen
  weiterhin als offene GET-Mutationen, mit veralteten Zeilennummern.
  Nachziehen — dieselbe Aussage steht sonst an zwei Orten, und einer ist
  falsch. Abschnitt 2 dort („mindestens Kommentar/Guard") ist durch den neuen
  Wächter beantwortet.
- **S7** `test_feature_get_schreibt_nicht.js:228`: der äussere `.catch()`
  räumt das Scratch-Verzeichnis nicht ab. In ein `finally`.
- **S8** Der `get`-Helfer in `test_feature_verbandbuch_pdf_fluechtig.js` ist
  tot. Löschen — oder eine Zusicherung daraus machen, dass GET die Route
  nicht mehr erreicht.
- **S9** Vom Foto-Abschluss ist nur `cardio-check` geprüft; `kraft-check`
  existiert ebenfalls.
- **S10** Zeile 158 schliesst `head` aus, `routes/webhooks.js:179` registriert
  aber ein `HEAD /magicline`. „ALLE Nicht-GET-Routen" stimmt damit nicht
  wörtlich.

---

## Abschluss

Zu jedem Punkt eine Gegenprobe in beide Richtungen mit Zahlen. Volle Suite
ohne Pipe, Dateizahl-Ritual als MENGENvergleich, `npm run lint` wörtlich,
Marker-Scan (Sollwert 6), `git status` sauber.

**B5 ist ausdrücklich AUSGENOMMEN vom Bauen** — dort will ich erst deine
Messung und die Möglichkeiten sehen.

Widersprich, wo deine Messung meinen Angaben widerspricht.
