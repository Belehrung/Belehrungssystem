# Planprüfung QR-J Nacharbeit 7 (30.09.2026)

## Runde 1 (Fassung 1, zwei Spuren `deepseek-flash`, `scratchpad/qrjn7p/antwort-{a,b}.txt`, 1,04 $ + 0,60 $)

Selbst nachgemessen (Stichproben am Code, Rest über die zitierten Zeilen):
- A-B1 (blockierend, trägt): Kandidat auf S verengen gibt T frei; ein Bruchstück widerlegt nichts (`korrekturenIn` nur
  `typ:'korrektur'`, `core/qr-verbrauch.js:569`) → Fassung 2: Kandidat bleibt alle, S wird BENANNT.
- A-B2/B3, B-§1 (trägt): 3–4-Byte- und 1–2-Byte-Risse → Sackgasse bzw. `--keine-aufkleber`-Loch → Fassung 2 §1.3
  (unlesbarer Typ, `--art-laut-meldung`).
- B-1 (blockierend, trägt): Untergrenze × Blockregel (c) ohne Ausweg (`tools/qr-journal.js:788-798, 820-821`) →
  Fassung 2 §1.2 benannter Weg + Fuzz.
- A-Frage-3/B-4 (trägt): (d) verlangt für `nr_von` Gleichheit, nicht Mindestwert (`:820`); Komma-Lücke; Anker am
  Korrektur-Layout statt `kandidatenAus` (`:385-392`) → §1.2.
- A-B5/B-§2 (trägt): `pruefeVerwerfen` ohne `erledigungenStand` (`:1157`), kein Hook in `befehlVerwerfen`, Gegenprobe
  von (v) maskiert → §2. B: Korrigieren-Frischprüfung erhebt (c/d/e) nicht neu → §2 zweiter Punkt.
- A-B6/B-4 (trägt): §3-Test braucht widerlegtes Verwerfen (`:1089`) → §3.
- B-5.3/A-B7 (trägt): `--studio` fehlt auch `:1348`, `:565`, `:588` → §4.
- B-5.5 (trägt): R7-L5 nur in der Anzeige-Hilfe → §4. B-5.6: R7-L4 über `tragendeDeckungen`, symmetrische Stellen → §4.
- B-4 (trägt): B7/R7-L9 nur per Handzeile → als Verteidigung gekennzeichnet.
- A-1 (Anmerkung): `:2964/:2941` `geschrieben === false` bei Trockenlauf strukturell wahr — Sammelliste-Kandidat, nicht
  in N7.
