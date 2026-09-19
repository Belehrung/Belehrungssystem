# Mutation Testing mit Stryker — erste Messung am eigenen Bestand

19.09.2026. Anlass: Betreiber-Auftrag, das eigene Prüfverfahren gegen die
Praxis zu halten. Die Recherche ergab, dass unsere handgebauten Gegenproben
einen Fachnamen haben — **Mutation Testing** — und dass es dafür ein Werkzeug
gibt, das auf unseren Aufbau passt (`@stryker-mutator/command-runner`, gedacht
für Projekte ohne Jest/Vitest mit eigenem Testkommando).

**Diese Datei hält fest, was GEMESSEN ist. Nicht, was das Werkzeug verspricht.**

## Versuch 1 — gescheitert, und das ist das wertvollste Ergebnis

Ziel: `core/datum.js`, Testkommando `node test_feature_datum_monatsrollover.js`.

**Ergebnis: Stryker bricht schon im Trockenlauf ab** („There were failed tests
in the initial test run"), und zwar bevor ein einziger Mutant gesetzt wurde.

Ursache, aus dem Log belegt: Stryker **instrumentiert den Quelltext** — jede
mutierbare Stelle wird in `stryMutAct_9fa48(...)`-Hüllen gepackt. Unsere
statischen Wächter LESEN genau diesen Quelltext. Der instrumentierte Code löste
den Zeitzonenfallen-Wächter aus:

    ✗ FAIL: Keine ungedeckelte Monats-/Jahresarithmetik … core/datum.js:367
      const ziel = new Date(Date.UTC(j, stryMutAct_9fa48("105") ? m + 1 :
        (stryCov_9fa48("105"), m - 1), …

**Folge, und sie ist strukturell:** Mutation Testing ist mit unseren
quelltextlesenden Wächtern **unverträglich**. Betroffen ist nicht eine Datei,
sondern eine ganze Familie — acht Wächter hängen am gemeinsamen Scanner
(`test/helfer/quelltext-scan.js`). Wer Stryker hier einführen will, muss diese
Wächter aus dem Mutationslauf heraushalten, nicht andersherum.

## Versuch 2 — läuft, mit Zahlen

Ziel: `core/2fa.js` (143 Zeilen, sicherheitsrelevant), Testkommando
`node test_feature_2fa.js` — ein reiner Verhaltenstest ohne Quelltext-Scan und
ohne Datenbank.

| | |
|---|---|
| Mutanten | **130** |
| getötet | 65 |
| überlebt | 63 |
| Zeitüberschreitung | 2 |
| Dauer | **35 s** |
| Basislauf des Tests allein | 1 s |

Mit BEIDEN 2FA-Tests (`&&`-verkettet): 81 getötet, 47 überlebt, 2
Zeitüberschreitungen, **Mutation Score 63,8 %**, 39 s.

Zur Einordnung nennt die Branchenliteratur >80 % als gut und <60 % als
lückenhaft. **Diese Zahl ist aber nicht das Ergebnis** — siehe unten.

## Was ich beim Nachmessen selbst falsch gemacht habe

Ich habe einen überlebenden Mutanten auf Zeile 133 nachgemessen und daraus
geschlossen, Stryker liefere ein falsches Negativ. **Das war mein Fehler, nicht
seiner.**

Zeile 133 lautet:

    if (cand.length === hBuf.length && crypto.timingSafeEqual(cand, hBuf)) { idx = i; break; }

Sie enthält **drei** mutierbare Bedingungen. Ich habe die GANZE `if`-Bedingung
durch `true` ersetzt — gemessen `11 PASS / 2 FAIL`, also getötet. Stryker
meldet für genau diese Mutation ebenfalls `Killed`. Überlebt hat eine ANDERE:
nur der Teilausdruck `cand.length === hBuf.length` → `true`, Spalte 13-40.

Und dieser Überlebende ist **äquivalent**: alle gespeicherten Werte sind
sha256-Hex, also immer 64 Zeichen wie `hBuf`. Die Längenprüfung ist im Betrieb
ohnehin stets wahr; sie durch `true` zu ersetzen ändert nichts.

Das ist die Klasse „ein Mutationsmuster, das mehr als einmal passt, mutiert
lautlos die falsche Stelle" — hier auf mich selbst angewandt. Die Lehre für
die Auswertung: **ohne Spaltenangabe ist ein Mutantenbericht nicht
nachmessbar.** Die Zeilennummer allein genügt nicht.

## Was die 63,8 % wert sind

Wenig, solange die Überlebenden nicht einzeln beurteilt sind. Von den
stichprobenartig geprüften waren:

* `/\s+/g` → `/\s/g` bei globalem Ersetzen durch `''` — **äquivalent**
* `i < hashes.length` → `i <= …` — **äquivalent** (der Zusatzdurchlauf trifft
  `undefined`, dessen Länge nie zur Hash-Länge passt)
* `cand.length === hBuf.length` → `true` — **äquivalent** (s.o.)
* `/^\d{6}$/` → `/\d{6}$/` — **echte Lücke, aber harmlos**: ein siebenstelliger
  Code käme durch die Formatprüfung und würde erst an der TOTP-Verifikation
  scheitern. Tiefenverteidigung, ungeprüft.
* `benutzteCodes.delete(k)` ersatzlos entfernt — **echte Lücke**: das Aufräumen
  abgelaufener Replay-Einträge ist von keinem Test gedeckt. Speicherwachstum,
  kein Sicherheitsloch.

**Kein einziger der geprüften Überlebenden war ein Sicherheitsfehler.** Der
Replay-Riegel selbst wird getötet — nur seine Randbedingung (`>` gegen `>=`)
überlebt, was bei Millisekunden-Auflösung äquivalent ist.

## Urteil

**Brauchbar, aber nicht als Gate und nicht flächendeckend.**

Dafür:
* Es findet ungeprüfte Stellen, die uns beim Lesen entgehen — z.B. das nie
  getestete Aufräumen der Replay-Tabelle.
* 35 s für eine 143-Zeilen-Datei ist bezahlbar.
* Es erzwingt Genauigkeit: ein Mutantenbericht mit Spalten ist präziser als
  jede handgeschriebene Gegenprobe.

Dagegen:
* Unverträglich mit unseren quelltextlesenden Wächtern (Versuch 1).
* Der command-runner kann keine Abdeckungsanalyse, fährt also das ganze
  Testkommando je Mutant. Bei 130 Mutanten und einem 1-Sekunden-Test sind das
  35 s; bei einem Test, der die volle Suite braucht, wäre es unbrauchbar.
* Die meisten Überlebenden sind äquivalent. Ohne die Handarbeit des
  Beurteilens ist die Zahl eine Dekoration.

**Empfehlung:** gezielt auf kleine, reine Logikmodule mit schnellen
Verhaltenstests anwenden (`core/2fa.js`, `core/datum.js` ohne die statischen
Wächter, `core/csv.js`, `core/client-ip.js`). NICHT auf Routen, NICHT auf
statische Wächter, NICHT als CI-Gate.

**Nicht gemessen:** ob sich die statischen Wächter sauber ausschliessen lassen,
ob `--incremental` bei uns trägt, und ob der Ertrag bei einem zweiten Modul
ähnlich aussieht. Eine Datei ist eine Stichprobe.
