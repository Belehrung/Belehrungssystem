# nginx-Härtung: Versionsangabe und HTTP/2 — 23.09.2026

Anlass: Betreiber-Meldung aus einem externen Scan (Note A+, zwei Restpunkte):
`Server: nginx/1.24.0 (Ubuntu)` wird ausgeliefert, und es läuft nur HTTP/1.1.

## Gemessen

* **Versionsangabe: bestätigt.** `curl -sI https://gymdocu.de/` von hier →
  `Server: nginx/1.24.0 (Ubuntu)`, ebenso auf der 404-Seite. (Der Egress-Proxy
  reicht den Header unverändert durch.) `X-Powered-By` fehlt — gut.
* **HTTP/2: von hier NICHT messbar.** Jede Verbindung läuft über den Egress-Proxy;
  ALPN wird mit dem Proxy ausgehandelt, nicht mit dem Server. Maßgeblich ist die
  Messung des externen Scans (HTTP/1.1).
* **Lokaler Nachbau mit derselben Version** (Ubuntu 24.04, `nginx 1.24.0`, nginx als
  Reverse-Proxy vor einem Node-Upstream, eigene Konfiguration unter dem Scratchpad):

  | Konfiguration | Protokoll | `Server` | Fehlerseite |
  |---|---|---|---|
  | wie heute | HTTP/1.1 | `nginx/1.24.0 (Ubuntu)` | `nginx/1.24.0 (Ubuntu)` |
  | `server_tokens off;` + `listen … ssl http2;` | **HTTP/2** | **`nginx`** | **`nginx`** |

  Der Upstream bekommt weiterhin HTTP/1.1 (`proxy_http_version 1.1`) — an der
  Anwendung ändert sich nichts.
* **HTTP/3 (QUIC) geht mit dieser nginx-Version NICHT:** `listen … quic` →
  `[emerg] invalid parameter "quic"` (gemessen). QUIC gibt es erst ab nginx 1.25
  (Paketquelle nginx.org statt Ubuntu) — ein eigener Schritt mit eigenem Risiko,
  hier nicht empfohlen.

## Umsetzung (auf dem Server, von Hand — die nginx-Konfiguration liegt NICHT im Repo)

1. `/etc/nginx/nginx.conf`, Block `http { … }`: `server_tokens off;` (Ubuntu hat die
   Zeile dort auskommentiert stehen).
2. In JEDEM `server`-Block mit `listen 443 ssl` (auch die von Certbot verwalteten):
   `listen 443 ssl http2;` bzw. `listen [::]:443 ssl http2;`. Bei 1.24 gehört `http2`
   an die `listen`-Zeile; die eigene Direktive `http2 on;` gibt es erst ab 1.25.1.
3. `nginx -t && systemctl reload nginx` (reload, nicht restart).
4. Prüfen: `curl -sI https://gymdocu.de/ | grep -i ^server` → `Server: nginx`;
   `curl -sI --http2 https://gymdocu.de/ | head -1` → `HTTP/2 200` (vom Server oder
   einem Rechner OHNE Proxy aus).

**Vor Schritt 2 nachsehen:** steht in der Konfiguration `limit_conn`? Unter HTTP/2
laufen viele Anfragen über EINE Verbindung — eine Verbindungsgrenze wirkt dann
schwächer. `limit_req` (je Anfrage) ist nicht betroffen.

## Danach

`tools/live-check.sh` bekommt eine Prüfung „`Server`-Header ohne Versionsnummer"
(von hier messbar, s. oben) — ERST nach der Umstellung, sonst wird jede
Deploy-Kontrolle rot. HTTP/2 bleibt von hier aus ungeprüft (ℹ, Proxy).
`ops/SECURITY-HEADER.md` im GymDocu-Repo nimmt beide Erwartungen auf.

**Status: wartet auf die Umstellung am Server durch den Betreiber.**
