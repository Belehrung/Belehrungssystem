# Auftrag C3a — Datenintegrität: Löschwege und Mail-Claim (Fassung 1, 24.09.2026)

Arbeitsbaum wird frisch von master angelegt (`/workspace/gymdocu-c3a`, Zweig `fix-c3a-datenintegritaet`).
Einordnung: Standard-Executer — drei abgegrenzte Stellen mit je einem Vorbild im Bestand. Wegen harter Löschung und
append-only (CLAUDE.md „dritte Spur auf benannten Anlass“) läuft die Diffprüfung mit drei Spuren.
Befunde: `plaene/vollpruefung-befunde.md` V02-2, V05-2, V07-1. Nicht hier: V10-3 und R6-13 (Replik-Upsert, eigener
Beitrag C3b), V12-1 samt PP2-K3/K4b (Offline-Warteschlange, eigener Beitrag Q nach dem Merge von P2), V04-2 (zu C2).

## 1. V02-2 — Getränkeanlage löschen reisst Reinigungsnachweise mit (`routes/getraenkeanlage.js:604-610`)

Heute: `DELETE FROM getraenkeanlagen …` ohne Audit; `getraenkeanlage_reinigungen.anlage_id` hat `ON DELETE CASCADE`
(`core/db.js:1983-1996`, keine Migration ändert das). Die Oberfläche verspricht „Reinigungsnachweise bleiben
erhalten“ (`:518`). Unterschriebene Nachweise verschwinden ohne Spur.

Soll (Vorbild `routes/admin/geraete.js` + `migrations/0056_wartung_pruefungen_fk_restrict.sql`):
- **Migration** (nächste freie Nummer): FK `getraenkeanlage_reinigungen.anlage_id` von CASCADE auf RESTRICT, über
  `pg_constraint` strukturell gesucht (Muster 0056/0047, nicht über den Namen). Idempotent. `core/db.js`-`CREATE TABLE`
  gleichzieht (sonst entsteht die Tabelle in frischen Datenbanken wieder mit CASCADE).
  `getraenkeanlage_aufgaben` bleibt CASCADE (Vorlagen, kein Nachweis) — Executer prüft, ob Reinigungen über
  `aufgabe_id` auf Aufgaben verweisen und ob das Löschen der Aufgaben dann Nachweise entwertet; melden.
- **Route**: in `auditTx` (Studio-Lock zuerst, `core/integritaet.js`): gibt es Reinigungen zu dieser Anlage →
  NICHT löschen, sondern `aktiv = 0` (Stilllegen) + Audit `getraenkeanlage_stillgelegt`; gibt es keine → `DELETE` +
  Audit `getraenkeanlage_geloescht`. Scheitert das `DELETE` an RESTRICT (Rennen: Reinigung zwischen Zählung und
  DELETE committet) → Rückfall auf Stilllegen oder klare Meldung, NIE 500 mit Rohfehler.
- **Lesestellen**: Executer zählt alle `FROM getraenkeanlagen` (heute 6 in `routes/getraenkeanlage.js`) und prüft je
  Stelle, ob `aktiv` beachtet wird — Tablet-Liste und Fälligkeit zeigen stillgelegte Anlagen NICHT, Nachweis-/PDF-Wege
  zeigen ihre Reinigungen WEITER. Tabelle „Stelle → Filter ja/nein → Grund“ in den Bericht.
- **Text**: Knopf und Hinweis sagen, was passiert („Stilllegen — Reinigungsnachweise bleiben erhalten“ bzw.
  „Löschen“ bei Anlagen ohne Nachweis). Die Zusage in `:518` wird damit wahr.

## 2. V05-2 — Mitarbeiter hart löschen: Audit ausserhalb der Transaktion (`routes/admin/mitarbeiter.js:1070-1082`)

Heute: `db.tx(...)` mit zwei UPDATEs und dem `DELETE FROM mitarbeiter`, danach `auditAppend(...)` OHNE `t` und ohne
eigene Absicherung. Scheitert das Audit, ist die Person gelöscht ohne Glied in der Kette.

Soll: `auditTx` statt `db.tx`, `auditAppend(…, t)` als letzte Anweisung IN der Transaktion. `auditTx` nimmt den
Studio-Lock als ERSTE Anweisung — das hält die Sperrordnung (CLAUDE.md „Transaktionen und Sperren“: ein UPDATE und
sein Audit in eine Transaktion zu ziehen erzeugt sonst eine neue Lock-Reihenfolge). Executer zählt die anderen
Transaktionen, die `mitarbeiter`, `mitarbeiter_einweisungen`, `mitarbeiter_nachweise` oder `mitarbeiter_token`
sperren, und nennt je eine Zeile: nimmt sie den Studio-Lock vor den Zeilensperren oder danach? Nimmt eine davon
Zeilensperren VOR dem Studio-Lock → melden, nicht bauen.

## 3. V07-1 — Mail ohne Doppelversand-Schutz, wenn der Claim scheitert (`core/defekt_mailer.js:166-178`)

Heute: scheitert das `UPDATE … SET mail_gesendet_am` (z. B. Spalte fehlt), wird `claim = null` und die Mail geht OHNE
Schutz raus, still. `claimZurueck` schluckt seinen eigenen Fehler (`catch (e) {}`) — dann wird eine gescheiterte Mail
nie wiederholt, ebenfalls still.

Soll:
- **Migration**: `ALTER TABLE … ADD COLUMN IF NOT EXISTS mail_gesendet_am TEXT` für jede Tabelle, deren Claim so
  funktioniert (heute `CREATE TABLE`-Stellen `core/db.js:1285, 1388, 1542` — Executer ordnet sie den Tabellen und
  Mailern zu, auch `wartung`-Mailer, falls vorhanden).
- **Claim scheitert** → fail-closed: KEINE Mail, `console.error` + `melde()` (gestubbt im Test), Rückgabe `false`.
  Begründung: eine doppelte Techniker-Mail ist lästig, eine unkontrollierte Serie ist schlimmer, und mit der Migration
  gibt es den Fall nur noch bei echtem DB-Fehler.
- **`claimZurueck` scheitert** → `console.error` + `melde()`; der Defekt bleibt als „gesendet“ markiert, obwohl nichts
  ging — genau das muss im Log stehen, mit Studio- und Defekt-ID.
- Executer prüft alle Mailer mit demselben Muster (Claim auf eine `…_gesendet_am`-Spalte) und meldet, ob sie dieselbe
  Lücke haben; Behebung nur, wenn wortgleich.

## Tests

- V02-2: (i) Anlage mit Reinigung → Knopf → Anlage `aktiv=0`, Reinigung da, Audit-Glied da; (ii) Anlage ohne
  Reinigung → gelöscht, Audit-Glied da; (iii) RESTRICT direkt: `DELETE` per SQL auf eine Anlage mit Reinigung wirft
  `23503`; (iv) Rennen wie im 0056-Test: Reinigung zwischen Zählung und DELETE einschieben (Stub auf die Zählung) →
  Nachweis überlebt, Antwort ist kein Rohfehler.
- V05-2: Audit-Wurf in der Transaktion (Stub) → Mitarbeiter NICHT gelöscht (Rollback), Einweisungen unverändert.
  Positivkontrolle: ohne Stub gelöscht UND Audit-Glied da.
- V07-1: Claim wirft → `sendMail`-Stub NICHT gerufen, `melde`-Stub gerufen; Claim gelingt → genau ein Versand;
  `claimZurueck` wirft → `melde`-Stub gerufen.
- **Gegenproben** je Stelle (alten Code zurück → ROT; `cp`-Rücknahme, `diff` EXIT 0), Zahlen wörtlich.
- **Zustandsfrage** für den Bericht: welcher Zustand entsteht, den es vorher nicht gab? (stillgelegte Anlagen mit
  offenen Aufgaben, Mitarbeiter-Löschung, die jetzt an einem Audit-Fehler scheitert, Defekte ohne Mail)
- Volle Suite nach Ritual, Dateizahl-Ritual; Migration gegen eine Wegwerf-DB mit ALTEM Schema (CASCADE, ohne Spalte)
  UND gegen ein frisches Schema, je zweimal (Idempotenz).

-- Ende des Auftrags --
