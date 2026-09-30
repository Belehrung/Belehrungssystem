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
