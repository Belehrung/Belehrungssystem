#!/bin/sh
# test/hooks-pruefen.sh — Prueft beide PreToolUse-Waechter aus .claude/settings.json
# gegen echte Eingabe-JSON.
#
# Anlass (22.08.2026): Beide Waechter hatten an einem Tag fuenf nachgewiesene
# Maengel (A1-A4, C2) — gefunden ausschliesslich durch einen von Hand gebauten
# Pruefstand in einem Scratchpad, der mit dem Container verschwunden waere.
# Hausregel (CLAUDE.md, "Hooks und Werkzeuge, die sich selbst durchsetzen"):
# "Ein Hook, der nie ausgefuehrt wurde, ist eine Absichtserklaerung" und "Was
# eine Datei verspricht, muss das Werkzeug erzwingen, nicht die Prosa." Eine
# einmalige Messung ist keine Zusicherung — deshalb hier im Repo, damit sie
# bei jedem CI-Lauf erneut prueft.
#
# Erwartung je Fall: DENY oder PASS. Geprueft wird BEIDES — Entscheidung UND
# ob die Ausgabe gueltiges JSON ist (ein Hook, der abweist und dabei kaputtes
# JSON schreibt, blockiert die Sitzung).
#
# Extrahiert die Hook-Befehle per jq DIREKT aus der echten .claude/settings.json,
# nicht aus einer Kopie — nur so prueft dieses Skript, was tatsaechlich
# konfiguriert ist.
set -u

REPO_WURZEL=$(cd "$(dirname "$0")/.." && pwd) || exit 2
S="$REPO_WURZEL/.claude/settings.json"

TMP=$(mktemp -d) || exit 2
trap 'rm -rf "$TMP"' EXIT

jq -r '.hooks.PreToolUse[0].hooks[0].command' "$S" > "$TMP/pipe.sh" 2>/dev/null
jq -r '.hooks.PreToolUse[0].hooks[1].command' "$S" > "$TMP/www.sh" 2>/dev/null

fehler=0

# Harter Fehler statt stiller Durchlauf, wenn die Extraktion selbst schon
# scheitert (Datei fehlt, jq fehlt, oder die Struktur unter .hooks.PreToolUse
# hat sich geaendert): jq gibt bei einem fehlenden Pfad "null" aus, exit 0 —
# ohne diese Pruefung wuerden pipe.sh/www.sh leer oder "null" enthalten und
# JEDER einzelne Fall darunter wuerde uneinheitlich fehlschlagen, ohne dass
# die eigentliche Ursache (kaputte Extraktion) klar benannt waere.
for datei in "$TMP/pipe.sh" "$TMP/www.sh"; do
    inhalt=$(cat "$datei" 2>/dev/null)
    if [ -z "$inhalt" ] || [ "$inhalt" = "null" ]; then
        echo "FEHLER: Hook-Befehl konnte nicht aus $S extrahiert werden (Datei fehlt, jq fehlt, oder .hooks.PreToolUse[*].hooks[*].command passt nicht mehr) — $(basename "$datei") ist leer oder \"null\"."
        fehler=$((fehler + 1))
    fi
done
if [ "$fehler" -gt 0 ]; then
    echo
    echo "== FEHLER GESAMT: $fehler (Extraktion gescheitert, keine Faelle geprueft) =="
    exit 1
fi

laeuft=0

probe() {  # $1=hook-datei $2=erwartung(DENY|PASS) $3=beschreibung $4=befehl
    laeuft=$((laeuft + 1))
    out=$(printf '{"tool_input":{"command":%s}}' "$(printf '%s' "$4" | jq -Rs .)" | sh "$1" 2>&1)
    rc=$?
    if [ -n "$out" ]; then got=DENY; else got=PASS; fi
    jsonok=ok
    if [ -n "$out" ]; then
        printf '%s' "$out" | jq -e . >/dev/null 2>&1 || jsonok=KAPUTT
    fi
    if [ "$got" = "$2" ] && [ "$rc" = 0 ] && [ "$jsonok" = ok ]; then
        res="OK  "
    else
        res="FEHL"; fehler=$((fehler + 1))
    fi
    printf '%s erwartet=%-4s ist=%-4s rc=%s json=%-6s %s\n' "$res" "$2" "$got" "$rc" "$jsonok" "$3"
}

# Der geschuetzte Pfad wird NIE als Literal im Skript geschrieben, sondern
# zur Laufzeit zusammengebaut — sonst wuerde der Produktionsbaum-Waechter
# diese Zeile selbst als Schreibzugriff lesen und der Test wuerde von seinem
# eigenen Quelltext ausgesperrt.
PROD=$(printf '/var/%s' www)

echo "-- PIPE-WAECHTER --"
probe "$TMP/pipe.sh" DENY "A1 KERNFALL: tee verschluckt den Exit-Code" 'bash test/run.sh 2>&1 | tee /tmp/log.txt'
probe "$TMP/pipe.sh" DENY "A1: wc"                                     'bash test/run.sh | wc -l'
probe "$TMP/pipe.sh" DENY "A1: sed"                                    'bash test/run.sh | sed -n 1p'
probe "$TMP/pipe.sh" DENY "klassisch: tail"                            'bash test/run.sh | tail -30'
probe "$TMP/pipe.sh" DENY "A3: pipefail steht nur im Kommentar"        'bash test/run.sh | tail  # kein pipefail noetig'
probe "$TMP/pipe.sh" PASS "A2 FEHLALARM: ls + head (liest nur)"        'ls test/run.sh | head -1'
probe "$TMP/pipe.sh" PASS "A2 FEHLALARM: cat + grep (liest nur)"       'cat test/run.sh | grep -c PASS'
probe "$TMP/pipe.sh" PASS "A2 FEHLALARM: mein eigener Fall vom 22.08." 'bash test/run.sh > /tmp/s.txt 2>&1; echo "EXIT=$?"; grep -E "FAIL" /tmp/s.txt | head -20'
probe "$TMP/pipe.sh" PASS "echter Opt-out set -o pipefail"             'set -o pipefail; bash test/run.sh 2>&1 | tail -3'
probe "$TMP/pipe.sh" PASS "echter Opt-out PIPESTATUS"                  'bash test/run.sh | tail -3; echo ${PIPESTATUS[0]}'
probe "$TMP/pipe.sh" PASS "Alltagsbefehl ohne Testlauf"                'git status --short'
probe "$TMP/pipe.sh" PASS "Testlauf ohne Pipe"                         'bash test/run.sh > /tmp/s.txt 2>&1'

echo
echo "-- PRODUKTIONSBAUM-WAECHTER --"
probe "$TMP/www.sh" DENY "A4 KERNFALL: echo-Umleitung"       "echo x > $PROD/foo.txt"
probe "$TMP/www.sh" DENY "A4: relativer Pfad"                "cp foo.conf ../../$PROD/bar.conf"
probe "$TMP/www.sh" DENY "A4: tee"                           "echo x | tee $PROD/landing/index.html"
probe "$TMP/www.sh" DENY "A4: sed -i"                        "sed -i s/a/b/ $PROD/landing/index.html"
probe "$TMP/www.sh" DENY "A4: Umleitung, danach noch 2>&1"   "echo x > $PROD/y 2>&1"
probe "$TMP/www.sh" DENY "A4: install"                       "install -m644 x $PROD/landing/x"
probe "$TMP/www.sh" PASS "LESEN muss durch: ls"              "ls $PROD"
probe "$TMP/www.sh" PASS "LESEN muss durch: cat"             "cat $PROD/landing/index.html"
probe "$TMP/www.sh" PASS "LESEN muss durch: grep"            "grep -r foo $PROD"
probe "$TMP/www.sh" PASS "sed OHNE -i filtert nur"           "sed s/a/b/ $PROD/landing/index.html"
probe "$TMP/www.sh" PASS "cp anderswo"                       'cp a.txt b.txt'
probe "$TMP/www.sh" PASS "Alltagsbefehl"                     'git status --short'
probe "$TMP/www.sh" PASS "Wortgrenze myvar/wwwbackup"        'rm -rf /tmp/myvar/wwwbackup'
probe "$TMP/www.sh" PASS "FEHLALARM 1: Pruefstand-Zeile"      "probe www.sh \"A4\" 'sed -i s/a/b/ $PROD/landing/index.html'"
probe "$TMP/www.sh" PASS "FEHLALARM 2: Commit-Nachricht"      "git commit -F - <<'E'
Riegel deckt cp tee install sed -i unter $PROD ab
E"
probe "$TMP/www.sh" DENY "trotzdem gesperrt: echtes cp"       "cp /etc/hostname $PROD/x"
probe "$TMP/www.sh" DENY "trotzdem gesperrt: sudo-Praefix"    "sudo -u nobody cp /etc/hostname $PROD/x"
probe "$TMP/www.sh" DENY "trotzdem gesperrt: env-Praefix"     "env FOO=bar tee $PROD/x"

echo
echo "-- FAELLT OHNE jq OFFEN AUS? (Hausregel) --"
# nojq/ wird zur Laufzeit in $TMP angelegt (nicht im Repo abgelegt) und
# verschwindet mit dem trap oben. sed/grep/sh bleiben verfuegbar, NUR jq
# fehlt — sonst faellt der Test ueber sein eigenes fehlendes /bin/sh statt
# ueber das fehlende jq (eigener Fehler vom 22.08.2026). printf braucht keinen
# Symlink: printf ist unter dash ein eingebauter Befehl, keine externe Datei
# — ein Symlink darauf waere ohnehin nur ein kaputter Verweis auf sich selbst.
NOJQ="$TMP/nojq"
mkdir -p "$NOJQ"
for b in sh sed grep cat; do
    pfad=$(command -v "$b" 2>/dev/null) && [ -n "$pfad" ] && ln -s "$pfad" "$NOJQ/$b"
done
for h in "$TMP/pipe.sh" "$TMP/www.sh"; do
    laeuft=$((laeuft + 1))
    # stdout allein zaehlt: eine Fehlermeldung der Shell auf stderr (etwa
    # "jq: not found") ist kein Deny.
    out=$(printf '{"tool_input":{"command":"echo x > %s/foo"}}' "$PROD" | env PATH="$NOJQ" /bin/sh "$h" 2>/dev/null)
    rc=$?
    if [ "$rc" = 0 ] && [ -z "$out" ]; then
        echo "OK   $(basename "$h") faellt ohne jq offen aus (rc=0, keine Ausgabe)"
    else
        echo "FEHL $(basename "$h") rc=$rc ausgabe='$out'"; fehler=$((fehler + 1))
    fi
done

echo
# Sollzahl von Hand gepflegt, NICHT aus dem Skript selbst abgeleitet: eine
# automatische Ableitung (z. B. "zaehle die probe()-Aufrufe im Quelltext")
# waere tautologisch richtig, auch wenn die Haelfte der Faelle aus Versehen
# verschwindet. Nur ein unabhaengiger, hart eingetragener Wert faengt genau
# das ab, wovor CLAUDE.md warnt: "Leeres Ergebnis ist nicht sauberes
# Ergebnis" — ein Pruefstand, der aus Versehen weniger Faelle laufen laesst,
# meldet sonst trotzdem "0 Fehler" und meint eigentlich "nichts geprueft".
# Bei absichtlicher Erweiterung: hier mit hochzaehlen.
SOLL_FAELLE=32
if [ "$laeuft" -lt "$SOLL_FAELLE" ]; then
    echo "FEHLER: nur $laeuft von $SOLL_FAELLE erwarteten Faellen sind gelaufen — der Pruefstand ist blind, nicht sauber."
    fehler=$((fehler + 1))
fi

echo "== $laeuft Faelle geprueft, FEHLER GESAMT: $fehler =="
exit $((fehler > 0))
