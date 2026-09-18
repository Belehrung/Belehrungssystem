# IT-Unterlagen — Quellen

Fünf Dokumente für das Gespräch mit einer fremden IT-Abteilung. Die PDFs
entstehen aus diesen HTML-Dateien, sie sind KEINE eigene Quelle und gehören
deshalb nicht hierher.

    01-Ueberblick.html
    02-Sicherheit-und-Datenschutz.html
    03-Technischer-Bericht.html
    04-Fragen-an-Ihre-IT.html
    05-Dokumentenuebersicht.html

Bauen (Chromium, keine Netzverbindung nötig):

    node dokumente/it-unterlagen/bauen.js

`bauen.js` schreibt neben jede HTML-Datei die gleichnamige PDF und nennt am
Ende je Datei die Grösse. Es lädt seinen Browser über
`/home/user/gymdocu/test/helfer/chromium-start.js` — **ein fest verdrahteter
Pfad ins GymDocu-Repo.** Liegt das dort nicht, scheitert der Lauf; das ist
bekannt und bewusst nicht verallgemeinert, weil die Unterlagen ohnehin nur aus
diesem Arbeitsumfeld heraus gebaut werden.

## Warum sie hier liegen und nicht im Scratchpad

Sie lagen bis zum 18.09.2026 ausschliesslich im Scratchpad. Der überlebt einen
Container-Neustart NICHT, und der Betreiber hat um eine Überarbeitung gebeten —
eine Aufgabe, deren Material beim nächsten Neustart verschwindet, ist keine.

## Stand und was daran zu überarbeiten ist

Die Fassung vom 17.09.2026 beschreibt den Stand VOR dem Härtungsprogramm.
Überholt ist mindestens:

- Das Verbandbuch-Einzel-PDF mit den Art.-9-Gesundheitsdaten liegt seit #455
  nicht mehr dauerhaft auf der Platte, sondern wird flüchtig erzeugt und sofort
  gelöscht; ein täglicher Ernter räumt Altbestand ab.
- Vier schreibende GET-Routen sind auf POST umgestellt, und ein Wächter hält
  die CSRF-Ausnahmen gegen eine von Hand geschriebene Erwartung.

**Was sonst noch überholt ist, wird vor der Überarbeitung nachgemessen, nicht
aus dieser Liste abgeschrieben.** Sie ist ein Anhaltspunkt, kein Befund.
