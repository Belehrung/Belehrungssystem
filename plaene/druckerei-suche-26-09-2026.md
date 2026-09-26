# Druckerei-Suche — Stand und Entscheidungen (26.09.2026)

Wird als LETZTER Schritt des Arbeitsplans erledigt (Betreiber 26.09.2026: „machen wir als letzten schritt").

## Betreiber-Entscheidungen (26.09.2026)

- **Kein Selbstdruck** („selbstdruck ist nicht professionell").
- **Keine Vorkasse durch GymDocu** („ich möchte eigentlich nicht in vorkasse gehen") — also keine zentrale Auflage auf
  Lager und kein Zugang, bei dem GymDocu Kunde der Druckerei ist. Das Studio bzw. die Kette bleibt Kunde.
- **Kein Bestellweg über einen Online-Shop** (Link, Upload, Kundenkonto) — „das ist alles zu kompliziert für den
  Studioalltag". Der Knopfdruck in GymDocu bleibt (heutiger Mailweg, `routes/admin/qr-bestellung.js`).
- **Farbig, aber Standardfarben** („einfache farben erhöhen die sichtbarkeit") — CMYK statt abgemessenem Goldton.

## Verworfen, mit Grund (nachgelesen)

- Sticker Mule: keine Bestell-API (FAQ wörtlich „No, we don't provide an API for placing orders").
- StickerApp: keine öffentliche API gefunden (`/api` → 404).
- Lob.com: nur Postkarten, Briefe, Schecks, Mailings — keine Aufkleber.
- Sticker it: Sitz und Druck in Bristol (UK) → jede Lieferung ein Drittlandsimport (Zoll, Einfuhrumsatzsteuer beim
  Empfänger); API für Online-Händler, Abrechnung an den Zugangsinhaber (`billing.account` = Store-Schlüssel, Stores
  nur lesbar, Standardwährung GBP). Vorprüfung: `plaene/druckerei-stickerit-eignung.md`.
- Amazon (Business Ordering API: nur ASIN + Menge, kein Upload, keine Daten je Stück) und Shopify (keine
  Käufer-API) — für einzeln verschiedene Codes ungeeignet.

## Kandidaten (deutsche Etikettendruckereien, Angaben laut eigener Seite)

| Druckerei | eigener QR-Link je Stück | Folie | mattes Laminat | Menge | Bezahlung |
|---|---|---|---|---|---|
| etiketten-drucken.de | ja, CSV/Excel, „ohne Aufpreis und ohne Mindestmenge" | PP weiß | „Folienkaschiert matt" | ab 1 | Rechnung |
| Typographus (QR-Inventar) | ja, CSV | Premium-PVC, HT-Kleber | „Schutzlaminat matt", „beständig gegen Reinigungsmittel" | ab 1 | nicht nachgesehen |
| aufkleber-produktion.de | ja | Folie | Laminat möglich | — | — |
| Ihr-Baron (Seriennummer-Aufkleber) | ja | 3M-Industriefolien | — | — | — |
| kaufsticker.de, htetikett.de | ja | Folie | htetikett: Laminat | — | htetikett: Rechnung/Vorkasse |

Shop-Upload bei etiketten-drucken.de: eine Datei, PDF/JPG/TIF (keine CSV); „Aufteilung in Sorten" höchstens 50.

## Der letzte Schritt

1. Anfrage an zwei bis drei Kandidaten (Betreiber schickt ab): nehmen sie eine **Bestellung per Mail** an, mit
   Druckdatei (PDF eine Seite je Aufkleber, oder CSV mit Ziel-URLs) im Anhang, **Rechnung an das bestellende Studio**,
   Antwortadresse Studio? Dazu: Beständigkeit gegen Flächendesinfektion, Probebestellung von ca. 10 Stück.
2. Mit der ersten Zusage: Druckvorlage anpassen — **Logo neben den QR-Code** (Druckerei erzeugt den Code aus der
   Liste im Standardverfahren, keine Fehlerkorrektur-H-/Logo-Sonderwünsche), **Eckenradius 2 mm**, **CMYK-Standard-
   farben**; Datenblatt entsprechend kürzen. Bauauftrag über den Executer, mit Plan- und Diffprüfung.
3. Probeaufkleber am Gerät mit dem Desinfektionsmittel des Studios testen, dann Druckerei-Adresse als Vorbelegung
   (`DRUCKEREI_EMAIL_STANDARD`) umstellen.

Was bleiben muss: ein eigener Zufallscode je Aufkleber (der Scan ist öffentlich, `routes/qr-scan.js` — fortlaufende
Nummern als Code-Inhalt würden Gerätekarten durchprobierbar machen), Kunststofffolie, permanenter Kleber, matte Oberfläche.

-- Ende --
