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
