# Arbeitsplan: alle offenen Punkte (Betreiber-Auftrag 24.09.2026: „alle aufgaben lösen die noch offen sind“)

Reihenfolge nach Pentest-Bezug, dann Schwere. Höchstens ZWEI Beiträge bauen gleichzeitig. Der Engpass ist das eigene
Nachmessen; jeder Beitrag durchläuft das volle Ritual (Planprüfung → Bau → Diffprüfung → Suite → CI → Merge → Deploy
→ live-check). Bau mit dem Standard-Executer, Fable nur mit Begründung.

| # | Beitrag | Inhalt | Stand |
|---|---|---|---|
| A | P4 | Unterschrift: Punkt/Strich/zu klein ablehnen, 13 Eintrittspunkte | Diffprüfung R1 durch (8 Befunde), Nacharbeit läuft |
| B1 | P2 | Fehlerseiten mit korrektem HTTP-Status (`auftrag-p2-fehlerstatus.md`) | Planprüfung durch (20), Bau läuft |
| B2 | H1a/H1b | H1a: CSP Enforce ohne Umbau (`auftrag-h1a-csp-enforce.md`) — Planprüfung läuft; H1b: Nonces + Inline-Handler ablösen | H1a Planprüfung |
| B3 | Doku | `ops/SECURITY-HEADER.md`: `server_tokens off`, `http2`, CSP-Stand | offen |
| B4 | Betreiber | H3 HSTS-Preload (Entscheidung), H2-D8 Ratenbegrenzung `/login/tablet` in nginx | Frage an Betreiber |
| C1 | Entschiedene | V01-1, V09-1, V15-2 (`auftrag-c1-entschiedene.md`) | Planprüfung durch (18), Bau läuft |
| C2 | Stille Fehler | V02-3, V03-1, V04-3, V09-2, V09-3, V08-4, PP4b-22, V03-2 | offen |
| C3 | Datenintegrität | V02-2 CASCADE Getränkeanlage, V05-2 Audit Mitarbeiter-Löschung, V04-2 Doppelprüfung, V07-1 Mail-Doppelversand, V10-3 Replik-attempts, V12-1 Offline-Queue 409 | offen |
| C4 | Test-Wächter mittel | V16-1, V20-1, V12-3, T1-K4, N-1 | offen |
| C5 | Sammellisten Extrarunden | unlink (U-REAP1, U-LOE1..3, R6-13, R7-9, R9-12b, W-1), sperrordnung (1–3), h2 (R2-1..4), pentest-p1 (B1, A3, F1, V1, R2-N), s6 (1), ladebestand (1–21), P3-S1 | offen |
| C6 | Gering/Anmerkungen | V01..V27 „gering/Anmerkung“ in Themenbündeln (Texte/Kommentare, Test-Qualität, TZ-Randfälle) | offen |
| D | Deploy | SSH-Schritt mit Wiederholung | offen |
| E | Doku | IT-PDFs (`plaene/it-dokumentation-auftrag.md`) | offen |
