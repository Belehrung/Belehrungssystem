# Auftrag C3a Nacharbeit 4 (26.09.2026)

Grundlage: Diffprüfung C3a Runde 4 (DeepSeek, Fundort des Haupt-Agenten bestätigt; `plaene/diffpruefung-c3a.md`).
Baum `/workspace/gymdocu-c3a`, Zweig `fix-c3a-datenintegritaet`, Kopf `e2f4cc7`. Eigene DB `gymdocu_c3an4_test`, nie
`gymdocu_test`, Sperrdatei nie anfassen. Einordnung: Standard. Früh committen und pushen.

## 1. Webhook-Upsert atomar (C3a4-1, blockierend)

`routes/webhooks.js#handleEmployeeUpsert` liest `vorh` (`aktiv`, `manuell_deaktiviert`) AUSSERHALB jeder Transaktion
(`:296-308`) und schreibt im Autocommit-Zweig (`:377-378`) `aktiv = aktivEffektiv` ohne Bedingung. Deaktiviert der
Admin (auditTx) dazwischen, entsteht `aktiv=1, manuell_deaktiviert=1` ohne Audit-Glied. Behebung: Lesen UND Schreiben des
bestehenden Mitarbeiters laufen in EINER `auditTx` (Studio-Lock zuerst, wie der Sync `routes/api.js:285`) — das
serialisiert gegen die Admin-Wege. Zusätzlich als zweiter Riegel im UPDATE: `aktiv = CASE WHEN manuell_deaktiviert = 1
THEN 0 ELSE $n END`. Pflichttest: der Zustand „Admin deaktiviert zwischen Lesen und Schreiben“ wird deterministisch
hergestellt (z. B. ein injizierbarer Haken zwischen den Schritten, oder das Kennzeichen direkt vor dem Aufruf per zweiter
Verbindung gesetzt, während der Webhook den alten Stand hätte) → danach `aktiv=0`, kein `mitarbeiter_reaktiviert`.
Gegenprobe: beide Riegel entfernt → ROT; nur einer entfernt → benennen, welcher Riegel dann fängt (zweite Ursache für
grün).

## 2. Sync-Kernfall belegt die Verarbeitung (C3a4-2)

`test_feature_manuell_deaktiviert_vorrang.js:156-160`: zusätzlich `body.aktualisiert === 1`, `fehler.length === 0` und
die Namensaktualisierung zusichern (die Route liefert auch bei gesammelten Fehlern 200, `routes/api.js:330-332`).
Positivkontrolle im Unterschrift-Test (`test_feature_belehrung_deaktivierte_unterschreiben_nicht.js`): der aktive
Mitarbeiter kommt tatsächlich weiter (literal), nicht nur „anderer Fehler“.

## 3. Benennen (Anmerkungen)

Kopfkommentar: der Sync serialisiert jetzt jeden Eintrag über den Studio-Lock (Durchsatz, bewusst); `pin_generation`
zählt bei jedem ACTIVE-Webhook für manuell Deaktivierte hoch (monoton, unschädlich) — oder vermeiden, wenn trivial.

Nach dem Bau: volle Suite (`SUITE_EXIT`), Dateizahl-Ritual, Lint, Gegenproben wörtlich. Kein PR.

-- Ende des Auftrags --
