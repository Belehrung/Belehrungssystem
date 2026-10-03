# Diffprüfung C6-E Offline-Warteschlange (03.10.2026)

Zweig `c6e-offline`, Stand `74a3881`, 5 Commits ab `bb7e7bc`, 12 Dateien (+598/−38).

**Suite des Bauenden, Lauf 2:**
- SUITE_EXIT=0, 1173 s, 519 = 519 (`diff` EXIT 0).
- Lint 0, Harness 239 PASS, Marker 6 (Prosa).

**Lauf 1:** rot an zwei fremden Wächtern (ein Zeilenanker, eine Abschnittsgrenze); beide nachgezogen.

**R4-3:** gemessen gegenstandslos. Bestätigt von flash am Code: `e.sitzung_ok = true` steht vor dem Write
(`public/offline-queue.js:899`).

**Spuren:**
- Den Produktionsdiff (378 Zeilen) habe ich selbst gelesen; dazu die Screenshots `badge-merker-widerspruch-820.png` und
  `formfehler-herkunft-speicher-820.png`.
- flash, Bündel „Umkreis und Zusicherungen“: 11 Runden, 0,75 $.

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| E1 | Beim Konflikt `merker_widerspruch` sagt der Kopf „konnte nicht übernommen werden“, darunter steht „wurde bereits übertragen“. | trägt (Screenshot; eigener Befund und flash 1) | Nacharbeit 1: eigener Kopf, B16b prüft ihn |
| E2 | `merker_widerspruch` nennt keinen nächsten Schritt nach der Klärung; einziger Knopf ist „Verwerfen“. | trägt | Nacharbeit 1: zweiter Satz „Bestätigt die Leitung, dass sie fehlt: Eintrag verwerfen und die Prüfung neu erfassen.“ Kein „Erneut versuchen“ (bei einem Studiowechsel ginge die Prüfung sonst an das falsche Studio). |
| E3 | Der Live-Submit setzt `zwischenseiteFehler` nicht. Bis zu 60 s steht „sobald wieder Verbindung besteht“, obwohl das Portal antwortet. | trägt (gelesen) | Nacharbeit 1 |
| E4 | `test_feature_c6d2_idempotenz_schema.js` endet jetzt an der nächsten Überschrift. Eine fünfte Anweisung ohne Überschrift fiele heraus. | trägt (logisch) | Nacharbeit 1: kein weiteres `;` bis zum Abschnittsende |
| E5 | Der Hourcycle-Wächter erkennt `hour12:false` zusammen mit `hourCycle` und `hourCycle:'h24'` nicht. | trägt (Regex gelesen) | Nacharbeit 1 |
| E6 | `routes/module.js:1129/1140` (Seil-Foto, Seil-Freigabe) behandeln eine 200-Antwort mit HTML als „Verbindungsfehler“ und kennen den Begriff Zwischenseite nicht. | trägt (gelesen); sie zählen nichts und berühren die Warteschlange nicht | Sammelliste C6E-1 |

## Nacharbeit 2 (Automatik, `c48f6d8..b212be5`, 03.10.2026)

Produktionsdiff selbst gelesen; Lesespuren: Kimi „Umkreis und Zusicherungen“ (Ersatz für flash, SSE-Abbruch) und Kimi „Datenverlust“
(dritte Spur, Anlass: das Aufräumen löscht unwiderruflich). Ergebnis: `raeumeAuf` löscht unter keinem durchgespielten Ablauf etwas
nicht Übertragenes (beide Spuren); Textwächter deckt alle Literale.

| Nr. | Befund | Quelle | Nachgemessen | Folge |
|---|---|---|---|---|
| N2-1 | Live-Weg `r.ok` + Foto-Rest + Speicher voll: kein Merker „Fotos nicht gesichert“, Seite zu = Fotos still weg (vorher wenigstens eine Meldung) | eigene Lesung P1, Kimi K1, Kimi B1 | trägt (`fotosVerlorenSchreiben` nur in `eintragAbschliessen`) | Nacharbeit 3 |
| N2-2 | Wettlauf Sync-Schnappschuss gegen `sichereAusstehend`: Merker bleibt falsch stehen | eigene Lesung P2, Kimi K2 | trägt (IndexedDB-Zweig von `eintragAbschliessen` löscht keinen Merker) | Nacharbeit 3 |
| N2-3 | Sofort-Sync in `sichereAusstehend` nimmt den Kasten „Gesichert“ gleich wieder weg | Kimi K3, Kimi B2 | trägt (`gdSyncQueue` beginnt mit `badgeRender()`) | Nacharbeit 3 |
| N2-4 | Ablehnungsliste fehlt bei später Weiterleitung | Kimi K4 | trägt (gelesen) | Nacharbeit 3 |
| N2-5 | Notkopie-Deckel in Rohzeichen, Server begrenzt urlencodiert auf 1 MB → 413-Schleife möglich | Kimi B3 | trägt (`server.js:195`, `sendeSitzung`) | Nacharbeit 3 |
| — | Doppelter Satz (Badge und Formularkasten) | Bauender | Kosmetik | nicht umgesetzt |

## Nacharbeit 3 (`b212be5..c954ac2`, 03.10.2026)

Produktionsdiff selbst gelesen: alle fünf Punkte (N2-1 bis N2-5) behoben, kein neuer Befund. Gegenproben p1–p5c je ROT,
Harness 302/0, volle Suite EXIT 0, 520 = 520. Lesespur Kimi (Diff + offline-queue.js + Gegenproben): vier Befunde, keiner
blockierend — N3-3 = C6E-2 (schon auf der Sammelliste), N3-1/2/4 → C6E-4/5/6. Ergebnis: mergefähig, CI und Bot entscheiden.
