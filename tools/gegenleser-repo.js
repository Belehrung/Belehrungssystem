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
// bevor es in die naechste Anfrage geht. Seit 13.09.2026 wird eine
// Trefferzeile dabei GESCHWAERZT (die ganze Zeile durch einen Marker
// ersetzt, bei PEM der ganze Block) und der Lauf geht weiter; der Bericht
// nennt am Ende jede geschwaerzte Stelle. SOFORT abgebrochen (Exit 3, ohne
// dass die Anfrage gesendet wird) wird nur noch, wenn bei lies() der Deckel
// reisst (mehr als 20 Zeilen, oder ab 8 Zeilen Ausschnitt mehr als 25 %) —
// oder wenn der EINGEGEBENE Diff ein Geheimnis enthaelt, siehe main().
//
// AUFRUF:
//   node tools/gegenleser-repo.js <diff.txt> --brief=<auftrag.txt>
//                                 [--wurzel=/pfad/zum/repo]
//                                 [--modell=gpt-6-astra] [--max-runden=25]
//                                 [--protokoll=/pfad.jsonl]
//   node tools/gegenleser-repo.js --selbsttest   (prueft die Riegel, OHNE Netz)
//
// --brief=<datei> ist PFLICHT (seit 12.09.2026, siehe BRIEF_KOPF-Kommentar
// weiter unten): sie liefert den beitragsspezifischen Teil des Auftrags.
// Fehlt sie, bricht das Werkzeug mit Exit 6 ab, statt still gegen einen
// mitgelieferten Standardauftrag zu pruefen.
//
// EXIT-CODES: 0 fertig, 2 kein Schluessel/falscher Aufruf, 3 Geheimnis-Riegel
// hat angeschlagen, 4 Runden- oder Mengenlimit erreicht (Bericht
// UNVOLLSTAENDIG), 5 das Modell hat am Ende keinen Text geliefert, 6 kein
// --brief angegeben oder die Datei ist leer/unlesbar, 1 sonstiger Fehler.

const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { pruefeGeheimnisse, entferneGeheimnisse, zeileEntferntMarker } = require('./geheimnis-riegel');

const ENDPUNKT = 'https://api.openai.com/v1/responses';
// Bis 10.09.2026 stand hier /v1/chat/completions mit gpt-5.5 als Vorgabe --
// GEMESSEN als Sackgasse fuer die staerkeren Stufen: gpt-5.6-sol und
// gpt-6-astra melden ueber /v1/chat/completions mit "tools" im Request
// woertlich "Function tools with reasoning_effort are not supported for
// <modell> in /v1/chat/completions. To use function tools, use /v1/responses
// or set reasoning_effort to 'none'." Der angebotene Ausweg reasoning_effort:
// 'none' ist fuer gpt-6-astra selbst eine Sackgasse -- die Herstellerdoku
// nennt 'none' ausdruecklich als von Astra NICHT unterstuetzte Stufe.
//
// UMGEBAUT auf /v1/responses am 12.09.2026, GEMESSEN gegen das echte Konto
// (nicht angenommen): mit "tools" im Request kommt bei gpt-6-astra ein
// output[]-Eintrag {type:"function_call", name, arguments, call_id} zurueck
// -- Funktionsaufrufe funktionieren also, wo /v1/chat/completions ablehnte.
// Unterschiede zum alten Endpunkt, alle an der echten Antwort abgelesen:
//   - "messages" heisst hier "input" (Liste von Objekten mit role/content;
//     bereits gelieferte output[]-Elemente gehen unveraendert zurueck).
//   - Werkzeuge werden FLACH uebergeben: {type:"function", name,
//     description, parameters} -- kein "function"-Unterobjekt mehr.
//   - Ein Funktionsaufruf traegt sein eigenes "id" (Item-ID, z. B. "fc_..."),
//     ZUSAETZLICH ein "call_id" (z. B. "call_..."). Das Werkzeugergebnis geht
//     als {type:"function_call_output", call_id, output} zurueck -- an das
//     call_id, nicht an das id.
//   - Ein Textbericht steckt in einem output[]-Eintrag {type:"message",
//     role:"assistant", content:[{type:"output_text", text}]}, nicht mehr in
//     choices[0].message.content.
//   - "max_completion_tokens" heisst "max_output_tokens" (gemessen: wird
//     angenommen und im Antwort-Objekt gespiegelt).
//   - usage traegt "input_tokens"/"output_tokens" statt "prompt_tokens"/
//     "completion_tokens" (gemessen, siehe kostenSchaetzen()-Aufrufer unten).
//   - temperature/top_p/top_logprobs: diese Datei hat nie eines der drei
//     gesendet (nachgesehen) -- nichts zu entfernen, nur festgehalten, damit
//     es nicht versehentlich nachgezogen wird.
//
// LEHRE, damit der Fehler von damals nicht wiederkommt: eine Ein-Wort-Anfrage
// OHNE Werkzeuge beweist NICHT, dass ein Modell auf dem echten Weg
// funktioniert -- die Messung oben lief ausdruecklich MIT "tools" im Request
// und mit einem echten, mehrrundigen Aufruf inklusive zurueckgeschicktem
// Funktionsergebnis.
//
// --modell= bleibt der Schalter zum Vergleichen -- aber NUR gpt-6-astra ist
// auf DIESEM Endpunkt gemessen. Ein anderes Modell (z. B. das bisherige
// gpt-5.5) laeuft hier ungeprueft; vor Verlass darauf erst messen, nicht
// annehmen, dass /v1/responses fuer jede Stufe gleich funktioniert.
const VORGABE_MODELL = 'gpt-6-astra';
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

// BRIEF_KOPF und PRUEFPUNKTE_ALLGEMEIN sind der FESTE Teil des Auftrags, der
// fuer JEDEN Beitrag dieses Systems gilt. Der beitragsspezifische Teil (bis
// 10.09.2026 hier als Absatz "Der Zweig baut ein neues Feld ..." fest
// eingebaut) kommt seit dem 12.09.2026 NICHT MEHR aus dieser Datei, sondern
// ausschliesslich aus der per --brief=<datei> uebergebenen Datei -- siehe
// main(). ANLASS (gemessen, siehe --brief-Pruefung in main()): ein Lauf mit
// einem FREMDEN Diff (OWASP-Haertung: Host-Pruefung, PIN-Reset-Drossel,
// execFile) gegen den bis dahin fest eingebauten frist_herkunft-Auftrag
// lieferte EXIT 0 und 213 Zeilen formal tadellosen Bericht -- ueber Felder
// (`frist_herkunft`, `hersteller_intervall_monate`) und eine Datei
// (routes/admin/geraete.js), die der Diff gar nicht anfasste. Zwei Befunde
// waren als "blockierend" ausgewiesen. Ein Werkzeug, das das falsche prueft,
// ist schlimmer als keines -- deshalb bricht main() OHNE --brief jetzt LAUT
// ab, statt still gegen einen mitgelieferten Standardauftrag zu pruefen.
//
// Die vormaligen Punkte 3 ("DER SCHREIBWEG") und 4 ("DIE BEDINGUNG DES
// HINWEISES") waren beitragsspezifisch (frist_herkunft) und sind mit dem
// entfernten Absatz ebenfalls hier herausgeflogen -- sie gehoeren kuenftig in
// die jeweilige Brief-Datei. Die verbliebenen vier Punkte sind nur
// umnummeriert (vormals 1, 2, 5, 6), am Wortlaut unveraendert; ihr Ursprung
// bleibt derselbe wie vorher: woertlich aus /tmp/claude-0/codereview.py
// uebernommen (Auftrag Teil B) — der dortige Sechs-Punkte-Auftrag ist erprobt
// (siehe tools/zweitmeinung.js-Kopf).
const BRIEF_KOPF = "Du bist unabhängiger Code-Gegenleser für ein Node.js/PostgreSQL-System\n(GymDocu, Arbeitsschutz-Dokumentation für Fitnessstudios). Unten stehen ZWEI\nAbschnitte: zuerst der beitragsspezifische Auftrag, danach ein Diff.\n\n";

const PRUEFPUNKTE_ALLGEMEIN = "PRÜFE ZUSÄTZLICH IMMER IN DIESER REIHENFOLGE — und melde zu jedem Punkt auch,\nwenn du nichts gefunden hast:\n\n1. ZUSICHERUNGEN, DIE NICHT FEHLSCHLAGEN KÖNNEN. Für jede Zusicherung in der\n   Testdatei: welche EINE Zeile müsste man ändern, damit genau sie fällt? Bezieht\n   eine ihren Sollwert aus dem, was sie bewachen soll (z. B. Vergleich gegen\n   dieselbe Konstante auf beiden Seiten, oder eine Vergleichsmenge, die aus\n   derselben Schleife gefüllt wird, die geprüft wird)? Gibt es eine Sollzahl, und\n   ist sie ein von Hand eingetragenes Literal? Erzwingt der Vorzustand das\n   erwartete Ergebnis ohnehin?\n\n2. ZEITZONEN. Ein Date aus lokalen Werten gebaut (`new Date(j,m,t)`, `setDate`,\n   `setMonth`) und dann über `toISOString()` gelesen, ergibt den UTC-Kalendertag —\n   östlich von UTC oft den Vortag. Richtig wären `formatBerlinDate()` bzw.\n   `plusMonate()`/`plusTage()` aus `core/datum.js`. WICHTIG: unter UTC liefert\n   dieser Fehler zufällig das richtige Ergebnis, der CI-Runner läuft auf UTC.\n   Suche nach der KOMBINATION, nicht nach `toISOString` allein.\n\n3. FEHLERBEHANDLUNG. Ein DB-Fehler in einem Teilschritt darf nicht die ganze\n   Seite reissen. Ein verschluckter Fehler, der als \"alles in Ordnung\"\n   durchgeht, ist schlimmer als ein lauter Abbruch.\n\n4. SQL. Trägt jede Abfrage den Mandantenbezug (`studio_id`)? Ist die Migration\n   idempotent? Passt sie zum Schema?\n\nMELDE je Befund: Datei und Zeile aus dem Diff, die betroffene Zeichenkette\nwörtlich, was falsch ist, und die Schwere (blockierend / sollte behoben werden /\nAnmerkung). Erfinde nichts; wo du etwas nicht aus dem Diff entscheiden kannst,\nsag das ausdrücklich. Antworte auf Deutsch.\n";

// Genau dieser eine Absatz (Auftrag Teil B), der den Sinn dieses Werkzeugs
// gegenueber tools/zweitmeinung.js ausmacht: es DARF nachsehen.
const WERKZEUG_ABSATZ = "DU HAST WERKZEUGE. Behaupte nichts, was du nachsehen kannst, und schreibe\nNIEMALS \"aus dem Diff nicht ersichtlich\" oder \"falls künftig\" — sieh\nstattdessen nach. Prüfe insbesondere: werden die neuen Spalten in der\nSELECT-Abfrage der betroffenen Seiten überhaupt ausgewählt? Wie werden die\nWerte beim Schreiben normalisiert? Gibt es weitere Schreibwege ausserhalb\ndes Diffs? Bevor du einen Befund meldest, sieh dir die tragende Stelle im\nOriginal an und zitiere sie mit Datei und Zeilennummer. Ein Befund ohne\nnachgesehene Fundstelle ist keiner.\n\nDu darfst und sollst MEHRERE Werkzeugaufrufe in EINER Antwort buendeln, wenn sie\nvoneinander unabhaengig sind — das spart Runden, und die Rundenzahl ist begrenzt.";

// Baut den vollstaendigen Auftragstext aus dem beitragsspezifischen
// Brief-Inhalt (--brief=<datei>, siehe main()) und dem festen Teil zusammen.
// KEIN eingebauter Standardauftrag -- briefInhalt kommt IMMER vom Aufrufer.
function auftragstextBauen(briefInhalt) {
    return BRIEF_KOPF + briefInhalt.trim() + '\n\n' + PRUEFPUNKTE_ALLGEMEIN + '\n' + WERKZEUG_ABSATZ;
}

// FLACH, ohne "function"-Unterobjekt -- so verlangt es /v1/responses (siehe
// Endpunkt-Umbau oben, gemessen 12.09.2026: mit dieser Form kommt ein
// output[]-Eintrag vom Typ "function_call" zurueck, mit "function"-Huelle
// lehnt die API ab). fuer /v1/chat/completions waere die verschachtelte Form
// noetig gewesen -- dieses Werkzeug spricht nur noch /v1/responses.
const WERKZEUGE = [
    {
        type: 'function',
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
    {
        type: 'function',
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
    const geschwaerzt = [];
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
            // Seit 13.09.2026 wird die Zeile GESCHWAERZT statt der Lauf
            // abgebrochen (Anlass im Kopf von tools/geheimnis-riegel.js). Der
            // Marker bleibt an ihrer Stelle, sie wird NICHT still weggelassen:
            // das Modell soll sehen, dass es dort einen Treffer gab, den es
            // nicht bekommt. Die ganze Zeile, nie nur der Trefferbereich.
            // KEIN Deckel wie bei lies() (Entscheidung 13.09.2026): jede
            // Trefferzeile wird einzeln und vollstaendig ersetzt, es geht
            // nichts hinaus, und MAX_SUCHE_ZEILEN begrenzt die Ausgabe
            // ohnehin. Achtzig Marker sind nutzlos, aber nicht gefaehrlich —
            // ein Abbruch waere schlechter als eine nutzlose Antwort.
            // BENANNTE GRENZE, nicht gebaut: der Riegel prueft nur die
            // Trefferzeile. Ein Suchmuster, das die Base64-Zeilen eines
            // PEM-Koerpers trifft (etwa "MII"), liefert Schluesselmaterial
            // ohne BEGIN-Zeile — das trifft kein Muster. Vorbestehend;
            // .pem/.key sind ueber istHartGesperrt() ohnehin gesperrt, es
            // betraefe nur versehentlich in .js eingebettete Schluessel.
            const geheim = pruefeGeheimnisse(zeilen[i]);
            if (!geheim.sauber) {
                const name = geheim.treffer.map((t) => t.name).join(', ');
                geschwaerzt.push({ pfad: relPfad, zeile: i + 1, name });
                treffer.push(`${relPfad}:${i + 1}:${zeileEntferntMarker(name)}`);
                continue;
            }
            treffer.push(`${relPfad}:${i + 1}:${zeilen[i]}`);
        }
    }
    let text = treffer.length ? treffer.join('\n') : '(keine Treffer)';
    if (gesamtTreffer > MAX_SUCHE_ZEILEN) {
        text += `\n\n[GEKUERZT: ${gesamtTreffer} Treffer insgesamt, nur die ersten ${MAX_SUCHE_ZEILEN} gezeigt]`;
    }
    return { text, abgelehnt: false, geschwaerzt };
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
    // Schwaerzen statt abbrechen (13.09.2026, Anlass im Kopf von
    // tools/geheimnis-riegel.js): Trefferzeilen werden durch den Marker
    // ersetzt, ein PEM-Block als Ganzes, der Lauf geht weiter. Nur wenn der
    // Deckel reisst (zu viele Zeilen oder zu grosser Anteil), bleibt es beim
    // bisherigen Abbruch — dann ist der Ausschnitt fuer eine Pruefung ohnehin
    // wertlos und die Datei mutmasslich eine Geheimnisdatei.
    const bereinigt = entferneGeheimnisse(ausschnittZeilen.join('\n'));
    if (bereinigt.zuViel) {
        const namen = [...new Set(bereinigt.entfernt.map((e) => e.name))].map((name) => ({ name }));
        throw new GeheimnisAbbruch(namen, `${pruefung.relativ} (${bereinigt.entfernt.length} von ${ausschnittZeilen.length} Zeilen)`);
    }
    // Zeilennummern auf die Datei umgerechnet, damit der Bericht am Ende die
    // blinde Stelle so nennt, wie man sie in der Datei wiederfindet.
    const geschwaerzt = bereinigt.entfernt.map((e) => ({ pfad: pruefung.relativ, zeile: gvon + e.zeile - 1, name: e.name }));

    const formatiert = bereinigt.text.split('\n').map((z, i) => `${gvon + i}:${z}`).join('\n');
    const kopf = hinweise.length ? `[${hinweise.join('; ')}]\n` : '';
    return {
        text: `${kopf}${pruefung.relativ} (Zeilen ${gvon}-${ende} von ${gesamt}):\n${formatiert}`,
        abgelehnt: false,
        relativ: pruefung.relativ,
        von: gvon,
        bis: ende,
        geschwaerzt,
    };
}

// mitWerkzeugen=false ist der harte Riegel der letzten zwei Runden (Auftrag
// Teil 2c): OHNE "tools" im Request KANN das Modell keine Funktion mehr
// aufrufen, nur noch Text liefern. Vorgabe true, damit ein Aufrufer, der den
// Parameter vergisst, nicht versehentlich den Riegel auf JEDE Runde legt.
function anfragen(schluessel, modell, verlauf, mitWerkzeugen = true) {
    const koerper = JSON.stringify({
        model: modell,
        input: verlauf,
        ...(mitWerkzeugen ? { tools: WERKZEUGE } : {}),
        max_output_tokens: MAX_ANTWORT_TOKEN,
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
// Authorization-Header) — nur die input[]-Elemente (frueher messages[]) und
// Zaehl-Metadaten laufen hier durch, der Header wird nirgends an diese
// Funktion uebergeben.
let protokollPfadAktuell = null;
function protokollSchreiben(eintrag) {
    if (!protokollPfadAktuell) return;
    fs.appendFileSync(protokollPfadAktuell, JSON.stringify({ zeit: new Date().toISOString(), ...eintrag }) + '\n');
}

function konsoleUsage() {
    console.error('Aufruf: node tools/gegenleser-repo.js <diff.txt> --brief=<auftrag.txt>');
    console.error('        [--wurzel=/pfad/zum/repo] [--modell=gpt-6-astra] [--max-runden=25]');
    console.error('        [--protokoll=/pfad.jsonl]');
    console.error('        node tools/gegenleser-repo.js --selbsttest');
    console.error('--brief ist PFLICHT: liefert den beitragsspezifischen Teil des Auftrags,');
    console.error('kein eingebauter Standardauftrag mehr (siehe Dateikopf).');
}

function argumenteLesen(argv) {
    const optionen = {
        diffPfad: null,
        briefPfad: null,
        wurzel: process.cwd(),
        modell: VORGABE_MODELL,
        maxRunden: VORGABE_MAX_RUNDEN,
        protokollPfad: null,
    };
    for (const a of argv) {
        if (a.startsWith('--wurzel=')) { optionen.wurzel = a.slice('--wurzel='.length); continue; }
        if (a.startsWith('--brief=')) { optionen.briefPfad = a.slice('--brief='.length); continue; }
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

// Liest den Text eines Berichts aus output[] heraus (/v1/responses): der
// Endtext steckt in einem oder mehreren Eintraegen {type:"message",
// role:"assistant", content:[{type:"output_text", text}]} -- gemessen am
// echten Konto 12.09.2026 (siehe Endpunkt-Kommentar oben), NICHT mehr in
// choices[0].message.content wie bei /v1/chat/completions.
function textAusAusgabe(ausgabeElemente) {
    const teile = [];
    for (const element of ausgabeElemente) {
        if (element.type !== 'message' || element.role !== 'assistant' || !Array.isArray(element.content)) continue;
        for (const teil of element.content) {
            if (teil.type === 'output_text' && typeof teil.text === 'string') teile.push(teil.text);
        }
    }
    return teile.join('\n');
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

    // --brief ist PFLICHT (Defekt 2, behoben 12.09.2026, siehe BRIEF_KOPF-
    // Kommentar): OHNE ihn haette dieses Werkzeug keinen beitragsspezifischen
    // Auftrag mehr und wuerde entweder gar nichts oder -- schlimmer -- still
    // gegen etwas Falsches pruefen. Deshalb laut abbrechen, BEVOR ein
    // Schluessel gebraucht wird (Selbsttest-Grenzfall: ohne Schluessel und
    // ohne Netz prüfbar).
    if (!optionen.briefPfad) {
        console.error('ABBRUCH: Kein --brief=<datei> angegeben. Dieses Werkzeug hat KEINEN\n'
            + 'eingebauten Standardauftrag mehr -- ohne Brief wuerde es entweder gar nicht oder,\n'
            + 'schlimmer, gegen den FALSCHEN Beitrag pruefen und dabei einen formal sauberen,\n'
            + 'inhaltlich falschen Bericht liefern (gemessener Fall: ein OWASP-Diff gegen den\n'
            + 'frist_herkunft-Auftrag lieferte EXIT 0 und 213 Zeilen Bericht ueber Code, den der\n'
            + 'Diff nie anfasste). Ausweg: --brief=<pfad-zur-briefdatei> mit dem\n'
            + 'beitragsspezifischen Teil des Auftrags.');
        return 6;
    }
    let briefInhalt;
    try {
        briefInhalt = fs.readFileSync(optionen.briefPfad, 'utf8');
    } catch (e) {
        console.error(`ABBRUCH: --brief=${optionen.briefPfad} konnte nicht gelesen werden (${e.message}).`);
        return 6;
    }
    if (!briefInhalt.trim()) {
        console.error(`ABBRUCH: --brief=${optionen.briefPfad} ist leer -- das waere derselbe stille Fehlschlag wie ein fehlender Brief.`);
        return 6;
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
    // BEWUSST weiterhin ein ABBRUCH, nicht Schwaerzen wie bei suche()/lies():
    // den Diff liefert der Auftraggeber. Steht darin ein Geheimnis, ist das
    // SEIN Fehler, und er muss ihn sehen, statt ihn stillschweigend
    // geschwaerzt zu bekommen. Bei Dateien, die das Modell selbst auswaehlt,
    // ist es anders — dort ist der Fehlalarm der Normalfall (13.09.2026).
    const diffPruefung = pruefeGeheimnisse(diffInhalt);
    if (!diffPruefung.sauber) {
        console.error('ABBRUCH: Der Diff enthaelt etwas, das wie ein Geheimnis aussieht — '
            + diffPruefung.treffer.map((t) => t.name).join(', ') + '.');
        console.error('Es wurde NICHTS gesendet.');
        return 3;
    }

    const auftragstext = auftragstextBauen(briefInhalt);
    const verlauf = [{
        role: 'user',
        content: auftragstext + '\n\n########## DIFF ##########\n\n' + diffInhalt,
    }];
    protokollSchreiben({ typ: 'start', element: verlauf[0] });

    let runde = 0;
    let sucheAnzahl = 0;
    let liesAnzahl = 0;
    let ablehnungenAnzahl = 0;
    let ausgabeBytes = 0;
    let promptTokenSumme = 0;
    let completionTokenSumme = 0;
    const gelesenePfade = [];
    const geschwaerzteStellen = [];

    const zusammenfassungAusgeben = () => {
        console.log('\n---');
        console.log('GELESENE DATEIEN:');
        if (gelesenePfade.length === 0) {
            console.log('  (keine)');
        } else {
            for (const g of gelesenePfade) console.log(`  ${g.pfad}:${g.von}-${g.bis}`);
        }
        // Wo geschwaerzt wurde, war die Pruefung blind. Eine verschwiegene
        // Luecke ist schlimmer als eine benannte — der Leser muss wissen,
        // welche Zeilen der Pruefer NICHT gesehen hat.
        console.log('GESCHWAERZTE STELLEN (Geheimnis-Riegel; dort war die Pruefung blind):');
        if (geschwaerzteStellen.length === 0) {
            console.log('  (keine)');
        } else {
            for (const st of geschwaerzteStellen) console.log(`  ${st.pfad}:${st.zeile} (${st.name})`);
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
        verlauf.push({ role: 'user', content: rundenHinweis });
        protokollSchreiben({ typ: 'rundenhinweis', runde, istLetzteZweiRunden, ist70Prozent, text: rundenHinweis });

        let antwort;
        try {
            antwort = await anfragen(schluessel, optionen.modell, verlauf, !istLetzteZweiRunden);
        } catch (e) {
            console.error(`FEHLER bei der Anfrage: ${e.message}`);
            zusammenfassungAusgeben();
            throw e;
        }
        // Feldnamen gemessen am echten Konto 12.09.2026 (siehe Endpunkt-
        // Kommentar oben): usage traegt input_tokens/output_tokens, nicht
        // mehr prompt_tokens/completion_tokens.
        const verbrauch = antwort.usage || {};
        promptTokenSumme += verbrauch.input_tokens || 0;
        completionTokenSumme += verbrauch.output_tokens || 0;
        const ausgabeElemente = antwort.output || [];
        protokollSchreiben({ typ: 'antwort', runde, ausgabe: ausgabeElemente, verbrauch });
        // Alle zurueckgegebenen output[]-Elemente unveraendert an den Verlauf
        // anhaengen (Nachrichten UND Funktionsaufrufe) -- /v1/responses ist
        // zustandslos ohne previous_response_id, die naechste Anfrage muss
        // die volle bisherige Historie erneut mitschicken.
        verlauf.push(...ausgabeElemente);

        const funktionsaufrufe = ausgabeElemente.filter((element) => element.type === 'function_call');

        if (funktionsaufrufe.length === 0) {
            const text = textAusAusgabe(ausgabeElemente);
            if (!text || !text.trim()) {
                console.error('ABBRUCH: Das Modell hat am Ende keinen Text geliefert — kein sauberes Ergebnis.');
                zusammenfassungAusgeben();
                return 5;
            }
            console.log(text);
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

        for (const aufruf of funktionsaufrufe) {
            let ergebnis;
            try {
                let werkzeugArgumente;
                try {
                    werkzeugArgumente = JSON.parse(aufruf.arguments || '{}');
                } catch (e) {
                    ergebnis = { text: `abgelehnt: ungueltige Argumente (${e.message})`, abgelehnt: true };
                }
                if (!ergebnis) {
                    if (aufruf.name === 'suche') sucheAnzahl++;
                    else if (aufruf.name === 'lies') liesAnzahl++;
                    ergebnis = werkzeugAufrufen(aufruf.name, werkzeugArgumente);
                    if (ergebnis.relativ) gelesenePfade.push({ pfad: ergebnis.relativ, von: ergebnis.von, bis: ergebnis.bis });
                    if (ergebnis.geschwaerzt && ergebnis.geschwaerzt.length) {
                        geschwaerzteStellen.push(...ergebnis.geschwaerzt);
                        protokollSchreiben({ typ: 'geheimnis_geschwaerzt', runde, werkzeug: aufruf.name, stellen: ergebnis.geschwaerzt });
                    }
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

            // Das Werkzeugergebnis geht mit demselben call_id zurueck, NICHT
            // mit der Item-id des Funktionsaufrufs (gemessen 12.09.2026,
            // siehe Endpunkt-Kommentar oben).
            protokollSchreiben({ typ: 'funktionsantwort', runde, werkzeug: aufruf.name, call_id: aufruf.call_id, text: ergebnis.text });
            verlauf.push({ type: 'function_call_output', call_id: aufruf.call_id, output: ergebnis.text });
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
// eine echte /v1/responses-Antwort geformt sind (Form am echten Konto
// gemessen 12.09.2026, siehe Endpunkt-Kommentar am Dateikopf).
function elementFunktionsaufrufBauen(callId, funktionName, argumente) {
    return { id: `fc-${callId}`, type: 'function_call', status: 'completed', call_id: callId, name: funktionName, arguments: JSON.stringify(argumente) };
}
function elementTextBauen(text) {
    return { id: 'msg-selbsttest', type: 'message', status: 'completed', role: 'assistant', content: [{ type: 'output_text', text }] };
}
function antwortKoerperBauen(ausgabeElement, inputToken, outputToken) {
    return { output: [ausgabeElement], usage: { input_tokens: inputToken, output_tokens: outputToken } };
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
    const ERWARTETE_FAELLE = 35;
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

        // ===== Fixtures fuer "schwaerzen statt abbrechen" (13.09.2026) =====
        // Alle Geheimnis-Attrappen zusammengesetzt, kein Literal (s. o.). Jede
        // Datei hat 5 harmlose Zeilen vor und nach dem Treffer, damit EINE
        // Trefferzeile (1 von 11) unter dem 25-%-Deckel bleibt; "ankerSuche"
        // ist das Suchwort fuer den suche()-Fall und kommt im Geheimnis selbst
        // nicht vor. Gemessen wird unten an FRAGMENTEN der Werte (20 Zeichen),
        // nicht nur am ganzen Wert: eine Teil-Schwaerzung fiele sonst durch.
        const fuellzeilen = (von, bis) => Array.from({ length: bis - von + 1 }, (_, k) => `// Zeile ${von + k}`);
        const mitGeheimnisInZeile6 = (geheimZeile) => [...fuellzeilen(1, 5), geheimZeile, ...fuellzeilen(7, 11)].join('\n') + '\n';
        const openaiWert = 'sk' + '-proj-' + 'E'.repeat(40);
        const githubWert = 'gh' + 'p_' + 'F'.repeat(36);
        const telegramWert = '987654321:' + 'G'.repeat(35);
        const pemMaterial = ['MIIE' + 'H'.repeat(60), 'AAAA' + 'I'.repeat(60), 'BBBB' + 'J'.repeat(60)];
        // Woertlich die Zeile aus core/db.js:71 im GymDocu-Repo, die am
        // 13.09.2026 den Fehlalarm ausgeloest hat — ein Platzhalter, kein
        // Geheimnis.
        const platzhalterZeile = '        "  DATABASE_URL=postgresql://gymdocu:PASSWORT@127.0.0.1:5432/gymdocu\\n" +';
        const fragmente = ['E'.repeat(20), 'F'.repeat(20), 'G'.repeat(20), 'H'.repeat(20), 'I'.repeat(20), 'J'.repeat(20), 'gymdocu:PASSWORT@'];
        const vorkommen = (text, fragment) => text.split(fragment).length - 1;
        const fragmentVorkommen = (text) => fragmente.reduce((summe, f) => summe + vorkommen(text, f), 0);
        fs.writeFileSync(path.join(klon, 'schwaerzen-openai.js'), mitGeheimnisInZeile6(`const ankerSuche = "${openaiWert}";`));
        fs.writeFileSync(path.join(klon, 'schwaerzen-github.js'), mitGeheimnisInZeile6(`const ankerSuche = "${githubWert}";`));
        fs.writeFileSync(path.join(klon, 'schwaerzen-telegram.js'), mitGeheimnisInZeile6(`const ankerSuche = "${telegramWert}";`));
        fs.writeFileSync(path.join(klon, 'schwaerzen-platzhalter.js'), mitGeheimnisInZeile6(platzhalterZeile));
        // PEM: Block in Zeilen 11-15, Material in 12-14, 25 Zeilen gesamt.
        fs.writeFileSync(path.join(klon, 'schwaerzen-pem.txt'),
            [...fuellzeilen(1, 10), '-----BEGIN PRIVATE KEY-----', ...pemMaterial, '-----END PRIVATE KEY-----', ...fuellzeilen(16, 25)].join('\n') + '\n');
        // 30 Geheimniszeilen unter 10 harmlosen: reisst den Zeilen-Deckel.
        fs.writeFileSync(path.join(klon, 'schwaerzen-viele.js'),
            [...fuellzeilen(1, 10), ...Array.from({ length: 30 }, (_, k) => `token${k} = "` + 'gh' + 'p_' + 'N'.repeat(36) + '";')].join('\n') + '\n');
        // 3 Geheimniszeilen unter 8: reisst den Anteils-Deckel (37,5 %), nicht
        // den absoluten — Gegenstueck zu schwaerzen-viele.js.
        fs.writeFileSync(path.join(klon, 'schwaerzen-anteil.js'),
            [...fuellzeilen(1, 8)].map((z, k) => ([1, 4, 7].includes(k) ? `t${k} = "` + 'gh' + 'p_' + 'U'.repeat(36) + '";' : z)).join('\n') + '\n');
        // Eingegebener Diff mit Geheimnis — NICHT committet, der Diff kommt
        // ohnehin vom Auftraggeber und nicht aus der Erlaubnisliste.
        const diffMitGeheimnisPfad = path.join(klon, 'diff-mit-geheimnis.txt');
        fs.writeFileSync(diffMitGeheimnisPfad, `+const token = "${telegramWert}";\n`);

        execFileSync('git', ['add', 'harmlos.txt', '.env.beispiel', 'zeiger_auf_etc', 'geheim.js',
            'schwaerzen-openai.js', 'schwaerzen-github.js', 'schwaerzen-telegram.js', 'schwaerzen-platzhalter.js',
            'schwaerzen-pem.txt', 'schwaerzen-viele.js', 'schwaerzen-anteil.js'], { cwd: klon });
        execFileSync('git', ['commit', '-q', '-m', 'Testdaten'], { cwd: klon });

        // Brief-Fixture fuer die main()-Aufrufe unten (Defekt 2, 12.09.2026):
        // --brief ist jetzt PFLICHT, kein main()-Lauf im Selbsttest kommt
        // ohne sie ueber den neuen Abbruch hinaus. Liegt AUSSERHALB der
        // Erlaubnisliste des Klons (wie ein echter Aufrufer die Brief-Datei
        // auch von ausserhalb des Repos uebergeben wuerde) -- absichtlich
        // nicht ueber pfadPruefen() geprueft, siehe main().
        const briefFixturePfad = path.join(klon, 'brief-selbsttest.txt');
        fs.writeFileSync(briefFixturePfad, 'Selbsttest-Auftrag: nichts Beitragsspezifisches, nur die Mechanik pruefen.\n');

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
            // Bis 13.09.2026 brach dieser Fall ab ("ein Treffer"). Nach dem
            // Umbau riss er kurz den Anteils-Deckel (1 von 1 = 100 %) — genau
            // der Fehlalarm bei engen Fenstern, den die Nacharbeit beseitigt:
            // unter MIN_ZEILEN_FUER_ANTEIL zaehlt nur der absolute Deckel. Ein
            // Ausschnitt, der ganz aus einem Marker besteht, ist harmlos.
            let r;
            let abbruch = null;
            try {
                r = werkzeugLies('geheim.js', 1, 1);
            } catch (e) {
                abbruch = e;
            }
            const anzahl = r ? vorkommen(r.text, 'D'.repeat(20)) : -1;
            pruefen(`RIEGELFALL 7 (geheim.js besteht NUR aus einer Geheimniszeile: 1 von 1 ist KEIN Abbruch mehr, Funktionsergebnis ist genau der Marker, Fragment kommt ${anzahl}x vor${abbruch ? ` — ABER: ${abbruch.message}` : ''})`,
                !abbruch && anzahl === 0
                && r.text === `geheim.js (Zeilen 1-1 von 1):\n1:${zeileEntferntMarker('OpenAI-Schlüssel')}`
                && r.geschwaerzt.length === 1 && r.geschwaerzt[0].zeile === 1);
        }

        // ===== SCHWAERZEN STATT ABBRECHEN (13.09.2026), Faelle 22-35 =====
        // Gemessen wird an dem, was WIRKLICH RAUSGEHT: am .text des
        // Funktionsergebnisses (22-30) und in LAUF D an den tatsaechlich
        // gebauten Anfragekoerpern (32-34) — nicht am Rueckgabewert von
        // entferneGeheimnisse() allein.
        const liesFallPruefen = (nr, datei, fragment, name) => {
            let r;
            let abbruch = null;
            try {
                r = werkzeugLies(datei, 1, 11);
            } catch (e) {
                abbruch = e;
            }
            const anzahl = r ? vorkommen(r.text, fragment) : -1;
            pruefen(`SCHWAERZEN ${nr} (${name} in ${datei}: Zeile 6 durch Marker ersetzt, Fragment kommt im Funktionsergebnis ${anzahl}x vor, Zeilen 5 und 7 bleiben, kein Abbruch${abbruch ? ` — ABER: ${abbruch.message}` : ''})`,
                !abbruch && anzahl === 0
                && r.text.includes(`\n6:${zeileEntferntMarker(name)}\n`)
                && r.text.includes('\n5:// Zeile 5\n') && r.text.includes('\n7:// Zeile 7\n')
                && r.geschwaerzt.length === 1 && r.geschwaerzt[0].zeile === 6 && r.geschwaerzt[0].pfad === datei);
        };
        liesFallPruefen(22, 'schwaerzen-openai.js', 'E'.repeat(20), 'OpenAI-Schlüssel');
        liesFallPruefen(23, 'schwaerzen-github.js', 'F'.repeat(20), 'GitHub-Token');
        liesFallPruefen(24, 'schwaerzen-telegram.js', 'G'.repeat(20), 'Telegram-Bot-Token');
        {
            let r;
            let abbruch = null;
            try {
                r = werkzeugLies('schwaerzen-pem.txt', 1, 25);
            } catch (e) {
                abbruch = e;
            }
            const anzahl = r ? fragmentVorkommen(r.text) : -1;
            const marker = zeileEntferntMarker('privater Schlüssel (PEM)');
            pruefen(`SCHWAERZEN 25 (PEM-Block ueber 5 Zeilen: ALLE Zeilen 11-15 durch Marker ersetzt, Material aus 12-14 kommt ${anzahl}x vor, Zeilen 10 und 16 bleiben, kein Abbruch${abbruch ? ` — ABER: ${abbruch.message}` : ''})`,
                !abbruch && anzahl === 0
                && !r.text.includes('BEGIN PRIVATE') && !r.text.includes('END PRIVATE')
                && [11, 12, 13, 14, 15].every((z) => r.text.includes(`\n${z}:${marker}\n`))
                && r.text.includes('\n10:// Zeile 10\n') && r.text.includes('\n16:// Zeile 16\n')
                && r.geschwaerzt.map((g) => g.zeile).join(',') === '11,12,13,14,15');
        }
        {
            // Der echte Fall vom 13.09.2026: Platzhalter, kein Geheimnis —
            // die Zeile geht trotzdem weg (keine Platzhalter-Erkennung), aber
            // der Lauf bricht NICHT ab.
            let r;
            let abbruch = null;
            try {
                r = werkzeugLies('schwaerzen-platzhalter.js', 1, 11);
            } catch (e) {
                abbruch = e;
            }
            const anzahl = r ? vorkommen(r.text, 'gymdocu:PASSWORT@') : -1;
            pruefen(`SCHWAERZEN 26 (Platzhalter-Verbindungszeichenfolge aus core/db.js:71: Zeile 6 weg, Platzhalter kommt ${anzahl}x vor, KEIN Abbruch — der Lauf geht weiter${abbruch ? ` — ABER: ${abbruch.message}` : ''})`,
                !abbruch && anzahl === 0
                && r.text.includes(`\n6:${zeileEntferntMarker('Verbindungszeichenfolge mit Passwort')}\n`)
                && r.geschwaerzt.length === 1);
        }
        {
            let ausgeloest = false;
            let ort = '-';
            let ergebnisText = null;
            try {
                ergebnisText = werkzeugLies('schwaerzen-viele.js', 1, 40).text;
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) { ausgeloest = true; ort = e.ort; }
            }
            pruefen(`DECKEL 27 (30 Geheimniszeilen unter 40 reissen den Deckel: GeheimnisAbbruch statt Schwaerzen, Ort: ${ort}; kein Funktionsergebnis)`,
                ausgeloest && ort === 'schwaerzen-viele.js (30 von 40 Zeilen)' && ergebnisText === null);
        }
        {
            let ausgeloest = false;
            let ort = '-';
            let ergebnisText = null;
            try {
                ergebnisText = werkzeugLies('schwaerzen-anteil.js', 1, 8).text;
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) { ausgeloest = true; ort = e.ort; }
            }
            pruefen(`DECKEL 35 (3 Geheimniszeilen unter 8 = 37,5 % reissen den Anteils-Deckel ab der Mindestzahl: GeheimnisAbbruch, Ort: ${ort}; kein Funktionsergebnis)`,
                ausgeloest && ort === 'schwaerzen-anteil.js (3 von 8 Zeilen)' && ergebnisText === null);
        }
        {
            // Positivkontrolle: ohne sie waere "nichts durchgelassen" auch
            // dann erfuellt, wenn lies() einfach alles schwaerzt. Woertlicher
            // Sollwert, nicht aus dem Fixture zurueckgerechnet.
            const r = werkzeugLies('harmlos.txt', 1, 3);
            pruefen('POSITIVKONTROLLE 28 (lies auf harmlos.txt liefert den Ausschnitt BYTEGLEICH zum woertlichen Sollwert, nichts geschwaerzt)',
                r.text === 'harmlos.txt (Zeilen 1-3 von 3):\n1:Zeile A\n2:Zeile B\n3:Zeile C'
                && Array.isArray(r.geschwaerzt) && r.geschwaerzt.length === 0);
        }
        {
            // suche(): eigener Codepfad (pruefeGeheimnisse + Marker je Zeile,
            // kein Deckel). Das Suchwort steht NICHT im Geheimnis.
            const r = werkzeugSuche('ankerSuche', 'schwaerzen-*.js');
            const anzahl = fragmentVorkommen(r.text);
            const zeilen = r.text.split('\n');
            pruefen(`SCHWAERZEN 29 (suche "ankerSuche" trifft 3 Geheimniszeilen: jede durch Marker ersetzt, Fragmente kommen ${anzahl}x vor, 3 Stellen gemeldet)`,
                anzahl === 0 && zeilen.length === 3
                && zeilen.includes(`schwaerzen-openai.js:6:${zeileEntferntMarker('OpenAI-Schlüssel')}`)
                && zeilen.includes(`schwaerzen-github.js:6:${zeileEntferntMarker('GitHub-Token')}`)
                && zeilen.includes(`schwaerzen-telegram.js:6:${zeileEntferntMarker('Telegram-Bot-Token')}`)
                && r.geschwaerzt.length === 3 && r.geschwaerzt.every((g) => g.zeile === 6));
        }
        {
            const r = werkzeugSuche('Zeile B', 'harmlos.txt');
            pruefen('POSITIVKONTROLLE 30 (suche "Zeile B" in harmlos.txt liefert die Zeile woertlich und unveraendert, nichts geschwaerzt)',
                r.text === 'harmlos.txt:2:Zeile B' && r.geschwaerzt.length === 0);
        }

        // ===== FALL 31: eingegebener Diff mit Geheimnis bricht WEITERHIN ab =====
        // Verhalten unveraendert (Begruendung in main()). Der https-Stub hat
        // eine LEERE Warteschlange: jede Anfrage wuerde im Stub eine Ausnahme
        // werfen — die Aufzeichnung muss leer bleiben.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesError = console.error;
            const aufgezeichnetDiff = [];
            const fehlerZeilenDiff = [];
            https.request = httpsStubBauen([], aufgezeichnetDiff);
            console.error = (msg) => fehlerZeilenDiff.push(String(msg));
            let codeDiff;
            try {
                codeDiff = await main([
                    diffMitGeheimnisPfad,
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-diff.jsonl')}`,
                ]);
            } finally {
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            pruefen(`DIFF-RIEGEL 31 (eingegebener Diff mit Geheimnis bricht weiterhin mit Exit 3 ab, ${aufgezeichnetDiff.length} Anfragen gebaut, Meldung nennt das Muster)`,
                codeDiff === 3 && aufgezeichnetDiff.length === 0
                && fehlerZeilenDiff.some((z) => z.includes('Der Diff enthaelt etwas, das wie ein Geheimnis aussieht') && z.includes('Telegram-Bot-Token')));
        }

        // ===== LAUF D: schwaerzen Ende-zu-Ende, gemessen am Anfragekoerper =====
        // Runden 1-3 lesen je eine Geheimnisdatei, Runde 4 sucht, Runde 5
        // liefert Text. Geprueft wird an aufgezeichnetD — den Koerpern, die
        // der https-Stub tatsaechlich bekommen hat — nicht an einer
        // Behauptung im Text.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetD = [];
            const ausgabeZeilenD = [];
            const warteschlangeD = [
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-d1', 'lies', { pfad: 'schwaerzen-openai.js', von: 1, bis: 11 }), 100, 50),
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-d2', 'lies', { pfad: 'schwaerzen-pem.txt', von: 1, bis: 25 }), 100, 50),
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-d3', 'lies', { pfad: 'schwaerzen-platzhalter.js', von: 1, bis: 11 }), 100, 50),
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-d4', 'suche', { muster: 'ankerSuche' }), 100, 50),
                antwortKoerperBauen(elementTextBauen('TESTBERICHT-SCHWAERZEN'), 100, 50),
            ];

            https.request = httpsStubBauen(warteschlangeD, aufgezeichnetD);
            console.log = (msg) => ausgabeZeilenD.push(String(msg));

            let codeD;
            try {
                codeD = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-5.6-terra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-d.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen(`LAUF D ABGESCHLOSSEN 32 (drei Lesungen mit Geheimnis plus eine Suche enden regulaer mit Exit ${codeD}, Bericht kam an)`,
                codeD === 0 && aufgezeichnetD.length === 5
                && ausgabeZeilenD.some((z) => z.includes('TESTBERICHT-SCHWAERZEN'))
                && ausgabeZeilenD.some((z) => z.includes('Bericht regulaer erstellt')));

            // Der Koerper der 5. Anfrage traegt die volle Historie, also ALLE
            // vier Funktionsergebnisse. Erwartete Marker: 1 (openai) + 5 (PEM)
            // + 1 (Platzhalter) + 3 (Suche) = 10.
            const alleKoerper = JSON.stringify(aufgezeichnetD);
            const funktionsausgaben = aufgezeichnetD.length === 5
                ? aufgezeichnetD[4].input.filter((e) => e.type === 'function_call_output').map((e) => e.output).join('\n')
                : '';
            const fragmenteRaus = fragmentVorkommen(alleKoerper);
            const markerRaus = vorkommen(funktionsausgaben, '[ZEILE ENTFERNT — Geheimnis-Riegel: ');
            pruefen(`ANFRAGEKOERPER 33 (in allen 5 tatsaechlich gebauten Anfragekoerpern kommen die Geheimnis-Fragmente ${fragmenteRaus}x vor, die 4 Funktionsergebnisse tragen ${markerRaus} Marker, erwartet 0 und 10)`,
                fragmenteRaus === 0 && markerRaus === 10 && !alleKoerper.includes('BEGIN PRIVATE'));

            const geschwaerztBlock = ausgabeZeilenD.join('\n');
            pruefen('BERICHT 34 (Zusammenfassung nennt unter "GESCHWAERZTE STELLEN" alle 10 blinden Zeilen mit Datei, Zeile und Muster)',
                geschwaerztBlock.includes('GESCHWAERZTE STELLEN')
                && geschwaerztBlock.includes('  schwaerzen-openai.js:6 (OpenAI-Schlüssel)')
                && [11, 12, 13, 14, 15].every((z) => geschwaerztBlock.includes(`  schwaerzen-pem.txt:${z} (privater Schlüssel (PEM))`))
                && geschwaerztBlock.includes('  schwaerzen-platzhalter.js:6 (Verbindungszeichenfolge mit Passwort)')
                && geschwaerztBlock.includes('  schwaerzen-github.js:6 (GitHub-Token)')
                && geschwaerztBlock.includes('  schwaerzen-telegram.js:6 (Telegram-Bot-Token)')
                && !geschwaerztBlock.includes('GESCHWAERZTE STELLEN (Geheimnis-Riegel; dort war die Pruefung blind):\n  (keine)'));
        }
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            delete process.env.OPENAI_API_KEY;
            delete process.env.OPENAI_KEY_DATEI;
            let code;
            try {
                code = await main([path.join(klon, 'harmlos.txt'), `--brief=${briefFixturePfad}`, `--wurzel=${klon}`, '--max-runden=0']);
            } finally {
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            pruefen('GRENZFALL 8 (--max-runden=0 bricht sofort mit Exit 4 ab, ohne Schluessel und ohne Netz)', code === 4);
        }

        // ===== DEFEKT 2, GEGENPROBE: fehlendes --brief bricht laut ab =====
        // Positivkontrolle zu den Faellen unten, die --brief korrekt setzen:
        // OHNE --brief darf main() nicht bis zum Schluessel-/Netz-Code
        // vordringen, sondern muss VORHER mit dem eigenen Exit-Code 6
        // abbrechen -- ohne Schluessel und ohne Netz pruefbar, aus demselben
        // Grund wie GRENZFALL 8.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            delete process.env.OPENAI_API_KEY;
            delete process.env.OPENAI_KEY_DATEI;
            let code;
            try {
                code = await main([path.join(klon, 'harmlos.txt'), `--wurzel=${klon}`]);
            } finally {
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            pruefen('GRENZFALL 21 (kein --brief angegeben bricht sofort mit Exit 6 ab, ohne Schluessel und ohne Netz)', code === 6);
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
                    elementFunktionsaufrufBauen(`call-${r}`, 'suche', { muster: 'Zeile' }),
                    100, 50,
                ));
            }
            warteschlangeA.push(antwortKoerperBauen(elementTextBauen('TESTBERICHT-ENDE'), 100, 50));

            https.request = httpsStubBauen(warteschlangeA, aufgezeichnetA);
            console.log = (msg) => ausgabeZeilenA.push(String(msg));

            let codeA;
            try {
                codeA = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
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

            const letzteNachricht = (koerper) => koerper && koerper.input[koerper.input.length - 1].content;
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
            const warteschlangeB = [antwortKoerperBauen(elementTextBauen('TESTBERICHT-SOFORT'), 100, 50)];

            https.request = httpsStubBauen(warteschlangeB, aufgezeichnetB);
            console.log = (msg) => ausgabeZeilenB.push(String(msg));

            let codeB;
            try {
                codeB = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
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
            const warteschlangeC = [antwortKoerperBauen(elementTextBauen('TESTBERICHT-UNBEKANNTES-MODELL'), 100, 50)];

            https.request = httpsStubBauen(warteschlangeC, aufgezeichnetC);
            console.log = (msg) => ausgabeZeilenC.push(String(msg));

            let codeC;
            try {
                codeC = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
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
