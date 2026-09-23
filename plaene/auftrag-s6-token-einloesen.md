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

# BAUAUFTRAG S6 (Fassung 3, 23.09.2026) — Generationszähler statt Zeitvergleich

**Zielrepo:** GymDocu, neuer Zweig `fix-s6-pin-generation` ab dem dann aktuellen master.
**Modellwahl, VOR dem Auftrag entschieden:** Fable 5.1 — sehr komplex nach den Merkmalen der
CLAUDE.md: Anmeldeweg (unwiderruflich), fünf Riegel, deren Nachweise sich gegenseitig verdecken
und falsch grün werden können (zwei Planprüfungsrunden fanden genau das), dazu Wettläufe
zwischen vier Schreibwegen.
**Nach SUCHMUSTER arbeiten** (Zeilen = Stand `f4c0f07`).
Zwei Planprüfungsrunden mit je zwei Spuren: `plaene/planpruefung-s6.md`. Alle getragenen
Befunde sind hier Anforderungen; wo das Papier einem Befund nicht folgt, steht es dabei.

## Gemessene Fundstellen

| Rolle | Fundstelle | Suchmuster |
|---|---|---|
| PIN-Schreiber (Admin) | `routes/admin/mitarbeiter.js` | `UPDATE mitarbeiter SET pin_hash=$1` in `/mitarbeiter/pin-direkt/:id` |
| PIN-Schreiber (Link) | `routes/mitarbeiter-auth.js` | `UPDATE mitarbeiter SET pin_hash=$1` in `POST /mitarbeiter/pin-setzen/:token` |
| Schreiber von `aktiv` (6) | `routes/api.js` Sync-Deaktivierung (`SET aktiv = 0`), `routes/api.js` Reaktivierung (`aktiv = 1`), `routes/webhooks.js` zwei Deaktivierer (`SET aktiv = 0, inaktiv_seit`), `routes/webhooks.js` zwei Upserts (`aktiv = $3` / `aktiv = $2` aus `status === 'INACTIVE' ? 0 : 1`) | |
| Token-Erzeuger (einziger) | `routes/mitarbeiter-auth.js` `sendeMitarbeiterEinladung` | `INSERT INTO mitarbeiter_token` |
| Token-Leser (einziger) | `routes/mitarbeiter-auth.js` `ladeGueltigesToken` | GET und POST `pin-setzen` |
| Dynamischer Kopierer | `S20-migrate.js` (kopiert `mitarbeiter` und `mitarbeiter_token`, IDs per `OVERRIDING SYSTEM VALUE`) | |
| Token-Löscher (U-TOK1) | `routes/admin/mitarbeiter.js` Löschweg | `DELETE FROM mitarbeiter_token` im stillen `catch {}` |

Kein FK auf `mitarbeiter_token.mitarbeiter_id`. `mitarbeiter.aktiv` ist nullable. Der Executer
misst jede Zeile beim Bau erneut und nennt die Zahlen.

## Entwurf

1. **Migration `0059`:** `mitarbeiter.pin_generation INTEGER NOT NULL DEFAULT 0`,
   `mitarbeiter_token.pin_generation INTEGER NOT NULL DEFAULT 0`; Schema in `core/db.js`
   nachziehen. **Altbestand ohne Zeitvergleich:** jedes offene Token (`verwendet = 0`) bekommt
   `-1`, wenn KEIN Mitarbeiter mit `m.id = t.mitarbeiter_id AND m.studio_id = t.studio_id`
   existiert (`NOT EXISTS`), oder sein Mitarbeiter eine PIN hat (`pin_hash IS NOT NULL`), oder
   nicht aktiv ist (`aktiv IS DISTINCT FROM 1`, NULL-sicher). Einladungen an aktive Mitarbeiter
   OHNE PIN bleiben gültig. Das Backfill ist eine EINMALIGE Umstellung, geschützt durch die
   Versionsmechanik von `core/migrate.js`; der Kopf der Migration sagt das. Der Bericht nennt
   die Abfrage, mit der der Betreiber VOR dem Deploy zählt, wie viele offene und NOCH WIRKSAME
   Links (`gueltig_bis` ist UTC-Text, gegen UTC vergleichen) dabei sterben.
2. **Jeder PIN-Schreiber zählt hoch**, in derselben Anweisung: `pin_generation = pin_generation + 1`,
   mit `RETURNING pin_generation`.
3. **Jeder Schreiber von `aktiv`, der auf 0 setzen KANN, zählt beim Übergang auf inaktiv hoch**, in
   derselben Anweisung: bei literalem `aktiv = 0` `pin_generation = pin_generation + 1`; bei
   parametrisiertem Wert `pin_generation = pin_generation + CASE WHEN <neuerWert> = 0 THEN 1
   ELSE 0 END`. Reaktivieren zählt nicht (vor der Deaktivierung ausgestellte Tokens sind dann
   schon ungültig; ausstellen kann man nur an Aktive). Folge, bewusst: eine Einladung an einen
   PIN-losen Mitarbeiter übersteht eine Deaktivierung nicht.
4. **Erzeuger** (`sendeMitarbeiterEinladung`): in der Transaktion bleiben das Entwerten und
   `INSERT … SELECT …, m.pin_generation FROM mitarbeiter m WHERE m.studio_id=$1 AND m.id=$2 AND
   m.aktiv=1 RETURNING id, pin_generation`. 0 Zeilen → WERFEN (Rollback auch des Entwertens).
   Vor `sendMail` die Mitarbeiter-Generation erneut lesen und gegen die EINGEFÜGTE
   (`RETURNING`) vergleichen; weicht sie ab, das Token entwerten und ohne Mail aussteigen. Die
   Lücke zwischen dieser Prüfung und dem externen Mailversand bleibt und ist im Kommentar
   benannt (ein so versandter Link ist ungültig, nicht gefährlich).
   **Rückgabe bekommt ein Merkmal `angelegt: true|false`**; der Admin-Aufrufer
   (`/mitarbeiter/einladen/:id`) protokolliert NUR bei `angelegt: true` — ein echter Mailfehler
   nach angelegtem Token bleibt protokolliert wie heute.
   **Verbotsliste, tragend für die Kreisfreiheit:** kein `FOR UPDATE/SHARE` im
   `INSERT … SELECT`, kein neuer Fremdschlüssel auf `mitarbeiter_token.mitarbeiter_id`, kein
   `LOCK` im Erzeuger. Der Kommentar am Erzeuger nennt den Grund.
5. **Leser:** `SELECT t.* FROM mitarbeiter_token t JOIN mitarbeiter m ON m.id = t.mitarbeiter_id
   AND m.studio_id = t.studio_id WHERE t.studio_id = $1 AND t.token = $2 AND t.verwendet = 0 AND
   t.gueltig_bis > $3 AND m.aktiv = 1 AND m.pin_generation = t.pin_generation`.
6. **Einlösen** (`POST pin-setzen`): in der Transaktion NUR Verbrauch des Tokens und das
   PIN-UPDATE als Vergleich-und-Setzen (`… AND aktiv = 1 AND pin_generation = $tokenGen`,
   `pin_generation = pin_generation + 1 RETURNING pin_generation`); `rowCount = 0` → derselbe
   Weg wie `token_bereits_verbraucht`. **Hausputz NACH dem Commit, beschränkt auf ältere
   Generationen:** `… AND verwendet = 0 AND pin_generation < $neueGeneration` — so verbraucht
   er kein inzwischen neu ausgestelltes Token. `try/catch` + `melde()`.
7. **Admin `pin-direkt`** und **Webhook-Deaktivierung:** bleiben ohne Transaktion; ihr
   Token-Hausputz ebenso auf ältere Generationen beschränkt (`RETURNING` aus dem
   Mitarbeiter-UPDATE), in `try/catch` + `melde()`; ein Fehler dort macht aus der erfolgten
   Änderung keine Fehlerseite bzw. keinen Webhook-Fehler mehr.
8. **Löschweg (U-TOK1):** scheitert `DELETE FROM mitarbeiter_token`, wird der Mitarbeiter NICHT
   gelöscht — `melde()`, Fehlerseite, kein hartes DELETE. So entsteht kein Waisen-Token, das
   eine später wiedervergebene ID erben könnte.
9. **`S20-migrate.js`:** der Import setzt in SEINER Transaktion für das Zielstudio jedes offene
   Token auf `-1` — importierte UND vorhandene (Waisen mit wiedervergebener ID). Als eigene,
   exportierte Funktion (z. B. `entwerteTokensNachImport(client, studioId)`), die S20 aufruft
   und die ein Test mit einer Wegwerf-DB direkt prüft; dazu eine statische Zusicherung, dass
   S20 sie in der Import-Transaktion ruft. Das Skript selbst läuft im Test NICHT (liest eine
   echte SQLite-Datei, eigener Client, `process.exit`). Dass die Generation beim REPLACE-Import
   auf 0 zurückfällt, steht im Kopf der Datei — unschädlich, weil danach kein offenes Token des
   Studios mehr gilt.
10. **Statischer Wächter:** (a) jede Anweisung im Produktivcode, die `mitarbeiter.pin_hash`
    schreibt, erhöht `pin_generation` in derselben Anweisung; (b) die Menge der
    `UPDATE mitarbeiter`-Anweisungen, die `aktiv` schreiben, steht LITERAL im Test (heute 6),
    je mit Soll „zählt hoch" / „zählt nicht" (nur die literale Reaktivierung zählt nicht); eine
    neue Anweisung ist rot, bis sie eingetragen ist; (c) jeder SELECT-Leser von
    `mitarbeiter_token`, der aus `verwendet = 0` Wirksamkeit ableitet, ist `ladeGueltigesToken`
    — die UPDATE-Entwerter und der Verbrauch als literale Ausnahmeliste mit eigener
    Positivkontrolle; (d) `S20-migrate.js` ruft die Entwertungsfunktion. Fixturen je Regel rot,
    Durchlassfälle grün, Produktionsform, Dateiliste gegen `git ls-files`.

## Nachweis (echte Routen, Wegwerf-DB)

Grundregel für JEDE Probe: die Vorbedingung am KONKRETEN Token zusichern (ID, `verwendet = 0`,
`gueltig_bis` in der Zukunft, `ladeGueltigesToken` liefert es) — sonst ist eine Abweisung aus
dem falschen Grund grün. Mitarbeiter- und Token-IDs absichtlich verschieden.

* **Störhelfer:** für `db.run` (Hausputz nach Commit) zählend, begrenzt auf SQL-Teilstring UND
  Parameter, `finally` stellt zurück, jede Probe sichert GENAU EINEN Treffer zu. Für das
  Entwerten IM Erzeuger (`t.run`) kein Fehler-Stub (der rollt alles zurück), sondern — wo
  gebraucht — ein erfolgreicher No-op über eine Hülle um die Transaktionsverbindung.
* **S6 selbst (Haupttest):** Token erzeugen, PIN über `pin-direkt`, Hausputz gestört → GET und
  POST des alten Tokens abgewiesen, PIN bleibt die neue, keine Fehlerseite, `melde()`
  (Attrappe, vor dem Laden der Router gebunden) genau einmal.
* **Fenstertest:** Störpunkt NACH `ladeGueltigesToken` im POST, vor dem PIN-UPDATE; dort die
  Generation über eine zweite Verbindung erhöhen → Abweisung aus `rowCount = 0`, PIN
  unverändert, Token-Verbrauch zurückgerollt.
* **Riegel einzeln (beide Prüfspuren, übereinstimmend):** nur Leser-Bedingung gestrichen →
  Haupttest ROT (das GET zeigt das Formular), Fenstertest grün; nur Bedingung im
  Vergleich-und-Setzen gestrichen → Fenstertest ROT, Haupttest grün; beide → Haupttest rot
  auch am POST.
* **Zwei offene Tokens:** erstes über den echten Erzeuger, das zweite als Kopie DIESER Zeile
  (`INSERT … SELECT` aus der echten Zeile mit neuem Token-Wert) — keine handgeschriebene
  Spaltenliste. Vorbedingung zusichern (zwei IDs, gleiche Generation, beide wirksam).
  Einlösen des einen → das andere abgewiesen, auch bei gestörtem Hausputz.
* **Hausputz verbraucht kein neues Token:** Einlösung nach dem Commit, vor dem Hausputz
  anhalten; über den echten Erzeuger ein neues Token ausstellen; Hausputz freigeben → neues
  Token bleibt `verwendet = 0` und wirksam. Gegenprobe: Beschränkung `pin_generation <` weg →
  rot.
* **Parallele Einlösung zweier Tokens** über zwei Verbindungen mit Tor: kein 40P01, genau eine
  gewinnt. Gegenprobe: Hausputz zurück IN die Transaktion, unbeschränkt → 40P01 (`err.code`).
* **Deaktivieren/Reaktivieren**, getrennt für API-Sync, Webhook-Deaktivierung und
  Webhook-Upsert (`INACTIVE`, dann `ACTIVE`, je mit und ohne E-Mail): alter Link bleibt
  ungültig (GET und POST). Gegenprobe je Weg: Generationserhöhung dort entfernen UND (beim
  Webhook-Deaktivierer) den Hausputz stören — sonst fängt der zweite Riegel.
* **Erzeuger-Rennen:** Mitarbeiter zwischen Vorab-SELECT und INSERT deaktivieren → 0 neue
  Tokens, Entwerten zurückgerollt, keine Mail, KEIN Audit `mitarbeiter_eingeladen` (über die
  echte Admin-Route gezählt). Generation vor dem INSERT erhöhen → Token mit neuer Generation,
  Mail geht raus. Generation zwischen INSERT und Nachlesen erhöhen → keine Mail, Token
  entwertet.
* **Löschweg:** Token-DELETE gestört → Mitarbeiter bleibt, `melde()`, Fehlerseite.
* **S20:** `entwerteTokensNachImport` auf einer Wegwerf-DB mit vorhandenem Waisen-Token
  (wiedervergebene ID) und importierten Tokens → alle offenen des Studios `-1`, andere Studios
  unberührt.
* **Migration:** literale Altzeilen — PIN + offenes Token; ohne PIN + Einladung (bleibt);
  `aktiv = 0`; `aktiv = NULL`; kein Mitarbeiter (Waise); `erstellt_am NULL`;
  `pin_gesetzt_am NULL` mit PIN — erwartete Generation je Zeile literal.
* **Positivkontrolle:** PIN-Änderung → neues Token → Einlösen gelingt.
* Volle Suite, Dateizahl-Ritual, Lint, Marker-Scan.

## Was NICHT gebaut wird

* Keine feinere Zeitauflösung, kein Zeitvergleich irgendwo.
* Kein Hausputz in der Einlöse-Transaktion.
