# Auftrag — Gerätealter und Mängelhistorie an der Ausmusterung

Betreiber-Auftrag 16.09.2026, aus der Orbit4-Recherche. **Wörtlich: „1 machen
aber optional, da es viele studios gibt, die alte geräte haben und bei ketten
ist den studioleitern oft das alter der geräte nicht bekannt."**

Der Zweck steht in `plaene/ENTSCHIEDEN.md`: nur die Betreiberpflichten
protokollieren. Dieser Beitrag fällt darunter, weil die Entscheidung
„weiterbenutzen oder ausmustern" selbst dokumentationspflichtig ist und heute
ohne jede Grundlage getroffen wird — die Bestätigungsseite zeigt Name,
Standort und Seriennummer, sonst nichts.

## Die drei Eigenschaften, an denen dieser Beitrag hängt

1. **Das Alter ist FREIWILLIG.** Nie Pflichtfeld, nie blockierend, kein
   Formular scheitert daran. Wer es nicht weiss, lässt es leer — das ist der
   Normalfall, nicht die Ausnahme.
2. **„Unbekannt" sieht aus wie unbekannt, nicht wie ein Mangel.** Keine rote
   Markierung, kein Warnzeichen, keine Zählung „57 Geräte ohne Alter". Sonst
   erzeugen wir bei jeder Kette hunderte Zeilen für etwas, das dort niemand
   wissen kann, und die Seite wird weggeklickt.
3. **Kein Satz auf der Seite behauptet mehr, als wir wissen.** Eine
   abgeleitete Untergrenze heisst „im System seit", NIE „in Betrieb seit" und
   NIE „Alter". Das ist eine Zusicherung wie jede andere und wird geprüft
   (CLAUDE.md: „Ein Satz, den die Oberfläche neu behauptet, ist eine
   Zusicherung und gehört gemessen wie jede andere" — dreimal an einem Tag
   schiefgegangen).

## 1. Das freiwillige Feld

**Migration** nach der Konvention von `migrations/0057_geraete_ausmusterung.sql`
(fortlaufende Nummer, Kopfkommentar mit Begründung, idempotent).

`geraete` bekommt `inbetriebnahme_am TEXT` — NULL erlaubt und der Regelfall.

**Zwei erlaubte Formen, per CHECK erzwungen:** ein volles Datum `YYYY-MM-DD`
oder ein blosses Jahr `YYYY`. Begründung: wer nur „irgendwann 2015" weiss,
soll das sagen können, statt sich auf den 1. Januar festzulegen — eine
erfundene Genauigkeit wäre in einem Nachweissystem schlimmer als eine grobe
Angabe. NULL bleibt NULL; ein leerer String ist NICHT erlaubt (derselbe
Fallstrick wie bei `ausgemustert_am`, s. die CHECKs in 0057).

**Eingabe:** in die BESTEHENDEN Bearbeitungsformulare, kein neues Formular.
Fundorte aus der Vorarbeit — VOR dem Bauen nachmessen, die Zeilen verschieben
sich:
- Cardio/Kraft: `routes/admin/geraete-typen.js` ~320-334 (dort stehen schon
  Name, Standort, Seriennummer).
- Seilkontrolle: `routes/admin/geraete.js` ~130-137 — dort gibt es bisher nur
  ein Umbenennen-Formular. **Prüfe, ob Standort und Seriennummer dort
  überhaupt gepflegt werden können.** Falls nicht, ist das ein eigener Befund:
  melde ihn, und bau das Feld an der Stelle ein, die fachlich passt, ohne die
  Seite umzubauen.

**Achtung, gemessen in der Vorarbeit:** Cardio- und Kraftgeräte werden nicht
über ein Anlegeformular erzeugt, sondern entstehen beim QR-Bekleben
(`core/qr-zuordnung.js`). Es gibt also keinen Ort, an dem man das Alter „beim
Anlegen" mitgäbe — deshalb gehört es ins Bearbeitungsformular. Prüfe das
nach; wenn es anders ist, sag es.

## 2. Die abgeleitete Untergrenze „im System seit"

Ohne jede Eingabe lässt sich sagen, seit wann ein Gerät bei uns vorkommt. Das
beantwortet „ist das ein Oldtimer?" in vielen Fällen schon.

**Die Quelle ist zu MESSEN, nicht zu wählen.** Die Vorarbeit nennt als
Kandidaten `geraete_sperren.gesperrt_am`, `geraete_defekte.erstellt_am`,
`geraete_hinweise.erstellt_am` — alle drei haben denselben Mangel: sie
existieren nur, wenn mit dem Gerät etwas schiefging. Ein gepflegtes Gerät
hätte gar kein Datum.

**Vermutlich besser, und genau das ist zu prüfen:** der Zeitpunkt der
QR-Zuordnung (`qr_token`, `anker_art='geraete'`, `zugeordnet_am` /
`beansprucht_am`). Wenn Cardio- und Kraftgeräte wirklich erst beim Bekleben
entstehen, IST das ihr Eintrittsdatum ins System — und es existiert für jedes
Gerät, nicht nur für die auffälligen.

**Miss beides und melde die Zahlen:** für wie viele Geräte liefert die
QR-Quelle ein Datum, für wie viele die Mängelquellen, für wie viele keine der
beiden? Nimm die Quelle, die am meisten Geräte abdeckt, und ergänze sie um
die anderen per `MIN()`, wo sie früher liegen. **Wenn gar keine Quelle greift,
wird nichts angezeigt** — kein „unbekannt seit", keine leere Zeile.

Für Seilkontroll-Geräte gilt dasselbe getrennt; sie entstehen anders. Miss
es und sag, was dort trägt.

**Jede Abfrage trägt `studio_id`.** Auch die Unterabfragen.

## 3. Die Mängelhistorie

Kostet keine Eingabe, die Daten liegen längst da. Gebraucht wird, was es laut
Vorarbeit noch NICHT gibt: eine Zählung ALLER Mängel eines Geräts, nicht nur
der offenen. Die bestehenden Abfragen zählen durchweg `status='offen'`.

Anzuzeigen ist, je Gerät:
- wie viele Mängel insgesamt erfasst wurden,
- davon wie viele offen sind,
- wann der letzte war.

Für Seilkontrolle kommt das aus `geraete_sperren`, für Cardio/Kraft aus
`geraete_defekte`. **Zähle NICHT über `geraet_name`, sondern über
`geraet_id`** — der Name ist änderbar (es gibt ein Umbenennen-Formular), eine
Zählung über den Namen bricht beim ersten Umbenennen und zählt bei
Namensgleichheit fremde Geräte mit. Wo eine Bestandsabfrage den Namen
benutzt, ist das ein Fundort für einen eigenen Befund, kein Vorbild.

Geräte ohne jeden Mangel bekommen „keine Mängel erfasst" — ausdrücklich, nicht
eine leere Stelle. Der Unterschied zwischen „nichts passiert" und „nicht
geprüft" muss lesbar bleiben.

## 4. Wo es erscheint

Auf der Bestätigungsseite der Ausmusterung, also dort, wo die Entscheidung
fällt: `routes/admin/ausmusterung.js`, die GET-Route und ihre Anzeige (die
Vorarbeit nennt `ladeGeraetAnzeige()` ~132-137 und den Anzeigeblock ~258 —
nachmessen).

Ein eigener Block neben Name/Standort/Seriennummer, mit genau diesen Zeilen:

- **Inbetriebnahme:** das freiwillige Feld, wenn gesetzt. Fehlt es, steht die
  Zeile NICHT da (kein „unbekannt", kein Platzhalter).
- **Im System seit:** die Untergrenze, wenn ermittelbar, mit einem Wort, das
  sie als Untergrenze kenntlich macht (etwa „mindestens seit"). Sonst weg.
- **Mängel:** die drei Zahlen aus Punkt 3.

**Der Block darf die Seite nicht umbauen** und keinen der bestehenden
Riegel berühren — die Ausmusterungslogik selbst wird in diesem Beitrag NICHT
angefasst.

## Was zu beweisen ist

- **Gegenprobe zur CHECK-Bedingung, beide Richtungen:** `2015` und
  `2015-03-12` gehen durch, `15`, `2015-3-12`, `''` und `morgen` fallen
  ab. Positivkontrolle nicht vergessen — eine Bedingung, die alles ablehnt,
  bestünde den Sperrteil auch.
- **Das Feld ist wirklich freiwillig:** ein Speichern ohne Angabe muss
  gelingen. Miss es über den echten Schreibweg, nicht über ein Hand-INSERT.
- **Die Anzeige verschwindet wirklich:** Gerät ohne Inbetriebnahme und ohne
  ableitbare Untergrenze → die Zeilen kommen nicht vor. Miss die
  Trefferzahl im erzeugten HTML, nicht den Augenschein.
- **Der Hinweistext behauptet nichts Falsches:** eine Zusicherung, die dem
  abgeleiteten Wert die Wörter VERBIETET, mit denen er ein Alter behaupten
  würde („in Betrieb seit", „Baujahr", „Alter:"). Vorbild ist die Zusicherung
  aus dem Trainer-Tablet-Beitrag, die einem Hinweistext bestimmte Wörter
  untersagt — gemessen 62 PASS / 3 FAIL mit dem alten Satz, 65 / 0 ohne.
- **Mandantentrennung:** eine Zusicherung, dass ein Gerät eines FREMDEN
  Studios weder gezählt noch angezeigt wird. Nicht tautologisch bauen: die
  Fremddaten müssen im Testbestand wirklich vorhanden sein, sonst prüfst du,
  dass eine leere Tabelle leer ist.
- **Die Zählung hängt an der ID, nicht am Namen:** ein Gerät umbenennen und
  messen, dass seine Mängelzahl gleich bleibt; ein zweites Gerät gleichen
  Namens anlegen und messen, dass seine Mängel NICHT mitgezählt werden.

## Ausdrücklich NICHT in diesem Beitrag

- Zwischenstände beim Mangel („Techniker beauftragt", „Ersatzteil fehlt") —
  Betreiber-Einwand: Mehraufwand fürs Personal.
- Jede Anbindung an ein fremdes Ticketsystem.
- Der Gerätebezug für den Dienstleisterbesuch (eigener, späterer Beitrag).
- Kosten, Budgets, Ampeln — das ist der Teil von Orbit4, der aus GymDocu ein
  anderes Produkt machte.
- Eine Pflicht, das Alter nachzutragen; eine Liste „Geräte ohne Alter"; jede
  Form von Mahnung.

## Abschluss

Volle Suite mit `bash test/run.sh > <logdatei> 2>&1; echo "SUITE_EXIT=$?"`,
keine Pipe, kein äusseres `flock`. Danach Dateizahl-Ritual, `npm run lint`
(Ergebnis wörtlich melden, auch bei Grün), Marker-Scan (Sollwert im
GymDocu-Repo: 6, alle in `docs/offene-befunde-31-08-2026.md`).

Jedes Mutationsskript nimmt den Zielpfad als ARGUMENT, zählt die Fundstellen
und bricht bei 0 UND bei mehr als 1 ab, schreibt den Marker mit und wird gegen
eine unabhängig angelegte Kopie zurückgenommen (`cp` hin, `cp` zurück, `diff`
EXIT 0) — nie über `git checkout`. Die Rücknahme NICHT mit einem Testlauf
verketten.

Die Zeilennummern oben stammen aus einer Vorarbeit und sind FUNDORTE, keine
Befunde. Miss sie nach. Melde Zahlen wörtlich, auch unangenehme, und
widersprich mir mit einer Messung, wo eine Vorgabe nicht trägt. Committe und
pushe, bevor du auf einen langen Lauf wartest.
