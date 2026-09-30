# Auftrag C2 Nacharbeit 5 (30.09.2026)

Grundlage: `plaene/diffpruefung-c2.md`, Runde 5 (C2R5-1..13). Baum `/workspace/gymdocu-c2`, Kopf `52a7d4f`. Mess-Skripte
der Prüfspur: `scratchpad/c2r5cc/` (`treiber.js`, `kind.js`, `treiber-http.js`, `wce.sh`, `ernte-probe.js`,
`mutationen.js`) — vor und nach dem Bau, wörtlich. Einzeltests gegen `gymdocu_c2n5_test`. Planprüfung ausgelassen: die
Behebungen hat die ausführende Spur vorgeschlagen und gemessen; einzig neu ist die Signal-Neuauslösung (Punkt 1), die
die Diffprüfung misst. Einordnung: Standard.

1. **Signal (C2R5-2):** nach dem Leeren die eigenen SIGINT/SIGTERM-Listener entfernen und das Signal mit
   `process.kill(process.pid, name)` neu auslösen (Signaltod wie ohne Handler); zweites Signal während des Leerens →
   Listener entfernen und sofort neu auslösen. Test (d) auf `signal === 'SIGTERM'` (bzw. SIGINT) statt Exit-Code;
   neuer Test: eine Bash-Schleife über zwei Kindprozesse, SIGINT an die Gruppe → Schleife bricht ab (Muster
   `wce.sh`). Kommentar im Code berichtigen (mein Auftrag hatte „130/143 wie Nodes Standard“ — falsch).
2. **C2R5-3:** `ecosystem.config.js` — der Webprozess bekommt eigenes `kill_timeout: 15_000` (Leeren ≤ 5 s), der Worker
   behält 120 s (Drain). Ob `pm2 reload ecosystem.config.js --update-env` (`ops/deploy.sh:355`) das übernimmt, ist hier
   nicht messbar (kein pm2) → im Bericht als ungemessen benennen; Wächter, die `ecosystem.config.js` lesen, anpassen.
3. **Tests, die fallen können (C2R5-1, -4, -5, -7):** Kind-Attrappe schreibt erst beim ABSCHLUSS (verzögert, z. B.
   300 ms) eine Fertig-Zeile; Signal-, Absturz- und CLI-Fall sichern die Fertig-Zeile zu (K5, K6, G1 → ROT); catch-Weg
   von `regenerierePdfMonat.js` mit einem Stub-Monatslauf, der nach `melde()` wirft (G2 → ROT); hängendes fetch → Ende
   nach 5 s ± Toleranz (K3 → ROT); zweites Signal → sofortiges Ende (K4 → ROT); nach Abschluss `laufendeSendungen.size
   === 0` (K1 → ROT; dafür ein Test-Export).
4. **Ernte (C2R5-6, -8, -9):** `optionen.unlink` injizierbar; EACCES beim Löschen → `fehler: 1` plus `ERNTE_FEHLER`
   (R8 → ROT). Fixturen knapp neben der Erzeugerform (`12345678901-abcdef12-x`, 7 Hex, Grossbuchstaben-Hex) → Anomalie
   (R2 → ROT); `a.tmp-b.pdf` ausserhalb der Quarantäne → kein Kandidat (R6 → ROT); `process.exitCode` nach
   `ernteInProcess` zurückgesetzt (R4 → ROT); Log-Bedingung in `server.js` (S1 → ROT). Nicht-Dateien (FIFO, Socket)
   unter `_quarantaene/` und mtime mehr als 1 h in der Zukunft → Anomalie, im Log, nie gelöscht.
5. **Folgemeldung (C2R5-10):** alle gehaltenen Studios nennen; nur wenn der Text 3500 Zeichen überschreiten würde,
   abschneiden mit „+K weitere“. Test (a) auf die volle Liste 2..50 umstellen, dazu ein Fall mit so vielen langen
   Studio-Kennungen, dass die Grenze greift.
6. **Kleines (C2R5-11, -12, -13):** Zeitgeber zuerst setzen, dann das Fenster eintragen (oder Eintrag im catch
   entfernen) — Test mit werfendem Zeitgeber: zweite Meldung derselben Gruppe geht sofort raus, nicht gehalten;
   `_reset()` leert auch `laufendeSendungen`; Probelauf-Ping-Zusicherung mit Positivkontrolle (derselbe Aufbau im
   scharfen Lauf ergibt einen Ping).

Volle Suite + Dateizahl-Ritual. Zustandsfrage: Verhält sich ein pm2-Reload, ein Strg+C in `test/run.sh` und ein
hängender Webprozess danach wie vor Nacharbeit 4 — und wo nicht, warum?

-- Ende des Auftrags --
