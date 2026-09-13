'use strict';
//
// tools/geheimnis-riegel.js — Riegel gegen Geheimnisse, herausgezogen aus
// tools/zweitmeinung.js (09.09.2026), damit tools/gegenleser-repo.js dieselbe
// Pruefung benutzt statt einer zweiten Kopie ("Dieselbe Aussage an zwei
// Orten" — CLAUDE.md). Bewusst eng gehalten: jedes Muster steht fuer eine
// Form, die tatsaechlich vorkommt, nicht fuer "sieht irgendwie geheim aus".
// Ein Muster, das staendig falsch anschlaegt, wird abgeschaltet statt
// gelesen.
//
// SCHWAERZEN STATT ABBRECHEN (13.09.2026). Anlass, gemessen: das Muster
// "Verbindungszeichenfolge mit Passwort" traf zwei PLATZHALTER in
// Fehlermeldungstexten von core/db.js im GymDocu-Repo ("DATABASE_URL fehlt.
// In .env setzen, z.B.: postgresql://gymdocu:PASSWORT@…") und riss den
// ganzen Gegenleser-Lauf mit (Exit 3). 13 versionierte Dateien enthalten
// solchen Text, darunter core/db.js selbst — ohne das Schema ist Punkt 1 der
// Pruefreihenfolge (Mandantentrennung) nicht beurteilbar. Genau der Ausgang,
// den der Absatz darueber vorhersagt.
//
// Der Ausweg ist AUSDRUECKLICH KEINE Platzhalter-Erkennung und KEINE
// Ausnahmeliste: beides verlangt ein Urteil darueber, was "offensichtlich
// unecht" ist, und ein falsches Urteil laesst ein echtes Geheimnis durch.
// Stattdessen entfernt entferneGeheimnisse() weiter unten, was ein Muster
// trifft, und der Lauf laeuft weiter. Die Muster selbst bleiben, wie sie
// sind. pruefeGeheimnisse() bleibt daneben unveraendert bestehen —
// tools/zweitmeinung.js benutzt es weiter als reinen Abbruch-Riegel.
const GEHEIMNIS_MUSTER = [
    { name: 'OpenAI-Schlüssel', regex: /\bsk-[A-Za-z0-9_-]{20,}/ },
    { name: 'GitHub-Token', regex: /\bgh[pousr]_[A-Za-z0-9]{20,}/ },
    { name: 'Telegram-Bot-Token', regex: /\b\d{8,12}:[A-Za-z0-9_-]{30,}/ },
    // blockEnde: das Geheimnis steht NICHT in der Trefferzeile, sondern in
    // den Zeilen darunter — entferneGeheimnisse() entfernt deshalb bis
    // einschliesslich der naechsten Zeile, auf die blockEnde passt.
    // BEWUSST ENG (Nacharbeit 13.09.2026): ein blosses /-----END / liesse
    // sich mit einer Zeile "-----END FOO" mitten im Block vorzeitig
    // ausloesen — das Material darunter ist Base64, trifft kein Muster und
    // ginge vollstaendig hinaus. Folge der engen Fassung: passt KEIN Ende,
    // laeuft die Schwaerzung bis zum Textende und reisst bei grossen Dateien
    // den Deckel, also Abbruch. Das ist die richtige Richtung (fail-closed)
    // und ausdruecklich gewollt.
    // "ENCRYPTED " im BEGIN ist die eine Musteraenderung: eine ERWEITERUNG
    // der Erkennung, keine Lockerung — es trifft ab jetzt mehr, nie weniger.
    {
        name: 'privater Schlüssel (PEM)',
        regex: /-----BEGIN (?:RSA |EC |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/,
        blockEnde: /-----END (?:RSA |EC |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/,
    },
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

// Deckel fuer entferneGeheimnisse(): mehr als so viele Zeilen ODER mehr als
// dieser Anteil entfernt, und der Aufrufer soll abbrechen wie bisher. Eine
// Datei, die ueberwiegend aus Geheimnissen besteht, ist eine Geheimnisdatei —
// und ein zu drei Vierteln geschwaerzter Ausschnitt ist fuer eine Pruefung
// ohnehin wertlos.
const MAX_ENTFERNTE_ZEILEN = 20;
const MAX_ENTFERNTER_ANTEIL = 0.25;
// Der Anteil sagt erst ab einer Mindestzahl von Zeilen etwas (Nacharbeit
// 13.09.2026): "lies core/db.js 71 71" ist 1 von 1 = 100 %, "70 72" ist 1 von
// 3 = 33 % — beides riss den Anteils-Deckel und liess genau den Fehlalarm
// bestehen, dessen Beseitigung der Zweck des Umbaus war, nur verschoben auf
// enge Fenster. Unterhalb dieser Grenze greift nur der absolute Deckel, der
// dort nie reissen kann. Das ist KEINE Lockerung: eine einzelne geschwaerzte
// Zeile ist eine einzelne geschwaerzte Zeile, ob sie in einem Fenster von 3
// oder 300 Zeilen steht — es geht nichts hinaus. Der Deckel verhindert nur
// nutzlose Ausschnitte, und ein Ausschnitt, der ganz aus einem Marker
// besteht, ist harmlos, nicht gefaehrlich.
const MIN_ZEILEN_FUER_ANTEIL = 8;

// EINE Stelle fuer den Ersatztext: suche() im Gegenleser setzt ihn je
// Trefferzeile selbst (dort gibt es keinen Deckel, jede Trefferzeile wird
// einzeln und vollstaendig ersetzt), lies() bekommt ihn ueber
// entferneGeheimnisse().
function zeileEntferntMarker(name) {
    return `[ZEILE ENTFERNT — Geheimnis-Riegel: ${name}]`;
}

// Liefert den Text ohne die Zeilen, die ein Muster treffen, dazu die Liste
// der entfernten Zeilen (1-basiert, bezogen auf den uebergebenen Text) und
// zuViel, wenn der Deckel gerissen ist — dann ist text LEER, damit ein
// Aufrufer, der zuViel nicht ansieht, wenigstens nichts weiterreicht.
//
// Immer die GANZE ZEILE, nie nur der Trefferbereich: die Regex markiert eine
// Form, nicht notwendig die volle Ausdehnung des Geheimnisses. Das Muster
// fuer Verbindungszeichenfolgen endet am "@" — Rechner, Port und Datenbank
// dahinter blieben bei einer Teil-Schwaerzung stehen. Eine Teil-Schwaerzung
// waere deshalb eine Zusicherung, die sie nicht halten kann.
//
// PEM-Bloecke gehen ueber mehrere Zeilen: der Schluessel steht NICHT in der
// BEGIN-Zeile, sondern darunter. Eine reine Zeilenpruefung liesse ihn
// vollstaendig durch. Deshalb wird ab der Trefferzeile bis EINSCHLIESSLICH
// der naechsten Zeile entfernt, auf die blockEnde passt (die Trefferzeile
// selbst eingeschlossen, falls Anfang und Ende auf einer Zeile stehen);
// fehlt ein Ende, bis zum Textende.
//
// Getrennt wird an "\n" und genau so wieder zusammengesetzt; ein etwaiges
// "\r" bleibt Teil seiner Zeile. Ein Text ohne Treffer kommt deshalb
// BYTEGLEICH zurueck — das ist die Positivkontrolle im Selbsttest. Kein
// Muster kann eine Zeilengrenze ueberspannen (alle Zeichenklassen schliessen
// Leerraum aus), die zeilenweise Pruefung findet also dasselbe wie
// pruefeGeheimnisse() ueber den ganzen Text.
function entferneGeheimnisse(text) {
    const zeilen = text.split('\n');
    // Ein Text, der mit "\n" endet, hat hinter dem letzten Umbruch keine
    // Zeile mehr — das leere Endstueck zaehlt weder fuer den Anteil noch
    // als moegliches Blockende.
    const anzahlZeilen = zeilen.length - (zeilen.length > 1 && zeilen[zeilen.length - 1] === '' ? 1 : 0);
    const entfernt = [];
    let i = 0;
    while (i < anzahlZeilen) {
        const getroffen = GEHEIMNIS_MUSTER.filter((m) => m.regex.test(zeilen[i]));
        if (getroffen.length === 0) { i++; continue; }
        const name = getroffen.map((m) => m.name).join(', ');
        const block = getroffen.find((m) => m.blockEnde);
        let bis = i;
        if (block) {
            bis = anzahlZeilen - 1;
            for (let j = i; j < anzahlZeilen; j++) {
                if (block.blockEnde.test(zeilen[j])) { bis = j; break; }
            }
        }
        for (let j = i; j <= bis; j++) {
            entfernt.push({ name, zeile: j + 1 });
            zeilen[j] = zeileEntferntMarker(name);
        }
        i = bis + 1;
    }
    const zuViel = entfernt.length > MAX_ENTFERNTE_ZEILEN
        || (anzahlZeilen >= MIN_ZEILEN_FUER_ANTEIL && entfernt.length > anzahlZeilen * MAX_ENTFERNTER_ANTEIL);
    return { text: zuViel ? '' : zeilen.join('\n'), entfernt, zuViel };
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

    // ===== entferneGeheimnisse(): schwaerzen statt abbrechen (13.09.2026) =====
    // Geprueft wird am RUECKGABETEXT, nicht an entfernt[] allein: eine
    // Liste kann vollstaendig sein, waehrend der Text das Geheimnis noch
    // traegt. Die Werte sind zusammengesetzt (s. o.).
    let zusatzfaelle = 0;
    const pruefen = (bezeichnung, bedingung) => {
        zusatzfaelle++;
        console.log(`${bedingung ? '  ✓' : '  ✗ FEHLT'} ${bezeichnung}`);
        if (!bedingung) fehler++;
    };
    {
        // Ganze Zeile, nicht nur der Trefferbereich: "gymdocu_test" steht
        // HINTER dem "@", an dem das Muster endet, und darf trotzdem nicht
        // mehr auftauchen. Genau 4 Zeilen, 1 entfernt = 25 %: pinnt die
        // Grenze "MEHR als 25 %" — das ist noch KEIN zuViel.
        const text = 'const a = 1;\nconst url = "postgresql://nutzer:geheim@host:5432/gymdocu_test";\nconst b = 2;\nconst c = 3;';
        const r = entferneGeheimnisse(text);
        pruefen('GANZE ZEILE: Datenbankname hinter dem "@" ist mit weg, 1 von 4 Zeilen (= 25 %) ist noch kein zuViel, Nachbarzeilen bleiben',
            r.zuViel === false && r.entfernt.length === 1 && r.entfernt[0].zeile === 2
            && !r.text.includes('geheim') && !r.text.includes('gymdocu_test')
            && r.text.split('\n')[1] === zeileEntferntMarker('Verbindungszeichenfolge mit Passwort')
            && r.text.split('\n')[0] === 'const a = 1;' && r.text.split('\n')[3] === 'const c = 3;');
    }
    const fuellzeilen = (von, bis) => Array.from({ length: bis - von + 1 }, (_, k) => `// Zeile ${von + k}`);
    const pemMaterial = ['MIIE' + 'H'.repeat(60), 'AAAA' + 'I'.repeat(60), 'BBBB' + 'J'.repeat(60)];
    const materialFragmente = ['H'.repeat(20), 'I'.repeat(20), 'J'.repeat(20)];
    const keinFragment = (t) => materialFragmente.every((f) => !t.includes(f));
    {
        // PEM-Block ueber 5 Zeilen (11-15), Material in 12-14; 25 Zeilen
        // gesamt, damit 5 entfernte unter dem 25-%-Deckel bleiben.
        const zeilen = [...fuellzeilen(1, 10), '-----BEGIN PRIVATE KEY-----', ...pemMaterial, '-----END PRIVATE KEY-----', ...fuellzeilen(16, 25)];
        const r = entferneGeheimnisse(zeilen.join('\n'));
        const ausgabe = r.text.split('\n');
        pruefen('PEM-BLOCK MIT ENDE: alle 5 Zeilen 11-15 weg, Material kommt NULL mal vor, Zeilen 10 und 16 bleiben',
            r.zuViel === false && r.entfernt.map((e) => e.zeile).join(',') === '11,12,13,14,15'
            && keinFragment(r.text) && !r.text.includes('BEGIN PRIVATE')
            && ausgabe.length === 25 && ausgabe[9] === '// Zeile 10' && ausgabe[15] === '// Zeile 16'
            && ausgabe.slice(10, 15).every((z) => z === zeileEntferntMarker('privater Schlüssel (PEM)')));
    }
    {
        // Ohne END: bis zum Textende — lieber zu viel weg als Material durch.
        const zeilen = [...fuellzeilen(1, 20), '-----BEGIN RSA PRIVATE KEY-----', ...pemMaterial, '// Zeile 25'];
        const r = entferneGeheimnisse(zeilen.join('\n'));
        pruefen('PEM-BLOCK OHNE ENDE: ab Zeile 21 bis zum Textende weg (21-25), Material kommt NULL mal vor',
            r.zuViel === false && r.entfernt.map((e) => e.zeile).join(',') === '21,22,23,24,25'
            && keinFragment(r.text) && !r.text.includes('// Zeile 25') && r.text.includes('// Zeile 20'));
    }
    {
        // Deckel nach Zeilenzahl: 30 Treffer unter 200 harmlosen (13 %) —
        // der Anteil allein liesse es durch, die Zeilenzahl nicht.
        const geheimZeilen = Array.from({ length: 30 }, (_, k) => `token${k} = "gh` + `p_` + 'K'.repeat(36) + '";');
        const zeilen = [...fuellzeilen(1, 200), ...geheimZeilen];
        const r = entferneGeheimnisse(zeilen.join('\n'));
        pruefen('DECKEL ZEILENZAHL: 30 Geheimniszeilen unter 230 (13 %) sind zuViel, text ist LEER',
            r.zuViel === true && r.text === '' && r.entfernt.length === 30);
    }
    {
        // Fail-closed bei falschem Ende (Nacharbeit 13.09.2026, Kommentar am
        // PEM-Muster): passt KEIN Ende, laeuft die Schwaerzung bis zum
        // Textende und reisst bei grossen Dateien den absoluten Deckel —
        // Abbruch, nicht Durchlass. 100 Zeilen, BEGIN in Zeile 21, dahinter
        // nur "-----END FOO": 80 Zeilen weg > 20.
        const zeilen = [...fuellzeilen(1, 20), '-----BEGIN PRIVATE KEY-----', pemMaterial[0], '-----END FOO', pemMaterial[1], pemMaterial[2], ...fuellzeilen(26, 100)];
        const r = entferneGeheimnisse(zeilen.join('\n'));
        pruefen('PEM OHNE PASSENDES ENDE IN GROSSER DATEI: 80 von 100 Zeilen weg reisst den absoluten Deckel — zuViel, text LEER (fail-closed)',
            r.zuViel === true && r.text === '' && r.entfernt.length === 80 && r.entfernt[0].zeile === 21);
    }
    {
        // Nacharbeit 13.09.2026: enges Fenster. 1 von 1 ist 100 %, aber
        // unter MIN_ZEILEN_FUER_ANTEIL — kein zuViel, der Text IST der Marker.
        const r = entferneGeheimnisse('token = "' + 'gh' + 'p_' + 'O'.repeat(36) + '"');
        pruefen('ENGES FENSTER: 1 Treffer in 1 Zeile ist KEIN zuViel, Text ist genau der Marker',
            r.zuViel === false && r.entfernt.length === 1 && r.text === zeileEntferntMarker('GitHub-Token'));
    }
    {
        // Unterhalb der Mindestzahl zaehlt der Anteil nicht: 2 von 7 waeren
        // 28,6 % — pinnt die Grenze von unten (MIN = 8, nicht 7).
        const zeilen = [...fuellzeilen(1, 7)];
        zeilen[1] = 'a = "' + 'sk' + '-proj-' + 'P'.repeat(40) + '"';
        zeilen[4] = 'b = "' + 'sk' + '-proj-' + 'Q'.repeat(40) + '"';
        const r = entferneGeheimnisse(zeilen.join('\n'));
        pruefen('ENGES FENSTER: 2 Treffer in 7 Zeilen (28,6 %) sind unter der Mindestzahl 8 und KEIN zuViel',
            r.zuViel === false && r.entfernt.length === 2 && !r.text.includes('P'.repeat(20)) && !r.text.includes('Q'.repeat(20)));
    }
    {
        // Ab der Mindestzahl greift der Anteil: 3 von 8 = 37,5 % > 25 %.
        const zeilen = [...fuellzeilen(1, 8)];
        zeilen[1] = 'a = "' + 'sk' + '-proj-' + 'R'.repeat(40) + '"';
        zeilen[4] = 'b = "' + 'sk' + '-proj-' + 'S'.repeat(40) + '"';
        zeilen[7] = 'c = "' + 'sk' + '-proj-' + 'T'.repeat(40) + '"';
        const r = entferneGeheimnisse(zeilen.join('\n'));
        pruefen('DECKEL ANTEIL AB MINDESTZAHL: 3 Treffer in 8 Zeilen (37,5 %) sind zuViel, text ist LEER',
            r.zuViel === true && r.text === '' && r.entfernt.length === 3);
    }
    {
        // Nacharbeit 13.09.2026, Fund 2a: eine Zeile "-----END FOO" mitten im
        // Block darf ihn NICHT beenden — das Material dahinter muss weg.
        // Mit dem alten blockEnde /-----END / kaeme es durch (gemessen).
        const zeilen = [...fuellzeilen(1, 10), '-----BEGIN PRIVATE KEY-----', pemMaterial[0], '-----END FOO', pemMaterial[1], pemMaterial[2], '-----END PRIVATE KEY-----', ...fuellzeilen(17, 26)];
        const r = entferneGeheimnisse(zeilen.join('\n'));
        const ausgabe = r.text.split('\n');
        pruefen('PEM-BLOCK MIT FALSCHEM ENDE: "-----END FOO" in Zeile 13 beendet den Block NICHT, Zeilen 11-16 weg, Material dahinter kommt NULL mal vor, Zeile 17 bleibt',
            r.zuViel === false && r.entfernt.map((e) => e.zeile).join(',') === '11,12,13,14,15,16'
            && keinFragment(r.text) && !r.text.includes('END FOO')
            && ausgabe.length === 26 && ausgabe[16] === '// Zeile 17');
    }
    {
        // Nacharbeit 13.09.2026, Fund 2b: ENCRYPTED wird jetzt erkannt —
        // vorher traf weder BEGIN noch END, der Block ging vollstaendig durch.
        const einzeln = pruefeGeheimnisse('-----BEGIN ENCRYPTED PRIVATE KEY-----');
        const zeilen = [...fuellzeilen(1, 10), '-----BEGIN ENCRYPTED PRIVATE KEY-----', ...pemMaterial, '-----END ENCRYPTED PRIVATE KEY-----', ...fuellzeilen(16, 25)];
        const r = entferneGeheimnisse(zeilen.join('\n'));
        const ausgabe = r.text.split('\n');
        pruefen('PEM ENCRYPTED: BEGIN ENCRYPTED PRIVATE KEY wird erkannt, Block 11-15 weg, END ENCRYPTED beendet ihn, Zeile 16 bleibt',
            einzeln.treffer.some((t) => t.name === 'privater Schlüssel (PEM)')
            && r.zuViel === false && r.entfernt.map((e) => e.zeile).join(',') === '11,12,13,14,15'
            && keinFragment(r.text) && ausgabe.length === 25 && ausgabe[15] === '// Zeile 16');
    }
    {
        // Positivkontrolle: ohne sie waere "nichts durchgelassen" auch dann
        // erfuellt, wenn die Funktion einfach alles schwaerzt.
        const r = entferneGeheimnisse(harmlos);
        pruefen('POSITIVKONTROLLE: harmloser Diff-Ausschnitt kommt BYTEGLEICH zurueck, nichts entfernt, kein zuViel',
            r.text === harmlos && r.entfernt.length === 0 && r.zuViel === false);
    }

    // Sollzahl von Hand eingetragen: faellt ein Muster ersatzlos aus der Liste,
    // liefe der Selbsttest sonst mit weniger Faellen weiter durch und meldete gruen.
    const ERWARTETE_FAELLE = 17;
    const gelaufen = faelle.length + 1 + zusatzfaelle;
    if (gelaufen !== ERWARTETE_FAELLE) {
        console.log(`  ✗ FEHLT: ${gelaufen} Faelle gelaufen, erwartet ${ERWARTETE_FAELLE} — Muster entfernt?`);
        fehler++;
    }
    console.log(fehler ? `\n${fehler} Fehler` : '\nSelbsttest sauber');
    return fehler ? 1 : 0;
}

module.exports = {
    GEHEIMNIS_MUSTER, MAX_ENTFERNTE_ZEILEN, MAX_ENTFERNTER_ANTEIL, MIN_ZEILEN_FUER_ANTEIL,
    pruefeGeheimnisse, entferneGeheimnisse, zeileEntferntMarker, selbsttestRiegel,
};
