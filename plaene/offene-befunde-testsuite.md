# Offene Befunde Testsuite (zweigübergreifend)

- **TS-1** (30.09.2026, gemessen): `test_feature_monatslauf_poolverbindung.js:111-113` — in der vollen Suite auf dem
  QR-J-Zweig nach master-Merge (`7b1a49a`) `gemessen: 1` statt 0 (SUITE_EXIT=1, 631 PASS / 1 FAIL), während parallel
  zwei Agenten Tests fuhren. Einzeln auf eigener DB 6 × grün (`gemessen: 0`). Der Test misst `pool.waitingCount` 50 ms
  nach Laufbeginn; der Lauf selbst belegt zwischen den Modulen kurz eine Pool-Verbindung (getConfig/db.tx, im
  Testkommentar benannt) — unter Last trifft die Messung diesen Moment. Kein Befund des Zweigs. Extrarunde: Messung
  so fassen, dass die eigene kurze Belegung des Laufs sie nicht rot macht, der Lock über `db.pool.connect()` (den der
  Test bewacht) aber weiterhin (Gegenprobe).
