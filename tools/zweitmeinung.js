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
// Geheimnisse (siehe tools/geheimnis-riegel.js, GEHEIMNIS_MUSTER); er bricht
// ab, statt zu warnen.
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
const { pruefeGeheimnisse, selbsttestRiegel } = require('./geheimnis-riegel');

const ENDPUNKT = 'https://api.openai.com/v1/chat/completions';
const VORGABE_MODELL = 'gpt-5';
const MAX_ANTWORT_TOKEN = 24000;

// Riegel gegen Geheimnisse: siehe tools/geheimnis-riegel.js (herausgezogen
// am 09.09.2026, weil tools/gegenleser-repo.js dieselbe Pruefung braucht —
// nicht kopieren, sondern gemeinsam benutzen).

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
    if (argumente[0] === '--selbsttest') return selbsttestRiegel();
    if (argumente.length < 2) {
        console.error('Aufruf: node tools/zweitmeinung.js <diff.txt> <gesetze.txt> [modell]');
        console.error('        node tools/zweitmeinung.js --selbsttest');
        return 2;
    }
    const [diffPfad, gesetzePfad, modellArg] = argumente;
    const modell = modellArg || VORGABE_MODELL;

    const diff = fs.readFileSync(diffPfad, 'utf8');
    const gesetze = fs.readFileSync(gesetzePfad, 'utf8');

    const pruefung = pruefeGeheimnisse(diff + '\n' + gesetze);
    if (!pruefung.sauber) {
        console.error('ABBRUCH: Der Text enthaelt etwas, das wie ein Geheimnis aussieht — '
            + pruefung.treffer.map((t) => t.name).join(', ') + '.');
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
