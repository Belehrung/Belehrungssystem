# Offene Befunde C5-E (für die Extrarunde C6)

- **T1-K4 (aus C5-E1, nicht geschlossen):** Ein Einzelaufruf ohne `test/umgebung.sh` legt beim `require('./routes/belehrungen')` das Verzeichnis `<repo>/einweisung-nachweise/` an. Gemessen hat das der C5-E1-Bauer. Die volle Suite deckt `test_feature_run_sh_wegwerf_variablen_static.js` ab (neun Wegwerf-Wurzeln); den Einzelaufruf deckt nichts.
