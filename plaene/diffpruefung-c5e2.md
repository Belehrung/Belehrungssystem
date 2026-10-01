# Diffprüfung C5-E2 — Einzeltests

Stand 01.10.2026, Zweig `c5e2-einzeltests`, Commit `45ab1b8`. Der Bauende meldet: Suite 0, 428 = 428, Lint 0, 53 von 56 Nummern; Nr. 19, 48 und 52 stehen auf der Sammelliste, weil sie sich mit E1 überschneiden.

Selbst gelesen: wettlauf (Barriere über `pg_stat_activity`), korrektur_dokumente (Aufräumen im finally), getmutation, health_gate, `schliessendeKlammer` in den gemeinsamen Helfer, pin_regeln (git-Referenz), zustaendigkeit_static (strikt je Datei).

## Lesespur flash (5 Befunde)

Keine Zusicherung ist schwächer geworden. Gefunden hat die Lesespur keine Zusicherung ohne Schutz, kein Risiko für den Live-Server und keine Lücke bei `studio_id`.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| F1 | sollte | Die neuen Kindprozesse in audit_csv und geraete_datumsfallen laufen ohne `cwd`. Aus einem fremden Arbeitsverzeichnis endet das in MODULE_NOT_FOUND. | Nacharbeit 1: `cwd: __dirname` |
| F2 | Anmerkung | `test_feature_admin_logout.js:35` liest relativ zum Arbeitsverzeichnis. | Nacharbeit 1 |
| F3 | Anmerkung | Der Kommentar „GLEICHZEITIG“ im wettlauf-Test widerspricht der Staffelung. | Nacharbeit 1 |
| F4 | Anmerkung | `summe === kopf.gesamt` bezieht sich auf sich selbst. | Nacharbeit 1: handgeführte Kopfzahl als Literal |
| F5 | Anmerkung | Die mkdtemp-Verzeichnisse entstehen schon beim Laden. Ein Wurf in den `require`s erreicht das finally nicht. | Nacharbeit 1: `process.on('exit')`-Räumpfad |
