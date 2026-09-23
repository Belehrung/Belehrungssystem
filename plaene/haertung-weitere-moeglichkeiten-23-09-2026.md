# Weitere Härtung — Bestandsaufnahme von aussen (23.09.2026)

Betreiber-Frage: „gibt es weitere möglichkeiten den server sicherer oder
effektiver zu machen?" Alles unter „Gemessen" ist von hier aus gemessen
(Egress-Proxy reicht Header durch; TLS und Protokoll sind von hier NICHT messbar).

## Gemessen

| # | Befund | Messung | Vorschlag |
|---|---|---|---|
| H1 | **CSP wird nur auf der Landingpage durchgesetzt**; `verify.` und die Studio-Subdomains senden nur `Content-Security-Policy-Report-Only` — und zwar OHNE `report-uri`/`report-to`, der Report-Only-Modus sammelt also nirgends etwas. Alle Richtlinien erlauben `'unsafe-inline'` für Skripte. | `curl -sI` auf `gymdocu.de`, `verify.`, `md001.` | Eigener Beitrag: Richtlinie zuerst im Test-Browser (Playwright) gegen alle Seiten durchsetzen, messen was bricht, dann scharf schalten; `'unsafe-inline'` für Skripte über Nonces ablösen. Grösster Hebel gegen XSS. |
| H2 | **Weiterleitungsschleife ohne Cookies** auf Studio-Subdomains: `/` → `/login/tablet` → `/` … (curl bricht nach 50 ab), und `/login/tablet` speichert je Sprung eine neue Sitzung (`req.session.save`, `routes/auth.js` GET `/login/tablet`). Mit Cookies korrekt (3 Weiterleitungen, Ende `/tablet/sperre`). | `curl -L` mit und ohne Cookie-Jar | Pentest-Liste: bei fehlendem Rück-Cookie eine Seite „Cookies erforderlich" statt erneuter Weiterleitung; Sitzungen je Quelle begrenzen. |
| H3 | HSTS ohne `preload` (`max-age=31536000; includeSubDomains`). | Header | Entscheidung des Betreibers — Preload ist praktisch nicht rückgängig zu machen. |
| H4 | Gut: Cookie `HttpOnly; Secure; SameSite=Lax`; `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` gesetzt; kein `X-Powered-By`; `security.txt` vorhanden; HTTP → HTTPS 301; gzip aktiv; Landingpage ohne externe Dateien. | Header | — |

## Nur am Server prüfbar (Befehlsblock an den Betreiber gegeben)

Firewall, nach aussen lauschende Dienste, SSH (Root-Login, Passwort-Login),
automatische Sicherheitsupdates, fail2ban, `limit_req` an Login-/PIN-Wegen.
Ergebnis steht aus.

## Serverausgabe vom Betreiber (23.09.2026)

* **ufw aktiv**, Standard `deny incoming`, offen nur 22/80/443 (Regeln doppelt, harmlos).
* **UNBEKANNTER DIENST `updater` (pid 4181895)** lauscht auf `212.227.206.28:6888`
  (Rückstau 3000) und `0.0.0.0:18018`. Von aussen durch ufw gesperrt, ausgehend ist
  alles erlaubt. Nicht zuzuordnen — **zuerst identifizieren** (Befehle an den Betreiber
  gegeben), bevor irgendetwas anderes gemacht wird.
* **SSH:** `PermitRootLogin yes`, `PasswordAuthentication` einmal `yes`, einmal `no` —
  welcher Wert gilt, entscheidet die Lesereihenfolge; maßgeblich ist `sshd -T`.
* `unattended-upgrades` aktiv, aber **48 Pakete** warten auf ein Update.
* `fail2ban` aktiv. `limit_req` für Login vorhanden (`conf.d/00-login-ratelimit.conf`,
  60/min, burst 20, Status 429). PostgreSQL lauscht nicht nach aussen.
