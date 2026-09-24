# H1a — CSP mit Bericht, dann Enforce (Fassung 2, 24.09.2026)

Stand GymDocu master `946647a`. Einordnung: Standard-Executer — ein neuer, kleiner Endpunkt, ein Crawler-Test,
Doku; keine hergeleiteten Schwellen. Befund aus `plaene/haertung-weitere-moeglichkeiten-23-09-2026.md` (H1).
Fassung 1 ging durch die Planprüfung (`plaene/planpruefung-h1a.md`, 16 Zeilen); die Änderungen sind mit PH1-Nummern
markiert.

## Ausgangslage (gemessen 24.09.2026, `curl -sI`)

- Studio-Subdomain (`md001.`) und `verify.`: nur `Content-Security-Policy-Report-Only: default-src 'self';
  img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; object-src 'none';
  base-uri 'self'; frame-ancestors 'self'` — OHNE Bericht-Direktive, sammelt also nichts. `X-Frame-Options: SAMEORIGIN`.
- Landingpage `gymdocu.de`: zusätzlich bereits ENFORCE mit `form-action 'self'; frame-ancestors 'none'`.
- `ops/SECURITY-HEADER.md` sagt `X-Frame-Options: DENY` und `frame-ancestors 'none'` — **widerspricht dem Betrieb**,
  und `'none'` bräche die PDF-Vorschau am Tablet (`routes/belehrungen.js:455, 580`: same-origin `<iframe>`) (PH1-1).
- Die Header setzt nginx; die Konfiguration liegt nicht im Repo. Nginx spielt der Betreiber ein.

## Ziel und Reihenfolge (PH1-2, PH1-12)

Zwei Stufen, weil die Zielplattform (iPad/Safari) hier nicht messbar ist (nur Chromium vorhanden):
1. **Stufe 1 (dieser Beitrag + nginx-Schnipsel A):** Soll-Richtlinie als Report-Only MIT `report-uri` auf allen
   Studio-Subdomains und `verify.`. Echte Tablets melden eine Woche lang, was brechen WÜRDE.
2. **Stufe 2 (nginx-Schnipsel B, kein Code):** nach mindestens 7 Tagen ohne relevanten Bericht auf Enforce
   umstellen, `report-uri` bleibt. Wer „relevant“ entscheidet: der Haupt-Agent anhand des Logs, Kriterium im Doku-Text.

**Landingpage bleibt unberührt** (PH1-15): sie ist heute strenger (`frame-ancestors 'none'`).

## Auftrag

1. **Soll-Richtlinie** als EINE Konstante `core/csp.js` (exportiert die Zeichenkette), aus der Test und Doku-Test
   lesen:
   `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
   connect-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';
   report-uri /csp-bericht`
   Begründung je Quelle als Kommentar, mit Fundstelle: `data:` = QR-Bilder und CSS-Pfeile
   (`routes/module.js:1568` u. a.), `blob:` = Foto-Verkleinerung der Offline-Warteschlange
   (`public/offline-queue.js:75`, PH1-8), `frame-ancestors 'self'` = PDF-Vorschau (PH1-1). `font-src`, `manifest-src`,
   `worker-src` entfallen (redundant, PH1-7).
2. **Bericht-Endpunkt** `POST /csp-bericht` (PH1-2):
   - erreichbar auf JEDER Subdomain ohne Anmeldung, vor Auth/CSRF gemountet, CSRF-frei (Browser senden kein
     Token) — Ausnahme im Kommentar begründet;
   - nimmt `application/csp-report` und `application/reports+json`; Körper höchstens 8 KiB (grösser → 413, nichts
     geloggt ausser einer Zählzeile);
   - Ratenbegrenzung je IP mit einem vorhandenen Helfer (Executer nennt ihn), darüber 429 ohne Log;
   - schreibt EINE Logzeile `[CSP-BERICHT] <host> <violated-directive> <blocked-origin> <document-path>`:
     von `blocked-uri` nur Schema+Host (oder `inline`/`eval`/`data`/`blob`), von `document-uri` nur der Pfad OHNE
     Query (Token in `/q/…`, `/d/…`, `/v/…` durch `:token` ersetzen), alle Felder auf 200 Zeichen gekürzt und von
     Steuerzeichen befreit (Log-Injektion). Keine DB, kein Telegram, keine Speicherung;
   - antwortet 204.
3. **Crawler-Test in Chromium** (`test/helfer/chromium-start.js`). Test-App mit echten Routern, die die Konstante als
   ENFORCE-Header auf JEDE Antwort setzt (auch PDF und statische Dateien).
   - **Drei Perspektiven** (PH1-4, PH1-11): Admin, Tablet, anonym (Login-Seiten, `/v/<code>`, `/q/<token>`,
     `/d/<token>` — mit ECHT angelegten Datensätzen, damit die Ergebnisseite erscheint statt 404).
   - **Je Seite zugesichert** (PH1-3): Status 200 (Weiterleitung nur, wo in der Soll-Liste als solche eingetragen)
     und eine Seitenmarke (z. B. `<h1>`-Text oder `<title>`), dazu 0 `securitypolicyviolation`-Ereignisse und keine
     CSP-Konsolenmeldung.
   - **Header-Modus** (PH1-5): die Antwort trägt `Content-Security-Policy` (nicht nur `…-Report-Only`) mit genau der
     Konstante.
   - **PDF-Vorschau als eigener Schritt** (PH1-4, PH1-10): Tablet-Seite `/belehrungen`, echte Belehrung wählen,
     `pdfFrame.src` wechselt, der Frame lädt (`frame.contentDocument`/Ladeereignis bzw. Netzwerkantwort 200 mit
     `application/pdf`), 0 Verletzungen — mit dem Enforce-Header AUF der PDF-Antwort.
   - **Formular- und fetch-Ziele**: auf Seiten mit Unterschrift-Pads und Offline-Warteschlange die `action`- und
     `fetch`-Ziele einsammeln und gegen `'self'` prüfen.
   - **Routen-Sollmenge** (PH1-5, PH1-13): Literal-Liste im Test (Vorbild `MOUNT_LISTE` in
     `test_feature_pentest_p1_struktur.js`), Vergleich in BEIDE Richtungen gegen den Router-Stapel: Stapel−Liste
     und Liste−Stapel müssen leer sein; Mindestgrösse der Liste als Literal. Routen, die bewusst nicht besucht werden
     (POST-only, Datei-Downloads ohne HTML), stehen mit Grund in einer eigenen Literal-Liste.
4. **Findet der Crawler Verletzungen**: beheben, wenn es ohne Umbau geht; sonst Rückfrage. Eine Erweiterung der
   Richtlinie nur um einzeln benannte Ursprünge mit Fundstelle — nie `*`, `https:`, `http:` oder ein Schema allein
   ausser den oben begründeten (PH1-6).
5. **Doku** `ops/SECURITY-HEADER.md`: Soll-Tabelle auf den gemessenen Betrieb berichtigen (`X-Frame-Options:
   SAMEORIGIN` mit Grund PDF-Vorschau, PH1-1), CSP-Abschnitt mit Stufe 1/2, nginx-Schnipsel A (Report-Only mit
   `report-uri`) und B (Enforce), `server_tokens off`, `http2` (B3), Landingpage als eigener Block, Prüfbefehl,
   Kriterium für den Wechsel auf Stufe 2. **Repo-Test** (PH1-14): beide Schnipsel in der Doku enthalten die Konstante
   zeichengenau.
6. `tools/live-check.sh` (Belehrungssystem-Repo, baue ich selbst): prüft auf `md001.` und `verify.` die Richtlinie
   gegen ein Literal (Grund für die Kopie im Kopf: anderes Repo) und meldet Stufe 1/Stufe 2.

## Gegenproben (je ROT/GRÜN wörtlich)

(a) In der Test-App eine Seite mit `<script src="https://example.org/x.js">` (externe Herkunft) → Crawler ROT.
(b1) Eine Seite aus der Literal-Liste streichen → ROT. (b2) Eine triviale GET-Route in einem Router ergänzen, ohne
Liste → ROT.
(c) Test-App setzt die Konstante als Report-Only → Header-Modus-Zusicherung ROT.
(d) Eine besuchte Seite liefert 500 (Stub) → ROT trotz 0 Verletzungen.
(e) `frame-ancestors 'none'` in der Konstante → Vorschau-Schritt ROT.
(f) Bericht-Endpunkt: 9 KiB → 413; `document-uri` mit `/q/<token>?x=1` → Log enthält `:token`, nicht den Token;
Zeilenumbruch im Feld → eine Logzeile.
(g) Doku-Schnipsel um ein Zeichen verändert → Repo-Test ROT.

## Benannte Grenzen

- Safari/WebKit ungemessen — gedeckt durch Stufe 1 auf echten Tablets (PH1-12).
- POST-Ergebnisseiten (z. B. „Gespeichert“-Seiten) werden nicht gecrawlt; sie teilen Layout und Skripte mit den
  GET-Seiten. Kommt ein Bericht aus Stufe 1 von einer solchen Seite, wird die Grenze neu bewertet.
- nginx liegt nicht im Repo: der Live-Check (Punkt 6) ist die einzige Prüfung des echten Headers.

-- Ende des Auftrags --
