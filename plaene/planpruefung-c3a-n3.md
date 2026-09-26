# Planprüfung C3a Nacharbeit 3 (26.09.2026)

Eine Spur (Sparmodus): DeepSeek mit Repo-Lesezugriff auf `ed5f6a5`. Eingearbeitet in Fassung 2.

| Nr | Befund | Nachgesehen | Ergebnis |
|---|---|---|---|
| PC3-1 | Webhook-/Sync-SELECTs lesen nur `id`; das Papier nennt nicht, dass sie das Kennzeichen mitlesen müssen | Papier | getragen → genannt |
| PC3-2 | Kennzeichen im gemeinsamen Kern würde auch Magicline-Deaktivierung markieren | Papier | getragen → nur Admin-Weg |
| PC3-3 | Sync-Deaktivierung „nicht im Payload“ kassiert eine Admin-Reaktivierung sofort wieder | gelesen (`routes/api.js:317-326`) | entschieden: Deaktivieren bleibt Magicline erlaubt (sichere Richtung), benannt |
| PC3-4 | Audit-Weg im Webhook/Sync nicht festgelegt (Sperrordnung, Atomarität) | Papier | getragen → `auditTx` |
| PC3-5 | Sync-Test kann ohne den Mitarbeiter im Payload grün sein | Papier | getragen → Pflicht |
| PC3-6 | „0063 frei“ | der Prüfer sah den C3b-Zweig nicht; 0063 ist dort vergeben | gefallen → 0064 |
| PC3-7 | `belehrungen.js:843` als Tatsache formuliert | Papier | getragen → umformuliert |
