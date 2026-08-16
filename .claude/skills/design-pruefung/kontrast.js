#!/usr/bin/env node
'use strict';

/**
 * WCAG-2.1-Kontrastverhältnis-Rechner.
 * Reines Node.js, keine Abhängigkeiten (dieses Repo hat keine package.json).
 *
 * Aufruf:
 *   node kontrast.js "#111418:#e6e6e6" "#e60023:#111418:flaeche" ...
 *     Jedes Argument ist ein Paar "vordergrund:hintergrund" oder
 *     "vordergrund:hintergrund:rolle". Kurzform #abc wird auf #aabbcc
 *     aufgeblasen.
 *
 *     Die Rolle bestimmt die für den Exit-Code MAßGEBLICHE Schwelle —
 *     nicht jedes Paar ist Fließtext:
 *       text       Schrift auf ihrem Hintergrund, Schwelle 4.5 (Standard,
 *                  wenn keine Rolle angegeben ist)
 *       grosstext  Schrift ab 24px bzw. ab 18.66px fett, Schwelle 3.0
 *       flaeche    Nicht-Text-Kontrast, z. B. eine Buttonfläche vor ihrem
 *                  Hintergrund (keine Schrift), Schwelle 3.0
 *     Eine unbekannte Rolle ist ein Aufruffehler (Exit 2), kein stiller
 *     Rückfall auf "text".
 *
 *   node kontrast.js --selbsttest
 *     Prüft die Rechnung gegen bekannte Werte, siehe selbsttest(). Nur OHNE
 *     zusätzliche Farbpaare gültig — --selbsttest zusammen mit Paaren ist
 *     ein Aufruffehler (siehe Exit-Code 2), kein stiller Vorrang für eine
 *     der beiden Aufrufarten.
 *
 * Exit-Codes:
 *   0  alle Paare bestehen ihre MAßGEBLICHE (rollenabhängige) Schwelle
 *      (bzw. Selbsttest: alle PASS)
 *   1  mindestens ein Paar fällt bei seiner maßgeblichen Schwelle durch
 *      (bzw. Selbsttest: FAIL)
 *   2  ungültiger Aufruf (keine/falsche Argumente, ungültige Hex-Farbe,
 *      unbekannte Rolle, --selbsttest zusammen mit Farbpaaren)
 */

const { spawnSync } = require('node:child_process');

// Führendes '#' ist optional, drei oder sechs Hex-Ziffern.
const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Rolle eines Farbpaars -> die für den Exit-Code maßgebliche Schwelle.
// "text" ist die Standardrolle, wenn keine angegeben wird (bisheriges Verhalten).
const ROLLEN_SCHWELLEN = { text: 4.5, grosstext: 3.0, flaeche: 3.0 };
const ROLLEN_ERLAUBT = Object.keys(ROLLEN_SCHWELLEN);

function fehlerUndAbbruch(nachricht) {
  // Setzt nur den Exit-Code und schreibt die Meldung — beendet den Prozess
  // NICHT selbst. process.exit() direkt nach console.log() kann Ausgaben
  // abschneiden, wenn stdout in eine Pipe geht (Node puffert dort asynchron).
  // Aufrufer MÜSSEN nach diesem Aufruf selbst abbrechen (return), sonst
  // läuft der Ablauf weiter und überschreibt den Exit-Code 2 am Ende mit
  // 0 oder 1.
  process.stderr.write(`Fehler: ${nachricht}\n`);
  process.exitCode = 2;
}

function hexZuRgb(hex, kontext) {
  if (typeof hex !== 'string' || !HEX_RE.test(hex.trim())) {
    fehlerUndAbbruch(
      `ungültige Hex-Farbe "${hex}"${kontext ? ` (${kontext})` : ''} — erwartet z. B. #112233 oder #123`
    );
    return undefined; // Abbruch wurde bereits gemeldet; Aufrufer müssen stoppen.
  }
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// Ein sRGB-Kanal (0..255) auf 0..1 normalisiert und linearisiert (WCAG 2.1).
function kanalLinear(kanal255) {
  const c = kanal255 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLeuchtdichte({ r, g, b }) {
  const R = kanalLinear(r);
  const G = kanalLinear(g);
  const B = kanalLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function kontrastverhaeltnis(hexA, hexB, kontext) {
  const leuchtdichteA = relativeLeuchtdichte(hexZuRgb(hexA, kontext));
  const leuchtdichteB = relativeLeuchtdichte(hexZuRgb(hexB, kontext));
  const hell = Math.max(leuchtdichteA, leuchtdichteB);
  const dunkel = Math.min(leuchtdichteA, leuchtdichteB);
  return (hell + 0.05) / (dunkel + 0.05);
}

function urteil(verhaeltnis, schwelle) {
  return verhaeltnis >= schwelle ? 'BESTANDEN' : 'DURCHGEFALLEN';
}

function parsePaar(paarStr) {
  const teile = paarStr.split(':');
  if (teile.length !== 2 && teile.length !== 3) {
    fehlerUndAbbruch(
      `ungültiges Paar "${paarStr}" — erwartet "vordergrund:hintergrund" oder ` +
        `"vordergrund:hintergrund:rolle" (Rolle: ${ROLLEN_ERLAUBT.join(', ')}), ` +
        `z. B. "#111418:#e6e6e6" oder "#e60023:#1c2128:flaeche"`
    );
    return undefined; // Abbruch wurde bereits gemeldet; Aufrufer müssen stoppen.
  }
  const [vordergrund, hintergrund, rolleRoh] = teile;
  // Löst bei ungültiger Hex-Farbe selbst den Abbruch mit Kontext aus und
  // gibt dann undefined zurück — dann hier ebenfalls sofort stoppen.
  if (hexZuRgb(vordergrund, `Vordergrund von "${paarStr}"`) === undefined) return undefined;
  if (hexZuRgb(hintergrund, `Hintergrund von "${paarStr}"`) === undefined) return undefined;

  let rolle = 'text';
  if (rolleRoh !== undefined) {
    if (!ROLLEN_ERLAUBT.includes(rolleRoh)) {
      fehlerUndAbbruch(
        `ungültige Rolle "${rolleRoh}" im Paar "${paarStr}" — erlaubt sind: ${ROLLEN_ERLAUBT.join(', ')}`
      );
      return undefined; // Abbruch wurde bereits gemeldet; Aufrufer müssen stoppen.
    }
    rolle = rolleRoh;
  }

  return { vordergrund, hintergrund, rolle };
}

function formatiereZeile(spalten, breiten) {
  return spalten.map((s, i) => String(s).padEnd(breiten[i])).join('  ');
}

function pruefePaare(paare) {
  const SCHWELLE_FLIESSTEXT = 4.5;
  const SCHWELLE_GROSSTEXT = 3.0;
  const SCHWELLE_BEDIENELEMENT = 3.0;

  const header = [
    'Paar',
    'Verhältnis',
    'Fließtext AA (>=4.5)',
    'Großtext AA (>=3.0)',
    'Bedienelement/Fokus AA (>=3.0)',
    'Maßgeblich',
  ];
  const zeilen = [];
  let massgeblichFehlgeschlagen = false;

  for (const paarStr of paare) {
    const geparst = parsePaar(paarStr);
    if (geparst === undefined) return; // Abbruch wurde bereits gemeldet (Exit-Code 2 gesetzt).
    const { vordergrund, hintergrund, rolle } = geparst;
    const verhaeltnis = kontrastverhaeltnis(vordergrund, hintergrund, paarStr);
    const fliesstext = urteil(verhaeltnis, SCHWELLE_FLIESSTEXT);
    const grosstext = urteil(verhaeltnis, SCHWELLE_GROSSTEXT);
    const bedienelement = urteil(verhaeltnis, SCHWELLE_BEDIENELEMENT);
    // Die für den Exit-Code entscheidende Schwelle hängt von der Rolle des
    // Paars ab — ein Paar ohne Rollenangabe gilt als "text" (4.5).
    const massgeblichesUrteil = urteil(verhaeltnis, ROLLEN_SCHWELLEN[rolle]);
    if (massgeblichesUrteil === 'DURCHGEFALLEN') massgeblichFehlgeschlagen = true;
    zeilen.push([
      `${vordergrund}:${hintergrund}`,
      `${verhaeltnis.toFixed(2)}:1`,
      fliesstext,
      grosstext,
      bedienelement,
      `${rolle}: ${massgeblichesUrteil}`,
    ]);
  }

  const alleZeilen = [header, ...zeilen];
  const breiten = header.map((_, i) =>
    Math.max(...alleZeilen.map((z) => String(z[i]).length))
  );

  console.log(formatiereZeile(header, breiten));
  console.log(breiten.map((b) => '-'.repeat(b)).join('  '));
  for (const zeile of zeilen) {
    console.log(formatiereZeile(zeile, breiten));
  }

  // Nur den Exit-Code setzen und normal zurückkehren, NICHT process.exit()
  // aufrufen: Bei vielen Zeilen (z. B. tausenden Paaren) geht stdout in eine
  // Pipe asynchron, und process.exit() direkt danach schneidet die noch
  // nicht geschriebene Ausgabe ab.
  process.exitCode = massgeblichFehlgeschlagen ? 1 : 0;
}

// Startet dieselbe Datei als eigenen Prozess mit den gegebenen Argumenten
// und liefert nur deren Exit-Code zurück. Für Fälle, in denen der Exit-Code
// selbst das Prüfziel ist — die Datei, die ihn erzeugt, darf ihn sich nicht
// selbst bescheinigen.
function exitCodeUeberUnterprozess(argListe) {
  const ergebnis = spawnSync(process.execPath, [__filename, ...argListe], {
    encoding: 'utf8',
  });
  return ergebnis.status;
}

function selbsttest() {
  const faelle = [];

  let r = kontrastverhaeltnis('#000000', '#ffffff');
  faelle.push({
    name: '#000000 auf #ffffff == 21.00',
    ok: Math.abs(r - 21) < 0.005,
    detail: `berechnet: ${r.toFixed(6)}`,
  });

  r = kontrastverhaeltnis('#ffffff', '#ffffff');
  faelle.push({
    name: '#ffffff auf #ffffff == 1.00',
    ok: Math.abs(r - 1) < 0.005,
    detail: `berechnet: ${r.toFixed(6)}`,
  });

  const rAB = kontrastverhaeltnis('#3366cc', '#f2e6d8');
  const rBA = kontrastverhaeltnis('#f2e6d8', '#3366cc');
  faelle.push({
    name: 'Symmetrie: Verhältnis(a,b) === Verhältnis(b,a) für #3366cc/#f2e6d8',
    ok: rAB === rBA,
    detail: `a→b: ${rAB.toFixed(6)}, b→a: ${rBA.toFixed(6)}`,
  });

  const r767676 = kontrastverhaeltnis('#767676', '#ffffff');
  faelle.push({
    name: '#767676 auf #ffffff >= 4.5',
    ok: r767676 >= 4.5,
    detail: `berechnet: ${r767676.toFixed(6)}`,
  });

  const r777777 = kontrastverhaeltnis('#777777', '#ffffff');
  faelle.push({
    name: '#777777 auf #ffffff < 4.5',
    ok: r777777 < 4.5,
    detail: `berechnet: ${r777777.toFixed(6)}`,
  });

  // Rollenabhängige Schwelle: dasselbe Paar (#e60023 auf #1c2128, 3.38:1)
  // muss je nach Rolle unterschiedlich entscheiden. Das prüft NICHT die
  // Rechnung (die ist oben schon abgedeckt), sondern den EXIT-CODE des
  // gesamten Aufrufs — deshalb über einen Unterprozess, nicht über einen
  // internen Funktionsaufruf dieser Datei.
  const exitFlaeche = exitCodeUeberUnterprozess(['#e60023:#1c2128:flaeche']);
  faelle.push({
    name: 'Exit-Code für "#e60023:#1c2128:flaeche" == 0 (3.38 >= 3.0)',
    ok: exitFlaeche === 0,
    detail: `Exit-Code: ${exitFlaeche}`,
  });

  // grosstext teilt ihre Schwelle (3.0) mit flaeche, wurde aber bisher nie
  // eigens geprüft — eine falsche grosstext-Schwelle wäre unbemerkt grün
  // geblieben. Derselbe Wert (3.38:1) muss als grosstext BESTEHEN, wie unten
  // als text DURCHFALLEN: derselbe Wert, zwei Rollen, zwei Ergebnisse.
  const exitGrosstext = exitCodeUeberUnterprozess(['#e60023:#1c2128:grosstext']);
  faelle.push({
    name: 'Exit-Code für "#e60023:#1c2128:grosstext" == 0 (3.38 >= 3.0)',
    ok: exitGrosstext === 0,
    detail: `Exit-Code: ${exitGrosstext}`,
  });

  const exitText = exitCodeUeberUnterprozess(['#e60023:#1c2128:text']);
  faelle.push({
    name: 'Exit-Code für "#e60023:#1c2128:text" == 1 (3.38 < 4.5)',
    ok: exitText === 1,
    detail: `Exit-Code: ${exitText}`,
  });

  const exitUnsinn = exitCodeUeberUnterprozess(['#e60023:#1c2128:unsinn']);
  faelle.push({
    name: 'Exit-Code für "#e60023:#1c2128:unsinn" == 2 (unbekannte Rolle)',
    ok: exitUnsinn === 2,
    detail: `Exit-Code: ${exitUnsinn}`,
  });

  let fehlgeschlagen = false;
  for (const fall of faelle) {
    console.log(`${fall.ok ? 'PASS' : 'FAIL'}  ${fall.name}  (${fall.detail})`);
    if (!fall.ok) fehlgeschlagen = true;
  }

  // Nur den Exit-Code setzen, siehe Kommentar in pruefePaare() — derselbe
  // Grund: process.exit() direkt nach vielen console.log()-Aufrufen kann bei
  // einer Pipe Ausgaben abschneiden.
  process.exitCode = fehlgeschlagen ? 1 : 0;
}

function main() {
  const argv = process.argv.slice(2);
  const enthaeltSelbsttest = argv.includes('--selbsttest');
  const paare = argv.filter((a) => a !== '--selbsttest');

  // --selbsttest UND Farbpaare zusammen sind ein Aufruffehler, kein
  // stillschweigender Vorrang für eine der beiden Aufrufarten: Wer das
  // Werkzeug so in ein Skript einbaut, soll nicht versehentlich grün
  // bekommen, ohne dass geprüft wurde.
  if (enthaeltSelbsttest && paare.length > 0) {
    fehlerUndAbbruch(
      `ungültiger Aufruf: --selbsttest wurde zusammen mit ${paare.length} ` +
        'Farbpaar(en) übergeben. Erlaubt ist entweder "node kontrast.js ' +
        '--selbsttest" (ohne weitere Argumente) oder "node kontrast.js ' +
        '\\"vordergrund:hintergrund[:rolle]\\" ..." (ohne --selbsttest) — nicht beides.'
    );
    return;
  }

  if (enthaeltSelbsttest) {
    selbsttest();
    return;
  }

  if (paare.length === 0) {
    fehlerUndAbbruch(
      'keine Farbpaare übergeben. Aufruf: node kontrast.js "#111418:#e6e6e6" ' +
        `["#abc:#def:rolle" ...] (Rolle optional, erlaubt: ${ROLLEN_ERLAUBT.join(', ')}; ` +
        'Standard ohne Angabe: text) oder node kontrast.js --selbsttest'
    );
    return;
  }

  pruefePaare(paare);
}

main();
