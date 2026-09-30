# Auftrag DeepSeek „Variante 1“ — ausführende Prüfspur mit festen Werkzeugen (30.09.2026, Fassung 1)

Betreiber-Entscheidung 26.09.2026 (CLAUDE.md, Abschnitt „Ausdrücklich NICHT übernommen“, Absatz „begrenzte Ausführung
für DeepSeek“). Repo: Belehrungssystem, Zweig `claude/gym-docu-codo-access-4q3bn0`, Datei `tools/gegenleser-repo.js`
(Selbsttest `--selbsttest` läuft in CI). Einordnung: **sehr komplex** — Sicherheitsgrenze (ein fremdes Modell löst
Codeausführung aus; ein Fehler kann Schlüssel preisgeben), und ein Werkzeug, das falsch grün meldet, entwertet jede
spätere Prüfung.

## Ziel

Die Lesespur (`--modell=deepseek-flash`) bekommt auf ausdrücklichen Schalter (`--ausfuehren=<pfad-zum-GymDocu-Baum>`)
ZWEI zusätzliche Werkzeuge, sonst nichts:

1. `teste(testdatei)` — eine in `test/run.sh` (Liste `TESTS=(`) registrierte Datei unmutiert laufen lassen.
2. `mutiere_und_teste(datei, alt, neu, testdateien[])` — in einer WEGWERFKOPIE genau EINE Stelle ersetzen (Abbruch mit
   Meldung bei 0 oder mehr als 1 Fundstelle von `alt`; `datei` muss in `git ls-files` stehen; `node --check` bei `.js`,
   sonst Abbruch „Mutation syntaktisch kaputt“), dann 1–3 registrierte Testdateien laufen lassen, danach die Kopie
   AUTOMATISCH zurücksetzen und die Rücknahme belegen (Prüfsumme der Datei gleich dem Original). Es gibt KEINEN Zustand
   zwischen zwei Aufrufen.

Kein freies Kommando, kein Schreiben ausserhalb der Wegwerfkopie, keine eigenen Skripte des Modells.

## Ausführungsumgebung (jeder Punkt gemessen, bevor er gilt)

- **Wegwerfkopie:** einmal je Lauf unter `/workspace/dsv1-<zufall>/` (`git worktree add --detach` vom angegebenen Baum
  auf dessen HEAD, `node_modules` als Kopie oder Symlink, `.env` NICHT kopieren); lesbar für den Testbenutzer, am Ende
  entfernt (`git worktree remove --force`), auch bei Abbruch (`finally`, Signal).
- **Prozess:** `unshare -n` (kein Netz — gemessen: curl scheitert) und `setpriv --reuid=65534 --regid=65534
  --clear-groups` (gemessen: `/tmp/claude-0/.deepseek-key` → Permission denied). Umgebung ausschliesslich: `PATH`,
  `HOME=/tmp/dsv1-home-<zufall>`, `TZ`, `NODE_ENV=test`, `DATABASE_URL` (Unix-Socket `/var/run/postgresql`, da der
  Netz-Namensraum kein TCP zum Host hat — messen), keine `*KEY*`/`*TOKEN*`/`*SECRET*`/`HTTPS_PROXY`-Variablen
  (zusichern). Zeitlimit je Testdatei (Standard 300 s, Prozessgruppe töten), Ausgabe höchstens N KB.
- **Sichtbarkeit:** eine Mutation IST Code, der als Testbenutzer läuft. Deshalb zusätzlich ein Mount-Namensraum
  (`unshare -m`): `/workspace`, `/home`, `/root`, `/tmp`, `/var/www` sind leer bzw. tmpfs, sichtbar ist nur die
  Wegwerfkopie (Bind-Mount), `node`, die Bibliotheken und `/var/run/postgresql`. Gemessen werden muss: aus dem
  Testprozess sind weder `/workspace/*/.env` (heute Rechte 644!) noch andere Arbeitsbäume noch `/tmp/claude-0` lesbar.
  Die Test-Rolle der Datenbank darf nur ihre Wegwerf-DB sehen (kein Superuser, `CONNECT` auf andere DBs entzogen oder
  eigene Rolle je Lauf — messen, was geht).
- **Datenbank:** je Testlauf eine frische DB `gymdocu_dsv1_<zufall>_test` (Endung `_test` Pflicht; nie `gymdocu_test`,
  nie ein Name ohne dieses Präfix), angelegt aus einer einmal je Lauf präparierten Vorlage (init + runMigrations wie
  `test/run.sh`), danach gedroppt. Kein Zugriff auf `/tmp/gymdocu-suite.lock`, kein `test/run.sh`.
- **Ausgabe:** jede Werkzeugantwort (stdout+stderr, Exit, PASS/FAIL-Zeile) durch den Geheimnis-Riegel
  (`tools/geheimnis-riegel.js`) wie die Lesewerkzeuge; die `DATABASE_URL` darf nie im Klartext zurückgehen.
- **Deckel:** höchstens M Testläufe je Sitzung (Schalter, Standard 40), Gesamtzeit-Deckel; Überschreitung → Werkzeug
  lehnt ab, das Modell wird informiert.
- **Protokoll:** jeder Aufruf mit Datei, Fundstelle, Testdateien, Exit, Zahlen, Dauer in die `--protokoll`-Datei.

## Zusicherungen (Selbsttest, ohne Netz und ohne Schlüssel, wie die bestehenden)

Je Riegel ein Fall mit ROT/GRÜN-Gegenprobe: 0/2 Fundstellen → Ablehnung; Datei ausserhalb `git ls-files` → Ablehnung;
nicht registrierte Testdatei → Ablehnung; Rücksetzen nach jedem Aufruf (Prüfsumme); Umgebung ohne Schlüssel-Variablen;
Testbenutzer kann `/tmp/claude-0` nicht lesen und hat kein Netz (echter Kindprozess, nicht nur Konstante); Deckel;
Geheimnis-Riegel auf der Ausgabe (ein Test, der eine Verbindungszeichenfolge ausgibt, kommt geschwärzt zurück);
Aufräumen der Kopie und der DBs auch bei Abbruch. Wo ein Fall root, Postgres oder `unshare` braucht, das CI aber nicht:
in CI SKIP mit Grund, lokal Pflicht (Muster „Vorbedingung nicht erfüllt ⇒ nie stilles EXIT 0“).

## Messung (Bericht)

Ein echter Lauf gegen `/workspace/gymdocu-dbinit` (DB-INIT, `test_feature_db_init_schema_stand.js`): Grundlauf
unmutiert und eine bekannte Mutation (z. B. `SET LOCAL lock_timeout` entfernt → ROT), beides wörtlich; Nachweis, dass
danach Kopie und DBs weg sind und `gymdocu_test` unberührt ist.

## Zustandsfrage

Welcher Zustand entsteht, den es vorher nicht gab: kann das Modell über die zwei Werkzeuge (Wahl von `alt`/`neu`,
Testdatei, Mutation in einer Testdatei selbst) etwas ausführen, lesen oder hinausschicken, das über „eine registrierte
Testdatei gegen eine Wegwerf-DB“ hinausgeht? Was passiert, wenn eine mutierte Datei beim Laden Code ausführt (die
Mutation IST Code)?

-- Ende des Auftrags --
