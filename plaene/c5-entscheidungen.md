# C5/C6 — Punkte, die bewusst NICHT gebaut werden (Betreiber-Entscheidung 30.09.2026)

**ENTSCHIEDEN 30.09.2026: „Alle 18 so lassen“ (Betreiber). Server-Schritte H2-D8/P2-S1: „Später“ — bleiben offen.**

Nach CLAUDE.md bleibt kein bekannter Befund ohne Behebung oder ohne ausdrückliche Entscheidung des Betreibers.
Diese Liste enthält die Punkte, bei denen eine Behebung mehr Risiko als Nutzen bringt oder die Ursache ausserhalb
liegt. Alle übrigen offenen Punkte aus `c5-zustand-30-09.md` werden gebaut: C5-A bis C5-F und Q. Fundstellen stehen
im Zustandsdokument.

| Nr | Punkt | Warum lassen |
|---|---|---|
| 1 | DEP-3 — `body-parser`-Advisory in der Abhängigkeitskette von `express` | Behebbar nur durch ein Anheben von express/body-parser; ein Override kann das Verhalten brechen. Wir heben mit dem nächsten express-Release an (Dependabot). |
| 2 | H2-R2-2 — Zeichen-Riegel des Rücksprungpfads prüft auch den Query-Teil | Das Lockern wäre eine Sicherheitslockerung ohne Nutzen für den Betrieb. |
| 3 | PP4b-19 — feste Tintenschwelle 128 bei der Unterschriftprüfung | Eine adaptive Schwelle bräuchte eine eigene Messreihe echter Unterschriften; die heutige Grenze ist dokumentiert. |
| 4 | PP4b-23 — zwei getrennte Striche gelten als Unterschrift, auch wenn sie kollinear sind | Kollineare Teilstücke wie einen Strich zu werten würde echte kurze Unterschriften ablehnen. |
| 5 | W-1 — der Wächter gegen leere `unlink`-Rückrufe sieht destrukturiertes `unlink` bzw. `rm` über `execSync` nicht | Keine Fundstelle im Bestand; eine Erweiterung erzeugt Fehlalarme. Die Grenze steht im Test. |
| 6 | V25-5 — ein Test benutzt eine feste DB `gymdocu_sta…` | Der Test prüft genau diesen Start gegen eine Bestandsdatenbank; eine andere DB würde den Prüfzweck zerstören. |
| 7 | B1 (Pentest) — ID-Wache ohne Studio-Layout auf HTML-Seiten | Die Fehlerseite ist schlicht, aber korrekt (400); ein Layout-Haken ohne Session-Kontext kann selbst werfen. |
| 8 | V1 (Pentest) — tote Zweige hinter der ID-Wache | Das ist absichtlich Tiefenstaffelung für Direktaufrufer. |
| 9 | QJ-S1 — Spannen „ausserhalb“ zählen nicht zum Verbrauch | Eine geometrische Regel macht bestehende Prüfungen rot und erzeugt Fehlalarme; das heutige Verhalten ist gewollt und dokumentiert. |
| 10 | QJ6-8 — „ausgenommen“ gilt nur für neue Journalzeilen | Eine Rückwirkung auf alte Zeilen würde das Nummernbuch nachträglich ändern (unwiderruflich). |
| 11 | QJ6-MU31 — ein Korrektur-Anfang mitten in einem Abschnitt bleibt Vorspann | Eine Änderung bricht die Positivkontrolle G6. Der Fall ist im Code benannt und kommt im Bestand nicht vor. |
| 12 | QJ9-A — ein fremder Schreiber mitten in einer Zeile ist nicht zuordenbar | Der Fall wird schon heute LAUT gemeldet; die Präfixprüfung ändert nur den Meldetext. |
| 13 | QJ8-B3 — `--art-laut-meldung` ist nicht an die erzeugte Meldung gebunden | Das ist ein reines Betreiberwerkzeug; die Bindung bräuchte eine Seitendatei, die bei vollem Datenträger selbst scheitert. |
| 14 | V08-4 — ein verlorenes PDF wird NICHT automatisch neu erzeugt | Das ist gewollt: ein Nachweis wird nie still ersetzt. |
| 15 | U-LOE1 — kein Statusfilter am UPDATE im Löschweg der Replikation | Der Schiedsrichter ist der Claim; die Anmerkung ist im Code begründet. |
| 16 | U-LOE3 — der Worker stirbt genau zwischen Schritt 1b und 1c der Deprovision | Das Fenster ist extrem schmal; ein Spiegel-Waisen-Scan wäre ein eigener grosser Beitrag. |
| 17 | C2-S12 (Rest) — die Sammelstufe geht bei SIGKILL/OOM verloren | Jeder Einzelfehler steht trotzdem im Server-Log; persistente Fenster wären eine neue Speicherschicht. |
| 18 | R5-12 — der Replikations-Reaper hat keinen Teilindex | Das ist eine Leistungsfrage ohne gemessenes Problem (LIMIT 200). Bei Bedarf wird er nach Messung gebaut. |

## Server-Schritte, die nur der Betreiber machen kann

- **H2-D8:** Ratenbegrenzung für `/login/tablet` in nginx (`limit_req`). Das Risiko: viele Tablets hinter einer IP.
  Ich liefere den Block mit grosszügigem Wert.
- **P2-S1:** `fail2ban-client status` auf dem Server prüfen, ob 400 und 429 eine Sperre auslösen. Ich liefere den
  Befehl.

-- Ende --
