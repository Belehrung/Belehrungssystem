# Diffprüfung C2 — stille Fehler sichtbar machen (25.09.2026)

Kopf `0182cf3` (Zweig `fix-c2-stille-fehler`, master `00bd9c9` enthalten). Zwei Spuren: Claude ausführend (eigener Baum
`gymdocu-c2-cc`, eigene DB, 20 Befunde), `deepseek-v4-pro` mit Repo-Lesezugriff (6 Befunde). Executer-Bericht: Suite
390 = 390, Lint EXIT 0, 14 Gegenproben rot/grün.

## Runde 1

| Nr. | Spur | Befund | Nachgemessen | Einstufung | Auftrag |
|---|---|---|---|---|---|
| C2-1 | CC 1, DS 1 | V09-3 „fail-closed“ trägt nicht: `finalize()` schreibt die Datei unter ihrem ÖFFENTLICHEN Namen und lehnt danach ab. Wartung: der Verlauf zeigt die Datei als „PDF“, `/pdf` liefert sie aus (200, `%PDF-`), der Knopf „PDF erstellen“ verschwindet; keiner räumt sie auf (nur Verbandbuch räumt selbst) | CC gemessen (m1, Positivkontrolle m7); DS gelesen (`core/retention.js` kennt die Dateien nicht) | **hoch** (falsch behaupteter Schutz; nicht schlechter als master) | atomar veröffentlichen: in Temp-Datei schreiben, registrieren, dann umbenennen; bei Ablehnung Temp-Datei in Quarantäne-Namen (nicht ausgeliefert, nicht gelöscht) |
| C2-2 | CC 4 | Neu-Erstellung überschreibt die registrierte Datei VOR der Registrierung → veraltete `pdf_archiv`-Zeile, Hash passt nicht mehr, Archiv meldet trotzdem „neu erstellt“ (drei Wege) | CC gemessen (m2 B) | mittel | erledigt mit C2-1; Archiv-Meldung an `fehlgeschlagene` koppeln |
| C2-3 | CC 2 | PC2-9-Text widerspricht sich („…Bitte später erneut versuchen.) — bitte NICHT erneut absenden“); wer der ersten Hälfte folgt, erzeugt zweite Prüfung + doppelten Sperrgrund | CC gemessen | mittel | drittes Argument von `intern()` nutzen |
| C2-4 | DS 6 | Spülplan: PDF-Fehler nach Commit ohne „nicht erneut absenden“ → Wiederholung erzeugt zweites Protokoll | gelesen `routes/spuelplan.js:387` | mittel | Satz wie bei Wartung |
| C2-5 | CC 5, DS 2 | Monatslauf: scheitern ALLE Module, geht keine Mail raus (`erstellte.length > 0`) — die neue Fehlerzeile erreicht niemanden; Test erzwingt immer ein erfolgreiches Modul | CC gemessen (m2 A) | mittel | reine Fehler-Mail bei nicht leerem `fehlgeschlagene`; Test Totalausfall |
| C2-6 | CC 6, DS 5 | `melde()`-Drossel: Aufrufe ohne `req` teilen EINE Signatur (`Error:- -`) — ein Modulfehler unterdrückt 15 min andere Studios, `unhandledRejection`, storage-replica | CC gemessen mit den echten Funktionen (m3) | mittel | Quelle in die Signatur, wenn keine Route da ist |
| C2-7 | CC 7, DS 4 | `parseConfig` bei kaputtem JSON: ≥34 Logeinträge je Hub-Aufruf, Telegram alle 15 min dauerhaft; falsches Monats-PDF ohne Hinweis (geschlossene Sonntage als fehlende Kontrollen); leere Zelle alarmiert | CC gemessen (m3, m6) | mittel | je Studio entdoppeln; `konfigFehler` im Editor sichtbar; PDF-Hinweis → Sammelliste |
| C2-8 | CC 14 | V03-2 verschlechtert: bei Ladefehler verschwindet auf der Seite „neue Fotos“ das Upload-Formular | CC gemessen (m5) | mittel | Hinweis UND Formular; Test |
| C2-9 | CC 8 | Hub wertet `wibFehler` nicht aus; bei `spuelStatus=null` verschwindet die Kachel | gelesen | mittel | Hinweis in Kachel |
| C2-10 | CC 9, DS 3 | server.js-Wächter sehen den `try`-Bereich nicht (Mutationen E, E2 grün) | CC gemessen | mittel | → Sammelliste (Hub-Berechnung testbar machen = eigener Beitrag) |
| C2-11 | CC 3 | PC2-9-Zweig „nicht gespeichert“ ungetestet (`gespeichert \|\| true` bleibt grün) | CC gemessen | mittel | Fehler VOR dem Commit testen |
| C2-12 | CC 10–12 | V09-2 Seilkontroll-Pfad, V09-3 Regex-Zweig, `konfigNeueste`-Editor ungetestet | CC gemessen | gering | je ein Fall |
| C2-13 | CC 13 | Sperrklinke 37 zählt eine Kommentarzeile, echt 36; Prosa nennt falsche Dateien | CC gezählt | gering | Kommentare maskieren, 36, Prosa |
| C2-14 | CC 17 | Hub-Kachel im Fehlerzustand 1,21:1 — unauffälliger als „alles gut“ | kontrast.js | gering | `--gd-achtung-kante` als Rahmen |
| C2-15 | CC 18 | bezirk-export: Temp-PDF eines abgelehnten Typs bleibt liegen | gelesen | gering | vor der Erzeugung in `tempPfade` |
| C2-16 | CC 19 | Kommentar nennt falsche `finalize`-Zeilen | gelesen | gering | berichtigen |
| C2-17 | CC 20 | Test stellt `console.error` ohne `finally` zurück; fester `/tmp`-Pfad | gelesen | gering | `try/finally`, `mkdtemp` |
| C2-18 | CC 15 | toter `correction_sheet`-Job hält Health dauerhaft „degraded“, kein Requeue-Weg | CC gemessen (m4) | gering | → Sammelliste |
| C2-19 | CC 16 | nach Ablehnung nach Commit entfallen Admin-Protokollmail und Servicetechniker-Frage | CC gemessen | gering | → Sammelliste |
| C2-20 | DS 3 | Verbandbuch fail-closed: `verify_dokumente`-Zeile bleibt für ein nie ausgeliefertes, gelöschtes Dokument | gelesen | gering | → Sammelliste (Registereintrag zurückziehen = eigene Entscheidung, append-only?) |

Zahlen: 26 Befunde aus zwei Spuren, 20 Zeilen, keiner gefallen. Nur CC: die Auslieferung der Waise (C2-1), Upload-Formular,
Hub, Mutationen, Kontrast, Health. Nur DS: Spülplan-Wiederholung, Verify-Rest. Beide: Aufräumer, Totalausfall-Mail,
Drossel, `parseConfig`, statische server.js-Wächter.

## Runde 2 (25.09.2026, Kopf `2f1c569`, Nacharbeits-Diff `0182cf3..2f1c569`)

Nacharbeit 1 gebaut: Suite 390 = 390 grün (zweiter Lauf; der erste fand drei Folgen der Nacharbeit selbst, behoben),
Lint 0. Eigene Lesung: atomares Veröffentlichen (`.tmp-` im Zielverzeichnis, `rename` nach Registrierung, Quarantäne
unter `PDF_ROOT/_quarantaene`), Signatur mit Quelle nur bei `roh === '-'`, Totalausfall-Mail, `?err=`. Ordnernamen der
Bezirk-Export-Tabelle stimmen mit der Engine überein (`createDocument`-Aufrufe gelesen) — stehen aber jetzt an zwei
Orten. Anlass für Runde 2: Verhaltensänderung an JEDER PDF-Erzeugung. Spuren: Claude ausführend (`gymdocu-c2-cc`,
`scratchpad/c2cc2/`), DeepSeek mit Repo-Lesezugriff.
