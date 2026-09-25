# Auftrag C3b Stufe 2 — Replik-Upsert: Hash-Generation, Lease-Kennung, Budget (Fassung 1, 25.09.2026)

Grundlage: Stufe 1 aus `plaene/auftrag-c3b-replik-upsert.md`, gemessen am 25.09.2026 auf master `00bd9c9` (Skripte
`scratchpad/c3b/m1-…`, `m2-…`, `m3-…`, Wegwerf-DB). Alle Zeilenangaben: `core/storage-replica.js` auf `00bd9c9`.
Einordnung: **sehr komplex** — nebenläufige Zustände über eine Lease, ein Ergebnis, das falsch grün aussieht
(`succeeded` mit falschem Inhalt), und dieselbe Datei hatte im unlink-Beitrag zehn Prüfrunden.

## Gemessen (Stufe 1)

- **M1 (V10-3):** `dead` entsteht bei `:566` (`permanent || running.attempts >= MAX_REPLICA_ATTEMPTS`, MAX 5), geschrieben
  `:575-579`. `upsertReplica` (`:108-125`) setzt bei neuem Hash `status='pending'`, lässt `attempts` stehen. Verlauf:
  fünf Fehlschläge → `dead/5`; Upsert mit H2 → `pending/5/H2`; EIN Fehlschlag → `dead/6/H2`. Der neue Inhalt hat
  praktisch kein Budget.
- **M2 (R6-13a):** Worker A läuft (H1 gelesen, `running/1`), Upsert H2 setzt `pending/1/H2`, Worker B claimt, lädt H2,
  `succeeded/2/H2`; danach schliesst A ab (1c ohne Status-/Hashfilter, `:476-484`): Zeile `succeeded/2/H2`, `remote_ref`
  zeigt auf **A's Datei mit Inhalt H1**, B's Datei (H2) hat A als „ersetzt“ gelöscht (`:497-504`, 1d). Positivkontrolle
  ohne Upsert: konsistent.
- **M3 (R6-13b):** Pause zwischen erstem SELECT (`:361-364`) und Claim (`:382-388`), Upsert H2, Datei bleibt H1:
  geprüft wird `replica.sha256` = H1 (`:411`) — passt —, gebucht wird `succeeded/1/H2`, Fernkopie enthält H1.
  Positivkontrolle ohne Upsert: konsistent.

Gemeinsame Ursache: der Hash, den ein Worker hochlädt, wird nirgends an die Zeile gebunden — weder beim Prüfen
(M3: vor dem Claim gelesen), noch beim Abschluss (M2: 1c setzt `sha256` nicht und fragt ihn nicht ab), noch beim
Budget (M1). Und `attempts` ist zugleich Budget UND Lease-Kennung (`:548`, `:578`: `status='running' AND attempts=$`) —
deshalb lässt es sich heute nicht zurücksetzen, ohne die Lease-Kennung zu brechen (s. Punkt 1).

## 1. Lease-Kennung von `attempts` trennen (Voraussetzung für 3)

Neue Spalte `claim_nr BIGINT NOT NULL DEFAULT 0` (neue Migration, Konventionen des Repos; Migrations-Wächter
beachten). Der Claim (`:382-388`) setzt `claim_nr = claim_nr + 1`; `claim_nr` wird NIE zurückgesetzt. Beide Riegel im
Fehlerweg (`:548`, `:578`) prüfen `status='running' AND claim_nr = <eigener Claim>` statt `attempts`.
Warum nicht `attempts` behalten: mit Budget-Rücksetzung (Punkt 3) entsteht sonst — A langsam, Lease abgelaufen, C
reclaimt und scheitert, Upsert H2 setzt `attempts=0`, D claimt mit `attempts=1` = A's Claim — ein Riegel, den A's
Fehlerweg auf D's Lease trifft. Pflichttest genau dieser Ablauf.

## 2. Hash an den Claim binden, aus DENSELBEN Bytes prüfen (M3)

Nach dem Claim gelten `running.sha256`, `running.local_path`, `running.backend` — nicht `replica.*`. Die Datei wird
EINMAL gelesen; der Hash wird über genau diesen Puffer gebildet und gegen `running.sha256` gehalten; derselbe Puffer
wird verschlüsselt (heute: `dateiHash` liest die Datei, `readFile` liest sie ein zweites Mal — ein Austausch dazwischen
lädt ungeprüfte Bytes hoch).

## 3. Upsert fasst eine laufende Lease nicht an; neuer Hash bekommt neues Budget (M1, M2)

`upsertReplica`:
- Zeile `running`: nur `sha256 = EXCLUDED.sha256`. Status, `attempts`, `claim_nr`, `updated_at` bleiben (die Lease läuft
  weiter und läuft ab wie bisher; `updated_at` ist ihre Uhr).
- sonst, Hash NEU (`IS DISTINCT FROM`): `status='pending'`, `attempts=0`, `last_error=NULL`.
- sonst, Hash gleich: wie heute (`succeeded` bleibt, alles andere `pending`, `attempts` bleibt). Diese Entscheidung ist
  bewusst: gleicher Inhalt bekommt kein neues Budget.

## 4. Abschluss nur für den Hash, der hochgeladen wurde (M2)

1c liest `sha256` (und `claim_nr`) mit `FOR UPDATE`. Weicht `sha256` vom hochgeladenen Hash ab, ist der Upload
veraltet: kein `succeeded`, keine alte Referenz als „ersetzt“, die EIGENE Datei wird behandelt wie in 1e (Anker
`verwaist`, Datei weg). Ist die Lease noch die eigene (`status='running' AND claim_nr=<eigen>`), setzt der Worker die
Zeile auf `pending` mit `attempts=0`, und der Job muss den neuen Inhalt OHNE Handeingriff und ohne auf `requeueStale`
(15 min) zu warten hochladen — Vorbild ist der `LoeschauftragEntzogenError`-Weg (`:530-555`: kein Fehlversuch, Wiederholung
über die `pdf_jobs`-Warteschlange). Wie das bei laufendem Job mit demselben `dedupeKey` (`replica:<id>`, `:148`) wirklich
greift, wird GEMESSEN, nicht angenommen, und im Bericht mit Zeitstempel belegt.
Gleicher Hash (abgelaufene Lease, zwei Worker mit demselben Inhalt): Verhalten wie heute (Schiedsrichter ist der eigene
Auftrag).

## 5. Fehlerweg bei inzwischen geändertem Hash

Scheitert ein Worker, dessen Hash nicht mehr der der Zeile ist (Upsert während des Laufs), gilt der Fehlschlag dem
ALTEN Inhalt: kein `failed`/`dead` für den neuen, sondern `pending`, `attempts=0` (nur mit eigener Lease). Das trifft
besonders den heutigen Wurf „SHA-256 stimmt nicht überein“ (`:411-413`, `permanent` → sofort `dead`), wenn die Datei
vor dem Upsert-Aufruf schon ausgetauscht war.

## Tests (Pflicht, Vorbild: Rennen-Tests aus dem unlink-Beitrag)

M1, M2, M3 als Rennen über ZWEI Verbindungen im echten Zeitfenster (Stub genau zwischen den Anweisungen, kein
direktes Setzen des Endzustands), je mit LITERALEN Sollwerten (Status, `attempts`, `sha256`, Inhalt der Datei, auf die
`remote_ref` zeigt, Löschaufträge). Dazu der Lease-Kollisionsfall aus Punkt 1 und der Fehlerweg aus Punkt 5. Je
Schutz eine Gegenprobe (Mutation → ROT, Rücknahme → GRÜN, Zahlen wörtlich): Claim ohne `claim_nr`-Erhöhung,
Riegel zurück auf `attempts`, Hashvergleich gegen `replica.sha256`, zweites Lesen statt Puffer, 1c ohne Hashfilter,
Upsert ohne `running`-Zweig, Upsert ohne `attempts=0`. Bestehende Tests (`test_feature_storage_replica*.js`) bleiben
grün; jede Zusicherung, die `attempts` als Lease-Kennung voraussetzt, wird genannt und umgestellt, nicht gelöscht.

## Was NICHT gebaut wird

Keine Änderung an Löschauftrags-Abarbeitung (`requeueLoeschauftraege`), Reaper-Takt, OneDrive-Weg (nicht aktiv) und
`MAX_REPLICA_ATTEMPTS`. Keine neue globale Lock-Klasse (CLAUDE.md „Transaktionen und Sperren“).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht durch diese Änderung, den es vorher nicht gab — und welche Zeile kann nach ihr noch
`succeeded` sagen, während die Datei hinter `remote_ref` einen anderen Inhalt hat?

-- Ende des Auftrags --
