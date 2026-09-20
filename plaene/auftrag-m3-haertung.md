# Auftragspapier — M3-Härtung: die Zusicherungen messen die SCHREIBWEISE, nicht die WIRKUNG

**Stand 20.09.2026.** Grundlage sind zwei Prüfspuren über den Diff `cdeb020`
(Zweig `landing-m3`, Repo `Belehrung/gymdocu-hauptserver`): eine LESENDE und
eine AUSFÜHRENDE. **Jeder Befund unten ist vom Haupt-Agenten SELBST
nachgemessen worden**; einer ist dabei gefallen und steht am Ende als solcher.

## Die gemeinsame Wurzel — sie ist wichtiger als die acht Einzelfälle

Alle Zusicherungen Z-a bis Z-e vergleichen **rohen Quelltext** mit regulären
Ausdrücken. Jede der acht Umgehungen unten ist dieselbe Krankheit: gemessen
wird, wie etwas GESCHRIEBEN ist, gemeint ist, wie es WIRKT.

**Was NICHT die Behebung ist, und der Grund steht im Repo:** die Seite im
Gate zu RENDERN. `test/e2e-landing-netzwerk.js` tut genau das und ist
**bewusst** nicht in `test/run.sh` — sein Kopfkommentar begründet es: er
startet einen echten HTTP-Server und einen echten Browser-Prozess, und die
Suite läuft auf dem Live-Server als Deploy-Gate. Nachgemessen:
`grep -c "e2e" test/run.sh` → **0**. Die ausführende Prüfspur hat das
Fehlen als verschärfenden Umstand gemeldet; es ist eine begründete
Entscheidung, kein Versäumnis. **Dieser Beitrag bleibt deshalb bei der
Quelltextprüfung — und sagt im Kopfkommentar ausdrücklich, dass sie die
Wirkung nicht misst und wo die rendernde Prüfung liegt.**

Die Behebung ist deshalb **eine Normalisierung plus sieben Schärfungen**,
nicht acht neue Muster.

---

## 1. Die Normalisierung — sie schliesst allein vier der acht Fälle

Ein Helfer `sichtbarerText(html)` in `test_landing.js`, angewandt auf JEDE
Textprüfung von Z-b, Z-c und Z-e:

1. **HTML-Kommentare entfernen** (`/<!--[\s\S]*?-->/g`).
2. **Entities auflösen:** `&nbsp;` → normales Leerzeichen, `&shy;` → LEERER
   String, dazu numerische (`&#173;`, `&#xAD;`) und die bereits behandelten
   `&amp;`/`&lt;`/`&gt;`/`&quot;`/`&#39;`.
3. **Weiches Trennzeichen U+00AD entfernen**, auch wenn es direkt im Text
   steht.
4. **Inline-Auszeichnung entfernen:** `<b>`, `<i>`, `<span>`, `<em>`, `<strong>`
   und ihre Schlusstags, damit `alle <b>sechs</b> Module` als
   `alle sechs Module` gelesen wird. **Block-Tags NICHT entfernen** — sonst
   fliessen zwei Absätze zu einem Satz zusammen und erzeugen Treffer, die es
   nicht gibt. Ersatz durch ein Leerzeichen, nicht durch nichts.
5. **Leerraum zusammenziehen.**

**Gegenprobe zur Normalisierung selbst** (Pflicht, sonst ist sie Dekoration):
der Helfer bekommt einen eigenen Selbsttest mit wörtlichen Ein-/Ausgabepaaren
für jeden der fünf Schritte, und je eine Positivkontrolle, dass ein Text OHNE
den jeweiligen Sonderfall unverändert durchgeht.

---

## 2. Die acht Befunde, ihre Behebung und ihre Abnahme

Die Spalte **Abnahme** nennt die Mutation, die nach der Behebung ROT werden
MUSS. Alle diese Mutationen sind bereits gemessen worden und waren GRÜN —
sie sind damit wörtliche Abnahmekriterien, keine erfundenen.

### B1 — BLOCKIEREND: CSS-Escapes bringen das §-Pseudoelement zurück

`test_landing.js:651`: `CONTENT_PARAGRAPH_REGEX = /content\s*:\s*["']\s*§/`

Gemessen (eigene Messung): `content:"\00A7"` → **false**, `Content:"§"` →
**false**. CSS rendert `\A7`, `\a7 `, `\00A7` und `\0000A7` alle als §.
Die ausführende Spur hat mit `content:"\A7"` **alle 14** Abzeichen wieder mit
§ versehen — `getComputedStyle(el,'::before').content` lieferte `"§"` statt
`none` — bei `243 PASS / 0 FAIL` und `SUITE_EXIT=0`.

**Behebung:** den `content`-Wert aus der CSS-Regel ziehen
(Eigenschaftsname **case-insensitiv**), dann CSS-Escapes dekodieren
(`\` + 1–6 Hexziffern, optional gefolgt von EINEM Leerzeichen, das zum Escape
gehört und nicht zum Text) und erst DANN auf § prüfen.

**Abnahme:** `.mod-legal::before { content:"\A7"; … }` → ROT.
Ebenso `Content:"§"`, `content:"\0000A7"` und `content:'\a7 '`. Und
`content:"XY"` muss GRÜN bleiben (Positivkontrolle, sonst schlägt die Regel
auf jedes Pseudoelement an).

### B2 — HOCH: eine `id` im HTML-Kommentar zählt als echtes Sprungziel

Gemessen: `[...html.matchAll(/\bid="([^"]+)"/g)]` über
`<!-- <section id="module"> --><section class="modules">` liefert
`['module']`, während `document.getElementById('module')` **null** ist.
Die ausführende Spur hat den Anker so getötet, und Z-a meldete
`✓ href="#module" hat genau ein Ziel id="module" (gefunden 1x)`.

**Behebung:** Kommentare vor der ID- und `href`-Ermittlung entfernen
(Schritt 1 der Normalisierung).

**Abnahme:** Abschnittskopf auskommentieren und daneben ohne `id` neu setzen
→ ROT.

### B3 — MITTEL-HOCH: drei Schreibweisen der Modulzahl schlüpfen durch

`test_landing.js:640`. Gemessen: `sechs&nbsp;Module` → **false**,
`mit allen sechs Modulen` → **false**, `alle <b>sechs</b> Module` → **false**
(ausführende Spur), während `alle sechs Module` korrekt ROT wird.

**Behebung:** Prüfung auf `sichtbarerText(bezahlterBlock)`; dazu die
Wortform erweitern: `Module\b` → `Module(n|s)?\b`.
**`Modulen` ist der realistischste Fall** — „mit allen sechs Modulen" ist
normales Deutsch.

**Abnahme:** alle drei Varianten → ROT; `<li>Alle Module</li>` bleibt GRÜN.

### B4 — MITTEL-HOCH: `&shy;` wirkt in BEIDE Richtungen falsch

Gemessen, beide Seiten selbst:
* `manipulations` + U+00AD + `sicheren` gegen `/manipulationssicher/i` →
  **false**. Das verbotene Wort schlüpft durch, auf dem Bildschirm steht es.
* `Manipulations` + U+00AD + `schutz` gegen `/Manipulationsschutz/gi` →
  **null**, also `gefunden 5x` statt 6 → **FEHLALARM** gegen eine völlig
  übliche Typografie in langen Komposita.

**Das ist EIN Befund mit zwei Seiten, und die Behebung muss beide schliessen
— sonst vergrössert sie den Fehlalarm.** Genau davor hat die ausführende
Spur ausdrücklich gewarnt.

**Behebung:** Schritt 2/3 der Normalisierung, angewandt auf BEIDE Muster
(Verbotsliste UND Positivzählung).

**Abnahme:** `manipulations&shy;sicheren` → ROT; `Manipulations&shy;schutz`
→ GRÜN (der Fehlalarm ist weg); `Manipulationsschutz` ohne Trennstrich →
weiterhin GRÜN mit Zahl 6.

### B5 — MITTEL: `vor … Gericht` fängt nur EIN Wort dazwischen

Gemessen: `vor Gericht` → **true**, `vor jedem Gericht` → **true**,
`vor jedem deutschen Gericht` → **false**.

**Wichtig für die Einordnung:** Die LESENDE Spur hat hier behauptet, schon
`vor Gericht` werde nicht erkannt, und das als *blockierend* eingestuft —
mitsamt einem Nachmess-Schnipsel, der `false` behauptet. **Das ist falsch,
nachgemessen `true`** (`\S*` darf leer sein). Der echte, kleinere Befund ist
die Zwei-Wort-Lücke, und er stammt aus der AUSFÜHRENDEN Spur.

**Behebung:** Muster auf bis zu drei Wörter erweitern, ohne über
Satzgrenzen zu laufen:
`/\bvor\b(?:\s+\S+){0,3}\s+Gericht\b/i`.
**Und den Kommentar berichtigen** — er behauptet heute mehr, als das Muster
leistet. Die Grenze „er bannt eine Musterklasse, keine Aussage" bleibt
ausdrücklich stehen: `gerichtssichere Akte` wird weiterhin NICHT gefangen,
und das gehört so dokumentiert statt verschwiegen.

### B6 — MITTEL: sechste Säule mit zweiter Klasse wird nicht gezählt

Gemessen: `/class="pillar"/g` zählt bei drei sichtbaren Säulen (eine davon
`class="pillar hervor"`) nur **2**.

**Behebung:** Klassenattribute am Leerraum in TOKEN zerlegen und exakt
vergleichen — nicht `\bpillar\b`, das trifft auch `pillar-ic`.

**Abnahme:** sechste Säule mit `class="pillar hervor"` → ROT; die
bestehenden fünf → weiterhin 5, und `pillar-ic` darf die Zahl NICHT erhöhen
(Positivkontrolle gegen das zu weite Muster).

### B7 — NIEDRIG-MITTEL: ein Abzeichen darf `.mod-list` verlassen

Gemessen: `MOD_LEGAL_REGEX` (`test_landing.js:662`) läuft über die GANZE
Datei; nichts bindet ein Abzeichen an sein `<div class="mod">`. Die
ausführende Spur hat `Art. 5 DSGVO` aus dem Modul in den `<footer>`
verschoben — `{"inModList":13,"imFooter":1}` — und die Solltabelle meldete
`✓ mod-legal #14 entspricht der Solltabelle`.

**Behebung:** zuerst den `.mod-list`-Block ausschneiden, die Solltabelle NUR
darin prüfen, und zusätzlich zusichern, dass die Gesamtzahl im Dokument
gleich der Zahl im Block ist (sonst wandert ein Abzeichen unbemerkt hinaus).

**Abnahme:** Abzeichen in den `<footer>` verschieben → ROT.

### B8 — NIEDRIG: §-Span durch reinen Text ersetzt fällt nicht auf

Gemessen: `modLegalNormalisieren` (`test_landing.js:671`) ersetzt
`<span class="mod-legal-p">§</span>` durch `§ ` — damit ist
`<span class="mod-legal">§ 31 TrinkwV</span>` (reiner Text) vom
gestylten Aufbau nicht mehr zu unterscheiden. Gemessen fällt dabei
`paragraphFarbe` von `rgb(26,122,74)` auf `null` und das Gewicht von 700 auf
500 — die Zusage der Commit-Botschaft („Fettung/Farbe bleiben erhalten") hat
keine Zusicherung.

**Behebung:** die Solltabelle bekommt eine zweite Spalte — trägt dieses
Abzeichen ein `mod-legal-p`-Span oder nicht (9× ja, 5× nein) — und die
Struktur wird mitgeprüft, nicht nur der normalisierte Text.

**Abnahme:** Span bei Nr. 9 durch `§ ` im Text ersetzen → ROT.

### B9 — aus der lesenden Spur: für `ketten.html` fehlt die Leermengen-
Zusicherung zur PREISKARTE

Gemessen: im Test kommt `pcard` zusammen mit `ketten` **0×** vor.

**Nicht zu verwechseln** mit der Leermengen-Zusicherung für die
RECHTSABZEICHEN — die gibt es, und sie wird ROT (die ausführende Spur hat
ein Abzeichen auf `ketten.html` gesetzt:
`✗ FAIL: ketten.html: keine mod-legal-Elemente (die Sollmenge ist hier
leer)`). Die lesende Spur hat das zu einer allgemeinen Lücke verallgemeinert;
sie besteht nur bei Z-c.

**Behebung:** eigene Zusicherung „`ketten.html` hat keine bezahlte
Preiskarte", mit Gegenprobe.

---

## 3. Was NICHT gebaut wird

* **Keine rendernde Prüfung im Gate** (Begründung oben, sie steht im Repo).
* **Kein HTML-Parser als neue Abhängigkeit.** Das Repo hat heute keine; eine
  einzuziehen ist eine Architekturentscheidung, die über diesen Beitrag
  hinausreicht.
* **Nichts an `landing/index.html` und `landing/ketten.html`** — die Seite
  ist nachgemessen richtig (alle 14 Abzeichen gegen die Solltabelle am
  gerenderten DOM, `Manipulationsschutz` 6×/1×, verbotene Muster 0×, Manifest
  selbst nachgerechnet). Geändert wird NUR `test_landing.js`.
* **Der eine Ausnahmefall:** ein Kommentar in `landing/index.html` behauptet,
  das alte Pseudoelement habe bei Nr. 6 UND Nr. 10 „zweimal §" erzeugt. Für
  Nr. 6 stimmt das, für Nr. 10 nicht — dort stand nur EIN, falsch platziertes
  §. Diese drei Wörter werden berichtigt, und der Manifest-Hash wird
  mitgezogen.

## 4. Harte Tore

1. `bash test/run.sh > <log> 2>&1; echo "SUITE_EXIT=$?"` — ohne Pipe, ohne
   äusseres `flock`, `echo` in eigener Zeile. Danach das Dateizahl-Ritual mit
   demselben Sieb auf beiden Seiten, `diff` EXIT 0. **Sollzahl im Baum
   messen** — heute 86, nicht 87.
2. `npm run lint` — Ergebnis wörtlich melden. Es gibt hier kein `lint`-Skript;
   dann wird GENAU DAS gemeldet.
3. Jede Mutation trägt den Marker `GEGENPROBE-` + `DEFEKT`, nimmt den
   Zielpfad als ARGUMENT und bricht bei 0 UND bei >1 Fundstellen ab.
4. **Jede Mutation an `landing/*.html` zieht den Manifest-Hash mit** — sonst
   ist „rot" nicht von „der Hash ist rot" zu unterscheiden.
5. Am Ende: `git status` sauber, Marker-Scan **0 Treffer**, Manifest-Hashes
   gleich den eingetragenen.
6. Kein Modellname in Commit-Botschaft oder Dateien. Kein PR.
