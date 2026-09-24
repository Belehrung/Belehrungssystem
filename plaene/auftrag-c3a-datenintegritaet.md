# Auftrag C3a — Datenintegrität: Löschwege und Mail-Claim (Fassung 2, 24.09.2026)

Arbeitsbaum `/workspace/gymdocu-c3a`, Zweig `fix-c3a-datenintegritaet`, Basis master `946647a` (vor dem Bau auf den
dann aktuellen master heben). Einordnung: Standard-Executer — drei abgegrenzte Stellen mit je einem Vorbild im Bestand.
Wegen harter Löschung und append-only läuft die Diffprüfung mit drei Spuren. Befunde: `plaene/vollpruefung-befunde.md`
V02-2, V05-2, V07-1. **Fassung 2** nach der Planprüfung (`plaene/planpruefung-c3a.md`, 20 Zeilen); Änderungen mit
PC3-Nummern. Nicht hier: V10-3/R6-13 (C3b), V12-1 samt PP2-K3/K4b (Q, nach P2), V04-2 (C2).

## 1. V02-2 — Getränkeanlage löschen reisst Reinigungsnachweise mit (`routes/getraenkeanlage.js:604-611`)

Heute: `DELETE FROM getraenkeanlagen …` ohne Audit; `getraenkeanlage_reinigungen.anlage_id` hat `ON DELETE CASCADE`
(`core/db.js:1996`, keine Migration ändert das). Die Oberfläche verspricht „Reinigungsnachweise bleiben erhalten“
(`:519`). Unterschriebene Nachweise verschwinden ohne Spur.

**Migration** (nächste freie Nummer): FK `getraenkeanlage_reinigungen.anlage_id` → `ON DELETE RESTRICT`, und zwar
**0056 vollständig** (PC3-14, PC3-8, PC3-10):
- strukturelle Suche über `pg_constraint` (Spalte + Zieltabelle), nicht über den Namen;
- **Waisen-Vorabzählung** vor `ADD CONSTRAINT` mit sprechendem Abbruch (Anzahl + bis zu 20 Beispiel-IDs);
- **unbedingter Endzustands-Beweis** am Ende, ohne frühes RETURN: genau ein FK dieser Spalte auf `getraenkeanlagen`,
  `confdeltype = 'r'`; sonst Abbruch — der Fall „FK fehlt / anderes Löschverhalten“ ist von „schon umgestellt“ zu
  unterscheiden;
- FK ausdrücklich benannt (`getraenkeanlage_reinigungen_anlage_id_fkey`), `core/db.js`-`CREATE TABLE` mit demselben
  Namen und `RESTRICT` gleichziehen.
`getraenkeanlage_aufgaben` bleibt CASCADE (Vorlagen). `aufgabe_id` ohne FK (PC3-11) → Sammelliste, nicht hier.

**Löschweg** in `auditTx` (Studio-Lock zuerst):
- Reinigungen zählen IN der Transaktion. Es gibt genau EINEN App-Schreibweg für Reinigungen
  (`routes/getraenkeanlage.js:403-405`, selbst `auditTx`) — er ist damit unter dem Studio-Lock serialisiert, das
  Rennen gibt es app-intern nicht (PC3-2, PC3-18).
- Reinigungen vorhanden → `aktiv = 0` (Stilllegen) + Audit `getraenkeanlage_stillgelegt`; keine → `DELETE` + Audit
  `getraenkeanlage_geloescht`.
- Greift RESTRICT trotzdem (Nicht-App-Schreiber: Import, direktes SQL) → die Transaktion ist abgebrochen (25P02),
  **kein Rückfall in derselben Transaktion**; Antwort: klare Meldung („Anlage hat inzwischen Nachweise — nicht gelöscht,
  bitte Seite neu laden“), Status 409, kein Rohfehler (PC3-2).

**Reaktivieren** (PC3-6, PC3-15): Knopf an stillgelegten Anlagen, `aktiv = 1` + Audit `getraenkeanlage_reaktiviert` in
`auditTx`. Admin-Liste zeigt „stillgelegt“ als Kennzeichen; der Lösch-/Stilllege-Knopf beschriftet sich je Anlage nach
der Reinigungszählung („Stilllegen — Reinigungsnachweise bleiben erhalten“ / „Löschen“) (PC3-12).

**Erfassung an stillgelegten Anlagen** (PC3-7, PC3-16): `GET /anlage/:anlageId` (`:265`) zeigt „Anlage stillgelegt am
… — Nachweise im PDF/Archiv“ statt des Formulars; `POST /anlage/:anlageId` (`:375`) lehnt ab (400, JSON- und
HTML-Weg wie die übrigen Fehler der Route, kein INSERT, kein Audit); `POST /aufgabe` (`:629`) lehnt ab.

**Lesestellen** (PC3-17): acht Stellen — die sechs `FROM getraenkeanlagen` in `routes/getraenkeanlage.js`
(`:221, :265, :375, :476, :606, :629`) PLUS der JOIN in der Fälligkeit (`:83`, `a.aktiv = 1` schon da) und der JOIN
im PDF (`core/pdf-engine.js:1433`, bewusst OHNE Filter: Nachweise stillgelegter Anlagen bleiben im PDF). Tabelle
„Stelle → Filter ja/nein → Grund“ in den Bericht.

## 2. V05-2 — Mitarbeiter hart löschen: Audit ausserhalb der Transaktion (`routes/admin/mitarbeiter.js:1070-1084`)

`auditTx` statt `db.tx`, `auditAppend(…, t)` als letzte Anweisung IN der Transaktion. Die drei vorgelagerten
Autocommits (Namens-Snapshot, `belehrung_freischaltung`, `mitarbeiter_token`, `:983-1016`) bleiben, wo sie sind — ihr
Kommentar nennt sie seit S6 „unschädlich, beim nächsten Versuch erneut geschrieben“; sie in die Transaktion zu ziehen,
erzeugte neue Sperrfolgen ohne Nutzen (PC3-4). Die Planprüfung fand keinen Weg, der Zeilensperren auf
`mitarbeiter*` VOR dem Studio-Lock nimmt (beide Spuren); der Executer bestätigt das für `routes/api.js:280-291` und
`routes/mitarbeiter-auth.js:221` (bei beiden offen) mit je einer Zeile.

## 3. V07-1 — Mail ohne Doppelversand-Schutz, wenn der Claim scheitert

Beide Mailer (PC3-3): `sendeEineDefektMail` (`core/defekt_mailer.js:166-180`) und `sendeWartungsDefektMail`
(`:331-346`) — dasselbe Muster, nicht wortgleich; beide beheben. Dazu der manuelle Neu-Versand
`routes/wartung.js:1656` (PC3-9).
- **Migration**: `ALTER TABLE … ADD COLUMN IF NOT EXISTS mail_gesendet_am TEXT` für `geraete_defekte` und
  `geraete_sperren` (Claim-Tabellen; `pdf_archiv` `core/db.js:1285` prüft der Executer und meldet, ob dort ein Claim
  nach demselben Muster existiert).
- **Claim scheitert** → fail-closed: KEINE Mail, `console.error` + `melde(e, { studioId }, 'defekt_mailer:claim')` mit
  Defekt- bzw. Sperr-ID im Text, Rückgabe `false`. Import `const { melde } = require('./error-tracker')` (PC3-1).
  Einen automatischen Wiederholungsweg gibt es heute schon für den gescheiterten Versand nicht (PC3-20) —
  Sammelliste C3a-S2, nicht hier; `melde()` ist der Ausgang.
- **`claimZurueck` scheitert** → `console.error` + `melde()`: der Datensatz steht als „gesendet“, obwohl nichts ging.
- **`wartung.js:1656`** (Reset vor manuellem Versand) scheitert → `console.error` + `melde()`, und der Versand
  unterbleibt (sonst liefe er auf einem Claim, der gar nicht zurückgesetzt wurde).

## Tests

- V02-2: (i) Anlage mit Reinigung → Knopf → `aktiv=0`, Reinigung (konkrete ID) da, Audit-Glied mit
  `ereignis='getraenkeanlage_stillgelegt'` UND `bezug_id` (PC3-13); (ii) ohne Reinigung → gelöscht, Audit-Glied
  `getraenkeanlage_geloescht` + `bezug_id`; (iii) RESTRICT direkt: `DELETE` per SQL auf eine Anlage mit Reinigung →
  `23503`; (iv) Rückfalllinie: Zählung per Stub auf 0, Reinigung als ROHES INSERT über eine zweite Pool-Verbindung
  (kein `auditTx`) eingeschoben → Status 409, Anlage UND eingeschobene Reinigung (ID) da, kein Audit-Glied (PC3-18);
  (v) Reaktivieren → Anlage wieder in Tablet-Liste und Fälligkeit, Audit-Glied; (vi) stillgelegt: GET zeigt den
  Hinweis, POST Reinigung → 400 und keine neue Zeile, POST Aufgabe → abgelehnt.
- Migration: Wegwerf-DB mit ALTEM Schema (CASCADE) → danach `confdeltype = 'r'` abgefragt; frisches Schema → ebenso;
  je zweimal (Idempotenz); dritter Fall FK entfernt → Migration WIRFT; vierter Fall Waise vorhanden → Migration wirft
  mit Anzahl und ID (PC3-14).
- V05-2: Audit-Wurf in der Transaktion (Stub) → Mitarbeiter NICHT gelöscht, Einweisungen/Nachweise unverändert; der
  Teilzustand wird AUSDRÜCKLICH zugesichert (Tokens weg, Freischaltungen weg, Namens-Snapshot geschrieben) (PC3-4).
  Positivkontrolle ohne Stub: gelöscht UND Audit-Glied `mitarbeiter_geloescht` + `bezug_id`.
- V07-1 (je Mailer): Claim wirft → `sendMail`-Stub `=== 0`, `melde`-Stub `=== 1`; Claim gelingt → genau ein Versand;
  `claimZurueck` wirft → `melde`-Stub `=== 1`; `wartung.js:1656`-Reset wirft → kein Versand, `melde` `=== 1`.
- **Gegenproben** je Stelle (alter Code → ROT; `cp`-Rücknahme, `diff` EXIT 0). Für V02-2 ALLE DREI Artefakte (Route,
  `core/db.js`, Migration über eine Wegwerf-DB im alten Schema); Teil-Rücknahmen getrennt berichten, mit Erwartung:
  (i)/(ii)/(v)/(vi) rot bei Route alt, (iii)/(iv) rot bei Schema alt (PC3-19).
- **Zustandsfrage** für den Bericht: welcher Zustand entsteht, den es vorher nicht gab? — je Stelle ein Satz.
- Volle Suite nach Ritual, Dateizahl-Ritual.

-- Ende des Auftrags --
