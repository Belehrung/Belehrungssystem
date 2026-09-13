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
// nennt am Ende jede geschwaerzte Stelle. Reisst bei lies() der Deckel
// (mehr als 20 Zeilen, oder ab 8 Zeilen Ausschnitt mehr als 25 %), wird
// daraus KEIN Gesamtabbruch mehr (Nacharbeit 13.09.2026, Anlass: zwei
// Laeufe brachen an derselben Datei ab, OHNE dass ueberhaupt geprueft
// wurde): main() macht daraus ein abgelehntes Funktionsergebnis, sendet
// weiterhin NICHTS aus diesem AUSSCHNITT, aber der Lauf geht weiter und
// der Bericht nennt ihn am Ende unter "ABGELEHNTE LESUNGEN". Der Deckel
// gilt dabei fuer den ANGEFRAGTEN AUSSCHNITT, nicht fuer die Datei (so
// stand es hier bis zur Gegenlesung vom 13.09.2026 faelschlich): ein
// anderer oder kleinerer Bereich derselben Datei kann danach durchgehen
// und steht dann zugleich unter "GELESENE DATEIEN". SOFORT
// abgebrochen (Exit 3, ohne dass die Anfrage gesendet wird) wird nur noch,
// wenn der EINGEGEBENE Diff ein Geheimnis enthaelt, siehe main().
//
// AUFRUF:
//   node tools/gegenleser-repo.js <diff.txt> --brief=<auftrag.txt>
//                                 [--wurzel=/pfad/zum/repo]
//                                 [--modell=gpt-6-astra] [--max-runden=25]
//                                 [--protokoll=/pfad.jsonl] [--zweck=<text>]
//   node tools/gegenleser-repo.js --selbsttest   (prueft die Riegel, OHNE Netz)
//
// --brief=<datei> ist PFLICHT (seit 12.09.2026, siehe BRIEF_KOPF-Kommentar
// weiter unten): sie liefert den beitragsspezifischen Teil des Auftrags.
// Fehlt sie, bricht das Werkzeug mit Exit 6 ab, statt still gegen einen
// mitgelieferten Standardauftrag zu pruefen.
//
// EXIT-CODES: 0 fertig, 2 kein Schluessel/falscher Aufruf, 3 Geheimnis-Riegel
// auf dem EINGEGEBENEN Diff hat angeschlagen (eine abgelehnte Lesung
// waehrend des Laufs bricht seit 13.09.2026 NICHT mehr ab, siehe oben),
// 4 Runden- oder Mengenlimit erreicht (Bericht UNVOLLSTAENDIG), 5 das
// Modell hat am Ende keinen Text geliefert, 6 kein --brief angegeben oder
// die Datei ist leer/unlesbar, 1 sonstiger Fehler.
//
// LAUF-PROTOKOLL (seit 13.09.2026, TEIL D weiter unten): JEDER echte Lauf --
// Erfolg wie Abbruch ueber Exit 3/4/5 -- traegt sich selbst als Zeile in
// ASTRA-LAEUFE.md ein (Pfad ueberschreibbar ueber ASTRA_LAUFPROTOKOLL, fuer
// den Selbsttest gegen eine Wegwerfkopie). Anlass: eine Regel, die verlangt
// "jeder Lauf wird zaehlbar festgehalten", aber nur in Prosa steht, wird
// vergessen -- siehe CLAUDE.md, "was eine Datei verspricht, muss das
// Werkzeug erzwingen, nicht die Prosa". --zweck=<text> beschriftet die
// Zeile; fehlt der Schalter, wird der Basisname der --brief-Datei genommen.
// Ein Aufruf, bei dem gar kein Lauf stattfand (Exit 2, Exit 6,
// --max-runden < 1, --selbsttest), bekommt KEINE Zeile.

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

// Wird geworfen, wenn der Geheimnis-Riegel bei lies() auf zu vielen Zeilen
// anschlaegt (der DECKEL, nicht das einzelne Schwaerzen -- siehe
// entferneGeheimnisse()/werkzeugLies() weiter unten, beide unveraendert).
// Eigene Klasse, damit main() diesen Fall von einem gewoehnlichen
// "abgelehnt: ..."-Funktionsergebnis unterscheiden kann. main() macht daraus
// seit 13.09.2026 selbst ein solches Funktionsergebnis und der Lauf geht
// weiter -- NICHT mehr wie zuvor ein sofortiger Abbruch mit Exit 3 (den
// gibt es weiterhin, aber nur noch beim Riegel auf dem EINGEGEBENEN Diff,
// siehe main()).
//
// Nacharbeit 13.09.2026 (Gegenlesung): der Deckel gilt fuer den angefragten
// AUSSCHNITT einer Datei, nicht fuer die Datei als Ganzes -- ein anderer
// oder kleinerer Bereich derselben Datei kann danach trotzdem durchgehen.
// "ort" war bislang ein fertiger Satz, den die Wurfstelle selbst zusammen-
// baute (und der die Trefferzahl mit der ANGEFRAGTEN Ausschnittslaenge
// verwechselbar machte, nicht mit der Dateilaenge) -- jetzt bekommt die
// Ausnahme die Rohwerte und baut "ort" selbst, damit Bericht und
// Ablehnungstext nicht mehr jeder fuer sich denselben Satz zusammenbauen
// muessen und dabei auseinanderlaufen koennen.
class GeheimnisAbbruch extends Error {
    constructor(treffer, { relativ, von, bis, gesamt, trefferZeilen, ausschnittZeilen }) {
        const ort = `${relativ} Zeilen ${von}-${bis} (von ${gesamt})`;
        super('Geheimnis-Riegel ausgeloest bei ' + ort);
        this.treffer = treffer;
        this.ort = ort;
        this.relativ = relativ;
        this.von = von;
        this.bis = bis;
        this.gesamt = gesamt;
        this.trefferZeilen = trefferZeilen;
        this.ausschnittZeilen = ausschnittZeilen;
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
        // gvon/ende, NICHT die ungekuerzten Argumente von/bis -- die sind an
        // dieser Stelle schon auf Dateiende bzw. MAX_LIES_ZEILEN gekuerzt
        // (s. o.), und genau dieser tatsaechlich gelesene Bereich gehoert in
        // den Ablehnungstext, nicht der urspruenglich angefragte.
        throw new GeheimnisAbbruch(namen, {
            relativ: pruefung.relativ,
            von: gvon,
            bis: ende,
            gesamt,
            trefferZeilen: bereinigt.entfernt.length,
            ausschnittZeilen: ausschnittZeilen.length,
        });
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
    console.error('        [--protokoll=/pfad.jsonl] [--zweck=<text>]');
    console.error('        node tools/gegenleser-repo.js --selbsttest');
    console.error('--brief ist PFLICHT: liefert den beitragsspezifischen Teil des Auftrags,');
    console.error('kein eingebauter Standardauftrag mehr (siehe Dateikopf).');
    console.error('--zweck beschriftet die Zeile im Lauf-Protokoll (ASTRA-LAEUFE.md); fehlt');
    console.error('er, wird der Basisname der --brief-Datei genommen.');
}

function argumenteLesen(argv) {
    const optionen = {
        diffPfad: null,
        briefPfad: null,
        wurzel: process.cwd(),
        modell: VORGABE_MODELL,
        maxRunden: VORGABE_MAX_RUNDEN,
        protokollPfad: null,
        zweck: null,
    };
    for (const a of argv) {
        if (a.startsWith('--wurzel=')) { optionen.wurzel = a.slice('--wurzel='.length); continue; }
        if (a.startsWith('--brief=')) { optionen.briefPfad = a.slice('--brief='.length); continue; }
        if (a.startsWith('--modell=')) { optionen.modell = a.slice('--modell='.length); continue; }
        if (a.startsWith('--max-runden=')) { optionen.maxRunden = Number(a.slice('--max-runden='.length)); continue; }
        if (a.startsWith('--protokoll=')) { optionen.protokollPfad = a.slice('--protokoll='.length); continue; }
        if (a.startsWith('--zweck=')) { optionen.zweck = a.slice('--zweck='.length); continue; }
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

// ===================== TEIL D: LAUF-PROTOKOLL (ASTRA-LAEUFE.md) ============
//
// Haus-Regel seit dem 12.09.2026: "Jeder Lauf wird zaehlbar festgehalten."
// Anlass fuer DIESES Werkzeug (13.09.2026): ein Lauf (7,47 $) wurde von Hand
// vergessen einzutragen -- eine Stunde, nachdem dieselbe Regel geschaerft
// worden war. "Was eine Datei verspricht, muss das Werkzeug erzwingen, nicht
// die Prosa." Deshalb traegt sich JEDER echte Lauf (Erfolg wie Abbruch ueber
// Exit 3/4/5) hier selbst ein -- NICHT ein Aufruf, bei dem gar kein Lauf
// stattfand (fehlender Schluessel/Brief, --selbsttest, oder
// --max-runden < 1, das noch VOR wurzelEinrichten()/dem Diff-Lesen abbricht
// und deshalb noch nicht einmal eine Zeilenzahl zu melden haette).
//
// Pfad ueberschreibbar ueber ASTRA_LAUFPROTOKOLL -- der Selbsttest laeuft
// AUSSCHLIESSLICH gegen Wegwerfkopien, NIE gegen die echte Datei (siehe
// Sicherheitsnetz am Kopf von selbsttest()).
const LAUFPROTOKOLL_MARKE = '<!-- NEUE-LAUFZEILE-HIER:';

function laufprotokollPfad() {
    return process.env.ASTRA_LAUFPROTOKOLL || path.join(__dirname, '..', 'ASTRA-LAEUFE.md');
}

// Deutsches Datum TT.MM.JJJJ, Zeitzone Europe/Berlin. NICHT toISOString()
// (liefert UTC, oestlich von UTC oft den Vortag) und NICHT
// toLocaleDateString() ohne "2-digit" (liefert "13.9.2026" statt
// "13.09.2026") -- siehe Auftrag.
function laufprotokollDatum() {
    return new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date());
}

// Ein rohes "|" zerschiesst die Tabelle spaltenweise, ein roher
// Zeilenumbruch zeilenweise (die Markdown-Tabelle ist genau eine Zeile je
// Lauf) -- beides wird deshalb vor dem Einsetzen in eine Zelle unschaedlich
// gemacht. Punkt D (Nacharbeit 13.09.2026): "/\r?\n/" liess ein
// ALLEINSTEHENDES "\r" (ohne folgendes "\n") stehen -- Markdown behandelt
// das trotzdem als Zeilenende, das Ein-Zeile-pro-Lauf-Versprechen faellt.
// "/\r\n|\r|\n/" trifft alle drei Faelle. Punkt C (dieselbe Nacharbeit):
// eine geoeffnete HTML-Kommentarzeichenfolge wird zusaetzlich unschaedlich
// gemacht -- ohne das koennte ein "--zweck" mit der Markenzeichenfolge eine
// zweite, gefaelschte Marke in die Tabellenzeile selbst einschleusen (siehe
// laufprotokollEinfuegen() unten, das JETZT alle Fundstellen zaehlt statt
// nur die erste zu nehmen -- diese Zeile ist die zweite, unabhaengige
// Verteidigungslinie an der Wurzel).
function laufprotokollZelle(text) {
    return String(text).replace(/\|/g, '\\|').replace(/<!--/g, '&lt;!--').replace(/\r\n|\r|\n/g, ' ');
}

// Sperr- und Wegwerfdateiname aus dem Zielpfad abgeleitet, damit mehrere
// gleichzeitige Prozesse (Punkt B) sich gegenseitig sehen UND die
// Wegwerfdatei fuer den atomaren Austausch im SELBEN Verzeichnis liegt
// (sonst waere ein rename() kein Betriebssystem-atomarer Vorgang mehr,
// sondern ueber Dateisystemgrenzen ein Kopieren+Loeschen).
const LAUFPROTOKOLL_SPERRE_MAX_VERSUCHE = 50;
const LAUFPROTOKOLL_SPERRE_PAUSE_MS = 100; // 50 * 100ms = 5s Wartezeit insgesamt
const LAUFPROTOKOLL_SPERRE_VERALTET_MS = 60 * 1000;

// Blockierende Pause OHNE await/Timer (die Funktion ist synchron und soll es
// bleiben, siehe Auftrag) -- Atomics.wait auf einem eigens dafuer erzeugten,
// nie geteilten Int32Array haelt den Thread genau PAUSE_MS an.
function laufprotokollSperrePause(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Erwirbt die Sperre ueber den GESAMTEN Lese-Aendere-Schreibe-Vorgang unten
// (Punkt B): zwei gleichzeitige Prozesse duerfen nicht denselben Stand lesen
// und sich beim Schreiben gegenseitig ueberschreiben. "wx" schlaegt fehl,
// wenn die Sperrdatei schon existiert -- das ist der Test, kein Vergleich
// von Inhalten. Eine Sperrdatei, die aelter als LAUFPROTOKOLL_SPERRE_VERALTET_MS
// ist, gilt als Rest eines abgestuerzten Vorgaengerlaufs und wird entfernt,
// statt das Protokoll fuer immer zu blockieren.
function laufprotokollSperreErwerben(sperrPfad) {
    for (let versuch = 0; versuch < LAUFPROTOKOLL_SPERRE_MAX_VERSUCHE; versuch++) {
        try {
            const fd = fs.openSync(sperrPfad, 'wx');
            return { ok: true, fd, sperrPfad };
        } catch (e) {
            if (e.code !== 'EEXIST') {
                return { ok: false, grund: `Sperre konnte nicht angelegt werden (${sperrPfad}): ${e.message}` };
            }
            try {
                const stat = fs.statSync(sperrPfad);
                if (Date.now() - stat.mtimeMs > LAUFPROTOKOLL_SPERRE_VERALTET_MS) {
                    fs.rmSync(sperrPfad, { force: true });
                    continue; // sofort neuer Versuch, keine Pause noetig
                }
            } catch (e2) {
                // Sperrdatei ist zwischen dem EEXIST oben und diesem stat()
                // verschwunden (Wettlauf mit dem Freigeben eines anderen
                // Prozesses) -- der naechste Versuch greift dann durch.
            }
            laufprotokollSperrePause(LAUFPROTOKOLL_SPERRE_PAUSE_MS);
        }
    }
    return {
        ok: false,
        grund: `Protokoll ist gesperrt (${sperrPfad} besteht weiterhin nach `
            + `${(LAUFPROTOKOLL_SPERRE_MAX_VERSUCHE * LAUFPROTOKOLL_SPERRE_PAUSE_MS / 1000).toFixed(1)}s Wartezeit) -- Zeile wurde NICHT angehaengt.`,
    };
}

// Gibt die Sperre wieder frei. Darf selbst NIE werfen (Auftrag) -- ein
// Fehler beim Aufraeumen wuerde sonst den eigentlichen Schreibfehler
// verdecken, den der Aufrufer gerade behandelt.
function laufprotokollSperreFreigeben(sperre) {
    if (!sperre || !sperre.ok) return;
    try { fs.closeSync(sperre.fd); } catch (e) { /* schon geschlossen -- egal */ }
    try { fs.rmSync(sperre.sperrPfad, { force: true }); } catch (e) { /* Aufraeumen darf nie selbst werfen */ }
}

// Fuegt EINE Tabellenzeile unmittelbar VOR der ERSTEN Zeile der Marke ein --
// die Marke selbst ist in ASTRA-LAEUFE.md ein mehrzeiliger Kommentar,
// "unmittelbar darueber" heisst also vor seiner ersten Zeile, nicht mitten
// hinein. Wirft NIE: jeder Fehlerfall kommt als {ok:false, grund} zurueck,
// main() entscheidet, was damit geschieht (laut melden, Exit-Code des Laufs
// NICHT aendern -- siehe laufprotokollVersuchen()).
function laufprotokollEinfuegen(pfad, zeileText) {
    const sperre = laufprotokollSperreErwerben(`${pfad}.lock`);
    if (!sperre.ok) return sperre;
    try {
        let inhalt;
        try {
            inhalt = fs.readFileSync(pfad, 'utf8');
        } catch (e) {
            return { ok: false, grund: `Protokolldatei nicht lesbar (${pfad}): ${e.message}` };
        }
        // Punkt C: ALLE Fundstellen zaehlen (nicht nur die erste per
        // indexOf()) UND pruefen, dass die eine verbliebene Fundstelle am
        // Zeilenanfang steht. Eine zweite, eingeschleuste Fundstelle (etwa
        // ueber --zweck, siehe laufprotokollZelle() oben) waere sonst
        // unbemerkt die neue Einfuegestelle geworden, und die Tabelle
        // waere Lauf fuer Lauf aus ihrer Position gewandert.
        const fundstellen = [];
        for (let ab = 0; ; ) {
            const treffer = inhalt.indexOf(LAUFPROTOKOLL_MARKE, ab);
            if (treffer === -1) break;
            fundstellen.push(treffer);
            ab = treffer + LAUFPROTOKOLL_MARKE.length;
        }
        if (fundstellen.length === 0) {
            return { ok: false, grund: `Marke "${LAUFPROTOKOLL_MARKE}" fehlt in ${pfad} -- Zeile wurde NICHT angehaengt.` };
        }
        if (fundstellen.length > 1) {
            return {
                ok: false,
                grund: `Marke "${LAUFPROTOKOLL_MARKE}" kommt ${fundstellen.length}-mal vor in ${pfad} `
                    + '-- mehrdeutig, es wird NICHTS geschrieben.',
            };
        }
        const idx = fundstellen[0];
        if (!(idx === 0 || inhalt[idx - 1] === '\n')) {
            return {
                ok: false,
                grund: `Marke "${LAUFPROTOKOLL_MARKE}" steht nicht am Zeilenanfang in ${pfad} -- es wird NICHTS geschrieben.`,
            };
        }
        const zeilenstart = inhalt.lastIndexOf('\n', idx - 1) + 1; // 0, wenn die Marke die allererste Zeile ist
        const neu = `${inhalt.slice(0, zeilenstart)}${zeileText}\n${inhalt.slice(zeilenstart)}`;

        // Punkt B: ATOMARER AUSTAUSCH -- erst in eine Wegwerfdatei im
        // SELBEN Verzeichnis schreiben, dann per rename() ersetzen (auf
        // demselben Dateisystem ist das atomar). Ein direktes
        // writeFileSync(pfad, ...) schneidet die Zieldatei zuerst ab;
        // scheitert das Schreiben danach (volle Platte), waere sie leer
        // oder halb -- das darf nicht mehr vorkommen.
        const tmpPfad = `${pfad}.tmp-${process.pid}`;
        try {
            fs.writeFileSync(tmpPfad, neu);
            fs.renameSync(tmpPfad, pfad);
        } catch (e) {
            return { ok: false, grund: `Protokolldatei nicht schreibbar (${pfad}): ${e.message}` };
        } finally {
            // Aufraeumen darf selbst NIE werfen (Auftrag) -- sonst verdeckt
            // ein Fehler beim Wegraeumen den eigentlichen Schreibfehler
            // oben. Nach einem erfolgreichen rename() existiert die
            // Wegwerfdatei ohnehin nicht mehr, { force: true } macht das
            // harmlos.
            try { fs.rmSync(tmpPfad, { force: true }); } catch (e) { /* egal */ }
        }
        return { ok: true };
    } finally {
        laufprotokollSperreFreigeben(sperre);
    }
}

// Baut die Tabellenzeile und versucht, sie einzutragen. Ein Fehlschlag wird
// LAUT und ZWEIMAL gemeldet (hier UND als allerletzte Zeile der
// main()-Ausgabe, weil jeder Aufruf dieser Funktion unten immer NACH
// zusammenfassungAusgeben() steht) -- der Exit-Code des Laufs bleibt in
// JEDEM Fall unveraendert: der Pruefbericht selbst hat schon 7-15 $
// gekostet, eine Buchhaltungspanne darf ihn nicht entwerten. Stilles
// Scheitern ist verboten.
function laufprotokollVersuchen(zweck, material, kostenText) {
    const zeile = `| ${laufprotokollDatum()} | ${laufprotokollZelle(zweck)} | ${laufprotokollZelle(material)} `
        + `| — | — | — | ${laufprotokollZelle(kostenText)} |`;
    const ergebnis = laufprotokollEinfuegen(laufprotokollPfad(), zeile);
    if (!ergebnis.ok) {
        console.error(`WARNUNG: Lauf-Protokollzeile in ASTRA-LAEUFE.md konnte NICHT eingetragen werden: ${ergebnis.grund} `
            + 'Der Pruefbericht oben ist trotzdem das Ergebnis dieses Laufs und hat bereits Kosten '
            + 'verursacht -- er wird deshalb NICHT verworfen, der Exit-Code bleibt unveraendert.');
        console.error(`LETZTE ZEILE -- PROTOKOLLEINTRAG FEHLGESCHLAGEN: ${ergebnis.grund}`);
    }
    return ergebnis.ok;
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
        // KEIN Lauf-Protokolleintrag hier (TEIL D unten): dieser Abbruch
        // liegt VOR wurzelEinrichten()/dem Diff-Lesen -- es hat noch nicht
        // einmal eine Zeilenzahl oder ein Modell-Kontakt stattgefunden. Wie
        // bei Exit 2/6 gilt: "gar kein Lauf fand statt."
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

    // Vor den Diff gezogen (bis 13.09.2026 standen sie danach): der
    // Geheimnis-Riegel auf dem EINGEGEBENEN Diff (naechster Block) kann
    // schon vor der ersten Anfrage abbrechen, und dieser Lauf bekommt
    // trotzdem eine Protokollzeile (TEIL D, "Betrifft mindestens:
    // Geheimnis-Riegel (Exit 3)") -- dafuer muessen Runde/Suchen/Lesungen/
    // Token schon existieren, wenn auch bei null.
    let runde = 0;
    let sucheAnzahl = 0;
    let liesAnzahl = 0;
    let ablehnungenAnzahl = 0;
    let ausgabeBytes = 0;
    let promptTokenSumme = 0;
    let completionTokenSumme = 0;
    const gelesenePfade = [];
    const geschwaerzteStellen = [];
    // Deckel gerissen bei lies() (13.09.2026, Nacharbeit): dieser ANGEFRAGTE
    // AUSSCHNITT wurde nie gesendet -- anders als geschwaerzteStellen (dort
    // kam der Ausschnitt AN, nur eine Zeile fehlt) hat der Pruefer ihn NIE
    // gesehen. Das gilt fuer den Ausschnitt, NICHT fuer die Datei: ein
    // anderer oder kleinerer Bereich derselben Datei kann trotzdem als
    // GELESEN dastehen (Gegenlesung 13.09.2026 -- die vorherige Fassung
    // dieses Kommentars und der Berichtstext behaupteten genau das
    // faelschlich ueber die ganze Datei). Eigene Liste, damit der Bericht
    // diesen Unterschied auch zeigt.
    const abgelehnteLesungen = [];
    // Punkt A (Nacharbeit 13.09.2026, Gegenlesung): main() hatte einen Pfad,
    // der bei einem geworfenen Fehler NACH Modellkontakt (anfragen() wirft
    // in einer spaeteren Runde, nachdem eine fruehere schon Tokens
    // verbraucht hat) KEINE Protokollzeile schrieb -- der throw landete
    // direkt im main().catch(...) ganz unten, ohne dass
    // protokollLaufEintragen() je lief. laufEingetragen und
    // protokollLaufEintragen selbst muessen VOR dem try unten deklariert
    // sein, damit auch dessen finally sie sehen kann (ein "let"/"const"
    // innerhalb eines try-Blocks ist ausserhalb davon nicht sichtbar) --
    // zugewiesen wird protokollLaufEintragen trotzdem gleich am Anfang des
    // try, an derselben Stelle wie vorher.
    let laufEingetragen = false;
    let protokollLaufEintragen = null;
    let diffInhalt;

    try {
        diffInhalt = fs.readFileSync(optionen.diffPfad, 'utf8');

        // Zweck/Material/Kosten fuer das Lauf-Protokoll (TEIL D oben) -- als
        // Closures, weil sie erst beim tatsaechlichen Eintragen (an mehreren
        // Stellen unten) ausgewertet werden, dabei aber immer den AKTUELLEN
        // Stand von runde/sucheAnzahl/... sehen muessen.
        const protokollZweck = () => optionen.zweck || path.basename(optionen.briefPfad, path.extname(optionen.briefPfad));
        const protokollMaterial = (abbruchGrund) => {
            const kern = `Diff ${zeilenAus(diffInhalt).length} Zeilen, Suchen ${sucheAnzahl}, Lesungen ${liesAnzahl}, `
                + `Token rein ${promptTokenSumme}, Token raus ${completionTokenSumme}, Runden ${runde}`;
            return abbruchGrund ? `**abgebrochen** (${abbruchGrund}): ${kern}` : kern;
        };
        const protokollKostenText = () => {
            const kosten = kostenSchaetzen(optionen.modell, promptTokenSumme, completionTokenSumme);
            return kosten === null ? 'unbekannt' : kosten.toFixed(2).replace('.', ',') + ' $';
        };
        // NUR fuer das Sicherheitsnetz im finally unten (Punkt A): dort ist die
        // Tokenzahl eine UNTERGRENZE (eine gescheiterte Anfrage hat womoeglich
        // schon verbraucht, ohne dass "usage" zurueckkam) -- die Kostenzelle
        // bekommt deshalb das Praefix "mind. ". Ist die Tokenzahl 0, aber
        // runde > 0, heisst das NICHT "nichts verbraucht", sondern "wir wissen
        // es nicht" -- "0,00 $" waere hier eine falsche Zusicherung.
        const protokollKostenTextUntergrenze = () => {
            if (promptTokenSumme === 0 && completionTokenSumme === 0) return 'Kosten unbekannt';
            const kosten = kostenSchaetzen(optionen.modell, promptTokenSumme, completionTokenSumme);
            return kosten === null ? 'unbekannt' : 'mind. ' + kosten.toFixed(2).replace('.', ',') + ' $';
        };
        // EINE Stelle fuer alle Rueckgabepunkte unten ("das Werkzeug muss sich
        // selbst eintragen, nicht die Prosa") -- abbruchGrund=null heisst
        // regulaerer Abschluss (Exit 0). Gegen Doppeleintrag gesichert (Punkt A):
        // das Sicherheitsnetz im finally unten darf eine bereits geschriebene
        // Zeile nicht verdoppeln, wenn schon einer der regulaeren
        // Rueckgabepunkte eingetragen hat -- ein zweiter Aufruf tut dann NICHTS
        // und meldet das auch nicht.
        protokollLaufEintragen = (abbruchGrund, istUntergrenze) => {
            if (laufEingetragen) return true;
            const kostenText = istUntergrenze ? protokollKostenTextUntergrenze() : protokollKostenText();
            const ergebnis = laufprotokollVersuchen(protokollZweck(), protokollMaterial(abbruchGrund), kostenText);
            laufEingetragen = true;
            return ergebnis;
        };

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
            protokollLaufEintragen('Geheimnis-Riegel auf dem Eingabediff');
            return 3;
        }

        const auftragstext = auftragstextBauen(briefInhalt);
        const verlauf = [{
            role: 'user',
            content: auftragstext + '\n\n########## DIFF ##########\n\n' + diffInhalt,
        }];
        protokollSchreiben({ typ: 'start', element: verlauf[0] });

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
            // Eine verschwiegene Luecke ist schlimmer als eine benannte
            // (13.09.2026, Nacharbeit): dieser AUSSCHNITT wurde NIE gesendet,
            // nicht bloss an einer Stelle geschwaerzt -- der Leser des
            // Berichts muss wissen, welchen Ausschnitt der Pruefer nie
            // gesehen hat. Ueberschrift spricht seit der Gegenlesung vom
            // 13.09.2026 bewusst von AUSSCHNITTEN, nicht von Dateien: der
            // Deckel gilt fuer den angefragten Bereich, nicht fuer die ganze
            // Datei, und dieselbe Datei kann zugleich unter GELESENE DATEIEN
            // stehen (ein anderer Ausschnitt kam durch). Baut die Zeile aus
            // den strukturierten Feldern (Punkt 1 oben) statt aus einem
            // String-Trick auf "ort" -- der hing daran, dass "ort" auf ")"
            // endet, eine unnoetige Kopplung an die Textform.
            console.log('ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; '
                + 'andere Teile derselben Datei koennen geliefert worden sein):');
            if (abgelehnteLesungen.length === 0) {
                console.log('  (keine)');
            } else {
                for (const a of abgelehnteLesungen) {
                    console.log(`  ${a.relativ} Zeilen ${a.von}-${a.bis} (von ${a.gesamt}) — `
                        + `${a.trefferZeilen} Trefferzeilen, Muster: ${a.muster.join(', ')}`);
                }
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
                protokollLaufEintragen('Rundenlimit erreicht');
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
                    protokollLaufEintragen('kein Text vom Modell am Ende');
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
                protokollLaufEintragen(null);
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
                        // Eine ABGELEHNTE Lesung ist kein Abbruch des Laufs
                        // mehr (13.09.2026, Nacharbeit): der Deckel bleibt
                        // scharf -- es wird weiterhin NICHTS aus der Datei
                        // gesendet --, aber statt den GANZEN Lauf zu
                        // beenden, geht das Modell mit einem gewoehnlichen
                        // abgelehnten Funktionsergebnis weiter, so wie bei
                        // jeder anderen Ablehnung auch. Der Text nennt die
                        // Datei und die Musternamen, aber KEINE Zeile und
                        // KEINEN Musterinhalt -- ein erneuter Versuch liefert
                        // erkennbar dasselbe Ergebnis fuer DIESELBE Anfrage,
                        // das Modell muss also nicht nachfragen -- ein
                        // anderer oder kleinerer Ausschnitt DERSELBEN Datei
                        // kann dagegen durchgehen (Nacharbeit 13.09.2026: der
                        // Deckel gilt fuer den Ausschnitt, nicht fuer die
                        // Datei, und der Text darf das nicht verschweigen).
                        const musterNamen = [...new Set(e.treffer.map((t) => t.name))];
                        console.error(`LESUNG ABGELEHNT (Geheimnis-Deckel): ${e.ort} — nichts gesendet, der Lauf geht weiter.`);
                        for (const name of musterNamen) console.error(`  Muster "${name}"`);
                        protokollSchreiben({ typ: 'geheimnis_ablehnung', ort: e.ort, muster: musterNamen });
                        abgelehnteLesungen.push({
                            relativ: e.relativ, von: e.von, bis: e.bis, gesamt: e.gesamt,
                            trefferZeilen: e.trefferZeilen, muster: musterNamen,
                        });
                        ergebnis = {
                            text: `abgelehnt: Geheimnis-Riegel — der angefragte Ausschnitt ${e.ort} enthaelt zu viele `
                                + `Zeilen, die zu den Mustern ${musterNamen.join(', ')} passen; aus DIESEM Ausschnitt wird `
                                + 'nichts geliefert. Dieselbe Anfrage liefert bei unveraendertem Dateiinhalt erneut eine '
                                + 'Ablehnung. Ein anderer oder kleinerer Ausschnitt derselben Datei kann dagegen durchgehen.',
                            abgelehnt: true,
                        };
                    } else {
                        throw e;
                    }
                }

                if (ergebnis.abgelehnt) ablehnungenAnzahl++;

                ausgabeBytes += Buffer.byteLength(ergebnis.text, 'utf8');
                if (ausgabeBytes > MAX_AUSGABE_BYTES) {
                    console.error(`ABBRUCH: Gesamtausgabemenge ueber ${MAX_AUSGABE_BYTES} Bytes (${ausgabeBytes}) — der Bericht ist UNVOLLSTAENDIG.`);
                    zusammenfassungAusgeben();
                    protokollLaufEintragen('Ausgabemenge ueber dem Limit');
                    return 4;
                }

                // Das Werkzeugergebnis geht mit demselben call_id zurueck, NICHT
                // mit der Item-id des Funktionsaufrufs (gemessen 12.09.2026,
                // siehe Endpunkt-Kommentar oben).
                protokollSchreiben({ typ: 'funktionsantwort', runde, werkzeug: aufruf.name, call_id: aufruf.call_id, text: ergebnis.text });
                verlauf.push({ type: 'function_call_output', call_id: aufruf.call_id, output: ergebnis.text });
            }
        }
    } finally {
        // Sicherheitsnetz (Punkt A): greift NUR, wenn keiner der regulaeren
        // Rueckgabepunkte oben schon eingetragen hat (laufEingetragen) UND
        // mindestens ein Anfrageversuch stattfand (runde > 0 -- runde wird
        // am Kopf der Schleife hochgezaehlt, BEVOR angefragt wird, ist also
        // schon dann > 0, wenn genau dieser Versuch selbst wirft) ODER schon
        // Token gezaehlt wurden. Das ist der ERREICHTE ZUSTAND "es gab
        // Modellkontakt, also ist womoeglich Geld geflossen" -- NICHT der
        // Exit-Code. Fehler VOR dem ersten Kontakt (Diff lesen,
        // wurzelEinrichten) haben runde === 0 und promptTokenSumme === 0 und
        // bekommen weiterhin KEINE Zeile, richtig so.
        if (protokollLaufEintragen && !laufEingetragen && (runde > 0 || promptTokenSumme > 0)) {
            protokollLaufEintragen('unerwarteter Fehler nach Modellkontakt (Exit 1)', true);
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
    const ERWARTETE_FAELLE = 69;
    let gelaufen = 0;
    let fehler = 0;
    const pruefen = (bezeichnung, bedingung) => {
        gelaufen++;
        console.log(`${bedingung ? '  ✓' : '  ✗ FEHLT'} ${bezeichnung}`);
        if (!bedingung) fehler++;
    };

    // ===== SICHERHEITSNETZ FUERS LAUF-PROTOKOLL (TEIL D), FUER DEN GANZEN
    // SELBSTTEST =====
    // Jeder main()-Aufruf hier drin kann jetzt bei Exit 0/3/4/5 eine Zeile in
    // ASTRA-LAEUFE.md eintragen wollen. OHNE diese Grundeinstellung wuerde
    // "--selbsttest" die ECHTE Datei bei JEDEM Lauf anfassen -- genau das,
    // was FALL 6 unten widerlegen soll, und das bei jedem CI-Lauf. Der Pfad
    // zeigt auf eine Wegwerf-Datei MIT Marke: ein main()-Aufruf, der
    // vergisst, ASTRA_LAUFPROTOKOLL eigens umzubiegen (wie LAUF A/B/C/D und
    // DIFF-RIEGEL 31 weiter unten -- die kannten dieses Verhalten beim
    // Schreiben noch nicht), schreibt dadurch still in dieses Wegwerfziel
    // statt in die echte Datei. Ein Schnappschuss der ECHTEN Datei VOR allen
    // main()-Aufrufen ist FALL 6 selbst (Vergleich am Ende der Funktion).
    const alteProtokollUmgebungGesamt = process.env.ASTRA_LAUFPROTOKOLL;
    const echteProtokollDatei = path.join(__dirname, '..', 'ASTRA-LAEUFE.md');
    let echtesProtokollVorher = null;
    try { echtesProtokollVorher = fs.readFileSync(echteProtokollDatei, 'utf8'); } catch (e) { /* keine Datei -- bleibt null, FALL 6 vergleicht trotzdem */ }

    const klon = fs.mkdtempSync(path.join(os.tmpdir(), 'gegenleser-selbsttest-'));
    process.env.ASTRA_LAUFPROTOKOLL = path.join(klon, 'hintergrund-astra-laeufe.md');
    fs.writeFileSync(process.env.ASTRA_LAUFPROTOKOLL,
        `# Hintergrund-Wegwerfprotokoll des Selbsttests\n\n${LAUFPROTOKOLL_MARKE} nur fuer main()-Aufrufe, die ASTRA_LAUFPROTOKOLL nicht selbst setzen -->\n`);
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
            let abbruch = null;
            let ergebnisText = null;
            try {
                ergebnisText = werkzeugLies('schwaerzen-viele.js', 1, 40).text;
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) { ausgeloest = true; ort = e.ort; abbruch = e; }
            }
            // "ort" benennt seit der Gegenlesung vom 13.09.2026 den
            // AUSSCHNITT eindeutig (Zeilen von-bis, dazu die Dateigesamt-
            // laenge) statt einer Trefferzahl, die mit der Dateilaenge
            // verwechselbar war -- und die Ausnahme traegt dieselben Werte
            // zusaetzlich strukturiert (Punkt 1 des Auftrags).
            pruefen(`DECKEL 27 (30 Geheimniszeilen unter 40 reissen den Deckel: GeheimnisAbbruch statt Schwaerzen, Ort: ${ort}; kein Funktionsergebnis)`,
                ausgeloest && ort === 'schwaerzen-viele.js Zeilen 1-40 (von 40)' && ergebnisText === null
                && abbruch.relativ === 'schwaerzen-viele.js' && abbruch.von === 1 && abbruch.bis === 40
                && abbruch.gesamt === 40 && abbruch.trefferZeilen === 30 && abbruch.ausschnittZeilen === 40);
        }
        {
            let ausgeloest = false;
            let ort = '-';
            let abbruch = null;
            let ergebnisText = null;
            try {
                ergebnisText = werkzeugLies('schwaerzen-anteil.js', 1, 8).text;
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) { ausgeloest = true; ort = e.ort; abbruch = e; }
            }
            pruefen(`DECKEL 35 (3 Geheimniszeilen unter 8 = 37,5 % reissen den Anteils-Deckel ab der Mindestzahl: GeheimnisAbbruch, Ort: ${ort}; kein Funktionsergebnis)`,
                ausgeloest && ort === 'schwaerzen-anteil.js Zeilen 1-8 (von 8)' && ergebnisText === null
                && abbruch.relativ === 'schwaerzen-anteil.js' && abbruch.von === 1 && abbruch.bis === 8
                && abbruch.gesamt === 8 && abbruch.trefferZeilen === 3 && abbruch.ausschnittZeilen === 8);
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

        // ===== LAUF E: geplatzter Lesungs-Deckel wird zur ABLEHNUNG, nicht
        // mehr zum ABBRUCH (Nacharbeit 13.09.2026) =====
        // schwaerzen-viele.js reisst in werkzeugLies() weiterhin denselben
        // Deckel wie in DECKEL 27 oben (der bleibt unveraendert gruen,
        // s. dort) -- main() macht daraus seit heute aber KEIN Exit 3 mehr,
        // sondern ein abgelehntes Funktionsergebnis, und der Lauf laeuft bis
        // zum regulaeren Abschluss weiter. Gemessen wird an allen Stellen,
        // die main() tatsaechlich anfasst: dem gesendeten Funktionsergebnis
        // (nicht an einer Behauptung im Text), der Konsole, dem
        // JSONL-Protokoll UND der ASTRA-LAEUFE-Zeile.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;

            const aufgezeichnetE = [];
            const ausgabeZeilenE = [];
            const fehlerZeilenE = [];
            const warteschlangeE = [
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-e1', 'lies', { pfad: 'schwaerzen-viele.js', von: 1, bis: 40 }), 100, 50),
                antwortKoerperBauen(elementTextBauen('TESTBERICHT-ABLEHNUNG'), 100, 50),
            ];
            https.request = httpsStubBauen(warteschlangeE, aufgezeichnetE);
            console.log = (msg) => ausgabeZeilenE.push(String(msg));
            console.error = (msg) => fehlerZeilenE.push(String(msg));

            const protokollPfadE = path.join(klon, 'selbsttest-protokoll-e.jsonl');
            let codeE;
            try {
                codeE = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--max-runden=10',
                    `--protokoll=${protokollPfadE}`,
                    '--zweck=selbsttest-lauf-e-ablehnung',
                ]);
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen(`LAUF E ABGESCHLOSSEN 36 (geplatzter Lesungs-Deckel bricht NICHT mehr den Lauf ab: Exit ${codeE} (erwartet 0), ${aufgezeichnetE.length} Anfragekoerper gebaut (erwartet 2 -- ein Abbruch nach der ersten Anfrage waere nur 1), Bericht kam an)`,
                codeE === 0 && aufgezeichnetE.length === 2
                && ausgabeZeilenE.some((z) => z.includes('TESTBERICHT-ABLEHNUNG'))
                && ausgabeZeilenE.some((z) => z.includes('Bericht regulaer erstellt')));

            pruefen('LAUF E KONSOLE 37 (Meldung heisst "LESUNG ABGELEHNT", nennt Ort und "der Lauf geht weiter" -- NICHT mehr "ABBRUCH")',
                fehlerZeilenE.some((z) => z.includes('LESUNG ABGELEHNT') && z.includes('schwaerzen-viele.js Zeilen 1-40 (von 40)') && z.includes('der Lauf geht weiter'))
                && !fehlerZeilenE.some((z) => z.includes('ABBRUCH') && z.toLowerCase().includes('geheimnis')));

            const funktionsausgabeE = aufgezeichnetE.length === 2
                ? aufgezeichnetE[1].input.filter((e) => e.type === 'function_call_output' && e.call_id === 'call-e1').map((e) => e.output).join('\n')
                : '';
            // Nacharbeit 13.09.2026 (Gegenlesung): der Ablehnungstext darf
            // nicht mehr behaupten, aus der DATEI werde nichts geliefert
            // (falsch -- ein anderer Ausschnitt kann durchgehen) und muss
            // genau das auch sagen.
            pruefen(`LAUF E FUNKTIONSERGEBNIS 38 (das an das Modell zurueckgegebene Funktionsergebnis fuer call-e1 ist eine Ablehnung, nennt Ausschnitt und Musternamen, sagt zutreffend statt "deshalb wird NICHTS aus dieser Datei geliefert", aber KEIN Geheimnismaterial -- Fragment "N".repeat(20) kommt ${vorkommen(funktionsausgabeE, 'N'.repeat(20))}x vor, erwartet 0)`,
                funktionsausgabeE.startsWith('abgelehnt:')
                && funktionsausgabeE.includes('schwaerzen-viele.js Zeilen 1-40 (von 40)')
                && funktionsausgabeE.includes('GitHub-Token')
                && funktionsausgabeE.includes('aus DIESEM Ausschnitt wird')
                && funktionsausgabeE.includes('Ein anderer oder kleinerer Ausschnitt derselben Datei kann dagegen durchgehen')
                && !funktionsausgabeE.includes('deshalb wird NICHTS aus dieser Datei geliefert')
                && vorkommen(funktionsausgabeE, 'N'.repeat(20)) === 0);

            const zusammenfassungE = ausgabeZeilenE.join('\n');
            pruefen('LAUF E ZUSAMMENFASSUNG 39 (neuer Block "ABGELEHNTE LESUNGEN" spricht von AUSSCHNITTEN statt von Dateien und nennt Bereich, Gesamtlaenge, Trefferzahl und Musternamen)',
                !zusammenfassungE.includes('diese Dateien hat der Pruefer NIE gesehen')
                && zusammenfassungE.includes('ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; andere Teile derselben Datei koennen geliefert worden sein):')
                && zusammenfassungE.includes('  schwaerzen-viele.js Zeilen 1-40 (von 40) — 30 Trefferzeilen, Muster: GitHub-Token'));

            const protokollEintraegeE = fs.readFileSync(protokollPfadE, 'utf8').trim().split('\n').filter(Boolean).map((z) => JSON.parse(z));
            pruefen('LAUF E JSONL-PROTOKOLL 40 (ein Eintrag vom neuen Typ "geheimnis_ablehnung", KEINER mehr vom alten Typ "geheimnis_abbruch")',
                protokollEintraegeE.some((e) => e.typ === 'geheimnis_ablehnung' && e.ort === 'schwaerzen-viele.js Zeilen 1-40 (von 40)'
                    && Array.isArray(e.muster) && e.muster.includes('GitHub-Token'))
                && !protokollEintraegeE.some((e) => e.typ === 'geheimnis_abbruch'));

            const hintergrundNachLaufE = fs.readFileSync(process.env.ASTRA_LAUFPROTOKOLL, 'utf8');
            const zeileE = hintergrundNachLaufE.split('\n').find((z) => z.includes('selbsttest-lauf-e-ablehnung'));
            pruefen(`LAUF E ASTRA-LAEUFE-ZEILE 41 (der Lauf traegt sich als REGULAERER Abschluss ins Lauf-Protokoll ein, NICHT als Abbruch: Zeile "${zeileE}")`,
                Boolean(zeileE) && !zeileE.includes('abgebrochen'));
        }

        // ===== GEMISCHTER LAUF: derselbe Lauf liest dieselbe Datei ERST in
        // einem harmlosen Teilbereich, DANACH im vollen Bereich, wo der
        // Deckel reisst (Nacharbeit 13.09.2026, Gegenlesung) =====
        // Das ist der Fall, der den eigentlichen Befund bewacht: die alte
        // Formulierung behauptete, der Pruefer habe die DATEI nie gesehen --
        // hier hat er sie tatsaechlich schon gelesen (Zeilen 1-10, reine
        // Fuellzeilen aus der Fixture-Anlage oben), BEVOR derselbe Deckel
        // wie in DECKEL 27 auf den vollen Bereich 1-40 reisst. Die Datei
        // muss danach GLEICHZEITIG unter GELESENE DATEIEN und mit ihrem
        // abgelehnten Ausschnitt unter ABGELEHNTE LESUNGEN stehen.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;

            const aufgezeichnetGL = [];
            const ausgabeZeilenGL = [];
            const warteschlangeGL = [
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-gl1', 'lies', { pfad: 'schwaerzen-viele.js', von: 1, bis: 10 }), 100, 50),
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-gl2', 'lies', { pfad: 'schwaerzen-viele.js', von: 1, bis: 40 }), 100, 50),
                antwortKoerperBauen(elementTextBauen('TESTBERICHT-GEMISCHT'), 100, 50),
            ];
            https.request = httpsStubBauen(warteschlangeGL, aufgezeichnetGL);
            console.log = (msg) => ausgabeZeilenGL.push(String(msg));
            console.error = () => {}; // eigene Ausgabe hier nicht gebraucht, LAUF E prueft sie bereits

            const protokollPfadGL = path.join(klon, 'selbsttest-protokoll-gemischt.jsonl');
            let codeGL;
            try {
                codeGL = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--max-runden=10',
                    `--protokoll=${protokollPfadGL}`,
                    '--zweck=selbsttest-lauf-gemischt',
                ]);
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen(`GEMISCHTER LAUF ABGESCHLOSSEN 59 (dieselbe Datei wird ERST im harmlosen Bereich 1-10, DANN im vollen Bereich 1-40 gelesen, wo der Deckel reisst: Exit ${codeGL} (erwartet 0), ${aufgezeichnetGL.length} Anfragekoerper gebaut (erwartet 3: Lesung 1 -> Lesung 2 -> Bericht), Bericht kam an)`,
                codeGL === 0 && aufgezeichnetGL.length === 3
                && ausgabeZeilenGL.some((z) => z.includes('TESTBERICHT-GEMISCHT')));

            // Die letzte Anfrage traegt die volle Historie, also BEIDE
            // Funktionsergebnisse -- wie bei aufgezeichnetD[4] in LAUF D.
            const funktionsausgabeGL1 = aufgezeichnetGL.length === 3
                ? aufgezeichnetGL[2].input.filter((e) => e.type === 'function_call_output' && e.call_id === 'call-gl1').map((e) => e.output).join('\n')
                : '';
            const funktionsausgabeGL2 = aufgezeichnetGL.length === 3
                ? aufgezeichnetGL[2].input.filter((e) => e.type === 'function_call_output' && e.call_id === 'call-gl2').map((e) => e.output).join('\n')
                : '';

            pruefen('GEMISCHTER LAUF ERSTE LESUNG 60 (Bereich 1-10 ist reiner Fuellzeilenbereich: das Funktionsergebnis enthaelt echten Dateiinhalt, keine Ablehnung)',
                !funktionsausgabeGL1.startsWith('abgelehnt:')
                && funktionsausgabeGL1.includes('schwaerzen-viele.js (Zeilen 1-10 von 40)')
                && funktionsausgabeGL1.includes('1:// Zeile 1') && funktionsausgabeGL1.includes('10:// Zeile 10'));

            pruefen('GEMISCHTER LAUF ZWEITE LESUNG 61 (derselbe Deckel wie in DECKEL 27, diesmal auf denselben Bereich wie dort: das Funktionsergebnis ist eine Ablehnung)',
                funktionsausgabeGL2.startsWith('abgelehnt:'));

            const zusammenfassungGL = ausgabeZeilenGL.join('\n');
            pruefen('GEMISCHTER LAUF ZUSAMMENFASSUNG 62 (die Datei steht in GELESENE DATEIEN UND ihr abgelehnter Ausschnitt in ABGELEHNTE LESUNGEN -- die Ueberschrift behauptet NICHT mehr, die DATEI sei nie gesehen worden)',
                zusammenfassungGL.includes('GELESENE DATEIEN:') && zusammenfassungGL.includes('  schwaerzen-viele.js:1-10')
                && !zusammenfassungGL.includes('diese Dateien hat der Pruefer NIE gesehen')
                && zusammenfassungGL.includes('ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; andere Teile derselben Datei koennen geliefert worden sein):')
                && zusammenfassungGL.includes('  schwaerzen-viele.js Zeilen 1-40 (von 40) — 30 Trefferzeilen, Muster: GitHub-Token'));

            pruefen(`GEMISCHTER LAUF ABLEHNUNGSTEXT 63 (der an das Modell gesendete Ablehnungstext nennt den Bereich 1-40 und den Satz ueber den kleineren Ausschnitt, ohne Geheimnismaterial -- Fragment "N".repeat(20) kommt ${vorkommen(funktionsausgabeGL2, 'N'.repeat(20))}x vor, erwartet 0)`,
                funktionsausgabeGL2.includes('schwaerzen-viele.js Zeilen 1-40 (von 40)')
                && funktionsausgabeGL2.includes('Ein anderer oder kleinerer Ausschnitt derselben Datei kann dagegen durchgehen')
                && vorkommen(funktionsausgabeGL2, 'N'.repeat(20)) === 0);
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

        // ===== LAUF-PROTOKOLL (TEIL D): die acht Faelle aus dem Auftrag =====
        // Jeder Fall misst am INHALT der Wegwerfdatei danach, nicht am
        // Rueckgabewert einer Hilfsfunktion. Die Fixture bildet die echte
        // ASTRA-LAEUFE.md strukturell nach: zwei Tabellen, die Marke
        // dazwischen als mehrzeiliger Kommentar (woertlich wie im echten
        // Kopf von ASTRA-LAEUFE.md), damit "unmittelbar darueber" auch bei
        // der ECHTEN mehrzeiligen Marke gemessen wird, nicht bei einer
        // vereinfachten einzeiligen Attrappe.
        const protokollFixtureInhalt = [
            '# Astra-Laeufe (Testfixture, KEINE echte Datei)',
            '',
            '| Datum | Zweck | Material | Befunde | getragen | gefallen | Kosten |',
            '|---|---|---|---|---|---|---|',
            '| 01.01.2020 | Bestandszeile, darf nicht angefasst werden | 1 Datei | 1 | 1 | 0 | 0,10 $ |',
            // Punkt E (Nacharbeit 13.09.2026): WOERTLICHES Literal, NICHT
            // die Konstante LAUFPROTOKOLL_MARKE -- sonst aendern sich
            // Fixture, gesuchte Position UND erwarteter Fehlertext (FALL 3
            // unten) gemeinsam mit der Konstante mit, und der Selbsttest
            // bliebe gruen, waehrend echte Laeufe nichts mehr eintragen.
            '<!-- NEUE-LAUFZEILE-HIER: tools/gegenleser-repo.js traegt jede neue Zeile',
            '     UNMITTELBAR UEBER dieser Marke ein. Sie darf nicht entfernt oder',
            '     verschoben werden; fehlt sie, meldet das Werkzeug das LAUT und bricht',
            '     nicht still ab. Grund fuer die Marke: diese Datei hat ZWEI Tabellen, und',
            '     ohne sie landete die Zeile in der falschen. -->',
            '',
            '## Woher die Befunde kamen (Testfixture, zweite Tabelle)',
            '',
            '| Befund | Erreichbar ueber | Wert |',
            '|---|---|---|',
            '| X | Y | Z |',
            '',
        ].join('\n');
        // Dieselbe Fixture, aber OHNE die Marke -- fuer FALL 3.
        const protokollFixtureOhneMarke = [
            '# Astra-Laeufe (Testfixture, KEINE echte Datei, MARKE FEHLT ABSICHTLICH)',
            '',
            '| Datum | Zweck | Material | Befunde | getragen | gefallen | Kosten |',
            '|---|---|---|---|---|---|---|',
            '| 01.01.2020 | Bestandszeile, darf nicht angefasst werden | 1 Datei | 1 | 1 | 0 | 0,10 $ |',
            '',
            '## Woher die Befunde kamen (Testfixture, zweite Tabelle)',
            '',
            '| Befund | Erreichbar ueber | Wert |',
            '|---|---|---|',
            '| X | Y | Z |',
            '',
        ].join('\n');
        // Die Zeile UNMITTELBAR ueber der (mehrzeiligen) Marke -- exakt das,
        // was laufprotokollEinfuegen() als Einfuegepunkt benutzt, hier aber
        // unabhaengig ueber split('\n') statt ueber String-Indizes gefunden.
        const zeileUnmittelbarUeberMarke = (inhalt) => {
            const zeilen = inhalt.split('\n');
            const markeIdx = zeilen.findIndex((z) => z.includes(LAUFPROTOKOLL_MARKE));
            return markeIdx > 0 ? zeilen[markeIdx - 1] : null;
        };
        // Gemeinsamer Traeger fuer FALL 1/3/4/7/8: EIN Sofort-Text ohne
        // Werkzeugaufruf (wie LAUF B), IMMER mit 1.500.000 Eingabe- und
        // 300.000 Ausgabe-Token und Modell gpt-6-astra -- fest und
        // dokumentiert, damit die Faelle unten woertliche Erwartungswerte
        // benutzen koennen, statt sich auf kostenSchaetzen() zu verlassen,
        // um sich selbst zu pruefen.
        const protokolliertenLaufAusfuehren = async (protokollPfadWert, extraArgs) => {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            const alteProtokollUmgebungLokal = process.env.ASTRA_LAUFPROTOKOLL;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            if (protokollPfadWert === undefined) delete process.env.ASTRA_LAUFPROTOKOLL;
            else process.env.ASTRA_LAUFPROTOKOLL = protokollPfadWert;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;
            const chronologisch = [];
            const aufgezeichnet = [];
            https.request = httpsStubBauen(
                [antwortKoerperBauen(elementTextBauen('TESTBERICHT-LAUF-PROTOKOLL'), 1_500_000, 300_000)],
                aufgezeichnet,
            );
            console.log = (m) => chronologisch.push(String(m));
            console.error = (m) => chronologisch.push(String(m));
            let code;
            try {
                code = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-6-astra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, `selbsttest-protokoll-lp-${chronologisch.length}-${Math.random().toString(36).slice(2)}.jsonl`)}`,
                    ...(extraArgs || []),
                ]);
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
                if (alteProtokollUmgebungLokal !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungLokal;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
            }
            return { code, chronologisch, aufgezeichnet };
        };
        // Unabhaengig von Node/Intl ermitteltes heutiges Datum (Europe/Berlin)
        // ueber das System-Kommando "date" -- eine Zusicherung, die ihr
        // Soll aus derselben Intl-Formel bezieht, die sie pruefen soll,
        // koennte einen systematischen Fehler in dieser Formel nie finden.
        const datumUeberSystemBefehl = execFileSync('date', ['+%d.%m.%Y'], { env: { ...process.env, TZ: 'Europe/Berlin' } })
            .toString().trim();

        // ----- FALL 1+2: normaler Lauf, GENAU EINE Zeile, Spalten korrekt,
        // die zweite Tabelle bleibt bytegleich -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall1.md');
            fs.writeFileSync(protokollPfad, protokollFixtureInhalt);

            const { code: code1 } = await protokolliertenLaufAusfuehren(protokollPfad, []);

            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            const zusatzZeilen = inhaltNachher.split('\n').length - protokollFixtureInhalt.split('\n').length;
            const neueZeile = zeileUnmittelbarUeberMarke(inhaltNachher);
            const erwarteterZweck = path.basename(briefFixturePfad, path.extname(briefFixturePfad));
            // Woertlicher Erwartungswert (gpt-6-astra: 12,50 $/Mio rein,
            // 75,00 $/Mio raus): 1,5 * 12,50 = 18,75; 0,3 * 75,00 = 22,50;
            // Summe 41,25 $ -- NICHT aus kostenSchaetzen() zurueckgerechnet.
            const zeileVollstaendigErwartet = `| ${datumUeberSystemBefehl} | ${erwarteterZweck} `
                + '| Diff 3 Zeilen, Suchen 0, Lesungen 0, Token rein 1500000, Token raus 300000, Runden 1 '
                + '| — | — | — | 41,25 $ |';

            pruefen(`LAUF-PROTOKOLL FALL 1 (36) (normaler Lauf endet mit Exit ${code1} und traegt GENAU EINE neue Zeile unmittelbar ueber der (mehrzeiligen) Marke ein, ${zusatzZeilen} zusaetzliche Zeile(n), Bestandszeile bleibt erhalten)`,
                code1 === 0 && zusatzZeilen === 1 && inhaltNachher.includes('Bestandszeile, darf nicht angefasst werden'));

            pruefen(`LAUF-PROTOKOLL FALL 1 SPALTEN (37) (die neue Zeile stimmt WOERTLICH -- Datum unabhaengig ueber "date" ermittelt, Zweck ist der Basisname der Brief-Datei (kein --zweck gesetzt), Befunde/getragen/gefallen sind "—", Kosten "41,25 $": "${neueZeile}")`,
                neueZeile === zeileVollstaendigErwartet);
        }

        // ----- FALL 2 ist Teil von FALL 1 oben (dieselbe geschriebene Datei):
        // die zweite Tabelle bleibt dabei bytegleich -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall1.md'); // von FALL 1 oben bereits beschrieben
            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            pruefen('LAUF-PROTOKOLL FALL 2 (38) (die zweite Tabelle "Woher die Befunde kamen" bleibt beim Eintragen BYTEGLEICH unveraendert)',
                inhaltNachher.slice(inhaltNachher.indexOf('-->')) === protokollFixtureInhalt.slice(protokollFixtureInhalt.indexOf('-->')));
        }

        // ----- FALL 3: Marke fehlt -- laut, nichts angehaengt, Exit unveraendert -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall3-ohne-marke.md');
            fs.writeFileSync(protokollPfad, protokollFixtureOhneMarke);

            const { code: code3, chronologisch: chrono3 } = await protokolliertenLaufAusfuehren(protokollPfad, []);

            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            pruefen(`LAUF-PROTOKOLL FALL 3 (39) (fehlende Marke: der Lauf endet trotzdem mit dem UNVERAENDERTEN Exit ${code3}, die Protokolldatei bleibt BYTEGLEICH -- keine Zeile irgendwo angehaengt)`,
                code3 === 0 && inhaltNachher === protokollFixtureOhneMarke);
            pruefen(`LAUF-PROTOKOLL FALL 3 MELDUNG (40) (der Fehlschlag wird LAUT UND GENAU ZWEIMAL gemeldet, die zweite -- unverwechselbar gekennzeichnete -- Meldung ist die ALLERLETZTE Zeile der GESAMTEN Ausgabe)`,
                chrono3.filter((z) => z.includes('konnte NICHT eingetragen werden')).length === 1
                // Punkt E: woertliches Literal statt der Konstante -- s.
                // Kommentar bei protokollFixtureInhalt oben.
                && chrono3.some((z) => z.includes('Marke "<!-- NEUE-LAUFZEILE-HIER:" fehlt'))
                && chrono3[chrono3.length - 1].startsWith('LETZTE ZEILE -- PROTOKOLLEINTRAG FEHLGESCHLAGEN'));
        }

        // ----- FALL 4: Datei fehlt -- laut, nichts angelegt, Exit unveraendert -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall4-existiert-nicht.md'); // wird NIE angelegt

            const { code: code4, chronologisch: chrono4 } = await protokolliertenLaufAusfuehren(protokollPfad, []);

            const dateiEntstanden = fs.existsSync(protokollPfad);
            pruefen(`LAUF-PROTOKOLL FALL 4 (41) (fehlende Protokolldatei: der Lauf endet trotzdem mit dem UNVERAENDERTEN Exit ${code4}, es wird KEINE Datei angelegt)`,
                code4 === 0 && dateiEntstanden === false);
            pruefen(`LAUF-PROTOKOLL FALL 4 MELDUNG (42) (der Fehlschlag wird LAUT UND GENAU ZWEIMAL gemeldet, die zweite -- unverwechselbar gekennzeichnete -- Meldung ist die ALLERLETZTE Zeile der GESAMTEN Ausgabe)`,
                chrono4.filter((z) => z.includes('konnte NICHT eingetragen werden')).length === 1
                && chrono4.some((z) => z.includes('nicht lesbar'))
                && chrono4[chrono4.length - 1].startsWith('LETZTE ZEILE -- PROTOKOLLEINTRAG FEHLGESCHLAGEN'));
        }

        // ----- FALL 5: Abbruch ueber den Geheimnis-Riegel (auf dem
        // Eingabediff) traegt trotzdem eine Zeile mit Strichen ein -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall5.md');
            fs.writeFileSync(protokollPfad, protokollFixtureInhalt);

            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            const alteProtokollUmgebungLokal = process.env.ASTRA_LAUFPROTOKOLL;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            process.env.ASTRA_LAUFPROTOKOLL = protokollPfad;
            const echtesHttpsRequest = https.request;
            const aufgezeichnetF5 = [];
            https.request = httpsStubBauen([], aufgezeichnetF5); // leere Warteschlange: es darf NIE gesendet werden
            let code5;
            try {
                code5 = await main([
                    diffMitGeheimnisPfad,
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-6-astra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-fall5.jsonl')}`,
                ]);
            } finally {
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
                if (alteProtokollUmgebungLokal !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungLokal;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
            }
            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            const neueZeileF5 = zeileUnmittelbarUeberMarke(inhaltNachher);
            pruefen(`LAUF-PROTOKOLL FALL 5 (43) (Abbruch ueber den Geheimnis-Riegel auf dem Eingabediff: Exit ${code5} bleibt UNVERAENDERT bei 3, es wurde weiterhin NICHTS gesendet, ${aufgezeichnetF5.length} Anfragen)`,
                code5 === 3 && aufgezeichnetF5.length === 0);
            pruefen(`LAUF-PROTOKOLL FALL 5 ZEILE (44) (trotzdem wird EINE Zeile eingetragen: Befunde/getragen/gefallen sind "—", "**abgebrochen**" und die Kosten (0,00 $, da nichts gesendet wurde) stehen drin: "${neueZeileF5}")`,
                typeof neueZeileF5 === 'string'
                && neueZeileF5.includes('**abgebrochen**')
                && neueZeileF5.includes('Geheimnis-Riegel')
                && neueZeileF5.includes('| — | — | — |')
                && neueZeileF5.includes('| 0,00 $ |'));
        }

        // ----- FALL 7: Zweck enthaelt ein "|" -- wird maskiert, Tabelle
        // bleibt bei genau 7 echten Spalten -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall7.md');
            fs.writeFileSync(protokollPfad, protokollFixtureInhalt);

            const { code: code7 } = await protokolliertenLaufAusfuehren(protokollPfad, ['--zweck=Testzweck mit | Pipe-Zeichen']);

            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            const neueZeileF7 = zeileUnmittelbarUeberMarke(inhaltNachher);
            // Nur UNESCAPTE "|" trennen echte Spalten (negativer Lookbehind
            // auf Backslash) -- so bleibt die Tabelle trotz des Pipe-
            // Zeichens im Zweck bei genau 7 Spalten (8 Trennzeichen minus
            // die beiden aeusseren Rand-Elemente).
            const echteSpalten = typeof neueZeileF7 === 'string'
                ? neueZeileF7.split(/(?<!\\)\|/).slice(1, -1)
                : [];
            pruefen(`LAUF-PROTOKOLL FALL 7 (45) (Zweck enthaelt ein "|": es kommt MASKIERT ("\\|") in die Zeile, die Tabelle bleibt bei genau 7 echten Spalten (nur unescapte "|" gezaehlt): "${neueZeileF7}")`,
                code7 === 0 && typeof neueZeileF7 === 'string'
                && neueZeileF7.includes('Testzweck mit \\| Pipe-Zeichen')
                && echteSpalten.length === 7);
        }

        // ----- FALL 8: Positivkontrolle -- ohne Lauf keine Zeile, der
        // Schreibpfad laeuft nicht ungefragt -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall8.md');
            fs.writeFileSync(protokollPfad, protokollFixtureInhalt);
            const alteProtokollUmgebungLokal = process.env.ASTRA_LAUFPROTOKOLL;
            process.env.ASTRA_LAUFPROTOKOLL = protokollPfad;
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            delete process.env.OPENAI_API_KEY;
            delete process.env.OPENAI_KEY_DATEI;
            let code8;
            try {
                // KEIN --brief -> Exit 6, "gar kein Lauf fand statt" (TEIL D).
                code8 = await main([path.join(klon, 'harmlos.txt'), `--wurzel=${klon}`]);
            } finally {
                if (alteProtokollUmgebungLokal !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungLokal;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            pruefen(`LAUF-PROTOKOLL FALL 8 (46) (POSITIVKONTROLLE: ein Aufruf ohne --brief bricht mit Exit ${code8} ab, BEVOR ueberhaupt ein Lauf stattfand -- die Protokolldatei bleibt BYTEGLEICH unveraendert, der Schreibpfad laeuft nicht ungefragt)`,
                code8 === 6 && inhaltNachher === protokollFixtureInhalt);
        }

        // ===== NACHARBEIT 13.09.2026 (GEGENLESUNG VON TEIL D): PUNKTE A-F =====

        // ----- PUNKT A: Sicherheitsnetz greift bei einem Fehler NACH
        // Modellkontakt (main() wirft nach main().catch(...) mit Exit 1) --
        // der bereits bezahlte Verbrauch aus Runde 1 darf dabei NICHT
        // spurlos verschwinden. Runde 1 liefert einen Werkzeugaufruf (also
        // gibt es ueberhaupt eine Runde 2), fuer Runde 2 ist die
        // Warteschlange leer -- der https-Stub wirft dort SYNCHRON, die
        // Promise von anfragen() lehnt ab, main() wirft weiter (siehe
        // main(), "throw e" im catch um anfragen()). -----
        {
            const protokollPfadA = path.join(klon, 'protokoll-punkt-a.md');
            fs.writeFileSync(protokollPfadA, protokollFixtureInhalt);

            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            const alteProtokollUmgebungLokal = process.env.ASTRA_LAUFPROTOKOLL;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            process.env.ASTRA_LAUFPROTOKOLL = protokollPfadA;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;
            const chronoA2 = [];
            console.log = (m) => chronoA2.push(String(m));
            console.error = (m) => chronoA2.push(String(m));
            const aufgezeichnetA2 = [];
            https.request = httpsStubBauen(
                [antwortKoerperBauen(elementFunktionsaufrufBauen('call-punkt-a-1', 'suche', { muster: 'Zeile' }), 1000, 200)],
                aufgezeichnetA2,
            );
            let geworfenerFehlerA2 = null;
            try {
                await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-6-astra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-punkt-a.jsonl')}`,
                ]);
            } catch (e) {
                geworfenerFehlerA2 = e;
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
                if (alteProtokollUmgebungLokal !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungLokal;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
            }

            const inhaltNachherA2 = fs.readFileSync(protokollPfadA, 'utf8');
            const zusatzZeilenA2 = inhaltNachherA2.split('\n').length - protokollFixtureInhalt.split('\n').length;
            const neueZeileA2 = zeileUnmittelbarUeberMarke(inhaltNachherA2);
            pruefen(`PUNKT A SICHERHEITSNETZ (48) (main() wirft nach Modellkontakt in Runde 2 -- geworfener Fehler: "${geworfenerFehlerA2 ? geworfenerFehlerA2.message : '(keiner geworfen!)'}" -- traegt trotzdem GENAU EINE Zeile ein, mit Abbruchgrund und "mind. " vor den Kosten: "${neueZeileA2}")`,
                geworfenerFehlerA2 !== null
                && zusatzZeilenA2 === 1
                && typeof neueZeileA2 === 'string'
                && neueZeileA2.includes('**abgebrochen** (unerwarteter Fehler nach Modellkontakt (Exit 1))')
                && /\| mind\. \d+,\d\d \$ \|$/.test(neueZeileA2));
        }

        // ----- PUNKT B1: ATOMARER AUSTAUSCH -- ein gescheitertes Schreiben
        // der Wegwerfdatei darf die Zieldatei NICHT anfassen. Simuliert
        // durch einen fs.writeFileSync-Stub, der NUR beim Schreiben der
        // Wegwerfdatei (".tmp-<pid>") wirft; die Zieldatei wird nur ueber
        // fs.renameSync erreicht, das dieser Stub nicht anfasst. -----
        {
            const protokollPfadB1 = path.join(klon, 'protokoll-punkt-b1.md');
            fs.writeFileSync(protokollPfadB1, protokollFixtureInhalt);
            const vorherB1 = fs.readFileSync(protokollPfadB1, 'utf8');

            const echtesWriteFileSync = fs.writeFileSync;
            let tmpDateiGesehen = false;
            fs.writeFileSync = function (pfad, ...rest) {
                if (typeof pfad === 'string' && pfad.includes('.tmp-')) {
                    tmpDateiGesehen = true;
                    throw new Error('Simulierte volle Platte (Selbsttest)');
                }
                return echtesWriteFileSync.call(fs, pfad, ...rest);
            };
            let ergebnisB1;
            try {
                ergebnisB1 = laufprotokollEinfuegen(protokollPfadB1, '| Zeile, die NICHT ankommen darf (b1) |');
            } finally {
                fs.writeFileSync = echtesWriteFileSync;
            }
            const nachherB1 = fs.readFileSync(protokollPfadB1, 'utf8');
            const tmpUebrigB1 = fs.existsSync(`${protokollPfadB1}.tmp-${process.pid}`);
            pruefen(`PUNKT B1 ATOMAR (49) (ein gescheitertes Schreiben der Wegwerfdatei laesst die Zieldatei UNANGETASTET (byte-gleich), meldet {ok:false}, keine Wegwerfdatei bleibt liegen: ok=${ergebnisB1.ok}, Wegwerfdatei tatsaechlich angefasst=${tmpDateiGesehen}, Wegwerfdatei uebrig=${tmpUebrigB1})`,
                ergebnisB1.ok === false && tmpDateiGesehen === true && tmpUebrigB1 === false && nachherB1 === vorherB1);
        }

        // ----- PUNKT B2: SPERRE ueber den gesamten Lese-Aendere-Schreibe-
        // Vorgang -- eine VORHANDENE, FRISCHE Sperrdatei blockiert (liefert
        // {ok:false}, OHNE die Zieldatei anzufassen); eine VERALTETE (>60s)
        // wird geloescht, der Versuch laeuft durch. -----
        {
            const protokollPfadB2 = path.join(klon, 'protokoll-punkt-b2.md');
            fs.writeFileSync(protokollPfadB2, protokollFixtureInhalt);
            const vorherB2 = fs.readFileSync(protokollPfadB2, 'utf8');
            const sperrPfadB2 = `${protokollPfadB2}.lock`;

            fs.writeFileSync(sperrPfadB2, ''); // frische Sperrdatei
            const startB2a = Date.now();
            const ergebnisB2a = laufprotokollEinfuegen(protokollPfadB2, '| Zeile, die NICHT ankommen darf (b2a) |');
            const dauerB2a = Date.now() - startB2a;
            const nachherB2a = fs.readFileSync(protokollPfadB2, 'utf8');
            fs.rmSync(sperrPfadB2, { force: true }); // fuer b2b aufraeumen

            pruefen(`PUNKT B2A SPERRE FRISCH (50) (eine VORHANDENE, frische Sperrdatei blockiert: {ok:false}, Zieldatei UNANGETASTET, Meldung nennt "gesperrt", ${dauerB2a} ms gewartet)`,
                ergebnisB2a.ok === false
                && /gesperrt/i.test(ergebnisB2a.grund || '')
                && nachherB2a === vorherB2);

            fs.writeFileSync(sperrPfadB2, ''); // erneut anlegen, diesmal 61s "alt"
            const alt = new Date(Date.now() - 61 * 1000);
            fs.utimesSync(sperrPfadB2, alt, alt);
            const ergebnisB2b = laufprotokollEinfuegen(protokollPfadB2, '| Zeile, die ankommen MUSS (b2b) |');
            const nachherB2b = fs.readFileSync(protokollPfadB2, 'utf8');

            pruefen(`PUNKT B2B SPERRE VERALTET (51) (eine 61s ALTE Sperrdatei wird geloescht, der Versuch laeuft durch: ok=${ergebnisB2b.ok}, Zeile angekommen=${nachherB2b.includes('Zeile, die ankommen MUSS (b2b)')}, Sperre danach freigegeben=${!fs.existsSync(sperrPfadB2)})`,
                ergebnisB2b.ok === true
                && nachherB2b.includes('Zeile, die ankommen MUSS (b2b)')
                && !fs.existsSync(sperrPfadB2));
        }

        // ----- PUNKT C1: Datei mit ZWEI Marken -- nichts geschrieben,
        // Meldung nennt die Zahl. -----
        {
            const zweiMarkenInhalt = `${protokollFixtureInhalt}\n<!-- NEUE-LAUFZEILE-HIER: zweites Vorkommen, absichtlich fuer den Test -->\n`;
            const protokollPfadC1 = path.join(klon, 'protokoll-punkt-c1.md');
            fs.writeFileSync(protokollPfadC1, zweiMarkenInhalt);
            const ergebnisC1 = laufprotokollEinfuegen(protokollPfadC1, '| Zeile, die NICHT ankommen darf (c1) |');
            const nachherC1 = fs.readFileSync(protokollPfadC1, 'utf8');
            pruefen(`PUNKT C1 MEHRDEUTIG (52) (Datei mit ZWEI Marken: nichts geschrieben, Meldung nennt die Zahl 2, Datei unveraendert: "${ergebnisC1.grund}")`,
                ergebnisC1.ok === false
                && /2-mal/.test(ergebnisC1.grund || '')
                && nachherC1 === zweiMarkenInhalt);
        }

        // ----- PUNKT C2: Marke mitten in einer Zeile -- nichts
        // geschrieben. -----
        {
            const markeMittenInhalt = protokollFixtureInhalt.replace(LAUFPROTOKOLL_MARKE, `xxx${LAUFPROTOKOLL_MARKE}`);
            const protokollPfadC2 = path.join(klon, 'protokoll-punkt-c2.md');
            fs.writeFileSync(protokollPfadC2, markeMittenInhalt);
            const ergebnisC2 = laufprotokollEinfuegen(protokollPfadC2, '| Zeile, die NICHT ankommen darf (c2) |');
            const nachherC2 = fs.readFileSync(protokollPfadC2, 'utf8');
            pruefen(`PUNKT C2 NICHT ZEILENANFANG (53) (Marke mitten in einer Zeile: nichts geschrieben, Datei unveraendert: "${ergebnisC2.grund}")`,
                ergebnisC2.ok === false
                && /Zeilenanfang/.test(ergebnisC2.grund || '')
                && nachherC2 === markeMittenInhalt);
        }

        // ----- PUNKT C3: --zweck mit der Markenzeichenfolge -- die
        // geschriebene Zeile enthaelt "&lt;!--" statt der rohen
        // Zeichenfolge, UND ein ZWEITER Lauf danach fuegt immer noch an der
        // richtigen (echten) Stelle ein -- das ist der eigentliche Beweis,
        // dass die eingeschleuste Zeichenfolge NICHT als neue Marke
        // durchgeht. -----
        {
            const protokollPfadC3 = path.join(klon, 'protokoll-punkt-c3.md');
            fs.writeFileSync(protokollPfadC3, protokollFixtureInhalt);

            const zweckMitMarke = `Boesartig ${LAUFPROTOKOLL_MARKE} Einschleusung`;
            const { code: codeC3a } = await protokolliertenLaufAusfuehren(protokollPfadC3, [`--zweck=${zweckMitMarke}`]);
            const nachErstemLaufC3 = fs.readFileSync(protokollPfadC3, 'utf8');
            const geschriebeneZeileC3 = zeileUnmittelbarUeberMarke(nachErstemLaufC3);

            const { code: codeC3b } = await protokolliertenLaufAusfuehren(protokollPfadC3, ['--zweck=Zweiter regulaerer Lauf']);
            const nachZweitemLaufC3 = fs.readFileSync(protokollPfadC3, 'utf8');
            const zeileZweiterLaufC3 = zeileUnmittelbarUeberMarke(nachZweitemLaufC3);
            const zusatzZeilenC3 = nachZweitemLaufC3.split('\n').length - protokollFixtureInhalt.split('\n').length;

            pruefen(`PUNKT C3 MARKE-EINSCHLEUSUNG UEBER --zweck (54) (die geschriebene Zeile enthaelt "&lt;!--" statt der rohen Zeichenfolge: "${geschriebeneZeileC3}")`,
                codeC3a === 0
                && typeof geschriebeneZeileC3 === 'string'
                && geschriebeneZeileC3.includes('&lt;!-- NEUE-LAUFZEILE-HIER:')
                && !geschriebeneZeileC3.includes('<!-- NEUE-LAUFZEILE-HIER:'));
            pruefen(`PUNKT C3 ZWEITER LAUF FUEGT WEITERHIN RICHTIG EIN (55) (der eigentliche Beweis: ein ZWEITER Lauf danach findet die ECHTE Marke immer noch unverfaelscht und fuegt WIEDER genau eine Zeile darueber ein, macht insgesamt 2 zusaetzliche Zeilen: "${zeileZweiterLaufC3}")`,
                codeC3b === 0
                && zusatzZeilenC3 === 2
                && typeof zeileZweiterLaufC3 === 'string'
                && zeileZweiterLaufC3.includes('Zweiter regulaerer Lauf'));
        }

        // ----- PUNKT D: ein ALLEINSTEHENDES "\r" (kein "\r\n") in --zweck
        // darf nicht stehenbleiben -- gemessen an der geschriebenen Zeile
        // selbst, nicht an split('\n').length (das zaehlt ein rohes "\r"
        // ohnehin nicht als Zeilenumbruch; Markdown-Renderer tun es aber
        // sehr wohl). -----
        {
            const protokollPfadD = path.join(klon, 'protokoll-punkt-d.md');
            fs.writeFileSync(protokollPfadD, protokollFixtureInhalt);
            const { code: codeD2 } = await protokolliertenLaufAusfuehren(protokollPfadD, ['--zweck=Teil A\rTeil B']);
            const nachherD = fs.readFileSync(protokollPfadD, 'utf8');
            const geschriebeneZeileD = zeileUnmittelbarUeberMarke(nachherD);
            pruefen(`PUNKT D ALLEINSTEHENDES CR (56) (ein alleinstehendes "\\r" in --zweck bleibt NICHT stehen -- die Zeile enthaelt "Teil A Teil B" als EINEN zusammenhaengenden Text ohne rohes CR: "${geschriebeneZeileD}")`,
                codeD2 === 0
                && typeof geschriebeneZeileD === 'string'
                && geschriebeneZeileD.includes('Teil A Teil B')
                && !geschriebeneZeileD.includes('\r'));
        }

        // ----- PUNKT E.2: die ECHTE ASTRA-LAEUFE.md (NUR gelesen, niemals
        // geschrieben) enthaelt die AKTUELLE LAUFPROTOKOLL_MARKE-Konstante
        // GENAU EINMAL und am Zeilenanfang -- das bindet die Konstante an
        // die Wirklichkeit: der Vergleich laeuft gegen unabhaengige,
        // externe Daten (die echte Datei), nicht gegen eine aus derselben
        // Konstante gebaute Fixture. Verwendet den ganz am Kopf von
        // selbsttest() gezogenen Schnappschuss -- KEIN zweiter Lesezugriff
        // auf die echte Datei. -----
        {
            const inhaltEcht = echtesProtokollVorher;
            let vorkommenGesamt = 0;
            let amZeilenanfang = false;
            if (typeof inhaltEcht === 'string') {
                for (let ab = 0; ; ) {
                    const treffer = inhaltEcht.indexOf(LAUFPROTOKOLL_MARKE, ab);
                    if (treffer === -1) break;
                    vorkommenGesamt++;
                    if (treffer === 0 || inhaltEcht[treffer - 1] === '\n') amZeilenanfang = true;
                    ab = treffer + LAUFPROTOKOLL_MARKE.length;
                }
            }
            pruefen(`WIRKLICHKEIT: LAUFPROTOKOLL_MARKE in der echten ASTRA-LAEUFE.md (57) (NUR gelesen, niemals geschrieben; die aktuelle Konstante kommt darin GENAU EINMAL und am Zeilenanfang vor: ${vorkommenGesamt} Vorkommen)`,
                typeof inhaltEcht === 'string' && vorkommenGesamt === 1 && amZeilenanfang);
        }

        // ----- PUNKT E.3: laufprotokollPfad() OHNE ASTRA_LAUFPROTOKOLL
        // trifft die ECHTE Datei -- ueber module.exports/require(__filename)
        // geholt (s. Exportkommentar am Dateiende), NICHT denselben
        // path.join-Ausdruck nachgebaut: unabhaengige Belege (Verzeichnis
        // enthaelt auch CLAUDE.md und .github) statt derselben Formel.
        // Schreibt NICHTS. ACHTUNG: der Selbsttest biegt ASTRA_LAUFPROTOKOLL
        // fuer seine gesamte Laufzeit global um (s. SICHERHEITSNETZ oben) --
        // fuer DIESEN einen Fall wird die Variable deshalb voruebergehend
        // entfernt und danach zuverlaessig wiederhergestellt. -----
        {
            const alteUmgebungStandardpfad = process.env.ASTRA_LAUFPROTOKOLL;
            delete process.env.ASTRA_LAUFPROTOKOLL;
            let ermittelterPfad;
            try {
                ermittelterPfad = require(__filename).laufprotokollPfad();
            } finally {
                if (alteUmgebungStandardpfad !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteUmgebungStandardpfad;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
            }
            const verzeichnisStandardpfad = path.dirname(ermittelterPfad);
            pruefen(`STANDARDPFAD OHNE ASTRA_LAUFPROTOKOLL (58) (trifft die echte Datei -- unabhaengige Belege statt desselben path.join-Ausdrucks: existiert, Basisname ASTRA-LAEUFE.md, Verzeichnis enthaelt auch CLAUDE.md und .github: ${ermittelterPfad})`,
                fs.existsSync(ermittelterPfad)
                && path.basename(ermittelterPfad) === 'ASTRA-LAEUFE.md'
                && fs.existsSync(path.join(verzeichnisStandardpfad, 'CLAUDE.md'))
                && fs.existsSync(path.join(verzeichnisStandardpfad, '.github')));
        }

        // ----- FALL 6: --selbsttest selbst schreibt KEINE Zeile in die
        // ECHTE ASTRA-LAEUFE.md -- gemessen ueber den gesamten bisherigen
        // Selbsttest-Lauf (LAUF A/B/C/D, DIFF-RIEGEL 31 und die Faelle 1-8
        // oben erreichen zusammen Exit 0 UND Exit 3, beides eigentlich
        // protokollpflichtig) -----
        {
            let echtesProtokollNachher = null;
            try { echtesProtokollNachher = fs.readFileSync(echteProtokollDatei, 'utf8'); } catch (e) { /* bleibt null */ }
            // Punkt F (Nacharbeit 13.09.2026): war schon der VORHER-
            // Schnappschuss nicht lesbar (echtesProtokollVorher === null),
            // ist "nachher === vorher" ein "null === null" -- GRUEN, obwohl
            // die Schutzwirkung nie gemessen wurde ("leeres Ergebnis ist
            // nicht sauberes Ergebnis"). Ein nicht messbarer Schutz ist kein
            // bestandener Schutz -- dieser Fall wird dann ROT, statt sich
            // zufaellig als bestanden auszugeben.
            if (echtesProtokollVorher === null) {
                pruefen('LAUF-PROTOKOLL FALL 6 (58) (Schnappschuss der echten Datei nicht lesbar -- die Schutzwirkung wurde NICHT gemessen)', false);
            } else {
                pruefen('LAUF-PROTOKOLL FALL 6 (58) (die ECHTE ASTRA-LAEUFE.md ist durch den GESAMTEN --selbsttest-Lauf unveraendert geblieben, obwohl mehrere main()-Aufrufe darin Exit 0 und Exit 3 erreicht haben)',
                    echtesProtokollNachher === echtesProtokollVorher);
            }
        }
    } catch (e) {
        console.log(`  ✗ FEHLT: unerwarteter Fehler im Selbsttest: ${e.message}`);
        fehler++;
    } finally {
        fs.rmSync(klon, { recursive: true, force: true });
        if (alteProtokollUmgebungGesamt !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungGesamt;
        else delete process.env.ASTRA_LAUFPROTOKOLL;
    }

    if (gelaufen !== ERWARTETE_FAELLE) {
        console.log(`  ✗ FEHLT: ${gelaufen} Faelle gelaufen, erwartet ${ERWARTETE_FAELLE} — Fall entfernt oder Abbruch mittendrin?`);
        fehler++;
    }
    console.log(fehler ? `\n${fehler} Fehler` : '\nSelbsttest sauber');
    return fehler ? 1 : 0;
}

// Punkt E.3 (Nacharbeit 13.09.2026): NUR fuer den Selbsttest -- der
// Standardpfad-Fall unten braucht Zugriff auf laufprotokollPfad(), OHNE
// denselben path.join()-Ausdruck einfach nachzubauen (das wuerde nur die
// Funktion gegen sich selbst pruefen). require(__filename) fuehrt main()
// dabei NICHT ein zweites Mal aus: Node cached ein Modul, das bereits als
// Einstiegspunkt lief, unter seinem aufgeloesten Pfad -- ein erneutes
// require() darunter liefert nur den gecachten module.exports zurueck, ohne
// den Dateikopf (und damit main()) erneut auszufuehren. Exportiert wird
// AUSSCHLIESSLICH, was der Selbsttest braucht -- keine Werkzeuge, kein
// main() selbst.
module.exports = { laufprotokollPfad, laufprotokollZelle, laufprotokollEinfuegen };

main().then((code) => { process.exitCode = code; }).catch((fehler) => {
    console.error('FEHLER:', fehler.message);
    process.exitCode = 1;
});
