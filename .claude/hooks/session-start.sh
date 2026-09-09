#!/bin/sh
# .claude/hooks/session-start.sh — startet beim Sitzungsstart jeden
# PostgreSQL-Cluster, der "down" ist.
#
# Anlass (09.09.2026): In einer frischen Sitzung ist der PostgreSQL-16-Cluster
# im Arbeitscontainer nicht gestartet (pg_lsclusters meldet "down"). Die
# Testsuite des GymDocu-Repos (liegt nicht in diesem Repo) scheitert dadurch
# beim allerersten Aufruf mit "connection refused" — das sieht wie ein echter
# Testfehler aus, ist aber ein reines Umgebungsproblem.
#
# Der Cluster ist ein CONTAINER-weiter Dienst: einmal je Sitzung gestartet,
# gilt er fuer alle Arbeitsbaeume und alle Subagenten derselben Sitzung.
# Deshalb steht dieser Hook im Steuer-Repo, dessen .claude/settings.json laut
# CLAUDE.md "fuer die ganze Sitzung" gilt — auch wenn die Testsuite selbst
# in einem anderen Repo liegt.
#
# Nur im Arbeitscontainer aktiv (CLAUDE_CODE_REMOTE=true): auf einem
# persoenlichen Rechner waere das ungefragte Hochfahren eines Systemdienstes
# ein Eingriff, der dort gar nicht gebraucht wird — das Problem tritt nur im
# Arbeitscontainer auf.
#
# Hausregel "Ein Hook muss offen ausfallen": dieses Skript beendet sich in
# JEDEM Fall mit exit 0, auch bei jedem Fehler — ein SessionStart-Hook, der
# rot wird, stoert den Sitzungsstart. Deshalb bewusst kein "set -e".

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
    exit 0
fi

if ! command -v pg_lsclusters >/dev/null 2>&1 || ! command -v pg_ctlcluster >/dev/null 2>&1; then
    exit 0
fi

ausgabe=$(pg_lsclusters --no-header 2>/dev/null) || exit 0

# Spalten von "pg_lsclusters --no-header": 1=Version 2=Cluster 3=Port
# 4=Status(online|down) 5=Besitzer 6=Datenverzeichnis 7=Log. Nicht auf
# "16 main" festverdrahten — ueber die Zeilen laufen, jeder Cluster zaehlt.
printf '%s\n' "$ausgabe" | while IFS= read -r zeile; do
    [ -n "$zeile" ] || continue
    version=$(printf '%s' "$zeile" | awk '{print $1}')
    cluster=$(printf '%s' "$zeile" | awk '{print $2}')
    status=$(printf '%s' "$zeile" | awk '{print $4}')
    [ -n "$version" ] && [ -n "$cluster" ] || continue
    [ "$status" = "down" ] || continue

    if pg_ctlcluster "$version" "$cluster" start >/dev/null 2>&1; then
        echo "PostgreSQL-Cluster $version/$cluster gestartet (war down)."
    else
        echo "PostgreSQL-Cluster $version/$cluster war down und liess sich nicht automatisch starten — von Hand: pg_ctlcluster $version $cluster start (oder: service postgresql start)."
    fi
done

exit 0
