# Auftrag: Defektfotos löschen nur mit Identität — und mit Protokolleintrag

Fassung 1 — 18.09.2026, abends. Verfasser: Haupt-Agent.

**Betreiber-Entscheidung 18.09.2026, wörtlich: „ja an idendität binden".**
Die Frage lautete: Das Löschen von Defektfotos braucht heute keine
angemeldete Identität und schreibt keinen Protokolleintrag — soll es an eine
Identität gebunden werden? Antwort: ja.

Das ist eine PRODUKTENTSCHEIDUNG, keine technische Ableitung. Sie steht dem
Betreiber zu und ist damit getroffen. Dieses Papier legt fest, wie sie gebaut
wird, ohne den offenen Tablet-Modus als solchen anzutasten — der bleibt.

## Was heute passiert (gemessen, nicht vermutet)

`routes/sichtpruefung.js`, `makeFotoDeleteHandler(typ)` — registriert bei
`:5509` je Gerätetyp aus `TYP_CONFIG`, also EIN Codeweg für mehrere Typen:

```js
const defekt = await db.one(`SELECT status FROM geraete_defekte WHERE studio_id = $1 AND id=$2 AND typ=$3`, [req.studioId, defektId, typ]);
if (!defekt) return res.redirect(`/module/${cfg.path}`);
if (defekt.status !== 'offen') return res.redirect(back);

const foto = await db.one(`SELECT * FROM geraete_defekt_fotos WHERE studio_id = $1 AND id=$2 AND defekt_id=$3`, [req.studioId, fotoId, defektId]);
if (foto) {
    try { fs.unlinkSync(path.join(FOTO_DIR, foto.dateiname)); } catch (e) { /* Datei evtl. schon weg */ }
    await db.run(`DELETE FROM geraete_defekt_fotos WHERE studio_id = $1 AND id=$2`, [req.studioId, fotoId]);
}
return res.redirect(mitQuery(back, 'saved=1'));
```

Geprüft werden: Studio, Defektstatus, Zugehörigkeit des Fotos. **Nicht
geprüft:** wer da löscht. **Nicht geschrieben:** ein Protokolleintrag. Ein
Beweisfoto zu einem offenen Mangel verschwindet also spurlos.

## Welche Identität es überhaupt gibt — die Messung, die den Bau trägt

Ohne diese vier Messungen wäre der Riegel geraten:

1. **`core/akteur.js` unterscheidet bereits identifiziert von nicht
   identifiziert.** Bei `rolle === 'tablet'` liefert es
   `"<Name> (Tablet, <ip>)"`, wenn `req.session.mitarbeiter.name` da ist —
   sonst wörtlich `"Tablet, nicht identifiziert (<ip>)"`. Der Helfer ist also
   der richtige Anknüpfungspunkt; er benennt die Lücke bereits, nur wertet
   sie niemand aus.
2. **Die PIN-Anmeldung hängt NICHT an der Tablet-Sperre.**
   `routes/tablet-sperre.js` fragt `tablet_sperre_aktiv` **an keiner einzigen
   Stelle** ab (gemessen: `grep` findet null Treffer in der Datei). Ein
   Trainer kann sich also auch dann per PIN ausweisen, wenn die Sperre AUS
   ist — das ist die Voraussetzung dafür, dass dieser Riegel keine Sackgasse
   wird.
3. **Der Sperrbildschirm ist erreichbar.** `istEntsperrt(req)` ist nur wahr,
   wenn eine frische Mitarbeiter-Identität vorliegt; ohne Identität
   rendert `GET /tablet/sperre` also, statt wegzuleiten.
4. **ABER er braucht ein freigeschaltetes Gerät.** `findeGeraet(studioId,
   token)` liefert ohne Cookie `null`, und die Mitarbeiterliste wird nur
   `geraet ? … : []` gefüllt. Ein Studio, das nie ein Tablet freigeschaltet
   hat, kommt über diesen Weg NICHT zu einer Identität.

**Punkt 4 ist die Folge, die der Betreiber kennen muss**, und sie gehört in
den Bericht, nicht nur ins Papier: In einem Studio mit ausgeschalteter Sperre
UND ohne freigeschaltetes Gerät kann nach dieser Änderung vom Tablet aus kein
Foto mehr gelöscht werden. Der Weg bleibt offen — über eine Admin-Sitzung
(die ist immer identifiziert) oder über die Gerätefreischaltung. Verloren
geht nichts, aber ein Handgriff ändert sich.

## Zu bauen

### 1. Der Riegel

Vor jedem Löschen wird eine Identität verlangt. Zwei Fälle sind erlaubt:

- **Admin-Sitzung** (`req.session.benutzer.rolle === 'admin'`): erlaubt. Ein
  Admin ist über `benutzer.name` benannt; `akteur()` bildet das bereits ab.
- **Tablet-Sitzung mit `req.session.mitarbeiter.id`**: erlaubt.

Alles andere wird abgewiesen. **Nicht** über die Frage „ist die Sperre an?" —
die Bindung gilt unabhängig davon, sonst hinge sie an einer Einstellung, die
mit ihr nichts zu tun hat.

**Frischeprüfung mitnehmen, nicht nur Vorhandensein.** Die bestehende
Tablet-Sperre akzeptiert eine Identität nur innerhalb eines gleitenden
Fensters (`istEntsperrt()` prüft `Date.now() - m.last < TIMEOUT_MS`). Eine
Löschung, die eine beliebig alte Sitzungsangabe akzeptiert, wäre schwächer
als der vorhandene Riegel nebenan. Benutze dieselbe Prüfung — sie ist
exportiert oder lässt sich exportieren; sieh nach, statt sie nachzubauen.
**Zwei Fassungen derselben Aussage sind die häufigste Fehlerquelle in diesem
Projekt.**

### 2. Die Abweisung darf keine Sackgasse sein

Bei fehlender Identität: zurück auf die Defektseite (der `back`-Wert, den der
Handler aus `req.body.ret` über `sichererRet()` ohnehin schon bildet), mit
einer Meldung, die SAGT, was zu tun ist — sinngemäß „Zum Löschen bitte am
Tablet mit PIN anmelden", mit Verweis auf den Sperrbildschirm.

**Ausdrücklich NICHT** `req.session.returnTo` auf den POST-Pfad setzen und auf
`/tablet/sperre` umleiten. Begründung steht im Repo: ein gemerkter POST-Pfad
ist grundsätzlich ein falsches Ziel, weil jeder Redirect nach der PIN ein GET
ist und auf einer POST-only-Route eine 404 liefert. Die Rückkehr auf die
Defektseite umgeht die Falle vollständig.

**Vor dem Formulieren der Meldung prüfen, ob der genannte Weg das kann, was
der Satz verspricht** — an genau dieser Regel ist im Repo schon dreimal
hintereinander ein Hinweistext gescheitert. Wenn der Sperrbildschirm mangels
freigeschaltetem Gerät keine Mitarbeiterliste zeigt, darf die Meldung ihn
nicht als Lösung anpreisen; dann nennt sie zusätzlich den Admin-Weg.

### 3. Der Protokolleintrag — das ist der eigentliche Zweck

Jede erfolgreiche Löschung schreibt `auditAppend(...)` mit `akteur(req)` im
Feld `durch`, dazu Defekt-ID, Foto-ID und Dateiname. Ohne ihn ist die Bindung
an eine Identität wertlos: gebunden, aber nirgends festgehalten.

### 4. Die Reihenfolge des Löschens — wird bei der Gelegenheit richtiggestellt

Heute wird ZUERST die Datei entfernt und DANACH die Datenbankzeile, und der
Fehler beim Entfernen wird verschluckt:

```js
try { fs.unlinkSync(...) } catch (e) { /* Datei evtl. schon weg */ }
```

Das schluckt nicht nur „schon weg", sondern auch Rechte- und E/A-Fehler;
danach verschwindet die Zeile und die Oberfläche meldet Erfolg — während die
Datei noch liegt. Umgekehrt ist eine `unlinkSync` nie zurückzurollen.

**Richtig ist:** Datenbankzeile und Audit-Eintrag in EINER Transaktion, die
Datei erst NACH dem Commit entfernen. Bleibt dann eine Datei liegen, ist sie
verwaist statt unauffindbar — das ist die harmlosere Richtung.

**ACHTUNG Sperrreihenfolge, das ist im Repo schon einmal schiefgegangen:**
`auditAppend()` nimmt `pg_advisory_xact_lock(studioId)` — auch mit
übergebener Verbindung, also in der Transaktion des Aufrufers. Wer erst die
Zeile löscht (Zeilensperre) und danach den Audit-Lock nimmt, baut eine
Reihenfolge auf, die es unter Autocommit nicht gab. **Nimm den
Advisory-Lock ausdrücklich ZUERST** (`SELECT pg_advisory_xact_lock($1)` vor
dem DELETE); Advisory-Locks sind innerhalb derselben Transaktion
wiedereintrittsfähig, der spätere Griff in `auditAppend` stört also nicht.
Die Begründung gehört als Kommentar daneben, sonst räumt sie jemand als
„doppelt" wieder weg.

**Vorher zählen, welche anderen Wege dieselben Zeilen anfassen.** Die
Freigabe eines Defekts löscht ebenfalls Fotos. Sieh dir an, in welcher
Reihenfolge der Weg seine Sperren nimmt, und melde, was du findest — auch
wenn du ihn in diesem Beitrag nicht änderst.

## Was AUSDRÜCKLICH NICHT gebaut wird

- **Der offene Tablet-Modus bleibt.** `/login/tablet` ohne Nachweis wird
  nicht angetastet; das ist ein Produktmerkmal und eine eigene Entscheidung.
- **Keine Umstellung auf „deaktivieren statt löschen".** Das wäre die
  gründlichere Lösung (die Hausregel des Repos sagt das sogar), ändert aber
  Schema und alle Lesewege. Eigener Beitrag. **Als offenen Punkt eintragen.**
- **Keine Urheberschaftsprüfung** („nur wer das Foto hochgeladen hat, darf es
  löschen"). Das war nicht gefragt, und es hätte einen eigenen Datenbezug
  nötig. Ebenfalls als offener Punkt notieren, nicht bauen.
- **Die Seil-Defektfotos bleiben unberührt.** Gemessen: für sie existiert
  gar keine Löschroute (`routes/module.js` hat nur Upload und Auslieferung);
  sie werden allein bei der Freigabe entfernt. Es gibt hier also nichts zu
  binden.

## Zusicherungen

Neuer Abschnitt in einem bestehenden Sichtprüfungs-Wächter oder eigene Datei,
in `test/run.sh` registrieren.

1. **Ohne Identität:** Tablet-Sitzung ohne `mitarbeiter` → Foto bleibt
   (`SELECT count(*)` unverändert), **Datei liegt noch**, Antwort führt
   zurück auf die Defektseite, Meldung vorhanden.
2. **Mit Mitarbeiter-Identität:** Foto weg, Datei weg, **genau ein
   Audit-Eintrag** mit dem Namen der Person im Feld `durch`.
3. **Mit Admin-Sitzung:** dasselbe, `durch` nennt den Admin.
4. **Veraltete Identität:** `mitarbeiter.last` älter als das Zeitfenster →
   abgewiesen wie unter 1.
5. **Reihenfolge:** Schlägt der Audit-Eintrag fehl, bleiben Zeile UND Datei
   erhalten. Das ist die Zusicherung, die belegt, dass die Transaktion trägt
   — sie braucht einen gestellten Fehler, keinen echten.

**Die Zusicherungen 1 und 4 dürfen nicht dadurch grün werden, dass ohnehin
nichts da ist.** Lege das Foto vorher WIRKLICH an (über den echten
Schreibweg, nicht per Hand-INSERT) und prüfe vorab, dass es existiert —
sonst prüfst du, dass eine leere Tabelle leer ist.

**Der Audit-Eintrag wird über den ECHTEN Weg gelesen**, nicht über eine
Attrappe: sonst bildet der Test ab, was der Schreiber irgendwann tat, und
zieht nicht mit, wenn er eine Spalte dazubekommt.

## Gegenprobe

Je Zusicherung einzeln: Riegel entfernen → 1 und 4 müssen ROT werden;
`auditAppend`-Aufruf entfernen → 2 und 3 müssen ROT werden; die Transaktion
auflösen (Datei vor dem Commit löschen) → 5 muss ROT werden. Jeweils
zurücknehmen und GRÜN messen, beide Zahlen wörtlich melden.

Marker `GEGENPROBE-` + `DEFEKT`, Zielpfad als ARGUMENT, Abbruch bei ≠ 1
Fundstelle, `node --check`, Rücknahme gegen eine unabhängige `cp`-Kopie mit
`diff` EXIT 0 — nie `git checkout`, nie `git stash`.
