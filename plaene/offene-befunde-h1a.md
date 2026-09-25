# Offene Befunde H1a — für die Extrarunde

Verweist auf `plaene/planpruefung-h1a.md` und `plaene/diffpruefung-h1a.md` (Nachmessung dort).

| # | Punkt | Stand |
|---|---|---|
| H1a-S1 | Acht Routen im Seiteninventar des Crawlers als „ungeprüft“ geführt (nicht gerendert) — Enforce erst, wenn sie gemessen sind | offen |
| H1a-S2 | Safari/WebKit ungemessen (Tablets der Trainer) — Report-Only-Phase muss Berichte aus WebKit enthalten, bevor Enforce | offen |
| H1a-S3 | Header-Zusicherung prüft den eigenen Patch, nicht nginx (H1a-15) — belegt erst der live-check nach dem Server-Schritt | Grenze, benannt |
| H1a-S4 | nginx: `Content-Security-Policy-Report-Only` mit `report-uri /csp-bericht` setzen | **Betreiber-Schritt** |
| H1a-S5 | `/csp-bericht` ohne eigenes Zeitlimit: langsamer Rumpf hält die Verbindung bis `requestTimeout` (300,1 s, `408`); in Produktion puffert nginx den Rumpf (H1a2-11) | offen |
| H1a-S6 | Aufräumen der Rate-Map ohne Test, funktional gemessen (H1a2-12) | Grenze, benannt |
