# Stand beim Tokenlimit — 15.09.2026, ~13:30 UTC

Diese Datei ist der Übergabepunkt. Der Takt-Prompt ist beim Bau von
Beitrag 1 stehengeblieben und verweist für den Plan noch auf den
Scratchpad — der ist weg, sobald der Container neu startet. **Hier steht,
was wirklich gilt.**

## Erledigt — Beitrag 1 ist gemergt

**PR #446, Squash `186c0aa`**, „Eine Freigabe wird nur gemeldet und
protokolliert, wenn sie stattgefunden hat". Drei Fehler behoben, die
vorher schon falsch waren:

- ein `reparatur_freigabe`/`seilkontrolle_freigabe`-Audit für ein UPDATE,
  das keine Zeile getroffen hat,
- die Tablet-Meldung „Das reparierte Gerät darf wieder genutzt werden" bei
  einer wirkungslosen Absendung,
- eine unwiderrufliche Fotolöschung innerhalb eines rollbaren Vorgangs.

Dazu ein eigener, nachgelagerter Löschnachweis `seil_fotos_geloescht`, der
Datei-Erfolge, „war bereits weg" und Fehlschläge getrennt beurkundet und
nur nennt, was er selbst gemessen hat.

Fünf Runden, vier Prüfspuren (eigene Lesung, Gegenlesung, Review-Bot, CI).
Der Bot ging von 4/5 auf 5/5; alle Befunde wurden nachgemessen, keiner
blind übernommen. Zwei Befunde betrafen Regressionen der Behebung selbst
(ein Verklemmungs-Kreis, ein verschwundener Löschnachweis), einer eine
Sandbox-Eigenschaft, die als allgemeingültige Tatsache festgeschrieben war
und deshalb erst in der CI aufflog.

**Noch zu tun nach dem Merge:** Deploy-Lauf prüfen (`actions_list` auf
`deploy.yml`, richtiger `head_sha`, `success`) und
`bash tools/live-check.sh`.

## Läuft gerade — Beitrag 2 ist GETEILT

Plan v4 führt die Ausmusterung als EINEN Beitrag. Das ist am 15.09.2026
aufgeteilt worden, weil er Migration, zwei Routen, einen Bestätigungsablauf,
sechs Leserstellen und drei bestehende Deploy-Gates umfasst — und ein
Beitrag mit DREI Fehlern am selben Tag fünf Runden gebraucht hat. Der Plan
bleibt inhaltlich gültig, nur der Zuschnitt ist ein anderer.

**2a — Darstellen und Lesen** (Zweig `claude/ausmusterung-darstellen-und-lesen`,
läuft): Migration 0057 plus alle Leserstellen. Rein additiv, KEINE Route
erzeugt den Zustand. Neun Punkte: Migration und `core/db.js`; Aufbewahrung
(`core/retention.js:174-186`, COALESCE, EIN Eintrag je Tabelle); Ausfallzeit
(`core/wiederholung.js:105/116`); PDF-Defekt-Anhang dritter Zweig
(`core/pdf-engine.js:2032/2089/2172`); PDF-Sperren-Anhang eigener Zweig VOR
`:1077`, dazu `:913` und `:993`; BEIDE Zeitraumfilter (`:773`, `:1997`);
Statistik (`routes/admin/geraete.js:4454`); Reparaturformular
(`routes/sichtpruefung.js:2902/3081`); und das Deploy-Gate
`test_feature_korrektur_dokumente_static.js:51-53`, das die alte
Retention-Semantik per Regex festschreibt.

Zwei weitere `SELECT * FROM geraete_…` in `core/pdf-engine.js` sind geprüft
und ausgeschlossen, mit Begründung statt aus Glück: `:1683` ist eine
Wartungs-Sperre (`typ='wartung'`, Bereich unberührt), `:1931` listet Defekte
unter ihrer Sitzung und rendert gar keinen Status.

**Fixturen stellen den Zustand per Hand-INSERT her** — das ist in 2a richtig
und kein Schlupfloch, weil der Schreibweg erst in 2b entsteht. Steht so im
Auftrag und gehört in jeden Kopfkommentar.

**2b — Erzeugen** (noch nicht begonnen): Bestätigungsseite mit drei Blöcken,
serverseitiger Schnappschuss mit INHALTS-Fingerabdruck, beide
Ausmusterungs-Routen, Reaktivierungssperre an der ROUTE, Rückweg „Offene
Mängel abschliessen" für JEDES inaktive Gerät mit offenen Mängeln, der
Kopfkommentar `routes/admin/geraete-typen.js:54-62`, und die zwei
Deploy-Gates `test_feature_admin_lifecycle.js:96` und
`test_feature_geraete_loeschen.js:165`.

## Danach

**Beitrag 2 — die Ausmusterung.** Der Plan liegt jetzt im Repo:
`plaene/ausmusterung-plan-v4.md`, dazu `plaene/ausmusterung-eigene-
nachtraege.md`. Zweimal gegengelesen, 18 Befunde, alle selbst nachgemessen,
alle getragen. Nicht neu planen — umsetzen.

Die drei Entscheidungen des Betreibers stehen im Takt-Prompt und in v4.
Der Bestätigungsschritt wird gebaut; die Rückfrage dazu ist nicht mehr
offen (Begründung in v4, Abschnitt 0).

## Notiert, aber ausdrücklich NICHT gebaut

- Drei weitere Fundstellen derselben Klasse wie Beitrag 1: die
  Seil-Verschärfung im Tagescheck (`routes/module.js:2911-2946`), die
  Rücknahme einer Einweisung (`routes/belehrungen.js:1409-1413`), die
  Lageplan-Markierung (`routes/lageplan.js:464-468`). Eigener Beitrag.
- Der Verklemmungs-Kreis um `auditAppend()` (CLAUDE.md, Abschnitt
  „Transaktionen und Sperren"). Eigener Auftrag, nur hergeleitet, nie
  beobachtet.
- `geraete_bekannt` schlägt ausgemusterte Gerätenamen weiter vor;
  Wartungsgeräte haben womöglich dieselbe Sackgasse. Beides eigene
  Aufträge, Begründung in v4 Abschnitt 2.7.
- Der kleine Folgebeitrag aus der Bot-Prüfung zu #444.
