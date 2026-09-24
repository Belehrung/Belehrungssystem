# Planprüfung H1a — CSP Enforce (24.09.2026)

Papier: `plaene/auftrag-h1a-csp-enforce.md` (Fassung 1). Zwei Lesespuren mit verschiedenem Material:
`deepseek-v4-pro` mit Repo-Lesezugriff (`tools/gegenleser-repo.js`, effort high, 29 Runden, ~3,06 $) und
`kimi-k3` mit Bündel (Papier, `ops/SECURITY-HEADER.md`, `core/service-worker.js`, grep-Auszüge externer
Ressourcen). Jeder Befund selbst nachgemessen, bevor er in Fassung 2 eingeht.

## Eigene Messung vorab (Live-Header, 24.09.2026 18:50 UTC)

`curl -sI` gegen `md001.gymdocu.de/login`, `/belehrungen/vorschau/1`, `verify.gymdocu.de/`:
`x-frame-options: SAMEORIGIN` und
`content-security-policy-report-only: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';
script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'`.

## Befunde

| Nr. | Spur | Befund | Nachgemessen | Einstufung | Folge |
|---|---|---|---|---|---|
| PH1-1 | eigene | Die Soll-Richtlinie setzt `frame-ancestors 'none'`. Die Tablet-Seite `/belehrungen` bettet die PDF-Vorschau per `<iframe>` von derselben Herkunft ein (`routes/belehrungen.js:455`, `src` per JS `:578-581`). Mit `'none'` verweigert der Browser die Einbettung auch für `'self'` — die Belehrungs-PDF bliebe am Tablet leer. Live steht heute `frame-ancestors 'self'` und XFO `SAMEORIGIN`; die Doku (`ops/SECURITY-HEADER.md`) sagt dagegen `DENY`/`'none'` — Doku und Betrieb widersprechen sich. | gelesen + Live-Header | **blockierend** | `frame-ancestors 'self'`; Doku auf `SAMEORIGIN` berichtigen, mit Grund |
| PH1-2 | DeepSeek B1/D1 | Keine `report-uri`/`report-to`: Enforce ohne Bericht blockiert und meldet nichts; Brüche kommen nur als Beschwerde. | Live-Header: keine Report-Direktive | mittel | Bericht-Endpunkt in der App (nur Log, Grössendeckel, Ratenbegrenzung, keine Speicherung, kein Telegram — Browser-Erweiterungen erzeugen Rauschen); Einführung zuerst 7 Tage Report-Only MIT Bericht, dann Enforce |
| PH1-3 | DeepSeek C1 | Crawler prüft nur CSP-Ereignisse, nicht Status/Inhalt — eine 500er-Seite ist „0 Verletzungen“. | Papier Punkt 2 | **blockierend** (Prüfung, die nicht rot werden kann) | je Seite Status 200 und Seitenmarke zusichern |
| PH1-4 | DeepSeek C2 | Nicht erreicht: `/v/:code`, `/q/:token`, `/d/:token`, PDF-Vorschau (iframe erst nach Auswahl), POST-Ergebnisseiten. | gelesen `routes/belehrungen.js:455, 578-581` | mittel | Datensätze anlegen, Vorschau als eigener Schritt; POST-Ergebnisseiten als benannte Grenze |
| PH1-5 | DeepSeek Pflicht 1 | Zusicherung auf den Header-MODUS fehlt (Gegenprobe c nicht umsetzbar); Sollmenge der Routen nicht benannt (Vorbild `MOUNT_LISTE`-Literal); Gegenprobe (a) falsch benannt (kein Inline-Skript). | Papier | mittel | übernommen |
| PH1-6 | DeepSeek B2 | Lockerungsregel schliesst nur `*` aus; `https:` oder ein fremder Host wären erlaubt. | Papier Punkt 3 | gering | nur einzeln benannte Ursprünge, jede Erweiterung begründet |
| PH1-7 | DeepSeek D2 | `font-src`, `manifest-src`, `worker-src` sind redundant (fallen auf `default-src` bzw. `script-src` zurück); Repo lädt weder Webfonts noch Manifest. | grep: nur `core/service-worker.js:81` (Endungsliste) | Anmerkung | streichen |
| PH1-8 | DeepSeek D3 | `blob:` wird nicht für eine PDF-Vorschau gebraucht, sondern für die Foto-Verkleinerung der Offline-Warteschlange (`public/offline-queue.js:75`, `img.src = URL.createObjectURL`). Live fehlt `blob:` in `img-src` — Enforce mit der LIVE-Richtlinie bräche die Foto-Verkleinerung. | gelesen | mittel | Begründung berichtigen; `blob:` bleibt |
| PH1-9 | Kimi B1 | = PH1-2 (unabhängig gefunden, „hoch“); Doku `ops/SECURITY-HEADER.md:31-32` verlangt selbst „nach Auswertung der Reports“. | wie PH1-2 | mittel | wie PH1-2 |
| PH1-10 | Kimi B2 | `frame-src` fehle, die Vorschau sei womöglich eine `blob:`-URL. | **fällt** zur Hälfte: `src` ist same-origin `/belehrungen/vorschau/<id>` (`routes/belehrungen.js:580`), `default-src 'self'` deckt das. **Trägt** zur Hälfte: ob Chromium den PDF-Betrachter im Frame lädt, wenn die PDF-ANTWORT selbst `object-src 'none'` trägt, ist nirgends gemessen. | mittel (Messlücke) | Vorschau-Schritt im Crawler MIT Enforce-Header auf der PDF-Antwort (zu PH1-4) |
| PH1-11 | Kimi B3 | Öffentliche Wege (`verify.`/`/v/`, `/q/`-Scanseite, Login) fehlen im Crawler, obwohl die Richtlinie dort gilt. | Papier Punkt 2 | mittel | dritte Perspektive „anonym“ im Crawler (zu PH1-4) |
| PH1-12 | Kimi B4 | Zielplattform iPad/Safari ungemessen (`core/service-worker.js:60-64`); Enforce wirkte dort ab Tag 1 ungesehen. | `/opt/pw-browsers`: nur Chromium, kein WebKit | mittel | benannte Grenze; gedeckt durch die Report-Only-Phase MIT Bericht auf echten Tablets (PH1-2) VOR Enforce |
| PH1-13 | Kimi B5 | Mengenvergleich nur in einer Richtung (Entfernen); neue GET-Route ohne Listenpflege muss ebenfalls rot werden. | Papier Gegenprobe (b) | mittel | beidseitig, Literal-Liste (zu PH1-5) |
| PH1-14 | Kimi B6 | Gate sieht nur die Test-App; nginx-Schnipsel und Live-Header werden nirgends dauerhaft gegen die Konstante gehalten. | `ops/SECURITY-HEADER.md:3-7` | mittel | Repo-Test: Schnipsel in der Doku = Konstante; `tools/live-check.sh` vergleicht Live-Header gegen ein Literal (anderes Repo, Grund im Kopf) |
| PH1-15 | Kimi B7 | Einheitsrichtlinie könnte die Landingpage LOCKERN. | Live: Landingpage hat bereits Enforce mit `frame-ancestors 'none'` und `form-action 'self'`; mit PH1-1 (`'self'`) würde sie gelockert | gering | Landingpage bleibt unberührt (eigener Block); H1a gilt für Studio-Subdomains und `verify.` |
| PH1-16 | Kimi B8 | `img-src blob:` unbelegt. | **fällt**: `public/offline-queue.js:75` (`URL.createObjectURL` → `img.src`) — lag nicht in Kimis Bündel (Materialgrenze, s. CLAUDE.md „was eine Spur SIEHT“) | — | keine |

## Zahlen

16 Zeilen (7 DeepSeek — B1/D1 zusammengefasst —, 8 Kimi, 1 eigene Messung vorab), davon 1,5 gefallen (PH1-16 ganz, PH1-10 zur Hälfte), beide an
Material, das der jeweiligen Spur fehlte. Überschneidung: Bericht-Endpunkt (beide), Crawler-Lücken (beide, verschieden
belegt), Mengenvergleich (beide). Nur DeepSeek: Status-200-Zusicherung (blockierend), Header-Modus-Zusicherung,
`blob:`-Begründung. Nur Kimi: WebKit, Doku↔Konstante↔Live, Landingpage. **Keine der beiden Spuren** fand PH1-1
(`frame-ancestors 'none'` bricht die PDF-Vorschau) — DeepSeek schloss aus `default-src 'self'` falsch auf „erlaubt“,
weil `frame-ancestors` auf der EINGEBETTETEN Antwort wirkt, nicht auf der einbettenden Seite.
