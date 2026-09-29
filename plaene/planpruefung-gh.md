# Planprüfung GH Workflow-Härtung (30.09.2026, eine Spur `deepseek-flash`)

Rohbericht `scratchpad/ghp/antwort.txt`: 14 Befunde (1 blockierend, 6 sollte, 7 Anmerkungen). Stichproben selbst am
Code: `deploy.yml:51-53` (CI-Handstart liefert aus), Schrittfolge `:205` vor `:221`, `ERWARTETES_IF` exakt `:256-302`.
Eingearbeitet in Fassung 2: B1 (Handstart bleibt Auslöser), B2 (Aussage „nichts ausgeliefert“ berichtigt, Referenz von
aussen = erster Deploy), B3 (dito), B4 (kein `git ls-files` im Test), B5 (exakte Erweiterung), B6 (Kontrolllauf im
Git-Modus, Abdeckung), B7 (alle Kanäle), B8/B9/B11/B14 (Dependabot vorhanden, kein Deploy-Checkout, Registrierung,
Format-Wächter). B10/B12 betreffen das Bündel (Pläne nicht im GymDocu-Repo). B13 Anmerkung ohne Handlung. Keiner gefallen.
