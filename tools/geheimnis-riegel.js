'use strict';
//
// tools/geheimnis-riegel.js — Riegel gegen Geheimnisse, herausgezogen aus
// tools/zweitmeinung.js (09.09.2026), damit tools/gegenleser-repo.js dieselbe
// Pruefung benutzt statt einer zweiten Kopie ("Dieselbe Aussage an zwei
// Orten" — CLAUDE.md). Bewusst eng gehalten: jedes Muster steht fuer eine
// Form, die tatsaechlich vorkommt, nicht fuer "sieht irgendwie geheim aus".
// Ein Muster, das staendig falsch anschlaegt, wird abgeschaltet statt
// gelesen.
const GEHEIMNIS_MUSTER = [
    { name: 'OpenAI-Schlüssel', regex: /\bsk-[A-Za-z0-9_-]{20,}/ },
    { name: 'GitHub-Token', regex: /\bgh[pousr]_[A-Za-z0-9]{20,}/ },
    { name: 'Telegram-Bot-Token', regex: /\b\d{8,12}:[A-Za-z0-9_-]{30,}/ },
    { name: 'privater Schlüssel (PEM)', regex: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
    { name: 'Verbindungszeichenfolge mit Passwort', regex: /\b(?:postgres|postgresql|mysql|mongodb):\/\/[^\s:/@]+:[^\s@]+@/ },
];

// Kurzer, VERDECKTER Ausschnitt rund um den Treffer: genug, um die Fundstelle
// im Text wiederzufinden, ohne das Geheimnis selbst weiterzureichen — sonst
// wuerde der Riegel genau das Leck vergroessern, das er verhindern soll.
function verdeckterAusschnitt(text, fund) {
    const wert = fund[0];
    const start = Math.max(0, fund.index - 12);
    const ende = Math.min(text.length, fund.index + wert.length + 12);
    const vor = text.slice(start, fund.index);
    const nach = text.slice(fund.index + wert.length, ende);
    const maske = wert.length <= 6
        ? '*'.repeat(wert.length)
        : wert.slice(0, 3) + '*'.repeat(Math.min(wert.length - 5, 30)) + wert.slice(-2);
    return `${start > 0 ? '…' : ''}${vor}${maske}${nach}${ende < text.length ? '…' : ''}`;
}

// Liefert nicht nur ja/nein, sondern die Treffer selbst: der Aufrufer soll
// sehen, WELCHES Muster WO angeschlagen hat, sonst sucht er blind.
function pruefeGeheimnisse(text) {
    const treffer = [];
    for (const muster of GEHEIMNIS_MUSTER) {
        const fund = muster.regex.exec(text);
        if (fund) {
            treffer.push({ name: muster.name, ausschnitt: verdeckterAusschnitt(text, fund) });
        }
    }
    return { sauber: treffer.length === 0, treffer };
}

// Der Riegel taugt nur, wenn er nachweislich anschlagen KANN. Dieser
// Selbsttest prueft beide Richtungen je Muster und ist damit die
// Positivkontrolle, ohne die "keine Geheimnisse gefunden" nur "nicht
// gesucht" hiesse. Unveraendert aus tools/zweitmeinung.js uebernommen, damit
// dessen "--selbsttest" nach dem Herausziehen dieselbe Ausgabe liefert.
function selbsttestRiegel() {
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
        const { treffer } = pruefeGeheimnisse(text);
        const ok = treffer.some((t) => t.name === name);
        console.log(`${ok ? '  ✓' : '  ✗ FEHLT'} ROT: ${name}${ok ? '' : ` (gefunden: ${treffer.map((t) => t.name).join(', ') || 'nichts'})`}`);
        if (!ok) fehler++;
    }
    const harmlosPruefung = pruefeGeheimnisse(harmlos);
    const harmlosOk = harmlosPruefung.sauber;
    console.log(`${harmlosOk ? '  ✓' : '  ✗ FEHLALARM'} GRUEN: ein echter Diff-Ausschnitt schlaegt nicht an`
        + `${harmlosOk ? '' : ` (angeschlagen: ${harmlosPruefung.treffer.map((t) => t.name).join(', ')})`}`);
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

module.exports = { GEHEIMNIS_MUSTER, pruefeGeheimnisse, selbsttestRiegel };
