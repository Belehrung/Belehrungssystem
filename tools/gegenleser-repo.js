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
//                                 [--modell=gpt-5.5] [--max-runden=25]
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
// Gemessen 10.09.2026 gegen unser Konto (GET /v1/models): gpt-5 stammte vom
// 05.08.2025 und war damit mehrere Stufen alt; verfuegbar sind seither u. a.
// gpt-5.5, gpt-5.6-sol/terra/luna und gpt-6-astra.
//
// WARUM NICHT SOL ODER ASTRA, obwohl das die staerkeren Stufen sind: sie
// koennen ueber DIESEN Endpunkt keine Werkzeuge. Gemessen am selben Tag,
// woertliche Antwort der API auf einen Aufruf mit "tools":
//   "Function tools with reasoning_effort are not supported for gpt-5.6-sol
//    in /v1/chat/completions. To use function tools, use /v1/responses or
//    set reasoning_effort to 'none'."
// Der Fehler kommt auch OHNE eigenes reasoning_effort im Request (dieses
// Werkzeug setzt es nirgends) -- die Stufe bringt einen Standardwert mit,
// der sich mit Function Tools hier nicht vertraegt. reasoning_effort:'none'
// waere zwar messbar moeglich (geprueft: tool_calls kommen dann), nimmt aber
// genau das Nachdenken weg, wegen dem man die Stufe ueberhaupt nimmt.
//
// LEHRE, damit der Fehler nicht wiederkommt: eine Ein-Wort-Anfrage OHNE
// Werkzeuge beweist NICHT, dass ein Modell auf dem echten Weg funktioniert.
// Genau so ist diese Datei kurzzeitig auf gpt-5.6-sol gestellt worden, und
// der erste echte Lauf starb sofort mit HTTP 400. Wer die Stufe wechselt,
// prueft mit "tools" im Request, nicht mit "sag bereit".
//
// gpt-5.5 kann Werkzeuge ueber /v1/chat/completions (gemessen: tool_calls
// kommen) und ist die Stufe mit der einzigen belegten CODE-REVIEW-Zahl, die
// vorliegt: 79,2 % erwartete Befunde gefunden gegen 58,3 % Basis, Praezision
// 27,9 % -> 40,6 % (Stand 10.09.2026). Die Praezision heisst zugleich: mehr
// als die Haelfte der Meldungen sind Fehlalarme, jeder Befund gehoert
// nachgemessen.
//
// Um Sol/Astra nutzbar zu machen, muesste dieses Werkzeug auf /v1/responses
// umgebaut werden (anderes Antwortformat: output[] mit function_call statt
// choices[].message.tool_calls; gemessen, dass es dort geht). Eigener
// Auftrag. --modell= bleibt der Schalter zum Vergleichen.
const VORGABE_MODELL = 'gpt-5.5';
// 25 reichten in Messlauf 1 (09.09.2026) NICHT: das Modell rief je Antwort
// genau EINEN Werkzeugaufruf auf (gemessen: 25 Antworten, 25 Aufrufe) und lief
// mitten in der Arbeit ins Limit. Der Abbruch war richtig -- ein Lauf, der
// abbricht, hat NICHTS geliefert, nicht "keine Befunde" -- aber die Grenze war
// zu eng gesetzt. Zusammen mit dem Buendel-Hinweis im Auftragstext unten.
const VORGABE_MAX_RUNDEN = 40;
const MAX_ANTWORT_TOKEN = 24000;
const MAX_SUCHE_ZEILEN = 80;
const MAX_LIES_ZEILEN = 400;
const MAX_AUSGABE_BYTES = 600 * 1024;

// Preise pro 1 Mio. Token (USD), Stand 10.09.2026 -- das ist ein STAND, kein
// Naturgesetz, und er VERALTET: bei jeder neuen Modellstufe hier nachtragen,
// nicht raten. Ein Modell, das hier fehlt, MUSS als "unbekannt" gemeldet
// werden -- niemals stillschweigend als 0,00 (siehe CLAUDE.md, "eine
// gescheiterte Messung meldet sich als unveraendert").
const PREISTABELLE = {
    'gpt-5.5': { rein: 5.00, raus: 30.00 },
    'gpt-5.6-sol': { rein: 5.00, raus: 30.00 },
    'gpt-5.6-terra': { rein: 2.50, raus: 15.00 },
    'gpt-5.6-luna': { rein: 1.00, raus: 6.00 },
    'gpt-6-astra': { rein: 12.50, raus: 75.00 },
};

// Liefert null (= ausdruecklich "unbekannt"), wenn das Modell nicht in der
// Preistabelle steht -- der Aufrufer muss das von einer echten Zahl
// unterscheiden koennen, sonst verschwindet ein neues Modell in einer
// stillen Null.
function kostenSchaetzen(modell, promptToken, completionToken) {
    const preis = PREISTABELLE[modell];
    if (!preis) return null;
    return (promptToken / 1e6) * preis.rein + (completionToken / 1e6) * preis.raus;
}

// Wörtlich aus /tmp/claude-0/codereview.py uebernommen (Auftrag Teil B) — der
// dortige Sechs-Punkte-Auftrag ist erprobt (siehe tools/zweitmeinung.js-Kopf).
// Per JSON.stringify aus der Quelle extrahiert und unveraendert eingesetzt,
// damit keine Uebertragungsfehler (Umlaute, Gedankenstriche) hineinkommen.
const BRIEF_KERN = "Du bist unabhängiger Code-Gegenleser für ein Node.js/PostgreSQL-System\n(GymDocu, Arbeitsschutz-Dokumentation für Fitnessstudios). Unten steht ein Diff.\n\nDer Zweig baut ein neues Feld: für jedes Prüfintervall wird maschinenlesbar\nfestgehalten, worauf die Zahl beruht — `gesetz`, `eigene_festlegung` oder\n`hersteller`. Dazu Migration 0054 mit den Spalten `frist_herkunft`, `frist_norm`,\n`frist_festgelegt_am`, `frist_festgelegt_von`, `hersteller_intervall_monate`;\nein Bestätigungsknopf; ein Hinweis, wenn das eigene Intervall länger ist als das\ndes Herstellers; ein Schritt in der Einrichtungs-Checkliste; eine neue Testdatei.\n\nPRÜFE IN DIESER REIHENFOLGE — und melde zu jedem Punkt auch, wenn du nichts\ngefunden hast:\n\n1. ZUSICHERUNGEN, DIE NICHT FEHLSCHLAGEN KÖNNEN. Für jede Zusicherung in der\n   Testdatei: welche EINE Zeile müsste man ändern, damit genau sie fällt? Bezieht\n   eine ihren Sollwert aus dem, was sie bewachen soll (z. B. Vergleich gegen\n   dieselbe Konstante auf beiden Seiten, oder eine Vergleichsmenge, die aus\n   derselben Schleife gefüllt wird, die geprüft wird)? Gibt es eine Sollzahl, und\n   ist sie ein von Hand eingetragenes Literal? Erzwingt der Vorzustand das\n   erwartete Ergebnis ohnehin?\n\n2. ZEITZONEN. Ein Date aus lokalen Werten gebaut (`new Date(j,m,t)`, `setDate`,\n   `setMonth`) und dann über `toISOString()` gelesen, ergibt den UTC-Kalendertag —\n   östlich von UTC oft den Vortag. Richtig wären `formatBerlinDate()` bzw.\n   `plusMonate()`/`plusTage()` aus `core/datum.js`. WICHTIG: unter UTC liefert\n   dieser Fehler zufällig das richtige Ergebnis, der CI-Runner läuft auf UTC.\n   Suche nach der KOMBINATION, nicht nach `toISOString` allein.\n\n3. DER SCHREIBWEG. Wird das neue Feld auf ALLEN Anlegewegen gesetzt? Gibt es\n   Pfade, die daran vorbeigehen? Ein bereits vom Admin gesetzter Wert darf bei\n   einem erneuten Assistenten-Durchlauf nicht überschrieben werden.\n\n4. DIE BEDINGUNG DES HINWEISES. Er soll NUR erscheinen, wenn beide Zahlen gesetzt\n   sind UND das eigene Intervall LÄNGER ist. Prüfe Randfälle: gleich, null,\n   undefined, 0, Zeichenkette statt Zahl.\n\n5. FEHLERBEHANDLUNG. Ein DB-Fehler in einem Teilschritt darf nicht die ganze\n   Seite reissen. Ein verschluckter Fehler, der als \"alles in Ordnung\"\n   durchgeht, ist schlimmer als ein lauter Abbruch.\n\n6. SQL. Trägt jede Abfrage den Mandantenbezug (`studio_id`)? Ist die Migration\n   idempotent? Passt sie zum Schema?\n\nMELDE je Befund: Datei und Zeile aus dem Diff, die betroffene Zeichenkette\nwörtlich, was falsch ist, und die Schwere (blockierend / sollte behoben werden /\nAnmerkung). Erfinde nichts; wo du etwas nicht aus dem Diff entscheiden kannst,\nsag das ausdrücklich. Antworte auf Deutsch.\n";

// Genau dieser eine Absatz (Auftrag Teil B), der den Sinn dieses Werkzeugs
// gegenueber tools/zweitmeinung.js ausmacht: es DARF nachsehen.
const WERKZEUG_ABSATZ = "DU HAST WERKZEUGE. Behaupte nichts, was du nachsehen kannst, und schreibe\nNIEMALS \"aus dem Diff nicht ersichtlich\" oder \"falls künftig\" — sieh\nstattdessen nach. Prüfe insbesondere: werden die neuen Spalten in der\nSELECT-Abfrage der betroffenen Seiten überhaupt ausgewählt? Wie werden die\nWerte beim Schreiben normalisiert? Gibt es weitere Schreibwege ausserhalb\ndes Diffs? Bevor du einen Befund meldest, sieh dir die tragende Stelle im\nOriginal an und zitiere sie mit Datei und Zeilennummer. Ein Befund ohne\nnachgesehene Fundstelle ist keiner.\n\nDu darfst und sollst MEHRERE Werkzeugaufrufe in EINER Antwort buendeln, wenn sie\nvoneinander unabhaengig sind — das spart Runden, und die Rundenzahl ist begrenzt.";

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

// mitWerkzeugen=false ist der harte Riegel der letzten zwei Runden (Auftrag
// Teil 2c): OHNE "tools" im Request KANN das Modell keine Funktion mehr
// aufrufen, nur noch Text liefern. Vorgabe true, damit ein Aufrufer, der den
// Parameter vergisst, nicht versehentlich den Riegel auf JEDE Runde legt.
function anfragen(schluessel, modell, messages, mitWerkzeugen = true) {
    const koerper = JSON.stringify({
        model: modell,
        messages,
        ...(mitWerkzeugen ? { tools: WERKZEUGE } : {}),
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
    console.error('        [--modell=gpt-5.5] [--max-runden=25] [--protokoll=/pfad.jsonl]');
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

// Rundenbudget sichtbar machen (Auftrag Teil 2, "der Kern des Auftrags"):
// bisher erfuhr das Modell NIE, wie viele Runden bleiben, und las weiter,
// bis das Limit hart zuschlug -- Anlass waren zwei Laeufe in Folge ohne
// Bericht, der zweite nach 2,78 Mio. Eingabe-Token fuer nichts (siehe
// Auftrag). Drei Stufen: (a) jede Runde einen schlichten Stand, (b) ab 70%
// verbrauchter Runden ein deutlicher Hinweis, jetzt zusammenzufassen,
// (c) in den letzten zwei Runden die harte Aufforderung, JETZT den Bericht
// zu liefern -- diese Stufe faellt zeitgleich mit mitWerkzeugen=false in
// anfragen() zusammen, das ist der eigentliche Riegel, diese Nachricht ist
// nur seine Ankuendigung ans Modell.
function rundenHinweisBauen(runde, maxRunden, istLetzteZweiRunden, ist70Prozent) {
    const verbleibend = maxRunden - runde;
    let text = `[Rundenstand: Runde ${runde} von ${maxRunden} -- danach noch ${verbleibend} moeglich.]`;
    if (istLetzteZweiRunden) {
        text += ' LETZTE RUNDE(N): Ab jetzt bekommst du KEINE Werkzeuge mehr angeboten. '
            + 'Liefere JETZT deinen Bericht als Text -- mit dem, was du bisher geprueft hast, '
            + 'und nenne ausdruecklich, was du deshalb NICHT mehr pruefen konntest.';
    } else if (ist70Prozent) {
        text += ' Du hast ueber 70% der Runden verbraucht. Fasse jetzt zusammen, was du bisher '
            + 'hast, statt weiter zu lesen -- die verbleibenden Runden reichen nur noch fuer das '
            + 'Noetigste.';
    }
    return text;
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
        const kosten = kostenSchaetzen(optionen.modell, promptTokenSumme, completionTokenSumme);
        console.log(kosten === null
            ? `Kosten unbekannt (Modell "${optionen.modell}" nicht in der Preistabelle)`
            : `Kosten geschaetzt: $${kosten.toFixed(4)}`);
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

        // Stufe (a)+(b)+(c): das Rundenbudget wird SICHTBAR, statt dass das
        // Modell blind weiterliest, bis das Limit hart zuschlaegt. Die
        // letzten zwei Runden sind der Riegel: KEINE tools mehr im Request
        // (siehe mitWerkzeugen in anfragen()), das Modell KANN dann nur noch
        // Text liefern.
        const istLetzteZweiRunden = (optionen.maxRunden - runde) <= 1;
        const ist70Prozent = runde >= Math.ceil(optionen.maxRunden * 0.7);
        const rundenHinweis = rundenHinweisBauen(runde, optionen.maxRunden, istLetzteZweiRunden, ist70Prozent);
        messages.push({ role: 'user', content: rundenHinweis });
        protokollSchreiben({ typ: 'rundenhinweis', runde, istLetzteZweiRunden, ist70Prozent, text: rundenHinweis });

        let antwort;
        try {
            antwort = await anfragen(schluessel, optionen.modell, messages, !istLetzteZweiRunden);
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
            // WICHTIG (Auftrag Teil 2): ein unter Rundendruck erzeugter
            // Bericht ist NICHT dasselbe wie ein regulaerer und muss als
            // solcher erkennbar sein -- sonst waere er schlimmer als der
            // ehrliche Abbruch von heute.
            console.log(istLetzteZweiRunden
                ? `\n[BERICHT UNTER RUNDENDRUCK -- erzwungen in Runde ${runde} von ${optionen.maxRunden}, Werkzeuge waren bereits abgeschaltet. NICHT als vollstaendige Pruefung werten.]`
                : '\n[Bericht regulaer erstellt, Rundenlimit nicht erreicht.]');
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

// Baustoff fuer die gestubbten OpenAI-Antworten im Selbsttest (Runden- und
// Kostenpruefungen unten) -- KEIN Netz, nur Datenstrukturen, die genau wie
// eine echte /v1/chat/completions-Antwort geformt sind.
function nachrichtWerkzeugaufrufBauen(id, funktionName, argumente) {
    return {
        role: 'assistant',
        content: null,
        tool_calls: [{ id, type: 'function', function: { name: funktionName, arguments: JSON.stringify(argumente) } }],
    };
}
function nachrichtTextBauen(text) {
    return { role: 'assistant', content: text, tool_calls: null };
}
function antwortKoerperBauen(nachricht, promptToken, completionToken) {
    return { choices: [{ message: nachricht }], usage: { prompt_tokens: promptToken, completion_tokens: completionToken } };
}

// Stub fuer https.request: KEIN Netz, keine echten Sockets. Beantwortet der
// Reihe nach aus "warteschlange" und zeichnet JEDEN tatsaechlich gebauten
// Anfragekoerper in "aufgezeichnet" auf (inkl. ob "tools" mitgeschickt
// wurde) -- die Rundenriegel-Pruefung unten prueft an DIESER Aufzeichnung,
// nicht an einer Behauptung im Text.
function httpsStubBauen(warteschlange, aufgezeichnet) {
    return function (_url, _optionen, callback) {
        const antwortHandler = {};
        const fakeAntwort = {
            statusCode: 200,
            on(ereignis, fn) { antwortHandler[ereignis] = fn; return this; },
        };
        return {
            on() { return this; },
            end(koerperJson) {
                aufgezeichnet.push(JSON.parse(koerperJson));
                const eintrag = warteschlange.shift();
                if (!eintrag) throw new Error('Selbsttest-Stub: keine weitere Antwort in der Warteschlange');
                process.nextTick(() => {
                    callback(fakeAntwort);
                    antwortHandler.data(Buffer.from(JSON.stringify(eintrag)));
                    antwortHandler.end();
                });
            },
            destroy() {},
        };
    };
}

async function selbsttest() {
    const ERWARTETE_FAELLE = 20;
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

        // ===== LAUF A: Rundenriegel und Rundenhinweis ueber 10 Runden =====
        // --max-runden=10 -> 70%-Schwelle ist Runde 7 (ceil(0.7*10)=7), die
        // letzten zwei Runden sind 9 und 10. Runden 1-8 rufen ein Werkzeug
        // auf (mit tools im Request), Runde 9 versucht es trotz fehlender
        // tools nochmal (der Code verarbeitet das dennoch -- der Riegel
        // sitzt am REQUEST, nicht an der Antwort), Runde 10 liefert Text.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetA = [];
            const ausgabeZeilenA = [];
            const warteschlangeA = [];
            for (let r = 1; r <= 9; r++) {
                warteschlangeA.push(antwortKoerperBauen(
                    nachrichtWerkzeugaufrufBauen(`call-${r}`, 'suche', { muster: 'Zeile' }),
                    100, 50,
                ));
            }
            warteschlangeA.push(antwortKoerperBauen(nachrichtTextBauen('TESTBERICHT-ENDE'), 100, 50));

            https.request = httpsStubBauen(warteschlangeA, aufgezeichnetA);
            console.log = (msg) => ausgabeZeilenA.push(String(msg));

            let codeA;
            try {
                codeA = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--wurzel=${klon}`,
                    '--modell=gpt-5.6-terra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-a.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen('LAUF A ABGESCHLOSSEN 9 (voller 10-Runden-Lauf mit Werkzeugaufrufen endet regulaer mit Exit 0)', codeA === 0);

            const werkzeugeVorhandenRunden1bis8 = aufgezeichnetA.slice(0, 8)
                .every((k) => Array.isArray(k.tools) && k.tools.length === WERKZEUGE.length);
            pruefen('RUNDENRIEGEL 10 (Runden 1-8 schicken "tools" tatsaechlich mit -- Positivkontrolle)', werkzeugeVorhandenRunden1bis8);

            const keineWerkzeugeLetzteZwei = !!aufgezeichnetA[8] && !!aufgezeichnetA[9]
                && aufgezeichnetA[8].tools === undefined && aufgezeichnetA[9].tools === undefined;
            pruefen('RUNDENRIEGEL 11 (Runden 9+10 -- die letzten zwei -- schicken KEIN "tools" mit, geprueft an der tatsaechlich gebauten Anfrage)', keineWerkzeugeLetzteZwei);

            const letzteNachricht = (koerper) => koerper && koerper.messages[koerper.messages.length - 1].content;
            const hinweisRunde3 = letzteNachricht(aufgezeichnetA[2]);
            pruefen(`RUNDENHINWEIS 12 (Runde 3 von 10 zeigt den schlichten Stand: "${hinweisRunde3}")`,
                hinweisRunde3 === '[Rundenstand: Runde 3 von 10 -- danach noch 7 moeglich.]');

            const hinweisRunde7 = letzteNachricht(aufgezeichnetA[6]);
            pruefen(`RUNDENHINWEIS 13 (Runde 7 von 10, ab 70% verbraucht, zeigt den deutlichen Hinweis: "${hinweisRunde7}")`,
                typeof hinweisRunde7 === 'string'
                && hinweisRunde7.startsWith('[Rundenstand: Runde 7 von 10 -- danach noch 3 moeglich.]')
                && hinweisRunde7.includes('70%'));

            const hinweisRunde9 = letzteNachricht(aufgezeichnetA[8]);
            pruefen(`RUNDENHINWEIS 14 (Runde 9 von 10, letzte zwei, zeigt die harte Aufforderung: "${hinweisRunde9}")`,
                typeof hinweisRunde9 === 'string'
                && hinweisRunde9.startsWith('[Rundenstand: Runde 9 von 10 -- danach noch 1 moeglich.]')
                && hinweisRunde9.includes('LETZTE RUNDE'));

            pruefen('BERICHTSKENNZEICHNUNG 15 (Bericht aus Runde 10 ist als "UNTER RUNDENDRUCK" markiert, nicht als regulaer)',
                ausgabeZeilenA.some((z) => z.includes('TESTBERICHT-ENDE'))
                && ausgabeZeilenA.some((z) => z.includes('BERICHT UNTER RUNDENDRUCK'))
                && !ausgabeZeilenA.some((z) => z.includes('Bericht regulaer erstellt')));

            pruefen('KOSTENZEILE 16 (voller Lauf mit bekanntem Modell druckt eine numerische Kostenzeile)',
                ausgabeZeilenA.some((z) => /^Kosten geschaetzt: \$\d/.test(z)));
        }

        // ===== LAUF B: Bericht WEIT vor dem Limit ist "regulaer" =====
        // Gegenprobe zu Fall 15: derselbe Kennzeichnungscode, aber Runde 1
        // von 10 liegt nicht in den letzten zwei Runden -- der Bericht muss
        // als regulaer markiert sein, NICHT als unter Rundendruck.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetB = [];
            const ausgabeZeilenB = [];
            const warteschlangeB = [antwortKoerperBauen(nachrichtTextBauen('TESTBERICHT-SOFORT'), 100, 50)];

            https.request = httpsStubBauen(warteschlangeB, aufgezeichnetB);
            console.log = (msg) => ausgabeZeilenB.push(String(msg));

            let codeB;
            try {
                codeB = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--wurzel=${klon}`,
                    '--modell=gpt-5.6-terra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-b.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen('BERICHTSKENNZEICHNUNG 17 (Bericht aus Runde 1 von 10 -- weit vor dem Limit -- ist als regulaer markiert, NICHT als unter Rundendruck)',
                codeB === 0
                && ausgabeZeilenB.some((z) => z.includes('Bericht regulaer erstellt'))
                && !ausgabeZeilenB.some((z) => z.includes('RUNDENDRUCK')));
        }

        // ===== KOSTENZEILE: reine Funktionspruefung, wörtlicher Erwartungswert =====
        {
            const kostenTerra = kostenSchaetzen('gpt-5.6-terra', 2_000_000, 500_000);
            // Woertlicher Erwartungswert, NICHT aus PREISTABELLE zurueckgerechnet:
            // 2 Mio Token rein * 2,50 $/Mio = 5,00 $; 0,5 Mio Token raus *
            // 15,00 $/Mio = 7,50 $; Summe 12,50 $.
            pruefen(`KOSTENFALL 18 (2 Mio rein / 0,5 Mio raus bei gpt-5.6-terra ergibt ${kostenTerra}, woertlicher Erwartungswert 12.5)`,
                kostenTerra === 12.5);
        }
        {
            const kostenUnbekannt = kostenSchaetzen('modell-unbekannt-xyz-imaginaer', 1000, 1000);
            pruefen('KOSTENFALL 19 (Modell ohne Preiseintrag liefert null aus kostenSchaetzen(), nicht 0)', kostenUnbekannt === null);
        }

        // ===== LAUF C: unbekanntes Modell im vollen Lauf =====
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetC = [];
            const ausgabeZeilenC = [];
            const warteschlangeC = [antwortKoerperBauen(nachrichtTextBauen('TESTBERICHT-UNBEKANNTES-MODELL'), 100, 50)];

            https.request = httpsStubBauen(warteschlangeC, aufgezeichnetC);
            console.log = (msg) => ausgabeZeilenC.push(String(msg));

            let codeC;
            try {
                codeC = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--wurzel=${klon}`,
                    '--modell=modell-unbekannt-xyz-imaginaer',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-c.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen('KOSTENZEILE 20 (voller Lauf mit unbekanntem Modell druckt "Kosten unbekannt", NIE 0,00 oder $0.00)',
                codeC === 0
                && ausgabeZeilenC.some((z) => z.includes('Kosten unbekannt (Modell "modell-unbekannt-xyz-imaginaer" nicht in der Preistabelle)'))
                && !ausgabeZeilenC.some((z) => /Kosten geschaetzt/.test(z)));
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
