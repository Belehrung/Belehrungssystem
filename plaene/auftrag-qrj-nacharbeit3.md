# Auftrag QR-J Nacharbeit 3 (25.09.2026)

Grundlage: `plaene/diffpruefung-qrj.md`, Abschnitt „Runde 3“ (QJ3-1..QJ3-11). Baum `/workspace/gymdocu-qrj`, Zweig
`fix-qrj-journal-reparatur`, Kopf `153a7a4`. Reproduktionen: `scratchpad/qrjcc3/` (`e1.js` Endzustände, `e2*.js` Fragen
a–c, `e3.js` Obergrenze/Charge/X11/X15, `lib.js`, DB `gymdocu_qrjcc_test`) — vor dem Bau gegen deinen Stand (muss das
gemeldete Fehlverhalten zeigen), danach erneut; beides wörtlich. Einordnung: sehr komplex (unverändert).

Leitregel unverändert: Überspringen kostet nur Nummern, Unterschlagen ist unwiderruflich; jede Sperre braucht einen
Werkzeugweg; eine Obergrenze ist nie ein Sicherheitsriegel, eine Untergrenze nur, wenn belegt.

## 1. Erledigung JE ABSCHNITT (QJ3-1 blockierend, QJ3-6, QJ3-11)

Heute bindet keine Erledigung an einen Abschnitt; ein Studio, das Kandidat mehrerer Abschnitte ist, wird durch EINE
Korrektur ganz frei, und zwei „genau S“-Abschnitte schliessen die Zeile nach einer Korrektur für alle (Kimi Fall A).
Neu:
- Die Korrekturzeile trägt `abschnitt` (Index, 0 = Vorspann). Das Werkzeug schreibt ihn immer; eine Korrekturzeile
  ohne das Feld gilt als Abschnitt 0 (QR-J ist noch nicht ausgeliefert — das betrifft nur Testfixturen).
- `korrigieren` wählt den Abschnitt: ist das Studio Kandidat genau EINES noch offenen Abschnitts, dieser; sonst ist
  `--abschnitt=<i>` Pflicht (Abbruch mit Liste der offenen Abschnitte und ihrer Bruchstücke). (a) lässt eine ZWEITE
  Korrektur desselben Studios für einen ANDEREN offenen Abschnitt zu.
- Ein Studio ist für eine Zeile erst erledigt, wenn JEDER Abschnitt, dessen Kandidat es ist (genau, Präfix, „alle“),
  gedeckt ist. Ein Abschnitt ist für Studio S gedeckt durch: eine Korrektur von S IN diesem Abschnitt; oder eine
  Korrektur eines anderen Studios T in diesem Abschnitt UND (deren `uebrige_nicht_betroffen` oder eine Freigabe); oder
  — nur wenn der Abschnitt KEINEN Chargenschlüssel trägt — eine Freigabe/`verworfen`. Ein Abschnitt MIT Chargenschlüssel
  ist die Spur einer echten Charge und wird nie ohne eine Korrektur in genau diesem Abschnitt „für alle“ erklärt
  (QJ3-6: auch nicht durch `--uebrige-nicht-betroffen` einer Korrektur in einem ANDEREN Abschnitt).
- `vollErledigtDurch`: jeder Abschnitt ist für jeden seiner Kandidaten gedeckt (Abschnitt mit genau einem möglichen
  Kandidaten: dessen Korrektur in diesem Abschnitt genügt).
- Innerhalb einer Zeile ist ein späterer Abschnitt eine spätere Charge: das lesbare `nr_von` eines späteren Abschnitts
  desselben Studios ist Obergrenze (e) für den früheren; lesbare `nr_bis`/`nr_von` gelten je Abschnitt als Untergrenzen
  wie bisher.
- `SCHALTER_WIRKUNGSLOS` nur bei genau einem Abschnitt mit genau einem Kandidaten.
Pflichttests (LITERALE Sollwerte): Kimi Fall A (zwei „genau 5“) — nach Korrektur von Abschnitt 0 ist 5 gesperrt und die
Zeile unerledigt, nach beiden Korrekturen Vergabe ab Ende des zweiten + 1; CC-Fixtur `e2.js` (Rest genau/Präfix/„alle“
desselben Studios); Kimi Fall C (Vorspann Präfix 6 + Rest genau 64 → 64 korrigiert den Rest-Abschnitt, nicht den
Vorspann). Gegenprobe: Abschnittsbindung entfernen → ROT in genau diesen Tests.

## 2. qr_charge als Beleg über den INHALT, nicht die Position (QJ3-2 Regress, QJ3-3)

Eine qr_charge gehört zu einer lesbaren Journalzeile (auch einer an dieselbe physische Zeile geklebten), deren
`charge_id`, `studio_id`, `nr_von` und `nr_bis` exakt mit ihr übereinstimmen — dann ist sie KEIN Beleg für den kaputten
Abschnitt. Sonst gilt wie bisher: Beleg nur, wenn ihr Studio Kandidat ist und ein lesbares `nr_von` passt. Der
Positionsfilter `z !== detail.zeile` und die Regel „jede andere Zeile mit derselben ID“ entfallen. Pflichttests: CC R3-2
(frühere lesbare Zeile mit derselben ID, anderem Inhalt → Beleg bleibt, zu niedriges `--bis` → Abbruch (d)); CC R3-5 /
DS B4 (geklebte vollständige Zeile, exakt gleicher Inhalt → kein Beleg).

## 3. Kandidaten aus dem Journal, Freigabe mit benanntem Eigentümer (QJ3-4)

- Kandidaten-Studios sind die existierenden (`studios`) UND die Studio-IDs aus lesbaren Journalzeilen (Chargen- und
  Korrekturzeilen), die auf die Kandidatenmenge passen und keine DB-Zeile haben — `zeigen` nennt sie als „nur im
  Journal bekannt (nach dem Zurückspielen fehlend)“.
- Eine Freigabe bzw. `--uebrige-nicht-betroffen` schreibt die Liste `ausgenommen` in die Metazeile: alle nur im Journal
  bekannten Kandidaten ohne eigene Korrektur in diesem Abschnitt. Der Leser deckt sie NICHT — wird ein solches Studio
  wieder angelegt, ist es gesperrt, bis es selbst korrigiert (CC R3-3: sonst 331100 doppelt).
- Neuer Weg ohne erfundene Spanne: `uebrige-freigeben --zeile=N --abschnitt=<i> --eigentuemer=<id> --grund="<Beleg>"`
  ist ohne Korrektur zulässig, wenn `<id>` Kandidat des Abschnitts ist und KEINE DB-Zeile hat (Aufkleber belegen: die
  Charge gehörte diesem, heute fehlenden Studio). Die Freigabe deckt den Abschnitt für alle Kandidaten AUSSER `<id>`
  (steht in `ausgenommen`). Pflichttests: CC `e2b.js` (Präfix 6, Eigentümer 64 fehlt) → 6 frei ohne Scheinspanne; 64
  wieder angelegt → gesperrt, korrigierbar, danach Vergabe literal.
- Audit-Payload nennt freigegebene UND ausgenommene Studios.

## 4. „genau S“ mit `nr_von` ausserhalb jedes Blocks von S (QJ3-5)

Weg: `korrigieren` mit dem blanken Schalter `--ausserhalb-bloecke` — zulässig nur, wenn das `nr_von` des Abschnitts
lesbar ist, `--von` ihm gleicht und KEIN Block des Studios es enthält; (c) entfällt dann, (f) verlangt
`--ohne-systembeleg`, Warnung im Klartext. VOR dem Bau messen, was eine Korrekturspanne ausserhalb der Blöcke in der
Leiter bewirkt (blocklokale und globale Prüfungen in `core/qr-token.js`): hebt oder sperrt sie die Vergabe des Studios
fälschlich, wird §4 NICHT gebaut, sondern im Bericht mit Messung gemeldet (dann entscheidet der Betreiber). Der falsche
Satz in `zeigen` (`:446`) wird in jedem Fall berichtigt.

## 5. Kleinere Punkte

- QJ3-7: Fixturen für X11 (belegtVon nur über die passende Charge) und X15 (Rest mit lesbarem `nr_bis`), je Gegenprobe.
- QJ3-8: `zeigen` nennt Untergrenzen je Abschnitt.
- QJ3-9: nach dem Schreiben einer Freigabe/Korrektur die Liste im Audit-Payload gegen `betrifftStudio` eines FRISCHEN
  Lesers halten (Test; Gegenprobe X1/X18/X19 → ROT).
- QJ3-10: der blocklokale Wurf in `core/qr-token.js` nennt den Freigabe-Weg wie die beiden anderen.
- Obergrenze (e): Wortlaut „höchstens N — nur, wenn die Aufkleber das Ende bestätigen; sonst `--ueber-obergrenze`“.
- Toter Zweig `verworfen` in `abschnittGedeckt` (X36) entfernen.

## Zustandsfrage für den Bericht

Welcher Zustand entsteht dadurch, den es vorher nicht gab — und gibt es danach noch (a) eine Doppelvergabe über das
Werkzeug, (b) eine Sperre ohne Werkzeugweg, (c) einen Weg, der eine erfundene Angabe in die Audit-Kette schreibt?

-- Ende des Auftrags --
