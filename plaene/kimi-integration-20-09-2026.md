# Kimi im Verbund — wo es hingehört und wo nicht (20.09.2026)

Betreiber-Auftrag: „überlege wie wir kimi in den verbund der ki integrieren
können. denn offenbar kann es was."

Grundlage: unsere EIGENEN Messungen vom 19./20.09.2026 plus eine
Online-Recherche vom 20.09.2026. **Fremdangaben sind als solche gekennzeichnet
— sie sind Behauptungen, bis wir sie am eigenen Bestand messen.**

---

## 1. Was wir SELBST gemessen haben

* Endpunkt `api.moonshot.ai` (nicht `.cn`), Konto **Tier 2**: 40 parallele
  Aufrufe, 100 RPM, 3 Mio TPM.
* **Kontext 1.048.576** — von der API selbst bestätigt. Das ist **2,6-mal**
  unser OpenAI-Limit (~400.000, gemessen 11.09.).
* `reasoning.effort` wirkt (low 312 / high 598 / max 5781 Denk-Token).
* Der Egress-Proxy schneidet auch hier bei 301 s ab; `stream: true` trägt.
* **Drei echte Läufe:** Planprüfung Runde 2 (7 Befunde, 7 getragen, ~0,42 $),
  Runde 3 (8 Befunde, 8 getragen, ~0,30 $), dazu eine Diffprüfung zu
  Beitrag B (2 Befunde, beide getragen).
* **Der automatische Prefix-Cache greift bei uns nachweislich:** im A/B-Lauf
  **44.544 von 44.704 Eingabe-Token kamen aus dem Cache.**
* **WARNUNG, gemessen:** ein erfundenes Feld (`quatschfeld_xyz`) wird mit
  HTTP 200 **angenommen**. Bei OpenAI gibt es dafür „Unknown parameter" —
  genau darauf stützt sich unsere Gegenprobe-Methode seit dem 12.09.
  **Bei Kimi sagt „wird angenommen" NICHTS über Wirkung.**

## 2. Was die Recherche sagt (fremde Angaben, NICHT von uns gemessen)

* Preis: **3,00 $ / Mio Eingabe, 0,30 $ / Mio bei Cache-Treffer (90 % Rabatt),
  15,00 $ / Mio Ausgabe** — flach über den ganzen 1M-Kontext, kein
  Langkontext-Aufschlag. Cache automatisch, TTL 5 min bzw. 1 h, jeder Treffer
  frischt auf.
* Stärken: **#1 in der Frontend Code Arena** (1.679 Elo vor Fable 5 und
  GPT-5.6 Sol), Top-3 über sechs Coding-Benchmarks, **#1 von 48 bei
  multimodalen/„grounded" Aufgaben**, #4 von 154 bei agentischer
  Werkzeugnutzung.
* **Schwäche, und sie ist die entscheidende:** die Halluzinationsrate stieg
  von 39 % (K2) auf **51 %** — das Modell erfindet MEHR, während es
  gleichzeitig mehr richtig beantwortet. Die Lücke liegt laut den Quellen
  genau dort, wo das Modell **auf eigene Faust Tatsachen erinnern oder
  beurteilen** soll. Moonshot selbst nennt einen spürbaren Abstand im
  Nutzungserleben und eine „Neigung zu übermäßiger Eigeninitiative".

## 3. Der Knackpunkt ist NICHT die Leistung, sondern die Daten

**Moonshot trainiert laut eigener Datenschutzerklärung standardmäßig auf
eingereichten Inhalten, ohne dokumentierten Opt-out**; Speicherung in
Singapur, kein SOC-2-Bericht. Unsere Datengrenze verlangt für OpenAI
`store: false` genau deshalb.

Dagegen hilft bei Kimi kein Schalter, den wir prüfen könnten: **unbekannte
Felder werden stillschweigend angenommen** (selbst gemessen). Ein `store:
false` an diesen Endpunkt wäre eine Beruhigung ohne Nachweis.

**Und es ist bereits Material dort gewesen:** drei Läufe mit dem
Auftragspapier `auftrag-schreibreihenfolge.md` und Quelltextauszügen.
Das ist keine Vermutung, es steht in `ASTRA-LAEUFE.md`.

→ **Das ist eine Betreiber-Entscheidung, keine technische Frage.** Bis sie
gefallen ist, geht kein weiterer Quelltext dorthin.

## 4. Wenn die Datenfrage mit JA beantwortet wird: drei Rollen, in denen
   Kimis Stärken tragen und seine Schwäche nicht wehtut

Die Auswahl folgt EINEM Grundsatz: **Kimi bekommt Aufgaben, deren Ergebnis
wir in Minuten gegenprüfen können.** Bei 51 % Halluzination auf selbst
beurteilten Tatsachen ist alles andere teuer — unser Engpass ist seit dem
12.09. gemessen das NACHMESSEN, nicht das Finden.

**(a) Bündel-Kartierer — der grösste Hebel, und er nutzt genau das 1M-Fenster.**
Am 12.09. hat die Bündelwahl nachweislich über einen Befund entschieden: der
Prüfer fand eine von zwei Stellen derselben Regelverletzung, weil die zweite
in einer Datei lag, die nicht im Bündel war. **Er KONNTE sie nicht finden.**
Kimi bekommt den ganzen betroffenen Teilbaum und beantwortet eine reine
Strukturfrage: *welche Dateien muss ein Prüfer sehen, um diesen Diff zu
beurteilen, und warum?* Die Antwort ist eine Dateiliste — eine Halluzination
fällt beim ersten `ls` auf. Danach gehen die eigentlichen Prüfspuren
(`gpt-5.6-sol`, `deepseek-v4-pro`) mit einem besseren Bündel los.

**(b) Screenshot-Prüfer.** Unsere Regel „bei jeder Änderung am Aussehen geht
der Screenshot mit" steht seit dem 18.09. und wurde **kein einziges Mal**
benutzt. Kimi ist laut Recherche #1 bei multimodalen Aufgaben, und ein
Bildbefund („dieser Knopf liegt ausserhalb des Kastens") ist am Screenshot
selbst in Sekunden nachprüfbar.

**(c) Die zweite Runde billig machen.** Am 12.09. haben wir entschieden:
`store: false` gewinnt, das Material geht in Runde 2 einfach erneut mit —
zum vollen Preis. Kimis automatischer Prefix-Cache hat bei uns **99,6 %
Trefferquote** gezeigt; zum Cache-Preis kostet eine Wiederholung ein Zehntel.
**Aber:** der Cache hält unseren Quelltext 5 min bis 1 h auf fremden Servern.
Das gehört zur Datenfrage oben, nicht daneben.

## 5. Wo Kimi ausdrücklich NICHT hingehört

* **Nicht als entscheidende oder alleinige Prüfspur.** 51 % Halluzination auf
  selbst beurteilten Tatsachen, und unsere eigene Prüfgüte-Messung besteht aus
  17 Befunden in drei Läufen — ein Anfang, keine Statistik.
* **Nicht als Rechtsquelle** (unverändert, gilt für alle Modelle).
* **Nicht für das Abhängigkeits-Audit:** Websuche ist laut Hersteller „being
  updated and not recommended".
* **Nicht als Ersatz** für `sol` oder `deepseek`. Die Messung vom 13.09.
  (neun Befunde, NULL Überschneidung zwischen zwei Spuren) sagt: verschiedene
  Sucher finden verschiedene Klassen. Eine Spur wegzunehmen verliert eine
  Klasse, nicht Redundanz.

## 6. Die billigste nächste Messung — und sie hat einen Lösungsschlüssel

**Beitrag C ist gerade fertig geprüft: 26 Diffprüfungs-Befunde, jeder einzeln
von mir nachgemessen, drei gefallen.** Das ist ein Korrekturbogen, wie wir ihn
sonst nie haben.

Vorschlag: denselben Diff und dasselbe Bündel an Kimi, wortgleiche Frage.
Dann zählen: wie viele seiner Befunde tragen, wie viele hat es, die KEINE
andere Spur hatte, und wie viele erfindet es. Kosten nach Preisliste
**deutlich unter 2 $**. Das macht aus „offenbar kann es was" eine Zahl.

**Erst diese Messung, dann eine Rolle.** In der umgekehrten Reihenfolge haben
wir am 18.09. schon einmal ein Modell eingeführt, dessen Prüfgüte bis heute
nicht gemessen ist.
