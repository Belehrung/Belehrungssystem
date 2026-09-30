'use strict';
// tools/ausfuehr-selbstmessung.js — Selbstmessung IM Kind der ausfuehrenden
// Pruefspur (Auftrag "DeepSeek Variante 1", Teil W; Nacharbeit 30.09.2026).
// Laeuft als Benutzer 65534 in der neuen Wurzel, mit der Kind-Umgebung,
// cwd = /dsv1/kopie, BEVOR Vorbereitung und Test laufen
// (tools/ausfuehr-aufbau.sh, Stufe 4). Exit 0 nur, wenn JEDE Messung gruen
// ist — fail-closed: eine Messung, die nicht durchfuehrbar ist, ist ROT,
// nicht uebersprungen.
//
// ALLE Sollwerte hier sind von Hand geschriebene Literale. Sie werden
// ausdruecklich NICHT aus der Einhaengeliste von ausfuehr-aufbau.sh, aus
// test/umgebung.sh oder aus der Laufkonfiguration gebildet — sonst koennte
// derselbe Defekt Sollwert und Istwert zugleich verschieben (CLAUDE.md,
// "eine Zusicherung, die ihren Sollwert aus dem bezieht, was sie bewachen
// soll, ist keine"). Aus der Laufkonfiguration kommen nur ERWARTUNGEN, die
// der Elternprozess unabhaengig bestimmt hat (sha256 zweier Dateien, Pfad
// des Originalbaums, Proxy-Adresse, Node-Baum und Browserpfad als die zwei
// hostabhaengigen Einhaengungen).
//
// Gemessen wird (29 Punkte, Sollzahl steht literal im Selbsttest von
// ausfuehr-spur.js): Identitaet und no_new_privs; /proc mit hidepid;
// schreibbare Verzeichnisse, Einhaengemenge, /opt-Teilbaeume; Umgebungs-
// namen; Originalbaum unerreichbar; sha256 der Testdatei und einer zweiten
// Datei; environ/shadow/Werkzeug/Ergebnis; TCP nach aussen, zum Proxy
// (oder zu einer unroutbaren Adresse), 127.0.0.1; Zeitzone; Browser;
// node_modules ro; rlimits (Literale und je ein Ueberschreiten, das
// scheitert, mit Positivkontrolle); Datenbank: Rolle, Serverrollen,
// COPY TO PROGRAM, lo_import, postgres-Kanal, Haupt-Socket.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const KIND_UID = 65534;
const KIND_GID = 65534;
const SCHREIBBAR_SOLL = ['/dev/shm', '/dsv1/kopie', '/tmp', '/var/tmp'];
const MOUNTS_SOLL = ['/', '/dev', '/dev/null', '/dev/random', '/dev/shm', '/dev/urandom', '/dev/zero',
    '/dsv1/ergebnis', '/dsv1/kopie', '/dsv1/kopie/node_modules', '/dsv1/pg', '/dsv1/werkzeug',
    '/etc', '/proc', '/run', '/tmp', '/usr', '/var/tmp'];
const MERGED_USR = ['/bin', '/sbin', '/lib', '/lib32', '/lib64', '/libx32'];
const OPT_VERBOTEN = ['/opt/claude-code', '/opt/env-runner'];
const UMGEBUNG_SOLL = ['CI', 'DATABASE_URL', 'HOME', 'PATH', 'PLAYWRIGHT_BROWSERS_PATH', 'SESSION_SECRET', 'TZ'];
const ZEITZONE_SOLL = 'UTC';
const MAX_PIDS = 8;
const HAUPT_SOCKET_ORDNER = '/var/run/postgresql';
const SERVER_ROLLEN = ['pg_execute_server_program', 'pg_read_server_files', 'pg_write_server_files'];
const RLIMIT_NPROC_SOLL = 512;
const RLIMIT_FSIZE_SOLL = 67108864;
const RLIMIT_CPU_SOLL = 600;
const UNROUTBAR = { host: '10.255.255.1', port: 3128 };

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
function limitLesen(name) {
    try {
        const zeile = fs.readFileSync('/proc/self/limits', 'utf8').split('\n').find((z) => z.startsWith(name));
        if (!zeile) return null;
        const teile = zeile.slice(25).trim().split(/\s+/);
        return { soft: teile[0], hart: teile[1] };
    } catch (e) { return null; }
}
// Probe unter einem SELBST gesenkten Limit (prlimit darf als 65534 nur
// senken): zeigt, dass der Mechanismus wirkt; die Literale oben zeigen, dass
// das Kind mit den vorgesehenen Werten laeuft.
function prlimitProbe(schalter, skript) {
    const r = spawnSync('prlimit', [schalter, 'node', '-e', skript], { encoding: 'utf8', timeout: 20000 });
    return { status: r.status, signal: r.signal, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim().split('\n').pop() };
}

async function main() {
    // 1. Identitaet
    ok(`uid/gid = ${KIND_UID}/${KIND_GID}, keine weiteren Gruppen (uid ${process.getuid()}, gid ${process.getgid()}, Gruppen ${JSON.stringify(process.getgroups())})`,
        process.getuid() === KIND_UID && process.getgid() === KIND_GID
        && process.geteuid() === KIND_UID && process.getegid() === KIND_GID
        && process.getgroups().every((g) => g === KIND_GID));

    // 2. no_new_privs: setuid-Programme in den ro-Binds koennen nichts mehr
    // anheben (zusaetzlich zu nosuid auf jeder Einhaengung).
    let noNewPrivs = null;
    try { const m = /^NoNewPrivs:\s*(\d)/m.exec(fs.readFileSync('/proc/self/status', 'utf8')); noNewPrivs = m ? m[1] : null; } catch (e) { noNewPrivs = null; }
    ok(`NoNewPrivs = 1 in /proc/self/status (gefunden ${noNewPrivs})`, noNewPrivs === '1');

    // 3. /proc mit hidepid=2: nur eigene Prozesse sichtbar, PID 1 (root) nicht.
    let pids = null;
    let fremde = [];
    try {
        pids = fs.readdirSync('/proc').filter((n) => /^\d+$/.test(n)).map(Number);
        for (const p of pids) {
            try {
                const m = /^Uid:\s*(\d+)/m.exec(fs.readFileSync(`/proc/${p}/status`, 'utf8'));
                if (!m || Number(m[1]) !== KIND_UID) fremde.push(p);
            } catch (e) { fremde.push(p); }
        }
    } catch (e) { pids = null; }
    const cmdline1 = fehlerCode(() => fs.readFileSync('/proc/1/cmdline'));
    ok(`/proc mit hidepid: nur eigene PIDs sichtbar (gefunden ${pids ? pids.length : 'unlesbar'}: ${pids ? pids.join(',') : '-'}, fremde ${JSON.stringify(fremde)}), hoechstens ${MAX_PIDS}, /proc/1/cmdline nicht lesbar (${cmdline1})`,
        Array.isArray(pids) && pids.length >= 1 && pids.length <= MAX_PIDS && !pids.includes(1) && fremde.length === 0
        && (cmdline1 === 'EACCES' || cmdline1 === 'ENOENT'));

    // 4. Menge der schreibbaren Verzeichnisse = Literalliste
    const kandidaten = new Set(['/']);
    const mounts = spawnSync('findmnt', ['-rno', 'TARGET'], { encoding: 'utf8' });
    const mountZiele = (mounts.stdout || '').split('\n').filter((z) => z.startsWith('/')).sort();
    for (const z of mountZiele) kandidaten.add(z);
    for (const basis of ['/', '/dev', '/var', '/dsv1', '/opt', '/dsv1/kopie/node_modules']) {
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

    // 5. Einhaengemenge = Literalliste + die zwei hostabhaengigen Baeume
    // (Node-Baum, Browserpfad, sofern nicht unter /usr) + merged-usr-
    // Verzeichnisse, die auf diesem Host echte Verzeichnisse sind.
    const erwarteteMounts = new Set(MOUNTS_SOLL);
    for (const extra of [konf.NODE_BAUM, konf.BROWSER]) if (extra && !extra.startsWith('/usr/')) erwarteteMounts.add(extra);
    for (const m of MERGED_USR) { try { if (!fs.lstatSync(m).isSymbolicLink() && mountZiele.includes(m)) erwarteteMounts.add(m); } catch (e) { /* fehlt */ } }
    const erwartetSortiert = [...erwarteteMounts].sort();
    ok(`Einhaengemenge = Literalliste (+ Node-Baum, Browserpfad): ${JSON.stringify(mountZiele)}`,
        mounts.status === 0 && JSON.stringify(mountZiele) === JSON.stringify(erwartetSortiert));

    // 6. /opt nur mit den benoetigten Teilbaeumen; verbotene Pfade fehlen
    let optEintraege = [];
    try { optEintraege = fs.readdirSync('/opt').map((e) => '/opt/' + e); } catch (e) { optEintraege = []; }
    const erlaubterPraefix = (p) => [konf.NODE_BAUM, konf.BROWSER].some((b) => b && (b === p || b.startsWith(p + '/')));
    ok(`/opt enthaelt nur Praefixe von Node-Baum und Browserpfad (${JSON.stringify(optEintraege)}); ${OPT_VERBOTEN.join(' und ')} existieren nicht`,
        optEintraege.every(erlaubterPraefix) && OPT_VERBOTEN.every((p) => !fs.existsSync(p)));

    // 7. Namen der Kind-Umgebung = Literalliste
    const namen = Object.keys(process.env).sort();
    ok(`Namen der Kind-Umgebung = ${JSON.stringify(UMGEBUNG_SOLL)} (gefunden ${JSON.stringify(namen)})`,
        JSON.stringify(namen) === JSON.stringify(UMGEBUNG_SOLL));

    // 8. Originalbaum und Host unerreichbar
    const orig = konf.ORIGINALWURZEL || '';
    ok(`Originalbaum ${orig || '(unbekannt)'} sowie /workspace, /home, /var/lib, /root existieren nicht (cwd ${process.cwd()})`,
        orig.startsWith('/') && !fs.existsSync(orig) && !fs.existsSync('/workspace') && !fs.existsSync('/home')
        && !fs.existsSync('/var/lib') && !fs.existsSync('/root') && process.cwd() === '/dsv1/kopie');

    // 9./10. sha256 der Testdatei und der zweiten Datei (mutierte Datei bzw.
    // test/umgebung.sh im Grundlauf) = Erwartung des Elternprozesses
    let shaTest = null;
    let shaZweite = null;
    try { shaTest = sha256(konf.TESTDATEI); } catch (e) { shaTest = `(${e.code})`; }
    ok(`sha256 der Testdatei ${konf.TESTDATEI} = Erwartung des Elternprozesses (${(konf.SHA_TESTDATEI || '').slice(0, 12)}…)`,
        /^[0-9a-f]{64}$/.test(konf.SHA_TESTDATEI || '') && shaTest === konf.SHA_TESTDATEI);
    try { shaZweite = sha256(konf.ZWEITE_DATEI); } catch (e) { shaZweite = `(${e.code})`; }
    ok(`sha256 der zweiten Datei ${konf.ZWEITE_DATEI} (${konf.MUTIERTE_DATEI ? 'mutiert' : 'unmutiert, Grundlauf'}) = Erwartung des Elternprozesses (${(konf.SHA_ZWEITE || '').slice(0, 12)}…)`,
        /^[0-9a-f]{64}$/.test(konf.SHA_ZWEITE || '') && shaZweite === konf.SHA_ZWEITE && konf.ZWEITE_DATEI !== konf.TESTDATEI);

    // 11.-13. /proc/1/environ, /etc/shadow, Werkzeug (ro) und Ergebnis (root)
    const environCode = fehlerCode(() => fs.readFileSync('/proc/1/environ'));
    ok(`/proc/1/environ fuer ${KIND_UID} nicht lesbar (${environCode})`, environCode === 'EACCES' || environCode === 'ENOENT');
    const shadowCode = fehlerCode(() => fs.readFileSync('/etc/shadow'));
    ok(`/etc/shadow nicht lesbar (${shadowCode})`, shadowCode === 'EACCES');
    const werkzeugCode = fehlerCode(() => fs.writeFileSync('/dsv1/werkzeug/.dsv1-probe', ''));
    const ergebnisCode = fehlerCode(() => fs.writeFileSync('/dsv1/ergebnis/schreibprobe', ''));
    ok(`/dsv1/werkzeug nur lesbar (${werkzeugCode}) und /dsv1/ergebnis nicht beschreibbar (${ergebnisCode}) — Waechterdatei und test-exit kann 65534 nicht anlegen`,
        werkzeugCode === 'EROFS' && ergebnisCode === 'EACCES');

    // 14.-16. Netz
    const aussen = await verbindungScheitert('1.1.1.1', 443);
    ok(`TCP nach aussen (1.1.1.1:443) scheitert sofort (${aussen.grund})`, aussen.scheitert);
    const proxyZiel = (konf.PROXY_HOST && konf.PROXY_PORT) ? { host: konf.PROXY_HOST, port: Number(konf.PROXY_PORT), name: 'Egress-Proxy' } : { ...UNROUTBAR, name: 'unroutbare Adresse (kein Proxy konfiguriert)' };
    const proxy = await verbindungScheitert(proxyZiel.host, proxyZiel.port);
    ok(`TCP zu ${proxyZiel.name} ${proxyZiel.host}:${proxyZiel.port} scheitert (${proxy.grund})`, proxy.scheitert);
    const lo = await eigenerHorcherGelingt();
    ok(`127.0.0.1 gegen eigenen Horcher gelingt (${lo.grund})`, lo.ok);

    // 17. Zeitzone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    ok(`Zeitzone des Node-Prozesses = ${ZEITZONE_SOLL} (Intl ${tz}, Offset ${new Date().getTimezoneOffset()} min)`,
        tz === ZEITZONE_SOLL && new Date().getTimezoneOffset() === 0);

    // 18. Browser-Programm ausfuehrbar
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

    // 19. node_modules ro: findmnt UND Schreibprobe
    const nm = spawnSync('findmnt', ['-rno', 'OPTIONS', '/dsv1/kopie/node_modules'], { encoding: 'utf8' });
    const nmOptionen = (nm.stdout || '').trim();
    const nmSchreibCode = fehlerCode(() => fs.writeFileSync('/dsv1/kopie/node_modules/.dsv1-probe', ''));
    ok(`node_modules der Kopie laut findmnt ro (${nmOptionen.split(',')[0] || '(kein Eintrag)'}) und Schreibprobe scheitert (${nmSchreibCode})`,
        nm.status === 0 && nmOptionen.split(',')[0] === 'ro' && nmSchreibCode === 'EROFS');

    // 20.-23. rlimits: Literale aus /proc/self/limits, dazu je Deckel ein
    // Ueberschreiten unter selbst gesenktem Limit (scheitert) und eine
    // Positivkontrolle darunter (gelingt).
    const lNproc = limitLesen('Max processes');
    const lFsize = limitLesen('Max file size');
    const lCpu = limitLesen('Max cpu time');
    ok(`rlimits (soft/hart): nproc ${RLIMIT_NPROC_SOLL}, fsize ${RLIMIT_FSIZE_SOLL}, cpu ${RLIMIT_CPU_SOLL} (gefunden ${JSON.stringify({ nproc: lNproc, fsize: lFsize, cpu: lCpu })})`,
        !!lNproc && !!lFsize && !!lCpu && lNproc.soft === String(RLIMIT_NPROC_SOLL) && lNproc.hart === String(RLIMIT_NPROC_SOLL)
        && lFsize.soft === String(RLIMIT_FSIZE_SOLL) && lFsize.hart === String(RLIMIT_FSIZE_SOLL)
        && lCpu.soft === String(RLIMIT_CPU_SOLL) && lCpu.hart === String(RLIMIT_CPU_SOLL));
    const nprocSkript = 'const {spawn}=require("node:child_process");let ok=0,fehl=0;const k=[];for(let i=0;i<6;i++){const c=spawn("sleep",["3"]);c.on("error",()=>{fehl++});c.on("spawn",()=>{ok++});k.push(c);}setTimeout(()=>{console.log("ok="+ok+" fehl="+fehl);for(const c of k)try{c.kill("SIGKILL")}catch(e){}process.exit(0)},700)';
    const nprocEng = prlimitProbe('--nproc=3', nprocSkript);
    const nprocWeit = prlimitProbe('--nproc=64', nprocSkript);
    ok(`nproc wirkt: unter --nproc=3 scheitern Starts (${nprocEng.stdout || nprocEng.stderr}), unter --nproc=64 gelingen alle sechs (${nprocWeit.stdout || nprocWeit.stderr})`,
        /fehl=[1-9]/.test(nprocEng.stdout) && nprocWeit.stdout === 'ok=6 fehl=0');
    const fsizeSkript = 'const fs=require("node:fs");try{fs.writeFileSync("/tmp/.dsv1-fsize-probe",Buffer.alloc(Number(process.argv[1])));console.log("GESCHRIEBEN")}catch(e){console.log("FEHLER "+e.code)}finally{try{fs.unlinkSync("/tmp/.dsv1-fsize-probe")}catch(e){}}';
    const fsizeEng = spawnSync('prlimit', ['--fsize=65536', 'node', '-e', fsizeSkript, '200000'], { encoding: 'utf8', timeout: 20000 });
    const fsizeWeit = spawnSync('prlimit', ['--fsize=65536', 'node', '-e', fsizeSkript, '50000'], { encoding: 'utf8', timeout: 20000 });
    try { fs.unlinkSync('/tmp/.dsv1-fsize-probe'); } catch (e) { /* schon weg */ }
    const fsizeEngScheitert = fsizeEng.signal === 'SIGXFSZ' || /FEHLER EFBIG/.test(fsizeEng.stdout || '');
    ok(`fsize wirkt: 200000 Bytes unter --fsize=65536 scheitern (${fsizeEng.signal || (fsizeEng.stdout || '').trim()}), 50000 Bytes gelingen (${(fsizeWeit.stdout || '').trim()})`,
        fsizeEngScheitert && (fsizeWeit.stdout || '').trim() === 'GESCHRIEBEN');
    const cpuSkript = 'const t=Date.now();while(Date.now()-t<Number(process.argv[1])){}console.log("FERTIG")';
    const cpuEng = spawnSync('prlimit', ['--cpu=1', 'node', '-e', cpuSkript, '6000'], { encoding: 'utf8', timeout: 20000 });
    const cpuWeit = spawnSync('prlimit', ['--cpu=5', 'node', '-e', cpuSkript, '150'], { encoding: 'utf8', timeout: 20000 });
    ok(`cpu wirkt: 6 s Rechnen unter --cpu=1 wird beendet (${cpuEng.signal || 'Exit ' + cpuEng.status}), 0,15 s unter --cpu=5 gelingen (${(cpuWeit.stdout || '').trim()})`,
        cpuEng.signal === 'SIGXCPU' && cpuEng.status === null && (cpuWeit.stdout || '').trim() === 'FERTIG');

    // 24.-29. Datenbank
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
    const lo_import = psql(url, "SELECT lo_import('/etc/passwd')");
    ok(`serverseitiges lo_import scheitert (${lo_import.stderr.split('\n')[0] || 'kein Fehler!'})`,
        lo_import.status !== 0 && /permission denied|must be superuser/i.test(lo_import.stderr));
    // Dieselbe URL, nur die Rolle getauscht (Textersatz: die Socket-Form
    // traegt keinen Rechnernamen, den ein URL-Parser verlangt).
    let alsPostgres = { status: 0, stderr: 'keine URL ableitbar' };
    const urlPostgres = url.replace(/^(postgres(?:ql)?:\/\/)nobody@/, '$1postgres@');
    if (urlPostgres !== url) alsPostgres = psql(urlPostgres, 'SELECT 1');
    ok(`Verbindung als postgres ueber denselben Socket scheitert (peer): ${alsPostgres.stderr.split('\n').pop() || 'VERBUNDEN!'}`,
        alsPostgres.status !== 0 && /peer authentication failed/i.test(alsPostgres.stderr));
    const haupt = psql(`postgresql://nobody@localhost/postgres?host=${HAUPT_SOCKET_ORDNER}&port=5432`, 'SELECT 1');
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
