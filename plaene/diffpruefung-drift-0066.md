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
