# Diffprüfung Sperrordnung (`auditTx`) — `f4c0f07..d90c8d5`

Stand 23.09.2026. Lesespur `gpt-6-sol` (Diff + Umkreis, 66 Lesungen,
11,10 $). Spalte „getragen" = Messung des Haupt-Agenten. Ausführende
Claude-Spur läuft noch; ihre Befunde kommen unten dazu.

## Lesespur

| # | Schwere | Befund | Nachmessung | getragen |
|---|---|---|---|---|
| L1 | blockierend | Rotation öffnet `auditTx([])`, L entsteht erst durch `sperreStudio(t, id)` (`ops/schluessel-rotieren.js:209`) VOR dem `FOR UPDATE` (:214-219). Diese Ordnung bewacht niemand — die Zeile hinter das `FOR UPDATE` geschoben, bleiben (a)–(e) und die Laufzeitproben grün | Zeilen gelesen; `sperreStudio` prüft nur die Reihenfolge zwischen Studio-IDs | ja |
| L2 | mittel | Inventur zählt `auditTx([])` sofort als Ersterwerb von L | `test/helfer/auditlock-inventur.js:162,204-207` | ja |
| L3 | mittel | Probe-Regex für „A hat N genommen" (`test_feature_auditlock_ordnung_nebenlaeufigkeit.js:239`) trifft mit der zweiten Alternative auch den Tagesschlüssel (`routes/module.js:2868`) — Entfernen des N-Griffs bleibt grün | Regex und Zielzeilen gelesen | ja |
| L4 | gering | „gleiche ID → No-op" misst keinen No-op (Advisory-Locks sind wiedereintrittsfähig) | `core/integritaet.js:161`, Test `:194-196` | ja |
| L5 | mittel | Frühausstiege in `core/korrekturen.js:880-884` / `core/korrektur-pdf.js:140-144` antworten ohne L, während Retention unter L löscht | fällt: die Antwort beschreibt einen Stand, der zum Lesezeitpunkt committet war; eine Löschung danach ist regulär und erzeugt keine falsche Datenlage | nein |
| L6 | mittel | Rotation hält alle Studio-Locks bis zum Ende einer Gesamttransaktion; Bestellversand verschickt vor `auditTx` | Kosten, kein Fehler: Rotation ist ein Wartungsvorgang mit geforderter Gesamtatomarität; Bestellversand hat bereits die „nicht erneut senden"-Seite. Kommt auf `offene-befunde-sperrordnung.md` (Betrieb: Rotation nur im Wartungsfenster) | als Kosten |

## Behebung (an denselben Executer)

- L1/L2: Rotation liest die Studio-IDs VOR der Transaktion und öffnet `auditTx(alleIds)`; leere Liste in `auditTx` verboten (Wurf); `sperreStudio` entfällt, falls danach kein Aufrufer mehr bleibt. Inventur zählt nur eine nicht-leere Liste als L.
- L3: Probe prüft den Schlüsselparameter `nachtrag:<studio>:seilkontrolle`, nicht jedes `hashtext`.
- L4: Anweisungszähler vor/nach dem Gleich-ID-Aufruf vergleichen (entfällt mit `sperreStudio`).
