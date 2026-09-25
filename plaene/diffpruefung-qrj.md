# Diffprüfung QR-J — Reparaturweg für kaputte Journalzeilen (25.09.2026)

Kopf `dc7ebac` (Zweig `fix-qrj-journal-reparatur`, master `00bd9c9` hereingemergt). Unwiderruflich → drei Spuren:
Claude ausführend (eigener Baum `gymdocu-qrj-cc`, eigene DB), `deepseek-v4-pro` mit Repo-Lesezugriff (ganzer Diff),
`kimi-k3` mit Bündel (Endstand von Leser, Werkzeug, `qr-token.js`, neuem Test, `integritaet.js`; nur der Test-Diff).
Executer-Bericht: 31 Mutationen alle rot, Suite 390 = 390, Lint EXIT 0.

## Eigene Lesung (vor den Spuren)

| Nr. | Befund | Nachgemessen | Einstufung |
|---|---|---|---|
| QJ-E1 | `verwerfen` prüft nur, ob ein VOLLSTÄNDIGER Schlüssel (`charge_id`, …) im Rohtext steht. Ein Bruchstück wie `{"char` oder `{"` ist der Anfang einer Chargenzeile und lässt sich trotzdem verwerfen — dieselbe Unbelegbarkeit, die PQJ-2 für Zeilen MIT Schlüssel ausschliesst | `pruefeVerwerfen` gelesen: `CHARGEN_SCHLUESSEL.filter((k) => roh.includes(k))` | mittel (Leitregel: nach oben) — Vorschlag: auch ablehnen, wenn der getrimmte Text ein Präfix von `{"charge_id":` ist |
| QJ-E2 | Ein abgeschnittenes METAzeilen-Bruchstück (`{"typ":"korrektur",…,"studio_id":…`) lässt sich nicht verwerfen (enthält einen Schlüssel) und nur über eine erfundene Korrektur mit `--studio` auflösen — obwohl sein Verwerfen nichts freigibt (die Zeile, die es erledigen sollte, bleibt dann unerledigt und sperrt weiter) | gelesen | gering (Bedienbarkeit) |
| QJ-E3 | Leeres Journal (0 Zeilen) + keine Charge des Studios: Leiter wirft, der Text rät nur noch `zeigen`, das Werkzeug hat keinen Befehl — Sackgasse. Eine LEERE Datei enthält keine Spur; sie zu entfernen verliert nichts und führt in den heute schon akzeptierten Zustand „Datei fehlt = Erstinbetriebnahme“. Der alte Rat war für GENAU diesen Fall richtig | Leiter `core/qr-token.js:~467` gelesen | mittel — Vorschlag: nur im Fall `zeilen === 0` den Rat wiederherstellen (leere Datei entfernen, wenn nachweislich noch nie gedruckt wurde); `zeigen` sagt dasselbe |

Sonst gelesen und in Ordnung: Zuordnung verankert und abgeschlossen; Erledigung als Paar Nummer + Hash über Rohbytes;
Korrekturspanne zählt; neue Sperre hinter dem C1-Zweig bei jeder relevanten Zeile; `eintragAnhaengen` mit `\n`-Vorspann
am selben Deskriptor; Werkzeug prüft (a)–(f) vor der Transaktion und die Zeile unter dem Studio-Lock erneut; Journal vor
dem COMMIT; kein Text rät mehr zum Entfernen der ganzen Datei.

## Runde 1 — Befunde der Spuren, selbst nachgemessen

Spuren: Claude ausführend (16 Zeilen, drei gemessene Doppelvergaben), DeepSeek (8), Kimi (3 + Bewertungen). R1 und R3
von mir mit den Skripten der Spur auf eigener Wegwerf-DB wiederholt: beide **DOPPELVERGABE** bestätigt
(R1: Vergabe 201200–201209 gegen verklebte C3 201200–201299; R3: 204151–204160 gegen 204100–204199). Kimi fand keinen
Doppelvergabeweg und hielt den Fall „nur Obergrenze, keine Charge“ für unschädlich — R1 widerlegt genau das: die
„Obergrenze“ kam aus einer Zeile, die im Journal VOR der kaputten steht.

| Nr. | Spur | Befund | Nachgemessen | Einstufung | Auftrag |
|---|---|---|---|---|---|
| QJ-1 | CC R1 | `nr_von` unlesbar → `--von` frei; (e) sucht die „nächste lesbare Zeile“ nach NUMMER statt nach Position — eine FRÜHERE Zeile wird Obergrenze, (e) drückt B darunter, (f) greift nicht | R1 wiederholt: Doppelvergabe | **blockierend** | Obergrenze nur aus Zeilen mit physischer Nummer > N (Korrekturzeilen: Position ihrer `ersetzt_zeile`); A muss über dem höchsten `nr_bis` derselben Studio-Spannen im Block liegen, die VOR N stehen |
| QJ-2 | CC R2, DS 2 | Unzuordenbare Zeile mit abgerissener Studiozahl (`"studio_id":6` aus 64): eine Korrektur mit beliebigem `--studio` erledigt sie für ALLE; lesbare `charge_id` wird nicht gegen `qr_charge` gehalten | CC gemessen (Doppelvergabe 202100–202109); Code gelesen | **blockierend** | Kandidatenmenge je Zeile (s. Nacharbeit), Erledigung je Studio, neuer Befehl `nicht-betroffen`; lesbare `charge_id` → `qr_charge`-Abgleich |
| QJ-3 | CC R3 | Abgeschlossen lesbares `nr_bis` im Rohtext wird ignoriert („nie lesbar“) und ist keine Untergrenze | R3 wiederholt: Doppelvergabe (mit `--ohne-systembeleg`) | mittel | `"nr_bis":(\d+),` verankert lesen → Untergrenze für B; Satz in `zeigen` streichen |
| QJ-4 | DS 1, CC 8, Kimi, E3 | Leeres Journal (0 Zeilen) → Sackgasse, der einzige verlustfreie Ausweg (leere Datei entfernen) ist verboten; `test_feature_qr_block.js` (o) zementiert die Meldung | CC gemessen (`r7_leer.js`: erster Druck ENOSPC → 0 Byte) | **blockierend** (DS) / mittel | Fall `zeilen === 0` von „kaputte Zeilen“ trennen; dort den verlustfreien Ausweg nennen (nur bei nachweislich noch nie gedruckten Aufklebern), `zeigen` ebenso; Test (o) anpassen |
| QJ-5 | Kimi 2 | Geklebte Altzeile mit UNLESBAREM Rest behält die Zuordnung des vorderen Studios — das Studio des Rests ist nicht gesperrt (fail-open) | gelesen `core/qr-verbrauch.js:306-315` | mittel | Kandidaten des Rests (dieselbe Regel) zur Zeile hinzunehmen |
| QJ-6 | DS 5, Kimi 3, DS 8, CC R5 | Kein gemeinsamer Lock: zwei `korrigieren` derselben unzuordenbaren Zeile mit verschiedenen `--studio` schreiben beide; `korrigieren` und `chargeAnlegen` teilen keinen Lock | CC: `chargeAnlegen` 55 ms bei offener Werkzeug-Tx, kein Fehlverhalten; Sperrreihenfolge gelesen: `chargeAnlegen` nimmt NUR `hashtext('qr-charge-nummer')`, keinen Studio-Lock | mittel | im Werkzeug nach dem Studio-Lock zusätzlich `hashtext('qr-charge-nummer')`, dann die Frisch-Prüfung — kein Kreis möglich; Sperrordnungs-Wächter prüfen |
| QJ-7 | DS 4, CC 9, Kimi | Verlorene COMMIT-Quittung: Meldung „Audit-Glied FEHLT“, obwohl es da ist (`commitUngewiss` ignoriert); Test stellt nur echten Rollback nach | CC gemessen (`r4_quittung.js`: Audit 0 → 1) | gering | Meldung nach `commitUngewiss` unterscheiden |
| QJ-8 | CC 7, E2 | Abgerissene METAzeile (eigener ENOSPC des Werkzeugs) sperrt ALLE und ist bei vorhandenem Schlüssel nicht verwerfbar | CC gemessen (`r6_riss.js`) | mittel (Betrieb) | `verwerfen` für Bruchstücke, die mit `{"typ":` beginnen, zulassen (die ersetzte Zeile bleibt unerledigt); Schreibfehler-Meldung nennt das mögliche Bruchstück |
| QJ-9 | E1 | `verwerfen` erlaubt ein Chargen-Bruchstück ohne vollständigen Schlüssel (`{"char`) | gelesen; Kimi hält es für unschädlich (nur vor dem COMMIT erreichbar) — dieselbe Unbelegbarkeit wie PQJ-2 | gering | Präfix von `{"charge_id":` ebenfalls ablehnen |
| QJ-10 | CC M38, M37, M1, M15, M3, M30, M9; Kimi 3.1–3.3 | Mutationen, die grün bleiben: `von > nr_von` statt `!==` (A zu niedrig), Rest-Studio falsch, `^` fehlt, genau ein Schlüssel, Frisch-Prüfung, Wortliste „löschen/editieren“, `quelle`-Pflicht, `treffer >= 4` statt Literal, (6c) Aufbau nicht mehr gemessen | CC: je Mutation EXIT 0 mit Zahlen (s. Bericht) | mittel | je eine Fixtur/Zusicherung |
| QJ-11 | CC 15, Kimi, DS | Vorfall `journal_kaputte_zeilen` alarmiert bei Studios, die gar nicht betroffen sind („kann ZU NIEDRIG sein“) | gelesen | gering | Text nennt, wie viele davon DIESES Studio betreffen |
| QJ-12 | DS 6/7 | `typ` als Nicht-String fällt in den Chargenzweig; negative Nummern in Metazeilen gelten als vollständig | gelesen | gering | `typ` vorhanden → nie Charge; Nummern ≥ 1 |
| — | Kimi 1 | `chargeLaden`/`maxTokenLaden` ohne `studio_id` | gelesen — bewusst (PQJ-14 braucht die fremde Charge), Datenfluss endet beim Betreiber per SSH | **gefallen als Befund** (begründete Ausnahme, im Kommentar) | — |
| — | CC 16 | `MAX(qr_token)`-Untergrenze ist in echten Daten wirkungslos (FK bindet Token an ihre Charge) | `pg_constraint` (CC) | Anmerkung | — |
| — | CC 14 | Nach Rückrollen rät der ALTE Text wieder zum Entfernen | gelesen | Anmerkung | Hinweis im Kopf des Werkzeugs |

Zahlen: 27 Befunde aus drei Spuren plus drei eigene; nach Zusammenfassung 12 Aufträge, einer gefallen (Kimi 1), zwei
Anmerkungen. Nur CC: R1, R3, alle Mutationen, Metazeilen-Riss. Nur Kimi: geklebter Rest. Nur DS: `typ`-Typ, negative
Nummern. Nur eigene Lesung: `{"char`-Bruchstück. Überschneidung aller drei: leeres Journal, Lock.

## Runde 2 (Kopf `0213cd9`, 25.09.2026)

Drei Spuren. Runde-1-Reproduktionen R1–R3 brechen jetzt ab (CC). Befunde:

| Nr. | Spur | Befund | Nachgemessen | Einstufung | Auftrag |
|---|---|---|---|---|---|
| QJ2-1 | CC R2-3 | Nach dem Zurückspielen wird die verlorene `charge_id` neu vergeben → (d) bricht bei jeder Korrektur ab, der Eigentümer bleibt dauerhaft gesperrt; `zeigen` nennt Zahlen einer fremden Charge als Untergrenzen | CC gemessen (`fc_id_wiederverwendung.js`) | hoch | Nacharbeit 2 §1 |
| QJ2-2 | CC R2-1, Kimi 2, DS | Präfix-/„alle“-Zeile nach Eigentümer-Korrektur ohne Schalter: übrige Kandidaten (auch künftige Studios) dauerhaft gesperrt, Schalter nachträglich nicht setzbar | CC gemessen (`fb_charge_ohne_schalter.js`) | hoch | §2 (`uebrige-freigeben`) |
| QJ2-3 | CC R2-2 | (d') widerspricht (d): zwei kaputte Zeilen desselben Studios, `zeigen` führt in die Falle, dauerhafte Sperre | CC gemessen (`fa_dstrich.js`) | hoch | §3 |
| QJ2-4 | CC R2-4 | Rest-Kandidat nie korrigierbar (Bruchstücke aus dem Vorspann) — einziger Ausweg eine falsche Erklärung → Doppelvergabe | CC gemessen | mittel–hoch | §5 |
| QJ2-5 | CC R2-5 | (e) harter Abbruch nach oben zwingt `--bis` zu niedrig, wenn eine Altlast-Spanne danach beginnt → Doppelvergabe | CC gemessen | mittel | §4 |
| QJ2-6 | CC R2-6 | Metazeilen-Bruchstück mit geklebtem Chargen-Rest verwerfbar | CC gemessen | gering–mittel | §6 |
| QJ2-7 | CC R2-7, Kimi 2.1, DS | Daueralarm bei jedem Druck jedes Studios für teilweise erledigte/nicht existierende Kandidaten | CC gemessen | gering | §6 |
| QJ2-8 | CC R2-8, Kimi 3.1–3.3, DS 3.3–3.5 | MU1, MU2, MU31, MU18b grün; (d')-Grenzfall; Sollwerte aus derselben Konstante; Wortlisten-Scan ohne `qr-verbrauch.js` | CC gemessen / gelesen | gering | §7 |
| QJ2-9 | CC R2-9 | `uebrige_nicht_betroffen` protokolliert keine Liste | gelesen | gering | §2 |
| QJ2-10 | DS R2-1 | Präfix mit führender Null sperrt das Studio nicht | gelesen; entsteht nicht durch `JSON.stringify` (CC, Kimi) | gering | §6 |
| — | Kimi 1 | „Riss nach `"menge":` + geklebte Charge ist gültiges JSON und verschluckt die Charge“ | **gefallen** — gemessen: kein gültiges JSON (schliessende Klammer fehlt), Studio 6 `hoechste` 201399, `kaputteZeilen` 1 | — | — |
| — | Kimi 3 | Rückrollen auf `dc7ebac` entsperrt Mitkandidaten | **gefallen** — `dc7ebac` war nie ausgeliefert, master steht vor QR-J | — | — |
| — | Kimi 4 | `kandidatenStudios` ohne `studio_id` unkommentiert | gelesen | Anmerkung | §6 Kommentar |

Executer-Widerspruch (zwei Korrekturen verschiedener Kandidaten legitim): alle drei Spuren geben ihm recht; meine
Testvorgabe in Nacharbeit 1 §5 war falsch.

## Runde 3 (25.09.2026, Kopf `153a7a4`, Nacharbeits-Diff `0213cd9..153a7a4`)

Nacharbeit 2 gebaut (Suite 390 = 390 grün, Lint EXIT 0, 31 Gegenproben rot). Der Ausführende hat eine Präzisierung
gegen den Wortlaut gebaut und begründet gemessen: eine Erledigung „für alle“ (Freigabe, `--uebrige-nicht-betroffen`)
reicht NICHT in einen Abschnitt, der ein bestimmtes Studio nennt und keine eigene Korrektur hat — sonst entstünde
`fd_einzigerweg` in zwei Schritten erneut (Korrektur Vorspann + Freigabe → Rest-Studio frei → 308100 doppelt).
**Angenommen** (Leitregel: Überspringen ist sicher). Spuren (unwiderruflich → drei): Claude ausführend
(`gymdocu-qrj-cc`, `scratchpad/qrjcc3/`), `deepseek-v4-pro` mit Repo-Lesezugriff auf den Diff, `kimi-k3` mit dem Endstand
der drei Dateien als Bündel.

### Eigene Lesung (vor den Spuren, als Fragen an sie weitergegeben)

| # | Befund (Verdacht) | Fundstelle |
|---|---|---|
| QJ3-E1 | Ein Studio kann Kandidat MEHRERER Abschnitte sein (Vorspann „genau S“ + Rest „alle“/Präfix von S). `erledigtFuer` gibt bei einer eigenen Korrektur sofort `true`, `abschnittIndexFuer` prüft nur den ersten passenden Abschnitt — eine zweite verlorene Charge von S bliebe unerledigt, ohne zu sperren | `core/qr-verbrauch.js` `erledigtFuer`, `abschnittIndexFuer` |
| QJ3-E2 | Präfix-Abschnitt, dessen Eigentümer nicht mehr existiert: übrige Präfix-Kandidaten gesperrt, Freigabe deckt einen Präfix-Abschnitt ohne Korrektur nicht, verwerfen verboten — Weg in den Endzustand? | `abschnittGedeckt`, `pruefeFreigabe` |
| QJ3-E3 | `--uebrige-nicht-betroffen` deckt jeden „alle“-Abschnitt — auch eine zweite verlorene Charge desselben Studios? | `abschnittGedeckt` (Zweig `korrektur`) |
