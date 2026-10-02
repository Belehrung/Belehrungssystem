# Auftrag C6-H: SIGPIPE unter `pipefail` (Fassung 2, 02.10.2026)

Einordnung: nicht sehr komplex. Es ist ein Handgriff über viele Stellen, aber jede Stelle braucht ein eigenes Urteil.
Deshalb baut der Standard-Executer.

## Anlass (gemessen)

Die Master-CI auf `3e64dec` (Lauf 36954136952) war rot, und zwar in `test_feature_final_verification_verhalten.js`,
Fall 1 („alles grün“): `code=1`, `ok=false`. Der Baum ist identisch mit dem grünen PR-Lauf (`a0fab9a…`).
Lokal läuft der Test grün.

Die Ursache ist `port_listening()` in `ops/final-verification.sh:86-91`:

    ss -tln "sport = :$port" 2>/dev/null | grep -q ":$port" && return 0

Das Skript läuft unter `set -uo pipefail`. Das passiert dabei:

1. `grep -q` beendet sich beim ersten Treffer.
2. Schreibt `ss` danach noch etwas, stirbt es an SIGPIPE (Status 141).
3. `pipefail` macht die ganze Pipeline falsch, also meldet die Funktion „Port antwortet nicht“, obwohl er lauscht.

Die Attrappe `ss` im Test schreibt zwei Zeilen mit zwei `echo`. Port 3200 steht in der ersten Zeile, deshalb trifft es
nur ihn. Nachgemessen mit einer Attrappe, die 0,3 s Pause zwischen den beiden Zeilen macht:

- mit `pipefail`: 3200 NEIN, 3000 ja;
- ohne `pipefail`: beide ja.

Auf dem Server liefert das echte `ss` viele Zeilen. Derselbe Fehlalarm ist dort also ebenfalls möglich.

## Umfang

Alle Skripte im Repo, die `pipefail` setzen und einen früh endenden Leser hinter einer Pipe haben. Früh endende Leser
sind `grep -q`, `grep --quiet`, `grep -m1`, `head` und Ähnliches.

Ein grobes Muster (`git ls-files`, nur Dateien mit `pipefail`) fand 31 Kandidaten in 12 Dateien: `ops/deploy.sh`,
`ops/final-verification.sh`, `ops/gymdocu-file-restore-sample.sh`, `ops/gymdocu-pitr-restore-test.sh`,
`ops/gymdocu-restore-drill.sh`, `ops/gymdocu-schema-drift.sh`, `ops/gymdocu-wiederherstellen.sh`,
`ops/monitoring-alert.sh`, `ops/replica-verify.sh`, `ops/staging-smoke.sh`, `setup-staging.sh` und `test/run.sh`.

**Die Liste ist ein Hinweis, kein Befund.** Prüfe sie selbst mit einem besseren Muster. Auch mehrzeilige Pipes und
Pipes in Funktionen gehören dazu, ebenso Skripte, die `pipefail` erst später setzen. Melde die endgültige Zahl.

## Je Stelle entscheiden und im Bericht in einer Tabelle festhalten

Die Klasse hängt davon ab, wo der Status der Pipeline wirkt:

- **(a) Er entscheidet etwas** (`if`, `&&`, `||`, `!`, `while`). Das ist ein falsches Ergebnis wie bei
  `port_listening`, also ein echter Fehler. Beheben.
- **(b) Er steht in `$(…)` unter `set -e`.** Dann bricht das Skript ab, obwohl der Wert stimmt. Beheben.
- **(c) Er steht in `$(…)` ohne `set -e`, und der Status wirkt nirgends.** Das ist harmlos. Trotzdem einheitlich
  umbauen, wenn das ohne Verhaltensänderung geht. Sonst begründet stehen lassen (s. Wächter).

Für die Behebung gilt der Vorrang von oben nach unten:

1. **Die Pipe ganz vermeiden:**
   - `grep -m1 -E 'x' datei` statt `grep -E 'x' datei | head -1`;
   - `out="$(producer)"`, danach `grep -q … <<<"$out"` statt `producer | grep -q …`.
2. **Wo der Produzent nicht zu ersetzen ist** (`ls -t … | head -1`, `tar tzf … | grep | head`): den Status 141 des
   Produzenten ausdrücklich als Erfolg werten, z. B. `{ ls -t … 2>/dev/null || [ $? -eq 141 ]; } | head -1`. Andere
   Fehler dürfen NICHT verschluckt werden. Ein pauschales `|| true` ist nur zulässig, wo der Status heute schon
   bedeutungslos ist, und dann mit Begründung.

Kein Verhalten ändert sich ausser dem Wegfall des SIGPIPE-Fehlergebnisses. Die Ausgaben, Exit-Codes und JSON-Felder
der Skripte bleiben gleich.

**Nachgeschärft nach der Planprüfung (flash, 02.10.2026; jeder Punkt selbst nachgemessen):**

- **Unter `set -e` (`ops/deploy.sh:19`, `ops/staging-smoke.sh:2`, `setup-staging.sh:2`) darf Rezept 1 keinen neuen
  Abbruchpfad erzeugen (F4).** `out="$(producer)"` als eigene Anweisung bricht bei einem Fehler des Produzenten ab, wo
  heute nur die Bedingung falsch wird.
  - Der Status des Produzenten bleibt deshalb IN der Bedingung, z. B. `if out="$(git diff …)" && grep -q … <<<"$out";`
    bzw. `if ! { out="$(…)" && grep -q … <<<"$out"; }; then`.
  - Die Entscheidungstabelle (Produzent scheitert / Treffer / kein Treffer) bleibt je Stelle identisch. Belege das je
    Stelle.
- **Rezept 2 klammert genau den Prozess, der UNMITTELBAR vor dem früh endenden Leser steht (F3).**
  - Bei `tar tzf … | grep -E … | head -1` ist das `grep`, nicht `tar`.
  - Einfacher ist dort, die `tar`-Ausgabe erst in eine Variable zu lesen und dann zu filtern.
  - `grep -m1` hinter `tar` verschiebt das Problem nur auf `tar`.
- **`head -n -N` und `head -n +N` lesen bis zum Ende und sind KEINE früh endenden Leser (F2, `test/run.sh:959`).**
- **`grep -Eq` und jede Kurzoptionsgruppe mit `q` gehören dazu (F1).** `ops/staging-smoke.sh:108` steht in meiner Zählung
  (Klasse a).
- **Klasse (b) ist nach flash leer (F8).** Die drei `set -e`-Dateien tragen ihre Frühleser nur in `if`-Bedingungen.
  Bestätige oder widerlege das in der Tabelle.
- **Zwei Bestandstests nageln Wortlaute fest (F10):**
  - `test_feature_wiederherstellung_static.js:421` verlangt `grep -qE "$ZEITPUNKT_MUSTER"` (betrifft
    `ops/gymdocu-wiederherstellen.sh:84`);
  - `:481` verlangt `grep -q '"sauber":true'` (betrifft `:438`).

  Die Wächter werden FACHLICH umgestellt, nicht gestrichen. Halte sie auf der neuen Form, und eine Gegenprobe zeigt, dass
  sie weiter rot werden können.
- **Gesourcte Dateien (F7):** `ops/gymdocu-wiederherstellen-funktionen.sh` und `test/umgebung.sh` setzen selbst kein
  `pipefail`, laufen aber unter dem `pipefail` ihres Aufrufers. Der Wächter behandelt eine Datei als betroffen, wenn sie
  selbst `pipefail` setzt ODER von einer solchen Datei gesourct wird. Die Erkennung des Sourcens muss an einem bekannten
  Fall gelernt sein, nicht geraten.

## Tests

- **Regression für `final-verification.sh` (nachgeschärft nach F9, F11):**
  - Fall 1 sichert zusätzlich `prod_port_3200` und `prod_port_3000` ausdrücklich als `true` zu.
  - Ein neuer Negativfall: Die `ss`-Attrappe listet einen Port NICHT, dann ist genau dieser Check `false`. Sonst bliebe
    ein „Fix“ `return 0` grün.
  - Erwartet vor dem Fix: Fall 1 UND Fall 2 rot (Fall 2: `EXIT 2` fällt, weil `prod_port_3200` rot wird).
  - Danach: alle Fälle wie zugesichert.
- **Regression, Grundform:** Die `ss`-Attrappe in `test_feature_final_verification_verhalten.js`
  bekommt eine Pause zwischen den Zeilen. Damit tritt der Wettlauf sicher auf, nicht nur zufällig.
  - Gegenprobe: alte `port_listening` → Fall 1 rot. Fix → grün. Beides wörtlich melden.
  - Die Pause bleibt kurz (≤ 0,3 s). Kein `sleep` im Testprozess selbst, nur in der Attrappe.
- **Für jede Stelle der Klasse (a):** Wo sich die Stelle mit vertretbarem Aufwand in einem bestehenden Verhaltenstest
  erreichen lässt, dieselbe Art Attrappe. Wo nicht, sagt der Bericht das je Stelle.
- **Statischer Wächter** `test_feature_sigpipe_pipefail_static.js` (in `test/run.sh` registrieren):
  - Er liest die Shell-Dateien aus `git ls-files` (Endung `.sh` ODER Shebang `bash`/`sh`). Die Mengenzusicherung darf
    NICHT beide Seiten aus demselben `git ls-files`-Lauf ziehen (F6). Vorbild ist
    `test_feature_run_sh_registrierung_static.js`: eine unabhängige Quelle (Dateisystem-Lauf über den Baum, ohne
    `node_modules`/`.git`) wird gegen die `git ls-files`-Menge gehalten, Ausnahmen begründet.
  - Die Prüffunktion nimmt eine Dateiliste. Fixturen gehen in der Produktionsform durch dieselbe Funktion (Wegwerfdatei,
    absoluter Pfad), nicht durch den Repo-Scan.
  - Er greift in Dateien mit `pipefail` und meldet jeden früh endenden Leser hinter einer Pipe.
  - Eine Kommentarzeile ist eine, deren erstes Nicht-Leerzeichen `#` ist; `#` mitten in der Zeile (z. B.
    `final-verification.sh:109`, `"Merge pull request #${num} "`) ist KEIN Kommentar (F5).
  - Die Positivkontrolle sucht eine namentliche Nadel. Vor dem Fix ist das die bekannte Zeile `port_listening`, danach
    eine Fixtur. „Irgendetwas bleibt übrig“ genügt nicht.
  - Ausnahme nur mit der Markierung `# sigpipe-geprueft: <Grund>` auf derselben Zeile.
  - Gegenproben, je einzeln wörtlich:
    - die alte `port_listening` zurück → rot;
    - eine Fixtur mit `pipefail` und `| head -1` → rot;
    - dieselbe Fixtur ohne `pipefail` → grün;
    - eine Markierung ohne Grund → rot.
  - Der Wächter zählt die gescannten Dateien als MENGE gegen `git ls-files` (Hausregel „Zahl ist keine Menge“).

## Rahmen

- Eigener Arbeitsbaum `/workspace/gymdocu-c6h` auf einem neuen Zweig `c6h-sigpipe` ab `origin/master`.
- Einzeltests nur mit eigener DB `gymdocu_c6h_test`.
- Volle Suite: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`. Die Sperrdatei nie löschen, kein äusseres
  `flock`. Danach das Dateizahl-Ritual.
- Tests fassen weder echte Dienste noch `/var`, `/usr/local/bin` an. Alles läuft über Attrappen unter Wegwerfwurzeln.
- Commits ohne Modellnamen. Pushen ja, keinen PR anlegen.

Planprüfung: `plaene/auftrag-c6h-sigpipe.md` Fassung 1, flash 02.10.2026, 11 Befunde. 10 tragen (F2–F11). F1 trägt als
Befund gegen MEINE Zählung nicht: `ops/staging-smoke.sh:108` stand darin, nur der Fliesstext nannte die Form nicht.
Kosten 0,40 $.

-- Ende des Auftrags --
