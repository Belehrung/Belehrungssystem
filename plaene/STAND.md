# Stand beim Tokenlimit — 15.09.2026, ~13:30 UTC

Diese Datei ist der Übergabepunkt. Der Takt-Prompt ist beim Bau von
Beitrag 1 stehengeblieben und verweist für den Plan noch auf den
Scratchpad — der ist weg, sobald der Container neu startet. **Hier steht,
was wirklich gilt.**

## Läuft gerade

**PR #446 im GymDocu-Repo** (`claude/freigabe-nur-wenn-stattgefunden`),
Beitrag 1: „Eine Freigabe wird nur gemeldet und protokolliert, wenn sie
stattgefunden hat". Behebt drei Fehler, die heute schon falsch sind:

- ein falsches `reparatur_freigabe`/`seilkontrolle_freigabe`-Audit, wenn
  das UPDATE null Zeilen trifft,
- die Tablet-Meldung „Das reparierte Gerät darf wieder genutzt werden" bei
  einer wirkungslosen Absendung,
- eine unwiderrufliche Fotolöschung innerhalb eines rollbaren Vorgangs.

**Stand:** CI auf Commit `25c7fc5` grün (Isolationstests, Browser-E2E,
Lint, Dependency-Audit). Eigener Prüfstand ebenfalls: Suite EXIT 0,
Dateizahl-Ritual 316 = 316, Lint EXIT 0, Marker 6.

**Offen, und deshalb NICHT gemergt:** der Review-Bot hat zwei Befunde
gemeldet (P1 rot, P2), beide von mir nachgemessen und beide zutreffend.
Ein Executer arbeitet sie gerade ab:

- **P1:** `loescheSeilFotos()` zählt in `anzahl` die gelöschten
  DATENBANKZEILEN, nicht die gelöschten Dateien; der `unlinkSync`-Fehler
  wird mit leerem `catch` geschluckt. Der neue Löschnachweis kann also
  beurkunden, was nicht stattgefunden hat — dieselbe Klasse, gegen die
  dieser Beitrag antritt. Zweite Hälfte: scheitert `auditAppend` nach der
  Löschung, gibt es weder Nachweis noch eine Zeile für einen zweiten
  Versuch.
  **Behebung (beauftragt):** Dateien einzeln löschen und drei Mengen
  führen (entfernt / nicht vorhanden / fehlgeschlagen), **das Audit VOR
  dem DELETE schreiben** (dann sind die Zeilen bei einem Audit-Fehlschlag
  noch da und selbst der Wiederholungs-Anker), und nur die Zeilen löschen,
  deren Datei wirklich weg ist.
- **P2:** Der Eintrag nennt `seil_defekt_fotos` als Bezugstyp, übergibt
  aber `sperrIds[0]` aus `geraete_sperren`. `routes/admin/audit.js:251`
  rendert `${bezug_typ} #${bezug_id}` — im Protokoll steht also
  `seil_defekt_fotos #<Sperr-ID>`. **Behebung:** Bezugstyp auf
  `'geraete_sperren'`.

**Vor dem Merge:** Diff selbst lesen, volle Suite, Dateizahl-Ritual,
`npm run lint`, Bot-Kommentare erneut lesen (nicht nur den Check),
`head_sha` des grünen Laufs gegen den Zweigkopf halten. Danach die beiden
Threads beantworten und schliessen. Nach dem Merge: Deploy-Lauf und
`tools/live-check.sh`.

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
