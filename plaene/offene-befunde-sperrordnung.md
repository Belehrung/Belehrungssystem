# Offene Befunde „Sperrordnung um den Studio-Audit-Lock" — für die Extrarunde

Beitrag: Zweig `fix-studiolock-ordnung` (GymDocu), Auftrag
`plaene/auftrag-verklemmung-studiolock.md` (Fassung 3). Nach der Betreiber-Regel „eine benannte
Grenze ist kein Endzustand" steht hier jeder Punkt, der beim Merge offen bleibt.

| # | Punkt | Quelle | Entscheidung |
|---|---|---|---|
| 1 | **Retention hält den Studio-Lock über die ganze Löschung einer Tabelle**: gemessen 500 Zeilen 948 ms, 2000 → 3235 ms, 8000 → 20,8 s (~2,6 ms/Zeile). Schwelle 1000 ms (ein Drittel des Pool-Zeitlimits 3000 ms) ab ~400 Zeilen überschritten. Vorher hielt dieselbe Schleife L ab dem ersten Zeilen-Audit bis zum Commit — fast gleich lang (Vorher-Messung fehlt). | Executer-Bericht, Nachweis 5 | Eigener Folgebeitrag „Retention in Blöcken": je Block eine eigene `auditTx`, Blockgrösse aus der Messung hergeleitet (100 Zeilen ≈ 260 ms, Faktor ~4 Reserve unter der Schwelle). |
| 2 | Verschachtelte `auditTx` in einer offenen Transaktion (zweite Verbindung) wird weder statisch noch zur Laufzeit erkannt; im Bestand 0 Fälle. | Executer-Bericht, „nicht geprüft" | offen |
| 3 | Wächtergrenzen: berechneter Zugriff über eine Variable, Weitergabe unter anderem Namen aus einer anderen Datei, `(t || db).run` in Helfern (für die Inventur unsichtbar). | Executer-Bericht | offen |

## 4. Rotation hält alle Studio-Locks bis zum Ende einer Gesamttransaktion (Diffprüfung L6)

Kosten, kein Fehler: `ops/schluessel-rotieren.js` braucht Gesamtatomarität. Während der Rotation
warten Audit-Transaktionen aller Studios auf L und halten dabei einen Pool-Slot (10 Verbindungen,
3000 ms Wartezeit). Entscheidung nötig: Rotation nur im Wartungsfenster (Betriebsregel, in die
Kopfzeile des Skripts) — oder Messung der Pool-Folgen unter Last. Quelle:
`plaene/diffpruefung-sperrordnung.md`, L6.
