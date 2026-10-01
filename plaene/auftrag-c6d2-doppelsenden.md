# Auftrag C6-D2 — Doppelsenden, Entwurfsverlust, Import-Rennen, Zeitlimit (Extrarunde C6)

Fassung 1, 01.10.2026. Repo GymDocu, Stand master (aktuell).

**Herkunft und Einzelheiten:** `/home/user/Belehrungssystem/plaene/c6-zustand-01-10/` mit `z2.md` (D-E1, c5d#2, B7,
H1a-S5), `z5a.md` (V02-4, V03-3) und `z5b.md` (V05-6, V08-5). Jeder Abschnitt nennt Beleg, Zustand, Behebung, Risiko
und Test. Alles sind FUNDORTE: zuerst neu messen. Widerspricht der Code, abbrechen und melden.

**Modell.** Standard-Executer. Mehrere Idempotenz-Wege nach einem vorhandenen Vorbild (`client_uuid` im
Verbandbuch/Sichtprüfung) und eine Nebenläufigkeitsprobe. Diese braucht einen Beleg, dass es zur Überschneidung kam.

**Arbeitsbaum und Datenbank:** `/workspace/gymdocu-c6d2`, Zweig `c6d2-doppelsenden` ab `origin/master`, Einzeltests
nur gegen `gymdocu_c6d2_test`. Suite und Gegenproben wie üblich. Migrationsnummer: die nächste freie zur Bauzeit, bei
einer Kollision beim Merge umnummerieren (Prüfsummenliste `ERWARTET` nachziehen).

## Punkte

1. **c5d#2 — Wartungsprüfung idempotent (sollte).**
   - `routes/wartung.js:1433` legt bei jedem POST eine neue `wartung_pruefungen`-Zeile an. Der Code nennt die Folge
     selbst (`:1788`, `:1805`).
   - Behebung nach dem Vorbild `routes/sichtpruefung.js:2433-2461`:
     - Das Formular trägt ein verstecktes `client_uuid`.
     - Migration: Spalte `client_uuid TEXT` plus `UNIQUE (studio_id, client_uuid)`, mehrere NULL erlaubt. Dazu
       derselbe Eintrag im Schema in `core/db.js`.
     - Ein Replay mit bekanntem `client_uuid` liefert die Erfolgsseite des ersten Vorgangs. Es entstehen keine
       zweite Zeile, keine zweite Fälligkeit, keine zweite Sperre, Mail oder PDF.
   - Altformulare ohne Feld verhalten sich wie heute. Diese Grenze wird benannt.
   - Test: zweimal derselbe POST mit gleichem `client_uuid`. Dann ist `COUNT(*)` gleich 1, `naechste_faelligkeit`
     wurde einmal gesetzt, und es gibt keine zweite Sperrzeile. Positivkontrolle: ein anderer `client_uuid` → 2.
2. **V03-3 — Spülprotokoll idempotent (sollte).**
   - `routes/spuelplan.js:364-386` hat weder `client_uuid` noch UNIQUE.
   - Dasselbe Muster wie Punkt 1 auf `spuel_protokolle` anwenden. Beim Replay entstehen kein zweites
     Audit-Glied und kein zweites PDF.
   - Test wie in Punkt 1.
3. **V02-4 — Doppelter Reinigungs-POST wird als solcher erkannt (Anmerkung).**
   - `routes/getraenkeanlage.js:558-583`: Ein `ON CONFLICT DO NOTHING` greift, aber die Antwort lautet trotzdem
     „gespeichert“.
   - Neu: Die Rückgabe trägt den Grund `bereits_vorhanden`, und die Antwort sagt „Diese Reinigung war bereits
     gespeichert.“
   - Test: zweimal identisch absenden. Die zweite Antwort enthält den neuen Text, die Zeilenzahl ist 1.
4. **D-E1 — Manueller Sperr-Mailversand während eines laufenden Versands (sollte).**
   - `routes/wartung.js:1919-1920` setzt `mail_gesendet_am` VOR dem Senden bedingungslos auf NULL. Damit löscht ein
     zweiter Klick den Claim eines noch laufenden ersten Versands; es gehen zwei Mails hinaus.
   - Neu: Zurückgesetzt wird nur, wenn KEIN frischer Claim (`MAIL_CLAIM_PRAEFIX`, `core/defekt_mailer.js:231`)
     ansteht. Bei `rowCount 0` kommt 409: „Für diese Sperre wird gerade eine Mail gesendet — bitte kurz warten.“
   - Ein veralteter Claim (älter als die Verfallsfrist des Mailers) darf zurückgesetzt werden. Dieselbe Frist wird
     benutzt, keine zweite Konstante.
   - Die Kommentare `core/defekt_mailer.js:190-191` und `:256-257` werden nachgezogen.
   - Test: Erweiterung von `test_feature_c5d_stille_fehler.js:561-573` (`sendMailTor`).
     - POST 1 hängt am Tor, dann kommt POST 2 → 409.
     - Tor öffnen → genau 1 Mail, keine Meldung `versand_bestaetigen_verfehlt`.
     - Beleg der Überschneidung: POST 2 kam an, WÄHREND POST 1 am Tor stand (Ereignisfolge).
5. **B7 — Kein Entwurfsverlust durch den Senden-Knopf im Sperr-Banner (sollte).**
   - `routes/wartung.js` hat keine Entwurfssicherung. Das Sende-Formular (`:428-434`) navigiert im selben Fenster
     weg vom offenen Prüfformular.
   - Behebung: `ENTWURF_SCRIPT` wird eingebunden wie in `routes/sichtpruefung.js`. Die Unterschrift und
     personenbezogene Felder tragen dabei `data-kein-entwurf`, genauso wie dort (`:1135ff`); die Liste der Felder
     misst du am Vorbild.
   - Kein `target="_blank"`: Popup-Blocker, und im Altfenster bliebe eine Doppelabgabe möglich.
   - Test: Die Geräteseite mit offener Sperre enthält den `ENTWURF_SCRIPT`-Marker und `data-kein-entwurf` an der
     Unterschrift. Dazu eine Chromium-Probe: Eingaben machen, „Senden“ klicken, zurück → die Eingaben (außer der
     Unterschrift) sind wiederhergestellt.
6. **V05-6 — Import serialisiert je Studio (sollte).**
   - Mitarbeiter-Import (`routes/admin/mitarbeiter.js:673-827`) und Geräte-CSV-Import (`routes/admin/geraete.js:6265-6337`)
     suchen je Zeile und legen dann an, ohne Sperre. Zwei gleichzeitige Commits legen dieselbe Zeile zweimal an.
   - Behebung: Beide Commit-Handler laufen in EINER Transaktion, die zuerst
     `pg_advisory_xact_lock(hashtextextended('import:<art>:' || studio_id, 0))` nimmt und danach erneut sucht.
   - Das ist eine neue Sperrklasse. VORHER die Reihenfolge messen und als Kommentar daneben schreiben: Welche
     anderen Sperren nimmt der Weg danach (etwa den Studio-Lock über `auditAppend`)? Nimmt irgendein anderer Weg
     diese in umgekehrter Reihenfolge? Ergibt sich ein Kreis, ABBRECHEN und melden (CLAUDE.md, „Transaktionen und
     Sperren“).
   - Test nach dem Muster `test_feature_seil_freigabe_race.js`: zwei parallele Commits mit derselben neuen Zeile →
     genau 1 Zeile. Die Überschneidung wird belegt, z. B. über `pg_locks NOT granted` während des zweiten Commits.
     Gegenprobe: ohne Sperre → 2 Zeilen.
7. **H1a-S5 — `/csp-bericht` mit eigenem Zeitlimit (sollte).**
   - `routes/csp-bericht.js:303-326` liest den Rumpf ohne Timer. Ein langsamer Client bindet die Verbindung bis zum
     Node-Standard (300 s).
   - Neu: 15 s Timer. Läuft er ab, folgt `req.destroy()`; bei `end`, `error` und 413 wird er gelöscht. Den Kommentar
     `:296-302` nachziehen.
   - Test: rohe `http.request` mit gesetzter `Content-Length` und halbem Rumpf. Der Socket schließt innerhalb von
     15 s + Toleranz. Die Zeitmessung liegt im Testprozess.
8. **V08-5 — `hilfeButton(key, position)`: Parameter ohne Wirkung (Anmerkung).**
   - `core/hilfe-texte.js:1630`: Kein Aufrufer übergibt `position`. Der Parameter wird entfernt.
   - Ein Wächter, dass `hilfeButton` keinen zweiten Parameter hat, ist NICHT nötig: Das Entfernen macht die Lüge
     weg, und ein Wächter darauf wäre reine Formprüfung.

## Bericht

- Je Punkt: die neue Messung, der Diff, die Gegenproben wörtlich.
- Für Punkt 6 die gemessene Sperrreihenfolge.
- Die volle Suite mit `diff` EXIT 0.
- Lint.
- Für Punkt 5 ein Screenshot (Tablet 820 px) der wiederhergestellten Eingaben.
