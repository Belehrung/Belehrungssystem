# Diffprüfung C6-D1 (Eingabeprüfung), Stand `9d1ef62`

Eigene Prüfung: Produktivcode gelesen (`core/pdf-pfad.js`, `core/pdf-loeschung.js`, `core/db-fehler.js`,
`routes/pdf-altform.js`, `routes/archiv.js`, `routes/bezirk-archiv.js`, `routes/admin/einstellungen.js`,
`routes/getraenkeanlage.js`, `routes/auth.js`, Löschwege in `geraete.js`, `mitarbeiter.js`, `demo_daten.js`,
Migration 0067). Die Wurzelprüfung deckt alle Kandidaten von `resolvePdfPfad` ab (`/var/www/studios/<sub>/pdf/…`
nur, wenn `dateipfad` mit `pdf/` beginnt; so beschreibt es der Dateikopf). Laut Bericht ist die Suite grün mit
472 = 472.

## Lesespur flash (Lauf 1 abgebrochen, Lauf 2: 4 Befunde)

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| 1 | sollte | Das PIN-Setzen (`routes/mitarbeiter-auth.js:404`, `:411`) reicht `req.body.pin` roh an `pinSchwach` und `bcrypt.hash`. Ein Ein-Element-Array besteht die Prüfung und endet als 500. | trägt | N1 |
| 2 | Anmerkung | `POST /neue-fotos/fertig` (`routes/sichtpruefung.js:5759`) hat keine int4-Grenze, die GET-Geschwisterroute (`:3605`) schon. | trägt | N1 |
| 3 | Anmerkung | Ist die Regel aus 0067 NOT VALID, prüft PostgreSQL sie bei jedem UPDATE einer Altzeile. Eine solche Zeile ist bis zur Bereinigung blockiert. | trägt (im Migrationskopf benannt) | N1: Bei Verstößen wird die Regel NICHT angelegt. Eine NOTICE nennt die Zahl, der Schema-Drift-Wächter zeigt das Fehlen. Die Route prüft weiter. |
| 4 | Anmerkung | Sieben PDF-Export-Routen (`routes/admin/geraete.js:824-902`) prüfen `von`/`bis` nur über das Format. | trägt (harmlos, TEXT-Filter) | N1: `istGueltigesKalenderdatum` wie in den übrigen Formularen |
