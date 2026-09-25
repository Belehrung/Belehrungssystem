# Auftrag QR-J Nacharbeit 1 (25.09.2026)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 1“ (QJ-1..QJ-12). Zweig `fix-qrj-journal-reparatur`, Kopf
`dc7ebac`. Drei der Befunde sind GEMESSENE Doppelvergaben über das Werkzeug (Reproduktionen unter
`/tmp/claude-0/-home-user-Belehrungssystem/c200d6d7-f0a2-5a02-8fb8-a4f662e3a700/scratchpad/qrjcc/`, `r1_a_frei.js`,
`r2_ziffer.js`, `r3_nrbis.js`; Bibliothek `lib.js`, DB-Name dort fest `gymdocu_qrjcc_test`). Leitregel unverändert:
Überspringen ist sicher, Unterschlagen unwiderruflich.

Einordnung: sehr komplex (gleiche Begründung wie der Bau). Danach Runde 2 der Diffprüfung (die Behebung ändert Verhalten).

## 1. QJ-1 — Obergrenze nach Position, Untergrenze für A (blockierend)

- (e) Obergrenze nur aus Spannen desselben Studios im selben Block, deren PHYSISCHE Zeilennummer > N ist (bei
  Korrekturspannen zählt die Position ihrer `ersetzt_zeile`, bei angehängten die Zeile, in der sie stehen) UND deren
  `nr_von` > A. Eine Zeile, die im Journal VOR der kaputten steht, ist nie Obergrenze.
- Neu (d'): A muss über dem höchsten `nr_bis` der Spannen desselben Studios im selben Block liegen, die VOR N stehen
  (innerhalb eines Blocks wird aufsteigend vergeben — eine spätere Charge beginnt über allen früheren). Sonst Abbruch
  mit eigenem Grund.
- `zeigen` nennt beides (Untergrenze für A, Obergrenze für B) mit Zeilennummern.
- Pflichttest: die Fixtur aus `r1_a_frei.js` (C1, C2 lesbar, C3 abgeschnitten vor `nr_von`, DB ohne C3) — `--von`
  unter C2 → Abbruch (d'); `--von=<Start C3> --bis=<Ende C3>` ohne `--ohne-systembeleg` → Abbruch (f); mit Schalter →
  Vergabe ab Ende C3 + 1 (LITERAL).

## 2. QJ-2 und QJ-5 — Kandidaten statt „alle oder eins“ (blockierend)

Eine kaputte Zeile bekommt statt `studio_id|null` eine KANDIDATENMENGE, aus dem Rohtext bestimmt:

| Form des Rohtexts (getrimmt) | Kandidaten |
|---|---|
| `^\{"charge_id":\d+,"studio_id":(\d+),` (heute „zuordenbar“) | genau dieses Studio |
| `^\{"charge_id":\d+,"studio_id":(\d+)$` (Ziffern bis zum Ende, NICHT abgeschlossen) | jedes Studio, dessen Nummer (dezimal) mit diesen Ziffern BEGINNT |
| alles andere | alle Studios |

Enthält die Zeile weitere `{"charge_id":`-Anfänge (geklebte Altzeile, PQJ-4) und ist ein solcher Rest KEIN
vollständiges Chargenobjekt, kommen dessen Kandidaten (dieselbe Tabelle auf den Rest) HINZU (QJ-5). Ein vollständiger
Rest zählt wie bisher als Spanne und bringt keinen Kandidaten.

Sperre: eine unerledigte kaputte Zeile betrifft Studio X, wenn X Kandidat ist.

Erledigung je Studio (statt global):
- `verworfen` (nur für Zeilen, die das Werkzeug verwerfen lässt) erledigt für alle.
- `korrektur` mit `studio_id` S erledigt für S.
- Neues, optionales Feld der Korrekturzeile `uebrige_nicht_betroffen: true` erledigt zusätzlich für ALLE anderen
  Kandidaten. Das Werkzeug setzt es NUR mit dem blanken Schalter `--uebrige-nicht-betroffen`, druckt vorher (auch im
  Trockenlauf) die Liste der existierenden Kandidaten-Studios und den Satz „Damit erklären Sie, dass keines dieser
  Studios Nummern aus Zeile N trägt — Beleg sind die Aufkleber.“ Ohne den Schalter bleiben die übrigen Kandidaten
  gesperrt, bis jeder seine eigene Korrektur hat (sichere Richtung).
- Bei genau einem Kandidaten ist das Feld bedeutungslos.

Werkzeug:
- Ist eine `charge_id` am Anfang lesbar (`^\{"charge_id":(\d+),`), wird `qr_charge` dazu gesucht — AUCH wenn die Zeile
  keinem Studio eindeutig gehört. Gefunden → deren Studio ist das einzige zulässige `--studio`, `nr_von`/`nr_bis`
  gelten wie in (d) (PQJ-14).
- `--studio` muss Kandidat sein; sonst Abbruch.
- `zeigen` nennt die Kandidatenmenge (bei Ziffern-Präfix: die existierenden passenden Studios) und den Satz „Die
  Studiozahl kann abgeschnitten sein — maßgeblich sind die Aufkleber.“
- Pflichttest: Fixtur aus `r2_ziffer.js` (Eigentümer 64, Rohtext `…"studio_id":6`): Korrektur mit `--studio=6` ohne
  Schalter → Studio 64 bleibt gesperrt (Vergabe wirft), Studio 6 frei; mit `--studio=64` und korrekter Spanne →
  64 frei ab Ende + 1 (LITERAL), 6 gesperrt bis zum Schalter oder einer eigenen Korrektur; ein Studio, dessen Nummer
  NICHT mit 6 beginnt, war nie gesperrt. Dazu eine Fixtur für QJ-5 (Bruchstück Studio 7 + unlesbarer Rest mit
  Präfix von Studio 8 → Studio 8 gesperrt).

## 3. QJ-3 — lesbares `nr_bis` ist Untergrenze

`^\{"charge_id":\d+,"studio_id":\d+,"nr_von":\d+,"nr_bis":(\d+),` gelesen → B ≥ dieser Wert (Abbruch (d) sonst). Der
Satz „nr_bis=- (nie aus einer kaputten Zeile lesbar)“ fällt; `zeigen` nennt das gelesene `nr_bis` als Untergrenze.
Pflichttest: Fixtur aus `r3_nrbis.js`.

## 4. QJ-4 — leeres Journal

Leiter: der Fall „Datei vorhanden, 0 nicht leere Zeilen“ bekommt einen EIGENEN Text (getrennt von „kaputte Zeilen“):
„Das Verbrauchsjournal existiert, ist aber LEER — es enthält keine Spur irgendeines Studios. Ist nachweislich noch nie
ein Aufkleber aus diesem System gedruckt worden, darf der Betreiber genau diese LEERE Datei entfernen (dann gilt die
Erstinbetriebnahme). Sind schon Aufkleber gedruckt worden, NICHT entfernen, sondern melden — dann fehlen Journal UND
Datenbank.“ `zeigen` sagt im selben Fall dasselbe. Eine Datei mit Zeilen wird weiterhin NIE entfernt. Der Wortlisten-Test
(E) erlaubt „entfernen“ ausschließlich in diesem Text und prüft, dass er nur bei 0 Zeilen erscheint; `test_feature_
qr_block.js` (o) prüft den neuen Text.

## 5. QJ-6 — gemeinsamer Lock

In `korrigieren`/`verwerfen` innerhalb der `auditTx` (Studio-Lock ist die ERSTE Anweisung, bleibt so) VOR der
Frisch-Prüfung `pg_advisory_xact_lock(hashtext('qr-charge-nummer'))`. Gelesen: `chargeAnlegen` nimmt NUR diesen Lock
und keinen Studio-Lock — kein Kreis. Vor dem Bau messen, ob ein Sperrordnungs-Wächter (`test_feature_auditlock_ordnung_
static.js`, `core/integritaet.js`) das zulässt; widerspricht er, melden statt umgehen. Test: zwei gleichzeitige
`korrigieren` derselben Zeile mit verschiedenen `--studio` → genau eine Korrekturzeile (Nachweis der Überschneidung wie
in `m3_beleg.js`).

## 6. Kleinere Punkte

- QJ-7: Fehler nach der Journalzeile mit `e.commitUngewiss` (bzw. `e.ursache.commitUngewiss`, s. `core/db.js`) →
  Meldung „Ausgang ungewiss — Audit-Kette prüfen“ statt „Audit-Glied FEHLT“.
- QJ-8: `verwerfen` zulassen für Bruchstücke, die mit `{"typ":` beginnen (unabhängig von Schlüsseln — die Zeile, die
  sie erledigen sollten, bleibt unerledigt und sperrt weiter). Scheitert das eigene Schreiben des Werkzeugs, nennt die
  Meldung das mögliche Bruchstück und den Weg (`zeigen`, dann `verwerfen`).
- QJ-9: `verwerfen` lehnt auch Zeilen ab, deren getrimmter Text ein PRÄFIX von `{"charge_id":` ist.
- QJ-11: Vorfalltext nennt zusätzlich, wie viele der unerledigten Zeilen DIESES Studio betreffen.
- QJ-12: ein Objekt mit Feld `typ` (gleich welchen Typs) ist nie eine Chargenzeile; unvollständig → kaputt, Kandidaten
  alle. Nummern in Metazeilen ≥ 1.
- Kopf des Werkzeugs: nach einem Rückrollen rät der ALTE Text wieder zum Entfernen der Datei — nicht befolgen.

## 7. Tests, die heute grün bleiben, obwohl der Schutz fehlt (QJ-10)

Je eine Fixtur/Zusicherung, jeweils mit Gegenprobe (Mutation → ROT, Rücknahme → GRÜN, Zahlen wörtlich):
M38 `von !== detail.nr_von` → `von > …` (A zu niedrig); M37 Rest-Studio (zwei verschiedene Studios); M1 Anker `^`;
M15 genau ein Schlüssel; M3 Frisch-Prüfung unter dem Lock; M30 Wortliste (löschen/entfernen/editieren + Datei); M9
`quelle`-Pflicht; Kimi 3.2 `treffer >= 4` → LITERAL; (6c) Aufbau wieder messen, ohne die Leiter aufzurufen (direkt aus
DB und Journal).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht durch diese Nacharbeit, den es vorher nicht gab — besonders: welche Studios sind nach einer
Korrektur frei, die vorher frei waren, und welche sind jetzt länger gesperrt?

-- Ende des Auftrags --
