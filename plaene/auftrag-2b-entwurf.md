# Beitrag 2b — Entwurf des Executer-Auftrags

Stand: 15.09.2026, geschrieben WÄHREND 2a noch lief. Alle Stellen, die von
2a abhängen, sind mit `@@2a@@` markiert und vor dem Absenden nachzumessen —
nicht abzuschreiben.

Grundlage: `plaene/ausmusterung-plan-v4.md`, Abschnitte 2.2, 2.3, 2.4, 2.6,
2.7, 2.8. Der Plan ist zweimal gegengelesen (18/18 Befunde getragen); was
hier steht, ist seine Umsetzung, keine Neuentscheidung.

## Einordnung nach der Delegationsregel

Zu klären VOR dem Absenden: 2b ist nicht nur umfangreich, sondern hat zwei
Merkmale aus der Liste „sehr komplex" — ein Ergebnis, das falsch grün
aussehen kann (Schnappschuss-Vergleich, Auswahlprüfung), und Zahlen, die
hergeleitet statt gesetzt werden (Fingerabdruck über Inhalt). Die
Einordnung wird im Auftrag in EINEM Satz begründet.

## Was 2b baut

1. **Bestätigungsseite mit drei Blöcken** (Plan 2.2). Block 1 sicher
   zugeordnet (vorausgewählt), Block 2 über den Namen (vorausgewählt, mit
   Standort und Seriennummer), Block 3 nicht zugeordneter Altbestand
   (`geraet_id IS NULL` UND abweichender Name, NICHT vorausgewählt).
   Für die Seilkontrolle entfallen Block 2 und 3 — `geraete_sperren.geraet_id`
   ist NOT NULL (`core/db.js:1379`).
2. **Serverseitiger Schnappschuss mit Inhalts-Fingerabdruck** (Plan 2.3).
   Hash über `(id, status/aktiv, Grund-/Beschreibungstext, Zeitstempel)`
   aller offenen Zeilen des Bereichs. Die Seite trägt nur ein opakes Token;
   Grund gemessen: `server.js:161-162` begrenzt Body auf 1 MB.
3. **Beide Ausmusterungsrouten** (Cardio/Kraft und Seilkontrolle) mit der
   Transaktion aus Plan 2.3 Schritte 1–6. OHNE eigenen Advisory-Lock
   (gestrichen, s. Plan-Kopf); der Schnappschuss-Vergleich IN der
   Transaktion leistet dasselbe.
4. **Auswahl ⊆ zulässige Kandidaten**, serverseitig und erneut in der
   Transaktion. `WHERE id = ANY($4) AND status='offen'` allein genügt
   NICHT — es erzwingt weder Bereich noch Gerätezugehörigkeit.
5. **Reaktivierung gesperrt an der ROUTE**: `AND ausgemustert_am IS NULL`
   in `POST /geraete/:typ/aktivieren/:id`, nicht nur am Knopf.
6. **Weg zurück für JEDES inaktive Gerät mit offenen Mängeln** (Plan 2.4),
   ausgemustert oder nicht — Abschnitt „Inaktive Geräte mit offenen
   Mängeln" auf beiden Geräteseiten. Für die Seilkontrolle ist das die
   erste Stelle, an der ein inaktives Gerät überhaupt wieder auftaucht
   (`routes/admin/geraete.js:107-109` lädt nur aktive).
7. **Kopfkommentar `routes/admin/geraete-typen.js:54-62`** nachziehen.
8. **Zwei Deploy-Gates umstellen** (Plan 2.6): `test_feature_admin_lifecycle.js:96-102`
   und `test_feature_geraete_loeschen.js:165-175` → erster POST ändert
   NICHTS und führt zur Bestätigung; erst die bestätigte Ausmusterung
   schliesst die Sperre ohne Freigabe. Dazu `:187-190` — der neue Abschnitt
   darf nicht als „gelöschtes Gerät in der Liste" durchgehen.
   `test_feature_korrektur_dokumente_static.js:51-53` ist @@2a@@.

## Fortschrittsgarantie (Plan 2.3)

Wird NICHT behauptet, sondern begrenzt: nach dem zweiten Fehlschlag nennt
die Seite den Grund („in der Zwischenzeit hat sich N geändert") und zeigt,
WAS sich geändert hat, statt nur neu zu laden.

## N=0-Fall

Kein Vorab-Zählen mit anschliessendem Schreiben. Die Zählung läuft in
derselben Transaktion; N>0 → Rollback und Umleitung auf die
Bestätigungsseite.

## Gegenproben (aus Plan 2.8, die 2b betreffen)

- **Schnappschuss, ZWEI Proben:** (i) zusätzliche offene Zeile einschieben
  → nichts wird geschrieben; (ii) DENSELBEN Datensatz per UPDATE ändern
  (`gesperrt_grund` ergänzen) → ebenfalls nichts. Probe (ii) ist die, die
  eine reine ID-Liste bestehen würde — sie ist der eigentliche Beleg.
- **Teilauswahl:** zwei gleichnamige Geräte mit je einem Mangel, nur einer
  angekreuzt → genau dieser geschlossen.
- **Fremdzuordnung:** Mangel mit `geraet_id = anderes Gerät` erscheint in
  keinem Block UND wird, direkt mitgesendet, von der Route ABGEWIESEN.
- **Reaktivierungssperre:** gegen die ROUTE, Vorzustand **inaktiv UND
  ausgemustert**. Bei einem aktiven Gerät erzwingt schon `COALESCE(aktiv,1)=0`
  null Treffer — grün, ohne den neuen Schutz je zu berühren.
- **Weg zurück, BEIDE Ausgänge:** (i) ausgemustertes Gerät, neuer Mangel →
  abschliessbar, `ausgemustert_am` behält den ERSTEN Zeitstempel;
  (ii) gewöhnlich deaktiviertes Gerät, neuer Mangel → ebenfalls
  abschliessbar und in der Liste sichtbar.
- **Mandantentrennung:** zweites Studio, gleichnamiges Gerät, offener
  Mangel bleibt unberührt.
- **N=0:** erster POST auf ein Gerät ohne offene Mängel mustert direkt aus,
  ohne Bestätigungsseite — und der Gegenfall mit N>0 schreibt NICHTS.

## Fallen, die im Auftrag ausdrücklich zu nennen sind

- **`db.q`/`db.run` benutzen den POOL** (`core/db.js:421-432`). Alles, was
  in der Transaktion liegen soll, geht über `t`.
- **Keine neue globale Lock-Klasse**, solange der gefundene
  Verklemmungs-Kreis (`routes/module.js:2710/2725/2777` gegen `:3140`/`:997`)
  ungelöst ist.
- **`auditAppend` nimmt den Studio-Lock** (`core/integritaet.js:65`), auch
  mit übergebenem `t`. Wer vorher Zeilensperren hält, erzeugt eine neue
  Lock-Reihenfolge. Falls unvermeidbar: `SELECT pg_advisory_xact_lock($1)`
  ZUERST, mit Begründung als Kommentar daneben.
- **Tests fassen weder echtes Dateisystem noch echte Prozesse an** — dieselbe
  Suite ist auf dem Live-Server Deploy-Gate.
- **Fixtures mit UNTERSCHIEDLICHEN Zahlen** je Bedeutung; keine, bei denen
  Anzahl, ID-Menge und Auswahl zufällig zusammenfallen.
- **Mutationsskripte** nehmen den Zielpfad als ARGUMENT, brechen bei 0 oder
  >1 Fundstellen ab, schreiben den `GEGENPROBE-DEFEKT`-Marker und werden
  gegen eine unabhängig angelegte Kopie zurückgenommen.

## Was 2b NICHT baut (Plan 2.7)

Keine Reaktivierung. Keine Umbenennung von Knöpfen, keine Verschmelzung der
Geräteseiten. Keine Änderung an `geraete_bekannt`. Keine Ausmusterung für
Wartungsgeräte. Keine gemeinsame Lock-Ordnung.
