'use strict';
//
// tools/bau-spur-selbsttest.js — der Selbsttest der Bauspur (tools/bau-spur.js), Auftrag
// plaene/auftrag-bau-spur-qwen.md, Abschnitt "Tests (Pflicht, in der CI dieses Repos)" und die
// Pflichtfaelle der Planpruefung (B1-B7, A1-A8).
//
//   node tools/bau-spur.js --selbsttest        Attrappen-Modell, KEIN Netz, KEIN root, kein Cluster
//   node tools/bau-spur.js --selbsttest-root   als root: Eigentuemer-Fixtur, root-eigene Schluesseldatei, der CLI-Weg bis
//                                              zum ersten Modellaufruf und ein GANZER Lauf gegen die echte Sandbox
//
// Beide Selbsttests haben eine von Hand gezaehlte Sollzahl (ERWARTETE_FAELLE_*): ein entfernter oder durch einen
// Abbruch uebersprungener Fall faerbt den Lauf rot. Sollwerte (Runden, Token, Kosten, Pfade, Hashes) stehen als
// LITERALE da, nie aus PREISTABELLE oder dem Werkzeug zurueckgerechnet; Hashes werden aus dem erwarteten Inhalt UNABHAENGIG
// im Test gerechnet. Der Selbsttest fasst nur Wegwerfverzeichnisse unter os.tmpdir() an (und die echte BAU-LAEUFE.md
// nie: BAU_LAUFPROTOKOLL zeigt auf eine Wegwerfdatei).
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const https = require('node:https');
const { EventEmitter } = require('node:events');
const { spawnSync } = require('node:child_process');
const bau = require('./bau-spur');
const sandboxModul = require('./ausfuehr-spur');
const { leseWerkzeugeBauen, kostenSchaetzen, laufprotokollDatum } = require('./spur-gemeinsam');
const { pruefeGeheimnisse } = require('./geheimnis-riegel');

const ERWARTETE_FAELLE_OHNE_ROOT = 95;   // von Hand gezaehlt, am 03.10.2026 durch den Lauf bestaetigt
const ERWARTETE_FAELLE_ROOT = 8;        // A4 x2, CLI-Vorbedingungen x2, ganzer Lauf x4

const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');
// Token-Attrappen werden zur Laufzeit zusammengesetzt (kein Literal im Quelltext, das Scanner anschlaegt).
const TOKEN = 'gh' + 'p_' + 'A'.repeat(36);
const SCHLUESSEL = 'sk-' + 'fx' + '-1.' + 'abcdefg' + '.' + 'hijk' + '.' + 'lmnopqr' + '_' + 'S'.repeat(30) + '_' + 'T'.repeat(12);   // wie das Qwen-Format: Punkte brechen das Riegel-Muster

// ===================== Fixturen =====================
function umgebungFuerGit(basis) {
    return {
        PATH: '/usr/bin:/bin', HOME: basis, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1',
        GIT_AUTHOR_NAME: 'Selbsttest', GIT_AUTHOR_EMAIL: 'selbsttest@example.invalid', GIT_COMMITTER_NAME: 'Selbsttest', GIT_COMMITTER_EMAIL: 'selbsttest@example.invalid',
    };
}

function kontextBauen() {
    const basis = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bau-spur-selbsttest-')));
    fs.chmodSync(basis, 0o755);
    const genv = umgebungFuerGit(basis);
    const g = (cwd, ...args) => {
        const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: genv });
        if (r.status !== 0) throw new Error(`git ${args.join(' ')} (${cwd}) endete mit ${r.status}: ${r.stderr}`);
        return r.stdout;
    };
    const arbeitswurzel = path.join(basis, 'arbeitswurzel');
    fs.mkdirSync(arbeitswurzel);
    const werkzeugDir = path.join(basis, 'werkzeug-attrappe');
    fs.mkdirSync(werkzeugDir);
    const ctx = { basis, g, arbeitswurzel, werkzeugDir, zaehler: 0, bauZeilen: path.join(basis, 'BAU-LAEUFE.md') };
    fs.writeFileSync(ctx.bauZeilen, '# Wegwerf\n\n| Datum | Zweck | Modell | Runden | Token | Kosten | Ergebnis | Pruefung | Nacharbeiten |\n|---|---|---|---|---|---|---|---|---|\n<!-- NEUE-LAUFZEILE-HIER: Wegwerfmarke -->\n');
    ctx.hauptklon = hauptklonAnlegen(ctx, 'hauptklon', 'https://github.com/belehrung/gymdocu');
    ctx.umgebung = { BAU_ARBEITSBAUM_WURZEL: arbeitswurzel, BAU_ZIELREPO_GIT: path.join(ctx.hauptklon, '.git') };
    return ctx;
}

function dateienSchreiben(wurzel, dateien) {
    for (const [rel, inhalt, modus] of dateien) {
        const p = path.join(wurzel, rel);
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, inhalt, { mode: modus || 0o644 });
    }
}

const RUN_SH = '#!/usr/bin/env bash\n# Fixtur: nur die TESTS=(-Liste wird gelesen.\nset -uo pipefail\nTESTS=(\n  ops/boot-smoke.js\n  test_alt.js\n  test_kanarie_static.js   # Kommentar hinter dem Eintrag\n)\nfor t in "${TESTS[@]}"; do node "$t"; done\n';

function hauptklonAnlegen(ctx, name, origin, eltern) {
    const d = path.join(eltern || ctx.basis, name);
    fs.mkdirSync(d);
    ctx.g(d, 'init', '-q', '-b', 'entwicklung');
    if (origin) ctx.g(d, 'remote', 'add', 'origin', origin);
    dateienSchreiben(d, [
        ['lib/wert.js', 'module.exports = 42;\n'],
        ['lib/doppelt.js', 'const a = 7;\nconst b = 7;\nmodule.exports = a + b;\n'],
        ['test/run.sh', RUN_SH, 0o755],
        ['test/umgebung.sh', '# Fixtur\n'],
        ['test/db-vorbereiten.js', "'use strict';\n"],
        ['test_alt.js', "console.log('  ✓ alt');\nconsole.log('1 PASS / 0 FAIL');\n"],
        ['test_kanarie_static.js', "console.log('  ✓ kanarie');\nconsole.log('1 PASS / 0 FAIL');\n"],
        ['ops/boot-smoke.js', "console.log('boot');\n"],
        ['ops/skript.sh', '#!/bin/sh\necho hallo\n', 0o755],
        ['migrations/0001.sql', 'SELECT 1;\n'],
        ['server.js', "'use strict';\n"],
        ['eslint.config.js', 'module.exports = [];\n'],
        ['ecosystem.config.js', 'module.exports = {};\n'],
        ['Dockerfile', 'FROM scratch\n'],
        ['Procfile', 'web: node server.js\n'],
        ['package.json', '{"name":"fixtur"}\n'],
        ['package-lock.json', '{}\n'],
        ['.github/workflows/ci.yml', 'on: push\n'],
        ['.claude/settings.json', '{}\n'],
        ['.gitignore', 'node_modules/\nignoriert/\n'],
        ['.env.beispiel', 'BEISPIEL=1\n'],
        ['README.md', '# Fixtur\n'],
        ['docs/notiz.md', 'Notiz\n'],
        ['docs/notiz-link.md', 'Notiz\n'],
        ['docs/geheim.md', `harmlose Zeile\ntoken = "${TOKEN}"\nnoch eine harmlose Zeile\n`],
        ['aaa.js', 'aaa\n'],
    ]);
    fs.symlinkSync('lib/wert.js', path.join(d, 'zeiger.js'));
    ctx.g(d, 'add', '-A');
    ctx.g(d, 'commit', '-q', '-m', 'Fixtur');
    return d;
}

// Ein frischer verknuepfter Arbeitsbaum unter der Arbeitswurzel (Zweig lauf-N).
function frischerBaum(ctx, zweig) {
    ctx.zaehler++;
    const name = zweig || `lauf-${ctx.zaehler}`;
    const p = path.join(ctx.arbeitswurzel, name);
    ctx.g(ctx.hauptklon, 'worktree', 'add', '-q', '-b', name, p);
    return fs.realpathSync(p);
}

const inhaltVon = (baum, rel) => fs.readFileSync(path.join(baum, rel), 'utf8');
const shaVon = (baum, rel) => sha(fs.readFileSync(path.join(baum, rel)));
const statusVon = (ctx, baum) => ctx.g(baum, 'status', '--porcelain', '-uall').trim();

function eigentuemerVon(baum) { const st = fs.statSync(baum); return { uid: st.uid, gid: st.gid }; }

// Schreibwerkzeuge auf einem frischen Baum, mit einem Sammler fuer die Protokolleintraege.
function werkzeugeAuf(ctx, baum, optionen = {}) {
    const protokoll = [];
    const lese = leseWerkzeugeBauen();
    lese.wurzelEinrichten(baum);
    const w = bau.schreibWerkzeugeBauen({
        wurzelReal: baum, versioniert: bau.gitLs(baum), erlaubt: optionen.erlaubt || [], eigentuemer: optionen.eigentuemer || eigentuemerVon(baum),
        protokoll: (e) => protokoll.push(e), lese, geheimnisse: optionen.geheimnisse || [], haken: optionen.haken || {},
    });
    return { w, lese, protokoll, baum };
}

// ===================== Attrappen: Modell und Sandbox =====================
const fc = (callId, name, args) => ({ type: 'function_call', call_id: callId, name, arguments: typeof args === 'string' ? args : JSON.stringify(args), status: 'completed' });
const antwort = (items, rein, raus) => ({ output: items, usage: { input_tokens: rein, output_tokens: raus }, status: 'completed' });
const textAntwort = (text, rein, raus) => antwort([{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] }], rein, raus);
const berichtOk = () => ({
    zusammenfassung: 'Selbsttest-Bericht', geaenderte_dateien: ['lib/wert.js'], neue_dateien: ['test_x.js'], neue_testdateien: ['test_x.js'], registrierungen: ['test_x.js'],
    punkte: [{ punkt: 'Punkt 1', status: 'umgesetzt' }, { punkt: 'Punkt 2', status: 'nicht umgesetzt', grund: 'braucht eine Entscheidung' }],
    tests: [{ testdatei: 'test_x.js', status: 'bestanden' }], gegenproben: [{ beschreibung: '42 -> 43', rot: 'gescheitert', gruen: 'bestanden' }],
});

function sandboxAttrappe(verhalten = {}) {
    const s = {
        eingerichtet: [], aufgeraeumt: 0, aufrufe: [], ungueltige: [], abgebrochen: false, werkzeugBefund: false, sauber: verhalten.sauber !== false,
        einrichtenFehler: verhalten.einrichtenFehler || null,
        async einrichten(optionen) {
            if (s.einrichtenFehler) throw new Error(s.einrichtenFehler);
            s.eingerichtet.push(optionen);
            return { cluster: 'dsv1attrappe', port: 1, tests: 3, kanarie: 'test_kanarie_static.js', head: 'a'.repeat(40) };
        },
        aufraeumen() { s.aufgeraeumt++; return s.sauber; },
        async werkzeugAufrufen(name, args) {
            s.aufrufe.push({ name, args });
            if (verhalten.antwort) return verhalten.antwort(name, args, s);
            return { text: `status: ${name === 'mutiere_und_teste' ? 'gescheitert' : 'bestanden'}\nexit: ${name === 'mutiere_und_teste' ? 1 : 0}\n`, abgelehnt: false, status: name === 'mutiere_und_teste' ? 'gescheitert' : 'bestanden' };
        },
        ungueltigerAufruf(name) { s.ungueltige.push(name); },
        istAbgebrochen() { return s.abgebrochen; },
        abbruchMarker() { return 'AUSFÜHRUNG ABGEBROCHEN — Belege nach Aufruf 1 fehlen (Attrappe)'; },
        istWerkzeugBefund() { return s.werkzeugBefund; },
        werkzeugBefundMarker() { return 'WERKZEUG-BEFUND der Kanarie (Attrappe) — keine Ausfuehrung in diesem Lauf'; },
    };
    return s;
}

// Ein Lauf mit Drehbuch: jedes Element ist eine Antwort (Objekt) oder ein Fehler (Error), der geworfen wird.
async function laufMitDrehbuch(ctx, drehbuch, optionen = {}) {
    const baum = optionen.baum || frischerBaum(ctx);
    ctx.zaehler++;
    const protokollPfad = path.join(ctx.basis, `protokoll-${ctx.zaehler}.jsonl`);
    const laufprotokollPfad = optionen.laufprotokollPfad || ctx.bauZeilen;
    const sandbox = optionen.sandbox || sandboxAttrappe(optionen.sandboxVerhalten);
    const log = []; const err = [];
    const verlaeufe = []; const aufrufe = [];
    let i = 0;
    const abh = {
        anfragen: async (a) => {
            aufrufe.push({ runde: a.runde, instructions: a.instructions, werkzeuge: a.werkzeuge.map((t) => t.name) });
            verlaeufe.push(JSON.parse(JSON.stringify(a.verlauf)));
            const naechste = drehbuch[i++];
            if (naechste === undefined) throw new Error('Drehbuch zu Ende — ein weiterer Modellaufruf war nicht vorgesehen');
            if (naechste instanceof Error) throw naechste;
            return typeof naechste === 'function' ? naechste(baum) : naechste;
        },
        sandbox, geheimnisse: optionen.geheimnisse || [], aus: { log: (t) => log.push(String(t)), err: (t) => err.push(String(t)) }, haken: optionen.haken,
    };
    const opt = {
        auftragText: optionen.auftragText || 'Auftrag des Selbsttests: aendere nichts Ueberfluessiges.', baum, zweig: path.basename(baum), modell: optionen.modell || 'qwen3.8-max',
        maxRunden: optionen.maxRunden || 60, maxKosten: optionen.maxKosten || 3, erlaubt: optionen.erlaubt || [], zweck: optionen.zweck || 'Selbsttest-Lauf',
        protokollPfad, laufprotokollPfad, kanarie: null,
    };
    const ergebnis = await bau.bauspurLaufen(opt, abh);
    const protokollZeilen = () => fs.readFileSync(protokollPfad, 'utf8').split('\n').filter(Boolean).map((z) => JSON.parse(z));
    const letzteZeile = () => { const z = fs.readFileSync(laufprotokollPfad, 'utf8').split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Datum') && !l.startsWith('|---')); return z[z.length - 1] || null; };
    const zeileNachLauf = letzteZeile();   // sofort festgehalten: spaetere Laeufe haengen weitere Zeilen an dieselbe Wegwerfdatei
    return { ergebnis, log: log.join('\n'), err: err.join('\n'), verlaeufe, aufrufe, sandbox, baum, protokollZeilen, protokollPfad, bauZeile: () => zeileNachLauf, anfragenAnzahl: i };
}

// Feste Uhrzeit fuer die Datumsfaelle (UTC 23:30 des 03.10. ist 01:30 des 04.10. in Berlin).
async function mitFesterZeit(iso, fn) {
    const Echt = Date;
    const fest = new Echt(iso).getTime();
    class Fest extends Echt {
        constructor(...a) { if (a.length === 0) super(fest); else super(...a); }
        static now() { return fest; }
    }
    global.Date = Fest;
    try { return await fn(); } finally { global.Date = Echt; }
}

function httpsAttrappe(sseText, aufgezeichnet) {
    return function request(url, optionen, cb) {
        const req = new EventEmitter();
        req.destroy = () => {};
        req.end = (koerper) => {
            aufgezeichnet.push({ url: String(url), optionen, koerper: String(koerper) });
            const res = new EventEmitter();
            res.statusCode = 200;
            setImmediate(() => { cb(res); res.emit('data', Buffer.from(sseText)); res.emit('end'); });
        };
        return req;
    };
}

// ===================== Die Faelle ohne root =====================
const EXIT_SOLL = {
    FERTIG: 0, SONSTIGER_FEHLER: 1, AUFRUF: 2, BAUM_UNGEEIGNET: 10, ZIELREPO_FALSCH: 11, BAUM_NICHT_SAUBER: 12, PROTOKOLL_IM_BAUM: 13, PREIS_UNBEKANNT: 14,
    SCHLUESSEL: 15, AUFTRAG_GEHEIMNIS: 16, SANDBOX_NICHT_EINRICHTBAR: 17, BUDGET_ERSCHOEPFT: 20, ABBRUCH_NETZ: 21, ABBRUCH_ANTWORT: 22, KEIN_FERTIG: 23,
    SCHREIBLISTE_ABWEICHUNG: 24, ISOLATION_ABGEBROCHEN: 25, WERKZEUG_BEFUND: 26, AUFRAEUMEN_UNVOLLSTAENDIG: 27,
};

async function faelleOhneRoot(pruefen, ctx) {
    // ----- Kataloge und Konstanten (Literale) -----
    pruefen('WERKZEUGLISTE abschliessend: lies, suche, ersetze, neue_datei, registriere_test, teste, mutiere_und_teste, fertig — keine Shell, kein Git, kein Netz, kein Loeschen, kein Umbenennen',
        bau.werkzeugDefinitionen().map((w) => w.name).join(',') === 'lies,suche,ersetze,neue_datei,registriere_test,teste,mutiere_und_teste,fertig');
    pruefen('EXIT-CODES: genau die Tabelle des Kopfes (19 Codes, jeder Wert einmalig)',
        JSON.stringify(bau.EXIT) === JSON.stringify(EXIT_SOLL) && new Set(Object.values(bau.EXIT)).size === 19);
    const katalogSoll = { 'ok': null, 'abgelehnt': null, 'fertig': 0, 'budget-erschoepft': 20, 'abbruch-netz': 21, 'abbruch-antwort': 22, 'kein-fertig': 23, 'schreibliste-abweichung': 24, 'isolation-abgebrochen': 25, 'werkzeug-befund': 26 };
    pruefen('STATUS-KATALOG: zehn Status, jeder mit Text und dem Exit-Code des Kopfes (Werkzeug-Status ok/abgelehnt ohne Exit)',
        JSON.stringify(Object.keys(bau.STATUS_KATALOG)) === JSON.stringify(Object.keys(katalogSoll))
        && Object.entries(katalogSoll).every(([k, e]) => bau.STATUS_KATALOG[k].exit === e && typeof bau.STATUS_KATALOG[k].text === 'string' && bau.STATUS_KATALOG[k].text.length > 20));
    pruefen('MODELLE: feste Liste qwen3.8-max, qwen3.7-plus, qwen3-coder-plus, qwen3.5-plus; Endpunkt dashscope-intl auf /responses',
        JSON.stringify(bau.ERLAUBTE_MODELLE) === JSON.stringify(['qwen3.8-max', 'qwen3.7-plus', 'qwen3-coder-plus', 'qwen3.5-plus'])
        && bau.ENDPUNKT === 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/responses' && bau.VORGABE_MAX_RUNDEN === 60 && bau.VORGABE_MAX_KOSTEN_USD === 3);
    pruefen('PREISE (Preisseite 28.09.2026, obere Schranke je 1 Mio. Token): qwen3.8-max 2/6, qwen3.7-plus 1,2/4,8, qwen3.5-plus 0,5/3, qwen3-coder-plus 6/60 — von Hand eingetragen, nicht zurueckgerechnet',
        kostenSchaetzen('qwen3.8-max', 1_000_000, 0) === 2 && kostenSchaetzen('qwen3.8-max', 0, 1_000_000) === 6
        && kostenSchaetzen('qwen3.7-plus', 1_000_000, 0) === 1.2 && kostenSchaetzen('qwen3.7-plus', 0, 1_000_000) === 4.8
        && kostenSchaetzen('qwen3.5-plus', 1_000_000, 0) === 0.5 && kostenSchaetzen('qwen3.5-plus', 0, 1_000_000) === 3
        && kostenSchaetzen('qwen3-coder-plus', 1_000_000, 0) === 6 && kostenSchaetzen('qwen3-coder-plus', 0, 1_000_000) === 60);

    // ----- Modell und Preis (A5), Zahlenoptionen, Argumente -----
    const m1 = bau.modellPruefen('qwen3.8-max');
    const m2 = bau.modellPruefen('qwen3.8-max', () => null);
    const m3 = bau.modellPruefen('qwen3.8-max', () => 0);
    const m4 = bau.modellPruefen('qwen9-quatschmodell');
    const m5 = bau.modellPruefen(undefined);
    const m6 = bau.modellPruefen('');
    pruefen(`A5 PREIS UNBEKANNT: ein Modell aus der Liste OHNE belegten Preis (kostenSchaetzen liefert null bzw. 0) bricht VOR dem ersten Aufruf mit Exit 14 ab; mit Preis geht es (${m1.ok})`,
        m1.ok === true && m2.ok === false && m2.exit === 14 && m3.ok === false && m3.exit === 14 && /keinen belegten Preis/.test(m2.grund));
    pruefen('MODELL PFLICHT UND LISTE: kein --modell (undefined, leer) und ein Modell ausserhalb der Liste (qwen9-quatschmodell) brechen mit Exit 2 ab — eine stille Vorgabe gibt es nicht',
        m4.ok === false && m4.exit === 2 && m5.ok === false && m5.exit === 2 && m6.ok === false && m6.exit === 2 && /stille Vorgabe/.test(m5.grund));
    const zo = (r, n, v, gz) => bau.zahlOptionPruefen(r, n, v, gz);
    pruefen('ZAHLENOPTIONEN: --max-runden "0", "-1", "abc", "1.5", "Infinity", "" und --max-kosten-usd "0", "-2", "NaN", "Infinity" sind Exit 2; "7" bzw. "0.5" gelten; ohne Angabe die Vorgabe 60 bzw. 3',
        ['0', '-1', 'abc', '1.5', 'Infinity', ''].every((r) => { const x = zo(r, '--max-runden', 60, true); return x.ok === false && x.exit === 2; })
        && ['0', '-2', 'NaN', 'Infinity', ''].every((r) => { const x = zo(r, '--max-kosten-usd', 3, false); return x.ok === false && x.exit === 2; })
        && zo('7', '--max-runden', 60, true).wert === 7 && zo('0.5', '--max-kosten-usd', 3, false).wert === 0.5 && zo(undefined, '--max-runden', 60, true).wert === 60 && zo(undefined, '--max-kosten-usd', 3, false).wert === 3);
    let argFehler = null;
    try { bau.argumenteLesen(['--quatsch=1']); } catch (e) { argFehler = e.message; }
    let argFehler2 = null;
    try { bau.argumenteLesen(['kein-schalter']); } catch (e) { argFehler2 = e.message; }
    const ao = bau.argumenteLesen(['--auftrag=a.md', '--baum=/w/b', '--modell=qwen3.8-max', '--protokoll=p.jsonl', '--zweck=Z mit = Zeichen', '--max-runden=5', '--max-kosten-usd=1.5', '--erlaubt=ops/,server.js', '--kanarie=test_a.js']);
    pruefen('ARGUMENTE: alle Schalter werden gelesen (auch ein "=" im Zweck), ein unbekannter Schalter und ein Argument ohne -- werfen',
        ao.auftrag === 'a.md' && ao.baum === '/w/b' && ao.modell === 'qwen3.8-max' && ao.protokoll === 'p.jsonl' && ao.zweck === 'Z mit = Zeichen' && ao.maxRunden === '5' && ao.maxKosten === '1.5' && ao.erlaubt === 'ops/,server.js' && ao.kanarie === 'test_a.js'
        && /Unbekanntes Argument: --quatsch/.test(argFehler || '') && /Unbekanntes Argument: kein-schalter/.test(argFehler2 || ''));
    const e1 = bau.erlaubtMusterLesen('ops/, server.js ,,migrations/0*.sql');
    pruefen('--ERLAUBT LESEN: Muster getrennt durch Komma, getrimmt, leere Eintraege weg; ".." im Muster, absolutes Muster und Steuerzeichen sind Exit 2; ohne Angabe keine Freigabe',
        JSON.stringify(e1.muster) === JSON.stringify(['ops/', 'server.js', 'migrations/0*.sql'])
        && bau.erlaubtMusterLesen('../x').ok === false && bau.erlaubtMusterLesen('../x').exit === 2 && bau.erlaubtMusterLesen('/etc/*').ok === false && bau.erlaubtMusterLesen('a\nb').ok === false
        && JSON.stringify(bau.erlaubtMusterLesen(undefined).muster) === '[]');

    // ----- Pfadregeln (syntaktisch): immer gesperrt, weich gesperrt, Normalisierung, Ablehnungen -----
    const immer = ['.git', '.git/config', 'sub/.git/x', '.GIT/config', '.env', '.env.local', 'sub/.env.prod.js', '.ENV', 'a.key', 'sub/b.pem', '.claude/x.json', '.CLAUDE/x.json', '.github/ci.yml', '.GitHub/ci.yml',
        'node_modules/x/y.js', 'a/node_modules/b.js', 'NODE_MODULES/x.js', 'package.json', 'sub/package.json', 'Package.JSON', 'package-lock.json', 'sub/package-lock.json', 'test/run.sh', 'Test/Run.sh', 'test/umgebung.sh', 'test/db-vorbereiten.js', './.git/config', 'lib/./.git'];
    const alleErlaubt = [[], ['*'], ['.github/'], ['.git', '.git/*', 'package.json', 'test/*', '.claude/', 'node_modules/', '*']];
    const immerFalsch = [];
    for (const p of immer) for (const e of alleErlaubt) { const r = bau.pfadRegeln(p, e); if (r.ok || !/immer gesperrt/.test(r.grund)) immerFalsch.push(`${p} mit ${JSON.stringify(e)}`); }
    pruefen(`B7 IMMER GESPERRT: ${immer.length} Pfade (.git als Datei und Verzeichnis, node_modules, .claude/, .github/, .env*, *.key, *.pem, package*.json, die drei Pflichtdateien; auch Gross-/Kleinschreibung) bleiben mit --erlaubt=(leer), =*, =.github/ und einer Liste voller Freigaben GESPERRT`,
        immerFalsch.length === 0 && immer.length === 28);
    const weich = ['ops/x.sh', 'ops/a/b.js', 'migrations/0002.sql', 'server.js', 'Server.js', 'eslint.config.js', 'ecosystem.config.js', 'sub/ecosystem.config.js', 'Dockerfile', 'Dockerfile.prod', 'docker/Dockerfile.x', 'Procfile', 'Procfile.dev', 'OPS/x.sh'];
    const weichFalsch = [];
    for (const p of weich) {
        const ohne = bau.pfadRegeln(p, []);
        const mit = bau.pfadRegeln(p, ['*']);
        if (ohne.ok || !/ohne ausdrueckliches --erlaubt gesperrt/.test(ohne.grund) || !mit.ok) weichFalsch.push(p);
    }
    pruefen(`B7 OHNE --ERLAUBT GESPERRT: ${weich.length} Pfade (ops/, migrations/, server.js, eslint.config.js, ecosystem.config.js, Dockerfile*, Procfile*) sind ohne Freigabe gesperrt und mit --erlaubt=* frei`,
        weichFalsch.length === 0 && weich.length === 14);
    pruefen('--ERLAUBT WIRKT GEZIELT: ops/ gibt nur ops/ frei (migrations/ und server.js bleiben zu), server.js nur server.js, ein Glob migrations/0*.sql nur passende Namen; die Freigabe steht in "freigabe"',
        bau.pfadRegeln('ops/x.sh', ['ops/']).ok && bau.pfadRegeln('ops/x.sh', ['ops/']).freigabe === 'ops/' && !bau.pfadRegeln('migrations/0002.sql', ['ops/']).ok && !bau.pfadRegeln('server.js', ['ops/']).ok
        && bau.pfadRegeln('server.js', ['server.js']).ok && !bau.pfadRegeln('ops/x.sh', ['server.js']).ok && bau.pfadRegeln('migrations/0002.sql', ['migrations/0*.sql']).ok && !bau.pfadRegeln('migrations/9.txt', ['migrations/0*.sql']).ok
        && bau.pfadRegeln('lib/wert.js', ['*']).freigabe === null && bau.pfadRegeln('lib/wert.js', []).ok);
    const frei = ['lib/wert.js', 'docs/neu.md', 'ops-nicht/x.js', 'migrations-alt/x.sql', 'test_neu.js', 'sub/dir/file.json', 'server.json', 'lib/server.js', 'my-dockerfile.md'];
    pruefen('PFADREGELN POSITIVKONTROLLE: gewoehnliche Pfade (auch ops-nicht/, migrations-alt/, lib/server.js) sind frei — die Sperren greifen auf Segmentgrenzen, nicht auf Teilstrings',
        frei.every((p) => bau.pfadRegeln(p, []).ok === true));
    const normal = bau.pfadRegeln('./lib//wert.js', []);
    pruefen('NORMALISIERUNG: "./lib//wert.js" wird zu lib/wert.js; "./ops/x.sh" ist als ops/x.sh gesperrt; "a/../b.js" und "lib/.." sind wegen ".." abgelehnt, nicht normalisiert',
        normal.ok && normal.relativ === 'lib/wert.js' && !bau.pfadRegeln('./ops/x.sh', []).ok && /\.\./.test(bau.pfadRegeln('a/../b.js', []).grund) && !bau.pfadRegeln('lib/..', []).ok);
    const raus = ['', 'x'.repeat(301), '/etc/passwd', '../x.js', 'a/../x.js', 'a\\b.js', 'a\nb.js', 'a\u001bb.js', 'a\u0000b.js', 'lib/', '.', '..', null, undefined, 5, {}];
    pruefen(`PFADREGELN ABLEHNUNGEN: ${raus.length} unbrauchbare Pfade (leer, 301 Zeichen, absolut, "..", Backslash, Zeilenumbruch, ESC, NUL, Verzeichnis, ".", Nicht-Texte) sind abgelehnt`,
        raus.every((p) => bau.pfadRegeln(p, ['*']).ok === false) && raus.length === 16 && bau.pfadRegeln('x'.repeat(300), []).ok === true);

    // ----- ersetze: 0, 1 und 2 Treffer, ueberlappend, Argumente -----
    {
        const t = werkzeugeAuf(ctx, frischerBaum(ctx));
        const sha0 = shaVon(t.baum, 'lib/doppelt.js');
        const r0 = t.w.ersetze({ pfad: 'lib/doppelt.js', alt: '999', neu: '1' });
        const r2 = t.w.ersetze({ pfad: 'lib/doppelt.js', alt: '7', neu: '8' });
        pruefen('ersetze 0 TREFFER: abgelehnt mit der Trefferzahl "0-mal", die Datei ist bytegleich, git status sauber, keine Schreibliste',
            r0.abgelehnt === true && r0.text.includes('0-mal vor') && shaVon(t.baum, 'lib/doppelt.js') === sha0 && statusVon(ctx, t.baum) === '' && t.w.schreibliste.size === 0);
        pruefen('ersetze 2 TREFFER: abgelehnt mit "2-mal", nichts geaendert (die Datei hat zwei Zeilen mit 7)',
            r2.abgelehnt === true && r2.text.includes('2-mal vor') && shaVon(t.baum, 'lib/doppelt.js') === sha0 && statusVon(ctx, t.baum) === '');
        const r1 = t.w.ersetze({ pfad: 'lib/doppelt.js', alt: 'const a = 7;', neu: 'const a = 8;' });
        const erwartet = 'const a = 8;\nconst b = 7;\nmodule.exports = a + b;\n';
        const eintrag = t.protokoll[0];
        pruefen('ersetze 1 TREFFER: ok, GENAU diese eine Stelle geaendert (Inhalt wortgleich zum Erwartungswert), Hash vorher/nachher unabhaengig gerechnet im Protokoll, git status zeigt nur diese Datei',
            r1.abgelehnt === false && inhaltVon(t.baum, 'lib/doppelt.js') === erwartet && eintrag.typ === 'schreibzugriff' && eintrag.pfad === 'lib/doppelt.js' && eintrag.art === 'ersetzt'
            && eintrag.shaVorher === sha0 && eintrag.shaNachher === sha(erwartet) && eintrag.groesse === Buffer.byteLength(erwartet) && statusVon(ctx, t.baum) === 'M lib/doppelt.js' && t.protokoll.length === 1);
        const t2 = werkzeugeAuf(ctx, frischerBaum(ctx));
        const ueberl = t2.w.ersetze({ pfad: 'aaa.js', alt: 'aa', neu: 'b' });
        pruefen('ersetze UEBERLAPPEND: "aa" in "aaa" sind ZWEI Fundstellen (nicht eine) -> abgelehnt, nichts geaendert; ein LEERER Suchtext hat keine Fundstellen (Wache gegen die Endlosschleife von indexOf mit leerem Text)',
            ueberl.abgelehnt === true && ueberl.text.includes('2-mal vor') && inhaltVon(t2.baum, 'aaa.js') === 'aaa\n' && bau.zaehleVorkommen('aaa', 'aa') === 2 && bau.zaehleVorkommen('abc', '') === 0 && bau.zaehleVorkommen('abab', 'ab') === 2 && bau.zaehleVorkommen('abc', 'x') === 0);
        const args = [[{ pfad: 'lib/wert.js', alt: '', neu: 'x' }, 'nicht leer'], [{ pfad: 'lib/wert.js', alt: '42' }, 'Texte'], [{ pfad: 5, alt: '4', neu: '5' }, 'Texte'], [undefined, 'Texte'], [{ pfad: 'nicht/da.js', alt: 'a', neu: 'b' }, 'nicht von "git ls-files"']];
        pruefen('ersetze ARGUMENTFEHLER: leeres alt, fehlendes neu, Nicht-Text-Pfad, fehlende Argumente und eine nicht versionierte Datei sind Ablehnungen (kein Wurf), Baum sauber',
            args.every(([a, grund]) => { const r = t2.w.ersetze(a); return r.abgelehnt === true && r.text.includes(grund); }) && statusVon(ctx, t2.baum) === '' && t2.w.zaehler.ablehnungen === 6);
        const t3 = werkzeugeAuf(ctx, frischerBaum(ctx));
        fs.writeFileSync(path.join(t3.baum, 'roh.js'), 'x = 1;\n');
        const rU = t3.w.ersetze({ pfad: 'roh.js', alt: 'x', neu: 'y' });
        pruefen('ersetze AUF UNVERSIONIERTE DATEI: eine vorhandene, aber ungetrackte Datei (nicht per neue_datei dieses Laufs angelegt) ist kein Ziel — abgelehnt, unveraendert',
            rU.abgelehnt === true && rU.text.includes('nicht von "git ls-files" erfasst und nicht in diesem Lauf angelegt') && inhaltVon(t3.baum, 'roh.js') === 'x = 1;\n');
        const t4 = werkzeugeAuf(ctx, frischerBaum(ctx));
        fs.writeFileSync(path.join(t4.baum, 'README.md'), Buffer.from([0x23, 0x20, 0xE4, 0x0A]));   // "# ä" in Latin-1: kein UTF-8
        const u1 = t4.w.ersetze({ pfad: 'README.md', alt: '#', neu: '##' });
        const bytesNachU1 = fs.readFileSync(path.join(t4.baum, 'README.md'));
        fs.writeFileSync(path.join(t4.baum, 'README.md'), 'x'.repeat(2 * 1024 * 1024 + 1));
        const u2 = t4.w.ersetze({ pfad: 'README.md', alt: 'x', neu: 'y' });
        fs.writeFileSync(path.join(t4.baum, 'README.md'), 'x'.repeat(2 * 1024 * 1024 - 1) + 'Z');
        const u3 = t4.w.ersetze({ pfad: 'README.md', alt: 'Z', neu: 'W' });
        pruefen('ersetze NUR AUF REINEN UTF-8-TEXT BIS 2 MiB: eine Datei mit einem Latin-1-Byte (0xE4) wird abgelehnt und bleibt bytegleich (sonst wuerde ersetze sie beim Zurueckschreiben verfaelschen); eine Datei mit 2 MiB + 1 Byte wird abgelehnt, mit genau 2 MiB (2097152 Bytes) geht ersetze',
            u1.abgelehnt === true && u1.text.includes('kein reines UTF-8') && bytesNachU1.equals(Buffer.from([0x23, 0x20, 0xE4, 0x0A])) && u2.abgelehnt === true && u2.text.includes('groesser als 2097152 Bytes')
            && u3.abgelehnt === false && fs.statSync(path.join(t4.baum, 'README.md')).size === 2097152 && inhaltVon(t4.baum, 'README.md').endsWith('xW'));
        const rN = t3.w.neueDatei({ pfad: 'roh.js', inhalt: 'z' });
        const rN2 = t3.w.neueDatei({ pfad: 'lib/wert.js', inhalt: 'z' });
        pruefen('neue_datei AUF EXISTIERENDEN PFAD: eine bestehende (auch ungetrackte) Datei wird nicht angelegt/ueberschrieben -> abgelehnt "existiert bereits", beide Inhalte unveraendert',
            rN.abgelehnt === true && rN.text.includes('existiert bereits') && rN2.abgelehnt === true && rN2.text.includes('existiert bereits') && inhaltVon(t3.baum, 'roh.js') === 'x = 1;\n' && inhaltVon(t3.baum, 'lib/wert.js') === 'module.exports = 42;\n');
    }

    // ----- neue_datei: Anlegen, A7 (ersetze auf Lauf-Datei, lies), Endungen, Groessen, .gitignore -----
    {
        const t = werkzeugeAuf(ctx, frischerBaum(ctx));
        const vorher = t.lese.werkzeugLies('sub/dir/neu.js', 1, 1);
        const r = t.w.neueDatei({ pfad: 'sub/dir/neu.js', inhalt: 'module.exports = 5;\n' });
        const st = fs.statSync(path.join(t.baum, 'sub/dir/neu.js'));
        const eig = eigentuemerVon(t.baum);
        pruefen('neue_datei: legt die Datei MIT fehlenden Verzeichnissen an (Dateimodus 0644, Verzeichnisse 0755, Eigentuemer und Gruppe der Baumwurzel), Inhalt wortgleich, Protokoll mit sha256 nachher und shaVorher null',
            r.abgelehnt === false && inhaltVon(t.baum, 'sub/dir/neu.js') === 'module.exports = 5;\n' && (st.mode & 0o777) === 0o644 && st.uid === eig.uid && st.gid === eig.gid
            && (fs.statSync(path.join(t.baum, 'sub/dir')).mode & 0o777) === 0o755 && fs.statSync(path.join(t.baum, 'sub')).uid === eig.uid && fs.statSync(path.join(t.baum, 'sub/dir')).gid === eig.gid
            && t.protokoll[0].art === 'neu' && t.protokoll[0].shaVorher === null && t.protokoll[0].shaNachher === sha('module.exports = 5;\n') && JSON.stringify(t.w.laufNeuListe()) === '["sub/dir/neu.js"]');
        const r2 = t.w.ersetze({ pfad: 'sub/dir/neu.js', alt: '5', neu: '6' });
        const nachher = t.lese.werkzeugLies('sub/dir/neu.js', 1, 1);
        pruefen('A7 ersetze AUF EINE DATEI DIESES LAUFS: neue_datei -> ersetze -> lies zeigt den neuen Inhalt; VOR neue_datei war die Datei fuer lies nicht erlaubt (Positivkontrolle der Erlaubnisliste)',
            vorher.abgelehnt === true && vorher.text.includes('Datei nicht gefunden') && r2.abgelehnt === false && nachher.text.includes('1:module.exports = 6;') && t.w.nettoGeaendert().join() === 'sub/dir/neu.js'
            && t.protokoll[1].art === 'ersetzt' && t.protokoll[1].shaVorher === sha('module.exports = 5;\n') && t.protokoll[1].shaNachher === sha('module.exports = 6;\n'));
        const schlecht = ['x.txt', 'x', 'x.py', 'x.exe', 'x.d.ts', 'x.yml', 'x.js.txt'];
        const gut = ['a.js', 'a.cjs', 'a.json', 'a.sql', 'a.sh', 'a.md', 'a.html', 'a.css'];
        pruefen('neue_datei ENDUNGEN: .js .cjs .json .sql .sh .md .html .css werden angelegt; .txt, ohne Endung, .py, .exe, .d.ts, .yml, .js.txt sind abgelehnt und nicht angelegt',
            gut.every((n) => t.w.neueDatei({ pfad: `end/${n}`, inhalt: 'x' }).abgelehnt === false && fs.existsSync(path.join(t.baum, 'end', n)))
            && schlecht.every((n) => { const x = t.w.neueDatei({ pfad: `end/${n}`, inhalt: 'x' }); return x.abgelehnt === true && x.text.includes('Endung') && !fs.existsSync(path.join(t.baum, 'end', n)); }));
        const t3 = werkzeugeAuf(ctx, frischerBaum(ctx));
        const exakt = t3.w.neueDatei({ pfad: 'gross.md', inhalt: 'a'.repeat(204800) });
        const eins = t3.w.neueDatei({ pfad: 'zugross.md', inhalt: 'a'.repeat(204801) });
        const umlaute = t3.w.neueDatei({ pfad: 'umlaute.md', inhalt: 'ä'.repeat(102401) });
        const ersGut = t3.w.ersetze({ pfad: 'README.md', alt: 'Fixtur', neu: 'b'.repeat(204800) });
        const ersZu = t3.w.ersetze({ pfad: 'docs/notiz.md', alt: 'Notiz', neu: 'b'.repeat(204801) });
        pruefen('GROESSENDECKEL 200 KB (204800 Bytes): neue_datei mit 204800 Bytes geht, mit 204801 nicht (Bytes, nicht Zeichen: 102401 Umlaute = 204802 Bytes abgelehnt); ersetze mit "neu" von 204800 geht, 204801 nicht',
            exakt.abgelehnt === false && statSizeVon(t3.baum, 'gross.md') === 204800 && eins.abgelehnt === true && eins.text.includes('laenger als 204800 Bytes') && !fs.existsSync(path.join(t3.baum, 'zugross.md'))
            && umlaute.abgelehnt === true && !fs.existsSync(path.join(t3.baum, 'umlaute.md')) && ersGut.abgelehnt === false && ersZu.abgelehnt === true && inhaltVon(t3.baum, 'docs/notiz.md') === 'Notiz\n');
        const ig = t3.w.neueDatei({ pfad: 'ignoriert/x.js', inhalt: 'x' });
        const ok2 = t3.w.neueDatei({ pfad: 'nicht-ignoriert/x.js', inhalt: 'x' });
        pruefen('neue_datei UND .gitignore: ein Pfad, den .gitignore erfasst (ignoriert/), wird abgelehnt — git status wuerde ihn verschweigen und der Endvergleich waere blind; es entsteht auch kein Verzeichnis; ein nicht erfasster Pfad geht',
            ig.abgelehnt === true && ig.text.includes('.gitignore') && !fs.existsSync(path.join(t3.baum, 'ignoriert')) && ok2.abgelehnt === false);
        const hinweis1 = t3.w.ersetze({ pfad: 'lib/wert.js', alt: '42', neu: '42 (' });
        const hinweis2 = t3.w.ersetze({ pfad: 'lib/doppelt.js', alt: 'const b = 7;', neu: 'const b = 9;' });
        const hinweis3 = t3.w.neueDatei({ pfad: 'kaputt.js', inhalt: 'module.exports = (;\n' });
        pruefen('SYNTAXHINWEIS: nach dem Schreiben prueft node --check .js/.cjs; ein Syntaxfehler SPERRT NICHT (Zwischenstaende duerfen kaputt sein), er steht als Hinweis im Ergebnis; ein gueltiger Stand traegt keinen Hinweis',
            hinweis1.abgelehnt === false && hinweis1.text.includes('HINWEIS Syntaxfehler') && inhaltVon(t3.baum, 'lib/wert.js') === 'module.exports = 42 (;\n' && !hinweis2.text.includes('HINWEIS') && hinweis3.abgelehnt === false && hinweis3.text.includes('HINWEIS Syntaxfehler'));
    }
function statSizeVon(baum, rel) { return fs.statSync(path.join(baum, rel)).size; }

    // ----- Schreibwege: Sperren auch mit --erlaubt, ops/ mit und ohne Freigabe, ausserhalb, Symlinks, Hardlink -----
    {
        const t = werkzeugeAuf(ctx, frischerBaum(ctx), { erlaubt: ['*', '.github/', '.git', 'node_modules/', 'package.json', 'test/*'] });
        const neuSperr = ['.git/hooks/pre-commit', '.env', '.env.neu.js', '.github/workflows/neu.yml', '.claude/neu.json', 'node_modules/x.js', 'package.json', 'sub/package-lock.json', 'test/run.sh', 'test/umgebung.sh', 'test/db-vorbereiten.js', 'a.key', 'b.pem', '.GIT/config'];
        const ersSperr = ['.git', '.github/workflows/ci.yml', 'package.json', 'package-lock.json', 'test/run.sh', 'test/umgebung.sh', 'test/db-vorbereiten.js', '.claude/settings.json', '.env.beispiel'];
        const falsch = [];
        for (const p of neuSperr) { const r = t.w.neueDatei({ pfad: p, inhalt: 'x\n' }); if (!r.abgelehnt || !r.text.includes('immer gesperrt')) falsch.push(`neue_datei ${p}`); }
        for (const p of ersSperr) { const r = t.w.ersetze({ pfad: p, alt: p === '.git' ? 'gitdir' : (p.endsWith('.sh') ? 'e' : (p.includes('ci.yml') ? 'on' : '{')), neu: 'X' }); if (!r.abgelehnt || !r.text.includes('immer gesperrt')) falsch.push(`ersetze ${p}`); }
        pruefen(`B7 SCHREIBWEGE GESPERRT AUCH MIT --erlaubt=* UND --erlaubt=.github/: ${neuSperr.length} Pfade fuer neue_datei und ${ersSperr.length} fuer ersetze (.git als Datei, .env, .github, .claude, node_modules, package*.json, die drei Pflichtdateien, .key, .pem) -> abgelehnt "immer gesperrt", nichts entstanden oder geaendert (git status sauber, Schreibliste leer)`,
            falsch.length === 0 && statusVon(ctx, t.baum) === '' && t.w.schreibliste.size === 0 && neuSperr.length === 14 && ersSperr.length === 9 && !fs.existsSync(path.join(t.baum, '.env')));
    }
    {
        const tOhne = werkzeugeAuf(ctx, frischerBaum(ctx));
        const a1 = tOhne.w.neueDatei({ pfad: 'ops/neu.sh', inhalt: 'echo\n' });
        const a2 = tOhne.w.ersetze({ pfad: 'ops/skript.sh', alt: 'hallo', neu: 'welt' });
        const a3 = tOhne.w.neueDatei({ pfad: 'migrations/0002.sql', inhalt: 'SELECT 2;\n' });
        const a4 = tOhne.w.ersetze({ pfad: 'server.js', alt: 'strict', neu: 'x' });
        const a5 = tOhne.w.ersetze({ pfad: 'Dockerfile', alt: 'scratch', neu: 'x' });
        const tMit = werkzeugeAuf(ctx, frischerBaum(ctx), { erlaubt: ['ops/'] });
        const b1 = tMit.w.neueDatei({ pfad: 'ops/neu.sh', inhalt: 'echo\n' });
        const b2 = tMit.w.ersetze({ pfad: 'ops/skript.sh', alt: 'hallo', neu: 'welt' });
        const b3 = tMit.w.neueDatei({ pfad: 'migrations/0002.sql', inhalt: 'SELECT 2;\n' });
        pruefen('B7 ops/ OHNE UND MIT --erlaubt: ohne Freigabe sind ops/, migrations/, server.js und Dockerfile fuer Schreiben gesperrt (nichts geaendert); mit --erlaubt=ops/ geht ops/ (Freigabe im Protokoll), migrations/ bleibt zu',
            [a1, a2, a3, a4, a5].every((r) => r.abgelehnt === true && r.text.includes('ohne ausdrueckliches --erlaubt gesperrt')) && statusVon(ctx, tOhne.baum) === ''
            && b1.abgelehnt === false && b2.abgelehnt === false && b3.abgelehnt === true && tMit.protokoll.length === 2 && tMit.protokoll.every((e) => e.freigabe === 'ops/')
            && inhaltVon(tMit.baum, 'ops/skript.sh') === '#!/bin/sh\necho welt\n' && fs.existsSync(path.join(tMit.baum, 'ops/neu.sh')) && !fs.existsSync(path.join(tMit.baum, 'migrations/0002.sql')));
    }
    {
        const baum = frischerBaum(ctx);
        const t = werkzeugeAuf(ctx, baum);
        fs.symlinkSync('docs', path.join(baum, 'link-dir'));
        fs.symlinkSync('nirgends', path.join(baum, 'dangling.js'));
        const s1 = t.w.neueDatei({ pfad: 'link-dir/x.md', inhalt: 'x' });
        fs.renameSync(path.join(baum, 'docs'), path.join(baum, 'docs-alt'));
        fs.symlinkSync('docs-alt', path.join(baum, 'docs'));   // versionierte Datei docs/notiz.md liegt jetzt HINTER einem Symlink
        const s2 = t.w.ersetze({ pfad: 'docs/notiz.md', alt: 'Notiz', neu: 'X' });
        const s3 = t.w.ersetze({ pfad: 'zeiger.js', alt: '42', neu: '43' });
        const s4 = t.w.neueDatei({ pfad: 'dangling.js', inhalt: 'x' });
        const s5 = t.w.neueDatei({ pfad: 'link-dir/tief/neu.md', inhalt: 'x' });
        pruefen('B6 SYMLINKS IN JEDER EBENE: ein Symlink als Zwischenebene (link-dir -> docs; docs -> docs-alt vor der VERSIONIERTEN Datei docs/notiz.md) und als Datei (zeiger.js, versioniert; dangling.js) wird fuer neue_datei UND ersetze abgelehnt ("Symlink in der Pfadkette"); in docs/ und lib/wert.js entsteht/aendert sich nichts',
            [s1, s2, s3, s4, s5].every((r) => r.abgelehnt === true && r.text.includes('Symlink in der Pfadkette')) && !fs.existsSync(path.join(baum, 'docs-alt/x.md')) && !fs.existsSync(path.join(baum, 'docs-alt/tief'))
            && inhaltVon(baum, 'lib/wert.js') === 'module.exports = 42;\n' && inhaltVon(baum, 'docs-alt/notiz.md') === 'Notiz\n' && t.w.schreibliste.size === 0);
        const aussen = path.join(os.tmpdir(), `bau-spur-draussen-${process.pid}.js`);
        const o1 = t.w.neueDatei({ pfad: aussen, inhalt: 'x' });
        const o2 = t.w.neueDatei({ pfad: '../draussen.js', inhalt: 'x' });
        const o3 = t.w.ersetze({ pfad: '../lauf-1/lib/wert.js', alt: '42', neu: '43' });
        const o4 = t.w.ersetze({ pfad: '/etc/hostname', alt: 'a', neu: 'b' });
        pruefen('PFAD AUSSERHALB: absolute Pfade und ".." werden fuer neue_datei und ersetze abgelehnt; ausserhalb des Baums entsteht nichts',
            [o1, o2, o3, o4].every((r) => r.abgelehnt === true) && /absoluter Pfad/.test(o1.text) && /"\.\."/.test(o2.text) && !fs.existsSync(aussen) && !fs.existsSync(path.join(baum, '..', 'draussen.js')));
        const kt1 = bau.kettePruefen(baum, '../x.js');
        const kt2 = bau.kettePruefen(baum, 'lib/wert.js');
        const kt3 = bau.kettePruefen(baum, 'lib/wert.js/x.js');
        const kt4 = bau.kettePruefen(baum, 'neu/tief/x.js');
        pruefen('B6 KETTE EINZELN: kettePruefen lehnt "../x.js" ueber realpath ab (der Pfad fuehrt aus dem Baum hinaus — zweiter Riegel hinter der ".."-Regel), lehnt eine Zwischenebene ab, die eine Datei ist (lib/wert.js/x.js: "kein Verzeichnis"), nennt bei einem neuen Pfad die drei fehlenden Ebenen und liefert fuer eine vorhandene Datei den lstat',
            kt1.ok === false && /realpath/.test(kt1.grund) && kt2.ok === true && kt2.stFinal.isFile() && kt2.fehlend.length === 0 && kt3.ok === false && /kein Verzeichnis/.test(kt3.grund) && kt4.ok === true && kt4.stFinal === null && JSON.stringify(kt4.fehlend) === '["neu","neu/tief","neu/tief/x.js"]');
        const git1 = t.w.ersetze({ pfad: '.git', alt: 'gitdir', neu: 'x' });
        pruefen('B7 .git ALS DATEI: im verknuepften Arbeitsbaum ist .git eine DATEI mit "gitdir: …"; ersetze auf ".git" ist abgelehnt (immer gesperrt), die Datei bleibt, Positivkontrolle: sie existiert als Datei',
            git1.abgelehnt === true && git1.text.includes('immer gesperrt') && fs.statSync(path.join(baum, '.git')).isFile() && fs.readFileSync(path.join(baum, '.git'), 'utf8').startsWith('gitdir: '));
    }
    {
        const baum = frischerBaum(ctx);
        const t = werkzeugeAuf(ctx, baum);
        fs.unlinkSync(path.join(baum, 'docs/notiz-link.md'));
        fs.linkSync(path.join(baum, 'docs/notiz.md'), path.join(baum, 'docs/notiz-link.md'));
        const nlink = fs.statSync(path.join(baum, 'docs/notiz.md')).nlink;
        const h1 = t.w.ersetze({ pfad: 'docs/notiz-link.md', alt: 'Notiz', neu: 'X' });
        const h2 = t.w.ersetze({ pfad: 'docs/notiz.md', alt: 'Notiz', neu: 'X' });
        const h3 = t.w.ersetze({ pfad: 'README.md', alt: 'Fixtur', neu: 'X' });
        pruefen(`B6 HARDLINK: eine Datei mit nlink ${nlink} (docs/notiz.md und docs/notiz-link.md) wird fuer ersetze abgelehnt, BEIDE Inhalte bleiben "Notiz"; Positivkontrolle: README.md (nlink 1) geht`,
            nlink === 2 && h1.abgelehnt === true && h1.text.includes('Hardlink (nlink=2)') && h2.abgelehnt === true && inhaltVon(baum, 'docs/notiz.md') === 'Notiz\n' && inhaltVon(baum, 'docs/notiz-link.md') === 'Notiz\n' && h3.abgelehnt === false);
    }

    // ----- Atomar schreiben: Rollback bei Fehler, Aufraeumen bei Fehler -----
    {
        const baum = frischerBaum(ctx);
        const t = werkzeugeAuf(ctx, baum, { haken: { vorSchreiben: () => { throw new Error('simulierter Schreibfehler'); } } });
        const sha0 = shaVon(baum, 'lib/wert.js');
        const r = t.w.ersetze({ pfad: 'lib/wert.js', alt: '42', neu: '43' });
        pruefen('B6 ROLLBACK: scheitert das Schreiben NACH dem Oeffnen mit O_TRUNC (Datei schon abgeschnitten), schreibt ersetze den Ausgangsinhalt ueber denselben Deskriptor zurueck -> abgelehnt, Datei bytegleich zum Ausgang, keine Schreibliste, git status sauber',
            r.abgelehnt === true && r.text.includes('Ausgangsinhalt wiederhergestellt') && shaVon(baum, 'lib/wert.js') === sha0 && t.w.schreibliste.size === 0 && statusVon(ctx, baum) === '');
        const baum2 = frischerBaum(ctx);
        const t2 = werkzeugeAuf(ctx, baum2, { haken: { nachAnlegen: () => { throw new Error('simulierter Anlegefehler'); } } });
        const r2 = t2.w.neueDatei({ pfad: 'neu-ordner/tief/x.js', inhalt: 'x\n' });
        pruefen('B6 AUFRAEUMEN: scheitert neue_datei nach dem Anlegen (O_CREAT|O_EXCL), werden Datei UND die dafuer angelegten Verzeichnisse wieder entfernt -> abgelehnt, nichts uebrig, nicht als Lauf-Datei vermerkt',
            r2.abgelehnt === true && r2.text.includes('aufgeraeumt') && !fs.existsSync(path.join(baum2, 'neu-ordner')) && t2.w.laufNeuListe().length === 0 && statusVon(ctx, baum2) === '');
    }

    // ----- Geheimnis-Riegel auf dem Schreibweg -----
    {
        const baum = frischerBaum(ctx);
        const vorbedingung = pruefeGeheimnisse(SCHLUESSEL).sauber === true;
        const t = werkzeugeAuf(ctx, baum, { geheimnisse: [SCHLUESSEL] });
        const g1 = t.w.neueDatei({ pfad: 'g1.md', inhalt: `token = "${TOKEN}"\n` });
        const g2 = t.w.ersetze({ pfad: 'README.md', alt: 'Fixtur', neu: `x ${TOKEN}` });
        const g3 = t.w.neueDatei({ pfad: 'g3.md', inhalt: `schluessel ${SCHLUESSEL}\n` });
        const g4 = t.w.neueDatei({ pfad: 'g4.md', inhalt: `-----BEGIN ${'PRIVATE'} KEY-----\nMIIEabc\n-----END ${'PRIVATE'} KEY-----\n` });
        const g5 = t.w.neueDatei({ pfad: 'g5.md', inhalt: 'harmlos\n' });
        pruefen('B4 RIEGEL AUF DEM SCHREIBWEG: neue_datei und ersetze lehnen einen Treffer ab (GitHub-Token, PEM-Block) UND den exakten Schluessel (dessen Format der Riegel nicht erkennt: Vorbedingung pruefeGeheimnisse(schluessel).sauber); nichts geschrieben; harmloser Inhalt geht',
            vorbedingung && [g1, g2, g3, g4].every((r) => r.abgelehnt === true && r.text.includes('Geheimnis-Riegel')) && g3.text.includes('Schluessel (exakter Treffer)') && g1.text.includes('GitHub-Token')
            && !fs.existsSync(path.join(baum, 'g1.md')) && !fs.existsSync(path.join(baum, 'g3.md')) && !fs.existsSync(path.join(baum, 'g4.md')) && inhaltVon(baum, 'README.md') === '# Fixtur\n' && g5.abgelehnt === false);
    }

    // ----- registriere_test (B1, A6) -----
    {
        const baum = frischerBaum(ctx);
        const t = werkzeugeAuf(ctx, baum);
        const testInhalt = "console.log('  ✓ neu');\nconsole.log('1 PASS / 0 FAIL');\n";
        const n = t.w.neueDatei({ pfad: 'test_neu.js', inhalt: testInhalt });
        const r = t.w.registriereTest({ datei: 'test_neu.js' });
        const erwartet = RUN_SH.replace('  test_kanarie_static.js   # Kommentar hinter dem Eintrag\n)\n', '  test_kanarie_static.js   # Kommentar hinter dem Eintrag\n  test_neu.js\n)\n');
        const jetzt = inhaltVon(baum, 'test/run.sh');
        const bash = spawnSync('bash', ['-n', path.join(baum, 'test/run.sh')], { encoding: 'utf8' });
        pruefen('B1 registriere_test REGULAER: genau eine Zeile "  test_neu.js" vor der schliessenden Klammer (Datei wortgleich zum Erwartungswert), die alte Datei ohne diese Zeile ist BYTEGLEICH zum Ausgang (sha256), bash -n liefert 0, die TESTS-Liste ist die alte plus genau diesen Eintrag',
            n.abgelehnt === false && r.abgelehnt === false && jetzt === erwartet && sha(jetzt.replace('  test_neu.js\n', '')) === sha(RUN_SH) && bash.status === 0
            && JSON.stringify(sandboxModul.testsAusRunShText(jetzt)) === JSON.stringify(['ops/boot-smoke.js', 'test_alt.js', 'test_kanarie_static.js', 'test_neu.js']));
        pruefen('B1 registriere_test: Schreibliste und Protokoll fuehren die Registrierung als eigene Art (test/run.sh, art registriert, sha vorher = Ausgang), git status zeigt test/run.sh und die neue Testdatei, nichts sonst',
            JSON.stringify(t.w.registrierungen) === '["test_neu.js"]' && t.protokoll[1].pfad === 'test/run.sh' && t.protokoll[1].art === 'registriert' && t.protokoll[1].shaVorher === sha(RUN_SH) && t.protokoll[1].shaNachher === sha(erwartet)
            && statusVon(ctx, baum) === 'M test/run.sh\n?? test_neu.js' && t.w.nettoGeaendert().join() === 'test/run.sh,test_neu.js');
        const nachReg = shaVon(baum, 'test/run.sh');
        const d = t.w.registriereTest({ datei: 'test_neu.js' });
        pruefen('B1 DOPPELREGISTRIERUNG: dieselbe Datei ein zweites Mal wird abgelehnt, test/run.sh bleibt bytegleich zum Stand nach der ersten Registrierung',
            d.abgelehnt === true && d.text.includes('Doppelregistrierung') && shaVon(baum, 'test/run.sh') === nachReg);
        const boese = ['test_$(touch pwn).js', 'test_`id`.js', '../test_x.js', '/etc/test_x.js', 'test_x.js\nrm -rf x', 'sub/test_x.js', 'test_x.js # kommentar', 'test_a b.js', ')', 'test_x".js', "test_x'.js", 'test_x.js;', 'test_x.js\n', 'test_ä.js', 'test_x.JS', 'x.js', '', 'ops/boot-smoke.js', '..', 5, null];
        // Jeden Namen, den neue_datei anlegen KANN, legen wir VORHER an (dann ist er "in diesem Lauf angelegt"): so stoppt ihn
        // nur noch die Namensregel — ohne diesen Schritt haette die Regel "nur Dateien dieses Laufs" ihn gestoppt (zwei Riegel).
        const angelegt = boese.filter((name) => typeof name === 'string' && t.w.neueDatei({ pfad: name, inhalt: "console.log('1 PASS');\n" }).abgelehnt === false);
        const nachReg2 = shaVon(baum, 'test/run.sh');
        const falschB = [];
        for (const name of boese) { const x = t.w.registriereTest({ datei: name }); if (!x.abgelehnt || shaVon(baum, 'test/run.sh') !== nachReg2 || (angelegt.includes(name) && !x.text.includes('ungueltig'))) falschB.push(JSON.stringify(name)); }
        pruefen(`B1 NAMEN ABGELEHNT: ${boese.length} Namen ($(…), Backtick, "..", fuehrendes /, Zeilenumbruch, Unterverzeichnis, Kommentar, Leerzeichen, eine Zeile ")", Anfuehrungszeichen, Strichpunkt, Umlaut, .JS, ops/boot-smoke.js, Nicht-Texte) werden abgelehnt — die ${angelegt.length} davon, die neue_datei vorher ANLEGEN konnte (so dass nur die Namensregel sie stoppt), mit der Meldung "ungueltig"; test/run.sh bleibt bytegleich, es entsteht keine Datei "pwn"`,
            falschB.length === 0 && boese.length === 21 && angelegt.length >= 7 && angelegt.includes('test_$(touch pwn).js') && angelegt.includes('test_`id`.js') && !fs.existsSync(path.join(baum, 'pwn')) && !fs.existsSync(path.join(baum, 'x')));
        fs.writeFileSync(path.join(baum, 'test_roh.js'), 'x\n');
        const a1 = t.w.registriereTest({ datei: 'test_alt.js' });
        const a2 = t.w.registriereTest({ datei: 'test_roh.js' });
        pruefen('B1 NUR DATEIEN DIESES LAUFS: eine bestehende Testdatei (test_alt.js, schon registriert und versioniert) und eine OHNE neue_datei von aussen angelegte (test_roh.js) werden abgelehnt',
            a1.abgelehnt === true && a1.text.includes('nicht per neue_datei angelegt') && a2.abgelehnt === true && a2.text.includes('nicht per neue_datei angelegt') && shaVon(baum, 'test/run.sh') === nachReg);
    }
    {
        const baum = frischerBaum(ctx);
        const t = werkzeugeAuf(ctx, baum, { haken: { bashPruefer: ['false'] } });
        t.w.neueDatei({ pfad: 'test_b.js', inhalt: "console.log('1 PASS');\n" });
        const r = t.w.registriereTest({ datei: 'test_b.js' });
        pruefen('A6 bash -n: liefert die Syntaxpruefung nicht 0 (hier der Pruefer "false"), wird vor dem Schreiben abgelehnt; test/run.sh bleibt bytegleich, keine Registrierung',
            r.abgelehnt === true && r.text.includes('vor dem Schreiben: bash -n scheitert') && shaVon(baum, 'test/run.sh') === sha(RUN_SH) && t.w.registrierungen.length === 0);
        const baum2 = frischerBaum(ctx);
        const t2 = werkzeugeAuf(ctx, baum2, { haken: { nachPruefung: () => 'simulierter Fehler der Nachpruefung' } });
        t2.w.neueDatei({ pfad: 'test_c.js', inhalt: "console.log('1 PASS');\n" });
        const r2 = t2.w.registriereTest({ datei: 'test_c.js' });
        pruefen('A6 ZURUECKNAHME: schlaegt die Pruefung NACH dem Einfuegen an, wird test/run.sh zurueckgeschrieben und abgelehnt ("zurueckgenommen", sha = Ausgangsinhalt); keine Registrierung, keine Schreibliste fuer test/run.sh',
            r2.abgelehnt === true && r2.text.includes('zurueckgenommen') && r2.text.includes('= Ausgangsinhalt') && shaVon(baum2, 'test/run.sh') === sha(RUN_SH) && t2.w.registrierungen.length === 0 && !t2.w.schreibliste.has('test/run.sh'));
        const baum5 = frischerBaum(ctx);
        const t5a = werkzeugeAuf(ctx, baum5, { haken: { einfuegeZeile: (z) => `${z} extra.js` } });
        t5a.w.neueDatei({ pfad: 'test_f.js', inhalt: "console.log('1 PASS');\n" });
        const r6 = t5a.w.registriereTest({ datei: 'test_f.js' });
        const baum6 = frischerBaum(ctx);
        const t5b = werkzeugeAuf(ctx, baum6, { haken: { einfuegeZeile: (z) => `${z}\n  # eingeschleust` } });
        t5b.w.neueDatei({ pfad: 'test_g.js', inhalt: "console.log('1 PASS');\n" });
        const r7 = t5b.w.registriereTest({ datei: 'test_g.js' });
        pruefen('A6 LISTE UND BYTEGLEICHHEIT EINZELN: eine Einfuegung, die zwei Namen in die TESTS-Liste bringt (bash -n und Bytes bleiben unauffaellig), wird ueber die Listenpruefung abgelehnt; eine, die zusaetzlich eine Kommentarzeile einschleust (Liste unveraendert), ueber die Bytegleichheit der alten Datei — beide vor dem Schreiben, test/run.sh bleibt bytegleich',
            r6.abgelehnt === true && r6.text.includes('die Liste ist nicht die alte plus genau test_f.js') && shaVon(baum5, 'test/run.sh') === sha(RUN_SH) && r7.abgelehnt === true && r7.text.includes('die alte Datei ohne die neue Zeile ist NICHT bytegleich') && shaVon(baum6, 'test/run.sh') === sha(RUN_SH));
        const baum3 = frischerBaum(ctx);
        const t3 = werkzeugeAuf(ctx, baum3);
        t3.w.neueDatei({ pfad: 'test_d.js', inhalt: "console.log('1 PASS');\n" });
        fs.writeFileSync(path.join(baum3, 'test/run.sh'), RUN_SH.replace('\nTESTS=(\n', '\nTESTSX=(\n'));
        const shaKaputt = shaVon(baum3, 'test/run.sh');
        const r3 = t3.w.registriereTest({ datei: 'test_d.js' });
        fs.writeFileSync(path.join(baum3, 'test/run.sh'), '#!/usr/bin/env bash\nTESTS=(\n  test_a.js\n');
        const shaOhneKlammer = shaVon(baum3, 'test/run.sh');
        const r4 = t3.w.registriereTest({ datei: 'test_d.js' });
        pruefen('A6 KAPUTTE test/run.sh: ohne TESTS=(-Zeile und ohne schliessende Klammer wird abgelehnt (nicht auswertbar), die Datei bleibt unangetastet',
            r3.abgelehnt === true && r3.text.includes('nicht auswertbar') && shaVon(baum3, 'test/run.sh') !== sha(RUN_SH) && r4.abgelehnt === true && r4.text.includes('nicht auswertbar') && shaVon(baum3, 'test/run.sh') === shaOhneKlammer && shaKaputt !== shaOhneKlammer);
        const baum4 = frischerBaum(ctx);
        const t4 = werkzeugeAuf(ctx, baum4);
        t4.w.neueDatei({ pfad: 'test_e.js', inhalt: "console.log('1 PASS');\n" });
        fs.renameSync(path.join(baum4, 'test/run.sh'), path.join(baum4, 'run-alt.sh'));
        fs.symlinkSync('../run-alt.sh', path.join(baum4, 'test/run.sh'));
        const r5 = t4.w.registriereTest({ datei: 'test_e.js' });
        pruefen('B6 test/run.sh ALS SYMLINK: registriere_test folgt keinem Symlink (lstat je Ebene) -> abgelehnt, das Ziel run-alt.sh bleibt bytegleich',
            r5.abgelehnt === true && r5.text.includes('Symlink in der Pfadkette') && shaVon(baum4, 'run-alt.sh') === sha(RUN_SH));
    }

    // ----- Vorbedingungen: --baum (Art, Zielrepo B2, sauber A3), --protokoll, Schluesseldatei (A4) -----
    {
        const baum = frischerBaum(ctx, 'bau-art-ok');
        const ok = bau.baumArtPruefen(baum, ctx.umgebung);
        pruefen(`BAUM ART POSITIV: ein verknuepfter Arbeitsbaum unter der Arbeitswurzel mit Zweig bau-art-ok wird angenommen (${ok.ok ? ok.zweig : ok.grund})`,
            ok.ok === true && ok.zweig === 'bau-art-ok' && ok.baum === baum && fs.realpathSync(ok.commonDir) === fs.realpathSync(path.join(ctx.hauptklon, '.git')));
        const aussen = bau.baumArtPruefen(ctx.hauptklon, ctx.umgebung);
        const nichtGit = path.join(ctx.arbeitswurzel, 'kein-git');
        fs.mkdirSync(nichtGit);
        const haupt2 = hauptklonAnlegen(ctx, 'haupt2', null, ctx.arbeitswurzel);
        const mast = path.join(ctx.arbeitswurzel, 'zweig-master');
        const hauptz = path.join(ctx.arbeitswurzel, 'zweig-main');
        const losg = path.join(ctx.arbeitswurzel, 'zweig-losgeloest');
        ctx.g(ctx.hauptklon, 'worktree', 'add', '-q', '-b', 'master', mast);
        ctx.g(ctx.hauptklon, 'worktree', 'add', '-q', '-b', 'main', hauptz);
        ctx.g(ctx.hauptklon, 'worktree', 'add', '-q', '--detach', losg);
        const e = (p) => bau.baumArtPruefen(p, ctx.umgebung);
        pruefen('BAUM ART NEGATIV (Exit 10): ausserhalb der Arbeitswurzel (der Hauptklon), ein Haupt-Arbeitsbaum UNTER der Arbeitswurzel, Zweig master, Zweig main, losgeloester HEAD, ein Unterverzeichnis des Baums, ein Verzeichnis ohne Git, ein nicht vorhandener Pfad',
            aussen.ok === false && aussen.exit === 10 && /nicht unter/.test(aussen.grund) && e(haupt2).exit === 10 && /Haupt-Arbeitsbaum/.test(e(haupt2).grund)
            && e(mast).exit === 10 && /master/.test(e(mast).grund) && e(hauptz).exit === 10 && /main/.test(e(hauptz).grund) && e(losg).exit === 10 && /losgeloest/.test(e(losg).grund)
            && e(path.join(baum, 'lib')).exit === 10 && /nicht die Wurzel/.test(e(path.join(baum, 'lib')).grund) && e(nichtGit).exit === 10 && e(path.join(ctx.arbeitswurzel, 'gibt-es-nicht')).exit === 10);
        const zr = (info, o) => bau.zielrepoPruefen(info, { zielrepoGit: path.join(ctx.hauptklon, '.git'), werkzeugVerzeichnis: ctx.werkzeugDir, ...(o || {}) });
        const gutZ = zr(ok);
        // zweites Repo mit RICHTIGEM origin, aber nicht das Zielrepo (anderes git-common-dir)
        const hauptFremd = hauptklonAnlegen(ctx, 'hauptfremd', 'https://github.com/belehrung/gymdocu');
        const fremdBaum = path.join(ctx.arbeitswurzel, 'fremd-baum');
        ctx.g(hauptFremd, 'worktree', 'add', '-q', '-b', 'fremd', fremdBaum);
        const fremdInfo = e(fremdBaum);
        // drittes Repo mit FALSCHEM origin, als Zielrepo ausgegeben (common-dir passt, origin nicht)
        const hauptOrigin = hauptklonAnlegen(ctx, 'hauptorigin', 'https://github.com/andere/Repo.git');
        const originBaum = path.join(ctx.arbeitswurzel, 'origin-baum');
        ctx.g(hauptOrigin, 'worktree', 'add', '-q', '-b', 'origin-falsch', originBaum);
        const hauptOhne = hauptklonAnlegen(ctx, 'hauptohne', null);
        const ohneBaum = path.join(ctx.arbeitswurzel, 'ohne-baum');
        ctx.g(hauptOhne, 'worktree', 'add', '-q', '-b', 'ohne-origin', ohneBaum);
        pruefen('B2 ZIELREPO (Exit 11) IN BEIDE RICHTUNGEN: der Baum des GymDocu-Hauptklons mit origin belehrung/gymdocu wird angenommen; ein Baum aus einem ANDEREN Repo (richtiger origin, falsches git-common-dir), ein Baum mit falschem origin und ein Baum ohne origin werden mit Exit 11 abgelehnt',
            gutZ.ok === true && zr(fremdInfo).ok === false && zr(fremdInfo).exit === 11 && /nicht das Zielrepo/.test(zr(fremdInfo).grund)
            && zr(e(originBaum), { zielrepoGit: path.join(hauptOrigin, '.git') }).exit === 11 && /origin/.test(zr(e(originBaum), { zielrepoGit: path.join(hauptOrigin, '.git') }).grund)
            && zr(e(ohneBaum), { zielrepoGit: path.join(hauptOhne, '.git') }).exit === 11 && zr(ok, { zielrepoGit: path.join(ctx.basis, 'gibt-es-nicht', '.git') }).exit === 11);
        const origins = [['https://github.com/belehrung/gymdocu', true], ['https://github.com/Belehrung/Gymdocu.git', true], ['git@github.com:BELEHRUNG/GYMDOCU.git', true], ['http://local_proxy@127.0.0.1:1234/git/Belehrung/Gymdocu', true],
            ['https://github.com/belehrung/gymdocu/', true], ['https://github.com/belehrung/gymdocu-extra', false], ['https://github.com/belehrung/other', false], ['https://github.com/belehrung/gymdocu.git.evil', false], ['https://example.invalid/Belehrung/Gymdocu/x', false], ['', false]];
        const originFalsch = [];
        for (const [url, soll] of origins) {
            if (url) ctx.g(ctx.hauptklon, 'remote', 'set-url', 'origin', url); else ctx.g(ctx.hauptklon, 'remote', 'remove', 'origin');
            if (zr(ok).ok !== soll) originFalsch.push(url);
            if (!url) ctx.g(ctx.hauptklon, 'remote', 'add', 'origin', 'https://github.com/belehrung/gymdocu');
        }
        ctx.g(ctx.hauptklon, 'remote', 'set-url', 'origin', 'https://github.com/belehrung/gymdocu');
        pruefen(`B2 ORIGIN OHNE RUECKSICHT AUF GROSS-/KLEINSCHREIBUNG: ${origins.filter((o) => o[1]).length} URLs, die auf Belehrung/Gymdocu(.git) enden (https, ssh, Proxy, mit Schraegstrich, beliebige Schreibweise) gelten; ${origins.filter((o) => !o[1]).length} andere (gymdocu-extra, other, .git.evil, ein Unterpfad dahinter, leer) nicht`,
            originFalsch.length === 0);
        const wv = (dir) => zr(ok, { werkzeugVerzeichnis: dir });
        fs.mkdirSync(path.join(baum, 'tools'));
        const tiefer = wv(path.join(baum, 'tools'));
        fs.rmdirSync(path.join(baum, 'tools'));
        pruefen('B2 WERKZEUG UND BAUM LIEGEN NICHT INEINANDER: das Werkzeugverzeichnis gleich dem Baum, unter dem Baum (tools/ waere beschreibbar) oder der Baum darunter (Arbeitswurzel als Werkzeugverzeichnis) -> Exit 11; ein getrenntes Verzeichnis geht',
            wv(baum).exit === 11 && /liegt im Verzeichnis des laufenden Werkzeugs/.test(wv(baum).grund) && tiefer.exit === 11 && /liegt unter dem Baum/.test(tiefer.grund) && wv(ctx.arbeitswurzel).exit === 11 && wv(ctx.werkzeugDir).ok === true && /Verzeichnis des laufenden Werkzeugs/.test(wv(ctx.arbeitswurzel).grund));
        // sauberer Start (A3)
        const sBaum = frischerBaum(ctx, 'bau-sauber');
        const s1 = bau.baumSauberPruefen(sBaum);
        fs.writeFileSync(path.join(sBaum, 'lib/wert.js'), 'module.exports = 1;\n');
        const s2 = bau.baumSauberPruefen(sBaum);
        ctx.g(sBaum, 'checkout', '-q', '--', 'lib/wert.js');
        fs.writeFileSync(path.join(sBaum, 'ungetrackt.js'), 'x\n');
        const s3 = bau.baumSauberPruefen(sBaum);
        fs.unlinkSync(path.join(sBaum, 'ungetrackt.js'));
        fs.mkdirSync(path.join(sBaum, 'ignoriert'));
        fs.writeFileSync(path.join(sBaum, 'ignoriert/x.js'), 'x\n');
        const s4 = bau.baumSauberPruefen(sBaum);
        pruefen('A3 SAUBERER START (Exit 12): ein sauberer Baum geht; eine geaenderte versionierte Datei und eine ungetrackte Datei machen ihn unsauber (Meldung nennt Datei); ein von .gitignore erfasstes Verzeichnis zaehlt nicht',
            s1.ok === true && s2.ok === false && s2.exit === 12 && s2.grund.includes('lib/wert.js') && s3.ok === false && s3.exit === 12 && s3.grund.includes('ungetrackt.js') && s4.ok === true);
        const prot = bau.ausserhalbPruefen(path.join(ctx.basis, 'p.jsonl'), sBaum, '--protokoll');
        const protIn = bau.ausserhalbPruefen(path.join(sBaum, 'p.jsonl'), sBaum, '--protokoll');
        const protTief = bau.ausserhalbPruefen(path.join(sBaum, 'lib', '..', 'lib', 'p.jsonl'), sBaum, '--protokoll');
        fs.symlinkSync(sBaum, path.join(ctx.basis, 'link-in-baum'));
        const protLink = bau.ausserhalbPruefen(path.join(ctx.basis, 'link-in-baum', 'p.jsonl'), sBaum, '--protokoll');
        fs.symlinkSync(path.join(ctx.basis, 'ziel-datei'), path.join(ctx.basis, 'prot-symlink.jsonl'));
        const protSym = bau.ausserhalbPruefen(path.join(ctx.basis, 'prot-symlink.jsonl'), sBaum, '--protokoll');
        const protOhneOrdner = bau.ausserhalbPruefen(path.join(ctx.basis, 'gibt-es-nicht', 'p.jsonl'), sBaum, '--protokoll');
        pruefen('A3 --PROTOKOLL AUSSERHALB DES BAUMS (Exit 13): ausserhalb geht; im Baum, in einem Unterordner (auch ueber lib/..), ueber einen Symlink-Ordner in den Baum, als Symlink-Datei oder in einem nicht vorhandenen Ordner nicht; ohne Angabe Exit 2',
            prot.ok === true && protIn.ok === false && protIn.exit === 13 && protTief.exit === 13 && protLink.exit === 13 && protSym.exit === 13 && protOhneOrdner.exit === 13 && bau.ausserhalbPruefen(undefined, sBaum, '--protokoll').exit === 2);
        // Schluesseldatei (A4) — mit der eigenen uid als erwartetem Eigentuemer (root-Fall: --selbsttest-root)
        const meineUid = process.getuid();
        const sk = (name, modus, inhalt) => { const p = path.join(ctx.basis, name); fs.writeFileSync(p, inhalt === undefined ? `${SCHLUESSEL}\n` : inhalt, { mode: modus }); fs.chmodSync(p, modus); return p; };
        const k600 = bau.schluesselDateiPruefen(sk('k600', 0o600), meineUid);
        const kFalsch = ['k644', 'k640', 'k660', 'k700', 'k400'].map((n, i) => bau.schluesselDateiPruefen(sk(n, [0o644, 0o640, 0o660, 0o700, 0o400][i]), meineUid));
        const kUid = bau.schluesselDateiPruefen(sk('k-uid', 0o600), meineUid + 1);
        fs.symlinkSync(path.join(ctx.basis, 'k600'), path.join(ctx.basis, 'k-link'));
        const kLink = bau.schluesselDateiPruefen(path.join(ctx.basis, 'k-link'), meineUid);
        const kLeer = bau.schluesselDateiPruefen(sk('k-leer', 0o600, '\n'), meineUid);
        const kDir = bau.schluesselDateiPruefen(ctx.basis, meineUid);
        const kFehlt = bau.schluesselDateiPruefen(path.join(ctx.basis, 'gibt-es-nicht'), meineUid);
        const alleMeldungen = [kUid, kLink, kLeer, kDir, kFehlt, ...kFalsch].map((r) => r.grund).join('\n');
        pruefen('A4 SCHLUESSELDATEI (Exit 15): Rechte 600 und der verlangte Eigentuemer gehen (der Schluessel kommt zurueck); 644, 640, 660, 700, 400, ein fremder Eigentuemer, ein Symlink, eine leere Datei, ein Verzeichnis und eine fehlende Datei brechen ab; KEINE Meldung enthaelt den Schluessel',
            k600.ok === true && k600.schluessel === SCHLUESSEL && kFalsch.every((r) => r.ok === false && r.exit === 15 && /Rechte \d+, verlangt sind 600/.test(r.grund)) && kUid.exit === 15 && /gehoert uid/.test(kUid.grund)
            && kLink.exit === 15 && kLeer.exit === 15 && /leer/.test(kLeer.grund) && kDir.exit === 15 && kFehlt.exit === 15 && !alleMeldungen.includes(SCHLUESSEL) && !alleMeldungen.includes('abcdefg'));
        // Exit 17 ohne Modellkontakt und ohne Zeile
        const vorZeile = fs.readFileSync(ctx.bauZeilen, 'utf8');
        const e17 = await laufMitDrehbuch(ctx, [], { sandboxVerhalten: { einrichtenFehler: 'braucht root (Attrappe)' } });
        pruefen('EXIT 17 VOR DEM ERSTEN MODELLAUFRUF: laesst sich die Sandbox nicht einrichten, gibt es Exit 17, KEINEN Modellaufruf und KEINE Zeile in BAU-LAEUFE.md (kein Lauf fand statt)',
            e17.ergebnis.exit === 17 && e17.anfragenAnzahl === 0 && e17.err.includes('Sandbox nicht einrichtbar') && fs.readFileSync(ctx.bauZeilen, 'utf8') === vorZeile && e17.protokollZeilen().pop().exit === 17);
    }

    // ----- Der Lauf mit Attrappen-Modell: regulaer, Protokoll, Zeile in BAU-LAEUFE.md -----
    {
        const baum = frischerBaum(ctx);
        const testInhalt = "console.log('  ✓ x');\nconsole.log('1 PASS / 0 FAIL');\n";
        const drehbuch = [
            antwort([fc('c1', 'lies', { pfad: 'lib/wert.js', von: 1, bis: 1 }), fc('c2', 'suche', { muster: 'module' })], 250000, 25000),
            antwort([fc('c3', 'neue_datei', { pfad: 'test_x.js', inhalt: testInhalt }), fc('c4', 'ersetze', { pfad: 'lib/wert.js', alt: '42', neu: '43' })], 250000, 25000),
            antwort([fc('c5', 'registriere_test', { datei: 'test_x.js' }), fc('c6', 'teste', { testdatei: 'test_x.js' }), fc('c7', 'mutiere_und_teste', { datei: 'lib/wert.js', alt: '43', neu: '44', testdatei: 'test_x.js' })], 250000, 25000),
            antwort([fc('c8', 'fertig', { bericht: berichtOk() })], 250000, 25000),
        ];
        const L = await mitFesterZeit('2026-10-03T23:30:00Z', () => laufMitDrehbuch(ctx, drehbuch, { baum, zweck: 'Zweck | mit Strich' }));
        const z = L.ergebnis.zustand;
        pruefen('LAUF REGULAER: vier Runden, fertig() gerufen -> Exit 0, Status fertig; Runden 4, Token 1000000 rein / 100000 raus, geschaetzte Kosten $2,60 (4 x 250000 rein x 2 $/M + 4 x 25000 raus x 6 $/M — Literal), vier Modellaufrufe',
            L.ergebnis.exit === 0 && L.ergebnis.status === 'fertig' && z.runde === 4 && z.tokenRein === 1000000 && z.tokenRaus === 100000 && Math.abs(z.kosten - 2.6) < 1e-9 && L.anfragenAnzahl === 4);
        const gitZeilen = L.log.split('\n').filter((l) => /^\s*(M|\?\?) |^ M /.test(l) || /^ (M|\?\?) /.test(l));
        pruefen('ENDVERGLEICH GEDRUCKT: das Werkzeug selbst druckt die Liste aus git status (lib/wert.js, test/run.sh geaendert, test_x.js neu) und die eigene Schreibliste; beide stimmen ueberein; Kategorien "NEUE DATEIEN" und "REGISTRIERUNGEN" stehen eigens',
            L.log.includes('GEAENDERTE DATEIEN laut "git status --porcelain" des Baums (vom Werkzeug ermittelt, nicht vom Modell):') && L.log.includes('   M lib/wert.js') && L.log.includes('   M test/run.sh') && L.log.includes('  ?? test_x.js')
            && L.log.includes('SCHREIBLISTE des Werkzeugs (netto geaendert): lib/wert.js, test/run.sh, test_x.js') && L.log.includes('NEUE DATEIEN: test_x.js   REGISTRIERUNGEN in test/run.sh: test_x.js') && !L.log.includes('LAUTER FEHLER') && gitZeilen.length >= 3);
        pruefen('MUTATION NICHT IM BAUM: nach mutiere_und_teste steht lib/wert.js im Baum auf 43 (dem Stand NACH ersetze), nicht auf 44; die Sandbox bekam Baustand-Modus und die Lauf-Dateien (test_x.js) als neueDateien()',
            inhaltVon(baum, 'lib/wert.js') === 'module.exports = 43;\n' && L.sandbox.eingerichtet[0].modus === 'baustand' && JSON.stringify(L.sandbox.eingerichtet[0].neueDateien()) === '["test_x.js"]'
            && L.sandbox.aufrufe.map((a) => a.name).join() === 'teste,mutiere_und_teste' && L.sandbox.aufgeraeumt === 1);
        const pz = L.protokollZeilen();
        const sz = pz.filter((p) => p.typ === 'schreibzugriff');
        pruefen('PROTOKOLL: jeder Schreibzugriff mit Pfad, art, sha256 vorher und nachher (unabhaengig gerechnet) und Groesse; Start mit Freigabe "keine" und der Werkzeugliste; Ende mit Status fertig und Exit 0',
            sz.length === 3 && sz[0].pfad === 'test_x.js' && sz[0].art === 'neu' && sz[0].shaVorher === null && sz[0].shaNachher === sha(testInhalt) && sz[0].groesse === Buffer.byteLength(testInhalt)
            && sz[1].pfad === 'lib/wert.js' && sz[1].art === 'ersetzt' && sz[1].shaVorher === sha('module.exports = 42;\n') && sz[1].shaNachher === sha('module.exports = 43;\n') && sz[2].pfad === 'test/run.sh' && sz[2].art === 'registriert'
            && pz[0].typ === 'start' && pz[0].freigabe === 'keine' && pz[0].werkzeuge.join() === 'lies,suche,ersetze,neue_datei,registriere_test,teste,mutiere_und_teste,fertig' && pz[pz.length - 1].typ === 'ende' && pz[pz.length - 1].status === 'fertig' && pz[pz.length - 1].exit === 0);
        const zeile = L.bauZeile();
        pruefen('BAU-LAEUFE.md: eine Zeile mit DATUM IN EUROPE/BERLIN (UTC 03.10. 23:30 ist in Berlin der 04.10.: "04.10.2026", nicht der UTC-Tag), Zweck (ein "|" darin maskiert), Modell, Runden, Token rein / raus, Kosten, Ergebnis und den beiden Platzhaltern fuer den Haupt-Agenten',
            zeile === '| 04.10.2026 | Zweck \\| mit Strich | qwen3.8-max | 4 | 1000000 / 100000 | 2,60 $ | fertig, Exit 0; netto geaendert 3, neu 1, registriert 1 | — | — |');
        const v = L.verlaeufe;
        pruefen('SCHLEIFE: Runde 1 sieht Auftrag + Rundenstand, Runde 2 die Funktionsantworten zu c1/c2 mit dem Inhalt von lies; die Antwort des Modells (alle output-Elemente) geht unveraendert zurueck; erste Anfrage traegt alle acht Werkzeuge und den Vorspann als instructions',
            v[0].length === 2 && v[0][0].role === 'user' && v[0][1].content.startsWith('[Rundenstand: Runde 1 von 60') && v[1].some((e) => e.type === 'function_call_output' && e.call_id === 'c1' && e.output.includes('1:module.exports = 42;'))
            && v[1].some((e) => e.type === 'function_call' && e.call_id === 'c2') && v[1].some((e) => e.type === 'function_call_output' && e.call_id === 'c2' && e.output.includes('lib/wert.js:1:module.exports = 42;'))
            && L.aufrufe[0].werkzeuge.join() === 'lies,suche,ersetze,neue_datei,registriere_test,teste,mutiere_und_teste,fertig' && L.aufrufe[0].instructions.includes('in diesem Lauf nichts freigegeben') && L.aufrufe[0].instructions.includes('GEGENPROBE'));
        pruefen('BERICHT AUSGEGEBEN: der Bericht des Modells steht als Behauptung (Kategorien neue_testdateien und registrierungen eigens), Punkte mit "nicht umgesetzt" und Grund; Protokollpfad am Ende',
            L.log.includes('BERICHT DES MODELLS (Behauptung, nicht Messung):') && L.log.includes('"neue_testdateien"') && L.log.includes('"registrierungen"') && L.log.includes('braucht eine Entscheidung') && L.log.includes(`Protokoll: ${L.protokollPfad}`) && L.log.includes('=========== BERICHT ==========='));
    }

    // ----- Budget: Runden und Kosten, VOR jedem Modellaufruf; Sandbox-Deckel -----
    {
        const leerRunde = (rein, raus) => antwort([fc(`l${Math.random()}`, 'lies', { pfad: 'lib/wert.js', von: 1, bis: 1 })], rein, raus);
        const dreh = () => [leerRunde(1000, 100), leerRunde(1000, 100), leerRunde(1000, 100), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 1000, 100)];
        const r2 = await laufMitDrehbuch(ctx, dreh(), { maxRunden: 2 });
        pruefen('BUDGET RUNDEN: --max-runden=2 beendet den Lauf VOR dem dritten Modellaufruf als "Budget erschoepft" (Exit 20) mit Teilbericht und Zeile in BAU-LAEUFE.md — nie still; genau 2 Aufrufe, Runden 2',
            r2.ergebnis.exit === 20 && r2.ergebnis.status === 'budget-erschoepft' && r2.anfragenAnzahl === 2 && r2.ergebnis.zustand.runde === 2 && r2.log.includes('TEILBERICHT (Lauf vorzeitig beendet — NICHT als fertig werten)')
            && r2.log.includes('Status: budget-erschoepft (Rundenlimit 2 erreicht)   Exit: 20') && r2.bauZeile().includes('**abgebrochen** budget-erschoepft (Rundenlimit 2 erreicht), Exit 20') && r2.bauZeile().includes('| 2 | 2000 / 200 |'));
        const r4 = await laufMitDrehbuch(ctx, dreh(), { maxRunden: 4 });
        pruefen('BUDGET RUNDEN GEGENRICHTUNG: mit --max-runden=4 laeuft dasselbe Drehbuch bis zu fertig (Exit 0, 4 Aufrufe) — der Deckel schliesst bei der Rundenzahl, nicht davor',
            r4.ergebnis.exit === 0 && r4.anfragenAnzahl === 4 && r4.ergebnis.status === 'fertig');
        const teuer = () => [antwort([fc('a', 'lies', { pfad: 'lib/wert.js', von: 1, bis: 1 })], 1000000, 0), antwort([fc('b', 'lies', { pfad: 'lib/wert.js', von: 1, bis: 1 })], 1000000, 0), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 10, 10)];
        const k15 = await laufMitDrehbuch(ctx, teuer(), { maxKosten: 1.5 });
        const k25 = await laufMitDrehbuch(ctx, teuer(), { maxKosten: 2.5 });
        const k2 = await laufMitDrehbuch(ctx, teuer(), { maxKosten: 2 });
        const k201 = await laufMitDrehbuch(ctx, teuer(), { maxKosten: 2.01 });
        pruefen('BUDGET KOSTEN (feste Token- und Preiswerte: 1.000.000 Token rein je Runde zu 2 $/M = 2,00 $): --max-kosten-usd=1.5 beendet VOR der zweiten Runde (1 Aufruf, Exit 20, "Kostendeckel"); =2 ebenso (>= schliesst); =2.01 und =2.5 lassen die zweite Runde zu',
            k15.ergebnis.exit === 20 && k15.anfragenAnzahl === 1 && k15.ergebnis.zustand.kosten === 2 && k15.log.includes('Kostendeckel 1.5 $ erreicht') && k2.ergebnis.exit === 20 && k2.anfragenAnzahl === 1
            && k201.anfragenAnzahl === 2 && k201.ergebnis.exit === 20 && k25.anfragenAnzahl === 2 && k25.ergebnis.zustand.kosten === 4 && k25.ergebnis.status === 'budget-erschoepft');
        pruefen('BUDGET KOSTEN: ein Teilbericht mit Kosten "mind." in der Zeile von BAU-LAEUFE.md und Token der erfassten Runden; der Lauf ist keine Fertigmeldung',
            k15.bauZeile().includes('| 1 | 1000000 / 0 | mind. 2,00 $ |') && k15.log.includes('Kosten geschaetzt: $2.0000') && !k15.log.includes('=========== BERICHT ==========='));
        const D = (deckel) => (name) => ({ text: deckel ? 'abgelehnt: Deckel: hoechstens 30 Ausfuehrungs-Aufrufe je Lauf (dies war Nr. 31)' : 'abgelehnt: unzulaessiger Testdateiname', abgelehnt: true, status: 'abgelehnt', deckel });
        const dreh2 = () => [antwort([fc('t1', 'teste', { testdatei: 'test_alt.js' }), fc('t2', 'teste', { testdatei: 'test_alt.js' })], 1000, 100), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 1000, 100)];
        const sd = await laufMitDrehbuch(ctx, dreh2(), { sandboxVerhalten: { antwort: D(true) } });
        const sn = await laufMitDrehbuch(ctx, dreh2(), { sandboxVerhalten: { antwort: D(false) } });
        pruefen('BUDGET SANDBOX: erreicht ein Deckel der Sandbox (Aufrufe/Ausfuehrungszeit, "deckel": true) endet der Lauf als "Budget erschoepft (Sandbox)" mit Exit 20 und Teilbericht — der naechste Aufruf derselben Antwort bekommt "der Lauf ist beendet"; eine andere Ablehnung (deckel false) laesst den Lauf weiterlaufen bis fertig',
            sd.ergebnis.exit === 20 && sd.ergebnis.status === 'budget-erschoepft' && sd.log.includes('Sandbox-Deckel') && sd.anfragenAnzahl === 1 && sd.sandbox.aufrufe.length === 1 && sd.ergebnis.zustand.testLaeufe.length === 1
            && sn.ergebnis.exit === 0 && sn.anfragenAnzahl === 2 && sn.sandbox.aufrufe.length === 2);
        const iso = await laufMitDrehbuch(ctx, dreh2(), { sandboxVerhalten: { antwort: (name, args, s) => { s.abgebrochen = true; return { text: 'abgelehnt: AUSFÜHRUNG ABGEBROCHEN', abgelehnt: true, status: 'abgelehnt', deckel: false }; } } });
        const wb = await laufMitDrehbuch(ctx, dreh2(), { sandboxVerhalten: { antwort: (name, args, s) => { s.werkzeugBefund = true; return { text: 'abgelehnt: WERKZEUG-BEFUND', abgelehnt: true, status: 'abgelehnt', deckel: false }; } } });
        pruefen('ISOLATION UND WERKZEUG-BEFUND: bricht die Sandbox ihre Isolation ab, endet der Lauf mit Exit 25, bei einem Werkzeug-Befund mit Exit 26 — beide mit Teilbericht, ohne weiteren Modellaufruf (kein Test wird als Beleg gewertet)',
            iso.ergebnis.exit === 25 && iso.ergebnis.status === 'isolation-abgebrochen' && iso.anfragenAnzahl === 1 && iso.log.includes('AUSFÜHRUNG ABGEBROCHEN') && wb.ergebnis.exit === 26 && wb.ergebnis.status === 'werkzeug-befund' && wb.anfragenAnzahl === 1);
        const un = await laufMitDrehbuch(ctx, dreh2(), { sandboxVerhalten: { sauber: false } });
        pruefen('AUFRAEUMEN UNVOLLSTAENDIG: meldet die Sandbox Reste, wird aus einem sonst regulaeren Lauf Exit 27 (nie 0); die Meldung steht im Bericht',
            un.ergebnis.exit === 27 && un.log.includes('Aufraeumen der Sandbox unvollstaendig') && un.sandbox.aufgeraeumt === 1);
    }

    // ----- Netz- und HTTP-Fehler, unvollstaendige Antwort, kein fertig, kaputte Argumente, Laengendeckel -----
    {
        const eins = () => antwort([fc('a', 'lies', { pfad: 'lib/wert.js', von: 1, bis: 1 })], 250000, 25000);
        const netz = await laufMitDrehbuch(ctx, [eins(), new Error('HTTP 503: Service Unavailable')]);
        pruefen('NETZFEHLER MITTEN IM LAUF: ein HTTP-/Stromfehler in Runde 2 endet mit Teilbericht und Exit 21 (abbruch-netz); die Zahlen der ersten Runde bleiben (250000/25000, mind. 0,65 $), die Zeile in BAU-LAEUFE.md nennt den Abbruch',
            netz.ergebnis.exit === 21 && netz.ergebnis.status === 'abbruch-netz' && netz.ergebnis.zustand.tokenRein === 250000 && netz.ergebnis.zustand.tokenRaus === 25000 && netz.err.includes('HTTP 503') && netz.bauZeile().includes('| 2 | 250000 / 25000 | mind. 0,65 $ |') && netz.bauZeile().includes('**abgebrochen** abbruch-netz'));
        const inc = Object.assign(new Error('Anfrage nicht abgeschlossen: status="incomplete", Grund: max_output_tokens'), { gegenleserStatus: 'incomplete', gegenleserGrund: 'max_output_tokens', gegenleserUsage: { input_tokens: 100000, output_tokens: 32000 } });
        const unvoll = await laufMitDrehbuch(ctx, [eins(), inc]);
        pruefen('UNVOLLSTAENDIGE ANTWORT: status incomplete (max_output_tokens) endet mit Exit 22 (abbruch-antwort); die BEZAHLTE Nutzung des Fehlschlags (100000/32000) wird verbucht: Token 350000 / 57000',
            unvoll.ergebnis.exit === 22 && unvoll.ergebnis.status === 'abbruch-antwort' && unvoll.ergebnis.zustand.tokenRein === 350000 && unvoll.ergebnis.zustand.tokenRaus === 57000 && unvoll.bauZeile().includes('350000 / 57000'));
        const ohneUsage = await laufMitDrehbuch(ctx, [{ output: [fc('a', 'lies', { pfad: 'lib/wert.js', von: 1, bis: 1 })], status: 'completed' }]);
        pruefen('ANTWORT OHNE USAGE: die Kosten waeren nicht bestimmbar — ein Kostendeckel, der nicht rechnen kann, ist keiner: Exit 22, kein Werkzeug ausgefuehrt',
            ohneUsage.ergebnis.exit === 22 && ohneUsage.ergebnis.status === 'abbruch-antwort' && ohneUsage.log.includes('Antwort ohne verwertbare usage') && ohneUsage.ergebnis.zustand.aufrufe === 0);
        const kf = await laufMitDrehbuch(ctx, [textAntwort('Ich bin fertig, glaube ich.', 1000, 100), textAntwort('Wirklich.', 1000, 100)]);
        const kf2 = await laufMitDrehbuch(ctx, [textAntwort('Moment.', 1000, 100), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 1000, 100)]);
        pruefen('KEIN FERTIG: zwei Textantworten hintereinander ohne Werkzeugaufruf enden mit Exit 23 (Teilbericht nennt die letzte Textantwort); eine einzelne Textantwort bekommt eine Erinnerung und der Zaehler beginnt neu (danach fertig -> Exit 0)',
            kf.ergebnis.exit === 23 && kf.ergebnis.status === 'kein-fertig' && kf.log.includes('LETZTE TEXTANTWORT DES MODELLS (kein fertig): Wirklich.') && kf2.ergebnis.exit === 0 && kf2.verlaeufe[1].some((e) => e.role === 'user' && e.content.includes('kein Werkzeug aufgerufen')));
        const sandboxA = sandboxAttrappe();
        const arg = await laufMitDrehbuch(ctx, [antwort([fc('k1', 'ersetze', '{kaputt'), fc('k2', 'teste', '{kaputt'), fc('k3', 'lies', '[]'), fc('k4', 'ersetze', {}), fc('k5', 'gibtesnicht', { a: 1 }), fc('k6', 'registriere_test', { datei: 5 })], 1000, 100), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 1000, 100)], { sandbox: sandboxA });
        const ausg = (id) => (arg.verlaeufe[1].find((e) => e.type === 'function_call_output' && e.call_id === id) || {}).output || '';
        const pa = arg.protokollZeilen().filter((p) => p.typ === 'funktionsantwort');
        pruefen('KAPUTTE WERKZEUGARGUMENTE: unlesbares JSON, ein Array statt Objekt, fehlende Felder, eine unbekannte Funktion und ein Nicht-Text-Name gehen als ABLEHNUNG ans Modell zurueck (der Lauf geht weiter, Exit 0 nach fertig) und stehen im Protokoll mit Status abgelehnt; ein kaputter teste-Aufruf zaehlt gegen den Deckel der Sandbox',
            arg.ergebnis.exit === 0 && ausg('k1').startsWith('abgelehnt: ungueltige Argumente') && ausg('k2').startsWith('abgelehnt: ungueltige Argumente') && ausg('k3').includes('ungueltige Argumente') && ausg('k4').startsWith('abgelehnt:')
            && ausg('k5') === 'abgelehnt: unbekannte Funktion "gibtesnicht"' && ausg('k6').startsWith('abgelehnt:') && pa.filter((p) => p.status === 'abgelehnt').length === 6 && JSON.stringify(sandboxA.ungueltige) === '["teste"]' && arg.ergebnis.zustand.ablehnungen === 6);
        const langText = 'Zeile mit Inhalt\n'.repeat(10000);   // 170000 Bytes
        const lang = await laufMitDrehbuch(ctx, [antwort([fc('s1', 'teste', { testdatei: 'test_alt.js' })], 1000, 100), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 1000, 100)], { sandboxVerhalten: { antwort: () => ({ text: langText, abgelehnt: false, status: 'bestanden' }) } });
        const langOut = (lang.verlaeufe[1].find((e) => e.type === 'function_call_output' && e.call_id === 's1') || {}).output || '';
        pruefen(`LAENGENDECKEL JEDES WERKZEUGERGEBNISSES: ein Ergebnis von ${Buffer.byteLength(langText)} Bytes geht hoechstens mit 40960 Bytes ins Modell (UTF-8-sauber gekuerzt, Kuerzung benannt); ein kurzes Ergebnis bleibt ungekuerzt`,
            Buffer.byteLength(langText) === 170000 && Buffer.byteLength(langOut) <= 40960 && Buffer.byteLength(langOut) > 30000 && langOut.includes('gekuerzt') && !langOut.includes('\uFFFD') && (arg.verlaeufe[1].find((e) => e.type === 'function_call_output' && e.call_id === 'k5') || {}).output.length < 100);
    }

    // ----- Geheimnis-Riegel auf Lese-Ergebnissen und auf jedem Modelltext (B4) -----
    {
        const dreh = [antwort([fc('g1', 'lies', { pfad: 'docs/geheim.md', von: 1, bis: 3 }), fc('g2', 'suche', { muster: 'token', dateimuster: 'docs/*' })], 1000, 100),
            antwort([fc('f', 'fertig', { bericht: { ...berichtOk(), zusammenfassung: `Fertig. Der Schluessel war ${SCHLUESSEL}, dazu \u001b[31mESC.`, offen: [`Token ${TOKEN} gesehen`] } })], 1000, 100)];
        const L = await laufMitDrehbuch(ctx, dreh, { geheimnisse: [SCHLUESSEL], zweck: `Zweck mit ${SCHLUESSEL}` });
        const g1 = (L.verlaeufe[1].find((e) => e.call_id === 'g1' && e.type === 'function_call_output') || {}).output || '';
        const g2 = (L.verlaeufe[1].find((e) => e.call_id === 'g2' && e.type === 'function_call_output') || {}).output || '';
        pruefen('RIEGEL AUF LESE-ERGEBNISSEN: lies und suche liefern die Zeile mit dem Token NICHT, sondern den Marker "[ZEILE ENTFERNT — Geheimnis-Riegel: GitHub-Token]"; die harmlosen Nachbarzeilen kommen durch; das Token steht auch nirgends im Protokoll',
            g1.includes('[ZEILE ENTFERNT — Geheimnis-Riegel: GitHub-Token]') && g1.includes('harmlose Zeile') && g1.includes('noch eine harmlose Zeile') && !g1.includes('AAAAAAAAAA') && g2.includes('[ZEILE ENTFERNT — Geheimnis-Riegel: GitHub-Token]') && !g2.includes('AAAAAAAAAA')
            && !fs.readFileSync(L.protokollPfad, 'utf8').includes('AAAAAAAAAA') && L.ergebnis.zustand.geschwaerzt.length >= 2);
        const alles = `${L.log}\n${L.err}\n${fs.readFileSync(L.protokollPfad, 'utf8')}\n${fs.readFileSync(ctx.bauZeilen, 'utf8')}`;
        pruefen('B4 RIEGEL AUF JEDEM MODELLTEXT: Bericht aus fertig(), Zweck und alles im Protokoll und in BAU-LAEUFE.md tragen weder das Token noch den exakten Schluessel (dessen Format der Riegel nicht erkennt) — an ihrer Stelle die Marker; ein ESC im Bericht wird zu U+FFFD neutralisiert',
            !alles.includes(TOKEN) && !alles.includes('AAAAAAAAAAAA') && !alles.includes(SCHLUESSEL) && !alles.includes('abcdefg') && !alles.includes('SSSSSSSSSS') && L.log.includes('Der Schluessel war [SCHLUESSEL ENTFERNT], dazu') && L.log.includes('[ZEILE ENTFERNT — Geheimnis-Riegel: GitHub-Token]')
            && !/\u001b/.test(alles) && L.log.includes('\uFFFD[31mESC') && L.bauZeile().includes('Zweck mit [SCHLUESSEL ENTFERNT]'));
    }

    // ----- Schreibliste gegen git status: Abweichung, Netto-Unveraendert, Fertig mit falschem Bericht -----
    {
        const stray = (rel, inhalt) => (name, args, s) => { fs.writeFileSync(path.join(s.baum, rel), inhalt); return { text: 'status: bestanden\nexit: 0\n', abgelehnt: false, status: 'bestanden' }; };
        const drehTeste = () => [antwort([fc('t', 'teste', { testdatei: 'test_alt.js' })], 1000, 100), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 1000, 100)];
        const mitBaum = (rel, inhalt) => { const baum = frischerBaum(ctx); const sb = sandboxAttrappe({ antwort: stray(rel, inhalt) }); sb.baum = baum; return { baum, sb }; };
        const a = mitBaum('heimlich.js', 'x\n');
        const La = await laufMitDrehbuch(ctx, drehTeste(), { baum: a.baum, sandbox: a.sb });
        pruefen('ENDVERGLEICH ABWEICHUNG (kuenstlich hergestellt): schreibt etwas hinter dem Ruecken des Werkzeugs eine Datei in den Baum (heimlich.js), endet der Lauf mit Exit 24 (schreibliste-abweichung) und LAUTEM Fehler, der die Datei nennt — obwohl das Modell fertig() rief',
            La.ergebnis.exit === 24 && La.ergebnis.status === 'schreibliste-abweichung' && La.log.includes('LAUTER FEHLER: Abweichung zwischen git status und Schreibliste') && La.log.includes('nur in git status: [heimlich.js]') && La.bauZeile().includes('schreibliste-abweichung, Exit 24'));
        const b = mitBaum('README.md', 'heimlich geaendert\n');
        const Lb = await laufMitDrehbuch(ctx, drehTeste(), { baum: b.baum, sandbox: b.sb });
        pruefen('ENDVERGLEICH: auch eine hinter dem Ruecken geaenderte VERSIONIERTE Datei (README.md) ist eine Abweichung (Exit 24)',
            Lb.ergebnis.exit === 24 && Lb.log.includes('nur in git status: [README.md]'));
        const baumC = frischerBaum(ctx);
        const sbC = sandboxAttrappe({ antwort: stray('lib/wert.js', 'module.exports = 99;\n') });
        sbC.baum = baumC;
        const Lc = await laufMitDrehbuch(ctx, [antwort([fc('e', 'ersetze', { pfad: 'lib/wert.js', alt: '42', neu: '43' })], 1000, 100), antwort([fc('t', 'teste', { testdatei: 'test_alt.js' })], 1000, 100), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 1000, 100)], { baum: baumC, sandbox: sbC });
        pruefen('ENDVERGLEICH HASH: eine vom Werkzeug geschriebene Datei, die danach heimlich nochmals geaendert wird (lib/wert.js: Pfad in beiden Listen, Inhalt anders als vermerkt), faellt ueber den Hash auf (Exit 24, "anderer Hash als vermerkt")',
            Lc.ergebnis.exit === 24 && Lc.log.includes('anderer Hash als vermerkt: [lib/wert.js]') && Lc.log.includes('nur in git status: []'));
        const baumD = frischerBaum(ctx);
        const Ld = await laufMitDrehbuch(ctx, [antwort([fc('e1', 'ersetze', { pfad: 'lib/wert.js', alt: '42', neu: '43' })], 1000, 100), antwort([fc('e2', 'ersetze', { pfad: 'lib/wert.js', alt: '43', neu: '42' })], 1000, 100), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 1000, 100)], { baum: baumD });
        pruefen('NETTO UNVERAENDERT: wird eine Datei geaendert und wieder auf den Ausgang zurueckgesetzt (42 -> 43 -> 42), zeigt git status sie nicht — das ist KEINE Abweichung (Exit 0); der Bericht nennt sie als "BERUEHRT, NETTO UNVERAENDERT", das Protokoll hat beide Schreibzugriffe',
            Ld.ergebnis.exit === 0 && Ld.log.includes('BERUEHRT, NETTO UNVERAENDERT: lib/wert.js') && Ld.log.includes('SCHREIBLISTE des Werkzeugs (netto geaendert): (keine)') && statusVon(ctx, baumD) === '' && Ld.protokollZeilen().filter((p) => p.typ === 'schreibzugriff').length === 2);
        const baumE = frischerBaum(ctx);
        const falscherBericht = { ...berichtOk(), geaenderte_dateien: ['README.md'], neue_dateien: [] };
        const Le = await laufMitDrehbuch(ctx, [antwort([fc('e', 'ersetze', { pfad: 'lib/wert.js', alt: '42', neu: '43' })], 1000, 100), antwort([fc('f', 'fertig', { bericht: falscherBericht })], 1000, 100)], { baum: baumE });
        pruefen('BERICHT GEGEN SCHREIBLISTE: nennt das Modell in fertig() eine Datei, die es nicht geaendert hat (README.md), und verschweigt eine, die es geaendert hat (lib/wert.js), steht ein HINWEIS im Bericht — Exit bleibt 0 (die Messung ist der Endvergleich, nicht die Aussage)',
            Le.ergebnis.exit === 0 && Le.log.includes('HINWEIS: das Modell nennt [README.md], die Schreibliste nicht; die Schreibliste nennt [lib/wert.js], das Modell nicht.'));
    }

    // ----- fertig(): ungueltiger Bericht wird abgelehnt, der Lauf geht weiter -----
    {
        const bo = berichtOk();
        const ungueltig = [[null, 'Objekt'], [[], 'Objekt'], [{ ...bo, zusammenfassung: '' }, 'zusammenfassung'], [{ ...bo, geaenderte_dateien: 'lib/wert.js' }, 'geaenderte_dateien'], [{ ...bo, neue_testdateien: undefined }, 'neue_testdateien'],
            [{ ...bo, punkte: [] }, 'punkte'], [{ ...bo, punkte: [{ punkt: 'x', status: 'vielleicht' }] }, 'status'], [{ ...bo, punkte: [{ punkt: 'x', status: 'nicht umgesetzt' }] }, 'Grund'], [{ ...bo, tests: [{ testdatei: 't.js' }] }, 'tests'],
            [{ ...bo, gegenproben: [{ beschreibung: 'b', rot: 'r' }] }, 'gegenproben'], [{ ...bo, offen: 'x' }, 'offen'], [{ ...bo, zusammenfassung: 'x'.repeat(33000) }, '32768']];
        const falsch = [];
        for (const [b, grund] of ungueltig) { const r = bau.berichtPruefen({ bericht: b }); if (r.ok || !r.grund.includes(grund)) falsch.push(grund); }
        pruefen(`BERICHT PRUEFEN: ${ungueltig.length} unbrauchbare Berichte (kein Objekt, fehlende Zusammenfassung, Pflichtlisten fehlen oder falsch, keine Punkte, falscher Status, "nicht umgesetzt" ohne Grund, kaputte Tests/Gegenproben, ueber 32 KB) werden abgelehnt; der volle Bericht und ein Bericht ohne "offen" gelten`,
            falsch.length === 0 && ungueltig.length === 12 && bau.berichtPruefen({ bericht: bo }).ok === true && bau.berichtPruefen({ bericht: { ...bo, offen: ['x'] } }).ok === true);
        const L = await laufMitDrehbuch(ctx, [antwort([fc('f1', 'fertig', { bericht: { ...bo, punkte: [] } })], 1000, 100), antwort([fc('f2', 'fertig', { bericht: bo })], 1000, 100)]);
        const f1 = (L.verlaeufe[1].find((e) => e.call_id === 'f1' && e.type === 'function_call_output') || {}).output || '';
        pruefen('FERTIG ABGELEHNT, LAUF GEHT WEITER: ein unvollstaendiger Bericht kommt als Ablehnung zurueck (Grund genannt), das Modell darf es erneut versuchen; der gueltige Bericht in Runde 2 beendet mit Exit 0',
            f1.startsWith('abgelehnt: Bericht unvollstaendig oder fehlerhaft: "punkte" muss mindestens einen Punkt') && L.ergebnis.exit === 0 && L.anfragenAnzahl === 2);
        const fertigUndMehr = await laufMitDrehbuch(ctx, [antwort([fc('f', 'fertig', { bericht: bo }), fc('x', 'lies', { pfad: 'lib/wert.js', von: 1, bis: 1 })], 1000, 100)]);
        pruefen('FERTIG BEENDET SOFORT: folgen in derselben Antwort weitere Aufrufe, werden sie nicht mehr ausgefuehrt; genau ein Modellaufruf',
            fertigUndMehr.ergebnis.exit === 0 && fertigUndMehr.anfragenAnzahl === 1 && fertigUndMehr.ergebnis.zustand.lesungen === 0);
        const unerwartet = await laufMitDrehbuch(ctx, [antwort([fc('f', 'fertig', { bericht: bo })], 1000, 100)], { /* aus.log wirft unten */ }).catch((e) => e);
        pruefen('ZEILE AUCH BEI UNERWARTETEM FEHLER NACH MODELLKONTAKT: wirft die Ausgabe mitten im Abschluss, schreibt das Sicherheitsnetz trotzdem eine Zeile "**abgebrochen** (unerwarteter Fehler nach Modellkontakt)" — und die Ausnahme geht weiter (kein stilles Schlucken)',
            (await (async () => {
                const baum = frischerBaum(ctx);
                const protokollPfad = path.join(ctx.basis, 'prot-unerwartet.jsonl');
                const vor = fs.readFileSync(ctx.bauZeilen, 'utf8');
                let wurf = null;
                try {
                    await bau.bauspurLaufen({ auftragText: 'A', baum, zweig: 'x', modell: 'qwen3.8-max', maxRunden: 60, maxKosten: 3, erlaubt: [], zweck: 'Wurf', protokollPfad, laufprotokollPfad: ctx.bauZeilen, kanarie: null },
                        { anfragen: async () => antwort([fc('f', 'fertig', { bericht: bo })], 1000, 100), sandbox: sandboxAttrappe(), geheimnisse: [], aus: { log: (t) => { if (String(t).startsWith('Status:')) throw new Error('Ausgabe gerissen'); }, err: () => {} } });
                } catch (e) { wurf = e; }
                const nach = fs.readFileSync(ctx.bauZeilen, 'utf8');
                return !!wurf && wurf.message === 'Ausgabe gerissen' && nach.length > vor.length && nach.split('\n').some((l) => l.includes('**abgebrochen** (unerwarteter Fehler nach Modellkontakt)') && l.includes('mind. 0,00'));
            })()) && unerwartet !== undefined);
    }

    // ----- Freigabe und Modellwahl im Protokoll -----
    {
        const L = await laufMitDrehbuch(ctx, [antwort([fc('o1', 'neue_datei', { pfad: 'ops/neu.sh', inhalt: 'echo\n' }), fc('o2', 'neue_datei', { pfad: 'migrations/0002.sql', inhalt: 'SELECT 2;\n' })], 1000000, 0), antwort([fc('f', 'fertig', { bericht: berichtOk() })], 0, 0)],
            { erlaubt: ['ops/'], modell: 'qwen3.7-plus' });
        const pz = L.protokollZeilen();
        const o2 = (L.verlaeufe[1].find((e) => e.type === 'function_call_output' && e.call_id === 'o2') || {}).output || '';
        pruefen('FREIGABE STEHT IM PROTOKOLL: mit --erlaubt=ops/ traegt der Start-Eintrag Freigabe "--erlaubt=ops/" und den Vorspann-Satz "FREIGEGEBEN fuer diesen Lauf: ops/", der Schreibzugriff auf ops/neu.sh die Freigabe "ops/"; migrations/ bleibt zu',
            pz[0].freigabe === '--erlaubt=ops/' && JSON.stringify(pz[0].erlaubt) === '["ops/"]' && L.aufrufe[0].instructions.includes('FREIGEGEBEN fuer diesen Lauf: ops/') && pz.find((p) => p.typ === 'schreibzugriff').freigabe === 'ops/' && o2.includes('migrations/ ist ohne ausdrueckliches --erlaubt gesperrt'));
        pruefen('MODELLWAHL: der Lauf rechnet mit dem Preis SEINES Modells (qwen3.7-plus: 1.000.000 Token rein = 1,20 $, nicht 2 $ wie qwen3.8-max); Modell und Kosten stehen in der Zeile von BAU-LAEUFE.md',
            L.ergebnis.zustand.kosten === 1.2 && L.bauZeile().includes('| qwen3.7-plus | 2 | 1000000 / 0 | 1,20 $ |'));
    }

    // ----- Anfrage an den Endpunkt: nur gemessene Felder, store:false, Strom -----
    {
        const werkzeuge = bau.werkzeugDefinitionen();
        const koerper = JSON.parse(bau.anfrageKoerperBauen('qwen3.8-max', 'Vorspann', [{ role: 'user', content: 'x' }], werkzeuge));
        pruefen('B5 ANFRAGEKOERPER: genau die gemessenen Felder (model, instructions, input, tools, max_output_tokens 32000, store false, stream true) — keine ungemessenen (truncation, reasoning, metadata, enable_thinking, temperature, max_tool_calls)',
            JSON.stringify(Object.keys(koerper).sort()) === JSON.stringify(['input', 'instructions', 'max_output_tokens', 'model', 'store', 'stream', 'tools']) && koerper.store === false && koerper.stream === true && koerper.max_output_tokens === 32000 && koerper.model === 'qwen3.8-max' && koerper.tools.length === 8);
        const aufgezeichnet = [];
        const sse = `id:1\nevent:response.created\n:HTTP_STATUS/200\ndata:${JSON.stringify({ type: 'response.created', response: { status: 'in_progress' } })}\n\nid:2\nevent:response.completed\ndata:${JSON.stringify({ type: 'response.completed', response: { status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'hallo' }] }], usage: { input_tokens: 5, output_tokens: 6 } } })}\n\n`;
        const echt = https.request;
        https.request = httpsAttrappe(sse, aufgezeichnet);
        let ergebnis = null;
        let fehler = null;
        try { ergebnis = await bau.anfragenEchtBauen('KEY-FIXTUR-0123456789', 'qwen3.8-max')({ instructions: 'I', verlauf: [{ role: 'user', content: 'x' }], werkzeuge }); } catch (e) { fehler = e; } finally { https.request = echt; }
        const gesendet = aufgezeichnet[0] ? JSON.parse(aufgezeichnet[0].koerper) : {};
        pruefen('ANFRAGE UEBER DEN GEMEINSAMEN STROMPFAD: URL dashscope-intl .../compatible-mode/v1/responses, Authorization Bearer, Koerper mit store:false und stream:true; die SSE-Zeilen "id:", "event:", ":HTTP_STATUS/200" werden ignoriert, das vollstaendige response-Objekt aus "response.completed" (samt usage 5/6) kommt zurueck',
            !fehler && aufgezeichnet.length === 1 && aufgezeichnet[0].url === 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/responses' && aufgezeichnet[0].optionen.headers.Authorization === 'Bearer KEY-FIXTUR-0123456789' && aufgezeichnet[0].optionen.method === 'POST'
            && gesendet.store === false && gesendet.stream === true && gesendet.instructions === 'I' && ergebnis && ergebnis.status === 'completed' && ergebnis.usage.input_tokens === 5 && ergebnis.usage.output_tokens === 6 && ergebnis.output[0].content[0].text === 'hallo');
    }
    {
        const opt = { maxRunden: 10 };
        const h = (runde, z = {}) => bau.rundenHinweisBauen({ runde, tokenRein: 123, tokenRaus: 45, kosten: 0.5, ...z }, { maxRunden: 10, maxKosten: 3 });
        pruefen('RUNDENSTAND: jede Runde mit Runde/Maximum, verbleibenden Runden, Token und Kosten; ab 70 % (Runde 7 von 10) der Hinweis zum Abschluss; in den letzten zwei Runden (9, 10) die harte Aufforderung fertig() zu rufen; Runde 6 ohne beides',
            h(1).startsWith('[Rundenstand: Runde 1 von 10, danach noch 9. Verbrauch bisher: 123 Token rein, 45 Token raus, geschaetzt 0.50 $ von hoechstens 3 $.]') && !h(6).includes('70 %') && !h(6).includes('LETZTE') && h(7).includes('70 %') && !h(7).includes('LETZTE') && h(9).includes('LETZTE RUNDE(N)') && h(10).includes('LETZTE RUNDE(N)') && opt.maxRunden === 10);
    }
}

// ===================== Die Faelle mit root =====================
async function faelleMitRoot(pruefen, ctx) {
    // ----- A4 Eigentuemer: Fixtur eines ANDEREN Eigentuemers (uid 4711, gid 4712) -----
    {
        const baum = frischerBaum(ctx);
        fs.chownSync(baum, 4711, 4712);
        const protokoll = [];
        const w = bau.schreibWerkzeugeBauen({ wurzelReal: baum, versioniert: bau.gitLs(baum), erlaubt: [], eigentuemer: eigentuemerVon(baum), protokoll: (e) => protokoll.push(e), lese: { laufNeueDateienAufnehmen() {} }, geheimnisse: [], haken: {} });
        const vorher = fs.statSync(path.join(baum, 'lib/wert.js'));
        const r1 = w.neueDatei({ pfad: 'ordner/tief/neu.js', inhalt: 'module.exports = 1;\n' });
        const r2 = w.ersetze({ pfad: 'lib/wert.js', alt: '42', neu: '43' });
        const o = (rel) => { const s = fs.statSync(path.join(baum, rel)); return `${s.uid}:${s.gid}`; };
        pruefen('A4 EIGENTUEMER UND GRUPPE DER BAUMWURZEL: der Baum gehoert 4711:4712, das Werkzeug laeuft als root — eine NEUE Datei und ihre NEU angelegten Verzeichnisse bekommen 4711:4712, und eine bestehende, vorher root-eigene Datei (lib/wert.js war 0:0), die ersetze beschreibt, ebenso',
            eigentuemerVon(baum).uid === 4711 && eigentuemerVon(baum).gid === 4712 && vorher.uid === 0 && vorher.gid === 0 && r1.abgelehnt === false && r2.abgelehnt === false
            && o('ordner') === '4711:4712' && o('ordner/tief') === '4711:4712' && o('ordner/tief/neu.js') === '4711:4712' && o('lib/wert.js') === '4711:4712' && inhaltVon(baum, 'lib/wert.js') === 'module.exports = 43;\n');
        const key = path.join(ctx.basis, 'root-key');
        fs.writeFileSync(key, `${SCHLUESSEL}\n`, { mode: 0o600 });
        fs.chmodSync(key, 0o600);
        const root = bau.schluesselDateiPruefen(key);
        fs.chownSync(key, 4711, 4712);
        const fremd = bau.schluesselDateiPruefen(key);
        fs.chownSync(key, 0, 0);
        fs.chmodSync(key, 0o644);
        const offen = bau.schluesselDateiPruefen(key);
        pruefen('A4 SCHLUESSELDATEI MIT DEM STANDARD-EIGENTUEMER root: eine root-eigene Datei mit Rechten 600 wird angenommen; dieselbe Datei im Eigentum von uid 4711 oder mit Rechten 644 bricht mit Exit 15 ab',
            root.ok === true && root.schluessel === SCHLUESSEL && fremd.ok === false && fremd.exit === 15 && /gehoert uid 4711/.test(fremd.grund) && offen.ok === false && offen.exit === 15 && /Rechte 644/.test(offen.grund));
    }

    // ----- Der CLI-Weg bis zum ersten Modellaufruf (alle Abbrueche VOR Sandbox und Modell) -----
    {
        const key = path.join(ctx.basis, 'cli-key');
        fs.writeFileSync(key, `${SCHLUESSEL}\n`, { mode: 0o600 });
        fs.chmodSync(key, 0o600);
        const auftrag = path.join(ctx.basis, 'cli-auftrag.md');
        fs.writeFileSync(auftrag, 'Mini-Auftrag des Selbsttests.\n');
        const leer = path.join(ctx.basis, 'cli-leer.md');
        fs.writeFileSync(leer, '  \n');
        const mitToken = path.join(ctx.basis, 'cli-token.md');
        fs.writeFileSync(mitToken, `Auftrag mit ${TOKEN}\n`);
        const mitSchluessel = path.join(ctx.basis, 'cli-schluessel.md');
        fs.writeFileSync(mitSchluessel, `Auftrag mit ${SCHLUESSEL}\n`);
        const baum = frischerBaum(ctx, 'cli-ok');
        const master = path.join(ctx.arbeitswurzel, 'cli-master');
        ctx.g(ctx.hauptklon, 'worktree', 'add', '-q', '-b', 'master', master);
        const hauptFremd = hauptklonAnlegen(ctx, 'hauptfremd-cli', 'https://github.com/belehrung/gymdocu');
        const fremd = path.join(ctx.arbeitswurzel, 'cli-fremd');
        ctx.g(hauptFremd, 'worktree', 'add', '-q', '-b', 'fremd-cli', fremd);
        const schmutzig = frischerBaum(ctx, 'cli-schmutzig');
        fs.writeFileSync(path.join(schmutzig, 'schmutz.js'), 'x\n');
        const prot = path.join(ctx.basis, 'cli-protokoll.jsonl');
        const alteEnv = { QWEN_KEY_DATEI: process.env.QWEN_KEY_DATEI, BAU_ARBEITSBAUM_WURZEL: process.env.BAU_ARBEITSBAUM_WURZEL, BAU_ZIELREPO_GIT: process.env.BAU_ZIELREPO_GIT, BAU_LAUFPROTOKOLL: process.env.BAU_LAUFPROTOKOLL };
        const stumm = async (argv, env = {}) => {
            Object.assign(process.env, { QWEN_KEY_DATEI: key, ...ctx.umgebung, BAU_LAUFPROTOKOLL: ctx.bauZeilen, ...env });
            const eLog = console.log; const eErr = console.error; const meldungen = [];
            console.log = (m) => meldungen.push(String(m)); console.error = (m) => meldungen.push(String(m));
            // Ein Absturz von main() (z. B. weil ein Riegel fehlt und der Lauf mit leeren Werten weiterfaehrt) soll als EIGENER Exit-Wert
            // im Fall landen und diesen Fall benennbar rot machen, statt den ganzen Selbsttest ohne Fallnamen abzubrechen.
            try { return { code: await bau.main(argv), meldungen: meldungen.join('\n') }; }
            catch (e) { return { code: `Ausnahme: ${e.message}`, meldungen: meldungen.join('\n') }; }
            finally { console.log = eLog; console.error = eErr; }
        };
        const gut = (extra = []) => [`--auftrag=${auftrag}`, `--baum=${baum}`, '--modell=qwen3.8-max', `--protokoll=${prot}`, '--zweck=CLI-Selbsttest', ...extra];
        const ohne = (name) => gut().filter((a) => !a.startsWith(`--${name}=`));
        const zeilenVorher = fs.readFileSync(ctx.bauZeilen, 'utf8');
        const einrichtenEcht = sandboxModul.einrichten;
        let einrichtenAufrufe = 0;
        sandboxModul.einrichten = async () => { einrichtenAufrufe++; throw new Error('Attrappe: Sandbox nicht einrichtbar'); };
        const codes = {};
        try {
            codes.keineArgs = (await stumm([])).code;
            codes.ohneModell = (await stumm(ohne('modell'))).code;
            codes.ohneAuftrag = (await stumm(ohne('auftrag'))).code;
            codes.ohneProtokoll = (await stumm(ohne('protokoll'))).code;
            codes.ohneZweck = (await stumm(ohne('zweck'))).code;
            codes.ohneBaum = (await stumm(ohne('baum'))).code;
            codes.modellFremd = (await stumm([...ohne('modell'), '--modell=qwen9-quatschmodell'])).code;
            codes.runden0 = (await stumm(gut(['--max-runden=0']))).code;
            codes.kostenAbc = (await stumm(gut(['--max-kosten-usd=abc']))).code;
            codes.erlaubtPunkte = (await stumm(gut(['--erlaubt=../x']))).code;
            codes.unbekannt = (await stumm(gut(['--quatsch=1']))).code;
            codes.auftragFehlt = (await stumm([...ohne('auftrag'), `--auftrag=${path.join(ctx.basis, 'gibt-es-nicht.md')}`])).code;
            codes.auftragLeer = (await stumm([...ohne('auftrag'), `--auftrag=${leer}`])).code;
            codes.auftragToken = (await stumm([...ohne('auftrag'), `--auftrag=${mitToken}`])).code;
            codes.auftragSchluessel = (await stumm([...ohne('auftrag'), `--auftrag=${mitSchluessel}`])).code;
            fs.chmodSync(key, 0o644);
            codes.schluesselOffen = (await stumm(gut())).code;
            fs.chmodSync(key, 0o600);
            codes.schluesselFehlt = (await stumm(gut(), { QWEN_KEY_DATEI: path.join(ctx.basis, 'gibt-es-nicht') })).code;
            codes.baumMaster = (await stumm([...ohne('baum'), `--baum=${master}`])).code;
            codes.baumAussen = (await stumm([...ohne('baum'), `--baum=${ctx.hauptklon}`])).code;
            codes.baumFremd = (await stumm([...ohne('baum'), `--baum=${fremd}`])).code;
            codes.baumSchmutzig = (await stumm([...ohne('baum'), `--baum=${schmutzig}`])).code;
            codes.protokollImBaum = (await stumm([...ohne('protokoll'), `--protokoll=${path.join(baum, 'p.jsonl')}`])).code;
            codes.laeufeImBaum = (await stumm(gut(), { BAU_LAUFPROTOKOLL: path.join(baum, 'BAU-LAEUFE.md') })).code;
            const vorSandbox = einrichtenAufrufe;
            const protokollNochNichtDa = !fs.existsSync(prot);
            const positiv = await stumm(gut());
            codes.positiv = positiv.code;
            pruefen(`CLI VOR DEM ERSTEN MODELLAUFRUF: jede Verletzung hat ihren eigenen Exit-Code und die Sandbox wird NIE angefasst — Aufruf unvollstaendig (keine Argumente, ohne --modell/--auftrag/--protokoll/--zweck/--baum, unbekannter Schalter) 2; Modell ausserhalb der Liste 2; --max-runden=0 2; --max-kosten-usd=abc 2; --erlaubt=../x 2; Auftrag fehlt/leer 2; Geheimnis im Auftrag (Token, exakter Schluessel) 16; Schluesseldatei 644 oder fehlend 15; Zweig master 10; Baum ausserhalb der Arbeitswurzel 10; Baum aus anderem Repo 11; unsauberer Baum 12; --protokoll im Baum 13; BAU-LAEUFE.md im Baum 13`,
                JSON.stringify(codes, Object.keys(codes).filter((k) => k !== 'positiv')) === JSON.stringify({ keineArgs: 2, ohneModell: 2, ohneAuftrag: 2, ohneProtokoll: 2, ohneZweck: 2, ohneBaum: 2, modellFremd: 2, runden0: 2, kostenAbc: 2, erlaubtPunkte: 2, unbekannt: 2, auftragFehlt: 2, auftragLeer: 2,
                    auftragToken: 16, auftragSchluessel: 16, schluesselOffen: 15, schluesselFehlt: 15, baumMaster: 10, baumAussen: 10, baumFremd: 11, baumSchmutzig: 12, protokollImBaum: 13, laeufeImBaum: 13 })
                && vorSandbox === 0 && fs.readFileSync(ctx.bauZeilen, 'utf8') === zeilenVorher && protokollNochNichtDa);
            pruefen('CLI POSITIVKONTROLLE: mit allen Angaben in Ordnung laeuft der Aufruf durch ALLE Vorbedingungen bis zur Sandbox (Attrappe: nicht einrichtbar -> Exit 17, Sandbox genau einmal angefasst), ohne Modellkontakt und ohne Zeile in BAU-LAEUFE.md',
                codes.positiv === 17 && einrichtenAufrufe === 1 && /Sandbox nicht einrichtbar/.test(positiv.meldungen) && fs.readFileSync(ctx.bauZeilen, 'utf8') === zeilenVorher);
        } finally {
            sandboxModul.einrichten = einrichtenEcht;
            for (const [k, v] of Object.entries(alteEnv)) { if (v !== undefined) process.env[k] = v; else delete process.env[k]; }
        }
    }

    // ----- GANZER LAUF: CLI, echte Sandbox, echter Strompfad (https gestubbt), Attrappen-Modell -----
    {
        const basisE = fs.mkdtempSync(path.join(os.tmpdir(), 'ausfuehr-spur-selbsttest-'));
        fs.chmodSync(basisE, 0o755);
        const alteEnv = { QWEN_KEY_DATEI: process.env.QWEN_KEY_DATEI, BAU_ARBEITSBAUM_WURZEL: process.env.BAU_ARBEITSBAUM_WURZEL, BAU_ZIELREPO_GIT: process.env.BAU_ZIELREPO_GIT, BAU_LAUFPROTOKOLL: process.env.BAU_LAUFPROTOKOLL, PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH };
        const echtesHttps = https.request;
        const eLog = console.log; const eErr = console.error;
        try {
            const fx = sandboxModul.fixtureAnlegen(basisE);
            ctx.g(fx.wurzel, 'remote', 'add', 'origin', 'https://github.com/belehrung/gymdocu');
            const arbeitE = path.join(basisE, 'arbeitswurzel');
            fs.mkdirSync(arbeitE);
            const baum = path.join(arbeitE, 'baum');
            ctx.g(fx.wurzel, 'worktree', 'add', '-q', '-b', 'bauspur-e2e', baum);
            fs.mkdirSync(path.join(baum, 'node_modules'));
            fs.writeFileSync(path.join(baum, 'node_modules', 'README'), 'leer\n');
            const key = path.join(basisE, 'e2e-key');
            fs.writeFileSync(key, `${SCHLUESSEL}\n`, { mode: 0o600 });
            fs.chmodSync(key, 0o600);
            const auftrag = path.join(basisE, 'auftrag.md');
            fs.writeFileSync(auftrag, 'Lege lib/neu_e2e.js und test_e2e.js an, registriere den Test und belege ihn mit einer Gegenprobe.\n');
            const protokollPfad = path.join(basisE, 'e2e-protokoll.jsonl');
            const bauZeilenE = path.join(basisE, 'BAU-LAEUFE.md');
            fs.writeFileSync(bauZeilenE, '# Wegwerf\n\n<!-- NEUE-LAUFZEILE-HIER: Wegwerfmarke -->\n');
            Object.assign(process.env, { QWEN_KEY_DATEI: key, BAU_ARBEITSBAUM_WURZEL: arbeitE, BAU_ZIELREPO_GIT: path.join(fx.wurzel, '.git'), BAU_LAUFPROTOKOLL: bauZeilenE, PLAYWRIGHT_BROWSERS_PATH: fx.browser });
            const testE2e = "let pass = 0, fail = 0;\nconst ok = (n, c) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ FAIL: ' + n); } };\nok('neu_e2e liefert 7', require('./lib/neu_e2e') === 7);\nconsole.log(`──────────── ${pass} PASS / ${fail} FAIL ────────────`);\nprocess.exitCode = fail ? 1 : 0;\n";
            const drehbuch = [
                antwort([fc('n1', 'neue_datei', { pfad: 'lib/neu_e2e.js', inhalt: 'module.exports = 7;\n' }), fc('n2', 'neue_datei', { pfad: 'test_e2e.js', inhalt: testE2e }), fc('n3', 'registriere_test', { datei: 'test_e2e.js' })], 1000, 200),
                antwort([fc('t1', 'teste', { testdatei: 'test_e2e.js' }), fc('t2', 'mutiere_und_teste', { datei: 'lib/neu_e2e.js', alt: '7', neu: '8', testdatei: 'test_e2e.js' }), fc('t3', 'teste', { testdatei: 'test_gruen.js' })], 2000, 300),
                antwort([fc('f', 'fertig', { bericht: { ...berichtOk(), geaenderte_dateien: [], neue_dateien: ['lib/neu_e2e.js', 'test_e2e.js'], neue_testdateien: ['test_e2e.js'], registrierungen: ['test_e2e.js'], tests: [{ testdatei: 'test_e2e.js', status: 'bestanden' }] } })], 3000, 400),
            ];
            const aufgezeichnet = [];
            let naechste = 0;
            https.request = (url, optionen, cb) => {
                const req = new EventEmitter();
                req.destroy = () => {};
                req.end = (koerper) => {
                    aufgezeichnet.push({ url: String(url), optionen, koerper: String(koerper) });
                    const res = new EventEmitter();
                    res.statusCode = 200;
                    const antwortObjekt = drehbuch[naechste++];
                    const sse = `event:response.completed\ndata:${JSON.stringify({ type: 'response.completed', response: { status: 'completed', output: antwortObjekt.output, usage: antwortObjekt.usage } })}\n\n`;
                    setImmediate(() => { cb(res); res.emit('data', Buffer.from(sse)); res.emit('end'); });
                };
                return req;
            };
            const meldungen = [];
            console.log = (m) => meldungen.push(String(m)); console.error = (m) => meldungen.push(String(m));
            let code;
            try { code = await bau.main([`--auftrag=${auftrag}`, `--baum=${baum}`, '--modell=qwen3.8-max', `--protokoll=${protokollPfad}`, '--zweck=GANZER LAUF Selbsttest', '--max-runden=10']); } finally { console.log = eLog; console.error = eErr; https.request = echtesHttps; }
            const text = meldungen.join('\n');
            const protokoll = fs.readFileSync(protokollPfad, 'utf8').split('\n').filter(Boolean).map((z) => JSON.parse(z));
            const antworten = (id) => (protokoll.find((p) => p.typ === 'funktionsantwort' && p.call_id === id) || {}).text || '';
            const gesendet = aufgezeichnet.map((a) => JSON.parse(a.koerper));
            pruefen(`GANZER LAUF (CLI, echter Strompfad, echte Sandbox): drei Runden, Exit ${code} (0), Status fertig; die Sandbox lief im Baustand-Modus auf dem AKTUELLEN Stand — die neue, nur im Arbeitsbaum vorhandene Testdatei bestand ("status: bestanden"), die Gegenprobe 7 -> 8 scheiterte ("status: gescheitert" mit der gefallenen Zusicherung), ein bestehender Test bestand`,
                code === 0 && antworten('n1').startsWith('angelegt: lib/neu_e2e.js') && antworten('n3').startsWith('registriert: test_e2e.js') && antworten('t1').startsWith('status: bestanden') && antworten('t1').includes('1 PASS / 0 FAIL')
                && antworten('t2').startsWith('status: gescheitert') && antworten('t2').includes('✗ FAIL: neu_e2e liefert 7') && antworten('t2').includes('grundlauf: bestanden, gueltig (aus dem Zwischenspeicher dieses Laufs)') && antworten('t3').startsWith('status: bestanden') && protokoll[protokoll.length - 1].status === 'fertig');
            pruefen('GANZER LAUF: der Baum enthaelt danach GENAU die drei Aenderungen (lib/neu_e2e.js neu, test_e2e.js neu, test/run.sh um eine Zeile) — die Mutation 7 -> 8 landete NUR in der Wegwerfkopie (lib/neu_e2e.js ist weiter 7); der Endvergleich stimmt, im Bericht stehen git status und Schreibliste',
                inhaltVon(baum, 'lib/neu_e2e.js') === 'module.exports = 7;\n' && ctx.g(baum, 'status', '--porcelain', '-uall').trim() === 'M test/run.sh\n?? lib/neu_e2e.js\n?? test_e2e.js' && inhaltVon(baum, 'test/run.sh').includes('  test_e2e.js\n)\n')
                && text.includes('SCHREIBLISTE des Werkzeugs (netto geaendert): lib/neu_e2e.js, test/run.sh, test_e2e.js') && !text.includes('LAUTER FEHLER') && text.includes('=========== BERICHT ==========='));
            pruefen('GANZER LAUF: die Anfragen trugen store:false, stream:true, den Schluessel nur im Authorization-Kopf und nie im Koerper; der Schluessel steht weder in der Ausgabe noch im Protokoll noch in BAU-LAEUFE.md; die Zeile nennt Runden 3 und Token 6000 / 900',
                aufgezeichnet.length === 3 && gesendet.every((k) => k.store === false && k.stream === true && k.model === 'qwen3.8-max') && aufgezeichnet.every((a) => a.optionen.headers.Authorization === `Bearer ${SCHLUESSEL}` && !a.koerper.includes(SCHLUESSEL))
                && !`${text}\n${fs.readFileSync(protokollPfad, 'utf8')}\n${fs.readFileSync(bauZeilenE, 'utf8')}`.includes(SCHLUESSEL) && fs.readFileSync(bauZeilenE, 'utf8').split('\n').some((l) => l.includes('| qwen3.8-max | 3 | 6000 / 900 |') && l.includes('fertig, Exit 0; netto geaendert 3, neu 2, registriert 1')));
            const cluster = spawnSync('pg_lsclusters', ['-h'], { encoding: 'utf8' });
            const sperre = spawnSync('flock', ['-n', '-E', '75', '/var/lock/dsv1.lock', 'true']);
            pruefen('GANZER LAUF: danach ist die Sandbox restlos weg — kein dsv1-Cluster, Sperre /var/lock/dsv1.lock frei, /var/lib/dsv1 leer oder nicht vorhanden',
                !/dsv1/.test(cluster.stdout || '') && sperre.status === 0 && (!fs.existsSync('/var/lib/dsv1') || fs.readdirSync('/var/lib/dsv1').length === 0));
        } finally {
            console.log = eLog; console.error = eErr; https.request = echtesHttps;
            for (const [k, v] of Object.entries(alteEnv)) { if (v !== undefined) process.env[k] = v; else delete process.env[k]; }
            fs.rmSync(basisE, { recursive: true, force: true });
        }
    }
}

// ===================== Einstiegspunkte =====================
function sammler() {
    const stand = { gelaufen: 0, fehler: 0 };
    const pruefen = (bezeichnung, bedingung) => {
        stand.gelaufen++;
        console.log(`${bedingung ? '  ✓' : '  ✗ FEHLT'} ${bezeichnung}`);
        if (!bedingung) stand.fehler++;
    };
    return { stand, pruefen };
}

async function selbsttest() {
    const { stand, pruefen } = sammler();
    let ctx = null;
    const alteUmgebung = { BAU_LAUFPROTOKOLL: process.env.BAU_LAUFPROTOKOLL };
    try {
        ctx = kontextBauen();
        process.env.BAU_LAUFPROTOKOLL = ctx.bauZeilen;
        await faelleOhneRoot(pruefen, ctx);
    } catch (e) {
        console.log(`  ✗ FEHLT: unerwarteter Fehler im Selbsttest der Bauspur: ${e.stack || e.message}`);
        stand.fehler++;
    } finally {
        for (const [k, v] of Object.entries(alteUmgebung)) { if (v !== undefined) process.env[k] = v; else delete process.env[k]; }
        if (ctx) fs.rmSync(ctx.basis, { recursive: true, force: true });
    }
    if (stand.gelaufen !== ERWARTETE_FAELLE_OHNE_ROOT) {
        console.log(`  ✗ FEHLT: ${stand.gelaufen} Faelle gelaufen, erwartet ${ERWARTETE_FAELLE_OHNE_ROOT} — Fall entfernt oder Abbruch mittendrin?`);
        stand.fehler++;
    }
    console.log(stand.fehler ? `\n${stand.fehler} Fehler` : '\nSelbsttest der Bauspur sauber');
    if (process.getuid() !== 0) console.log(`(ohne root: die ${ERWARTETE_FAELLE_ROOT} Faelle mit root laufen mit --selbsttest-root im Job ausfuehr-spur)`);
    return stand.fehler ? 1 : 0;
}

async function selbsttestRoot() {
    if (process.getuid() !== 0) {
        if (process.env.CI === 'true') {
            console.log(`  ✗ FEHLT: --selbsttest-root braucht root (uid 0, gefunden ${process.getuid()}) -- unter CI=true ist das ROT, kein SKIP.`);
            return 1;
        }
        console.log(`  ⤳ SKIP (${ERWARTETE_FAELLE_ROOT}): --selbsttest-root braucht root (uid 0, gefunden ${process.getuid()}) -- Faelle NICHT gelaufen.`);
        return 0;
    }
    const { stand, pruefen } = sammler();
    let ctx = null;
    const alteUmgebung = { BAU_LAUFPROTOKOLL: process.env.BAU_LAUFPROTOKOLL, QWEN_KEY_DATEI: process.env.QWEN_KEY_DATEI, BAU_ARBEITSBAUM_WURZEL: process.env.BAU_ARBEITSBAUM_WURZEL, BAU_ZIELREPO_GIT: process.env.BAU_ZIELREPO_GIT, PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH };
    try {
        ctx = kontextBauen();
        process.env.BAU_LAUFPROTOKOLL = ctx.bauZeilen;
        await faelleMitRoot(pruefen, ctx);
    } catch (e) {
        console.log(`  ✗ FEHLT: unerwarteter Fehler im Selbsttest der Bauspur (root): ${e.stack || e.message}`);
        stand.fehler++;
    } finally {
        for (const [k, v] of Object.entries(alteUmgebung)) { if (v !== undefined) process.env[k] = v; else delete process.env[k]; }
        if (ctx) fs.rmSync(ctx.basis, { recursive: true, force: true });
    }
    if (stand.gelaufen !== ERWARTETE_FAELLE_ROOT) {
        console.log(`  ✗ FEHLT: ${stand.gelaufen} Faelle gelaufen, erwartet ${ERWARTETE_FAELLE_ROOT} — Fall entfernt oder Abbruch mittendrin?`);
        stand.fehler++;
    }
    console.log(stand.fehler ? `\n${stand.fehler} Fehler` : '\nSelbsttest der Bauspur (root) sauber');
    return stand.fehler ? 1 : 0;
}

module.exports = { selbsttest, selbsttestRoot, _intern: { kontextBauen, frischerBaum, werkzeugeAuf, laufMitDrehbuch, sandboxAttrappe, fc, antwort, berichtOk } };
