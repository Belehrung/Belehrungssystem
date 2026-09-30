# Auftrag C5-E — Testsuite: Helfer, Wächter und Einzeltests (Extrarunde)

Fassung 1, 30.09.2026. Repo GymDocu, Stand `origin/master`. Die Fundorte stehen in `plaene/c5-zustand-30-09.md`
(Abschnitte `b4a1`, `b4a2`, `t13-19`, `t20-27`, `b4b`). Jede Fundstelle ist vor der Änderung neu zu messen.

**Zwei Teile, zwei Bauende:**
- **E1:** Helfer und Wächter, die viele Tests betreffen.
- **E2:** Einzeltests.

E1 zuerst mergen. E2 fasst keine Datei an, die E1 ändert (die Listen unten sind getrennt). Modell für beide:
Standard-Executer.

**Grundsatz:** Jede geänderte Zusicherung braucht danach eine Gegenprobe (ROT und GRÜN). Eine Zusicherung, die man
nicht rot bekommt, ist nicht fertig. Keine Zusicherung wird gestrichen, ohne dass eine gleichwertige an ihre Stelle
tritt, und das mit Beleg.

## E1 — Helfer und Wächter

1. **C2-S17** `test/helfer/datei-sperre.js`: Treffer gehen SOFORT nach stderr, der Exit-Haken gibt nur die
   Zusammenfassung aus. Dazu SIGTERM/SIGINT-Behandlung, damit ein abgebrochener Lauf die Treffer nicht verliert.
2. **DEP-4:** Ein neuer Test prüft den Mailpfad. Echter `nodemailer`-Transport ohne Netz, mit aktiver Netzsperre, über
   `core/mailer.sendMail`. Belegt wird: die Netzsperre fängt den Versand, und es geht keine Verbindung raus
   (Positivkontrolle: ohne Sperre würde eine Verbindung versucht, gemessen gegen eine lokale Attrappe).
3. **G-V1** `test/umgebung.sh:52-75` (Prüfung des DB-Namens): Ein Bash-Verhaltenstest führt den Prüfblock mit
   gültigen und ungültigen Werten aus (`gymdocu_test`, `x_e2e`, `gymdocu`, leer, `…_testx`) und prüft Rückgabe und
   Meldung. Ein Textmuster genügt nicht.
4. **H1a-S6** `routes/csp-bericht.js:100-103`: Der Intervallkörper wird als `raeumeVersucheAb(now)` exportiert und
   getestet (alte Einträge weg, junge bleiben). NUR als Test-Hook; die Laufzeit ändert sich nicht.
5. **H2-R2-3:** Der Test, der `cookie-signature` direkt benutzt, signiert künftig selbst per `crypto.createHmac`.
   Es gibt keine unerklärte Abhängigkeit von einem transitiven Paket.
6. **H2-R2-4:** Die Session-DDL in `test_feature_audit_races.js:51` / `test_feature_offboarding.js:52` wird aus der
   `table.sql` von `connect-pg-simple` gelesen, über den gemeinsamen Helfer `test/helfer/session-ddl.js`; keine
   Kopie. Gegenprobe: eine DDL-Abweichung wird erkannt.
7. **P2-S5** `test/helfer/fehlerstatus-scan.js`: Die als BEWUSST blind benannten Formen werden als
   Fixture-Selbsttests festgehalten, die melden, sobald der Scanner sie doch erkennt oder weiter nicht erkennt. So
   bleibt die Grenze eine gemessene Grenze.
8. **P2-S7** `routes/sichtpruefung.js:5561-5577` (Warnungszweig, `res.status(500)`): ein schmaler Test-Hook für
   `hinweisWiederherstellen`, dazu ein Test mit Response-Attrappe und erzwungener Warnung.
9. **T2-S1 / N-1** `test/helfer/quelltext-scan.js:490-510`: Beide Seiten ignorieren dasselbe.
   - Der Scanner respektiert `.gitignore`, und die git-Referenz benutzt `--exclude-standard`.
   - Gegenprobe:
     - eine ignorierte Datei mit Falle ⇒ bleibt unsichtbar (auf beiden Seiten);
     - eine versionierte Datei mit Falle ⇒ ROT.
10. **T2-S2** `test_feature_rechtsaussagen.js:315-332`: Die Exit-2-Wege („NICHT GEPRÜFT“) bekommen
    Kindprozess-Selbsttests: unlesbare Datei (als nobody, weil root Rechte ignoriert) und `DATABASE_URL` ohne `_test`.
11. **T2-S3** `test_feature_korrektur_dokumente_static.js`: Die unbeschränkten `[\s\S]*` werden auf Abstände begrenzt
    (`{0,N}`, N aus der heutigen tatsächlichen Distanz plus Polster, im Bericht). Gegenprobe je Muster: die bewachte
    Zeile verschieben ⇒ ROT.
12. **T2-S4** `test_feature_syntax_check_verhalten.js:234/258`: Die Vorbedingung `sudo -u nobody` wird gemessen. Fehlt
    sie: in CI FAIL, sonst SKIP (Muster `test_feature_frist_herkunft.js:448-458`). Beide Proben laufen mit demselben
    PATH.
13. **TS-1** `test_feature_monatslauf_poolverbindung.js:111-113`: Die `waitingCount`-Messung wird zu begrenztem Warten
    auf 0 (höchstens 400 ms, 10-ms-Schritte). Kein Flattern.
14. **R9-12b:** Ein gemeinsamer Helfer `test/helfer/versand-sperre.js` (Umgebung leeren, `globalThis.fetch`-Stub,
    Wiederherstellung) wird vor `require('./server.js')` in allen drei betroffenen Dateien geladen. Vorher messen,
    welche es sind.
15. **V27-7** `test_feature_zip_download.js:54-56`: Fehlt `unzip`, heisst das „NICHT GEPRÜFT“ (CI FAIL, lokal SKIP)
    statt Absturz oder stillem Grün. Besser: den ZIP-Inhalt per JS lesen, falls eine vorhandene Abhängigkeit das kann.
    Keine neue Abhängigkeit.
16. **V02-1t** `test_feature_mandantengrenze_dateiwege.js`: ein Testfall für doppelt kodiertes `..`. Er prüft „kein
    Zugriff“ (Status ≥ 400 und kein Inhalt), nicht genau 404.
17. **T1-K4:** Nur Buchführung; mit Beleg `test_feature_run_sh_wegwerf_variablen_static.js:1-19` schliessen.

## E2 — Einzeltests

18. **V13-1** `test_feature_admin_logout.js:39`: Der Stub liefert `DESIGN_TOKENS_CSS` (heute `DESIGN_CSS`, falscher
    Name).
19. **V13-2** `test_feature_keine_systemeingriffe.js:156-164`: Die Ausnahmen bekommen je einen präzisen Kommentar
    (warum dieser Kindprozess erlaubt ist).
20. **V13-3** `test_feature_audit_csv.js:163-164`: Die Zusicherung trägt nur zwischen 00 und 02 Uhr. Die Uhr wird
    injiziert bzw. der Wert eingefroren, damit sie immer trägt.
21. **V14-3** `test_feature_ausstattung.js:187-189`: Den zweiten Oder-Zweig streichen und das Muster mit
    normalisiertem Weißraum verankern.
22. **V14-4** `test_feature_aufkleber_bestellung_spaltenwaechter.js:121`: `ohneSqlKommentare` für die `.sql`-Quelle,
    wie in der qr_block-Datei.
23. **V14-5** `test_feature_audit_geraetewartung.js:330`: `AND studio_id = $2` ergänzen.
24. **V14-6** `test_feature_belehrung_identitaet.js:30`: `kuerzel('belident')` wie `test_feature_getmutation.js:9`.
25. **V14-7** `test_feature_ausstattung.js:23`: Sollzahl-Bremse (die Anzahl von Hand herleiten) und `FAIL`-Summe
    ausgeben.
26. **V15-1a:** Wettlauftests mit deterministischer Barriere statt Zeitglück (Muster Geistersperre-Test).
27. **V16-2** `test_feature_design_tokens.js`: Die Kandidaten schliessen `var(--gd-…)` und `<style>${DESIGN_CSS}`
    ein. Messen, ob neue Treffer im Bestand entstehen; falls ja, stehen sie im Bericht und werden nicht still
    ausgenommen.
28. **V16-3** `test_feature_dguv3.js:213-217`: Die Zusicherung misst künftig etwas Eigenes. Vorher belegen, was sie
    heute prüft.
29. **V16-5** `test_feature_einweisung.js:496-499`: Der Vorzustand wird als Zusicherung neben die Leer-Erwartung
    gestellt.
30. **V16-7** `test_feature_datum_zeitzonenfalle.js:154`: Das Funktionsende wird über Klammerzählung bestimmt.
31. **V17-2** `test_feature_geraete_datumsfallen.js:872`: Uhr einfrieren, Randfall 00:30 Berlin.
32. **V17-3** `test_feature_geistersperre_nachtrag_rennen.js:723-726`: rohe SQL-Vorbedingung als solche kennzeichnen.
33. **V18-2** `test_feature_korrekturen_static.js:169-177`: begrenzte Abstände.
34. **V18-3** `test_feature_korrektur_dokumente.js:9`: `EXPORT_DIR` per `mkdtempSync`, dazu Aufräumen.
35. **V18-4** `test_feature_health_gate.js:346`: Fehler beim Aufräumen melden, ENOENT still.
36. **V18-5** `test_feature_geraeteseite_typen.js:113-117`: per `bezug_id` abfragen.
37. **V18-6** `test_feature_getmutation.js`: die drei Zeilen aus `test_feature_korrekturen.js` übernehmen (Befund
    lesen).
38. **V19-3** `test_feature_ladebestand_streng.js:2000-2001`: Text „Dashboard“ → „Brandschutz GET“.
39. **V19-4** `test_feature_magicline_tofu.js:49`: `v !== null` ergänzen.
40. **V19-5** `test_feature_lexikon_zeilenverweise.js:59-63`: Kommentar oder `maskiereKommentare()`.
41. **V05-7** `test_feature_ladebestand_streng.js:124-130`: die erwartete Aufgabenzahl je Termin als Literal.
42. **V20-3** `test_feature_messfehler_nicht_behaupten.js:494`: `studio_id` in alle WHERE-Klauseln, dazu eine
    Negativkontrolle mit einer zweiten Studio-Zeile.
43. **V21-6** `test_feature_pdf_root_lesezugriff_static.js:203`: try/catch mit Exit 2 (Muster `rechtsaussagen.js`).
44. **V22-2** `test_feature_provisioning_pdf_root_static.js:244`: Zahl im Kommentar nachziehen oder dynamisch
    formulieren.
45. **V22-3 / V22-4** `test_feature_pin_regeln_static.js`: Scan über `git ls-files` statt fester Verzeichnisse;
    Anführungszeichenklasse inkl. Backtick.
46. **V23-3** `test_feature_qr_token.js`: Literal-Zusicherung `NUMMER_START === 10000000`.
47. **V23-4 / V23-5** `test_feature_qr_mitglied_meldung.js`: den Schreibversuch nach dem Test zurücksetzen; das
    Studio in `finally` wieder aktivieren.
48. **V23-6** `test_feature_rechtsaussagen.js:155-158`: Musterbefund lesen und beheben.
49. **V24-3** `test_feature_retention_sperr_sichtkontrollen.js`: `studio_id` in die Testabfragen.
50. **V24-4** `test_feature_rechtsstand.js:151-155`: `pruefeUnverwechselbarkeit` für weitere Paare.
51. **V25-4** `test_feature_staging_role_static.js:27`: Vorbedingung `indexOf(...) >= 0`.
52. **V25-6** `test_feature_session.js:162-164`: try/finally mit bedingtem RENAME zurück.
53. **V26-3** `test_feature_ui_feedback.js:40-41`: zusätzlich `!includes("&lt;img")` bzw. ein exakter Vergleich.
54. **V26-4:** Nur Buchführung. Ohne Fundstelle im Detailbericht (`plaene/vollpruefung-befunde.md`, Bereich 26
    lesen) entweder beheben oder mit Beleg „nicht auffindbar“ schliessen.
55. **V26-5** `test_feature_wartung_geraet_verknuepfung.js`: `studio_id` in die Abfragen.
56. **V27-1..V27-6:**
    - V27-1: Kommentar präzisieren.
    - V27-2: Alarm-Mitschnitt oder Name kürzen.
    - V27-3: Kommentar zur UTC-Mitternacht.
    - V27-4: `strictEqual(summe, kopf.gesamt)`.
    - V27-5: `strictEqual(alleTreffer.length, 6)` plus Bindung von Zeile 230.
    - V27-6: `kombiniertOhneKommentare` benutzen.

## Regeln

- **Arbeitsbäume und Zweige:** `/workspace/gymdocu-c5e1` (Zweig `c5e1-testhelfer`) bzw. `/workspace/gymdocu-c5e2`
  (Zweig `c5e2-einzeltests`), je von `origin/master`.
- **Datenbanken und Lock:** Einzeltests gegen `gymdocu_c5e1_test` bzw. `gymdocu_c5e2_test`, NIE gegen
  `gymdocu_test`. Lock nie löschen. KEINE Migration.
- **Suite:**
  - Aufruf: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`.
  - Dateizahl-Ritual (Sieb nur über den `TESTS=(`-Block).
  - `npm run lint` wörtlich.
  - Neue Testdateien registrieren.
- **Gegenproben:** Jede geänderte Zusicherung bekommt eine Gegenprobe (ROT und GRÜN), vorher `node --check`. Bei
  mechanischen Kommentar-/Textänderungen ist keine nötig; der Bericht sagt, welche das sind.
- **Abschluss:** Committen und pushen vor langem Warten. Kein PR. Bericht je Nummer mit Beleg oder Widerspruch.
