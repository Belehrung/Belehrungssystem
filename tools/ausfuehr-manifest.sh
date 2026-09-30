#!/bin/bash
# tools/ausfuehr-manifest.sh — Datei-Liste der Kopie fuer das Manifest der
# ausfuehrenden Pruefspur. EINE Datei fuer beide Seiten: der Elternprozess
# (tools/ausfuehr-spur.js, manifestSchreiben) ruft sie gegen die frische
# Kopie, PID 1 im Kind (tools/ausfuehr-aufbau.sh, manifest_pruefen) gegen
# /dsv1/kopie nach Vorbereitung und Umgebung; verglichen wird byteweise.
#
# Je Eintrag EIN NUL-terminierter Satz aus laengenpraefixierten Feldern
# (Typ, Pfad, Symlink-Ziel): "1:l7:./S1.js9:lib/x.js\0". Ein Zeilenumbruch
# in Pfad oder Ziel kann so weder einen Satz vortaeuschen noch eine
# Feldgrenze verschieben (Runde 3 der Diffpruefung, Befund 3 — gemessen
# 30.09.2026: mit '%y %p %l\n' war "S2 geloescht, Ziel von S1 :=
# 'a\nl ./S2 a'" von der unveraenderten Liste nicht zu unterscheiden).
# Sortiert als NUL-Saetze unter LC_ALL=C (Byteordnung), damit Host- und
# tmpfs-Reihenfolge keine Rolle spielen. node_modules bleibt aussen vor
# (dort haengt ro der Baum des Zielrepos).
set -u
export LC_ALL=C
cd "${1:?Verzeichnis}" || exit 2
mapfile -d '' -t felder < <(find . -path ./node_modules -prune -o -printf '%y\0%p\0%l\0')
n=${#felder[@]}
(( n > 0 && n % 3 == 0 )) || { echo "ausfuehr-manifest: $n Felder, erwartet ein Vielfaches von 3 (> 0)" >&2; exit 3; }
for ((i = 0; i < n; i += 3)); do
    y=${felder[i]}; p=${felder[i + 1]}; l=${felder[i + 2]}
    printf '%d:%s%d:%s%d:%s\0' "${#y}" "$y" "${#p}" "$p" "${#l}" "$l"
done | sort -z
