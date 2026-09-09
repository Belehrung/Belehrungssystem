#!/usr/bin/env node
'use strict';
//
// tools/zweitmeinung.js — schickt einen Diff samt Gesetzeswortlaut an ein
// OpenAI-Modell und gibt dessen Prüfbericht aus. Zweite Gegenlesung neben den
// Claude-Agenten, mit anderer Modellfamilie und damit anderen blinden Flecken.
//
// WOZU, und wozu NICHT (gemessen am 09.09.2026, sechs Läufe — vier über
// Rechtstexte, zwei über Code; die Bilanz unten ist die der Rechtstext-Läufe,
// die der Code-Läufe steht weiter unten bei der Modellwahl):
// Am selben Lexikon-Diff fand die Claude-Gegenlesung eine falsche Rechtsaussage
// und übersah eine zweite; GPT-5 fand beide. Auf dem nachgearbeiteten Stand fand
// GPT-5 eine dritte, die drei Durchgänge vorher übersehen hatten. Im vierten Lauf
// meldete es einen blockierenden Befund, der am Wortlaut widerlegt wurde. Bilanz:
// vier echte Funde, ein Fehlalarm. Daraus folgt beides — die Spur lohnt sich, UND
// jeder Befund wird selbst am Original nachgemessen, bevor er übernommen wird.
//
// EINSATZ (Entscheidung des Haupt-Agenten, Betreiber-Freigabe 09.09.2026):
//   - bei jedem Diff mit Rechts- oder Normaussagen (Lexikon-Klasse),
//   - bei jedem blockierenden Befund einer Claude-Gegenlesung, als Gegenprobe.
//   NICHT bei gewöhnlichen Code-Diffs: dort sind die Claude-Agenten im Vorteil,
//   weil sie messen können (Tests laufen lassen, Gegenproben bauen) statt nur zu
//   lesen.
//
// WAS RAUSGEHT: ausschliesslich die zwei Dateien, die der Aufrufer nennt. Das
// Werkzeug sammelt NICHTS selbst aus dem Repo ein — sonst ginge irgendwann etwas
// mit, das nicht mitgehen soll. Vor dem Senden läuft ein Riegel gegen
// Geheimnisse (siehe GEHEIMNIS_MUSTER); er bricht ab, statt zu warnen.
//
// DER SCHLÜSSEL GEHÖRT NICHT INS REPO. Er kommt aus der Umgebungsvariablen
// OPENAI_API_KEY oder aus der Datei, die OPENAI_KEY_DATEI nennt. Fehlt beides,
// bricht das Werkzeug mit Exit 2 ab — ein leeres Ergebnis ist kein sauberes
// Ergebnis, und eine stille Übersprung-Meldung wäre genau das.
//
// AUFRUF:
//   node tools/zweitmeinung.js <diff.txt> <gesetze.txt> [modell]
//   node tools/zweitmeinung.js --selbsttest      (prüft den Geheimnis-Riegel)
//
// Vorgabemodell ist gpt-5. DIE CODEX-VARIANTEN SIND HIER KEIN AUSWEG, und das
// ist keine Annahme mehr, sondern am 09.09.2026 zweimal gemessen:
//
//   (1) Sie laufen an ENDPUNKT gar nicht. gpt-5-codex antwortet HTTP 404
//       ("has been deprecated"); die lebenden Varianten (gpt-5.1-codex,
//       gpt-5.2-codex, gpt-5.3-codex) antworten HTTP 404 mit "This model is
//       not supported in the v1/chat/completions endpoint. Use the
//       v1/responses endpoint instead." Wer sie benutzen will, braucht einen
//       anderen Endpunkt, nicht nur einen anderen Modellnamen.
//
//   (2) Sie helfen auch dann nicht — das ist der eigentliche Punkt. Derselbe
//       Code-Diff (Zweig frist-herkunft, 790 Zeilen), derselbe Auftragstext
//       wörtlich, einmal an gpt-5 und einmal über /v1/responses an
//       gpt-5.3-codex: zusammen NULL blockierende und sechs "sollte behoben
//       werden" — und alle sechs fielen beim Nachmessen am Bestand. Sie hatten
//       die Form "aus dem Diff nicht ersichtlich, ob …" und "falls künftig …".
//
// Der Grund ist strukturell und nicht durch ein anderes Modell zu beheben: bei
// Rechtstexten liegt die Antwort IM mitgegebenen Wortlaut, bei Code liegt sie
// in Dateien, die der Diff nicht zeigt — und dieses Werkzeug kann nicht
// nachsehen. Es kann nichts holen und nichts laufen lassen; das steht oben
// schon, hier ist die Messung dazu.

const fs = require('node:fs');
const https = require('node:https');

const ENDPUNKT = 'https://api.openai.com/v1/chat/completions';
const VORGABE_MODELL = 'gpt-5';
const MAX_ANTWORT_TOKEN = 24000;

// Riegel gegen Geheimnisse. Bewusst eng gehalten: jedes Muster steht für eine
// Form, die tatsächlich vorkommt, nicht für "sieht irgendwie geheim aus". Ein
// Muster, das ständig falsch anschlägt, wird abgeschaltet statt gelesen.
const GEHEIMNIS_MUSTER = [
    { name: 'OpenAI-Schlüssel', regex: /\bsk-[A-Za-z0-9_-]{20,}/ },
    { name: 'GitHub-Token', regex: /\bgh[pousr]_[A-Za-z0-9]{20,}/ },
    { name: 'Telegram-Bot-Token', regex: /\b\d{8,12}:[A-Za-z0-9_-]{30,}/ },
    { name: 'privater Schlüssel (PEM)', regex: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
    { name: 'Verbindungszeichenfolge mit Passwort', regex: /\b(?:postgres|postgresql|mysql|mongodb):\/\/[^\s:/@]+:[^\s@]+@/ },
];

const BRIEF = `Du bist unabhängiger Gegenleser für ein deutsches Arbeitsschutz-Dokumentationssystem
für Fitnessstudios. Unten stehen ZWEI Blöcke: erst der amtliche Wortlaut der einschlägigen
Vorschriften, dann ein Diff.

Das System führt ein "Lexikon", das je Thema streng trennt:
  pflicht  = die Norm sagt es verbindlich (Gesetz, Verordnung, Unfallverhütungsvorschrift).
  standard = technische Regel mit blosser Vermutungswirkung (ASR, TRBS) oder
             DGUV-Information bzw. DIN — also NICHT verbindlich.
  klarstellung = Richtigstellung verbreiteter Rechtsirrtümer.

Diese Trennung ist der Sinn der Sache und juristisch heikel.

WICHTIG: Prüfe gegen den beigefügten Wortlaut, nicht gegen dein Gedächtnis. Wo eine
Vorschrift NICHT beiliegt, sag das ausdrücklich, statt zu raten.

DEINE AUFGABE, in dieser Reihenfolge:

1. SACHLICH FALSCHE RECHTSAUSSAGEN — das Wichtigste, und zwar in BEIDE Richtungen:
   (a) pauschale VERNEINUNGEN einer Sanktion, Pflicht oder Frist ("ist kein eigener
       Bußgeldtatbestand", "nicht im Bußgeldkatalog gelistet", "es gibt keine Pflicht zu X");
   (b) das Gegenstück: eine klare Pflicht, die als UNKLAR oder strittig dargestellt wird
       ("sagt der Normtext nicht eindeutig", "ist umstritten", "lässt sich nicht sagen").
   Beide Formen sind gefährlich, weil sie niemand nachschlägt. Prüfe jede einzelne gegen
   den beiliegenden Wortlaut und nenne die Nummer bzw. den Satz, der sie widerlegt oder trägt.

2. FUNDSTELLEN, DIE ES NICHT GIBT ODER DIE ETWAS ANDERES SAGEN. Prüfe insbesondere, ob der
   zitierte ABSATZ, SATZ oder die NUMMER überhaupt existiert und das Behauptete trägt.

3. FALSCH EINSORTIERTE AUSSAGEN: steht in "pflicht" etwas, das nur technische Regel,
   DGUV-Information oder DIN ist? Steht in "standard" etwas, das in Wahrheit verbindlich ist?

4. DIESELBE AUSSAGE AN ZWEI ORTEN, einmal richtig und einmal falsch.

MELDE je Befund: die betroffene Zeichenkette wörtlich, was daran falsch ist, die richtige
Fundstelle aus dem beiliegenden Wortlaut, und die Schwere (blockierend / sollte behoben
werden / Anmerkung). Erfinde nichts. Antworte auf Deutsch.
`;

function schluesselHolen() {
    if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();
    const pfad = process.env.OPENAI_KEY_DATEI;
    if (!pfad) {
        throw new Error(
            'Kein Schluessel. Setze OPENAI_API_KEY oder OPENAI_KEY_DATEI (Pfad zu einer Datei\n'
            + 'AUSSERHALB des Repos, Rechte 600). Der Schluessel gehoert nicht ins Repo und nicht\n'
            + 'in eine Chat-Nachricht.');
    }
    const wert = fs.readFileSync(pfad, 'utf8').trim();
    if (!wert) throw new Error(`OPENAI_KEY_DATEI zeigt auf "${pfad}", die Datei ist aber leer.`);
    return wert;
}

// Gibt die Liste der Treffer zurueck, nicht nur ja/nein: der Aufrufer soll sehen,
// WAS angeschlagen hat, sonst sucht er blind.
function geheimnisseFinden(text) {
    return GEHEIMNIS_MUSTER.filter((m) => m.regex.test(text)).map((m) => m.name);
}

// Der Riegel taugt nur, wenn er nachweislich anschlagen KANN. Dieser Selbsttest
// prueft beide Richtungen je Muster und ist damit die Positivkontrolle, ohne die
// "keine Geheimnisse gefunden" nur "nicht gesucht" hiesse.
function selbsttest() {
    const faelle = [
        // Die Praefixe absichtlich zusammengesetzt statt als Literal: sonst steht
        // im Quelltext eine Zeichenkette, die ein Geheimnis-Scanner (auch der von
        // GitHub beim Push) fuer einen echten Schluessel halten kann.
        ['OpenAI-Schlüssel', 'harmlos ' + 'sk' + '-proj-' + 'A'.repeat(40) + ' harmlos'],
        ['GitHub-Token', 'gh' + 'p_' + 'B'.repeat(36)],
        ['Telegram-Bot-Token', '123456789:' + 'C'.repeat(35)],
        ['privater Schlüssel (PEM)', '-----BEGIN PRIVATE KEY-----'],
        ['Verbindungszeichenfolge mit Passwort', 'postgresql://nutzer:geheim@host:5432/db'],
    ];
    // Absichtlich harmlos: ein Diff-Ausschnitt, wie er wirklich vorkommt, samt
    // Zeichenketten, die nach Geheimnis AUSSEHEN, aber keins sind.
    const harmlos = [
        '+    fristNorm: "§ 12 Abs. 2 Satz 4 MPBetreibV",',
        '-    const SALT_ROUNDS = 12;',
        '+    // Vorbild: sk-Nummern der DGUV, etwa sk-204-010',
        '+    const url = "postgresql://localhost:5432/gymdocu_test";',
        '+    process.env.GYMDOCU_TG_BOT_TOKEN = "";',
    ].join('\n');

    let fehler = 0;
    for (const [name, text] of faelle) {
        const treffer = geheimnisseFinden(text);
        const ok = treffer.includes(name);
        console.log(`${ok ? '  ✓' : '  ✗ FEHLT'} ROT: ${name}${ok ? '' : ` (gefunden: ${treffer.join(', ') || 'nichts'})`}`);
        if (!ok) fehler++;
    }
    const harmlosTreffer = geheimnisseFinden(harmlos);
    const harmlosOk = harmlosTreffer.length === 0;
    console.log(`${harmlosOk ? '  ✓' : '  ✗ FEHLALARM'} GRUEN: ein echter Diff-Ausschnitt schlaegt nicht an`
        + `${harmlosOk ? '' : ` (angeschlagen: ${harmlosTreffer.join(', ')})`}`);
    if (!harmlosOk) fehler++;

    // Sollzahl von Hand eingetragen: faellt ein Muster ersatzlos aus der Liste,
    // liefe der Selbsttest sonst mit weniger Faellen weiter durch und meldete gruen.
    const ERWARTETE_FAELLE = 6;
    const gelaufen = faelle.length + 1;
    if (gelaufen !== ERWARTETE_FAELLE) {
        console.log(`  ✗ FEHLT: ${gelaufen} Faelle gelaufen, erwartet ${ERWARTETE_FAELLE} — Muster entfernt?`);
        fehler++;
    }
    console.log(fehler ? `\n${fehler} Fehler` : '\nSelbsttest sauber');
    return fehler ? 1 : 0;
}

function anfragen(schluessel, modell, inhalt) {
    const koerper = JSON.stringify({
        model: modell,
        messages: [{ role: 'user', content: inhalt }],
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

async function main() {
    const argumente = process.argv.slice(2);
    if (argumente[0] === '--selbsttest') return selbsttest();
    if (argumente.length < 2) {
        console.error('Aufruf: node tools/zweitmeinung.js <diff.txt> <gesetze.txt> [modell]');
        console.error('        node tools/zweitmeinung.js --selbsttest');
        return 2;
    }
    const [diffPfad, gesetzePfad, modellArg] = argumente;
    const modell = modellArg || VORGABE_MODELL;

    const diff = fs.readFileSync(diffPfad, 'utf8');
    const gesetze = fs.readFileSync(gesetzePfad, 'utf8');

    const treffer = geheimnisseFinden(diff + '\n' + gesetze);
    if (treffer.length) {
        console.error('ABBRUCH: Der Text enthaelt etwas, das wie ein Geheimnis aussieht — '
            + treffer.join(', ') + '.');
        console.error('Es wurde NICHTS gesendet. Entferne die Stelle oder schneide den Diff enger.');
        return 3;
    }

    const schluessel = schluesselHolen();
    const inhalt = BRIEF
        + '\n\n########## AMTLICHER WORTLAUT ##########\n\n' + gesetze
        + '\n\n########## DIFF ##########\n\n' + diff;

    const antwort = await anfragen(schluessel, modell, inhalt);
    console.log(antwort.choices[0].message.content);
    const verbrauch = antwort.usage || {};
    console.log(`\n---\nMODELL=${modell}  IN=${verbrauch.prompt_tokens}  OUT=${verbrauch.completion_tokens}`);
    return 0;
}

main().then((code) => { process.exitCode = code; }).catch((fehler) => {
    console.error('FEHLER:', fehler.message);
    process.exitCode = 1;
});
