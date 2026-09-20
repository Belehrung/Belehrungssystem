# Auftragspapier M3 — fünf gemessene Fehler auf der Startseite gymdocu.de

**Repo: `Belehrung/gymdocu-hauptserver`**, Datei `landing/index.html`
(67.476 Bytes, Stand `47730a3`). **NICHT** das GymDocu-Repo — die Startseite
liegt in keinem der beiden bisher benutzten Bäume; das war am 20.09.2026 selbst
ein Befund: ich hatte M3 im STAND zunächst so notiert, als wäre sie dort baubar.

**Herkunft:** Gegenlesung `homepage` (`gpt-5.6-sol` mit Websuche) am
20.09.2026. **Jeder der fünf Punkte ist von mir selbst am Quelltext des Repos
nachgemessen**, nicht nur am ausgelieferten HTML — die Zahlen unten stammen
aus `landing/index.html` im frischen Klon.

**Wichtig für den Ausführenden: der Hauptserver hat KEINEN automatischen
Deploy.** Nach dem Merge braucht es auf dem Server `git pull --ff-only origin
master`. Das ist NICHT Teil dieses Auftrags, gehört aber in den Bericht,
damit niemand „gemerged" mit „ausgeliefert" verwechselt.

---

## 1. Was zu tun ist

### M3-a — Der Navigationslink „Module" zeigt ins Leere

**Gemessen:** `href="#module"` kommt **1×** vor, `id="module"` **0×**,
`id="modules"` **0×**. Der Abschnitt trägt nur `<section class="modules">`.

Alle anderen Anker sind heil — gemessen, die Menge der `href="#…"` ist
`{#, #ablauf, #kontakt, #module, #preise, #registrierung, #stakes}`, und
`ablauf`, `kontakt`, `preise`, `registrierung`, `stakes` existieren alle als
`id`. **Genau einer ist tot.**

**Behebung:** `<section class="modules">` → `<section id="module" class="modules">`.
Nicht umgekehrt den Link auf einen anderen Namen ändern — `#module` steht
möglicherweise in Lesezeichen und in verschickten Links.

### M3-b — „Vier Dinge", darunter stehen fünf

**Gemessen:** `Vier Dinge` **1×**, `class="pillar"` **5×**, `pillar-ic` **5×**.

Wörtlich: `<p class="section-sub">Vier Dinge, die ein Ordner voller Zettel
nicht leisten kann.</p>`

**Behebung:** „Vier Dinge" → „Fünf Dinge". **Keine Säule entfernen** — welche
wegfiele, ist eine inhaltliche Entscheidung, die hier niemand treffen soll.

### M3-c — „Alle sechs Module", die Seite zeigt vierzehn

**Gemessen:** `class="mod"` **14×**, `mod-ic` **14×**; in der Preiskarte steht
`<li>Alle sechs Module</li>` neben `<div class="pcard-amt">49,90 €</div>`.

**Behebung:** `<li>Alle sechs Module</li>` → `<li>Alle Module</li>`.

**Warum nicht „Alle vierzehn Module":** eine Zahl im Fließtext veraltet
lautlos, sobald ein Modul dazukommt — genau die Krankheit, die hier gerade
behoben wird. „Alle Module" kann nicht falsch werden. **Wer trotzdem eine Zahl
will, führt sie gegen `class="mod"` und braucht dann einen Wächter dafür.**

### M3-d — Das automatische § steht vor Dingen, die keine Paragraphen sind

**Gemessen.** Die Regel lautet wörtlich:

    .mod-legal::before { content:"§"; font-weight: 700; color: var(--gruen); }

Damit rendert die Seite diese vierzehn Abzeichen — **neun richtig, fünf falsch**:

| gerendert | Urteil |
|---|---|
| § 4 Abs. 5 BetrSichV · DGUV Info 202-044 | richtig |
| § 3 BetrSichV · Verkehrssicherungspflicht | richtig |
| § 14 BetrSichV · DGUV Info 202-044 | richtig |
| § 12 ArbSchG · DGUV Vorschrift 1 | richtig |
| § 965 ff. BGB | richtig |
| **§ Hausrecht · § 8 ArbSchG** | **falsch** — „§ Hausrecht" gibt es nicht; das zweite § ist von Hand geschrieben |
| § 24 Abs. 6 DGUV V1 · DGUV Info 204-021 | richtig |
| § 10 ArbSchG · ASR A2.2 | richtig |
| § 31 TrinkwV | richtig |
| **§ DGUV Vorschrift 3 · 14 BetrSichV** | **falsch** — eine DGUV Vorschrift hat keine §-Nummer an dieser Stelle; ausserdem fehlt dem „14 BetrSichV" dahinter sein eigenes § |
| **§ VDI/DVGW 6023** | **falsch** — technisches Regelwerk, kein Paragraph |
| **§ VO (EG) 852/2004 · LMHV** | **falsch** — EU-Verordnung, zitiert mit „Art.", nicht mit § |
| § 4 DGUV Vorschrift 1 | richtig |
| **§ Art. 5 DSGVO** | **falsch** — doppelte Kennzeichnung, „§ Art. 5" |

**Warum das mehr wiegt als eine Kleinigkeit:** Direkt daneben verspricht die
Seite wörtlich (Säule „⚖️ Rechtlich fundiert"): *„Jedes Modul nennt seine
Rechtsgrundlage … Sorgfältig recherchiert und aktuell gehalten — **ohne
erfundene Pflichten, die im Ernstfall nicht halten**."* Dieselbe Zusage zitiert
der bestehende Wächter `test_rechtsaussagen.js` in seinem Kopfkommentar als
seine Begründung. Ein falsch gesetztes § auf genau diesen Abzeichen ist der
sichtbarste mögliche Widerspruch zur eigenen Zusage.

**Behebung — und die Wahl ist begründet:**

**Das `content:"§"` aus dem Stylesheet ENTFERNEN und das § dort, wo es
hingehört, in den Text des jeweiligen Abzeichens schreiben.**

Also: Regel wird zu `.mod-legal::before { }` — bzw. die Regel entfällt, und
`font-weight`/`color` bleiben an `.mod-legal` selbst, falls sie dort gebraucht
werden (**nachsehen, nicht raten**). Danach tragen die neun richtigen Abzeichen
ihr § selbst im Text, die fünf falschen keines.

*Verworfen und warum:*
* *Die fünf falschen aus `.mod-legal` herausnehmen und eine zweite Klasse
  geben.* Dann steht dieselbe Aussage („das ist eine Rechtsgrundlage") an zwei
  Orten, und beim nächsten Modul muss jemand raten, welche Klasse gilt.
* *Die fünf Texte so umformulieren, dass ein § passt.* Ginge bei DSGVO nicht,
  und es verbiegt eine korrekte Zitierweise, um ein Stylesheet zu retten.

**Bei „Hausrecht · § 8 ArbSchG" wird das von Hand gesetzte § NICHT
angefasst** — es ist richtig und wird nach der Umstellung zum Normalfall.

### M3-e — Zwei Zusagen, die niemand halten kann

**Gemessen, wörtlich in der Datei:**

* `<p class="section-sub">So entsteht aus dem täglichen Rundgang ein Nachweis,
  der vor Gericht zählt.</p>`
* `<p>Der Eintrag wird signiert und in die hash-verkettete Prüfkette
  geschrieben — fälschungssicher.</p>`

Das Erste ist eine Aussage über die Beweiswürdigung eines Gerichts, die
niemand geben kann. Das Zweite ist ein Absolutheitsanspruch für ein Verfahren,
das Manipulation **erkennbar** macht, nicht unmöglich.

**Behebung, im Wortlaut:**

* „…ein Nachweis, der vor Gericht zählt." → **„…ein Nachweis, den du bei
  einer Kontrolle, im Versicherungsfall oder intern vorlegen kannst."**
* „…geschrieben — fälschungssicher." → **„…geschrieben. Nachträgliche
  Änderungen werden dadurch erkennbar."**

**NICHT anzufassen:** die Säulen-Überschrift „Manipulationssicher" und
`<li>Manipulationssichere Prüfkette</li>` in der Preiskarte. Beides ist ein
Eigenschaftswort über das Verfahren, keine Zusage über ein Gerichtsurteil —
und `test_landing.js` prüft den Inhalt der Preiskarte. **Wer sie doch ändern
will, misst zuerst, welche Zusicherung daran hängt.**

*Eine Kleinigkeit aus der Gegenlesung, die NICHT trägt:* sie wollte zusätzlich
„Alle Dokumentationspflichten" ersetzen. Diese Zeichenkette kommt in der Datei
**0×** vor — eine Paraphrase, als Zitat ausgegeben. Nicht suchen, nicht ändern.

---

## 2. Die Zusicherungen — und sie gehören in den BESTEHENDEN Wächter

`test_landing.js` (511 Zeilen) prüft die Startseite bereits und hat für genau
diese Klasse Präzedenz: es sichert zu, dass die FALSCHE Aussage „isolierte
Datenbank" weg ist UND dass die RICHTIGE („streng getrennt") dasteht, mit
einer eigenen Positivkontrolle daneben. **Diesem Muster folgen, keine neue
Datei anlegen.**

Neu zuzusichern, je Punkt in BEIDE Richtungen:

* **Z-a:** Der Abschnitt mit `class="modules"` trägt `id="module"`. Und
  schärfer, damit die Zusicherung nicht nur diesen einen Anker bewacht:
  **jeder `href="#x"` im Dokument (ausser `href="#"`) hat ein `id="x"`.**
  Das ist eine Referenz auf das Dokument selbst und wächst mit — kein
  festgeschriebener Name, der beim nächsten Abschnitt veraltet.
* **Z-b:** Das Zahlwort in `section-sub` vor `.pillars` stimmt mit der Anzahl
  `class="pillar"` überein. **Herleiten, nicht „Fünf" hinschreiben**: die Zahl
  wird aus `class="pillar"` gezählt und in das erwartete Wort übersetzt.
  Ein Test, der „Fünf Dinge" literal sucht, fällt beim Hinzufügen einer
  sechsten Säule NICHT — und genau dagegen ist er da.
* **Z-c:** In der Preiskarte steht kein Zahlwort vor „Module". Konkret: die
  Zeichenkette „sechs Module" kommt 0× vor, und `<li>Alle Module</li>` 1×.
* **Z-d:** `content:"§"` kommt im Stylesheet **0×** vor. Dazu die
  inhaltliche Seite: **kein `class="mod-legal"`-Text beginnt mit einem der
  fünf gemessenen Fehlanfänge** (`DGUV Vorschrift`, `VDI`, `VO (EG)`,
  `Art.`, `Hausrecht`) **und trägt zugleich ein führendes §**.
* **Z-e:** „vor Gericht" **0×**, „fälschungssicher" **0×**. Dazu die
  Positivkontrolle in die Gegenrichtung: die beiden neuen Sätze stehen da.

**Zu Z-e ausdrücklich:** „manipulationssicher" bleibt bei 2× — das ist KEIN
Befund und darf nicht mitgezählt werden. Wer hier auf `manipulation` prüft
statt auf `fälschungssicher`, baut eine Zusicherung, die beim nächsten
harmlosen Satz anschlägt.

---

## 3. Gegenproben — je eine pro Zusicherung, und sie müssen die Zeile ERREICHEN

Für JEDE der fünf: Defekt einbauen, **ROT** messen, über eine vorher mit `cp`
beiseitegelegte Kopie zurücknehmen, `diff` EXIT 0, **GRÜN** messen. Beide
Ergebnisse wörtlich melden (Exit-Code UND PASS/FAIL-Zahlen).

**Vorgeschriebene Mutationen** — und sie sind eine BEHAUPTUNG meinerseits:
**wer misst, dass eine davon nicht greift, widerspricht und leitet eine
andere her.** Das ist ausdrücklich erwünscht.

| Zusicherung | Mutation |
|---|---|
| Z-a | `id="module"` wieder entfernen |
| Z-b | „Fünf Dinge" zurück auf „Vier Dinge" |
| Z-c | `<li>Alle Module</li>` zurück auf `<li>Alle sechs Module</li>` |
| Z-d | `content:"§"` in die CSS-Regel zurückschreiben |
| Z-e | einen der beiden alten Sätze zurückschreiben |

**Zu Z-a zusätzlich die schärfere Probe:** einen NEUEN `href="#gibtsnicht"`
einfügen — fällt die Zusicherung auch daran, bewacht sie die Regel und nicht
den Einzelfall. Fällt sie nur bei der ersten Mutation, ist sie zu eng.

**Zu Z-b zusätzlich:** eine SECHSTE `<div class="pillar">` einfügen, ohne den
Text zu ändern — die Zusicherung muss fallen. Tut sie es nicht, zählt sie
nicht, sondern vergleicht Zeichenketten.

**Vor jeder Gegenprobe:** prüfen, dass die Mutation überhaupt angekommen ist
(eine Zahl suchen, die sich geändert haben muss). Jede Sabotage trägt in
derselben Zeile `GEGENPROBE-DEFEKT (absichtlich, wird zurueckgenommen)` —
und dieses Wort darf **nie** in einen Commit.

---

## 4. Harte Tore

1. **`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`** — ohne Pipe, ohne
   äusseres `flock`, mit dem `echo` in eigener Zeile. Danach das
   Dateizahl-Ritual: gelaufene gegen in `test/run.sh` registrierte Dateien,
   `diff` EXIT 0. **Die Sollzahl steht NICHT fest** — im aktuellen Baum sind
   es 87 Einträge, aber massgeblich ist immer die Liste aus `test/run.sh`
   selbst, nicht diese Zahl.
2. **`npm run lint`, falls vorhanden — das Ergebnis wörtlich melden, auch bei
   Grün.** Gibt es kein `lint`-Skript (`package.json` kennt heute nur `test`),
   wird DAS gemeldet, nicht stillschweigend übersprungen.
3. **Marker-Scan vor jedem Commit**, Ausschluss auf den PFAD:
   `grep -rn --exclude-dir=node_modules --exclude-dir=.git "GEGENPROBE-DEFEKT\|SABOTAGE" .`
   — **Treffer zählen**, nicht den Exit-Code lesen. Sollwert in diesem Repo:
   **unbekannt, also VORHER einmal messen und die Zahl im Bericht nennen.**
   Die Sollwerte aus der CLAUDE.md (6 bzw. 2) gelten für die beiden ANDEREN
   Repos und sind hier kein Massstab.
4. **Committen und pushen, BEVOR auf einen Hintergrundlauf gewartet wird.**
   Zweig: `landing-m3`, von `master`.
5. **Kein Modellname in Commit-Botschaft, PR-Titel oder -Rumpf.**

---

## 5. Was dieser Auftrag NICHT umfasst

* **Kein Umbau der Startseite.** Die Gegenlesung hat zwölf Vorschläge
  geliefert, darunter eine neue Abschnittsreihenfolge, Screenshots statt
  Grafik, ein einziger Preisblock und eine vollständige Typografie-/Farbliste.
  **Das ist eine Betreiber-Entscheidung und wird hier nicht angefasst.**
* **Keine Animation.** Auch der Vorschlag, den endlos pulsierenden grünen Punkt
  (`.pulse`, `@keyframes ping`) zu entfernen, bleibt draussen — er ändert das
  Aussehen und gehört zur Gestaltungsentscheidung.
* **Kein Deploy.** Der Hauptserver zieht nicht selbst nach; das erledigt der
  Betreiber bzw. ein eigener Schritt nach dem Merge.
