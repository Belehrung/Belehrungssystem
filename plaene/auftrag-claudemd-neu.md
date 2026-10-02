# Auftrag: CLAUDE.md neu fassen (02.10.2026)

Betreiber-Auftrag 02.10.2026: Die Regeldatei soll gestrafft werden, die Prüfung macht eine andere KI. Darauf folgte
„Ja starte“. Einordnung: nicht sehr komplex, also baut der Standard-Executer. Es ist viel Text, aber jede Stelle ist
redaktionell. Gegen einen Verlust schützt der Vergleich alt gegen neu am Ende.

## Ausgangslage

Arbeitsverzeichnis `/workspace/claudemd-neu/` (kein Git, nur Dateien). Darin liegen:

- `alt.md` (die heutige `CLAUDE.md`, 2556 Zeilen) und `alt-nummeriert.txt` (dieselbe Datei mit Zeilennummern);
- `befunde-sol.json` (49 Befunde: widerspruch, ersetzt, wirkungslos, veraltet; je Zeilen, Zitat, Problem, Vorschlag);
- `befunde-flash.json` (doppelt 16, verdichten 15, gliederung 17, nicht_verlieren 30).

Beide Befundlisten sind Hinweise, keine Tatsachen. Jede Zeilenangabe prüfst du an `alt-nummeriert.txt`, bevor du ihr
folgst.

## Was entsteht (nur in `/workspace/claudemd-neu/`; die echte `CLAUDE.md` NICHT anfassen)

1. **`neu.md`:** die neue Regeldatei, höchstens etwa 900 Zeilen.
2. **`archiv.md`:** eine WÖRTLICHE Kopie von `alt.md`, mit einem Kopf von wenigen Zeilen. Der Kopf sagt: „Fassung bis
   02.10.2026, Begründungen und Messgeschichten; gilt nicht mehr als Regel, die Regeln stehen in CLAUDE.md“. Sonst wird
   NICHTS daran geändert. Damit geht keine Messgeschichte verloren, und `neu.md` darf kürzen.
3. **`aenderungsliste.md`:** je Abschnitt von `alt.md` eine Zeile: wohin er gewandert ist, was gekürzt wurde, was
   zusammengelegt wurde, was als ersetzt markiert ist. Dazu jeder Befund aus beiden Listen mit „übernommen“, „nicht
   übernommen, weil …“ oder „Betreiber-Frage“.
4. **`pruefe-zitate.js`** und seine Ausgabe:
   - Das Skript zieht aus `alt.md` jedes wörtliche Betreiber-Zitat (Text in „…“ in einem Absatz, der „Betreiber“,
     „Vorgabe“ oder „Entscheidung“ enthält) und prüft, dass es in `neu.md` WÖRTLICH steht.
   - Ausgabe: gefunden, fehlt (mit Zeile in alt), Gesamtzahl. Erwartet: 0 fehlt.
   - Positivkontrolle: Das Skript läuft einmal gegen eine Kopie von `neu.md`, in der ein Zitat gelöscht ist. Es muss
     genau dieses Zitat als fehlend melden.
   - Beide Läufe wörtlich in den Bericht.

## Regeln für `neu.md`

- **Betreiber-Vorgaben bleiben wörtlich, mit Datum.** Keine wird gestrichen oder umformuliert. Ein Zitat darf in einen
  anderen Abschnitt wandern, aber sein Wortlaut bleibt.
- **Eine spätere Betreiber-Vorgabe ersetzt eine frühere zum selben Gegenstand.** In `neu.md` steht die GELTENDE Regel
  zuerst und vollständig. Die ersetzte Fassung steht nur noch als Verweis, z. B. „(ersetzt die Fassung vom 23.08.2026,
  s. Archiv)“. Beispiele aus den Befunden:
  - sol S2–S5 (30.09.: Lesen und Prüfen an externe Modelle, Kundschafter nur noch, wo die nicht können);
  - S10, S22 (Auslöser vom 12.09. und 18.09.);
  - S12 (27.09.: DeepSeek nur `deepseek-flash`, auch für „Variante 1“);
  - S13 (01.10.: `gpt-6.1-sol` statt `gpt-6-sol`);
  - S21 (13.09.: eine Runde);
  - S24 (20.09.: Spurenzahl).

  Prüfe jeden dieser Fälle selbst an den Zeilen.
- **„Astra“ wird als ROLLE geführt, nicht als Modell.** Der Abschnitt heisst etwa „Unabhängige Prüfspuren (früher:
  Astra)“. Die Regeln vom 10.09., 11.09. und 12.09. bleiben wörtlich. Darunter steht, wie die Rolle HEUTE besetzt ist,
  nach den späteren Vorgaben:
  - Lesespur für Code: `deepseek-flash` (27.09.);
  - Nicht-Code (Recht, Doku, Recherche mit Websuche): `gpt-6.1-sol` (23.09. und 01.10.);
  - Kimi als weitere Lesespur (20.09., 30.09.);
  - Bauen nur über den Executer.
- **Stand-Aussagen, die die Datei selbst später überholt** (sol S14, S15, S17, S27, S28, S30, S39, S47): In `neu.md`
  steht nur der spätere Stand. Neue Messungen behauptest du NICHT; steht in `alt.md` kein späterer Stand, bleibt die
  Aussage mit ihrem Datum stehen.
- **Messgeschichten werden verdichtet.** Je Regel bleiben die Regel selbst, ein Satz Begründung („wo eine Begründung
  dabeisteht, ist sie kurz und dient dazu, die Regel im Zweifel richtig auszulegen“, Kopf von `alt.md`) und der Verweis
  „Archiv, Abschnitt „…““.
  - Zahlen, Befehle, Pfade, Schwellen und Fundstellen, die man zum ANWENDEN der Regel braucht, bleiben vollständig, z. B.:
    - der Suite-Aufruf mit `echo "SUITE_EXIT=$?"`;
    - die Sperrdatei;
    - die Muster des Dateizahl-Rituals;
    - die `--exclude-dir`-Fassung des Marker-Scans;
    - das curl-Aufrufmuster mit Konfigdatei;
    - die Zielkonfiguration;
    - die Eingabegrenze ~400k und 3,71 Byte/Token;
    - 300 s Proxy-Grenze → `stream: true`;
    - die Endpunkt-Eigenheiten von DeepSeek und Kimi;
    - `get_check_runs` statt `get_status`;
    - das ZIP-Log;
    - die Schlusszeile `-- Ende der Botschaft --`;
    - die Hook-Grenzen;
    - der PostgreSQL-Start.
  - Die 30 Einträge `nicht_verlieren` aus `befunde-flash.json` sind eine Mindestliste, keine vollständige.
- **Doppeltes einmal führen** (flash „doppelt“), an der Stelle, an der die Regel angewandt wird. Andere Stellen
  verweisen höchstens.
- **Sachfehler in `alt.md` werden in `neu.md` nicht übernommen.** Das Archiv bleibt wörtlich.
  - sol S16: 9 ≠ 7 + 3. Nenne die Zahlen nicht oder kennzeichne sie als uneinheitlich.
  - S42: Im Beispiel fallen bis und gesamt beide auf 40. Nimm Werte, bei denen alle vier verschieden sind, z. B. 11
    bis 30 auf 40 Zeilen → von 11, bis 30, gesamt 40, Ausschnitt 20.
  - S41: Die Überschrift sagt „gemessen“, der Text sagt „nicht gemessen“.
  - S46: Pauschalsatz gegen `unref()`.
  - S49: Die Abstandsregel fehlt im Abschnitt.
- **Betreiber-Fragen werden markiert, nicht entschieden.** Zwei Stellen, bei denen sich Vorgaben widersprechen und
  keine spätere die frühere ausdrücklich ersetzt:
  - (F1) sol S1: „Der Haupt-Agent baut selbst nichts … (Code, Dateien, Migrationen, Dokumente)“ gegen die
    Bagatellgrenze im Kostenabschnitt;
  - (F2) sol S3: Prüf-Ritual Schritt 1 „Diff vollständig lesen“ gegen die Vorgabe vom 30.09. (Lesen und Prüfen an
    externe Modelle, selbst nur die tragenden Befunde).

  Beide bleiben in `neu.md` mit beiden Fassungen stehen, markiert mit „OFFEN — Betreiber-Frage 02.10.2026“. Findest
  du weitere Stellen dieser Art, markierst du sie genauso und nennst sie im Bericht. Entscheide keine selbst.
- **Gliederung:** `befunde-flash.json` → `gliederung` ist ein Vorschlag. Vorn stehen die Betreiber-Vorgaben, die
  Arbeitsweise und das Prüf-Ritual, also das, was jede Antwort braucht. Hinten stehen Nachschlageteile (Schnittstellen,
  Umgebung, Fallen). Jede Überschrift ist eindeutig.
- **Der Kopf** behält die beiden Sätze aus `alt.md` (nur Anweisungen; Begründung kurz und zur Auslegung). Dazu kommt
  ein Satz: Messgeschichten stehen in `plaene/claude-md-archiv-2026-10-02.md`.
- Keine Modellnamen-Werbung, keine neuen Regeln. Was nicht in `alt.md` steht, kommt nicht in `neu.md`.

## Bericht (kurz)

- Zeilenzahl `neu.md`.
- `pruefe-zitate.js`: beide Läufe wörtlich.
- Die Liste der OFFEN-Markierungen.
- Die Befunde, die du NICHT übernommen hast, je mit einem Satz Grund.
- Was du an den Zeilenangaben der Befundlisten falsch gefunden hast.

-- Ende des Auftrags --
