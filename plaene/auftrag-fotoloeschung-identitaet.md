# Auftrag: Defektfotos löschen nur mit Identität — und mit Protokolleintrag

Fassung 2 — 18.09.2026, nach der Planprüfung. Verfasser: Haupt-Agent.

**Der Gegenleser hat diesen Plan gesehen.** Urteil: „Fassung 1 noch nicht als
Bauauftrag freigeben." Sechs Befunde, alle selbst nachgemessen, **alle sechs
getragen**, einer blockierend. **Einer davon widerlegt eine Warnung, die ich
dem Betreiber bereits gegeben hatte** — sie steht unten berichtigt.

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
4. **Ohne freigeschaltetes Gerät zeigt der Bildschirm keine LISTE — aber sehr
   wohl eine Anmeldung.** `findeGeraet()` liefert ohne Cookie `null`, und die
   Mitarbeiterliste bleibt leer.

**BERICHTIGT — Punkt 4 der Fassung 1 war FALSCH, und die Warnung an den
Betreiber auch** (Planprüfung, selbst nachgemessen). Fassung 1 schloss aus der
leeren Liste: „Ein Studio, das nie ein Tablet freigeschaltet hat, kommt über
diesen Weg NICHT zu einer Identität." Das verwechselt *keine Namensliste* mit
*keine Anmeldung*. Gemessen steht dort stattdessen eine
**Selbstfreischaltung**: `routes/tablet-sperre.js:262-285` rendert bei
`!geraetFreigeschaltet` ein NAMENSFELD („Wie heißt du?") samt PIN-Feld; der
Server prüft die PIN gegen `ma.pin_hash` (`:650`), schaltet bei Erfolg das
Gerät frei und führt zurück (`:697-699`):

```js
const geraeteToken2 = await freischalteGeraet(req.studioId);
setzeGeraeteCookie(req, res, geraeteToken2);
return res.redirect('/tablet/sperre?freigeschaltet=1');
```

Der zweite Durchlauf identifiziert dann regulär. **Ein fehlendes Gerät ist
also kein Hindernis, sondern ein zusätzlicher erster Schritt.**

**Die Einschränkung, die WIRKLICH bleibt, ist enger:** Sie greift nur, wenn
für das Studio **überhaupt kein Mitarbeiter mit PIN** hinterlegt ist — diesen
Fall benennt der Bildschirm sogar selbst („Für dieses Studio ist noch kein
Mitarbeiter mit PIN hinterlegt"). Dann bleibt der Admin-Weg. Das ist eine
deutlich kleinere Gruppe als „Studios ohne freigeschaltetes Gerät", und die
Meldung an den Betreiber ist entsprechend zu berichtigen.

## Zu bauen

### 1. Der Riegel

Vor jedem Löschen wird eine Identität verlangt. Zwei Fälle sind erlaubt:

- **Admin-Sitzung:** erlaubt — aber die Bedingung lautet
  `benutzer.rolle === 'admin' && benutzer.totpOk === true`, nicht bloss der
  Rollenvergleich. **Berichtigt (Planprüfung):** `core/auth.js:60` verlangt
  beides; ein reiner Rollenvergleich wäre SCHWÄCHER als der vorhandene
  Admin-Schutz. Ein Riegel, der lockerer ist als der Riegel daneben, ist
  keiner. Ein Admin ist über `benutzer.name` benannt; `akteur()` bildet das
  bereits ab.
  *Kein dritter Sitzungszustand rutscht durch:* die Rolle ist im Schema auf
  `('admin','tablet')` begrenzt (`core/db.js:1179`), und die angefangene
  Anmeldung liegt in `session.pending2fa`, nicht in `session.benutzer`.
- **Tablet-Sitzung mit `req.session.mitarbeiter.id`**: erlaubt.

Alles andere wird abgewiesen. **Nicht** über die Frage „ist die Sperre an?" —
die Bindung gilt unabhängig davon, sonst hinge sie an einer Einstellung, die
mit ihr nichts zu tun hat.

**Frischeprüfung mitnehmen, nicht nur Vorhandensein.** `istEntsperrt()` prüft
Mitarbeiter-ID, Studio und `Date.now() - m.last < TIMEOUT_MS`. Sie ist
**bereits exportiert** (`module.exports.istEntsperrt`, `:758-759`) und wird
von `routes/pdf-waechter.js:78` und `routes/upload-limit-waechter.js:62`
schon benutzt — kein Exportumbau nötig, und auf keinen Fall nachbauen.

**ABER: das gleitende Fenster gleitet nur bei EINGESCHALTETER Sperre.**
Berichtigt nach der Planprüfung, selbst nachgemessen: `istEntsperrt()` PRÜFT
nur; fortgeschrieben wird `m.last` allein in der globalen Middleware
(`server.js:775`), und die kehrt bei ausgeschalteter Sperre schon vorher um
(`:754`, `if (sperreAktiv !== '1') return next();`).

**Folge, die gebaut werden muss:** Bei ausgeschalteter Sperre würde ein
durchgehend arbeitender Mitarbeiter fünf Minuten nach seiner PIN-Anmeldung
abgewiesen, obwohl er keine Minute untätig war. Das wäre genau die Sorte
Behebung, die das Gemeldete gegen etwas Schlimmeres tauscht.
Der Löschweg schreibt deshalb `m.last` bei erfolgreicher Prüfung SELBST fort
— dieselbe Zeile, die `server.js:775` macht. Das ist bewusst KEINE zweite
Fassung der Prüfung, sondern das Nachziehen eines Zustands, den sonst
niemand nachzieht.

### 2. Die Abweisung darf keine Sackgasse sein

Bei fehlender Identität: zurück auf die Defektseite, mit einer Meldung, die
SAGT, was zu tun ist — sinngemäß „Zum Löschen bitte am Tablet mit PIN
anmelden", mit Verweis auf den Sperrbildschirm.

**BERICHTIGT (Planprüfung, zwei Befunde):**

1. **`sichererRet()` liefert NICHT verlässlich die Defektseite.**
   `routes/sichtpruefung.js:1509-1510` lässt jeden Pfad durch, der auf
   `/^\/module\/[A-Za-z0-9/_?=,&-]*$/` passt — darunter auch
   `/module/cardio-check/defekt/12/foto/34/loeschen`, das NUR als POST
   registriert ist. Der Redirect erzeugt dann wieder genau den GET auf eine
   POST-only-Route, den Fassung 1 zu umgehen behauptete. Fehlt `ret`, landet
   man auf der Modulübersicht statt beim Defekt.
   **Zu bauen:** das Rückkehrziel SERVERSEITIG aus Typ und Defekt-ID bauen,
   nicht aus `req.body.ret` übernehmen.
2. **Die Rückfallseite rendert den Foto-Fehlercode gar nicht.**
   `:1639-1640` und `:1741-1742` übergeben an `renderOffeneDefekteBanner(...)`
   ausdrücklich `undefined`; nur die Foto-Seite liest `req.query.foto_fehler`
   (`:3509`). Ein angehängter Queryparameter wäre also unsichtbar.
   **Zu bauen:** die Meldung auf der tatsächlich verwendeten Rückkehrseite
   rendern — sonst wird abgewiesen, ohne dass jemand erfährt, warum.

**Und der Weg hängt an der Einstellung, das gehört ausdrücklich entworfen:**
Bei EINGESCHALTETER Sperre fängt die globale Middleware den anonymen POST
schon vor dem Handler ab (`server.js:778`, `:806-809`) und leitet auf den
Sperrbildschirm; bei JSON antwortet sie 401. Der hier beschriebene Rückweg
gilt also für den Fall AUSGESCHALTETE Sperre. Beide Fälle werden getrennt
zugesichert.

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

**BLOCKIEREND BERICHTIGT (Planprüfung, selbst nachgemessen): „erfolgreich"
muss GEMESSEN sein, nicht angenommen.** Der heutige Weg führt das DELETE aus,
ohne sein Ergebnis anzusehen. Zwei gleichzeitige Anfragen können dieselbe
Zeile gelesen haben; nach der ersten Löschung trifft das zweite DELETE null
Zeilen — und ein trotzdem geschriebenes Audit **beurkundet eine Löschung, die
dieser Aufruf nicht durchgeführt hat**, dauerhaft und gehasht. Dasselbe gilt
gegenüber Reparatur und Foto-Reaper, die für ihr Foto-DELETE denselben Lock
NICHT nehmen.

**Verbindlich zu bauen:**
- `DELETE … WHERE studio_id = $1 AND id = $2 AND defekt_id = $3 RETURNING *`
- Audit NUR für die tatsächlich zurückgegebene Zeile;
- bei null Treffern KEIN Erfolgseintrag und keine Erfolgsmeldung;
- Zusicherung für den Parallel-/Wiederholungsfall: insgesamt **genau ein**
  Lösch-Audit.

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

**Die anderen Wege sind bereits gezählt (Planprüfung), und das Ergebnis ist
eine ENTWURFSGRENZE:**

| Weg | Reihenfolge |
|---|---|
| Upload (`:3320-3325`) | Datei → INSERT, Autocommit, kein Advisory-Lock |
| heutige Einzellöschung (`:3355-3358`) | SELECT → Datei → DELETE, Autocommit, kein Lock |
| Reparatur (`:3095-3119`, `:3198-3228`) | Defektzeile UPDATE → Studio-Lock (Audit) → Commit; Fotos erst DANACH |
| Foto-Reaper (`core/foto-reaper.js:50-56`) | Auswahl → Unlink → DELETE, Autocommit |
| Offboarding (`core/provisioning.js:413-475`) | generische DELETEs in einer Transaktion, Dateien nach Commit |

**Für die hier beschriebene Transaktion ist KEIN neuer Verklemmungskreis
belegt** — die Reparatur hält ihren Studio-Lock nicht mehr, wenn sie Fotos
löscht.

**Aber die Grenze ist scharf:** Wer zur stabilen Statusprüfung zusätzlich die
DEFEKTZEILE sperrt (etwa `SELECT … FOR UPDATE`), erzeugt sehr wohl einen
Kreis — Foto-Transaktion nähme Studio-Lock und wartete auf die Defektzeile,
Reparatur und Ausmusterung (`routes/admin/ausmusterung.js:757-762`,
`:829-833`) nehmen es umgekehrt. **Diese Erweiterung ist in diesem Beitrag
VERBOTEN.** Wird sie gebraucht, ist sie eine eigene, gemeinsame
Lock-Entscheidung.

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
