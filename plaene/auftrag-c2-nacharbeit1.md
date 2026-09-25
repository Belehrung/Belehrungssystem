# Auftrag C2 Nacharbeit 1 (25.09.2026)

Grundlage: `plaene/diffpruefung-c2.md` (C2-1 bis C2-20). Zweig `fix-c2-stille-fehler`, Kopf `0182cf3`. Mess-Skripte der
Prüfspur: `/tmp/claude-0/-home-user-Belehrungssystem/c200d6d7-f0a2-5a02-8fb8-a4f662e3a700/scratchpad/c2cc/` (m1–m7,
`mut.js`) — vorher/nachher gegen deinen Stand laufen lassen, wörtlich melden (eigene DB, nie `gymdocu_test`).

Bauen: C2-1 (atomar veröffentlichen — Temp-Datei im selben Verzeichnis, registrieren, `rename`; bei Ablehnung
Quarantäne-Name, der weder im Verlauf noch über `/pdf` erscheint und nichts löscht; alle zehn `finalize`-Wege; Test:
Wartung mit Registrierungsstörung → Verlauf zeigt den Knopf „PDF erstellen“, `/pdf` → 404, Datei unter Quarantäne-Name
vorhanden), C2-2 (Archiv-Meldung), C2-3, C2-4, C2-5, C2-6 (Signatur bei fehlender Route um die Quelle ergänzen; vorher
alle `melde`-Aufrufer ohne `req` zählen und die Drossel-Wirkung für sie messen), C2-7 (Entdoppeln je Studio, Editor
zeigt „Konfiguration unlesbar“; PDF-Hinweis NICHT), C2-8, C2-9, C2-11, C2-12, C2-13, C2-14 (Kontrast mit
`kontrast.js` rechnen und melden), C2-15, C2-16, C2-17.

Nicht bauen (Sammelliste): C2-10, C2-18, C2-19, C2-20, PDF-Hinweis aus C2-7.

Zustandsfrage für den Bericht: welcher Zustand entsteht durch die Nacharbeit, den es vorher nicht gab — besonders: was
passiert mit einer Quarantäne-Datei auf Dauer, und kann ein `rename` eine vorhandene gültige Datei ersetzen, deren Code
danach nicht mehr passt?

-- Ende des Auftrags --
