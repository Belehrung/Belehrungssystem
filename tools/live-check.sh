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

code() { curl -sS -o "$2" -w '%{http_code}' --max-time 20 "$1" 2>/dev/null || echo 000; }
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

echo "── Live-Sichtprüfung $(date -u '+%Y-%m-%d %H:%M UTC') ──"

# 1. Landingpage — beantwortet: läuft der Webserver überhaupt?
c=$(code https://gymdocu.de/ "$TMP/land.html")
[ "$c" = 200 ] && ok "Landingpage erreichbar (HTTP 200, $(wc -c <"$TMP/land.html") B)" \
                || warn "Landingpage antwortet HTTP $c (erwartet 200)"

# 2. Echtheitsprüfung — der beste Funktionsnachweis: eine echte Seite AUS der
#    Anwendung, öffentlich und mandantenlos. Antwortet sie richtig, lebt der Prozess.
c=$(curl -sSL -o "$TMP/verify.html" -w '%{http_code}' --max-time 20 https://verify.gymdocu.de/ 2>/dev/null || echo 000)
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
if [ "$c" = 200 ]; then
    v=$(pdftotext -f 1 -l 2 "$TMP/hb.pdf" - 2>/dev/null | grep -oE 'Version [0-9]+\.[0-9]+ · Stand [0-9.]+' | head -1)
    ok "Handbuch ausgeliefert: ${v:-(Version nicht lesbar, $(wc -c <"$TMP/hb.pdf") B)}"
else
    warn "Handbuch nicht abrufbar (HTTP $c)"
fi

# 5. Zertifikat — ein abgelaufenes Zertifikat legt alles still, und zwar schlagartig.
ende=$(echo | openssl s_client -servername gymdocu.de -connect gymdocu.de:443 2>/dev/null \
       | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$ende" ]; then
    tage=$(( ( $(date -d "$ende" +%s) - $(date +%s) ) / 86400 ))
    [ "$tage" -ge "$WARN_TAGE" ] && ok "Zertifikat gültig, noch $tage Tage" \
                                 || warn "Zertifikat läuft in $tage Tagen ab ($ende) — Erneuerung prüfen"
else
    warn "Zertifikatslaufzeit nicht ermittelbar"
fi

echo
[ "$fehler" -eq 0 ] && echo "── Live-Betrieb unauffällig ──" || echo "── $fehler Befund(e) — nicht als erledigt melden ──"
exit "$fehler"
