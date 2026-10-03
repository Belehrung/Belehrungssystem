# Auftrag C6-E Nacharbeit 2 — Automatik statt Anweisung (Offline-Warteschlange)

Fassung 1, 03.10.2026. Grundlage: Betreiber-Entscheidung 03.10.2026 (`plaene/ENTSCHIEDEN.md`, wörtlich: „Der normale Trainer
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

## Verhalten (Entscheidungen; Abweichung nur mit Messung und Begründung im Bericht)

1. **Speicher automatisch frei machen.**
   - Beim ersten Start fragt die Warteschlange `navigator.storage.persist()` an, einmal, still.
   - Scheitert ein Schreibversuch (Kontingent oder Sperre), räumt sie selbst auf, bevor sie aufgibt. In dieser Reihenfolge,
     jeder Schritt nur mit der eigenen Zuständigkeit:
     - (a) die eigenen schon übertragenen Reste;
     - (b) Caches des Service Workers aus ALTEN Versionen;
     - (c) danach EIN erneuter Schreibversuch.
   - Nie gelöscht wird: ein Eintrag, der nicht vollständig übertragen ist, und ein Foto, dessen Übertragung nicht bestätigt
     ist.
2. **Notkopie der Eingaben.**
   - Scheitert der Schreibversuch auch danach, sichert die Warteschlange die TEXTFELDER des Formulars (ohne Fotos) in einem
     zweiten, kleinen Speicher (z. B. `localStorage`, Grössendeckel), mit `client_uuid`.
   - Gelingt das, gilt die Prüfung als gesichert, OHNE die Fotos. Der Trainer erfährt das in einfachen Worten.
   - Die Warteschlange überträgt die Notkopie wie einen normalen Eintrag und löscht sie erst nach der Bestätigung.
3. **Herkunfts-403 automatisch.**
   - Ist der Eintrag gesichert (IndexedDB oder Notkopie), lädt die Seite sich selbst neu. Das passiert genau einmal, mit
     einer Sperre gegen eine Neuladeschleife (Zähler in `sessionStorage` mit Zeitfenster). Die Warteschlange überträgt
     danach.
   - Ist er NICHT gesichert, wird nie neu geladen. Das Formular bleibt, und die Anwendung versucht das Sichern im
     Hintergrund weiter (z. B. alle 15 s und beim nächsten `online`-Ereignis).
   - Kommt nach dem automatischen Neuladen wieder ein 403, gibt es kein zweites Neuladen. Dann steht der Text für den
     letzten Ausweg (Punkt 4).
4. **Texte für den Trainer** (Wortlaut-Vorschläge; kürzere Fassungen sind erlaubt, wenn der Sinn bleibt):
   - Gesichert, wird übertragen: „Die Prüfung ist auf diesem Gerät gesichert und wird automatisch übertragen.“
   - Gesichert ohne Fotos (Notkopie): „Die Prüfung ist gesichert. Die Fotos konnten auf diesem Gerät nicht gespeichert
     werden – bitte die Defekte zusätzlich der Leitung melden.“
   - Wird neu geladen: „Die Seite wird kurz neu geladen. Die Prüfung bleibt erhalten.“
   - Nichts gesichert, wird weiter versucht: „Die Prüfung ist noch nicht gesichert. Bitte die Seite nicht schließen – es
     wird automatisch weiter versucht.“
   - Letzter Ausweg: „Bleibt diese Meldung, bitte die Leitung informieren.“
   - Ersetzt werden alle Fundstellen aus der Messung oben, auch der Kasten „Offline-Speicher nicht verfügbar“, die beiden
     `alert`-Texte und der Badge-Hinweis „Seite neu laden“.
   - Texte für die Leitung (Konflikte wie `merker_widerspruch`) dürfen sachlich bleiben, aber ohne Technikbegriffe.
5. **Leitung erfährt es.** Gibt es einen bestehenden Meldeweg vom Client zum Server, meldet die Warteschlange eine Notkopie
   und einen gescheiterten Speicher dorthin, sobald Verbindung besteht. Gibt es keinen, wird KEIN neuer gebaut. Das kommt als
   Sammellisten-Punkt in den Bericht.

## Tests (Harness `test_feature_offline_queue_verhalten.js`, Chromium; Sollwerte als Literale)

Jeder Fall mit Gegenprobe:
- Aufräumen:
  - Schreibversuch scheitert, danach gelingt er nach dem Aufräumen.
  - Ein nicht übertragener Eintrag und ein unbestätigtes Foto bleiben dabei unangetastet (Positivkontrolle mit unterscheidbaren
    Einträgen).
- Notkopie:
  - IndexedDB dauerhaft gesperrt: Die Textfelder stehen in der Notkopie und werden übertragen. Die Notkopie ist danach weg.
  - Grössendeckel überschritten: keine Notkopie, Text für „nicht gesichert“.
- Herkunfts-403:
  - Eintrag gesichert: genau ein Neuladen (Attrappe für `location.reload`), danach Übertragung.
  - NICHT gesichert: kein Neuladen, das Formular hält die Eingaben, der Hintergrundversuch läuft.
  - Zweiter 403 nach dem Neuladen: kein zweites Neuladen.
- Ein statischer Wächter verbietet in Tablet-Texten die Wörter der Liste aus Grundsatz 1. Fixtur als Positivkontrolle,
  Kommentare ausgenommen.
- Screenshots (820 px) jedes neuen Textes.

## Rahmen

- Executer-Regeln wie immer (Gegenproben mit Zählung und Marker, volle Suite mit Dateizahl-Ritual, Lint, Marker-Scan).
- `node_modules`, `/tmp/gymdocu-suite.lock`: wie gehabt.
- Bericht: die Messungen oben mit Zahlen, je Verhalten Diff-Kern und Gegenproben ROT/GRÜN, Suite, Screenshots, Abweichungen.

-- Ende des Auftrags --
