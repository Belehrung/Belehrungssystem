# C6 — Extrarunde über alle Sammellisten (Plan, 01.10.2026)

**Quellen:**
- Verdichtung `c6-zustand-01-10/verdichtung.md` (flash, 31 Sammellisten, 124 Zeilen, Positivkontrollen 5/5).
- Zustandsprüfung gegen master `9ad8acd`/`9dfe522` in `c6-zustand-01-10/z1..z6.md`.

Jede Zeile ist ein FUNDORT, bis sie vor dem Bau neu gemessen ist.

**Schon behoben laut Zustandsprüfung, die Listen waren nicht nachgeführt:**
- PP4b-22, N1-H1, H1a-S3 (benannt);
- Q1, G1-b, G1-d, G1-f, E-2;
- V02-2, V02-3, V02-9, V03-1, V03-2, V04-1, V08-1;
- V10-2, V10-3, V12-1..4, V12-6..8.

Diese Punkte werden in den Sammellisten als erledigt nachgetragen, sobald C6 ausgeliefert ist.

## Bauaufträge (höchstens zwei gleichzeitig)

| Beitrag | Inhalt | Stand |
|---|---|---|
| C6-A | Monatslauf und PDF-Nachweise: c5c#2, F3/R2-4, R2-1, F2, C2-S8 + V09-7, V09-6, V01-8, V01-7r, V09-9, V08-6 (`auftrag-c6a-monatslauf.md`) | aufgeteilt: C6-A1 (`auftrag-c6a-monatslauf.md`, in Bau) und C6-A2 (Sperre und Archivversionen, `auftrag-c6a2-archivversionen.md` Fassung 3, wartet auf A1) |
| C6-F | Tests: CI-Wettlauf csp_crawler (blockierend), Ergebnisse z4 (E3-a..e, T1-K4, cwd-Leser, qr_block-Kind, ladebestand#1..6, G-B7), G1-g, V20-4, V12-5 | in Bau (`auftrag-c6f-tests.md` Fassung 2) |
| C6-B | Jobs, Health, Korrekturblatt, Krypto: F4 + C2-S5 (Requeue-Werkzeug), C-6, R2-5, c5c#1, c5c#3, SG-S1, SG-S3, V07-9, V09-5, V08-3, PP4b-21 | Fassung 2 bereit (`auftrag-c6b-jobs-krypto.md`) |
| C6-C | Löschwege und Offboarding: L-7, C-7, R2-7, R2-11, G1-c, c5g#1, C3b4-1..4, Drift-G1 (G1-h → Betreiberfrage) | Fassung 2 (`auftrag-c6c-loeschwege.md`), sol prüft |
| C6-D1 | Eingabeprüfung: B8, V02-5, V02-6, V02-7, V02-10, N1-H2, c5d#1, P3-S1, F7, V08-2, V09-4 | Fassung 2 bereit (`auftrag-c6d1-eingaben.md`) |
| C6-D2 | Doppelsenden, Entwurf, Import-Rennen, Zeitlimit: V02-4, V03-3, c5d#2, D-E1, B7, V05-6, H1a-S5, V08-5 | Fassung 2 bereit (`auftrag-c6d2-doppelsenden.md`) |
| C6-D3 | Berliner Zeit und Bereich 04: V01-6, V03-4, V03-5, V04-4..17 | Fassung 2 bereit (`auftrag-c6d3-zeit-bereich04.md`) |
| C6-E | Offline-Warteschlange: R2-4 (q), R3-8, R4-3, R4-9, N4-H1, N4-H2 | Fassung 2 bereit (`auftrag-c6e-offline.md`) |

**Zeitzone (V01-6, V03-4, V03-5):** Das ist keine Betreiberfrage. Behoben wird es, indem die Berliner Zeit
ausdrücklich gebildet wird (`core/datum.js`). Dann ist es egal, in welcher Zone der Server läuft.

## Betreiber-Fragen (gesammelt, noch nicht gestellt)

- C2-S1: Ist ein Admin-Download des Verbandbuch-PDFs eine „Weitergabe“, die protokolliert werden muss?
  (Rechtsfrage)
- C2-S7: Was geschieht mit `verify_dokumente`-Zeilen für Dokumente, die nie ausgeliefert wurden? Die Tabelle ist
  append-only.
- F6: Ersthelfer-Nachweise bekommen `inaktiv_seit` nur beim Löschen, nicht beim Deaktivieren. Ab wann läuft die
  Löschfrist?
- G1-a: Fehlt `FOTO_DIR`, gilt das als Stufenausfall (Exit 2). Gewollt?
- G1-e und C3a-S2: Sollen Mails zu Wartungs-Sperren bei einem Fehlschlag automatisch wiederholt werden? Heute geht
  die Mail nur auf Knopfdruck.
- H1a-S2: Safari/WebKit ist nicht gemessen. Vor dem Enforce werden Berichte eines iPads gebraucht.
- PP4b-20: Die Auswertung echter Unterschrifts-Protokollzeilen ist ein Termin (4 Wochen nach P4).
- V07-9: `decryptStream` liest die ganze verschlüsselte Datei in den Speicher, bevor entschlüsselt wird.
  - Empfehlung: so lassen. Die Dateien sind durch das Upload-Limit klein, und die Echtheit (GCM-Tag) wird vor der
    Freigabe geprüft. Ein Streaming gäbe ungeprüften Klartext heraus.
- c5d#1: Altdaten in `mitarbeiter.name` mit Leerraum am Rand.
  - Funktional ist das behoben, alle Vergleiche trimmen.
  - Empfehlung: KEINE Datenmigration, weil sie Namen ohne Audit-Spur ändern würde.
- V04-15: Sendet Magicline Mitarbeiter-Ereignisse ohne `id` und ohne E-Mail? Heute legt jedes solche Ereignis einen
  neuen Mitarbeiter an.
  - Empfehlung: solche Ereignisse verwerfen und melden, NICHT nach Namen abgleichen; Namensvettern würden sonst
    verschmolzen.
- G1-h: Stirbt der Prozess zwischen dem Versand einer Servicetechniker-Mail und ihrer Bestätigung, geht die Mail nach
  30 Minuten ein zweites Mal raus. Der Wiederholer kann diesen Fall nicht von einem nie versuchten Versand
  unterscheiden.
  - Empfehlung: so lassen („mindestens einmal“). „Genau einmal“ geht über SMTP nicht, und eine verlorene Mail wäre der
    größere Schaden.
- A1-r3-7 (`pdf_loeschen_tage`): Ist der Wert unbrauchbar, legt der Monatslauf die PDFs ohne Löschfrist an
  (`loeschen_nach` leer, also keine automatische Löschung) und meldet es bei jedem Lauf. Wird der Wert später
  berichtigt, bleiben die schon angelegten Zeilen ohne Frist. Den Wert setzt nur der Betreiber direkt in der Datenbank.
  - Empfehlung: so lassen. Die Meldung nennt den Schlüssel, und die betroffenen Zeilen lassen sich bei Bedarf von Hand
    nachziehen. Ein automatisches Nachtragen müsste neue von alten Zeilen ohne Frist unterscheiden; dafür bräuchte es
    eine Schemaänderung.
- ladebestand#3: Ein Kommentar innerhalb eines Template-Literals überlebt die Maskierung. Das ist eine benannte Grenze
  des Rohwert-Scanners.
  - Empfehlung: so lassen. Die Behebung würde gewollte Erkennungen mitmaskieren.

## Server-Schritte (Betreiber, „Später“ laut 30.09.)

H2-D8, P2-S1, A-4, S13. Dazu A-1b (Belehrungssystem, W-Sandbox `/etc` eingrenzen). Das macht der Haupt-Agent im
Belehrungssystem-Repo.
