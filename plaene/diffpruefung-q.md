# Diffprüfung Q — Offline-Warteschlange und Kamera

Stand 30.09.2026. Zweig `q-offline`, Commit `a5ac198`. Der Bau meldet: Suite `SUITE_EXIT=0`, 415 = 415 Dateien, Lint EXIT 0, 10 Gegenproben ROT.

Spuren:
- Lesespur `deepseek-flash` mit Repo-Werkzeugen, Ausgabe in `scratchpad/q-diff/flash.txt`.
- Ausführende Claude-Spur mit Mutationen in eigenem Arbeitsbaum `/workspace/gymdocu-qpr` und DB `gymdocu_qpr_test`.

## Eigene Befunde (Diff selbst gelesen)

| Nr | Schwere | Stelle | Befund | Szenario |
|---|---|---|---|---|
| Q-E1 | blockierend | `public/offline-queue.js` `versuchZaehlen` / `badgeRender` | Ein Konflikt der Art `wiederholt` ist eine Sackgasse. Der Sync nimmt nur `offen`, und die UI bietet nur „Eintrag verwerfen“. | Der Server antwortet ~10 Sync-Zyklen lang (setInterval 60 s) mit einer HTML-Fehlerseite (502/503 bei Deploy oder pm2-Neustart). `resp.json()` scheitert, das ergibt `code 'server'` und zählt gegen den Deckel. Eine gültige, unterschriebene Prüfung wird danach nie mehr gesendet. Vorher wurde sie endlos wiederholt und kam irgendwann an. |
| Q-E2 | blockierend | Sync-Zweig `fotosNachziehen(...)` → `versuchZaehlen(e, 'Foto-Upload: …')` | Die Sitzung ist GESPEICHERT, nur die Fotos scheitern 10× mit einem Serverfehler. Der Eintrag wird dann `wiederholt`. `badgeRender` zeigt dafür den Zweig „konnte nicht übernommen werden“ samt „Erfasste Defekte (bitte manuell nachtragen)“. | Die Anweisung ist falsch. Der Benutzer trägt bereits gespeicherte Defekte doppelt ein. Die Restfotos (Blobs) werden nicht mehr versucht. |
| Q-E3 | sollte | `badgeRender`, `speicherFehler` | Ein einziger gescheiterter IndexedDB-Zugriff setzt `speicherFehler` bis zum Neuladen. Danach rendert das Badge nur den Hinweis und blendet vorhandene Konflikte samt Verwerfen-Knopf aus. | Ein einmaliger Quota-Fehler beim Zurückschreiben eines Fotos macht alle Konflikte der Seite unsichtbar. |

## Entscheidungen

- **E2E-Riegel** (`test/e2e-durchlauf.js:27`):
  - Er wird für `gymdocu_<kürzel>_test` geöffnet. Muster: `/\/gymdocu(_[a-z0-9]+)?_test(\?|$)/`.
  - Begründung: Die Hausregel verlangt für Einzelläufe eine eigene `_test`-DB. Der Riegel liess nur die Suite-DB zu und machte Punkt 8 damit unprüfbar.
  - Danach läuft Punkt 8 einmal gegen eine eigene DB.
- Die Spurbefunde folgen unten, jeder selbst nachgemessen.

## Lesespur flash (9 Befunde), nachgemessen

| Nr | Schwere | Befund | Nachgemessen | Deckt sich mit |
|---|---|---|---|---|
| F1 | blockierend | Foto-Rest nach gespeicherter Sitzung zählt gegen den Deckel; `wiederholt` ist Sackgasse | gelesen, trägt | Q-E1/Q-E2 |
| F2 | sollte | `wiederholt` zeigt „nicht übernommen / bitte manuell nachtragen“ trotz gespeicherter Sitzung | gelesen, trägt | Q-E2 |
| F3 | **blockierend (Bestand)** | Server liefert `defekt_ids` mit POSITION (`routes/sichtpruefung.js:2909`, Replay `:2405`), Client sucht nach FORMULAR-Index (`map[foto.idx]`). Nach Löschen einer Defektzeile hängt ein Foto still am falschen Gerät. | gelesen: Server `neueDefektIds.map((id, i) => ({ idx: i, id }))` über sortierte Formular-Indizes; Client `data-gd-fotos` = Formular-Index | eigen |
| F4 | sollte | `speicherFehler` nie zurückgesetzt, blendet Konflikte aus; Verwerfen-Ergebnis ungeprüft | gelesen, trägt | Q-E3 |
| F5 | Anmerkung | Statische Zusicherung A11 (catch vor finally) wird schon von der inneren Kette erfüllt | plausibel, Spur misst | — |
| F6 | Anmerkung | `ok(true, …)` nach wurfendem `warte()` — ABBRUCH statt FAIL | gelesen | — |
| F7 | Anmerkung | Validierungs-Zweig nur als Literal geprüft | gelesen | — |
| F8 | Anmerkung | Rat „erneut hochladen“ ist bei geschlossen/max/defekt unausführbar | gelesen, trägt | — |
| F9 | Anmerkung | Äusserer Sync-catch etikettiert jeden Wurf (z. B. synchron in `sendeSitzung` bei beschädigtem Eintrag) als Speicherausfall | gelesen, trägt | — |

## Ausführende Claude-Spur (11 Befunde, 11 überlebende Mutationen)

Die tragenden Befunde sind nachgemessen bzw. gegengelesen:
- B1 (Regress gegenüber master) ist mit der Harness gemessen: nach 10× 502 bleibt der Eintrag im Konflikt, und nach der Erholung kommen 0 POSTs. Auf master bleibt der Eintrag offen, 1 POST, und die Queue ist danach leer.
- Die Tablet-Sperre ist selbst gelesen (`server.js:838-864`). Ohne JSON-Accept kommt eine 302 auf `/tablet/sperre`; mit `Accept: …json` kommt 401 JSON.
- B4 ist dasselbe wie F3, jetzt im Live-Pfad an echter Route und DB gemessen.
- CSRF hängt an Origin/Referer (`core/csrf-schutz.js`), nicht an einem Token. Ein veraltetes Token in der Queue gibt es also nicht.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| C1 | blockierend (Regress) | Der Deckel zählt HTML-Antworten (nginx 5xx, Wartung 503, Sperre-302) als „Server lehnt ab“. Nach 10 Zyklen entsteht eine Sackgasse. | Nacharbeit |
| C2 | blockierend | Deckel nach gespeicherter Sitzung ⇒ „bitte manuell nachtragen“ ⇒ Doppel-Defekte | Nacharbeit |
| C3 | sollte | `speicherFehler` blendet bis zum Neuladen alles aus | Nacharbeit |
| C4 | sollte (Bestand) | Positions-Index gegen Formular-Index: ein Foto hängt am falschen Defekt | Nacharbeit (Server) |
| C5 | sollte | 11 Mutationen überleben (M5, M8b, M8c, M9b, M10, M12, M17, M18, M19, M21) | Nacharbeit |
| C6 | Anmerkung | A11 findet die innere Kette; der finally-Kommentar ist falsch | Nacharbeit |
| C7 | Anmerkung | Der Rat „erneut hochladen“ ist je nach Code eine Sackgasse | Nacharbeit |
| C8 | Anmerkung | Die Live-Meldung ist doppelt formuliert | Nacharbeit |
| C9 | Anmerkung | Der PP2-K4b-Kommentar behauptet für sendeFoto einen master-Zustand, den es nicht gab | Nacharbeit |
| C10 | Anmerkung | `art 'fotos'` hält alle Formularfelder samt Unterschriftbild dauerhaft auf dem geteilten Tablet | Nacharbeit |
| C11 | – | Die Kamera-Behebung trägt | – |

Eine zweite Prüfrunde ist nötig, weil die Behebung Verhalten ändert (Deckel, Serverantwort, Badge).

## Runde 2 (Lesespur flash über Nacharbeit 1, `a5ac198..8c15e73`)

Selbst gelesen: `antwortLesen()`, `formularIndizes()`, die Zuordnung live und beim Replay (`defekte[i].idx`, 1:1 mit `neueDefektIds`). Der Befund zu 413/400 deckt sich mit meiner eigenen Lesung des Berichts (offener Punkt b).

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| R2-1 | blockierend (Regress) | JSON-Antworten der App ohne `ok` (413, 404, 400-Typ, 500 `{error}`) gelten als vorübergehend und zählen nie. Ein Eintrag mit zu grossem Body kreist ewig; der Text sagt „wird automatisch gesendet“. Auf master wurde er nach 10 Versuchen zum Konflikt. | Nacharbeit 2: vorübergehend sind NUR Netzfehler, Nicht-JSON (Proxy-HTML), Wartung 503 und auth. Jede andere App-Antwort zählt. |
| R2-2 | blockierend | Ein vorübergehender Fehler hält die ganze Kette an. Ein hängender Eintrag blockiert alle folgenden. | Nacharbeit 2: ein eintragsbezogener (gezählter) Fehler setzt die Kette fort; nur Netz, Wartung und Proxy halten sie an. |
| R2-3 | sollte | `speicherFehler` wird schon durch einen reinen Lese-Erfolg zurückgesetzt. | Nacharbeit 2: Rücksetzen nur nach einem erfolgreichen Schreiben oder Löschen |
| R2-4 | sollte | Die Replay-Zuordnung prüft nur die Anzahl, nicht die Indexmenge. | Sammelliste (braucht eine gespeicherte Formularindex-Spalte, also eine Migration). Der reguläre Client erzeugt den Fall nicht. |
| R2-5 | sollte | `art='fotos'` bleibt stehen, wenn `konfliktSetzen` ohne `art` gerufen wird. | Nacharbeit 2 |
| R2-6/7/8 | Anmerkung | `ok(true)` in B6l; 404 fehlt in der Liste; Kommentar zu 413 | Nacharbeit 2 |
| E2E | Bestand | `test/e2e-durchlauf.js` ist auf master rot (5 FAIL, Abbruch bei `:332`), das Skript ist gegenüber der App gedriftet. | Sammelliste |

## Runde 3 (Lesespur flash über Nacharbeit 2, `8c15e73..e32938b`)

Selbst gelesen: `badgeRender` (`public/offline-queue.js:440-462`). Ein Konflikt `wiederholt` zeigt „Erfasste Defekte (bitte manuell nachtragen)“ und daneben „Erneut versuchen“. Wer beides tut, trägt die Defekte doppelt ein. Damit trägt R3-1. Das Zählen von 5xx mit JSON bleibt trotzdem: ein Eintrag mit einem gleichbleibenden 500 würde sonst die Kette für immer anhalten, und der Konflikt ist über „Erneut versuchen“ umkehrbar. Falsch ist nur der Text.

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| R3-1 | sollte | Ein Ausfall über 10 Zyklen (500 `{error}`, 502/504 mit JSON) macht aus der Prüfung einen Konflikt `wiederholt` mit „bitte manuell nachtragen“ neben „Erneut versuchen“. Wer beides tut, trägt doppelt ein. | Nacharbeit 3: Zählen bleibt. Der Text für `wiederholt` nennt die Reihenfolge: erst „Erneut versuchen“; erst wenn das dauerhaft scheitert, von Hand nachtragen UND den Eintrag verwerfen. |
| R3-2 | sollte | CSRF-403 („Ungültige Herkunft“) zählt als Eintragsfehler. „Erneut versuchen“ von derselben Seite scheitert wieder. | Nacharbeit 3: wie `auth` behandeln (nicht zählen, Kette anhalten), Hinweis „Seite neu laden“ |
| R3-3 | sollte | Ist die Sitzung schon gespeichert und fehlen nur Fotos, endet ein 10-facher Sitzungsfehler beim Replay als `wiederholt` mit Nachtrageliste. | Nacharbeit 3: ist die Sitzung schon übernommen, zählt der Fehler als `art 'fotos'` (keine Nachtrageliste) |
| R3-4 | Anmerkung | `versuchZaehlen` wertet das Ergebnis von `qPutSicher` nicht aus. Bei vollem Speicher kreist der Eintrag über 10 hinaus. | Nacharbeit 3: Kette anhalten |
| R3-5 | Anmerkung | Der Live-Pfad nutzt `qPut` roh. Ein Erfolg setzt `speicherFehler` nicht zurück, das Badge widerspricht sich. | Nacharbeit 3 |
| R3-6 | Anmerkung | Für 408/429/Netz ist nicht belegt, dass sie die Kette anhalten. | Nacharbeit 3: je Fall ein zweiter Eintrag |
| R3-7 | Anmerkung | B6s stützt sich auf die Reihenfolge aus dem Vorblock. | Nacharbeit 3: Erwartung ausdrücklich |
| R3-8 | Anmerkung | Ein Captive Portal mit 200 + HTML lässt den Eintrag unbegrenzt kreisen, ohne Hinweis. Stand vorher genauso. | Sammelliste |
