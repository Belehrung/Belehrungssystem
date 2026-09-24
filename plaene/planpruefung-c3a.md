# Planprüfung C3a — Datenintegrität (24.09.2026)

Papier: `plaene/auftrag-c3a-datenintegritaet.md` (Fassung 1). Spuren: `deepseek-v4-pro` mit Repo-Lesezugriff (effort
high, 10 Runden, ~0,98 $), `kimi-k3` mit Bündel (Papier, `routes/getraenkeanlage.js`, `core/integritaet.js`,
`core/defekt_mailer.js`, Migration 0056, Schema- und Sperrweg-Auszüge). Jeder Befund selbst nachgemessen.

| Nr. | Spur | Befund | Nachgemessen | Einstufung | Folge |
|---|---|---|---|---|---|
| PC3-1 | DeepSeek 1 | `core/defekt_mailer.js` importiert `melde` nicht. | gelesen `:18-25` | gering (Umsetzungsdetail) | Import ausdrücklich im Papier |
| PC3-2 | DeepSeek 2 | Nach einem 23503 ist die Transaktion abgebrochen (25P02) — ein „Rückfall auf Stilllegen“ in derselben `auditTx` ist ohne SAVEPOINT nicht umsetzbar. | PG-Semantik; `core/integritaet.js:163-173` ohne SAVEPOINT | **blockierend** (Papier unausführbar) | Rennen gar nicht erst entstehen lassen: es gibt genau EINEN Schreibweg für Reinigungen (`routes/getraenkeanlage.js:403-405`, in `auditTx`, gemessen per grep) — Zählung IN der `auditTx` des Löschwegs ist damit unter dem Studio-Lock serialisiert. RESTRICT bleibt Rückfalllinie; greift es doch, klare Fehlermeldung, KEIN Rückfall in derselben Transaktion |
| PC3-3 | DeepSeek 3 | Der Wartungs-Mailer `sendeWartungsDefektMail` (`core/defekt_mailer.js:331-346`) hat dieselbe fail-open-Lücke; „nur wenn wortgleich“ liesse sie stehen. | gelesen | mittel | beide Mailer beheben |
| PC3-4 | DeepSeek 4 | Vor der Transaktion laufen drei Autocommits (Namens-Snapshot, `belehrung_freischaltung`, `mitarbeiter_token`, `routes/admin/mitarbeiter.js:983-1016`); bei einem Audit-Wurf sind sie schon geschrieben. | gelesen; der Kommentar dort nennt sie seit S6 „unschädlich, beim nächsten Versuch erneut geschrieben“ | gering | NICHT in die Transaktion ziehen (neue Sperrordnung ohne Nutzen); der Test sichert den Teilzustand ausdrücklich zu (Person da, Tokens weg) |
| PC3-5 | DeepSeek 5 | Zusage steht in `:519`, nicht `:518`. | gelesen | Text | berichtigt |
| PC3-6 | DeepSeek 6 | Stillgelegte Anlagen sind in der Admin-Liste nicht erkennbar und nicht reaktivierbar (`UPDATE getraenkeanlagen` nur in Tests). | Angabe übernommen | mittel | Admin-Liste zeigt „stillgelegt“; Reaktivieren als Knopf (`aktiv=1` + Audit) |
| PC3-7 | DeepSeek 7 | `:375` (Reinigung erfassen) und `:629` (Aufgabe anlegen) filtern `aktiv` nicht — an stillgelegten Anlagen geht weiter beides. | Angabe übernommen | mittel | beide Schreibwege lehnen stillgelegte Anlagen ab (Tablet: Meldung, kein 500) |
| PC3-8 | DeepSeek 8 | Migration ohne Waisenprüfung scheitert auf einer Bestandsdatenbank mit verwaisten Reinigungen generisch. | Vorbild 0056 `:104-118` hat sie | gering | Waisenprüfung mit sprechender Meldung wie 0056 |
| PC3-9 | DeepSeek 9 | `routes/wartung.js:1656`: manueller Neu-Versand setzt `mail_gesendet_am=NULL` mit leerem `catch`. | gelesen | gering | `console.error` + `melde()` |
| PC3-10 | DeepSeek 10 | FK in `core/db.js` und Migration nicht ausdrücklich benannt. | Vorbild 0056 `:42-46` | Anmerkung | Name vorschreiben |
| PC3-11 | DeepSeek 11 | `getraenkeanlage_reinigungen.aufgabe_id` ohne FK; Aufgabe löschen entwertet die Zuordnung im PDF und in der Fälligkeit. | `core/db.js:1987` | mittel (vorbestehend) | Sammelliste C3a-S1 (Aufgabenbezeichnung einfrieren oder deaktivieren statt löschen) — nicht in diesem Beitrag |
| PC3-12 | DeepSeek 12 | Für „Stilllegen“/„Löschen“ je Anlage braucht die Admin-Liste eine Reinigungszählung. | Angabe übernommen | Anmerkung | übernommen |
| PC3-13 | DeepSeek D/1 | Audit-Zusicherungen müssen auf `ereignis` UND `bezug_id` filtern, Test (iv) auf die eingeschobene ID und den Status, `melde`-Zähler `=== 1`. | Papier | mittel (Prüfungen, die nicht rot werden können) | übernommen |

Kimi-Spur: folgt.
