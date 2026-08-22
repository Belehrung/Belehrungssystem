#!/usr/bin/env bash
# tools/live-check.sh — Sichtprüfung des Live-Betriebs von außen, nach jedem Merge.
#
# Anlass (10.08.2026): Ich hatte dem Betreiber gesagt, ich könne nicht sehen, was
# auf dem Server los ist — und das nie nachgeprüft. Falsch: Die öffentliche Seite
# ist von hier aus erreichbar. Sie verrät keine Kundendaten, beantwortet aber die
# Frage, die nach einem Merge zählt: Steht der Betrieb noch?
#
# Ausdrücklich NICHT Gegenstand: Anmeldung, Kundendaten, Datenbank. Der
# öffentliche Teil (Abschnitte 1-4) zeigt nur, was jeder Besucher auch sieht.
# Seit der Betreiberfreigabe vom 22.08.2026 misst Abschnitt 6 zusätzlich einen
# GESCHÜTZTEN Betriebszustand — den internen Health-Endpunkt —, aber nur, wenn
# GYMDOCU_HEALTH_TOKEN gesetzt ist, und liefert daraus ausschließlich
# Statusnamen (ok/degraded, welche Teilprüfung betroffen ist), NIE Inhalte.
# Mehr Zugang als das wäre angesichts unterschriebener Protokolle echter
# Menschen nicht vertretbar.
#
# Exit 0 = alles steht. Exit 1 = mindestens ein Befund.
# Ein DRITTER Zustand ändert den Exit-Code nicht: ein mit ℹ markierter Punkt,
# den diese Umgebung nicht messen kann. Er steht in der Schlusszeile, damit
# „unauffällig" nicht mit „vollständig geprüft" verwechselt wird.
set -uo pipefail

WARN_TAGE=21          # unter so vielen Tagen Restlaufzeit meckert der Zertifikatstest

# Sollwert fuer den ECHTEN Aussteller von gymdocu.de (nicht den des
# Egress-Proxys dieser Umgebung). B2, 22.08.2026 — vorher stand hier eine
# Positivliste, die den PROXY erkennen sollte: aendert der Betreiber dessen
# Aussteller-Text, waere die Pruefung stillschweigend in den else-Zweig
# gefallen und haette wieder das Proxy-Zertifikat als "gueltig" gemeldet.
#
# Herkunft (22.08.2026, vom Betreiber nachgewiesen): /workspace/gymdocu-
# hauptserver/ops/README.md, Abschnitt "acme.sh (TLS-Wildcard)" — der DNS-01-
# Weg wurde am 21.08.2026 auf einem Wegwerf-Namen nachgewiesen, woertlich
# "TXT-Eintrag ueber die IONOS-API angelegt, DNS-Verbreitung abgewartet, von
# Let's Encrypt geprueft". Das Wildcard *.gymdocu.de kommt damit von Let's
# Encrypt.
#
# Verglichen wird NUR die ORGANISATION im Aussteller-DN, nicht die ganze
# Zeile: Let's Encrypt wechselt seine Zwischenzertifikate (R10, R11, E5, …) —
# ein exakter DN-Vergleich fiele bei jedem Wechsel lautlos auf offen()
# zurueck, ohne dass es jemand merkt. Die Organisation "Let's Encrypt"
# aendert sich dabei nicht. Apostroph ist der normale ASCII-Apostroph
# (U+0027), wie in jedem oeffentlichen Let's-Encrypt-Zertifikat — nicht ein
# typografischer.
ERWARTETE_ZERT_ORGANISATION="Let's Encrypt"

fehler=0
ungeprueft=0
ok()   { echo "  ✓ $*"; }
warn() { echo "  ⚠ $*"; fehler=$((fehler+1)); }
# Dritter Zustand, absichtlich getrennt von beiden (19.08.2026): Ein Punkt, den
# diese Umgebung gar nicht messen KANN, ist weder sauber noch kaputt. Als ok()
# wäre er eine Lüge, als warn() wäre er dauerhaft rot — und ein dauerhaft
# roter Wert wird abgeschaltet statt gelesen. Er zählt deshalb einen eigenen Zähler
# und taucht in der Schlusszeile auf, damit „unauffällig" nie „vollständig
# geprüft" vortäuscht.
offen() { echo "  ℹ $*"; ungeprueft=$((ungeprueft+1)); }

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
# EIN Verbindungsaufbau, daraus Aussteller UND Ablaufdatum — zwei s_client-Aufrufe
# wären zwei Verbindungen und könnten unterschiedliche Antworten liefern.
zert=$(timeout 20 openssl s_client -servername gymdocu.de -connect gymdocu.de:443 </dev/null 2>/dev/null \
       | openssl x509 -noout -issuer -enddate 2>/dev/null)
aussteller=$(printf '%s\n' "$zert" | sed -n 's/^issuer=//p')
ende=$(printf '%s\n' "$zert" | sed -n 's/^notAfter=//p')

# Befund 19.08.2026: Diese Umgebung leitet JEDE TLS-Verbindung ueber einen
# Egress-Proxy, der neu signiert. Gemessen wurde deshalb nie das Zertifikat von
# gymdocu.de, sondern das des Proxys — und der stellt immer 30-Tage-Zertifikate
# aus. Die Zeile meldete seit jeher „gültig, noch 30 Tage", auch wenn das echte
# Zertifikat morgen abliefe. Gegenprobe damals: letsencrypt.org und google.com
# zeigten von hier aus denselben Aussteller mit denselben 30 Tagen.
# Auf dem SERVER greift dieselbe Messung richtig — der Wochenreport tut das
# (ops/gymdocu-wochenreport.sh, Mo 06:00 UTC, Warnung unter 21 Tagen).
#
# B2, 22.08.2026: Frueher stand hier eine POSITIVLISTE, die den Proxy an
# seinem Aussteller-Text erkannte ("Egress Gateway|O *= *Anthropic") — alles,
# was NICHT danach aussah, fiel in den else-Zweig und wurde als "gueltig"
# gemessen. Aendert der Umgebungsbetreiber diesen Text, faellt die Erkennung
# lautlos aus und die Zeile misst wieder das Proxy-Zertifikat als echtes.
# Umgedreht: nur ein Aussteller, dessen Organisation zum bestaetigten
# Sollwert $ERWARTETE_ZERT_ORGANISATION passt, wird gemessen (grep -F, keine
# Regex-Sonderzeichen-Sorgen wegen des Apostrophs). Alles andere — auch ein
# unbestaetigter (leerer) Sollwert — bleibt offen() statt zu raten. Beide
# openssl-Schreibweisen abgedeckt ("O = X" mit Leerzeichen um "=", wie es
# diese openssl-Version bei -noout -issuer ausgibt, und "O=X" ohne).
if [ -z "$ERWARTETE_ZERT_ORGANISATION" ]; then
    offen "Zertifikat-Aussteller-Pruefung NICHT konfiguriert (ERWARTETE_ZERT_ORGANISATION ist noch ein TODO, siehe Kopf der Datei) — Aussteller aus dieser Umgebung: ${aussteller:-unbekannt} (das kann ebenso gut der Egress-Proxy sein wie gymdocu.de selbst). Serverseitig prüft das der Wochenreport (Mo 06:00 UTC, Warnung unter ${WARN_TAGE} Tagen)."
elif ! printf '%s' "$aussteller" | grep -qF "O = ${ERWARTETE_ZERT_ORGANISATION}" && ! printf '%s' "$aussteller" | grep -qF "O=${ERWARTETE_ZERT_ORGANISATION}"; then
    offen "Zertifikat-Aussteller passt nicht zum bestätigten Sollwert (Organisation „${ERWARTETE_ZERT_ORGANISATION}“) — vermutlich der Egress-Proxy, der jede TLS-Verbindung aus dieser Umgebung neu signiert (Aussteller hier: ${aussteller:-unbekannt}). Die Restlaufzeit wäre dann dessen eigene, nicht die von gymdocu.de. Serverseitig prüft das der Wochenreport (Mo 06:00 UTC, Warnung unter ${WARN_TAGE} Tagen)."
elif [ -z "$ende" ]; then
    warn "Zertifikatslaufzeit nicht ermittelbar"
elif ! ende_ts=$(date -d "$ende" +%s 2>/dev/null); then
    # Vorher ungeprüft: Bei unlesbarem Datum wurde die Subtraktion zu einem
    # unären Minus und die Meldung lautete "läuft in -20676 Tagen ab".
    warn "Zertifikat: Ablaufdatum '$ende' nicht lesbar — Laufzeit NICHT geprüft"
else
    tage=$(( (ende_ts - $(date +%s)) / 86400 ))
    [ "$tage" -ge "$WARN_TAGE" ] && ok "Zertifikat gültig, noch $tage Tage (Aussteller: ${aussteller:-unbekannt})" \
                                 || warn "Zertifikat läuft in $tage Tagen ab ($ende) — Erneuerung prüfen"
fi

# 6. Health-Endpunkt (intern, token-geschützt) — Betreiberfreigabe 22.08.2026.
# /intern/health ist mit dem Header X-Bezirk-Token geschützt (routes/health-
# intern.js im gymdocu-Repo) und antwortet ohne ihn mit HTTP 403 — von hier aus
# also nur mit einem Token prüfbar. Das Token gehört in eine Umgebungsvariable,
# NIE in diese Datei (auch nicht als Platzhalter, der wie einer aussieht).
#
# Fehlt das Token, bleibt der Punkt bewusst ℹ/ungeprüft statt grün zu
# behaupten — genau der Fehler vom 22.08.2026: der Deploy druckte "⚠
# Health-Check erreichbar, meldet aber NICHT ok — Teilausfall" und lief
# trotzdem als success durch; der live-check fragte den Endpunkt gar nicht
# erst ab und meldete "Live-Betrieb unauffällig" über diesem bekannten Gelb.
if [ -z "${GYMDOCU_HEALTH_TOKEN:-}" ]; then
    offen "Health-Endpunkt NICHT geprüft (kein GYMDOCU_HEALTH_TOKEN gesetzt)"
else
    # --max-time wie bei jedem anderen curl-Aufruf hier (Vorfall 11.08.2026,
    # siehe Kommentar bei code() oben).
    health_code=$(curl -sS -o "$TMP/health.json" -w '%{http_code}' --max-time 20 \
        -H "X-Bezirk-Token: ${GYMDOCU_HEALTH_TOKEN}" \
        https://gymdocu.de/intern/health 2>/dev/null)
    health_code="${health_code:-000}"
    if [ "$health_code" != 200 ]; then
        # Ein Endpunkt, der antworten müsste und es nicht tut, ist ein
        # Befund, kein Messproblem — deshalb warn(), nicht offen().
        warn "Health-Endpunkt antwortet HTTP $health_code (erwartet 200) — Endpunkt nicht erreichbar oder Token falsch"
    elif ! health_json=$(cat "$TMP/health.json" 2>/dev/null) || ! printf '%s' "$health_json" | jq -e . >/dev/null 2>&1; then
        warn "Health-Endpunkt: Antwort ist kein gültiges JSON (HTTP $health_code)"
    else
        health_ok=$(printf '%s' "$health_json" | jq -r '.ok // empty')
        health_status=$(printf '%s' "$health_json" | jq -r '.status // "unbekannt"')
        if [ "$health_ok" = "true" ]; then
            ok "Health-Endpunkt meldet ok (status: $health_status)"
        else
            # Nicht bloß "degraded" melden — der Betreiber muss ohne
            # Nachschlagen wissen, WAS klemmt. Anhand des tatsächlichen
            # Schemas aus routes/health-intern.js (nicht geraten): welche
            # Teilprüfung (pdfJobs/storageReplica/disk/pm2/restoreDrills)
            # nicht ok ist, plus je Restore-Drill sein konkreter Status
            # (aktueller Fall: file_sample/replica_verify auf
            # "nicht_geprueft").
            health_probleme=$(printf '%s' "$health_json" | jq -r '
                [
                  (if (.pdfJobs?.status // "") == "degraded" then "pdfJobs" else empty end),
                  (if (.storageReplica?.dead // 0) > 0 then "storageReplica" else empty end),
                  (if (.disk?.ok // true) != true then "disk" else empty end),
                  (if (.pm2?.ok // true) != true then "pm2" else empty end),
                  (if (.restoreDrills?.ok // true) != true or (.restoreDrills?.stale // false) or (.restoreDrills?.missing // false) then "restoreDrills" else empty end),
                  ((.restoreDrills?.drills // {}) | to_entries[]? | select((.value.status // "ok") != "ok" or (.value.ok // true) != true) | "restoreDrills.drills.\(.key)=\(.value.status // (.value.ok|tostring))")
                ] | join(", ")')
            [ -n "$health_probleme" ] || health_probleme="(Einzelheiten nicht im JSON gefunden)"
            warn "Health-Endpunkt meldet NICHT ok (status: $health_status) — betroffen: $health_probleme"
        fi
    fi
fi

echo
if [ "$fehler" -eq 0 ] && [ "$ungeprueft" -eq 0 ]; then
    echo "── Live-Betrieb unauffällig ──"
elif [ "$fehler" -eq 0 ]; then
    echo "── Live-Betrieb unauffällig, aber $ungeprueft Punkt(e) NICHT geprüft (siehe ℹ) ──"
else
    echo "── $fehler Befund(e) — nicht als erledigt melden ──"
fi
# Nicht "exit $fehler": Der Kopf verspricht "Exit 1 = mindestens ein Befund",
# der Zaehler haette bei zwei Befunden aber 2 geliefert. Ein Aufrufer, der auf
# "-eq 1" prueft, haette genau die schlimmeren Laeufe uebersehen (Befund
# 13.08.2026). Die Anzahl steht in der Zeile darueber, sie geht nicht verloren.
[ "$fehler" -eq 0 ] && exit 0 || exit 1
