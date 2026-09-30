'use strict';
// tools/ausfuehr-selbstmessung.js — Selbstmessung IM Kind der ausfuehrenden
// Pruefspur (Auftrag "DeepSeek Variante 1", Teil W). Laeuft als Benutzer
// 65534 in der neuen Wurzel, mit der Kind-Umgebung, cwd = /dsv1/kopie,
// BEVOR Vorbereitung und Test laufen (tools/ausfuehr-aufbau.sh, Stufe 3).
// Exit 0 nur, wenn JEDE Messung gruen ist — fail-closed: eine Messung, die
// nicht durchfuehrbar ist, ist ROT, nicht uebersprungen.
//
// ALLE Sollwerte hier sind von Hand geschriebene Literale. Sie werden
// ausdruecklich NICHT aus der Einhaengeliste von ausfuehr-aufbau.sh, aus
// test/umgebung.sh oder aus der Laufkonfiguration gebildet — sonst koennte
// derselbe Defekt Sollwert und Istwert zugleich verschieben (CLAUDE.md,
// "eine Zusicherung, die ihren Sollwert aus dem bezieht, was sie bewachen
// soll, ist keine"). Aus der Laufkonfiguration kommen nur ERWARTUNGEN, die
// der Elternprozess unabhaengig bestimmt hat (sha256 der Testdatei und der
// mutierten Datei, Pfad des Originalbaums, Proxy-Adresse).
//
// Gemessen wird (je Punkt ROT/GRUEN-Fall im Selbsttest von ausfuehr-spur.js):
//   1 uid/gid/Gruppen = 65534           8 TCP nach aussen und zum Proxy scheitert
//   2 /proc nur Namensraum-PIDs          9 127.0.0.1 gegen eigenen Horcher gelingt
//   3 schreibbare Verzeichnisse = Liste 10 Zeitzone des Node-Prozesses = UTC
//   4 Namen der Kind-Umgebung = Liste   11 Browser-Programm ausfuehrbar
//   5 Originalbaum/Host unerreichbar    12 node_modules ro (findmnt UND Schreibprobe)
//   6 sha256 Testdatei/mutierte Datei   13 Datenbank: Rolle ohne Superuser/
//   7 /proc/1/environ nicht lesbar         Serverrollen, COPY TO PROGRAM scheitert,
//                                          postgres-Kanal (peer) scheitert,
//                                          Haupt-Socket unerreichbar
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const KIND_UID = 65534;
const KIND_GID = 65534;
const SCHREIBBAR_SOLL = ['/dev/shm', '/dsv1/kopie', '/tmp', '/var/tmp'];
const UMGEBUNG_SOLL = ['CI', 'DATABASE_URL', 'HOME', 'PATH', 'PLAYWRIGHT_BROWSERS_PATH', 'SESSION_SECRET', 'TZ'];
const ZEITZONE_SOLL = 'UTC';
const MAX_PIDS = 12;
const HAUPT_SOCKET_ORDNER = '/var/run/postgresql';
const SERVER_ROLLEN = ['pg_execute_server_program', 'pg_read_server_files', 'pg_write_server_files'];

const konfPfad = process.argv[2];
const konf = {};
try {
    for (const zeile of fs.readFileSync(konfPfad, 'utf8').split('\n')) {
        const m = /^([A-Z_]+)='([^']*)'$/.exec(zeile);
        if (m) konf[m[1]] = m[2];
    }
} catch (e) {
    console.log(`  ✗ Laufkonfiguration ${konfPfad} nicht lesbar: ${e.message}`);
    console.log('SELBSTMESSUNG: 0 ✓ / 1 ✗');
    process.exit(1);
}

let gruen = 0;
let rot = 0;
function ok(bezeichnung, bedingung, detail) {
    if (bedingung) { gruen++; console.log(`  ✓ ${bezeichnung}`); }
    else { rot++; console.log(`  ✗ ${bezeichnung}${detail === undefined ? '' : ' — ' + String(detail).slice(0, 400)}`); }
}
function fehlerCode(fn) {
    try { fn(); return null; } catch (e) { return e.code || e.message; }
}
function sha256(pfad) {
    return crypto.createHash('sha256').update(fs.readFileSync(pfad)).digest('hex');
}
function psql(url, sql) {
    const r = spawnSync('psql', [url, '-X', '-tA', '-v', 'ON_ERROR_STOP=1', '-c', sql], { encoding: 'utf8', timeout: 20000 });
    return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim(), error: r.error ? String(r.error) : null };
}
function verbindungScheitert(host, port) {
    return new Promise((erfuellen) => {
        const s = net.connect({ host, port });
        let fertig = false;
        const ende = (ergebnis) => { if (fertig) return; fertig = true; s.destroy(); erfuellen(ergebnis); };
        s.setTimeout(4000, () => ende({ scheitert: false, grund: 'Zeitueberschreitung (kein sofortiger Fehler)' }));
        s.on('error', (e) => ende({ scheitert: true, grund: e.code || e.message }));
        s.on('connect', () => ende({ scheitert: false, grund: 'VERBUNDEN' }));
    });
}
function eigenerHorcherGelingt() {
    return new Promise((erfuellen) => {
        const server = net.createServer((c) => { c.end('dsv1'); });
        server.on('error', (e) => erfuellen({ ok: false, grund: e.message }));
        server.listen(0, '127.0.0.1', () => {
            const c = net.connect(server.address().port, '127.0.0.1');
            let daten = '';
            c.on('data', (d) => { daten += d.toString(); });
            c.on('end', () => { server.close(); erfuellen({ ok: daten === 'dsv1', grund: daten }); });
            c.on('error', (e) => { server.close(); erfuellen({ ok: false, grund: e.message }); });
        });
    });
}

async function main() {
    // 1. Identitaet
    ok(`uid/gid = ${KIND_UID}/${KIND_GID}, keine weiteren Gruppen (uid ${process.getuid()}, gid ${process.getgid()}, Gruppen ${JSON.stringify(process.getgroups())})`,
        process.getuid() === KIND_UID && process.getgid() === KIND_GID
        && process.geteuid() === KIND_UID && process.getegid() === KIND_GID
        && process.getgroups().every((g) => g === KIND_GID));

    // 1b. no_new_privs: setuid-Programme in den ro-Binds koennen nichts mehr
    // anheben (zusaetzlich zu nosuid auf jeder Einhaengung).
    let noNewPrivs = null;
    try { const m = /^NoNewPrivs:\s*(\d)/m.exec(fs.readFileSync('/proc/self/status', 'utf8')); noNewPrivs = m ? m[1] : null; } catch (e) { noNewPrivs = null; }
    ok(`NoNewPrivs = 1 in /proc/self/status (gefunden ${noNewPrivs})`, noNewPrivs === '1');

    // 2. /proc zeigt nur den eigenen Namensraum
    let pids = [];
    try { pids = fs.readdirSync('/proc').filter((n) => /^\d+$/.test(n)).map(Number); } catch (e) { pids = null; }
    let pid1Comm = null;
    try { pid1Comm = fs.readFileSync('/proc/1/comm', 'utf8').trim(); } catch (e) { pid1Comm = `(${e.code})`; }
    ok(`/proc zeigt nur Namensraum-PIDs: hoechstens ${MAX_PIDS}, PID 1 ist bash (gefunden ${pids ? pids.length : 'unlesbar'}: ${pids ? pids.join(',') : '-'}; PID 1 = ${pid1Comm})`,
        Array.isArray(pids) && pids.length >= 2 && pids.length <= MAX_PIDS && pids.includes(1) && pid1Comm === 'bash');

    // 3. Menge der schreibbaren Verzeichnisse = Literalliste
    const kandidaten = new Set(['/']);
    const mounts = spawnSync('findmnt', ['-rno', 'TARGET'], { encoding: 'utf8' });
    for (const z of (mounts.stdout || '').split('\n')) if (z.startsWith('/')) kandidaten.add(z);
    for (const basis of ['/', '/dev', '/var', '/dsv1', '/dsv1/kopie/node_modules']) {
        try {
            for (const e of fs.readdirSync(basis)) {
                const p = path.join(basis, e);
                try { if (fs.statSync(p).isDirectory()) kandidaten.add(p); } catch (e2) { /* kein Verzeichnis */ }
            }
        } catch (e) { /* Basis fehlt -- faellt unten auf */ }
    }
    kandidaten.delete('/proc');
    const schreibbar = [];
    for (const d of [...kandidaten].sort()) {
        if (d.startsWith('/proc')) continue;
        try {
            const t = fs.mkdtempSync(path.join(d, '.dsv1-schreibprobe-'));
            fs.rmdirSync(t);
            schreibbar.push(d);
        } catch (e) { /* nicht schreibbar -- erwartet */ }
    }
    ok(`fuer ${KIND_UID} schreibbare Verzeichnisse = ${JSON.stringify(SCHREIBBAR_SOLL)} (gemessen ${JSON.stringify(schreibbar)} aus ${kandidaten.size} Kandidaten; findmnt Exit ${mounts.status})`,
        mounts.status === 0 && JSON.stringify(schreibbar) === JSON.stringify(SCHREIBBAR_SOLL));

    // 4. Namen der Kind-Umgebung = Literalliste
    const namen = Object.keys(process.env).sort();
    ok(`Namen der Kind-Umgebung = ${JSON.stringify(UMGEBUNG_SOLL)} (gefunden ${JSON.stringify(namen)})`,
        JSON.stringify(namen) === JSON.stringify(UMGEBUNG_SOLL));

    // 5. Originalbaum und Host unerreichbar
    const orig = konf.ORIGINALWURZEL || '';
    ok(`Originalbaum ${orig || '(unbekannt)'} sowie /workspace, /home, /var/lib, /root existieren nicht (cwd ${process.cwd()})`,
        orig.startsWith('/') && !fs.existsSync(orig) && !fs.existsSync('/workspace') && !fs.existsSync('/home')
        && !fs.existsSync('/var/lib') && !fs.existsSync('/root') && process.cwd() === '/dsv1/kopie');

    // 6. sha256 der Testdatei und der mutierten Datei = Erwartung des Elternprozesses
    let shaTest = null;
    let shaMut = null;
    try { shaTest = sha256(konf.TESTDATEI); } catch (e) { shaTest = `(${e.code})`; }
    ok(`sha256 der Testdatei ${konf.TESTDATEI} = Erwartung des Elternprozesses (${(konf.SHA_TESTDATEI || '').slice(0, 12)}…)`,
        /^[0-9a-f]{64}$/.test(konf.SHA_TESTDATEI || '') && shaTest === konf.SHA_TESTDATEI);
    if (konf.MUTIERTE_DATEI) {
        try { shaMut = sha256(konf.MUTIERTE_DATEI); } catch (e) { shaMut = `(${e.code})`; }
        ok(`sha256 der mutierten Datei ${konf.MUTIERTE_DATEI} = Erwartung des Elternprozesses (${(konf.SHA_MUTIERT || '').slice(0, 12)}…)`,
            /^[0-9a-f]{64}$/.test(konf.SHA_MUTIERT || '') && shaMut === konf.SHA_MUTIERT);
    } else {
        ok('keine mutierte Datei in diesem Lauf (Grundlauf oder teste): kein zweiter sha256-Vergleich noetig', konf.SHA_MUTIERT === undefined || konf.SHA_MUTIERT === '');
    }

    // 7. /proc/1/environ fuer 65534 nicht lesbar; /etc/shadow ebenso; Werkzeug und Ergebnis nicht beschreibbar
    const environCode = fehlerCode(() => fs.readFileSync('/proc/1/environ'));
    ok(`/proc/1/environ fuer ${KIND_UID} nicht lesbar (${environCode})`, environCode === 'EACCES');
    const shadowCode = fehlerCode(() => fs.readFileSync('/etc/shadow'));
    ok(`/etc/shadow nicht lesbar (${shadowCode})`, shadowCode === 'EACCES');
    const werkzeugCode = fehlerCode(() => fs.writeFileSync('/dsv1/werkzeug/.dsv1-probe', ''));
    const ergebnisCode = fehlerCode(() => fs.writeFileSync('/dsv1/ergebnis/test-gestartet', ''));
    ok(`/dsv1/werkzeug nur lesbar (${werkzeugCode}) und /dsv1/ergebnis nicht beschreibbar — die Waechterdatei kann 65534 nicht anlegen (${ergebnisCode})`,
        werkzeugCode === 'EROFS' && ergebnisCode === 'EACCES');

    // 8. TCP nach aussen und zum Proxy scheitert
    const aussen = await verbindungScheitert('1.1.1.1', 443);
    ok(`TCP nach aussen (1.1.1.1:443) scheitert sofort (${aussen.grund})`, aussen.scheitert);
    if (konf.PROXY_HOST && konf.PROXY_PORT) {
        const proxy = await verbindungScheitert(konf.PROXY_HOST, Number(konf.PROXY_PORT));
        ok(`TCP zum Egress-Proxy ${konf.PROXY_HOST}:${konf.PROXY_PORT} scheitert (${proxy.grund})`, proxy.scheitert);
    } else {
        ok('kein Egress-Proxy im Elternprozess konfiguriert: keine Proxy-Probe noetig (Aussenprobe oben traegt)', true);
    }

    // 9. 127.0.0.1 gegen eigenen Horcher gelingt
    const lo = await eigenerHorcherGelingt();
    ok(`127.0.0.1 gegen eigenen Horcher gelingt (${lo.grund})`, lo.ok);

    // 10. Zeitzone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    ok(`Zeitzone des Node-Prozesses = ${ZEITZONE_SOLL} (Intl ${tz}, Offset ${new Date().getTimezoneOffset()} min)`,
        tz === ZEITZONE_SOLL && new Date().getTimezoneOffset() === 0);

    // 11. Browser-Programm ausfuehrbar
    let browserProgramm = null;
    try {
        const basis = process.env.PLAYWRIGHT_BROWSERS_PATH;
        for (const e of fs.readdirSync(basis).sort()) {
            if (!e.startsWith('chromium')) continue;
            for (const rel of ['chrome-linux/chrome', 'chrome-linux/headless_shell', 'chrome-linux64/chrome']) {
                const p = path.join(basis, e, rel);
                try { fs.accessSync(p, fs.constants.X_OK); if (fs.statSync(p).isFile()) { browserProgramm = p; break; } } catch (e2) { /* naechster */ }
            }
            if (browserProgramm) break;
        }
    } catch (e) { browserProgramm = null; }
    ok(`Browser-Programm unter PLAYWRIGHT_BROWSERS_PATH ausfuehrbar (${browserProgramm || 'keines gefunden'})`, browserProgramm !== null);

    // 12. node_modules ro: findmnt UND Schreibprobe
    const nm = spawnSync('findmnt', ['-rno', 'OPTIONS', '/dsv1/kopie/node_modules'], { encoding: 'utf8' });
    const nmOptionen = (nm.stdout || '').trim();
    const nmSchreibCode = fehlerCode(() => fs.writeFileSync('/dsv1/kopie/node_modules/.dsv1-probe', ''));
    ok(`node_modules der Kopie laut findmnt ro (${nmOptionen.split(',')[0] || '(kein Eintrag)'}) und Schreibprobe scheitert (${nmSchreibCode})`,
        nm.status === 0 && nmOptionen.split(',')[0] === 'ro' && nmSchreibCode === 'EROFS');

    // 13. Datenbank
    const url = process.env.DATABASE_URL || '';
    const rolle = psql(url, "SELECT current_user || '|' || rolsuper::text || '|' || rolcreaterole::text FROM pg_roles WHERE rolname = current_user");
    // boolean::text liefert "false"/"true" (gemessen), nicht das "f"/"t" der psql-Anzeige.
    ok(`DB-Rolle ist nobody ohne SUPERUSER und ohne CREATEROLE (${rolle.stdout || rolle.stderr || rolle.error})`,
        rolle.status === 0 && rolle.stdout === 'nobody|false|false');
    const server = psql(url, `SELECT count(*) FROM pg_roles r WHERE r.rolname IN (${SERVER_ROLLEN.map((r) => `'${r}'`).join(',')}) AND pg_has_role(current_user, r.oid, 'member')`);
    ok(`keine der Serverrollen ${SERVER_ROLLEN.join('/')} (Mitgliedschaften: ${server.stdout || server.stderr})`,
        server.status === 0 && server.stdout === '0');
    const copy = psql(url, "COPY (SELECT 1) TO PROGRAM 'id'");
    ok(`COPY … TO PROGRAM scheitert (${copy.stderr.split('\n')[0] || 'kein Fehler!'})`,
        copy.status !== 0 && /permission denied/i.test(copy.stderr));
    // Dieselbe URL, nur die Rolle getauscht (Textersatz: die Socket-Form
    // traegt keinen Rechnernamen, den ein URL-Parser verlangt).
    let alsPostgres = { status: 0, stderr: 'keine URL ableitbar' };
    const urlPostgres = url.replace(/^(postgres(?:ql)?:\/\/)nobody@/, '$1postgres@');
    if (urlPostgres !== url) alsPostgres = psql(urlPostgres, 'SELECT 1');
    ok(`Verbindung als postgres ueber denselben Socket scheitert (peer): ${alsPostgres.stderr.split('\n').pop() || 'VERBUNDEN!'}`,
        alsPostgres.status !== 0 && /peer authentication failed/i.test(alsPostgres.stderr));
    const haupt = psql(`postgresql://nobody@/postgres?host=${HAUPT_SOCKET_ORDNER}&port=5432`, 'SELECT 1');
    ok(`Haupt-Socket ${HAUPT_SOCKET_ORDNER} unerreichbar (${haupt.stderr.split('\n').pop() || 'VERBUNDEN!'}; Ordner existiert: ${fs.existsSync(HAUPT_SOCKET_ORDNER)})`,
        haupt.status !== 0 && !fs.existsSync(HAUPT_SOCKET_ORDNER));

    console.log(`SELBSTMESSUNG: ${gruen} ✓ / ${rot} ✗`);
    process.exitCode = rot ? 1 : 0;
}

main().catch((e) => {
    console.log(`  ✗ Selbstmessung abgebrochen: ${e.message}`);
    console.log(`SELBSTMESSUNG: ${gruen} ✓ / ${rot + 1} ✗`);
    process.exitCode = 1;
});
