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
