# Offene Befunde C6-A1 (Monatslauf und PDF-Nachweise)

Stand 01.10.2026. Die Herkunft steht in `diffpruefung-c6a1.md` („Funde des Bauenden außerhalb des Auftrags“) und im
Bericht zur Nacharbeit 1. Die Befunde werden hier nicht kopiert, sondern nur verwiesen.

| Kennung | Befund | Plan |
|---|---|---|
| A1-a1 | `core/monatskontrollen.js#ladeNachweisLuecken` lädt zu viel (gleiche Bauart wie V08-6). | eigenes Bündel C6-G |
| A1-a2 | Das Mail-Label „Pausenzeiten“ steht gegen „Arbeits- und Pausenzeiten“: dieselbe Aussage an zwei Orten. | Nacharbeit 2 |
| A1-a3 | `neu-single`: Die Datumsrechnung warf NACH `fn()`. | erledigt in Nacharbeit 1 (Fristen vor `fn()`) |
| A1-a4 | `/mail/:monat` meldet „gesendet“, auch ohne Empfängeradresse. `sendeArchivMail` liefert seit Nacharbeit 1 `false`. | Nacharbeit 2 |
| A1-a5 | „Alle N PDFs als ZIP“ zählt die Module dieses Laufs; die ZIP-Seite liefert alle Zeilen des Monats. | Nacharbeit 2 |
| A1-a6 | Die Korrektur-Registry lässt `datum` leeren (`core/korrekturen.js`: belehrung, pausenzeiten, mastercard; fundsache `gefunden_am`). Die PDF-Abfragen filtern mit `datum BETWEEN` (`core/pdf-engine.js:903`, `:1498`, `:1554` u. a.). Eine so korrigierte Zeile verschwindet ganz aus dem Monatsnachweis. Gemessen vom Bauenden für pausenzeiten. | eigenes Bündel C6-G |
| A1-a7 | `pausenzeiten.mitarbeiter` leer → die Namenszelle im PDF ist leer, ohne „nicht erfasst“. Diese Klasse ist in Nacharbeit 1 nur für die Zeiten behoben. | eigenes Bündel C6-G |
| A1-a8 | Studios ohne `archiv_mail_an` loggen an jedem Nachholtag „Keine Archiv-Mail-Adresse konfiguriert“. Das ist nur Log-Rauschen. | Nacharbeit 2 (im Nachholweg ohne Adresse gar nicht erst aufrufen) |
