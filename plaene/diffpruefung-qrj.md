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

### Befunde Runde 3 (CC `scratchpad/qrjcc3/`, DeepSeek, Kimi)

Runde-2-Reproduktionen: 12 von 13 enden über das Werkzeug ohne Doppelvergabe und ohne Sperre (Vergabe literal im
CC-Bericht); `fg_anderer_block` bleibt gesperrt (QJ3-4). Basis 386/0.

| # | Spuren | Befund | Messung | Schwere | Entscheidung |
|---|---|---|---|---|---|
| QJ3-1 | E1, DS B1, Kimi R3-1, CC R3-1 | Mehrere Abschnitte DESSELBEN Studios: eigene Korrektur erledigt das Studio für die ganze Zeile (`erledigtFuer:326`), `vollErledigtDurch:348` bindet die Korrektur an keinen Abschnitt, `abschnittIndexFuer` nimmt den ersten statt den spezifischsten Treffer. Kimi Fall A: zwei „genau 5“-Abschnitte → Zeile nach EINER Korrektur für alle erledigt und versiegelt. Bestand schon auf `0213cd9` | CC: Vergabe S 320200 in die verlorene zweite Charge (genau/Präfix/alle je gleich) | **blockierend** | Nacharbeit 3 §1 |
| QJ3-2 | CC R3-2 | **Regress:** `chargeBeurteilen` wertet JEDE andere lesbare Zeile mit derselben `charge_id` als Wiederverwendung — auch eine FRÜHERE (vor dem Zurückspielen); die passende Charge verliert ihre Untergrenzen, eine zu niedrige Korrektur wird angenommen | CC: Korrektur 370100–370150 geschrieben, nach zweitem Zurückspielen Vergabe 370151 doppelt; `0213cd9` brach ab | **blockierend** | §2 (Inhaltsvergleich) |
| QJ3-3 | DS B4, CC R3-5 | Umgekehrt: eine an dieselbe physische Zeile GEKLEBTE vollständige Chargenzeile mit derselben `charge_id` wird weggefiltert (`z !== detail.zeile`) — eine fremde Charge gilt als Beleg | CC gemessen | hoch | §2 |
| QJ3-4 | CC R3-3, DS B2, E2 | Kandidaten nur aus `studios`: ein im Journal bekannter Eigentümer (lesbare Zeilen von 64) ohne DB-Zeile wird von der Freigabe „für künftige“ mit freigegeben; nach Wiederanlage vergibt 64 doppelt. Und der Präfix-Fall ohne existierenden Eigentümer hat nur einen Weg über eine ERFUNDENE Spanne | CC: 64 vergibt 331100 gegen verlorene 331100–331199; 6 nur mit Scheinspanne 330010 | hoch | §3 (Freigabe mit benanntem Eigentümer) |
| QJ3-5 | CC R3-4 | „genau 51“, `nr_von` in keinem Block des (wieder angelegten) Studios 51: dauerhaft gesperrt, kein Weg; `zeigen` behauptet einen | CC gemessen | mittel | §4 |
| QJ3-6 | DS B3, E3, Kimi | `--uebrige-nicht-betroffen`/Freigabe decken jeden „alle“-Abschnitt — auch einen mit Chargenschlüssel, der eine zweite verlorene Charge sein kann | gelesen, CC (c) | mittel | §1 (Regel je Abschnitt) |
| QJ3-7 | CC R3-6 | Testlücken: X11 (belegtVon ohne Charge-Teil) und X15 (`detail.nr_bis` statt `abschnitt.nr_bis`) bleiben 386/0, Folgen gemessen (Sperre ohne Weg bzw. Vergabe 391151 gegen gelesenes 391199) | CC gemessen | mittel | §5 |
| QJ3-8 | CC R3-7 | `zeigen`: „Untergrenzen: keine im System“ bei lesbarem `nr_bis` eines Rests | CC gemessen | gering | §5 |
| QJ3-9 | CC R3-8 | Freigabe-Liste/Payload können vom Leser abweichen (X1, X18, X19 grün) | CC gemessen | gering | §5 |
| QJ3-10 | Kimi R3-2 | blocklokaler C1-Wurf nennt `uebrige-freigeben` nicht | gelesen | gering | §5 |
| QJ3-11 | Kimi | `SCHALTER_WIRKUNGSLOS` sagt bei zwei „genau S“-Abschnitten „erledigt sie ohnehin für alle“ — falsch | gelesen | gering | §1 |
| — | CC | Obergrenze aus späterer kaputter Zeile kann zu niedrig sein, der Schalter ist aber genannt (ohne Schalter befolgt: 350160 doppelt) | CC gemessen | Anmerkung | Wortlaut (e) verschärfen: „nur wenn die Aufkleber die Obergrenze bestätigen“ — §5 |
| — | CC X5, X36, X17a/b | äquivalente bzw. append-only-bedingt wirkungslose Mutationen | — | — | toter Zweig X36 entfernen (§5) |

## Runde 4 (25.09.2026, Kopf `e94c4bc`, Nacharbeits-Diff `153a7a4..b7c564a`)

Nacharbeit 3 gebaut (Bericht des Ausführenden): Suite 394 = 394 grün, `test_feature_qr_journal.js` 526 PASS / 0 FAIL,
Lint 0, 18 Mutationen je ROT, Reproduktionen der Runde 3 danach ohne Fehlvergabe ausser o_ohne (Betreiberwahl gegen die
Aufkleber) und drei Skripten, die die neuen Schalter nicht kennen. Diff Datei für Datei gelesen.

Eigene Lesung (Fundorte, an die Spuren als Hinweise gegeben):
- QJ4-E1: ein bei einer Freigabe als `eigentuemer`/`ausgenommen` geführtes Studio wird nach dem Wiederanlegen nicht mehr
  als `nurJournal` erkannt; eine spätere Freigabe/`--uebrige-nicht-betroffen` könnte es decken, obwohl das Journal es als
  Eigentümer führt (`tools/qr-journal.js` `kandidatenStudios`, `ausgenommeneFuer`).
- QJ4-E2: `abschnittGedecktFuer` schliesst den Eigentümer nur über `ausgenommen` aus, nicht über `e.eigentuemer`.
- QJ4-E3: `zeigen` bestimmt Block/Nachbarn/Obergrenze über das `nr_von` des Vorspanns, auch wenn der offene Abschnitt ein
  späterer ist.
- QJ4-E4: Abschnitt mit Chargenschlüssel und Kandidat „alle“, Eigentümer nicht belegbar — ehrlicher Werkzeugweg?
Anlass für Runde 4: Verhaltensänderung am Leser (Erledigung je Abschnitt). Spuren (unwiderruflich → drei): Claude
ausführend (`gymdocu-qrj-cc`, `scratchpad/qrjcc4/`), DeepSeek mit Repo-Lesezugriff (Diff), Kimi (Endstand ganz).

| Nr | Quelle | Befund | Nachmessung | Schwere | Behebung |
|---|---|---|---|---|---|
| QJ4-1 | CC QJ4-1, DS 1, Kimi N4-1 Weg 1, E1 | `ausgenommen` gilt nur, bis das Studio wieder existiert: eine spätere Freigabe (vom Sperrtext empfohlen) deckt es ohne Korrektur | CC gemessen: 64 vergibt 331100–331109 in die verlorene C2 | blockierend | Einmal ausgenommen/Eigentümer bleibt ausgenommen (Leser UND Werkzeug); benannte Freigabe nur für Nicht-Eigentümer |
| QJ4-2 | CC QJ4-2, Kimi N4-1 Weg 2 | zweiter, widersprechender `--eigentuemer` wird geschrieben und deckt den ersten | CC gemessen: 64 vergibt 331100–331109 | hoch | `--eigentuemer` nur, wenn der Abschnitt weder Eigentümer noch Korrektur hat |
| QJ4-3 | CC QJ4-3 | (d') übersieht die Korrektur eines früheren Abschnitts derselben Zeile (`position === zeileNr`) | CC gemessen: Abschnitt 1 mit 360150–360199 angenommen, S vergibt 360200 in die verlorene C3 | hoch | Spannen derselben Zeile nach Abschnitt als davor/danach |
| QJ4-4 | CC QJ4-4 | wieder angelegter Eigentümer, Block verloren, `nr_von` unlesbar: kein Weg ohne Scheinspanne; Sperrtext empfiehlt einen Befehl, der mit (k) abbricht | CC gemessen | mittel | `--ausserhalb-bloecke` auch bei unlesbarem `nr_von` (--von nach den Aufklebern) |
| QJ4-5 | CC QJ4-5, DS 5, E4 | `--eigentuemer` nimmt jede nie gesehene ID an (verschmutzt `bekannteStudios`, fremde Zeilen bleiben für immer unerledigt); „alle“-Abschnitt mit Chargenschlüssel ohne belegbaren Eigentümer hat keinen ehrlichen Weg | CC gemessen (999999) | mittel | Eigentümer nur aus `bekannteStudios`; ehrlicher Weg `--keine-aufkleber` |
| QJ4-6 | CC QJ4-6, DS 4 | `AUSSERHALB_WARNUNG` „hebt keine Vergabe“ falsch: zählt, sobald ein Block sie enthält; `--bis` darf in einen Block ragen | CC gemessen (500101 nach Neuzustellung), DS gelesen (`hoechsteInBereich`) | mittel | Text; `--bis` ausserhalb aller Blöcke |
| QJ4-7 | CC QJ4-7 | Spanne ausserhalb über dem Block → `datenbank_zurueckgespielt` bei jeder Vergabe (4 von 4) | CC gemessen, Gegenprobe darunter 1 von 4 | gering-mittel | Quelle messen, Daueralarm abstellen |
| QJ4-8 | CC QJ4-8 | Korrektur-Payload `uebrige_studios` nennt ein Studio, das über einen anderen Abschnitt gesperrt bleibt; keine „NICHT freigegeben“-Zeile | CC gemessen (61) | gering | dieselbe Deckungslogik wie bei der Freigabe; QJ3-9-Test für den Korrekturweg |
| QJ4-9 | CC QJ4-9, DS 3, Kimi N4-3, E3 | `zeigen`: Block/Grenzen immer vom Vorspann | CC gemessen (Block 370000 statt 470000) | gering-mittel | je offenem Abschnitt |
| QJ4-10 | CC QJ4-10, Kimi N4-4 | Sperrtext „bereits eine Korrektur“ auch bei reiner Eigentümer-Freigabe; bei „genau S“ wird `uebrige-freigeben` empfohlen | CC gemessen, gelesen | gering | Texte verzweigen |
| QJ4-11 | CC QJ4-11, DS 2, Kimi N4-2, E2 | Leser schliesst den Eigentümer nur über `ausgenommen` aus | CC gemessen (Handzeile → 64 vergibt) | gering | `e.eigentuemer !== studioId` (in §1 aufgehend) |
| QJ4-12 | CC Punkt 4 | 10 von 19 Mutationen überleben mit 526/0, fünf mit gemessener Folge (V1, V7, V4, Q6, Q7), dazu V25, V6, T11 | CC gemessen | mittel | je ein Test, Mutation ROT |
| — | Kimi Frage 1b | „keine Sperre ohne Werkzeugweg; ehrlich: Korrektur eines realen Studios mit hoher Spanne“ | widerlegt durch QJ4-4 (gemessen); der Vorschlag schreibt eine erfundene Angabe | gefallen | — |

Zahlen: CC 11 Befunde + Mutationsliste, DS 5, Kimi 4 (+1 gefallene Behauptung); 12 Zeilen. Nur CC: QJ4-3 (Doppelvergabe),
QJ4-4, QJ4-7, QJ4-8, Mutationen. Alle drei: QJ4-1, QJ4-9, QJ4-11. Trockenlauf gegen Leser: Zufallssuche 0 Abweichungen
bei 1221 Studio-Fällen (Positivkontrolle unter Mutation: 36 bzw. 11). Grün: Reproduktionen der Runde 3.
Nacharbeit 4: `plaene/auftrag-qrj-nacharbeit4.md` (Verhalten ändert sich → Runde 5).

## Runde 5 (25.09.2026, Kopf `24b9be8`, Nacharbeits-Diff `e94c4bc..24b9be8`)

Nacharbeit 4 gebaut (Bericht): Suite 394 = 394, `test_feature_qr_journal.js` 687/0, Lint 0, 21 eigene Mutationen ROT,
Reproduktionen der Runde 4 ohne Fehlvergabe. Zwei Messungen widersprachen dem Papier und wurden gemeldet: §5 wörtlich
(„jede Spanne in keinem Block“) bricht `test_feature_qr_lage_blocklokal.js` 13b (Chargenzeile ausserhalb = Zurückspiel-
Signal) → gebaut enger über `ausserhalb_bloecke` der Korrekturzeile; die Zufallssuche findet Leser-Mutationen nicht mehr,
weil das Werkzeug seine Listen aus dem Leser simuliert (vom Papier verlangt, §6) — nur Werkzeug-Mutationen (109 Funde).
Eigene Lesung (Leser- und Token-Diff ganz, Werkzeug-Prüfungen der neuen Schalter): A/F/tragende Deckung wie im Papier;
Eigentümer-Freigabe nur mit Kandidatur tragend; `--keine-aufkleber` nicht für „genau S“; benannte Freigabe prüft
tragende Deckung, Listenwert, Widerruf; Quellenvergleich nimmt `ausserhalb`-Spannen nur aus, wenn die DB Chargen kennt.
Fundorte an die Spuren: Selbstnachweis Leser↔Werkzeug (unabhängige Erwartung nötig); „nur NEUE Ausgenommene“ in neuen
Metazeilen; echtes Zurückspielen hinter einer ausserhalb-Korrektur.
Spuren (unwiderruflich → drei; Kimi ohne Guthaben): Claude ausführend (`gymdocu-qrj-cc`, `scratchpad/qrjcc5/`, mit
Referenzmodell für die Zufallssuche), DeepSeek mit Repo-Lesezugriff (Diff), DeepSeek-Einzelaufruf (Endstand ganz).
