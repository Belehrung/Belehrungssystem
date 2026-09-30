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
