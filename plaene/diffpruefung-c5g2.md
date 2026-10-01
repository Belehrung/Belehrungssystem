# Diffprüfung C5-G2 — Kernmodule, Werkzeuge, Betriebsskripte

Stand 01.10.2026. Zweig `c5g2-kern`, Commit `5c27e0d` (master mit C5-A und Q, ohne E2). Der Bauende meldet: Suite 0, 440 = 440, `diff` EXIT 0, Lint 0. Gebaut sind 21 Nummern. F1 ging an G1, V06-6 ist gestrichen.

## Selbst gelesen (Produktivcode vollständig)

steckbrief (Drei-Zustands-Vertrag, alle Aufrufer über `steckbriefStand`/`istNichtLadbar`), zustaendigkeit (`zustand` extern/teilweise, beide Aufrufer verzweigen ausdrücklich), bezirk-archiv (Token-Wache als `router.use`, nur unter `/intern/bezirk-archiv` eingehängt), demo_daten (Rücknahme über id + studio_id + Demo-Kriterium), export-studio, fehlerbehandler, feiertage, monitoring-alert.sh (Weißliste), schluessel-rotieren, qr-charge, ausmusterung-gegenproben.

Eigene Befunde:

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| E-1 | sollte | `core/feiertage.js`: Berlin hatte zwei EINMALIGE Feiertage am 8. Mai, 2020 und 2025. Der zweite war per Gesetz beschlossen (Abgeordnetenhaus Juli 2024, Vorlage Drs. 19/1359). Keiner von beiden ist eingetragen. Der Bauende nannte nur 2020, und zwar als „nicht Auftrag“. Weil die Datei „historisch korrekt“ sein soll, ist 2025 ein echter Fehler. | Nacharbeit 1: beide Tage mit Primärquelle eintragen, Test dazu |
| E-2 | Anmerkung | `/intern/export` gibt `erhebungsfehler` zurück, der Hauptserver liest aber nur `r.ok` (`core/offboarding-core.js:98`). Der Betreiber erfährt es also nur über `melde()`, der Kunde über das LIESMICH. Ausreichend, solange `melde()` den Betreiber erreicht. | keine Änderung |
| E-3 | Anmerkung | `ops/schluessel-rotieren.js`: Ein scharfer Lauf mit 0 Zeilen meldet „die Datenbank ist NICHT neu verschlüsselt“. Nach einem schon erfolgten Lauf stimmt das nicht, dann ist sie es bereits. | Nacharbeit 1: Wortlaut „in DIESEM Lauf wurde nichts umgeschlüsselt“ |

## Lesespur flash (6 Befunde, 1,14 $)

Hat jeden Aufrufer der Steckbrief-Lader und von `externVerwaltet` geprüft: Keiner reicht `{fehler:true}` als Wert durch. Der Bezirk-Router hat einen einzigen Einhängepunkt, und `tokenWache` ist sein erster Layer.

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| L-1 | sollte | `einstellungen.js:675` protokolliert nur bei `r.ok === true`. Bei einem Teilerfolg (ok:false, 13 Zeilen angelegt und registriert) entsteht kein Audit-Eintrag. Der neue Test hält genau das fest. | trägt (Code gelesen) | N1: Audit bei `ok === true` oder `angelegt > 0` (nicht bereitsGeladen), Payload mit `teilweise`, Test umdrehen |
| L-2 | sollte | `demo_daten.js` `nimmZurueck`: der `rowCount` des DELETE wird nicht geprüft. Passt das Kriterium nicht, gilt die Zeile still als zurückgenommen. | trägt | N1: `rowCount !== 1` zählt als `rueckgaengig`-Fehler und wird gemeldet |
| L-3 | Anmerkung | `dashboard.js:703` verspricht bei `?demo=geladen` noch „den Cardio-Check“. | trägt | N1: Wortlaut |
| L-4 | Anmerkung | `steckbrief.js:269` behauptet weiter, die Lader machten einen DB-Fehler still zu null. | trägt | N1: Kommentar |
| L-5 | Anmerkung | `/intern/export` loggt `erhebungsfehler` nicht. | trägt | N1: in die Logzeile |
| L-6 | Anmerkung | Wenn auch die Rücknahme scheitert, rät der Hinweis zu „entfernen und erneut laden“. Das Entfernen erreicht die nicht registrierte Zeile aber nicht. | trägt | N1: eigener Hinweis bei `rueckgaengigFehler > 0` |
| L-7 | Anmerkung | `test_feature_steckbrief_nicht_ladbar.js:92` vergleicht mit `WER_STELLEN.length` aus dem geprüften Modul. | trägt | N1: Literal |
