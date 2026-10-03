# Auftrag C6-E Nacharbeit 2 — Automatik statt Anweisung (Offline-Warteschlange)

Fassung 2, 03.10.2026 (nach Planprüfung flash + Kimi). Grundlage: Betreiber-Entscheidung 03.10.2026 (`plaene/ENTSCHIEDEN.md`, wörtlich: „Der normale Trainer
kann mit den Begriffen erst Speicher frei machen nichts anfangen. Das muss komplett automatisch passieren.“).

Repo GymDocu, Zweig `c6e-offline` (Stand nach Nacharbeit 1), Arbeitsbaum `/workspace/gymdocu-c6e`, Einzeltests gegen
`gymdocu_c6e_test`.

**Einordnung: sehr komplex.**
- Es gibt einen Zielkonflikt mit dem Grundsatz „nichts zerstört die letzte Kopie einer Eingabe“: Ein automatisches Neuladen
  verwirft ein Formular, dessen Eingaben nirgends gespeichert sind.
- Ein Fehler kann grün aussehen: Der Test beweist, dass neu geladen wird, aber nicht, dass die Eingaben vorher gesichert waren.

## Grundsatz (nicht verletzen)

1. Kein Text, den ein Trainer sieht, verlangt eine technische Handlung („Speicher freimachen“, „Seite neu laden“,
   „Verbindung prüfen“, „Herkunft“, „Zwischenspeicher“, „Offline-Speicher“).
   - Erlaubt ist nur, was ein Laie versteht und tun kann, als letzter Ausweg: „Seite offen lassen“ oder „Leitung
     informieren“.
2. Die Anwendung räumt selbst auf, wiederholt selbst und lädt die Seite selbst neu. Jede dieser Handlungen ist an eine
   Bedingung gebunden, unter der sie keine Eingabe zerstört.
3. Die Grundsätze im Kopf von `public/offline-queue.js` bleiben:
   - keine gültige Prüfung in eine Sackgasse;
   - kein neuer Kettenstopp wegen eines Zähler- oder Speicherausfalls;
   - nichts zerstört die letzte Kopie.

## Zuerst messen (vor dem Bauen, mit Zahlen in den Bericht)

- Welche Texte sieht ein Trainer heute mit technischer Handlung? Vollständige Liste aus `public/offline-queue.js` (Badge,
  Kästen, `alert`, `formFehler`) und den eingebetteten Skripten in `routes/` für Tablet-Seiten (Seilkontrolle, Sichtprüfung,
  Verbandbuch). Jede Fundstelle mit Datei:Zeile und Wortlaut.
- Was liegt im IndexedDB-Speicher der Warteschlange? Welche Einträge oder Teile davon sind schon übertragen und dürfen weg
  (Fotos eines Eintrags mit `sitzung_ok`, deren Übertragung bestätigt ist)? Wird heute schon aufgeräumt, und wo?
- Welche Caches legt `core/service-worker.js` an? Gibt es alte Versionen, die stehen bleiben?
- Was liefert `navigator.storage.persist()` / `estimate()` im Chromium-Harness?
- Wann tritt der Herkunfts-403 in der Praxis auf (`core/csrf-schutz.js`: Origin/Referer-Host ≠ Host)?
  - Hilft ein Neuladen wirklich, und warum? Das ist vor dem Bau zu belegen, nicht anzunehmen.
  - Hilft es nicht, gibt es auch kein automatisches Neuladen. Dann ist der Fall zu melden.

## Planprüfung (03.10.2026): was sich gegenüber Fassung 1 ändert

Spur A (flash, 7 Befunde) und Spur B (Kimi, 9 Befunde) kamen unabhängig auf denselben blockierenden Befund. Ein automatisches
Neuladen vernichtet Fotos, die nur noch im Formular liegen, und halb ausgefüllte Formulare. Ausserdem ändert ein Neuladen den
Ursprung der Seite nicht (`core/csrf-schutz.js` vergleicht Origin- bzw. Referer-Host mit Host). Ob es bei der
Herkunftsprüfung überhaupt hilft, ist deshalb offen. Fassung 2 regelt daher:

## Verhalten (Fassung 2; Abweichung nur mit Messung und Begründung im Bericht)

1. **Herkunfts-403: zuerst messen, ob Neuladen hilft.**
   - Im Harness und am Code ist zu belegen, in welchem Ablauf ein 403 entsteht, den ein Neuladen behebt. Beispiele: eine Seite
     aus dem Service-Worker-Cache unter einem anderen Host, ein fehlender Origin- und Referer-Header bei einem bestimmten Weg.
   - **Hilft es nirgends:** Es gibt KEIN automatisches Neuladen, und der Badge-Hinweis „Seite neu laden“ entfällt. Ein Eintrag
     mit 403 bleibt gesichert in der Warteschlange und zählt nicht, wie heute.
     - Der Trainer liest den Text für „gesichert“ (Punkt 4).
     - Hält der 403 über mehrere Syncs an, steht zusätzlich der letzte Ausweg „bitte die Leitung informieren“.
   - **Hilft es in einem gemessenen Ablauf:** Neu geladen wird nur, wenn ALLE drei Bedingungen gelten.
     - (a) Jeder Eintrag der Seite ist vollständig in IndexedDB gesichert, Fotos eingeschlossen.
     - (b) Auf der Seite liegt keine ungesicherte Eingabe: kein Datei-Feld mit Datei, kein Formular mit Inhalt ausser dem eben
       gesicherten.
     - (c) In dieser Sitzung wurde noch nicht neu geladen.
     - Die Sperre zählt „einmal je Sitzung“ ohne Ablaufzeit. Zurückgesetzt wird sie nur durch eine echte App-Antwort ohne
       Herkunftsfehler. Ist `sessionStorage` nicht schreibbar, wird nie neu geladen.
     - Das zweite, ungezählte Neuladen der Ausweichseite (`core/service-worker.js:226`) zählt mit oder wird an dieselbe Sperre
       gebunden.
2. **Speicher automatisch frei machen, nur mit genauem Kriterium.**
   - Beim ersten Start wird `navigator.storage.persist()` angefragt, still. Das Ergebnis kommt in den Bericht. Es schützt vor
     Räumung durch den Browser, nicht vor vollem Kontingent.
   - Löschbar ist NUR ein Eintrag mit `status === 'offen'`, `fotos.length === 0`, `(fotos_abgelehnt||[]).length === 0` und
     bestätigter Sitzung (ein Rest, dessen Löschung früher gescheitert ist).
     - Nie löschbar sind Konflikte, Einträge mit unbestätigten Fotos (`sitzung_ok` allein reicht NICHT) und Einträge mit
       `fotos_abgelehnt`.
     - Nie aufgeräumt wird, während `syncLaeuft`.
   - Die Caches des Service Workers räumt die Seite NICHT auf (sie kennt den aktiven Cache-Namen nicht). Zeigt die Messung
     stehengebliebene Alt-Caches, geht ein Auftrag per `postMessage` an den aktiven Worker, der seinen eigenen Namen kennt;
     sonst entfällt der Schritt.
   - Die Freigabemenge des Aufräumens wird gemessen und im Bericht getrennt ausgewiesen. Ein grüner Test heisst nicht, dass
     das Aufräumen das Speicherproblem löst.
3. **Notkopie der Eingaben.**
   - Scheitert der Schreibversuch auch nach dem Aufräumen, sichert die Warteschlange alle Textfelder des Formulars in einem
     zweiten Speicher (`localStorage`, Grössendeckel). Dazu gehört die UNTERSCHRIFT, ohne Ausnahme.
     - Reicht der Deckel nicht für alle Textfelder samt Unterschrift, gibt es KEINE Notkopie, sondern den Weg „nicht
       gesichert“.
   - Die Notkopie trägt DIESELBE `client_uuid` wie der spätere Eintrag. Landet derselbe Eintrag später auch in IndexedDB, gibt
     es genau eine Sitzung auf dem Server (Replay).
   - Übertragen wird die Notkopie über einen Weg, der auch läuft, wenn IndexedDB gar nicht geöffnet werden kann. Der Test
     sperrt dafür `indexedDB.open`, nicht nur `put`.
   - Der Badge zählt und zeigt Notkopien wie offene Einträge. Sie bleiben über jedes Neuzeichnen hinweg sichtbar, nicht als
     einmalige Meldung.
   - Nach einer Notkopie bleibt das Formular stehen, mit den Fotos im Datei-Feld. Es wird NICHT zurückgesetzt; das Absenden ist
     gesperrt, damit keine zweite `client_uuid` entsteht. Im Hintergrund wird weiter versucht (alle 15 s und bei `online`), den
     VOLLEN Eintrag samt Fotos in IndexedDB zu sichern. Gelingt das, entfällt die Notkopie.
4. **Texte für den Trainer als Zustandsmatrix.**
   - Jeder Text ist in dem Zustand wahr, in dem er erscheint. „Automatisch“ wird nur mit der Bedingung zugesagt, unter der es
     auf dem Zielgerät tatsächlich passiert.
   - Vorschläge (kürzer erlaubt, Sinn bleibt):
     - Gesichert (IndexedDB): „Die Prüfung ist auf diesem Gerät gesichert und wird übertragen, sobald Verbindung besteht und
       diese Seite geöffnet ist.“
     - Gesichert als Notkopie, Fotos noch nicht: „Die Prüfung ist gesichert, die Fotos noch nicht. Bitte diese Seite geöffnet
       lassen – es wird automatisch weiter versucht.“
     - Fotos endgültig nicht sicherbar (Formular verlassen oder Fotos verfallen): „Die Prüfung ist gesichert, die Fotos
       konnten nicht gespeichert werden. Bitte die Leitung informieren.“ Kein Aufruf, Defekte doppelt zu melden: Die Defekte
       SIND übertragen.
     - Nicht gesichert: „Die Prüfung ist noch nicht gesichert. Bitte die Seite nicht schließen – es wird automatisch weiter
       versucht.“
     - Letzter Ausweg (Zustand hält über mehrere Versuche an): „Bitte die Leitung informieren.“
   - Ersetzt werden alle Fundstellen der Messung in `public/offline-queue.js`. Den Wortlaut der Tests, der sie heute festhält,
     zieht der Bau mit; die Liste kommt in den Bericht:
     - `test_feature_seil_tablet_ux.js:86/89`;
     - `test_feature_offline_queue_verhalten.js` unter anderem 505, 538, 770, 882, 931, 996, 1049–1087;
     - die Sollzahlen Teil B und Summe.
   - Texte auf anderen Tablet-Seiten mit technischer Handlung kommen in eine Liste im Bericht, mit Datei:Zeile, und auf die
     Sammelliste: `core/nachtrag-ergebnis.js:79-81/102-105`, `routes/module.js:2808`, `routes/verbandbuch.js:684`. Das
     Verbandbuch lädt `offline-queue.js` nicht.
5. **Leitung erfährt es:** Einen Meldeweg vom Client gibt es nicht (gemessen: `/csp-bericht` nimmt nur CSP-Berichte). Es wird
   KEIN neuer gebaut. Zwei Punkte kommen auf die Sammelliste: der Meldeweg und das Merkmal „Fotos nicht sicherbar“ am
   Protokoll.

## Tests (Harness `test_feature_offline_queue_verhalten.js`, Chromium; Sollwerte als Literale)

Jeder Fall mit Gegenprobe:
- Aufräumen:
  - Ein löschbarer Rest wird entfernt. Der Schreibversuch gelingt danach.
  - NICHT angetastet werden, mit unterscheidbaren Einträgen: `sitzung_ok` mit unbestätigtem Foto, ein Konflikt,
    `fotos_abgelehnt`, ein Eintrag während `syncLaeuft`.
- Notkopie:
  - IndexedDB.open gesperrt: Die Textfelder samt Unterschrift (realistisch grosse Fixtur) stehen in der Notkopie. Sie werden
    übertragen, danach ist die Notkopie weg. Der Badge zählt sie bis dahin.
  - Unterschrift weglassen (Mutation) macht den Test ROT.
  - Deckel zu klein: keine Notkopie, Text „nicht gesichert“.
  - Gleiche `client_uuid` in Notkopie und IndexedDB: genau eine Sitzung.
  - Nach der Notkopie bleibt das Formular mit Datei stehen, das Absenden ist gesperrt. Ein Hintergrundversuch sichert den
    vollen Eintrag, danach ist die Notkopie weg.
- Herkunft:
  - Hilft Neuladen nicht: kein `location.reload` (Attrappe zählt 0), der Text für „gesichert“, nach N Syncs der letzte Ausweg.
  - Hilft es: alle drei Bedingungen einzeln verletzt ergibt 0 Neuladungen; alle erfüllt ergibt genau 1; ein dritter 403 ergibt
    weiter 1; ohne `sessionStorage` 0.
- Ein statischer Wächter verbietet in `public/offline-queue.js` die Wörter aus Grundsatz 1 in Texten für Trainer. Fixtur als
  Positivkontrolle, Kommentare ausgenommen.
- Screenshots (820 px) jedes Zustands der Textmatrix.

## Rahmen

- Executer-Regeln wie immer (Gegenproben mit Zählung und Marker, volle Suite mit Dateizahl-Ritual, Lint, Marker-Scan).
- `node_modules`, `/tmp/gymdocu-suite.lock`: wie gehabt.
- Bericht: die Messungen oben mit Zahlen, je Verhalten Diff-Kern und Gegenproben ROT/GRÜN, Suite, Screenshots, Abweichungen.

-- Ende des Auftrags --
