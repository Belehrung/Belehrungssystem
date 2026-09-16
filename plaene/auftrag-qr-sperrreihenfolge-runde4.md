# Runde 4 — klein, und danach ist Schluss mit Prüfrunden

Arbeitsbaum `/home/user/gymdocu`, Zweig `claude/qr-zuordnung-sperrreihenfolge`
(Stand `bc6bb11`), sauber, gehört dir allein.

**Abbruchregel, und sie bindet MICH, nicht das Ergebnis:** Nach dieser Runde
lasse ich diesen Beitrag nicht mehr gegenlesen, und ich baue daran nur noch,
was BLOCKIEREND ist. Findest du etwas anderes — melde es, bau es nicht. Ich
sage NICHT voraus, dass nichts mehr kommt; ich sage, was ich noch baue.

**Deine Runde 3 war die beste.** Beide Abnahmebedingungen habe ich selbst
gemessen und beide sind erfüllt:

    A1  alte Fassung eingesetzt:  EXIT 1, 27 PASS / 2 FAIL
        (vorher EXIT 0, 32 PASS / 0 FAIL — der Beweis merkte nichts)
        zurueckgesetzt:           EXIT 0, 29 PASS / 0 FAIL
    A2  await-Mutation:           EXIT 1, 307 PASS / 2 FAIL nach 20 s
        (vorher EXIT 124 nach 180 s — ein Haenger)

Dazu mein Ritual auf deinem Stand: `SUITE_EXIT=0`, 325 = 325 (`diff` EXIT 0),
Lint EXIT 0, Marker 6.

Und deine Offenlegung, wo du in Runde 2 mutiert hattest (kombiniert statt
rein), war genau richtig — sie erklärt die abweichende Zahl, statt sie zu
verteidigen.

Die dritte Gegenlesung sagt ausdrücklich: **keine generell unerreichbare rote
Zusicherung mehr in der Datei**, und P1-NACHHER bindet jetzt gegen die alte
Fassung. Es bleiben drei Lücken.

## 1. BLOCKIEREND — es gibt noch Hängerpfade, und zwar genau zwei benannte

Die Gate-Zeitgrenze aus Runde 3 wirkt dort, wo sie steht, aber nicht überall.

**1a. Der Halter in P1-NACHHER ist zeitlich unbegrenzt**
(`test_feature_qr_beanspruchen_sperrreihenfolge.js:442-465`). Er wird nur
durch den späteren sequenziellen Ablauf freigegeben; einen eigenen Timer oder
einen unabhängigen Freigabepfad hat er nicht. **Dieselbe Mutation wie bei A2
hängt hier weiterhin:** ein `await` vor `const t1Promise =
qrZuordnung.beanspruche(S_P1A, tokenA, tokenB)`.

**1b. `(e3)` in `test_feature_qr_zuordnung.js:2608` hat weiterhin ein
unbegrenztes `await gate;`.** Das ist Bestandscode, den dieser Beitrag nicht
gebaut hat — aber der Helfer steht im selben Block schon bereit, und wir
fassen die Datei ohnehin an. Ein `finally`, das noch gar nicht betreten
wurde, schützt diesen Pfad nicht.

**1c. Als letzte Sicherung: EIN interner Laufzeitwächter JE DATEI.** Klare
FAIL-Ausgabe und Exit ungleich null, auch wenn Verbindungsaufbau, SQL oder
Aufräumen hängen — und er wird NACH erfolgreichem Aufräumen wieder entfernt,
damit er den normalen Lauf nicht am Beenden hindert. Das ist der „weniger
Gerüst"-Weg: einer je Datei statt einer Zeitgrenze um jedes `await`.

**Abnahmebedingung, wörtlich zu melden:** die Mutation aus 1a muss eine ROTE
ZUSICHERUNG liefern, nicht EXIT 124. Miss es.

## 2. Aufbau und Sollwert stammen wieder aus derselben Quelle

**2a.** Die vier bzw. fünf NOWAIT-Proben müssen nicht VERSCHIEDENE Nummern
prüfen. `const kleinere = Array(4).fill(nummernG3[0]);` besteht heute alles:
Länge stimmt, Größenrelation stimmt, alle vier Abfragen treffen dieselbe
gesperrte Zeile. **Eine Zeile behebt es:**
`new Set([...kleinere, gehalten, ...groessere]).size === 10`.

**2b.** In `(e1)` wandert die Sollzahl weiter mit: `const R = 2;` lässt alles
grün, während die Texte einen Nachweis über 40 Nummern behaupten. Eine
unabhängige, LITERALE Aufbau-Zusicherung genügt: genau 40 Token, 40
verschiedene Nummern.

## 3. Ein Text verspricht mehr als der Filter hält

Die `(e1)`-Zusicherung sagt „GENAU die beiden beanspruche()-Aufrufe", der
Filter erkennt aber die ANWEISUNGSFORM, nicht die zwei Instanzen. Dass der
Runner die Dateien seriell fährt, rettet die Sache praktisch — aber der Satz
behauptet mehr, als er misst. **Zieh den Text auf das zurück, was der Filter
wirklich zeigt.** Kein neues Gerüst dafür.

## Was NICHT gebaut wird — nur berichten

- **Abfrage-Zeitgrenzen im ganzen Repo** und eine Laufzeitgrenze je Testdatei
  in `test/run.sh:865`. Das ist die Wurzelbehebung zu 1c und trifft ALLE 325
  Dateien — eigener Beitrag, eigene Prüfung.
- **Der Abdeckungsverlust durch das Entfernen von `P1b`** ist BEWUSST und
  bleibt: verloren ist die Integration zweier echter `beanspruche()`-Aufrufe
  über überlappende Spannen. Das war mein Zuschnitt, nicht dein Fehler; es
  gehört in den Kopfkommentar der Datei, damit der nächste Leser es weiß.
- Der vorbestehende `throw` „gebrochenes Invariant" (dein eigener Fund).
- Seilkontroll-Fälle der Karte #233.
- **Testabfragen ohne `studio_id` sind KEIN Befund.**

## Abschluss

1. Volle Suite SELBST: `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"`
2. Dateizahl-Ritual, breites Muster. 325 = 325, `diff` EXIT 0.
3. `npm run lint` — wörtlich, AUCH bei Grün.
4. Marker-Scan, Ausschluss auf dem PFAD, Sollwert 6.
5. Committen und pushen, BEVOR du auf einen langen Lauf wartest.

**Melde wörtlich:** die Abnahmebedingung aus 1a in beiden Richtungen, dazu
Suite-Exit, Dateizahl, Lint, Marker.

**Widersprich mir mit einer Messung, wenn eine Vorgabe nicht trägt.**
