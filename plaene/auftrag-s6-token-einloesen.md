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
