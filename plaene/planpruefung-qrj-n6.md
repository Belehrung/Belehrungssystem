# Planprüfung QR-J Nacharbeit 6

## Runde 1 (30.09.2026, Fassung 1, zwei Spuren `deepseek-flash`: A Leser/Modell, B Werkzeug/Tests)

Rohberichte: `scratchpad/qrjn6p/antwort-a.txt`, `-b.txt`. A 12 Befunde (4 blockierend), B 7 + Test-Bestätigungen
(3 blockierend). Stichproben selbst nachgemessen: `tools/qr-journal.js:647` bricht ab, wenn die ersetzte Zeile nicht
kaputt ist (Wiederholung unmöglich → Sperre ohne Weg); Feldregel mit Komma `core/qr-verbrauch.js:188-197`; Frischprüfung
der Freigabe `:1401` vor dem Haken `:1413`; Meldung `:914-919` nennt `verwerfen`.

Getragen und eingearbeitet (Fassung 2): §1 neu gefasst — Korrektur-Bruchstück als Abschnitt MIT Schlüssel nach der
Chargen-Feldregel (Präfix, Komma, Zeichenkette), bestehende Wege statt „Wiederholung“ und ohne Sonderweg-Verbot (A-B1,
A-B2, B-B2, B-B3, B-B4 entfallen damit); umzustellende Zusicherungen namentlich (A-B3, B-B1); Schreibfehler-Meldung
(A-B4, B-B5); §2 zweiter vollständiger Befehl statt bedingtem Satzteil, Aufrufstellen und Literale (A-B5..B7, B-B6);
T13-Haken (B, §5). Nicht getragen: keiner gefallen; A-B12 (Kürzel nicht auflösbar) betrifft nur das Bündel.

Runde 2 über Fassung 2: s. unten.

## Runde 2 (Fassung 2, dieselben zwei Spuren)

A 13 Befunde (1 blockierend), B 9 (2 blockierend). Selbst nachgesehen: `abschnitteVon` trennt nur an `{"charge_id":`
(MU31 ist EIN Abschnitt); `traegtChargenschluessel` wertet jede `{"typ":`-Zeile schlüssellos; `schreibfehlerEinordnen`
ist für alle drei Befehle gemeinsam. Getragen und eingearbeitet (Fassung 3): Typwort-Riss fail-closed (B-B1), MU31 als
benannte Grenze statt Umstellung (A-B1, B-B2), Kandidat bleibt „alle“ statt enger (A-B12, macht A-B2/B-B8 gegenstandslos),
Schreibfehlertext nur für Korrektur (B-B4), feste Sollzahlen und Typwort-/„nichts lesbar“-Fälle (B-B3), §2 ohne
zweiten Befehl — Weg-Test folgt dem Abbruchtext (A-B4, A-B5, A-B7, A-B8), zweites `verwerfen` nach Widerlegung (A-B10,
B-B6). Keiner gefallen.

## Runde 3 (Fassung 3, eine Spur `deepseek-flash`)

10 Befunde (6 sollte, 4 Anmerkung), keiner blockierend. Selbst nachgesehen: `verwerfbarkeit` Zweig `beginntMitMeta`
`core/qr-verbrauch.js:366-370`; `verwerfen` ohne `--abschnitt`, Erledigung zeilenweit `:317`; `tragendeDeckungen`
`:512` (keine_aufkleber nur mit Schlüssel). Eingearbeitet (Fassung 4): Ort der Unterscheidung (B1), zweites Verwerfen
zeilenweit (B2), `--keine-aufkleber` ausgeschlossen (B3), Präfixregel f/v (B4), Hinweis-Ort und -Test (B5),
Gegenrichtung gepinnt (B6), Schreibfehlertext auf `zeigen` (B4). B7–B10 Anmerkungen (B7 zur MU31-Grenze).
