# Diffprüfung D (Deploy-SSH) — 30.09.2026

Stand `2ba8067` (nach Nacharbeit 1: Kanarienwert ohne PEM-Rahmen — der erste Lesespur-Lauf brach am Geheimnis-Riegel
ab, nichts gesendet —, `continue-on-error` bewacht). Lesespur `deepseek-flash` (`scratchpad/dpruef/antwort2.txt`,
0,47 $), eigene Lesung des Workflow-Schritts und des Wächter-Diffs, beide Tests selbst gefahren (190/0, 20/0), 59
Mutationen und Messung gegen einen lokalen sshd durch den Bauer. Eine eigene ausführende Claude-Spur entfällt: der Bauer
hat den run:-Text gegen einen echten sshd gefahren und 59 Mutationen gemessen; die Lesespur fand nichts Blockierendes.

| Nr | Befund | Nachgemessen | Entscheidung |
|---|---|---|---|
| D-B1/B2 | Wiederholliste trifft auch Nach-Sitzungs-Meldungen (`client_loop: … Connection reset by peer`) — RST nach `exec` vor dem ersten Byte ⇒ zweiter Anstoß | trägt (Formen gemessen: Vor-Sitzung am Zeilenanfang, nach der Sitzung `client_loop:`/`Connection to …`) | Nacharbeit 2: Muster verankern + Fälle |
| D-B3 | Grün = irgendein stdout-Byte, kein Erfolgsmerkmal | trägt (`ops/deploy.sh:497/499` Abschlusszeile vorhanden) | Nacharbeit 2 |
| D-B4 | `-t ecdsa` unbewacht | trägt | Nacharbeit 2 |
| D-B5 | zwei Wächter-Zeilen dominiert | trägt, harmlos | belassen |
| D-B6 | Fenster Freigabe-Ref → Auslieferung bis ~6 min, Cron kann dazwischen ausliefern | trägt (`flock -n` verhindert Überlappung) | Kommentar |
| D-B7 | Untergrenze `>= 10` = genau ci.yml | trägt, Fehlalarm wäre laut | Sammelliste |
| D-B8 | keyscan-stderr verworfen | trägt | Nacharbeit 2 |
| D-B9 | Formatprüfung des eigenen Literals | trägt, gewollt | — |

-- Ende --
