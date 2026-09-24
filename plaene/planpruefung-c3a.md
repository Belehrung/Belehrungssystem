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

## Kimi (zweiter Lauf; der erste riss nach 16 min still ab, s. `ASTRA-LAEUFE.md`)

| Nr. | Befund | Nachgemessen | Einstufung | Folge |
|---|---|---|---|---|
| PC3-14 | Migration muss 0056 VOLLSTÄNDIG übernehmen: Waisen-Vorabzählung UND unbedingter Endzustands-Beweis (genau ein FK, `confdeltype='r'`, kein frühes RETURN); das Ritual „zweimal laufen“ prüft den Endzustand nicht | 0056-Kopf `:51-73` beschreibt beide als blockierende Korrekturen der Erstfassung | **blockierend** (Prüfung, die nicht rot werden kann) | übernommen; Ritual fragt `confdeltype` ab; dritter Wegwerf-Fall „FK fehlt“ → Migration MUSS werfen |
| PC3-15 | Stilllegen ohne Rückweg ist eine Einbahnstrasse (Fehlklick, Doppelanlage, Zombies über Jahre) | = PC3-6 | mittel | Reaktivieren-Knopf (`aktiv=1` + Audit `getraenkeanlage_reaktiviert`), Badge in der Admin-Liste |
| PC3-16 | Erfassung an stillgelegten Anlagen (GET/POST `/anlage/:anlageId` `:265, :375, :386`, Aufgabe `:629`) ungeregelt | = PC3-7, dazu das GET | mittel | GET zeigt „stillgelegt am …“ statt Formular; POST lehnt ab; Aufgabe anlegen lehnt ab |
| PC3-17 | „alle `FROM getraenkeanlagen` (6)“ lässt die beiden entscheidenden JOIN-Stellen aus: Fälligkeit `:83` und PDF `core/pdf-engine.js:1433` | Angabe übernommen | mittel | Tabelle über 8 Stellen |
| PC3-18 | Rennen-Test muss als ROHES INSERT über eine zweite Pool-Verbindung einschieben — über `auditTx`/die Route wartete der Einschub auf den Studio-Lock des Löschwegs (Hänger, im Callback sogar `AUDIT_TX_IN_TX`) | stimmt mit PC3-2 überein | mittel | übernommen; der Test belegt die Rückfalllinie gegen Nicht-App-Schreiber |
| PC3-19 | Gegenprobe V02-2 muss ALLE DREI Artefakte zurücknehmen (Route, `core/db.js`, Migration über eine Wegwerf-DB im alten Schema); sonst bleiben (iii)/(iv) grün | Papier | mittel | übernommen, Teil-Rücknahmen getrennt berichten |
| PC3-20 | fail-closed ohne Wiederholungsweg: eine Defekt-Mail, deren Claim scheitert, geht nie raus | gemessen: kein Sweep, einziger Auslöser ist `POST …/neue-fotos/fertig` (`routes/sichtpruefung.js:5574-5586`); dieselbe Lücke besteht heute schon beim gescheiterten Versand (Claim zurück, niemand ruft erneut) | gering (vorbestehend) | `melde()` mit Studio- und Defekt-ID ist der Ausgang; automatische Wiederholung → Sammelliste C3a-S2 |

## Zahlen

20 Zeilen: DeepSeek 13, Kimi 7, davon 4 Überschneidungen (Stilllegen ohne Rückweg, Erfassung an stillgelegten
Anlagen, Waisenprüfung, Rennen-Test). Nur DeepSeek: der Transaktionsabbruch nach 23503 (blockierend), zweiter Mailer,
`wartung.js:1656`, `aufgabe_id` ohne FK, Audit-Filter der Zusicherungen. Nur Kimi: Endzustands-Beweis der Migration
(blockierend), die zwei JOIN-Stellen, Gegenprobe über alle drei Artefakte, fehlender Wiederholungsweg.
