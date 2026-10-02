# GymDocu: Betreiber-Entscheidungen und Berichtigungen

Nicht erneut fragen, nicht neu aufrollen. Wörtlich übernommen aus dem Takt-Prompt (Stand 02.10.2026, Archiv:
`plaene/takt-prompt-archiv-2026-10-02.md`). Neue Entscheidungen zu GymDocu-Produktfragen kommen HIER dazu.

## Vom Betreiber entschieden — nicht erneut fragen

- **#78 angenommen**: Führung durch REIHENFOLGE, nichts sperren. Hausworte bleiben.
- **GH #236 (Wartung = Einzelgeräte): ja.** Erst NACH #57.
- **Wartungskategorien bleiben.** Nicht umbenennen.
- **admin_sidebar_v2 ist ABGEBAUT.**
- **Durchschreiben statt Überlagern** (01.09.2026).
- **Großes Pop-up bei jeder Defektmeldung** (31.08.2026).
- **`BESCHNITT_MM = 2` bleibt vorerst stehen** (13.09.2026): die Druckerei hat noch nicht geantwortet. Nicht raten, nicht ändern, nicht erneut fragen.
- **Die Scanner-Klasse wird über den PARAMETRIERTEN Helfer geschlossen** (14.09.2026).
- **In der Darstellung KEINE optischen Unterschiede zwischen den Prüfkategorien** (15.09.2026). Umgesetzt mit #442.
- **AUSMUSTERUNG, drei Entscheidungen vom 15.09.2026:**
  1. **Geräte müssen auch mit OFFENEM Mangel deaktiviert werden können.** Wörtlich: „gerät so defekt, dass es nicht mehr repariert werden kann oder soll. es wird verkauft oder verschrottet. es vorher zu reparieren wäre kompletter unsinn."
  2. **Der offene Mangel wird dabei mit einem eigenen Grund „ausgemustert" geschlossen** — ausdrücklich KEINE Reparatur, eigenes Kennzeichen. Verworfen: offen lassen; aus den Listen ausblenden.
  3. **Reaktivierung nach Ausmusterung: NEIN.** Wörtlich: „ausgemustert ist ausgemustert."
  4. **Der Bestätigungsschritt beim Ausmustern ist entschieden und wird gebaut** — die Rückfrage dazu ist NICHT mehr offen (Begründung in `plaene/ausmusterung-plan-v4.md`, Abschnitt 0). Nicht erneut fragen.

## Berichtigungen — nicht neu aufrollen

1. Zuständigkeit ist auf allen sechs Schreibwegen erzwungen (#14).
2. Litigation Hold `mitarbeiter_einweisungen`/`mitarbeiter_nachweise`: keine Lücke.
3. Kontrast: maßgeblich `#2F6B9E:#101113` = 3,34 BESTANDEN.
4. „PDF-Textextraktion verdreht die Reihenfolge" ist WIDERLEGT.
5. **Aufgabennotizen veralten.** Zeilennummern vor jedem Bau NEU messen.
6. Der Tablet-QR auf dem Dashboard ist KEIN Defekt.
7. #56, #60, #62, #63 sind erledigt.
8. „Gerät 4 berichtigen" ist ERLEDIGT (#292).
9. `core/pdf-engine.js` liest KEINE Korrektur-Überlagerung.
10. `.seil-sperr-karte` ist seit #291 korrigiert.
11. Der QR-Bestellweg ist seit 06.09.2026 fertig und ausgeliefert (#359–#364).
12. Der Gedankenstrich geht NICHT im PDF verloren, sondern im Prüfhelfer (`latin1`-Dekodierung).
13. Die Zeitzonenfallen-Klasse ist ZU und bewacht (#432).
14. Der Studio-Wächter-Hinweis ist erklärt — kein Defekt.
15. OFFEN 2 ist beantwortet UND behoben (#433).
16. `/admin/archiv` schneidet nichts mehr ab (#434).
17. Die Ursachenbeschreibung „ohne `min-width:0`" ist berichtigt (#435).
18. Der Verzeichnis-Scan der DATUMS-Wächter ist gemeinsam (#436).
19. Der Erfassungsbereich ist PFLICHTPARAMETER des Helfers (#437).
20. Der Rohwert-Scan hängt am Helfer, und der Vergleich misst nicht mehr beide Seiten mit demselben Sieb (#438).
21. Eine Darstellung für offene Mängel über alle drei Prüfarten (#442, Deploy 410).
22. **Die Zusicherungen binden das UNTERSUCHEN, nicht nur das AUFLISTEN** (#443, Deploy 411).
23. **Die beiden letzten Verbraucher von `test/rohwert-scan.js` sind gebunden** (#444, Deploy 412). ACHT Wächter hängen am gemeinsamen Helfer. Nicht neu aufrollen.
