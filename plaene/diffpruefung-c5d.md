# Diffprüfung C5-D — Routen: stille Fehler, Eingaben, Status

Stand 30.09.2026. Zweig `c5d-routen`, Commit `529671a`. Der Bau meldet: Suite `SUITE_EXIT=0`, 417 = 417, Lint EXIT 0.

Spuren: Lesespur `deepseek-flash` mit dem Baum `/workspace/gymdocu-c5d-lese` und eine ausführende Claude-Spur in einem eigenen Baum.

## Selbst gelesen (Produktivdiff, 1210 Zeilen)

| Nr | Schwere | Stelle | Beobachtung |
|---|---|---|---|
| D-E1 | Bestand, Sammelliste | `routes/wartung.js` `/sperre/:id/mail` | Die Route setzt `mail_gesendet_am` vor jedem Senden zurück. Zwei parallele Klicks setzen gegenseitig den Claim zurück, sodass beide senden können. Das bestand schon vor C5-D. Neu ist nur der 409-Text für den Verlierer. |
| D-E2 | Anmerkung | `routes/admin/mitarbeiter.js` `_impFehlergrund` | Nur E-Mail-Adressen werden maskiert. Ein PostgreSQL-Fehler mit Wert im Text („invalid input syntax … "<wert>"“) ginge ungefiltert in `melde()`. Die Spur misst das. |
| D-E3 | Anmerkung | Bericht gegen Code | Der Bericht nennt `IMPORT_FEHLER_ZEIGEN` 3, der Code sagt 5. Der Bericht ist falsch, der Code ist gewollt. |
| D-E4 | geprüft | Verbandbuch | Formular-POST ohne Offline-Warteschlange (`vbForm.submit()`). Die Optionen tragen `data-id` schon im Bestand (`:222`). |

## Lesespur flash (8 Befunde), nachgemessen

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| F1 | sollte | Die 409-Seite sagt „Bitte nicht erneut senden“, obwohl der siegreiche Aufruf danach scheitern und den Claim zurücknehmen kann (`claimZurueck` bei keinEmpfaenger/sendMail-Wurf). | gelesen, trägt (mit D-E1) | Nacharbeit: neutraler Text |
| F2 | **blockierend** | Verbandbuch: Eine mehrdeutige Person ohne ID wird mit 400 abgelehnt. Unterschrift und Angaben gehen verloren (Formular-POST, keine Warteschlange), der Unfall ist nicht dokumentiert. Vorher wurde gespeichert. | gelesen: `fehler()` gibt eine Fehlerseite ohne Formularinhalt zurück | Nacharbeit: die Verknüpfung nie zum Ablehnungsgrund machen; bei Mehrdeutigkeit oder ID/Name-Abweichung `mitarbeiter_id NULL`, gespeichert wird trotzdem |
| F3 | Anmerkung | Der Import-Alarm trägt die Anzahl nicht (Telegram nur `quelle` + Signatur). | gelesen (`core/error-tracker.js`) | Nacharbeit: Kommentar ehrlich, Anzahl ins Log |
| F4 | Anmerkung | „Zeile N“ ist die Eintragsnummer, nicht die Dateizeile. | gelesen | Nacharbeit |
| F5 | Anmerkung | `formate:[{}]` besteht die Strukturprüfung. | gelesen | Nacharbeit: Kommentar einschränken |
| F6 | Frage | Ersthelfer-Nachweise per Webhook deaktivierter Mitarbeiter bekommen kein `inaktiv_seit`, die Löschfrist läuft nie. | gelesen: auch die Admin-DEAKTIVIERUNG setzt es nicht, nur der Löschweg (`mitarbeiter.js:1221`). Das ist kein Regress von C5-D. | Sammelliste als Betreiberfrage (Löschfrist ab Deaktivierung?) |
| F7 | Anmerkung | Die `/qr/kleben`-Zusicherung ist nur Regex. | gelesen | Nacharbeit: `innerHTML`-Zuweisung mitprüfen |
| F8 | Anmerkung | Beim PDF-Hinweis „nicht erneut absenden“ gibt es keine Idempotenzsperre. | die Spur misst (a) | wartet auf die Spur |

## Ausführende Claude-Spur (26 Mutationen, 5 Routenproben gegen neu und master)

Die tragenden Befunde sind mit Proben an echten Routen gegen beide Stände gemessen. Sie decken sich mit F1 und F2 und verschärfen sie.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| C1 | hoch | Ein Mitarbeitername mit Randleerraum (der Webhook trimmt `content.name` nicht) lässt sich weder als Person noch als Ersthelfer eintragen. Die Folge ist 400, der Eintrag ist verloren. Vorher wurde gespeichert. | Nacharbeit, zusammen mit F2 |
| C2 | mittel | 409 „bitte nicht erneut senden“ erscheint auch, wenn der Claim-Halter scheitert. Dann geht 0 Mail raus. | Nacharbeit (F1) |
| C3 | mittel | Ein echter SMTP-Fehler der Einladung kommt als `{ok:false}` zurück, nicht als Wurf. Er wird nicht gezählt und nicht gemeldet; die Testattrappe wirft stattdessen. | Nacharbeit |
| C4 | niedrig–mittel | Kein Test legt den Grund `parallel` fest. | Nacharbeit |
| C5 | niedrig, latent | COALESCE plus Reaktivierung durch Admin oder API ergibt ein veraltetes `inaktiv_seit` beim nächsten INACTIVE. | Nacharbeit: im Webhook-CASE den Zustand der Zeile lesen |
| C6–C8 | Testlücken | Zweite Sperr-Abfrage; `konfigUnlesbar` nur als Muster geprüft; Banner im Zweig „heute erledigt“ | Nacharbeit |
| C9 | Info | Die Kommentarbegründung „Telegram“ stimmt nicht (Telegram bekommt nur Signatur und Quelle); `console.error` daneben ist unmaskiert. | Nacharbeit |
| C10 | Info | Erneutes Absenden der Wartungsprüfung: doppelt schon auf master. Neu: bei PDF-Fehler geht die Admin-Mail raus. | Nacharbeit: Mailweg ohne PDF prüfen |

## Sammelliste (`offene-befunde-c5d.md`)

- D-E1: Doppelversand bei parallelen Klicks durch das Zurücksetzen in der Route (Bestand).
- F6: Löschfrist der Ersthelfer-Nachweise ab Deaktivierung? Betreiberfrage, Bestand.
- Altdaten mit Randleerraum in `mitarbeiter.name`: Bereinigung braucht eine Migration, nicht in C5.
- Wartungsprüfung ohne Idempotenz (Bestand).

## Runde 2 (Lesespur flash über Nacharbeit 1, `529671a..eaca30d`)

Selbst gelesen: `loesePerson` in `routes/verbandbuch.js` und die beiden UPDATE-Zweige in `routes/webhooks.js`. Blockierend war nichts.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| R2-1 | sollte (Regress) | `String(content.name \|\| …).trim()`: wird erst nach dem `\|\|` getrimmt. Ein `name` aus reinem Leerraum ergibt `''`, und das Ereignis bricht ab, obwohl Vor- und Nachname da sind. | Nacharbeit 2: erst trimmen, dann ausweichen |
| R2-2 | sollte | Eine Umbenennung zwischen Seitenaufruf und Absenden ergibt mit ID `NULL`. | Entschieden, KEIN Befund: der Namensvergleich schützt davor, dass eine veraltete versteckte ID an einem von Hand geänderten Namen hängt. Die Umbenennung fällt in dieses Minutenfenster und ist selten; der Name steht trotzdem im Eintrag. |
| R2-3 | sollte | Die Zusicherung zum zweiten INACTIVE kann grün sein, ohne dass das Ereignis verarbeitet wurde (der Test setzt den Zustand selbst). | Nacharbeit 2: `pin_generation` bzw. das Ergebnis `updated` zusichern |
| R2-4 | sollte | Der 409-Text rät „bitte erneut senden“. Ein erneuter Klick setzt den Schutz zurück und schickt eine zweite Mail. | Teilweise: der Rat hängt schon am Ausbleiben einer Bestätigung. Nacharbeit 2 macht sie greifbar: WO sieht der Trainer, dass die Mail raus ist? Das gehört in den Text. |
| R2-5 | sollte | `routes/mitarbeiter-auth.js:322` loggt die Adresse unmaskiert (N1-H1). Die Zusicherung prüft nur die Import-Zeilen. | Nacharbeit 2: an der Quelle maskieren (gemeinsamer Helfer), die Zusicherung über alle Logzeilen des Laufs. N1-H1 fällt damit von der Sammelliste. |
| R2-6 | Anmerkung | Der Kommentar sagt „nie 'unbekannt'“, der Code setzt es als Rückfall. | Nacharbeit 2 |
| R2-7 | Anmerkung | Ein Test-UPDATE ohne `studio_id`. | Nacharbeit 2 |
| R2-8 | Anmerkung | `setTimeout(res, 200)` hängt an der Zeit. | Nacharbeit 2: deterministisch warten |

## Nacharbeit 2 (`559c12b`, dazu die Merges C5-A, Q und E2 → `65b8611`), selbst gelesen

- R2-1: erst trimmen, dann ausweichen. Getestet über die echte Route. Gegen den alten Code gemessen 58/4.
- R2-3: Die zweite INACTIVE-Meldung muss verarbeitet sein. Gegenprobe 62/2.
- R2-5: neuer Helfer `core/fehlergrund.js`. Die lokale Kopie in `mitarbeiter.js` ist gelöscht, `mitarbeiter-auth.js:322` maskiert jetzt an der Quelle. Gegenprobe 123/2.
- R2-6, R2-7, R2-8 umgesetzt (R2-8: Gegenprobe 120/7).
- Merge-Fehler: `routes/archiv.js` hatte nach dem Merge zweimal `const { melde }`. Behoben.

Stand: Suite 0, 435 = 435, Lint 0.

**R2-4:** Der Bauende hat widersprochen, und zu Recht. `mail_gesendet_am` wird nirgends angezeigt, ein Verweis im Text liefe ins Leere. Entscheidung: Nacharbeit 3 baut die Anzeige „Servicetechniker benachrichtigt am …“ an jeder aktiven Sperre mit Versandknopf, und der 409-Text verweist darauf.

Ein reines Kürzen des Textes hätte eine Lücke gelassen: Scheitert beim Doppelklick der siegreiche Versand, bliebe die Sperre unbemerkt ohne Benachrichtigung.

## Nacharbeit 3 (`ff345e3`, `6b48db6`, dazu der Merge von C5-E1 → `add06eb`), selbst gelesen

- `mailStandHtml()` hat drei Zustände, gebunden an die FORM des Endzeitstempels, nicht an das Präfix aus G1: offen / „ausgelöst am“ / „wird gerade versendet oder der Stand ist unklar“. Bewusst steht nie „benachrichtigt am“. Der Grund ist gemessen: Der Claim setzt den Zeitstempel VOR dem Versand.
- Die Zeile steht auf der Ergebnisseite (dort mit Knopf) und auf der Geräteseite (ohne Knopf). Der 409-Text verweist auf die Geräteseite und verlinkt sie.
- Kontrast mit `kontrast.js` gerechnet: ≥ 8,8:1. Screenshots unter `/workspace/c5d-shots/`.
- Stand: Suite 0, 441 = 441, Lint 0.

Befund des Bauenden, Sackgasse: Auf der Geräteseite steht „noch nicht benachrichtigt“ ohne Knopf, der 409-Text rät aber zum erneuten Senden. Entscheidung: Nacharbeit 4 setzt dort im Zustand „offen“ mit vorhandener Adresse den Knopf. Die Adresse wird aus derselben Quelle aufgelöst wie in der Route.

Befund des Bauenden zum Claim: Der Teil nach dem Claim (getConfig, `baueHtmlWartung`) liegt ausserhalb jedes try und nimmt den Claim bei einem Wurf nicht zurück. Das gehört zum Mailer und damit zu G1; der Bauende von G1 hat es als Zusatz zu seiner Nacharbeit 1 bekommen.

## Nacharbeit 4 (`1e2e98d`), Lesespur flash (01.10.2026)

N4 ergänzt einen Senden-Knopf im Sperr-Banner der Geräteseite (Zustand „offen“) und legt die Adressauflösung in `loeseServiceMailAdresse` zusammen. Den Diff habe ich selbst gelesen und den Screenshot gesichtet. Laut Bericht ist die Suite grün mit 441 = 441 Dateien.

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| B1 | sollte | Die Adressauflösung auf der Geräteseite liegt im großen try. Fällt die DB aus, endet die ganze Seite in einem 500er. Der POST-Weg fängt denselben Aufruf eigens ab. | trägt | N5 |
| B2 | sollte → Anmerkung | Die Zusicherung „409-Link → Knopf“ sei aus einem anderen Grund grün. Nachgelesen: Sie prüft genau das, was der 409-Text bedingt verspricht (im Zustand „offen“ gibt es einen Knopf), und sie fällt ohne den Knopf (26/2). Falsch ist nur der Kommentar zur Herkunft des Zustands, weil die Route vor dem Versand auf NULL setzt. | Befund nur zum Teil getragen | N5: Kommentar berichtigen, Gegenfall „ausgelöst“ ergänzen |
| B3 | Anmerkung | `test_feature_c5d_stille_fehler.js:477-478`: Der Redirect liefert einen leeren Rumpf, die Zusicherung ist damit immer wahr. | trägt | N5 |
| B4 | Anmerkung | Die Sperr-Abfrage der Geräteseite hat kein `ORDER BY`. Bei Alt-Duplikaten zeigt der Knopf womöglich auf die älteste Sperre. | trägt (`:749-751`) | N5 |
| B5 | Anmerkung | Auf der Geräteseite steht nicht, an wen die Mail geht. | trägt | N5 |
| B6 | Anmerkung | Der CSRF-Kommentar ist falsch: Der Schutz ist origin-/referer-basiert, Formulare tragen kein Token. | trägt | N5 |
| B7 | Anmerkung | Nach dem Senden gibt es keinen Weg zurück zum Gerät. Eine halb ausgefüllte Prüfung geht beim Senden verloren. | trägt | Rückweg in N5, Entwurfsverlust auf die Sammelliste |

## Nacharbeit 5 (`ae1fa72`, `cff24cd`, Merge `d404822`), selbst gelesen

- B1–B7 umgesetzt:
  - B1: eigenes try/catch um die Adressermittlung. Im Fehlerfall laute Zeile und `melde`, die Seite liefert weiter 200.
  - B2: Kommentar berichtigt, Gegenfall „ausgelöst“ ergänzt.
  - B3: Die Zusicherung prüft jetzt 302 und Location. Gemessen: Ohne den Redirect antwortet die Route mit 500, die alte Zusicherung blieb dabei grün.
  - B4: `ORDER BY id DESC LIMIT 1`. Gemessen: Ohne die Sortierung liefert die Abfrage die ältere Sperre.
  - B5: Die Empfängeradresse steht escaped beim Knopf.
  - B6: Kommentar zum CSRF-Schutz berichtigt.
  - B7: Der Link „Zum Gerät“ steht immer da.
- Tests: `c5d_stille_fehler` 178/0, `wartung_mail_seite_status` 31/0. Alle Gegenproben ROT.
- Suite 0, 447 = 447, Lint 0. Der erste Lauf war rot: Kurze negative Muster schlugen in `verengung_static` an. Die Zusicherungen sind jetzt positiv formuliert.
- Screenshots gesichtet.
- **Offen vor dem PR:** master hereinnehmen. Hinzu kommen C5-G2 (#499) und C5-G1, sobald es gemergt ist. Die Leser von `mail_gesendet_am` in C5-D (`mailStandZustand`, das SELECT der Ergebnisseite, das SELECT der Geräteseite) müssen in die Leserliste von `test_feature_defekt_mail_claim_uebergang.js`, danach die Suite neu.
