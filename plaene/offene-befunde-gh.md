# Offene Befunde GH (Workflow-Härtung, 30.09.2026)

- **GH-S1:** `appleboy/ssh-action` lädt zur Laufzeit drone-ssh 1.8.2 per curl OHNE Prüfsumme (entrypoint.sh) — das
  Festnageln der Aktion nagelt das Binär nicht fest. Gemessene sha256 heute: `1e10a9972eef…6bb24`. Entscheidung:
  eigener Prüfschritt oder eigene Aktion.
- **GH-S2:** fingerprint (ECDSA) aus Bildschirmfoto abgeschrieben; Referenz von aussen ist erst der erste Deploy nach dem
  Merge. Bei Rot: Betreiber um den Wert als Text bitten (`ssh-keygen -lf /etc/ssh/ssh_host_ecdsa_key.pub`).
- **GH-S3:** ob Dependabot Kennungen samt `# vN`-Kommentar nachzieht, erst nach der ersten Dependabot-Woche messbar.
- **GH-S4:** zizmor-Persona-Befunde (postgres:16 per Tag statt Digest, secrets-outside-env, concurrency-limits).
- **GH-S5:** `docs/PERFORMANCE_TESTS.md:78` Beispiel mit `actions/checkout@v6` (Doku).
- **GH-S6:** Hauptserver ohne Workflow-Wächter (zizmor-Messung als Beleg).
- **GH-S7:** gitleaks liest Merge-Commits im PR nicht (Konfliktauflösungen) — zweiter Lauf über den Kopfstand denkbar.
- **GH-S8:** Testköpfe von `test_feature_semgrep_hinweis.js`/`test_feature_gitleaks_hinweis.js` nennen die Suite
  „Deploy-Gate auf dem Live-Server" — laut GymDocu-CLAUDE.md ruft `ops/deploy.sh` sie nicht auf. Wortlaut klären.
