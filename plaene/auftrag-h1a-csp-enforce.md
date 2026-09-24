# H1a — CSP von Report-Only auf Enforce (erster Schritt, ohne Umbau der Inline-Skripte)

Stand GymDocu master `946647a`. Einordnung: Standard-Executer. Befund aus
`plaene/haertung-weitere-moeglichkeiten-23-09-2026.md` (H1): Die CSP wird nur auf der Landingpage durchgesetzt;
`verify.` und die Studio-Subdomains senden nur `Content-Security-Policy-Report-Only`, und zwar OHNE
`report-uri`/`report-to`. Report-Only sammelt also nirgends etwas. Die Header setzt nginx
(`ops/SECURITY-HEADER.md`), die Konfiguration liegt nicht im Repo.

Ziel dieses Schritts: Die „realistische“ Richtlinie aus `ops/SECURITY-HEADER.md` wird auf allen Subdomains
DURCHGESETZT. `'unsafe-inline'` für Skripte bleibt vorerst: gemessen stehen 158 Zeilen mit Inline-Handlern
(`onclick=` usw.) und 72 mit `<script>` in `routes/`, `core/` und `server.js`. Nonces und das Ablösen der Inline-Handler
sind ein eigener, grosser Beitrag (H1b). Schon der erste Schritt schliesst `frame-ancestors`, `base-uri`, `form-action`,
`object-src` und die Herkunft von Skripten, Bildern und Verbindungen.

## Auftrag

1. **Soll-Richtlinie** als EINE Konstante im Repo (z. B. `ops/csp-richtlinie.txt` oder `core/csp.js`), aus der sowohl die
   Doku (`ops/SECURITY-HEADER.md`) als auch der Test lesen:
   `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
   connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
   worker-src 'self'; manifest-src 'self'`. Messe, was davon nötig ist, statt es anzunehmen: Service Worker, Manifest,
   Schriften, `data:`-Bilder (Unterschriften, QR), `blob:` (PDF-Vorschau?).
2. **Crawler-Test in Chromium** (`test/helfer/chromium-start.js`): Eine Test-App mit echten Routern setzt die Richtlinie
   als ENFORCE-Header, und der Crawler ruft ALLE GET-Seiten auf, die ein angemeldeter Admin bzw. ein Tablet erreichen kann.
   Die Routenliste kommt aus dem Router-Stapel wie im Pentest-P1-Wächter, die Menge wird gegen eine unabhängige Quelle
   gehalten. Gesammelt werden die CSP-Verletzungen (`securitypolicyviolation`-Ereignisse und Konsolenmeldungen).
   Zusicherung: 0 Verletzungen. Die Liste der besuchten Seiten wird mengenmässig zugesichert.
   Dazu die Formular-Absendeziele (`form-action`) und die `fetch`-Ziele (`connect-src`) auf den Seiten mit Pads.
3. **Findet der Crawler Verletzungen**, werden sie behoben, wenn das ohne Umbau geht (z. B. externe Ressource
   einbinden), sonst mit Begründung in die Richtlinie aufgenommen. Keine Lockerung auf `*`.
4. **Doku**: `ops/SECURITY-HEADER.md` auf den Enforce-Stand bringen, samt dem nginx-Schnipsel, den der Betreiber
   einspielt (`add_header Content-Security-Policy "…" always;` im gemeinsamen Include), `server_tokens off`,
   `http2` (B3 aus dem Arbeitsplan) und dem Prüfbefehl. `tools/live-check.sh` (Belehrungssystem-Repo) prüft danach die
   Enforce-Richtlinie auf Landingpage, `verify.` und einer Studio-Subdomain. Das baue ich selbst, es ist ein
   anderes Repo.

## Gegenproben

(a) In der Test-App ein Inline-`<script src="https://example.org/x.js">` in eine Seite einbauen → Crawler ROT.
(b) Eine Seite aus der Routenliste entfernen → die Mengen-Zusicherung wird ROT.
(c) Die Richtlinie in der Test-App auf Report-Only stellen → der Test muss das erkennen (ROT), weil er ENFORCE zusichert.

## Fragen an die Planprüfung

* Welcher Zustand entsteht durch Enforce, den es vorher nicht gab? Welche Seiten oder Funktionen können brechen
  (PDF-Vorschau, Service Worker, QR-Druck, Druckansichten, Downloads, Einbettung in iframes)?
* Kann der Crawler grün sein, obwohl eine Seite im Betrieb bricht?
