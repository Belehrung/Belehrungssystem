# Diffprüfung Migration 0066: CHECK-Namen vereinheitlichen

**Anlass:** Der Schema-Drift-Alarm vom 01.10.2026 meldete drei WARN „Constraint fehlt in LIVE“.

**Diagnose:**
- `core/db.js` legt die Regeln inline an (`*_check`), die Migrationen 0005, 0007 und 0010 noch einmal unter `*_chk`.
- Live existiert nur `*_chk`. Die Regeln gelten dort also, nur der Name weicht ab.

**Stand:** Zweig `drift-chk-namen`, `720a79c`.
- Eigener Test: 62 PASS, 8 Gegenproben rot gemessen.

## Lesespur flash (5 Befunde, keiner blockierend)

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| B1 | Anmerkung | Die Prüfsummen-Zusicherung im Test prüft gegen dieselbe Datei und kann deshalb nicht fallen. | trägt | N1: umbenennen, den Vergleich streichen |
| B2 | Anmerkung | Im Fall „beide da“ wird nur die Regel verglichen, nicht die Gültigkeit. Ist nur `_chk` validiert, wird ausgerechnet der validierte Constraint gelöscht. | trägt (Z. 112) | N1: Gültigkeit vergleichen, das validierte Objekt bleibt erhalten |
| B3 | Anmerkung | Die Soll-Definition wird an einer TEXT-Spalte erzeugt. Bei einem anderen Spaltentyp tut die Migration still nichts und gilt trotzdem als angewandt. | trägt (Z. 93); live sind alle drei Spalten TEXT | N1: Typ der echten Spalte übernehmen |
| B4 | Anmerkung | Der Kommentar zur Sperre stimmt nicht: Es ist EINE DB für alle Studios, und es gibt kein lock_timeout. | trägt | N1: Kommentar berichtigen; Sperre wie bei 0062/0065 |
| B5 | Anmerkung | Zwischen Merge und Neustart meldet der Wächter sechs WARN statt drei. | trägt | Keine Änderung: Übergangszustand, nur WARN, kein Deploy-Blocker |

Nebenbefund des Bauenden: `test_feature_brandschutz.js` spielt 0005, 0007 und 0010 auf `gymdocu_test` erneut ein. Danach stehen dort wieder `_chk` neben `_check`. Das betrifft nur die Test-DB; der Klassenwächter liest deshalb eine eigene frische DB.

## Nacharbeit 1 (`1553972`) und Merge (01.10.2026)

- **N1 behoben:** B1 (Zusicherung umbenannt), B2 (Gültigkeit im Fall „beide da“), B3 (Typ der echten Spalte; fehlt die Spalte, bricht die Migration laut ab), B4 (Kommentar zu den Sperrstufen).
  - Die Sperrstufen sind gemessen. Für DROP, RENAME und ADD CHECK ist es ACCESS EXCLUSIVE, ebenso für DROP FK in 0062 und UNIQUE in 0065. Die FKs aus 0062 und 0065 nehmen nur SHARE ROW EXCLUSIVE.
  - Test: 78/0. Die Gegenproben ergaben 76/2, 75/3, 77/1 und 10/9.
- **Benannte Grenze G1** (nachträglich geänderter Spaltentyp): steht auf `plaene/offene-befunde-drift.md`.
- **Volle Suite:** Gemessen ist der CI-Lauf auf dem Merge-Stand `5b285cc`. Er ist grün, 443 = 443, `diff` EXIT 0. Die lokale Suite stand zu dieser Zeit noch in der Sperr-Warteschlange, ihr Ergebnis lag beim Merge nicht vor.
- **CI** auf `1553972`: 6/6 grün.
- **Gemergt** als `d372589` (#498). Die Botschaft ist zurückgelesen.
