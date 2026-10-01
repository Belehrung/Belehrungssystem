# Diffprüfung C5-G2 — Kernmodule, Werkzeuge, Betriebsskripte

Stand 01.10.2026. Zweig `c5g2-kern`, Commit `5c27e0d` (master mit C5-A und Q, ohne E2). Der Bauende meldet: Suite 0, 440 = 440, `diff` EXIT 0, Lint 0. Gebaut sind 21 Nummern. F1 ging an G1, V06-6 ist gestrichen.

## Selbst gelesen (Produktivcode vollständig)

steckbrief (Drei-Zustands-Vertrag, alle Aufrufer über `steckbriefStand`/`istNichtLadbar`), zustaendigkeit (`zustand` extern/teilweise, beide Aufrufer verzweigen ausdrücklich), bezirk-archiv (Token-Wache als `router.use`, nur unter `/intern/bezirk-archiv` eingehängt), demo_daten (Rücknahme über id + studio_id + Demo-Kriterium), export-studio, fehlerbehandler, feiertage, monitoring-alert.sh (Weißliste), schluessel-rotieren, qr-charge, ausmusterung-gegenproben.

Eigene Befunde:

| Nr | Schwere | Befund | Entscheidung |
|---|---|---|---|
| E-1 | sollte | `core/feiertage.js`: Berlin hatte zwei EINMALIGE Feiertage am 8. Mai, 2020 und 2025. Der zweite war per Gesetz beschlossen (Abgeordnetenhaus Juli 2024, Vorlage Drs. 19/1359). Keiner von beiden ist eingetragen. Der Bauende nannte nur 2020, und zwar als „nicht Auftrag“. Weil die Datei „historisch korrekt“ sein soll, ist 2025 ein echter Fehler. | Nacharbeit 1: beide Tage mit Primärquelle eintragen, Test dazu |
| E-2 | Anmerkung | `/intern/export` gibt `erhebungsfehler` zurück, der Hauptserver liest aber nur `r.ok` (`core/offboarding-core.js:98`). Der Betreiber erfährt es also nur über `melde()`, der Kunde über das LIESMICH. Ausreichend, solange `melde()` den Betreiber erreicht. | keine Änderung |
| E-3 | Anmerkung | `ops/schluessel-rotieren.js`: Ein scharfer Lauf mit 0 Zeilen meldet „die Datenbank ist NICHT neu verschlüsselt“. Nach einem schon erfolgten Lauf stimmt das nicht, dann ist sie es bereits. | Nacharbeit 1: Wortlaut „in DIESEM Lauf wurde nichts umgeschlüsselt“ |

## Lesespur flash (6 Befunde, 1,14 $)

Hat jeden Aufrufer der Steckbrief-Lader und von `externVerwaltet` geprüft: Keiner reicht `{fehler:true}` als Wert durch. Der Bezirk-Router hat einen einzigen Einhängepunkt, und `tokenWache` ist sein erster Layer.

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| L-1 | sollte | `einstellungen.js:675` protokolliert nur bei `r.ok === true`. Bei einem Teilerfolg (ok:false, 13 Zeilen angelegt und registriert) entsteht kein Audit-Eintrag. Der neue Test hält genau das fest. | trägt (Code gelesen) | N1: Audit bei `ok === true` oder `angelegt > 0` (nicht bereitsGeladen), Payload mit `teilweise`, Test umdrehen |
| L-2 | sollte | `demo_daten.js` `nimmZurueck`: der `rowCount` des DELETE wird nicht geprüft. Passt das Kriterium nicht, gilt die Zeile still als zurückgenommen. | trägt | N1: `rowCount !== 1` zählt als `rueckgaengig`-Fehler und wird gemeldet |
| L-3 | Anmerkung | `dashboard.js:703` verspricht bei `?demo=geladen` noch „den Cardio-Check“. | trägt | N1: Wortlaut |
| L-4 | Anmerkung | `steckbrief.js:269` behauptet weiter, die Lader machten einen DB-Fehler still zu null. | trägt | N1: Kommentar |
| L-5 | Anmerkung | `/intern/export` loggt `erhebungsfehler` nicht. | trägt | N1: in die Logzeile |
| L-6 | Anmerkung | Wenn auch die Rücknahme scheitert, rät der Hinweis zu „entfernen und erneut laden“. Das Entfernen erreicht die nicht registrierte Zeile aber nicht. | trägt | N1: eigener Hinweis bei `rueckgaengigFehler > 0` |
| L-7 | Anmerkung | `test_feature_steckbrief_nicht_ladbar.js:92` vergleicht mit `WER_STELLEN.length` aus dem geprüften Modul. | trägt | N1: Literal |

## Ausführende Claude-Spur (`/workspace/c5g2-pruef-bericht.md`)

Alle Schutzstellen werden ROT, wenn man sie herausnimmt: Steckbrief an allen 12 Aufrufstellen, A3 in drei Varianten, Zuständigkeit, Export, Monitoring, qr-charge, 413 und Monat. Die Sonde gegen den Bezirk-Router schickte 1596 Anfragen ohne Token. Jede, die den Router erreicht, bekommt 403. Mit Token sieht die Sonde auch andere Antworten, sie wäre also empfindlich. Es gibt genau einen Einhängepunkt.

| Nr | Schwere | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|---|
| C-1 | sollte | d4: Die Route leitet bei einem Wurf aus `seedDemoDaten()` auf `?demo=fehler`, aber keine Zusicherung prüft das (Mutation bleibt 54/0). Geschwisterstelle `/demo-daten/entfernen`: Der catch fällt auf `?demo=entfernt` durch, ohne `melde()` (nicht neu). | trägt (einstellungen.js:731 gelesen) | N1: Test für beide Wege; das Entfernen leitet bei einem Wurf auf einen Fehlerhinweis und meldet |
| C-2 | sollte | Ausstattungs-POST mit nicht ladbarem Regelfall: in Produktion 500 mit „Interner Fehler“. Die Zusicherung „nennt den Grund“ ist nur grün, weil der Test `intern()` durch eine Attrappe ersetzt, die `e.message` durchreicht (`test_feature_steckbrief_nicht_ladbar.js:115`). | trägt | N1: eigene 503-Seite mit dem Grund statt Wurf; Test ohne durchreichende `intern()`-Attrappe |
| C-3 | Anmerkung | Teilladen ohne Audit-Eintrag (= L-1). | trägt | N1 (L-1) |
| C-4 | Anmerkung | „BEIDE Karten“ prüft nur `>= 2`, der Text steht ein drittes Mal da. Der Kommentar in bezirk-archiv zu `?jahr=` ist falsch (der alte Code prüfte dort zuerst den Token). Der Strukturwächter prüft die Layer-Reihenfolge nicht. Kein Test verbietet „Nichts geändert“ im Trockenlauf (k1c bleibt 35/0). | trägt | N1: genaue Anzahl; Kommentar; `tokenWache` als Layer 0 zusichern; Trockenlauf ohne „Nichts geändert“ zusichern |
| C-5 | Anmerkung | `/intern/export` antwortet trotz Erhebungsfehler mit 200 `ok:true` (= E-2). | trägt | keine Änderung |

## Nacharbeit 1 (`0cec1a8..d226824`), selbst gelesen

E-1, E-3, L-1 bis L-7 und C-1 bis C-4 sind umgesetzt, jeweils mit ROT/GRÜN.
- E-1: Quellen aus dem GVBl Berlin selbst gelesen (2019 S. 22; 2024 S. 460).
- C-2: Die 503-Seite wird jetzt mit dem echten `intern()` geprüft.
- C-4: Für `tokenWache` als Layer 0 wird die Mutation b3 ROT.

Stand: Suite 0, 440 = 440, Lint 0.

Neuer Fund des Bauenden: Derselbe Gesetzestext macht auch den **17.06.2028** in Berlin zum einmaligen Feiertag. Das kommt als Nacharbeit 2 dazu.

Eine zweite Prüfrunde entfällt. Die Behebungen sind klein, jede ist mit eigener Gegenprobe belegt, und die neuen Zweige (Weiterleitungen, 503-Seite, Audit-Bedingung) habe ich selbst gelesen.
