'use strict';
//
// tools/ausfuehr-spur.js — die AUSFUEHRENDE Pruefspur (Auftrag "DeepSeek
// Variante 1", Teil W, 30.09.2026; Betreiber-Entscheidungen 26./27.09.2026,
// CLAUDE.md "begrenzte Ausfuehrung fuer DeepSeek"). tools/gegenleser-repo.js
// bekommt mit --ausfuehren zwei zusaetzliche Werkzeuge an die Hand:
//
//   teste(testdatei)                              EINE registrierte Testdatei
//   mutiere_und_teste(datei, alt, neu, testdatei)  genau EINE Stelle aendern,
//                                                  dann dieselbe Testdatei
//
// Beides laeuft in einer WEGWERFKOPIE des Zielbaums, in einem eigenen
// Namensraum (mount/net/pid/ipc/uts) mit neuer Wurzel (pivot_root), als
// Benutzer 65534, gegen einen eigenen Wegwerf-Cluster mit frischer Datenbank
// je Testlauf, mit Zeitlimit von aussen (timeout -k). Der ausgefuehrte
// Prozess sieht weder die Schluesselablage noch die Umgebung dieses
// Werkzeugs, hat kein Netz, und alles, was er schreiben kann, ist nach dem
// Lauf weg (Grundsatz 0 des Auftrags). Der Geheimnis-Riegel laeuft auf jede
// Zeile, die zurueck in den Modellkontext geht — als ZWEITE Schicht, nie
// tragend (er ist blind fuer kodierte Ausgaben).
//
// Der STATUS eines Laufs kommt aus einem EXIT-VERTRAG mit
// tools/ausfuehr-aufbau.sh (PID 1 im Kind), nie aus dem Ausgabetext einer
// Mutation: jede Stufe (Aufbau, Selbstmessung, Vorbereitung, Umgebung, Test)
// hat ihren eigenen Code, und nur die Teststufe ist 0/1-wertig — und auch
// das nur, wenn root vor ihrem Start die Waechterdatei angelegt hat.
// Abbildung in statusAusExit() weiter unten, jeder Wert mit ROT/GRUEN-Fall
// im Selbsttest (selbsttestSpur()).
//
// GRUNDLAUF PFLICHT: mutiere_und_teste faehrt die Testdatei erst UNMUTIERT
// (je Lauf und Datei zwischengespeichert). Nur ein Grundlauf, dessen
// Ausgabe (vom unmutierten Code, also vertrauenswuerdig) mindestens eine
// PASS-Zeile und keine Uebersprungen-/NICHT-GEPRUEFT-Zeile traegt, ist
// gueltig — so fallen Tests auf, die in der Sandbox still ueberspringen.
// NUR "gescheitert" nach gueltigem Grundlauf heisst "Verhaltensaenderung des
// Testlaufs".
//
// Das Werkzeug spiegelt das CI-Gate des Zielrepos (ci.yml: CI=true, TZ=UTC,
// SESSION_SECRET-Literal, Stufenfolge von test/run.sh). Was die Sandbox
// nicht bieten kann, wird dadurch im Grundlauf ROT, nie still uebersprungen.
// Benannte Asymmetrie: im CI-Gate ist die Rolle der DATABASE_URL Superuser,
// hier nicht — ein superuser-pflichtiger Test laeuft als grundlauf-rot auf.
//
// Nur mit --modell=deepseek-flash (Betreiber-Vorgabe 27.09.2026; die Pruefung
// steht in gegenleser-repo.js, main()) und nur als root (Namensraeume,
// pivot_root, pg_createcluster).
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { pruefeGeheimnisse, zeileEntferntMarker } = require('./geheimnis-riegel');

// ===================== LITERALE (von Hand, nie abgeleitet) =====================
const ERLAUBTES_MODELL = 'deepseek-flash';
const T_SEKUNDEN = 300;                        // Zeitlimit je Kind-Lauf, von aussen (timeout)
const KILL_NACH_SEKUNDEN = 5;                  // timeout -k: SIGKILL, wenn TERM nicht reicht (gemessen 30.09.: TERM allein 30 s)
const MAX_AUFRUFE = 30;                        // Werkzeugaufrufe teste/mutiere_und_teste je Lauf
const MAX_AUSFUEHRUNGSZEIT_MS = 45 * 60 * 1000; // Summe der Kind-Laufzeiten je Lauf
const MAX_ERGEBNIS_BYTES = 8 * 1024;           // je Werkzeugergebnis in den Modellkontext
const MAX_PROTOKOLL_BYTES = 1024 * 1024;       // Volltext je Aufruf im Laufprotokoll
const MAX_ERFASSUNG_BYTES = 4 * 1024 * 1024;   // harter Deckel der Erfassung je Kind-Lauf
const MUTIERBARE_ENDUNGEN = ['.js', '.cjs', '.json', '.sh', '.sql'];
const NICHT_MUTIERBAR = ['test/run.sh', 'test/umgebung.sh', 'test/db-vorbereiten.js'];
const PFLICHTDATEIEN = ['test/run.sh', 'test/umgebung.sh', 'test/db-vorbereiten.js'];
const SPERRDATEI = '/var/lock/dsv1.lock';
const LAUFWURZEL = '/var/lib/dsv1';
const CLUSTER_PRAEFIX = 'dsv1';
const DB_NAME = 'gymdocu_test';                // core/db.js:330 und test_feature_migration_0060_loeschauftrag.js:32-33 des Zielrepos
const DB_ROLLE = 'nobody';
const KIND_UID = 65534;
const KIND_GID = 65534;
const BROWSERPFAD_VORGABE = '/opt/pw-browsers';
const AUFBAU_SKRIPT = path.join(__dirname, 'ausfuehr-aufbau.sh');
const SELBSTMESSUNG_SKRIPT = path.join(__dirname, 'ausfuehr-selbstmessung.js');
const BENOETIGTE_PROGRAMME = ['pg_createcluster', 'pg_ctlcluster', 'pg_dropcluster', 'pg_lsclusters', 'psql',
    'unshare', 'setpriv', 'pivot_root', 'timeout', 'runuser', 'flock', 'chown', 'git', 'findmnt', 'ip', 'bash'];
const PROGRAMMPFADE = ['/usr/local/sbin', '/usr/local/bin', '/usr/sbin', '/usr/bin', '/sbin', '/bin'];
const KIND_PATH = '/usr/sbin:/usr/bin:/sbin:/bin';   // Umgebung des timeout-Spawns: NUR das
const TESTSTART_MARKER = '[dsv1] Teststufe gestartet: ';
// Exit-Codes der Stufen (Vertrag mit tools/ausfuehr-aufbau.sh, dort im Kopf)
const STUFE = { AUFBAU: 20, SELBSTMESSUNG: 21, VORBEREITUNG: 22, UMGEBUNG: 23, UMGEBUNGSNAMEN: 24, SIGNAL: 30 };
// Gemessen am Zielrepo (30.09.2026): alle 412 registrierten Dateien tragen
// "PASS" oder "✓" im Quelltext; Ueberspringen wird als "⤳ SKIP (n):",
// "N ÜBERSPRUNGEN"/"N übersprungen"/"N SKIP" in der Schlusszeile oder
// "NICHT GEPRÜFT"/"NICHT GEPRUEFT" gemeldet. Die Zahl vor ÜBERSPRUNGEN muss
// >= 1 sein: "0 ÜBERSPRUNGEN" ist KEIN Ueberspringen.
const PASS_MUSTER = /\bPASS\b|✓/;
const SKIP_MUSTER = /NICHT GEPR(?:Ü|UE)FT|⤳ SKIP|\b[1-9]\d* (?:ÜBERSPRUNGEN|übersprungen|uebersprungen|SKIP)\b/;

// Der Status-Katalog — jeder Wert mit eigenem ROT/GRUEN-Fall im Selbsttest.
// Der Text geht so in den Vorspann des Modells (vorspannAbsatz()).
const STATUS_KATALOG = {
    'bestanden': 'Teststufe mit Exit 0 (Waechterdatei vorhanden).',
    'gescheitert': 'Teststufe mit Exit 1. NUR nach gueltigem Grundlauf heisst das "Verhaltensaenderung des Testlaufs".',
    'signaltod': 'Teststufe durch ein Signal beendet (Exit >= 129), oder SIGKILL vor Ablauf des Zeitlimits.',
    'zeitlimit': `Zeitlimit von ${T_SEKUNDEN} s ueberschritten (timeout 124, oder 137 nach Ablauf der eigenen Uhr).`,
    'vorbereitung-gescheitert': 'test/db-vorbereiten.js endete != 0 — im CI-Gate bricht test/run.sh dann VOR jedem Test ab; der Befund ist "Gate rot vor jedem Test", nicht "Zusicherung gefallen".',
    'umgebung-fehler': 'Aufbau, test/umgebung.sh oder ein Exit ausserhalb 0/1 (125/126/127/unbekannt) der Teststufe — kein Testergebnis.',
    'abgelehnt': 'Aufruf nicht ausgefuehrt: ungueltige Argumente, Deckel erreicht oder Ausfuehrung abgebrochen.',
    'grundlauf-rot': 'Der unmutierte Lauf derselben Testdatei war nicht "bestanden" — keine Mutation gefahren.',
    'grundlauf-unvollstaendig': 'Der unmutierte Lauf war "bestanden", trug aber keine PASS-Zeile oder eine Uebersprungen-/NICHT-GEPRUEFT-Zeile — keine Mutation gefahren.',
    'ausgabe-verworfen': 'HINWEIS, kein Status: Zeilen der Ausgabe fielen dem Geheimnis-Riegel zum Opfer; der Status bleibt.',
};

const WERKZEUGE_AUSFUEHRUNG = [
    {
        type: 'function',
        name: 'teste',
        description: 'Faehrt GENAU EINE registrierte Testdatei (aus der TESTS=(-Liste von test/run.sh) '
            + 'unmutiert in einer frischen Wegwerfkopie gegen eine frische Datenbank, wie im CI-Gate. '
            + 'Liefert status, exit und das Ende der Ausgabe (hoechstens ' + MAX_ERGEBNIS_BYTES + ' Bytes).',
        parameters: {
            type: 'object',
            properties: {
                testdatei: { type: 'string', description: 'Pfad relativ zur Repo-Wurzel, genau wie in test/run.sh registriert, z. B. "test_feature_x.js" oder "ops/boot-smoke.js".' },
            },
            required: ['testdatei'],
        },
    },
    {
        type: 'function',
        name: 'mutiere_und_teste',
        description: 'Ersetzt in EINER versionierten Datei (.js/.cjs/.json/.sh/.sql, nicht die Testdatei, nicht '
            + 'test/run.sh, test/umgebung.sh, test/db-vorbereiten.js) GENAU EINE Fundstelle von "alt" durch "neu" '
            + '(Abbruch bei 0 oder mehr als 1 Fundstelle; Syntaxpruefung je Endung), und faehrt danach die '
            + 'genannte Testdatei. Vorher laeuft dieselbe Testdatei einmal UNMUTIERT (Grundlauf, je Lauf und Datei '
            + 'zwischengespeichert); ist der nicht "bestanden" mit PASS-Zeile und ohne Uebersprungen-Zeile, gibt es '
            + 'keine Mutation. Liefert status, exit und das Ende der Ausgabe.',
        parameters: {
            type: 'object',
            properties: {
                datei: { type: 'string', description: 'Zu mutierende Datei, Pfad relativ zur Repo-Wurzel.' },
                alt: { type: 'string', description: 'Woertlicher Text, der genau einmal in der Datei vorkommen muss.' },
                neu: { type: 'string', description: 'Ersatztext (darf leer sein).' },
                testdatei: { type: 'string', description: 'Registrierte Testdatei, die danach laeuft.' },
            },
            required: ['datei', 'alt', 'neu', 'testdatei'],
        },
    },
];

class Ablehnung extends Error {}

// ===================== Modulzustand fuer EINEN Lauf =====================
let lauf = null;

function istAktiv() { return lauf !== null; }
function istAbgebrochen() { return lauf !== null && lauf.isolation.abgebrochen; }
function abbruchMarker() {
    if (!istAbgebrochen()) return null;
    return `AUSFÜHRUNG ABGEBROCHEN — Belege nach Aufruf ${lauf.isolation.aufruf} fehlen (${lauf.isolation.grund})`;
}
function zaehler() {
    return lauf ? { ...lauf.zaehler } : { aufrufe: 0, ausfuehrungen: 0, mutationen: 0, ablehnungen: 0, verworfeneZeilen: 0, ausfuehrungMs: 0 };
}

// ===================== Hilfsfunktionen =====================
function programmFinden(name) {
    for (const d of PROGRAMMPFADE) {
        const p = path.join(d, name);
        try { fs.accessSync(p, fs.constants.X_OK); if (fs.statSync(p).isFile()) return p; } catch (e) { /* naechster */ }
    }
    return null;
}

function laufen(programm, argumente, optionen = {}) {
    const r = spawnSync(programm, argumente, { encoding: 'utf8', env: { PATH: KIND_PATH }, maxBuffer: 64 * 1024 * 1024, ...optionen });
    if (r.error) throw new Error(`${programm} ${argumente.join(' ')}: ${r.error.message}`);
    if (r.status !== 0) throw new Error(`${programm} ${argumente.slice(0, 4).join(' ')} … endete mit ${r.status}${r.signal ? ' (' + r.signal + ')' : ''}: ${(r.stderr || r.stdout || '').trim().slice(0, 600)}`);
    return r.stdout;
}

function sha256Datei(pfad) {
    return crypto.createHash('sha256').update(fs.readFileSync(pfad)).digest('hex');
}

function pgVersionErmitteln() {
    let eintraege;
    try { eintraege = fs.readdirSync('/usr/lib/postgresql'); } catch (e) { throw new Error('/usr/lib/postgresql fehlt — keine PostgreSQL-Installation gefunden'); }
    const versionen = eintraege.filter((e) => /^\d+$/.test(e)).map(Number).sort((a, b) => b - a);
    if (!versionen.length) throw new Error('/usr/lib/postgresql enthaelt keine Versionsnummer');
    return String(versionen[0]);
}

// Verwaltung des Wegwerf-Clusters als postgres (peer ueber den Socket-Ordner).
function psqlVerwaltung(...anweisungen) {
    const argumente = ['-u', 'postgres', '--', 'psql', '-h', lauf.pgDir, '-p', String(lauf.port), '-X', '-qtA', '-v', 'ON_ERROR_STOP=1', '-d', 'postgres'];
    for (const a of anweisungen) argumente.push('-c', a);
    return laufen('runuser', argumente);
}

// TESTS=( ... ) aus test/run.sh — GELESEN, nicht gestartet. Kommentare
// (# …) fallen weg, ein Eintrag je Zeile oder mehrere je Zeile.
function testsAusRunSh(wurzel) {
    const zeilen = fs.readFileSync(path.join(wurzel, 'test/run.sh'), 'utf8').split('\n');
    const start = zeilen.findIndex((z) => /^TESTS=\(\s*$/.test(z));
    if (start === -1) throw new Error('test/run.sh: keine Zeile "TESTS=(" gefunden');
    const ende = zeilen.findIndex((z, i) => i > start && /^\)\s*$/.test(z));
    if (ende === -1) throw new Error('test/run.sh: TESTS=( ohne schliessende Klammer');
    const tests = [];
    for (const z of zeilen.slice(start + 1, ende)) {
        const ohneKommentar = z.replace(/#.*$/, '').trim();
        if (!ohneKommentar) continue;
        for (const t of ohneKommentar.split(/\s+/)) tests.push(t.replace(/^["']|["']$/g, ''));
    }
    if (!tests.length) throw new Error('test/run.sh: TESTS=( ist leer');
    return tests;
}

// Sperre ueber den ganzen Lauf: ein Halter-Prozess unter flock -n, der endet,
// sobald dieser Prozess nicht mehr lebt (auch nach SIGKILL: die Schleife
// merkt es binnen einer Sekunde). Belegt => Abbruch, kein Warten.
function sperreErwerben() {
    return new Promise((erfuellen, ablehnen) => {
        const halter = spawn('flock', ['-n', '-E', '75', SPERRDATEI, 'sh', '-c',
            `echo dsv1-sperre; while kill -0 ${process.pid} 2>/dev/null; do sleep 1; done`],
        { stdio: ['ignore', 'pipe', 'inherit'], detached: true, env: { PATH: KIND_PATH } });
        let fertig = false;
        halter.stdout.on('data', (d) => {
            if (fertig) return;
            if (d.toString().includes('dsv1-sperre')) { fertig = true; erfuellen(halter); }
        });
        halter.on('exit', (code) => {
            if (fertig) return;
            fertig = true;
            ablehnen(new Error(code === 75
                ? `Sperre ${SPERRDATEI} ist belegt — ein anderer Lauf der ausfuehrenden Spur ist aktiv. Abbruch.`
                : `Sperr-Halter endete unerwartet mit ${code}`));
        });
        halter.on('error', (e) => { if (!fertig) { fertig = true; ablehnen(e); } });
    });
}

function sperreFreigeben(halter) {
    if (!halter) return;
    try { process.kill(-halter.pid, 'SIGKILL'); } catch (e) { /* schon weg */ }
}

function clusterListe() {
    const roh = spawnSync('pg_lsclusters', ['-h'], { encoding: 'utf8', env: { PATH: KIND_PATH } });
    if (roh.status !== 0) throw new Error(`pg_lsclusters endete mit ${roh.status}: ${(roh.stderr || '').trim()}`);
    return (roh.stdout || '').split('\n').filter(Boolean).map((z) => {
        const t = z.trim().split(/\s+/);
        return { version: t[0], name: t[1], port: Number(t[2]), status: t[3] };
    });
}

function clusterEntfernen(version, name) {
    if (!name.startsWith(CLUSTER_PRAEFIX)) throw new Error(`SICHERHEIT: Cluster "${name}" traegt nicht das Praefix ${CLUSTER_PRAEFIX} — wird NICHT entfernt`);
    laufen('pg_dropcluster', ['--stop', version, name]);
    // pg_dropcluster laesst das Konfigurationsverzeichnis stehen, wenn darin
    // ein conf.d liegt (gemessen 30.09.2026: /etc/postgresql/16/<name>/conf.d
    // blieb uebrig) — deshalb ausdruecklich hinterher.
    fs.rmSync(`/etc/postgresql/${version}/${name}`, { recursive: true, force: true });
}

// Mit gehaltener Sperre sind Reste frueherer Laeufe tot: melden, entfernen.
function resteEntfernen() {
    const gemeldet = [];
    for (const c of clusterListe()) {
        if (!c.name.startsWith(CLUSTER_PRAEFIX)) continue;
        console.error(`[ausfuehr-spur] REST eines frueheren Laufs: Cluster ${c.version}/${c.name} (${c.status}) — wird entfernt.`);
        try { clusterEntfernen(c.version, c.name); gemeldet.push(`Cluster ${c.version}/${c.name}`); } catch (e) { throw new Error(`Rest ${c.name} nicht entfernbar: ${e.message}`); }
    }
    for (const v of fs.existsSync('/etc/postgresql') ? fs.readdirSync('/etc/postgresql') : []) {
        const basis = `/etc/postgresql/${v}`;
        for (const e of fs.readdirSync(basis)) {
            if (!e.startsWith(CLUSTER_PRAEFIX)) continue;
            console.error(`[ausfuehr-spur] REST eines frueheren Laufs: Konfiguration ${basis}/${e} — wird entfernt.`);
            fs.rmSync(path.join(basis, e), { recursive: true, force: true });
            gemeldet.push(`Konfiguration ${basis}/${e}`);
        }
    }
    if (fs.existsSync(LAUFWURZEL)) {
        for (const e of fs.readdirSync(LAUFWURZEL)) {
            const p = path.join(LAUFWURZEL, e);
            console.error(`[ausfuehr-spur] REST eines frueheren Laufs: ${p} — wird entfernt.`);
            // Ein noch eingehaengter Rest (sollte es nicht geben: die Einhaengungen
            // leben im Namensraum des Kindes) wuerde rmSync scheitern lassen — laut.
            fs.rmSync(p, { recursive: true, force: true });
            gemeldet.push(p);
        }
    }
    return gemeldet;
}

function clusterAnlegen(id) {
    const name = `${CLUSTER_PRAEFIX}${id}`;
    const dir = lauf.dir;
    const pgDir = path.join(dir, 'pg');
    fs.mkdirSync(pgDir, { mode: 0o755 });
    laufen('chown', ['postgres:postgres', pgDir]);
    laufen('pg_createcluster', [lauf.version, name, '-d', path.join(dir, 'data'), '-s', pgDir, '-l', path.join(dir, 'pg.log'),
        '--start-conf', 'manual', '-e', 'UTF8', '--locale', 'C.UTF-8', '--', '--auth-local=peer', '--auth-host=reject']);
    lauf.cluster = name;
    const confDir = `/etc/postgresql/${lauf.version}/${name}`;
    fs.writeFileSync(path.join(confDir, 'conf.d', 'dsv1.conf'), "listen_addresses = ''\nssl = off\n");
    // pg_hba.conf GENAU zwei Zeilen: postgres und nobody, beide peer.
    fs.writeFileSync(path.join(confDir, 'pg_hba.conf'), 'local all postgres peer\nlocal all nobody peer\n');
    laufen('chown', ['postgres:postgres', path.join(confDir, 'pg_hba.conf'), path.join(confDir, 'conf.d', 'dsv1.conf')]);
    laufen('pg_ctlcluster', [lauf.version, name, 'start']);
    const eintrag = clusterListe().find((c) => c.name === name);
    if (!eintrag || eintrag.status !== 'online') throw new Error(`Cluster ${name} nach dem Start nicht online`);
    lauf.port = eintrag.port;
    lauf.pgDir = pgDir;
    if (!fs.existsSync(path.join(pgDir, `.s.PGSQL.${lauf.port}`))) throw new Error(`Socket ${pgDir}/.s.PGSQL.${lauf.port} fehlt`);
    psqlVerwaltung(`CREATE ROLE ${DB_ROLLE} LOGIN CREATEDB`);
    // Fail-closed-Probe: kein TCP-Horcher (listen_addresses=''), Verwaltung nur ueber den Socket.
    const tcp = spawnSync('runuser', ['-u', 'postgres', '--', 'psql', '-h', '127.0.0.1', '-p', String(lauf.port), '-X', '-c', 'SELECT 1', '-d', 'postgres'],
        { encoding: 'utf8', env: { PATH: KIND_PATH }, timeout: 15000 });
    if (tcp.status === 0) throw new Error(`Cluster ${name} horcht auf TCP 127.0.0.1:${lauf.port} — listen_addresses wirkt nicht`);
}

function datenbankFrisch() {
    psqlVerwaltung(`DROP DATABASE IF EXISTS ${DB_NAME} WITH (FORCE)`, `CREATE DATABASE ${DB_NAME} OWNER ${DB_ROLLE}`);
}

// Die URL, wie sie das KIND sieht: der Socket-Ordner liegt dort unter
// /dsv1/pg (ausfuehr-aufbau.sh), nicht unter dem Host-Pfad. "localhost" im
// Rechnerteil ist ein Platzhalter, den der Query-Parameter host= ueberschreibt
// -- GEMESSEN 30.09.2026 an libpq (psql verbindet ueber den Socket,
// inet_server_addr() ist NULL) und pg-connection-string (host = /dsv1/pg).
// Die Form OHNE Rechnerteil ("postgresql://nobody@/gymdocu_test?…"), die
// der Auftrag nannte, ist fuer den WHATWG-Parser UNGUELTIG (new URL() wirft
// "Invalid URL"); core/db.js und test_feature_migration_0060_loeschauftrag.js
// des Zielrepos lesen den Datenbanknamen aber genau damit -- mit jener Form
// waere jeder DB-Test aus einem Werkzeuggrund rot gewesen.
const KIND_PG_DIR = '/dsv1/pg';
function datenbankUrl() {
    return `postgresql://${DB_ROLLE}@localhost/${DB_NAME}?host=${KIND_PG_DIR}&port=${lauf.port}`;
}

// ===================== Einrichten und Aufraeumen =====================
// optionen: wurzel (Pflicht), kanarie (optional, sonst erste *_static.js der
// TESTS-Liste), istHartGesperrt (Pflicht: dieselbe Funktion wie in
// gegenleser-repo.js, nicht kopiert), tSekunden und aufbauSkript NUR fuer den
// Selbsttest (kein CLI- oder Umgebungsschalter fuehrt dorthin).
async function einrichten(optionen) {
    if (lauf) throw new Error('ausfuehr-spur: bereits eingerichtet');
    if (typeof optionen.istHartGesperrt !== 'function') throw new Error('ausfuehr-spur: istHartGesperrt fehlt');
    if (process.getuid() !== 0) throw new Error('--ausfuehren braucht root (uid 0): Namensraeume, pivot_root, pg_createcluster, chown.');
    const fehlend = BENOETIGTE_PROGRAMME.filter((p) => !programmFinden(p));
    if (fehlend.length) throw new Error(`--ausfuehren: Programme fehlen: ${fehlend.join(', ')}`);
    const version = pgVersionErmitteln();
    const browser = process.env.PLAYWRIGHT_BROWSERS_PATH || BROWSERPFAD_VORGABE;
    if (!path.isAbsolute(browser) || !fs.existsSync(browser) || !fs.statSync(browser).isDirectory()) {
        throw new Error(`--ausfuehren: Browserpfad ${browser} (PLAYWRIGHT_BROWSERS_PATH, Vorgabe ${BROWSERPFAD_VORGABE}) ist kein Verzeichnis`);
    }
    const nodeBin = path.dirname(process.execPath);
    for (const skript of [optionen.aufbauSkript || AUFBAU_SKRIPT, SELBSTMESSUNG_SKRIPT]) {
        if (!fs.existsSync(skript)) throw new Error(`--ausfuehren: ${skript} fehlt`);
    }
    const wurzel = fs.realpathSync(optionen.wurzel);
    const status = laufen('git', ['status', '--porcelain'], { cwd: wurzel });
    if (status.trim()) throw new Error(`--ausfuehren: Zielbaum ${wurzel} ist nicht sauber (git status --porcelain):\n${status.trim().slice(0, 800)}`);
    const versioniert = new Set(laufen('git', ['ls-files', '-z'], { cwd: wurzel }).split('\0').filter(Boolean));
    const fehlendePflicht = PFLICHTDATEIEN.filter((p) => !versioniert.has(p));
    if (fehlendePflicht.length) throw new Error(`--ausfuehren: Zielbaum ohne ${fehlendePflicht.join(', ')} (versioniert)`);
    if (!fs.existsSync(path.join(wurzel, 'node_modules'))) throw new Error(`--ausfuehren: ${wurzel}/node_modules fehlt (vorher npm ci im Zielbaum)`);
    const tests = testsAusRunSh(wurzel);
    const kanarie = optionen.kanarie || tests.find((t) => t.endsWith('_static.js'));
    if (!kanarie) throw new Error('--ausfuehren: kein Kanarientest (--kanarie=<testdatei> oder eine *_static.js in TESTS=()');
    if (!tests.includes(kanarie)) throw new Error(`--ausfuehren: Kanarientest ${kanarie} ist nicht in test/run.sh registriert`);
    for (const t of tests) if (t.includes('\'') || t.includes('\n')) throw new Error(`--ausfuehren: unzulaessiger Testdateiname ${JSON.stringify(t)}`);
    const proxy = { host: '', port: '' };
    const proxyRoh = process.env.HTTPS_PROXY || process.env.https_proxy || '';
    if (proxyRoh) { try { const u = new URL(proxyRoh); proxy.host = u.hostname; proxy.port = u.port || '3128'; } catch (e) { /* kein Proxy */ } }

    const halter = await sperreErwerben();
    try {
        const reste = resteEntfernen();
        const id = crypto.randomBytes(4).toString('hex');
        fs.mkdirSync(LAUFWURZEL, { recursive: true, mode: 0o755 });
        const dir = path.join(LAUFWURZEL, `${CLUSTER_PRAEFIX}${id}`);
        fs.mkdirSync(dir, { mode: 0o755 });
        lauf = {
            id, dir, version, wurzel, browser, nodeBin, versioniert, tests, kanarie: { datei: kanarie, gefahren: false, gruen: false },
            halter, cluster: null, port: null, pgDir: null, proxy, reste,
            tSekunden: optionen.tSekunden || T_SEKUNDEN,
            aufbauSkript: optionen.aufbauSkript || AUFBAU_SKRIPT,
            istHartGesperrt: optionen.istHartGesperrt,
            protokoll: typeof optionen.protokoll === 'function' ? optionen.protokoll : () => {},
            grundlauf: new Map(),
            kindAktuell: null,
            isolation: { abgebrochen: false, aufruf: null, grund: null },
            zaehler: { aufrufe: 0, ausfuehrungen: 0, mutationen: 0, ablehnungen: 0, verworfeneZeilen: 0, ausfuehrungMs: 0 },
        };
        const werkzeugDir = path.join(dir, 'werkzeug');
        fs.mkdirSync(werkzeugDir, { mode: 0o755 });
        fs.copyFileSync(SELBSTMESSUNG_SKRIPT, path.join(werkzeugDir, 'ausfuehr-selbstmessung.js'));
        clusterAnlegen(id);
        return { dir, cluster: lauf.cluster, port: lauf.port, tests: tests.length, kanarie, reste };
    } catch (e) {
        if (lauf) { const l = lauf; lauf = null; aufraeumenIntern(l); } else { sperreFreigeben(halter); }
        throw e;
    }
}

function aufraeumenIntern(l) {
    let sauber = true;
    const melden = (text) => { sauber = false; console.error(`[ausfuehr-spur] AUFRAEUMFEHLER: ${text}`); };
    if (l.kindAktuell) { try { process.kill(-l.kindAktuell.pid, 'SIGKILL'); } catch (e) { /* schon weg */ } }
    if (l.cluster) {
        try { clusterEntfernen(l.version, l.cluster); } catch (e) { melden(`Cluster ${l.cluster}: ${e.message}`); }
    }
    try { fs.rmSync(l.dir, { recursive: true, force: true }); } catch (e) { melden(`${l.dir}: ${e.message}`); }
    if (fs.existsSync(l.dir)) melden(`${l.dir} existiert nach dem Entfernen noch`);
    if (l.cluster && clusterListe().some((c) => c.name === l.cluster)) melden(`Cluster ${l.cluster} steht noch in pg_lsclusters`);
    sperreFreigeben(l.halter);
    return sauber;
}

// Nach dem Lauf und bei SIGINT/SIGTERM: alles entfernen, Aufraeumfehler laut.
function aufraeumen() {
    if (!lauf) return true;
    const l = lauf;
    lauf = null;
    return aufraeumenIntern(l);
}

// ===================== Mutation =====================
function mutationsZielPruefen(datei, testdatei) {
    if (typeof datei !== 'string' || !datei) throw new Ablehnung('keine Datei angegeben');
    if (path.isAbsolute(datei) || datei.split('/').includes('..') || datei.includes('\0')) throw new Ablehnung(`unzulaessiger Pfad: ${datei}`);
    const relativ = path.posix.normalize(datei);
    if (!lauf.versioniert.has(relativ)) throw new Ablehnung(`nicht von "git ls-files" erfasst (nicht versioniert): ${relativ}`);
    if (!MUTIERBARE_ENDUNGEN.includes(path.extname(relativ))) throw new Ablehnung(`Endung nicht mutierbar (erlaubt ${MUTIERBARE_ENDUNGEN.join(' ')}): ${relativ}`);
    if (lauf.istHartGesperrt(relativ)) throw new Ablehnung(`gesperrter Dateiname (.env*/.key/.pem): ${relativ}`);
    if (NICHT_MUTIERBAR.includes(relativ)) throw new Ablehnung(`nicht mutierbar (Teil des Laufgeruests): ${relativ}`);
    if (relativ === testdatei) throw new Ablehnung(`die Testdatei selbst ist nicht mutierbar: ${relativ}`);
    const imBaum = path.join(lauf.wurzel, relativ);
    let st;
    try { st = fs.lstatSync(imBaum); } catch (e) { throw new Ablehnung(`Datei nicht gefunden: ${relativ}`); }
    if (st.isSymbolicLink() || !st.isFile()) throw new Ablehnung(`kein regulaerer Dateieintrag (Symlink?): ${relativ}`);
    if (fs.realpathSync(imBaum) !== imBaum) throw new Ablehnung(`Pfad fuehrt ueber einen Symlink: ${relativ}`);
    return relativ;
}

function fundstellenZaehlen(inhalt, alt) {
    let n = 0;
    for (let i = inhalt.indexOf(alt); i !== -1; i = inhalt.indexOf(alt, i + alt.length)) n++;
    return n;
}

function syntaxPruefen(pfad, relativ) {
    const endung = path.extname(relativ);
    if (endung === '.js' || endung === '.cjs') {
        const r = spawnSync(process.execPath, ['--check', pfad], { encoding: 'utf8', env: { PATH: KIND_PATH }, timeout: 30000 });
        if (r.status !== 0) throw new Ablehnung(`Syntaxfehler nach Mutation (node --check): ${(r.stderr || '').trim().split('\n').slice(-3).join(' | ').slice(0, 400)}`);
    } else if (endung === '.json') {
        try { JSON.parse(fs.readFileSync(pfad, 'utf8')); } catch (e) { throw new Ablehnung(`Syntaxfehler nach Mutation (JSON): ${e.message.slice(0, 200)}`); }
    } else if (endung === '.sh') {
        const r = spawnSync('bash', ['-n', pfad], { encoding: 'utf8', env: { PATH: KIND_PATH }, timeout: 30000 });
        if (r.status !== 0) throw new Ablehnung(`Syntaxfehler nach Mutation (bash -n): ${(r.stderr || '').trim().slice(0, 400)}`);
    }
    // .sql: keine Syntaxpruefung (Auftrag) — der Test entscheidet.
}

// Prueft die Mutation am unveraenderten Zielbaum (VOR dem Grundlauf, damit
// eine Ablehnung keinen Kind-Lauf kostet) und liefert den neuen Inhalt.
function mutationVorpruefen(datei, alt, neu, testdatei) {
    const relativ = mutationsZielPruefen(datei, testdatei);
    if (typeof alt !== 'string' || !alt) throw new Ablehnung('"alt" muss ein nichtleerer Text sein');
    if (typeof neu !== 'string') throw new Ablehnung('"neu" muss ein Text sein (darf leer sein)');
    const inhalt = fs.readFileSync(path.join(lauf.wurzel, relativ), 'utf8');
    const n = fundstellenZaehlen(inhalt, alt);
    if (n !== 1) throw new Ablehnung(`"alt" kommt in ${relativ} ${n}-mal vor, verlangt ist genau einmal`);
    const neuerInhalt = inhalt.replace(alt, () => neu);
    const pruefDir = path.join(lauf.dir, 'pruef');
    fs.rmSync(pruefDir, { recursive: true, force: true });
    fs.mkdirSync(pruefDir, { mode: 0o700 });
    const pruefPfad = path.join(pruefDir, 'kandidat' + path.extname(relativ));
    fs.writeFileSync(pruefPfad, neuerInhalt);
    try { syntaxPruefen(pruefPfad, relativ); } finally { fs.rmSync(pruefDir, { recursive: true, force: true }); }
    return { relativ, neuerInhalt, alt, neu };
}

// Wendet die Mutation in der frischen Kopie an: O_NOFOLLOW, genau eine
// Fundstelle (nochmals gezaehlt — die Kopie muss dem Zielbaum gleichen).
function mutationAnwenden(kopie, mutation) {
    const ziel = path.join(kopie, mutation.relativ);
    const st = fs.lstatSync(ziel);
    if (st.isSymbolicLink() || !st.isFile()) throw new Error(`Kopie: ${mutation.relativ} ist kein regulaerer Dateieintrag`);
    if (fs.realpathSync(ziel) !== ziel) throw new Error(`Kopie: ${mutation.relativ} fuehrt ueber einen Symlink`);
    const inhalt = fs.readFileSync(ziel, 'utf8');
    if (fundstellenZaehlen(inhalt, mutation.alt) !== 1) throw new Error(`Kopie: "alt" kommt in ${mutation.relativ} nicht genau einmal vor`);
    const fd = fs.openSync(ziel, fs.constants.O_WRONLY | fs.constants.O_TRUNC | fs.constants.O_NOFOLLOW);
    try { fs.writeSync(fd, inhalt.replace(mutation.alt, () => mutation.neu)); } finally { fs.closeSync(fd); }
    return sha256Datei(ziel);
}

// ===================== Ein Kind-Lauf =====================
function konfWert(wert) {
    const s = String(wert);
    if (s.includes('\'') || s.includes('\n')) throw new Error(`Laufkonfiguration: unzulaessiges Zeichen in ${JSON.stringify(s).slice(0, 80)}`);
    return `'${s}'`;
}

// Abbildung Exit-Vertrag -> Status. Reihenfolge ist Teil des Vertrags:
// timeout-Codes zuerst (124, 137), dann "Waechterdatei fehlt" (Stufen), dann
// die Teststufe. Liefert zusaetzlich, ob die Isolation als gebrochen gilt.
function statusAusExit({ code, signal, waechter, dauerMs, tSekunden }) {
    if (code === null) return { status: 'umgebung-fehler', grund: `timeout selbst durch ${signal} beendet`, isolation: false };
    if (code === 124) return { status: 'zeitlimit', grund: `timeout nach ${tSekunden} s (Exit 124)`, isolation: false };
    if (code === 137) {
        if (dauerMs >= tSekunden * 1000) return { status: 'zeitlimit', grund: `SIGKILL nach Ablauf der eigenen Uhr (${Math.round(dauerMs / 1000)} s >= ${tSekunden} s)`, isolation: false };
        return { status: 'signaltod', grund: `SIGKILL vor Ablauf des Zeitlimits (${Math.round(dauerMs / 1000)} s < ${tSekunden} s)`, isolation: false };
    }
    if (!waechter) {
        if (code === STUFE.AUFBAU) return { status: 'umgebung-fehler', grund: 'Aufbau der Sandbox gescheitert (Stufe 20)', isolation: false };
        if (code === STUFE.SELBSTMESSUNG) return { status: 'umgebung-fehler', grund: 'Selbstmessung ROT (Stufe 21)', isolation: true };
        if (code === STUFE.VORBEREITUNG) return { status: 'vorbereitung-gescheitert', grund: 'test/db-vorbereiten.js endete != 0 (Stufe 22)', isolation: false };
        if (code === STUFE.UMGEBUNG) return { status: 'umgebung-fehler', grund: 'test/umgebung.sh gescheitert (Stufe 23)', isolation: false };
        if (code === STUFE.UMGEBUNGSNAMEN) return { status: 'umgebung-fehler', grund: 'Umgebungsnamen weichen von der Literalliste ab — Werkzeug-Befund (Stufe 24)', isolation: true };
        if (code === STUFE.SIGNAL) return { status: 'umgebung-fehler', grund: 'PID 1 des Kindes bekam ein Signal (Stufe 30)', isolation: false };
        return { status: 'umgebung-fehler', grund: `Exit ${code} OHNE Waechterdatei — kein Testergebnis`, isolation: false };
    }
    if (code === 0) return { status: 'bestanden', grund: 'Teststufe Exit 0', isolation: false };
    if (code === 1) return { status: 'gescheitert', grund: 'Teststufe Exit 1', isolation: false };
    if (code === 125 || code === 126 || code === 127) return { status: 'umgebung-fehler', grund: `Teststufe Exit ${code} (Start des Programms gescheitert)`, isolation: false };
    if (code >= 129) return { status: 'signaltod', grund: `Teststufe durch Signal ${code - 128} beendet (Exit ${code})`, isolation: false };
    return { status: 'umgebung-fehler', grund: `Teststufe Exit ${code} (unbekannt, nur 0/1 sind Testergebnisse)`, isolation: false };
}

// Riegel auf jede Zeile: Trefferzeilen fallen (Marker bleibt), gezaehlt.
function ausgabeFiltern(text) {
    const zeilen = text.split('\n');
    let verworfen = 0;
    for (let i = 0; i < zeilen.length; i++) {
        const g = pruefeGeheimnisse(zeilen[i]);
        if (!g.sauber) { zeilen[i] = zeileEntferntMarker(g.treffer.map((t) => t.name).join(', ')); verworfen++; }
    }
    return { text: zeilen.join('\n'), verworfen };
}

function bytesKuerzenVorn(text, maxBytes, hinweisVorlage) {
    const buf = Buffer.from(text, 'utf8');
    if (buf.length <= maxBytes) return text;
    let schnitt = buf.length - maxBytes + 80;
    while (schnitt < buf.length && (buf[schnitt] & 0xC0) === 0x80) schnitt++;
    let ergebnis = hinweisVorlage(schnitt) + buf.subarray(schnitt).toString('utf8');
    while (Buffer.byteLength(ergebnis, 'utf8') > maxBytes) {
        schnitt += 64;
        while (schnitt < buf.length && (buf[schnitt] & 0xC0) === 0x80) schnitt++;
        ergebnis = hinweisVorlage(schnitt) + buf.subarray(schnitt).toString('utf8');
    }
    return ergebnis;
}

function bytesKuerzenHinten(text, maxBytes) {
    const buf = Buffer.from(text, 'utf8');
    if (buf.length <= maxBytes) return text;
    let schnitt = maxBytes;
    while (schnitt > 0 && (buf[schnitt] & 0xC0) === 0x80) schnitt--;
    return buf.subarray(0, schnitt).toString('utf8') + `\n[… gekuerzt: ${buf.length - schnitt} Bytes weggelassen]`;
}

// Ergebnistext fuer das Modell: Kopf (Status, Exit, Hinweise) IMMER
// vollstaendig, danach das ENDE der Ausgabe, bis MAX_ERGEBNIS_BYTES voll sind.
function ergebnisTextBauen(kopfZeilen, ausgabe) {
    const kopf = kopfZeilen.join('\n') + `\n--- Ausgabe (Ende; je Ergebnis hoechstens ${MAX_ERGEBNIS_BYTES} Bytes) ---\n`;
    const rest = MAX_ERGEBNIS_BYTES - Buffer.byteLength(kopf, 'utf8');
    if (rest <= 100) return bytesKuerzenHinten(kopf, MAX_ERGEBNIS_BYTES);
    return kopf + bytesKuerzenVorn(ausgabe, rest, (n) => `[… ${n} Bytes davor weggelassen]\n`);
}

function stufenDateiLesen(ergebnisDir, name) {
    try { return fs.readFileSync(path.join(ergebnisDir, name), 'utf8'); } catch (e) { return null; }
}

async function kindLaufen({ testdatei, mutation = null, zweck }) {
    const l = lauf;
    const kopie = path.join(l.dir, 'kopie');
    const ergebnisDir = path.join(l.dir, 'ergebnis');
    const wurzelMp = path.join(l.dir, 'wurzel');
    for (const p of [kopie, ergebnisDir, wurzelMp]) fs.rmSync(p, { recursive: true, force: true });
    fs.mkdirSync(ergebnisDir, { mode: 0o755 });
    fs.mkdirSync(wurzelMp, { mode: 0o755 });
    laufen('git', ['clone', '-q', '--no-local', '--depth', '1', l.wurzel, kopie]);
    fs.mkdirSync(path.join(kopie, 'node_modules'), { mode: 0o755 });
    let shaMutiert = '';
    if (mutation) shaMutiert = mutationAnwenden(kopie, mutation);
    const shaTest = sha256Datei(path.join(kopie, testdatei));
    laufen('chown', ['-R', `${KIND_UID}:${KIND_GID}`, kopie]);
    datenbankFrisch();
    const url = datenbankUrl();
    const konf = {
        KOPIE: kopie, NODE_MODULES: path.join(l.wurzel, 'node_modules'), WERKZEUG: path.join(l.dir, 'werkzeug'),
        ERGEBNIS: ergebnisDir, PG: l.pgDir, BROWSER: l.browser, NODE_BIN: l.nodeBin,
        TESTDATEI: testdatei, MUTIERTE_DATEI: mutation ? mutation.relativ : '', SHA_TESTDATEI: shaTest, SHA_MUTIERT: shaMutiert,
        DATABASE_URL: url, ORIGINALWURZEL: l.wurzel, PROXY_HOST: l.proxy.host, PROXY_PORT: l.proxy.port, T_SEKUNDEN: l.tSekunden,
    };
    fs.writeFileSync(path.join(l.dir, 'werkzeug', 'lauf.conf'),
        Object.entries(konf).map(([k, v]) => `${k}=${konfWert(v)}`).join('\n') + '\n', { mode: 0o644 });

    const start = Date.now();
    const kind = spawn('timeout', ['-k', String(KILL_NACH_SEKUNDEN), String(l.tSekunden),
        'unshare', '--mount', '--net', '--pid', '--ipc', '--uts', '--fork', '--kill-child', '--mount-proc',
        'bash', l.aufbauSkript, l.dir],
    { env: { PATH: KIND_PATH }, stdio: ['ignore', 'pipe', 'pipe'], detached: true, cwd: l.dir });
    l.kindAktuell = kind;
    const stuecke = [];
    let erfasst = 0;
    let erfassungVerworfen = 0;
    const sammeln = (stueck) => {
        if (erfasst + stueck.length <= MAX_ERFASSUNG_BYTES) { stuecke.push(stueck); erfasst += stueck.length; } else { erfassungVerworfen += stueck.length; }
    };
    kind.stdout.on('data', sammeln);
    kind.stderr.on('data', sammeln);
    const { code, signal } = await new Promise((erfuellen) => {
        let fertig = false;
        let ergebnis = null;
        const abschliessen = () => { if (fertig) return; fertig = true; erfuellen(ergebnis); };
        kind.on('exit', (c, s) => {
            ergebnis = { code: c, signal: s };
            // close folgt, sobald die Pipes zu sind; stirbt PID 1 des Kindes,
            // toetet der Kernel den ganzen Namensraum — ein Nachzuegler an
            // den Pipes kann es dann nicht mehr geben. Sicherheitsnetz 10 s.
            setTimeout(() => { try { kind.stdout.destroy(); kind.stderr.destroy(); } catch (e) { /* egal */ } abschliessen(); }, 10000).unref();
        });
        kind.on('close', () => { if (!ergebnis) ergebnis = { code: null, signal: 'unbekannt' }; abschliessen(); });
        kind.on('error', (e) => { ergebnis = { code: null, signal: `spawn-fehler: ${e.message}` }; abschliessen(); });
    });
    const dauerMs = Date.now() - start;
    l.kindAktuell = null;
    l.zaehler.ausfuehrungen++;
    l.zaehler.ausfuehrungMs += dauerMs;

    const waechter = fs.existsSync(path.join(ergebnisDir, 'test-gestartet'));
    const abbildung = statusAusExit({ code, signal, waechter, dauerMs, tSekunden: l.tSekunden });
    const roh = Buffer.concat(stuecke).toString('utf8');
    const markerPos = roh.indexOf(TESTSTART_MARKER);
    const testAusgabeRoh = markerPos === -1 ? '' : roh.slice(roh.indexOf('\n', markerPos) + 1);
    const gefiltert = ausgabeFiltern(roh);
    l.zaehler.verworfeneZeilen += gefiltert.verworfen;
    const selbstmessung = stufenDateiLesen(ergebnisDir, 'selbstmessung.txt');
    const selbstmessungZeile = selbstmessung ? (selbstmessung.trim().split('\n').pop() || '') : '(keine Selbstmessungsdatei)';
    const hinweise = [];
    if (gefiltert.verworfen) hinweise.push(`ausgabe-verworfen: ${gefiltert.verworfen} Zeile(n) durch den Geheimnis-Riegel entfernt (Status bleibt)`);
    if (erfassungVerworfen) hinweise.push(`Erfassungsdeckel gerissen: ${erfassungVerworfen} Bytes der Ausgabe nicht erfasst (Status bleibt)`);
    const ergebnis = {
        status: abbildung.status,
        grund: abbildung.grund,
        isolationGebrochen: abbildung.isolation,
        exit: code,
        signal,
        waechter,
        dauerMs,
        testdatei,
        mutation: mutation ? { datei: mutation.relativ, alt: mutation.alt, neu: mutation.neu } : null,
        hinweise,
        selbstmessungZeile,
        ausgabe: gefiltert.text,
        testAusgabe: testAusgabeRoh,
        hatPass: PASS_MUSTER.test(testAusgabeRoh),
        hatSkip: SKIP_MUSTER.test(testAusgabeRoh),
        protokoll: {
            typ: 'ausfuehrung', zweck, testdatei, mutation: mutation ? { datei: mutation.relativ, alt: mutation.alt, neu: mutation.neu } : null,
            status: abbildung.status, grund: abbildung.grund, exit: code, signal, waechter, dauerMs,
            stufen: {
                selbstmessung: bytesKuerzenHinten(selbstmessung || '', 64 * 1024),
                vorbereiten: bytesKuerzenHinten(stufenDateiLesen(ergebnisDir, 'vorbereiten.txt') || '', 64 * 1024),
                umgebung: bytesKuerzenHinten(stufenDateiLesen(ergebnisDir, 'umgebung.txt') || '', 16 * 1024),
                testExit: (stufenDateiLesen(ergebnisDir, 'test-exit') || '').trim(),
            },
            erfassungVerworfenBytes: erfassungVerworfen,
            riegelZeilen: gefiltert.verworfen,
            ausgabe: bytesKuerzenHinten(gefiltert.text, MAX_PROTOKOLL_BYTES - 2048),
        },
    };
    ergebnis.gueltigerGrundlauf = ergebnis.status === 'bestanden' && ergebnis.hatPass && !ergebnis.hatSkip;
    for (const p of [kopie, ergebnisDir, wurzelMp]) fs.rmSync(p, { recursive: true, force: true });
    l.protokoll(ergebnis.protokoll);
    if (abbildung.isolation) isolationAbbrechen(abbildung.grund);
    return ergebnis;
}

function isolationAbbrechen(grund) {
    if (lauf.isolation.abgebrochen) return;
    lauf.isolation = { abgebrochen: true, aufruf: lauf.zaehler.aufrufe, grund };
    console.error(`[ausfuehr-spur] ISOLATIONSABBRUCH nach Aufruf ${lauf.zaehler.aufrufe}: ${grund} — keine Ausfuehrung mehr.`);
}

// ===================== Werkzeuge =====================
function ablehnen(text) {
    lauf.zaehler.ablehnungen++;
    return { text: `abgelehnt: ${text}`, abgelehnt: true, status: 'abgelehnt' };
}

function deckelPruefen() {
    if (lauf.isolation.abgebrochen) return `${abbruchMarker()}`;
    if (lauf.zaehler.aufrufe > MAX_AUFRUFE) return `Deckel: hoechstens ${MAX_AUFRUFE} Ausfuehrungs-Aufrufe je Lauf (dies war Nr. ${lauf.zaehler.aufrufe})`;
    if (lauf.zaehler.ausfuehrungMs >= MAX_AUSFUEHRUNGSZEIT_MS) return `Deckel: ${MAX_AUSFUEHRUNGSZEIT_MS / 60000} min Ausfuehrungszeit je Lauf erreicht`;
    return null;
}

function testdateiPruefen(testdatei) {
    if (typeof testdatei !== 'string' || !testdatei) return 'keine Testdatei angegeben';
    if (!lauf.tests.includes(testdatei)) return `"${testdatei}" ist nicht in der TESTS=(-Liste von test/run.sh registriert`;
    return null;
}

async function kanarieSicherstellen() {
    const k = lauf.kanarie;
    if (k.gefahren) return k.gruen;
    k.gefahren = true;
    console.error(`[ausfuehr-spur] Kanarie: Selbstmessung + ${k.datei}`);
    const r = await kindLaufen({ testdatei: k.datei, zweck: 'kanarie' });
    k.ergebnis = r;
    k.gruen = r.gueltigerGrundlauf;
    if (!k.gruen) isolationAbbrechen(`Kanarie ${k.datei} nicht gruen: ${r.status} (${r.grund}; PASS-Zeile ${r.hatPass}, Uebersprungen-Zeile ${r.hatSkip})`);
    else console.error(`[ausfuehr-spur] Kanarie gruen: ${r.selbstmessungZeile}; ${k.datei} ${r.status}`);
    return k.gruen;
}

function ergebnisObjekt(r, zusatzKopf = []) {
    const kopf = [
        `status: ${r.status}`,
        r.exit === null ? `signal: ${r.signal}` : `exit: ${r.exit}`,
        `grund: ${r.grund}`,
        `testdatei: ${r.testdatei}`,
        r.mutation ? `mutation: ${r.mutation.datei} (genau eine Fundstelle ersetzt)` : 'mutation: keine',
        `selbstmessung: ${r.selbstmessungZeile}`,
        ...zusatzKopf,
        ...r.hinweise.map((h) => `hinweis: ${h}`),
    ];
    return { text: ergebnisTextBauen(kopf, r.ausgabe), abgelehnt: false, status: r.status, protokoll: r.protokoll };
}

async function werkzeugTeste(argumente) {
    lauf.zaehler.aufrufe++;
    const deckel = deckelPruefen();
    if (deckel) return ablehnen(deckel);
    const fehler = testdateiPruefen(argumente.testdatei);
    if (fehler) return ablehnen(fehler);
    if (!await kanarieSicherstellen()) return ablehnen(abbruchMarker());
    const r = await kindLaufen({ testdatei: argumente.testdatei, zweck: 'teste' });
    if (!lauf.grundlauf.has(argumente.testdatei)) lauf.grundlauf.set(argumente.testdatei, r);
    return ergebnisObjekt(r);
}

async function werkzeugMutiereUndTeste(argumente) {
    lauf.zaehler.aufrufe++;
    const deckel = deckelPruefen();
    if (deckel) return ablehnen(deckel);
    const fehler = testdateiPruefen(argumente.testdatei);
    if (fehler) return ablehnen(fehler);
    let mutation;
    try {
        mutation = mutationVorpruefen(argumente.datei, argumente.alt, argumente.neu, argumente.testdatei);
    } catch (e) {
        if (e instanceof Ablehnung) return ablehnen(e.message);
        throw e;
    }
    if (!await kanarieSicherstellen()) return ablehnen(abbruchMarker());
    let grundlauf = lauf.grundlauf.get(argumente.testdatei);
    let grundlaufHerkunft = 'aus dem Zwischenspeicher dieses Laufs';
    if (!grundlauf) {
        if (deckelPruefen()) return ablehnen(deckelPruefen());
        grundlauf = await kindLaufen({ testdatei: argumente.testdatei, zweck: 'grundlauf' });
        lauf.grundlauf.set(argumente.testdatei, grundlauf);
        grundlaufHerkunft = 'in diesem Aufruf gefahren';
        if (grundlauf.isolationGebrochen) return ablehnen(abbruchMarker());
    }
    if (grundlauf.status !== 'bestanden') {
        return ergebnisObjekt({ ...grundlauf, status: 'grundlauf-rot', grund: `Grundlauf (${grundlaufHerkunft}) war ${grundlauf.status}: ${grundlauf.grund} — keine Mutation gefahren` },
            [`mutation-angefragt: ${mutation.relativ} (nicht gefahren)`]);
    }
    if (!grundlauf.gueltigerGrundlauf) {
        return ergebnisObjekt({ ...grundlauf, status: 'grundlauf-unvollstaendig', grund: `Grundlauf (${grundlaufHerkunft}) bestanden, aber PASS-Zeile ${grundlauf.hatPass ? 'vorhanden' : 'FEHLT'}, Uebersprungen-/NICHT-GEPRUEFT-Zeile ${grundlauf.hatSkip ? 'VORHANDEN' : 'keine'} — keine Mutation gefahren` },
            [`mutation-angefragt: ${mutation.relativ} (nicht gefahren)`]);
    }
    if (deckelPruefen()) return ablehnen(deckelPruefen());
    lauf.zaehler.mutationen++;
    const r = await kindLaufen({ testdatei: argumente.testdatei, mutation, zweck: 'mutation' });
    return ergebnisObjekt(r, [`grundlauf: bestanden, gueltig (${grundlaufHerkunft})`]);
}

// Dispatch fuer gegenleser-repo.js: liefert eine Promise (die Sync-Werkzeuge
// suche/lies bleiben dort synchron; main() wartet auf beides mit await).
function werkzeugAufrufen(name, argumente) {
    if (!lauf) return Promise.resolve({ text: `abgelehnt: Ausfuehrung nicht eingerichtet (kein --ausfuehren)`, abgelehnt: true, status: 'abgelehnt' });
    if (name === 'teste') return werkzeugTeste(argumente || {});
    if (name === 'mutiere_und_teste') return werkzeugMutiereUndTeste(argumente || {});
    return Promise.resolve({ text: `abgelehnt: unbekanntes Ausfuehrungswerkzeug "${name}"`, abgelehnt: true, status: 'abgelehnt' });
}

// ===================== Vorspann und Zusammenfassung =====================
function vorspannAbsatz() {
    const katalog = Object.entries(STATUS_KATALOG).map(([k, v]) => `  - ${k}: ${v}`).join('\n');
    return 'DU HAST ZUSAETZLICH ZWEI AUSFUEHRENDE WERKZEUGE: teste(testdatei) und '
        + 'mutiere_und_teste(datei, alt, neu, testdatei). Beide laufen in einer Wegwerfkopie des Repos in einer '
        + 'Sandbox (kein Netz, unprivilegiert, eigene frische Datenbank je Lauf), wie das CI-Gate (CI=true, TZ=UTC). '
        + `Hoechstens ${MAX_AUFRUFE} solcher Aufrufe und ${MAX_AUSFUEHRUNGSZEIT_MS / 60000} Minuten Ausfuehrungszeit je Lauf, `
        + `${T_SEKUNDEN} s je Testlauf. Du bekommst je Ergebnis status, exit und das ENDE der Ausgabe (hoechstens ${MAX_ERGEBNIS_BYTES} Bytes). `
        + 'Der Status kommt aus dem Exit-Code der Teststufe, nie aus dem Ausgabetext. Bedeutung:\n' + katalog + '\n'
        + 'NUR "gescheitert" nach gueltigem Grundlauf heisst "Verhaltensaenderung des Testlaufs". Eine Mutation, die '
        + '"bestanden" bleibt, ist eine Zusicherung, die nicht faellt — das ist der Befund, den du suchst (Pruefpunkt 2). '
        + 'Waehle Mutationen gezielt (eine Zeile, eine Bedeutung) und die Testdatei, die genau diese Stelle bewachen soll.';
}

function zusammenfassungZeilen() {
    if (!lauf) return [];
    const z = lauf.zaehler;
    const zeilen = [`Ausfuehrungen: ${z.ausfuehrungen}  Mutationen: ${z.mutationen}  Ausfuehrungs-Aufrufe: ${z.aufrufe}  Ausfuehrungs-Ablehnungen: ${z.ablehnungen}  verworfene Zeilen (Riegel): ${z.verworfeneZeilen}  Ausfuehrungszeit: ${Math.round(z.ausfuehrungMs / 1000)} s`];
    zeilen.push(`Kanarie: ${lauf.kanarie.datei} — ${lauf.kanarie.gefahren ? (lauf.kanarie.gruen ? 'gruen' : 'NICHT GRUEN') : 'nicht gefahren (kein Ausfuehrungsaufruf)'}`);
    if (lauf.isolation.abgebrochen) zeilen.push(abbruchMarker());
    return zeilen;
}

function protokollMaterialZusatz() {
    if (!lauf) return '';
    const z = lauf.zaehler;
    return `, Ausfuehrungen ${z.ausfuehrungen}, Mutationen ${z.mutationen}, Ausfuehrungs-Ablehnungen ${z.ablehnungen}`;
}

// ===================== SELBSTTEST DER MECHANIK (root, eigener Cluster) =====================
// Baut eine Fixture-Wurzel (git-Repo mit test/run.sh, test/umgebung.sh,
// test/db-vorbereiten.js und Testdateien, die je einen Status erzwingen) und
// faehrt jedes Werkzeug echt — jeder Status, jede Ablehnung, jeder Deckel mit
// ROT/GRUEN-Fall. "pruefen(bezeichnung, bedingung)" kommt vom Aufrufer
// (gegenleser-repo.js --selbsttest-ausfuehrung), der die literale Fallzahl haelt.
function fixtureAnlegen(basis) {
    const w = path.join(basis, 'fixture-wurzel');
    fs.mkdirSync(w, { recursive: true });
    const g = (args) => laufen('git', args, { cwd: w });
    g(['init', '-q']);
    g(['config', 'user.email', 'selbsttest@example.invalid']);
    g(['config', 'user.name', 'Selbsttest']);
    const schreiben = (rel, inhalt, modus) => {
        const p = path.join(w, rel);
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, inhalt, { mode: modus || 0o644 });
    };
    const ok = "let pass = 0, fail = 0;\nconst ok = (n, c, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ FAIL: ' + n + (d === undefined ? '' : ' ' + JSON.stringify(d))); } };\nconst schluss = () => { console.log(`──────────── ${pass} PASS / ${fail} FAIL ────────────`); process.exitCode = fail ? 1 : 0; };\n";
    schreiben('test/run.sh', '#!/usr/bin/env bash\n# Fixture des Selbsttests der ausfuehrenden Spur — nur die TESTS=(-Liste wird gelesen.\nset -uo pipefail\nTESTS=(\n  test_kanarie_static.js\n  test_gruen.js   # Kommentar hinter dem Eintrag\n  test_rot.js\n  test_schlaeft.js\n  test_signal.js\n  test_ohne_pass.js\n  test_skip.js\n  test_exit2.js\n  test_exit127.js\n  test_zustand.js\n  test_umgebung.js\n  test_geheimnis.js\n  test_laut.js\n)\nfor t in "${TESTS[@]}"; do node "$t"; done\n');
    schreiben('test/umgebung.sh', [
        '# shellcheck shell=bash',
        '# Fixture: derselbe Vertrag wie test/umgebung.sh des Zielrepos (sourcen, cwd = Wurzel, DATABASE_URL nur lesen, Name auf _test/_e2e).',
        'if ! (return 0 2>/dev/null); then echo "  ✗ nur zum Sourcen"; exit 1; fi',
        'if [ ! "$PWD/test/umgebung.sh" -ef "${BASH_SOURCE[0]}" ]; then echo "  ✗ cwd ist nicht die Wurzel"; return 1; fi',
        '_u="${DATABASE_URL:-}"; _u="${_u%%#*}"; _u="${_u%%\\?*}"',
        'case "$_u" in *://*/*) _db="${_u##*/}" ;; *) _db="" ;; esac',
        'case "$_db" in *_test|*_e2e) ;; *) echo "  ✗ DATABASE_URL nennt keine Wegwerf-DB (${_db})"; unset _u _db; return 1 ;; esac',
        'unset _u _db',
        'if grep -q "schalter: 1" test/umgebung-schalter.js; then echo "  ✗ Schalter verlangt Abbruch"; return 1; fi',
        'export PUBLIC_BASE_DOMAIN="gymdocu.de,gymdocu.test"',
        'export GYMDOCU_BOOT_SMOKE_STARTPFAD=1',
        'for _v in PDF_ROOT BELEHRUNGEN_UPLOAD_DIR DOKUMENTE_DIR LAGEPLAN_UPLOAD_DIR EINWEISUNG_NACHWEIS_DIR PRUEFBERICHT_DIR DEFECT_PHOTO_DIR EXPORT_DIR OFFBOARDING_QUEUE_DIR; do',
        '  _d=$(mktemp -d /tmp/gymdocu-suite-fixture.XXXXXX) || { echo "  ✗ mktemp"; return 1; }',
        '  export "$_v=$_d"',
        'done',
        'unset _v _d',
        '_q=$(mktemp -d /tmp/gymdocu-suite-qr.XXXXXX) || return 1',
        'export QR_VERBRAUCH="$_q/qr-verbrauch.jsonl"; unset _q',
        'export NODE_OPTIONS="--require $PWD/test/vorlade.js${NODE_OPTIONS:+ $NODE_OPTIONS}"',
        'if grep -q "extra: 1" test/umgebung-schalter.js; then export EXTRA_DSV1=1; fi',
        '',
    ].join('\n'));
    schreiben('test/umgebung-schalter.js', '// Fixture-Schalter, per Mutation umlegbar\n// schalter: 0\n// extra: 0\nmodule.exports = 0;\n');
    schreiben('test/vorlade.js', 'globalThis.dsv1Vorgeladen = true;\n');
    schreiben('lib/schema.js', "module.exports = 'CREATE TABLE IF NOT EXISTS vorbereitet(a int)';\n");
    schreiben('test/db-vorbereiten.js', "'use strict';\nconst { spawnSync } = require('node:child_process');\nconst sql = require('../lib/schema');\nconst r = spawnSync('psql', [process.env.DATABASE_URL, '-X', '-v', 'ON_ERROR_STOP=1', '-c', sql], { encoding: 'utf8' });\nif (r.status !== 0) { console.error(r.stderr || r.error); process.exitCode = 1; }\n");
    schreiben('lib/wert.js', 'module.exports = 42;\n');
    schreiben('lib/doppelt.js', 'const a = 7;\nconst b = 7;\nmodule.exports = a + b;\n');
    schreiben('daten.json', '{ "zahl": 1 }\n');
    schreiben('ops/skript.sh', '#!/bin/sh\necho hallo\n', 0o755);
    schreiben('abfrage.sql', 'SELECT 1;\n');
    schreiben('README.md', '# Fixture\n');
    schreiben('.env.beispiel', 'BEISPIEL=1\n');
    schreiben('.gitignore', 'node_modules/\n');
    schreiben('test_kanarie_static.js', "console.log('  ✓ Kanarie lebt');\nconsole.log('1 PASS / 0 FAIL');\n");
    schreiben('test_gruen.js', ok + "const w = require('./lib/wert');\nok('lib/wert.js liefert 42', w === 42, w);\nschluss();\n");
    schreiben('test_rot.js', ok + "ok('faellt absichtlich', false);\nschluss();\n");
    schreiben('test_schlaeft.js', "console.log('schlafe ewig');\nsetInterval(() => {}, 1000);\n");
    schreiben('test_signal.js', "console.log('  ✓ vor dem Signal');\nprocess.kill(process.pid, 'SIGSEGV');\nsetInterval(() => {}, 1000);\n");
    schreiben('test_ohne_pass.js', "console.log('nichts zugesichert, Exit 0');\n");
    schreiben('test_skip.js', "console.log('  ✓ eins');\nconsole.log('  ⤳ SKIP (2): zwei — sudo -u nobody in dieser Umgebung nicht verfuegbar');\nconsole.log('──────────── 1 PASS / 0 FAIL / 2 ÜBERSPRUNGEN ────────────');\n");
    schreiben('test_exit2.js', "console.log('  ✓ x');\nprocess.exit(2);\n");
    schreiben('test_exit127.js', "process.exit(127);\n");
    schreiben('test_zustand.js', ok + "const fs = require('node:fs');\nconst { spawnSync } = require('node:child_process');\nconst spuren = ['zustand-in-der-kopie.txt', '/var/tmp/dsv1-zustand.txt', '/tmp/dsv1-zustand.txt', '/dev/shm/dsv1-zustand.txt'];\nfor (const s of spuren) ok('keine Spur aus einem frueheren Lauf: ' + s, !fs.existsSync(s));\nconst z = (sql) => spawnSync('psql', [process.env.DATABASE_URL, '-X', '-tA', '-c', sql], { encoding: 'utf8' });\nok('keine Tabelle zustand aus einem frueheren Lauf', z(\"SELECT count(*) FROM pg_tables WHERE tablename = 'zustand'\").stdout.trim() === '0');\nfor (const s of spuren) fs.writeFileSync(s, 'dsv1');\nok('Tabelle zustand angelegt', z('CREATE TABLE zustand(a int)').status === 0);\nok('Positivkontrolle: im selben Lauf sind die Spuren jetzt da', spuren.every((s) => fs.existsSync(s)) && z(\"SELECT count(*) FROM pg_tables WHERE tablename = 'zustand'\").stdout.trim() === '1');\nschluss();\n");
    schreiben('test_umgebung.js', ok + "const namen = Object.keys(process.env).sort();\nconst soll = ['BELEHRUNGEN_UPLOAD_DIR','CI','DATABASE_URL','DEFECT_PHOTO_DIR','DOKUMENTE_DIR','EINWEISUNG_NACHWEIS_DIR','EXPORT_DIR','GYMDOCU_BOOT_SMOKE_STARTPFAD','HOME','LAGEPLAN_UPLOAD_DIR','NODE_OPTIONS','OFFBOARDING_QUEUE_DIR','PATH','PDF_ROOT','PLAYWRIGHT_BROWSERS_PATH','PRUEFBERICHT_DIR','PUBLIC_BASE_DOMAIN','QR_VERBRAUCH','SESSION_SECRET','TZ'];\nok('Umgebungsnamen = Literalliste', JSON.stringify(namen) === JSON.stringify(soll), namen);\nok('CI=true, TZ=UTC, HOME=/tmp', process.env.CI === 'true' && process.env.TZ === 'UTC' && process.env.HOME === '/tmp');\nok('SESSION_SECRET ist das CI-Literal', process.env.SESSION_SECRET === 'ci-isolation-session-secret-0123456789abcdef');\nok('DATABASE_URL zeigt auf den Socket-Ordner /dsv1/pg und gymdocu_test und ist fuer new URL() gueltig', /^postgresql:\\/\\/nobody@localhost\\/gymdocu_test\\?host=\\/dsv1\\/pg&port=\\d+$/.test(process.env.DATABASE_URL) && new URL(process.env.DATABASE_URL).pathname === '/gymdocu_test', process.env.DATABASE_URL);\nok('Vorladung ueber NODE_OPTIONS wirkt', globalThis.dsv1Vorgeladen === true);\nok('PDF_ROOT liegt unter /tmp/gymdocu-suite-', String(process.env.PDF_ROOT).startsWith('/tmp/gymdocu-suite-'));\nok('cwd ist /dsv1/kopie', process.cwd() === '/dsv1/kopie');\nschluss();\n");
    schreiben('test_geheimnis.js', ok + "console.log('token = \"' + 'gh' + 'p_' + 'X'.repeat(36) + '\"');\nok('eine Zeile mit Attrappe ausgegeben', true);\nschluss();\n");
    schreiben('test_laut.js', ok + "for (let i = 0; i < 2000; i++) console.log('Zeile ' + String(i).padStart(5, '0') + ' ' + 'x'.repeat(50));\nok('laut, aber gruen', true);\nschluss();\n");
    fs.symlinkSync('lib/wert.js', path.join(w, 'zeiger.js'));
    fs.mkdirSync(path.join(w, 'node_modules'));
    fs.writeFileSync(path.join(w, 'node_modules', 'README'), 'leer\n');
    g(['add', '-A']);
    g(['commit', '-q', '-m', 'Fixture']);
    // ERST NACH dem Commit angelegt und per .gitignore verdeckt: eine Datei,
    // die "git ls-files" nicht kennt (git status bleibt sauber).
    fs.appendFileSync(path.join(w, '.git', 'info', 'exclude'), 'nicht_versioniert.js\n');
    fs.writeFileSync(path.join(w, 'nicht_versioniert.js'), 'module.exports = 0;\n');
    // Browser-Attrappe: ein ausfuehrbares Programm an der Stelle, an der die
    // Selbstmessung eines sucht.
    const browser = path.join(basis, 'browser', 'chromium-9999', 'chrome-linux');
    fs.mkdirSync(browser, { recursive: true });
    fs.writeFileSync(path.join(browser, 'chrome'), '#!/bin/sh\necho chrome-attrappe\n', { mode: 0o755 });
    return { wurzel: w, browser: path.join(basis, 'browser') };
}

async function selbsttestSpur(pruefen) {
    const basis = fs.mkdtempSync(path.join(os.tmpdir(), 'ausfuehr-spur-selbsttest-'));
    fs.chmodSync(basis, 0o755);
    const alteUmgebung = process.env.PLAYWRIGHT_BROWSERS_PATH;
    const alteTz = process.env.TZ;
    const istHartGesperrt = (p) => path.basename(p).startsWith('.env') || p.endsWith('.key') || p.endsWith('.pem');
    const protokollEintraege = [];
    const T_KURZ = 8;
    let fx;
    try {
        fx = fixtureAnlegen(basis);
        process.env.PLAYWRIGHT_BROWSERS_PATH = fx.browser;
        // Zeitzonen-Gegenprobe (Auftrag §2): der Elternprozess steht auf
        // Europe/Berlin — das Kind muss trotzdem UTC melden (Allowlist, kein Erbe).
        process.env.TZ = 'Europe/Berlin';

        // ----- Einrichten, Sperre, Kanarie -----
        const e1 = await einrichten({ wurzel: fx.wurzel, istHartGesperrt, tSekunden: T_KURZ, protokoll: (p) => protokollEintraege.push(p) });
        pruefen(`EINRICHTEN (Cluster ${e1.cluster} online auf Port ${e1.port}, ${e1.tests} registrierte Tests, Kanarie ${e1.kanarie} = erste *_static.js)`,
            clusterListe().some((c) => c.name === e1.cluster && c.status === 'online') && e1.tests === 13 && e1.kanarie === 'test_kanarie_static.js');
        const belegt = spawnSync('flock', ['-n', '-E', '75', SPERRDATEI, 'true'], { env: { PATH: KIND_PATH } });
        pruefen(`SPERRE BELEGT waehrend des Laufs (flock -n auf ${SPERRDATEI} liefert 75: ${belegt.status})`, belegt.status === 75);
        pruefen('TESTLISTE gelesen, nicht gestartet (Kommentar hinter dem Eintrag entfernt, Reihenfolge erhalten)',
            lauf.tests[1] === 'test_gruen.js' && lauf.tests[lauf.tests.length - 1] === 'test_laut.js');
        pruefen('WERKZEUGNAMEN der Definition sind teste und mutiere_und_teste', WERKZEUGE_AUSFUEHRUNG.map((w) => w.name).join(',') === 'teste,mutiere_und_teste');

        const t1 = await werkzeugAufrufen('teste', { testdatei: 'test_gruen.js' });
        pruefen(`TESTE GRUEN: status bestanden, exit 0, Kanarie vorher gefahren (Ausfuehrungen ${zaehler().ausfuehrungen}); Text: ${t1.text.split('\n')[0]}`,
            t1.status === 'bestanden' && /^status: bestanden\nexit: 0\n/.test(t1.text) && lauf.kanarie.gruen && zaehler().ausfuehrungen === 2);
        pruefen('KANARIE: Selbstmessung im Kind restlos gruen (Zeile "SELBSTMESSUNG: N ✓ / 0 ✗")',
            /^SELBSTMESSUNG: \d+ ✓ \/ 0 ✗$/.test(lauf.kanarie.ergebnis.selbstmessungZeile) && lauf.kanarie.ergebnis.protokoll.stufen.selbstmessung.includes('Zeitzone des Node-Prozesses = UTC'));
        pruefen('ERGEBNIS traegt die PASS-Zeile der Teststufe und die Selbstmessungszeile im Kopf',
            t1.text.includes('1 PASS / 0 FAIL') && /\nselbstmessung: SELBSTMESSUNG: \d+ ✓ \/ 0 ✗\n/.test(t1.text));
        pruefen('PROTOKOLL: Eintrag je Ausfuehrung mit typ, status, stufen und Volltext',
            protokollEintraege.length === 2 && protokollEintraege.every((p) => p.typ === 'ausfuehrung' && typeof p.ausgabe === 'string' && p.stufen && p.stufen.selbstmessung.includes('✓')));

        // ----- Grundlauf-Zwischenspeicher und Mutation -----
        const m1 = await werkzeugAufrufen('mutiere_und_teste', { datei: 'lib/wert.js', alt: '42', neu: '43', testdatei: 'test_gruen.js' });
        pruefen(`MUTATION FAENGT: 42->43 in lib/wert.js, test_gruen.js gescheitert (exit 1), Grundlauf aus dem Zwischenspeicher, Mutationen ${zaehler().mutationen}`,
            m1.status === 'gescheitert' && /^status: gescheitert\nexit: 1\n/.test(m1.text) && m1.text.includes('grundlauf: bestanden, gueltig (aus dem Zwischenspeicher') && zaehler().mutationen === 1 && zaehler().ausfuehrungen === 3);
        pruefen('MUTATION: Ausgabe der Teststufe nennt die gefallene Zusicherung', m1.text.includes('✗ FAIL: lib/wert.js liefert 42 43'));
        const m2 = await werkzeugAufrufen('mutiere_und_teste', { datei: 'lib/wert.js', alt: '42', neu: '42', testdatei: 'test_gruen.js' });
        pruefen('MUTATION OHNE WIRKUNG (42->42) bleibt bestanden — die Kopie war frisch, die Mutation von eben ist weg', m2.status === 'bestanden');
        const m3 = await werkzeugAufrufen('mutiere_und_teste', { datei: 'lib/wert.js', alt: '42', neu: '43', testdatei: 'test_rot.js' });
        pruefen('GRUNDLAUF-ROT: Testdatei faellt unmutiert -> status grundlauf-rot, keine Mutation gefahren',
            m3.status === 'grundlauf-rot' && m3.text.includes('mutation-angefragt: lib/wert.js (nicht gefahren)') && zaehler().mutationen === 2);
        const m4 = await werkzeugAufrufen('mutiere_und_teste', { datei: 'lib/wert.js', alt: '42', neu: '43', testdatei: 'test_ohne_pass.js' });
        pruefen('GRUNDLAUF-UNVOLLSTAENDIG: Exit 0 ohne PASS-Zeile -> keine Mutation', m4.status === 'grundlauf-unvollstaendig' && m4.text.includes('PASS-Zeile FEHLT'));
        const m5 = await werkzeugAufrufen('mutiere_und_teste', { datei: 'lib/wert.js', alt: '42', neu: '43', testdatei: 'test_skip.js' });
        pruefen('GRUNDLAUF-UNVOLLSTAENDIG: "⤳ SKIP (2)" und "2 ÜBERSPRUNGEN" bei Exit 0 -> keine Mutation', m5.status === 'grundlauf-unvollstaendig' && m5.text.includes('Uebersprungen-/NICHT-GEPRUEFT-Zeile VORHANDEN'));
        pruefen('SKIP-MUSTER: "0 ÜBERSPRUNGEN" ist KEIN Ueberspringen, "⤳ SKIP (1):" und "NICHT GEPRÜFT" sind es',
            !SKIP_MUSTER.test('──── 3 PASS / 0 FAIL / 0 ÜBERSPRUNGEN ────') && SKIP_MUSTER.test('  ⤳ SKIP (1): x') && SKIP_MUSTER.test('  ✗ NICHT GEPRÜFT: y') && SKIP_MUSTER.test('3 PASS, 0 FAIL, 4 übersprungen'));
        pruefen('PASS-MUSTER: "✓" und "1 PASS /" treffen, "PASSWORT" nicht', PASS_MUSTER.test('  ✓ x') && PASS_MUSTER.test('1 PASS / 0 FAIL') && !PASS_MUSTER.test('PASSWORT=geheim'));

        // ----- Ablehnungen (kein Kind-Lauf) -----
        const vorher = zaehler().ausfuehrungen;
        const ablehnungen = [
            ['Testdatei nicht registriert', { datei: 'lib/wert.js', alt: '42', neu: '43', testdatei: 'lib/wert.js' }, 'nicht in der TESTS=(-Liste'],
            ['0 Fundstellen', { datei: 'lib/wert.js', alt: '999', neu: '1', testdatei: 'test_gruen.js' }, '0-mal vor'],
            ['2 Fundstellen', { datei: 'lib/doppelt.js', alt: '7', neu: '8', testdatei: 'test_gruen.js' }, '2-mal vor'],
            ['Mutationsziel = Testdatei', { datei: 'test_gruen.js', alt: '42', neu: '43', testdatei: 'test_gruen.js' }, 'Testdatei selbst ist nicht mutierbar'],
            ['test/umgebung.sh', { datei: 'test/umgebung.sh', alt: 'export', neu: 'x', testdatei: 'test_gruen.js' }, 'nicht mutierbar (Teil des Laufgeruests)'],
            ['test/run.sh', { datei: 'test/run.sh', alt: 'TESTS=(', neu: 'x', testdatei: 'test_gruen.js' }, 'nicht mutierbar (Teil des Laufgeruests)'],
            ['test/db-vorbereiten.js', { datei: 'test/db-vorbereiten.js', alt: 'psql', neu: 'x', testdatei: 'test_gruen.js' }, 'nicht mutierbar (Teil des Laufgeruests)'],
            ['hart gesperrt (.env.beispiel, versioniert)', { datei: '.env.beispiel', alt: '1', neu: '2', testdatei: 'test_gruen.js' }, 'Endung nicht mutierbar'],
            ['nicht versioniert', { datei: 'nicht_versioniert.js', alt: '0', neu: '1', testdatei: 'test_gruen.js' }, 'nicht versioniert'],
            ['Pfad mit ..', { datei: '../etc/passwd', alt: 'root', neu: 'x', testdatei: 'test_gruen.js' }, 'unzulaessiger Pfad'],
            ['absoluter Pfad', { datei: '/etc/passwd', alt: 'root', neu: 'x', testdatei: 'test_gruen.js' }, 'unzulaessiger Pfad'],
            ['Endung .md', { datei: 'README.md', alt: 'Fixture', neu: 'x', testdatei: 'test_gruen.js' }, 'Endung nicht mutierbar'],
            ['versionierter Symlink', { datei: 'zeiger.js', alt: '42', neu: '43', testdatei: 'test_gruen.js' }, 'Symlink'],
            ['Syntaxfehler .js', { datei: 'lib/wert.js', alt: '42', neu: '42 (', testdatei: 'test_gruen.js' }, 'node --check'],
            ['Syntaxfehler .json', { datei: 'daten.json', alt: '1', neu: '}', testdatei: 'test_gruen.js' }, 'JSON'],
            ['Syntaxfehler .sh', { datei: 'ops/skript.sh', alt: 'echo hallo', neu: 'fi', testdatei: 'test_gruen.js' }, 'bash -n'],
            ['leeres alt', { datei: 'lib/wert.js', alt: '', neu: '1', testdatei: 'test_gruen.js' }, 'nichtleerer Text'],
        ];
        for (const [name, argumente, erwartet] of ablehnungen) {
            const r = await werkzeugAufrufen('mutiere_und_teste', argumente);
            pruefen(`ABLEHNUNG ${name}: "${r.text.slice(0, 90)}"`, r.abgelehnt === true && r.status === 'abgelehnt' && r.text.includes(erwartet));
        }
        const tAbl = await werkzeugAufrufen('teste', { testdatei: 'nicht_da.js' });
        pruefen('ABLEHNUNG teste mit nicht registrierter Datei', tAbl.abgelehnt && tAbl.text.includes('nicht in der TESTS=(-Liste'));
        pruefen(`ABLEHNUNGEN kosten keinen Kind-Lauf (Ausfuehrungen ${zaehler().ausfuehrungen} = ${vorher}) und werden gezaehlt (${zaehler().ablehnungen})`,
            zaehler().ausfuehrungen === vorher && zaehler().ablehnungen === ablehnungen.length + 1);
        pruefen('ABLEHNUNG: eine Ablehnung ist genau EINE Zeile "abgelehnt: …", ohne Ausgabe-Abschnitt', !tAbl.text.includes('\n') && tAbl.text.startsWith('abgelehnt: '));
        pruefen('ZIELBAUM UNVERAENDERT nach abgelehnten und gefahrenen Mutationen (git status --porcelain leer, lib/wert.js = 42)',
            laufen('git', ['status', '--porcelain'], { cwd: fx.wurzel }).trim() === '' && fs.readFileSync(path.join(fx.wurzel, 'lib/wert.js'), 'utf8') === 'module.exports = 42;\n');

        // ----- Weitere Endungen und vorbereitung-gescheitert -----
        const mj = await werkzeugAufrufen('mutiere_und_teste', { datei: 'daten.json', alt: '1', neu: '2', testdatei: 'test_gruen.js' });
        pruefen('MUTATION .json gueltig -> gefahren (bestanden, der Test liest sie nicht)', mj.status === 'bestanden');
        const msh = await werkzeugAufrufen('mutiere_und_teste', { datei: 'ops/skript.sh', alt: 'hallo', neu: 'welt', testdatei: 'test_gruen.js' });
        pruefen('MUTATION .sh gueltig -> gefahren (bestanden)', msh.status === 'bestanden');
        const msql = await werkzeugAufrufen('mutiere_und_teste', { datei: 'abfrage.sql', alt: 'SELECT 1', neu: 'SELEKT 1', testdatei: 'test_gruen.js' });
        pruefen('MUTATION .sql ohne Syntaxpruefung -> gefahren (bestanden)', msql.status === 'bestanden');
        const mv = await werkzeugAufrufen('mutiere_und_teste', { datei: 'lib/schema.js', alt: 'CREATE TABLE', neu: 'CREATE TABEL', testdatei: 'test_gruen.js' });
        pruefen(`VORBEREITUNG-GESCHEITERT: Mutation in lib/schema.js laesst test/db-vorbereiten.js != 0 enden (Stufe 22), Fehlertext sichtbar: ${mv.text.split('\n')[0]}`,
            mv.status === 'vorbereitung-gescheitert' && /^status: vorbereitung-gescheitert\nexit: 22\n/.test(mv.text) && mv.text.includes('syntax error'));
        const mu = await werkzeugAufrufen('mutiere_und_teste', { datei: 'test/umgebung-schalter.js', alt: 'schalter: 0', neu: 'schalter: 1', testdatei: 'test_gruen.js' });
        pruefen('UMGEBUNG-FEHLER (Stufe 23): test/umgebung.sh liefert return 1 -> umgebung-fehler, exit 23, Meldung sichtbar, KEIN Isolationsabbruch',
            mu.status === 'umgebung-fehler' && /^status: umgebung-fehler\nexit: 23\n/.test(mu.text) && mu.text.includes('Schalter verlangt Abbruch') && !istAbgebrochen());

        // ----- Die uebrigen Status -----
        // Der Deckel von MAX_AUFRUFE zaehlt JEDEN Ausfuehrungsaufruf, auch
        // abgelehnte (Absicht: das Modell soll ihn nicht mit Ablehnungen
        // umgehen koennen, und er gilt je Lauf). Dieser Selbsttest macht mehr
        // Aufrufe als ein Lauf -- der Zaehler wird hier deshalb ausdruecklich
        // zurueckgesetzt; der Deckel selbst wird weiter unten eigens gemessen.
        pruefen(`DECKEL ZAEHLT AUCH ABLEHNUNGEN: nach ${lauf.zaehler.aufrufe} Aufrufen (davon ${zaehler().ablehnungen} abgelehnt) steht der Zaehler ueber der Zahl der Kind-Laeufe`,
            lauf.zaehler.aufrufe > zaehler().ausfuehrungen && lauf.zaehler.aufrufe === zaehler().ausfuehrungen - 1 + zaehler().ablehnungen);
        lauf.zaehler.aufrufe = 0;
        const ts = await werkzeugAufrufen('teste', { testdatei: 'test_signal.js' });
        pruefen(`SIGNALTOD: SIGSEGV in der Teststufe -> signaltod, exit 139 (gemessen ${ts.text.split('\n')[1]})`, ts.status === 'signaltod' && ts.text.includes('exit: 139'));
        const te2 = await werkzeugAufrufen('teste', { testdatei: 'test_exit2.js' });
        pruefen('UMGEBUNG-FEHLER bei Exit 2 der Teststufe (nur 0/1 sind Testergebnisse), exit vollstaendig im Kopf', te2.status === 'umgebung-fehler' && te2.text.includes('exit: 2') && te2.text.includes('unbekannt'));
        const te127 = await werkzeugAufrufen('teste', { testdatei: 'test_exit127.js' });
        pruefen('UMGEBUNG-FEHLER bei Exit 127 der Teststufe', te127.status === 'umgebung-fehler' && te127.text.includes('exit: 127'));
        const start = Date.now();
        const tz = await werkzeugAufrufen('teste', { testdatei: 'test_schlaeft.js' });
        const dauer = (Date.now() - start) / 1000;
        pruefen(`ZEITLIMIT: "schlaeft ewig" -> zeitlimit, exit 124, beendet nach ${dauer.toFixed(1)} s (Limit ${T_KURZ} s, Toleranz ${T_KURZ + 6} s)`,
            tz.status === 'zeitlimit' && tz.text.includes('exit: 124') && dauer <= T_KURZ + 6);
        pruefen('STATUS-ABBILDUNG 137: nach Ablauf der Uhr zeitlimit, davor signaltod; 124 immer zeitlimit',
            statusAusExit({ code: 137, signal: null, waechter: true, dauerMs: T_SEKUNDEN * 1000, tSekunden: T_SEKUNDEN }).status === 'zeitlimit'
            && statusAusExit({ code: 137, signal: null, waechter: true, dauerMs: 1000, tSekunden: T_SEKUNDEN }).status === 'signaltod'
            && statusAusExit({ code: 124, signal: null, waechter: false, dauerMs: 1000, tSekunden: T_SEKUNDEN }).status === 'zeitlimit');
        pruefen('STATUS-ABBILDUNG ohne Waechterdatei: 0 und 1 sind KEIN Testergebnis (umgebung-fehler), 20/23/30 umgebung-fehler, 22 vorbereitung-gescheitert, 21/24 brechen die Isolation',
            statusAusExit({ code: 0, signal: null, waechter: false, dauerMs: 1, tSekunden: 300 }).status === 'umgebung-fehler'
            && statusAusExit({ code: 1, signal: null, waechter: false, dauerMs: 1, tSekunden: 300 }).status === 'umgebung-fehler'
            && [20, 23, 30].every((c) => statusAusExit({ code: c, signal: null, waechter: false, dauerMs: 1, tSekunden: 300 }).status === 'umgebung-fehler')
            && statusAusExit({ code: 22, signal: null, waechter: false, dauerMs: 1, tSekunden: 300 }).status === 'vorbereitung-gescheitert'
            && [21, 24].every((c) => statusAusExit({ code: c, signal: null, waechter: false, dauerMs: 1, tSekunden: 300 }).isolation === true));
        pruefen('STATUS-ABBILDUNG mit Waechterdatei: 0 bestanden, 1 gescheitert, 125/126/127 umgebung-fehler, 129+ signaltod, 2 umgebung-fehler',
            statusAusExit({ code: 0, signal: null, waechter: true, dauerMs: 1, tSekunden: 300 }).status === 'bestanden'
            && statusAusExit({ code: 1, signal: null, waechter: true, dauerMs: 1, tSekunden: 300 }).status === 'gescheitert'
            && [125, 126, 127].every((c) => statusAusExit({ code: c, signal: null, waechter: true, dauerMs: 1, tSekunden: 300 }).status === 'umgebung-fehler')
            && statusAusExit({ code: 139, signal: null, waechter: true, dauerMs: 1, tSekunden: 300 }).status === 'signaltod'
            && statusAusExit({ code: 2, signal: null, waechter: true, dauerMs: 1, tSekunden: 300 }).status === 'umgebung-fehler');
        pruefen('STATUS-KATALOG: jeder Wert der Abbildung steht im Katalog und im Vorspann',
            ['bestanden', 'gescheitert', 'signaltod', 'zeitlimit', 'vorbereitung-gescheitert', 'umgebung-fehler', 'abgelehnt', 'grundlauf-rot', 'grundlauf-unvollstaendig', 'ausgabe-verworfen']
                .every((s) => STATUS_KATALOG[s] && vorspannAbsatz().includes(`- ${s}:`)) && !vorspannAbsatz().includes('Wirkungsnachweis'));

        // ----- Kein Zustand, Umgebungsvertrag, Riegel, 8 KB -----
        const z1 = await werkzeugAufrufen('teste', { testdatei: 'test_zustand.js' });
        const z2 = await werkzeugAufrufen('teste', { testdatei: 'test_zustand.js' });
        pruefen('KEIN ZUSTAND: Datei in Kopie, /tmp, /var/tmp, /dev/shm und Tabelle aus Lauf n sind in n+1 weg (beide Laeufe bestanden, Positivkontrolle im Test selbst)',
            z1.status === 'bestanden' && z2.status === 'bestanden' && z2.text.includes('Positivkontrolle: im selben Lauf sind die Spuren jetzt da'));
        const tu = await werkzeugAufrufen('teste', { testdatei: 'test_umgebung.js' });
        pruefen(`UMGEBUNGSVERTRAG im Kind: Namen = Literalliste, CI/TZ/HOME, SESSION_SECRET-Literal, DATABASE_URL auf /dsv1/pg, Vorladung wirkt, cwd (${tu.status})`,
            tu.status === 'bestanden' && tu.text.includes('7 PASS / 0 FAIL'));
        const tg = await werkzeugAufrufen('teste', { testdatei: 'test_geheimnis.js' });
        pruefen('RIEGEL: Zeile mit Attrappe faellt (ausgabe-verworfen-Hinweis, Marker statt Zeile, Status bleibt bestanden, gezaehlt)',
            tg.status === 'bestanden' && tg.text.includes('hinweis: ausgabe-verworfen: 1 Zeile(n)') && !tg.text.includes('X'.repeat(20)) && tg.text.includes('GitHub-Token') && zaehler().verworfeneZeilen === 1);
        const tl = await werkzeugAufrufen('teste', { testdatei: 'test_laut.js' });
        pruefen(`8-KB-DECKEL: ${Buffer.byteLength(tl.text)} Bytes <= ${MAX_ERGEBNIS_BYTES}, Kopf vollstaendig, Ende der Ausgabe (Schlusszeile) enthalten, Kuerzung benannt`,
            Buffer.byteLength(tl.text) <= MAX_ERGEBNIS_BYTES && tl.text.startsWith('status: bestanden\nexit: 0\n') && tl.text.includes('1 PASS / 0 FAIL') && /\[… \d+ Bytes davor weggelassen\]/.test(tl.text));
        pruefen('PROTOKOLL-VOLLTEXT <= 1 MB je Aufruf, laenger als die 8 KB fuer das Modell',
            protokollEintraege.every((p) => Buffer.byteLength(p.ausgabe) <= MAX_PROTOKOLL_BYTES) && Buffer.byteLength(protokollEintraege[protokollEintraege.length - 1].ausgabe) > MAX_ERGEBNIS_BYTES);
        pruefen('KEINE DAUER als Zahl im Modelltext', !/\d+ ?ms\b/.test(tl.text) && !/dauer/i.test(tl.text));
        pruefen('UTF-8-GRENZE: Kuerzung von vorn schneidet nie in ein Mehrbytezeichen',
            !bytesKuerzenVorn('ä'.repeat(5000), 100, (n) => `[${n}]`).includes('\uFFFD') && Buffer.byteLength(bytesKuerzenVorn('ä'.repeat(5000), 100, (n) => `[${n}]`)) <= 100);

        // ----- Deckel -----
        const aufrufeVorher = lauf.zaehler.aufrufe;
        lauf.zaehler.aufrufe = MAX_AUFRUFE;
        const d1 = await werkzeugAufrufen('teste', { testdatei: 'test_gruen.js' });
        pruefen(`DECKEL AUFRUFE: Aufruf Nr. ${MAX_AUFRUFE + 1} wird abgelehnt ("${d1.text.slice(0, 70)}")`, d1.abgelehnt && d1.text.includes(`hoechstens ${MAX_AUFRUFE}`));
        lauf.zaehler.aufrufe = aufrufeVorher;
        const msVorher = lauf.zaehler.ausfuehrungMs;
        lauf.zaehler.ausfuehrungMs = MAX_AUSFUEHRUNGSZEIT_MS;
        const d2 = await werkzeugAufrufen('teste', { testdatei: 'test_gruen.js' });
        pruefen('DECKEL ZEIT: 45 min Ausfuehrungszeit erreicht -> abgelehnt', d2.abgelehnt && d2.text.includes('45 min'));
        lauf.zaehler.ausfuehrungMs = msVorher;
        const d3 = await werkzeugAufrufen('teste', { testdatei: 'test_gruen.js' });
        pruefen('DECKEL POSITIVKONTROLLE: unter beiden Deckeln laeuft derselbe Aufruf wieder (bestanden)', d3.status === 'bestanden');
        pruefen(`ZUSAMMENFASSUNG nennt Ausfuehrungen/Mutationen/Ablehnungen und die Kanarie (${zusammenfassungZeilen()[0].slice(0, 60)}…)`,
            zusammenfassungZeilen().length === 2 && /^Ausfuehrungen: \d+  Mutationen: \d+/.test(zusammenfassungZeilen()[0]) && zusammenfassungZeilen()[1].includes('gruen')
            && protokollMaterialZusatz().startsWith(', Ausfuehrungen '));

        // ----- Isolationsabbruch ueber Stufe 24 (Umgebungsnamen) -----
        const ma = await werkzeugAufrufen('mutiere_und_teste', { datei: 'test/umgebung-schalter.js', alt: 'extra: 0', neu: 'extra: 1', testdatei: 'test_gruen.js' });
        pruefen('ISOLATIONSABBRUCH (Stufe 24): eine zusaetzliche Umgebungsvariable aus umgebung.sh -> umgebung-fehler, exit 24, Abbruch gesetzt',
            ma.status === 'umgebung-fehler' && ma.text.includes('exit: 24') && ma.text.includes('EXTRA_DSV1') && istAbgebrochen() && abbruchMarker().startsWith('AUSFÜHRUNG ABGEBROCHEN — Belege nach Aufruf '));
        const nach = await werkzeugAufrufen('teste', { testdatei: 'test_gruen.js' });
        pruefen('NACH DEM ABBRUCH: jeder weitere Ausfuehrungsaufruf wird mit dem Marker abgelehnt, kein Kind-Lauf mehr',
            nach.abgelehnt && nach.text.includes('AUSFÜHRUNG ABGEBROCHEN') && zusammenfassungZeilen().length === 3);
        const dirVorAufraeumen = lauf.dir;
        const clusterVorAufraeumen = lauf.cluster;
        pruefen('AUFRAEUMEN meldet sauber; Cluster weg, Laufverzeichnis weg, Konfiguration weg, Sperre frei',
            aufraeumen() === true && !clusterListe().some((c) => c.name === clusterVorAufraeumen) && !fs.existsSync(dirVorAufraeumen)
            && !fs.existsSync(`/etc/postgresql/${pgVersionErmitteln()}/${clusterVorAufraeumen}`)
            && spawnSync('flock', ['-n', '-E', '75', SPERRDATEI, 'true'], { env: { PATH: KIND_PATH } }).status === 0);

        // ----- Selbstmessung ROT (Stufe 21) mit gestrichenem tmpfs-Pfad — nur ueber die Selbsttest-Option aufbauSkript -----
        const aufbauOriginal = fs.readFileSync(AUFBAU_SKRIPT, 'utf8');
        const tmpZeile = 'mount -n -t tmpfs -o size=256m,mode=1777,nosuid,nodev tmpfs "$R/var/tmp" || scheitern "tmpfs /var/tmp"';
        const aufbauOhneVarTmp = path.join(basis, 'aufbau-ohne-var-tmp.sh');
        fs.writeFileSync(aufbauOhneVarTmp, aufbauOriginal.replace(tmpZeile, ': # tmpfs /var/tmp gestrichen (Selbsttest)'));
        pruefen('GEGENPROBE-VORBEREITUNG: die tmpfs-Zeile fuer /var/tmp kommt im Aufbauskript genau einmal vor',
            fundstellenZaehlen(aufbauOriginal, tmpZeile) === 1 && spawnSync('bash', ['-n', aufbauOhneVarTmp], { env: { PATH: KIND_PATH } }).status === 0);
        await einrichten({ wurzel: fx.wurzel, istHartGesperrt, tSekunden: T_KURZ, aufbauSkript: aufbauOhneVarTmp });
        const s21 = await werkzeugAufrufen('teste', { testdatei: 'test_gruen.js' });
        pruefen('SELBSTMESSUNG ROT (Stufe 21): ohne tmpfs auf /var/tmp weicht die Menge der schreibbaren Verzeichnisse ab -> umgebung-fehler, exit 21, Isolationsabbruch, Kanarie nicht gruen',
            s21.abgelehnt && s21.text.includes('AUSFÜHRUNG ABGEBROCHEN') && istAbgebrochen() && lauf.kanarie.gefahren && !lauf.kanarie.gruen
            && lauf.kanarie.ergebnis.status === 'umgebung-fehler' && lauf.kanarie.ergebnis.exit === 21
            && lauf.kanarie.ergebnis.protokoll.stufen.selbstmessung.includes('✗ fuer 65534 schreibbare Verzeichnisse'));
        pruefen('SELBSTMESSUNG ROT: keine Ausfuehrung ausser der Kanarie (Ausfuehrungen 1, Ablehnungen 1)', zaehler().ausfuehrungen === 1 && zaehler().ablehnungen === 1);
        aufraeumen();

        // ----- Aufbau gescheitert (Stufe 20) -----
        const procZeile = 'mount -n -t proc proc "$R/proc" || scheitern "proc"';
        const aufbauOhneProc = path.join(basis, 'aufbau-ohne-proc.sh');
        fs.writeFileSync(aufbauOhneProc, aufbauOriginal.replace(procZeile, 'scheitern "proc (Selbsttest)"'));
        pruefen('GEGENPROBE-VORBEREITUNG: die proc-Zeile kommt genau einmal vor', fundstellenZaehlen(aufbauOriginal, procZeile) === 1);
        await einrichten({ wurzel: fx.wurzel, istHartGesperrt, tSekunden: T_KURZ, aufbauSkript: aufbauOhneProc });
        const s20 = await werkzeugAufrufen('teste', { testdatei: 'test_gruen.js' });
        pruefen('AUFBAU GESCHEITERT (Stufe 20): umgebung-fehler mit exit 20 in der Kanarie, kein Testergebnis, Isolationsabbruch (Kanarie nicht gruen)',
            s20.abgelehnt && lauf.kanarie.ergebnis.status === 'umgebung-fehler' && lauf.kanarie.ergebnis.exit === 20 && lauf.kanarie.ergebnis.waechter === false);
        aufraeumen();

        // ----- Reste eines abgestuerzten Laufs: Sperr-Halter getoetet, nichts aufgeraeumt, Neustart raeumt -----
        const e3 = await einrichten({ wurzel: fx.wurzel, istHartGesperrt, tSekunden: T_KURZ });
        const altesDir = lauf.dir;
        const alterCluster = lauf.cluster;
        sperreFreigeben(lauf.halter);
        lauf = null; // "Absturz": kein aufraeumen()
        await new Promise((r) => setTimeout(r, 1500));
        pruefen(`ABSTURZ SIMULIERT: Cluster ${alterCluster} laeuft noch, Verzeichnis steht, Sperre ist frei`,
            clusterListe().some((c) => c.name === alterCluster && c.status === 'online') && fs.existsSync(altesDir)
            && spawnSync('flock', ['-n', '-E', '75', SPERRDATEI, 'true'], { env: { PATH: KIND_PATH } }).status === 0 && e3.reste.length === 0);
        const e4 = await einrichten({ wurzel: fx.wurzel, istHartGesperrt, tSekunden: T_KURZ });
        pruefen(`NEUSTART RAEUMT RESTE: ${e4.reste.length} Reste gemeldet (${e4.reste.join('; ')}), alter Cluster weg, altes Verzeichnis weg, neuer Cluster online`,
            e4.reste.length >= 2 && e4.reste.some((r) => r.includes(alterCluster)) && !clusterListe().some((c) => c.name === alterCluster) && !fs.existsSync(altesDir)
            && clusterListe().some((c) => c.name === e4.cluster && c.status === 'online'));
        pruefen('AUFRAEUMEN nach dem Neustart sauber', aufraeumen() === true && !fs.existsSync(LAUFWURZEL) || (fs.existsSync(LAUFWURZEL) && fs.readdirSync(LAUFWURZEL).length === 0));

        // ----- Einrichten lehnt ab: unsauberer Baum, fehlende Pflichtdatei, kein Kanarientest -----
        fs.writeFileSync(path.join(fx.wurzel, 'schmutz.txt'), 'x');
        let fehlerSchmutz = null;
        try { await einrichten({ wurzel: fx.wurzel, istHartGesperrt }); } catch (e) { fehlerSchmutz = e.message; }
        fs.rmSync(path.join(fx.wurzel, 'schmutz.txt'));
        pruefen(`EINRICHTEN lehnt einen unsauberen Zielbaum ab ("${(fehlerSchmutz || '').slice(0, 60)}"), nichts eingerichtet, Sperre frei`,
            /nicht sauber/.test(fehlerSchmutz || '') && lauf === null && spawnSync('flock', ['-n', '-E', '75', SPERRDATEI, 'true'], { env: { PATH: KIND_PATH } }).status === 0);
        let fehlerKanarie = null;
        try { await einrichten({ wurzel: fx.wurzel, istHartGesperrt, kanarie: 'nicht_registriert.js' }); } catch (e) { fehlerKanarie = e.message; }
        pruefen('EINRICHTEN lehnt einen nicht registrierten Kanarientest ab', /Kanarientest .* nicht in test\/run\.sh registriert/.test(fehlerKanarie || '') && lauf === null);
    } finally {
        if (lauf) aufraeumen();
        if (alteUmgebung !== undefined) process.env.PLAYWRIGHT_BROWSERS_PATH = alteUmgebung; else delete process.env.PLAYWRIGHT_BROWSERS_PATH;
        if (alteTz !== undefined) process.env.TZ = alteTz; else delete process.env.TZ;
        fs.rmSync(basis, { recursive: true, force: true });
    }
}

module.exports = {
    ERLAUBTES_MODELL, WERKZEUGE_AUSFUEHRUNG, MAX_ERGEBNIS_BYTES, MAX_AUFRUFE, T_SEKUNDEN,
    einrichten, aufraeumen, werkzeugAufrufen, istAktiv, istAbgebrochen, abbruchMarker, zaehler,
    vorspannAbsatz, zusammenfassungZeilen, protokollMaterialZusatz, statusAusExit,
    selbsttestSpur, fixtureAnlegen,
};
