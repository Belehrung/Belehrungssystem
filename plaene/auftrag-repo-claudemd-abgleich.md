# Auftrag: Hausregeln von GymDocu und Hauptserver mit dem Repo abgleichen (02.10.2026)

Betreiber-Auftrag 02.10.2026: „Ja mache es und lass es prüfen“. Gemeint ist die Prüfung der Regeldateien in den
Unterverzeichnissen. Je eine flash-Lesespur hat die beiden CLAUDE.md gegen ihr Repo gehalten. Die Berichte liegen in
`/tmp/claude-0/-home-user-Belehrungssystem/c200d6d7-f0a2-5a02-8fb8-a4f662e3a700/scratchpad/regeln/gd.txt` und
`…/hs.txt`; lies sie.

Einordnung: nicht sehr komplex, also baut der Standard-Executer. Es sind Textkorrekturen und Kommentarzeilen, keine Logik.
Jeder Punkt ist ein FUNDORT. Miss ihn vor dem Ändern neu. Trägt er nicht, ändere nichts und melde es.

## Teil 1: GymDocu

Arbeitsbaum `/workspace/gymdocu-doku`, neuer Zweig `doku-claudemd-abgleich` ab `origin/master`.

1. **B1** (`CLAUDE.md:181-183`): Der Umstellungsstand zu `DESIGN_CSS` ist überholt. Es ist nicht mehr nur `layout()` umgestellt.
   Der Wächter `test_feature_design_tokens.js` scannt die Verzeichnisse und führt eine Ausnahmeliste. Beschreibe den
   heutigen Stand so, wie der Kopf des Wächters ihn belegt.
2. **B2** (`:68`): Tests werden im `TESTS=(…)`-Array von `test/run.sh` registriert, nicht in der `for t in`-Schleife.
3. **B3** (`:37-39`): Die Klammer „(FK ON DELETE CASCADE)“ stimmt nicht mehr. Messen und berichtigen:
   - `mitarbeiter_einweisungen`: der FK ist entfernt (Migration 0047);
   - `wartung_pruefungen` → `wartung_geraete`: RESTRICT (0056);
   - `wartung_geraete_aufgaben`: weiter CASCADE, weil es Konfiguration ist.

   Die Regel „Immer `aktiv=0`, nie `DELETE`“ bleibt stehen.
4. **B4** (`:169-175`): `DESIGN_TOKENS_CSS` ergänzen (`core/design.js`, Export für Fragmente/Fremddokumente) und dazu
   die Regel, wann welcher Export zu nehmen ist, wie sie in `core/design.js` steht.
5. **B5–B7, T1** (Anmerkungen):
   - `golive-studio.sh` als weiteren Nutzer von better-sqlite3 nennen;
   - „47 Blöcke in 24 Dateien“ als Befund vom 12.08.2026 kennzeichnen;
   - den Schema-Drift-Wächter richtig verorten (monatlicher Cron, kein Deploy-Schritt);
   - bei `ops/gymdocu-deploy-drift.js` dazuschreiben, dass er im Hauptserver-Repo liegt.
6. **T2:** Viele Kommentare im Code berufen sich auf CLAUDE.md-Abschnitte, die nur in der CLAUDE.md des
   Belehrungssystem-Repos stehen, z. B. „Dieselbe Aussage an zwei Orten“ oder „Transaktionen und Sperren“. Ergänze in der
   GymDocu-CLAUDE.md EINEN Satz: Solche Verweise meinen die CLAUDE.md im Belehrungssystem-Repo. Die Kommentare NICHT
   anfassen.
7. **H1:** Modellnamen in Kommentaren verstossen gegen die Regel „keine Modellnamen in Code und Kommentaren“. Die Fundstellen:
   - `core/qr-token.js:601, 693, 731`;
   - `routes/archiv.js:220`;
   - `test_feature_unterschriften_neueste.js:57, 556`;
   - `test_feature_qr_lage_blocklokal.js:409`;
   - `test/helfer/datei-sperre.js:4`.

   Ersetze die Namen durch neutrale Wörter wie „Prüfspur“ oder „Gegenlesung“.
   - Zuerst selbst über den ganzen Baum suchen (`git ls-files`, Muster für Claude, DeepSeek, Kimi, GPT, Sonnet, Opus, Fable,
     Astra; Gross- und Kleinschreibung beachten). Das Suchmuster lernst du an einer der genannten Stellen. Melde die Zahl
     vorher und nachher.
   - Ausnahmen, die NICHT angefasst werden:
     - Wörter, die keine Modellnamen sind (z. B. „Astra“ als Teil eines anderen Worts);
     - Stellen, an denen ein Name technisch nötig ist (z. B. eine Kennung in einer Konfiguration). Begründe jede.
   - Ändert sich an einer Stelle etwas, das ein Wächter prüft, ist der Wächter Massstab und nicht der Kommentar.
8. **H3:** Den englischen Kommentar `workers/pdf-job-worker.js:4` auf Deutsch übersetzen.
   - Achtung: Der Zweig `c6b-jobs-krypto` ändert dieselbe Datei. Ändere NUR diese eine Zeile, damit der Merge
     konfliktfrei bleibt. Gibt es trotzdem einen Konflikt, lass H3 weg und melde es.

Rahmen:
- Volle Suite (Kommentare können Wächter berühren), gegen die eigene DB-Konvention; die Sperrdatei nie löschen.
- Dateizahl-Ritual, Lint.
- Commit und Push, kein PR.
- Keine Modellnamen in Commits.

## Teil 2: Hauptserver

Arbeitsbaum `/workspace/hauptserver-doku`, neuer Zweig `doku-claudemd-abgleich` ab `origin/master` des Repos unter
`/home/user/gymdocu-hauptserver`. Der Hauptklon dort steht auf einem anderen Zweig; ihn NICHT umschalten, einen
`git worktree` nehmen.

1. **D (wichtigster Punkt)** (`CLAUDE.md:92-94`): Dort steht, `pm2 restart` laufe „**ohne** `--update-env`“. Der Deploy
   macht es anders: `ops/gymdocu-deploy:743` ruft `restart … --update-env` auf, und zwar NACH dem vollständigen Sourcen von
   `.env` und `/etc/environment`. Begründung dort: `:690-696`. Gepinnt ist das in
   `test_feature_ops_attrappen_erzwungen.js:360`. Den Satz auf den echten Mechanismus berichtigen: `--update-env` nur nach
   vollständigem Sourcen; der Vorfall vom 01.07. betraf einen nackten Aufruf aus einer leeren Shell.
2. **A, B** (`:41-42`): Statt „17 Suiten“ die echte Zahl aus `test/run.sh`, oder die Zahl ganz weglassen und auf die Liste
   verweisen. Statt „zwei Prüfungen“: die Jobs aus `.github/workflows/ci.yml`.
3. **C** (`:24-26`): Wer `provisionToken()` heute wirklich liest: `core/offboarding-core.js`, dazu die lokalen Kopien
   in `routes/registrierung.js`, `routes/superadmin-import.js` und `routes/superadmin.js`. Den Code NICHT ändern; die
   Kopien kommen auf die Sammelliste.
4. **E** (`:21-23`): „die vier mandantenlosen Verwaltungsaufrufe“ öffnen (z. B. „u. a.“) und `/intern/wartung` ergänzen.
   `../gymdocu/server.js:163-225` am GymDocu-master nachmessen und den Zeilenverweis nachziehen.

F, G und H sind Code-Befunde, sie werden NICHT gebaut; sie kommen auf die Sammelliste.

Rahmen:
- Die Suite des Hauptservers (`test/run.sh`) voll fahren.
- Commit und Push, kein PR.
- Keine Modellnamen in Commits.

## Bericht

Je Punkt: was gemessen wurde, Diff-Kern, „trägt / trägt nicht“. Für beide Suiten SUITE_EXIT, Dateizahl und Lint wörtlich.
Bei H1 die Treffer vorher und nachher.

-- Ende des Auftrags --
