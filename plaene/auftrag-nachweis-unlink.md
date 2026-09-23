# Bauauftrag: Nachweis-Datei abwarten und Fehler melden (23.09.2026)

**Anlass:** CI-Rot an einem fremden PR: `test_feature_einweisung_nachweis.js` →
`✗ FAIL: Datei von der Platte entfernt`. Ursache (gelesen): `loescheAlteNachweisDatei()` in
`routes/belehrungen.js` ruft `fs.unlink(…, () => {})` — nicht abgewartet, Fehler verschluckt,
die 302-Antwort geht vor dem Löschen raus. Der Test prüft `fs.existsSync` direkt danach.
Nebenbefund mit Gewicht: ein gescheitertes Löschen eines personenbezogenen Nachweises bleibt
still.
**Planprüfung ausgelassen:** eine Funktion, zwei Aufrufstellen, deterministische Gegenprobe —
die Diffprüfung läuft wie üblich.
**Modellwahl:** Standard-Executer.

## Auftrag

1. `loescheAlteNachweisDatei` wird `async` und wartet `fs.promises.unlink(...)` ab.
   `ENOENT` gilt als erledigt (Datei ist schon weg). Jeder ANDERE Fehler wird über
   `melde()` aus `core/error-tracker` gemeldet (Muster wie in `routes/admin/geraete.js`:
   `try { melde(e, req, '<kennung>') } catch (me) {}`) — die Anfrage scheitert daran NICHT
   (die DB-Zeile ist schon geschrieben; eine liegengebliebene Datei meldet
   `ops/nachweis-waisen-melden.js`).
2. BEIDE Aufrufstellen (`loescheAlteNachweisDatei(` — Einweisung und Mitarbeiter-Nachweis)
   warten das Löschen ab, BEVOR die Antwort rausgeht. Nachsehen, dass beide NACH dem
   DB-Schreiben liegen (Löschen nie vor dem Commit).
3. **Deterministischer Test** (neue Datei oder Erweiterung von
   `test_feature_einweisung_nachweis.js`): `fs.promises.unlink` im Testprozess so umhüllen,
   dass es 300 ms verzögert und dann echt löscht. Zusicherung: unmittelbar nach der
   302-Antwort ist die Datei weg — für Einweisung UND Mitarbeiter-Nachweis.
   **Gegenprobe:** Aufrufstelle ohne `await` → rot, und zwar an dieser Zusicherung.
4. **Fehlerweg:** `unlink` wirft `EACCES` → Antwort trotzdem 302, DB-Zeile geschrieben,
   `melde` genau einmal aufgerufen (Attrappe — KEIN echter Telegram-Alarm; nachsehen, wie
   andere Tests `core/error-tracker` ersetzen). `ENOENT` → kein `melde`.
   **Gegenprobe:** `catch` wieder leer → rot.
5. **Nur Fundorte, NICHT umbauen:** weitere `fs.unlink(…, () => {})` in `routes/`
   (Aufräumen abgelehnter Uploads). Im Bericht zählen und je Stelle sagen, ob ein Test direkt
   danach `existsSync` prüft (gleiche Wettlaufklasse).

## Abnahme
Volle Suite (`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`), Dateizahl-Ritual,
`npm run lint` wörtlich, Marker-Scan 6. Gegenproben mit erstem FAIL wörtlich, Rücknahme per
`cp`/`diff` EXIT 0. Commit + Push auf `fix-nachweis-unlink`, KEINE PR.
