# Semgrep-Probemessung über GymDocu (27.09.2026)

Anlass: Vorschlag, Snyk/Semgrep/SonarQube per GitHub Actions einzubinden; Betreiber: „Ja eine Messung". Vorher
entschieden (Begründung im Chat): Snyk NEIN (Code-Upload zu Dritten, Datengrenze), SonarQube NEIN (eigener Server,
Cloud nur für öffentliche Repos). Gemessen wurde nur Semgrep Community Edition 1.178.0, lokal, `--metrics=off`.

Stand: GymDocu `origin/master` = `d5c559d`, per `git archive` in den Scratchpad entpackt (kein Arbeitsbaum berührt).
Regelsätze: `p/expressjs`, `p/nodejsscan`, `p/security-audit`, `p/javascript`. Laufzeit 531 s, 745 Dateien.

## Positivkontrolle (zuerst, an einer eigens angelegten Datei, nie im Repo)

Sieben eingebaute Lücken: SQL über `pg` (P1), SQL über unseren `db.q` mit Template-String (P2), `exec` mit Eingabe (P3),
reflektiertes XSS (P4), offene Weiterleitung (P5), `eval` (P6), fest eingetragenes Geheimnis (P7).

| Regelsatz | gefunden |
|---|---|
| p/expressjs | P1 P2 P4 P5 P6 |
| p/nodejsscan | P1 P3 P4 P5 P6 P7 |
| p/javascript, p/owasp-top-ten | P4 P5 P6 |
| p/security-audit | P3 |
| p/secrets | keine |

`p/expressjs` + `p/nodejsscan` zusammen: **7 von 7**, auch der eigene Wrapper `db.q` (P2).

## Ergebnis über den Bestand

**731 Funde**, davon 117 in Testdateien, **614 im Produktivcode** (routes 563, core 17, Wurzel 21, tools 5, ops 4,
e2e 3, public 1). Grösste Gruppen: `express_xss` 259, `raw-html-format` 138, `direct-response-write` 55,
`express_open_redirect` 47, Pfad-Traversal zusammen 52, SQL 12, `regex_dos` 11.

**Stichprobe, selbst gelesen (rund 40 Funde):** alle SQL-Funde (12) falsch — interne Bezeichner aus dem Schema,
Platzhalter `$2,$3…` mit Parametern, ein HTML-`<select>` für SQL gehalten; XSS-/HTML-Funde auf Zeilen ohne Ausgabe
oder mit `esc()`/`escapeHtml()`; Weiterleitungs-Funde auf beliebigen Zeilen im Handler; Pfade mit `path.basename()`
oder Dateinamen aus der DB; `regex_dos` an einfachen verankerten Mustern; Session-Cookie (`secure: 'auto'`,
`httpOnly`, `sameSite`) und abgeschaltete helmet-Teile (liefert nginx) sind Absicht.

**Ein echter Fund, gering:** `core/secret-crypto.js` `versuchOeffnen()` prüft die Länge des gespeicherten Werts nicht
und setzt kein `authTagLength`. GEMESSEN mit Node 22.22.2 im selben Muster: ein auf 4 Byte gekürztes Tag mit richtigem
Präfix wird ANGENOMMEN, ein falsches abgelehnt. Ausnutzbar nur mit Schreibzugriff auf den gespeicherten Wert und nur
für leeren Klartext (bei längerem Wert nimmt `subarray(12, 28)` volle 16 Byte). Behebung: Mindestlänge prüfen und
`{ authTagLength: 16 }` beim `createDecipheriv`. `core/file-crypto.js` ist nicht betroffen (feste Tag-Länge, Längenprüfung).

**Lücke der Messung selbst:** 40 Zeitüberschreitungen (Regel × Datei) — diese Stellen sind NICHT geprüft.

## Einordnung

- Als Gate über den ganzen Bestand unbrauchbar: 614 Funde, in der Stichprobe bis auf einen alle Fehlalarm.
- Brauchbar wäre ein **diff-bezogener Lauf** (`--baseline-commit`, nur neue Funde in geänderten Zeilen) mit
  `p/expressjs` + `p/nodejsscan` als HINWEIS am PR, nicht als Gate. Die Positivkontrolle zeigt, dass neu
  eingeführte Roh-SQL, `exec`, `eval`, Weiterleitungen aus Eingaben auffallen würden. Nicht gemessen: wie viele
  Fehlalarme ein typischer PR damit bekommt.
- Unsere teuersten Klassen (Studio-Trennung, Sperren, Zusicherungen, die nicht rot werden) findet das Werkzeug nicht.

-- Ende --
