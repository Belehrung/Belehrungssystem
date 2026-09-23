# Diffprüfung S6 (Generationszähler) — `f4c0f07..c74bc7e`

Stand 23.09.2026. Lesespur `gpt-6-sol` (Bündel: Diff + Umkreis, 40 Lesungen,
8,06 $). Jeder Befund vom Haupt-Agenten am Quelltext nachgemessen; Spalte
„getragen" ist MEINE Messung, nicht die des Prüfers. Ausführende Claude-Spur
läuft noch — ihre Befunde kommen unten dazu.

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
