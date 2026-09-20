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
