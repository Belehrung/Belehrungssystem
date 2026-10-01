# Auftrag C6-D2 — Doppelsenden, Entwurfsverlust, Import-Rennen, Zeitlimit (Extrarunde C6)

Fassung 2, 01.10.2026. Planprüfung flash mit 12 Befunden (`scratchpad/c6plan/flash-c6d2.txt`). Befund 1 ist selbst
nachgemessen und trägt: Laut Hausregel `core/integritaet.js:72-74` nimmt jede Transaktion mit `auditAppend` den
Studio-Lock L als ERSTE Sperre, davor ist kein anderer Advisory-Lock erlaubt. Die übrigen Befunde sind
eingearbeitet. Repo GymDocu, Stand master (aktuell).

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
   - Die Replay-Prüfung steht IN der Transaktion, NACH der dort schon genommenen Sperre: Geräte-Lock
     `routes/wartung.js:1424` bzw. Studio-Lock über `auditTx` beim Spülplan. So laufen zwei gleichzeitige Absendungen
     nicht in einen 23505/500, sondern die zweite wird zum Replay (flash 9). Die Unique-Regel bleibt als zweiter
     Riegel.
   - Der Replay-Zweig ist ein früher Ausstieg nach dem Multer-Upload. Er räumt die Datei mit `uploadWegraeumen()` weg,
     wie es jeder frühe Ausstieg dort muss (`:1173-1177`, `:1201`; flash 8).
   - Altformulare ohne Feld verhalten sich wie heute. Diese Grenze wird benannt.
   - Test, zweimal derselbe POST mit gleichem `client_uuid` (nacheinander UND gleichzeitig):
     - `COUNT(*)` ist 1, `naechste_faelligkeit` wurde einmal gesetzt, es gibt keine zweite Sperrzeile.
     - Außerdem keine zweite PDF-Datei, keine zweite Mail (Mailattrappe zählt; die Mail läuft per `setImmediate`,
       also nachher abwarten) und kein zweites Audit-Glied (flash 7).
     - Positivkontrolle: ein anderer `client_uuid` ergibt 2.
2. **V03-3 — Spülprotokoll idempotent (sollte).**
   - `routes/spuelplan.js:364-386` hat weder `client_uuid` noch UNIQUE.
   - Dasselbe Muster wie Punkt 1 auf `spuel_protokolle` anwenden, mit der Prüfung IN der `auditTx` nach dem
     Studio-Lock. Beim Replay entstehen kein zweites Audit-Glied und kein zweites PDF. Gemessen wird das, nicht nur
     `COUNT(*)`.
   - Test wie in Punkt 1.
3. **V02-4 — Doppelter Reinigungs-POST wird als solcher erkannt (Anmerkung).**
   - `routes/getraenkeanlage.js:558-583`: Ein `ON CONFLICT DO NOTHING` greift, aber die Antwort lautet trotzdem
     „gespeichert“.
   - Neu: Die Rückgabe trägt den Grund `bereits_vorhanden`, und die Antwort sagt „Diese Reinigung war bereits
     gespeichert.“
   - Der Tablet-Weg ist der JSON-Weg (`?antwort=json`, danach `window.location.href = data.weiter`;
     `routes/getraenkeanlage.js:421-440`). `bereits_vorhanden` geht deshalb auch dort mit, etwa als `?bereits=1`, und
     der Zielbanner zeigt den neuen Text (flash 10).
   - Test über BEIDE Wege (Formular und JSON): Die zweite Antwort bzw. der Zielbanner enthält den neuen Text, die
     Zeilenzahl ist 1.
4. **D-E1 — Manueller Sperr-Mailversand während eines laufenden Versands (sollte).**
   - `routes/wartung.js:1919-1920` setzt `mail_gesendet_am` VOR dem Senden bedingungslos auf NULL. Damit löscht ein
     zweiter Klick den Claim eines noch laufenden ersten Versands; es gehen zwei Mails hinaus.
   - Neu: Zurückgesetzt wird nur, wenn KEIN frischer Claim (`MAIL_CLAIM_PRAEFIX`, `core/defekt_mailer.js:231`)
     ansteht. Bei `rowCount 0` kommt 409 mit neutralem Text, denn ein frischer Claim kann auch von einem
     gestorbenen Prozess stammen (flash 11): „Für diese Sperre läuft ein Versand, oder sein Stand ist unklar. Erneut
     senden ist ab <Uhrzeit> möglich.“ Die Uhrzeit ist das Verfallsende des Claims.
   - Zwei bestehende Wächter halten genau diese Stelle fest. Beide fachlich nachziehen, nicht streichen
     (flash 5):
     - die Leserliste der `mail_gesendet_am`-Zeilen in `routes/wartung.js` (Anzahl und Reihenfolge);
     - der fail-closed-Test, der `/SET mail_gesendet_am=NULL/` stubbt.
     Die Fundstellen per `grep` messen.
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
   - `ENTWURF_SCRIPT` hilft hier NICHT: Es puffert keine `hidden`-Felder. Unterschrift und Statuswerte der Prüfung
     sind aber `hidden` (flash 6).
   - Behebung: Das Sende-Formular schickt per `fetch` ohne Seitenwechsel und zeigt das Ergebnis im Banner an. Ohne
     JavaScript bleibt der normale POST als Rückfall.
     - Die Route liefert dafür bei `?antwort=json` JSON (Muster `routes/getraenkeanlage.js`), sonst wie heute.
     - Das Skript hält die geltende CSP ein: kein Inline-Handler. Das Muster der übrigen Seitenskripte mit
       Nonce bzw. Datei misst du.
   - Test (Chromium):
     - Eingaben machen, darunter Statusklicks und eine Unterschrift.
     - „Senden“ klicken. Die URL bleibt gleich, die Eingaben einschließlich der `hidden`-Werte sind unverändert, und
       der Banner zeigt das Ergebnis.
     - Der Mailstub zählt 1.
     - Positivkontrolle ohne JS: der normale POST.
6. **V05-6 — Import serialisiert je Studio (sollte).**
   - Mitarbeiter-Import (`routes/admin/mitarbeiter.js:673-827`) und Geräte-CSV-Import (`routes/admin/geraete.js:6265-6337`)
     suchen je Zeile und legen dann an, ohne Sperre. Zwei gleichzeitige Commits legen dieselbe Zeile zweimal an.
   - Behebung OHNE neue Sperrklasse: JEDE Importzeile läuft in einer EIGENEN Transaktion (`auditTx`).
     - Sie nimmt den Studio-Lock L als ERSTE Sperre, wie die Hausregel `core/integritaet.js:72-74` verlangt, sucht
       dann erneut, legt an und schreibt das Audit mit derselben Verbindung.
     - Die Zeilen bleiben einzeln fehlertolerant: Ein DB-Fehler kippt nur die eigene Zeile, nicht die folgenden
       (flash 3).
   - Einladungsmails (`sendeMitarbeiterEinladung`) gehen erst NACH dem COMMIT der jeweiligen Zeile hinaus. Bei einem
     Rollback gibt es keine tote Einladung.
   - Das literale Sperr-Inventar (`test_feature_geistersperre_nachtrag_rennen.js:1081-1161`) muss sich dadurch nicht
     ändern, denn es gibt keine neue Sperrklasse. Wenn doch, ziehst du es fachlich nach.
   - Testdaten (flash 4):
     - Mitarbeiter OHNE E-Mail; für Zeilen mit E-Mail verhindert der Unique-Index `core/db.js:728-729` die Dublette
       schon heute.
     - Geräte beliebig; dort gibt es keine Unique-Regel.
   - Test nach dem Muster `test_feature_seil_freigabe_race.js`:
     - Zwei parallele Commits mit derselben neuen Zeile → genau 1 Zeile.
     - Die Überschneidung wird belegt, z. B. über `pg_locks NOT granted` während des zweiten Commits.
     - Gegenprobe: ohne Sperre und ohne erneutes Suchen → 2 Zeilen.
7. **H1a-S5 — `/csp-bericht` mit eigenem Zeitlimit (sollte).**
   - `routes/csp-bericht.js:303-326` liest den Rumpf ohne Timer. Ein langsamer Client bindet die Verbindung bis zum
     Node-Standard (300 s).
   - Neu: 15 s Timer. Läuft er ab, folgt `req.destroy()`; bei `end`, `error` und 413 wird er gelöscht. Den Kommentar
     `:296-302` nachziehen.
   - Test: rohe `http.request` mit gesetzter `Content-Length` und halbem Rumpf.
     - Zugesichert wird eine UNTERGRENZE (nicht vor etwa 15 s) UND eine Obergrenze. Belegt wird das am
       SERVERseitigen Socket (`destroyed === true`), nicht am Client-`close`.
     - Muster: `test_feature_csp_bericht.js:163-192`, mit dem dort dokumentierten Blindgänger (flash 12).
     - Die Grenzen sind über eine Testumgebungsvariable verkürzbar.
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
