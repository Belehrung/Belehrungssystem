# Offene Befunde Teil W (ausführende Prüfspur)

Sammelliste nach CLAUDE.md „Eine benannte Grenze ist kein Endzustand“. Einzelheiten: `diffpruefung-w.md`.

| Nr | Punkt | Warum offen | Extrarunde |
|---|---|---|---|
| A-4 | unprivilegierte User-Namensräume im Kind (`unshare -r`) | `setpriv` 2.39.3 ohne seccomp, kein libseccomp; kein Ausbruch gezeigt | seccomp-Filter oder `kernel.unprivileged_userns_clone=0` im Lauf prüfen |
| A-1b | ganz `/etc` ro sichtbar | heute nichts Geheimes für 65534 lesbar (gemessen) | nur benötigte Dateien einbinden |
| S13 | `/var/lib/dsv1` bleibt leer und root-eigen stehen | harmlos, spart Neuanlage | beim letzten Aufräumen mitentfernen oder bewusst lassen |

-- Ende --
