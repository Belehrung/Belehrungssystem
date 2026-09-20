# Auftragspapier — Beitrag A: `routes/admin/mitarbeiter.js`, nur S5

**FASSUNG 2, 20.09.2026 — nach der Planprüfung durch drei Spuren.** Was sich
gegenüber Fassung 1 geändert hat, steht in Abschnitt 6; die Befunde und meine
Nachmessungen dazu in `plaene/planpruefung-beitrag-a-20-09-2026.md`.

**Stand gemessen gegen `master` = `7b955ec`.** Arbeitszweig
`beitrag-a-mitarbeiter-rowcount`. Basislauf der vollen Suite auf dem
unveränderten Zweig: **`SUITE_EXIT=0`, 0 FAIL, Dateizahl-Ritual 348 = 348,
`diff` EXIT 0.**

Dies ist der DRITTE und letzte Beitrag aus
`plaene/auftrag-schreibreihenfolge.md`. **S6 fährt NICHT mit**
(Betreiber-Entscheidung 20.09.2026, „ohne s6"). Damit entfällt auch der Satz
„S5 und S6 MÜSSEN zusammen gebaut werden" — S5 allein fasst `:762` nicht an.

---

## 1. Der Befund (S5)

Drei Routen melden dem Benutzer Erfolg, obwohl ihr UPDATE NULL Zeilen
getroffen hat.

| Route | Zeile | SELECT davor | UPDATE | Antwort bei 0 Zeilen (HEUTE) |
|---|---|---|---|---|
| `POST /mitarbeiter/email/:id` | 677 | 690 | 691 | Redirect `feedback=email_gespeichert` |
| `POST /mitarbeiter/pin-direkt/:id` | 746 | 758 | 760 | Redirect `feedback=pin_gesetzt` |
| `POST /mitarbeiter/umbenennen/:id` | 818 | 838 | 840 | Redirect `feedback=name_geaendert` |

**Alle Zeilennummern am 20.09.2026 gegen `7b955ec` NEU gemessen.**

**Kein Datenrisiko.** `studio_id` steht in allen sechs WHERE-Klauseln
(gemessen). Der Schaden ist eine **falsche Zusage an den Benutzer** — „PIN
gespeichert. Der Mitarbeiter kann sich jetzt am Tablet anmelden." für einen
Mitarbeiter, den es nicht gibt.

**Zwei verschiedene Fälle führen zu 0 Zeilen:**

1. **Die ID war nie vergeben** (oder gehört einem fremden Studio) — der SELECT
   liefert `ma = null`. Heute wird `ma` nur für den Protokolleintrag benutzt
   (`if (ma) { … }`), nicht für die Antwort.
2. **Die Zeile verschwindet ZWISCHEN SELECT und UPDATE** — `POST
   /mitarbeiter/loeschen/:id` löscht hart (`:952`, `DELETE FROM mitarbeiter`
   innerhalb einer `db.tx`). Dann ist `ma` gefüllt und das UPDATE trifft
   nichts. Diesen Fall fängt NUR `rowCount`.

**`rowCount` ist in PostgreSQL die Zahl der GETROFFENEN, nicht der
GEÄNDERTEN Zeilen** — gemessen, vier Fälle einzeln:

    Wert IDENTISCH -> UPDATE 1      Zeile FEHLT   -> UPDATE 0
    Wert GEAENDERT -> UPDATE 1      NULL auf NULL -> UPDATE 1

Ein erneutes Speichern desselben Werts ist also KEIN Nullzeilen-Fall. Die
MySQL-Semantik („changed rows") gilt hier nicht. Z5d unten sichert das zu.

---

## 2. Was gebaut wird

### E-1 — `rowCount` in allen drei Routen, `ma`-Ausstieg NUR bei `pin-direkt`

**Riegel B (`rowCount`) — in allen drei Routen.** Das vorhandene
`await db.run(<UPDATE>)` bekommt einen Rückgabewert, danach:

    if (!r.rowCount) return res.redirect("/admin/mitarbeiter?feedback=<code>");

`db.run` liefert das volle pg-Ergebnis samt `rowCount` (`core/db.js:431-433`,
`return pool.query(sql, params);`).

**Riegel A (`!ma`) — NUR bei `pin-direkt`**, und dort direkt nach dem SELECT
(`:758`), also VOR `bcrypt.hash(pin, 12)` (`:759`):

    if (!ma) return res.redirect("/admin/mitarbeiter?feedback=pin_fehler");

**In `email` und `umbenennen` wird KEIN `ma`-Ausstieg gebaut.** Er spart dort
nichts — kein bcrypt, kein teurer Schritt —, und Riegel B liefert für eine nie
vergebene ID dasselbe Ergebnis. Zwei Riegel, von denen jeder den anderen
zudeckt, sind einzeln nicht messbar; einer, den man entfernen kann und der
Test wird rot, ist mehr wert als zwei, die sich gegenseitig tarnen.

Danach steht je Route genau so viel Schutz, wie sich einzeln messen lässt:

| Route | Riegel | bewacht durch |
|---|---|---|
| `email` | nur B | Z5a-1 (B entfernen → ROT) und Z5a-2 |
| `umbenennen` | nur B | dito |
| `pin-direkt` | A (spart bcrypt) **und** B | A → Z5a-1b (Verhalten), B → Z5a-2 |

**Riegel B steht VOR dem `auditAppend`.** Sonst schreibt die gehashte
Protokollkette einen Vorgang fest, der nicht stattgefunden hat. Heute schützt
den Audit-Aufruf nur `if (ma)` — und `ma` ist im Fall 2 gefüllt.

### E-2 — bei `pin-direkt` steht Riegel B VOR der Token-Entwertung (`:762`)

**Geändert gegenüber Fassung 1, die das Gegenteil wollte.** Auf einem Weg,
den wir dem Benutzer als gescheitert melden, wird NICHTS geschrieben.

Fassung 1 argumentierte, `:762` räume bei 0 Zeilen ein verwaistes Token
nebenbei mit ab, und das sei erhaltenswert. Dagegen stehen zwei Gründe, beide
aus der Planprüfung und beide nachgemessen:

* Die Aufräumung greift nur, wenn ZUFÄLLIG ein Admin `pin-direkt` auf genau
  die veraltete ID abschickt. Ohne diesen Zufall überleben die Tokens
  genauso. Das ist kein Riegel, sondern ein glücklicher Nebeneffekt.
* Mit ihr änderte das System bei 0 getroffenen Zeilen seinen Zustand,
  während es „nicht gespeichert" meldet und NICHTS protokolliert — ein
  unbelegter Schreibzugriff auf einem für gescheitert erklärten Weg. Das ist
  dieselbe Krankheit, die dieser Beitrag heilt, nur spiegelverkehrt.

### E-3 — Rückmeldecodes

Die Liste steht bei `:60-74` (dreizehn Codes, gezählt). **Ein Code ohne
Listeneintrag zeigt GAR NICHTS an** (`core/ui-feedback.js#feedbackFromQuery`;
im Bestand bei `:826-831` als GEMESSEN bezeichnet).

| Route | Code | vorhanden? |
|---|---|---|
| `email` | `email_fehler` | **ja, `:72`** — *„E-Mail-Adresse nicht gespeichert. / Der Mitarbeiter wurde nicht gefunden."* Wird bereits bei `:680` benutzt. |
| `umbenennen` | `name_nicht_gefunden` | **neu.** `name_fehler` (`:73`) trägt *„Bitte gib einen Namen ein."* — hier irreführend. |
| `pin-direkt` | `pin_fehler` | **neu.** Kein passender Code vorhanden. |

Vorgegebener Wortlaut, beide mit `tone: "error"`:

    pin_fehler:          { title: "PIN nicht gespeichert.",  detail: "Der Mitarbeiter wurde nicht gefunden." }
    name_nicht_gefunden: { title: "Name nicht gespeichert.", detail: "Der Mitarbeiter wurde nicht gefunden." }

**Benannte, NICHT behobene Inkonsistenz:** dieselbe Ursache (ungültiges
ID-FORMAT) wird an den drei Geschwisterrouten verschieden beantwortet —
`email` zeigt `email_fehler` (`:680`), `pin-direkt` und `umbenennen` machen
einen baren Redirect ohne jede Anzeige. Das ist BESTAND und nicht Folge
dieses Beitrags. Neu ist nur, dass der Detailtext von `email_fehler` ab jetzt
für ZWEI Ursachen stehen muss. Den eigentlichen Schaden daraus fängt Z5e.

### E-4 — was NICHT angefasst wird

* **`:762` selbst** (Reihenfolge, Transaktion) — das war S6, gestrichen.
* **Die Wurzel des verwaisten Tokens in `loeschen`**: das Token-DELETE steht
  bei `:889` AUSSERHALB der `db.tx` (`:940-953`) und in einem stillen
  `try {} catch {}` ohne `melde()`. Scheitert es, überlebt das Token seinen
  Mitarbeiter. **Eigener Befund, eigener Beitrag** — das Hineinziehen in die
  Transaktion ist eine Lock-Ordnungs-Frage (der öffentliche PIN-Weg sperrt
  `mitarbeiter_token` → `mitarbeiter`, `routes/mitarbeiter-auth.js:295-301`),
  und die CLAUDE.md verlangt dafür eine eigene Analyse. Nicht nebenbei
  mitbauen.
* **`umbenennen` übergibt `req.params.id` als Zeichenkette** an beide
  SQL-Anweisungen (`:838`, `:840`). Gemessen, nicht Gegenstand: die ID-Wache
  läuft davor, und `rowCount` wirkt unabhängig von der Schreibweise.
* **Der `exists`-Vorabtest bei `email`** (`:684-687`).

---

## 3. Zusicherungen

### Z5a-1 — nie vergebene ID → keine Erfolgsmeldung (alle drei Routen)

Die Fixtur existiert: `test_feature_id_wache_route.js` fährt jede Route mit
`ID_MAX_FORMAT_GUELTIG` (2147483647). **Drei Zusicherungen dort schreiben
heute das FALSCHE Verhalten fest** und werden umgedreht:

    :340  email       feedback=email_gespeichert  ->  feedback=email_fehler
    :379  pin-direkt  feedback=pin_gesetzt        ->  feedback=pin_fehler
    :427  umbenennen  feedback=name_geaendert     ->  feedback=name_nicht_gefunden

Ihr heutiger Meldungstext hält den Befund fest statt ihn zu beheben; er wird
mit umgeschrieben, mit Verweis auf diesen Beitrag.

**GEGENPROBEN, je einzeln zu messen und wörtlich zu melden:**

    email:       Riegel B entfernen            -> erwartet ROT
    umbenennen:  Riegel B entfernen            -> erwartet ROT
    pin-direkt:  NUR Riegel A entfernen        -> erwartet GRÜN (B fängt es)
    pin-direkt:  NUR Riegel B entfernen        -> erwartet GRÜN (A fängt es)
    pin-direkt:  BEIDE entfernen               -> erwartet ROT

Die beiden grünen Ergebnisse bei `pin-direkt` sind kein Mangel, sondern der
Grund für Z5a-1b und Z5a-2: dort trägt jeder Riegel eine eigene Zusicherung.

### Z5a-1b — bei `pin-direkt` läuft für eine nie vergebene ID KEIN `bcrypt`

**Verhalten, nicht Lexik.** Die Route holt `bcrypt` erst im Handler über
`require` (`:755`) — ein Zähler auf dem Modulobjekt greift also.

**Erwartet:** nie vergebene ID → `bcrypt.hash` 0-mal aufgerufen; echte ID →
genau 1-mal (Positivkontrolle im selben Lauf).

**Gegenprobe:** Riegel A hinter `bcrypt.hash` schieben → ROT.

*Warum nicht statisch:* eine lexikalische Zusicherung („`!ma`-Ausstieg steht
vor `bcrypt.hash`") überlebt zwei Ein-Zeilen-Mutationen, die das Bewachte
entfernen — `const ma = (await db.one(...)) || {};` und das blosse Streichen
des Wortes `return`. Beide wurden in der Planprüfung gefunden, von zwei
Spuren unabhängig.

### Z5a-2 — Löschung ZWISCHEN SELECT und UPDATE, alle drei Routen

Der SELECT liest eine ECHTE, im SELBEN Lauf angelegte Zeile; danach wird sie
über eine ZWEITE Verbindung gelöscht (`DELETE … WHERE id=$1 AND
studio_id=$2` — `studio_id` ist Pflicht, auch im Test); erst dann läuft das
UPDATE.

**Erwartet:** genau der Fehlercode DIESER Route (`email_fehler` /
`pin_fehler` / `name_nicht_gefunden`), nicht nur „irgendein 302".

**Positivkontrolle im selben Lauf:** derselbe Weg OHNE die Löschung muss den
ERFOLGScode liefern und den Wert wirklich in der Datenbank ändern. Ohne sie
bliebe die Mutation `if (!r.rowCount)` → `if (true)` unbemerkt.

**Gegenprobe:** NUR Riegel B der jeweiligen Route entfernen → nur deren Lauf
ROT.

**Zwei handwerkliche Vorschriften, beide aus der Planprüfung:**

* **Der Wrapper muss routenscharf greifen.** Der SQL-String
  `SELECT name FROM mitarbeiter WHERE id=$1 AND studio_id=$2` steht WÖRTLICH
  IDENTISCH an drei Stellen (`:731` einladen, `:758` pin-direkt, `:838`
  umbenennen) — ein Muster allein auf diesen String trifft mehrfach. Der
  Wrapper zählt seine Treffer und die Zusicherung verlangt die erwartete
  Anzahl; greift er nicht, bricht der Lauf ab, statt grün zu melden.
* **Restore in `finally`.** Bleibt der Wrapper nach einer geworfenen
  Zusicherung aktiv, wird aus „ein FAIL" ein „mehrere FAILs aus fremder
  Ursache" — eine Diagnose darf nie Abdeckung kosten.

### Z5c — bei 0 getroffenen Zeilen wird kein ERFOLGS-Audit geschrieben

Im Aufbau von Z5a-2: nach dem Nullzeilen-Durchlauf steht KEIN Eintrag
`mitarbeiter_pin_gesetzt` für diese ID in der Protokollkette.

**Positivkontrolle im selben Lauf (Pflicht):** derselbe Weg mit echter ID
schreibt den Eintrag. Ohne sie ist „kein Eintrag" nicht von „die Abfrage
sucht am falschen Ort" zu unterscheiden — und den Erfolgspfad-Audit von
`pin-direkt` sichert heute überhaupt niemand zu (gemessen:
`test_feature_audit_mitarbeiter.js` deckt anlegen, umbenennen und E-Mail ab,
`pin-direkt` nicht).

**Gegenprobe:** Riegel B hinter den `auditAppend` schieben → ROT.

**Die Überschrift ist eng gefasst und bleibt es:** zugesichert wird die
Abwesenheit des ERFOLGS-Eintrags, nicht die Abwesenheit jeder
Protokollierung.

### Z5b — die neuen Codes werden ANGEZEIGT, und zwar als FEHLER

`GET /admin/mitarbeiter?feedback=pin_fehler` liefert eine Seite mit dem
hinterlegten Titel, dem Detailtext **und der Klasse `ui-banner--error`**;
dasselbe für `name_nicht_gefunden`.

**Gegenproben, beide einzeln:**

    Listeneintrag entfernen        -> ROT (stiller Redirect)
    tone: "error" entfernen        -> ROT

Der zweite ist nötig, weil `core/ui-feedback.js:158` bei fehlendem `tone` auf
`"success"` zurückfällt und `banner()` (`:138-148`) Klasse und `role` daraus
ableitet: eine Fehlermeldung erschiene als grünes Erfolgsbanner mit
`role="status"` — für den Benutzer schlechter als der Befund, den wir
beheben.

### Z5d — derselbe Wert erneut gespeichert bleibt ein ERFOLG

Für `email` und `umbenennen`: denselben Wert ein zweites Mal senden →
weiterhin `feedback=email_gespeichert` bzw. `name_geaendert`, und weiterhin
KEIN neuer Audit-Eintrag.

*Warum:* die bestehenden No-Op-Gegenproben
(`test_feature_audit_mitarbeiter.js:197-200` und `:221-224`) prüfen nur
Status 302 und die Audit-Anzahl — den Rückmeldecode prüft dort niemand. Beide
blieben also grün, wenn Riegel B diesen Fall fälschlich als „nicht gefunden"
behandelte. Sie werden um den Code ergänzt.

### Z5e — ungültiges ID-FORMAT löst keine Datenbankabfrage aus (`email`)

Nach dem Umbau hat `email_fehler` zwei Erzeuger: den Format-Riegel (`:680`)
und Riegel B. Eine Zusicherung, die nur den Code prüft, kann danach aus dem
falschen Grund grün sein.

**Erwartet:** für jeden Wert aus `UNGUELTIGE_WERTE` läuft weder `db.one` noch
`db.run` — null Aufrufe.

**Gegenprobe:** den `istGueltigeId`-Riegel der E-Mail-Route entfernen → ROT.

**Diese Gegenprobe ist die ERSTE Messung der Bau-Runde**, und zwar bevor
Z5e gebaut wird: erst messen, ob die BESTEHENDE Zusicherung die Entfernung
des Riegels nach dem Umbau überhaupt noch fängt. Vorüberlegung am Quelltext
(ausdrücklich eine Überlegung, keine Messung): `2147483648` erzwingt einen
int4-Überlauf und dürfte sie weiterhin röten — dann aber aus einem Zufall,
nicht aus dem Riegel.

---

## 4. Betroffene Prüfdateien (gemessen, `7b955ec`)

Gesucht nach BEIDEM — Routenpfaden UND Rückmeldecodes:

    test/e2e-durchlauf.js                            nur INSERT mit pin_gesetzt_am -- NICHT betroffen
    test_feature_audit_benutzerverwaltung_static.js  statischer Anker auf pin-direkt
    test_feature_audit_fehler_gemeldet.js            Anker auf den melde()-Pfad des pin-Audits
    test_feature_audit_mitarbeiter.js                No-Op-Gegenproben (Z5d)
    test_feature_employee_feedback.js                die drei ERFOLGScodes im Quelltext
    test_feature_id_wache_route.js                   drei umzudrehende Zusicherungen, Z5e

**Eigens zu messen (Planprüfung, K9):** überleben die statischen Anker auf
`pin-direkt` das Einfügen zweier neuer `if (...)`-Zeilen, ohne ihre
GENAU-EINMAL-Zählung zu verlieren?

**Jede dieser sechs Dateien läuft vor dem Commit einzeln**, Zahlen wörtlich in
den Bericht — auch die der nicht betroffenen. Danach die volle Suite, das
Dateizahl-Ritual und `npm run lint`.

---

## 5. Was an diesem Beitrag noch schiefgehen kann

Nach der Planprüfung verbliebene eigene Liste:

1. **Z5e ist noch nicht gemessen** (s. dort) — die Reihenfolge „erst messen,
   dann bauen" ist Teil des Auftrags.
2. **Die statischen Audit-Anker** könnten an den neuen Zeilen mehrdeutig
   werden (K9).
3. **Der verwaiste Token in `loeschen`** bleibt bestehen und wird hier
   bewusst nicht angefasst (E-4).

---

## 6. Was sich gegenüber Fassung 1 geändert hat

| | Fassung 1 | Fassung 2 | Anlass |
|---|---|---|---|
| Riegel A | in allen drei Routen | **nur `pin-direkt`** | deepseek T2/T3, sol E2/E4 — zwei Riegel decken einander zu |
| E-2 | Riegel B NACH `:762` | **VOR `:762`** | kimi K2 — kein Schreibzugriff auf einem als gescheitert gemeldeten Weg |
| Z5a-1b | statisch (Lexik) | **Verhalten (bcrypt-Zähler)** | kimi K3, sol E4 — `return` streichen reicht, um sie zu täuschen |
| Z5a-2 | nur `pin-direkt` | **alle drei Routen**, mit Positivkontrolle, exaktem Code, routenscharfem Wrapper, `finally`-Restore | sol E2/E4, deepseek T3, kimi K8 |
| Z5b | Titel + Detail | **+ `ui-banner--error`** | kimi K6 — ohne `tone` rendert es als Erfolgsbanner |
| Z5c | „nichts protokolliert" | **„kein ERFOLGS-Audit", mit Positivkontrolle** | sol E7, kimi K1/K4 |
| Z5d | – | **neu** | deepseek T1 (gefallen) und T4 |
| Z5e | – | **neu** | sol E5, kimi K5 |
| `loeschen` | nicht erwähnt | **als eigener Befund benannt** | kimi K2, Flanke 1 |
