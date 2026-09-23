# Planprüfung „Verklemmungskreise um den Studio-Audit-Lock" — 23.09.2026

Papier Fassung 1 (`plaene/auftrag-verklemmung-studiolock.md`). Zwei Lesespuren,
verschiedene Bündel: `gpt-6-sol` mit Repo-Lesezugriff (erster Lauf an der Ausgabegrenze
abgebrochen, Wiederholung mit 1,6 MB), `kimi-k3` mit festem Auszugsbündel.

## Spur A (`gpt-6-sol`, Wiederholung) — nachgemessen

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| A-1 | **blockierend** | „B nimmt L zuerst" erzeugt einen NEUEN Kreis mit der Seil-Umbenennung: diese hält nach S1 die `geraete`-/`geraete_sperren`-Zeilen und nimmt L erst danach über `auditAppend(…, t)` | `routes/admin/geraete.js`: S1 (`seilkontrolle:…`) → `UPDATE geraete SET name` → `UPDATE geraete_sperren SET geraet_name` → `auditAppend('geraet_umbenannt', …)`. Der Kommentar dort behauptet „Sperrreihenfolge unkritisch" | ja |
| A-2 | **blockierend** | Korrektur-Durchschreiben (`core/korrekturen.js`): eigene Advisory-Locks → `UPDATE` der Zielzeile (auch `geraete_sperren`) → L beim Audit. Gegenordnung zu C schon heute, nach dem Vorschlag auch zu B | `korrekturen.js`: `korrektur-anfrage`/`korrektur-ziel`-Locks → `UPDATE "${config.table}" SET …` → `auditAppend('nachweis_korrektur', …)` | ja |
| A-3 | mittel | Tabelle ohne Bedingungen: B erreicht L nur bei `rowCount > 0`, C den Audit-Griff nur bei Treffer, A den Nachtrag-Zeilenlock nur bei gültigem Feld. B–C ist real | Code gelesen | ja |
| A-4 | mittel | Weitere L-Kreise: Ausmusterung (L → `geraete FOR UPDATE`) gegen Umbenennung (Zeile → L); C gegen Umbenennung; Cardio/Kraft-Tagescheck (L → `geraete_bekannt`-Upsert) gegen Cardio/Kraft-Mangel-Nachtrag (Upsert → L); Offline-Tagescheck mit Client-Tag kann die S1-Serialisierung verlieren | Fundorte, Inventur | Fundorte |
| A-5 | mittel | L-zuerst in B belegt L auch bei leerem/ungültigem Nachtrag — mehr Serialisierung | plausibel | ja |
| A-6 | **blockierend** | Probe zu unspezifisch: nach der Behebung wartet A schon an L (Überlapp ja, aber N/Zeile nie erreicht); für B–C muss B NACH positivem Zeilen-UPDATE und VOR L angehalten werden; HTTP-Status zeigt keinen SQLSTATE (Fehlerseite mit 200); **statisches Lock-Inventar mit literal 28 Einträgen** (`test_feature_geistersperre_nachtrag_rennen.js`, Abschnitt 7) wird durch jede neue Lock-Zeile rot | Inventar-Test gefunden, „28 Einträge" literal | ja |

Kosten: 6,77 $ (abgebrochen) + 15,34 $ (Wiederholung).

## Folge für das Papier

Die Drei-Wege-Sicht trägt nicht. Es braucht eine **systemweite Regel** für L und eine
vollständige Inventur aller Transaktionen mit `auditAppend(…, t)` — Fassung 2.

## Spur B (`kimi-k3`, festes Auszugsbündel) — nachgemessen

Dauer 1255 s, 20.520 Eingabe- / 38.636 Ausgabe-Token (davon 32.420 Denken).

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| K-Urteil | — | „B nimmt L zuerst erzeugt keinen neuen Kreis" | **Widerlegt durch A-1** (Umbenennung). `routes/admin/geraete.js` war nicht im Bündel; Kimi benennt das selbst als Prüfgrenze | nein (Material fehlte) |
| K-1 | mittel | pg_locks-Beleg nicht auf PIDs und Lock-Schlüssel eingegrenzt | Papier Fassung 1: „`granted = false`" ohne Eingrenzung | ja |
| K-2 | mittel | Existenzmessung falsch-negativ, wenn das UPDATE keine Zeile trifft (B/C erreichen L dann nie) | `rowCount`-Zweige in `nachtragUebernehmen` und Freigabe gelesen | ja |
| K-3 | mittel | Tor: Zuordnung je Anfrage, Parkpunkt nach Gewährung, Gegenprobe greift sonst nicht, begrenzter Fehlerpfad | Papier Fassung 1 schweigt dazu | ja |
| K-4 | mittel | Inventur-Kriterium übersieht `auditAppend` OHNE Verbindung innerhalb einer sperrenden Transaktion | Kriterium trägt. Bestand gemessen: **0 Fälle** (AST, eine Helfer-Ebene, Positivkontrolle 1 Treffer) | ja (als Kriterium) |
| K-5 | mittel | Tabelle unvollständig (Mangel-Nachtrag, Cardio/Kraft); Verdacht Wartung–Freigabe | Unvollständigkeit trägt. **Verdacht Wartung–Freigabe trägt NICHT:** Wartung ändert nur `typ='wartung'`-Zeilen, die Freigabe nur `typ='seilkontrolle'` | teilweise |
| K-6 | gering | Tabelle unterschlägt Bedingungen (L nur bei Treffer) | deckt sich mit A-3 | ja |
| K-7 | gering | Kommentar an N muss sagen, dass N allein den Kreis mit C nicht verhindert | — | ja |
| K-8 | gering | SQLSTATE statt Text, zweite Anfrage muss committen, Schlüssel protokollieren | deckt sich teilweise mit A-6 | ja |
| K-9 | gering | Kosten (Serialisierung) nicht beziffert | — | ja |

**Folge:** Fassung 2 (`plaene/auftrag-verklemmung-studiolock.md`) — systemweite Regel „L zuerst"
über `auditTx`, Laufzeitvermerk, statischer Wächter; alle getragenen Befunde beider Spuren sind
dort Anforderungen. Inventur-Skript: `scratchpad/lockinv/inv.js`, `inv2.js` (111 = 111 gegen grep).

---

# Planprüfung Fassung 2 (systemweite Regel, `auditTx`) — 23.09.2026

## Spur A (`gpt-6-sol`, Repo-Lesezugriff) — nachgemessen

18 Runden, 77 Lesungen, 2,53 Mio. ein / 22.024 aus, geschätzt 10,45 $.

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| F2-A1 | blockierend | AST = grep ist keine unabhängige Vollständigkeit: berechneter Zugriff, Aliase, Hüllen (`dbTransaction`), Weitergabe über `deps` entgehen beiden | Heute: `dbTransaction` importiert (`routes/sichtpruefung.js:15`), **0 Aufrufe**; kein berechneter Zugriff; Weitergabe über `deps` real (`routes/admin.js:42` → `ausmusterung.js:243`, `geraete-typen.js:110`), vom Namens-Erkenner erfasst, weil der Aufruf `auditAppend(` heisst. Die Klasse trägt als Grenze; ein heutiger Fehlfund nicht | ja (Grenze) |
| F2-A2 | blockierend | „Tagesschlüssel als erste Anweisung im `auditTx`-Callback" passt nicht auf den Geräte-Löschweg: der nimmt den Tagesschlüssel in `db.tx` und protokolliert NACH dem Commit ohne Verbindung | `routes/admin/geraete.js:368-369` (`db.tx` + Tagesschlüssel), `:424` (`auditAppend` ohne `t` nach dem Commit) | ja |
| F2-A3 | mittel | Drei Tests rufen die echten Helfer in blankem `db.tx` → nach dem Wurf rot | `test_feature_reparatur_freigabe_race.js:108/126/141`, `test_feature_seil_freigabe_race.js:189/206`, `test_feature_seil_freigabe_lock_reihenfolge.js:105` | ja |
| F2-A4 | **blockierend** | Wurf deckt nur `conn` ohne Vermerk. `auditAppend` OHNE Verbindung IN einem `auditTx` öffnet eine zweite Transaktion, die auf das L der äusseren wartet → Hänger, den PostgreSQL nicht sieht (kein 40P01), Poolplätze belegt | `core/integritaet.js:97` `conn ? append(conn) : db.tx(append)`; Folge abgeleitet, Mechanismus am Code belegt | ja |
| F2-A5 | mittel | Neue Zustände „L gehalten ohne Audit" bei Frühausstiegen (Korrekturblatt vorhanden, Umbenennung auf gleichen Namen, 0 Platzierungen, Retention ohne Kandidaten) | Fundstellen gelesen | ja |
| F2-A6 | mittel | L-Wartende halten Poolverbindungen; Retention und PDF-Rendern halten L künftig lange → Poolmangel trifft auch Leser | Pool-Checkout-Timeout `core/db.js:408-413`; Haltedauer NICHT gemessen | ja (zu messen) |
| F2-A7 | mittel | Rotation: Studio-Liste vorab lesen + Vergleich schützt nicht gegen eine danach committende Provisionierung | `core/provisioning.js` legt Studios in eigener `db.tx` ohne L an | ja — Papier ändert den Weg: L je Studio aufsteigend beim Durchlauf, kein Listenvergleich |
| F2-A8 | mittel | Gegenprobe „eine Seite zurückbauen" legt nicht fest, WELCHE Seite den Kreis wiederherstellt (z. B. nur Tagescheck zurück → kein Kreis mit dem umgestellten Nachtrag) | Sperrfolgen gelesen | ja |
| F2-A9 | Anmerkung | Unter der vollständig ausgeführten Regel kein notwendiger L-Ersterwerb nach anderer Sperre gefunden; Wächter prüfen Syntax, nicht ausgeführte Sperren | — | ja |

## Spur B (`deepseek-v4-pro`, Bündel: Kernmodule, Inventurskripte, Lock-Inventar-Test) — nachgemessen

712 s, 35.051 ein / 34.745 aus (31.218 Denken).

| # | Schwere | Befund | Nachmessung | trägt |
|---|---|---|---|---|
| F2-B1 | blockierend (eingestuft) | Vermerkprüfung darf nur den Weg MIT Verbindung treffen, sonst werfen die 76 | Papier sagte „`auditAppend(…, conn)`" — als Präzisierung getragen, Schwere mittel | ja (Präzisierung) |
| F2-B2 | blockierend | Wächter (a) als ZEILENmenge verliert Mehrfachheit | trägt | ja |
| F2-B3 | blockierend | Wächter (b) muss das Verbindungsargument an den durchgereichten Parameter binden | trägt | ja |
| F2-B4 | mittel | Inventur blind für `tx`-Aliase, benannte Callbacks, berechneten Zugriff | Bestand gemessen: keiner vorhanden; als Grenze getragen | ja (Grenze) |
| F2-B5 | mittel | Rotation mit allen L in einer Transaktion = globaler Audit-Stopp | trägt; Entscheidung: bleibt eine Transaktion (Kopf der Datei begründet es), L aufsteigend je Studio, als Kosten dokumentiert | ja |

Überschneidung mit Spur A: F2-B4 ≈ F2-A1, F2-B5 ≈ F2-A7 (verschiedene Folgerung), der
Selbst-Hänger steht bei B nur unter (A), nicht als Befund. Neu nur bei B: F2-B2, F2-B3.

**Folge:** Fassung 3 des Papiers — Laufzeitschutz auch ohne Verbindung (`AsyncLocalStorage`),
Wächter mit Multimenge und Bindungsanalyse, Gegenproben je Sperrgraph, Haltedauer-Schwelle
hergeleitet (1000 ms aus dem Pool-Zeitlimit).
