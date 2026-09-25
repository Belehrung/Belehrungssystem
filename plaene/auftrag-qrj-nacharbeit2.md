# Auftrag QR-J Nacharbeit 2 (25.09.2026)

Grundlage: Runde 2 auf `0213cd9` (`plaene/diffpruefung-qrj.md`, Abschnitt „Runde 2“). Die drei Doppelvergaben aus Runde 1
sind geschlossen. Runde 2 fand vier Sperren ohne Werkzeugweg und drei Doppelvergaben mit Vorbedingung. Reproduktionen
der ausführenden Spur: `/tmp/claude-0/-home-user-Belehrungssystem/c200d6d7-f0a2-5a02-8fb8-a4f662e3a700/scratchpad/qrjcc2/`
(`fa_dstrich.js`, `fb_charge_ohne_schalter.js`, `fc_id_wiederverwendung.js`, `fc2_kandidat_reuse.js`, `fd_rest.js`,
`fe_obergrenze.js`, `ff_meta_rest.js`, `fg_kandidat_weg.js`, `mu*_probe.js`; DB `gymdocu_qrjcc_test`, Baum über
`QRJ_BAUM`). Jede vor dem Bau gegen deinen Stand laufen lassen (muss das gemeldete Fehlverhalten zeigen), nach dem Bau
erneut — beides wörtlich.

Leitregel unverändert. Zusätzlich, weil Runde 2 genau daran scheiterte: **eine OBERGRENZE ist nie ein Sicherheitsriegel**
(zu hoch kostet nur Nummern), **eine UNTERGRENZE nur, wenn sie belegt ist** (aus der Zeile selbst oder aus einer
nachweislich zu dieser Zeile gehörenden `qr_charge`). Jede Sperre braucht einen Werkzeugweg in den Endzustand.

## 1. R2-3 — `qr_charge` nur als Beleg, wenn sie nachweislich zu DIESER Zeile gehört (hoch)

Nach dem Zurückspielen der DB setzt die IDENTITY-Sequenz zurück; die verlorene `charge_id` bekommt eine fremde Charge.
Eine gefundene `qr_charge` gilt deshalb nur als Beleg, wenn ALLES passt: ihr Studio ist Kandidat der Zeile, ein
lesbares `nr_von` der Zeile stimmt, UND keine ANDERE lesbare Journalzeile trägt dieselbe `charge_id` (eine spätere
lesbare Zeile mit derselben ID beweist die Wiederverwendung). Passt es nicht: kein Abbruch, sondern „keine Charge“
(dann gelten (f) und `--ohne-systembeleg`); `zeigen` sagt ausdrücklich „charge_id #N gehört heute einer anderen Charge
(nach dem Zurückspielen neu vergeben) — kein Beleg“ und nennt deren Zahlen NICHT als Untergrenzen. Die Regel
„das Studio der Charge ist das einzige zulässige `--studio`“ gilt nur für eine passende Charge.

## 2. R2-1, Kimi 2 — Weg in den Endzustand: `uebrige-freigeben` (hoch)

Neuer Befehl `node tools/qr-journal.js uebrige-freigeben --zeile=N --grund="<Beleg>" [--ja]`. Zulässig nur, wenn für die
Zeile schon mindestens eine Korrektur steht. Schreibt eine Metazeile `{typ:"freigabe", ersetzt_zeile, roh_sha256,
grund, durch, zeitpunkt}` (vollständige Form = Erledigung für ALLE), Audit `qr_journal_freigabe` im Studio der
vorhandenen Korrektur, Payload mit der Liste der freigegebenen existierenden Kandidaten-Studios (R2-9), Journalzeile
vor dem COMMIT unter Studio-Lock → Nummernraum-Lock (wie `korrigieren`). Trockenlauf druckt die Liste und den Satz aus
Nacharbeit 1. `zeigen` und der Sperrtext nennen den Befehl für jede teilweise erledigte Zeile als Weg in den Endzustand
(auch für künftig angelegte Studios, die eine alte Präfix-/„alle“-Zeile trifft). `metaZeileVollstaendig` kennt
`freigabe`; eine ältere Programmversion liest sie als kaputt (fail-closed, gewollt — Kopf nennt es).
`--uebrige-nicht-betroffen` an `korrigieren` bleibt; bei genau einem Kandidaten meldet das Werkzeug, dass der Schalter
wirkungslos ist (Kimi 5.5), statt ihn still fallen zu lassen. R2-9: auch dort die Liste in den Audit-Payload.

## 3. R2-2 — (d') nur, wenn `--von` NICHT belegt ist (hoch)

(d') bricht nur ab, wenn weder ein lesbares `nr_von` der Zeile noch eine passende `qr_charge` (Punkt 1) `--von` belegt;
sonst höchstens ein Hinweis. Zusätzlich: das lesbare `nr_von` einer SPÄTEREN (nach Position) unerledigten kaputten
Zeile desselben Studios im selben Block ist Obergrenze in (e) und in `zeigen`; `zeigen` listet die kaputten Zeilen
eines Studios in Journal-Reihenfolge und sagt, welche zuerst zu korrigieren ist. Pflichttest: `fa_dstrich.js` (beide
Varianten) → beide Zeilen lösbar, Vergabe danach ab dem LITERAL erwarteten Wert.

## 4. R2-5 — (e) ist kein Abbruch mehr ohne Ausweg (mittel)

Liegt `--bis` über der Obergrenze (e), bricht das Werkzeug ab, AUSSER mit dem blanken Schalter `--ueber-obergrenze`
(Warnung: „überschneidet die Spanne von Zeile M — nur mit Beleg aus den Aufklebern; zu hoch kostet nur Nummern“).
Pflichttest: `fe_obergrenze.js` → mit Schalter und B am echten Ende → Vergabe ab Ende + 1 (LITERAL).

## 5. R2-4 — Rest-Kandidaten korrigierbar (mittel–hoch)

Bruchstücke (`charge_id`, `nr_von`, `nr_bis`) je ABSCHNITT führen. Ist `--studio` Kandidat eines Rests (nicht des
Vorspanns), gelten für (c)/(d) die Bruchstücke dieses Rests. Pflichttest: `fd_rest.js` → Rest-Studio korrigierbar,
Vergabe danach ab Ende + 1 (LITERAL); die Korrektur für das Vorspann-Studio schaltet das Rest-Studio NICHT frei.

## 6. Kleinere Punkte

- R2-6: ein Metazeilen-Bruchstück ist nur verwerfbar, wenn die Zeile KEINEN weiteren `{"charge_id":`-Anfang enthält
  (`abschnitteVon(text).length === 1`); Test `ff_meta_rest.js`. MU31 (`startsWith` → `includes`) muss dadurch rot werden.
- R2-7, Kimi 2.1: der Vorfall `journal_kaputte_zeilen` (Telegram) nur, wenn für DIESES Studio `relevanteKaputte > 0`;
  sonst nur eine Logzeile. Zeile eines nicht (mehr) existierenden Studios: `zeigen` sagt das und nennt
  `uebrige-freigeben` bzw., bei „genau“ ohne existierendes Studio, dass die Zeile keine Vergabe sperrt.
- DS R2-1: Präfix mit führender Null (`"studio_id":0…`) → Kandidaten „alle“.
- Kimi 4: Kommentar an `kandidatenStudios` (bewusst ohne `studio_id`, Mandantentabelle selbst).
- Kimi 5.5 / QJ-7: gegen `core/db.js` messen, auf welcher Fehlerinstanz `commitUngewiss` landet; beide prüfen.
- DS: Beschriftung „25 Einträge“ in `test_feature_geistersperre_nachtrag_rennen.js` → 27 (bzw. die neue Zahl).

## 7. Tests, die grün bleiben, obwohl der Schutz fehlt

MU1 (`vollErledigtDurch`: mehrere „genau“-Kandidaten, nur einer erledigt → unerledigt), MU2 (zwei gleichzeitige
Korrekturen DESSELBEN Studios auf einer Präfix-Zeile → genau eine; Überschneidung nachgewiesen wie in F4), MU18b (Lock
in `verwerfen` als VERHALTEN, nicht nur im Inventar), (d')-Grenzfall `--von == höchstes nr_bis davor` (Kimi 3.1), und
die Sollwerte `UEBRIGE_ERKLAERUNG`/`LEERES_JOURNAL_HINWEIS` im Test LITERAL statt aus der Konstante (DS 3.4/3.5);
Wortlisten-Scan über ALLE drei Dateien (`core/qr-verbrauch.js` eingeschlossen, Kimi 3.3). Je Gegenprobe ROT/GRÜN.

Gefallen (nicht bauen): Kimi 1 (Riss nach `"menge":` + geklebte Charge ist KEIN gültiges JSON — gemessen: Studio 6
`hoechste` 201399, `kaputteZeilen` 1); Kimi 3 (Rückrollen auf `dc7ebac` — dieser Stand war nie ausgeliefert, master ist
vor QR-J).

## Zustandsfrage für den Bericht

Welcher Zustand entsteht durch diese Nacharbeit, den es vorher nicht gab — und gibt es nach ihr noch eine Sperre ohne
Werkzeugweg?

-- Ende des Auftrags --
