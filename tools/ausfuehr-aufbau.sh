#!/bin/bash
# tools/ausfuehr-aufbau.sh — PID 1 im Kind der ausfuehrenden Pruefspur
# (Auftrag "DeepSeek Variante 1", Teil W, 30.09.2026). Gestartet von
# tools/ausfuehr-spur.js als
#   timeout -k 5 <T> unshare --mount --net --pid --ipc --uts --fork
#           --kill-child --mount-proc bash tools/ausfuehr-aufbau.sh <laufdir>
# mit einer KONSTRUIERTEN Umgebung (nur PATH), als root. Es baut eine NEUE
# Wurzel auf tmpfs zusammen, wechselt per pivot_root hinein und faehrt die
# Stufen der Testsuite EINZELN, jede als unprivilegierter Benutzer 65534,
# jede mit eigenem Exit-Code (Exit-Vertrag unten). Es exec't NICHT: als
# PID 1 wartet es auf die Stufe und beendet mit deren Code.
#
# EXIT-VERTRAG (die Zahlen sind Teil der Schnittstelle zu ausfuehr-spur.js;
# wer sie aendert, aendert dort STATUS_AUS_EXIT mit):
#   20  Aufbau (Einhaengen, pivot_root, lo) gescheitert     -> umgebung-fehler
#   21  Selbstmessung (als 65534) ROT                         -> Isolationsabbruch
#   22  test/db-vorbereiten.js != 0                          -> vorbereitung-gescheitert
#   23  test/umgebung.sh liefert return 1                    -> umgebung-fehler
#   24  Umgebungsnamen nach umgebung.sh weichen von der       -> Isolationsabbruch
#       Literalliste unten ab (Werkzeug-Befund)
#   30  dieses Skript selbst bekam TERM/INT/HUP                -> umgebung-fehler
#   sonst: der Exit der TESTSTUFE, aber NUR gueltig, wenn vorher die
#   Waechterdatei /dsv1/ergebnis/test-gestartet angelegt wurde (nur root
#   kann sie anlegen; ohne sie ist 0/1 kein Testergebnis). 0 = bestanden,
#   1 = gescheitert, >=129 = durch Signal, alles andere = umgebung-fehler.
#   124/137 kommen von timeout(1) und entstehen hier nie.
#
# Was das Kind sieht (und NICHTS sonst): ro /usr, /etc, /opt und die
# merged-usr-Verweise; rw die Kopie unter /dsv1/kopie mit ro node_modules
# des Zielbaums; ro /dsv1/werkzeug (Selbstmessung, Laufkonfiguration); den
# Socket-Ordner des Wegwerf-Clusters unter /dsv1/pg; /dsv1/ergebnis (nur
# root schreibt); tmpfs /tmp, /var/tmp, /run, /dev/shm; frisches /proc; ein
# minimales /dev. Alle Binds nosuid,nodev — mit --no-new-privs unten kann
# 65534 also auch ueber setuid-Programme nichts gewinnen.
#
# Die Sollwerte hier (ERWARTETE_NAMEN, SESSION_SECRET-Literal, uid 65534)
# sind von Hand geschrieben. Die Selbstmessung (tools/ausfuehr-selbstmessung.js)
# haelt EIGENE Literale dagegen — zwei Orte mit Absicht: eine Zusicherung,
# deren Sollwert aus der Konstruktion selbst kommt, kann nicht falsch werden.
set -u
export PATH=/usr/sbin:/usr/bin:/sbin:/bin

LAUF="${1:-}"
[ -n "$LAUF" ] && [ -d "$LAUF" ] || { echo "[dsv1] aufbau: Laufverzeichnis fehlt: '$LAUF'" >&2; exit 20; }

# Laufkonfiguration (von ausfuehr-spur.js geschrieben, KEY='wert', Werte ohne
# Apostroph — dort geprueft). Vor dem pivot_root gelesen; danach liegt sie
# unter /dsv1/werkzeug/lauf.conf.
# shellcheck disable=SC1091
. "$LAUF/werkzeug/lauf.conf" || exit 20
for pflicht in KOPIE NODE_MODULES WERKZEUG ERGEBNIS PG BROWSER NODE_BIN TESTDATEI SHA_TESTDATEI DATABASE_URL ORIGINALWURZEL; do
    eval "wert=\${$pflicht:-}"
    [ -n "$wert" ] || { echo "[dsv1] aufbau: Laufkonfiguration ohne $pflicht" >&2; exit 20; }
done

# Signal-Handler: als PID 1 wuerde ein TERM sonst still verschluckt. Alles
# im Namensraum toeten (-1 = alle ausser sich selbst), eigener Code.
trap 'kill -KILL -- -1 2>/dev/null; exit 30' TERM INT HUP

stufe() { echo "[dsv1] $*"; }
scheitern() { echo "[dsv1] AUFBAU GESCHEITERT: $*" >&2; exit 20; }

bind_ro() {
    mount --bind "$1" "$2" || return 1
    mount -o remount,bind,ro,nosuid,nodev "$2"
}
bind_rw() {
    mount --bind "$1" "$2" || return 1
    mount -o remount,bind,rw,nosuid,nodev "$2"
}
bind_rw_noexec() {
    mount --bind "$1" "$2" || return 1
    mount -o remount,bind,rw,nosuid,nodev,noexec "$2"
}

# ===== 1. Neue Wurzel zusammensetzen =====
mount --make-rprivate / || scheitern "make-rprivate"
R="$LAUF/wurzel"
[ -d "$R" ] || scheitern "Einhaengepunkt $R fehlt"
mount -t tmpfs -o size=256m,mode=755,nosuid,nodev tmpfs "$R" || scheitern "tmpfs Wurzel"
mkdir -p "$R/usr" "$R/etc" "$R/opt" "$R/proc" "$R/dev" "$R/tmp" "$R/run" "$R/var/tmp" \
         "$R/dsv1/kopie" "$R/dsv1/werkzeug" "$R/dsv1/ergebnis" "$R/dsv1/pg" "$R/oldroot" || scheitern "mkdir"
bind_ro /usr "$R/usr" || scheitern "bind /usr"
bind_ro /etc "$R/etc" || scheitern "bind /etc"
bind_ro /opt "$R/opt" || scheitern "bind /opt"
# merged-usr: /bin -> usr/bin usw. als Verweis nachbilden; ist eines davon
# auf diesem Host ein echtes Verzeichnis, wird es ro eingehaengt.
for l in bin sbin lib lib32 lib64 libx32; do
    if [ -L "/$l" ]; then
        ln -s "$(readlink "/$l")" "$R/$l" || scheitern "Verweis /$l"
    elif [ -d "/$l" ]; then
        mkdir "$R/$l" && bind_ro "/$l" "$R/$l" || scheitern "bind /$l"
    fi
done
# Node-Verzeichnis und Browserpfad, falls sie nicht schon unter /usr oder
# /opt liegen (CI-Werkzeugcache, eigene Installation): ro am selben Pfad.
for extra in "$NODE_BIN" "$BROWSER"; do
    case "$extra" in
        /usr/*|/opt/*) ;;
        /*) mkdir -p "$R$extra" && bind_ro "$extra" "$R$extra" || scheitern "bind $extra" ;;
        *) scheitern "kein absoluter Pfad: $extra" ;;
    esac
done
bind_rw "$KOPIE" "$R/dsv1/kopie" || scheitern "bind Kopie"
[ -d "$R/dsv1/kopie/node_modules" ] || scheitern "node_modules-Einhaengepunkt fehlt in der Kopie"
bind_ro "$NODE_MODULES" "$R/dsv1/kopie/node_modules" || scheitern "bind node_modules"
bind_ro "$WERKZEUG" "$R/dsv1/werkzeug" || scheitern "bind Werkzeug"
bind_rw_noexec "$ERGEBNIS" "$R/dsv1/ergebnis" || scheitern "bind Ergebnis"
bind_rw_noexec "$PG" "$R/dsv1/pg" || scheitern "bind Socket-Ordner"
mount -t tmpfs -o size=1g,mode=1777,nosuid,nodev tmpfs "$R/tmp" || scheitern "tmpfs /tmp"
mount -t tmpfs -o size=256m,mode=1777,nosuid,nodev tmpfs "$R/var/tmp" || scheitern "tmpfs /var/tmp"
mount -t tmpfs -o size=16m,mode=755,nosuid,nodev tmpfs "$R/run" || scheitern "tmpfs /run"
mount -t tmpfs -o size=64m,mode=755,nosuid,noexec tmpfs "$R/dev" || scheitern "tmpfs /dev"
mkdir "$R/dev/shm" || scheitern "mkdir /dev/shm"
mount -t tmpfs -o size=512m,mode=1777,nosuid,nodev tmpfs "$R/dev/shm" || scheitern "tmpfs /dev/shm"
for d in null zero random urandom; do
    : > "$R/dev/$d" && mount --bind "/dev/$d" "$R/dev/$d" || scheitern "Geraet /dev/$d"
done
ln -s /proc/self/fd "$R/dev/fd" && ln -s /proc/self/fd/0 "$R/dev/stdin" \
    && ln -s /proc/self/fd/1 "$R/dev/stdout" && ln -s /proc/self/fd/2 "$R/dev/stderr" || scheitern "Verweise /dev"
mount -t proc proc "$R/proc" || scheitern "proc"

# ===== 2. Hineinwechseln, alte Wurzel restlos loesen =====
cd "$R" || scheitern "cd Wurzel"
pivot_root . oldroot || scheitern "pivot_root"
cd / || scheitern "cd /"
umount -l /oldroot || scheitern "umount oldroot"
rmdir /oldroot || scheitern "rmdir oldroot"
ip link set lo up || scheitern "lo"

# ===== 3. Stufen als 65534, jede einzeln =====
SESSION_SECRET_LITERAL='ci-isolation-session-secret-0123456789abcdef'   # ci.yml:114 des Zielrepos
KIND_ENV=(
    "PATH=$NODE_BIN:/usr/bin:/bin"
    "HOME=/tmp"
    "CI=true"
    "TZ=UTC"
    "SESSION_SECRET=$SESSION_SECRET_LITERAL"
    "PLAYWRIGHT_BROWSERS_PATH=$BROWSER"
    "DATABASE_URL=$DATABASE_URL"
)
als_nobody() {
    setpriv --reuid=65534 --regid=65534 --clear-groups --no-new-privs env -i "${KIND_ENV[@]}" "$@"
}
cd /dsv1/kopie || scheitern "cd Kopie"

stufe "Stufe Selbstmessung"
als_nobody node /dsv1/werkzeug/ausfuehr-selbstmessung.js /dsv1/werkzeug/lauf.conf > /dsv1/ergebnis/selbstmessung.txt 2>&1
rc=$?
tail -n 1 /dsv1/ergebnis/selbstmessung.txt
if [ "$rc" -ne 0 ]; then
    cat /dsv1/ergebnis/selbstmessung.txt
    echo "[dsv1] SELBSTMESSUNG ROT (Exit $rc) — keine Ausfuehrung" >&2
    exit 21
fi

stufe "Stufe Vorbereitung (test/db-vorbereiten.js)"
als_nobody node test/db-vorbereiten.js > /dsv1/ergebnis/vorbereiten.txt 2>&1
rc=$?
if [ "$rc" -ne 0 ]; then
    cat /dsv1/ergebnis/vorbereiten.txt
    echo "[dsv1] VORBEREITUNG GESCHEITERT (Exit $rc)" >&2
    exit 22
fi

stufe "Stufe Umgebung (test/umgebung.sh)"
# Gesourct in einer Shell als 65534; deren Umgebung danach NUL-getrennt in
# eine Datei, die ROOT geoeffnet hat (das Kind schreibt nur in den
# geerbten Deskriptor). Fehlermeldungen von umgebung.sh gehen nach stderr.
als_nobody bash -c '. test/umgebung.sh 1>&2 || exit 3; env -0' > /dsv1/ergebnis/umgebung.env 2> /dsv1/ergebnis/umgebung.txt
rc=$?
if [ "$rc" -ne 0 ]; then
    cat /dsv1/ergebnis/umgebung.txt
    echo "[dsv1] UMGEBUNG GESCHEITERT (Exit $rc)" >&2
    exit 23
fi
# Namen der Kind-Umgebung = Literalliste (Allowlist oben + was
# test/umgebung.sh setzt). PWD/SHLVL/OLDPWD/_ setzt bash selbst; sie werden
# weder verglichen noch weitergegeben (cwd ist ohnehin die Kopie).
ERWARTETE_NAMEN='BELEHRUNGEN_UPLOAD_DIR CI DATABASE_URL DEFECT_PHOTO_DIR DOKUMENTE_DIR EINWEISUNG_NACHWEIS_DIR EXPORT_DIR GYMDOCU_BOOT_SMOKE_STARTPFAD HOME LAGEPLAN_UPLOAD_DIR NODE_OPTIONS OFFBOARDING_QUEUE_DIR PATH PDF_ROOT PLAYWRIGHT_BROWSERS_PATH PRUEFBERICHT_DIR PUBLIC_BASE_DOMAIN QR_VERBRAUCH SESSION_SECRET TZ'
TEST_ENV=()
NAMEN=()
mapfile -d '' -t PAARE < /dsv1/ergebnis/umgebung.env
for kv in "${PAARE[@]}"; do
    name=${kv%%=*}
    case "$name" in PWD|SHLVL|OLDPWD|_) continue ;; esac
    case "$kv" in *$'\n'*) echo "[dsv1] Umgebungswert mit Zeilenumbruch: $name" >&2; exit 24 ;; esac
    NAMEN+=("$name")
    TEST_ENV+=("$kv")
    if [ "$name" = DATABASE_URL ] && [ "${kv#DATABASE_URL=}" != "$DATABASE_URL" ]; then
        echo "[dsv1] umgebung.sh hat DATABASE_URL veraendert — Werkzeug-Befund" >&2
        exit 24
    fi
done
GEFUNDEN=$(printf '%s\n' "${NAMEN[@]}" | LC_ALL=C sort | tr '\n' ' ')
GEFUNDEN=${GEFUNDEN% }
if [ "$GEFUNDEN" != "$ERWARTETE_NAMEN" ]; then
    echo "[dsv1] UMGEBUNGSNAMEN WEICHEN AB — Werkzeug-Befund, keine Ausfuehrung" >&2
    echo "[dsv1]   erwartet: $ERWARTETE_NAMEN" >&2
    echo "[dsv1]   gefunden: $GEFUNDEN" >&2
    exit 24
fi

# ===== 4. Teststufe — Waechterdatei ZUERST (nur root kann sie anlegen) =====
: > /dsv1/ergebnis/test-gestartet || scheitern "Waechterdatei"
stufe "Teststufe gestartet: $TESTDATEI"
setpriv --reuid=65534 --regid=65534 --clear-groups --no-new-privs env -i "${TEST_ENV[@]}" node "$TESTDATEI"
rc=$?
echo "$rc" > /dsv1/ergebnis/test-exit
exit "$rc"
