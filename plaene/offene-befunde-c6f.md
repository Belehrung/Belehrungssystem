# Offene Befunde C6-F (Tests)

Stand 02.10.2026. Die Herkunft steht im Bericht zur Nacharbeit 1 (Zweig `c6f-tests`, `6b07191`) und in `diffpruefung-c6f.md`.

| Kennung | Befund | Plan |
|---|---|---|
| C6F-g1 | `DOKUMENTE_DIR` und `EINWEISUNG_NACHWEIS_DIR` haben keine eigene Pfadquelle wie `core/belehrungen-pfad.js`. Der Ausdruck steht in mehreren Kopien: DOKUMENTE in `routes/belehrungen.js`, `core/provisioning.js`, `core/export-studio.js`, `core/storage-replica.js` und `routes/admin/einstellungen.js`; NACHWEIS in `routes/belehrungen.js`, `core/provisioning.js` und `ops/nachweis-waisen-melden.js`. Dasselbe gilt für den `DEFECT_PHOTO_DIR`-Ausdruck (Kopien neben `core/foto-reaper.js#FOTO_DIR`). Dieselbe Aussage an mehreren Orten. | C6-G: je eine Quelle, alle Kopien darauf umstellen, Wächter wie bei `lageplan-pfad` |
| C6F-g2 | Der Wächter gegen eigene Wegwerf-DB-Muster erkennt eine Form wie `_test(\?|$)` nur bei den 25 bekannten Nutzern, nicht im Scan über alle Dateien. Das ist im Wächterkopf benannt. | C6-G |
| C6F-g3 | Der AST-Wächter über die Schreibstellen (`test_feature_routen_verzeichnisse_lazy.js` C2) sieht kein Ziel, das über eine Zwischenvariable kommt, und keinen Schreibweg in einem anderen Modul. Das ist im Kopf benannt. | C6-G |
| C6F-g4 | Das Wegwerf-DB-Muster lässt nur EIN Segment zwischen `gymdocu_` und `_test` zu. Einzelläufer-DBs wie `gymdocu_p1n5b_belehrung_gelesen_test` würden abgewiesen. | entschieden: so lassen. Die Hausregel nennt `gymdocu_<kürzel>_test`, und eine engere Form verringert die Gefahr, eine fremde DB zu treffen. |
