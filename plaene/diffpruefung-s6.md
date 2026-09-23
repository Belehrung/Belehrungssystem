# Diffprüfung S6 (Generationszähler) — `f4c0f07..c74bc7e`

Stand 23.09.2026. Lesespur `gpt-6-sol` (Bündel: Diff + Umkreis, 40 Lesungen,
8,06 $). Jeder Befund vom Haupt-Agenten am Quelltext nachgemessen; Spalte
„getragen" ist MEINE Messung, nicht die des Prüfers. Ausführende Claude-Spur
(54 Angriffe über echte Routen, Mutationen) unten.

## Lesespur

| # | Schwere | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| L1 | blockierend | Verbrauchs-UPDATE (`routes/mitarbeiter-auth.js` ~365) prüft `pin_generation` der Tokenzeile NICHT; ein vor der S20-Entwertung geladener Token wird danach trotzdem verbraucht, Mitarbeiter-CAS sieht Generation 0 = 0 | gelesen: `WHERE studio_id=$1 AND id=$2 AND verwendet=0 AND gueltig_bis>$3`, keine Generationsbedingung | ja |
| L2 | blockierend | S20-Import nicht gegen parallelen Erzeuger serialisiert; Mail kann an die E-Mail aus dem ALTEN Vorab-SELECT gehen, während unter derselben ID eine andere Person steht | S20 hat `BEGIN` (:250) … `COMMIT` (:394) ohne `LOCK`; Erzeuger nimmt `ma.email` aus dem Vorab-SELECT und liest beim Nachlesen nur `pin_generation`. Betrieblich schützt `golive-studio.sh` (`pm2 stop` vor S20), `S20-migrate.js` selbst erzwingt es nicht | ja (Code), betrieblich gemildert |
| L3 | mittel | S20-Hausputz kann mit öffentlichem POST einen Kreis Token↔Mitarbeiter schliessen (`40P01`) | hergeleitet, nicht ausgeführt; dieselbe Behebung wie L2 (Tabellensperre als ERSTE Anweisung) schliesst ihn | Herleitung trägt |
| L4 | mittel | Statische Prüfung (d) belegt Position, nicht Ausführung: `if (false) await entwerteTokensNachImport(…)` bleibt grün | `test_feature_pin_generation_static.js:281-286` sucht die Zeichenkette per `indexOf` | ja |
| L5 | mittel | Migrationstest: alle Tokens `gueltig_bis='2099-…'`, Sollzahl aus `FAELLE.filter(…)` — Ablaufbedingung der Betreiber-Zählabfrage unbewacht | gelesen `:53-55`, `:107-115` | ja |
| L6 | mittel | Nachlese-`db.one` wirft nach committetem INSERT → wirksamer Token ohne Mail, Fehlerseite | `:238` steht ungeschützt nach dem Tx-Commit | ja |
| L7 | mittel | Anlegen mit `einladen=1` ignoriert Rückgabe, meldet „Einladung versendet" auch bei `generation_geaendert` | `routes/admin/mitarbeiter.js:383-390` | ja |
| L8 | gering | `keine_email` als Grund, wenn der Mitarbeiter zwischendurch deaktiviert wurde; Oberfläche rät „E-Mail hinterlegen" | `:226`, Test `:454-460` sichert den irreführenden Redirect zu | ja |
| L9 | mittel | `melde(e, null, 'token-hausputz:webhook_deaktivierung')` ohne Studio-Kontext | `routes/webhooks.js:373`; `baueText` liest `req.studioId` (`core/error-tracker.js:232`) | ja |
| L10 | mittel | Kommentar am Löschweg behauptet zu viel: zwischen Token-DELETE (Autocommit) und Mitarbeiter-DELETE kann ein Erzeuger einfügen | Kommentar `routes/admin/mitarbeiter.js:964-975`; der Waise ist aber tot (Leser-JOIN) und wird beim Import entwertet — Befund trägt als KOMMENTAR-, nicht als Sicherheitsbefund | teilweise |
| L11 | gering | Betreiber-Zählabfrage in der Migration ist global, nicht je Studio | `migrations/0059_pin_generation.sql:52-59` ohne `t.studio_id`-Filter | ja |

## Ausführende Claude-Spur

Kein Weg, mit einem ALTEN Token eine PIN zu setzen (53 von 54 Angriffen abgewehrt); der eine
gelungene ist B9 = L2 (S20-REPLACE mit nebenläufigem Erzeuger, nachgestellt). Sonst Prüflücken:
Riegel stehen richtig, ihr Entfernen bemerkt kein Test.

| # | Schwere | Befund | Messung der Spur |
|---|---|---|---|
| B1 | mittel | Mandanten-Riegel in Leser, CAS und Verbrauch ohne Verhaltensnachweis; `LESER_PFLICHT` fehlt `t.studio_id = $1` | alle drei entfernt → POST setzt PIN über Studio-B-Host; nur Wächter (c) rot, weil das Literal nicht mehr passt |
| B2 | gering | Ablaufbedingung im Leser ohne Test; kein Test legt ein abgelaufenes Token an | Leser + Verbrauch mutiert → PIN gesetzt, alle 10 Token-Tests grün |
| B3 | mittel | Erkenner (a)–(c) übersehen Alias-Form (`UPDATE mitarbeiter AS m SET`) und `COALESCE(verwendet,0)` | P14/P14h/P15: EXIT 0; Kontrollen ohne Alias rot |
| B4 | gering | Hausputz-Beschränkung auf ältere Generationen nur bei pin-setzen bewacht | P7/P8 grün, Angriffe A11/A12 rot |
| B5 | gering | Studio-Filter des Webhook-Hausputzes ohne Wächter | P23 grün, A7/A13 rot |
| B6 | gering | Nachlesen vor der Mail ohne Probe mit echtem Deaktivierer | P10 grün; A15: Mail an toten Link |
| B7 | gering | Audit bei Mailfehler unbewacht | P17 grün; A9: audit 0 |
| B8 | gering | = L4, dazu: Fixturen von (d) werten eine eigene Kopie der Bedingung aus; bedingter Aufruf (`if (REPLACE)`) bleibt grün | T1 und P20 grün |
| B9 | gering (Spur) / blockierend (L2) | S20-REPLACE eines live laufenden Studios + Erzeuger → Mail an alte Adresse, Link gültig | A16 nachgestellt: PIN gesetzt |

Vorbestehend, ausserhalb S6: nach E-Mail-Wechsel (`/admin/mitarbeiter/email/:id`) bleibt der an
die alte Adresse geschickte Link gültig (A8) — wird in die Nacharbeit genommen (dieselbe Klasse:
Link überlebt eine Identitätsänderung). Webhook-Upsert ohne `id` setzt `extern_id` auf NULL
(`routes/webhooks.js:305`) — Sammelliste `plaene/offene-befunde-s6.md`.

## Behebung (an denselben Executer)

- L1: `AND pin_generation = <geladene Tokengeneration>` im Verbrauchs-UPDATE, bei 0 Zeilen Rollback + gleiche Ablehnung wie abgelaufener Link. Zwei-Transaktionen-Probe: Token laden, S20-Entwertung committen, POST fortsetzen → abgelehnt.
- L2/L3: `LOCK TABLE mitarbeiter_token IN SHARE ROW EXCLUSIVE MODE` als erste sperrende Anweisung der S20-Transaktion (vor REPLACE); Erzeuger liest beim Nachlesen zusätzlich `email` und bricht bei Abweichung ab wie bei `generation_geaendert`. Mail geht an die nachgelesene Adresse.
- L4: S20-Funktionstest prüft nach echtem Import, dass importierte offene Tokens `-1` tragen.
- L5: abgelaufener, sonst betroffener Token in der Fixtur; Sollzahl als Literal.
- L6: Nachlesefehler abfangen → Token entwerten (Fehlschlag davon melden, nicht verschlucken), `melde`, eigener Grund.
- L7: `r.ok`/`r.angelegt` auswerten, eigene Rückmeldung „angelegt, Einladung nicht versendet".
- L8: eigener Grund `nicht_einladbar` mit zutreffendem Text.
- L9: `melde(e, { studioId }, …)`; Probe prüft die Studio-ID.
- L10: Kommentar auf das Gemessene zurückschneiden.
- L11: Ausgabe als „alle Studios" beschriften.
- B1/B2: `t.studio_id = $1` und `t.gueltig_bis > $3` in `LESER_PFLICHT`; CAS in eine Literalliste; Verhaltensprobe A-Token über Studio-B-App (GET/POST abgewiesen, PIN unverändert, Token in A weiter gültig); Probe mit abgelaufenem Token.
- B3: Erkenner für Alias- und `COALESCE`-Formen, Fixturen.
- B4/B5: Fenstertests „Hausputz verbraucht kein NEUES Token" für pin-direkt und Webhook; Webhook-Hausputz (Generation + Studio) in die statische Kennung.
- B6: Erzeuger-Rennen mit echtem Deaktivierer. B7: werfende `sendMail`-Attrappe über die Einladen-Route, Audit zugesichert.
- B8: (d) als Funktion über den Quelltext, Fixturen durch dieselbe Funktion; unbedingter Aufruf zugesichert.
- A8: E-Mail-Wechsel entwertet offene Links (alle Wege, auf denen sich `mitarbeiter.email` ändert).

## Runde 2 — Lesespur `deepseek-v4-pro` mit Repo-Lesezugriff (Nacharbeit `c74bc7e..1181d5b`, 1,46 $)

| # | Schwere | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| R2-1 | mittel | L3(a) misst „Import wartet", nicht „an der Tabellensperre": ohne LOCK wartet das Modell am Token-DELETE; Positivkontrolle (b) ändert zugleich die Reihenfolge. Kommentar `S20-migrate.js:269` behauptet mehr als gemessen | Test-Aufbau gelesen; die LOCK-Präsenz trägt allein Wächter (d) | ja |
| R2-2 | mittel | Entwerten in den Zweigen `generation_geaendert`/`email_geaendert` (`routes/mitarbeiter-auth.js:268,272`) ungeschützt: Wurf → Fehlerseite; bei `email_geaendert` mit gleicher Generation bleibt ein wirksames, nie versandtes Token stehen | gelesen — trägt | ja |
| R2-3 | gering | `angelegt: !entwertet` liefert true auch bei `rowCount 0` (Token schon weg) → Audit „eingeladen" ohne Token | gelesen — trägt | ja |
| R2-4 | gering | Tabellensperre blockiert Token-Schreibwege ALLER Studios für die Importdauer; `golive-studio.sh` stoppt nur die Instanz des einen Studios (je Subdomain eigene PM2-Instanz) — Kommentar zu weit, kein `lock_timeout` | Herleitung trägt | ja |
| R2-5 | gering | L2 „wartet an der Tabellensperre" nur zeitbasiert (400 ms) ohne Gegenkontrolle der Latenz ohne Import | trägt | ja |
| R2-6 | gering | Webhook (`routes/webhooks.js:216`) wertet die Rückgabe der Einladung nicht aus | gelesen — trägt; `/pin-vergessen` bewusst neutral | ja |
