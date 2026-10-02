# Diffprüfung C6-B (02.10.2026)

Zweig `c6b-jobs-krypto`, Stand `dc04ab8`. Die volle Suite des Bauenden lief durch, 0 „✗“ im Log
(`/workspace/c6b-suite.log`).

Zwei Lesespuren mit `deepseek-flash`, je ein anderes Bündel:

- **Produktion:** 28 Runden, ~1,40 $.
- **Tests:** 29 Runden. Der erste Versuch brach am Geheimnis-Riegel ab: Im Testdiff stand eine Attrappen-Verbindungszeichenfolge
  `postgresql://x:y@…`. Sie ist geschwärzt, dann wurde der Lauf neu gestartet.

Den Produktionsdiff habe ich selbst gelesen. Jeder Befund unten ist selbst an der Quelle nachgesehen.

## Produktion

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| P-F1 | `quittiere()` nimmt auch `storage_replicate`-Jobs an und meldet „zählt jetzt unter deadQuittiert“. `/intern/health` bleibt trotzdem degraded: `routes/health-intern.js:232-236` zählt `replicas.dead > 0` (`core/storage-replica.js:1408`). Das permanente Scheitern setzt die Replikzeile auf `dead` (`:913-917`). Erfolgsmeldung ohne Wirkung. | trägt | Nacharbeit: Quittieren für `storage_replicate` mit klarer Meldung ablehnen (Zustand steht in `storage_replica`; neu einreihen oder Replik reparieren). Der Text in `docs/PDF_JOBS.md` wird nachgezogen. |
| P-F2 | Der Mitarbeiter-ZIP-Export (`routes/belehrungen.js:1198-1206`) liefert Korrekturblätter nur auf Existenz hin aus, ohne Inhaltsprüfung. Die zugesicherte Eigenschaft „kein falsches Blatt als Nachweis“ hat damit einen dritten Weg. | trägt | Nacharbeit: `pruefeBlattInhalt` vor `archive.file`. Ein Konflikt wird gemeldet, das Blatt nicht eingepackt. Dafür kommt ein Hinweis ins ZIP (Dateiname und Grund, ohne Hashwerte). |
| P-F3 | `ops/pdf-jobs.js` meldet bei einem unerwarteten Fehler „Es wurde nichts geändert.“, auch ohne `commitUngewiss === false`. Nach `core/db.js:488-512` ist ein Wurf ohne Kennzeichen ungewiss. | trägt | Nacharbeit: Bei `PdfJobBetriebFehler` oder `commitUngewiss === false` heisst es „nichts geändert“, sonst „Ausgang unklar, bitte mit `liste --alle` nachsehen“. |
| P-F4 | `neuEinreihen` setzt über `requeue` `priority=0` und `max_attempts=5`. Damit ändert sich bei `storage_replicate` (geplant mit `priority -10`) still die Politik. | trägt (`core/pdf-jobs.js:165-166`) | Nacharbeit: `priority` und `max_attempts` aus der gesperrten Zeile mitgeben. |
| P-U4b | `(() => { …; return true; })() && …` ist eine Zuweisung im Prüfausdruck, die Zusicherung „immer wahr“. | trägt NICHT: Die Konjunktion prüft dahinter weiter, das ist nur Stil. | – |

## Tests

| Kennung | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| T-1 | H3 (`test_feature_c6b_korrekturblatt_inhalt.js`) kann nicht rot werden. Ohne `routes/korrekturen.js:404` (`existsSync` → 404) liefert `:415` (`zustand === 'fehlt'`) denselben Status und Wortlaut. | trägt | Nacharbeit: Fixtur mit einem nicht vergleichbaren Hash (`ungeprueft`, z. B. Grossbuchstaben) und fehlender Datei. Dort ist `:404` der einzige Riegel. Gegenprobe: `:404` entfernen → rot. |
| T-2 | Die „unabhängige“ Referenz des alten Signaturbild-Weges importiert `zeichenmass` aus dem Prüfling (`:88`) und benutzt `regel.luminanz` und `bewerteUnterschrift` mit. Rot wird nur über die vier Anker-Literale. | trägt (Zeile 88 gelesen) | Nacharbeit: Das Zeichenmass in der Referenz als Literalregel nachschreiben. Die Regelfunktionen dürfen geteilt bleiben, wenn der Kommentar das ehrlich sagt; ihre Prüfung ist nicht Gegenstand von PP4b-21. Gegenprobe: `zeichenmass` im Prüfling ändern → rot. |
| T-3 | `quittiert_am` wird nur auf sein Format geprüft. Entfernt man `AT TIME ZONE 'Europe/Berlin'`, bleibt alles grün. | trägt | Nacharbeit: Wert gegen die Berliner Zeit ± Toleranz prüfen. Gegenprobe: ohne `AT TIME ZONE` → rot (die Suite läuft mit UTC; die Abweichung beträgt dann ≥ 1 h). |
| T-4 | Die Erlaubnisliste `melderUeberspringen` vergleicht nur die Dateimenge, nicht die Anzahl je Datei. | trägt. Die Schwäche bestand schon vorher für `foto-reaper`, ist also nicht neu, nur jetzt breiter. | Nacharbeit: Anzahl je Datei als Literal (Kommentarzeilen nicht mitzählen; den Positivfall zuerst selbst zählen). |
| T-5 | Der `setTimeout`-Stub in `test_feature_pdf_worker_claim_backoff.js:125-131` hängt mit `ms < 100000` an keiner Konstante. | trägt | Nacharbeit: Er wird an `WACHHUND_MS` aus dem Worker gebunden. |
| T-6 | Zwei neue Tests haben einen Wachhund mit `unref()` ohne `fertig`-Wächter (`…korrekturblatt_inhalt.js:67`, `…pdf_jobs_quittieren.js:59`). Ein leerlaufender Kreis endet dann mit Exit 0. | trägt | Nacharbeit: `fertig`-Wächter im `exit`-Handler, wie in den Schwestertests. |
| T-7 | Die Fixtur „falsche Form“ des Entprell-Zustands fehlt; ebenso eine Job-Kennung > 2³¹-1 (Audit `bezug_id` null). | trägt | Nacharbeit: je eine Fixtur. |
| T-8 | Wettlauf: Die Datei verschwindet zwischen Existenzprüfung und Hash. | Fixtur aufwendig | Sammelliste |

## Offene Punkte

Was nach Nacharbeit 1 übrig bleibt, steht in `offene-befunde-c6b.md`.
