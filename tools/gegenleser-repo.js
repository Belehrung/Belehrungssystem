#!/usr/bin/env node
'use strict';
//
// tools/gegenleser-repo.js — schickt einen Diff an ein OpenAI-Modell, gibt
// ihm aber zusaetzlich zwei Werkzeuge (suche/lies) an die Hand, mit denen es
// im Repo NACHSEHEN kann, statt aus dem Diff allein zu raten. Stufe 2 der
// Gegenlesung, Betreiber-Freigabe 09.09.2026 ("stufe 2 fuer gpt bauen und
// nutzen").
//
// ANLASS (gemessen, siehe tools/zweitmeinung.js): zwei Laeufe (gpt-5 und
// gpt-5.3-codex) ueber denselben 790-Zeilen-Diff lieferten zusammen NULL
// blockierende und sechs "sollte behoben werden" — alle sechs fielen beim
// Nachmessen. Ihre Form war durchweg "aus dem Diff nicht ersichtlich, ob …"
// und "falls kuenftig …". Der Grund war dort strukturell benannt: die Antwort
// liegt in Dateien, die der Diff nicht zeigt, und das Werkzeug konnte nicht
// nachsehen. Dieses Werkzeug gibt genau das dazu — ob es die Klasse wirklich
// zum Verschwinden bringt, ist damit noch nicht gemessen, nur ermoeglicht.
//
// DIE ERLAUBNISLISTE IST DER KERN: erlaubt ist genau, was "git ls-files" im
// Wurzelverzeichnis auflistet, nichts sonst. Geheimnisse und Nutzerdaten sind
// in diesem Projekt genau das, was NICHT versioniert ist. Siehe pfadPruefen()
// weiter unten fuer die fuenf Pruefschritte.
//
// DER SCHLÜSSEL GEHÖRT NICHT INS REPO — wie bei tools/zweitmeinung.js: aus
// OPENAI_API_KEY oder der Datei, die OPENAI_KEY_DATEI nennt. Fehlt beides:
// Exit 2. Der Geheimnis-Riegel (tools/geheimnis-riegel.js, gemeinsam mit
// zweitmeinung.js benutzt, nicht kopiert) laeuft auf JEDES Funktionsergebnis,
// bevor es in die naechste Anfrage geht. Seit 13.09.2026 wird eine
// Trefferzeile dabei GESCHWAERZT (die ganze Zeile durch einen Marker
// ersetzt, bei PEM der ganze Block) und der Lauf geht weiter; der Bericht
// nennt am Ende jede geschwaerzte Stelle. Reisst bei lies() der Deckel
// (mehr als 20 Zeilen, oder ab 8 Zeilen Ausschnitt mehr als 25 %), wird
// daraus KEIN Gesamtabbruch mehr (Nacharbeit 13.09.2026, Anlass: zwei
// Laeufe brachen an derselben Datei ab, OHNE dass ueberhaupt geprueft
// wurde): main() macht daraus ein abgelehntes Funktionsergebnis, sendet
// weiterhin NICHTS aus diesem AUSSCHNITT, aber der Lauf geht weiter und
// der Bericht nennt ihn am Ende unter "ABGELEHNTE LESUNGEN". Der Deckel
// gilt dabei fuer den ANGEFRAGTEN AUSSCHNITT, nicht fuer die Datei (so
// stand es hier bis zur Gegenlesung vom 13.09.2026 faelschlich): ein
// anderer oder kleinerer Bereich derselben Datei kann danach durchgehen
// und steht dann zugleich unter "GELESENE DATEIEN". SOFORT
// abgebrochen (Exit 3, ohne dass die Anfrage gesendet wird) wird nur noch,
// wenn der EINGEGEBENE Diff ein Geheimnis enthaelt, siehe main().
//
// AUFRUF:
//   node tools/gegenleser-repo.js <diff.txt> --brief=<auftrag.txt>
//                                 [--wurzel=/pfad/zum/repo]
//                                 [--modell=gpt-6-sol] [--max-runden=25]
//                                 [--protokoll=/pfad.jsonl] [--zweck=<text>]
//   node tools/gegenleser-repo.js --selbsttest   (prueft die Riegel, OHNE Netz)
//
// --brief=<datei> ist PFLICHT (seit 12.09.2026, siehe BRIEF_KOPF-Kommentar
// weiter unten): sie liefert den beitragsspezifischen Teil des Auftrags.
// Fehlt sie, bricht das Werkzeug mit Exit 6 ab, statt still gegen einen
// mitgelieferten Standardauftrag zu pruefen.
//
// EXIT-CODES: 0 fertig, 2 kein Schluessel/falscher Aufruf, 3 Geheimnis-Riegel
// auf dem EINGEGEBENEN Diff hat angeschlagen (eine abgelehnte Lesung
// waehrend des Laufs bricht seit 13.09.2026 NICHT mehr ab, siehe oben),
// 4 Runden- oder Mengenlimit erreicht bzw. unbrauchbar konfiguriert (Bericht
// UNVOLLSTAENDIG bzw. gar nicht erst begonnen -- GEGENLESER_MAX_AUSGABE_BYTES
// seit 19.09.2026, siehe maxAusgabeBytesErmitteln()), 5 das Modell hat am
// Ende keinen Text geliefert, 6 kein --brief angegeben oder die Datei ist
// leer/unlesbar, 1 sonstiger Fehler.
//
// LAUF-PROTOKOLL (seit 13.09.2026, TEIL D weiter unten): JEDER echte Lauf --
// Erfolg wie Abbruch ueber Exit 3/4/5 -- traegt sich selbst als Zeile in
// ASTRA-LAEUFE.md ein (Pfad ueberschreibbar ueber ASTRA_LAUFPROTOKOLL, fuer
// den Selbsttest gegen eine Wegwerfkopie). Anlass: eine Regel, die verlangt
// "jeder Lauf wird zaehlbar festgehalten", aber nur in Prosa steht, wird
// vergessen -- siehe CLAUDE.md, "was eine Datei verspricht, muss das
// Werkzeug erzwingen, nicht die Prosa". --zweck=<text> beschriftet die
// Zeile; fehlt der Schalter, wird der Basisname der --brief-Datei genommen.
// Ein Aufruf, bei dem gar kein Lauf stattfand (Exit 2, Exit 6,
// --max-runden < 1, GEGENLESER_MAX_AUSGABE_BYTES unbrauchbar, --selbsttest),
// bekommt KEINE Zeile.

const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { StringDecoder } = require('node:string_decoder');
const { pruefeGeheimnisse, entferneGeheimnisse, zeileEntferntMarker } = require('./geheimnis-riegel');

const ENDPUNKT_OPENAI = 'https://api.openai.com/v1/responses';
// ZWEITER ANBIETER, DeepSeek (Auftrag "DeepSeek als zweiter Anbieter",
// 23.09.2026). GEMESSEN (Executer, 23.09.2026, VOR dem Bau, auf Anweisung
// des Haupt-Agenten -- Rohdaten in
// /tmp/claude-0/.../scratchpad/ds-probe/*.raw): api-docs.deepseek.com nennt
// fuer deepseek-v4-pro auch /v1/responses (Kontext 1M) -- eine echte Probe
// gegen GENAU DIE FELDER, die anfragen() unten ohnehin verschickt, bestand:
//   - "input" (flache Form), "tools" (flache Form {type,name,description,
//     parameters}), "max_output_tokens", "store:false", "truncation:
//     disabled", "stream:true" -- alle angenommen UND wirksam.
//   - "reasoning.effort" wird WERTVALIDIERT (nicht nur angenommen): ein
//     erfundener Wert "ultrahoch" -> HTTP 422 "unknown variant `ultrahoch`,
//     expected one of `none`, `minimal`, `low`, `medium`, `high`, `xhigh`,
//     `ultra`, `max`". Das ist aber ein GLOBALES Enum, keine Pruefung gegen
//     die Stufen, die EIN Modell wirklich kennt -- Einzelheiten und die
//     daraus folgende Vorgabe stehen bei EFFORT_DEEPSEEK weiter unten.
//   - Zwei echte Runden mit function_call/function_call_output liefen
//     sauber durch (echtes Woertchen KWIRZELPFAND-DS-91742 unversehrt
//     zurueckerhalten), und die output[]-Form ist IDENTISCH zu OpenAI:
//     {type:"function_call", id, call_id, name, arguments} in Runde 1,
//     {type:"message", role:"assistant", content:[{type:"output_text",
//     text}]} in Runde 2 -- genau die Form, die textAusAusgabe() und die
//     Rundenschleife in main() unten schon lesen. KEIN Chat-Adapter noetig,
//     nur Endpunkt und Schluessel je Anbieter umschalten (kleinerer Umbau,
//     eine Protokollform).
//   - GEGENPROBE bestanden: ein erfundenes MODELL -> HTTP 400 "The
//     supported API model names are deepseek-flash, deepseek-v4-pro, but
//     you passed …".
//   - EIN UNTERSCHIED zu OpenAI, gemessen und WICHTIG: ein erfundenes FELD
//     ("quatschfeld_xyz") wird NICHT abgelehnt (HTTP 200) -- dieselbe
//     Krankheit wie bei Kimi K3 (CLAUDE.md): "wird angenommen" ist hier
//     KEIN Beleg fuer Wirkung, nur die WERT-Pruefung bekannter Felder
//     (s. reasoning.effort oben) ist scharf.
//   - "metadata" wird zwar angenommen, aber NICHT gespeichert: das
//     response.completed-Objekt zeigt dafuer immer "{}" zurueck, auch wenn
//     befuellt gesendet. Bleibt trotzdem gesetzt (metadatenBauen() weiter
//     unten, unveraendert fuer beide Anbieter) -- schadet nicht, und
//     OpenAI braucht es fuer die eigene Auffindbarkeit.
const ENDPUNKT_DEEPSEEK = 'https://api.deepseek.com/v1/responses';

// Anbieterwahl aus dem Modellnamen (Punkt 1 des Auftrags): "deepseek-*" ist
// DeepSeek, jedes andere Praefix bleibt OpenAI wie bisher. KEIN stiller
// Rueckfall: ein unbekanntes Praefix ist wie heute ein OpenAI-Modell: es
// nimmt weiterhin den OpenAI-Endpunkt/-Schluessel, nicht etwa DeepSeek oder
// ein drittes Verhalten. Ein DeepSeek-Modell OHNE eigenen Schluessel bricht
// LAUT mit Exit 2 ab (schluesselHolen() weiter unten), nie mit dem
// OpenAI-Schluessel weiter.
function istDeepseekModell(modell) {
    return typeof modell === 'string' && modell.startsWith('deepseek-');
}

function endpunktFuerModell(modell) {
    return istDeepseekModell(modell) ? ENDPUNKT_DEEPSEEK : ENDPUNKT_OPENAI;
}
// Pruefstufe. gpt-6-astra kann low|medium|high|xhigh|max (gemessen
// 18.09.2026, kein none/minimal). Die CLAUDE.md verlangt xhigh fuer
// Pruefláufe; max bleibt dem besonders Folgenschweren vorbehalten und
// wird dann ueber die Umgebungsvariable gesetzt.
const EFFORT_OPENAI = process.env.GEGENLESER_EFFORT || 'xhigh';
// Eigene Stufe fuer DeepSeek statt EFFORT_OPENAI mitzubenutzen (Nacharbeit
// 23.09.2026, Hinweis des Haupt-Agenten). GEMESSEN (Executer): "GET
// https://api.deepseek.com/models" nennt fuer deepseek-v4-pro
// effort.supported_levels: ["low","high","max"], default_level "high" --
// "xhigh" (die OpenAI-Vorgabe oben) steht dort NICHT drin. Die Anfrage
// selbst validiert aber nur gegen ein GLOBALES Enum (none/minimal/low/
// medium/high/xhigh/ultra/max, s. Gegenprobe bei ENDPUNKT_DEEPSEEK oben)
// und NICHT gegen die Modell-eigene Liste: sowohl "medium" als auch
// "xhigh" liefen mit HTTP 200 durch und wurden im response.completed-
// Objekt UNVERAENDERT echot -- "wird angenommen" ist hier wieder KEIN
// Beleg fuer Wirkung.
//
// WIRKUNGSPROBE, ueber MEHRERE Laeufe (Nachtrag des Haupt-Agenten
// 23.09.2026: derselbe Verdacht traf auf /v1/chat/completions zu, dort
// blieb "reasoning.effort" wirkungslos, low/max streuten dort ZUFAELLIG,
// wirksam war stattdessen ein FLACHES Top-Level-Feld "reasoning_effort").
// Fuer /v1/responses -- den Endpunkt, den dieses Werkzeug tatsaechlich
// benutzt -- GEGENGEPRUEFT, nicht angenommen:
//   - Das flache Feld "reasoning_effort:'max'" AUF OBERSTER EBENE (ohne
//     das verschachtelte "reasoning") wird zwar mit HTTP 200 angenommen,
//     aber NICHT verarbeitet: das response.completed-Objekt liefert dafuer
//     "reasoning":{"effort":null,...} zurueck -- das flache Chat-
//     Completions-Feld existiert auf /v1/responses schlicht nicht.
//   - Das VERSCHACHTELTE "reasoning.effort" -- das hier gesendete Feld --
//     wirkt dagegen NACHWEISLICH: an derselben Aufgabe (Primzahlen
//     zwischen 900 und 1000, korrektes Ergebnis 13330, in JEDEM Lauf
//     richtig geliefert) DREI unabhaengige Laeufe "low" gegen "max":
//     low = 2203, 190, 704 Denk-Token; max = 3294, 2384, 3897 Denk-Token.
//     "low" liegt in ALLEN DREI Paaren klar UNTER "max" (Faktor 3 bis 12),
//     obwohl "max" selbst stark streut (2384-3897) -- die Streuung ist
//     also Rauschen der Denktiefe, nicht ein Zeichen von Wirkungslosigkeit.
//     high/xhigh wurden nur je EINMAL gemessen (3457 bzw. 3156, im selben
//     Bereich wie max) -- dafuer reicht die Beleglage NICHT, um sie
//     untereinander zu ordnen, nur um "low" von "max" zu unterscheiden.
// Vorgabe deshalb "max", die hoechste vom Modell selbst genannte Stufe
// (GET .../models, s. o.), ueber eine EIGENE Variable aenderbar (nicht
// GEGENLESER_EFFORT, die bleibt fuer OpenAI reserviert).
const EFFORT_DEEPSEEK = process.env.GEGENLESER_EFFORT_DEEPSEEK || 'max';
// Bis 10.09.2026 stand hier /v1/chat/completions mit gpt-5.5 als Vorgabe --
// GEMESSEN als Sackgasse fuer die staerkeren Stufen: gpt-5.6-sol und
// gpt-6-astra melden ueber /v1/chat/completions mit "tools" im Request
// woertlich "Function tools with reasoning_effort are not supported for
// <modell> in /v1/chat/completions. To use function tools, use /v1/responses
// or set reasoning_effort to 'none'." Der angebotene Ausweg reasoning_effort:
// 'none' ist fuer gpt-6-astra selbst eine Sackgasse -- die Herstellerdoku
// nennt 'none' ausdruecklich als von Astra NICHT unterstuetzte Stufe.
//
// UMGEBAUT auf /v1/responses am 12.09.2026, GEMESSEN gegen das echte Konto
// (nicht angenommen): mit "tools" im Request kommt bei gpt-6-astra ein
// output[]-Eintrag {type:"function_call", name, arguments, call_id} zurueck
// -- Funktionsaufrufe funktionieren also, wo /v1/chat/completions ablehnte.
// Unterschiede zum alten Endpunkt, alle an der echten Antwort abgelesen:
//   - "messages" heisst hier "input" (Liste von Objekten mit role/content;
//     bereits gelieferte output[]-Elemente gehen unveraendert zurueck).
//   - Werkzeuge werden FLACH uebergeben: {type:"function", name,
//     description, parameters} -- kein "function"-Unterobjekt mehr.
//   - Ein Funktionsaufruf traegt sein eigenes "id" (Item-ID, z. B. "fc_..."),
//     ZUSAETZLICH ein "call_id" (z. B. "call_..."). Das Werkzeugergebnis geht
//     als {type:"function_call_output", call_id, output} zurueck -- an das
//     call_id, nicht an das id.
//   - Ein Textbericht steckt in einem output[]-Eintrag {type:"message",
//     role:"assistant", content:[{type:"output_text", text}]}, nicht mehr in
//     choices[0].message.content.
//   - "max_completion_tokens" heisst "max_output_tokens" (gemessen: wird
//     angenommen und im Antwort-Objekt gespiegelt).
//   - usage traegt "input_tokens"/"output_tokens" statt "prompt_tokens"/
//     "completion_tokens" (gemessen, siehe kostenSchaetzen()-Aufrufer unten).
//   - temperature/top_p/top_logprobs: diese Datei hat nie eines der drei
//     gesendet (nachgesehen) -- nichts zu entfernen, nur festgehalten, damit
//     es nicht versehentlich nachgezogen wird.
//
// LEHRE, damit der Fehler von damals nicht wiederkommt: eine Ein-Wort-Anfrage
// OHNE Werkzeuge beweist NICHT, dass ein Modell auf dem echten Weg
// funktioniert -- die Messung oben lief ausdruecklich MIT "tools" im Request
// und mit einem echten, mehrrundigen Aufruf inklusive zurueckgeschicktem
// Funktionsergebnis.
//
// --modell= bleibt der Schalter zum Vergleichen. Auf DIESEM Endpunkt sind
// GEMESSEN: gpt-6-astra (12.09.2026) und gpt-5.6-sol (18.09.2026) -- letzteres
// mit "tools" im Request UND einer ZWEITEN Runde samt zurueckgeschicktem
// function_call_output, also genau der Nachweis, den die LEHRE oben verlangt.
// Abgelesen: output[] traegt {type:"function_call", name:"lies_datei",
// arguments:{"pfad":"core/db.js"}, call_id:"call_..."}, Runde 2 antwortet als
// {type:"message"}; store:false bestaetigt, effort xhigh angenommen. Jedes
// ANDERE Modell laeuft hier ungeprueft; vor Verlass darauf erst messen, nicht
// annehmen, dass /v1/responses fuer jede Stufe gleich funktioniert.
//
// VORGABE seit 23.09.2026 gpt-6-sol -- Betreiber-Entscheidung ("ja ab jetzt
// sol 6"). Davor seit 18.09.2026 gpt-5.6-sol (Kosten gegen gpt-6-astra).
// Grundlage: EIN wortgleicher A/B an der Planpruefung "Extrarunde
// ladebestand" (ASTRA-LAEUFE.md, 23.09.2026): 8 statt 9 Befunde, alle
// getragen, jede Spur mit Eigenem, 7,15 $ statt 14,54 $. Der Weg (Werkzeuge,
// zweite Runde, store:false, effort xhigh) ist fuer gpt-6-sol gemessen.
// WAS DAMIT NICHT BELEGT IST: dass gpt-6-sol besser oder gleich gut prueft --
// eine Stichprobe von eins traegt eine Beobachtung, keine Rangfolge.
const VORGABE_MODELL = 'gpt-6-sol';
// 25 reichten in Messlauf 1 (09.09.2026) NICHT: das Modell rief je Antwort
// genau EINEN Werkzeugaufruf auf (gemessen: 25 Antworten, 25 Aufrufe) und lief
// mitten in der Arbeit ins Limit. Der Abbruch war richtig -- ein Lauf, der
// abbricht, hat NICHTS geliefert, nicht "keine Befunde" -- aber die Grenze war
// zu eng gesetzt. Zusammen mit dem Buendel-Hinweis im Auftragstext unten.
const VORGABE_MAX_RUNDEN = 40;
const MAX_ANTWORT_TOKEN = 24000;
const MAX_SUCHE_ZEILEN = 80;
const MAX_LIES_ZEILEN = 400;
// Deckel fuer die SUMME aller Funktionsergebnisse (gelesene Ausschnitte).
// 600 KiB reichen fuer eine DIFF-Pruefung -- dafuer ist das Werkzeug gebaut.
// Fuer eine BESTANDSSUCHE ueber das ganze Repo reichen sie NICHT: gemessen am
// 18.09.2026 brach ein Sicherheitslauf nach 36 gelesenen Dateien bei 620900
// Bytes ab, der Bericht war damit verloren (nach unserer Hausregel: NICHTS
// geliefert, nicht "keine Befunde"). Deshalb hebbar, Voreinstellung
// unveraendert -- wer hebt, tut es bewusst und traegt die Kosten.
//
// B2 (Review-Bot-Befund an PR #45, GEMESSEN 19.09.2026): "Number(...) ||
// Vorgabe" fing nur 0/leer/nicht-numerisch ab. GEMESSEN blieben unbemerkt
// durch:
//   "-1"       -> -1        (bricht beim ERSTEN Werkzeugergebnis ab)
//   "1.5"      -> 1.5
//   "Infinity" -> Infinity  (schaltet den Deckel STILL aus)
// Ein ausgeschalteter Deckel, den niemand bemerkt, ist genau unsere teuerste
// Klasse. Deshalb jetzt eine PURE Funktion statt der stillschweigenden
// Rueckfallkette, aufgerufen aus main() (dort die Abbruch-Zeile, Muster wie
// bei den anderen Vorbedingungen) -- NICHT gesetzt/leer -> Vorgabe wie
// bisher, GESETZT aber unbrauchbar -> wirft LAUT, mit Wert und erwarteter
// Form. "Number.isInteger(zahl) && zahl > 0" deckt dabei ALLE Faelle in
// einer Bedingung ab, auch "Infinity" (Number.isInteger(Infinity) === false)
// und "0" (nicht positiv) -- keine Sonderfallliste noetig.
const MAX_AUSGABE_BYTES_VORGABE = 600 * 1024;
function maxAusgabeBytesErmitteln(rohwert) {
    if (rohwert === undefined || rohwert === '') return MAX_AUSGABE_BYTES_VORGABE;
    const zahl = Number(rohwert);
    if (Number.isInteger(zahl) && zahl > 0) return zahl;
    throw new Error(
        `GEGENLESER_MAX_AUSGABE_BYTES="${rohwert}" ist unbrauchbar -- erwartet wird eine `
        + `positive, endliche Ganzzahl (z. B. "900000"), oder die Variable bleibt ungesetzt.`);
}

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
    'gpt-6-luna': { rein: 0.20, raus: 0.75 },
    // Zweiter Anbieter DeepSeek (23.09.2026), aus
    // api-docs.deepseek.com/quick_start/pricing, Spitzenzeit als obere
    // Schranke (DeepSeek staffelt nach Tageszeit, off-peak ist guenstiger --
    // wir schaetzen mit dem teureren Wert). Endpunkt und Format s.
    // ENDPUNKT_DEEPSEEK oben.
    'deepseek-v4-pro': { rein: 1.32, raus: 3.96 },
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

// BRIEF_KOPF und PRUEFPUNKTE_ALLGEMEIN sind der FESTE Teil des Auftrags, der
// fuer JEDEN Beitrag dieses Systems gilt. Der beitragsspezifische Teil (bis
// 10.09.2026 hier als Absatz "Der Zweig baut ein neues Feld ..." fest
// eingebaut) kommt seit dem 12.09.2026 NICHT MEHR aus dieser Datei, sondern
// ausschliesslich aus der per --brief=<datei> uebergebenen Datei -- siehe
// main(). ANLASS (gemessen, siehe --brief-Pruefung in main()): ein Lauf mit
// einem FREMDEN Diff (OWASP-Haertung: Host-Pruefung, PIN-Reset-Drossel,
// execFile) gegen den bis dahin fest eingebauten frist_herkunft-Auftrag
// lieferte EXIT 0 und 213 Zeilen formal tadellosen Bericht -- ueber Felder
// (`frist_herkunft`, `hersteller_intervall_monate`) und eine Datei
// (routes/admin/geraete.js), die der Diff gar nicht anfasste. Zwei Befunde
// waren als "blockierend" ausgewiesen. Ein Werkzeug, das das falsche prueft,
// ist schlimmer als keines -- deshalb bricht main() OHNE --brief jetzt LAUT
// ab, statt still gegen einen mitgelieferten Standardauftrag zu pruefen.
//
// Die vormaligen Punkte 3 ("DER SCHREIBWEG") und 4 ("DIE BEDINGUNG DES
// HINWEISES") waren beitragsspezifisch (frist_herkunft) und sind mit dem
// entfernten Absatz ebenfalls hier herausgeflogen -- sie gehoeren kuenftig in
// die jeweilige Brief-Datei. Die verbliebenen vier Punkte sind nur
// umnummeriert (vormals 1, 2, 5, 6), am Wortlaut unveraendert; ihr Ursprung
// bleibt derselbe wie vorher: woertlich aus /tmp/claude-0/codereview.py
// uebernommen (Auftrag Teil B) — der dortige Sechs-Punkte-Auftrag ist erprobt
// (siehe tools/zweitmeinung.js-Kopf).
const BRIEF_KOPF = "Du bist unabhängiger Code-Gegenleser für ein Node.js/PostgreSQL-System\n(GymDocu, Arbeitsschutz-Dokumentation für Fitnessstudios). Unten stehen ZWEI\nAbschnitte: zuerst der beitragsspezifische Auftrag, danach ein Diff.\n\n";

const PRUEFPUNKTE_ALLGEMEIN = "PRÜFE ZUSÄTZLICH IMMER IN DIESER REIHENFOLGE — und melde zu jedem Punkt auch,\nwenn du nichts gefunden hast:\n\n1. ZUSICHERUNGEN, DIE NICHT FEHLSCHLAGEN KÖNNEN. Für jede Zusicherung in der\n   Testdatei: welche EINE Zeile müsste man ändern, damit genau sie fällt? Bezieht\n   eine ihren Sollwert aus dem, was sie bewachen soll (z. B. Vergleich gegen\n   dieselbe Konstante auf beiden Seiten, oder eine Vergleichsmenge, die aus\n   derselben Schleife gefüllt wird, die geprüft wird)? Gibt es eine Sollzahl, und\n   ist sie ein von Hand eingetragenes Literal? Erzwingt der Vorzustand das\n   erwartete Ergebnis ohnehin?\n\n2. ZEITZONEN. Ein Date aus lokalen Werten gebaut (`new Date(j,m,t)`, `setDate`,\n   `setMonth`) und dann über `toISOString()` gelesen, ergibt den UTC-Kalendertag —\n   östlich von UTC oft den Vortag. Richtig wären `formatBerlinDate()` bzw.\n   `plusMonate()`/`plusTage()` aus `core/datum.js`. WICHTIG: unter UTC liefert\n   dieser Fehler zufällig das richtige Ergebnis, der CI-Runner läuft auf UTC.\n   Suche nach der KOMBINATION, nicht nach `toISOString` allein.\n\n3. FEHLERBEHANDLUNG. Ein DB-Fehler in einem Teilschritt darf nicht die ganze\n   Seite reissen. Ein verschluckter Fehler, der als \"alles in Ordnung\"\n   durchgeht, ist schlimmer als ein lauter Abbruch.\n\n4. SQL. Trägt jede Abfrage den Mandantenbezug (`studio_id`)? Ist die Migration\n   idempotent? Passt sie zum Schema?\n\nMELDE je Befund: Datei und Zeile aus dem Diff, die betroffene Zeichenkette\nwörtlich, was falsch ist, und die Schwere (blockierend / sollte behoben werden /\nAnmerkung). Erfinde nichts; wo du etwas nicht aus dem Diff entscheiden kannst,\nsag das ausdrücklich. Antworte auf Deutsch.\n";

// Genau dieser eine Absatz (Auftrag Teil B), der den Sinn dieses Werkzeugs
// gegenueber tools/zweitmeinung.js ausmacht: es DARF nachsehen.
const WERKZEUG_ABSATZ = "DU HAST WERKZEUGE. Behaupte nichts, was du nachsehen kannst, und schreibe\nNIEMALS \"aus dem Diff nicht ersichtlich\" oder \"falls künftig\" — sieh\nstattdessen nach. Prüfe insbesondere: werden die neuen Spalten in der\nSELECT-Abfrage der betroffenen Seiten überhaupt ausgewählt? Wie werden die\nWerte beim Schreiben normalisiert? Gibt es weitere Schreibwege ausserhalb\ndes Diffs? Bevor du einen Befund meldest, sieh dir die tragende Stelle im\nOriginal an und zitiere sie mit Datei und Zeilennummer. Ein Befund ohne\nnachgesehene Fundstelle ist keiner.\n\nDu darfst und sollst MEHRERE Werkzeugaufrufe in EINER Antwort buendeln, wenn sie\nvoneinander unabhaengig sind — das spart Runden, und die Rundenzahl ist begrenzt.";

// Baut den vollstaendigen Auftragstext aus dem beitragsspezifischen
// Brief-Inhalt (--brief=<datei>, siehe main()) und dem festen Teil zusammen.
// KEIN eingebauter Standardauftrag -- briefInhalt kommt IMMER vom Aufrufer.
function auftragstextBauen(briefInhalt) {
    return BRIEF_KOPF + briefInhalt.trim() + '\n\n' + PRUEFPUNKTE_ALLGEMEIN + '\n' + WERKZEUG_ABSATZ;
}

// FLACH, ohne "function"-Unterobjekt -- so verlangt es /v1/responses (siehe
// Endpunkt-Umbau oben, gemessen 12.09.2026: mit dieser Form kommt ein
// output[]-Eintrag vom Typ "function_call" zurueck, mit "function"-Huelle
// lehnt die API ab). fuer /v1/chat/completions waere die verschachtelte Form
// noetig gewesen -- dieses Werkzeug spricht nur noch /v1/responses.
const WERKZEUGE = [
    {
        type: 'function',
        name: 'suche',
        description: 'Volltextsuche ueber alle Dateien der Erlaubnisliste (das ist genau, '
            + 'was "git ls-files" im Projekt auflistet). Liefert Treffer als '
            + '"pfad:zeilennummer:inhalt", hoechstens ' + MAX_SUCHE_ZEILEN + ' Zeilen; gibt es '
            + 'mehr, werden die ersten ' + MAX_SUCHE_ZEILEN + ' UND die Gesamtzahl gemeldet.',
        parameters: {
            type: 'object',
            properties: {
                muster: {
                    type: 'string',
                    description: 'Regulaerer Ausdruck (JavaScript-Syntax), pro Zeile geprueft.',
                },
                dateimuster: {
                    type: 'string',
                    description: 'Optionaler Glob (* und ?) gegen den relativen Pfad, um die '
                        + 'Suche einzugrenzen, z. B. "*.js" oder "routes/admin/*".',
                },
            },
            required: ['muster'],
        },
    },
    {
        type: 'function',
        name: 'lies',
        description: 'Liefert einen Zeilenbereich einer einzelnen Datei aus der '
            + 'Erlaubnisliste, jede Zeile mit ihrer Nummer. Hoechstens ' + MAX_LIES_ZEILEN
            + ' Zeilen je Aufruf; ein groesserer Bereich wird gekuerzt und das wird gemeldet.',
        parameters: {
            type: 'object',
            properties: {
                pfad: { type: 'string', description: 'Pfad relativ zum Projekt-Wurzelverzeichnis.' },
                von: { type: 'integer', description: 'Erste Zeile, 1-basiert.' },
                bis: { type: 'integer', description: 'Letzte Zeile, 1-basiert, inklusive.' },
            },
            required: ['pfad', 'von', 'bis'],
        },
    },
];

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

// Gemeinsamer Kern fuer beide Anbieter -- "gleiche Behandlung" (Auftrag
// Punkt 2): env-Variable zuerst, sonst die Datei, die die zweite
// Variable nennt, getrimmt; sonst null. NIE ueber argv, NIE ins Protokoll
// (protokollSchreiben() bekommt keinen Header uebergeben, unveraendert),
// NIE in eine Fehlermeldung (main() nennt unten nur die Variablennamen,
// nie den Wert).
function schluesselHolenAus(envName, dateiEnvName) {
    if (process.env[envName]) return process.env[envName].trim();
    const pfad = process.env[dateiEnvName];
    if (!pfad) return null;
    let wert;
    try {
        wert = fs.readFileSync(pfad, 'utf8').trim();
    } catch (e) {
        return null;
    }
    return wert || null;
}

// modell entscheidet den Anbieter (istDeepseekModell() oben): OPENAI_* fuer
// OpenAI-Modelle, DEEPSEEK_* fuer "deepseek-*" -- niemals einer fuer den
// anderen (kein stiller Rueckfall, s. Kommentar bei istDeepseekModell()).
function schluesselHolen(modell) {
    return istDeepseekModell(modell)
        ? schluesselHolenAus('DEEPSEEK_API_KEY', 'DEEPSEEK_KEY_DATEI')
        : schluesselHolenAus('OPENAI_API_KEY', 'OPENAI_KEY_DATEI');
}

// Hart gesperrt, AUCH wenn versioniert (Schritt 5 der Erlaubnispruefung).
function istHartGesperrt(relPfad) {
    return path.basename(relPfad).startsWith('.env')
        || relPfad.endsWith('.key')
        || relPfad.endsWith('.pem');
}

// Modul-Zustand fuer EINEN Lauf, von wurzelEinrichten() gesetzt. Der
// Selbsttest ruft wurzelEinrichten() mehrfach mit unterschiedlichen
// Wegwerf-Wurzeln auf; das ist gewollt, jeder CLI-Lauf richtet nur einmal ein.
let wurzelAbsolut = null;
let wurzelReal = null;
let versionierteDateien = null;

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
    if (!versionierteDateien.has(relativ)) {
        return { ok: false, grund: `nicht von "git ls-files" erfasst (nicht versioniert): ${relativ}` };
    }
    // Schritt 5: zusaetzlich hart gesperrt, auch wenn versioniert.
    if (istHartGesperrt(relativ)) {
        return { ok: false, grund: `gesperrter Dateiname (.env*/.key/.pem): ${relativ}` };
    }
    return { ok: true, absolut: real, relativ };
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
    for (const relPfad of versionierteDateien) {
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

// Dispatcht auf die beiden Werkzeuge; eine unbekannte Funktion (Modell-
// Halluzination) ist eine gewoehnliche Ablehnung, kein Absturz.
function werkzeugAufrufen(name, argumente) {
    if (name === 'suche') return werkzeugSuche(argumente.muster, argumente.dateimuster);
    if (name === 'lies') return werkzeugLies(argumente.pfad, argumente.von, argumente.bis);
    return { text: `abgelehnt: unbekannte Funktion "${name}"`, abgelehnt: true };
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

// mitWerkzeugen=false ist der harte Riegel der letzten zwei Runden (Auftrag
// Teil 2c): OHNE "tools" im Request KANN das Modell keine Funktion mehr
// aufrufen, nur noch Text liefern. Vorgabe true, damit ein Aufrufer, der den
// Parameter vergisst, nicht versehentlich den Riegel auf JEDE Runde legt.
// Feste Metadaten fuer /v1/responses (Streaming-Umbau 19.09.2026, Punkt 2 des
// Auftrags): ein KONSTANTER Zweckbegriff plus das Tagesdatum, macht einen
// Lauf bei OpenAI wiederfindbar. AUSDRUECKLICH KEINE Ableitung aus --zweck,
// dem Basisnamen der --brief-Datei oder Auftragstexten -- --zweck ist freier
// Text und faellt ohne eigenen Wert auf genau diesen Basisnamen zurueck
// (siehe protokollZweck() weiter unten, ein ANDERES Feld fuer ASTRA-LAEUFE.md)
// -- das waeren Pfade und Auftragsinhalte aus dem Repo, die hier nicht
// hinsollen (GP10 sichert das gegen einen absichtlich auffaelligen --zweck
// UND Briefdateinamen zu).
function metadatenBauen() {
    return {
        werkzeug: 'gegenleser-repo.js',
        zweck: 'stufe-2-diff-gegenlesung',
        datum: new Date().toISOString().slice(0, 10),
    };
}

function anfragen(schluessel, modell, verlauf, mitWerkzeugen = true) {
    const koerper = JSON.stringify({
        model: modell,
        input: verlauf,
        ...(mitWerkzeugen ? { tools: WERKZEUGE } : {}),
        max_output_tokens: MAX_ANTWORT_TOKEN,
        // ZIELKONFIGURATION (CLAUDE.md, "Aufrufmuster"). Sie stand dort seit
        // dem 12.09.2026 und war hier NIE gesetzt — gemessen am 18.09.2026:
        // der Request trug genau vier Felder.
        //
        // store:false ist der schwerwiegende Teil, nicht effort. GEMESSEN mit
        // Gegenprobe in beide Richtungen: OHNE das Feld ist eine Antwort
        // hinterher ueber GET /v1/responses/<id> ABRUFBAR — die Voreinstellung
        // ist true, die Anfrage wird aufbewahrt; MIT store:false liefert
        // derselbe Abruf "Response with id ... not found". Jeder Lauf ueber
        // dieses Werkzeug lag damit auf fremden Servern, und zwar ausgerechnet
        // der materialreichste: der Pruefer holt sich hier selbst Quelltext
        // aus dem Repo (ein Lauf am 18.09. las 3,6 Mio. Token).
        store: false,
        // effort: die CLAUDE.md verlangt seit 18.09.2026 xhigh fuer Pruefungen
        // ("high war die MITTE, nicht das Maximum" — gemessen ueber elf
        // Modelle). Ohne dieses Feld lief jeder Lauf auf der Voreinstellung.
        // Je Anbieter eine eigene Stufe (EFFORT_DEEPSEEK oben, Nacharbeit
        // 23.09.2026) -- deepseek-v4-pro kennt laut Herstellerauskunft nur
        // low/high/max, xhigh war dort unbelegt.
        reasoning: { effort: istDeepseekModell(modell) ? EFFORT_DEEPSEEK : EFFORT_OPENAI },
        // laut scheitern statt still kuerzen — unsere Regel "leeres Ergebnis
        // ist nicht sauberes Ergebnis".
        truncation: 'disabled',
        // stream:true (Streaming-Umbau 19.09.2026). GEMESSEN 18.09.2026: eine
        // NICHT-streamende Anfrage an GENAU DIESEN Endpunkt wird von diesem
        // Egress-Proxy bei 300,3 s hart abgeschnitten (drei Versuche,
        // 300.313/300.383/300.3 ms, curl-Exit 56, keine Antwortdatei) -- das
        // Zeitlimit von 20 Minuten weiter unten kann dadurch nie wirken.
        // GEMESSEN 19.09.2026 (PR-#460-Diffpruefung, MIT "tools" im Request):
        // derselbe Endpunkt lief mit stream:true 442 s durch, HTTP 200,
        // 1.519.478 SSE-Bytes, genau EIN Abschluss-Ereignis -- ein Lauf, den
        // der nicht-streamende Weg 142 s vor dem Ergebnis weggeworfen haette.
        // max_tool_calls wird dabei BEWUSST NICHT gesetzt: die CLAUDE.md nennt
        // es nur fuer web_search, dieses Werkzeug bremst schon ueber
        // --max-runden, und eine UNGEMESSENE Obergrenze wuerde genau die
        // Klasse (ein stiller Abbruch, der wie ein Ergebnis aussieht)
        // einfuehren, die dieser Umbau beseitigen soll.
        stream: true,
        // metadata -- siehe metadatenBauen() oben.
        metadata: metadatenBauen(),
    });
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

        const anfrage = https.request(endpunktFuerModell(modell), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${schluessel}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(koerper),
            },
            timeout: 20 * 60 * 1000,
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
        anfrage.on('timeout', () => { anfrage.destroy(new Error('Zeitueberschreitung nach 20 Minuten')); });
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

// Protokoll: JEDE gesendete Nachricht und jede Funktionsantwort, einmal pro
// Zeile. Absichtlich NIE der rohe HTTP-Request (der trueg den
// Authorization-Header) — nur die input[]-Elemente (frueher messages[]) und
// Zaehl-Metadaten laufen hier durch, der Header wird nirgends an diese
// Funktion uebergeben.
let protokollPfadAktuell = null;
function protokollSchreiben(eintrag) {
    if (!protokollPfadAktuell) return;
    fs.appendFileSync(protokollPfadAktuell, JSON.stringify({ zeit: new Date().toISOString(), ...eintrag }) + '\n');
}

function konsoleUsage() {
    console.error('Aufruf: node tools/gegenleser-repo.js <diff.txt> --brief=<auftrag.txt>');
    console.error('        [--wurzel=/pfad/zum/repo] [--modell=gpt-6-sol] [--max-runden=25]');
    console.error('        [--protokoll=/pfad.jsonl] [--zweck=<text>]');
    console.error('        node tools/gegenleser-repo.js --selbsttest');
    console.error('--brief ist PFLICHT: liefert den beitragsspezifischen Teil des Auftrags,');
    console.error('kein eingebauter Standardauftrag mehr (siehe Dateikopf).');
    console.error('--zweck beschriftet die Zeile im Lauf-Protokoll (ASTRA-LAEUFE.md); fehlt');
    console.error('er, wird der Basisname der --brief-Datei genommen.');
    console.error('--modell=deepseek-... waehlt DeepSeek als Anbieter (z. B. deepseek-v4-pro);');
    console.error('der Schluessel kommt dann aus DEEPSEEK_API_KEY oder DEEPSEEK_KEY_DATEI statt');
    console.error('aus OPENAI_API_KEY/OPENAI_KEY_DATEI (gemessen 23.09.2026, siehe Dateikopf).');
}

function argumenteLesen(argv) {
    const optionen = {
        diffPfad: null,
        briefPfad: null,
        wurzel: process.cwd(),
        modell: VORGABE_MODELL,
        maxRunden: VORGABE_MAX_RUNDEN,
        protokollPfad: null,
        zweck: null,
    };
    for (const a of argv) {
        if (a.startsWith('--wurzel=')) { optionen.wurzel = a.slice('--wurzel='.length); continue; }
        if (a.startsWith('--brief=')) { optionen.briefPfad = a.slice('--brief='.length); continue; }
        if (a.startsWith('--modell=')) { optionen.modell = a.slice('--modell='.length); continue; }
        if (a.startsWith('--max-runden=')) { optionen.maxRunden = Number(a.slice('--max-runden='.length)); continue; }
        if (a.startsWith('--protokoll=')) { optionen.protokollPfad = a.slice('--protokoll='.length); continue; }
        if (a.startsWith('--zweck=')) { optionen.zweck = a.slice('--zweck='.length); continue; }
        if (!optionen.diffPfad && !a.startsWith('--')) { optionen.diffPfad = a; continue; }
        throw new Error(`Unbekanntes Argument: ${a}`);
    }
    if (!optionen.protokollPfad) {
        optionen.protokollPfad = path.join(os.tmpdir(), `gegenleser-repo-${Date.now()}-${process.pid}.jsonl`);
    }
    return optionen;
}

// Rundenbudget sichtbar machen (Auftrag Teil 2, "der Kern des Auftrags"):
// bisher erfuhr das Modell NIE, wie viele Runden bleiben, und las weiter,
// bis das Limit hart zuschlug -- Anlass waren zwei Laeufe in Folge ohne
// Bericht, der zweite nach 2,78 Mio. Eingabe-Token fuer nichts (siehe
// Auftrag). Drei Stufen: (a) jede Runde einen schlichten Stand, (b) ab 70%
// verbrauchter Runden ein deutlicher Hinweis, jetzt zusammenzufassen,
// (c) in den letzten zwei Runden die harte Aufforderung, JETZT den Bericht
// zu liefern -- diese Stufe faellt zeitgleich mit mitWerkzeugen=false in
// anfragen() zusammen, das ist der eigentliche Riegel, diese Nachricht ist
// nur seine Ankuendigung ans Modell.
function rundenHinweisBauen(runde, maxRunden, istLetzteZweiRunden, ist70Prozent) {
    const verbleibend = maxRunden - runde;
    let text = `[Rundenstand: Runde ${runde} von ${maxRunden} -- danach noch ${verbleibend} moeglich.]`;
    if (istLetzteZweiRunden) {
        text += ' LETZTE RUNDE(N): Ab jetzt bekommst du KEINE Werkzeuge mehr angeboten. '
            + 'Liefere JETZT deinen Bericht als Text -- mit dem, was du bisher geprueft hast, '
            + 'und nenne ausdruecklich, was du deshalb NICHT mehr pruefen konntest.';
    } else if (ist70Prozent) {
        text += ' Du hast ueber 70% der Runden verbraucht. Fasse jetzt zusammen, was du bisher '
            + 'hast, statt weiter zu lesen -- die verbleibenden Runden reichen nur noch fuer das '
            + 'Noetigste.';
    }
    return text;
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

// ===================== TEIL D: LAUF-PROTOKOLL (ASTRA-LAEUFE.md) ============
//
// Haus-Regel seit dem 12.09.2026: "Jeder Lauf wird zaehlbar festgehalten."
// Anlass fuer DIESES Werkzeug (13.09.2026): ein Lauf (7,47 $) wurde von Hand
// vergessen einzutragen -- eine Stunde, nachdem dieselbe Regel geschaerft
// worden war. "Was eine Datei verspricht, muss das Werkzeug erzwingen, nicht
// die Prosa." Deshalb traegt sich JEDER echte Lauf (Erfolg wie Abbruch ueber
// Exit 3/4/5) hier selbst ein -- NICHT ein Aufruf, bei dem gar kein Lauf
// stattfand (fehlender Schluessel/Brief, --selbsttest, oder
// --max-runden < 1, das noch VOR wurzelEinrichten()/dem Diff-Lesen abbricht
// und deshalb noch nicht einmal eine Zeilenzahl zu melden haette).
//
// Pfad ueberschreibbar ueber ASTRA_LAUFPROTOKOLL -- der Selbsttest laeuft
// AUSSCHLIESSLICH gegen Wegwerfkopien, NIE gegen die echte Datei (siehe
// Sicherheitsnetz am Kopf von selbsttest()).
const LAUFPROTOKOLL_MARKE = '<!-- NEUE-LAUFZEILE-HIER:';

function laufprotokollPfad() {
    return process.env.ASTRA_LAUFPROTOKOLL || path.join(__dirname, '..', 'ASTRA-LAEUFE.md');
}

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

// Baut die Tabellenzeile und versucht, sie einzutragen. Ein Fehlschlag wird
// LAUT und ZWEIMAL gemeldet (hier UND als allerletzte Zeile der
// main()-Ausgabe, weil jeder Aufruf dieser Funktion unten immer NACH
// zusammenfassungAusgeben() steht) -- der Exit-Code des Laufs bleibt in
// JEDEM Fall unveraendert: der Pruefbericht selbst hat schon 7-15 $
// gekostet, eine Buchhaltungspanne darf ihn nicht entwerten. Stilles
// Scheitern ist verboten.
function laufprotokollVersuchen(zweck, material, kostenText) {
    const zeile = `| ${laufprotokollDatum()} | ${laufprotokollZelle(zweck)} | ${laufprotokollZelle(material)} `
        + `| — | — | — | ${laufprotokollZelle(kostenText)} |`;
    const ergebnis = laufprotokollEinfuegen(laufprotokollPfad(), zeile);
    if (!ergebnis.ok) {
        console.error(`WARNUNG: Lauf-Protokollzeile in ASTRA-LAEUFE.md konnte NICHT eingetragen werden: ${ergebnis.grund} `
            + 'Der Pruefbericht oben ist trotzdem das Ergebnis dieses Laufs und hat bereits Kosten '
            + 'verursacht -- er wird deshalb NICHT verworfen, der Exit-Code bleibt unveraendert.');
        console.error(`LETZTE ZEILE -- PROTOKOLLEINTRAG FEHLGESCHLAGEN: ${ergebnis.grund}`);
    }
    return ergebnis.ok;
}

async function main(argvUeberschreibung) {
    const argumente = argvUeberschreibung || process.argv.slice(2);
    if (argumente[0] === '--selbsttest') return selbsttest();

    let optionen;
    try {
        optionen = argumenteLesen(argumente);
    } catch (e) {
        console.error(`FEHLER: ${e.message}`);
        konsoleUsage();
        return 2;
    }
    if (!optionen.diffPfad) {
        konsoleUsage();
        return 2;
    }

    // --brief ist PFLICHT (Defekt 2, behoben 12.09.2026, siehe BRIEF_KOPF-
    // Kommentar): OHNE ihn haette dieses Werkzeug keinen beitragsspezifischen
    // Auftrag mehr und wuerde entweder gar nichts oder -- schlimmer -- still
    // gegen etwas Falsches pruefen. Deshalb laut abbrechen, BEVOR ein
    // Schluessel gebraucht wird (Selbsttest-Grenzfall: ohne Schluessel und
    // ohne Netz prüfbar).
    if (!optionen.briefPfad) {
        console.error('ABBRUCH: Kein --brief=<datei> angegeben. Dieses Werkzeug hat KEINEN\n'
            + 'eingebauten Standardauftrag mehr -- ohne Brief wuerde es entweder gar nicht oder,\n'
            + 'schlimmer, gegen den FALSCHEN Beitrag pruefen und dabei einen formal sauberen,\n'
            + 'inhaltlich falschen Bericht liefern (gemessener Fall: ein OWASP-Diff gegen den\n'
            + 'frist_herkunft-Auftrag lieferte EXIT 0 und 213 Zeilen Bericht ueber Code, den der\n'
            + 'Diff nie anfasste). Ausweg: --brief=<pfad-zur-briefdatei> mit dem\n'
            + 'beitragsspezifischen Teil des Auftrags.');
        return 6;
    }
    let briefInhalt;
    try {
        briefInhalt = fs.readFileSync(optionen.briefPfad, 'utf8');
    } catch (e) {
        console.error(`ABBRUCH: --brief=${optionen.briefPfad} konnte nicht gelesen werden (${e.message}).`);
        return 6;
    }
    if (!briefInhalt.trim()) {
        console.error(`ABBRUCH: --brief=${optionen.briefPfad} ist leer -- das waere derselbe stille Fehlschlag wie ein fehlender Brief.`);
        return 6;
    }

    // Grenzfall zuerst, weil er ohne Schluessel und ohne Netz prüfbar sein
    // muss (Selbsttest Fall 8): ein Lauf, der von vornherein keine einzige
    // Runde erlaubt, kann nie ein Ergebnis liefern — laut abbrechen, nicht
    // still mit leerem Bericht durchgehen.
    if (!Number.isInteger(optionen.maxRunden) || optionen.maxRunden < 1) {
        console.error(`ABBRUCH: --max-runden=${optionen.maxRunden} erlaubt keine einzige Runde — der Bericht waere UNVOLLSTAENDIG, bevor er beginnt.`);
        // KEIN Lauf-Protokolleintrag hier (TEIL D unten): dieser Abbruch
        // liegt VOR wurzelEinrichten()/dem Diff-Lesen -- es hat noch nicht
        // einmal eine Zeilenzahl oder ein Modell-Kontakt stattgefunden. Wie
        // bei Exit 2/6 gilt: "gar kein Lauf fand statt."
        return 4;
    }

    // B2 (Review-Bot-Befund an PR #45): derselbe Grenzfall wie eben --
    // pruefbar ohne Schluessel und ohne Netz, deshalb hier und nicht erst
    // beim ersten Werkzeugergebnis. Ein unbrauchbarer Deckel bricht LAUT ab,
    // statt sich lautlos auf die Vorgabe zurueckzuziehen (siehe
    // maxAusgabeBytesErmitteln() oben).
    let MAX_AUSGABE_BYTES;
    try {
        MAX_AUSGABE_BYTES = maxAusgabeBytesErmitteln(process.env.GEGENLESER_MAX_AUSGABE_BYTES);
    } catch (e) {
        console.error(`ABBRUCH: ${e.message}`);
        // KEIN Lauf-Protokolleintrag, aus demselben Grund wie beim
        // --max-runden-Abbruch direkt darueber: "gar kein Lauf fand statt."
        return 4;
    }

    const schluessel = schluesselHolen(optionen.modell);
    if (!schluessel) {
        const deepseek = istDeepseekModell(optionen.modell);
        const envName = deepseek ? 'DEEPSEEK_API_KEY' : 'OPENAI_API_KEY';
        const dateiName = deepseek ? 'DEEPSEEK_KEY_DATEI' : 'OPENAI_KEY_DATEI';
        console.error(
            `ABBRUCH: Kein Schluessel. Setze ${envName} oder ${dateiName} (Pfad zu einer Datei\n`
            + 'AUSSERHALB des Repos, Rechte 600). Der Schluessel gehoert nicht ins Repo und nicht\n'
            + 'in eine Chat-Nachricht.');
        return 2;
    }

    wurzelEinrichten(optionen.wurzel);
    protokollPfadAktuell = optionen.protokollPfad;
    fs.writeFileSync(protokollPfadAktuell, ''); // frisch je Lauf, kein Vermischen mit einem alten Protokoll

    // Vor den Diff gezogen (bis 13.09.2026 standen sie danach): der
    // Geheimnis-Riegel auf dem EINGEGEBENEN Diff (naechster Block) kann
    // schon vor der ersten Anfrage abbrechen, und dieser Lauf bekommt
    // trotzdem eine Protokollzeile (TEIL D, "Betrifft mindestens:
    // Geheimnis-Riegel (Exit 3)") -- dafuer muessen Runde/Suchen/Lesungen/
    // Token schon existieren, wenn auch bei null.
    let runde = 0;
    let sucheAnzahl = 0;
    let liesAnzahl = 0;
    let ablehnungenAnzahl = 0;
    let ausgabeBytes = 0;
    let promptTokenSumme = 0;
    let completionTokenSumme = 0;
    const gelesenePfade = [];
    const geschwaerzteStellen = [];
    // Deckel gerissen bei lies() (13.09.2026, Nacharbeit): dieser ANGEFRAGTE
    // AUSSCHNITT wurde nie gesendet -- anders als geschwaerzteStellen (dort
    // kam der Ausschnitt AN, nur eine Zeile fehlt) hat der Pruefer ihn NIE
    // gesehen. Das gilt fuer den Ausschnitt, NICHT fuer die Datei: ein
    // anderer oder kleinerer Bereich derselben Datei kann trotzdem als
    // GELESEN dastehen (Gegenlesung 13.09.2026 -- die vorherige Fassung
    // dieses Kommentars und der Berichtstext behaupteten genau das
    // faelschlich ueber die ganze Datei). Eigene Liste, damit der Bericht
    // diesen Unterschied auch zeigt.
    const abgelehnteLesungen = [];
    // Punkt A (Nacharbeit 13.09.2026, Gegenlesung): main() hatte einen Pfad,
    // der bei einem geworfenen Fehler NACH Modellkontakt (anfragen() wirft
    // in einer spaeteren Runde, nachdem eine fruehere schon Tokens
    // verbraucht hat) KEINE Protokollzeile schrieb -- der throw landete
    // direkt im main().catch(...) ganz unten, ohne dass
    // protokollLaufEintragen() je lief. laufEingetragen und
    // protokollLaufEintragen selbst muessen VOR dem try unten deklariert
    // sein, damit auch dessen finally sie sehen kann (ein "let"/"const"
    // innerhalb eines try-Blocks ist ausserhalb davon nicht sichtbar) --
    // zugewiesen wird protokollLaufEintragen trotzdem gleich am Anfang des
    // try, an derselben Stelle wie vorher.
    let laufEingetragen = false;
    let protokollLaufEintragen = null;
    let diffInhalt;

    try {
        diffInhalt = fs.readFileSync(optionen.diffPfad, 'utf8');

        // Zweck/Material/Kosten fuer das Lauf-Protokoll (TEIL D oben) -- als
        // Closures, weil sie erst beim tatsaechlichen Eintragen (an mehreren
        // Stellen unten) ausgewertet werden, dabei aber immer den AKTUELLEN
        // Stand von runde/sucheAnzahl/... sehen muessen.
        const protokollZweck = () => optionen.zweck || path.basename(optionen.briefPfad, path.extname(optionen.briefPfad));
        const protokollMaterial = (abbruchGrund) => {
            const kern = `Diff ${zeilenAus(diffInhalt).length} Zeilen, Suchen ${sucheAnzahl}, Lesungen ${liesAnzahl}, `
                + `Token rein ${promptTokenSumme}, Token raus ${completionTokenSumme}, Runden ${runde}`;
            return abbruchGrund ? `**abgebrochen** (${abbruchGrund}): ${kern}` : kern;
        };
        const protokollKostenText = () => {
            const kosten = kostenSchaetzen(optionen.modell, promptTokenSumme, completionTokenSumme);
            return kosten === null ? 'unbekannt' : kosten.toFixed(2).replace('.', ',') + ' $';
        };
        // NUR fuer das Sicherheitsnetz im finally unten (Punkt A): dort ist die
        // Tokenzahl eine UNTERGRENZE (eine gescheiterte Anfrage hat womoeglich
        // schon verbraucht, ohne dass "usage" zurueckkam) -- die Kostenzelle
        // bekommt deshalb das Praefix "mind. ". Ist die Tokenzahl 0, aber
        // runde > 0, heisst das NICHT "nichts verbraucht", sondern "wir wissen
        // es nicht" -- "0,00 $" waere hier eine falsche Zusicherung.
        const protokollKostenTextUntergrenze = () => {
            if (promptTokenSumme === 0 && completionTokenSumme === 0) return 'Kosten unbekannt';
            const kosten = kostenSchaetzen(optionen.modell, promptTokenSumme, completionTokenSumme);
            return kosten === null ? 'unbekannt' : 'mind. ' + kosten.toFixed(2).replace('.', ',') + ' $';
        };
        // EINE Stelle fuer alle Rueckgabepunkte unten ("das Werkzeug muss sich
        // selbst eintragen, nicht die Prosa") -- abbruchGrund=null heisst
        // regulaerer Abschluss (Exit 0). Gegen Doppeleintrag gesichert (Punkt A):
        // das Sicherheitsnetz im finally unten darf eine bereits geschriebene
        // Zeile nicht verdoppeln, wenn schon einer der regulaeren
        // Rueckgabepunkte eingetragen hat -- ein zweiter Aufruf tut dann NICHTS
        // und meldet das auch nicht.
        protokollLaufEintragen = (abbruchGrund, istUntergrenze) => {
            if (laufEingetragen) return true;
            const kostenText = istUntergrenze ? protokollKostenTextUntergrenze() : protokollKostenText();
            const ergebnis = laufprotokollVersuchen(protokollZweck(), protokollMaterial(abbruchGrund), kostenText);
            laufEingetragen = true;
            return ergebnis;
        };

        // BEWUSST weiterhin ein ABBRUCH, nicht Schwaerzen wie bei suche()/lies():
        // den Diff liefert der Auftraggeber. Steht darin ein Geheimnis, ist das
        // SEIN Fehler, und er muss ihn sehen, statt ihn stillschweigend
        // geschwaerzt zu bekommen. Bei Dateien, die das Modell selbst auswaehlt,
        // ist es anders — dort ist der Fehlalarm der Normalfall (13.09.2026).
        const diffPruefung = pruefeGeheimnisse(diffInhalt);
        if (!diffPruefung.sauber) {
            console.error('ABBRUCH: Der Diff enthaelt etwas, das wie ein Geheimnis aussieht — '
                + diffPruefung.treffer.map((t) => t.name).join(', ') + '.');
            console.error('Es wurde NICHTS gesendet.');
            protokollLaufEintragen('Geheimnis-Riegel auf dem Eingabediff');
            return 3;
        }

        const auftragstext = auftragstextBauen(briefInhalt);
        const verlauf = [{
            role: 'user',
            content: auftragstext + '\n\n########## DIFF ##########\n\n' + diffInhalt,
        }];
        protokollSchreiben({ typ: 'start', element: verlauf[0] });

        const zusammenfassungAusgeben = () => {
            console.log('\n---');
            console.log('GELESENE DATEIEN:');
            if (gelesenePfade.length === 0) {
                console.log('  (keine)');
            } else {
                for (const g of gelesenePfade) console.log(`  ${g.pfad}:${g.von}-${g.bis}`);
            }
            // Wo geschwaerzt wurde, war die Pruefung blind. Eine verschwiegene
            // Luecke ist schlimmer als eine benannte — der Leser muss wissen,
            // welche Zeilen der Pruefer NICHT gesehen hat.
            console.log('GESCHWAERZTE STELLEN (Geheimnis-Riegel; dort war die Pruefung blind):');
            if (geschwaerzteStellen.length === 0) {
                console.log('  (keine)');
            } else {
                for (const st of geschwaerzteStellen) console.log(`  ${st.pfad}:${st.zeile} (${st.name})`);
            }
            // Eine verschwiegene Luecke ist schlimmer als eine benannte
            // (13.09.2026, Nacharbeit): dieser AUSSCHNITT wurde NIE gesendet,
            // nicht bloss an einer Stelle geschwaerzt -- der Leser des
            // Berichts muss wissen, welchen Ausschnitt der Pruefer nie
            // gesehen hat. Ueberschrift spricht seit der Gegenlesung vom
            // 13.09.2026 bewusst von AUSSCHNITTEN, nicht von Dateien: der
            // Deckel gilt fuer den angefragten Bereich, nicht fuer die ganze
            // Datei, und dieselbe Datei kann zugleich unter GELESENE DATEIEN
            // stehen (ein anderer Ausschnitt kam durch). Baut die Zeile aus
            // den strukturierten Feldern (Punkt 1 oben) statt aus einem
            // String-Trick auf "ort" -- der hing daran, dass "ort" auf ")"
            // endet, eine unnoetige Kopplung an die Textform.
            console.log('ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; '
                + 'andere Teile derselben Datei koennen geliefert worden sein):');
            if (abgelehnteLesungen.length === 0) {
                console.log('  (keine)');
            } else {
                for (const a of abgelehnteLesungen) {
                    console.log(`  ${a.relativ} Zeilen ${a.von}-${a.bis} (von ${a.gesamt}) — `
                        + `${a.trefferZeilen} Trefferzeilen, Muster: ${a.muster.join(', ')}`);
                }
            }
            console.log(`Suchen: ${sucheAnzahl}  Lesungen: ${liesAnzahl}  Ablehnungen: ${ablehnungenAnzahl}`);
            console.log(`Runden: ${runde}  Token rein: ${promptTokenSumme}  Token raus: ${completionTokenSumme}`);
            const kosten = kostenSchaetzen(optionen.modell, promptTokenSumme, completionTokenSumme);
            console.log(kosten === null
                ? `Kosten unbekannt (Modell "${optionen.modell}" nicht in der Preistabelle)`
                : `Kosten geschaetzt: $${kosten.toFixed(4)}`);
            console.log(`Protokoll: ${protokollPfadAktuell}`);
        };

        while (true) {
            runde++;
            if (runde > optionen.maxRunden) {
                console.error(`ABBRUCH: Rundenlimit (${optionen.maxRunden}) erreicht — der Bericht ist UNVOLLSTAENDIG.`);
                runde--;
                zusammenfassungAusgeben();
                protokollLaufEintragen('Rundenlimit erreicht');
                return 4;
            }

            // Stufe (a)+(b)+(c): das Rundenbudget wird SICHTBAR, statt dass das
            // Modell blind weiterliest, bis das Limit hart zuschlaegt. Die
            // letzten zwei Runden sind der Riegel: KEINE tools mehr im Request
            // (siehe mitWerkzeugen in anfragen()), das Modell KANN dann nur noch
            // Text liefern.
            const istLetzteZweiRunden = (optionen.maxRunden - runde) <= 1;
            const ist70Prozent = runde >= Math.ceil(optionen.maxRunden * 0.7);
            const rundenHinweis = rundenHinweisBauen(runde, optionen.maxRunden, istLetzteZweiRunden, ist70Prozent);
            verlauf.push({ role: 'user', content: rundenHinweis });
            protokollSchreiben({ typ: 'rundenhinweis', runde, istLetzteZweiRunden, ist70Prozent, text: rundenHinweis });

            let antwort;
            try {
                antwort = await anfragen(schluessel, optionen.modell, verlauf, !istLetzteZweiRunden);
            } catch (e) {
                // Punkt 13/B8: der Verbrauch aus einem Fehlschlag darf nicht
                // verloren gehen -- sonst meldet die Zusammenfassung "Token
                // rein: 0" und "Kosten geschaetzt: $0.0000" fuer einen Lauf,
                // der Geld gekostet hat. GENAU EINMAL verbuchen, bevor die
                // Zusammenfassung ausgegeben wird. e.gegenleserUsage ist nur
                // bei einem Status-Abbruch aus anfragen() gesetzt (Punkt 12);
                // ein gewoehnlicher Netz-/Protokollfehler traegt es nicht und
                // aendert hier nichts (Verhalten wie vor diesem Umbau).
                if (e.gegenleserUsage) {
                    promptTokenSumme += e.gegenleserUsage.input_tokens || 0;
                    completionTokenSumme += e.gegenleserUsage.output_tokens || 0;
                }
                console.error(`FEHLER bei der Anfrage: ${e.message}`);
                zusammenfassungAusgeben();
                throw e;
            }
            // Feldnamen gemessen am echten Konto 12.09.2026 (siehe Endpunkt-
            // Kommentar oben): usage traegt input_tokens/output_tokens, nicht
            // mehr prompt_tokens/completion_tokens.
            const verbrauch = antwort.usage || {};
            promptTokenSumme += verbrauch.input_tokens || 0;
            completionTokenSumme += verbrauch.output_tokens || 0;
            const ausgabeElemente = antwort.output || [];
            protokollSchreiben({ typ: 'antwort', runde, ausgabe: ausgabeElemente, verbrauch });
            // Alle zurueckgegebenen output[]-Elemente unveraendert an den Verlauf
            // anhaengen (Nachrichten UND Funktionsaufrufe) -- /v1/responses ist
            // zustandslos ohne previous_response_id, die naechste Anfrage muss
            // die volle bisherige Historie erneut mitschicken.
            verlauf.push(...ausgabeElemente);

            const funktionsaufrufe = ausgabeElemente.filter((element) => element.type === 'function_call');

            if (funktionsaufrufe.length === 0) {
                const text = textAusAusgabe(ausgabeElemente);
                if (!text || !text.trim()) {
                    console.error('ABBRUCH: Das Modell hat am Ende keinen Text geliefert — kein sauberes Ergebnis.');
                    zusammenfassungAusgeben();
                    protokollLaufEintragen('kein Text vom Modell am Ende');
                    return 5;
                }
                console.log(text);
                // WICHTIG (Auftrag Teil 2): ein unter Rundendruck erzeugter
                // Bericht ist NICHT dasselbe wie ein regulaerer und muss als
                // solcher erkennbar sein -- sonst waere er schlimmer als der
                // ehrliche Abbruch von heute.
                console.log(istLetzteZweiRunden
                    ? `\n[BERICHT UNTER RUNDENDRUCK -- erzwungen in Runde ${runde} von ${optionen.maxRunden}, Werkzeuge waren bereits abgeschaltet. NICHT als vollstaendige Pruefung werten.]`
                    : '\n[Bericht regulaer erstellt, Rundenlimit nicht erreicht.]');
                zusammenfassungAusgeben();
                protokollLaufEintragen(null);
                return 0;
            }

            for (const aufruf of funktionsaufrufe) {
                let ergebnis;
                try {
                    let werkzeugArgumente;
                    try {
                        werkzeugArgumente = JSON.parse(aufruf.arguments || '{}');
                    } catch (e) {
                        ergebnis = { text: `abgelehnt: ungueltige Argumente (${e.message})`, abgelehnt: true };
                    }
                    if (!ergebnis) {
                        if (aufruf.name === 'suche') sucheAnzahl++;
                        else if (aufruf.name === 'lies') liesAnzahl++;
                        ergebnis = werkzeugAufrufen(aufruf.name, werkzeugArgumente);
                        if (ergebnis.relativ) gelesenePfade.push({ pfad: ergebnis.relativ, von: ergebnis.von, bis: ergebnis.bis });
                        if (ergebnis.geschwaerzt && ergebnis.geschwaerzt.length) {
                            geschwaerzteStellen.push(...ergebnis.geschwaerzt);
                            protokollSchreiben({ typ: 'geheimnis_geschwaerzt', runde, werkzeug: aufruf.name, stellen: ergebnis.geschwaerzt });
                        }
                    }
                } catch (e) {
                    if (e instanceof GeheimnisAbbruch) {
                        // Eine ABGELEHNTE Lesung ist kein Abbruch des Laufs
                        // mehr (13.09.2026, Nacharbeit): der Deckel bleibt
                        // scharf -- es wird kein Inhalt des abgelehnten
                        // AUSSCHNITTS gesendet --, aber statt den GANZEN Lauf
                        // zu beenden, geht das Modell mit einem gewoehnlichen
                        // abgelehnten Funktionsergebnis weiter, so wie bei
                        // jeder anderen Ablehnung auch. Der Text nennt den
                        // Ausschnitt und die Musternamen, aber KEINE Zeile und
                        // KEINEN Musterinhalt -- ein erneuter Versuch liefert
                        // erkennbar dasselbe Ergebnis fuer DIESELBE Anfrage,
                        // das Modell muss also nicht nachfragen -- ein
                        // anderer oder kleinerer Ausschnitt DERSELBEN Datei
                        // kann dagegen durchgehen (Nacharbeit 13.09.2026: der
                        // Deckel gilt fuer den Ausschnitt, nicht fuer die
                        // Datei, und der Text darf das nicht verschweigen).
                        const musterNamen = [...new Set(e.treffer.map((t) => t.name))];
                        console.error(`LESUNG ABGELEHNT (Geheimnis-Deckel): ${e.ort} — nichts gesendet, der Lauf geht weiter.`);
                        for (const name of musterNamen) console.error(`  Muster "${name}"`);
                        protokollSchreiben({ typ: 'geheimnis_ablehnung', ort: e.ort, muster: musterNamen });
                        abgelehnteLesungen.push({
                            relativ: e.relativ, von: e.von, bis: e.bis, gesamt: e.gesamt,
                            trefferZeilen: e.trefferZeilen, muster: musterNamen,
                        });
                        ergebnis = {
                            text: `abgelehnt: Geheimnis-Riegel — der angefragte Ausschnitt ${e.ort} enthaelt zu viele `
                                + `Zeilen, die zu den Mustern ${musterNamen.join(', ')} passen; aus DIESEM Ausschnitt wird `
                                + 'nichts geliefert. Dieselbe Anfrage liefert bei unveraendertem Dateiinhalt erneut eine '
                                + 'Ablehnung. Ein anderer oder kleinerer Ausschnitt derselben Datei kann dagegen durchgehen.',
                            abgelehnt: true,
                        };
                    } else {
                        throw e;
                    }
                }

                if (ergebnis.abgelehnt) ablehnungenAnzahl++;

                ausgabeBytes += Buffer.byteLength(ergebnis.text, 'utf8');
                if (ausgabeBytes > MAX_AUSGABE_BYTES) {
                    console.error(`ABBRUCH: Gesamtausgabemenge ueber ${MAX_AUSGABE_BYTES} Bytes (${ausgabeBytes}) — der Bericht ist UNVOLLSTAENDIG.`);
                    zusammenfassungAusgeben();
                    protokollLaufEintragen('Ausgabemenge ueber dem Limit');
                    return 4;
                }

                // Das Werkzeugergebnis geht mit demselben call_id zurueck, NICHT
                // mit der Item-id des Funktionsaufrufs (gemessen 12.09.2026,
                // siehe Endpunkt-Kommentar oben).
                protokollSchreiben({ typ: 'funktionsantwort', runde, werkzeug: aufruf.name, call_id: aufruf.call_id, text: ergebnis.text });
                verlauf.push({ type: 'function_call_output', call_id: aufruf.call_id, output: ergebnis.text });
            }
        }
    } finally {
        // Sicherheitsnetz (Punkt A): greift NUR, wenn keiner der regulaeren
        // Rueckgabepunkte oben schon eingetragen hat (laufEingetragen) UND
        // mindestens ein Anfrageversuch stattfand (runde > 0 -- runde wird
        // am Kopf der Schleife hochgezaehlt, BEVOR angefragt wird, ist also
        // schon dann > 0, wenn genau dieser Versuch selbst wirft) ODER schon
        // Token gezaehlt wurden. Das ist der ERREICHTE ZUSTAND "es gab
        // Modellkontakt, also ist womoeglich Geld geflossen" -- NICHT der
        // Exit-Code. Fehler VOR dem ersten Kontakt (Diff lesen,
        // wurzelEinrichten) haben runde === 0 und promptTokenSumme === 0 und
        // bekommen weiterhin KEINE Zeile, richtig so.
        if (protokollLaufEintragen && !laufEingetragen && (runde > 0 || promptTokenSumme > 0)) {
            protokollLaufEintragen('unerwarteter Fehler nach Modellkontakt (Exit 1)', true);
        }
    }
}

// ===================== TEIL C: SELBSTTEST, OHNE NETZ =====================
//
// Baut einen Wegwerf-Klon unter os.tmpdir() auf, prueft die Erlaubnisliste
// gegen ihn und raeumt ihn in einem finally wieder ab. Fasst NICHTS ausserhalb
// von os.tmpdir() an.

// Baustoff fuer die gestubbten OpenAI-Antworten im Selbsttest (Runden- und
// Kostenpruefungen unten) -- KEIN Netz, nur Datenstrukturen, die genau wie
// eine echte /v1/responses-Antwort geformt sind (Form am echten Konto
// gemessen 12.09.2026, siehe Endpunkt-Kommentar am Dateikopf).
function elementFunktionsaufrufBauen(callId, funktionName, argumente) {
    return { id: `fc-${callId}`, type: 'function_call', status: 'completed', call_id: callId, name: funktionName, arguments: JSON.stringify(argumente) };
}
function elementTextBauen(text) {
    return { id: 'msg-selbsttest', type: 'message', status: 'completed', role: 'assistant', content: [{ type: 'output_text', text }] };
}
// Punkt 14/B7: TOP-LEVEL "status", sonst lehnt die neue Statuspruefung in
// anfragen() (Punkt 12) JEDEN bestehenden Selbsttestlauf ab -- der
// Ereignistyp ist NICHT der Ersatz fuer den Objektstatus.
function antwortKoerperBauen(ausgabeElement, inputToken, outputToken) {
    return { status: 'completed', output: [ausgabeElement], usage: { input_tokens: inputToken, output_tokens: outputToken } };
}
// Form aus M3 (Auftragspapier, gemessen 19.09.2026): status incomplete,
// incomplete_details.reason, output[] traegt einen reasoning-Eintrag.
function antwortKoerperUnvollstaendigBauen(reason, inputToken, outputToken) {
    return {
        status: 'incomplete',
        incomplete_details: { reason },
        output: [{ id: 'rs-selbsttest', type: 'reasoning', status: 'completed', summary: [] }],
        usage: { input_tokens: inputToken, output_tokens: outputToken },
    };
}
function antwortKoerperFehlgeschlagenBauen(fehlerObjekt, inputToken, outputToken) {
    return {
        status: 'failed',
        error: fehlerObjekt,
        output: [],
        usage: { input_tokens: inputToken, output_tokens: outputToken },
    };
}

// Baut den STANDARD-SSE-Strom fuer einen Antwortkoerper (Punkt 15/B9): NICHT
// eine einzelne response.completed-Zeile, sondern event:- und Leerzeilen,
// response.created, mindestens ein Delta, DANN erst der Abschluss -- sonst
// wuerden alle 72+ Selbsttestfaelle einen Transportweg pruefen, den eine
// Implementierung, die beim ERSTEN Nicht-Abschluss-Ereignis aufloest, nie
// verraet (GP8). Der Abschlusstyp folgt antwortKoerper.status, NICHT
// umgekehrt -- der Ereignistyp ist nie die Quelle des Objektstatus.
function sseStandardStromBauen(antwortKoerper) {
    const typEreignis = antwortKoerper && antwortKoerper.status === 'incomplete' ? 'response.incomplete'
        : antwortKoerper && antwortKoerper.status === 'failed' ? 'response.failed'
        : 'response.completed';
    return `event: response.created\n`
        + `data: ${JSON.stringify({ type: 'response.created', response: { status: 'in_progress' } })}\n\n`
        + `\n` // Leerzeile zwischen Ereignissen -- SSE erlaubt Kommentar-/Keepalive-Zeilen, sie werden ignoriert.
        + `event: response.output_text.delta\n`
        + `data: ${JSON.stringify({ type: 'response.output_text.delta', delta: '' })}\n\n`
        + `event: ${typEreignis}\n`
        + `data: ${JSON.stringify({ type: typEreignis, response: antwortKoerper })}\n\n`;
}

// Fuer Gegenproben, die die SSE-Bytes selbst kontrollieren muessen (Chunk-
// Grenzen, fehlendes Abschluss-Ereignis, Verbindungsabbruch, Statuscode) statt
// des automatisch gebauten Standardstroms oben.
function sseRohEintragBauen({ chunks, statusCode, abgebrochen, fehler, vorzeitigesClose }) {
    return { __sseRoh: true, chunks, statusCode, abgebrochen, fehler, vorzeitigesClose };
}

// Stub fuer https.request: KEIN Netz, keine echten Sockets. Beantwortet der
// Reihe nach aus "warteschlange" und zeichnet JEDEN tatsaechlich gebauten
// Anfragekoerper in "aufgezeichnet" auf (inkl. ob "tools" mitgeschickt
// wurde) -- die Rundenriegel-Pruefung unten prueft an DIESER Aufzeichnung,
// nicht an einer Behauptung im Text.
//
// Punkt 15/B9/GP5 (Streaming-Umbau 19.09.2026): liefert SSE statt eines
// einzelnen JSON-Blocks. Ein Eintrag aus "warteschlange" ist entweder ein
// gewoehnlicher Antwortkoerper (antwortKoerperBauen() & Geschwister) -- dann
// wird er automatisch in den STANDARD-Mehrereignis-Strom gepackt (s.
// sseStandardStromBauen) -- oder ein per sseRohEintragBauen() markierter
// ROHER Eintrag, dessen "chunks" unveraendert als einzelne data()-Aufrufe
// hinausgehen (fuer Chunk-Grenzen mitten in einer data:-Zeile, fehlende
// Abschluss-Ereignisse, Nicht-SSE-Antworten und Strom-Abbrueche). Nach einem
// GEWOEHNLICHEN Abschluss feuert die Stub genau wie ein echter Socket
// zusaetzlich "close" NACH "end" -- das ist die Positivkontrolle fuer GP7
// ("ein normales close nach end darf nicht doppelt ablehnen"), gemessen an
// praktisch jedem der bestehenden Faelle.
// "aufgezeichneteUrls" ist ebenso OPTIONAL (vierter Parameter, DeepSeek-
// Anbieterwahl 23.09.2026): zeichnet die tatsaechlich angesteuerte URL jedes
// Aufrufs auf, damit ein Test belegen kann, welcher ENDPUNKT (OpenAI oder
// DeepSeek) wirklich angesprochen wurde -- bisher ignorierte diese Stub-
// Funktion "_url" vollstaendig, das liess sich nicht pruefen.
function httpsStubBauen(warteschlange, aufgezeichnet, zerstoerungen, aufgezeichneteUrls) {
    return function (_url, _optionen, callback) {
        if (aufgezeichneteUrls) aufgezeichneteUrls.push(_url);
        const antwortHandler = {};
        const fakeAntwort = {
            statusCode: 200,
            on(ereignis, fn) { antwortHandler[ereignis] = fn; return this; },
        };
        // N1 (Gegenlesung 19.09.2026): die ANFRAGE-Ebene (anfrage.on(...) in
        // anfragen()) wurde bisher verworfen ("on() { return this; }"). Die
        // GP7E-Gegenprobe unten braucht einen echten Request-Fehler NACH
        // einem regulaeren Abschluss, um zu pruefen, dass anfrage.on('error')
        // durch denselben Einmal-Riegel laeuft wie die Antwort-Ereignisse --
        // dafuer muss der Handler wie bei der Antwort GESPEICHERT werden.
        const anfrageHandler = {};
        return {
            on(ereignis, fn) { anfrageHandler[ereignis] = fn; return this; },
            end(koerperJson) {
                aufgezeichnet.push(JSON.parse(koerperJson));
                const eintrag = warteschlange.shift();
                if (!eintrag) throw new Error('Selbsttest-Stub: keine weitere Antwort in der Warteschlange');
                fakeAntwort.statusCode = eintrag.statusCode || 200;
                process.nextTick(() => {
                    callback(fakeAntwort);
                    const regulaerAbschliessen = () => {
                        antwortHandler.end();
                        if (antwortHandler.close) antwortHandler.close();
                    };
                    if (eintrag.__sseRoh) {
                        for (const teil of (eintrag.chunks || [])) {
                            antwortHandler.data(Buffer.isBuffer(teil) ? teil : Buffer.from(teil, 'utf8'));
                        }
                        // "error" bleibt UNGESICHERT: ein Ereignis dieses
                        // Namens ohne Listener ist bei einem echten
                        // EventEmitter der einzige Fall, der selbst crasht --
                        // das bildet die Stub bewusst nach. "aborted"/"close"
                        // sind gewoehnliche Ereignisse: OHNE Listener bleiben
                        // sie ein stiller No-Op, GENAU das Bild von B2 (die
                        // Promise haengt fuer immer), nicht ein TypeError der
                        // Test-Stub selbst (GEGENGEPRUEFT 19.09.2026: eine
                        // Mutation, die den close-Listener entfernt, crashte
                        // hier zuvor die Stub statt die Promise haengen zu
                        // lassen -- der Wachhund konnte den echten Befund gar
                        // nicht erst sehen).
                        if (eintrag.fehler) { antwortHandler.error(eintrag.fehler); return; }
                        if (eintrag.abgebrochen) {
                            // N2 (Gegenlesung 19.09.2026): GEMESSEN an einem
                            // echten lokalen Node-22-Server, der nach einer
                            // abgebrochenen Antwort den Socket zerstoert --
                            // die tatsaechliche Folge ist
                            // aborted -> error -> close (beide Listener
                            // bekommen ein Ereignis). Der Stub bildete bisher
                            // NUR "aborted" nach und kehrte zurueck, eine
                            // Folge, die echtes Node so nie erzeugt (dieselbe
                            // Krankheit wie beim alten JSON-Block-Stub, eine
                            // Ebene feiner).
                            if (antwortHandler.aborted) antwortHandler.aborted();
                            if (antwortHandler.error) antwortHandler.error(new Error('Simulierter Verbindungsabbruch (Selbsttest): Socket nach Abbruch zerstoert'));
                            if (antwortHandler.close) antwortHandler.close();
                            return;
                        }
                        if (eintrag.vorzeitigesClose) { if (antwortHandler.close) antwortHandler.close(); return; }
                        regulaerAbschliessen();
                    } else {
                        antwortHandler.data(Buffer.from(sseStandardStromBauen(eintrag), 'utf8'));
                        regulaerAbschliessen();
                        // GP7E (N1-Gegenprobe): nach einem GEWOEHNLICHEN
                        // Abschluss zusaetzlich einen Fehler auf der ANFRAGE
                        // (nicht der Antwort) ausloesen -- prueft, dass
                        // anfrage.on('error', ...) durch denselben Riegel
                        // laeuft wie die Antwort-Ereignisse und keinen
                        // zweiten Settle-Versuch mehr durchlaesst.
                        if (eintrag.__anfrageFehlerNachAbschluss && anfrageHandler.error) {
                            anfrageHandler.error(new Error('GP7E: Anfrage-Fehler NACH regulaerem Abschluss (Selbsttest, erwartet KEIN zweites Settle)'));
                        }
                    }
                });
            },
            // B1 (Review-Bot-Befund an PR #45): bisher ein reines No-op --
            // ohne dieses Zaehlen ist "nach einem fatalen Abbruch wird die
            // Verbindung zerstoert" fuer den Selbsttest nicht pruefbar
            // (kein echter Socket, kein echtes Netz). "zerstoerungen" ist
            // OPTIONAL (dritter Parameter): bestehende Aufrufe uebergeben
            // ihn nicht und bleiben unveraendert.
            destroy() { if (zerstoerungen) zerstoerungen.push(true); },
        };
    };
}

async function selbsttest() {
    // 72 vor dem Streaming-Umbau (19.09.2026) + 27 neue Faelle
    // (GP1x2, GP2x3, GP3x2, B8x1, GP4x5, GP5x1, GP6x1, Punkt7/B3 x1,
    // Punkt6/B4 x1, GP7x4, GP8x1, GP9x1, GP-FAILED x1, GP-ERROR x1,
    // GP10x1, B8-Ende-zu-Ende x1) = 99, dazu 5 neue Faelle aus der
    // Nacharbeit vom selben Tag (Gegenlesung des Streaming-Umbaus, sechs
    // Befunde N1-N6): GP6Bx1 (N2), GP7Ex1 (N1), N6x2 (Ereignis nach
    // Abschluss + Positivkontrolle), GP10-Metadatenwerte x1 (N5) = 104,
    // dazu EIN Nachtrag aus dem Pruefgang ueber diese Nacharbeit:
    // Positivkontrolle x1 (belegt, dass process.on('multipleResolves')
    // in dieser Node-Version noch feuert -- DEP0160, ohne diesen Beleg
    // waere GP7D/GP7E mehrdeutig) = 105, dazu 9 Faelle aus dem Review-Bot-
    // Pruefgang an PR #45 (B1: destroy() nach fatalem SSE-Abbruch x1;
    // B2: maxAusgabeBytesErmitteln() -- nicht gesetzt/leer/"900000" x3,
    // "-1"/"1.5"/"Infinity"/"abc"/"0" brechen ab x5) = 114. Von Hand
    // hergeleitet, nicht aus dem Lauf abgeschrieben -- unten durch den
    // tatsaechlichen Lauf bestaetigt. Dazu 15 neue Faelle aus dem Auftrag
    // "DeepSeek als zweiter Anbieter" (23.09.2026): ANBIETERWAHL x3,
    // SCHLUESSEL x4, KOSTENFALL DEEPSEEK x1, DEEPSEEK OHNE SCHLUESSEL x1,
    // LAUF DS x4, GP4-DEEPSEEK x2 (eigene EFFORT_DEEPSEEK-Stufe, Nacharbeit
    // nach Hinweis des Haupt-Agenten) = 129.
    const ERWARTETE_FAELLE = 129;
    let gelaufen = 0;
    let fehler = 0;
    const pruefen = (bezeichnung, bedingung) => {
        gelaufen++;
        console.log(`${bedingung ? '  ✓' : '  ✗ FEHLT'} ${bezeichnung}`);
        if (!bedingung) fehler++;
    };

    // ===== SICHERHEITSNETZ FUERS LAUF-PROTOKOLL (TEIL D), FUER DEN GANZEN
    // SELBSTTEST =====
    // Jeder main()-Aufruf hier drin kann jetzt bei Exit 0/3/4/5 eine Zeile in
    // ASTRA-LAEUFE.md eintragen wollen. OHNE diese Grundeinstellung wuerde
    // "--selbsttest" die ECHTE Datei bei JEDEM Lauf anfassen -- genau das,
    // was FALL 6 unten widerlegen soll, und das bei jedem CI-Lauf. Der Pfad
    // zeigt auf eine Wegwerf-Datei MIT Marke: ein main()-Aufruf, der
    // vergisst, ASTRA_LAUFPROTOKOLL eigens umzubiegen (wie LAUF A/B/C/D und
    // DIFF-RIEGEL 31 weiter unten -- die kannten dieses Verhalten beim
    // Schreiben noch nicht), schreibt dadurch still in dieses Wegwerfziel
    // statt in die echte Datei. Ein Schnappschuss der ECHTEN Datei VOR allen
    // main()-Aufrufen ist FALL 6 selbst (Vergleich am Ende der Funktion).
    const alteProtokollUmgebungGesamt = process.env.ASTRA_LAUFPROTOKOLL;
    const echteProtokollDatei = path.join(__dirname, '..', 'ASTRA-LAEUFE.md');
    let echtesProtokollVorher = null;
    try { echtesProtokollVorher = fs.readFileSync(echteProtokollDatei, 'utf8'); } catch (e) { /* keine Datei -- bleibt null, FALL 6 vergleicht trotzdem */ }

    const klon = fs.mkdtempSync(path.join(os.tmpdir(), 'gegenleser-selbsttest-'));
    process.env.ASTRA_LAUFPROTOKOLL = path.join(klon, 'hintergrund-astra-laeufe.md');
    fs.writeFileSync(process.env.ASTRA_LAUFPROTOKOLL,
        `# Hintergrund-Wegwerfprotokoll des Selbsttests\n\n${LAUFPROTOKOLL_MARKE} nur fuer main()-Aufrufe, die ASTRA_LAUFPROTOKOLL nicht selbst setzen -->\n`);
    try {
        execFileSync('git', ['init', '-q'], { cwd: klon });
        execFileSync('git', ['config', 'user.email', 'selbsttest@example.invalid'], { cwd: klon });
        execFileSync('git', ['config', 'user.name', 'Selbsttest'], { cwd: klon });

        const harmlosInhalt = 'Zeile A\nZeile B\nZeile C\n';
        fs.writeFileSync(path.join(klon, 'harmlos.txt'), harmlosInhalt);

        fs.writeFileSync(path.join(klon, 'nicht_versioniert.txt'), 'nie committet\n');

        fs.symlinkSync('/etc', path.join(klon, 'zeiger_auf_etc'));

        fs.writeFileSync(path.join(klon, '.env.beispiel'), 'BEISPIEL=1\n');

        // Zusammengesetzt, kein Literal im Quelltext — wie in geheimnis-riegel.js.
        const geheimZeile = 'const schluessel = "' + 'sk' + '-proj-' + 'D'.repeat(40) + '";\n';
        fs.writeFileSync(path.join(klon, 'geheim.js'), geheimZeile);

        // ===== Fixtures fuer "schwaerzen statt abbrechen" (13.09.2026) =====
        // Alle Geheimnis-Attrappen zusammengesetzt, kein Literal (s. o.). Jede
        // Datei hat 5 harmlose Zeilen vor und nach dem Treffer, damit EINE
        // Trefferzeile (1 von 11) unter dem 25-%-Deckel bleibt; "ankerSuche"
        // ist das Suchwort fuer den suche()-Fall und kommt im Geheimnis selbst
        // nicht vor. Gemessen wird unten an FRAGMENTEN der Werte (20 Zeichen),
        // nicht nur am ganzen Wert: eine Teil-Schwaerzung fiele sonst durch.
        const fuellzeilen = (von, bis) => Array.from({ length: bis - von + 1 }, (_, k) => `// Zeile ${von + k}`);
        const mitGeheimnisInZeile6 = (geheimZeile) => [...fuellzeilen(1, 5), geheimZeile, ...fuellzeilen(7, 11)].join('\n') + '\n';
        const openaiWert = 'sk' + '-proj-' + 'E'.repeat(40);
        const githubWert = 'gh' + 'p_' + 'F'.repeat(36);
        const telegramWert = '987654321:' + 'G'.repeat(35);
        const pemMaterial = ['MIIE' + 'H'.repeat(60), 'AAAA' + 'I'.repeat(60), 'BBBB' + 'J'.repeat(60)];
        // Woertlich die Zeile aus core/db.js:71 im GymDocu-Repo, die am
        // 13.09.2026 den Fehlalarm ausgeloest hat — ein Platzhalter, kein
        // Geheimnis.
        const platzhalterZeile = '        "  DATABASE_URL=postgresql://gymdocu:PASSWORT@127.0.0.1:5432/gymdocu\\n" +';
        const fragmente = ['E'.repeat(20), 'F'.repeat(20), 'G'.repeat(20), 'H'.repeat(20), 'I'.repeat(20), 'J'.repeat(20), 'gymdocu:PASSWORT@'];
        const vorkommen = (text, fragment) => text.split(fragment).length - 1;
        const fragmentVorkommen = (text) => fragmente.reduce((summe, f) => summe + vorkommen(text, f), 0);
        fs.writeFileSync(path.join(klon, 'schwaerzen-openai.js'), mitGeheimnisInZeile6(`const ankerSuche = "${openaiWert}";`));
        fs.writeFileSync(path.join(klon, 'schwaerzen-github.js'), mitGeheimnisInZeile6(`const ankerSuche = "${githubWert}";`));
        fs.writeFileSync(path.join(klon, 'schwaerzen-telegram.js'), mitGeheimnisInZeile6(`const ankerSuche = "${telegramWert}";`));
        fs.writeFileSync(path.join(klon, 'schwaerzen-platzhalter.js'), mitGeheimnisInZeile6(platzhalterZeile));
        // PEM: Block in Zeilen 11-15, Material in 12-14, 25 Zeilen gesamt.
        fs.writeFileSync(path.join(klon, 'schwaerzen-pem.txt'),
            [...fuellzeilen(1, 10), '-----BEGIN PRIVATE KEY-----', ...pemMaterial, '-----END PRIVATE KEY-----', ...fuellzeilen(16, 25)].join('\n') + '\n');
        // 30 Geheimniszeilen unter 10 harmlosen: reisst den Zeilen-Deckel.
        fs.writeFileSync(path.join(klon, 'schwaerzen-viele.js'),
            [...fuellzeilen(1, 10), ...Array.from({ length: 30 }, (_, k) => `token${k} = "` + 'gh' + 'p_' + 'N'.repeat(36) + '";')].join('\n') + '\n');
        // 3 Geheimniszeilen unter 8: reisst den Anteils-Deckel (37,5 %), nicht
        // den absoluten — Gegenstueck zu schwaerzen-viele.js.
        fs.writeFileSync(path.join(klon, 'schwaerzen-anteil.js'),
            [...fuellzeilen(1, 8)].map((z, k) => ([1, 4, 7].includes(k) ? `t${k} = "` + 'gh' + 'p_' + 'U'.repeat(36) + '";' : z)).join('\n') + '\n');
        // 500 Zeilen, davon 25 Geheimniszeilen ab Zeile 16 -- einzige Fixture
        // ueber MAX_LIES_ZEILEN (400) hinaus. Deckt den ZWEITEN Kuerzungspfad
        // in werkzeugLies() ab (Kuerzung AUF 400 Zeilen), nicht nur den ersten
        // (Kuerzung bis Dateiende, s. "DECKEL VERSETZT UND GEKUERZT" unten):
        // beide setzen "ende" auf demselben Weg um, aber nur der erste war
        // bislang durch irgendeinen Fall abgedeckt.
        const schwaerzenRiesigZeilen = fuellzeilen(1, 500);
        for (let k = 15; k < 40; k++) schwaerzenRiesigZeilen[k] = `t${k} = "` + 'gh' + 'p_' + 'V'.repeat(36) + '";';
        fs.writeFileSync(path.join(klon, 'schwaerzen-riesig.js'), schwaerzenRiesigZeilen.join('\n') + '\n');
        // Eingegebener Diff mit Geheimnis — NICHT committet, der Diff kommt
        // ohnehin vom Auftraggeber und nicht aus der Erlaubnisliste.
        const diffMitGeheimnisPfad = path.join(klon, 'diff-mit-geheimnis.txt');
        fs.writeFileSync(diffMitGeheimnisPfad, `+const token = "${telegramWert}";\n`);

        execFileSync('git', ['add', 'harmlos.txt', '.env.beispiel', 'zeiger_auf_etc', 'geheim.js',
            'schwaerzen-openai.js', 'schwaerzen-github.js', 'schwaerzen-telegram.js', 'schwaerzen-platzhalter.js',
            'schwaerzen-pem.txt', 'schwaerzen-viele.js', 'schwaerzen-anteil.js', 'schwaerzen-riesig.js'], { cwd: klon });
        execFileSync('git', ['commit', '-q', '-m', 'Testdaten'], { cwd: klon });

        // Brief-Fixture fuer die main()-Aufrufe unten (Defekt 2, 12.09.2026):
        // --brief ist jetzt PFLICHT, kein main()-Lauf im Selbsttest kommt
        // ohne sie ueber den neuen Abbruch hinaus. Liegt AUSSERHALB der
        // Erlaubnisliste des Klons (wie ein echter Aufrufer die Brief-Datei
        // auch von ausserhalb des Repos uebergeben wuerde) -- absichtlich
        // nicht ueber pfadPruefen() geprueft, siehe main().
        const briefFixturePfad = path.join(klon, 'brief-selbsttest.txt');
        fs.writeFileSync(briefFixturePfad, 'Selbsttest-Auftrag: nichts Beitragsspezifisches, nur die Mechanik pruefen.\n');

        wurzelEinrichten(klon);

        {
            const r = pfadPruefen('../../etc/passwd');
            pruefen(`SPERRFALL 1 (../../etc/passwd wird abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('/etc/passwd');
            pruefen(`SPERRFALL 2 (/etc/passwd absolut wird abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('nicht_versioniert.txt');
            pruefen(`SPERRFALL 3 (existiert, aber nicht versioniert, wird abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('zeiger_auf_etc');
            pruefen(`SPERRFALL 4 (Symlink im Klon nach /etc wird abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('.env.beispiel');
            pruefen(`SPERRFALL 5 (versionierte .env.beispiel wird trotzdem abgelehnt)`, r.ok === false);
        }
        {
            const r = pfadPruefen('harmlos.txt');
            const inhaltOk = r.ok && fs.readFileSync(r.absolut, 'utf8') === harmlosInhalt;
            pruefen('DURCHLASSFALL 6 (harmlos.txt ist erlaubt und lesbar)', r.ok === true && inhaltOk);
        }
        {
            // Bis 13.09.2026 brach dieser Fall ab ("ein Treffer"). Nach dem
            // Umbau riss er kurz den Anteils-Deckel (1 von 1 = 100 %) — genau
            // der Fehlalarm bei engen Fenstern, den die Nacharbeit beseitigt:
            // unter MIN_ZEILEN_FUER_ANTEIL zaehlt nur der absolute Deckel. Ein
            // Ausschnitt, der ganz aus einem Marker besteht, ist harmlos.
            let r;
            let abbruch = null;
            try {
                r = werkzeugLies('geheim.js', 1, 1);
            } catch (e) {
                abbruch = e;
            }
            const anzahl = r ? vorkommen(r.text, 'D'.repeat(20)) : -1;
            pruefen(`RIEGELFALL 7 (geheim.js besteht NUR aus einer Geheimniszeile: 1 von 1 ist KEIN Abbruch mehr, Funktionsergebnis ist genau der Marker, Fragment kommt ${anzahl}x vor${abbruch ? ` — ABER: ${abbruch.message}` : ''})`,
                !abbruch && anzahl === 0
                && r.text === `geheim.js (Zeilen 1-1 von 1):\n1:${zeileEntferntMarker('OpenAI-Schlüssel')}`
                && r.geschwaerzt.length === 1 && r.geschwaerzt[0].zeile === 1);
        }

        // ===== SCHWAERZEN STATT ABBRECHEN (13.09.2026), Faelle 22-35 =====
        // Gemessen wird an dem, was WIRKLICH RAUSGEHT: am .text des
        // Funktionsergebnisses (22-30) und in LAUF D an den tatsaechlich
        // gebauten Anfragekoerpern (32-34) — nicht am Rueckgabewert von
        // entferneGeheimnisse() allein.
        const liesFallPruefen = (nr, datei, fragment, name) => {
            let r;
            let abbruch = null;
            try {
                r = werkzeugLies(datei, 1, 11);
            } catch (e) {
                abbruch = e;
            }
            const anzahl = r ? vorkommen(r.text, fragment) : -1;
            pruefen(`SCHWAERZEN ${nr} (${name} in ${datei}: Zeile 6 durch Marker ersetzt, Fragment kommt im Funktionsergebnis ${anzahl}x vor, Zeilen 5 und 7 bleiben, kein Abbruch${abbruch ? ` — ABER: ${abbruch.message}` : ''})`,
                !abbruch && anzahl === 0
                && r.text.includes(`\n6:${zeileEntferntMarker(name)}\n`)
                && r.text.includes('\n5:// Zeile 5\n') && r.text.includes('\n7:// Zeile 7\n')
                && r.geschwaerzt.length === 1 && r.geschwaerzt[0].zeile === 6 && r.geschwaerzt[0].pfad === datei);
        };
        liesFallPruefen(22, 'schwaerzen-openai.js', 'E'.repeat(20), 'OpenAI-Schlüssel');
        liesFallPruefen(23, 'schwaerzen-github.js', 'F'.repeat(20), 'GitHub-Token');
        liesFallPruefen(24, 'schwaerzen-telegram.js', 'G'.repeat(20), 'Telegram-Bot-Token');
        {
            let r;
            let abbruch = null;
            try {
                r = werkzeugLies('schwaerzen-pem.txt', 1, 25);
            } catch (e) {
                abbruch = e;
            }
            const anzahl = r ? fragmentVorkommen(r.text) : -1;
            const marker = zeileEntferntMarker('privater Schlüssel (PEM)');
            pruefen(`SCHWAERZEN 25 (PEM-Block ueber 5 Zeilen: ALLE Zeilen 11-15 durch Marker ersetzt, Material aus 12-14 kommt ${anzahl}x vor, Zeilen 10 und 16 bleiben, kein Abbruch${abbruch ? ` — ABER: ${abbruch.message}` : ''})`,
                !abbruch && anzahl === 0
                && !r.text.includes('BEGIN PRIVATE') && !r.text.includes('END PRIVATE')
                && [11, 12, 13, 14, 15].every((z) => r.text.includes(`\n${z}:${marker}\n`))
                && r.text.includes('\n10:// Zeile 10\n') && r.text.includes('\n16:// Zeile 16\n')
                && r.geschwaerzt.map((g) => g.zeile).join(',') === '11,12,13,14,15');
        }
        {
            // Der echte Fall vom 13.09.2026: Platzhalter, kein Geheimnis —
            // die Zeile geht trotzdem weg (keine Platzhalter-Erkennung), aber
            // der Lauf bricht NICHT ab.
            let r;
            let abbruch = null;
            try {
                r = werkzeugLies('schwaerzen-platzhalter.js', 1, 11);
            } catch (e) {
                abbruch = e;
            }
            const anzahl = r ? vorkommen(r.text, 'gymdocu:PASSWORT@') : -1;
            pruefen(`SCHWAERZEN 26 (Platzhalter-Verbindungszeichenfolge aus core/db.js:71: Zeile 6 weg, Platzhalter kommt ${anzahl}x vor, KEIN Abbruch — der Lauf geht weiter${abbruch ? ` — ABER: ${abbruch.message}` : ''})`,
                !abbruch && anzahl === 0
                && r.text.includes(`\n6:${zeileEntferntMarker('Verbindungszeichenfolge mit Passwort')}\n`)
                && r.geschwaerzt.length === 1);
        }
        {
            let ausgeloest = false;
            let ort = '-';
            let abbruch = null;
            let ergebnisText = null;
            try {
                ergebnisText = werkzeugLies('schwaerzen-viele.js', 1, 40).text;
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) { ausgeloest = true; ort = e.ort; abbruch = e; }
            }
            // "ort" benennt seit der Gegenlesung vom 13.09.2026 den
            // AUSSCHNITT eindeutig (Zeilen von-bis, dazu die Dateigesamt-
            // laenge) statt einer Trefferzahl, die mit der Dateilaenge
            // verwechselbar war -- und die Ausnahme traegt dieselben Werte
            // zusaetzlich strukturiert (Punkt 1 des Auftrags).
            pruefen(`DECKEL 27 (30 Geheimniszeilen unter 40 reissen den Deckel: GeheimnisAbbruch statt Schwaerzen, Ort: ${ort}; kein Funktionsergebnis)`,
                ausgeloest && ort === 'schwaerzen-viele.js Zeilen 1-40 (von 40)' && ergebnisText === null
                && abbruch.relativ === 'schwaerzen-viele.js' && abbruch.von === 1 && abbruch.bis === 40
                && abbruch.gesamt === 40 && abbruch.trefferZeilen === 30 && abbruch.ausschnittZeilen === 40);
        }
        {
            let ausgeloest = false;
            let ort = '-';
            let abbruch = null;
            let ergebnisText = null;
            try {
                ergebnisText = werkzeugLies('schwaerzen-anteil.js', 1, 8).text;
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) { ausgeloest = true; ort = e.ort; abbruch = e; }
            }
            pruefen(`DECKEL 35 (3 Geheimniszeilen unter 8 = 37,5 % reissen den Anteils-Deckel ab der Mindestzahl: GeheimnisAbbruch, Ort: ${ort}; kein Funktionsergebnis)`,
                ausgeloest && ort === 'schwaerzen-anteil.js Zeilen 1-8 (von 8)' && ergebnisText === null
                && abbruch.relativ === 'schwaerzen-anteil.js' && abbruch.von === 1 && abbruch.bis === 8
                && abbruch.gesamt === 8 && abbruch.trefferZeilen === 3 && abbruch.ausschnittZeilen === 8);
        }
        {
            // Nacharbeit (Gegenlesung des Gegenlesers, 13.09.2026): DECKEL 27
            // und 35 lesen beide von Zeile 1, dort fallen bis/gbis/gesamt/
            // ausschnittZeilen zufaellig auf dieselbe Zahl zusammen -- eine
            // vertauschte Zuweisung (z. B. "bis: gbis" statt "bis: ende",
            // oder "gesamt: ausschnittZeilen.length" statt der echten
            // Dateilaenge) waere dort UNSICHTBAR. Dieser Fall liest ab
            // Zeile 11 (nicht ab 1) UND ueber das Dateiende hinaus (999),
            // damit von/bis/gesamt/ausschnittZeilen vier VERSCHIEDENE Werte
            // sind. Sollwerte als woertliche Literale, nicht aus dem Code
            // abgeleitet: schwaerzen-viele.js hat 40 Zeilen (10 Fuellzeilen,
            // danach 30 Geheimniszeilen, s. Fixture-Anlage oben), 11-999
            // trifft NUR die 30 Geheimniszeilen und wird auf das Dateiende
            // gekuerzt.
            let ausgeloest = false;
            let ort = '-';
            let abbruch = null;
            let ergebnisText = null;
            try {
                ergebnisText = werkzeugLies('schwaerzen-viele.js', 11, 999).text;
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) { ausgeloest = true; ort = e.ort; abbruch = e; }
            }
            pruefen(`DECKEL VERSETZT UND GEKUERZT (46,5) (Bereich 11-999 einer 40-Zeilen-Datei trennt von/bis/gesamt/ausschnittZeilen: von=${abbruch ? abbruch.von : '-'}, bis=${abbruch ? abbruch.bis : '-'}, gesamt=${abbruch ? abbruch.gesamt : '-'}, ausschnittZeilen=${abbruch ? abbruch.ausschnittZeilen : '-'}, trefferZeilen=${abbruch ? abbruch.trefferZeilen : '-'}, Ort: ${ort}; kein Funktionsergebnis)`,
                ausgeloest && ergebnisText === null
                && abbruch.relativ === 'schwaerzen-viele.js'
                && abbruch.von === 11 && abbruch.bis === 40 && abbruch.gesamt === 40
                && abbruch.ausschnittZeilen === 30 && abbruch.trefferZeilen === 30
                && ort === 'schwaerzen-viele.js Zeilen 11-40 (von 40)');
        }
        {
            // Zweiter, unabhaengiger Randfall (Nacharbeit 13.09.2026): deckt
            // den ANDEREN Kuerzungspfad ab -- Kuerzung AUF MAX_LIES_ZEILEN
            // (400), nicht bis Dateiende. schwaerzen-riesig.js hat 500
            // Zeilen, 25 Geheimniszeilen ab Zeile 16 (s. Fixture-Anlage
            // oben). Bereich 2-500 angefragt: die Datei ist lang genug, dass
            // NICHT "bis Dateiende" greift, sondern der 400-Zeilen-Deckel --
            // von=2, bis=401 (2+400-1), gesamt=500, ausschnittZeilen=400,
            // trefferZeilen=25 sind fuenf VERSCHIEDENE Zahlen. Sollwerte
            // woertlich, nicht aus dem Code abgeleitet.
            let ausgeloest = false;
            let ort = '-';
            let abbruch = null;
            let ergebnisText = null;
            try {
                ergebnisText = werkzeugLies('schwaerzen-riesig.js', 2, 500).text;
            } catch (e) {
                if (e instanceof GeheimnisAbbruch) { ausgeloest = true; ort = e.ort; abbruch = e; }
            }
            pruefen(`DECKEL AUF MAX_LIES_ZEILEN GEKUERZT (46,7) (Bereich 2-500 einer 500-Zeilen-Datei reisst NICHT die "bis Dateiende"-Kuerzung, sondern den 400-Zeilen-Deckel: von=${abbruch ? abbruch.von : '-'}, bis=${abbruch ? abbruch.bis : '-'}, gesamt=${abbruch ? abbruch.gesamt : '-'}, ausschnittZeilen=${abbruch ? abbruch.ausschnittZeilen : '-'}, trefferZeilen=${abbruch ? abbruch.trefferZeilen : '-'}, Ort: ${ort}; kein Funktionsergebnis)`,
                ausgeloest && ergebnisText === null
                && abbruch.relativ === 'schwaerzen-riesig.js'
                && abbruch.von === 2 && abbruch.bis === 401 && abbruch.gesamt === 500
                && abbruch.ausschnittZeilen === 400 && abbruch.trefferZeilen === 25
                && ort === 'schwaerzen-riesig.js Zeilen 2-401 (von 500)');
        }
        {
            // Positivkontrolle: ohne sie waere "nichts durchgelassen" auch
            // dann erfuellt, wenn lies() einfach alles schwaerzt. Woertlicher
            // Sollwert, nicht aus dem Fixture zurueckgerechnet.
            const r = werkzeugLies('harmlos.txt', 1, 3);
            pruefen('POSITIVKONTROLLE 28 (lies auf harmlos.txt liefert den Ausschnitt BYTEGLEICH zum woertlichen Sollwert, nichts geschwaerzt)',
                r.text === 'harmlos.txt (Zeilen 1-3 von 3):\n1:Zeile A\n2:Zeile B\n3:Zeile C'
                && Array.isArray(r.geschwaerzt) && r.geschwaerzt.length === 0);
        }
        {
            // suche(): eigener Codepfad (pruefeGeheimnisse + Marker je Zeile,
            // kein Deckel). Das Suchwort steht NICHT im Geheimnis.
            const r = werkzeugSuche('ankerSuche', 'schwaerzen-*.js');
            const anzahl = fragmentVorkommen(r.text);
            const zeilen = r.text.split('\n');
            pruefen(`SCHWAERZEN 29 (suche "ankerSuche" trifft 3 Geheimniszeilen: jede durch Marker ersetzt, Fragmente kommen ${anzahl}x vor, 3 Stellen gemeldet)`,
                anzahl === 0 && zeilen.length === 3
                && zeilen.includes(`schwaerzen-openai.js:6:${zeileEntferntMarker('OpenAI-Schlüssel')}`)
                && zeilen.includes(`schwaerzen-github.js:6:${zeileEntferntMarker('GitHub-Token')}`)
                && zeilen.includes(`schwaerzen-telegram.js:6:${zeileEntferntMarker('Telegram-Bot-Token')}`)
                && r.geschwaerzt.length === 3 && r.geschwaerzt.every((g) => g.zeile === 6));
        }
        {
            const r = werkzeugSuche('Zeile B', 'harmlos.txt');
            pruefen('POSITIVKONTROLLE 30 (suche "Zeile B" in harmlos.txt liefert die Zeile woertlich und unveraendert, nichts geschwaerzt)',
                r.text === 'harmlos.txt:2:Zeile B' && r.geschwaerzt.length === 0);
        }

        // ===== FALL 31: eingegebener Diff mit Geheimnis bricht WEITERHIN ab =====
        // Verhalten unveraendert (Begruendung in main()). Der https-Stub hat
        // eine LEERE Warteschlange: jede Anfrage wuerde im Stub eine Ausnahme
        // werfen — die Aufzeichnung muss leer bleiben.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesError = console.error;
            const aufgezeichnetDiff = [];
            const fehlerZeilenDiff = [];
            https.request = httpsStubBauen([], aufgezeichnetDiff);
            console.error = (msg) => fehlerZeilenDiff.push(String(msg));
            let codeDiff;
            try {
                codeDiff = await main([
                    diffMitGeheimnisPfad,
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-diff.jsonl')}`,
                ]);
            } finally {
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            pruefen(`DIFF-RIEGEL 31 (eingegebener Diff mit Geheimnis bricht weiterhin mit Exit 3 ab, ${aufgezeichnetDiff.length} Anfragen gebaut, Meldung nennt das Muster)`,
                codeDiff === 3 && aufgezeichnetDiff.length === 0
                && fehlerZeilenDiff.some((z) => z.includes('Der Diff enthaelt etwas, das wie ein Geheimnis aussieht') && z.includes('Telegram-Bot-Token')));
        }

        // ===== LAUF D: schwaerzen Ende-zu-Ende, gemessen am Anfragekoerper =====
        // Runden 1-3 lesen je eine Geheimnisdatei, Runde 4 sucht, Runde 5
        // liefert Text. Geprueft wird an aufgezeichnetD — den Koerpern, die
        // der https-Stub tatsaechlich bekommen hat — nicht an einer
        // Behauptung im Text.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetD = [];
            const ausgabeZeilenD = [];
            const warteschlangeD = [
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-d1', 'lies', { pfad: 'schwaerzen-openai.js', von: 1, bis: 11 }), 100, 50),
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-d2', 'lies', { pfad: 'schwaerzen-pem.txt', von: 1, bis: 25 }), 100, 50),
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-d3', 'lies', { pfad: 'schwaerzen-platzhalter.js', von: 1, bis: 11 }), 100, 50),
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-d4', 'suche', { muster: 'ankerSuche' }), 100, 50),
                antwortKoerperBauen(elementTextBauen('TESTBERICHT-SCHWAERZEN'), 100, 50),
            ];

            https.request = httpsStubBauen(warteschlangeD, aufgezeichnetD);
            console.log = (msg) => ausgabeZeilenD.push(String(msg));

            let codeD;
            try {
                codeD = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-5.6-terra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-d.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen(`LAUF D ABGESCHLOSSEN 32 (drei Lesungen mit Geheimnis plus eine Suche enden regulaer mit Exit ${codeD}, Bericht kam an)`,
                codeD === 0 && aufgezeichnetD.length === 5
                && ausgabeZeilenD.some((z) => z.includes('TESTBERICHT-SCHWAERZEN'))
                && ausgabeZeilenD.some((z) => z.includes('Bericht regulaer erstellt')));

            // Der Koerper der 5. Anfrage traegt die volle Historie, also ALLE
            // vier Funktionsergebnisse. Erwartete Marker: 1 (openai) + 5 (PEM)
            // + 1 (Platzhalter) + 3 (Suche) = 10.
            const alleKoerper = JSON.stringify(aufgezeichnetD);
            const funktionsausgaben = aufgezeichnetD.length === 5
                ? aufgezeichnetD[4].input.filter((e) => e.type === 'function_call_output').map((e) => e.output).join('\n')
                : '';
            const fragmenteRaus = fragmentVorkommen(alleKoerper);
            const markerRaus = vorkommen(funktionsausgaben, '[ZEILE ENTFERNT — Geheimnis-Riegel: ');
            pruefen(`ANFRAGEKOERPER 33 (in allen 5 tatsaechlich gebauten Anfragekoerpern kommen die Geheimnis-Fragmente ${fragmenteRaus}x vor, die 4 Funktionsergebnisse tragen ${markerRaus} Marker, erwartet 0 und 10)`,
                fragmenteRaus === 0 && markerRaus === 10 && !alleKoerper.includes('BEGIN PRIVATE'));

            const geschwaerztBlock = ausgabeZeilenD.join('\n');
            pruefen('BERICHT 34 (Zusammenfassung nennt unter "GESCHWAERZTE STELLEN" alle 10 blinden Zeilen mit Datei, Zeile und Muster)',
                geschwaerztBlock.includes('GESCHWAERZTE STELLEN')
                && geschwaerztBlock.includes('  schwaerzen-openai.js:6 (OpenAI-Schlüssel)')
                && [11, 12, 13, 14, 15].every((z) => geschwaerztBlock.includes(`  schwaerzen-pem.txt:${z} (privater Schlüssel (PEM))`))
                && geschwaerztBlock.includes('  schwaerzen-platzhalter.js:6 (Verbindungszeichenfolge mit Passwort)')
                && geschwaerztBlock.includes('  schwaerzen-github.js:6 (GitHub-Token)')
                && geschwaerztBlock.includes('  schwaerzen-telegram.js:6 (Telegram-Bot-Token)')
                && !geschwaerztBlock.includes('GESCHWAERZTE STELLEN (Geheimnis-Riegel; dort war die Pruefung blind):\n  (keine)'));
        }

        // ===== LAUF E: geplatzter Lesungs-Deckel wird zur ABLEHNUNG, nicht
        // mehr zum ABBRUCH (Nacharbeit 13.09.2026) =====
        // schwaerzen-viele.js reisst in werkzeugLies() weiterhin denselben
        // Deckel wie in DECKEL 27 oben (der bleibt unveraendert gruen,
        // s. dort) -- main() macht daraus seit heute aber KEIN Exit 3 mehr,
        // sondern ein abgelehntes Funktionsergebnis, und der Lauf laeuft bis
        // zum regulaeren Abschluss weiter. Gemessen wird an allen Stellen,
        // die main() tatsaechlich anfasst: dem gesendeten Funktionsergebnis
        // (nicht an einer Behauptung im Text), der Konsole, dem
        // JSONL-Protokoll UND der ASTRA-LAEUFE-Zeile.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;

            const aufgezeichnetE = [];
            const ausgabeZeilenE = [];
            const fehlerZeilenE = [];
            const warteschlangeE = [
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-e1', 'lies', { pfad: 'schwaerzen-viele.js', von: 1, bis: 40 }), 100, 50),
                antwortKoerperBauen(elementTextBauen('TESTBERICHT-ABLEHNUNG'), 100, 50),
            ];
            https.request = httpsStubBauen(warteschlangeE, aufgezeichnetE);
            console.log = (msg) => ausgabeZeilenE.push(String(msg));
            console.error = (msg) => fehlerZeilenE.push(String(msg));

            const protokollPfadE = path.join(klon, 'selbsttest-protokoll-e.jsonl');
            let codeE;
            try {
                codeE = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--max-runden=10',
                    `--protokoll=${protokollPfadE}`,
                    '--zweck=selbsttest-lauf-e-ablehnung',
                ]);
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen(`LAUF E ABGESCHLOSSEN 36 (geplatzter Lesungs-Deckel bricht NICHT mehr den Lauf ab: Exit ${codeE} (erwartet 0), ${aufgezeichnetE.length} Anfragekoerper gebaut (erwartet 2 -- ein Abbruch nach der ersten Anfrage waere nur 1), Bericht kam an)`,
                codeE === 0 && aufgezeichnetE.length === 2
                && ausgabeZeilenE.some((z) => z.includes('TESTBERICHT-ABLEHNUNG'))
                && ausgabeZeilenE.some((z) => z.includes('Bericht regulaer erstellt')));

            pruefen('LAUF E KONSOLE 37 (Meldung heisst "LESUNG ABGELEHNT", nennt Ort und "der Lauf geht weiter" -- NICHT mehr "ABBRUCH")',
                fehlerZeilenE.some((z) => z.includes('LESUNG ABGELEHNT') && z.includes('schwaerzen-viele.js Zeilen 1-40 (von 40)') && z.includes('der Lauf geht weiter'))
                && !fehlerZeilenE.some((z) => z.includes('ABBRUCH') && z.toLowerCase().includes('geheimnis')));

            const funktionsausgabeE = aufgezeichnetE.length === 2
                ? aufgezeichnetE[1].input.filter((e) => e.type === 'function_call_output' && e.call_id === 'call-e1').map((e) => e.output).join('\n')
                : '';
            // Nacharbeit 13.09.2026 (Gegenlesung): der Ablehnungstext darf
            // nicht mehr behaupten, aus der DATEI werde nichts geliefert
            // (falsch -- ein anderer Ausschnitt kann durchgehen) und muss
            // genau das auch sagen.
            pruefen(`LAUF E FUNKTIONSERGEBNIS 38 (das an das Modell zurueckgegebene Funktionsergebnis fuer call-e1 ist eine Ablehnung, nennt Ausschnitt und Musternamen, sagt zutreffend statt "deshalb wird NICHTS aus dieser Datei geliefert", aber KEIN Geheimnismaterial -- Fragment "N".repeat(20) kommt ${vorkommen(funktionsausgabeE, 'N'.repeat(20))}x vor, erwartet 0)`,
                funktionsausgabeE.startsWith('abgelehnt:')
                && funktionsausgabeE.includes('schwaerzen-viele.js Zeilen 1-40 (von 40)')
                && funktionsausgabeE.includes('GitHub-Token')
                && funktionsausgabeE.includes('aus DIESEM Ausschnitt wird')
                && funktionsausgabeE.includes('Ein anderer oder kleinerer Ausschnitt derselben Datei kann dagegen durchgehen')
                && !funktionsausgabeE.includes('deshalb wird NICHTS aus dieser Datei geliefert')
                && vorkommen(funktionsausgabeE, 'N'.repeat(20)) === 0);

            const zusammenfassungE = ausgabeZeilenE.join('\n');
            pruefen('LAUF E ZUSAMMENFASSUNG 39 (neuer Block "ABGELEHNTE LESUNGEN" spricht von AUSSCHNITTEN statt von Dateien und nennt Bereich, Gesamtlaenge, Trefferzahl und Musternamen)',
                !zusammenfassungE.includes('diese Dateien hat der Pruefer NIE gesehen')
                && zusammenfassungE.includes('ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; andere Teile derselben Datei koennen geliefert worden sein):')
                && zusammenfassungE.includes('  schwaerzen-viele.js Zeilen 1-40 (von 40) — 30 Trefferzeilen, Muster: GitHub-Token'));

            const protokollEintraegeE = fs.readFileSync(protokollPfadE, 'utf8').trim().split('\n').filter(Boolean).map((z) => JSON.parse(z));
            pruefen('LAUF E JSONL-PROTOKOLL 40 (ein Eintrag vom neuen Typ "geheimnis_ablehnung", KEINER mehr vom alten Typ "geheimnis_abbruch")',
                protokollEintraegeE.some((e) => e.typ === 'geheimnis_ablehnung' && e.ort === 'schwaerzen-viele.js Zeilen 1-40 (von 40)'
                    && Array.isArray(e.muster) && e.muster.includes('GitHub-Token'))
                && !protokollEintraegeE.some((e) => e.typ === 'geheimnis_abbruch'));

            const hintergrundNachLaufE = fs.readFileSync(process.env.ASTRA_LAUFPROTOKOLL, 'utf8');
            const zeileE = hintergrundNachLaufE.split('\n').find((z) => z.includes('selbsttest-lauf-e-ablehnung'));
            pruefen(`LAUF E ASTRA-LAEUFE-ZEILE 41 (der Lauf traegt sich als REGULAERER Abschluss ins Lauf-Protokoll ein, NICHT als Abbruch: Zeile "${zeileE}")`,
                Boolean(zeileE) && !zeileE.includes('abgebrochen'));
        }

        // ===== DEEPSEEK ALS ZWEITER ANBIETER (Auftrag 23.09.2026) =====
        // Der HTTP-Weg selbst (anfragen(), SSE-Parser, Rundenschleife,
        // Geheimnis-Riegel) ist fuer DeepSeek UNVERAENDERTER Code -- gemessen
        // wurde VOR dem Bau, dass /v1/responses bei deepseek-v4-pro exakt
        // dieselbe Form spricht (Dateikopf, ENDPUNKT_DEEPSEEK). Geprueft
        // wird hier deshalb NUR das NEUE: Anbieterwahl aus dem Modellnamen,
        // Schluesselwahl je Anbieter (kein Rueckfall in beide Richtungen),
        // der richtige Endpunkt wird angesteuert, und der Geheimnis-Riegel
        // wirkt auf diesem Weg identisch.

        // ----- Direkte Funktionspruefungen, ohne main()/Netz -----
        {
            pruefen('ANBIETERWAHL DEEPSEEK-PRAEFIX (istDeepseekModell erkennt "deepseek-v4-pro" und "deepseek-flash", NICHT "deepseek" ohne Bindestrich)',
                istDeepseekModell('deepseek-v4-pro') === true
                && istDeepseekModell('deepseek-flash') === true
                && istDeepseekModell('deepseek') === false);
            pruefen('ANBIETERWAHL KEIN STILLER RUECKFALL (ein unbekanntes Praefix bleibt wie heute ein OpenAI-Modell, kein drittes Verhalten)',
                istDeepseekModell('gpt-6-sol') === false
                && istDeepseekModell('mistral-large-2') === false
                && istDeepseekModell(VORGABE_MODELL) === false);
            pruefen('ANBIETERWAHL ENDPUNKT (endpunktFuerModell waehlt je Praefix den richtigen Endpunkt, unveraendert fuer OpenAI)',
                endpunktFuerModell('deepseek-v4-pro') === ENDPUNKT_DEEPSEEK
                && endpunktFuerModell('mistral-large-2') === ENDPUNKT_OPENAI
                && endpunktFuerModell('gpt-6-sol') === ENDPUNKT_OPENAI);
        }
        {
            const kostenDeepseek = kostenSchaetzen('deepseek-v4-pro', 2_000_000, 500_000);
            pruefen(`KOSTENFALL DEEPSEEK (PREISTABELLE traegt deepseek-v4-pro mit 1,32 $ rein / 3,96 $ raus je Mio. Token: 2 Mio. rein + 0,5 Mio. raus = 4,62 $, gemessen ${kostenDeepseek})`,
                typeof kostenDeepseek === 'number' && Math.abs(kostenDeepseek - 4.62) < 1e-9);
        }
        {
            const alterOpenaiKey = process.env.OPENAI_API_KEY;
            const alteOpenaiDatei = process.env.OPENAI_KEY_DATEI;
            const alterDsKey = process.env.DEEPSEEK_API_KEY;
            const alteDsDatei = process.env.DEEPSEEK_KEY_DATEI;
            try {
                delete process.env.OPENAI_API_KEY;
                delete process.env.OPENAI_KEY_DATEI;
                delete process.env.DEEPSEEK_API_KEY;
                delete process.env.DEEPSEEK_KEY_DATEI;

                pruefen('SCHLUESSEL FEHLT BEIDE (kein Schluessel gesetzt: schluesselHolen() liefert fuer BEIDE Anbieter null)',
                    schluesselHolen('deepseek-v4-pro') === null && schluesselHolen('gpt-6-sol') === null);

                process.env.DEEPSEEK_API_KEY = 'selbsttest-dummy-deepseek-schluessel-env';
                pruefen('SCHLUESSEL KEIN RUECKFALL AUF OPENAI (nur DEEPSEEK_API_KEY gesetzt: ein OpenAI-Modell bekommt trotzdem null, KEIN falscher Schluessel)',
                    schluesselHolen('deepseek-v4-pro') === 'selbsttest-dummy-deepseek-schluessel-env'
                    && schluesselHolen('gpt-6-sol') === null);
                delete process.env.DEEPSEEK_API_KEY;

                process.env.OPENAI_API_KEY = 'selbsttest-dummy-openai-schluessel-env';
                pruefen('SCHLUESSEL KEIN RUECKFALL AUF DEEPSEEK (nur OPENAI_API_KEY gesetzt: ein DeepSeek-Modell bekommt trotzdem null, KEIN falscher Schluessel)',
                    schluesselHolen('gpt-6-sol') === 'selbsttest-dummy-openai-schluessel-env'
                    && schluesselHolen('deepseek-v4-pro') === null);
                delete process.env.OPENAI_API_KEY;

                const dsKeyDateiPfad = path.join(klon, 'deepseek-schluessel-datei.txt');
                fs.writeFileSync(dsKeyDateiPfad, 'selbsttest-dummy-deepseek-schluessel-datei\n');
                process.env.DEEPSEEK_KEY_DATEI = dsKeyDateiPfad;
                pruefen('SCHLUESSEL AUS DEEPSEEK_KEY_DATEI (Datei ausserhalb des Repos, getrimmt -- gleiche Behandlung wie OPENAI_KEY_DATEI)',
                    schluesselHolen('deepseek-v4-pro') === 'selbsttest-dummy-deepseek-schluessel-datei');
                delete process.env.DEEPSEEK_KEY_DATEI;
            } finally {
                if (alterOpenaiKey !== undefined) process.env.OPENAI_API_KEY = alterOpenaiKey; else delete process.env.OPENAI_API_KEY;
                if (alteOpenaiDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteOpenaiDatei; else delete process.env.OPENAI_KEY_DATEI;
                if (alterDsKey !== undefined) process.env.DEEPSEEK_API_KEY = alterDsKey; else delete process.env.DEEPSEEK_API_KEY;
                if (alteDsDatei !== undefined) process.env.DEEPSEEK_KEY_DATEI = alteDsDatei; else delete process.env.DEEPSEEK_KEY_DATEI;
            }
        }

        // ----- DEEPSEEK OHNE SCHLUESSEL: bricht LAUT ab, springt NICHT auf
        // einen vorhandenen OpenAI-Schluessel um -----
        {
            const alterOpenaiKey = process.env.OPENAI_API_KEY;
            const alteOpenaiDatei = process.env.OPENAI_KEY_DATEI;
            const alterDsKey = process.env.DEEPSEEK_API_KEY;
            const alteDsDatei = process.env.DEEPSEEK_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz'; // vorhanden, darf NICHT einspringen
            delete process.env.OPENAI_KEY_DATEI;
            delete process.env.DEEPSEEK_API_KEY;
            delete process.env.DEEPSEEK_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesError = console.error;
            const aufgezeichnetDsFehlt = [];
            const fehlerZeilenDsFehlt = [];
            https.request = httpsStubBauen([], aufgezeichnetDsFehlt);
            console.error = (msg) => fehlerZeilenDsFehlt.push(String(msg));
            let codeDsFehlt;
            try {
                codeDsFehlt = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=deepseek-v4-pro',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-ds-fehlt.jsonl')}`,
                ]);
            } finally {
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterOpenaiKey !== undefined) process.env.OPENAI_API_KEY = alterOpenaiKey; else delete process.env.OPENAI_API_KEY;
                if (alteOpenaiDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteOpenaiDatei;
                if (alterDsKey !== undefined) process.env.DEEPSEEK_API_KEY = alterDsKey;
                if (alteDsDatei !== undefined) process.env.DEEPSEEK_KEY_DATEI = alteDsDatei;
            }
            const abbruchMsgDsFehlt = fehlerZeilenDsFehlt.find((z) => z.includes('ABBRUCH: Kein Schluessel'));
            pruefen(`DEEPSEEK OHNE SCHLUESSEL BRICHT LAUT AB (Exit ${codeDsFehlt} (erwartet 2), ${aufgezeichnetDsFehlt.length} Anfragen gebaut (erwartet 0), Meldung nennt DEEPSEEK_API_KEY/DEEPSEEK_KEY_DATEI, NICHT OPENAI_API_KEY: "${abbruchMsgDsFehlt}")`,
                codeDsFehlt === 2 && aufgezeichnetDsFehlt.length === 0
                && typeof abbruchMsgDsFehlt === 'string'
                && abbruchMsgDsFehlt.includes('DEEPSEEK_API_KEY')
                && abbruchMsgDsFehlt.includes('DEEPSEEK_KEY_DATEI')
                && !abbruchMsgDsFehlt.includes('OPENAI_API_KEY'));
        }

        // ===== LAUF DS: DeepSeek-Anbieterwahl Ende-zu-Ende, gemessen am
        // Anfragekoerper -- derselbe Aufbau wie LAUF D oben, nur mit
        // --modell=deepseek-v4-pro und einem DEEPSEEK_API_KEY, OHNE dass je
        // ein OPENAI_API_KEY gesetzt ist. Liest dieselbe Fixture-Datei
        // schwaerzen-github.js wieder, die oben schon fuer LAUF D angelegt
        // wurde (keine zweite Kopie). =====
        {
            const alterOpenaiKey = process.env.OPENAI_API_KEY;
            const alteOpenaiDatei = process.env.OPENAI_KEY_DATEI;
            const alterDsKey = process.env.DEEPSEEK_API_KEY;
            const alteDsDatei = process.env.DEEPSEEK_KEY_DATEI;
            delete process.env.OPENAI_API_KEY; // absichtlich NICHT gesetzt -- darf nicht gebraucht werden
            delete process.env.OPENAI_KEY_DATEI;
            process.env.DEEPSEEK_API_KEY = 'selbsttest-dummy-deepseek-schluessel-ohne-netz';
            delete process.env.DEEPSEEK_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetDS = [];
            const aufgezeichneteUrlsDS = [];
            const ausgabeZeilenDS = [];
            const warteschlangeDS = [
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-ds1', 'lies', { pfad: 'schwaerzen-github.js', von: 1, bis: 11 }), 100, 50),
                antwortKoerperBauen(elementTextBauen('TESTBERICHT-DEEPSEEK'), 100, 50),
            ];
            https.request = httpsStubBauen(warteschlangeDS, aufgezeichnetDS, null, aufgezeichneteUrlsDS);
            console.log = (msg) => ausgabeZeilenDS.push(String(msg));

            let codeDS;
            try {
                codeDS = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=deepseek-v4-pro',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-ds.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterOpenaiKey !== undefined) process.env.OPENAI_API_KEY = alterOpenaiKey;
                if (alteOpenaiDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteOpenaiDatei;
                if (alterDsKey !== undefined) process.env.DEEPSEEK_API_KEY = alterDsKey; else delete process.env.DEEPSEEK_API_KEY;
                if (alteDsDatei !== undefined) process.env.DEEPSEEK_KEY_DATEI = alteDsDatei;
            }

            pruefen(`LAUF DS ABGESCHLOSSEN (Exit ${codeDS} (erwartet 0), ${aufgezeichnetDS.length} Anfragen gebaut (erwartet 2), Bericht kam an -- OHNE dass je ein OPENAI_API_KEY gesetzt war)`,
                codeDS === 0 && aufgezeichnetDS.length === 2
                && ausgabeZeilenDS.some((z) => z.includes('TESTBERICHT-DEEPSEEK'))
                && ausgabeZeilenDS.some((z) => z.includes('Bericht regulaer erstellt')));

            pruefen(`LAUF DS ENDPUNKT (BEIDE Anfragen gingen an den DeepSeek-Endpunkt "${ENDPUNKT_DEEPSEEK}", KEINE an den OpenAI-Endpunkt: ${JSON.stringify(aufgezeichneteUrlsDS)})`,
                aufgezeichneteUrlsDS.length === 2 && aufgezeichneteUrlsDS.every((u) => u === ENDPUNKT_DEEPSEEK));

            const koerperDS = JSON.stringify(aufgezeichnetDS);
            pruefen(`LAUF DS SCHLUESSEL NICHT IM KOERPER (der aufgezeichnete Anfragekoerper enthaelt den DeepSeek-Schluessel NICHT: ${koerperDS.includes('selbsttest-dummy-deepseek-schluessel-ohne-netz') ? 'GEFUNDEN' : 'nicht gefunden'})`,
                !koerperDS.includes('selbsttest-dummy-deepseek-schluessel-ohne-netz'));

            const funktionsausgabeDS = aufgezeichnetDS.length === 2
                ? aufgezeichnetDS[1].input.filter((e) => e.type === 'function_call_output' && e.call_id === 'call-ds1').map((e) => e.output).join('\n')
                : '';
            pruefen(`LAUF DS GEHEIMNIS-RIEGEL WIRKT AUCH HIER (das GitHub-Token-Fragment kommt im GESAMTEN Anfragekoerper ${vorkommen(koerperDS, 'F'.repeat(20))}x vor (erwartet 0), das Funktionsergebnis traegt den Schwaerzungs-Marker: ${funktionsausgabeDS.includes('[ZEILE ENTFERNT — Geheimnis-Riegel: ')})`,
                vorkommen(koerperDS, 'F'.repeat(20)) === 0
                && funktionsausgabeDS.includes('[ZEILE ENTFERNT — Geheimnis-Riegel: ')
                && funktionsausgabeDS.includes('GitHub-Token'));
        }

        // ===== GEMISCHTER LAUF: derselbe Lauf liest dieselbe Datei ERST in
        // einem harmlosen Teilbereich, DANACH im vollen Bereich, wo der
        // Deckel reisst (Nacharbeit 13.09.2026, Gegenlesung) =====
        // Das ist der Fall, der den eigentlichen Befund bewacht: die alte
        // Formulierung behauptete, der Pruefer habe die DATEI nie gesehen --
        // hier hat er sie tatsaechlich schon gelesen (Zeilen 1-10, reine
        // Fuellzeilen aus der Fixture-Anlage oben), BEVOR derselbe Deckel
        // wie in DECKEL 27 auf den vollen Bereich 1-40 reisst. Die Datei
        // muss danach GLEICHZEITIG unter GELESENE DATEIEN und mit ihrem
        // abgelehnten Ausschnitt unter ABGELEHNTE LESUNGEN stehen.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;

            const aufgezeichnetGL = [];
            const ausgabeZeilenGL = [];
            const fehlerZeilenGL = [];
            const warteschlangeGL = [
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-gl1', 'lies', { pfad: 'schwaerzen-viele.js', von: 1, bis: 10 }), 100, 50),
                antwortKoerperBauen(elementFunktionsaufrufBauen('call-gl2', 'lies', { pfad: 'schwaerzen-viele.js', von: 1, bis: 40 }), 100, 50),
                antwortKoerperBauen(elementTextBauen('TESTBERICHT-GEMISCHT'), 100, 50),
            ];
            https.request = httpsStubBauen(warteschlangeGL, aufgezeichnetGL);
            console.log = (msg) => ausgabeZeilenGL.push(String(msg));
            // Nacharbeit (Gegenlesung des Gegenlesers, 13.09.2026): NICHT
            // wegwerfen wie zuvor -- eine vorangegangene erfolgreiche Lesung
            // koennte die Ablehnungsmeldung sonst unbemerkt unterdruecken,
            // und Warnungen aus dem Laufprotokoll-Pfad wuerden spurlos
            // verschwinden. Aufzeichnen wie in LAUF E, unten geprueft.
            console.error = (msg) => fehlerZeilenGL.push(String(msg));

            const protokollPfadGL = path.join(klon, 'selbsttest-protokoll-gemischt.jsonl');
            let codeGL;
            try {
                codeGL = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--max-runden=10',
                    `--protokoll=${protokollPfadGL}`,
                    '--zweck=selbsttest-lauf-gemischt',
                ]);
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen(`GEMISCHTER LAUF ABGESCHLOSSEN 59 (dieselbe Datei wird ERST im harmlosen Bereich 1-10, DANN im vollen Bereich 1-40 gelesen, wo der Deckel reisst: Exit ${codeGL} (erwartet 0), ${aufgezeichnetGL.length} Anfragekoerper gebaut (erwartet 3: Lesung 1 -> Lesung 2 -> Bericht), Bericht kam an)`,
                codeGL === 0 && aufgezeichnetGL.length === 3
                && ausgabeZeilenGL.some((z) => z.includes('TESTBERICHT-GEMISCHT')));

            // Die letzte Anfrage traegt die volle Historie, also BEIDE
            // Funktionsergebnisse -- wie bei aufgezeichnetD[4] in LAUF D.
            const funktionsausgabeGL1 = aufgezeichnetGL.length === 3
                ? aufgezeichnetGL[2].input.filter((e) => e.type === 'function_call_output' && e.call_id === 'call-gl1').map((e) => e.output).join('\n')
                : '';
            const funktionsausgabeGL2 = aufgezeichnetGL.length === 3
                ? aufgezeichnetGL[2].input.filter((e) => e.type === 'function_call_output' && e.call_id === 'call-gl2').map((e) => e.output).join('\n')
                : '';

            pruefen('GEMISCHTER LAUF ERSTE LESUNG 60 (Bereich 1-10 ist reiner Fuellzeilenbereich: das Funktionsergebnis enthaelt echten Dateiinhalt, keine Ablehnung)',
                !funktionsausgabeGL1.startsWith('abgelehnt:')
                && funktionsausgabeGL1.includes('schwaerzen-viele.js (Zeilen 1-10 von 40)')
                && funktionsausgabeGL1.includes('1:// Zeile 1') && funktionsausgabeGL1.includes('10:// Zeile 10'));

            pruefen('GEMISCHTER LAUF ZWEITE LESUNG 61 (derselbe Deckel wie in DECKEL 27, diesmal auf denselben Bereich wie dort: das Funktionsergebnis ist eine Ablehnung)',
                funktionsausgabeGL2.startsWith('abgelehnt:'));

            const zusammenfassungGL = ausgabeZeilenGL.join('\n');
            pruefen('GEMISCHTER LAUF ZUSAMMENFASSUNG 62 (die Datei steht in GELESENE DATEIEN UND ihr abgelehnter Ausschnitt in ABGELEHNTE LESUNGEN -- die Ueberschrift behauptet NICHT mehr, die DATEI sei nie gesehen worden)',
                zusammenfassungGL.includes('GELESENE DATEIEN:') && zusammenfassungGL.includes('  schwaerzen-viele.js:1-10')
                && !zusammenfassungGL.includes('diese Dateien hat der Pruefer NIE gesehen')
                && zusammenfassungGL.includes('ABGELEHNTE LESUNGEN (Geheimnis-Deckel — diese AUSSCHNITTE hat der Pruefer NIE gesehen; andere Teile derselben Datei koennen geliefert worden sein):')
                && zusammenfassungGL.includes('  schwaerzen-viele.js Zeilen 1-40 (von 40) — 30 Trefferzeilen, Muster: GitHub-Token'));

            pruefen(`GEMISCHTER LAUF ABLEHNUNGSTEXT 63 (der an das Modell gesendete Ablehnungstext nennt den Bereich 1-40 und den Satz ueber den kleineren Ausschnitt, ohne Geheimnismaterial -- Fragment "N".repeat(20) kommt ${vorkommen(funktionsausgabeGL2, 'N'.repeat(20))}x vor, erwartet 0)`,
                funktionsausgabeGL2.includes('schwaerzen-viele.js Zeilen 1-40 (von 40)')
                && funktionsausgabeGL2.includes('Ein anderer oder kleinerer Ausschnitt derselben Datei kann dagegen durchgehen')
                && vorkommen(funktionsausgabeGL2, 'N'.repeat(20)) === 0);

            // Nacharbeit (Gegenlesung des Gegenlesers, 13.09.2026): stderr
            // wurde hier zuvor weggeworfen -- die Konsolenmeldung im
            // GEMISCHTEN Zustand (nach einer schon erfolgreichen Lesung
            // derselben Datei) war dadurch ungeprueft.
            pruefen('GEMISCHTER LAUF KONSOLE 64 ("LESUNG ABGELEHNT" kommt auch dann, wenn zuvor schon erfolgreich aus derselben Datei gelesen wurde)',
                fehlerZeilenGL.some((z) => z.includes('LESUNG ABGELEHNT') && z.includes('schwaerzen-viele.js Zeilen 1-40 (von 40)') && z.includes('der Lauf geht weiter')));
        }

        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            delete process.env.OPENAI_API_KEY;
            delete process.env.OPENAI_KEY_DATEI;
            let code;
            try {
                code = await main([path.join(klon, 'harmlos.txt'), `--brief=${briefFixturePfad}`, `--wurzel=${klon}`, '--max-runden=0']);
            } finally {
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            pruefen('GRENZFALL 8 (--max-runden=0 bricht sofort mit Exit 4 ab, ohne Schluessel und ohne Netz)', code === 4);
        }

        // ===== DEFEKT 2, GEGENPROBE: fehlendes --brief bricht laut ab =====
        // Positivkontrolle zu den Faellen unten, die --brief korrekt setzen:
        // OHNE --brief darf main() nicht bis zum Schluessel-/Netz-Code
        // vordringen, sondern muss VORHER mit dem eigenen Exit-Code 6
        // abbrechen -- ohne Schluessel und ohne Netz pruefbar, aus demselben
        // Grund wie GRENZFALL 8.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            delete process.env.OPENAI_API_KEY;
            delete process.env.OPENAI_KEY_DATEI;
            let code;
            try {
                code = await main([path.join(klon, 'harmlos.txt'), `--wurzel=${klon}`]);
            } finally {
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            pruefen('GRENZFALL 21 (kein --brief angegeben bricht sofort mit Exit 6 ab, ohne Schluessel und ohne Netz)', code === 6);
        }

        // ===== LAUF A: Rundenriegel und Rundenhinweis ueber 10 Runden =====
        // --max-runden=10 -> 70%-Schwelle ist Runde 7 (ceil(0.7*10)=7), die
        // letzten zwei Runden sind 9 und 10. Runden 1-8 rufen ein Werkzeug
        // auf (mit tools im Request), Runde 9 versucht es trotz fehlender
        // tools nochmal (der Code verarbeitet das dennoch -- der Riegel
        // sitzt am REQUEST, nicht an der Antwort), Runde 10 liefert Text.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetA = [];
            const ausgabeZeilenA = [];
            const warteschlangeA = [];
            for (let r = 1; r <= 9; r++) {
                warteschlangeA.push(antwortKoerperBauen(
                    elementFunktionsaufrufBauen(`call-${r}`, 'suche', { muster: 'Zeile' }),
                    100, 50,
                ));
            }
            warteschlangeA.push(antwortKoerperBauen(elementTextBauen('TESTBERICHT-ENDE'), 100, 50));

            https.request = httpsStubBauen(warteschlangeA, aufgezeichnetA);
            console.log = (msg) => ausgabeZeilenA.push(String(msg));

            let codeA;
            try {
                codeA = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-5.6-terra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-a.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen('LAUF A ABGESCHLOSSEN 9 (voller 10-Runden-Lauf mit Werkzeugaufrufen endet regulaer mit Exit 0)', codeA === 0);

            const werkzeugeVorhandenRunden1bis8 = aufgezeichnetA.slice(0, 8)
                .every((k) => Array.isArray(k.tools) && k.tools.length === WERKZEUGE.length);
            pruefen('RUNDENRIEGEL 10 (Runden 1-8 schicken "tools" tatsaechlich mit -- Positivkontrolle)', werkzeugeVorhandenRunden1bis8);

            const keineWerkzeugeLetzteZwei = !!aufgezeichnetA[8] && !!aufgezeichnetA[9]
                && aufgezeichnetA[8].tools === undefined && aufgezeichnetA[9].tools === undefined;
            pruefen('RUNDENRIEGEL 11 (Runden 9+10 -- die letzten zwei -- schicken KEIN "tools" mit, geprueft an der tatsaechlich gebauten Anfrage)', keineWerkzeugeLetzteZwei);

            const letzteNachricht = (koerper) => koerper && koerper.input[koerper.input.length - 1].content;
            const hinweisRunde3 = letzteNachricht(aufgezeichnetA[2]);
            pruefen(`RUNDENHINWEIS 12 (Runde 3 von 10 zeigt den schlichten Stand: "${hinweisRunde3}")`,
                hinweisRunde3 === '[Rundenstand: Runde 3 von 10 -- danach noch 7 moeglich.]');

            const hinweisRunde7 = letzteNachricht(aufgezeichnetA[6]);
            pruefen(`RUNDENHINWEIS 13 (Runde 7 von 10, ab 70% verbraucht, zeigt den deutlichen Hinweis: "${hinweisRunde7}")`,
                typeof hinweisRunde7 === 'string'
                && hinweisRunde7.startsWith('[Rundenstand: Runde 7 von 10 -- danach noch 3 moeglich.]')
                && hinweisRunde7.includes('70%'));

            const hinweisRunde9 = letzteNachricht(aufgezeichnetA[8]);
            pruefen(`RUNDENHINWEIS 14 (Runde 9 von 10, letzte zwei, zeigt die harte Aufforderung: "${hinweisRunde9}")`,
                typeof hinweisRunde9 === 'string'
                && hinweisRunde9.startsWith('[Rundenstand: Runde 9 von 10 -- danach noch 1 moeglich.]')
                && hinweisRunde9.includes('LETZTE RUNDE'));

            pruefen('BERICHTSKENNZEICHNUNG 15 (Bericht aus Runde 10 ist als "UNTER RUNDENDRUCK" markiert, nicht als regulaer)',
                ausgabeZeilenA.some((z) => z.includes('TESTBERICHT-ENDE'))
                && ausgabeZeilenA.some((z) => z.includes('BERICHT UNTER RUNDENDRUCK'))
                && !ausgabeZeilenA.some((z) => z.includes('Bericht regulaer erstellt')));

            pruefen('KOSTENZEILE 16 (voller Lauf mit bekanntem Modell druckt eine numerische Kostenzeile)',
                ausgabeZeilenA.some((z) => /^Kosten geschaetzt: \$\d/.test(z)));
        }

        // ===== LAUF B: Bericht WEIT vor dem Limit ist "regulaer" =====
        // Gegenprobe zu Fall 15: derselbe Kennzeichnungscode, aber Runde 1
        // von 10 liegt nicht in den letzten zwei Runden -- der Bericht muss
        // als regulaer markiert sein, NICHT als unter Rundendruck.
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetB = [];
            const ausgabeZeilenB = [];
            const warteschlangeB = [antwortKoerperBauen(elementTextBauen('TESTBERICHT-SOFORT'), 100, 50)];

            https.request = httpsStubBauen(warteschlangeB, aufgezeichnetB);
            console.log = (msg) => ausgabeZeilenB.push(String(msg));

            let codeB;
            try {
                codeB = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-5.6-terra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-b.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen('BERICHTSKENNZEICHNUNG 17 (Bericht aus Runde 1 von 10 -- weit vor dem Limit -- ist als regulaer markiert, NICHT als unter Rundendruck)',
                codeB === 0
                && ausgabeZeilenB.some((z) => z.includes('Bericht regulaer erstellt'))
                && !ausgabeZeilenB.some((z) => z.includes('RUNDENDRUCK')));
        }

        // ===== KOSTENZEILE: reine Funktionspruefung, wörtlicher Erwartungswert =====
        {
            const kostenTerra = kostenSchaetzen('gpt-5.6-terra', 2_000_000, 500_000);
            // Woertlicher Erwartungswert, NICHT aus PREISTABELLE zurueckgerechnet:
            // 2 Mio Token rein * 2,50 $/Mio = 5,00 $; 0,5 Mio Token raus *
            // 15,00 $/Mio = 7,50 $; Summe 12,50 $.
            pruefen(`KOSTENFALL 18 (2 Mio rein / 0,5 Mio raus bei gpt-5.6-terra ergibt ${kostenTerra}, woertlicher Erwartungswert 12.5)`,
                kostenTerra === 12.5);
        }
        {
            const kostenUnbekannt = kostenSchaetzen('modell-unbekannt-xyz-imaginaer', 1000, 1000);
            pruefen('KOSTENFALL 19 (Modell ohne Preiseintrag liefert null aus kostenSchaetzen(), nicht 0)', kostenUnbekannt === null);
        }

        // ===== LAUF C: unbekanntes Modell im vollen Lauf =====
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;

            const aufgezeichnetC = [];
            const ausgabeZeilenC = [];
            const warteschlangeC = [antwortKoerperBauen(elementTextBauen('TESTBERICHT-UNBEKANNTES-MODELL'), 100, 50)];

            https.request = httpsStubBauen(warteschlangeC, aufgezeichnetC);
            console.log = (msg) => ausgabeZeilenC.push(String(msg));

            let codeC;
            try {
                codeC = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=modell-unbekannt-xyz-imaginaer',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-c.jsonl')}`,
                ]);
            } finally {
                console.log = echtesLog;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }

            pruefen('KOSTENZEILE 20 (voller Lauf mit unbekanntem Modell druckt "Kosten unbekannt", NIE 0,00 oder $0.00)',
                codeC === 0
                && ausgabeZeilenC.some((z) => z.includes('Kosten unbekannt (Modell "modell-unbekannt-xyz-imaginaer" nicht in der Preistabelle)'))
                && !ausgabeZeilenC.some((z) => /Kosten geschaetzt/.test(z)));
        }

        // ===== B2 (Review-Bot-Befund an PR #45, GEMESSEN 19.09.2026):
        // maxAusgabeBytesErmitteln() -- dieselbe Funktion, die main() ruft,
        // in DERSELBEN Aufrufform (ein String oder undefined), kein
        // Netzverkehr noetig. Je Fall einzeln, die Zusicherung prueft die
        // MELDUNG, nicht nur, dass ueberhaupt geworfen wird. =====
        {
            pruefen(`B2 NICHT GESETZT -> VORGABE (93) (${maxAusgabeBytesErmitteln(undefined)})`,
                maxAusgabeBytesErmitteln(undefined) === MAX_AUSGABE_BYTES_VORGABE);
            pruefen(`B2 LEER -> VORGABE (94) (${maxAusgabeBytesErmitteln('')})`,
                maxAusgabeBytesErmitteln('') === MAX_AUSGABE_BYTES_VORGABE);
            pruefen(`B2 "900000" LAEUFT DURCH (95) (${maxAusgabeBytesErmitteln('900000')})`,
                maxAusgabeBytesErmitteln('900000') === 900000);

            const mussAbbrechen = (bezeichnung, nummer, rohwert) => {
                let geworfen = null;
                try { maxAusgabeBytesErmitteln(rohwert); } catch (e) { geworfen = e; }
                pruefen(`B2 ${bezeichnung} BRICHT LAUT AB (${nummer}) (Meldung nennt den Wert und "Ganzzahl": ${geworfen ? geworfen.message : '(kein Wurf! Deckel bliebe still falsch konfiguriert)'})`,
                    !!geworfen && geworfen.message.includes(String(rohwert)) && geworfen.message.includes('Ganzzahl'));
            };
            mussAbbrechen('"-1"', 96, '-1');
            mussAbbrechen('"1.5"', 97, '1.5');
            mussAbbrechen('"Infinity"', 98, 'Infinity');
            mussAbbrechen('"abc"', 99, 'abc');
            mussAbbrechen('"0"', 100, '0');
        }

        // ===== STREAMING/SSE-UMBAU (19.09.2026): GP1-GP10 + B3/B4/B8 =====
        // anfragen() wird hier DIREKT gerufen (kein main()-Umweg noetig fuer
        // alles, was nicht --zweck/--brief betrifft) -- gemeinsamer Rahmen:
        // Stub aufbauen, anfragen() rufen, https.request zuverlaessig
        // zuruecksetzen, Ergebnis ODER Fehler zurueckgeben.
        // "zerstoerungen" (optional, fuer B1): Array, in das der Stub jeden
        // destroy()-Aufruf auf der ANFRAGE eintraegt -- weitergereicht an
        // httpsStubBauen, bestehende Aufrufe ohne diesen Parameter bleiben
        // unveraendert.
        // "modell" ist OPTIONAL (dritter Parameter, DeepSeek-Anbieterwahl
        // 23.09.2026): bestehende Aufrufe uebergeben ihn nicht und bleiben
        // bei 'gpt-5.6-sol' (OpenAI-Weg) unveraendert.
        const anfragenIsoliertPruefen = async (warteschlange, zerstoerungen, modell = 'gpt-5.6-sol') => {
            const alterHttpsRequest = https.request;
            const aufgezeichnet = [];
            https.request = httpsStubBauen(warteschlange, aufgezeichnet, zerstoerungen);
            let ergebnis = null;
            let fehler = null;
            try {
                ergebnis = await anfragen('selbsttest-dummy-schluessel-ohne-netz', modell, [{ role: 'user', content: 'GP-Selbsttest' }]);
            } catch (e) {
                fehler = e;
            } finally {
                https.request = alterHttpsRequest;
            }
            return { ergebnis, fehler, aufgezeichnet };
        };
        // Wachhund (GP7): ein Versprechen, das nicht innerhalb von "ms"
        // aufloest, gilt als HAENGEND -- Beleg, dass eine kontrollierte
        // Ablehnung wirklich ankommt statt die Promise fuer immer offen zu
        // lassen (Papier B2).
        const mitWachhund = (versprechen, ms) => new Promise((resolve) => {
            const timer = setTimeout(() => resolve({ art: 'HAENGT (Wachhund)' }), ms);
            versprechen.then(
                (wert) => { clearTimeout(timer); resolve({ art: 'geloest', wert }); },
                (fehler) => { clearTimeout(timer); resolve({ art: 'abgelehnt', fehler }); },
            );
        });

        // ----- GP1: Chunk-Grenze mitten in einer data:-Zeile -----
        {
            const textAscii = 'TESTBERICHT-CHUNKGRENZE-ASCII';
            const vollerAscii = Buffer.from(sseStandardStromBauen(antwortKoerperBauen(elementTextBauen(textAscii), 10, 5)), 'utf8');
            const markerAscii = vollerAscii.indexOf(Buffer.from('"type":"response.completed"', 'utf8'));
            const schnittAscii = markerAscii + 14; // mitten im JSON-Feldwert, EINDEUTIG innerhalb der data:-Zeile
            const { ergebnis: ergAscii, fehler: fehlAscii } = await anfragenIsoliertPruefen([sseRohEintragBauen({
                chunks: [vollerAscii.subarray(0, schnittAscii), vollerAscii.subarray(schnittAscii)],
            })]);
            pruefen(`GP1 CHUNK-GRENZE INNERHALB EINER data:-ZEILE (59) (Trennung mitten im Wort "completed" der data:-Zeile, muss durchlaufen: ${fehlAscii ? 'ABGELEHNT: ' + fehlAscii.message : textAusAusgabe(ergAscii.output)})`,
                !fehlAscii && !!ergAscii && textAusAusgabe(ergAscii.output) === textAscii);
        }
        {
            // B1/B14: eine MEHRBYTE-Fixtur, deren Schnitt ZWISCHEN den beiden
            // UTF-8-Bytes von "ü" liegt -- eine ASCII-Fixtur kann diese
            // Klasse nicht ausloesen (Lehrbuchfall "Testdaten, die den
            // gesuchten Unterschied gar nicht auslösen können").
            const textUmlaut = 'Pruefung: Sonderzeichen ueber die Chunk-Grenze: ü (muss zeichengetreu ankommen)';
            const vollerUmlaut = Buffer.from(sseStandardStromBauen(antwortKoerperBauen(elementTextBauen(textUmlaut), 10, 5)), 'utf8');
            const umlautIndex = vollerUmlaut.indexOf(Buffer.from('ü', 'utf8'));
            if (umlautIndex === -1) throw new Error('GP1-Fixture: "ü" nicht im SSE-Text gefunden -- Fixture kaputt');
            const schnittUmlaut = umlautIndex + 1; // zwischen den beiden Bytes von "ü"
            const { ergebnis: ergUml, fehler: fehlUml } = await anfragenIsoliertPruefen([sseRohEintragBauen({
                chunks: [vollerUmlaut.subarray(0, schnittUmlaut), vollerUmlaut.subarray(schnittUmlaut)],
            })]);
            const textZurueck = ergUml ? textAusAusgabe(ergUml.output) : null;
            pruefen(`GP1 CHUNK-GRENZE MITTEN IM MEHRBYTEZEICHEN (60) (Schnitt zwischen den zwei Bytes von "ü": Text kommt zeichengetreu an, kein Ersatzzeichen U+FFFD: ${JSON.stringify(textZurueck)})`,
                !fehlUml && textZurueck === textUmlaut && !(textZurueck || '').includes('�'));
        }

        // ----- GP2: Strom ohne Abschluss-Ereignis -- Bytes/Zeilen/Typ als
        // LITERALE aus der Fixtur, NICHT vom Produktionsparser berechnet -----
        {
            const gp2Zeilen = [
                'event: response.created',
                'data: {"type":"response.created"}',
                '',
                'data: {"type":"response.output_text.delta","delta":"x"}',
                '',
            ];
            const gp2Text = gp2Zeilen.join('\n') + '\n';
            // N3 (Gegenlesung 19.09.2026): GP2_BYTES war
            // Buffer.byteLength(gp2Text) -- "unabhaengiges
            // Buffer.byteLength, NICHT der SSE-Parser" ist unabhaengig vom
            // PARSER, aber NICHT von der FIXTUR: aendert sich gp2Zeilen,
            // rechnet sich dieser Wert lautlos mit, die Zusicherung kann
            // nie fallen. Von Hand ausgezaehlt statt aus der Fixtur
            // berechnet: 23+33+0+55+0 Zeichen (die fuenf Zeilen oben) + 5
            // Zeilenumbrueche (4 Trenner aus join('\n'), 1 abschliessender
            // aus "+ '\n'") = 116.
            const GP2_BYTES = 116;
            const GP2_DATENZEILEN = 2; // von Hand ausgezaehlt: exakt zwei "data:"-Zeilen oben
            const GP2_LETZTER_TYP = 'response.output_text.delta'; // die letzte data:-Zeile traegt genau diesen type
            const { fehler: fehlGp2 } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [gp2Text] })]);
            const msgGp2 = fehlGp2 ? fehlGp2.message : '(kein Fehler geworfen!)';
            pruefen(`GP2 BYTES WOERTLICH AUS DER FIXTUR (61) (Meldung nennt "Empfangene Bytes: ${GP2_BYTES}": "${msgGp2}")`,
                !!fehlGp2 && msgGp2.includes(`Empfangene Bytes: ${GP2_BYTES},`));
            pruefen(`GP2 ANZAHL data:-ZEILEN WOERTLICH (62) (Meldung nennt "gelesene data:-Zeilen: ${GP2_DATENZEILEN}": "${msgGp2}")`,
                !!fehlGp2 && msgGp2.includes(`gelesene data:-Zeilen: ${GP2_DATENZEILEN},`));
            pruefen(`GP2 LETZTER EREIGNISTYP WOERTLICH (63) (Meldung nennt "zuletzt gesehener Ereignistyp: ${GP2_LETZTER_TYP}": "${msgGp2}")`,
                !!fehlGp2 && msgGp2.includes(`zuletzt gesehener Ereignistyp: ${GP2_LETZTER_TYP}.`));
        }

        // ----- GP3: response.incomplete mit reason max_output_tokens (Form
        // aus M3) -- status UND reason einzeln zusicherbar -----
        let fehlerGp3FuerB8 = null;
        {
            const { fehler: fehlGp3 } = await anfragenIsoliertPruefen([antwortKoerperUnvollstaendigBauen('max_output_tokens', 500, 24000)]);
            fehlerGp3FuerB8 = fehlGp3;
            pruefen(`GP3 STATUS INCOMPLETE (64) (anfragen() wirft bei status=incomplete: "${fehlGp3 ? fehlGp3.message : '(kein Fehler!)'}")`,
                !!fehlGp3 && fehlGp3.gegenleserStatus === 'incomplete' && fehlGp3.message.includes('status="incomplete"'));
            pruefen(`GP3 REASON max_output_tokens WOERTLICH (65) (Grund steht woertlich in der Meldung)`,
                !!fehlGp3 && fehlGp3.gegenleserGrund === 'max_output_tokens' && fehlGp3.message.includes('max_output_tokens'));
        }
        // ----- B8: der Verbrauch aus GENAU DIESEM Abbruch bleibt am Fehler
        // haengen (500/24000, wie oben uebergeben) -- sonst verliert die
        // Rundenschleife ihn beim Verbuchen. -----
        pruefen(`GP3/B8 USAGE AM FEHLER ERHALTEN (66) (der geworfene Fehler traegt usage aus der Antwort: ${fehlerGp3FuerB8 && fehlerGp3FuerB8.gegenleserUsage ? JSON.stringify(fehlerGp3FuerB8.gegenleserUsage) : '(fehlt)'})`,
            !!fehlerGp3FuerB8 && !!fehlerGp3FuerB8.gegenleserUsage
            && fehlerGp3FuerB8.gegenleserUsage.input_tokens === 500 && fehlerGp3FuerB8.gegenleserUsage.output_tokens === 24000);

        // ----- GP4: Pflichtfelder am AUFGEZEICHNETEN Anfragekoerper -----
        {
            const { aufgezeichnet: aufgGp4 } = await anfragenIsoliertPruefen([antwortKoerperBauen(elementTextBauen('GP4-BERICHT'), 5, 5)]);
            const k = aufgGp4[0];
            pruefen(`GP4 stream:true (67) (der aufgezeichnete Anfragekoerper traegt stream:true: ${k && k.stream})`, !!k && k.stream === true);
            pruefen(`GP4 store:false (68) (${k && k.store})`, !!k && k.store === false);
            pruefen(`GP4 truncation:'disabled' (69) (${k && k.truncation})`, !!k && k.truncation === 'disabled');
            // N4 (Gegenlesung 19.09.2026): pruefte nur typeof/length -- die
            // FORM statt des WERTES. "EFFORT von 'xhigh' auf 'low' gesetzt"
            // blieb damit GRUEN. Der erwartete Wert wird hier ABSICHTLICH
            // als eigener, woertlich wiederholter Ausdruck ausgewertet (NICHT
            // ueber die Konstante EFFORT von oben referenziert) -- eine
            // zweite, unabhaengige Quelle statt eines Verweises auf dieselbe
            // Variable, damit eine Mutation an EFFORT selbst auffaellt statt
            // sich mit der Zusicherung mitzuaendern.
            const erwarteterEffort = process.env.GEGENLESER_EFFORT || 'xhigh';
            pruefen(`GP4 reasoning.effort GEGEN DEN ERWARTETEN WERT (70) (erwartet "${erwarteterEffort}", tatsaechlich: "${k && k.reasoning && k.reasoning.effort}")`,
                !!k && !!k.reasoning && k.reasoning.effort === erwarteterEffort);
            pruefen(`GP4 metadata EXAKTE Schluesselmenge (71) (werkzeug,zweck,datum: "${k && k.metadata ? Object.keys(k.metadata).sort().join(',') : '(fehlt)'}")`,
                !!k && !!k.metadata && Object.keys(k.metadata).sort().join(',') === 'datum,werkzeug,zweck');
        }

        // ----- GP4-DEEPSEEK (DeepSeek-Anbieterwahl 23.09.2026): derselbe
        // Aufbau wie GP4, aber mit einem "deepseek-*"-Modellnamen -- EIN
        // direkter Aufruf, geprueft wird sowohl der angesteuerte ENDPUNKT
        // als auch reasoning.effort am AUFGEZEICHNETEN Anfragekoerper.
        // Erwartungswert ABSICHTLICH als eigener, woertlich wiederholter
        // Ausdruck (nicht ueber die Konstante referenziert), aus demselben
        // Grund wie bei GP4 oben (N4). -----
        {
            const alterHttpsRequestGp4ds = https.request;
            const aufgezeichnetGp4ds = [];
            const aufgezeichneteUrlsGp4ds = [];
            https.request = httpsStubBauen(
                [antwortKoerperBauen(elementTextBauen('GP4-DEEPSEEK-BERICHT'), 5, 5)],
                aufgezeichnetGp4ds, null, aufgezeichneteUrlsGp4ds);
            try {
                await anfragen('selbsttest-dummy-schluessel-ohne-netz', 'deepseek-v4-pro', [{ role: 'user', content: 'GP-Selbsttest' }]);
            } finally {
                https.request = alterHttpsRequestGp4ds;
            }
            const kDs = aufgezeichnetGp4ds[0];
            const erwarteterEffortDeepseek = process.env.GEGENLESER_EFFORT_DEEPSEEK || 'max';
            pruefen(`GP4-DEEPSEEK ENDPUNKT (anfragen() steuert fuer ein deepseek-Modell den DEEPSEEK-Endpunkt an, NICHT den OpenAI-Endpunkt: "${aufgezeichneteUrlsGp4ds[0]}")`,
                aufgezeichneteUrlsGp4ds.length === 1 && aufgezeichneteUrlsGp4ds[0] === ENDPUNKT_DEEPSEEK);
            pruefen(`GP4-DEEPSEEK reasoning.effort GEGEN DEN ERWARTETEN WERT (erwartet "${erwarteterEffortDeepseek}", tatsaechlich: "${kDs && kDs.reasoning && kDs.reasoning.effort}", zum Vergleich OpenAI-Vorgabe "${process.env.GEGENLESER_EFFORT || 'xhigh'}")`,
                !!kDs && !!kDs.reasoning && kDs.reasoning.effort === erwarteterEffortDeepseek
                && kDs.reasoning.effort !== (process.env.GEGENLESER_EFFORT || 'xhigh'));
        }

        // ----- GP5: der ALTE Stub (ein einzelner JSON-Block statt SSE) muss
        // scheitern -- Beleg, dass die neuen Faelle wirklich den SSE-Weg
        // messen und nicht ueber einen Rueckfallpfad am alten haengen -----
        {
            const alterStilKoerper = JSON.stringify(antwortKoerperBauen(elementTextBauen('ALTER-STIL-TEXT'), 10, 5));
            const { ergebnis: ergGp5, fehler: fehlGp5 } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [alterStilKoerper] })]);
            pruefen(`GP5 ALTER JSON-BLOCK-STUB SCHEITERT (72) (kein SSE-Rahmen wird NICHT mehr akzeptiert: ${fehlGp5 ? 'abgelehnt - ' + fehlGp5.message : 'FAELSCHLICH ANGENOMMEN: ' + JSON.stringify(ergGp5)})`,
                !!fehlGp5 && !ergGp5);
        }

        // ----- GP6: HTTP 400 -- Status wird VOR der SSE-Auswertung geprueft -----
        {
            const fehlerKoerperText = JSON.stringify({ error: { message: 'HTTP-MARKER-4711' } });
            const { fehler: fehlGp6 } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [fehlerKoerperText], statusCode: 400 })]);
            const msgGp6 = fehlGp6 ? fehlGp6.message : '(kein Fehler!)';
            pruefen(`GP6 HTTP 400 VOR SSE-AUSWERTUNG (73) (Meldung enthaelt "HTTP 400" und den Marker, NICHT "Abschluss-Ereignis": "${msgGp6}")`,
                !!fehlGp6 && msgGp6.includes('HTTP 400') && msgGp6.includes('HTTP-MARKER-4711') && !msgGp6.includes('Abschluss-Ereignis'));
        }

        // ----- GP6B (N2, Gegenlesung 19.09.2026): dieselbe Symmetrie wie GP7
        // fuer den NICHT-200-Zweig -- ein "aborted" waehrend einer
        // Fehlerantwort darf nicht ewig haengen (vorher war dort ueberhaupt
        // kein aborted-Listener registriert, der Wachhund unten ist der
        // Beleg, dass hier wirklich nichts mehr haengt). EHRLICHER VERMERK,
        // GEMESSEN wie bei GP7A: isoliert NICHT den aborted-Listener allein
        // -- den aborted-Listener im Nicht-200-Zweig entfernt, GP6B blieb
        // TROTZDEM gruen, weil der error-Listener denselben Fall faengt
        // (die Stub feuert aborted->error->close in Folge). Redundante
        // Verteidigung fuer denselben Transportzustand, kein isoliert
        // pruefbarer Einzelfall je Ereignisname -- wie bei GP7A bleibt der
        // Test bestehen, weil er den REALISTISCHEN Abbruch trotzdem
        // kontrolliert ablehnt, nur ohne Isolationsanspruch. -----
        {
            const fehlerKoerperAbgebrochenText = JSON.stringify({ error: { message: 'GP6B-MARKER-3387' } });
            const alterHttpsRequestGp6b = https.request;
            https.request = httpsStubBauen([sseRohEintragBauen({ chunks: [fehlerKoerperAbgebrochenText], statusCode: 400, abgebrochen: true })], []);
            const ergGp6b = await mitWachhund(anfragen('k', 'gpt-5.6-sol', [{ role: 'user', content: 'x' }]), 1000);
            https.request = alterHttpsRequestGp6b;
            pruefen(`GP6B HTTP 400 + aborted MITTEN IN DER FEHLERANTWORT LEHNT KONTROLLIERT AB, HAENGT NICHT (86) (${ergGp6b.art}${ergGp6b.fehler ? ' - ' + ergGp6b.fehler.message : ''})`,
                ergGp6b.art === 'abgelehnt');
        }

        // ----- Punkt 7/B3: eine data:-Zeile mit UNGUELTIGEM JSON wird NICHT
        // uebersprungen, sondern bricht laut ab -----
        {
            const kaputtesJson = 'data: {"type":"response.completed", KAPUTT\n\n';
            const { ergebnis: ergKaputt, fehler: fehlKaputt } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [kaputtesJson] })]);
            // GEGENGEPRUEFT (19.09.2026): "irgendein Fehler kam" allein war
            // GRUEN aus dem falschen Grund -- ein stilles Ueberspringen der
            // kaputten Zeile laesst den Stream ganz ohne Abschluss-Ereignis
            // enden und loest DIESELBE ablehnende Promise ueber den ANDEREN
            // Pfad (Punkt 9) aus. Erst die Nachricht selbst unterscheidet
            // "erkannt und laut abgebrochen" von "stillschweigend
            // uebersprungen, dann spaeter aus anderem Grund gescheitert".
            pruefen(`PUNKT 7/B3 UNGUELTIGES JSON BRICHT LAUT AB (74) (kein stilles Ueberspringen -- die Meldung nennt den JSON-Fehler selbst, nicht nur "keinen Abschluss": ${fehlKaputt ? fehlKaputt.message : 'FAELSCHLICH ANGENOMMEN: ' + JSON.stringify(ergKaputt)})`,
                !!fehlKaputt && !ergKaputt && fehlKaputt.message.includes('enthaelt kein gueltiges JSON') && fehlKaputt.message.includes('SSE-Datensatz Nr. 1'));
        }

        // ----- B1 (Review-Bot-Befund an PR #45, GEMESSEN 19.09.2026): ein
        // fataler SSE-Abbruch muss die Verbindung zerstoeren, sonst haelt ein
        // offener Socket die Ereignisschleife am Leben und das Werkzeug
        // terminiert nicht (siehe die Messung im Kommentar bei abschliessen()
        // in anfragen()). Kein echter Socket noetig: der Stub zaehlt
        // destroy()-Aufrufe auf der ANFRAGE selbst, kein Netzverkehr im
        // Selbsttest. -----
        {
            const kaputtesJsonB1 = 'data: {"type":"response.completed", KAPUTT-B1\n\n';
            const zerstoerungenB1 = [];
            const { fehler: fehlB1 } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [kaputtesJsonB1] })], zerstoerungenB1);
            pruefen(`B1 FATALER SSE-ABBRUCH ZERSTOERT DIE VERBINDUNG GENAU EINMAL (92) (destroy()-Aufrufe: ${zerstoerungenB1.length}, Fehler: ${fehlB1 ? fehlB1.message : '(keiner!)'})`,
                !!fehlB1 && zerstoerungenB1.length === 1);
        }

        // ----- Punkt 6/B4: der Ereignistyp kommt aus dem type-Feld im JSON,
        // NICHT aus der event:-Zeile -- die event:-Zeile LUEGT hier absichtlich -----
        {
            const luegendesEreignis = `event: response.created\ndata: ${JSON.stringify({ type: 'response.completed', response: antwortKoerperBauen(elementTextBauen('B4-TYP-AUS-JSON'), 2, 2) })}\n\n`;
            const { ergebnis: ergB4, fehler: fehlB4 } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [luegendesEreignis] })]);
            pruefen(`PUNKT 6/B4 EREIGNISTYP AUS DEM JSON, NICHT AUS event: (75) (event:-Zeile behauptet response.created, JSON traegt response.completed -- Parser folgt dem JSON: ${fehlB4 ? fehlB4.message : textAusAusgabe(ergB4.output)})`,
                !fehlB4 && !!ergB4 && textAusAusgabe(ergB4.output) === 'B4-TYP-AUS-JSON');
        }

        // ----- GP7: Strom-Abbruch -- je einzeln kontrolliert ablehnen, mit
        // Wachhund als Beleg, dass nichts haengt; der Normalfall (end dann
        // close) loest GENAU EINMAL auf -----
        {
            const partiellerStrom = 'data: {"type":"response.created"}\n\n';

            const alterHttpsRequestGp7 = https.request;
            // N2 (Gegenlesung 19.09.2026), EHRLICHER VERMERK: seit die Stub
            // bei "abgebrochen" die GEMESSENE Folge aborted->error->close
            // sendet (statt nur "aborted"), isoliert GP7A NICHT mehr den
            // aborted-Listener allein -- GEMESSEN durch Mutation: den
            // aborted-Listener im SSE-Zweig entfernt, GP7A blieb TROTZDEM
            // gruen, weil der jetzt ebenfalls simulierte error-Listener
            // denselben Fall faengt (Einzelheiten im Bericht des
            // Haupt-Agenten, nicht stillschweigend "repariert"). Das ist
            // gewollt: die drei Listener sind redundante Verteidigung fuer
            // DENSELBEN Transportzustand, kein isoliert pruefbarer
            // Einzelfall je Ereignisname. GP7A bleibt bestehen, weil sie den
            // REALISTISCHEN Abbruch waehrend eines laufenden Streams
            // trotzdem kontrolliert ablehnt (nicht haengt) -- nur ihr Name
            // verspricht keine Isolation mehr, die es so nicht gibt.
            https.request = httpsStubBauen([sseRohEintragBauen({ chunks: [partiellerStrom], abgebrochen: true })], []);
            const ergA = await mitWachhund(anfragen('k', 'gpt-5.6-sol', [{ role: 'user', content: 'x' }]), 1000);
            https.request = alterHttpsRequestGp7;
            pruefen(`GP7A PARTIELL + REALISTISCHE ABBRUCHFOLGE (aborted->error->close) LEHNT KONTROLLIERT AB (76) (${ergA.art}${ergA.fehler ? ' - ' + ergA.fehler.message : ''})`,
                ergA.art === 'abgelehnt');

            https.request = httpsStubBauen([sseRohEintragBauen({ chunks: [partiellerStrom], fehler: new Error('Simulierter Streamfehler (Selbsttest)') })], []);
            const ergB = await mitWachhund(anfragen('k', 'gpt-5.6-sol', [{ role: 'user', content: 'x' }]), 1000);
            https.request = alterHttpsRequestGp7;
            pruefen(`GP7B PARTIELL + error AM ANTWORTSTROM LEHNT KONTROLLIERT AB (77) (${ergB.art}${ergB.fehler ? ' - ' + ergB.fehler.message : ''})`,
                ergB.art === 'abgelehnt');

            https.request = httpsStubBauen([sseRohEintragBauen({ chunks: [partiellerStrom], vorzeitigesClose: true })], []);
            const ergC = await mitWachhund(anfragen('k', 'gpt-5.6-sol', [{ role: 'user', content: 'x' }]), 1000);
            https.request = alterHttpsRequestGp7;
            pruefen(`GP7C PARTIELL + close OHNE end LEHNT KONTROLLIERT AB (78) (${ergC.art}${ergC.fehler ? ' - ' + ergC.fehler.message : ''})`,
                ergC.art === 'abgelehnt');

            // Nachtrag zur Pruefung (19.09.2026): process.on('multipleResolves')
            // ist von NODE SELBST als DEPRECATED gekennzeichnet (DEP0160,
            // gemessen auf v22.22.2: eine DeprecationWarning erscheint beim
            // ERSTEN tatsaechlichen Feuern). Es feuert heute noch -- aber
            // entfernt eine kuenftige Node-Version das Ereignis, bleibt der
            // Zaehler in GP7D/GP7E stumm auf 0, und "0" ist dann nicht mehr
            // von "der Riegel wirkt" zu unterscheiden -- dieselbe Klasse
            // Zusicherung, die dieser Beitrag beseitigen soll, nur eine
            // Ebene tiefer. Diese Positivkontrolle belegt VOR GP7D/GP7E, dass
            // der Zaehlmechanismus in DIESER Node-Version lebt: eine
            // Wegwerf-Promise wird absichtlich ZWEIMAL geloest, der Zaehler
            // MUSS genau 1 zeigen. Faellt sie, sind GP7D/GP7E ab sofort
            // wertlos -- das soll LAUT auffallen, nicht still gruen bleiben.
            let mehrfacheAufloesungenPositivkontrolle = 0;
            const mrHandlerPositivkontrolle = () => { mehrfacheAufloesungenPositivkontrolle++; };
            process.on('multipleResolves', mrHandlerPositivkontrolle);
            new Promise((erf, abl) => { erf('x'); abl(new Error('y')); }).catch(() => {});
            await new Promise((r) => setTimeout(r, 10));
            process.off('multipleResolves', mrHandlerPositivkontrolle);
            pruefen(`POSITIVKONTROLLE: process.on('multipleResolves') FEUERT NOCH IN DIESER NODE-VERSION (91) (DEP0160 -- ohne diesen Beleg ist "0 zusaetzliche Settle-Versuche" in GP7D/GP7E mehrdeutig zwischen "Riegel wirkt" und "Ereignis gibt es nicht mehr": Zaehler=${mehrfacheAufloesungenPositivkontrolle})`,
                mehrfacheAufloesungenPositivkontrolle === 1);

            // N1 (Gegenlesung 19.09.2026): der ENDZUSTAND der Promise kann
            // einen von zwei Settle-VERSUCHEN nicht unterscheiden -- eine
            // native Promise schluckt ein zweites reject() nach einem
            // resolve() lautlos, "geloest" saehe in BEIDEN Faellen exakt
            // gleich aus (mit "const abschliessen = (fn) => { fn(); };",
            // Riegel komplett entfernt, GEMESSEN: 99/99, EXIT 0 -- diese
            // Zusicherung konnte nicht fallen). Gezaehlt wird deshalb
            // ZUSAETZLICH ueber process.on('multipleResolves'): dieses
            // Node-Ereignis feuert NUR, wenn ein echter zweiter
            // resolve/reject-Aufruf beim NATIVEN Promise ankommt -- der
            // Riegel (fertig-Flag) verhindert genau das, ohne das Ereignis
            // selbst abzuschalten (GEGENGEPRUEFT: mit Riegel bleibt der
            // Zaehler 0, ohne Riegel wird er >0 und diese Zusicherung faellt
            // -- Einzelheiten im Bericht des Haupt-Agenten).
            let mehrfacheAufloesungenD = 0;
            const mrHandlerD = () => { mehrfacheAufloesungenD++; };
            process.on('multipleResolves', mrHandlerD);
            https.request = httpsStubBauen([antwortKoerperBauen(elementTextBauen('GP7-NORMAL-END-CLOSE'), 5, 5)], []);
            const ergD = await mitWachhund(anfragen('k', 'gpt-5.6-sol', [{ role: 'user', content: 'x' }]), 1000);
            https.request = alterHttpsRequestGp7;
            process.off('multipleResolves', mrHandlerD);
            pruefen(`GP7 NORMALER end-DANN-close LOEST GENAU EINMAL AUF, GEZAEHLT UEBER SETTLE-VERSUCHE (79) (${ergD.art}, Text: ${ergD.wert ? textAusAusgabe(ergD.wert.output) : '-'}, zusaetzliche Settle-Versuche: ${mehrfacheAufloesungenD})`,
                ergD.art === 'geloest' && textAusAusgabe(ergD.wert.output) === 'GP7-NORMAL-END-CLOSE' && mehrfacheAufloesungenD === 0);

            // N1, zweite Haelfte: anfrage.on('error', ...) (ANFRAGE-, nicht
            // Antwort-Ebene) lief bisher VOLLSTAENDIG am Riegel vorbei, weil
            // fertig/abschliessen nur im response-Callback existierten. Nach
            // einem regulaeren Abschluss wird hier zusaetzlich ein
            // Anfrage-Fehler ausgeloest -- das darf GENAU EINEN wirksamen
            // Settle-Versuch ergeben (den bereits erfolgten), keinen
            // zweiten.
            let mehrfacheAufloesungenE = 0;
            const mrHandlerE = () => { mehrfacheAufloesungenE++; };
            process.on('multipleResolves', mrHandlerE);
            https.request = httpsStubBauen([{
                ...antwortKoerperBauen(elementTextBauen('GP7E-END-DANN-ANFRAGEFEHLER'), 5, 5),
                __anfrageFehlerNachAbschluss: true,
            }], []);
            const ergE = await mitWachhund(anfragen('k', 'gpt-5.6-sol', [{ role: 'user', content: 'x' }]), 1000);
            https.request = alterHttpsRequestGp7;
            process.off('multipleResolves', mrHandlerE);
            pruefen(`GP7E END, DANN ANFRAGE-FEHLER: NUR EIN WIRKSAMER SETTLE-VERSUCH (87) (${ergE.art}, Text: ${ergE.wert ? textAusAusgabe(ergE.wert.output) : '-'}, zusaetzliche Settle-Versuche: ${mehrfacheAufloesungenE})`,
                ergE.art === 'geloest' && textAusAusgabe(ergE.wert.output) === 'GP7E-END-DANN-ANFRAGEFEHLER' && mehrfacheAufloesungenE === 0);
        }

        // ----- GP8: Mehrereignis-Strom -- zurueckgegeben wird AUSSCHLIESSLICH
        // das response-Feld des ABSCHLUSSES, nicht eines der vorherigen
        // Ereignisse (response.created/Delta gehen jedem Standardfall voraus,
        // s. sseStandardStromBauen) -----
        {
            const { ergebnis: ergGp8, fehler: fehlGp8 } = await anfragenIsoliertPruefen([antwortKoerperBauen(elementTextBauen('GP8-NUR-ABSCHLUSS'), 7, 3)]);
            pruefen(`GP8 MEHREREIGNIS-STROM: NUR DAS ABSCHLUSS-response (80) (status=${ergGp8 && ergGp8.status}, Text: ${ergGp8 ? textAusAusgabe(ergGp8.output) : fehlGp8 && fehlGp8.message})`,
                !fehlGp8 && !!ergGp8 && ergGp8.status === 'completed' && textAusAusgabe(ergGp8.output) === 'GP8-NUR-ABSCHLUSS');
        }

        // ----- GP9: ZWEITES Abschluss-Ereignis lehnt ab -- completed mit
        // Bericht, dann failed, dann end -----
        {
            const ereignisCompleted = `event: response.completed\ndata: ${JSON.stringify({ type: 'response.completed', response: antwortKoerperBauen(elementTextBauen('GP9-SOLLTE-NIE-ANKOMMEN'), 5, 5) })}\n\n`;
            const ereignisFailed = `event: response.failed\ndata: ${JSON.stringify({ type: 'response.failed', response: antwortKoerperFehlgeschlagenBauen({ code: 'x', message: 'y' }, 5, 5) })}\n\n`;
            const { ergebnis: ergGp9, fehler: fehlGp9 } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [ereignisCompleted, ereignisFailed] })]);
            pruefen(`GP9 ZWEITES ABSCHLUSS-EREIGNIS LEHNT AB (81) (completed gefolgt von failed: ${fehlGp9 ? fehlGp9.message : 'FAELSCHLICH ANGENOMMEN'})`,
                !!fehlGp9 && !ergGp9 && fehlGp9.message.includes('ZWEITES Abschluss-Ereignis'));
        }

        // ----- N6 (Gegenlesung 19.09.2026): NACH dem Abschluss wird JEDE
        // weitere data:-Nutzlast abgelehnt, nicht nur ein zweites
        // Abschluss-Ereignis (das deckt GP9 oben bereits ab). Vorher
        // aktualisierte ein gewoehnliches Ereignis danach (z. B. ein
        // response.output_text.delta) nur stillschweigend letzterEreignisTyp
        // und verschwand sonst spurlos -- eine beschaedigte Reihenfolge
        // wurde still normalisiert. Positivkontrolle direkt daneben: reine
        // Leerzeilen NACH dem Abschluss (wie sie jeder echte Strom als
        // Keepalive senden kann) duerfen weiterhin nichts stoeren. -----
        {
            const abschlussDannDelta = `data: ${JSON.stringify({ type: 'response.completed', response: antwortKoerperBauen(elementTextBauen('N6-SOLLTE-NIE-ANKOMMEN'), 5, 5) })}\n\n`
                + `data: ${JSON.stringify({ type: 'response.output_text.delta', delta: 'N6-GEWOEHNLICHES-EREIGNIS-NACH-ABSCHLUSS' })}\n\n`;
            const { ergebnis: ergN6, fehler: fehlN6 } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [abschlussDannDelta] })]);
            pruefen(`N6 GEWOEHNLICHES EREIGNIS NACH DEM ABSCHLUSS LEHNT AB (88) (completed gefolgt von einem delta: ${fehlN6 ? fehlN6.message : 'FAELSCHLICH ANGENOMMEN'})`,
                !!fehlN6 && !ergN6 && fehlN6.message.includes('NACH dem Abschluss-Ereignis') && fehlN6.message.includes('response.output_text.delta'));

            const abschlussDannLeerzeilen = `data: ${JSON.stringify({ type: 'response.completed', response: antwortKoerperBauen(elementTextBauen('N6-POSITIVKONTROLLE-LEERZEILEN'), 5, 5) })}\n\n\n`;
            const { ergebnis: ergN6b, fehler: fehlN6b } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [abschlussDannLeerzeilen] })]);
            pruefen(`N6 POSITIVKONTROLLE: NUR LEERZEILEN NACH DEM ABSCHLUSS STOEREN NICHT (89) (${fehlN6b ? 'ABGELEHNT: ' + fehlN6b.message : textAusAusgabe(ergN6b.output)})`,
                !fehlN6b && !!ergN6b && textAusAusgabe(ergN6b.output) === 'N6-POSITIVKONTROLLE-LEERZEILEN');
        }

        // ----- Ergaenzend zu Punkt 12/B6: ein sauber EINZELNES response.failed
        // wird ueber die Statuspruefung abgelehnt, response.error steht in
        // der Meldung; ein Ereignis vom Typ error (kein response.*) ist
        // sofort fatal, unabhaengig von Abschluss-Ereignissen -----
        {
            const koerperFailed = antwortKoerperFehlgeschlagenBauen({ code: 'server_error', message: 'GP-FAILED-MARKER-9931' }, 3, 1);
            const { fehler: fehlFailed } = await anfragenIsoliertPruefen([koerperFailed]);
            pruefen(`GP-FAILED STATUS UEBER DIE STATUSPRUEFUNG (82) (${fehlFailed ? fehlFailed.message : '(kein Fehler!)'})`,
                !!fehlFailed && fehlFailed.gegenleserStatus === 'failed' && fehlFailed.message.includes('GP-FAILED-MARKER-9931'));
        }
        {
            const ereignisErrorRoh = `data: ${JSON.stringify({ type: 'error', code: 'rate_limit', message: 'GP-ERROR-EVENT-MARKER-5521' })}\n\n`;
            const { ergebnis: ergErr, fehler: fehlErr } = await anfragenIsoliertPruefen([sseRohEintragBauen({ chunks: [ereignisErrorRoh] })]);
            pruefen(`GP-ERROR-EREIGNIS SOFORT FATAL (83) (${fehlErr ? fehlErr.message : 'FAELSCHLICH ANGENOMMEN'})`,
                !!fehlErr && !ergErr && fehlErr.message.includes('rate_limit') && fehlErr.message.includes('GP-ERROR-EVENT-MARKER-5521'));
        }

        // ----- GP10: metadata-Datengrenze -- weder --zweck noch der
        // Briefdateiname duerfen in metadata auftauchen. N5 (Gegenlesung
        // 19.09.2026) erweitert das: die bisherige Fassung suchte NUR nach
        // --zweck und dem Brief-DATEINAMEN. Eine einzeilige
        // Produktionsmutation ("metadata: { ...metadatenBauen(), zweck:
        // verlauf[0].content.slice(0, 500) }") kopiert Auftrag und Diff in
        // die Metadaten und waere GRUEN geblieben, weil weder Brief-INHALT
        // noch Diff-Material einen eigenen Marker trugen. Beide bekommen
        // jetzt einen. -----
        {
            const briefAuffaelligPfad = path.join(klon, 'GEHEIM-BRIEFNAME-nicht-in-metadata.txt');
            fs.writeFileSync(briefAuffaelligPfad, 'Selbsttest-Auftrag GP10 -- GEHEIM-BRIEFINHALT-MARKE-7734 -- nur die Mechanik pruefen.\n');
            // Eigene Diff-Fixtur statt der geteilten harmlos.txt -- die wird
            // von etlichen anderen Faellen mit fixem Inhalt ("Zeile A/B/C")
            // vorausgesetzt, ein eigener Marker gehoert in eine eigene Datei.
            const diffAuffaelligPfad = path.join(klon, 'GEHEIM-DIFFINHALT-nicht-in-metadata.txt');
            fs.writeFileSync(diffAuffaelligPfad, 'GEHEIM-DIFFINHALT-MARKE-2915 -- Selbsttest-Diff, nur fuer GP10.\n');
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const aufgezeichnetGp10 = [];
            https.request = httpsStubBauen([antwortKoerperBauen(elementTextBauen('GP10-BERICHT'), 5, 5)], aufgezeichnetGp10);
            let codeGp10;
            try {
                codeGp10 = await main([
                    diffAuffaelligPfad,
                    `--brief=${briefAuffaelligPfad}`,
                    `--wurzel=${klon}`,
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-gp10.jsonl')}`,
                    '--zweck=GEHEIM-PFAD-routes/x.js',
                ]);
            } finally {
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            const metadataJson = JSON.stringify(aufgezeichnetGp10.map((k) => k.metadata));
            pruefen(`GP10 METADATA-DATENGRENZE: WEDER --zweck NOCH BRIEFNAME/-INHALT NOCH DIFF-INHALT (84) (${metadataJson})`,
                codeGp10 === 0 && aufgezeichnetGp10.length >= 1
                && !metadataJson.includes('GEHEIM-PFAD') && !metadataJson.includes('routes/x.js')
                && !metadataJson.includes('GEHEIM-BRIEFNAME') && !metadataJson.includes('nicht-in-metadata')
                && !metadataJson.includes('GEHEIM-BRIEFINHALT-MARKE-7734')
                && !metadataJson.includes('GEHEIM-DIFFINHALT-MARKE-2915'));

            // N5, zweite Haelfte: die Metadaten-WERTE woertlich pruefen,
            // nicht nur die Schluesselmenge. Die obige Mutation behaelt die
            // Schluesselmenge EXAKT bei (sie ersetzt nur den Wert von
            // "zweck" NACH dem Spread von metadatenBauen()) -- GP4s
            // Schluesselmengen-Pruefung saehe sie deshalb nicht. Erst der
            // woertliche Wertevergleich faellt auf den falschen WERT.
            const metadataGp10 = aufgezeichnetGp10[0] && aufgezeichnetGp10[0].metadata;
            pruefen(`GP10 METADATA-WERTE WOERTLICH GEPRUEFT, NICHT NUR DIE SCHLUESSELMENGE (90) (werkzeug="${metadataGp10 && metadataGp10.werkzeug}", zweck="${metadataGp10 && metadataGp10.zweck}", datum="${metadataGp10 && metadataGp10.datum}")`,
                !!metadataGp10
                && metadataGp10.werkzeug === 'gegenleser-repo.js'
                && metadataGp10.zweck === 'stufe-2-diff-gegenlesung'
                && /^\d{4}-\d{2}-\d{2}$/.test(metadataGp10.datum));
        }

        // ----- B8 Ende-zu-Ende: ueber main() darf der Verbrauch aus einem
        // Status-Abbruch NICHT verloren gehen -- die Konsolenzusammenfassung
        // muss die echten Zahlen zeigen, nicht "Token rein: 0" (Punkt 13) -----
        {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;
            const chronoB8 = [];
            console.log = (m) => chronoB8.push(String(m));
            console.error = (m) => chronoB8.push(String(m));
            https.request = httpsStubBauen([antwortKoerperUnvollstaendigBauen('max_output_tokens', 1234, 5678)], []);
            let geworfenB8 = null;
            try {
                await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-b8.jsonl')}`,
                ]);
            } catch (e) {
                geworfenB8 = e;
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            pruefen(`B8 TOKEN NICHT VERLOREN BEI STATUS-ABBRUCH (85) (Zusammenfassung zeigt die echten Zahlen statt 0/0, obwohl anfragen() geworfen hat: "${geworfenB8 ? geworfenB8.message : '(kein Fehler!)'}")`,
                !!geworfenB8 && chronoB8.some((z) => z.includes('Token rein: 1234') && z.includes('Token raus: 5678')));
        }

        // ===== LAUF-PROTOKOLL (TEIL D): die acht Faelle aus dem Auftrag =====
        // Jeder Fall misst am INHALT der Wegwerfdatei danach, nicht am
        // Rueckgabewert einer Hilfsfunktion. Die Fixture bildet die echte
        // ASTRA-LAEUFE.md strukturell nach: zwei Tabellen, die Marke
        // dazwischen als mehrzeiliger Kommentar (woertlich wie im echten
        // Kopf von ASTRA-LAEUFE.md), damit "unmittelbar darueber" auch bei
        // der ECHTEN mehrzeiligen Marke gemessen wird, nicht bei einer
        // vereinfachten einzeiligen Attrappe.
        const protokollFixtureInhalt = [
            '# Astra-Laeufe (Testfixture, KEINE echte Datei)',
            '',
            '| Datum | Zweck | Material | Befunde | getragen | gefallen | Kosten |',
            '|---|---|---|---|---|---|---|',
            '| 01.01.2020 | Bestandszeile, darf nicht angefasst werden | 1 Datei | 1 | 1 | 0 | 0,10 $ |',
            // Punkt E (Nacharbeit 13.09.2026): WOERTLICHES Literal, NICHT
            // die Konstante LAUFPROTOKOLL_MARKE -- sonst aendern sich
            // Fixture, gesuchte Position UND erwarteter Fehlertext (FALL 3
            // unten) gemeinsam mit der Konstante mit, und der Selbsttest
            // bliebe gruen, waehrend echte Laeufe nichts mehr eintragen.
            '<!-- NEUE-LAUFZEILE-HIER: tools/gegenleser-repo.js traegt jede neue Zeile',
            '     UNMITTELBAR UEBER dieser Marke ein. Sie darf nicht entfernt oder',
            '     verschoben werden; fehlt sie, meldet das Werkzeug das LAUT und bricht',
            '     nicht still ab. Grund fuer die Marke: diese Datei hat ZWEI Tabellen, und',
            '     ohne sie landete die Zeile in der falschen. -->',
            '',
            '## Woher die Befunde kamen (Testfixture, zweite Tabelle)',
            '',
            '| Befund | Erreichbar ueber | Wert |',
            '|---|---|---|',
            '| X | Y | Z |',
            '',
        ].join('\n');
        // Dieselbe Fixture, aber OHNE die Marke -- fuer FALL 3.
        const protokollFixtureOhneMarke = [
            '# Astra-Laeufe (Testfixture, KEINE echte Datei, MARKE FEHLT ABSICHTLICH)',
            '',
            '| Datum | Zweck | Material | Befunde | getragen | gefallen | Kosten |',
            '|---|---|---|---|---|---|---|',
            '| 01.01.2020 | Bestandszeile, darf nicht angefasst werden | 1 Datei | 1 | 1 | 0 | 0,10 $ |',
            '',
            '## Woher die Befunde kamen (Testfixture, zweite Tabelle)',
            '',
            '| Befund | Erreichbar ueber | Wert |',
            '|---|---|---|',
            '| X | Y | Z |',
            '',
        ].join('\n');
        // Die Zeile UNMITTELBAR ueber der (mehrzeiligen) Marke -- exakt das,
        // was laufprotokollEinfuegen() als Einfuegepunkt benutzt, hier aber
        // unabhaengig ueber split('\n') statt ueber String-Indizes gefunden.
        const zeileUnmittelbarUeberMarke = (inhalt) => {
            const zeilen = inhalt.split('\n');
            const markeIdx = zeilen.findIndex((z) => z.includes(LAUFPROTOKOLL_MARKE));
            return markeIdx > 0 ? zeilen[markeIdx - 1] : null;
        };
        // Gemeinsamer Traeger fuer FALL 1/3/4/7/8: EIN Sofort-Text ohne
        // Werkzeugaufruf (wie LAUF B), IMMER mit 1.500.000 Eingabe- und
        // 300.000 Ausgabe-Token und Modell gpt-6-astra -- fest und
        // dokumentiert, damit die Faelle unten woertliche Erwartungswerte
        // benutzen koennen, statt sich auf kostenSchaetzen() zu verlassen,
        // um sich selbst zu pruefen.
        const protokolliertenLaufAusfuehren = async (protokollPfadWert, extraArgs) => {
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            const alteProtokollUmgebungLokal = process.env.ASTRA_LAUFPROTOKOLL;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            if (protokollPfadWert === undefined) delete process.env.ASTRA_LAUFPROTOKOLL;
            else process.env.ASTRA_LAUFPROTOKOLL = protokollPfadWert;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;
            const chronologisch = [];
            const aufgezeichnet = [];
            https.request = httpsStubBauen(
                [antwortKoerperBauen(elementTextBauen('TESTBERICHT-LAUF-PROTOKOLL'), 1_500_000, 300_000)],
                aufgezeichnet,
            );
            console.log = (m) => chronologisch.push(String(m));
            console.error = (m) => chronologisch.push(String(m));
            let code;
            try {
                code = await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-6-astra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, `selbsttest-protokoll-lp-${chronologisch.length}-${Math.random().toString(36).slice(2)}.jsonl`)}`,
                    ...(extraArgs || []),
                ]);
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
                if (alteProtokollUmgebungLokal !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungLokal;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
            }
            return { code, chronologisch, aufgezeichnet };
        };
        // Unabhaengig von Node/Intl ermitteltes heutiges Datum (Europe/Berlin)
        // ueber das System-Kommando "date" -- eine Zusicherung, die ihr
        // Soll aus derselben Intl-Formel bezieht, die sie pruefen soll,
        // koennte einen systematischen Fehler in dieser Formel nie finden.
        const datumUeberSystemBefehl = execFileSync('date', ['+%d.%m.%Y'], { env: { ...process.env, TZ: 'Europe/Berlin' } })
            .toString().trim();

        // ----- FALL 1+2: normaler Lauf, GENAU EINE Zeile, Spalten korrekt,
        // die zweite Tabelle bleibt bytegleich -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall1.md');
            fs.writeFileSync(protokollPfad, protokollFixtureInhalt);

            const { code: code1 } = await protokolliertenLaufAusfuehren(protokollPfad, []);

            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            const zusatzZeilen = inhaltNachher.split('\n').length - protokollFixtureInhalt.split('\n').length;
            const neueZeile = zeileUnmittelbarUeberMarke(inhaltNachher);
            const erwarteterZweck = path.basename(briefFixturePfad, path.extname(briefFixturePfad));
            // Woertlicher Erwartungswert (gpt-6-astra: 12,50 $/Mio rein,
            // 75,00 $/Mio raus): 1,5 * 12,50 = 18,75; 0,3 * 75,00 = 22,50;
            // Summe 41,25 $ -- NICHT aus kostenSchaetzen() zurueckgerechnet.
            const zeileVollstaendigErwartet = `| ${datumUeberSystemBefehl} | ${erwarteterZweck} `
                + '| Diff 3 Zeilen, Suchen 0, Lesungen 0, Token rein 1500000, Token raus 300000, Runden 1 '
                + '| — | — | — | 41,25 $ |';

            pruefen(`LAUF-PROTOKOLL FALL 1 (36) (normaler Lauf endet mit Exit ${code1} und traegt GENAU EINE neue Zeile unmittelbar ueber der (mehrzeiligen) Marke ein, ${zusatzZeilen} zusaetzliche Zeile(n), Bestandszeile bleibt erhalten)`,
                code1 === 0 && zusatzZeilen === 1 && inhaltNachher.includes('Bestandszeile, darf nicht angefasst werden'));

            pruefen(`LAUF-PROTOKOLL FALL 1 SPALTEN (37) (die neue Zeile stimmt WOERTLICH -- Datum unabhaengig ueber "date" ermittelt, Zweck ist der Basisname der Brief-Datei (kein --zweck gesetzt), Befunde/getragen/gefallen sind "—", Kosten "41,25 $": "${neueZeile}")`,
                neueZeile === zeileVollstaendigErwartet);
        }

        // ----- FALL 2 ist Teil von FALL 1 oben (dieselbe geschriebene Datei):
        // die zweite Tabelle bleibt dabei bytegleich -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall1.md'); // von FALL 1 oben bereits beschrieben
            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            pruefen('LAUF-PROTOKOLL FALL 2 (38) (die zweite Tabelle "Woher die Befunde kamen" bleibt beim Eintragen BYTEGLEICH unveraendert)',
                inhaltNachher.slice(inhaltNachher.indexOf('-->')) === protokollFixtureInhalt.slice(protokollFixtureInhalt.indexOf('-->')));
        }

        // ----- FALL 3: Marke fehlt -- laut, nichts angehaengt, Exit unveraendert -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall3-ohne-marke.md');
            fs.writeFileSync(protokollPfad, protokollFixtureOhneMarke);

            const { code: code3, chronologisch: chrono3 } = await protokolliertenLaufAusfuehren(protokollPfad, []);

            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            pruefen(`LAUF-PROTOKOLL FALL 3 (39) (fehlende Marke: der Lauf endet trotzdem mit dem UNVERAENDERTEN Exit ${code3}, die Protokolldatei bleibt BYTEGLEICH -- keine Zeile irgendwo angehaengt)`,
                code3 === 0 && inhaltNachher === protokollFixtureOhneMarke);
            pruefen(`LAUF-PROTOKOLL FALL 3 MELDUNG (40) (der Fehlschlag wird LAUT UND GENAU ZWEIMAL gemeldet, die zweite -- unverwechselbar gekennzeichnete -- Meldung ist die ALLERLETZTE Zeile der GESAMTEN Ausgabe)`,
                chrono3.filter((z) => z.includes('konnte NICHT eingetragen werden')).length === 1
                // Punkt E: woertliches Literal statt der Konstante -- s.
                // Kommentar bei protokollFixtureInhalt oben.
                && chrono3.some((z) => z.includes('Marke "<!-- NEUE-LAUFZEILE-HIER:" fehlt'))
                && chrono3[chrono3.length - 1].startsWith('LETZTE ZEILE -- PROTOKOLLEINTRAG FEHLGESCHLAGEN'));
        }

        // ----- FALL 4: Datei fehlt -- laut, nichts angelegt, Exit unveraendert -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall4-existiert-nicht.md'); // wird NIE angelegt

            const { code: code4, chronologisch: chrono4 } = await protokolliertenLaufAusfuehren(protokollPfad, []);

            const dateiEntstanden = fs.existsSync(protokollPfad);
            pruefen(`LAUF-PROTOKOLL FALL 4 (41) (fehlende Protokolldatei: der Lauf endet trotzdem mit dem UNVERAENDERTEN Exit ${code4}, es wird KEINE Datei angelegt)`,
                code4 === 0 && dateiEntstanden === false);
            pruefen(`LAUF-PROTOKOLL FALL 4 MELDUNG (42) (der Fehlschlag wird LAUT UND GENAU ZWEIMAL gemeldet, die zweite -- unverwechselbar gekennzeichnete -- Meldung ist die ALLERLETZTE Zeile der GESAMTEN Ausgabe)`,
                chrono4.filter((z) => z.includes('konnte NICHT eingetragen werden')).length === 1
                && chrono4.some((z) => z.includes('nicht lesbar'))
                && chrono4[chrono4.length - 1].startsWith('LETZTE ZEILE -- PROTOKOLLEINTRAG FEHLGESCHLAGEN'));
        }

        // ----- FALL 5: Abbruch ueber den Geheimnis-Riegel (auf dem
        // Eingabediff) traegt trotzdem eine Zeile mit Strichen ein -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall5.md');
            fs.writeFileSync(protokollPfad, protokollFixtureInhalt);

            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            const alteProtokollUmgebungLokal = process.env.ASTRA_LAUFPROTOKOLL;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            process.env.ASTRA_LAUFPROTOKOLL = protokollPfad;
            const echtesHttpsRequest = https.request;
            const aufgezeichnetF5 = [];
            https.request = httpsStubBauen([], aufgezeichnetF5); // leere Warteschlange: es darf NIE gesendet werden
            let code5;
            try {
                code5 = await main([
                    diffMitGeheimnisPfad,
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-6-astra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-fall5.jsonl')}`,
                ]);
            } finally {
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
                if (alteProtokollUmgebungLokal !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungLokal;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
            }
            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            const neueZeileF5 = zeileUnmittelbarUeberMarke(inhaltNachher);
            pruefen(`LAUF-PROTOKOLL FALL 5 (43) (Abbruch ueber den Geheimnis-Riegel auf dem Eingabediff: Exit ${code5} bleibt UNVERAENDERT bei 3, es wurde weiterhin NICHTS gesendet, ${aufgezeichnetF5.length} Anfragen)`,
                code5 === 3 && aufgezeichnetF5.length === 0);
            pruefen(`LAUF-PROTOKOLL FALL 5 ZEILE (44) (trotzdem wird EINE Zeile eingetragen: Befunde/getragen/gefallen sind "—", "**abgebrochen**" und die Kosten (0,00 $, da nichts gesendet wurde) stehen drin: "${neueZeileF5}")`,
                typeof neueZeileF5 === 'string'
                && neueZeileF5.includes('**abgebrochen**')
                && neueZeileF5.includes('Geheimnis-Riegel')
                && neueZeileF5.includes('| — | — | — |')
                && neueZeileF5.includes('| 0,00 $ |'));
        }

        // ----- FALL 7: Zweck enthaelt ein "|" -- wird maskiert, Tabelle
        // bleibt bei genau 7 echten Spalten -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall7.md');
            fs.writeFileSync(protokollPfad, protokollFixtureInhalt);

            const { code: code7 } = await protokolliertenLaufAusfuehren(protokollPfad, ['--zweck=Testzweck mit | Pipe-Zeichen']);

            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            const neueZeileF7 = zeileUnmittelbarUeberMarke(inhaltNachher);
            // Nur UNESCAPTE "|" trennen echte Spalten (negativer Lookbehind
            // auf Backslash) -- so bleibt die Tabelle trotz des Pipe-
            // Zeichens im Zweck bei genau 7 Spalten (8 Trennzeichen minus
            // die beiden aeusseren Rand-Elemente).
            const echteSpalten = typeof neueZeileF7 === 'string'
                ? neueZeileF7.split(/(?<!\\)\|/).slice(1, -1)
                : [];
            pruefen(`LAUF-PROTOKOLL FALL 7 (45) (Zweck enthaelt ein "|": es kommt MASKIERT ("\\|") in die Zeile, die Tabelle bleibt bei genau 7 echten Spalten (nur unescapte "|" gezaehlt): "${neueZeileF7}")`,
                code7 === 0 && typeof neueZeileF7 === 'string'
                && neueZeileF7.includes('Testzweck mit \\| Pipe-Zeichen')
                && echteSpalten.length === 7);
        }

        // ----- FALL 8: Positivkontrolle -- ohne Lauf keine Zeile, der
        // Schreibpfad laeuft nicht ungefragt -----
        {
            const protokollPfad = path.join(klon, 'protokoll-fall8.md');
            fs.writeFileSync(protokollPfad, protokollFixtureInhalt);
            const alteProtokollUmgebungLokal = process.env.ASTRA_LAUFPROTOKOLL;
            process.env.ASTRA_LAUFPROTOKOLL = protokollPfad;
            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            delete process.env.OPENAI_API_KEY;
            delete process.env.OPENAI_KEY_DATEI;
            let code8;
            try {
                // KEIN --brief -> Exit 6, "gar kein Lauf fand statt" (TEIL D).
                code8 = await main([path.join(klon, 'harmlos.txt'), `--wurzel=${klon}`]);
            } finally {
                if (alteProtokollUmgebungLokal !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungLokal;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
            }
            const inhaltNachher = fs.readFileSync(protokollPfad, 'utf8');
            pruefen(`LAUF-PROTOKOLL FALL 8 (46) (POSITIVKONTROLLE: ein Aufruf ohne --brief bricht mit Exit ${code8} ab, BEVOR ueberhaupt ein Lauf stattfand -- die Protokolldatei bleibt BYTEGLEICH unveraendert, der Schreibpfad laeuft nicht ungefragt)`,
                code8 === 6 && inhaltNachher === protokollFixtureInhalt);
        }

        // ===== NACHARBEIT 13.09.2026 (GEGENLESUNG VON TEIL D): PUNKTE A-F =====

        // ----- PUNKT A: Sicherheitsnetz greift bei einem Fehler NACH
        // Modellkontakt (main() wirft nach main().catch(...) mit Exit 1) --
        // der bereits bezahlte Verbrauch aus Runde 1 darf dabei NICHT
        // spurlos verschwinden. Runde 1 liefert einen Werkzeugaufruf (also
        // gibt es ueberhaupt eine Runde 2), fuer Runde 2 ist die
        // Warteschlange leer -- der https-Stub wirft dort SYNCHRON, die
        // Promise von anfragen() lehnt ab, main() wirft weiter (siehe
        // main(), "throw e" im catch um anfragen()). -----
        {
            const protokollPfadA = path.join(klon, 'protokoll-punkt-a.md');
            fs.writeFileSync(protokollPfadA, protokollFixtureInhalt);

            const alterKey = process.env.OPENAI_API_KEY;
            const alteDatei = process.env.OPENAI_KEY_DATEI;
            const alteProtokollUmgebungLokal = process.env.ASTRA_LAUFPROTOKOLL;
            process.env.OPENAI_API_KEY = 'selbsttest-dummy-schluessel-ohne-netz';
            delete process.env.OPENAI_KEY_DATEI;
            process.env.ASTRA_LAUFPROTOKOLL = protokollPfadA;
            const echtesHttpsRequest = https.request;
            const echtesLog = console.log;
            const echtesError = console.error;
            const chronoA2 = [];
            console.log = (m) => chronoA2.push(String(m));
            console.error = (m) => chronoA2.push(String(m));
            const aufgezeichnetA2 = [];
            https.request = httpsStubBauen(
                [antwortKoerperBauen(elementFunktionsaufrufBauen('call-punkt-a-1', 'suche', { muster: 'Zeile' }), 1000, 200)],
                aufgezeichnetA2,
            );
            let geworfenerFehlerA2 = null;
            try {
                await main([
                    path.join(klon, 'harmlos.txt'),
                    `--brief=${briefFixturePfad}`,
                    `--wurzel=${klon}`,
                    '--modell=gpt-6-astra',
                    '--max-runden=10',
                    `--protokoll=${path.join(klon, 'selbsttest-protokoll-punkt-a.jsonl')}`,
                ]);
            } catch (e) {
                geworfenerFehlerA2 = e;
            } finally {
                console.log = echtesLog;
                console.error = echtesError;
                https.request = echtesHttpsRequest;
                if (alterKey !== undefined) process.env.OPENAI_API_KEY = alterKey; else delete process.env.OPENAI_API_KEY;
                if (alteDatei !== undefined) process.env.OPENAI_KEY_DATEI = alteDatei;
                if (alteProtokollUmgebungLokal !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungLokal;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
            }

            const inhaltNachherA2 = fs.readFileSync(protokollPfadA, 'utf8');
            const zusatzZeilenA2 = inhaltNachherA2.split('\n').length - protokollFixtureInhalt.split('\n').length;
            const neueZeileA2 = zeileUnmittelbarUeberMarke(inhaltNachherA2);
            pruefen(`PUNKT A SICHERHEITSNETZ (48) (main() wirft nach Modellkontakt in Runde 2 -- geworfener Fehler: "${geworfenerFehlerA2 ? geworfenerFehlerA2.message : '(keiner geworfen!)'}" -- traegt trotzdem GENAU EINE Zeile ein, mit Abbruchgrund und "mind. " vor den Kosten: "${neueZeileA2}")`,
                geworfenerFehlerA2 !== null
                && zusatzZeilenA2 === 1
                && typeof neueZeileA2 === 'string'
                && neueZeileA2.includes('**abgebrochen** (unerwarteter Fehler nach Modellkontakt (Exit 1))')
                && /\| mind\. \d+,\d\d \$ \|$/.test(neueZeileA2));
        }

        // ----- PUNKT B1: ATOMARER AUSTAUSCH -- ein gescheitertes Schreiben
        // der Wegwerfdatei darf die Zieldatei NICHT anfassen. Simuliert
        // durch einen fs.writeFileSync-Stub, der NUR beim Schreiben der
        // Wegwerfdatei (".tmp-<pid>") wirft; die Zieldatei wird nur ueber
        // fs.renameSync erreicht, das dieser Stub nicht anfasst. -----
        {
            const protokollPfadB1 = path.join(klon, 'protokoll-punkt-b1.md');
            fs.writeFileSync(protokollPfadB1, protokollFixtureInhalt);
            const vorherB1 = fs.readFileSync(protokollPfadB1, 'utf8');

            const echtesWriteFileSync = fs.writeFileSync;
            let tmpDateiGesehen = false;
            fs.writeFileSync = function (pfad, ...rest) {
                if (typeof pfad === 'string' && pfad.includes('.tmp-')) {
                    tmpDateiGesehen = true;
                    throw new Error('Simulierte volle Platte (Selbsttest)');
                }
                return echtesWriteFileSync.call(fs, pfad, ...rest);
            };
            let ergebnisB1;
            try {
                ergebnisB1 = laufprotokollEinfuegen(protokollPfadB1, '| Zeile, die NICHT ankommen darf (b1) |');
            } finally {
                fs.writeFileSync = echtesWriteFileSync;
            }
            const nachherB1 = fs.readFileSync(protokollPfadB1, 'utf8');
            const tmpUebrigB1 = fs.existsSync(`${protokollPfadB1}.tmp-${process.pid}`);
            pruefen(`PUNKT B1 ATOMAR (49) (ein gescheitertes Schreiben der Wegwerfdatei laesst die Zieldatei UNANGETASTET (byte-gleich), meldet {ok:false}, keine Wegwerfdatei bleibt liegen: ok=${ergebnisB1.ok}, Wegwerfdatei tatsaechlich angefasst=${tmpDateiGesehen}, Wegwerfdatei uebrig=${tmpUebrigB1})`,
                ergebnisB1.ok === false && tmpDateiGesehen === true && tmpUebrigB1 === false && nachherB1 === vorherB1);
        }

        // ----- PUNKT B2: SPERRE ueber den gesamten Lese-Aendere-Schreibe-
        // Vorgang -- eine VORHANDENE, FRISCHE Sperrdatei blockiert (liefert
        // {ok:false}, OHNE die Zieldatei anzufassen); eine VERALTETE (>60s)
        // wird geloescht, der Versuch laeuft durch. -----
        {
            const protokollPfadB2 = path.join(klon, 'protokoll-punkt-b2.md');
            fs.writeFileSync(protokollPfadB2, protokollFixtureInhalt);
            const vorherB2 = fs.readFileSync(protokollPfadB2, 'utf8');
            const sperrPfadB2 = `${protokollPfadB2}.lock`;

            fs.writeFileSync(sperrPfadB2, ''); // frische Sperrdatei
            const startB2a = Date.now();
            const ergebnisB2a = laufprotokollEinfuegen(protokollPfadB2, '| Zeile, die NICHT ankommen darf (b2a) |');
            const dauerB2a = Date.now() - startB2a;
            const nachherB2a = fs.readFileSync(protokollPfadB2, 'utf8');
            fs.rmSync(sperrPfadB2, { force: true }); // fuer b2b aufraeumen

            pruefen(`PUNKT B2A SPERRE FRISCH (50) (eine VORHANDENE, frische Sperrdatei blockiert: {ok:false}, Zieldatei UNANGETASTET, Meldung nennt "gesperrt", ${dauerB2a} ms gewartet)`,
                ergebnisB2a.ok === false
                && /gesperrt/i.test(ergebnisB2a.grund || '')
                && nachherB2a === vorherB2);

            fs.writeFileSync(sperrPfadB2, ''); // erneut anlegen, diesmal 61s "alt"
            const alt = new Date(Date.now() - 61 * 1000);
            fs.utimesSync(sperrPfadB2, alt, alt);
            const ergebnisB2b = laufprotokollEinfuegen(protokollPfadB2, '| Zeile, die ankommen MUSS (b2b) |');
            const nachherB2b = fs.readFileSync(protokollPfadB2, 'utf8');

            pruefen(`PUNKT B2B SPERRE VERALTET (51) (eine 61s ALTE Sperrdatei wird geloescht, der Versuch laeuft durch: ok=${ergebnisB2b.ok}, Zeile angekommen=${nachherB2b.includes('Zeile, die ankommen MUSS (b2b)')}, Sperre danach freigegeben=${!fs.existsSync(sperrPfadB2)})`,
                ergebnisB2b.ok === true
                && nachherB2b.includes('Zeile, die ankommen MUSS (b2b)')
                && !fs.existsSync(sperrPfadB2));
        }

        // ----- PUNKT C1: Datei mit ZWEI Marken -- nichts geschrieben,
        // Meldung nennt die Zahl. -----
        {
            const zweiMarkenInhalt = `${protokollFixtureInhalt}\n<!-- NEUE-LAUFZEILE-HIER: zweites Vorkommen, absichtlich fuer den Test -->\n`;
            const protokollPfadC1 = path.join(klon, 'protokoll-punkt-c1.md');
            fs.writeFileSync(protokollPfadC1, zweiMarkenInhalt);
            const ergebnisC1 = laufprotokollEinfuegen(protokollPfadC1, '| Zeile, die NICHT ankommen darf (c1) |');
            const nachherC1 = fs.readFileSync(protokollPfadC1, 'utf8');
            pruefen(`PUNKT C1 MEHRDEUTIG (52) (Datei mit ZWEI Marken: nichts geschrieben, Meldung nennt die Zahl 2, Datei unveraendert: "${ergebnisC1.grund}")`,
                ergebnisC1.ok === false
                && /2-mal/.test(ergebnisC1.grund || '')
                && nachherC1 === zweiMarkenInhalt);
        }

        // ----- PUNKT C2: Marke mitten in einer Zeile -- nichts
        // geschrieben. -----
        {
            const markeMittenInhalt = protokollFixtureInhalt.replace(LAUFPROTOKOLL_MARKE, `xxx${LAUFPROTOKOLL_MARKE}`);
            const protokollPfadC2 = path.join(klon, 'protokoll-punkt-c2.md');
            fs.writeFileSync(protokollPfadC2, markeMittenInhalt);
            const ergebnisC2 = laufprotokollEinfuegen(protokollPfadC2, '| Zeile, die NICHT ankommen darf (c2) |');
            const nachherC2 = fs.readFileSync(protokollPfadC2, 'utf8');
            pruefen(`PUNKT C2 NICHT ZEILENANFANG (53) (Marke mitten in einer Zeile: nichts geschrieben, Datei unveraendert: "${ergebnisC2.grund}")`,
                ergebnisC2.ok === false
                && /Zeilenanfang/.test(ergebnisC2.grund || '')
                && nachherC2 === markeMittenInhalt);
        }

        // ----- PUNKT C3: --zweck mit der Markenzeichenfolge -- die
        // geschriebene Zeile enthaelt "&lt;!--" statt der rohen
        // Zeichenfolge, UND ein ZWEITER Lauf danach fuegt immer noch an der
        // richtigen (echten) Stelle ein -- das ist der eigentliche Beweis,
        // dass die eingeschleuste Zeichenfolge NICHT als neue Marke
        // durchgeht. -----
        {
            const protokollPfadC3 = path.join(klon, 'protokoll-punkt-c3.md');
            fs.writeFileSync(protokollPfadC3, protokollFixtureInhalt);

            const zweckMitMarke = `Boesartig ${LAUFPROTOKOLL_MARKE} Einschleusung`;
            const { code: codeC3a } = await protokolliertenLaufAusfuehren(protokollPfadC3, [`--zweck=${zweckMitMarke}`]);
            const nachErstemLaufC3 = fs.readFileSync(protokollPfadC3, 'utf8');
            const geschriebeneZeileC3 = zeileUnmittelbarUeberMarke(nachErstemLaufC3);

            const { code: codeC3b } = await protokolliertenLaufAusfuehren(protokollPfadC3, ['--zweck=Zweiter regulaerer Lauf']);
            const nachZweitemLaufC3 = fs.readFileSync(protokollPfadC3, 'utf8');
            const zeileZweiterLaufC3 = zeileUnmittelbarUeberMarke(nachZweitemLaufC3);
            const zusatzZeilenC3 = nachZweitemLaufC3.split('\n').length - protokollFixtureInhalt.split('\n').length;

            pruefen(`PUNKT C3 MARKE-EINSCHLEUSUNG UEBER --zweck (54) (die geschriebene Zeile enthaelt "&lt;!--" statt der rohen Zeichenfolge: "${geschriebeneZeileC3}")`,
                codeC3a === 0
                && typeof geschriebeneZeileC3 === 'string'
                && geschriebeneZeileC3.includes('&lt;!-- NEUE-LAUFZEILE-HIER:')
                && !geschriebeneZeileC3.includes('<!-- NEUE-LAUFZEILE-HIER:'));
            pruefen(`PUNKT C3 ZWEITER LAUF FUEGT WEITERHIN RICHTIG EIN (55) (der eigentliche Beweis: ein ZWEITER Lauf danach findet die ECHTE Marke immer noch unverfaelscht und fuegt WIEDER genau eine Zeile darueber ein, macht insgesamt 2 zusaetzliche Zeilen: "${zeileZweiterLaufC3}")`,
                codeC3b === 0
                && zusatzZeilenC3 === 2
                && typeof zeileZweiterLaufC3 === 'string'
                && zeileZweiterLaufC3.includes('Zweiter regulaerer Lauf'));
        }

        // ----- PUNKT D: ein ALLEINSTEHENDES "\r" (kein "\r\n") in --zweck
        // darf nicht stehenbleiben -- gemessen an der geschriebenen Zeile
        // selbst, nicht an split('\n').length (das zaehlt ein rohes "\r"
        // ohnehin nicht als Zeilenumbruch; Markdown-Renderer tun es aber
        // sehr wohl). -----
        {
            const protokollPfadD = path.join(klon, 'protokoll-punkt-d.md');
            fs.writeFileSync(protokollPfadD, protokollFixtureInhalt);
            const { code: codeD2 } = await protokolliertenLaufAusfuehren(protokollPfadD, ['--zweck=Teil A\rTeil B']);
            const nachherD = fs.readFileSync(protokollPfadD, 'utf8');
            const geschriebeneZeileD = zeileUnmittelbarUeberMarke(nachherD);
            pruefen(`PUNKT D ALLEINSTEHENDES CR (56) (ein alleinstehendes "\\r" in --zweck bleibt NICHT stehen -- die Zeile enthaelt "Teil A Teil B" als EINEN zusammenhaengenden Text ohne rohes CR: "${geschriebeneZeileD}")`,
                codeD2 === 0
                && typeof geschriebeneZeileD === 'string'
                && geschriebeneZeileD.includes('Teil A Teil B')
                && !geschriebeneZeileD.includes('\r'));
        }

        // ----- PUNKT E.2: die ECHTE ASTRA-LAEUFE.md (NUR gelesen, niemals
        // geschrieben) enthaelt die AKTUELLE LAUFPROTOKOLL_MARKE-Konstante
        // GENAU EINMAL und am Zeilenanfang -- das bindet die Konstante an
        // die Wirklichkeit: der Vergleich laeuft gegen unabhaengige,
        // externe Daten (die echte Datei), nicht gegen eine aus derselben
        // Konstante gebaute Fixture. Verwendet den ganz am Kopf von
        // selbsttest() gezogenen Schnappschuss -- KEIN zweiter Lesezugriff
        // auf die echte Datei. -----
        {
            const inhaltEcht = echtesProtokollVorher;
            let vorkommenGesamt = 0;
            let amZeilenanfang = false;
            if (typeof inhaltEcht === 'string') {
                for (let ab = 0; ; ) {
                    const treffer = inhaltEcht.indexOf(LAUFPROTOKOLL_MARKE, ab);
                    if (treffer === -1) break;
                    vorkommenGesamt++;
                    if (treffer === 0 || inhaltEcht[treffer - 1] === '\n') amZeilenanfang = true;
                    ab = treffer + LAUFPROTOKOLL_MARKE.length;
                }
            }
            pruefen(`WIRKLICHKEIT: LAUFPROTOKOLL_MARKE in der echten ASTRA-LAEUFE.md (57) (NUR gelesen, niemals geschrieben; die aktuelle Konstante kommt darin GENAU EINMAL und am Zeilenanfang vor: ${vorkommenGesamt} Vorkommen)`,
                typeof inhaltEcht === 'string' && vorkommenGesamt === 1 && amZeilenanfang);
        }

        // ----- PUNKT E.3: laufprotokollPfad() OHNE ASTRA_LAUFPROTOKOLL
        // trifft die ECHTE Datei -- ueber module.exports/require(__filename)
        // geholt (s. Exportkommentar am Dateiende), NICHT denselben
        // path.join-Ausdruck nachgebaut: unabhaengige Belege (Verzeichnis
        // enthaelt auch CLAUDE.md und .github) statt derselben Formel.
        // Schreibt NICHTS. ACHTUNG: der Selbsttest biegt ASTRA_LAUFPROTOKOLL
        // fuer seine gesamte Laufzeit global um (s. SICHERHEITSNETZ oben) --
        // fuer DIESEN einen Fall wird die Variable deshalb voruebergehend
        // entfernt und danach zuverlaessig wiederhergestellt. -----
        {
            const alteUmgebungStandardpfad = process.env.ASTRA_LAUFPROTOKOLL;
            delete process.env.ASTRA_LAUFPROTOKOLL;
            let ermittelterPfad;
            try {
                ermittelterPfad = require(__filename).laufprotokollPfad();
            } finally {
                if (alteUmgebungStandardpfad !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteUmgebungStandardpfad;
                else delete process.env.ASTRA_LAUFPROTOKOLL;
            }
            const verzeichnisStandardpfad = path.dirname(ermittelterPfad);
            pruefen(`STANDARDPFAD OHNE ASTRA_LAUFPROTOKOLL (58) (trifft die echte Datei -- unabhaengige Belege statt desselben path.join-Ausdrucks: existiert, Basisname ASTRA-LAEUFE.md, Verzeichnis enthaelt auch CLAUDE.md und .github: ${ermittelterPfad})`,
                fs.existsSync(ermittelterPfad)
                && path.basename(ermittelterPfad) === 'ASTRA-LAEUFE.md'
                && fs.existsSync(path.join(verzeichnisStandardpfad, 'CLAUDE.md'))
                && fs.existsSync(path.join(verzeichnisStandardpfad, '.github')));
        }

        // ----- FALL 6: --selbsttest selbst schreibt KEINE Zeile in die
        // ECHTE ASTRA-LAEUFE.md -- gemessen ueber den gesamten bisherigen
        // Selbsttest-Lauf (LAUF A/B/C/D, DIFF-RIEGEL 31 und die Faelle 1-8
        // oben erreichen zusammen Exit 0 UND Exit 3, beides eigentlich
        // protokollpflichtig) -----
        {
            let echtesProtokollNachher = null;
            try { echtesProtokollNachher = fs.readFileSync(echteProtokollDatei, 'utf8'); } catch (e) { /* bleibt null */ }
            // Punkt F (Nacharbeit 13.09.2026): war schon der VORHER-
            // Schnappschuss nicht lesbar (echtesProtokollVorher === null),
            // ist "nachher === vorher" ein "null === null" -- GRUEN, obwohl
            // die Schutzwirkung nie gemessen wurde ("leeres Ergebnis ist
            // nicht sauberes Ergebnis"). Ein nicht messbarer Schutz ist kein
            // bestandener Schutz -- dieser Fall wird dann ROT, statt sich
            // zufaellig als bestanden auszugeben.
            if (echtesProtokollVorher === null) {
                pruefen('LAUF-PROTOKOLL FALL 6 (58) (Schnappschuss der echten Datei nicht lesbar -- die Schutzwirkung wurde NICHT gemessen)', false);
            } else {
                pruefen('LAUF-PROTOKOLL FALL 6 (58) (die ECHTE ASTRA-LAEUFE.md ist durch den GESAMTEN --selbsttest-Lauf unveraendert geblieben, obwohl mehrere main()-Aufrufe darin Exit 0 und Exit 3 erreicht haben)',
                    echtesProtokollNachher === echtesProtokollVorher);
            }
        }
    } catch (e) {
        console.log(`  ✗ FEHLT: unerwarteter Fehler im Selbsttest: ${e.message}`);
        fehler++;
    } finally {
        fs.rmSync(klon, { recursive: true, force: true });
        if (alteProtokollUmgebungGesamt !== undefined) process.env.ASTRA_LAUFPROTOKOLL = alteProtokollUmgebungGesamt;
        else delete process.env.ASTRA_LAUFPROTOKOLL;
    }

    if (gelaufen !== ERWARTETE_FAELLE) {
        console.log(`  ✗ FEHLT: ${gelaufen} Faelle gelaufen, erwartet ${ERWARTETE_FAELLE} — Fall entfernt oder Abbruch mittendrin?`);
        fehler++;
    }
    console.log(fehler ? `\n${fehler} Fehler` : '\nSelbsttest sauber');
    return fehler ? 1 : 0;
}

// Punkt E.3 (Nacharbeit 13.09.2026): NUR fuer den Selbsttest -- der
// Standardpfad-Fall unten braucht Zugriff auf laufprotokollPfad(), OHNE
// denselben path.join()-Ausdruck einfach nachzubauen (das wuerde nur die
// Funktion gegen sich selbst pruefen). require(__filename) fuehrt main()
// dabei NICHT ein zweites Mal aus: Node cached ein Modul, das bereits als
// Einstiegspunkt lief, unter seinem aufgeloesten Pfad -- ein erneutes
// require() darunter liefert nur den gecachten module.exports zurueck, ohne
// den Dateikopf (und damit main()) erneut auszufuehren. Exportiert wird
// AUSSCHLIESSLICH, was der Selbsttest braucht -- keine Werkzeuge, kein
// main() selbst.
module.exports = { laufprotokollPfad, laufprotokollZelle, laufprotokollEinfuegen };

main().then((code) => { process.exitCode = code; }).catch((fehler) => {
    console.error('FEHLER:', fehler.message);
    process.exitCode = 1;
});
