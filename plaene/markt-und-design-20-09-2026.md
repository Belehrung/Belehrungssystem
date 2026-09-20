# Markt, Bedienung und Startseite — vier KI-Läufe vom 20.09.2026

**Betreiber-Auftrag** („kannst du die anderen ki beauftragen gymdocu mit
potenteillen mitbewerbern zu verglichen … ideen zur vereinfachung für admin,
trainer … vorschläge zum design der homepage … gerne mit animation. auch da
bitte bei den andeen hompages nachsehen lassen").

## Wie gelaufen wurde

Vier Spuren, **verschiedene Aufträge UND verschiedene Bündel** — nach der
Messung vom selben Tag überlappt gleiches Material zu mehr als der Hälfte.

| Spur | Modell | Websuche | Bündel |
|---|---|---|---|
| `mitbewerber` | `gpt-5.6-sol` | ja | nur die Produktbeschreibung — es soll nach AUSSEN sehen |
| `homepage` | `gpt-5.6-sol` | ja | Produktbeschreibung + der echte, live abgeholte Quelltext von gymdocu.de |
| `einfach-k` | `kimi-k3` | nein | Handbuch + **Trainer**-Einstieg + Einrichtungs-Assistent |
| `einfach-d` | `deepseek-v4-pro` | nein | Handbuch + **Admin-Dashboard** (Trainer-Einstieg NICHT im Bündel) |

**Websuche nur bei OpenAI**, weil nur dort eine funktioniert: kimis ist laut
Hersteller „being updated and not recommended", deepseek hat keine. Eine
Marktaussage ohne Quelle ist bei uns keine.

**Positivkontrolle vorweg** (`probe.js`): `tools:[{"type":"web_search"}]` und
`text.format` mit `json_schema`/`strict` gehen zusammen — HTTP 200, ein
`web_search_call` im Ergebnis, richtige Antwort mit URL.

**Der Vorspann erzwingt die Beweislast:** jede Tatsachenbehauptung trägt
`belegt` (mit URL, in dieser Sitzung gelesen), `vermutet` oder `unklar`;
Seiten, an die eine Spur nicht herankam, gehören in ein eigenes Feld. Eine
benannte Lücke ist ein Ergebnis, eine kaschierte ist Schaden.

**Alles hier ist eine BEHAUPTUNG, bis ich sie selbst gemessen habe.** Was
gemessen ist, steht ausdrücklich so da.

---

## Spur `einfach-d` (`deepseek-v4-pro`) — Admin-Dashboard

127,6 s, 26.492 Eingabe- / 9.569 Ausgabe-Token (davon 6.966 Nachdenken),
Status `stop`. Sechs Ideen, alle für die Rolle Admin — folgerichtig, denn das
Trainer-Material war nicht im Bündel, und **es hat das von sich aus gemeldet**
(„Trainer-Tablet-Oberfläche … fehlen vollständig; daher können Handgriffe und
Fehlerfälle für Trainer nicht belegt werden"). Genau so soll eine Spur mit
einer Materiallücke umgehen.

### NACHGEMESSEN und getragen — und es ist mehr als eine Idee

**Die grüne Karte lügt, sobald ein Studio die Getränkeanlage benutzt.**

Gemessen, je einzeln am Quelltext:

* `routes/admin/dashboard.js:545-548` zeigt „Alles im grünen Bereich —
  **Keine kritischen Aufgaben offen — alle Kontrollen aktuell**", sobald
  `!kritisch.length && !dieseWoche.length`.
* Die Zeichenkette `getraenke`/`Getränke` kommt in `routes/admin/dashboard.js`
  **null Mal** vor. Das Dashboard fragt den Bereich also gar nicht ab.
* Es gibt aber einen Zähler dafür:
  `routes/getraenkeanlage.js:70 zaehleUeberfaelligeReinigungen(db, studioId)`.
* Sein EINZIGER Aufrufer im Produktivcode ist `server.js:1177` — und das ist
  die **Trainer-Startseite**, nicht das Admin-Dashboard. Dort setzt `:1181`
  sogar `hart = true`, im Kommentar: „eine überfällige Pflichtreinigung ist
  harter Verzug".

**Folge:** derselbe Zustand heisst auf dem Trainer-Tablet „harter Verzug" und
auf dem Dashboard des Betreibers „alle Kontrollen aktuell" — bei genau dem
Benutzer, der bei einer Prüfung geradestehen muss. Das ist unsere teuerste
Klasse (eine FALSCHE Zusicherung von Vollständigkeit), nur in der Oberfläche
statt in einem Test.

**Einschränkung, gemessen:** die Kachel ist eine Opt-in-Einstellung
(`server.js:1174`, `conf('kachel_getraenkeanlage','0') === '1'`). Studios ohne
sie sind nicht betroffen. Das macht den Befund kleiner, nicht falsch.

**NICHT gemessen:** ob es weitere Module mit derselben Lücke gibt. DeepSeek
hat nur die Getränkeanlage genannt; ob Spülplan, Verbandbuch oder andere
Bereiche ebenfalls an der grünen Karte vorbeilaufen, ist eine eigene Messung.
Der Verdacht ist da — `:518-524` prüft beim Spülplan nur, ob STELLEN fehlen,
nicht, ob eine Spülung FÄLLIG ist, und das hat DeepSeek ebenfalls angemerkt.

### Strukturell bestätigt, Wirkung nicht beurteilt

* **Ein einziges `try/catch` um den ganzen „Heute wichtig"-Block** — bestätigt
  (`:145 let heuteHtml`, `:550 heuteHtml = dash`, `:567` die Fehlerkarte).
  Ein Fehler in einer von acht Abfragen ersetzt alle acht. Das ist dieselbe
  Klasse wie der Ladebestand-Beitrag, der gerade gebaut wird — dort geht es
  um den stillen Fehler, hier um den zu breiten Auffangraum.
* **Vier Fehlerzweige enden auf „bitte der Leitung melden"** ohne Link, ohne
  Wiederholung, ohne Angabe, welcher Bereich klemmt (u. a. `:415`).

### Übernommen als Ideen, NICHT nachgemessen

* Einrichtungs-Fortschrittszeile verschwindet nach Abschluss ersatzlos; kein
  dauerhafter Weg zurück zu den gegebenen Antworten.
* Fachbegriffe ohne Erklärung auf dem Dashboard (DGUV V3, Maßnahmenwert,
  72-Stunden-Regel).
* Karten zeigen nur die ANZAHL, die Namen stecken in `<details>` — die
  häufigste Frage („welche Geräte?") kostet immer einen Klick extra.
