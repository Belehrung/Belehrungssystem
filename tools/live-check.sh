#!/usr/bin/env bash
# tools/live-check.sh — Sichtprüfung des Live-Betriebs von außen, nach jedem Merge.
#
# Anlass (10.08.2026): Ich hatte dem Betreiber gesagt, ich könne nicht sehen, was
# auf dem Server los ist — und das nie nachgeprüft. Falsch: Die öffentliche Seite
# ist von hier aus erreichbar. Sie verrät keine Kundendaten, beantwortet aber die
# Frage, die nach einem Merge zählt: Steht der Betrieb noch?
#
# Ausdrücklich NICHT Gegenstand: Anmeldung, Kundendaten, Datenbank. Was hier
# geprüft wird, sieht jeder Besucher auch. Mehr Zugang wäre nicht nötig und
# angesichts unterschriebener Protokolle echter Menschen auch nicht vertretbar.
#
# Exit 0 = alles steht. Exit 1 = mindestens ein Befund.
set -uo pipefail

WARN_TAGE=21          # unter so vielen Tagen Restlaufzeit meckert der Zertifikatstest
fehler=0
ok()   { echo "  ✓ $*"; }
warn() { echo "  ⚠ $*"; fehler=$((fehler+1)); }

# $1 = URL, $2 = Zieldatei, $3 = optionale curl-Zusatzflags (z.B. -L).
# Kein `|| echo 000`: curl schreibt über -w bei einem Transportfehler SELBST schon
# "000" — der Zusatz hängte ein zweites an, und der Betreiber las "HTTP 000000"
# (Review-Befund 11.08.2026). Nur der wirklich leere Fall wird ersetzt.
code() {
    local c
    c=$(curl -sS -o "$2" -w '%{http_code}' --max-time 20 ${3:-} "$1" 2>/dev/null)
    echo "${c:-000}"
}
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

echo "── Live-Sichtprüfung $(date -u '+%Y-%m-%d %H:%M UTC') ──"

# 1. Landingpage — beantwortet: läuft der Webserver überhaupt?
c=$(code https://gymdocu.de/ "$TMP/land.html")
[ "$c" = 200 ] && ok "Landingpage erreichbar (HTTP 200, $(wc -c <"$TMP/land.html") B)" \
                || warn "Landingpage antwortet HTTP $c (erwartet 200)"

# 2. Echtheitsprüfung — der beste Funktionsnachweis: eine echte Seite AUS der
#    Anwendung, öffentlich und mandantenlos. Antwortet sie richtig, lebt der Prozess.
c=$(code https://verify.gymdocu.de/ "$TMP/verify.html" -L)
if [ "$c" = 200 ] && grep -qi "Echtheitsprüfung" "$TMP/verify.html"; then
    ok "Echtheitsprüfung rendert (Anwendung läuft)"
else
    warn "Echtheitsprüfung: HTTP $c, erwarteter Titel nicht gefunden"
fi

# 3. Studio-Subdomain — 302 ist das RICHTIGE Ergebnis: die Anwendung antwortet und
#    weist den Unangemeldeten ab. Eine 200 hier wäre ein Alarm, keine gute Nachricht.
c=$(code https://md001.gymdocu.de/ "$TMP/md001.html")
case "$c" in
    302|303) ok "Studio-Subdomain antwortet und weist ab (HTTP $c — so soll es sein)" ;;
    200)     warn "Studio-Subdomain liefert HTTP 200 OHNE Anmeldung — bitte sofort prüfen" ;;
    *)       warn "Studio-Subdomain antwortet HTTP $c (erwartet 302)" ;;
esac

# 4. Handbuch — der einzige öffentliche Versionsmarker. Zeigt, welcher Stand
#    wirklich ausgeliefert wird (am 09.08. lag hier tagelang die alte Fassung).
c=$(code https://gymdocu.de/handbuch.pdf "$TMP/hb.pdf")
if [ "$c" != 200 ]; then
    warn "Handbuch nicht abrufbar (HTTP $c)"
elif ! command -v pdftotext >/dev/null 2>&1; then
    # Werkzeug fehlt = ungeprüft, nicht in Ordnung. Ein Haken hier hieße
    # "Version stimmt", obwohl niemand nachgesehen hat.
    warn "Handbuch: pdftotext fehlt — ausgelieferte Version NICHT geprüft"
else
    # Zweite und dritte Stelle beide moeglich (12.08.2026): Das Handbuch zaehlt
    # seit der Umstellung dreistellig (2.9.1, 2.9.2), weil "2.10" sich fuer
    # einen Leser wie ein Rueckschritt hinter 2.9 las. Das alte Muster
    # 'Version [0-9]+\.[0-9]+' passte darauf NICHT — der Live-Check meldete
    # daraufhin "Version nicht lesbar", obwohl die Version gut lesbar dastand.
    # Dass das auffiel und nicht durchrutschte, ist dem Umbau von ok() auf
    # warn() zu verdanken (PR #8): Vorher haette hier ein gruener Haken mit
    # dem Zusatz "(Version nicht lesbar)" gestanden.
    v=$(pdftotext -f 1 -l 2 "$TMP/hb.pdf" - 2>/dev/null | grep -oE 'Version [0-9]+(\.[0-9]+)+ · Stand [0-9.]+' | head -1)
    if [ -n "$v" ]; then
        ok "Handbuch ausgeliefert: $v"
    else
        # Review-Befund 11.08.2026: Hier stand ein ok() mit dem Zusatz
        # "(Version nicht lesbar)" — also ein grüner Haken für ein leeres
        # Ergebnis. Eine HTML-Fehlerseite mit Status 200 unter /handbuch.pdf
        # hätte den Prüfstand passiert. Das ist genau der Fehler, gegen den
        # die Hausregel "leeres Ergebnis ist nicht sauberes Ergebnis"
        # geschrieben wurde — im Werkzeug, das sie durchsetzen soll.
        warn "Handbuch: Version nicht lesbar ($(wc -c <"$TMP/hb.pdf") B) — HTTP 200 allein beweist nichts"
    fi
fi

# 5. Zertifikat — ein abgelaufenes Zertifikat legt alles still, und zwar schlagartig.
# `timeout` davor (Review-Befund 11.08.2026): Jeder curl-Aufruf oben ist mit
# --max-time gedeckelt, openssl war es nicht. Ein Host, der Pakete verschluckt
# statt abzulehnen, ließ die Prüfung nach einem Merge minutenlang hängen —
# ausgerechnet das Werkzeug, das den Ausfall melden soll, blieb dann stumm.
ende=$(timeout 20 openssl s_client -servername gymdocu.de -connect gymdocu.de:443 </dev/null 2>/dev/null \
       | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -z "$ende" ]; then
    warn "Zertifikatslaufzeit nicht ermittelbar"
elif ! ende_ts=$(date -d "$ende" +%s 2>/dev/null); then
    # Vorher ungeprüft: Bei unlesbarem Datum wurde die Subtraktion zu einem
    # unären Minus und die Meldung lautete "läuft in -20676 Tagen ab".
    warn "Zertifikat: Ablaufdatum '$ende' nicht lesbar — Laufzeit NICHT geprüft"
else
    tage=$(( (ende_ts - $(date +%s)) / 86400 ))
    [ "$tage" -ge "$WARN_TAGE" ] && ok "Zertifikat gültig, noch $tage Tage" \
                                 || warn "Zertifikat läuft in $tage Tagen ab ($ende) — Erneuerung prüfen"
fi

echo
[ "$fehler" -eq 0 ] && echo "── Live-Betrieb unauffällig ──" || echo "── $fehler Befund(e) — nicht als erledigt melden ──"
# Nicht "exit $fehler": Der Kopf verspricht "Exit 1 = mindestens ein Befund",
# der Zaehler haette bei zwei Befunden aber 2 geliefert. Ein Aufrufer, der auf
# "-eq 1" prueft, haette genau die schlimmeren Laeufe uebersehen (Befund
# 13.08.2026). Die Anzahl steht in der Zeile darueber, sie geht nicht verloren.
[ "$fehler" -eq 0 ] && exit 0 || exit 1
