# Sticker it (customer-api.live.stickerit.co) — Eignungsprüfung

**Stand 17.09.2026.** Anlass: Die bisher angefragten Druckereien antworten
nicht. Geprüft wurde die öffentliche Schnittstellenbeschreibung, nicht ein
Angebot — alles, was ein Konto voraussetzt, ist unten ausdrücklich als
ungeklärt benannt.

**Quelle:** `https://customer-api.live.stickerit.co/openapi.yaml`, 97.745 Byte,
3.172 Zeilen, Version `2026.9.2`. Die Doku-Seite selbst ist eine
JavaScript-Hülle (841 Byte) und enthält nichts; die Beschreibung liegt unter
`/openapi.yaml`. Gegenprobe, dass die Seite wirklich etwas liefert: eine
erfundene URL derselben Domain antwortet mit HTTP 404 und 44 Byte.

## Ergebnis in einem Satz

**Geeignet, mit drei Vorbehalten, die nur ein Konto klären kann** — und der
Beschnittwert, der seit dem 28.08.2026 offen ist, wird von dieser Druckerei
mit genau unserem vorläufigen Wert beantwortet.

## Was passt

| Anforderung | Befund |
|---|---|
| **Beschnittzugabe** | **2 mm** (Abschnitt „Print file"). Das ist exakt `BESCHNITT_MM = 2` aus `tools/aufkleber.js` — bisher eine unbestätigte Annahme |
| Freie Endformate | `width`/`height` als Zahl mit `unit: mm`, Untergrenze 10 mm. 45×80 und 42×62 liegen weit darüber |
| Konturschnitt | Vektor-Schnittlinien als Sonderfarben benannt: `Die Cut` (durch) und `Score Cut` (Kiss-Cut). `shape: custom` ist die Voreinstellung |
| Unsere Akzentfarbe | `#F7D000` ist die am Logo ausgemessene MARKENfarbe, kein Metallic — liegt im CMYK-Raum. Ein Sonderfarbkanal ist dafür nicht nötig |
| Weiße Flächen | Auf weißem Material ist Weiß das unbedruckte Material. Unser weißes QR-Feld braucht deshalb KEINE Weiß-Ebene — das ist Weg 1 aus ihrer eigenen FAQ („Only offer white materials") |
| Betriebsanbindung | Echte Schnittstelle: Bestellung, Angebot, Lieferzeit, Produktpreise, Versandarten, Statusmeldungen per Webhook. 25 Anfragen/Sekunde |
| Dateiformate | Druckdatei PDF (CMYK, Text in Kurven, Vektor bevorzugt), dazu eine Ansichtsdatei PNG mit mindestens 1500 px |

## Was NICHT passt oder offen ist

### 1. Der veränderliche QR-Code ist die eigentliche Frage

Jeder unserer Aufkleber trägt ein **eigenes** 8-stelliges Token. Das ist keine
Auflage gleicher Aufkleber, sondern Druck mit veränderlichen Daten.

Ihr Modell ist: **ein Zeilenposten = eine Druckdatei + Stückzahl**
(`CreateOrderItemRequest` mit `files`, `quantity`, `width`, `height`). Für 200
verschiedene Aufkleber hieße das 200 Zeilenposten mit je Stückzahl 1.

**Ungeklärt und kaufmännisch entscheidend:** ob es je Zeilenposten eine
Mindestfläche oder Rüstkosten gibt. Die Felder `minOrderArea` und
`maxOrderArea` stehen im Materialschema, ihre WERTE liefert nur ein
authentisierter Abruf. Eine Obergrenze für die Zahl der Zeilenposten je
Bestellung ist in der Beschreibung nicht genannt.

### 2. Mattes Laminat ist nicht wählbar — jedenfalls nicht in der Schnittstelle

Unsere Vorgabe verlangt ausdrücklich **mattes** Laminat (glänzendes Laminat
plus QR-Code gibt Spiegelungen genau dort, wo gescannt wird). Die
Beschreibung sagt nur „We print, laminate, cut" — ein Feld für die
Laminat-Art gibt es nicht. Vermutlich steckt es im Produkt- oder
Material-Schlüssel (`productSku`, `materialSku`), deren Katalog ein Konto
voraussetzt. **Zu klären, bevor irgendetwas gebaut wird.**

### 3. Kein Sonderfarbkanal

`inkset` kennt genau drei Werte: `auto`, `CMYK`, `CMYK+W`. Kein HKS, kein
Pantone. Für UNSEREN Entwurf ist das folgenlos (s.o., die Akzentfarbe ist ein
Gelb im CMYK-Raum).

Es wäre aber ein Ausschlussgrund, falls je ECHTES metallisches Gold gewollt
ist. Diese Druckerei macht Metallic über das **Material**: der ganze Aufkleber
wird auf Goldfolie gedruckt, und deckendes Weiß blockiert den Effekt dort, wo
kein Gold sein soll. Das ist die Umkehrung unseres Aufbaus (dunkle Karte mit
goldenem Akzent) und hieße: Layout neu denken, nicht nur Material tauschen.

### 4. Versand

Die Versandarten werden je Konto und Zielland aufgezählt
(`/v1/stores/{storeHash}/shipping/{countryCode}`). Ob Deutschland und
Österreich bedient werden und zu welchen Laufzeiten, steht in der öffentlichen
Beschreibung nicht.

### 5. Alles Substanzielle ist authentisiert

Selbst gemessen: `/v1/materials`, `/v1/products` und `/v1/stores` antworten
ohne Zugangsdaten mit **HTTP 400**. Zugang gibt es laut Beschreibung nur über
**api@stickerit.co** („Contact us to discuss your integration and get
authentication details"). Basic-Auth oder API-Schlüssel.

## Was wir liefern müssten, wenn es dazu kommt

`tools/aufkleber.js` erzeugt heute SVG. Verlangt werden **PDF** (CMYK, Text in
Kurven, Schnittlinien als benannte Sonderfarben) und zusätzlich eine
**Ansichts-PNG mit mindestens 1500 px**. Das ist Arbeit am Generator, kein
Hindernis — die Geometrie steht, und Vektor ist ihnen ausdrücklich lieber.

## Empfehlung

**Verfolgen.** Drei Fragen an api@stickerit.co, in dieser Reihenfolge, weil
die erste allein das Geschäft entscheidet:

1. Wie rechnet sich eine Bestellung aus N Zeilenposten mit je Stückzahl 1,
   jeder mit eigener Druckdatei? Gibt es Rüstkosten oder eine Mindestfläche
   je Posten?
2. Gibt es einen Produkt- oder Materialschlüssel mit **mattem** Laminat?
3. Versand nach Deutschland und Österreich — welche Arten, welche Laufzeit?

Erst wenn Frage 1 und 2 tragen, lohnt sich Arbeit am Generator.

**Was diese Prüfung NICHT hergibt:** kein Preis, kein Muster, kein Beleg, dass
ein echter Ausdruck auf echtem Material aus 20–30 cm zuverlässig scannt. Das
bleibt offen wie bisher und braucht einen Probedruck, keine Schnittstelle.
