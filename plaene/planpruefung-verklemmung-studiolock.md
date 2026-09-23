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
