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
