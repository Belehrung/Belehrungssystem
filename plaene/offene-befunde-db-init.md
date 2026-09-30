# Offene Befunde DB-INIT (Sammelliste)

- **DBI-1** (Runde 1, Lese B4, cc Z2): eine Abweichung, die das SCHEMA nicht heilen kann (Spaltentyp, Default, CHECK
  gleichen Namens mit anderem Inhalt), läuft einmal durch das SCHEMA und wird dann als Stand festgehalten; danach meldet
  nur noch der Drift-Cron den Typ (keine Defaults/Constraints). Bewusster Tausch gegen „DDL bei jedem Start“.
  Betreiber-Entscheidung oder Extrarunde (z. B. Drift-Wächter um Defaults/Constraints erweitern).
- **DBI-2** (Runde 1, cc): der erste Start nach einer Migration, die eine Tabelle mit `studio_id` anlegt, nimmt für die
  FK-Härtung ShareRowExclusive auf die neue Tabelle und `studios` (einmalig). Extrarunde: FK in die Migration selbst.
