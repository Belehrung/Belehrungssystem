# Auftrag C3a Nacharbeit 2 (25.09.2026)

Grundlage: `plaene/diffpruefung-c3a.md`, Abschnitt „Runde 2“ (C3a2-1..C3a2-9). Baum `/workspace/gymdocu-c3a`, Zweig
`fix-c3a-datenintegritaet`, Kopf `f40936b`. Mess-Skripte der Prüfspur: `scratchpad/c3acc2/` (m7.js, m7b.js, m8.js,
m9.js, m3.js, probeMAliste.js, probeTablet.js, Mutationsliste im Bericht) — vor dem Bau gegen deinen Stand (muss das
gemeldete Verhalten zeigen), danach erneut; beides wörtlich. Einzeltests nur gegen eine eigene DB
(`gymdocu_c3an2_test`). Einordnung: nicht sehr komplex (Standard). KEINE neue Migration (0063 gehört C3b).

## 1. Tablet-POST prüft die Aufgabe (C3a2-1, blockierend)

Vorab-Lesen der Aufgabe mit `AND aktiv=1`; IN der auditTx die Aufgabe erneut lesen (`studio_id`, `id`, `anlage_id`,
`aktiv=1`) — fehlt sie oder ist sie stillgelegt: 400 mit eigenem Text („Diese Aufgabe gibt es nicht mehr …“), keine
Zeile. Beide Löschwege laufen unter demselben Studio-Lock (auditTx) — das in einem Kommentar mit Fundstellen belegen.
Pflichttests: m7 (i) stillgelegte Aufgabe → 400, Reinigungen unverändert; (ii) Rennen mit hartem Löschen (Hook vor der
auditTx) → 400, keine Zeile; Gegenprobe: Prüfung in der Transaktion entfernt → ROT.

## 2. Mitarbeiter: Deaktivieren statt Löschen (C3a2-2, C3a2-3)

- Neue Admin-Aktion „Deaktivieren“ (und „Reaktivieren“) für einen Mitarbeiter: dasselbe, was der Webhook-Weg beim
  Ausscheiden tut (`routes/webhooks.js` um `:362`, `aktiv=0`, `inaktiv_seit`, Token-Hausputz aus S6) — über EINEN
  gemeinsamen Helfer, nicht als Kopie (CLAUDE.md „Dieselbe Aussage an zwei Orten“; liegt der Grund für zwei Orte vor,
  steht er im Kopf). Audit-Ereignis je Richtung (ins Vokabular). VOR dem Bau messen und berichten, welche Leser
  `mitarbeiter.aktiv=0` heute schon beachten (Tablet-Anmeldung, PIN, Einladung, Belehrungslinks, Listen) — dort, wo ein
  Leser ihn NICHT beachtet, melden statt still ergänzen, wenn es über diesen Auftrag hinausgeht.
- Mitarbeiterliste: bei `sigCount > 0` Knopf „Deaktivieren“ statt „Löschen“, Dialog ohne Lösch-Versprechen;
  deaktivierte Mitarbeiter sichtbar gekennzeichnet mit „Reaktivieren“. Die 409-Seite verweist auf genau diesen Knopf.
- Löschweg-Reihenfolge (C3a2-3): ein am FK scheiterndes DELETE darf Freischaltung und Token nicht schon entzogen haben —
  Reihenfolge so wählen, dass vor dem erfolgreichen DELETE nur Harmloses geschrieben ist (Namens-Snapshot), und 23503 auf
  `unterschriften` im catch in dieselbe 409-Seite übersetzen (Vorbild `routes/getraenkeanlage.js` Anlagen-Löschweg).
  Keine neue Sperrreihenfolge (CLAUDE.md „Transaktionen und Sperren“) — was du wählst, begründest du mit den
  gegenläufigen Wegen.
Pflichttests: Deaktivieren/Reaktivieren (Audit, Token weg, Zustand literal), Liste mit Knopf/Dialog je `sigCount`,
409-Seite nennt den Knopf, m8 (Rennen) → 409 und Freischaltung/Token unverändert; je Gegenprobe.

## 3. NOT VALID sichtbar (C3a2-4, C3a2-5)

- `core/migrate.js`: eine WARNING (nicht NOTICE) aus einer Migration geht zusätzlich an `melde()` (Quelle
  `migration:<datei>`), damit sie das Deploy-Log überlebt. Kommentar in 0062 berichtigen (`core/migrate.js`, nicht
  `server.js`) — 0062 ist nicht ausgeliefert, die Prüfsumme wird nachgezogen.
- Test: Migrationspfad OHNE Waisen → `convalidated = true` (Mutation „immer NOT VALID“ muss ROT werden); mit Waisen →
  `melde` genau einmal mit Anzahl.
- Erzwungenes Monats-PDF (`generateMonthlyPDFs.js`): dieselbe Verknüpfung wie die PDF-Abfrage (`core/pdf-engine.js`,
  JOIN auf `getraenkeanlagen`), damit Waisen kein leeres PDF erzwingen; Test mit Monatsgrenze (P2) UND Waisen.

## 4. Tests gegen den echten Weg (C3a2-6)

Je ein Test, der unter den überlebenden Mutationen ROT wird: Knopf und Abzeichen an stillgelegter Aufgabe (G7, G7b),
Zählung je Aufgabe (G14), Monatsgrenze der Erzwingung (P2), Escaping der 409-Seite (MA4), zweiter `melde`-try im
Wartungs-Mailer (DM2). Die PDF-Zusicherung „Spalte Reinigung bleibt lesbar“ läuft über die ECHTE PDF-Erzeugung, nicht
über eine Kopie der Abfrage; die N+1-Zählung erkennt die Abfrageform unabhängig von Alias/Schreibweise.

## 5. Kleinere Punkte (C3a2-7)

- „Reaktivieren“ für stillgelegte Aufgaben (Audit, wie bei der Anlage).
- Tablet: im Rennen GELÖSCHTE Anlage → eigener Text, nicht „stillgelegt“; Anlage nur mit stillgelegten Aufgaben →
  „keine aktiven Aufgaben“ statt „noch keine Aufgaben angelegt“.

Nicht in diesem Auftrag: C3a2-8, C3a2-9 (Sammelliste).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab (deaktivierter Mitarbeiter, reaktivierte Aufgabe) — und wer
liest ihn falsch (Tablet, Belehrungslinks, PDF, Export, Retention, Magicline-Webhook, der denselben Mitarbeiter später
wieder aktiv setzen kann)?

-- Ende des Auftrags --
