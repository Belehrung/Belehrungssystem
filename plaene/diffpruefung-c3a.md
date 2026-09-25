# Diffprüfung C3a (Datenintegrität: V02-2, V05-2, V07-1)

Zweig `fix-c3a-datenintegritaet`, Kopf `f75cea1` (Bau `5d79f7f` + zwei Nachzüge der handgepflegten Register), Diff
gegen master `00bd9c9`. Suite 394 = 394 grün, Lint EXIT 0 (Bericht des Ausführenden, Logs `scratchpad/full-suite-4.log`).
Spuren (harte Löschung → drei): Claude ausführend (`gymdocu-c3a-cc`, eigene DB), `deepseek-v4-pro` mit Repo-Lesezugriff,
`kimi-k3` mit Bündel (Endstand der geänderten Dateien plus Leser der Getränkeanlagen-Tabellen).

## Eigene Lesung

| # | Befund | Fundstelle | Schwere |
|---|---|---|---|
| C3a-E1 | Zwei NEUE Rohwerte, Budget angehoben statt Token: `style="color:#9aa"` (Tablet-Seite der stillgelegten Anlage) und `font-size:42px` (Fehlerseite Reset). Verstösst gegen „keine neuen Farb-/Schriftgrössenwerte direkt in einen `<style>`“ (Budget ist ein Einfrierwerkzeug, keine Freigabe) | `routes/getraenkeanlage.js` (GET `/anlage/:anlageId`), `routes/wartung.js` (`/sperre/:id/mail`), `test/rohwert-budget.json` | gering |
| C3a-E2 | Admin-Liste: eine `COUNT`-Abfrage je Anlage in der Schleife | `routes/getraenkeanlage.js` admin GET | Anmerkung |
| C3a-E3 | Zwei weitere `ALTER TABLE … ADD COLUMN IF NOT EXISTS` in der SCHEMA-Transaktion von `db.init()` (DB-INIT: exklusive Sperre bei jedem Start, auch ohne Arbeit) | `core/db.js` (`mail_gesendet_am`) | Anmerkung → DB-INIT |
| C3a-E4 | Offen vom Ausführenden gemeldet: `unterschriften.mitarbeiter` ohne ON-DELETE-Klausel — Mitarbeiterlöschung scheitert, sobald Unterschriften existieren (vorbestehend) | `core/db.js:1237` | zu messen: was sieht der Admin? |

Zustandsfrage an die Spuren: eine STILLGELEGTE Anlage (aktiv=0, mit Nachweisen) gab es vorher nicht (sie wurde gelöscht).
Wer liest `getraenkeanlagen`/`getraenkeanlage_aufgaben` ohne `aktiv`-Filter und zieht daraus einen falschen Schluss
(Fälligkeit, „jetzt fällig“, Jahrescheck, Prüfbericht, Monats-PDF, Einrichtung)?
