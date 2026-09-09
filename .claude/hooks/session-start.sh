#!/bin/sh
# .claude/hooks/session-start.sh — startet beim Sitzungsstart jeden
# PostgreSQL-Cluster, der "down" ist (auch mit angehaengtem Zusatzstatus wie
# "down,recovery" oder "down,binaries_missing"). Faellt offen aus: exit 0 in
# jedem Fall, auch bei jedem Fehler (deshalb kein "set -e") — ein
# SessionStart-Hook, der rot wird, stoert den Sitzungsstart. Laeuft nur bei
# CLAUDE_CODE_REMOTE=true.
#
# Anlass und Grenzen: CLAUDE.md, Abschnitt Pruefstand-Regeln.

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
    # Auf einem persoenlichen Rechner waere das ungefragte Hochfahren eines
    # Systemdienstes ein Eingriff, der dort gar nicht gebraucht wird.
    exit 0
fi

if ! command -v pg_lsclusters >/dev/null 2>&1 || ! command -v pg_ctlcluster >/dev/null 2>&1; then
    exit 0
fi

if ! ausgabe=$(pg_lsclusters --no-header 2>/dev/null); then
    echo "pg_lsclusters ist gescheitert — von Hand nachsehen: pg_lsclusters (oder: service postgresql status)."
    exit 0
fi

# Spalten von "pg_lsclusters --no-header": 1=Version 2=Cluster 3=Port
# 4=Status 5=Besitzer 6=Datenverzeichnis 7=Log. Nicht auf "16 main"
# festverdrahten — ueber die Zeilen laufen, jeder Cluster zaehlt. Status ist
# zusammengesetzt (pg_lsclusters selbst haengt ",recovery"/",binaries_missing"/
# ... an "down" an) — deshalb Praefix-Vergleich per case, nicht Gleichheit.
# Feld-Splitting per read statt dreier awk-Aufrufe je Zeile: gleiches
# Verhalten (Standard-IFS trennt an Weissraum wie awk), weniger Unterprozesse,
# und die command-v-Pruefung oben verlangt awk gar nicht erst — auf einem
# Abbild ohne awk waere der Hook bisher still leergelaufen. port/rest werden
# nicht gebraucht, muessen aber als eigene Variablen dastehen, damit status
# das vierte Feld trifft.
printf '%s\n' "$ausgabe" | while read -r version cluster port status rest; do
    [ -n "$version" ] && [ -n "$cluster" ] || continue
    case "$status" in
        down|down,*) ;;
        *) continue ;;
    esac

    if pg_ctlcluster "$version" "$cluster" start >/dev/null 2>&1; then
        echo "PostgreSQL-Cluster $version/$cluster gestartet (war down)."
    else
        echo "PostgreSQL-Cluster $version/$cluster war down und liess sich nicht automatisch starten — von Hand: pg_ctlcluster $version $cluster start (oder: service postgresql start)."
    fi
done

exit 0
