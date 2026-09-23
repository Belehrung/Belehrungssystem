# Auftragspapier — S6: das Einmaltoken überlebt das PIN-Setzen

**Eigener Punkt, Betreiber-Vorgabe 20.09.2026** („s6 als seperater punkt").
Herausgenommen aus `plaene/auftrag-schreibreihenfolge.md`, weil dort drei
Entwürfe nacheinander gefallen sind. **Dies ist noch KEIN Bauauftrag** — es
ist die Fallakte, damit niemand bei null anfängt.

## Der Befund

`routes/admin/mitarbeiter.js`, `POST /mitarbeiter/pin-direkt/:id`:

    UPDATE mitarbeiter      SET pin_hash=…        -- :761, committet
    UPDATE mitarbeiter_token SET verwendet=1 …    -- :763, kann werfen

Scheitert die zweite Anweisung, ist die PIN gesetzt, der Benutzer bekommt
eine Fehlerseite — **und alte Einladungs-/Reset-Tokens bleiben gültig und
können die PIN später erneut ändern.** Das ist keine irreführende Meldung
mehr, sondern ein offener Anmeldeweg.

*(Zeilennummern nach Beitrag A um +1 verschoben; vor jedem Bau neu messen.)*

## Drei Entwürfe, drei gefallen — jeder an einer ANDEREN Klasse

| Entwurf | Woran er fiel | gefunden von |
|---|---|---|
| Transaktion um beide UPDATEs | echter Verklemmungskreis mit dem öffentlichen PIN-Weg: die Transaktion hielte `mitarbeiter` → `mitarbeiter_token`, `routes/mitarbeiter-auth.js:295-301` sperrt genau umgekehrt → `40P01` | `gpt-5.6-sol` |
| zwei Autocommits, Reihenfolge getauscht | übersah den Weg, der Tokens ERZEUGT | `kimi-k3` |
| drei Autocommits (entwerten – setzen – entwerten) | Schritt 3 schliesst das Fenster nicht: unter READ COMMITTED sieht sein UPDATE nur, was beim Statement-Beginn sichtbar war | `deepseek-v4-pro` |

**Heute gibt es den Verklemmungskreis nicht**, weil Autocommit nie zwei
Sperren gleichzeitig hält. Jede Behebung, die eine Transaktion einführt,
erzeugt ihn.

## Der Kandidat — und seine gemessene Schwäche

**Nicht beim SCHREIBEN entwerten, sondern beim EINLÖSEN abweisen:** ein Token
gilt nicht mehr, wenn es älter ist als die letzte PIN-Änderung. Dann ist kein
Rennen möglich, weil beide Werte zum Prüfzeitpunkt längst committet sind.

**Gemessen (nicht angenommen):**

* `mitarbeiter_token.erstellt_am TEXT DEFAULT to_char(… 'YYYY-MM-DD HH24:MI:SS')`
* `mitarbeiter.pin_gesetzt_am TEXT`, dasselbe Format
* **genau EIN Einlöse-Punkt:** `routes/mitarbeiter-auth.js:240`
* einziger Erzeuger: `routes/mitarbeiter-auth.js:183-186`

**Die Schwäche steht hier und nicht erst in der Prüfung:** beide Spalten haben
**Sekundenauflösung**. Ein Token aus derselben Sekunde wie die PIN-Änderung
bleibt mehrdeutig — dieselbe Falle, die am 20.09.2026 bei `freigeschaltet_am`
zur Streichung eines ganzen Punktes geführt hat. Das Fenster wäre von
unbegrenzt auf eine Sekunde verkleinert, **nicht geschlossen**.

**Wer diesen Beitrag baut, entscheidet ZUERST**, ob eine Sekunde genügt oder
ob die Spalte eine feinere Auflösung braucht — **und misst es, statt es
anzunehmen.** Eine Migration auf Mikrosekunden ist möglich, berührt aber
`to_char`-Vergleiche an anderen Stellen; das ist selbst eine Messung wert.

## Was vor dem Bau zu tun ist

1. **Zeilennummern neu messen.**
2. **Die Auflösungsfrage entscheiden und messen** (s.o.) — sie bestimmt den
   ganzen Entwurf.
3. **Planprüfung mit zwei Spuren, verschiedene Bündel.** Eine Spur bekommt
   `routes/mitarbeiter-auth.js` (Einlösen und Erzeugen), eine den
   Admin-Weg plus die Lock-Ordnung aus `core/integritaet.js`. Dies ist ein
   unwiderruflicher Bereich (Anmeldeweg) — eine dritte Spur ist nach der
   Regel vom 20.09.2026 ausdrücklich zulässig.
4. **`grep` auf die Aufrufnamen**, die der Entwurf ändern würde, BEVOR das
   Bündel steht — am 20.09.2026 lag genau daran der blockierende Befund
   eines anderen Beitrags.

## Verwandt, nicht dasselbe

**U-TOK1** in `plaene/durchgang-befunde.md`: ein Token kann seinen
Mitarbeiter überleben, weil das Token-DELETE in `/mitarbeiter/loeschen/:id`
ausserhalb der Transaktion in einem stillen `catch` steht. **Andere Ursache,
dieselbe Folge** — und der Einlöse-Riegel aus dem Kandidaten oben würde
U-TOK1 mit erledigen, wenn er auch gegen einen fehlenden Mitarbeiter prüft.
Wer S6 baut, sieht sich U-TOK1 im selben Zug an.

---

## Nachtrag 20.09.2026, 12:43 UTC — die Auflösungsfrage, am Quelltext gemessen

Punkt 2 der Liste oben („die Auflösungsfrage entscheiden und messen") ist zur
Hälfte erledigt. **Was am Quelltext messbar war, ist gemessen; was eine
Datenbankabfrage braucht, steht hier ausdrücklich als UNGEMESSEN** — der
Cluster war zu dieser Zeit mit dem Suite-Lauf eines Executers belegt, und
zwei Skripte gegen dieselbe Datenbank sind bei uns verboten.

### Gemessen, wörtlich aus dem Quelltext

    core/db.js:526-527   TS_DEFAULT = "to_char(now() AT TIME ZONE 'Europe/Berlin',
                                               'YYYY-MM-DD HH24:MI:SS')"
    core/db.js:648       pin_gesetzt_am TEXT,
    core/db.js:667       erstellt_am    TEXT DEFAULT (${TS_DEFAULT})

    routes/admin/mitarbeiter.js:790   SET … pin_gesetzt_am=to_char(now() AT TIME ZONE
                                                'Europe/Berlin','YYYY-MM-DD HH24:MI:SS')
    routes/mitarbeiter-auth.js:299    dieselbe Zeichenkette, zweiter Schreibweg

Beide Spalten des geplanten Vergleichs sind also **TEXT mit ÖRTLICHER
Wanduhrzeit, sekundengenau, OHNE Zeitzonenkennung**. Das ist mehr als die in
der Fallakte notierte „Sekundenauflösung": eine Wanduhrzeit ohne Versatz ist
nicht nur grob, sie ist **nicht monoton**.

### Die Folge — ABGELEITET, NICHT GEMESSEN

Ende Oktober springt die Uhr in Deutschland von 03:00 MESZ auf 02:00 MEZ
zurück; die Wanduhrzeiten 02:00:00 bis 02:59:59 kommen an diesem Tag ZWEIMAL
vor. Für den geplanten Riegel hiesse das:

* Token erzeugt um 00:59 UTC → Text `… 02:59:00` (noch MESZ)
* PIN gesetzt um 01:01 UTC → Text `… 02:01:00` (schon MEZ)

Das Token ist in Wirklichkeit ZWEI MINUTEN ÄLTER als die PIN-Änderung, sein
Text sortiert aber HINTER ihr. Der Riegel fragt „ist das Token älter als die
PIN?", bekommt „nein" — **und lässt genau das Token durch, das er abweisen
soll. Er fällt in dieser Stunde OFFEN aus.** Die Gegenrichtung gibt es auch
(ein frisches Token wird abgewiesen); die ist unangenehm, aber sicher.

**Das ist eine Ableitung aus der PostgreSQL-Semantik von `AT TIME ZONE`, kein
Messwert.** Wer S6 baut, misst sie zuerst — eine Abfrage gegen zwei Instants
im Umstellungsfenster genügt, sie fasst keine Tabelle an.

### Der Ausweg, der beide Probleme nicht hat

Keine feinere Zeitauflösung, sondern **eine Generationsnummer**:
`mitarbeiter.pin_generation INTEGER NOT NULL DEFAULT 0`, in derselben
Anweisung hochgezählt, die die PIN setzt; das Token merkt sich die Generation,
unter der es erzeugt wurde; beim Einlösen wird Gleichheit verlangt.

Das ist monoton, hat keine Auflösung, keine Zeitzone und keine Uhr — und es
ist genau das Mittel, das die CLAUDE.md unter „Wie die Praxis es nennt" als
Lehrbuchantwort führt („Idempotenzschlüssel und Generationsnummern") und das
am 19.09.2026 zwei Prüfspuren unabhängig voneinander vorgeschlagen haben.
**Kosten:** eine Migration und eine Spalte im Token. **Gewinn:** die Frage
„genügt eine Sekunde?" stellt sich gar nicht mehr.

### Eine eigene Vermutung, die beim Nachmessen FIEL

Beim Lesen fiel auf, dass `mitarbeiter_token` seine Zeiten in ZWEI
verschiedenen Zeitzonen führt — `erstellt_am` örtlich (Berlin, über
`TS_DEFAULT`), `gueltig_bis` dagegen aus JavaScript:

    routes/mitarbeiter-auth.js:178-179   new Date(Date.now() + stunden*3600*1000)
                                             .toISOString()…      → UTC

Daraus die Vermutung: der Ablaufvergleich bei `:240`
(`gueltig_bis > jetztSql()`) mischt UTC mit Ortszeit, und ein Token liefe im
Sommer zwei Stunden zu früh ab. **Nachgesehen — sie trägt nicht:**

    routes/mitarbeiter-auth.js:51-53   function jetztSql() {
                                           return new Date().toISOString()… }

`jetztSql()` ist selbst UTC. Der Vergleich ist also in sich stimmig, und die
Vermutung ist widerlegt. **Was bleibt, ist trotzdem ein Befund** — aber ein
kleinerer, und er gehört richtig benannt: in DERSELBEN Tabelle steht eine
Spalte in Ortszeit neben einer in UTC. Wer die beiden je miteinander
vergleicht, liegt je nach Jahreszeit ein bis zwei Stunden daneben. Heute tut
das niemand; der geplante Riegel vergleicht `erstellt_am` gegen
`pin_gesetzt_am`, und beide sind örtlich. **Als Falle für den nächsten
Beitrag gehört es notiert, als Befund gegen den Bestand nicht.**

---

# BAUAUFTRAG S6 (Fassung 2, 23.09.2026) — Generationszähler statt Zeitvergleich

**Zielrepo:** GymDocu, neuer Zweig `fix-s6-pin-generation` ab dem dann aktuellen master.
**Modellwahl, VOR dem Auftrag entschieden:** Standard-Executer — der Entwurf ist hier
festgelegt; die Schwierigkeit lag in der Entscheidung, nicht im Bau.
**Nach SUCHMUSTER arbeiten** (Zeilen = Stand `f4c0f07`).
Fassung 1 ist durch die Planprüfung (`plaene/planpruefung-s6.md`, zwei Spuren, alle
getragenen Befunde) überholt; hier stehen sie als Anforderungen.

## Gemessene Fundstellen

| Rolle | Fundstelle | Suchmuster |
|---|---|---|
| PIN-Schreiber (Admin) | `routes/admin/mitarbeiter.js` | `UPDATE mitarbeiter SET pin_hash=$1` in `/mitarbeiter/pin-direkt/:id` |
| PIN-Schreiber (Link) | `routes/mitarbeiter-auth.js` | `UPDATE mitarbeiter SET pin_hash=$1` in `POST /mitarbeiter/pin-setzen/:token` |
| Deaktivierer | `routes/api.js` (Sync, `SET aktiv = 0, inaktiv_seit`), `routes/webhooks.js` (zwei `SET aktiv = 0, inaktiv_seit`) | |
| Reaktivierer | `routes/api.js` (`aktiv = 1`), `routes/webhooks.js` (Upsert mit `aktiv`) | |
| Token-Erzeuger (einziger) | `routes/mitarbeiter-auth.js` `sendeMitarbeiterEinladung` | `INSERT INTO mitarbeiter_token` |
| Token-Leser (einziger) | `routes/mitarbeiter-auth.js` `ladeGueltigesToken` | GET und POST `pin-setzen` |
| Dynamischer Kopierer | `S20-migrate.js` (Tabellenliste enthält `mitarbeiter_token`, kopiert `mitarbeiter` spaltenweise) | |
| Token-Löscher (U-TOK1) | `routes/admin/mitarbeiter.js` Löschweg | `DELETE FROM mitarbeiter_token` im stillen `catch {}` |

Kein FK auf `mitarbeiter_token.mitarbeiter_id` (Schema und alle Migrationen gemessen).
Der Executer misst jede Zeile beim Bau erneut und nennt die Zahlen.

## Entwurf

1. **Migration `0059`:** `mitarbeiter.pin_generation INTEGER NOT NULL DEFAULT 0`,
   `mitarbeiter_token.pin_generation INTEGER NOT NULL DEFAULT 0`; Schema in `core/db.js`
   nachziehen. **Altbestand OHNE jeden Zeitvergleich** (Berliner TEXT-Zeit ist bei der
   Sommerzeit-Rückstellung nicht ordnbar, `NULL` fällt durch — beide Spuren): jedes offene Token
   (`verwendet = 0`) bekommt `pin_generation = -1`, wenn sein Mitarbeiter eine PIN hat
   (`pin_hash IS NOT NULL`), nicht aktiv ist oder nicht existiert — Bindung
   `m.id = t.mitarbeiter_id AND m.studio_id = t.studio_id`. Offene Einladungen für Mitarbeiter
   OHNE PIN bleiben gültig. Preis: offene Reset-Links (Laufzeit 1 h) und Einladungen an
   Mitarbeiter, die schon eine PIN haben, sterben mit dem Deploy — der Bericht zählt sie auf
   der Wegwerf-DB nicht, sondern nennt die Abfrage, mit der der Betreiber sie VOR dem Deploy
   zählen kann.
2. **Jeder PIN-Schreiber UND jeder Deaktivierer zählt hoch**, in DERSELBEN Anweisung:
   `pin_generation = pin_generation + 1`. Reaktivieren zählt nicht (die Tokens von vor der
   Deaktivierung sind dann schon ungültig).
3. **Erzeuger** (`sendeMitarbeiterEinladung`): in der Transaktion bleiben Entwerten und
   `INSERT … SELECT …, m.pin_generation FROM mitarbeiter m WHERE m.studio_id=$1 AND m.id=$2
   AND m.aktiv=1`. Trifft das INSERT 0 Zeilen: **WERFEN** (Rollback — auch das Entwerten), im
   `catch` auf den bisherigen Fehlergrund abbilden; keine Mail, kein Audit.
   **Verbotsliste, tragend für die Kreisfreiheit (Spur B):** kein `FOR UPDATE/SHARE` im
   `INSERT … SELECT`, kein neuer Fremdschlüssel auf `mitarbeiter_token.mitarbeiter_id`, kein
   `LOCK` im Erzeuger. Der Kommentar am Erzeuger nennt den Grund.
   Vor `sendMail` die Generation erneut lesen; weicht sie ab, das eben angelegte Token entwerten
   und ohne Mail mit dem bisherigen Fehlergrund aussteigen (tot geborener Link, Spur B).
4. **Leser:** `SELECT t.* FROM mitarbeiter_token t JOIN mitarbeiter m ON m.id = t.mitarbeiter_id
   AND m.studio_id = t.studio_id WHERE t.studio_id = $1 AND t.token = $2 AND t.verwendet = 0
   AND t.gueltig_bis > $3 AND m.aktiv = 1 AND m.pin_generation = t.pin_generation` — alle
   Spalten qualifiziert, Projektion nur `t.*`.
5. **Einlösen** (`POST pin-setzen`): in der Transaktion NUR noch Verbrauch des Tokens und das
   PIN-UPDATE als Vergleich-und-Setzen (`… AND aktiv = 1 AND pin_generation = $tokenGen`,
   dazu `pin_generation = pin_generation + 1`); `rowCount = 0` → derselbe Weg wie
   `token_bereits_verbraucht`. **Das Entwerten der übrigen Tokens verlässt die Transaktion**
   und wird Hausputz NACH dem Commit (`try/catch` + `melde()`). Das schliesst den heute
   bestehenden Kreis zweier paralleler Einlösungen (Token A → Mitarbeiter → Token B gegen
   Token B → Mitarbeiter) und macht den Nachweis „gestörtes Entwerten" überhaupt erst baubar.
6. **Admin-Weg `pin-direkt`:** bleibt ohne Transaktion; Token-Entwerten dahinter ist Hausputz
   mit `melde()`, ein Fehler dort macht aus einer gesetzten PIN KEINE Fehlerseite mehr.
   **Webhook-Deaktivierung:** ihr Token-Entwerten ebenso (heute werfend → Wiederholungssturm).
   **API-Sync-Deaktivierung:** entwertet heute gar nicht — die Generation erledigt es.
7. **U-TOK1:** der stille `catch {}` um `DELETE FROM mitarbeiter_token` bekommt `melde()`; die
   Sicherheit hängt am JOIN.
8. **`S20-migrate.js`:** importierte offene Tokens werden in der Import-Transaktion auf `-1`
   gesetzt (Einladungen nach einem Import neu verschicken). Der Kopf der Datei nennt es.
9. **Statischer Wächter:** (a) jede Anweisung im Produktivcode, die `mitarbeiter.pin_hash`
   schreibt oder `mitarbeiter.aktiv` auf 0 setzt, erhöht in DERSELBEN Anweisung
   `pin_generation` — Sollmenge der Fundstellen LITERAL hingeschrieben (heute: 2 PIN-Schreiber,
   3 Deaktivierer); (b) jeder SELECT-Leser von `mitarbeiter_token`, der aus `verwendet = 0`
   Wirksamkeit ableitet, ist `ladeGueltigesToken` — die UPDATE-Entwerter und der Verbrauch
   stehen als literale Ausnahmeliste mit eigener Positivkontrolle; (c) `S20-migrate.js` steht
   als dynamischer Schreiber ausdrücklich in der Liste. Fixturen je Regel rot, Durchlassfälle
   grün, Produktionsform.

## Nachweis (echte Routen, Wegwerf-DB)

* **Störhelfer für `db.run`:** zählend, begrenzt auf SQL-Teilstring UND Parameter,
  Originalfunktion im `finally` zurück. Jede Probe sichert zu, dass der Stub GENAU EINMAL
  traf, und belegt am konkreten Token `verwendet = 0` vorher und nachher.
* **S6 selbst:** Token erzeugen, PIN über `pin-direkt`, Hausputz gestört → altes Token wird
  abgewiesen (GET und POST), PIN bleibt die neue, Admin sieht KEINE Fehlerseite, `melde()`
  (Attrappe, vor dem Laden der Router gebunden) GENAU einmal.
* **Riegel einzeln belegt** (Spur B, drei Gegenproben): nur die Leser-Bedingung gestrichen →
  der Fenstertest (unten) wird rot, der Haupttest bleibt grün; nur die Bedingung im
  Vergleich-und-Setzen gestrichen → der Fenstertest wird rot; beide gestrichen → Haupttest rot.
  **Fenstertest:** Störpunkt NACH `ladeGueltigesToken` im POST (vor dem PIN-UPDATE), dort die
  Generation über eine zweite Verbindung erhöhen → Abweisung kommt aus `rowCount = 0` des
  Vergleich-und-Setzens, PIN unverändert, Token-Verbrauch zurückgerollt.
* **Zwei offene Tokens:** Vorbedingung herstellen und ZUSICHERN (zwei verschiedene IDs,
  `verwendet = 0`, gleiche Generation, nicht abgelaufen) — über den echten Erzeuger mit
  gestörtem Entwerten, nicht über einen seriellen zweiten Aufruf. Einlösen des einen → das
  andere abgewiesen, auch bei gestörtem Hausputz.
* **Parallele Einlösung zweier Tokens** über zwei Verbindungen mit Tor: kein 40P01, genau eine
  gewinnt, die andere „Link ungültig". Gegenprobe: das Entwerten zurück IN die Transaktion →
  40P01 (`err.code`).
* **Deaktivieren/Reaktivieren** über API-Sync UND Webhook: Token vor Deaktivierung, danach
  reaktivieren → alter Link bleibt ungültig (GET und POST). Gegenprobe: Generationserhöhung
  am Deaktivierer entfernen → Link gilt wieder.
* **Erzeuger-Rennen:** Mitarbeiter zwischen Vorab-SELECT und INSERT deaktivieren → 0 neue
  Tokens, Entwerten zurückgerollt, keine Mail, bisheriger Fehlergrund. Totgeburt: Generation
  zwischen INSERT und Mail erhöhen → keine Mail, Token entwertet.
* **Projektion:** Mitarbeiter-ID und Token-ID absichtlich verschieden; verbraucht wird die
  konkrete Token-Zeile.
* **Migration:** wörtlich eingetragene Altzeilen — Mitarbeiter mit PIN + offenes Token, ohne PIN
  + Einladung, deaktiviert + Token, gelöscht + Token, `erstellt_am NULL`, `pin_gesetzt_am NULL`
  mit PIN — erwartete Generation je Zeile literal. Zweimal laufen lassen (einmalige Ausführung
  der Migrationsmechanik belegen).
* **S20-Import:** Import auf eine DB mit angewandter 0059 → importierte offene Tokens `-1`.
* **Positivkontrolle:** PIN-Änderung → neues Token → Einlösen gelingt.
* Volle Suite, Dateizahl-Ritual, Lint, Marker-Scan.

## Offene Fragen an die Planprüfung (Runde 2)

1. Welchen ZUSTAND erzeugt Fassung 2, den es heute nicht gibt — besonders durch den Hausputz
   nach dem Commit und die Generationserhöhung beim Deaktivieren?
2. Was wird SCHLECHTER?
3. Gibt es weitere Schreiber von `pin_hash` oder `aktiv`, weitere Leser von
   `mitarbeiter_token`, oder einen Weg, auf dem die Generation sinkt?
4. Kann einer der Nachweise aus dem falschen Grund grün sein?
