#!/bin/sh
# test/session-start-hook-pruefen.sh — Prueft .claude/hooks/session-start.sh
# gegen Attrappen von pg_lsclusters/pg_ctlcluster im PATH, NICHT gegen den
# echten Cluster: diese Suite laeuft auch auf CI-Runnern, und CLAUDE.md
# ("Tests fassen weder echtes Dateisystem noch echte Prozesse an") verbietet
# Tests, die echte Dienste anfassen. Die Attrappen schreiben ihr eigenes
# argv in eine Datei — diese Datei ist zugleich der Beweis, dass das
# Richtige (und NUR das Richtige) aufgerufen wurde.
#
# Anlass und Grenzen: CLAUDE.md, Abschnitt Pruefstand-Regeln.
set -u

REPO_WURZEL=$(cd "$(dirname "$0")/.." && pwd) || exit 2
HOOK="$REPO_WURZEL/.claude/hooks/session-start.sh"
S="$REPO_WURZEL/.claude/settings.json"

TMP=$(mktemp -d) || exit 2
trap 'rm -rf "$TMP"' EXIT

fehler=0
laeuft=0

# Baut ein Verzeichnis mit Attrappen fuer pg_lsclusters (gibt $1 woertlich
# aus, zeichnet ihr eigenes argv in lsclusters.rec auf und beendet sich mit
# $3) und pg_ctlcluster (haengt seine Argumente an ctlcluster.rec an und
# beendet sich mit $2). Gibt den Verzeichnispfad auf stdout aus, nichts bei
# Fehler. Jeder cat/chmod-Schritt wird geprueft und bricht mit return 1 ab,
# statt Erfolg zu melden, wenn eine Attrappe halb geschrieben oder nicht
# ausfuehrbar blieb — sonst greift "command -v" im Aufrufer an ihr vorbei auf
# den echten /usr/bin/pg_ctlcluster (siehe ueberdeckt_pg_ctlcluster unten).
baue_fakebin() {
    # $1 = lsclusters-Ausgabe (woertlich, kann mehrzeilig sein)
    # $2 = Exit-Code, mit dem sich die Attrappe pg_ctlcluster beendet
    # $3 = Exit-Code, mit dem sich die Attrappe pg_lsclusters beendet
    #      (optional, Default 0 - fuer den Fall "pg_lsclusters scheitert")
    ls_rc=${3:-0}
    dir=$(mktemp -d "$TMP/fb.XXXXXX") || return 1
    printf '%s\n' "$1" > "$dir/lsclusters.out"
    cat > "$dir/pg_lsclusters" <<STUBEOF || return 1
#!/bin/sh
echo "\$*" >> "$dir/lsclusters.rec"
cat "$dir/lsclusters.out"
exit $ls_rc
STUBEOF
    cat > "$dir/pg_ctlcluster" <<STUBEOF || return 1
#!/bin/sh
echo "\$*" >> "$dir/ctlcluster.rec"
exit $2
STUBEOF
    chmod +x "$dir/pg_lsclusters" "$dir/pg_ctlcluster" || return 1
    printf '%s' "$dir"
}

# Zusichert, dass "command -v pg_ctlcluster" mit $1 vorn im PATH auf die
# Attrappe zeigt statt am echten /usr/bin/pg_ctlcluster vorbeizulaufen.
# Verteidigung gegen einen unbemerkten chmod/cat-Fehlschlag in baue_fakebin:
# dessen eigenes "return 1" sollte das schon abfangen, hier zusaetzlich vor
# jedem Hook-Lauf geprueft — ein Test, der den echten Cluster anfasst, ist
# genau das, was CLAUDE.md verbietet.
ueberdeckt_pg_ctlcluster() {
    # $1 = Fakebin-Verzeichnis
    [ "$(PATH="$1:$PATH" command -v pg_ctlcluster 2>/dev/null)" = "$1/pg_ctlcluster" ]
}

# Baut ein Verzeichnis mit NUR sh/sed/grep/cat/awk (per Symlink aus dem
# echten PATH) — pg_lsclusters/pg_ctlcluster fehlen darin bewusst, auch wenn
# das Postgres-Paket im echten PATH dieses Containers installiert ist. Aehn-
# liche Technik wie der nojq-Abschnitt in test/hooks-pruefen.sh, aber bewusst
# NICHT in eine gemeinsame Bibliothek gezogen: die beiden Listen verfolgen
# verschiedene Zwecke (dort "alles ausser jq", hier "alles ausser den
# Postgres-Werkzeugen") und wuerden bei einer gemeinsamen Fassung
# gegeneinander driften.
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
ZEILE_DOWN_RECOVERY_16='16 main 5432 down,recovery postgres /var/lib/postgresql/16/main /var/log/postgresql/postgresql-16-main.log'

echo "-- Fall 1: KERNFALL — ein down-Cluster wird gestartet und meldet den Erfolgstext --"
laeuft=$((laeuft + 1))
FB1=$(baue_fakebin "$ZEILE_DOWN_16" 0) || { echo "FEHL Fall 1: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB1" ] && ! ueberdeckt_pg_ctlcluster "$FB1"; then
    echo "FEHL Fall 1: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB1=""
fi
if [ -n "$FB1" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB1:$PATH" "$HOOK" 2>&1)
    rc=$?
    rec=$(cat "$FB1/ctlcluster.rec" 2>/dev/null)
    erfolgstext_da=0
    case "$out" in *"gestartet (war down)"*) erfolgstext_da=1 ;; esac
    if [ "$rc" = 0 ] && [ "$rec" = "16 main start" ] && [ "$erfolgstext_da" = 1 ]; then
        printf 'OK   Fall 1: rc=%s aufgezeichnet="%s" ausgabe="%s"\n' "$rc" "$rec" "$out"
    else
        printf 'FEHL Fall 1: rc=%s aufgezeichnet="%s" ausgabe="%s"\n' "$rc" "$rec" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 2: GEGENPROBE zu Fall 1 — online bleibt unangetastet --"
laeuft=$((laeuft + 1))
FB2=$(baue_fakebin "$ZEILE_ONLINE_16" 0) || { echo "FEHL Fall 2: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB2" ] && ! ueberdeckt_pg_ctlcluster "$FB2"; then
    echo "FEHL Fall 2: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB2=""
fi
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

echo "-- Fall 3: down,recovery wird ebenfalls gestartet (zusammengesetzter Status) --"
laeuft=$((laeuft + 1))
FB3=$(baue_fakebin "$ZEILE_DOWN_RECOVERY_16" 0) || { echo "FEHL Fall 3: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB3" ] && ! ueberdeckt_pg_ctlcluster "$FB3"; then
    echo "FEHL Fall 3: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB3=""
fi
if [ -n "$FB3" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB3:$PATH" "$HOOK" 2>&1)
    rc=$?
    rec=$(cat "$FB3/ctlcluster.rec" 2>/dev/null)
    if [ "$rc" = 0 ] && [ "$rec" = "16 main start" ]; then
        printf 'OK   Fall 3: rc=%s aufgezeichnet="%s"\n' "$rc" "$rec"
    else
        printf 'FEHL Fall 3: rc=%s aufgezeichnet="%s" ausgabe="%s"\n' "$rc" "$rec" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 4: mehrere Cluster, down zuerst — nur der down-Cluster wird gestartet --"
laeuft=$((laeuft + 1))
mehrzeilig="$ZEILE_DOWN_17
$ZEILE_ONLINE_16"
FB4=$(baue_fakebin "$mehrzeilig" 0) || { echo "FEHL Fall 4: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB4" ] && ! ueberdeckt_pg_ctlcluster "$FB4"; then
    echo "FEHL Fall 4: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB4=""
fi
if [ -n "$FB4" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB4:$PATH" "$HOOK" 2>&1)
    rc=$?
    rec=$(cat "$FB4/ctlcluster.rec" 2>/dev/null)
    if [ "$rc" = 0 ] && [ "$rec" = "17 main start" ]; then
        printf 'OK   Fall 4: rc=%s aufgezeichnet="%s"\n' "$rc" "$rec"
    else
        printf 'FEHL Fall 4: rc=%s aufgezeichnet="%s" ausgabe="%s"\n' "$rc" "$rec" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 5: zwei down-Cluster — Aufzeichnung enthaelt BEIDE Starts --"
laeuft=$((laeuft + 1))
zwei_down="$ZEILE_DOWN_16
$ZEILE_DOWN_17"
FB5=$(baue_fakebin "$zwei_down" 0) || { echo "FEHL Fall 5: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB5" ] && ! ueberdeckt_pg_ctlcluster "$FB5"; then
    echo "FEHL Fall 5: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB5=""
fi
if [ -n "$FB5" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB5:$PATH" "$HOOK" 2>&1)
    rc=$?
    rec=$(cat "$FB5/ctlcluster.rec" 2>/dev/null)
    erwartet="16 main start
17 main start"
    if [ "$rc" = 0 ] && [ "$rec" = "$erwartet" ]; then
        printf 'OK   Fall 5: rc=%s aufgezeichnet="%s"\n' "$rc" "$(printf '%s' "$rec" | tr '\n' ';')"
    else
        printf 'FEHL Fall 5: rc=%s aufgezeichnet="%s" ausgabe="%s"\n' "$rc" "$(printf '%s' "$rec" | tr '\n' ';')" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 6: faellt ohne Postgres-Werkzeuge offen aus --"
laeuft=$((laeuft + 1))
FB6=$(baue_ohne_postgres_pfad) || { echo "FEHL Fall 6: mktemp fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB6" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB6" "$HOOK" 2>&1)
    rc=$?
    if [ "$rc" = 0 ] && [ -z "$out" ]; then
        echo "OK   Fall 6: rc=0, keine Ausgabe (pg_lsclusters/pg_ctlcluster fehlen)"
    else
        printf 'FEHL Fall 6: rc=%s ausgabe="%s"\n' "$rc" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 7: pg_lsclusters scheitert — Hook bleibt exit 0 und meldet es --"
laeuft=$((laeuft + 1))
FB7=$(baue_fakebin "$ZEILE_DOWN_16" 0 1) || { echo "FEHL Fall 7: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB7" ] && ! ueberdeckt_pg_ctlcluster "$FB7"; then
    echo "FEHL Fall 7: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB7=""
fi
if [ -n "$FB7" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB7:$PATH" "$HOOK" 2>&1)
    rc=$?
    if [ "$rc" = 0 ] && [ -n "$out" ] && [ ! -s "$FB7/ctlcluster.rec" ]; then
        printf 'OK   Fall 7: rc=%s Hinweis="%s"\n' "$rc" "$out"
    else
        printf 'FEHL Fall 7: rc=%s ausgabe="%s"\n' "$rc" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 8: Start scheitert — Hook bleibt exit 0 und meldet den Fehlertext --"
laeuft=$((laeuft + 1))
FB8=$(baue_fakebin "$ZEILE_DOWN_16" 1) || { echo "FEHL Fall 8: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB8" ] && ! ueberdeckt_pg_ctlcluster "$FB8"; then
    echo "FEHL Fall 8: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB8=""
fi
if [ -n "$FB8" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB8:$PATH" "$HOOK" 2>&1)
    rc=$?
    fehlertext_da=0
    case "$out" in *"liess sich nicht automatisch starten"*) fehlertext_da=1 ;; esac
    if [ "$rc" = 0 ] && [ -n "$out" ] && [ "$fehlertext_da" = 1 ]; then
        printf 'OK   Fall 8: rc=%s Hinweis="%s"\n' "$rc" "$out"
    else
        printf 'FEHL Fall 8: rc=%s ausgabe="%s"\n' "$rc" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 9: nicht-remote — Hook ruehrt nichts an --"
laeuft=$((laeuft + 1))
FB9=$(baue_fakebin "$ZEILE_DOWN_16" 0) || { echo "FEHL Fall 9: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB9" ] && ! ueberdeckt_pg_ctlcluster "$FB9"; then
    echo "FEHL Fall 9: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB9=""
fi
if [ -n "$FB9" ]; then
    out=$( (unset CLAUDE_CODE_REMOTE; PATH="$FB9:$PATH" "$HOOK") 2>&1 )
    rc=$?
    if [ "$rc" = 0 ] && [ -z "$out" ] && [ ! -s "$FB9/ctlcluster.rec" ]; then
        echo "OK   Fall 9: CLAUDE_CODE_REMOTE fehlt — keine Ausgabe, pg_ctlcluster nicht aufgerufen"
    else
        rec_da=nein; [ -s "$FB9/ctlcluster.rec" ] && rec_da=ja
        printf 'FEHL Fall 9: rc=%s aufzeichnung-vorhanden=%s ausgabe="%s"\n' "$rc" "$rec_da" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 10: pg_lsclusters wird mit --no-header aufgerufen --"
laeuft=$((laeuft + 1))
FB10=$(baue_fakebin "$ZEILE_ONLINE_16" 0) || { echo "FEHL Fall 10: baue_fakebin fehlgeschlagen"; fehler=$((fehler + 1)); }
if [ -n "$FB10" ] && ! ueberdeckt_pg_ctlcluster "$FB10"; then
    echo "FEHL Fall 10: Attrappe ueberdeckt pg_ctlcluster nicht im PATH — Lauf abgebrochen statt den echten Cluster anzufassen"
    fehler=$((fehler + 1))
    FB10=""
fi
if [ -n "$FB10" ]; then
    out=$(CLAUDE_CODE_REMOTE=true PATH="$FB10:$PATH" "$HOOK" 2>&1)
    rc=$?
    rec_ls=$(cat "$FB10/lsclusters.rec" 2>/dev/null)
    if [ "$rc" = 0 ] && [ "$rec_ls" = "--no-header" ]; then
        printf 'OK   Fall 10: pg_lsclusters aufgerufen mit "%s"\n' "$rec_ls"
    else
        printf 'FEHL Fall 10: rc=%s aufgerufen-mit="%s" ausgabe="%s"\n' "$rc" "$rec_ls" "$out"
        fehler=$((fehler + 1))
    fi
fi

echo "-- Fall 11: Registrierung in .claude/settings.json erzwungen --"
laeuft=$((laeuft + 1))
sscmd=$(jq -r '.hooks.SessionStart[0].hooks[0].command // empty' "$S" 2>/dev/null)
if [ -z "$sscmd" ]; then
    echo "FEHL Fall 11: Kommando konnte nicht aus .hooks.SessionStart extrahiert werden (jq gescheitert, Datei fehlt oder Struktur geaendert) — $S"
    fehler=$((fehler + 1))
else
    case "$sscmd" in
        *.claude/hooks/session-start.sh*) ref_ok=1 ;;
        *) ref_ok=0 ;;
    esac
    if [ "$ref_ok" = 1 ] && [ -x "$HOOK" ]; then
        echo "OK   Fall 11: SessionStart-Hook registriert und ausfuehrbar ($HOOK)"
    else
        printf 'FEHL Fall 11: Kommando verweist nicht auf session-start.sh oder Datei nicht ausfuehrbar (command="%s")\n' "$sscmd"
        fehler=$((fehler + 1))
    fi
fi

echo
# Sollzahl von Hand gepflegt, NICHT aus dem Skript selbst abgeleitet (wie in
# test/hooks-pruefen.sh begruendet): ein Pruefstand, der aus Versehen weniger
# Faelle laufen laesst, meldet sonst trotzdem "0 Fehler" und meint eigentlich
# "nichts geprueft". Bei absichtlicher Erweiterung: hier mit hochzaehlen.
SOLL_FAELLE=11
if [ "$laeuft" -lt "$SOLL_FAELLE" ]; then
    echo "FEHLER: nur $laeuft von $SOLL_FAELLE erwarteten Faellen sind gelaufen — der Pruefstand ist blind, nicht sauber."
    fehler=$((fehler + 1))
fi

echo "== $laeuft Faelle geprueft, FEHLER GESAMT: $fehler =="
exit $((fehler > 0))
