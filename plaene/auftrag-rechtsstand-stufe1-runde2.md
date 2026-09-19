# Auftrag — Rechtsstand-Wächter Stufe 1, RUNDE 2

Runde 1 (`dce20c1`) ist gebaut, Suite grün, Lint grün, Dateizahl 325 = 325,
Marker 6. Die Bewertungslogik trägt; die Gegenproben in Abschnitt 15 sind
gut (handgeschriebener Sollwert, gleich lange Wortmutation, vier
unterscheidbare Fehlergründe). **Runde 2 behebt, was danach gemessen wurde.**

Jeder Punkt unten ist vom Haupt-Agenten SELBST gemessen oder am Quelltext
gelesen worden — die Messung steht jeweils dabei. Wenn eine dieser Angaben
beim Nachbauen nicht trägt, MELDE das mit deiner Gegenmessung, statt sie
stillschweigend zu umgehen.

**REIHENFOLGE IST VERBINDLICH.** Punkt 1 ändert die Normalisierung und macht
damit JEDEN vorher erzeugten Fingerabdruck ungültig. Die Hashes (Punkt 8)
werden deshalb ZULETZT erzeugt und eingetragen, nie vorher.

---

## 1. BLOCKIEREND — die Normalisierung sieht Aufzählungs-Markup nicht

**Gemessen** (echtes `bgb/xml.zip`, 16.09.2026, sieben überwachte
BGB-Paragrafen): eine rein kosmetische Umformatierung der Quelle
(`xml.replace(/></g, '>\n<')`, also der Verlag rückt seine Ausgabe ein)
**ändert den Hash von § 309 BGB, nicht aber den der sechs anderen.** Die
sechs sind genau die, deren Text ausschliesslich in `<P>`-Blöcken steht —
also die, für die die bestehende Regel `</P>\s*<P>` greift. § 823, an dem die
fünf Normalisierungsregeln hergeleitet wurden, ist einer der sechs: **die
Regeln wurden an der einzigen Struktur entwickelt, an der der Fehler nicht
sichtbar werden kann.**

Dieselbe Lücke wirkt in die andere Richtung. Der extrahierte Text von § 309
lautet heute wörtlich:

    "…zulässig ist, ist in Allgemeinen Geschäftsbedingungen unwirksam
    1.(Kurzfristige Preiserhöhungen)eine Bestimmung, welche die Erhöhung…"

Die Strukturgrenzen zwischen `<DT>`, `<DD>` und `<LA>` sind ersatzlos
gelöscht; „unwirksam" und „1." verschmelzen zu einem Wort.

**Was zu bauen ist.** Die Normalisierung muss ZWEI Eigenschaften zugleich
haben, und beide gehören gemessen:

- **unempfindlich gegen Zwischenraum ZWISCHEN Tags** (Einrückung,
  Zeilenumbrüche des Verlags),
- **strukturerhaltend**: jede Elementgrenze hinterlässt einen Trenner, damit
  aus zwei Listenpunkten nicht ein Wort wird.

Ein Vorschlag, der beides erfüllt — **du prüfst ihn, du übernimmst ihn nicht
ungemessen**: (a) `<fussnoten>`-Blöcke wie bisher entfernen; (b) Zwischenraum
zwischen Tags einebnen (`>` + Whitespace + `<` → `><`); (c) JEDES verbleibende
Tag durch EINEN Zeilenumbruch ersetzen statt durch nichts; (d) Folgen von
Zeilenumbrüchen zu einem zusammenfassen; (e) Whitespace wie bisher
vereinheitlichen und trimmen. Findest du einen Fall, in dem das nicht trägt,
melde ihn mit Messung — eine andere Lösung ist willkommen, solange sie beide
Eigenschaften nachweislich hat.

**Beweise, die verlangt sind** (jede mit echten Zahlen, beide Richtungen):

- Kosmetische Umformatierung der ECHTEN Quelle ändert bei KEINEM der
  überwachten Paragrafen den Hash. Nimm dafür mindestens zwei Gesetze mit
  Aufzählungs-Markup (BGB § 309 ist eines, such ein zweites).
- Eine ECHTE Textänderung ändert den Hash weiterhin (Positivkontrolle —
  sonst hast du die Prüfung stumpf gemacht statt robust).
- Die Strukturgrenzen sind erhalten: eine Fixtur mit `<DT>`/`<DD>`, bei der
  zwei Listenpunkte im Ergebnis NICHT zu einem Wort verschmelzen. Der
  erwartete Klartext wird von Hand hingeschrieben, nicht von der Funktion
  erzeugt.
- Der bestehende § 823-Sollwert bleibt eine handgeschriebene Konstante. Ob
  seine Länge dabei 512 bleibt, ist ein MESSERGEBNIS — trag den gemessenen
  Wert ein und sag dazu, ob er sich geändert hat. Rate ihn nicht.

## 2. BLOCKIEREND — der Wurf in `klassifiziere()` macht den Lauf LEISER

Der Kommentar behauptet, der Wurf sei „lauter als jede stille
Falschmeldung". **Am Cron-Eintrag gelesen, `ops/cron.d-gymdocu-rechtsstand`:**

    35 5 * * 3 root /usr/bin/node /usr/local/bin/gymdocu-rechtsstand-watch.js >> /var/log/gymdocu-rechtsstand.log 2>&1

Kein `MAILTO`, kein Wrapper, kein Exit-Code-Wächter. Der Wurf reisst `main()`
ab, BEVOR `telegram()` läuft — eine künftige neue Lage führt also dazu, dass
für den GANZEN Lauf keine Meldung herausgeht, auch nicht für die sechzig
anderen Quellen. Die alte Fassung (`default: return 'still'`) hat die anderen
Befunde wenigstens noch zugestellt.

**Zu bauen:** eine unbekannte Lage wird auf `'rot'` abgebildet und bekommt in
`baueZeile()` einen eigenen, ausdrücklich diagnostischen Text („unbekannte
Lage X — in core/rechtsstand.js eingeführt, hier nicht abgebildet"). Kein
Wurf. Die Zusicherung dazu prüft, dass der Lauf für die übrigen Quellen
weiterhin eine Meldung erzeugt.

## 3. BLOCKIEREND — die Isolierung wird eine Funktion später aufgehoben

`gruppiereFuerMeldung()` ruft `gesetzKuerzel(b.url)` (Zeile ~371) AUSSERHALB
jedes `try`. Eine Quelle, die der neue Fänger in `bewerteAlleQuellen()` gerade
als `pruefungsfehler` isoliert hat, trägt weiterhin `art === 'gii-xml'` und
läuft hier hinein — `gesetzKuerzel()` wirft, `main()` bricht ab, es geht
GAR KEINE Meldung heraus. Der Kommentar bei Zeile ~316 verspricht genau das
Gegenteil.

**Zu bauen:** der Aufruf wird abgesichert; scheitert er, bildet die Quelle
ihre eigene Gruppe. Gegenprobe: eine Quelle mit unbrauchbarer URL läuft durch
bis in die Meldung, und die übrigen Quellen sind vollständig darin.

## 4. BLOCKIEREND — Grossbuchstaben im Soll-Hash erzeugen „widerspruch"

**Gemessen:** derselbe, byte-gleiche Normtext, einmal mit kleingeschriebenem
Soll-Hash im Register, einmal mit demselben Hash in Grossbuchstaben.
Ergebnis: `unveraendert` gegen **`widerspruch`** — die lauteste Lage, die laut
eigener Meldung „nicht vorkommen darf", ausgelöst von einer blossen
Schreibweise beim Hineinkopieren.

`istGueltigerSha256()` lässt Grossbuchstaben zu (`/i`), der Vergleich
`normtextIstSha256 === eintrag.normtext_sha256` ist aber
schreibweisenabhängig. **Zu bauen:** beide Seiten vor dem Vergleich
kleinschreiben (die Annahme von Grossbuchstaben bleibt, sie wird nur nicht
mehr zur Falle). Zusicherung mit beiden Schreibweisen, und eine
Positivkontrolle, dass ein WIRKLICH abweichender Hash weiterhin auffällt.

## 5. BLOCKIEREND — die einzige neue Produktionszeile ist ungeprüft

**Selbst gemessen:** `jurabk: jurabkAusXml(xmlText), xmlText };` →
`jurabk: jurabkAusXml(xmlText) };` (eine Fundstelle, Marker gesetzt,
gegen eine unabhängige Kopie zurückgenommen, `diff` EXIT 0) ergibt
**EXIT 0, 116 PASS / 0 FAIL**. In Produktion liefe damit jede gii-Quelle in
`if (!abruf.xmlText) throw …` und würde `pruefungsfehler`, also rot.

Grund ist die Klasse aus der CLAUDE.md: jeder Test stubbt
`abrufFunktionen.giiXml` und baut `xmlText` selbst — **der Test ruft die
Kette anders auf als die Produktion.**

**Zu bauen:** eine Zusicherung, die `holeAbrufGiiXml()` in
PRODUKTIONSFORM durchläuft, mit gestubbtem NETZ statt gestubbter
Abruffunktion (also auf der Ebene darunter: der Rohabruf liefert ein
ZIP/XML, `holeAbrufGiiXml()` verarbeitet es wirklich), und die belegt, dass
`xmlText` im Ergebnis ankommt und der Normtext-Hash daraus entsteht.
Gegenprobe: mit entfernter Weitergabe muss sie ROT werden — miss es und
melde beide Zahlen. Kein echter Netzzugriff (die Suite ist auf dem
Live-Server Deploy-Gate).

## 6. Meldungen — vier Stellen, die das Falsche sagen

Alle vier am Quelltext gelesen, nicht vermutet.

- **`pruefungsfehler` ist nicht auf gii-xml beschränkt.** Der neue Fänger
  setzt die Lage mit dem `art` der jeweiligen Quelle, `baueZeile()` meldet
  aber immer „Der Normtext liess sich nicht extrahieren". Für eine
  `pruefsumme`-Quelle, die gar keinen Normtext hat, ist das falsch. Die
  Meldung muss nach `art` unterscheiden.
- **Der Gruppierungsschlüssel verliert den Grund.** `[kuerzel, lage,
  standAlt||'', standNeu||'']` — bei `pruefungsfehler` sind beide Stände
  undefined, also fallen mehrere Paragrafen mit VERSCHIEDENEN Gründen in
  eine Gruppe, und die Meldung nennt nur den ersten. `grund` gehört in den
  Schlüssel.
- **Die Überschrift „Zusätzlich ruhig (nur Prüfsumme geändert, Länge gleich
  geblieben)"** (Zeile ~571) ist für die neue Lage
  `gesetz_geaendert_norm_gleich` sachlich falsch — diese Quellen haben weder
  Prüfsumme noch Bytelänge. Dieselbe Aussage stand an zwei Orten, einer wurde
  nachgezogen, dieser nicht.
- **Die fünf neuen `baueZeile()`-Zweige haben KEINE Zusicherung.** Die
  Testdatei ruft das importierte `baueZeile()` nirgends auf. Diese fünf Texte
  sind das gesamte Produkt der Änderung, das ein Mensch je zu sehen bekommt.
  Jeder bekommt eine Zusicherung, und mindestens einer eine Gegenprobe (Text
  verfälschen → ROT, zurücknehmen → GRÜN, beide Zahlen melden).

## 7. Zusicherungen, die fehlen

- **Die Fussnoten-Regel ist unbewacht.** Alle Fixturen benutzen das
  selbstschliessende `<fussnoten/>`, das der Tag-Entferner ohnehin
  wegnähme — die Regel, die einen redaktionellen Fussnotenzusatz vom
  Fingerabdruck fernhalten soll, ist also durch nichts geprüft. Fixtur mit
  einem ECHTEN, nicht leeren `<fussnoten>`-Block: mit und ohne Fussnote muss
  derselbe Hash herauskommen.
- **Die fünf neuen Zähler in `schreibeStand()` und `version: 3` sind
  ungeprüft.** Eine Zusicherung über den Inhalt der Statusdatei.
- **Die „Gegenprobe zur Gegenprobe" prüft eine lokale Kopie.**
  `klassifiziereAlt()` ist in der Testdatei selbst deklariert; die Zusicherung
  kann keinen Regress im Produktionscode finden und erhöht nur die
  PASS-Zahl. Entweder ersatzlos streichen oder in einen Kommentar wandeln —
  die echte Positivkontrolle ist die Zusicherung daneben, die das importierte
  `klassifiziere()` ruft.

## 8. ZULETZT — die Ausgangs-Fingerabdrücke eintragen

**Betreiber-Entscheidung 16.09.2026:** eintragen NUR dort, wo die Standangabe
HEUTE noch mit dem bestätigten Registerstand übereinstimmt. Wo sie abweicht,
bleibt die Quelle ohne Fingerabdruck — dort muss ohnehin ein Mensch hinsehen,
und ein Hash würde einen ungeprüften Text zum Sollwert machen.

**Warum das dringend ist, gemessen:** ohne Eintrag ist JEDE der 61
gii-xml-Quellen `normtext_unbestaetigt` → rot, ohne Gnadenfrist. Der
Mittwochslauf meldete ab dem Merge rund 60 rote Quellen samt
Telegram-Alarm — genau die Krankheit, vor der der Wächter in seinem eigenen
Kopfkommentar warnt.

**Mein Messstand vom 16.09.2026** (eigener Lauf gegen die echten Quellen):
`STAND_PASST=37`, `STAND_WEICHT_AB=0`, `FEHLER=24`. Die 24 zerfallen in
**20 Zeitüberschreitungen** (arbschg, arbst_ttv_2004, betrsichv_2015 — reine
Netzlage, ein Nachlauf je Gesetz genügte schon in Runde 1) und **4 UVSV**
(`__3`, `__4`, `__7`, `__8`), bei denen schon der Gesetzesabruf strukturell
scheitert („Standangabe nicht in der XML-Fassung gefunden", seit 09.09.2026
bekannt). Die vier bekommen KEINEN Fingerabdruck und bleiben, wie sie sind.

**Dein Auftrag dazu:**
1. Erst NACH Punkt 1 (neue Normalisierung) die Hashes erzeugen — vorher
   erzeugte sind ungültig.
2. Für jede gii-xml-Quelle in EINEM Lauf beides ermitteln: stimmt die
   Standangabe heute mit dem Register überein, und wie lautet der Hash.
   Zeitüberschreitungen wiederholen, bis das Gesetz wirklich geladen ist.
3. Eintragen NUR bei Übereinstimmung, mit `normtext_bestaetigt_am` auf das
   Datum des Laufs (über `formatBerlinDate`, nicht `toISOString`).
4. **Melde die Zahlen wörtlich**: wie viele eingetragen, wie viele wegen
   abweichendem Stand ausgelassen (mit Nennung), wie viele wegen Abrufs
   gescheitert. Wenn eine Quelle abweicht, trag sie NICHT ein und sag es.
5. Abschliessend die Bewertung über das fertige Register laufen lassen und
   melden, welche Lagen dabei herauskommen. Ziel ist: keine
   `normtext_unbestaetigt` mehr ausser bei den ausdrücklich genannten
   Ausnahmen.

## Nicht in dieser Runde — festhalten, nicht bauen

- **`enbezAusUrl()` akzeptiert nur `__<Zahl>[<Buchstabe>].html`.** Andere
  echte gii-Formen (`art_12.html`, `anhang_3.html`, `anlage_1.html`) würden
  dauerhaft rot und wären auch von Hand nicht heilbar. **Alle 61 heutigen
  Quellen passen** (selbst gemessen — mein Abgleichlauf erzeugte für keine
  einzige „kein Paragraf ableitbar"), es ist also latent. Wenn du es billig
  entschärfen kannst, ohne zu raten, melde den Vorschlag — bau ihn nicht.
- **`tools/rechtsstand-normtext-hashes.js` kann zwei Checkouts mischen:**
  es setzt `GYMDOCU_REPO` nur, wenn es noch nicht gesetzt ist, lädt
  `core/rechtsstand.js` aber über den eigenen Pfad und den Wächter über
  `GYMDOCU_REPO`. Bei vorbelegter Variable stammen Normalisierung und Abruf
  aus verschiedenen Bäumen. Wenn es eine Ein-Zeilen-Korrektur ist (Variable
  unbedingt auf den eigenen Checkout setzen), mach sie; sonst melden.
- **Die Superadmin-Anzeige im Hauptserver-Repo** kennt `version: 3` und die
  fünf neuen Lagen nicht. Anderes Repo, ausserhalb dieses Auftrags — nur
  festhalten.

## Abschluss

Volle Suite mit `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`,
keine Pipe, kein äusseres `flock`. Danach Dateizahl-Ritual, `npm run lint`,
Marker-Scan (Sollwert im GymDocu-Repo: 6, alle in
`docs/offene-befunde-31-08-2026.md`).

Jedes Mutationsskript nimmt den Zielpfad als ARGUMENT, zählt die Fundstellen
und bricht bei 0 UND bei mehr als 1 ab, schreibt den Marker mit und wird gegen
eine unabhängig angelegte Kopie zurückgenommen (`cp` hin, `cp` zurück, `diff`
EXIT 0) — nie über `git checkout`. Die Rücknahme NICHT mit einem Testlauf
verketten.

Melde Zahlen wörtlich, auch unangenehme. Widersprich mit einer Messung, wo
eine Vorgabe hier nicht trägt. Committe und pushe, bevor du auf einen langen
Lauf wartest.
