# Offene Befunde C5-D (für die Extrarunde C6)

Die Einzelheiten stehen in `diffpruefung-c5d.md`.

- **D-E1 (Bestand):** `/module/wartung/sperre/:id/mail` setzt `mail_gesendet_am` vor jedem Senden zurück. Zwei parallele Klicks setzen gegenseitig den Claim zurück, sodass beide senden können.
- **F6 (Betreiberfrage, Bestand):** Ersthelfer-Nachweise bekommen `inaktiv_seit` nur beim Löschen eines Mitarbeiters, nicht beim Deaktivieren (Admin oder Webhook). Ihre Löschfrist (`core/retention.js:392`) läuft für deaktivierte Mitarbeiter deshalb nie. Soll die Frist ab der Deaktivierung laufen?
- **Randleerraum in `mitarbeiter.name`:** Altdaten aus dem Webhook können ihn tragen. Ab C5-D wird beim Vergleich getrimmt. Die Daten selbst zu bereinigen braucht eine Migration.
- **Wartungsprüfung ohne Idempotenz (Bestand):** Ein erneutes Absenden legt eine zweite Prüfung an.
- **N1-H1** (Bericht der Nacharbeit 1): `routes/mitarbeiter-auth.js` (`sendeMitarbeiterEinladung`) schreibt `console.error('Mitarbeiter-Einladung Mail-Fehler:', e.message)` unmaskiert ins Serverlog. Ein SMTP-Fehlertext kann dabei die Empfängeradresse enthalten.
- **N1-H2**: Im Verbandbuch wird das ID-Format am ungetrimmten Rohwert geprüft; `" 5 "` wird mit 400 abgelehnt. Das Formular sendet die ID ohne Leerraum, der Fall entsteht also nur bei handgebauten Anfragen.
