# Auftrag C3a Nacharbeit 1 (25.09.2026)

Grundlage: `plaene/diffpruefung-c3a.md` (C3a-1..C3a-12). Baum `/workspace/gymdocu-c3a`, Zweig `fix-c3a-datenintegritaet`,
Kopf `f75cea1`. Reproduktionen der Prüfspur: `scratchpad/c3acc/` (m1, m1b, m3, m4, m6, probe5, mut/*; DB dort
`gymdocu_c3acc_test`) — vor dem Bau gegen deinen Stand, danach erneut, beides wörtlich. Einordnung: Standard-Executer
(bekannte Muster, keine neue Architektur).

1. **C3a-1:** Tablet-POST (Reinigung) und Aufgaben-POST prüfen `aktiv` INNERHALB der Transaktion, die schreibt (für die
   Reinigung in der `auditTx` vor dem INSERT; für die Aufgabe z. B. `INSERT … SELECT … WHERE aktiv=1` mit `rowCount`).
   Test: Stilllegen zwischen Vorab-Lesen und Schreiben (Hook wie in m-Skript) → abgelehnt, keine Zeile.
2. **C3a-2:** `admin.post("/aufgabe/:id/loeschen")`: in `auditTx` Reinigungen der Aufgabe zählen; >0 → Aufgabe stilllegen
   (`aktiv=0`, Audit `getraenkeanlage_aufgabe_stillgelegt`), sonst DELETE mit Audit. Knopfbeschriftung wie bei der
   Anlage. Eine stillgelegte Aufgabe erscheint nicht mehr in Fälligkeit/Tablet (vorhandene Filter `t.aktiv=1` prüfen);
   im Monats-PDF bleibt ihre Bezeichnung stehen. Test inkl. PDF-Spalte „Reinigung“ nach dem Stilllegen.
3. **C3a-3:** Monats-PDF der Getränkeanlage entsteht, sobald der Monat Reinigungen hat — unabhängig vom Modul-Schalter.
   Test: Modul aus, Reinigung im Monat → Archivzeile vorhanden.
4. **C3a-4:** Widerspruchskarte zählt nur aktive Anlagen; Text ohne „löschen“, wenn Nachweise vorhanden sind.
5. **C3a-5:** kein „Stilllegen“-Knopf an stillgelegten Anlagen; Route `UPDATE … AND aktiv=1`, bei `rowCount 0` kein Audit.
6. **C3a-6:** Mitarbeiter löschen prüft Unterschriften (`unterschriften.mitarbeiter`) VOR jeder Schreibung (auch vor den
   drei Autocommits) und bricht mit einer klaren Meldung ab („hat unterschriebene Nachweise — deaktivieren statt
   löschen“, Status 409); der Bestätigungsdialog verspricht nichts anderes. Test: Mitarbeiter mit Unterschrift →
   409, Freischaltung und Token unverändert.
7. **C3a-7:** Migration 0062 bei Waisen: FK `NOT VALID` anlegen, `RAISE WARNING` mit Anzahl und bis zu 20 IDs, KEIN
   Abbruch; ohne Waisen wie bisher (validiert). Endzustandsbeweis bleibt (genau ein RESTRICT-FK). Test: alte DB mit
   Waisen → Migration läuft durch, FK `r`, `convalidated=false`, Warnung im Log; Löschen einer Anlage mit Reinigung →
   23503. Migrations-Prüfsumme nachziehen (0062 ist nicht ausgeliefert).
8. **C3a-8:** `#9aa` und `42px` durch Tokens aus `core/design.js` ersetzen (vorhandene wie `var(--gd-text-leise)`; fehlt
   eines, in `DESIGN_CSS` ergänzen), Budget-Einträge wieder entfernen.
9. **C3a-9:** Zusicherungen für Reaktivieren an aktiver Anlage (kein Audit), Abzeichen, beide Knöpfe, Tablet-Datum,
   `studioId` im melde-Stub; die fünf schwachen Zusicherungen aus DS 5 an eine Stelle binden, die ohne Schutz fällt.
   Je Gegenprobe ROT/GRÜN.
10. **C3a-10:** Stilllegedatum als Berliner Kalendertag (`core/datum.js`).
11. **C3a-11:** `melde()` in den neuen catch-Blöcken des Mailers in `try { … } catch {}`.
12. **C3a-12:** Reinigungszählung der Admin-Liste in EINER gruppierten Abfrage.

Einzeltests nur gegen `gymdocu_c3a_test`, nie `gymdocu_test`. Volle Suite + Dateizahl-Ritual + `npm run lint` wörtlich.
Committen und pushen, bevor du auf einen Hintergrundlauf wartest; kein PR; Bericht EINMAL am Ende.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab — besonders durch 2 (stillgelegte Aufgabe), 6 (Löschung vorab
abgelehnt) und 7 (nicht validierter FK)?

-- Ende des Auftrags --
