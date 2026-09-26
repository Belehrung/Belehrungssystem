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

## Runde 2 (25.09.2026, Kopf `f40936b`, Nacharbeits-Diff `f75cea1..f40936b`)

Nacharbeit 1 gebaut: Suite 394 = 394 grün (zweiter Lauf), Lint 0. Diff gelesen. Eigene Lesung: Tablet-POST prüft in der
Transaktion nur die Anlage, nicht die Aufgabe; die 409-Seite „deaktivieren statt löschen“ zeigt auf keinen Weg (der
Wortlaut stammt aus MEINEM Auftrag, §6 — CLAUDE.md „Ein Verweis kann in eine Sackgasse zeigen“); Zählung ausserhalb
der Transaktion; NOT VALID nur über `convalidated` sichtbar. Spuren: Claude ausführend (`gymdocu-c3a-cc`,
`scratchpad/c3acc2/`), DeepSeek mit Repo-Lesezugriff.

| Nr | Quelle | Befund | Nachmessung | Schwere | Behebung |
|---|---|---|---|---|---|
| C3a2-1 | CC B1, DS B1, E | Tablet-POST: Aufgabe weder vorab auf `aktiv` noch in der Transaktion geprüft — stillgelegte Aufgabe nimmt Reinigungen an; Rennen mit hartem Löschen erzeugt den „–“-Nachweis | CC gemessen: (i) 1 → 2 Reinigungen, (ii) PDF-Zeile „- Trainer II -“, ohne Einschub 2/13/8 Waisen je 30 Versuche | blockierend | Vorab `aktiv=1`, in der Transaktion erneut lesen |
| C3a2-2 | CC B2, DS B2/B4, E | 409 „deaktivieren statt löschen“: kein Deaktivieren in der Oberfläche; Bestätigungsdialog verspricht weiter Löschen; ausgeschiedener MA behält PIN, Links, Freischaltung | CC gemessen (m3, Seite ohne Formular) | mittel | Deaktivieren/Reaktivieren für Mitarbeiter, Dialog und Knopf nach `sigCount` |
| C3a2-3 | CC B3, DS B3 | Unterschrift zwischen Zählung und DELETE → 500, Freischaltung/Token weg, MA bleibt | CC gemessen (m8) | mittel | Reihenfolge so, dass ein gescheitertes DELETE nichts entzieht; 23503 → 409 |
| C3a2-4 | CC B4, DS B6/B9 | NOT VALID praktisch unsichtbar: WARNING nur `console.log` (Log wird beim Deploy geleert), kein `melde`, `checkMigrations` ok, niemand liest `convalidated`; Kommentar nennt `server.js` statt `core/migrate.js`; Migrationspfad-Test prüft `convalidated` nicht (Mutation „immer NOT VALID“ grün) | CC gemessen (m9, MIG1) | mittel | WARNING → `melde`; Test `convalidated=true` ohne Waisen; Kommentar |
| C3a2-5 | CC B4 | Erzwungenes Monats-PDF zählt Waisen (ohne JOIN), das PDF (INNER JOIN) ist dann leer | CC gemessen | gering | dieselbe Verknüpfung wie das PDF |
| C3a2-6 | CC B5, DS B7/B8 | Mutationen grün: Knopf/Abzeichen an stillgelegter Aufgabe, Zählung je Aufgabe, Monatsgrenze der Erzwingung, Escaping der 409-Seite, zweiter `melde`-try; PDF-Zusicherung prüft eine KOPIE der Abfrage; N+1-Regex zu eng | CC gemessen, DS gelesen | gering | je ein Test gegen den echten Weg |
| C3a2-7 | CC B6, DS B10 | stillgelegte Aufgabe ohne Rückweg; Tablet meldet „stillgelegt“ auch für eine im Rennen GELÖSCHTE Anlage; Tablet sagt „keine Aufgaben angelegt“, wenn nur stillgelegte da sind | CC gemessen | gering | Reaktivieren für Aufgaben; Texte |
| C3a2-8 | CC B6 | `vormonatNachholen` zählt keine Reinigungen (vorbestehend) — „stehen im PDF/Archiv“ hält beim Ausfall des Monatslaufs nicht | CC gemessen | gering | → Sammelliste C3a-S4 |
| C3a2-9 | DS B5 | Waisenprüfung in 0062 ohne `studio_id` (Reinigung, deren `anlage_id` einem fremden Studio gehört, gilt nicht als Waise) | gelesen | Anmerkung | → Sammelliste C3a-S5 |

Zahlen: CC 6 Befundgruppen + Mutationsliste, DS 10; 9 Zeilen, keiner gefallen (DS B3 von „blockierend“ auf mittel:
enges Fenster, Folge ohne Nachweisverlust). Nur DS: Test prüft Kopie der PDF-Abfrage, Regex, Waisen ohne `studio_id`.
Nur CC: Nachholweg, leeres PDF bei Waisen, Tablet-Texte. Nacharbeit 2: `plaene/auftrag-c3a-nacharbeit2.md`.

## Runde 3 (Nacharbeit 2, Kopf `ed5f6a5`; Sparmodus: Lesespuren, keine Claude-Spur)

Spuren: DeepSeek mit Repo-Lesezugriff (ganzer Diff); `gpt-6-sol` ABGEBROCHEN (Lesebudget 614.400 Bytes überschritten,
kein Bericht). Suite auf `ed5f6a5` grün (399 = 399), Lint 0. Bericht und Gegenproben des Bauenden fehlen (Neustart).

| Nr | Befund | Nachgesehen | Schwere (vorläufig) |
|---|---|---|---|
| C3a3-1 | Magicline-Webhook setzt einen vom Admin deaktivierten Mitarbeiter bei jedem `EMPLOYEE_CREATED/UPDATED` ohne Status `INACTIVE` still wieder `aktiv=1`, ohne Audit (`routes/webhooks.js:282`, UPDATEs `:324-336`) | ja, gelesen | blockierend — Entscheidung nötig: wer gewinnt, Admin oder Magicline? |
| C3a3-2 | derselbe Effekt über `/v1/mitarbeiter/sync` (`routes/api.js:279`, `aktiv = 1` fest) | ja, gelesen | sollte behoben werden |
| C3a3-3 | Unterschrift liest den Mitarbeiter ohne `aktiv=1` (`routes/belehrungen.js:843`); bei ausgeschalteter Tablet-Sperre unterschreibt ein Deaktivierter weiter | ja, gelesen | sollte behoben werden |
| C3a3-4 | leeres `catch {}` beim Aufräumen nach dem Löschen (`routes/admin/mitarbeiter.js:1184-1186`) = C3a-S6 | Sammelliste | sollte behoben werden |
| C3a3-5 | PIN-direkt/Einladen für Deaktivierte sichtbar und wirksam (`:218-222`, `:867`); Aufgabe-Reaktivieren ohne ID-Wache (`routes/getraenkeanlage.js:1009`) und ohne `rowCount` (`:1011`) | nein | gering |

## Runde 4 (Nacharbeit 3, Kopf `e2f4cc7`; Sparmodus: eine Lesespur)

Bauender: Suite 401 = 401, Lint 0, Gegenproben GP1–GP5 rot. Eigene Lesung (Webhook, Sync, Migration 0064): Fundort
Webhook-Race. DeepSeek mit Repo-Lesezugriff bestätigt ihn.

| Nr | Befund | Nachgesehen | Schwere |
|---|---|---|---|
| C3a4-1 | Webhook-Upsert liest `vorh` ausserhalb jeder Transaktion, Autocommit-Zweig schreibt `aktiv` ohne Bedingung → Admin-Deaktivierung dazwischen wird still aufgehoben (`aktiv=1, manuell_deaktiviert=1`, kein Audit); der Sync liest nach dem Studio-Lock und ist nicht betroffen | selbst gelesen (`routes/webhooks.js:296-378`) | blockierend |
| C3a4-2 | Sync-Kernfall-Test prüft nur Status 200; die Route liefert 200 auch bei gesammelten Fehlern → grün ohne Verarbeitung | gelesen | sollte behoben werden |
| C3a4-3 | Sync serialisiert jeden Eintrag über den Studio-Lock; `pin_generation` steigt bei jedem ACTIVE-Webhook für manuell Deaktivierte | gelesen | Anmerkung |

Nacharbeit 4: `plaene/auftrag-c3a-nacharbeit4.md`.
