# C1 — die drei entschiedenen Befunde aus der Vollprüfung (V01-1, V09-1, V15-2)

Stand GymDocu master `946647a`. Einordnung: Standard-Executer; drei getrennte Commits. Betreiber-Entscheidungen vom
24.09.2026 (`plaene/offene-befunde-vollpruefung.md`).

## 1. V01-1 — S20-Werkzeug stilllegen

Befund: `S20-migrate.js` mit REPLACE löscht für ein Studio aus JEDER Tabelle mit `studio_id`, auch aus zentral
entstandenen Tabellen (QR-Nummernbuch, Bestellungen, Audit, PDF-Jobs). `golive-studio.sh` setzt `REPLACE=1`.
Entscheidung: Alle Altstudios sind umgezogen, neue Studios kommen über die Provisionierung → das Werkzeug wird
stillgelegt.
Auftrag: `S20-migrate.js` und `golive-studio.sh` brechen gleich zu Beginn mit einer klaren Meldung und Exit ≠ 0 ab
(„stillgelegt am 24.09.2026, …“). Die Dateien bleiben liegen (Deaktivieren statt Löschen). `test_feature_s20_migrate_functional.js`
wird fachlich umgestellt: Er sichert die Verweigerung zu, beide Einstiege, und dass KEINE Datenbankverbindung
aufgebaut wird. Vorher alle Verweise suchen (Doku, `ops/`, `package.json`-Skripte, Deploy) und melden. Damit sind
V01-2, V01-9 und V01-10 gegenstandslos; das kommt in den Bericht.

## 2. V09-1 — QR-Vergabe fail-closed bei kaputtem Journal UND zurückliegender Datenbank

Befund (`core/qr-token.js`, Leiter ab `if (journal.kaputteZeilen > 0)`): Kaputte Journalzeilen lösen nur einen
Vorfall aus. Ist ausgerechnet die höchste Zeile kaputt und die Datenbank zurückgespielt, vergibt `chargeAnlegen()`
Nummern, die schon verklebt sind.
Entscheidung: fail-closed, wenn es kaputte Zeilen gibt UND die Datenbank hinter dem lesbaren Journal liegt
(`dbMax < journal.hoechste`, auch `dbMax == null` bei `journal.hoechste != null`). Sonst bleibt es beim Vorfall, und
die Vergabe läuft weiter. Ohne kaputte Zeilen ändert sich nichts.
Auftrag: Der neue Zweig wirft `QrLageUngeklaertFehler`, mit Text im Stil der vorhandenen. Tests über die echte
Funktion für alle vier Kombinationen (kaputt ja/nein × DB hinter/nicht hinter). Vorher prüfen, welche Aufrufer
den Fehler anzeigen: Vorschau in `tools/qr-charge.js` und die schreibenden Wege. Keine neue globale Sperre
einführen.

## 3. V15-2 — die NEUESTE Unterschrift bestimmt die Gültigkeit

Befund: Die Gültigkeit einer Belehrung wird über `MAX(gueltig_bis)` bestimmt. Ein Unterschied zur Entscheidung
entsteht, wenn eine neuere Unterschrift FRÜHER abläuft als eine ältere (geänderte Gültigkeitsdauer).
Entscheidung: Die neueste Unterschrift zählt.
Fundorte (`git grep` auf master, vollständig nachmessen): `routes/admin/dashboard.js:70, :223`,
`routes/belehrungen.js:716, :1851, :1869, :1877-1883, :1954-1959, :2741`, `server.js:927`.
Auftrag: EINE zentrale Definition der „neuesten Unterschrift“ je (studio, mitarbeiter, belehrung), sortiert nach
`datum DESC, id DESC`. Das kann eine SQL-Sicht per Migration sein (dann für alle Studios) oder ein einziger
JS-Baustein; wähle und begründe. Alle Fundorte benutzen sie. Die NULL-Semantik je Fundort (unbefristet, `COALESCE`)
wird vorher als Tabelle gemeldet und bleibt erhalten. Dazu ein Wächter: kein `MAX(…gueltig_bis)` über
`unterschriften` mehr im Bestand. Positivkontrolle an einer Fixtur; die Dateimenge wird gegen `git ls-files`
gehalten. Test: Daten, in denen die neuere Unterschrift früher abläuft. Heute liefert das „gültig“, nach der
Änderung „abgelaufen“, und zwar an JEDEM Fundort (Übersicht, Dashboard, Tablet, Mail).

## Gegenproben (je einzeln ROT und zurück GRÜN, wörtlich)

(a) Die Stilllegung aus `S20-migrate.js` entfernen → Verweigerungstest ROT.
(b) Die neue Bedingung in `qr-token.js` entfernen → Test „kaputt + DB hinter Journal“ ROT; die drei übrigen Fälle
    bleiben GRÜN.
(c) Einen Fundort auf `MAX(gueltig_bis)` zurücksetzen → dessen Verhaltenstest ROT UND Wächter ROT.
