# Arbeitsplan: alle offenen Punkte (Betreiber-Auftrag 24.09.2026: „alle aufgaben lösen die noch offen sind“)

Reihenfolge nach Pentest-Bezug, dann Schwere. Höchstens ZWEI Beiträge bauen gleichzeitig. Der Engpass ist das eigene
Nachmessen; jeder Beitrag durchläuft das volle Ritual (Planprüfung → Bau → Diffprüfung → Suite → CI → Merge → Deploy
→ live-check). Bau mit dem Standard-Executer, Fable nur mit Begründung.

| # | Beitrag | Inhalt | Stand |
|---|---|---|---|
| A | P4 | Unterschrift: Punkt/Strich/zu klein ablehnen, 13 Eintrittspunkte | **ausgeliefert** #475 (a36f5ab), Deploy 443 success |
| B1 | P2 | Fehlerseiten mit korrektem HTTP-Status (`auftrag-p2-fehlerstatus.md`) | **ausgeliefert** #476 (8d4e2dc), Deploy 444 success, live-check grün (2× ℹ); Rest `offene-befunde-p2.md` |
| B2 | H1a/H1b | H1a: CSP mit Bericht, dann Enforce (`auftrag-h1a-csp-enforce.md`); H1b: Nonces + Inline-Handler ablösen | H1a Bau läuft (`/workspace/gymdocu-h1`) |
| B3 | Doku | `ops/SECURITY-HEADER.md`: `server_tokens off`, `http2`, CSP-Stand | offen |
| B4 | Betreiber | H3 HSTS-Preload (Entscheidung), H2-D8 Ratenbegrenzung `/login/tablet` in nginx | Frage an Betreiber |
| C1 | Entschiedene | V01-1, V09-1, V15-2 (`auftrag-c1-entschiedene.md`) | **ausgeliefert** #477 (a8543ac), Deploy 445 success (Health OK, Migration 0061), live-check grün; Rest `offene-befunde-c1.md` |
| C2 | Stille Fehler | V02-3, V03-1, V04-3, V09-2, V09-3, V08-4, PP4b-22, V03-2, V04-2, Monatslauf (`auftrag-c2-stille-fehler.md`) | Fassung 2 bereit (Planprüfung 14) |
| C3 | Datenintegrität | C3a: V02-2, V05-2, V07-1 (`auftrag-c3a-datenintegritaet.md`, Fassung 2 bereit, Planprüfung 20); C3b: V10-3 + R6-13 (`auftrag-c3b-replik-upsert.md`, erst messen); Q: V12-1 + PP2-K3/K4b nach P2; V04-2 → C2 | C3a bereit |
| C4 | Test-Wächter | T2 (`auftrag-t2-zusicherungen.md`): C4 + „grün aus falschem Grund“ + Zeitzonen-Fixtures, **Frist 11.10.2026** | Fassung 2 bereit (Planprüfung 21) |
| C5 | Sammellisten Extrarunden | unlink (U-REAP1, U-LOE1..3, R6-13, R7-9, R9-12b, W-1), sperrordnung (1–3), h2 (R2-1..4), pentest-p1 (B1, A3, F1, V1, R2-N), s6 (1), ladebestand (1–21), P3-S1 | offen |
| C6 | Gering/Anmerkungen | V01..V27 „gering/Anmerkung“ in Themenbündeln (Texte/Kommentare, Test-Qualität, TZ-Randfälle) | offen |
| DB-INIT | Betrieb | `db.init()`-SCHEMA-Transaktion verklemmt mit gleichzeitigen Unterschriften-INSERTs (master 3/3), `ALTER TABLE … IF NOT EXISTS` sperrt exklusiv auch ohne Arbeit — trifft Ladeprobe 5/8 und jeden Neustart (C1 Runde 3, vorbestehend) | offen, eigener Beitrag nach C1 |
| QR-J | QR-Journal | Reparaturweg für kaputte Journalzeilen (Betreiber „ja beides“ 24.09.): Korrekturzeilen statt Löschen, Werkzeug `tools/qr-journal.js`, Zuordnung kaputter Zeilen je Studio (`auftrag-qrj-journal-reparatur.md`) | Planprüfung durch (`planpruefung-qrj.md`), Fassung 2; **Bau läuft** seit 25.09. 02:35 (`/workspace/gymdocu-qrj`, grösseres Modell — sehr komplex) |
| D | Deploy | SSH-Schritt mit Wiederholung | offen |
| E | Doku | IT-PDFs (`plaene/it-dokumentation-auftrag.md`) | offen |
