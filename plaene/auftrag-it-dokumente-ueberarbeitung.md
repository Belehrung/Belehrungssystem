# Auftrag — die fünf IT-Dokumente überarbeiten

**Betreiber-Vorgabe 18.09.2026, wörtlich:** „alle nebenkomnetare raus nur das
wesentliche. alle dolumente auf aktuellen stand bringen."

**Ort:** `/home/user/Belehrungssystem/dokumente/it-unterlagen/` — fünf
HTML-Quellen, `stil.css`, `bauen.js`. **Kein Code, keine Tests.** Der
GymDocu-Arbeitsbaum wird NICHT angefasst.

## Teil A — Nebenkommentare raus

Die Dokumente gehen an eine fremde IT-Abteilung und einen
Datenschutzbeauftragten. Alles, was dort steht, muss für DIE etwas
beantworten. Raus muss:

1. **Erzählungen über den Arbeitsprozess.** Beispiel aus
   `02-Sicherheit-und-Datenschutz.html`, Abschnitt „Wie ich meine eigenen
   Fehler finde": die ganze Geschichte über eine Prüfung, die „fünfmal
   hintereinander blind" war und bei der „ein einzelnes Leerzeichen" genügte.
   Das ist für uns wichtig und für den Leser eine Anekdote. **Die REGEL
   dahinter bleibt** („zu jeder Prüfung wird der Fehler absichtlich eingebaut
   und gemessen, dass sie anschlägt") — in zwei Sätzen, ohne Beispiel.
2. **Zeitbezüge auf den Schreibtag.** „Ein Beispiel vom Tag, an dem ich dieses
   Dokument schreibe", „ziehe ich gerade nach", „setze ich als nächstes an".
   Ein Dokument, das man in vier Wochen liest, darf so nicht klingen.
3. **Selbstkommentierende Einschübe.** „das ist der Punkt, an dem viele
   Systeme eine Hintertür offen lassen", „Ich halte das für überzeugender als
   jede Zusicherung, die ich hier hineinschreiben könnte", „nicht
   verschwiegen".
4. **Doppelte Verweise auf sich selbst** („siehe unten", „Begründung im
   nächsten Abschnitt"), wo der Abschnitt ohnehin direkt folgt.

**Was NICHT raus darf — und das ist wichtiger als das Kürzen:**

- **Jede benannte Grenze und jeder offene Punkt bleibt.** Die Dokumente sind
  glaubwürdig, WEIL sie sagen, was nicht geht. Wer die offene Liste kürzt,
  macht sie wertlos.
- **Jede Begründung für eine Entscheidung bleibt** — insbesondere die drei
  Absätze, warum die Festplatte nicht verschlüsselt ist. Das ist keine
  Nebenbemerkung, das ist die Antwort auf die Frage, die jede IT stellt.
- **Keine Aussage wird stärker formuliert, weil sie kürzer wird.** Wenn ein
  Satz heute eine Einschränkung trägt, trägt er sie nachher auch.

Ziel ist ein kürzerer Text, nicht ein glatterer.

## Teil B — auf den aktuellen Stand

**Alle Angaben unten sind vom Haupt-Agenten gemessen.** Wenn dir beim
Einarbeiten eine davon falsch vorkommt: melden, nicht anpassen.

### B1 — Die Zahl der Testdateien

Überall **327 → 335** (steht in `02`, prüfe auch die anderen vier).

### B2 — Das Verbandbuch-PDF liegt nicht mehr auf der Platte

**Die wichtigste inhaltliche Änderung.** Ausgeliefert am 18.09.2026.

In `02-Sicherheit-und-Datenschutz.html`, Tabelle „Verschlüsselung — was
zutrifft und was nicht", Zeile „PDF-Dateien auf der Festplatte":

Bisher steht dort pauschal „Unverschlüsselt". Richtig ist jetzt:

- Das **Verbandbuch-Einzeldokument mit den Gesundheitsdaten** wird bei jedem
  Abruf flüchtig erzeugt, ausgeliefert und sofort gelöscht. Es liegt nicht
  mehr dauerhaft auf der Platte. Ein täglicher Aufräumlauf entfernt Altbestand.
- **Die übrigen PDF-Dateien** (Prüfprotokolle, Monatsberichte) liegen weiterhin
  unverschlüsselt. Bleibt als offener Punkt stehen.

Derselbe Punkt taucht im Abschnitt „Was heute offen ist" auf — dort
entsprechend präzisieren, NICHT streichen.

Auch im Abschnitt „Gesundheitsdaten aus dem Verbandbuch" gehört ein Punkt
dazu: die Daten verlassen die Datenbank nur für den Moment der Auslieferung.

### B3 — Die Aussage über die CI-Abhängigkeitsprüfung ist zu stark

`02`, Abschnitt „Wie eine Änderung auf den Server kommt", vierte Prüfung:
„Prüfung der eingesetzten Fremdbausteine auf bekannte Schwachstellen."

Gemessen am 18.09.2026: Das Gate ist `npm audit` **ab Schweregrad „high"**
(`ops/audit-gate.sh`), Befunde darunter halten die Auslieferung nicht auf —
**und `npm audit` ist keine vollständige Quelle**: es meldet einen real
erreichbaren Befund in einer unserer Abhängigkeiten gar nicht.

Neue Formulierung, sinngemäß: automatische Prüfung ab Schweregrad „hoch",
ergänzt durch eine manuelle Prüfung gegen die exakt installierten Versionen
mit zwei unabhängigen Quellen. **Die Grenze wird benannt, nicht versteckt.**

Das gehört zusätzlich in die offene Liste: ein bestätigter Befund in einer
Upload-Bibliothek ist erkannt und wird behoben.

### B4 — Zwei-Faktor-Geheimnisse

`02` sagt: „ob der Schlüssel auf dem Produktionsserver gesetzt ist, ziehe ich
gerade nach (siehe unten)." Seit 18.09.2026 meldet der interne
Gesundheitsendpunkt, ob der Schlüssel gesetzt ist. **Formuliere die Zeile so
um, dass sie keinen Schwebezustand mehr behauptet** — aber behaupte auch
nicht, der Schlüssel sei gesetzt. Richtig ist: es ist jetzt jederzeit
nachprüfbar, ob er gesetzt ist. Wenn dir das zu dünn erscheint, sag es.

### B5 — Der Stand und das Änderungsverzeichnis

- Datum überall auf den Tag der Überarbeitung.
- `05-Dokumentenuebersicht.html` hat einen Abschnitt „Was sich gegenüber der
  letzten Fassung geändert hat" — der wird neu geschrieben und nennt genau
  die Punkte B2, B3, B4 und die Kürzung.

### B6 — Der Penetrationstest

`02` endet mit „Was ich Ihnen anbiete" (eigene Prüfung in der Testumgebung
oder externe Sicherheitsprüfung). Das bleibt und wird **konkreter**: Es gibt
eine vom Echtbetrieb getrennte Testumgebung unter eigener Adresse, mit eigener
Datenbank, eigenen Geheimnissen und ausschliesslich erfundenen Daten; sie
wird für eine Prüfung mit zwei Studios und erfundenen Gesundheitsdaten
bestückt, damit die Mandantentrennung überhaupt prüfbar ist.

**Nicht hineinschreiben:** Zeitfenster, Spielregeln, Preise — das ist
Verhandlungssache und steht in `plaene/pentest-vorschlag.md` für uns, nicht
für den Kunden.

Dasselbe Angebot gehört als ein Satz in `04-Fragen-an-Ihre-IT.html`, falls es
dort noch nicht steht.

## Nicht zu tun

- **Kein neues Aussehen.** `stil.css` bleibt unangetastet.
- **Keine neuen Farb-, Radien- oder Schriftgrössenwerte.**
- **Keine PDFs bauen.** Das mache ich, nachdem ich die HTML gelesen habe.
- **Keine Aussage erfinden.** Was du nicht in diesem Auftrag findest und nicht
  im Bestand steht, wird nicht behauptet.

## Bericht

Je Dokument: was gestrichen wurde (stichwortartig), was inhaltlich geändert
wurde, und **welche Stelle dir beim Arbeiten falsch oder widersprüchlich
vorkam** — auch wenn du sie nach Auftrag so gelassen hast. Dazu: die Zeichen-
zahl je Datei vorher und nachher.

### B7 — die Härtung, die am 18.09.2026 dazugekommen ist

Gemergt und im Ausrollen. Gehört in `02-Sicherheit-und-Datenschutz.html`,
**ein bis zwei Sätze, nicht mehr** — für eine fremde IT ist das ein Detail,
aber ein sicherheitsrelevantes:

- Vier Aktionen, die Dokumente erzeugen bzw. eine Mail auslösen, liefen bisher
  über einen einfachen Seitenaufruf und damit am Herkunftsschutz vorbei; sie
  sind jetzt Formularabsendungen und laufen durch ihn hindurch.
- Ein automatischer Wächter hält fest, welche Wege bewusst vom Herkunftsschutz
  ausgenommen sind (sie tragen eine eigene Anmeldung). Kommt dort ein neuer
  schreibender Weg dazu, wird die Auslieferung rot, bis jemand die Ausnahme
  ausdrücklich bestätigt.

**Nicht hineinschreiben**, wie der Wächter gebaut ist (Syntaxbaum, Töpfe,
Vielfachheit) — das interessiert dort niemanden und macht den Text länger,
nicht besser.
