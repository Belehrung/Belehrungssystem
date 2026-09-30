# Auftrag DEP — Abhängigkeiten nach neuen Advisories (30.09.2026)

Anlass (gemessen 03:20 UTC): `npm audit --omit=dev --audit-level=high` ist in BEIDEN Repos rot, obwohl um 02:32 UTC
GymDocu noch grün war (neue Advisories):
- GymDocu (`ops/audit-gate.sh`, Zustand 2): `brace-expansion` 4.0.0–5.0.11 (high; Pfad laut `npm ls`:
  eslint → minimatch 10.2.5 → brace-expansion 5.0.9 — messen, warum das trotz `--omit=dev` zählt) und `nodemailer`
  <=10.0.8 (high; GHSA-6vj9-mwq6-2f5v „process-global DNS cache reuses TLS servername across transports,
  cross-tenant SMTP credential disclosure", GHSA-8vvx-rff5-p5rq, GHSA-g57g-f23g-4646, GHSA-v53p-9fqp-m79j).
- Hauptserver: dasselbe `nodemailer` (9.1.1), dazu moderate `multer`, `qs`, `brace-expansion` (per `npm audit fix`
  innerhalb der Bereiche behebbar, gemessen: danach bleibt nur nodemailer).
Folge: jeder PR in beiden Repos ist am Audit-Job rot (Hauptserver #102 schon gemessen).
Einordnung: Standard (Major-Sprung mit Messpflicht).

## Umfang
1. **nodemailer 9 → 10 (≥ 10.0.9)**, beide Repos, je eigener Zweig/PR (`fix-dep-nodemailer10`). VORHER `npm diff`
   (CLAUDE.md „Abhängigkeiten anheben"): `--diff-name-only` und die Typen/Export-Oberfläche, CHANGELOG der Majors;
   jede benutzte API (`createTransport`, Optionen, `sendMail`, Fehlerform) im Code aufzählen (grep) und gegen den Diff
   halten. Bericht: Liste der Aufrufstellen und je „unverändert/angepasst".
2. **Erreichbarkeit der Advisories messen** (nicht vom Prüfer übernehmen): nutzt GymDocu mehrere Transports mit
   unterschiedlichem Host/TLS-servername im selben Prozess (je Studio eigenes SMTP?) — dann war GHSA-6vj9 real
   erreichbar; Fundstellen nennen. Das bestimmt, ob der Betreiber es erfahren muss.
3. **brace-expansion** (GymDocu): über die kleinste Anhebung beheben, die den Pfad schliesst (eslint/minimatch oder
   `overrides`), mit Begründung; `npm audit --omit=dev --audit-level=high` und `ops/audit-gate.sh` danach GRÜN
   (wörtlich). Hauptserver: `npm audit fix` für die moderaten innerhalb der Bereiche.
4. Nur Lockfile/`package.json` per npm-Werkzeug ändern, nie von Hand. Anpassungen am Code nur, wo der Major es verlangt.

## Prüfung
Volle Suite je Repo (`bash test/run.sh > log 2>&1; echo "SUITE_EXIT=$?"`), Dateizahl-Ritual, `npx eslint .` (GymDocu),
wörtlich. Mail-Tests laufen ohne echtes SMTP (Stubs/Attrappen — prüfen, dass sie mit nodemailer 10 noch greifen und
nicht still echte Verbindungen versuchen: Netz-Sperre der Suite gemessen, nicht angenommen).

## Zustandsfrage
Welcher Zustand entsteht durch den Major-Sprung, den es vorher nicht gab (Fehlerformen, Standardwerte, Pooling, DNS-
Cache)? Kann eine Mail jetzt still nicht verschickt werden, wo sie vorher verschickt wurde?

-- Ende des Auftrags --
