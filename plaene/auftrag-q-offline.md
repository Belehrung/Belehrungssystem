# Auftrag Q — Offline-Warteschlange und Kamera (Extrarunde)

Fassung 1, 30.09.2026. Repo GymDocu, Stand `origin/master`. Die Fundorte stehen in `plaene/c5-zustand-30-09.md`
(Abschnitt `v07-11-12`, V12-*) und `plaene/planpruefung-p2.md` (PP2-K3, PP2-K4b). Jede Fundstelle ist vor dem Bau neu
zu messen.

Modell: Standard-Executer. Clientcode (`public/*.js`) läuft im Browser; der Beleg kommt aus einem Chromium-Test gegen
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

## Tests

- Je Antwortklasse aus 1 ein Fall, dazu Gegenprobe (Klassifizierung zurückdrehen ⇒ ROT).
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
