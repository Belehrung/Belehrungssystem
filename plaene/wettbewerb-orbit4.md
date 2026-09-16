# Orbit4 — was sie anders machen, und was davon zu uns passt

Recherche 16.09.2026, auf Betreiberfrage. Quellen: ausschliesslich die
oeffentliche Website. Die Messgrenzen stehen unten und gehoeren zur Auskunft.

## Messgrenzen

- `orbit4.com` und `orbit4.io` sind ueber den Egress-Proxy NICHT erreichbar
  (connection reset / 502). Erreichbar war **`orbit4.org`** (HTTP 200).
- Gesehen: Landingpage (UK/DE/US), `/about-us`, Blog-Index, Atom-Feed,
  Sitemap, die Updates vom Juni und September 2026, das Fallbeispiel
  `anytime-fitness-case-study.pdf`.
- **Hinter dem Login war nichts.** Alles Folgende ist Eigenwerbung des
  Anbieters, keine gepruefte Funktion. Preise nennt die Seite nirgends.
- Die Sitemap hat KEINE Produktunterseiten — die Landingpage ist die ganze
  Produktdarstellung.

## Was Orbit4 ist

Britisch (7 School Lane, Hartford, Cheshire), Titel der Seite: „Gym Equipment
Asset Management and Service Ticketing". Zweiseitig: Studiobetreiber UND
Servicefirmen arbeiten im selben System. Kunden laut Seite u. a. Anytime
Fitness (Asien), Serco Leisure, Virgin Active Suedafrika, 1Rebel.

**Fuer uns relevant:** sie haben einen Country Manager DACH und einen
Sales Account Manager in Deutschland. Sie verkaufen also hier.

**Aber:** die deutsche Seite ist eine duenne Uebersetzung der Verkaufsseite
(9.568 Zeichen). GEMESSEN, Trefferzahl im gesamten deutschen Text —
DGUV 0, „Pruef" 0, „Konform" 0, „Norm" 0, „Haftung" 0, „Unfall" 0,
„Betriebssicher" 0, „Dokumentation" 0. Ihr „Compliance" heisst: die
Servicehistorie wird gespeichert und Checklisten halten fest, wer wann wo
etwas getan hat. Das ist Prozessnachweis, nicht deutsche Nachweispflicht.

## Was sie anders machen — nach Nutzen fuer uns sortiert

1. **Kostenbudget je Geraet („Cap-Spend").** Jedes Geraet traegt
   Installationsdatum, Alter, Vertrags- und Garantiestatus, ein maximales
   Servicebudget und die bisher aufgelaufenen Kosten, dazu eine Ampel
   (bis 75 % gruen, ueber 75 % „naehert sich", ueber 100 % „ueberschritten").
   Daraus wird die Entscheidung reparieren-oder-ersetzen abgeleitet.
2. **Ticketkette mit Belegen.** Offen → Techniker unterwegs → Ersatzteil
   noetig → geschlossen, daneben Angebot hochgeladen → freigegeben →
   Bestellung → Arbeitsschein → Rechnung → bezahlt.
3. **SLA-Messung gegen die Servicefirma.** Zeit bis Ankunft, Zeit bis
   Reparatur, Erstbehebungsquote, ueber/unter vereinbarter SLA.
4. **Ein Meldekanal fuer ALLES**, nicht nur Trainingsgeraete — woertlich
   „from a broken treadmill to a hole in the wall".
5. **RAG-Bewertung in Checklisten** (rot/gelb/gruen, seit Juni 2026).
6. **KI** (September 2026): Assistent fuer das Einpflegen von Geraeten und
   Vertraegen, KI-erzeugte Monatsberichte fuer die Leitung, Chatbot im
   Produkt, geplant ein Ticket-Assistent mit Loesungsvorschlaegen.
7. **Mitgliederfeedback** ueber einen zentralen QR-Code im Studio.
8. **Spielerei:** Punkte und Abzeichen („Novice" bis „Wizard") fuer
   gemeldete Tickets und erledigte Checklisten.
9. CSV-Import beim Einstieg, Mehr-Studio-Uebersicht, App mit QR-Scan.

## Wo wir nicht vergleichbar sind

Orbit4 ist ein Betriebskosten-Werkzeug, GymDocu ein Nachweis-Werkzeug.
Nichts auf ihrer Seite deutet auf eine gehashte Kette, einen
Rechtsstand-Waechter, Aufbewahrungsfristen oder eine dokumentierte
Weiterbenutzungs-Entscheidung mit Auflage hin. Umgekehrt haben wir
GEMESSEN keine einzige Kostenspalte im Schema und keinen Ort, an dem eine
Servicefirma bewertet wird.

## Empfehlung — was zu uebernehmen ist

**Der eine Punkt, der wirklich fehlt, ist die Entscheidungsgrundlage fuer
die Ausmusterung.** Wir haben seit dem 16.09. den Weg, ein Geraet mit
offenem Mangel auszumustern — aber nichts, was die Frage beantwortet, OB
man das tun sollte. Orbit4 beantwortet sie mit Geld und Alter.

Zu uebernehmen, in dieser Reihenfolge:

1. **Geraetealter und Reparaturhistorie sichtbar machen.** Ein
   Inbetriebnahme-Datum am Geraet und die Zahl der bisherigen Maengel,
   angezeigt genau dort, wo die Ausmusterung ausgeloest wird. Kein Geld,
   keine Buchhaltung — das ist der billige Teil ihrer Idee, und er traegt
   die Entscheidung schon allein.
2. **Zwischenstaende beim Mangel.** Unser `status` kennt nur `offen`,
   `repariert`, `ausgemustert`. „Techniker beauftragt" und „Ersatzteil
   fehlt" beantworten die Frage des Trainers, warum das Geraet seit drei
   Wochen steht — und sie sind selbst dokumentationsrelevant: ein Mangel,
   der erkennbar bearbeitet wird, ist etwas anderes als ein liegen
   gebliebener.
3. **Den Dienstleisterbesuch an den Mangel haengen.** Wir erfassen Ankunft,
   Abfahrt und Unterschrift bereits (`dienstleister`), nur ohne Bezug zum
   Geraet. Ein Bezug kostet fast nichts und ergibt beilaeufig, was Orbit4
   SLA nennt.
4. **Ein Meldekanal fuer Nicht-Geraete** (Licht, Tuer, Boden). Heute haengt
   jede Meldung an einem Geraet.

**Nicht uebernehmen:** Punkte und Abzeichen (in einem Nachweissystem
belohnt man damit das Melden, nicht das Pruefen), Mitgliederbefragung,
Geraetehandel, KI-Chatbot. Kostenbudgets im Vollausbau (Angebote,
Bestellungen, Rechnungen) machen aus GymDocu ein anderes Produkt — das ist
eine Betreiberentscheidung, keine Ausbaustufe.
