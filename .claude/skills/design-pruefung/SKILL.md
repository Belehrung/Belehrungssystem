---
name: design-pruefung
description: >
  Prüft Aussehen und Barrierefreiheit einer Änderung, wenn Marktplatz-Plugins
  wie design:critique oder design:accessibility nicht ladbar sind. Immer
  benutzen, wenn sich das Aussehen einer Seite ändert (Farben, Abstände,
  Layout, neue Komponenten) oder wenn ein neues Bedienelement entsteht
  (Button, Formularfeld, Link, Fokusziel). Rechnet WCAG-Kontrastverhältnisse
  über kontrast.js statt sie zu schätzen und nutzt lokale Screenshots, weil
  der Browser dieser Umgebung nur localhost erreicht, nicht das offene
  Internet.
---

# Design- und Barrierefreiheitsprüfung

Diese Fähigkeit ersetzt die Marktplatz-Plugins `design:critique` und
`design:accessibility`, wenn diese in der laufenden Sitzung nicht geladen
werden können. Sie deckt dieselbe Prüfabsicht ab: sehen, ob eine Änderung am
Aussehen lesbar, bedienbar und kontrastreich genug ist — belegt mit Zahlen,
nicht mit einem Eindruck.

## Prüfschritte

### 1. Was hat sich am Aussehen geändert?

Den Diff lesen und die betroffenen Seiten benennen. Ein Tippfehler im Text
oder ein umbenannter Button ist KEINE Änderung am Aussehen — dafür gilt die
Bagatellgrenze aus der CLAUDE.md des Repos, diese Prüfung ist dann nicht
nötig. Zielgerichtet prüfen bedeutet auch: nur die Seiten anschauen, die der
Diff tatsächlich berührt.

### 2. Farbpaare bestimmen

Nur die Farbpaare notieren, die WIRKLICH übereinander liegen — Textfarbe auf
ihrem tatsächlichen Hintergrund, Rahmenfarbe auf der Fläche, vor der sie
steht. NICHT alle Farben einer Datei automatisch gegeneinander kreuzen: das
erzeugt Paare, die im Layout nie zusammen erscheinen, und damit Fehlalarme,
die die echten Befunde verdecken.

Zu jedem Paar gehört außerdem seine ROLLE, denn sie entscheidet, welche
Schwelle gilt — dieselbe Farbe kann als Schrift eine andere Schwelle haben
als als Fläche ohne Schrift. Ein Farbwert, der im Code nur als Fläche
vorkommt (z. B. ein Buttonhintergrund), wird nicht an der Textschwelle
gemessen. Beispiel aus diesem Repo (`server.js`, `#e60023` als
Button-Hintergrund mit weißer Schrift, nie als Textfarbe):

```
"#ffffff:#e60023:text"     weiße Schrift auf rotem Button      -> Schwelle 4.5
"#e60023:#1c2128:flaeche"  rote Buttonfläche auf Kartenfläche  -> Schwelle 3.0
```

Ohne Rollenangabe gilt ein Paar als `text` (Schwelle 4.5) — das bisherige
Verhalten. Erlaubte Rollen: `text`, `grosstext`, `flaeche`.

### 3. Kontrastverhältnis rechnen

```
node .claude/skills/design-pruefung/kontrast.js "<vordergrund>:<hintergrund>[:<rolle>]" ["<weiteres Paar>" ...]
```

Werte RECHNEN lassen, nicht schätzen. Das Skript meldet je Paar alle drei
Urteile (Fließtext AA, Großtext AA, Bedienelement/Fokus AA) sowie eine
Spalte "Maßgeblich" mit der Rolle des Paars und dem für den Exit-Code
zählenden Urteil. Es beendet sich mit Exit-Code 1, sobald ein Paar SEINE
maßgebliche (rollenabhängige) Schwelle reißt — nicht mehr pauschal an der
Fließtext-Schwelle, sonst schlägt das Gate bei einer korrekten Fläche
(z. B. `#e60023:#1c2128:flaeche`, 3.0 gilt, besteht) fälschlich Alarm und
wird nach ein paar Fehlalarmen ignoriert. Damit ist es weiterhin als Gate
in einem Prüf-Lauf einsetzbar.

### 4. Screenshot in zwei Breiten

Über den lokalen Browser Screenshots bei etwa 390px (schmal/mobil) und
1280px (breit/Desktop) machen. Der Browser dieser Umgebung erreicht das
offene Internet NICHT — selbst einfache öffentliche Seiten scheitern dort.
`localhost` erreicht er dagegen zuverlässig. Screenshots der eigenen,
lokal laufenden Anwendung sind deshalb die einzige verlässliche Sichtprüfung
und keine Ausweichlösung.

### 5. Bei neuen Bedienelementen zusätzlich prüfen

- Mit der Tastatur erreichbar (Tab-Reihenfolge, kein Fallenlassen des Fokus).
- Sichtbarer Fokusrahmen vorhanden, wenn das Element per Tastatur fokussiert
  wird.
- Beschriftung/Zustand wird nicht allein durch Farbe getragen (z. B. ein
  Fehlerzustand nur rot eingefärbt, ohne Text oder Symbol).
- Trefferfläche mindestens 24×24 CSS-Pixel.

### 6. Ergebnis berichten

Als Liste mit ZAHLEN — Kontrastverhältnisse aus Schritt 3, Pixelbreiten aus
Schritt 4, ja/nein je Punkt aus Schritt 5 — nicht als Eindruck oder
Bauchgefühl. Wer nur "sieht gut aus" schreibt, hat nichts geprüft.

## Was diese Prüfung NICHT leistet

- Kein Test mit einem Screenreader.
- Keine Prüfung mit echten Nutzerinnen und Nutzern.
- Keine Aussage über Sprachverständlichkeit oder Textqualität.
- Keine automatische Erkennung falscher HTML-Semantik — zum Beispiel ein
  `<div>`, das eigentlich ein `<button>` sein müsste, fällt dieser Prüfung
  nicht auf.

Diese Prüfung ersetzt keine vollständige Barrierefreiheitsprüfung. Sie deckt
Kontrast, Sichtprüfung in zwei Breiten und die grundlegende
Tastaturbedienbarkeit neuer Elemente ab — mehr nicht.
