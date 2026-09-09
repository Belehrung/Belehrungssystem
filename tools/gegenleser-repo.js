#!/usr/bin/env node
'use strict';
//
// tools/gegenleser-repo.js — schickt einen Diff an ein OpenAI-Modell, gibt
// ihm aber zusaetzlich zwei Werkzeuge (suche/lies) an die Hand, mit denen es
// im Repo NACHSEHEN kann, statt aus dem Diff allein zu raten. Stufe 2 der
// Gegenlesung, Betreiber-Freigabe 09.09.2026 ("stufe 2 fuer gpt bauen und
// nutzen").
//
// ANLASS (gemessen, siehe tools/zweitmeinung.js): zwei Laeufe (gpt-5 und
// gpt-5.3-codex) ueber denselben 790-Zeilen-Diff lieferten zusammen NULL
// blockierende und sechs "sollte behoben werden" — alle sechs fielen beim
// Nachmessen. Ihre Form war durchweg "aus dem Diff nicht ersichtlich, ob …"
// und "falls kuenftig …". Der Grund war dort strukturell benannt: die Antwort
// liegt in Dateien, die der Diff nicht zeigt, und das Werkzeug konnte nicht
// nachsehen. Dieses Werkzeug gibt genau das dazu — ob es die Klasse wirklich
// zum Verschwinden bringt, ist damit noch nicht gemessen, nur ermoeglicht.
//
// DIE ERLAUBNISLISTE IST DER KERN: erlaubt ist genau, was "git ls-files" im
// Wurzelverzeichnis auflistet, nichts sonst. Geheimnisse und Nutzerdaten sind
// in diesem Projekt genau das, was NICHT versioniert ist. Siehe pfadPruefen()
// weiter unten fuer die fuenf Pruefschritte.
//
// DER SCHLÜSSEL GEHÖRT NICHT INS REPO — wie bei tools/zweitmeinung.js: aus
// OPENAI_API_KEY oder der Datei, die OPENAI_KEY_DATEI nennt. Fehlt beides:
// Exit 2. Der Geheimnis-Riegel (tools/geheimnis-riegel.js, gemeinsam mit
// zweitmeinung.js benutzt, nicht kopiert) laeuft auf JEDES Funktionsergebnis,
// bevor es in die naechste Anfrage geht — schlaegt er an, wird SOFORT
// abgebrochen (Exit 3), ohne dass die Anfrage gesendet wird.
//
// AUFRUF:
//   node tools/gegenleser-repo.js <diff.txt> [--wurzel=/pfad/zum/repo]
//                                 [--modell=gpt-5] [--max-runden=25]
//                                 [--protokoll=/pfad.jsonl]
//   node tools/gegenleser-repo.js --selbsttest   (prueft die Riegel, OHNE Netz)
//
// EXIT-CODES: 0 fertig, 2 kein Schluessel/falscher Aufruf, 3 Geheimnis-Riegel
// hat angeschlagen, 4 Runden- oder Mengenlimit erreicht (Bericht
// UNVOLLSTAENDIG), 5 das Modell hat am Ende keinen Text geliefert, 1 sonstiger
// Fehler.

const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { pruefeGeheimnisse } = require('./geheimnis-riegel');

const ENDPUNKT = 'https://api.openai.com/v1/chat/completions';
const VORGABE_MODELL = 'gpt-5';
const VORGABE_MAX_RUNDEN = 25;
const MAX_ANTWORT_TOKEN = 24000;
const MAX_SUCHE_ZEILEN = 80;
const MAX_LIES_ZEILEN = 400;
const MAX_AUSGABE_BYTES = 600 * 1024;

// Wörtlich aus /tmp/claude-0/codereview.py uebernommen (Auftrag Teil B) — der
// dortige Sechs-Punkte-Auftrag ist erprobt (siehe tools/zweitmeinung.js-Kopf).
// Per JSON.stringify aus der Quelle extrahiert und unveraendert eingesetzt,
// damit keine Uebertragungsfehler (Umlaute, Gedankenstriche) hineinkommen.
const BRIEF_KERN = "Du bist unabhängiger Code-Gegenleser für ein Node.js/PostgreSQL-System\n(GymDocu, Arbeitsschutz-Dokumentation für Fitnessstudios). Unten steht ein Diff.\n\nDer Zweig baut ein neues Feld: für jedes Prüfintervall wird maschinenlesbar\nfestgehalten, worauf die Zahl beruht — `gesetz`, `eigene_festlegung` oder\n`hersteller`. Dazu Migration 0054 mit den Spalten `frist_herkunft`, `frist_norm`,\n`frist_festgelegt_am`, `frist_festgelegt_von`, `hersteller_intervall_monate`;\nein Bestätigungsknopf; ein Hinweis, wenn das eigene Intervall länger ist als das\ndes Herstellers; ein Schritt in der Einrichtungs-Checkliste; eine neue Testdatei.\n\nPRÜFE IN DIESER REIHENFOLGE — und melde zu jedem Punkt auch, wenn du nichts\ngefunden hast:\n\n1. ZUSICHERUNGEN, DIE NICHT FEHLSCHLAGEN KÖNNEN. Für jede Zusicherung in der\n   Testdatei: welche EINE Zeile müsste man ändern, damit genau sie fällt? Bezieht\n   eine ihren Sollwert aus dem, was sie bewachen soll (z. B. Vergleich gegen\n   dieselbe Konstante auf beiden Seiten, oder eine Vergleichsmenge, die aus\n   derselben Schleife gefüllt wird, die geprüft wird)? Gibt es eine Sollzahl, und\n   ist sie ein von Hand eingetragenes Literal? Erzwingt der Vorzustand das\n   erwartete Ergebnis ohnehin?\n\n2. ZEITZONEN. Ein Date aus lokalen Werten gebaut (`new Date(j,m,t)`, `setDate`,\n   `setMonth`) und dann über `toISOString()` gelesen, ergibt den UTC-Kalendertag —\n   östlich von UTC oft den Vortag. Richtig wären `formatBerlinDate()` bzw.\n   `plusMonate()`/`plusTage()` aus `core/datum.js`. WICHTIG: unter UTC liefert\n   dieser Fehler zufällig das richtige Ergebnis, der CI-Runner läuft auf UTC.\n   Suche nach der KOMBINATION, nicht nach `toISOString` allein.\n\n3. DER SCHREIBWEG. Wird das neue Feld auf ALLEN Anlegewegen gesetzt? Gibt es\n   Pfade, die daran vorbeigehen? Ein bereits vom Admin gesetzter Wert darf bei\n   einem erneuten Assistenten-Durchlauf nicht überschrieben werden.\n\n4. DIE BEDINGUNG DES HINWEISES. Er soll NUR erscheinen, wenn beide Zahlen gesetzt\n   sind UND das eigene Intervall LÄNGER ist. Prüfe Randfälle: gleich, null,\n   undefined, 0, Zeichenkette statt Zahl.\n\n5. FEHLERBEHANDLUNG. Ein DB-Fehler in einem Teilschritt darf nicht die ganze\n   Seite reissen. Ein verschluckter Fehler, der als \"alles in Ordnung\"\n   durchgeht, ist schlimmer als ein lauter Abbruch.\n\n6. SQL. Trägt jede Abfrage den Mandantenbezug (`studio_id`)? Ist die Migration\n   idempotent? Passt sie zum Schema?\n\nMELDE je Befund: Datei und Zeile aus dem Diff, die betroffene Zeichenkette\nwörtlich, was falsch ist, und die Schwere (blockierend / sollte behoben werden /\nAnmerkung). Erfinde nichts; wo du etwas nicht aus dem Diff entscheiden kannst,\nsag das ausdrücklich. Antworte auf Deutsch.\n";

// Genau dieser eine Absatz (Auftrag Teil B), der den Sinn dieses Werkzeugs
// gegenueber tools/zweitmeinung.js ausmacht: es DARF nachsehen.
const WERKZEUG_ABSATZ = "DU HAST WERKZEUGE. Behaupte nichts, was du nachsehen kannst, und schreibe\nNIEMALS \"aus dem Diff nicht ersichtlich\" oder \"falls künftig\" — sieh\nstattdessen nach. Prüfe insbesondere: werden die neuen Spalten in der\nSELECT-Abfrage der betroffenen Seiten überhaupt ausgewählt? Wie werden die\nWerte beim Schreiben normalisiert? Gibt es weitere Schreibwege ausserhalb\ndes Diffs? Bevor du einen Befund meldest, sieh dir die tragende Stelle im\nOriginal an und zitiere sie mit Datei und Zeilennummer. Ein Befund ohne\nnachgesehene Fundstelle ist keiner.";

const AUFTRAGSTEXT = BRIEF_KERN + '\n' + WERKZEUG_ABSATZ;

const WERKZEUGE = [
    {
        type: 'function',
        function: {
            name: 'suche',
            description: 'Volltextsuche ueber alle Dateien der Erlaubnisliste (das ist genau, '
                + 'was "git ls-files" im Projekt auflistet). Liefert Treffer als '
                + '"pfad:zeilennummer:inhalt", hoechstens ' + MAX_SUCHE_ZEILEN + ' Zeilen; gibt es '
                + 'mehr, werden die ersten ' + MAX_SUCHE_ZEILEN + ' UND die Gesamtzahl gemeldet.',
            parameters: {
                type: 'object',
                properties: {
                    muster: {
                        type: 'string',
                        description: 'Regulaerer Ausdruck (JavaScript-Syntax), pro Zeile geprueft.',
                    },
                    dateimuster: {
                        type: 'string',
                        description: 'Optionaler Glob (* und ?) gegen den relativen Pfad, um die '
                            + 'Suche einzugrenzen, z. B. "*.js" oder "routes/admin/*".',
                    },
                },
                required: ['muster'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'lies',
            description: 'Liefert einen Zeilenbereich einer einzelnen Datei aus der '
                + 'Erlaubnisliste, jede Zeile mit ihrer Nummer. Hoechstens ' + MAX_LIES_ZEILEN
                + ' Zeilen je Aufruf; ein groesserer Bereich wird gekuerzt und das wird gemeldet.',
            parameters: {
                type: 'object',
                properties: {
                    pfad: { type: 'string', description: 'Pfad relativ zum Projekt-Wurzelverzeichnis.' },
                    von: { type: 'integer', description: 'Erste Zeile, 1-basiert.' },
                    bis: { type: 'integer', description: 'Letzte Zeile, 1-basiert, inklusive.' },
                },
                required: ['pfad', 'von', 'bis'],
            },
        },
    },
];

// Wird geworfen, wenn der Geheimnis-Riegel auf einem Funktionsergebnis
// anschlaegt. Eigene Klasse, damit main() diesen Fall von einem gewoehnlichen
// "abgelehnt: ..."-Funktionsergebnis unterscheiden kann: hier wird NICHT
// weitergemacht, sondern sofort mit Exit 3 abgebrochen.
class GeheimnisAbbruch extends Error {
    constructor(treffer, ort) {
        super('Geheimnis-Riegel ausgeloest bei ' + ort);
        this.treffer = treffer;
        this.ort = ort;
    }
}

function schluesselHolen() {
    if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();
    const pfad = process.env.OPENAI_KEY_DATEI;
    if (!pfad) return null;
    let wert;
    try {
        wert = fs.readFileSync(pfad, 'utf8').trim();
    } catch (e) {
        return null;
    }
    return wert || null;
}

// Hart gesperrt, AUCH wenn versioniert (Schritt 5 der Erlaubnispruefung).
function istHartGesperrt(relPfad) {
    return path.basename(relPfad).startsWith('.env')
        || relPfad.endsWith('.key')
        || relPfad.endsWith('.pem');
}

// Modul-Zustand fuer EINEN Lauf, von wurzelEinrichten() gesetzt. Der
// Selbsttest ruft wurzelEinrichten() mehrfach mit unterschiedlichen
// Wegwerf-Wurzeln auf; das ist gewollt, jeder CLI-Lauf richtet nur einmal ein.
let wurzelAbsolut = null;
let wurzelReal = null;
let versionierteDateien = null;

function wurzelEinrichten(wurzelArg) {
    wurzelAbsolut = path.resolve(wurzelArg);
    wurzelReal = fs.realpathSync(wurzelAbsolut);
    const roh = execFileSync('git', ['ls-files', '-z'], {
        cwd: wurzelAbsolut,
        maxBuffer: 64 * 1024 * 1024,
    });
    versionierteDateien = new Set(roh.toString('utf8').split('\0').filter(Boolean));
}

// DIE ERLAUBNISPRUEFUNG (Auftrag Teil B, "das ist der Kern"). Alle fuenf
// Schritte sind noetig, in dieser Reihenfolge:
function pfadPruefen(angefragterPfad) {
    if (typeof angefragterPfad !== 'string' || !angefragterPfad) {
        return { ok: false, grund: 'kein Pfad angegeben' };
    }
    // Schritt 1: path.resolve(wurzel, pfad) bilden.
    const ziel = path.resolve(wurzelAbsolut, angefragterPfad);
    // Schritt 2: realpathSync darauf — loest Symlinks auf. Fehlt die Datei,
    // ist das eine Ablehnung, kein Absturz.
    let real;
    try {
        real = fs.realpathSync(ziel);
    } catch (e) {
        return { ok: false, grund: `Datei nicht gefunden: ${angefragterPfad}` };
    }
    // Schritt 3: muss unterhalb von realpathSync(wurzel) liegen. Faengt
    // "../", absolute Pfade und Symlinks, die aus dem Repo hinauszeigen.
    if (!real.startsWith(wurzelReal + path.sep)) {
        return { ok: false, grund: `ausserhalb des Repo-Wurzelverzeichnisses: ${angefragterPfad}` };
    }
    // Schritt 4: der relative Pfad muss im "git ls-files"-Set stehen.
    const relativ = path.relative(wurzelReal, real).split(path.sep).join('/');
    if (!versionierteDateien.has(relativ)) {
        return { ok: false, grund: `nicht von "git ls-files" erfasst (nicht versioniert): ${relativ}` };
    }
    // Schritt 5: zusaetzlich hart gesperrt, auch wenn versioniert.
    if (istHartGesperrt(relativ)) {
        return { ok: false, grund: `gesperrter Dateiname (.env*/.key/.pem): ${relativ}` };
    }
    return { ok: true, absolut: real, relativ };
}

// Fast jede Textdatei endet mit einem Zeilenumbruch — ein blosses split()
// zaehlt dann eine Phantom-Leerzeile zu viel (aus "A\nB\n" wuerden drei
// "Zeilen" statt zwei). EINE Stelle fuer suche() UND lies(), nicht zwei, die
// auseinanderlaufen koennen.
function zeilenAus(inhalt) {
    const zeilen = inhalt.split(/\r\n|\n/);
    if (zeilen.length > 1 && zeilen[zeilen.length - 1] === '') zeilen.pop();
    return zeilen;
}

// Einfacher Glob (* und ?) gegen den vollen relativen Pfad — kein echtes
// Micromatch, reicht aber fuer "*.js" oder "routes/admin/*" als Eingrenzung.
function glob2regex(glob) {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const muster = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp('^' + muster + '$');
}

function werkzeugSuche(muster, dateimuster) {
    let re;
    try {
        re = new RegExp(muster);
    } catch (e) {
        return { text: `abgelehnt: ungueltiges Suchmuster (${e.message})`, abgelehnt: false };
    }
    const dateiRe = dateimuster ? glob2regex(dateimuster) : null;

    const treffer = [];
    let gesamtTreffer = 0;
    for (const relPfad of versionierteDateien) {
        if (dateiRe && !dateiRe.test(relPfad)) continue;
        const pruefung = pfadPruefen(relPfad);
        if (!pruefung.ok) continue; // z. B. Symlink aus dem Repo hinaus — interner Schutz, keine Modell-Ablehnung
        let inhalt;
        try {
            inhalt = fs.readFileSync(pruefung.absolut, 'utf8');
        } catch (e) {
            continue;
        }
        const zeilen = zeilenAus(inhalt);
        for (let i = 0; i < zeilen.length; i++) {
            if (!re.test(zeilen[i])) continue;
            gesamtTreffer++;
            if (treffer.length >= MAX_SUCHE_ZEILEN) continue;
            // Riegel PRO gefundener Zeile: nur was tatsaechlich zurueckgeht, wird
            // geprueft — Zeilen jenseits des Deckels werden nie gesendet.
            const geheim = pruefeGeheimnisse(zeilen[i]);
            if (!geheim.sauber) throw new GeheimnisAbbruch(geheim.treffer, `${relPfad}:${i + 1}`);
            treffer.push(`${relPfad}:${i + 1}:${zeilen[i]}`);
        }
    }
    let text = treffer.length ? treffer.join('\n') : '(keine Treffer)';
    if (gesamtTreffer > MAX_SUCHE_ZEILEN) {
        text += `\n\n[GEKUERZT: ${gesamtTreffer} Treffer insgesamt, nur die ersten ${MAX_SUCHE_ZEILEN} gezeigt]`;
    }
    return { text, abgelehnt: false };
}

// Dispatcht auf die beiden Werkzeuge; eine unbekannte Funktion (Modell-
// Halluzination) ist eine gewoehnliche Ablehnung, kein Absturz.
function werkzeugAufrufen(name, argumente) {
    if (name === 'suche') return werkzeugSuche(argumente.muster, argumente.dateimuster);
    if (name === 'lies') return werkzeugLies(argumente.pfad, argumente.von, argumente.bis);
    return { text: `abgelehnt: unbekannte Funktion "${name}"`, abgelehnt: true };
}

function werkzeugLies(pfad, von, bis) {
    const gvon = Number(von);
    const gbis = Number(bis);
    if (!Number.isInteger(gvon) || !Number.isInteger(gbis) || gvon < 1 || gbis < gvon) {
        return { text: `abgelehnt: ungueltiger Zeilenbereich (von=${von}, bis=${bis})`, abgelehnt: false };
    }
    const pruefung = pfadPruefen(pfad);
    if (!pruefung.ok) {
        return { text: `abgelehnt: ${pruefung.grund}`, abgelehnt: true };
    }
    let inhalt;
    try {
        inhalt = fs.readFileSync(pruefung.absolut, 'utf8');
    } catch (e) {
        return { text: `abgelehnt: Datei konnte nicht gelesen werden (${e.message})`, abgelehnt: true };
    }
    const zeilen = zeilenAus(inhalt);
    const gesamt = zeilen.length;
    if (gvon > gesamt) {
        return {
            text: `Datei "${pruefung.relativ}" hat nur ${gesamt} Zeilen — angefragter Bereich ${gvon}-${gbis} liegt dahinter.`,
            abgelehnt: false,
        };
    }
    let ende = gbis;
    const hinweise = [];
    if (ende > gesamt) { ende = gesamt; hinweise.push(`bis Dateiende (${gesamt}) gekuerzt`); }
    if (ende - gvon + 1 > MAX_LIES_ZEILEN) { ende = gvon + MAX_LIES_ZEILEN - 1; hinweise.push(`auf ${MAX_LIES_ZEILEN} Zeilen gekuerzt`); }

    const ausschnittZeilen = zeilen.slice(gvon - 1, ende);
    const geheim = pruefeGeheimnisse(ausschnittZeilen.join('\n'));
    if (!geheim.sauber) throw new GeheimnisAbbruch(geheim.treffer, pruefung.relativ);

    const formatiert = ausschnittZeilen.map((z, i) => `${gvon + i}:${z}`).join('\n');
    const kopf = hinweise.length ? `[${hinweise.join('; ')}]\n` : '';
    return {
        text: `${kopf}${pruefung.relativ} (Zeilen ${gvon}-${ende} von ${gesamt}):\n${formatiert}`,
        abgelehnt: false,
        relativ: pruefung.relativ,
        von: gvon,
        bis: ende,
    };
}

function anfragen(schluessel, modell, messages) {
    const koerper = JSON.stringify({
        model: modell,
        messages,
        tools: WERKZEUGE,
        max_completion_tokens: MAX_ANTWORT_TOKEN,
    });
    return new Promise((erfuellen, ablehnen) => {
        const anfrage = https.request(ENDPUNKT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${schluessel}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(koerper),
            },
            timeout: 20 * 60 * 1000,
        }, (antwort) => {
            let roh = '';
            antwort.on('data', (stueck) => { roh += stueck; });
            antwort.on('end', () => {
                if (antwort.statusCode !== 200) {
                    ablehnen(new Error(`HTTP ${antwort.statusCode}: ${roh.slice(0, 800)}`));
                    return;
                }
                try { erfuellen(JSON.parse(roh)); } catch (e) { ablehnen(e); }
            });
        });
        anfrage.on('timeout', () => { anfrage.destroy(new Error('Zeitueberschreitung nach 20 Minuten')); });
        anfrage.on('error', ablehnen);
        anfrage.end(koerper);
    });
}

// Protokoll: JEDE gesendete Nachricht und jede Funktionsantwort, einmal pro
// Zeile. Absichtlich NIE der rohe HTTP-Request (der trueg den
// Authorization-Header) — nur die messages[]-Elemente und Zaehl-Metadaten
// laufen hier durch, der Header wird nirgends an diese Funktion uebergeben.
let protokollPfadAktuell = null;
function protokollSchreiben(eintrag) {
    if (!protokollPfadAktuell) return;
    fs.appendFileSync(protokollPfadAktuell, JSON.stringify({ zeit: new Date().toISOString(), ...eintrag }) + '\n');
}

function konsoleUsage() {
    console.error('Aufruf: node tools/gegenleser-repo.js <diff.txt> [--wurzel=/pfad/zum/repo]');
    console.error('        [--modell=gpt-5] [--max-runden=25] [--protokoll=/pfad.jsonl]');
    console.error('        node tools/gegenleser-repo.js --selbsttest');
}

function argumenteLesen(argv) {
    const optionen = {
        diffPfad: null,
        wurzel: process.cwd(),
        modell: VORGABE_MODELL,
        maxRunden: VORGABE_MAX_RUNDEN,
        protokollPfad: null,
    };
    for (const a of argv) {
        if (a.startsWith('--wurzel=')) { optionen.wurzel = a.slice('--wurzel='.length); continue; }
        if (a.startsWith('--modell=')) { optionen.modell = a.slice('--modell='.length); continue; }
        if (a.startsWith('--max-runden=')) { optionen.maxRunden = Number(a.slice('--max-runden='.length)); continue; }
        if (a.startsWith('--protokoll=')) { optionen.protokollPfad = a.slice('--protokoll='.length); continue; }
        if (!optionen.diffPfad && !a.startsWith('--')) { optionen.diffPfad = a; continue; }
        throw new Error(`Unbekanntes Argument: ${a}`);
    }
    if (!optionen.protokollPfad) {
        optionen.protokollPfad = path.join(os.tmpdir(), `gegenleser-repo-${Date.now()}-${process.pid}.jsonl`);
    }
    return optionen;
}

async function main(argvUeberschreibung) {
    const argumente = argvUeberschreibung || process.argv.slice(2);
    if (argumente[0] === '--selbsttest') return selbsttest();

    let optionen;
    try {
        optionen = argumenteLesen(argumente);
    } catch (e) {
        console.error(`FEHLER: ${e.message}`);
        konsoleUsage();
        return 2;
    }
    if (!optionen.diffPfad) {
        konsoleUsage();
        return 2;
    }

    // Grenzfall zuerst, weil er ohne Schluessel und ohne Netz prüfbar sein
    // muss (Selbsttest Fall 8): ein Lauf, der von vornherein keine einzige
    // Runde erlaubt, kann nie ein Ergebnis liefern — laut abbrechen, nicht
    // still mit leerem Bericht durchgehen.
    if (!Number.isInteger(optionen.maxRunden) || optionen.maxRunden < 1) {
        console.error(`ABBRUCH: --max-runden=${optionen.maxRunden} erlaubt keine einzige Runde — der Bericht waere UNVOLLSTAENDIG, bevor er beginnt.`);
        return 4;
    }

    const schluessel = schluesselHolen();
    if (!schluessel) {
        console.error(
            'ABBRUCH: Kein Schluessel. Setze OPENAI_API_KEY oder OPENAI_KEY_DATEI (Pfad zu einer Datei\n'
            + 'AUSSERHALB des Repos, Rechte 600). Der Schluessel gehoert nicht ins Repo und nicht\n'
            + 'in eine Chat-Nachricht.');
        return 2;
    }

    wurzelEinrichten(optionen.wurzel);
    protokollPfadAktuell = optionen.protokollPfad;
    fs.writeFileSync(protokollPfadAktuell, ''); // frisch je Lauf, kein Vermischen mit einem alten Protokoll

    const diffInhalt = fs.readFileSync(optionen.diffPfad, 'utf8');
    const diffPruefung = pruefeGeheimnisse(diffInhalt);
    if (!diffPruefung.sauber) {
        console.error('ABBRUCH: Der Diff enthaelt etwas, das wie ein Geheimnis aussieht — '
            + diffPruefung.treffer.map((t) => t.name).join(', ') + '.');
        console.error('Es wurde NICHTS gesendet.');
        return 3;
    }

    const messages = [{
        role: 'user',
        content: AUFTRAGSTEXT + '\n\n########## DIFF ##########\n\n' + diffInhalt,
    }];
    protokollSchreiben({ typ: 'start', nachricht: messages[0] });

    let runde = 0;
    let sucheAnzahl = 0;
    let liesAnzahl = 0;
    let ablehnungenAnzahl = 0;
    let ausgabeBytes = 0;
    let promptTokenSumme = 0;
    let completionTokenSumme = 0;
    const gelesenePfade = [];

    const zusammenfassungAusgeben = () => {
        console.log('\n---');
        console.log('GELESENE DATEIEN:');
        if (gelesenePfade.length === 0) {
            console.log('  (keine)');
        } else {
            for (const g of gelesenePfade) console.log(`  ${g.pfad}:${g.von}-${g.bis}`);
        }
        console.log(`Suchen: ${sucheAnzahl}  Lesungen: ${liesAnzahl}  Ablehnungen: ${ablehnungenAnzahl}`);
        console.log(`Runden: ${runde}  Token rein: ${promptTokenSumme}  Token raus: ${completionTokenSumme}`);
        console.log(`Protokoll: ${protokollPfadAktuell}`);
    };

    while (true) {
        runde++;
        if (runde > optionen.maxRunden) {
            console.error(`ABBRUCH: Rundenlimit (${optionen.maxRunden}) erreicht — der Bericht ist UNVOLLSTAENDIG.`);
            runde--;
            zusammenfassungAusgeben();
            return 4;
        }

        let antwort;
        try {
            antwort = await anfragen(schluessel, optionen.modell, messages);
        } catch (e) {
            console.error(`FEHLER bei der Anfrage: ${e.message}`);
            zusammenfassungAusgeben();
            throw e;
        }
        const verbrauch = antwort.usage || {};
        promptTokenSumme += verbrauch.prompt_tokens || 0;
        completionTokenSumme += verbrauch.completion_tokens || 0;
        const nachricht = antwort.choices[0].message;
        protokollSchreiben({ typ: 'antwort', runde, nachricht, verbrauch });
        messages.push(nachricht);

        if (!nachricht.tool_calls || nachricht.tool_calls.length === 0) {
            if (!nachricht.content || !nachricht.content.trim()) {
                console.error('ABBRUCH: Das Modell hat am Ende keinen Text geliefert — kein sauberes Ergebnis.');
                zusammenfassungAusgeben();
                return 5;
            }
            console.log(nachricht.content);
            zusammenfassungAusgeben();
            return 0;
        }

        for (const aufruf of nachricht.tool_calls) {
            let ergebnis;
            try {
                let werkzeugArgumente;
                try {
                    werkzeugArgumente = JSON.parse(aufruf.function.arguments || '{}');
                } catch (e) {
                    ergebnis = { text: `abgelehnt: ungueltige Argumente (${e.message})`, abgelehnt: true };
                }
                if (!ergebnis) {
                    if (aufruf.function.name === 'suche') sucheAnzahl++;
                    else if (aufruf.function.name === 'lies') liesAnzahl++;
                    ergebnis = werkzeugAufrufen(aufruf.function.name, werkzeugArgumente);
                    if (ergebnis.relativ) gelesenePfade.push({ pfad: ergebnis.relativ, von: ergebnis.von, bis: ergebnis.bis });
                }
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) {
                    console.error('ABBRUCH: Geheimnis-Riegel hat angeschlagen — es wurde NICHTS weiter gesendet.');
                    for (const t of e.treffer) console.error(`  Muster "${t.name}" in ${e.ort}`);
                    protokollSchreiben({ typ: 'geheimnis_abbruch', ort: e.ort, muster: e.treffer.map((t) => t.name) });
                    zusammenfassungAusgeben();
                    return 3;
                }
                throw e;
            }

            if (ergebnis.abgelehnt) ablehnungenAnzahl++;

            ausgabeBytes += Buffer.byteLength(ergebnis.text, 'utf8');
            if (ausgabeBytes > MAX_AUSGABE_BYTES) {
                console.error(`ABBRUCH: Gesamtausgabemenge ueber ${MAX_AUSGABE_BYTES} Bytes (${ausgabeBytes}) — der Bericht ist UNVOLLSTAENDIG.`);
                zusammenfassungAusgeben();
                return 4;
            }

            protokollSchreiben({ typ: 'funktionsantwort', runde, werkzeug: aufruf.function.name, tool_call_id: aufruf.id, text: ergebnis.text });
            messages.push({ role: 'tool', tool_call_id: aufruf.id, content: ergebnis.text });
        }
    }
}

// ===================== TEIL C: SELBSTTEST, OHNE NETZ =====================
//
// Baut einen Wegwerf-Klon unter os.tmpdir() auf, prueft die Erlaubnisliste
// gegen ihn und raeumt ihn in einem finally wieder ab. Fasst NICHTS ausserhalb
// von os.tmpdir() an.

async function selbsttest() {
    const ERWARTETE_FAELLE = 8;
    let gelaufen = 0;
    let fehler = 0;
    const pruefen = (bezeichnung, bedingung) => {
        gelaufen++;
        console.log(`${bedingung ? '  ✓' : '  ✗ FEHLT'} ${bezeichnung}`);
        if (!bedingung) fehler++;
    };

    const klon = fs.mkdtempSync(path.join(os.tmpdir(), 'gegenleser-selbsttest-'));
    try {
        execFileSync('git', ['init', '-q'], { cwd: klon });
        execFileSync('git', ['config', 'user.email', 'selbsttest@example.invalid'], { cwd: klon });
        execFileSync('git', ['config', 'user.name', 'Selbsttest'], { cwd: klon });

        const harmlosInhalt = 'Zeile A\nZeile B\nZeile C\n';
        fs.writeFileSync(path.join(klon, 'harmlos.txt'), harmlosInhalt);

        fs.writeFileSync(path.join(klon, 'nicht_versioniert.txt'), 'nie committet\n');

        fs.symlinkSync('/etc', path.join(klon, 'zeiger_auf_etc'));

        fs.writeFileSync(path.join(klon, '.env.beispiel'), 'BEISPIEL=1\n');

        // Zusammengesetzt, kein Literal im Quelltext — wie in geheimnis-riegel.js.
        const geheimZeile = 'const schluessel = "' + 'sk' + '-proj-' + 'D'.repeat(40) + '";\n';
        fs.writeFileSync(path.join(klon, 'geheim.js'), geheimZeile);

        execFileSync('git', ['add', 'harmlos.txt', '.env.beispiel', 'zeiger_auf_etc', 'geheim.js'], { cwd: klon });
        execFileSync('git', ['commit', '-q', '-m', 'Testdaten'], { cwd: klon });

        wurzelEinrichten(klon);

        {
            const r = pfadPruefen('../../etc/passwd');
            pruefen(`SPERRFALL 1 (../../etc/passwd wird abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('/etc/passwd');
            pruefen(`SPERRFALL 2 (/etc/passwd absolut wird abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('nicht_versioniert.txt');
            pruefen(`SPERRFALL 3 (existiert, aber nicht versioniert, wird abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('zeiger_auf_etc');
            pruefen(`SPERRFALL 4 (Symlink im Klon nach /etc wird abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('.env.beispiel');
            pruefen(`SPERRFALL 5 (versionierte .env.beispiel wird trotzdem abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('harmlos.txt');
            const inhaltOk = r.ok && fs.readFileSync(r.absolut, 'utf8') === harmlosInhalt;
            pruefen('DURCHLASSFALL 6 (harmlos.txt ist erlaubt und lesbar)', r.ok === true && inhaltOk);
        }
        {
            let ausgeloest = false;
            let muster = '-';
            try {
                werkzeugLies('geheim.js', 1, 5);
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) {
                    ausgeloest = true;
                    muster = e.treffer.map((t) => t.name).join(', ');
                }
            }
            pruefen(`RIEGELFALL 7 (Geheimnis in geheim.js loest ab, erkannt: ${muster}; keine Netzanfrage im Selbsttest-Codepfad)`, ausgeloest);
        }
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            delete process.env.OPENAI_API_KEY;
            delete process.env.OPENAI_KEY_DATEI;
            let code;
            try {
                code = await main([path.join(klon, 'harmlos.txt'), `--wurzel=${klon}`, '--max-runden=0']);
            } finally {
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            pruefen('GRENZFALL 8 (--max-runden=0 bricht sofort mit Exit 4 ab, ohne Schluessel und ohne Netz)', code === 4);
        }
    } catch (e) {
        console.log(`  ✗ FEHLT: unerwarteter Fehler im Selbsttest: ${e.message}`);
        fehler++;
    } finally {
        fs.rmSync(klon, { recursive: true, force: true });
    }

    if (gelaufen !== ERWARTETE_FAELLE) {
        console.log(`  ✗ FEHLT: ${gelaufen} Faelle gelaufen, erwartet ${ERWARTETE_FAELLE} — Fall entfernt oder Abbruch mittendrin?`);
        fehler++;
    }
    console.log(fehler ? `\n${fehler} Fehler` : '\nSelbsttest sauber');
    return fehler ? 1 : 0;
}

main().then((code) => { process.exitCode = code; }).catch((fehler) => {
    console.error('FEHLER:', fehler.message);
    process.exitCode = 1;
});
