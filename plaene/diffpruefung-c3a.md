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

## Befunde Runde 1 (CC `scratchpad/c3acc/`, DeepSeek, Kimi)

Grün gemessen (CC): Migration 0062 in allen Ausgangszuständen (automatischer Name, fremder Name, fehlt, zwei FKs,
frische DB gleich benannt), Lesestellen „jetzt fällig“/Tablet/POST Aufgabe, V05-2-Rollback, kein Sperrkreis
(Schreiber auf `mitarbeiter*` einzeln durchgesehen, alle drei Spuren übereinstimmend), 17 Gegenproben rot.

| # | Spuren | Befund | Messung | Schwere | Entscheidung |
|---|---|---|---|---|---|
| C3a-1 | CC B4, DS A, Kimi B1 | Tablet-POST prüft `aktiv` VOR der `auditTx` — Stilllegen dazwischen, Reinigung an stillgelegter Anlage entsteht; Kommentar „kein app-internes Rennen“ stimmt nur für Zählung↔DELETE. Dasselbe beim Aufgaben-POST (DS D) | CC: `200 ok`, `aktiv=0`, Reinigungen 2 | mittel | in der Transaktion erneut prüfen |
| C3a-2 | Kimi B3, selbst gelesen | **Aufgabe löschen** (`admin.post("/aufgabe/:id/loeschen")`) bleibt hartes DELETE ohne Zählung; `getraenkeanlage_reinigungen.aufgabe_id` hat KEINEN FK, die Reinigung speichert die Aufgabenbezeichnung nicht — der Nachweis verliert, WAS gereinigt wurde (PDF LEFT JOIN zeigt „–“). Mit C3a bleiben Nachweise jetzt dauerhaft — dieser Weg entwertet sie | `core/db.js` gelesen (Spalten, kein FK) | mittel–hoch | Aufgabe mit Reinigungen stilllegen (`aktiv=0`) statt löschen, Audit |
| C3a-3 | CC B1 | Monats-PDF entsteht nicht, wenn das Modul abgeschaltet ist, obwohl der Monat Reinigungen hat — der neue Hinweis „stehen im PDF/Archiv“ stimmt dann nicht | CC: Archivzeile false, 1 Reinigung | mittel | PDF erzeugen, sobald der Monat Reinigungen hat |
| C3a-4 | CC B2 | Widerspruchskarte zählt stillgelegte Anlagen und rät zum Löschen — Sackgasse | CC gemessen | gering–mittel | stillgelegte aus Karte/Zählung nehmen |
| C3a-5 | CC B3, DS C, Kimi B2 | „Stilllegen“ an bereits stillgelegter Anlage: zweites Audit, Tablet-Datum springt | CC: Audit 1→2 | gering | Knopf weg, `UPDATE … AND aktiv=1` + `rowCount` |
| C3a-6 | CC B6, Kimi 3, E4 | Mitarbeiter mit Unterschriften löschen: 500 „Datenbankfehler“, die drei vorgelagerten Autocommits (Freischaltung, Token) sind aber schon weg — Mitarbeiter bleibt, hat den Zugang verloren (vorbestehend) | CC: `freisch 1→0, token 1→0`, 500 | mittel | Vorab-Prüfung auf Unterschriften VOR jeder Schreibung, klare Meldung „deaktivieren statt löschen“ |
| C3a-7 | CC B8, DS 2, Kimi 2 | Migration 0062 bricht bei Waisen den App-Start ab (`runMigrations` vor `app.listen`) — erst nach `pm2 reload` sichtbar, alle Studios offline | CC: 3 Waisen → Exit 1 | mittel (Betrieb) | Waisen: FK als `NOT VALID` anlegen + WARNUNG mit Anzahl/IDs statt Abbruch; RESTRICT wirkt für neue Löschungen |
| C3a-8 | E1 | neue Rohwerte `#9aa`, `42px`, Budget angehoben | gelesen | gering | Tokens, Budget zurück |
| C3a-9 | CC B5, DS 5 | Testlücken (Reaktivieren an aktiver Anlage, Abzeichen, Knöpfe, Tablet-Datum, `studioId` im melde-Stub; fünf schwache Zusicherungen) | CC: sechs Mutationen 31/0 bzw. 15/0 | gering | ergänzen |
| C3a-10 | DS B | Stilllegedatum aus UTC (`audit_log.zeit` = `toISOString`) — früh morgens Vortag | gelesen | gering | Berliner Datum |
| C3a-11 | Kimi B4 | `melde()` in den vier neuen catch-Blöcken des Mailers ungeschützt | gelesen | gering | `try { melde } catch {}` wie Vorbild |
| C3a-12 | E2, DS | N+1-Zählung in der Admin-Liste | gelesen | Anmerkung | eine gruppierte Abfrage |
| C3a-13 | CC B7, Kimi B5 | Claim-Fehler: Mail bleibt dauerhaft aus, einziger Ausgang ein Alarm, den die Drossel studioübergreifend zusammenfasst (Signatur ohne Quelle/Studio); scheitert `claimZurueck`, bleibt der Defekt stumm | CC gemessen | Anmerkung | → Sammelliste (C3a-S2 ergänzen, C2-S3) |
| — | DS 1 | kein Leser behandelt die stillgelegte Anlage falsch | — | — | durch CC B1/B2 widerlegt (Monats-PDF, Widerspruchskarte) |
