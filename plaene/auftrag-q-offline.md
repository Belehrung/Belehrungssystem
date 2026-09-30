# Auftrag Q — Offline-Warteschlange und Kamera (Extrarunde)

Fassung 2, 30.09.2026 (Planprüfung flash + kimi, `scratchpad/c5plan/dicht/*q*`; `public/offline-queue.js:120-200, 270-300, 350-372` selbst gelesen). **Modell: Fable 5.1** — Einordnung „sehr komplex“: mehrere Wege (Live, Sync, Konflikt-UI) wirken aufeinander, Fehlklassifikation ist Datenverlust mit Unterschrift, und ein Test kann aus dem falschen Grund grün sein. Repo GymDocu, Stand `origin/master`. Die Fundorte stehen in `plaene/c5-zustand-30-09.md`
(Abschnitt `v07-11-12`, V12-*) und `plaene/planpruefung-p2.md` (PP2-K3, PP2-K4b). Jede Fundstelle ist vor dem Bau neu
zu messen.

Clientcode (`public/*.js`) läuft im Browser; der Beleg kommt aus einem Chromium-Test gegen
einen lokalen Server (`test/helfer/chromium-start.js`) oder aus einer isolierten Ausführung der Funktion in Node mit
IndexedDB-Attrappe. Welche Form bestehende Tests nutzen, wird zuerst gemessen und übernommen.

**Grundsatz:** Kein stiller Datenverlust. Verwirft die Warteschlange etwas endgültig, sieht der Benutzer das. Nichts
wird endlos wiederholt.

## Punkte

1. **V12-1 und PP2-K3 — Endlos-Wiederholung.** `public/offline-queue.js` (`fotosNachziehen`, `:167-175`; Sendeweg
   `:125-134`, `:292`, `:356-364`) wiederholt deterministische Endzustände endlos: 409 bei Fotos und 4xx/5xx ohne
   `code`.
   - Die Antworten werden unterschieden:
     - **Endzustand** (4xx ausser 401/408/429, dazu 409): der Eintrag bzw. das Foto wird aus der Warteschlange
       genommen, und ein sichtbarer Hinweis nennt, was nicht übertragen wurde. Der Hinweis kann
       weggeklickt werden, bleibt aber, bis er gelesen ist.
     - **Vorübergehend** (Netzfehler, 5xx, 408, 429): Wiederholung mit Rückzug.
     - **Nicht angemeldet** (401): wie heute.
   - Vorher messen, welche Codes der Server für Foto- und Prüfeinträge heute tatsächlich liefert (P2-Tabelle
     `docs/p2-fehlerstatus-tabelle.md`), und die Einteilung daran ausrichten.
2. **PP2-K4b** `sendeFoto` (`:147`): Auch `resp.redirected` (auf die Anmeldung) gilt als „nicht angemeldet“, nicht als
   Erfolg.
3. **V12-2** `:281`, `:167-172`: `qPut` nur, wenn noch Fotos übrig sind; ist `fotos.length === 0`, dann
   `qDelete(client_uuid)`.
4. **V12-6** `:61-63`: `utcJetzt` heisst in Wahrheit Berliner Zeit. Umbenennen auf `jetztBerlin` (beide Stellen) und
   den Kommentar schärfen.
5. **V12-7** `:231-234`: `qDelete` und die äussere Sync-Kette bekommen `catch`. Ist IndexedDB nicht verfügbar, zeigt
   das Badge „Offline-Speicher nicht verfügbar“.
6. **V12-8** `public/qr-kamera-scan.js:411-424`: Zu Beginn von `kameraStarten` wird ein laufender Stream gestoppt, damit
   kein zweiter Kamerastrom offen bleibt.
7. **V12-4** `test/e2e-durchlauf.js:426-427`: Der Monat wird über `formatBerlinDate(new Date()).slice(0,7)` gebildet.
8. **V12-5** `test/e2e-durchlauf.js:402-410`: `PDF_ROOT` und `BELEHRUNGEN_UPLOAD_DIR` zeigen vor dem Serverstart auf
   `mkdtemp`-Pfade, nicht in das Repo. Die Datei kommt NICHT in `test/run.sh` (Browser-E2E ist kein Deploy-Gate), es
   sei denn, der Bestand macht das bereits; das wird gemessen.

## Fassung 2 — verbindlich, ersetzt Punkt 1 und 3 oben und schärft 2, 5, 6, 8

**Was bleibt, wie es ist.** `bereits_geprueft` und `validierung` werden heute ABSICHTLICH als `konflikt` mit
Nachtrageliste und Verwerfen-Knopf aufbewahrt (`:356-364`). Das bleibt so. KEINE Einteilung nach HTTP-Status:
- Beide Sender werfen den Status weg (`:129-133`, `:144-150`).
- Die Codes sind fachlich gepflegt.
- Eine Pauschalregel über „4xx“ würde Unterschriften vernichten.

**Neue Regel, ohne Löschen:** Was sich nicht übertragen lässt, wird zum `konflikt` und damit sichtbar. Endgültig weg
ist es erst, wenn der Benutzer es in der vorhandenen Konflikt-UI selbst verwirft.

**1a. Fotos mit fachlicher Ablehnung (V12-1).**
- `sendeFoto` reicht `code` durch; heute liefert es bei jeder Nicht-401-Antwort nur `{ok:false}`.
- Codes der Foto-Route vorher messen (heute u. a. `geschlossen`, `max`, `leer`, `heic`, 404, siehe
  `routes/sichtpruefung.js:3421-3474`).
- Ein Code, der sich beim nächsten Versuch nicht ändern kann (Defekt geschlossen, Maximum erreicht, Defekt weg),
  macht den Eintrag zum `konflikt`. `fehler` nennt Foto und Grund. Kein stiller Wurf.
- Dasselbe gilt für den lokalen Fall „Defekt-ID fehlt“ (`:163-165`, heute stilles Verwerfen mit `{ok:true}`).

**1b. Wiederholungsdeckel für Sitzungen (PP2-K3).**
- Das Feld `versuche` gibt es schon (`:270-300`). Jeder gescheiterte Sync-Versuch mit `code: 'server'` bzw. ohne
  Code zählt hoch.
- Ab 10 Versuchen wird der Eintrag zum `konflikt` („Server lehnt wiederholt ab — bitte prüfen“). Er wird nicht
  gelöscht.
- Netzfehler (fetch wirft bzw. Zeitüberschreitung) zählen NICHT; das ist Offline, kein Fehler des Eintrags.
- Eine Duplikatantwort der idempotenten Sitzung ist ein Erfolg, KEIN Konflikt. Vorher messen, was ein Replay
  liefert (`routes/sichtpruefung.js:2397-2411`).

**2. Live-Pfad bei abgelaufener Anmeldung.**
- `sendeFoto` erkennt `resp.redirected` mit Login-URL als `{auth:true}` (wie `sendeSitzung`, `:129-130`).
- Im Live-Pfad (`:281-285`) gilt `fs.auth` wie `fs.ok === false`: Meldung an den Benutzer und die restlichen Fotos
  in die Queue (siehe 3). Danach KEINE Navigation zur Erfolgsseite, ohne dass die Meldung gezeigt wurde.

**3. `fotosNachziehen` schreibt im Live-Pfad nicht in die Queue (V12-2).**
- Parameter `persistieren`: `true` nur im Sync-Pfad.
- Im Live-Pfad legt der Aufrufer den Eintrag nur dann in die Queue, wenn Fotos übrig bleiben, ausdrücklich mit
  `status: 'offen'` (die Sitzung selbst ist gespeichert, das Replay ist idempotent).

**5. IndexedDB-Fehler (V12-7).**
- Ein gemeinsamer Helfer `qDeleteSicher` bzw. `qPutSicher` mit catch. Im Fehlerfall zeigt das Badge ohne weiteren
  DB-Zugriff „Offline-Speicher nicht verfügbar“.
- Reihenfolge `.catch(...).finally(...)`, damit `syncLaeuft` nie hängen bleibt.
- Die Meldung erscheint auf den Seiten, die `#gdQueueBadge` einbinden (`routes/module.js:2351/2398`,
  `routes/sichtpruefung.js:1889/2202`). Andere Seiten sind nicht betroffen.

**6. Kamera (V12-8).**
- Ein Generationszähler bzw. Start-Token in `kameraStarten` (ab `:380`). Der `then`-Handler einer veralteten
  Generation stoppt SEINEN Stream. Beim Start wird ein laufender Stream gestoppt.
- Test mit VERZÖGERTER `getUserMedia`-Auflösung und Doppelstart OHNE „Abbrechen“; `overlaySchliessen` stoppt sonst
  ohnehin. Beide Streams: der erste ist gestoppt, `aktuellerStream` ist der zweite.

**8. E2E (V12-5).**
- `test/run.sh` ruft `test/e2e-durchlauf.js` NICHT auf (gemessen).
- Umzustellen sind der Serverstart `:149-153` (die Umgebung bekommt `PDF_ROOT` und `BELEHRUNGEN_UPLOAD_DIR`, beide
  `mkdtemp`), `:402/:410` (Pfade aus dieser Umgebung ableiten) und `:299-300` (PDF-Lesen aus `PDF_ROOT`).
- Aufräumen im `finally`.

**4. V12-6.**
- Der Test prüft die Umbenennung und das UNVERÄNDERTE Ausgabeformat (Vorher/Nachher-Vergleich), nicht eine
  ISO-Form.
- Der Kommentar nennt, dass der Server den String als Berliner Wanduhr liest.

**Zusätzlich:**
- Die Quelltext-Zusicherung `test_feature_nutzungsentscheidung.js:285-286` (auf `public/offline-queue.js:292`) wird
  fachlich mitgezogen.
- `test/rohwert-budget.json` (Eintrag `public/offline-queue.js`) wird NICHT erhöht. Neue UI nimmt nur Design-Token.

## Tests

- 1a: je Foto-Code ein Fall, dazu „Defekt-ID fehlt“. Jeder Fall wird `konflikt` mit `fehler` und bleibt in
  `qAlle()`. Positivkontrolle: ein erfolgreicher Upload entfernt das Foto.
- 1b:
  - 9 Serverfehler ⇒ `offen`, der 10. ⇒ `konflikt`.
  - Netzfehler zählt nicht.
  - Duplikat ⇒ Erfolg.
  - Gegenprobe: Deckel entfernen ⇒ ROT.
- 3: drei Fälle — Erfolg (die Queue bleibt leer, per Spy auf `qPut` belegt), Teilrest (genau ein `offen`-Eintrag
  mit Restfotos) und der Sync-Weg.
- Für 2: Umleitung auf `/login` ⇒ nicht als Erfolg gewertet.
- Für 3 und 5: Verhalten mit IndexedDB-Attrappe (Fehler werfen).
- Für 6: zweimal starten ⇒ der erste Stream wurde gestoppt (Attrappe von `getUserMedia`).

## Regeln

- Arbeitsbaum `/workspace/gymdocu-q` (Zweig `q-offline`, von `origin/master`).
- Einzeltests gegen `gymdocu_q_test`, NIE gegen `gymdocu_test`. Lock nie löschen. KEINE Migration.
- Volle Suite: Aufruf `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`, Dateizahl-Ritual, Lint wörtlich.
- Bei Änderung am Aussehen (Hinweis, Badge): Screenshot des Tablet-Layouts (820 px) mitliefern und den Kontrast mit
  `node /home/user/Belehrungssystem/.claude/skills/design-pruefung/kontrast.js` rechnen. Farben nur aus
  `core/design.js`.
- Committen und pushen vor langem Warten. Kein PR. Bericht je Punkt mit Beleg.
