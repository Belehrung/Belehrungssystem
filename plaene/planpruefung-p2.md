# Planprüfung P2 — Fehlerseiten mit korrektem HTTP-Status (24.09.2026)

Spur A: DeepSeek mit Repo (13 Runden, 1,14 $ geschätzt). Spur B: Kimi mit Bündel (Lauf 1 durch Container-Neustart
verloren, neu gestartet).

| Nr. | Spur | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| PP2-1 | A | `module.js:1379` `{ok:false, keineSperre:true}` ist ein bewusster Ergebniszustand, kein Fehler | gelesen `:1372-1381` | bleibt 200, Kategorie „Ergebniszustand“ |
| PP2-2 | A | `/intern/health` antwortet bewusst 200 mit `ok:false` (Vertrag mit `ops/health-gate.sh`) — ein 4xx/5xx sperrt den nächsten Deploy | gelesen `health-intern.js:232-238` | ausgenommen, Wächter-Ausnahme mit Begründung |
| PP2-3 | A | `res.status(200)` gilt als „Status gesetzt“ → Wächter grün | gelesen | Regel: Fehlerinhalt braucht Status ≥ 400 oder eine benannte Ausnahme |
| PP2-4 | A | `qr-scan.js` `keineAuskunft` bewusst 200 (Orakelschutz: gesperrtes Studio nicht erkennbar) | gelesen `:436-442` | ausgenommen, Begründung im Code |
| PP2-5 | A | „zugelassene Stellen“ für Teilausfall-Marker nicht definiert | Papier | Zulassungsliste = Tabelle aus 1(a), der Wächter liest sie |
| PP2-6 | A | Lernmenge nur aus heute richtigen Stellen verfehlt Formen ohne Marker (Zustandsseiten, Helfer `ladeBestandFehlerinhalt()`, `jFehler`-Pfeile) | gelesen | Lernmenge = ALLE Formen aus 1(a), je Form eine Fixtur |
| PP2-7 | A | U-LBW1: `test_feature_ladestand_dbfehler.js` sichert den Status schon zu (5×200); `:460` sichert 200 für eine Fehlerseite | gelesen `:441-521` | U-LBW1 umformulieren; `:460` fachlich prüfen |
| PP2-8 | A | 401 „bzw.“ Weiterleitung unentschieden | Papier | Regel: JSON (Accept/`antwort=json`) → 401, HTML → Weiterleitung wie heute |
| PP2-9 | A | 413/415 der P3-Positivliste nicht zurückdrehen | gelesen `fehlerbehandler.js` | festgeschrieben |
| PP2-10 | A | Teilwirkung + Fehlerseite (`geraete.js:2866-2869`: „Antworten gespeichert, Abgleich scheiterte“) — 500 oder 200? | gelesen | Kriterium: Seite meldet einen Fehler des angeforderten Vorgangs → 500, auch wenn Teilschritte gespeichert sind; der Text bleibt |
| PP2-11 | A | Offline-Queue: jede Nicht-401-Antwort ohne JSON → Endlos-Wiederholung, Kettenblockade — VORBESTEHEND, P2 ändert daran nichts (Queue wertet den Rumpf aus) | gelesen `offline-queue.js:125-134` | nicht P2; Sammelliste (V12-1-Nähe) |
| PP2-12 | A | Service Worker cacht nur 200, Navigationen nie → kein neuer Zustand | gelesen | kein Befund |
| PP2-13 | A | nginx `error_page … =200` wäre für den statischen Wächter unsichtbar | Logik | benannte Grenze im Wächterkopf |
