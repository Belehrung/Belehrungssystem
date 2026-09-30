# Offene Befunde Teil G (test/umgebung.sh)

- **G-B7** (`diffpruefung-g.md`): `tools/mutationsprobe.js:520-527` baut seine Kind-Umgebung weiter selbst statt
  `test/umgebung.sh` zu sourcen (vorbestehend). Extrarunde: auf `umgebung.sh` umstellen oder begründet belassen.
- **G-V1**: Die DB-Prüfung in `test/umgebung.sh` ist nur per Handprobe (11 Fälle) belegt, der Wächter sichert ihre Form,
  nicht ihr Verhalten. Extrarunde: Verhaltenstest (bash-Ausschnitt mit Fällen), braucht einen `AUSNAHMEN`-Eintrag.

-- Ende --
