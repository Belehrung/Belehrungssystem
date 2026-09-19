# Personenbezogene Daten verschlüsseln — Machbarkeit

**Stand 17.09.2026.** Frage des Betreibers: ist es möglich, die Daten zu
verschlüsseln, die personenbezogene Daten enthalten? Alle Aussagen unten sind
am heutigen Quelltext gemessen, nicht aus `docs/OFFENE-SICHERHEITSPUNKTE.md`
(23.07.2026) abgeschrieben.

## Kurzantwort

**Ja — und der Aufwand ist kleiner als erwartet, weil diese Daten fast nie
durchsucht werden.** Das ist der Punkt, an dem Feldverschlüsselung sonst
scheitert, und hier fällt er günstig aus.

Der Reihenfolge nach, sortiert nach Wirkung je Aufwand:

## A. Die Datenbank-Sicherung verschlüsseln — grösste Lücke, kleinster Aufwand

Gemessen: in `ops/*.sh` und `ops/*.js` gibt es **keinen** Verschlüsselungsschritt
für die Postgres-Sicherung (kein `gpg`, kein `age`, kein `openssl enc`). Die
Gesundheitsdaten des Verbandbuchs liegen damit im Klartext in jeder Sicherung.

Das ist eine reine Betriebsänderung: die Sicherung wird nach dem `pg_dump`
verschlüsselt. **Keine Änderung an der Anwendung, keine Folgen für Suche oder
Sortierung.** Es schliesst genau den Fall, der am wahrscheinlichsten ist —
jemand kommt an eine Sicherungsdatei, nicht an den laufenden Server.

Wenn nur EINE Sache gemacht wird, dann diese.

## B. Feldverschlüsselung der Gesundheitsdaten — machbar, eine Entscheidung nötig

`verbandbuch_eintraege` (`core/db.js:1604`) speichert Art.-9-Daten im Klartext.
Die entscheidende Frage ist nicht „kann man verschlüsseln", sondern **„was geht
dabei kaputt"** — verschlüsselte Spalten lassen sich nicht mehr durchsuchen,
sortieren oder vergleichen.

**Gemessen über `routes/` und `core/`:** von den acht sensibelsten Spalten wird
**keine einzige** je gefiltert oder sortiert.

    hergang                  0 Vorkommen in WHERE/ORDER BY/LIKE
    beschreibung             0
    zeugen                   0
    eh_freitext              0
    verletzungsarten_json    0
    koerperschema_json       0
    eh_massnahmen_json       0
    geschlecht               0

Sie werden geschrieben und als Ganzes wieder gelesen. Genau das ist der Fall,
in dem Feldverschlüsselung ohne Nebenwirkungen funktioniert.

**Drei Dinge, die dabei nicht im Weg stehen:**

1. **Die Aufbewahrung** hängt an `erstellt_am` (`core/retention.js:295-298`,
   `jahre: 5`), nicht an einem Gesundheitsfeld. Die Löschautomatik bleibt
   unberührt.
2. **Die Integritätskette** trägt bewusst KEINE Gesundheitsdaten. Die Nutzlast
   lautet wörtlich (`routes/verbandbuch.js:621`):
   `{ person_typ, ort, unfall_zeit, ersthelfer, signatur_hash, nachgetragen,
   sync_zeit, durch }` — kein Name, keine Verletzung, kein Freitext. Direkt
   darunter steht als Kommentar, dass auch die Admin-Meldung „NIEMALS
   Gesundheits-/Personendaten" enthält. Das war schon einmal durchdacht.
3. **Das Verfahren existiert im Haus.** `core/secret-crypto.js` macht
   AES-256-GCM mit Primär- und Zweitschlüssel, dazu `ops/schluessel-rotieren.js`
   und eine dokumentierte Rotationsreihenfolge. Es wäre eine Wiederverwendung,
   keine Erfindung.

**Die eine Entscheidung, die der Betreiber treffen muss:** `person_name` wird
an genau einer Stelle durchsucht — `routes/verbandbuch-admin.js:242`,
`person_name ILIKE …` für die Namenssuche in der Admin-Liste. Verschlüsselt
man die Spalte, ist diese Suche weg. Drei Wege:

| Weg | Folge |
|---|---|
| Namenssuche streichen | Am einfachsten. Die Liste bleibt über Datum und Ort sortier- und filterbar |
| Blindindex (HMAC des normalisierten Namens) | Suche bleibt, aber nur als EXAKTE Übereinstimmung, keine Teiltreffer. Der Index verrät, dass zwei Einträge dieselbe Person betreffen — mehr nicht |
| `person_name` im Klartext lassen, nur den Rest verschlüsseln | Suche bleibt vollständig. Schützt die Verletzungsdaten, nicht die Zuordnung zur Person |

## C. Die PDFs — sonst ist B halb umsonst

**Der Haken.** Derselbe Eintrag landet vollständig in einem PDF, und das wird
im Klartext auf die Platte geschrieben (`core/pdf-engine.js:117`,
`fs.createWriteStream`; die Daten dafür kommen aus `SELECT * FROM
verbandbuch_eintraege`, `:2364`).

Verschlüsselt man die Spalten und lässt die PDFs, sind dieselben
Gesundheitsdaten weiterhin im Klartext lesbar — in derselben Sicherung. Das
wäre Aufwand ohne Wirkung.

`core/file-crypto.js` (AES-256-GCM, streamend) ist vorhanden, wird heute aber
an **genau einer** Stelle benutzt: `core/storage-replica.js:187`, also für die
ausgelagerte Zweitkopie, mit eigenem Schlüssel `GYMDOCU_REPLICA_KEY`. Die
primäre Ablage auf dem Server ist unverschlüsselt. Der Baustein für C liegt
also bereit und müsste nur auf den primären Schreibweg gezogen werden.

Dazu gehört der Offboarding-Export (`core/export-studio.js`): das ZIP mit dem
vollständigen Datenbestand eines ausscheidenden Studios ist heute
unverschlüsselt.

## Was Verschlüsselung NICHT leistet — damit es niemand missversteht

Der Schlüssel liegt in der `.env` auf **demselben Server** wie die Daten. Wer
den Server übernimmt, hat beides. Feldverschlüsselung schützt deshalb gegen:

- eine abhandengekommene **Sicherungsdatei**,
- einen weitergegebenen **Datenbank-Auszug**,
- Zugriff auf die **Platte durch den Hoster**,
- ein Offboarding-**ZIP**, das den falschen Weg nimmt.

Sie schützt **nicht** gegen eine übernommene laufende Anwendung. Genau deshalb
steht A vor B: der wahrscheinlichste Weg zu diesen Daten ist eine Kopie, die
den Server verlässt, nicht ein Einbruch in den laufenden Betrieb.

## Zwei Fragen, die von hier aus nicht messbar sind

1. **Ist `APP_ENC_KEY` bzw. `TOTP_ENC_KEY` in Produktion überhaupt gesetzt?**
   `core/secret-crypto.js` verschlüsselt ohne gesetzten Schlüssel NICHT — es
   bleibt beim Klartext, und `server.js` warnt nur im Log. Ist er nicht
   gesetzt, liegen auch die TOTP-Geheimnisse im Klartext in der Sicherung.
   Das wäre die billigste Verbesserung überhaupt: einen Schlüssel setzen.
2. **Ist das IONOS-Volume verschlüsselt?** Das ändert die Einschätzung von A
   erheblich. Beim Hoster erfragen.

   **Teilantwort vom 17.09.2026 (Betreiber, IONOS-Hilfeartikel zu Managed
   Nextcloud).** Der Artikel betrifft ein ANDERES Produkt als den Server, auf
   dem GymDocu läuft — er sagt also nichts darüber, ob dessen Volume
   verschlüsselt ist. Er sagt aber etwas über die HALTUNG des Hosters, und die
   trägt weiter:

   - IONOS begründet dort, serverseitige Verschlüsselung sei *nicht
     erforderlich*, weil der Speicherbereich exklusiv und nicht mit anderen
     Nutzern geteilt sei. Das ist ein Argument über ZUGRIFFSTRENNUNG, nicht
     über Verschlüsselung. Gegen eine abhandengekommene Sicherung, einen
     weitergegebenen Auszug oder den Zugriff auf die Platte hilft
     „exklusiver Bereich" nicht — genau die drei Wege, gegen die Stufe A und C
     hier antreten.
   - IONOS empfiehlt für erhöhten Bedarf ausdrücklich, **lokal zu
     verschlüsseln und nur die verschlüsselten Objekte abzulegen**. Das ist
     wörtlich die Reihenfolge dieses Papiers: verschlüsseln, BEVOR die Daten
     den Speicher erreichen.
   - Zusatz für den Betrieb: die serverseitige Verschlüsselung von Nextcloud
     ist dort ausdrücklich als Falle beschrieben — sie erzeugt Fehler und
     lässt sich nur noch durch den Kundenservice rückgängig machen. Falls
     irgendwo eine Managed Nextcloud im Spiel ist: **nicht einschalten.**

   Was weiterhin OFFEN bleibt: ob die Platte unter GymDocu verschlüsselt ist.
   Nach dieser Haltung ist die vorsichtige Annahme **nein**, solange es
   niemand schriftlich bestätigt — und die Empfehlungsreihenfolge unten ändert
   sich dadurch nicht, sie wird nur dringlicher.

   **Nachgesehen am 17.09.2026, und es beantwortet die Frage NICHT.** Im
   Einsatz sind (Betreiber-Auskunft, Screenshot der IONOS-Verwaltung) zwei
   Verträge der klassischen Hosting-Linie: ein **VPS Linux L+** (dort hängen
   die gymdocu-Domains) und ein **Cloud Server** aus der Kategorie „Cloud &
   Dedicated Server & Backup". Eine Managed Nextcloud gibt es nicht.

   IONOS dokumentiert Verschlüsselung ruhender Daten (AES-XTS 256, je Volume
   ein eigener Schlüssel, automatisch für alle nach Einführung angelegten
   Volumes) — aber ausdrücklich für **IONOS CLOUD Block Storage**
   (docs.ionos.com/cloud/…/block-storage/overview/data-security). Das ist eine
   ANDERE Produktlinie als die beiden obigen Verträge; VPS und Cloud Server der
   klassischen Linie werden auf dieser Seite nicht erwähnt. Wer daraus „unsere
   Platte ist verschlüsselt" macht, überträgt eine Zusage von einem Produkt auf
   ein anderes — genau die Art Schluss, die dieses Papier sonst als ungemessen
   kennzeichnet.

   Die Frage an IONOS lautet deshalb, je Vertrag getrennt und schriftlich:
   *Sind die Datenträger dieses Produkts im Ruhezustand verschlüsselt, und
   wenn ja, mit welchem Verfahren und wer hält den Schlüssel?*

   Praktisch bleibt es ohnehin bei der Reihenfolge unten: eine
   Vollverschlüsselung der Platte, die der Betreiber SELBST einrichtet, ist
   auf einem VPS kaum brauchbar — nach jedem Neustart müsste jemand die
   Passphrase eingeben, sonst liegt sie auf derselben Maschine. Genau deshalb
   stehen A (Sicherung) und C (PDFs) vor allem anderen: sie verschlüsseln,
   BEVOR die Daten den Speicher erreichen, und hängen nicht an einer Zusage
   des Hosters.

   **BEANTWORTET am 17.09.2026 (Betreiber): das IONOS-Backup-Paket ist GEBUCHT
   UND AKTIV.** Damit ändert sich die Einschätzung von Stufe A erheblich, und
   zwar zum Besseren: Nach der Dokumentation des Anbieters werden die
   Sicherungen dort standardmäßig **serverseitig mit AES-256** verschlüsselt
   und in deutschen, nach ISO 27001 zertifizierten Rechenzentren gespeichert;
   zusätzlich lässt sich eine **clientseitige** AES-256-Verschlüsselung mit
   eigenem Passwort aktivieren.

   Was daraus folgt — und was NICHT:

   - Die Kopie, die den Server verlässt, ist also **nicht** ungeschützt. Der
     schlimmste Fall aus Stufe A (eine abhandengekommene Sicherung liegt im
     Klartext) ist damit weitgehend abgedeckt.
   - **Es bleibt trotzdem etwas übrig, und zwar zweierlei:** die eigenen
     Datenbank-Auszüge und das fortlaufende Archiv liegen daneben
     UNVERSCHLÜSSELT auf der Platte (gemessen: kein Verschlüsselungsschritt in
     `ops/`), ebenso die PDF-Dateien. Solange die Plattenverschlüsselung
     ungeklärt ist, ist das die verbliebene Lücke — nicht die Sicherung.
   - **Nicht gemessen, sondern Anbieterangabe.** Ob die clientseitige
     Verschlüsselung eingeschaltet ist, und was genau im Sicherungsumfang
     liegt, steht in der Verwaltung des Vertrags, nicht im Code. Das gehört
     nachgesehen, bevor es jemand als Zusage weitergibt.

   Die Empfehlungsreihenfolge unten ändert sich dadurch: Stufe A verliert ihre
   Dringlichkeit für die AUSGELAGERTE Sicherung und behält sie für die
   LOKALEN Kopien.

## Empfehlung

In dieser Reihenfolge, jede Stufe für sich nützlich:

1. **A** (Sicherung verschlüsseln) — Betrieb, keine Anwendungsänderung.
2. **Prüfen, ob der vorhandene Schlüssel gesetzt ist** — eine Zeile `.env`.
3. **C** (PDFs am primären Schreibweg, plus Offboarding-ZIP) — der Baustein
   ist da und wird bereits produktiv benutzt.
4. **B** (Feldverschlüsselung) — zuletzt, weil sie die einzige Stufe mit einer
   fachlichen Entscheidung ist (Namenssuche).

B allein wäre die schlechteste Reihenfolge: der grösste Aufwand, und die Daten
lägen weiter im PDF und in der unverschlüsselten Sicherung.
