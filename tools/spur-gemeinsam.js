'use strict';
//
// tools/spur-gemeinsam.js — was tools/gegenleser-repo.js und tools/bau-spur.js
// GEMEINSAM brauchen, in EINEM Modul (CLAUDE.md Abschnitt 11: "eine zweite
// Kopie wird geloescht, nicht nachgezogen"). Der Inhalt ist WOERTLICH aus
// gegenleser-repo.js herausgezogen (Auftrag Bauspur, 03.10.2026); das
// Verhalten dort ist unveraendert, sein Selbsttest haelt es fest:
//
//   - Preistabelle und kostenSchaetzen()           (dazu die Qwen-Eintraege)
//   - Dateiname-Sperre istHartGesperrt()
//   - die Lesewerkzeuge als Fabrik (Erlaubnisliste ueber "git ls-files",
//     pfadPruefen, suche, lies, GeheimnisAbbruch)
//   - die streamende Anfrage mit SSE-Auswertung (sseAnfrage)
//   - das Laufprotokoll als Markdown-Tabelle (Marke, Datum Europe/Berlin,
//     Zellen, Sperre, atomares Einfuegen)
//
// Bewusst NICHT hier: die Rundenschleife main() des Gegenlesers. Sie ist an
// dessen Protokoll gebunden (Diff als Eingabe, Bericht als Text, Exit-Codes
// 0 bis 9, Rundenhinweise). Die Bauspur hat ein anderes Protokoll (fertig(),
// Budget-Status, Schreibliste) und damit eine eigene, kurze Schleife auf
// denselben Bausteinen.
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { StringDecoder } = require('node:string_decoder');
const { entferneGeheimnisse, pruefeGeheimnisse, zeileEntferntMarker } = require('./geheimnis-riegel');

const MAX_SUCHE_ZEILEN = 80;
const MAX_LIES_ZEILEN = 400;

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
    // Nachgetragen 23.09.2026 aus platform.openai.com/docs/pricing (Standard,
    // LONG context = obere Schranke; short context: sol 2,00/10,00, luna
    // 0,10/0,50). Beide Modelle am echten Endpunkt gemessen: erreichbar,
    // effort none|low|medium|high|xhigh|max, Werkzeugweg mit zweiter Runde
    // und store:false traegt.
    'gpt-6-sol': { rein: 4.00, raus: 15.00 },
    // 01.10.2026 aus platform.openai.com/docs/pricing: gpt-6.1-sol traegt
    // dieselben Standard-Preise wie gpt-6-sol (nur Cache-Lesen billiger) --
    // also dieselbe obere Schranke.
    'gpt-6.1-sol': { rein: 4.00, raus: 15.00 },
    'gpt-6-luna': { rein: 0.20, raus: 0.75 },
    // Zweiter Anbieter DeepSeek (23.09.2026), aus
    // api-docs.deepseek.com/quick_start/pricing, Spitzenzeit/Cache-Miss als
    // obere Schranke (DeepSeek staffelt nach Tageszeit UND nach Cache-Treffer,
    // off-peak bzw. Cache-Treffer sind guenstiger -- wir schaetzen mit dem
    // teuersten Wert). GEGEN DIE PREISSEITE GEHALTEN (B5, Gegenlesung
    // 23.09.2026, Tabellenzeile "1M INPUT TOKENS (CACHE MISS)/PEAK" bzw.
    // "1M OUTPUT TOKENS/PEAK"): deepseek-v4-pro $1.32/$3.96 (unveraendert
    // bestaetigt), deepseek-flash $0.3/$1.2. Endpunkt und Format s.
    // ENDPUNKT_DEEPSEEK oben.
    'deepseek-v4-pro': { rein: 1.32, raus: 3.96 },
    'deepseek-flash': { rein: 0.30, raus: 1.20 },
    // Dritter Anbieter Alibaba Cloud Model Studio (Qwen, Bauspur 03.10.2026).
    // QUELLE: Seite "Model inference pricing" der Dokumentation
    // (https://www.alibabacloud.com/help/en/model-studio/model-pricing, Seitenstand
    // "Last Updated: Sep 28, 2026", per curl abgerufen am 03.10.2026), Abschnitt
    // "Singapore" / Deployment scope "International" -- das ist die Region des
    // Endpunkts dashscope-intl.aliyuncs.com. Die Seite staffelt nach der Eingabe-
    // zahl EINER Anfrage; hier steht wie oben die OBERE Schranke (die teuerste
    // Stufe, Cache-Rabatt und befristete Aktionen NICHT abgezogen), damit die
    // Kostendeckel der Bauspur nie zu spaet schliessen:
    //   qwen3.8-max       0<Token<=1M            $2 / $6   (eine Stufe, kein Aufschlag)
    //   qwen3.7-plus      <=256K $0.4/$1.6, 256K-1M $1.2/$4.8   -> obere Stufe
    //   qwen3.5-plus      <=256K $0.4/$2.4, 256K-1M $0.5/$3     -> obere Stufe
    //   qwen3-coder-plus  <=32K $1/$5, <=128K $1.8/$9, <=256K $3/$15, <=1M $6/$60 -> obere Stufe
    // Das Denken zaehlt als Ausgabe (usage.output_tokens enthaelt reasoning_tokens,
    // gemessen 03.10.2026). Die Schranken von qwen3.7-plus, qwen3.5-plus und
    // qwen3-coder-plus liegen damit bis zu 10x ueber der niedrigsten Stufe: ein
    // vorsichtiger Deckel, keine Abrechnung.
    'qwen3.8-max': { rein: 2.00, raus: 6.00 },
    'qwen3.7-plus': { rein: 1.20, raus: 4.80 },
    'qwen3.5-plus': { rein: 0.50, raus: 3.00 },
    'qwen3-coder-plus': { rein: 6.00, raus: 60.00 },
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

// Hart gesperrt, AUCH wenn versioniert (Schritt 5 der Erlaubnispruefung).
function istHartGesperrt(relPfad) {
    return path.basename(relPfad).startsWith('.env')
        || relPfad.endsWith('.key')
        || relPfad.endsWith('.pem');
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

// Die Lesewerkzeuge (Erlaubnisliste, suche, lies) als FABRIK mit eigenem Zustand
// je Aufrufer: tools/gegenleser-repo.js haelt EINE Instanz (dort bleiben die
// Funktionsnamen wurzelEinrichten/pfadPruefen/werkzeugSuche/werkzeugLies als
// duenne Huellen, damit sein Selbsttest unveraendert dieselben Namen
// aufruft), tools/bau-spur.js seine eigene. Der einzige Unterschied im
// Verhalten: laufNeueDateienAufnehmen() erweitert die Erlaubnisliste um
// Dateien, die der Lauf selbst angelegt hat (Bauspur); ohne diesen Aufruf ist
// die Fabrik byteweise das Verhalten von vor dem Herausziehen.
function leseWerkzeugeBauen() {
    // Modul-Zustand fuer EINEN Lauf, von wurzelEinrichten() gesetzt. Der
    // Selbsttest ruft wurzelEinrichten() mehrfach mit unterschiedlichen
    // Wegwerf-Wurzeln auf; das ist gewollt, jeder CLI-Lauf richtet nur einmal ein.
    let wurzelAbsolut = null;
    let wurzelReal = null;
    let versionierteDateien = null;
    // Dateien, die der LAUF selbst angelegt hat (nur die Bauspur fuellt sie; in der
    // Gegenleser-Spur bleibt die Menge leer und aendert nichts).
    const laufNeueDateien = new Set();

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
        if (!versionierteDateien.has(relativ) && !laufNeueDateien.has(relativ)) {
            return { ok: false, grund: `nicht von "git ls-files" erfasst (nicht versioniert): ${relativ}` };
        }
        // Schritt 5: zusaetzlich hart gesperrt, auch wenn versioniert.
        if (istHartGesperrt(relativ)) {
            return { ok: false, grund: `gesperrter Dateiname (.env*/.key/.pem): ${relativ}` };
        }
        return { ok: true, absolut: real, relativ };
    }

    function laufNeueDateienAufnehmen(relativ) { laufNeueDateien.add(relativ); }
    function* alleErlaubten() { yield* versionierteDateien; yield* laufNeueDateien; }

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
        for (const relPfad of alleErlaubten()) {
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

    return { wurzelEinrichten, pfadPruefen, werkzeugSuche, werkzeugLies, laufNeueDateienAufnehmen };
}

// Die streamende Anfrage an einen /responses-Endpunkt (OpenAI, DeepSeek,
// DashScope): herausgezogen aus tools/gegenleser-repo.js anfragen() (dort bleibt
// der Aufbau des Request-Koerpers, hier die Uebertragung und die SSE-
// Auswertung), damit tools/bau-spur.js dieselbe Auswertung benutzt statt einer
// zweiten Kopie. Die Fehlerfelder heissen weiter gegenleserStatus/-Grund/-Usage
// (der Selbsttest des Gegenlesers haelt sie fest). url ist ein String,
// koerper der fertig serialisierte JSON-Koerper (stream:true muss darin
// stehen), timeoutMs die Frist der ganzen Anfrage.
function sseAnfrage({ url, schluessel, koerper, timeoutMs = 20 * 60 * 1000 }) {
    return new Promise((erfuellen, ablehnen) => {
        // "genau EINMAL wirkt" (Punkt 10/B2): mehrere Ereignisse (end, error,
        // aborted, close -- auf der ANTWORT wie auf der ANFRAGE) koennen
        // sonst die Promise mehrfach ansprechen -- z. B. feuert Node nach
        // einem normalen "end" verlaesslich zusaetzlich noch "close".
        // N1 (Gegenlesung 19.09.2026): fertig/abschliessen lagen bisher NUR
        // im response-Callback -- anfrage.on('error', ...) weiter unten
        // (Anfrage-, nicht Antwort-Ebene; feuert z. B. nach der
        // Zeitueberschreitung ueber anfrage.destroy()) lief DARAN VORBEI und
        // konnte die Promise ein zweites Mal ansprechen. Beide Ebenen teilen
        // sich jetzt denselben Riegel.
        // B1 (Review-Bot-Befund an PR #45, GEMESSEN 19.09.2026): nach einem
        // FATALEN Abbruch (kaputtes JSON, ein error-Ereignis, ein zweites
        // Abschluss-Ereignis, Daten nach dem Abschluss) wurde die Promise
        // abgelehnt, aber der Antwortstrom nie zerstoert -- spaetere Chunks
        // liefen nur noch ins "if (fertig) return;" ins Leere. GEMESSEN am
        // Nachbau gegen einen echten lokalen Node-22-Server, der nach der
        // kaputten Zeile endlos weitersendet: OHNE destroy() laeuft der
        // Prozess nach 1200 ms noch (ein offener Socket haelt die
        // Ereignisschleife am Leben), MIT destroy() endet er von selbst nach
        // ~18 ms. destroy() NACH einem bereits regulaer beendeten Strom
        // (Erfolgspfad) ist dabei GEMESSEN ein echtes No-op (kein Wurf, kein
        // zusaetzliches Ereignis) -- deshalb hier fuer BEIDE Pfade, in
        // try/catch: ein dadurch etwaig ausgeloestes anfrage.on('error')
        // laeuft ins bereits gesetzte "fertig" und wird geschluckt.
        let fertig = false;
        const abschliessen = (fn) => {
            if (fertig) return;
            fertig = true;
            fn();
            try { anfrage.destroy(); } catch (e) { /* Socket ggf. schon weg -- ohne Belang */ }
        };

        const anfrage = https.request(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${schluessel}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(koerper),
            },
            timeout: timeoutMs,
        }, (antwort) => {
            // Punkt 11: der Statuscode wird VOR der SSE-Auswertung geprueft,
            // wie heute -- eine Fehlerantwort ist kein SSE, sondern ein
            // gewoehnlicher JSON-Koerper, der Rohauszug bleibt in der Meldung.
            if (antwort.statusCode !== 200) {
                // B1: auch hier NICHT "roh += stueck" (dekodiert jeden Chunk
                // einzeln als UTF-8 und zerstoert Mehrbytezeichen an der
                // Chunk-Grenze) -- derselbe StringDecoder wie im SSE-Zweig.
                const fehlerDecoder = new StringDecoder('utf8');
                let rohFehler = '';
                antwort.on('data', (stueck) => { rohFehler += fehlerDecoder.write(stueck); });
                antwort.on('end', () => {
                    rohFehler += fehlerDecoder.end();
                    abschliessen(() => ablehnen(new Error(`HTTP ${antwort.statusCode}: ${rohFehler.slice(0, 800)}`)));
                });
                antwort.on('error', (e) => abschliessen(() => ablehnen(
                    new Error(`HTTP ${antwort.statusCode}, Fehlerantwort abgebrochen: ${e.message}`))));
                // N2 (Gegenlesung 19.09.2026): bisher fehlte hier "aborted" --
                // derselbe Grund wie im SSE-Zweig (Punkt 10/B2): ohne
                // Listener haengt die Promise fuer immer, wenn die
                // Fehlerantwort selbst mitten im Koerper abgebrochen wird.
                antwort.on('aborted', () => abschliessen(() => ablehnen(
                    new Error(`HTTP ${antwort.statusCode}, Fehlerantwort abgebrochen (aborted), bevor sie vollstaendig war -- ${rohFehler.slice(0, 800)}`))));
                antwort.on('close', () => abschliessen(() => ablehnen(
                    new Error(`HTTP ${antwort.statusCode}: Verbindung geschlossen, bevor die Fehlerantwort vollstaendig war -- ${rohFehler.slice(0, 800)}`))));
                return;
            }

            // ===== SSE-Auswertung (Punkte 5-9) =====
            // B1: StringDecoder statt "roh += stueck" -- Buffer-Chunks werden
            // NICHT einzeln als UTF-8 dekodiert (das zerstoert Mehrbytezeichen,
            // deren Bytes auf zwei Chunks fallen), sondern ueber einen
            // gemeinsamen Decoder, der einen unvollstaendigen Byte-Rest bis
            // zum naechsten Chunk zurueckhaelt (GEMESSEN, siehe GP1 im
            // Selbsttest und Auftragspapier B1).
            const decoder = new StringDecoder('utf8');
            let zeilenpuffer = '';
            let empfangeneBytes = 0;
            let dataZeilenAnzahl = 0;
            let letzterEreignisTyp = null;
            let abschlussEreignis = null;

            const diagnose = () => `Empfangene Bytes: ${empfangeneBytes}, gelesene data:-Zeilen: ${dataZeilenAnzahl}, `
                + `zuletzt gesehener Ereignistyp: ${letzterEreignisTyp || '(keiner)'}.`;

            // Verarbeitet GENAU EINE vollstaendige Zeile (ohne Zeilenumbruch).
            // Punkt 6/B4: der Ereignistyp kommt aus dem "type"-Feld im JSON
            // der data:-Zeile, NICHT aus der event:-Zeile (gemessen: 3.977 von
            // 3.977 data:-Zeilen trugen "type", 0 Abweichungen zu event:) --
            // event:- und Leerzeilen werden hier deshalb schlicht ignoriert.
            const zeileVerarbeiten = (zeileRoh) => {
                if (fertig) return;
                const zeile = zeileRoh.endsWith('\r') ? zeileRoh.slice(0, -1) : zeileRoh;
                if (!zeile.startsWith('data:')) return;
                dataZeilenAnzahl++;
                const nutzlast = zeile.slice(5).replace(/^ /, '');
                let ereignis;
                try {
                    ereignis = JSON.parse(nutzlast);
                } catch (e) {
                    // Punkt 7/B3: KEIN stilles Ueberspringen -- ein
                    // beschaedigter Protokolldatensatz bricht laut ab.
                    abschliessen(() => ablehnen(new Error(
                        `SSE-Datensatz Nr. ${dataZeilenAnzahl} enthaelt kein gueltiges JSON (beschaedigter `
                        + `Protokolldatensatz, wird NICHT uebersprungen): ${e.message}`)));
                    return;
                }
                if (ereignis && typeof ereignis.type === 'string') letzterEreignisTyp = ereignis.type;
                if (ereignis && ereignis.type === 'error') {
                    // Punkt 8/B6: ein Ereignis vom Typ error ist sofort fatal.
                    const code = ereignis.code || (ereignis.error && ereignis.error.code) || 'unbekannt';
                    const nachricht = ereignis.message || (ereignis.error && ereignis.error.message) || 'keine Meldung im Ereignis';
                    const fehler = new Error(`SSE-Ereignis vom Typ "error": code=${code}, message=${nachricht}`);
                    fehler.gegenleserStatus = 'error';
                    fehler.gegenleserGrund = nachricht;
                    fehler.gegenleserUsage = null;
                    abschliessen(() => ablehnen(fehler));
                    return;
                }
                if (ereignis && (ereignis.type === 'response.completed' || ereignis.type === 'response.incomplete' || ereignis.type === 'response.failed')) {
                    if (abschlussEreignis) {
                        // Punkt 8/B5: ein ZWEITES Abschluss-Ereignis lehnt den
                        // Lauf ab (nicht: melden und weiterlaufen) -- gemessen
                        // hatte jeder der drei echten Stroeme genau eines.
                        abschliessen(() => ablehnen(new Error(
                            `ZWEITES Abschluss-Ereignis "${ereignis.type}" erhalten, nachdem bereits `
                            + `"${abschlussEreignis.type}" da war -- Lauf abgelehnt.`)));
                        return;
                    }
                    abschlussEreignis = ereignis;
                } else if (abschlussEreignis) {
                    // N6 (Gegenlesung 19.09.2026): nicht nur ein ZWEITES
                    // Abschluss-Ereignis ist verboten -- JEDE weitere
                    // data:-Nutzlast danach ist eine beschaedigte Reihenfolge.
                    // Bisher wurde ein gewoehnliches Ereignis (z. B. ein
                    // response.output_text.delta) NACH dem Abschluss still
                    // uebernommen (nur letzterEreignisTyp aktualisiert) und
                    // beim Stromende als "sauberes Ergebnis" gewertet -- eine
                    // stille Normalisierung. GEMESSEN (drei echte Stroeme):
                    // nach response.completed kommt KEINE weitere
                    // data:-Zeile -- reine Haertung, kein lebender Defekt.
                    abschliessen(() => ablehnen(new Error(
                        `WEITERE data:-Nutzlast (Typ "${ereignis && ereignis.type}") NACH dem Abschluss-Ereignis `
                        + `"${abschlussEreignis.type}" erhalten -- Lauf abgelehnt.`)));
                    return;
                }
            };

            antwort.on('data', (stueck) => {
                if (fertig) return;
                empfangeneBytes += stueck.length;
                zeilenpuffer += decoder.write(stueck);
                let i;
                while (!fertig && (i = zeilenpuffer.indexOf('\n')) !== -1) {
                    const zeile = zeilenpuffer.slice(0, i);
                    zeilenpuffer = zeilenpuffer.slice(i + 1);
                    zeileVerarbeiten(zeile);
                }
            });

            antwort.on('end', () => {
                if (fertig) return;
                zeilenpuffer += decoder.end();
                if (zeilenpuffer.trim()) zeileVerarbeiten(zeilenpuffer.trim());
                if (fertig) return;
                if (!abschlussEreignis) {
                    // Punkt 9: kein Abschluss-Ereignis = lautes Scheitern,
                    // NIEMALS ein leeres Ergebnis. Alle drei Angaben sind
                    // Pflicht (GP2).
                    abschliessen(() => ablehnen(new Error(
                        `Stream endete OHNE Abschluss-Ereignis -- kein sauberes Ergebnis. ${diagnose()}`)));
                    return;
                }
                const antwortObjekt = abschlussEreignis.response;
                // Punkt 12: NUR bei status === "completed" wird zurueck-
                // gegeben, sonst wird geworfen -- der Ereignistyp ist NICHT
                // der Ersatz fuer den Objektstatus (Punkt 14).
                if (!antwortObjekt || typeof antwortObjekt !== 'object') {
                    abschliessen(() => ablehnen(new Error(
                        `Abschluss-Ereignis "${abschlussEreignis.type}" ohne verwertbares response-Objekt (Protokollfehler).`)));
                    return;
                }
                if (antwortObjekt.status === 'completed') {
                    abschliessen(() => erfuellen(antwortObjekt));
                    return;
                }
                // Diagnose NACH FORM getrennt (Punkt 12/B6). Kein "undefined"
                // in der Meldung -- fehlt ein erwartetes Feld, wird das
                // selbst als Protokollfehler benannt statt stillschweigend
                // "undefined" auszugeben.
                let grund;
                if (antwortObjekt.status === 'incomplete') {
                    grund = (antwortObjekt.incomplete_details && antwortObjekt.incomplete_details.reason)
                        || 'unbekannt (incomplete_details.reason fehlt -- Protokollfehler)';
                } else if (antwortObjekt.status === 'failed') {
                    grund = antwortObjekt.error ? JSON.stringify(antwortObjekt.error) : 'unbekannt (response.error fehlt -- Protokollfehler)';
                } else {
                    grund = `unbekannter status "${antwortObjekt.status}" (Protokollfehler)`;
                }
                // Punkt 13/B8: der geworfene Fehler traegt usage, Status und
                // Grund, damit die Rundenschleife den bereits bezahlten
                // Verbrauch nicht verliert.
                const fehler = new Error(`Anfrage nicht abgeschlossen: status="${antwortObjekt.status}", Grund: ${grund}`);
                fehler.gegenleserStatus = antwortObjekt.status;
                fehler.gegenleserGrund = grund;
                fehler.gegenleserUsage = antwortObjekt.usage || null;
                abschliessen(() => ablehnen(fehler));
            });

            // Punkt 10/B2: Listener auf dem ANTWORT-Strom fuer error,
            // aborted und vorzeitiges close -- heute (ohne diese Listener)
            // haengt die Promise in diesen Faellen FUER IMMER, weil sie nur
            // in "end" aufloest (GEMESSEN am Nachbau, siehe Papier B2: close
            // ohne end und ein Fehler am Antwortstrom hingen beide, ein
            // Wachhund nach 300ms zeigte es). Mit Streaming wird ein mitten
            // im Strom sauber geschlossener Socket zum REGELFALL der
            // Stoerung, nicht zur Ausnahme.
            antwort.on('error', (e) => abschliessen(() => ablehnen(
                new Error(`Fehler am Antwortstrom (SSE): ${e.message}. ${diagnose()}`))));
            antwort.on('aborted', () => abschliessen(() => ablehnen(
                new Error(`Antwortstrom (SSE) wurde abgebrochen (aborted), bevor ein Abschluss-Ereignis kam. ${diagnose()}`))));
            antwort.on('close', () => abschliessen(() => ablehnen(
                new Error(`Antwortstrom (SSE) wurde vorzeitig geschlossen, bevor ein Abschluss-Ereignis kam. ${diagnose()}`))));
        });
        anfrage.on('timeout', () => { anfrage.destroy(new Error(`Zeitueberschreitung nach ${Math.round(timeoutMs / 60000)} Minuten`)); });
        // N1 (Gegenlesung 19.09.2026): lief bisher DIREKT auf ablehnen, ganz
        // am fertig/abschliessen-Riegel vorbei (der lag im response-Callback,
        // dieser Handler hier ist Anfrage-Ebene und ausserhalb jenes Scopes).
        // Ein Anfrage-Fehler NACH einem bereits abgeschlossenen Antwortstrom
        // (z. B. ein spaeter destroy() nach der Zeitueberschreitung) haette
        // sonst einen zweiten, stillen Settle-Versuch ausgeloest (siehe
        // GP7E im Selbsttest).
        anfrage.on('error', (e) => abschliessen(() => ablehnen(e)));
        anfrage.end(koerper);
    });
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

const LAUFPROTOKOLL_MARKE = '<!-- NEUE-LAUFZEILE-HIER:';

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

module.exports = {
    MAX_SUCHE_ZEILEN, MAX_LIES_ZEILEN, PREISTABELLE, kostenSchaetzen, GeheimnisAbbruch, istHartGesperrt,
    zeilenAus, glob2regex, leseWerkzeugeBauen, sseAnfrage, textAusAusgabe,
    LAUFPROTOKOLL_MARKE, laufprotokollDatum, laufprotokollZelle, laufprotokollEinfuegen,
};
