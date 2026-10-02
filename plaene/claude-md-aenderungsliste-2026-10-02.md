# Änderungsliste: CLAUDE.md neu gefasst (02.10.2026)

Quelle `alt.md` (2556 Zeilen, 163.852 Zeichen / 167.026 Bytes, Zeilen ca. 78 breit), Ergebnis `neu.md` (1072 Zeilen,
97.458 Zeichen / 99.280 Bytes; Fließtext auf 124 Zeichen umgebrochen, Tabellen und Codeblöcke länger). `neu-fassung1.md` = die erste Fassung
(1008 Zeilen), `neu-fassung2.md` = Stand nach dem Vergleich (1052 Zeilen), beide unverändert; `neu.md` ist die Überarbeitung nach `vergleich-sol.json` (Teil H)
und nach der Bestätigungsprüfung (Teil I). `archiv.md` = Kopf (7 Zeilen) + `alt.md` wörtlich (`cmp` EXIT 0). Abschnittsnummern („§", „7.3" …)
meinen die Überschriften in `neu.md`. „s. Archiv" = Abschnittsname aus `alt.md`.

Lesehilfe zu den Entscheidungen in Teil B bis E: **übernommen** (auch teilweise, dann steht dabei, was), **nicht übernommen,
weil …**, **Betreiber-Frage** (in `neu.md` mit „OFFEN — Betreiber-Frage 02.10.2026" markiert, nichts entschieden).

## A. Je Abschnitt von alt.md

| alt (Zeilen) | Abschnitt in alt.md | wohin in neu.md | gekürzt / zusammengelegt / ersetzt |
|---|---|---|---|
| 1–5 | Kopf | Kopf | beide Sätze wörtlich; dazu Satz zum Archiv und zur Schreibweise „(ersetzt …)" / „OFFEN" |
| 7–17 | Umsetzung nur über den Executer-Agenten | §1 | wörtlich; F1 markiert |
| 19–39 | Ausgabetext auf das nötige Minimum | §2 | wörtlich; im Folgesatz vom 30.09. mittags `gpt-6-sol` → `gpt-6.1-sol` (Vorgabe vom 01.10.), Verweis auf F2 |
| 41–55 | Eine benannte Grenze ist kein Endzustand | §3 | wörtlich |
| 57–126 | Modellwahl beim Delegieren | §5 | Übergang (01.10.) und Vorgabe 08.09. wörtlich; „sie ersetzt alles Frühere" → Verweis statt Vorgeschichte (90–108: 23.08., 06.09., Terminal-Bench, Detail zu #103) → Archiv; 110–126 auf die tragenden Sätze gekürzt; „Modellwechsel ist nie die Erklärung" nur hier (Dublette aus 759–763 entfällt) |
| 128–296 | Prüf-Ritual des Haupt-Agenten | §6 (Schritte 1–7) | Suite-Aufruf, Sperrdatei, Einzeltest-DB, flock, Dateizahl-Ritual, 6a, Deploy-Punkte vollständig; Messgeschichten je Regel auf ein Datum gekürzt; F2 (Schritt 1), F4 (6b) markiert; Schritt 3 verweist auf den Auslöser vom 12.09. |
| 298–345 | Astra: Einleitung, Rollen, Ablauf, Rundenbegrenzung | 7.1, 7.2 | 10.09. wörtlich; Ablauf ohne Pflicht-Bestätigung (13.09. ersetzt); Kosten je Runde (7,47 bis 15,39 $) → Archiv |
| 347–400 | Wann | 7.3 | 11.09. und 12.09. wörtlich; Plan-Auslöser (18.09.) vor die engere Fassung vom 10.09. gestellt, diese „ersetzt, s. Archiv"; Belege gekürzt |
| 402–430 | Wie die Prüffrage gestellt wird | 7.5 | Regel und Gegenrichtung vollständig; Runden 2 und 3 → Archiv |
| 432–460 | Was Astra bekommt | 7.6 | Bündelregeln, 3,71, ~400k vollständig; „922.000" nur noch als falsche Altangabe; F3 markiert |
| 462–478 | Prüfreihenfolge | 7.7 | alle sieben Punkte; Beispiele zu Punkt 2 → Archiv |
| 480–536 | Worauf sich das stützt | 7.3, 7.4, 7.5, 7.11 | Laufzahlen → `ASTRA-LAEUFE.md`/Archiv; „bis heute drei Läufe" nicht übernommen (S17); Telegram-Fund als Prüffrage in 7.5; Rechtsquelle in 7.11 |
| 538–595 | Aufrufmuster | 18.1 | curl-Muster, Zielkonfiguration, Umsetzungsstand mit Datum; BERICHTIGT-Absatz auf den Stand reduziert |
| 597–632 | Kimi K3 | 18.4 | Endpunkt-Eigenheiten vollständig; „NICHT gemessen: Prüfgüte … läuft" durch Verweis auf die A/B-Läufe ersetzt (S15) |
| 634–789 | Welche Modelle zur Verfügung stehen | 7.1, 18.3, 18.4, 18.5 | Besetzung der Rolle (7.1); DeepSeek-Eigenheiten (18.3); Modelltabelle mit gemessenen effort-Stufen (18.5, „einziges `max`" gestrichen); Pro-Preise, `gpt-5.6-sol`-Begründung, Vorgeschichte → Archiv; ältere Pro-Vorgaben „ersetzt, s. Archiv" |
| 791–868 | Drei Zusätze am Prompt | 7.9, 7.8 | Zusätze 1–3 und Ablehnung der Ausführung wörtlich; Lesen erlaubt (13.09.); Ausführung DeepSeek (26.09.) wörtlich mit `flash` |
| 870–961 | Was die Schnittstelle wirklich kann | 18.2 | Bildeingabe, web_search, effort, Betriebsfallen; Wiederholschleife nur noch mit der 300-s-Grenze (S30) |
| 963–1013 | Nachgemessen 18.09. – vier Fähigkeiten | 18.2, 7.8 | input_tokens, truncation, costs, encrypted_content, BEHAUPTET-Liste; Ausscheiden von Ausführung/Ablage in 7.8 |
| 1015–1113 | Das Maximum herausholen | 7.3 (Zitat, Punkt 1), 7.6 (2, 3), §14 (4), 7.10 (5) | Zitat und alle fünf Punkte; Belege gekürzt; Prüfspur-Ablehnung in 7.8 |
| 1115–1205 | Nachgemessen 12.09. | 18.2, 7.3, 7.6, §11 | Parameterliste, Zielkonflikt store/previous_response_id (ENTSCHEIDUNG), drei Änderungen der Arbeitsweise; „Ehrlich dazu" (1192–1199) gestrichen (Dublette der Rundenbegrenzung); Hausregel „zweimal nicht befolgt" nur in §11 |
| 1207–1234 | Context Notes | 18.2 | zwei Sätze; „192k gegen 922k" nicht übernommen (S27) |
| 1236–1268 | Kreuzverhör | 7.10 | Regel, Studie, Pilot; Zahlen der Studie vollständig |
| 1270–1293 | 20.09. verschiedene BÜNDEL | 7.4 | Vorgabe wörtlich; Überschneidungstabelle → Archiv |
| 1295–1358 | 20.09. abends WENIGER Spuren | 7.4 | Vorgabe wörtlich, Tabelle Plan-/Diffprüfung vollständig, Rangfolge; Bauauftrags-Tabelle → Archiv |
| 1360–1400 | Befunde WEITERREICHEN | 7.10 | auf Status „NOCH NICHT GEMESSEN, VORERST ZURÜCKGESTELLT" und die Aufbauregel verdichtet (S41) |
| 1402–1424 | Wie die Praxis es nennt | 7.10 | Fachnamen; HackerOne-Warnung → Archiv |
| 1426–1440 | Kosten | 8.1 | Bagatellgrenze wörtlich, F1 markiert |
| 1442–1457 | Vorarbeit nach unten | 8.2 | `kundschafter` nur noch nachrangig (S4), F2-Verweis |
| 1459–1473 | Vielköpfige Recherche-Läufe | 8.3 | vier Fragen; Ausnahme 30.09. für DeepSeek/Kimi/`gpt-6.1-sol` (S5) |
| 1475–1987 | Prüfen: was ein Ergebnis wert ist | §9 | alle Regeln, zu 16 Listenpunkten zusammengezogen; Frühausstieg-Regel (2060–2070) hierher; S42 korrigiert; Messreihen (PASS/FAIL-Zahlen) → Archiv |
| 1989–2084 | Transaktionen und Sperren | §10 | alle Regeln und Fundstellen (`:2710`, `:3140` …); Frühausstieg nach §9 |
| 2086–2264 | Prüfstand-Regeln | §12 | Arbeitsbaum-Befehle, Subagent-Regel, Neustart, Tests/Deploy-Wege (S36), PG-Cluster + Hook-Grenzen vollständig; S46 |
| 2266–2279 | Dieselbe Aussage an zwei Orten | §11 | wörtlich; plus Hausregel und Zahl-veraltet-Satz aus 1201–1205/594 |
| 2281–2352 | Hooks und Werkzeuge, die sich selbst durchsetzen | §13 | alle Hook-Regeln; C2-Widerspruch nur als gemessener Stand (S39) |
| 2354–2366 | Abhängigkeiten anheben | §14 | `npm diff`, Majors; dazu das Audit aus 1069–1096 |
| 2368–2489 | Was diese Umgebung wirklich kann | §15 | alle Punkte; GitHub-Regel mit ZIP-Ausnahme (S47) |
| 2491–2518 | Werkzeuge | §16 | gekürzt auf drei Punkte (Marktplatz/Verfügbarkeit zusammengelegt) |
| 2520–2539 | Ein Ort für den Stil | §17 | Abstandslücke ohne „nicht erfüllbar" (S49) |
| 2541–2556 | Kontext | §4 | wörtlich; früh gestellt, weil Betreiber-Vorgabe vom 26.09. |

## B. Befunde aus befunde-sol.json (49)

| Nr | Kat. | Entscheidung | Begründung / Fundort |
|---|---|---|---|
| S1 | widerspruch | **Betreiber-Frage F1** | Vorgabe 10.08. gegen Bagatellgrenze; in §1 und 8.1 markiert |
| S2 | ersetzt | übernommen (teilweise) | 30.09. („tragende Befunde") steht in §2 und 7.1 „Nachmessen" vorn; 6b und Rundenbegrenzung behalten „Befunde selbst nachmessen". Nicht übernommen: „tragend" zu definieren (neue Regel) |
| S3 | ersetzt | **Betreiber-Frage F2** | Schritt 1 „Diff vollständig lesen" neben der Lesedelegation vom 30.09.; Auftrag nennt S3 ausdrücklich als F2 (obwohl S2–S5 sonst als Ersetzung geführt werden). Seit Teil H (V21/V22) als FRAGE formuliert, nicht als Widerspruch |
| S4 | ersetzt | übernommen | 8.2: `kundschafter` nur noch, wo DeepSeek/Kimi/`gpt-6.1-sol` es nicht können |
| S5 | ersetzt | übernommen | 8.3: Ausnahme von der Kostenbegründung für diese Modelle; Fragen 1 bis 4 bleiben stehen |
| S6 | wirkungslos | nicht übernommen, weil neue Regel (Auslöser/Frist der Extrarunde) | §3 wörtlich |
| S7 | wirkungslos | nicht übernommen, weil neue Regel (Verfügbarkeitsprobe Fable) | §5 wörtlich |
| S8 | widerspruch | übernommen | §6 Schritt 1: „definitionsgemäß" entfällt, Begründung berichtigt |
| S9 | wirkungslos | nicht übernommen, weil neue Regel (Ersatzweg für `/code-review`) | Verfügbarkeitsregel in §16 unverändert |
| S10 | ersetzt | übernommen | §6 Schritt 3 verweist auf den Auslöser vom 12.09. (7.3); „bei folgenschweren Änderungen" als ersetzt benannt |
| S11 | ersetzt | übernommen | „Astra" = Rolle (7.1), Besetzung nach den späteren Vorgaben |
| S12 | ersetzt | übernommen | 27.09. `deepseek-flash` vorn (7.1), Variante 1 mit `flash` (7.8), `deepseek-v4-pro`-Stellen als ersetzt benannt; die Messungen zu Pro bleiben in 18.3, ausdrücklich als Pro-Messung |
| S13 | ersetzt | übernommen | `gpt-6.1-sol` an allen operativen Stellen; A/B vom 23.09. bleibt als `gpt-6-sol`-Messung gekennzeichnet (7.1, 18.5) |
| S14 | veraltet | übernommen | „einziges `max`" entfällt, Tabelle 18.5 |
| S15 | veraltet | übernommen | 18.4: A/B-Läufe 19./20.09. statt „läuft"; keine Gleichwertigkeit abgeleitet |
| S16 | widerspruch | übernommen | 9 ≠ 7+3: Zahlen nicht genannt (7.3) |
| S17 | veraltet | übernommen | „bis heute drei Läufe" entfällt, Verweis auf `ASTRA-LAEUFE.md` (7.3, 7.4) |
| S18 | ersetzt | übernommen | 7.2 „Stand 10.09.; lesende Werkzeuge seit 13.09.2026"; 7.8 Lesen erlaubt; Satz „keine Werkzeuge und keinen Repo-Zugriff" (12.09.) nicht übernommen |
| S19 | ersetzt | übernommen | 7.8 trennt Ablehnung (11.09.), Lesen (13.09.), begrenzte Ausführung DeepSeek (26.09.); Freigabe/Bau/Einführungstest als drei Zustände benannt |
| S20 | wirkungslos | nicht übernommen, weil Auflösung = Änderung der Betreiber-Sicherheitsgrenze oder neue Regel | „genau eine Stelle" (7.8) und „alle Riegel mutieren" (§9) stehen unverändert; **mögliche Betreiber-Frage, nicht markiert** (s. Bericht) |
| S21 | ersetzt | übernommen | 7.2: Ablauf ohne Pflicht-Bestätigung, „Astra bestätigt" nur in der zweiten Runde |
| S22 | ersetzt | übernommen | 7.3: Plan-Auslöser vom 18.09.; engere Fassung vom 10.09. „ersetzt, s. Archiv" |
| S23 | wirkungslos | nicht übernommen, weil neue Regel (zulässige Ausnahmen) | Wortlaut in 7.3 unverändert |
| S24 | ersetzt | übernommen | 7.4: Tabelle 20.09. zuerst, Additionsregeln 10.09./18.09. als ersetzt benannt |
| S25 | widerspruch | **Betreiber-Frage F4** (zusätzlich) | „dritte Spur" des Review-Bots (6b) gegen Spurenzahl 20.09. |
| S26 | widerspruch | **Betreiber-Frage F3** (zusätzlich) | Datengrenze gegen Testausgaben/Screenshots (7.6) |
| S27 | veraltet | übernommen | 922.000 nur als falsche Altangabe; Context-Notes-Satz entfällt |
| S28 | veraltet | übernommen | Struktur von `context_management` genannt (18.2), „zuerst ermitteln" entfällt |
| S29 | veraltet | übernommen (teilweise) | „für einen Einzelaufruf mit Bündel nebensächlich" (18.2); „Gegenlesung ist EIN Aufruf mit EINEM Kontext" nicht übernommen |
| S30 | ersetzt | übernommen | 18.2: harte 300-s-Grenze, Wiederholschleife hilft dagegen nicht |
| S31 | widerspruch | übernommen | Einleitung §18: Erkennung, Ausführung, Wirkung als drei Zustände |
| S32 | wirkungslos | nicht übernommen, weil neue Regel (Anbieterbedingungen dokumentieren) | `store: false`-Wortlaut unverändert |
| S33 | wirkungslos | nicht übernommen, weil neue Regel (Prüfzeitpunkt Audit) | §14 wörtlich |
| S34 | wirkungslos | nicht übernommen, weil neue Regel (Zielrevision prüfen) | §6 Schritt 7 unverändert |
| S35 | widerspruch | übernommen | §6 Schritt 7: ausliefernder Lauf führt alte Fassung aus, erst der Lauf danach die neue |
| S36 | widerspruch | übernommen | §12: „als PFLICHT-Gate gedacht" (Soll) und „aus dem Repo nicht belegbar → UNBESTÄTIGT" (Ist) getrennt |
| S37 | widerspruch | nicht übernommen, weil Abgrenzung der Testressourcen = neue Regel | Wortlaut „weder echtes Dateisystem noch echte Prozesse" unverändert (§12, 7.9); **mögliche Betreiber-Frage, nicht markiert** |
| S38 | widerspruch | nicht übernommen (kein Vorgabe-gegen-Vorgabe-Fall) | „jede Abfrage trägt `studio_id`" (Regel) gegen ein Prüfurteil in §9 (Prüfung nach dem Lesen); **mögliche Betreiber-Frage, nicht markiert** |
| S39 | widerspruch | übernommen | §13: nur der gemessene Stand (CLI-Quelltext und Probe); „offen (C2)" entfällt |
| S40 | widerspruch | übernommen | 8.1: Executer liest die CLAUDE.md des Zielrepos, Recherche-Subagenten diese Datei nicht |
| S41 | widerspruch | übernommen | „Zwei gemessene Risiken" entfällt; Status „NOCH NICHT GEMESSEN, VORERST ZURÜCKGESTELLT" (7.10) |
| S42 | widerspruch | übernommen | §9: 11 bis 30 auf 40 Zeilen → von 11, bis 30, gesamt 40, Ausschnitt 20 |
| S43 | wirkungslos | nicht übernommen, weil neue Regel (Quelle der Sollzahl) | „im GymDocu-Repo bleibt die Zahl maßgeblich" unverändert; 6 und 4 nur noch im Archiv |
| S44 | wirkungslos | nicht übernommen, weil neue Regel (atomares Abschlussartefakt) | „auf ein ARTEFAKT warten" unverändert (§15) |
| S45 | wirkungslos | nicht übernommen, weil neue Regel | `pgrep -x`-Beispiel unverändert (§15) |
| S46 | widerspruch | übernommen | §12: Pauschalsatz („jedes Messmittel im Prozess …") entfällt; referenzierte Handles werden `unref()`t |
| S47 | ersetzt | übernommen | §15: „geht über die MCP-Werkzeuge", ZIP-Archiv als Ausnahme benannt |
| S48 | wirkungslos | übernommen (teilweise) | „in dieser Umgebung" ergänzt (Überschrift „nachgemessen"); Locale-Dokumentation nicht übernommen (neue Regel) |
| S49 | widerspruch | übernommen | §17: „Die Regel oben nennt Abstände nicht"; „derzeit nicht erfüllbar" entfällt |

## C. Befunde aus befunde-flash.json: doppelt (16)

| Nr | Gegenstand | Entscheidung |
|---|---|---|
| D1 | Modellwechsel ist nie die Erklärung | übernommen: einmal in §5, Zusatz „Verdacht gegen das neue Modell" dorthin; zweite Fundstelle (759–763) gestrichen |
| D2 | Plan vor dem Bau (391, 1022, 1161) | übernommen: einmal in 7.3; Belege gekürzt; Nr. 1 aus 1161–1165 entfällt |
| D3 | Geschwisterstellen ins Bündel | übernommen: Regel einmal in 7.6; Verweis in 18.2 (Context Notes) |
| D4 | „Astra bestätigt" nie mergefähig | übernommen: Regel in 7.2; in 7.3 bleibt sie als Teil der wörtlichen 11.09.-Vorgabe; 861–864 gestrichen |
| D5 | Bündelgröße zählen | übernommen: Regel in 7.6, Messung in 18.2 |
| D6 | `store: false` gewinnt | übernommen: Entscheidung in 18.2; der Satz in 997 bleibt Teil der `encrypted_content`-Bewertung |
| D7 | Screenshot | übernommen: Regel in 7.6, Messung in 18.2 |
| D8 | Befund = Behauptung | übernommen: einmal in 7.1 „Nachmessen", Schlusssatz 7.4; Wiederholungen gestrichen |
| D9 | Hausregel „zweimal nicht befolgt" | übernommen: nur §11 |
| D10 | `stream: true` | übernommen mit Rest: Zielkonfiguration (18.1), 300-s-Messung (18.2) und Kimi-Eintrag (18.4) bleiben als je eigene Regel (stehen auf der Auftragsliste) |
| D11 | EINE Runde | übernommen: nur 7.2; „Ehrlich dazu" (1192–1199) gestrichen |
| D12 | 27.09. ersetzt 23.09./18.09. | übernommen (s. S12) |
| D13 | 01.10. ersetzt 23.09. | übernommen (s. S13) |
| D14 | „Widerspruch" 26.09. gegen 27.09. | nicht als Betreiber-Frage: die Vorgabe vom 27.09. nennt „künftige ausführende Spur „Variante 1"" ausdrücklich; umgesetzt in 7.8 mit `flash` |
| D15 | 10.08. gegen Bagatellgrenze | **Betreiber-Frage F1** |
| D16 | Positivkontrolle dreifach | übernommen: Regel in §9; 7.9 Nr. 1 bleibt als Teil der wörtlichen 11.09.-Entscheidung |

## D. Befunde aus befunde-flash.json: verdichten (15)

Alle übernommen (je Regel: die Regel, ein Satz Begründung, Verweis auf das Archiv): V1 → §5, V2 → 7.2, V3 → 7.5, V4 → 7.3/7.4,
V5 → 7.5 (LIVE-Server-Frage), V6 → 7.1/18.5, V7 → 18.2, V8 → 7.3/7.6/18.2, V9 → 7.10, V10 → 7.4, V11 → 7.10 (Fachnamen),
V12 → §10, V13 → §12, V14 → §15, V15 → §16/§17. Die Verdichtung geht nicht so weit wie vorgeschlagen (V13: „PG-Cluster ggf.
vorher starten" allein): Befehle, Pfade und Fundstellen der Auftragsliste stehen vollständig.

## E. Befunde aus befunde-flash.json: gliederung (17) und nicht_verlieren (30)

**Gliederung** (Vorschlag, abweichend umgesetzt): G1 Betreiber-Vorgaben → nicht als Sammelkapitel (§1 bis §5, am Ort der
Anwendung; sonst doppelt); G2/G16 Delegation, Kosten → §1, §8; G3 Prüf-Ritual → §6; G4 Modellwahl → §5; G5 Gegenleser → §7;
G6 Zusicherungen → §9; G7 Transaktionen → §10; G8 Prüfstand → §12; G9 Werkzeuge/Netz/CI → §15/§16; G10 Hooks → §13;
G11 Ausgabe → §2; G12 zwei Orte → §11; G13 Stil → §17; G14 Kontext → §4; G15 Abhängigkeiten → §14; G17 Recherche → §8.3.
Schnittstellen der Prüfmodelle stehen hinten (§18). Die Zeilenschätzung der Liste ist fehlerhaft (Summe der 17 Werte 755, nicht
„ca. 650").

**nicht_verlieren** (30 + die Auftragsliste): alle vorhanden, mit Suchzeichenfolgen gegen `neu.md` geprüft. N1 bis N4 → §6 Schritt 4;
N5 → §12; N6 → §12; N7 → §12; N8 → §12/7.9; N9 → §12; N10, N11 → §15; N12, N13 → §10; N14 bis N16 → §6 Schritt 7; N17, N18,
N19 → §15; N20 → §6 (6a); N21 → §4; N22 → 7.1; N23 → 18.3; N24 → 18.4; N25 → 18.3; N26 → 18.2/18.1/18.4; N27 → 18.2; N28, N29,
N30 → §9. Auftragsliste: Suite-Aufruf mit `SUITE_EXIT`, Sperrdatei, Dateizahl-Muster, `--exclude-dir`-Marker-Scan, curl-Muster,
Zielkonfiguration, ~400k und 3,71, 300 s → `stream: true`, Endpunkt-Eigenheiten DeepSeek/Kimi, `get_check_runs`, ZIP-Log,
`-- Ende der Botschaft --`, Hook-Grenzen, PostgreSQL-Start.

## F. Zusätzliche OFFEN-Markierungen (nicht im Auftrag genannt)

- **F3** (7.6): Datengrenze („nur Diffs, selbst geholte Gesetzestexte und Dateien, die `git ls-files` auflistet") gegen die verlangten
  Testausgaben und Screenshots (sol S26).
- **F4** (§6, 6b): Zählt der Review-Bot („dritte Spur") zur Spurenzahl vom 20.09.? (sol S25).

## G. Zeilenangaben der Befundlisten

Geprüft mit `alt-nummeriert.txt`: jeder Zitatteil der 49 sol-Befunde gegen die genannten Zeilen, jedes flash-`doppelt` gegen die
Zeilenliste, jeder Backtick-Begriff von `nicht_verlieren` gegen den genannten Bereich. Ergebnis: **keine sachlich falsche Zeilen-
angabe.** Abweichungen: Zitate mit anderem Anführungszeichen oder ohne Markdown-Marker (sol S31: `„OK“` statt `„OK"` in Zeile 874;
flash D10 und D16: `**` im Quelltext; N10 `read -t N` statt `read -t 5`; N26 `stream:true` statt `"stream": true`); flash D9 nennt in
`zeilen` 1201–1203/2473–2475, im Vorschlag aber 1026–1028/2473–2475; die Rechenschaft der Gliederung nennt „ca. 650" Zeilen,
die Summe beträgt 755.

## H. Vergleich V1–V23 (`vergleich-sol.json`, alt gegen `neu-fassung1.md`)

Jede Zeilenangabe wurde vor der Umsetzung gegen `alt.md` und `neu-fassung1.md` geprüft: alle 23 stimmen (alt-Zeilen und neu-Zeilen
liegen im genannten Bereich; V13 zitiert ein Beispiel, das nur in NEU stand). Alle Änderungen betreffen `neu.md`; `neu-fassung1.md`
blieb unverändert (sha256 22cdebaa…02d). Die Reihenfolge der Abschnitte in `neu.md` ist gleich geblieben.

| V | Entscheidung | Umsetzung in `neu.md` |
|---|---|---|
| V1 | übernommen | 7.6, Punkt „Jeder Lauf wird zählbar festgehalten": „Wer hier eine Regel einträgt, die einen Ablageort voraussetzt, legt ihn im selben Zug an" samt dem Anlass (Regel stand vom 12. bis 13.09. ohne die Datei da) |
| V2 | übernommen | 7.10, „Befunde WEITERREICHEN": beide Fragen („was fehlt", „welche Behauptung stützt sich auf etwas, das im Material nicht steht"), die Messgrößen (neue Befunde, Prämissen-Berichtigungen, Verankerung) und die Freigabe (erst, wenn das Nachmessen billiger geworden ist) |
| V3 | übernommen | 7.10: zwei Läufe mit verschiedenen Aufträgen werden an einem echten Diff gemessen, bevor sie als Regel stehen (mit den beiden Beispielaufträgen aus ALT) |
| V4 | übernommen | §9, Punkt „Ein Fund, den der Finder selbst als unrealistisch zurückstuft": „Die Gegenprobe selbst bleibt dabei die realistische: der unrealistische Fund ist Anlass zum Nachschärfen, nicht der Beleg" |
| V5 | übernommen | §9, Punkt „Dass A ausreicht, heisst nicht, dass B wirkungslos ist": Wegnehmen nur nach der Messung, dass Y in KEINEM vorkommenden Aufbau trägt; bis dahin bleibt beides stehen; dazu „eine Messung an EINER Geometrie beantwortet die Frage nicht" |
| V6 | übernommen | §9, Zusicherung aus dem falschen Grund grün: Gegenmittel „unverwechselbar machen" (anderer Name als in jeder anderen Tabelle) und ROT-Messung am lahmgelegten Weg |
| V7 | übernommen | §9, „Eine Behebung kann das Gemeldete gegen etwas SCHLIMMERES tauschen": Bei „weniger anzeigen" als Behebung zuerst prüfen, was unsichtbar wird |
| V8 | übernommen | §9, Mutationsmuster: bei unerwartetem Grün ZUERST prüfen, ob die Mutation dort gelandet ist, wo sie hin sollte |
| V9 | übernommen | §10: „erst Tokens entwerten, dann PIN setzen" (ohne Transaktion) |
| V10 | übernommen | §13: `test/hooks-pruefen.sh` bricht ab, wenn weniger Fälle liefen als erwartet |
| V11 | übernommen | 18.2: der datierte Betreiber-Satz (10.09.2026) zu „Context Notes", Datenbankschema und API-Dokumentation als dauerhaftem Kontext wörtlich aus ALT; die technische Einordnung folgt getrennt dahinter |
| V12 | übernommen | 18.5: Absatz „Wofür was": Empfehlung aus den Messungen, keine Vorschrift, ausgenommen Betreiber-Entscheidungen |
| V13 | übernommen, mit Abweichung vom Vorschlag | §9, vierte Form: ALT-Beispiel „11, 999 auf 40 Zeilen" nennt „vier verschiedene Werte", es sind drei (gelesenes Ende und Dateilänge sind beide 40). Neues Beispiel mit dem Zeilendeckel 400 (`MAX_LIES_ZEILEN`, `tools/gegenleser-repo.js:312`, Kürzung ab Zeile 735): 11 bis 999 auf 500 Zeilen → von 11, angefragtes Ende 999, gelesenes Ende 410, gesamt 500, Ausschnitt 400 — fünf verschiedene Werte. Der Vorschlag „60 Zeilen, 11 bis 50" erfüllt nicht beides (angefragtes = gelesenes Ende), und auf einer Datei unter dem Deckel ist gelesenes Ende ≠ angefragtes Ende nur zu haben, wenn das gelesene Ende mit der Dateilänge zusammenfällt |
| V14 | übernommen | §9, Marker-Scan: „nach Möglichkeit getrennt" und „und dort gehört er auch hin" wie in ALT |
| V15 | übernommen | 18.5, „Ein Modell einordnen": Reichweite wie in ALT (der konkrete Vergleich unterschied die fünf Modelle nicht; Schluss auf Prüfeignung ist eine ungemessene zweite Behauptung) |
| V16 | übernommen (nur Datum) | 18.3: „hat dafür seit 23.09.2026 einen DeepSeek-Weg"; die Aussage „hat" bleibt (laut Haupt-Agent gemessen: das Werkzeug läuft mit `--modell=deepseek-flash`) |
| V17 | übernommen | 7.6: die 400.000-Grenze gilt für den OpenAI-Endpunkt (`gpt-6-astra`); `kimi-k3` hat 1.048.576 (18.4) |
| V18 | übernommen | 7.4: beide datierten Betreiber-Entscheidungen vom 20.09. (verschiedene Bündel; weniger Spuren) mit Überschrift, Wortlaut und „Ab jetzt bekommt jede Lesespur ein ANDERES Bündel" wörtlich aus ALT |
| V19 | übernommen | 7.5: die neue allgemeine Pflicht („zu jedem Befund außerdem fragen …") gestrichen; der Vorfall vom 13.09. bleibt als Beispiel, dass beide die Frage nach dem Live-Server nicht stellten |
| V20 | übernommen | 7.4: Ersetzung auf die ANZAHL beschränkt (Zusatz „Zweite Lesespur" vom 18.09. entfällt); „Astra kommt daneben" vom 10.09. gilt weiter, die Lesespur neben der Claude-Spur bleibt |
| V21 | übernommen | F2 bleibt OFFEN, jetzt als Frage: „Gilt Schritt 1 neben der Lesedelegation vom 30.09. fort, und gilt ‚jeden Befund selbst nachmessen‘ auch für Review-Bot und Gegenleser, oder nur ‚die tragenden‘?" (§6 Schritt 1); Legende (Kopf) entsprechend angepasst |
| V22 | übernommen | 6b und 7.1 „Nachmessen" verweisen auf diese eine Frage; „ersetzt ‚jeder Befund einzeln‘" in 7.1 gestrichen; zusätzlich 7.2 (Rundenbegrenzung): „JEDER Befund wird vom Haupt-Agenten selbst nachgemessen" wie in ALT, mit Verweis auf F2, und 8.2 auf dieselbe Frage umgestellt |
| V23 | übernommen | §13 und §12: beide Aussagen aus ALT zu C2 (Hook-Abschnitt: „separat gemessen"; SessionStart-Absatz: PreToolUse-Verdrahtung „weiter unten offen") mit dem Hinweis, dass ALT uneinheitlich ist. Nicht als OFFEN markiert (Vorgabe des Haupt-Agenten) |

Zusätzlich aus der eigenen Nachprüfung der `nicht_verlieren`-Liste (N5): in §12 steht wieder, dass `test -r` die falsche Frage beantwortet
(in beide Richtungen falsch). Die Zahl der OFFEN-Markierungen im Text stieg von 8 auf 11, weil 6b, 7.1 und 7.2 jetzt auf F2 verweisen;
es sind weiterhin vier Fragen (F1–F4).

## I. Bestätigung V1–V6, E1–E2, Zusatz (`bestaetigung.txt`, flash; alt gegen `neu-fassung2.md`)

Jede Fundstelle wurde vor der Umsetzung selbst nachgesehen (Quelle jeweils in der Spalte "Nachgesehen"). `neu-fassung2.md` blieb unverändert
(sha256 833a6074…ed70). Die Zeilenzahl stieg von 1052 auf 1072.

| Nr. | Entscheidung | Umsetzung in `neu.md` | Nachgesehen |
|---|---|---|---|
| V1 | übernommen | 7.8: neuer Punkt "Ebenfalls abgelehnt (11.09.2026)": Werkzeug-/MCP-Liste (Kubernetes, Sentry, Jira, Docker) und allgemeine Sicherheits-Checkliste, mit dem Grund aus ALT | `alt.md:865-868`; Datum aus der Überschrift "Drei Zusätze am Prompt (Betreiber-Entscheidung 11.09.2026)" |
| V2 | übernommen | §6 Schritt 4: geltende Form des Siebs (registrierte Seite OHNE Muster aus dem `TESTS=(…)`-Block, Log-Seite `grep -a -o '── [^ ]*\.\(js\|sh\) ──'`, beide durch `sed 's/^[[:space:]]*//' \| sort -u`, `diff` EXIT 0); der Messfall 337/338 bleibt als Begründung | `plaene/gymdocu-fallen.md:14` (nennt diese Form als die der CLAUDE.md); `alt.md:174-181` hat nur die `.js`-Form. Das GymDocu-`test/run.sh` war nicht erreichbar (`/workspace/gymdocu` fehlt), der `TESTS=(…)`-Block ist daher nur aus `gymdocu-fallen.md` übernommen, nicht gegen `test/run.sh` geprüft |
| V3 | übernommen | 7.1: "stehen in der Sache wörtlich, die Beweislage-Sätze sind auf `ASTRA-LAEUFE.md` verwiesen" | Vergleich `alt.md:357-358` mit 7.3 |
| V4 | übernommen | 18.1: Umsetzungsstand mit Datum (19.09.: `stream`, `metadata`, `max_tool_calls` fehlten; Stand 02.10.: `stream: true` und `metadata` gesetzt, `max_tool_calls` bewusst nicht, mit der Begründung aus dem Werkzeug); 7.1: Standard `VORGABE_MODELL` = `gpt-6.1-sol`, DeepSeek nur über `--modell=deepseek-…` | `tools/gegenleser-repo.js:299` (`VORGABE_MODELL`), `:855-862` (`stream`, `metadata`, Begründung zu `max_tool_calls`) in `anfragen()` (:817), `:1124` (Anbieterwahl), `:1134` (Standard), Selbsttest `:2692-2698` (`istDeepseekModell(VORGABE_MODELL) === false`) |
| V5 + E1 | übernommen | 7.8: der Satz "drei getrennte Zustände" gestrichen; stattdessen "Stand 02.10.2026": Freigabe 26.09., Werkzeug gebaut und gemergt (30.09.; `tools/ausfuehr-spur.js`, CI-Job `ausfuehr-spur`, `plaene/diffpruefung-w.md`), offen ist der Einführungstest (A/B gegen die Claude-Spur) | `tools/ausfuehr-spur.js:1-20`; `.github/workflows/ci.yml:67-75`; `git log`: Merge `090e642` (2026-09-30), Fix `7ff4816`; `plaene/diffpruefung-w.md:172`; `plaene/STAND.md:645` |
| V6 | übernommen, wie angewiesen nicht als Tatsache | §16: beide Aussagen nebeneinander (CLAUDE.md-Stand 18.09.: Listung; Takt-Prompt: seit 15.09. VERFÜGBAR), ausdrücklich "nicht nachgemessen" | `plaene/gymdocu-fallen.md:11` und `plaene/takt-prompt-archiv-2026-10-02.md:27` (der Takt-Prompt-Satz); nichts selbst ausprobiert |
| E2 | übernommen | 18 Kopf: "Angenommen heisst nicht wirksam" und die ALT-Formulierungen ("ein „OK" sagt dort also wirklich etwas"; bei Kimi/DeepSeek "sagt „wird angenommen" NICHTS über Wirkung"); Dreiteilung entfällt | `alt.md:874`, `:969`, `:995`, `:1120`; Kimi/DeepSeek `alt.md:609-617`, DeepSeek-Zusatz in 18.3 |
| Zusatz | übernommen | §10: Kreis Seil-Tagescheck/Beurteilungs-Nachtrag "stand" (15.09., damals nicht behoben), seit #469 (Deploy 436) GESCHLOSSEN, Reste in `plaene/offene-befunde-sperrordnung.md`; die Auflage "keine NEUE globale Lock-Klasse, solange ungelöst" nur noch als historisch ("galt, solange der Kreis offen war"); die Regel "vor jedem Zusammenziehen abzählen" bleibt unverändert | `plaene/STAND.md:96`, `:828`; `plaene/offene-befunde-sperrordnung.md`; `plaene/auftrag-verklemmung-studiolock.md` ("Die Regel": L als ERSTE Sperre, nur als Verweis genannt, nicht wiedergegeben). Dass es derselbe Kreis ist, folgt aus `STAND.md:96` ("der bekannte Verklemmungskreis"); im Auftrag selbst steht "Seil-Tagescheck" nicht |
| Archiv | kein Befund an `neu.md` | `archiv.md` wird beim Einspielen als `plaene/claude-md-archiv-2026-10-02.md` angelegt | Entscheidung des Haupt-Agenten |

Offene Zeilen der Bestätigung, die nicht Teil der Entscheidungen waren: Der Befund "Zahl der Spuren seit 20.09.2026: 7.4" (§7.2, Klammer) wurde nicht angefasst (bloßer
Verweis). Die Nebenbemerkung zur Zeilenzahl (1072 statt etwa 900) bleibt benannt.
