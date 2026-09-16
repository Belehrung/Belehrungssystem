# Auftrag — Die Geistersperre über den Mangel-Nachtrag schliessen

Stand 16.09.2026. Alle Zeilennummern und Zitate sind vom Haupt-Agenten
SELBST im Arbeitsbaum gelesen worden, nicht aus einem Bericht übernommen.
Sie können sich trotzdem verschoben haben — vor dem Bauen nachsehen, und
wenn eine Angabe nicht stimmt, MELDEN statt sie stillschweigend anzupassen.

## Was kaputt ist

Ein Seilkontroll-Gerät kann in einen Zustand geraten, aus dem die
Oberfläche nicht mehr herausführt: **`geraete.aktiv = 0`,
`ausgemustert_am IS NULL`, und dazu eine aktive Zeile in
`geraete_sperren`** (typ `seilkontrolle`). Der Code nennt diesen Zustand
selbst „Geistersperre".

Folgen, jede einzeln nachgesehen:

- Die Seil-Verwaltungsliste lädt nur aktive Geräte
  (`routes/admin/geraete.js:109`,
  `... AND COALESCE(g.aktiv, 1) = 1 ORDER BY g.id`). Das Gerät ist dort weg.
- Einen Reaktivierungsweg für `seilkontrolle` gibt es nicht.
  `routes/admin/geraete-typen.js:98` setzt
  `ERLAUBTE_TYPEN = Object.freeze([GERAET_TYP.CARDIO, GERAET_TYP.KRAFT])`;
  die Route `POST /geraete/:typ/aktivieren/:id` (`:526`) ist für Seil also
  nicht erreichbar. Der frühere Weg `/geraete/reaktivieren/:id` wurde am
  22.08.2026 auf Betreiber-Entscheidung entfernt (Begründung im Kopf von
  `routes/admin/geraete.js:283-290`).
- Der Mangel-Nachtrag kann das Gerät nicht mehr anfassen
  (`routes/sichtpruefung.js:4587-4589`: `ladeAktiveSeilGeraete` filtert auf
  aktiv, danach `if (!geraet) return fehlerSeite(...)`).

Der Kommentar an der Löschstelle beschreibt die Lage wörtlich und richtig:

> Ergebnis: eine aktive Sperre auf einem nicht mehr aktiven Gerät
> („Geistersperre") — vor diesem PR über `/geraete/reaktivieren/:id`
> heilbar, seit dessen Entfall (B3) nicht mehr
> (Review-Fund 22.08.2026, B2).

## Warum es kaputt ist — die Messung

Am 22.08.2026 wurde genau dieses Rennen geschlossen, indem BEIDE Seiten
denselben Advisory-Lock nehmen. Heute nehmen ihn **drei** Stellen:

| Stelle | Was sie tut |
|---|---|
| `routes/admin/geraete.js:342` | Löschen (`UPDATE geraete SET aktiv = 0`, `:386`) |
| `routes/admin/geraete.js:463` | Umbenennen |
| `routes/module.js:2870` | Täglicher Seil-Check (INSERT der Sperre bei `:2982`) |

alle mit
`await t.run("SELECT pg_advisory_xact_lock(hashtext($1))", ['seilkontrolle:${studioId}:${heute}'])`.

Eine Seil-Sperre schreiben aber **zwei** Stellen:

| Schreiber | Lock |
|---|---|
| `routes/module.js:2982` (Tagescheck) | JA |
| `routes/sichtpruefung.js:4630` (Mangel-Nachtrag) | **NEIN** |

`grep -n "advisory_xact_lock" routes/sichtpruefung.js` findet drei Treffer
(`:2475` `check:…`, `:2632` und `:2884` je `nachtrag:…:<typ>`) — **keinen
davon in der Seil-Transaktion** ab `routes/sichtpruefung.js:4609`.

Der Nachtragsweg stammt vom 26.08.2026, also von VIER TAGEN NACH der
Behebung. Er hat die Lücke wieder geöffnet, weil niemand die
Geschwisterstelle mitgezogen hat. Das ist genau die Klasse aus der
CLAUDE.md („Ins Bündel gehören die GESCHWISTERSTELLEN"), diesmal nicht
beim Prüfen, sondern beim Bauen.

Ablauf des Rennens, beide Richtungen:

1. Nachtrag liest `ladeAktiveSeilGeraete` (`:4587`) — Gerät ist aktiv.
2. Löschen committet `aktiv = 0` (`geraete.js:386`). Seine Sperr-Prüfung
   (`aktiveNamensSperre(t, …)`, `:364`) sieht noch keine Sperre, weil der
   Nachtrag noch nicht committet hat.
3. Nachtrag committet den INSERT (`:4630`). Fertig: aktive Sperre auf
   inaktivem Gerät.

## Was zu bauen ist

**NUR das Rennen schliessen. NICHT den Rückweg bauen** — ob und wie
bereits entstandene Geistersperren wieder erreichbar werden, ist eine
Betreiber-Entscheidung (der Reaktivierungsweg wurde 2026-08-22
ausdrücklich abgeschafft). Wer ihn hier mitbaut, entscheidet das für den
Betreiber mit.

1. **Der Advisory-Lock als ERSTE Anweisung** der Seil-Transaktion in
   `routes/sichtpruefung.js` (die `db.tx()` ab `:4609`), mit GENAU
   demselben Schlüssel wie die drei bestehenden Nehmer.

   **Der Schlüssel muss zeichengleich sein, sonst wirkt der Lock nicht.**
   `geraete.js` bildet ihn aus
   `new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Berlin', hour12: false })`,
   davon `.slice(0, 10)`. **Miss zuerst, ob alle drei bestehenden Stellen
   den Tagesteil identisch herleiten.** Sind sie identisch: zieh die
   Bildung in EINEN Helfer (`core/seilgeraete.js` ist der naheliegende
   Ort, beide Seiten benutzen ihn schon) und stell alle vier Stellen
   darauf um. Weichen sie voneinander ab: **NICHT vereinheitlichen,
   sondern melden** — dann ist das ein eigener Befund und die Behebung
   hier bekommt den Schlüssel so, wie ihn der Löschweg bildet.

2. **Eine Nachprüfung des Aktivzustands INNERHALB der Transaktion**, nach
   dem Lock und vor dem INSERT. Die Prüfung bei `:4587` bleibt stehen (sie
   liefert die freundliche Fehlerseite im Normalfall) — sie ist aber
   check-then-act und damit nicht massgeblich. Ist das Gerät in der
   Transaktion nicht mehr aktiv, wird **nichts eingefügt und nichts
   auditiert**, und der Benutzer bekommt eine ehrliche Meldung. Keine
   stille Annahme, kein „Erfolg" ohne Zeile.

3. **Die Sperrreihenfolge ist zu BELEGEN, nicht anzunehmen.** Die
   Transaktion ruft `auditAppend(…, t)` (`:4638`), und das nimmt den
   studioweiten Advisory-Lock (`core/integritaet.js:65`). Der Tagescheck
   nimmt bereits `seilkontrolle:…` VOR seinem `auditAppend` — die neue
   Reihenfolge ist also dieselbe wie dort. Schreib die Fundstellen beider
   Wege als Kommentar daneben, samt dem Satz, warum der Lock zuerst
   kommt; sonst räumt ihn jemand als „doppelt" wieder weg. Sieh nach, ob
   noch ein dritter Weg dieselben Zeilen in umgekehrter Ordnung anfasst,
   und melde, was du findest.

## Was als Beweis gilt

Eine Zusicherung über zwei Verbindungen, nicht über eine. Vorbild ist
`test_feature_qr_beanspruchen_sperrreihenfolge.js` — dort steht das
Muster fertig: echte Barriere, Überlappung über `pg_blocking_pids`
belegt, Laufzeitwächter je Datei.

Verlangt wird:

- **Das Rennen wird WIRKLICH erzeugt**, nicht simuliert: eine Verbindung
  hält den Zustand an, die andere läuft hinein, und die Überlappung wird
  über `pg_blocking_pids` NACHGEWIESEN. Ein Test, der die beiden
  Vorgänge nur nacheinander fährt, beweist nichts.
- **Positivkontrolle in beide Richtungen, wörtlich gemeldet:** OHNE die
  Behebung muss der Testfall ROT sein (Geistersperre entsteht), MIT ihr
  GRÜN. Nimm die Behebung dafür versuchsweise zurück und miss es. Ohne
  diese zwei Zahlen ist die Prüfung Dekoration.
- **Der Testfall darf nicht aus dem falschen Grund grün werden.** Frag
  dich ausdrücklich: welcher andere Riegel könnte dasselbe Ergebnis
  liefern, wenn der neue Lock fehlt? Der `NOT EXISTS`-Riegel im INSERT
  (`:4632`) ist ein solcher Kandidat — er verhindert eine ZWEITE aktive
  Sperre, nicht eine Sperre auf einem inaktiven Gerät. Bau den Fall so,
  dass er ihn nicht trifft.
- **Der Test fasst keine echten Prozesse und kein echtes Dateisystem an.**
  Dieselbe Suite läuft auf dem Live-Server als Deploy-Gate.
- Jede Abfrage im Test trägt `studio_id`.
- Die Datei wird in `test/run.sh` registriert.

## Wie gemessen wird

    bash test/run.sh > /tmp/claude-0/suite-geistersperre.log 2>&1; echo "SUITE_EXIT=$?"

Keine Pipe, kein äusseres `flock` (die Suite sperrt selbst), keine
parallelen Skripte gegen dieselbe Datenbank während des Laufs.

Jedes Mutationsskript für eine Gegenprobe nimmt den **Zielpfad als
Argument** (nicht fest verdrahtet), zählt die Fundstellen seines Musters
und **bricht bei 0 UND bei mehr als 1 ab**, und schreibt den Marker
`GEGENPROBE`-`DEFEKT` mit. Zurückgenommen wird gegen eine unabhängig
angelegte Kopie (`cp` hin, `cp` zurück, `diff` EXIT 0) — nie über
`git checkout` oder `git stash`. Die Rücknahme wird NICHT mit einem
Testlauf verkettet: der Pipe-Wächter lehnt den ganzen Befehl ab, und dann
steht der Defekt noch, während die Meldung „zurückgenommen" lautet.

## Was ausdrücklich NICHT Teil dieses Auftrags ist

- Der Rückweg für bereits entstandene Geistersperren (Betreiber-Frage).
- Ein Reaktivierungsweg für `seilkontrolle`.
- `routes/wartung.js:1305` schreibt eine Sperre mit `typ='wartung'` —
  anderer Schlüsselraum, hier nicht betroffen. Wenn dir beim Bauen
  auffällt, dass er dasselbe Problem hat, MELDE es, bau es nicht.
- Anzeigeänderungen an den Gerätelisten.

Melde Zahlen wörtlich, auch unangenehme, und widersprich mit einer
Messung, wenn eine Vorgabe hier nicht trägt. Committe und pushe, bevor du
auf einen langen Lauf wartest.
