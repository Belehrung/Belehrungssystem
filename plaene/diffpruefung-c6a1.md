# Diffprüfung C6-A1 — Monatslauf

Stand 01.10.2026, Zweig `c6a1-monatslauf`, Commit `cbc33ed` (auf master `9dfe522`). Laut Bauendem und von mir am Log
nachgezählt:
- Suite: 0, 468 Dateien gelaufen, alle registriert. In meiner Vergleichsliste stehen zusätzlich nur die Helfer
  `test/db-vorbereiten.js` und `test/umgebung.sh`; das sind keine Testläufe.
- 0 ✗.
- Lint: 0.

## Selbst gelesen

- `generateMonthlyPDFs.js`: `nurFehlende` (prüft unter der Sperre, direkt vor dem Modul), Mail-Auswahl,
  `mail_gesendet` je genanntem Typ, `datumPlusTage(heute, n)`.
- `routes/archiv.js`: `plusTage`.
- `core/monatskontrollen.js`: `ANY($2::int[])`.
- `core/pdf-engine.js`: Warnkasten über `tagesStatusMitLesbarkeit`, Detailabfragen je Sitzung, Pausenzellen.
- Die Verschiebung `routes/betriebszeiten.js` → `core/betriebszeiten-logik.js` habe ich zeilenweise verglichen.
  Abweichungen gibt es nur bei:
  - den Imports;
  - dem Präfix von `console.error`;
  - `tagesStatus` über `tagesStatusMitLesbarkeit`, gleichbedeutend.

## Lesespur flash (7 Befunde)

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| 1 | sollte | Die Rettung ungemeldeter Zeilen ist unerreichbar, wenn nichts fehlt: Ein Lauf erzeugt alles, stirbt aber vor der Mail. | trägt (`generateMonthlyPDFs.js:391`) | N1 |
| 2 | Anmerkung | Ein dauerhaft scheiterndes Modul erzeugt an jedem Nachholtag eine Fehlermail. | trägt | bleibt so (sichtbar, begrenzt auf 2.–10.), Kommentar |
| 3 | Anmerkung | `schicht_beginn`/`schicht_ende` sind ebenfalls leerbar. | trägt laut Registry | N1 |
| 4 | Anmerkung | `parseInt` nimmt Präfixe an. | trägt | N1: streng `^\d+$` |
| 5 | Test | D prüft nur „irgendein Wurf“. | trägt | N1 |
| 6 | Test | Sollmenge = Einsatzmenge. | trägt | N1: eigenes Literal |
| 7 | sollte | Totalausfall plus Bestandszeilen ergibt den Kopf „wurden generiert“. | trägt | N1 |

Nacharbeit 1 ist beauftragt (derselbe Agent).

## Funde des Bauenden außerhalb des Auftrags (für die Sammelliste)

1. `core/monatskontrollen.js#ladeNachweisLuecken` lädt zu viel (gleiche Bauart wie V08-6).
2. Mail-Label „Pausenzeiten“ gegen „Arbeits- und Pausenzeiten“: zwei Orte für dieselbe Aussage.
3. `neu-single`: Die Datumsrechnung wirft NACH `fn()`. Das wird gegenstandslos mit C6-A2 (Vorab-Anker).
4. `/mail/:monat` meldet „gesendet“, auch wenn keine Empfängeradresse gesetzt ist.
5. Die ZIP-Seite liefert alle Zeilen; „Alle N PDFs“ kann davon abweichen.
