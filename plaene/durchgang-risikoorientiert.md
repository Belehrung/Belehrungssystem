# Vollständiger Durchgang durch GymDocu — risikoorientiert

Betreiber-Entscheidung 19.09.2026, wörtlich: „aktuellen Lauf fertig machen und
dann alles risikoorientiert."

**Startbedingung: NICHT vor dem Merge und der Auslieferung des laufenden
Beitrags** (Signaturprüfung + Einmal-Freischaltung,
`plaene/auftrag-freischaltung-verbrauch.md`). Solange der Executer in
`/home/user/gymdocu` arbeitet, wird dort nichts angefasst.

---

## 1. Der Umfang, gezählt

Nachgezählt am 19.09.2026 mit `git ls-files` und `du -b`. Umrechnung
Bytes→Token **3,71** — gemessen am Bündel desselben Tages (471.854 Bytes →
127.232 über `POST /v1/responses/input_tokens` gezählte Token), nicht
geschätzt.

| Bereich | Dateien | Bytes | ≈ Token |
|---|---|---|---|
| `routes/` | 49 | 2.796.744 | 754k |
| `core/` | 109 | 2.083.613 | 561k |
| `test_*.js` | 337 | 8.301.832 | 2.238k |
| `ops/` | 42 | 534.975 | 144k |
| `public/` | 15 | 670.884 | 181k |
| `server.js` | 1 | 109.593 | 30k |
| **gesamt** | **688** | **17.227.214** | **≈ 4,64 Mio** |

Eingabelimit rund 400k, brauchbares Bündel 130–170k. Produktivcode MIT den
zugehörigen Wächtern ergibt damit **15–20 Bündel**.

## 2. Die Reihenfolge — nach Umkehrbarkeit, nicht nach Verzeichnis

Grundlage ist eine Auszählung von Risikomarkern je Datei (DELETE ×3,
`auditAppend` ×2, `db.tx` ×2, UPDATE, INSERT, Rechte-/Token-Prüfungen ×1).

**Diese Punktzahl ORDNET die Arbeit, sie BEHAUPTET nichts.** Eine Textsuche
taugt nach unserer eigenen Messung (18.09.2026, dreimal in einer Stunde
hineingelaufen) nicht für Fragen nach dem Kontrollfluss. Sie sagt hier nur,
wo viel Unwiderrufliches liegt — nicht, ob dort ein Fehler ist.

| # | Bündel | Kern | Punkte |
|---|---|---|---|
| 1 | Geräte-Lebenszyklus | `routes/admin/geraete.js` (429 KB) | 171 |
| 2 | Anmeldung und Rechte | `routes/auth.js`, `routes/mitarbeiter-auth.js`, `core/tablet-geraet.js` | 86 / 16 / 14 |
| 3 | QR-Vergabe (unwiderruflich) | `core/qr-zuordnung.js`, `core/qr-token.js`, `routes/admin/qr.js`, `routes/admin/qr-bestellung.js` | 84 / 13 / 25 / 34 |
| 4 | Sichtprüfung | `routes/sichtpruefung.js` (357 KB) | 76 |
| 5 | Datenbankkern und Schema | `core/db.js`, `core/integritaet.js` | 65 / 13 |
| 6 | Module und Seilkontrolle | `routes/module.js`, `core/seilgeraete.js` | 58 / 12 |
| 7 | Lageplan und Uploads | `routes/lageplan.js` | 56 |
| 8 | Mitarbeiter (harte Löschungen) | `routes/admin/mitarbeiter.js` | 51 |
| 9 | Belehrungen | `routes/belehrungen.js` | 43 |
| 10 | Aufbewahrung und Bereitstellung | `core/retention.js`, `core/provisioning.js` | 38 / 37 |
| 11 | Ausmusterung und Gerätetypen | `routes/admin/ausmusterung.js`, `routes/admin/geraete-typen.js` | 29 / 27 |
| 12 | Einstieg und Einstellungen | `server.js`, `routes/admin/einstellungen.js` | 26 / 18 |
| 13 | Wartung, Getränkeanlage | `routes/wartung.js`, `routes/getraenkeanlage.js` | 22 / 21 |
| 14 | Archiv, Webhooks, PDF-Jobs | `routes/archiv.js`, `routes/webhooks.js`, `core/pdf-jobs.js` | 12 / 11 / 22 |

Bündel 1 und 4 sprengen allein schon die Hälfte des Limits (116k bzw. 96k
Token) — dort geht nur eine getrimmte Schema-Auswahl statt `core/db.js`
vollständig mit. **Jedes Bündel wird VOR dem Absenden gezählt**, nie
geschätzt.

## 3. Was in jedes Bündel gehört

Nach der gemessenen Regel vom 12.09.2026 (der Prüfer fand eine von zwei
Stellen derselben Regelverletzung, weil die zweite nicht im Bündel lag):

* die Kerndateien des Bündels,
* **die zugehörigen Wächter** — ohne sie ist die teuerste Frage nicht
  stellbar,
* die Geschwisterstellen, die dieselbe Regel anfassen,
* das relevante Schema aus `core/db.js`,
* bei Änderungen am Aussehen: der Screenshot (seit 14.09.2026 gemessen
  möglich, bis heute erst einmal benutzt).

## 4. Der Auftrag je Bündel — scharfe Fragen statt „finde Fehler"

Der heutige Lauf war ergiebig, WEIL der Auftrag sechs benannte Fragen stellte.
Feste Fragen für jedes Bündel, in dieser Reihenfolge:

1. Welche Tabellenabfrage trägt kein `studio_id`, und welcher fremde Datensatz
   ist damit erreichbar?
2. **Welche Zusicherung bleibt grün, obwohl das Bewachte weg ist?** Nenne die
   konkrete Ein-Zeilen-Mutation im Produktivcode. *(Unsere teuerste Klasse —
   und die billigste für mich zum Nachmessen: Mutation einbauen, Lauf ansehen,
   Minuten statt Stunden.)*
3. Welcher unwiderrufliche Schritt (Löschung, Nummernvergabe, Freigabe) läuft
   VOR einem fehlbaren Schritt oder ausserhalb der Transaktion, die ihn
   zurücknehmen müsste?
4. Welcher Kommentar oder Meldungstext behauptet mehr, als der Code leistet?
5. Welche Prüfung findet nur im Browser statt und wird serverseitig nicht
   erzwungen? *(Trust Boundary — genau die Klasse des heutigen Befundes.)*
6. Welche Behauptung DIESES Auftragspapiers über den Bestand stimmt nicht?

**Zwei Spuren je Bündel.** Gemessen am 13.09. und erneut am 19.09.2026: null
Überschneidung, weil sie verschieden SUCHEN, nicht verschieden meinen.

## 5. Die Disziplin — und warum sie der eigentliche Engpass ist

* **Jeder Befund ist eine BEHAUPTUNG, bis ich ihn selbst gemessen habe.** Am
  19.09.2026 fielen zwei von elf, und einer der getragenen hatte ein falsches
  Beispiel bei richtiger Sache.
* **Das Nadelöhr ist das Nachmessen, nicht das Finden.** Deshalb steht Frage 2
  an zweiter Stelle: ihre Befunde sind mechanisch prüfbar.
* **Befunde kommen in eine Datei, nicht in den Verlauf** —
  `plaene/durchgang-befunde.md`, je Befund: Bündel, Datum, Schweregrad,
  Fundstelle, Behauptung, Ergebnis der eigenen Nachmessung, Entscheidung.
  Ein Befund ohne Nachmessung wird als UNGEMESSEN geführt, nie als offen
  oder behoben.
* **Kein Stapel ohne Abarbeitung.** Lieber ein Bündel weniger als zwanzig
  ungemessene Befunde. Die Gefahr ist nicht, etwas zu übersehen — sie ist,
  sich das Durchwinken anzugewöhnen.
* **Gebaut wird weiterhin nur über den Executer**, und jeder Behebungsbeitrag
  durchläuft das normale Prüf-Ritual.

## 6. Was dieser Durchgang NICHT ist

* **Keine Messung mit bekannter Ausbeute.** Unsere Zahlen stammen
  ausschliesslich von Prüfungen an DIFFS und PLÄNEN. Wie ergiebig ein KALTER
  Durchgang über Bestandscode ist, hat niemand gemessen. Nach Bündel 1 und 2
  wird die tatsächliche Ausbeute festgehalten und die Hochrechnung berichtigt.
* **Keine Freigabe.** Der Prüfer liest, er misst nicht; er bekommt weiterhin
  keine Ausführung und keinen Schreibzugriff.
* **Keine Vollständigkeitszusage.** Was der Durchgang findet, ist das, wonach
  die sechs Fragen fragen.

## 7. Kosten

Der heutige Lauf: 127k ein / 27,7k aus ≈ **1,47 $** je Spur. Bei zwei Spuren
und 15–20 Bündeln also grob **50–80 $** für die Prüfläufe. Für
`deepseek-v4-pro` steht in unserer Preistabelle kein Preis; dort werden nur
Token geführt.

**Das Geld ist nicht der Engpass, meine Messzeit ist es.**

## 8. Offen, vor Beginn zu klären

* **BERICHTIGT 19.09.2026:** hier stand „`tools/gegenleser-repo.js` setzt
  `store: false` NICHT". Das war beim Schreiben dieses Plans schon überholt —
  am Quelltext nachgemessen sind `store: false`, `reasoning.effort` und
  `truncation` gesetzt (Commit `738558a`). Ich hätte auf dieser Prämisse
  beinahe einen Bauauftrag erteilt.
  **Der erste Bauauftrag bleibt trotzdem nötig, nur mit anderem Inhalt:**
  `stream: true` fehlt, und das Werkzeug verspricht ein Zeitlimit von 20
  Minuten, während der Egress-Proxy gegen `api.openai.com` ohne Streaming bei
  **300,3 s** hart abschneidet (gemessen 18.09.2026, drei Versuche). Mit dem
  frisch gesetzten `effort: xhigh` werden die Runden länger — die eine
  Behebung hat die andere Lücke verschärft. Dazu fehlen `metadata` und
  `max_tool_calls`.
* Ob je Bündel zwei VERSCHIEDENE Aufträge mehr bringen als zweimal derselbe,
  ist seit 18.09.2026 als offene Frage notiert und lässt sich hier billig
  mitmessen — an Bündel 1 einmal so, an Bündel 2 einmal anders.
