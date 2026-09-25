# STAND — Übergabepunkt

Stand: 23.09.2026, 09:45 UTC.

## Was gerade LÄUFT

Stand 24.09.2026, 07:20 UTC.

* **Pentest P1 gemergt** (#470, Squash `221a7b2`, CI 4/4 grün auf `7e2f8dd`, kein Bot-Kommentar). **Deploy 437
  ZWEIMAL gescheitert** (22:27 und 22:33 UTC), beide Male schon beim SSH-Handshake: `ssh: handshake failed: read:
  connection reset by peer` — vor jedem Schritt auf dem Server. Live-Betrieb läuft (live-check 22:35 grün, 2× ℹ),
  also mit dem ALTEN Stand `4312eaf`. Letzter erfolgreicher Deploy 436 um 16:07 UTC. Ursache liegt am Server
  (sshd/Firewall/fail2ban), von hier nicht erreichbar → Betreiber gefragt. Nicht weiter neu anstossen, bis er
  Bescheid gibt (weitere Versuche können eine Sperre verlängern). Sammelliste `plaene/offene-befunde-pentest-p1.md` für die Extrarunde. **P2** ist
  eigener Beitrag.
* **24.09.2026 ~10:00 UTC — SSH-Ursache gefunden** (Betreiber-Ausgabe): sshd lief, aber im Log
  `exited MaxStartups throttling after 00:25:13, 296 connections dropped` — Dauer-Brute-Force (fail2ban: 177 gesperrt,
  9630 Fehlversuche) füllt die Pre-Auth-Plätze, neue Verbindungen (auch der Deploy) werden verworfen. Dazu: root-Login
  mit PASSWORT ist erlaubt (`Accepted password for root`) — pentest-relevant. Deploy 438 von Hand: **success**,
  P1 ausgeliefert, live-check grün (2× ℹ). **#471 gemergt** (`d191323`), Deploy 439 success, live-check grün. **#472 gemergt** (`1950c29`), Deploy 440 success, live-check grün. nginx: kein `error_page`/`proxy_intercept_errors`
  → P2 nicht blockiert. Entscheidungen V01-1, V09-1, V15-2 gefallen (Sammelliste).
  SSH-Härtung vom Betreiber eingespielt (24.09.2026, `sshd -T`): passwordauthentication no, permitrootlogin
  without-password, maxstartups 30:30:200, logingracetime 20. Anmeldung per Schlüssel (Termius).
  Offen: Deploy-Schritt mit Wiederholung bei SSH-Abbruch (eigener kleiner Beitrag).
* **Nachweis-unlink**: PR #471 (Kopf `ff7026a`), CI 4/4 grün, kein Bot-Kommentar. **Merge ZURÜCKGEHALTEN** — ein Merge
  stösst den Deploy an, der am SSH-Problem scheitert (s. P1). Sammelliste `plaene/offene-befunde-unlink.md`.
* **H2 Cookie-Schleife**: PR #472 (Kopf `6d537a5`), CI 4/4 grün (E2E mit neuem Fall), kein Bot-Kommentar. Zwei
  Prüfrunden: Runde 1 zwei blockierende Befunde (offene Weiterleitung über `/\`, Marker ohne neues Cookie → Tablet nach
  5 min abgemeldet), beide behoben und gegengeprobt; Runde 2 nichts Blockierendes. Merge ebenfalls zurückgehalten.
  Sammelliste `plaene/offene-befunde-h2.md`. Nach dem Merge: `test/run.sh`-Konflikt mit #471 möglich (beide
  registrieren Tests).
* **DeepSeek-Vollprüfung ABGESCHLOSSEN**: 27 von 27 Bereichen ausgewertet (`plaene/vollpruefung-befunde.md`,
  Sammelliste `plaene/offene-befunde-vollpruefung.md`). 188 Befunde, 179 getragen, 9 gefallen (die meisten
  gefallenen an JS-/PostgreSQL-Semantik). 4 als blockierend gemeldet: 2 gemessen widerlegt (V02-1, V10-1), 2 getragen
  und auf mittel herabgestuft (V01-1, V09-1). Grösster echter Fund V25-1 (Tests löschen im PDF-Archiv) → T1.
  Kosten GEMESSEN: Guthaben 39,84 → 20,02 $ für alle DeepSeek-Läufe seit Beginn (≈ 34 Läufe, ≈ 0,6 $ je Lauf; die
  Werkzeugschätzung liegt rund 9× zu hoch). Vor dem Pentest vorzuziehen: V03-6 (Array-Body auf `/tablet/sperre` →
  500), V10-2 (Signatur aus einem Pixel). Entscheidungen für den Betreiber: V01-1 (S20-REPLACE), V09-1
  (QR-Journal fail-closed?), V15-2 (Gültigkeitsregel Belehrungsübersicht).
* **Umgebung, gemessen 23.09. abends:** der Container wird im LEERLAUF abgeräumt (Neustarts 22:1x, 22:40, 23:40,
  jeweils kurz nach Ende eines Zuges). Hintergrundprozesse sterben dabei; ein laufender Agent hält die Sitzung
  wach, ein Hintergrund-`node` nicht. Lange Gegenlesungen deshalb im Vordergrund abwarten (`timeout 570 bash -c
  "until …"`, Werkzeug-Zeitlimit 600000) oder während ein Agent läuft.
* **T1 (Test-PDF-Aufräumen)**: Riegel `test/helfer/datei-sperre.js` gebaut (`4a5d9e3`, Zweig
  `fix-t1-test-pdf-aufraeumen`). Vorbedingungsmessung: 24 statt 8 Dateien rot — 23 aus einer Ursache
  (`run.sh` leitet `EINWEISUNG_NACHWEIS_DIR` u. a. nicht um, `routes/belehrungen.js:1121` legt beim require an);
  sechs der sieben benannten Dateien schlucken den Wurf. Kimi-Planprüfung Fassung 2: 10 Befunde, 8 getragen.
  Nacharbeit 1 läuft (alle Datenwurzeln umleiten, Verstösse am Prozessende rot, ganze Repo-Wurzel schützen).
  Ohne eigene dritte Planprüfung, weil die Nacharbeit genau die Befunde der gerade gelaufenen Planprüfung umsetzt; die
  Diffprüfung wird die Tauschrunde (Kimi statt DeepSeek) für die Routing-Messung.
* **P3 (Pentest-Vorzug V03-6, Formularfelder mit falschem Typ)**: Papier `plaene/auftrag-p3-eingabetypen.md`
  Fassung 2, Planprüfung als Tauschrunde (gleiches Bündel für DeepSeek und Kimi, `plaene/planpruefung-p3.md`):
  14 Befunde, 13 getragen; wichtigster: nur 29 statt 68 Stellen werfen (38 sind in `String()` gehüllt). Bau läuft
  in `/workspace/gymdocu-p3` (Zweig `fix-p3-eingabetypen`).
* **P4 (V10-2, Unterschrift)**: Betreiber-Entscheidung 24.09.2026 „einzelne Punkte oder Striche ablehnen“.
  Papier `plaene/auftrag-p4-unterschrift.md`: alle SIEBEN Unterschriftsfelder (sechs davon heute serverseitig
  ungeprüft), eine gemeinsame Regel für Browser und Server, Schwelle gemessen. Planprüfung läuft (Tauschrunde).
  Bau nach P3.
* **Stand 24.09.2026 11:45 UTC:** T1 Nacharbeit 2 (`9c74d38`, alle 8 Diffprüfungs-Befunde behoben) — eigene Suite läuft,
  danach PR. P3 Nacharbeit 1 läuft (neun Routen mit eigenem catch, berechnete Zugriffe, /einstellungen).
  SSH: Betreiber hatte sich ausgesperrt (Schlüssel war nie übertragen), über KVM-Konsole zurück, Schlüssel jetzt
  eingetragen und getestet; Härtung wieder aktiv (`sshd -T`: passwordauthentication no, permitrootlogin without-password). **T1 gemergt** (#473, `34a83fa`), Deploy 441 success (erster Deploy nach der SSH-Härtung — Schlüsselweg trägt), live-check grün.
* **Routing-Messung**: Schwelle erreicht (17 Runden), Empfehlung steht in `plaene/routing-messung.md` (Paarungen
  beibehalten; Kimi mit Repo-Zugriff wäre der nächste Hebel).
* **Stand 24.09.2026 14:30 UTC:** **P3 gemergt** (#474, `946647a`), Deploy 442 success, live-check grün (2 ℹ wie
  immer). Review-Bot hat an #473 und #474 NICHT kommentiert (0 Kommentare, 0 Reviews) — beobachten.
  P4: Messung abgeschlossen (Phase 1c `f917c1d`, kein STOPP, E3-Raster behoben); Phase-2-Auftrag im Papier;
  Planprüfung (DeepSeek mit Repo + Kimi mit Bündel) läuft.
* **Stand 24.09.2026 15:45 UTC:** P4 Regel in drei Runden nachgeschärft (Nachträge 4a–4c im Papier). Jede neue Figurenmenge fand
  einen Rand bei Figuren von nur wenigen Strichdicken → Entscheidung 4c: Grund `zu_klein` („Bitte grösser unterschreiben“),
  danach wird die Regel eingefroren, Kalibrierung im Betrieb. Phase 1f + Phase 2 laufen in `/workspace/gymdocu-p4`.
* **Stand 24.09.2026 16:45 UTC — Betreiber: „alle aufgaben lösen die noch offen sind“** (Guthaben 250 $ für
  Cloud-Sitzungen läuft). Reihenfolge in `plaene/arbeitsplan-offen.md`. Laufend: P4-Bau; Planprüfungen P2
  (`plaene/auftrag-p2-fehlerstatus.md`, Baum `/workspace/gymdocu-p2`) und C1 (`plaene/auftrag-c1-entschiedene.md`,
  Baum `/workspace/gymdocu-c1`).
* **Stand 24.09.2026 21:25 UTC:** **P4 ausgeliefert**: #475 gemergt (`a36f5ab`, CI 4/4 grün nach einer E2E-Korrektur — der Test schickte Datenmüll als Unterschrift), Deploy 443 `success` auf `a36f5ab`, live-check EXIT 0 (2 ℹ wie immer: Zertifikat, Health). Betreiber-Entscheidung „ja beides“: QR-Sperre auch bei Block ohne eigene Journalspur (in die C1-Nacharbeit) + Reparaturweg QR-J (Papier, Planprüfung läuft). Kalibrierzeilen `[unterschrift-masse]` ab jetzt auf dem Server — Auswertung nach vier Wochen (PP4b-20); Altgeräte-Ausnahme endet 15.10.2026.
* **Stand 24.09.2026 20:45 UTC:** P4: ausführende Prüfspur R2 (10 Befunde) → Nacharbeit 4 läuft. P2: gebaut, Suite 374/374; Diffprüfung: DeepSeek fertig (6), Claude-Spur läuft. C1: gebaut, Suite 374/374; Diffprüfung mit drei Spuren (17 Befunde, einer blockierend: QR-Sperre prüfte den falschen Block, von allen drei Spuren gefunden) → Nacharbeit 1 läuft; **offene Betreiber-Frage C1-S1** (QR-Sperre auch für aktiven Block ohne eigene Journalspur). T2: Bau läuft (Frist 11.10.). Baureif: H1a, C2 (jetzt 11 Punkte), C3a.
* **Stand 24.09.2026 19:40 UTC:** P4: Nacharbeit 1–3 fertig (Suite 376/376 grün je Runde), Diffprüfung R2 (DeepSeek) ausgewertet, ausführende Claude-Prüfspur läuft; danach PR. P2: gebaut (265 Stellen, Wächter + Verhaltensproben), zweiter Suite-Lauf läuft noch. C1: Bau läuft. Baureif mit Planprüfung: H1a (16), C2 (14), C3a (20), T2 (21, **Frist 11.10.2026** wegen Zeitumstellungs-Fixtures). C3b: Messpapier. Werkzeug: Scratch-`frage.js` endete bei abgerissenem Strom mit EXIT 0 ohne Ergebnis — behoben.
* **Stand 24.09.2026 18:45 UTC:** Container-Neustart gegen 17:40 überstanden (Marker-Scan überall 0, Kimi-Läufe neu).
  P4: Diffprüfung R1 durch (8 Befunde, `plaene/diffpruefung-p4.md`), Nacharbeit 2 läuft (Feldtyp an der Routengrenze,
  P3-Wächter-Sollzahl). P2 und C1: Bau läuft (`/workspace/gymdocu-p2`, `/workspace/gymdocu-c1`). H1a: Papier
  `plaene/auftrag-h1a-csp-enforce.md`, Planprüfung läuft (Baum `/workspace/gymdocu-h1`).
* Danach: DeepSeek-Vollprüfung, H2, H1, SECURITY-HEADER, IT-PDFs.

### Vorgeschichte des Tages (gekürzt)

  * **Pentest P1** (`/workspace/gymdocu-p1`, `fix-pentest-p1-idwache`, `ad5d609`, gepusht, Baum
    sauber). Laut Protokoll: Suite 362 = 362, Lint gelaufen, Abschlussbericht fehlt. Offen: Diff
    lesen, Diffprüfung; dazu mein Befund: `test_feature_pentest_p1_struktur.js:256/:281` tragen
    den Marker-Text im committeten Quelltext, muss umbenannt werden.
  * **Nachweis-unlink** (`fix-nachweis-unlink`, `974816d`, gepusht, Baum sauber). Runde 3
    festgehalten (`plaene/diffpruefung-unlink.md`, 8/8 getragen). Nacharbeit 7 ausformuliert,
    aber vor dem Abbruch nichts gebaut. Der Auftragstext steht als Nachricht im Sitzungsverlauf;
    Kern: A1–A4, P1–P4 aus Runde 3.

* **Sperrordnung ausgeliefert** (#469, Deploy 436 `success` für `4312eaf`, live-check grün mit 2× ℹ). Der bekannte Verklemmungskreis ist geschlossen; Sammelliste `plaene/offene-befunde-sperrordnung.md` bleibt für die Extrarunde.

* **Laufend:** Sperrordnung Nacharbeit 2 + master-Merge (R2-1…R2-8, klein); unlink Nacharbeit 6 (R2-1 Wiederholungsweg storage-replica u. a.); Pentest P1 Bau nach Fassung 3 (`/workspace/gymdocu-p1`, Zweig `fix-pentest-p1-idwache`).

* **S6 ausgeliefert** (#468, Deploy 435 `success` für `753b833`, live-check grün mit 2× ℹ wie immer; Health-Gate im Deploy = Migration 0059 durch).

* **Betreiber-Entscheidung:** Code-Prüfungen und Logikfehlersuche über `deepseek-v4-pro`
  (CLAUDE.md). DeepSeek-Weg in `tools/gegenleser-repo.js` gemergt (`9209499`, Selbsttest 129/0);
  Nacharbeit B1–B11 läuft (Executer, `/workspace/belehrung-ds`, Zweig `ds-lesewerkzeug2`).
  Gemessen: Pro wird NICHT auf Flash umgeleitet; Denkstufe je Endpunkt verschieden; `store:false`
  bei DeepSeek über die API nicht messbar.
* **Nachweis-unlink** (`fix-nachweis-unlink`, `e262f47`, master gemergt): N4/N5 gelesen, Suite
  354 = 354. DeepSeek Runde 2 läuft.
* **Pentest P1**: Fassung 2 (`plaene/auftrag-pentest-p1-p2.md`), Planprüfung Runde 2 läuft
  (DeepSeek mit Repo, Kimi mit Bündel). P2 wird eigener Beitrag.
* **DeepSeek-Vollprüfung** (Betreiber-Wunsch): Plan `plaene/deepseek-vollpruefung.md`, 25 Bereiche
  geschnitten; Start nach den laufenden Prüfungen.
* **H2**: Bau nach dem unlink-Merge. **H1** (CSP) danach.

**#465 ausgeliefert:** Deploy 433 `success` für `e2a9e9e`, live-check grün
(2× ℹ wie immer).

**Betreiber-Entscheidung 23.09.2026:** Gegenleser-Vorgabe ist ab jetzt
`gpt-6-sol` (umgesetzt, `a49c03e`).

**Danach in der Extrarunde:** der Verklemmungskreis in `routes/module.js`
(eigener Beitrag), dann die übrigen Punkte unter „Offen, nach dem Beitrag".

## Wo der Beitrag steht

**Vierte Runde: committet, gepusht, CI grün** (`3a7cad5`, alle vier Checks).

**Fünfte Runde: gebaut, geprüft, NICHT committet** — und die Diffprüfung hat
ihren Kern gekippt.

Gemessen an Runde 5: volle Suite `SUITE_EXIT=0`, 26 PASS / 0 FAIL, Lint
EXIT 0. Der Executer hat dabei ZWEI Fehler in meinem Auftragspapier gefunden
und widersprochen statt sie zu übernehmen — beide nachgemessen, beide seine.

**Dann kippte die Diffprüfung den Kern.** Ich hatte den zeichenweisen
Kommentar-Reiniger selbst gebaut, gegen acht Anforderungen gemessen und
wörtlich vorgegeben. Gemessen ist er BLIND: ein Regex mit einem
Anführungszeichen kippt den Zeichenketten-Zustand, danach verschluckt ein
`/*` in einer echten Zeichenkette echten Code.

| | Länge | `pool.query(` | Riegel |
|---|---|---|---|
| mein Automat | 187 → **56** | weg | **schlägt nicht an** |
| `maskiereKommentare` | 187 → 187 | da | schlägt an |

**Zwei Lehren, beide über die eigene Arbeitsweise:**
1. Meine acht Prüffälle enthielten keinen mit Anführungszeichen im Regex —
   ich habe die Klasse gemessen, die ich mir vorgestellt hatte.
2. **Ich habe nicht gefragt, ob es das schon gibt.** `maskiereKommentare`
   liegt in `test/rohwert-scan.js` und wird von 43 Dateien benutzt
   (45 war meine Zahl aus `grep -rln`, die Prosa-Erwähnungen mitzählt). Mein
   Kommentar behauptete, so ein Apparat sei „mehr, als der Riegel wert ist" —
   eine falsche Tatsachenbehauptung, die einen Vorschlag ausschloss.

Runde 6 löscht den Automaten ersatzlos, setzt den Hausstandard ein und zieht
neun weitere getragene Befunde nach (u. a.: der Riegel fängt bisher nur eine
von vier Schreibweisen; das Prüf-Fenster der Sperr-Zusicherung greift 136
Zeichen zu weit; eine CASCADE-Behauptung in einem Kommentar ist falsch).

## Stand 23.09.2026 — Runde 6 gebaut, Diffprüfung ausgewertet

`5735eac` ist committet und gepusht, volle Suite `SUITE_EXIT=0`, 29 PASS /
0 FAIL, Dateizahl 350 = 350, `npm run lint` EXIT 0.

**Diffprüfung Runde 6, ausführende Spur: 14 Befunde — alle 14 tragen nach
eigener Nachmessung**, davon drei LATENT und einer geringfügig. Die Befunde
samt Messwerten stehen in `plaene/diffpruefung-ladebestand-runde6.md`.

Die vier schwersten, jeder mit eigener Gegenprobe belegt:

* **A1** — die in Runde 6 NEU eingeführte Längenzusicherung ist eine
  TAUTOLOGIE. Unter einer längenerhaltenden Mutation, die jedes `req.studioId`
  aus dem bewachten Abschnitt frisst, lief die Datei mit **TEST_EXIT=0,
  29 PASS / 0 FAIL** durch. `nichtLeerraum()` fiel 2291 → 2195 und hätte
  gefangen.
* **A9** — der finally-Block verschluckt Aufräumfehler. Gemessen: ein
  gescheiterter DELETE reisst über die FK-Kette alle drei mit, „Feuerlöscher 8"
  bleibt in der Wegwerf-DB liegen, Lauf meldet **29 PASS / 0 FAIL, EXIT 0**.
* **A5** — `pool["run"](…)` und `pool["one"](…)` laufen durch den Riegel.
* **A11** — meine eigene Begründung dafür, den zweiten Reiniger stehen zu
  lassen, ist nachgemessen FALSCH: alle vier Z3-Zählungen sind über beide
  Reiniger identisch (9:9, 4:4, 8:8, 2:2).

**A6 zum dritten Mal:** die Zeilennummern des Fremdschreibers sind wieder
falsch (`:6605`/`:6714` statt `6614`/`6723`). Runde 7 ersetzt sie durch ein
SUCHMUSTER statt sie ein viertes Mal fortzuschreiben.

**CI auf `5735eac` ist GRÜN** (Lauf 35805916805, 23.09.2026 01:29 UTC): alle
vier Checks `success` — Lint & Syntax, Browser E2E, Dependency audit,
Isolation tests. Am PR hängen nur meine EIGENEN Kommentare vom 20.09.
(Kollations-Untersuchung), keine offenen Bot-Befunde.

**Bauauftrag Runde 7:** `plaene/auftrag-ladebestand-runde7.md`, zehn Punkte,
zwölf Gegenproben, verbindliche Baureihenfolge. Er fasst am Produktivcode NUR
einen Kommentar an.

**Planprüfung durch — ZWEI Lesespuren mit verschiedenen Bündeln, 15 Befunde,
14 getragen, Überschneidung 1 von 15.** Einzelheiten samt eigener Nachmessung
in `plaene/planpruefung-ladebestand-runde7.md`, Zahlen in `ASTRA-LAEUFE.md`.

**Sechs der zehn Befunde von Spur A trafen Fehler in MEINEM Auftragspapier**,
nicht im Bestand — darunter zwei, die eine Bau-Runde gekostet hätten:
die Zusicherungs-Reihenfolge (zwei Gegenproben hätten ihren Beweis verloren)
und ein `ReferenceError` zur LAUFZEIT durch Blockgrenzen, den `node --check`
nicht sieht.

**Der wichtigste Befund kam von Spur B und kippt A1 zur Hälfte.** Sie hatte als
einzige die Geschwisterwächter im Bündel; der tragende Hinweis stand in einem
KOMMENTAR des Vorbilds („die Fenster-/Klammer-Arithmetik unten setzt das
voraus"). Nachgemessen erzeugt Punkt 7 genau diese Arithmetik — Versatzwerte
aus dem ROHEN Quelltext werden in den MASKIERTEN geschnitten, die
Bereichsmarken stehen selbst in Kommentaren, der Schnitt trifft
ausschliesslich wegen gleicher Längen (459.772 = 459.772). Die
Längengleichheit BLEIBT deshalb — als Vertragsprüfung über den Helfer, mit
ehrlicher Meldung — und `nichtLeerraum` kommt daneben.

**Stand 23.09.2026 03:50 UTC: Runde 7 ist GEBAUT und GEPRÜFT — und NICHT
mergefähig.**

Gebaut (`dc799f3`) plus meine Nachbesserung (`4fc9bed`). Eigene Messungen:
volle Suite `SUITE_EXIT=0`, alle FAIL-Zahlen 0, Dateizahl **350 = 350**
`diff` EXIT 0, `npm run lint` EXIT 0 ohne Ausgabe. CI auf `4fc9bed` grün.

**Trotzdem kein Merge: die Diffprüfung hat ZWÖLF Befunde geliefert, alle
zwölf tragen, DREI davon sind Regressionen des Beitrags selbst.** Der
Beitrag, der Zusicherungen schärfen sollte, hat drei davon stumpf gemacht.
Einzelheiten samt Messwerten in `plaene/diffpruefung-ladebestand-runde7.md`.

* **R1** — Punkt 7 („ganze Datei maskieren, dann schneiden") hat den
  C7-Wächter BLIND gemacht. Die Bereichsmarke steht in einem Kommentar; auf
  dem alten Weg überlebte sie einen falschen Schnitt und der Wächter wurde
  rot, jetzt ist sie überall ausgeleert. Gemessen: alter Weg `true`, neuer
  Weg `false`.
* **R2** — dieselbe Umstellung hat die Längenzusicherung zur
  **slice-Tautologie** gemacht. Gemessen mit einem Masker, der 50 Zeichen
  verliert: die Zusicherung merkt es NICHT, die von mir VERWORFENE Form hätte
  es gemerkt. **Das widerlegt meine eigene Begründung im Auftragspapier** —
  auf der ganzen Datei vergleicht sie zwei unabhängig erzeugte Zeichenketten
  und KANN fallen, auf dem Slice kann sie es NIE. Die Lesespur hatte recht.
* **R3** — die neue Forderung nach einer aufrufenden Klammer kostet die
  Referenz-Form: `const f = pool["query"]` war alt gefangen, ist neu durch.

Dazu ein eigener Befund beim Diff-Lesen, den keine Prüfspur hatte: die
A2-Positivkontrolle bewachte ihr eigenes Prädikat nicht (von Hand kopierte
zweite Fassung). Behoben in `4fc9bed` — und die ERSTE Behebung trug nicht,
weil eine gemeinsame Fixtur bei einer Alternation `A|B` schon mit A grün
bleibt; erst je eine Fixtur pro Form fällt gemessen.

**Stand 23.09.2026 06:50 UTC: Beitrag „ladebestand" ist GEMERGT**
(#465, Squash `e2a9e9e`). Letzter Stand `43449e4`: Suite `SUITE_EXIT=0`,
350 = 350, Lint EXIT 0, CI grün; Diffprüfung R9 mit zwei Spuren, keine
Regression. Deploy-Kontrolle läuft. Alle offenen Punkte (21) stehen in
`plaene/offene-befunde-ladebestand.md` und kommen in eine Extrarunde.

**Betreiber-Entscheidung 23.09.2026, morgens:** Runde 9 wird gemergt, wenn
die Prüfung nur noch Kleinigkeiten findet — ABER alle dann noch offenen Punkte
kommen in eine eigene Extrarunde. Wörtlich: „Ich möchte ein fehlerfreies
System haben." Sammelliste: `plaene/offene-befunde-ladebestand.md` (sechs
Punkte bisher, der wichtigste ist die strukturelle Lösung C11). Regel
allgemein in CLAUDE.md, „Eine benannte Grenze ist kein Endzustand".

## Was ausdrücklich NICHT gebaut wird

* **Die WHERE-Form statt der CTE** (C5 der vierten Runde). Er TRÄGT — gegen
  PostgreSQL 16 gemessen, gleiche Fallmatrix, gleiches Ergebnis im
  Nebenläufigkeitsfall, ohne Sperre. Abgelehnt, weil er den CASE-Ausdruck
  zweimal hinschreibt. Stattdessen bekam `FOR UPDATE` eine statische
  Zusicherung. Volle Abwägung im Auftragspapier.
* **Den Schleifenrumpf in eine Funktion ohne `db` im Gültigkeitsbereich
  ziehen** (C11 der vierten Runde). Richtig und ein Umbau weit über diesen
  Beitrag hinaus. Datierter offener Punkt — und er hätte C1, C2, C3 und K1
  ersatzlos erledigt.

## Betreiber-Entscheidung 23.09.2026 (mittags)

Acronis-Wiederherstellung VERSCHOBEN. Erst alle anderen offenen Punkte fertig, danach
PDF-Unterlagen für eine IT-Abteilung (Anforderungen: `plaene/it-dokumentation-auftrag.md`).
Reihenfolge: Extrarunde ladebestand → Verklemmungskreis → S6 → Pentest-Liste (U-…) →
CSP scharf (H1) → Cookie-Schleife (H2) → Doku SECURITY-HEADER → PDFs.
Ohne Priorität: Landingpage-Analyse (`plaene/landingpage-analyse-23-09-2026.md`).
Beim Betreiber offen: SSH nur Schlüssel (`sshd -T`), 48 Updates, HSTS-Preload (H3).

## Offen, nach dem Beitrag

0. `ops/SECURITY-HEADER.md` (GymDocu) um `server_tokens off` und `http2` ergänzen —
   am Server umgesetzt 23.09.2026, `plaene/nginx-haertung-23-09-2026.md`. Kleiner Doku-Beitrag.
1. **S6** — Aktenlage in `plaene/auftrag-s6-token-einloesen.md`, Empfehlung
   Generationszähler. Noch KEIN Bauauftrag.
2. **Mehr-Anbieter-Lesewerkzeuge für `tools/gegenleser-repo.js`** — vom
   Betreiber gewollt („könnte kimi und deepseak auch direkt nachsehen?"),
   ausdrücklich NACH den laufenden Beiträgen.
3. **Pentest-Vorbereitung:** U-IDW1, U-TOK1, U-LOCK1/U-AUDT1, U-VORL1,
   U-STAT1/U-STAT2.

## Zwei Dinge, die im Takt-Prompt veraltet sind

* Sein Sollwert für den Marker-Scan im **Belehrungssystem-Repo („2")** stimmt
  nicht mehr und kann es nicht: der Scan zählt dort mit, wie oft wir über ihn
  SCHREIBEN. Maßgeblich ist die Bedingung aus CLAUDE.md — jeder Treffer ist
  Prosa, keiner steht in ausführbarem Code.
* Sein Dateizahl-Muster filtert die REGISTRIERTE Seite auf `test_…` und misst
  damit die Namenskonvention mit. Besser ist, die `TESTS=(…)`-Liste direkt aus
  `test/run.sh` zu schneiden — dann gibt es auf dieser Seite gar kein Muster.

## Was gemessen und KEIN Defekt ist

`Studio-Wächter: NICHT GEPRÜFT (Messung fehlgeschlagen)` in der Schlusszeile
der Suite: die Entwicklungs-DB `gymdocu` existiert in diesem Container nicht
(nachgemessen: `database "gymdocu" does not exist`). Der Wächter fällt korrekt
„nicht geprüft" aus statt falsch grün. Nicht neu untersuchen.

Stand 24.09.2026 21:40 UTC: QR-J Planprüfung (DeepSeek 10, Kimi 8 Befunde, keiner gefallen) → Fassung 2. Drei
blockierende Lücken im Papier (keine Obergrenze beim Korrigieren, Verwerfen ohne tragfähigen Beleg, Präfix-Zuordnung)
und ein BESTEHENDER Fehler, selbst gemessen: eine abgebrochene Schreibung verschluckt die nächste echte Charge
(Wegwerf-Journal: `hoechste` 199 statt 399). Dazu: die Sperre greift künftig bei JEDER unerledigten kaputten Zeile des
Studios (Kimi: lesbare Spur + spätere kaputte Zeile war fail-open), und kein Fehlertext rät mehr zum Entfernen der
Datei. Bau nach dem C1-Merge.

Stand 25.09.2026 00:10 UTC: P2 Runde 2 durch (16 Befunde + 2 eigene, keiner widerlegt; zwei blockierend: neuer
JSON-Code legt die Offline-Warteschlange lahm, P4-Test erwartet alten Status) → Nacharbeit 2 an denselben Executer,
danach Runde 3 (ausführende Spur). T2 gebaut, Diffprüfung läuft (DeepSeek + ausführende Spur), Schluss-Suite in der
Warteschlange. C1-Nacharbeit wartet auf ihren Suite-Lauf. QR-J Fassung 2 fertig, Bau nach C1-Merge.

Stand 25.09.2026 01:10 UTC: T2 Diffprüfung durch → Nacharbeit 1 an denselben Executer. Wichtigster Fund, vorbestehend
und selbst nachgemessen: `ops/syntax-check.sh` (CI + Deploy-Gate) prüft je 50er-Stapel nur die ERSTE Datei
(`node --check a b` prüft nur a) — seit Commit `cab4d5c` (12.09.2026) nur ≈13 von 646 Dateien. C1 Runde 2: DeepSeek ohne blockierenden
Befund; Kimi und die ausführende Spur laufen. P2 Nacharbeit 2 läuft.

Stand 25.09.2026 00:45 UTC: P2 Runde 3 ohne blockierenden Befund → Nacharbeit 3 (letzte an P2) läuft; Rest auf
P2-S5..S7. C1 Runde 3: Verklemmung behoben (0/25), Fuzzer 0 neue Doppelvergaben; Nacharbeit 3 (letzte an C1: exakter
Sichtvergleich, Advisory-Lock, Indexprüfung über pg_index) läuft. Neu im Arbeitsplan: DB-INIT-SPERREN (vorbestehend
auf master, db.init() verklemmt mit Unterschriften-INSERTs). T2 Nacharbeit 1 fertig, zweite Suite läuft, Runde 2
(ausführend) läuft.

Stand 25.09.2026 01:45 UTC: **P2 ausgeliefert** — Deploy 444 (`8d4e2dc`) success, live-check 01:41 unauffällig (2× ℹ wie
immer). C1 PR #477 (`fefda14`): CI 3/4 grün, Isolation läuft; kein Bot-Kommentar. H1a-Bau und T2-Nacharbeit 2 laufen.
Stand 25.09.2026 01:52 UTC: **C1 gemergt** (#477, Squash `a8543ac`, CI 4/4 grün auf `fefda14`, kein Bot-Kommentar,
Botschaft zurückgelesen). Deploy-Prüfung 02:20. QR-J-Bau wartet auf einen freien Bauplatz (T2-Nacharbeit 2, H1a laufen).
Stand 25.09.2026 02:23 UTC: **C1 ausgeliefert** — Deploy 445 (`a8543ac`) success, Ladeprobe mit `db.init()` grün (TEMP-Recht
vorhanden), Health-Check Versuch 1, live-check unauffällig (2× ℹ). Beobachtet: master-`syntax-check.sh` braucht 0,3 s —
der `-n50`-Fehler (T2-B1) ist erst mit T2 behoben. T2-Nacharbeit 2 fertig gebaut (Kopf `4073fb2`), Suite läuft.
Stand 25.09.2026 02:32 UTC: T2-Suite (`4073fb2`) SUITE_EXIT=2 — beide FAIL (`geraete_alter`, `qr_token`: fremde
`qr_charge`-Zeile) kamen vom H1a-Executer, der `gymdocu_test` für Einzelläufe neu anlegte (02:16–02:28, Transkript).
Ritual 389 = 389, diff EXIT 0. H1a auf eigene DB umgestellt; Suite wird neu gefahren. Regel in CLAUDE.md ergänzt.
Stand 25.09.2026 02:45 UTC: T2-Executer schrieb die fremde `qr_charge`-Zeile (id 1, Studio 1, Nummer 900001) C1 zu —
**widerlegt**: CI auf master `a8543ac` grün (dieselben Tests), und im eigenen, ungestörten Lauf auf `4073fb2` ist
`test_feature_geraete_alter.js` 151 PASS / 0 FAIL. Ursache bleibt der H1a-Einzellauf gegen `gymdocu_test`. Lint EXIT 0,
Marker-Scan nur die 6 Doku-Zitate. Suite läuft noch.
Stand 25.09.2026 02:46 UTC: T2 eigener Suite-Lauf auf `4073fb2`: SUITE_EXIT=0, 389 = 389 (`diff` EXIT 0), Lint EXIT 0 —
PR #478 angelegt, CI läuft, Prüfung 03:10. QR-J-Bau läuft (seit 02:35), H1a-Bau läuft.
Stand 25.09.2026 02:57 UTC: **T2 gemergt** (#478, Squash `00bd9c9`, CI 4/4 grün auf `4073fb2`, kein Bot-Kommentar,
Botschaft zurückgelesen). Deploy-Prüfung 03:20 (Schritt 4/8 muss jetzt „(N Dateien)“ melden).
Stand 25.09.2026 03:21 UTC: **T2 ausgeliefert** — Deploy 446 (`00bd9c9`) success, Schritt 4/8 meldet jetzt „659 Dateien“
(neuer Syntax-Check läuft als Unterprozess nach dem pull, also schon beim eigenen Deploy), Health Versuch 1, live-check
unauffällig. Laufend: H1a-Bau, QR-J-Bau.
Stand 25.09.2026 04:40 UTC: QR-J Runde 1 → drei GEMESSENE Doppelvergaben über das Werkzeug (R1, R3 selbst wiederholt),
Nacharbeit 1 läuft (`plaene/auftrag-qrj-nacharbeit1.md`). H1a Runde 1 → `POST /csp-bericht` mit `application/json`
bleibt ohne Antwort (selbst bestätigt), Nacharbeit 1 läuft. C2-Bau läuft. **Damit bauen kurzzeitig DREI Beiträge
gleichzeitig — gegen die Zwei-Regel des Arbeitsplans** (beide Nacharbeiten gingen an ihre Executer, bevor ich
nachgezählt hatte). Folge: C3a startet erst, wenn höchstens einer läuft. Die ausführende H1a-Prüfspur hat entgegen der
Vorgabe drei lesende GET an echte Hosts geschickt (selbst gemeldet, `plaene/diffpruefung-h1a.md`).
Stand 25.09.2026 04:55 UTC: **Betreiber-Entscheidung H3: kein HSTS-Preload** (folgt der Empfehlung). In B3
(`ops/SECURITY-HEADER.md`) als entschieden vermerken, nicht erneut fragen.
Stand 25.09.2026 05:25 UTC: QR-J Nacharbeit 1 fertig (`0213cd9`, R1–R3 brechen jetzt ab, Suite 390 = 390) → Runde 2
mit drei Spuren läuft. C2 gebaut (`0182cf3`, Suite 390 = 390) → Diffprüfung (CC + DeepSeek) läuft. H1a-Nacharbeit läuft.
C3a-Bau gestartet (zweiter Bauplatz frei, seit C2 und QR-J nur noch prüfen).
Stand 25.09.2026 05:55 UTC: QR-J Runde 2 ausgewertet — Runde-1-Doppelvergaben geschlossen, dafür vier Sperren ohne
Werkzeugweg und drei bedingte Doppelvergaben (CC), zwei Kimi-Befunde gemessen gefallen. Auftrag Nacharbeit 2 steht
(`plaene/auftrag-qrj-nacharbeit2.md`), wartet auf einen freien Bauplatz (H1a-Nacharbeit und C3a bauen). C2-Prüfung läuft.
Stand 25.09.2026 07:10 UTC: H1a-Nacharbeit 1 fertig (`df2f500`, 19 Befunde, Suite grün 392 = 392; Studio-Wächter
„NICHT GEPRÜFT“ ist Umgebung — keine DB `gymdocu` im Container, in allen 123 Läufen gleich). Runde 2 läuft (CC + DeepSeek),
weil die Behebung Verhalten ändert. QR-J Nacharbeit 2 gestartet (Bauplatz frei). C3b Stufe 1 (Messen) gestartet.
C2-Prüfergebnis, Nacharbeitsauftrag und Sammellisten C2/H1a abgelegt.
