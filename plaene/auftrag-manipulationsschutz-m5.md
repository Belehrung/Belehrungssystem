# Auftragspapier M5 — „Manipulationsschutz" im GymDocu-Repo

**Betreiber-Entscheidung 20.09.2026.** Wörtlich: „könnte man stattdessen auch
das wort ,manipulationsschutz' verwenden?" → „**ja nimm das so und schaue
auch in das handbuch ob da was bei der formulierung geämdert werden muss**".

**Repo: `Belehrung/Gymdocu`** (`/home/user/gymdocu`), Zweig `manipulationsschutz-m5`
von `master`. Die Startseite ist ein EIGENER Beitrag in einem anderen Repo
(`plaene/auftrag-landing-m3.md`, Abschnitt 6) — nicht vermischen.

---

## 0. Warum das kein Wortspiel ist

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

## 1. Die vier Stellen, im gemessenen Wortlaut

### M5-a — Handbuch, Verbandbuch-Kapitel

`tools/baue_handbuch.py:1008-1011`:

    "Jede Erste-Hilfe-Leistung im Studio muss dokumentiert werden – vom Pflaster
     bis zum Notarzteinsatz. Das Verbandbuch erfüllt diese Pflicht digital: Vorfälle
     werden direkt am Tablet erfasst, manipulationssicher gespeichert und im Admin
     eingesehen."

**SOLL:** `…erfasst, mit Manipulationsschutz gespeichert und im Admin eingesehen.`

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

**Wer hier mitändert, erzeugt einen Diff über zehn Dateien ohne eine einzige
Verhaltens- oder Textänderung für den Benutzer.** Die Trennung ist der Punkt:
geändert wird, was ein BENUTZER liest.

**`revisionssicher` bleibt ebenfalls** (kommt hier nicht vor, auf der
Startseite schon) — etablierter Fachbegriff aus den GoBD, eigene Bedeutung.

---

## 3. Die Zusicherung

**Vorher messen, wo sie hingehört.** Es gibt bereits Wächter auf die
Handbuchtexte (`test_feature_handbuch_namen.js`,
`test_feature_handbuch_deploy_static.js`, `test_feature_handbuch_navigation.js`)
und auf statische Quelltexte. **Keine neue Datei, wenn eine passende
existiert** — die Entscheidung gehört gemessen und im Bericht begründet.

**Gemessen und im Papier festgehalten: KEIN bestehender Wächter hängt an
diesen Wörtern.** `grep -rniE "manipulationssicher|fälschungssicher"` über
alle `test_*.js` findet nur **Kopfkommentare** (`test_feature_audit.js:1`,
`test_feature_audit_delete.js:2`), keine Zusicherung. Die Änderung reisst
nichts mit — und sie ist auch durch nichts bewacht, solange M5 nichts baut.

**Zuzusichern, in BEIDE Richtungen:**

* **NEGATIV:** In den vier geänderten Benutzertexten kommt
  `/manipulationssicher|fälschungssicher/i` **0×** vor.
  **Case-insensitiv** — gemessen am 20.09.2026 dreimal an einem Tag, dass ein
  case-sensitives Muster genau daran vorbeiläuft (`Fälschungssichere` statt
  `fälschungssicher`).
  **Geltungsbereich exakt benennen:** nur die vier Dateien aus Abschnitt 1,
  NICHT das ganze Repo — sonst schlägt die Zusicherung an den zehn
  Kommentaren aus Abschnitt 2 an und wird abgeschaltet statt gelesen.
* **POSITIV:** `Manipulationsschutz` kommt in `tools/baue_handbuch.py` **2×**,
  in `routes/admin/audit.js` **1×** und in `docs/SICHERHEIT.md` **1×** vor.
  Sollwerte von Hand hergeleitet aus Abschnitt 1, nicht aus dem Lauf
  abgeschrieben.
* **DIE EIGENTLICHE ZUSICHERUNG, und sie ist die wichtigere:** der ERKLÄRENDE
  Satz bleibt stehen. In `routes/admin/audit.js` muss weiterhin sinngemäß
  „die Prüfung deckt das sofort auf" stehen, im Handbuch „nachträgliche
  Veränderungen sind nachweisbar". **Grund:** ohne ihn wäre
  „Manipulationsschutz" allein genauso ungenau wie das alte Wort — der
  Präzisionsgewinn steckt im Nebensatz, nicht im Substantiv.

**Gegenproben, je einzeln, ROT/GRÜN wörtlich:**

1. Eine der vier Stellen auf das alte Wort zurückschreiben → Negativ- UND
   Positivzusicherung müssen fallen.
2. Den erklärenden Satz in `routes/admin/audit.js` entfernen → die dritte
   Zusicherung muss fallen. **Wenn sie es nicht tut, ist sie Dekoration** —
   dann widersprechen und eine andere herleiten.
3. `Manipulationsschutz` an EINER Stelle in `Manipulations-Schutz` ändern →
   die Positivzusicherung muss fallen (sie prüft die Schreibweise, die
   ausgeliefert wird, nicht eine ungefähre).

---

## 4. Die Handbuch-Frage, die ICH NICHT entscheide

`tools/baue_handbuch.py` leitet `VERSION`/`STAND` automatisch aus
`CHANGELOG[0]` ab, und `ops/deploy.sh` (Schritt 8/8) baut und veröffentlicht
das PDF **bei JEDEM Deploy**. Gemessen, aktueller Stand: `("2.9.11",
"01.09.2026", …)`.

**Die Regel für Changelog-Einträge** steht im Kopf des Generators
(Betreiber-Vorgabe 12.08.2026) und lautet sinngemäß: ein Eintrag beantwortet
NUR zwei Fragen — *was kann der Anwender jetzt, was er vorher nicht konnte,
und was ist für ihn besser geworden?* Ausdrücklich NICHT hinein gehören
„Eingeständnisse früherer Fehler im Text".

**Eine reine Formulierungsschärfung beantwortet keine der beiden Fragen.**

**Meine Empfehlung: KEIN Changelog-Eintrag, KEINE Versionserhöhung.** Der
Anwender kann nichts Neues; der Text wird genauer. Ein Eintrag wäre nach der
eigenen Regel ein Eingeständnis und gehörte nicht hinein.

**Was daraus folgt und vor dem Bau GEMESSEN werden muss:** das ausgelieferte
PDF ändert dann seinen Inhalt, ohne dass sich die Versionsnummer ändert.
**Bevor gebaut wird, ist zu messen, ob ein Wächter das verbietet** —
`test_feature_handbuch_deploy_static.js` und
`test_feature_handbuch_namen.js` sind die Kandidaten. Schlägt einer an, ist
die Empfehlung falsch und die Frage geht zurück an den Betreiber. **Nicht
raten, nicht umgehen.**

---

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
