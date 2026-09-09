#!/bin/sh
# test/session-start-hook-pruefen.sh — Prueft .claude/hooks/session-start.sh
# gegen Attrappen von pg_lsclusters/pg_ctlcluster im PATH, NICHT gegen den
# echten Cluster: diese Suite laeuft auch auf CI-Runnern, und CLAUDE.md
# ("Tests fassen weder echtes Dateisystem noch echte Prozesse an") verbietet
# Tests, die echte Dienste anfassen. Die Attrappe fuer pg_ctlcluster schreibt
# ihre Argumente in eine Datei — diese Datei ist zugleich der Beweis, dass
# das Richtige (und NUR das Richtige) aufgerufen wurde.
#
# Anlass (09.09.2026): Der PostgreSQL-Cluster ist in einer frischen Sitzung
# "down"; ein SessionStart-Hook faehrt ihn hoch, damit die GymDocu-Testsuite
# nicht am allerersten Aufruf mit "connection refused" scheitert — das sieht
# wie ein echter Testfehler aus, ist aber ein reines Umgebungsproblem.
# Hausregel (CLAUDE.md, "Hooks und Werkzeuge, die sich selbst durchsetzen"):
# "Ein Hook, der nie ausgefuehrt wurde, ist eine Absichtserklaerung" — deshalb
# hier im Repo, damit CI ihn bei jedem Lauf erneut prueft, statt sich auf eine
# einmalige Messung im Scratchpad zu verlassen.
set -u

REPO_WURZEL=$(cd "$(dirname "$0")/.." && pwd) || exit 2
HOOK="$REPO_WURZEL/.claude/hooks/session-start.sh"
S="$REPO_WURZEL/.claude/settings.json"

TMP=$(mktemp -d) || exit 2
trap 'rm -rf "$TMP"' EXIT

fehler=0
laeuft=0

# Baut ein Verzeichnis mit Attrappen fuer pg_lsclusters (gibt $1 woertlich
# aus, unabhaengig von dessen Argumenten) und pg_ctlcluster (haengt seine
# Argumente an ctlcluster.rec an und beendet sich mit $2). Gibt den
# Verzeichnispfad auf stdout aus, nichts bei Fehler.
baue_fakebin() {
    # $1 = lsclusters-Ausgabe (woertlich, kann mehrzeilig sein)
    # $2 = Exit-Code, mit dem sich die Attrappe pg_ctlcluster beendet
    dir=$(mktemp -d "$TMP/fb.XXXXXX") || return 1
    printf '%s\n' "$1" > "$dir/lsclusters.out"
    cat > "$dir/pg_lsclusters" <<STUBEOF
#!/bin/sh
cat "$dir/lsclusters.out"
STUBEOF
    cat > "$dir/pg_ctlcluster" <<STUBEOF
#!/bin/sh
echo "\$*" >> "$dir/ctlcluster.rec"
exit $2
STUBEOF
    chmod +x "$dir/pg_lsclusters" "$dir/pg_ctlcluster"
    printf '%s' "$dir"
}

# Baut ein Verzeichnis mit NUR sh/sed/grep/cat/awk (per Symlink aus dem
# echten PATH) — pg_lsclusters/pg_ctlcluster fehlen darin bewusst, auch wenn
# das Postgres-Paket im echten PATH dieses Containers installiert ist. Selbe
# Technik wie der nojq-Abschnitt in test/hooks-pruefen.sh.
baue_ohne_postgres_pfad() {
    dir=$(mktemp -d "$TMP/nopg.XXXXXX") || return 1
    for b in sh sed grep cat awk; do
        pfad=$(command -v "$b" 2>/dev/null) && [ -n "$pfad" ] && ln -s "$pfad" "$dir/$b"
    done
    printf '%s' "$dir"
}

ZEILE_ONLINE_16='16 main 5432 online postgres /var/lib/postgresql/16/main /var/log/postgresql/postgresql-16-main.log'
ZEILE_DOWN_16='16 main 5432 down postgres /var/lib/postgresql/16/main /var/log/postgresql/postgresql-16-main.log'
ZEILE_DOWN_17='17 main 5433 down postgres /var/lib/postgresql/17/main /var/log/postgresql/postgresql-17-main.log'

echo "-- Fall 1: KERNFALL — ein down-Cluster wird gestartet --"
laeuft=$((laeuft + 1))
FB1=$(baue_fakebin "$ZEILE_DOWN_16" 0) || { echo "FEHL Fall 1: mktemp fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB1" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB1:$PATH" "$HOOK" 2>&1)
    rc=$?
    rec=$(cat "$FB1/ctlcluster.rec" 2>/dev/null)
    if [ "$rc" = 0 ] && [ "$rec" = "16 main start" ]; then
        printf 'OK   Fall 1: rc=%s aufgezeichnet="%s"\n' "$rc" "$rec"
    else
        printf 'FEHL Fall 1: rc=%s aufgezeichnet="%s" ausgabe="%s"\n' "$rc" "$rec" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 2: GEGENPROBE zu Fall 1 — online bleibt unangetastet --"
laeuft=$((laeuft + 1))
FB2=$(baue_fakebin "$ZEILE_ONLINE_16" 0) || { echo "FEHL Fall 2: mktemp fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB2" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB2:$PATH" "$HOOK" 2>&1)
    rc=$?
    if [ "$rc" = 0 ] && [ ! -s "$FB2/ctlcluster.rec" ] && [ -z "$out" ]; then
        echo "OK   Fall 2: pg_ctlcluster nicht aufgerufen, keine Ausgabe"
    else
        rec_da=nein; [ -s "$FB2/ctlcluster.rec" ] && rec_da=ja
        printf 'FEHL Fall 2: rc=%s aufzeichnung-vorhanden=%s ausgabe="%s"\n' "$rc" "$rec_da" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 3: mehrere Cluster — nur der down-Cluster wird gestartet --"
laeuft=$((laeuft + 1))
mehrzeilig="$ZEILE_ONLINE_16
$ZEILE_DOWN_17"
FB3=$(baue_fakebin "$mehrzeilig" 0) || { echo "FEHL Fall 3: mktemp fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB3" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB3:$PATH" "$HOOK" 2>&1)
    rc=$?
    rec=$(cat "$FB3/ctlcluster.rec" 2>/dev/null)
    if [ "$rc" = 0 ] && [ "$rec" = "17 main start" ]; then
        printf 'OK   Fall 3: rc=%s aufgezeichnet="%s"\n' "$rc" "$rec"
    else
        printf 'FEHL Fall 3: rc=%s aufgezeichnet="%s" ausgabe="%s"\n' "$rc" "$rec" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 4: faellt ohne Postgres-Werkzeuge offen aus --"
laeuft=$((laeuft + 1))
FB4=$(baue_ohne_postgres_pfad) || { echo "FEHL Fall 4: mktemp fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB4" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB4" "$HOOK" 2>&1)
    rc=$?
    if [ "$rc" = 0 ] && [ -z "$out" ]; then
        echo "OK   Fall 4: rc=0, keine Ausgabe (pg_lsclusters/pg_ctlcluster fehlen)"
    else
        printf 'FEHL Fall 4: rc=%s ausgabe="%s"\n' "$rc" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 5: Start scheitert — Hook bleibt trotzdem exit 0 und gibt einen Hinweis --"
laeuft=$((laeuft + 1))
FB5=$(baue_fakebin "$ZEILE_DOWN_16" 1) || { echo "FEHL Fall 5: mktemp fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB5" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB5:$PATH" "$HOOK" 2>&1)
    rc=$?
    if [ "$rc" = 0 ] && [ -n "$out" ]; then
        printf 'OK   Fall 5: rc=%s Hinweis="%s"\n' "$rc" "$out"
    else
        printf 'FEHL Fall 5: rc=%s ausgabe="%s"\n' "$rc" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 6: nicht-remote — Hook ruehrt nichts an --"
laeuft=$((laeuft + 1))
FB6=$(baue_fakebin "$ZEILE_DOWN_16" 0) || { echo "FEHL Fall 6: mktemp fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB6" ]; then
    out=$( (unset CLAUDE_CODE_REMOTE; PATH="$FB6:$PATH" "$HOOK") 2>&1 )
    rc=$?
    if [ "$rc" = 0 ] && [ -z "$out" ] && [ ! -s "$FB6/ctlcluster.rec" ]; then
        echo "OK   Fall 6: CLAUDE_CODE_REMOTE fehlt — keine Ausgabe, pg_ctlcluster nicht aufgerufen"
    else
        rec_da=nein; [ -s "$FB6/ctlcluster.rec" ] && rec_da=ja
        printf 'FEHL Fall 6: rc=%s aufzeichnung-vorhanden=%s ausgabe="%s"\n' "$rc" "$rec_da" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 7: Registrierung in .claude/settings.json erzwungen --"
laeuft=$((laeuft + 1))
sscmd=$(jq -r '.hooks.SessionStart[0].hooks[0].command // empty' "$S" 2>/dev/null)
if [ -z "$sscmd" ]; then
    echo "FEHL Fall 7: Kommando konnte nicht aus .hooks.SessionStart extrahiert werden (jq gescheitert, Datei fehlt oder Struktur geaendert) — $S"
    fehler=$((fehler + 1))
else
    case "$sscmd" in
        *.claude/hooks/session-start.sh*) ref_ok=1 ;;
        *) ref_ok=0 ;;
    esac
    if [ "$ref_ok" = 1 ] && [ -x "$HOOK" ]; then
        echo "OK   Fall 7: SessionStart-Hook registriert und ausfuehrbar ($HOOK)"
    else
        printf 'FEHL Fall 7: Kommando verweist nicht auf session-start.sh oder Datei nicht ausfuehrbar (command="%s")\n' "$sscmd"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 8: PreToolUse-Waechter sind noch da (Umbau hat sie nicht zerschossen) --"
laeuft=$((laeuft + 1))
pt=$(jq -e '.hooks.PreToolUse[0].hooks[1].command' "$S" 2>/dev/null)
rc=$?
if [ "$rc" = 0 ] && [ -n "$pt" ]; then
    echo "OK   Fall 8: .hooks.PreToolUse[0].hooks[1].command weiterhin vorhanden"
else
    echo "FEHL Fall 8: .hooks.PreToolUse[0].hooks[1].command fehlt oder ist null — Umbau hat die Waechter zerstoert"
    fehler=$((fehler + 1))
fi

echo
# Sollzahl von Hand gepflegt, NICHT aus dem Skript selbst abgeleitet (wie in
# test/hooks-pruefen.sh begruendet): ein Pruefstand, der aus Versehen weniger
# Faelle laufen laesst, meldet sonst trotzdem "0 Fehler" und meint eigentlich
# "nichts geprueft". Bei absichtlicher Erweiterung: hier mit hochzaehlen.
SOLL_FAELLE=8
if [ "$laeuft" -lt "$SOLL_FAELLE" ]; then
    echo "FEHLER: nur $laeuft von $SOLL_FAELLE erwarteten Faellen sind gelaufen — der Pruefstand ist blind, nicht sauber."
    fehler=$((fehler + 1))
fi

echo "== $laeuft Faelle geprueft, FEHLER GESAMT: $fehler =="
exit $((fehler > 0))
