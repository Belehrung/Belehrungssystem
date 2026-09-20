# Auftragspapier M5 — „Manipulationsschutz" im GymDocu-Repo

**Betreiber-Entscheidung 20.09.2026.** Wörtlich: „könnte man stattdessen auch
das wort ,manipulationsschutz' verwenden?" → „**ja nimm das so und schaue
auch in das handbuch ob da was bei der formulierung geämdert werden muss**".

**Repo: `Belehrung/Gymdocu`** (`/home/user/gymdocu`), Zweig `manipulationsschutz-m5`
von `master`. Die Startseite ist ein EIGENER Beitrag in einem anderen Repo
(`plaene/auftrag-landing-m3.md`, Abschnitt 6) — nicht vermischen.

---

## 0. Was Fassung 1 falsch hatte — zwei Planprüfungen, 19 Befunde

Fassung 1 ging am 20.09.2026 an zwei Lesespuren mit getrennten Bündeln
(`gpt-5.6-sol` mit dem vollständigen Generator, `kimi-k3` mit der
Anwendungsdatei und den beiden Handbuch-Wächtern). **19 Befunde.** Was davon
nach eigener Nachmessung trägt, steht hier; der Rest ist unten bei den
jeweiligen Abschnitten eingearbeitet.

**0.1 — Die Negativ-Zusicherung wäre gegen den Generator blind gewesen.**
Beide Spuren unabhängig. `tools/baue_handbuch.py` schreibt Umlaute als
Unicode-Escapes — **gemessen 162 Stück** (97× `\u00e4`, 89× `\u00fc`, …).
„fälschungssicher" enthält ein ä. Käme das Wort dort konventionsgemäß als
`f\u00e4lschungssicher` zurück, fände ein Muster auf das Literal es **nie**,
während im PDF wieder „fälschungssicheres" stünde. *Heute kommt das Wort im
Generator gar nicht vor (gemessen: 0× als Literal, 0× als Escape) — die
Lücke ist prospektiv, die Zusicherung aber trotzdem wertlos.*

**0.2 — Die Positiv-Zusicherung zählte, ohne zu prüfen WO.** Beide Spuren
unabhängig. Einzeilige Umgehung: `<strong>verkettet</strong><!-- Manipulationsschutz -->`
— die Zählung bleibt 1×, die Negativ-Zusicherung bleibt grün, und der
Benutzer sieht das neue Wort nicht mehr. Dasselbe als Python-Kommentar im
Generator. „Eine Zusicherung über eine ZAHL ist keine über eine MENGE".

**0.3 — „sinngemäß" ist nicht testbar.** Beide Spuren. Als Literal
implementiert („die Prüfung deckt das sofort auf") bleibt sie grün, wenn man
nur den BEDINGUNGSTEIL davor löscht — der bewachte Satz steht weiter, aber
„das" hat keinen Referenten mehr.

**0.4 — Mein Kommentar-Inventar war rechnerisch falsch.** Fassung 1 sprach
von „zehn Fundstellen". **Nachgezählt: 12 Treffer in 9 `.js`-Dateien**, davon
einer die Benutzerstelle in `routes/admin/audit.js`, die wir ändern — also
**11 Kommentarstellen in 8 Dateien.**

**0.5 — M5-a hat keinen erklärenden Nachbarsatz.** Das Papier begründet
selbst: „der Präzisionsgewinn steckt im Nebensatz, nicht im Substantiv". Bei
M5-b (Sicherheitsliste) und M5-c (Audit-Ansicht) steht dieser Nebensatz
daneben — bei M5-a im Verbandbuch-Kapitel, rund 110 Zeilen entfernt, **nicht**.
Der Leser liest dort nachher „mit Manipulationsschutz gespeichert" ohne jede
Erläuterung, nach meiner eigenen Logik also genauso unscharf wie vorher.

**0.6 — M5-b konserviert eine ZWEITE Absolutbehauptung, und sie widerspricht
unserer eigenen Sicherheitsdokumentation.** Das ist der schwerste Fund der
beiden Läufe und wird als eigener Punkt M5-e aufgenommen (Abschnitt 1).

**0.7 — `docs/SICHERHEIT.md` hat einen EIGENEN Stand und eine EIGENE
Änderungstabelle.** Gemessen: „**Stand: 14.08.2026**" im Kopf, Tabelle
`| Datum | Änderung |` bei `:276`. Wer den Text ändert und beides stehen
lässt, erzeugt eine falsche zeitliche Herkunft — ausgerechnet in dem
Dokument, das Einkauf und IT-Sicherheit eines Kunden lesen.

**0.8 — Eine bestehende Zusicherung ist nachher aus einem ANDEREN Grund
grün.** `test_feature_handbuch_namen.js:122-123` prüft
`Number(datum.slice(6)) >= jahr - 1` mit der Meldung „das Handbuch hinkt
hinterher". Sie misst damit nur, ob das DATUM des neuesten
Changelog-Eintrags jung ist — nicht, ob der Changelog den ausgelieferten
Inhalt beschreibt. Nach M5 ändert sich der Inhalt ohne Eintrag, der Test
bleibt grün, und die behauptete Eigenschaft ist verletzt. **Kein Umbau** (die
Betreiber-Entscheidung gegen eine neue Version steht) — aber es gehört
benannt, sonst hält der nächste Prüflauf diesen Test für einen Beleg.

---

## 0a. Warum das kein Wortspiel ist

„-sicher" ist ein **Ergebnis**-Suffix (wasserdicht, kugelsicher,
fälschungssicher): es behauptet, das Ergebnis sei garantiert, und kann nicht
teilweise wahr sein. „-schutz" benennt eine **Maßnahme**: es wird etwas
dagegen getan, ohne Vollständigkeit zu versprechen.

Unser Verfahren macht nachträgliche Änderungen **erkennbar**, nicht
unmöglich. Wer Datenbank und Schlüssel hat, kann manipulieren — er hinterlässt
Spuren. „Manipulationsschutz" deckt das, „manipulationssicher" nicht.

**Und das ist keine Theorie, sondern steht an beiden Fundstellen schon
daneben** — die genaue Aussage ist da, das Absolutwort sitzt obendrauf:

* `tools/baue_handbuch.py:1119-1120`, der Punkt DIREKT ÜBER dem falschen:
  „**Signatur-Schutz:** jede Unterschrift wird kryptografisch versiegelt;
  nachträgliche Veränderungen sind **nachweisbar**" — richtig formuliert.
  Der nächste Punkt sagt dann „manipulationssicheres … Protokoll".
* `routes/admin/audit.js:277-279`, der Satz direkt NACH dem falschen:
  „Wird ein alter Eintrag nachträglich verändert oder gelöscht, bricht die
  Kette ab dieser Stelle — die Prüfung **deckt das sofort auf**." — richtig.
  Die fettgedruckte Überschrift darüber sagt „fälschungssicher verkettet".

Das ist „dieselbe Aussage an zwei Orten", in **widersprüchlicher** Form: ein
Satz sagt „erkennbar", der Nachbarsatz sagt „unmöglich".

**Ehrlich dazu:** auch „Schutz" klingt für einen Laien nach Verhindern. Die
vollständig präzise Formulierung wäre „nachträgliche Änderungen werden
erkennbar". Der Begriff ist der vom Betreiber gewählte Mittelweg. Das ist
eine Abwägung, keine Messung.

---

## 1. Die FÜNF Stellen, im gemessenen Wortlaut

### M5-a — Handbuch, Verbandbuch-Kapitel

`tools/baue_handbuch.py:1008-1011`:

    "Jede Erste-Hilfe-Leistung im Studio muss dokumentiert werden – vom Pflaster
     bis zum Notarzteinsatz. Das Verbandbuch erfüllt diese Pflicht digital: Vorfälle
     werden direkt am Tablet erfasst, manipulationssicher gespeichert und im Admin
     eingesehen."

**SOLL:** `…erfasst, mit Manipulationsschutz gespeichert und im Admin eingesehen; nachträgliche Änderungen werden dabei erkennbar.`

*Der Nachsatz ist neu in Fassung 2 (Befund 0.5): dies ist die einzige der vier Stellen OHNE erklärenden Nachbarsatz. Ohne ihn wäre „Manipulationsschutz" hier genauso unscharf wie das alte Wort — nach der eigenen Begründung dieses Papiers.*

### M5-b — Handbuch, Sicherheits-Aufzählung

`tools/baue_handbuch.py:1121-1123`:

    LI("<b>Prüfkette:</b> ein manipulationssicheres, verkettetes Protokoll
        dokumentiert alle relevanten Vorgänge – im Streitfall lässt sich
        belegen, was wann unterschrieben wurde")

**SOLL:** `<b>Prüfkette:</b> ein verkettetes Protokoll mit Manipulationsschutz
dokumentiert alle relevanten Vorgänge – …` (Rest unverändert).

*Die Umlaute stehen in der Datei als `\uXXXX`-Escapes — beim Ändern die
vorhandene Schreibweise beibehalten, nicht auf Literale umstellen.*

### M5-c — die Audit-Ansicht IN DER ANWENDUNG

`routes/admin/audit.js:276`. **Das ist die wichtigste der vier Stellen:** kein
Werbetext, sondern das, was der Studiobetreiber in der Anwendung liest, wenn
er die Prüfkette ansieht.

    <strong>fälschungssicher verkettet</strong>: Jeder Eintrag enthält den kryptographischen
    Fingerabdruck (Hash) seines Vorgängers. Wird ein alter Eintrag nachträglich verändert oder
    gelöscht, bricht die Kette ab dieser Stelle — die Prüfung deckt das sofort auf.

**SOLL:** `<strong>mit Manipulationsschutz verkettet</strong>: …` — der Rest
des Absatzes bleibt **wörtlich unverändert**, er ist bereits richtig.

### M5-d — `docs/SICHERHEIT.md:26`

    PDF-Nachweise mit Unterschrift und ein fälschungssicheres Protokoll.

**SOLL:** `…und ein Protokoll mit Manipulationsschutz.`

Interne Dokumentation, kein Benutzertext — **trotzdem mitändern**, weil sie
die Vorlage ist, aus der solche Sätze abgeschrieben werden.

### M5-e — die zweite Absolutbehauptung im selben Handbuchsatz

**Neu in Fassung 2, aus der Planprüfung, von mir nachgemessen.** Der Satz aus
M5-b endet mit:

    „… – im Streitfall lässt sich belegen, was wann unterschrieben wurde"

**Unsere eigene Sicherheitsdokumentation sagt das Gegenteil**, wörtlich
(`docs/SICHERHEIT.md:152-154`):

    „Sie beweist, dass Einträge untereinander unverändert sind — sie beweist
     NICHT gegenüber einem Dritten, dass ein Eintrag zu einem bestimmten
     Zeitpunkt bereits existierte. Dafür wäre ein Zeitstempel eines
     unabhängigen …"

und führt bei `:268` in der Lückenliste ausdrücklich:

    | Qualifizierter Zeitstempel | Das Integritätsprotokoll wird selbst
      berechnet; eine unabhängige Zeitbezeugung fehlt (siehe Abschnitt 6). |

**Das Handbuch verspricht einem Kunden also genau das, was das
Sicherheitsdokument als fehlend führt** — und zwar das „**wann**". Die reine
Wortersetzung aus M5-b hätte diesen Widerspruch unberührt gelassen.

**SOLL für den vollständigen Satz:**

    <b>Prüfkette:</b> ein verkettetes Protokoll mit Manipulationsschutz
    dokumentiert alle relevanten Vorgänge – nachträgliche Änderungen werden
    dabei erkennbar, und im System ist nachvollziehbar, welcher Inhalt mit
    welchem Zeitwert gespeichert wurde

**Was damit bewusst WEGFÄLLT:** „im Streitfall lässt sich belegen, was wann
unterschrieben wurde". Ein Zeitwert, den wir selbst setzen, ist kein Beleg
gegenüber einem Dritten. Das ist keine Verschlechterung des Produkts, sondern
das Ende einer Zusage, die wir nicht halten können.

**GEMESSEN, und damit geschlossen:** Ich hatte die Frage offengelassen, ob
dieselbe Zusage an weiteren Stellen steht. `grep -rniE "im streitfall|vor
gericht|gerichtsfest|beweiskraft|wann unterschrieben|rechtssicher"` über
BEIDE Repos (ohne `node_modules`, ohne Testdateien) liefert **genau fünf
Treffer, und nur zwei davon sind Zusagen an einen Kunden**:

* `tools/baue_handbuch.py:1122-1123` — **dieser Punkt (M5-e).**
* `landing/index.html:992` — „ein Nachweis, der vor Gericht zählt", **bereits
  in M3-e erfasst.**

Die übrigen drei sind keine Zusagen: `docs/qr-codes-konzept.md:431`
beschreibt ein PROBLEM („im Streitfall wäre nicht mehr feststellbar, wann
…"), `core/hilfe-texte.js:1107` handelt von DSGVO-Bußgeldern, und
`routes/superadmin.js:391` ist ein Entwicklerkommentar über eine Umrechnung.

**Es gibt also keinen dritten Ort.** Kein eigener Punkt nötig — mit M3-e und
M5-e ist die Klasse vollständig erfasst.

---

## 2. Was ausdrücklich NICHT angefasst wird

**Entwicklerprosa in Kommentaren bleibt.** Gemessen, diese Stellen sind
Kommentare und keine Benutzertexte — sie beschreiben zutreffend einen
Mechanismus namens „Manipulationssicherung":

    core/db.js:1661               -- Manipulationssicherung: Hash-Kette.
    core/retention.js:974         // Zusätzlich in die MANIPULATIONSSICHERE Hash-Kette
    routes/module.js:63, :2873, :3381
    routes/verbandbuch.js:586
    routes/belehrungen.js:739, :921
    routes/mitarbeiter-auth.js:380   (faelschungssicher, Kommentar)
    test_feature_audit.js:1, test_feature_audit_delete.js:2, test_feature_korrekturen.js:200

**Wer hier mitändert, erzeugt einen Diff über acht Dateien ohne eine einzige
Verhaltens- oder Textänderung für den Benutzer.** Die Trennung ist der Punkt:
geändert wird, was ein BENUTZER liest.

**`revisionssicher` bleibt ebenfalls** (kommt hier nicht vor, auf der
Startseite schon) — etablierter Fachbegriff aus den GoBD, eigene Bedeutung.

---

## 3. Die Zusicherungen — nach den Planprüfungen neu gefasst

**Gemessen und im Papier festgehalten: KEIN bestehender Wächter hängt an
diesen Wörtern.** `grep -rniE` über alle `test_*.js`, `ops/` und `.github/`
findet nur Kopfkommentare, keine Zusicherung.

**Vorher messen, wo die neuen hingehören.** Es gibt Wächter auf die
Handbuchtexte (`test_feature_handbuch_namen.js`,
`test_feature_handbuch_deploy_static.js`, `test_feature_handbuch_navigation.js`).
Keine neue Datei, wenn eine passende existiert — die Entscheidung gehört
gemessen und im Bericht begründet.

### Z1 — NEGATIV, und sie muss Escapes sehen (Befund 0.1)

In den fünf geänderten Benutzertexten kommt `/manipulationssicher|fälschungssicher/i`
**0×** vor — **case-insensitiv** und **nach Dekodierung der
`\uXXXX`-Escapes**.

Für `tools/baue_handbuch.py` heisst das: erst die Escapes auflösen (oder
zusätzlich `f\\u00e4lschungssicher` und `manipulationssicher` in der
Escape-Schreibweise verbieten), dann suchen. **Ohne diesen Schritt ist die
Zusicherung gegen den Generator wertlos** — dort stehen 162 Escapes, und
„fälschungssicher" trägt ein ä.

**Geltungsbereich exakt: nur die fünf Dateien aus Abschnitt 1.** Nicht das
ganze Repo — sonst schlägt sie an den elf Kommentaren aus Abschnitt 2 an und
wird abgeschaltet statt gelesen. **Was diese Eingrenzung kostet, steht in
Abschnitt 2 und ist dort benannt, nicht wegdefiniert.**

### Z2 — POSITIV, und sie muss den ORT binden (Befund 0.2)

**Nicht als Dateizählung.** Eine Zählung bleibt grün, wenn das Wort in einen
Kommentar wandert (`<strong>verkettet</strong><!-- Manipulationsschutz -->`)
— der Benutzer sieht es dann nicht mehr, die Zahl stimmt weiter.

Stattdessen je Stelle ein Muster MIT Kontext:
* `routes/admin/audit.js`: `<strong>mit Manipulationsschutz verkettet</strong>`
  als zusammenhängendes Muster.
* `tools/baue_handbuch.py`: der umgebende Satz je Fundstelle, nicht das Wort
  allein.
* `docs/SICHERHEIT.md`: der vollständige Satz.

Die Zählung darf **zusätzlich** dabeistehen, nie als einziger Beleg.

### Z3 — der ERKLÄRENDE Satz, im exakten Wortlaut (Befund 0.3)

**„sinngemäß" entfällt** — das ist nicht testbar. Stattdessen der vollständige
Satz **inklusive Bedingungsteil**:

* `routes/admin/audit.js`: „Wird ein alter Eintrag nachträglich verändert oder
  gelöscht, bricht die Kette ab dieser Stelle — die Prüfung deckt das sofort
  auf."
* Handbuch, Sicherheitsliste: „nachträgliche Veränderungen sind nachweisbar".
* Handbuch, Verbandbuch (neu durch M5-a): „nachträgliche Änderungen werden
  dabei erkennbar".

**Warum der Bedingungsteil mitmuss:** löscht jemand nur „Wird ein alter
Eintrag … ab dieser Stelle —", steht „die Prüfung deckt das sofort auf"
weiter da, die Zusicherung bleibt grün, und „das" hat keinen Referenten mehr.

**Das ist die wichtigere der drei Zusicherungen.** Ohne den erklärenden Satz
ist „Manipulationsschutz" allein genauso ungenau wie das alte Wort — der
Präzisionsgewinn steckt im Nebensatz.

### Gegenproben, je einzeln, ROT/GRÜN wörtlich

1. **Zwei Varianten, beide Pflicht** (Befund 0.1 / waechter-Randnotiz): eine
   der fünf Stellen auf das alte Wort zurückschreiben — einmal als **Literal**,
   einmal als **`\uXXXX`-Escape** im Generator. **Beide müssen Z1 rot machen.**
   Nur die Literal-Variante zu fahren erzeugt ein falsches Sicherheitsgefühl.
2. Das neue Wort in einen **Kommentar** verschieben (HTML in `audit.js`,
   Python im Generator) → Z2 muss fallen, obwohl die Zählung stimmt.
3. In `audit.js` **nur den Bedingungsteil** des erklärenden Satzes löschen →
   Z3 muss fallen. **Tut sie es nicht, ist sie Dekoration** — dann
   widersprechen und eine andere herleiten.
4. `Manipulationsschutz` an einer Stelle zu `Manipulations-Schutz` ändern →
   Z2 muss fallen (sie prüft die ausgelieferte Schreibweise, keine ungefähre).

## 4. Handbuch-Version — ENTSCHIEDEN: keine neue

**Betreiber-Entscheidung 20.09.2026**, wörtlich: „zum handbuch: keine neu
version". Damit ist die Frage aus der ersten Fassung dieses Papiers
beantwortet — **kein Changelog-Eintrag, keine Versionserhöhung.**

**Das deckt sich mit der Regel im Kopf des Generators** (Betreiber-Vorgabe
12.08.2026): ein Changelog-Eintrag beantwortet NUR zwei Fragen — *was kann
der Anwender jetzt, was er vorher nicht konnte, und was ist für ihn besser
geworden?* — und „Eingeständnisse früherer Fehler im Text" gehören
ausdrücklich NICHT hinein. Eine Formulierungsschärfung beantwortet keine der
beiden Fragen.

**Gemessener Stand, den der Bau NICHT anfasst:** `CHANGELOG[0]` ist
`("2.9.11", "01.09.2026", …)`. `VERSION` und `STAND` werden daraus abgeleitet
und bleiben unverändert.

**Was daraus folgt und VOR dem Bau zu messen ist:** das ausgelieferte PDF
ändert dann seinen Inhalt, ohne dass sich die Versionsnummer ändert.
`ops/deploy.sh` baut es bei jedem Deploy neu (Schritt 8/8), also wird die
Änderung ausgeliefert — aber ein Wächter könnte auf „Inhalt geändert ⇒
Version muss steigen" bestehen.

**Zu messen, bevor gebaut wird:** `test_feature_handbuch_deploy_static.js`
und `test_feature_handbuch_namen.js` gegen den geänderten Generator laufen
lassen. Schlägt einer an, wird das GEMELDET und nicht umgangen — dann ist es
eine neue Lage und geht zurück an den Betreiber. **Nicht raten, nicht
abschalten, nicht „anpassen".**

*Nebenbei gemessen und für die Meldung wichtig:* `tools/baue_handbuch.py`
trägt im Kopf den Vorfall vom 11.08.2026 — Handbuch auf 2.9 gehoben und
gemergt, ausgeliefert blieb 2.8, und der Betreiber wurde fälschlich
informiert, der Deploy erledige das. Seither macht `ops/deploy.sh` es
automatisch. **Hier ist es umgekehrt: der Inhalt ändert sich, die Nummer
nicht.** Wer nach dem Merge prüft, prüft deshalb den PDF-INHALT, nicht die
Versionsnummer — `tools/live-check.sh` meldet nur letztere.

## 5. Harte Tore

1. **`bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`** — ohne Pipe, ohne
   äusseres `flock`, `echo` in eigener Zeile. Danach das Dateizahl-Ritual mit
   demselben Sieb auf BEIDEN Seiten (`── [^ ]+\.js ──`), `diff` EXIT 0.
2. **`npm run lint`** — Ergebnis wörtlich melden, auch bei Grün.
3. **Marker-Scan** mit `--exclude-dir=node_modules --exclude-dir=.git`,
   **Treffer zählen**. Sollwert in diesem Repo: **6**, alle in
   `docs/offene-befunde-31-08-2026.md`.
4. **Das PDF einmal wirklich bauen** (`python3 tools/baue_handbuch.py` in
   einem Wegwerf-Verzeichnis) und im Ergebnis nachsehen, dass beide neuen
   Formulierungen darin stehen. **Der Generator ist Python mit
   `\uXXXX`-Escapes — ein Tippfehler dort fällt in keinem JavaScript-Test
   auf.** Braucht `reportlab`; ist es nicht installiert, wird DAS gemeldet
   statt den Schritt stillschweigend zu überspringen.
5. **Committen und pushen, BEVOR auf einen Hintergrundlauf gewartet wird.**
6. **Kein Modellname** in Commit, PR-Titel oder -Rumpf.

---

## 6. Nach dem Merge

Ein Deploy läuft automatisch (GitHub Actions → `ops/deploy.sh`), und Schritt
8/8 baut das Handbuch dabei neu. **„Gemerged" ist trotzdem nicht
„ausgeliefert":** der Deploy-Lauf gehört angesehen (`actions_list` auf
`deploy.yml`, richtiger `head_sha`, `success`), und die ausgelieferte
Handbuch-Version prüft `tools/live-check.sh`.

*Der Vorfall vom 11.08.2026 steht als Begründung im Kopf von
`test_feature_handbuch_deploy_static.js`: das Handbuch wurde auf 2.9 gehoben
und gemergt — ausgeliefert blieb 2.8, und der Betreiber wurde fälschlich
informiert, der Deploy erledige das. Deshalb wird hier gemessen, nicht
angenommen.*
