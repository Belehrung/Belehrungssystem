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

---

## Nacharbeit 1 (23.09.2026) — dieselbe Klasse überall, ein Helfer, ein Wächter

Anlass: Bericht des Executers (`93c1478`). `core/pruefbericht.js`
`loescheAlteBerichtDatei` ist derselbe Fehler (und `test_feature_pruefbericht.js` prüft
`existsSync` direkt nach der Antwort — dieselbe Rennklasse). Dazu gut 20 weitere
`fs.unlink(…, () => {})` in `routes/belehrungen.js`, `routes/admin/geraete.js`,
`routes/wartung.js` (abgelehnte Uploads aufräumen). Nach der Betreiber-Regel „eine benannte
Grenze ist kein Endzustand" werden sie in DIESEM Beitrag erledigt.

**Planprüfung ausgelassen, Begründung:** dieselbe, bereits gebaute und mit drei Gegenproben
gemessene Behebung wird mechanisch auf gleichartige Stellen übertragen; die Diffprüfung
(Claude-Spur plus eine Lesespur) läuft danach voll.

1. Neuer Helfer in `core/` (`entferneDatei(absPfad, req, quelle)`): wartet `fs.promises.unlink`
   ab, `ENOENT` = erledigt, jeder andere Fehler an `melde()` (in `try/catch`), wirft NIE.
2. `loescheAlteNachweisDatei` und `loescheAlteBerichtDatei` gehen über den Helfer; der Aufrufer
   von `loescheAlteBerichtDatei` (`routes/admin/geraete.js`, Prüfbericht ersetzen) wartet ab.
3. JEDES `unlink(…)` mit leerem Rückruf im Produktivcode wird ein abgewartetes
   `entferneDatei(…)`, und zwar BEVOR die Antwort rausgeht. Wo der Aufruf in einer
   synchronen Funktion steht (z. B. `uploadWegraeumen` in `routes/wartung.js`), wird der Weg
   so umgebaut, dass die Antwort nach dem Löschen kommt — nicht nur das `await` davor setzen.
4. Statischer Wächter (AST, `acorn`): im Produktivcode (Dateiliste aus `git ls-files`,
   Wurzeln literal) KEIN `unlink(…)` mit leerem Rückruf (Pfeil- oder `function`-Form,
   leerer Rumpf). Fixturen je Schreibweise rot, Durchlassfälle (abgewartetes
   `fsP.unlink` im `try`, `unlinkSync`) grün, in Produktionsform aufgerufen. Die gescannte
   Dateimenge wird gegen `git ls-files` gehalten.
5. Verhaltensprobe für die Prüfbericht-Ersetzung wie bei den Nachweisen (verzögertes echtes
   `unlink`, Datei ist nach der Antwort weg); Gegenprobe: Aufrufer ohne `await` → rot. Für
   die Upload-Aufräumwege genügt je Datei EINE Verhaltensprobe über eine echte Route plus der
   Wächter.
6. Wortlaut: in Kommentar und Test „CI-Fund 23.09.2026" statt „Betreiber-Fund"; der
   `melde`-Import-Kommentar nennt gescheiterte Dateilöschungen, nicht Protokoll-Ausfälle.
7. Gegenproben: Helfer ohne `await` (Rückgabe vor dem Löschen) → rot; eine umgestellte Stelle
   auf das alte Muster zurück → Wächter rot; ENOENT-Filter entfernt → rot.
8. Volle Suite, Dateizahl-Ritual (neue Testdatei in `test/run.sh` registrieren), Lint,
   Marker-Scan 6.

## Nacharbeit 2 (23.09.2026) — die drei benannten Grenzen des Wächters schliessen

Geprüft: `1254e5e` (Diff gelesen, 21 Stellen, fünf Gegenproben, Suite 351 = 351, Lint 0).
Der Wächter nennt drei Grenzen; nach der Betreiber-Regel werden sie jetzt geschlossen, nicht
stehen gelassen. Messung vorab (grep über alle Produktivwurzeln): heute KEIN
nicht-abgewartetes `unlink(` ausserhalb `entferneDatei` — die Verschärfung macht also im
Bestand nichts rot.

1. **Regel verschärfen:** nicht „leerer Rückruf", sondern JEDER Rückruf-Aufruf von `unlink`
   ist ein Verstoss (letztes Argument eine Funktion, gleich welcher Rumpf) — die Klasse ist
   „nicht abgewartet", nicht „leer". `() => undefined` und `(err) => { … }` werden damit rot.
2. **Berechneter Zugriff** `fs['unlink'](…)` / `fs["unlink"](…)` mit Zeichenketten-Literal ist
   ein Treffer; ein berechneter Zugriff mit NICHT-literalem Schlüssel auf ein Objekt namens
   `fs`/`fsP`/`fsSync`/`promises` ist ein FEHLER (nicht zuordenbar), kein Durchlass.
3. **Erfassungsbereich:** alle Produktivwurzeln wie im Lock-Inventar
   (`<wurzel>`, `core`, `ops`, `routes`, `tools`, `workers`), literal und gegen `git ls-files`.
4. Fixturen entsprechend umstellen (die drei bisherigen Durchlassfälle werden rot), je neue
   Regel eine Gegenprobe im Bestand (rot), zurückgenommen grün. Suite, Dateizahl, Lint, Marker.
