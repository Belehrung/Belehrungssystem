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
