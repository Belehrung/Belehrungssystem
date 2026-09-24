# P2 — Fehlerseiten mit korrektem HTTP-Status (U-STAT1, U-STAT2)

Stand GymDocu master `946647a` (P3 drin). Einordnung: Standard-Executer. Es sind viele Stellen mit demselben Handgriff.
Heikel sind nur die Verbraucher, die heute auf 200 bauen, und der Wächter, der falsch grün sein kann.
Vorgeschichte: `plaene/auftrag-pentest-p1-p2.md`, Abschnitte „P2“. Die Zahl 265 von dort wird NICHT übernommen,
sondern neu gemessen.

## Befund (Fundorte, vom Executer neu zu messen)

* Fehlerseiten gehen mit `res.send(layout("Fehler", …))` bzw. `class="error"` ohne `.status()` raus, also mit HTTP 200.
  Überwachung, Scanner und jede Zusicherung „antwortet 200“ sehen einen Fehler als Erfolg.
* Weitere Formen: Fehlerinhalt aus Helfern (`ladeBestandFehlerinhalt()`), JSON mit `ok:false` ohne Status (gemessen 5),
  Zustandsseiten ohne Fehler-Marker („Bereits ausgemustert“).
* nginx fängt keine Fehler ab (kein `error_page` und kein `proxy_intercept_errors`, gemessen 24.09.2026). Fehlerrümpfe
  kommen also unverändert beim Browser an, auch mit 4xx/5xx.
* Seit P3 gibt es `core/fehlerbehandler.js` mit Positivliste (400 ohne Alarm) und `EingabeFehler`.

## Auftrag

1. **Vorher messen und als Tabelle melden:**
   (a) Die endgültige Menge der Stellen per AST, alle Formen oben. Je Stelle: Datei:Zeile, heutiger Status,
       vorgeschlagener Status, Grund.
   (b) Wer baut heute auf 200? `fetch(`/`XMLHttpRequest` in eingebetteten Skripten und `public/`, die bei `!res.ok`
       anders reagieren als beim Anzeigen des Rumpfes. Besonders `public/offline-queue.js`: Wie behandelt
       `sendeSitzung` eine 4xx/5xx-Antwort mit HTML-Rumpf? Wird daraus ein endloser Wiederholversuch oder ein
       verlorener Eintrag?
   (c) Service-Worker- und Cache-Verhalten bei Nicht-200.
   (d) Tests, die für Fehlerseiten 200 zusichern.
   Jede Fundstelle wird angepasst; der Status wird dafür nicht zurückgenommen.
2. **Statusregel:** Eingabefehler 400, fehlende Anmeldung 401 bzw. Weiterleitung wie heute, fehlende Rechte 403,
   nicht gefunden (auch fremdes Studio) 404, Zustandskonflikt 409, Ausnahme im `catch` 500.
   **Teilausfall-Seiten bleiben bewusst 200** (Zusicherungen in `test_feature_ladestand_dbfehler.js`). Diese Stellen
   werden in der Tabelle als solche gekennzeichnet. Alarmverhalten (`intern()`/`melde()`) bleibt unverändert; es
   ändert sich NUR der Status. Kein Umbau der Fehlerwege.
3. **Wächter (statisch, AST, Muster der vorhandenen acorn-Wächter):** Kein `res.send(`/`res.json(` mit Fehlerinhalt
   ohne gesetzten Status. Ausnahme: ausdrücklich als Teilausfall gekennzeichnete Stellen, per Kommentar-Marker mit
   Begründung. Die Erkennungsregel für „Fehlerinhalt“ wird an den heute RICHTIGEN Stellen gelernt, nicht geraten.
   Fixturen rot/grün. Die gescannten Dateien werden als MENGE gegen `git ls-files` gehalten, mit eigenständig
   hingeschriebenem Filter. Die Zahl der Stellen wird je Datei als von Hand hergeleitete Zuordnung zugesichert.
4. **Verhaltenstests** über den echten Router, mindestens je eine Stelle pro Statusklasse. Zusätzlich
   Offline-Queue-Verhalten bei 4xx, falls 1(b) etwas findet. U-LBW1: `test_feature_ladestand_dbfehler.js` prüft
   zusätzlich den Status.

## Gegenproben (je einzeln ROT und zurück GRÜN, wörtlich)

(a) An einer Stelle je Klasse den Status entfernen → Verhaltenstest ROT UND Wächter ROT.
(b) Die Erkennungsregel des Wächters um eine gelernte Form kürzen → Fixtur ROT.
(c) Einen Teilausfall-Marker auf eine echte Fehlerstelle setzen → der Wächter muss das erkennen
    (Marker nur mit Begründung und nur an zugelassenen Stellen).

## Fragen an die Planprüfung

* Welcher Zustand entsteht dadurch, den es vorher nicht gab? Denk an Offline-Queue, Tablet-Formulare, Browser-Cache,
  Scanner, Überwachung, Weiterleitungsketten.
* Was wird durch die Behebung schlechter?
* Kann der Wächter grün sein, obwohl eine Fehlerseite mit 200 übrig ist?
